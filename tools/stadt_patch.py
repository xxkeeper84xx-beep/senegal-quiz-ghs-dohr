"""Ganze Stadt, Stufe 1: Gebäude für vorab berechnete Schatten merken, Wahrzeichen statt Kartengebäude. Aufruf: python3 tools/stadt_patch.py sk2/game.html"""
import sys
P=sys.argv[1];s=open(P,encoding="utf-8").read()
def R(old,new,n=1):
    global s
    c=s.count(old)
    if c!=n: raise SystemExit(f"stadt_patch: {c}× statt {n}×: {old[:80]}")
    s=s.replace(old,new)
R('const p=b.p.slice(); const n=p.length/2; if(n<3)continue;','const p=b.p.slice(); const n=p.length/2; if(n<3)continue;if(typeof wzSkip==="function"&&wzSkip(b))continue;')
R('const GB=gfxGable(p,h,m,kind,t);if(GB)h=GB.eave;','const GB=gfxGable(p,h,m,kind,t);if(GB)h=GB.eave;if(typeof stadtRec==="function")stadtRec(p,GB&&GB.ridge?GB.ridge:h,m,kind);')
R('const hh=h01(t.x*3.1+t.y*7.7),th=2.1+hh*1.7,','const hh=h01(t.x*3.1+t.y*7.7),th=t.th||2.1+hh*1.7,')
R('ob.scale.set(.9+hh*.6,th,.9+hh*.6);ob.rotation.set((hh-.5)*.08,hh*6,(hh-.5)*.08);','ob.scale.set((t.tw||1)*(.9+hh*.6),th,(t.tw||1)*(.9+hh*.6));ob.rotation.set((hh-.5)*.08,hh*6,(hh-.5)*.08);')
# Kellerabgang am Erweiterungsbau: Brüstung mit Geländer am Südende offen (Treppe nach unten in stadt.js); Quelle tools/school.js entsprechend
R('for(let z=z0+.6;z<z1-.4;z+=.13)box("white",x1+1.0,B0+.75,z,.03,.9,.03);box("white",x1+1.0,B0+1.2,(z0+z1)/2,.06,.05,z1-z0-.8);box("brickRed",x1+1.0,B0+.15,(z0+z1)/2,.25,.3,z1-z0-.6);',
  'for(let z=z0+.6;z<z1-1.6;z+=.13)box("white",x1+1.0,B0+.75,z,.03,.9,.03);box("white",x1+1.0,B0+1.2,(z0+.6+z1-1.6)/2,.06,.05,z1-1.6-z0-.6);box("brickRed",x1+1.0,B0+.15,(z0+.3+z1-1.6)/2,.25,.3,z1-1.6-z0-.3);box("white",x1+1.0,B0+.75,z1-1.62,.05,1.0,.05);')
# Fußwege durch Gebäude an der Schule vor dem Aufbau des Wegenetzes entfernen
R('const NXY=MG.nodes, roads=MG.roads;','if(typeof stadtRoadsFilter==="function")stadtRoadsFilter();const NXY=MG.nodes, roads=MG.roads;')
open(P,"w",encoding="utf-8").write(s);print("stadt_patch ok")
