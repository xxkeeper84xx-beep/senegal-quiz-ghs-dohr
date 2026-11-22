"""Grafik-Umbau: Eingriffe in die Engine (Licht, Himmel, Dächer, Kamera, Marker, Beläge). Aufruf: python3 tools/grafik_patch.py sk2/game.html"""
import sys
P=sys.argv[1];s=open(P,encoding="utf-8").read()
def R(old,new,n=1):
    global s
    c=s.count(old)
    if c!=n: raise SystemExit(f"grafik_patch: {c}× statt {n}×: {old[:80]}")
    s=s.replace(old,new)
R('antialias:!isTouch','antialias:true')
R('const SKY_DAY=new THREE.Color("#d5e6f3")','const SKY_DAY=new THREE.Color("#e9dccb")')
R('top=new THREE.Color("#4f8fd0"),hor=new THREE.Color("#d5e6f3")','top=new THREE.Color("#6a9bd8"),hor=new THREE.Color("#f0d9bd")')
R('scene.background.copy(tmpC); scene.fog.color.copy(tmpC);','scene.background.copy(tmpC); scene.fog.color.copy(tmpC).lerp(GFX_HAZE,(1-dk)*.6);')
R('scene.fog.far=VH.fly?1900:1000; scene.fog.near=VH.fly?500:140;','scene.fog.far=VH.fly?1900:GFX.fogF; scene.fog.near=VH.fly?500:GFX.fogN;')
R('sun.intensity=1.45; hemi.intensity=.62;\n  sun.color.setRGB(1,.95-du*.25,.86-du*.4);','gfxLight(dk,du);')
R('sun.position.set(car.x+95,165,car.y+105);','sun.position.set(car.x+GFX_SUN[0],GFX_SUN[1],car.y+GFX_SUN[2]);')
# Häuser: Satteldach statt Flachdach, Sockel und Traufkante
R('const A=polyArea(p), ccw=A>0; let u=0;','const A=polyArea(p), ccw=A>0; let u=0;const GB=gfxGable(p,h,m,kind,t);if(GB)h=GB.eave;')
R('if(kind!=="fence")addFlat(gRoof,p,h,kind==="hedge"?col:roofCol,4);','if(GB)gfxGableRoof(G,gRoof,GB,col,roofCol);else if(kind!=="fence")addFlat(gRoof,p,h,kind==="hedge"?col:roofCol,4);gfxBands(p,h,m,kind,ck,ccw,!GB);gfxRecord(p,h,m,kind,ccw,GB,t);')
# Beläge: Gehweg nicht mehr fast weiß, Bordstein dunkler (sichtbare Kante)
R('gSide.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xf4f2ec,','gSide.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xd3ccbe,')
R('gCurb.mesh(new THREE.MeshLambertMaterial({color:0xb9b6ad,','gCurb.mesh(new THREE.MeshLambertMaterial({color:0x96938c,')
R('gPath.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xe9e2d2})','gPath.mesh(new THREE.MeshLambertMaterial({map:texPave,color:0xcfc6b4})')
# Kamera: weiter hinten, mehr Straße vor Noah; Hochformat mit größerem Blickwinkel; ruhigere Drehung
R('VH.id==="walk"?{dist:6.6,pitch:.46,th:1.3,look:1.5}','VH.id==="walk"?(gfxPortrait()?{dist:7.8,pitch:.34,th:1.5,look:3.4}:{dist:7.2,pitch:.36,th:1.45,look:2.8})')
R('const fov=54+sp*9+','const fov=(gfxPortrait()?66:56)+sp*9+')
R('camYaw+=da*Math.min(1,dt*(Math.abs(car.v)>1.2?3:.9));','camYaw+=da*Math.min(1,dt*(Math.abs(car.v)>1.2?2.2:.8));')
# Missionsmarker kleiner
R('new THREE.CylinderGeometry(2.2,2.2,40,28,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,','new THREE.CylinderGeometry(1.3,1.3,40,28,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.16,')
R('new THREE.RingGeometry(2.1,2.9,40)','new THREE.RingGeometry(1.2,1.7,40)')
R('sp.scale.set(4.2,4.2,1);sp.position.y=7;','sp.scale.set(2.8,2.8,1);sp.position.y=5.4;')
R('ls.scale.set(14,2.6,1);ls.position.y=10.5;','ls.scale.set(9.5,1.75,1);ls.position.y=7.6;')
R('(VH.fly?16:7)+bob','(VH.fly?16:5.4)+bob',2)
R('g.mesh.userData.ls.position.y=VH.fly?24:10.5','g.mesh.userData.ls.position.y=VH.fly?24:7.6')
R('targetMesh.userData.ls.position.y=VH.fly?24:10.5','targetMesh.userData.ls.position.y=VH.fly?24:7.6')
R('new THREE.OctahedronGeometry(.42,0)','new THREE.OctahedronGeometry(.27,0)')
open(P,"w",encoding="utf-8").write(s);print("grafik_patch ok")
