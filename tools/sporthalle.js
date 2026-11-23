/* ================= Sporthalle der GHS Dohr (begehbar) =================
   Nach den Fotos vom 19.11.: Halle mit Holzverkleidung, dunkler Prallschutz unten, hohe Fenster, Rasterdecke mit Leuchtbändern,
   Basketballkörbe mit aufgemaltem Tor an den Stirnwänden, Sprossenwand mit Weichbodenmatte, Turnringe, Langbank, Geräteraum mit Kasten.
   Betreten durch die Tür in der Ostwand (Durchgang zwischen Halle und Hofmauer, hinter dem Tor; E / Tippen), drinnen ist die Halle frei begehbar.
   Hauptmission „Der Diagonal-Sprint“ bei Herrn Maaß (Sportlehrer): Spielfeld 15 m × 8 m vermessen, Diagonale berechnen (17 m),
   Zusatzfrage zur Weichbodenmatte an der Sprossenwand, Anzahl der Diagonalen für 100 m – dann den Sprint selbst laufen.
   Alle Maße in Spielkarten-Koordinaten der Schule (x nach Osten, z nach Süden); fx_pass.js setzt sie auf das echte Grundstück. */
const HALL={x0:-289.6,x1:-268.4,z0:-147.6,z1:-132.4,h:6.8,ex:[-290,-268,-148,-132],
  doorOut:[-266.5,-134.6],doorIn:[-269.3,-134.6],field:{x0:-286.5,x1:-271.5,z0:-144,z1:-136},chimney:[-270,-269.2,-133.4,-132.6]};
const hallR=(x,z)=>MG.FX?MG.FX(x,z):[x,z];
function hallL(x,y){const S=MG.XF&&MG.XF.find(c=>c.id==="S");if(!S)return [x,y];const dx=x-S.t[0],dy=y-S.t[1],co=Math.cos(S.r),si=Math.sin(S.r);
  return [S.f[0]+dx*co+dy*si,S.f[1]-dx*si+dy*co]}
const hallRot=()=>{const S=MG.XF&&MG.XF.find(c=>c.id==="S");return S?S.r:0};
function inHall(x,y,m=0){const [lx,lz]=hallL(x,y);return lx>HALL.x0-m&&lx<HALL.x1+m&&lz>HALL.z0-m&&lz<HALL.z1+m}

/* ---------- Mission ---------- */
QUESTS.push({id:"sporthalle",district:"Dohr/Torfbend",title:"Der Diagonal-Sprint",
  giver:{x:-283,y:-134.6,name:"Herr Maaß",role:"Sportlehrer an der GHS Dohr",shirt:"#e07a2f"},
  intro:"„Da bist du ja! Ich bin Herr Maaß, euer Sportlehrer. Heute laufen wir den Diagonal-Sprint: quer über das grüne Spielfeld, von einer Ecke bis zur gegenüberliegenden Ecke. Miss bitte die Länge und die Breite des Spielfelds und rechne aus, wie lang die Sprintstrecke ist. Danach läufst du sie selbst!“",
  measures:[{id:"a",label:"Länge des Spielfelds",short:"Länge",val:15,x:-279,y:-144.6,where:"an der langen grünen Linie",line:[-286.5,.05,-144,-271.5,.05,-144]},
            {id:"b",label:"Breite des Spielfelds",short:"Breite",val:8,x:-270.9,y:-140,where:"an der kurzen grünen Linie",line:[-271.5,.05,-144,-271.5,.05,-136]}],
  lab:{a:"Länge",b:"Breite",c:"Diagonale"},ans:17,unit:"m",
  ask:"Wie lang ist der Diagonal-Sprint von Ecke zu Ecke?",
  extra:{q:"Die Weichbodenmatte ist 2,5 m lang und lehnt an der Sprossenwand. Unten steht sie 0,7 m von der Wand weg. Wie hoch reicht sie an der Wand?",ans:2.4,unit:"m",
    steps:`√(2,5² − 0,7²) = √(6,25 − 0,49) = √5,76 = <span class="hl">2,4 m</span>`,tip:"Die Matte ist die Hypotenuse. Gesucht ist eine Kathete: Hypotenuse² minus die andere Kathete²."},
  choice:{q:"Jeder soll mindestens 100 m sprinten. Wie viele Diagonalen muss man mindestens laufen?",opts:[{v:5,t:"5 Diagonalen"},{v:6,t:"6 Diagonalen"},{v:7,t:"7 Diagonalen"}],ok:6,
    fb:v=>v<6?"Zu wenig: 5 · 17 m = 85 m. Das sind noch keine 100 m.":v>6?"Das reicht, aber 6 · 17 m = 102 m genügen schon.":"Genau: 6 · 17 m = 102 m – mindestens 100 m. Jetzt lauf die erste Diagonale!"},
  doneText:"Herr Maaß stoppt deine Zeit und trägt sie ins Sportheft ein. Der Diagonal-Sprint ist ab jetzt fester Teil des Sportunterrichts.",xp:45,money:120});
{const i=MAIN.indexOf("schulhof");MAIN.splice(i>=0?i+1:MAIN.length,0,"sporthalle")}
if(typeof STAND_MODEL!=="undefined")STAND_MODEL["Herr Maaß"]="08_Passant";

