/* ================= Neue Modelle (Pythagoras_City_GLB_Modelle, 22.11.) =================
   - Figuren und Fahrzeuge ersetzen die alten Dateien (gleiche Namen, gleiche Knochen und Clips).
   - Sitz- und Trittbretthöhe für Fahrrad, Roller und Motorrad werden aus Sattel/Trittbrett/Sitz der neuen Modelle gelesen.
   - Laternen: neues Modell (instanziert) statt der einfachen Masten; Leuchtenabdeckung leuchtet nachts.
   - Fassaden-Bausatz in Noahs Nähe (wandert mit): Fenster mit Laibung und Fensterbank genau auf den gemalten Fenstern,
     Hauseingänge auf den gemalten Haustüren, Regenrohre, Dachgauben auf Satteldächern, Ladenerdgeschosse bei Läden,
     geparkte Fahrräder/E-Scooter (Fahrrad- und E-Scooter-Modell, Rahmen in verschiedenen Farben) vor Läden und Haustüren,
     mehrere Dachgauben je Dachseite, auf der Dachfläche hinter der Traufe.
     Reichweite und Anzahl je Grafikprofil. */
const KIT={parts:{},ready:false,bld:[],grid:new Map(),cell:50,last:{x:1e9,y:1e9,t:0}};
const KIT_CAP={schule:{r:28,win:70,door:16,pipe:24,dorm:16,shop:10,shopR:6,bikeP:8,scooP:3,rhaus:3,lampR:120,treeR:300},standard:{r:42,win:200,door:36,pipe:50,dorm:40,shop:24,shopR:14,bikeP:24,scooP:8,rhaus:8,lampR:180,treeR:450},hoch:{r:65,win:460,door:70,pipe:90,dorm:80,shop:40,shopR:24,bikeP:40,scooP:14,rhaus:16,lampR:260,treeR:700}};
/* Gebäude für den Bausatz merken (aus buildCity aufgerufen) */
function gfxRecord(p,h,m,kind,ccw,GB,t){if(m>0||!(kind==="res"||kind==="brick"))return;let cx=0,cy=0;const n=p.length/2;for(let i=0;i<n;i++){cx+=p[2*i];cy+=p[2*i+1]}cx/=n;cy/=n;
  const B={p,h,ccw,kind,GB,cx,cy,i:KIT.bld.length,shopT:/retail|commercial|kiosk|supermarket|shop/.test(t||"")};KIT.bld.push(B);const k=Math.floor(cx/KIT.cell)+"_"+Math.floor(cy/KIT.cell);(KIT.grid.get(k)||KIT.grid.set(k,[]).get(k)).push(B)}

/* komprimierte Eckpunkte (KHR_mesh_quantization: Int16/Int8, normalisiert) in Meter-Gleitkommazahlen umrechnen */
function kitDeq(geo){for(const k of Object.keys(geo.attributes)){const a=geo.attributes[k];if(a.isInterleavedBufferAttribute){const n=a.count,sz=a.itemSize,out=new Float32Array(n*sz);for(let i=0;i<n;i++)for(let c=0;c<sz;c++)out[i*sz+c]=[a.getX,a.getY,a.getZ,a.getW][c].call(a,i);geo.setAttribute(k,new THREE.BufferAttribute(out,sz));continue}
    if(a.array instanceof Float32Array&&!a.normalized)continue;const div=a.normalized?(a.array instanceof Int8Array?127:a.array instanceof Uint8Array?255:a.array instanceof Int16Array?32767:a.array instanceof Uint16Array?65535:1):1;
    const out=new Float32Array(a.array.length);for(let i=0;i<out.length;i++)out[i]=a.normalized?Math.max(a.array[i]/div,-1):a.array[i];geo.setAttribute(k,new THREE.BufferAttribute(out,a.itemSize))}
  return geo}
