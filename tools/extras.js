/* ================= Nebenjobs bei Ladenbesitzern und Passanten, Belohnungen, Easter Eggs ================= */
const xs=()=>{save.items=save.items||{};save.eq=save.eq||{};save.jobs=save.jobs||{};save.ducks=save.ducks||[];save.secrets=save.secrets||[];save.pedHelped=save.pedHelped||0;return save};
const xHas=id=>!!(xs().items[id]);
function xOn(id){return !!(save.items&&save.items[id]&&save.eq&&save.eq[id])}
const _xm={};const xmat=(c,o)=>{const k=c+(o?JSON.stringify(o):"");if(_xm[k])return _xm[k];const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));if(window.__lin)m.color.convertSRGBToLinear();if(m.emissive&&o&&o.emissive&&window.__lin)m.emissive.convertSRGBToLinear();return _xm[k]=m};
const xbasic=(c,o)=>{const m=new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));if(window.__lin)m.color.convertSRGBToLinear();return m};

/* ---- Belohnungen ---- */
const ITEMS={
  scooter:{icon:"🛴",name:"E-Scooter",desc:"Das alte Gefährt vom Neffen von Herrn Yilmaz. Steht jetzt in deiner Garage.",hint:"Ein Kioskbesitzer in Dohr sucht jemanden für eine Lieferung."},
  neon:{icon:"🌈",name:"Neon-Unterboden",eq:true,desc:"Leuchtet unter jedem Fahrzeug. Tippe auf „Farbe“, um sie zu wechseln.",hint:"Im Fahrradladen in Rheydt gibt es eine Probefahrt."},
  turbo:{icon:"🚀",name:"Turbo-Tuning",eq:true,desc:"+12 % Höchstgeschwindigkeit für alle Fahrzeuge.",hint:"Eine Schrauberbude gleich neben dem Autohaus."},
  gold:{icon:"🥇",name:"Gold-Lack",desc:"Neue Lackfarbe für alle Fahrzeuge in der Garage.",hint:"Kalle hat nach der Rampe noch eine Testfahrt."},
  glasses:{icon:"🕶️",name:"Sonnenbrille",eq:true,desc:"Cool bleiben, auch bei schweren Aufgaben.",hint:"Ein Eiscafé in Rheydt braucht einen schnellen Boten."},
  cap:{icon:"🧢",name:"Basecap",eq:true,desc:"Eine rote Kappe von der Backstube.",hint:"Eine Bäckerei in der Innenstadt."},
  shoes:{icon:"👟",name:"Turbo-Turnschuhe",eq:true,desc:"Zu Fuß 20 % schneller.",hint:"Herr Maaß hat nach dem Werkhof eine sportliche Herausforderung."},
  balloon:{icon:"🎈",name:"Luftballon",eq:true,desc:"Schwebt immer über dir.",hint:"Ein Kind auf dem Spielplatz hat ein Problem mit einem Drachen."},
  fanfare:{icon:"📯",name:"Stadion-Fanfare",eq:"horn",desc:"Neue Hupe (Taste Q oder 📯).",hint:"Der Platzwart im Nordpark vermisst etwas."},
  dog:{icon:"🐕",name:"Hund Krümel",eq:true,desc:"Läuft überall mit dir mit.",hint:"Manche Passanten mit ❓ brauchen Hilfe beim Gassigehen."},
  confetti:{icon:"🎉",name:"Konfetti-Spur",eq:true,desc:"Beim Laufen und mit Nitro fliegt Konfetti.",hint:"Hilf 5 Passanten mit ❓."},
  quack:{icon:"🦆",name:"Enten-Hupe",eq:"horn",desc:"Quak! Die lustigste Hupe der Stadt.",hint:"Finde alle 6 versteckten Quietscheentchen."},
  film:{icon:"🎞️",name:"Schwarzweiß-Film",eq:true,desc:"Die Stadt wie in einem alten Film.",hint:"Ein Geheimnis rund um die Uhr …"},
  crown:{icon:"👑",name:"Krone",eq:true,desc:"Für echte Entdecker: alle Geheimnisse gefunden.",hint:"Finde alle 4 Geheimnisse der Stadt."},
};
function giveItem(id){xs();if(id==="scooter"){if(!save.owned.includes("scoot")){save.owned.push("scoot")}else save.money+=150}
  save.items[id]=1;const it=ITEMS[id];if(it.eq){if(it.eq==="horn")for(const k in ITEMS)if(ITEMS[k].eq==="horn")save.eq[k]=false;save.eq[id]=true}
  persist();applyEquip();updateHud()}

/* ---- Hilfsfunktionen für Orte ---- */
function freeSpot(x,y,side){for(let r=0;r<45;r+=.75){const n=Math.max(1,Math.round(r*5));for(let k=0;k<n;k++){const a=k/n*Math.PI*2,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r,i=gi(px,py);
  if(i<0||blockedGround(px,py)||inSchool(px,py,1))continue;if(side&&!(surf[i]&8))continue;
  if(blockedGround(px+1.2,py)||blockedGround(px-1.2,py)||blockedGround(px,py+1.2)||blockedGround(px,py-1.2))continue;return {x:px,y:py}}}
  return side?freeSpot(x,y,false):{x,y}}
function randSpot(x,y,lo,hi){for(let k=0;k<40;k++){const a=Math.random()*Math.PI*2,d=lo+Math.random()*(hi-lo),tx=x+Math.cos(a)*d,ty=y+Math.sin(a)*d;
  if(Math.abs(tx)>HX-30||Math.abs(ty)>HY-30)continue;const s=spotNear(tx,ty);if(s&&!blockedGround(s.x,s.y)&&!inSchool(s.x,s.y,2)&&Math.hypot(s.x-x,s.y-y)>lo*.6)return {x:s.x,y:s.y}}
  const s=spotNear(x+lo,y);return {x:s.x,y:s.y}}
function xMarker(col){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.36,0),xbasic(col,{fog:false}));m.scale.y=1.6;scene.add(m);return m}

