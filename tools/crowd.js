/* ================= Stadtbewohner: viele unterschiedliche Personen mit Rollen, Kleidung und Verhalten ================= */
/* Nahe Personen werden als animierte Figuren gezeigt (Gehen, Laufen, Stehen, Plaudern, Jubeln …),
   weiter entfernte als einfache Silhouetten. So bleibt die Stadt voll und das iPad flüssig. */
const CR={near:isTouch?12:24,radius:isTouch?42:55,t:0,fixed:false};
const SKINS=["#f6d5b8","#efc29c","#e0ac7e","#c68e63","#a86f48","#8d5a3b","#5c3b28"];
const HAIRS=["#1c1410","#2e2018","#4a3020","#6b4226","#9a6a3a","#c89a5a","#e3c27a","#8c2f1a"];
const GREYS=["#d9d9d9","#bdbdbd","#efeae0","#a7a7a7"];
const rng=(a,b)=>a+Math.random()*(b-a), chance=p=>Math.random()<p;
const ROLES={
  schueler:   {w:4,label:"Schüler",scale:[.9,.97],sp:[1.2,1.6],jacket:["#2f4f7a","#c0392b","#2e8b57","#1b1b1b","#7b3fa0","#e8742a","#55606e"],jeans:["#3a4f72","#1f2633","#55606e"],acc:["backpack"],opt:{cap:.3}},
  schuelerin: {w:4,label:"Schülerin",scale:[.88,.95],sp:[1.2,1.55],jacket:["#e05a8c","#17a2b8","#f2b81f","#f2f2f2","#7b3fa0","#2e8b57"],jeans:["#3a4f72","#1f2633","#2a2a2a"],acc:["backpack","ponytail"],opt:{}},
  fan:        {w:2,label:"Fußballfan",scale:[.97,1.04],sp:[1.2,1.5],jacket:["#1f8a4c","#f2f2f2","#151515"],jeans:["#3a4f72","#1f2633"],acc:["scarf"],opt:{cap:.4}},
  seniorin:   {w:2,label:"Seniorin",scale:[.9,.95],sp:[.6,.85],hair:GREYS,jacket:["#c9b38f","#9a7fb0","#2b3a5a","#7a8a6a","#b05050"],jeans:["#3a3a44","#5a4a3a","#2b3a5a"],acc:["skirt","handbag","bun"],opt:{glasses:.6},stoop:.08},
  senior:     {w:2,label:"Senior",scale:[.94,1.0],sp:[.55,.8],hair:GREYS,jacket:["#6b5a43","#55606e","#3d4552","#7a6a5a"],jeans:["#3a3a44","#4a4a4a","#5a4a3a"],acc:["flatcap","cane"],opt:{glasses:.5},stoop:.14},
  bauarbeiter:{w:1,label:"Straßenbauer",scale:[1.0,1.06],sp:[1.1,1.3],jacket:["#ff7a00","#ffd21f"],jeans:["#2a2f3a","#3a3f4a"],acc:["vest","helmet"],opt:{}},
  joggerin:   {w:2,label:"Joggerin",scale:[.93,.99],sp:[2.9,3.6],run:true,jacket:["#ff2a85","#00c2d1","#a3e635","#7c3aed","#f97316"],jeans:["#1b1b1b","#2a2a3a"],acc:["ponytail","headband"],opt:{},short:true},
  jogger:     {w:1,label:"Jogger",scale:[.98,1.04],sp:[3.0,3.8],run:true,jacket:["#0ea5e9","#ef4444","#f2f2f2","#22c55e"],jeans:["#1b1b1b","#334155"],acc:["headband"],opt:{},short:true},
  business:   {w:2,label:"Geschäftsmann",scale:[.98,1.04],sp:[1.4,1.7],jacket:["#1f2a44","#2b2b2b","#3d4552"],same:true,acc:["briefcase"],opt:{glasses:.3}},
  businesswoman:{w:2,label:"Geschäftsfrau",scale:[.93,.99],sp:[1.35,1.65],jacket:["#1f2a44","#7a2633","#2b2b2b","#e9e4da"],jeans:["#2b2b2b","#1f2a44"],acc:["skirt","handbag","bun"],opt:{glasses:.3}},
  passant:    {w:7,label:"Passant",scale:[.92,1.04],sp:[1.0,1.5],jacket:["#2f4f7a","#c0392b","#2e8b57","#f2b81f","#7b3fa0","#1b1b1b","#e8742a","#e9e9e9","#e05a8c","#17a2b8","#8b5a2b","#55606e"],jeans:["#3a4f72","#1f2633","#55606e","#6b5a43","#2d3d2a","#c9b38f"],acc:[],opt:{cap:.12,glasses:.2,shopping:.3,ponytail:.25,longhair:.15}},
  hund:       {w:1.2,label:"mit Hund",scale:[.94,1.02],sp:[.9,1.2],jacket:["#2e8b57","#55606e","#8b5a2b","#2f4f7a"],jeans:["#3a4f72","#1f2633"],acc:[],opt:{cap:.25},dog:true},
};
function makeLook(role){
  const R=ROLES[role],jacket=pick(R.jacket),acc=R.acc.slice();
  for(const [k,p] of Object.entries(R.opt||{}))if(chance(p))acc.push(k==="shopping"?"shoppingbag":k);
  return {role,jacket,jeans:R.same?jacket:pick(R.jeans),skin:pick(SKINS),hair:pick(R.hair||HAIRS),scale:rng(...R.scale),acc,stoop:R.stoop||0,run:!!R.run,short:!!R.short,dog:!!R.dog,
    shoe:R.run?pick(["#f2f2f2","#ff2a85","#00c2d1"]):pick(["#f1f1ee","#2a2a2a","#5a4030","#1b1b1b"]),bag:pick(["#e2a91c","#d81e2c","#1b2f6b","#1b1b1b","#2e8b57"])}
}
function pickRole(){let s=0;for(const k in ROLES)s+=ROLES[k].w;let r=Math.random()*s;for(const k in ROLES){r-=ROLES[k].w;if(r<=0)return k}return "passant"}

