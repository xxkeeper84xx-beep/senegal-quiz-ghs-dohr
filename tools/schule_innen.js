/* ================= Schule innen (Fotos vom 24.11.) =================
   Weg: Eingangstür auf der Hofseite (Erweiterungsbau, Laubengang) → Windfang → 5 Stufen hoch → Flur geradeaus →
   Glastür → im Treppenhaus rechts um die Ecke → Klassenraum.
   Windfang: dunkle Holzdecke, Glaswand mit grauen Rahmen, roter Klinkerboden, Fußmatte, Backsteinpfeiler, Glas-Doppeltür mit Notausgangsschild.
   Flur: gelbliche Wände, Terrazzoboden, Rasterdecke mit Leuchten, blaue Türzargen, Pinnwand, Heizkörper, blaues Geländer, Nischen links,
     am Ende Glastür mit dunkelblauem Rahmen. Treppenhaus: Treppe mit rotem Handlauf und schwarzem Schmiedegeländer, blaue Türen,
     Hakenleiste, schwarze Sockelleiste, Fenster. Klassenraum: vorläufig (Foto folgt) – Tafel, Tische, Fenster; an der Tafel gibt es Aufgaben.
   Maße in Schulkoordinaten (x Osten, z Süden). Betreten/Verlassen wie bei der Sporthalle (E / Tippen an der Tür).
   Böden ab dem Flur 0,8 m höher (car.alt), die Stufen dazwischen steigen gleichmäßig an. */
const SI={door:[-270.8,-106.6],inV:[-270.8,-104.6],up:.8,
  rooms:[{id:"wind",x0:-274,x1:-268,z0:-106,z1:-100,h:3.0},{id:"flur",x0:-273,x1:-268,z0:-100,z1:-90,h:3.4},{id:"treppe",x0:-279,x1:-268,z0:-90,z1:-80,h:3.8},{id:"klasse",x0:-293,x1:-279,z0:-90,z1:-78,h:3.4}],
  gaps:[{x0:-272.2,x1:-269.6,z0:-90.6,z1:-89.4},{x0:-279.6,x1:-278.4,z0:-85.6,z1:-83.4}],steps:{z0:-101.6,z1:-100,n:5}};