/* einfache Zusammenfassung gleicher Materialien (Position, Normale, UV) */
function kitMerge(geos){const G=geos.map(g=>g.index?g.toNonIndexed():g);const has=k=>G.every(g=>g.attributes[k]);if(!has("position")||!has("normal"))return null;const keys=["position","normal"].concat(has("uv")?["uv"]:[]);
  const out=new THREE.BufferGeometry();for(const k of keys){const sz=G[0].attributes[k].itemSize;let n=0;for(const g of G)n+=g.attributes[k].count*sz;const arr=new Float32Array(n);let o=0;for(const g of G){arr.set(g.attributes[k].array,o);o+=g.attributes[k].array.length}out.setAttribute(k,new THREE.BufferAttribute(arr,sz))}return out}
/* GLB laden und je Material zu einer Geometrie im Modulraum zusammenfassen */
async function kitLoad(name,file){const L=new THREE.GLTFLoader();const g=await L.loadAsync(file);const root=g.scene;root.updateMatrixWorld(true);const byMat=new Map();
  root.traverse(o=>{if(!o.isMesh)return;const geo=kitDeq(o.geometry.clone());geo.applyMatrix4(o.matrixWorld);const m=o.material;const a=byMat.get(m)||[];a.push(geo);byMat.set(m,a)});
  const parts=[];for(const [m,geos] of byMat){const merged=kitMerge(geos);const list=merged?[merged]:geos;
    const mat=m.clone();if(window.__lin&&mat.color&&!mat.userData.lin){mat.userData.lin=1}if(/glas/i.test(mat.name||"")){mat.transparent=true;mat.opacity=Math.min(mat.opacity,.6);mat.depthWrite=false}
    for(const geo of list)parts.push({geo,mat})}
  const box=new THREE.Box3().setFromObject(root);KIT.parts[name]={parts,box,root};return KIT.parts[name]}
const KIT_LACK=[0x1d3b2a,0x8e1b1b,0x1b3f8e,0xdedede,0x1a1a1a,0xc9a227,0x6d2e7a,0x2f6f8f,0xd0623a];const KIT_COL=new THREE.Color();
function kitMeshes(name,cap){const P=KIT.parts[name];if(!P)return null;const ms=P.parts.map(({geo,mat})=>{const im=new THREE.InstancedMesh(geo,mat,cap);im.count=0;im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);if(/^(bikeP|scooP)$/.test(name)&&/^Lack/.test(mat.name||"")){im.userData.lack=1;mat.color.set(0xffffff);im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3).fill(1),3)}scene.add(im);return im});return {ms,cap,n:0}}

/* ---------- Fahrzeuge: Radknoten der neuen Modelle, Sitzhöhen ---------- */
function kitRideSeats(id){if(typeof RIDE_POS==="undefined"||!RIDE_POS[id])return;const g=vehMeshes[id];if(!g)return;const want={bike:/^Sattel$/,moped:/^Sitz$/,scoot:/^Trittbrett$/}[id];let node=null;g.traverse(o=>{if(!node&&want.test(o.name))node=o});if(!node)return;
  const p=g.position.clone(),r=g.rotation.clone(),vis=g.visible;g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(node);g.position.copy(p);g.rotation.copy(r);g.visible=vis;g.updateMatrixWorld(true);
  const c=b.getCenter(new THREE.Vector3()),s=g.scale.x||1,x=+(c.x/s).toFixed(2),y=+(b.max.y/s).toFixed(2);if(!isFinite(x)||!isFinite(y))return;
  if(id==="scoot")RIDE_POS.scoot.deck=[x,y];else RIDE_POS[id].seat=[x,y];KIT.seat=KIT.seat||{};KIT.seat[id]=[x,y]}
{const base=vehSwap;vehSwap=function(id,gl){base(id,gl);try{kitRideSeats(id)}catch(e){console.warn("Sitzhöhe",e)}}}

