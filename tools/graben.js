/* ================= Gräben ausheben =================
   1) Hauptmission (Kapitel nach dem Werkhof) „Ein Graben für die Wasserleitung“ in den Kleingärten neben dem Werkhof:
      Breite und Tiefe des Gartens messen, Länge des schrägen Grabens berechnen (Pythagoras), Zusatzfrage zur schrägen Grabenwand,
      passendes Rohr wählen – dann den Graben selbst ausheben: Pflock für Pflock, der Graben entsteht Stück für Stück, am Ende liegt das Rohr.
   2) Wiederholbarer Nebenjob „Gräben für die Stadtwerke“ bei Herrn Kowalski am Mülforter Bruch: neue Maße bei jedem Auftrag. */
const GR={A:[756,345],B:[772,333],segs:[],stakes:[],dig:null,props:false};
QUESTS.push({id:"graben",district:"Mülfort",title:"Ein Graben für die Wasserleitung",
  giver:{x:751.5,y:349,name:"Frau Lenzen",role:"Vorsitzende der Kleingärtner Mülfort",shirt:"#6b8e23"},
  intro:"„Hallo! Ich bin Frau Lenzen von den Kleingärtnern. Wir brauchen eine Wasserleitung vom Hauptanschluss an der einen Ecke bis zum Gemeinschaftsbeet an der gegenüberliegenden Ecke. Am kürzesten ist der Graben schräg durch den Garten. Miss Breite und Tiefe des Gartens und rechne aus, wie lang der Graben wird. Dann graben wir!“",
  measures:[{id:"a",label:"Breite des Gartens",short:"Breite",val:16,x:764,y:346.8,where:"am Zaun vorne",line:[756,.35,345.7,772,.35,345.7]},
            {id:"b",label:"Tiefe des Gartens",short:"Tiefe",val:12,x:773.8,y:339,where:"am Zaun rechts",line:[772.7,.35,345,772.7,.35,333]}],
  lab:{a:"Breite",b:"Tiefe",c:"Graben"},ans:20,unit:"m",
  ask:"Wie lang wird der Graben schräg durch den Garten?",
  extra:{q:"Die Grabenwand ist schräg: Der Graben ist 1,2 m tief und oben auf jeder Seite 0,5 m breiter als unten. Wie lang ist eine schräge Grabenwand?",ans:1.3,unit:"m",
    steps:`√(1,2² + 0,5²) = √(1,44 + 0,25) = √1,69 = <span class="hl">1,3 m</span>`,tip:"Tiefe und Verbreiterung sind die beiden Katheten."},
  choice:{q:"Im Baumarkt gibt es Rohre mit 18 m, 20 m und 25 m. Welches nimmst du?",opts:[{v:18,t:"18 m"},{v:20,t:"20 m"},{v:25,t:"25 m"}],ok:20,
    fb:v=>v<20?"Zu kurz: 18 m < 20 m. Das Rohr reicht nicht bis zum Beet.":v>20?"Das reicht, aber 5 m bleiben übrig. Es gibt ein passendes Rohr.":"Genau richtig: 20 m – jetzt wird gegraben!"},
  doneText:"Das Rohr liegt im Graben und das Wasser fließt bis zum Gemeinschaftsbeet. Die Kleingärtner sind begeistert.",xp:45,money:130});
MAIN.splice(2,0,"graben");   // Kapitel 3: gleich nach dem Werkhof
if(typeof STAND_MODEL!=="undefined"){STAND_MODEL["Frau Lenzen"]="03_Seniorin";STAND_MODEL["Herr Kowalski"]="05_Strassenbauer"}
TALK.push({x:366,y:347,name:"Herr Kowalski",role:"Stadtwerke Mönchengladbach · Tiefbau",say:["Wir verlegen hier neue Leitungen. Wer rechnen und graben kann, ist bei mir richtig!","Erst rechnen, dann graben. Sonst gräbt man zu viel – oder zu wenig."]});

/* ---------- Graben-Bausteine ---------- */
const soil=xmat("#3b2a1c"),soilDeep=xmat("#21170f"),dirt=xmat("#6b4a2e"),stakeM=xmat("#c8a165"),tape=xmat("#ff7b00"),pipeM=xmat("#2f6fd6");
function stake(x,y){const g=new THREE.Group(),gy=groundY(x,y);const p=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,1,6),stakeM);p.position.y=.5;g.add(p);
  const t=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.12),tape);t.position.y=.95;g.add(t);g.position.set(x,gy,y);scene.add(g);return g}
