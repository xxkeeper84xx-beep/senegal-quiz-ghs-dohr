#!/bin/bash
# Bilder + Titelmelodie „Rheydt bei Nacht – Vollgas“ (geliefert); vor dem Logo (36,8–41,6 s) die ruhige Passage aus der ersten Fassung zum Trailer zusammensetzen: Farblook (warm, satt), Vignette, Kinobalken bis zum Logo
set -e; cd "$(dirname "$0")"
ffmpeg -y -loglevel error -framerate 24 -i frames/f%05d.jpg -i titelmusik.mp3 -i musik_ruhig.mp3 \
 -filter_complex "[0:v]eq=contrast=1.08:saturation=1.25:gamma=0.97,colorbalance=rs=0.06:gs=0.0:bs=-0.05:rh=0.05:bh=-0.04,vignette=PI/5,drawbox=x=0:y=0:w=iw:h=92:color=black:t=fill:enable='lt(t,41.6)',drawbox=x=0:y=ih-92:w=iw:h=92:color=black:t=fill:enable='lt(t,41.6)',format=yuv420p[v];[1:a]atrim=0:36.9,afade=t=out:st=36.7:d=0.2[a1];[2:a]atrim=36.7:41.65,asetpts=PTS-STARTPTS,volume=1.6,afade=t=in:d=0.2,afade=t=out:st=4.85:d=0.1,adelay=36700|36700[a2];[1:a]atrim=41.6,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=5.8:d=0.6,adelay=41600|41600[a3];[a1][a2][a3]amix=inputs=3:normalize=0:duration=longest[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart Pythagoras_City_Trailer.mp4
ls -la Pythagoras_City_Trailer.mp4
