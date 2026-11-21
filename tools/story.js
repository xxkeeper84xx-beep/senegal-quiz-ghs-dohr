/* ================= Spieler, Startbildschirm, Haupt- und Nebenmissionen, Verkehrsregeln ================= */
/* ---- Spielerprofile: jeder Spieler hat einen eigenen Namen, eine eigene Figur und einen eigenen Spielstand ---- */
const PROF_KEY="pyCityProfiles";
let PROFS=(()=>{try{return JSON.parse(localStorage.getItem(PROF_KEY)||"null")}catch(e){return null}})()||{list:[],last:null};
if(!Array.isArray(PROFS.list))PROFS={list:[],last:null};
let PROF=PROFS.list.find(p=>p.id===PROFS.last)||null;
const saveProfs=()=>{try{localStorage.setItem(PROF_KEY,JSON.stringify(PROFS))}catch(e){}};
const LOOK_DEF={jacket:"#2f4f7a",hair:"#33251c",skin:"#d6a07a",jeans:"#3a4f72",bagCol:"#e2a91c",model:"Noah_Pythagoras"};
const FIG_CHOICES=[["Noah_Pythagoras","Noah"],["01_Schuelerin","Schülerin"],["classic","Klassisch"],["02_Fussballfan","Fußballfan"],["08_Passant","Passant"],["06_Joggerin","Joggerin"],["05_Strassenbauer","Straßenbauer"],["07_Geschaeftsfrau","Geschäftsfrau"],["03_Seniorin","Seniorin"],["04_Senior","Senior"],["Dittmann_Cap","Herr Dittmann"]];
/* Figuren freispielen: am Anfang nur die Schülerfiguren, alle anderen über Spielzeit und gelöste Aufgaben */
const FIG_REQ={"02_Fussballfan":{min:10,tasks:8},"08_Passant":{min:15,tasks:12},"06_Joggerin":{min:20,tasks:18},"05_Strassenbauer":{min:30,tasks:25},"07_Geschaeftsfrau":{min:40,tasks:32},"03_Seniorin":{min:50,tasks:40},"Dittmann_Cap":{min:90,tasks:80,xp:2500},"04_Senior":{min:60,tasks:50}};
const FIG_ICON={Noah_Pythagoras:"🎒","01_Schuelerin":"🎒","02_Fussballfan":"⚽","08_Passant":"🚶","06_Joggerin":"🏃‍♀️","05_Strassenbauer":"🦺","07_Geschaeftsfrau":"💼","03_Seniorin":"👵","04_Senior":"👴",Dittmann_Cap:"🧢",classic:"🧍"};
const figName=id=>(FIG_CHOICES.find(f=>f[0]===id)||[0,id])[1];
const figProgress=s=>({min:Math.floor(((s&&s.playTime)||0)/60),tasks:(s&&s.solved)||0,xp:(s&&s.xp)||0});
function figUnlocked(id,s){const r=FIG_REQ[id];if(!r)return true;const P=figProgress(s);return P.min>=r.min&&P.tasks>=r.tasks&&P.xp>=(r.xp||0)}
function figMissing(id,s){const r=FIG_REQ[id],P=figProgress(s),o=[];if(!r)return "";if(P.min<r.min)o.push(`noch ${r.min-P.min} Min. Spielzeit`);if(P.tasks<r.tasks)o.push(`noch ${r.tasks-P.tasks} gelöste Aufgaben`);if(r.xp&&P.xp<r.xp)o.push(`noch ${r.xp-P.xp} XP`);return o.join(" und ")}
const figSave=()=>TITLE.draft&&TITLE.draft.edit?save:(PROF&&TITLE.view==="figs"?save:{});
const LOOKS={
  jacket:["#2f4f7a","#c0392b","#2e8b57","#f2b81f","#7b3fa0","#1b1b1b","#e8742a","#e05a8c"],
  hair:["#1c1410","#33251c","#6b4226","#b5793a","#e3c27a","#8c2f1a","#9aa0a8"],
  skin:["#f6d5b8","#e9b98f","#d6a07a","#b97c52","#8d5a3b","#5c3b28"],
  jeans:["#3a4f72","#1f2633","#55606e","#6b5a43","#2d3d2a","#7a2633"],
  bagCol:["#e2a91c","#d81e2c","#1b2f6b","#1b1b1b","#3ddc84","#e8742a"]};
const LOOK_NAMES={jacket:"Jacke",hair:"Haare",skin:"Haut",jeans:"Hose",bagCol:"Rucksack"};
const pName=()=>PROF?PROF.name:"du";
const REAL=!!MG.real;   /* echte Karte (Kartenpaket) statt verdichteter Spielkarte */
const qsx=id=>{const q=questById(id);return q?qs(q):{done:false,acc:false,m:{}}};
function normSave(d){const s=Object.assign(freshSave(),d||{});
  const MAP={small:"smart",suv:"prius",sport:"aston"};s.owned=(s.owned||["walk"]).map(id=>MAP[id]||id).filter(id=>VEH[id]);
  if(!s.owned.includes("walk"))s.owned.unshift("walk");s.veh=MAP[s.veh]||s.veh;if(!VEH[s.veh]||!s.owned.includes(s.veh))s.veh="walk";
  s.paint=s.paint||{};s.q=s.q||{};s.recent=s.recent||[];s.hunt=s.hunt||[];s.points=s.points||0;s.fines=s.fines||0;
  if(s.left&&!VEH[s.left.id])s.left=null;return s}
