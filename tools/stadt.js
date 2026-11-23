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
  R0(FERN.scene,FERN.cam);renderer.autoClear=false;renderer.clear(false,true,true);scene.background=null;if(skyDome)skyDome.visible=false;
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

/* ---------- 7. Weg vom Pausenhof zur Sporthalle (Fotos und Angaben vom 23.11.) ----------
   Gasse zwischen Erweiterungsbau und weißer Hofmauer nach Norden. Am Südende des Durchgangs zwischen Halle und Hofmauer
   ein zweiflügeliges weißes Metalltor (offen) zwischen Backsteinpfeilern: links der beige Umkleidetrakt, rechts die Hofmauer.
   Dahinter an der Westseite des Durchgangs der Eingang der Sporthalle (Nische mit gelbem Klinker, Doppeltür in der Ostwand).
   Pflasterweg im Durchgang, Metallzaun am Nordende, gebogene Laterne, Rasenbeet mit Baum links vor dem Tor.
   Maße in Schulkoordinaten (x Osten, z Süden). Messlinien der Hof-Mission bleiben frei. */
const HW={zT:-125,xGW:-266,xGE:-262.45,xH:-268,zN:-148};
function hwBuild(){if(typeof hallR!=="function"||!MG.FX||HW.done)return;HW.done=true;const o=hallR(-268,-135),e1=hallR(-267,-135),A=Math.atan2(e1[1]-o[1],e1[0]-o[0]),G=new THREE.Group();G.name="hallenweg";
  const tex=(f,w=256,h=256)=>{const c=document.createElement("canvas");c.width=w;c.height=h;f(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t};
  const pav=tex((g,w,h)=>{g.fillStyle="#5d5c59";g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=-16;x<w;x+=32){const q=(y/16)%2*16;g.fillStyle=`hsl(30,3%,${38+((x*3+y*5)%13)}%)`;g.fillRect(x+q+1,y+1,30,14)}});
  const klinker=tex((g,w,h)=>{g.fillStyle="#cdbb86";g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let k=0;k<6;k++){const x=k*52-(r%2)*26,y=r*32;g.fillStyle=`hsl(46,${38+((r+k)%3)*4}%,${66+((r*7+k*3)%6)}%)`;g.fillRect(x+3,y+3,47,27)}});
  const L=c=>new THREE.Color(c).convertSRGBToLinear();
  const M={cap:new THREE.MeshLambertMaterial({color:L(0xbab7b0)}),pillar:new THREE.MeshLambertMaterial({color:L(0x8a4b36)}),metal:new THREE.MeshLambertMaterial({color:L(0xe9ecef)}),
    pav:new THREE.MeshLambertMaterial({map:pav,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),grass:new THREE.MeshLambertMaterial({color:L(0x5f7d3b),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
    fence:new THREE.MeshLambertMaterial({color:L(0xb7bcc0)}),lamp:new THREE.MeshLambertMaterial({color:L(0xc9ccd0)}),klinker:new THREE.MeshLambertMaterial({map:klinker}),
    tuer:new THREE.MeshLambertMaterial({color:L(0x6b6f75)}),beton:new THREE.MeshLambertMaterial({color:L(0xb9b6ae)})};
  const put=(geo,mat,x,y,z,ry=0)=>{const m=new THREE.Mesh(geo,mat),p=hallR(x,z);m.position.set(p[0],y,p[1]);m.rotation.y=-A+ry;m.castShadow=true;m.receiveShadow=true;G.add(m);return m};
  const box=(mat,x0,x1,z0,z1,y0,y1)=>{const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);if(mat.map){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(x1-x0,z1-z0)/1.4,uv.getY(i)*(y1-y0)/1.1)}return put(g,mat,(x0+x1)/2,BASE_Y+(y0+y1)/2,(z0+z1)/2)};
  const flat=(mat,x0,x1,z0,z1,y,rep)=>{const g=new THREE.PlaneGeometry(x1-x0,z1-z0);g.rotateX(-Math.PI/2);if(rep){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(x1-x0)/rep,uv.getY(i)*(z1-z0)/rep)}const m=put(g,mat,(x0+x1)/2,BASE_Y+y,(z0+z1)/2);m.castShadow=false;return m};
  const {zT,xGW,xGE,xH,zN}=HW,Hm=2.1,dz=HALL.doorIn[1];
  // Tor: Pfeiler an der Trakt-Ecke und an der Hofmauer, zwei geöffnete Flügel (nach Norden)
  for(const x of [xGW+.22,xGE+.1]){box(M.pillar,x-.22,x+.22,zT-.25,zT+.25,0,Hm+.25);box(M.cap,x-.27,x+.27,zT-.3,zT+.3,Hm+.25,Hm+.33)}
  const wing=(hx,s)=>{const Lw=(xGE-xGW-.44)/2,gg=new THREE.Group(),p=hallR(hx,zT);gg.position.set(p[0],BASE_Y,p[1]);gg.rotation.y=-A-s*1.2;G.add(gg);
    const bar=(x,y,w,h,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M.metal);m.position.set(x,y,0);m.castShadow=true;gg.add(m)};
    bar(0,1.0,.05,1.9,.05);bar(s*Lw,1.0,.05,1.9,.05);bar(s*Lw/2,1.9,Lw,.05,.05);bar(s*Lw/2,.12,Lw,.05,.05);for(let k=1;k<9;k++)bar(s*Lw*k/9,1.0,.025,1.75,.025)};
  wing(xGW+.48,1);wing(xGE-.15,-1);
  // Pflaster im Durchgang (vom Tor bis zum Zaun) und unter dem Tor
  flat(M.pav,xH,xGE,zN+.2,zT+1.2,.014,1.6);
  // Eingang in der Ostwand der Halle: Nische mit gelbem Klinker, Doppeltür, Vordach
  const xf=xH;box(M.klinker,xf,xf+.55,dz-1.45,dz-1.15,0,3.0);box(M.klinker,xf,xf+.55,dz+1.15,dz+1.45,0,3.0);box(M.beton,xf,xf+.75,dz-1.6,dz+1.6,3.0,3.14);
  box(M.klinker,xf,xf+.04,dz-1.15,dz+1.15,2.55,3.0);box(M.tuer,xf+.02,xf+.07,dz-1.05,dz+1.05,0,2.5);box(M.metal,xf+.06,xf+.09,dz-.03,dz+.03,0,2.5);box(M.beton,xf,xf+.9,dz-1.15,dz+1.15,0,.05);
  // Regenrohr neben der Nische
  {const g=new THREE.CylinderGeometry(.05,.05,6.6,8);put(g,M.metal,xf+.12,BASE_Y+3.3,dz-1.75)}
  // Metallzaun am Nordende des Durchgangs
  {const z=zN+.2;box(M.fence,xH,xGE,z-.03,z+.03,.05,.1);box(M.fence,xH,xGE,z-.03,z+.03,1.45,1.5);for(let x=xH;x<xGE;x+=.2)box(M.fence,x,x+.03,z-.015,z+.015,.05,1.5)}
  // gebogene Laterne im Durchgang (Arm zur Halle)
  {const lx=xGE-.55,lz=-140,c=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,5.6,0),new THREE.Vector3(.35,6.6,0),new THREE.Vector3(1.4,7.0,0)]);
    put(new THREE.TubeGeometry(c,24,.07,8,false),M.lamp,lx,BASE_Y,lz,Math.PI);const h=new THREE.BoxGeometry(.6,.12,.25);h.translate(1.55,6.95,0);put(h,M.lamp,lx,BASE_Y,lz,Math.PI)}
  // Rasenbeet mit Baum links vor dem Tor (vor der Südseite des Trakts)
  flat(M.grass,-272,xGW-.4,zT+.35,zT+4.0,.02);box(M.cap,-272.1,xGW-.3,zT+4.0,zT+4.15,0,.12);
  scene.add(G);HW.G=G;
  // Kollision: Torpfeiler und Zaun am Nordende
  const mark=(x0,x1,z0,z1)=>{for(let x=x0;x<=x1;x+=.35)for(let z=z0;z<=z1;z+=.35){const p=hallR(x,z),i=gi(p[0],p[1]);if(i>=0)solid[i]=Math.max(solid[i],1)}};
  mark(xH,xGE,zN+.05,zN+.35)}
{const base=buildTreeMeshes;buildTreeMeshes=function(){try{hwBuild();if(HW.G){const p=hallR(-269,zT0()+2.2);treeList.push({x:p[0],y:p[1],r:3.4,th:2.6,tw:1.4})}}catch(e){console.warn("Hallenweg",e)}return base.apply(this,arguments)}}
const zT0=()=>HW.zT;

