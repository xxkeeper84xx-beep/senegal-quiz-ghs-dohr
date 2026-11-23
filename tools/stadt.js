/* ================= Ganze Stadt, Stufe 1 (23.11.) =================
   1. Vorab berechnete Gebäudeschatten für die ganze geladene Kachel (Sonnenrichtung wie das Licht im Spiel).
      In Noahs Nähe übernehmen die dynamischen Schatten (Figuren, Autos, Gebäude), weiter weg die vorab berechneten.
   2. Fernansicht: jenseits der Sichtweite die übrige Stadt als vereinfachte Gebäudeblöcke (Raster 40 m aus allen 46 Kacheln)
      auf dem Höhengelände mit Luftbild (Stadtkarte, Geobasis NRW). Eigener Zeichendurchgang mit großer Sichtweite,
      gleicher Dunst wie die nahe Stadt. Gesperrte Gebiete sind dort zu sehen, aber nicht befahrbar.
   3. Wahrzeichen (amtliche Gebäudeformen, MG Teil 2) ersetzen an ihrer echten Stelle das einfache Kartengebäude:
      GHS Dohr Torfbend und Haupthaus, Hauptkirche Rheydt, Schloss Rheydt, Hauptbahnhof, Borussia-Park.
   4. Nachbarkachel wird am Rand früh vorgeladen (kürzerer Wechsel). */
const STADT={B:[],ready:false};
const STADT_Q={schule:{res:2,fern:2600,inst:5000,terr:true},standard:{res:1.6,fern:4200,inst:10000,terr:true},hoch:{res:1.25,fern:6500,inst:18000,terr:true}};
/* Sichtweite und Dunst: Dunst deutlich weiter als die Kamera reicht, damit die Fernansicht sichtbar wird */
Object.assign(GFX_PROFILES.schule,{fogN:140,fogF:1900});Object.assign(GFX_PROFILES.standard,{fogN:180,fogF:2800});Object.assign(GFX_PROFILES.hoch,{fogN:220,fogF:3800});
if(GFX&&GFX_PROFILES[GFX.id]){GFX.fogN=GFX_PROFILES[GFX.id].fogN;GFX.fogF=GFX_PROFILES[GFX.id].fogF}
const stadtQ=()=>STADT_Q[GFX.id]||STADT_Q.standard;

/* ---------- Gebäude merken (aus buildCity) und Wahrzeichen ausnehmen ---------- */
function stadtRec(p,h,m,kind){if(kind==="hedge"||kind==="fence"||h<2)return;STADT.B.push([p,h])}
const wzIn=(x,y,q)=>{let s=0;const n=q.length/2;for(let i=0;i<n;i++){const j=(i+1)%n,c=(q[2*j]-q[2*i])*(y-q[2*i+1])-(q[2*j+1]-q[2*i+1])*(x-q[2*i]);if(c===0)continue;const sg=c>0?1:-1;if(s&&sg!==s)return false;s=sg}return true};
function wzSkip(b){if(typeof WZ_DATA==="undefined")return false;const p=b.p,n=p.length/2;let cx=0,cy=0;for(let i=0;i<n;i++){cx+=p[2*i];cy+=p[2*i+1]}cx/=n;cy/=n;
  for(const W of WZ_DATA)if(Math.abs(cx-W.x)<160&&Math.abs(cy-W.y)<160&&wzIn(cx,cy,W.hull))return true;return false}