const readSave=id=>{try{return JSON.parse(localStorage.getItem("pyCity:"+id)||"null")}catch(e){return null}};
// Profil schon vor dem Aufbau der Welt laden, damit gelöste Aufträge gleich richtig dargestellt werden
if(PROF){SAVE_KEY="pyCity:"+PROF.id;save=normSave(readSave(PROF.id))}else save=normSave(save);

/* Spielstand eines Profils in die laufende Welt übernehmen (ohne Neuladen der Seite) */
function applySave(d){
  state.task=null;state.transport=null;state.nav=false;$("mission").hidden=true;
  save=normSave(d);
  for(const id in QW)applyEffect(id,qs(questById(id)).done,false);
  for(const id in vehMeshes)applyPaint(id);
  refreshQuestWorld();if(typeof refreshHunt==="function")refreshHunt();
  car.x=startSpot.x;car.y=startSpot.y;car.v=0;car.alt=0;car.vy=0;if(MG.start)car.a=MG.start[2];
  setVehicle(save.veh);state.lvlShown=lvl();updateHud();applyLook();renameQuests();
}
function selectProfile(p){PROF=p;PROFS.last=p.id;p.lastPlayed=Date.now();saveProfs();SAVE_KEY="pyCity:"+p.id;applySave(readSave(p.id))}
function createProfile(name,look){
  const p={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name,look:Object.assign({},look),created:Date.now(),lastPlayed:Date.now()};
  // Der allererste Spieler übernimmt einen schon vorhandenen alten Spielstand
  let d=null;if(!PROFS.list.length){try{d=JSON.parse(localStorage.getItem("pyCity")||"null")}catch(e){}}
  PROFS.list.push(p);PROFS.last=p.id;saveProfs();PROF=p;SAVE_KEY="pyCity:"+p.id;
  applySave(d);persist();return p}
function deleteProfile(id){PROFS.list=PROFS.list.filter(p=>p.id!==id);try{localStorage.removeItem("pyCity:"+id)}catch(e){}
  if(PROFS.last===id){PROFS.last=PROFS.list[0]?PROFS.list[0].id:null;PROF=null;if(PROFS.list[0])selectProfile(PROFS.list[0]);else{SAVE_KEY="pyCity:_gast";applySave(null)}}
  saveProfs()}

/* ---- eigene Spielfigur ---- */
function personFrom(look,bag=true){
  const before=new Set(Object.keys(_hm));
  const w=new THREE.Group(),hu=makeHuman(Object.assign({},look,{bag}));hu.scale.setScalar(10.87);w.add(hu);
  w.userData={hu,legs:[hu.userData.h.L.leg,hu.userData.h.R.leg],arms:[hu.userData.h.L.arm,hu.userData.h.R.arm]};poseHuman(hu,0,0,0);
  if(window.__lin)for(const k of Object.keys(_hm))if(!before.has(k))_hm[k].color.convertSRGBToLinear();
  w.traverse(o=>{if(o.isMesh){o.castShadow=true}});return w}
function applyLook(look){
  if(!walker)return;look=Object.assign({},LOOK_DEF,look||(PROF&&PROF.look)||{});
  const key=JSON.stringify(look);if(walker.userData.lookKey===key)return;
  const nw=personFrom(look);nw.scale.setScalar(.092);footShadow(nw.userData.hu,.9);
  nw.position.copy(walker.position);nw.rotation.copy(walker.rotation);nw.visible=walker.visible;
  scene.remove(walker);walker=nw;walker.userData.lookKey=key;scene.add(walker);vehMeshes.walk=walker;
  for(const id of ["scoot","bike","moped"]){const g=vehMeshes[id];if(!g||!g.userData.rider)continue;const old=g.userData.rider,p=personFrom(look,true);
    p.position.copy(old.position);g.remove(old);g.add(p);g.userData.rider=p;sitHuman(p.userData.hu,id==="scoot"?"stand":id)}
}
/* Die Figuren sprechen den Spieler mit Namen an */
function renameQuests(){for(const q of QUESTS){if(q._intro===undefined)q._intro=q.intro;const N=pName();
  q.intro=!PROF?q._intro:q._intro.startsWith("„Hallo,")?q._intro.replace("„Hallo,",`„Hallo ${N},`):q._intro.replace(/^„/,`„Hallo ${N}! `)}}
{const base=updateHud;updateHud=function(){base();if(PROF){const L=lvl();$("hRank").textContent=`${PROF.name} · ${RANKS[L-1][1]}`}}}

