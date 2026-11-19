import sys
src, quests, out = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding="utf-8").read()
fails = []


def R(a, b, cnt=1):
    global s
    if s.count(a) != cnt:
        fails.append((s.count(a), a[:90]))
        return
    s = s.replace(a, b)


# ---------------------------------------------------------------- CSS
R(".credit{font-size:12px;color:#56609a}", """.credit{font-size:12px;color:#56609a}
.mlist{display:grid;gap:6px;margin:4px 0 10px}
.mlist div{background:#fff;border-radius:10px;padding:8px 10px;box-shadow:inset 0 0 0 1.5px #d4d9f3;font-size:14px}
.mlist div.ok{box-shadow:inset 0 0 0 2px #14874a}
.mlist small{color:#56609a}
#qMark{font-size:13.5px;line-height:1.5;margin-top:8px;color:#3a4270}
.svgbox .hit{cursor:pointer}
.hq{background:#fff;border-radius:12px;padding:12px 14px;box-shadow:inset 0 0 0 1.5px #d4d9f3;margin-top:10px}
.hq.soon{opacity:.7}
.hq p{font-size:14px}
.chip{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:#e3e7fb;color:#3a4270;vertical-align:middle}
.chip.act{background:#ffe9a8;color:#5a4300}.chip.done{background:#c9f0d8;color:#0f5c33}
.chk{list-style:none;padding:0;margin:8px 0;display:grid;gap:4px;font-size:14px}
.chk li.ok{color:#0f5c33}
.chk small,.hq small{color:#56609a}
details summary{cursor:pointer;font-weight:700;margin-top:6px}
#bigmap{width:auto;max-width:100%;height:auto;max-height:calc(100vh - 230px);margin:0 auto;border-radius:12px;display:block;background:#262b40}
.mapnote{font-size:13px;color:#56609a;margin-top:8px}
#talk .card{max-width:520px}""")
R("#topbtns{position:fixed;z-index:6;left:calc(12px + env(safe-area-inset-left,0px));top:calc(150px + env(safe-area-inset-top,0px));display:flex;gap:8px;flex-wrap:wrap;max-width:300px}",
  "#topbtns{position:fixed;z-index:6;left:calc(12px + env(safe-area-inset-left,0px));top:calc(150px + env(safe-area-inset-top,0px));display:flex;gap:6px;flex-wrap:wrap;max-width:330px}")
R("#topbtns button{padding:8px 12px;font-size:13px;background:var(--panel)}", "#topbtns button{padding:8px 10px;font-size:13px;background:var(--panel)}")

# ---------------------------------------------------------------- HTML
R('''  <button id="btnGarage" type="button">🔑 Garage (G)</button>''', '''  <button id="btnHeft" type="button">📒 Auftragsheft (J)</button>
  <button id="btnMap" type="button">🗺️ Karte (M)</button>
  <button id="btnNav" type="button">🧭 Weg (N)</button>
  <button id="btnGarage" type="button">🔑 Garage (G)</button>
  <button id="btnMusic" type="button">🎵 Musik</button>''')
R('''<span id="loadMsg">Mönchengladbach wird gebaut …</span><small id="loadSub">Straßen, Häuser und Parks aus OpenStreetMap</small>''',
  '''<span id="loadMsg">Mönchengladbach wird gebaut …</span><small id="loadSub">Spielkarte wird geladen</small>''')
R('''    <span class="tag">3D-Open-World · Mönchengladbach · Mathe Klasse 8/9</span>''', '''    <span class="tag">3D-Open-World · Mönchengladbach · Mathe Klasse 9</span>''')
R('''Du stehst am <b>Mönchengladbacher Hauptbahnhof</b> und hast noch kein Fahrzeug. Feuerwache, Baustelle, Taxistand, Rathaus und Luftrettung brauchen jemanden, der <b>rechnen</b> kann. Lauf zu den Lichtsäulen, löse die Pythagoras-Aufgabe und liefere pünktlich ab. Mit dem Geld kaufst du im <b>Autohaus 🚘</b> E-Scooter, Fahrrad, Roller und Autos. Ganz am Ende wartet der <b>Hubschrauber</b>.''',
  '''Du startest in <b>Dohr</b> auf dem Gehweg vor der <b>GHS Dohr</b> am Torfbend. Du entscheidest selbst: die Gegend erkunden oder zum <b>Werkhof</b> um die Ecke gehen, wo Sportlehrer Herr Maaß deine Hilfe braucht. Für Aufträge nimmst du Maße an den 📏-Punkten auf und rechnest mit Pythagoras. Gelöste Aufträge verändern die Stadt. Mit verdientem Geld kaufst du im <b>Autohaus 🚘</b> Fahrzeuge, vom E-Scooter bis zum Hubschrauber.''')
