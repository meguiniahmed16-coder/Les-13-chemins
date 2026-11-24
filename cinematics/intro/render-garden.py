import bpy,json,math,sys,argparse,runpy
from pathlib import Path
from mathutils import Vector
import numpy as np
parser=argparse.ArgumentParser(description='Render a clean travelling shot using the exact exported V27 garden and original animated butterflies.')
parser.add_argument('directory',type=Path)
parser.add_argument('--preview',action='store_true')
parser.add_argument('--resume',action='store_true',help='Keep completed PNG frames when resuming an interrupted render.')
parser.add_argument('--seconds',type=float,default=6)
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
 m=bpy.data.materials.new('Original garden material '+str(i));m.use_nodes=True;m.cycles.emission_sampling='NONE';n=m.node_tree.nodes;n.clear();l=m.node_tree.links
 out=n.new('ShaderNodeOutputMaterial');rgb=n.new('ShaderNodeRGB');rgb.outputs[0].default_value=(*d['color'],1);color=rgb.outputs[0];alpha=None
 def multiply(a,b,factor=1):
  node=n.new('ShaderNodeMixRGB');node.blend_type='MULTIPLY';node.inputs[0].default_value=factor;l.new(a,node.inputs[1]);l.new(b,node.inputs[2]);return node.outputs[0]
 if d.get('map'):
  tex=n.new('ShaderNodeTexImage');tex.image=img(d['map']);uv=n.new('ShaderNodeUVMap');uv.uv_map='uv';l.new(uv.outputs['UV'],tex.inputs['Vector']);color=multiply(color,tex.outputs['Color']);alpha=tex.outputs['Alpha']
 if d['vertexColors']:
  vc=n.new('ShaderNodeVertexColor');vc.layer_name='Original linear colors';color=multiply(color,vc.outputs['Color'])
 if d.get('ao'):
  tex=n.new('ShaderNodeTexImage');tex.image=img(d['ao']);tex.image.colorspace_settings.name='Non-Color';uv=n.new('ShaderNodeUVMap');uv.uv_map='uv1';l.new(uv.outputs['UV'],tex.inputs['Vector']);color=multiply(color,tex.outputs['Color'],.8)
 if d.get('basic'):
  shader=n.new('ShaderNodeEmission');l.new(color,shader.inputs['Color']);shader.inputs['Strength'].default_value=1
 else:
  shader=n.new('ShaderNodeBsdfPrincipled');l.new(color,shader.inputs['Base Color']);l.new(color,shader.inputs['Emission Color']);shader.inputs['Emission Strength'].default_value=.42;shader.inputs['Roughness'].default_value=d['roughness'];shader.inputs['Metallic'].default_value=d['metalness']
 surface=shader.outputs[0]
 if d.get('alphaTest',0)>0 and alpha:
  test=n.new('ShaderNodeMath');test.operation='GREATER_THAN';test.inputs[1].default_value=d['alphaTest'];l.new(alpha,test.inputs[0]);alpha=test.outputs[0]
 elif not d.get('transparent'):alpha=None
 if alpha or d['opacity']<1:
  transparent=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader');mix.inputs[0].default_value=d['opacity']
  if alpha:
   mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';mul.inputs[1].default_value=d['opacity'];l.new(alpha,mul.inputs[0]);l.new(mul.outputs[0],mix.inputs[0])
  l.new(transparent.outputs[0],mix.inputs[1]);l.new(surface,mix.inputs[2]);surface=mix.outputs[0]
 l.new(surface,out.inputs['Surface']);return m
billboards=[]
for oi,d in enumerate(data['objects']):
 v=np.array(d['v']).reshape(-1,3);v=v[:,[0,2,1]];v[:,1]*=-1;faces=np.array(d['faces']).reshape(-1,3);me=bpy.data.meshes.new(d['name']);me.from_pydata(v.tolist(),[],faces.tolist());me.update();o=bpy.data.objects.new(d['name'],me);bpy.context.collection.objects.link(o);o.visible_shadow=d['shadow'];o.visible_diffuse=False;o.visible_glossy=False
 if d.get('billboard'):billboards.append((o,d['billboard']))
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
update_butterflies=runpy.run_path(str(Path(__file__).with_name('garden-butterflies.py')))['install_butterflies'](root)
scene=bpy.context.scene;scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(1,.944,.807,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=0
for name,pos,color,power,shadow in [('Original sun',(-4,7,3),(1,.784,.491),1.65,True),('Original fill',(3,2,-4),(.546,.694,.846),.36,False)]:
 d=bpy.data.lights.new(name,'SUN');d.energy=power;d.color=color;d.angle=0;d.use_shadow=shadow;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=cv(pos);o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Original garden cinematic camera');cam=bpy.data.objects.new('Original garden cinematic camera',d);bpy.context.collection.objects.link(cam);scene.camera=cam;d.type='PERSP';d.lens=21;d.clip_start=.07;d.clip_end=180
scene.render.resolution_x=800;scene.render.resolution_y=450;scene.render.resolution_percentage=100;scene.render.engine='CYCLES';scene.cycles.samples=args.samples;scene.cycles.use_denoising=False;scene.cycles.max_bounces=1;scene.cycles.diffuse_bounces=0;scene.cycles.transparent_max_bounces=64;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.render.fps=args.fps;scene.render.threads_mode='FIXED';scene.render.threads=8
frames=[0,total_frames-1] if args.preview else list(range(total_frames))
(root/'frames').mkdir(exist_ok=True)
for frame in frames:
 output=root/'frames'/f'{frame:04d}.png'
 if args.resume and output.exists():
  saved=output.read_bytes()
  if saved.startswith(b'\x89PNG\r\n\x1a\n') and saved.endswith(b'IEND\xaeB`\x82'):
   print(f'Keeping completed frame {frame:04d}',flush=True);continue
 t=frame/(total_frames-1);s=t*t*(3-2*t)
 eye=(1.4-.9*s,1.35-.10*s,-3+2.5*s);target=(.1,2.0,8.3)
 update_butterflies(frame)
 for ob,meta in billboards:
  x,y,z=meta['position'];sx,sy,sz=meta['scale'];ob.location=cv((x,y,z));ob.scale=(sx,sz,sy);ob.rotation_euler.z=math.atan2(eye[0]-x,eye[2]-z)
 cam.location=cv(eye);cam.rotation_euler=(Vector(cv(target))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(output);bpy.ops.render.render(write_still=True)
print('GARDEN_SOURCE_RENDER_COMPLETE')
