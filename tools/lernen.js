/* ================= Lernen (24.11.): Fehlerrückmeldung, Werkzeuge, 3D-Pythagoras, Prüfungsmodus, Wochen-Challenge =================
   1. Fehlerrückmeldung: Bei einer falschen Zahl erkennt das Spiel den typischen Fehler (Strecken addiert, Wurzel vergessen,
      Plus/Minus vertauscht, nur Flächendiagonale, Rundung, unmöglicher Wert) und erklärt ihn mit den Zahlen der Aufgabe.
   2. Werkzeuge: Notizheft (Rechenweg mitschreiben, je Spielstand gespeichert) und Maßband (Startpunkt setzen, laufen,
      Δx, Δy und die Strecke √(Δx² + Δy²) live ablesen).
   3. 3D-Pythagoras: Raumdiagonale in Kisten, Containern und Räumen (Skizze als Quader), auch „Passt der Stab hinein?“.
   4. Prüfungsmodus: 10 Aufgaben, 15 Minuten, keine Tipps, ein Versuch je Aufgabe, Auswertung mit Lösungswegen.
   5. Wochen-Challenge: Code der Lehrkraft (Thema + Kalenderwoche), Challenge-Aufgaben sammeln Punkte für die Klasse. */
const LN={};
const lnNum=x=>parseFloat(String(x).trim().replace(",",".").replace(/\s/g,""));
const lnF=v=>fmt(Math.round(v*100)/100);

/* ---------- 3D-Aufgaben (Quader) ---------- */
function lnBoxSVG(t){const B=t.box,W=360,H=250,l=B.l,b=B.b,h=B.h,k=Math.min(170/(l+b*.55),150/(h+b*.45)),L=l*k,D=b*k*.55,Hh=h*k,ox=(W-L-D)/2,oy=(H+Hh+D*.8)/2;
  const P=(x,y,z)=>[ox+x*L+z*D,oy-y*Hh-z*D*.8];const v={A:P(0,0,0),B:P(1,0,0),C:P(1,0,1),Dd:P(0,0,1),E:P(0,1,0),F:P(1,1,0),G:P(1,1,1),Hh:P(0,1,1)};
  const ink="#1a2147",hot="#e2384d",blu="#2f6fd8",ln=(p,q,c=ink,w=2.5,d="")=>`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d?`stroke-dasharray="${d}"`:""}/>`;
  const tx=(p,s,dx,dy,c=ink,a="middle")=>`<text x="${p[0]+dx}" y="${p[1]+dy}" text-anchor="${a}" font-family="JetBrains Mono,monospace" font-size="13" font-weight="700" fill="${c}">${s}</text>`;
  let o=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Skizze eines Quaders mit Raumdiagonale"><polygon points="${v.A} ${v.B} ${v.F} ${v.E}" fill="#ffc933" fill-opacity=".12"/>`;
  o+=ln(v.A,v.Dd,"#8a90b8",1.6,"5 5")+ln(v.Dd,v.C,"#8a90b8",1.6,"5 5")+ln(v.Dd,v.Hh,"#8a90b8",1.6,"5 5");
  for(const [p,q] of [[v.A,v.B],[v.B,v.C],[v.A,v.E],[v.B,v.F],[v.C,v.G],[v.E,v.F],[v.F,v.G],[v.G,v.Hh],[v.Hh,v.E]])o+=ln(p,q);
  o+=ln(v.A,v.C,blu,3,"8 5")+ln(v.A,v.G,hot,4,"10 6");
  o+=tx([(v.A[0]+v.B[0])/2,(v.A[1]+v.B[1])/2],B.lab.l,0,18)+tx([(v.B[0]+v.C[0])/2,(v.B[1]+v.C[1])/2],B.lab.b,8,12,ink,"start")+tx([(v.B[0]+v.F[0])/2,(v.B[1]+v.F[1])/2],B.lab.h,8,4,ink,"start");
  o+=tx([(v.A[0]+v.C[0])/2,(v.A[1]+v.C[1])/2],"e",-4,16,blu)+tx([(v.A[0]+v.G[0])/2,(v.A[1]+v.G[1])/2],B.lab.d,-10,-8,hot,"end");
  if(B.pic)o+=`<text x="12" y="28" font-size="26">${B.pic}</text>`;return o+"</svg>"}
{const base=triSVG;triSVG=function(t){return t&&t.box?lnBoxSVG(t):base(t)}}
function t3D(o){const e2=o.l*o.l+o.b*o.b,d2=e2+o.h*o.h,d=Math.sqrt(d2),u=o.u;
  return Object.assign({kind:"num",ans:d,unit:u,box:{l:o.l,b:o.b,h:o.h,lab:{l:`${fmt(o.l)} ${u}`,b:`${fmt(o.b)} ${u}`,h:`${fmt(o.h)} ${u}`,d:"d = ?"},pic:o.pic},
    steps:`1. Bodendiagonale: e² = ${AU.f(o.l)}² + ${AU.f(o.b)}² = ${AU.sq(o.l)} + ${AU.sq(o.b)} = ${AU.f(e2)}<br>2. Raumdiagonale: d² = e² + ${AU.f(o.h)}² = ${AU.f(e2)} + ${AU.sq(o.h)} = ${AU.f(d2)}<br>d = √${AU.f(d2)} ${AU.eq(d)} ${AU.hl(fmt(d)+" "+u)}<br><small>Kurz: d = √(l² + b² + h²)</small>`,
    hint:"Zwei Schritte: Erst die Diagonale <b>e</b> über den Boden (l² + b² = e²). Sie steht senkrecht auf der Höhe h. Dann bilden e, h und die Raumdiagonale d ein neues rechtwinkliges Dreieck: d² = e² + h². Kurz: d = √(l² + b² + h²).",
    err:{sum3:o.l+o.b+o.h,face:Math.sqrt(e2),face2:Math.sqrt(o.l*o.l+o.h*o.h),face3:Math.sqrt(o.b*o.b+o.h*o.h),sq:d2},r3d:true},o.x)}
