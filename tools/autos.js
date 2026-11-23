/* ================= Rheydt-Autos (MG Teil 2, 23.11.) =================
   - Stadtverkehr: in Spielernähe fahren die Autos als Rheydt-Modelle (Stadtauto, Limousine, SUV Metallic) in der Farbe des Verkehrsautos;
     weiter weg bleibt das einfache Modell (spart Rechenzeit).
   - Parkende Autos am Straßenrand von Wohn- und Nebenstraßen, halb auf dem Gehweg wie in vielen Rheydter Straßen;
     werden um die Spielfigur herum aufgebaut (Anzahl je Grafikprofil), mit Kollision.
   - Autohaus: die drei Modelle als neue Fahrzeuge zum Kaufen und Selberfahren (fahrzeuge/Rheydt_*.json, mit Radknoten). */
const RA={files:["Rheydt_Stadtauto","Rheydt_Limousine","Rheydt_SUV_Metallic"],ready:false,slots:[],grid:new Map(),cell:40,last:{x:1e9,y:1e9,t:0},pk:[]};
const RA_CAP={schule:{r:55,park:10,trafR:45,traf:4,farR:220},standard:{r:85,park:26,trafR:80,traf:10,farR:320},hoch:{r:130,park:48,trafR:130,traf:20,farR:450}};
const RA_PARKCOL=["#e8eaf2","#2b2f3d","#9aa0a8","#1d3a5f","#6b6f78","#f2f2f2","#111111","#8a1f2b","#3f5f4f","#c9c3b4","#4a5d73","#b8262e"];
const RA_COL=new THREE.Color();

/* ---------- Kaufbare Fahrzeuge ---------- */
{const add=[{id:"rstadt",name:"Rheydt Stadtauto",icon:"🚗",price:940,req:1,max:20,acc:7.5,rev:-4.5,r:1.12,grassF:.55,turn:2.6,cam:1,lights:true,nitro:true,desc:"Kompakter Kombi für die Stadt: wendig, sparsam und mit viel Platz."},
  {id:"rlim",name:"Rheydt Limousine",icon:"🚘",price:1490,req:2,max:23,acc:7.5,rev:-4.5,r:1.12,grassF:.5,turn:2.3,cam:1.02,lights:true,nitro:true,desc:"Lange, ruhige Limousine mit Chromleisten – elegant über die Gracht."},
  {id:"rsuv",name:"SUV Metallic",icon:"🚙",price:1890,req:2,max:22,acc:7,rev:-4.5,r:1.18,grassF:.7,turn:2.3,cam:1.06,lights:true,nitro:true,desc:"Hoher SUV mit Metalliclack und Dachreling."}];
  let at=VEHICLES.findIndex(v=>v.id==="suv")+1;for(const v of add){VEHICLES.splice(at++,0,v);VEH[v.id]=v}
  DEF_PAINT.rstadt="#c0392b";DEF_PAINT.rlim="#1d3a5f";DEF_PAINT.rsuv="#5b7a66";
  VMOD.rstadt="Rheydt_Stadtauto";VMOD.rlim="Rheydt_Limousine";VMOD.rsuv="Rheydt_SUV_Metallic";VPAINT.rstadt=VPAINT.rlim=VPAINT.rsuv="Lack";
  AXLE.rstadt=1.2;AXLE.rlim=1.4;AXLE.rsuv=1.2;
}
{const base=buildVehicles;buildVehicles=function(){base();for(const id of ["rstadt","rlim","rsuv"]){vehMeshes[id]=makeCar(pc(id),true,{type:id==="rlim"?"sedan":"hatch"});vehMeshes[id].visible=false}}}