/* ---------- 1. vorab berechnete Gebäudeschatten ---------- */
function stadtShadows(){const E=REG.ext,res=stadtQ().res,W=Math.min(4096,Math.ceil((E[1]-E[0])/res)),H=Math.min(4096,Math.ceil((E[3]-E[2])/res));
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,W,H);g.fillStyle="#000";
  const sx=-GFX_SUN[0]/GFX_SUN[1],sy=-GFX_SUN[2]/GFX_SUN[1],kx=W/(E[1]-E[0]),ky=H/(E[3]-E[2]),X=x=>(x-E[0])*kx,Y=y=>(y-E[2])*ky;
  const all=STADT.B.concat((typeof WZ_DATA!=="undefined"?WZ_DATA:[]).map(w=>[w.hull,w.h*.85]));
  for(const [p,h] of all){const n=p.length/2,dx=sx*h,dy=sy*h;g.beginPath();
    for(let i=0;i<n;i++){const j=(i+1)%n;g.moveTo(X(p[2*i]),Y(p[2*i+1]));g.lineTo(X(p[2*j]),Y(p[2*j+1]));g.lineTo(X(p[2*j]+dx),Y(p[2*j+1]+dy));g.lineTo(X(p[2*i]+dx),Y(p[2*i+1]+dy));g.closePath()}
    g.moveTo(X(p[0]+dx),Y(p[1]+dy));for(let i=1;i<n;i++)g.lineTo(X(p[2*i]+dx),Y(p[2*i+1]+dy));g.closePath();g.fill("nonzero")}
  const tex=new THREE.CanvasTexture(cv);tex.generateMipmaps=true;tex.minFilter=THREE.LinearMipmapLinearFilter;tex.anisotropy=4;
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.MultiplyBlending,premultipliedAlpha:true,
    uniforms:{map:{value:tex},k:{value:.36},pl:{value:new THREE.Vector2()},r0:{value:20},r1:{value:30},fN:{value:100},fF:{value:1000}},
    vertexShader:"varying vec2 vUv;varying vec3 vW;varying float vD;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}",
    fragmentShader:"uniform sampler2D map;uniform float k,r0,r1,fN,fF;uniform vec2 pl;varying vec2 vUv;varying vec3 vW;varying float vD;void main(){float m=texture2D(map,vUv).r;float s=(1.-m)*k;s*=smoothstep(r0,r1,distance(vW.xz,pl));s*=1.-smoothstep(fN,fF,vD);gl_FragColor=vec4(vec3(1.-s),1.);}"});
  const me=new THREE.Mesh(new THREE.PlaneGeometry(E[1]-E[0],E[3]-E[2]),mat);me.rotation.x=-Math.PI/2;me.position.set((E[0]+E[1])/2,.31,(E[2]+E[3])/2);me.renderOrder=-1;me.frustumCulled=false;scene.add(me);
  STADT.sh=mat;STADT.shMesh=me}

/* ---------- 2. Fernansicht ---------- */
const FERN={ready:false,scene:new THREE.Scene(),cam:new THREE.PerspectiveCamera(),last:{x:1e9,y:1e9},href:0};
function fernH(x,y){if(typeof FERN_H==="undefined")return 0;const H=FERN.hd||(FERN.hd=new Int16Array(Uint8Array.from(atob(FERN_H.b64),c=>c.charCodeAt(0)).buffer));
  const fx=(x-FERN_H.x0)/FERN_H.c,fy=(y-FERN_H.y0)/FERN_H.c,i=Math.max(0,Math.min(FERN_H.w-2,Math.floor(fx))),j=Math.max(0,Math.min(FERN_H.h-2,Math.floor(fy))),u=Math.max(0,Math.min(1,fx-i)),v=Math.max(0,Math.min(1,fy-j)),W=FERN_H.w;
  return ((H[j*W+i]*(1-u)+H[j*W+i+1]*u)*(1-v)+(H[(j+1)*W+i]*(1-u)+H[(j+1)*W+i+1]*u)*v)/10}
const stadtScript=src=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
async function fernInit(){try{await stadtScript("fern/stadt_fern.js");await stadtScript("fern/hoehe.js")}catch(e){console.info("Fernansicht fehlt",e);return}
  const D=FERN_DATA;FERN.d=Uint8Array.from(atob(D.b64),c=>c.charCodeAt(0));const Q=stadtQ();FERN.scene.fog=scene.fog;
  FERN.hemi=new THREE.HemisphereLight();FERN.sun=new THREE.DirectionalLight();FERN.scene.add(FERN.hemi,FERN.sun,FERN.sun.target);
  // Blöcke: Dachfläche dunkler als die Wände (Vertexfarben), Farbe je Gebäudeart
  const geo=new THREE.BoxGeometry(1,1,1);geo.translate(0,.5,0);const pos=geo.attributes.position,col=[];for(let i=0;i<pos.count;i++){const top=pos.getY(i)>.99;const c=top?.62:1;col.push(c,c,c)}
  geo.setAttribute("color",new THREE.Float32BufferAttribute(col,3));
  FERN.box=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}),Q.inst);FERN.box.count=0;FERN.box.frustumCulled=false;
  FERN.box.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(Q.inst*3),3);FERN.scene.add(FERN.box);
  FERN.cols={1:["#c9bba3","#a98a78","#d6cfc1","#9a7b6c","#cfc3ad"],2:["#9ea2a5","#b1b3b0","#8d949a"],3:["#b7c1cb","#c9ced3","#a9b4bf"],4:["#8f7f6a","#9a8a73"]};
  // Gelände mit Luftbild
  if(Q.terr&&THREE.GLTFLoader){try{const g=await new THREE.GLTFLoader().loadAsync("fern/Stadtkarte.json");const t=g.scene;
      t.traverse(o=>{if(o.isMesh){const m=o.material;o.material=new THREE.MeshLambertMaterial({map:m.map,color:0xffffff});if(m.map){m.map.encoding=THREE.sRGBEncoding;m.map.anisotropy=4}o.frustumCulled=false}});
      t.position.set(50,0,-200);FERN.terr=t;FERN.scene.add(t)}catch(e){console.info("Stadtkarte fehlt",e)}}
  FERN.sky=skyDome?skyDome.clone(true):null;if(FERN.sky)FERN.scene.add(FERN.sky);
  FERN.ready=true;fernUpdate(true)}