R('''          <kbd>V · G · H</kbd><span>Kamera · Garage · Theorie</span>''', '''          <kbd>J · M · N</kbd><span>Auftragsheft · Karte · Wegmarkierung</span>
          <kbd>V · G · H</kbd><span>Kamera · Garage · Theorie</span>''')
R('''<p class="credit">Kartendaten © OpenStreetMap-Mitwirkende (ODbL). Gebäudehöhen teils geschätzt.</p>''',
  '''<p class="credit">Spielkarte – Wege und Entfernungen vereinfacht. Ortsnamen sind echt, alle Maße in den Aufgaben sind Werte für das Spielmodell.</p>''')
R('''<div class="overlay" id="shop" hidden>''', '''<div class="overlay" id="qdlg" hidden>
  <div class="card">
    <span class="tag" id="qTag"></span>
    <h2 id="qTitle"></h2>
    <div class="dgrid">
      <div id="qSketchBox"><div class="svgbox" id="qSketch"></div><div id="qMark"></div></div>
      <div id="qBody"></div>
    </div>
  </div>
</div>

<div class="overlay" id="heft" hidden>
  <div class="card">
    <button class="close" type="button" id="heftClose">Schließen ✕</button>
    <span class="tag">Auftragsheft</span>
    <h2>Deine Aufträge</h2>
    <div class="row"><button type="button" id="heftNav">🧭 Weg zeigen</button></div>
    <div id="heftBody"></div>
  </div>
</div>

<div class="overlay" id="talk" hidden>
  <div class="card">
    <span class="tag" id="tName"></span>
    <p id="tSay" style="font-size:17px;margin-top:12px"></p>
    <div class="row"><button class="primary" type="button" id="talkClose">Tschüss</button></div>
  </div>
</div>

<div class="overlay" id="mapdlg" hidden>
  <div class="card">
    <button class="close" type="button" id="mapClose">Schließen ✕</button>
    <span class="tag">Spielkarte</span>
    <h2>Mönchengladbach</h2>
    <canvas id="bigmap" width="1040" height="960"></canvas>
    <p class="mapnote"><b>Spielkarte – Wege und Entfernungen vereinfacht.</b> ❗ Auftrag · ✓ erledigt · 🔒 folgt später · Pfeil = du</p>
  </div>
</div>

<div class="overlay" id="shop" hidden>''')

# ---------------------------------------------------------------- Spielstand, Start, Orte
R('''try{const s=JSON.parse(localStorage.getItem("pyCityMG")||"null");if(s)save=Object.assign(save,s)}catch(e){}''',
  '''try{const s=JSON.parse(localStorage.getItem("pyCity")||"null");if(s)save=Object.assign(save,s)}catch(e){}
{const MAP={small:"smart",suv:"prius",sport:"aston"};save.owned=(save.owned||["walk"]).map(id=>MAP[id]||id);save.veh=MAP[save.veh]||save.veh}''')
R('''const persist=()=>{try{localStorage.setItem("pyCityMG",JSON.stringify(save))}catch(e){}};''', '''const persist=()=>{try{localStorage.setItem("pyCity",JSON.stringify(save))}catch(e){}};''')
R('''const state={mode:"loading",time:15*60,task:null,cam:0};''', '''const state={mode:"loading",time:14.5*60,task:null,cam:0,nav:false,transport:null};''')
R('''let nearGiver=null, cur=null,''', '''let nearGiver=null, nearIt=null, lastDistrict="", cur=null,''')
R('''const startSpot=spotNear(station.x-70,station.y,e=>(e.r.c||e.r.h==="pedestrian")&&!!e.r.n&&!e.r.tu);''',
  '''const startSpot=MG.start?{x:MG.start[0],y:MG.start[1]}:spotNear(station.x-70,station.y,e=>(e.r.c||e.r.h==="pedestrian")&&!!e.r.n&&!e.r.tu);''')
R('''{const r=nearestRoad(car.x,car.y,80);if(r)car.a=Math.atan2(r.dy,r.dx)}''', '''{const r=nearestRoad(car.x,car.y,80);if(MG.start)car.a=MG.start[2];else if(r)car.a=Math.atan2(r.dy,r.dx)}''')
R('''for(const g of GIVERS){const p=g.poi();g.poiName=p&&p.n||"";const s=spotNear(p.x,p.y);g.x=s.x;g.y=s.y}''',
  '''for(const g of GIVERS){const o=MG.givers&&MG.givers[g.id];if(o){g.poiName=o[2]||"";g.x=o[0];g.y=o[1];continue}const p=g.poi();g.poiName=p&&p.n||"";const s=spotNear(p.x,p.y);g.x=s.x;g.y=s.y}''')
