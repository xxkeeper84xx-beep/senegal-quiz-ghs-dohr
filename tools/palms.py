# Erzeugt tools/theme2.css: Palmen-Silhouetten (eigene Zeichnung) als Daten-URIs + Menü-Feinschliff
import urllib.parse, sys
def palm(fill, flip=False, op=1):
    tr = ' transform="translate(220 0) scale(-1 1)"' if flip else ''
    paths = ["M92 400 C96 300 104 210 118 122 L127 124 C114 210 108 300 109 400 Z",
      "M122 120 C90 96 52 98 14 126 C54 108 88 110 122 127 Z","M122 120 C150 92 186 92 212 118 C182 104 152 108 124 127 Z",
      "M122 118 C108 80 80 58 46 50 C80 70 100 94 118 123 Z","M122 118 C138 78 166 56 198 52 C168 70 142 94 126 123 Z",
      "M120 122 C88 128 58 152 40 192 C66 158 94 140 122 129 Z","M124 122 C158 130 182 156 194 196 C172 162 148 142 122 129 Z",
      "M122 117 C124 86 128 60 140 34 C132 64 130 90 126 120 Z"]
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 400"><g fill="{fill}" fill-opacity="{op}"{tr}>' + "".join(f'<path d="{d}"/>' for d in paths) + '</g></svg>'
    return 'url("data:image/svg+xml,' + urllib.parse.quote(svg, safe=' /=:"') .replace('"',"'") + '")'
