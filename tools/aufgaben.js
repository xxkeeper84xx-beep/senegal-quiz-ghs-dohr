
/* ================= Aufgabenpool: viele Typen, wechselnder Schwierigkeitsgrad, keine direkten Wiederholungen =================
   Typen: num (Zahl eingeben), yn (ja/nein), mc (Auswahl), tap (Seiten in der Skizze antippen).
   Schwierigkeit 1 (leicht) bis 3 (schwer) wird je Aufgabe gewürfelt; ein höherer Rang macht schwere Aufgaben wahrscheinlicher. */
const AU={};
AU.TR=[[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[12,16,20],[7,24,25],[15,20,25],[20,21,29],[12,35,37],[9,40,41]];
AU.trip=(maxC=30,minC=5)=>{const l=AU.TR.filter(t=>t[2]<=maxC&&t[2]>=minC);return pick(l.length?l:AU.TR).slice()};
AU.f=v=>Number.isInteger(Math.round(v*1000)/1000)?String(Math.round(v)):fmt2(v);
AU.sq=v=>AU.f(Math.round(v*v*100)/100);
AU.hl=s=>`<span class="hl">${s}</span>`;
AU.eq=v=>Math.abs(v-Math.round(v))<1e-9?"=":"≈";
AU.diff=()=>{const L=lvl(),w=L<=1?[.65,.35,0]:L===2?[.3,.5,.2]:L===3?[.15,.45,.4]:[.1,.35,.55];const r=Math.random();return r<w[0]?1:r<w[0]+w[1]?2:3};
AU.hypSteps=(a,b,u,n=["a","b","c"])=>{const s=a*a+b*b,c=Math.sqrt(s);return `${n[2]}² = ${n[0]}² + ${n[1]}²<br>${n[2]}² = ${AU.f(a)}² + ${AU.f(b)}² = ${AU.sq(a)} + ${AU.sq(b)} = ${AU.f(s)}<br>${n[2]} = √${AU.f(s)} ${AU.eq(c)} ${AU.hl(fmt(c)+" "+u)}`};
AU.legSteps=(c,b,u,n=["a","b","c"])=>{const s=c*c-b*b,a=Math.sqrt(s);return `${n[0]}² = ${n[2]}² − ${n[1]}²<br>${n[0]}² = ${AU.f(c)}² − ${AU.f(b)}² = ${AU.sq(c)} − ${AU.sq(b)} = ${AU.f(s)}<br>${n[0]} = √${AU.f(s)} ${AU.eq(a)} ${AU.hl(fmt(a)+" "+u)}`};
AU.hintHyp=(lc)=>`Gesucht ist die <b>Hypotenuse</b> (${lc}): die längste Seite, sie liegt dem rechten Winkel gegenüber. Quadriere die beiden Katheten, addiere sie, dann Wurzel ziehen.`;
AU.hintLeg=(la,lc)=>`Gesucht ist eine <b>Kathete</b> (${la}). Die Hypotenuse (${lc}) ist bekannt. Rechne Hypotenuse² <b>minus</b> bekannte Kathete², dann Wurzel ziehen. Das Ergebnis muss kleiner sein als die Hypotenuse.`;
// Zahlenwerte: Stufe 1 glatte Tripel, Stufe 2 ganze Zahlen mit Kommaergebnis, Stufe 3 auch Kommazahlen in der Aufgabe
AU.legsPair=(d,lo,hi,k=1)=>{if(d===1){const t=AU.trip(hi*1.5,lo);const s=pick([1,1,2]);return [t[0]*s*k,t[1]*s*k]}
  if(d===2)return [ri(lo,hi)*k,ri(lo,hi)*k];return [ (ri(lo*2,hi*2)/2)*k,(ri(lo*2,hi*2)/2)*k ]};
AU.hypLeg=(d,lo,hi,k=1)=>{if(d===1){const t=AU.trip(hi*1.6,lo);const s=pick([1,1,2]);return {c:t[2]*s*k,b:t[0]*s*k,a:t[1]*s*k}}
  const b=(d===2?ri(lo,hi):ri(lo*2,hi*2)/2)*k,c=b+(d===2?ri(2,Math.max(3,hi)):ri(4,Math.max(6,hi*2))/2)*k;return {c,b,a:Math.sqrt(c*c-b*b)}};

/* ---------- Skizze: rechtwinkliges Dreieck in beliebiger Lage, Seiten antippbar ---------- */
function triSketch(t){
  const S=t.sk||{},W=360,H=250,a0=S.a||3,b0=S.b||4,ratio=clamp(a0/b0,.35,2.6);
  let P={C:[0,0],B:[1,0],A:[0,ratio]};
  const flip=S.flip?-1:1,rot=S.rot||0;
  for(const k in P){let [x,y]=P[k];x*=flip;const c=Math.cos(rot),s=Math.sin(rot);P[k]=[x*c-y*s,x*s+y*c]}
  const xs=Object.values(P).map(p=>p[0]),ys=Object.values(P).map(p=>p[1]),mx=Math.min(...xs),Mx=Math.max(...xs),my=Math.min(...ys),My=Math.max(...ys);
  const sc=Math.min((W-150)/((Mx-mx)||1),(H-80)/((My-my)||1)),ox=(W-(Mx-mx)*sc)/2,oy=(H-(My-my)*sc)/2;
  for(const k in P)P[k]=[ox+(P[k][0]-mx)*sc,H-(oy+(P[k][1]-my)*sc)];
  const cen=[(P.A[0]+P.B[0]+P.C[0])/3,(P.A[1]+P.B[1]+P.C[1])/3];
  const side={a:[P.C,P.A],b:[P.C,P.B],c:[P.A,P.B]},ink="#1a2147",hot="#e2384d",sel="#2f6fd8",ok="#14874a";
  const lab=S.lab||{a:"a",b:"b",c:"c"},sl=cur&&cur.sel||[];
  let out=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Skizze eines Dreiecks"><polygon points="${P.A} ${P.B} ${P.C}" fill="#ffc933" fill-opacity=".15"/>`;
  for(const k of ["a","b","c"]){const [p,q]=side[k],isU=S.unk===k,isS=sl.includes(k),solved=cur&&cur.solved&&t.need&&t.need.includes(k);
    const col=solved?ok:isS?sel:isU?hot:ink;
    out+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${col}" stroke-width="${isS||isU||solved?6:3.5}" stroke-linecap="round" ${isU?'stroke-dasharray="10 6"':""}/>`;
    if(t.kind==="tap")out+=`<line class="hit" data-side="${k}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="transparent" stroke-width="26" style="cursor:pointer"/>`;
    const m=[(p[0]+q[0])/2,(p[1]+q[1])/2],d=[m[0]-cen[0],m[1]-cen[1]],L=Math.hypot(...d)||1,lx=m[0]+d[0]/L*20,ly=m[1]+d[1]/L*20+5;
    const anchor=Math.abs(d[0]/L)<.35?"middle":d[0]>0?"start":"end";
    out+=`<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="JetBrains Mono,monospace" font-size="13.5" font-weight="700" fill="${col}" pointer-events="none">${lab[k]||""}</text>`}
  const C=P.C,ua=[P.A[0]-C[0],P.A[1]-C[1]],ub=[P.B[0]-C[0],P.B[1]-C[1]],na=Math.hypot(...ua),nb=Math.hypot(...ub),e=15;
  if(S.angle!==false){const p1=[C[0]+ua[0]/na*e,C[1]+ua[1]/na*e],p2=[C[0]+ub[0]/nb*e,C[1]+ub[1]/nb*e],p3=[p1[0]+ub[0]/nb*e,p1[1]+ub[1]/nb*e];
    out+=`<path d="M${p1} L${p3} L${p2}" fill="none" stroke="${ink}" stroke-width="2"/><circle cx="${(C[0]+p3[0])/2}" cy="${(C[1]+p3[1])/2}" r="2" fill="${ink}"/>`}
  else out+=`<text x="${C[0]+(ua[0]/na+ub[0]/nb)*20}" y="${C[1]+(ua[1]/na+ub[1]/nb)*20+5}" text-anchor="middle" font-size="15" font-weight="700" fill="${hot}" font-family="Rubik,sans-serif">90°?</text>`;
  if(S.pic)out+=`<text x="12" y="28" font-size="26">${S.pic}</text>`;
  return out+"</svg>"}

/* ---------- Bausteine für Aufgaben ---------- */
function tHyp(o){const c=Math.hypot(o.a,o.b);return Object.assign({kind:"num",ans:c,unit:o.u,sk:{a:o.a,b:o.b,unk:"c",lab:{a:`${o.n[0]}: ${fmt(o.a)} ${o.u}`,b:`${o.n[1]}: ${fmt(o.b)} ${o.u}`,c:`${o.n[2]} = ?`},rot:o.rot,flip:o.flip,pic:o.pic},
  steps:AU.hypSteps(o.a,o.b,o.u,o.sym||["a","b","c"]),hint:AU.hintHyp(o.n[2]),err:{sum:o.a+o.b,sq:o.a*o.a+o.b*o.b}},o.x)}
function tLeg(o){const a=Math.sqrt(o.c*o.c-o.b*o.b);return Object.assign({kind:"num",ans:a,unit:o.u,sk:{a,b:o.b,unk:"a",lab:{a:`${o.n[0]} = ?`,b:`${o.n[1]}: ${fmt(o.b)} ${o.u}`,c:`${o.n[2]}: ${fmt(o.c)} ${o.u}`},rot:o.rot,flip:o.flip,pic:o.pic},
  steps:AU.legSteps(o.c,o.b,o.u,o.sym||["a","b","c"]),hint:AU.hintLeg(o.n[0],o.n[2]),err:{plus:Math.sqrt(o.c*o.c+o.b*o.b),diff:o.c-o.b,sq:o.c*o.c-o.b*o.b}},o.x)}
function tCheck(o){const s=[o.p,o.q,o.r].sort((x,y)=>x-y),yes=Math.abs(s[0]*s[0]+s[1]*s[1]-s[2]*s[2])<1e-6;
  return Object.assign({kind:"yn",yes,unit:o.u,sk:{a:s[1],b:s[0],angle:false,lab:{a:`${AU.f(s[1])} ${o.u}`,b:`${AU.f(s[0])} ${o.u}`,c:`${AU.f(s[2])} ${o.u}`},pic:o.pic},
  steps:`Längste Seite: ${AU.f(s[2])} ${o.u} (sie wäre die Hypotenuse)<br>${AU.f(s[0])}² + ${AU.f(s[1])}² = ${AU.sq(s[0])} + ${AU.sq(s[1])} = ${AU.hl(AU.f(s[0]*s[0]+s[1]*s[1]))}<br>${AU.f(s[2])}² = ${AU.hl(AU.sq(s[2]))}<br>${yes?"Gleich → <b>rechtwinklig</b>.":"Nicht gleich → <b>nicht rechtwinklig</b>."}`,
  hint:"Umkehrung des Satzes: Nimm die <b>längste</b> Seite als c. Rechne die beiden kürzeren Seiten zum Quadrat und addiere. Nur wenn genau c² herauskommt, ist der Winkel 90°."},o.x)}
function nearMiss(t){const r=Math.random();const s=t.slice();if(r<.5)s[2]+=pick([1,-1,2]);else s[pick([0,1])]+=pick([1,2]);if(s[2]<=Math.max(s[0],s[1]))s[2]=Math.max(s[0],s[1])+1;return s}
function tTap(o){return Object.assign({kind:"tap",sk:{a:o.sa||ri(3,8),b:o.sb||ri(3,8),lab:o.lab,rot:o.rot??Math.random()*6.28,flip:Math.random()<.5,pic:o.pic},need:o.need,
  steps:o.steps,hint:"Die <b>Hypotenuse</b> liegt dem rechten Winkel (Kästchen mit Punkt) gegenüber und ist die längste Seite. Die beiden <b>Katheten</b> bilden zusammen den rechten Winkel."},o.x)}
function tMC(o){return Object.assign({kind:"mc"},o)}

/* ---------- Vorlagen je Auftraggeber ---------- */
const AUFG=[
 // ---- Feuerwache
 {id:"f_len",g:"fire",d:[1,3],make:d=>{const [a,b]=AU.legsPair(d,4,12);const B=Math.min(a,b),A=Math.max(a,b);return tHyp({a:A,b:B,u:"m",n:["Wand","Abstand","Leiter"],pic:"🚒",
   x:{title:"Wie lang muss die Leiter sein?",story:`Im zweiten Stock ruft jemand um Hilfe. Das Fenster liegt <b>${fmt(A)} m</b> hoch. Wegen der Hecke kann die Leiter erst <b>${fmt(B)} m</b> vor der Hauswand aufgestellt werden.`,q:"Wie lang muss die Leiter mindestens sein?"}})}},
 {id:"f_foot",g:"fire",d:[1,3],make:d=>{const o=AU.hypLeg(d,3,8);const [c,h]=[o.c,o.a];return tLeg({c,b:h,u:"m",n:["Abstand","Höhe","Leiter"],sym:["b","a","c"],pic:"🪜",flip:true,
   x:{title:"Wo muss der Leiterfuß stehen?",story:`Eine <b>${fmt(c)} m</b> lange Leiter soll genau bis zu einer Dachrinne in <b>${fmt(h)} m</b> Höhe reichen.`,q:"Wie weit von der Hauswand entfernt muss der Fuß der Leiter stehen?"}})}},
 {id:"f_reach",g:"fire",d:[2,3],make:d=>{const o=AU.hypLeg(d,2,5);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Leiter"],pic:"🪜",
   x:{title:"Wie hoch reicht die Leiter?",story:`Die Steckleiter ist <b>${fmt(o.c)} m</b> lang. Damit sie sicher steht, ist ihr Fuß <b>${fmt(o.b)} m</b> von der Wand entfernt.`,q:"In welcher Höhe lehnt die Leiter an der Wand?"}})}},
 {id:"f_truck",g:"fire",d:[3,3],make:d=>{const h=ri(3,4)*.5+2,W=ri(14,24),b=ri(5,12),a=W-h,c=Math.hypot(a,b);
   return {kind:"num",ans:c,unit:"m",sk:{a,b,unk:"c",lab:{a:`${fmt(W)} − ${fmt(h)} m`,b:`Abstand: ${b} m`,c:"Drehleiter = ?"},pic:"🚒"},
   title:"Drehleiter auf dem Fahrzeug",story:`Die Drehleiter ist <b>${fmt(h)} m</b> über dem Boden auf dem Feuerwehrauto befestigt. Das Fenster liegt <b>${W} m</b> hoch, das Auto steht <b>${b} m</b> vor der Hauswand.`,q:"Wie weit muss die Drehleiter ausgefahren werden?",
   steps:`1. Höhenunterschied: ${W} m − ${fmt(h)} m = ${fmt(a)} m<br>2. `+AU.hypSteps(a,b,"m",["h","b","l"]),hint:"Achtung: Die Leiter beginnt nicht am Boden. Ziehe erst die Höhe des Fahrzeugs von der Fensterhöhe ab. Das ist die eine Kathete.",err:{sum:a+b,nosub:Math.hypot(W,b)}}}},
 {id:"f_tap",g:"fire",d:[1,1],make:()=>tTap({sa:4,sb:3,rot:Math.PI*.0,need:["c"],lab:{a:"Hauswand",b:"Boden",c:"Leiter"},pic:"🪜",
   x:{title:"Was ist hier die Hypotenuse?",story:"Eine Leiter lehnt an einer Hauswand. Wand, Boden und Leiter bilden ein rechtwinkliges Dreieck.",q:"Tippe in der Skizze die Hypotenuse an und dann auf „Prüfen“.",steps:"Die <b>Leiter</b> liegt dem rechten Winkel zwischen Wand und Boden gegenüber. Sie ist die Hypotenuse. Wand und Boden sind die Katheten."}})},
 // ---- Baustelle
 {id:"b_rope",g:"crane",d:[1,3],make:d=>{const o=AU.hypLeg(d,3,9);return tLeg({c:o.c,b:o.b,u:"m",n:["Mast","Boden","Seil"],pic:"🏗️",
   x:{title:"Spannseil am Mast",story:`Ein Spannseil hält einen Baustellenmast senkrecht. Das Seil ist <b>${fmt(o.c)} m</b> lang und <b>${fmt(o.b)} m</b> vom Mastfuß verankert.`,q:"In welcher Höhe ist das Seil am Mast befestigt?"}})}},
 {id:"b_ramp",g:"crane",d:[1,3],make:d=>{const h=d===1?pick([.6,.9,1.2]):ri(4,12)/10,l=d===1?{0.6:.8,0.9:1.2,1.2:1.6}[h]:ri(25,60)/10;
   const W=d===1?l:l;return tHyp({a:h,b:W,u:"m",n:["Höhe","Länge","Rampe"],pic:"🛒",flip:true,
   x:{title:"Rampe für die Schubkarre",story:`Eine Schubkarre soll über ein Brett auf ein Podest geschoben werden. Das Podest ist <b>${fmt(h)} m</b> hoch, das Brett soll waagerecht gemessen <b>${fmt(W)} m</b> lang sein.`,q:"Wie lang muss das Brett sein?"}})}},
 {id:"b_roof",g:"crane",d:[2,3],make:d=>{const B=d===2?pick([8,10,12,16]):ri(15,24)/1*.5*2,h=d===2?pick([3,4,5,6]):ri(30,60)/10,half=B/2,c=Math.hypot(half,h);
   return {kind:"num",ans:c,unit:"m",sk:{a:h,b:half,unk:"c",lab:{a:`Höhe: ${fmt(h)} m`,b:`halbe Breite: ${fmt(half)} m`,c:"Sparren = ?"},pic:"🏠"},
   title:"Dachsparren zuschneiden",story:`Ein neues Gartenhaus ist <b>${fmt(B)} m</b> breit. Der Dachfirst liegt genau in der Mitte, <b>${fmt(h)} m</b> über der Wand.`,q:"Wie lang muss ein Dachsparren von der Wand bis zum First sein?",
   steps:`1. Der First liegt in der Mitte: ${fmt(B)} m : 2 = ${fmt(half)} m<br>2. `+AU.hypSteps(h,half,"m",["h","b","s"]),hint:"Zeichne nur eine Dachhälfte. Die waagerechte Kathete ist die <b>halbe</b> Hausbreite.",err:{full:Math.hypot(B,h),sum:half+h}}}},
 {id:"b_345",g:"crane",d:[1,2],make:d=>{const t=pick([[3,4,5],[6,8,10],[1.5,2,2.5]]);const s=Math.random()<.5?t:nearMiss(t);return tCheck({p:s[0],q:s[1],r:s[2],u:"m",pic:"🧱",
   x:{title:"Ist die Ecke wirklich rechtwinklig?",story:`Maurer prüfen Ecken mit einem Seil-Dreieck. An der neuen Mauerecke messen sie <b>${AU.f(s[0])} m</b> an der einen Mauer, <b>${AU.f(s[1])} m</b> an der anderen und quer dazwischen <b>${AU.f(s[2])} m</b>.`,q:"Ist die Ecke rechtwinklig?"}})}},
 {id:"b_eq",g:"crane",d:[2,3],make:()=>{const o={c:ri(8,13),b:ri(3,6)};const opts=[{t:`x² = ${o.c}² − ${o.b}²`,ok:1},{t:`x² = ${o.c}² + ${o.b}²`,why:"Plus rechnest du nur, wenn die Hypotenuse gesucht ist. Hier ist das Seil (Hypotenuse) schon bekannt."},{t:`x = ${o.c} − ${o.b}`,why:"Ohne Quadrate stimmt der Satz des Pythagoras nicht."},{t:`x² = ${o.b}² − ${o.c}²`,why:"Die Hypotenuse kommt zuerst: Das Ergebnis wäre sonst negativ."}];
   return tMC({options:shuffle(opts),sk:{a:Math.sqrt(o.c*o.c-o.b*o.b),b:o.b,unk:"a",lab:{a:"Höhe x = ?",b:`${o.b} m`,c:`Seil ${o.c} m`},pic:"🏗️"},
   title:"Welche Rechnung passt?",story:`Ein <b>${o.c} m</b> langes Seil ist <b>${o.b} m</b> vom Fuß eines Krans entfernt im Boden verankert. Gesucht ist die Höhe x, in der es am Kran befestigt ist.`,q:"Welche Gleichung passt zur Aufgabe?",
   steps:`Das Seil liegt dem rechten Winkel gegenüber, es ist die Hypotenuse. Gesucht ist eine Kathete, also: ${AU.hl(`x² = ${o.c}² − ${o.b}²`)} → x ≈ ${fmt(Math.sqrt(o.c*o.c-o.b*o.b))} m`,
   hint:"Suche zuerst die Hypotenuse (gegenüber vom rechten Winkel). Ist sie bekannt, wird subtrahiert."})}},
 // ---- Elektromarkt
 {id:"e_tv",g:"tv",d:[1,3],make:d=>{let b,a;if(d===1){const k=pick([16,20]);[a,b]=pick([[3,4],[6,8]]).map(v=>v*k)}else{b=ri(8,15)*10;a=Math.round(b*9/16)}
   const x=d===3?{zoll:true}:{};const c=Math.hypot(a,b);const t=tHyp({a,b,u:"cm",n:["Höhe","Breite","Diagonale"],pic:"📺",
   x:{title:"Wie groß ist der Fernseher?",story:`Das Bild eines Fernsehers ist <b>${b} cm</b> breit und <b>${a} cm</b> hoch. Die Bildschirmgröße ist immer die Länge der Diagonale.`,q:d===3?"Wie groß ist der Bildschirm in Zoll? (1 Zoll = 2,54 cm)":"Wie lang ist die Diagonale?"}});
   if(d===3){t.ans=c/2.54;t.unit="Zoll";t.steps+=`<br>${fmt(c)} cm : 2,54 ${AU.eq(t.ans)} ${AU.hl(fmt(t.ans)+" Zoll")}`;t.hint+=" Teile das Ergebnis danach durch 2,54, um Zoll zu erhalten."}return t}},
 {id:"e_width",g:"tv",d:[2,3],make:d=>{const o=AU.hypLeg(d,4,9,10);return tLeg({c:o.c,b:o.b,u:"cm",n:["Breite","Höhe","Diagonale"],sym:["b","a","c"],rot:Math.PI/2,pic:"📺",
   x:{title:"Passt der Fernseher ins Regal?",story:`Ein Fernseher hat eine Diagonale von <b>${fmt(o.c)} cm</b> und ist <b>${fmt(o.b)} cm</b> hoch.`,q:"Wie breit ist der Bildschirm?"}})}},
 {id:"e_phone",g:"tv",d:[1,2],make:d=>{const [a,b]=d===1?pick([[60,80],[90,120],[72,96]]):[ri(60,75),ri(130,160)];return tHyp({a,b,u:"mm",n:["Breite","Höhe","Diagonale"],pic:"📱",rot:Math.PI/2,
   x:{title:"Handy-Display",story:`Das Display eines Handys ist <b>${a} mm</b> breit und <b>${b} mm</b> hoch.`,q:"Wie lang ist die Diagonale des Displays?"}})}},
 // ---- Rathaus / Bauamt
 {id:"r_check",g:"amt",d:[1,3],make:d=>{let t=AU.trip(d===1?13:30);const k=pick([1,1,2,3]);t=t.map(v=>v*k);const s=Math.random()<.5?t:nearMiss(t);const ctx=pick(["dreieckige Terrasse","Grundstücksecke","Sandkasten-Ecke am Spielplatz","dreieckige Blumenwiese"]);
   return tCheck({p:s[0],q:s[1],r:s[2],u:"m",pic:"📐",x:{title:"Rechter Winkel – ja oder nein?",story:`Im Bauplan für eine <b>${ctx}</b> stehen die Seiten <b>${s[0]} m</b>, <b>${s[1]} m</b> und <b>${s[2]} m</b>. Der Architekt behauptet, eine Ecke ist genau 90°.`,q:"Stimmt das?"}})}},
 {id:"r_which",g:"amt",d:[1,3],make:d=>{const t=AU.trip(d===1?15:30).map(v=>v*(d===3?pick([1,2]):1));
   const key=x=>x.slice().sort((p,q)=>p-q).join(),isR=x=>{const y=x.slice().sort((p,q)=>p-q);return y[0]*y[0]+y[1]*y[1]===y[2]*y[2]},seen=new Set([key(t)]),wrong=[];
   for(let k=0;k<60&&wrong.length<2;k++){const w=nearMiss(t).sort((p,q)=>p-q);if(!seen.has(key(w))&&!isR(w)){seen.add(key(w));wrong.push(w)}}
   while(wrong.length<2){const w=[t[0]+wrong.length+1,t[1]+1,t[2]+1];if(!seen.has(key(w))&&!isR(w)){seen.add(key(w));wrong.push(w)}else t[2]++}
   const opt=(x,ok)=>ok?{t:`${x.join(" m, ")} m`,ok:1}:{t:`${x.join(" m, ")} m`,why:`${x[0]}² + ${x[1]}² = ${x[0]**2+x[1]**2}, aber ${x[2]}² = ${x[2]**2}.`};
   return tMC({options:shuffle([opt(t,1),opt(wrong[0]),opt(wrong[1])]),sk:{a:3,b:4,angle:false,lab:{a:"?",b:"?",c:"?"},pic:"📐"},title:"Welches Dreieck ist rechtwinklig?",story:"Drei Bauherren reichen Pläne für dreieckige Grundstücke ein. Nur eines davon hat einen rechten Winkel.",q:"Welche Seitenlängen gehören zu einem rechtwinkligen Dreieck?",
   steps:`${t[0]}² + ${t[1]}² = ${t[0]**2} + ${t[1]**2} = ${t[0]**2+t[1]**2} = ${t[2]}² → ${AU.hl("rechtwinklig")}`,hint:"Prüfe bei jedem Vorschlag: Ist (kurze Seite)² + (mittlere Seite)² genau gleich (längste Seite)²?"})}},
 {id:"r_tap_hyp",g:"amt",d:[1,2],make:()=>{const L=pick([["p","q","r"],["u","v","w"],["e","f","g"],["k","l","m"]]);const sh=shuffle([0,1,2]);const lab={a:L[sh[0]],b:L[sh[1]],c:L[sh[2]]};
   return tTap({need:["c"],lab,x:{title:"Hypotenuse finden",story:`Im Plan des Bauamts ist ein gedrehtes Dreieck mit den Seiten ${L.join(", ")} gezeichnet. Der rechte Winkel ist markiert.`,q:"Tippe die Hypotenuse an und dann auf „Prüfen“.",steps:`Die Seite ${AU.hl(lab.c)} liegt dem rechten Winkel gegenüber. Sie ist die Hypotenuse, die beiden anderen sind die Katheten.`}})}},
 {id:"r_tap_leg",g:"amt",d:[1,2],make:()=>{const L=pick([["s","t","u"],["x","y","z"],["a","b","c"],["h","i","j"]]);const sh=shuffle([0,1,2]);const lab={a:L[sh[0]],b:L[sh[1]],c:L[sh[2]]};
   return tTap({need:["a","b"],lab,x:{title:"Beide Katheten finden",story:"Ein Vermessungsdreieck liegt schräg auf dem Plan. Achtung: Die Buchstaben verraten nicht, welche Seite welche ist.",q:"Tippe beide Katheten an und dann auf „Prüfen“.",steps:`Die Katheten ${AU.hl(lab.a)} und ${AU.hl(lab.b)} bilden den rechten Winkel. ${lab.c} liegt gegenüber und ist die Hypotenuse.`}})}},
 {id:"r_name",g:"amt",d:[1,1],make:()=>{const L=pick([["d","e","f"],["m","n","o"]]);return tMC({options:shuffle([{t:"Hypotenuse",ok:1},{t:"Kathete",why:"Katheten liegen am rechten Winkel an, nicht gegenüber."},{t:"Diagonale",why:"Eine Diagonale verbindet gegenüberliegende Ecken eines Vierecks."}]),
   sk:{a:3,b:5,lab:{a:L[0],b:L[1],c:L[2]},rot:Math.random()*6.28,pic:"📐"},title:"Wie heißt diese Seite?",story:`Die Seite ${L[2]} liegt dem rechten Winkel gegenüber.`,q:`Wie heißt die Seite ${L[2]}?`,
   steps:`Die Seite gegenüber dem rechten Winkel heißt ${AU.hl("Hypotenuse")}. Sie ist immer die längste Seite.`,hint:"Schau, wo das Winkel-Kästchen sitzt. Welche Seite berührt es nicht?"})}},
 {id:"r_longest",g:"amt",d:[2,3],make:()=>{const o={a:ri(5,12),b:ri(5,12)};const c=Math.hypot(o.a,o.b);return tMC({options:shuffle([{t:`ca. ${fmt(c)} m`,ok:1},{t:`${o.a+o.b} m`,why:"Die Hypotenuse ist kürzer als die beiden Katheten zusammen (sonst wäre es kein Dreieck)."},{t:`${Math.min(o.a,o.b)-1} m`,why:"Die Hypotenuse ist immer die längste Seite."}]),
   sk:{a:o.a,b:o.b,unk:"c",lab:{a:`${o.a} m`,b:`${o.b} m`,c:"?"},pic:"🧮"},title:"Schätzen statt rechnen",story:`Ein rechtwinkliges Dreieck hat die Katheten <b>${o.a} m</b> und <b>${o.b} m</b>.`,q:"Welcher Wert kann die Hypotenuse sein?",
   steps:AU.hypSteps(o.a,o.b,"m"),hint:"Die Hypotenuse ist länger als jede Kathete, aber kürzer als beide zusammen."})}},
 // ---- Park-Kurier
 {id:"p_short",g:"park",d:[1,3],make:d=>{const [a,b]=AU.legsPair(d,4,12,10);const c=Math.hypot(a,b),sv=a+b-c;const askSave=d>=2;
   return {kind:"num",ans:askSave?sv:c,unit:"m",sk:{a,b,unk:"c",lab:{a:`${AU.f(a)} m`,b:`${AU.f(b)} m`,c:"quer = ?"},pic:"🌳"},title:"Abkürzung durch den Park",
   story:`Der Park ist <b>${AU.f(b)} m</b> lang und <b>${AU.f(a)} m</b> breit. Du kannst außen herum gehen oder diagonal quer hindurch.`,q:askSave?"Wie viele Meter sparst du mit dem Weg quer durch den Park?":"Wie lang ist der Weg quer durch den Park?",
   steps:AU.hypSteps(a,b,"m")+(askSave?`<br>Außen herum: ${AU.f(a)} m + ${AU.f(b)} m = ${AU.f(a+b)} m<br>Ersparnis: ${AU.f(a+b)} m − ${fmt(c)} m ${AU.eq(sv)} ${AU.hl(fmt(sv)+" m")}`:""),
   hint:askSave?"Zwei Schritte: Erst die Diagonale mit Pythagoras berechnen, dann vom Weg außen herum (Länge + Breite) abziehen.":AU.hintHyp("Diagonale"),err:{sum:a+b,diag:c}}}},
 {id:"p_tree",g:"park",d:[2,3],make:d=>{const a=d===2?pick([3,5,6,8]):ri(30,70)/10;const b=d===2?{3:4,5:12,6:8,8:6}[a]:ri(40,90)/10;const c=Math.hypot(a,b),H=a+c;
   return {kind:"num",ans:H,unit:"m",sk:{a,b,unk:"c",lab:{a:`Stamm: ${fmt(a)} m`,b:`${fmt(b)} m`,c:"Spitze = ?"},pic:"🌲"},title:"Der umgeknickte Baum",
   story:`Nach dem Sturm ist im Park ein Baum in <b>${fmt(a)} m</b> Höhe umgeknickt. Die Spitze berührt den Boden <b>${fmt(b)} m</b> vom Stamm entfernt.`,q:"Wie hoch war der Baum vor dem Sturm?",
   steps:`1. Abgeknicktes Stück: `+AU.hypSteps(a,b,"m",["a","b","s"])+`<br>2. Ursprüngliche Höhe: ${fmt(a)} m + ${fmt(c)} m ${AU.eq(H)} ${AU.hl(fmt(H)+" m")}`,
   hint:"Der abgeknickte Teil ist die Hypotenuse. Rechne ihn aus und addiere dann das stehende Stück.",err:{part:c,sum:a+b}}}},
 {id:"p_kite",g:"park",d:[1,3],make:d=>{const o=AU.hypLeg(d,10,40);const hand=d===3?1.5:0;const t=tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Schnur"],pic:"🪁",
   x:{title:"Wie hoch fliegt der Drache?",story:`Ein Kind lässt im Park einen Drachen steigen. Die Schnur ist <b>${fmt(o.c)} m</b> lang und straff gespannt. Der Drache steht genau über einem Punkt, der <b>${fmt(o.b)} m</b> entfernt ist.`+(hand?` Das Kind hält die Schnur in <b>1,5 m</b> Höhe.`:""),q:"In welcher Höhe über dem Boden fliegt der Drache?"}});
   if(hand){t.ans+=hand;t.steps+=`<br>Plus Handhöhe: ${fmt(t.ans-hand)} m + 1,5 m ${AU.eq(t.ans)} ${AU.hl(fmt(t.ans)+" m")}`;t.hint+=" Denk an die Höhe der Hand!"}return t}},
 {id:"p_stake",g:"park",d:[1,2],make:d=>{const [a,b]=d===1?pick([[1.2,.9],[2.4,1.8],[2,1.5]]):[ri(15,25)/10,ri(8,14)/10];return tHyp({a,b,u:"m",n:["Höhe","Abstand","Seil"],pic:"🌱",
   x:{title:"Stützseil für den jungen Baum",story:`Ein junger Baum soll mit einem Seil gestützt werden. Das Seil wird in <b>${fmt(a)} m</b> Höhe am Stamm befestigt und <b>${fmt(b)} m</b> vom Stamm entfernt an einem Pflock im Boden.`,q:"Wie lang muss das Seil mindestens sein?"}})}},
 {id:"p_shadow",g:"park",d:[2,3],make:d=>{const [a,b]=AU.legsPair(d,5,15);return tHyp({a,b,u:"m",n:["Baumhöhe","Schatten","Sonnenstrahl"],pic:"☀️",
   x:{title:"Der Schatten der Pappel",story:`Eine Pappel ist <b>${fmt(a)} m</b> hoch und wirft einen <b>${fmt(b)} m</b> langen Schatten auf die Wiese.`,q:"Wie weit ist es von der Baumspitze bis zum Ende des Schattens?"}})}},
 // ---- Luftrettung
 {id:"h_flight",g:"heli",d:[1,3],make:d=>{const [a,b]=AU.legsPair(d,4,30,10);const A=Math.min(a,b),B=Math.max(a,b);return tHyp({a:A,b:B,u:"m",n:["Höhe","waagerecht","Flugweg"],pic:"🚁",
   x:{title:"Rettungsflug",story:`Der Rettungshubschrauber schwebt <b>${AU.f(A)} m</b> hoch. Der Landeplatz liegt waagerecht <b>${AU.f(B)} m</b> entfernt.`,q:"Wie lang ist der direkte schräge Flugweg?"}})}},
 {id:"h_height",g:"heli",d:[2,3],make:d=>{const o=AU.hypLeg(d,8,40,10);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","waagerecht","Flugweg"],pic:"🚁",
   x:{title:"Aus welcher Höhe?",story:`Der Hubschrauber sinkt auf geradem Weg <b>${AU.f(o.c)} m</b> schräg zum Landeplatz, der waagerecht <b>${AU.f(o.b)} m</b> entfernt liegt.`,q:"In welcher Höhe ist er gestartet?"}})}},
 {id:"h_rope",g:"heli",d:[1,2],make:d=>{const o=AU.hypLeg(d,3,9);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Seil"],pic:"🧗",
   x:{title:"Rettung mit der Seilwinde",story:`Das Seil der Winde ist <b>${AU.f(o.c)} m</b> ausgefahren und schwingt schräg. Die verletzte Person liegt <b>${AU.f(o.b)} m</b> neben dem Punkt direkt unter dem Hubschrauber.`,q:"Wie hoch schwebt der Hubschrauber über dem Boden?"}})}},
];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* Taxi: Ziel wirklich auf der Karte, Luftlinie aus Ost/Nord-Versatz */
function taxiTask(g,d){
  const slow=["walk","scoot","bike"].includes(save.veh),opts=[],sc=slow?[30,50]:[50,100];
  for(const k of sc)for(const tr of [[3,4],[4,3],[6,8],[8,6],[5,12],[12,5]]){const ex=tr[0]*k,ny_=tr[1]*k;if(Math.hypot(ex,ny_)>(slow?450:700))continue;
    for(const sx of [1,-1])for(const sy of [1,-1]){const tx=g.x+sx*ex,ty=g.y-sy*ny_;if(Math.abs(tx)<HX-40&&Math.abs(ty)<HY-40)opts.push({ex,ny:ny_,sx,sy,tx,ty})}}
  let o=null;for(let t=0;t<40&&opts.length;t++){const c=pick(opts);const r=nearestRoad(c.tx,c.ty,30);if(r){o=c;o.spot=spotNear(c.tx,c.ty);break}}
  if(!o){o={ex:120,ny:160,sx:-1,sy:1};o.spot=spotNear(g.x-120,g.y-160)}
  const a=o.ny,b=o.ex,c=Math.hypot(a,b),dir=(o.sy>0?"Norden":"Süden"),dir2=(o.sx>0?"Osten":"Westen");
  if(d>=2&&Math.random()<.5){const p=[ri(1,6),ri(1,6)],q=[p[0]+o.sx*b/10,p[1]+o.sy*a/10];
    return {kind:"num",ans:c,unit:"m",target:o.spot,sk:{a,b,unk:"c",lab:{a:`Δy = ${a/10} Kästchen`,b:`Δx = ${b/10} Kästchen`,c:"Luftlinie = ?"},pic:"🗺️"},title:"Navi mit Koordinaten",
      story:`Auf dem Stadtplan des Taxistands ist ein Kästchen 10 m lang. Du stehst bei <b>A(${p[0]}|${p[1]})</b>, der Fahrgast will nach <b>B(${q[0]}|${q[1]})</b>.`,q:"Wie viele Meter sind es in Luftlinie von A nach B?",
      steps:`Δx = |${q[0]} − ${p[0]}| = ${b/10} Kästchen = ${b} m, Δy = |${q[1]} − ${p[1]}| = ${a/10} Kästchen = ${a} m<br>`+AU.hypSteps(a,b,"m",["Δy","Δx","d"]),hint:"Bestimme erst, wie viele Kästchen es nach rechts/links (Δx) und nach oben/unten (Δy) sind. Rechne in Meter um, dann Pythagoras.",err:{sum:a+b}}}
  return {kind:"num",ans:c,unit:"m",target:o.spot,sk:{a,b,unk:"c",lab:{a:`${a} m nach ${dir}`,b:`${b} m nach ${dir2}`,c:"Luftlinie = ?"},pic:"🚕"},title:"Navi ausgefallen!",
    story:`Ein Fahrgast will zu einer Adresse, die <b>${b} m nach ${dir2}</b> und <b>${a} m nach ${dir}</b> liegt.`,q:"Wie weit ist das Ziel in Luftlinie entfernt?",steps:AU.hypSteps(a,b,"m",["Δy","Δx","d"]),hint:AU.hintHyp("Luftlinie"),err:{sum:a+b}};
}