/* ---------- leichte Verkehrsmodelle laden ---------- */
async function raInit(){for(let i=0;i<3;i++){try{const P=await kitLoad("ra"+i,"fahrzeuge/verkehr/"+RA.files[i]+".json");
      for(const q of P.parts){const m=q.mat;if(/Glas/i.test(m.name||"")){m.transparent=false;m.opacity=1;m.depthWrite=true;m.color.setRGB(.035,.045,.055);m.roughness=.08;m.metalness=.2}
        if(ENV){m.envMap=ENV;m.envMapIntensity=.7}if(/^Lack/.test(m.name||"")){q.lack=true;m.color.set(0xffffff)}}
      // Modell: Front zeigt nach +Z → im Spiel nach +X
      const R=new THREE.Matrix4().makeRotationY(Math.PI/2);for(const q of P.parts)q.geo.applyMatrix4(R);P.box.applyMatrix4(R)}catch(e){console.info("Verkehrsauto fehlt",i,e)}}
  RA.ok=[0,1,2].filter(i=>KIT.parts["ra"+i]);if(!RA.ok.length)return;
  const cap=RA_CAP[GFX.id]||RA_CAP.standard;RA.inst=RA.ok.map(i=>{const K=kitMeshes("ra"+i,cap.park);K.ms.forEach((im,j)=>{if(KIT.parts["ra"+i].parts[j].lack)im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap.park*3).fill(1),3)});return K});
  raSlots();raTraffic();RA.ready=true;raPark()}

/* ---------- Parkplätze am Straßenrand (einmal berechnet) ---------- */
function raSlots(){const P={x:0,y:0,dx:1,dy:0};const RT=/^(residential|living_street|unclassified|tertiary)$/;
  const nearRoom=(x,y)=>(typeof ROOMS!=="undefined"?ROOMS:[]).some(r=>Math.hypot(r.cx-x,r.cy-y)<26);
  for(const e of edges){if(!e.r||!RT.test(e.r.h||"")||e.r.w<6||e.len<34||e.r.o)continue;
    for(const sd of [1,-1])for(let s=14;s<e.len-14;s+=6.3){const h=kitHash(e.id*2+(sd>0?1:0),Math.round(s));if(h>.42)continue;
      edgePos(e,s,P);const nx=-P.dy*sd,ny=P.dx*sd,off=e.r.w/2+.3,x=P.x+nx*off,y=P.y+ny*off;
      // innen Fahrbahn, außen kein Haus, keine Kreuzung/Einfahrt, nicht auf dem Schulgelände
      let ok=true;for(const [o,a] of [[-.95,0],[1.05,0],[-.95,2.2],[-.95,-2.2],[1.05,2.2],[1.05,-2.2]]){const qx=x+nx*o+P.dx*a,qy=y+ny*o+P.dy*a,i=gi(qx,qy);if(i<0||hgt[i]||solid[i]){ok=false;break}if(o<0&&!(surf[i]&4)){ok=false;break}}
      if(!ok)continue;if(typeof inSchool==="function"&&inSchool(x,y,3))continue;if(nearRoom(x,y))continue;
      const o2=nearestRoad(x,y,e.r.w/2+5,q=>q!==e&&q.r&&q.r.w>=3.5&&!/footway|path|steps|cycleway/.test(q.r.h||""));if(o2)continue;
      const S={x,y,ang:Math.atan2(P.dy,P.dx)+(kitHash(e.id,Math.round(s*3))<.5?Math.PI:0),roll:sd,m:Math.floor(kitHash(Math.round(s),e.id)*3),c:Math.floor(kitHash(e.id+7,Math.round(s))*RA_PARKCOL.length)};
      RA.slots.push(S);const k=Math.floor(x/RA.cell)+"_"+Math.floor(y/RA.cell);(RA.grid.get(k)||RA.grid.set(k,[]).get(k)).push(S)}}}