function fernUpdate(force){if(!FERN.ready)return;const px=car.x,py=car.y;if(!force&&Math.hypot(px-FERN.last.x,py-FERN.last.y)<70)return;FERN.last.x=px;FERN.last.y=py;
  const D=FERN_DATA,Q=stadtQ(),C=D.c,R=Q.fern,cut=camera.far*.82,d=FERN.d,hr=fernH(px,py);FERN.href=hr;
  if(FERN.terr)FERN.terr.position.y=-hr-.6;
  const i0=Math.max(0,Math.floor((px-R-D.x0)/C)),i1=Math.min(D.w-1,Math.floor((px+R-D.x0)/C)),j0=Math.max(0,Math.floor((py-R-D.y0)/C)),j1=Math.min(D.h-1,Math.floor((py+R-D.y0)/C));
  const M=new THREE.Matrix4(),col=new THREE.Color();let n=0;const B=FERN.box;
  for(let j=j0;j<=j1&&n<Q.inst;j++)for(let i=i0;i<=i1&&n<Q.inst;i++){const k=j*D.w+i,h=d[2*k];if(!h)continue;const cx=D.x0+(i+.5)*C,cy=D.y0+(j+.5)*C,dist=Math.hypot(cx-px,cy-py);if(dist<cut||dist>R)continue;
    const cov=d[2*k+1]>>4,kind=d[2*k+1]&15,s=C*Math.sqrt(cov/15)*.95,hh=Math.max(4,h);const hy=fernH(cx,cy)-hr;
    M.makeScale(s,hh,s);M.setPosition(cx,hy-.5,cy);B.setMatrixAt(n,M);const L=FERN.cols[kind]||FERN.cols[1];col.set(L[(i*7+j*13)%L.length]).convertSRGBToLinear();B.setColorAt(n,col);n++}
  B.count=n;B.instanceMatrix.needsUpdate=true;B.instanceColor.needsUpdate=true}
/* eigener Zeichendurchgang: zuerst Himmel + Fernansicht mit großer Sichtweite, dann die nahe Stadt darüber */
{const R0=renderer.render.bind(renderer);renderer.render=function(sc,cam){
  if(sc!==scene||!FERN.ready||cam!==camera)return R0(sc,cam);
  const Q=stadtQ();FERN.cam.copy(cam);FERN.cam.near=Math.max(2,cam.far*.3);FERN.cam.far=Q.fern*1.15+400;FERN.cam.updateProjectionMatrix();
  FERN.hemi.color.copy(hemi.color);FERN.hemi.groundColor.copy(hemi.groundColor);FERN.hemi.intensity=hemi.intensity;FERN.sun.color.copy(sun.color);FERN.sun.intensity=sun.intensity;
  FERN.sun.position.set(cam.position.x+GFX_SUN[0],GFX_SUN[1],cam.position.z+GFX_SUN[2]);FERN.sun.target.position.set(cam.position.x,0,cam.position.z);
  if(FERN.sky&&skyDome){FERN.sky.visible=skyDome.visible;FERN.sky.position.copy(cam.position);FERN.sky.scale.setScalar(FERN.cam.far*.9/2600);FERN.sky.material=skyDome.material}
  FERN.scene.background=scene.background;const ac=renderer.autoClear,bg=scene.background,sv=skyDome?skyDome.visible:false;
  R0(FERN.scene,FERN.cam);renderer.autoClear=false;renderer.clearDepth();scene.background=null;if(skyDome)skyDome.visible=false;
  R0(scene,cam);renderer.autoClear=ac;scene.background=bg;if(skyDome)skyDome.visible=sv}}

