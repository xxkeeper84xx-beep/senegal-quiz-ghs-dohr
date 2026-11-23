// Vorher/Nachher aus festen Blickwinkeln an mehreren Orten + Messwerte (Software-Rendering, kein iPad!)
//   node stadt_vgl.js <tag>   → gfx/sv_<tag>_<ort>_<blick>.png, gfx/sv_<tag>.json ; Kameras in gfx/sv_kameras.json (beim ersten Lauf erzeugt)
const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
const tag=process.argv[2]||'vorher',KF=__dirname+'/sv_kameras.json';const errs=[];
const ORTE=[{id:'torfbend',region:'rheydt',ref:'torfbend'},{id:'innenstadt',region:'g_0_-2',ref:'gladbach_hbf'},{id:'borussia',region:'g_-2_-1',ref:'borussia_park'},{id:'grenze',region:'rheydt',grenze:true}];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1080,height:810},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
let t0=Date.now();await p.goto('http://localhost:'+(process.env.PORT||8766)+'/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});const tLoad=(Date.now()-t0)/1000;
await p.evaluate(()=>{startCreate(false);createProfile('Test',Object.assign({},LOOK_DEF));hideTitle();save.phases=[2,3,4,5];save.xp=800;persist()});
await p.waitForFunction(()=>state.mode==='play',null,{timeout:300000});await p.waitForFunction(()=>typeof KIT!=='undefined'&&KIT.ready&&GLB.ready&&(typeof RA==='undefined'||RA.ready)&&(typeof FERN==='undefined'||FERN.ready),null,{timeout:900000});const tPlay=(Date.now()-t0)/1000;
const prof=await p.evaluate(()=>PROF.id);
let K=fs.existsSync(KF)?JSON.parse(fs.readFileSync(KF)):null;const neu=!K;if(neu)K={};
const out={tag,laden_s:tLoad,spielbar_s:tPlay,orte:{}};
const NUR=(process.env.NUR||'').split(',').filter(Boolean);for(const O of ORTE){if(NUR.length&&!NUR.includes(O.id))continue;
  if(O.region!=='rheydt'){const h={region:O.region,prof,x:0,y:0,a:0,alt:0,v:0,veh:'walk',t:720};const ref=await p.evaluate(r=>MG.real&&MG.real.orte[r],O.ref).catch(()=>null);
    const R=ref||K[O.id+'_ref'];if(R){h.x=R.x;h.y=R.y;K[O.id+'_ref']=R}
    t0=Date.now();await p.goto('http://localhost:'+(process.env.PORT||8766)+'/index.html?f=1#go='+encodeURIComponent(JSON.stringify(h)));await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
    await p.waitForFunction(()=>state.mode==='play'&&edges.length>0,null,{timeout:900000});await p.waitForFunction(()=>typeof KIT!=='undefined'&&KIT.ready&&GLB.ready&&(typeof RA==='undefined'||RA.ready)&&(typeof FERN==='undefined'||FERN.ready),null,{timeout:900000});out.orte[O.id]={wechsel_s:(Date.now()-t0)/1000,region:await p.evaluate(()=>MG.region)}}
  else out.orte[O.id]={region:'rheydt'};
  await p.evaluate(()=>{window.requestAnimationFrame=()=>0;state.time=720;if(!window.__camHook){window.__camHook=1;const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(window.__cam){camera.position.set(...window.__cam[0]);camera.lookAt(...window.__cam[1])}}}});
  if(neu||!K[O.id]){K[O.id]=await p.evaluate(([O])=>{let rx,ry;if(O.grenze){// Straße, die die Kachelgrenze zu Gladbach (y=-1150) kreuzt
        let best=null;for(const e of edges){if(!e.r||!e.r.c||e.r.w<6)continue;for(let j=1;j<e.pts.length/2;j++){const y0=e.pts[2*j-1],y1=e.pts[2*j+1];if((y0+1150)*(y1+1150)<0){const t=(-1150-y0)/(y1-y0),x=e.pts[2*j-2]+(e.pts[2*j]-e.pts[2*j-2])*t;if(!best||Math.abs(x+400)<Math.abs(best[0]+400))best=[x,-1150]}}}rx=best[0];ry=best[1]+160}
      else{const o=MG.real.orte[O.ref];rx=o.x;ry=o.y}
      if(!isFinite(rx))return {err:'kein ref',region:MG.region};const n=nearestRoad(rx,ry,150,e=>e.r&&e.r.c&&e.r.w>=6)||nearestRoad(rx,ry,500,e=>e.r&&e.r.c&&e.r.w>=6)||nearestRoad(rx,ry,800);if(!n)return {err:'keine Strasse',region:MG.region,edges:edges.length,rx,ry,car:[car.x,car.y]};const a=Math.atan2(n.dy,n.dx);const x=n.x,y=n.y,sx=-n.dy,sy=n.dx;
      return {strasse:[[x-n.dx*14+sx*1.5,2.1,y-n.dy*14+sy*1.5],[x+n.dx*20,1.6,y+n.dy*20]],ueber:[[x-n.dx*60+sx*40,45,y-n.dy*60+sy*40],[x+n.dx*30,0,y+n.dy*30]],spieler:[x-n.dx*6+sx*1.2,y-n.dy*6+sy*1.2,a]}},[O])}
  if(K[O.id]&&K[O.id].err){console.log(O.id,'FEHLER',JSON.stringify(K[O.id]));delete K[O.id];continue}
  const C=K[O.id];fs.writeFileSync(KF,JSON.stringify(K));
  const m=await p.evaluate(C=>{car.x=C.spieler[0];car.y=C.spieler[1];car.a=C.spieler[2];if(typeof KIT!=="undefined"){KIT.last.x=1e9;KIT.last.t=0}if(typeof RA!=="undefined"){RA.last.x=1e9;RA.last.t=0}
    window.__cam=C.strasse;for(let i=0;i<40;i++)update(1/30);render3D(1/30,performance.now());const ts=[];
    for(let i=0;i<30;i++){const a=performance.now();update(1/30);render3D(1/30,performance.now());renderer.getContext().finish();ts.push(performance.now()-a)}ts.sort((a,b)=>a-b);
    try{hudTexts()}catch(e){}$('toast').style.opacity=0;
    return {bild_ms_median:+ts[15].toFixed(0),bild_ms_p90:+ts[27].toFixed(0),aufrufe:renderer.info.render.calls,dreiecke:renderer.info.render.triangles,profil:GFX.id}},C);
  Object.assign(out.orte[O.id],m);await p.screenshot({path:__dirname+`/sv_${tag}_${O.id}_strasse.png`,timeout:600000});
  await p.evaluate(C=>{window.__cam=C.ueber;for(let i=0;i<4;i++)update(1/30);render3D(1/30,performance.now());$('toast').style.opacity=0},C);await p.screenshot({path:__dirname+`/sv_${tag}_${O.id}_ueber.png`,timeout:600000});
  console.log(O.id,JSON.stringify(out.orte[O.id]))}
if(neu)fs.writeFileSync(KF,JSON.stringify(K));out.fehler=errs.slice(0,8);fs.writeFileSync(__dirname+`/sv_${tag}.json`,JSON.stringify(out,null,1));console.log(JSON.stringify(out));await b.close()})();
