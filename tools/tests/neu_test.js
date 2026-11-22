// Test der neuen Modelle: Noah/Passanten, Fahrzeuge (Räder, Sitz), Laternen, Fassaden-Bausatz; Bilder
const {chromium,devices}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1080,height:810},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n').slice(1,2).join('')));p.on('console',m=>{if(/warn|error/.test(m.type())&&!/Failed to load resource/.test(m.text()))errs.push(m.type()+': '+m.text().slice(0,160))});
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Noah',Object.assign({},LOOK_DEF,{jacket:"#c62828"}));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&GLB&&GLB.ready&&VG.done&&VG.done.auto&&VG.done.bike&&VG.done.scoot&&VG.done.moped&&KIT.ready,null,{timeout:400000}).catch(()=>console.log('nicht alles geladen'));
const run=async(n)=>p.evaluate(n=>{for(let i=0;i<n;i++){update(1/30);render3D(1/30,performance.now())}try{hudTexts()}catch(e){}$('toast').style.opacity=0},n);
console.log('stand',await p.evaluate(()=>{car.x=MG.start[0]+Math.cos(MG.start[2])*20;car.y=MG.start[1]+Math.sin(MG.start[2])*20;car.a=MG.start[2];for(let i=0;i<30;i++){update(1/30);render3D(1/30,performance.now())}kitBuildInst();
  const w=walker;w.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(w);const cnt={};for(const k in KM)cnt[k]=KM[k]?KM[k].n:0;
  return {fussY:+bb.min.y.toFixed(3),boden:+groundY(car.x,car.y).toFixed(3),kit:cnt,sitze:KIT.seat,size:VG.size,lampen:!!KIT.lampMats,tris:renderer.info.render.triangles,calls:renderer.info.render.calls}}));
await run(30);await p.screenshot({path:__dirname+'/neu_strasse.png',timeout:300000});
// Nahaufnahme Fassade mit Fenstern
await p.evaluate(()=>{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}};
  let best=null,bd=1e9;for(const B of KIT.bld){const d=Math.hypot(B.cx-car.x,B.cy-car.y);if(d<bd&&B.GB){bd=d;best=B}}if(!best)best=KIT.bld[0];window.__B=best;const p=best.p;
  const x0=p[0],z0=p[1],x1=p[2],z1=p[3],L=Math.hypot(x1-x0,z1-z0),onx=best.ccw?(z1-z0)/L:-(z1-z0)/L,onz=best.ccw?-(x1-x0)/L:(x1-x0)/L,mx=(x0+x1)/2,mz=(z0+z1)/2;
  car.x=mx+onx*6;car.y=mz+onz*6;window.__cam=[[mx+onx*11+(x1-x0)/L*4,4.5,mz+onz*11+(z1-z0)/L*4],[mx,best.h*.55,mz]];KIT.last.x=1e9;KIT.last.t=0});
await run(20);await p.screenshot({path:__dirname+'/neu_fassade.png',timeout:300000});
// Fahrzeuge nebeneinander (Ausstellung im Autohaus/Fahrradladen nutzt dieselben Modelle): Fahrrad mit Noah
await p.evaluate(()=>{window.__cam=null;save.owned.push('bike','auto','moped');setVehicle('bike');car.x=MG.start[0]+Math.cos(MG.start[2])*30;car.y=MG.start[1]+Math.sin(MG.start[2])*30;const s=spotNear(car.x,car.y,e=>e.r.c);car.x=s.x;car.y=s.y;car.v=5});
await run(40);const sp=await p.evaluate(()=>({veh:save.veh,v:car.v.toFixed(1),rad:vehMeshes.bike.userData.glbWheels.length,radRot:vehMeshes.bike.userData.glbWheels.map(w=>(w.m||w.n).rotation.x.toFixed(2))}));console.log('fahrrad',JSON.stringify(sp));
await p.screenshot({path:__dirname+'/neu_fahrrad.png',timeout:300000});
await p.evaluate(()=>{setVehicle('auto');car.v=6});await run(40);console.log('auto',await p.evaluate(()=>JSON.stringify({rad:vehMeshes.auto.userData.glbWheels.map(w=>w.n.name+':'+(w.m?'mesh':'node')),paint:vehMeshes.auto.userData.paint&&vehMeshes.auto.userData.paint.type})));
await p.screenshot({path:__dirname+'/neu_auto.png',timeout:300000});
// Ladenfassade Rheydt: Laden nahe Rheydt Markt
console.log('laden',await p.evaluate(()=>{window.__cam=window.__cam||null;const o=MG.real.orte.rheydt_marktplatz;let best=null,bd=1e9;
  for(const B of KIT.bld){const d=Math.hypot(B.cx-o.x,B.cy-o.y);if(d>400)continue;const p=B.p;let ok=false;for(let i=0;i<p.length/2&&!ok;i++){const j=(i+1)%(p.length/2),L=Math.hypot(p[2*j]-p[2*i],p[2*j+1]-p[2*i+1]);if(L<5)continue;const mx=(p[2*i]+p[2*j])/2,mz=(p[2*i+1]+p[2*j+1])/2,onx=B.ccw?(p[2*j+1]-p[2*i+1])/L:-(p[2*j+1]-p[2*i+1])/L,onz=B.ccw?-(p[2*j]-p[2*i])/L:(p[2*j]-p[2*i])/L;if(kitShopWall(B,mx+onx*1.5,mz+onz*1.5)){ok=true;B.__w=i}}if(ok&&d<bd){bd=d;best=B}}if(!best)return 'kein Laden';
  setVehicle('walk');const p=best.p;const li=best.__w,jj=(li+1)%(p.length/2),ll=Math.hypot(p[2*jj]-p[2*li],p[2*jj+1]-p[2*li+1]);
  const j=(li+1)%(p.length/2),x0=p[2*li],z0=p[2*li+1],x1=p[2*j],z1=p[2*j+1],L=ll,onx=best.ccw?(z1-z0)/L:-(z1-z0)/L,onz=best.ccw?-(x1-x0)/L:(x1-x0)/L,mx=(x0+x1)/2,mz=(z0+z1)/2;
  car.x=mx+onx*4;car.y=mz+onz*4;KIT.last.x=1e9;KIT.last.t=0;window.__cam=[[mx+onx*9,2.6,mz+onz*9],[mx,1.6,mz]];const b=KIT.parts.shopR&&KIT.parts.shopR.box;return {d:bd.toFixed(0),box:b&&[b.min.toArray().map(v=>v.toFixed(2)),b.max.toArray().map(v=>v.toFixed(2))]}}));
await run(20);await p.evaluate(()=>{for(let i=0;i<3;i++){update(1/30)}kitBuildInst();render3D(1/30,performance.now())});await p.screenshot({path:__dirname+'/neu_laden.png',timeout:300000});
// SUV im Autohaus
await p.evaluate(()=>{const R=ROOMS.find(r=>r.id==='auto');const c=rW(R,R.D/2-1,R.W/2-1.5),t=rW(R,1.4,0);window.__cam=[[c[0],3.2,c[1]],[t[0],.8,t[1]]];car.x=rW(R,R.D/2-2,0)[0];car.y=rW(R,R.D/2-2,0)[1];refreshShows(true)});
await run(10);await p.screenshot({path:__dirname+'/neu_suv.png',timeout:300000});
console.log('ERR',errs.slice(0,8));await b.close()})();
