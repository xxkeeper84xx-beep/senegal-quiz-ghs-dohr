/* ================= Grafik-Umbau: Licht, Tiefe, Materialien, Kamera, Oberfläche =================
   Leistungsprofile (Menü → Grafik): „Schul-iPad“ (Ziel 30 FPS), „Standard“, „Hoch“. Automatische Auflösung je nach Bildrate.
   - Kantenglättung (MSAA) immer an, Auflösung bis zur Gerätepixeldichte (Profil), dynamisch nachgeregelt.
   - Nachmittagslicht: tiefere, warme Sonne, kühles Himmelslicht, Dunst in der Ferne (entfernte Häuser weniger Kontrast).
   - Schatten: engerer Ausschnitt um die Figur (schärfer), Kontaktschatten unter Noah, Passanten und Fahrzeugen.
   - Häuser: Satteldächer für rechteckige Wohnhäuser, dunkler Sockel und Traufkante, damit Licht und Schatten Kanten zeigen.
   - Fahrzeuge: Lack mit Klarlack und Spiegelung, getöntes Glas, matte Reifen.
   - Straßenmöbel (Mülleimer, Bänke, Fahrradbügel, Poller) entlang der Gehwege, Büdchen als Kiosk mit Vordach und Schaufenster.
   - Kamera weiter hinten und höher, im Hochformat mit größerem Blickwinkel; Oberfläche im Hochformat kompakt. */
const GFX_PROFILES={
  schule:{name:"Schul-iPad",pr:1.5,shadow:1024,shR:32,fogN:55,fogF:430,far:520,detail:0,props:.6,target:30},
  standard:{name:"Standard",pr:2,shadow:2048,shR:40,fogN:80,fogF:640,far:760,detail:1,props:1,target:30},
  hoch:{name:"Hoch",pr:2.5,shadow:2048,shR:55,fogN:110,fogF:950,far:1100,detail:1,props:1,target:55}};
function gfxProfileId(){let id=null;try{id=localStorage.getItem("pyGfx")}catch(e){}if(GFX_PROFILES[id])return id;
  const touch=("ontouchstart" in window)||navigator.maxTouchPoints>0;if(!touch)return "hoch";
  const px=screen.width*screen.height*(devicePixelRatio||1)**2,cores=navigator.hardwareConcurrency||4;return (cores>=6&&px>3e6)?"standard":"schule"}
const GFX=Object.assign({id:gfxProfileId()},GFX_PROFILES[gfxProfileId()]);
const GFX_HAZE=new THREE.Color("#e7d3bd");
function gfxPR(){return Math.min(devicePixelRatio||1,GFX.pr)}

/* ---------- Renderer, Schatten, Licht ---------- */
renderer.setPixelRatio(gfxPR());
sun.shadow.mapSize.set(GFX.shadow,GFX.shadow);Object.assign(sun.shadow.camera,{left:-GFX.shR,right:GFX.shR,top:GFX.shR,bottom:-GFX.shR,near:5,far:420});sun.shadow.camera.updateProjectionMatrix();
sun.shadow.radius=3;sun.shadow.bias=-.0004;sun.shadow.normalBias=.022;camera.far=GFX.far;camera.updateProjectionMatrix();
const GFX_SUN=[-92,78,70];                // Sonne aus Südwest, ca. 34° hoch: lange, weiche Nachmittagsschatten
function gfxLight(dk,du){const day=1-dk;sun.intensity=1.9*Math.max(.08,day);hemi.intensity=.5*day+.12;
  sun.color.setRGB(1,.88-du*.22,.74-du*.36);if(window.__lin)sun.color.convertSRGBToLinear()}
{const base=linearizeScene;linearizeScene=function(){base();hemi.color.set("#b9d0ec").convertSRGBToLinear();hemi.groundColor.set("#a08a70").convertSRGBToLinear();renderer.toneMappingExposure=1.08}}
/* Kamera-Sichtweite folgt dem Dunst; beim Fliegen weiter */
{let lastFar=0;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);gfxPoles(VH);const f=VH.fly?2700:GFX.far;if(f!==lastFar){lastFar=f;camera.far=f;camera.updateProjectionMatrix()}
  if(skyDome){skyDome.scale.setScalar(Math.min(1,camera.far*.92/2600));skyDome.position.copy(camera.position)}}}