/* ---------- Innenraum ---------- */
function buildHall(){
  const B0=BASE_Y,{x0,x1,z0,z1,h}=HALL,W=x1-x0,D=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,G=new THREE.Group();G.name="sporthalle";
  const lit=(map,k=.55,o={})=>new THREE.MeshLambertMaterial(Object.assign({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:k},o));
  const col=(c,k=.5)=>new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:k});
  const add=(geo,mat,x,y,z,ry=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;G.add(m);return m};
  const box=(mat,x,y,z,sx,sy,sz,ry=0)=>add(new THREE.BoxGeometry(sx,sy,sz),mat,x,y,z,ry);
  const plane=(mat,x,y,z,w,hh,ry)=>add(new THREE.PlaneGeometry(w,hh),mat,x,y,z,ry);

  /* Boden: hellgrauer Sportboden mit Linien, das grüne Spielfeld 15 m × 8 m für die Mission */
  const PX=64,fw=Math.round(W*PX),fd=Math.round(D*PX);
  const floorT=canvasTex(fw,fd,(g)=>{g.fillStyle="#a3ada6";g.fillRect(0,0,fw,fd);noise(g,fw,fd,26000,["rgba(0,0,0,.035)","rgba(255,255,255,.07)"],2);
    for(let i=0;i<9;i++){const gr=g.createRadialGradient(fw*(i+.5)/9,fd*.5,10,fw*(i+.5)/9,fd*.5,fd*.45);gr.addColorStop(0,"rgba(255,255,255,.16)");gr.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=gr;g.fillRect(0,0,fw,fd)}
    const P=(x,z)=>[(x-x0)*PX,(z-z0)*PX],line=(c,w,pts,dash)=>{g.strokeStyle=c;g.lineWidth=w*PX;g.setLineDash(dash?dash.map(d=>d*PX):[]);g.beginPath();pts.forEach((p,k)=>{const q=P(...p);k?g.lineTo(...q):g.moveTo(...q)});g.stroke();g.setLineDash([])};
    const arc=(c,w,x,z,r,a0,a1)=>{g.strokeStyle=c;g.lineWidth=w*PX;g.beginPath();g.arc(...P(x,z),r*PX,a0,a1);g.stroke()};
    // Basketball (schwarz): Mittelkreis, Zonen, Dreierlinien
    arc("#1d1f22",.06,cx,cz,1.8,0,7);line("#1d1f22",.06,[[cx,z0+.6],[cx,z1-.6]]);
    for(const s of [1,-1]){const bx=s>0?x0+.6:x1-.6;line("#1d1f22",.06,[[bx,cz-2.45],[bx+s*5.2,cz-2.45],[bx+s*5.2,cz+2.45],[bx,cz+2.45]]);arc("#1d1f22",.06,bx+s*5.2,cz,1.8,s>0?-Math.PI/2:Math.PI/2,s>0?Math.PI/2:Math.PI*1.5);
      arc("#1d1f22",.06,bx+s*1.2,cz,6.2,s>0?-1.25:Math.PI-1.25,s>0?1.25:Math.PI+1.25)}
    // Handball / Volleyball (rot gestrichelt, gelb)
    line("#c8323a",.05,[[x0+.4,z0+1.2],[x1-.4,z0+1.2]],[.3,.3]);line("#c8323a",.05,[[x0+.4,z1-1.2],[x1-.4,z1-1.2]],[.3,.3]);
    line("#e3b21e",.05,[[x0+.25,z0+.25],[x0+.25,z1-.25]]);line("#e3b21e",.05,[[x1-.25,z0+.25],[x1-.25,z1-.25]]);line("#e3b21e",.05,[[cx-4.5,z0+.3],[cx-4.5,z1-.3]]);
    // grünes Spielfeld (Mission)
    const F=HALL.field;line("#16a34a",.1,[[F.x0,F.z0],[F.x1,F.z0],[F.x1,F.z1],[F.x0,F.z1],[F.x0,F.z0]]);line("#16a34a",.06,[[(F.x0+F.x1)/2,F.z0],[(F.x0+F.x1)/2,F.z1]])});
  const flM=lit(floorT,.1,{color:0x8e9791,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8});const fl=plane(flM,cx,B0+.05,cz,W,D,0);fl.rotation.x=-Math.PI/2;fl.renderOrder=2;

  /* Wände: unten dunkler Prallschutz, darüber senkrechte Holzpaneele */
  const woodT=canvasTex(512,512,(g)=>{for(let x=0;x<512;x+=16){const v=Math.random()*18;g.fillStyle=`rgb(${150+v},${92+v*.7},${48+v*.4})`;g.fillRect(x,0,16,512);g.fillStyle="rgba(60,30,10,.55)";g.fillRect(x,0,1.5,512)}
    noise(g,512,512,9000,["rgba(90,45,15,.18)","rgba(255,220,170,.08)"],2);for(let i=0;i<60;i++){g.strokeStyle="rgba(100,50,20,.18)";g.lineWidth=1;g.beginPath();const x=Math.random()*512;g.moveTo(x,0);g.bezierCurveTo(x+6,170,x-6,340,x+3,512);g.stroke()}});
  const panelT=canvasTex(256,256,(g)=>{g.fillStyle="#4a3426";g.fillRect(0,0,256,256);noise(g,256,256,4000,["rgba(0,0,0,.12)","rgba(255,255,255,.04)"],2);for(let x=0;x<256;x+=64){g.fillStyle="rgba(0,0,0,.35)";g.fillRect(x,0,2,256)}});
  const lowH=2.3,walls=[[cx,z0,W,0],[cx,z1,W,Math.PI],[x0,cz,D,Math.PI/2],[x1,cz,D,-Math.PI/2]];
  for(const [px,pz,len,ry] of walls){
    const up=woodT.clone();up.needsUpdate=true;up.repeat.set(len/4,(h-lowH)/4);const lo=panelT.clone();lo.needsUpdate=true;lo.repeat.set(len/4,1);
    plane(lit(up,.5),px,B0+lowH+(h-lowH)/2,pz,len,h-lowH,ry);plane(lit(lo,.45),px,B0+lowH/2,pz,len,lowH,ry);
    const nx=Math.sin(ry),nz=Math.cos(ry);box(col("#3a2a1f",.3),px+nx*.02,B0+lowH,pz+nz*.02,ry%Math.PI?.05:len,.06,ry%Math.PI?len:.05)}
  // weiße Pfeiler zwischen den Paneelen (wie auf den Fotos)
  for(const x of [-284,-276])for(const [z,s] of [[z0,1],[z1,-1]])box(col("#e8e6df",.5),x,B0+lowH+(h-lowH)/2,z+s*.08,.7,h-lowH,.14);

  /* hohe Fenster (Tageslicht) */
  const glassM=new THREE.MeshBasicMaterial({color:0xe9f3ff});const frameM=col("#cfcfcf",.4);
  const win=(x,z,w,y0,y1,ry)=>{const p=plane(glassM,x,B0+(y0+y1)/2,z,w,y1-y0,ry);const nx=Math.sin(ry)*.03,nz=Math.cos(ry)*.03;p.position.x+=nx;p.position.z+=nz;
    const hor=Math.abs(Math.sin(ry))<.5;for(let k=1;k<4;k++){const t=-w/2+w*k/4;box(frameM,x+(hor?t:0)+nx,B0+(y0+y1)/2,z+(hor?0:t)+nz,hor?.05:.06,y1-y0,hor?.06:.05)}
    box(frameM,x+nx,B0+(y0+y1)/2,z+nz,hor?w:.06,.06,hor?.06:w)};
  for(const x of [-286,-282,-274])win(x,z1,1.6,4.6,6.2,Math.PI);for(const x of [-286,-280,-274])win(x,z0,1.6,4.6,6.2,0);
  for(const z of [-144,-136]){win(x0,z,1.3,4.2,5.8,Math.PI/2);win(x1,z,1.3,4.2,5.8,-Math.PI/2)}

  /* Decke: Rasterplatten, Leuchtbänder, Lüftungsgitter */
  const ceilT=canvasTex(256,256,(g)=>{g.fillStyle="#eeeeea";g.fillRect(0,0,256,256);noise(g,256,256,3000,["rgba(0,0,0,.05)","rgba(255,255,255,.2)"],1);g.fillStyle="rgba(120,120,115,.55)";for(let k=0;k<=256;k+=64){g.fillRect(k-1,0,2,256);g.fillRect(0,k-1,256,2)}});
  ceilT.repeat.set(W/2.4,D/2.4);const ce=plane(lit(ceilT,.55),cx,B0+h,cz,W,D,0);ce.rotation.x=Math.PI/2;
  const lamp=new THREE.MeshBasicMaterial({color:0xffffff}),vent=col("#2b2d30",.2);
  for(let x=x0+2.5;x<x1-1;x+=3.4)for(const z of [cz-4.5,cz,cz+4.5]){const m=box(lamp,x,B0+h-.04,z,.22,.06,2.4)}
  for(const [x,z] of [[cx-6,cz-2],[cx+3,cz+3],[cx-1,cz-5.5],[cx+7,cz-1]])box(vent,x,B0+h-.03,z,1.2,.05,.7);
  // Heizkörper über den Türen
  for(const x of [-287,-281])box(col("#e4e4e0",.45),x,B0+3.1,z1-.1,2.6,.55,.1);

  /* Stirnwände: Basketballkorb mit Brett, darunter aufgemaltes Tor */
  const white=col("#ffffff",.55),orange=col("#e2611b",.4);
  for(const [wx,s] of [[x0,1],[x1,-1]]){
    box(white,wx+s*.35,B0+3.55,cz,.05,1.05,1.8);box(col("#222",.2),wx+s*.38,B0+3.35,cz,.02,.45,.59);box(col("#999",.3),wx+s*.18,B0+3.55,cz,.36,.08,.08);
    const ring=add(new THREE.TorusGeometry(.23,.018,6,20),orange,wx+s*.66,B0+3.05,cz);ring.rotation.x=Math.PI/2;
    const net=add(new THREE.CylinderGeometry(.22,.14,.4,12,1,true),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.7}),wx+s*.66,B0+2.84,cz);
    // Tor (aufgemalt) 3 m × 2 m
    for(const [dz,y,sy,sz] of [[-1.5,1,2,.08],[1.5,1,2,.08],[0,2,.08,3.08]])box(white,wx+s*.015,B0+y,cz+dz,.02,sy,sz)}

  /* Sprossenwand mit lehnender Weichbodenmatte (für die Zusatzfrage) */
  const holz=col("#b9874f",.45),blue=col("#2563c9",.45),grey=col("#aeb2b8",.18);
  for(let k=0;k<3;k++){const sx=-271.8+k*.95;for(const dx of [-.42,.42])box(holz,sx+dx,B0+1.6,z0+.12,.08,3.2,.08);for(let y=.25;y<3.2;y+=.28)box(holz,sx,B0+y,z0+.12,.84,.04,.04)}
  {const L=2.5,off=.7,top=Math.sqrt(L*L-off*off),a=Math.asin(off/L),m=new THREE.Group();
    const b=new THREE.Mesh(new THREE.BoxGeometry(2.0,L,.3),blue);b.position.y=L/2;m.add(b);const f=new THREE.Mesh(new THREE.BoxGeometry(2.02,L,.02),grey);f.position.set(0,L/2,.16);m.add(f);
    m.rotation.x=-a;m.position.set(-270.85,B0,z0+.27+off);G.add(m);HALL.matTop=top}
  /* Turnringe an der Decke */
  for(const dx of [-.25,.25]){const x=cx-1.5+dx,z=cz-.5;box(col("#d8d1c4",.4),x,B0+(h+2.6)/2,z,.03,h-2.6,.03);const r=add(new THREE.TorusGeometry(.1,.018,6,16),col("#a07040",.4),x,B0+2.5,z);r.rotation.y=Math.PI/2}
  box(col("#8a8f96",.4),cx-1.5,B0+h-.05,cz-.5,1.4,.08,.08);
  /* Langbank */
  {const bx=-286,bz=z1-.7;box(holz,bx,B0+.33,bz,3.6,.05,.24);box(holz,bx,B0+.12,bz,3.5,.05,.08);for(const d of [-1.5,1.5])box(holz,bx+d,B0+.18,bz,.06,.32,.38)}
  /* Geräteraum (Öffnung in der Nordwand) mit Kasten und Bock */
  {const gx=-280,brickT=canvasTex(256,256,(g)=>{g.fillStyle="#5c4a40";g.fillRect(0,0,256,256);for(let r=0;r<16;r++)for(let k=-1;k<5;k++){const v=Math.random()*20;g.fillStyle=`rgb(${110+v},${52+v*.5},${42+v*.4})`;g.fillRect(k*64+(r%2)*32+2,r*16+2,60,12)}});
    brickT.repeat.set(1.4,1);plane(lit(brickT,.3),gx,B0+1.2,z0+.015,2.8,2.4,0);
    for(const d of [-1.45,1.45])box(col("#6b4a2e",.35),gx+d,B0+1.2,z0+.04,.1,2.4,.08);box(col("#6b4a2e",.35),gx,B0+2.43,z0+.04,3.0,.08,.08);
    for(let i=0;i<5;i++)box(col(i?"#b07f4a":"#e6dccb",.42),gx-.4,B0+.12+i*.22,z0+.55,1.2-(i?0:.04),.2,.5);
    const bock=col("#8a5a32",.4);box(bock,gx+.75,B0+.95,z0+.5,.9,.32,.35);for(const [dx,dz] of [[-.3,-.12],[.3,-.12],[-.3,.12],[.3,.12]])box(col("#6d4526",.4),gx+.75+dx,B0+.4,z0+.5+dz,.06,.8,.06)}
  /* Eingangstür (Doppeltür, geöffnet) in der Ostwand, nahe der Südostecke (Durchgang zur Hofmauer) */
  {const dz=HALL.doorIn[1];plane(col("#7a4a32",.25),x1-.01,B0+1.25,dz,2.0,2.5,-Math.PI/2);
    for(const s of [-1,1]){box(col("#c08a4e",.45),x1-.5,B0+1.25,dz+s*1.0,.95,2.5,.05)}box(col("#3a2a1f",.3),x1-.04,B0+2.55,dz,.08,.1,2.2);
    const exitT=canvasTex(128,48,(g)=>{g.fillStyle="#14a44d";g.fillRect(0,0,128,48);g.fillStyle="#fff";g.font="bold 26px sans-serif";g.fillText("🚶 →",30,34)});box(new THREE.MeshBasicMaterial({map:exitT}),x1-.06,B0+2.85,dz,.03,.22,.6)}
  /* Hütchen an den Ecken des grünen Spielfelds */
  {const F=HALL.field,cone=new THREE.ConeGeometry(.16,.4,12),cm=col("#ff7b00",.45);for(const [x,z] of [[F.x0,F.z1],[F.x1,F.z0],[F.x0,F.z0],[F.x1,F.z1]])add(cone,cm,x,B0+.2,z)}
  G.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});scene.add(G);HALL.group=G}

