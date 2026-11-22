/* ================= Läden: Fahrradladen, Autohaus, Sportflughafen =================
   - Fahrradladen „Radwerk Rheydt“ an der Hauptstraße: verschiedene E-Scooter und Fahrräder ausgestellt, kaufen.
   - Autohaus „An der Gracht“: verschiedene Autos (und Motorroller) ausgestellt, kaufen.
   - Sportflughafen (Felder im Südosten von Mülfort; der echte Flughafen Mönchengladbach liegt außerhalb des Kartenausschnitts):
     Hubschrauber und Flugzeuge mieten – pro Flug, Mietende beim Aussteigen nach der Landung.
   Die Läden sind begehbar (automatische Schiebetür, drinnen frei laufen). Gekaufte Fahrzeuge stehen danach vor dem Laden.
   Modelle sind Varianten der vorhandenen Fahrzeugtypen (eigene Farbe, Ausstattung, Fahrwerte und Preise).
   Grundstücke frei auf der echten Karte gesucht (keine Gebäude, Straßen, Wasser, Wald oder Parks). */

/* ---------- Modelle (Varianten) ---------- */
const VARS=[
  // Fahrradladen
  {id:"sc_city",base:"scoot",shop:"rad",name:"City-Roller",icon:"🛴",price:115,paint:"#1b1b1b",st:{max:7.0},def:true,desc:"Leicht und günstig für kurze Wege."},
  {id:"sc_komfort",base:"scoot",shop:"rad",name:"Komfort-Roller",icon:"🛴",price:135,paint:"#e9e9e9",st:{max:7.5,turn:2.9},x:["korb"],desc:"Breites Trittbrett und Korb für die Schultasche."},
  {id:"sc_sport",base:"scoot",shop:"rad",name:"Sport-Roller",icon:"🛴",price:160,paint:"#d81e2c",st:{max:7.5,acc:6.5,turn:3.2},x:["streifen"],desc:"Zieht am schnellsten an – aber auch er fährt nur so schnell, wie erlaubt."},
  {id:"bk_stadt",base:"bike",shop:"rad",name:"Stadtrad",icon:"🚲",price:190,paint:"#22a39a",st:{},x:["korb"],def:true,desc:"Mit Korb und bequemem Sattel für jeden Tag."},
  {id:"bk_mtb",base:"bike",shop:"rad",name:"Mountainbike",icon:"🚵",price:225,paint:"#e8742a",st:{max:9,grassF:.95},desc:"Kommt auch über Wiesen und Feldwege gut voran."},
  {id:"bk_renn",base:"bike",shop:"rad",name:"Rennrad",icon:"🚴",price:265,paint:"#f2f2f2",st:{max:11,grassF:.45,turn:2.7},x:["streifen"],desc:"Am schnellsten auf Asphalt, auf der Wiese eher nicht."},
  {id:"bk_ebike",base:"bike",shop:"rad",name:"E-Bike",icon:"🔋",price:340,paint:"#1b2f6b",st:{max:10.5,acc:7},x:["akku"],desc:"Der Motor hilft beim Anfahren. Ideal für weite Wege."},
  // Autohaus
  {id:"mo_roller",base:"moped",shop:"auto",name:"Roller Classic",icon:"🛵",price:440,paint:"#e2523a",st:{},def:true,desc:"Flott durch die Stadt, mit Licht für die Nacht."},
  {id:"mo_sport",base:"moped",shop:"auto",name:"Motorrad Sport",icon:"🏍️",price:520,paint:"#1b1b1b",st:{max:15,acc:7},x:["streifen"],desc:"Mehr Leistung für lange Strecken."},
  {id:"ca_smart",base:"smart",shop:"auto",name:"Smart",icon:"🚙",price:690,paint:"#9ccc2e",st:{},def:true,desc:"Winzig und wendig, passt in jede Lücke."},
  {id:"ca_kompakt",base:"auto",shop:"auto",name:"Kompaktwagen",icon:"🚘",price:890,paint:"#4a5d73",st:{},def:true,desc:"Der Alltagswagen: sparsam und zuverlässig."},
  {id:"ca_sport",base:"auto",shop:"auto",name:"Kompakt Sport",icon:"🚘",price:1050,paint:"#d81e2c",st:{max:23,acc:8.5},x:["streifen","spoiler"],desc:"Sportfahrwerk, Spoiler und Rennstreifen."},
  {id:"ca_elektro",base:"auto",shop:"auto",name:"Elektro-Kompakt",icon:"⚡",price:1180,paint:"#3fa7d6",st:{max:21,acc:9},desc:"Leise, elektrisch und spritzig beim Anfahren."},
  {id:"ca_suv",base:"suv",shop:"auto",name:"SUV Rheydt",icon:"🚙",price:1690,paint:"#2f4a3c",st:{},def:true,desc:"Großer SUV mit viel Platz und hoher Sitzposition – gebaut für Rheydt."},
  {id:"ca_van",base:"van",shop:"auto",name:"Transporter",icon:"🚐",price:1090,paint:"#f2f2f2",st:{},def:true,desc:"Viel Laderaum: jede Lieferung bringt 50 % mehr Geld."},
  {id:"ca_prius",base:"prius",shop:"auto",name:"Toyota Prius",icon:"🚗",price:1390,paint:"#a9bccd",st:{},def:true,desc:"Leiser Hybrid mit mehr Tempo für weite Lieferungen."},
  {id:"ca_aston",base:"aston",shop:"auto",name:"Aston Martin",icon:"🏎️",price:2590,paint:"#1f5c4a",st:{},def:true,desc:"Britischer Sportwagen mit langer Motorhaube."},
  {id:"ca_maser",base:"maser",shop:"auto",name:"Maserati",icon:"🏁",price:3990,paint:"#1b2f6b",st:{},def:true,desc:"Der schnellste Wagen der Stadt."},
  // Sportflughafen (Miete pro Flug)
  {id:"he_rund",base:"heli",shop:"flug",rent:true,name:"Rundflug-Hubschrauber",icon:"🚁",price:250,paint:"#d7262e",st:{},def:true,desc:"Für einen Rundflug über Rheydt und Mülfort."},
  {id:"he_xl",base:"heli",shop:"flug",rent:true,name:"Hubschrauber XL",icon:"🚁",price:400,paint:"#1b2f6b",st:{max:46,acc:10},x:["streifen"],desc:"Größer und schneller – für weite Luftlinien."},
  {id:"pl_ul",base:"plane",shop:"flug",rent:true,name:"Ultraleichtflieger",icon:"🛩️",price:180,paint:"#f2b81f",st:{max:50,acc:6},desc:"Leicht und gutmütig: ideal für den ersten Flug."},
  {id:"pl_sport",base:"plane",shop:"flug",rent:true,name:"Sportflugzeug",icon:"🛩️",price:320,paint:"#f2efe6",st:{},def:true,desc:"Der Klassiker vom Sportflughafen."},
  {id:"pl_reise",base:"plane",shop:"flug",rent:true,name:"Reiseflugzeug",icon:"✈️",price:560,paint:"#1b2f6b",st:{max:70,acc:7},x:["streifen"],desc:"Schnell und weit – für die ganz großen Strecken."}];
