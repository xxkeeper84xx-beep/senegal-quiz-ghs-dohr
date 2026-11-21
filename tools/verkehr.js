/* ================= Verkehr und Regeln: Ampeln, Polizei, E-Scooter-Tuning, Frau Costantino, Elternbrief =================
   - Ampeln (fahrzeuge/Ampel.json) an echten Kreuzungen rund um Schule, Rheydter Markt und Hauptbahnhof, mit Fußgängersignal.
     Rot für Autos = Grün für Fußgänger. Autos des Stadtverkehrs halten bei Rot.
   - Wer bei Rot über die Kreuzung geht oder fährt und von der Polizei oder einer Lehrkraft gesehen wird, zahlt ein Bußgeld
     (wie in Deutschland: zu Fuß 5, Fahrrad/E-Scooter 60, Motorrad/Auto 90). Ab dem zweiten Mal oder wenn eine Lehrkraft
     es sieht, bekommen die Eltern Bescheid: Elternbrief. Bis er erledigt ist, verkauft das Autohaus nichts.
     Erledigen: Verkehrsunterricht bei Frau Costantino (eine Pythagoras-Aufgabe zur Kreuzung).
   - Kalle tunt den E-Scooter (bis 40 km/h, erlaubt sind 20 km/h). Sieht eine Lehrkraft oder die Polizei den getunten Scooter
     schneller als 20 km/h, wird er einkassiert.
   - Polizeiautos (fahrzeuge/Polizeifahrzeug.json) fahren im Stadtverkehr mit, Blaulicht bei einer Kontrolle. */
const VK={amp:null,pol:null,X:[],cops:[],t:0,vis:0,cool:0,scootCool:0};
const isTeacherRole=r=>/lehrer/i.test(r||"");
function teacherSpots(){const o=[];for(const t of TALK)if(isTeacherRole(t.role))o.push({x:t.x,y:t.y,n:t.name});
  for(const q of QUESTS)if(isTeacherRole(q.giver.role))o.push({x:q.giver.x,y:q.giver.y,n:q.giver.name});return o}
function witness(x,y,rp,rt){for(const c of VK.cops){const n=c.n;if(n.x!==undefined&&Math.hypot(n.x-x,n.y-y)<rp)return {kind:"polizei",cop:c,n:"Die Polizei"}}
  for(const t of teacherSpots())if(Math.hypot(t.x-x,t.y-y)<rt)return {kind:"lehrer",n:t.n};return null}

/* ---------- Kreuzungen finden (echte Straßendaten) ---------- */
const MAJOR=/^(primary|secondary|tertiary)/,CARR=/^(primary|secondary|tertiary|residential|unclassified|living_street)/;
function findCrossings(){const N=MG.nodes,deg=new Map(),major=new Set(),wid=new Map(),nb=new Map();
  for(const r of MG.roads){if(!CARR.test(r.h)||r.tu)continue;const n=r.i.length;
    r.i.forEach((id,k)=>{const d=(k===0||k===n-1)?1:2;deg.set(id,(deg.get(id)||0)+d);if(MAJOR.test(r.h))major.add(id);wid.set(id,Math.max(wid.get(id)||0,r.w||6));
      const L=nb.get(id)||[];if(k>0)L.push([r.i[k-1],r.w||6]);if(k<n-1)L.push([r.i[k+1],r.w||6]);nb.set(id,L)})}
  const cand=[];for(const [id,d] of deg)if(d>=3&&major.has(id))cand.push({id,x:N[2*id],y:N[2*id+1],w:wid.get(id),nb:nb.get(id)});
  const O=MG.real.orte,targets=[[MG.start[0],MG.start[1],4],[-540,-805,3],[O.rheydt_hbf.x,O.rheydt_hbf.y,3],[O.haupthaus.x,O.haupthaus.y,2]],out=[];
  for(const [tx,ty,k] of targets){const s=cand.map(c=>[Math.hypot(c.x-tx,c.y-ty),c]).filter(e=>e[0]<700).sort((a,b)=>a[0]-b[0]);let n=0;
    for(const [,c] of s){if(n>=k)break;if(out.some(o=>Math.hypot(o.x-c.x,o.y-c.y)<70))continue;out.push(c);n++}}
  return out}