/* Kollisionsraster: Innenraum begehbar machen, Wände als Ring stehen lassen, Kamera-Höhenraster innen frei */
function hallGrid(){const pts=HALL.ex,c=[[pts[0],pts[2]],[pts[1],pts[2]],[pts[0],pts[3]],[pts[1],pts[3]]].map(p=>hallR(...p));
  const xs=c.map(p=>p[0]),ys=c.map(p=>p[1]),C=HALL.chimney;
  for(let x=Math.floor(Math.min(...xs))-2;x<=Math.max(...xs)+2;x++)for(let y=Math.floor(Math.min(...ys))-2;y<=Math.max(...ys)+2;y++){const i=gi(x+.5,y+.5);if(i<0)continue;
    const [lx,lz]=hallL(x+.5,y+.5),inner=lx>HALL.x0+.35&&lx<HALL.x1-.35&&lz>HALL.z0+.35&&lz<HALL.z1-.35,outer=lx>HALL.ex[0]-.6&&lx<HALL.ex[1]+.6&&lz>HALL.ex[2]-.6&&lz<HALL.ex[3]+.6;
    const chim=lx>C[0]-.4&&lx<C[1]+.4&&lz>C[2]-.4&&lz<C[3]+.4;
    if(inner&&!chim){solid[i]=0;hgt[i]=0}else if(outer&&!(lz>HALL.ex[3]+.1)){solid[i]=1;hgt[i]=Math.max(hgt[i],8)}}}
{const base=buildSchool;buildSchool=function(){base();buildHall();try{hallGrid()}catch(e){console.warn("Sporthalle Raster",e)}}}