const ln3dVals=(d,lo,hi)=>d===1?pick([[3,4,12],[2,3,6],[4,4,7],[1,2,2],[2,6,9]]).slice():d===2?[ri(lo,hi),ri(lo,hi),ri(lo,hi)]:[ri(lo*2,hi*2)/2,ri(lo*2,hi*2)/2,ri(lo*2,hi*2)/2];
AUFG.push(
 {id:"k_kiste",g:"tv",d:[2,3],make:d=>{const [l,b,h]=ln3dVals(d,3,8).map(v=>v*10);return t3D({l,b,h,u:"cm",pic:"📦",x:{title:"Der Stab im Karton",story:`Ein Karton ist innen <b>${fmt(l)} cm</b> lang, <b>${fmt(b)} cm</b> breit und <b>${fmt(h)} cm</b> hoch. Der Kunde will eine Gardinenstange darin verschicken.`,q:"Wie lang darf die Stange höchstens sein, damit sie schräg von unten vorn bis oben hinten hineinpasst?"}})}},
 {id:"k_container",g:"crane",d:[2,3],make:d=>{const l=pick([6,12]),b=2.4,h=d===2?2.4:2.6;return t3D({l,b,h,u:"m",pic:"🏗️",x:{title:"Rohre im Container",story:`Der Baucontainer ist innen <b>${fmt(l)} m</b> lang, <b>${fmt(b)} m</b> breit und <b>${fmt(h)} m</b> hoch.`,q:"Wie lang darf ein Rohr höchstens sein, damit es diagonal in den Container passt?"}})}},
 {id:"k_raum",g:"amt",d:[2,3],make:d=>{const [l,b]=d===2?[ri(7,10),ri(6,8)]:[ri(140,200)/20,ri(120,160)/20],h=d===2?3:ri(55,70)/20;return t3D({l,b,h,u:"m",pic:"🏫",x:{title:"Die längste Strecke im Klassenraum",story:`Ein Klassenraum ist <b>${fmt(l)} m</b> lang, <b>${fmt(b)} m</b> breit und <b>${fmt(h)} m</b> hoch. Eine Spinne krabbelt nicht – sie fliegt an einem Faden quer durch den Raum.`,q:"Wie lang ist der Weg von einer unteren Ecke zur gegenüberliegenden oberen Ecke?"}})}},
 {id:"k_passt",g:"tv",d:[2,3],make:d=>{const [l,b,h]=ln3dVals(2,2,6).map(v=>v*10),dd=Math.hypot(l,b,h),s=Math.round(dd+(Math.random()<.5?-1:1)*ri(2,6));const yes=s<=dd;
   const t=t3D({l,b,h,u:"cm",pic:"📦"});return Object.assign(t,{kind:"yn",yes,title:"Passt der Stab hinein?",story:`Eine Kiste ist <b>${fmt(l)} cm</b> lang, <b>${fmt(b)} cm</b> breit und <b>${fmt(h)} cm</b> hoch. Ein Stab ist <b>${s} cm</b> lang.`,q:"Passt der Stab (schräg) in die Kiste?",
     steps:t.steps+`<br>Vergleich: ${s} cm ${yes?"≤":">"} ${fmt(dd)} cm → <b>${yes?"passt":"passt nicht"}</b>`})}});
