// Hineingehen/Herauskommen durch die neue Tür, Innenansicht der Tür
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:900,height:700}})).newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0;window.fade=f=>f()});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready,null,{timeout:900000});
const r=await p.evaluate(()=>{const o=hallR(...HALL.doorOut);setVehicle('walk');car.x=o[0];car.y=o[1];for(let i=0;i<5;i++)update(1/30);
  const it1=nearIt&&nearIt.label;nearIt.act();for(let i=0;i<10;i++)update(1/30);const drin=inHall(car.x,car.y),it2=nearIt&&nearIt.label,a1=+car.a.toFixed(2);
  const i=hallR(...HALL.doorIn);car.x=i[0];car.y=i[1];for(let k=0;k<5;k++)update(1/30);const it3=nearIt&&nearIt.label;nearIt.act();for(let k=0;k<5;k++)update(1/30);
  return {aussen:it1,drinnen:drin,blickRad:a1,innenAngebot:it2,anTuerInnen:it3,danachDraussen:!inHall(car.x,car.y),pos:[+car.x.toFixed(1),+car.y.toFixed(1)]}});
console.log('tuer',JSON.stringify(r));
await p.evaluate(()=>{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}};
  const a=hallR(-276,-137),t=hallR(-268.4,-134.6);car.x=a[0];car.y=a[1];window.__cam=[[a[0],1.7,a[1]],[t[0],1.4,t[1]]];for(let i=0;i<5;i++)update(1/30);render3D(1/30,performance.now());$('toast').style.opacity=0});
await p.screenshot({path:__dirname+'/halle_innen_tuer.png'});console.log('ERR',errs.slice(0,4));await b.close()})();