/* ---------- Betreten und Verlassen ---------- */
function hallTeleport(inside){fade(()=>{const r=hallRot(),p=inside?hallR(HALL.doorIn[0]-1.2,HALL.doorIn[1]):hallR(...HALL.doorOut),a=inside?Math.PI+r:r;
  car.x=p[0];car.y=p[1];car.a=a;car.v=0;camYaw=a;camPos.set(car.x-Math.cos(a)*3.5,car.alt+2.4,car.y-Math.sin(a)*3.5);
  if(inside)toast("🏀 Sporthalle der GHS Dohr",QUESTS.find(q=>q.id==="sporthalle")&&!qs(QUESTS.find(q=>q.id==="sporthalle")).done?"Herr Maaß wartet am Spielfeld.":"Zum Verlassen zur Doppeltür gehen.","#e2611b")})}
{const base=interactables;interactables=function(VH){const L=base(VH);if(VH.id!=="walk")return L;
  const o=hallR(...HALL.doorOut),i=hallR(...HALL.doorIn);
  if(inHall(car.x,car.y))L.push({x:i[0],y:i[1],r:2.2,label:"🚪 Sporthalle verlassen",act:()=>hallTeleport(false)});
  else L.push({x:o[0],y:o[1],r:2.6,label:"🏀 Sporthalle betreten",act:()=>hallTeleport(true)});
  if(SPR.phase===1){const A=SPR.A;L.push({x:A[0],y:A[1],r:1.6,label:"🏁 Sprint starten",act:sprintGo})}
  return L}}