/* ---------- Fußgängersignal (Männchen) ---------- */
function pedTex(green){return canvasTex(64,96,(g)=>{g.fillStyle="#111";g.fillRect(0,0,64,96);g.fillStyle=green?"#39ff7a":"#ff2d2d";
  g.beginPath();g.arc(32,18,8,0,7);g.fill();if(green){g.fillRect(27,28,10,28);g.save();g.translate(32,56);g.rotate(.45);g.fillRect(-4,0,8,30);g.restore();g.save();g.translate(32,56);g.rotate(-.45);g.fillRect(-4,0,8,30);g.restore();g.save();g.translate(32,32);g.rotate(.9);g.fillRect(-3,0,6,20);g.restore()}
  else{g.fillRect(25,28,14,32);g.fillRect(25,58,6,30);g.fillRect(33,58,6,30);g.fillRect(19,30,6,26);g.fillRect(39,30,6,26)}})}
let PED_G=null,PED_R=null;
function buildLights(){const ampScene=VK.amp.scene,ab=new THREE.Box3().setFromObject(ampScene),ah=ab.getSize(new THREE.Vector3()).y;
  PED_G=pedTex(true);PED_R=pedTex(false);
  for(const c of findCrossings()){
    const mats={rot:null,gelb:null,gruen:null},X={x:c.x,y:c.y,r:c.w/2+2.2,off:Math.random()*24,group:new THREE.Group(),mats,ped:[]};
    const dirs=[];for(const [nid] of c.nb){const dx=MG.nodes[2*nid]-c.x,dy=MG.nodes[2*nid+1]-c.y,L=Math.hypot(dx,dy);if(L<1)continue;const a=Math.atan2(dy,dx);if(dirs.every(b=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))>.6))dirs.push(a)}
    for(const a of dirs.slice(0,4)){const dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx;     // Ampel rechts der Zufahrt (aus Sicht der ankommenden Autos)
      const x=c.x+dx*(X.r+1.2)-px*(c.w/2+1.3),y=c.y+dy*(X.r+1.2)-py*(c.w/2+1.3);
      const m=ampScene.clone(true);m.traverse(o=>{if(!o.isMesh)return;const n=o.material.name;o.castShadow=true;
        const key=/Rot/.test(n)?"rot":/Gelb/.test(n)?"gelb":/Gruen/.test(n)?"gruen":null;if(key){if(!mats[key]){mats[key]=o.material.clone();mats[key].userData.base=mats[key].color.clone()}o.material=mats[key]}});
      m.position.set(x,groundY(x,y),y);m.rotation.y=-a+Math.PI/2;      // Signale blicken den ankommenden Autos entgegen (+Z des Modells)
      X.group.add(m);
      const ped=new THREE.Mesh(new THREE.PlaneGeometry(.32,.48),new THREE.MeshBasicMaterial({map:PED_R,toneMapped:false}));   // Fußgängersignal quer zur Fahrbahn
      ped.position.set(x+px*.16,groundY(x,y)+Math.min(2.4,ah*.62),y+py*.16);ped.rotation.y=-a;X.group.add(ped);X.ped.push(ped);
      const ped2=ped.clone();ped2.position.set(x-px*.16,ped.position.y,y-py*.16);ped2.rotation.y=-a+Math.PI;X.group.add(ped2);X.ped.push(ped2)}
    X.dirs=dirs.slice(0,4);X.w=c.w;scene.add(X.group);VK.X.push(X)}}
function phase(X,t){const c=((t+X.off)%24+24)%24;return {car:c<11?"gruen":c<13?"gelb":"rot",ped:c>=14&&c<22}}
function updateLights(){const t=VK.t;for(const X of VK.X){const P=phase(X,t);
  for(const k of ["rot","gelb","gruen"]){const m=X.mats[k];if(!m)continue;const on=P.car===k;m.emissive=m.emissive||new THREE.Color();m.emissive.copy(on?m.userData.base:new THREE.Color(0));m.emissiveIntensity=on?2.2:0;m.color.copy(m.userData.base).multiplyScalar(on?1:.18)}
  for(const p of X.ped)p.material.map=P.ped?PED_G:PED_R}}