/* ---------- parkende Autos um die Spielfigur aufbauen ---------- */
function raPark(){if(!RA.inst)return;const cap=RA_CAP[GFX.id]||RA_CAP.standard,R=cap.r,px=car.x,py=car.y,near=[];
  for(let a=Math.floor((px-R)/RA.cell);a<=Math.floor((px+R)/RA.cell);a++)for(let b=Math.floor((py-R)/RA.cell);b<=Math.floor((py+R)/RA.cell);b++){const L=RA.grid.get(a+"_"+b);if(L)for(const S of L){const d=Math.hypot(S.x-px,S.y-py);if(d<R)near.push([d,S])}}
  near.sort((a,b)=>a[0]-b[0]);for(const K of RA.inst)K.n=0;
  // Kollision: alte Einträge entfernen, je Auto drei kleine Kreise längs
  for(let i=parkedList.length-1;i>=0;i--)if(parkedList[i].ra)parkedList.splice(i,1);
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),Pv=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1);let n=0;
  for(const [d,S] of near){if(n>=cap.park)break;const mi=RA.ok.indexOf(S.m)>=0?RA.ok.indexOf(S.m):0,K=RA.inst[mi];if(!K||K.n>=K.cap)continue;
    // Räder auf der Gehwegseite 15 cm höher: Auto leicht um die Längsachse geneigt
    const fx=Math.cos(S.ang),fy=Math.sin(S.ang);E.set(0,-S.ang,0);Q.setFromEuler(E);Q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(fx,0,fy),raRoll(S)));
    Pv.set(S.x,(ROAD_Y+SIDE_Y)/2,S.y);M.compose(Pv,Q,S1);
    K.ms.forEach((im,j)=>{im.setMatrixAt(K.n,M);if(im.instanceColor){im.setColorAt(K.n,RA_COL.set(RA_PARKCOL[S.c]).convertSRGBToLinear());}});K.n++;n++;
    for(const t of [-1.45,0,1.45])parkedList.push({x:S.x+fx*t,y:S.y+fy*t,bike:true,ra:true})}
  for(const K of RA.inst)for(const im of K.ms){im.count=K.n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}}
/* Neigung: die Räder auf der Gehwegseite stehen 15 cm höher */
function raRoll(S){const i=gi(S.x+(-Math.sin(S.ang))*.9,S.y+Math.cos(S.ang)*.9);const left=i>=0&&(surf[i]&8)&&!(surf[i]&4);return left?-.09:.09}

/* ---------- Stadtverkehr: Rheydt-Modelle in der Nähe ---------- */
function raTraffic(){RA.traf=[];for(const n of npcs){if(n.bike||n.police)continue;const i=RA.ok[Math.floor(kitHash(npcs.indexOf(n),5)*RA.ok.length)],P=KIT.parts["ra"+i];
    const g=new THREE.Group();for(const q of P.parts){let m=q.mat;if(q.lack){m=q.mat.clone();m.color.set(n.col).convertSRGBToLinear()}const me=new THREE.Mesh(q.geo,m);me.castShadow=true;me.receiveShadow=true;g.add(me)}
    g.visible=false;scene.add(g);n.ra=g;RA.traf.push(n)}}
{const base=update;update=function(dt){base(dt);if(!RA.ready)return;
  const cap=RA_CAP[GFX.id]||RA_CAP.standard;let shown=0;
  const L=RA.traf.map(n=>[n.x===undefined?1e9:Math.hypot(n.x-car.x,n.y-car.y),n]).sort((a,b)=>a[0]-b[0]);
  for(const [d,n] of L){const on=d<cap.trafR&&shown<cap.traf&&!n.police&&n.mesh&&n.mesh.parent;if(on){shown++;n.ra.position.copy(n.mesh.position);n.ra.rotation.copy(n.mesh.rotation)}
    if(n.ra.visible!==on)n.ra.visible=on;if(n.mesh)n.mesh.visible=!on&&d<cap.farR}
  for(const n of npcs)if(n.bike&&n.mesh&&n.x!==undefined)n.mesh.visible=Math.hypot(n.x-car.x,n.y-car.y)<cap.farR;
  RA.last.t-=dt;if(RA.last.t>0)return;RA.last.t=.5;if(Math.hypot(car.x-RA.last.x,car.y-RA.last.y)<8)return;RA.last.x=car.x;RA.last.y=car.y;raPark()}}
{const base=kitInit;kitInit=async function(){await base.apply(this,arguments);try{await raInit()}catch(e){console.warn("Rheydt-Autos",e)}}}
/* Bodenkontakt: Reifen der Rheydt-Modelle standen gemessen 3–4 cm in der Fahrbahn */
{const base=groundContact,UP={rstadt:.04,rlim:.045,rsuv:.04};groundContact=function(){base();const VH=V(),g=vehMeshes[VH.id];if(g&&UP[VH.id]&&!VH.fly)g.position.y+=UP[VH.id]}}