/* Navigation: Ziel in der Halle, Spieler draußen (oder umgekehrt) → zuerst zur Tür */
{const base=navTarget;navTarget=function(){const t=base();if(!t)return t;const ti=inHall(t.x,t.y),pi=inHall(car.x,car.y);
  if(ti&&!pi){const o=hallR(...HALL.doorOut);return {x:o[0],y:o[1]}}if(!ti&&pi){const i=hallR(...HALL.doorIn);return {x:i[0],y:i[1]}}return t}}
/* Kamera bleibt in der Halle */
{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(!inHall(car.x,car.y))return;
  const p=camera.position,[lx,lz]=hallL(p.x,p.z),cl=(v,a,b)=>Math.min(b,Math.max(a,v));
  const nx=cl(lx,HALL.x0+.3,HALL.x1-.3),nz=cl(lz,HALL.z0+.3,HALL.z1-.3),ny=Math.min(p.y,BASE_Y+HALL.h-.3);
  if(nx!==lx||nz!==lz||ny!==p.y){const r=hallR(nx,nz);p.set(r[0],ny,r[1]);camPos.copy(p);camera.lookAt(car.x,car.alt+1.3,car.y)}}}
/* Passanten laufen nicht durch die Halle (nur ausgeblendet, ihre Wege bleiben) */
{const base=updateCrowd;updateCrowd=function(dt,now){base(dt,now);const o=hallR(-279,-140);if(Math.hypot(car.x-o[0],car.y-o[1])>120)return;
  for(const p of peds){if(!p.det||p.x===undefined)continue;const hide=inHall(p.x,p.y,.6);if(p.glb)p.glb.obj.visible=!hide;if(hide&&p.mesh)p.mesh.visible=false;if(hide&&p.dogM)p.dogM.visible=false}}}
