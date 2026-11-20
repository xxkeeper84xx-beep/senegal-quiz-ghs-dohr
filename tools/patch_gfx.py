import sys, re
src, gfx, out = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding="utf-8").read()
fails = []
def R(a, b, cnt=1):
    global s
    if s.count(a) != cnt: fails.append((s.count(a), a[:90])); return
    s = s.replace(a, b)
def RX(pat, b):
    global s
    n = len(re.findall(pat, s, flags=re.S))
    if n != 1: fails.append((n, "RX " + pat[:80])); return
    s = re.sub(pat, lambda m: b, s, count=1, flags=re.S)

# ------------------------------------------------------------ CSS (kompakte Oberfläche, Hochkant, Tastatur)
R("</style>", """
/* --- kompakte Oberfläche: mehr Platz für die 3D-Szene --- */
#stats{min-width:0;padding:8px 12px;display:flex;gap:10px;align-items:center}
#stats .money{font-size:20px}
#stats .rank{margin:0;font-size:11px}
#stats .xpbar{width:64px;margin:0}
#stats .small{display:none}
#btnMore{position:fixed;z-index:7;left:calc(12px + env(safe-area-inset-left,0px));top:calc(58px + env(safe-area-inset-top,0px));padding:10px 14px;font-size:14px;background:var(--panel);min-height:44px}
#topbtns{top:calc(108px + env(safe-area-inset-top,0px));flex-direction:column;flex-wrap:nowrap;gap:2px;max-width:250px;background:var(--panel);padding:8px;border-radius:14px;box-shadow:0 0 0 1.5px var(--line);z-index:8}
#topbtns button{text-align:left;padding:11px 12px;font-size:14px;background:transparent;box-shadow:none;min-height:44px}
#topbtns button:hover{background:rgba(63,216,255,.12)}
#goal{left:50%;transform:translateX(-50%);top:calc(12px + env(safe-area-inset-top,0px));background:var(--panel);border-radius:999px;padding:9px 18px;font-size:14px;font-weight:500;box-shadow:0 0 0 1.5px var(--line);max-width:min(560px,calc(100vw - 480px));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:auto;cursor:pointer}
#mm{width:150px;height:150px}
#clock{bottom:calc(172px + env(safe-area-inset-bottom,0px));width:150px;font-size:11.5px}
#prompt{min-height:50px;display:flex;align-items:center;font-size:16px;padding:10px 22px;bottom:calc(112px + env(safe-area-inset-bottom,0px))}
#btnExit{position:fixed;z-index:6;right:calc(24px + env(safe-area-inset-right,0px));bottom:calc(112px + env(safe-area-inset-bottom,0px));padding:10px 14px;font-size:14px;background:var(--panel);min-height:44px}
#game{cursor:grab}
body.touch #mm{width:112px;height:112px}
body.touch #clock{top:calc(130px + env(safe-area-inset-top,0px));width:112px;bottom:auto}
body.touch #btnExit{bottom:calc(172px + env(safe-area-inset-bottom,0px));right:calc(14px + env(safe-area-inset-right,0px))}
body.touch #prompt{bottom:calc(98px + env(safe-area-inset-bottom,0px))}
.overlay{bottom:auto;height:var(--vvh,100%)}
@media (max-width:760px){
  #stats .rank{display:none}
  #goal{left:calc(106px + env(safe-area-inset-left,0px));right:calc(136px + env(safe-area-inset-right,0px));transform:none;top:calc(58px + env(safe-area-inset-top,0px));max-width:none;white-space:normal;font-size:12.5px;border-radius:14px;padding:7px 10px;line-height:1.3;max-height:3.9em}
  #prompt{font-size:14.5px;padding:10px 16px;max-width:calc(100vw - 24px);white-space:normal;text-align:left}
  .overlay{align-items:flex-start;padding:10px}
  .card{padding:16px 14px}
  #speed{font-size:30px}
}
@media (max-height:560px){.overlay{align-items:flex-start}}
</style>""")