R('''const parkArea=(MG.areas||[]).filter(a=>a.n&&/bunter garten/i.test(a.n))''', '''const parkArea=(MG.areas||[]).find(a=>a.quest)||(MG.areas||[]).filter(a=>a.n&&/bunter garten/i.test(a.n))''')
R('''story:`Auf der Großbaustelle der Seestadt hinter dem Hauptbahnhof hält''', '''story:`Auf der Baustelle am Trainingsgelände hält''')
R('''schwebt <b>${fmt(a)} m</b> hoch über der Klinik.''', '''schwebt <b>${fmt(a)} m</b> hoch über dem Übungsplatz.''')

# ---------------------------------------------------------------- Raster: feste Hindernisse + Gehwege
R('''const hgt=new Uint8Array(GW*GH), surf=new Uint8Array(GW*GH); // surf: 1 Grün, 2 Wasser, 4 Straße''',
  '''const hgt=new Uint8Array(GW*GH), surf=new Uint8Array(GW*GH), solid=new Uint8Array(GW*GH); // surf: 1 Grün, 2 Wasser, 4 Straße, 8 Gehweg
const ROAD_Y=.12, SIDE_Y=.27, BASE_Y=.06;''')
R('''  g.fillStyle="#000";g.fillRect(0,0,GW,GH);g.globalCompositeOperation="lighten";
  for(const b of MG.buildings){if(b.m>2.5)continue;const v=Math.min(250,Math.round(b.h));g.fillStyle=`rgb(${v},${v},${v})`;path(b.p);g.fill()}
  d=g.getImageData(0,0,GW,GH).data;
  for(let i=0,n=GW*GH;i<n;i++)hgt[i]=d[i*4]>1?d[i*4]:0;''',
  '''  g.fillStyle="#000";g.fillRect(0,0,GW,GH);g.strokeStyle="#fff";
  for(const r of roads){if(r.tu||!r.c||r.h==="service")continue;g.lineWidth=r.w+5;g.beginPath();r.i.forEach((n,k)=>{const x=nx(n)+HX,y=ny(n)+HY;k?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()}
  d=g.getImageData(0,0,GW,GH).data;
  for(let i=0,n=GW*GH;i<n;i++)if(d[i*4]>110&&!(surf[i]&4))surf[i]|=8;
  g.fillStyle="#000";g.fillRect(0,0,GW,GH);g.globalCompositeOperation="lighten";
  for(const b of MG.buildings){if(b.m>2.5)continue;const v=Math.min(250,Math.round(b.h));g.fillStyle=`rgb(${v},255,0)`;path(b.p);g.fill();g.strokeStyle="rgb(0,255,0)";g.lineWidth=.9;g.stroke()}
  d=g.getImageData(0,0,GW,GH).data;
  for(let i=0,n=GW*GH;i<n;i++){hgt[i]=d[i*4]>1?d[i*4]:0;solid[i]=d[i*4+1]>70?1:0}''')
R('''const blockedGround=(x,y)=>{const i=gi(x,y);return i<0||hgt[i]>0||(surf[i]&6)===2};''',
  '''const blockedGround=(x,y)=>{const i=gi(x,y);return i<0||solid[i]>0||(surf[i]&6)===2};
const groundY=(x,y)=>{const i=gi(x,y);if(i<0)return 0;const s=surf[i];return s&4?ROAD_Y:s&8?SIDE_Y:BASE_Y};''')

# ---------------------------------------------------------------- Verkehr: wenige Autos, Radfahrende, stehende Marktbesucher
R('''const NPC_N=isTouch?24:44, PED_N=isTouch?50:110;''', '''const SK=!!MG.spielkarte, NPC_N=SK?(isTouch?8:12):(isTouch?24:44), PED_N=SK?(isTouch?14:24):(isTouch?50:110), BIKE_N=SK?(isTouch?3:4):0;''')
R('''for(let i=0;i<NPC_N;i++){const n={col:pick(NPC_COLS),sp:rnd(7,12),v:0,ang:0};placeAgent(n,carEdges,car.x,car.y,30,600,true);npcs.push(n)}''',
  '''for(let i=0;i<NPC_N;i++){const bike=i<BIKE_N,n={col:bike?pick(["#22a39a","#d8452e","#2d5fa8","#e0a43a"]):pick(NPC_COLS),sp:bike?rnd(4,5.5):rnd(7,11),v:0,ang:0,bike};placeAgent(n,carEdges,car.x,car.y,30,600,true);npcs.push(n)}''')