/* ---------- Auswahl ohne Wiederholung ---------- */
function makeTask(g){
  save.recent=save.recent||[];
  const d=AU.diff();
  let t;
  if(g.id==="taxi")t=taxiTask(g,d);
  else{
    let pool=AUFG.filter(v=>v.g===g.id&&d>=v.d[0]&&d<=v.d[1]&&!save.recent.includes(v.id));
    if(!pool.length)pool=AUFG.filter(v=>v.g===g.id&&!save.recent.slice(-3).includes(v.id));
    if(!pool.length)pool=AUFG.filter(v=>v.g===g.id);
    const v=pick(pool);t=v.make(Math.max(d,v.d[0]));t.id=v.id;
    save.recent.push(v.id);if(save.recent.length>12)save.recent.shift();persist();
  }
  const dl={1:"leicht",2:"mittel",3:"schwer"}[d];
  const base={fire:["Feuerwache","Bring die Ausrüstung zum Einsatzort!"],crane:["Baustelle","Liefere das Material zur zweiten Baustelle!"],tv:["Elektromarkt","Liefere das Gerät zum Kunden!"],amt:["Rathaus","Bring den geprüften Plan zum Architekten!"],park:["Park-Kurier","Bring das Paket ans andere Ende!"],taxi:["Taxistand","Bring den Fahrgast zur Adresse!"],heli:["Luftrettung","Bring den Notfallkoffer zum Einsatzort!"]}[g.id]||[g.name,"Liefere ab!"];
  return Object.assign({tag:`${base[0]}${where(g)} · ${dl}`,deliver:base[1]},t,{giver:g,tries:0,solved:false,diff:d,sel:[]});
}
function stepsHTML(t){return t.steps||""}
function hintHTML(t){return t.hint||""}
function triSVG(t){return triSketch(t)}

