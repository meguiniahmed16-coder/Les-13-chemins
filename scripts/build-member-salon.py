"""Build the member lounge mesh. Run with Python, NumPy, Pillow and Node.js."""
import gzip
import json
import math
import subprocess
from pathlib import Path

import numpy as np
from PIL import ImageColor

ROOT = Path(__file__).resolve().parents[1]
layout_js = "import {bounds,table,seats} from './membres/salon-plan.js'; console.log(JSON.stringify({bounds,table,seats}));"
layout = json.loads(subprocess.check_output(['node','--input-type=module','-e',layout_js],cwd=ROOT))
vertices = []
wall = seat_id = 0

def rgb(h):
    return np.array(ImageColor.getrgb(h))

def tri(a, b, c, col, n=None):
    if n is None:
        n = np.cross(np.subtract(b, a), np.subtract(c, a))
        n = n / max(np.linalg.norm(n), 1e-05)
    for p in (a, b, c):
        vertices.append((p, n, col, wall, seat_id))

def rounded_box(origin, dim, col, rad=0, yaw=0):
    origin, dim = (np.array(origin), np.array(dim))
    col = rgb(col)
    rad = min(rad, min(dim) / 2 - 0.0001)
    rad = max(rad, 0)
    rot = np.array([[math.cos(yaw), 0, math.sin(yaw)], [0, 1, 0], [-math.sin(yaw), 0, math.cos(yaw)]])

    def point(v):
        q = v * dim / 2
        cl = np.clip(q, -dim / 2 + rad, dim / 2 - rad)
        d = q - cl
        if rad > 0:
            q = cl + rad * d / max(1e-06, np.linalg.norm(d))
        return origin + rot @ q
    for axis, k, j in ((0, 1, 2), (1, 0, 2), (2, 0, 1)):
        ub = 1 - 2 * rad / dim[k]
        vb = 1 - 2 * rad / dim[j]
        U = np.unique([-1, (-1 - ub) / 2, -ub, ub, (1 + ub) / 2, 1])
        V = np.unique([-1, (-1 - vb) / 2, -vb, vb, (1 + vb) / 2, 1])
        for s in (-1, 1):
            for u, v in zip(U[:-1], U[1:]):
                for l, h in zip(V[:-1], V[1:]):
                    corners = []
                    for x, y in ((u, l), (v, l), (v, h), (u, h)):
                        z = np.zeros(3)
                        z[axis] = s
                        z[k] = x
                        z[j] = y
                        corners.append(point(z))
                    normal = np.cross(corners[1] - corners[0], corners[2] - corners[0])
                    if np.dot(normal, rot[:, axis]) * s < 0:
                        corners.reverse()
                    tri(corners[0], corners[1], corners[2], col)
                    tri(corners[0], corners[2], corners[3], col)

def cylinder(p, h, r0, r1, color, steps=16):
    color = rgb(color)
    x, y, z = p
    for t in range(steps):
        a, b = np.array([t, t + 1]) * 2 * math.pi / steps
        p0 = np.array([x + r0 * math.cos(a), y, z + r0 * math.sin(a)])
        p1 = np.array([x + r0 * math.cos(b), y, z + r0 * math.sin(b)])
        q0 = np.array([x + r1 * math.cos(a), y + h, z + r1 * math.sin(a)])
        q1 = np.array([x + r1 * math.cos(b), y + h, z + r1 * math.sin(b)])
        tri(p0, q0, q1, color)
        tri(p0, q1, p1, color)
        tri(q0, [x, y + h, z], q1, color)

# Staggered oak planks. Trim the end planks flush with the room perimeter.
bounds = layout['bounds']
left, right = bounds['minX'] - .10, bounds['maxX'] + .05
back, front = bounds['minZ'] - .13, bounds['maxZ'] + .05
oak = ['#B18B68','#B9936F','#BB9673','#C29A75']
for row in range(math.ceil((front-back)/.265)):
    z0=back+row*.265
    z1=min(front,z0+.265)
    for plank in range(-1,8):
        start=left+plank*1.30+(row%2)*.65
        x0,x1=max(left,start),min(right,start+1.3)
        if x1-x0>.008:
            rounded_box(((x0+x1)/2,-.055,(z0+z1)/2),(x1-x0-.003,.1,z1-z0-.003),oak[(plank+3*row)%4])
