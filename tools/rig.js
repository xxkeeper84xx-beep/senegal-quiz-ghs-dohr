/* ================= Skelett für Figuren ohne Animation (z. B. Herr Dittmann mit Cap) =================
   Das gelieferte Modell ist starr (kein Skelett, keine Animation). rigFigure() erkennt Beine, Arme, Rumpf und Kopf an der Lage der
   Punkte, setzt Gelenke mit denselben Namen wie bei den anderen Figuren (Hips, Spine, LeftUpLeg, LeftArm …) und erzeugt
   die Animationen Idle, Walk und Run. Knochen-Konvention wie bei den übrigen Figuren: Drehung um die lokale X-Achse kippt nach vorn,
   ein negativer Winkel am Knie beugt es nach hinten. Damit funktionieren Sitzhaltung, Auf-/Absteigen und Einsteigen auch für diese Figur. */
function rigFigure(gltf){
  const root=gltf.scene;root.updateMatrixWorld(true);
  const parts=[];root.traverse(o=>{if(o.isMesh)parts.push(o)});
  const geos=parts.map(m=>{const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);return g});
  // alle Punkte für die Vermessung
  let H=0,minY=1e9;for(const g of geos){const p=g.attributes.position;for(let i=0;i<p.count;i++){H=Math.max(H,p.getY(i));minY=Math.min(minY,p.getY(i))}}
  H-=minY;const Y=f=>minY+f*H;
  // Armgrenze je Höhe: größte Lücke in |x| zwischen Rumpf und Arm (Arme hängen neben dem Körper)
  const SL=60,y0=Y(.42),y1=Y(.80),bins=[];for(let s=0;s<SL;s++)bins.push([]);
  for(const g of geos){const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<y0||y>y1)continue;const s=Math.min(SL-1,Math.floor((y-y0)/(y1-y0)*SL));bins[s].push(Math.abs(p.getX(i)))}}
  const gap=bins.map(b=>{if(b.length<20)return null;b.sort((a,c)=>a-c);let best=0,at=null;for(let k=1;k<b.length;k++){const x=b[k-1];if(x<.04*H||x>.2*H)continue;const d=b[k]-b[k-1];if(d>best){best=d;at=(b[k]+b[k-1])/2}}return best>.006*H?at:null});
  // fehlende Werte (Schulterbereich ohne Lücke) mit dem nächsten tieferen Wert füllen
  let last=null;for(let s=0;s<SL;s++){if(gap[s]!=null)last=gap[s];else gap[s]=last}
  last=null;for(let s=SL-1;s>=0;s--){if(gap[s]!=null)last=gap[s];else gap[s]=last}
  const gapAt=y=>gap[Math.max(0,Math.min(SL-1,Math.floor((y-y0)/(y1-y0)*SL)))]||.12*H;
  const isArm=(x,y)=>y>Y(.40)&&y<Y(.83)&&Math.abs(x)>gapAt(Math.min(y,y1));
  // Gelenkhöhen (Anteile der Körpergröße) und seitliche Lage aus den Punkten
  const J={ankle:Y(.055),knee:Y(.285),hip:Y(.53),crotch:Y(.47),spine:Y(.58),spine1:Y(.65),spine2:Y(.72),neck:Y(.835),head:Y(.875),shoulder:Y(.80),elbow:Y(.62),wrist:Y(.475)};
  let lx=0,ln=0,ax=0,an=0,az=0;for(const g of geos){const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);
    if(Math.abs(y-J.knee)<.03*H&&x>0){lx+=x;ln++}if(Math.abs(y-J.elbow)<.04*H&&x>0&&isArm(x,y)){ax+=x;an++;az+=p.getZ(i)}}}
  const legX=ln?lx/ln:.06*H,armX=an?ax/an:.14*H,armZ=an?az/an:0;
  // Knochen (Modell blickt nach +Z, links = +X). Beine und Arme zeigen nach unten: Ausrichtung 180° um Z.
  const B={},flip=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI),WQ={};
  const mk=(name,parent,pos,down)=>{const b=new THREE.Bone();b.name=name;WQ[name]=down?flip.clone():new THREE.Quaternion();B[name]={b,world:new THREE.Vector3(...pos),parent};return b};
  mk("Hips",null,[0,J.hip,0]);mk("Spine","Hips",[0,J.spine,0]);mk("Spine1","Spine",[0,J.spine1,0]);mk("Spine2","Spine1",[0,J.spine2,0]);
  mk("Neck","Spine2",[0,J.neck,0]);mk("Head","Neck",[0,J.head,0]);mk("HeadTop_End","Head",[0,Y(1),0]);
  for(const [s,sg] of [["Left",1],["Right",-1]]){
    mk(s+"UpLeg","Hips",[sg*legX,J.hip-.02*H,0],true);mk(s+"Leg",s+"UpLeg",[sg*legX,J.knee,0],true);mk(s+"Foot",s+"Leg",[sg*legX,J.ankle,0],true);mk(s+"ToeBase",s+"Foot",[sg*legX,Y(.012),.07*H],true);
    mk(s+"Arm","Spine2",[sg*armX*.92,J.shoulder,armZ],true);mk(s+"ForeArm",s+"Arm",[sg*armX,J.elbow,armZ],true);mk(s+"Hand",s+"ForeArm",[sg*armX,J.wrist,armZ],true)}
  for(const n in B){const o=B[n];if(!o.parent)continue;const P=B[o.parent];P.b.add(o.b)}
  for(const n in B){const o=B[n],pq=o.parent?WQ[o.parent]:new THREE.Quaternion(),pw=o.parent?B[o.parent].world:new THREE.Vector3();
    o.b.quaternion.copy(pq.clone().invert().multiply(WQ[n]));o.b.position.copy(o.world.clone().sub(pw).applyQuaternion(pq.clone().invert()))}
  const bones=Object.values(B).map(o=>o.b),idx={};bones.forEach((b,i)=>idx[b.name]=i);
  // Gewichte: jeder Punkt hängt an höchstens zwei Knochen, an Gelenken weich überblendet
  const bl=(a,b,lo,hi,v)=>{const t=Math.max(0,Math.min(1,(v-lo)/(hi-lo)));return [[a,1-t],[b,t]]};
  /* Gewichte mit Rücksicht auf das Material: T-Shirt und Hosenbund hängen am Rumpf, nicht an den Beinen (sonst verzieht sich
     das Shirt beim Gehen); breite, weiche Übergänge an Hüfte, Knie und Schulter */
  function weights(x,y,z,mat){const s=x>=0?"Left":"Right",e=.035*H,shirt=/shirt|rippbund/i.test(mat),arm=isArm(x,y);
    if(shirt&&!arm){if(y<J.spine)return [["Hips",1],["Spine",0]];}
    else if(y<J.crotch+.03*H&&!arm){
      if(y<J.ankle)return bl(s+"Foot",s+"Leg",J.ankle-e,J.ankle+e,y);
      if(y<J.knee+e)return bl(s+"Leg",s+"UpLeg",J.knee-e,J.knee+e,y);
      const t=Math.max(0,Math.min(1,(y-(J.crotch-.11*H))/(.14*H))),k=t*t*(3-2*t);return [[s+"UpLeg",1-k*.85],["Hips",k*.85]]}
    if(arm){
      if(y<J.wrist+e*.6)return bl(s+"Hand",s+"ForeArm",J.wrist-e,J.wrist+e,y);
      if(y<J.elbow+e)return bl(s+"ForeArm",s+"Arm",J.elbow-e,J.elbow+e,y);
      const t=Math.max(0,Math.min(1,(y-(J.shoulder-.09*H))/(.11*H))),k=t*t*(3-2*t);return [[s+"Arm",1-k*.6],["Spine2",k*.6]]}
    if(y<J.spine)return bl("Hips","Spine",J.hip,J.spine,y);
    if(y<J.spine1)return bl("Spine","Spine1",J.spine,J.spine1,y);
    if(y<J.spine2)return bl("Spine1","Spine2",J.spine1,J.spine2,y);
    if(y<J.neck)return bl("Spine2","Neck",J.spine2+.03*H,J.neck,y);
    return bl("Neck","Head",J.neck,J.head+.01*H,y)}
  const out=new THREE.Group();out.name=root.name||"Figur";out.add(B.Hips.b);
  const skeleton=new THREE.Skeleton(bones);
  parts.forEach((m,k)=>{const g=geos[k],p=g.attributes.position,n=p.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4);
    for(let i=0;i<n;i++){const w=weights(p.getX(i),p.getY(i),p.getZ(i),m.material.name||"");for(let j=0;j<2;j++){si[i*4+j]=idx[w[j][0]]||0;sw[i*4+j]=w[j][1]}}
    g.setAttribute("skinIndex",new THREE.Uint16BufferAttribute(si,4));g.setAttribute("skinWeight",new THREE.Float32BufferAttribute(sw,4));
    const mat=m.material.clone();mat.skinning=true;mat.name=m.material.name;const sm=new THREE.SkinnedMesh(g,mat);sm.name=m.name;sm.castShadow=true;out.add(sm)});
  out.updateMatrixWorld(true);skeleton.calculateInverses();   /* Ruhelage erst berechnen, wenn alle Knochen an ihrem Platz sind */
  out.traverse(o=>{if(o.isSkinnedMesh)o.bind(skeleton,new THREE.Matrix4())});
  // Animationen erzeugen
  const base={};for(const b of bones)base[b.name]=b.quaternion.clone();const hp=B.Hips.b.position.clone();
  const qx=new THREE.Quaternion(),X=new THREE.Vector3(1,0,0);
  function clip(name,T,fn){const N=24,times=[],tr={};for(let i=0;i<=N;i++){const t=T*i/N;times.push(t);const ph=2*Math.PI*i/N,o=fn(ph);
      for(const k in o){if(k==="bob")continue;(tr[k]=tr[k]||[]).push(...base[k].clone().multiply(qx.setFromAxisAngle(X,o[k])).toArray())}
      (tr.__pos=tr.__pos||[]).push(hp.x,hp.y+(o.bob||0),hp.z)}
    const tracks=[];for(const k in tr){if(k==="__pos")tracks.push(new THREE.VectorKeyframeTrack("Hips.position",times,tr[k]));else tracks.push(new THREE.QuaternionKeyframeTrack(k+".quaternion",times,tr[k]))}
    return new THREE.AnimationClip(name,T,tracks)}
  const sw=(ph,o=0)=>Math.sin(ph+o),pos=v=>Math.max(0,v);
  const walk=clip("Walk",1.05,ph=>({LeftUpLeg:.34*sw(ph),RightUpLeg:.34*sw(ph,Math.PI),LeftLeg:-(.05+.55*pos(Math.cos(ph))),RightLeg:-(.05+.55*pos(Math.cos(ph+Math.PI))),
    LeftFoot:.12*sw(ph,.6),RightFoot:.12*sw(ph,Math.PI+.6),LeftArm:-.3*sw(ph),RightArm:-.3*sw(ph,Math.PI),LeftForeArm:.25,RightForeArm:.25,Spine:.04,Neck:-.03,bob:-.012+.02*Math.abs(Math.cos(ph))}));
  const run=clip("Run",.72,ph=>({LeftUpLeg:.12+.6*sw(ph),RightUpLeg:.12+.6*sw(ph,Math.PI),LeftLeg:-(.22+1.0*pos(Math.cos(ph))),RightLeg:-(.22+1.0*pos(Math.cos(ph+Math.PI))),
    LeftFoot:.2*sw(ph,.6),RightFoot:.2*sw(ph,Math.PI+.6),LeftArm:-.55*sw(ph),RightArm:-.55*sw(ph,Math.PI),LeftForeArm:1.05,RightForeArm:1.05,Spine:.12,Spine1:.04,Neck:-.12,bob:-.03+.05*Math.abs(Math.cos(ph))}));
  const idle=clip("Idle",3.2,ph=>({Spine:.015*sw(ph),Spine1:.01*sw(ph),Neck:-.02*sw(ph),LeftArm:.025*sw(ph,.5),RightArm:.025*sw(ph,.5),LeftForeArm:.08,RightForeArm:.08,bob:.004*sw(ph)}));
  return {scene:out,animations:[idle,walk,run]}}