/* Rollen für alle Fußgänger (auch die Marktbesucher) */
for(const p of peds){const role=p.static?pick(["passant","passant","seniorin","senior","businesswoman"]):pickRole();p.look=makeLook(role);p.col=p.look.jacket;
  if(!p.static)p.sp=rng(...ROLES[role].sp);if(p.static&&!p.act)p.act=pick(["wait","chat","phone"])}

/* Gruppen an festen Orten: Bushaltestelle, Baustelle, Fans am Alten Markt, Rathaus, Schulhof, Spielplatz, Nordpark */
const GV=MG.givers||{};
const GROUPS=[
  {at:[-317.5,-56.6],members:[["schuelerin","wait"],["senior","wait"],["passant","phone"],["schueler","chat"]],spread:1.6},
  GV.crane&&{at:[GV.crane[0]+5,GV.crane[1]+3],members:[["bauarbeiter","chat"],["bauarbeiter","chat"],["bauarbeiter","work"]],spread:1.2},
  GV.fire&&{at:[GV.fire[0]+7,GV.fire[1]+5],members:[["fan","cheer"],["fan","cheer"],["fan","cheer"],["fan","chat"],["fan","cheer"]],spread:1.5},
  GV.amt&&{at:[GV.amt[0]-6,GV.amt[1]+4],members:[["business","chat"],["businesswoman","chat"],["businesswoman","phone"]],spread:1.0},
  {at:[-300,-122],members:[["schueler","chat"],["schuelerin","chat"],["schuelerin","chat"]],spread:1.0},
  {at:[-287,-140],members:[["schueler","chat"],["schueler","cheer"],["schuelerin","chat"],["schueler","chat"]],spread:1.1},
  {at:[-164,12],members:[["passant","wait"],["seniorin","chat"],["kind","play"],["kind","play"]],spread:1.6},
  GV.heli&&{at:[GV.heli[0]+8,GV.heli[1]+6],members:[["joggerin","stretch"],["jogger","stretch"]],spread:1.3},
  GV.tv&&{at:[GV.tv[0]-5,GV.tv[1]+4],members:[["passant","phone"],["passant","chat"],["businesswoman","chat"]],spread:1.0},
  GV.taxi&&{at:[GV.taxi[0]-6,GV.taxi[1]+3],members:[["business","wait"],["passant","wait"],["seniorin","wait"]],spread:1.4},
].filter(Boolean);
for(const G of GROUPS){const n=G.members.length;G.members.forEach(([role,act],k)=>{
  const a=k/n*Math.PI*2,x=G.at[0]+Math.cos(a)*G.spread,y=G.at[1]+Math.sin(a)*G.spread;
  const kid=role==="kind",look=makeLook(kid?pick(["schueler","schuelerin"]):role);if(kid){look.scale=rng(.68,.76);look.acc=look.acc.filter(x=>x!=="backpack")}
  peds.push({static:true,x,y,a:0,ox:0,oy:0,ph:Math.random()*6,col:look.jacket,look,act,fix:true,cx:G.at[0],cy:G.at[1],seed:Math.random()*10})})}

