// Schule innen: Weg ablaufen und Fotos aus gleichen Blickwinkeln
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:600,height:800}})).newPage();
p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(/Schule innen/.test(m.text()))errs.push(m.text().slice(0,300))});
await p.route(/cdnjs.cloudflare.com\/ajax\/libs\/three/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0;window.fade=f=>f()});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready&&SI.G,null,{timeout:900000});
const r=await p.evaluate(()=>{const R=(x,z)=>siR(x,z);setVehicle('walk');const d=R(...SI.door);car.x=d[0];car.y=d[1];for(let i=0;i<4;i++)update(1/30);const lab1=nearIt&&nearIt.label;nearIt&&nearIt.act();for(let i=0;i<4;i++)update(1/30);
  // Weg ablaufen: Punkte in Schulkoordinaten, prüfen ob begehbar (carHits) und Höhe
  const pts=[[-270.8,-104],[-270.8,-101],[-270.8,-99],[-270.8,-95],[-270.8,-91],[-270.8,-89.8],[-271,-86],[-275,-84.5],[-278.8,-84.5],[-281,-84.5],[-286,-84],[-291.5,-84.5]];const out=[];
  for(const [x,z] of pts){const w=R(x,z);const hit=carHits(w[0],w[1]);car.x=w[0];car.y=w[1];for(let i=0;i<20;i++)update(1/30);out.push([x,z,hit?'BLOCK':'ok',+car.alt.toFixed(2)])}
  const lab2=nearIt&&nearIt.label;return {lab1,inside:siInside(),weg:out,tafel:lab2}});
console.log('weg',JSON.stringify(r));
await p.evaluate(()=>{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}}});
const V=[['innen1',[-270.6,1.6,-101.3],[-270.8,1.2,-107]],['innen2',[-270.8,2.0,-100.7],[-270.8,1.7,-89]],['innen3',[-271,2.4,-82.5],[-279,2.2,-88]],['innen4',[-280.5,2.6,-80],[-292,1.6,-86]]];
for(const [n,c,t] of V){await p.evaluate(([c,t])=>{const a=siR(c[0],c[2]),b=siR(t[0],t[2]);car.x=a[0]+.01;car.y=a[1]+.01;for(let i=0;i<6;i++)update(1/30);window.__cam=[[a[0],BASE_Y+c[1],a[1]],[b[0],BASE_Y+t[1],b[1]]];walker.visible=false;render3D(1/30,performance.now());$('toast').style.opacity=0},[c,t]);
  await p.screenshot({path:__dirname+'/'+n+'.png',timeout:600000})}
console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
