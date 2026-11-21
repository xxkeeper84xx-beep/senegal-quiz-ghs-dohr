/* Trailer-Aufnahme: spielt geskriptete Szenen im echten Spiel ab und speichert jedes Bild (24 fps). */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const SP=path.join(__dirname,'..');const three=fs.readFileSync(SP+'/three/package/build/three.min.js');const T128=SP+'/three128/package';const errs=[];
const FPS=24,W=1280,H=720,ONLY=process.argv[2]?process.argv[2].split(','):null;
fs.mkdirSync(__dirname+'/frames',{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage();
p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));
await p.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/(.*)$/,r=>{const rel=r.request().url().split('three@0.128.0/')[1];r.fulfill({path:path.join(T128,rel),contentType:'application/javascript'})});
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:300000});
await p.evaluate(()=>{startCreate(false);createProfile('Noah',Object.assign({},LOOK_DEF));hideTitle();});
await p.waitForFunction(()=>walker&&walker.userData.glbDone&&Object.keys(GLB.models).length>=9&&Object.keys(VG.done).length>=6,null,{timeout:1800000,polling:2000});
await p.addStyleTag({path:__dirname+'/overlay.css'});
await p.evaluate(fs=>{eval(fs)},fs.readFileSync(__dirname+'/szenen.js','utf8'));
const shots=await p.evaluate(()=>SHOTS.map(s=>[s.id,s.t0,s.t1]));
let n=0;
for(const [id,t0,t1] of shots){const f0=Math.round(t0*FPS),f1=Math.round(t1*FPS);
  if(ONLY&&!ONLY.includes(id)){continue}
  await p.evaluate(id=>shotStart(id),id);
  for(let f=f0;f<f1;f++){await p.evaluate(([id,t])=>shotFrame(id,t),[id,f/FPS]);
    await p.screenshot({path:__dirname+`/frames/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:92,timeout:120000});n++}
  console.log('shot',id,f1-f0,'frames',errs.slice(-2))}
console.log('frames',n,'ERR',errs.slice(0,5));await b.close()})();
