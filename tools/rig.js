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
  function weights(x,y,z){const s=x>=0?"Left":"Right",e=.025*H;
    if(y<J.crotch+.02*H&&!isArm(x,y)){
      if(y<J.ankle)return bl(s+"Foot",s+"Leg",J.ankle-e,J.ankle+e,y);
      if(y<J.knee+e)return bl(s+"Leg",s+"UpLeg",J.knee-e,J.knee+e,y);
      return bl(s+"UpLeg","Hips",J.crotch-.04*H,J.crotch+.02*H,y)}
    if(isArm(x,y)){
      if(y<J.wrist+e*.6)return bl(s+"Hand",s+"ForeArm",J.wrist-e,J.wrist+e,y);
      if(y<J.elbow+e)return bl(s+"ForeArm",s+"Arm",J.elbow-e,J.elbow+e,y);
      const k=Math.max(0,Math.min(1,(y-(J.shoulder-.04*H))/(.07*H)));return [[s+"Arm",1-k*.5],["Spine2",k*.5]]}
    if(y<J.spine)return bl("Hips","Spine",J.hip,J.spine,y);
    if(y<J.spine1)return bl("Spine","Spine1",J.spine,J.spine1,y);
    if(y<J.spine2)return bl("Spine1","Spine2",J.spine1,J.spine2,y);
    if(y<J.neck)return bl("Spine2","Neck",J.spine2+.03*H,J.neck,y);
    return bl("Neck","Head",J.neck,J.head+.01*H,y)}
  const out=new THREE.Group();out.name=root.name||"Figur";out.add(B.Hips.b);
  const skeleton=new THREE.Skeleton(bones);
  parts.forEach((m,k)=>{const g=geos[k],p=g.attributes.position,n=p.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4);
    for(let i=0;i<n;i++){const w=weights(p.getX(i),p.getY(i),p.getZ(i));for(let j=0;j<2;j++){si[i*4+j]=idx[w[j][0]]||0;sw[i*4+j]=w[j][1]}}
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
  const walk=clip("Walk",1.05,ph=>({LeftUpLeg:.42*sw(ph),RightUpLeg:.42*sw(ph,Math.PI),LeftLeg:-(.06+.62*pos(Math.cos(ph))),RightLeg:-(.06+.62*pos(Math.cos(ph+Math.PI))),
    LeftFoot:.12*sw(ph,.6),RightFoot:.12*sw(ph,Math.PI+.6),LeftArm:-.3*sw(ph),RightArm:-.3*sw(ph,Math.PI),LeftForeArm:.25,RightForeArm:.25,Spine:.04,Neck:-.03,bob:-.012+.02*Math.abs(Math.cos(ph))}));
  const run=clip("Run",.72,ph=>({LeftUpLeg:.15+.75*sw(ph),RightUpLeg:.15+.75*sw(ph,Math.PI),LeftLeg:-(.25+1.15*pos(Math.cos(ph))),RightLeg:-(.25+1.15*pos(Math.cos(ph+Math.PI))),
    LeftFoot:.2*sw(ph,.6),RightFoot:.2*sw(ph,Math.PI+.6),LeftArm:-.7*sw(ph),RightArm:-.7*sw(ph,Math.PI),LeftForeArm:1.15,RightForeArm:1.15,Spine:.16,Spine1:.04,Neck:-.12,bob:-.03+.05*Math.abs(Math.cos(ph))}));
  const idle=clip("Idle",3.2,ph=>({Spine:.015*sw(ph),Spine1:.01*sw(ph),Neck:-.02*sw(ph),LeftArm:.025*sw(ph,.5),RightArm:.025*sw(ph,.5),LeftForeArm:.08,RightForeArm:.08,bob:.004*sw(ph)}));
  return {scene:out,animations:[idle,walk,run]}}