const VAR=Object.fromEntries(VARS.map(v=>[v.id,v]));
const VKEYS=["max","acc","turn","grassF"],VBASE0={};for(const v of VEHICLES)VBASE0[v.id]=Object.fromEntries(VKEYS.map(k=>[k,v[k]]).concat([["name",v.name],["icon",v.icon],["desc",v.desc]]));
const RENT_REQ=3;
save.vown=save.vown||[];save.vsel=save.vsel||{};
function varMigrate(){save.vown=save.vown||[];save.vsel=save.vsel||{};
  for(const b of save.owned){if(b==="walk"||(save.rent&&save.rent.base===b&&!save.rent.own))continue;if(!VARS.some(v=>v.base===b&&save.vown.includes(v.id))){const d=VARS.find(v=>v.base===b&&v.def);if(d)save.vown.push(d.id)}}
  for(const b in save.vsel)if(!VAR[save.vsel[b]])delete save.vsel[b]}
function applyVariant(vid,quiet){const v=VAR[vid];if(!v)return;const b=VEH[v.base];if(!b)return;
  Object.assign(b,VBASE0[v.base]);Object.assign(b,v.st||{});b.name=v.name;b.icon=v.icon;b.desc=v.desc;
  save.vsel[v.base]=vid;save.paint[v.base]=v.paint;if(typeof applyPaint==="function")try{applyPaint(v.base)}catch(e){}
  if(typeof vehMeshes!=="undefined"&&vehMeshes[v.base])setExtras(vehMeshes[v.base],v.x||[]);if(!quiet)persist()}
function applyAllVariants(){varMigrate();for(const b in save.vsel)applyVariant(save.vsel[b],true)}

/* Zubehör je Modell (Korb, Akku, Rennstreifen, Spoiler) – passend zur Größe des Fahrzeugs */
function localBox(m){const p=m.position.clone(),r=m.rotation.clone(),vis=m.visible,rd=m.userData.rider;m.position.set(0,0,0);m.rotation.set(0,0,0);
  const old=m.getObjectByName("vx");if(old)old.visible=false;if(rd)rd.visible=false;m.visible=true;m.updateMatrixWorld(true);
  const b=new THREE.Box3();m.traverse(o=>{if(o.isMesh&&o.visible&&o.name!=="vx"){o.geometry.computeBoundingBox&&!o.geometry.boundingBox&&o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);b.union(bb)}});
  m.position.copy(p);m.rotation.copy(r);m.visible=vis;if(old)old.visible=true;m.updateMatrixWorld(true);return b}
function setExtras(m,list){if(!m)return;const old=m.getObjectByName("vx");if(old)m.remove(old);if(!list||!list.length)return;
  const b=localBox(m);if(b.isEmpty())return;const g=new THREE.Group();g.name="vx";const L=b.max.x-b.min.x,Wd=b.max.z-b.min.z,Hh=b.max.y-b.min.y,s=1/(m.scale.x||1);
  const bx=(c,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(sx*s,sy*s,sz*s),new THREE.MeshLambertMaterial({color:c}));o.position.set(x*s,y*s,z*s);o.name="vx";g.add(o)};
  const small=L<2.6;if(!small)return;   /* Autos und Flugzeuge: nur Lackfarbe (Zubehör saß an manchen Modellen falsch) */
  for(const k of list){
    if(k==="korb"){bx("#2b2b2b",b.max.x-.1,b.min.y+Hh*.8,(b.min.z+b.max.z)/2,.26,.16,.3)}
    if(k==="akku"){bx("#222831",(b.min.x+b.max.x)/2-.05,b.min.y+Hh*.5,(b.min.z+b.max.z)/2,.38,.11,.11);bx("#3ddc84",(b.min.x+b.max.x)/2+.1,b.min.y+Hh*.5+.06,(b.min.z+b.max.z)/2,.05,.02,.04)}
    if(k==="streifen"&&!small){for(const dz of [-.18,.18])bx("#ffffff",(b.min.x+b.max.x)/2,b.max.y+.008,(b.min.z+b.max.z)/2+dz*Math.min(1,Wd/1.8),L*.92,.015,.13)}
    if(k==="spoiler"){const zc=(b.min.z+b.max.z)/2;bx("#111",b.min.x+.18,b.min.y+Hh*.86,zc,.22,.04,Wd*.9);for(const dz of [-.4,.4])bx("#111",b.min.x+.2,b.min.y+Hh*.8,zc+dz*Wd/2,.06,.12,.05)}}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});m.add(g)}