/* Laternenmasten zwischen Kamera und Noah: Kamera rückt vor den Mast */
let POLES=null;
function gfxPoles(VH){if(VH.fly)return;if(!POLES){POLES=[];scene.traverse(o=>{if(o.isInstancedMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.height===7){const m=new THREE.Matrix4(),v=new THREE.Vector3();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);v.setFromMatrixPosition(m);POLES.push([v.x,v.z])}}})}
  const c=camera.position,px=car.x,py=car.y,dx=c.x-px,dy=c.z-py,L=Math.hypot(dx,dy);if(L<1)return;let tMin=1;
  for(const q of POLES){if(Math.abs(q[0]-px)>L+1||Math.abs(q[1]-py)>L+1)continue;const t=((q[0]-px)*dx+(q[1]-py)*dy)/(L*L);if(t<.15||t>1.05)continue;const ex=px+dx*t-q[0],ey=py+dy*t-q[1],near=Math.hypot(c.x-q[0],c.z-q[1]);if(Math.hypot(ex,ey)<.55||near<1.3)tMin=Math.min(tMin,t-(near<1.3?1.4:.6)/L)}
  if(tMin<1){tMin=Math.max(.25,tMin);c.set(px+dx*tMin,car.alt+(c.y-car.alt)*Math.max(.6,tMin),py+dy*tMin);camera.lookAt(px,car.alt+1.2,py)}}

/* ---------- dynamische Auflösung (ersetzt die alte Stufen-Absenkung) ---------- */
const DYN={t:0,n:0,pr:gfxPR(),min:.75,fps:0};
watchPerf=function(dt){if(state.mode!=="play")return;DYN.t+=dt;DYN.n++;if(DYN.t<2.5)return;const fps=DYN.n/DYN.t;DYN.fps=fps;DYN.t=0;DYN.n=0;
  let pr=DYN.pr;if(fps<GFX.target-3)pr=Math.max(DYN.min,pr*(fps<GFX.target*.7?.8:.9));else if(fps>GFX.target+10&&pr<gfxPR())pr=Math.min(gfxPR(),pr*1.08);
  if(Math.abs(pr-DYN.pr)>.02){DYN.pr=pr;renderer.setPixelRatio(pr);resize()}};
/* Anzeige: Bildrate, Auflösung, Zeichenaufrufe (Menü → 📊) */
let gfxHud=null;function gfxStats(){if(!gfxHud)return;const i=renderer.info.render;gfxHud.textContent=`${GFX.name} · ${DYN.fps?DYN.fps.toFixed(0):"–"} FPS · Auflösung ×${DYN.pr.toFixed(2)} · ${i.calls} Aufrufe · ${(i.triangles/1000).toFixed(0)}k Dreiecke`}
{const base=render3D;render3D=function(dt,now){gfxContact();base(dt,now);gfxStats()}}

