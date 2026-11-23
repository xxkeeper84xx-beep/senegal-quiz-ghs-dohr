/* ================= Stadtbewohner: viele unterschiedliche Personen mit Rollen, Kleidung und Verhalten ================= */
/* Alle Personen in Sichtweite sind die 3D-Stadtfiguren (figuren/*.json) mit Idle, Walk und Run.
   Für das iPad: höchstens 18 Figuren gleichzeitig (Computer 40), weiter entfernte Figuren werden seltener animiert.
   Die einfachen Figuren erscheinen nur, solange die 3D-Figuren noch laden (oder wenn das Laden scheitert). */
const CR={near:isTouch?18:40,radius:isTouch?70:110,t:0,fixed:false};
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
  passant:    {w:11,label:"Passant",scale:[.92,1.04],sp:[1.0,1.5],jacket:["#2f4f7a","#c0392b","#2e8b57","#f2b81f","#7b3fa0","#1b1b1b","#e8742a","#e9e9e9","#e05a8c","#17a2b8","#8b5a2b","#55606e"],jeans:["#3a4f72","#1f2633","#55606e","#6b5a43","#2d3d2a","#c9b38f"],acc:[],opt:{cap:.12,glasses:.2,shopping:.3,ponytail:.25,longhair:.15}},
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
if(MG.FX){   /* Gruppen der früheren Spielkarte an ihre neuen Orte, dazu echte Treffpunkte */
  for(let k=GROUPS.length-1;k>=0;k--){const G=GROUPS[k];if(G.at[0]===-164&&G.at[1]===12)G.at=[600,618];G.at=MG.FX(...G.at)}
  const O=MG.real.orte,near=(o,dx,dy)=>[o.x+dx,o.y+dy];
  if(O.rheydt_marktplatz)GROUPS.push({at:near(O.rheydt_marktplatz,8,10),members:[["passant","chat"],["seniorin","chat"],["passant","phone"],["businesswoman","chat"]],spread:1.4});
  if(O.rheydt_hbf)GROUPS.push({at:near(O.rheydt_hbf,6,6),members:[["business","wait"],["passant","wait"],["seniorin","wait"],["schuelerin","phone"]],spread:1.6});
  for(const q of (MG.pois||[]).filter(q=>/bus_stop|platform/.test(q.k)&&Math.hypot(q.x-MG.start[0],q.y-MG.start[1])<450).slice(0,3))GROUPS.push({at:[q.x+1.5,q.y+1.5],members:[["passant","wait"],["schuelerin","wait"]],spread:1.2})}
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
    const useGlb=new Set();if(GLB.ready)for(const q of ranked){const mn=GLB.files[q.look.role];if(mn&&GLB.models[mn])useGlb.add(q)}
    for(const p of peds){const on=keep.has(p),g=useGlb.has(p);
      if(g&&!p.glb)p.glb=glbTake(GLB.files[p.look.role],p);if(!g&&p.glb){glbGive(p.glb);p.glb=null}
      const proc=on&&!g&&GLB.failed;if(proc&&!p.mesh){p.mesh=makeCitizen(p.look);crowdGroup.add(p.mesh)}
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
  files:{schuelerin:"01_Schuelerin",schueler:"02_Fussballfan",fan:"02_Fussballfan",seniorin:"03_Seniorin",senior:"04_Senior",bauarbeiter:"05_Strassenbauer",joggerin:"06_Joggerin",jogger:"08_Passant",business:"08_Passant",businesswoman:"07_Geschaeftsfrau",passant:"08_Passant",hund:"08_Passant"}};
const GLB_ACTS=new Set(["wait","chat","phone"]);      // Stehende, für die die Idle-Animation passt
const loadScript=src=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
async function initGlbCrowd(){
  /* GLTFLoader und SkeletonUtils sind ins Spiel eingebaut: kein Nachladen von einem fremden Server (Schulnetze sperren solche Server oft) */
  if(!THREE.GLTFLoader||!THREE.SkeletonUtils){GLB.failed=true;return}
  const loader=new THREE.GLTFLoader();
  const first=(PROF&&PROF.look&&PROF.look.model)||LOOK_DEF.model,names=[...new Set([first,...Object.values(GLB.files),...FIG_CHOICES.map(f=>f[0]).filter(n=>n!=="classic")])];
  GLB.total=names.length;GLB.loaded=0;
  for(const name of names){         // nacheinander im Hintergrund laden, Spielfigur zuerst
    try{let g=await loader.loadAsync(GLB.base+name+".json");if(!g.animations||!g.animations.length)g=GLB.models["08_Passant"]?rigFromDonor(g,GLB.models["08_Passant"]):rigFigure(g);   /* starre Figur: Skelett, Gewichte und Bewegungen der Passant-Figur übernehmen */  /* glTF mit eingebetteten Daten: das Hosting liefert kein .glb */GLB.models[name]=prepGlb(g,name);GLB.ready=true;if(walker&&!walker.userData.glbDone)playerGlbApply();standGlbUpgrade()}
    catch(e){console.info("3D-Figur nicht geladen:",name,e);GLB.err=(name+": "+(e&&e.message||e)).slice(0,140);if(name===first)GLB.failed=true}
    GLB.loaded++}
  if(!GLB.ready)GLB.failed=true}
