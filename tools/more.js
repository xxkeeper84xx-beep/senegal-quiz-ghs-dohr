/* ================= Charaktere, Smartphone, Duo-Missionen ================= */
const ms=()=>{xs();save.msgs=save.msgs||[];save.chars=save.chars||[];save.contacts=save.contacts||[];save.char=save.char||"self";save.duoDone=save.duoDone||0;return save};

/* ---- Freischaltbare Charaktere ---- */
const CHARS={
  self:{icon:"🙂",name:"Du selbst",desc:"Deine eigene Figur aus dem Startmenü.",need:()=>true,how:""},
  sport:{icon:"🏃",name:"Sportass",look:{jacket:"#1f8a4c",jeans:"#f2f2f2",bagCol:"#ffffff"},head:"band",bandCol:"#ffffff",need:()=>!!(save.jobs&&save.jobs.sprint&&save.jobs.sprint.done),how:"Schaffe den Sprint von Herrn Maaß."},
  koch:{icon:"👨‍🍳",name:"Backstuben-Profi",look:{jacket:"#f4f4f4",jeans:"#3a3a3a",bagCol:"#b5793a"},head:"chef",need:()=>!!(save.jobs&&save.jobs.bread&&save.jobs.bread.done),how:"Hilf Bäcker Hennes in der Innenstadt."},
  feuer:{icon:"🧑‍🚒",name:"Feuerwehr-Azubi",look:{jacket:"#1b2a4a",jeans:"#1b2a4a",bagCol:"#d81e2c"},head:"helmet",need:()=>save.delivered>=5,how:"Schaffe 5 Kurier-Lieferungen."},
  hausm:{icon:"🧰",name:"Hausmeister-Azubi",look:{jacket:"#2b5ea8",jeans:"#2b5ea8",bagCol:"#55606e"},head:"bluecap",need:()=>qsx("werkhof").done,how:"Löse die Hauptmission von Herrn Ballhorn am Werkhof."},
  detektiv:{icon:"🕵️",name:"Detektiv",look:{jacket:"#b8956a",jeans:"#4a3a2a",bagCol:"#6b4226"},head:"hat",need:()=>(save.ducks||[]).length>=3,how:"Finde 3 Quietscheentchen."},
  kapitaen:{icon:"🤝",name:"Teamkapitän",look:{jacket:"#e8742a",jeans:"#1f2633",bagCol:"#1f2633"},head:"band",bandCol:"#1f2633",need:()=>save.duoDone>=1,how:"Schaffe eine Duo-Mission zu zweit."},
  astro:{icon:"🧑‍🚀",name:"Astronaut",look:{jacket:"#e9ecef",jeans:"#e9ecef",bagCol:"#c0c6cc"},head:"space",need:()=>(save.secrets||[]).includes("ufo"),how:"Finde das Geheimnis über dem Mülforter Bruch."},
  pyth:{icon:"🏛️",name:"Pythagoras von Samos",look:{jacket:"#f3efe2",jeans:"#f3efe2",bagCol:"#c9a23a"},head:"laurel",need:()=>mainIdx()>=MAIN.length,how:"Schaffe alle Hauptmissionen."},
};
const charOk=id=>id==="self"||ms().chars.includes(id);
function charLook(){const C=CHARS[save.char];const base=Object.assign({},LOOK_DEF,(PROF&&PROF.look)||{});return C&&C.look?Object.assign(base,C.look):base}
{const base=applyLook;applyLook=function(l){if(!l&&save&&save.char&&save.char!=="self"&&CHARS[save.char])l=charLook();base(l)}}
function addCharHead(hu){const C=CHARS[save.char];if(!C||!C.head||!hu)return;const h=hu.userData.h,acc=hu.userData.acc;
  const add=(geo,m,x,y,z,p=h.head)=>{const k=new THREE.Mesh(geo,m);k.position.set(x,y,z);k.castShadow=true;p.add(k);acc.push(k);return k};
  if(C.head==="band"){const b=add(new THREE.TorusGeometry(.104,.016,6,20),xmat(C.bandCol),-.005,.05,0);b.rotation.x=Math.PI/2}
  if(C.head==="chef"){add(new THREE.CylinderGeometry(.1,.1,.12,16),xmat("#ffffff"),-.01,.12,0);add(new THREE.SphereGeometry(.13,14,10),xmat("#ffffff"),-.01,.22,0).scale.set(1,.7,1)}
  if(C.head==="helmet"){add(new THREE.SphereGeometry(.125,16,10,0,Math.PI*2,0,Math.PI*.55),xmat("#d81e2c"),-.005,.03,0);add(new THREE.CylinderGeometry(.15,.15,.012,18),xmat("#b0141e"),-.005,.035,0);add(new THREE.BoxGeometry(.03,.04,.06),xmat("#f2c230"),.115,.09,0)}
  if(C.head==="bluecap"){add(new THREE.SphereGeometry(.115,16,10,0,Math.PI*2,0,Math.PI*.5),xmat("#2b5ea8"),-.005,.035,0).scale.set(1,.85,1);add(new THREE.BoxGeometry(.13,.012,.17),xmat("#1d4380"),.1,.04,0)}
  if(C.head==="hat"){add(new THREE.CylinderGeometry(.09,.1,.1,16),xmat("#5a3e22"),-.005,.12,0);add(new THREE.CylinderGeometry(.17,.17,.012,20),xmat("#4a321b"),-.005,.075,0);add(new THREE.CylinderGeometry(.101,.101,.025,16),xmat("#1b1b1b"),-.005,.09,0)}
  if(C.head==="space"){const g=add(new THREE.SphereGeometry(.17,18,14),new THREE.MeshLambertMaterial({color:0xbfe9ff,transparent:true,opacity:.5,depthWrite:false}),.0,.0,0);g.castShadow=false;add(new THREE.TorusGeometry(.15,.025,8,20),xmat("#c0c6cc"),-.01,-.13,0).rotation.x=Math.PI/2}
  if(C.head==="laurel"){const w=add(new THREE.TorusGeometry(.105,.018,6,20),xmat("#5f8a2e"),-.005,.06,0);w.rotation.x=Math.PI/2;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;add(new THREE.SphereGeometry(.022,6,4),xmat("#7aa83a"),-.005+Math.cos(a)*.108,.075,Math.sin(a)*.108).scale.set(1,.5,1.6)}
    const bd=add(new THREE.SphereGeometry(.075,12,8),xmat("#b8b8b0"),.06,-.08,0);bd.scale.set(.8,1.1,1.1)}}
{const base=dressHuman;dressHuman=function(hu,rider){const C=CHARS[save.char],hide=C&&C.head&&save.eq&&save.eq.cap;if(hide)save.eq.cap=false;base(hu,rider);if(hide)save.eq.cap=true;addCharHead(hu)}}
function setChar(id){if(!charOk(id))return;save.char=id;persist();if(walker)walker.userData.lookKey=null;applyLook()}
function checkUnlocks(){ms();for(const id in CHARS){if(id==="self"||save.chars.includes(id))continue;let ok=false;try{ok=CHARS[id].need()}catch(e){}
  if(ok){save.chars.push(id);persist();const C=CHARS[id];missionBanner("ok","Neuer Charakter",`${C.icon} ${C.name}`,"Im 📱 Handy unter „Charaktere“ anziehen");sms("Mats",`Krass, ${pName()}! Du kannst jetzt als ${C.name} rumlaufen. Schau mal im Handy unter Charaktere 😎`);break}}}

