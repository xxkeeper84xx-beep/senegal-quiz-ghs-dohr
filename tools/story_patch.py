# ------------------------------------------------------------ Spieler, Startbildschirm, Missionen, Verstöße (story.js)
R('const persist=()=>{try{localStorage.setItem("pyCity",JSON.stringify(save))}catch(e){}};', 'let SAVE_KEY="pyCity";const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}};')
R('desc:"Leise und wendig, ideal für die Fußgängerzone."', 'desc:"Leise und wendig. Aber Achtung: Der E-Scooter gehört auf die Straße, nicht auf den Gehweg!"')
R('for(const q of QUESTS){const s=qs(q);L.push({x:q.giver.x', 'for(const q of QUESTS){const s=qs(q);if(questLocked(q)){L.push({x:q.giver.x,y:q.giver.y,r:3.4,label:`💬 ${q.giver.name} ansprechen`,act:()=>lockedTalk(q)});continue}L.push({x:q.giver.x')
R('$("loading").hidden=true; $("start").hidden=false; state.mode="start";', '$("loading").hidden=true; applyLook(); renameQuests(); buildIntroMark(); buildEggs(); refreshQuestWorld(); showTitle("press");')
R('<div class="hud" id="toast"></div>', '<div class="hud" id="toast"></div>\n<div class="hud" id="warn" hidden></div>\n<div id="banner" hidden></div>\n<div id="title" hidden></div>')
R('/* ================= Start ================= */', open(os.path.join(os.path.dirname(gfx),'story.js'), encoding="utf-8").read() + '\n/* ================= Start ================= */')
R('/* ================= Start ================= */', open(os.path.join(os.path.dirname(gfx),'extras.js'), encoding="utf-8").read() + '\n/* ================= Start ================= */')
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
</style>""")