/* ---------- Dialog für alle Aufgabentypen ---------- */
(function(){const box=document.createElement("div");box.className="row";box.id="dMC";box.hidden=true;$("dYN").after(box);
  box.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!cur||cur.solved)return;
    if(b.dataset.mc!==undefined){const o=cur.options[+b.dataset.mc];judge(!!o.ok);if(!o.ok&&o.why&&!cur.solved){$("dFb").textContent="Nicht ganz: "+o.why}if(cur&&cur.solved)box.hidden=true}
    if(b.dataset.tapcheck!==undefined){const need=cur.need.slice().sort().join(),got=cur.sel.slice().sort().join();
      if(!cur.sel.length){$("dFb").className="fb bad";$("dFb").textContent="Tippe zuerst eine oder mehrere Seiten in der Skizze an.";return}
      judge(need===got);if(!cur.solved){const wrong=cur.sel.filter(s=>!cur.need.includes(s));$("dFb").textContent=wrong.length?(wrong.includes("c")?"Die Seite gegenüber dem rechten Winkel ist keine Kathete.":"Diese Seite berührt den rechten Winkel, sie ist eine Kathete."):`Es fehlt noch ${cur.need.length-cur.sel.length>1?"etwas":"eine Seite"}.`;cur.sel=[]}
      $("dSvg").innerHTML=triSVG(cur);if(cur.solved)box.hidden=true}});
  $("dSvg").addEventListener("click",e=>{const h=e.target.closest(".hit");if(!h||!cur||cur.kind!=="tap"||cur.solved)return;const s=h.dataset.side;
    cur.sel=cur.sel.includes(s)?cur.sel.filter(x=>x!==s):cur.sel.concat(s);$("dSvg").innerHTML=triSVG(cur)});
  // genauere Rückmeldung bei typischen Rechenfehlern
  $("dNum").addEventListener("submit",()=>{if(!cur||cur.solved||!cur.err)return;const v=parseNum($("ans").value);if(isNaN(v))return;const E=cur.err,n=x=>Math.abs(v-x)<.051;
    let m="";if(n(E.sum??-1))m="Du hast die Strecken nur addiert. Erst quadrieren, dann addieren, dann die Wurzel ziehen.";
    else if(n(E.sq??-1))m="Das ist erst das Quadrat. Es fehlt noch die Wurzel.";
    else if(n(E.plus??-1))m="Hier ist eine Kathete gesucht: Hypotenuse² minus Kathete², nicht plus.";
    else if(n(E.diff??-1))m="Ohne Quadrieren klappt es nicht. Rechne Hypotenuse² − Kathete², dann Wurzel.";
    else if(n(E.nosub??-1))m="Fast: Du hast die Fahrzeughöhe vergessen. Die Leiter startet nicht am Boden.";
    else if(n(E.full??-1))m="Die waagerechte Strecke ist nur die halbe Hausbreite.";
    else if(n(E.part??-1)||n(E.diag??-1))m="Das ist ein Zwischenergebnis. Lies die Frage noch einmal: Es fehlt noch ein Schritt.";
    if(m)$("dFb").textContent=m})})();