/* ---------- Gebäude (begehbar) ---------- */
const ROOMS=[];
function mkRoom(o){const R=Object.assign({door:3,H:4.5,glassSides:0},o);R.co=Math.cos(R.ang);R.si=Math.sin(R.ang);ROOMS.push(R);return R}
const rL=(R,x,y)=>{const dx=x-R.cx,dy=y-R.cy;return [dx*R.co+dy*R.si,-dx*R.si+dy*R.co]};
const rW=(R,X,Z)=>[R.cx+X*R.co-Z*R.si,R.cy+X*R.si+Z*R.co];
const inRoom=(x,y,m=-.2)=>ROOMS.find(R=>R.door&&!R.solid&&(()=>{const [X,Z]=rL(R,x,y);return Math.abs(X)<R.D/2+m&&Math.abs(Z)<R.W/2+m})());
const RAD=mkRoom({id:"rad",name:"Radwerk Rheydt",sub:"Fahrräder · E-Scooter",cx:-462.3,cy:-853.8,ang:-1.7788,W:16,D:12,H:4.6,col:"#2f9e5b",wall:"#efe9df",shop:"rad"});
const AUT=mkRoom({id:"auto",name:"Autohaus an der Gracht",sub:"Neuwagen · Motorroller",cx:-299.8,cy:-726.8,ang:1.6116,W:30,D:22,H:6.2,col:"#1f3b66",wall:"#3b4048",shop:"auto",glassSides:.55,door:4});
/* Sportflughafen: Bahn 300 m × 30 m, Vorfeld, Terminal (begehbar), Hangar, Tower, Hubschrauberlandeplatz */
/* Flughafen Mönchengladbach (echte Lage, Phase 4 „Nord und Ost“): Bahn 13/31, Vorfeld und Gebäude aus den OSM-Daten des Gebiets.
   Flugschule & Verleih westlich des Terminals am Rand des Vorfelds; Mietflugzeuge auf freien Stellplätzen des Vorfelds. */
const FLUG={a:40.6*Math.PI/180,room:[3614,-7434],spots:[[3630,-7458],[3654,-7470],[3600,-7464],[3636,-7494],[3678,-7458]],planeStart:[3390,-7971],heliStart:[3666,-7494],sock:null};
const TER=mkRoom({id:"flug",name:"Flugschule & Verleih",sub:"Flughafen Mönchengladbach · Rundflüge",cx:FLUG.room[0],cy:FLUG.room[1],ang:FLUG.a-Math.PI/2,W:18,D:12,H:4.4,col:"#1e6fd9",wall:"#f4f4f2",shop:"flug"});

/* Raster: Gebäude fest, Innenraum und Tür frei; Bäume nicht im Laden, nicht auf der Bahn */
function roomCells(R,fn){const ext=Math.hypot(R.W,R.D)/2+2;for(let x=Math.floor(R.cx-ext);x<=R.cx+ext;x++)for(let y=Math.floor(R.cy-ext);y<=R.cy+ext;y++){const i=gi(x+.5,y+.5);if(i<0)continue;const [X,Z]=rL(R,x+.5,y+.5);fn(i,X,Z)}}
function stripCells(cx,cy,ang,L,Bw,fn){const u=[Math.cos(ang),Math.sin(ang)],ext=Math.hypot(L,Bw)/2+2;for(let x=Math.floor(cx-ext);x<=cx+ext;x++)for(let y=Math.floor(cy-ext);y<=cy+ext;y++){const dx=x+.5-cx,dy=y+.5-cy,a=dx*u[0]+dy*u[1],b=-dx*u[1]+dy*u[0];if(Math.abs(a)<L/2&&Math.abs(b)<Bw/2){const i=gi(x+.5,y+.5);if(i>=0)fn(i)}}}
function roomGrid(){for(const R of ROOMS)roomCells(R,(i,X,Z)=>{if(Math.abs(X)>R.D/2+.35||Math.abs(Z)>R.W/2+.35)return;
  const inner=!R.solid&&Math.abs(X)<R.D/2-.5&&Math.abs(Z)<R.W/2-.5,door=R.door&&X>R.D/2-1.2&&Math.abs(Z)<R.door/2-.15;
  if(inner||door){solid[i]=0;hgt[i]=0;surf[i]&=~6}else{solid[i]=1;hgt[i]=Math.max(hgt[i],Math.min(250,Math.round(R.H)))}})}
{const base=rasterize;rasterize=function(){base();try{roomGrid()}catch(e){console.warn("Läden Raster",e)}}}
{const base=buildTrees;buildTrees=function(){const tmp=[];const mark=i=>{if(!hgt[i]){hgt[i]=1;tmp.push(i)}};
  for(const R of ROOMS)roomCells(R,(i,X,Z)=>{if(Math.abs(X)<R.D/2+3&&Math.abs(Z)<R.W/2+3)mark(i)});
  if(MG.aero){for(const r of MG.aero.runways.concat(MG.aero.taxi)){const p=r.p;for(let k=2;k<p.length;k+=2){const ax=p[k-2],ay=p[k-1],bx=p[k],by=p[k+1];stripCells((ax+bx)/2,(ay+by)/2,Math.atan2(by-ay,bx-ax),Math.hypot(bx-ax,by-ay)+8,r.w+16,mark)}}
    for(const q of MG.aero.aprons){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let k=0;k<q.length;k+=2){x0=Math.min(x0,q[k]);x1=Math.max(x1,q[k]);y0=Math.min(y0,q[k+1]);y1=Math.max(y1,q[k+1])}
      for(let x=Math.floor(x0);x<=x1;x+=1)for(let y=Math.floor(y0);y<=y1;y+=1)if(inPoly(x+.5,y+.5,q)){const i=gi(x+.5,y+.5);if(i>=0)mark(i)}}}
  base();for(const i of tmp)hgt[i]=0}}

/* ---------- Aussehen ---------- */
const lmat=(o)=>new THREE.MeshLambertMaterial(o);
const litM=(map,k=.5,o={})=>new THREE.MeshLambertMaterial(Object.assign({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:k},o));
const colM=(c,k=.45)=>new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:k});
function signTex(R){return canvasTex(1024,160,(g)=>{g.fillStyle=R.col;g.fillRect(0,0,1024,160);g.fillStyle="rgba(255,255,255,.12)";g.fillRect(0,0,1024,8);
  g.fillStyle="#fff";g.textBaseline="middle";const ic={rad:"🚲",auto:"🚘",flug:"🛩️"}[R.id]||"",tx=ic+"  "+R.name.toUpperCase();let fs=64;g.font=`bold ${fs}px sans-serif`;while(g.measureText(tx).width>950&&fs>30){fs-=2;g.font=`bold ${fs}px sans-serif`}g.fillText(tx,36,62);
  g.font="32px sans-serif";g.fillStyle="rgba(255,255,255,.85)";g.fillText(R.sub||"",40,124)})}
