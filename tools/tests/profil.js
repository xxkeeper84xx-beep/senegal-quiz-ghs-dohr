// Woher kommen Dreiecke und Zeichenaufrufe? Gruppen einzeln ausblenden und Differenz messen (beide Zeichendurchgänge, inkl. Schatten)
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1080,height:810},isMobile:true,hasTouch:true})).newPage();
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8766)+'/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('Test',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&typeof KIT!=='undefined'&&KIT.ready&&GLB.ready&&(typeof RA==='undefined'||RA.ready)&&(typeof FERN==='undefined'||FERN.ready),null,{timeout:900000});
const K=JSON.parse(fs.readFileSync(__dirname+'/sv_kameras.json'))[process.argv[2]||'torfbend'];
const r=await p.evaluate(C=>{state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);camera.position.set(...C.strasse[0]);camera.lookAt(...C.strasse[1])};
  car.x=C.spieler[0];car.y=C.spieler[1];car.a=C.spieler[2];KIT.last.x=1e9;KIT.last.t=0;if(typeof RA!=='undefined'){RA.last.x=1e9;RA.last.t=0}for(let i=0;i<30;i++)update(1/30);
  renderer.info.autoReset=false;const meas=()=>{renderer.info.reset();render3D(0,performance.now());return [renderer.info.render.calls,renderer.info.render.triangles]};
  const all=meas();const out={gesamt:{aufrufe:all[0],dreiecke:all[1]}};
  const groups={};const add=(k,o)=>{(groups[k]=groups[k]||[]).push(o)};
  const KMset=new Set();if(typeof KM!=='undefined')for(const k in KM)if(KM[k])for(const im of KM[k].ms){KMset.add(im);add('bausatz_'+k,im)}
  if(KIT.lampMats)scene.traverse(o=>{if(o.isInstancedMesh&&!KMset.has(o)&&o.material&&KIT.lampMats.includes(o.material))add('laternen',o)});
  if(typeof RA!=='undefined'&&RA.inst){for(const K of RA.inst)for(const im of K.ms)add('autos_parkend',im);for(const n of RA.traf)add('autos_verkehr_neu',n.ra)}
  for(const n of npcs)if(n.mesh)add('verkehr_alt+fahrrad',n.mesh);
  for(const q of peds)if(q.glb&&q.glb.obj)add('passanten',q.glb.obj);else if(q.mesh)add('passanten_alt',q.mesh);
  for(const k in vehMeshes)add('spielerfahrzeuge',vehMeshes[k]);add('noah',walker);
  if(typeof STADT!=='undefined'){if(STADT.shMesh)add('schatten_vorab',STADT.shMesh);for(const w of STADT.wz||[])add('wahrzeichen',w.o)}
  const known=new Set();for(const k in groups)for(const o of groups[k])o.traverse(x=>known.add(x));
  scene.children.forEach(o=>{if(known.has(o))return;let tri=0,isI=false;o.traverse(x=>{if(x.isInstancedMesh)isI=true});add(isI?'sonst_instanziert':(o.type==='Mesh'?'stadt_gebaeude_strassen':'sonst_'+o.type),o)});
  for(const k in groups){const L=groups[k],vis=L.map(o=>o.visible);L.forEach(o=>o.visible=false);const m=meas();L.forEach((o,i)=>o.visible=vis[i]);out[k]={aufrufe:all[0]-m[0],dreiecke:all[1]-m[1],objekte:L.length}}
  const se=renderer.shadowMap.enabled;renderer.shadowMap.enabled=false;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)});const m=meas();out.schattenpass={aufrufe:all[0]-m[0],dreiecke:all[1]-m[1]};renderer.shadowMap.enabled=se;
  if(typeof FERN!=='undefined'){FERN.ready=false;const m2=meas();FERN.ready=true;out.fernansicht={aufrufe:all[0]-m2[0],dreiecke:all[1]-m2[1]}}
  out.__inst=[];scene.traverse(o=>{if(!o.isInstancedMesh||KMset.has(o))return;const g=o.geometry,t=(g.index?g.index.count:g.attributes.position.count)/3;out.__inst.push([Math.round(t*o.count),Math.round(t),o.count,o.frustumCulled?1:0,o.castShadow?1:0,(o.material&&o.material.name)||'',g.type,o.visible?1:0])});out.__inst.sort((a,b)=>b[0]-a[0]);
  return out},K);
console.log(JSON.stringify(r.__inst.slice(0,26)));delete r.__inst;
const rows=Object.entries(r).sort((a,b)=>b[1].dreiecke-a[1].dreiecke);for(const [k,v] of rows)console.log(k.padEnd(26),String(v.aufrufe).padStart(6),String(v.dreiecke).padStart(10),v.objekte||'');await b.close()})();