/* ---- Smartphone ---- */
const CONTACTS=[
  {id:"mats",name:"Mats",role:"Mitschüler, 9c",icon:"🧢",col:"#3fd8ff",known:true},
  {id:"ditt",name:"Herr Dittmann",role:"Klassenlehrer der 9c",icon:"👨‍🏫",col:"#ffc933",known:true},
  {id:"maass",name:"Herr Maaß",role:"Sportlehrer",icon:"⚽",col:"#3ddc84",known:true},
  {id:"jessen",name:"Herr Jessen",role:"Deutschlehrer",icon:"📖",col:"#5b6bb0",known:true},
  {id:"ziemer",name:"Frau Ziemer",role:"Klassenlehrerin der 9a",icon:"📐",col:"#e05a8c",known:true},
  {id:"ballhorn",name:"Herr Ballhorn",role:"Hausmeister",icon:"🔑",col:"#7b8cff",known:true},
  {id:"krahe",name:"Frau Krahe",role:"Klassenlehrerin der 10b",icon:"🍎",col:"#ff8a3d",known:true},
  {id:"taxi",name:"Taxi Mönchengladbach",role:"Bringt dich überallhin",icon:"🚕",col:"#f2c230",known:true},
  {id:"yilmaz",name:"Herr Yilmaz",role:"Büdchen am Torfbend",icon:"🥤",col:"#2e8b57",job:"kiosk"},
  {id:"jana",name:"Jana",role:"Speiche & Kette",icon:"🚲",col:"#17a2b8",job:"bike"},
  {id:"kalle",name:"Kalle",role:"Schrauberbude & Pannendienst",icon:"🔧",col:"#e8742a",job:"ramp"},
  {id:"rossi",name:"Frau Rossi",role:"Eiscafé Dolce Vita",icon:"🍦",col:"#e05a8c",job:"ice"},
  {id:"hennes",name:"Bäcker Hennes",role:"Backstube Hennes",icon:"🥨",col:"#b5793a",job:"bread"},
  {id:"kruemel",name:"Krümel",role:"dein Hund",icon:"🐕",col:"#a0703c",item:"dog"},
];
const contactKnown=c=>c.known||(c.job&&ms().contacts.includes(c.id))||(c.item&&xHas(c.item));
{const base=offerJob;offerJob=function(id){const c=CONTACTS.find(c=>c.job&&jobGiver(c.job)===jobGiver(id));if(c&&!ms().contacts.includes(c.id)){save.contacts.push(c.id);persist();setTimeout(()=>phoneNote(`${c.icon} ${c.name} ist jetzt in deinen Kontakten`),600)}base(id)}}
function sms(from,text){ms();save.msgs.unshift({from,text,t:fmtTime(),read:false});save.msgs=save.msgs.slice(0,40);persist();phoneBadge();if(state.mode==="play")phoneNote(`💬 Neue Nachricht von ${from}`);beep(1320,.06,"sine",.05);setTimeout(()=>beep(1760,.08,"sine",.05),90)}
const fmtTime=()=>{const m=Math.floor(state.time),h=Math.floor(m/60)%24;return `${String(h).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`};
let pnT=0;function phoneNote(t){const el=$("pnote");el.textContent=t;el.hidden=false;el.style.opacity=1;clearTimeout(pnT);pnT=setTimeout(()=>{el.style.opacity=0;setTimeout(()=>el.hidden=true,400)},3200)}
function phoneBadge(){const n=(save.msgs||[]).filter(m=>!m.read).length,b=$("pBadge");b.textContent=n;b.hidden=!n}
const PH={app:"home",call:null};
function openPhone(app){if(state.mode!=="play")return;state.mode="phone";car.v=0;PH.app=app||"home";PH.call=null;renderPhone();$("phone").hidden=false;beep(880,.04,"sine",.04)}
function closePhone(){$("phone").hidden=true;if(PH.ring)clearTimeout(PH.ring);PH.call=null;if(state.mode==="phone")state.mode="play"}
const APPS=[["call","phone","Anrufen","#00F0FF"],["msg","message-circle","Nachrichten","#FF2A85"],["chars","shirt","Charaktere","#FF7B00"],["duo","users","Zu zweit","#00F0FF"],["calc","calculator","Pythagoras-Rechner","#FF2A85"],["map","map","Karte","#FF7B00"],["heft","notebook-pen","Aufträge","#00F0FF"],["xtra","gift","Extras","#FF2A85"]];
function renderPhone(){ms();const A=PH.app;let h="",title="";
  if(A==="home"){title="";const un=save.msgs.filter(m=>!m.read).length;
    h=`<div class="pwall"><div class="pclock">${fmtTime()}</div><div class="pdate">Mönchengladbach · ${PROF?esc(PROF.name):""}</div></div><div class="pgrid">${APPS.map(([id,ico,nm,c])=>`<button type="button" data-app="${id}"><i style="--c:${c}">${ic(ico)}${id==="msg"&&un?`<b>${un}</b>`:""}</i><span>${nm}</span></button>`).join("")}</div>`}
  if(A==="call"&&!PH.call){title="Kontakte";h=`<div class="plist">${CONTACTS.filter(contactKnown).map(c=>`<button type="button" data-call="${c.id}"><i style="background:${c.col}">${c.icon}</i><span><b>${c.name}</b><small>${c.role}</small></span><em>📞</em></button>`).join("")}</div><p class="psmall">Weitere Nummern bekommst du, wenn du Leute in der Stadt kennenlernst.</p>`}
  if(A==="call"&&PH.call){const c=CONTACTS.find(c=>c.id===PH.call.id);title="";
    h=`<div class="pcall"><i style="background:${c.col}">${c.icon}</i><h4>${c.name}</h4><div class="pstate">${PH.call.on?"verbunden":"Ruft an …"}</div>${PH.call.on?`<div class="pbubble">${PH.call.say}</div>${PH.call.actions||""}`:`<div class="pdots"><span></span><span></span><span></span></div>`}<button type="button" class="phang" data-hang>${ic("phone-off")}<span>Auflegen</span></button></div>`}
  if(A==="msg"){title="Nachrichten";h=save.msgs.length?`<div class="pmsgs">${save.msgs.map(m=>`<div class="pm ${m.read?"":"new"}"><b>${esc(m.from)}</b><small>${m.t}</small><p>${esc(m.text)}</p></div>`).join("")}</div>`:`<p class="psmall">Noch keine Nachrichten.</p>`;save.msgs.forEach(m=>m.read=true);persist();phoneBadge()}
  if(A==="chars"){title="Charaktere";h=`<div class="plist">${Object.entries(CHARS).map(([id,C])=>{const ok=charOk(id),on=save.char===id;return `<button type="button" ${ok?`data-char="${id}"`:"disabled"} class="${on?"on":""}"><i style="background:${ok?"#1a2147":"#3a4170"}">${ok?C.icon:"🔒"}</i><span><b>${ok?C.name:"???"}</b><small>${ok?(on?"✓ Du spielst gerade diesen Charakter":C.desc||"Antippen zum Anziehen"):C.how}</small></span></button>`}).join("")}</div>`}
  if(A==="calc"){title="Pythagoras-Rechner";h=`<div class="pcalc"><div class="pseg"><button type="button" data-cm="hyp" class="${PH.cm!=="leg"?"on":""}">Hypotenuse c</button><button type="button" data-cm="leg" class="${PH.cm==="leg"?"on":""}">Kathete</button></div>
    <label>${PH.cm==="leg"?"Hypotenuse c":"Kathete a"}<input id="pcA" inputmode="decimal" autocomplete="off"></label><label>${PH.cm==="leg"?"bekannte Kathete":"Kathete b"}<input id="pcB" inputmode="decimal" autocomplete="off"></label>
    <button type="button" class="primary" data-calc>Ausrechnen</button><div id="pcOut" class="pcout"></div></div>`}
  if(A==="duo"){title="Zu zweit";h=duoHTML()}
  $("phScreen").innerHTML=(title?`<div class="ptitle"><button type="button" data-back aria-label="Zurück">${ic("chevron-left")}</button>${title}</div>`:"")+`<div class="pbody">${h}</div>`;
  $("phTime").textContent=fmtTime()}
const pnum=v=>parseFloat(String(v||"").replace(",","."));
const f2=v=>String(Math.round(v*100)/100).replace(".",",");
/* Telefonate */
function callLines(id){const N=pName(),q=mainQuest(),dq=DUCKS.map((d,i)=>i).find(i=>!(save.ducks||[]).includes(i));
  const tip=pick(["Merk dir: Die Hypotenuse liegt immer gegenüber dem rechten Winkel.","Kathete gesucht? Erst c² − a², dann die Wurzel.","Erst quadrieren, dann addieren, zum Schluss die Wurzel ziehen.","3, 4, 5 – das berühmteste Zahlentripel. Und 6, 8, 10 klappt auch!"]);
  switch(id){
    case "mats":{const secret=!(save.secrets||[]).includes("ufo")?"Mein Onkel schwört, dass über dem Mülforter Bruch manchmal was Komisches fliegt. Aber nur ganz hoch oben …":!(save.secrets||[]).includes("seil")?"Im Mülforter Bruch liegt ein altes Seil mit Knoten im Gras. Total seltsam, schau mal hin!":!(save.secrets||[]).includes("film")?"Hast du schon mal ganz oft auf die Uhr getippt? 😏":"Du hast echt alles gefunden. Respekt!";
      return dq!==undefined?`Hey ${N}! Ich hab ein gelbes Quietscheentchen gesehen – ${DUCKS[dq][2]}! Sammelst du die nicht?`:`Hey ${N}! ${secret}`}
    case "ditt":return !save.introDone?`Hallo ${N}, komm doch mal vor dem Haupteingang vorbei, ich warte auf dich!`:q?`Hallo ${N}! Deine nächste Hauptmission: „${q.title}“. ${q.giver.name.replace(/^Herr /,"Herrn ")} findest du in ${q.district}. ${tip}`:`${N}, du hast alle Hauptmissionen geschafft. Ich bin richtig stolz auf dich!`;
    case "maass":return save.jobs&&save.jobs.sprint&&save.jobs.sprint.done?`Na, ${N}, läufst du noch mit den Turbo-Turnschuhen? Bewegung ist das halbe Leben!`:qsx("sporthalle").done?`${N}! Komm mal in die Sporthalle, ich hab noch eine sportliche Herausforderung für dich.`:`Hallo ${N}, hier ist Herr Maaß. Wenn du so weit bist: In der Sporthalle wartet der Diagonal-Sprint auf dich!`;
    case "ziemer":return `Hallo ${N}! ${qsx("treppe").done?"Der neue Handlauf ist super geworden, danke!":"Die Außentreppe braucht einen neuen Handlauf. Schau mal bei mir vorbei, wenn du so weit bist."} ${tip}`;
    case "ballhorn":return `Ballhorn hier. ${qsx("werkhof").done?"Das Licht im Werkhof brennt, danke nochmal!":"Am Werkhof brauche ich deine Hilfe – ich warte dort."} ${N}, ich sag’s nur einmal: Auf dem Schulgelände wird nicht gefahren! ${save.fines?`Du hast schon ${save.fines} Fahrzeug${save.fines>1?"e":""} bei mir abgeben müssen.`:"Bisher hast du dich gut gehalten."}`;
    case "jessen":return `Hallo ${N}, hier ist Herr Jessen. ${qsx("schulhof").done?"Der Sponsorenlauf war ein Erfolg – danke für die Strecke!":"Für den Sponsorenlauf brauche ich dich auf dem Schulhof."} Und denk dran: Satzanfänge schreibt man groß – auch in Mathe-Antworten! 😉`;
    case "krahe":return `Hallo ${N}! ${qsx("markt").done?"Unsere Marktstände stehen perfekt. Danke!":"Auf dem Rheydter Markt bauen wir bald die Stände auf – dafür brauche ich dich."}`;
    case "kruemel":return `Wuff! Wuff wuff! 🐾 (Krümel rennt sofort zu dir.)`;
    default:{const c=CONTACTS.find(c=>c.id===id),J=c&&c.job;const G=J&&jobGiver(J),j=G&&giverJob(G);
      if(id==="kalle")return `Kalle hier, Schrauberbude und Pannendienst! ${j?`Ich hab noch Arbeit für dich: „${JOBDEF[j].title}“.`:""} Soll ich dir eins deiner Fahrzeuge vorbeibringen? Kostet 10 $.`;
      if(id==="taxi")return `Taxi Mönchengladbach, guten Tag! Wohin soll’s gehen? Wir rechnen ehrlich nach Luftlinie ab: 5 $ Grundgebühr plus 2 $ pro 100 m.`;
      return j?`Hallo ${N}! Komm doch mal vorbei, ich hab Arbeit für dich: „${JOBDEF[j].title}“.`:`Hallo ${N}! Schön, dass du anrufst. Danke nochmal für deine Hilfe!`}}}
const TAXI_DEST=[["🏫 GHS Dohr Torfbend",MG.start[0],MG.start[1]],["🔧 Werkhof",-238,22],["🚘 Autohaus Gartenstraße",-392,-965],["⛪ Hauptkirche Rheydt",-452,-822],["🏛️ Rheydter Markt",140,345],["🏫 GHS Dohr Haupthaus",MG.real.orte.haupthaus.x,MG.real.orte.haupthaus.y],["🌳 Mülforter Bruch",382,394],["🚉 Rheydt Hbf",-872,-250]].map(([n,x,y])=>{const p=MG.FX?MG.FX(x,y):[x,y];return [n,p[0],p[1]]});
function startCall(id){PH.call={id,on:false};renderPhone();let n=0;const ring=()=>{beep(440,.35,"sine",.04);setTimeout(()=>beep(480,.35,"sine",.03),20);n++;if(n<2)PH.ring=setTimeout(ring,900);else PH.ring=setTimeout(answer,900)};ring();
  function answer(){if(!PH.call||PH.call.id!==id)return;PH.call.on=true;PH.call.say=callLines(id);
    if(id==="taxi"){PH.call.actions=`<div class="pacts">${TAXI_DEST.map(([n,x,y],i)=>{const dx=Math.round(Math.abs(x-car.x)/10)*10,dy=Math.round(Math.abs(y-car.y)/10)*10,d=Math.hypot(dx,dy),p=Math.round(5+d/50);return d<30?"":`<button type="button" data-taxi="${i}"><span>${n}</span><small>Δx ${dx} m · Δy ${dy} m → √(${dx}² + ${dy}²) ≈ ${Math.round(d)} m · <b>${p} $</b></small></button>`}).join("")}</div>`}
    if(id==="kalle"){const own=save.owned.filter(v=>v!=="walk"&&!VEH[v].fly);PH.call.actions=own.length?`<div class="pacts">${own.map(v=>`<button type="button" data-tow="${v}"><span>${VEH[v].icon} ${VEH[v].name}</span><small>bringen lassen · 10 $</small></button>`).join("")}</div>`:`<p class="psmall">Du hast noch kein Fahrzeug. Kalle hat aber auch Tuning-Aufträge!</p>`}
    if(id==="kruemel"&&PED.dog){const P=PED.dog.userData.p;P.x=car.x-1.5;P.y=car.y}
    renderPhone()}}
function taxiTo(i){const [n,x,y]=TAXI_DEST[i],dx=Math.round(Math.abs(x-car.x)/10)*10,dy=Math.round(Math.abs(y-car.y)/10)*10,p=Math.round(5+Math.hypot(dx,dy)/50);
  if(save.money<p){PH.call.say=`Das kostet ${p} $, du hast aber nur ${save.money} $. Verdien dir erst etwas Geld mit Aufträgen!`;PH.call.actions="";renderPhone();return}
  save.money-=p;if(V().id!=="walk"&&!V().fly){state.mode="play";exitVehicle()}else if(V().fly){PH.call.say="Mit dem Hubschrauber brauchst du kein Taxi 😉";PH.call.actions="";renderPhone();return}
  closePhone();fade(()=>{const s=spotNear(x,y);car.x=s.x;car.y=s.y;car.v=0;car.alt=0;persist();updateHud();if(PED.dog&&xOn("dog")){const P=PED.dog.userData.p;P.x=car.x-1.5;P.y=car.y}if(DUO.on&&DUO.mesh){DUO.p.x=car.x+1.2;DUO.p.y=car.y}
    toast(`🚕 ${n.replace(/^\S+ /,"")}`,`Fahrpreis ${p} $ · Luftlinie ≈ ${Math.round(Math.hypot(dx,dy))} m`,"#f2c230")})}
function towVeh(id){if(save.money<10){PH.call.say="10 $ brauch ich schon, sorry!";PH.call.actions="";renderPhone();return}
  if(inSchool(car.x,car.y,0)){PH.call.say="Aufs Schulgelände fahr ich nicht, da kriegt Herr Ballhorn einen Anfall! Geh erst raus.";PH.call.actions="";renderPhone();return}
  save.money-=10;if(save.left&&save.left.id===id)save.left=null;closePhone();state.mode="play";setVehicle(id);persist();updateHud();toast(`🔧 Kalle bringt dein ${VEH[id].name}`,"−10 $ · Gute Fahrt!","#e8742a")}
function fade(fn){const f=$("fadeBlk");f.hidden=false;f.style.opacity=1;setTimeout(()=>{fn();setTimeout(()=>{f.style.opacity=0;setTimeout(()=>f.hidden=true,450)},250)},450)}

/* ---- Duo-Missionen: zu zweit an einem Gerät ---- */
const DUO={on:false,partner:null,turn:0,m:null,steps:[],i:0,t:0,mesh:null,p:{x:0,y:0,a:0,ph:0}};
const DUO_M={
  staffel:{icon:"🏃",title:"Rechen-Staffel",desc:"Vier Stationen hintereinander. An jeder Station ist abwechselnd eine Person mit einer Aufgabe dran. Wer nicht dran ist, darf laufen oder fahren.",money:60,xp:30},
  vermessung:{icon:"📏",title:"Vermessungs-Team",desc:"Ihr steckt ein echtes rechtwinkliges Dreieck in der Stadt ab: Erst die beiden Katheten ablaufen und messen, dann rechnet die andere Person die Diagonale aus – und der Laser prüft nach.",money:70,xp:35},
  schnitzel:{icon:"🧭",title:"Schnitzeljagd zu zweit",desc:"Jeder Hinweis verrät, wie weit das nächste Versteck nach Osten und Norden liegt. Wer dran ist, rechnet die Luftlinie aus – dann geht ihr zusammen hin.",money:70,xp:35},
};
const duoNames=()=>[pName(),DUO.partner?DUO.partner.name:"?"];
function duoHTML(){const others=PROFS.list.filter(p=>!PROF||p.id!==PROF.id);
  if(!DUO.on)return `<p class="psmall" style="margin-top:0">Spielt zu zweit an einem iPad: Ihr seid ein Team, wechselt euch bei den Aufgaben ab und gebt das Gerät weiter. Beide bekommen die Belohnung.</p>
    <h5>Mit wem spielst du?</h5><div class="plist">${others.map(p=>`<button type="button" data-partner="${p.id}"><i style="background:${p.look&&p.look.jacket||"#2f4f7a"}">👤</i><span><b>${esc(p.name)}</b><small>Spieler auf diesem Gerät</small></span></button>`).join("")}</div>
    <div class="pguest"><input id="pGuest" maxlength="16" placeholder="Name eines Gasts" autocomplete="off"><button type="button" class="primary" data-guest>Los</button></div><p class="perr" id="pGuestErr"></p>`;
  const [a,b]=duoNames();let h=`<div class="pduo"><div><i style="background:${(PROF&&PROF.look&&PROF.look.jacket)||"#2f4f7a"}">👤</i>${esc(a)}</div><span>🤝</span><div><i style="background:${DUO.partner.look.jacket}">👤</i>${esc(b)}</div></div>`;
  if(DUO.m){const M=DUO_M[DUO.m];h+=`<div class="pm new"><b>${M.icon} ${M.title}</b><small>Schritt ${Math.min(DUO.i+1,DUO.steps.length)} von ${DUO.steps.length}</small><p>Als Nächstes ist <b>${esc(duoNames()[DUO.turn])}</b> dran.</p></div><button type="button" data-duostop class="pwide">Duo-Mission abbrechen</button>`}
  else h+=`<h5>Duo-Missionen</h5><div class="plist">${Object.entries(DUO_M).map(([id,M])=>`<button type="button" data-duom="${id}"><i style="background:#1a2147">${M.icon}</i><span><b>${M.title}${(save.duoList||[]).includes(id)?" ✓":""}</b><small>${M.desc} · je ${M.money} $</small></span></button>`).join("")}</div>`;
  return h+`<button type="button" data-duoend class="pwide">Duo beenden</button>`}
function startDuo(partner){DUO.on=true;DUO.partner=partner;DUO.turn=0;DUO.m=null;
  if(!DUO.mesh){DUO.mesh=personFrom(Object.assign({},LOOK_DEF,partner.look||{}));DUO.mesh.scale.setScalar(.092);footShadow(DUO.mesh.userData.hu,.9);scene.add(DUO.mesh)}
  else{scene.remove(DUO.mesh);DUO.mesh=personFrom(Object.assign({},LOOK_DEF,partner.look||{}));DUO.mesh.scale.setScalar(.092);footShadow(DUO.mesh.userData.hu,.9);scene.add(DUO.mesh)}
  DUO.p.x=car.x+1.2;DUO.p.y=car.y;sms(partner.name,`Bin dabei, ${pName()}! Lass uns als Team losziehen 🤝`)}
function endDuo(){if(DUO.m)stopDuoMission();DUO.on=false;DUO.partner=null;if(DUO.mesh)DUO.mesh.visible=false}
function duoSpot(x,y,dx,dy){const tx=x+dx,ty=y+dy;if(Math.abs(tx)>HX-30||Math.abs(ty)>HY-30)return null;if(blockedGround(tx,ty)||inSchool(tx,ty,1))return null;
  for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]])if(blockedGround(tx+ox,ty+oy))return null;return {x:tx,y:ty}}
