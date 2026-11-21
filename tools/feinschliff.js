/* ================= Feinschliff: Boden ohne Flackern, Räder auf dem Boden, Autotür beim Ein- und Aussteigen ================= */

/* 1) Bodenschichten: Boden, Plätze, Wiesen, Wald, Sportplätze, Wasser, Wege, Fahrbahn und Markierungen lagen teils auf gleicher Höhe
      (z. B. Boden und Plätze) oder nur 5–10 mm auseinander. Das ergab bei Bewegung Flackern (Z-Fighting).
      Jede Schicht bekommt jetzt eine eigene, feste Tiefenverschiebung; gleiche Flächentypen liegen in einem gemeinsamen Netz. */
{const base=buildCity;buildCity=function(){const n0=scene.children.length;base();
  const flats=scene.children.slice(n0).filter(o=>o.isMesh&&o.renderOrder<0&&o.renderOrder>=-6);
  const areaY=[...new Set(flats.filter(o=>o.renderOrder===-5).map(o=>{o.geometry.computeBoundingBox();return +o.geometry.boundingBox.min.y.toFixed(3)}))].sort((a,b)=>a-b);
  for(const o of flats){let k=(o.renderOrder+6)*3;            // Boden 0, Flächen 3…, Wege 6, Gehweg 9, Fahrbahn 12, Markierung 15
    if(o.renderOrder===-5){const y=+o.geometry.boundingBox.min.y.toFixed(3);k+=Math.min(2,areaY.indexOf(y))*.9+(o.material.map===texCobble?0:.4)}
    const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){m.polygonOffset=true;m.polygonOffsetFactor=-k*.6;m.polygonOffsetUnits=-k*2;m.needsUpdate=true}}}}

/* 2) Schatten: die Schattenkamera folgt der Spielfigur; ohne Einrasten verschieben sich die Schattenpixel bei jeder Bewegung
      und Kanten auf Gehwegplatten und Rasen „flimmern“. Jetzt rastet sie auf das Raster der Schattenkarte ein. */
const _sm=new THREE.Matrix4(),_si=new THREE.Matrix4(),_sv=new THREE.Vector3(),_sup=new THREE.Vector3(0,1,0);
function snapShadow(){const cam=sun.shadow.camera,size=(cam.right-cam.left),tex=size/sun.shadow.mapSize.x;
  const off=_sv.copy(sun.position).sub(sun.target.position);
  _sm.lookAt(new THREE.Vector3(),off.clone().negate(),_sup);_si.copy(_sm).invert();
  const t=sun.target.position.clone().applyMatrix4(_si);t.x=Math.round(t.x/tex)*tex;t.y=Math.round(t.y/tex)*tex;t.applyMatrix4(_sm);
  sun.target.position.copy(t);sun.position.copy(t).add(off);sun.target.updateMatrixWorld()}
{const base=updateCamera;updateCamera=function(dt,VH){snapShadow();base(dt,VH)}}

/* 3) Fahrzeuge auf dem Boden: Höhe vorn und hinten getrennt (Bordstein, Gehweg, Fahrbahn haben unterschiedliche Höhen).
      Vorher zählte nur die Fahrzeugmitte, dadurch steckte z. B. das Vorderrad des Fahrrads im Gehweg. */
const AXLE={scoot:.5,bike:.57,moped:.71,auto:1.29,smart:.9,van:1.5,prius:1.35,aston:1.4,maser:1.45};
function groundContact(){const VH=V();if(VH.fly||VH.id==="walk")return;const g=vehMeshes[VH.id];if(!g)return;const h=AXLE[VH.id]||1.2,c=Math.cos(car.a),s=Math.sin(car.a);
  const yf=groundY(car.x+c*h,car.y+s*h),yb=groundY(car.x-c*h,car.y-s*h),ym=groundY(car.x,car.y);
  g.position.y=Math.max((yf+yb)/2,ym-.02);g.rotation.z=Math.atan2(yf-yb,2*h)}
{const base=updateCamera;updateCamera=function(dt,VH){groundContact();base(dt,VH)}}

/* 4) Autotür: Die Automodelle haben keine eigene Tür. Beim Ein- und Aussteigen schwenkt an der Fahrerseite eine Tür in Wagenfarbe
      (mit Fenster) am vorderen Türscharnier auf und wieder zu. Sie ist nur während des Ein-/Aussteigens zu sehen. */