R('''for(let i=0;i<PED_N;i++){const p={sp:rnd(1.1,1.6),side:Math.random()<.5?1:-1,ox:0,oy:0,ph:Math.random()*6,col:pick(["#c0392b","#2c3e50","#f1c40f","#8e44ad","#16a085","#d35400","#ecf0f1","#34495e","#27ae60","#8b5a2b"])};placeAgent(p,walkEdges,car.x,car.y,5,350,false);peds.push(p)}''',
  '''const PED_COLS=["#c0392b","#2c3e50","#f1c40f","#8e44ad","#16a085","#d35400","#ecf0f1","#34495e","#27ae60","#8b5a2b"];
for(let i=0;i<PED_N;i++){const p={sp:rnd(1.1,1.6),side:Math.random()<.5?1:-1,ox:0,oy:0,ph:Math.random()*6,col:pick(PED_COLS)};placeAgent(p,walkEdges,car.x,car.y,5,350,false);peds.push(p)}
if(MG.q&&MG.q.markt){const mk=MG.q.markt;for(const f of mk.fixed.concat(mk.stalls.slice(0,3)))for(let k=0;k<2;k++)peds.push({static:true,x:f[0]-1+k*2+rnd(-.4,.4),y:f[1]+2.2+rnd(-.3,.6),a:-Math.PI/2+rnd(-.5,.5),ox:0,oy:0,ph:0,col:pick(PED_COLS)})}''')
R('''  const P=agentPos(n,laneOff(n.e)); n.x=P.x;n.y=P.y;''', '''  const P=agentPos(n,n.bike?n.e.r.w/2-.9:laneOff(n.e)); n.x=P.x;n.y=P.y;''')
R('''function stepPed(p,dt){
  p.s+=p.sp*dt;''', '''function stepPed(p,dt){
  if(p.static){const dx=p.x-car.x,dy=p.y-car.y,d=Math.hypot(dx,dy);if(d<1.2&&d>0){p.x+=dx/d*dt*2;p.y+=dy/d*dt*2}return}
  p.s+=p.sp*dt;''')

# ---------------------------------------------------------------- Eingabe
R('''  if((k==="e"||k==="enter")&&state.mode==="play"&&nearGiver)openMission(nearGiver);''', '''  if((k==="e"||k==="enter")&&state.mode==="play"&&nearIt){e.preventDefault();nearIt.act()}
  if(k==="j"&&!e.repeat){if(state.mode==="play")openHeft();else if(state.mode==="heft")closeHeft()}
  if(k==="m"&&!e.repeat){if(state.mode==="play")openMap();else if(state.mode==="map")closeMap()}
  if(k==="n"&&!e.repeat&&state.mode==="play")toggleNav();''')
R('''  if(k==="escape"){if(state.mode==="shop")closeShop();''', '''  if(k==="escape"){if(state.mode==="quest")closeQuest();else if(state.mode==="heft")closeHeft();else if(state.mode==="map")closeMap();else if(state.mode==="talk")$("talkClose").click();else if(state.mode==="shop")closeShop();''')
R('''$("prompt").addEventListener("pointerdown",e=>{e.preventDefault();if(nearGiver&&state.mode==="play")openMission(nearGiver)});''',
  '''$("prompt").addEventListener("pointerdown",e=>{e.preventDefault();if(nearIt&&state.mode==="play")nearIt.act()});
$("btnHeft").onclick=()=>{if(state.mode==="play")openHeft()};
$("btnMap").onclick=()=>{if(state.mode==="play")openMap()};
$("btnNav").onclick=()=>toggleNav();
$("btnMusic").onclick=()=>toggleMusic();
function toggleNav(){state.nav=!state.nav;toast("Wegmarkierung",state.nav?(navTarget()?"an: Pfeil und Linien zeigen zum nächsten Ziel":"an, aber gerade gibt es kein Ziel"):"aus","#3fd8ff")}
function interactables(VH){const L=[];
  for(const g of GIVERS){if(state.task&&g.id!=="shop")continue;L.push({x:g.x,y:g.y,r:VH.fly?14:7,label:`${g.icon} ${g.id==="shop"?"Autohaus betreten":"Kurier-Auftrag: "+g.name}`,act:()=>openMission(g)})}
  for(const q of QUESTS){const s=qs(q);L.push({x:q.giver.x,y:q.giver.y,r:4.2,label:`${s.done?"✓":"❗"} ${q.giver.name}: ${s.done?"Rechenweg ansehen":s.acc?(allMeasured(q)?"Skizze und Rechnung":"Skizze ansehen"):q.title}`,act:()=>openQuest(q)});
    if(s.acc&&!s.done)for(const m of q.measures)if(!s.m[m.id])L.push({x:m.x,y:m.y,r:3,label:`📏 Messen: ${m.short}`,act:()=>measure(q,m)})}
  for(const t of TALK)L.push({x:t.x,y:t.y,r:3,label:`💬 ${t.name} ansprechen`,act:()=>openTalk(t)});
  return L}''')