function startDuoMission(id){if(activeJob()||state.task){PH.duoErr="Erledige erst deinen laufenden Auftrag.";return false}
  const st=[],x0=car.x,y0=car.y;
  if(id==="staffel"){let x=x0,y=y0;for(let k=0;k<4;k++){const p=randSpot(x,y,45,90);st.push({x:p.x,y:p.y,txt:`Station ${k+1}`,task:()=>quickTask(`Rechen-Staffel · Station ${k+1}`,{})});x=p.x;y=p.y}}
  if(id==="vermessung"){let ok=null;for(let t=0;t<80&&!ok;t++){const a=pick([12,15,16,18,20,24,30]),b=pick([9,12,16,20,21,25]),sx=pick([1,-1]),sy=pick([1,-1]),swap=Math.random()<.5;
      const A={x:x0,y:y0},Bp=duoSpot(x0,y0,swap?0:sx*a,swap?sy*a:0);if(!Bp)continue;const Cp=duoSpot(Bp.x,Bp.y,swap?sx*b:0,swap?0:sy*b);if(!Cp)continue;ok={A,B:Bp,C:Cp,a,b}}
    if(!ok){PH.duoErr="Hier ist zu wenig Platz. Geht auf eine größere freie Fläche, z. B. einen Platz oder Park.";return false}
    DUO.tri=ok;st.push({x:ok.B.x,y:ok.B.y,txt:"Lauft zur Ecke mit dem rechten Winkel",onReach:()=>toast("📏 Erste Kathete gemessen",`a = ${ok.a} m`,"#3fd8ff")});
    st.push({x:ok.C.x,y:ok.C.y,txt:"Lauft zum dritten Eckpunkt",onReach:()=>toast("📏 Zweite Kathete gemessen",`b = ${ok.b} m`,"#3fd8ff"),task:()=>{const t=tHyp({a:ok.a,b:ok.b,u:"m",n:["gemessen","gemessen","Diagonale"],pic:"📏",x:{title:"Wie lang ist die Diagonale?",story:`Ihr habt ein rechtwinkliges Dreieck abgelaufen: <b>${ok.a} m</b> bis zur Ecke, dann im rechten Winkel <b>${ok.b} m</b>. Gleich prüft ein Laser vom Startpunkt bis hierher nach.`,q:"Wie lang ist die Strecke vom Startpunkt bis zu euch?"}});return Object.assign(t,{tag:"Vermessungs-Team"})}});
    showLaser(false)}
  if(id==="schnitzel"){let x=x0,y=y0;for(let k=0;k<3;k++){let p=null,dx=0,dy=0;for(let t=0;t<60&&!p;t++){const tr=pick([[3,4],[4,3],[6,8],[8,6],[5,12],[12,5]]),kk=pick([5,10]);dx=pick([1,-1])*tr[0]*kk;dy=pick([1,-1])*tr[1]*kk;if(Math.hypot(dx,dy)>130)continue;p=duoSpot(x,y,dx,-dy)}
      if(!p){const q=randSpot(x,y,40,90);p=q;dx=Math.round(q.x-x);dy=Math.round(-(q.y-y))}
      const ddx=dx,ddy=dy;st.push({x:p.x,y:p.y,pre:true,txt:`Versteck ${k+1}`,task:()=>{const a=Math.abs(ddy),b=Math.abs(ddx);const t=tHyp({a,b,u:"m",n:[ddy>0?"nach Norden":"nach Süden",ddx>0?"nach Osten":"nach Westen","Luftlinie"],pic:"🧭",x:{title:`Hinweis ${k+1}`,story:`Auf dem Zettel steht: „Das nächste Versteck liegt <b>${b} m ${ddx>0?"östlich":"westlich"}</b> und <b>${a} m ${ddy>0?"nördlich":"südlich"}</b> von hier.“`,q:"Wie weit ist das Versteck in Luftlinie entfernt?"}});return t}});x=p.x;y=p.y}}
  DUO.m=id;DUO.steps=st;DUO.i=0;DUO.t=0;missionBanner("new","Duo-Mission",`${DUO_M[id].icon} ${DUO_M[id].title}`,`${duoNames().join(" & ")} · ${duoNames()[DUO.turn]} fängt an`);
  setTimeout(()=>duoStep(),400);return true}
