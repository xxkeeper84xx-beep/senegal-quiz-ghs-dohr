/* ---- Spiegelungen: kleine Umgebungskarte aus Himmel, Boden und Häuserkanten ---- */
let ENV=null;
function buildEnv(){
  try{
    const es=new THREE.Scene(),geo=new THREE.SphereGeometry(50,32,16),p=geo.attributes.position,cols=[],c=new THREE.Color();
    const top=new THREE.Color("#3f7cc4"),hor=new THREE.Color("#dfe9f2"),gnd=new THREE.Color("#5b5a56");
    for(let i=0;i<p.count;i++){const y=p.getY(i)/50;if(y>=0)c.copy(hor).lerp(top,Math.pow(y,.6));else c.copy(hor).lerp(gnd,Math.min(1,-y*6));cols.push(c.r,c.g,c.b)}
    geo.setAttribute("color",new THREE.Float32BufferAttribute(cols,3));
    es.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,h=4+h01(i*5)*9,w=6+h01(i*3)*8,m=new THREE.Mesh(new THREE.BoxGeometry(w,h,2),new THREE.MeshBasicMaterial({color:i%3?0x6b3d30:0xb9ae98}));m.position.set(Math.cos(a)*30,h/2-1,Math.sin(a)*30);m.lookAt(0,h/2-1,0);es.add(m)}
    const sunM=new THREE.Mesh(new THREE.SphereGeometry(2.5,12,8),new THREE.MeshBasicMaterial({color:0xfff6dd}));sunM.position.set(25,32,28);es.add(sunM);
    const pm=new THREE.PMREMGenerator(renderer);ENV=pm.fromScene(es,.02).texture;pm.dispose();
  }catch(e){ENV=null}
}
const _cp={};
const carPaint=(c,own)=>own?new THREE.MeshStandardMaterial({color:c,metalness:.45,roughness:.28,envMap:ENV,envMapIntensity:1.1}):(_cp[c]||(_cp[c]=new THREE.MeshStandardMaterial({color:c,metalness:.45,roughness:.3,envMap:ENV,envMapIntensity:1.1})));
let _cm=null;
function carMats(){if(_cm)return _cm;
  const plate=canvasTex(256,64,c=>{c.fillStyle="#f4f4ef";c.fillRect(0,0,256,64);c.fillStyle="#1d4fa8";c.fillRect(0,0,28,64);c.fillStyle="#f2c230";c.beginPath();c.arc(14,22,7,0,7);c.fill();c.fillStyle="#111";c.font="bold 40px Arial";c.textAlign="center";c.textBaseline="middle";c.fillText("MG PY 314",142,34,214);c.strokeStyle="#111";c.lineWidth=3;c.strokeRect(1.5,1.5,253,61)});
  return _cm={glass:new THREE.MeshStandardMaterial({color:0x1a242c,metalness:.2,roughness:.06,envMap:ENV,envMapIntensity:1.4}),
    trim:new THREE.MeshStandardMaterial({color:0x17191c,metalness:.1,roughness:.6}),
    plastic:new THREE.MeshStandardMaterial({color:0x26282b,metalness:0,roughness:.75}),
    chrome:new THREE.MeshStandardMaterial({color:0xd8dde2,metalness:1,roughness:.18,envMap:ENV}),
    rim:new THREE.MeshStandardMaterial({color:0xbfc5cb,metalness:.85,roughness:.28,envMap:ENV}),
    tire:new THREE.MeshStandardMaterial({color:0x1b1b1c,metalness:0,roughness:.92}),
    lens:new THREE.MeshStandardMaterial({color:0xeef2f5,metalness:.1,roughness:.05,envMap:ENV,emissive:0x8a8a80,emissiveIntensity:.25}),
    tail:new THREE.MeshStandardMaterial({color:0xa3121b,metalness:.1,roughness:.2,envMap:ENV,emissive:0x5a0408,emissiveIntensity:.6}),
    amber:new THREE.MeshStandardMaterial({color:0xe08a1c,metalness:.1,roughness:.25,emissive:0x3a1a00}),
    plate:new THREE.MeshStandardMaterial({map:plate,roughness:.5}),
    liner:new THREE.MeshLambertMaterial({color:0x0e0f10,side:THREE.DoubleSide})}}
/* Glatte Normalen nur über flache Winkel mitteln: runde Flächen wirken weich, Kanten bleiben scharf */
function crease(g,ang=.75){g=g.index?g.toNonIndexed():g;const p=g.attributes.position,n=p.count,fn=new Float32Array(n*3),A=new THREE.Vector3(),B=new THREE.Vector3(),Cc=new THREE.Vector3();
  for(let i=0;i<n;i+=3){A.fromBufferAttribute(p,i);B.fromBufferAttribute(p,i+1);Cc.fromBufferAttribute(p,i+2);B.sub(A);Cc.sub(A);B.cross(Cc).normalize();for(let k=0;k<3;k++){fn[(i+k)*3]=B.x;fn[(i+k)*3+1]=B.y;fn[(i+k)*3+2]=B.z}}
  const key=i=>Math.round(p.getX(i)*1e3)+","+Math.round(p.getY(i)*1e3)+","+Math.round(p.getZ(i)*1e3),map=new Map();
  for(let i=0;i<n;i++){const k=key(i);let l=map.get(k);if(!l)map.set(k,l=[]);l.push(i)}
  const out=new Float32Array(n*3),ct=Math.cos(ang);
  for(const l of map.values())for(const i of l){let x=0,y=0,z=0;for(const j of l){const d=fn[i*3]*fn[j*3]+fn[i*3+1]*fn[j*3+1]+fn[i*3+2]*fn[j*3+2];if(d>=ct){x+=fn[j*3];y+=fn[j*3+1];z+=fn[j*3+2]}}const L=Math.hypot(x,y,z)||1;out[i*3]=x/L;out[i*3+1]=y/L;out[i*3+2]=z/L}
  g.setAttribute("normal",new THREE.BufferAttribute(out,3));return g}

