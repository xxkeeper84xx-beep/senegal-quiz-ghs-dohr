// Herr Ballhorn am Werkhof ansehen
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:800,height:900}})).newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&GLB.ready&&KIT.ready,null,{timeout:900000});
const info=await p.evaluate(()=>{const S=STANDS.find(S=>standName(S)==="Herr Ballhorn");if(!S)return null;car.x=S.x+6;car.y=S.y+6;for(let i=0;i<40;i++){update(1/30);render3D(1/30,performance.now())}
  const fx=Math.cos(S.a),fy=Math.sin(S.a);const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);camera.position.set(S.x+fx*2.6+fy*.9,1.55,S.y+fy*2.6-fx*.9);camera.lookAt(S.x,1.0,S.y)};
  for(let i=0;i<8;i++){update(1/30)}render3D(1/30,performance.now());$('toast').style.opacity=0;
  return {glb:!!S.glb,modell:S.glb&&S.glb.M&&Object.keys(GLB.models).find(k=>GLB.models[k]===S.glb.M),stock:!!(S.glb&&S.glb.alt),knochen:S.glb&&S.glb.alt&&S.glb.alt.length}});
console.log('ballhorn',JSON.stringify(info));await p.screenshot({path:__dirname+'/ballhorn.png',timeout:600000});console.log('ERR',errs.slice(0,4));await b.close()})();
