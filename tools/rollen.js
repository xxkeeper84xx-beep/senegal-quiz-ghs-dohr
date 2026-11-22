/* ================= Rollen der Lehrkräfte, Aufgaben passend zur Figur =================
   - Schwierigkeit je Figur: Kinder (Noah, Schülerin, Klassisch) leichter, Erwachsene wie bisher nach Rang,
     Herr Dittmann (Cap) immer die schwersten Aufgaben (Kommazahlen, mehrschrittig, Raumdiagonale, Koordinaten).
   - Aufgabenthemen je Figur: Straßenbauer → Baustelle und Mauern vermessen, Joggerin/Fußballfan → Sport,
     Geschäftsfrau → Büro, Seniorin/Senior → Garten und Rampen, Passant → Stadtwege, Kinder → Schule.
     Kurieraufträge nehmen oft ein Thema der Figur; Übungsaufgaben der MPT-Kräfte immer.
   - MPT-Kräfte Herr Aktas, Frau Colonna, Frau Brand: Tipps und Übungsaufgaben zum Lösen.
   - Frau Costantino (Englischlehrerin): Aufgaben auf Englisch (mit deutscher Hilfe).
   - Kinder-Figuren dürfen nur Fahrräder und E-Scooter kaufen und fahren. */
const KIDS=new Set(["Noah_Pythagoras","01_Schuelerin","classic"]);
const figNow=()=>(typeof PROF!=="undefined"&&PROF&&PROF.look&&PROF.look.model)||(LOOK_DEF&&LOOK_DEF.model)||"Noah_Pythagoras";
const isKid=()=>KIDS.has(figNow());
const isProfi=()=>figNow()==="Dittmann_Cap";
const KID_OK=new Set(["walk","scoot","bike"]);
const kidBlocked=base=>isKid()&&!KID_OK.has(base);

/* ---------- Schwierigkeit ---------- */
{const base=AU.diff;AU.diff=function(){if(isProfi())return 3;let d=base();if(isKid()){if(d===3&&(lvl()<5||Math.random()<.6))d=2;if(d===2&&Math.random()<.35)d=1}return d}}

