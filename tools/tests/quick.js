// Schnelltest der neuen Stadtgrafik am Torfbend (Kameras aus sv_kameras.json)
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];const tag=process.argv[2]||'q';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1080,height:810},isMobile:true,hasTouch:true})).newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(/error|warn/.test(m.type())&&/Schatten|Fern|Wahrz|Stadtkarte|stadt/i.test(m.text()))errs.push(m.text().slice(0,200))});
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('Test',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&FERN.ready,null,{timeout:600000}).catch(()=>console.log('FERN nicht bereit'));
const K=JSON.parse(fs.readFileSync(__dirname+'/sv_kameras.json')).torfbend;
await p.evaluate(()=>{state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}}});
for(const v of ['strasse','ueber']){const info=await p.evaluate(([C,v])=>{car.x=C.spieler[0];car.y=C.spieler[1];car.a=C.spieler[2];KIT.last.x=1e9;KIT.last.t=0;RA.last.x=1e9;RA.last.t=0;window.__cam=C[v];
  for(let i=0;i<30;i++)update(1/30);render3D(1/30,performance.now());try{hudTexts()}catch(e){}$('toast').style.opacity=0;
  return {fern:FERN.box&&FERN.box.count,terr:!!FERN.terr,href:FERN.href.toFixed(1),wz:(STADT.wz||[]).map(w=>w.W.id),sh:!!STADT.sh,B:STADT.B.length,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,fog:[scene.fog.near,scene.fog.far,camera.far]}},[K,v]);
  console.log(v,JSON.stringify(info));await p.screenshot({path:__dirname+`/${tag}_${v}.png`,timeout:600000})}
console.log('ERR',errs.slice(0,8));await b.close()})();