/* ---- leichte, animierbare Figur (gleiches Skelett wie die Spielfigur, deutlich weniger Teile) ---- */
let CG=null;
function crowdGeos(){if(CG)return CG;const C=(a,b,h,s=10)=>{const g=new THREE.CylinderGeometry(a,b,h,s);g.translate(0,-h/2,0);return g};
  CG={pelvis:new THREE.SphereGeometry(.16,12,8),torso:new THREE.CylinderGeometry(.19,.165,.56,14),shoulders:new THREE.SphereGeometry(.2,14,10),neck:new THREE.CylinderGeometry(.046,.05,.1,8),
    head:new THREE.SphereGeometry(.104,16,12),hair:new THREE.SphereGeometry(.112,14,10,0,Math.PI*2,0,Math.PI*.55),upper:C(.056,.047,.28),fore:C(.046,.04,.24),hand:new THREE.SphereGeometry(.042,8,6),
    thigh:C(.082,.062,.44),shin:C(.061,.046,.43),shoe:new THREE.SphereGeometry(.07,10,8),
    box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,10,8),ring:new THREE.TorusGeometry(1,.16,6,16),cyl:new THREE.CylinderGeometry(1,1,1,10),cone:new THREE.CylinderGeometry(.12,.25,.4,14,1,true)};
  return CG}
let CROWD_MAT=null;
/** Fügt viele kleine Teile eines Körperglieds zu EINEM Mesh mit Vertexfarben zusammen (spart Zeichenaufrufe). */
function mergeParts(parts){
  let nV=0,nI=0;for(const q of parts){nV+=q.geo.attributes.position.count;nI+=q.geo.index?q.geo.index.count:q.geo.attributes.position.count}
  const pos=new Float32Array(nV*3),nor=new Float32Array(nV*3),col=new Float32Array(nV*3),idx=new Uint32Array(nI),v=new THREE.Vector3(),nm=new THREE.Matrix3();
  let vo=0,io=0;
  for(const q of parts){const P=q.geo.attributes.position,N=q.geo.attributes.normal;nm.getNormalMatrix(q.m);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(q.m);pos[(vo+i)*3]=v.x;pos[(vo+i)*3+1]=v.y;pos[(vo+i)*3+2]=v.z;
      v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[(vo+i)*3]=v.x;nor[(vo+i)*3+1]=v.y;nor[(vo+i)*3+2]=v.z;
      col[(vo+i)*3]=q.c.r;col[(vo+i)*3+1]=q.c.g;col[(vo+i)*3+2]=q.c.b}
    if(q.geo.index){const A=q.geo.index.array;for(let k=0;k<A.length;k++)idx[io+k]=A[k]+vo;io+=A.length}else{for(let k=0;k<P.count;k++)idx[io+k]=vo+k;io+=P.count}
    vo+=P.count}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("normal",new THREE.BufferAttribute(nor,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));
  g.computeBoundingSphere();return g}