/** Modell vorbereiten: Animationen auf der Stelle, Materialien, Bodenabstand, Lauftempo der Clips messen. */
/* Vorab gemessene Werte (Bodenabstand, Schritttempo von Walk/Run): spart auf dem iPad mehrere Sekunden Rechenzeit pro Figur */
const GLB_PREP={"Noah_Pythagoras": {"offY": 0.0072, "walk": 1.279, "run": 2.997}, "01_Schuelerin": {"offY": 0.0027, "walk": 1.114, "run": 2.626}, "02_Fussballfan": {"offY": -0.0004, "walk": 1.358, "run": 3.167}, "03_Seniorin": {"offY": 0.002, "walk": 1.172, "run": 2.749}, "04_Senior": {"offY": 0.0005, "walk": 1.33, "run": 3.144}, "05_Strassenbauer": {"offY": 0.0007, "walk": 1.452, "run": 3.446}, "06_Joggerin": {"offY": 0.0033, "walk": 1.261, "run": 2.954}, "08_Passant": {"offY": 0.0056, "walk": 1.497, "run": 3.494}, "07_Geschaeftsfrau": {"offY": 0.0063, "walk": 1.312, "run": 3.074}};
function prepGlb(gltf,name){
  const scene=gltf.scene,clips={};
  for(const c of gltf.animations){
    for(const tr of c.tracks)if(/Hips\.position$/.test(tr.name)){const v=tr.values;for(let i=0;i<v.length;i+=3){v[i]=v[0];v[i+2]=v[2]}}   // nur Auf-und-Ab bleibt
    clips[c.name.toLowerCase()]=c}
  scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;
    const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(ENV){m.envMap=ENV;m.envMapIntensity=.55}if(m.metalness>.3&&!m.metalnessMap)m.metalness=.1;m.needsUpdate=true}});
  const M={scene,clips,offY:0,speed:{walk:1.3,run:3.2},slots:new Map()};
  scene.traverse(o=>{if(!o.isMesh)return;const m=o.material,slot=glbSlot(m.name);if(!slot||M.slots.has(m))return;
    const info={slot,base:m.color.clone()};
    /* umgefärbte Texturen erst bei Bedarf erzeugen (spart beim Laden viel Zeit) */
    if(m.map&&slot!=="skin"){let gr;Object.defineProperty(info,"gray",{get:()=>gr||(gr=recolorTex(m.map,slot==="outfit"?null:0))})}
    if(m.map&&slot==="outfit"){const hs=[];info.hues=new Proxy([40,80,140,200,260,320],{get:(t,k)=>{const i=+k;if(Number.isInteger(i)&&i>=0&&i<t.length)return hs[i]||(hs[i]=recolorTex(m.map,t[i]));return t[k]}})}
    M.slots.set(m,info)});
  const known=GLB_PREP[name];if(known){M.offY=known.offY;M.speed={walk:known.walk,run:known.run}}else{
  // Messung an einer Kopie: Füße bei Idle auf den Boden, Standfuß-Tempo von Walk und Run
  const probe=THREE.SkeletonUtils.clone(scene),mx=new THREE.AnimationMixer(probe),feet=[];probe.updateMatrixWorld(true);
  probe.traverse(o=>{if(o.isBone&&/(Left|Right)ToeBase$/.test(o.name))feet.push(o)});
  const v=new THREE.Vector3(),sample=(clip,t)=>{mx.stopAllAction();const a=mx.clipAction(clip);a.play();a.time=t;mx.update(0);probe.updateMatrixWorld(true);return feet.map(f=>f.getWorldPosition(v).clone())};
  if(clips.idle){sample(clips.idle,0);let lo=1e9;const w=new THREE.Vector3();          // tiefster Punkt der Schuhsohle in der Idle-Pose
    probe.traverse(o=>{if(!o.isSkinnedMesh)return;o.skeleton.update();const n=o.geometry.attributes.position.count;
      for(let i=0;i<n;i+=3){o.boneTransform(i,w);w.applyMatrix4(o.matrixWorld);if(w.y<lo)lo=w.y}});
    if(lo<1e8)M.offY=-lo}
  for(const k of ["walk","run"]){const c=clips[k];if(!c||!feet.length)continue;const N=240,pts=[],dt=c.duration/N;for(let i=0;i<=N;i++)pts.push(sample(c,c.duration*i/N));
    const vs=[];for(let fi=0;fi<feet.length;fi++){const ys=pts.map(q=>q[fi].y),lo=Math.min(...ys);   // nur die Mitte des Bodenkontakts (Fuß ganz unten)
      for(let i=1;i<=N;i++)if(pts[i][fi].y<lo+.006&&pts[i-1][fi].y<lo+.006)vs.push(-(pts[i][fi].z-pts[i-1][fi].z)/dt)}
    vs.sort((x,y)=>x-y);if(vs.length)M.speed[k]=Math.max(.3,vs[vs.length>>1])}
  mx.stopAllAction();}

  return M}
function glbTake(name,p){const M=GLB.models[name],pool=GLB.pools[name]||(GLB.pools[name]=[]);let I=pool.pop();
  if(!I){const obj=THREE.SkeletonUtils.clone(M.scene),mixer=new THREE.AnimationMixer(obj),act={};for(const k in M.clips)act[k]=mixer.clipAction(M.clips[k]);I={obj,mixer,act,M,cur:null};scene.add(obj)}
  I.obj.visible=true;I.obj.scale.setScalar(p.look.scale<.8?p.look.scale*1.04:rng(.97,1.03));   /* Kinder kleiner */I.cur=null;I.mixer.stopAllAction();glbState(I,p,0);
  if(I.cur)I.cur.time=Math.random()*I.cur.getClip().duration;return I}
function glbGive(I){I.obj.visible=false;I.mixer.stopAllAction();I.cur=null;(GLB.pools[Object.keys(GLB.models).find(k=>GLB.models[k]===I.M)]||[]).push(I)}
/** Passende Animation wählen und weich überblenden; Abspieltempo so, dass die Füße nicht rutschen. */
function glbState(I,p,fade){const moving=!p.static&&!p.hold,k=moving?(p.look.run&&I.act.run?"run":"walk"):"idle",a=I.act[k]||I.act.idle;if(!a)return;
  if(moving){const s=I.obj.scale.x;a.timeScale=p.sp/(I.M.speed[k]*s)}else a.timeScale=1;
  if(I.cur===a)return;a.enabled=true;a.setEffectiveWeight(1);a.reset().play();
  if(I.cur&&fade>0)I.cur.crossFadeTo(a,fade,false);else if(I.cur)I.cur.stop();I.cur=a}
