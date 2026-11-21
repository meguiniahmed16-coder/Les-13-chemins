"""Rebuild the clerical shirt from the public, CC0 V27 tailoring by ken1138.
Run with Python, NumPy, SciPy and Pillow. The site serves the finished asset.
"""
import gzip
import hashlib
import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components

ROOT = Path(__file__).resolve().parents[1] / "assets-source" / "salon-v27"
MANIFEST = json.loads((ROOT / "assets.json").read_text())
TYPES = {"Uint16Array": "<u2", "Int16Array": "<i2", "Uint8Array": "u1", "Int8Array": "i1"}


def resource(name):
    offset, size, _ = MANIFEST["files"][name + ".bin"]
    content = bytearray()
    for filename in MANIFEST["packs"]:
        path = ROOT / filename
        length = path.stat().st_size
        if offset >= length:
            offset -= length
            continue
        with path.open("rb") as source:
            source.seek(offset)
            content.extend(source.read(size - len(content)))
        if len(content) == size:
            break
        offset = 0
    data = gzip.decompress(content)
    header_size = struct.unpack_from("<I", data)[0]
    header = json.loads(data[4:4 + header_size])
    for key, field in header.items():
        if isinstance(field, dict) and field.get("type") in TYPES:
            start = 4 + header_size + field["offset"]
            header[key] = np.frombuffer(data[start:start + field["bytes"]], dtype=TYPES[field["type"]])
    return header


def unit(a):
    return a / np.maximum(1e-9, np.linalg.norm(a, axis=-1, keepdims=True))


def cloth_frame(indices, weights, body, normals):
    a, b, c = body[indices].transpose(1, 0, 2)
    origin = (body[indices] * weights[:, :, None]).sum(axis=1)
    normal = unit((normals[indices] * weights[:, :, None]).sum(axis=1))
    tangent = b - a
    tangent = unit(tangent - normal * (tangent * normal).sum(axis=1)[:, None])
    return origin, normal, tangent, np.cross(normal, tangent)


def binding_weights(binding):
    uv = binding[:, 3:5] / 65535.0
    return np.column_stack((uv, 1 - uv.sum(axis=1)))


def rest_points(binding, body, normals):
    origin, normal, tangent, along = cloth_frame(binding[:, :3], binding_weights(binding), body, normals)
    return (origin + normal * binding[:, 5:6] * .01
            + tangent * binding[:, 6:7].view("<i2") * .01
            + along * binding[:, 7:8].view("<i2") * .01)


def tailoring(body, triangles, normals, mesh):
    binding = mesh["binding"].reshape(-1, 8).copy()
    pos = rest_points(binding, body, normals)
    faces = mesh["faces"].reshape(-1, 3)
    graph = csr_matrix((np.ones(faces.size), (faces.ravel(), np.roll(faces, 1, axis=1).ravel())),
                       shape=(len(pos), len(pos)))
    panels = connected_components(graph, directed=False)[1]
    # Gently draw in the lower torso and extend the tails down inside the trousers.
    # Bind every altered hem vertex at its new height so it still bends with the pelvis.
    waist = body[triangles, 1]
    band = triangles[(waist.min(axis=1) < 115) & (waist.max(axis=1) > 83)]
    a, b, c = body[band].transpose(1, 0, 2)
    ab, ac = b - a, c - a
    for i in np.where((panels < 2) & (pos[:, 1] < 111))[0]:
        x, y, z = pos[i]
        inset = np.clip((111 - y) / 14, 0, 1)
        y -= 7.1 * inset**1.5
        origin = np.array([0., y, -3.5])
        ray = unit(np.array([x, 0., z + 3.5]))
        cross = np.cross(ray, ac)
        det = (ab * cross).sum(axis=1)
        inv = np.divide(1, det, out=np.zeros_like(det), where=abs(det) > 1e-8)
        rel = origin - a
        v = inv * (rel * cross).sum(axis=1)
        q = np.cross(rel, ab)
        w = inv * (q * ray).sum(axis=1)
        t = inv * (ac * q).sum(axis=1)
        hits = np.flatnonzero((v >= 0) & (w >= 0) & (v + w <= 1) & (t > 0))
        if not len(hits):
            raise ValueError("Could not fit shirt tail to waist")
        hit = hits[np.argmin(t[hits])]
        tri = band[hit]
        weights = np.array([1 - v[hit] - w[hit], v[hit], w[hit]])
        binding[i, :5] = [*tri, *np.rint(weights[:2] * 65535).astype(int)]
        # Preserve exactly the native side seam above the waistband.
        o, normal, tangent, along = cloth_frame(tri[None], weights[None], body, normals)
        distance = np.hypot(x, z + 3.5)
        dest = origin + ray * (distance * (1-inset) + (t[hit]+.55)*inset)
        delta = dest - o[0]
        offsets = np.rint(np.stack([normal[0], tangent[0], along[0]]) @ delta * 100).astype(int)
        binding[i, 5:] = [max(25, offsets[0]), offsets[1] % 65536, offsets[2] % 65536]
    # The stand and the neckline use the same offset across their shared seam.
    # Ease the sleeves around the arm joints and give the stand enough thickness
    # for a clean edge on shoulders and necks of different shapes.
    y, x = pos[:, 1], abs(pos[:, 0])
    neck_edge = np.clip((y - 136) / 2, 0, 1) * np.clip((12 - x) / 5, 0, 1)
    binding[:, 5] += np.rint(24 * neck_edge).astype("<u2")
    return binding, rest_points(binding, body, normals), panels