/* ---- Autos: Karosserie aus geglätteten Profilen, eingezogene Kabine, Radhäuser, Lack mit Spiegelung ---- */
const CAR_T={
  sedan:{L:4.5,W:1.8,r:.33,ar:[1.4,-1.32],belt:.98,
    body:[[-2.25,.34],[-2.3,.52],[-2.27,.78],[-2.16,.95],[-1.9,1.0],[-1.35,1.0],[.95,1.0],[1.55,.93],[2.05,.84],[2.25,.7],[2.28,.52],[2.22,.34]],
    gh:[[-1.62,.99],[-1.25,1.27],[-.9,1.42],[-.5,1.46],[.15,1.46],[.45,1.42],[1.02,.99]]},
  hatch:{L:4.05,W:1.76,r:.32,ar:[1.25,-1.25],belt:1.0,
    body:[[-1.98,.34],[-2.04,.55],[-2.02,.9],[-1.95,1.02],[.85,1.02],[1.42,.94],[1.9,.82],[2.04,.66],[2.06,.5],[2.0,.34]],
    gh:[[-1.93,1.0],[-1.84,1.32],[-1.6,1.47],[.15,1.48],[.42,1.43],[.92,1.01]]},
  smart:{L:2.7,W:1.66,r:.29,ar:[.86,-.86],belt:1.04,
    body:[[-1.32,.32],[-1.38,.62],[-1.36,1.0],[-1.3,1.06],[.72,1.06],[1.15,.94],[1.35,.76],[1.38,.52],[1.34,.32]],
    gh:[[-1.3,1.04],[-1.22,1.42],[-1.05,1.56],[.22,1.56],[.42,1.48],[.78,1.05]]},
  sport:{L:4.5,W:1.92,r:.34,ar:[1.42,-1.36],belt:.86,
    body:[[-2.25,.28],[-2.3,.48],[-2.22,.76],[-2.0,.86],[-1.45,.88],[1.0,.86],[1.75,.76],[2.18,.6],[2.3,.45],[2.25,.28]],
    gh:[[-1.65,.87],[-1.05,1.13],[-.7,1.22],[.0,1.22],[.32,1.16],[1.05,.85]]},
  van:{L:5.0,W:1.98,r:.35,ar:[1.62,-1.52],belt:1.12,van:1,
    body:[[-2.48,.34],[-2.52,.62],[-2.5,1.95],[-2.42,2.08],[-2.2,2.12],[.75,2.12],[1.05,2.06],[1.6,1.22],[2.22,1.04],[2.45,.86],[2.5,.62],[2.46,.34]],gh:null},
};
const _carGeo={};let _blob;
function splinePts(pts,n=10){const c=new THREE.SplineCurve(pts.map(q=>new THREE.Vector2(q[0],q[1])));c.curveType="centripetal";return c.getPoints(n*pts.length)}
function carGeos(type){
  if(_carGeo[type])return _carGeo[type];
  const T=CAR_T[type],b=.11,W=T.W,yB=.32;
  // Karosserie: Seitenprofil mit Radausschnitten
  const top=splinePts(T.body.slice(1,-1),8),sh=new THREE.Shape();
  sh.moveTo(T.body[0][0],T.body[0][1]);for(const q of top)sh.lineTo(q.x,q.y);sh.lineTo(T.body[T.body.length-1][0],T.body[T.body.length-1][1]);
  for(const ax of T.ar.slice().sort((p,q)=>q-p)){const R=T.r+.07;sh.lineTo(ax+R,yB);sh.absarc(ax,yB,R,0,Math.PI,false)}
  sh.lineTo(T.body[0][0],T.body[0][1]);
  let body=new THREE.ExtrudeGeometry(sh,{depth:W-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b*.8,bevelSegments:4,curveSegments:14});body.translate(0,0,-(W-2*b)/2);
  {const p=body.attributes.position,xc=(T.body[0][0]+T.body[T.body.length-1][0])/2,hl=T.L/2;for(let i=0;i<p.count;i++){const t=Math.abs(p.getX(i)-xc)/hl,y=p.getY(i);
    let s=1-.1*Math.pow(Math.min(1,t),6);if(y>T.belt-.05)s*=1-.04*Math.min(1,(y-T.belt+.05)/.2);p.setZ(i,p.getZ(i)*s)}}
  body=crease(body,.7);
  // Kabine: verjüngt sich nach oben (eingezogene Seitenfenster)
  let gh=null,glass=[];
  if(T.gh){const gp=splinePts(T.gh,10),gs=new THREE.Shape();gs.moveTo(T.gh[0][0],T.gh[0][1]-.04);for(const q of gp)gs.lineTo(q.x,q.y);gs.lineTo(T.gh[T.gh.length-1][0],T.gh[T.gh.length-1][1]-.04);gs.closePath();
    const hw=W/2-.1,gtop=Math.max(...T.gh.map(q=>q[1])),gb=T.belt,taper=y=>1-.2*clamp((y-gb)/(gtop-gb),0,1);
    gh=new THREE.ExtrudeGeometry(gs,{depth:2*hw-.08,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:2,curveSegments:10});gh.translate(0,0,-(hw-.04));
    {const p=gh.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)*taper(p.getY(i)))}gh=crease(gh,.6);
    // Scheiben als eingesetzte Flächen auf der Kabine
    const pillar=.085,inset=s=>{const o=[];const c=new THREE.Vector2();s.forEach(q=>c.add(q));c.divideScalar(s.length);return s.map(q=>q.clone().lerp(c,0))};
    const sidePoly=gp.filter(q=>q.y>gb+.03);
    const xa=Math.min(...sidePoly.map(q=>q.x))+.16,xb=Math.max(...sidePoly.map(q=>q.x))-.2,yTop=y=>{let best=gb;for(let i=1;i<gp.length;i++){const a=gp[i-1],c=gp[i];if((a.x-y)*(c.x-y)<=0){const t=(y-a.x)/((c.x-a.x)||1e-6);best=Math.max(best,a.y+(c.y-a.y)*t)}}return best};
    const bx=(T.gh[2][0]+T.gh[3][0])/2-.15;
    const win=(x0,x1)=>{const pts=[];const N=12;for(let i=0;i<=N;i++){const x=x0+(x1-x0)*i/N;pts.push(new THREE.Vector2(x,yTop(x)-pillar))}pts.push(new THREE.Vector2(x1,gb+.06),new THREE.Vector2(x0,gb+.06));return pts.filter(q=>q.y>gb+.05)};
    for(const [x0,x1] of [[xa,bx-pillar/2],[bx+pillar/2,xb]]){const pts=win(x0,x1);if(pts.length<3)continue;
      for(const sd of [1,-1]){const g=new THREE.ShapeGeometry(new THREE.Shape(pts)),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,sd*(hw*taper(p.getY(i))+.045));if(sd<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i];ix[i]=ix[i+1];ix[i+1]=t}}g.computeVertexNormals();glass.push(g)}}
    // Front- und Heckscheibe
    const strip=(i0,i1,sgn)=>{const a=T.gh[i0],c=T.gh[i1],P=[];for(const [x,y] of [[a[0],a[1]],[c[0],c[1]]]){const s=taper(y)*hw-.09;P.push([x,y,s],[x,y,-s])}
      const g=new THREE.BufferGeometry(),v=[P[0],P[2],P[3],P[0],P[3],P[1]],n=new THREE.Vector3(c[1]-a[1],-(c[0]-a[0]),0).normalize().multiplyScalar(sgn),arr=[];
      for(const q of v)arr.push(q[0]+n.x*.05,q[1]+n.y*.05,q[2]);g.setAttribute("position",new THREE.Float32BufferAttribute(arr,3));g.computeVertexNormals();
      if(g.attributes.normal.getX(0)*n.x+g.attributes.normal.getY(0)*n.y<0){const ar=g.attributes.position.array;for(let k=0;k<ar.length;k+=9)for(let m=0;m<3;m++){const t=ar[k+3+m];ar[k+3+m]=ar[k+6+m];ar[k+6+m]=t}g.computeVertexNormals()}return g};
    const nG=T.gh.length;glass.push(strip(nG-1,nG-2,1));glass.push(strip(0,1,-1));
  }
  // Rad: Reifen mit gerundeter Flanke, Felge mit Speichen
  const r=T.r,tw=.22,tp=[[r*.66,-tw/2],[r*.86,-tw/2-.006],[r*.97,-tw/2+.02],[r,-tw/2+.06],[r,tw/2-.06],[r*.97,tw/2-.02],[r*.86,tw/2+.006],[r*.66,tw/2]].map(q=>new THREE.Vector2(q[0],q[1]));
  const tire=new THREE.LatheGeometry(tp,28);tire.rotateX(Math.PI/2);
  const rp=[[0,tw/2-.005],[r*.2,tw/2-.01],[r*.24,tw/2-.04],[r*.62,tw/2-.03],[r*.67,tw/2-.005],[r*.67,-tw/2+.02]].map(q=>new THREE.Vector2(q[0],q[1]));
  const rim=new THREE.LatheGeometry(rp,24);rim.rotateX(-Math.PI/2);
  const spoke=new THREE.BoxGeometry(r*.44,.06,.05);spoke.translate(r*.42,0,tw/2-.03);
  const liner=new THREE.CylinderGeometry(r+.08,r+.08,W-.36,18,1,true,-Math.PI/2,Math.PI);liner.rotateX(Math.PI/2);liner.rotateZ(Math.PI/2);
  return _carGeo[type]={body,gh,glass,tire,rim,spoke,liner};
}
function makeCar(color,player,o={}){
  const type=o.type||"sedan",T=CAR_T[type],G=carGeos(type),M=carMats(),W=T.W;
  const pm=carPaint(color,player);
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const add=(geo,m,x=0,y=0,z=0,sh=true)=>{const k=new THREE.Mesh(geo,m);k.position.set(x,y,z);k.castShadow=sh;k.receiveShadow=true;body.add(k);return k};
  const box=(w,h,d,m,x,y,z,ry=0,rz=0)=>{const k=add(new THREE.BoxGeometry(w,h,d),m,x,y,z,false);k.rotation.set(0,ry,rz);return k};
  add(G.body,pm);
  const x0=T.body[0][0],x1=T.body[T.body.length-1][0],L=x1-x0,xc=(x0+x1)/2,hw=W/2;
  box(L-.7,.28,W-.3,M.trim,xc,.36,0);
  for(const ax of T.ar){const k=add(G.liner,M.liner,ax,.32,0,false)}
  if(G.gh){add(G.gh,pm);for(const gg of G.glass)add(gg,M.glass,0,0,0,false)}
  else{ // Transporter: große Frontscheibe, Seiten- und Heckfenster
    const ws=box(.04,.86,W-.34,M.glass,1.33,1.62,0,0,-.62);
    for(const s of [1,-1]){box(.82,.5,.02,M.glass,.42,1.66,s*(hw+.005));box(1.05,.46,.02,M.glass,-.72,1.68,s*(hw+.005));box(1.05,.46,.02,M.glass,-1.88,1.68,s*(hw+.005))}
    box(.02,.52,W-.6,M.glass,x0-.012,1.62,0)}
  // Zierleisten und Anbauteile
  const front=x1,rear=x0,ys=T.belt;
  box(.18,.2,W-.16,M.plastic,front+.02,.42,0);box(.18,.22,W-.16,M.plastic,rear-.02,.44,0);
  box(.06,.17,W*.42,M.trim,front+.05,.6,0);for(let i=0;i<4;i++)box(.065,.012,W*.4,M.chrome,front+.07,.54+i*.04,0);
  box(.025,.115,.52,M.plate,front+.115,.42,0);box(.025,.115,.52,M.plate,rear-.115,.5,0);
  const yl=T.van?.95:ys-.22;
  for(const s of [1,-1]){
    box(.08,.12,.4,M.lens,front-.02,yl,s*(hw-.32),s*.25);box(.05,.05,.12,M.amber,front-.06,yl-.08,s*(hw-.12),s*.6);
    box(.08,.13,.42,M.tail,rear+.03,yl+.06,s*(hw-.3),-s*.2);box(.2,.1,.05,M.tail,rear+.14,yl+.06,s*(hw-.03));
    // Türfugen, Griffe, Schweller
    for(const dx of (T.van?[1.0,.0]:type==="smart"?[.65]:[.95,-.22]))box(.012,ys-.4,.004,M.trim,dx,(ys+.4)/2,s*(hw+.004));
    for(const dx of (T.van?[.55]:type==="smart"?[.3]:[.55,-.6]))box(.16,.035,.03,M.chrome,dx,ys-.12,s*(hw+.01));
    box(L-1.9,.06,.02,M.trim,xc,.42,s*(hw+.005));
    // Außenspiegel
    const mx=T.van?1.1:(T.gh?T.gh[T.gh.length-1][0]-.18:.8),my=T.van?1.32:ys+.12;
    const mir=add(new THREE.SphereGeometry(.1,12,8),pm,mx,my,s*(hw+.13),false);mir.scale.set(.9,.7,1.3);box(.06,.04,.14,M.trim,mx,my-.06,s*(hw+.04))}
  if(o.stripe)box(L-.6,.012,.28,paint(o.stripe),xc,(T.gh?T.gh[2][1]:2.1)+.03,0);
  const wheels=[];
  for(const ax of T.ar)for(const s of [1,-1]){const w=new THREE.Group(),inner=new THREE.Group();w.add(inner);
    const t=new THREE.Mesh(G.tire,M.tire);t.castShadow=true;inner.add(t);inner.add(new THREE.Mesh(G.rim,M.rim));
    for(let i=0;i<5;i++){const sp=new THREE.Mesh(G.spoke,M.rim);sp.rotation.z=i*Math.PI*2/5;inner.add(sp)}
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.02,10),M.chrome);cap.rotation.x=Math.PI/2;cap.position.z=.11;inner.add(cap);
    if(s<0)inner.rotation.y=Math.PI;
    w.position.set(ax,T.r,s*(hw-.13));g.add(w);wheels.push(w)}
  _blob=_blob||new THREE.MeshBasicMaterial({map:canvasTex(128,128,c=>{const gr=c.createRadialGradient(64,64,8,64,64,64);gr.addColorStop(0,"rgba(0,0,0,.62)");gr.addColorStop(.6,"rgba(0,0,0,.35)");gr.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=gr;c.fillRect(0,0,128,128)}),transparent:true,depthWrite:false});
  const bl=new THREE.Mesh(new THREE.PlaneGeometry(L+.7,W+.5),_blob);bl.rotation.x=-Math.PI/2;bl.position.y=.025;bl.renderOrder=1;g.add(bl);
  g.userData={body,paint:pm,carWheels:wheels,wr:T.r}; scene.add(g); return g;
}

