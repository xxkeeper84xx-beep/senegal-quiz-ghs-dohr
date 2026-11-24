// eigene Wahrzeichen ansehen (je Gebiet)
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
const [reg,id]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1000,height:700}})).newPage();
p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(/Wahrzeichen/.test(m.text()))errs.push(m.text().slice(0,300))});
await p.route(/cdnjs.cloudflare.com\/ajax\/libs\/three/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
const W=JSON.parse(fs.readFileSync(__dirname+'/../sk2/wahrzeichen/index.js','utf8').replace(/^[^\[]*/,'').replace(/;\s*$/,'')).find(w=>w.id===id);
await p.goto('http://localhost:8766/index.html?f=1#go='+encodeURIComponent(JSON.stringify({region:reg,prof:null,x:W.x+60,y:W.y+60,a:0,alt:0,v:0,veh:'walk',t:720})));
await p.waitForFunction(()=>window.__ready,null,{timeout:600000});await p.evaluate(()=>{if(state.mode!=='play'){try{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle()}catch(e){}}window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&typeof FERN!=='undefined'&&FERN.ready,null,{timeout:900000});
if(process.env.HIGH)await p.evaluate(h=>{window.__HIGH=+h},process.env.HIGH);const info=await p.evaluate(id=>{const w=(STADT.wz||[]).find(w=>w.W.id===id);if(!w)return {fehlt:true,ids:(STADT.wz||[]).map(w=>w.W.id)};const o=w.o;o.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(o),c=bb.getCenter(new THREE.Vector3()),s=bb.getSize(new THREE.Vector3());
  window.__C=[c.x,c.z,Math.max(s.x,s.z),s.y,o.rotation.y];state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}};
  return {eigen:!!w.eigen,groesse:[s.x,s.y,s.z].map(v=>+v.toFixed(1)),rot:+o.rotation.y.toFixed(2)}},id);console.log('info',JSON.stringify(info));
if(!info.fehlt)for(const [n,f] of [['front',[1.0,.35]],['schraeg',[.6,.6]]]){await p.evaluate(([f])=>{const [cx,cz,S,Hh,ry]=window.__C;const fx=Math.sin(-ry+Math.PI*0),fz=Math.cos(ry);const dx=-Math.sin(ry)*0+Math.sin(ry),dz=Math.cos(ry);
    const ang=-ry+Math.PI/2*0;const dirx=Math.sin(-ry)*-1,dirz=Math.cos(-ry);const d=S*(f[0]?1:1)*.95;const k=f[1];
    const vx=Math.sin(ry)*1,vz=Math.cos(ry)*1;const camx=cx+(-Math.sin(-ry))*0;
    const lx=Math.sin(-ry+0),lz=Math.cos(-ry+0);const px=cx+(Math.sin(ry)*0)+(-Math.sin(-ry)*0);
    const fwd=[Math.sin(ry),Math.cos(ry)];const side=[Math.cos(ry),-Math.sin(ry)];
    car.x=cx+fwd[0]*S*.8;car.y=cz+fwd[1]*S*.8;KIT.last.x=1e9;KIT.last.t=0;
    window.__cam=[[cx+fwd[0]*d+side[0]*d*k,Math.max(6,Hh*1.1,S*(window.__HIGH||0)),cz+fwd[1]*d+side[1]*d*k],[cx,Hh*.35,cz]];for(let i=0;i<25;i++)update(1/30);render3D(1/30,performance.now());$('toast').style.opacity=0},[f]);
  await p.screenshot({path:__dirname+`/wz2_${id}_${n}.png`,timeout:600000})}
console.log('ERR',JSON.stringify(errs.slice(0,4)));await b.close()})();
