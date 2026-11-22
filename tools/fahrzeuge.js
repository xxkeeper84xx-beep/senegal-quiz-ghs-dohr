/* ================= Fahrzeugmodelle aus fahrzeuge/*.json =================
   E-Scooter, Fahrrad, Motorrad, Kompaktwagen, Helikopter und Flugzeug (glTF, Meter, +Y oben, +Z vorn, Ursprung auf dem Boden).
   Geladen wie die Figuren (GLTFLoader, eingebettete Daten). Im Spiel zeigt die Fahrtrichtung nach +x: Modell um 90° drehen.
   Zweiräder bleiben in der 0,1-fach skalierten Hülle, damit Sitzhaltung und Auf-/Absteigen weiter passen.
   Räder drehen um ihre lokale X-Achse, Vorderräder des Autos lenken mit; Hauptrotor um Y, Heckrotor um X, Propeller um Z. */
{const i=VEHICLES.findIndex(v=>v.id==="smart");
 VEHICLES.splice(i,0,{id:"auto",name:"Kompaktwagen",icon:"🚘",price:900,req:2,max:20,acc:7,rev:-4,r:1.0,grassF:.45,turn:2.6,cam:.9,lights:true,nitro:true,
   desc:"Schieferblauer Kompaktwagen: bequem, sparsam und mit Platz für die ganze Lerngruppe."});
 VEHICLES.push({id:"plane",name:"Flugzeug",icon:"🛩️",price:9000,req:5,max:60,acc:6,rev:-2,r:3.2,grassF:.8,turn:1.3,cam:3.2,lights:true,fly:true,plane:true,
   desc:"Kleines Propellerflugzeug. Auf einer langen, geraden Straße Anlauf nehmen: ab 18 m/s hebt es mit R ab. In der Luft bleibt es immer in Bewegung."});
 VEHICLES.splice(VEHICLES.findIndex(v=>v.id==="auto")+1,0,{id:"suv",name:"SUV Rheydt",icon:"🚙",price:1690,req:2,max:21,acc:7,rev:-4.5,r:1.15,grassF:.65,turn:2.3,cam:1.05,lights:true,nitro:true,
   desc:"Großer SUV mit viel Platz und hoher Sitzposition – gebaut für Rheydt."});
 VEH.auto=VEHICLES.find(v=>v.id==="auto");VEH.suv=VEHICLES.find(v=>v.id==="suv");VEH.plane=VEHICLES.find(v=>v.id==="plane");
 Object.assign(VEH.moped,{name:"Motorrad",icon:"🏍️",desc:"Bordeauxrotes Straßenmotorrad: flott durch die Stadt, mit Licht für die Nacht."});
 DEF_PAINT.auto="#4a5d73";DEF_PAINT.suv="#2f4a3c";DEF_PAINT.plane="#f2efe6"}
const VMOD={scoot:"E-Scooter",bike:"Fahrrad",moped:"Motorrad",auto:"Auto",suv:"SUV_Rheydt",heli:"Helikopter",plane:"Flugzeug"};
const VPAINT={scoot:"Lack",bike:"Lack",moped:"Lack",auto:"Lack",suv:"Lack",heli:"Petrol",plane:"Cremeweiss"};   /* neue Modelle (22.11.): Lackmaterial heißt „Lack“ */
const VG={done:{},size:{}};
/* Platzhalter, bis die Modelle geladen sind */
{const base=buildVehicles;buildVehicles=function(){base();vehMeshes.auto=makeCar(pc("auto"),true,{type:"hatch"});vehMeshes.suv=makeCar(pc("suv"),true,{type:"sedan"});vehMeshes.plane=makeHeli(pc("plane"));vehMeshes.plane.visible=false}}
function vehFromGlb(id,gltf){
  const two=TWO.has(id),g=new THREE.Group(),body=new THREE.Group(),model=gltf.scene;g.add(body);body.add(model);
  model.rotation.y=Math.PI/2;if(two){model.scale.setScalar(10);g.scale.setScalar(.1)}
  let paint=null;const mats=new Map();
  model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
    const src=o.material;let m=mats.get(src);if(!m){m=src.clone();if(ENV){m.envMap=ENV;m.envMapIntensity=.7}mats.set(src,m);if(m.name===VPAINT[id])paint=m;
      if(/Glas/i.test(m.name)){m.transparent=true;m.opacity=Math.min(m.opacity,.55);m.depthWrite=false}}
    o.material=m});
  if(paint)paint.userData.orig=paint.color.clone();
  const wheels=[];model.traverse(o=>{if(/^(Rad_(Vorne?|Hinten)(_[LR])?|Bugrad|Hauptrad_[LR])$/.test(o.name)){const b=new THREE.Box3().setFromObject(o),s=b.getSize(new THREE.Vector3());
    o.rotation.order="YXZ";wheels.push({n:o,r:Math.max(.05,s.y/2/(two?10:1)),front:/Vorn|Bugrad/.test(o.name)})}});
  const dummy=()=>{const d=new THREE.Object3D();d.material={opacity:0};return d};
  const rotor=model.getObjectByName("Hauptrotor")||dummy();
  g.userData={body,paint,wheels:[],carWheels:[],wr:1,glb:true,glbWheels:wheels,rotor,tail:dummy(),disc:dummy(),tailReal:model.getObjectByName("Heckrotor"),prop:model.getObjectByName("Propeller")};
  // Abmessungen in Metern (für Kollision und Sitzposition)
  g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3());
  VG.size[id]={len:+sz.x.toFixed(2),wid:+sz.z.toFixed(2),hgt:+sz.y.toFixed(2)};
  return g}
