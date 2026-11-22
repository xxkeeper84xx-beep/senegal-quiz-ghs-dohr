// Querformat (iPad) und Nahaufnahmen: Fahrzeug, Büdchen
const {chromium,devices}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1080,height:810},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message));await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Lena',Object.assign({},LOOK_DEF,{jacket:"#c62828"}));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&GLB&&GLB.ready&&VG.done&&VG.done.auto,null,{timeout:300000}).catch(()=>{});
const run=async(n)=>p.evaluate(n=>{for(let i=0;i<n;i++){update(1/30);render3D(1/30,performance.now())}try{hudTexts()}catch(e){}$('toast').style.opacity=0},n);
const Y=await p.evaluate(()=>{const g=XG.find(g=>g.id==='yilmaz');return g&&g.pos});
await p.evaluate(()=>{car.x=MG.start[0]+Math.cos(MG.start[2])*20;car.y=MG.start[1]+Math.sin(MG.start[2])*20;car.a=MG.start[2];camYaw=car.a});await run(80);
await p.screenshot({path:__dirname+'/nachher_quer.png',timeout:300000});
// Büdchen von der Straße
await p.evaluate(Y=>{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}};
  car.x=Y.x+3;car.y=Y.y+6;window.__cam=[[Y.x+9,2.2,Y.y+7],[Y.x-1,1.4,Y.y-1]]},Y);await run(10);await p.screenshot({path:__dirname+'/nachher_buedchen.png',timeout:300000});
// Fahrzeug: Kompaktwagen von schräg hinten
await p.evaluate(()=>{window.__cam=null;save.owned.push('auto');save.vown.push('ca_sport');applyVariant('ca_sport',true);car.x=MG.start[0]+Math.cos(MG.start[2])*40;car.y=MG.start[1]+Math.sin(MG.start[2])*40;const s=spotNear(car.x,car.y,e=>e.r.c);car.x=s.x;car.y=s.y;setVehicle('auto')});
await run(60);await p.screenshot({path:__dirname+'/nachher_auto.png',timeout:300000});
console.log('ERR',errs.slice(0,5));await b.close()})();