function openMission(g){
  if(g.id==="shop"){openShop(true);return}
  if(state.task)return;
  showTask(makeTask(g));
}
function showTask(t){
  cur=t; state.mode="dialog"; car.v=0;
  $("dTag").textContent=cur.tag; $("dTitle").textContent=cur.title;
  $("dSvg").innerHTML=triSVG(cur); $("dStory").innerHTML=cur.story; $("dQ").textContent=cur.q;
  $("dNum").hidden=cur.kind!=="num"; $("dYN").hidden=cur.kind!=="yn";
  const mc=$("dMC");mc.hidden=!(cur.kind==="mc"||cur.kind==="tap");
  mc.innerHTML=cur.kind==="mc"?cur.options.map((o,i)=>`<button type="button" data-mc="${i}">${o.t}</button>`).join(""):cur.kind==="tap"?`<button class="primary" type="button" data-tapcheck>Prüfen</button><span style="align-self:center;color:#56609a;font-size:14px">Ausgewählt wird blau. Nochmal tippen hebt die Auswahl auf.</span>`:"";
  $("dUnit").textContent=cur.unit||""; $("ans").value="";
  $("dFb").textContent=""; $("dFb").className="fb"; $("dHint").hidden=true; $("dSteps").hidden=true;
  $("bSol").hidden=true; $("dGo").hidden=true; $("dTools").hidden=false; $("calc").hidden=true; $("bCalc").hidden=cur.kind!=="num";
  $("dlg").hidden=false; if(cur.kind==="num"&&!isTouch)setTimeout(()=>$("ans").focus(),50);
}
$("bGo").onclick=()=>{const t=cur;$("dlg").hidden=true;state.mode="play";cur=null;
  if(t&&t.hunt!==undefined)huntFound(t.hunt);else startDelivery(t);checkLevel()};

