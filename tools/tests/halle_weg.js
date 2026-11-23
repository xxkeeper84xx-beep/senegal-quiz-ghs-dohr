// Weg vom Pausenhof zur Sporthalle: Lage und Ansichten
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];const tag=process.argv[2]||'hw';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:900,height:900}})).newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play'&&KIT.ready&&FERN.ready,null,{timeout:900000});
const info=await p.evaluate(()=>{const R=(x,z)=>hallR(x,z).map(v=>+v.toFixed(1));const q=questById('schulhof');
  return {doorOut:R(...HALL.doorOut),doorIn:R(...HALL.doorIn),ecken:[R(HALL.x0,HALL.z0),R(HALL.x1,HALL.z0),R(HALL.x1,HALL.z1),R(HALL.x0,HALL.z1)],rot:+hallRot().toFixed(3),
    schulhofGeber:q&&q.giver&&R(q.giver.x,q.giver.y),fx:!!MG.FX}});
console.log('lage',JSON.stringify(info));fs.writeFileSync(__dirname+'/halle_lage.json',JSON.stringify(info));
const d=info.doorOut,c=info.ecken.reduce((a,e)=>[a[0]+e[0]/4,a[1]+e[1]/4],[0,0]);
const W=await p.evaluate(()=>{const R=(x,z)=>hallR(x,z);const out={hof:R(-265.4,-96),tor:R(-264.3,-118),nische:R(-277.5,-124.6),pfad:R(-263.4,-120.4),pfadZiel:R(-290,-123.6)};
  // Schulorte, die im neuen eingefassten Streifen (z −125…−118, x −293…−266) oder auf der Mauer liegen
  const hits=[];for(const q of QUESTS){const pts=[q.giver].concat(q.measures||[]).filter(Boolean);for(const m of pts){const L=hallL(m.x,m.y);if(L[0]>-293&&L[0]<-262&&L[1]>-125.5&&L[1]<-117.5)hits.push([q.id,m.id||'geber',L.map(v=>+v.toFixed(1))])}}
  return {...out,hits}});console.log('weg',JSON.stringify(W));
const lauf=await p.evaluate(()=>{const R=(x,z)=>hallR(x,z);const pts=[[-264.6,-96],[-264.4,-112],[-264.3,-117],[-264.2,-119.5],[-270,-122.6],[-277.5,-123.2],[-277.5,-124.4]];let block=[];
  for(let k=1;k<pts.length;k++){const a=R(...pts[k-1]),b=R(...pts[k]);const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.25);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,y=a[1]+(b[1]-a[1])*i/n,c=gi(x,y);if(c>=0&&(solid[c]||hgt[c]))block.push([+x.toFixed(1),+y.toFixed(1)])}}
  // bis an die Tür gehen und prüfen, ob „Sporthalle betreten“ angeboten wird
  const d=R(-277.5,-124.0);setVehicle('walk');car.x=d[0];car.y=d[1];for(let i=0;i<5;i++)update(1/30);let it=null;try{it=(typeof nearIt!=='undefined'&&nearIt)?nearIt.label:null}catch(e){}
  return {blockiert:block.slice(0,6),anzahl:block.length,interaktion:it}});console.log('lauf',JSON.stringify(lauf));
const views=[['oben',[[W.tor[0]+12,42,W.tor[1]+28],[W.tor[0]-8,0,W.tor[1]-6]]],['foto1',[[W.hof[0],1.6,W.hof[1]],[W.tor[0],1.3,W.tor[1]]]],['foto2',[[W.pfad[0],1.5,W.pfad[1]],[W.pfadZiel[0],1.2,W.pfadZiel[1]]]]];

await p.evaluate(()=>{state.time=720;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}}});
for(const [n,cm] of views){await p.evaluate(([cm,d])=>{car.x=d[0]+3;car.y=d[1]+3;KIT.last.x=1e9;KIT.last.t=0;window.__cam=cm;for(let i=0;i<20;i++)update(1/30);render3D(1/30,performance.now());$('toast').style.opacity=0},[cm,d]);await p.screenshot({path:__dirname+`/${tag}_${n}.png`,timeout:600000})}
console.log('ERR',errs.slice(0,4));await b.close()})();