function buildRoom(R){const G=new THREE.Group(),B0=BASE_Y,{W,D,H}=R;G.position.set(R.cx,0,R.cy);G.rotation.y=-R.ang;
  const add=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);G.add(m);return m};
  const box=(mat,x,y,z,sx,sy,sz)=>add(new THREE.BoxGeometry(sx,sy,sz),mat,x,y,z);
  const plaster=canvasTex(256,256,(g)=>{g.fillStyle=R.wall;g.fillRect(0,0,256,256);noise(g,256,256,4000,["rgba(0,0,0,.05)","rgba(255,255,255,.08)"],2);if(R.hangar)for(let x=0;x<256;x+=16){g.fillStyle="rgba(0,0,0,.16)";g.fillRect(x,0,3,256)}});
  plaster.repeat.set(2,2);const wallM=lmat({map:plaster}),band=lmat({color:R.col}),dark=lmat({color:"#2b2f36"}),glass=new THREE.MeshLambertMaterial({color:0x9fc4dc,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide});
  const t=.3;
  if(R.tower){box(wallM,0,B0+H/2-1.5,0,3,H-3,3);box(dark,0,B0+H-1.5,0,5,.3,5);box(glass,0,B0+H-.3,0,4.6,2.1,4.6);box(band,0,B0+H+.8,0,5.2,.3,5.2);
    const m=add(new THREE.CylinderGeometry(.04,.04,3,6),dark,1.5,B0+H+2.3,1.5);scene.add(G);G.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});return G}
  // Außenwände
  box(wallM,-D/2,B0+H/2,0,t,H,W);
  const gs=R.glassSides?D*R.glassSides:0;
  for(const s of [-1,1]){if(gs){box(wallM,-D/2+(D-gs)/2,B0+H/2,s*W/2,D-gs,H,t);box(glass,D/2-gs/2,B0+H/2,s*W/2,gs,H-.3,.06);for(let x=D/2-gs;x<=D/2+.01;x+=gs/3)box(dark,x,B0+H/2,s*W/2,.12,H,.14)}else box(wallM,0,B0+H/2,s*W/2,D,H,t)}
  if(R.hangar){box(wallM,D/2,B0+H*.85,0,t,H*.3,W);const door=canvasTex(256,256,(g)=>{g.fillStyle="#6d7682";g.fillRect(0,0,256,256);for(let y=0;y<256;y+=12){g.fillStyle="rgba(0,0,0,.25)";g.fillRect(0,y,256,2)}});door.repeat.set(3,1);
    box(lmat({map:door}),D/2,B0+H*.35,0,.2,H*.7,W-1);box(band,D/2+.12,B0+H*.92,0,.05,.8,W*.5)}
  else{const dw=R.door;// Glasfront mit Schiebetür
    for(const s of [-1,1]){const zc=s*(dw/2+(W/2-dw/2)/2),w=W/2-dw/2;box(glass,D/2,B0+(H-.6)/2,zc,.06,H-.6,w);for(let z=dw/2;z<=W/2+.01;z+=w/3)box(dark,D/2,B0+(H-.6)/2,s*z,.14,H-.6,.12)}
    box(dark,D/2,B0+H-.3,0,.3,.6,W);box(glass,D/2-.15,B0+1.25,dw/2+.6,.04,2.5,1.2);box(glass,D/2-.15,B0+1.25,-dw/2-.6,.04,2.5,1.2);box(dark,D/2,B0+2.55,0,.2,.1,dw)}
  // Dach, Attika, Schild
  box(dark,0,B0+H+.15,0,D+.5,.3,W+.5);box(band,D/2+.26,B0+H+.15,0,.04,.32,W+.5);
  const sm=new THREE.MeshBasicMaterial({map:signTex(R)});const sg=new THREE.PlaneGeometry(Math.min(W*.8,13),Math.min(W*.8,13)*160/1024);sg.rotateY(Math.PI/2);
  const sign=add(sg,sm,D/2+.2,B0+H-(R.hangar?1.4:.95),0);if(R.hangar)sign.position.y=B0+H*.75;
  if(R.id==="auto")for(const z of [-W/2-3,-W/2-6,W/2+3])for(const fy of [0]){const p=add(new THREE.CylinderGeometry(.06,.06,8,6),lmat({color:"#c9ccd2"}),D/2+3,B0+4,z);const f=add(new THREE.PlaneGeometry(1.6,1),colM(z>0?"#d81e2c":"#1f3b66",.3),D/2+3,B0+7.2,z+.82);f.rotation.y=Math.PI/2;f.material.side=THREE.DoubleSide}
  G.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  if(R.solid){scene.add(G);R.group=G;return G}
  // Innenraum
  const I=new THREE.Group();G.add(I);const ia=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);I.add(m);return m};
  const tiles=canvasTex(512,512,(g)=>{const c=R.id==="auto"?["#d9dadc","#cfd0d3"]:R.id==="rad"?["#c9c3b6","#beb8ab"]:["#d6d8db","#cacdd1"];for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=c[(x+y)%2];g.fillRect(x*128,y*128,128,128);g.fillStyle="rgba(0,0,0,.18)";g.fillRect(x*128,y*128,128,2);g.fillRect(x*128,y*128,2,128)}noise(g,512,512,6000,["rgba(0,0,0,.04)","rgba(255,255,255,.08)"],2)});
  tiles.repeat.set(D/4,W/4);const fl=ia(new THREE.PlaneGeometry(D-.4,W-.4),litM(tiles,.2,{polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8}),0,B0+.05,0);fl.rotation.x=-Math.PI/2;fl.renderOrder=2;
  const inner=canvasTex(256,256,(g)=>{g.fillStyle=R.id==="auto"?"#e9ebee":"#f3efe7";g.fillRect(0,0,256,256);noise(g,256,256,2500,["rgba(0,0,0,.04)","rgba(255,255,255,.1)"],2)});
  const wl=(x,z,w,ry,gl)=>{const p=ia(new THREE.PlaneGeometry(w,H-.1),litM(inner,.45),x,B0+(H-.1)/2,z);p.rotation.y=ry;return p};
  wl(-D/2+.17,0,W-.4,Math.PI/2);for(const s of [-1,1]){const len=D-.4-gs;if(len>0){const p=wl(-D/2+.2+len/2,s*(W/2-.17),len,s>0?Math.PI:0)}}
  {const c=ia(new THREE.PlaneGeometry(D-.4,W-.4),litM(inner,.5),0,B0+H-.05,0);c.rotation.x=Math.PI/2}
  const lamp=new THREE.MeshBasicMaterial({color:0xffffff});for(let x=-D/2+2;x<D/2-1;x+=3)ia(new THREE.BoxGeometry(.25,.05,W*.7),lamp,x,B0+H-.09,0);
  // Wandbild: großes Logo an der Rückwand
  {const p=ia(new THREE.PlaneGeometry(Math.min(W*.6,10),Math.min(W*.6,10)*160/1024),new THREE.MeshBasicMaterial({map:signTex(R)}),-D/2+.2,B0+H*.68,0);p.rotation.y=Math.PI/2}
  // Tresen
  {const cx=-D/2+1.6;ia(new THREE.BoxGeometry(.8,1.05,3.2),colM(R.col,.35),cx,B0+.53,0);ia(new THREE.BoxGeometry(.95,.06,3.35),colM("#f5f5f5",.4),cx,B0+1.08,0);
    const sc=ia(new THREE.BoxGeometry(.05,.35,.55),colM("#1d2230",.3),cx-.1,B0+1.32,.6);R.counter=rW(R,cx+1.4,0)}
  // Podeste / Teppiche unter den Fahrzeugen
  R.inner=I;scene.add(G);R.group=G;R.displays=[];return G}