/* ---- Auftraggeber: Läden und bekannte Leute ---- */
const XG=[
  {id:"yilmaz",name:"Herr Yilmaz",role:"Büdchen am Torfbend",at:[-214,-47],shirt:"#2e8b57",booth:["#2e8b57","🥤 Büdchen"],jobs:["kiosk"]},
  {id:"jana",name:"Jana",role:"Fahrradladen „Speiche & Kette“",at:[95,300],shirt:"#17a2b8",booth:["#17a2b8","🚲 Speiche & Kette"],jobs:["bike"]},
  {id:"kalle",name:"Kalle",role:"Kalles Schrauberbude",at:[152,82],shirt:"#55606e",booth:["#e8742a","🔧 Kalles Schrauberbude"],jobs:["ramp","trial"]},
  {id:"rossi",name:"Frau Rossi",role:"Eiscafé „Dolce Vita“",at:[180,368],shirt:"#e05a8c",booth:["#f2b8c6","🍦 Dolce Vita"],jobs:["ice"]},
  {id:"hennes",name:"Bäcker Hennes",role:"Backstube Hennes",at:[60,-350],shirt:"#f2f2f2",booth:["#b5793a","🥨 Backstube Hennes"],jobs:["bread"]},
  {id:"elif",talk:"Elif",jobs:["kite"]},
  {id:"tarik",talk:"Tarik",jobs:["ball"]},
  {id:"maass",quest:"werkhof",jobs:["sprint"]},
];
const d_=()=>AU.diff();
const JOBDEF={
  kiosk:{title:"Sprudel für Frau Peters",reward:"scooter",xp:20,money:0,
    pages:N=>[`Hallo ${N}! Ich bin Herr Yilmaz, mir gehört das Büdchen hier am Torfbend.`,`Frau Peters wartet auf ihre Kiste Sprudel, aber ich kann den Laden nicht allein lassen. Bringst du sie ihr?`,`Wenn du das schaffst, schenke ich dir den alten E-Scooter von meinem Neffen. Der steht hier nur im Weg herum!`],
    steps:[{t:"goto",d:[80,150],txt:"Bring die Sprudelkiste zu Frau Peters",icon:"📦"},{t:"task",make:()=>{const [a,b]=AU.legsPair(d_(),20,45);return tHyp({a,b,u:"cm",n:["Breite","Länge","Diagonale"],pic:"📦",x:{title:"Passt der Regenschirm?",story:`Frau Peters freut sich über den Sprudel. Sie will die leere Kiste als Schirmständer benutzen. Der Kistenboden ist <b>${fmt(a)} cm</b> breit und <b>${fmt(b)} cm</b> lang.`,q:"Wie lang ist die Diagonale des Kistenbodens?"}})}},{t:"return",txt:"Zurück zum Büdchen"}],
    thanks:N=>`Super, ${N}! Frau Peters hat schon angerufen. Der E-Scooter gehört jetzt dir. Aber denk dran: auf die Straße, nicht auf den Gehweg!`},
  bike:{title:"Die Probefahrt",reward:"neon",xp:20,money:40,
    pages:N=>[`Hey ${N}! Ich bin Jana. Ein Kunde will ein Lastenrad, aber ich weiß nicht, ob die Strecke zum Kontrollpunkt schnell genug zu schaffen ist.`,`Fahr die Strecke einmal auf Zeit ab und hilf mir danach beim Rahmen. Dafür baue ich dir einen Neon-Unterboden ein – der leuchtet unter jedem Fahrzeug!`],
    steps:[{t:"race",d:[110,170],txt:"Probefahrt zum Kontrollpunkt",icon:"🏁",f:1},{t:"task",make:()=>{const o=AU.hypLeg(d_(),30,80);return tLeg({c:o.c,b:o.b,u:"cm",n:["Höhe","waagerecht","Strebe"],pic:"🚲",x:{title:"Die Strebe am Lastenrad",story:`Am Lastenrad läuft eine schräge Strebe von <b>${fmt(o.c)} cm</b> Länge. Waagerecht überbrückt sie <b>${fmt(o.b)} cm</b>.`,q:"Wie hoch reicht die Strebe?"}})}},{t:"return",txt:"Zurück zu Jana"}],
    thanks:N=>`Klasse, ${N}! Der Neon-Unterboden ist eingebaut. Im Menü unter 🎁 Extras kannst du die Farbe wechseln.`},
  ramp:{title:"Die Auffahrrampe",reward:"turbo",xp:20,money:30,
    pages:N=>[`Moin ${N}, ich bin Kalle. Ich baue eine neue Auffahrrampe für meine Werkstatt, aber mit dem Rechnen hab ich’s nicht so.`,`Hilf mir bei zwei Maßen, dann bekommst du von mir ein Turbo-Tuning. Alle deine Fahrzeuge werden schneller!`],
    steps:[{t:"task",make:()=>{const d=d_();const [h,l]=d===1?pick([[.6,.8],[.9,1.2],[1.2,1.6],[.6,4.5]]):[ri(5,12)/10,ri(25,48)/10];return tHyp({a:h,b:l,u:"m",n:["Höhe","Länge","Rampe"],pic:"🚗",x:{title:"Die Auffahrrampe",story:`Die Rampe soll eine Höhe von <b>${fmt(h)} m</b> überwinden und waagerecht <b>${fmt(l)} m</b> lang sein.`,q:"Wie lang wird die schräge Rampe?"}})}},
      {t:"task",make:()=>{const o=AU.hypLeg(d_(),1,4);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Stützbalken"],pic:"🔧",x:{title:"Der Stützbalken",story:`Unter der Rampe steht ein schräger Stützbalken von <b>${fmt(o.c)} m</b> Länge. Sein Fuß steht <b>${fmt(o.b)} m</b> von der Wand entfernt.`,q:"In welcher Höhe berührt er die Wand?"}})}}],
    thanks:N=>`Sauber gerechnet, ${N}! Dein Turbo-Tuning ist drin. Und komm wieder, ich hab noch eine Testfahrt für dich.`},
  trial:{title:"Testfahrt mit Stoppuhr",reward:"gold",xp:25,money:60,needVeh:true,
    pages:N=>[`Da bist du ja wieder, ${N}! Zeit für eine Testfahrt mit Stoppuhr.`,`Fahr so schnell du kannst zum Kontrollpunkt und zurück zu mir. Schaffst du die Zeit, lackier ich dir alles in Gold!`],
    steps:[{t:"race",d:[170,240],txt:"Testfahrt: zum Kontrollpunkt",icon:"⏱️",f:1.25},{t:"return",txt:"Zurück zu Kalle",race:true}],
    thanks:N=>`Was für eine Zeit, ${N}! Der Gold-Lack wartet in deiner Garage.`},
  ice:{title:"Eis-Express",reward:"glasses",xp:20,money:40,
    pages:N=>[`Ciao ${N}! Ich bin Frau Rossi vom Eiscafé Dolce Vita.`,`Eine Kundin hat Eis bestellt, aber es ist warm heute. Bring es hin, bevor es schmilzt! Dafür bekommst du eine richtig coole Sonnenbrille.`],
    steps:[{t:"race",d:[90,160],txt:"Bring das Eis, bevor es schmilzt!",icon:"🍦",f:1},{t:"task",make:()=>{const o=AU.hypLeg(d_(),1,3.5);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Schirmstange"],pic:"⛱️",x:{title:"Der schiefe Sonnenschirm",story:`Die Kundin hat einen schrägen Ampelschirm. Die Stange ist <b>${fmt(o.c)} m</b> lang, ihr Ende steht waagerecht <b>${fmt(o.b)} m</b> vom Fuß entfernt.`,q:"Wie hoch hängt der Schirm?"}})}},{t:"return",txt:"Zurück zum Eiscafé"}],
    thanks:N=>`Perfetto, ${N}! Kein Tropfen geschmolzen. Hier ist deine Sonnenbrille!`},
  bread:{title:"Brezeln fürs Büro",reward:"cap",xp:20,money:40,
    pages:N=>[`Guten Morgen, ${N}! Ich bin Bäcker Hennes.`,`Ein Büro hat dreißig Brezeln bestellt. Bringst du das Blech hin? Als Dankeschön gibt es eine Kappe von der Backstube.`],
    steps:[{t:"goto",d:[100,180],txt:"Bring die Brezeln ins Büro",icon:"🥨"},{t:"task",make:()=>{const [a,b]=AU.legsPair(d_(),30,70);return tHyp({a,b,u:"cm",n:["Breite","Länge","Diagonale"],pic:"🥨",x:{title:"Das Backblech",story:`Im Büro will jemand das Blech quer in den Schrank stellen. Das Blech ist <b>${fmt(a)} cm</b> breit und <b>${fmt(b)} cm</b> lang.`,q:"Wie lang ist die Diagonale des Blechs?"}})}},{t:"return",txt:"Zurück zur Backstube"}],
    thanks:N=>`Danke, ${N}! Die Kappe steht dir gut.`},
  kite:{title:"Der Drachen im Baum",reward:"balloon",xp:15,money:0,
    pages:N=>[`${N}! Mein Drachen hängt im Baum fest! Ich halte die Schnur noch in der Hand.`,`Wenn wir wissen, wie hoch er hängt, kann mein Papa die richtige Leiter holen. Hilfst du mir?`],
    steps:[{t:"task",make:()=>{const o=AU.hypLeg(d_(),4,20);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Schnur"],pic:"🪁",x:{title:"Der Drachen im Baum",story:`Die Schnur ist straff gespannt und <b>${fmt(o.c)} m</b> lang. Elif steht <b>${fmt(o.b)} m</b> vom Baumstamm entfernt.`,q:"Wie hoch hängt der Drachen (von Elifs Hand aus gemessen)?"}})}}],
    thanks:N=>`Danke, ${N}! Papa holt die Leiter. Hier, du bekommst meinen Luftballon!`},
  ball:{title:"Ball über den Zaun",reward:"fanfare",xp:15,money:30,
    pages:N=>[`Ah, ${N}! Beim Training ist ein Ball über den Zaun geflogen. Findest du ihn?`,`Wenn du ihn bringst, schenke ich dir die alte Stadion-Fanfare. Die kannst du als Hupe benutzen!`],
    steps:[{t:"goto",d:[45,85],txt:"Such den Fußball",icon:"⚽"},{t:"task",make:()=>{const d=d_(),s=d===1?11:d===2?16.5:pick([9.15,20,13]);return tHyp({a:3.66,b:s,u:"m",n:["halbe Torbreite","Abstand","Schussweg"],pic:"⚽",x:{title:"Schuss an den Pfosten",story:`Ein Fußballtor ist 7,32 m breit. Du stehst genau vor der Tormitte, <b>${fmt(s)} m</b> von der Torlinie entfernt.`,q:"Wie weit ist es von dir bis zum Pfosten?"}})}},{t:"return",txt:"Bring den Ball zu Tarik"}],
    thanks:N=>`Super, ${N}! Hier ist die Fanfare. Drück Q oder die Hupe – das ganze Viertel hört dich!`},
  sprint:{title:"Sprint zur Haltestelle",reward:"shoes",xp:20,money:0,walk:true,
    pages:N=>[`Gut, dass du da bist, ${N}! Als Sportlehrer will ich sehen, wie fit du bist.`,`Sprint zu Fuß bis zur Bushaltestelle „Schule Torfbend“ und zurück zu mir. Schaffst du die Zeit, bekommst du meine Turbo-Turnschuhe!`],
    steps:[{t:"race",fixed:[-322,-56.2],time:24,txt:"Sprinte zur Bushaltestelle",icon:"🏃"},{t:"return",txt:"Zurück zu Herrn Maaß",race:true,time:24}],
    thanks:N=>`Stark, ${N}! Die Turnschuhe gehören dir. Du bist jetzt zu Fuß richtig schnell.`},
};
const JOB_NEED={trial:()=>xs().jobs.ramp&&save.jobs.ramp.done,sprint:()=>qsx("werkhof").done};
function giverPos(G){if(G.talk){const t=TALK.find(t=>t.name===G.talk);return t?{x:t.x,y:t.y,name:t.name,role:t.role}:null}
  if(G.quest){const q=questById(G.quest);return q?{x:q.giver.x,y:q.giver.y,name:q.giver.name,role:q.giver.role}:null}return G.pos}
function giverJob(G){xs();for(const id of G.jobs){const s=save.jobs[id];if(s&&s.done)continue;if(JOB_NEED[id]&&!JOB_NEED[id]())return null;return id}return null}
const activeJob=()=>{xs();for(const id in save.jobs){const s=save.jobs[id];if(s&&s.st>0&&!s.done)return id}return null};
const jobGiver=id=>XG.find(G=>G.jobs.includes(id));

/* Läden in der Welt: kleiner Stand, Person, Schild */
function buildBooth(G){const p0=freeSpot(G.at[0],G.at[1],true);const r=nearestRoad(p0.x,p0.y,30);let nx=1,ny=0;
  if(r){nx=p0.x-r.x;ny=p0.y-r.y;const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l}
  let bx=p0.x+nx*2.2,by=p0.y+ny*2.2;if(blockedGround(bx,by)){bx=p0.x-ny*2.4;by=p0.y+nx*2.4}
  const a=Math.atan2(-ny,-nx),gy=groundY(bx,by),g=new THREE.Group();g.position.set(bx,gy,by);g.rotation.y=-a;scene.add(g);
  const col=G.booth[0];
  const box=(w,h,d,m,x,y,z)=>{const k=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);k.position.set(x,y,z);k.castShadow=k.receiveShadow=true;g.add(k);return k};
  box(1.6,2.3,2.4,xmat("#eceae4"),-.3,1.15,0);box(.5,1,2.3,xmat(col),.6,.5,0);box(.6,.06,2.4,xmat("#8a6a45"),.65,1.03,0);
  const aw=box(.9,.06,2.6,xmat(col),.85,2.35,0);aw.rotation.z=-.35;
  for(let i=0;i<5;i++){const s=box(.14,.2,.14,xmat(["#d81e2c","#f2b81f","#2e8b57","#1b2f6b","#e8742a"][i]),.6,1.16,-.9+i*.45)}
  const lab=textSprite(6.2,1.17);lab.material.depthTest=true;lab.userData.set(G.booth[1],"#fff","rgba(10,14,32,.85)");lab.position.set(bx,gy+3.7,by);
  // fester Stand: Zellen unter dem Häuschen sperren (nicht auf Straßen)
  for(let u=-1.1;u<=.5;u+=.5)for(let w=-1.2;w<=1.2;w+=.5){const wx=bx+Math.cos(a)*u-Math.sin(a)*w,wy=by+Math.sin(a)*u+Math.cos(a)*w,i=gi(wx,wy);if(i>=0&&!(surf[i]&4))solid[i]=Math.max(solid[i],1)}
  const pp={x:p0.x,y:p0.y};G.pos={x:pp.x,y:pp.y,name:G.name,role:G.role};
  const before=new Set(Object.keys(_hm));G.person=standPerson(pp.x,pp.y,a,G.shirt);if(window.__lin)for(const k of Object.keys(_hm))if(!before.has(k))_hm[k].color.convertSRGBToLinear()}

/* ---- Auftragsablauf ---- */
const XJ={timer:0,beacon:null,ring:null,tLeft:0};
function jobState(id){xs();return save.jobs[id]||(save.jobs[id]={st:0,done:false})}
function stepOf(id){const s=jobState(id);return JOBDEF[id].steps[s.st-1]}
function offerJob(id){const J=JOBDEF[id],G=jobGiver(id),P=giverPos(G),N=pName();
  const a=activeJob();if(a&&a!==id){talkPages(P.name,P.role,[`Hallo ${N}! Ich hätte da etwas für dich – aber erledige erst deinen Nebenjob „${JOBDEF[a].title}“.`],null);return}
  if(state.task){talkPages(P.name,P.role,[`Hallo ${N}! Bring erst deine Kurier-Lieferung zu Ende, dann helfe ich dir weiter.`],null);return}
  if(J.walk&&V().id!=="walk"){talkPages(P.name,P.role,J.pages(N).slice(0,1).concat([`Das ist ein Sprint zu Fuß. Steig erst ab!`]),null);return}
  if(J.needVeh&&V().id==="walk"){talkPages(P.name,P.role,J.pages(N).slice(0,1).concat([`Aber zu Fuß wird das nichts. Komm mit einem Fahrzeug wieder!`]),null);return}
  talkPages(P.name,P.role,J.pages(N),()=>startJob(id));talkSeq.last="Auftrag annehmen ✓";talkSeq.later=true;showTalkPage()}
function startJob(id){XJ.started=performance.now();const s=jobState(id);s.st=0;s.done=false;persist();beep(660,.1,"triangle");missionBanner("new","Nebenmission",JOBDEF[id].title,`${giverPos(jobGiver(id)).name} · Belohnung: ${ITEMS[JOBDEF[id].reward].icon} ${ITEMS[JOBDEF[id].reward].name}`);advanceJob(id)}
function advanceJob(id){const s=jobState(id),J=JOBDEF[id];s.st++;
  if(s.st>J.steps.length){finishJob(id);return}
  const S=J.steps[s.st-1],G=jobGiver(id),P=giverPos(G);
  if(S.t==="goto"||S.t==="race"){const p=S.fixed?{x:S.fixed[0],y:S.fixed[1]}:randSpot(P.x,P.y,S.d[0],S.d[1]);s.tx=p.x;s.ty=p.y;
    if(S.t==="race"){const dist=Math.hypot(p.x-car.x,p.y-car.y),sp=V().id==="walk"?3.6:V().max*.5;XJ.tLeft=S.time||Math.round(dist/sp/(S.f||1)*1.25+10);XJ.t0=XJ.tLeft}}
  if(S.t==="return"&&S.race){const dist=Math.hypot(P.x-car.x,P.y-car.y),sp=V().id==="walk"?3.6:V().max*.5;XJ.tLeft=S.time||Math.round(dist/sp*1.25+10)}
  if(S.t==="task"){if(s.tx===undefined){s.tx=P.x;s.ty=P.y}persist();openJobTask(id);return}
  persist();const late=Math.max(0,4300-(performance.now()-(XJ.started||0)));if(S.t!=="return")setTimeout(()=>toast(`${S.icon||"🔸"} ${S.txt}`,S.t==="race"?`Zeit: ${XJ.tLeft} s · Folge dem grünen Lichtstrahl`:"Folge dem grünen Lichtstrahl","#3ddc84"),late)}
function openJobTask(id){const S=stepOf(id),t=S.make();const P=giverPos(jobGiver(id));
  showTask(Object.assign(t,{tag:`Nebenmission · ${JOBDEF[id].title}`,deliver:"Weiter",xjob:id,giver:{id:"x",name:P.name},tries:0,solved:false,sel:[]}))}
function failJob(id,why){const s=jobState(id);s.st=0;s.tx=s.ty=undefined;persist();$("mission").hidden=true;
  missionBanner("bad","Nebenmission gescheitert",JOBDEF[id].title,why+` Versuch es nochmal bei ${giverPos(jobGiver(id)).name}.`)}
function cancelJob(){const id=activeJob();if(id){const s=jobState(id);s.st=0;persist();$("mission").hidden=true;toast("Nebenjob abgebrochen",JOBDEF[id].title,"#ff5d6c")}}
function finishJob(id){const s=jobState(id),J=JOBDEF[id];s.done=true;s.st=0;save.money+=J.money||0;save.xp+=J.xp||0;persist();$("mission").hidden=true;
  giveItem(J.reward);const it=ITEMS[J.reward],P=giverPos(jobGiver(id));
  talkPages(P.name,P.role,[J.thanks(pName())],()=>missionBanner("ok","Nebenmission geschafft",J.title,`Belohnung: ${it.icon} ${it.name}${J.money?` · +$${J.money}`:""} · siehe 🎁 Extras`));talkSeq.last="Danke!";showTalkPage();checkLevel()}
function tickJob(dt){const id=activeJob();const M=$("mission");
  if(!id){if(!state.task&&M.dataset.xj){M.hidden=true;delete M.dataset.xj}return}
  const s=jobState(id),S=stepOf(id),J=JOBDEF[id],P=giverPos(jobGiver(id));if(!S)return;
  if(J.walk&&V().id!=="walk"){failJob(id,"Das war ein Sprint zu Fuß!");return}
  const tx=S.t==="return"?P.x:s.tx,ty=S.t==="return"?P.y:s.ty,d=Math.hypot(tx-car.x,ty-car.y);
  const timed=S.t==="race"||(S.t==="return"&&S.race);
  if(timed){XJ.tLeft-=dt;if(XJ.tLeft<=0){failJob(id,"Die Zeit ist abgelaufen.");return}}
  XJ.hud=(XJ.hud||0)-dt;if(!state.task&&XJ.hud<=0){XJ.hud=.2;M.hidden=false;M.dataset.xj=1;M.innerHTML=`${timed?`<span class="timer" style="color:${XJ.tLeft<8?"var(--bad)":"#fff"}">${Math.ceil(XJ.tLeft)} s</span>`:""}<div class="t">🔸 Nebenmission · ${J.title}</div><div>${S.icon||""} ${S.t==="task"?"Löse die Aufgabe am Ziel":S.txt}</div><div class="nav">${Math.round(d)} m</div>`}
  if(S.t==="goto"&&d<3.5){beep(880,.1,"triangle");advanceJob(id)}
  else if(S.t==="race"&&d<4.5){toast("Kontrollpunkt!",`Noch ${Math.ceil(XJ.tLeft)} s übrig`,"#3ddc84");jingle();advanceJob(id)}
  else if(S.t==="return"&&d<3.6)advanceJob(id)}
function jobTarget(){const id=activeJob();if(!id)return null;const s=jobState(id),S=stepOf(id);if(!S)return null;if(S.t==="return"){const P=giverPos(jobGiver(id));return {x:P.x,y:P.y}}return {x:s.tx,y:s.ty}}

/* Kleine Rechenfrage als Wiederholung oder für Passanten */
function quickTask(tag,kind){const d=AU.diff();let pool=AUFG.filter(v=>v.g!=="heli"&&d>=v.d[0]&&d<=v.d[1]&&!save.recent.includes(v.id));if(!pool.length)pool=AUFG.filter(v=>v.g!=="heli");
  const v=pick(pool),t=v.make(Math.max(d,v.d[0]));save.recent.push(v.id);if(save.recent.length>12)save.recent.shift();
  return Object.assign({tag,deliver:"Fertig"},t,{id:v.id,giver:{id:"x",name:""},tries:0,solved:false,diff:d,sel:[]},kind)}

/* ---- Passanten mit ❓ ---- */
const PED={p:null,mark:null,t:25,dog:null,walked:0,lx:0,ly:0};
{const base=stepPed;stepPed=function(p,dt){if(p.hold){p.ph+=dt*.5;return}base(p,dt)}}
function pickPed(){if(PED.p||state.task||activeJob())return;let best=null;for(const p of peds){if(p.static||p.x===undefined)continue;const d=Math.hypot(p.x-car.x,p.y-car.y);if(d>12&&d<45&&!inSchool(p.x,p.y,2)){best=p;break}}
  if(!best)return;PED.p=best;best.hold=true;PED.age=0;if(!PED.mark)PED.mark=xMarker("#3fd8ff");PED.mark.visible=true}
function releasePed(){if(PED.p)PED.p.hold=false;PED.p=null;if(PED.mark)PED.mark.visible=false}
function pedJob(){const N=pName(),gassi=!xHas("dog")&&save.pedHelped>=1&&!PED.gassi;
  if(gassi){talkPages("Passantin","vom Tierheim Mönchengladbach",[`Hallo ${N}! Ich arbeite im Tierheim. Das hier ist Krümel, und Krümel muss dringend Gassi gehen.`,`Ich muss aber noch telefonieren. Gehst du eine Runde mit ihm? So 150 Meter reichen.`],()=>{PED.gassi={walked:0,need:150};spawnDog(PED.p.x+1,PED.p.y);toast("🐕 Gassi mit Krümel","Lauf 150 m, Krümel folgt dir","#3ddc84")});talkSeq.last="Klar, los!";talkSeq.later=true;showTalkPage();return}
  if(PED.gassi){if(PED.gassi.walked>=PED.gassi.need){talkPages("Passantin","vom Tierheim Mönchengladbach",[`Krümel hat dich richtig gern, ${N}!`,`Weißt du was? Krümel sucht sowieso ein Zuhause. Er darf ab jetzt bei dir bleiben!`],()=>{PED.gassi=null;save.pedHelped++;giveItem("dog");missionBanner("ok","Neuer Freund","🐕 Krümel läuft jetzt mit dir","Unter 🎁 Extras kannst du ihn zu Hause lassen");releasePed();PED.t=60});talkSeq.last="Danke!";showTalkPage()}
    else toast("Noch ein bisschen Gassi",`${Math.round(PED.gassi.walked)} von ${PED.gassi.need} m`,"#3fd8ff");return}
  const asks=["Entschuldigung, kannst du mir kurz bei einer Rechnung helfen?","Du siehst aus, als ob du rechnen kannst! Ich hänge hier an einer Aufgabe.","Hey! Mein Kind hat mich das gefragt, und ich weiß es nicht mehr …","Hallo! Du gehst doch zur GHS Dohr, oder? Dann kannst du mir sicher helfen."];
  talkPages("Passant","unterwegs in Mönchengladbach",[`${pick(asks)}`],()=>showTask(quickTask("Passant · Hilfe gesucht",{xped:true})));talkSeq.last="Ich helfe!";talkSeq.later=true;showTalkPage()}

/* ---- Hund Krümel ---- */
function makeDog(){const g=new THREE.Group(),fur=xmat("#a0703c"),dk=xmat("#5a3a1e"),add=(geo,m,x,y,z,p=g)=>{const k=new THREE.Mesh(geo,m);k.position.set(x,y,z);k.castShadow=true;p.add(k);return k};
  const body=add(new THREE.SphereGeometry(.2,14,10),fur,0,.36,0);body.scale.set(1.6,.95,.9);
  const head=new THREE.Group();head.position.set(.32,.52,0);g.add(head);add(new THREE.SphereGeometry(.13,14,10),fur,0,0,0,head);
  const sn=add(new THREE.SphereGeometry(.07,10,8),fur,.12,-.04,0,head);sn.scale.set(1.3,.8,.9);add(new THREE.SphereGeometry(.03,8,6),xmat("#1b1b1b"),.21,-.03,0,head);
  for(const s of [1,-1]){const e=add(new THREE.SphereGeometry(.06,8,6),dk,-.02,.06,s*.1,head);e.scale.set(.6,1.4,.5);e.rotation.x=s*.5;add(new THREE.SphereGeometry(.02,6,5),xmat("#111"),.1,.04,s*.055,head)}
  const legs=[];for(const [x,z] of [[.18,.1],[.18,-.1],[-.18,.1],[-.18,-.1]]){const L=new THREE.Group();L.position.set(x,.3,z);g.add(L);add(new THREE.CylinderGeometry(.04,.035,.3,8),fur,0,-.15,0,L);legs.push(L)}
  const tail=new THREE.Group();tail.position.set(-.3,.45,0);g.add(tail);const tl=add(new THREE.CylinderGeometry(.025,.015,.25,6),fur,-.08,.08,0,tail);tl.rotation.z=.9;
  const col=add(new THREE.TorusGeometry(.1,.018,6,14),xmat("#d81e2c"),.24,.44,0);col.rotation.y=Math.PI/2;
  g.userData={legs,tail,head};footShadow(g,.7);scene.add(g);return g}
function spawnDog(x,y){if(!PED.dog){PED.dog=makeDog();PED.dog.userData.p={x,y,a:0,ph:0}}const P=PED.dog.userData.p;P.x=x;P.y=y;PED.dog.visible=true}
function tickDog(dt,now){const on=xOn("dog")||!!PED.gassi;if(!on){if(PED.dog)PED.dog.visible=false;return}
  if(!PED.dog)spawnDog(car.x-1.5,car.y);const g=PED.dog,P=g.userData.p,VH=V();
  const inCar=!["walk","scoot","bike"].includes(VH.id);g.visible=!inCar&&state.mode!=="start";if(inCar){P.x=car.x;P.y=car.y;return}
  const tx=car.x-Math.cos(car.a)*1.4+Math.sin(car.a)*.7,ty=car.y-Math.sin(car.a)*1.4-Math.cos(car.a)*.7,dx=tx-P.x,dy=ty-P.y,d=Math.hypot(dx,dy);
  if(d>30){P.x=tx;P.y=ty}let sp=0;if(d>.5){sp=Math.min(d*2.8,10);const nx=P.x+dx/d*sp*dt,ny=P.y+dy/d*sp*dt;if(!blockedGround(nx,ny)){P.x=nx;P.y=ny}else{P.x+=dx/d*sp*dt*.3;P.y+=dy/d*sp*dt*.3}P.a=Math.atan2(dy,dx)}
  else{const fa=Math.atan2(car.y-P.y,car.x-P.x);P.a+=((fa-P.a+Math.PI*3)%(Math.PI*2)-Math.PI)*Math.min(1,dt*3)}
  P.ph+=dt*(sp*3+2);g.position.set(P.x,groundY(P.x,P.y),P.y);g.rotation.y=-P.a;
  const U=g.userData;U.legs.forEach((L,i)=>L.rotation.z=sp>.3?Math.sin(P.ph+(i%2?0:Math.PI)+(i>1?Math.PI/2:0))*.6:0);U.tail.rotation.x=Math.sin(now/90)*.6;U.head.rotation.z=sp>.3?0:Math.sin(now/700)*.1;
}

/* ---- Zubehör an der Figur ---- */
function dressHuman(hu,rider){if(!hu)return;const h=hu.userData.h;if(hu.userData.acc){for(const o of hu.userData.acc)o.parent&&o.parent.remove(o)}const acc=hu.userData.acc=[];
  const add=(geo,m,p,x,y,z)=>{const k=new THREE.Mesh(geo,m);k.position.set(x,y,z);k.castShadow=true;p.add(k);acc.push(k);return k};
  const cap=xOn("cap"),top=cap?.17:.13;
  if(cap){add(new THREE.SphereGeometry(.115,16,10,0,Math.PI*2,0,Math.PI*.5),xmat("#d81e2c"),h.head,-.005,.035,0).scale.set(1,.85,1);add(new THREE.BoxGeometry(.13,.012,.17),xmat("#a8151f"),h.head,.1,.04,0).rotation.z=-.12}
  if(xOn("glasses")){const m=xmat("#141414");for(const s of [1,-1])add(new THREE.BoxGeometry(.02,.034,.048),m,h.head,.1,.025,s*.036);add(new THREE.BoxGeometry(.012,.008,.03),m,h.head,.104,.032,0);for(const s of [1,-1])add(new THREE.BoxGeometry(.11,.008,.008),m,h.head,.05,.03,s*.062)}
  if(xOn("crown")){const m=xmat("#d4af37",{emissive:"#5a4400"});add(new THREE.CylinderGeometry(.075,.07,.05,14,1,true),m,h.head,-.005,top,0);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;add(new THREE.ConeGeometry(.018,.05,6),m,h.head,-.005+Math.cos(a)*.072,top+.045,Math.sin(a)*.072)}}
  if(xOn("balloon")&&!rider){const g=new THREE.Group();g.position.set(-.05,1.05,.3);hu.add(g);acc.push(g);const b=new THREE.Mesh(new THREE.SphereGeometry(.17,14,12),xmat("#e8202f",{emissive:"#3a0000"}));b.scale.y=1.18;b.position.set(0,1.2,.05);g.add(b);
    const str=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,1.05,4),xmat("#eeeeee"));str.position.set(0,.55,.02);g.add(str);hu.userData.balloon=g}else hu.userData.balloon=null}
function dressAll(){if(walker)dressHuman(walker.userData.hu,false);for(const id of ["scoot","bike","moped"]){const g=vehMeshes[id];if(g&&g.userData.rider)dressHuman(g.userData.rider.userData.hu,true)}}
{const base=applyLook;applyLook=function(l){base(l);dressAll()}}

/* ---- Neon, Hupe, Lack, Film ---- */
const NEON=["#ff2bd6","#2bf0ff","#39ff6a","#ffe12b","#ff5a2b","#7b5cff"];
let neonMesh=null;
function neonTex(){return canvasTex(128,128,c=>{const g=c.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.6,"rgba(255,255,255,.85)");g.addColorStop(1,"rgba(255,255,255,0)");c.fillStyle=g;c.fillRect(0,0,128,128)})}
function tickNeon(){const VH=V(),on=xOn("neon")&&VH.id!=="walk"&&!VH.fly;if(!on){if(neonMesh)neonMesh.visible=false;return}
  if(!neonMesh){neonMesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:neonTex(),transparent:true,depthWrite:false,fog:false}));neonMesh.rotation.x=-Math.PI/2;neonMesh.renderOrder=2;scene.add(neonMesh)}
  const col=NEON[(save.neonCol||0)%NEON.length];if(neonMesh.userData.col!==col){neonMesh.userData.col=col;neonMesh.material.color.set(col);if(window.__lin)neonMesh.material.color.convertSRGBToLinear()}
  const r=VH.r;neonMesh.scale.set(r*5.8,r*3.6,1);neonMesh.position.set(car.x,groundY(car.x,car.y)+.04,car.y);neonMesh.rotation.z=car.a;neonMesh.visible=true;
  neonMesh.material.opacity=.88+Math.sin(performance.now()/260)*.12}
{const base=horn;horn=function(){if(state.mode!=="play")return;
  if(xOn("quack")){[[760,.08],[560,.14]].forEach(([f,d],i)=>setTimeout(()=>beep(f,d,"sawtooth",.05),i*100));state.horn=1.2;return}
  if(xOn("fanfare")){[392,523,659,784,659,784].forEach((f,i)=>setTimeout(()=>beep(f,i===5?.3:.11,"square",.04),i*115));state.horn=1.2;return}
  base()}}
function applyEquip(){xs();if(xHas("gold")&&!PAINTS.includes("#d4af37"))PAINTS.push("#d4af37");
  $("game").style.filter=xOn("film")?"grayscale(1) contrast(1.12) sepia(.18)":"";dressAll()}

/* ---- Easter Eggs: Quietscheentchen ---- */
const DUCKS=[[-331,-146,"im Schulgarten der GHS Dohr"],[-238,24,"im Werkhof"],[-168,14,"am Spielplatz"],[-292,-345,"im Nordpark"],[150,374,"am Markt in Rheydt"],[345,150,"am Wassergraben von Schloss Rheydt"],[112,-396,"am Alten Markt"]].slice(0,6);
let duckMeshes=[];
function makeDuck(){const g=new THREE.Group(),y=xmat("#ffd21f",{emissive:"#4a3a00"}),o=xmat("#ff7a1a");
  const b=new THREE.Mesh(new THREE.SphereGeometry(.16,14,10),y);b.scale.set(1.25,.85,1);b.position.y=.13;g.add(b);
  const h=new THREE.Mesh(new THREE.SphereGeometry(.1,12,10),y);h.position.set(.12,.31,0);g.add(h);
  const k=new THREE.Mesh(new THREE.ConeGeometry(.04,.1,8),o);k.rotation.z=-Math.PI/2;k.position.set(.24,.3,0);k.scale.set(1,1,.6);g.add(k);
  for(const s of [1,-1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.018,6,5),xmat("#111"));e.position.set(.19,.35,s*.05);g.add(e)}
  const t=new THREE.Mesh(new THREE.ConeGeometry(.06,.12,8),y);t.rotation.z=Math.PI/2.6;t.position.set(-.2,.2,0);g.add(t);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.scale.setScalar(1.3);scene.add(g);return g}
function buildEggs(){if(MG.real){SEIL.x=SEIL.y=NaN;if(!XJ.beacon){XJ.beacon=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,40,16,1,true),new THREE.MeshBasicMaterial({color:0x3ddc84,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));XJ.beacon.visible=false;scene.add(XJ.beacon)}for(const G of XG)G.mark=xMarker("#3ddc84");PED.mark=xMarker("#3fd8ff");PED.mark.visible=false;sanitizeJobs();applyEquip();return}
  duckMeshes=DUCKS.map(([x,y,w],i)=>{const p=freeSpot(x,y,false),m=makeDuck();m.position.set(p.x,groundY(p.x,p.y),p.y);m.userData={x:p.x,y:p.y,w,i};m.visible=!xs().ducks.includes(i);return m});
  // Das ägyptische Knotenseil 3-4-5 im Nordpark
  const sp=freeSpot(-246,-300,false);SEIL.x=sp.x;SEIL.y=sp.y;const gy=groundY(sp.x,sp.y)+.05,rope=xmat("#c9a46a"),knot=xmat("#7a5a2e");
  const P=[[0,0],[4,0],[0,3]].map(([a,b])=>[sp.x-1.3+a,sp.y-1+b]);
  for(let k=0;k<3;k++){const A=P[k],B=P[(k+1)%3],L=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.round(L);const m=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,L,6),rope);m.rotation.z=Math.PI/2;m.rotation.y=-Math.atan2(B[1]-A[1],B[0]-A[0]);m.position.set((A[0]+B[0])/2,gy,(A[1]+B[1])/2);scene.add(m);
    for(let j=0;j<n;j++){const kk=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),knot);kk.position.set(A[0]+(B[0]-A[0])*j/n,gy+.02,A[1]+(B[1]-A[1])*j/n);scene.add(kk)}}
  for(const [x,y] of P){const pg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.5,6),xmat("#6b4a2a"));pg.position.set(x,gy+.2,y);scene.add(pg)}
  // UFO hoch über dem Nordpark – nur aus dem Hubschrauber zu entdecken
  const u=new THREE.Group(),met=xmat("#b8c2cc",{emissive:"#202830"});const d=new THREE.Mesh(new THREE.SphereGeometry(6,24,10),met);d.scale.y=.22;u.add(d);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(2.4,18,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0x7ff7ff,transparent:true,opacity:.7,emissive:0x1a5a5a}));dome.position.y=.9;u.add(dome);
  for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.35,8,6),xbasic(i%2?"#39ff6a":"#ff2bd6",{fog:false}));const a=i/8*Math.PI*2;l.position.set(Math.cos(a)*5.4,-.1,Math.sin(a)*5.4);u.add(l)}
  u.position.set(-360,130,-395);scene.add(u);UFO.m=u;
  if(!XJ.beacon){XJ.beacon=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,40,16,1,true),new THREE.MeshBasicMaterial({color:0x3ddc84,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));XJ.beacon.visible=false;scene.add(XJ.beacon)}
  for(const G of XG)if(G.at)buildBooth(G);
  for(const G of XG){G.mark=xMarker("#3ddc84")}
  PED.mark=xMarker("#3fd8ff");PED.mark.visible=false;
  sanitizeJobs();applyEquip()}
