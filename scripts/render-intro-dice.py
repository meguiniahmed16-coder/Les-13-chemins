#!/usr/bin/env python3
"""Render the current game's chapter cards and real tumbling dice, without AI.

python scripts/render-intro-dice.py --out /tmp/intro-dice [--preview]
Requires Pillow, fontconfig, Blender and ffmpeg. All artwork, crop coordinates,
pip layouts and final face angles come from the checked-in game sources.
The historical plateau-large.webp is deliberately not an input.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import sys


def arguments():
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--preview', action='store_true')
    parser.add_argument('--blender-stage', action='store_true')
    return parser.parse_args(args)


def prepare(root, out):
    from PIL import Image, ImageDraw, ImageFont
    sources = ['jeu.html', 'chapitre1-plateau.js', 'vignettes.css', 'voyage.js', 'assets/board/scene-cards-v1.png']
    game = (root / sources[0]).read_text()
    chapters = (root / sources[1]).read_text()
    journey = (root / sources[3]).read_text()
    pips = json.loads(re.search(r'const layouts=(\[\[.*?\]\]);', game).group(1))
    crops = json.loads('[' + re.search(r'const sceneArtwork=\[([\s\S]*?)\];', chapters).group(1).strip() + ']')[:3]
    angles = json.loads(re.search(r'angles=(\[\[.*?\]\]);', journey).group(1))
    assert pips == [[5], [1, 9], [1, 5, 9], [1, 3, 7, 9], [1, 3, 5, 7, 9], [1, 3, 4, 6, 7, 9]]
    assert 'La salle d’attente' in chapters
    # Rasterise the live chapter's composition at twice its display dimensions.
    # The three paintings are exact crops; no artwork or lettering is regenerated.
    scale = 2
    image = Image.new('RGB', (960 * scale, 580 * scale))
    draw = ImageDraw.Draw(image)
    for y in range(image.height):
        t = y / (image.height - 1)
        color = tuple(round(a + (b - a) * t) for a, b in zip((251, 239, 210), (230, 210, 174)))
        draw.line((0, y, image.width, y), fill=color)
    draw.rectangle((0, 0, image.width - 1, image.height - 1), outline='#70523a', width=9 * scale)
    draw.rectangle((16 * scale, 16 * scale, 944 * scale, 564 * scale), outline='#b18b52', width=scale)

    def font(size, bold=False, sans=False):
        family = ('sans-serif' if sans else 'Georgia') + (':style=Bold' if bold else '')
        filename = subprocess.check_output(['fc-match', '-f', '%{file}', family], text=True).strip()
        return ImageFont.truetype(filename, round(size * scale))

    def text(value, y, size, color, bold=False, sans=False):
        draw.text((image.width / 2, y * scale), value, anchor='mt', font=font(size, bold, sans), fill=color)

    text('LA TECTONIQUE DES ÂMES · ATLAS LITTÉRAIRE', 36, 10, '#805937', sans=True)
    text('Votre parcours', 61, 39, '#59391f', bold=True)
    text('CHEMIN I · LA SALLE D’ATTENTE', 135, 25, '#243e37', bold=True)
    draw.line((55 * scale, 156 * scale, 125 * scale, 156 * scale), fill='#a78046', width=scale)
    draw.line((835 * scale, 156 * scale, 905 * scale, 156 * scale), fill='#a78046', width=scale)
    sheet = Image.open(root / sources[4]).convert('RGB')
    for i, (x, y, w, h) in enumerate(crops):
        tile = sheet.crop((x, y, x + w, y + h)).resize((272 * scale, 272 * scale), Image.Resampling.LANCZOS)
        mask = Image.new('L', tile.size)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, tile.width - 1, tile.height - 1), radius=8 * scale, fill=255)
        image.paste(tile, ((44 + i * 300) * scale, 192 * scale), mask)
    text('0 / 3 jeux terminés', 489, 11, '#665335', sans=True)
    image.save(out / 'board-current-chapter.png')
    manifest = {
        'description': 'Cinematic composition of the actual current first-chapter components and original six dice faces.',
        'width': 800, 'height': 450, 'fps': 20, 'seconds': 7,
        'source_files': {file: hashlib.sha256((root / file).read_bytes()).hexdigest() for file in sources},
        'sprite_crops': crops, 'pips': pips, 'face_angles': angles, 'final_faces': [5, 3],
        'artwork_edits': 'Only source sprite cropping and scaling. No generated imagery.',
        'layout': 'Current first-chapter cards arranged on the current parchment board for a cinematic close-up.',
        'animation': 'Deterministic 3D translation, rotation and decaying bounces; cube support height derived from orientation.',
    }
    (out / 'provenance.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))


def render(out, preview):
    import bpy
    from mathutils import Euler, Vector
    data = json.loads((out / 'provenance.json').read_text())
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    def linear(color):
        def value(s):
            s = int(s, 16) / 255
            return s / 12.92 if s < .04045 else ((s + .055) / 1.055) ** 2.4
        return (*[value(color[i:i + 2]) for i in (1, 3, 5)], 1)

    def material(name, color, roughness=.65):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        p = m.node_tree.nodes.get('Principled BSDF')
        p.inputs['Base Color'].default_value = linear(color)
        p.inputs['Roughness'].default_value = roughness
        return m

    wood = material('Original board border #70523a', '#70523a')
    board_mat = material('Exact current chapter sprite crops', '#f1e2c5', .85)
    n = board_mat.node_tree.nodes.new('ShaderNodeTexImage')
    n.image = bpy.data.images.load(str(out / 'board-current-chapter.png'))
    board_mat.node_tree.links.new(n.outputs['Color'], board_mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    ivory = material('Original ivory dice face #fff8e3 to #e4caa0', '#f5e4c4', .27)
    dots = material('Original dice pips #57402b', '#57402b', .58)
    felt = material('Cinematic surround from site green #203b30', '#203b30', .95)
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -.19))
    bpy.context.object.name = 'Quiet green surround'
    bpy.context.object.data.materials.append(felt)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -.095))
    base = bpy.context.object
    base.name = 'Current parchment board edge'
    base.dimensions = (9.6, 5.8, .18)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    base.data.materials.append(wood)
    bevel = base.modifiers.new('Soft existing border', 'BEVEL')
    bevel.width = .04
    bevel.segments = 3
    bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, .002))
    plane = bpy.context.object
    plane.name = 'Actual first chapter board components'
    plane.scale = (4.8, 2.9, 1)
    plane.data.materials.append(board_mat)

    side = .76
    dice = []
    face_vectors = [((0, 0, 1), (1, 0, 0), (0, 1, 0)), ((1, 0, 0), (0, 0, -1), (0, 1, 0)),
                    ((0, 1, 0), (1, 0, 0), (0, 0, -1)), ((0, -1, 0), (1, 0, 0), (0, 0, 1)),
                    ((-1, 0, 0), (0, 0, 1), (0, 1, 0)), ((0, 0, -1), (-1, 0, 0), (0, 1, 0))]
    for i in range(2):
        root = bpy.data.objects.new('Original six-face die ' + str(i + 1), None)
        bpy.context.collection.objects.link(root)
        bpy.ops.mesh.primitive_cube_add(size=side)
        cube = bpy.context.object
        cube.name = 'Ivory rounded cube'
        cube.parent = root
        cube.data.materials.append(ivory)
        bevel = cube.modifiers.new('Rounded face corners', 'BEVEL')
        bevel.width = side * .08
        bevel.segments = 4
        cube.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
        for face, pips in enumerate(data['pips']):
            normal, across, up = [Vector(v) for v in face_vectors[face]]
            for pip in pips:
                row, col = divmod(pip - 1, 3)
                center = normal * (side / 2 + .001) + across * ((col - 1) * side * 15 / 62) + up * ((1 - row) * side * 15 / 62)
                bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=side * 5 / 62, depth=.003, location=center)
                dot = bpy.context.object
                dot.name = f'Original face {face + 1}, grid position {pip}'
                dot.rotation_euler = normal.to_track_quat('Z', 'Y').to_euler()
                dot.parent = root
                dot.data.materials.append(dots)
        dice.append(root)

    scene = bpy.context.scene
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (1, .94, .84, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .30
    for name, pos, power, size in [('Soft window', (-3, -4, 8), 500, 5), ('Board fill', (4, 3, 7), 180, 5)]:
        light = bpy.data.lights.new(name, 'AREA')
        light.energy = power
        light.shape = 'DISK'
        light.size = size
        obj = bpy.data.objects.new(name, light)
        bpy.context.collection.objects.link(obj)
        obj.location = pos
        obj.rotation_euler = (-obj.location).to_track_quat('-Z', 'Y').to_euler()
    camera_data = bpy.data.cameras.new('Gentle tabletop tracking shot')
    camera = bpy.data.objects.new('Gentle tabletop tracking shot', camera_data)
    bpy.context.collection.objects.link(camera)
    scene.camera = camera
    camera_data.lens = 37
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 8
    scene.cycles.use_denoising = False
    scene.cycles.max_bounces = 2
    scene.cycles.diffuse_bounces = 1
    scene.render.resolution_x, scene.render.resolution_y = data['width'], data['height']
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.fps = data['fps']
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 8
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    frames = [0, 20, 45, 70, 139] if preview else range(data['fps'] * data['seconds'])
    frames_dir = out / 'frames'
    frames_dir.mkdir(exist_ok=True)
    for frame in frames:
        t = frame / data['fps']
        q = max(0, min(1, t / data['seconds']))
        q = q * q * (3 - 2 * q)
        camera.location = (1.4 - .8 * q, -6.9 + .2 * q, 8.8 - .4 * q)
        aim = Vector((.05 + .3 * q, -.05 - .2 * q, 0))
        camera.rotation_euler = (aim - camera.location).to_track_quat('-Z', 'Y').to_euler()
        for i, die in enumerate(dice):
            u = max(0, min(1, (t - .12 * i) / 3.6))
            ease = 1 - (1 - u) ** 3
            end_x, end_y = data['face_angles'][data['final_faces'][i] - 1]
            rx, ry = -15 + (end_x + 735) * ease, 19 + (end_y + 701) * ease
            rz = (-8 if i == 0 else 12) + math.sin(u * math.pi * 5) * (1 - u) * 50
            # CSS's downward Y becomes Blender's upward image Y.
            die.rotation_euler = Euler(tuple(math.radians(a) for a in (-rx, ry, -rz)), 'XYZ')
            rotation = die.rotation_euler.to_matrix()
            support = side / 2 * sum(abs(rotation[2][j]) for j in range(3))
            bounce = .85 * (1 - u) ** 1.8 * abs(math.cos(u * math.pi * 4.5))
            die.location = (-2.65 + 3.35 * ease + 1.35 * i,
                            -.55 - .9 * ease - .27 * i + math.sin(u * math.pi * 2) * (1 - u) * .25,
                            .008 + support + bounce)
        scene.render.filepath = str(frames_dir / f'{frame:04d}.png')
        bpy.ops.render.render(write_still=True)
    print('DICE_SOURCE_RENDER_COMPLETE')


def main():
    args = arguments()
    args.out.mkdir(parents=True, exist_ok=True)
    if args.blender_stage:
        render(args.out, args.preview)
        return
    prepare(args.repo.resolve(), args.out)
    command = ['blender', '-b', '--python', str(Path(__file__).resolve()), '--', '--blender-stage', '--out', str(args.out)]
    if args.preview:
        command.append('--preview')
    subprocess.run(command, check=True)
    if not args.preview:
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-framerate', '20', '-i', str(args.out / 'frames/%04d.png'),
                        '-vf', 'hqdn3d=2.5:2.5:3.5:3.5', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p',
                        '-movflags', '+faststart', '-an', str(args.out / 'intro-des-plateau.mp4')], check=True)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(args.out / 'frames/0000.png'),
                        '-quality', '88', str(args.out / 'intro-des-plateau.webp')], check=True)


if __name__ == '__main__':
    main()