function glbPose(p,dt,now){const I=p.glb;glbState(I,p,.35);
  // weiter entfernte Figuren seltener animieren (spart Rechenzeit auf dem iPad)
  const d=Math.hypot(p.x-car.x,p.y-car.y),every=d>50?3:d>25?2:1;I.acc=(I.acc||0)+dt;I.k=(I.k||0)+1;if(I.k%every===0){I.mixer.update(I.acc);I.acc=0}
  const hop=p.static&&(p.act==="cheer"||p.act==="play")?Math.max(0,Math.sin(now/1000*(p.act==="play"?2.4:3)+(p.seed||0)))*(p.act==="play"?.22:.1):0;
  I.obj.position.set(p.x,groundY(p.x,p.y)+I.M.offY*I.obj.scale.x+hop,p.y);I.obj.rotation.y=Math.PI/2-p.a;   // Modelle schauen nach +Z
  if(p.dogM){const D=p.dogM,U=D.userData,bx=p.x-Math.cos(p.a)*1.1+Math.sin(p.a)*.5,by=p.y-Math.sin(p.a)*1.1-Math.cos(p.a)*.5;p.cph=(p.cph||0)+dt*p.sp*3;
    D.position.set(bx,groundY(bx,by),by);D.rotation.y=-p.a;U.legs.forEach((l,i)=>l.rotation.z=p.static?0:Math.sin(p.cph+(i%2?0:Math.PI)+(i>1?Math.PI/2:0))*.6);U.tail.rotation.x=Math.sin(now/90)*.6}}

/* ---- Kleidung umfärben: viele verschiedene Passanten aus einem Modell ---- */
function glbSlot(n){if(/^skin$/i.test(n))return "skin";if(/^hair$/i.test(n))return "hair";if(/^outfit$/i.test(n))return "outfit";
  if(/^backpack$/i.test(n))return "bag";if(/sneaker leather|^shoes$/i.test(n))return "shoes";
  if(/jeans|pants|trousers/i.test(n))return "pants";if(/tee|shirt$|blouse/i.test(n)&&!/collar/i.test(n))return "shirt";
  /* deutsche Materialnamen (Passanten_Neue_Modelle): Kombi-Kleidung als Ganzes farbverschieben, Arbeitskleidung unverändert */
  if(/^haut$/i.test(n))return "skin";if(/arbeit|schutz|signal/i.test(n))return null;if(/ und | mit /i.test(n))return "outfit";
  if(/frisur|haar|bob$/i.test(n))return "hair";if(/schuh|stiefel|flats|sneaker/i.test(n))return "shoes";
  if(/hose/i.test(n))return "pants";if(/shirt|pullover|bluse|trikot/i.test(n))return "shirt";return null}
/** Graue (hue=0) oder farbverschobene (hue in Grad) Kopie einer Textur; Muster und Falten bleiben erhalten. */
function recolorTex(tex,hue){const img=tex.image;if(!img||!img.width)return null;const c=document.createElement("canvas");c.width=img.width;c.height=img.height;
  const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height),a=d.data;
  if(hue===0){let sum=0,n=0;for(let i=0;i<a.length;i+=16){if(a[i+3]>20){sum+=.299*a[i]+.587*a[i+1]+.114*a[i+2];n++}}const k=n?Math.min(4,200/(sum/n)):1;
    for(let i=0;i<a.length;i+=4){const l=Math.min(255,(.299*a[i]+.587*a[i+1]+.114*a[i+2])*k);a[i]=a[i+1]=a[i+2]=l}}
  else{const cs=Math.cos(hue*Math.PI/180),sn=Math.sin(hue*Math.PI/180),M=[.213+cs*.787-sn*.213,.715-cs*.715-sn*.715,.072-cs*.072+sn*.928,.213-cs*.213+sn*.143,.715+cs*.285+sn*.14,.072-cs*.072-sn*.283,.213-cs*.213-sn*.787,.715-cs*.715+sn*.715,.072+cs*.928+sn*.072];
    for(let i=0;i<a.length;i+=4){const r=a[i],gg=a[i+1],b=a[i+2];a[i]=r*M[0]+gg*M[1]+b*M[2];a[i+1]=r*M[3]+gg*M[4]+b*M[5];a[i+2]=r*M[6]+gg*M[7]+b*M[8]}}
  g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.flipY=tex.flipY;t.encoding=THREE.sRGBEncoding;t.wrapS=tex.wrapS;t.wrapT=tex.wrapT;t.anisotropy=4;return t}
const PAL={
  shirt:["#c0392b","#2e8b57","#1f4e8c","#f2b81f","#7b3fa0","#e9e9e9","#1b1b1b","#e8742a","#e05a8c","#17a2b8","#8b5a2b","#55606e","#6b8e23","#c9b38f","#9fc3e6","#b03060"],
  pants:["#3a4f72","#1f2633","#55606e","#6b5a43","#2d3d2a","#c9b38f","#2b2b2b","#5a6a7a","#7a6a52"],
  shoes:["#f2f2f2","#1b1b1b","#5a4030","#808890","#c0392b","#1f4e8c"],
  bag:["#e2a91c","#d81e2c","#1b2f6b","#1b1b1b","#2e8b57","#7b3fa0"]};