/* ---------- 3. Wahrzeichen ---------- */
async function wzInit(){if(typeof WZ_DATA==="undefined"||!THREE.GLTFLoader)return;const E=REG.ext,L=new THREE.GLTFLoader();STADT.wz=[];
  for(const W of WZ_DATA){if(W.x<E[0]-50||W.x>E[1]+50||W.y<E[2]-50||W.y>E[3]+50)continue;
    try{const g=await L.loadAsync("wahrzeichen/"+W.id+".json"),o=g.scene;
      o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;const mt=m.material;if(ENV){mt.envMap=ENV;mt.envMapIntensity=.5}
        // Dächer: Luftbild hat Flecken und Autos → ruhige Durchschnittsfarbe des Dachs
        if(/Dach/i.test(mt.name||"")&&mt.map&&mt.map.image){try{const im=mt.map.image,c=document.createElement("canvas");c.width=c.height=8;const x=c.getContext("2d");x.drawImage(im,0,0,8,8);const a=x.getImageData(0,0,8,8).data;let r=0,gg=0,b=0;
          for(let i=0;i<a.length;i+=4){r+=a[i];gg+=a[i+1];b+=a[i+2]}const n=a.length/4;mt.map=null;mt.color.setRGB(r/n/255*.85,gg/n/255*.85,b/n/255*.85).convertSRGBToLinear();mt.roughness=.85;mt.needsUpdate=true}catch(e){}}});
      // Fassaden ohne Fotos: Stadion und Kirche ohne Wohnhaus-Fenster (ruhige Fläche in typischer Farbe)
      const FS={Borussia_Park:"#c9ccd0",Rheydt_Hauptkirche:"#8d5b49"}[W.id];if(FS)o.traverse(m=>{if(m.isMesh&&/Fassade/i.test(m.material.name||"")){m.material.map=null;m.material.color.set(FS).convertSRGBToLinear();m.material.needsUpdate=true}});
      o.position.set(W.x,BASE_Y,W.y);scene.add(o);STADT.wz.push({W,o})}catch(e){console.info("Wahrzeichen fehlt",W.id,e)}}}

/* ---------- 4. Nachbarkachel früh vorladen ---------- */
STADT.pre=new Set();
{const base=update;update=function(dt){base(dt);
  if(STADT.sh){const u=STADT.sh.uniforms,R=(GFX.shR||40);u.pl.value.set(car.x,car.y);u.r0.value=R*.55;u.r1.value=R*.9;u.k.value=.36*(1-darkness());u.fN.value=scene.fog.near;u.fF.value=scene.fog.far}
  if(FERN.ready)fernUpdate(false);
  if(typeof REG==="undefined"||state.mode!=="play")return;const E=REG.ext,x=car.x,y=car.y;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const d=dx<0?x-E[0]:dx>0?E[1]-x:dy<0?y-E[2]:E[3]-y;if(d>450)continue;const key=cellKey(x+dx*500,y+dy*500);
    if(key===REG.key||STADT.pre.has(key)||!GEB.cells[key])continue;STADT.pre.add(key);const f=key==="0_0"?"mg-echt.js":"gebiete/g_"+key+".js";
    try{fetch(f,{cache:"force-cache"}).catch(()=>{})}catch(e){}}}}

