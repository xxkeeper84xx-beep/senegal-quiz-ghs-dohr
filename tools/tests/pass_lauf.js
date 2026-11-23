// Neue Passanten beim Gehen auf freier Fläche, Nahaufnahme (keine Hauswand in der Nähe)
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1600,height:700},deviceScaleFactor:1})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Noah',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&GLB&&GLB.ready&&Object.keys(GLB.models).length>=9,null,{timeout:400000}).catch(()=>{});
const r=await p.evaluate(()=>{// freie Stelle suchen: 30x30 m ohne Gebäude
  let best=null;for(let k=0;k<4000&&!best;k++){const x=car.x+(Math.random()-.5)*600,y=car.y+(Math.random()-.5)*600;let ok=true;for(let a=-15;a<=15&&ok;a+=2.5)for(let c=-15;c<=15&&ok;c+=2.5){const i=gi(x+a,y+c);if(i<0||hgt[i]||solid[i])ok=false}if(ok)best=[x,y]}
  if(!best)return 'keine freie Fläche';const names=["01_Schuelerin","02_Fussballfan","03_Seniorin","04_Senior","05_Strassenbauer","06_Joggerin","07_Geschaeftsfrau","08_Passant"];
  window.__figs=[];for(let n=0;n<8;n++){const M=GLB.models[names[n]];if(!M)continue;const o=THREE.SkeletonUtils.clone(M.scene);o.position.set(best[0]-7+n*2,groundY(best[0],best[1])+(M.offY||0),best[1]);o.rotation.y=-.5;scene.add(o);
    const mx=new THREE.AnimationMixer(o);const clip=M.clips.walk||Object.values(M.clips)[0];mx.clipAction(clip).play();mx.update(.37+n*.11);window.__figs.push(mx)}
  for(let r=1;r<=2;r++)for(let n=0;n<8;n++){const M=GLB.models[names[n]];if(!M)continue;const o=THREE.SkeletonUtils.clone(M.scene);o.position.set(best[0]-7+n*2+r*.6,groundY(best[0],best[1])+(M.offY||0),best[1]-2.6*r);o.rotation.y=-.5;scene.add(o);
    tintGlb({obj:o,M},randomTint(""));const mx=new THREE.AnimationMixer(o);mx.clipAction(M.clips.walk||Object.values(M.clips)[0]).play();mx.update(.2+n*.13+r*.3)}
  for(const q of peds){if(q.glb)q.glb.obj.visible=false}car.x=best[0];car.y=best[1]+9;setVehicle("walk");walker.visible=false;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);camera.position.set(best[0],3.2,best[1]+11.5);camera.lookAt(best[0],1,best[1])};return names.filter(n=>GLB.models[n]).length});
console.log('figuren',r);
await p.evaluate(()=>{for(let i=0;i<8;i++){update(1/30)}render3D(1/30,performance.now())});await p.screenshot({path:__dirname+'/pass_lauf.png'});console.log('ERR',errs.slice(0,3));await b.close()})();
