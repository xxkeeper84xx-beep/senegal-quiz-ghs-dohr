// Allee Am Torfbend ansehen
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1080,height:810},deviceScaleFactor:2})).newPage();
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(/Allee/.test(m.text()))errs.push(m.text())});
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready&&RA.ready&&FERN.ready,null,{timeout:900000});
console.log('allee',await p.evaluate(()=>JSON.stringify({teile:ALLEE.items.length,buchten:ALLEE.items.filter(i=>i.bay).length,von:ALLEE.items[0]&&[ALLEE.items[0].x|0,ALLEE.items[0].y|0],bis:ALLEE.items.length&&[ALLEE.items[ALLEE.items.length-1].x|0,ALLEE.items[ALLEE.items.length-1].y|0]})));
const shots=[['allee_strasse',[[786,1.9,229.5],[870,1.3,248]]],['allee_strasse2',[[965,2,258],[880,1.4,246]]],['allee_seite',[[880,7,230],[880,0,262]]],['allee_ueber',[[820,48,180],[900,0,255]]]];
await p.evaluate(()=>{state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}};car.x=890;car.y=240;KIT.last.x=1e9;KIT.last.t=0;RA.last.x=1e9;RA.last.t=0;for(let i=0;i<30;i++)update(1/30)});
for(const [n,c] of shots){await p.evaluate(c=>{window.__cam=c;for(let i=0;i<4;i++)update(1/30);render3D(1/30,performance.now());$('toast').style.opacity=0},c);await p.screenshot({path:__dirname+'/'+n+'.png',timeout:600000})}
console.log('ERR',errs.slice(0,5));await b.close()})();