wall=1
rounded_box(((left+right)/2,1.58,-2.70),(right-left,3.15,.12),'#D6C8B5')
wall=2
rounded_box((-3.35,1.58,(back+front)/2),(.09,3.15,front-back),'#C5BCAB')
wall=0
rounded_box((0, 0.025, -0.02), (3.6, 0.04, 2.45), '#B6A18D', 0.017)
rounded_box((0, 0.048, -0.02), (3.43, 0.011, 2.28), '#DBCEB9')
for x in (-1.6, 1.6):
    rounded_box((x, 0.056, -0.02), (0.018, 0.007, 2.18), '#9C836F')

# Sofa cushions have individual seat indices.
seat_id=1
for x in (-1.95, -0.27):
    for z in (-2.18, -1.55):
        cylinder((x, 0, z), 0.2, 0.044, 0.049, '#68503D')
rounded_box((-1.11, 0.29, -1.87), (2.02, 0.29, 0.89), '#74847A', 0.07)
rounded_box((-1.11, 0.65, -2.21), (2.05, 0.73, 0.18), '#798D81', 0.075)
for x in (-2.105, -0.11):
    rounded_box((x, 0.51, -1.87), (0.17, 0.45, 0.9), '#87988B', 0.072)
for seat_id, x in enumerate((-1.68, -1.12, -0.56), 1):
    rounded_box((x, 0.49, -1.82), (0.55, 0.18, 0.67), '#A9B5A4', 0.06)
    rounded_box((x, 0.715, -2.08), (0.54, 0.44, 0.15), '#9FAB9D', 0.065)
seat_id = 1
rounded_box((-1.75, 0.67, -1.98), (0.32, 0.31, 0.115), '#CF9169', 0.067, 0.12)

# Fixed wall art and shelving follow the rear wall cutaway.
seat_id=0
wall=1
rounded_box((-0.93, 1.86, -2.59), (1.28, 0.86, 0.045), '#705C4C')
rounded_box((-0.93, 1.86, -2.56), (1.21, 0.79, 0.014), '#F4E9D4')
rounded_box((-0.93, 1.8, -2.55), (0.88, 0.39, 0.008), '#9CADA2')
rounded_box((-0.86, 1.66, -2.542), (0.73, 0.13, 0.006), '#879988')
for h in (0.68, 1.28, 1.88, 2.45):
    rounded_box((1.64, h, -2.39), (1.1, 0.044, 0.31), '#9A7559', 0.014)
for x in (1.1, 2.18):
    rounded_box((x, 1.54, -2.42), (0.045, 1.89, 0.28), '#7A604C')
for shelf in range(3):
    for i, c in enumerate(('#7D5F50', '#ADB3A3', '#CFAD8D', '#597268', '#B78A71', '#827D75')):
        h = 0.24 + 0.09 * ((i * 3 + shelf) % 4) / 3
        rounded_box((1.24 + 0.087 * i, 0.705 + shelf * 0.6 + h / 2, -2.38), (0.068, h, 0.2), c, 0.005)

wall=0
cylinder((0.5, 0, -1.92), 0.55, 0.032, 0.032, '#81674C')
cylinder((0.5, 0.54, -1.92), 0.045, 0.3, 0.3, '#AE8A6A')
cylinder((0.5, 0.59, -1.92), 0.25, 0.061, 0.025, '#946E53')
cylinder((0.5, 0.83, -1.92), 0.24, 0.16, 0.094, '#EBD2AE')

seat_id=4
for x in (1.23, 1.76):
    for z in (-1.26, -0.73):
        cylinder((x, 0.01, z), 0.27, 0.032, 0.047, '#825E49')