const siL=(x,y)=>typeof hallL==="function"?hallL(x,y):[x,y],siR=(x,z)=>typeof hallR==="function"?hallR(x,z):[x,z];
function siRoomAt(x,y,m=0){const [lx,lz]=siL(x,y);return SI.rooms.find(r=>lx>r.x0-m&&lx<r.x1+m&&lz>r.z0-m&&lz<r.z1+m)}
function siFloor(x,y){const [lx,lz]=siL(x,y),S=SI.steps;if(!siRoomAt(x,y))return 0;if(lz<S.z0)return 0;if(lz<S.z1)return SI.up*Math.ceil((lz-S.z0)/(S.z1-S.z0)*S.n)/S.n;return SI.up}
function siBuild(){if(SI.G||typeof hallR!=="function"||!MG.FX)return;const G=new THREE.Group();G.name="schule_innen";G.visible=false;
  const o=siR(-270,-95),e1=siR(-269,-95),A=Math.atan2(e1[1]-o[1],e1[0]-o[0]);
  const T=(w,h,f,rep)=>{const c=document.createElement("canvas");c.width=w;c.height=h;f(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(rep)t.repeat.set(...rep);return t};
  const lit=(o)=>{const m=new THREE.MeshLambertMaterial(o);if(o.map){m.emissive=new THREE.Color(1,1,1);m.emissiveMap=o.map;m.emissiveIntensity=.45}else{m.emissive=new THREE.Color(o.color||0xffffff);m.emissiveIntensity=.45}return m};
  const C=c=>new THREE.Color(c).convertSRGBToLinear();
  const tex={
    klinker:T(256,256,(g,w,h)=>{g.fillStyle="#6b3a30";g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-64;x<w;x+=64){const o=(y/32)%2*32;g.fillStyle=`hsl(8,${38+((x+y)%9)}%,${33+((x*3+y)%7)}%)`;g.fillRect(x+o+2,y+2,60,28)}},[3,3]),
    terrazzo:T(256,256,(g,w,h)=>{g.fillStyle="#cfccc3";g.fillRect(0,0,w,h);for(let i=0;i<2400;i++){g.fillStyle=["#9d9a92","#e8e5de","#7f7c75","#b9b39f"][i%4];g.fillRect(Math.random()*w,Math.random()*h,2,2)}g.strokeStyle="rgba(0,0,0,.12)";for(let x=0;x<w;x+=128){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.moveTo(0,x);g.lineTo(w,x);g.stroke()}},[2,2]),
    holz:T(256,256,(g,w,h)=>{for(let x=0;x<w;x+=16){g.fillStyle=`hsl(18,40%,${16+((x/16)%3)*3}%)`;g.fillRect(x,0,16,h);g.fillStyle="rgba(0,0,0,.35)";g.fillRect(x,0,1,h)}},[3,1]),
    wand:T(128,128,(g,w,h)=>{g.fillStyle="#f1e7bf";g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle="rgba(120,100,60,.05)";g.fillRect(Math.random()*w,Math.random()*h,2,2)}},[4,2]),
    decke:T(256,256,(g,w,h)=>{g.fillStyle="#ecebe5";g.fillRect(0,0,w,h);g.strokeStyle="#c9c8c0";g.lineWidth=2;for(let x=0;x<=w;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<=h;y+=128){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}},[3,3]),
    draussen:T(256,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#bcd6ec");gr.addColorStop(.6,"#e6eef2");gr.addColorStop(.61,"#cfcac0");gr.addColorStop(1,"#8f8b83");g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle="#7f8d5f";for(let i=0;i<8;i++){g.beginPath();g.arc(i*36+10,h*.55,18,0,7);g.fill()}}),
    stufe:T(64,64,(g,w,h)=>{g.fillStyle="#3c3e42";g.fillRect(0,0,w,h);for(let i=0;i<120;i++){g.fillStyle="rgba(255,255,255,.06)";g.fillRect(Math.random()*w,Math.random()*h,1,1)}})};
  const M={kl:lit({map:tex.klinker}),tz:lit({map:tex.terrazzo}),holz:(()=>{const m=lit({map:tex.holz});m.side=THREE.DoubleSide;return m})(),wand:lit({map:tex.wand}),decke:lit({map:tex.decke}),out:new THREE.MeshBasicMaterial({map:tex.draussen}),
    grau:lit({color:C(0xa8adb0)}),dgrau:lit({color:C(0x3c3e42)}),blau:lit({color:C(0x1f3f9a)}),dblau:lit({color:C(0x1b2a44)}),rot:lit({color:C(0xc8231d)}),schw:lit({color:C(0x1b1b1d)}),
    ziegel:lit({color:C(0x8a3e2e)}),matte:lit({color:C(0x4a4b4e)}),weiss:lit({color:C(0xf3f3ef)}),glas:new THREE.MeshLambertMaterial({color:C(0xcfe3ee),transparent:true,opacity:.25,depthWrite:false}),
    leuchte:new THREE.MeshBasicMaterial({color:0xfffbe8}),gruen:lit({color:C(0x0f8a3c)}),tafel:lit({color:C(0x24403a)}),tisch:lit({color:C(0xc9a36b)}),stuhl:lit({color:C(0x2f5f9a)}),kork:lit({color:C(0x24356b)})};
  const B0=BASE_Y;
  const put=(geo,m,x,y,z,ry=0)=>{const me=new THREE.Mesh(geo,m),p=siR(x,z);me.position.set(p[0],B0+y,p[1]);me.rotation.y=-A+ry;G.add(me);return me};
  const box=(m,x0,x1,y0,y1,z0,z1)=>{const g=new THREE.BoxGeometry(Math.max(.01,x1-x0),Math.max(.01,y1-y0),Math.max(.01,z1-z0));if(m.map){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(x1-x0,z1-z0)/2,uv.getY(i)*(y1-y0)/2)}return put(g,m,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2)};
  const floor=(m,x0,x1,z0,z1,y)=>{const g=new THREE.PlaneGeometry(x1-x0,z1-z0);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(x1-x0)/3,uv.getY(i)*(z1-z0)/3);return put(g,m,(x0+x1)/2,y,(z0+z1)/2)};
  const ceil=(m,x0,x1,z0,z1,y)=>{const g=new THREE.PlaneGeometry(x1-x0,z1-z0);g.rotateX(Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(x1-x0)/3,uv.getY(i)*(z1-z0)/3);return put(g,m,(x0+x1)/2,y,(z0+z1)/2)};
  const t=.12;// Wandstärke
  /* Wand mit Öffnungen: entlang x (bei z) oder entlang z (bei x); holes=[[a,b,yTop]] */
  const wallX=(m,x0,x1,z,y0,y1,holes=[])=>{let a=x0;for(const [h0,h1,ht] of holes.sort((p,q)=>p[0]-q[0])){if(h0>a)box(m,a,h0,y0,y1,z-t/2,z+t/2);box(m,h0,h1,y0+ht,y1,z-t/2,z+t/2);a=h1}if(a<x1)box(m,a,x1,y0,y1,z-t/2,z+t/2)};
  const wallZ=(m,z0,z1,x,y0,y1,holes=[])=>{let a=z0;for(const [h0,h1,ht] of holes.sort((p,q)=>p[0]-q[0])){if(h0>a)box(m,x-t/2,x+t/2,y0,y1,a,h0);box(m,x-t/2,x+t/2,y0+ht,y1,h0,h1);a=h1}if(a<z1)box(m,x-t/2,x+t/2,y0,y1,a,z1)};
  const up=SI.up;
  /* ---- Windfang ---- */
  {const R=SI.rooms[0];floor(M.kl,R.x0,R.x1,-106,SI.steps.z0,0.035);box(M.matte,-272.6,-269.6,0,.02,-105.4,-103.2);
    const g=new THREE.BufferGeometry(),v=[R.x0,3.1,-106, R.x1,3.1,-106, R.x1,2.6,-100, R.x0,2.6,-100];// schräge Holzdecke
    const P=v.map((q,i)=>q);const ps=[];for(const [x,y,z] of [[R.x0,3.1,-106],[R.x1,3.1,-106],[R.x1,2.6,-100],[R.x0,2.6,-100]]){const w=siR(x,z);ps.push(w[0],B0+y,w[1])}
    g.setAttribute("position",new THREE.Float32BufferAttribute([...ps.slice(0,3),...ps.slice(6,9),...ps.slice(3,6),...ps.slice(0,3),...ps.slice(9,12),...ps.slice(6,9)],3));g.setAttribute("uv",new THREE.Float32BufferAttribute([0,0,1,1,1,0,0,0,0,1,1,1],2));g.computeVertexNormals();const dk=new THREE.Mesh(g,M.holz);G.add(dk);
    box(M.leuchte,-271.6,-270,2.9,2.95,-103.6,-103.2);
    // Westwand: Glas mit grauen Rahmen und Blick nach draußen
    box(M.out,R.x0-.3,R.x0-.25,0,3.1,-106,-101);for(let z=-106;z<=-101;z+=1.25)box(M.grau,R.x0-.06,R.x0+.06,0,3.1,z-.05,z+.05);for(const y of [.05,1.1,2.1,3.05])box(M.grau,R.x0-.06,R.x0+.06,y-.05,y+.05,-106,-101);box(M.glas,R.x0-.01,R.x0+.01,0,3.1,-106,-101);
    box(M.grau,R.x0+.08,R.x0+.12,.9,.95,-106,-101);
    // Nordwand: Glas-Doppeltür (ein Flügel offen) mit Notausgangsschild
    wallX(M.grau,R.x0,R.x1,-106,0,3.1,[[-272.3,-269.4,2.4]]);box(M.out,-272.3,-269.4,0,2.4,-106.4,-106.35);
    box(M.grau,-272.3,-270.85,0,2.4,-106.06,-105.98);box(M.glas,-272.15,-271,0.35,2.25,-106.05,-105.99);
    const fl=box(M.grau,-270.8,-269.5,0,2.4,-106,-105.95);fl.rotation.y-=1.1;
    box(M.gruen,-271.3,-270.4,2.5,2.75,-105.98,-105.94);
    // Ostseite: Backsteinpfeiler, gelbe Wand
    wallZ(M.wand,-106,SI.steps.z0,R.x1,0,3.1);box(M.ziegel,R.x1-.35,R.x1-.05,0,3.0,-102.4,-101.8);
    // Absperrung links vor den Stufen
    wallZ(M.wand,SI.steps.z0,-100,R.x0,0,3.1)}
  /* ---- Stufen ---- */
  {const S=SI.steps,n=S.n,d=(S.z1-S.z0)/n;for(let i=0;i<n;i++){const z=S.z0+i*d;box(M.dgrau,-274,-268,0,up*(i+1)/n,z,z+d);box(M.weiss,-268.4,-268.3,up*(i+1)/n,up*(i+1)/n+.01,z,z+.05)}
    for(let i=0;i<=3;i++)box(M.blau,-268.5,-268.42,up+.1,up+1.0,-101+i*.33,-100.95+i*.33);box(M.blau,-268.55,-268.37,up+.95,up+1.02,-101.6,-99.9)}
  /* ---- Flur ---- */
  {const R=SI.rooms[1];floor(M.tz,R.x0,R.x1,R.z0,R.z1,up+.005);ceil(M.decke,R.x0-1,R.x1,R.z0-1.6,R.z1,up+R.h);for(const z of [-97,-93])box(M.leuchte,-271,-270.4,up+R.h-.06,up+R.h-.02,z-.7,z+.7);
    // Westwand mit Nischen (Wandvorlagen)
    wallZ(M.wand,-101.6,R.z1,R.x0,0,up+R.h);for(const z of [-98,-94.5])box(M.wand,R.x0,R.x0+.45,up,up+R.h,z,z+.6);for(const z of [-98,-94.5])box(M.dgrau,R.x0+.06,R.x0+.5,up,up+.12,z-.02,z+.62);
    // Ostwand: blaue Türzargen, Pinnwand, Heizkörper
    wallZ(M.wand,-100,R.z1,R.x1,0,up+R.h);for(const z of [-95.5,-92.5]){box(M.blau,R.x1-.08,R.x1-.02,up,up+2.2,z-.5,z+.5);box(M.blau,R.x1-.12,R.x1-.08,up,up+2.25,z-.55,z-.45);box(M.blau,R.x1-.12,R.x1-.08,up,up+2.25,z+.45,z+.55)}
    box(M.weiss,R.x1-.06,R.x1-.02,up+1.6,up+2.9,-99.7,-98.1);box(M.kork,R.x1-.08,R.x1-.06,up+1.68,up+2.82,-99.6,-98.2);box(M.weiss,R.x1-.18,R.x1-.04,up+.2,up+1.1,-99.5,-98.3);
    box(M.dgrau,R.x0,R.x1,up,up+.1,R.z0-.02,R.z0+.02);
    // Querband an der Decke (Unterzug) und Endwand mit Glastür
    box(M.wand,R.x0,R.x1,up+R.h-.5,up+R.h,-100.1,-99.8);wallX(M.wand,R.x0,R.x1,R.z1,0,up+R.h,[[-272.2,-269.6,up+2.3]]);
    for(const x of [-272.2,-271.0,-269.7])box(M.dblau,x-.05,x+.05,up,up+2.3,R.z1-.06,R.z1+.06);box(M.dblau,-272.2,-269.6,up+2.25,up+2.35,R.z1-.06,R.z1+.06);box(M.dblau,-272.2,-269.6,up+1.0,up+1.06,R.z1-.06,R.z1+.06)}
  /* ---- Treppenhaus ---- */
  {const R=SI.rooms[2];floor(M.tz,R.x0,R.x1,R.z0,R.z1,up+.005);ceil(M.decke,R.x0,R.x1,R.z0,R.z1,up+R.h);box(M.leuchte,-274.5,-272.5,up+R.h-.06,up+R.h-.02,-85.4,-85);
    wallX(M.wand,R.x0,-272.2,R.z0,0,up+R.h);wallX(M.wand,-269.6,R.x1,R.z0,0,up+R.h);wallZ(M.wand,R.z0,R.z1,R.x1,0,up+R.h);wallX(M.wand,R.x0,R.x1,R.z1,0,up+R.h);
    wallZ(M.wand,R.z0,R.z1,R.x0,0,up+R.h,[[-85.6,-83.4,up+2.2]]);
    for(const [a,b,x,z] of [[R.x0,R.x1,null,R.z1],[R.x0,R.x1,null,R.z0]])box(M.schw,a,b,up,up+.1,z-.02,z+.02);box(M.schw,R.x1-.02,R.x1+.02,up,up+.1,R.z0,R.z1);
    // Treppe an der Nordwand, steigt nach Westen; Stufen dunkelbraun mit rot-weißen Markierungen
    const n=14,x0=-272.5,x1=-278.6,w=2.4,rise=2.6/n;for(let i=0;i<n;i++){const xa=x0+(x1-x0)*i/n,xb=x0+(x1-x0)*(i+1)/n;box(lit({color:C(0x4a3a30)}),Math.min(xa,xb),Math.max(xa,xb),up,up+rise*(i+1),R.z0+.05,R.z0+w);box(M.rot,(xa+xb)/2-.08,(xa+xb)/2+.08,up+rise*(i+1),up+rise*(i+1)+.005,R.z0+1.1,R.z0+1.3)}
    // Geländer: schwarze Stäbe, roter Handlauf, Wandhandlauf
    for(let i=0;i<=n;i+=1){const x=x0+(x1-x0)*i/n;box(M.schw,x-.02,x+.02,up+rise*i,up+rise*i+.95,R.z0+w-.04,R.z0+w)}
    {const s=siR(x0,R.z0+w),e=siR(x1,R.z0+w),L=Math.hypot(e[0]-s[0],e[1]-s[1]),hr=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(L,2.6),.07,.07),M.rot);hr.position.set((s[0]+e[0])/2,B0+up+1.3+1.0,(s[1]+e[1])/2);hr.rotation.order="YXZ";hr.rotation.y=-A+Math.PI;hr.rotation.z=-Math.atan2(2.6,L);G.add(hr)}
    box(M.rot,x1,x0,up+1.1,up+1.15,R.z0+.06,R.z0+.1);
    // Fenster oben am Treppenabsatz (Westwand), blaue Türen (Südwand), Hakenleiste
    box(M.out,R.x0+.04,R.x0+.06,up+2.4,up+3.5,-89.4,-88.2);box(lit({color:C(0x9a6a3a)}),R.x0+.06,R.x0+.12,up+2.35,up+3.55,-89.45,-88.15);
    box(M.blau,-276.5,-275.5,up,up+2.1,R.z1-.07,R.z1-.03);box(M.blau,-270.6,-269.6,up,up+2.1,R.z1-.07,R.z1-.03);box(lit({color:C(0xd8c39a)}),-275,-271,up+1.6,up+1.66,R.z1-.08,R.z1-.04);
    // Klassenraumtür in der Westwand (blau, offen)
    const dr=box(M.blau,R.x0-.05,R.x0+.03,up,up+2.15,-85.5,-84.5);dr.rotation.y+=0;box(M.weiss,R.x0+.05,R.x0+.08,up+1.5,up+1.8,-86.2,-85.8)}
  /* ---- Klassenraum (vorläufig) ---- */
  {const R=SI.rooms[3];floor(lit({color:C(0xb9a98c)}),R.x0,R.x1,R.z0,R.z1,up+.005);ceil(M.decke,R.x0,R.x1,R.z0,R.z1,up+R.h);
    wallX(M.wand,R.x0,R.x1,R.z0,0,up+R.h);wallZ(M.wand,R.z0,R.z1,R.x0,0,up+R.h);wallX(M.wand,R.x0,R.x1,R.z1,0,up+R.h,[[-291,-288.6,up+.9],[-287.6,-285.2,up+.9],[-284.2,-281.8,up+.9]]);
    for(const [a,b] of [[-291,-288.6],[-287.6,-285.2],[-284.2,-281.8]]){box(M.out,a,b,up+.9,up+3.0,R.z1+.25,R.z1+.3);box(lit({color:C(0x9a6a3a)}),a,b,up+.85,up+.95,R.z1-.1,R.z1+.06)}
    box(M.tafel,R.x0+.05,R.x0+.12,up+.95,up+2.25,-87.5,-81.5);box(lit({color:C(0x8a8f94)}),R.x0+.05,R.x0+.2,up+.85,up+.95,-87.5,-81.5);
    box(lit({color:C(0x9a6a3a)}),-290.8,-289.2,up,up+.75,-86.5,-85.3);
    for(let r=0;r<4;r++)for(let c=0;c<3;c++){const x=-287+r*1.9,z=-88.2+c*3.3;box(M.tisch,x,x+.6,up+.7,up+.74,z,z+1.3);for(const dz of [.15,1.05])box(M.stuhl,x+.7,x+1.05,up,up+.45,z+dz,z+dz+.2)}
    for(const z of [-87,-83])box(M.leuchte,-286,-284,up+R.h-.06,up+R.h-.02,z-.2,z+.2)}
  G.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;m.frustumCulled=true}});scene.add(G);SI.G=G;siGrid()}
