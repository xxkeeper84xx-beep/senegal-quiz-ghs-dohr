const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');const errs=[];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:1000,height:820}})).newPage();
p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route(/cdnjs.cloudflare.com\/ajax\/libs\/three/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('Lina',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play',null,{timeout:900000});
const sub=async v=>p.evaluate(v=>{$("ans").value=v;$("dNum").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}))},v);
const R={};
// 1) Hypotenuse: Strecken addiert
R.hyp=await p.evaluate(()=>{const t=lnMkTask("f_len",1);showTask(t);return {a:t.sk.a,b:t.sk.b,ans:t.ans}});await sub(String(R.hyp.a+R.hyp.b));
R.hyp.hint=await p.evaluate(()=>$("dHint").innerText.slice(0,160));await p.screenshot({path:__dirname+'/ln_fehler.png'});
await sub(String(R.hyp.a**2+R.hyp.b**2));R.hyp.hint2=await p.evaluate(()=>$("dHint").innerText.slice(0,90));
// 2) Kathete: addiert statt subtrahiert
R.leg=await p.evaluate(()=>{closeDlg();const t=lnMkTask("f_reach",2);showTask(t);return {plus:t.err.plus}});await sub(String(Math.round(R.leg.plus*100)/100));R.leg.hint=await p.evaluate(()=>$("dHint").innerText.slice(0,120));
// 3) 3D: nur Flächendiagonale
R.raum=await p.evaluate(()=>{closeDlg();const t=lnMkTask("k_kiste",2);showTask(t);return {face:t.err.face,ans:t.ans}});await sub(String(Math.round(R.raum.face*100)/100));
R.raum.hint=await p.evaluate(()=>$("dHint").innerText.slice(0,110));await p.evaluate(()=>{$("bNotes").click();$("lnNotesT").value="e² = 40² + 30²";$("lnNotesT").oninput()});await p.screenshot({path:__dirname+'/ln_3d.png'});
R.notiz=await p.evaluate(()=>{$("lnNotes").hidden=true;closeDlg();return save.notiz});
// 4) Maßband
R.mass=await p.evaluate(()=>{setVehicle('walk');lnTape();const x=car.x,y=car.y;car.x=x+30;car.y=y+40;for(let i=0;i<8;i++)update(1/30);return $("lnTapeV").innerText.replace(/\n/g," | ")});
await p.evaluate(()=>{render3D(1/30,performance.now());$('toast').style.opacity=0});await p.screenshot({path:__dirname+'/ln_massband.png'});await p.evaluate(()=>lnTapeOff());
// 5) Challenge
R.ch=await p.evaluate(()=>{const body="9C-K7Q";save.klasse=body+klCheckChar(body);const w=String(lnWeek()).padStart(2,"0"),code="R"+w+"-"+lnChCheck(save.klasse,"R"+w);klOpen();$("lnChIn").value=code;$("lnChSave").click();
  const t1=lnMkTask("k_raum",2,{ch:true});showTask(t1);$("ans").value=String(t1.ans);$("dNum").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}));
  const t2=lnMkTask("f_len",2);closeDlg();showTask(t2);$("ans").value=String(t2.ans);$("dNum").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}));closeDlg();return {code,aktiv:!!lnChAktiv(),pkt:save.klCh}});
// 6) Prüfung: abwechselnd richtig/falsch
await p.evaluate(()=>lnExamStart());
for(let i=0;i<10;i++){await p.evaluate(i=>{const t=cur;if(!t||!t.exam)return;const ok=i%3!==1;
  if(t.kind==="num"){$("ans").value=String(ok?Math.round(t.ans*10)/10:(t.err&&t.err.sum)||t.ans*2);$("dNum").dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}))}
  else if(t.kind==="yn"){judge(ok)}else if(t.kind==="mc"){const k=t.options.findIndex(o=>ok?o.ok:!o.ok);document.querySelector(`[data-mc="${k}"]`).click()}else judge(ok)},i);await p.waitForTimeout(700)}
R.exam=await p.evaluate(()=>({ex:save.exams,res:!$("lnExRes").hidden}));await p.screenshot({path:__dirname+'/ln_pruefung.png'});
R.code=await p.evaluate(()=>{const P=klPayload();return {ch:P.ch,ex:P.ex,e:P.e}});
fs.writeFileSync(__dirname+'/ln_code.txt',await p.evaluate(()=>klCode()));console.log(JSON.stringify(R,null,0));console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
