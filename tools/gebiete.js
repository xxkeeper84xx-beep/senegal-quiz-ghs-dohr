/* ================= Ganz Mönchengladbach: Gebiete und Freischalten =================
   - Die Stadt ist in 46 Gebiete zerlegt (tools/gebiete.py); geladen ist immer nur eines (iPad-Leistung).
     Am Rand eines Gebiets lädt das Spiel das Nachbargebiet nach – Noah steht danach an derselben echten Stelle.
   - Freischalten nach grenzen/freischaltgebiete.geojson (Raster 25 m): gesperrte Phasen und die Stadtgrenze sind nicht befahrbar.
     Phase 1 Rheydt und Schulumfeld – sofort
     Phase 2 Rheydter Süden        – drei Hauptmissionen erledigt
     Phase 3 Gladbach und Innenstadt – alle Hauptmissionen in Rheydt erledigt
     Phase 4 Nord und Ost (Flughafen) – Phase 3 und Rang 3 (Hypotenusen-Held)
     Phase 5 West (Borussia-Park)  – Phase 4 und Rang 4 (Wurzel-Profi)
   Freischaltungen stehen im Spielstand (save.phases) und gehen nie wieder verloren. */
const PHR=(()=>{const R=GEB.raster,v=new Uint8Array(R.w*R.h);let k=0;for(const t of R.rle.split(",")){const val=+t[0],n=parseInt(t.slice(1),36);v.fill(val,k,k+n);k+=n}return {R,v}})();
function phaseAt(x,y){const R=PHR.R,i=Math.floor((x-R.x0)/R.c),j=Math.floor((y-R.y0)/R.c);return i<0||j<0||i>=R.w||j>=R.h?0:PHR.v[j*R.w+i]}
const mainDone=()=>MAIN.filter(id=>id!=="intro"&&(()=>{const q=questById(id);return q&&qs(q).done})()).length;
const PHASE_REQ={
  2:{t:"Erledige drei Hauptmissionen.",ok:()=>mainDone()>=3},
  3:{t:"Erledige alle Hauptmissionen in Rheydt.",ok:()=>mainDone()>=MAIN.filter(id=>id!=="intro").length},
  4:{t:"Schalte Gladbach frei und erreiche Rang 3 (Hypotenusen-Held).",ok:()=>lvl()>=3},
  5:{t:"Schalte Nord und Ost frei und erreiche Rang 4 (Wurzel-Profi).",ok:()=>lvl()>=4}};
const phaseName=p=>(GEB.phasen.find(q=>q.p===p)||{}).n||("Phase "+p);
function phaseUnlocked(p){return p===1||((save.phases||[]).includes(p))}
function phaseOK(x,y){const p=phaseAt(x,y);return p>0&&phaseUnlocked(p)}
function checkPhases(quiet){save.phases=save.phases||[];let any=false;
  for(let p=2;p<=5;p++){if(phaseUnlocked(p))continue;if(!phaseUnlocked(p-1)||!PHASE_REQ[p].ok())break;save.phases.push(p);any=true;
    if(!quiet){jingle();toast(`🗺️ ${phaseName(p)} freigeschaltet`,p===4?"Dort liegt auch der Flughafen Mönchengladbach mit Flugschule und Verleih.":"Auf der Karte ist das Gebiet jetzt offen.","#ffc933")}}
  if(any){persist();try{buildMinimap()}catch(e){}}}
/* gesperrt: nicht hineinfahren, Hinweis zeigen */
let lockHint=0;
function lockToast(x,y){const now=performance.now();if(now-lockHint<3500)return;lockHint=now;const p=phaseAt(x,y);
  if(!p)toast("🚧 Stadtgrenze","Hier endet Mönchengladbach.","#ff5d6c");else toast(`🔒 ${phaseName(p)} – noch gesperrt`,PHASE_REQ[p]?PHASE_REQ[p].t:"","#ff5d6c")}
{const base=carHits;carHits=function(x,y){if(!phaseOK(x,y)){lockToast(x,y);return true}return base(x,y)}}
{const base=airHits;airHits=function(x,y){if(!phaseOK(x,y)){lockToast(x,y);return true}return base(x,y)}}

/* ---------- Gebietswechsel ---------- */
const REG=(()=>{const id=MG.region||"rheydt",key=id==="rheydt"?"0_0":id.slice(2),c=GEB.cells[key]||{ext:[RX-HX,RX+HX,RY-HY,RY+HY]};
  const [k,m]=key.split("_").map(Number);return {id,key,ext:c.ext,core:[GEB.x0+k*GEB.cw,GEB.x0+(k+1)*GEB.cw,GEB.y0+m*GEB.ch,GEB.y0+(m+1)*GEB.ch]}})();
