/* Echte Karte + Spielinhalte: node tools/fx_build.js mg-data.js mg-echt-basis.js tools/spielinhalte.js > mg-echt.js */
const fs=require("fs"),[,,spiel,basis,snip]=process.argv;
const M=new Function(fs.readFileSync(spiel,"utf8")+";return MG")();
const inb=(p,b)=>{let x=0,y=0,n=p.length/2;for(let i=0;i<p.length;i+=2){x+=p[i];y+=p[i+1]}x/=n;y/=n;return x>=b[0]&&x<=b[1]&&y>=b[2]&&y<=b[3]};
const S=[-346,-244,-155,-44],W=[-293,-212,-44,40];
const raw={q:M.q,talk:M.talk,school:M.school,bld:M.buildings.filter(b=>inb(b.p,S)||inb(b.p,W)),areas:M.areas.filter(a=>(a.t==="yard"&&inb(a.p,S))||(a.t==="plaza"&&inb(a.p,W)))};
process.stdout.write(fs.readFileSync(basis,"utf8").trimEnd()+"\nconst FXRAW="+JSON.stringify(raw)+";\n"+fs.readFileSync(snip,"utf8"));
