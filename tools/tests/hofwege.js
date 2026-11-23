// Wege auf/um den Schulhof: welche laufen durch Gebäude?
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:900,height:900}})).newPage();
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready,null,{timeout:900000});
console.log('entfernt',await p.evaluate(()=>JSON.stringify(window.__wegeEntfernt)));const r=await p.evaluate(()=>{const C=hallR(-290,-110),out=[];
  for(const e of edges){if(!e.r)continue;let near=false;for(let j=0;j<e.pts.length/2;j++)if(Math.hypot(e.pts[2*j]-C[0],e.pts[2*j+1]-C[1])<110)near=true;if(!near)continue;
    let inB=0,n=0;const P={x:0,y:0,dx:0,dy:0};for(let s=0;s<=e.len;s+=1){edgePos(e,s,P);const i=gi(P.x,P.y);n++;if(i>=0&&(hgt[i]>1||solid[i]))inB++}
    const loc=[];for(let j=0;j<e.pts.length/2;j++){const L=hallL(e.pts[2*j],e.pts[2*j+1]);loc.push(L.map(v=>Math.round(v)))}
    out.push({id:e.id,h:e.r.h,n:e.r.n||'',w:e.r.w,c:e.r.c,len:Math.round(e.len),imGebaeude:inB,schulKoord:loc})}
  return out.sort((a,b)=>b.imGebaeude-a.imGebaeude)});
for(const e of r.slice(0,3))console.log(JSON.stringify(e));
await p.evaluate(()=>{state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}};
  const a=hallR(-306,-122),t=hallR(-316,-88);car.x=a[0];car.y=a[1];window.__cam=[[a[0],2.2,a[1]],[t[0],1.2,t[1]]];for(let i=0;i<30;i++)update(1/30);render3D(1/30,performance.now());$('toast').style.opacity=0});
await p.screenshot({path:__dirname+'/hof_ohne_weg.png'});
await p.evaluate(()=>{const a=hallR(-300,-60),t=hallR(-300,-125);window.__cam=[[a[0]+40,55,a[1]-10],[t[0],0,t[1]]];render3D(1/30,performance.now())});await p.screenshot({path:__dirname+'/hof_ohne_weg_oben.png'});await b.close()})();
