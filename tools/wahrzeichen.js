/* ================= Wahrzeichen nach Fotos (24.11.) =================
   Vorlagen: frei lizenzierte Fotos von Wikimedia Commons (CC BY-SA), nur als Vorlage für Form und Farben – keine Bilder im Spiel.
   Schloss Rheydt (Herrenhaus): ockerfarbener Putz, grau-grüne Fenstergewände mit Kreuzstock und Dreiecksgiebeln, runder Eckturm
     mit Schieferhaube, Arkade mit Rundbögen im Erdgeschoss, steile Schieferdächer mit Gauben, Dachreiter, Schornsteine.
   Hauptbahnhof: hoher heller Sandstein-Mittelbau mit großem Rundbogenfenster und Uhr, steiles dunkles Walmdach,
     niedrigere Seitenflügel, Glasvordach vor dem Eingang (ohne Firmenlogo).
   Stadion im Borussia-Park: rechteckige Schüssel mit runden Ecken, weißes Membrandach auf weißen Stahlfachwerk-Masten,
     graue Ränge, grünes Spielfeld (ohne Vereinslogos).
   Ersetzt das amtliche Ersatzmodell; Ausrichtung nach dem Grundriss (kleinstes umschließendes Rechteck), Front zur nächsten Straße.
   Mit Kollision (Gebäude nicht mehr durchlaufbar). */