# ---------------------------------------------------------------- Physik
R('''  state.time=(state.time+dt*4)%1440; if(state.horn>0)state.horn-=dt;''', '''  if(state.horn>0)state.horn-=dt; // ruhige Tageslichtszene: die Uhr bleibt am Nachmittag stehen''')
R('''    for(const n of npcs){if(n.x===undefined)continue;const dx=car.x-n.x,dy=car.y-n.y,d=Math.hypot(dx,dy),rr=car.r+1.7;''',
  '''    car.alt+=(groundY(car.x,car.y)-car.alt)*Math.min(1,dt*10);
    for(const n of npcs.concat(parkedList)){if(n.x===undefined)continue;const dx=car.x-n.x,dy=car.y-n.y,d=Math.hypot(dx,dy),rr=car.r+(n.bike?.8:1.7);''')
R('''  nearGiver=null;
  const low=!VH.fly||car.alt-heightAt(car.x,car.y)<4;
  if(low)for(const g of GIVERS){if(state.task&&g.id!=="shop")continue;if(Math.hypot(g.x-car.x,g.y-car.y)<(VH.fly?14:7)){nearGiver=g;break}}
  const pr=$("prompt");
  if(nearGiver&&state.mode==="play"){pr.hidden=false;pr.innerHTML=`<kbd>${isTouch?"Tippen":"E"}</kbd>${nearGiver.icon} ${nearGiver.id==="shop"?"Autohaus betreten":"Auftrag: "+nearGiver.name}`}else pr.hidden=true;''',
  '''  nearIt=null;
  const low=!VH.fly||car.alt-heightAt(car.x,car.y)<4;
  if(low){let bd=1e9;for(const it of interactables(VH)){const d=Math.hypot(it.x-car.x,it.y-car.y);if(d<it.r&&d<bd){bd=d;nearIt=it}}}
  const pr=$("prompt");
  if(nearIt&&state.mode==="play"){pr.hidden=false;pr.innerHTML=`<kbd>${isTouch?"Tippen":"E"}</kbd>${nearIt.label}`}else pr.hidden=true;
  stepTransport(dt);''')
R('''  streetT-=dt; if(streetT<=0){streetT=.3;const r=nearestRoad(car.x,car.y,30,e=>e.r.n);streetName=r?r.e.r.n:"";if(streetName&&streetName!==lastStreet&&!VH.fly){lastStreet=streetName;showStreet(streetName)}}''',
  '''  streetT-=dt; if(streetT<=0){streetT=.3;const r=nearestRoad(car.x,car.y,30,e=>e.r.n);streetName=r?r.e.r.n:"";
    const dd=districtAt(car.x,car.y),dn=dd?dd.n:"";
    if(dn&&dn!==lastDistrict){lastDistrict=dn;lastStreet=streetName;showPlace("Stadtteil",dn)}
    else if(streetName&&streetName!==lastStreet&&!VH.fly){lastStreet=streetName;showPlace("Straße",streetName)}
    if(!dn)lastDistrict=""}''')
R('''function showStreet(n){const el=$("district");el.innerHTML=`<small>Du bist auf</small>${n}`;''', '''function showPlace(k,n){const el=$("district");el.innerHTML=`<small>${k}</small>${n}`;''')

# ---------------------------------------------------------------- 3D: Licht, Schatten, Fassadenarten
R('''renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isTouch?1:1.5));
renderer.shadowMap.enabled=!isTouch;''', '''renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isTouch?1.25:1.5));
renderer.shadowMap.enabled=true;''')
R('''sun.castShadow=!isTouch; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-110,right:110,top:110,bottom:-110,near:5,far:900}); sun.shadow.bias=-.0005;''',
  '''sun.castShadow=true; sun.shadow.mapSize.set(isTouch?1024:2048,isTouch?1024:2048); sun.shadow.radius=2.5;
Object.assign(sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:5,far:600}); sun.shadow.bias=-.0006; sun.shadow.normalBias=.03;''')
s = s.replace("castShadow=!isTouch", "castShadow=true").replace("m.castShadow=sh&&!isTouch", "m.castShadow=sh").replace(".mesh(facadeMats[k.split(\"|\")[0]],!isTouch,true)", ".mesh(facadeMats[k.split(\"|\")[0]],true,true)")
R('''  c.fillStyle="#fff";c.fillRect(0,0,512,512);noise(c,512,512,7000,["rgba(0,0,0,.06)","rgba(255,255,255,.4)","rgba(0,0,0,.03)"]);
  if(kind==="brick")''', '''  if(kind==="fence"){c.fillStyle="#fff";for(let x=0;x<512;x+=4)c.fillRect(x,0,1,512);c.fillRect(0,476,512,4);c.fillRect(0,505,512,4);return}
  c.fillStyle="#fff";c.fillRect(0,0,512,512);
  if(kind==="hedge"){noise(c,512,512,30000,["rgba(0,0,0,.28)","rgba(0,0,0,.12)","rgba(255,255,255,.28)"],3);return}
  noise(c,512,512,7000,["rgba(0,0,0,.06)","rgba(255,255,255,.4)","rgba(0,0,0,.03)"]);
  if(kind==="brick")''')