/* einfache Kollisionskörper: Kreis mit halber Breite (Zweiräder und Autos), Rotor- bzw. Spannweite bei Helikopter/Flugzeug etwas kleiner */
function vehRadius(id){const s=VG.size[id];if(!s)return;const r=id==="heli"?Math.max(s.wid,s.len)*.38:id==="plane"?s.wid*.36:TWO.has(id)?Math.max(.45,s.wid/2+.15):s.wid/2+.12;VEH[id].r=+r.toFixed(2);if(V().id===id)car.r=VEH[id].r}
function vehSwap(id,gltf){const old=vehMeshes[id],g=vehFromGlb(id,gltf);
  if(old){g.position.copy(old.position);g.rotation.copy(old.rotation);g.visible=old.visible;if(old.userData.rider){g.add(old.userData.rider);g.userData.rider=old.userData.rider}scene.remove(old)}
  scene.add(g);vehMeshes[id]=g;VG.done[id]=true;vehRadius(id);applyPaint(id)}
async function loadVehicles(){if(!THREE.GLTFLoader)return;
  for(let k=0;k<600&&!(walker&&walker.userData.glbDone)&&!GLB.failed;k++)await new Promise(r=>setTimeout(r,100));   // erst die Spielfigur, dann die Fahrzeuge
  const loader=new THREE.GLTFLoader();
  const order=[V().id,...Object.keys(VMOD)].filter((v,i,a)=>VMOD[v]&&a.indexOf(v)===i);
  for(const id of order){try{const g=await loader.loadAsync("fahrzeuge/"+VMOD[id]+".json");vehSwap(id,g)}catch(e){console.info("Fahrzeugmodell nicht geladen:",id)}}}
{const base=initGlbCrowd;initGlbCrowd=function(){loadVehicles();return base()}}
/* Lack: ohne eigene Farbe aus der Garage bleibt die Originalfarbe des Modells */
{const base=applyPaint;applyPaint=function(id){const m=vehMeshes[id];if(m&&m.userData.glb&&m.userData.paint){const p=m.userData.paint;
  if(save.paint&&save.paint[id]){p.color.set(save.paint[id]);p.color.convertSRGBToLinear()}else p.color.copy(p.userData.orig);return}base(id)}}
/* Räder, Lenkung, Rotoren und Propeller */
function vehAnim(dt){const VH=V();
  for(const id in VG.done){const g=vehMeshes[id];if(!g||!g.visible)continue;const U=g.userData,act=VH.id===id,v=act?car.v:0;
    for(const w of U.glbWheels){if(w.m===undefined)w.m=w.n.getObjectByName(w.n.name+"_Mesh")||null;(w.m||w.n).rotation.x+=v*dt/w.r;if(w.front&&!TWO.has(id)&&id!=="plane")w.n.rotation.y=act?car.steer*.45:0}
    if(U.tailReal)U.tailReal.rotation.x+=(act?(.25+.75*(car.rotor||0)):0)*dt*64;
    if(U.prop)U.prop.rotation.z+=(act?(VH.fly||Math.abs(car.v)>.5||keys.w||keys.arrowup?1:.25):0)*dt*55;
    if(id==="plane"&&act){U.body.rotation.z=clamp((car.vy||0)/12,-.3,.35);U.body.rotation.x=-car.steer*.55*clamp(Math.abs(car.v)/20,0,1)}}}
{const base=updateCamera;updateCamera=function(dt,VH){vehAnim(dt);base(dt,VH)}}
/* Flugphysik Flugzeug: Startlauf auf dem Boden, Abheben ab 18 m/s mit R, in der Luft Mindesttempo, zu langsam = sinken */
{const base=update;update=function(dt){const VH=V();if(VH.id!=="plane")return base(dt);
  const gnd=heightAt(car.x,car.y),air=car.alt-gnd>.4,climb=keys.r||keys.pageup;
  VEH.plane.fly=air||(climb&&car.v>=18);
  if(!air&&climb&&car.v<18&&!state.planeHint){state.planeHint=true;toast("Mehr Anlauf!","Erst ab 18 m/s hebt das Flugzeug ab","#ffc933");setTimeout(()=>state.planeHint=false,4000)}
  if(air){const low=car.alt-gnd<3;if(!low&&car.v<17)car.v=17;if(car.v<15)car.vy=(car.vy||0)-6*dt}   // in der Luft nie stehen bleiben
  if(VEH.plane.fly&&!air&&climb){car.vy=Math.max(car.vy||0,6);car.alt=gnd+.45}                       // abheben
  base(dt)}}