/* ---- Spielfigur: weichere Formen, Kapuzenjacke, Hände, Gesicht, Turnschuhe ---- */
const _hm={}; const hmat=c=>_hm[c]||(_hm[c]=new THREE.MeshLambertMaterial({color:c}));
function capsule(r0,r1,len,seg=12){const g=new THREE.CylinderGeometry(r1,r0,len,seg,1,true);g.translate(0,-len/2,0);
  const a=new THREE.SphereGeometry(r0,seg,6,0,Math.PI*2,0,Math.PI/2),b=new THREE.SphereGeometry(r1,seg,6,0,Math.PI*2,Math.PI/2,Math.PI/2);b.translate(0,-len,0);return [g,a,b]}
function makeHuman(o={}){
  const jacket=hmat(o.jacket||"#2f4f7a"),jacketD=hmat(new THREE.Color(o.jacket||"#2f4f7a").multiplyScalar(.72).getStyle()),jeans=hmat(o.jeans||"#3a4f72"),skin=hmat(o.skin||"#d6a07a"),hairM=hmat(o.hair||"#33251c"),
    shoe=hmat("#f1f1ee"),sole=hmat("#3a3a3a"),dark=hmat("#1c1c1c"),bagM=hmat(o.bagCol||"#e2a91c"),bagD=hmat("#9c7413");
  const g=new THREE.Group(),hips=new THREE.Group();hips.position.y=.935;g.add(hips);
  const add=(geo,m,p,x,y,z,sh=true)=>{const k=new THREE.Mesh(geo,m);k.position.set(x,y,z);k.castShadow=sh;p.add(k);return k};
  const addAll=(geos,m,p,x,y,z)=>geos.map(gg=>add(gg,m,p,x,y,z));
  const torso=new THREE.Group();hips.add(torso);
  const pelvis=add(new THREE.SphereGeometry(.16,16,10),jeans,hips,0,.0,0);pelvis.scale.set(.75,.62,1.08);
  const belly=add(new THREE.CylinderGeometry(.168,.16,.22,16),jacket,torso,0,.14,0);belly.scale.set(.74,1,1.08);
  const chest=add(new THREE.SphereGeometry(.2,18,14),jacket,torso,0,.4,0);chest.scale.set(.66,.95,1.1);
  const hem=add(new THREE.TorusGeometry(.16,.022,6,20),jacketD,torso,0,.04,0);hem.rotation.x=Math.PI/2;hem.scale.set(.76,1.1,1);
  add(new THREE.BoxGeometry(.012,.5,.012),hmat("#cfd4d9"),torso,.143,.32,0,false);
  const hood=add(new THREE.TorusGeometry(.105,.045,8,18,Math.PI*1.25),jacketD,torso,-.035,.62,0);hood.rotation.set(Math.PI/2,0,Math.PI*.38);hood.scale.set(1.0,1.1,.8);
  add(new THREE.CylinderGeometry(.046,.052,.09,10),skin,torso,0,.67,0);
  const head=new THREE.Group();head.position.y=.8;torso.add(head);
  const sk=add(new THREE.SphereGeometry(.104,20,16),skin,head,0,0,0);sk.scale.set(.93,1.12,.86);
  const jaw=add(new THREE.SphereGeometry(.08,14,10),skin,head,.022,-.05,0);jaw.scale.set(.95,.8,.9);
  for(const s of [1,-1]){const ear=add(new THREE.SphereGeometry(.024,8,6),skin,head,-.005,-.005,s*.09,false);ear.scale.set(.6,1,.5);add(new THREE.SphereGeometry(.011,8,6),dark,head,.088,.018,s*.034,false)}
  const nose=add(new THREE.SphereGeometry(.016,8,6),skin,head,.1,-.012,0,false);nose.scale.set(1.2,1,.9);
  const hr=add(new THREE.SphereGeometry(.112,18,12,0,Math.PI*2,0,Math.PI*.55),hairM,head,-.012,.016,0);hr.scale.set(.98,1.08,.92);hr.rotation.z=.3;
  const fr=add(new THREE.SphereGeometry(.07,12,8),hairM,head,.055,.07,0);fr.scale.set(.6,.5,1.2);
  if(o.bag!==false){const bp=add(new THREE.BoxGeometry(.14,.38,.29),bagM,torso,-.19,.36,0);const top=add(new THREE.SphereGeometry(.15,14,8,0,Math.PI*2,0,Math.PI/2),bagM,torso,-.19,.545,0);top.scale.set(.47,.5,.97);
    add(new THREE.BoxGeometry(.05,.15,.21),bagD,torso,-.27,.3,0,false);for(const s of [1,-1])add(new THREE.BoxGeometry(.03,.42,.035),bagD,torso,.0,.4,s*.11,false)}
  const limb=(side)=>{
    const arm=new THREE.Group();arm.position.set(0,.555,side*.225);torso.add(arm);
    add(new THREE.SphereGeometry(.07,12,8),jacket,arm,0,0,0,false);
    addAll(capsule(.058,.048,.27),jacket,arm,0,-.015,0);
    const elb=new THREE.Group();elb.position.y=-.29;arm.add(elb);
    addAll(capsule(.047,.04,.22),jacket,elb,0,0,0);
    const cuff=add(new THREE.CylinderGeometry(.043,.043,.04,10),jacketD,elb,0,-.225,0);
    const hand=add(new THREE.SphereGeometry(.042,10,8),skin,elb,.008,-.275,0);hand.scale.set(.75,1.15,.55);
    const leg=new THREE.Group();leg.position.set(0,0,side*.092);hips.add(leg);
    addAll(capsule(.082,.062,.42,14),jeans,leg,0,-.01,0);
    const knee=new THREE.Group();knee.position.y=-.44;leg.add(knee);
    addAll(capsule(.06,.046,.39,12),jeans,knee,0,0,0);
    const ankle=new THREE.Group();ankle.position.y=-.445;knee.add(ankle);
    const sh=add(new THREE.SphereGeometry(.07,14,10),shoe,ankle,.06,-.005,0);sh.scale.set(1.85,.55,.75);
    const so=add(new THREE.CylinderGeometry(.06,.062,.025,14),sole,ankle,.06,-.035,0,false);so.scale.set(2.15,1,.86);
    add(new THREE.BoxGeometry(.06,.012,.07),hmat("#2f6fb5"),ankle,.05,.025,0,false);
    return {arm,elb,leg,knee,ankle};
  };
  const L=limb(1),R=limb(-1);
  g.userData.h={hips,torso,head,L,R};
  return g;
}
let _fsh=null;
function footShadow(g,size=.95){_fsh=_fsh||new THREE.MeshBasicMaterial({map:canvasTex(64,64,c=>{const gr=c.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,"rgba(0,0,0,.5)");gr.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=gr;c.fillRect(0,0,64,64)}),transparent:true,depthWrite:false});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size*.75),_fsh);m.rotation.x=-Math.PI/2;m.position.y=.02;m.renderOrder=1;g.add(m);return m}

