const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1080,height:810}})).newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n')[1]));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Tester',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready&&RA.ready,null,{timeout:500000});
const run=async(n)=>p.evaluate(n=>{for(let i=0;i<n;i++){update(1/30)}render3D(1/30,performance.now());try{hudTexts()}catch(e){}$('toast').style.opacity=0},n);
await p.evaluate(()=>{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}}});
const f=await p.evaluate(()=>{const o=MG.real.orte.rheydt_marktplatz;const out=[];for(const B of KIT.bld){if(Math.hypot(B.cx-o.x,B.cy-o.y)>700)continue;const p=B.p,n=p.length/2;
  for(let i=0;i<n;i++){const j=(i+1)%n,x0=p[2*i],z0=p[2*i+1],x1=p[2*j],z1=p[2*j+1],L=Math.hypot(x1-x0,z1-z0);if(L<12)continue;const dx=(x1-x0)/L,dz=(z1-z0)/L,onx=B.ccw?dz:-dz,onz=B.ccw?-dx:dx;
    const r=kitRHWall(B,i,x0,z0,L,dx,dz,onx,onz,false);if(r&&!heightAt(x0+dx*L/2+onx*10,z0+dz*L/2+onz*10)&&!heightAt(x0+dx*L/2+onx*10+dx*12,z0+dz*L/2+onz*10+dz*12))out.push([Math.hypot(B.cx-o.x,B.cy-o.y),x0+dx*L/2,z0+dz*L/2,onx,onz,dx,dz,r.n,B.i])}}out.sort((a,b)=>a[0]-b[0]);return out.slice(0,3)});
for(let q=0;q<f.length;q++){const [d,mx,mz,onx,onz,dx,dz]=f[q];
  const dbg=await p.evaluate(([mx,mz,onx,onz,dx,dz,bi])=>{car.x=mx+onx*5;car.y=mz+onz*5;window.__cam=[[mx+onx*10+dx*12,2.2,mz+onz*10+dz*12],[mx-dx*3,4,mz-dz*3]];kitBuildInst();const B=KIT.bld[bi];return {n:KM.rhaus.n,eave:KIT.rhEave,rh:B.rh.filter(Boolean),h:B.h}},f[q].slice(1,7).concat([f[q][8]]));
  console.log(q,JSON.stringify(dbg));await run(4);await p.evaluate(()=>{kitBuildInst();render3D(1/30,performance.now())});await p.screenshot({path:__dirname+'/rh'+q+'.png'})}
console.log('ERR',errs.slice(0,5));await b.close()})();