/* Ja/Nein-Knöpfe beschriften, je nachdem ob es um einen rechten Winkel oder ums Hineinpassen geht */
{const base=showTask;showTask=function(t){base(t);const B=document.querySelectorAll("#dYN [data-yn]");if(B.length===2){B[0].textContent=t.box?"Ja, passt":"Ja, rechtwinklig";B[1].textContent=t.box?"Nein, passt nicht":"Nein, nicht rechtwinklig"}
  if(!t.exam){$("bHint").hidden=false;$("bCancel").hidden=false}lnToolsInDlg()}}

/* ---------- 1. Fehlerrückmeldung ---------- */
function lnErrType(t,v){const near=(x,y,tol=.06)=>typeof y==="number"&&isFinite(y)&&Math.abs(x-y)<=Math.max(tol,Math.abs(y)*.004),E=t.err||{},S=t.sk||{};
  if(t.r3d){if(near(v,E.sum3))return "add";if(near(v,E.sq,.6))return "root";if(near(v,E.face)||near(v,E.face2)||near(v,E.face3))return "flaeche"}
  else if(S.unk==="c"){if(near(v,E.sum))return "add";if(near(v,E.sq,.6))return "root";if(near(v,Math.sqrt(Math.abs(S.a*S.a-S.b*S.b))))return "op"}
  else if(S.unk){if(near(v,E.plus))return "op";if(near(v,E.diff))return "add";if(near(v,E.sq,.6))return "root";const c=E.plus&&Math.sqrt(Math.max(0,(E.plus*E.plus+(E.sq||0))/2));if(c&&near(v,c+(S.b||0)))return "add"}
  if(near(v,t.ans,.6))return "round";return "other"}
function lnErrText(t,v,k){const u=t.unit||"",E=t.err||{},S=t.sk||{},hyp=S.unk==="c";
  const big=t.r3d?null:hyp?Math.max(S.a||0,S.b||0):null;
  switch(k){
    case "add":return t.r3d?`Du hast die drei Kanten einfach addiert (${lnF(E.sum3)} ${u}). Die Raumdiagonale ist kürzer als dieser Umweg über die Kanten. Rechne mit Quadraten: d² = l² + b² + h², dann die Wurzel.`
      :hyp?`Du hast die beiden Strecken einfach addiert: ${lnF(S.a)} + ${lnF(S.b)} = ${lnF(E.sum)}. Der Satz des Pythagoras gilt für die <b>Quadrate</b>: erst ${lnF(S.a)}² und ${lnF(S.b)}² ausrechnen, addieren, dann die Wurzel ziehen.`
      :`Du hast die Längen direkt voneinander abgezogen. Subtrahieren musst du die <b>Quadrate</b>: Hypotenuse² − Kathete², danach die Wurzel ziehen.`;
    case "root":return `Fast! ${lnF(v)} ist das <b>Quadrat</b> der gesuchten Länge. Es fehlt nur noch der letzte Schritt: Zieh die Wurzel aus deinem Ergebnis (Taste √ im Rechner).`;
    case "op":return hyp?`Du hast subtrahiert. Gesucht ist die <b>Hypotenuse</b> – die längste Seite. Dafür werden die Quadrate der Katheten <b>addiert</b>: c² = a² + b².`
      :`Du hast addiert – so bekommst du eine Länge, die länger ist als die Hypotenuse. Gesucht ist eine <b>Kathete</b>, sie ist immer kürzer. Rechne Hypotenuse² <b>minus</b> bekannte Kathete².`;
    case "flaeche":return `Das ist die Diagonale einer <b>Fläche</b> (${lnF(v)} ${u}). Die Raumdiagonale geht zusätzlich noch nach oben: Nimm diese Flächendiagonale und die dritte Kante als neue Katheten – d² = e² + h².`;
    case "round":return `Ganz knapp daneben – prüfe das Runden. Rechne mit allen Nachkommastellen weiter und runde erst am Ende auf eine Stelle (z. B. 7,07 → 7,1).`;
    default:if(big!=null&&v<=big)return `Das kann nicht stimmen: Die Hypotenuse ist immer <b>länger</b> als jede Kathete (hier länger als ${lnF(big)} ${u}). Prüf, ob du addiert hast und die Wurzel richtig gezogen ist.`;
      if(S.unk&&!hyp&&E.plus&&E.sq!=null&&v>=Math.sqrt((E.plus*E.plus+E.sq)/2))return `Das kann nicht stimmen: Eine Kathete ist immer <b>kürzer</b> als die Hypotenuse. Rechne Hypotenuse² − Kathete².`;
      return `Schreib die Formel zuerst auf und setze dann ein. Welche Seite ist gesucht – die Hypotenuse (gegenüber dem rechten Winkel) oder eine Kathete? Im Notizheft 📝 kannst du die Schritte mitschreiben.`}}