/* ---------- Polizeiautos im Stadtverkehr ---------- */
function makeCop(){const g=new THREE.Group(),body=new THREE.Group(),m=VK.pol.scene.clone(true);g.add(body);body.add(m);m.rotation.y=Math.PI/2;
  let lens=null;const wheels=[];m.traverse(o=>{if(o.isMesh){o.castShadow=true;if(/Blaulicht/i.test(o.material.name)){o.material=o.material.clone();lens=o.material;lens.userData.base=lens.color.clone()}}
    if(/^Rad_(Vorn|Hinten)_[LR]$/.test(o.name))wheels.push(o)});
  g.userData={body,carWheels:[],wr:1,lens,wheels};scene.add(g);return g}
function setupCops(){const list=npcs.filter(n=>!n.bike).slice(0,2);for(const n of list){const old=n.mesh;const g=makeCop();if(old){g.position.copy(old.position);g.rotation.copy(old.rotation);scene.remove(old)}n.mesh=g;n.police=true;n.sp=Math.min(n.sp||9,9);VK.cops.push({n,g,alarm:0})}}
function updateCops(dt){for(const c of VK.cops){const n=c.n,U=c.g.userData;c.alarm=Math.max(0,c.alarm-dt);
  for(const w of U.wheels)w.rotation.x+=(n.v||0)*dt/.33;
  if(U.lens){const on=c.alarm>0&&Math.floor(VK.t*6)%2===0;U.lens.emissive=U.lens.emissive||new THREE.Color();U.lens.emissive.set(on?0x2f6bff:0x000000);U.lens.emissiveIntensity=on?3:0}
  // Streife bleibt in der Nähe der Spielfigur
  if(n.x!==undefined&&Math.hypot(n.x-car.x,n.y-car.y)>420&&!V().fly){placeAgent(n,carEdges,car.x,car.y,90,260,true)}}}

/* ---------- Autos halten bei Rot ---------- */
{const base=stepNpc;stepNpc=function(n,dt){const s0=n.s,e0=n.e;base(n,dt);if(n.bike||!VK.X.length||n.x===undefined)return;
  const dx=Math.cos(n.ang),dy=Math.sin(n.ang);
  for(const X of VK.X){const rx=X.x-n.x,ry=X.y-n.y,f=rx*dx+ry*dy,s=Math.abs(-rx*dy+ry*dx);
    if(f>X.r-1&&f<X.r+9&&s<X.r+1&&phase(X,VK.t).car!=="gruen"){if(n.e===e0){n.s=s0}n.v=0;break}}}}

/* ---------- Bußgeld, Eltern, Elternbrief ---------- */
const FINE={walk:5,bike:60,scoot:60,moped:90};
const MAMA=["Wir haben gerade einen Anruf bekommen. Bei ROT über die Straße?! Darüber reden wir heute Abend. 😠",
  "Papa sagt: Rot ist rot. Auch in Mönchengladbach. Wir müssen reden.",
  "Schon wieder bei Rot? Ich bin enttäuscht. Frau Costantino erwartet dich zum Verkehrsunterricht."];
function redLight(X){const VH=V(),who=witness(car.x,car.y,70,35);
  if(!who){if(Math.random()<.6){toast("🚦 Puh, Glück gehabt","Niemand hat's gesehen. Bei Rot über die Kreuzung ist trotzdem gefährlich!","#ffc933")}
    else{finePlayer(VH,{kind:"nachbar",n:"Eine Nachbarin"},"hat dich gesehen und deine Eltern angerufen")}return}
  if(who.cop)who.cop.alarm=6;finePlayer(VH,who,who.kind==="polizei"?"hat dich angehalten":"hat dich gesehen")}