# ------------------------------------------------------------ HTML
R('<div id="topbtns">', '<button id="btnMore" type="button" aria-label="Menü öffnen">☰ Menü</button>\n<div id="topbtns" hidden>')
R('  <button id="btnMenu" type="button">☰ Menü</button>', '  <button id="btnMenu" type="button">🏠 Startbildschirm</button>')
R('<div class="hud" id="prompt" hidden></div>', '<div class="hud" id="goal"></div>\n<div class="hud" id="prompt" hidden></div>\n<button id="btnExit" type="button" hidden>Aussteigen (X)</button>')
R('<kbd>Shift</kbd><span>Sprinten / Nitro (Autos)</span>', '<kbd>Shift</kbd><span>Laufen / Nitro (Autos)</span>\n          <kbd>Maus ziehen</kbd><span>Kamera drehen (Touch: wischen)</span>\n          <kbd>X</kbd><span>Aus dem Fahrzeug aussteigen</span>')

# ------------------------------------------------------------ Zu Fuß: Gehen, nach kurzer Zeit Laufen
R('max:5.5,acc:14, rev:-2.5,r:.45,grassF:1, turn:3.4,agile:true,cam:.55,lights:false,desc:"Kostenlos. Mit Shift sprintest du."',
  'max:6.2,acc:8,  rev:-1.6,r:.4, grassF:1, turn:3.2,agile:true,cam:.55,lights:false,desc:"Kostenlos. Nach ein paar Schritten läufst du los (oder sofort mit Shift)."')
R('  if(VH.id==="walk"&&boost)maxF*=1.45;', '  if(VH.id==="walk"){car.hold=up?(car.hold||0)+dt:0;maxF=(boost||car.hold>1.4)?6.2:3.3}')
R('''  if(k==="q"&&!e.repeat&&state.mode==="play")horn();''', '''  if(k==="q"&&!e.repeat&&state.mode==="play")horn();
  if(k==="x"&&!e.repeat&&state.mode==="play")exitVehicle();''')
R('''  if(b.dataset.use){setVehicle(b.dataset.use);renderShop()}''', '''  if(b.dataset.use){if(save.left&&save.left.id===b.dataset.use)save.left=null;setVehicle(b.dataset.use);renderShop()}''')
R('''L.push({x:m.x,y:m.y,r:3,label:`📏 Messen: ${m.short}`,act:()=>measure(q,m)})}''', '''L.push({x:m.x,y:m.y,r:3,label:`📏 Strecke messen: ${m.short}`,act:()=>measure(q,m)})}
  if(save.left&&VH.id==="walk"&&VEH[save.left.id])L.push({x:save.left.x,y:save.left.y,r:3.4,label:`${VEH[save.left.id].icon} Einsteigen`,act:enterVehicle});''')
R('''for(const n of npcs.concat(parkedList)){''', '''for(const n of npcs.concat(parkedList,save.left&&save.left.id!==VH.id?[save.left]:[])){''')