document.addEventListener("submit",e=>{try{const id=e.target&&e.target.id;
  if(id==="dNum"&&typeof cur!=="undefined"&&cur&&!cur.solved&&cur.kind==="num"){const v=lnNum($("ans").value);if(isNaN(v))return;const ok=Math.abs(v-cur.ans)<.051||Math.abs(v-Math.round(cur.ans*10)/10)<.001;
    cur.__err=null;if(!ok){const k=lnErrType(cur,v);cur.__err=k;cur.__v=v;klErr(k)}}
  if(id==="qForm"&&typeof curQ!=="undefined"&&curQ&&curQ.measures){const v=lnNum($("qAns").value);if(isNaN(v)||Math.abs(v-curQ.ans)<.051)return;const a=curQ.measures[0].val,b=curQ.measures[1].val;
    klErr(lnErrType({sk:{a,b,unk:"c"},err:{sum:a+b,sq:a*a+b*b},ans:curQ.ans},v))}}catch(err){console.warn("Fehlertyp",err)}},true);
/* nach der Bewertung: Erklärung zum erkannten Fehler über den allgemeinen Tipp setzen */
{const base=judge;judge=function(ok){if(cur&&cur.exam)return lnExamJudge(ok);const t=cur;base(ok);
  try{if(t&&!ok&&t.__err&&!t.solved){const h=$("dHint");h.innerHTML=`<div style="font-weight:700;margin-bottom:4px">🔎 ${({add:"Strecken statt Quadrate",root:"Wurzel vergessen",op:"Plus und Minus vertauscht",flaeche:"Nur eine Flächendiagonale",round:"Rundung",other:"Prüf dein Ergebnis"})[t.__err]}</div>${lnErrText(t,t.__v,t.__err)}<div style="margin-top:6px;opacity:.85">${hintHTML(t)}</div>`;h.hidden=false;t.__err=null}
    if(t&&t.solved)lnChallengeSolved(t)}catch(e){console.warn("Rückmeldung",e)}}}

/* ---------- 2a. Notizheft ---------- */
function lnNotes(){let d=$("lnNotes");if(!d){d=document.createElement("div");d.id="lnNotes";d.innerHTML=`<div class="lnh"><b>📝 Notizheft</b><span style="opacity:.75;font-size:12px">wird mit deinem Spielstand gespeichert</span><button type="button" id="lnNotesX" aria-label="Notizheft schließen">✕</button></div>
      <textarea id="lnNotesT" spellcheck="false" placeholder="c² = a² + b²&#10;c² = 6² + 8² = 36 + 64 = 100&#10;c = √100 = 10"></textarea>
      <div class="lnr"><button type="button" data-ins="²">²</button><button type="button" data-ins="√">√</button><button type="button" data-ins=" = ">=</button><button type="button" data-ins=" ≈ ">≈</button><button type="button" data-ins=" − ">−</button><button type="button" id="lnNotesClr">Leeren</button></div>`;document.body.appendChild(d);
    $("lnNotesX").onclick=()=>{d.hidden=true};const T=$("lnNotesT");T.oninput=()=>{save.notiz=T.value.slice(0,4000);persist()};
    d.querySelectorAll("[data-ins]").forEach(b=>b.onclick=()=>{const s=T.selectionStart??T.value.length;T.value=T.value.slice(0,s)+b.dataset.ins+T.value.slice(T.selectionEnd??s);T.focus();T.selectionStart=T.selectionEnd=s+b.dataset.ins.length;T.oninput()});
    $("lnNotesClr").onclick=()=>{if($("lnNotesClr").dataset.sure){T.value="";T.oninput();$("lnNotesClr").textContent="Leeren";delete $("lnNotesClr").dataset.sure}else{$("lnNotesClr").textContent="Wirklich leeren?";$("lnNotesClr").dataset.sure=1}}}
  $("lnNotesT").value=save.notiz||"";d.hidden=!d.hidden;if(!d.hidden&&!isTouch)$("lnNotesT").focus()}