function sanitizeJobs(){xs();for(const id in save.jobs){const s=save.jobs[id];if(s.st>0&&!s.done){const S=JOBDEF[id]&&JOBDEF[id].steps[s.st-1];if(!S||S.t==="race"||(S.t==="return"&&S.race))s.st=0}}}
const SEIL={x:0,y:0},UFO={m:null};
const SECRETS={seil:"Das ägyptische Knotenseil",code:"Der Zaubercode",film:"Die Zeitmaschine",ufo:"Besuch aus dem All"};
function findSecret(id,txt){xs();if(save.secrets.includes(id))return;save.secrets.push(id);persist();jingle();confettiBurst(car.x,car.y,90);
  missionBanner("ok","Geheimnis entdeckt",SECRETS[id],`${txt} · ${save.secrets.length} von 4`);
  if(save.secrets.length>=4&&!xHas("crown"))setTimeout(()=>{giveItem("crown");missionBanner("ok","Alle Geheimnisse!","👑 Du bekommst die Krone","Unter 🎁 Extras an- und ausziehen")},4800)}
function tickEggs(dt,now){const VH=V();
  for(const m of duckMeshes){if(!m.visible)continue;m.rotation.y=now/900+m.userData.i;m.position.y=groundY(m.userData.x,m.userData.y)+.05+Math.abs(Math.sin(now/400+m.userData.i))*.12;
    if(state.mode==="play"&&!VH.fly&&Math.hypot(m.userData.x-car.x,m.userData.y-car.y)<1.8){m.visible=false;save.ducks.push(m.userData.i);persist();
      [[900,.06],[700,.1]].forEach(([f,d],i)=>setTimeout(()=>beep(f,d,"sawtooth",.05),i*110));confettiBurst(m.userData.x,m.userData.y,30);
      const n=save.ducks.length;toast(`🦆 Quietscheentchen ${n} von ${DUCKS.length}`,n<DUCKS.length?"Irgendwo in der Stadt sind noch mehr versteckt …":"Alle gefunden!","#ffd21f");
      if(n>=DUCKS.length){save.money+=100;persist();updateHud();setTimeout(()=>{giveItem("quack");missionBanner("ok","Alle Enten gefunden!","🦆 Neue Hupe: Enten-Hupe","+$100 · Drück Q oder die Hupe")},2600)}}}
  if(state.mode==="play"&&!VH.fly&&Math.hypot(SEIL.x-car.x,SEIL.y-car.y)<2.6&&!save.secrets.includes("seil")){findSecret("seil","Mit 12 Knoten und den Seitenlängen 3, 4 und 5 bauten schon die alten Ägypter rechte Winkel");}
  if(UFO.m){UFO.m.rotation.y+=dt*.8;UFO.m.position.y=130+Math.sin(now/900)*3;UFO.m.visible=VH.fly;
    if(state.mode==="play"&&VH.fly&&car.alt>70&&Math.hypot(UFO.m.position.x-car.x,UFO.m.position.z-car.y)<70)findSecret("ufo","Über dem Nordpark schwebt ein UFO. Die Außerirdischen kennen Pythagoras auch!")}}

