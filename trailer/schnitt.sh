#!/bin/bash
# Bilder + Titelmelodie „Rheydt bei Nacht – Vollgas“ (geliefert) zum Trailer zusammensetzen: Farblook (warm, satt), Vignette, Kinobalken bis zum Logo
set -e; cd "$(dirname "$0")"
ffmpeg -y -loglevel error -framerate 24 -i frames/f%05d.jpg -i titelmusik.mp3 \
 -filter_complex "[0:v]eq=contrast=1.08:saturation=1.25:gamma=0.97,colorbalance=rs=0.06:gs=0.0:bs=-0.05:rh=0.05:bh=-0.04,vignette=PI/5,drawbox=x=0:y=0:w=iw:h=92:color=black:t=fill:enable='lt(t,41.6)',drawbox=x=0:y=ih-92:w=iw:h=92:color=black:t=fill:enable='lt(t,41.6)',format=yuv420p[v]" \
 -af "afade=t=out:st=47.4:d=0.6" -map "[v]" -map 1:a -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart Pythagoras_City_Trailer.mp4
ls -la Pythagoras_City_Trailer.mp4
