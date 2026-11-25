"""Render the baked production meshes; Blender does not create or retarget an avatar."""
import argparse,json,math,sys,runpy
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector

p=argparse.ArgumentParser()
p.add_argument('directory',type=Path)
p.add_argument('--shot',default='all')
p.add_argument('--samples',type=int,default=8)
p.add_argument('--preview',action='store_true')
p.add_argument('--frame',type=int)
p.add_argument('--frame-start',type=int,default=0)
p.add_argument('--frame-end',type=int,help='Exclusive final frame, for independent render batches.')
p.add_argument('--garden-directory',type=Path,help='Prepared original garden scene.json, textures, and billboard metadata.')
p.add_argument('--resume',action='store_true')
a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
root=a.directory.resolve();data=json.loads((root/'manifest.json').read_text())
needs_garden=any(s['environment']=='garden' and (a.shot=='all' or s['id']==a.shot) for s in data['shots'])
if needs_garden and not a.garden_directory:p.error('--garden-directory is required for the finale')
garden=a.garden_directory.resolve() if a.garden_directory else Path('.')
def cv(v):return (v[0],-v[2],v[1])
def converted(v):
 out=np.asarray(v,dtype=np.float32).reshape(-1,3)[:,[0,2,1]].copy();out[:,1]*=-1;return out
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
collections={}
for name in ['actors','dojo','garden','white']:
 c=bpy.data.collections.new(name);scene.collection.children.link(c);collections[name]=c
images={};materials={}
def image(name,base):
 file=str(base/name)
 if file not in images:images[file]=bpy.data.images.load(file)
 return images[file]
def material(d,base,clip=False,ambient=.30):
 key=(json.dumps(d,sort_keys=True),str(base),clip,ambient)
 if key in materials:return materials[key]
 m=bpy.data.materials.new(d.get('name','Original source material'));m.use_nodes=True
 n=m.node_tree.nodes;n.clear();l=m.node_tree.links
 out=n.new('ShaderNodeOutputMaterial');rgb=n.new('ShaderNodeRGB');rgb.outputs[0].default_value=(*d['color'],1);color=rgb.outputs[0];alpha=None
 def multiply(x,y,fac=1):
  mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=fac;l.new(x,mix.inputs[1]);l.new(y,mix.inputs[2]);return mix.outputs[0]
 if d.get('map'):
  tex=n.new('ShaderNodeTexImage');tex.image=image(d['map'],base);tex.interpolation='Linear'
  uv=n.new('ShaderNodeUVMap');uv.uv_map='uv';coords=uv.outputs[0]
  if d.get('flipY') is False:
   scale=n.new('ShaderNodeVectorMath');scale.operation='MULTIPLY';scale.inputs[1].default_value=(1,-1,1);l.new(coords,scale.inputs[0]);add=n.new('ShaderNodeVectorMath');add.operation='ADD';add.inputs[1].default_value=(0,1,0);l.new(scale.outputs[0],add.inputs[0]);coords=add.outputs[0]
  l.new(coords,tex.inputs['Vector']);color=multiply(color,tex.outputs['Color']);alpha=tex.outputs['Alpha']
 if d.get('vertexColors'):
  vc=n.new('ShaderNodeVertexColor');vc.layer_name='Original colors';color=multiply(color,vc.outputs['Color'])
 if d.get('ao'):
  tex=n.new('ShaderNodeTexImage');tex.image=image(d['ao'],base);tex.image.colorspace_settings.name='Non-Color';uv=n.new('ShaderNodeUVMap');uv.uv_map='uv1';l.new(uv.outputs[0],tex.inputs['Vector']);color=multiply(color,tex.outputs['Color'],.8)
 shader=n.new('ShaderNodeEmission' if d.get('basic') else 'ShaderNodeBsdfPrincipled')
 if d.get('basic'):l.new(color,shader.inputs['Color'])
 else:
  l.new(color,shader.inputs['Base Color']);l.new(color,shader.inputs['Emission Color']);shader.inputs['Emission Strength'].default_value=.42 if base==garden/'textures' else ambient
  shader.inputs['Roughness'].default_value=d.get('roughness',.85);shader.inputs['Metallic'].default_value=d.get('metalness',0)
 surface=shader.outputs[0]
 if alpha and d.get('alphaTest',0)>0:
  test=n.new('ShaderNodeMath');test.operation='GREATER_THAN';test.inputs[1].default_value=d['alphaTest'];l.new(alpha,test.inputs[0]);alpha=test.outputs[0]
 elif not d.get('transparent'):alpha=None
 if clip:
  attr=n.new('ShaderNodeAttribute');attr.attribute_name='Source clipping';test=n.new('ShaderNodeMath');test.operation='GREATER_THAN';test.inputs[1].default_value=0;l.new(attr.outputs['Fac'],test.inputs[0]);alpha=multiply(alpha,test.outputs[0]) if alpha else test.outputs[0]
 if alpha or d.get('opacity',1)<1:
  transparent=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader');mix.inputs[0].default_value=d.get('opacity',1)
  if alpha:l.new(alpha,mix.inputs[0])
  l.new(transparent.outputs[0],mix.inputs[1]);l.new(surface,mix.inputs[2]);surface=mix.outputs[0]
 l.new(surface,out.inputs['Surface']);materials[key]=m;return m