function makeCitizen(L){
  const G=crowdGeos();CROWD_MAT=CROWD_MAT||new THREE.MeshLambertMaterial({vertexColors:true});
  const g=new THREE.Group(),root=new THREE.Group(),hips=new THREE.Group();hips.position.y=.935;root.add(hips);g.add(root);root.scale.setScalar(L.scale);
  const bones=new Map(),col=c=>{const k=new THREE.Color(c);if(window.__lin)k.convertSRGBToLinear();return k},E=new THREE.Euler(),Q=new THREE.Quaternion();
  // Teil vormerken: Knochen-Gruppe, Geometrie, Farbe, Position, Skalierung, Drehung
  const add=(bone,geo,c,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{if(!bones.has(bone))bones.set(bone,[]);
    bones.get(bone).push({geo,c:col(c),m:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),Q.setFromEuler(E.set(rx,ry,rz)),new THREE.Vector3(sx,sy,sz))})};
  const torso=new THREE.Group();hips.add(torso);
  const head=new THREE.Group();head.position.y=.8;torso.add(head);
  add(hips,G.pelvis,L.jeans,0,0,0,.75,.62,1.08);
  add(torso,G.torso,L.jacket,0,.3,0,.74,1,1.1);add(torso,G.shoulders,L.jacket,0,.46,0,.64,.55,1.12);add(torso,G.neck,L.skin,0,.67,0);
  add(head,G.head,L.skin,0,0,0,.93,1.12,.86);
  if(!L.acc.includes("bald"))add(head,G.hair,L.hair,-.012,.016,0,.98,1.08,.92);
  const limb=s=>{const arm=new THREE.Group();arm.position.set(0,.555,s*.225);torso.add(arm);add(arm,G.upper,L.short?L.skin:L.jacket,0,0,0);
    const elb=new THREE.Group();elb.position.y=-.29;arm.add(elb);add(elb,G.fore,L.short?L.skin:L.jacket,0,0,0);add(elb,G.hand,L.skin,.008,-.27,0,.75,1.15,.55);
    const leg=new THREE.Group();leg.position.set(0,0,s*.092);hips.add(leg);add(leg,G.thigh,L.jeans,0,0,0);
    const knee=new THREE.Group();knee.position.y=-.44;leg.add(knee);add(knee,G.shin,L.jeans,0,0,0);
    const ankle=new THREE.Group();ankle.position.y=-.445;knee.add(ankle);add(ankle,G.shoe,L.shoe,.06,-.005,0,1.85,.55,.75);
    return {arm,elb,leg,knee,ankle}};
  const Lm=limb(1),Rm=limb(-1);root.userData.h={hips,torso,head,L:Lm,R:Rm};
  // Zubehör je Rolle
  const A=new Set(L.acc),hand=Rm.elb;
  if(A.has("backpack"))add(torso,G.box,L.bag,-.19,.36,0,.14,.36,.28);
  if(A.has("ponytail"))add(head,G.ball,L.hair,-.115,-.03,0,.045,.11,.045);
  if(A.has("longhair"))add(head,G.ball,L.hair,-.06,-.07,0,.07,.14,.11);
  if(A.has("bun"))add(head,G.ball,L.hair,-.08,.09,0,.05,.05,.05);
  if(A.has("cap")){const c=pick(["#d81e2c","#1b2f6b","#1b1b1b","#2e8b57","#f2f2f2"]);add(head,G.hair,c,-.005,.035,0,1.02,.85,1);add(head,G.box,c,.1,.04,0,.13,.012,.17)}
  if(A.has("flatcap")){const c=pick(["#6b5a43","#4a4a4a","#7a6a5a"]);add(head,G.ball,c,0,.085,0,.12,.045,.115);add(head,G.box,c,.1,.07,0,.08,.012,.15)}
  if(A.has("helmet")){const c=pick(["#f2f2f2","#ffd21f"]);add(head,G.hair,c,-.005,.035,0,1.12,1,1.1);add(head,G.cyl,c,-.005,.045,0,.15,.01,.15)}
  if(A.has("headband"))add(head,G.ring,pick(["#f2f2f2","#1b1b1b","#ff2a85"]),-.005,.05,0,.104,.104,.104,Math.PI/2);
  if(A.has("glasses"))for(const s of [1,-1])add(head,G.box,"#141414",.1,.025,s*.036,.02,.034,.048);
  if(A.has("scarf")){add(torso,G.ring,"#1f8a4c",0,.64,0,.085,.085,.1,Math.PI/2);add(torso,G.ring,"#f2f2f2",0,.6,0,.085,.085,.1,Math.PI/2);add(torso,G.box,"#151515",.12,.45,.05,.03,.22,.07)}
  if(A.has("vest"))for(const y of [.22,.4])add(torso,G.ring,"#e6e6e6",0,y,0,.135,.19,.12,Math.PI/2);
  if(A.has("skirt"))add(hips,G.cone,L.jeans,0,-.12,0,1,1,1.15);
  if(A.has("handbag"))add(hand,G.box,L.bag,0,-.37,0,.06,.14,.2);
  if(A.has("briefcase"))add(hand,G.box,"#2a1d14",0,-.42,0,.08,.24,.32);
  if(A.has("shoppingbag"))add(Lm.elb,G.box,pick(["#e9e0cc","#d81e2c","#f2f2f2"]),0,-.44,0,.1,.3,.24);
  if(A.has("cane"))add(hand,G.cyl,"#3a2a1a",.03,-.68,0,.012,.85,.012);
  // je Knochen ein Mesh; Schatten nur von Rumpf und Beinen
  for(const [bone,parts] of bones){const m=new THREE.Mesh(mergeParts(parts),CROWD_MAT);m.castShadow=bone===torso||bone===Lm.leg||bone===Rm.leg||bone===Lm.knee||bone===Rm.knee;bone.add(m)}
  g.userData={root,h:root.userData.h};return g}