function finePlayer(VH,who,how){const fine=FINE[VH.id]||90,paid=Math.min(save.money,fine);save.money-=paid;save.redCount=(save.redCount||0)+1;
  const parents=who.kind!=="polizei"||save.redCount>=2||paid<fine;
  if(parents){save.elternbrief=true;setTimeout(()=>{if(typeof sms==="function")sms("Mama",MAMA[Math.min(MAMA.length-1,save.redCount-1)])},2600)}
  persist();updateHud();updateBrief();shake=.25;beep(330,.18,"square",.05);setTimeout(()=>beep(247,.3,"square",.05),180);
  missionBanner("bad","Bei Rot erwischt!",`${who.n} ${how} · ${paid} $ Bußgeld`,parents?"Deine Eltern wissen Bescheid: Elternbrief. Verkehrsunterricht bei Frau Costantino an der Schule.":"Rot heißt stehen bleiben – auch wenn gerade kein Auto kommt.")}
function updateBrief(){let el=document.getElementById("briefChip");if(!el){el=document.createElement("div");el.id="briefChip";el.className="hud";
  el.style.cssText="position:fixed;z-index:6;left:calc(14px + env(safe-area-inset-left,0px));top:calc(112px + env(safe-area-inset-top,0px));padding:6px 12px;border-radius:999px;background:rgba(22,11,40,.8);border:1px solid rgba(255,42,133,.5);color:#fff;font:700 13px Inter,Arial,sans-serif";document.body.appendChild(el)}
  el.hidden=!save.elternbrief||state.mode!=="play";el.textContent="✉️ Elternbrief offen · Frau Costantino"}
/* Verkehrsunterricht: Aufgabe zur Diagonale über die Kreuzung */
function costantinoTask(){const [a,b]=pick([[9,12],[12,16],[6,8],[15,20],[10,24]]);
  const t=tHyp({a,b,u:"m",n:["Breite","Länge","Diagonale"],pic:"🚦",x:{title:"Verkehrsunterricht bei Frau Costantino",
    story:`„Die Kreuzung ist <b>${a} m</b> breit und <b>${b} m</b> lang. Wer schräg hinüberläuft statt an der Ampel, ist viel länger auf der Fahrbahn – und ohne Schutz der Ampel.“`,q:"Wie lang ist der Weg schräg über die Kreuzung?"}});
  return Object.assign(t,{tag:"Elternbrief · Verkehrsunterricht",deliver:"Verstanden",hunt:"elternbrief",tries:0,solved:false,sel:[]})}
{const base=huntFound;huntFound=function(i){if(i!=="elternbrief")return base(i);save.elternbrief=false;save.xp+=15;persist();updateHud();updateBrief();
  missionBanner("ok","Elternbrief erledigt","Frau Costantino ist zufrieden","+15 XP · Das Autohaus verkauft dir wieder Fahrzeuge");
  setTimeout(()=>sms("Mama","Frau Costantino hat geschrieben, dass du alles verstanden hast. Gut so! 💛 Und ab jetzt: bei Rot stehen bleiben."),3000)}}
{const base=openMission;openMission=function(g){if(g&&g.id==="shop"&&save.elternbrief){toast("✉️ Erst den Elternbrief klären","Verkehrsunterricht bei Frau Costantino an der GHS Dohr","#ff2a85");return}return base(g)}}