/* ---- Konfetti ---- */
const CONF={pts:null,n:240,i:0,pos:null,vel:null,life:null,acc:0};
function confInit(){const G=new THREE.BufferGeometry(),n=CONF.n;CONF.pos=new Float32Array(n*3);CONF.vel=new Float32Array(n*3);CONF.life=new Float32Array(n);const col=new Float32Array(n*3),c=new THREE.Color();
  const pal=["#ff2bd6","#ffe12b","#2bf0ff","#39ff6a","#ff5a2b","#ffffff"];for(let i=0;i<n;i++){c.set(pal[i%pal.length]);if(window.__lin)c.convertSRGBToLinear();col.set([c.r,c.g,c.b],i*3);CONF.pos[i*3+1]=-999}
  G.setAttribute("position",new THREE.BufferAttribute(CONF.pos,3));G.setAttribute("color",new THREE.BufferAttribute(col,3));
  CONF.pts=new THREE.Points(G,new THREE.PointsMaterial({size:.16,vertexColors:true,fog:false}));CONF.pts.frustumCulled=false;scene.add(CONF.pts)}
function confettiAt(x,y,z,s){if(!CONF.pts)confInit();const i=CONF.i=(CONF.i+1)%CONF.n;CONF.pos.set([x,y,z],i*3);CONF.vel.set([(Math.random()-.5)*s,Math.random()*s*1.2+1,(Math.random()-.5)*s],i*3);CONF.life[i]=2.2}
function confettiBurst(x,y,n){const gy=groundY(x,y)+1.2;for(let k=0;k<n;k++)confettiAt(x,gy,y,5)}
function tickConfetti(dt){const VH=V();if(xOn("confetti")&&state.mode==="play"){const fast=VH.id==="walk"?Math.abs(car.v)>3.5:(keys.shift&&VH.nitro&&car.nitro>0)||Math.abs(car.v)>VH.max*.8;
    if(fast){CONF.acc+=dt*40;while(CONF.acc>1){CONF.acc--;confettiAt(car.x-Math.cos(car.a)*.8,car.alt+groundY(car.x,car.y)+.6,car.y-Math.sin(car.a)*.8,1.5)}}}
  if(!CONF.pts)return;let any=false;for(let i=0;i<CONF.n;i++){if(CONF.life[i]<=0)continue;any=true;CONF.life[i]-=dt;const k=i*3;CONF.vel[k+1]-=dt*4.5;CONF.vel[k]*=.985;CONF.vel[k+2]*=.985;
    CONF.pos[k]+=CONF.vel[k]*dt;CONF.pos[k+1]+=Math.max(CONF.vel[k+1],-1.2)*dt;CONF.pos[k+2]+=CONF.vel[k+2]*dt;if(CONF.life[i]<=0)CONF.pos[k+1]=-999}
  if(any||CONF.dirty)CONF.pts.geometry.attributes.position.needsUpdate=true;CONF.dirty=any}