function segment(x0,y0,x1,y1){const L=Math.hypot(x1-x0,y1-y0),a=Math.atan2(y1-y0,x1-x0),mx=(x0+x1)/2,my=(y0+y1)/2,gy=groundY(mx,my),g=new THREE.Group();
  const hole=new THREE.Mesh(new THREE.BoxGeometry(L+.05,.02,.75),soil);hole.position.y=.012;g.add(hole);
  const deep=new THREE.Mesh(new THREE.BoxGeometry(L,.021,.42),soilDeep);deep.position.y=.016;g.add(deep);
  const pile=new THREE.Mesh(new THREE.SphereGeometry(.5,10,6,0,Math.PI*2,0,Math.PI/2),dirt);pile.scale.set(L*.9,.55,.7);pile.position.set(0,0,.85);g.add(pile);
  g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});g.position.set(mx,gy,my);g.rotation.y=-a;scene.add(g);return g}
function pipe(A,B){const L=Math.hypot(B[0]-A[0],B[1]-A[1]),a=Math.atan2(B[1]-A[1],B[0]-A[0]),m=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,L,10),pipeM);
  m.rotation.z=Math.PI/2;const g=new THREE.Group();g.add(m);g.position.set((A[0]+B[0])/2,groundY(A[0],A[1])+.05,(A[1]+B[1])/2);g.rotation.y=-a;scene.add(g);return g}
/* Gartenkulisse: niedriger Zaun, Hauptanschluss (Standrohr) und Gemeinschaftsbeet */
function gardenProps(){if(GR.props)return;GR.props=true;const [x0,y1]=GR.A,[x1,y0]=GR.B,wood=xmat("#8a6a45");
  for(let x=x0;x<=x1+.01;x+=2)for(const y of [y0-.6,y1+.6]){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,.8,.08),wood);p.position.set(x,groundY(x,y)+.4,y);scene.add(p)}
  for(let y=y0;y<=y1+.01;y+=2)for(const x of [x0-.6,x1+.6]){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,.8,.08),wood);p.position.set(x,groundY(x,y)+.4,y);scene.add(p)}
  const tap=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.9,8),pipeM);tap.position.set(x0,groundY(x0,y1)+.45,y1);scene.add(tap);
  const bed=new THREE.Mesh(new THREE.BoxGeometry(2.4,.25,1.6),wood);bed.position.set(x1-.6,groundY(x1,y0)+.12,y0+.6);scene.add(bed);
  const earth=new THREE.Mesh(new THREE.BoxGeometry(2.2,.05,1.4),dirt);earth.position.set(x1-.6,groundY(x1,y0)+.26,y0+.6);scene.add(earth);
  GR.fount=new THREE.Mesh(new THREE.CylinderGeometry(.02,.18,.8,10,1,true),new THREE.MeshBasicMaterial({color:0x7fd3ff,transparent:true,opacity:.7,depthWrite:false}));
  GR.fount.position.set(x1-.6,groundY(x1,y0)+.7,y0+.6);GR.fount.visible=false;scene.add(GR.fount)}

/* ---------- Graben ausheben (Pflock für Pflock) ---------- */
function startDig(A,B,n,onDone,label){for(const s of GR.stakes)scene.remove(s);GR.stakes=[];
  const pts=[];for(let i=0;i<=n;i++)pts.push([A[0]+(B[0]-A[0])*i/n,A[1]+(B[1]-A[1])*i/n]);
  for(let i=1;i<=n;i++)GR.stakes.push(stake(...pts[i]));
  GR.dig={pts,i:0,n,onDone,label,segs:[],busy:0};if(!GR.mark){GR.mark=xMarker("#ff7b00")}GR.mark.visible=true;
  toast("⛏ Graben ausheben",`Geh zum ersten orangefarbenen Pflock und grabe (${isTouch?"Tippen":"E"}).`,"#ff7b00")}