/* ---- Hauptmissionen als Geschichte, alles andere sind Nebenmissionen ---- */
const MAIN=["intro","werkhof","treppe","schulhof","markt"].filter(id=>id==="intro"||QUESTS.some(q=>q.id===id));
const DITT=TALK.find(t=>t.name==="Herr Dittmann");
function mainIdx(){if(!save.introDone)return 0;for(let i=1;i<MAIN.length;i++)if(!qs(questById(MAIN[i])).done)return i;return MAIN.length}
function mainQuest(){const i=mainIdx();return i>0&&i<MAIN.length?questById(MAIN[i]):null}
function isMain(q){return MAIN.includes(q.id)}
function questLocked(q){const i=MAIN.indexOf(q.id),s=qs(q);return i>0&&i>mainIdx()&&!s.acc&&!s.done}
function mainTitle(){const i=mainIdx();return i===0?"Erster Schultag":i>=MAIN.length?"":questById(MAIN[i]).title}
function lockedTalk(q){state.mode="talk";car.v=0;$("tName").textContent=`${q.giver.name} · ${q.giver.role}`;
  $("tSay").textContent=`„Hallo ${pName()}! Bei mir gibt es bald etwas zu tun. Kümmere dich zuerst um deine Hauptmission: ${mainTitle()}.“`;$("talk").hidden=false;$("talkClose").focus()}
{const base=refreshQuestWorld;refreshQuestWorld=function(){base();for(const q of QUESTS)if(questLocked(q))q.mark.visible=false;if(introMark)introMark.visible=!save.introDone}}
let introMark=null;
function buildIntroMark(){if(!DITT)return;const mt=new THREE.MeshBasicMaterial({color:0xffc933,fog:false});if(window.__lin)mt.color.convertSRGBToLinear();const m=new THREE.Mesh(new THREE.OctahedronGeometry(.42,0),mt);
  m.scale.y=1.6;m.position.set(DITT.x,groundY(DITT.x,DITT.y)+2.75,DITT.y);scene.add(m);introMark=m;introMark.visible=!save.introDone}
{const base=animQuestWorld;animQuestWorld=function(dt,now){base(dt,now);if(introMark&&introMark.visible){introMark.rotation.y=now/600;introMark.position.y=groundY(DITT.x,DITT.y)+2.75+Math.sin(now/300)*.12}}}

/* mehrseitige Gespräche */
let talkSeq=null;
function talkPages(name,role,pages,done){talkSeq={pages,i:0,done};state.mode="talk";car.v=0;$("tName").textContent=`${name} · ${role}`;showTalkPage();$("talk").hidden=false;$("talkClose").focus()}
function showTalkPage(){const T=talkSeq;$("tSay").textContent="„"+T.pages[T.i]+"“";$("talkClose").textContent=T.i<T.pages.length-1?"Weiter ▶":(T.last||"Los geht’s!");if($("talkLater"))$("talkLater").hidden=!T.later}
$("talkClose").onclick=()=>{if(talkSeq){if(talkSeq.i<talkSeq.pages.length-1){talkSeq.i++;showTalkPage();return}const d=talkSeq.done;talkSeq=null;$("talkClose").textContent="Tschüss";if($("talkLater"))$("talkLater").hidden=true;$("talk").hidden=true;state.mode="play";d&&d();return}
  $("talk").hidden=true;state.mode="play"};
{const base=openTalk;openTalk=function(t){
  if(t===DITT&&!save.introDone){const N=pName();
    talkPages(t.name,t.role,[
      `Hallo ${N}! Willkommen an der GHS Dohr. Ich bin Herr Dittmann, dein Klassenlehrer in der 9c.`,
      `Diese Woche lernen wir den Satz des Pythagoras – nicht nur im Heft, sondern draußen in Mönchengladbach. Überall stecken rechtwinklige Dreiecke.`,
      `Zwei Regeln, bevor du losziehst: Auf dem Schulgelände wird nicht gefahren. Und mit dem E-Scooter gehörst du auf die Straße, nicht auf den Gehweg. Wer sich nicht daran hält, ist sein Fahrzeug schnell los!`,
      `Deine erste Hauptmission: Herr Maaß, unser Sportlehrer, wartet am Werkhof gleich um die Ecke. Hier hast du 50 $ Taschengeld für den Anfang.`],
      ()=>{save.introDone=true;save.money+=50;save.xp+=10;persist();updateHud();refreshQuestWorld();jingle();
        missionBanner("new","Neue Hauptmission",mainTitle(),"Folge dem Ziel oben auf dem Bildschirm")});return}
  base(t);const s=t.say[t.i];
  if(PROF&&t.i===0)$("tSay").textContent="„"+(s.startsWith("Hallo,")?s.replace("Hallo,",`Hallo ${pName()},`):`Hallo ${pName()}! `+s)+"“"}}
{const base=finishQuest;finishQuest=function(q){const was=qs(q).done;base(q);if(was||!isMain(q))return;
  $("toast").style.opacity=0;missionBanner("ok","Mission erfolgreich",q.title,`+${q.xp} XP · +$${q.money}`);
  setTimeout(()=>{const n=mainQuest();if(n)missionBanner("new","Neue Hauptmission",n.title,`${n.giver.name} · ${n.district}`);
    else if(mainIdx()>=MAIN.length)missionBanner("ok","Alle Hauptmissionen geschafft","Weitere Kapitel folgen","Nebenmissionen findest du im Auftragsheft")},4600)}}

/* großes Missions-Banner in der Bildschirmmitte */
let bannerT=0;
function missionBanner(kind,big,mid,small){const el=$("banner");el.className=kind;
  el.innerHTML=`<b>${big}</b>${mid?`<span>${mid}</span>`:""}${small?`<small>${small}</small>`:""}`;el.hidden=false;el.style.opacity=1;
  if(kind==="ok")[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.16,"triangle",.07),i*130));
  if(kind==="bad")[330,247,165].forEach((f,i)=>setTimeout(()=>beep(f,.22,"sawtooth",.05),i*170));
  if(kind==="new")[440,660].forEach((f,i)=>setTimeout(()=>beep(f,.14,"triangle",.06),i*140));
  clearTimeout(bannerT);bannerT=setTimeout(()=>{el.style.opacity=0;setTimeout(()=>{if(el.style.opacity==="0")el.hidden=true},500)},4000)}

