const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1.5})).newPage();
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Noah',Object.assign({},LOOK_DEF,{jacket:"#c62828"}));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&GLB&&GLB.ready,null,{timeout:300000}).catch(()=>{});
for(const [g,id,f] of [['tv','e_tv','sk_tv'],['fire','f_foot','sk_leiter']]){await p.evaluate(([g,id])=>{try{closeDlg()}catch(e){}state.task=null;state.mode='play';for(let i=0;i<30;i++){update(1/30);render3D(1/30,performance.now())}
  const G=GIVERS.find(x=>x.id===g);let t;for(let k=0;k<40;k++){save.recent=[];t=makeTask(G);if(t.id===id)break}showTask(t)},[g,id]);await p.waitForTimeout(600);await p.screenshot({path:__dirname+'/'+f+'.png',timeout:300000})}
await b.close()})();
