const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:600,height:400}})).newPage();
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
console.log(await p.evaluate(()=>{const out=[];for(let y=228;y<=272;y+=2){const i=gi(912,y);out.push(y+':'+surf[i]+'/'+groundY(912,y).toFixed(2)+(hgt[i]?'H':''))}
  const n=nearestRoad(912,250,30);const near=[];for(const e of edges){if(!e.r)continue;for(let j=1;j<e.pts.length/2;j++){const x0=e.pts[2*j-2],y0=e.pts[2*j-1];if(Math.abs(x0-912)<60&&Math.abs(y0-250)<40){near.push([e.r.n,e.r.h,e.r.w,Math.round(x0),Math.round(y0)]);break}}}
  return JSON.stringify({quer:out.join(' '),naechste:n&&[n.e.r.n,n.e.r.h,n.d.toFixed(1)],kanten:near})}));await b.close()})();
