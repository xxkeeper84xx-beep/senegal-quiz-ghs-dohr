// Bodenkontakt (Bordstein, Treppe, Fahren) und Dauertest (simulierte Spielminuten) in Rheydt
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
const MIN=+(process.argv[2]||3);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});const p=await (await b.newContext({viewport:{width:1080,height:810},isMobile:true,hasTouch:true})).newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:'+(process.env.PORT||8766)+'/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('Test',Object.assign({},LOOK_DEF,{model:'08_Passant'}));hideTitle();window.requestAnimationFrame=()=>0;save.phases=[2,3,4,5];save.xp=800});
await p.waitForFunction(()=>state.mode==='play'&&typeof KIT!=='undefined'&&KIT.ready&&GLB.ready,null,{timeout:900000});
const k=await p.evaluate(()=>{const V3=new THREE.Vector3();const feet=()=>{render3D(1/30,performance.now());walker.updateMatrixWorld(true);let mn=1e9,nb=0;walker.traverse(o=>{if(o.isBone&&/toe|foot|fuss|zeh/i.test(o.name)){o.getWorldPosition(V3);mn=Math.min(mn,V3.y);nb++}});return nb?mn:walker.position.y};
  const res={};setVehicle('walk');
  // 1) Bordstein: quer über eine Wohnstraße gehen (Fahrbahn → Gehweg)
  const e=edges.find(e=>e.r&&e.r.c&&e.r.w>=6.5&&e.len>60&&Math.hypot(e.pts[0]-car.x,e.pts[1]-car.y)<400);const P={x:0,y:0,dx:1,dy:0};edgePos(e,e.len/2,P);
  const nx=-P.dy,ny=P.dx,rows=[];for(let o=0;o<=e.r.w/2+2.4;o+=.3){car.x=P.x+nx*o;car.y=P.y+ny*o;car.a=Math.atan2(ny,nx);for(let i=0;i<4;i++)update(1/30);const g=groundY(car.x,car.y);rows.push([+o.toFixed(1),+g.toFixed(2),+(feet()-g).toFixed(3)])}
  res.bordstein={max_abw_m:Math.max(...rows.map(r=>Math.abs(r[2]))),verlauf:rows.filter((r,i)=>i%3===0)};
  // 2) Treppe (OSM steps) in der Nähe
  const st=edges.filter(e=>e.r&&e.r.h==="steps").sort((a,b)=>Math.hypot(a.pts[0]-car.x,a.pts[1]-car.y)-Math.hypot(b.pts[0]-car.x,b.pts[1]-car.y))[0];
  if(st){const r2=[];for(let s=0;s<=st.len;s+=st.len/6){edgePos(st,s,P);car.x=P.x;car.y=P.y;for(let i=0;i<4;i++)update(1/30);const g=groundY(car.x,car.y);r2.push(+(feet()-g).toFixed(3))}res.treppe={max_abw_m:Math.max(...r2.map(Math.abs)),werte:r2}}
  // 3) Fahren: Räder auf der Fahrbahn
  save.owned.push('rstadt');save.vown=save.vown||[];setVehicle('rstadt');edgePos(e,e.len/2,P);car.x=P.x+nx*1.6;car.y=P.y+ny*1.6;car.a=Math.atan2(P.dy,P.dx);car.v=8;const w=[];
  for(let i=0;i<60;i++){update(1/30);if(i%10===9){render3D(1/30,performance.now());const g=vehMeshes.rstadt;g.updateMatrixWorld(true);let mn=1e9;for(const W of g.userData.glbWheels)W.n.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;for(let q=0;q<P.count;q+=3){V3.fromBufferAttribute(P,q).applyMatrix4(o.matrixWorld);mn=Math.min(mn,V3.y)}});w.push(+(mn-groundY(car.x,car.y)).toFixed(3))}}
  res.fahren={rad_unterkante_minus_boden_m:w,v:+car.v.toFixed(1)};setVehicle('walk');return res});
console.log('kontakt',JSON.stringify(k));
// Dauertest: im Kreis durch Rheydt fahren, Speicher/Objekte/Zeit je Minute
const d=[];await p.evaluate(()=>{save.owned.push('bike');setVehicle('bike');keys.w=true});
for(let m=0;m<=MIN;m++){const r=await p.evaluate(m=>{const t0=performance.now();if(m>0)for(let i=0;i<1800;i++){update(1/30);if(i%6===0){keys.a=Math.floor(i/300)%2===0;}if(i%30===0)render3D(1/30,performance.now())}
    const ts=[];for(let i=0;i<20;i++){const a=performance.now();update(1/30);render3D(1/30,performance.now());renderer.getContext().finish();ts.push(performance.now()-a)}ts.sort((a,b)=>a-b);
    const mi=renderer.info.memory;return {minute:m,heap_MB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(0):null,geometrien:mi.geometries,texturen:mi.textures,szene_obj:scene.children.length,bild_ms_median:+ts[10].toFixed(1),aufrufe:renderer.info.render.calls,dreiecke:renderer.info.render.triangles,pos:[Math.round(car.x),Math.round(car.y)]}},m);
  d.push(r);console.log('dauer',JSON.stringify(r))}
fs.writeFileSync(__dirname+'/kontakt_'+(process.env.TAG||'x')+'.json',JSON.stringify({kontakt:k,dauer:d,fehler:errs.slice(0,5)},null,1));console.log('ERR',errs.slice(0,5));await b.close()})();
