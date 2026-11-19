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
  const paverTex=()=>canvasTex(512,512,(g)=>{g.fillStyle="#4c4b48";g.fillRect(0,0,512,512);const w=51.2,h=25.6;
    for(let r=0;r<20;r++)for(let k=-1;k<11;k++){const x=k*w+(r%2)*w/2,y=r*h;const v=104+Math.floor(Math.random()*30);g.fillStyle=`rgb(${v},${v-1},${v-5})`;g.fillRect(x+1.5,y+1.5,w-3,h-3)}
    noise(g,512,512,8000,["rgba(0,0,0,.08)","rgba(255,255,255,.05)"],2);
    for(let i=0;i<40;i++){g.save();g.translate(Math.random()*512,Math.random()*512);g.rotate(Math.random()*6.3);g.fillStyle=pick(["#d9a53a","#c9772c","#e2c25a"]);g.beginPath();g.ellipse(0,0,4,2.5,0,0,7);g.fill();g.restore()}});
  const cobbleTex=()=>canvasTex(256,256,(g)=>{g.fillStyle="#4a4a48";g.fillRect(0,0,256,256);for(let y=0;y<256;y+=26)for(let x=0;x<256;x+=26){const v=110+Math.floor(Math.random()*35);g.fillStyle=`rgb(${v},${v},${v-4})`;g.fillRect(x+2,y+2,22,22)}});
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
  function windows(F,list,st={}){for(const o of list){const rz=F.d-(st.recess??.18);
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
    for(let x=-345;x<=-198;x+=.5)for(let z=-63.4;z<=-56;z+=.5){const i=gi(x,z);if(i>=0&&!(surf[i]&4))surf[i]|=8}
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