def uniform_material(points, panels):
    x, y, z = points.T
    sleeve = np.isin(panels, [2, 3, 6, 7])
    front = panels == 0
    back = panels == 1
    stand = (panels == 4) | (panels == 5)
    arm_length = (.49 * (abs(x)-19) + .873 * (137-y))
    # Flat-felled shoulder seams, back yoke, barrel cuffs and a folded left breast pocket.
    def ridge(d, width):
        return np.exp(-np.square(d / width))
    def seam(d, weight=1):
        return weight * (-13*ridge(d, .23) + 8*ridge(d-.38, .20))
    cotton = (1.3*np.sin((x+.36*z)*19) + .8*np.cos((y+.12*x)*23)
              + 1.2*np.sin(x*.43+y*.14+z*.095))
    shade = 49 + cotton + 5*ridge(y-131,11) + 2.5*np.cos((x+3)*.17)
    # Shallow folds radiate from the armhole and settle towards the waist.
    fold = y - (127 - .40*(16-abs(x)) - .024*(16-abs(x))**2)
    shade += front * (3.8*ridge(fold-1.3,1) - 5.5*ridge(fold,.78)) * np.clip((abs(x)-4)/7,0,1)
    shade += sleeve * (3.7*np.cos(arm_length*.93 + z*.45) * ridge(arm_length-36,9)
                       + seam(arm_length-45.8) - 4*(arm_length>45.8))
    armscye = abs(x) - (18.2 + .095*(136-y) - .016*(136-y)**2)
    shoulder_zone = np.clip((y-117)/4,0,1)*np.clip((142-y)/3,0,1)
    shade += (front|back)*seam(armscye,.82)*shoulder_zone
    shade += back*seam(y-130.1+.013*x*x,.8)
    pocket_x, pocket_y = x-8.6, y-119.5
    bottom = -5.2 + np.maximum(abs(pocket_x)-3.3,0)*.92
    pocket = (abs(pocket_x)<4.6) & (pocket_y>bottom) & (pocket_y<5.3) & front
    shade += pocket * (1.5 + seam(pocket_y-4.3) + seam(abs(pocket_x)-4.3,.85) + seam(pocket_y-bottom-.30,.85))
    shade += front * (-3.8*ridge(pocket_y-5.35,.21)*(abs(pocket_x)<4.6))
    # Placket, double topstitch and small buttonholes carry on to the tucked tail.
    shade += front * ((abs(x)<1.55)*2.8 + seam(abs(x)-1.55) + 2.4*ridge(abs(x)-1.10,.14))
    for button_y in (134.9,128.1,121.3,114.5,107.7,100.9,94.1):
        radius = np.hypot(x, y-button_y)
        shade += front * (16*ridge(radius-.47,.13)-16*ridge(radius-.61,.13)
                          + 11*ridge(x+.13,.32)*ridge(y-button_y-.14,.25)
                          - 12*ridge(x-.11,.12)*ridge(y-button_y,.24))
    base = np.stack([shade-1,shade+1,shade+3],axis=1)
    base[stand] *= .74
    # White tab cut into the front of the integral stand, in centimetres.
    shape = abs(x)/2.12
    lower = 138.26+.058*x*x
    delta = y-lower
    ivory = (panels==5)&(shape<1)&(delta>.12)&(delta<1.74)
    base[ivory] = np.stack([241+cotton*.32,239+cotton*.32,230+cotton*.32],axis=1)[ivory]
    return np.clip(base,0,255)