/* ---------- nur Nahes zeichnen: Instanzen um Noah herum auswählen (Laternen, Bäume) ---------- */
class KitNear{drop(fn){for(const e of this.L){const src=[],col=[];let k=0;for(let i=0;i<e.n;i++){if(fn(e.src[i*16+12],e.src[i*16+14]))continue;src.push(...e.src.subarray(i*16,i*16+16));if(e.col)col.push(...e.col.subarray(i*3,i*3+3));k++}e.src=Float32Array.from(src);if(e.col)e.col=Float32Array.from(col);e.n=k}}
  constructor(ms){this.L=ms.map(m=>({m,n:m.count,src:m.instanceMatrix.array.slice(0,m.count*16),col:m.instanceColor?m.instanceColor.array.slice(0,m.count*3):null}))}
  apply(px,py,R,skip){const R2=R*R;for(const e of this.L){const a=e.m.instanceMatrix.array;let k=0;for(let i=0;i<e.n;i++){const x=e.src[i*16+12],z=e.src[i*16+14],d=(x-px)*(x-px)+(z-py)*(z-py);if(d>R2||(skip&&skip(d)))continue;
      a.set(e.src.subarray(i*16,i*16+16),k*16);if(e.col)e.m.instanceColor.array.set(e.col.subarray(i*3,i*3+3),k*3);k++}
    e.m.count=k;e.m.instanceMatrix.needsUpdate=true;if(e.col)e.m.instanceColor.needsUpdate=true}}}
{const base=buildTreeMeshes;buildTreeMeshes=function(){const before=new Set(scene.children);const r=base.apply(this,arguments);KIT.treeMs=scene.children.filter(o=>!before.has(o)&&o.isInstancedMesh);return r}}
/* ---------- Laternen ---------- */
async function kitLamps(){const P=await kitLoad("lamp","stadt/Laterne.json");let pole=null;scene.traverse(o=>{if(o.isInstancedMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.height===7)pole=o});if(!pole)return;
  const sib=scene.children.filter(o=>o.isInstancedMesh&&o.count===pole.count&&o!==pole&&o.material&&(o.material===pole.material||o.material===lampBulbMat));
  // Ausleger-Richtung des Modells bestimmen und auf +X (zur Straße) drehen; Höhe auf 6,5 m bringen
  let led=null;P.root.traverse(o=>{if(!led&&/LED_Gehaeuse/.test(o.name))led=o});const lb=led?new THREE.Box3().setFromObject(led).getCenter(new THREE.Vector3()):new THREE.Vector3(1,0,0);
  const yaw=-Math.atan2(-lb.z,lb.x),H=P.box.max.y-P.box.min.y,sc=6.5/Math.max(1,H),fix=new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeScale(sc,sc,sc));fix.premultiply(new THREE.Matrix4().makeTranslation(0,-P.box.min.y*sc,0));
  const n=pole.count,m=new THREE.Matrix4(),out=new THREE.Matrix4();KIT.lampMats=[];
  KIT.lampGlb=[];for(const {geo,mat} of P.parts){const im=new THREE.InstancedMesh(geo,mat,n);KIT.lampGlb.push(im);for(let i=0;i<n;i++){pole.getMatrixAt(i,m);out.multiplyMatrices(m,fix);im.setMatrixAt(i,out)}im.castShadow=true;im.frustumCulled=false;scene.add(im);
    if(/Leuchtenabdeckung|LED/i.test(mat.name||"")){mat.emissive=new THREE.Color(0xfff0c8);mat.emissiveIntensity=0;KIT.lampMats.push(mat)}}
  const old=[pole,...sib];scene.traverse(o=>{if(o.isInstancedMesh&&o.count===n&&o.geometry&&o.geometry.parameters&&(o.geometry.parameters.width===1.6||o.geometry.parameters.width===.7)&&!old.includes(o))old.push(o)});
  for(const o of old)o.visible=true;KIT.lampNear=new KitNear(KIT.lampGlb);KIT.lampFar=new KitNear(old)}
function kitCull(){const cap=KIT_CAP[GFX.id]||KIT_CAP.standard,px=car.x,py=car.y,LR=cap.lampR||150;
  if(KIT.lampNear){KIT.lampNear.apply(px,py,LR);KIT.lampFar.apply(px,py,camera.far,d=>d<LR*LR)}
  if(KIT.treeMs){if(!KIT.treeNear)KIT.treeNear=new KitNear(KIT.treeMs);KIT.treeNear.apply(px,py,Math.min(cap.treeR||400,camera.far+30))}}
{const base=render3D;render3D=function(dt,now){if(KIT.lampMats){const dk=darkness();for(const m of KIT.lampMats)m.emissiveIntensity=dk*2.2}base(dt,now)}}