/* Sicherheitsnetz: drinnen nie durch die Wand */
{const base=update;update=function(dt){base(dt);if(V().id!=="walk")return;const [lx,lz]=hallL(car.x,car.y);
  if(lx>HALL.x0-.2&&lx<HALL.x1+.2&&lz>HALL.z0-.2&&lz<HALL.z1+.2){const cl=(v,a,b)=>Math.min(b,Math.max(a,v)),nx=cl(lx,HALL.x0+.4,HALL.x1-.4),nz=cl(lz,HALL.z0+.4,HALL.z1-.4);
    if(nx!==lx||nz!==lz){const r=hallR(nx,nz);car.x=r[0];car.y=r[1]}}
  sprintUpdate(dt)}}

/* ---------- Der Sprint ---------- */
const SPR={phase:0};
QUESTS.find(q=>q.id==="sporthalle").transport=true;
{const base=startTransport;startTransport=function(q,pick){if(q.id!=="sporthalle")return base(q,pick);
  const F=HALL.field;SPR.q=q;SPR.A=hallR(F.x0,F.z1);SPR.B=hallR(F.x1,F.z0);SPR.phase=1;if(!SPR.mark)SPR.mark=xMarker("#16a34a");SPR.mark.visible=true;
  toast("🏁 Diagonal-Sprint",`Stell dich ans Start-Hütchen (grüner Pfeil) und starte mit ${isTouch?"Tippen":"E"}.`,"#16a34a")}}