function duoStep(){const S=DUO.steps[DUO.i];if(!S){finishDuo();return}if(S.pre&&!S.solved)duoTask(S)}
function duoTask(S){DUO.re=2.5;const t=S.task(),who=duoNames()[DUO.turn];
  showTask(Object.assign(t,{tag:`${t.tag||"Duo-Mission"} · 👤 ${who} ist dran`,deliver:"Weiter",xduo:true,giver:{id:"x",name:""},tries:0,solved:false,sel:[]}));
  $("dTitle").textContent=`👤 ${who}: ${t.title}`}
function duoSolved(){const S=DUO.steps[DUO.i];DUO.turn^=1;S.done=true;
  if(S.pre&&!S.reached){S.solved=true;toast("🧭 Versteck gefunden!",`Folgt dem Lichtstrahl · gleich ist ${duoNames()[DUO.turn]} dran`,"#3ddc84");return}
  if(DUO.m==="vermessung")showLaser(true);
  DUO.i++;if(DUO.i>=DUO.steps.length){setTimeout(finishDuo,DUO.m==="vermessung"?1600:200);return}
  toast(`Gebt das Gerät an ${duoNames()[DUO.turn]} weiter`,"Nächste Station: folgt dem Lichtstrahl","#ffc933");duoStep()}