/* ---------- Fassaden-Bausatz um Noah herum ---------- */
const SHOP_STR=/^(Hauptstraße|Marktstraße|Markt|Limitenstraße|Stresemannstraße|Harmoniestraße|Am Neumarkt|Wilhelm-Strater-Straße|Langensgasse|Paulstraße|Gracht|Bahnhofstraße|Friedrich-Ebert-Straße|Hindenburgstraße|Bismarckstraße|Alter Markt|Waldhausener Straße|Steinmetzstraße|Stepgesstraße|Albertusstraße|Kaiserstraße|Lüpertzender Straße|Sandradstraße|Viersener Straße|Regentenstraße|Kapuzinerplatz|Marktstieg|Abteistraße|Mühlenstraße|Kirchplatz)$/;
function kitShopWall(B,x,y){if(B.shopT)return !!nearestRoad(x,y,10);if(!KIT.zentrum(x,y))return false;return !!nearestRoad(x,y,9,e=>e.r.h==="pedestrian"||SHOP_STR.test(e.r.n||""))}
const KM={};
/* Klinker-Reihenhaus (MG Teil 2) vor Straßenwänden: Rheydt häufig, sonst selten; nur Häuser ohne eigenes Satteldach */
function kitRHWall(B,i,x0,z0,L,dx,dz,onx,onz,shop){if(!KM.rhaus||shop||B.GB||L<5.8||B.h<5||B.h>11)return null;
  const mx=x0+dx*L/2,mz=z0+dz*L/2;if(!nearestRoad(mx+onx*7,mz+onz*7,9,e=>e.r&&e.r.w>=4.5&&!/footway|path|steps|cycleway|service/.test(e.r.h||"")))return null;
  const rh=KIT.zentrum(mx,mz,1.6);if(kitHash(B.i*13+i,77)>(rh?.75:.22))return null;
  let dep=9.3;for(const f of [.2,.5,.8]){const ax=x0+dx*L*f,az=z0+dz*L*f;for(let t=.6;t<=9.3;t+=.4){if(!inPoly(ax-onx*t,az-onz*t,B.p)){dep=Math.min(dep,t-.4);break}}}
  if(dep<4)return null;let n=Math.max(1,Math.round(L/6.8)),sx=L/(n*6.8);if(sx<.82&&n>1){n--;sx=L/(n*6.8)}if(sx>1.3||sx<.8)return null;
  const sy=(B.h+.3)/(KIT.rhEave||7);if(sy<.85||sy>1.4)return null;return {n,sx,sz:Math.min(1,dep/9.3),sy}}
/* frei begehbarer Gehweg? (kein Haus, keine Fahrbahn) */
function kitWalk(x,y){const i=gi(x,y);return i>=0&&!hgt[i]&&!solid[i]&&!(surf[i]&4)&&!!(surf[i]&8)}
const kitHash=(a,b)=>{let h=(a*73856093)^(b*19349663);h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967296};
/* Fahrrad-/Scooter-Modell auf Standmaß bringen: Längsachse = lokales x, Boden = 0, Mitte = 0 */
function kitNormVeh(name,len){const P=KIT.parts[name];if(!P)return;const b=P.box,ex=b.max.x-b.min.x,ez=b.max.z-b.min.z,long=Math.max(ex,ez),sc=len/Math.max(.1,long);
  const M=new THREE.Matrix4().makeTranslation(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2);if(ez>ex)M.premultiply(new THREE.Matrix4().makeRotationY(Math.PI/2));M.premultiply(new THREE.Matrix4().makeScale(sc,sc,sc));
  for(const q of P.parts)q.geo.applyMatrix4(M);P.box=new THREE.Box3();for(const q of P.parts){q.geo.computeBoundingBox();P.box.union(q.geo.boundingBox)}}