function lnToolsInDlg(){const T=$("dTools");if(T&&!$("bNotes")){const b=document.createElement("button");b.type="button";b.id="bNotes";b.textContent="📝 Notizen";b.onclick=lnNotes;T.insertBefore(b,$("bCancel"))}}

/* ---------- 2b. Maßband ---------- */
const MB={on:false,s:null,line:null,mk:null};
function lnTape(){if(MB.on){lnTapeOff();return}MB.on=true;MB.s={x:car.x,y:car.y};
  if(!MB.line){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(new Float32Array(9),3));MB.line=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffc933,depthTest:false,transparent:true}));MB.line.renderOrder=20;MB.line.frustumCulled=false;scene.add(MB.line);
    MB.mk=new THREE.Mesh(new THREE.ConeGeometry(.18,.5,12),new THREE.MeshBasicMaterial({color:0xffc933}));MB.mk.rotation.x=Math.PI;scene.add(MB.mk)}
  MB.line.visible=MB.mk.visible=true;let h=$("lnTape");if(!h){h=document.createElement("div");h.id="lnTape";h.innerHTML=`<div id="lnTapeV" aria-live="off"></div><div class="lnr"><button type="button" id="lnTapeN">📍 Neu ansetzen</button><button type="button" id="lnTapeX">Maßband weg</button></div>`;document.body.appendChild(h);
    $("lnTapeN").onclick=()=>{MB.s={x:car.x,y:car.y}};$("lnTapeX").onclick=lnTapeOff}h.hidden=false;toast("📏 Maßband angesetzt","Lauf los – oben siehst du, wie weit du vom Startpunkt entfernt bist.","#ffc933")}
function lnTapeOff(){MB.on=false;if(MB.line)MB.line.visible=MB.mk.visible=false;if($("lnTape"))$("lnTape").hidden=true}
{const base=update;update=function(dt){base(dt);if(!MB.on||!MB.s)return;const dx=car.x-MB.s.x,dy=car.y-MB.s.y,d=Math.hypot(dx,dy),y0=groundY(MB.s.x,MB.s.y)+.08,y1=groundY(car.x,car.y)+.08;
  const a=MB.line.geometry.attributes.position.array;a.set([MB.s.x,y0,MB.s.y,car.x,y1,car.y,car.x,y1,car.y]);MB.line.geometry.attributes.position.needsUpdate=true;MB.mk.position.set(MB.s.x,y0+.55,MB.s.y);
  const V=$("lnTapeV");if(V&&(MB.k=(MB.k||0)+1)%4===0)V.innerHTML=`<b>📏 ${fmt(Math.round(d*10)/10)} m</b><span>Δx ${fmt(Math.round(Math.abs(dx)*10)/10)} m · Δy ${fmt(Math.round(Math.abs(dy)*10)/10)} m</span><small>Strecke = √(Δx² + Δy²)</small>`}}

/* ---------- 4. Prüfungsmodus ---------- */
const EX={on:false};
const EX_PLAN=[["f_len",2],["p_kite",2],["f_foot",2],["f_reach",2],["r_check",2],["e_tv",2],["b_rope",2],["r_which",2],["k_kiste",2],["p_shadow",2]];
function lnMkTask(id,d,extra){const v=AUFG.find(a=>a.id===id);if(!v)return null;const t=v.make(Math.max(d,v.d[0]));t.id=id;return Object.assign({deliver:"Weiter"},t,{tries:0,solved:false,diff:d,sel:[]},extra||{})}
function lnExamStart(){if(EX.on)return;const L=EX_PLAN.map(([id,d])=>lnMkTask(id,d,{exam:true})).filter(Boolean);if(!L.length)return;
  Object.assign(EX,{on:true,list:L,i:0,res:[],t0:Date.now(),lim:15*60e3});let bar=$("lnExBar");if(!bar){bar=document.createElement("div");bar.id="lnExBar";document.body.appendChild(bar)}bar.hidden=false;lnExamShow()}
function lnExamShow(){const t=EX.list[EX.i];t.tag=`Prüfung · Aufgabe ${EX.i+1} von ${EX.list.length}`;showTask(t);$("bHint").hidden=true;$("bCancel").hidden=true;$("bSol").hidden=true;lnExamBar()}
function lnExamBar(){const bar=$("lnExBar");if(!bar||!EX.on)return;const left=Math.max(0,EX.lim-(Date.now()-EX.t0)),m=Math.floor(left/60e3),s=Math.floor(left%60e3/1e3);
  bar.innerHTML=`<b>📝 Prüfung</b><span>Aufgabe ${EX.i+1}/${EX.list.length}</span><span class="${left<120e3?"lnw":""}">⏱ ${m}:${String(s).padStart(2,"0")}</span><button type="button" id="lnExAb">${EX.ab?"Wirklich abbrechen?":"Abbrechen"}</button>`;
  $("lnExAb").onclick=()=>{if(EX.ab){EX.ab=false;lnExamEnd(true)}else{EX.ab=true;lnExamBar();setTimeout(()=>{EX.ab=false;lnExamBar()},4000)}};if(!left)lnExamEnd(false)}