/* ---------- 5. Boden nach Luftbild: Gärten, Höfe, Brachen in echten Farben; Fahrbahn/Gehweg bleiben eigene Beläge ---------- */
async function stadtBoden(){const name=MG.region||"rheydt";try{await stadtScript("boden/index.js")}catch(e){return}if(typeof BODEN==="undefined"||!BODEN[name]||BODEN[name].q!=="r")return;   // nur feines Luftbild (Rheydt); das grobe Stadtkarten-Luftbild gibt am Boden Schlieren
  let gr=null;scene.traverse(o=>{if(!gr&&o.isMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.width===2*HX+800&&o.geometry.parameters.height===2*HY+800)gr=o});if(!gr)return;
  const tex=await new THREE.TextureLoader().loadAsync("boden/"+name+".jpg");tex.anisotropy=8;tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
  const e=BODEN[name].ext,mat=gr.material;STADT.boden={tex,ext:e};
  mat.onBeforeCompile=sh=>{sh.uniforms.bMap={value:tex};sh.uniforms.bExt={value:new THREE.Vector4(e[0],e[1],e[2],e[3])};sh.uniforms.bMix={value:.88};
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec2 vBW;").replace("#include <begin_vertex>","#include <begin_vertex>\nvBW=(modelMatrix*vec4(position,1.)).xz;");
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nvarying vec2 vBW;uniform sampler2D bMap;uniform vec4 bExt;uniform float bMix;")
      .replace("#include <map_fragment>","#include <map_fragment>\n{vec2 bu=clamp(vec2((vBW.x-bExt.x)/(bExt.y-bExt.x),(vBW.y-bExt.z)/(bExt.w-bExt.z)),0.,1.);vec3 o=pow(texture2D(bMap,bu).rgb,vec3(2.2));float l=clamp(dot(diffuseColor.rgb,vec3(.299,.587,.114))/.42,.75,1.25);diffuseColor.rgb=mix(diffuseColor.rgb,o*l*1.05,bMix);}")};
  mat.needsUpdate=true}

/* Start: nach dem Bau der Stadt Schatten, nach den Modellen Fernansicht und Wahrzeichen */
{const base=buildCity;buildCity=function(){STADT.B.length=0;const r=base.apply(this,arguments);try{stadtShadows()}catch(e){console.warn("Schatten vorab",e)}stadtBoden().catch(e=>console.warn("Boden",e));return r}}
{const base=kitInit;kitInit=async function(){await base.apply(this,arguments);try{await wzInit()}catch(e){console.warn("Wahrzeichen",e)}try{await fernInit()}catch(e){console.warn("Fernansicht",e)}}}

/* ---------- 6. Allee „Am Torfbend“ nach Fotos (23.11.) ----------
   Südseite (gegenüber der Schule): Grünstreifen am Bordstein mit großen Kastanien, dahinter ein Schotter-Parkstreifen
   mit Querparkplätzen (helle Pflaster-Trennstreifen). Nordseite: Pflasterrinne am Fahrbahnrand. Fahrbahn mit „30“. */
const ALLEE={n:"Am Torfbend",x0:770,x1:1000,verge:1.7,depth:5.2,bay:2.6,tree:9.5,items:[],trees:[],rinne:[],z30:[]};
function alleePlan(){if(ALLEE.done)return;ALLEE.done=true;const P={x:0,y:0,dx:1,dy:0},A=ALLEE;
  const free=(x,y)=>{const i=gi(x,y);return i>=0&&!hgt[i]&&!solid[i]};
  for(const e of edges){if(!e.r||e.r.n!==A.n||!e.r.c)continue;const hw=e.r.w/2;
    for(let s=8;s<e.len-8;s+=A.bay){edgePos(e,s+A.bay/2,P);const sd=P.dx>=0?1:-1,nx=-P.dy*sd,ny=P.dx*sd;   // Normale nach Süden
      const o=hw+A.verge+A.depth/2,x=P.x+nx*o,y=P.y+ny*o;if(x<A.x0||x>A.x1)continue;
      let ok=true;for(const q of [hw+.3,hw+A.verge,hw+A.verge+1.5,hw+A.verge+3,hw+A.verge+A.depth])for(const a of [-1.2,0,1.2])if(!free(P.x+nx*q+P.dx*a,P.y+ny*q+P.dy*a))ok=false;
      if(ok&&nearestRoad(x,y,hw+A.verge+A.depth,q=>q!==e&&q.r&&q.r.c&&q.r.n!==A.n))ok=false;
      if(ok)A.items.push({x,y,ang:Math.atan2(P.dy,P.dx),dx:P.dx,dy:P.dy,nx,ny,rx:P.x,ry:P.y,hw})}
    for(let s=10;s<e.len-6;s+=A.tree){edgePos(e,s,P);const sd=P.dx>=0?1:-1,nx=-P.dy*sd,ny=P.dx*sd,o=hw+A.verge/2,x=P.x+nx*o,y=P.y+ny*o;
      if(x>A.x0-10&&x<A.x1+10&&free(x,y)&&A.items.some(it=>Math.hypot(it.x-x,it.y-y)<A.depth))A.trees.push({x,y})}
    for(let s=2;s<e.len-2;s+=2){edgePos(e,s+1,P);const sd=P.dx>=0?1:-1,nx=P.dy*sd,ny=-P.dx*sd,o=hw-.25;   // Nordseite
      const x=P.x+nx*o,y=P.y+ny*o;if(x>A.x0-40&&x<A.x1+20)A.rinne.push({x,y,dx:P.dx,dy:P.dy,nx,ny})}
    for(const f of [.3,.8]){edgePos(e,e.len*f,P);const lane=e.r.w/4,sd=f<.5?1:-1;const x=P.x+(-P.dy)*lane*sd,y=P.y+P.dx*lane*sd;if(x>A.x0-60&&x<A.x1+40)A.z30.push({x,y,ang:Math.atan2(P.dy,P.dx)+(sd>0?0:Math.PI)})}}}
