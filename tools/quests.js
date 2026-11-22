
/* ================= Stadtteile, Spielkarte, Auftragsheft, Mess-Aufträge ================= */
const DISTRICTS=MG.districts||[];
const districtAt=(x,y)=>{for(const d of DISTRICTS){const b=d.b;if(x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3])return d}return null};
const QD=MG.q||{}, TALK=MG.talk||[];
save.q=save.q||{};
const qs=q=>save.q[q.id]||(save.q[q.id]={acc:false,m:{},calc:false,extra:false,done:false,pick:null,tries:0});
const QUESTS=[];
if(QD.werkhof){const w=QD.werkhof;QUESTS.push({id:"werkhof",district:"Dohr/Torfbend",title:"Licht für den Werkhof",
  giver:{x:w.giver[0],y:w.giver[1],name:"Herr Ballhorn",role:"Hausmeister der GHS Dohr",shirt:"#2f8f5b"},
  intro:"„Gut, dass du da bist! Ich bin Herr Ballhorn, der Hausmeister der GHS Dohr. Durch den Werkhof geht es am schnellsten von Am Torfbend zu den Kleingärten, wenn Herr Maaß mit den Klassen zum Laufen geht. Aber am Werkhof gibt es kein Licht, deshalb bleibt das Tor zum Durchgang abends zu und alle müssen außen herum laufen. Der Anschlusskasten hängt hoch an der Hallenwand, die Kabeltrommel steht hier im Hof. Ich brauche ein Kabel, das auf geradem Weg von der Trommel bis zum Anschluss reicht. Miss bitte nach und rechne aus, wie lang es sein muss.“",
  measures:[{id:"a",label:"Höhe des Anschlusskastens über dem Boden",short:"Höhe",val:6,x:w.wall[0]+1.3,y:w.wall[1]+1.6,where:"am grauen Anschlusskasten an der Hallenwand",line:[w.wall[0]+.15,0,w.wall[1],w.wall[0]+.15,6,w.wall[1]]},
            {id:"b",label:"Abstand der Kabeltrommel von der Wand",short:"Abstand",val:8,x:w.drum[0]+.2,y:w.drum[1]+1.7,where:"an der Kabeltrommel im Hof",line:[w.wall[0],.35,w.wall[1],w.drum[0],.35,w.drum[1]]}],
  lab:{a:"Höhe",b:"Abstand",c:"Kabel"},ans:10,unit:"m",
  ask:"Wie lang ist die gerade Strecke von der Kabeltrommel bis zum Anschluss?",
  choice:{q:"Im Lager liegen drei Kabel. Nimm das kürzeste, das reicht.",opts:[{v:9,t:"9 m"},{v:10,t:"10 m"},{v:12,t:"12 m"}],ok:10,
    fb:v=>v<10?"Zu kurz: 9 m < 10 m. Dieses Kabel reicht nicht bis zum Anschluss.":v>10?"Das Kabel reicht zwar, aber 2 m bleiben übrig. Es gibt ein kürzeres, das passt.":"Passt genau: 10 m reichen und nichts bleibt übrig."},
  doneText:"Das Licht am Werkhof brennt und das Tor ist offen. Der Werkhof-Durchgang verbindet jetzt Am Torfbend direkt mit den Kleingärten.",xp:40,money:120})}
if(QD.markt){const m=QD.markt,z=m.zone;QUESTS.push({id:"markt",district:"Rheydt",title:"Quer über den Markt",
  giver:{x:m.giver[0],y:m.giver[1],name:"Frau Krahe",role:"Klassenlehrerin der 10b, betreut den Schulstand auf dem Rheydter Markt",shirt:"#2f8f5b"},
  intro:"„Hallo, ich bin Frau Krahe! Unsere Schule baut heute neue Marktstände auf. Das Material liegt an der einen Ecke der weiß markierten Zone und muss zur gegenüberliegenden Ecke. Die Zone ist frei, du darfst also auch quer hindurch. Miss Breite und Länge und rechne aus, wie viel kürzer der direkte Weg ist.“",
  measures:[{id:"a",label:"Breite der Zone",short:"Breite",val:9,x:z[0]-1.2,y:z[3],where:"am Eckpfosten unten links der weißen Zone",line:[z[0],.35,z[1],z[0],.35,z[3]]},
            {id:"b",label:"Länge der Zone",short:"Länge",val:12,x:z[2],y:z[1]-1.2,where:"am Eckpfosten oben rechts der weißen Zone",line:[z[0],.35,z[1],z[2],.35,z[1]]}],
  lab:{a:"Breite",b:"Länge",c:"Diagonale"},ans:15,unit:"m",
  ask:"Wie lang ist der direkte Weg quer über die Zone (die Diagonale)?",
  extra:{q:"Am Rand entlang sind es 9 m + 12 m = 21 m. Wie viele Meter sparst du mit der Diagonale?",ans:6,unit:"m",steps:"Ersparnis: 21 m − 15 m = <span class=\"hl\">6 m</span>",tip:"Ziehe die Länge der Diagonale vom Weg am Rand ab: 21 m − 15 m."},
  choice:{q:"Welche Route nimmst du für den Transport?",opts:[{v:"diag",t:"Quer über die Zone (15 m)"},{v:"rand",t:"Am Rand entlang (21 m)"}],any:true,
    fb:v=>v==="diag"?"Der kürzeste Weg: 15 m. Du sparst 6 m gegenüber dem Rand.":"Das geht auch. Der Weg ist aber 21 m lang, also 6 m länger als die Diagonale."},
  transport:true,doneText:"Das Material ist da und die neuen Marktstände stehen. Auf dem Rheydter Markt ist jetzt mehr los.",xp:40,money:140})}
const questById=id=>QUESTS.find(q=>q.id===id);
const allMeasured=q=>q.measures.every(m=>qs(q).m[m.id]);