/* ================= Dreiecksjagd: Schilder rund um die Schule finden ================= */
const HUNT=[
  {x:-300,y:-147.4,where:"am Basketballkorb auf dem Pausenhof",post:[-300.9,-148.6],kind:"tapHyp"},
  {x:-326.6,y:-56.6,where:"an der Bushaltestelle „Schule Torfbend“",post:[-326.6,-57.6],kind:"yn"},
  {x:-326.1,y:-144.6,where:"am weißen Gartenhaus im Hof",post:[-326.9,-145.4],kind:"tapLegs"},
  {x:-279.6,y:-123.6,where:"am Eingang der Turnhalle",post:[-280.4,-124.6],kind:"eq"},
  {x:-284.8,y:-112.8,where:"unter der Außentreppe",post:[-285.8,-113.7],kind:"num"},
  {x:-236,y:25,where:"im Werkhof an der Dohrer Straße",post:[-235,26.2],kind:"name"},
];
function huntTask(i){const H=HUNT[i],k=H.kind;let t;
  if(k==="tapHyp")t=AUFG.find(v=>v.id==="r_tap_hyp").make(1);
  else if(k==="tapLegs")t=AUFG.find(v=>v.id==="r_tap_leg").make(1);
  else if(k==="yn")t=AUFG.find(v=>v.id==="r_check").make(AU.diff());
  else if(k==="eq")t=AUFG.find(v=>v.id==="b_eq").make(2);
  else if(k==="name")t=AUFG.find(v=>v.id==="r_name").make(1);
  else {const [a,b]=AU.legsPair(AU.diff(),3,9);t=tHyp({a,b,u:"cm",n:["a","b","c"],pic:"🔺",x:{title:"Das kleine Schild",story:`Das Dreiecks-Schild hat am rechten Winkel zwei Kanten von <b>${fmt(a)} cm</b> und <b>${fmt(b)} cm</b>.`,q:"Wie lang ist die dritte Kante?"}})}
  return Object.assign(t,{tag:`Dreiecksjagd · Schild ${i+1} von ${HUNT.length}`,title:t.title,deliver:"Weiter suchen",hunt:i,tries:0,solved:false,sel:[]})}