/* ================= Besser: Skelett, Gewichte und Bewegungen von einer fertigen Figur übernehmen =================
   Wie bei den anderen Figuren: Herr Dittmann bekommt das Skelett und die Animationen (Idle, Walk, Run) der Passant-Figur.
   1. Die Spenderfigur wird in die Idle-Haltung gebracht (Arme hängen, wie beim Modell von Herrn Dittmann) und auf seine Größe skaliert.
   2. Jeder Punkt des Dittmann-Modells übernimmt die Knochengewichte des nächstgelegenen Punkts der Spenderfigur.
   3. Diese Haltung ist die Ruhelage; die Animationen der Spenderfigur bewegen ihn dann genauso wie die anderen Figuren. */
function armClassifier(geos){let H=0,minY=1e9;for(const g of geos){const p=g.attributes.position;for(let i=0;i<p.count;i++){H=Math.max(H,p.getY(i));minY=Math.min(minY,p.getY(i))}}
  H-=minY;const Y=f=>minY+f*H,SL=60,y0=Y(.42),y1=Y(.80),bins=[];for(let s=0;s<SL;s++)bins.push([]);
  for(const g of geos){const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<y0||y>y1)continue;bins[Math.min(SL-1,Math.floor((y-y0)/(y1-y0)*SL))].push(Math.abs(p.getX(i)))}}
  const gap=bins.map(b=>{if(b.length<20)return null;b.sort((a,c)=>a-c);let best=0,at=null;for(let k=1;k<b.length;k++){const x=b[k-1];if(x<.04*H||x>.2*H)continue;const d=b[k]-b[k-1];if(d>best){best=d;at=(b[k]+b[k-1])/2}}return best>.006*H?at:null});
  let last=null;for(let s=0;s<SL;s++){if(gap[s]!=null)last=gap[s];else gap[s]=last}last=null;for(let s=SL-1;s>=0;s--){if(gap[s]!=null)last=gap[s];else gap[s]=last}
  const gapAt=y=>gap[Math.max(0,Math.min(SL-1,Math.floor((y-y0)/(y1-y0)*SL)))]||.12*H;
  return (x,y)=>y>Y(.40)&&y<Y(.83)&&Math.abs(x)>gapAt(Math.min(y,y1))}