/* ---- Bäume: Kronen aus vielen Blattbüscheln (Alpha-Karten), einige mit Herbstlaub ---- */
function leafTex(){return canvasTex(256,256,c=>{c.clearRect(0,0,256,256);
  for(let i=0;i<70;i++){const a=Math.random()*Math.PI*2,r=Math.random()*100,x=128+Math.cos(a)*r,y=128+Math.sin(a)*r,s=10+Math.random()*12;
    c.save();c.translate(x,y);c.rotate(Math.random()*6.3);const v=150+Math.floor(Math.random()*90);c.fillStyle=`rgb(${v},${v},${v})`;c.beginPath();c.moveTo(0,-s);c.quadraticCurveTo(s*.62,0,0,s);c.quadraticCurveTo(-s*.62,0,0,-s);c.fill();
    c.strokeStyle="rgba(0,0,0,.25)";c.lineWidth=1;c.beginPath();c.moveTo(0,-s);c.lineTo(0,s);c.stroke();c.restore()}})}
function crownCards(blobs,n,seed){const P=[],N=[],U=[],Cl=[],ctr=new THREE.Vector3(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),col=new THREE.Color();
  blobs.forEach(b=>ctr.add(new THREE.Vector3(b[0],b[1],b[2])));ctr.divideScalar(blobs.length);
  const corners=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]];
  for(let i=0;i<n;i++){const r=k=>h01(seed*997+i*13+k);const b=blobs[Math.floor(r(1)*blobs.length)%blobs.length];
    const th=r(2)*Math.PI*2,ph=Math.acos(2*r(3)-1),rad=Math.pow(r(4),.35);
    const cx=b[0]+Math.sin(ph)*Math.cos(th)*b[3]*rad,cy=b[1]+Math.cos(ph)*b[4]*rad,cz=b[2]+Math.sin(ph)*Math.sin(th)*b[5]*rad,s=.55+r(5)*.45;
    e.set(r(6)*6.3,r(7)*6.3,r(8)*6.3);q.setFromEuler(e);
    const autumn=r(9)<.18;col.setHSL(autumn?.09+r(10)*.06:.22+r(10)*.07,autumn?.65:.42+r(11)*.15,autumn?.45:.3+r(12)*.12);
    const nn=new THREE.Vector3(cx,cy,cz).sub(ctr).normalize();
    for(const [a,c] of corners){v.set(a*s,c*s,0).applyQuaternion(q);P.push(cx+v.x,cy+v.y,cz+v.z);N.push(nn.x,nn.y,nn.z);U.push(a+.5,c+.5);Cl.push(col.r,col.g,col.b)}}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(N,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setAttribute("color",new THREE.Float32BufferAttribute(Cl,3));return g}