def bake_texture(coords, faces, pos, panels, size=1024):
    uv = coords.reshape(-1,2).astype(float) / 65535
    uv[:,1] = 1 - uv[:,1]
    uv *= size-1
    locations = np.zeros((size,size,3),dtype=np.float32)
    material = np.full((size,size),-1,dtype=np.int8)
    for tri in faces:
        t = uv[tri]
        (u0,v0),(u1,v1) = np.clip([np.floor(t.min(axis=0)),np.ceil(t.max(axis=0))],0,size-1).astype(int)
        yy,xx = np.mgrid[v0:v1+1,u0:u1+1]
        a,b = t[1]-t[0], t[2]-t[0]
        det = a[0]*b[1]-a[1]*b[0]
        if abs(det)<1e-8:
            continue
        px,py = xx-t[0,0],yy-t[0,1]
        w1,w2 = (px*b[1]-py*b[0])/det,(py*a[0]-px*a[1])/det
        inside = (w1>=0)&(w2>=0)&(w1+w2<=1)
        points = pos[tri[0]]+w1[:,:,None]*(pos[tri[1]]-pos[tri[0]])+w2[:,:,None]*(pos[tri[2]]-pos[tri[0]])
        locations[yy[inside],xx[inside]]=points[inside]
        material[yy[inside],xx[inside]]=panels[tri[0]]
    content = material>=0
    rgb = np.zeros((size,size,3),dtype=np.uint8)
    rgb[content] = uniform_material(locations[content],material[content])
    # Extend the nearest edge into UV gutters to avoid pale seams at distance.
    nearest = distance_transform_edt(~content,return_distances=False,return_indices=True)
    rgb = rgb[tuple(nearest)]
    image = io.BytesIO()
    Image.fromarray(rgb).save(image,format="WEBP",quality=94,method=6)
    return image.getvalue()


def pack(name, fields):
    header = {"id":name,"group":"hauts"}
    buf = bytearray()
    for key,(kind,data) in fields.items():
        header[key] = {"type":kind,"offset":len(buf),"bytes":len(data)}
        buf.extend(data)
    meta = json.dumps(header,separators=(",",":")).encode()
    meta += b" " * (-len(meta)%4)
    return gzip.compress(struct.pack("<I",len(meta))+meta+buf,compresslevel=9,mtime=0)


def build():
    shirt = resource("wear-mh1330")
    body = resource("mesh-body")
    pos = body["position"].reshape(-1,3).astype(float)*.01
    normal = unit(body["normal"].reshape(-1,3))
    binding,rest,panels = tailoring(pos,body["faces"].reshape(-1,3),normal,shirt)
    image = bake_texture(shirt["uv"],shirt["faces"].reshape(-1,3),rest,panels)
    fields = {"binding":("Uint16Array",binding.tobytes()),"uv":("Uint16Array",shirt["uv"].tobytes()),
              "faces":("Uint16Array",shirt["faces"].tobytes()),"coverage":("Uint16Array",shirt["coverage"].tobytes()),
              "image":("Uint8Array",image)}
    name = "clergy-shirt"
    data = pack(name, fields)
    filename = name+".pack"
    packs = [p for p in MANIFEST["packs"] if p!=filename]
    offset = sum((ROOT/p).stat().st_size for p in packs)
    (ROOT/filename).write_bytes(data)
    MANIFEST["packs"] = [*packs,filename]
    MANIFEST["files"]["wear-"+name+".bin"] = [offset,len(data),hashlib.sha256(data).hexdigest()]
    (ROOT/"assets.json").write_text(json.dumps(MANIFEST,ensure_ascii=False,separators=(",",":"))+"\n")


if __name__=="__main__":
    build()