/* ---------- Kontaktschatten ---------- */
let CS=null;
function gfxContact(){if(!CS){const t=canvasTex(64,64,c=>{const g=c.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,"rgba(0,0,0,.62)");g.addColorStop(.55,"rgba(0,0,0,.3)");g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,0,64,64)});
    const geo=new THREE.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);CS=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-10,polygonOffsetUnits:-10}),96);
    CS.frustumCulled=false;CS.renderOrder=3;CS.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(CS);CS.o=new THREE.Object3D()}
  let n=0;const o=CS.o,put=(x,y,sx,sz,a,gy)=>{if(n>=96)return;o.position.set(x,(gy===undefined?groundY(x,y):gy)+.025,y);o.rotation.set(0,-a,0);o.scale.set(sx,1,sz);o.updateMatrix();CS.setMatrixAt(n++,o.matrix)};
  const VH=V();if(VH.id==="walk")put(car.x,car.y,1.0,1.0,0);else if(!VH.fly||car.alt-groundY(car.x,car.y)<1.5){const s=VG.size[VH.id]||{len:2,wid:1};put(car.x,car.y,s.len*1.15,s.wid*1.35,car.a)}
  if(save.left&&vehMeshes[save.left.id]&&!VEH[save.left.id].fly){const s=VG.size[save.left.id]||{len:2,wid:1};put(save.left.x,save.left.y,s.len*1.15,s.wid*1.35,save.left.a)}
  for(const p of peds){if(n>=70)break;if(!p.det||p.x===undefined)continue;const vis=(p.glb&&p.glb.obj.visible)||(p.mesh&&p.mesh.visible);if(!vis)continue;const k=(p.look&&p.look.scale)||1;put(p.x,p.y,.95*k,.95*k,0)}
  for(const S of STANDS){if(n>=82)break;if(S.glb&&S.glb.obj.visible)put(S.x,S.y,.95,.95,0)}
  for(const c of npcs){if(n>=96)break;if(c.x===undefined||Math.abs(c.x-car.x)>70||Math.abs(c.y-car.y)>70)continue;put(c.x,c.y,c.bike?2:4.6,c.bike?.8:2.3,c.ang||0)}
  CS.count=n;CS.instanceMatrix.needsUpdate=true}

/* ---------- Häuser: Satteldächer, Sockel, Traufkante ---------- */
let GFX_PL=null;const gfxPlinth={};
function gfxGable(p,h,m,kind,t){if(p.length!==8||m>0||!(kind==="res"||kind==="brick"))return null;if(!/^(house|detached|semidetached_house|terrace|residential|yes|apartments)$/.test(t))return null;
  const P=[[p[0],p[1]],[p[2],p[3]],[p[4],p[5]],[p[6],p[7]]],L=i=>Math.hypot(P[(i+1)%4][0]-P[i][0],P[(i+1)%4][1]-P[i][1]);
  for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4],c=P[(i+2)%4],ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-b[0],vy=c[1]-b[1];if(Math.abs(ux*vx+uy*vy)/(Math.hypot(ux,uy)*Math.hypot(vx,vy)||1)>.2)return null}
  const s=L(0)>=L(1)?0:1,short=Math.min(L(0),L(1));if(short>15||short<4||h>17)return null;
  const roofH=Math.min(Math.max(short*.42,1.8),5.5,h-2.6);if(roofH<1.5)return null;return {P,s,eave:h-roofH,ridge:h}}
function gfxGableRoof(G,gRoof,g,col,roofCol){const {P,s,eave,ridge}=g;const A=P[s],B=P[(s+1)%4],C=P[(s+2)%4],D=P[(s+3)%4];
  const R0=[(A[0]+D[0])/2,(A[1]+D[1])/2],R1=[(B[0]+C[0])/2,(B[1]+C[1])/2],cx=(A[0]+C[0])/2,cz=(A[1]+C[1])/2;
  const tri=(geo,q,colr,uv)=>{const v0=new THREE.Vector3(...q[0]),v1=new THREE.Vector3(...q[1]),v2=new THREE.Vector3(...q[2]);const nrm=new THREE.Vector3().subVectors(v1,v0).cross(new THREE.Vector3().subVectors(v2,v0)).normalize();
    const mid=new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);const out=new THREE.Vector3(mid.x-cx,0,mid.z-cz);let pts=q;if(nrm.y<-.01||(Math.abs(nrm.y)<.3&&nrm.dot(out)<0)){pts=[q[0],q[2],q[1]];nrm.negate()}
    for(const v of pts)geo.v(v[0],v[1],v[2],nrm.x,nrm.y,nrm.z,uv?uv(v)[0]:v[0]/4,uv?uv(v)[1]:v[2]/4,colr)};
  // Dachflächen (leicht überstehend wirkt durch die Traufkante)
  tri(gRoof,[[A[0],eave,A[1]],[B[0],eave,B[1]],[R1[0],ridge,R1[1]]],roofCol);tri(gRoof,[[A[0],eave,A[1]],[R1[0],ridge,R1[1]],[R0[0],ridge,R0[1]]],roofCol);
  tri(gRoof,[[D[0],eave,D[1]],[C[0],eave,C[1]],[R1[0],ridge,R1[1]]],roofCol);tri(gRoof,[[D[0],eave,D[1]],[R1[0],ridge,R1[1]],[R0[0],ridge,R0[1]]],roofCol);
  // Giebeldreiecke in der Fassadenfarbe
  const uvW=(a,b)=>v=>[Math.hypot(v[0]-a[0],v[2]-a[1])/UW,v[1]/UH];
  tri(G,[[B[0],eave,B[1]],[C[0],eave,C[1]],[R1[0],ridge,R1[1]]],col,uvW(B,C));tri(G,[[D[0],eave,D[1]],[A[0],eave,A[1]],[R0[0],ridge,R0[1]]],col,uvW(D,A))}