function sprintGo(){if(SPR.phase!==1)return;SPR.phase=2;SPR.t=3;car.v=0;beep(440,.15,"square",.06);toast("3","Gleich geht's los …","#16a34a")}
function sprintUpdate(dt){if(!SPR.phase)return;const m=SPR.mark,tgt=SPR.phase===3?SPR.B:SPR.A;
  if(m){m.position.set(tgt[0],BASE_Y+1.5+Math.sin(performance.now()/250)*.15,tgt[1]);m.rotation.y+=dt*2}
  if(SPR.phase===2){const o=Math.ceil(SPR.t);SPR.t-=dt;car.v=0;const n=Math.ceil(SPR.t);if(n!==o&&n>0){beep(440,.15,"square",.06);toast(String(n),"Gleich geht's los …","#16a34a")}
    if(SPR.t<=0){SPR.phase=3;SPR.run=0;beep(880,.3,"square",.07);toast("LOS!","Lauf diagonal zum Hütchen in der gegenüberliegenden Ecke!","#16a34a")}return}
  if(SPR.phase===3){SPR.run+=dt;if(!inHall(car.x,car.y)){SPR.phase=1;toast("Sprint abgebrochen","Zurück in die Halle und noch einmal starten.","#ff5d6c");return}
    if(Math.hypot(car.x-SPR.B[0],car.y-SPR.B[1])<1.3){const q=SPR.q,tm=SPR.run;SPR.phase=0;if(m)m.visible=false;jingle();
      const s=qs(q);s.sprint=+tm.toFixed(1);persist();finishQuest(q);
      toast("Auftrag erledigt!",`17 m in ${fmt(tm)} s – ${q.choice.fb(s.pick)}`.replace(" Jetzt lauf die erste Diagonale!",""),"#3ddc84")}}}