R('''    if(kind==="glass")c.fillRect(x+2,y+3,60,50);else if(kind==="plain"){}''', '''    if(kind==="glass")c.fillRect(x+2,y+3,60,50);else if(kind==="plain"||kind==="hedge"||kind==="fence"){}''')
R('''const FKINDS=["res","brick","glass","plain","church"];''', '''const FKINDS=["res","brick","glass","plain","church","hedge","fence"];''')
R('''const roofMat=new THREE.MeshLambertMaterial({vertexColors:true});''', '''Object.assign(facadeMats.fence,{transparent:true,alphaTest:.5,side:THREE.DoubleSide});facadeMats.fence.map.magFilter=THREE.NearestFilter;
const roofMat=new THREE.MeshLambertMaterial({vertexColors:true});''')
# Band mit Bordsteinkante
R('''function addRibbon(G,pts,w,y,uvS,col,caps){
  const n=pts.length/2; if(n<2)return; const hw=w/2;''', '''function addRibbon(G,pts,w,y,uvS,col,caps,skirt){
  const n=pts.length/2; if(n<2)return; const hw=w/2;''')
R('''    for(const [a,b,c] of [[0,1,2],[0,2,3]])for(const k of [a,b,c])G.v(q[k][0],y,q[k][1],0,1,0,q[k][0]/uvS,q[k][1]/uvS,col)}''',
  '''    for(const [a,b,c] of [[0,1,2],[0,2,3]])for(const k of [a,b,c])G.v(q[k][0],y,q[k][1],0,1,0,q[k][0]/uvS,q[k][1]/uvS,col);
    if(skirt)for(const [A,B,sg] of [[q[0],q[1],1],[q[3],q[2],-1]]){const nxk=px/hw*sg,nzk=pz/hw*sg;
      for(const [X,Z,Y] of [[A[0],A[1],y],[B[0],B[1],y],[B[0],B[1],0],[A[0],A[1],y],[B[0],B[1],0],[A[0],A[1],0]])G.v(X,Y,Z,nxk,0,nzk,(X+Z)/uvS,Y/uvS,col)}}''')
R('''  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);''', '''  ground.rotation.x=-Math.PI/2; ground.position.y=BASE_Y-.03; ground.receiveShadow=true; ground.renderOrder=-6; scene.add(ground);''')
R('''    AG[t].mesh(mat,false,true)}''', '''    AG[t].mesh(mat,false,true).renderOrder=-5}''')
R('''    if(r.c){if(r.h!=="service")addRibbon(gSide,pts,r.w+5,.08,3,null,true);addRibbon(gAsph,pts,r.w,.12,6,null,true);''',
  '''    if(r.c){if(r.h!=="service")addRibbon(gSide,pts,r.w+5,SIDE_Y,3,null,true,true);addRibbon(gAsph,pts,r.w,ROAD_Y,6,null,true);''')
R('''  gSide.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xd8d5ce}),false,true);
  gAsph.mesh(new THREE.MeshLambertMaterial({map:texAsphalt}),false,true);
  gPed.mesh(new THREE.MeshLambertMaterial({map:texCobble,color:0xf2ece2}),false,true);
  gPath.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xe9e2d2}),false,true);
  gMark.mesh(new THREE.MeshLambertMaterial({color:0xf0f0f0}),false,false);''',
  '''  for(const z of MG.zebra||[])for(let k=0;k<Math.floor(z.w);k++){const o=-z.w/2+.5+k;z.dir==="x"?addRibbon(gMark,[z.x-1.6,z.y+o,z.x+1.6,z.y+o],.5,ROAD_Y+.03,1,null,false):addRibbon(gMark,[z.x+o,z.y-1.6,z.x+o,z.y+1.6],.5,ROAD_Y+.03,1,null,false)}
  // Zeichenreihenfolge: Gehwege, dann Fahrbahn (überdeckt Gehwegbänder an Einmündungen), dann Markierungen
  gSide.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xd8d5ce,side:THREE.DoubleSide}),false,true).renderOrder=-3;
  gPed.mesh(new THREE.MeshLambertMaterial({map:texCobble,color:0xf2ece2}),false,true).renderOrder=-4;
  gPath.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xe9e2d2}),false,true).renderOrder=-4;
  gAsph.mesh(new THREE.MeshLambertMaterial({map:texAsphalt,depthFunc:THREE.AlwaysDepth}),false,true).renderOrder=-2;
  gMark.mesh(new THREE.MeshLambertMaterial({color:0xf0f0f0}),false,false).renderOrder=-1;''')
