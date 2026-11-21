/* ================= Spielinhalte auf der echten Karte =================
   Die Missionen, Figuren und das Schulmodell stammen aus der früheren verdichteten Spielkarte.
   Hier werden sie auf echte Orte in Rheydt und Mülfort gesetzt:
   - Schule (Cluster S): Schulmodell und Schulhof auf das Grundstück Am Torfbend, gedreht wie die Straße.
   - Werkhof (Cluster W): auf die freie Fläche südwestlich der Schule, zwischen Am Torfbend und den Kleingärten.
   - Markt (Cluster M): Marktstände und Markt-Auftrag auf den Rheydter Markt (Abstände der Stände um 40 % verkürzt,
     die vermessene Zone behält ihre Größe 12 m × 9 m).
   - Alle anderen Orte stehen unten mit echten Koordinaten und werden auf den nächsten freien Gehweg geschoben.
   FXRAW enthält die Rohdaten der früheren Spielkarte (Koordinaten der Spielkarte). */
(function(){
const F=FXRAW;
const XF=[{id:"S",b:[-346,-244,-155,-44],f:[-261.5,-63.4],t:[893.1,240.9],r:.1923},
          {id:"W",b:[-293,-212,-44,40],f:[-252.5,-5],t:[790,282],r:0},
          {id:"M",b:[85,190,255,380],f:[137.5,320],t:[-540,-805],r:0,s:.6}];
const clu=(x,y)=>XF.find(c=>x>=c.b[0]&&x<=c.b[1]&&y>=c.b[2]&&y<=c.b[3]);
function FX(x,y){const c=clu(x,y);if(!c)return [x,y];const s=c.s||1,dx=(x-c.f[0])*s,dy=(y-c.f[1])*s,co=Math.cos(c.r),si=Math.sin(c.r);
  return [+(c.t[0]+dx*co-dy*si).toFixed(2),+(c.t[1]+dx*si+dy*co).toFixed(2)]}
const tp=p=>{const o=[];for(let i=0;i<p.length;i+=2)o.push(...FX(p[i],p[i+1]));return o};
const pip=(p,x,y)=>{let c=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const xi=p[i],yi=p[i+1],xj=p[j],yj=p[j+1];if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c};
MG.FX=FX;MG.XF=XF;MG.FXC=clu;

/* ---- Gebäude: Schule und Werkhof einsetzen, überlappende OSM-Gebäude an dieser Stelle entfernen ---- */
const yard=F.areas.find(a=>a.t==="yard").p, wk=[-293,-42,-212,-42,-212,32,-293,32];
const clear=[tp(yard),tp(wk)];
const hit=p=>{for(const c of clear){for(let i=0;i<p.length;i+=2)if(pip(c,p[i],p[i+1]))return true;for(let i=0;i<c.length;i+=2)if(pip(p,c[i],c[i+1]))return true}return false};
const before=MG.buildings.length;MG.buildings=MG.buildings.filter(b=>!hit(b.p));
MG.fxRemoved=before-MG.buildings.length;
for(const b of F.bld)MG.buildings.push(Object.assign({},b,{p:tp(b.p),fx:1}));
for(const a of F.areas)MG.areas.push(Object.assign({},a,{p:tp(a.p)}));
MG.schools=MG.schools.filter(s=>!/Auslagerung \(Sekundarstufe I\)/.test(s.n));
MG.schools.push({n:"GHS Dohr · Standort Torfbend",p:tp(yard)});
MG.school=F.school;

/* ---- freie Stelle auf dem Gehweg suchen (nicht im Gebäude, nicht auf der Fahrbahn) ---- */
const N=MG.nodes,CAR=/^(primary|secondary|tertiary|residential|unclassified|service|living_street|trunk)/;
function free(x,y){const B=MG.buildings.filter(b=>{for(let i=0;i<b.p.length;i+=2)if(Math.abs(b.p[i]-x)<60&&Math.abs(b.p[i+1]-y)<60)return true;return false});
  const R=MG.roads.filter(r=>CAR.test(r.h)&&r.i.some(i=>Math.abs(N[2*i]-x)<400&&Math.abs(N[2*i+1]-y)<400));
  const ok=(px,py)=>{if(B.some(b=>pip(b.p,px,py)))return false;
    for(const r of R)for(let k=1;k<r.i.length;k++){const a=r.i[k-1],b=r.i[k],ax=N[2*a],ay=N[2*a+1],dx=N[2*b]-ax,dy=N[2*b+1]-ay,
      t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(ax+t*dx-px,ay+t*dy-py)<(r.w||6)/2+1.5)return false}return true};
  for(let rr=0;rr<40;rr+=.75){const n=Math.max(1,Math.round(rr*4));for(let k=0;k<n;k++){const a=k/n*Math.PI*2,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(ok(px,py))return [+px.toFixed(2),+py.toFixed(2)]}}
  return [x,y]}
MG.fxFree=free;

/* ---- Aufträge ---- */
const q=JSON.parse(JSON.stringify(F.q)),w=q.werkhof,m=q.markt;
for(const k of ["giver","wall","drum"])w[k]=FX(...w[k]);
{const a=FX(w.gate[0],w.gate[1]),b=FX(w.gate[2],w.gate[3]);w.gate=[a[0],a[1],b[0],b[1]]}
w.lamps=w.lamps.map(l=>FX(...l));
{const z=m.zone,c=FX((z[0]+z[2])/2,(z[1]+z[3])/2),hw=(z[2]-z[0])/2,hh=(z[3]-z[1])/2;m.zone=[+(c[0]-hw).toFixed(2),+(c[1]-hh).toFixed(2),+(c[0]+hw).toFixed(2),+(c[1]+hh).toFixed(2)]}
m.giver=FX(...m.giver);m.stalls=m.stalls.map(s=>FX(...s));m.fixed=m.fixed.map(s=>FX(...s));
const O=MG.real.orte;
q.soon=[[O.gladbach_hbf.x,O.gladbach_hbf.y,"Alter Markt (Phase 3)","Wie weit von der Wand?"],[O.borussia_park.x,O.borussia_park.y,"Nordpark (Phase 5)","Abspannung vor dem Spiel"],[O.schloss_rheydt.x,O.schloss_rheydt.y,"Schloss Rheydt (Phase 2)","Bonus-Auftrag"]];
delete q.closed;MG.q=q;

/* ---- Auftraggeber an echten Orten ---- */
MG.givers={
  fire:[...free(-452,-822),"Einsatzleitung an der Hauptkirche Rheydt"],
  tv:[...free(-432,-905),"Elektromarkt an der Hauptstraße"],
  taxi:[...free(-872,-250),"Taxistand am Rheydter Hauptbahnhof"],
  amt:[...free(-497,-762),"Rathaus Rheydt"],
  park:[...free(595,640),"Grünanlage in Mülfort"],
  crane:[...free(382,330),"Trainingsgelände am Mülforter Bruch"],
  heli:[...free(382,470),"Übungswiese im Mülforter Bruch"],
  shop:[...free(-390,-962),"Gartenstraße"]};

/* ---- Menschen zum Ansprechen ---- */
const RT=s=>s.replace(/zur Dohrer Straße/g,"zu den Kleingärten").replace(/Dohrer Straße/g,"Straße an den Kleingärten").replace(/Nordpark/g,"Mülforter Bruch");
const OVR={Elif:{at:[600,612],role:"in der Grünanlage",say:["Quer über die Wiese ist kürzer als außen herum. Warum eigentlich? Frag mal den Park-Kurier.","Zum Rheydter Markt? Am schnellsten mit dem Taxi oder mit dem Rad über die Hauptstraße."]},
  "Frau Okafor":{at:[-458,-812],say:["Der Turm da drüben gehört zur Evangelischen Hauptkirche Rheydt. Den sieht man schon von der Hauptstraße aus.","Vom Markt zum Rathaus sind es nur ein paar Schritte. Diagonal über den Platz ist es noch kürzer."]},
  Tarik:{at:[388,400],role:"Platzwart im Mülforter Bruch"}};
MG.talk=F.talk.map(t=>{const o=OVR[t.name]||{},r=Object.assign({},t,o);const p=o.at?free(...o.at):FX(t.x,t.y);r.x=p[0];r.y=p[1];delete r.at;r.say=r.say.map(RT);r.role=RT(r.role);return r});
/* Frau Costantino: Lehrerin und Verkehrsbeauftragte, am Gehweg vor dem Schuleingang */
{const p=free(...FX(-304,-58.6));MG.talk.push({x:p[0],y:p[1],name:"Frau Costantino",role:"Lehrerin für Mathe und Deutsch · Verkehrsbeauftragte der GHS Dohr",shirt:"#b03060",
  say:["Hallo! Ich bin Frau Costantino. An der Ampel gilt: Erst bei Grün gehen – auch wenn gerade kein Auto kommt.","Schräg über die Kreuzung ist die längste Strecke auf der Fahrbahn. Das kannst du mit Pythagoras ausrechnen!","Ein E-Scooter darf höchstens 20 km/h fahren. Getunte Roller kassieren wir ein."]})}
MG.parked=[];MG.signs=[];MG.zebra=[];MG.decals=[];
MG.spielkarte=false;
})();
