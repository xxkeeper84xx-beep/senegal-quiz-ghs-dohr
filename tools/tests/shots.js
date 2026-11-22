// Vorher/Nachher-Aufnahmen: iPhone-Hochformat wie in den Screenshots des Lehrers; Ausgabe: gfx/<prefix>_1.png, _2.png, _fuss.png
const {chromium,devices}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
const PRE=process.argv[2]||'vorher';const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n').slice(1,2).join('')));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Lena',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&GLB&&GLB.ready,null,{timeout:300000}).catch(()=>{});
const info=await p.evaluate(()=>({dpr:devicePixelRatio,pr:renderer.getPixelRatio(),aa:renderer.getContextAttributes().antialias,touch:isTouch,start:MG.start}));console.log(PRE,JSON.stringify(info));
const run=async(n)=>p.evaluate(n=>{for(let i=0;i<n;i++){update(1/30);render3D(1/30,performance.now())}try{hudTexts()}catch(e){}},n);
// Blick 1: Start vor dem Schultor, Blick den Gehweg entlang
await p.evaluate(()=>{car.x=MG.start[0];car.y=MG.start[1];car.a=MG.start[2];camYaw=car.a;$('toast').style.opacity=0});await run(90);
await p.evaluate(()=>{$('toast').style.opacity=0;$('banner').hidden=true});await p.screenshot({path:__dirname+`/${PRE}_1.png`,timeout:300000});
// Blick 2: 28 m weiter Richtung Kreuzung mit Büdchen
await p.evaluate(()=>{car.x=MG.start[0]+Math.cos(MG.start[2])*28;car.y=MG.start[1]+Math.sin(MG.start[2])*28;camYaw=car.a});await run(90);
await p.evaluate(()=>{$('toast').style.opacity=0});await p.screenshot({path:__dirname+`/${PRE}_2.png`,timeout:300000});
// Füße aus Bodenhöhe (Kontrolle Aufsetzen)
const feet=await p.evaluate(()=>{const base=updateCamera;window.__fc=true;updateCamera=function(dt,VH){base(dt,VH);if(window.__fc){const a=car.a+Math.PI/2;camera.position.set(car.x+Math.cos(a)*2.2,BASE_Y+.35,car.y+Math.sin(a)*2.2);camera.lookAt(car.x,BASE_Y+.5,car.y)}};
  for(let i=0;i<5;i++){update(1/30);render3D(1/30,performance.now())}
  const w=walker;w.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(w);return {minY:+bb.min.y.toFixed(3),ground:+groundY(car.x,car.y).toFixed(3),alt:+car.alt.toFixed(3)}});
console.log('fuesse',JSON.stringify(feet));await p.screenshot({path:__dirname+`/${PRE}_fuss.png`,timeout:300000});
const st=await p.evaluate(()=>{render3D(1/30,performance.now());const i=renderer.info.render;return {tris:i.triangles,calls:i.calls}});console.log('render',JSON.stringify(st));
console.log('ERR',errs.slice(0,5));await b.close()})();