const WZB={};
const wzL=c=>new THREE.Color(c).convertSRGBToLinear();
const wzMat=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:wzL(c)},o));
function wzTex(w,h,f,rep){const c=document.createElement("canvas");c.width=w;c.height=h;f(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(...rep);return t}
/* kleinstes umschließendes Rechteck der Hülle */
function wzOBB(h){const P=[];for(let i=0;i<h.length;i+=2)P.push([h[i],h[i+1]]);let best=null;
  for(let i=0;i<P.length;i++){const j=(i+1)%P.length,a=Math.atan2(P[j][1]-P[i][1],P[j][0]-P[i][0]),c=Math.cos(a),s=Math.sin(a);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    for(const [x,y] of P){const u=x*c+y*s,v=-x*s+y*c;x0=Math.min(x0,u);x1=Math.max(x1,u);y0=Math.min(y0,v);y1=Math.max(y1,v)}const A=(x1-x0)*(y1-y0);
    if(!best||A<best.A){const uc=(x0+x1)/2,vc=(y0+y1)/2;best={A,a,L:x1-x0,D:y1-y0,cx:uc*c-vc*s,cy:uc*s+vc*c}}}return best}
/* Gruppe so drehen, dass lokales +z zur nächsten Straße zeigt; lokales x entlang der längeren passenden Seite */
function wzPlace(W,G,o){const B=wzOBB(W.hull);let ax=B.a;const n=nearestRoad(B.cx,B.cy,250,e=>e.r&&e.r.c),fx=n?n.x-B.cx:0,fy=n?n.y-B.cy:1;
  const cands=[0,1,2,3].map(k=>ax+k*Math.PI/2);let bestK=0,bd=-2;for(let k=0;k<4;k++){const a=cands[k]+Math.PI/2,d=(Math.cos(a)*fx+Math.sin(a)*fy)/(Math.hypot(fx,fy)||1);if(d>bd){bd=d;bestK=k}}
  const a=cands[bestK],L=bestK%2?B.D:B.L,D=bestK%2?B.L:B.D;G.position.set(B.cx,BASE_Y,B.cy);G.rotation.y=-a;return {L,D,a,cx:B.cx,cy:B.cy}}
function wzSolid(W,shrink=0){const h=W.hull,x0=Math.min(...h.filter((v,i)=>i%2===0)),x1=Math.max(...h.filter((v,i)=>i%2===0)),y0=Math.min(...h.filter((v,i)=>i%2)),y1=Math.max(...h.filter((v,i)=>i%2));
  const poly=[];for(let i=0;i<h.length;i+=2)poly.push(h[i],h[i+1]);
  for(let x=Math.floor(x0);x<=x1;x++)for(let y=Math.floor(y0);y<=y1;y++){if(!inPoly(x+.5,y+.5,poly))continue;const i=gi(x+.5,y+.5);if(i>=0){solid[i]=1;hgt[i]=Math.max(hgt[i],W.h||10)}}}
/* Bausteine */
function wzBox(G,m,x,y,z,w,h,d){const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y+h/2,z);me.castShadow=me.receiveShadow=true;G.add(me);return me}
function wzHip(G,m,x,y,z,w,d,h,ridgeFrac=.4){/* Walmdach über w×d, First mittig in Längsrichtung */const g=new THREE.BufferGeometry(),r=w*ridgeFrac/2,v=[-w/2,0,-d/2, w/2,0,-d/2, w/2,0,d/2, -w/2,0,d/2, -r,h,0, r,h,0];
  const idx=[0,4,1, 1,4,5, 1,5,2, 2,5,3, 3,5,4, 3,4,0];g.setAttribute("position",new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const me=new THREE.Mesh(g,m);me.position.set(x,y,z);me.castShadow=true;G.add(me);return me}
function wzFacadeTex(base,frame,cols,rows,opt={}){return wzTex(512,512,(g,W,H)=>{g.fillStyle=base;g.fillRect(0,0,W,H);for(let i=0;i<2600;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.05})`;g.fillRect(Math.random()*W,Math.random()*H,2,2)}
  const cw=W/cols,rh=H/rows;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=c*cw+cw*.22,y=r*rh+rh*(opt.top||.22),w=cw*.56,h=rh*(opt.hh||.56);
    if(opt.arch&&r===rows-1){g.fillStyle=frame;g.beginPath();g.moveTo(x-6,y+h+6);g.lineTo(x-6,y+w/2);g.arc(x+w/2,y+w/2,w/2+6,Math.PI,0);g.lineTo(x+w+6,y+h+6);g.fill();g.fillStyle="#2b3238";g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+w/2);g.arc(x+w/2,y+w/2,w/2,Math.PI,0);g.lineTo(x+w,y+h);g.fill();continue}
    g.fillStyle=frame;g.fillRect(x-6,y-6,w+12,h+12);if(opt.pediment){g.beginPath();g.moveTo(x-10,y-8);g.lineTo(x+w/2,y-26);g.lineTo(x+w+10,y-8);g.fill()}
    g.fillStyle="#26303a";g.fillRect(x,y,w,h);g.fillStyle=frame;g.fillRect(x+w/2-2,y,4,h);g.fillRect(x,y+h*.38-2,w,4);g.fillStyle="rgba(170,200,230,.22)";g.fillRect(x+3,y+3,w/2-6,h*.38-6)}
  if(opt.bands)for(const b of opt.bands){g.fillStyle=frame;g.fillRect(0,H*b,W,5)}})}

/* ---------- Schloss Rheydt ---------- */
WZB.Schloss_Rheydt=W=>{const G=new THREE.Group(),P=wzPlace(W,G);const ock="#c98a52",fr="#8a9384",slate=wzMat("#626770"),stone=wzMat("#9aa391");
  const fT=(c,r)=>wzFacadeTex(ock,fr,c,r,{pediment:true,bands:[.5]}),M1=new THREE.MeshLambertMaterial({map:fT(4,2)});
  // Hauptflügel 36 × 13, zweigeschossig 10 m, und Seitenflügel 13 × 24 rechtwinklig, L-förmig um einen Hof (Hof zur Straße)
  const H=10;wzBox(G,M1,0,0,-6,36,H,13);M1.map.repeat.set(3,1);
  wzHip(G,slate,0,H,-6,37,14,9,.62);
  const M2=new THREE.MeshLambertMaterial({map:fT(4,2)});M2.map.repeat.set(2,1);wzBox(G,M2,13,0,7.5,12,H,15);wzHip(G,slate,13,H,7.5,13,16,8,.55).rotation.y=Math.PI/2;
  // Arkade im Erdgeschoss der Hofseite (Rundbögen auf Steinsäulen), vor dem Hauptflügel
  const arc=new THREE.MeshLambertMaterial({map:wzTex(512,256,(g,w,h)=>{g.fillStyle=ock;g.fillRect(0,0,w,h);for(let i=0;i<5;i++){const x=i*w/5+10,bw=w/5-20;g.fillStyle="#2a2522";g.beginPath();g.moveTo(x,h);g.lineTo(x,h*.45);g.arc(x+bw/2,h*.45,bw/2,Math.PI,0);g.lineTo(x+bw,h);g.fill();g.fillStyle=fr;g.fillRect(x-10,h*.3,10,h*.7)}g.fillStyle=fr;g.fillRect(0,h-8,w,8)})});
  const ar=new THREE.Mesh(new THREE.PlaneGeometry(22,5),arc);ar.position.set(-6,5/2,.52);G.add(ar);
  // runder Eckturm mit Kegelhaube
  const tw=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,H+3,20),new THREE.MeshLambertMaterial({map:fT(6,3)}));tw.position.set(-18,(H+3)/2,.4);tw.castShadow=true;G.add(tw);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(3.9,6,20),slate);cap.position.set(-18,H+3+3,.4);cap.castShadow=true;G.add(cap);
  // Dachreiter mit Laterne und Haube, Gauben, Schornsteine
  wzBox(G,wzMat(ock),2,H+5,-6,2.6,3,2.6);const hel=new THREE.Mesh(new THREE.ConeGeometry(2.2,3.6,8),slate);hel.position.set(2,H+9.8,-6);G.add(hel);
  for(const x of [-12,-6,6,12]){const d=wzBox(G,wzMat("#e4dccd"),x,H+1.2,.2,1.8,1.7,1.4);const dr=new THREE.Mesh(new THREE.ConeGeometry(1.4,1.2,4),slate);dr.rotation.y=Math.PI/4;dr.position.set(x,H+3.5,.2);G.add(dr)}
  for(const x of [-15,9])wzBox(G,wzMat("#7b4a35"),x,H+4,-9,1.2,4.5,1.2);
  // Sockel und Hof
  wzBox(G,stone,0,0,-6,36.4,.6,13.4);const yard=new THREE.Mesh(new THREE.PlaneGeometry(24,14),wzMat("#6e8f45"));yard.rotation.x=-Math.PI/2;yard.position.set(-6,.03,7.5);G.add(yard);
  return G};

/* ---------- Hauptbahnhof ---------- */
WZB.Moenchengladbach_Hauptbahnhof=W=>{const G=new THREE.Group(),P=wzPlace(W,G);const sand="#cdbf9f",fr="#b3a483",roof=wzMat("#4b4744"),gl=wzMat("#5d7182");
  const mid=new THREE.MeshLambertMaterial({map:wzTex(512,512,(g,w,h)=>{g.fillStyle=sand;g.fillRect(0,0,w,h);for(let y=0;y<h;y+=22){g.fillStyle="rgba(0,0,0,.06)";g.fillRect(0,y,w,2)}
    const x=w*.27,aw=w*.46,top=h*.18;g.fillStyle=fr;g.beginPath();g.moveTo(x-14,h*.9);g.lineTo(x-14,top+aw/2);g.arc(w/2,top+aw/2,aw/2+14,Math.PI,0);g.lineTo(x+aw+14,h*.9);g.fill();
    g.fillStyle="#2b3540";g.beginPath();g.moveTo(x,h*.78);g.lineTo(x,top+aw/2);g.arc(w/2,top+aw/2,aw/2,Math.PI,0);g.lineTo(x+aw,h*.78);g.fill();g.fillStyle=fr;for(const f of [.33,.66])g.fillRect(x+aw*f-3,top,6,h*.6);
    g.fillStyle="#f4f1e8";g.beginPath();g.arc(w/2,h*.62,26,0,7);g.fill();g.strokeStyle="#222";g.lineWidth=4;g.beginPath();g.moveTo(w/2,h*.62);g.lineTo(w/2,h*.62-18);g.moveTo(w/2,h*.62);g.lineTo(w/2+13,h*.62);g.stroke();
    g.fillStyle="#3b4a5c";g.fillRect(w*.3,h*.82,w*.4,h*.1);g.fillStyle="#fff";g.font="bold 22px Arial";g.textAlign="center";g.fillText("Hauptbahnhof",w/2,h*.885)})});
  const side=new THREE.MeshLambertMaterial({map:wzFacadeTex(sand,fr,6,3,{arch:true,hh:.5})});side.map.repeat.set(2,1);const plain=wzMat(sand);
  // Mittelbau 22 × 16, 17 m hoch, steiles Walmdach; Seitenflügel je 24 × 13, 11 m
  const m=wzBox(G,plain,0,0,0,22,17,16);m.material=[plain,plain,plain,plain,mid,plain];wzHip(G,roof,0,17,0,23,17,9,.3);
  for(const s of [-1,1]){const x=s*23;wzBox(G,side,x,0,1.2,24,11,13);wzHip(G,roof,x,11,1.2,25,14,5,.55)}
  // Gesims, Vordach aus Glas auf grünen Stahlstützen
  wzBox(G,wzMat(fr),0,16.6,0,22.6,.5,16.6);const can=wzBox(G,new THREE.MeshLambertMaterial({color:wzL("#9fb7c6"),transparent:true,opacity:.55}),0,4.2,11.5,26,.25,7);can.castShadow=false;
  for(const x of [-12,-4,4,12])wzBox(G,wzMat("#3e5a4a"),x,0,14.6,.25,4.2,.25);
  // Bahnsteighallen dahinter (Stahlbögen)
  const hm=wzMat("#6b5a4a",{side:THREE.DoubleSide});for(const z of [-17,-28,-39]){const b=new THREE.Mesh(new THREE.CylinderGeometry(5.5,5.5,62,14,1,true,0,Math.PI),hm);b.rotation.z=Math.PI/2;b.position.set(0,4.5,z);b.castShadow=true;G.add(b);for(const x of [-28,-14,0,14,28])for(const dz of [-5,5])wzBox(G,wzMat("#5a4a3c"),x,0,z+dz,.3,4.5,.3)}
  return G};

/* ---------- Stadion im Borussia-Park ---------- */
WZB.Borussia_Park=W=>{const G=new THREE.Group(),P=wzPlace(W,G);const L=Math.min(200,P.L*.9),D=Math.min(165,P.D*.78),R=26,H=26;
  const shape=(l,d,r)=>{const s=new THREE.Shape(),x=l/2,y=d/2;s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);s.lineTo(-x+r,y);s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);return s};
  // Außenhülle (grau, Stahl-Glas), Ränge als Ring nach innen geneigt, Spielfeld
  const outer=shape(L,D,R),ring=shape(L,D,R);ring.holes.push(shape(L-8,D-8,R-3));
  const fasT=wzTex(256,256,(g,w,h)=>{g.fillStyle="#5d6469";g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64){g.fillStyle="#8d969c";g.fillRect(0,y,w,6);g.fillStyle="rgba(150,180,200,.35)";g.fillRect(0,y+12,w,40)}for(let x=0;x<w;x+=32){g.fillStyle="#9aa2a8";g.fillRect(x,0,3,h)}});fasT.repeat.set(.04,.04);
  const wall=new THREE.Mesh(new THREE.ExtrudeGeometry(ring,{depth:H*.42,bevelEnabled:false,curveSegments:8}),[wzMat("#6f767b"),new THREE.MeshLambertMaterial({map:fasT})]);wall.rotation.x=-Math.PI/2;wall.castShadow=true;G.add(wall);
  const bowlG=new THREE.BufferGeometry(),pts=outer.getSpacedPoints(80),inner=shape(L-56,D-56,10).getSpacedPoints(80),v=[],id=[];
  for(let i=0;i<=80;i++){const a=pts[i%80],b=inner[i%80];v.push(a.x*.97,H*.72,-a.y*.97, b.x,1.2,-b.y)}for(let i=0;i<80;i++){const k=2*i;id.push(k,k+1,k+2, k+1,k+3,k+2)}
  bowlG.setAttribute("position",new THREE.Float32BufferAttribute(v,3));bowlG.setIndex(id);bowlG.computeVertexNormals();
  const seats=new THREE.Mesh(bowlG,new THREE.MeshLambertMaterial({map:wzTex(64,512,(g,w,h)=>{for(let y=0;y<h;y+=8){g.fillStyle=y%16?"#3f4448":"#2f3438";g.fillRect(0,y,w,8)}}),side:THREE.DoubleSide}));seats.material.map.repeat.set(40,1);G.add(seats);
  const pitch=new THREE.Mesh(new THREE.PlaneGeometry(L-60,D-60),new THREE.MeshLambertMaterial({map:wzTex(512,320,(g,w,h)=>{for(let i=0;i<12;i++){g.fillStyle=i%2?"#3f8a3a":"#468f40";g.fillRect(i*w/12,0,w/12,h)}g.strokeStyle="#f4f4f4";g.lineWidth=4;g.strokeRect(30,20,w-60,h-40);g.beginPath();g.moveTo(w/2,20);g.lineTo(w/2,h-20);g.stroke();g.beginPath();g.arc(w/2,h/2,36,0,7);g.stroke();g.strokeRect(30,h/2-70,60,140);g.strokeRect(w-90,h/2-70,60,140)})}));
  pitch.rotation.x=-Math.PI/2;pitch.position.y=1.25;G.add(pitch);
  // weißes Membrandach als Ring über den Rängen (leicht nach innen geneigt)
  const roofRing=shape(L+6,D+6,R+3);roofRing.holes.push(shape(L-58,D-58,12));const rf=new THREE.Mesh(new THREE.ShapeGeometry(roofRing,10),wzMat("#eef0f1",{side:THREE.DoubleSide}));rf.rotation.x=-Math.PI/2;rf.position.y=H+.5;rf.castShadow=true;G.add(rf);
  // weiße Fachwerk-Masten außen rundum (instanziert): Mast schräg nach außen + Zugstab zum Dachrand
  const mast=new THREE.CylinderGeometry(.35,.5,1,6);mast.translate(0,.5,0);const N=Math.round((2*(L+D))/14),im=new THREE.InstancedMesh(mast,wzMat("#f4f5f6"),N*2),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),T=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  const per=outer.getSpacedPoints(N);let k=0;for(let i=0;i<N;i++){const p=per[i],q=per[(i+1)%N],nx=(q.y-p.y),ny=-(q.x-p.x),nl=Math.hypot(nx,ny)||1,ox=p.x+nx/nl*4,oy=-(p.y)+(-ny/nl)*4;
    const a=new THREE.Vector3(ox*1.02,0,oy*1.02),b=new THREE.Vector3(p.x*1.0,H+7,-p.y*1.0);for(const [s,e] of [[a,b],[b,new THREE.Vector3(p.x*.86,H+1,-p.y*.86)]]){const d=e.clone().sub(s);Q.setFromUnitVectors(up,d.clone().normalize());S.set(1,d.length(),1);M.compose(s,Q,S);im.setMatrixAt(k++,M)}}
  im.count=k;im.castShadow=true;G.add(im);return G};

/* Ins Laden der Wahrzeichen einhängen: eigene Modelle statt amtlicher Ersatzform, mit Kollision */
{const base=wzInit;wzInit=async function(){await base.apply(this,arguments);if(!STADT.wz)return;
  for(const w of STADT.wz.slice()){const f=WZB[w.W.id];if(!f)continue;try{const G=f(w.W);G.name="wz_"+w.W.id;scene.add(G);scene.remove(w.o);w.o=G;w.eigen=true;wzSolid(w.W)}catch(e){console.warn("Wahrzeichen",w.W.id,e)}}
  /* Hauptkirche und Haupthaus (amtliche Form) bekommen ebenfalls Kollision */
  for(const w of STADT.wz)if(!w.eigen)try{wzSolid(w.W)}catch(e){}}}
