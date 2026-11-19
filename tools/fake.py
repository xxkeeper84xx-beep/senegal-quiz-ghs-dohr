# Synthetischer Testdatensatz im MG-Format (nur zum Testen der Engine)
import json,random
random.seed(1)
HX,HY=600,500
nodes=[];idx={}
def nid(x,y):
    k=(x,y)
    if k not in idx: idx[k]=len(nodes)//2; nodes.extend([x,y])
    return idx[k]
roads=[];step=100
for y in range(-500,501,step): roads.append({"h":"secondary" if y==0 else "residential","n":f"Teststraße {y}","w":11 if y==0 else 7,"o":0,"c":1,"b":0,"tu":0,"i":[nid(x,y) for x in range(-600,601,step)]})
for x in range(-600,601,step): roads.append({"h":"pedestrian" if x==100 else "residential","n":f"Weg {x}","w":8 if x==100 else 7,"o":1 if x==-300 else 0,"c":0 if x==100 else 1,"b":0,"tu":0,"i":[nid(x,y) for y in range(-500,501,step)]})
b=[]
for bx in range(-600,600,step):
  for by in range(-500,500,step):
    if (bx,by)==(200,-200): continue
    for k in range(4):
      x0=bx+8+(k%2)*44;y0=by+8+(k//2)*44
      b.append({"p":[x0,y0,x0+38,y0,x0+38,y0+38,x0,y0+38],"h":random.choice([9,12,15,18,24,40]),"m":0,"t":random.choice(["yes","apartments","office","church"])})
areas=[{"t":"park","n":"Testpark","p":[205,-195,295,-195,295,-105,205,-105]},{"t":"water","p":[230,-170,260,-170,260,-140,230,-140]}]
pois=[{"n":"Mönchengladbach Hbf","k":"railway=station","x":350,"y":20},{"n":"Feuerwache","k":"amenity=fire_station","x":-250,"y":-250},{"n":"Rathaus","k":"amenity=townhall","x":-50,"y":40},{"n":"Saturn","k":"shop=electronics","x":150,"y":150},{"n":"Autohaus Test","k":"shop=car","x":-450,"y":350},{"n":"Taxi","k":"amenity=taxi","x":330,"y":-30},{"n":"Krankenhaus","k":"amenity=hospital","x":450,"y":-350},{"n":"Bunter Garten","k":"leisure=park","x":250,"y":-150},{"n":"Alter Markt","k":"place=square","x":-150,"y":-50}]
d={"origin":[51.1962,6.438],"half":[HX,HY],"nodes":nodes,"roads":roads,"buildings":b,"areas":areas,"rails":[[-600,480,600,480]],"trees":[],"pois":pois}
open("mg-data-fake.js","w").write("const MG="+json.dumps(d,separators=(",",":"))+";\n")
print(len(b))