def mesh(d,positions,collection,base):
 vertices=converted(positions);faces=np.asarray(d['faces']).reshape(-1,3)
 name=d.get('name','Original source mesh');me=bpy.data.meshes.new(name);me.from_pydata(vertices.tolist(),[],faces.tolist());me.update()
 ob=bpy.data.objects.new(name,me);collections[collection].objects.link(ob)
 for md in d['mats']:me.materials.append(material(md,base,bool(d.get('clip')),.60 if collection=='dojo' else .30))
 for g in d.get('groups',[]):
  for poly in me.polygons[g['start']//3:(g['start']+g['count'])//3]:poly.material_index=g.get('materialIndex',0)
 for name in ['uv','uv1']:
  if d.get(name):
   uv=np.asarray(d[name],dtype=np.float32).reshape(-1,2);layer=me.uv_layers.new(name=name);vi=np.asarray([loop.vertex_index for loop in me.loops]);layer.data.foreach_set('uv',uv[vi].reshape(-1))
 if d.get('color'):
  c=np.asarray(d['color'],dtype=np.float32).reshape(len(me.vertices),-1)
  if c.shape[1]==3:c=np.column_stack((c,np.ones(len(c))))
  attr=me.color_attributes.new(name='Original colors',type='FLOAT_COLOR',domain='POINT');attr.data.foreach_set('color',c.reshape(-1))
 if d.get('clip'):
  clip=d['clip'];values=np.asarray(clip['values']);inside=(clip['cut']-values) if clip['keep']=='below' else (values-clip['cut'])
  # Clip against the original continuous rest coordinate in the shader.
  attr=me.attributes.new(name='Source clipping',type='FLOAT',domain='POINT');attr.data.foreach_set('value',inside.astype(np.float32))
 for poly in me.polygons:poly.use_smooth=True
 return ob

pool={};spec={m['id']:m for m in data['meshes']}
def update(entry,binary,collection='actors'):
 id=entry['id'];values=np.frombuffer(binary,dtype='<f4',count=entry['count']*3,offset=entry['offset'])
 if id not in pool:pool[id]=mesh(spec[id],values,collection,root)
 else:pool[id].data.vertices.foreach_set('co',converted(values).reshape(-1));pool[id].data.update()
 pool[id].hide_render=False
if any(s['environment']=='dojo' and (a.shot=='all' or s['id']==a.shot) for s in data['shots']):
 binary=(root/data['dojo']['file']).read_bytes()
 for entry in data['dojo']['meshes']:update(entry,binary,'dojo')
billboards=[];update_butterflies=None
if needs_garden:
 for d in json.loads((garden/'scene.json').read_text())['objects']:
  ob=mesh(d,d['v'],'garden',garden/'textures')
  if d.get('billboard'):billboards.append((ob,d['billboard']))
 before=set(bpy.data.objects)
 helper=Path(__file__).resolve().parents[1]/'intro/garden-butterflies.py'
 update_butterflies=runpy.run_path(str(helper))['install_butterflies'](root)
 for ob in set(bpy.data.objects)-before:
  for collection in list(ob.users_collection):collection.objects.unlink(ob)
  collections['garden'].objects.link(ob)
floorMat=material({'color':[1,1,1],'roughness':1,'basic':False},root,ambient=.82)
bpy.ops.mesh.primitive_plane_add(size=180,location=(0,0,-.003));white=bpy.context.object;white.name='Original seamless white floor';white.data.materials.append(floorMat)
for c in list(white.users_collection):c.objects.unlink(white)
collections['white'].objects.link(white)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(1,1,1,1)
lights=[]
for name,pos,color,power,shadow in [('Source sun',(-3,8,-3),(1,.94,.86),1.65,True),('Source fill',(3,4,2),(.75,.83,1),.50,False)]:
 d=bpy.data.lights.new(name,'SUN');d.energy=power;d.color=color;d.angle=0;d.use_shadow=shadow;ob=bpy.data.objects.new(name,d);scene.collection.objects.link(ob);ob.location=cv(pos);ob.rotation_euler=(Vector((0,0,0))-ob.location).to_track_quat('-Z','Y').to_euler();lights.append(ob)
d=bpy.data.lights.new('Soft indoor illumination','AREA');d.energy=75;d.shape='DISK';d.size=4;soft=bpy.data.objects.new(d.name,d);scene.collection.objects.link(soft);soft.location=cv((0,2.25,-.8));soft.rotation_euler=(Vector(cv((0,1,.6)))-soft.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Production directed camera');camera=bpy.data.objects.new(d.name,d);scene.collection.objects.link(camera);scene.camera=camera;d.clip_start=.07;d.clip_end=180;d.sensor_fit='VERTICAL'
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=a.samples;scene.cycles.use_denoising=False;scene.cycles.max_bounces=1;scene.cycles.diffuse_bounces=0;scene.cycles.glossy_bounces=0;scene.cycles.transparent_max_bounces=64
scene.render.resolution_x=data['width'];scene.render.resolution_y=data['height'];scene.render.resolution_percentage=100;scene.render.fps=data['fps'];scene.render.image_settings.file_format='PNG';scene.render.threads_mode='FIXED';scene.render.threads=8
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0
scene.render.use_persistent_data=True
for shot in data['shots']:
 if a.shot!='all' and shot['id']!=a.shot:continue
 for name in ['dojo','garden','white']:collections[name].hide_render=name!=shot['environment']
 env=shot['environment'];scene.world.node_tree.nodes['Background'].inputs[1].default_value=1 if env=='white' else 0
 soft.hide_render=True;lights[0].data.energy=.95 if env=='white' else 1.65;lights[1].data.energy=.30 if env=='white' else .50
 destination=root/'rendered'/shot['id'];destination.mkdir(parents=True,exist_ok=True)
 frames=shot['frames']
 if a.preview:frames=[frames[len(frames)//2]]
 if a.frame is not None:frames=[frame for frame in shot['frames'] if frame['frame']==a.frame]
 frames=[frame for frame in frames if frame['frame']>=a.frame_start and (a.frame_end is None or frame['frame']<a.frame_end)]
 for frame in frames:
  output=destination/f"{frame['frame']:04d}.png"
  if a.resume and output.exists():continue
  for ob in collections['actors'].objects:ob.hide_render=True
  binary=(root/frame['file']).read_bytes()
  for entry in frame['meshes']:update(entry,binary)
  if update_butterflies and env=='garden':update_butterflies(round(frame['time']*data['fps']))
  eye=frame['camera']['eye'];aim=frame['camera']['aim']
  for ob,meta in billboards:
   x,y,z=meta['position'];sx,sy,sz=meta['scale'];ob.location=cv((x,y,z));ob.scale=(sx,sz,sy);ob.rotation_euler.z=math.atan2(eye[0]-x,eye[2]-z)
  camera.location=cv(eye);camera.rotation_euler=(Vector(cv(aim))-camera.location).to_track_quat('-Z','Y').to_euler();d.angle_y=math.radians(frame['camera']['fov'])
  scene.render.filepath=str(output);bpy.ops.render.render(write_still=True);print('PROMOTION_FRAME',shot['id'],frame['frame'],flush=True)
print('PROMOTION_RENDER_COMPLETE',flush=True)
