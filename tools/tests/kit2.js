// Bausatz-Prüfung: Maße der Teile, Fassade aus zwei Blickwinkeln, Straße in Rheydt
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];const tag=process.argv[2]||'k';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1080,height:810},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:400000});
await p.evaluate(()=>{startCreate(false);createProfile('Noah',Object.assign({},LOOK_DEF,{jacket:"#c62828"}));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready,null,{timeout:400000});
const run=async(n)=>p.evaluate(n=>{for(let i=0;i<n;i++){update(1/30);render3D(1/30,performance.now())}try{hudTexts()}catch(e){}$('toast').style.opacity=0},n);
console.log(await p.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(KIT.parts).map(([k,P])=>[k,[P.box.min.toArray().map(v=>+v.toFixed(2)),P.box.max.toArray().map(v=>+v.toFixed(2))]])))));
await p.evaluate(()=>{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}}});
const shots=JSON.parse(process.argv[3]||'[]');
for(const [i,mode] of [[0,'front'],[0,'side'],[1,'front'],[2,'front']]){
  const ok=await p.evaluate(([i,mode])=>{const o=MG.start;const L=KIT.bld.filter(B=>B.GB&&Math.hypot(B.cx-o[0],B.cy-o[1])<300).sort((a,b)=>Math.hypot(a.cx-o[0],a.cy-o[1])-Math.hypot(b.cx-o[0],b.cy-o[1]));const B=L[i*3];if(!B)return false;
    const p=B.p,n=p.length/2;let li=0,lm=0;for(let k=0;k<n;k++){const j=(k+1)%n,l=Math.hypot(p[2*j]-p[2*k],p[2*j+1]-p[2*k+1]);if(l>lm){lm=l;li=k}}
    let k=li;if(mode==='side')k=(li+1)%n;const j=(k+1)%n,x0=p[2*k],z0=p[2*k+1],x1=p[2*j],z1=p[2*j+1],l=Math.hypot(x1-x0,z1-z0),onx=B.ccw?(z1-z0)/l:-(z1-z0)/l,onz=B.ccw?-(x1-x0)/l:(x1-x0)/l,mx=(x0+x1)/2,mz=(z0+z1)/2;
    car.x=mx+onx*5;car.y=mz+onz*5;window.__cam=[[mx+onx*13+(x1-x0)/l*5,B.h*.8+3,mz+onz*13+(z1-z0)/l*5],[mx,B.h*.6,mz]];KIT.last.x=1e9;KIT.last.t=0;return true},[i,mode]);
  if(!ok)continue;await run(12);await p.screenshot({path:__dirname+`/${tag}_${i}${mode}.png`});}
console.log('zahl',await p.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(KM).map(([k,K])=>[k,K&&K.n])))));
// Ladenwand mit Fahrradständer in Rheydt
const L2=await p.evaluate(()=>{const o=MG.real.orte.rheydt_marktplatz;const res=[];for(const B of KIT.bld){const d=Math.hypot(B.cx-o.x,B.cy-o.y);if(d>500)continue;const p=B.p,n=p.length/2;
  for(let i=0;i<n;i++){const j=(i+1)%n,L=Math.hypot(p[2*j]-p[2*i],p[2*j+1]-p[2*i+1]);if(L<6)continue;const mx=(p[2*i]+p[2*j])/2,mz=(p[2*i+1]+p[2*j+1])/2,onx=B.ccw?(p[2*j+1]-p[2*i+1])/L:-(p[2*j+1]-p[2*i+1])/L,onz=B.ccw?-(p[2*j]-p[2*i])/L:(p[2*j]-p[2*i])/L;
    if(kitHash(B.i,i+101)<.6&&kitShopWall(B,mx+onx*1.5,mz+onz*1.5)&&kitWalk(mx+onx*1.9,mz+onz*1.9))res.push([d,mx,mz,onx,onz,(p[2*j]-p[2*i])/L,(p[2*j+1]-p[2*i+1])/L])}}res.sort((a,b)=>a[0]-b[0]);return res.slice(0,3)});
for(let q=0;q<L2.length&&q<2;q++){const [d,mx,mz,onx,onz,dx,dz]=L2[q];await p.evaluate(([mx,mz,onx,onz,dx,dz])=>{car.x=mx+onx*3+dx*3;car.y=mz+onz*3+dz*3;KIT.last.x=1e9;KIT.last.t=0;window.__cam=[[mx+onx*8+dx*4,3,mz+onz*8+dz*4],[mx,1.2,mz]]},[mx,mz,onx,onz,dx,dz]);
  await run(12);await p.evaluate(()=>{kitBuildInst();render3D(1/30,performance.now())});await p.screenshot({path:__dirname+`/${tag}_laden${q}.png`})}
console.log('dbg',await p.evaluate(([mx,mz,onx,onz])=>{const out=[];for(let o=.25;o<=4;o+=.5){const x=mx+onx*o,y=mz+onz*o,i=gi(x,y);out.push(o+':'+surf[i]+'/'+hgt[i]+'/'+solid[i])}return JSON.stringify({bike:KM.bikeP&&KM.bikeP.n,cap:KM.bikeP&&KM.bikeP.cap,parts:!!KIT.parts.bikeP,out})},L2[0].slice(1,5)));
for(const nm of ['bikeP','bikeP2','scooP']){const ok=await p.evaluate(nm=>{const K=KM[nm.replace('2','')];if(!K||!K.n)return false;const idx=nm.endsWith('2')?Math.min(K.n-1,3):0;const m=new THREE.Matrix4();K.ms[0].getMatrixAt(idx,m);const v=new THREE.Vector3().setFromMatrixPosition(m);
  const q=new THREE.Quaternion();m.decompose(new THREE.Vector3(),q,new THREE.Vector3());const fx=new THREE.Vector3(0,0,1).applyQuaternion(q);window.__cam=[[v.x+fx.x*3.2+fx.z*1.5,2.1,v.z+fx.z*3.2-fx.x*1.5],[v.x,.7,v.z]];window.__noKit=1;return true},nm);
  if(!ok)continue;await p.evaluate(()=>{const b=kitBuildInst;kitBuildInst=function(){};for(let i=0;i<6;i++){update(1/30)}render3D(1/30,performance.now());kitBuildInst=b});await p.screenshot({path:__dirname+`/${tag}_${nm}.png`})}
console.log('farbe',await p.evaluate(()=>JSON.stringify(KM.bikeP.ms.map(im=>[im.material.name,im.userData.lack||0,im.instanceColor?Array.from(im.instanceColor.array.slice(0,9)).map(v=>+v.toFixed(2)):null,im.material.color.getHexString(),!!im.material.map,im.material.vertexColors]))));
console.log('ERR',errs.slice(0,5));await b.close()})();