function buildTreeMeshes(){
  const shapes=[[[0,0,0,1,.85,1],[.55,.25,.2,.6,.55,.6],[-.5,.15,-.3,.65,.6,.6],[.1,.55,-.1,.6,.5,.65],[-.2,-.2,.55,.55,.5,.55]],
                [[0,0,0,.72,.8,.72],[0,.75,0,.6,.7,.6],[.25,1.35,.05,.42,.5,.42],[-.3,.35,.25,.45,.45,.45]],
                [[0,0,0,1.15,.6,1],[.7,.1,-.4,.6,.45,.55],[-.75,.05,.3,.6,.48,.6],[.2,.4,.5,.55,.42,.55],[-.2,.42,-.45,.6,.4,.55],[.85,-.1,.5,.4,.35,.4]]];
  const variants=shapes.map((b,i)=>crownCards(b,isTouch?150:230,i+1));
  const lt=leafTex();
  const leaf=new THREE.MeshLambertMaterial({map:lt,vertexColors:true,alphaTest:.45,side:THREE.DoubleSide});
  const leafDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:lt,alphaTest:.45});
  const parts=[];{const t=new THREE.CylinderGeometry(.1,.19,1,8);t.translate(0,.5,0);parts.push(t);
    for(let k=0;k<4;k++){const br=new THREE.CylinderGeometry(.03,.07,.75,6);br.translate(0,.37,0);br.rotateZ(.75);br.rotateY(k*Math.PI/2+.4);br.translate(0,.85,0);parts.push(br)}}
  let n=0;for(const p of parts)n+=p.toNonIndexed().attributes.position.count;
  const P=new Float32Array(n*3),Nn=new Float32Array(n*3);let o=0;for(const p0 of parts){const p=p0.toNonIndexed();P.set(p.attributes.position.array,o*3);Nn.set(p.attributes.normal.array,o*3);o+=p.attributes.position.count}
  const trunk=new THREE.BufferGeometry();trunk.setAttribute("position",new THREE.BufferAttribute(P,3));trunk.setAttribute("normal",new THREE.BufferAttribute(Nn,3));
  const bark=new THREE.MeshLambertMaterial({color:0x5a4a3c});
  const by=[[],[],[]];treeList.forEach((t,i)=>by[Math.floor(h01(i*13+5)*3)%3].push(t));
  const ob=new THREE.Object3D(),col=new THREE.Color();
  const tI=new THREE.InstancedMesh(trunk,bark,treeList.length);let ti=0;
  by.forEach((list,v)=>{if(!list.length)return;const cI=new THREE.InstancedMesh(variants[v],leaf,list.length);cI.customDepthMaterial=leafDepth;
    list.forEach((t,i)=>{const hh=h01(t.x*3.1+t.y*7.7),th=2.1+hh*1.7,gy=groundY(t.x,t.y),r=t.r*(.8+hh*.5);
      ob.position.set(t.x,gy,t.y);ob.scale.set(.9+hh*.6,th,.9+hh*.6);ob.rotation.set((hh-.5)*.08,hh*6,(hh-.5)*.08);ob.updateMatrix();tI.setMatrixAt(ti++,ob.matrix);
      ob.position.set(t.x,gy+th+r*(v===1?.35:.45),t.y);ob.scale.set(r*(.95+h01(i)*.25),r*(.9+h01(i+9)*.3),r*(.95+h01(i+5)*.25));ob.rotation.set(0,hh*17,0);ob.updateMatrix();cI.setMatrixAt(i,ob.matrix);
      const k=.85+h01(i*7+v)*.3;col.setRGB(k,k,k);cI.setColorAt(i,col)});
    cI.castShadow=true;cI.receiveShadow=true;cI.frustumCulled=false;scene.add(cI)});
  tI.count=ti;tI.castShadow=true;tI.frustumCulled=false;scene.add(tI);
}