function bodyBox(g){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),box=new THREE.Box3(),tmp=new THREE.Box3();let any=false;
  g.traverse(o=>{if(!o.isMesh||!o.geometry)return;const m=o.material;if(g.userData.paint&&m!==g.userData.paint)return;o.geometry.computeBoundingBox();
    tmp.copy(o.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));box.union(tmp);any=true});
  if(!any)box.setFromObject(g).applyMatrix4(inv);return box}
function carDoor(g,side){const key="door"+side;if(g.userData[key])return g.userData[key];
  const b=bodyBox(g),len=b.max.x-b.min.x,L=Math.min(1.15,len*.26),hz=side>0?b.max.z+.015:b.min.z-.015,xF=b.max.x-len*.3,y0=b.min.y+.1,y1=b.min.y+(b.max.y-b.min.y)*.62,y2=b.max.y-.08;
  const piv=new THREE.Group();piv.position.set(xF,0,hz);
  const paint=g.userData.paint||new THREE.MeshLambertMaterial({color:0x5a6a7a});
  const panel=new THREE.Mesh(new THREE.BoxGeometry(L,y1-y0,.05),paint);panel.position.set(-L/2,(y0+y1)/2,side*.025);panel.castShadow=true;piv.add(panel);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(L*.86,y2-y1,.02),new THREE.MeshPhongMaterial({color:0x223344,transparent:true,opacity:.55,shininess:90}));glass.position.set(-L*.5,(y1+y2)/2,side*.02);piv.add(glass);
  const frame=new THREE.Mesh(new THREE.BoxGeometry(L*.9,.04,.04),new THREE.MeshLambertMaterial({color:0x222222}));frame.position.set(-L*.47,y2,side*.02);piv.add(frame);
  const handle=new THREE.Mesh(new THREE.BoxGeometry(.16,.03,.03),new THREE.MeshLambertMaterial({color:0xc8c8c8}));handle.position.set(-L*.8,y1-.12,side*.06);piv.add(handle);
  piv.visible=false;(g.userData.body||g).add(piv);g.userData[key]=piv;return piv}
function doorAngle(){if(!TR.on||(TR.kind!=="enter"&&TR.kind!=="exit"))return 0;const t=TR.t;
  if(TR.kind==="enter"){const o=TR.tw;return t<o?0:t<o+.3?ease((t-o)/.3):t<TR.dur-.3?1:1-ease((t-(TR.dur-.3))/.3)}
  return t<.3?ease(t/.3):t<1.0?1:t<1.3?1-ease((t-1.0)/.3):0}
function doorUpdate(){for(const id in vehMeshes){const g=vehMeshes[id];if(!g||!g.userData)continue;for(const s of [1,-1]){const d=g.userData["door"+s];if(d)d.visible=false}}
  if(!TR.on||(TR.kind!=="enter"&&TR.kind!=="exit")||VEH[TR.l.id].fly)return;const g=vehMeshes[TR.l.id];if(!g)return;
  const d=carDoor(g,TR.side),a=doorAngle();d.visible=a>.01;d.rotation.y=TR.side*a*1.15}
{const base=updateCamera;updateCamera=function(dt,VH){base(dt,VH);doorUpdate()}}

/* 5) Beläge ohne Fugenraster: Gehwegplatten (texPave) und Pflaster (texCobble) hatten ein feines Raster aus dunklen Fugen.
      In der Entfernung und im flachen Blickwinkel flimmerte es (Moiré). Jetzt: heller, fugenloser Beton für Gehwege, Wege
      und Boden; sandfarbener, feinkörniger Belag für Plätze und Fußgängerzonen. */
function redraw(tex,draw){const c=tex.image,g=c.getContext("2d");g.clearRect(0,0,c.width,c.height);draw(g,c.width,c.height);tex.needsUpdate=true}
function blotches(g,w,h,n,a){for(let i=0;i<n;i++){const l=Math.random()<.5;g.fillStyle=l?`rgba(255,252,244,${a})`:`rgba(40,36,30,${a})`;g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,w*(.08+Math.random()*.2),h*(.06+Math.random()*.16),Math.random()*3,0,7);g.fill()}}
redraw(texPave,(g,w,h)=>{g.fillStyle="#b8b4aa";g.fillRect(0,0,w,h);blotches(g,w,h,14,.035);noise(g,w,h,26000,["rgba(0,0,0,.05)","rgba(255,255,255,.07)","rgba(110,100,80,.05)"],2)});
redraw(texCobble,(g,w,h)=>{g.fillStyle="#b9ad98";g.fillRect(0,0,w,h);blotches(g,w,h,8,.03);noise(g,w,h,9000,["rgba(0,0,0,.07)","rgba(255,255,255,.08)","rgba(120,95,60,.06)"],1.5)});
