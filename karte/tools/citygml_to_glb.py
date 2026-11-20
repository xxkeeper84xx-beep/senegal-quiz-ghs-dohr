"""Convert Geobasis NRW LoD2 CityGML tiles to project-aligned glTF 2.0.

Install dependencies with python -m pip install numpy mapbox-earcut.
The tool only processes buildings of municipality 05116000 (Mönchengladbach).
Pass several files together to deduplicate CityGML building IDs across tiles.
"""
import argparse
import array
import json
import re
import struct
import xml.etree.ElementTree as ET
from pathlib import Path

import mapbox_earcut
import numpy as np


ORIGIN_E, ORIGIN_N, ORIGIN_H = 322000, 5671000, 45
NS = {
    'g': 'http://www.opengis.net/gml',
    'b': 'http://www.opengis.net/citygml/building/1.0',
    'c': 'http://www.opengis.net/citygml/1.0',
    'a': 'http://www.opengis.net/citygml/generics/1.0'
}
ID = '{'+NS['g']+'}id'
SURFACES = (
    ('WallSurface','Wände',[.67,.61,.51,1]),
    ('RoofSurface','Dächer',[.36,.26,.23,1]),
    ('GroundSurface','Grundflächen',[.30,.31,.30,1]),
    ('ClosureSurface','Abschlüsse',[.53,.51,.48,1]),
)


def read_ring(ring, offset):
    pos = ring.find('g:posList', NS)
    if pos is not None:
        points = np.fromstring(pos.text, sep=' ').reshape(-1,3)
    else:
        points = np.array([[float(v) for v in p.text.split()] for p in ring.findall('g:pos',NS)])
    if len(points) < 3:
        return None
    points = points - offset
    points = points[:,[0,2,1]]
    points[:,2] *= -1
    if (points[0] == points[-1]).all():
        points = points[:-1]
    if len(points) < 3:
        return None
    return points


def read_surface(element, offset):
    exterior = element.find('g:exterior/g:LinearRing', NS)
    if exterior is None:
        return None
    outside = read_ring(exterior,offset)
    if outside is None:
        return None
    rings = [outside]
    for ring in element.findall('g:interior/g:LinearRing',NS):
        points = read_ring(ring,offset)
        if points is not None:
            rings.append(points)
    normal = np.cross(outside - outside[0], np.roll(outside, -1, axis=0) - outside[0]).sum(axis=0)
    length = np.linalg.norm(normal)
    if length < 1e-8:
        return None
    normal /= length
    axis = int(np.argmax(np.abs(normal)))
    points = np.concatenate(rings)
    planar = np.ascontiguousarray(np.delete(points,axis,axis=1))
    ends = np.cumsum([len(r) for r in rings],dtype=np.uint32)
    faces = mapbox_earcut.triangulate_float64(planar,ends).reshape(-1,3)
    if not len(faces): return None
    tri = points[faces]
    cross = np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
    wrong = (cross @ normal) < 0
    faces[wrong] = faces[wrong][:,[0,2,1]]
    return points,normal,faces