/* ---------- 8. Kellerabgang am Erweiterungsbau (Foto 23.11.): Treppe entlang der Ostfassade nach unten ----------
   Zwischen Fassade (x −268) und Brüstung mit Geländer (x −267). Eingang am Südende, 14 Stufen bis 2,6 m tief, unten Kellertür
   und vergitterte Kellerfenster. Der Boden ist an dieser Stelle ausgeschnitten. Sichtbar, aber nicht begehbar
   (das Spiel kennt nur ebenen Boden; der Schacht ist gesperrt). */
const KA={x0:-268,x1:-267.13,zTop:-90.45,zEnd:-105.4,depth:2.6,steps:14};
function kaBuild(){if(typeof hallR!=="function"||!MG.FX||KA.done)return;KA.done=true;const o=hallR(-268,-98),e1=hallR(-267,-98),A=Math.atan2(e1[1]-o[1],e1[0]-o[0]),G=new THREE.Group();G.name="kellerabgang";
  const mat=c=>new THREE.MeshLambertMaterial({color:new THREE.Color(c).convertSRGBToLinear()}),M={beton:mat(0x76726b),stufe:mat(0x8f8b83),sohle:mat(0x4d4a45),ziegel:mat(0x7a3a2c),tuer:mat(0x4b4f56),glas:mat(0x1d2a33),gitter:mat(0xa7acb0)};
  const put=(geo,m,x,y,z)=>{const me=new THREE.Mesh(geo,m),p=hallR(x,z);me.position.set(p[0],y,p[1]);me.rotation.y=-A;me.castShadow=true;me.receiveShadow=true;G.add(me);return me};
  const box=(m,x0,x1,y0,y1,z0,z1)=>put(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),m,(x0+x1)/2,BASE_Y+(y0+y1)/2,(z0+z1)/2);
  const {x0,x1,zTop,zEnd,depth,steps}=KA,run=.28,rise=depth/steps,zBot=zTop-run*steps;
  for(let i=0;i<steps;i++){const za=zTop-i*run,m=M.stufe.clone();m.color.multiplyScalar(1-.55*i/steps);box(m,x0,x1,-(i+1)*rise-.05,-i*rise,za-run,za)}   // Stufen (nach Norden abwärts, unten dunkler)
  box(M.sohle,x0,x1,-depth-.15,-depth,zEnd,zBot);                                                      // Schachtsohle
  box(M.beton,x1,x1+.12,-depth-.15,0,zEnd,zTop);                                                      // Schachtwand unter der Brüstung
  box(M.ziegel,x0-.25,x0,-depth-.15,0,zEnd,zTop);                                                     // Kellerwand unter der Fassade
  box(M.beton,x0,x1+.12,-depth-.15,0,zEnd-.12,zEnd);                                                  // Stirnwand Nord
  box(M.tuer,x0-.02,x0+.04,-depth,-depth+2.1,zEnd+.4,zEnd+1.45);                                        // Kellertür
  for(const zc of [-96.8,-100.6]){box(M.glas,x0-.01,x0+.02,-1.15,-.25,zc-.55,zc+.55);for(let k=-4;k<=4;k++)box(M.gitter,x0+.03,x0+.05,-1.15,-.25,zc+k*.12-.01,zc+k*.12+.01)}
  G.traverse(m=>{if(m.isMesh)m.renderOrder=-3});
  // Abdeckung: unsichtbar, schreibt nur Tiefe über der Öffnung → Hofbelag (renderOrder −1) und Boden werden dort nicht darübergezeichnet
  {const q=[[x0-.02,zEnd],[x1,zEnd],[x1,zTop],[x0-.02,zTop]].map(([x,z])=>hallR(x,z)),sh=new THREE.Shape(q.map(([x,z])=>new THREE.Vector2(x,-z))),g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);
    const mk=new THREE.Mesh(g,new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,depthTest:false,side:THREE.DoubleSide,stencilWrite:true,stencilRef:1,stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp}));
    mk.position.y=BASE_Y+.25;mk.renderOrder=-50;mk.frustumCulled=false;G.add(mk);KA.mask=mk}
  scene.add(G);KA.G=G;
  // Boden aufschneiden: Bodenfläche als Form mit Loch neu aufbauen; den grünen Außenboden darunter tiefer legen
  let gr=null,far=null;scene.traverse(m=>{const P=m.isMesh&&m.geometry&&m.geometry.parameters;if(!P)return;if(P.width===2*HX+800&&P.height===2*HY+800)gr=m;else if(P.width===9000&&P.height===9000)far=m});
  if(far)far.position.y=-depth-1;
  if(gr){const W=gr.geometry.parameters.width,H=gr.geometry.parameters.height,px=gr.position.x,pz=gr.position.z,L=(wx,wz)=>new THREE.Vector2(wx-px,-(wz-pz));
    const sh=new THREE.Shape([new THREE.Vector2(-W/2,-H/2),new THREE.Vector2(W/2,-H/2),new THREE.Vector2(W/2,H/2),new THREE.Vector2(-W/2,H/2)]);
    const hp=[[x0,zEnd],[x1,zEnd],[x1,zTop],[x0,zTop]].map(([x,z])=>L(...hallR(x,z)));sh.holes.push(new THREE.Path(hp.reverse()));
    const g=new THREE.ShapeGeometry(sh);const pos=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+W/2)/W,(pos.getY(i)+H/2)/H);
    g.computeVertexNormals();gr.geometry.dispose();gr.geometry=g;KA.loch=true}
  // Hofbelag und Boden in der markierten Öffnung aussparen (Schablonenpuffer)
  const st=m=>{if(!m||!m.material||m.material.__ka)return;const M=m.material;M.__ka=1;M.stencilWrite=true;M.stencilRef=1;M.stencilFunc=THREE.NotEqualStencilFunc;M.stencilZPass=THREE.KeepStencilOp;M.stencilFail=THREE.KeepStencilOp;M.stencilZFail=THREE.KeepStencilOp;M.needsUpdate=true};
  KA.st=st;st(gr);G.children.forEach(m=>{if(m!==KA.mask){m.renderOrder=-3;m.frustumCulled=false}});
  // gesperrt: nicht in den Schacht laufen
  for(let x=x0;x<=x1+.15;x+=.3)for(let z=zEnd;z<=zTop;z+=.3){const p=hallR(x,z),i=gi(p[0],p[1]);if(i>=0)solid[i]=Math.max(solid[i],1)}}
{const base=buildTreeMeshes;buildTreeMeshes=function(){try{kaBuild()}catch(e){console.warn("Kellerabgang",e)}return base.apply(this,arguments)}}