function tickDuo(dt,now){if(!DUO.on)return;const VH=V(),inCar=!["walk","scoot","bike"].includes(VH.id),g=DUO.mesh,P=DUO.p;
  if(g){g.visible=!inCar&&state.mode!=="start";if(inCar){P.x=car.x;P.y=car.y}else{
    const tx=car.x-Math.cos(car.a)*1.1-Math.sin(car.a)*1.2,ty=car.y-Math.sin(car.a)*1.1+Math.cos(car.a)*1.2,dx=tx-P.x,dy=ty-P.y,d=Math.hypot(dx,dy);
    if(d>25){P.x=tx;P.y=ty}let sp=0;if(d>.4){sp=Math.min(d*2.2,9);P.x+=dx/d*sp*dt;P.y+=dy/d*sp*dt;P.a=Math.atan2(dy,dx)}else{const fa=car.a;P.a+=((fa-P.a+Math.PI*3)%(Math.PI*2)-Math.PI)*Math.min(1,dt*3)}
    const rn=clamp((sp-3.4)/2.2,0,1),stl=strideLen(sp,rn);P.wk=(P.wk||0)+(clamp(sp/1.1,0,1)-(P.wk||0))*Math.min(1,dt*8);P.ph+=dt*sp*2*Math.PI/stl;
    poseHuman(g.userData.hu,P.ph,P.wk,rn,now/1000,stl);g.position.set(P.x,groundY(P.x,P.y),P.y);g.rotation.y=-P.a}}
  if(!DUO.m||state.mode!=="play")return;DUO.t+=dt;const S=DUO.steps[DUO.i];if(!S)return;
  if(S.pre&&!S.solved||(S.reached&&S.task&&!S.pre&&!S.done)){DUO.re=(DUO.re||0)-dt;if(DUO.re<=0)duoTask(S);return}
  const d=Math.hypot(S.x-car.x,S.y-car.y);
  const M=$("mission");if(!state.task&&!activeJob()){DUO.hud=(DUO.hud||0)-dt;if(DUO.hud<=0){DUO.hud=.25;M.hidden=false;M.dataset.xj=1;M.innerHTML=`<span class="timer">${Math.floor(DUO.t/60)}:${String(Math.floor(DUO.t%60)).padStart(2,"0")}</span><div class="t">👥 Duo · ${DUO_M[DUO.m].title}</div><div>${S.txt} · als Nächstes: ${esc(duoNames()[DUO.turn])}</div><div class="nav">${Math.round(d)} m</div>`}}
  if(d<3.5&&!S.reached){S.reached=true;beep(880,.1,"triangle");S.onReach&&S.onReach();if(S.task&&!S.pre)duoTask(S);else{DUO.i++;duoStep()}}}