/* Kollision im Inneren: Räume frei, Wände fest, Durchgänge offen */
function siGrid(){const rs=SI.rooms,X0=Math.min(...rs.map(r=>r.x0))-1,X1=Math.max(...rs.map(r=>r.x1))+1,Z0=Math.min(...rs.map(r=>r.z0))-1,Z1=Math.max(...rs.map(r=>r.z1))+1;
  const cells=new Set();for(let x=X0;x<=X1;x+=.25)for(let z=Z0;z<=Z1;z+=.25){const p=siR(x,z),i=gi(p[0],p[1]);if(i<0||cells.has(i))continue;cells.add(i);
    const [cx,cz]=siL(Math.floor(p[0])+.5,Math.floor(p[1])+.5);const inR=rs.some(r=>cx>r.x0+.3&&cx<r.x1-.3&&cz>r.z0+.3&&cz<r.z1-.3)||SI.gaps.some(g=>cx>g.x0&&cx<g.x1&&cz>g.z0&&cz<g.z1)||(cx>-274+.3&&cx<-268-.3&&cz>-101.8&&cz<-99.8);
    const stair=cx>-278.8&&cx<-272.3&&cz>-90&&cz<-87.3;SI.free=SI.free||new Set();if(inR&&!stair){SI.free.add(i)}}
  SI.cells=[...SI.free].map(i=>[i,solid[i],hgt[i]])}