# ------------------------------------------------------------ Texturen im richtigen Maßstab
RX(r'const texAsphalt=canvasTex\(256,256,.*?\n', '''const texAsphalt=canvasTex(512,512,(c,w,h)=>{c.fillStyle="#56585d";c.fillRect(0,0,w,h);
  noise(c,w,h,26000,["#4b4d52","#5f6166","#46484d","#66686d","#505257"],2);noise(c,w,h,5000,["rgba(255,255,255,.07)","rgba(0,0,0,.1)"],1);
  for(let i=0;i<9;i++){c.fillStyle=`rgba(${i%2?20:235},${i%2?20:235},${i%2?22:235},.05)`;c.beginPath();c.ellipse(Math.random()*w,Math.random()*h,40+Math.random()*70,14+Math.random()*30,Math.random()*3,0,7);c.fill()}
  for(const [x,y,pw,ph] of [[70,96,92,40],[340,318,54,86]]){c.fillStyle="rgba(40,41,45,.3)";c.fillRect(x,y,pw,ph);c.strokeStyle="rgba(22,22,24,.45)";c.lineWidth=1.5;c.strokeRect(x,y,pw,ph)}
  c.strokeStyle="rgba(25,25,27,.55)";c.lineWidth=1.2;for(let i=0;i<5;i++){c.beginPath();let x=Math.random()*w,y=Math.random()*h;c.moveTo(x,y);for(let k=0;k<6;k++){x+=(Math.random()-.5)*46;y+=Math.random()*30;c.lineTo(x,y)}c.stroke()}});
''')
RX(r'const texPave=canvasTex\(256,256,.*?\n', '''const texPave=canvasTex(512,512,(c,w,h)=>{c.fillStyle="#a9a69d";c.fillRect(0,0,w,h);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){const v=168+Math.floor(Math.random()*26);c.fillStyle=`rgb(${v+6},${v+3},${v-5})`;c.fillRect(x*64+1.5,y*64+1.5,61,61)}
  noise(c,w,h,9000,["rgba(0,0,0,.06)","rgba(255,255,255,.07)","rgba(90,80,60,.05)"],2);
  c.strokeStyle="rgba(86,84,78,.85)";c.lineWidth=2.4;for(let i=0;i<=8;i++){c.beginPath();c.moveTo(i*64,0);c.lineTo(i*64,h);c.stroke();c.beginPath();c.moveTo(0,i*64);c.lineTo(w,i*64);c.stroke()}});
''')
R('function facade(kind){return canvasTex(512,512,(c)=>{', 'function facade(kind){return canvasTex(1024,1024,(c)=>{c.scale(2,2);')
R('''  if(kind==="brick"){c.fillStyle="rgba(0,0,0,.13)";for(let y=0;y<512;y+=8){c.fillRect(0,y,512,1);for(let x=(y/8%2)*8;x<512;x+=16)c.fillRect(x,y,1,8)}}''',
  '''  if(kind==="brick"){for(let y=0;y<512;y+=2)for(let x=((y/2)%2)*3-3;x<512;x+=6){const q=Math.random();if(q<.3){c.fillStyle=q<.15?"rgba(0,0,0,.1)":"rgba(255,255,255,.12)";c.fillRect(x,y,6,2)}}
    c.fillStyle="rgba(60,50,45,.35)";for(let y=0;y<512;y+=2){c.fillRect(0,y,512,.4);for(let x=((y/2)%2)*3;x<512;x+=6)c.fillRect(x,y,.4,2)}}''')
R('''else{c.fillStyle="rgba(255,255,255,.5)";c.fillRect(x+13,y+9,38,46);c.fillStyle=g;c.fillRect(x+16,y+12,32,40);c.fillStyle="rgba(255,255,255,.5)";c.fillRect(x+31,y+12,2,40);c.fillStyle="rgba(0,0,0,.2)";c.fillRect(x+11,y+52,42,4)}''',
  '''else if(r===7&&k%4===1){ // Haustür im Erdgeschoss
      c.fillStyle="rgba(0,0,0,.4)";c.fillRect(x+19,y+12,26,52);c.fillStyle="#5a4636";c.fillRect(x+21,y+14,22,50);c.fillStyle="rgba(255,255,255,.14)";c.fillRect(x+24,y+18,7,18);c.fillRect(x+33,y+18,7,18);c.fillStyle="#c9b25a";c.fillRect(x+39,y+40,2,4)}
    else{ // Fenster mit Laibung, Rahmen, Spiegelung und Fensterbank
      c.fillStyle="rgba(0,0,0,.36)";c.fillRect(x+13.5,y+9,37,45.5);
      c.fillStyle="#f3f2ec";c.fillRect(x+15.5,y+11.5,33,42);
      c.fillStyle=g;c.fillRect(x+17,y+13,13.6,39);c.fillRect(x+33.4,y+13,13.6,39);
      c.fillStyle="rgba(255,255,255,.17)";c.beginPath();c.moveTo(x+17,y+32);c.lineTo(x+30.6,y+17);c.lineTo(x+30.6,y+25);c.lineTo(x+17,y+40);c.fill();
      c.fillStyle="rgba(0,0,0,.3)";c.fillRect(x+15.5,y+11.5,33,2.4);c.fillRect(x+15.5,y+11.5,1.6,42);
      if((r*8+k)%5===0){c.fillStyle="rgba(238,232,218,.6)";c.fillRect(x+17,y+13,13.6,15);c.fillRect(x+33.4,y+13,13.6,15)}
      c.fillStyle="#d7d3c8";c.fillRect(x+11.5,y+54,41,3);c.fillStyle="rgba(0,0,0,.25)";c.fillRect(x+11.5,y+57,41,1.6)}''')