R('''  for(const b of MG.buildings){bi++;
    const p=b.p.slice(); const n=p.length/2; if(n<3)continue;''', '''  for(const b of MG.buildings){bi++; if(b.x)continue;
    const p=b.p.slice(); const n=p.length/2; if(n<3)continue;''')
R('''    let kind="res";
    if(/church|cathedral|chapel|monastery/.test(t)''', '''    let kind="res";
    if(b.k)kind=b.k;
    else if(/church|cathedral|chapel|monastery/.test(t)''')
R('''    if(kind==="church"){if(h<24&&m===0)h=24}''', '''    if(b.k){}
    else if(kind==="church"){if(h<24&&m===0)h=24}''')
R('''    col=osmColor(b.c,col);''', '''    if(kind==="hedge")col=C(pick(["#4f7a3a","#476f35","#567f3e"]));
    col=osmColor(b.c,col);''')
R('''    addFlat(gRoof,p,h,roofCol,4);
    if(b.n&&(kind==="church"||h>25||/station|townhall|museum|civic|public/.test(t)))''', '''    if(kind!=="fence")addFlat(gRoof,p,h,kind==="hedge"?col:roofCol,4);
    if(b.n&&(MG.spielkarte||kind==="church"||h>25||/station|townhall|museum|civic|public/.test(t)))''')
R('''function makePerson(){
  const g=new THREE.Group(), legs=[], arms=[];''', '''function makePerson(shirt,bagOn=true){
  const shirtMat=shirt?paint(shirt):shirtMatDef;
  const g=new THREE.Group(), legs=[], arms=[];''')
R('''pantsMat=new THREE.MeshLambertMaterial({color:0x2c3a5a}), shirtMat=paint("#3f7fd6");''', '''pantsMat=new THREE.MeshLambertMaterial({color:0x2c3a5a}), shirtMatDef=paint("#3f7fd6");''')
R('''  const bag=new THREE.Mesh(new THREE.BoxGeometry(2.6,5,4.6),paint("#ffc933"));bag.position.set(-3,12.4,0);g.add(bag);
  g.userData={legs,arms}; return g;''', '''  if(bagOn){const bag=new THREE.Mesh(new THREE.BoxGeometry(2.6,5,4.6),paint("#ffc933"));bag.position.set(-3,12.4,0);g.add(bag)}
  g.userData={legs,arms}; return g;''')
R('''  const cands=[...POIS.filter(p=>p.n&&PRIO.includes(p.k)).sort((a,b)=>PRIO.indexOf(a.k)-PRIO.indexOf(b.k)),...LANDMARKS];''',
  '''  const named=MG.spielkarte?(MG.areas||[]).filter(a=>a.n&&/markt|schlosspark|nordpark|schulhof|europaplatz/i.test(a.n)).map(a=>{const b=areaBox(a);return {n:a.n,x:b.cx,y:b.cy,h:5}}):[];
  const cands=[...POIS.filter(p=>p.n&&PRIO.includes(p.k)).sort((a,b)=>PRIO.indexOf(a.k)-PRIO.indexOf(b.k)),...LANDMARKS,...named];''')

# ---------------------------------------------------------------- Render
R('''  const sa=(state.time/1440)*Math.PI*2;
  sun.position.set(car.x+Math.cos(sa)*120,240,car.y+80); sun.target.position.set(car.x,0,car.y);''',
  '''  sun.position.set(car.x+70,170,car.y+95); sun.target.position.set(car.x,0,car.y);
  animQuestWorld(dt,now);''')
R('''walker.position.y=Math.abs(Math.cos(car.ph))*amp*.08}''', '''walker.position.y=car.alt+Math.abs(Math.cos(car.ph))*amp*.08}''')
R('''  for(const n of npcs){if(n.x===undefined)continue;n.mesh.position.set(n.x,0,n.y);n.mesh.rotation.y=-n.ang}
  peds.forEach((p,i)=>{if(p.x===undefined)return;const bob=Math.abs(Math.sin(p.ph))*.06;
    o3.position.set(p.x,bob,p.y);''', '''  for(const n of npcs){if(n.x===undefined)continue;n.mesh.position.set(n.x,ROAD_Y,n.y);n.mesh.rotation.y=-n.ang;if(n.bike){const u=n.mesh.userData.rider.userData;n.ph=(n.ph||0)+dt*n.v*.7;u.legs[0].rotation.z=1+Math.sin(n.ph)*.5;u.legs[1].rotation.z=1-Math.sin(n.ph)*.5;u.arms[0].rotation.z=u.arms[1].rotation.z=1.15}}
  peds.forEach((p,i)=>{if(p.x===undefined)return;const gy=groundY(p.x,p.y),bob=gy+Math.abs(Math.sin(p.ph))*.06;
    o3.position.set(p.x,bob,p.y);''')