setInterval(()=>{if(EX.on)lnExamBar()},1000);
function lnExamJudge(ok){const t=cur;if(!t||t.solved)return;t.solved=true;t.tries=1;const v=t.kind==="num"?lnNum($("ans").value):null;
  EX.res.push({t,ok:!!ok,err:ok?null:(t.__err||(t.kind==="num"?"other":"other")),v});if(!ok&&t.__err)t.__err=null;
  $("dFb").className="fb";$("dFb").textContent="Antwort gespeichert.";setTimeout(()=>{if(!EX.on)return;EX.i++;if(EX.i>=EX.list.length)lnExamEnd(false);else lnExamShow()},450)}
function lnExamEnd(abort){if(!EX.on)return;EX.on=false;$("lnExBar").hidden=true;try{closeDlg()}catch(e){}
  const n=EX.list.length,p=EX.res.filter(r=>r.ok).length,sec=Math.round((Date.now()-EX.t0)/1e3),pct=Math.round(p/n*100);
  save.exams=(save.exams||[]).concat([{d:Math.floor(Date.now()/864e5),p,n,sec,ab:!!abort}]).slice(-10);save.xp+=p*5;persist();updateHud();
  const note=pct>=92?"sehr gut":pct>=81?"gut":pct>=67?"befriedigend":pct>=50?"ausreichend":pct>=30?"mangelhaft":"ungenügend";
  let d=$("lnExRes");if(!d){d=document.createElement("div");d.id="lnExRes";document.body.appendChild(d)}d.hidden=false;state.mode="menu";
  const names={add:"Strecken statt Quadrate",root:"Wurzel vergessen",op:"Plus/Minus vertauscht",flaeche:"Nur Flächendiagonale",round:"Rundung",other:"anderer Fehler"};
  d.innerHTML=`<div class="kp" role="dialog" aria-modal="true" aria-labelledby="lnExT"><h3 id="lnExT">📝 Auswertung${abort?" (abgebrochen)":""}</h3>
    <div class="lnScore"><b>${p} / ${n}</b><span>${pct} % · ${note}</span><span>Zeit: ${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")} min · +${p*5} XP</span></div>
    <ol class="lnList">${EX.list.map((t,i)=>{const r=EX.res[i];return `<li class="${r?r.ok?"ok":"bad":"skip"}"><b>${r?r.ok?"✓":"✗":"–"} ${t.title}</b>${r&&!r.ok&&r.err?` <span>(${names[r.err]})</span>`:""}${!r?" <span>(nicht bearbeitet)</span>":""}
      ${r&&r.ok?"":`<details><summary>Lösungsweg</summary><div class="steps">${t.steps||""}</div>${r&&r.err&&t.kind==="num"&&r.v!=null&&!isNaN(r.v)?`<div class="hint">${lnErrText(t,r.v,r.err)}</div>`:""}</details>`}</li>`}).join("")}</ol>
    <p style="font-size:13px;opacity:.8">Das Ergebnis steht in deinem Fortschrittscode (🏫 Klasse &amp; Fortschritt).</p>
    <div class="row" style="justify-content:flex-end"><button type="button" id="lnExOk">Fertig</button></div></div>`;
  $("lnExOk").onclick=()=>{d.hidden=true;state.mode="play"}}

