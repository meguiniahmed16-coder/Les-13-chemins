"""Extract the furnished V27 room from the approved Salon-V27-Duo.html."""
import argparse
import base64
import gzip
import json
import re
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'assets' / 'membres'


def extract(source):
    html = source.read_text()
    meshes = json.loads(re.findall(r'const roomMeshes=(\[.*?\]);', html)[-1])

    def block(ref):
        number = ref.removeprefix('@R')
        match = re.search(fr'id="bin-{number}"[^>]*>([^<]+)', html)
        if not match:
            raise ValueError(f'Missing V27 block {ref}')
        return zlib.decompress(base64.b64decode(match[1]))

    mesh = meshes[0]
    vertices = bytearray(block(mesh['blob']))
    for part, start, count in mesh['parts']:
        # The original padding byte now carries the object number for picking
        # and cutaway walls. Leave positions, normals, colours and materials intact.
        vertices[start*14+13:(start+count)*14:14] = bytes([part])*count
    shadow = block(re.findall(r'const floorOcclusion="([^"]+)"', html)[-1])
    if len(shadow) != 768*768 or len(vertices) != 14*sum(p[2] for p in mesh['parts']):
        raise ValueError('Unexpected V27 mesh or light map')
    for name, data in [('salon-v27.bin', vertices), ('salon-v27-light.bin', shadow)]:
        (OUT / name).write_bytes(gzip.compress(data, 9, mtime=0))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('reference', type=Path)
    extract(parser.parse_args().reference)
