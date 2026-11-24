const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1200,height:1000},colorScheme:process.env.DARK?'dark':'light'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/cdn\.jsdelivr\.net\/npm\/jsqr/,r=>r.fulfill({path:path.join(__dirname,'../qrlib/node_modules/jsqr/dist/jsQR.js'),contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
const html=fs.readFileSync(__dirname+'/../klassenuebersicht/klassenuebersicht.html','utf8');
await p.goto('http://localhost:8768/index.html');
await p.waitForTimeout(500);
// Klasse anlegen und Code auf den Spielcode 9C-K7QS setzen (gleiche Prüfsumme)
await p.fill('#kName','9C');await p.click('#fK button[type=submit]');
const gen=await p.textContent('#kInfo .code');
await p.evaluate(()=>{const a=JSON.parse(localStorage.getItem("pc-klassen"));a.push({typ:"klasse",code:"9C-K7QS",name:"9C",id:"k_9C-K7QS",angelegt:Date.now()});localStorage.setItem("pc-klassen",JSON.stringify(a))});
await p.goto('http://localhost:8768/index.html');await p.waitForTimeout(500);
await p.setInputFiles('#fBilder',[__dirname+'/klasse_dlg.png']);await p.waitForTimeout(2500);
const m=await p.textContent('#msg');
await p.fill('#tCode','PC1.kaputt.123');await p.click('#bCode');await p.waitForTimeout(300);const m2=await p.textContent('#msg');
const rows=await p.$$eval('#tb tr',r=>r.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
console.log(JSON.stringify({gen,m,m2,rows,errs}));await p.screenshot({path:__dirname+'/lehrer'+(process.env.DARK?'_dark':'')+'.png',fullPage:true});
await p.setViewportSize({width:400,height:900});await p.screenshot({path:__dirname+'/lehrer_handy.png',fullPage:true});
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);console.log('scrollWidth',sw);await b.close()})();