/* ---------- Aufgaben nach Thema ---------- */
const r1=v=>Math.round(v*10)/10;
const TH={
  schule:[
    d=>{const [a,b]=AU.legsPair(d,20,60);return tHyp({a,b,u:"m",n:["Länge","Breite","Abkürzung"],pic:"🎒",x:{title:"Abkürzung auf dem Schulweg",story:`Die Wiese vor der Schule ist <b>${fmt(a)} m</b> lang und <b>${fmt(b)} m</b> breit. Du gehst schräg hindurch statt außen herum.`,q:"Wie lang ist der Weg schräg über die Wiese?"}})},
    d=>{const [a,b]=AU.legsPair(d,8,20,10);return tHyp({a,b,u:"cm",n:["Breite","Höhe","Diagonale"],pic:"🧑‍🏫",x:{title:"Die neue Tafel",story:`Die Tafel im Klassenraum ist <b>${fmt(a)} cm</b> breit und <b>${fmt(b)} cm</b> hoch.`,q:"Wie lang ist die Diagonale der Tafel?"}})},
    d=>{const o=AU.hypLeg(d,10,35);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Schnur"],pic:"🪁",x:{title:"Drachen auf dem Schulhof",story:`Die Drachenschnur ist <b>${fmt(o.c)} m</b> lang und straff. Der Drachen steht <b>${fmt(o.b)} m</b> waagerecht von dir entfernt.`,q:"Wie hoch fliegt der Drachen?"}})}],
  bau:[
    d=>{const t=pick(d===1?[[3,4,5],[6,8,10]]:[[3,4,5],[6,8,10],[9,12,15],[1.5,2,2.5],[12,16,20]]);const s=Math.random()<.5?t:nearMiss(t);return tCheck({p:s[0],q:s[1],r:s[2],u:"m",pic:"🧱",
      x:{title:"Mauerecke auf der Baustelle prüfen",story:`Du kontrollierst die neue Mauerecke mit dem Maßband: <b>${AU.f(s[0])} m</b> an der einen Mauer, <b>${AU.f(s[1])} m</b> an der anderen und quer dazwischen <b>${AU.f(s[2])} m</b>.`,q:"Ist die Mauerecke rechtwinklig?"}})},
    d=>{const [a,b]=AU.legsPair(d,6,16);return tHyp({a,b,u:"m",n:["Länge","Breite","Diagonale"],pic:"🏗️",x:{title:"Bodenplatte vermessen",story:`Die Bodenplatte des Neubaus soll <b>${fmt(a)} m</b> lang und <b>${fmt(b)} m</b> breit sein. Ist sie rechtwinklig, müssen beide Diagonalen genau gleich lang sein.`,q:"Wie lang muss jede Diagonale sein?"}})},
    d=>{const [a,b]=AU.legsPair(d,2,6);return tHyp({a:Math.max(a,b),b:Math.min(a,b),u:"m",n:["Höhe","Feldbreite","Strebe"],pic:"🪜",x:{title:"Strebe für das Gerüst",story:`Ein Gerüstfeld ist <b>${fmt(Math.max(a,b))} m</b> hoch und <b>${fmt(Math.min(a,b))} m</b> breit. Die Strebe läuft schräg von unten nach oben.`,q:"Wie lang ist die Strebe?"}})},
    d=>{const o=AU.hypLeg(d,2,6);return tLeg({c:o.c,b:o.b,u:"m",n:["waagerecht","Tiefe","Böschung"],pic:"⛏",x:{title:"Böschung an der Baugrube",story:`Die Baugrube ist <b>${fmt(o.b)} m</b> tief. Die schräge Böschung ist <b>${fmt(o.c)} m</b> lang.`,q:"Wie weit reicht die Böschung waagerecht in den Hof?"}})},
    d=>{const [a,b]=AU.legsPair(d,4,14);return tHyp({a,b,u:"m",n:["nach Osten","nach Norden","Mauer"],pic:"🧱",x:{title:"Schräge Gartenmauer vermessen",story:`Eine Mauer läuft schräg über das Grundstück: Ihr Ende liegt <b>${fmt(a)} m</b> weiter östlich und <b>${fmt(b)} m</b> weiter nördlich als ihr Anfang.`,q:"Wie lang ist die Mauer?"}})}],
  sport:[
    d=>{const [a,b]=AU.legsPair(d,20,70);return tHyp({a:Math.max(a,b),b:Math.min(a,b),u:"m",n:["Länge","Breite","Diagonale"],pic:"⚽",x:{title:"Diagonal über den Platz",story:`Der Fußballplatz im Mülforter Bruch ist <b>${fmt(Math.max(a,b))} m</b> lang und <b>${fmt(Math.min(a,b))} m</b> breit. Beim Aufwärmen läufst du von Eckfahne zu Eckfahne quer über den Platz.`,q:"Wie lang ist die Strecke?"}})},
    d=>{const [a,b]=AU.legsPair(d,8,30);return tHyp({a,b,u:"m",n:["zur Torlinie","seitlich","Schussweg"],pic:"🥅",x:{title:"Der Torschuss",story:`Du stehst <b>${fmt(a)} m</b> vor der Torlinie und <b>${fmt(b)} m</b> seitlich neben der Tormitte.`,q:"Wie weit fliegt der Ball bis zur Tormitte?"}})},
    d=>{const [a,b]=AU.legsPair(d,30,120);return tHyp({a,b,u:"m",n:["Länge","Breite","Laufweg"],pic:"🏃",x:{title:"Joggen durch den Park",story:`Die Wiese im Park ist <b>${fmt(a)} m</b> lang und <b>${fmt(b)} m</b> breit. Du joggst quer hinüber statt am Rand entlang.`,q:"Wie lang ist dein Laufweg quer über die Wiese?"}})}],
  buero:[
    d=>{const [a,b]=AU.legsPair(d,3,8,10);return tHyp({a:Math.max(a,b),b:Math.min(a,b),u:"cm",n:["Breite","Höhe","Diagonale"],pic:"🖥️",rot:Math.PI/2,x:{title:"Neuer Bildschirm fürs Büro",story:`Der Bildschirm ist <b>${fmt(Math.max(a,b))} cm</b> breit und <b>${fmt(Math.min(a,b))} cm</b> hoch.`,q:"Wie groß ist die Bildschirmdiagonale?"}})},
    d=>{const o=AU.hypLeg(d,2,6,10);return tLeg({c:o.c,b:o.b,u:"cm",n:["Höhe","Breite","Strebe"],pic:"🗄️",x:{title:"Strebe am Lagerregal",story:`Am Regal im Lager läuft eine Strebe schräg über ein Fach. Die Strebe ist <b>${fmt(o.c)} cm</b> lang, das Fach <b>${fmt(o.b)} cm</b> breit.`,q:"Wie hoch ist das Fach?"}})},
    d=>{const [a,b]=AU.legsPair(d,3,9);return tHyp({a,b,u:"m",n:["Länge","Breite","Diagonale"],pic:"🏢",x:{title:"Kabel quer durchs Büro",story:`Das Büro ist <b>${fmt(a)} m</b> lang und <b>${fmt(b)} m</b> breit. Ein Netzwerkkabel soll unter dem Teppich von Ecke zu Ecke laufen.`,q:"Wie lang muss das Kabel mindestens sein?"}})}],
  garten:[
    d=>{const o=AU.hypLeg(d,1,5);const c=o.c*(d===1?1:1),b=o.b;return tLeg({c:c*.5,b:b*.1,u:"m",n:["waagerecht","Höhe","Rampe"],pic:"🦽",x:{title:"Rampe für den Rollator",story:`Vor der Haustür ist eine Stufe von <b>${fmt(b*.1)} m</b> Höhe. Die Rampe soll <b>${fmt(c*.5)} m</b> lang sein.`,q:"Wie weit reicht die Rampe waagerecht vor die Tür?"}})},
    d=>{const o=AU.hypLeg(d,2,5);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Leiter"],pic:"🍎",flip:true,x:{title:"Leiter am Apfelbaum",story:`Die Leiter ist <b>${fmt(o.c)} m</b> lang. Ihr Fuß steht <b>${fmt(o.b)} m</b> vom Stamm entfernt.`,q:"In welcher Höhe lehnt die Leiter am Baum?"}})},
    d=>{const [a,b]=AU.legsPair(d,2,8);return tHyp({a,b,u:"m",n:["Länge","Breite","Schnur"],pic:"🌷",x:{title:"Das neue Beet",story:`Das Gemüsebeet ist <b>${fmt(a)} m</b> lang und <b>${fmt(b)} m</b> breit. Zum Abstecken spannst du eine Schnur quer von Ecke zu Ecke.`,q:"Wie lang ist die Schnur?"}})}],
  stadt:[
    d=>{const [a,b]=AU.legsPair(d,20,80);return tHyp({a,b,u:"m",n:["Länge","Breite","Abkürzung"],pic:"🏙️",x:{title:"Abkürzung über den Platz",story:`Der Platz am Rheydter Markt ist an dieser Stelle <b>${fmt(a)} m</b> lang und <b>${fmt(b)} m</b> breit.`,q:"Wie lang ist der Weg schräg über den Platz?"}})},
    d=>{const [a,b]=AU.legsPair(d,50,300,1);return tHyp({a,b,u:"m",n:["nach Osten","nach Norden","Luftlinie"],pic:"🚏",x:{title:"Luftlinie zur Haltestelle",story:`Die Haltestelle liegt <b>${fmt(a)} m</b> weiter östlich und <b>${fmt(b)} m</b> weiter nördlich.`,q:"Wie weit ist sie in Luftlinie entfernt?"}})},
    d=>{const o=AU.hypLeg(d,4,12);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Seil"],pic:"🚩",x:{title:"Seil am Fahnenmast",story:`Ein Halteseil ist <b>${fmt(o.c)} m</b> lang und <b>${fmt(o.b)} m</b> vom Mast entfernt im Boden verankert.`,q:"In welcher Höhe ist das Seil am Mast befestigt?"}})}],
  profi:[
    ()=>{const L=r1(rng(6,10)),B=r1(rng(5,8)),H=r1(rng(2.8,3.6)),e=Math.hypot(L,B),dd=Math.hypot(e,H);
      return {kind:"num",ans:dd,unit:"m",sk:{a:H,b:e,unk:"c",lab:{a:`Höhe: ${fmt(H)} m`,b:`Bodendiagonale e`,c:"Raumdiagonale d = ?"},pic:"📦"},title:"Raumdiagonale im Klassenzimmer",
        story:`Das Klassenzimmer ist <b>${fmt(L)} m</b> lang, <b>${fmt(B)} m</b> breit und <b>${fmt(H)} m</b> hoch. Eine Lichterkette soll von einer unteren Ecke bis zur gegenüberliegenden oberen Ecke gespannt werden.`,
        q:"Wie lang ist die Raumdiagonale?",steps:`1) Bodendiagonale: e² = ${AU.f(L)}² + ${AU.f(B)}² = ${AU.f(Math.round(e*e*100)/100)} → e ≈ ${fmt(e)} m<br>2) Raumdiagonale: d² = e² + ${AU.f(H)}² = ${AU.f(Math.round(dd*dd*100)/100)}<br>d = √${AU.f(Math.round(dd*dd*100)/100)} ≈ ${AU.hl(fmt(dd)+" m")}`,
        hint:"Zwei Schritte: Erst die Diagonale des Bodens (Länge und Breite), dann mit dieser Diagonale und der Höhe noch einmal Pythagoras.",err:{sum:L+B+H,part:e}}},
    ()=>{const Bh=r1(rng(8,12)),h=r1(rng(2.5,4.5)),u=r1(rng(.4,.8)),s=Math.hypot(Bh/2,h)+u;
      return {kind:"num",ans:s,unit:"m",sk:{a:h,b:Bh/2,unk:"c",lab:{a:`Firsthöhe: ${fmt(h)} m`,b:`halbe Breite: ${fmt(Bh/2)} m`,c:"Sparren ohne Überstand"},pic:"🏠"},title:"Dachsparren mit Überstand",
        story:`Ein Satteldach ist <b>${fmt(Bh)} m</b> breit, der First liegt <b>${fmt(h)} m</b> über der Decke. Jeder Sparren steht unten noch <b>${fmt(u)} m</b> über die Wand hinaus.`,
        q:"Wie lang muss ein Sparren insgesamt sein?",steps:`Halbe Breite: ${fmt(Bh)} : 2 = ${fmt(Bh/2)} m<br>Sparren bis zur Wand: √(${AU.f(Bh/2)}² + ${AU.f(h)}²) ≈ ${fmt(s-u)} m<br>mit Überstand: ${fmt(s-u)} m + ${fmt(u)} m ≈ ${AU.hl(fmt(s)+" m")}`,
        hint:"Nur die halbe Dachbreite gehört ins Dreieck. Den Überstand addierst du am Ende.",err:{part:s-u,full:Math.hypot(Bh,h)+u}}},
    ()=>{const o=AU.hypLeg(3,6,18);return tLeg({c:o.c,b:o.b,u:"m",n:["Höhe","Abstand","Leiter"],pic:"🚒",x:{title:"Drehleiter der Feuerwehr",story:`Die Drehleiter ist auf <b>${fmt(o.c)} m</b> ausgefahren, ihr Fuß steht <b>${fmt(o.b)} m</b> vom Haus entfernt.`,q:"In welcher Höhe berührt die Leiter die Hauswand?"}})},
    ()=>{const x1=ri(-40,40),y1=ri(-40,40),x2=x1+ri(15,60)*pick([1,-1]),y2=y1+ri(15,60)*pick([1,-1]),dx=Math.abs(x2-x1),dy=Math.abs(y2-y1),c=Math.hypot(dx,dy);
      return tHyp({a:dx,b:dy,u:"m",n:["Δx","Δy","Abstand"],pic:"🗺️",sym:["Δx","Δy","d"],x:{title:"Abstand im Koordinatensystem",story:`Auf dem Stadtplan (1 Kästchen = 1 m) liegt die Schule bei <b>P(${x1} | ${y1})</b> und die Haltestelle bei <b>Q(${x2} | ${y2})</b>.`,q:"Wie weit sind P und Q voneinander entfernt?"}})}]};
const FIG_THEME={"Noah_Pythagoras":"schule","01_Schuelerin":"schule","classic":"schule","02_Fussballfan":"sport","06_Joggerin":"sport","05_Strassenbauer":"bau",
  "07_Geschaeftsfrau":"buero","03_Seniorin":"garten","04_Senior":"garten","08_Passant":"stadt","Dittmann_Cap":"profi"};
function themeTask(d){const th=FIG_THEME[figNow()]||"stadt";const t=pick(TH[th])(d);t.theme=th;return t}

/* Kurieraufträge: oft ein Thema der gewählten Figur */
{const base=makeTask;makeTask=function(g){const r=base(g);if(!g||g.id==="taxi"||r.target)return r;if(Math.random()>(isProfi()?.7:.45))return r;
  try{const t=themeTask(r.diff||AU.diff());return Object.assign({tag:r.tag,deliver:r.deliver},t,{giver:r.giver,tries:0,solved:false,diff:r.diff,sel:[],id:"th_"+t.theme})}catch(e){console.warn("Themenaufgabe",e);return r}}}

/* ---------- MPT-Kräfte: Tipps und Übungsaufgaben ---------- */
const MPT={"Herr Aktas":"Zeichne dir zuerst das Dreieck und markiere den rechten Winkel. Gegenüber liegt die Hypotenuse.",
  "Frau Colonna":"Schreib erst die Formel hin: c² = a² + b². Dann setzt du ein – Schritt für Schritt.",
  "Frau Brand":"Mach am Ende die Probe: Die Hypotenuse muss die längste Seite sein. Sonst stimmt etwas nicht."};
function mptTask(name){if(state.task)return;const d=AU.diff(),t=themeTask(d),dl={1:"leicht",2:"mittel",3:"schwer"}[d];
  t.hint=`<b>Tipp von ${name.replace(/^Herr /,"Herrn ")}:</b> ${MPT[name]}<br>${t.hint||""}`;
  showTask(Object.assign(t,{tag:`MPT-Übung bei ${name.replace(/^Herr /,"Herrn ")} · ${dl}`,deliver:"Danke!",hunt:"rolle_mpt",tries:0,solved:false,sel:[],diff:d}))}

/* ---------- Herr Meindorfner (Mathelehrer): Training für die Mathearbeit ---------- */
function matheTask(){if(state.task)return;const d=AU.diff(),t=themeTask(d),dl={1:"leicht",2:"mittel",3:"schwer"}[d];
  t.hint=`<b>Herr Meindorfner:</b> Skizze machen, rechten Winkel markieren, Hypotenuse finden – dann erst rechnen.<br>${t.hint||""}`;
  showTask(Object.assign(t,{tag:`Mathe-Training bei Herrn Meindorfner · ${dl}`,deliver:"Danke!",hunt:"rolle_mathe",tries:0,solved:false,sel:[],diff:d}))}

/* ---------- Frau Costantino: Aufgaben auf Englisch ---------- */
const EN_HINT_H="The <b>hypotenuse</b> is the longest side, opposite the right angle: c² = a² + b², then take the square root. <i>(Gesucht ist die Hypotenuse: quadrieren, addieren, Wurzel ziehen.)</i>";
const EN_HINT_L="You know the <b>hypotenuse</b>. A leg is: a² = c² − b², then take the square root. <i>(Gesucht ist eine Kathete: Hypotenuse² minus Kathete², dann Wurzel.)</i>";
const EN=[
  d=>{const [a,b]=AU.legsPair(d,9,28);return Object.assign(tHyp({a:Math.max(a,b),b:Math.min(a,b),u:"m",n:["length","width","diagonal"],pic:"🏀",x:{title:"The basketball court",story:`The school basketball court is <b>${fmt(Math.max(a,b))} m</b> long and <b>${fmt(Math.min(a,b))} m</b> wide. You run from one corner to the opposite corner. <i>(Das Spielfeld ist … lang und … breit. Du läufst von Ecke zu Ecke.)</i>`,q:"How long is the diagonal? (Wie lang ist die Diagonale?)"}}),{hint:EN_HINT_H})},
  d=>{const o=AU.hypLeg(d,2,6);return Object.assign(tLeg({c:o.c,b:o.b,u:"m",n:["height","distance","ladder"],pic:"🪜",flip:true,x:{title:"A ladder against the wall",story:`A ladder is <b>${fmt(o.c)} m</b> long. Its foot is <b>${fmt(o.b)} m</b> away from the school wall. <i>(Eine Leiter ist … lang, ihr Fuß steht … von der Wand entfernt.)</i>`,q:"How high does the ladder reach? (Wie hoch reicht die Leiter?)"}}),{hint:EN_HINT_L})},
  d=>{const [a,b]=AU.legsPair(d,3,8,10);return Object.assign(tHyp({a:Math.max(a,b),b:Math.min(a,b),u:"cm",n:["width","height","diagonal"],pic:"📺",rot:Math.PI/2,x:{title:"A new TV screen",story:`The screen is <b>${fmt(Math.max(a,b))} cm</b> wide and <b>${fmt(Math.min(a,b))} cm</b> high. <i>(Der Bildschirm ist … breit und … hoch.)</i>`,q:"What is the length of the diagonal? (Wie lang ist die Diagonale?)"}}),{hint:EN_HINT_H})},
  d=>{const [a,b]=AU.legsPair(d,6,20);return Object.assign(tHyp({a,b,u:"m",n:["width","length","diagonal"],pic:"🚦",x:{title:"Crossing the road",story:`The crossing is <b>${fmt(a)} m</b> wide and <b>${fmt(b)} m</b> long. Some people walk diagonally – but that is longer and dangerous! <i>(Schräg über die Kreuzung ist länger und gefährlich.)</i>`,q:"How long is the diagonal way? (Wie lang ist der schräge Weg?)"}}),{hint:EN_HINT_H})},
  d=>{const o=AU.hypLeg(d,10,35);return Object.assign(tLeg({c:o.c,b:o.b,u:"m",n:["height","distance","string"],pic:"🪁",x:{title:"Flying a kite",story:`The kite string is <b>${fmt(o.c)} m</b> long and tight. The kite is <b>${fmt(o.b)} m</b> away from you horizontally. <i>(Die Schnur ist … lang, der Drachen ist waagerecht … entfernt.)</i>`,q:"How high is the kite? (Wie hoch fliegt der Drachen?)"}}),{hint:EN_HINT_L})}];
function englishTask(){if(state.task)return;const d=AU.diff(),t=pick(EN)(d),dl={1:"easy",2:"medium",3:"hard"}[d];
  showTask(Object.assign(t,{tag:`🇬🇧 English task · Mrs Costantino · ${dl}`,deliver:"Thank you!",hunt:"rolle_en",tries:0,solved:false,sel:[],diff:d}))}
/* Verkehrsunterricht nach dem Elternbrief: ebenfalls auf Englisch */
{const base=costantinoTask;costantinoTask=function(){const t=base();const [a,b]=[t.sk.a,t.sk.b];
  return Object.assign(t,{title:"Road safety lesson with Mrs Costantino",story:`“The crossing is <b>${a} m</b> wide and <b>${b} m</b> long. If you walk diagonally instead of using the traffic lights, you are on the road much longer – without protection.” <i>(Wer schräg über die Kreuzung läuft statt an der Ampel, ist viel länger auf der Fahrbahn.)</i>`,
    q:"How long is the diagonal way across the crossing? (Wie lang ist der schräge Weg?)",hint:EN_HINT_H,tag:"Elternbrief · Road safety lesson"})}}

/* Belohnung für Übungen */
{const base=huntFound;huntFound=function(i){if(i!=="rolle_mpt"&&i!=="rolle_en"&&i!=="rolle_mathe")return base(i);const xp=i==="rolle_en"?12:8,m=i==="rolle_en"?12:10;save.xp+=xp;save.money+=m;persist();updateHud();jingle();
  toast(i==="rolle_en"?"Well done! 🇬🇧":"Super gelöst!",`+${xp} XP · +${m} $`,"#3ddc84")}}
{const base=interactables;interactables=function(VH){const L=base(VH);if(VH.id!=="walk"||state.task)return L;
  for(const t of TALK){if(Math.abs(t.x-car.x)>6||Math.abs(t.y-car.y)>6)continue;
    if(MPT[t.name])L.push({x:t.x,y:t.y,r:3,label:`💡 Übungsaufgabe von ${t.name.replace(/^Herr /,"Herrn ")} (MPT)`,act:()=>mptTask(t.name)});
    if(t.name==="Herr Meindorfner")L.push({x:t.x,y:t.y,r:3,label:"📐 Mathe-Training bei Herrn Meindorfner",act:matheTask});
    if(t.name==="Frau Costantino")L.push({x:t.x,y:t.y,r:3,label:"🇬🇧 English task – Mrs Costantino",act:englishTask})}
  return L}}

/* ---------- Kinder: nur Fahrräder und E-Scooter ---------- */
const KID_MSG="🧒 Als Kind kannst du nur Fahrräder und E-Scooter kaufen und fahren.";
const kidToast=()=>toast("Nur für Erwachsene",KID_MSG,"#ff8a3d");
{const base=buyVar;buyVar=function(vid){const v=VAR[vid];if(v&&kidBlocked(v.base)){kidToast();return}if(save.elternbrief){toast("✉️ Erst den Elternbrief klären","Verkehrsunterricht bei Frau Costantino an der GHS Dohr","#ff2a85");return}return base(vid)}}
{const base=rentVar;rentVar=function(vid){const v=VAR[vid];if(v&&kidBlocked(v.base)){kidToast();return}return base(vid)}}
{const base=useVar;useVar=function(vid){const v=VAR[vid];if(v&&kidBlocked(v.base)){kidToast();return}return base(vid)}}
{const base=enterVehicle;enterVehicle=function(){const l=save.left;if(l&&kidBlocked(l.id)){kidToast();return}return base()}}
{const base=renderShop;renderShop=function(){base();if(!isKid())return;
  for(const b of $("vgrid").querySelectorAll("button[data-vbuy],button[data-vrent],button[data-vuse]")){const v=VAR[b.dataset.vbuy||b.dataset.vrent||b.dataset.vuse];if(!v||!kidBlocked(v.base))continue;
    const n=document.createElement("button");n.type="button";n.disabled=true;n.textContent="🧒 Nur für Erwachsene";b.replaceWith(n);const c=n.closest(".vcard");if(c)c.classList.add("locked")}
  const info=$("shopInfo");if(info&&!/Kind/.test(info.textContent))info.innerHTML+=" <b>"+KID_MSG+"</b>"}}
{const base=interactables;interactables=function(VH){const L=base(VH);if(!isKid())return L;
  for(const it of L){if(!/ kaufen · \$| mieten · \$| gehört dir – nehmen/.test(it.label))continue;const v=VARS.find(v=>it.label.includes(v.name));if(v&&kidBlocked(v.base)){it.label=`🔒 ${v.icon} ${v.name} – nur für Erwachsene`;it.act=kidToast}}
  return L}}
/* Wechselt man zu einer Kinder-Figur, während man ein Auto o. Ä. fährt: aussteigen */
{let t=0;const base=update;update=function(dt){base(dt);t-=dt;if(t>0)return;t=1;if(state.mode==="play"&&kidBlocked(V().id)&&!V().fly){exitVehicle();toast("Ausgestiegen",KID_MSG,"#ff8a3d")}}}
