/* ================= Umzug auf die echte Karte: feste Orte aus dem Programmcode umrechnen ================= */
if(MG.FX){
  const FX=MG.FX,P=o=>{const p=FX(o.x,o.y);o.x=p[0];o.y=p[1]};
  for(const q of QUESTS){if(MG.FXC(q.giver.x,q.giver.y)){P(q.giver);for(const m of q.measures){P(m);const L=m.line,a=FX(L[0],L[2]),b=FX(L[3],L[5]);m.line=[a[0],L[1],a[1],b[0],L[4],b[1]]}}}
  for(const H of HUNT){P(H);H.post=FX(...H.post)}
  for(const G of XG)if(G.at)G.at=MG.fxFree(...FX(...G.at));
  for(let i=0;i<DUCKS.length;i++){const [x,y,w]=DUCKS[i];DUCKS[i]=[...FX(x,y),w]}
  for(const k in JOBDEF)for(const st of JOBDEF[k].steps||[])if(st.fixed)st.fixed=FX(...st.fixed);
  /* Schulmodell: wird in Spielkarten-Koordinaten gebaut und als Ganzes auf das echte Grundstück gedreht und verschoben */
  {const base=buildSchool;buildSchool=function(){const n0=scene.children.length;base();const S=MG.XF.find(c=>c.id==="S"),g=new THREE.Group();
    const co=Math.cos(S.r),si=Math.sin(S.r);g.rotation.y=-S.r;g.position.set(S.t[0]-(S.f[0]*co-S.f[1]*si),0,S.t[1]-(S.f[0]*si+S.f[1]*co));
    const add=scene.children.slice(n0);for(const o of add){scene.remove(o);g.add(o)}scene.add(g);g.updateMatrixWorld(true)}}
}