const SKIN_MUL=["#ffffff","#f4e2d4","#e6c7ae","#c99c7a","#a27556","#7a5440","#5a3c2c"];
function rolePalette(role){const R={...PAL};
  if(role==="fan")R.shirt=["#1f8a4c","#f2f2f2","#151515","#1f8a4c"];
  if(role==="businesswoman"){R.shirt=["#f2f2f2","#e9e4da","#cfe0f2","#f2d7d9","#d8d0e8"];R.pants=["#1f2a44","#2b2b2b","#3d4552","#4a3a3a"]}
  if(role==="bauarbeiter")R.shirt=["#1f4e8c","#2b3a5a","#55606e","#2e5e4e"];
  if(role==="business"){R.shirt=["#1f2a44","#2b2b2b","#3d4552","#e9e9e9","#cfe0f2"];R.pants=["#1f2a44","#2b2b2b","#3d4552"]}
  if(role==="jogger"){R.shirt=["#0ea5e9","#ef4444","#f2f2f2","#22c55e"];R.pants=["#1b1b1b","#334155"]}
  return R}
/** Färbt eine Figuren-Instanz neu. c: {shirt,pants,shoes,bag,hair,skin,outfit} als Farben (Hex) bzw. outfit als Index. */
function tintGlb(I,c){I.obj.traverse(o=>{if(!o.isMesh)return;const src=o.userData.srcMat||o.material,info=I.M.slots.get(src);if(!info)return;
    if(!o.userData.srcMat){o.userData.srcMat=src;o.material=src.clone()}const m=o.material,v=c[info.slot];
    if(info.slot==="skin"){m.color.copy(info.base);if(v)m.color.multiply(new THREE.Color(v).convertSRGBToLinear())}
    else if(info.slot==="outfit"){m.map=v>=0&&info.hues&&info.hues[v]?info.hues[v]:src.map;m.color.copy(info.base)}
    else if(v&&info.gray){m.map=info.gray;m.color.set(v).convertSRGBToLinear()}
    else if(v&&info.slot==="hair"&&!info.gray){m.color.set(v).convertSRGBToLinear()}
    else{m.map=src.map;m.color.copy(info.base)}
    m.needsUpdate=true})}
function randomTint(role){const P=rolePalette(role),keepShirt=role==="bauarbeiter"&&false;
  return {shirt:pick(P.shirt),pants:pick(P.pants),shoes:pick(P.shoes),bag:pick(P.bag),hair:pick(role==="senior"||role==="seniorin"?GREYS:HAIRS),skin:pick(SKIN_MUL),outfit:Math.random()<.3?-1:Math.floor(Math.random()*6)}}
{const base=glbTake;glbTake=function(name,p){const I=base(name,p);if(!p.tint)p.tint=randomTint(p.look.role);tintGlb(I,p.tint);return I}}

/* ================= Spielfigur als 3D-Modell (Farben aus dem eigenen Profil) ================= */
const PG={inst:null,model:null,cur:null,state:"idle"};
function skinMul(hex){const b=new THREE.Color("#f6d5b8"),c=new THREE.Color(hex);return "#"+new THREE.Color(Math.min(1,c.r/b.r),Math.min(1,c.g/b.g),Math.min(1,c.b/b.b)).getHexString()}
function playerGlbApply(){
  if(!walker||walker.userData.glbDone)return;let look={};try{look=JSON.parse(walker.userData.lookKey||"{}")}catch(e){}
  let name=look.model||LOOK_DEF.model;const preview=state.mode==="start"&&(TITLE.view==="create"||TITLE.view==="figs");
  if(!preview&&!figUnlocked(name,save))name=LOOK_DEF.model;      /* gesperrte Figur → Noah */
  if(name==="classic"||!GLB.models[name])return;
  if(!PG.inst||PG.model!==name){if(PG.inst)PG.inst.obj.parent&&PG.inst.obj.parent.remove(PG.inst.obj);
    const M=GLB.models[name],obj=THREE.SkeletonUtils.clone(M.scene),mixer=new THREE.AnimationMixer(obj),act={};for(const k in M.clips)act[k]=mixer.clipAction(M.clips[k]);
    PG.inst={obj,mixer,act,M};PG.model=name;PG.cur=null}
  const I=PG.inst;tintGlb(I,{shirt:look.jacket,pants:look.jeans,bag:look.bagCol,hair:look.hair,skin:skinMul(look.skin||"#d6a07a")});
  // in die Hülle der alten Figur einsetzen (Hülle ist 0,092-fach skaliert, Blick nach +x)
  const box=new THREE.Group();box.scale.setScalar(1/walker.scale.x);box.rotation.y=Math.PI/2;box.add(I.obj);I.obj.position.y=I.M.offY;
  footShadow(box,.9);
  const old=walker.userData.hu;old.visible=false;walker.add(box);
  // Anker für Zubehör (Kappe, Krone, Brille, Ballon, Charakter-Kopfbedeckungen) am Kopf-Knochen, gleiches Koordinatensystem wie bei der alten Figur
  let head=null;I.obj.traverse(o=>{if(o.isBone&&o.name==="Head")head=o});
  const hu=new THREE.Group();hu.rotation.y=-Math.PI/2;box.add(hu);const anchor=new THREE.Group();
  if(head){anchor.position.set(0,.075,.015);anchor.rotation.y=-Math.PI/2;head.add(anchor)}
  hu.userData={h:{head:anchor,torso:anchor},acc:[]};walker.userData.hu=hu;walker.userData.glbDone=true;walker.userData.glbBox=box;
  dressAll()}