/* ---------- 5. Wochen-Challenge ---------- */
const CH_THEMEN={L:{n:"Leitern und Rampen",ids:["f_len","f_foot","f_reach","f_truck","b_ramp","b_rope"]},U:{n:"Rechter Winkel? (Umkehrung)",ids:["r_check","r_which"]},R:{n:"3D-Pythagoras",ids:["k_kiste","k_container","k_raum","k_passt"]},M:{n:"Gemischt",ids:null}};
function lnWeek(t=Date.now()){const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()+3-(d.getDay()+6)%7);const w1=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-w1)/864e5-3+(w1.getDay()+6)%7)/7)}
function lnChCheck(k,b){return KL.ALPHA[klHash("PC-CH|"+klNorm(k)+"|"+b)%KL.ALPHA.length]}
function lnChParse(c,k){c=klNorm(c);const m=/^([LURM])(\d{2})-([A-Z0-9])$/.exec(c);if(!m||!klValid(k))return null;if(lnChCheck(k,m[1]+m[2])!==m[3])return null;return {code:c,t:m[1],w:+m[2],n:CH_THEMEN[m[1]].n}}
function lnChAktiv(){const c=save.klCh&&lnChParse(save.klCh.code,save.klasse);return c&&c.w===lnWeek()?c:null}
function lnChallengeSolved(t){const c=lnChAktiv();if(!c||t.__chCounted)return;const ids=CH_THEMEN[c.t].ids;if(ids&&!ids.includes(t.id))return;t.__chCounted=true;
  const pts=t.tries===1?3:1;save.klCh.p=(save.klCh.p||0)+pts;save.klCh.n=(save.klCh.n||0)+1;persist();toast(`🏆 +${pts} Challenge-Punkte`,`${c.n} · zusammen ${save.klCh.p} Punkte von dir für die Klasse`,"#ffc933")}
function lnChTask(){const c=lnChAktiv();if(!c)return;const ids=CH_THEMEN[c.t].ids||AUFG.map(a=>a.id).filter(id=>!/tap|name/.test(id));const id=pick(ids);const d=Math.max(2,AU.diff());
  const t=lnMkTask(id,d,{tag:`🏆 Wochen-Challenge · ${c.n}`,deliver:"Weiter",ch:true});if(t){if($("klDlg"))$("klDlg").hidden=true;showTask(t)}}
{const el=$("bGo");if(el){const base=el.onclick;el.onclick=function(e){if(cur&&(cur.ch||cur.exam)){$("dlg").hidden=true;state.mode="play";cur=null;checkLevel();return}return base.call(this,e)}}}
/* Klassen-Dialog erweitern: Challenge-Code, Challenge-Aufgabe, Prüfung starten */
{const base=klOpen;klOpen=function(){base();const kp=document.querySelector("#klDlg .kp");if(!kp||$("lnChBox"))return;const box=document.createElement("div");box.id="lnChBox";
  const c=lnChAktiv(),old=save.klCh&&!c&&save.klCh.code;
  box.innerHTML=`<hr style="border:0;border-top:1px solid rgba(255,255,255,.15);margin:14px 0">
    <h3 style="font-size:17px">🏆 Wochen-Challenge</h3>
    ${c?`<p><b>${c.n}</b> · KW ${c.w}<br>Deine Punkte: <b>${save.klCh.p||0}</b> (${save.klCh.n||0} Aufgaben). 1. Versuch richtig = 3 Punkte, sonst 1.</p><div class="row"><button type="button" id="lnChGo">Challenge-Aufgabe lösen</button></div>`
      :`<p>${old?"Die Challenge von letzter Woche ist vorbei. ":""}Trag den Challenge-Code von deiner Lehrkraft ein.</p>`}
    <label for="lnChIn"><small>Challenge-Code</small></label><input id="lnChIn" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="z. B. L48-K" maxlength="6">
    <div class="msg" id="lnChMsg" aria-live="polite"></div><div class="row"><button type="button" class="sec" id="lnChSave">Challenge-Code speichern</button></div>
    <hr style="border:0;border-top:1px solid rgba(255,255,255,.15);margin:14px 0">
    <h3 style="font-size:17px">📝 Prüfungsmodus</h3><p>10 Aufgaben, 15 Minuten, keine Tipps, ein Versuch pro Aufgabe. Taschenrechner und Notizheft sind erlaubt.</p>
    ${(save.exams||[]).length?`<p><small>Letzte Prüfung: ${save.exams[save.exams.length-1].p} von ${save.exams[save.exams.length-1].n} Punkten</small></p>`:""}
    <div class="row"><button type="button" id="lnExGo">Prüfung starten</button></div>`;
  kp.insertBefore(box,kp.lastElementChild);$("lnChIn").value=c?c.code:"";
  if($("lnChGo"))$("lnChGo").onclick=lnChTask;$("lnExGo").onclick=()=>{$("klDlg").hidden=true;lnExamStart()};
  $("lnChSave").onclick=()=>{const m=$("lnChMsg");if(!klValid(save.klasse)){m.className="msg bad";m.textContent="Trag zuerst oben den Klassencode ein.";return}
    const p=lnChParse($("lnChIn").value,save.klasse);if(!p){m.className="msg bad";m.textContent="Dieser Challenge-Code passt nicht zu deiner Klasse.";return}
    if(p.w!==lnWeek()){m.className="msg bad";m.textContent=`Dieser Code gilt für KW ${p.w}, jetzt ist KW ${lnWeek()}.`;return}
    if(!save.klCh||save.klCh.code!==p.code)save.klCh={code:p.code,p:0,n:0};persist();$("klDlg").hidden=true;klOpen()}}}