function finishDuo(){const M=DUO_M[DUO.m],[a,b]=duoNames(),id=DUO.m,time=Math.round(DUO.t);DUO.m=null;DUO.steps=[];$("mission").hidden=true;showLaser(false);
  save.money+=M.money;save.xp+=M.xp;save.duoDone=(save.duoDone||0)+1;save.duoList=save.duoList||[];if(!save.duoList.includes(id))save.duoList.push(id);persist();updateHud();checkLevel();
  if(DUO.partner&&DUO.partner.id){try{const k="pyCity:"+DUO.partner.id,d=JSON.parse(localStorage.getItem(k)||"null")||{};d.money=(d.money||0)+M.money;d.xp=(d.xp||0)+M.xp;d.duoDone=(d.duoDone||0)+1;localStorage.setItem(k,JSON.stringify(d))}catch(e){}}
  confettiBurst(car.x,car.y,80);missionBanner("ok","Duo-Mission geschafft",`${M.icon} ${M.title}`,`${a} & ${b} · ${Math.floor(time/60)}:${String(time%60).padStart(2,"0")} min · je +${M.money} $ und +${M.xp} XP`);
  setTimeout(()=>sms(b,`Wir sind echt ein gutes Team, ${a}! 🙌`),4500)}
function stopDuoMission(){DUO.m=null;DUO.steps=[];$("mission").hidden=true;showLaser(false)}
let laser=null;function showLaser(on){if(!laser){laser=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1,8),new THREE.MeshBasicMaterial({color:0xff2040,fog:false}));laser.visible=false;scene.add(laser)}
  if(!on||!DUO.tri){laser.visible=false;return}const A=DUO.tri.A,C=DUO.tri.C,L=Math.hypot(C.x-A.x,C.y-A.y);laser.scale.set(1,L,1);laser.position.set((A.x+C.x)/2,groundY(A.x,A.y)+1,(A.y+C.y)/2);
  laser.rotation.set(0,0,0);laser.rotation.z=Math.PI/2;laser.rotation.y=-Math.atan2(C.y-A.y,C.x-A.x);laser.visible=true;toast("🔴 Laser-Kontrolle",`Gemessen: ${f2(L)} m · ${Math.abs(L-Math.hypot(DUO.tri.a,DUO.tri.b))<.2?"passt genau!":""}`,"#ff5d6c");setTimeout(()=>{if(laser)laser.visible=false},6000)}
{const base=jobTarget;jobTarget=function(){const t=base();if(t)return t;if(DUO.m){const S=DUO.steps[DUO.i];if(S&&(!S.pre||S.solved))return {x:S.x,y:S.y}}return null}}
{const base=goalText;goalText=function(){if(DUO.m&&!activeJob()){const S=DUO.steps[DUO.i];if(S)return `👥 ${DUO_M[DUO.m].title}: ${S.pre&&!S.solved?"Hinweis lösen":S.txt} · ${duoNames()[DUO.turn]} ist dran`}return base()}}
{const prev=$("bGo").onclick;$("bGo").onclick=()=>{const t=cur;if(t&&t.xduo){$("dlg").hidden=true;state.mode="play";cur=null;duoSolved();return}prev()}}