/* ---- Rahmen: pro Bild ---- */
{const base=animQuestWorld;animQuestWorld=function(dt,now){base(dt,now);if(!XJ.beacon)return;
  tickNeon();tickDog(dt,now);tickEggs(dt,now);tickConfetti(dt);
  const t=jobTarget();if(t){XJ.beacon.visible=true;XJ.beacon.position.set(t.x,groundY(t.x,t.y)+20,t.y);XJ.beacon.material.opacity=.22+Math.sin(now/300)*.08}else XJ.beacon.visible=false;
  const a=activeJob();for(const G of XG){if(!G.mark)continue;const P=giverPos(G);const j=giverJob(G);G.mark.visible=!!(P&&j&&!a&&!(G.quest&&questLocked(questById(G.quest))));if(G.mark.visible){G.mark.position.set(P.x,groundY(P.x,P.y)+2.6+Math.sin(now/300)*.1,P.y);G.mark.rotation.y=now/600}}
  if(PED.p&&PED.mark){PED.mark.visible=true;PED.mark.position.set(PED.p.x,groundY(PED.p.x,PED.p.y)+2.5+Math.sin(now/280)*.12,PED.p.y);PED.mark.rotation.y=now/500}
  if(walker&&walker.userData.hu.userData.balloon){const b=walker.userData.hu.userData.balloon;b.rotation.x=Math.sin(now/700)*.12-car.v*.012;b.rotation.z=Math.cos(now/900)*.1}}}
{const base=update;update=function(dt){base(dt);if(state.mode!=="play")return;tickJob(dt);
  if(PED.gassi&&V().id==="walk"){PED.gassi.walked+=Math.abs(car.v)*dt;if(PED.gassi.walked>=PED.gassi.need&&!PED.gassi.told){PED.gassi.told=true;toast("🐕 Genug Gassi!","Bring Krümel zurück zur Passantin mit ❓","#3ddc84")}}
  PED.t-=dt;if(PED.t<=0){PED.t=35+Math.random()*25;pickPed()}
  if(PED.p){PED.age+=dt;const d=Math.hypot(PED.p.x-car.x,PED.p.y-car.y);if(!PED.gassi&&(d>90||PED.age>150))releasePed()}}}
{const base=interactables;interactables=function(VH){const L=base(VH);const a=activeJob();
  for(const G of XG){const P=giverPos(G);if(!P||G.talk||G.quest)continue;const j=giverJob(G);
    if(a&&jobGiver(a)===G)continue;
    L.push({x:P.x,y:P.y,r:3.4,label:j?`🔸 ${P.name}: ${JOBDEF[j].title}`:`💬 ${P.name}: Noch eine Rechenfrage?`,act:()=>j?offerJob(j):repeatAsk(G)})}
  if(a){const s=jobState(a),S=stepOf(a);if(S&&S.t==="task")L.push({x:s.tx,y:s.ty,r:4,label:`📝 ${JOBDEF[a].title}: Aufgabe lösen`,act:()=>openJobTask(a)})}
  if(!a)for(const G of XG){if(!G.talk&&!G.quest)continue;const P=giverPos(G),j=P&&giverJob(G);if(!j||(G.quest&&questLocked(questById(G.quest))))continue;
    const it=L.find(e=>Math.abs(e.x-P.x)<.01&&Math.abs(e.y-P.y)<.01);if(it)it.label=`🔸 ${P.name}: ${JOBDEF[j].title}`}
  if(PED.p)L.push({x:PED.p.x,y:PED.p.y,r:3,label:PED.gassi?"🐕 Passantin: Krümel zurückbringen":"❓ Passant: Hilfe anbieten",act:pedJob});
  return L}}