function playerGlbPose(dt){const I=PG.inst;if(!I)return;const v=Math.abs(car.v);
  // Idle im Stand, Walk beim Gehen (1,8 m/s), Run beim Sprinten (4,8 m/s); Umschalten mit Hysterese, damit nichts flackert
  let want=v<.15?"idle":(I.act.run&&(v>2.7||(PG.state==="run"&&v>2.3))?"run":"walk");PG.state=want;
  const a=I.act[want]||I.act.idle;
  if(want!=="idle"){const sp=I.M.speed[want]||1.3;a.timeScale=(want==="run"?clamp(v/sp,.75,1.9):clamp(v/sp,.4,1.6))*(car.v<0?-1:1)}else a.timeScale=1;
  if(PG.cur!==a){a.enabled=true;a.setEffectiveWeight(1);a.reset().play();if(PG.cur)PG.cur.crossFadeTo(a,.25,false);PG.cur=a}
  I.mixer.update(dt)}
{const base=applyLook;applyLook=function(l){base(l);playerGlbApply()}}

/* Quellenangabe der echten Karte in der Kartenansicht (Pflicht laut ODbL) */
if(MG.real)document.querySelectorAll(".mapnote").forEach(n=>n.insertAdjacentHTML("beforeend",' · Karte: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap-Mitwirkende</a> (ODbL) · Geobasis NRW (dl-de/zero-2-0) · Stadt Mönchengladbach'));

/* ================= Ansprechpersonen (Lehrkräfte, Ladenbesitzer, Auftraggeber) als 3D-Figuren ================= */
const STANDS=[];
{const base=standPerson;standPerson=function(x,y,a,shirt){const p=base(x,y,a,shirt);p.visible=!!GLB.failed;STANDS.push({p,x,y,a,shirt,glb:null});return p}}
const STAND_MODEL={"Mats":"02_Fussballfan","Elif":"01_Schuelerin","Jana":"06_Joggerin","Tarik":"05_Strassenbauer","Kalle":"05_Strassenbauer",
  "Herr Ballhorn":"04_Senior","Herr Brands":"04_Senior","Bäcker Hennes":"08_Passant"};
function standName(S){const p=S.p;for(const q of QUESTS)if(q.person===p)return q.giver.name;for(const t of TALK)if(t.person===p)return t.name;
  for(const G of XG)if(G.person===p)return G.name||G.talk||"";return ""}
function standRole(S){const p=S.p;for(const q of QUESTS)if(q.person===p)return q.giver.role||"";for(const t of TALK)if(t.person===p)return t.role||"";for(const G of XG)if(G.person===p)return G.role||"";return ""}
function standGlbUpgrade(){for(const S of STANDS){if(S.glb||!S.p.parent)continue;const n=standName(S);
  const mn=STAND_MODEL[n]||(/^Frau /.test(n)?"07_Geschaeftsfrau":"08_Passant");const M=GLB.models[mn];if(!M)continue;
  const obj=THREE.SkeletonUtils.clone(M.scene),mixer=new THREE.AnimationMixer(obj),act={};for(const k in M.clips)act[k]=mixer.clipAction(M.clips[k]);
  const I={obj,mixer,act,M,cur:null};const role=mn==="07_Geschaeftsfrau"?"businesswoman":mn==="05_Strassenbauer"?"bauarbeiter":mn==="04_Senior"?"senior":"passant";
  const rl=standRole(S),teach=/lehrer/i.test(rl);   /* alle Lehrkräfte mit heller Hautfarbe */
  tintGlb(I,Object.assign(randomTint(role),{shirt:S.shirt,outfit:-1},teach?{skin:pick(SKIN_MUL.slice(0,3))}:{}));
  if(act.idle){act.idle.play();act.idle.time=Math.random()*act.idle.getClip().duration}
  if(n==="Herr Ballhorn")standAlt(I);
  obj.position.set(S.x,groundY(S.x,S.y)+M.offY,S.y);obj.rotation.y=Math.PI/2-S.a;scene.add(obj);S.p.visible=false;S.glb=I}}
/* Herr Ballhorn: alter, gebrechlicher Hausmeister – gebeugt, langsam, mit Gehstock */
function standAlt(I){I.mixer.timeScale=.65;I.alt=[["Spine",.16],["Spine1",.12],["Spine2",.08],["Neck",.14]].map(([n,a])=>[I.obj.getObjectByName(n),a]).filter(b=>b[0]);
  const g=new THREE.CylinderGeometry(.016,.02,.9,8);g.translate(0,.45,0);const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:new THREE.Color(0x3b2a1e).convertSRGBToLinear()}));m.position.set(-.3,0,.16);m.rotation.set(.12,0,-.1);m.castShadow=true;
  const k=new THREE.Mesh(new THREE.TorusGeometry(.055,.014,6,12,Math.PI),m.material);k.position.set(0,.9,.05);k.rotation.y=Math.PI/2;m.add(k);I.obj.add(m);
  // Hausmeisterkittel statt Anzug (Jacke grau entsättigt, graublau getönt), ohne Hut – graues Haar sichtbar
  I.obj.traverse(o=>{if(!o.isMesh)return;const mt=o.material,nm=(o.userData.srcMat||mt).name||"";
    if(/^Hut$/i.test(nm)){o.visible=false;return}
    if(/Sakko|Weste/i.test(nm)){const src=o.userData.srcMat||mt,c=src.clone();const g=src.map?recolorTex(src.map,0):null;if(g)c.map=g;c.color.set(0x3e4b5c).convertSRGBToLinear();c.needsUpdate=true;o.material=c;o.userData.kittel=1}})}
const standAltPose=I=>{if(I.alt)for(const [b,a] of I.alt)b.rotation.x+=a};
{const base=updateCrowd;updateCrowd=function(dt,now){base(dt,now);
  for(const S of STANDS){const I=S.glb;if(!I)continue;if(!S.p.parent){scene.remove(I.obj);S.glb=null;continue}S.p.visible=false;
    const d=Math.hypot(S.x-car.x,S.y-car.y);I.obj.visible=d<CR.radius;if(!I.obj.visible)continue;
    const every=d>50?3:d>25?2:1;I.acc=(I.acc||0)+dt;I.k=(I.k||0)+1;if(I.k%every===0){I.mixer.update(I.acc);I.acc=0;standAltPose(I)}}}}

