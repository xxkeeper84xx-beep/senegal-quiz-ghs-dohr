const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:800,height:600}})).newPage();
p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(/Jahreszeit|error/i.test(m.text())&&m.type()!=='log')errs.push(m.text().slice(0,200))});
await p.route(/cdnjs.cloudflare.com\/ajax\/libs\/three/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready&&typeof SAI!=='undefined'&&SAI.cur,null,{timeout:900000});
console.log('info',await p.evaluate(()=>JSON.stringify({crownInfo:(SAI.crowns||[]).map(o=>[o.material.uuid.slice(0,4),o.material.color.getHexString(),!!o.instanceColor,o.count,o.material.type]),leafUuid:SAI.leaf&&SAI.leaf.m.uuid.slice(0,4),near:!!(KIT.treeNear),cur:SAI.cur,grass:SAI.grass.length,leaf:!!SAI.leaf,crowns:(SAI.crowns||[]).length,mats:SAI.mats.size})));
await p.evaluate(()=>{state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);camera.position.set(808,22,196);camera.lookAt(880,2,250)};car.x=880;car.y=244;KIT.last.x=1e9;KIT.last.t=0;for(let i=0;i<30;i++)update(1/30)});
for(const s of ["fruehling","sommer","herbst","winter"]){await p.evaluate(s=>{save.saison=s;saiApply(s);for(let i=0;i<20;i++)update(1/30);render3D(1/30,performance.now());$('toast').style.opacity=0},s);await p.screenshot({path:__dirname+'/sai_'+s+'.png',timeout:600000})}
console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