/* Flughafen: echte Bahn, Rollwege und Vorfelder aus den Kartendaten; Windsack am Verleih */
function buildAero(){const A=MG.aero;if(!A||!(A.runways.length+A.taxi.length+A.aprons.length))return;const B0=BASE_Y;
  const pm=(o)=>new THREE.MeshLambertMaterial(Object.assign({polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6},o));
  const rwT=canvasTex(256,64,(g)=>{g.fillStyle="#3a3d42";g.fillRect(0,0,256,64);noise(g,256,64,2500,["rgba(0,0,0,.12)","rgba(255,255,255,.05)"],2);g.fillStyle="#f2f2f2";g.fillRect(40,29,110,6);g.fillRect(0,2,256,2);g.fillRect(0,60,256,2)});
  const twT=canvasTex(128,32,(g)=>{g.fillStyle="#4d5157";g.fillRect(0,0,128,32);noise(g,128,32,600,["rgba(0,0,0,.1)","rgba(255,255,255,.05)"],2);g.fillStyle="#e8c32a";g.fillRect(0,14,128,4)});
  const strip=(p,w,tex,y,rep)=>{for(let k=2;k<p.length;k+=2){const ax=p[k-2],ay=p[k-1],bx=p[k],by=p[k+1],L=Math.hypot(bx-ax,by-ay);if(L<.5)continue;const t=tex.clone();t.needsUpdate=true;t.repeat.set(L/rep,1);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(L+w*.2,w),pm({map:t}));m.rotation.order="YXZ";m.rotation.set(-Math.PI/2,-Math.atan2(by-ay,bx-ax),0);m.position.set((ax+bx)/2,B0+y,(ay+by)/2);m.receiveShadow=true;scene.add(m)}};
  const apM=pm({color:0x5d6168});
  for(const q of A.aprons){const sh=new THREE.Shape();for(let k=0;k<q.length;k+=2)k?sh.lineTo(q[k],-q[k+1]):sh.moveTo(q[k],-q[k+1]);const g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,apM);m.position.y=B0+.03;m.receiveShadow=true;scene.add(m)}
  for(const r of A.taxi)strip(r.p,Math.max(8,r.w),twT,.035,16);for(const r of A.runways)strip(r.p,r.w,rwT,.045,60);
  const R=TER,p=rW(R,R.D/2+6,R.W/2+6);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,6,6),lmat({color:"#c9ccd2"}));pole.position.set(p[0],B0+3,p[1]);scene.add(pole);
  const sock=new THREE.Mesh(new THREE.CylinderGeometry(.35,.15,2,10,1,true),lmat({color:"#ff7b00",side:THREE.DoubleSide}));sock.rotation.z=Math.PI/2;const sg=new THREE.Group();sg.position.set(p[0],B0+5.8,p[1]);sock.position.x=1;sg.add(sock);scene.add(sg);FLUG.sock=sg}

