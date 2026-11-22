"""Engine auf verschiebbare Gebiete umstellen (ganz Mönchengladbach, ein Gebiet zur Zeit geladen).

Aufruf:  python3 tools/gebiete_patch.py sk2/game.html
- Kollisionsraster, Straßenraster, Minikarte, Stadtkarte und Boden liegen um die Gebietsmitte (RX, RY) statt um (0, 0).
- Kartendaten werden beim Laden gewählt: Gebietswechsel übergibt Gebiet und Position in der Adresse (#go=…).
"""
import sys
P = sys.argv[1]
s = open(P, encoding="utf-8").read()


def R(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        raise SystemExit(f"gebiete_patch: {c}× statt {n}× gefunden: {old[:70]}")
    s = s.replace(old, new)


R('const HX=MG.half[0], HY=MG.half[1];', 'const HX=MG.half[0], HY=MG.half[1], RX=(MG.center||[0,0])[0], RY=(MG.center||[0,0])[1];')
R('Math.floor((x+HX)/SG)', 'Math.floor((x-RX+HX)/SG)')
R('Math.floor((y+HY)/SG)', 'Math.floor((y-RY+HY)/SG)')
R('g.moveTo(p[0]+HX,p[1]+HY);for(let i=2;i<p.length;i+=2)g.lineTo(p[i]+HX,p[i+1]+HY)', 'g.moveTo(p[0]-RX+HX,p[1]-RY+HY);for(let i=2;i<p.length;i+=2)g.lineTo(p[i]-RX+HX,p[i+1]-RY+HY)')
R('const x=nx(n)+HX,y=ny(n)+HY;', 'const x=nx(n)-RX+HX,y=ny(n)-RY+HY;', 2)
R('const ix=Math.floor(x+HX),iy=Math.floor(y+HY);', 'const ix=Math.floor(x-RX+HX),iy=Math.floor(y-RY+HY);')
R('if(Math.abs(tx)<HX-60&&Math.abs(ty)<HY-60)opts.push(', 'if(Math.abs(tx-RX)<HX-60&&Math.abs(ty-RY)<HY-60&&phaseOK(tx,ty))opts.push(')
R('if(Math.abs(tx)<HX-40&&Math.abs(ty)<HY-40)opts.push(', 'if(Math.abs(tx-RX)<HX-40&&Math.abs(ty-RY)<HY-40&&phaseOK(tx,ty))opts.push(')
R('if(Math.abs(px)>HX-5||Math.abs(py)>HY-5)return true;', 'if(Math.abs(px-RX)>HX-5||Math.abs(py-RY)>HY-5||!phaseOK(px,py))return true;')
R('ground.position.y=BASE_Y-.03;', 'ground.position.y=BASE_Y-.03;ground.position.x=RX;ground.position.z=RY;')
R('far.rotation.x=-Math.PI/2;far.position.y=-.3;', 'far.rotation.x=-Math.PI/2;far.position.set(RX,-.3,RY);')
R('c.scale(MMS,MMS);c.translate(HX,HY);', 'c.scale(MMS,MMS);c.translate(HX-RX,HY-RY);')
R('c.fillRect(-HX,-HY,2*HX,2*HY);', 'c.fillRect(RX-HX,RY-HY,2*HX,2*HY);')
R('mctx.drawImage(mmBase,-(car.x+HX)*MMS,-(car.y+HY)*MMS)', 'mctx.drawImage(mmBase,-(car.x-RX+HX)*MMS,-(car.y-RY+HY)*MMS)')
R('const P=(x,y)=>[(x+HX)*k,(y+HY)*k];', 'const P=(x,y)=>[(x-RX+HX)*k,(y-RY+HY)*k];')
R('if(Math.abs(tx)>HX-30||Math.abs(ty)>HY-30)continue;', 'if(Math.abs(tx-RX)>HX-30||Math.abs(ty-RY)>HY-30||!phaseOK(tx,ty))continue;')
R('if(Math.abs(tx)>HX-30||Math.abs(ty)>HY-30)return null;', 'if(Math.abs(tx-RX)>HX-30||Math.abs(ty-RY)>HY-30||!phaseOK(tx,ty))return null;')
# Kartendaten je nach Gebiet laden (Übergabe in der Adresse, damit es auch ohne Browserspeicher geht)
R('<script src="mg-echt.js"></script>',
  '<script src="gebiete/index.js"></script>\n'
  '<script>(function(){var r="rheydt";try{var m=/[#&]go=([^&]*)/.exec(location.hash);if(m){var h=JSON.parse(decodeURIComponent(m[1]));if(h&&/^g_-?\\d+_-?\\d+$/.test(h.region))r=h.region;window.__GO=h}}catch(e){}'
  'document.write(\'<script src="\'+(r==="rheydt"?"mg-echt.js":"gebiete/"+r+".js")+\'"><\\/script>\')})()</script>')
open(P, "w", encoding="utf-8").write(s)
print("gebiete_patch ok")