function repeatAsk(G){const P=giverPos(G);talkPages(P.name,P.role,[`Schön, dich zu sehen, ${pName()}! Ich hätte noch eine kleine Rechenfrage. Dafür gibt es 25 $.`],()=>showTask(quickTask(`${P.role} · Rechenfrage`,{xrep:true})));talkSeq.last="Her damit!";talkSeq.later=true;showTalkPage()}
{const base=openTalk;openTalk=function(t){const G=XG.find(G=>G.talk===t.name);if(G){const j=giverJob(G);if(j&&!(activeJob()&&activeJob()!==j)&&!activeJob()){offerJob(j);return}}base(t)}}
{const base=openQuest;openQuest=function(q){const G=XG.find(G=>G.quest===q.id);if(G&&qs(q).done){const j=giverJob(G);if(j&&!activeJob()){offerJob(j);return}}base(q)}}
{const prev=$("bGo").onclick;$("bGo").onclick=()=>{const t=cur;
  if(t&&(t.xjob||t.xrep||t.xped)){$("dlg").hidden=true;state.mode="play";cur=null;
    if(t.xjob){const s=jobState(t.xjob),S=stepOf(t.xjob);if(S&&S.t==="task")advanceJob(t.xjob)}
    else if(t.xrep){save.money+=25;persist();updateHud();toast("+$25","Danke für die Hilfe!","#3ddc84")}
    else if(t.xped){const m=30+Math.round(Math.random()*4)*10;save.money+=m;save.pedHelped++;persist();updateHud();releasePed();PED.t=40;toast(`+$${m}`,`Danke! Du hast schon ${save.pedHelped} Passanten geholfen.`,"#3ddc84");
      if(save.pedHelped>=5&&!xHas("confetti"))setTimeout(()=>{giveItem("confetti");missionBanner("ok","Stadtbekannter Helfer","🎉 Konfetti-Spur freigeschaltet","Beim Rennen und mit Nitro fliegt jetzt Konfetti")},2200)}
    checkLevel();return}
  prev()}}
{const base=goalText;goalText=function(){const a=activeJob();if(a){const S=stepOf(a);if(S)return `🔸 ${JOBDEF[a].title}: ${S.t==="task"?"Aufgabe am Ziel lösen":S.txt}`}
  if(PED.gassi)return `🐕 Gassi mit Krümel: ${Math.min(PED.gassi.need,Math.round(PED.gassi.walked))} von ${PED.gassi.need} m`;return base()}}
{const base=navTarget;navTarget=function(){if(!state.task){const t=jobTarget();if(t)return t;if(PED.gassi&&PED.gassi.walked>=PED.gassi.need&&PED.p)return {x:PED.p.x,y:PED.p.y}}return base()}}
{const base=applySave;applySave=function(d){releasePed();PED.gassi=null;base(d);xs();sanitizeJobs();applyEquip();for(const m of duckMeshes)m.visible=!save.ducks.includes(m.userData.i);$("mission").hidden=true}}