R('function litMap(kind){return canvasTex(512,512,', 'function litMap(kind){return canvasTex(32,32,')

# ------------------------------------------------------------ Straße: Bordstein, Gehweg, Asphalt
R("""new THREE.MeshLambertMaterial({color:0x9c9a92,map:texPave}));
  texPave.repeat.set((2*HX+800)/6,(2*HY+800)/6);""", """new THREE.MeshLambertMaterial({color:0xb5b2a8,map:(()=>{const t=texPave.clone();t.needsUpdate=true;t.repeat.set((2*HX+800)/4,(2*HY+800)/4);return t})()}));""")
R("const gSide=new Geo(),", "const gCurb=new Geo(),gSide=new Geo(),")
R('if(r.h!=="service")addRibbon(gSide,pts,r.w+5,SIDE_Y,3,null,true,true);addRibbon(gAsph,pts,r.w,ROAD_Y,6,null,true);',
  'if(r.h!=="service")addSidewalks(gSide,gCurb,pts,r.w);addRibbon(gAsph,pts,r.w,ROAD_Y,14,null,true);')
R("gSide.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xd8d5ce,side:THREE.DoubleSide}),false,true).renderOrder=-3;",
  "gSide.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xf4f2ec,side:THREE.DoubleSide}),false,true).renderOrder=-3;\n  gCurb.mesh(new THREE.MeshLambertMaterial({color:0xb9b6ad,side:THREE.DoubleSide}),false,true).renderOrder=-3;")

# ------------------------------------------------------------ alte Blockmodelle entfernen (neue stehen im Grafik-Block)
RX(r'function makeCar\(color,player,o=\{\},sc=\.118\)\{.*?\n(?=const skinMat)', '')
RX(r'const skinMat=new THREE\.MeshLambertMaterial.*?\n(?=function bar\()', '')
R('const p=makePerson();p.position.set(-1.8,6.2,0);p.rotation.z=-.18;g.add(p);', 'const p=makePerson();p.position.set(-1.6,4.5,0);g.add(p);sitHuman(p.userData.hu,"bike");')
R('const p=makePerson();p.position.set(-1,3.5,0);g.add(p);', 'const p=makePerson();p.position.set(-1,3.5,0);g.add(p);sitHuman(p.userData.hu,"stand");')
R('const p=makePerson();p.position.set(-4,6,0);g.add(p);', 'const p=makePerson();p.position.set(-4,3.9,0);g.add(p);sitHuman(p.userData.hu,"moped");')
RX(r'    smart:makeCar\(pc\("smart"\),true,.*?    heli:makeHeli', '''    smart:makeCar(pc("smart"),true,{type:"smart"}),
    van:makeCar(pc("van"),true,{type:"van"}),
    prius:makeCar(pc("prius"),true,{type:"sedan"}),
    aston:makeCar(pc("aston"),true,{type:"sport"}),
    maser:makeCar(pc("maser"),true,{type:"sport",stripe:"#c9a23a"}),
    heli:makeHeli''')