/* ---- Skizze ---- */
function questSVG(q){
  const s=qs(q),W=360,H=250,px=92,py=40,a=q.measures[0].val,b=q.measures[1].val;
  const k=Math.min((W-2*px)/b,(H-2*py)/a),bw=b*k,ah=a*k,ox=(W-bw)/2,oy=(H+ah)/2;
  const B=[ox,oy],C=[ox+bw,oy],A=[ox+bw,oy-ah],ink="#1a2147",hot="#e2384d",ok="#14874a";
  const got={a:s.m.a,b:s.m.b};
  const lbl=sd=>sd==="c"?(s.calc?`${q.lab.c}: ${fmt(q.ans)} ${q.unit}`:`${q.lab.c}: x = ?`):(got[sd]?`${q.lab[sd]}: ${q.measures[sd==="a"?0:1].val} ${q.unit}`:`${q.lab[sd]}: noch messen`);
  const sideCol=sd=>s.mSide===sd?(sd==="c"?ok:hot):(sd==="c"&&s.calc?ok:ink);
  const corner=(id,P)=>`<circle class="hit" data-corner="${id}" cx="${P[0]}" cy="${P[1]}" r="15" fill="${s.mAng===id?(id==="C"?"rgba(20,135,74,.25)":"rgba(226,56,77,.25)"):"rgba(58,71,160,.1)"}" stroke="${s.mAng===id?(id==="C"?ok:hot):"#9aa3d8"}" stroke-width="2" stroke-dasharray="${s.mAng===id?"":"4 3"}"/>`;
  const hit=(sd,P,Q)=>`<line class="hit" data-side="${sd}" x1="${P[0]}" y1="${P[1]}" x2="${Q[0]}" y2="${Q[1]}" stroke="transparent" stroke-width="22"/>`;
  const hx=(A[0]+B[0])/2,hy=(A[1]+B[1])/2,nl=Math.hypot(A[1]-B[1],A[0]-B[0]),lx=hx-(-(A[1]-B[1]))/nl*-14-6,ly=hy-((A[0]-B[0]))/nl*14;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Skizze: rechtwinkliges Dreieck mit den gemessenen Seiten">
  <polygon points="${B} ${C} ${A}" fill="#ffc933" fill-opacity=".16"/>
  <line x1="${B[0]}" y1="${B[1]}" x2="${C[0]}" y2="${C[1]}" stroke="${sideCol("b")}" stroke-width="${s.mSide==="b"?6:3.5}" stroke-linecap="round" ${got.b?"":'stroke-dasharray="3 6"'}/>
  <line x1="${C[0]}" y1="${C[1]}" x2="${A[0]}" y2="${A[1]}" stroke="${sideCol("a")}" stroke-width="${s.mSide==="a"?6:3.5}" stroke-linecap="round" ${got.a?"":'stroke-dasharray="3 6"'}/>
  <line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${sideCol("c")}" stroke-width="${s.mSide==="c"?6:3.5}" stroke-linecap="round" stroke-dasharray="${s.calc?"":"10 6"}"/>
  ${s.mAng==="C"?`<path d="M${C[0]-16} ${C[1]} V${C[1]-16} H${C[0]}" fill="none" stroke="${ok}" stroke-width="2.5"/><circle cx="${C[0]-8}" cy="${C[1]-8}" r="2.2" fill="${ok}"/>`:""}
  ${hit("b",B,C)}${hit("a",C,A)}${hit("c",A,B)}${corner("A",A)}${corner("B",B)}${corner("C",C)}
  <g font-family="JetBrains Mono,monospace" font-size="12.5" font-weight="700" pointer-events="none">
  <text x="${(B[0]+C[0])/2}" y="${oy+26}" text-anchor="middle" fill="${got.b?ink:"#8a8fa8"}">${lbl("b")}</text>
  <text x="${C[0]+12}" y="${(C[1]+A[1])/2+4}" fill="${got.a?ink:"#8a8fa8"}">${lbl("a")}</text>
  <text x="${lx}" y="${ly}" text-anchor="end" fill="${s.calc?ok:hot}">${lbl("c")}</text></g></svg>`;
}
function questSteps(q,full){
  const a=q.measures[0].val,b=q.measures[1].val,s=qs(q);
  let h=`x² = ${q.lab.a}² + ${q.lab.b}²<br>x² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a+b*b}<br>x = √${a*a+b*b} = <span class="hl">${fmt(q.ans)} ${q.unit}</span>`;
  if(q.extra&&(full||s.extra))h+=`<br>${q.extra.steps}`;
  if(q.choice&&s.done){const o=q.choice.opts.find(o=>o.v===s.pick);if(o)h+=`<br>Gewählt: <b>${o.t}</b>. ${q.choice.fb(s.pick)}`}
  return h;
}
const questTips=q=>{const a=q.measures[0].val,b=q.measures[1].val;return [
  `Die gesuchte Strecke liegt dem rechten Winkel gegenüber. Sie ist die <b>Hypotenuse</b>, also die längste Seite. Die beiden gemessenen Strecken sind die Katheten.`,
  `Setze die Messwerte ein: x² = ${a}² + ${b}²`,
  `${a}² = ${a*a} und ${b}² = ${b*b}. Zusammen sind das ${a*a+b*b}. Jetzt fehlt nur noch die Wurzel.`]};
let curQ=null, tipLvl=0;
function openQuest(q){curQ=q;tipLvl=0;state.mode="quest";car.v=0;renderQuest();$("qdlg").hidden=false}
function closeQuest(){$("qdlg").hidden=true;state.mode="play";curQ=null}
function renderQuest(msg,cls){
  const q=curQ,s=qs(q),all=allMeasured(q);
  $("qTag").textContent=`${q.district} · ${q.giver.name}, ${q.giver.role}`; $("qTitle").textContent=q.title;
  let h="";
  if(!s.acc){
    h=`<p>${q.intro}</p><p class="q">So gehst du vor: Maße an den 📏-Punkten aufnehmen, in der Skizze rechnen, Material wählen.</p>
       <div class="row"><button class="primary" type="button" data-q="accept">Auftrag annehmen</button><button type="button" data-q="close">Später</button></div>`;
    $("qSketch").innerHTML=""; $("qSketchBox").hidden=true;
  } else {
    $("qSketchBox").hidden=false; $("qSketch").innerHTML=questSVG(q);
    $("qMark").innerHTML=s.mAng==null&&s.mSide==null?"Tippe in der Skizze auf die Ecke mit dem <b>rechten Winkel</b> und auf die <b>gesuchte Seite</b>.":
      `${s.mAng==null?"Rechter Winkel: noch nicht markiert.":s.mAng==="C"?"✓ Rechter Winkel richtig markiert.":"✗ Dort ist kein rechter Winkel. Er liegt zwischen den beiden gemessenen Strecken."}<br>${s.mSide==null?"Gesuchte Seite: noch nicht markiert.":s.mSide==="c"?"✓ Gesuchte Seite richtig markiert: die schräge Strecke.":"✗ Diese Seite hast du gemessen. Gesucht ist die schräge Strecke."}`;
    h=`<div class="mlist">${q.measures.map(m=>`<div class="${s.m[m.id]?"ok":""}">${s.m[m.id]?"✓":"○"} ${m.label}: <b>${s.m[m.id]?m.val+" "+q.unit:"noch messen"}</b>${s.m[m.id]?"":`<br><small>📏 ${m.where}</small>`}</div>`).join("")}</div>`;
    if(s.done){
      h+=`<p class="fb good">Auftrag erledigt.</p><div class="steps">${questSteps(q,true)}</div><p>${q.doneText}</p><div class="row"><button class="primary" type="button" data-q="close">Weiter</button></div>`;
    } else if(!all){
      h+=`<p>Es fehlen noch Maße. Geh zu den blauen 📏-Punkten und tippe dort auf „Messen“. Die Reihenfolge ist egal.</p><div class="row"><button class="primary" type="button" data-q="close">Messen gehen</button><button type="button" data-q="nav">${state.nav?"Wegmarkierung aus":"Weg zeigen"}</button></div>`;
    } else if(!s.calc){
      h+=`<p class="q">${q.ask}</p>
        <form class="ansrow" id="qForm" autocomplete="off"><label for="qAns" style="font-weight:700">x =</label><input id="qAns" inputmode="decimal" placeholder="z. B. 7,5"><span class="unit">${q.unit}</span><button class="primary" type="submit">Prüfen</button></form>
        <div class="fb ${cls||""}" id="qFb" role="status">${msg||""}</div>
        <div class="row"><button type="button" data-q="frame">Formelgerüst</button><button type="button" data-q="tip">💡 Tipp${tipLvl?` (${tipLvl}/3)`:""}</button><button type="button" data-q="calc">🧮 Rechner</button><button type="button" data-q="close">Später weiter</button></div>
        <div class="steps" id="qFrame" hidden>x² = ${q.lab.a}² + ${q.lab.b}²<br>x² = ▢² + ▢² = ▢ + ▢ = ▢<br>x = √▢</div>
        <div class="hint" id="qTips" ${tipLvl?"":"hidden"}>${questTips(q).slice(0,tipLvl).map((t,i)=>`<b>Tipp ${i+1}:</b> ${t}`).join("<br>")}</div>
        <div class="calc" id="qCalc" hidden><label for="qcIn">Zahl</label><input id="qcIn" inputmode="decimal"><button type="button" data-q="sq">x²</button><button type="button" data-q="rt">√x</button><output id="qcOut"></output></div>`;
    } else if(q.extra&&!s.extra){
      h+=`<p class="fb good">Rechnung richtig: x = ${fmt(q.ans)} ${q.unit}</p><div class="steps">${questSteps(q)}</div><p class="q">${q.extra.q}</p>
        <form class="ansrow" id="qForm2" autocomplete="off"><label for="qAns2" style="font-weight:700">Ersparnis:</label><input id="qAns2" inputmode="decimal"><span class="unit">${q.extra.unit}</span><button class="primary" type="submit">Prüfen</button></form>
        <div class="fb ${cls||""}" id="qFb" role="status">${msg||""}</div><div class="row"><button type="button" data-q="tip2">💡 Tipp</button><button type="button" data-q="close">Später weiter</button></div><div class="hint" id="qTips" hidden>${q.extra.tip}</div>`;
    } else {
      h+=`<p class="fb good">Rechnung richtig: x = ${fmt(q.ans)} ${q.unit}</p><div class="steps">${questSteps(q)}</div><p class="q">${q.choice.q}</p>
        <div class="row">${q.choice.opts.map(o=>`<button class="primary" type="button" data-pick="${o.v}">${o.t}</button>`).join("")}</div>
        <div class="fb ${cls||""}" id="qFb" role="status">${msg||""}</div><div class="row"><button type="button" data-q="close">Später weiter</button></div>`;
    }
  }
  $("qBody").innerHTML=h;
  const f=$("qAns")||$("qAns2"); if(f&&!isTouch)setTimeout(()=>f.focus(),40);
}
const parseNum=v=>{const r=String(v).trim().replace(",",".").replace(/\s/g,"");return r===""?NaN:parseFloat(r)};
$("qdlg").addEventListener("submit",e=>{e.preventDefault();const q=curQ,s=qs(q);
  if(e.target.id==="qForm"){const v=parseNum($("qAns").value);if(isNaN(v))return renderQuest("Bitte eine Zahl eingeben, z. B. 12,5.","bad");s.tries++;
    if(Math.abs(v-q.ans)<.051){s.calc=true;save.xp+=s.tries===1?25:15;if(s.tries===1)save.firstTry++;save.solved++;persist();jingle();updateHud();renderQuest("","")}
    else{save.wrong++;persist();beep(180,.25,"square",.05);const a=q.measures[0].val,b=q.measures[1].val;
      renderQuest(Math.abs(v-(a+b))<.01?"Du hast die beiden Strecken addiert. Erst quadrieren, dann addieren, dann die Wurzel ziehen.":Math.abs(v-(a*a+b*b))<.01?"Das ist x². Es fehlt noch die Wurzel.":v<Math.max(a,b)?"Zu klein: Die schräge Strecke ist länger als jede der beiden gemessenen.":"Noch nicht richtig. Probier es noch einmal, du hast beliebig viele Versuche.","bad")}}
  if(e.target.id==="qForm2"){const v=parseNum($("qAns2").value);if(isNaN(v))return renderQuest("Bitte eine Zahl eingeben.","bad");
    if(Math.abs(v-q.extra.ans)<.051){s.extra=true;persist();jingle();renderQuest("","")}else{beep(180,.25,"square",.05);renderQuest("Noch nicht. Vergleiche den Weg am Rand mit der Diagonale.","bad")}}
});
$("qdlg").addEventListener("click",e=>{const q=curQ;if(!q)return;const s=qs(q);
  const hit=e.target.closest(".hit");
  if(hit){if(hit.dataset.corner)s.mAng=hit.dataset.corner;if(hit.dataset.side)s.mSide=hit.dataset.side;persist();
    const keep=($("qAns")||{}).value;renderQuest();if(keep&&$("qAns"))$("qAns").value=keep;return}
  const b=e.target.closest("button");if(!b)return;
  const a=b.dataset.q;
  if(a==="accept"){s.acc=true;persist();toast("Neuer Auftrag",q.title+" · steht im Auftragsheft 📒","#ffc933");refreshQuestWorld();renderQuest()}
  if(a==="close")closeQuest();
  if(a==="nav"){state.nav=!state.nav;closeQuest()}
  if(a==="frame")$("qFrame").hidden=!$("qFrame").hidden;
  if(a==="tip"){tipLvl=Math.min(3,tipLvl+1);const keep=$("qAns").value;renderQuest();$("qAns").value=keep}
  if(a==="tip2")$("qTips").hidden=false;
  if(a==="calc"){$("qCalc").hidden=!$("qCalc").hidden}
  if(a==="sq"||a==="rt"){const v=parseNum($("qcIn").value);$("qcOut").textContent=isNaN(v)||v<0?"Zahl ≥ 0 eingeben":a==="sq"?`${fmt2(v)}² = ${fmt2(v*v)}`:`√${fmt2(v)} ≈ ${String(Math.round(Math.sqrt(v)*1000)/1000).replace(".",",")}`}
  if(b.dataset.pick!==undefined){const raw=b.dataset.pick,v=isNaN(+raw)?raw:+raw,c=q.choice;
    if(c.any||v===c.ok){s.pick=v;persist();if(q.transport){closeQuest();startTransport(q,v)}else{finishQuest(q);renderQuest()}}
    else{beep(180,.25,"square",.05);renderQuest(c.fb(v),"bad")}}
});
function finishQuest(q){const s=qs(q);if(s.done)return;s.done=true;save.xp+=q.xp;save.money+=q.money;persist();jingle();updateHud();
  applyEffect(q.id,true,true);refreshQuestWorld();toast("Auftrag erledigt!",`+${q.xp} XP · +$${q.money}`,"#3ddc84");checkLevel()}
function measure(q,m){const s=qs(q);s.m[m.id]=true;persist();beep(880,.12,"triangle");refreshQuestWorld();
  toast(`📏 ${m.short}: ${m.val} ${q.unit}`,allMeasured(q)?`Alle Maße da. Sprich mit ${q.giver.name} oder öffne die Skizze im Auftragsheft.`:"In die Skizze eingetragen. Ein Maß fehlt noch.","#3fd8ff")}

/* ---- Transport auf dem Markt ---- */
function startTransport(q,pick){const z=QD.markt.zone;const path=pick==="diag"?[[z[0],z[1]],[z[2],z[3]]]:[[z[0],z[1]],[z[2],z[1]],[z[2],z[3]]];
  let len=0;for(let i=1;i<path.length;i++)len+=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);
  state.transport={q,path,s:0,len};showRoute(path);toast(pick==="diag"?"Quer über die Zone":"Am Rand entlang",`${Math.round(len)} m Transportweg`,"#ffc933")}
function stepTransport(dt){const T=state.transport;if(!T)return;T.s+=dt*2.6;let s=Math.min(T.s,T.len),p=T.path;
  for(let i=1;i<p.length;i++){const L=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(s<=L||i===p.length-1){const t=Math.min(1,s/L);placeCart(p[i-1][0]+(p[i][0]-p[i-1][0])*t,p[i-1][1]+(p[i][1]-p[i-1][1])*t,Math.atan2(p[i][1]-p[i-1][1],p[i][0]-p[i-1][0]));break}s-=L}
  if(T.s>=T.len+.6){state.transport=null;finishQuest(T.q);toast("Auftrag erledigt!",T.q.choice.fb(qs(T.q).pick),"#3ddc84")}}

/* ---- Auftragsheft ---- */
function openHeft(){state.mode="heft";car.v=0;renderHeft();$("heft").hidden=false;$("heftClose").focus()}
function closeHeft(){$("heft").hidden=true;state.mode="play"}
function renderHeft(){
  let h="";
  for(const q of QUESTS){const s=qs(q);
    const st=s.done?`<span class="chip done">erledigt</span>`:s.acc?`<span class="chip act">aktiv</span>`:`<span class="chip">offen</span>`;
    h+=`<div class="hq"><div class="hqh"><b>${q.title}</b> ${st}<br><small>${q.district} · ${q.giver.name}, ${q.giver.role}</small></div>`;
    if(s.done)h+=`<details><summary>Rechenweg ansehen</summary><div class="steps">${questSteps(q,true)}</div></details><p>${q.doneText}</p>`;
    else if(s.acc)h+=`<ul class="chk">${q.measures.map(m=>`<li class="${s.m[m.id]?"ok":""}">${s.m[m.id]?"✓":"○"} ${m.label}${s.m[m.id]?`: <b>${m.val} ${q.unit}</b>`:` <small>(${m.where})</small>`}</li>`).join("")}
      <li class="${s.calc?"ok":""}">${s.calc?"✓":"○"} Strecke berechnen${s.calc?`: <b>${fmt(q.ans)} ${q.unit}</b>`:""}</li>${q.extra?`<li class="${s.extra?"ok":""}">${s.extra?"✓":"○"} Ersparnis berechnen</li>`:""}<li>○ ${q.transport?"Route wählen und transportieren":"Material wählen"}</li></ul>
      <div class="row"><button class="primary" type="button" data-h="open" data-id="${q.id}">Skizze öffnen</button></div>`;
    else h+=`<p>Noch nicht angenommen. ${q.giver.name} findest du in ${q.district}.</p>`;
    h+=`</div>`}
  for(const z of QD.soon||[])h+=`<div class="hq soon"><div class="hqh"><b>${z[3]}</b> <span class="chip">folgt</span><br><small>${z[2]}</small></div></div>`;
  const tk=state.task;
  h+=`<div class="hq"><div class="hqh"><b>Kurier-Aufträge</b><br><small>Feuerwehr, Baustelle, Elektromarkt, Rathaus, Park-Kurier, Taxi, Luftrettung</small></div><p>${tk?`Aktiv: ${tk.label} (${Math.max(0,Math.ceil(tk.time))} s)`:"Kein Kurier-Auftrag aktiv."} Bisher ${save.delivered} Lieferungen.</p></div>`;
  $("heftBody").innerHTML=h; $("heftNav").textContent=state.nav?"🧭 Wegmarkierung ausblenden":"🧭 Weg zum nächsten Ziel zeigen";
}
$("heft").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.h==="open"){$("heft").hidden=true;openQuest(questById(b.dataset.id))}
  if(b.id==="heftNav"){state.nav=!state.nav;renderHeft()}
  if(b.id==="heftClose")closeHeft()});

/* ---- Begegnungen ---- */
function openTalk(t){t.i=((t.i??-1)+1)%t.say.length;state.mode="talk";car.v=0;$("tName").textContent=`${t.name} · ${t.role}`;$("tSay").textContent="„"+t.say[t.i]+"“";$("talk").hidden=false;$("talkClose").focus()}
$("talkClose").onclick=()=>{$("talk").hidden=true;state.mode="play"};

/* ---- Wegmarkierung nur auf Wunsch ---- */
function navTarget(){
  if(state.task)return {x:state.task.x,y:state.task.y};
  let best=null,bd=1e9;
  for(const q of QUESTS){const s=qs(q);if(s.done)continue;
    const pts=s.acc&&!allMeasured(q)?q.measures.filter(m=>!s.m[m.id]):[q.giver];
    for(const p of pts){const d=Math.hypot(p.x-car.x,p.y-car.y)+(s.acc?0:5000);if(d<bd){bd=d;best=p}}}
  return best;
}

/* ---- Kartenansicht ---- */
function openMap(){state.mode="map";car.v=0;$("mapdlg").hidden=false;drawBigMap();$("mapClose").focus()}
function closeMap(){$("mapdlg").hidden=true;state.mode="play"}
$("mapClose").onclick=closeMap;
function drawBigMap(){
  const c=$("bigmap"),g=c.getContext("2d"),k=c.width/(2*HX);c.height=Math.round(2*HY*k);
  g.drawImage(mmBase,0,0,c.width,c.height);
  const P=(x,y)=>[(x+HX)*k,(y+HY)*k];
  g.textAlign="center";g.textBaseline="middle";
  for(const d of DISTRICTS){const b=d.b,[x,y]=P((b[0]+b[2])/2,b[1]+14);g.font="bold 22px Rubik,sans-serif";g.lineWidth=5;g.strokeStyle="rgba(10,14,32,.85)";g.strokeText(d.n,x,y);g.fillStyle="#ffc933";g.fillText(d.n,x,y)}
  const dot=(x,y,col,ic)=>{const[p,q]=P(x,y);g.fillStyle=col;g.beginPath();g.arc(p,q,13,0,7);g.fill();g.font="15px sans-serif";g.fillStyle="#000";g.fillText(ic,p,q+1)};
  for(const gv of GIVERS)dot(gv.x,gv.y,gv.col,gv.icon);
  for(const q of QUESTS)dot(q.giver.x,q.giver.y,qs(q).done?"#3ddc84":"#ffc933",qs(q).done?"✓":"❗");
  for(const z of QD.soon||[])dot(z[0],z[1],"#8a8fa8","🔒");
  const[px,py]=P(car.x,car.y);g.save();g.translate(px,py);g.rotate(car.a);g.fillStyle="#fff";g.strokeStyle="#000";g.lineWidth=2;g.beginPath();g.moveTo(16,0);g.lineTo(-10,-10);g.lineTo(-5,0);g.lineTo(-10,10);g.closePath();g.fill();g.stroke();g.restore();
}

/* ---- Musik (eigene kleine Melodie, nur auf Wunsch) ---- */
let musicT=0,musicI=0;
function toggleMusic(){if(musicT){clearInterval(musicT);musicT=0;$("btnMusic").textContent="🎵 Musik";return}
  const mel=[392,440,523,587,523,440,392,330,349,440,523,440,392,330,294,330],bass=[131,131,175,175,196,196,131,131];
  musicT=setInterval(()=>{if(state.mode==="start")return;beep(mel[musicI%16],.32,"triangle",.025);if(musicI%2===0)beep(bass[(musicI/2)%8],.6,"sine",.03);musicI++},340);$("btnMusic").textContent="🎵 Musik aus"}

/* ---- 3D: Auftragswelt ---- */
const QW={};
function tube(x1,y1,z1,x2,y2,z2,r,mat){const d=new THREE.Vector3(x2-x1,y2-y1,z2-z1),L=d.length();const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,8),mat);m.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());scene.add(m);return m}
function boxAt(w,h,d,mat,x,y,z,ry=0,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function standPerson(x,y,a,shirt){const p=makePerson(shirt,false);p.scale.setScalar(.092);p.position.set(x,groundY(x,y),y);p.rotation.y=-a;scene.add(p);return p}
function makeStall(x,y,col){const g=new THREE.Group(),wood=paint("#8a6a45");
  for(const [dx,dz] of [[-1.4,-1],[1.4,-1],[-1.4,1],[1.4,1]])boxAt(.1,2.3,.1,wood,dx,1.15,dz,0,g);
  boxAt(3,.1,1.2,wood,0,.9,.5,0,g);
  for(let i=0;i<6;i++)boxAt(.55,.08,2.6,paint(i%2?col:"#f4f1e8"),-1.375+i*.55,2.36,0,0,g);
  for(let i=0;i<4;i++)boxAt(.5,.3,.5,paint(["#d8452e","#e8a33a","#5f9a3e","#c94f7c"][i]),-1+i*.65,1.1,.5,0,g);
  g.position.set(x,groundY(x,y),y);scene.add(g);return g}
function buildQuestWorld(){
  const cyan=new THREE.MeshBasicMaterial({color:0x3fd8ff,fog:false});
  for(const q of QUESTS){
    q.person=standPerson(q.giver.x,q.giver.y,Math.PI/2,q.giver.shirt);
    q.mark=makeMarker("#ffc933","❗",q.title);q.mark.position.set(q.giver.x,0,q.giver.y);q.mark.scale.setScalar(.55);
    for(const m of q.measures){m.mark=makeMarker("#3fd8ff","📏",m.short);m.mark.position.set(m.x,0,m.y);m.mark.scale.setScalar(.42);
      const L=m.line;m.tube=tube(L[0],L[1],L[2],L[3],L[4],L[5],.06,cyan);m.lab=textSprite(4.6,.86);m.lab.userData.set(`${m.val} ${q.unit}`,"#3fd8ff");m.lab.position.set((L[0]+L[3])/2,(L[1]+L[4])/2+.7,(L[2]+L[5])/2)}
  }
  for(const z of QD.soon||[]){const mk=makeMarker("#8a8fa8","🔒",z[3]+" · folgt");mk.position.set(z[0],0,z[1]);mk.scale.setScalar(.5);mk.userData.beam.visible=false}
  for(const t of TALK)t.person=standPerson(t.x,t.y,Math.random()*6,pick(["#8e44ad","#16a085","#c0392b","#2c3e50","#d35400"]));
  if(QD.werkhof){const w=QD.werkhof,G=QW.werkhof={};
    const metal=paint("#6b7178"),yellow=paint("#e9b51f");
    boxAt(.25,.8,.6,metal,w.wall[0]+.14,6,w.wall[1]);boxAt(.06,6,.06,metal,w.wall[0]+.05,3,w.wall[1]+.2);
    const drum=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,.9,16),paint("#8a6a45"));drum.rotation.x=Math.PI/2;drum.position.set(w.drum[0],.75,w.drum[1]);drum.castShadow=true;scene.add(drum);
    for(const z of [-.5,.5]){const f=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.08,16),paint("#6f5334"));f.rotation.x=Math.PI/2;f.position.set(w.drum[0],.78,w.drum[1]+z);scene.add(f)}
    G.cable=tube(w.drum[0],.8,w.drum[1],w.wall[0]+.25,6,w.wall[1],.05,paint("#111"));
    const [gx1,gy,gx2]=[w.gate[0],w.gate[1],w.gate[2]],mid=(gx1+gx2)/2,half=(gx2-gx1)/2;
    G.leaves=[-1,1].map(sd=>{const piv=new THREE.Group();piv.position.set(mid+sd*half,.06,gy);const leaf=new THREE.Group();piv.add(leaf);
      boxAt(half,.12,.1,yellow,-sd*half/2,2,0,0,leaf);boxAt(half,.12,.1,yellow,-sd*half/2,.25,0,0,leaf);
      for(let i=0;i<=6;i++)boxAt(.07,1.8,.07,yellow,-sd*half*i/6,1.12,0,0,leaf);scene.add(piv);piv.userData.sd=sd;return piv});
    for(const sd of [-1,1])boxAt(.3,2.4,.3,metal,mid+sd*(half+.15),1.2,gy);
    G.sign=textSprite(7,1.3);G.sign.userData.set("Durchgang gesperrt · kein Licht","#ffc933");G.sign.position.set(mid,3.1,gy);
    G.cells=[];for(let x=gx1-.5;x<=gx2+.5;x+=.5)for(let y=gy-1;y<=gy+1;y+=.5){const i=gi(x,y);if(i>=0)G.cells.push(i)}
    G.bulb=new THREE.MeshBasicMaterial({color:0x4a4a44});G.halo=new THREE.SpriteMaterial({map:haloTex(),color:0xffe2a0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    G.lights=[];
    w.lamps.forEach((l,i)=>{const wallLamp=i===w.lamps.length-1,h=wallLamp?6.9:4.2;
      if(!wallLamp){const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,h,8),metal);p.position.set(l[0],h/2,l[1]);p.castShadow=true;scene.add(p)}
      const b=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),G.bulb);b.position.set(l[0]+(wallLamp?.3:0),h,l[1]);scene.add(b);
      const s=new THREE.Sprite(G.halo);s.scale.set(3.2,3.2,1);s.position.copy(b.position);scene.add(s);
      if(i<2){const pl=new THREE.PointLight(0xffd9a0,0,16,1.6);pl.position.set(l[0],h-.3,l[1]);scene.add(pl);G.lights.push(pl)}});
  }
  if(QD.markt){const m=QD.markt,z=m.zone,G=QW.markt={};
    const white=new THREE.MeshLambertMaterial({color:0xf4f4f4}),flat=new THREE.PlaneGeometry(1,1);flat.rotateX(-Math.PI/2);
    const yb=groundY((z[0]+z[2])/2,(z[1]+z[3])/2)+.03;
    for(const [x1,y1,x2,y2] of [[z[0],z[1],z[2],z[1]],[z[2],z[1],z[2],z[3]],[z[2],z[3],z[0],z[3]],[z[0],z[3],z[0],z[1]]]){const r=new THREE.Mesh(flat,white);scene.add(r);setRib(r,x1,y1,x2,y2,.16,yb)}
    for(const [x,y] of [[z[0],z[1]],[z[2],z[1]],[z[0],z[3]],[z[2],z[3]]])boxAt(.14,1.1,.14,paint("#d8452e"),x,yb+.55,y);
    for(const f of m.fixed)makeStall(f[0],f[1],"#2f6fb5");
    G.stalls=m.stalls.map((s,i)=>makeStall(s[0],s[1],["#c8452e","#2f8f5b","#e0a43a","#7b3fa0","#c8452e","#2f8f5b"][i%6]));
    G.crates=m.stalls.map(s=>{const g=new THREE.Group();boxAt(1.2,.15,1,paint("#b08a5a"),0,.08,0,0,g);boxAt(.8,.5,.6,paint("#8a6a45"),0,.4,0,.3,g);g.position.set(s[0],groundY(s[0],s[1]),s[1]);scene.add(g);return g});
    G.cart=new THREE.Group();boxAt(1.3,.5,.8,paint("#8a6a45"),0,.6,0,0,G.cart);boxAt(.9,.5,.6,paint("#b08a5a"),0,1.1,0,0,G.cart);
    for(const zz of [-.45,.45]){const wl=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.08,12),matTire);wl.rotation.x=Math.PI/2;wl.position.set(0,.28,zz);G.cart.add(wl)}
    G.cart.position.set(z[0],yb,z[1]);scene.add(G.cart);
    G.route=[0,1].map(()=>{const r=new THREE.Mesh(flat,new THREE.MeshBasicMaterial({color:0xffc933,transparent:true,opacity:.9}));r.visible=false;scene.add(r);return r});
  }
  if(QD.closed){const c=QD.closed;for(let i=0;i<5;i++)boxAt(1.2,.35,.12,paint(i%2?"#e9b51f":"#222"),c[0]-2.4+i*1.2,1.1,c[1]+1.3);
    const s=textSprite(11,2);s.userData.set("Verbindung zum Nordpark · öffnet später","#ffc933");s.position.set(c[0],4.4,c[1]+1.2)}
  for(const id in QW)applyEffect(id,qs(questById(id)).done,false);
  refreshQuestWorld();
}
let _halo;function haloTex(){return _halo||(_halo=canvasTex(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.3,"rgba(255,230,170,.55)");g.addColorStop(1,"rgba(255,220,150,0)");c.fillStyle=g;c.fillRect(0,0,128,128)}))}
function showRoute(path){const G=QW.markt,y=groundY(path[0][0],path[0][1])+.05;G.route.forEach((r,i)=>{if(i<path.length-1){setRib(r,path[i][0],path[i][1],path[i+1][0],path[i+1][1],.5,y);r.visible=true}else r.visible=false})}
function placeCart(x,y,a){const c=QW.markt.cart;c.position.x=x;c.position.z=y;c.rotation.y=-a}
function applyEffect(id,on,animate){
  if(id==="werkhof"){const G=QW.werkhof;if(!G)return;
    for(const i of G.cells)solid[i]=on?0:1;
    G.gateT=on?1:0; if(!animate)G.gateA=G.gateT; G.sign.visible=!on; G.cable.visible=on;
    G.bulb.color.set(on?0xfff2c2:0x4a4a44);G.halo.opacity=on?.9:0;for(const l of G.lights)l.intensity=on?.9:0}
  if(id==="markt"){const G=QW.markt;if(!G)return;G.stalls.forEach(s=>s.visible=on);G.crates.forEach(s=>s.visible=!on);
    if(on&&G.route)G.route.forEach(r=>r.visible=false);if(on){const z=QD.markt.zone;placeCart(z[2],z[3],0)}}
}
function refreshQuestWorld(){for(const q of QUESTS){const s=qs(q);q.mark.visible=!s.done;for(const m of q.measures){m.mark.visible=s.acc&&!s.done&&!s.m[m.id];m.tube.visible=m.lab.visible=!!s.m[m.id]}}}
function animQuestWorld(dt,now){
  const G=QW.werkhof;if(G){G.gateA=G.gateA===undefined?G.gateT:G.gateA+(G.gateT-G.gateA)*Math.min(1,dt*2.5);for(const p of G.leaves)p.rotation.y=p.userData.sd*G.gateA*1.5}
  for(const q of QUESTS){if(q.mark.visible){q.mark.userData.sp.position.y=7+Math.sin(now/300)*.5;q.mark.userData.ring.rotation.z+=dt}}
}

/* ---- GHS Dohr · Standort Torfbend (Am Torfbend 16): Außenmodell nach den Fotos vom 19.11. ----
   Maße in Metern. x nach Osten, z (= Karten-y) nach Süden; die Straße Am Torfbend liegt im Süden (z ≈ -50).
   Nach Fotos: Straßenseite von Altbau, Klassentrakt und Giebelbau, Ostseite Giebelbau, Eingang mit Windfang,
   Einfahrt mit weißer Hofmauer, Erweiterungsbau mit Laubengang und Außentreppe, Pausenhof, Turnhalle.
   Vorläufig (ohne Foto): Nord- und Westseite des Altbaus, Dachflächen nach Norden, Nord- und Westseite der Turnhalle. */
function buildSchool(){
  if(!MG.school)return;
  const V=(x,y,z)=>new THREE.Vector3(x,y,z), V2=(x,y)=>new THREE.Vector2(x,y), B0=BASE_Y;
  const BK={};
  const mk=(n,mat,wuv=1,cast=true)=>{BK[n]={mat,geos:[],wuv,cast}};
  const put=(n,g,m)=>{if(m)g.applyMatrix4(m);BK[n].geos.push(g.index?g.toNonIndexed():g)};
  const lam=o=>new THREE.MeshLambertMaterial(o);

  /* ---------- Texturen (gezeichnet, keine Fotos) ---------- */
  const brickTex=(cols,mortar,dirt=.08)=>canvasTex(512,512,(g)=>{const S=512,ch=S/12,bw=S/4,j=4;g.fillStyle=mortar;g.fillRect(0,0,S,S);
    for(let r=0;r<12;r++){const off=(r%2)*bw/2;for(let k=-1;k<=4;k++){const x=k*bw+off;g.fillStyle=pick(cols);g.fillRect(x+j,r*ch+j,bw-2*j,ch-2*j);g.fillStyle="rgba(255,255,255,.07)";g.fillRect(x+j,r*ch+j,bw-2*j,3)}}
    noise(g,S,S,7000,[`rgba(0,0,0,${dirt})`,"rgba(255,255,255,.05)"],2)});
  const plasterTex=col=>canvasTex(256,256,(g)=>{g.fillStyle=col;g.fillRect(0,0,256,256);noise(g,256,256,5000,["rgba(0,0,0,.07)","rgba(255,255,255,.14)","rgba(0,0,0,.035)"],2);
    for(let i=0;i<5;i++){g.fillStyle="rgba(90,80,60,.05)";g.beginPath();g.ellipse(Math.random()*256,Math.random()*256,30+Math.random()*40,15+Math.random()*30,Math.random()*3,0,7);g.fill()}});
  const tileTex=cols=>canvasTex(256,256,(g)=>{const rh=256/3,tw=64;for(let r=0;r<3;r++)for(let k=-1;k<5;k++){const x=k*tw+(r%2)*tw/2,y=r*rh;g.fillStyle=pick(cols);g.fillRect(x,y,tw,rh);
      const gr=g.createLinearGradient(0,y,0,y+rh);gr.addColorStop(0,"rgba(255,255,255,.06)");gr.addColorStop(.85,"rgba(0,0,0,.05)");gr.addColorStop(1,"rgba(0,0,0,.45)");g.fillStyle=gr;g.fillRect(x,y,tw,rh);g.fillStyle="rgba(0,0,0,.35)";g.fillRect(x,y,2,rh)}
    noise(g,256,256,2500,["rgba(0,0,0,.12)","rgba(255,255,255,.06)"],2)});
  const seamTex=()=>canvasTex(256,256,(g)=>{g.fillStyle="#8e9398";g.fillRect(0,0,256,256);noise(g,256,256,2000,["rgba(0,0,0,.06)","rgba(255,255,255,.08)"],2);for(let x=0;x<256;x+=64){g.fillStyle="rgba(255,255,255,.35)";g.fillRect(x,0,3,256);g.fillStyle="rgba(0,0,0,.25)";g.fillRect(x+3,0,3,256)}});
  const glassTex=()=>canvasTex(128,256,(g)=>{const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,"#9fb4c7");gr.addColorStop(.45,"#4d6273");gr.addColorStop(1,"#1f2932");g.fillStyle=gr;g.fillRect(0,0,128,256);
    g.fillStyle="rgba(255,255,255,.13)";g.beginPath();g.moveTo(10,256);g.lineTo(60,256);g.lineTo(128,120);g.lineTo(128,70);g.closePath();g.fill()});
  const yardTex=()=>canvasTex(512,512,(g)=>{g.fillStyle="#45484c";g.fillRect(0,0,512,512);noise(g,512,512,24000,["#3d4044","#505357","#383a3e","#595c60"],2);
    for(let i=0;i<7;i++){g.fillStyle=i%2?"rgba(0,0,0,.08)":"rgba(255,255,255,.05)";g.beginPath();g.ellipse(Math.random()*512,Math.random()*512,40+Math.random()*80,20+Math.random()*40,Math.random()*3,0,7);g.fill()}
    g.strokeStyle="rgba(20,20,22,.6)";g.lineWidth=1.4;for(let i=0;i<4;i++){g.beginPath();let x=Math.random()*512,y=Math.random()*512;g.moveTo(x,y);for(let k=0;k<7;k++){x+=(Math.random()-.5)*50;y+=Math.random()*35;g.lineTo(x,y)}g.stroke()}
    for(let i=0;i<190;i++){g.save();g.translate(Math.random()*512,Math.random()*512);g.rotate(Math.random()*6.3);g.fillStyle=pick(["#d9a53a","#c9772c","#b8432f","#e2c25a","#8a5a2a","#a8742f"]);g.beginPath();g.ellipse(0,0,3+Math.random()*4,2+Math.random()*2,0,0,7);g.fill();g.restore()}});
  const paverTex=()=>canvasTex(512,512,(g)=>{g.fillStyle="#7a776f";g.fillRect(0,0,512,512);   /* fugenloser Betonbelag statt Platten (Fugenraster flimmerte) */
    for(let i=0;i<10;i++){g.fillStyle=`rgba(${i%2?255:0},${i%2?250:0},${i%2?240:0},.035)`;g.beginPath();g.ellipse(Math.random()*512,Math.random()*512,60+Math.random()*120,40+Math.random()*90,Math.random()*3,0,7);g.fill()}
    noise(g,512,512,22000,["rgba(0,0,0,.07)","rgba(255,255,255,.06)","rgba(80,70,55,.06)"],2)});
  const cobbleTex=()=>canvasTex(256,256,(g)=>{g.fillStyle="#6e6c66";g.fillRect(0,0,256,256);noise(g,256,256,9000,["rgba(0,0,0,.08)","rgba(255,255,255,.06)"],2)});   /* Rinne fugenlos */
  const signTex=(w,h,draw)=>{const t=canvasTex(w,h,draw);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return t};

  /* ---------- Materialien ---------- */
  mk("brick",lam({map:brickTex(["#5e2c22","#6a3226","#53271f","#733a2b","#4a2520","#62302a","#3f2420"],"#4f4943")}));
  mk("brickPl",lam({map:brickTex(["#3c2420","#4a2a24","#33201d","#55302a"],"#3e3934")}));
  mk("brickArch",lam({map:brickTex(["#8e3f2c","#9c4732","#a5513a","#7f3828"],"#6b5f55")}));
  mk("brickRed",lam({map:brickTex(["#a24a38","#94402f","#ad5642","#8a3b2c","#b25c47"],"#b8ab9b")}));
  mk("brickPillar",lam({map:brickTex(["#a8452f","#b9533a","#9b3e2b","#c25d43"],"#c9bdb0")}));
  mk("brickLow",lam({map:brickTex(["#9c8268","#8c7259","#a58a6c","#7e6450","#b0957a"],"#8a8072")}));
  mk("whiteBrick",lam({map:brickTex(["#eeeae2","#e8e3d9","#f2efe8"],"#d2ccc1",.04)}));
  mk("creamBrick",lam({map:brickTex(["#efe2b3","#e8d9a6","#f2e6bd"],"#d8cba0",.04)}));
  mk("render",lam({map:plasterTex("#e2d8bc")}),2);
  mk("renderTH",lam({map:plasterTex("#e8d9a3")}),2);
  mk("renderW",lam({map:plasterTex("#ebeae5")}),2);
  mk("plinth",lam({map:plasterTex("#aaa391")}),2);
  mk("concrete",lam({map:plasterTex("#b9b5ab")}),2);
  mk("stone",lam({map:plasterTex("#8d806f")}));
  mk("roof",lam({map:tileTex(["#4a403b","#3f3733","#52463f","#453c37"]),side:THREE.DoubleSide}),0);
  mk("roofRed",lam({map:tileTex(["#94452f","#a14e36","#8a3f2b"]),side:THREE.DoubleSide}),0);
  mk("roofMetal",lam({map:seamTex(),side:THREE.DoubleSide}),0);
  mk("flatRoof",lam({color:0x3b3b3c}));
  mk("timber",lam({color:0x46534c}));
  mk("frame",lam({color:0xf0f0ec}));
  mk("frameGrey",lam({color:0x8f969c}));
  mk("glass",new THREE.MeshPhongMaterial({map:glassTex(),shininess:110,specular:0x777777}));
  mk("metal",new THREE.MeshPhongMaterial({color:0xa9afb4,shininess:60,specular:0x555555}));
  mk("iron",lam({color:0x3d4246}));
  mk("red",lam({color:0xbf3a2c}));
  mk("wood",lam({color:0x4a3324}));
  mk("woodLight",lam({color:0x8a6a45}));
  mk("green",lam({color:0x52705a}));
  mk("white",lam({color:0xf2f2f0}));
  mk("dark",lam({color:0x1f2226}));
  mk("doorGrey",lam({color:0x9aa0a5}));
  mk("quarry",lam({color:0x8d4b3c}),1,false);
  mk("bush",lam({color:0x2d4a2b}));
  mk("yellow",lam({color:0xe3c13a}));
  mk("teal",lam({color:0x3e8f8b}));
  mk("bin",lam({color:0x4a4f55}));
  const poly=(o)=>Object.assign(o,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  mk("yard",lam(poly({map:yardTex()})),4,false);
  mk("paver",lam(poly({map:paverTex()})),2,false);
  mk("cobble",lam(poly({map:cobbleTex()})),1,false);
  mk("grass",lam(poly({map:texGrass,color:0xdde8cc})),3,false);
  mk("puddle",new THREE.MeshPhongMaterial(poly({color:0x26313b,shininess:140,specular:0x9fb3c6,transparent:true,opacity:.85,depthWrite:false})),1,false);
  // Einzelstücke mit eigener Textur (UV 0..1)
  mk("gable",lam({map:signTex(1400,770,gableArt)}),0);
  mk("frieze",lam({map:canvasTex(240,360,friezeArt)}),0);
  mk("reliefSun",lam({map:signTex(256,256,c=>reliefArt(c,"sun"))}),0);
  mk("reliefKids",lam({map:signTex(256,256,c=>reliefArt(c,"kids"))}),0);
  mk("reliefNSW",lam({map:signTex(512,192,c=>reliefArt(c,"band"))}),0);
  mk("door",lam({map:signTex(512,768,doorArt)}),0);
  mk("doorTH",lam({map:signTex(256,384,doorTHArt)}),0);
  mk("mural",lam({map:signTex(1024,256,c=>muralArt(c,"bricks"))}),0);
  mk("muralPeople",lam({map:signTex(1024,256,c=>muralArt(c,"people"))}),0);
  mk("muralTri",lam({map:signTex(512,512,c=>muralArt(c,"tri"))}),0);
  mk("manhole",lam(poly({map:signTex(128,128,manholeArt)})),0,false);
  const fenceT=canvasTex(512,320,fenceArt);fenceT.wrapT=THREE.ClampToEdgeWrapping;
  mk("fenceIron",lam({map:fenceT,transparent:true,alphaTest:.5,side:THREE.DoubleSide}),0);
  const grillT=canvasTex(128,128,c=>{c.strokeStyle="#9aa1a7";c.lineWidth=3;for(let i=-128;i<256;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i+128,128);c.stroke();c.beginPath();c.moveTo(i+128,0);c.lineTo(i,128);c.stroke()}});
  mk("grille",lam({map:grillT,transparent:true,alphaTest:.5,side:THREE.DoubleSide}),0);
  const signs={logo:signTex(256,256,c=>signArt(c,"logo")),green:signTex(256,192,c=>signArt(c,"green")),gute:signTex(256,144,c=>signArt(c,"gute")),
    fw:signTex(512,128,c=>signArt(c,"fw")),th:signTex(192,256,c=>signArt(c,"th")),bus:signTex(256,384,c=>signArt(c,"bus")),wc:signTex(128,128,c=>signArt(c,"wc"))};

  /* ---------- Hilfen: Fassaden mit echten Öffnungen ---------- */
  function face(dir,a0,a1,fz,d=.38,base=B0){const p=V(0,base,0);let ry,toU;
    if(dir==="S"){ry=0;p.x=a0;p.z=fz-d;toU=X=>X-a0}
    else if(dir==="N"){ry=Math.PI;p.x=a1;p.z=fz+d;toU=X=>a1-X}
    else if(dir==="E"){ry=Math.PI/2;p.x=fz-d;p.z=a1;toU=Z=>a1-Z}
    else{ry=-Math.PI/2;p.x=fz+d;p.z=a0;toU=Z=>Z-a0}
    return {m:new THREE.Matrix4().compose(p,new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),V(1,1,1)),toU,len:a1-a0,d}}
  const W=(F,c,w,y0,y1,t="seg",x={})=>Object.assign({u:F.toU(c),w,y0,y1,t,r:.3},x);
  function archP(o){if(o.t==="round")return {R:o.w/2,cy:o.y1,a:0};const r=o.r,R=(o.w*o.w/4+r*r)/(2*r),cy=o.y1+r-R;return {R,cy,a:Math.atan2(o.y1-cy,o.w/2)}}
  function openPath(o,P){const u0=o.u-o.w/2,u1=o.u+o.w/2;P.moveTo(u0,o.y0);P.lineTo(u1,o.y0);P.lineTo(u1,o.y1);
    if(o.t==="rect")P.lineTo(u0,o.y1);
    else if(o.t==="point"){const R=o.w*.85,h=Math.sqrt(R*R-(R-o.w/2)**2),ta=Math.atan2(h,R-o.w/2),N=10;
      for(let i=1;i<=N;i++){const a=ta*i/N;P.lineTo(u1-R+R*Math.cos(a),o.y1+R*Math.sin(a))}
      for(let i=1;i<=N;i++){const a=Math.PI-ta+ta*i/N;P.lineTo(u0+R+R*Math.cos(a),o.y1+R*Math.sin(a))}}
    else{const A=archP(o);P.absarc(o.u,A.cy,A.R,A.a,Math.PI-A.a,false)}
    P.closePath()}
  function paneHoles(o,kind){const b=.075,m=.07,u0=o.u-o.w/2,u1=o.u+o.w/2,H=[];
    const rect=(a,c,e,f)=>{const p=new THREE.Path();p.moveTo(a,c);p.lineTo(e,c);p.lineTo(e,f);p.lineTo(a,f);p.closePath();H.push(p)};
    if(kind==="arch"){const yt=o.y0+(o.y1-o.y0)*.74;rect(u0+b,o.y0+b,o.u-m/2,yt-m/2);rect(o.u+m/2,o.y0+b,u1-b,yt-m/2);
      const A=archP(o),Rb=A.R-b,ap=Math.acos(Math.min(1,(o.w/2-b)/Rb)),yA=A.cy+Rb*Math.sin(ap);
      const p=new THREE.Path();p.moveTo(u0+b,yt+m/2);p.lineTo(u1-b,yt+m/2);p.lineTo(u1-b,Math.max(yA,yt+m/2+.01));p.absarc(o.u,A.cy,Rb,ap,Math.PI-ap,false);p.lineTo(u0+b,yt+m/2);H.push(p)}
    else if(kind==="modern"){const yt=o.y0+(o.y1-o.y0)*.72,n=o.cols||2,cw=(o.w-2*b-(n-1)*m)/n;for(let i=0;i<n;i++){const a=u0+b+i*(cw+m);rect(a,o.y0+b,a+cw,yt-m/2)}rect(u0+b,yt+m/2,u1-b,o.y1-b)}
    else{const n=o.cols||2,rows=o.rows||1,cw=(o.w-2*b-(n-1)*m)/n,rh=(o.y1-o.y0-2*b-(rows-1)*m)/rows;for(let i=0;i<n;i++)for(let j=0;j<rows;j++){const a=u0+b+i*(cw+m),c=o.y0+b+j*(rh+m);rect(a,c,a+cw,c+rh)}}
    return H}
  function skin(F,H,ops=[],bk="brick",gable=0){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(F.len,0);s.lineTo(F.len,H);if(gable)s.lineTo(F.len/2,H+gable);s.lineTo(0,H);s.lineTo(0,0);
    for(const o of ops){const p=new THREE.Path();openPath(o,p);s.holes.push(p)}
    put(bk,new THREE.ExtrudeGeometry(s,{depth:F.d,bevelEnabled:false,curveSegments:10}),F.m)}
  function windows(F,list,st={}){for(const o of list){const rz=F.d-(st.recess??.25);
      const fs=new THREE.Shape();openPath(o,fs);for(const h of paneHoles(o,st.panes||(o.t==="rect"?"grid":"arch")))fs.holes.push(h);
      const fg=new THREE.ExtrudeGeometry(fs,{depth:.07,bevelEnabled:false,curveSegments:10});fg.translate(0,0,rz-.07);put(st.frame||"frame",fg,F.m);
      const gs=new THREE.Shape();openPath(o,gs);const gg=new THREE.ShapeGeometry(gs,10);gg.translate(0,0,rz-.04);put("glass",gg,F.m);
      if(st.sill!==null){const sb=new THREE.BoxGeometry(o.w+.16,.09,.26);sb.translate(o.u,o.y0-.045,F.d+.03);put(st.sill||"brickPl",sb,F.m)}
      if(st.ring&&o.t!=="rect"&&o.t!=="point")ring(F,o,st.ring);
      if(st.lintel){const lb=new THREE.BoxGeometry(o.w+.3,.24,.05);lb.translate(o.u,o.y1+.12,F.d+.02);put(st.lintel,lb,F.m)}
      if(st.shutter){const sb=new THREE.BoxGeometry(o.w,.26,.1);sb.translate(o.u,o.y1-.13,F.d-.08);put("doorGrey",sb,F.m)}
      if(st.grille){const pg=new THREE.PlaneGeometry(o.w+.2,o.y1-o.y0+.2);pg.translate(o.u,(o.y0+o.y1)/2,F.d+.09);const uv=pg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(o.w+.2)/.5,uv.getY(i)*(o.y1-o.y0+.2)/.5);put("grille",pg,F.m);
        const fr=new THREE.BoxGeometry(o.w+.24,.05,.05);for(const y of [o.y0-.1,o.y1+.1]){const g=fr.clone();g.translate(o.u,y,F.d+.09);put("metal",g,F.m)}}}}
  function ring(F,o,bk,rw=.25){const A=archP(o),pts=[],N=16;
    for(let i=0;i<=N;i++){const t=A.a+(Math.PI-2*A.a)*i/N;pts.push(V2(o.u+(A.R+rw)*Math.cos(t),A.cy+(A.R+rw)*Math.sin(t)))}
    for(let i=N;i>=0;i--){const t=A.a+(Math.PI-2*A.a)*i/N;pts.push(V2(o.u+A.R*Math.cos(t),A.cy+A.R*Math.sin(t)))}
    const g=new THREE.ExtrudeGeometry(new THREE.Shape(pts),{depth:.04,bevelEnabled:false});g.translate(0,0,F.d-.01);put(bk,g,F.m)}
  function recess(F,o,bk,depth=.1){const s=new THREE.Shape();openPath(o,s);const g=new THREE.ShapeGeometry(s,10);g.translate(0,0,F.d-depth);put(bk,g,F.m)}
  function band(F,y0,y1,pr,bk,u0=0,u1=F.len){const g=new THREE.BoxGeometry(u1-u0+2*pr,y1-y0,pr+.02);g.translate((u0+u1)/2,(y0+y1)/2,F.d+pr/2-.01);put(bk,g,F.m)}
  function onFace(F,bk,geo,u,y,z=.01){geo.translate(u,y,F.d+z);put(bk,geo,F.m)}
  function frieze(F,y0,y1){const g=new THREE.PlaneGeometry(F.len,y1-y0),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*F.len/1.2);onFace(F,"frieze",g,F.len/2,(y0+y1)/2,.012)}
  function vent(F,u){onFace(F,"dark",new THREE.BoxGeometry(.5,.2,.02),u,.45,.06)}
  function box(bk,cx,cy,cz,sx,sy,sz,ry=0){const g=new THREE.BoxGeometry(sx,sy,sz);put(bk,g,new THREE.Matrix4().compose(V(cx,cy,cz),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),V(1,1,1)))}
  function beam(bk,a,b,w,t){const d=new THREE.Vector3().subVectors(b,a),L=d.length(),g=new THREE.BoxGeometry(L,w,t);put(bk,g,new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(V(1,0,0),d.normalize()),V(1,1,1)))}
  function cyl(bk,x,y0,z,y1,r=.05){const g=new THREE.CylinderGeometry(r,r,y1-y0,8);g.translate(x,(y0+y1)/2,z);put(bk,g)}
  function polyG(bk,pts,uDir){const n=new THREE.Vector3().subVectors(pts[1],pts[0]).cross(new THREE.Vector3().subVectors(pts[2],pts[0])).normalize(),u=uDir.clone().normalize(),v=new THREE.Vector3().crossVectors(n,u).normalize();
    const P=[],N=[],U=[];for(let i=1;i<pts.length-1;i++)for(const p of [pts[0],pts[i],pts[i+1]]){P.push(p.x,p.y,p.z);N.push(n.x,n.y,n.z);U.push(p.dot(u),p.dot(v))}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(N,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));BK[bk].geos.push(g)}
  const X=V(1,0,0),Z=V(0,0,1);
  function trim(X0,Z0,X1,Z1,y,gut=true){for(const [a,b] of [[V(X0,y,Z1),V(X1,y,Z1)],[V(X1,y,Z0),V(X0,y,Z0)],[V(X1,y,Z1),V(X1,y,Z0)],[V(X0,y,Z0),V(X0,y,Z1)]])beam("wood",a,b,.2,.05);
    if(gut)for(const z of [Z0,Z1]){const g=new THREE.CylinderGeometry(.07,.07,X1-X0,8);g.rotateZ(Math.PI/2);g.translate((X0+X1)/2,y-.1,z+(z===Z1?.05:-.05));put("metal",g)}}
  function hipRoof(bk,x0,z0,x1,z1,e,rH,o){const X0=x0-o,X1=x1+o,Z0=z0-o,Z1=z1+o,w=x1-x0,d=z1-z0,s=(rH-e)/(Math.min(w,d)/2),ye=B0+e-o*s,rh=B0+rH;
    if(w>=d){const hz=(Z0+Z1)/2,i=(Z1-Z0)/2,r0=V(X0+i,rh,hz),r1=V(X1-i,rh,hz);
      polyG(bk,[V(X0,ye,Z1),V(X1,ye,Z1),r1,r0],X);polyG(bk,[V(X1,ye,Z0),V(X0,ye,Z0),r0,r1],X);polyG(bk,[V(X1,ye,Z1),V(X1,ye,Z0),r1],Z);polyG(bk,[V(X0,ye,Z0),V(X0,ye,Z1),r0],Z);return [r0,r1]}
    const hx=(X0+X1)/2,i=(X1-X0)/2,r0=V(hx,rh,Z0+i),r1=V(hx,rh,Z1-i);
    polyG(bk,[V(X1,ye,Z1),V(X1,ye,Z0),r0,r1],Z);polyG(bk,[V(X0,ye,Z0),V(X0,ye,Z1),r1,r0],Z);polyG(bk,[V(X0,ye,Z1),V(X1,ye,Z1),r1],X);polyG(bk,[V(X1,ye,Z0),V(X0,ye,Z0),r0],X);return [r0,r1]}
  function hipFull(bk,x0,z0,x1,z1,e,rH,o,crest){const r=hipRoof(bk,x0,z0,x1,z1,e,rH,o),s=(rH-e)/(Math.min(x1-x0,z1-z0)/2);trim(x0-o,z0-o,x1+o,z1+o,B0+e-o*s);beam("roof",r[0],r[1],.22,.22);if(crest)crestBalls(r[0],r[1])}
  function gableZ(bk,x0,z0,x1,z1,e,rH,oS,oF,oB){const X0=x0-oS,X1=x1+oS,Z0=z0-oB,Z1=z1+oF,cx=(x0+x1)/2,s=(rH-e)/((x1-x0)/2),ye=B0+e-oS*s,rh=B0+rH;
    polyG(bk,[V(X1,ye,Z1),V(X1,ye,Z0),V(cx,rh,Z0),V(cx,rh,Z1)],Z);polyG(bk,[V(X0,ye,Z0),V(X0,ye,Z1),V(cx,rh,Z1),V(cx,rh,Z0)],Z);
    beam(bk,V(cx,rh+.06,Z0),V(cx,rh+.06,Z1),.24,.24);
    for(const z of [Z0,Z1])for(const sx of [X0,X1])beam("timber",V(sx,ye-.05,z),V(cx,rh+.02,z),.32,.07);
    for(const xx of [X0,X1]){const g=new THREE.CylinderGeometry(.07,.07,Z1-Z0,8);g.rotateX(Math.PI/2);g.translate(xx+(xx===X1?.05:-.05),ye-.1,(Z0+Z1)/2);put("metal",g)}
    return {cx,rh,Z0,Z1}}
  function gableX(bk,x0,z0,x1,z1,e,rH,oS,oE){const X0=x0-oE,X1=x1+oE,Z0=z0-oS,Z1=z1+oS,cz=(z0+z1)/2,s=(rH-e)/((z1-z0)/2),ye=B0+e-oS*s,rh=B0+rH;
    polyG(bk,[V(X0,ye,Z1),V(X1,ye,Z1),V(X1,rh,cz),V(X0,rh,cz)],X);polyG(bk,[V(X1,ye,Z0),V(X0,ye,Z0),V(X0,rh,cz),V(X1,rh,cz)],X);
    trim(X0,Z0,X1,Z1,ye)}
  function crestBalls(a,b){const n=Math.max(2,Math.round(a.distanceTo(b)/.55)),sg=new THREE.SphereGeometry(.09,8,6);for(let i=0;i<=n;i++){const p=a.clone().lerp(b,i/n),g=sg.clone();g.translate(p.x,p.y+.2,p.z);put("roof",g)}}
  function flat(bk,x0,z0,x1,z1,y,th,col="wood"){box(bk,(x0+x1)/2,B0+y+th/2,(z0+z1)/2,x1-x0,th,z1-z0);for(const [a,b] of [[V(x0,B0+y+th/2,z1),V(x1,B0+y+th/2,z1)],[V(x0,B0+y+th/2,z0),V(x1,B0+y+th/2,z0)],[V(x0,B0+y+th/2,z0),V(x0,B0+y+th/2,z1)],[V(x1,B0+y+th/2,z0),V(x1,B0+y+th/2,z1)]])beam(col,a,b,th+.06,.06)}
  function plate(tex,w,h,x,y,z,ry=0,ds=false){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),lam({map:tex,side:ds?THREE.DoubleSide:THREE.FrontSide}));m.position.set(x,B0+y,z);m.rotation.y=ry;m.castShadow=true;scene.add(m);return m}

  /* ---------- A: Altbau West mit Rautenfries ---------- */
  {const x0=-332,x1=-318,z0=-84,z1=-66,H=11;let F=face("S",x0,x1,z1);
    const gw=[-328.5,-321.5].map(c=>W(F,c,1.45,1.35,3.3)),pp=[-328.5,-321.5].map(c=>W(F,c,1.6,4.6,7.0,"point"));
    skin(F,H,[...gw,...pp]);windows(F,gw,{ring:"brickArch"});pp.forEach(o=>recess(F,o,"render",.08));band(F,0,.85,.05,"brickPl");frieze(F,9.0,10.8);gw.forEach(o=>vent(F,o.u));
    F=face("E",z0,z1,x1);skin(F,H);frieze(F,9.0,10.8);
    F=face("W",z0,z1,x0);let wl=[-80,-75,-70].flatMap(c=>[W(F,c,1.35,1.35,3.3),W(F,c,1.35,4.9,7.3)]);skin(F,H,wl);windows(F,wl,{ring:"brickArch"});band(F,0,.85,.05,"brickPl");frieze(F,9.0,10.8);
    F=face("N",x0,x1,z0);wl=[-328.5,-321.5].flatMap(c=>[W(F,c,1.35,1.35,3.3),W(F,c,1.35,4.9,7.3)]);skin(F,H,wl);windows(F,wl,{ring:"brickArch"});
    hipFull("roof",x0,z0,x1,z1,H,16,.45)}
  /* ---------- B: Klassentrakt mit Bogenfenstern ---------- */
  {const x0=-318,x1=-293,z0=-82,z1=-70,H=8.3,ax=[-313.6,-308.5,-302.5,-297.4];
    for(const [dir,fz] of [["S",z1],["N",z0]]){const F=face(dir,x0,x1,fz),ws=ax.flatMap(c=>[W(F,c,1.35,1.25,3.35),W(F,c,1.35,4.75,6.95)]);
      skin(F,H,ws);windows(F,ws,{ring:"brickArch"});band(F,0,.85,.05,"brickPl");band(F,H-.62,H,.03,"render");ax.forEach(c=>vent(F,F.toU(c)))}
    hipFull("roof",x0,z0,x1,z1,H,12.4,.5)}
  /* ---------- C: Giebelbau mit Fachwerkgiebel, Reliefs und Putzfeldern ---------- */
  {const x0=-293,x1=-279,z0=-90,z1=-67,H=8.8,G=7.7;let F=face("S",x0,x1,z1);
    const pn=[-288.6,-286,-283.4].map(c=>W(F,c,1.05,1.6,6.3,"rect"));skin(F,H,pn,"brick",G);pn.forEach(o=>recess(F,o,"render",.09));band(F,0,.85,.05,"brickPl");
    [-291.1,-288.6,-286,-283.4,-280.9].forEach((c,i)=>onFace(F,i===2?"reliefKids":"reliefSun",new THREE.BoxGeometry(.95,.92,.06),F.toU(c),7.2,.03));
    band(F,8.4,8.64,.07,"brickArch");band(F,8.64,8.8,.1,"timber");
    // Fachwerk: Gefachbild als Textur, Hölzer als echte Balken davor
    {const L=F.len,cx=L/2,sh=new THREE.Shape([V2(0,H),V2(L,H),V2(cx,H+G)]),g=new THREE.ShapeGeometry(sh),uv=g.attributes.uv,p=g.attributes.position;
      for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/L,(p.getY(i)-H)/G);g.translate(0,0,F.d+.006);put("gable",g,F.m);
      const yRoof=u=>H+G*(1-Math.abs(u-cx)/cx),tb=(u0,y0,u1,y1,w=.17)=>beam("timber",V(u0,y0,F.d+.05).applyMatrix4(F.m),V(u1,y1,F.d+.05).applyMatrix4(F.m),w,.1);
      const yB=H+3.5,yC=H+5.8,s2=cx*(1-3.5/G),s3=cx*(1-5.8/G);
      tb(0,H+.1,L,H+.1,.2);tb(cx-s2,yB,cx+s2,yB);tb(cx-s3,yC,cx+s3,yC);
      for(const o of [-4.65,-1.55,1.55,4.65]){const u=cx+o;tb(u,H+.18,u,Math.min(yB,yRoof(u)-.12))}
      for(const o of [-2.3,-.72,.72,2.3]){const u=cx+o;tb(u,yB+.08,u,Math.min(yC,yRoof(u)-.12))}
      tb(cx-4.65,H+.25,cx-3.1,yB-.1,.14);tb(cx+4.65,H+.25,cx+3.1,yB-.1,.14);
      const o={u:cx,w:1.3,y0:yB+.32,y1:yC-.3,t:"rect",cols:2,rows:3},fs=new THREE.Shape();openPath(o,fs);paneHoles(o,"grid").forEach(h=>fs.holes.push(h));
      const fg=new THREE.ExtrudeGeometry(fs,{depth:.05,bevelEnabled:false});fg.translate(0,0,F.d+.01);put("frame",fg,F.m);
      const gs=new THREE.Shape();openPath(o,gs);const gg=new THREE.ShapeGeometry(gs);gg.translate(0,0,F.d+.012);put("glass",gg,F.m)}
    F=face("E",z0,z1,x1);const ce=[-78.2,-75.2,-72.2,-69.2],we=ce.flatMap(c=>[W(F,c,1.3,1.2,3.55),W(F,c,1.3,4.85,7.45)]);
    skin(F,H,we);windows(F,we,{ring:"brickArch"});band(F,0,.85,.05,"brickPl");band(F,8.45,8.8,.06,"brickArch");ce.forEach(c=>vent(F,F.toU(c)));
    plate(signs.green,1.05,.8,x1+.02,4.15,-73.7,Math.PI/2);
    F=face("W",z0,z1,x0);skin(F,H);band(F,0,.85,.05,"brickPl");band(F,8.45,8.8,.06,"brickArch");
    F=face("N",x0,x1,z0);const gn=[W(F,-286,1.0,H+1.4,H+2.8,"rect",{rows:2})];skin(F,H,gn,"brick",G);windows(F,gn,{});
    const r=gableZ("roof",x0,z0,x1,z1,H,H+G,.45,.65,.3);crestBalls(V(r.cx,B0+H+G+.06,r.Z0),V(r.cx,B0+H+G+.06,r.Z1));
    cyl("metal",x1+.12,.2,-67.4,8.5);cyl("metal",x1+.12,.2,-79.6,8.5)}
  /* ---------- D: Eingangsbau und Windfang ---------- */
  {const x0=-279,x1=-268,z0=-90,z1=-80,H=8.0;let F=face("S",x0,x1,z1);skin(F,H);band(F,0,.85,.05,"brickPl");band(F,H-.3,H,.06,"brickArch");
    onFace(F,"reliefNSW",new THREE.BoxGeometry(2.6,.95,.06),F.len/2,6.4,.03);
    F=face("E",z0,z1,x1);const we=[-87.5,-82.6].flatMap(c=>[W(F,c,1.25,1.2,3.4),W(F,c,1.25,4.7,7.0)]);skin(F,H,we);windows(F,we,{ring:"brickArch"});band(F,0,.85,.05,"brickPl");band(F,H-.3,H,.06,"brickArch");
    hipFull("roof",x0,z0,x1,z1,H,11.2,.45,true);
    const px0=-276.6,px1=-270.4,pz0=-80,pz1=-77,PH=4.4,pc=(px0+px1)/2;
    F=face("S",px0,px1,pz1,.32);const dr=W(F,pc,2.1,0,2.35,"round");skin(F,PH,[dr]);band(F,0,.5,.04,"brickPl");ring(F,dr,"brickArch",.24);
    {const s=new THREE.Shape();openPath(dr,s);const g=new THREE.ShapeGeometry(s,12),p=g.attributes.position,uv=g.attributes.uv,u0=dr.u-dr.w/2,ht=dr.y1+dr.w/2;
      for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-u0)/dr.w,p.getY(i)/ht);g.translate(0,0,F.d-.3);put("door",g,F.m);
      const sf=new THREE.ShapeGeometry(s,12);sf.translate(0,0,F.d-.34);put("dark",sf,F.m)}
    plate(signs.green,.9,.62,pc,3.95,pz1+.012);
    F=face("E",pz0,pz1,px1,.32);skin(F,PH);F=face("W",pz0,pz1,px0,.32);skin(F,PH);
    hipFull("roof",px0,pz0,px1,pz1,PH,5.4,.35,true);
    box("stone",pc,B0+.08,pz1+.5,2.9,.16,1.0);box("stone",pc,B0+.2,pz1+.2,2.6,.16,.4)}
  /* ---------- E: Erweiterungsbau mit Laubengang und Außentreppe ---------- */
  {const x0=-296,x1=-268,z0=-106,z1=-90,H=7.6;
    let F=face("E",z0,z1,x1,.3);const ax=[-103.6,-100.2,-96.8,-93.4],we=ax.flatMap(c=>[W(F,c,2.2,.8,2.6,"rect",{cols:2}),W(F,c,2.2,4.3,6.3,"rect",{cols:2})]);
    skin(F,H,we,"brickRed");windows(F,we,{frame:"frameGrey",panes:"modern",sill:"concrete",recess:.12});band(F,3.45,3.75,.02,"concrete");band(F,7.1,7.6,.02,"concrete");band(F,0,.35,.02,"concrete");
    for(let z=z0+.6;z<z1-.4;z+=.13)box("white",x1+1.0,B0+.75,z,.03,.9,.03);box("white",x1+1.0,B0+1.2,(z0+z1)/2,.06,.05,z1-z0-.8);box("brickRed",x1+1.0,B0+.15,(z0+z1)/2,.25,.3,z1-z0-.6);
    F=face("N",x0,x1,z0,.3);const wn=[W(F,-293.5,1.2,3.9,6.2,"rect",{cols:1,rows:2}),...[-287.5,-281,-274.5].map(c=>W(F,c,2.2,4.3,6.3,"rect",{cols:2}))];
    skin(F,H,wn,"brickRed");windows(F,wn,{frame:"frameGrey",panes:"modern",sill:"concrete",recess:.12});band(F,3.45,3.75,.02,"concrete");band(F,7.1,7.6,.02,"concrete");
    band(F,0,3.0,.02,"whiteBrick",0,F.len);
    onFace(F,"doorGrey",new THREE.BoxGeometry(1.1,2.2,.06),F.toU(-285.2),1.1,.05);onFace(F,"doorGrey",new THREE.BoxGeometry(.95,2.1,.06),F.toU(-282.8),1.05,.05);
    onFace(F,"glass",new THREE.BoxGeometry(1.0,.9,.04),F.toU(-280.4),1.8,.05);onFace(F,"frameGrey",new THREE.BoxGeometry(2.6,2.6,.05),F.toU(-271.6),1.3,.04);onFace(F,"glass",new THREE.BoxGeometry(2.3,2.35,.05),F.toU(-271.6),1.25,.06);
    onFace(F,"muralTri",new THREE.PlaneGeometry(3.0,2.7),F.toU(-277.2),1.55,.04);
    plate(signs.wc,.32,.32,-285.2,1.6,z0-.39,Math.PI);
    F=face("W",z0,z1,x0,.3);const ww=[-103,-98.5,-94].flatMap(c=>[W(F,c,2.0,.9,2.6,"rect",{cols:2}),W(F,c,2.0,4.3,6.3,"rect",{cols:2})]);skin(F,H,ww,"brickRed");windows(F,ww,{frame:"frameGrey",panes:"modern",sill:"concrete",recess:.12});band(F,3.45,3.75,.02,"concrete");band(F,7.1,7.6,.02,"concrete");
    F=face("S",x0,-293,z1,.3);skin(F,H,[],"brickRed");
    flat("flatRoof",x0-.45,z0-.45,x1+.45,z1+.45,H,.32);
    // Laubengang
    box("quarry",(x0+x1)/2,B0+.05,z0-1.8,x1-x0,.04,3.6);box("wood",(x0+x1)/2,B0+3.1,z0-1.8,x1-x0,.2,3.6);box("green",(x0+x1)/2,B0+3.05,z0-3.6,x1-x0,.32,.06);
    for(let x=x0+1;x<x1-.5;x+=3.1){box("red",x,B0+1.5,z0-3.45,.12,3.0,.12)}cyl("red",x1-1.6,.1,z0-3.3,3.0,.06);
    // Außentreppe zur Tür im Obergeschoss
    const sx0=-286.5,sx1=-292,sz=-110.7,top=3.85,n=14;for(let i=0;i<n;i++){const t=(i+.5)/n;box("metal",sx0+(sx1-sx0)*t,B0+top*t,sz,.3,.05,1.1)}
    for(const dz of [-.58,.58]){beam("metal",V(sx0+.2,B0,sz+dz),V(sx1,B0+top,sz+dz),.22,.05);beam("metal",V(sx0+.1,B0+1.0,sz+dz),V(sx1,B0+top+1.0,sz+dz),.05,.05);
      for(let i=1;i<n;i+=3){const t=i/n;cyl("metal",sx0+(sx1-sx0)*t,top*t,sz+dz,top*t+1.0,.025)}}
    box("metal",-293.6,B0+top,-110.7,3.2,.08,1.8);for(const [x,z] of [[-295.1,-111.5],[-295.1,-109.9],[-292.1,-111.5]])cyl("metal",x,0,z,top+1.0,.04);
    box("metal",-293.6,B0+top+1.0,-111.58,3.2,.05,.05);box("metal",-295.18,B0+top+1.0,-110.7,.05,.05,1.8)}
  /* ---------- Turnhalle mit Umkleidetrakt ---------- */
  {let x0=-292,x1=-266,z0=-132,z1=-125,H=3.6;let F=face("S",x0,x1,z1,.3);
    const wl=[-288.5,-285,-281.5,-273.5,-270].map(c=>W(F,c,1.6,1.1,2.2,"rect",{cols:3})),ni=W(F,-277.5,2.2,0,3.0,"rect");
    skin(F,H,[...wl,ni],"renderTH");windows(F,wl,{frame:"white",sill:"concrete",recess:.1,grille:true});band(F,0,.75,.02,"plinth");
    const nz=z1-1.1;box("creamBrick",-278.68,B0+1.5,z1-.55,.12,3.0,1.1);box("creamBrick",-276.32,B0+1.5,z1-.55,.12,3.0,1.1);box("concrete",-277.5,B0+3.05,z1-.55,2.4,.12,1.1);
    {const g=new THREE.PlaneGeometry(2.0,2.9);g.translate(-277.5,B0+1.45,nz+.01);put("doorTH",g)}box("creamBrick",-277.5,B0+1.5,nz-.06,2.4,3.0,.1);
    cyl("white",-275.9,.1,z1+.08,3.5,.05);
    for(const [dir,fz] of [["E",x1],["W",x0]]){F=face(dir,z0,z1,fz,.3);skin(F,H,[],"renderTH");band(F,0,.75,.02,"plinth")}
    flat("flatRoof",x0-.6,z0,x1+.6,z1+.6,H,.25,"dark");
    x0=-290;x1=-268;z0=-148;z1=-132;H=7.0;
    F=face("S",x0,x1,z1,.3);const cw=[-286,-282,-278,-274].map(c=>W(F,c,1.6,4.6,6.2,"rect",{cols:2,rows:2}));skin(F,H,cw,"renderTH");windows(F,cw,{frame:"frameGrey",sill:"concrete",recess:.1});
    F=face("N",x0,x1,z0,.3);const nw=[-286,-280,-274].map(c=>W(F,c,1.6,4.6,6.2,"rect",{cols:2,rows:2}));skin(F,H,nw,"renderTH");windows(F,nw,{frame:"frameGrey",sill:"concrete",recess:.1});band(F,0,.75,.02,"plinth");
    for(const [dir,fz] of [["E",x1],["W",x0]]){F=face(dir,z0,z1,fz,.3);const hw=[-144,-140,-136].map(c=>W(F,c,1.3,4.2,5.8,"rect",{cols:2}));skin(F,H,hw,"renderTH",1.3);windows(F,hw,{frame:"frameGrey",sill:"concrete",recess:.1});band(F,0,.75,.02,"plinth")}
    gableX("roofMetal",x0,z0,x1,z1,H,8.3,.5,.4);
    box("brickRed",-269.6,B0+5.3,-133,.8,10.6,.8);box("concrete",-269.6,B0+10.65,-133,.95,.12,.95)}
  /* ---------- Nachbarhaus (weiß verputzt) ---------- */
  {const x0=-258,x1=-245,z0=-82,z1=-66,H=8.6;let F=face("S",x0,x1,z1);
    const ws=[-255.2,-248].flatMap(c=>[.9,3.6,6.3].map(y=>W(F,c,1.2,y,y+1.35,"rect",{cols:1})));skin(F,H,[...ws,W(F,-251.6,1.1,.1,2.3,"rect")],"renderW",4.4);windows(F,ws,{sill:"concrete",shutter:true});
    onFace(F,"wood",new THREE.BoxGeometry(1.0,2.15,.06),F.toU(-251.6),1.2,-.2);band(F,0,.5,.02,"plinth");
    F=face("W",z0,z1,x0);const wwv=[-79,-74,-69].flatMap(c=>[.9,3.6,6.3].map(y=>W(F,c,1.2,y,y+1.35,"rect",{cols:2})));skin(F,H,wwv,"renderW");windows(F,wwv,{sill:"concrete",shutter:true});band(F,0,.5,.02,"plinth");
    F=face("E",z0,z1,x1);skin(F,H,[],"renderW");F=face("N",x0,x1,z0);skin(F,H,[],"renderW",4.4);
    gableZ("roofRed",x0,z0,x1,z1,H,H+4.4,.4,.45,.4)}
  /* ---------- Einfriedung: Mäuerchen mit Schmiedezaun, Torpfeiler, Tore ---------- */
  {const zf=-63.6,fx0=-334,fx1=-276.5,L=fx1-fx0;
    box("brickLow",(fx0+fx1)/2,B0+.3,zf,L,.6,.4);box("brickArch",(fx0+fx1)/2,B0+.66,zf,L+.04,.12,.48);
    const fg=new THREE.PlaneGeometry(L,1.25),uv=fg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*L/2);fg.translate((fx0+fx1)/2,B0+.72+.625,zf);put("fenceIron",fg);
    for(let x=fx0+.05;x<fx1;x+=2)box("iron",x,B0+1.35,zf,.06,1.3,.06);
    for(const px of [-276.2,-271.0,-265.3]){box("brickPillar",px,B0+1.2,zf,.6,2.4,.6);box("stone",px,B0+2.46,zf,.74,.12,.74);const c=new THREE.ConeGeometry(.52,.45,4);c.rotateY(Math.PI/4);c.translate(px,B0+2.745,zf);put("stone",c)}
    box("brickPillar",-263.1,B0+.9,zf,3.8,1.8,.4);box("brickArch",-263.1,B0+1.86,zf,3.84,.12,.48);
    const gate=(hx,len,ang,dir)=>{const n=Math.round(len/.14),m=new THREE.Matrix4().compose(V(hx,B0,zf-.05),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ang,0)),V(1,1,1));
      const add=(g)=>put("metal",g,m);const bx=(cx,cy,sx,sy)=>{const g=new THREE.BoxGeometry(sx,sy,.05);g.translate(dir*cx,cy,0);add(g)};
      bx(len/2,.12,len,.06);bx(len/2,1.85,len,.06);bx(.03,1.0,.06,1.8);bx(len-.03,1.0,.06,1.8);for(let i=1;i<n;i++)bx(i*len/n,1.0,.025,1.75);return m};
    // Tor vor dem Windfang (geöffnet) und Feuerwehrzufahrt (geöffnet)
    gate(-275.9,2.3,1.25,1);gate(-271.3,2.3,-1.25,-1);
    const m1=gate(-270.7,2.6,1.35,1);gate(-265.6,2.6,-1.35,-1);
    const sg=(tex,w,h,lx,ly)=>{const g=new THREE.PlaneGeometry(w,h);g.translate(lx,ly,.04);g.applyMatrix4(m1);const msh=new THREE.Mesh(g,lam({map:tex,side:THREE.DoubleSide}));scene.add(msh)};
    sg(signs.fw,.8,.2,.75,1.62);sg(signs.gute,.75,.42,1.75,1.45);
    plate(signs.logo,.42,.42,-271.0,1.75,zf+.31);plate(signs.th,.33,.44,-265.3,1.5,zf+.31);
    // weiße Hofmauer entlang der Feuerwehrzufahrt mit Pfeilern und Wandbildern
    const wx=-261.5;box("whiteBrick",wx,B0+1.15,(-149.8-63.4)/2,.6,2.3,86.4);box("concrete",wx,B0+2.34,(-149.8-63.4)/2,.7,.08,86.5);
    for(let z=-66;z>-149;z-=2.5)box("whiteBrick",wx-.34,B0+1.2,z,.1,2.4,.42);
    for(const [mz,mat] of [[-95,"mural"],[-88,"mural"],[-118,"muralPeople"]]){const g=new THREE.PlaneGeometry(4.6,1.8);g.rotateY(Math.PI/2);g.translate(wx-.31,B0+1.2,mz);put(mat,g)}}
  /* ---------- Gelände: Gehweg vor der Schule, Rinne, Hof, Vorgärten ---------- */
  {const flatG=(bk,x0,z0,x1,z1,y)=>{const g=new THREE.PlaneGeometry(x1-x0,z1-z0);g.rotateX(-Math.PI/2);g.translate((x0+x1)/2,y,(z0+z1)/2);put(bk,g)};
    flatG("paver",-345,-63.4,-198,-56.05,SIDE_Y+.003);
    if(!MG.XF)for(let x=-345;x<=-198;x+=.5)for(let z=-63.4;z<=-56;z+=.5){const i=gi(x,z);if(i>=0&&!(surf[i]&4))surf[i]|=8}
    flatG("cobble",-345,-53.66,-198,-53.2,ROAD_Y+.004);flatG("cobble",-345,-46.8,-198,-46.34,ROAD_Y+.004);
    flatG("yard",-334,-149.8,-261.5,-63.4,B0+.012);
    flatG("grass",-334,-66,-318,-63.8,B0+.03);flatG("grass",-318,-70,-293,-63.8,B0+.03);flatG("grass",-293,-67,-279,-63.8,B0+.03);flatG("grass",-334,-84,-332,-66,B0+.03);
    for(const [x,z] of [[-266.5,-50.9],[-303,-48.0]]){const g=new THREE.CircleGeometry(.33,20);g.rotateX(-Math.PI/2);g.translate(x,ROAD_Y+.006,z);put("manhole",g)}
    // Baumscheiben mit Bordstein
    for(const [x,z,r] of [[-308,-118,2.4],[-286,-118,2.2],[-322,-140,1.9],[-300,-142.5,1.9]]){const s=new THREE.Shape();s.absarc(0,0,r,0,Math.PI*2,false);const h=new THREE.Path();h.absarc(0,0,r-.18,0,Math.PI*2,true);s.holes.push(h);
      const g=new THREE.ExtrudeGeometry(s,{depth:.15,bevelEnabled:false,curveSegments:24});g.rotateX(-Math.PI/2);g.translate(x,B0,z);put("concrete",g);
      const c=new THREE.CircleGeometry(r-.18,24);c.rotateX(-Math.PI/2);c.translate(x,B0+.11,z);put("grass",c)}
    // Pfützen
    for(const [x,z,r] of [[-279,-115,1.4],[-300,-127,1.1],[-265,-100,.9],[-312,-90,1.3],[-292,-112,.8]]){const pts=[];for(let i=0;i<14;i++){const a=i/14*Math.PI*2,k=r*(.75+h01(i*7+x)*.5);pts.push(V2(Math.cos(a)*k*1.4,Math.sin(a)*k))}
      const g=new THREE.ShapeGeometry(new THREE.Shape(pts));g.rotateX(-Math.PI/2);g.translate(x,B0+.022,z);put("puddle",g)}
    // Hecken und Ilex im Vorgarten
    for(const [x,z,sx,sy,sz] of [[-326,-64.9,1.3,1.1,.9],[-313,-65.6,1.2,1.0,1.0],[-299.5,-66.8,1.6,2.6,1.4],[-295,-65.0,1.0,.9,.8],[-281,-65.2,1.0,1.0,.8],[-333,-75,.8,1.2,1.2]]){const g=new THREE.IcosahedronGeometry(1,1);g.scale(sx,sy,sz);g.translate(x,B0+sy*.9,z);put("bush",g)}}
  /* ---------- Hofausstattung ---------- */
  {box("concrete",-312,B0+.76,-136,2.74,.07,1.52);box("dark",-312,B0+.88,-136,.03,.16,1.6);for(const dx of [-.9,.9])box("concrete",-312+dx,B0+.38,-136,.12,.74,1.2);
    box("white",-328,B0+.95,-146.5,1.7,1.9,1.3);gableZ("roof",-328.85,-147.15,-327.15,-145.85,1.9,2.4,.12,.12,.12);
    cyl("metal",-300,0,-148.9,3.6,.06);box("metal",-300,B0+3.5,-148.75,1.2,.9,.04);{const t=new THREE.TorusGeometry(.23,.02,6,16);t.rotateX(Math.PI/2);t.translate(-300,B0+3.1,-148.45);put("red",t)}
    for(const x of [-322,-318.5,-315])box("woodLight",x,B0+.45,-149.1,2.6,.07,.36);for(const x of [-323.2,-320.8,-319.7,-317.3,-316.2,-313.8])box("concrete",x,B0+.21,-149.1,.12,.42,.32);
    for(const z of [-122,-126])box("woodLight",-333.2,B0+.45,z,.36,.07,2.6);
    const planter=(bk,x,z,s=1)=>{const g=new THREE.CylinderGeometry(.42*s,.3*s,.6*s,4);g.rotateY(Math.PI/4);g.translate(x,B0+.3*s,z);put(bk,g)};
    planter("yellow",-265.2,-78.6);planter("teal",-284.2,-112.6);planter("red",-306,-147.4,.8);
    for(const [x,lid] of [[-278.5,"teal"],[-277.75,"yellow"],[-277.0,"dark"]]){box("bin",x,B0+.5,-65.0,.6,1.0,.7);box(lid,x,B0+1.03,-65.0,.62,.06,.74)}
    cyl("metal",-327.6,0,-57.4,2.9,.04);plate(signs.bus,.5,.75,-327.6,2.45,-57.36,0,true);
    for(const [x,z] of [[-318,-69.6],[-293.2,-69.5],[-332.2,-66.4]])cyl("metal",x,.2,z,8.4,.05)}

  /* ---------- zusammenführen: je Material ein Mesh ---------- */
  for(const k in BK){const b=BK[k];if(!b.geos.length)continue;let n=0;for(const g of b.geos)n+=g.attributes.position.count;
    const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
    for(const g of b.geos){if(!g.attributes.normal)g.computeVertexNormals();const p=g.attributes.position,nn=g.attributes.normal,uv=g.attributes.uv;P.set(p.array,o*3);N.set(nn.array,o*3);
      if(b.wuv){for(let i=0;i<p.count;i++){const ax=Math.abs(nn.getX(i)),ay=Math.abs(nn.getY(i)),az=Math.abs(nn.getZ(i));let u,v;
          if(ay>=ax&&ay>=az){u=p.getX(i);v=p.getZ(i)}else if(ax>=az){u=p.getZ(i);v=p.getY(i)}else{u=p.getX(i);v=p.getY(i)}U[(o+i)*2]=u/b.wuv;U[(o+i)*2+1]=v/b.wuv}}
      else if(uv)U.set(uv.array,o*2);o+=p.count}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(P,3));g.setAttribute("normal",new THREE.BufferAttribute(N,3));g.setAttribute("uv",new THREE.BufferAttribute(U,2));g.computeBoundingSphere();
    const m=new THREE.Mesh(g,b.mat);m.castShadow=b.cast;m.receiveShadow=true;if(!b.cast)m.renderOrder=-1;scene.add(m)}
}

/* ---------- Zeichnungen für die Schultexturen ---------- */
function gableArt(c){const S=100,L=14,G=7.7,Wd=L*S,Hd=G*S,cy=y=>Hd-y*S;
  c.fillStyle="#e1d8be";c.fillRect(0,0,Wd,Hd);noise(c,Wd,Hd,26000,["rgba(0,0,0,.06)","rgba(255,255,255,.12)"],2);
  // unteres Gefach: Fischgrätmauerwerk mit hellen Dreiecksfeldern
  const posts=[0,2.35,5.45,8.55,11.65,14];
  for(let k=0;k<posts.length-1;k++){const a=posts[k]*S,b=posts[k+1]*S;c.save();c.beginPath();c.rect(a,cy(3.5),b-a,3.5*S);c.clip();
    c.fillStyle="#5a2b22";c.fillRect(a,cy(3.5),b-a,3.5*S);
    for(let gx=a-40;gx<b+40;gx+=17)for(let gy=cy(3.5)-20;gy<Hd+20;gy+=17){const alt=(Math.round(gx/17)+Math.round(gy/17))%2;c.save();c.translate(gx,gy);c.rotate(alt?Math.PI/4:-Math.PI/4);c.fillStyle=pick(["#6a3226","#5c2a20","#74382a","#4e251d"]);c.fillRect(-11,-3,22,6);c.restore()}
    if(k>0&&k<posts.length-2){c.fillStyle="#e5ddc5";const m=(a+b)/2;c.beginPath();c.moveTo(a,Hd);c.lineTo(a+(m-a)*.55,Hd);c.lineTo(a,Hd-1.25*S);c.closePath();c.fill();c.beginPath();c.moveTo(b,Hd);c.lineTo(b-(b-m)*.55,Hd);c.lineTo(b,Hd-1.25*S);c.closePath();c.fill();
      c.strokeStyle="rgba(120,105,80,.6)";c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.arc(a+20,Hd-20,22+i*14,-Math.PI/2,0);c.stroke();c.beginPath();c.arc(b-20,Hd-20,22+i*14,Math.PI,Math.PI*1.5);c.stroke()}}
    if(k===2){c.strokeStyle="#e5ddc5";c.lineWidth=10;const m=(a+b)/2,y=cy(1.75);c.beginPath();c.moveTo(m,y-120);c.lineTo(m+90,y);c.lineTo(m,y+120);c.lineTo(m-90,y);c.closePath();c.stroke()}
    c.restore()}
  // oberes Gefach: Putzfelder mit leichtem Relief
  c.fillStyle="rgba(150,140,110,.18)";for(const u of [4.8,9.2]){c.beginPath();c.ellipse(u*S,cy(4.6),45,30,0,0,7);c.fill()}}
function friezeArt(c){const S=200;c.fillStyle="#4f2720";c.fillRect(0,0,240,360);
  for(let y=0;y<360;y+=16)for(let x=-(y/16%2)*24;x<240;x+=48){c.fillStyle=pick(["#5a2b22","#4a241d","#62302a","#3f1f1a"]);c.fillRect(x+2,y+2,44,12)}
  c.fillStyle="#e3dbc4";for(const x of [20,100,180])c.fillRect(x,0,32,200);
  c.fillRect(0,206,240,12);for(let x=-20;x<260;x+=40){c.beginPath();c.moveTo(x,250);c.lineTo(x+20,228);c.lineTo(x+40,250);c.lineTo(x+20,272);c.closePath();c.fill()}
  c.fillRect(0,290,240,10);for(let x=0;x<260;x+=40){c.beginPath();c.moveTo(x,322);c.lineTo(x+10,310);c.lineTo(x+20,322);c.lineTo(x+10,334);c.closePath();c.fill()}
  noise(c,240,360,1500,["rgba(0,0,0,.1)","rgba(255,255,255,.06)"],2)}
function reliefArt(c,kind){const W=c.canvas.width,H=c.canvas.height;c.fillStyle="#d9d0b7";c.fillRect(0,0,W,H);noise(c,W,H,3000,["rgba(0,0,0,.07)","rgba(255,255,255,.12)"],2);
  c.strokeStyle="rgba(110,100,80,.6)";c.lineWidth=6;c.strokeRect(5,5,W-10,H-10);
  const shade=(draw)=>{c.save();c.translate(4,4);c.fillStyle="#a39a82";draw();c.restore();c.fillStyle="#efe8d4";draw()};
  if(kind==="sun"){c.save();c.translate(W/2,H/2);for(let i=0;i<22;i++){c.save();c.rotate(i/22*Math.PI*2);shade(()=>{c.beginPath();c.ellipse(0,-70,11,36,0,0,7);c.fill()});c.restore()}
    shade(()=>{c.beginPath();c.arc(0,0,36,0,7);c.fill()});c.strokeStyle="rgba(120,110,90,.7)";c.lineWidth=2;for(let k=-30;k<=30;k+=8){c.beginPath();c.moveTo(k,-30);c.lineTo(k+20,30);c.stroke();c.beginPath();c.moveTo(k+20,-30);c.lineTo(k,30);c.stroke()}c.restore()}
  else if(kind==="kids"){for(const [x,s] of [[80,1],[176,-1]]){shade(()=>{c.beginPath();c.arc(x,78,22,0,7);c.fill();c.beginPath();c.ellipse(x,140,30,44,s*.25,0,7);c.fill();c.fillRect(x-30*s-(s<0?0:0),170,s*60,22)})}
    shade(()=>{c.beginPath();c.ellipse(128,150,18,12,0,0,7);c.fill()})}
  else{c.save();c.translate(0,H/2);for(let x=30;x<W-20;x+=60){shade(()=>{c.beginPath();c.ellipse(x,-10,22,34,.5,0,7);c.fill();c.beginPath();c.ellipse(x+22,20,14,22,-.6,0,7);c.fill()})}
    c.strokeStyle="rgba(120,110,90,.7)";c.lineWidth=5;c.beginPath();for(let x=10;x<W;x+=10)c.lineTo(x,48+Math.sin(x/18)*8);c.stroke();c.restore()}}
function doorArt(c){const W=512,H=768;c.fillStyle="#3f2418";c.fillRect(0,0,W,H);noise(c,W,H,9000,["rgba(0,0,0,.15)","rgba(255,220,180,.05)"],2);
  c.fillStyle="#5a3424";for(const x of [40,276]){c.fillRect(x,430,196,140);c.fillRect(x,590,196,140)}c.strokeStyle="rgba(0,0,0,.45)";c.lineWidth=4;for(const x of [40,276]){c.strokeRect(x,430,196,140);c.strokeRect(x,590,196,140)}
  c.fillStyle="rgba(0,0,0,.6)";c.fillRect(254,240,4,528);
  const glass=(x,y,w,h,arch)=>{c.save();c.beginPath();if(arch){c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.arc(x+w/2,y+w/2,w/2,Math.PI,0);c.lineTo(x+w,y+h)}else c.rect(x,y,w,h);c.closePath();c.clip();
    c.fillStyle="#9fb0b2";c.fillRect(x,y,w,h);c.strokeStyle="#2a2a28";c.lineWidth=3;for(let k=-h;k<w+h;k+=26){c.beginPath();c.moveTo(x+k,y);c.lineTo(x+k+h,y+h);c.stroke();c.beginPath();c.moveTo(x+k+h,y);c.lineTo(x+k,y+h);c.stroke()}c.restore()};
  glass(70,250,136,160,true);glass(306,250,136,160,true);glass(10,10,492,220,false);
  c.fillStyle="#3f2418";c.fillRect(0,228,W,16);c.fillStyle="#b9b4a8";c.fillRect(226,470,10,40);c.fillRect(276,470,10,40)}
function doorTHArt(c){c.fillStyle="#d9dcda";c.fillRect(0,0,256,384);c.fillStyle="#3a4148";c.fillRect(8,8,240,70);for(let x=14;x<244;x+=16){c.fillStyle="#e8ebe9";c.fillRect(x,8,6,70)}
  c.fillStyle="#cfd3d1";c.fillRect(0,80,256,6);c.fillStyle="#8b8f8e";c.fillRect(126,86,4,298);
  for(const x0 of [14,136])for(let k=0;k<4;k++){const x=x0+k*27;c.fillStyle=k%2?"#2f363c":"#9ea8ae";c.fillRect(x,100,18,230);c.fillStyle="#eef0ee";c.fillRect(x+18,96,7,240)}
  c.fillStyle="#9aa0a3";c.fillRect(112,210,30,8)}
function muralArt(c,kind){const W=c.canvas.width,H=c.canvas.height;c.fillStyle="#efebe3";c.fillRect(0,0,W,H);c.fillStyle="rgba(150,140,125,.35)";for(let y=0;y<H;y+=16){c.fillRect(0,y,W,2);for(let x=(y/16%2)*24;x<W;x+=48)c.fillRect(x,y,2,16)}
  if(kind==="bricks"){for(const cx0 of [140,560])for(let i=0;i<70;i++){const y=Math.floor(Math.random()*12)*16+20,x=cx0+Math.floor((Math.random()-.5)*10)*48+(y/16%2)*24;c.fillStyle=pick(["#e2382b","#f2c230","#2f8ee0","#3dbb5c","#f08a24"]);c.fillRect(x+2,y+2,44,12)}}
  else if(kind==="people"){for(let i=0;i<7;i++){const x=80+i*130,s=.9+Math.random()*.3;c.fillStyle=pick(["#d13b3b","#3a79d1","#e9b72e","#3aa058","#7a4bc2","#e0702b"]);c.beginPath();c.arc(x,60,16*s,0,7);c.fill();c.beginPath();c.moveTo(x-22*s,90);c.lineTo(x+22*s,90);c.lineTo(x+16*s,170);c.lineTo(x+28*s,240);c.lineTo(x+10*s,240);c.lineTo(x,180);c.lineTo(x-10*s,240);c.lineTo(x-28*s,240);c.lineTo(x-16*s,170);c.closePath();c.fill();c.fillRect(x-40*s,92,80*s,12)}}
  else{for(let i=0;i<60;i++){const x=Math.random()*W*.55,y=Math.random()*H,s=20+Math.random()*60;c.fillStyle=pick(["#d9241f","#f0c22b","#f07a1f","#9e1b1b"]);c.beginPath();c.moveTo(x,y);c.lineTo(x+s,y+s*.3);c.lineTo(x+s*.2,y+s);c.closePath();c.fill()}
    for(let i=0;i<14;i++){const x=W*.55+Math.random()*W*.4,y=Math.random()*H,s=10+Math.random()*35;c.fillStyle=pick(["#d9241f","#f0c22b","#f07a1f"]);c.beginPath();c.moveTo(x,y);c.lineTo(x+s,y+s*.4);c.lineTo(x+s*.3,y+s);c.closePath();c.fill()}}}
function manholeArt(c){c.fillStyle="#2b2c2e";c.beginPath();c.arc(64,64,62,0,7);c.fill();c.strokeStyle="#55575a";c.lineWidth=5;c.beginPath();c.arc(64,64,54,0,7);c.stroke();c.lineWidth=3;for(let r=12;r<50;r+=10){c.beginPath();c.arc(64,64,r,0,7);c.stroke()}}
function fenceArt(c){c.clearRect(0,0,512,320);c.strokeStyle="#3a3f43";c.fillStyle="#3a3f43";c.lineCap="round";
  c.lineWidth=7;c.beginPath();c.moveTo(0,312);c.lineTo(512,312);c.stroke();
  const top=x=>40+48*Math.sin(Math.PI*x/512);c.beginPath();for(let x=0;x<=512;x+=8)c.lineTo(x,top(x));c.stroke();
  for(let x=12,i=0;x<512;x+=24,i++){c.lineWidth=5;c.beginPath();if(i%2===0){c.moveTo(x,312);c.lineTo(x,22);c.stroke();c.beginPath();c.ellipse(x,16,6,13,0,0,7);c.fill()}
    else{c.moveTo(x,312);for(let y=312;y>=top(x);y-=6)c.lineTo(x+Math.sin((312-y)/26)*9*Math.min(1,(312-y)/60)*Math.min(1,(y-top(x))/40),y);c.stroke()}}}
function signArt(c,k){const W=c.canvas.width,H=c.canvas.height;const txt=(t,y,s,col="#111",f="bold")=>{c.fillStyle=col;c.font=`${f} ${s}px Rubik,Arial,sans-serif`;c.textAlign="center";c.textBaseline="middle";c.fillText(t,W/2,y,W-16)};
  if(k==="logo"){c.fillStyle="#fff";c.fillRect(0,0,W,H);for(let i=0;i<9;i++){c.fillStyle=pick(["#e2382b","#f2c230","#2f8ee0","#3dbb5c","#f08a24","#8a4bd1"]);c.beginPath();c.ellipse(W/2+Math.cos(i*.7-2.2)*55,95+Math.sin(i*.7-2.2)*50,18,10,i*.7,0,7);c.fill()}c.fillStyle="#6b4a2b";c.fillRect(W/2-6,110,12,60);txt("GHS Dohr",210,34,"#335")}
  else if(k==="green"){c.fillStyle="#86b56f";c.fillRect(0,0,W,H);c.strokeStyle="#e9f1e2";c.lineWidth=6;c.strokeRect(10,10,W-20,H-20);c.fillStyle="#f2f6ee";c.beginPath();c.arc(W/2,H/2,48,0,7);c.fill();c.fillStyle="#86b56f";for(let i=0;i<6;i++){c.beginPath();c.ellipse(W/2+Math.cos(i)*22,H/2+Math.sin(i)*22,9,16,i,0,7);c.fill()}}
  else if(k==="gute"){c.fillStyle="#1f4f9e";c.fillRect(0,0,W,H);txt("GUTE SCHULE",H*.42,40,"#fff","bold italic");c.fillStyle="#fff";c.fillRect(0,H*.72,W,H*.28)}
  else if(k==="fw"){c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#d21f1f";c.lineWidth=12;c.strokeRect(6,6,W-12,H-12);txt("Feuerwehrzufahrt",H/2,62,"#d21f1f")}
  else if(k==="th"){c.fillStyle="#fff";c.fillRect(0,0,W,H);txt("Turnhalle",70,34);txt("Am Torfbend",120,30);txt("→",190,70)}
  else if(k==="wc"){c.fillStyle="#f3eedd";c.fillRect(0,0,W,H);txt("WC ♿",H/2,40)}
  else if(k==="bus"){c.fillStyle="#f6d21c";c.fillRect(0,0,W,H);c.fillStyle="#2f8a3a";c.beginPath();c.arc(W/2,95,78,0,7);c.fill();c.fillStyle="#f6d21c";c.beginPath();c.arc(W/2,95,60,0,7);c.fill();txt("H",98,96,"#2f8a3a");c.fillStyle="#fff";c.fillRect(14,190,W-28,170);txt("Schule",225,34);txt("Torfbend",265,34);txt("020  022",320,30,"#333","normal")}}

function buildSigns(){
  const seen=new Set(),pole=paint("#6b7178");
  for(const r of roads){if(!r.n||seen.has(r.n)||r.i.length<2)continue;seen.add(r.n);
    const x0=nx(r.i[0]),y0=ny(r.i[0]),x1=nx(r.i[1]),y1=ny(r.i[1]),L=Math.hypot(x1-x0,y1-y0)||1,dx=(x1-x0)/L,dy=(y1-y0)/L,off=r.w/2+(r.c?1.5:.6);
    const d=Math.min(9,L*.4),x=x0+dx*d-dy*off,y=y0+dy*d+dx*off; if(blockedGround(x,y))continue;
    const gy=groundY(x,y);boxAt(.08,2.7,.08,pole,x,gy+1.35,y);
    const t=canvasTex(512,112,(c)=>{c.fillStyle="#fff";c.fillRect(0,0,512,112);c.strokeStyle="#111";c.lineWidth=8;c.strokeRect(4,4,504,104);c.fillStyle="#111";c.font="bold 58px Rubik,Arial,sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(r.n,256,60,480)});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(2,.44),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,gy+2.5,y);m.rotation.y=-Math.atan2(dy,dx);scene.add(m)}
  for(const sg of MG.signs||[]){const gy=groundY(sg.x,sg.y);boxAt(.07,2.5,.07,pole,sg.x,gy+1.25,sg.y);
    const t=canvasTex(128,128,c=>{if(sg.k==="zone30"){c.fillStyle="#fff";c.fillRect(0,0,128,128);c.strokeStyle="#111";c.lineWidth=4;c.strokeRect(3,3,122,122);c.beginPath();c.arc(64,52,36,0,7);c.fillStyle="#fff";c.fill();c.lineWidth=9;c.strokeStyle="#d21f1f";c.stroke();c.fillStyle="#111";c.font="bold 40px Arial";c.textAlign="center";c.textBaseline="middle";c.fillText("30",64,54);c.font="bold 20px Arial";c.fillText("ZONE",64,110)}
      else{c.fillStyle="#1f5fb5";c.fillRect(0,0,128,128);c.fillStyle="#fff";c.beginPath();c.moveTo(64,14);c.lineTo(114,106);c.lineTo(14,106);c.closePath();c.fill();c.fillStyle="#111";c.fillRect(40,86,48,5);c.fillRect(40,95,48,5);c.beginPath();c.arc(64,48,8,0,7);c.fill();c.fillRect(60,56,8,26)}});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(sg.x,gy+2.3,sg.y);m.rotation.y=sg.a||0;scene.add(m)}
  for(const d of MG.decals||[]){const t=canvasTex(128,256,c=>{c.fillStyle="rgba(240,240,240,.9)";c.font="bold 150px Arial";c.textAlign="center";c.textBaseline="middle";c.save();c.translate(64,128);c.scale(.8,1.5);c.fillText(d.t,0,0);c.restore()});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,3),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.rotation.set(-Math.PI/2,0,d.a||0);m.position.set(d.x,ROAD_Y+.02,d.y);m.renderOrder=1;scene.add(m)}
}
const parkedList=[];
function buildParked(){for(const p of MG.parked||[]){const m=makeCar(p[3],false,{type:["sedan","hatch","van","smart","sedan","hatch"][parkedList.length%6]});m.position.set(p[0],ROAD_Y,p[1]);m.rotation.y=-p[2];parkedList.push({x:p[0],y:p[1]})}}