R('''    o3.position.y=0;o3.rotation.set(0,-p.a,Math.sin(p.ph)*.35);''', '''    o3.position.y=gy;o3.rotation.set(0,-p.a,Math.sin(p.ph)*.35);''')
R('''  targetMesh.visible=arrow.visible=!!tk;
  for(const r of [ribX,ribY,ribD,labX,labY,labD])r.visible=!!tk;''', '''  const nt=state.nav?navTarget():null; targetMesh.visible=!!tk; arrow.visible=!!nt;
  for(const r of [ribX,ribY,ribD,labX,labY,labD])r.visible=!!nt;''')
R('''fade(targetMesh,tk.x,tk.y);
    const ang=Math.atan2(tk.y-car.y,tk.x-car.x);''', '''fade(targetMesh,tk.x,tk.y)}
  if(nt){const tk=nt;
    const ang=Math.atan2(tk.y-car.y,tk.x-car.x);''')
R('''    mctx.strokeStyle="#ffc933";mctx.lineWidth=4;mctx.setLineDash([8,6]);mctx.beginPath();mctx.moveTo(0,0);mctx.lineTo(p,q);mctx.stroke();mctx.setLineDash([]);
    mctx.fillStyle="#ffc933";mctx.beginPath();mctx.arc(p,q,12,0,7);mctx.fill()}''',
  '''    mctx.fillStyle="#ffc933";mctx.beginPath();mctx.arc(p,q,12,0,7);mctx.fill()}
  for(const q of QUESTS){const s=qs(q);if(s.done)continue;const pts=[[q.giver.x,q.giver.y,"#ffc933","❗"]];if(s.acc)for(const m of q.measures)if(!s.m[m.id])pts.push([m.x,m.y,"#3fd8ff","📏"]);
    for(const pt of pts){const[p,q2]=edge(...W(pt[0],pt[1]));mctx.save();mctx.translate(p,q2);mctx.rotate(up);mctx.fillStyle=pt[2];mctx.beginPath();mctx.arc(0,0,11,0,7);mctx.fill();mctx.font="13px sans-serif";mctx.textAlign="center";mctx.textBaseline="middle";mctx.fillStyle="#000";mctx.fillText(pt[3],0,1);mctx.restore()}}
  if(state.nav){const nt=navTarget();if(nt){const[p,q]=edge(...W(nt.x,nt.y));mctx.strokeStyle="#ffc933";mctx.lineWidth=4;mctx.setLineDash([8,6]);mctx.beginPath();mctx.moveTo(0,0);mctx.lineTo(p,q);mctx.stroke();mctx.setLineDash([])}}''')
R('''  $("clock").textContent=`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")} Uhr${streetName?" · "+streetName:""}`;''',
  '''  $("clock").innerHTML=`${lastDistrict?lastDistrict:"Mönchengladbach"}${streetName?" · "+streetName:""}<br><span style="opacity:.75">Spielkarte · Wege vereinfacht</span>`;''')
R('''<div class="nav">Δx = ${dxm} m · Δy = ${dym} m<br>d = √(${dxm}² + ${dym}²) ≈ ${d} m</div>`}''', '''${state.nav?`<div class="nav">Δx = ${dxm} m · Δy = ${dym} m<br>d = √(${dxm}² + ${dym}²) ≈ ${d} m</div>`:`<div class="nav">Wegmarkierung: Taste N oder 🧭</div>`}`}''')
R("#clock{left:calc(16px + env(safe-area-inset-left,0px));bottom:calc(224px + env(safe-area-inset-bottom,0px));width:200px;", "#clock{left:calc(16px + env(safe-area-inset-left,0px));bottom:calc(224px + env(safe-area-inset-bottom,0px));width:200px;line-height:1.35;")

# ---------------------------------------------------------------- Start
R('''["Fahrzeuge",()=>{buildVehicles();npcs.forEach(n=>n.mesh=makeCar(n.col,false));buildPeds()}],["Beschriftungen",buildMarkers],''',
  '''["Fahrzeuge",()=>{buildVehicles();npcs.forEach(n=>n.mesh=n.bike?makeBike(n.col):makeCar(n.col,false));buildPeds()}],["Beschriftungen",buildMarkers],["Schule und Aufträge",()=>{buildSchool();buildSigns();buildParked();buildQuestWorld()}],''')
R('''/* ================= Start ================= */''', open(quests, encoding="utf-8").read() + '''
/* ================= Start ================= */''')
open(out, "w", encoding="utf-8").write(s)
print("FAILS", len(fails))
for f in fails: print(f)