function huntFound(i){save.hunt=save.hunt||[];if(!save.hunt.includes(i))save.hunt.push(i);persist();refreshHunt();
  const n=save.hunt.length;if(n>=HUNT.length&&!save.huntDone){save.huntDone=true;save.money+=150;save.xp+=40;persist();updateHud();jingle();toast("Alle Schilder gefunden!","Dreiecksjagd geschafft · +40 XP · +$150","#3ddc84")}
  else toast(`Schild ${n} von ${HUNT.length}`,n<HUNT.length?"Such weiter rund um die GHS Dohr":"","#ffc933")}
let huntMeshes=[];
function buildHunt(){const yellow=new THREE.MeshLambertMaterial({color:0xf2c230,side:THREE.DoubleSide}),green=new THREE.MeshLambertMaterial({color:0x3ddc84,side:THREE.DoubleSide}),pole=new THREE.MeshLambertMaterial({color:0x6b7178}),edge=new THREE.MeshLambertMaterial({color:0x1a2147,side:THREE.DoubleSide});
  const tri=s=>{const sh=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(.55*s,0),new THREE.Vector2(0,.42*s)]);return new THREE.ShapeGeometry(sh)};
  HUNT.forEach((H,i)=>{const g=new THREE.Group(),[px,pz]=H.post,gy=groundY(px,pz);
    const p=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.5,8),pole);p.position.y=.75;g.add(p);
    const back=new THREE.Mesh(tri(1.12),edge);back.position.set(-.31,1.27,-.005);g.add(back);
    const m=new THREE.Mesh(tri(1),yellow);m.position.set(-.28,1.3,0);g.add(m);
    const sq=new THREE.Mesh(new THREE.PlaneGeometry(.07,.07),edge);sq.position.set(-.24,1.34,.004);g.add(sq);
    g.position.set(px,gy,pz);g.lookAt(H.x,gy,H.y);g.rotation.x=0;g.rotation.z=0;g.traverse(o=>o.castShadow=true);scene.add(g);huntMeshes.push({g,m,yellow,green})});
  refreshHunt()}