function siSetInside(on){if(!SI.G)return;SI.G.visible=on;for(const m of SI.ext||[])m.visible=!on;for(const [i,s,h] of SI.cells||[]){solid[i]=on?0:s;hgt[i]=on?0:h}}
const siInside=()=>!!(SI.G&&SI.G.visible);
function siTeleport(inside){fade(()=>{siSetInside(inside);const o=siR(-270,-95),e1=siR(-270,-96),aN=Math.atan2(e1[1]-o[1],e1[0]-o[0]);
  const p=inside?siR(...SI.inV):siR(...SI.door);car.x=p[0];car.y=p[1];car.a=inside?aN+Math.PI:aN;car.v=0;car.alt=inside?siFloor(car.x,car.y):0;camYaw=car.a;camPos.set(car.x-Math.cos(car.a)*2.5,car.alt+2,car.y-Math.sin(car.a)*2.5);
  if(inside)toast("🏫 GHS Dohr","Die Stufen hoch, den Flur geradeaus, durch die Glastür und rechts um die Ecke in den Klassenraum.","#ffc933")})}
{const base=interactables;interactables=function(VH){const L=base(VH);if(VH.id!=="walk"||!SI.G)return L;
  if(siInside()){const d=siR(-270.8,-105.4);L.push({x:d[0],y:d[1],r:1.6,label:"🚪 Schule verlassen",act:()=>siTeleport(false)});
    const t=siR(-292.4,-84.5);L.push({x:t[0],y:t[1],r:2.2,label:"📐 Aufgabe an der Tafel",act:siTafel})}
  else{const d=siR(...SI.door);L.push({x:d[0],y:d[1],r:2.4,label:"🏫 Schule betreten",act:()=>siTeleport(true)})}return L}}