/* Beläge über der Kelleröffnung aussparen – erst wenn Schule und Hof gebaut sind: alle flachen Flächen, die ein Strahl durch die Öffnung trifft */
function kaBelag(){if(!KA.G||!KA.st)return;const rc=new THREE.Raycaster();rc.camera=camera;let n=0;
  for(const f of [.2,.5,.8])for(const xx of [KA.x0+.2,(KA.x0+KA.x1)/2,KA.x1-.2]){const z=KA.zTop+(KA.zEnd-KA.zTop)*f,c=hallR(xx,z);rc.set(new THREE.Vector3(c[0],3,c[1]),new THREE.Vector3(0,-1,0));
    for(const h of rc.intersectObjects(scene.children,true)){const m=h.object;if(!m.isMesh||m.isSprite||h.point.y>.4||h.point.y<-.2)continue;let q=m,own=false;while(q){if(q===KA.G)own=true;q=q.parent}if(own||m===STADT.shMesh)continue;if(!m.material.__ka){KA.st(m);n++}}}
  KA.belaege=n}
{const base=kitInit;kitInit=async function(){await base.apply(this,arguments);try{kaBelag()}catch(e){console.warn("Kellerabgang Belag",e)}}}
/* Fußwege der Kartendaten, die an der Schule durch Gebäude führen (Passanten liefen durch Wände, auf dem Hof endete ein
   markierter Weg an der Wand), entfallen: ≥ 30 % der Länge in Schulgebäuden oder anderen Gebäuden im Umkreis von 250 m */