/* ================= Grafik-Überarbeitung: Figur, Autos, Bäume, Himmel, Kamera, kompakte Oberfläche ================= */

/* ---- Spielfigur mit menschlichen Proportionen (Meter, Blick nach +x) ---- */
// Schrittlänge je Tempo; der Standfuß bewegt sich genau mit Körpertempo nach hinten, deshalb rutscht er nicht über den Boden
const strideLen=(v,rn)=>.7+.8*clamp(v/3.3,0,1)+.8*rn;
const L1=.44,L2=.445,REACH=.872;
function legIK(side,tx,ty,flat){ // Ziel des Knöchels relativ zur Hüfte (x vorn, y oben)
  const D=clamp(Math.hypot(tx,ty),.2,L1+L2-.002),al=Math.atan2(tx,-ty),be=Math.acos(clamp((L1*L1+D*D-L2*L2)/(2*L1*D),-1,1)),kn=Math.PI-Math.acos(clamp((L1*L1+L2*L2-D*D)/(2*L1*L2),-1,1));
  side.leg.rotation.z=al+be; side.knee.rotation.z=-kn; side.ankle.rotation.z=-(al+be-kn)*flat;
}
// phi: Schrittphase (2π je Doppelschritt), w: 0 Stand … 1 Bewegung, r: 0 Gehen … 1 Laufen, stride: Schrittlänge in m
function poseHuman(g,phi,w,r,t=0,stride=1.5){
  const h=g.userData.h,p=((phi/(2*Math.PI))%1+1)%1,d=.45-.15*r,a=stride*d/2*Math.min(1,w*1.6),lift=w*(.1+.14*r);
  const hipY=Math.min(.93,Math.sqrt(Math.max(.01,REACH*REACH-a*a))+.05)-w*.012*Math.cos(4*Math.PI*p);
  h.hips.position.y=hipY;
  const foot=(q)=>{if(q<d){const s=q/d;return [a*(1-2*s),0,1]}const u=(q-d)/(1-d),e=u*u*(3-2*u);return [-a+2*a*e,lift*Math.sin(Math.PI*u)+r*w*.1*Math.sin(Math.PI*Math.min(1,u*1.7)),.35]};
  const fl=foot(p),fr=foot((p+.5)%1);
  legIK(h.L,fl[0],-(hipY-.05)+fl[1],fl[2]); legIK(h.R,fr[0],-(hipY-.05)+fr[1],fr[2]);
  const sw=Math.cos(2*Math.PI*p+.5),A=w*(.42+.5*r);
  h.L.arm.rotation.z=-A*sw; h.R.arm.rotation.z=A*sw; h.L.arm.rotation.x=-.07; h.R.arm.rotation.x=.07;
  const eb=.12+w*(.2+1.0*r); h.L.elb.rotation.z=eb+.2*w*Math.max(0,-sw); h.R.elb.rotation.z=eb+.2*w*Math.max(0,sw);
  h.torso.rotation.z=-(w*(.04+.15*r))+Math.sin(t*1.3)*.008*(1-w);
  h.torso.rotation.y=.1*w*sw; h.head.rotation.y=-.06*w*sw;
}
function sitHuman(g,kind,phi=0){
  const h=g.userData.h;
  if(kind==="stand"){poseHuman(g,0,0,0);h.L.ankle.rotation.z=h.R.ankle.rotation.z=0;h.L.arm.rotation.z=h.R.arm.rotation.z=1.0;h.L.elb.rotation.z=h.R.elb.rotation.z=.35;h.L.leg.rotation.z=.12;h.R.leg.rotation.z=-.08;return}
  const ped=kind==="bike"?Math.sin(phi)*.42:0;
  h.L.leg.rotation.z=1.05+ped; h.R.leg.rotation.z=1.05-ped; h.L.knee.rotation.z=-1.35-ped*.6; h.R.knee.rotation.z=-1.35+ped*.6; h.L.ankle.rotation.z=h.R.ankle.rotation.z=.3; h.hips.position.y=.935;
  h.L.arm.rotation.z=h.R.arm.rotation.z=1.05; h.L.elb.rotation.z=h.R.elb.rotation.z=.3; h.torso.rotation.z=-.28;
}
// Hülle in den alten Modell-Einheiten, damit vorhandene Aufrufe (Skalierung .092 bzw. Zweirad-Gruppen) weiter passen
function makePerson(shirt,bagOn=true){const w=new THREE.Group(),hu=makeHuman({jacket:shirt,bag:bagOn});hu.scale.setScalar(10.87);w.add(hu);w.userData={hu,legs:[hu.userData.h.L.leg,hu.userData.h.R.leg],arms:[hu.userData.h.L.arm,hu.userData.h.R.arm]};poseHuman(hu,0,0,0);return w}

