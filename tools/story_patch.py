# ------------------------------------------------------------ Spieler, Startbildschirm, Missionen, Verstöße (story.js)
R('const persist=()=>{try{localStorage.setItem("pyCity",JSON.stringify(save))}catch(e){}};', 'let SAVE_KEY="pyCity";const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}};')
R('desc:"Leise und wendig, ideal für die Fußgängerzone."', 'desc:"Leise und wendig. Aber Achtung: Der E-Scooter gehört auf die Straße, nicht auf den Gehweg!"')
R('for(const q of QUESTS){const s=qs(q);L.push({x:q.giver.x', 'for(const q of QUESTS){const s=qs(q);if(questLocked(q)){L.push({x:q.giver.x,y:q.giver.y,r:3.4,label:`💬 ${q.giver.name} ansprechen`,act:()=>lockedTalk(q)});continue}L.push({x:q.giver.x')
R('$("loading").hidden=true; $("start").hidden=false; state.mode="start";', '$("loading").hidden=true; applyLook(); renameQuests(); buildIntroMark(); buildEggs(); refreshQuestWorld(); showTitle("press"); setTimeout(initGlbCrowd,1500);')
R('<div class="hud" id="toast"></div>', '<div class="hud" id="toast"></div>\n<div class="hud" id="warn" hidden></div>\n<div id="banner" hidden></div>\n<div id="title" hidden></div>')
R('/* ================= Start ================= */', open(os.path.join(os.path.dirname(gfx),'story.js'), encoding="utf-8").read() + '\n/* ================= Start ================= */')
R('/* ================= Start ================= */', open(os.path.join(os.path.dirname(gfx),'extras.js'), encoding="utf-8").read() + '\n/* ================= Start ================= */')
R('/* ================= Start ================= */', open(os.path.join(os.path.dirname(gfx),'more.js'), encoding="utf-8").read() + '\n/* ================= Start ================= */')
R('  let maxF=VH.max, acc=VH.acc;','  let maxF=VH.max*(VH.id!=="walk"&&xOn("turbo")?1.12:1), acc=VH.acc;')
R('maxF=(boost||car.hold>1.4)?6.2:3.3}','maxF=((boost||car.hold>1.4)?6.2:3.3)*(xOn("shoes")?1.2:1)}')
R("</style>", """
/* --- Startbildschirm --- */
#title{position:fixed;inset:0;z-index:30;display:grid;grid-template-rows:auto 1fr auto;box-sizing:border-box;padding:calc(28px + env(safe-area-inset-top,0px)) calc(32px + env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) calc(36px + env(safe-area-inset-left,0px));
  background:linear-gradient(90deg,rgba(4,6,14,.8),rgba(4,6,14,.45) 38%,rgba(4,6,14,0) 66%),linear-gradient(0deg,rgba(4,6,14,.75),rgba(4,6,14,0) 26%);color:#fff;overflow:auto}
#title .tlogo{padding-top:clamp(14px,3.4vw,40px)}
#title .logo{font-family:var(--display);font-size:clamp(46px,8.4vw,104px);line-height:.84;text-transform:uppercase;color:#fff;-webkit-text-stroke:2.5px #000;paint-order:stroke fill;text-shadow:4px 6px 0 #000;transform:rotate(-4deg);transform-origin:left bottom;display:inline-block}
#title .logo span{display:block;color:var(--accent);font-size:1.2em}
#title .sub{margin-top:16px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;font-size:13px;color:#dfe3f5;text-shadow:0 2px 0 #000}
#title .menu{align-self:center;display:flex;flex-direction:column;gap:2px;max-width:440px;margin:18px 0}
#title .menu>button{background:none;box-shadow:none;border-radius:0;text-align:left;font-family:var(--display);font-size:clamp(21px,2.7vw,30px);font-weight:400;color:#c9cde0;padding:7px 0 7px 16px;border-left:5px solid transparent;text-shadow:0 3px 0 #000;transition:color .15s,border-color .15s,padding .15s;min-height:44px}
#title .menu>button small{display:block;font-family:var(--body);font-weight:500;font-size:13px;color:#b4bad6;margin-top:3px;text-shadow:0 1px 0 #000}
#title .menu>button:hover,#title .menu>button:focus-visible{color:#fff;border-left-color:var(--accent);padding-left:22px;outline:none}
#title .menu>button.press{animation:tblink 1.5s infinite;border-left-color:var(--accent)}
@keyframes tblink{50%{opacity:.4}}
#title .tpanel{background:rgba(10,13,28,.88);border-radius:14px;padding:18px 18px 16px;box-shadow:0 0 0 1.5px var(--line);max-width:430px;-webkit-user-select:text;user-select:text}
#title .tpanel h3{font-family:var(--display);font-weight:400;font-size:22px;margin:0 0 12px;color:var(--accent)}
#title .nm{display:block;font-weight:700;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em}
#title input{display:block;width:100%;box-sizing:border-box;margin-top:6px;font:700 22px var(--body);padding:10px 12px;border-radius:10px;border:0;background:#fff;color:var(--ink);-webkit-user-select:text;user-select:text}
#title .err{color:var(--bad);font-size:14px;min-height:18px;margin:6px 0 2px;font-weight:700}
#title .sw{display:flex;align-items:center;gap:6px;margin:6px 0 10px;flex-wrap:wrap}
#title .sw span{width:100%;margin-bottom:-2px;font-size:13px;color:var(--muted);font-weight:700}
#title .sw button{width:34px;height:34px;padding:0;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.3)}
#title .sw button.on{box-shadow:0 0 0 3px var(--accent),inset 0 0 0 2px #000}
#title .figs{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}
#title .figs span{width:100%;font-size:13px;color:var(--muted);font-weight:700}
#title .figs button{padding:6px 10px;font-size:13px;border-radius:999px}
#title .figs button.on{background:var(--grad);color:#fff;border-color:transparent;box-shadow:var(--glow)}
#title .figs button.locked{opacity:.62}
#title .figs button.locked.on{opacity:1}
#title .lockinfo{font-size:13px;color:#FFB36B;margin:0 0 8px;line-height:1.4}
#title .fpanel{max-width:560px}
#title .fsub{font-size:13.5px;color:var(--muted);margin:0 0 10px;line-height:1.45}
#title .fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px;max-height:min(52vh,420px);overflow:auto;padding:2px}
#title .fcard{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:10px;border-radius:14px;min-height:96px}
#title .fcard i{font-style:normal;font-size:26px;line-height:1}
#title .fcard b{font-size:14px}
#title .fcard small{font-size:11.5px;color:var(--muted);font-weight:600}
#title .fcard small.ok{color:var(--good)}
#title .fcard.locked i{filter:grayscale(1);opacity:.6}
#title .fcard.on{border-color:var(--cyan);box-shadow:var(--glowc)}
#title .fbar{display:block;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:2px}
#title .fbar em{display:block;height:100%;background:var(--grad)}
#title .fbar.t em{background:linear-gradient(90deg,#00F0FF,#3CFFB4)}
#title .note{font-size:13px;color:var(--good);margin:8px 0 0}
#title .row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
#title .prow{display:flex;gap:6px;margin-bottom:6px}
#title .prow button:first-child{flex:1;text-align:left;font-size:17px}
#title .prow small{display:block;font-weight:500;font-size:12.5px;color:var(--muted);margin-top:2px}
#title .prow i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:8px;box-shadow:0 0 0 1.5px #fff}
#title .del{color:var(--bad);min-width:46px}
#title .tfoot{display:flex;justify-content:space-between;align-items:flex-end;gap:12px 20px;flex-wrap:wrap}
#title .tip{background:rgba(10,13,28,.82);padding:10px 14px;border-radius:10px;max-width:540px;font-size:14px;box-shadow:0 0 0 1.5px var(--line)}
#title .tip b{font-family:var(--display);font-weight:400;color:var(--accent);margin-right:6px}
#tipTxt{transition:opacity .35s}
#title .credit{font-size:11.5px;color:#b4bad6;text-shadow:0 1px 2px #000}
#title[data-view=create]{background:linear-gradient(90deg,rgba(4,6,14,.85),rgba(4,6,14,.5) 42%,rgba(4,6,14,0) 64%),linear-gradient(0deg,rgba(4,6,14,.6),rgba(4,6,14,0) 22%)}
body.title-on .hud,body.title-on #btnMore,body.title-on #topbtns,body.title-on #touch,body.title-on #btnExit{visibility:hidden!important}
@media (max-width:760px){#title{padding:calc(18px + env(safe-area-inset-top,0px)) 16px calc(14px + env(safe-area-inset-bottom,0px));background:linear-gradient(0deg,rgba(4,6,14,.85),rgba(4,6,14,.35) 60%,rgba(4,6,14,.5))}#title .tip{font-size:13px}}
/* --- Missions-Banner und Verwarnungen --- */
#banner{position:fixed;left:50%;top:42%;transform:translate(-50%,-50%);z-index:15;text-align:center;pointer-events:none;transition:opacity .5s;width:min(94vw,920px);padding:18px 0}
#banner::before{content:"";position:absolute;inset:0 -6%;background:linear-gradient(90deg,transparent,rgba(0,0,0,.6) 18%,rgba(0,0,0,.6) 82%,transparent);z-index:-1}
#banner b{display:block;font-family:var(--display);font-weight:400;font-size:clamp(34px,6.4vw,78px);text-transform:uppercase;-webkit-text-stroke:2px #000;paint-order:stroke fill;text-shadow:3px 5px 0 #000;line-height:1}
#banner.ok b{color:var(--accent)} #banner.bad b{color:var(--bad)} #banner.new b{color:#fff;font-size:clamp(26px,4.4vw,52px)}
#banner span{display:block;font-family:var(--display);font-size:clamp(18px,2.6vw,28px);color:#fff;margin-top:10px;text-shadow:0 3px 0 #000}
#banner small{display:block;font-weight:700;font-size:16px;margin-top:8px;color:#eef1ff;text-shadow:0 2px 0 #000;padding:0 12px}
#warn{left:50%;transform:translateX(-50%);top:calc(60px + env(safe-area-inset-top,0px));background:rgba(120,14,26,.9);color:#fff;border-radius:999px;padding:6px 14px;font-family:var(--display);font-size:16px;letter-spacing:.12em;box-shadow:0 0 0 1.5px var(--bad);white-space:nowrap}
#warn small{font-family:var(--body);font-weight:700;font-size:11px;letter-spacing:.08em;margin-left:8px;text-transform:uppercase}
@media (max-width:760px){#warn{top:calc(118px + env(safe-area-inset-top,0px))}}
.hsec{font-family:var(--display);font-weight:400;font-size:17px;margin:20px 0 0;color:var(--ink);letter-spacing:.03em}
.hsec:first-child{margin-top:4px}
/* --- Extras --- */
.xgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin:12px 0}
.xcard{background:#fff;border-radius:12px;padding:12px;box-shadow:inset 0 0 0 1.5px #d4d9f3;display:flex;flex-direction:column;gap:4px}
.xcard .xi{font-size:34px;line-height:1}
.xcard b{font-size:15px}
.xcard small{color:#56609a;font-size:12.5px;line-height:1.35}
.xcard.locked{background:#eef0fa}
.xcard.locked b{color:#8a90b4}
.xcard .row{margin-top:auto;padding-top:6px;gap:6px}
.xcard .row button{padding:7px 12px;font-size:13.5px}
.nsw{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;vertical-align:-1px;box-shadow:0 0 0 1.5px #1a2147}
#talkLater{margin-left:8px}
/* --- Smartphone --- */
#btnPhone{position:fixed;z-index:7;left:calc(115px + env(safe-area-inset-left,0px));top:calc(58px + env(safe-area-inset-top,0px));width:48px;height:44px;padding:0;font-size:22px;background:var(--panel);border-radius:12px}
#pBadge{position:absolute;top:-6px;right:-6px;background:var(--bad);color:#fff;font:700 11px var(--body);min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;box-sizing:border-box}
@media (max-width:760px){#btnPhone{left:calc(12px + env(safe-area-inset-left,0px));top:calc(108px + env(safe-area-inset-top,0px))}}
body.title-on #btnPhone,body.title-on #pnote{visibility:hidden}
#pnote{position:fixed;z-index:16;top:calc(12px + env(safe-area-inset-top,0px));right:calc(160px + env(safe-area-inset-right,0px));background:rgba(10,13,28,.94);color:#fff;padding:10px 14px;border-radius:14px;font-weight:700;font-size:14px;box-shadow:0 0 0 1.5px var(--cyan);transition:opacity .4s;pointer-events:none}
@media (max-width:760px){#pnote{right:12px;left:12px;top:calc(160px + env(safe-area-inset-top,0px));text-align:center}}
#fadeBlk{position:fixed;inset:0;background:#000;z-index:40;transition:opacity .45s;opacity:0;pointer-events:none}
#phone{align-items:center}
.phonebox{width:min(360px,94vw);height:min(720px,calc(var(--vvh,100vh) - 36px));background:#0b0e1c;border-radius:38px;box-shadow:0 0 0 9px #1c2033,0 0 0 11px #3a4060,0 30px 80px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;color:#fff;position:relative;flex:none}
.pstat{display:flex;justify-content:space-between;align-items:center;padding:10px 22px 6px;font:700 13px var(--body)}
.pnotch{width:90px;height:22px;background:#000;border-radius:12px}
#phScreen{flex:1;overflow:auto;display:flex;flex-direction:column;-webkit-user-select:text;user-select:text}
.phome{padding:4px 0 8px;display:flex;justify-content:center}
.phome button{width:160px;height:30px;padding:0;background:transparent;box-shadow:none;min-height:0}
.phome button::after{content:"";display:block;margin:0 auto;width:130px;height:6px;border-radius:3px;background:#e8eaf5}
.pwall{padding:28px 20px 16px;text-align:center}
.pclock{font:400 58px var(--display);line-height:1}
.pdate{font-size:13px;color:#b4bad6;margin-top:6px}
.pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 6px;padding:14px}
.pgrid button{background:none;box-shadow:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11.5px;font-weight:500;color:#e8eaf5;min-height:0}
.pgrid i{position:relative;width:58px;height:58px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-size:28px;font-style:normal;box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)}
.pgrid i b{position:absolute;top:-5px;right:-5px;background:var(--bad);font:700 11px var(--body);min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff}
.pgrid span{text-align:center;line-height:1.2}
.ptitle{display:flex;align-items:center;gap:6px;padding:4px 12px 8px;font:400 18px var(--display);color:var(--accent);border-bottom:1px solid #222846}
.ptitle button{background:none;box-shadow:none;font-size:30px;line-height:1;padding:0 10px;color:#fff;min-height:40px}
.pbody{padding:12px 14px;flex:1}
.plist{display:flex;flex-direction:column;gap:6px}
.plist button{display:flex;align-items:center;gap:12px;text-align:left;background:#161b33;box-shadow:none;padding:10px 12px;border-radius:14px;color:#fff;font-size:15px}
.plist button.on{box-shadow:0 0 0 2px var(--accent)}
.plist button:disabled{opacity:.65;cursor:default}
.plist i{width:42px;height:42px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:22px;font-style:normal}
.plist span{flex:1;display:flex;flex-direction:column;min-width:0}
.plist small{font-weight:500;font-size:12px;color:#aab0cc;margin-top:2px;line-height:1.3}
.plist em{font-style:normal}
.psmall{font-size:12.5px;color:#aab0cc;margin:12px 2px}
.pcall{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:18px;gap:4px}
.pcall>i{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:48px;font-style:normal}
.pcall h4{margin:10px 0 0;font:400 22px var(--display)}
.pstate{color:#aab0cc;font-size:13px}
.pbubble{background:#1d2444;border-radius:16px 16px 16px 4px;padding:12px 14px;margin:14px 0 4px;text-align:left;font-size:15px;line-height:1.45;align-self:stretch}
.pdots{display:flex;gap:7px;margin:26px}.pdots span{width:10px;height:10px;border-radius:50%;background:#3ddc84;animation:tblink 1s infinite}.pdots span:nth-child(2){animation-delay:.2s}.pdots span:nth-child(3){animation-delay:.4s}
.phang{background:#d8343f;color:#fff;box-shadow:none;border-radius:999px;padding:12px 24px;margin:14px 0 6px}
.pacts{display:flex;flex-direction:column;gap:6px;align-self:stretch;margin-top:6px}
.pacts button{text-align:left;background:#161b33;color:#fff;box-shadow:none;padding:9px 12px;border-radius:12px;display:flex;flex-direction:column;font-size:14.5px}
.pacts small{font-weight:500;font-size:11.5px;color:#aab0cc;margin-top:3px;font-family:var(--mono)}
.pacts small b{color:var(--accent)}
.pmsgs{display:flex;flex-direction:column;gap:8px}
.pm{background:#161b33;border-radius:14px;padding:10px 12px}
.pm.new{box-shadow:inset 3px 0 0 var(--cyan)}
.pm b{font-size:14px}.pm small{float:right;color:#aab0cc;font-size:11px}.pm p{margin:5px 0 0;font-size:14px;line-height:1.4;color:#e8eaf5}
.pcalc{display:flex;flex-direction:column;gap:10px}
.pcalc label{display:flex;flex-direction:column;font-size:12px;font-weight:700;color:#aab0cc;gap:4px}
.pcalc input{font:700 20px var(--mono);padding:8px 10px;border-radius:10px;border:0;background:#fff;color:var(--ink)}
.pseg{display:flex;background:#161b33;border-radius:12px;padding:3px}
.pseg button{flex:1;background:none;box-shadow:none;color:#aab0cc;padding:8px;font-size:13px}
.pseg button.on{background:var(--accent);color:var(--ink)}
.pcout{font:500 13.5px var(--mono);line-height:1.7;background:#161b33;border-radius:12px;padding:10px 12px;min-height:20px}
.pcout b{color:var(--accent);font-size:18px}
.pbody h5{margin:14px 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#aab0cc}
.pguest{display:flex;gap:6px;margin-top:10px}.pguest input{flex:1;min-width:0;font:700 16px var(--body);padding:8px 10px;border-radius:10px;border:0}
.perr{color:var(--bad);font-size:13px;font-weight:700;margin:6px 0}
.pduo{display:flex;align-items:center;justify-content:space-around;background:#161b33;border-radius:14px;padding:12px;margin-bottom:10px;font-weight:700}
.pduo div{display:flex;flex-direction:column;align-items:center;gap:4px}.pduo i{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal}
.pduo span{font-size:24px}
.pwide{width:100%;margin-top:10px;background:#161b33;color:#fff;box-shadow:none}

</style>""")