/* ---- Rahmen ---- */
let unlockT=2;
{const base=update;update=function(dt){base(dt);if(state.mode!=="play")return;unlockT-=dt;if(unlockT<=0){unlockT=2;checkUnlocks();welcomeCheck()}}}
{const base=animQuestWorld;animQuestWorld=function(dt,now){base(dt,now);tickDuo(dt,now)}}
{const base=applySave;applySave=function(d){endDuo();base(d);ms();if(walker)walker.userData.lookKey=null;applyLook();phoneBadge()}}
{const base=confiscate;confiscate=function(kind){const VH=V();base(kind);if(VH.id!=="walk")setTimeout(()=>sms(kind==="school"?"Herr Ballhorn":"Ordnungsamt MG",kind==="school"?`${pName()}, dein ${VH.name} steht jetzt bei mir im Keller. Auf dem Schulgelände wird nicht gefahren!`:`Bescheid: Ihr Fahrzeug (${VH.name}) wurde wegen wiederholter Verkehrsverstöße eingezogen.`),4500)}}
{const base=finishQuest;finishQuest=function(q){const was=qs(q).done;base(q);if(!was&&isMain(q))setTimeout(()=>{const n=mainQuest();sms("Herr Dittmann",`Super gemacht, ${pName()}! „${q.title}“ ist geschafft.${n?` Als Nächstes wartet ${n.giver.name} auf dich.`:" Damit hast du alle Hauptmissionen gelöst!"}`)},9500)}}
{const base=finishJob;finishJob=function(id){base(id);const c=CONTACTS.find(c=>c.job&&jobGiver(c.job)===jobGiver(id));if(c)setTimeout(()=>sms(c.name,id==="kiosk"?"Wie fährt sich der Scooter? Denk an den Helm 😉":"Danke nochmal! Ruf an, wenn du was brauchst."),12000)}}
function welcomeCheck(){if(save.introDone&&!save.welcomeSms&&state.mode==="play"){save.welcomeSms=true;persist();setTimeout(()=>sms("Mats",`Hey ${pName()}! Willkommen in der 9c 😄 Ruf mich an, wenn du Tipps brauchst – ich weiß, wo die geheimen Sachen sind!`),3500)}}