/* ---- Auswahl der nahen Figuren und Animation ---- */
let crowdGroup=null;
function fixStatic(){for(const p of peds){if(!p.fix)continue;
  if(blockedGround(p.x,p.y)){outer:for(let r=.5;r<8;r+=.5)for(let k=0;k<12;k++){const a=k/12*Math.PI*2,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(!blockedGround(x,y)){p.x=x;p.y=y;break outer}}}
  p.a=Math.atan2(p.cy-p.y,p.cx-p.x);p.fix=false}CR.fixed=true}
function updateCrowd(dt,now){
  if(!crowdGroup){crowdGroup=new THREE.Group();scene.add(crowdGroup)}
  if(!CR.fixed)fixStatic();
  const cx=car.x,cy=car.y;
  CR.t-=dt;if(CR.t<=0){CR.t=.3;
    const list=[];for(const p of peds){if(p.x===undefined)continue;const d=Math.hypot(p.x-cx,p.y-cy);if(d<CR.radius)list.push([d,p])}
    list.sort((a,b)=>a[0]-b[0]);const ranked=list.slice(0,CR.near).map(e=>e[1]),keep=new Set(ranked);
    // die nächsten Personen bekommen – wo vorhanden – das echte 3D-Modell ihrer Rolle
    const useGlb=new Set();if(GLB.ready){let n=0;for(const q of ranked){if(n>=GLB.near)break;const mn=GLB.files[q.look.role];if(mn&&GLB.models[mn]&&(!q.static||GLB_ACTS.has(q.act))){useGlb.add(q);n++}}}
    for(const p of peds){const on=keep.has(p),g=useGlb.has(p);
      if(g&&!p.glb)p.glb=glbTake(GLB.files[p.look.role],p);if(!g&&p.glb){glbGive(p.glb);p.glb=null}
      const proc=on&&!g;if(proc&&!p.mesh){p.mesh=makeCitizen(p.look);crowdGroup.add(p.mesh)}
      if(on&&p.look.dog&&!p.dogM)p.dogM=makeDog();
      p.det=on;if(p.mesh)p.mesh.visible=proc;if(p.dogM)p.dogM.visible=on}}
  const t=now/1000;
  for(const p of peds){if(!p.det)continue;if(p.glb){glbPose(p,dt,now);continue}if(!p.mesh)continue;const m=p.mesh,h=m.userData.h,L=p.look,gy=groundY(p.x,p.y);
    m.position.set(p.x,gy,p.y);m.rotation.y=-p.a;
    if(!p.static){const sp=p.sp,rn=L.run?1:0,stl=strideLen(sp,rn);p.cph=(p.cph||Math.random()*6)+dt*sp*2*Math.PI/stl;   // Standfuß bewegt sich genau mit dem Körpertempo: kein Rutschen
      poseHuman(m.userData.root,p.cph,1,rn,t,stl/L.scale);if(L.stoop)h.torso.rotation.z-=L.stoop;}
    else{poseHuman(m.userData.root,0,0,0,t+p.seed);const s=t*1.6+p.seed;
      if(L.stoop)h.torso.rotation.z-=L.stoop;
      if(p.act==="chat"){h.head.rotation.y=Math.sin(s*.7)*.25;h.R.arm.rotation.z=-.25-Math.max(0,Math.sin(s*1.3))*.35;h.R.elb.rotation.z=.9+Math.sin(s*2.1)*.25}
      else if(p.act==="phone"){h.R.arm.rotation.z=-.35;h.R.arm.rotation.x=.25;h.R.elb.rotation.z=2.2;h.head.rotation.z=-.15}
      else if(p.act==="cheer"){const j=Math.max(0,Math.sin(s*3));m.position.y=gy+j*.12;h.L.arm.rotation.x=-2.6;h.R.arm.rotation.x=2.6;h.L.elb.rotation.z=h.R.elb.rotation.z=.2+j*.3}
      else if(p.act==="stretch"){h.torso.rotation.z=-.35-Math.sin(s)*.15;h.L.arm.rotation.z=h.R.arm.rotation.z=-.6}
      else if(p.act==="play"){const j=Math.abs(Math.sin(s*2.4));m.position.y=gy+j*.25;h.L.arm.rotation.x=-1.2*j;h.R.arm.rotation.x=1.2*j}
      else if(p.act==="work"){h.torso.rotation.z=-.45;h.L.arm.rotation.z=h.R.arm.rotation.z=-.9+Math.sin(s*2)*.25;h.L.elb.rotation.z=h.R.elb.rotation.z=.4}
      else{h.head.rotation.y=Math.sin(s*.3)*.35}}
    if(p.dogM){const D=p.dogM,U=D.userData,bx=p.x-Math.cos(p.a)*1.1+Math.sin(p.a)*.5,by=p.y-Math.sin(p.a)*1.1-Math.cos(p.a)*.5;
      D.position.set(bx,groundY(bx,by),by);D.rotation.y=-p.a;const ph=(p.cph||0)*2;U.legs.forEach((l,i)=>l.rotation.z=p.static?0:Math.sin(ph+(i%2?0:Math.PI)+(i>1?Math.PI/2:0))*.6);U.tail.rotation.x=Math.sin(now/90)*.6}}
}
{const base=animQuestWorld;animQuestWorld=function(dt,now){base(dt,now);if(window.__lin)updateCrowd(dt,now)}}

