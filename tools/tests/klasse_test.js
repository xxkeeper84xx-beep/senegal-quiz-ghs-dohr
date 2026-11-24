const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:900,height:900}})).newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.route(/cdnjs.cloudflare.com\/ajax\/libs\/three/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('Lina',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play',null,{timeout:900000});
const r=await p.evaluate(()=>{const g="9C",A="ABCDEFGHJKMNPQRSTUVWXYZ23456789",body=g+"-K7Q",code=body+klCheckChar(body);
  // falsche Antworten simulieren: Aufgabe mit gesuchter Hypotenuse a=6,b=8 → c=10
  showTask({a:6,b:8,c:10,unk:"c",ans:10,yes:false,tries:0,solved:false,deliver:"Weiter",lab:{a:"a",b:"b",c:"c"},q:"Test",pic:"",kind:"num"});
  const tryV=v=>{$("ans").value=v;$("dNum").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}))};tryV("14");tryV("100");try{closeDlg()}catch(e){}
  klOpen();$("klIn").value="9c-k7qx";$("klSave").click();const m1=$("klMsg").textContent;$("klIn").value=code.toLowerCase();$("klSave").click();
  return {code,falsch:m1,ok:$("klMsg").textContent,err:save.klErr,fc:klCode()}});
console.log('test',JSON.stringify(r));await p.waitForTimeout(3000);await p.screenshot({path:__dirname+'/klasse_dlg.png'});console.log('ERR',errs.slice(0,4));await b.close()})();