P1 = palm("#12061f", op=.85); P2 = palm("#12061f", True, .85); P3 = palm("#1a0b2e", op=.7)
Q1 = palm("#12061f", op=.5); Q2 = palm("#12061f", True, .5); Q3 = palm("#1a0b2e", op=.4)
css = f"""
/* ================= Atmosphäre: Sonnenuntergang & Palmen, In-Game-Menüs ================= */
:root{{--palmL:{P1};--palmR:{P2};--palmB:{P3};--palmLs:{Q1};--palmRs:{Q2};--palmBs:{Q3}}}
/* Hintergrund hinter allen Menüs: Glühen am Horizont und Palmen-Silhouetten */
.overlay{{background:var(--palmLs) left -40px bottom -40px/auto 50% no-repeat,var(--palmRs) right -30px bottom -50px/auto 58% no-repeat,var(--palmBs) left 9% bottom -60px/auto 34% no-repeat,
  radial-gradient(70% 45% at 50% 108%,rgba(255,123,0,.45),transparent 70%),radial-gradient(60% 50% at 12% 110%,rgba(255,42,133,.4),transparent 70%),radial-gradient(60% 50% at 92% 110%,rgba(255,42,133,.32),transparent 70%),
  linear-gradient(180deg,rgba(9,4,20,.72),rgba(13,6,26,.58) 55%,rgba(40,10,50,.55))}}
/* Startbildschirm: Sonne mit Palmen davor */
#title::after{{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:var(--palmL) left -50px bottom -30px/auto 62vh no-repeat,var(--palmB) left 20vh bottom -50px/auto 40vh no-repeat,var(--palmRs) right -40px bottom -40px/auto 56vh no-repeat,
  linear-gradient(180deg,rgba(70,12,90,.42),rgba(255,42,133,.14) 42%,rgba(255,123,0,.22) 72%,rgba(255,42,133,.28))}}
#title::before{{opacity:.42;width:50vh;height:50vh;bottom:-22vh;left:-6vh}}
#loading{{background:var(--palmL) left -40px bottom -20px/auto 58vh no-repeat,var(--palmR) right -40px bottom -30px/auto 66vh no-repeat,
  radial-gradient(closest-side,rgba(255,176,0,.9),rgba(255,123,0,.75) 45%,rgba(255,42,133,.55) 75%,transparent) 50% 118%/62vh 62vh no-repeat,
  radial-gradient(120% 70% at 50% 115%,rgba(255,42,133,.45),transparent 60%),linear-gradient(180deg,#090414,#1a0b2e 70%,#3a0f3f)}}
.pwall{{background:var(--palmL) left -24px bottom -10px/auto 120% no-repeat,var(--palmR) right -20px bottom -14px/auto 110% no-repeat,
  radial-gradient(closest-side,rgba(255,176,0,.7),rgba(255,42,133,.45) 65%,transparent) 50% 150%/220px 220px no-repeat,
  radial-gradient(120% 90% at 50% 0%,rgba(255,123,0,.3),rgba(255,42,133,.16) 45%,transparent 75%)}}
/* Karten wie ein modernes In-Game-Menü */
@keyframes cardIn{{from{{opacity:0;transform:translateY(16px) scale(.985)}}to{{opacity:1;transform:none}}}}
.overlay:not([hidden])>.card{{animation:cardIn .26s cubic-bezier(.2,.8,.2,1)}}
.card{{background-image:linear-gradient(180deg,rgba(255,42,133,.12),transparent 140px),repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 1px,transparent 1px 3px),
  radial-gradient(120% 60% at 100% 0%,rgba(255,123,0,.12),transparent 60%),radial-gradient(100% 60% at 0% 100%,rgba(0,240,255,.07),transparent 60%)}}
.card::before{{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--grad);box-shadow:0 0 16px rgba(255,42,133,.8);border-radius:16px 16px 0 0;pointer-events:none}}
.card::after{{content:"";position:absolute;inset:9px;pointer-events:none;opacity:.75;
  background:linear-gradient(var(--cyan),var(--cyan)) left top/16px 2px no-repeat,linear-gradient(var(--cyan),var(--cyan)) left top/2px 16px no-repeat,
  linear-gradient(var(--cyan),var(--cyan)) right bottom/16px 2px no-repeat,linear-gradient(var(--cyan),var(--cyan)) right bottom/2px 16px no-repeat}}
.card h2::after{{content:"";display:block;width:72px;height:3px;margin-top:10px;border-radius:2px;background:var(--grad);box-shadow:0 0 12px rgba(255,42,133,.7)}}
.tag{{border-radius:0;clip-path:polygon(9px 0,100% 0,calc(100% - 9px) 100%,0 100%);padding:5px 16px}}
.card h3,.hsec{{display:flex;align-items:center;gap:10px}}
.card h3::before,.hsec::before{{content:"";width:18px;height:3px;flex:none;background:var(--grad);box-shadow:0 0 8px rgba(255,42,133,.7)}}
.hq,.vcard,.xcard,.mlist div,.giverlist div{{position:relative}}
.hq:hover,.vcard:hover,.xcard:hover,.mlist div:hover,.giverlist div:hover{{background:linear-gradient(90deg,rgba(0,240,255,.13),rgba(255,255,255,.035) 65%);box-shadow:inset 3px 0 0 var(--cyan),0 0 18px rgba(0,240,255,.15);border-color:rgba(0,240,255,.55)}}
.vicon,.xcard .xi{{width:58px;height:58px;display:flex;align-items:center;justify-content:center;border-radius:14px;font-size:32px;
  background:radial-gradient(circle at 30% 25%,rgba(255,123,0,.38),rgba(255,42,133,.14) 60%,rgba(255,255,255,.03));border:1px solid rgba(255,123,0,.38);box-shadow:inset 0 0 14px rgba(255,42,133,.18)}}
.vcard.active::after{{content:"Aktiv";position:absolute;top:12px;right:12px;font:800 10px var(--display);letter-spacing:.16em;text-transform:uppercase;color:#090414;background:var(--good);padding:4px 8px;border-radius:6px;box-shadow:0 0 12px rgba(60,255,180,.6)}}
.vcard.locked .vicon,.xcard.locked .xi{{filter:grayscale(.7);opacity:.7}}
#tSay{{background:rgba(255,255,255,.05);border:1px solid rgba(0,240,255,.28);border-radius:4px 16px 16px 16px;padding:14px 16px;box-shadow:inset 3px 0 0 var(--cyan)}}
.close{{border-radius:10px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;font-weight:800}}
@media (prefers-reduced-motion:reduce){{.overlay:not([hidden])>.card{{animation:none}}}}
"""
open(sys.argv[1], "w", encoding="utf-8").write(css)
print("ok", len(css))