function rigFromDonor(gltf,D){
  const root=gltf.scene;root.updateMatrixWorld(true);
  const parts=[];root.traverse(o=>{if(o.isMesh)parts.push(o)});
  const geos=parts.map(m=>{const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);return g});
  const tb=new THREE.Box3();for(const g of geos){g.computeBoundingBox();tb.union(g.boundingBox)}
  // Spender klonen, in Idle-Haltung bringen
  const don=THREE.SkeletonUtils.clone(D.scene),mx=new THREE.AnimationMixer(don);if(D.clips.idle){mx.clipAction(D.clips.idle).play();mx.update(0)}
  don.updateMatrixWorld(true);const dms=[];don.traverse(o=>{if(o.isSkinnedMesh)dms.push(o)});
  // gehäutete Punkte des Spenders (Weltlage) mit ihren Gewichten
  const pts=[],v=new THREE.Vector3();const db=new THREE.Box3();
  for(const m of dms){m.skeleton.update();const p=m.geometry.attributes.position,si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight;
    for(let i=0;i<p.count;i++){m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);db.expandByPoint(v);
      pts.push([v.x,v.y,v.z,m.skeleton.bones[si.getX(i)].name,sw.getX(i),m.skeleton.bones[si.getY(i)].name,sw.getY(i),m.skeleton.bones[si.getZ(i)].name,sw.getZ(i),m.skeleton.bones[si.getW(i)].name,sw.getW(i)])}}
  // auf die Größe von Herrn Dittmann bringen (Füße auf gleicher Höhe, gleiche Mitte)
  const s=(tb.max.y-tb.min.y)/(db.max.y-db.min.y),dc=db.getCenter(new THREE.Vector3()),tc=tb.getCenter(new THREE.Vector3());
  don.scale.multiplyScalar(s);don.position.set(tc.x-dc.x*s,tb.min.y-db.min.y*s,tc.z-dc.z*s);don.updateMatrixWorld(true);
  for(const q of pts){q[0]=tc.x+(q[0]-dc.x)*s;q[1]=tb.min.y+(q[1]-db.min.y)*s;q[2]=tc.z+(q[2]-dc.z)*s}
  // Raster für die Suche nach dem nächsten Spenderpunkt
  /* Bereiche getrennt halten: Punkte am Arm von Herrn Dittmann bekommen nur Gewichte vom Arm der Spenderfigur (gleiche Seite),
     alle übrigen Punkte nur vom Rumpf, Kopf und den Beinen. Sonst hingen z. B. seine Hände an der Hüfte des Spenders. */
  const ARM=/^(Left|Right)(Shoulder|Arm|ForeArm|Hand)/,area=q=>{const m=ARM.exec(q[3]);return m?m[1][0]:"B"};
  const isArmD=armClassifier(geos),C=.04,grids={L:new Map(),R:new Map(),B:new Map()},key=(x,y,z)=>`${Math.floor(x/C)},${Math.floor(y/C)},${Math.floor(z/C)}`;
  for(const q of pts){const G=grids[area(q)],k=key(q[0],q[1],q[2]);(G.get(k)||G.set(k,[]).get(k)).push(q)}
  let grid=grids.B;
  function nearest(x,y,z){for(let r=0;r<12;r++){let best=null,bd=1e9;const cx=Math.floor(x/C),cy=Math.floor(y/C),cz=Math.floor(z/C);
      for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++)for(let k=-r;k<=r;k++){if(Math.max(Math.abs(i),Math.abs(j),Math.abs(k))!==r)continue;const L=grid.get(`${cx+i},${cy+j},${cz+k}`);if(!L)continue;
        for(const q of L){const d=(q[0]-x)**2+(q[1]-y)**2+(q[2]-z)**2;if(d<bd){bd=d;best=q}}}
      if(best&&Math.sqrt(bd)<(r+1)*C)return best}let best=null,bd=1e9;for(const L of grid.values())for(const q of L){const d=(q[0]-x)**2+(q[1]-y)**2+(q[2]-z)**2;if(d<bd){bd=d;best=q}}return best||pts[0]}
  // Knochenliste des geklonten Spenders
  const bones=[];don.traverse(o=>{if(o.isBone)bones.push(o)});const idx={};bones.forEach((b,i)=>idx[b.name]=i);
  for(const m of dms)m.parent.remove(m);
  const out=new THREE.Group();out.name="Dittmann";out.add(don);out.updateMatrixWorld(true);
  const skeleton=new THREE.Skeleton(bones);skeleton.calculateInverses();
  parts.forEach((m,k)=>{const g=geos[k],p=g.attributes.position,n=p.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4),noArm=/jeans|hose|sneaker|schn|zwischensohle|cap|haar|augen|iris|lippen|mund/i.test(m.material.name||"");   /* Hose, Schuhe und Kopf gehören nie zum Arm */
    for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i);grid=!noArm&&isArmD(x,y)?(x>=0?grids.L:grids.R):grids.B;if(!grid.size)grid=grids.B;const q=nearest(x,y,p.getZ(i));for(let j=0;j<4;j++){si[i*4+j]=idx[q[3+2*j]]||0;sw[i*4+j]=q[4+2*j]}}
    g.setAttribute("skinIndex",new THREE.Uint16BufferAttribute(si,4));g.setAttribute("skinWeight",new THREE.Float32BufferAttribute(sw,4));
    const mat=m.material.clone();mat.skinning=true;mat.name=m.material.name;const sm=new THREE.SkinnedMesh(g,mat);sm.name=m.name;sm.castShadow=true;sm.frustumCulled=false;out.add(sm)});
  out.updateMatrixWorld(true);out.traverse(o=>{if(o.isSkinnedMesh)o.bind(skeleton,new THREE.Matrix4())});
  mx.stopAllAction();
  const anims=Object.entries(D.clips).map(([k,c])=>{const cl=c.clone();cl.name=k[0].toUpperCase()+k.slice(1);return cl});
  return {scene:out,animations:anims}}