function digStep(){const D=GR.dig;if(!D||D.busy>0)return;D.busy=.55;car.v=0;shake=.12;beep(110,.12,"square",.05);setTimeout(()=>beep(90,.14,"square",.05),180);
  const a=D.pts[D.i],b=D.pts[D.i+1];D.segs.push(segment(a[0],a[1],b[0],b[1]));scene.remove(GR.stakes[D.i]);D.i++;
  if(D.i<D.n){toast(`⛏ Stück ${D.i} von ${D.n}`,"Weiter zum nächsten Pflock","#ff7b00");return}
  GR.mark.visible=false;const done=D.onDone;GR.dig=null;jingle();done&&done(D)}
{const base=interactables;interactables=function(VH){const L=base(VH),D=GR.dig;
  if(D&&VH.id==="walk"&&D.i<D.n){const a=D.pts[D.i],b=D.pts[D.i+1];L.push({x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,r:2.4,label:`⛏ ${D.label||"Graben ausheben"} · Stück ${D.i+1} von ${D.n}`,act:digStep})}
  const K=TALK.find(t=>t.name==="Herr Kowalski");if(K&&!GR.dig&&VH.id==="walk")L.push({x:K.x,y:K.y,r:3.2,label:"⛏ Graben-Auftrag der Stadtwerke",act:kowalskiJob});
  return L}}
{const base=update;update=function(dt){base(dt);const D=GR.dig;if(!D)return;D.busy-=dt;if(GR.mark&&D.i<D.n){const a=D.pts[D.i],b=D.pts[D.i+1],x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;GR.mark.position.set(x,groundY(x,y)+1.6+Math.sin(performance.now()/250)*.15,y);GR.mark.rotation.y+=dt*2}}}

/* ---------- Hauptmission: erst rechnen, dann graben, dann Auftrag erledigt ---------- */
QUESTS.find(q=>q.id==="graben").transport=true;   // nach der Rohrwahl schließt der Dialog und das Graben beginnt (wie beim Transport auf dem Markt)
{const base=startTransport;startTransport=function(q,pick){if(q.id!=="graben")return base(q,pick);gardenProps();
  startDig(GR.A,GR.B,8,D=>{const s=qs(q);s.dug=true;persist();GR.segs=D.segs;GR.pipe=pipe(GR.A,GR.B);finishQuest(q);toast("Auftrag erledigt!",q.choice.fb(s.pick),"#3ddc84")},"Graben für die Wasserleitung")}}
{const base=applyEffect;applyEffect=function(id,on,animate){base(id,on,animate);if(id!=="graben")return;gardenProps();
  if(on){if(!GR.pipe&&!GR.segs.length){const n=8;for(let i=0;i<n;i++){const a=[GR.A[0]+(GR.B[0]-GR.A[0])*i/n,GR.A[1]+(GR.B[1]-GR.A[1])*i/n],b=[GR.A[0]+(GR.B[0]-GR.A[0])*(i+1)/n,GR.A[1]+(GR.B[1]-GR.A[1])*(i+1)/n];GR.segs.push(segment(a[0],a[1],b[0],b[1]))}GR.pipe=pipe(GR.A,GR.B)}
    if(GR.fount)GR.fount.visible=true}}}
{const base=animQuestWorld;animQuestWorld=function(dt,now){base(dt,now);if(GR.fount&&GR.fount.visible){GR.fount.scale.y=.85+Math.sin(now/90)*.15}}}

/* ---------- Nebenjob: Gräben für die Stadtwerke (immer neue Maße) ---------- */
const STW=[[6,8],[9,12],[5,12],[8,6],[12,9],[7.5,10]];
function kowalskiJob(){const [a,b]=pick(STW),c=Math.hypot(a,b);GR.job={a,b,c};
  const t=tHyp({a,b,u:"m",n:["Länge","Breite","Graben"],pic:"⛏",x:{title:"Gräben für die Stadtwerke",
    story:`„Die neue Leitung läuft schräg über das Baufeld. Es ist <b>${fmt(a)} m</b> lang und <b>${fmt(b)} m</b> breit. Wie lang wird der Graben?“`,q:"Wie lang wird der Graben schräg über das Baufeld?"}});
  showTask(Object.assign(t,{tag:"Stadtwerke · Tiefbau",deliver:"Los, graben!",hunt:"stadtwerke",tries:0,solved:false,sel:[]}))}
{const base=huntFound;huntFound=function(i){if(i!=="stadtwerke")return base(i);const J=GR.job,K=TALK.find(t=>t.name==="Herr Kowalski");if(!J||!K)return;
  for(const s of GR.jobSegs||[])scene.remove(s);
  const A=[K.x+2,K.y+3],ang=Math.atan2(J.b,J.a),L=Math.min(J.c,14),B=[A[0]+Math.cos(ang)*L,A[1]+Math.sin(ang)*L],n=Math.max(3,Math.round(L/2.5));
  startDig(A,B,n,D=>{GR.jobSegs=D.segs;const pay=Math.round(25+J.c*3);save.money+=pay;save.xp+=10;save.solved=(save.solved||0);persist();updateHud();checkLevel();
    missionBanner("ok","Graben fertig!",`Stadtwerke: ${fmt(J.c)} m Graben`,`+${pay} $ · +10 XP · Herr Kowalski hat bald wieder Arbeit für dich`)},"Graben für die Stadtwerke")}}