/* ================= Spielfigur auf Roller, Fahrrad und Moped (Sitz- und Stehhaltung aus dem Skelett) =================
   Die Figuren haben nur Idle, Walk und Run. Die Haltung entsteht aus der Idle-Pose, deren Knochen gedreht werden.
   Bei allen Figuren kippt eine Drehung um die X-Achse des Knochens nach vorn (Oberschenkel heben, Oberkörper vorbeugen,
   Arme nach vorn); das Knie beugt mit negativem Winkel. Maße in Metern, Fahrzeug-Gruppen sind 0,1-fach skaliert, vorn = +x. */
const RIDE_POS={  // Sitz bzw. Trittbrett (x nach vorn, y Höhe), Pedal-/Fußpunkt und Haltung
  bike: {seat:[-.36,.99], lean:.38, arm:[.95,-.35], kind:"pedal"},     /* Maße der Fahrzeugmodelle aus fahrzeuge/*.json */
  moped:{seat:[-.42,.9],  lean:.34, arm:[1.1,-.3],  kind:"sit"},
  scoot:{deck:[-.06,.2],  lean:.1,  arm:[.55,-.95], kind:"stand"}};
const RIDE={};
const _q=new THREE.Quaternion(),_ax=new THREE.Vector3(1,0,0),_az=new THREE.Vector3(0,0,1);
function riderBuild(id,g,name,look){
  const M=GLB.models[name],obj=THREE.SkeletonUtils.clone(M.scene),mixer=new THREE.AnimationMixer(obj),act={};for(const k in M.clips)act[k]=mixer.clipAction(M.clips[k]);
  const I={obj,mixer,act,M};tintGlb(I,{shirt:look.jacket,pants:look.jeans,bag:look.bagCol,hair:look.hair,skin:skinMul(look.skin||"#d6a07a")});
  if(act.idle){act.idle.play();mixer.update(0)}           // Grundhaltung: erstes Bild der Idle-Animation, danach keine Animation mehr
  const B={};obj.traverse(o=>{if(o.isBone)B[o.name]=o});const base={};for(const k in B)base[k]=B[k].quaternion.clone();
  mixer.stopAllAction();
  const box=new THREE.Group();box.add(obj);box.rotation.y=Math.PI/2;box.scale.setScalar(10);footShadow(box,.9);g.add(box);
  return {I,B,base,box,id,name,key:""}}
function rot(R,n,ax,a){const b=R.B[n];if(!b)return;b.quaternion.multiply(_q.setFromAxisAngle(ax,a))}
function riderPose(R,phi){const P=RIDE_POS[R.id];for(const k in R.base)R.B[k].quaternion.copy(R.base[k]);
  rot(R,"Spine",_ax,P.lean*.5);rot(R,"Spine1",_ax,P.lean*.3);rot(R,"Spine2",_ax,P.lean*.2);rot(R,"Neck",_ax,-P.lean*.6);rot(R,"Head",_ax,-P.lean*.3);
  for(const s of ["Left","Right"]){rot(R,s+"Arm",_ax,P.arm[0]);rot(R,s+"ForeArm",_ax,-P.arm[1]);rot(R,s+"Arm",_az,(s==="Left"?-1:1)*.12);rot(R,s+"Hand",_ax,-.2)}
  if(P.kind==="pedal")for(const [s,o] of [["Left",0],["Right",Math.PI]]){const c=Math.sin(phi+o);
    rot(R,s+"UpLeg",_ax,.55+.42*c);rot(R,s+"Leg",_ax,-(.7+.6*c));rot(R,s+"Foot",_ax,.2)}
  else if(P.kind==="sit")for(const s of ["Left","Right"]){rot(R,s+"UpLeg",_ax,.95);rot(R,s+"Leg",_ax,-1.55);rot(R,s+"Foot",_ax,.35);rot(R,s+"UpLeg",_az,(s==="Left"?1:-1)*.08)}
  else {rot(R,"LeftUpLeg",_ax,.18);rot(R,"LeftLeg",_ax,-.25);rot(R,"RightUpLeg",_ax,-.12);rot(R,"RightLeg",_ax,-.08)}
  // Figur so verschieben, dass die Hüfte auf dem Sattel bzw. die Füße auf dem Trittbrett stehen
  R.box.position.set(0,0,0);R.box.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(R.box.parent.matrixWorld).invert();
  const hp=R.B.Hips.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv).multiplyScalar(.1);
  if(P.seat)R.box.position.set((P.seat[0]-hp.x)*10,(P.seat[1]-hp.y+.06)*10,(-hp.z)*10);
  else{let lo=1e9;for(const s of ["LeftToeBase","RightToeBase","LeftFoot","RightFoot"]){const b=R.B[s];if(b){const v=b.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);lo=Math.min(lo,v.y*.1)}}
    R.box.position.set((P.deck[0]-hp.x)*10,(P.deck[1]-lo+.03)*10,(-hp.z)*10)}}
