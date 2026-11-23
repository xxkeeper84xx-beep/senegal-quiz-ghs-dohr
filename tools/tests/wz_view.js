// Wahrzeichen einer Kachel ansehen
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1080,height:810}})).newPage();
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(/Wahrz/.test(m.text()))errs.push(m.text().slice(0,200))});
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
const reg=process.argv[2]||'rheydt',x=+process.argv[3],y=+process.argv[4];
await p.goto('http://localhost:8766/index.html?f=1#go='+encodeURIComponent(JSON.stringify({region:reg,prof:null,x,y,a:0,alt:0,v:0,veh:'walk',t:720})));
await p.waitForFunction(()=>window.__ready,null,{timeout:600000});await p.evaluate(()=>{if(state.mode!=='play'){try{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle()}catch(e){}}window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&typeof FERN!=='undefined'&&FERN.ready,null,{timeout:900000});
const L=await p.evaluate(()=>{state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}};return (STADT.wz||[]).map(w=>[w.W.id,w.W.x,w.W.y,w.W.h])});
console.log('wz',JSON.stringify(L),'ext',await p.evaluate(()=>JSON.stringify(REG.ext)));
for(const [id,wx,wy,h] of L){await p.evaluate(([wx,wy,h])=>{car.x=wx+h*4;car.y=wy+h*4;window.__cam=[[wx+h*3.2,h*1.6,wy+h*3.6],[wx,h*.4,wy]];KIT.last.x=1e9;KIT.last.t=0;for(let i=0;i<20;i++)update(1/30);render3D(1/30,performance.now())},[wx,wy,h]);
  await p.screenshot({path:__dirname+'/wz_'+id+'.png',timeout:600000})}
console.log('ERR',errs.slice(0,5));await b.close()})();
