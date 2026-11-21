/* Szenen des Trailers (läuft in der Spielseite). Zeiten passend zur Musik: 100 BPM, ein Takt = 2,4 s. */
window.requestAnimationFrame=()=>0;              // eigene Spielschleife anhalten: jedes Bild wird hier gezielt berechnet
document.body.classList.add("trailer");
const ov=document.createElement("div");ov.id="tr";ov.innerHTML=`<div class="cap" id="cap"></div><div class="black" id="blk"></div><div class="flash" id="fl"></div>
<div class="logo" id="logo"><div class="sun"></div>${[[6,1,1],[16,.8,-1],[78,.9,1],[88,1.15,-1]].map(([x,s,f])=>`<svg class="palm" style="left:${x}%;transform:translateX(-50%) scale(${s*f},${s})" width="230" height="330" viewBox="0 0 230 330"><path d="M112 330 C116 250 122 180 128 112 L136 112 C132 180 130 250 128 330Z" fill="#0b0412"/>
<g fill="#0b0412"><path d="M132 112 C90 70 40 80 8 120 C50 92 92 96 132 118Z"/><path d="M132 112 C170 66 214 74 228 110 C196 88 166 94 134 118Z"/><path d="M132 110 C110 50 70 30 30 42 C76 46 106 70 128 116Z"/>
<path d="M132 110 C150 46 190 28 222 40 C182 46 156 72 136 116Z"/><path d="M132 110 C128 60 140 20 156 4 C150 40 146 76 138 114Z"/><path d="M132 114 C96 120 64 150 52 196 C78 160 104 140 134 122Z"/><path d="M134 114 C170 124 196 156 204 196 C182 160 158 140 132 122Z"/></g></svg>`).join("")}
<h1>PYTHAGORAS<br>CITY</h1><p style="top:85%">MÖNCHENGLADBACH · MATHE KLASSE 9</p><p style="top:92%;color:#fff;letter-spacing:.3em;font-size:20px;text-shadow:none">DEMNÄCHST ALS SPIEL AN DEINER GHS DOHR</p></div>`;
document.body.appendChild(ov);
const $c=document.getElementById("cap"),$b=document.getElementById("blk"),$f=document.getElementById("fl"),$l=document.getElementById("logo");
const sm=u=>u<0?0:u>1?1:u*u*(3-2*u),lerp=(a,b,u)=>a+(b-a)*u;
let CAMF=null;{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(CAMF){const c=CAMF();camera.position.set(...c.p);camera.lookAt(...c.l);const fov=c.fov||50;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix()}}}}
function own(id){if(!save.owned.includes(id))save.owned.push(id)}
function place(id,x,y,a,v){if(V().id!==id){save.left=null;own(id);setVehicle(id)}car.x=x;car.y=y;car.a=a;car.v=v;if(VEH[id].fly){car.alt=Math.max(car.alt||0,0)}}
function cap(txt,t,a,b,cls=""){const on=t>=a&&t<b;if(!on)return false;const u=Math.min(1,(t-a)/.35),o=Math.min(u,Math.min(1,(b-t)/.3));
  $c.className="cap "+cls;$c.innerHTML=txt;$c.style.opacity=o;$c.style.transform=`translateX(${(1-sm(u))*-40}px) skewX(-4deg)`;return true}
let simNow=100000,ST={};
const S0=MG.start,SCH=MG.FX(-298,-106),MK=[-540,-805],WK=MG.q.werkhof;
/* Straße Am Torfbend (Mittellinie aus den Kartendaten); gefahren wird auf der rechten Fahrspur */
const PATH=[[496,174],[628,199],[652,203],[747,221],[791,230],[836,238],[897,248],[930,254]];
function rdA(s,off=1.6){let acc=0;for(let i=1;i<PATH.length;i++){const [x0,y0]=PATH[i-1],[x1,y1]=PATH[i],L=Math.hypot(x1-x0,y1-y0);
  if(s<=acc+L||i===PATH.length-1){const u=(s-acc)/L,a=Math.atan2(y1-y0,x1-x0),x=x0+(x1-x0)*u-Math.sin(a)*off,y=y0+(y1-y0)*u+Math.cos(a)*off;return [x,y,a]}acc+=L}}