/* wird vor dem Aufbau des Wegenetzes aufgerufen (stadt_patch.py); nur Funktionsdeklarationen und MG verwenden */
function stadtRoadsFilter(){if((MG.region||"rheydt")!=="rheydt"||!MG.roads||!MG.nodes||!MG.buildings||!MG.FX)return;try{
  const N=MG.nodes,C=MG.FX(-295,-100),R=250,rects=[[-332,-318,-84,-66],[-318,-293,-82,-70],[-293,-279,-90,-67],[-279,-268,-90,-80],[-296,-268,-106,-90],[-290,-268,-148,-132],[-292,-266,-132,-125],[-258,-245,-82,-66]];
  const B=MG.buildings.filter(b=>{const p=b.p;return Math.hypot(p[0]-C[0],p[1]-C[1])<R+60});
  const inB=(x,y)=>{const [lx,lz]=hallL(x,y);if(rects.some(r=>lx>r[0]&&lx<r[1]&&lz>r[2]&&lz<r[3]))return true;for(const b of B){const p=b.p;if(Math.abs(p[0]-x)>80||Math.abs(p[1]-y)>80)continue;if(inPoly(x,y,p))return true}return false};
  const inS=(x,y)=>{const [lx,lz]=hallL(x,y);return rects.some(r=>lx>r[0]&&lx<r[1]&&lz>r[2]&&lz<r[3])};
  const weg=[];MG.roads=MG.roads.filter(r=>{const fuss=/^(footway|path|steps|cycleway|pedestrian)$/.test(r.h||""),zuf=r.h==="service";if(!fuss&&!zuf)return true;let n=0,k=0,near=false;
    for(let j=1;j<r.i.length;j++){const ax=N[2*r.i[j-1]],ay=N[2*r.i[j-1]+1],bx=N[2*r.i[j]],by=N[2*r.i[j]+1],L=Math.hypot(bx-ax,by-ay);
      for(let s=0;s<=L;s+=1){const x=ax+(bx-ax)*s/(L||1),y=ay+(by-ay)*s/(L||1);if(Math.hypot(x-C[0],y-C[1])<R)near=true;n++;if(fuss?inB(x,y):inS(x,y))k++}}
    if(near&&n>4&&k/n>=(fuss?.3:.1)){weg.push((r.h||"")+":"+(r.osm||"?"));return false}return true});
  window.__wegeEntfernt=weg}catch(e){console.warn("Schulwege",e)}}