/* ================= Echte 3D-Stadtfiguren (GLB-Dateien mit Idle, Walk, Run) ================= */
const GLB={base:"figuren/",ready:false,near:isTouch?6:12,models:{},pools:{},
  files:{schuelerin:"01_Schuelerin",fan:"02_Fussballfan",seniorin:"03_Seniorin",senior:"04_Senior",bauarbeiter:"05_Strassenbauer",joggerin:"06_Joggerin",businesswoman:"07_Geschaeftsfrau",passant:"08_Passant",hund:"08_Passant"}};
const GLB_ACTS=new Set(["wait","chat","phone"]);      // Stehende, für die die Idle-Animation passt
const loadScript=src=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
async function initGlbCrowd(){
  try{if(!THREE.GLTFLoader)await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js");
      if(!THREE.SkeletonUtils)await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js")}
  catch(e){console.info("3D-Figuren: Lader nicht erreichbar, es bleiben die einfachen Figuren");return}
  const loader=new THREE.GLTFLoader();
  for(const name of [...new Set(Object.values(GLB.files))]){         // nacheinander im Hintergrund laden
    try{const g=await loader.loadAsync(GLB.base+name+".glb");GLB.models[name]=prepGlb(g);GLB.ready=true}
    catch(e){console.info("3D-Figur nicht geladen:",name)}}
}
/** Modell vorbereiten: Animationen auf der Stelle, Materialien, Bodenabstand, Lauftempo der Clips messen. */
function prepGlb(gltf){
  const scene=gltf.scene,clips={};
  for(const c of gltf.animations){
    for(const tr of c.tracks)if(/Hips\.position$/.test(tr.name)){const v=tr.values;for(let i=0;i<v.length;i+=3){v[i]=v[0];v[i+2]=v[2]}}   // nur Auf-und-Ab bleibt
    clips[c.name.toLowerCase()]=c}
  scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;
    const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(ENV){m.envMap=ENV;m.envMapIntensity=.55}if(m.metalness>.3&&!m.metalnessMap)m.metalness=.1;m.needsUpdate=true}});
  const M={scene,clips,offY:0,speed:{walk:1.3,run:3.2}};
  // Messung an einer Kopie: Füße bei Idle auf den Boden, Standfuß-Tempo von Walk und Run
  const probe=THREE.SkeletonUtils.clone(scene),mx=new THREE.AnimationMixer(probe),feet=[];probe.updateMatrixWorld(true);
  probe.traverse(o=>{if(o.isBone&&/(Left|Right)ToeBase$/.test(o.name))feet.push(o)});
  const v=new THREE.Vector3(),sample=(clip,t)=>{mx.stopAllAction();const a=mx.clipAction(clip);a.play();a.time=t;mx.update(0);probe.updateMatrixWorld(true);return feet.map(f=>f.getWorldPosition(v).clone())};
  if(clips.idle){sample(clips.idle,0);let lo=1e9;const w=new THREE.Vector3();          // tiefster Punkt der Schuhsohle in der Idle-Pose
    probe.traverse(o=>{if(!o.isSkinnedMesh)return;o.skeleton.update();const n=o.geometry.attributes.position.count;
      for(let i=0;i<n;i+=3){o.boneTransform(i,w);w.applyMatrix4(o.matrixWorld);if(w.y<lo)lo=w.y}});
    if(lo<1e8)M.offY=-lo}
  for(const k of ["walk","run"]){const c=clips[k];if(!c||!feet.length)continue;const N=90,pts=[];for(let i=0;i<=N;i++)pts.push(sample(c,c.duration*i/N));
    let dist=0,time=0;for(let fi=0;fi<feet.length;fi++){const ys=pts.map(q=>q[fi].y),lo=Math.min(...ys);
      for(let i=1;i<=N;i++)if(pts[i][fi].y<lo+.02&&pts[i-1][fi].y<lo+.02){dist+=Math.abs(pts[i][fi].z-pts[i-1][fi].z);time+=c.duration/N}}
    if(time>0)M.speed[k]=dist/time}
  mx.stopAllAction();
  return M}