/* ---------- E-Scooter-Tuning bei Kalle ---------- */
const TUNE_PRICE=80;
function scootGlow(){const g=vehMeshes.scoot;if(!g)return;if(!g.userData.glow){const grp=new THREE.Group(),neon=new THREE.MeshBasicMaterial({color:0x00f0ff,toneMapped:false});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(14,6),new THREE.MeshBasicMaterial({color:0x00f0ff,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(0,.25,0);grp.add(m);                                   // Lichtschein auf dem Boden
  for(const z of [-1.9,1.9]){const b=new THREE.Mesh(new THREE.BoxGeometry(9.5,.35,.25),neon);b.position.set(-.8,1.05,z);grp.add(b)}   // Neonleisten an beiden Seiten unter dem Trittbrett
  g.add(grp);g.userData.glow=grp}g.userData.glow.visible=!!save.scootTuned}
{const base=interactables;interactables=function(VH){const L=base(VH);const k=XG.find(g=>g.id==="kalle");
  if(k&&k.at&&save.owned.includes("scoot")&&!save.scootTuned)L.push({x:k.at[0],y:k.at[1],r:4,label:`🔧 E-Scooter tunen lassen (${TUNE_PRICE} $)`,act:()=>{
    if(save.money<TUNE_PRICE){toast("Zu wenig Geld",`Tuning kostet ${TUNE_PRICE} $`,"#ff5d6c");return}
    save.money-=TUNE_PRICE;save.scootTuned=true;persist();updateHud();scootGlow();jingle();
    missionBanner("ok","E-Scooter getunt!","Jetzt bis 40 km/h · Neonlicht unter dem Trittbrett","Erlaubt sind nur 20 km/h. Wenn dich Polizei oder Lehrkräfte erwischen, ist er weg!")}});
  const C=TALK.find(t=>t.name==="Frau Costantino");
  if(C&&save.elternbrief&&(VH.id==="walk"||VH.agile))L.push({x:C.x,y:C.y,r:3.4,label:"📝 Verkehrsunterricht bei Frau Costantino",act:()=>showTask(costantinoTask())});
  return L}}
function tunedCheck(dt){VK.scootCool-=dt;const VH=V();VEH.scoot.max=save.scootTuned?11.2:7.5;VEH.scoot.acc=save.scootTuned?7.5:5;
  if(VH.id!=="scoot"||!save.scootTuned||Math.abs(car.v)<6||VK.scootCool>0)return;
  const who=witness(car.x,car.y,40,24);if(!who)return;VK.scootCool=5;if(who.cop)who.cop.alarm=6;
  save.owned=save.owned.filter(id=>id!=="scoot");save.scootTuned=false;save.fines=(save.fines||0)+1;car.v=0;setVehicle("walk");persist();updateHud();scootGlow();shake=.4;
  missionBanner("bad","Einkassiert!",`🛴 ${who.n} hat deinen getunten E-Scooter kassiert`,"Getunt über 20 km/h ist verboten. Einen neuen gibt es im Autohaus.");
  if(who.kind==="polizei"){save.elternbrief=true;persist();updateBrief();setTimeout(()=>sms("Mama","Die POLIZEI hat angerufen! Ein getunter E-Scooter?! Das wird teuer. 😤"),2600)}
  else setTimeout(()=>sms(who.n,`Deinen getunten E-Scooter habe ich eingezogen. Sicherheit geht vor – auch nach der Schule. 🛑`),2600)}

/* ---------- Frau Costantino: Kontakt im Smartphone ---------- */
if(typeof CONTACTS!=="undefined"){CONTACTS.splice(6,0,{id:"costantino",name:"Frau Costantino",role:"Lehrerin · Verkehrsbeauftragte",icon:"🚦",col:"#ff2a85",known:true});CONTACTS.push({id:"mama",name:"Mama",role:"Familie",icon:"👪",col:"#ffb3c7",known:true})}
{const base=callLines;callLines=function(id){const N=pName();
  if(id==="costantino")return save.elternbrief?`Hallo ${N}! Ich habe von deinen Eltern gehört. Komm zu mir an den Eingang der Schule, wir machen kurz Verkehrsunterricht.`:`Hallo ${N}! Denk dran: An der Ampel wartest du auf Grün. Und schräg über die Kreuzung ist die längste Strecke – das kannst du mit Pythagoras ausrechnen!`;
  if(id==="mama")return save.elternbrief?`${N}, wir reden heute Abend. Und vorher gehst du zu Frau Costantino!`:`Hallo Schatz! Pass auf dich auf und sei pünktlich zum Abendessen. 😘`;
  return base(id)}}

/* ---------- Laden, Platzieren, Ablauf ---------- */
async function loadVerkehr(){if(!THREE.GLTFLoader)return;for(let k=0;k<900&&!(walker&&walker.userData.glbDone)&&!GLB.failed;k++)await new Promise(r=>setTimeout(r,100));
  const L=new THREE.GLTFLoader();
  try{VK.amp=await L.loadAsync("fahrzeuge/Ampel.json");buildLights();updateLights()}catch(e){console.info("Ampeln nicht geladen",e);GLB.err=GLB.err||"Ampel: "+(e&&e.message)}
  try{VK.pol=await L.loadAsync("fahrzeuge/Polizeifahrzeug.json");setupCops()}catch(e){console.info("Polizeiauto nicht geladen",e)}}
{const base=initGlbCrowd;initGlbCrowd=function(){loadVerkehr();return base()}}
{const base=update;update=function(dt){base(dt);if(state.mode!=="play")return;VK.t+=dt;VK.cool-=dt;tunedCheck(dt);
  if(VK.X.length&&VK.cool<=0){const VH=V();if(!VH.fly){const i=gi(car.x,car.y),road=i>=0&&(surf[i]&4);
    for(const X of VK.X){if(Math.hypot(X.x-car.x,X.y-car.y)>X.r||!road)continue;const P=phase(X,VK.t);
      const red=VH.id==="walk"?!P.ped:(P.car==="rot"&&Math.abs(car.v)>1.5);if(red){VK.cool=15;redLight(X)}break}}}}}
{const base=updateCamera;updateCamera=function(dt,VH){if(state.mode!=="play")VK.t+=dt;updateLights();updateCops(dt);
  VK.vis-=dt;if(VK.vis<=0){VK.vis=.5;for(const X of VK.X)X.group.visible=Math.hypot(X.x-car.x,X.y-car.y)<240}
  if(save.scootTuned)scootGlow();updateBrief();base(dt,VH)}}

/* ---------- Martinshorn: gelieferte Aufnahme (sounds/martinshorn.wav) als Endlosschleife, solange ein Streifenwagen Blaulicht hat;
   lauter, je näher er ist. Die Datei wird per fetch() geladen (auf der veröffentlichten Seite erlaubt) und mit Web Audio abgespielt.
   Klappt das Laden nicht, ertönt ein erzeugtes „Tatü-tata“ (a′ und d″ im Wechsel). ---------- */
const SIREN={buf:null,loading:false,src:null,g:null,o:null};
async function sirenLoad(){if(SIREN.buf||SIREN.loading)return;SIREN.loading=true;
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const r=await fetch("sounds/martinshorn.wav");const ab=await r.arrayBuffer();
    SIREN.buf=await new Promise((ok,no)=>{const p=actx.decodeAudioData(ab,ok,no);if(p&&p.then)p.then(ok,no)})}catch(e){console.info("Martinshorn nicht geladen",e);SIREN.buf=false}}
function sirenStop(){if(!SIREN.g)return;const t=actx.currentTime;SIREN.g.gain.setTargetAtTime(0,t,.08);const n=SIREN.src||SIREN.o;try{n.stop(t+.4)}catch(e){}SIREN.src=SIREN.o=SIREN.g=null}
function sirenUpdate(){let d=1e9;for(const c of VK.cops)if(c.alarm>0&&c.n.x!==undefined)d=Math.min(d,Math.hypot(c.n.x-car.x,c.n.y-car.y));
  const want=d<170&&state.mode==="play";
  try{if(!want){sirenStop();return}
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();
    if(SIREN.buf===null){sirenLoad();return}
    const t=actx.currentTime;
    if(!SIREN.g){const g=actx.createGain();g.gain.value=0;g.connect(actx.destination);SIREN.g=g;
      if(SIREN.buf){const src=actx.createBufferSource();src.buffer=SIREN.buf;src.loop=true;src.connect(g);src.start();SIREN.src=src}
      else{const o=actx.createOscillator(),f=actx.createBiquadFilter();o.type="sawtooth";f.type="lowpass";f.frequency.value=1800;o.connect(f);f.connect(g);o.start();SIREN.o=o}}
    if(SIREN.o)SIREN.o.frequency.setTargetAtTime(Math.floor(t/.62)%2?587:440,t,.012);
    SIREN.g.gain.setTargetAtTime((SIREN.src?.55:.075)*Math.pow(1-d/170,1.4),t,.06)}catch(e){}}
setTimeout(sirenLoad,8000);   // früh vorladen, damit die Sirene beim ersten Einsatz sofort da ist
{const base=updateCamera;updateCamera=function(dt,VH){sirenUpdate();base(dt,VH)}}