def export_tile(path,target,seen):
    match = re.fullmatch(r'LoD2_32_(\d+)_(\d+)_1_NW\.gml',path.name)
    if not match:
        raise ValueError(f'Unexpected LoD2 filename: {path.name}')
    e,n=(int(i)*1000 for i in match.groups())
    offset=np.array([e,n,ORIGIN_H])
    records=[(array.array('f'),array.array('f'),array.array('I')) for _ in SURFACES]
    building_count=0
    footprint_bboxes=[]
    xml = ET.iterparse(path,events=('start','end'))
    _,root=next(xml)
    for action,member in xml:
        if action!='end' or member.tag != '{'+NS['c']+'}cityObjectMember': continue
        try:
            building=member.find('b:Building',NS)
            if building is None: continue
            municipality=building.find("a:stringAttribute[@name='Gemeindeschluessel']/a:value",NS)
            if municipality is None or municipality.text!='05116000': continue
            bid=building.get(ID)
            if bid and bid in seen: continue
            footprint_bounds=[[float('inf'),float('inf')],[-float('inf'),-float('inf')]]
            written=False
            for (tag,_,_),(positions,normals,indices) in zip(SURFACES,records):
                for polygon in building.findall(f'.//b:{tag}//g:Polygon',NS):
                    data=read_surface(polygon,offset)
                    if data is None: continue
                    points,normal,faces=data
                    if tag == 'GroundSurface' or not np.isfinite(footprint_bounds[0][0]):
                        footprint_bounds[0]=np.minimum(footprint_bounds[0],points[:,[0,2]].min(axis=0)).tolist()
                        footprint_bounds[1]=np.maximum(footprint_bounds[1],points[:,[0,2]].max(axis=0)).tolist()
                    start=len(positions)//3
                    positions.frombytes(points.astype('<f4').tobytes())
                    normals.frombytes(np.broadcast_to(normal,points.shape).astype('<f4').tobytes())
                    indices.frombytes((faces+start).astype('<u4').tobytes())
                    written=True
            if written:
                if bid: seen.add(bid)
                building_count+=1
                footprint_bboxes.append([round(float(v),2) for row in footprint_bounds for v in row])
        finally:
            member.clear()
            root.remove(member)
    if not building_count: return None
    assert __import__('sys').byteorder=='little'
    gltf={'asset':{'version':'2.0','generator':'Mönchengladbach LoD2 CityGML converter','copyright':'Geobasis NRW – Datenlizenz Deutschland Zero 2.0'},
          'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':path.stem}],
          'meshes':[{'primitives':[]}],'materials':[],'accessors':[],'bufferViews':[]}
    data=bytearray()
    def accessor(values, float_vec):
        n=len(gltf['bufferViews'])
        gltf['bufferViews'].append({'buffer':0,'byteOffset':len(data),'byteLength':len(values)*4,'target':34962 if float_vec else 34963})
        data.extend(values.tobytes())
        desc={'bufferView':n,'componentType':5126 if float_vec else 5125,'count':len(values)//(3 if float_vec else 1),'type':'VEC3' if float_vec else 'SCALAR'}
        if float_vec:
            a=np.asarray(values).reshape(-1,3)
            desc.update(min=a.min(axis=0).tolist(),max=a.max(axis=0).tolist())
        gltf['accessors'].append(desc)
        return len(gltf['accessors'])-1
    triangles=0
    for (_,label,color),(positions,normals,indices) in zip(SURFACES,records):
        if not indices: continue
        materials=gltf['materials']
        mat_id=len(materials)
        materials.append({'name':label,'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':color,'roughnessFactor':.92,'metallicFactor':0}})
        p=accessor(positions,True); no=accessor(normals,True); ix=accessor(indices,False)
        gltf['meshes'][0]['primitives'].append({'attributes':{'POSITION':p,'NORMAL':no},'indices':ix,'material':mat_id})
        triangles+=len(indices)//3
    gltf['buffers']=[{'byteLength':len(data)}]
    packed=json.dumps(gltf,separators=(',',':'),ensure_ascii=False).encode()
    packed+=b' '*((-len(packed))%4)
    name=f'{e//1000}_{n//1000}'
    filename=f'{name}.glb'
    dest=target/filename
    with dest.open('wb') as output:
        output.write(struct.pack('<4sIIII',b'glTF',2,28+len(packed)+len(data),len(packed),0x4e4f534a))
        output.write(packed)
        output.write(struct.pack('<II',len(data),0x004e4942))
        output.write(data)
    return {'id':name,'file':filename,'translation_xyz_m':[e-ORIGIN_E,0,ORIGIN_N-n],
            'buildings':building_count,'triangles':triangles,'building_bboxes_local_xz_m':footprint_bboxes}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files',nargs='+',type=Path)
    parser.add_argument('--out',required=True,type=Path)
    args=parser.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    seen=set()
    tiles=[]
    for source in sorted(args.files):
        tile=export_tile(source,args.out,seen)
        if tile:
            tiles.append(tile)
            print(tile['file'],tile['buildings'],tile['triangles'],flush=True)
    (args.out/'index.json').write_text(json.dumps({'schema':'mg-lod2-glb-1',
        'local_bbox_order':['min_x','min_z','max_x','max_z'],'tiles':tiles},ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')

if __name__=='__main__':
    main()