KIT.rheydt=(x,y)=>{const o=MG.real&&MG.real.orte&&MG.real.orte.rheydt_marktplatz;return !!o&&Math.hypot(x-o.x,y-o.y)<650};
/* Innenstädte (Läden, Ladenfassaden, Klinker-Reihenhäuser): Rheydt um den Markt, Gladbach um Hbf/Hindenburgstraße/Alter Markt, Odenkirchen */
KIT.zentrum=(x,y,f=1)=>{const O=MG.real&&MG.real.orte;if(!O)return false;const r=O.rheydt_marktplatz,g=O.gladbach_hbf;return (!!r&&Math.hypot(x-r.x,y-r.y)<650*f)||(!!g&&Math.hypot(x-g.x+250,y-g.y-150)<1150*f)};
function kitShopNear(x,y){for(const q of (MG.pois||[])){if(Math.abs(q.x-x)>16||Math.abs(q.y-y)>16)continue;if(/shop|cafe|restaurant|bakery|pharmacy|bank|kiosk|hairdresser|ice_cream|fast_food|supermarket|convenience|clothes|florist/.test(q.k||""))return true}return false}
function kitBuildInst(){try{kitCull()}catch(e){console.warn("Nahauswahl",e)}const cap=KIT_CAP[GFX.id]||KIT_CAP.standard;const R=cap.r,px=car.x,py=car.y;const near=[];
  const c0=Math.floor((px-R)/KIT.cell),c1=Math.floor((px+R)/KIT.cell),r0=Math.floor((py-R)/KIT.cell),r1=Math.floor((py+R)/KIT.cell);
  for(let a=c0;a<=c1;a++)for(let b=r0;b<=r1;b++){const L=KIT.grid.get(a+"_"+b);if(L)for(const B of L){const d=Math.hypot(B.cx-px,B.cy-py);if(d<R+20)near.push([d,B])}}
  near.sort((a,b)=>a[0]-b[0]);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(1,1,1),P=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);
  const put=(K,x,y,z,ang,sy=1,sx=1,sz=1)=>{if(!K||K.n>=K.cap)return false;Q.setFromAxisAngle(Y,ang);P.set(x,y,z);S.set(sx,sy,sz);M.compose(P,Q,S);for(const im of K.ms){im.setMatrixAt(K.n,M);if(im.userData.lack){const c=KIT_LACK[Math.floor(kitHash(Math.round(x*7),Math.round(z*7))*KIT_LACK.length)];im.setColorAt(K.n,KIT_COL.set(c));im.instanceColor.needsUpdate=true}}K.n++;return true};
  for(const k in KM)if(KM[k])KM[k].n=0;
  for(const [d,B] of near){const p=B.p,n=p.length/2;let u=0,longest=-1,li=0;B.sw=B.sw||[];const gy=BASE_Y;
    for(let i=0;i<n;i++){const j=(i+1)%n,x0=p[2*i],z0=p[2*i+1],x1=p[2*j],z1=p[2*j+1],L=Math.hypot(x1-x0,z1-z0);if(L<.05)continue;
      const dx=(x1-x0)/L,dz=(z1-z0)/L,onx=B.ccw?dz:-dz,onz=B.ccw?-dx:dx,ang=Math.atan2(onx,onz);if(L>longest){longest=L;li=i}
      const wallD=Math.hypot((x0+x1)/2-px,(z0+z1)/2-py);
      const shop=KIT.parts.shop&&L>4.5&&(B.sw[i]!==undefined?B.sw[i]:(B.sw[i]=kitShopWall(B,(x0+x1)/2+onx*1.5,(z0+z1)/2+onz*1.5)));
      const RH=(B.rh=B.rh||[])[i]!==undefined?B.rh[i]:(B.rh[i]=kitRHWall(B,i,x0,z0,L,dx,dz,onx,onz,shop));
      if(RH){if(wallD<R)for(let q=0;q<RH.n;q++){const uc=(q+.5)*L/RH.n;if(!put(KM.rhaus,x0+dx*uc+onx*.04,BASE_Y,z0+dz*uc+onz*.04,ang,RH.sy,RH.sx,RH.sz))break}u+=L;continue}
      if(wallD<R){const kStart=Math.ceil(u/WIN-.5),kEnd=Math.floor((u+L)/WIN-.5);let shopDone=false;
        for(let k=kStart;k<=kEnd;k++){const uc=(k+.5)*WIN-u;if(uc<.8||uc>L-.8)continue;const wx=x0+dx*uc+onx*.06,wz=z0+dz*uc+onz*.06,col=((k%8)+8)%8;
          for(let f=0;;f++){const y0=f*FLOOR,cy=y0+FLOOR*(64-32.5)/64;if(cy+1.05>B.h)break;
            if(f===0&&shop){if(!shopDone&&L>4.5){shopDone=true;const R_=KIT.rheydt(B.cx,B.cy)&&KM.shopR,K=R_?KM.shopR:KM.shop,Pb=KIT.parts[R_?"shopR":"shop"].box,w=Math.max(2,Pb.max.x-Pb.min.x),yb=-Pb.min.y,zb=-Pb.min.z;
              const cnt=Math.min(R_?2:3,Math.floor((L-1)/w));const s0=(L-cnt*w)/2+w/2;for(let q=0;q<cnt;q++)put(K,x0+dx*(s0+q*w)+onx*(R_?Math.min(zb,.3):.02),gy+yb,z0+dz*(s0+q*w)+onz*(R_?Math.min(zb,.3):.02),ang);
              const hs=kitHash(B.i,i+101);if(hs<.6&&KM.bikeP){const fr=R_?Math.min(zb,.3)+.75:.75,wide=kitWalk(x0+dx*L/2+onx*(fr+2.6),z0+dz*L/2+onz*(fr+2.6)),nb=wide?2+Math.floor(hs*5):1+Math.floor(hs*3),step=wide?.78:1.95,off=wide?fr+.9:fr+.45,st=hs<.3?1:L-1-(nb-1)*step;
                for(let q=0;q<nb;q++){const us=st+q*step;if(us<.6||us>L-.6)continue;const bx=x0+dx*us+onx*off,bz=z0+dz*us+onz*off;if(!kitWalk(bx,bz)||!kitWalk(bx+onx*(wide?.9:.4),bz+onz*(wide?.9:.4)))continue;
                  const sco=KM.scooP&&kitHash(B.i*7+q,i)<.22,tw=(kitHash(q,B.i)-.5)*.12;put(sco?KM.scooP:KM.bikeP,bx,groundY(bx,bz),bz,wide?ang+(q%2?-1.5708:1.5708)+tw:ang+(q%2?Math.PI:0)+tw)}}}continue}
            if(f%8===0&&col%4===1){put(KM.door,wx,gy+KIT.oy.door,wz,ang);const hh=kitHash(B.i,k);if(hh<.35&&KM.bikeP){const sd=hh<.17?1.35:-1.35,bx=wx+dx*sd+onx*.42,bz=wz+dz*sd+onz*.42;if(uc+sd>.9&&uc+sd<L-.9&&kitWalk(bx,bz))put(KM.bikeP,bx,groundY(bx,bz),bz,ang+(hh<.17?.06:Math.PI-.06))}continue}
            put(KM.win,wx,BASE_Y+cy-KIT.oy.win*1.44,wz,ang,1.44)}}}
      u+=L}
    // Regenrohre an den Enden der längsten Wand, Dachgauben auf Satteldächern
    if(d<R){const i=li,j=(i+1)%n,x0=p[2*i],z0=p[2*i+1],x1=p[2*j],z1=p[2*j+1],L=Math.hypot(x1-x0,z1-z0),dx=(x1-x0)/L,dz=(z1-z0)/L,onx=B.ccw?dz:-dz,onz=B.ccw?-dx:dx,ang=Math.atan2(onx,onz),sy=B.h/Math.max(.5,KIT.parts.pipe?KIT.parts.pipe.box.max.y-KIT.parts.pipe.box.min.y:2.48),py0=KIT.parts.pipe?-KIT.parts.pipe.box.min.y*sy:B.h/2;
      put(KM.pipe,x0+dx*.3+onx*.02,BASE_Y+py0,z0+dz*.3+onz*.02,ang,sy);put(KM.pipe,x1-dx*.3+onx*.02,BASE_Y+py0,z1-dz*.3+onz*.02,ang,sy);
      const G=B.GB;if(G){const s=G.s,A=G.P[s],Bq=G.P[(s+1)%4],C=G.P[(s+2)%4],D=G.P[(s+3)%4];
        const qx=(A[0]+C[0])/2,qz=(A[1]+C[1])/2,el=Math.hypot(Bq[0]-A[0],Bq[1]-A[1]),rise=G.ridge-G.eave,Pd=KIT.parts.dorm.box;
        if(el>=5)for(const [E0,E1] of [[A,Bq],[D,C]]){const mx=(E0[0]+E1[0])/2,mz=(E0[1]+E1[1])/2,ox=qx-mx,oz=qz-mz;const ol=Math.hypot(ox,oz)||1,nx=ox/ol,nz=oz/ol;
          let sc=1.3;if(ol<2.6)sc=Math.max(.9,ol/2);const front=.3,s0=front+Pd.max.z*sc,yb=G.eave+rise*front/ol-.12,top=yb+(Pd.max.y-Pd.min.y)*sc,ry=G.eave+rise*Math.min(1,(s0-Pd.min.z*sc)/ol);
          if(ol<1.8||top>G.ridge-.15||ry<yb+.3)continue;const cnt=Math.max(1,Math.min(4,Math.floor((el-1.5)/4.2))),ex=(E1[0]-E0[0])/el,ez=(E1[1]-E0[1])/el;
          for(let q=0;q<cnt;q++){const t=el*(q+.5)/cnt;put(KM.dorm,E0[0]+ex*t+nx*s0,BASE_Y+yb-Pd.min.y*sc,E0[1]+ez*t+nz*s0,Math.atan2(-nx,-nz),sc,sc,sc)}}}}}
  for(const k in KM){const K=KM[k];if(!K)continue;for(const im of K.ms){im.count=K.n;im.instanceMatrix.needsUpdate=true}}}