function glbTake(name,p){const M=GLB.models[name],pool=GLB.pools[name]||(GLB.pools[name]=[]);let I=pool.pop();
  if(!I){const obj=THREE.SkeletonUtils.clone(M.scene),mixer=new THREE.AnimationMixer(obj),act={};for(const k in M.clips)act[k]=mixer.clipAction(M.clips[k]);I={obj,mixer,act,M,cur:null};scene.add(obj)}
  I.obj.visible=true;I.obj.scale.setScalar(rng(.97,1.03));I.cur=null;I.mixer.stopAllAction();glbState(I,p,0);
  if(I.cur)I.cur.time=Math.random()*I.cur.getClip().duration;return I}
function glbGive(I){I.obj.visible=false;I.mixer.stopAllAction();I.cur=null;(GLB.pools[Object.keys(GLB.models).find(k=>GLB.models[k]===I.M)]||[]).push(I)}
/** Passende Animation wählen und weich überblenden; Abspieltempo so, dass die Füße nicht rutschen. */
function glbState(I,p,fade){const moving=!p.static&&!p.hold,k=moving?(p.look.run&&I.act.run?"run":"walk"):"idle",a=I.act[k]||I.act.idle;if(!a)return;
  if(moving){const s=I.obj.scale.x;a.timeScale=p.sp/(I.M.speed[k]*s)}else a.timeScale=1;
  if(I.cur===a)return;a.enabled=true;a.setEffectiveWeight(1);a.reset().play();
  if(I.cur&&fade>0)I.cur.crossFadeTo(a,fade,false);else if(I.cur)I.cur.stop();I.cur=a}
function glbPose(p,dt,now){const I=p.glb;glbState(I,p,.35);I.mixer.update(dt);
  I.obj.position.set(p.x,groundY(p.x,p.y)+I.M.offY*I.obj.scale.x,p.y);I.obj.rotation.y=Math.PI/2-p.a;   // Modelle schauen nach +Z
  if(p.dogM){const D=p.dogM,U=D.userData,bx=p.x-Math.cos(p.a)*1.1+Math.sin(p.a)*.5,by=p.y-Math.sin(p.a)*1.1-Math.cos(p.a)*.5;p.cph=(p.cph||0)+dt*p.sp*3;
    D.position.set(bx,groundY(bx,by),by);D.rotation.y=-p.a;U.legs.forEach((l,i)=>l.rotation.z=p.static?0:Math.sin(p.cph+(i%2?0:Math.PI)+(i>1?Math.PI/2:0))*.6);U.tail.rotation.x=Math.sin(now/90)*.6}}
