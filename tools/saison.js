/* ================= Jahreszeiten (24.11.) =================
   Automatisch nach dem echten Datum (März–Mai Frühling, Juni–Aug. Sommer, Sept.–Nov. Herbst, Dez.–Feb. Winter), im Menü umstellbar.
   Frühling: frisches Hellgrün, Blüten in einem Teil der Kronen. Sommer: sattes Grün, trockenerer Rasen, warmes Licht.
   Herbst: Kronen gelb bis rotbraun, fallendes Laub in Noahs Nähe. Winter: kahle Bäume, Schnee auf Rasen und Dächern,
   Schneefall, kühleres, flacheres Licht. Alles nur über Farben, Shader-Mischung und wenige Partikel (iPad-tauglich). */
const SAI={list:["fruehling","sommer","herbst","winter"],name:{fruehling:"Frühling",sommer:"Sommer",herbst:"Herbst",winter:"Winter"},icon:{fruehling:"🌸",sommer:"☀️",herbst:"🍂",winter:"❄️"},
  snow:{value:0},cur:null,mats:new Set(),grass:[],leaf:null};
const saiAuto=()=>{const m=new Date().getMonth();return m>=2&&m<=4?"fruehling":m>=5&&m<=7?"sommer":m>=8&&m<=10?"herbst":"winter"};
const saiNow=()=>(save.saison&&save.saison!=="auto"&&SAI.list.includes(save.saison))?save.saison:saiAuto();
/* Schnee in Materialien einmischen (Dächer, Rasen): nur nach oben zeigende Flächen */
function saiSnowMat(m){if(!m||SAI.mats.has(m))return;SAI.mats.add(m);const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uSnow=SAI.snow;
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying float vUpS;").replace("#include <beginnormal_vertex>","#include <beginnormal_vertex>\nvUpS=normalize(mat3(modelMatrix)*objectNormal).y;");
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform float uSnow;varying float vUpS;").replace("#include <color_fragment>","#include <color_fragment>\n{float s=uSnow*smoothstep(.35,.75,vUpS);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.92,.94,.97),s);}")};
  m.customProgramCacheKey=()=>"snow"+(m.uuid||"");m.needsUpdate=true}
function saiCollect(){if(SAI.done)return;SAI.done=true;saiSnowMat(typeof roofMat!=="undefined"?roofMat:null);
  scene.traverse(o=>{if(!o.isMesh||!o.material)return;const ms=Array.isArray(o.material)?o.material:[o.material];
    for(const m of ms){if(m.map&&typeof texGrass!=="undefined"&&(m.map===texGrass||m.map.source===texGrass.source)){SAI.grass.push({m,c:m.color.clone()});saiSnowMat(m)}
      if(o.isInstancedMesh&&m.map&&m.alphaTest>0&&m.vertexColors&&!SAI.leaf){SAI.leaf={m,c:m.color.clone(),at:m.alphaTest}}
      if(/dach|roof/i.test(m.name||""))saiSnowMat(m)}});
  if(KIT&&KIT.treeMs)SAI.crowns=KIT.treeMs.filter(o=>o.material&&o.material.map&&o.material.alphaTest>0)}
/* Laubfarbe im Shader: Helligkeit der Blatt-Textur behalten, Farbton zur Jahreszeit mischen; Variation je Baum aus der Instanzfarbe */
SAI.leafCol={value:new THREE.Color(1,.55,.12)};SAI.leafMix={value:0};SAI.blossom={value:0};
function saiLeafMat(m){if(!m||m.userData.saiLeaf)return;m.userData.saiLeaf=1;const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);Object.assign(sh.uniforms,{uLeafCol:SAI.leafCol,uLeafMix:SAI.leafMix,uBlossom:SAI.blossom});
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying float vLeafV;").replace("#include <begin_vertex>","#include <begin_vertex>\n#ifdef USE_INSTANCING\nvLeafV=fract(sin(dot(instanceMatrix[3].xz,vec2(12.9898,78.233)))*43758.5453);\n#else\nvLeafV=.5;\n#endif");
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform vec3 uLeafCol;uniform float uLeafMix;uniform float uBlossom;varying float vLeafV;")
      .replace("#include <color_fragment>","#include <color_fragment>\n{float l=dot(diffuseColor.rgb,vec3(.3,.59,.11));vec3 t=uLeafCol*mix(vec3(1.),vec3(1.15,.75,.6),step(.55,vLeafV))*mix(1.,.8,step(.82,vLeafV));diffuseColor.rgb=mix(diffuseColor.rgb,t*(.55+l*1.6),uLeafMix);\nif(uBlossom>.5&&vLeafV<.2)diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.,.82,.9)*(.6+l),.7);}")};
  m.customProgramCacheKey=()=>"leaf-sai";m.needsUpdate=true}
