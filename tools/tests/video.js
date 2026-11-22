// Gameplay-Aufnahme (iPhone hochkant, 24 fps): aus dem Schultor, Kameradrehung an der Kreuzung, mit dem Fahrrad am Büdchen vorbei
const {chromium,devices}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
const OUT=__dirname+'/vframes';fs.mkdirSync(OUT,{recursive:true});for(const f of fs.readdirSync(OUT))fs.unlinkSync(OUT+'/'+f);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message));await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Noah',Object.assign({},LOOK_DEF,{jacket:"#c62828"}));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&GLB&&GLB.ready&&VG.done&&VG.done.bike,null,{timeout:300000}).catch(()=>{});
await p.evaluate(()=>{for(let i=0;i<60;i++){update(1/30);render3D(1/30,performance.now())}
  const g=MG.FX(-273.5,-71),o=MG.FX(-273.5,-57.5);car.x=g[0];car.y=g[1];car.a=Math.atan2(o[1]-g[1],o[0]-g[0]);camYaw=car.a;save.owned.push('bike');save.vown.push('bk_stadt');
  window.__plan=[];const Y=XG.find(x=>x.id==='yilmaz').pos;window.__Y=Y;
  for(let i=0;i<30;i++){update(1/30);render3D(1/30,performance.now())}});
let fr=0;const T=[];const shot=async()=>{const t0=Date.now();await p.screenshot({path:`${OUT}/f${String(fr++).padStart(4,'0')}.jpg`,type:'jpeg',quality:86,timeout:120000});T.push(Date.now()-t0)};
const step=async(fn,n)=>{for(let i=0;i<n;i++){const ft=await p.evaluate(fn);await shot()}};
// 1) aus dem Schultor auf den Gehweg und Richtung Kreuzung (7 s)
await step(()=>{const g=MG.FX(-273.5,-57.5);const d=Math.hypot(g[0]-car.x,g[1]-car.y);if(d>1.2&&!window.__out){const a=Math.atan2(g[1]-car.y,g[0]-car.x);car.a+= (((a-car.a+Math.PI*3)%(Math.PI*2))-Math.PI)*.15}else{window.__out=1;const Y=window.__Y,a=Math.atan2(Y.y-car.y,Y.x-car.x);car.a+=(((a-car.a+Math.PI*3)%(Math.PI*2))-Math.PI)*.08}
  keys.w=true;keys.shift=false;const t0=performance.now();update(1/24);render3D(1/24,performance.now());hudTexts();$('toast').style.opacity=0;return performance.now()-t0},168);
// 2) an der Kreuzung stehen bleiben, Kamera einmal herumdrehen (5 s)
await step(()=>{keys.w=false;camS.yo+=Math.PI*2/120;update(1/24);render3D(1/24,performance.now());hudTexts();$('toast').style.opacity=0},120);
// 3) aufs Fahrrad und am Büdchen vorbei (8 s)
await p.evaluate(()=>{camS.yo=0;const s=spotNear(car.x,car.y,e=>e.r.c);car.x=s.x;car.y=s.y;const e=s;setVehicle('bike');const Y=window.__Y;car.a=Math.atan2(Y.y-car.y,Y.x-car.x);camYaw=car.a});
await step(()=>{keys.w=true;update(1/24);render3D(1/24,performance.now());hudTexts();$('toast').style.opacity=0},192);
const st=await p.evaluate(()=>{const i=renderer.info.render;return {tris:i.triangles,calls:i.calls,pr:renderer.getPixelRatio()}});
console.log('frames',fr,'render',JSON.stringify(st),'ERR',errs.slice(0,4));await b.close()})();