async function kitInit(){try{await kitLamps()}catch(e){console.info("Laterne nicht geladen",e)}
  const list=[["bikeP","fahrzeuge/Fahrrad.json"],["scooP","fahrzeuge/E-Scooter.json"],["win","bau/Fenster_Laibung_Fensterbank.json"],["door","bau/Hauseingang_mit_Stufe.json"],["pipe","bau/Regenrohr.json"],["dorm","bau/Dachgaube.json"],["shop","bau/Ladenerdgeschoss.json"],["shopR","bau/Ladenfassade_Rheydt.json"],["rhaus","bau/Rheydt_Klinker_Reihenhaus.json"]];
  const cap=KIT_CAP[GFX.id]||KIT_CAP.standard;for(const [k,f] of list){try{await kitLoad(k,f);if(k==="bikeP")kitNormVeh(k,1.75);if(k==="scooP")kitNormVeh(k,1.12);KM[k]=kitMeshes(k,cap[k])}catch(e){console.info("Bausatz fehlt",k,e)}}
  KIT.oy={door:KIT.parts.door?-KIT.parts.door.box.min.y:1.23,win:KIT.parts.win?(KIT.parts.win.box.min.y+KIT.parts.win.box.max.y)/2:0,dorm:KIT.parts.dorm?-KIT.parts.dorm.box.min.y*.15:0};
  if(KIT.parts.rhaus){const b=new THREE.Box3();for(const q of KIT.parts.rhaus.parts)if(/Schiefer/i.test(q.mat.name||"")){q.geo.computeBoundingBox();b.union(q.geo.boundingBox)}if(!b.isEmpty())KIT.rhEave=b.min.y}
  KIT.ready=true;kitBuildInst()}
{const base=update;update=function(dt){base(dt);if(!KIT.ready)return;KIT.last.t-=dt;if(KIT.last.t>0)return;KIT.last.t=.5;if(Math.hypot(car.x-KIT.last.x,car.y-KIT.last.y)<6)return;KIT.last.x=car.x;KIT.last.y=car.y;kitBuildInst()}}
{const base=loadVehicles;loadVehicles=async function(){const r=await base.apply(this,arguments);try{if(THREE.GLTFLoader)await kitInit()}catch(e){console.warn("Bausatz",e)}return r}}