function gfxBands(p,h,m,kind,ck,ccw,flat){if(!GFX.detail||kind==="hedge"||kind==="fence"||h<3.5)return;const G=gfxPlinth[ck]||(gfxPlinth[ck]=new Geo()),n=p.length/2;
  const dark=C(kind==="glass"?"#4a4f57":kind==="brick"?"#5b4a42":"#7a746a"),lite=C(kind==="brick"?"#8c7a6c":"#d9d3c6");
  for(let i=0;i<n;i++){const j=(i+1)%n,x0=p[2*i],z0=p[2*i+1],x1=p[2*j],z1=p[2*j+1],Lz=Math.hypot(x1-x0,z1-z0);if(Lz<.8)continue;const dx=(x1-x0)/Lz,dz=(z1-z0)/Lz,onx=ccw?dz:-dz,onz=ccw?-dx:dx;
    const band=(y0,y1,off,c)=>{const a=[x0+onx*off,z0+onz*off],b=[x1+onx*off,z1+onz*off];const q=[[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]];
      const T=ccw?[[0,2,1],[0,3,2]]:[[0,1,2],[0,2,3]];for(const t of T)for(const k of t)G.v(q[k][0],q[k][1],q[k][2],onx,0,onz,0,0,c);
      const top=[[a[0],y1,a[1]],[b[0],y1,b[1]],[x1,y1,z1],[x0,y1,z0]];for(const t of [[0,1,2],[0,2,3]]){const tt=ccw?t:[t[0],t[2],t[1]];for(const k of tt)G.v(top[k][0],top[k][1],top[k][2],0,1,0,0,0,c)}};
    band(m,m+.7,.06,dark);if(flat&&h>5)band(h-.32,h+.04,.12,lite)}}
{const base=buildCity;buildCity=function(){base();if(!GFX_PL)GFX_PL=new THREE.MeshLambertMaterial({vertexColors:true});for(const k in gfxPlinth)gfxPlinth[k].mesh(GFX_PL,true,true)}}

