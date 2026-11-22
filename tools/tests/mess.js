const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
let t0=Date.now();await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});const tRheydt=(Date.now()-t0)/1000;
await p.evaluate(()=>{startCreate(false);createProfile('Noah',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0;save.phases=[2,3,4,5];persist()});
await p.waitForFunction(()=>state.mode==='play'&&GLB&&GLB.ready,null,{timeout:300000}).catch(()=>{});
const frame=await p.evaluate(()=>{car.x=MG.start[0];car.y=MG.start[1];for(let i=0;i<20;i++){update(1/30);render3D(1/30,performance.now())}const ts=[];for(let i=0;i<40;i++){const a=performance.now();update(1/30);render3D(1/30,performance.now());renderer.getContext().finish();ts.push(performance.now()-a)}ts.sort((a,b)=>a-b);
  return {median:ts[20].toFixed(0),p90:ts[36].toFixed(0),max:ts[39].toFixed(0),calls:renderer.info.render.calls,tris:renderer.info.render.triangles,pr:renderer.getPixelRatio()}});
const prof=await p.evaluate(()=>PROF.id);
const h={region:'g_1_0',prof,x:1250,y:200,a:0,alt:0,v:0,veh:'walk',t:900};t0=Date.now();
await p.goto('http://localhost:8766/index.html?m=1#go='+encodeURIComponent(JSON.stringify(h)));await p.waitForFunction(()=>window.__ready,null,{timeout:400000});const tReady=(Date.now()-t0)/1000;
await p.waitForFunction(()=>state.mode==='play',null,{timeout:300000}).catch(()=>{});const tPlay=(Date.now()-t0)/1000;
const after=await p.evaluate(()=>{window.requestAnimationFrame=()=>0;const ts=[];for(let i=0;i<30;i++){const a=performance.now();update(1/30);render3D(1/30,performance.now());renderer.getContext().finish();ts.push(performance.now()-a)}
  return {region:MG.region,first:ts.slice(0,3).map(v=>v.toFixed(0)).join('/'),median:ts.sort((a,b)=>a-b)[15].toFixed(0),max:ts[29].toFixed(0),pos:[car.x.toFixed(0),car.y.toFixed(0)]}});
console.log(JSON.stringify({ladenRheydt_s:tRheydt,bildzeitTeststrecke_ms:frame,gebietswechsel:{bisBereit_s:tReady,bisSpielbar_s:tPlay,...after}}));await b.close()})();