R('n.mesh=n.bike?makeBike(n.col):makeCar(n.col,false)', 'n.mesh=n.bike?makeBike(n.col):makeCar(n.col,false,{type:pick(["sedan","hatch","sedan","hatch","van","smart"])})')
R('function applyPaint(id){const m=vehMeshes[id];if(m&&m.userData.paint)m.userData.paint.color.set(pc(id))}', 'function applyPaint(id){const m=vehMeshes[id];if(m&&m.userData.paint){m.userData.paint.color.set(pc(id));if(window.__lin)m.userData.paint.color.convertSRGBToLinear()}}')
R('G.bulb.color.set(on?0xfff2c2:0x4a4a44);', 'G.bulb.color.set(on?0xfff2c2:0x4a4a44);if(window.__lin)G.bulb.color.convertSRGBToLinear();')
RX(r'  const trunk=new THREE\.CylinderGeometry\(\.16,\.26,3\.4,6\);.*?scene\.add\(tI,cI\);', '  buildTreeMeshes();')

# ------------------------------------------------------------ Licht, Himmel, Farbraum
R('const SKY_DAY=new THREE.Color("#a9cdeb")', 'const SKY_DAY=new THREE.Color("#d5e6f3")')
R('const camera=new THREE.PerspectiveCamera(62,1,.3,3200);', 'const camera=new THREE.PerspectiveCamera(54,1,.25,6000);')
R('  sun.intensity=.95*(1-dk)+.08; hemi.intensity=.25+.55*(1-dk);', '  sun.intensity=1.45; hemi.intensity=.62;')
R('scene.fog.color.copy(tmpC);', 'scene.fog.color.copy(tmpC);if(window.__lin)scene.fog.color.convertSRGBToLinear();')
R('  scene.fog.far=VH.fly?1900:1100; scene.fog.near=VH.fly?500:220;', '  scene.fog.far=VH.fly?1900:1000; scene.fog.near=VH.fly?500:140;')
R('  sun.position.set(car.x+70,170,car.y+95); sun.target.position.set(car.x,0,car.y);', '  sun.position.set(car.x+95,165,car.y+105); sun.target.position.set(car.x,0,car.y);')

# ------------------------------------------------------------ Render: Figur, abgestelltes Fahrzeug, Räder, Kamera
R('''  for(const id in vehMeshes)vehMeshes[id].visible=id===VH.id;''', '''  for(const id in vehMeshes)vehMeshes[id].visible=id===VH.id;
  if(pm.userData.rider)pm.userData.rider.visible=true;
  if(save.left&&save.left.id!==VH.id&&vehMeshes[save.left.id]){const l=save.left,m=vehMeshes[l.id];m.visible=true;m.position.set(l.x,VEH[l.id].fly?heightAt(l.x,l.y):groundY(l.x,l.y),l.y);m.rotation.set(0,-l.a,0);if(m.userData.rider)m.userData.rider.visible=false;if(m.userData.body)m.userData.body.rotation.set(0,0,0)}''')
RX(r'  const amp=clamp\(Math\.abs\(car\.v\)/5\.5,0,1\.4\);\n  car\.ph\+=dt\*car\.v\*\(VH\.id==="walk"\?1\.3:\.7\);\n  if\(VH\.id==="walk"\)\{.*?\n', '''  const wv=Math.abs(car.v); car.wk=(car.wk||0)+((VH.id==="walk"?clamp(wv/1.1,0,1):0)-(car.wk||0))*Math.min(1,dt*8); car.rn=(car.rn||0)+(clamp((wv-3.4)/2.2,0,1)-(car.rn||0))*Math.min(1,dt*4);
  const stl=strideLen(wv,car.rn); car.ph+=VH.id==="walk"?dt*car.v*2*Math.PI/stl:dt*car.v*1.4;
  if(VH.id==="walk"){poseHuman(walker.userData.hu,car.ph,car.wk,car.rn,now/1000,stl);walker.position.y=car.alt}
  if(pm.userData.carWheels)for(const w of pm.userData.carWheels)w.rotation.z-=car.v*dt/pm.userData.wr;
''')
RX(r'  if\(pm\.userData\.rider\)\{const u=pm\.userData\.rider\.userData,id=VH\.id;.*?for\(const w of pm\.userData\.wheels\)w\.rotation\.z-=car\.v\*dt/\.5\}', '''  if(pm.userData.rider){sitHuman(pm.userData.rider.userData.hu,VH.id==="scoot"?"stand":VH.id,car.ph);for(const w of pm.userData.wheels)w.rotation.z-=car.v*dt/.5}''')
R('''if(n.bike){const u=n.mesh.userData.rider.userData;n.ph=(n.ph||0)+dt*n.v*.7;u.legs[0].rotation.z=1+Math.sin(n.ph)*.5;u.legs[1].rotation.z=1-Math.sin(n.ph)*.5;u.arms[0].rotation.z=u.arms[1].rotation.z=1.15}''',
  '''if(n.bike){n.ph=(n.ph||0)+dt*n.v*1.4;sitHuman(n.mesh.userData.rider.userData.hu,"bike",n.ph)}else if(n.mesh.userData.carWheels)for(const w of n.mesh.userData.carWheels)w.rotation.z-=n.v*dt/n.mesh.userData.wr''')