function goalText(){
  if(save.introDone===undefined||!save.introDone){const d=DITT?Math.round(Math.hypot(DITT.x-car.x,DITT.y-car.y)):0;return `⭐ Hauptmission: Sprich mit Herrn Dittmann vor der GHS Dohr${d>6?` · ${d} m`:""}`}
  for(const q of QUESTS){const s=qs(q);if(!s.acc||s.done)continue;
    const m=q.measures.find(m=>!s.m[m.id]),st=isMain(q)?"⭐":"❗";
    return m?`${st} ${q.title}: ${m.short} messen (${m.where})`:`${st} ${q.title}: Sprich mit ${q.giver.name.replace(/^Herr /,"Herrn ")} und rechne`}
  const n=mainQuest();
  if(n){const d=Math.round(Math.hypot(n.giver.x-car.x,n.giver.y-car.y));return `⭐ Hauptmission: ${n.title} · ${n.giver.name}${d>6?`, ${d} m`:""}`}
  return "⭐ Alle Hauptmissionen geschafft · Nebenmissionen im 📒 Auftragsheft";
}
function navTarget(){
  if(state.task)return {x:state.task.x,y:state.task.y};
  if(!save.introDone&&DITT)return {x:DITT.x,y:DITT.y};
  let best=null,bd=1e9;
  for(const q of QUESTS){const s=qs(q);if(s.done||questLocked(q))continue;
    const pts=s.acc&&!allMeasured(q)?q.measures.filter(m=>!s.m[m.id]):[q.giver];
    for(const p of pts){const d=Math.hypot(p.x-car.x,p.y-car.y)+(s.acc?0:5000)+(isMain(q)?0:2000);if(d<bd){bd=d;best=p}}}
  return best;
}
/* Auftragsheft: oben die Geschichte, darunter die Nebenmissionen */
{const base=renderHeft;renderHeft=function(){base();const body=$("heftBody"),kids=[...body.children];
  const hunt=kids[0],qEls=kids.slice(1,1+QUESTS.length),rest=kids.slice(1+QUESTS.length),kurier=rest.pop();
  const H=t=>{const h=document.createElement("h3");h.className="hsec";h.textContent=t;return h};
  body.innerHTML="";body.appendChild(H("⭐ Hauptmissionen"));
  const intro=document.createElement("div");intro.className="hq";
  intro.innerHTML=`<div class="hqh"><b>Erster Schultag</b> ${save.introDone?'<span class="chip done">erledigt</span>':'<span class="chip act">aktiv</span>'}<br><small>Dohr/Torfbend · Herr Dittmann, Klassenlehrer der 9c</small></div><p>${save.introDone?"Herr Dittmann hat dir die Regeln erklärt: nicht auf dem Schulgelände fahren, mit dem E-Scooter nicht auf den Gehweg.":"Sprich mit Herrn Dittmann vor dem Haupteingang der GHS Dohr."}</p>`;
  body.appendChild(intro);
  MAIN.slice(1).forEach((id,k)=>{const q=questById(id),el=qEls[QUESTS.indexOf(q)];
    if(questLocked(q)){el.innerHTML=`<div class="hqh"><b>Kapitel ${k+2}: ???</b> <span class="chip">🔒 gesperrt</span><br><small>${q.district}</small></div><p>Wird frei, sobald du die vorige Hauptmission geschafft hast.</p>`;el.classList.add("soon")}
    else{const b=el.querySelector(".hqh b");if(b)b.textContent=`Kapitel ${k+2}: ${q.title}`}
    body.appendChild(el)});
  if(rest.length){body.appendChild(H("Demnächst in weiteren Stadtteilen"));rest.forEach(e=>body.appendChild(e))}
  body.appendChild(H("Nebenmissionen"));
  QUESTS.forEach((q,i)=>{if(!isMain(q))body.appendChild(qEls[i])});
  body.appendChild(hunt);body.appendChild(kurier);
  const r=document.createElement("div");r.className="hq";
  r.innerHTML=`<div class="hqh"><b>Verkehrsregeln</b> <span class="chip ${save.points?"act":"done"}">${save.points||0} von 3 Verwarnungen</span><br><small>Bei 3 Verwarnungen wird dein Fahrzeug eingezogen</small></div><ul class="chk"><li>🏫 Auf dem Schulgelände wird nicht gefahren.</li><li>🛴 E-Scooter, Roller und Autos nicht auf dem Gehweg.</li><li>🚶 In der Fußgängerzone nur mit dem Fahrrad, und langsam.</li><li>30 Tempo 30 rund um die Schule.</li><li>⚠ Abstand zu Fußgängern halten.</li></ul><p><small>Ohne neuen Verstoß verfällt alle 60 Sekunden eine Verwarnung. Bisher eingezogen: ${save.fines||0}</small></p>`;
  body.appendChild(r)}}