/* ---------- Fahrzeuge: Lack, Glas, Reifen ---------- */
function gfxCarMats(id){const g=vehMeshes[id];if(!g||!g.userData||!g.userData.glb)return;const old=g.userData.paint,map=new Map();
  g.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(Array.isArray(m))return;let nm=map.get(m);
    if(!nm){const n=(m.name||"");
      if(m===old){nm=new THREE.MeshPhysicalMaterial({color:m.color.clone(),map:m.map||null,metalness:.45,roughness:.3,clearcoat:1,clearcoatRoughness:.06,envMap:ENV||null,envMapIntensity:1.15});nm.name=m.name;nm.userData.orig=m.userData.orig;g.userData.paint=nm}
      else if(/Glas|Scheibe|Fenster|glass/i.test(n)){nm=new THREE.MeshPhysicalMaterial({color:new THREE.Color("#1c2630"),metalness:.2,roughness:.04,transparent:true,opacity:.62,envMap:ENV||null,envMapIntensity:1.6,depthWrite:false});nm.name=n}
      else if(/Reifen|Gummi|Tire|Tyre|Rubber/i.test(n)){nm=m.clone();nm.color=new THREE.Color("#161616");if("roughness" in nm){nm.roughness=.92;nm.metalness=0}nm.envMapIntensity=.15}
      else if(/Chrom|Felge|Rim|Metall|Metal|Auspuff/i.test(n)){nm=m.clone();if("roughness" in nm){nm.roughness=.18;nm.metalness=.9}nm.envMap=ENV||null;nm.envMapIntensity=1.2}
      else nm=m;map.set(m,nm)}
    o.material=nm});
  if(window.__lin&&g.userData.paint!==old){applyPaint(id)}}
{const base=vehSwap;vehSwap=function(id,gl){base(id,gl);try{gfxCarMats(id);const v=VAR&&VAR[save.vsel&&save.vsel[id]];if(v){save.paint[id]=save.paint[id]||v.paint;applyPaint(id)}}catch(e){console.warn("Fahrzeugmaterial",e)}}}

/* ---------- Missionsmarker kleiner ---------- */
{const base=xMarker;xMarker=function(col){const m=base(col);m.scale.multiplyScalar(.6);return m}}