/* ---- Geheime Eingaben ---- */
let codeBuf="";addEventListener("keydown",e=>{if(isTyping(e))return;const k=e.key.toLowerCase();
  if(k==="k"&&!e.repeat&&state.mode==="xtra"){$("xtra").hidden=true;state.mode="play";return}
  if(state.mode!=="play")return;
  if(k==="k"&&!e.repeat){openXtra();return}
  if(k.length===1){codeBuf=(codeBuf+k).slice(-3);if(codeBuf==="345")findSecret("code","Du hast den Zaubercode 3-4-5 eingetippt: 3² + 4² = 5²")}});
function multiTap(el,n,fn){let taps=[];el.style.pointerEvents="auto";el.addEventListener("pointerdown",()=>{if(state.mode!=="play")return;const t=performance.now();taps=taps.filter(x=>t-x<1600);taps.push(t);if(taps.length>=n){taps=[];fn()}})}
multiTap($("clock"),5,()=>{if(!xHas("film")){giveItem("film");findSecret("film","Fünfmal auf die Uhr getippt: Die Stadt ist jetzt ein alter Film. Unter 🎁 Extras wieder ausschalten")}else{save.eq.film=!save.eq.film;persist();applyEquip()}});
multiTap($("stats"),5,()=>findSecret("code","Fünfmal auf deinen Kontostand getippt: a² + b² = c²!"));