RX(r'  // Kamera \(Third-Person\)\n.*?(?=  renderer\.render\(scene,camera\);)', '  updateCamera(dt,VH);\n')
R('const CAMS=[{name:"Verfolger",dist:7.8,h:2.9,look:1.3},{name:"Weit",dist:15,h:6.5,look:1.6},{name:"Nah",dist:4.6,h:1.9,look:1.0}];', 'const CAMS=[{name:"Standard",f:1,p:0},{name:"Weit",f:1.75,p:.16},{name:"Nah",f:.62,p:-.1}];')
R('rot=-camYaw-Math.PI/2, up=-rot;', 'rot=-(camYaw+camS.yo)-Math.PI/2, up=-rot;')

# ------------------------------------------------------------ HUD
R('''  $("speed").innerHTML=`${Math.round(Math.abs(car.v)*3.6)}<small>''', '''  $("speed").hidden=VH.id==="walk"; $("btnExit").hidden=VH.id==="walk"||state.mode!=="play";
  $("goal").hidden=!!state.task||(state.mode!=="play"&&state.mode!=="shot"); $("goal").textContent=goalText();
  $("speed").innerHTML=`${Math.round(Math.abs(car.v)*3.6)}<small>''')
R('''<br><span style="opacity:.75">Spielkarte · Wege vereinfacht</span>`;''', '''`;''')

# ------------------------------------------------------------ Start
R('const steps=[["Kollisionskarte",rasterize],', 'const steps=[["Kollisionskarte",rasterize],["Himmel",()=>{buildSky();buildEnv()}],')
R('walker=makePerson();walker.scale.setScalar(.092);scene.add(walker);','walker=makePerson();walker.scale.setScalar(.092);scene.add(walker);footShadow(walker.userData.hu,.9);')
R('["Karte",buildMinimap]];', '["Licht und Farben",()=>{linearizeScene();window.__lin=true}],["Karte",buildMinimap]];')
R('  hudT-=dt; if(hudT<=0){hudTexts();hudT=.1}', '  hudT-=dt; if(hudT<=0){hudTexts();hudT=.1}\n  watchPerf(dt);')
R('/* ================= Start ================= */', open(gfx, encoding="utf-8").read() + '\n/* ================= Start ================= */')
import os
R('/* ================= Start ================= */', open(os.path.join(os.path.dirname(gfx),'aufgaben.js'), encoding="utf-8").read() + '\n/* ================= Start ================= */')
R('buildQuestWorld()}]','buildQuestWorld();buildHunt()}]')
exec(open(os.path.join(os.path.dirname(gfx),'story_patch.py'),encoding='utf-8').read())
exec(open(os.path.join(os.path.dirname(gfx),'theme_patch.py'),encoding='utf-8').read())
exec(open(os.path.join(os.path.dirname(gfx),'crowd_patch.py'),encoding='utf-8').read())
open(out, "w", encoding="utf-8").write(s)
print("FAILS", len(fails))
for f in fails: print(f)