/* ---------- Ausstellungsstücke ---------- */
const SHOWS={rad:[],auto:[],flug:[]};
{const R=RAD;const sc=VARS.filter(v=>v.base==="scoot"),bk=VARS.filter(v=>v.base==="bike");
  sc.forEach((v,i)=>SHOWS.rad.push({v,room:R,X:2.6-i*2.6,Z:-5.6,h:Math.PI/2}));bk.forEach((v,i)=>SHOWS.rad.push({v,room:R,X:3.2-i*2.2,Z:4.4,h:-Math.PI/2+.25}))}
{const R=AUT,cars=VARS.filter(v=>v.shop==="auto"&&!/moped/.test(v.base));const slots=[[5.2,-10.5],[5.2,-3.5],[5.2,3.5],[5.2,10.5],[-2.4,-10.5],[-2.4,-3.5],[-2.4,3.5],[-2.4,10.5],[1.4,0]];
  cars.forEach((v,i)=>{const s=slots[i];if(s)SHOWS.auto.push({v,room:R,X:s[0],Z:s[1],h:Math.PI/2+(i%2?.55:-.55)})});
  VARS.filter(v=>v.base==="moped").forEach((v,i)=>SHOWS.auto.push({v,room:R,X:-8,Z:(i?1:-1)*8,h:Math.PI/2}))}
{const air=VARS.filter(v=>v.base==="plane").concat(VARS.filter(v=>v.base==="heli"));air.forEach((v,i)=>{const p=FLUG.spots[i];if(p)SHOWS.flug.push({v,x:p[0],y:p[1],a:FLUG.a})})}
for(const k in SHOWS)for(const S of SHOWS[k])if(S.room){const p=rW(S.room,S.X,S.Z);S.x=p[0];S.y=p[1];S.a=S.room.ang+S.h}
function showClone(S){const src=vehMeshes[S.v.base];if(!src)return null;const ud=src.userData,rd=ud.rider,rp=rd&&rd.parent;if(rp)rp.remove(rd);const ox=src.getObjectByName("vx");if(ox)src.remove(ox);
  const bi=ud.body?src.children.indexOf(ud.body):-1;src.userData={};let c;try{c=src.clone(true)}finally{src.userData=ud;if(rp)rp.add(rd);if(ox)src.add(ox)}
  c.userData={body:bi>=0?c.children[bi]:null};const pm=ud.paint,nm=pm?pm.clone():null;if(nm){nm.color.set(S.v.paint);if(window.__lin)nm.color.convertSRGBToLinear()}
  const kill=[];c.traverse(o=>{if(o.isLight||o.isSkinnedMesh||(o.userData&&o.userData.isRider))kill.push(o);if(o.isMesh&&nm){if(o.material===pm)o.material=nm;else if(Array.isArray(o.material))o.material=o.material.map(m=>m===pm?nm:m)}});
  for(const o of kill)o.parent&&o.parent.remove(o);  c.visible=true;c.position.set(S.x,BASE_Y+(S.room?.05:0),S.y);c.rotation.set(0,-S.a,0);if(c.userData.body)c.userData.body.rotation.set(0,0,0);
  setExtras(c,S.v.x||[]);scene.add(c);return c}
function refreshShows(force){for(const k in SHOWS)for(const S of SHOWS[k]){const src=vehMeshes&&vehMeshes[S.v.base];if(!src)continue;
  if(!force&&S.src===src&&S.mesh)continue;if(Math.hypot(S.x-car.x,S.y-car.y)>220&&!force)continue;if(S.mesh)scene.remove(S.mesh);S.mesh=showClone(S);S.src=src}}

/* ---------- Kaufen, Nehmen, Mieten ---------- */
const owns=id=>save.vown.includes(id);
function parkOutside(R,base){const VH=VEH[base];for(const [X,Z] of [[R.D/2+3.2,R.W/2-2.5],[R.D/2+3.2,-R.W/2+2.5],[R.D/2+5,0],[R.D/2+6.5,R.W/2]]){const p=rW(R,X,Z);if(!blockedGround(p[0],p[1])){save.left={id:base,x:p[0],y:p[1],a:R.ang+Math.PI/2};return p}}
  const s=spotNear(...rW(R,R.D/2+4,0));save.left={id:base,x:s.x,y:s.y,a:R.ang+Math.PI/2};return [s.x,s.y]}
function buyVar(vid){const v=VAR[vid];if(!v||v.rent)return;if(owns(vid)){useVar(vid);return}
  const req=VEH[v.base].req||1;if(lvl()<req){toast("🔒 Noch gesperrt",`Ab Rang ${req}: ${RANKS[req-1][1]}`,"#ff5d6c");return}
  if(save.money<v.price){toast("Zu teuer",`Dir fehlen noch $${(v.price-save.money).toLocaleString("de-DE")}`,"#ff5d6c");return}
  save.money-=v.price;save.vown.push(vid);if(!save.owned.includes(v.base))save.owned.push(v.base);applyVariant(vid,true);
  const R=ROOMS.find(r=>r.shop===v.shop);parkOutside(R,v.base);persist();updateHud();jingle();
  toast(`${v.icon} ${v.name} gekauft!`,`Für $${v.price.toLocaleString("de-DE")}. Er steht vor dem Laden – geh hin und steig ein (${isTouch?"Tippen":"E"}).`,"#3ddc84");if(state.mode==="shop")renderShop()}
function useVar(vid){const v=VAR[vid];if(!owns(vid))return;if(inRoom(car.x,car.y)&&v.base!=="walk"){applyVariant(vid);const R=ROOMS.find(r=>r.shop===v.shop)||inRoom(car.x,car.y);parkOutside(inRoom(car.x,car.y)||R,v.base);persist();
    toast(`${v.icon} ${v.name}`,"Steht vor der Tür bereit.","#3ddc84");if(state.mode==="shop")renderShop();return}
  applyVariant(vid);setVehicle(v.base);if(state.mode==="shop")renderShop()}
function rentVar(vid){const v=VAR[vid];if(!v||!v.rent)return;
  if(lvl()<RENT_REQ){toast("🔒 Noch gesperrt",`Fliegen ab Rang ${RENT_REQ}: ${RANKS[RENT_REQ-1][1]}`,"#ff5d6c");return}
  if(save.rent){toast("Du hast schon gemietet","Erst landen und aussteigen, dann kannst du neu mieten.","#ffc933");return}
  if(save.money<v.price){toast("Zu teuer",`Ein Flug kostet $${v.price}. Dir fehlen noch $${(v.price-save.money).toLocaleString("de-DE")}`,"#ff5d6c");return}
  save.money-=v.price;const own=save.owned.includes(v.base);save.rent={base:v.base,v:vid,own,prev:save.vsel[v.base]||null};if(!own)save.owned.push(v.base);applyVariant(vid,true);
  if(state.mode==="shop")closeShop();
  fade(()=>{const p=v.base==="plane"?FLUG.planeStart:FLUG.heliStart;car.x=p[0];car.y=p[1];car.a=FLUG.a;car.v=0;car.alt=BASE_Y;if(save.left&&save.left.id===v.base)save.left=null;setVehicle(v.base);camYaw=car.a;
    camPos.set(car.x-Math.cos(car.a)*14,8,car.y-Math.sin(car.a)*14);persist();updateHud();
    toast(`${v.icon} ${v.name} gemietet`,v.base==="plane"?"Gas geben, ab 18 m/s mit R abheben. Zum Beenden landen und aussteigen.":"Mit R steigen, mit F sinken. Zum Beenden landen und aussteigen.","#7fd3ff")})}