/* Fortschrittscode: Challenge und letzte Prüfung mitgeben */
{const base=klPayload;klPayload=function(){const P=base();const c=lnChAktiv();if(c)P.ch=[c.code,save.klCh.p||0,save.klCh.n||0];const x=(save.exams||[]).filter(e=>!e.ab).slice(-1)[0];if(x)P.ex=[x.p,x.n,x.d,x.sec];return P}}

/* ---------- Menüknöpfe und Aussehen ---------- */
{const tb=$("topbtns");if(tb){const mk=(id,t,f)=>{const b=document.createElement("button");b.type="button";b.id=id;b.textContent=t;b.onclick=f;tb.insertBefore(b,$("btnKlasse")?$("btnKlasse").nextSibling:null)};
  mk("btnExam","📝 Prüfungsmodus",()=>lnExamStart());mk("btnTape","📏 Maßband",()=>lnTape());mk("btnNotes","📒 Notizheft",()=>lnNotes())}}
{const st=document.createElement("style");st.textContent=`
#lnNotes{position:fixed;z-index:70;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));width:min(360px,calc(100vw - 24px));background:#1b1233;color:#fff;border:1px solid rgba(255,201,51,.5);border-radius:14px;padding:10px;font:14px/1.4 Rubik,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45)}
#lnNotes .lnh{display:flex;align-items:center;gap:8px;margin-bottom:6px}#lnNotes .lnh button{margin-left:auto}
#lnNotes textarea{width:100%;box-sizing:border-box;height:150px;resize:vertical;font:15px/1.45 ui-monospace,Menlo,monospace;background:#120b24;color:#fff;border:1px solid #6b5aa6;border-radius:8px;padding:8px}
#lnNotes button,#lnTape button,#lnExBar button{font:600 14px Rubik,system-ui,sans-serif;border:0;border-radius:8px;padding:8px 11px;min-height:40px;background:#2d2350;color:#fff;cursor:pointer}
.lnr{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
#lnTape{position:fixed;z-index:30;left:50%;transform:translateX(-50%);top:calc(110px + env(safe-area-inset-top,0px));background:rgba(22,11,40,.86);color:#fff;border:1px solid rgba(255,201,51,.55);border-radius:14px;padding:8px 12px;font:14px/1.35 Rubik,system-ui,sans-serif;text-align:center;max-width:calc(100vw - 24px)}
#lnTapeV b{display:block;font-size:22px;color:#ffc933}#lnTapeV span{display:block}#lnTapeV small{opacity:.75}
#lnExBar{position:fixed;z-index:62;left:0;right:0;top:0;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;padding:calc(8px + env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) 8px max(12px,env(safe-area-inset-left,0px));background:#2b0f3d;color:#fff;font:600 15px Rubik,system-ui,sans-serif;border-bottom:2px solid #ff2a85}
#lnExBar .lnw{color:#ffc933}
#lnExRes{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(8,6,20,.62);padding:16px}
#lnExRes .kp{width:min(520px,100%);max-height:90vh;overflow:auto;background:#1b1233;color:#fff;border:1px solid rgba(255,42,133,.45);border-radius:16px;padding:18px;font:15px/1.45 Rubik,system-ui,sans-serif}
#lnExRes h3{margin:0 0 8px}#lnExRes .lnScore{display:grid;gap:2px;margin-bottom:10px}#lnExRes .lnScore b{font-size:34px;color:#ffc933}
#lnExRes .lnList{padding-left:1.2em;display:grid;gap:6px}#lnExRes li.ok b{color:#3ddc84}#lnExRes li.bad b,#lnExRes li.skip b{color:#ff8b9a}#lnExRes li span{opacity:.8;font-size:13px}
#lnExRes .steps{background:rgba(255,255,255,.06);border-radius:8px;padding:8px;margin-top:6px}#lnExRes .hint{margin-top:6px}
#lnExRes button{font:600 15px Rubik,system-ui,sans-serif;border:0;border-radius:10px;padding:11px 14px;min-height:44px;background:#ff2a85;color:#fff;cursor:pointer}
#klDlg .msg{min-height:1.2em}`;document.head.appendChild(st)}