function alleeBuild(){alleePlan();const A=ALLEE,Y=SIDE_Y+.006,G={gras:[],kies:[],trenn:[],rinne:[]};
  const quad=(arr,cx,cy,a,b,hl,hw,y)=>{for(const [l,w] of [[-hl,-hw],[hl,-hw],[hl,hw],[-hl,-hw],[hl,hw],[-hl,hw]])arr.push(cx+a[0]*l+b[0]*w,y,cy+a[1]*l+b[1]*w)};
  for(const it of A.items){const a=[it.dx,it.dy],b=[it.nx,it.ny],vg=it.hw+A.verge/2;
    quad(G.gras,it.rx+it.nx*vg,it.ry+it.ny*vg,a,b,A.bay/2+.02,A.verge/2,Y);
    quad(G.kies,it.x,it.y,a,b,A.bay/2+.02,A.depth/2,Y+.001);
    quad(G.trenn,it.x+it.dx*A.bay/2,it.y+it.dy*A.bay/2,a,b,.13,A.depth/2,Y+.002)}
  for(const r of A.rinne)quad(G.rinne,r.x,r.y,[r.dx,r.dy],[r.nx,r.ny],1.02,.24,ROAD_Y+.004);
  const mk=(p,col,off,map,rep)=>{if(!p.length)return;const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(p,3));
    if(map){const uv=[];for(let i=0;i<p.length;i+=3)uv.push(p[i]*rep,p[i+2]*rep);g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2))}g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:col,map:map||null,polygonOffset:true,polygonOffsetFactor:off,polygonOffsetUnits:off}));m.receiveShadow=true;scene.add(m)};
  const kt=texPave.clone();kt.needsUpdate=true;kt.wrapS=kt.wrapT=THREE.RepeatWrapping;
  mk(G.gras,0x5d7a3a,-3);mk(G.kies,0xb3ab9b,-3,kt,.6);mk(G.trenn,0xc9c6c0,-5);mk(G.rinne,0x8d8a84,-3,kt,1.8);
  // „30“ auf der Fahrbahn
  const c=document.createElement("canvas");c.width=256;c.height=128;const x=c.getContext("2d");x.fillStyle="#fff";x.font="bold 120px Arial";x.textAlign="center";x.textBaseline="middle";x.fillText("30",128,70);
  const t=new THREE.CanvasTexture(c);t.anisotropy=8;const mt=new THREE.MeshLambertMaterial({map:t,transparent:true,opacity:.92,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
  for(const z of A.z30){const m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.3),mt);m.rotation.set(-Math.PI/2,0,-z.ang-Math.PI/2);m.position.set(z.x,ROAD_Y+.008,z.y);m.receiveShadow=true;scene.add(m)}}
