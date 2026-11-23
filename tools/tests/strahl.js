const {chromium}=require('playwright');const fs=require('fs');const three=fs.readFileSync(__dirname+'/../three/package/build/three.min.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:600,height:1000}})).newPage();
await p.route(/cdnjs.cloudflare.com/,r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.route(/fonts\.g/,r=>r.abort());
await p.goto('http://localhost:8766/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:600000});
await p.evaluate(()=>{startCreate(false);createProfile('T',Object.assign({},LOOK_DEF));hideTitle();window.requestAnimationFrame=()=>0});
await p.waitForFunction(()=>state.mode==='play',null,{timeout:900000});
console.log(await p.evaluate(()=>{camera.position.set(912,1.7,250.5);camera.lookAt(790,3,228);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();const rc=new THREE.Raycaster();const out=[];
  for(const [sx,sy] of [[0,-.5],[0,-.8],[.3,-.6],[-.3,-.6]]){rc.setFromCamera(new THREE.Vector2(sx,sy),camera);const h=rc.intersectObjects(scene.children,true).filter(h=>h.object.visible&&h.object!==STADT.shMesh)[0];
    if(h){const m=h.object.material;out.push({sx,sy,pt:[h.point.x.toFixed(1),h.point.y.toFixed(3),h.point.z.toFixed(1)],typ:h.object.type,geo:h.object.geometry.type,farbe:m&&m.color&&m.color.getHexString(),map:!!(m&&m.map),n:h.object.name,mt:m&&m.type,ro:h.object.renderOrder,par:h.object.parent&&h.object.parent.type})}}
  const h=(()=>{rc.setFromCamera(new THREE.Vector2(0,-.6),camera);return rc.intersectObjects(scene.children,true).filter(h=>h.object.visible&&h.object!==STADT.shMesh)[0]})();
  const o=h.object;o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox;const chain=[];let q=o;while(q){chain.push(q.type+(q.name?':'+q.name:'')+'['+(q.children?q.children.length:0)+']');q=q.parent}
  const g=o.parent;const sib=g.children.map(c=>{c.geometry&&c.geometry.computeBoundingBox();const b=c.geometry&&c.geometry.boundingBox;return [c.type,c.material&&c.material.color&&c.material.color.getHexString(),b&&[b.min.x|0,b.max.x|0,b.min.y.toFixed(2),b.max.y.toFixed(2),b.min.z|0,b.max.z|0]]}).slice(0,12);
  out.push({bb:[bb.min.x|0,bb.max.x|0,bb.min.y.toFixed(3),bb.max.y.toFixed(3),bb.min.z|0,bb.max.z|0],chain,gpos:g.position.toArray(),sib,ud:Object.keys(g.userData||{}),mapsz:o.material.map&&o.material.map.image&&[o.material.map.image.width,o.material.map.image.height]});
  return JSON.stringify(out.slice(-1))}));await b.close()})();