function endRent(){const r=save.rent;if(!r)return;save.rent=null;if(save.left&&save.left.id===r.base)save.left=null;
  if(!r.own)save.owned=save.owned.filter(b=>b!==r.base);if(r.prev)applyVariant(r.prev,true);persist();toast("🛬 Mietflug beendet","Danke, dass du mit uns geflogen bist!","#7fd3ff")}
{const base=setVehicle;setVehicle=function(id){const r=save.rent;base(id);if(r&&id!==r.base)endRent()}}
{const base=applySave;applySave=function(d){const r=base(d);try{applyAllVariants()}catch(e){}return r}}

/* ---------- Ladenfenster (Dialog) ---------- */
const SHOP_T={rad:["Fahrradladen","Radwerk Rheydt"],auto:["Autohaus","Autohaus an der Gracht"],flug:["Sportflughafen","Flugzeug- und Hubschrauberverleih"]};
renderShop=function(){const cat=typeof shopAt==="string"?shopAt:shopAt?"auto":null;
  $("shopTag").textContent=cat?SHOP_T[cat][0]:"Garage";$("shopTitle").textContent=cat?SHOP_T[cat][1]:"Deine Garage";
  $("shopInfo").innerHTML=`Kontostand: <b>$${save.money.toLocaleString("de-DE")}</b> · Rang ${lvl()} (${RANKS[lvl()-1][1]}). `+(cat==="flug"?`Gemietet wird pro Flug. Zum Beenden landest du und steigst aus. Fliegen ab Rang ${RENT_REQ}.`:cat?"Gekaufte Fahrzeuge stehen danach vor dem Laden. Wechseln und umlackieren kannst du in der Garage (Taste G).":"Fahrräder und E-Scooter gibt es im Fahrradladen 🚲, Autos im Autohaus 🚘, Hubschrauber und Flugzeuge zum Mieten am Flughafen Mönchengladbach 🛩️ (ab Phase 4 „Nord und Ost“).");
  const list=cat?VARS.filter(v=>v.shop===cat):[{id:"walk",base:"walk",name:"Zu Fuß",icon:"🚶",desc:VEH.walk.desc,price:0}].concat(VARS.filter(v=>owns(v.id)&&!v.rent));
  const bar=(v,k,m)=>{const b=Object.assign({},VBASE0[v.base]||{},v.st||{});return `<div class="vstat">${k}<span class="vbar"><i style="width:${Math.min(100,(b[m]||0)/(m==="max"?72:3.4)*100)}%"></i></span></div>`};
  $("vgrid").innerHTML=list.map(v=>{const act=v.base==="walk"?save.veh==="walk":save.veh===v.base&&save.vsel[v.base]===v.id,own=v.base==="walk"||owns(v.id);let btn,why="",cls="";
    const req=v.rent?RENT_REQ:(VEH[v.base]&&VEH[v.base].req)||1;
    if(act){btn=`<button type="button" disabled>✓ Unterwegs damit</button>`;cls="active"}
    else if(v.rent){if(lvl()<req){btn=`<button type="button" disabled>🔒 Gesperrt</button>`;why=`Ab Rang ${req}: ${RANKS[req-1][1]}`;cls="locked"}
      else if(save.rent){btn=`<button type="button" disabled>Schon gemietet</button>`;why="Erst landen und aussteigen";cls="locked"}
      else if(save.money<v.price){btn=`<button type="button" disabled>Zu teuer</button>`;why=`Dir fehlen noch $${(v.price-save.money).toLocaleString("de-DE")}`;cls="locked"}
      else btn=`<button class="primary" type="button" data-vrent="${v.id}">Mieten</button>`}
    else if(own)btn=v.base==="walk"?`<button class="primary" type="button" data-vwalk="1">Nehmen</button>`:`<button class="primary" type="button" data-vuse="${v.id}">Nehmen</button>`;
    else{cls="locked";if(lvl()<req){btn=`<button type="button" disabled>🔒 Gesperrt</button>`;why=`Ab Rang ${req}: ${RANKS[req-1][1]}`}
      else if(save.money<v.price){btn=`<button type="button" disabled>Zu teuer</button>`;why=`Dir fehlen noch $${(v.price-save.money).toLocaleString("de-DE")}`}
      else{btn=`<button class="primary" type="button" data-vbuy="${v.id}">Kaufen</button>`;cls=""}}
    const sw=!cat&&own&&v.base!=="walk"&&save.vsel[v.base]===v.id?`<div class="swatches" aria-label="Farbe">${PAINTS.map(c=>`<button type="button" data-paint="${v.base}" data-col="${c}" style="background:${c}" aria-label="Farbe ${c}" aria-pressed="${(save.paint[v.base]||v.paint)===c}"></button>`).join("")}</div>`:"";
    const price=v.base==="walk"?"gratis":v.rent?`$${v.price} pro Flug`:own?"gehört dir":"$"+v.price.toLocaleString("de-DE");
    return `<div class="vcard ${cls}"><div class="vicon" style="background:${v.paint||"#2b2f3d"}">${v.icon}</div><div class="vname">${v.name}</div>
      ${v.base==="walk"?"":bar(v,"Tempo","max")+bar(v,"Wendig","turn")}<p>${v.desc}</p><div class="vprice">${price}</div>${sw}${btn}${why?`<small>${why}</small>`:""}</div>`}).join("")};
