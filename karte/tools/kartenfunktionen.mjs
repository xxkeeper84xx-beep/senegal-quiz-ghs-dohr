/** Lokale Kartenfunktionen ohne Abhängigkeit vom Spiel-Framework. */
export const UTM32_ETRS89 = '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs';

export function worldFromUTM(world, east, north, height = world.origin_utm_nhn_m[2]) {
  const [e0,n0,h0] = world.origin_utm_nhn_m;
  return [east-e0, height-h0, n0-north];
}

export function worldFromLonLat(world, proj4, lon, lat, height) {
  const [e,n] = proj4('EPSG:4326', UTM32_ETRS89, [lon,lat]);
  return worldFromUTM(world,e,n,height);
}

export function heightRaster(descriptor, buffer) {
  const {columns,rows,cell_m,value_to_y_m,nodata,sample00_utm_m:[e0,n0]} = descriptor;
  if (buffer.byteLength !== 2*columns*rows) throw new Error('Höhenraster hat eine falsche Dateigröße');
  const view=new DataView(buffer);
  const get=(x,y)=>view.getInt16(2*(y*columns+x),true);
  return (east,north)=>{
    const x=(east-e0)/cell_m, y=(n0-north)/cell_m;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x<0 || y<0 || x>columns-1 || y>rows-1) return null;
    const i=Math.min(Math.floor(x),columns-2), j=Math.min(Math.floor(y),rows-2);
    const tx=x-i, ty=y-j;
    const a=get(i,j), b=get(i+1,j), c=get(i,j+1), d=get(i+1,j+1);
    if ([a,b,c,d].includes(nodata)) return null;
    return ((1-ty)*((1-tx)*a+tx*b)+ty*((1-tx)*c+tx*d))*value_to_y_m;
  };
}

export function heightForWorld(world, samplers, x, z) {
  const [e0,n0]=world.origin_utm_nhn_m;
  for (const sample of samplers) {
    const h=sample(e0+x,n0-z);
    if (h!==null) return h;
  }
  return null;
}