function riderUpdate(){if(typeof vehMeshes==="undefined"||!PG.model||!GLB.models[PG.model])return;const VH=V();
  let look={};try{look=JSON.parse(walker.userData.lookKey||"{}")}catch(e){}
  for(const id of ["scoot","bike","moped"]){const g=vehMeshes[id];if(!g||!g.userData.rider)continue;
    const key=PG.model+"|"+walker.userData.lookKey;let R=RIDE[id];
    if(!R||R.key!==key||R.box.parent!==g){if(R&&R.box.parent)R.box.parent.remove(R.box);R=RIDE[id]=riderBuild(id,g,PG.model,look);R.key=key}
    const active=VH.id===id;g.userData.rider.scale.setScalar(1e-4);R.box.visible=active;   /* alte Figur verkleinern: das Spiel blendet sie sonst wieder ein */
    if(active)riderPose(R,id==="bike"?(car.ph||0):0)}}
{const base=updateCrowd;updateCrowd=function(dt,now){base(dt,now);riderUpdate()}}

/* ================= Auf- und Absteigen (Zweiräder), Ein- und Aussteigen (Autos, Hubschrauber) =================
   Kurze Übergänge statt Sprung: hingehen, Bein über den Sattel schwingen bzw. bücken und einsteigen; rückwärts beim Verlassen.
   Während des Übergangs ist die Steuerung gesperrt. Ohne 3D-Figur (Laden gescheitert) bleibt es beim sofortigen Wechsel. */
const TWO=new Set(["scoot","bike","moped"]);
const TR={on:false};
const ease=u=>u<0?0:u>1?1:u*u*(3-2*u);
function trStart(o){Object.assign(TR,{on:true,t:0},o)}
function lateral(a){return [-Math.sin(a),Math.cos(a)]}
{const base=enterVehicle;enterVehicle=function(){const l=save.left;
  if(TR.on||!l||V().id!=="walk"||!PG.inst||state.mode!=="play")return base();
  const two=TWO.has(l.id)&&RIDE[l.id],[lx,ly]=lateral(l.a),side=((car.x-l.x)*lx+(car.y-l.y)*ly)>=0?1:-1;
  const fwd=[Math.cos(l.a),Math.sin(l.a)],door=two?.62:1.25,ahead=two?-.1:.35;
  const spot=[l.x+lx*side*door+fwd[0]*ahead,l.y+ly*side*door+fwd[1]*ahead];
  const walk=Math.hypot(spot[0]-car.x,spot[1]-car.y),tw=Math.min(.9,walk/1.8);
  trStart({kind:two?"mount":"enter",l:{...l},side,from:[car.x,car.y],spot,tw,dur:tw+(two?(l.id==="scoot"?.55:.85):1.3),done:base})}}
{const base=exitVehicle;exitVehicle=function(){const VH=V(),id=VH.id;
  if(TR.on||id==="walk"||!PG.inst||state.mode!=="play")return base();
  const l0={id,x:car.x,y:car.y,a:car.a};base();if(V().id!=="walk")return;         // z. B. Hubschrauber in der Luft: nichts passiert
  const two=TWO.has(id)&&RIDE[id],[lx,ly]=lateral(l0.a),side=((car.x-l0.x)*lx+(car.y-l0.y)*ly)>=0?1:-1;
  const fwd=[Math.cos(l0.a),Math.sin(l0.a)],door=two?.62:1.25,ahead=two?-.1:.35;
  const spot=[l0.x+lx*side*door+fwd[0]*ahead,l0.y+ly*side*door+fwd[1]*ahead];
  const tw=Math.min(.6,Math.hypot(car.x-spot[0],car.y-spot[1])/1.8),tb=two?(id==="scoot"?.5:.8):1.0;
  trStart({kind:two?"dismount":"exit",l:l0,side,spot,to:[car.x,car.y],tb,tw,dur:tb+tw})}}
/* Steuerung sperren */
{const base=update;update=function(dt){if(!TR.on)return base(dt);const k={...keys};for(const n in keys)keys[n]=false;car.v=0;base(dt);Object.assign(keys,k);
  TR.t+=dt;if(TR.t>=TR.dur){TR.on=false;if(TR.done)TR.done();TR.done=null}}}
/* Gehen zum Fahrzeug bzw. vom Fahrzeug weg mit der Walk-Animation */
{const base=playerGlbPose;playerGlbPose=function(dt){if(!TR.on)return base(dt);
  const walking=(TR.kind==="mount"||TR.kind==="enter")?TR.t<TR.tw:TR.t>TR.tb;const v=car.v;car.v=walking?1.8:0;base(dt);car.v=v}}
function walkerAt(x,y,a,yo=0){walker.position.set(x,groundY(x,y)+yo,y);walker.rotation.set(0,-a,0)}
function crouch(w){const I=PG.inst;if(!I)return;const B={};I.obj.traverse(o=>{if(o.isBone)B[o.name]=o});const r=(n,a)=>{if(B[n])B[n].quaternion.multiply(_q.setFromAxisAngle(_ax,a))};
  r("Spine",.45*w);r("Spine1",.25*w);r("Neck",-.3*w);for(const s of ["Left","Right"]){r(s+"UpLeg",.9*w);r(s+"Leg",-1.2*w);r(s+"Foot",.3*w)}}