const rd=(s,off)=>rdA(s,off).slice(0,2);const RD={a:0};
const SHOTS=[
 {id:"A",t0:0,t1:4.8,start(){place("walk",S0[0],S0[1],S0[2],0)},frame(t){const u=sm(t/4.8);CAMF=()=>({p:[lerp(560,700,u),lerp(150,95,u),lerp(420,330,u)],l:[lerp(860,880,u),0,lerp(210,220,u)],fov:45});
   $b.style.opacity=t<1.2?1-t/1.2:0;cap("Mönchengladbach.<small>Rheydt · Mülfort</small>",t,1.4,4.6)}},
 {id:"B",t0:4.8,t1:9.6,start(){place("walk",S0[0],S0[1],S0[2],0)},frame(t){const u=(t-4.8)/4.8;CAMF=()=>({p:[S0[0]-30+u*24,6+u*1.5,S0[1]+20-u*2],l:[SCH[0]+2,6,SCH[1]+10],fov:50});
   cap("Deine Schule.<small>GHS Dohr · Standort Am Torfbend</small>",t,5.2,9.4)}},
 {id:"C",t0:9.6,t1:14.4,start(){place("walk",S0[0]-11*Math.cos(S0[2]),S0[1]-11*Math.sin(S0[2]),S0[2],1.8);ST.c=[car.x,car.y]},frame(t){const u=t-9.6,a=S0[2],x=ST.c[0]+Math.cos(a)*1.8*u,y=ST.c[1]+Math.sin(a)*1.8*u;
   car.x=x;car.y=y;car.a=a;car.v=1.8;CAMF=()=>({p:[x+Math.cos(a)*3.6+Math.sin(a)*1.2,1.25,y+Math.sin(a)*3.6-Math.cos(a)*1.2],l:[x,1.05,y],fov:42});
   cap("Noah.<small>Klasse 9 · Mathe-Ass in Ausbildung</small>",t,10.2,14.2)}},
 {id:"D",t0:14.4,t1:19.2,start(){place("walk",MK[0]+4,MK[1]+18,-Math.PI/2,0)},frame(t){const u=(t-14.4)/4.8,ang=1.9+u*.9;CAMF=()=>({p:[MK[0]+Math.cos(ang)*34,9-u*3,MK[1]+Math.sin(ang)*34],l:[MK[0],1.5,MK[1]],fov:50});
   cap("Die ganze Stadt<br>ist dein Klassenzimmer.",t,14.8,19.0)}},
 {id:"E1",t0:19.2,t1:21.6,start(){const [x,y,a]=rdA(150,2.3);place("bike",x,y,a,6)},frame(t){const s=150+(t-19.2)*6,[x,y,A]=rdA(s,2.3);RD.a=A;car.x=x;car.y=y;car.a=A;car.v=6;const L=[-Math.sin(A),Math.cos(A)];
   CAMF=()=>({p:[x+L[0]*4.2+Math.cos(RD.a)*.8,1.2,y+L[1]*4.2+Math.sin(RD.a)*.8],l:[x,1.0,y],fov:44});$f.style.opacity=Math.max(0,1-(t-19.2)/.25)}},
 {id:"E2",t0:21.6,t1:24.0,start(){const [x,y,a]=rdA(175);place("moped",x,y,a,10)},frame(t){const s=175+(t-21.6)*10,[x,y,A]=rdA(s);RD.a=A;car.x=x;car.y=y;car.a=A;car.v=10;
   CAMF=()=>({p:[x+Math.cos(RD.a)*5.5,.7,y+Math.sin(RD.a)*5.5+.6],l:[x,1.1,y],fov:40})}},
 {id:"F",t0:24.0,t1:28.8,start(){const [x,y,a]=rdA(160);place("auto",x,y,a,16)},frame(t){const s=160+(t-24)*16,[x,y,A]=rdA(s);RD.a=A;car.x=x;car.y=y;car.a=A;car.v=16;const L=[-Math.sin(RD.a),Math.cos(RD.a)],k=(t-24)/4.8;
   CAMF=()=>({p:[x-Math.cos(RD.a)*(7-k*3)+L[0]*(2.5+k*3),.9+k*.6,y-Math.sin(RD.a)*(7-k*3)+L[1]*(2.5+k*3)],l:[x+Math.cos(RD.a)*2,.8,y+Math.sin(RD.a)*2],fov:46});
   cap("a² + b² = c²",t,25.8,28.6,"grad mid")}},
 {id:"G1",t0:28.8,t1:31.2,start(){place("heli",830,120,.6,12);car.alt=38},frame(t){const k=t-28.8,x=830+Math.cos(.6)*12*k,y=120+Math.sin(.6)*12*k;car.x=x;car.y=y;car.a=.6;car.v=12;car.alt=38;car.rotor=1;
   CAMF=()=>({p:[x-13+k*1.5,42,y+13],l:[x,37.5,y],fov:46});cap("Rechne dich<br>durch die Stadt.",t,29.2,33.4)}},
 {id:"G2",t0:31.2,t1:33.6,start(){place("plane",700,60,.35,30);VEH.plane.fly=true;car.alt=55;car.vy=0},frame(t){const k=t-31.2,x=700+Math.cos(.35)*30*k,y=60+Math.sin(.35)*30*k;car.x=x;car.y=y;car.a=.35;car.v=30;VEH.plane.fly=true;car.alt=55+k*2;car.vy=2;car.steer=.35;
   CAMF=()=>({p:[x-Math.cos(.35)*12-Math.sin(.35)*7,car.alt+3,y-Math.sin(.35)*12+Math.cos(.35)*7],l:[x+Math.cos(.35)*4,car.alt,y+Math.sin(.35)*4],fov:50});cap("Rechne dich<br>durch die Stadt.",t,29.2,33.4)}},
 {id:"H",t0:33.6,t1:38.4,start(){place("walk",WK.giver[0]-3,WK.giver[1]+18,-Math.PI/2,0);const q=questById("werkhof"),s=qs(q);s.acc=true;s.m={a:true,b:true};s.done=false;applyEffect("werkhof",false,false);refreshQuestWorld();ST.lit=false},
  frame(t){const k=(t-33.6)/4.8,c=[WK.wall[0]+4,WK.wall[1]],ang=2.3+k*.7;CAMF=()=>({p:[c[0]+Math.cos(ang)*14,4+k*2,c[1]+Math.sin(ang)*14],l:[c[0],3,c[1]],fov:50});
   if(t>=36&&!ST.lit){ST.lit=true;const q=questById("werkhof");qs(q).done=true;applyEffect("werkhof",true,true);refreshQuestWorld();for(const m of q.measures){m.tube.visible=m.lab.visible=true}}
   $f.style.opacity=t>=36&&t<36.3?1-(t-36)/.3:0;cap(t<36?"6 m und 8 m …":"… sind 10 m Kabel.<small>Licht an im Werkhof</small>",t,33.9,38.3,"nocase")}},
 {id:"I1",t0:38.4,t1:40.8,start(){const [x0,y0,a0]=rdA(300,2.4);RD.a=a0;place("bike",x0,y0,a0,0);exitVehicle();TR.on=false;TR.done=null;const L=[-Math.sin(RD.a),Math.cos(RD.a)];car.x+=L[0]*1.8;car.y+=L[1]*1.8;ST.i=[x0,y0];enterVehicle()},
  frame(t){const [x,y]=ST.i;CAMF=()=>({p:[x+Math.sin(RD.a)*-5.2+Math.cos(RD.a)*1.5,1.6,y-Math.cos(RD.a)*-5.2+Math.sin(RD.a)*1.5],l:[x,1.0,y],fov:42});cap("Steig auf.",t,38.8,40.7)}},
 {id:"I2",t0:40.8,t1:43.2,start(){const [x0,y0,a0]=rdA(330,1.9);RD.a=a0;place("auto",x0,y0,a0,0);exitVehicle();TR.on=false;TR.done=null;const L=[-Math.sin(RD.a),Math.cos(RD.a)];car.x+=L[0]*1.2;car.y+=L[1]*1.2;ST.i=[x0,y0];enterVehicle()},
  frame(t){const [x,y]=ST.i;CAMF=()=>({p:[x+Math.sin(RD.a)*-6.5+Math.cos(RD.a)*2.5,1.7,y-Math.cos(RD.a)*-6.5+Math.sin(RD.a)*2.5],l:[x,1.0,y],fov:44});cap("Steig ein.",t,41.1,43.1);
   $b.style.opacity=t>42.7?(t-42.7)/.5:0}},
 {id:"J",t0:43.2,t1:48,start(){},frame(t){const k=t-43.2;$b.style.opacity=0;$c.style.opacity=0;$l.style.opacity=Math.min(1,k/.15);$f.style.opacity=Math.max(0,1-k/.4);
   $l.querySelector("h1").style.transform=`scale(${1.08-.08*sm(k/2.5)})`;if(k>4)$l.style.opacity=Math.max(0,1-(k-4)/.8)}},
];
window.SHOTS=SHOTS;
window.shotStart=id=>{const s=SHOTS.find(s=>s.id===id);$c.style.opacity=0;$f.style.opacity=0;$b.style.opacity=0;$l.style.opacity=0;CAMF=null;ST={};s.start();
  for(let i=0;i<6;i++){update(1/24);s.frame(s.t0);render3D(1/24,simNow+=1000/24)}};
window.shotFrame=(id,t)=>{const s=SHOTS.find(s=>s.id===id);$c.style.opacity=0;state.mode="play";update(1/24);s.frame(t);render3D(1/24,simNow+=1000/24)};