const cellKey=(x,y)=>Math.floor((x-GEB.x0)/GEB.cw)+"_"+Math.floor((y-GEB.y0)/GEB.ch);
let SWITCH=false;
function goRegion(key){if(SWITCH||!GEB.cells[key])return;SWITCH=true;const region=key==="0_0"?"rheydt":"g_"+key;
  const h={region,prof:typeof PROF!=="undefined"&&PROF?PROF.id:null,x:+car.x.toFixed(2),y:+car.y.toFixed(2),a:+car.a.toFixed(3),alt:+(car.alt||0).toFixed(2),v:+(car.v||0).toFixed(2),veh:save.veh,t:state.time};
  try{persist()}catch(e){}
  const f=$("fadeBlk");if(f){f.hidden=false;f.style.opacity=1;f.innerHTML=`<div style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:600 22px Rubik,sans-serif;text-align:center">🗺️ ${phaseName(phaseAt(car.x,car.y))}<br><small style="font-weight:400;opacity:.8">Gebiet wird geladen …</small></div>`}
  setTimeout(()=>{try{location.hash="go="+encodeURIComponent(JSON.stringify(h))}catch(e){}location.reload()},300)}
{const base=update;update=function(dt){base(dt);if(SWITCH||state.mode!=="play")return;
  const E=REG.ext,C=REG.core,x=car.x,y=car.y,dEdge=Math.min(x-E[0],E[1]-x,y-E[2],E[3]-y);const key=cellKey(x,y);let target=null;
  if(key!==REG.key){const out=Math.max(C[0]-x,x-C[1],C[2]-y,y-C[3]);if(out>150||dEdge<70)target=key}
  else if(dEdge<70){const n=[[x-E[0],-1,0],[E[1]-x,1,0],[y-E[2],0,-1],[E[3]-y,0,1]].sort((a,b)=>a[0]-b[0])[0];target=cellKey(x+n[1]*90,y+n[2]*90)}
  if(target&&target!==REG.key&&GEB.cells[target])goRegion(target)}}
/* nach dem Nachladen: Profil wählen, Titel überspringen, an dieselbe Stelle setzen */
(function resume(){const h=window.__GO;if(!h)return;if(!window.__ready){setTimeout(resume,100);return}
  try{if(h.prof){const p=(PROFS.list||[]).find(q=>q.id===h.prof);if(p)selectProfile(p)}}catch(e){console.warn("Gebietswechsel Profil",e)}
  if(h.veh&&VEH[h.veh]&&(save.owned.includes(h.veh)||h.veh==="walk"))setVehicle(h.veh);
  car.x=h.x;car.y=h.y;car.a=h.a;car.v=h.v||0;car.alt=h.alt||0;car.vy=0;if(typeof h.t==="number")state.time=h.t;
  if(V().fly&&car.alt>1){car.rotor=1;if(V().id==="plane")VEH.plane.fly=true}
  camYaw=car.a;camPos.set(car.x-Math.cos(car.a)*8,car.alt+4,car.y-Math.sin(car.a)*8);
  hideTitle();try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
  setTimeout(()=>toast(`🗺️ ${phaseName(phaseAt(car.x,car.y))}`,(MG.districts&&MG.districts.length?"":"")+"Weiter geht's!","#ffc933"),900)})();

/* Fortschritt prüfen (Freischalten), Minikarte: gesperrte Flächen abdunkeln */
{let t=0;const base=update;update=function(dt){base(dt);t-=dt;if(t<=0){t=1;if(state.mode==="play")checkPhases(false)}}}
{const base=buildMinimap;buildMinimap=function(){try{mmBase.getContext("2d").setTransform(1,0,0,1,0,0)}catch(e){}base();try{const c=mmBase.getContext("2d");c.save();c.setTransform(1,0,0,1,0,0);c.scale(MMS,MMS);c.translate(HX-RX,HY-RY);
  const R=PHR.R;c.fillStyle="rgba(8,10,20,.62)";for(let y=RY-HY;y<RY+HY;y+=R.c)for(let x=RX-HX;x<RX+HX;x+=R.c){if(!phaseOK(x+R.c/2,y+R.c/2))c.fillRect(x,y,R.c+.5,R.c+.5)}c.restore()}catch(e){console.warn("Minikarte Sperre",e)}}}
save.phases=save.phases||[];
{const base=applySave;applySave=function(d){const r=base(d);save.phases=save.phases||[];checkPhases(true);try{buildMinimap()}catch(e){}return r}}
