# Erzeugt tools/icons.js aus lucide-static (ISC-Lizenz): nur die Pfade der benötigten Icons
import re, sys, json, os
src = sys.argv[1]; out = sys.argv[2]
names = "menu smartphone notebook-pen map navigation key-round music house gift graduation-cap video log-out x chevron-left chevron-right arrow-up arrow-down zap phone phone-off message-circle shirt users calculator play user-plus gamepad-2 triangle-alert star trophy arrow-up-to-line arrow-down-to-line sparkles".split()
icons = {}
for n in names:
    t = open(os.path.join(src, n + ".svg"), encoding="utf-8").read()
    body = t[t.index(">", t.index("<svg")) + 1 : t.rindex("</svg>")]
    icons[n] = re.sub(r"\s+", " ", body).strip()
open(out, "w", encoding="utf-8").write("/* Lucide-Icons (lucide-static 0.460.0, ISC-Lizenz), eingebettet für den Offline-Betrieb */\nconst ICONS=" + json.dumps(icons, ensure_ascii=False) + ";\n")
print(len(icons), "icons")