function trVisual(){if(!TR.on)return;const l=TR.l,[lx,ly]=lateral(l.a),inA=l.a-TR.side*Math.PI/2;  // Blick zur Fahrzeugmitte
  const g=vehMeshes[l.id];
  if(TR.kind==="mount"||TR.kind==="dismount"){const R=RIDE[l.id];const tb=TR.kind==="mount"?TR.tw:0,u=TR.kind==="mount"?ease((TR.t-tb)/(TR.dur-tb)):1-ease(TR.t/TR.tb);
    const walking=TR.kind==="mount"?TR.t<TR.tw:TR.t>TR.tb;
    if(walking){R.box.visible=false;walker.visible=true;const k=TR.kind==="mount"?ease(TR.t/TR.tw):ease((TR.t-TR.tb)/TR.tw),A=TR.kind==="mount"?TR.from:TR.spot,Bp=TR.kind==="mount"?TR.spot:TR.to;
      const x=A[0]+(Bp[0]-A[0])*k,y=A[1]+(Bp[1]-A[1])*k,dir=Math.atan2(Bp[1]-A[1],Bp[0]-A[0]);walkerAt(x,y,Math.hypot(Bp[0]-A[0],Bp[1]-A[1])>.05?dir:l.a);return}
    walker.visible=false;g.visible=true;g.position.set(l.x,groundY(l.x,l.y),l.y);g.rotation.set(0,-l.a,0);g.userData.rider.scale.setScalar(1e-4);R.box.visible=true;
    riderPose(R,0);const ride={};for(const k in R.B)ride[k]=R.B[k].quaternion.clone();const rp=R.box.position.clone();
    for(const k in R.B)R.B[k].quaternion.copy(R.base[k]).slerp(ride[k],u);
    if(l.id!=="scoot"){const sw=Math.sin(Math.PI*u),leg=TR.side>0?"Left":"Right",out=TR.side>0?1:-1;      // fernes Bein schwingt über den Sattel
      const b=R.B[leg+"UpLeg"];if(b){b.quaternion.multiply(_q.setFromAxisAngle(_ax,.9*sw));b.quaternion.multiply(_q.setFromAxisAngle(_az,out*1.0*sw))}
      const k2=R.B[leg+"Leg"];if(k2)k2.quaternion.multiply(_q.setFromAxisAngle(_ax,-.9*sw))}
    // Lage: neben dem Fahrzeug stehend (u=0) bis auf dem Sitz (u=1)
    R.box.position.set(0,0,0);R.box.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();
    let lo=1e9;for(const s of ["LeftToeBase","RightToeBase","LeftFoot","RightFoot"]){const b=R.B[s];if(b)lo=Math.min(lo,b.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv).y)}
    const hp=R.B.Hips.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
    const stand=new THREE.Vector3(rp.x,-lo,TR.side*6.2-hp.z);       // Gruppen-Einheiten (0,1 m)
    R.box.position.copy(stand.lerp(rp,u));R.box.position.y+=Math.sin(Math.PI*u)*(l.id==="scoot"?1.2:.6);
    R.box.rotation.y=Math.PI/2+(1-u)*(TR.side>0?1:-1)*.9;   // beim Stehen halb zum Fahrzeug gedreht
    return}
  // Auto/Hubschrauber: an der Tür bücken und hineingleiten bzw. heraus
  const into=TR.kind==="enter";const walking=into?TR.t<TR.tw:TR.t>TR.tb;
  if(walking){walker.visible=true;const k=into?ease(TR.t/TR.tw):ease((TR.t-TR.tb)/TR.tw),A=into?TR.from:TR.spot,Bp=into?TR.spot:TR.to;
    walkerAt(A[0]+(Bp[0]-A[0])*k,A[1]+(Bp[1]-A[1])*k,Math.hypot(Bp[0]-A[0],Bp[1]-A[1])>.05?Math.atan2(Bp[1]-A[1],Bp[0]-A[0]):inA);return}
  const u=into?ease((TR.t-TR.tw-.3)/.7):1-ease((TR.t-.3)/.7);   /* erst Tür auf, dann hinein bzw. heraus */      // 0 = an der Tür, 1 = im Auto
  const x=TR.spot[0]-lx*TR.side*.9*u,y=TR.spot[1]-ly*TR.side*.9*u;
  g.visible=true;g.position.set(l.x,VEH[l.id].fly?heightAt(l.x,l.y):groundY(l.x,l.y),l.y);g.rotation.set(0,-l.a,0);
  walker.visible=u<.97;walkerAt(x,y,inA+(TR.side>0?1:-1)*u*Math.PI/2*.9,-.35*u);crouch(Math.min(1,u*1.6))}
{const base=updateCamera;updateCamera=function(dt,VH){trVisual();base(dt,VH)}}
{const base=interactables;interactables=function(VH){return TR.on?[]:base(VH)}}   /* kein „Einsteigen“-Hinweis während des Übergangs */

/* ================= Ladeanzeige: Spielstart erst, wenn die 3D-Spielfigur da ist ================= */
{const box=document.createElement("div");box.id="glbLoad";box.style.cssText="position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:999px;background:rgba(9,4,20,.78);color:#00F0FF;font:700 13px Inter,Arial,sans-serif;letter-spacing:.08em;pointer-events:none";document.body.appendChild(box);
  setInterval(()=>{const on=(!GLB.failed&&GLB.total&&GLB.loaded<GLB.total)||!!GLB.err;box.hidden=!on;if(on)box.textContent=GLB.err?`3D-Figuren: Fehler beim Laden (${GLB.err})`:`3D-Figuren werden geladen … ${GLB.loaded} von ${GLB.total}`},300);
  setTimeout(()=>{if(!GLB.ready){GLB.failed=true;for(const S of STANDS)if(!S.glb)S.p.visible=true}},60000)}   // nach 60 s ohne Figur: Notlösung mit einfachen Figuren
{const base=hideTitle;hideTitle=function(){if(walker&&!walker.userData.glbDone&&!GLB.failed&&!(PROF&&PROF.look&&PROF.look.model==="classic")){
  const t=$("title"),w=document.getElementById("glbWait")||t.appendChild(Object.assign(document.createElement("div"),{id:"glbWait"}));
  w.style.cssText="position:absolute;left:0;right:0;bottom:22%;text-align:center;color:#fff;font:800 18px Montserrat,Arial,sans-serif;text-shadow:0 2px 12px #000";w.textContent="Noah wird geladen … gleich geht es los";
  const iv=setInterval(()=>{if(walker.userData.glbDone||GLB.failed){clearInterval(iv);w.remove();base()}},200);return}base()}}