/* ---- Gehwege mit modelliertem Bordstein ---- */
function quadUp(G,a,b,c,d,y,uvS){const cr=(b[1]-a[1])*(c[0]-a[0])-(b[0]-a[0])*(c[1]-a[1]);const o=cr>0?[a,b,c,a,c,d]:[a,c,b,a,d,c];for(const p of o)G.v(p[0],y,p[1],0,1,0,p[0]/uvS,p[1]/uvS,null)}
function quadV(G,x0,z0,x1,z1,y0,y1,nx_,nz,uvS){const u0=(x0+z0)/uvS,u1=(x1+z1)/uvS;for(const [x,y,z,u] of [[x0,y0,z0,u0],[x1,y0,z1,u1],[x1,y1,z1,u1],[x0,y0,z0,u0],[x1,y1,z1,u1],[x0,y1,z0,u0]])G.v(x,y,z,nx_,0,nz,u,y/uvS,null)}
function addSidewalks(gS,gC,pts,w){
  const n=pts.length/2,hw=w/2,SW=2.5,CW=.16;
  for(let i=0;i<n-1;i++){const x0=pts[2*i],z0=pts[2*i+1],x1=pts[2*i+2],z1=pts[2*i+3],L=Math.hypot(x1-x0,z1-z0)||1e-6,px=-(z1-z0)/L,pz=(x1-x0)/L;
    for(const sd of [1,-1]){const o=(d)=>[[x0+px*sd*d,z0+pz*sd*d],[x1+px*sd*d,z1+pz*sd*d]];
      const a=o(hw),b=o(hw+CW),c=o(hw+SW);
      quadUp(gC,a[0],a[1],b[1],b[0],SIDE_Y+.004,1);
      quadUp(gS,b[0],b[1],c[1],c[0],SIDE_Y,4);
      quadV(gC,a[0][0],a[0][1],a[1][0],a[1][1],ROAD_Y-.03,SIDE_Y+.004,-px*sd,-pz*sd,1);
      quadV(gS,c[0][0],c[0][1],c[1][0],c[1][1],0,SIDE_Y,px*sd,pz*sd,3)}}
  for(let i=0;i<n;i++){const cx=pts[2*i],cz=pts[2*i+1],R=hw+SW,S=10;for(let k=0;k<S;k++){const a0=k/S*Math.PI*2,a1=(k+1)/S*Math.PI*2;
    for(const [x,z] of [[cx,cz],[cx+Math.cos(a1)*R,cz+Math.sin(a1)*R],[cx+Math.cos(a0)*R,cz+Math.sin(a0)*R]])gS.v(x,SIDE_Y,z,0,1,0,x/3,z/3,null)}}
}

/* ---- Himmel mit Verlauf und Wolken ---- */
let skyDome;
function buildSky(){
  const geo=new THREE.SphereGeometry(2600,24,14),p=geo.attributes.position,cols=[],top=new THREE.Color("#4f8fd0"),hor=new THREE.Color("#d5e6f3"),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const t=clamp(p.getY(i)/2600,0,1);c.copy(hor).lerp(top,Math.pow(t,.55));cols.push(c.r,c.g,c.b)}
  geo.setAttribute("color",new THREE.Float32BufferAttribute(cols,3));
  skyDome=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));skyDome.renderOrder=-10;scene.add(skyDome);
  const ct=canvasTex(256,128,cx=>{for(let i=0;i<14;i++){const x=40+Math.random()*176,y=50+Math.random()*30,r=22+Math.random()*26;const gr=cx.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,"rgba(255,255,255,.75)");gr.addColorStop(1,"rgba(255,255,255,0)");cx.fillStyle=gr;cx.fillRect(0,0,256,128)}});
  const cm=new THREE.SpriteMaterial({map:ct,transparent:true,opacity:.9,fog:false,depthWrite:false});
  for(let i=0;i<9;i++){const s=new THREE.Sprite(cm),a=i/9*6.283+h01(i)*.5;s.position.set(Math.cos(a)*1700,520+h01(i+3)*420,Math.sin(a)*1700);s.scale.set(900+h01(i+7)*600,320+h01(i+9)*160,1);s.renderOrder=-9;skyDome.add(s)}
}

/* ---- Farbraum: alle Materialfarben einmal von sRGB nach linear, Ausgabe wieder sRGB ---- */
function linearizeScene(){
  const seen=new Set(),geos=new Set();
  const doMat=m=>{if(!m||seen.has(m))return;seen.add(m);if(m.color)m.color.convertSRGBToLinear();if(m.emissive)m.emissive.convertSRGBToLinear();if(m.specular)m.specular.convertSRGBToLinear();
    for(const k of ["map","emissiveMap"])if(m[k]&&m[k].encoding!==THREE.sRGBEncoding){m[k].encoding=THREE.sRGBEncoding;m[k].needsUpdate=true}
    if(m.isMeshBasicMaterial||m.isSpriteMaterial)m.toneMapped=false;m.needsUpdate=true};
  const lin=a=>{for(let i=0;i<a.length;i++)a[i]=Math.pow(a[i],2.2)};
  scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(doMat);
    if(o.geometry&&o.geometry.attributes&&o.geometry.attributes.color&&!geos.has(o.geometry)){geos.add(o.geometry);lin(o.geometry.attributes.color.array);o.geometry.attributes.color.needsUpdate=true}
    if(o.instanceColor&&!geos.has(o.instanceColor)){geos.add(o.instanceColor);lin(o.instanceColor.array);o.instanceColor.needsUpdate=true}});
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  hemi.color.set("#cfe2ff").convertSRGBToLinear();hemi.groundColor.set("#8a8172").convertSRGBToLinear();
}

/* ---- Kamera: leicht erhöht hinter der Figur, drehbar, weicht Wänden und Autos aus ---- */
const camS={dist:6.6,pitch:.46,th:1.3,look:1.5,yo:0,pu:0,drag:false,lastDrag:-9,cd:1,px:0,py:0};
const camFor=VH=>VH.id==="walk"?{dist:6.6,pitch:.46,th:1.3,look:1.5}:VH.fly?{dist:25,pitch:.42,th:2,look:5}:(VH.agile||VH.id==="moped")?{dist:7.6,pitch:.4,th:1.3,look:2.2}:{dist:9.4,pitch:.36,th:1.1,look:3};
{const el=$("game");
  el.addEventListener("pointerdown",e=>{if(state.mode!=="play")return;camS.drag=true;camS.px=e.clientX;camS.py=e.clientY;try{el.setPointerCapture(e.pointerId)}catch(_){}});
  el.addEventListener("pointermove",e=>{if(!camS.drag)return;camS.yo+=(e.clientX-camS.px)*.0065;camS.pu=clamp(camS.pu+(e.clientY-camS.py)*.004,-.32,.75);camS.px=e.clientX;camS.py=e.clientY;camS.lastDrag=performance.now()/1000});
  for(const ev of ["pointerup","pointercancel","lostpointercapture"])el.addEventListener(ev,()=>{camS.drag=false})}
