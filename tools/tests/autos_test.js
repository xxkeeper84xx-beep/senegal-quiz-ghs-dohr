// Rheydt-Autos: parkende Autos, Verkehr, Autohaus, selbst fahren
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1080,height:810},deviceScaleFactor:1,isMobile:!!process.env.MOB,hasTouch:!!process.env.MOB});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(/error/.test(m.type())&&!/Failed to load resource/.test(m.text()))errs.push(m.text().slice(0,200))});
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Tester',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&RA.ready&&VG.done.rstadt&&VG.done.rlim&&VG.done.rsuv,null,{timeout:500000}).catch(()=>console.log('nicht alles geladen'));
const run=async(n)=>p.evaluate(n=>{for(let i=0;i<n;i++){update(1/30)}render3D(1/30,performance.now());try{hudTexts()}catch(e){}$('toast').style.opacity=0},n);
await p.evaluate(()=>{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}}});
console.log('info',await p.evaluate(()=>JSON.stringify({gfx:GFX.id,slots:RA.slots.length,traf:RA.traf.length,ok:RA.ok,park:RA.inst.map(K=>K.n),size:{s:VG.size.rstadt,l:VG.size.rlim,u:VG.size.rsuv}})));
// 1) Straße mit parkenden Autos: Slot nahe Rheydt Markt
const st=await p.evaluate(()=>{const o=MG.real.orte.rheydt_marktplatz;const S=RA.slots.filter(s=>Math.hypot(s.x-o.x,s.y-o.y)<500).sort((a,b)=>Math.hypot(a.x-o.x,a.y-o.y)-Math.hypot(b.x-o.x,b.y-o.y))[0];if(!S)return null;
  car.x=S.x+Math.cos(S.ang)*6;car.y=S.y+Math.sin(S.ang)*6;RA.last.x=1e9;RA.last.t=0;KIT.last.x=1e9;KIT.last.t=0;const fx=Math.cos(S.ang),fy=Math.sin(S.ang),nx=-fy,ny=fx;
  window.__cam=[[S.x-fx*14-nx*4,3.2,S.y-fy*14-ny*4],[S.x+fx*6,1,S.y+fy*6]];return [S.x,S.y]});
console.log('slot',st);await run(20);await p.screenshot({path:__dirname+'/au_park.png'});
console.log('park',await p.evaluate(()=>JSON.stringify(RA.inst.map(K=>K.n))));
// 1b) Klinker-Reihenhäuser in Rheydt
const rhs=await p.evaluate(()=>{const o=MG.real.orte.rheydt_marktplatz;const out=[];for(const B of KIT.bld){if(Math.hypot(B.cx-o.x,B.cy-o.y)>700)continue;const p=B.p,n=p.length/2;
  for(let i=0;i<n;i++){const j=(i+1)%n,x0=p[2*i],z0=p[2*i+1],x1=p[2*j],z1=p[2*j+1],L=Math.hypot(x1-x0,z1-z0);if(L<5.8)continue;const dx=(x1-x0)/L,dz=(z1-z0)/L,onx=B.ccw?dz:-dz,onz=B.ccw?-dx:dx;
    const r=kitRHWall(B,i,x0,z0,L,dx,dz,onx,onz,false);if(r)out.push([Math.hypot(B.cx-o.x,B.cy-o.y),x0+dx*L/2,z0+dz*L/2,onx,onz,dx,dz,r.n])}}out.sort((a,b)=>a[0]-b[0]);return {n:out.length,f:out.slice(0,3)}});
console.log('reihenhaus-waende',rhs.n);
for(let q=0;q<Math.min(2,rhs.f.length);q++){const [d,mx,mz,onx,onz,dx,dz]=rhs.f[q];await p.evaluate(([mx,mz,onx,onz,dx,dz])=>{car.x=mx+onx*5;car.y=mz+onz*5;KIT.last.x=1e9;KIT.last.t=0;RA.last.x=1e9;RA.last.t=0;window.__cam=[[mx+onx*15+dx*9,4,mz+onz*15+dz*9],[mx-dx*2,4.5,mz-dz*2]]},[mx,mz,onx,onz,dx,dz]);
  await run(15);await p.screenshot({path:__dirname+'/au_rhaus'+q+'.png'})}
console.log('rh inst',await p.evaluate(()=>KM.rhaus&&KM.rhaus.n),'fog',await p.evaluate(()=>[scene.fog.near,scene.fog.far,camera.far]));
// 2) Verkehr: nächstes Verkehrsauto zeigen
await p.evaluate(()=>{window.__cam=null;car.x=MG.start[0];car.y=MG.start[1];for(const n of RA.traf){placeAgent(n,carEdges,car.x,car.y,15,40,true)}});await run(30);
const tr=await p.evaluate(()=>{const n=RA.traf.filter(n=>n.ra.visible).sort((a,b)=>Math.hypot(a.x-car.x,a.y-car.y)-Math.hypot(b.x-car.x,b.y-car.y))[0];if(!n)return 'keins sichtbar';const fx=Math.cos(n.ang),fy=Math.sin(n.ang);
  const b=update;update=function(dt){b(dt);if(window.__fol){const m=window.__fol;window.__cam=[[m.x+Math.cos(m.ang)*7-Math.sin(m.ang)*4,2.6,m.y+Math.sin(m.ang)*7+Math.cos(m.ang)*4],[m.x,.8,m.y]]}};window.__fol=n;return RA.traf.filter(n=>n.ra.visible).length});
console.log('verkehr sichtbar',tr);await run(15);await p.screenshot({path:__dirname+'/au_verkehr.png'});
// 3) Autohaus
await p.evaluate(()=>{window.__fol=null;const R=ROOMS.find(r=>r.id==='auto');const c=rW(R,R.D/2-1.5,R.W/2-1.5),t=rW(R,-4,-2);window.__cam=[[c[0],4.2,c[1]],[t[0],.6,t[1]]];const q=rW(R,R.D/2-2,0);car.x=q[0];car.y=q[1];refreshShows(true)});
await run(10);await p.screenshot({path:__dirname+'/au_autohaus.png'});
// 4) selbst fahren: Limousine
await p.evaluate(()=>{window.__cam=null;KIDS.clear();save.money=9000;save.xp=300;buyVar('ca_rlim');car.x=MG.start[0]+Math.cos(MG.start[2])*20;car.y=MG.start[1]+Math.sin(MG.start[2])*20;const s=spotNear(car.x,car.y,e=>e.r.c);car.x=s.x;car.y=s.y;car.v=6;keys.w=true});
await run(45);console.log('fahren',await p.evaluate(()=>JSON.stringify({v:car.v.toFixed(1),r:car.r,wheels:vehMeshes.rlim.userData.glbWheels.length})));await p.screenshot({path:__dirname+'/au_fahren.png'});
console.log('tris',await p.evaluate(()=>renderer.info.render.triangles));
console.log('ERR',errs.slice(0,6));await b.close()})();