function refreshHunt(){const f=save.hunt||[];huntMeshes.forEach((h,i)=>{h.m.material=f.includes(i)?h.green:h.yellow})}
{const base=interactables;interactables=function(VH){const L=base(VH);if(VH.id==="walk"||VH.agile)HUNT.forEach((H,i)=>{if(!(save.hunt||[]).includes(i))L.push({x:H.x,y:H.y,r:2.6,label:"🔺 Dreiecks-Schild untersuchen",act:()=>showTask(huntTask(i))})});return L}}
{const base=renderHeft;renderHeft=function(){base();const f=save.hunt||[];
  $("heftBody").insertAdjacentHTML("afterbegin",`<div class="hq"><div class="hqh"><b>Dreiecksjagd</b> ${f.length>=HUNT.length?'<span class="chip done">erledigt</span>':`<span class="chip act">${f.length} von ${HUNT.length}</span>`}<br><small>Dohr/Torfbend · Gelbe Dreiecks-Schilder rund um die GHS Dohr finden und die Frage daran lösen</small></div>
  <ul class="chk">${HUNT.map((H,i)=>`<li class="${f.includes(i)?"ok":""}">${f.includes(i)?"✓":"○"} Schild ${i+1}: ${f.includes(i)||i<2?H.where:"<small>noch unbekannt – such weiter</small>"}</li>`).join("")}</ul></div>`)}}