rounded_box((1.5, 0.32, -1.0), (0.76, 0.22, 0.72), '#A96951', 0.075)
rounded_box((1.5, 0.62, -1.34), (0.77, 0.65, 0.165), '#B57C60', 0.075)
for x in (1.14, 1.86):
    rounded_box((x, 0.485, -1), (0.11, 0.2, 0.7), '#BE8A70', 0.047)

seat_id=0
cylinder((-2.43, 0, -0.88), 0.36, 0.13, 0.19, '#C4A087')
for i in range(18):
    a = i * 2.4
    t = i % 6 / 6
    bot = np.array([-2.43, 0.34, -0.88])
    mid = bot + np.array([math.sin(a) * 0.14, 0.28 + t * 0.26, math.cos(a) * 0.14])
    tip = mid + np.array([math.sin(a) * 0.2, 0.11 - t * 0.04, math.cos(a) * 0.2])
    w = np.array([math.cos(a) * 0.055, 0, -math.sin(a) * 0.055])
    c = rgb(('#547869', '#789479', '#496E60')[i % 3])
    tri(bot, mid + w, tip, c)
    tri(bot, tip, mid - w, c)


# Flat oval-cornered wood and upholstery with a shallow rounded lip, inexpensive
# to draw on phones. A stacked perimeter avoids subdividing the large flat faces.
def board(x, y, z, width, height, depth, corner, edge, color, yaw=0):
    rings = []
    c, s = math.cos(yaw), math.sin(yaw)
    for level, inset in [(0, edge), (edge, 0), (height-edge, 0), (height, edge)]:
        ring = []
        radius = max(.001, corner-inset)
        for sx, sz, start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
            for angle in [start,start+45,start+90]:
                a=math.radians(angle)
                dx=sx*(width/2-corner)+radius*math.cos(a)
                dz=sz*(depth/2-corner)+radius*math.sin(a)
                ring.append(np.array([x+c*dx+s*dz,y+level,z-s*dx+c*dz]))
        rings.append(ring)
    color=rgb(color)
    for lower,upper in zip(rings,rings[1:]):
        for i in range(len(lower)):
            j=(i+1)%len(lower)
            tri(lower[i],upper[i],upper[j],color)
            tri(lower[i],upper[j],lower[j],color)
    for i in range(1,len(rings[0])-1):
        tri(rings[0][0],rings[0][i],rings[0][i+1],color)
        tri(rings[-1][0],rings[-1][i+1],rings[-1][i],color)


def spindle(bottom, top, r0, r1, color):
    bottom,top=np.array(bottom),np.array(top)
    axis=top-bottom
    u=np.cross(axis,[0,0,1.])
    u=u/np.linalg.norm(u)
    v=np.cross(axis/np.linalg.norm(axis),u)
    col=rgb(color)
    for i in range(8):
        a,b=math.tau*i/8,math.tau*(i+1)/8
        n0=u*math.cos(a)+v*math.sin(a)
        n1=u*math.cos(b)+v*math.sin(b)
        p,q=bottom+r0*n0,bottom+r0*n1
        h,k=top+r1*n0,top+r1*n1
        tri(p,q,k,col)
        tri(p,k,h,col)
        tri(h,k,top,col)