/* ---- Verstöße: wer sich nicht an die Regeln hält, verliert sein Fahrzeug ---- */
const SCHOOL_BOX=[-334,-261.5,-149.8,-63.4];
const SCHOOLS=(MG.schools||[]).map(s=>{const p=s.p,xs=p.filter((_,i)=>i%2===0),ys=p.filter((_,i)=>i%2===1);return {p,b:[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)]}});
function pip(p,x,y){let c=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const xi=p[i],yi=p[i+1],xj=p[j],yj=p[j+1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
const inSchool=(x,y,m=0)=>REAL?SCHOOLS.some(s=>x>s.b[0]-m&&x<s.b[1]+m&&y>s.b[2]-m&&y<s.b[3]+m&&(m>0||pip(s.p,x,y))):(x>SCHOOL_BOX[0]-m&&x<SCHOOL_BOX[1]+m&&y>SCHOOL_BOX[2]-m&&y<SCHOOL_BOX[3]+m);
const RULES={t:0,cool:{},side:0,fast:0,clean:0,road:null};
function offense(kind,txt,sub,pts=1){const C=RULES.cool;if((C[kind]||0)>0)return;C[kind]=kind==="school"?3:kind==="ped"?3:7;
  save.points=(save.points||0)+pts;RULES.clean=0;persist();
  if(save.points>=3){confiscate(kind);return}
  toast(`⚠ ${txt}`,`${sub} · Verwarnung ${save.points} von 3`,"#ff5d6c");beep(196,.25,"square",.05);updateWarn()}
function confiscate(kind){const VH=V();if(VH.id==="walk")return;
  save.owned=save.owned.filter(id=>id!==VH.id);save.points=0;save.fines=(save.fines||0)+1;
  car.v=0;setVehicle("walk");persist();updateWarn();shake=.4;$("toast").style.opacity=0;
  const who=kind==="school"?"von Hausmeister Herrn Ballhorn":"vom Ordnungsamt";
  missionBanner("bad","Erwischt!",`${VH.icon} Dein ${VH.name} ist weg`,`Eingezogen ${who}. Im Autohaus kannst du ein neues Fahrzeug kaufen.`)}
function updateWarn(){const el=$("warn"),p=save.points||0;el.hidden=!p||state.mode!=="play";el.innerHTML=`⚠ ${"●".repeat(p)}${"○".repeat(Math.max(0,3-p))}<small>Verwarnungen</small>`}
function checkRules(dt){
  const VH=V(),R=RULES;for(const k in R.cool)R.cool[k]-=dt;
  if(save.points>0){R.clean+=dt;if(R.clean>60){R.clean=0;save.points--;persist();updateWarn();toast("Verwarnung verfallen",`Noch ${save.points} von 3`,"#3ddc84")}}
  if(VH.id==="walk"||VH.fly)return;
  const sp=Math.abs(car.v),motor=VH.id!=="bike";
  // Schulgelände
  if(inSchool(car.x,car.y)){offense("school","Nicht auf dem Schulgelände fahren!",`Herr Ballhorn hat dich gesehen. Steig ab (${isTouch?"Aussteigen":"X"}) und schieb`,1);return}
  // Gehweg
  const i=gi(car.x,car.y),side=i>=0&&(surf[i]&8)&&!(surf[i]&4);
  R.side=side&&motor&&sp>2.2?R.side+dt:Math.max(0,R.side-dt*2);
  if(R.side>1.2){R.side=0;offense("side",`${VH.id==="scoot"?"E-Scooter":VH.name} auf dem Gehweg!`,"Fahr auf der Straße",1)}
  // Fußgängerzone (Straßenart nur alle 0,25 s prüfen)
  R.t-=dt;if(R.t<=0){R.t=.25;R.road=nearestRoad(car.x,car.y,4)}
  if(R.road&&R.road.e.r.h==="pedestrian"&&(motor||sp>4.5)&&sp>1.2)offense("zone","Fußgängerzone!",motor?"Hier dürfen keine Fahrzeuge fahren":"Mit dem Rad nur im Schritttempo",1);
  // Tempo 30 an der Schule
  R.fast=inSchool(car.x,car.y,70)&&sp*3.6>34?R.fast+dt:0;
  if(R.fast>1){R.fast=0;offense("fast","Tempo 30 vor der Schule!",`Du warst ${Math.round(sp*3.6)} km/h schnell`,1)}
  // Fußgänger
  if(sp>3)for(const p of peds){if(p.x===undefined)continue;if(Math.hypot(p.x-car.x,p.y-car.y)<1.15){offense("ped","Fast einen Fußgänger umgefahren!","Abstand halten",1);break}}
}
{const base=update;let pt=0,fc=0;update=function(dt){base(dt);if(state.mode!=="play")return;checkRules(dt);
  save.playTime=(save.playTime||0)+dt;pt+=dt;if(pt>15){pt=0;persist()}
  fc-=dt;if(fc<=0){fc=3;checkFigUnlocks()}}}
function checkFigUnlocks(){if(!PROF)return;save.figsSeen=save.figsSeen||[];for(const id in FIG_REQ){if(save.figsSeen.includes(id)||!figUnlocked(id,save))continue;
  save.figsSeen.push(id);persist();missionBanner("ok","Neue Figur freigespielt",`${FIG_ICON[id]} ${figName(id)}`,"Im Startmenü unter „Figur ändern“ auswählen");
  if(typeof sms==="function")setTimeout(()=>sms("Mats",`Krass, ${pName()}! Du kannst jetzt als ${figName(id)} spielen. Startmenü → Figur ändern 😎`),4500);break}}

/* ---- Startbildschirm im Stil eines Open-World-Spiels ---- */
const TIPS=["Die Hypotenuse liegt immer gegenüber dem rechten Winkel.","a² + b² = c² gilt nur im rechtwinkligen Dreieck.","Kathete gesucht? Dann rechne c² − a² und ziehe die Wurzel.",
  "Die Hypotenuse ist immer die längste Seite.","3 – 4 – 5 ist das berühmteste pythagoreische Zahlentripel.","Quer über die Wiese ist kürzer als außen herum – warum? Pythagoras!",
  "Ein E-Scooter gehört auf die Straße oder den Radweg, nicht auf den Gehweg.","Auf dem Schulgelände wird nicht gefahren."];
const TITLE={view:"press",cam:"orbit",tip:0,del:null,draft:null,side:1};
function titleHTML(){
  const N=PROF&&PROF.name, multi=PROFS.list.length>0;
  const V2=TITLE.view;let menu="";
  if(V2==="press")menu=`<button class="press" data-t="go" type="button">Tippe, um zu starten</button>`;
  if(V2==="menu"){
    if(PROF)menu+=`<button data-t="play" type="button">Weiterspielen<small>als ${esc(N)} · ${RANKS[lvl()-1][1]} · $${save.money.toLocaleString("de-DE")}</small></button>`;
    else menu+=`<button data-t="new" type="button">Neues Spiel<small>Namen eingeben und Figur gestalten</small></button>`;
    if(multi)menu+=`<button data-t="list" type="button">Spieler wechseln<small>${PROFS.list.length} ${PROFS.list.length===1?"Spieler":"Spieler"} auf diesem Gerät</small></button>`;
    if(PROF)menu+=`<button data-t="new" type="button">Neuer Spieler</button><button data-t="look" type="button">Figur ändern</button>`;
    {const fs=PROF?save:{},n=FIG_CHOICES.filter(f=>figUnlocked(f[0],fs)).length;menu+=`<button data-t="figs" type="button">Figuren<small>${n} von ${FIG_CHOICES.length} freigespielt</small></button>`}
    menu+=`<button data-t="theory" type="button">Theorie</button><button data-t="info" type="button">Steuerung und Orte</button>`}
  if(V2==="list"){menu=`<div class="tpanel"><h3>Wer spielt?</h3>${PROFS.list.map(p=>{const d=readSave(p.id)||{};const xp=d.xp||0;let L=0;RANKS.forEach((r,i)=>{if(xp>=r[0])L=i});
      return `<div class="prow"><button data-t="pick" data-id="${p.id}" type="button"><i style="background:${p.look&&p.look.jacket||LOOK_DEF.jacket}"></i>${esc(p.name)}<small>${RANKS[L][1]} · $${(d.money||0).toLocaleString("de-DE")}</small></button><button class="del" data-t="del" data-id="${p.id}" type="button" aria-label="${esc(p.name)} löschen">${TITLE.del===p.id?"Wirklich löschen?":"✕"}</button></div>`}).join("")}
      <div class="row"><button data-t="new" type="button" class="primary">+ Neuer Spieler</button><button data-t="back" type="button">Zurück</button></div></div>`}
  if(V2==="figs"){const fs=PROF?save:{},P=figProgress(fs);
    menu=`<div class="tpanel fpanel"><h3>Figuren</h3><p class="fsub">Am Anfang spielst du eine Schülerfigur. Die anderen schaltest du mit Spielzeit und gelösten Aufgaben frei.${PROF?` Dein Stand: <b>${P.min} Min.</b> · <b>${P.tasks} Aufgaben</b>`:""}</p>
      <div class="fgrid">${FIG_CHOICES.map(([v,n])=>{const ok=figUnlocked(v,fs),r=FIG_REQ[v],pm=r?Math.min(1,P.min/r.min):1,pt=r?Math.min(1,P.tasks/r.tasks):1;
        return `<button type="button" data-t="fprev" data-v="${v}" class="fcard ${ok?"":"locked"} ${TITLE.figPrev===v?"on":""}"><i>${FIG_ICON[v]||"🧍"}</i><b>${n}</b>${ok?`<small class="ok">✓ ${r?"freigespielt":"von Anfang an"}</small>`:
          `<small>🔒 ${r.min} Min. · ${r.tasks} Aufgaben${r.xp?` · ${r.xp} XP`:""}</small>${r.xp?`<span class="fbar"><em style="width:${Math.min(1,P.xp/r.xp)*100}%;background:linear-gradient(90deg,#FFC44D,#FF7B00)"></em></span>`:""}<span class="fbar"><em style="width:${pm*100}%"></em></span><span class="fbar t"><em style="width:${pt*100}%"></em></span>`}</button>`}).join("")}</div>
      <div class="row"><button data-t="figback" type="button">Zurück</button></div></div>`}
  if(V2==="create"){const D=TITLE.draft;
    menu=`<div class="tpanel"><h3>${D.edit?"Figur ändern":"Neuer Spieler"}</h3>
      <label class="nm">Dein Name<input id="pName" maxlength="16" autocomplete="off" value="${esc(D.name)}" placeholder="Vorname"></label>
      <p class="err" id="pErr"></p>
      <div class="figs"><span>Figur</span>${FIG_CHOICES.map(([v,n])=>{const ok=figUnlocked(v,figSave());return `<button type="button" data-t="fig" data-v="${v}" class="${(D.look.model||LOOK_DEF.model)===v?"on":""} ${ok?"":"locked"}">${ok?"":"🔒 "}${n}</button>`}).join("")}</div>
      ${figUnlocked(D.look.model||LOOK_DEF.model,figSave())?"":`<p class="lockinfo">🔒 ${figName(D.look.model)} ist noch gesperrt: ${figMissing(D.look.model,figSave())}. Du siehst die Figur schon als Vorschau.</p>`}
      ${Object.keys(LOOKS).map(k=>`<div class="sw"><span>${LOOK_NAMES[k]}</span>${LOOKS[k].map(c=>`<button type="button" data-t="sw" data-k="${k}" data-c="${c}" class="${D.look[k]===c?"on":""}" style="background:${c}" aria-label="${LOOK_NAMES[k]} ${c}"></button>`).join("")}</div>`).join("")}
      ${!PROFS.list.length&&hasLegacy()?`<p class="note">Dein bisheriger Spielstand wird für diesen Spieler übernommen.</p>`:""}
      <div class="row"><button class="primary" data-t="ok" type="button">${D.edit?"Speichern":"Los geht’s ▶"}</button>${PROFS.list.length||D.edit?`<button data-t="cancel" type="button">Abbrechen</button>`:""}</div></div>`}
  return `<div class="tlogo"><div class="logo">Pythagoras<span>City</span></div><div class="sub">Mönchengladbach · Mathe Klasse 9</div></div>
    <nav class="menu">${menu}</nav>
    <div class="tfoot"><div class="tip"><b>TIPP</b> <span id="tipTxt">${TIPS[TITLE.tip%TIPS.length]}</span></div><div class="credit">${REAL?'Karte: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" style="color:inherit">© OpenStreetMap-Mitwirkende</a> (ODbL) · Gelände und 3D-Gebäude: Geobasis NRW (dl-de/zero-2-0) · Stadtteile: Stadt Mönchengladbach':"Spielkarte – Wege und Entfernungen vereinfacht · GHS Dohr, Standort Torfbend"}</div></div>`}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hasLegacy=()=>{try{const d=JSON.parse(localStorage.getItem("pyCity")||"null");return !!(d&&(d.xp>0||d.solved>0||d.money>0))}catch(e){return false}};
function renderTitle(){const el=$("title");el.innerHTML=titleHTML();el.dataset.view=TITLE.view;
  TITLE.cam=TITLE.view==="create"||(TITLE.view==="figs"&&TITLE.figPrev)?"creator":"orbit";
  const f=el.querySelector(TITLE.view==="create"?"#pName":"nav button");if(f&&!isTouch)setTimeout(()=>f.focus(),30)}
function showTitle(view){state.mode="start";car.v=0;$("start").hidden=true;$("help").hidden=true;document.body.classList.add("title-on");
  TITLE.view=view||(TITLE.view==="press"?"press":PROF?"menu":"create");if(TITLE.view==="create"&&!TITLE.draft)startCreate(false);
  $("title").hidden=false;renderTitle();updateWarn()}
function hideTitle(){$("title").hidden=true;document.body.classList.remove("title-on");state.mode="play";updateWarn()}
function startCreate(edit){
  TITLE.draft={edit,name:edit&&PROF?PROF.name:"",look:Object.assign({},LOOK_DEF,edit&&PROF?PROF.look:{jacket:pick(LOOKS.jacket),hair:pick(LOOKS.hair),skin:pick(LOOKS.skin)})};
  TITLE.prevVeh=save.veh;if(V().id!=="walk"){save.left=null;car.v=0;const id=save.veh;save.veh="walk";setVehicle("walk");save.veh="walk";TITLE.restoreVeh=id}
  applyLook(TITLE.draft.look);TITLE.ca=car.a;TITLE.view="create"}
function startGame(){hideTitle();beep(440,.08,"triangle");
  if(!save.introDone)setTimeout(()=>missionBanner("new",`Willkommen, ${pName()}!`,"Hauptmission: Erster Schultag","Sprich mit Herrn Dittmann vor der GHS Dohr"),400)}
$("title").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const t=b.dataset.t;beep(660,.04,"triangle",.04);
  if(t==="go"){TITLE.view=PROF?"menu":"create";if(!PROF)startCreate(false);renderTitle()}
  if(t==="play")startGame();
  if(t==="list"){TITLE.view="list";TITLE.del=null;renderTitle()}
  if(t==="back"){TITLE.view=PROF?"menu":PROFS.list.length?"list":"create";renderTitle()}
  if(t==="new"){startCreate(false);renderTitle()}
  if(t==="look"){startCreate(true);renderTitle()}
  if(t==="pick"){const p=PROFS.list.find(p=>p.id===b.dataset.id);if(p){selectProfile(p);TITLE.view="menu";renderTitle()}}
  if(t==="del"){if(TITLE.del===b.dataset.id){deleteProfile(b.dataset.id);TITLE.del=null;TITLE.view=PROFS.list.length?"list":"create";if(!PROFS.list.length)startCreate(false)}else TITLE.del=b.dataset.id;renderTitle()}
  if(t==="theory"){hideTitle();state.mode="start";openHelp()}
  if(t==="info"){$("title").hidden=true;$("start").hidden=false;$("btnStart").textContent="Zurück zum Menü"}
  if(t==="figs"){TITLE.view="figs";TITLE.figPrev=null;renderTitle()}
  if(t==="fprev"){TITLE.figPrev=b.dataset.v;const base=Object.assign({},LOOK_DEF,(PROF&&PROF.look)||{});if(V().id!=="walk"){TITLE.restoreVeh=save.veh;save.left=null;setVehicle("walk")}applyLook(Object.assign(base,{model:b.dataset.v}));TITLE.ca=car.a;renderTitle()}
  if(t==="figback"){TITLE.figPrev=null;applyLook();if(TITLE.restoreVeh&&save.owned.includes(TITLE.restoreVeh))setVehicle(TITLE.restoreVeh);TITLE.restoreVeh=null;TITLE.view=PROF?"menu":"press";renderTitle()}
  if(t==="fig"){TITLE.draft.name=$("pName").value;TITLE.draft.look.model=b.dataset.v;applyLook(TITLE.draft.look);renderTitle()}
  if(t==="sw"){TITLE.draft.name=$("pName").value;TITLE.draft.look[b.dataset.k]=b.dataset.c;applyLook(TITLE.draft.look);renderTitle()}
  if(t==="cancel"){const D=TITLE.draft;TITLE.draft=null;applyLook();if(TITLE.restoreVeh&&save.owned.includes(TITLE.restoreVeh)){setVehicle(TITLE.restoreVeh)}TITLE.restoreVeh=null;TITLE.view=PROF?"menu":"list";renderTitle()}
  if(t==="ok")submitCreate();
});
$("title").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="pName"){e.preventDefault();submitCreate()}});
$("title").addEventListener("input",e=>{if(e.target.id==="pName"&&TITLE.draft){TITLE.draft.name=e.target.value;$("pErr").textContent=""}});
function submitCreate(){const D=TITLE.draft,n=($("pName").value||"").trim().replace(/\s+/g," ");
  if(n.length<2){$("pErr").textContent="Bitte gib deinen Namen ein (mindestens 2 Buchstaben).";$("pName").focus();return}
  if(!/^[\p{L}][\p{L} .'-]*$/u.test(n)){$("pErr").textContent="Bitte nur Buchstaben verwenden.";$("pName").focus();return}
  if(!figUnlocked(D.look.model||LOOK_DEF.model,figSave())){$("pErr").textContent=`${figName(D.look.model)} ist noch gesperrt (${figMissing(D.look.model,figSave())}). Wähle eine freie Figur.`;return}
  if(!D.edit&&PROFS.list.some(p=>p.name.toLowerCase()===n.toLowerCase())){$("pErr").textContent="Diesen Namen gibt es schon. Wähle ihn unter „Spieler wechseln“.";return}
  if(D.edit&&PROF){PROF.name=n;PROF.look=Object.assign({},D.look);saveProfs();applyLook(PROF.look);renameQuests();updateHud();
    if(TITLE.restoreVeh&&save.owned.includes(TITLE.restoreVeh))setVehicle(TITLE.restoreVeh);TITLE.restoreVeh=null;TITLE.draft=null;TITLE.view="menu";renderTitle();return}
  TITLE.restoreVeh=null;createProfile(n,D.look);TITLE.draft=null;startGame()}
setInterval(()=>{if($("title").hidden)return;TITLE.tip++;const t=$("tipTxt");if(t){t.style.opacity=0;setTimeout(()=>{t.textContent=TIPS[TITLE.tip%TIPS.length];t.style.opacity=1},350)}},6500);
/* Kamera: langsamer Flug um die Schule, im Figuren-Editor nah an der Figur */
{const base=updateCamera;updateCamera=function(dt,VH){
  if(state.mode!=="start"||$("title").hidden)return base(dt,VH);
  const t=performance.now()/1000;
  if(TITLE.cam==="creator"){const ca=TITLE.ca??car.a;car.a=ca+Math.sin(t*.7)*.55;const gy=groundY(car.x,car.y),wide=innerWidth>innerHeight*1.15,d=wide?3.6:4.3;
    const cx=car.x+Math.cos(ca)*d,cz=car.y+Math.sin(ca)*d,rx=-Math.sin(ca),rz=Math.cos(ca),off=wide?TITLE.side*1.15:0;
    _cv.set(cx,gy+1.35,cz);camPos.lerp(_cv,Math.min(1,dt*4));camera.position.copy(camPos);camera.lookAt(car.x+rx*off,gy+(wide?.95:.8),car.y+rz*off);
  }else{const a=t*.04,C=REAL?[MG.start[0],MG.start[1]]:[-292,-104];_cv.set(C[0]+Math.cos(a)*120,58+Math.sin(t*.13)*6,C[1]+Math.sin(a)*120);camPos.lerp(_cv,Math.min(1,dt*1.5));camera.position.copy(camPos);camera.lookAt(C[0],2,C[1])}
  if(Math.abs(camera.fov-50)>.05){camera.fov=50;camera.updateProjectionMatrix()}
  if(skyDome)skyDome.position.copy(camera.position)}}
/* alte Start-Knöpfe führen jetzt zurück ins Menü */
$("btnStart").onclick=()=>{$("start").hidden=true;showTitle(PROF?"menu":"create")};
$("btnStart").textContent="Zurück zum Menü";
$("btnMenu").onclick=()=>{if(state.mode==="play")showTitle("menu")};
$("btnReset").textContent="Spielstand dieses Spielers löschen";
$("btnReset").onclick=()=>{if(!PROF)return;applySave(null);persist();$("resetMsg").textContent=`Spielstand von ${PROF.name} gelöscht. Es geht wieder beim ersten Schultag los.`};
function closeHelp(){$("help").hidden=true;if(state.prev==="start"||state.mode==="start"){showTitle(PROF?"menu":"create")}else state.mode="play"}
$("helpClose").onclick=closeHelp;
addEventListener("keydown",e=>{if(!$("title").hidden&&TITLE.view==="press"&&!isTyping(e)){e.preventDefault();TITLE.view=PROF?"menu":"create";if(!PROF)startCreate(false);renderTitle()}});
