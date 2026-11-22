#!/bin/bash
# Spiel bauen: immer echte Karte Mönchengladbach (mg-echt.js = Kartendaten + umgezogene Spielinhalte)
set -e
S=$(dirname "$0"); cd "$S"
python3 tools/patch_sk.py mg/game.html tools/quests.js sk/game.html >/dev/null
python3 tools/patch_gfx.py sk/game.html tools/gfx.js sk2/game.html
sed -i 's#src="mg-data.js"#src="mg-echt.js"#' sk2/game.html
python3 tools/gebiete_patch.py sk2/game.html
node tools/fx_build.js sk2/mg-data.js sk2/mg-echt-basis.js tools/spielinhalte.js > sk2/mg-echt.js
(printf '<!DOCTYPE html>\n<html lang="de">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n'; cat sk2/game.html; echo '</html>') > sk2/index.html
printf '<!DOCTYPE html>\n<html lang="de"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=./"><title>Pythagoras City</title></head><body><a href="./">Weiter zu Pythagoras City</a></body></html>\n' > sk2/echt.html
node -e "const s=require('fs').readFileSync('sk2/game.html','utf8');for(const x of s.match(/<script>([\s\S]*?)<\/script>/g)){try{new Function(x.replace(/<\/?script>/g,''))}catch(e){console.log('SYNTAX',e.message);process.exit(1)}}console.log('syntax ok')"
