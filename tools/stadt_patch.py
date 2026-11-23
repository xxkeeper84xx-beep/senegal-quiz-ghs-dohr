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
open(P,"w",encoding="utf-8").write(s);print("stadt_patch ok")
