/* Szenen des Trailers (läuft in der Spielseite). Zeiten passend zur Musik: 100 BPM, ein Takt = 2,4 s. */
window.requestAnimationFrame=()=>0;VK.cool=1e9;VK.scootCool=1e9;   // keine Strafen während der Aufnahme              // eigene Spielschleife anhalten: jedes Bild wird hier gezielt berechnet
document.body.classList.add("trailer");
const ov=document.createElement("div");ov.id="tr";ov.innerHTML=`<div class="cap" id="cap"></div><div class="black" id="blk"></div><div class="flash" id="fl"></div>
<div class="logo" id="logo"><div class="sun"></div><svg class="wz" style="left:-1%;height:170px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200"><g fill="#0b0412" fill-opacity="1"><path d="M0 200 L22 118 Q210 74 398 118 L420 200 Z"/><path d="M10 126 Q210 64 410 126 L410 132 Q210 72 10 132 Z"/><path d="M60 104 L66 82 H72 L70 104 Z"/><path d="M150 90 L154 66 H160 L160 90 Z"/><path d="M260 90 L260 66 H266 L270 90 Z"/><path d="M350 104 L348 82 H354 L360 104 Z"/></g></svg><svg class="wz" style="left:13%;height:330px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 400"><g fill="#0b0412" fill-opacity="1"><path d="M150 400 V92 H204 V400 Z"/><path d="M146 94 L177 6 L208 94 Z"/><path d="M171 18 h12 v-14 h-12 z"/><path d="M18 400 V214 H150 V400 Z"/><path d="M14 216 L84 160 L154 216 Z"/><path d="M204 400 V250 H248 V400 Z"/><path d="M200 252 L226 214 L252 252 Z"/><path d="M30 400 V300 H40 V400 Z"/><path d="M60 400 V300 H70 V400 Z"/><path d="M90 400 V300 H100 V400 Z"/><path d="M120 400 V300 H130 V400 Z"/></g></svg><svg class="wz" style="left:26%;height:250px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400"><g fill="#0b0412" fill-opacity="1"><path d="M84 400 V120 H116 V400 Z"/><path d="M80 122 L100 0 L120 122 Z"/><path d="M20 400 V250 H84 V400 Z"/><path d="M16 252 L50 210 L84 252 Z"/><path d="M116 400 V270 H176 V400 Z"/><path d="M112 272 L146 236 L180 272 Z"/></g></svg><svg class="wz" style="left:63%;height:150px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220"><g fill="#0b0412" fill-opacity="1"><path d="M0 220 V150 H320 V220 Z"/><path d="M10 150 L10 112 L50 132 L50 112 L90 132 L90 112 L130 132 L130 112 L170 132 V150 Z"/><path d="M212 220 V36 H262 V220 Z"/><path d="M206 40 H268 V30 H206 Z"/><path d="M180 150 V118 H212 V150 Z"/></g></svg><svg class="wz" style="left:75%;height:300px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400"><g fill="#0b0412" fill-opacity="1"><path d="M76 400 L82 150 H118 L124 400 Z"/><path d="M42 150 V78 H158 V150 Z"/><path d="M36 80 Q100 30 164 80 Z"/><path d="M93 50 V30 H107 V50 Z"/><path d="M90 32 L100 16 L110 32 Z"/><path d="M60 400 V360 H140 V400 Z"/></g></svg><svg class="wz" style="left:84%;height:170px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><g fill="#0b0412" fill-opacity="1"><path d="M70 236 V118 H290 V236 Z"/><path d="M64 120 L90 82 H270 L296 120 Z"/><path d="M28 236 V104 H72 V236 Z"/><path d="M24 106 L50 52 L76 106 Z"/><path d="M288 236 V104 H332 V236 Z"/><path d="M284 106 L310 52 L336 106 Z"/><path d="M168 120 V56 H192 V120 Z"/><path d="M162 58 Q180 18 198 58 Z"/><path d="M177 30 h6 v-16 h-6 z"/><path d="M0 260 V236 H400 V260 Z"/></g></svg>
<h1>PYTHAGORAS<br>CITY</h1><div id="soon">COMING SOON</div><p style="top:85%">MÖNCHENGLADBACH · MATHE KLASSE 9</p><p style="top:92%;color:#fff;letter-spacing:.3em;font-size:20px;text-shadow:none">DEMNÄCHST ALS SPIEL AN DEINER GHS DOHR</p></div>`;
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
 {id:"B",t0:4.8,t1:9.6,start(){place("walk",S0[0]+40,S0[1]+30,S0[2],0)},frame(t){const u=(t-4.8)/4.8,C=TALK.find(q=>q.name==="Frau Costantino")||{x:850,y:234};
   CAMF=()=>({p:[C.x-4.5+u*8,1.75,C.y+6.2],l:[C.x+u*3.5,1.35,C.y-7],fov:48});
   cap("Deine Schule.<br>Deine Lehrer.<small>GHS Dohr · Am Torfbend</small>",t,5.2,9.4)}},
 {id:"C",t0:9.6,t1:14.4,start(){place("walk",S0[0]-11*Math.cos(S0[2]),S0[1]-11*Math.sin(S0[2]),S0[2],1.8);ST.c=[car.x,car.y]},frame(t){const u=t-9.6,a=S0[2],x=ST.c[0]+Math.cos(a)*1.8*u,y=ST.c[1]+Math.sin(a)*1.8*u;
   car.x=x;car.y=y;car.a=a;car.v=1.8;CAMF=()=>({p:[x+Math.cos(a)*3.6+Math.sin(a)*1.2,1.25,y+Math.sin(a)*3.6-Math.cos(a)*1.2],l:[x,1.05,y],fov:42});
   cap("Noah.<small>Klasse 9 · Mathe-Ass in Ausbildung</small>",t,10.2,14.2)}},
 {id:"D",t0:14.4,t1:19.2,start(){place("walk",MK[0]+4,MK[1]+18,-Math.PI/2,0)},frame(t){const u=(t-14.4)/4.8,ang=1.9+u*.9;CAMF=()=>({p:[MK[0]+Math.cos(ang)*34,9-u*3,MK[1]+Math.sin(ang)*34],l:[MK[0],1.5,MK[1]],fov:50});
   cap("Die ganze Stadt<br>ist dein Klassenzimmer.",t,14.8,19.0)}},
 {id:"E1",t0:19.2,t1:20.8,start(){save.scootTuned=false;const [x,y,a]=rdA(150,2.3);place("bike",x,y,a,6)},frame(t){const s=150+(t-19.2)*6,[x,y,A]=rdA(s,2.3);RD.a=A;car.x=x;car.y=y;car.a=A;car.v=6;const L=[-Math.sin(A),Math.cos(A)];
   CAMF=()=>({p:[x+L[0]*4.2+Math.cos(RD.a)*.8,1.2,y+L[1]*4.2+Math.sin(RD.a)*.8],l:[x,1.0,y],fov:44});$f.style.opacity=Math.max(0,1-(t-19.2)/.25)}},
 {id:"E2",t0:20.8,t1:24.0,start(){const [x,y,a]=rdA(175);place("moped",x,y,a,10)},frame(t){const s=175+(t-20.8)*10,[x,y,A]=rdA(s);RD.a=A;car.x=x;car.y=y;car.a=A;car.v=10;
   CAMF=()=>({p:[x+Math.cos(RD.a)*5.5,.7,y+Math.sin(RD.a)*5.5+.6],l:[x,1.1,y],fov:40})}},
 {id:"F",t0:24.0,t1:28.8,start(){const [x,y,a]=rdA(160);place("auto",x,y,a,16)},frame(t){const s=160+(t-24)*16,[x,y,A]=rdA(s);RD.a=A;car.x=x;car.y=y;car.a=A;car.v=16;const L=[-Math.sin(RD.a),Math.cos(RD.a)],k=(t-24)/4.8;
   CAMF=()=>({p:[x-Math.cos(RD.a)*(7-k*3)+L[0]*(2.5+k*3),.9+k*.6,y-Math.sin(RD.a)*(7-k*3)+L[1]*(2.5+k*3)],l:[x+Math.cos(RD.a)*2,.8,y+Math.sin(RD.a)*2],fov:46});
   cap("a² + b² = c²",t,25.8,28.6,"grad mid")}},
 {id:"G1",t0:28.8,t1:32.0,start(){const q=questById("markt"),st=qs(q);st.acc=true;st.m={a:true,b:true};st.done=false;applyEffect("markt",false,false);refreshQuestWorld();
   const z=MG.q.markt.zone;showRoute([[z[0],z[1]],[z[2],z[3]]]);ST.z=z;place("walk",z[0]-3,z[3]+4,-.6,0)},
  frame(t){const k=(t-28.8)/3.2,z=ST.z,cx=(z[0]+z[2])/2,cy=(z[1]+z[3])/2,ang=.55+k*.35;
   CAMF=()=>({p:[cx+Math.cos(ang)*17,10.5-k*1.5,cy+Math.sin(ang)*17],l:[cx,0,cy],fov:46});
   cap("9 m und 12 m …<br>quer nur 15 m.<small>Mission: Quer über den Markt</small>",t,29.0,31.9,"nocase")}},
 {id:"G2",t0:32.0,t1:33.6,start(){place("plane",700,60,.35,30);VEH.plane.fly=true;car.alt=55;car.vy=0},frame(t){const k=t-32.0,x=700+Math.cos(.35)*30*k,y=60+Math.sin(.35)*30*k;car.x=x;car.y=y;car.a=.35;car.v=30;VEH.plane.fly=true;car.alt=55+k*2;car.vy=2;car.steer=.35;
   CAMF=()=>({p:[x-Math.cos(.35)*12-Math.sin(.35)*7,car.alt+3,y-Math.sin(.35)*12+Math.cos(.35)*7],l:[x+Math.cos(.35)*4,car.alt,y+Math.sin(.35)*4],fov:50});cap("Rechne dich<br>durch die Stadt.",t,32.1,33.55)}},
 {id:"H",t0:33.6,t1:36.8,start(){place("walk",WK.giver[0]-3,WK.giver[1]+18,-Math.PI/2,0);const q=questById("werkhof"),s=qs(q);s.acc=true;s.m={a:true,b:true};s.done=false;applyEffect("werkhof",false,false);refreshQuestWorld();ST.lit=false},
  frame(t){const k=(t-33.6)/3.2,c=[WK.wall[0]+4,WK.wall[1]],ang=2.3+k*.7;CAMF=()=>({p:[c[0]+Math.cos(ang)*14,4+k*2,c[1]+Math.sin(ang)*14],l:[c[0],3,c[1]],fov:50});
   if(t>=35.2&&!ST.lit){ST.lit=true;const q=questById("werkhof");qs(q).done=true;applyEffect("werkhof",true,true);refreshQuestWorld();for(const m of q.measures){m.tube.visible=m.lab.visible=true}}
   $f.style.opacity=t>=35.2&&t<35.5?1-(t-35.2)/.3:0;cap(t<35.2?"6 m und 8 m …<small>Mission: Licht für den Werkhof</small>":"… sind 10 m Kabel.<small>Mission: Licht für den Werkhof</small>",t,33.8,36.75,"nocase")}},
 {id:"I1",t0:36.8,t1:40.0,start(){const q=questById("treppe"),st=qs(q);st.acc=true;st.m={a:true,b:true};st.done=false;refreshQuestWorld();
   let cx=0,cy=0,cz=0;for(const m of q.measures){cx+=m.line[0]+m.line[3];cy+=m.line[1]+m.line[4];cz+=m.line[2]+m.line[5]}cx/=4;cy/=4;cz/=4;
   const dx=cx-SCH[0],dz=cz-SCH[1],L=Math.hypot(dx,dz)||1;ST.t={cx,cy,cz,ux:dx/L,uz:dz/L};place("walk",cx+dx/L*3,cz+dz/L*3,0,0)},
  frame(t){const k=(t-36.8)/3.2,T=ST.t,px=-T.uz,pz=T.ux;
   CAMF=()=>({p:[T.cx+T.ux*8.5+px*(3-k*4),3.2,T.cz+T.uz*8.5+pz*(3-k*4)],l:[T.cx,2.2,T.cz],fov:50});
   cap("3,9 m und 5,5 m …<br>6,7 m Handlauf.<small>Mission: Ein Handlauf für die Außentreppe</small>",t,37.0,39.95,"nocase")}},
 {id:"I2",t0:40.0,t1:41.6,start(){applyLook(Object.assign({},LOOK_DEF));const [x0,y0,a0]=rdA(330,1.9);RD.a=a0;place("auto",x0,y0,a0,0);exitVehicle();TR.on=false;TR.done=null;const L=[-Math.sin(RD.a),Math.cos(RD.a)];car.x+=L[0]*1.2;car.y+=L[1]*1.2;ST.i=[x0,y0];enterVehicle()},
  frame(t){const [x,y]=ST.i;CAMF=()=>({p:[x+Math.sin(RD.a)*-6.5+Math.cos(RD.a)*2.5,1.7,y-Math.cos(RD.a)*-6.5+Math.sin(RD.a)*2.5],l:[x,1.0,y],fov:44});cap("Steig ein.",t,40.1,41.55);
   $b.style.opacity=t>41.35?(t-41.35)/.25:0}},
 {id:"J",t0:41.6,t1:48,start(){},frame(t){const k=t-41.6;$b.style.opacity=0;$c.style.opacity=0;$l.style.opacity=Math.min(1,k/.15);$f.style.opacity=Math.max(0,1-k/.4);
   $l.querySelector("h1").style.transform=`scale(${1.08-.08*sm(k/4)})`;const so=document.getElementById("soon"),T=4.8,u2=(k-T)/.3;so.style.opacity=k<T?0:Math.min(1,u2*1.5);so.style.transform=`translateX(-50%) scale(${k<T?1.6:1+.6*(1-sm(u2))})`;/* Logo mit dem Anstieg (41,6 s), COMING SOON auf dem Höhepunkt (46,4 s); Schnitte liegen auf den Takten der Titelmelodie (150 BPM, Takt 1,6 s) */if(k>6.05)$l.style.opacity=Math.max(0,1-(k-6.05)/.35)}},
];
window.SHOTS=SHOTS;
window.shotStart=id=>{const s=SHOTS.find(s=>s.id===id);$c.style.opacity=0;$f.style.opacity=0;$b.style.opacity=0;$l.style.opacity=0;CAMF=null;ST={};s.start();
  for(let i=0;i<6;i++){update(1/24);s.frame(s.t0);render3D(1/24,simNow+=1000/24)}};
window.shotFrame=(id,t)=>{const s=SHOTS.find(s=>s.id===id);$c.style.opacity=0;state.mode="play";update(1/24);s.frame(t);render3D(1/24,simNow+=1000/24)};