/* ---- Oberfläche ---- */
(function(){
  const b=document.createElement("button");b.id="btnPhone";b.type="button";b.setAttribute("aria-label","Handy öffnen");b.innerHTML=`📱<span id="pBadge" hidden>0</span>`;document.body.appendChild(b);b.onclick=()=>openPhone();
  const n=document.createElement("div");n.id="pnote";n.hidden=true;document.body.appendChild(n);
  const f=document.createElement("div");f.id="fadeBlk";f.hidden=true;document.body.appendChild(f);
  const o=document.createElement("div");o.id="phone";o.className="overlay";o.hidden=true;
  o.innerHTML=`<div class="phonebox" role="dialog" aria-label="Smartphone"><div class="pstat"><span id="phTime">15:00</span><span class="pnotch"></span><span>📶 🔋</span></div><div id="phScreen"></div><div class="phome"><button type="button" data-home aria-label="Startbildschirm"></button></div></div>`;document.body.appendChild(o);
  o.addEventListener("click",e=>{if(e.target===o){closePhone();return}const t=e.target.closest("button");if(!t)return;const D=t.dataset;
    if(D.home!==undefined){if(PH.app==="home")closePhone();else{PH.app="home";PH.call=null;renderPhone()}return}
    if(D.back!==undefined){PH.app="home";PH.call=null;if(PH.ring)clearTimeout(PH.ring);renderPhone();return}
    if(D.app){const a=D.app;if(a==="map"){closePhone();openMap();return}if(a==="heft"){closePhone();openHeft();return}if(a==="xtra"){closePhone();openXtra();return}PH.app=a;PH.duoErr="";renderPhone();return}
    if(D.call){startCall(D.call);return}
    if(D.hang!==undefined){if(PH.ring)clearTimeout(PH.ring);PH.call=null;beep(300,.15,"sine",.04);renderPhone();return}
    if(D.taxi!==undefined){taxiTo(+D.taxi);return}
    if(D.tow){towVeh(D.tow);return}
    if(D.char){setChar(D.char);renderPhone();beep(660,.06,"triangle");return}
    if(D.cm){PH.cm=D.cm;renderPhone();return}
    if(D.calc!==undefined){const a=pnum($("pcA").value),c=pnum($("pcB").value),out=$("pcOut");
      if(isNaN(a)||isNaN(c)||a<=0||c<=0){out.textContent="Bitte zwei positive Zahlen eingeben.";return}
      if(PH.cm==="leg"){if(c>=a){out.innerHTML="Die Hypotenuse muss die längste Seite sein.";return}const r=Math.sqrt(a*a-c*c);out.innerHTML=`b² = c² − a²<br>b² = ${f2(a)}² − ${f2(c)}² = ${f2(a*a)} − ${f2(c*c)} = ${f2(a*a-c*c)}<br>b = √${f2(a*a-c*c)} ≈ <b>${f2(r)}</b>`}
      else{const r=Math.hypot(a,c);out.innerHTML=`c² = a² + b²<br>c² = ${f2(a)}² + ${f2(c)}² = ${f2(a*a)} + ${f2(c*c)} = ${f2(a*a+c*c)}<br>c = √${f2(a*a+c*c)} ≈ <b>${f2(r)}</b>`}return}
    if(D.partner){const p=PROFS.list.find(p=>p.id===D.partner);if(p){startDuo({id:p.id,name:p.name,look:p.look||{}});renderPhone()}return}
    if(D.guest!==undefined){const nm=($("pGuest").value||"").trim();if(nm.length<2||!/^[\p{L}][\p{L} .'-]*$/u.test(nm)){$("pGuestErr").textContent="Bitte einen Namen mit mindestens 2 Buchstaben eingeben.";return}
      startDuo({id:null,name:nm,look:{jacket:pick(LOOKS.jacket),hair:pick(LOOKS.hair),skin:pick(LOOKS.skin)}});renderPhone();return}
    if(D.duom){if(startDuoMission(D.duom))closePhone();else{renderPhone();const e2=document.createElement("p");e2.className="perr";e2.textContent=PH.duoErr;$("phScreen").querySelector(".pbody").prepend(e2)}return}
    if(D.duostop!==undefined){stopDuoMission();renderPhone();return}
    if(D.duoend!==undefined){endDuo();renderPhone();return}});
})();
addEventListener("keydown",e=>{if(isTyping(e))return;const k=e.key.toLowerCase();if(k==="p"&&!e.repeat){if(state.mode==="play")openPhone();else if(state.mode==="phone")closePhone()}if(k==="escape"&&state.mode==="phone")closePhone()});
phoneBadge();