/* ================= Messaufträge auf dem Schulgelände ================= */
QUESTS.push({id:"treppe",district:"Dohr/Torfbend",title:"Ein Handlauf für die Außentreppe",
  giver:{x:-278.5,y:-115.5,name:"Frau Ziemer",role:"Lehrerin an der GHS Dohr",shirt:"#c0392b"},
  intro:"„Die Außentreppe am Erweiterungsbau bekommt einen neuen Handlauf. Er soll genau so lang sein wie die Treppe schräg von unten bis zum Podest. Miss bitte die Höhe des Podests und wie weit die Treppe waagerecht reicht.“",
  measures:[{id:"a",label:"Höhe des Podests",short:"Podesthöhe",val:3.9,x:-293.4,y:-112.9,where:"am Podest oben an der Außentreppe",line:[-292.1,0,-111.6,-292.1,3.9,-111.6]},
            {id:"b",label:"Waagerechte Länge der Treppe",short:"Treppenlänge",val:5.5,x:-286.4,y:-112.9,where:"am unteren Ende der Außentreppe",line:[-286.5,.35,-111.9,-292,.35,-111.9]}],
  lab:{a:"Höhe",b:"waagerecht",c:"Handlauf"},ans:Math.hypot(3.9,5.5),unit:"m",
  ask:"Wie lang ist die Treppe schräg gemessen?",
  choice:{q:"Handläufe gibt es in 6 m, 7 m und 8 m. Welchen bestellst du?",opts:[{v:6,t:"6 m"},{v:7,t:"7 m"},{v:8,t:"8 m"}],ok:7,
    fb:v=>v<7?"Zu kurz: 6 m < 6,7 m. Der Handlauf würde nicht bis zum Podest reichen.":v>7?"Das geht, aber ein ganzer Meter wäre übrig. Es gibt einen kürzeren, der reicht.":"Richtig: 7 m ist der kürzeste Handlauf, der reicht."},
  doneText:"Der neue Handlauf ist bestellt. Frau Ziemer bedankt sich.",xp:40,money:110});
QUESTS.push({id:"schulhof",district:"Dohr/Torfbend",title:"Quer über den Schulhof",
  giver:{x:-312,y:-100,name:"Herr Ballhorn",role:"Hausmeister der GHS Dohr",shirt:"#2f8f5b"},
  intro:"„Für den Sponsorenlauf brauchen wir die längste gerade Strecke auf dem Schulhof: von der Ecke am Gartenhaus quer bis zur Ecke an der Einfahrt. Miss die Breite und die Länge des Hofs entlang der Zäune.“",
  measures:[{id:"a",label:"Länge des Hofs (Nord–Süd)",short:"Hoflänge",val:86,x:-263.5,y:-120,where:"an der weißen Hofmauer zur Feuerwehrzufahrt",line:[-262.2,.35,-149.6,-262.2,.35,-63.6]},
            {id:"b",label:"Breite des Hofs (Ost–West)",short:"Hofbreite",val:72,x:-300,y:-148.3,where:"am hinteren Zaun beim Basketballkorb",line:[-334,.35,-149.4,-262,.35,-149.4]}],
  lab:{a:"Länge",b:"Breite",c:"Diagonale"},ans:Math.hypot(86,72),unit:"m",
  ask:"Wie lang ist die Strecke quer über den Hof (die Diagonale)?",
  extra:{q:"Am Zaun entlang wären es 86 m + 72 m = 158 m. Wie viele Meter ist die Diagonale kürzer?",ans:158-Math.hypot(86,72),unit:"m",steps:`Unterschied: 158 m − 112,2 m ≈ <span class="hl">45,8 m</span>`,tip:"Ziehe die Diagonale vom Weg am Zaun ab: 158 m − 112,2 m."},
  choice:{q:"Welche Strecke nimmt Herr Ballhorn für den Sprint?",opts:[{v:"diag",t:"Quer über den Hof (ca. 112 m)"},{v:"rand",t:"Am Zaun entlang (158 m)"}],any:true,
    fb:v=>v==="diag"?"Die Diagonale ist die längste gerade Strecke auf dem Hof.":"Am Zaun ist es länger, aber nicht gerade: Es gibt eine Ecke."},
  doneText:"Die Laufstrecke ist abgesteckt. Beim Sponsorenlauf rennen alle quer über den Hof.",xp:40,money:110});