# Slender oak dining chairs with curved lumbar rails and upholstered seat pads.
for index, chair in enumerate(layout['seats']):
    if chair['kind']!='chair':
        continue
    seat_id=index+1
    x,z,yaw=chair['x'],chair['z'],chair['yaw']
    width,depth,height=chair['width'],chair['depth'],chair['height']
    co,si=math.cos(yaw),math.sin(yaw)

    def point(dx,y,dz):
        return x+co*dx+si*dz, y, z-si*dx+co*dz

    for side in [-1,1]:
        for end in [-1,1]:
            spindle(point(side*.196,.01,end*.192),point(side*.158,.392,end*.147),.015,.025,'#846348')
        spindle(point(side*.158,.38,-.15),point(side*.182,.824,-.210),.022,.018,'#906E50')
    board(x,.36,z,width,.053,depth,.070,.009,'#947353',yaw)
    board(x,.404,z,width-.024,height-.404,depth-.026,.080,.014,'#A8B09B' if index%2 else '#A2AC98',yaw)
    # The rail dips towards the sitter at both ends.
    for band_y,rail_height in [(.656,.058),(.782,.070)]:
        for seg in range(4):
            left,right=-.205+seg*.1025,-.205+(seg+1)*.1025
            def rail_z(px): return -.22+.050*(px/.205)**2
            a,b=rail_z(left),rail_z(right)
            p=point((left+right)/2,band_y,(a+b)/2)
            # Positive yaw rotates a local +X edge toward -Z.
            rounded_box(p,(math.hypot(right-left,b-a)+.006,rail_height,.034),'#A07B57',0,yaw-math.atan2(b-a,right-left))

seat_id=0
table=layout['table']
x,z=table['x'],table['z']
width,depth,top=table['width'],table['depth'],table['height']
board(x,top-.065,z,width,.065,depth,.10,.012,'#B08A66')
for side in [-1,1]:
    for end in [-1,1]:
        spindle((x+side*.386,.005,z+end*.771),(x+side*.35,.695,z+end*.72),.032,.046,'#89674D')
    rounded_box((x+side*.359,.635,z),(.047,.095,1.47),'#987455')
    rounded_box((x,.635,z+side*.733),(.69,.095,.047),'#987455')
# Two place mats, a ceramic bowl and two small stoneware vessels.
for offset in [-.47,.47]:
    board(x,top+.001,z+offset,.55,.006,.33,.07,.0015,'#CDB698')
cylinder((x+.065,top+.003,z-.025),.043,.083,.137,'#75877A',24)
cylinder((x+.065,top+.046,z-.025),.018,.137,.124,'#87988A',24)
cylinder((x-.075,top+.002,z+.065),.10,.038,.046,'#B17C61')
cylinder((x-.075,top+.102,z+.065),.045,.046,.024,'#A57259')
cylinder((x-.162,top+.002,z+.030),.073,.037,.041,'#CEB699')

# Two quiet art prints behind the dining table, attached to the rear wall.
wall=1
for ax, shade in [(3.46,'#9EAD99'),(4.32,'#C39478')]:
    rounded_box((ax,1.79,-2.608),(.71,.98,.048),'#80634E')
    rounded_box((ax,1.79,-2.579),(.66,.93,.013),'#EDE3CD')
    rounded_box((ax,1.79,-2.565),(.48,.72,.010),shade)
    cream=rgb('#E4D2B4'); dusk=rgb('#788B79' if ax<4 else '#AA725B')
    for col,y,r,z_layer in [(cream,1.88,.13,-2.557),(dusk,1.645,.198,-2.554)]:
        for i in range(18):
            # Abstract sunset and landscape motifs look crisp on a small screen.
            a,b=(i*math.pi/18,(i+1)*math.pi/18) if col is dusk else (i*math.tau/18,(i+1)*math.tau/18)
            tri([ax,y,z_layer],[ax+r*math.cos(a),y+r*math.sin(a),z_layer],[ax+r*math.cos(b),y+r*math.sin(b),z_layer],col)
wall=0

packed=np.zeros(len(vertices),np.dtype([('pos','<i2',3),('norm','i1',3),('color','u1',3),('wall','u1'),('seat','u1')]))
packed['pos']=np.rint(np.array([v[0] for v in vertices])*1800)
packed['norm']=np.rint(np.array([v[1] for v in vertices])*127)
packed['color']=[v[2] for v in vertices]
packed['wall']=[v[3] for v in vertices]
packed['seat']=[v[4] for v in vertices]
output=ROOT/'assets/membres/salon.bin'
output.write_bytes(gzip.compress(packed.tobytes(),9,mtime=0))
print(f'{len(packed)//3:,} triangles, {output.stat().st_size:,} bytes')
