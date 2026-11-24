import bpy,json,math,sys,argparse
from pathlib import Path
from mathutils import Vector
import numpy as np
parser=argparse.ArgumentParser(description='Render a clean travelling shot using the exact exported V27 salon interior.')
parser.add_argument('directory',type=Path)
parser.add_argument('--preview',action='store_true')
parser.add_argument('--seconds',type=float,default=8)
parser.add_argument('--fps',type=int,default=20)
parser.add_argument('--samples',type=int,default=8)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
root=args.directory.resolve();data=json.loads((root/'scene.json').read_text());total_frames=round(args.seconds*args.fps)
if total_frames<2:raise ValueError('At least two frames are required.')
def cv(a):return (a[0],-a[2],a[1])
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
images={}
def img(name):
 if name not in images:images[name]=bpy.data.images.load(str(root/'textures'/name))
 return images[name]
def mat(d,i):
 m=bpy.data.materials.new('Original source material '+str(i));m.use_nodes=True;m.cycles.emission_sampling='NONE';n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*d['color'],1);p.inputs['Roughness'].default_value=d['roughness'];p.inputs['Metallic'].default_value=d['metalness']
 color=None
 if d.get('map'):
  t=n.new('ShaderNodeTexImage');t.image=img(d['map']);uv=n.new('ShaderNodeUVMap');uv.uv_map='uv';l.new(uv.outputs['UV'],t.inputs['Vector']);color=t.outputs['Color']
 if d['vertexColors']:
  t=n.new('ShaderNodeVertexColor');t.layer_name='Original linear colors';color=t.outputs['Color']
 if d.get('ao'):
  t=n.new('ShaderNodeTexImage');t.image=img(d['ao']);t.image.colorspace_settings.name='Non-Color';uv=n.new('ShaderNodeUVMap');uv.uv_map='uv1';l.new(uv.outputs['UV'],t.inputs['Vector']);mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.8;l.new(color,mix.inputs[1]);l.new(t.outputs['Color'],mix.inputs[2]);color=mix.outputs[0]
 if color:
  l.new(color,p.inputs['Base Color']);l.new(color,p.inputs['Emission Color'])
 else:p.inputs['Emission Color'].default_value=(*d['color'],1)
 p.inputs['Emission Strength'].default_value=.42
 if d['opacity']<1:
  trans=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader');mix.inputs[0].default_value=d['opacity'];l.new(trans.outputs[0],mix.inputs[1]);l.new(p.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],n.get('Material Output').inputs['Surface'])
 return m
for oi,d in enumerate(data['objects']):
 v=np.array(d['v']).reshape(-1,3);v=v[:,[0,2,1]];v[:,1]*=-1;faces=np.array(d['faces']).reshape(-1,3);me=bpy.data.meshes.new(d['name']);me.from_pydata(v.tolist(),[],faces.tolist());me.update();o=bpy.data.objects.new(d['name'],me);bpy.context.collection.objects.link(o);o.visible_shadow=d['shadow']
 for mi,m in enumerate(d['mats']):o.data.materials.append(mat(m,f'{oi}-{mi}'))
 for g in d['groups']:
  for poly in me.polygons[g['start']//3:(g['start']+g['count'])//3]:poly.material_index=g['materialIndex']
 if d['color']:
  c=np.array(d['color']).reshape(-1,3);c=np.column_stack((c,np.ones(len(c))));a=me.color_attributes.new(name='Original linear colors',type='FLOAT_COLOR',domain='POINT');a.data.foreach_set('color',c.ravel())
 for name in ['uv','uv1']:
  if d[name]:
   uv=np.array(d[name]).reshape(-1,2);layer=me.uv_layers.new(name=name)
   for p in me.polygons:
    for li in p.loop_indices:layer.data[li].uv=uv[me.loops[li].vertex_index]
 if d['n']:
  ns=np.array(d['n']).reshape(-1,3);ns=ns[:,[0,2,1]];ns[:,1]*=-1
  for p in me.polygons:p.use_smooth=True
  me.normals_split_custom_set_from_vertices(ns.tolist())
scene=bpy.context.scene;scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(1,.944,.807,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=0
for name,pos,color,power,shadow in [('Original sun',(-4,7,3),(1,.784,.491),1.65,True),('Original fill',(3,2,-4),(.546,.694,.846),.36,False)]:
 d=bpy.data.lights.new(name,'SUN');d.energy=power;d.color=color;d.angle=0;d.use_shadow=shadow;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=cv(pos);o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Salon source cinematic camera');cam=bpy.data.objects.new('Salon source cinematic camera',d);bpy.context.collection.objects.link(cam);scene.camera=cam;d.type='PERSP';d.lens=23;d.clip_start=.07;d.clip_end=180
scene.render.resolution_x=800;scene.render.resolution_y=450;scene.render.resolution_percentage=100;scene.render.engine='CYCLES';scene.cycles.samples=args.samples;scene.cycles.use_denoising=False;scene.cycles.max_bounces=1;scene.cycles.diffuse_bounces=0;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.render.fps=args.fps;scene.render.threads_mode='FIXED';scene.render.threads=8
frames=[0,total_frames-1] if args.preview else list(range(total_frames))
(root/'frames').mkdir(exist_ok=True)
for frame in frames:
 t=frame/(total_frames-1);s=t*t*(3-2*t)
 eye=(1.5-1.1*s,1.52+.03*s,2.20-.12*s);target=(-.65-.30*s,.94,-.55+.15*s)
 cam.location=cv(eye);cam.rotation_euler=(Vector(cv(target))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(root/'frames'/f'{frame:04d}.png');bpy.ops.render.render(write_still=True)
print('SALON_SOURCE_RENDER_COMPLETE')