const _cv=new THREE.Vector3();
function updateCamera(dt,VH){
  const P=camFor(VH),M=CAMS[state.cam],k=Math.min(1,dt*2.2),now=performance.now()/1000;
  camS.dist+=(P.dist*M.f-camS.dist)*k; camS.pitch+=(P.pitch+M.p-camS.pitch)*k; camS.th+=(P.th-camS.th)*k; camS.look+=(P.look-camS.look)*k;
  let da=car.a-camYaw; while(da>Math.PI)da-=2*Math.PI; while(da<-Math.PI)da+=2*Math.PI;
  camYaw+=da*Math.min(1,dt*(Math.abs(car.v)>1.2?3:.9));
  if(!camS.drag&&now-camS.lastDrag>2.2&&Math.abs(car.v)>.8){camS.yo*=Math.pow(.12,dt);if(Math.abs(camS.yo)<.004)camS.yo=0}
  while(camS.yo>Math.PI)camS.yo-=2*Math.PI; while(camS.yo<-Math.PI)camS.yo+=2*Math.PI;
  const yaw=camYaw+camS.yo,pitch=clamp(camS.pitch+camS.pu,.1,1.25),sp=Math.abs(car.v)/36,dist=camS.dist*(1+sp*.15);
  const ox=car.x,oy=car.alt+camS.th,oz=car.y,dx=-Math.cos(yaw)*Math.cos(pitch),dy=Math.sin(pitch),dz=-Math.sin(yaw)*Math.cos(pitch);
  // Hindernisse zwischen Figur und Kamera: Gebäude (Höhenraster) und Fahrzeuge
  let free=1;const cars=VH.fly?[]:npcs.concat(parkedList,save.left&&save.left.id!==VH.id?[save.left]:[]);
  for(let s=.1;s<=1.0001;s+=.05){const x=ox+dx*dist*s,y=oy+dy*dist*s,z=oz+dz*dist*s;let hit=heightAt(x,z)>y-.35;
    if(!hit&&y<1.9)for(const c of cars){if(c.x!==undefined&&Math.hypot(c.x-x,c.y-z)<1.45){hit=true;break}}
    if(hit){free=Math.max(.035,s-.09);break}}
  camS.cd=free<camS.cd?free:camS.cd+(free-camS.cd)*Math.min(1,dt*3);
  const d=dist*camS.cd;
  _cv.set(ox+dx*d,oy+dy*d+(1-camS.cd)*.5,oz+dz*d);
  camPos.lerp(_cv,Math.min(1,dt*9)); camera.position.copy(camPos);
  if(shake>0){shake-=dt;camera.position.x+=(Math.random()-.5)*shake*1.2;camera.position.y+=(Math.random()-.5)*shake*1.2}
  camera.lookAt(ox+Math.cos(yaw)*camS.look,oy+.15-(VH.fly?1:0),oz+Math.sin(yaw)*camS.look);
  const fov=54+sp*9+(keys.shift&&VH.nitro&&car.nitro>0?5:0); if(Math.abs(camera.fov-fov)>.05){camera.fov+=(fov-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix()}
  if(skyDome)skyDome.position.copy(camera.position);
}

/* ---- Ein- und Aussteigen ---- */
function exitVehicle(){
  const VH=V();if(VH.id==="walk"||state.mode!=="play")return;
  if(VH.fly&&car.alt-heightAt(car.x,car.y)>.6){toast("Erst landen","Mit F sinken, dann aussteigen","#ff5d6c");return}
  const l={id:VH.id,x:car.x,y:car.y,a:car.a};save.left=l;save.veh="walk";car.r=VEH.walk.r;
  let done=false;for(const d of [1.5,2.1,2.8]){for(const sd of [1,-1]){const x=l.x-Math.sin(l.a)*sd*d,y=l.y+Math.cos(l.a)*sd*d;if(!carHits(x,y)){car.x=x;car.y=y;done=true;break}}if(done)break}
  setVehicle("walk");
}
function enterVehicle(){const l=save.left;if(!l||V().id!=="walk")return;save.left=null;car.x=l.x;car.y=l.y;car.a=l.a;setVehicle(l.id);beep(520,.08,"triangle")}
$("btnExit").onclick=exitVehicle;

/* ---- kompakte Oberfläche: aufklappbares Menü, aktuelles Ziel ---- */
$("btnMore").onclick=()=>{$("topbtns").hidden=!$("topbtns").hidden};
$("topbtns").addEventListener("click",()=>{$("topbtns").hidden=true});
$("goal").addEventListener("pointerdown",e=>{e.preventDefault();if(state.mode==="play")openHeft()});
function goalText(){
  for(const q of QUESTS){const s=qs(q);if(!s.acc||s.done)continue;
    const m=q.measures.find(m=>!s.m[m.id]);
    return m?`📏 ${q.title}: ${m.short} messen (${m.where})`:`❗ ${q.title}: Sprich mit ${q.giver.name} und rechne`}
  let best=null,bd=1e9;for(const q of QUESTS){if(qs(q).done)continue;const d=Math.hypot(q.giver.x-car.x,q.giver.y-car.y);if(d<bd){bd=d;best=q}}
  return best?`❗ ${best.giver.name} sucht Hilfe · ${best.district}, ${Math.round(bd)} m`:"Erkunde Mönchengladbach · 📒 Auftragsheft für mehr";
}
// Aufgabenfenster bleiben mit Bildschirmtastatur bedienbar
if(window.visualViewport){const vv=()=>document.documentElement.style.setProperty("--vvh",visualViewport.height+"px");visualViewport.addEventListener("resize",vv);vv()}
document.addEventListener("focusin",e=>{if(e.target.tagName==="INPUT"&&isTouch)setTimeout(()=>e.target.scrollIntoView({block:"center",behavior:"smooth"}),250)});

/* ---- Bildrate: bei Bedarf erst Schattenreichweite, dann Auflösung senken ---- */
const perf={t:0,n:0,step:0};
function watchPerf(dt){if(state.mode!=="play")return;perf.t+=dt;perf.n++;if(perf.t<4)return;const fps=perf.n/perf.t;perf.t=0;perf.n=0;
  if(fps>=27||perf.step>=3)return;perf.step++;
  if(perf.step===1){Object.assign(sun.shadow.camera,{left:-38,right:38,top:38,bottom:-38});sun.shadow.camera.updateProjectionMatrix();sun.shadow.mapSize.set(1024,1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  if(perf.step===2){renderer.setPixelRatio(1);resize()}
  if(perf.step===3){renderer.setPixelRatio(.75);resize()}}
