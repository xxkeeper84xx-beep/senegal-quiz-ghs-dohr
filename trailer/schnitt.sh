#!/bin/bash
# Bilder + Titelmelodie „Rheydt bei Nacht“ (Trance Rock, geliefert) + Martinshorn zum Trailer zusammensetzen: Farblook (warm, satt), Vignette, Kinobalken bis zum Logo
set -e; cd "$(dirname "$0")"
ffmpeg -y -loglevel error -framerate 24 -i frames/f%05d.jpg -i titelmusik.mp3 -i ../sk2/sounds/martinshorn.wav \
 -filter_complex "[2:a]atrim=0:2.6,asetpts=PTS-STARTPTS,afade=t=in:d=0.35,afade=t=out:st=2.0:d=0.6,volume=0.4,aresample=44100,aformat=channel_layouts=stereo,adelay=28750|28750[sir];[1:a][sir]amix=inputs=2:duration=first:normalize=0[a];[0:v]eq=contrast=1.08:saturation=1.25:gamma=0.97,colorbalance=rs=0.06:gs=0.0:bs=-0.05:rh=0.05:bh=-0.04,vignette=PI/5,drawbox=x=0:y=0:w=iw:h=92:color=black:t=fill:enable='lt(t,43.2)',drawbox=x=0:y=ih-92:w=iw:h=92:color=black:t=fill:enable='lt(t,43.2)',format=yuv420p[v]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart Pythagoras_City_Trailer.mp4
ls -la Pythagoras_City_Trailer.mp4