$("vgrid").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.vbuy){e.stopImmediatePropagation();buyVar(b.dataset.vbuy)}
  else if(b.dataset.vuse){e.stopImmediatePropagation();useVar(b.dataset.vuse);closeShop()}
  else if(b.dataset.vrent){e.stopImmediatePropagation();rentVar(b.dataset.vrent)}
  else if(b.dataset.vwalk){e.stopImmediatePropagation();if(save.veh!=="walk"&&!inRoom(car.x,car.y))exitVehicle();closeShop()}},true);
{const base=openShop;openShop=function(at){if(at===true)at="auto";return base(at)}}

/* ---------- Karte: Läden als Orte ---------- */
{const S=GIVERS.find(g=>g.id==="shop"),door=R=>rW(R,R.D/2+2.5,0);
  if(S){const d=door(AUT);S.x=d[0];S.y=d[1];S.poiName="Gracht";S.about="Autos und Motorroller kaufen";S.store=AUT}
  GIVERS.push({id:"rad",name:"Fahrradladen",icon:"🚲",col:"#3ddc84",about:"E-Scooter und Fahrräder kaufen",poiName:"Hauptstraße",x:door(RAD)[0],y:door(RAD)[1],store:RAD});
  GIVERS.push({id:"flug",name:"Sportflughafen",icon:"🛩️",col:"#7fd3ff",about:"Hubschrauber und Flugzeuge mieten",poiName:"Flughafen Mönchengladbach (ab Phase 4)",x:door(TER)[0],y:door(TER)[1],store:TER})}
{const base=openMission;openMission=function(g){if(g&&g.store){toast(`${g.icon} ${g.store.name}`,"Geh durch die Glastür hinein.","#3ddc84");return}return base(g)}}

/* ---------- Spielwelt: bauen, betreten, Kamera, Interaktion ---------- */
{const base=buildQuestWorld;buildQuestWorld=function(){base();try{for(const R of ROOMS)if(Math.abs(R.cx-RX)<HX+150&&Math.abs(R.cy-RY)<HY+150)buildRoom(R);buildAero()}catch(e){console.warn("Läden",e)}}}
{const base=carHits;carHits=function(x,y){if(base(x,y))return true;if(V().id==="walk")return false;
  for(const R of ROOMS){const [X,Z]=rL(R,x,y);if(Math.abs(X)<R.D/2+.8&&Math.abs(Z)<R.W/2+.8)return true}return false}}
{const base=interactables;interactables=function(VH){let L=base(VH);
  L=L.filter(it=>!GIVERS.some(g=>g.store&&Math.abs(it.x-g.x)<.01&&Math.abs(it.y-g.y)<.01));
  if(VH.id==="walk"){const R=inRoom(car.x,car.y);
    for(const k in SHOWS)for(const S of SHOWS[k]){if(Math.abs(S.x-car.x)>8||Math.abs(S.y-car.y)>8)continue;const v=S.v,r=v.base==="plane"?5:v.base==="heli"?4.5:/scoot|bike/.test(v.base)?1.6:/moped/.test(v.base)?1.9:2.8;
      const lab=v.rent?`${v.icon} ${v.name} mieten · $${v.price}`:owns(v.id)?`${v.icon} ${v.name} · gehört dir – nehmen`:`${v.icon} ${v.name} kaufen · $${v.price.toLocaleString("de-DE")}`;
      L.push({x:S.x,y:S.y,r,label:lab,act:()=>v.rent?rentVar(v.id):owns(v.id)?useVar(v.id):buyVar(v.id)})}
    for(const Rm of ROOMS)if(Rm.counter&&R===Rm)L.push({x:Rm.counter[0],y:Rm.counter[1],r:2.2,label:`🧾 Beratung am Tresen – alle Modelle`,act:()=>openShop(Rm.shop)})}
  return L}}
{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);const R=inRoom(car.x,car.y,-.3);if(!R)return;const p=camera.position,[X,Z]=rL(R,p.x,p.z),cl=(v,a,b)=>Math.min(b,Math.max(a,v));
  const nX=cl(X,-R.D/2+.35,R.D/2-.35),nZ=cl(Z,-R.W/2+.35,R.W/2-.35),ny=Math.min(p.y,BASE_Y+R.H-.3);if(nX!==X||nZ!==Z||ny!==p.y){const w=rW(R,nX,nZ);p.set(w[0],ny,w[1]);camPos.copy(p);camera.lookAt(car.x,car.alt+1.3,car.y)}}}
{const base=updateCrowd;updateCrowd=function(dt,now){base(dt,now);if(!ROOMS.some(R=>Math.hypot(R.cx-car.x,R.cy-car.y)<140))return;
  for(const p of peds){if(!p.det||p.x===undefined)continue;const hide=ROOMS.some(R=>{const [X,Z]=rL(R,p.x,p.y);return Math.abs(X)<R.D/2+.8&&Math.abs(Z)<R.W/2+.8});if(hide){if(p.glb)p.glb.obj.visible=false;if(p.mesh)p.mesh.visible=false;if(p.dogM)p.dogM.visible=false}}}}
{let t=0,shown=new Set();const base=update;update=function(dt){base(dt);t-=dt;if(t<=0){t=.5;refreshShows(false)}
  if(FLUG.sock)FLUG.sock.rotation.y=-FLUG.a+Math.sin(performance.now()/1400)*.25;
  const R=inRoom(car.x,car.y);if(R&&!shown.has(R.id)){shown.add(R.id);toast(`${{rad:"🚲",auto:"🚘",flug:"🛩️"}[R.id]} ${R.name}`,R.shop==="flug"?"Geh zu einem Flugzeug oder Hubschrauber draußen – oder an den Tresen.":"Geh zu einem Modell oder an den Tresen.","#3ddc84")}if(!R)shown.clear()}}
/* GLB-Fahrzeuge kommen später: Zubehör erneut anbringen, Ausstellung neu aufbauen */
{const base=vehSwap;vehSwap=function(id,g){base(id,g);const v=VAR[save.vsel[id]];if(v)setExtras(vehMeshes[id],v.x||[]);for(const k in SHOWS)for(const S of SHOWS[k])if(S.v.base===id)S.src=null}}
applyAllVariants();