/* fallendes Laub / Schnee: eine Punktwolke um die Kamera */
function saiParticles(kind){if(!SAI.pts){const N=isTouch?500:1100,g=new THREE.BufferGeometry(),p=new Float32Array(N*3);for(let i=0;i<N;i++){p[3*i]=(Math.random()-.5)*60;p[3*i+1]=Math.random()*22;p[3*i+2]=(Math.random()-.5)*60}
    g.setAttribute("position",new THREE.BufferAttribute(p,3));const c=document.createElement("canvas");c.width=c.height=32;const x=c.getContext("2d"),gr=x.createRadialGradient(16,16,1,16,16,15);gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=gr;x.fillRect(0,0,32,32);
    SAI.pts=new THREE.Points(g,new THREE.PointsMaterial({size:.22,map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,color:0xffffff}));SAI.pts.frustumCulled=false;SAI.pts.renderOrder=5;scene.add(SAI.pts);SAI.N=N}
  SAI.pts.visible=kind!=="none";if(kind==="snow"){SAI.pts.material.size=.2;SAI.pts.material.color.setRGB(1,1,1);SAI.pts.material.opacity=.95}
  else if(kind==="leaves"){SAI.pts.material.size=.32;SAI.pts.material.color.setRGB(.95,.55,.18);SAI.pts.material.opacity=.9}SAI.pk=kind}
{const base=update;update=function(dt){base(dt);if(!SAI.pts||!SAI.pts.visible)return;const a=SAI.pts.geometry.attributes.position.array,cx=camera.position.x,cz=camera.position.z,gy=groundY(car.x,car.y),snow=SAI.pk==="snow",fall=snow?1.1:1.6,t=performance.now()/1000;
  if(!SAI.init){SAI.init=1;for(let i=0;i<SAI.N;i++){a[3*i]+=cx;a[3*i+2]+=cz;a[3*i+1]+=gy}}
  for(let i=0;i<SAI.N;i++){let x=a[3*i]+Math.sin(t*.9+i)*dt*(snow?.25:.7),y=a[3*i+1]-fall*dt*(.6+(i%7)/10),z=a[3*i+2];
    if(x-cx>30)x-=60;else if(x-cx<-30)x+=60;if(z-cz>30)z-=60;else if(z-cz<-30)z+=60;if(y<gy-.5||y>gy+30)y=gy+18+Math.random()*6;a[3*i]=x;a[3*i+1]=y;a[3*i+2]=z}
  SAI.pts.geometry.attributes.position.needsUpdate=true}}
/* Jahreszeit anwenden */
function saiApply(s){saiCollect();SAI.cur=s;const L=SAI.leaf,G=SAI.grass;
  const leafTint={fruehling:[1.05,1.3,.75],sommer:[.8,1,.75],herbst:[1.5,.9,.38],winter:[1,1,1]}[s],grassTint={fruehling:[.92,1.15,.85],sommer:[1.12,1.05,.7],herbst:[1.08,.9,.62],winter:[1,1,1]}[s];
  const CM=new Set((SAI.crowns||[]).map(o=>o.material));if(L)CM.add(L.m);for(const m of CM)saiLeafMat(m);
  const LC={fruehling:[[.55,.85,.25],.45],sommer:[[.22,.48,.12],.35],herbst:[[1,.55,.12],.8],winter:[[.5,.4,.3],0]}[s];SAI.leafCol.value.setRGB(...LC[0]);SAI.leafMix.value=LC[1];SAI.blossom.value=s==="fruehling"?1:0;
  if(SAI.crowns)for(const o of SAI.crowns)o.visible=s!=="winter";
  for(const g of G)g.m.color.copy(g.c).multiply(new THREE.Color(...grassTint));
  SAI.snow.value=s==="winter"?.85:0;saiParticles(s==="winter"?"snow":s==="herbst"?"leaves":"none");
  const b=$("btnSaison");if(b)b.textContent=`${SAI.icon[s]} Jahreszeit: ${SAI.name[s]}${(save.saison||"auto")==="auto"?" (automatisch)":""}`}
/* Licht: Winter flacher und kühler, Sommer heller und wärmer */
{const base=gfxLight;gfxLight=function(dk,du){base(dk,du);const s=SAI.cur;if(!s)return;
  if(s==="winter"){sun.intensity*=.82;sun.color.multiply(new THREE.Color(.92,.96,1.06));hemi.intensity*=1.08}
  else if(s==="sommer"){sun.intensity*=1.08;sun.color.multiply(new THREE.Color(1.03,1,.94))}
  else if(s==="herbst"){sun.color.multiply(new THREE.Color(1.04,.97,.9))}}}
{const base=kitInit;kitInit=async function(){await base.apply(this,arguments);try{saiApply(saiNow())}catch(e){console.warn("Jahreszeit",e)}}}
{const tb=$("topbtns");if(tb){const b=document.createElement("button");b.type="button";b.id="btnSaison";b.textContent="🍂 Jahreszeit";
  b.onclick=()=>{const order=["auto",...SAI.list],i=order.indexOf(save.saison||"auto");save.saison=order[(i+1)%order.length];persist();saiApply(saiNow());toast(`${SAI.icon[saiNow()]} ${SAI.name[saiNow()]}`,save.saison==="auto"?"Die Jahreszeit folgt dem Kalender.":"Fest eingestellt – nochmal tippen zum Wechseln.","#7fd3ff")};
  tb.appendChild(b)}}