function siTafel(){const ids=["f_len","f_foot","b_rope","e_tv","p_kite","r_check","k_raum","k_kiste"].filter(id=>AUFG.some(a=>a.id===id));if(typeof lnMkTask!=="function")return;
  const t=lnMkTask(pick(ids),AU.diff(),{tag:"🏫 Klassenraum · Tafelaufgabe",deliver:"Weiter",ch:true});if(t)showTask(t)}
/* Höhe (Stufen, Flurebene), Kamera im Raum halten */
{const base=update;update=function(dt){base(dt);if(!siInside())return;const VH=V();if(VH.id!=="walk"){siTeleport(false);return}
  if(!siRoomAt(car.x,car.y,.6)){siTeleport(false);return}car.alt=siFloor(car.x,car.y)}}
{const base=render3D;render3D=function(dt,now){if(siInside()&&V().id==="walk")car.alt=siFloor(car.x,car.y);return base(dt,now)}}
{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);if(!siInside())return;const R=siRoomAt(car.x,car.y,.3);if(!R)return;
  const p=camera.position,[lx,lz]=siL(p.x,p.z),cl=(v,a,b)=>Math.min(b,Math.max(a,v));const nx=cl(lx,R.x0+.25,R.x1-.25),nz=cl(lz,R.z0+.25,R.z1-.25),top=BASE_Y+(R.id==="wind"?2.5:SI.up+R.h-.25),ny=Math.min(p.y,top);
  if(nx!==lx||nz!==lz||ny!==p.y){const r=siR(nx,nz);p.set(r[0],ny,r[1]);camera.lookAt(car.x,car.alt+1.3,car.y)}}}
{const base=kitInit;kitInit=async function(){await base.apply(this,arguments);try{siBuild()}catch(e){console.warn("Schule innen",e)}}}

/* Außenhülle der Schule merken (wird drinnen ausgeblendet, sonst stehen ihre Wände im Raum) */
{const base=buildSchool;buildSchool=function(){const before=new Set(scene.children);const r=base.apply(this,arguments);SI.ext=scene.children.filter(o=>!before.has(o)&&o.name!=="sporthalle"&&o.name!=="schule_innen");return r}}