/* ---------- Straßenmöbel entlang der Gehwege ---------- */
function gfxProps(){if(!GFX.props)return;const step=46/GFX.props,L=[];
  for(const e of carEdges){if(e.len<20||e.r.h==="service")continue;const side=e.id%2?1:-1;for(let s=12;s<e.len-8;s+=step){edgePos(e,s,tmpP);const sd=((s/step|0)%2?1:-1)*side,off=e.r.w/2+2.25;
    const x=tmpP.x-tmpP.dy*off*sd,y=tmpP.y+tmpP.dx*off*sd;const i=gi(x,y);if(i<0||blockedGround(x,y)||!(surf[i]&8))continue;if(typeof inSchool==="function"&&inSchool(x,y,1))continue;
    L.push({x,y,a:Math.atan2(tmpP.dy,tmpP.dx)+(sd>0?Math.PI:0),k:Math.floor(h01(L.length*7.13+e.id)*4)});solid[i]=1}}
  const mk=(geo,col,list)=>{if(!list.length)return;const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:col}),list.length);const o=new THREE.Object3D();
    list.forEach((q,i)=>{o.position.set(q.x,SIDE_Y,q.y);o.rotation.set(0,-q.a,0);o.updateMatrix();m.setMatrixAt(i,o.matrix)});m.castShadow=true;m.receiveShadow=true;if(window.__lin)m.material.color.convertSRGBToLinear();scene.add(m)};
  const bins=L.filter(q=>q.k===0),benches=L.filter(q=>q.k===1),racks=L.filter(q=>q.k===2),posts=L.filter(q=>q.k===3);
  const bin=new THREE.CylinderGeometry(.28,.25,.95,10);bin.translate(0,.48,0);mk(bin,"#2f5d3a",bins);
  const binLid=new THREE.CylinderGeometry(.3,.3,.06,10);binLid.translate(0,.98,0);mk(binLid,"#1d2b22",bins);
  const seat=new THREE.BoxGeometry(1.7,.07,.42);seat.translate(0,.45,0);mk(seat,"#8a5d3b",benches);
  const back=new THREE.BoxGeometry(1.7,.38,.06);back.translate(0,.72,-.2);mk(back,"#8a5d3b",benches);
  const legs=new THREE.BoxGeometry(1.5,.44,.36);legs.translate(0,.22,0);mk(legs,"#2e3238",benches);
  const rack=new THREE.TorusGeometry(.38,.03,6,14,Math.PI);rack.translate(0,.38,0);const r2=rack.clone();r2.translate(0,0,.6);mk(rack,"#9aa1a8",racks);mk(r2,"#9aa1a8",racks);
  const post=new THREE.CylinderGeometry(.06,.07,.9,8);post.translate(0,.45,0);mk(post,"#3a3f46",posts);const cap=new THREE.SphereGeometry(.07,8,6);cap.translate(0,.92,0);mk(cap,"#c9a23a",posts)}
{const base=buildQuestWorld;buildQuestWorld=function(){base();try{gfxProps();gfxTorfbend()}catch(e){console.warn("Straßenmöbel",e)}}}
/* Teststrecke vor der GHS Dohr: Schilder, Fahrradständer mit Rädern am Büdchen */
function gfxTorfbend(){if(!MG.start)return;const [sx,sy,sa]=MG.start;const near=(x,y,r)=>{for(let k=0;k<20;k++){const a=k*.9,d=k*.25;const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(!blockedGround(px,py))return [px,py]}return [x,y]};
  const sign=(x,y,a,draw,w=.62,h=.62,pole=2.4)=>{const g=new THREE.Group();g.position.set(x,SIDE_Y,y);g.rotation.y=-a;const p=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,pole,8),new THREE.MeshLambertMaterial({color:0x9aa1a8}));p.position.y=pole/2;g.add(p);
    const t=canvasTex(128,128,draw);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;const s=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:t,transparent:true,side:THREE.DoubleSide}));s.position.set(0,pole-h/2+.05,.05);g.add(s);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g)};
  const fw=[Math.cos(sa),Math.sin(sa)],lf=[-fw[1],fw[0]];
  // „Achtung Kinder/Schule“ und Straßenschild „Am Torfbend“
  {const [x,y]=near(sx+fw[0]*-6+lf[0]*1.2,sy+fw[1]*-6+lf[1]*1.2);sign(x,y,sa,(c)=>{c.fillStyle="#fff";c.beginPath();c.moveTo(64,8);c.lineTo(122,116);c.lineTo(6,116);c.closePath();c.fill();c.lineWidth=12;c.strokeStyle="#d81e2c";c.stroke();c.fillStyle="#111";c.font="bold 52px sans-serif";c.textAlign="center";c.fillText("🚸",64,98)})}
  {const [x,y]=near(sx+fw[0]*14+lf[0]*1.2,sy+fw[1]*14+lf[1]*1.2);sign(x,y,sa+Math.PI/2,(c)=>{c.fillStyle="#f4f4f4";c.fillRect(0,34,128,60);c.strokeStyle="#111";c.lineWidth=4;c.strokeRect(4,38,120,52);c.fillStyle="#111";c.font="bold 22px sans-serif";c.textAlign="center";c.fillText("Am Torfbend",64,72)},1.1,1.1,2.6)}
  // Fahrradständer mit zwei abgestellten Rädern am Büdchen
  const Y=typeof XG!=="undefined"&&XG.find(g=>g.id==="yilmaz");if(Y&&Y.pos&&typeof makeBike==="function"){for(let k=0;k<2;k++){const b=makeBike(["#2d5fa8","#d8452e"][k]);const [x,y]=near(Y.pos.x+fw[0]*(3+k*.8)+lf[0]*1.4,Y.pos.y+fw[1]*(3+k*.8)+lf[1]*1.4);b.position.set(x,SIDE_Y,y);b.rotation.y=-(sa+Math.PI/2);b.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(b)}}}

/* ---------- Kamera ---------- */
const gfxPortrait=()=>innerHeight>innerWidth;