/* Kastanien: hoher Stamm, große Krone (Bauminstanzen kennen dafür Stammhöhe th und Stammdicke tw) */
{const base=buildTreeMeshes;buildTreeMeshes=function(){try{alleePlan();for(const t of ALLEE.trees)treeList.push({x:t.x,y:t.y,r:4.6+kitHash(Math.round(t.x),2)*1.2,th:5.2+kitHash(Math.round(t.y),4)*1.6,tw:2.6})}catch(e){console.warn("Allee",e)}return base.apply(this,arguments)}}
{const base=buildTrees;buildTrees=function(){try{alleeBuild()}catch(e){console.warn("Allee",e)}return base.apply(this,arguments)}}
/* Querparken auf dem Schotterstreifen; dort keine halb-auf-dem-Gehweg-Autos und keine Laternen */
const alleeNear=(x,y,r)=>ALLEE.items.some(it=>Math.hypot(it.x-x,it.y-y)<r);
{const base=raSlots;raSlots=function(){base();const keep=RA.slots.filter(S=>!alleeNear(S.x,S.y,5.5));RA.slots.length=0;RA.grid.clear();
  for(const it of ALLEE.items){const h=kitHash(Math.round(it.x*3),Math.round(it.y*3));if(h>.78)continue;const nose=h<.6;   // meist mit der Front zur Straße
    keep.push({x:it.x-it.nx*.25,y:it.y-it.ny*.25,ang:Math.atan2(nose?-it.ny:it.ny,nose?-it.nx:it.nx)+(kitHash(Math.round(it.y),5)-.5)*.08,flat:true,y0:SIDE_Y+.01,m:Math.floor(kitHash(Math.round(it.x),7)*3),c:Math.floor(kitHash(Math.round(it.y),11)*RA_PARKCOL.length)})}
  for(const S of keep){RA.slots.push(S);const k=Math.floor(S.x/RA.cell)+"_"+Math.floor(S.y/RA.cell);(RA.grid.get(k)||RA.grid.set(k,[]).get(k)).push(S)}}}
{const base=kitCull;kitCull=function(){if(KIT.lampNear&&!ALLEE.lampsDone){ALLEE.lampsDone=true;const f=(x,z)=>ALLEE.items.some(it=>Math.abs((x-it.rx)*it.dx+(z-it.ry)*it.dy)<ALLEE.bay/2+.3&&(x-it.rx)*it.nx+(z-it.ry)*it.ny>it.hw-.2&&(x-it.rx)*it.nx+(z-it.ry)*it.ny<it.hw+ALLEE.verge+ALLEE.depth+.3);KIT.lampNear.drop(f);KIT.lampFar.drop(f)}return base()}}
/* Die drei „Platz“-Flächen entlang Am Torfbend (Kartendaten der Parkflächen, versetzt über der Fahrbahn) entfallen – der Parkstreifen ersetzt sie */
if(MG&&MG.areas&&(MG.region||"rheydt")==="rheydt"){MG.areas=MG.areas.filter(a=>{if(a.t!=="plaza")return true;const xs=a.p.filter((v,i)=>i%2===0),ys=a.p.filter((v,i)=>i%2===1);
  return !(Math.min(...xs)>780&&Math.max(...xs)<1000&&Math.min(...ys)>225&&Math.max(...ys)<275)})}
/* Zufahrten (service), die fast deckungsgleich auf der Straße Am Torfbend liegen (Kartendaten der Parkplatzzufahrt), entfallen */
if(MG&&MG.roads&&MG.nodes&&(MG.region||"rheydt")==="rheydt"){const N=MG.nodes,main=MG.roads.filter(r=>r.n==="Am Torfbend"&&r.h==="residential");
  const dSeg=(x,y)=>{let d=1e9;for(const r of main)for(let j=1;j<r.i.length;j++){const ax=N[2*r.i[j-1]],ay=N[2*r.i[j-1]+1],bx=N[2*r.i[j]],by=N[2*r.i[j]+1],dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));d=Math.min(d,Math.hypot(x-ax-dx*t,y-ay-dy*t))}return d};
  const n0=MG.roads.length;MG.roads=MG.roads.filter(r=>{if(r.h!=="service")return true;const pts=r.i.map(k=>[N[2*k],N[2*k+1]]);if(!pts.every(([x,y])=>x>760&&x<1010&&y>215&&y<285))return true;return !pts.every(([x,y])=>dSeg(x,y)<3.5)});
  ALLEE.zufahrtWeg=n0-MG.roads.length}
/* Gehwegstreifen der Schule aus der alten Spielkarte (lokal z −63…−56, 147 m lang) liegt auf der echten Karte schräg über der Fahrbahn → ausblenden */
function schulGehwegWeg(){try{let n=0;scene.traverse(o=>{if(!o.isMesh||!o.geometry||!o.parent||o.parent.type!=="Group")return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
  if(Math.abs(b.max.y-b.min.y)<.01&&b.min.y>.25&&b.min.y<.3&&b.min.z>-64&&b.max.z<-55&&b.max.x-b.min.x>100){o.visible=false;n++}});ALLEE.schulGehweg=n}catch(e){console.warn("Schulgehweg",e)}}
{const base=kitInit;kitInit=async function(){schulGehwegWeg();await base.apply(this,arguments);schulGehwegWeg()}}
