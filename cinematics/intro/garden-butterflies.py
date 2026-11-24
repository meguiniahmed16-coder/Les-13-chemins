"""Install the source garden's butterflies in the current Blender scene.

Use export-butterflies.mjs first. install_butterflies(directory) returns an
update(frame_index) callback. Meshes are shared; all motion is supplied by the
unmodified Three.js flutter(dt) export. Three (x,y,z) becomes Blender (x,-z,y).
"""
import json
from pathlib import Path


def install_butterflies(directory):
    import bpy
    from mathutils import Matrix

    directory = Path(directory)
    data = json.loads((directory / 'butterflies.json').read_text())
    basis = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
    inverse = basis.inverted()
    collection = bpy.data.collections.new('Original garden butterflies')
    bpy.context.scene.collection.children.link(collection)
    material = bpy.data.materials.new('Original papillon-blanc unlit alphaTest .22')
    material.use_nodes = True
    material.use_backface_culling = False
    if hasattr(material, 'cycles') and hasattr(material.cycles, 'emission_sampling'):
        material.cycles.emission_sampling = 'NONE'
    nodes = material.node_tree.nodes
    nodes.clear()
    links = material.node_tree.links
    image = nodes.new('ShaderNodeTexImage')
    image.image = bpy.data.images.load(str(directory / 'textures' / data['material']['map']))
    image.image.colorspace_settings.name = 'sRGB'
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Strength'].default_value = 1
    links.new(image.outputs['Color'], emission.inputs['Color'])
    alpha_test = nodes.new('ShaderNodeMath')
    alpha_test.operation = 'GREATER_THAN'
    alpha_test.inputs[1].default_value = data['material']['alphaTest']
    links.new(image.outputs['Alpha'], alpha_test.inputs[0])
    transparent = nodes.new('ShaderNodeBsdfTransparent')
    mix = nodes.new('ShaderNodeMixShader')
    links.new(alpha_test.outputs[0], mix.inputs[0])
    links.new(transparent.outputs[0], mix.inputs[1])
    links.new(emission.outputs[0], mix.inputs[2])
    output = nodes.new('ShaderNodeOutputMaterial')
    links.new(mix.outputs[0], output.inputs['Surface'])

    objects = {}
    for name, part in data['parts'].items():
        vertices = [(part['v'][i], -part['v'][i + 2], part['v'][i + 1]) for i in range(0, len(part['v']), 3)]
        faces = [part['faces'][i:i + 3] for i in range(0, len(part['faces']), 3)]
        mesh = bpy.data.meshes.new('Original butterfly shared ' + name)
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        layer = mesh.uv_layers.new(name='Original UV')
        for loop in mesh.loops:
            vertex = loop.vertex_index
            layer.data[loop.index].uv = part['uv'][2 * vertex:2 * vertex + 2]
        for polygon in mesh.polygons:
            polygon.use_smooth = True
        normals = [(part['n'][i], -part['n'][i + 2], part['n'][i + 1]) for i in range(0, len(part['n']), 3)]
        mesh.normals_split_custom_set_from_vertices(normals)
        mesh.materials.append(material)
        objects[name] = []
        for index in range(data['count']):
            obj = bpy.data.objects.new(f'Original butterfly {index:02d} {name}', mesh)
            collection.objects.link(obj)
            obj.visible_shadow = False
            objects[name].append(obj)

    def update(frame_index):
        frame = data['frames'][frame_index]
        for name, instances in objects.items():
            values = frame['parts'][name]
            for index, obj in enumerate(instances):
                start = index * 16
                matrix = Matrix([values[start + j * 4:start + j * 4 + 4] for j in range(4)]).transposed()
                obj.matrix_world = basis @ matrix @ inverse

    update(0)
    return update