/* ---------- Oberfläche im Hochformat ---------- */
{const css=document.createElement("style");css.textContent=`
#hudRow{position:fixed;z-index:8;left:calc(10px + env(safe-area-inset-left,0px));top:calc(10px + env(safe-area-inset-top,0px));display:flex;gap:6px;align-items:center;pointer-events:none}
#hudRow>*{pointer-events:auto}
body.gfx-portrait #hudRow>#stats,body.gfx-portrait #hudRow>#btnMore,body.gfx-portrait #hudRow>#btnPhone{position:static!important;left:auto!important;top:auto!important;transform:none!important;margin:0!important}
body.gfx-portrait #stats{min-width:0!important;padding:6px 10px!important;height:38px;box-sizing:border-box;display:flex!important;align-items:center;gap:6px;font-size:15px}
body.gfx-portrait #stats .bar,body.gfx-portrait #stats progress,body.gfx-portrait #stats i,body.gfx-portrait #stats small{max-width:46px}
body.gfx-portrait #btnMore{height:38px!important;min-height:38px!important;padding:0 10px!important;font-size:13px!important}
body.gfx-portrait #btnPhone{height:38px!important;width:40px!important}
body.gfx-portrait #mm{width:92px!important;height:92px!important;top:calc(10px + env(safe-area-inset-top,0px))!important;right:calc(10px + env(safe-area-inset-right,0px))!important;left:auto!important;bottom:auto!important}
body.gfx-portrait #goal{left:calc(10px + env(safe-area-inset-left,0px))!important;right:calc(112px + env(safe-area-inset-right,0px))!important;top:calc(56px + env(safe-area-inset-top,0px))!important;transform:none!important;max-width:none!important;max-height:none!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;font-size:13px!important;line-height:1.3!important;padding:7px 10px!important;border-radius:12px!important}
body.gfx-portrait #district{top:calc(108px + env(safe-area-inset-top,0px))!important;bottom:auto!important;right:calc(8px + env(safe-area-inset-right,0px))!important;font-size:12px!important;max-width:110px}
body.gfx-portrait #prompt{bottom:calc(118px + env(safe-area-inset-bottom,0px))!important}
#gfxHud{position:fixed;z-index:9;left:50%;transform:translateX(-50%);bottom:calc(4px + env(safe-area-inset-bottom,0px));font:600 11px ui-monospace,monospace;color:#fff;background:rgba(10,14,32,.7);padding:3px 8px;border-radius:8px;pointer-events:none}`;
  document.head.appendChild(css);
  const row=document.createElement("div");row.id="hudRow";document.body.appendChild(row);
  const place=()=>{const P=gfxPortrait()&&innerWidth<900;document.body.classList.toggle("gfx-portrait",P);for(const id of ["stats","btnMore","btnPhone"]){const el=$(id);if(!el)continue;if(P&&el.parentNode!==row)row.appendChild(el);if(!P&&el.parentNode===row)document.body.appendChild(el)}};
  addEventListener("resize",place);setTimeout(place,0);setTimeout(place,1500)}
/* Menü: Grafikprofil und Bildraten-Anzeige */
{const tb=$("topbtns");if(tb){const b=document.createElement("button");b.type="button";const lab=()=>b.textContent=`🎛️ Grafik: ${GFX.name}`;lab();
  b.onclick=()=>{const ids=Object.keys(GFX_PROFILES),nx=ids[(ids.indexOf(GFX.id)+1)%ids.length];try{localStorage.setItem("pyGfx",nx)}catch(e){}Object.assign(GFX,{id:nx},GFX_PROFILES[nx]);DYN.pr=gfxPR();renderer.setPixelRatio(DYN.pr);
    sun.shadow.mapSize.set(GFX.shadow,GFX.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}Object.assign(sun.shadow.camera,{left:-GFX.shR,right:GFX.shR,top:GFX.shR,bottom:-GFX.shR});sun.shadow.camera.updateProjectionMatrix();resize();lab();
    toast(`🎛️ Grafik: ${GFX.name}`,"Dächer, Sockel und Straßenmöbel ändern sich nach dem nächsten Neustart.","#7fd3ff")};tb.appendChild(b);
  const f=document.createElement("button");f.type="button";f.textContent="📊 Bildrate anzeigen";f.onclick=()=>{if(gfxHud){gfxHud.remove();gfxHud=null}else{gfxHud=document.createElement("div");gfxHud.id="gfxHud";document.body.appendChild(gfxHud)}};tb.appendChild(f)}}
/* Shader vor dem Spielstart übersetzen (sonst ruckeln die ersten Bilder nach dem Laden eines Gebiets) */
{const base=hideTitle;hideTitle=function(){try{renderer.compile(scene,camera)}catch(e){}return base.apply(this,arguments)}}