/* ---- Extras-Fenster ---- */
(function(){const o=document.createElement("div");o.className="overlay";o.id="xtra";o.hidden=true;
  o.innerHTML=`<div class="card"><button class="close" type="button" id="xtraClose">Schließen ✕</button><span class="tag">Sammlung</span><h2>🎁 Extras und Belohnungen</h2><div id="xtraBody"></div></div>`;document.body.appendChild(o);
  const b=document.createElement("button");b.type="button";b.id="btnXtra";b.textContent="🎁 Extras (K)";$("btnMenu").before(b);b.onclick=()=>{if(state.mode==="play")openXtra()};
  o.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;
    if(t.id==="xtraClose"){o.hidden=true;state.mode="play";return}
    if(t.dataset.eq){const id=t.dataset.eq,it=ITEMS[id];const on=!save.eq[id];if(it.eq==="horn"&&on)for(const k in ITEMS)if(ITEMS[k].eq==="horn")save.eq[k]=false;save.eq[id]=on;persist();applyEquip();if(on&&it.eq==="horn")horn2(id);renderXtra()}
    if(t.dataset.neon!==undefined){save.neonCol=((save.neonCol||0)+1)%NEON.length;persist();renderXtra()}
    if(t.dataset.cancel!==undefined){cancelJob();renderXtra()}})})();
function horn2(id){const was=state.mode;state.mode="play";horn();state.mode=was}
function openXtra(){state.mode="xtra";car.v=0;renderXtra();$("xtra").hidden=false;$("xtraClose").focus()}
function renderXtra(){xs();const a=activeJob();let h="";
  h+=`<p style="margin-top:4px">Belohnungen bekommst du für <b>Nebenmissionen</b> bei Ladenbesitzern (grüne Raute über dem Kopf), für Hilfe an <b>Passanten mit ❓</b> (blaue Raute) und für <b>Geheimnisse</b>, die in der Stadt versteckt sind.</p>`;
  if(a)h+=`<div class="hq"><div class="hqh"><b>🔸 Aktiv: ${JOBDEF[a].title}</b><br><small>${giverPos(jobGiver(a)).name}</small></div><div class="row"><button type="button" data-cancel>Nebenmission abbrechen</button></div></div>`;
  h+=`<div class="xgrid">`+Object.entries(ITEMS).map(([id,it])=>{const has=xHas(id);
    return `<div class="xcard ${has?"":"locked"}"><div class="xi">${has?it.icon:"❔"}</div><b>${has?it.name:"???"}</b><small>${has?it.desc:"Tipp: "+it.hint}</small>${has&&it.eq?`<div class="row"><button type="button" class="${save.eq[id]?"primary":""}" data-eq="${id}">${save.eq[id]?"✓ An":"Aus"}</button>${id==="neon"?`<button type="button" data-neon><i class="nsw" style="background:${NEON[(save.neonCol||0)%NEON.length]}"></i>Farbe</button>`:""}</div>`:""}</div>`}).join("")+`</div>`;
  const jobs=Object.keys(JOBDEF),done=jobs.filter(j=>save.jobs[j]&&save.jobs[j].done).length;
  h+=`<div class="hq"><div class="hqh"><b>Fortschritt</b></div><ul class="chk">
    <li class="${done===jobs.length?"ok":""}">🔸 Nebenmissionen: <b>${done} von ${jobs.length}</b></li>
    <li class="${save.pedHelped>=5?"ok":""}">❓ Passanten geholfen: <b>${save.pedHelped}</b></li>
    <li class="${save.ducks.length>=DUCKS.length?"ok":""}">🦆 Quietscheentchen: <b>${save.ducks.length} von ${DUCKS.length}</b>${save.ducks.length?` <small>(gefunden: ${save.ducks.map(i=>DUCKS[i][2]).join(", ")})</small>`:""}</li>
    <li class="${save.secrets.length>=4?"ok":""}">🔍 Geheimnisse: <b>${save.secrets.length} von 4</b>${save.secrets.length?` <small>(${save.secrets.map(s=>SECRETS[s]).join(", ")})</small>`:""}</li></ul></div>`;
  $("xtraBody").innerHTML=h}
{const tl=document.createElement("button");tl.id="talkLater";tl.type="button";tl.textContent="Später";tl.hidden=true;$("talkClose").after(tl);
  tl.onclick=()=>{talkSeq=null;tl.hidden=true;$("talkClose").textContent="Tschüss";$("talk").hidden=true;state.mode="play"}}
