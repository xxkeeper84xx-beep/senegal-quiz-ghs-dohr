/* ================= Vice-City-Oberfläche: Lucide-Icons und Neon-Farben ================= */
function ic(n,c=""){const s=ICONS[n];return s?`<svg class="lc ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s}</svg>`:""}
function setBtn(id,icon,label){const b=$(id);if(!b)return;const keep=[...b.children].filter(c=>c.id==="pBadge");b.innerHTML=ic(icon)+(label?`<span>${label}</span>`:"");keep.forEach(k=>b.appendChild(k))}
(function(){
  setBtn("btnMore","menu","Menü");setBtn("btnPhone","smartphone","");
  setBtn("btnHelp","graduation-cap","Theorie (H)");setBtn("btnCam","video","Kamera (V)");setBtn("btnHeft","notebook-pen","Auftragsheft (J)");
  setBtn("btnMap","map","Karte (M)");setBtn("btnNav","navigation","Weg (N)");setBtn("btnGarage","key-round","Garage (G)");
  setBtn("btnMusic","music","Musik");setBtn("btnXtra","gift","Extras (K)");setBtn("btnMenu","house","Startbildschirm");
  setBtn("btnExit","log-out",isTouch?"Aussteigen":"Aussteigen (X)");
  for(const [id,icn] of [["tL","chevron-left"],["tR","chevron-right"],["tG","arrow-up"],["tB","arrow-down"],["tUp","arrow-up-to-line"],["tDn","arrow-down-to-line"],["tN","zap"]]){const b=$(id);if(b)b.innerHTML=ic(icn)}
  document.querySelectorAll(".close").forEach(b=>{const t=b.textContent.replace("✕","").trim();b.innerHTML=ic("x")+`<span>${t}</span>`});
})();
{const base=toggleMusic;toggleMusic=function(){base();setBtn("btnMusic","music",musicT?"Musik aus":"Musik")}}
/* Meldungen in den Neonfarben der Oberfläche */
const NEON_MAP={"#ffc933":"#FF7B00","#3fd8ff":"#00F0FF","#3ddc84":"#3CFFB4","#ff5d6c":"#FF2A85","#ffd21f":"#FFB000"};
{const base=toast;toast=function(big,small,col){base(big,small,NEON_MAP[(col||"").toLowerCase()]||col)}}
/* Startmenü: Icons vor den Einträgen */
const TITLE_IC={play:"play",new:"user-plus",list:"users",look:"shirt",theory:"graduation-cap",info:"gamepad-2"};
{const base=renderTitle;renderTitle=function(){base();document.querySelectorAll("#title nav button[data-t]").forEach(b=>{const n=TITLE_IC[b.dataset.t];if(n)b.insertAdjacentHTML("afterbegin",ic(n,"tm"))})}}
