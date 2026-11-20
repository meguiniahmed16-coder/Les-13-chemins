// Summer Man uses the CC0 MakeHuman/MPFB model. Garment authors and original
// source URLs are embedded in the GLB materials. The lounge is original geometry.
import {normaliseAvatar} from './avatar-catalog.js';

const files = new URL('../assets/membres/', import.meta.url);
const posterURL = new URL('summer-man.webp', files).href;
async function unpack(name) {
  const response = await fetch(new URL(name, files));
  if (!response.ok) throw new Error('Le modèle ne répond pas.');
  const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

let actorPromise, roomPromise;
function actor() {
  return actorPromise ??= loadActor().catch(error => { actorPromise = null; throw error; });
}
async function loadActor() {
  const file = await unpack('summer-man.bin'), header = new DataView(file);
  const jsonBytes = header.getUint32(12, true);
  const manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(file,20,jsonBytes)));
  const bin = 28 + jsonBytes;
  const view = index => {
    const v = manifest.bufferViews[index];
    return new Uint8Array(file,bin + (v.byteOffset || 0),v.byteLength);
  };
  const attribute = index => view(manifest.accessors[index].bufferView);
  const textures = await Promise.all(manifest.images.map(async item => {
    const blob = new Blob([view(item.bufferView)],{type:item.mimeType});
    if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
    const src = URL.createObjectURL(blob);
    try { const img = new Image(); img.src = src; await img.decode(); return img; } finally { URL.revokeObjectURL(src); }
  }));
  const meshes = manifest.meshes.map(mesh => {
    const p = mesh.primitives[0], a = p.attributes;
    const material = manifest.materials[p.material];
    const index = material.pbrMetallicRoughness.baseColorTexture.index;
    return {name:mesh.name, position:attribute(a.POSITION), normal:attribute(a.NORMAL), uv:attribute(a.TEXCOORD_0),
      faces:attribute(p.indices), count:manifest.accessors[p.indices].count,
      texture:manifest.textures[index].extensions.EXT_texture_webp.source,
      shapes:p.targets?.map(target => attribute(target.POSITION))};
  });
  return {meshes,textures,dark:manifest.extras.skinDark};
}
function lounge() {
  return roomPromise ??= unpack('salon.bin').catch(error => { roomPromise=null; throw error; });
}
const vertex = `
attribute vec3 position, normal, change;
attribute vec2 uv;
attribute vec3 ink;
uniform vec3 center, side, up, eye;
uniform vec2 scale, rotation;
uniform float floorOffset;
uniform mediump float room;
varying mediump vec2 coord; varying mediump vec3 color, lightNormal;
void main() {
 vec3 p = (position + change)*.0001, n = normal;
 if(room > 0.5) { p = position/1800.; }
 else {
   p.y += floorOffset;
   p.xz = vec2(rotation.x*p.x+rotation.y*p.z, -rotation.y*p.x+rotation.x*p.z);
   n.xz = vec2(rotation.x*n.x+rotation.y*n.z, -rotation.y*n.x+rotation.x*n.z);
 }
 vec3 delta = p-center;
 gl_Position = vec4(dot(delta,side)*scale.x, dot(delta,up)*scale.y, -dot(delta,eye)/20., 1.);
 coord = uv; color = ink; lightNormal=n;
}`;
const fragment = `
precision mediump float;
uniform sampler2D base, dark;
uniform vec3 multiplier;
uniform float tone, room;
varying mediump vec2 coord; varying mediump vec3 color, lightNormal;
void main() {
 vec4 albedo;
 if(room > 0.5) albedo=vec4(color,1.);
 else {
   albedo=texture2D(base,coord);
   if(albedo.a < .33) discard;
   if(tone>0.) albedo.rgb=mix(albedo.rgb,texture2D(dark,coord).rgb,tone);
 }
 float light=.79+.27*max(0.,dot(normalize(lightNormal),normalize(vec3(-.5,.7,.8))));
 gl_FragColor=vec4(albedo.rgb*multiplier*light,1.);
}`;
const hairNames=['court','texture','afro','carre'];
const topNames=['polo','coton','col-rond'];
const colors = {white:[1,1,1],night:[.47,.54,.69],shell:[1.10,.76,.52]};
const skinValue = {clair:0,dore:.24,brun:.72,profond:1};

function makeShader(gl,type,source) {
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source); gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error('Affichage 3D incompatible.');
  return shader;
}
function createView(canvas,data) {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true});
  if(!gl) throw new Error('Le navigateur ne propose pas WebGL.');
  const program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
    const shader=makeShader(gl,type,source); gl.attachShader(program,shader); gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Le modèle ne peut pas être affiché.');
  const attributes=Object.fromEntries(['position','normal','change','uv','ink'].map(id=>[id,gl.getAttribLocation(program,id)]));
  const uniforms=Object.fromEntries(['center','side','up','eye','scale','rotation','floorOffset','room','base','dark','multiplier','tone'].map(id=>[id,gl.getUniformLocation(program,id)]));
  const buffers=[];
  function buffer(value,type=gl.ARRAY_BUFFER){
    const handle=gl.createBuffer(); buffers.push(handle); gl.bindBuffer(type,handle); gl.bufferData(type,value,gl.STATIC_DRAW); return handle;
  }
  const textures=data.textures.map(image=>{
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    return texture;
  });
  const meshes=data.meshes.map(mesh=>({...mesh,position:buffer(mesh.position),normal:buffer(mesh.normal),uv:buffer(mesh.uv),
    faces:buffer(mesh.faces,gl.ELEMENT_ARRAY_BUFFER),shapes:mesh.shapes?.map(value=>buffer(value))}));
  let roomBuffer, roomSize;
  function attr(name,handle,components,type=gl.FLOAT,normalize=false,stride=0,offset=0){
    const loc=attributes[name];
    if(!handle){gl.disableVertexAttribArray(loc);gl.vertexAttrib3f(loc,0,0,0);return;}
    gl.bindBuffer(gl.ARRAY_BUFFER,handle); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,components,type,normalize,stride,offset);
  }
  return {
    addRoom(bytes){if(!roomBuffer){roomBuffer=buffer(bytes);roomSize=bytes.byteLength/14;}},
    draw(look,isRoom,yaw,portrait=false) {
      gl.useProgram(program);gl.viewport(0,0,canvas.width,canvas.height);gl.enable(gl.DEPTH_TEST);
      gl.clearColor(.94,.93,.89,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const roomOn=isRoom&&!!roomBuffer&&!portrait;
      const angle=roomOn?.45:0,pitch=roomOn?.11:.035;
      const sy=Math.sin(angle),cy=Math.cos(angle),sp=Math.sin(pitch),cp=Math.cos(pitch);
      gl.uniform3f(uniforms.side,cy,0,-sy);gl.uniform3f(uniforms.eye,sy*cp,sp,cy*cp);gl.uniform3f(uniforms.up,-sp*sy,cp,-sp*cy);
      const w=canvas.width,h=canvas.height;
      const height=portrait?.49:roomOn?2.45:1.88;
      const factor=Math.min(2/height,2*w/(h*(portrait?.44:roomOn?1.58:.90)));
      gl.uniform2f(uniforms.scale,factor*h/w,factor);
      gl.uniform3f(uniforms.center,0,portrait?1.49:roomOn?.92:.825,0);
      gl.uniform2f(uniforms.rotation,Math.cos(yaw),Math.sin(yaw));
      gl.uniform1f(uniforms.floorOffset,roomOn?.06:0);
      gl.uniform1i(uniforms.base,0);gl.uniform1i(uniforms.dark,1);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures[data.dark]);gl.activeTexture(gl.TEXTURE0);
      if(roomOn) {
        gl.uniform1f(uniforms.room,1);gl.uniform1f(uniforms.tone,0);gl.uniform3fv(uniforms.multiplier,colors.white);
        attr('position',roomBuffer,3,gl.SHORT,false,14,0);attr('normal',roomBuffer,3,gl.BYTE,true,14,6);
        attr('ink',roomBuffer,3,gl.UNSIGNED_BYTE,true,14,9);attr('uv',null);attr('change',null);
        gl.bindTexture(gl.TEXTURE_2D,textures[0]);gl.drawArrays(gl.TRIANGLES,0,roomSize);
      }
      gl.uniform1f(uniforms.room,0);attr('ink',null);
      for(const m of meshes){
        const skin=m.name==='visage-et-mains';
        if(hairNames.includes(m.name)&&m.name!==look.hair)continue;
        if(topNames.includes(m.name)&&m.name!==look.top)continue;
        if(m.name==='jean'&&look.bottom==='laine'||m.name==='laine'&&look.bottom!=='laine')continue;
        if(m.name==='lunettes'&&look.accessory==='aucun')continue;
        const shape=skin?(look.face==='doux'?m.shapes[0]:look.face==='sculpte'?m.shapes[1]:null):null;
        attr('position',m.position,3,gl.SHORT,false,8);attr('normal',m.normal,3,gl.BYTE,true,4);attr('uv',m.uv,2,gl.UNSIGNED_SHORT,true);attr('change',shape,3,gl.SHORT,false,8);
        gl.uniform1f(uniforms.tone,skin?skinValue[look.skin]:0);
        gl.uniform3fv(uniforms.multiplier,m.name==='jean'&&look.bottom==='jean-nuit'?colors.night:m.name==='lunettes'&&look.accessory==='ecaille'?colors.shell:colors.white);
        gl.bindTexture(gl.TEXTURE_2D,textures[m.texture]);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.faces);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);
      }
    },
    dispose(){for(const b of buffers)gl.deleteBuffer(b);for(const t of textures)gl.deleteTexture(t);gl.deleteProgram(program);}
  };
}

export class CheminsAvatar extends HTMLElement {
  static observedAttributes=['scene'];
  #look=normaliseAvatar(); #yaw=.11; #view; #epoch=0; #observer; #canvas; #poster; #buttons; #state; #room=0;
  constructor(){
    super();
    const root=this.attachShadow({mode:'open'});
    root.innerHTML=`<style>
      :host{display:block;width:100%;min-width:0}.portrait{position:relative;overflow:hidden;border-radius:12px;background:#f0eee5;isolation:isolate}
      canvas,img{display:block;width:100%;height:clamp(245px,45vh,435px);object-fit:contain;touch-action:pan-y}img{position:absolute;inset:0}
      .tools{display:flex;justify-content:center;gap:8px;margin:6px 0}.tools button{font:inherit;border:1px solid #abae9f;border-radius:40px;background:#f8f6ef;color:#284535;min-width:44px;min-height:40px;cursor:pointer}
      .state{font:13px/1.35 system-ui;color:#495247;margin:4px 0}[hidden]{display:none!important}
      </style><div class="portrait"><canvas tabindex="0" role="img" aria-label="Avatar masculin habillé en trois dimensions. Flèches pour tourner."></canvas><img alt="Summer Man, en polo, jean et mocassins."></div>
      <div class="tools" hidden><button type="button" aria-label="Tourner vers la gauche">↶</button><button type="button" aria-label="Tourner vers la droite">↷</button></div><p class="state" role="status"></p>`;
    this.#canvas=root.querySelector('canvas');this.#poster=root.querySelector('img');this.#poster.src=posterURL;this.#buttons=root.querySelector('.tools');this.#state=root.querySelector('.state');
    const turn=d=>{this.#yaw+=d;this.#draw();};
    root.querySelectorAll('button').forEach((btn,i)=>btn.onclick=()=>turn(i?.45:-.45));
    this.#canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn(e.key==='ArrowLeft'?-.18:.18);}});
    let previous=null;
    this.#canvas.onpointerdown=e=>{previous=e.clientX;this.#canvas.setPointerCapture(e.pointerId);};
    this.#canvas.onpointermove=e=>{if(previous!==null){turn((e.clientX-previous)*.012);previous=e.clientX;}};
    this.#canvas.onlostpointercapture=()=>{previous=null;};
    this.#canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.#view=null;this.#fallback();});
    this.#canvas.addEventListener('webglcontextrestored',()=>this.#open());
  }
  set avatar(value){this.#look=normaliseAvatar(value,true);this.#draw();}
  get avatar(){return {...this.#look};}
  connectedCallback(){this.#observer=new ResizeObserver(()=>this.#draw());this.#observer.observe(this);this.#open();}
  disconnectedCallback(){this.#epoch++;this.#observer?.disconnect();this.#view?.dispose();this.#view=null;this.#room=0;}
  attributeChangedCallback(){this.#loadRoom();this.#draw();}
  async #loadRoom(){
    if(!this.#view||this.getAttribute('scene')!=='salon'||this.#room)return;
    const epoch=this.#epoch;this.#room=1;
    try{const bytes=await lounge();if(this.#epoch!==epoch)return;this.#view?.addRoom(bytes);this.#room=2;this.#draw();}
    catch{if(this.#epoch===epoch){this.#room=0;this.#state.textContent='Le décor du salon est momentanément indisponible.';}}
  }
  async #open(){
    const epoch=++this.#epoch;this.#room=0;this.#state.textContent='Ouverture de l’avatar…';
    try{
      const data=await actor();if(epoch!==this.#epoch||!this.isConnected)return;
      this.#view=createView(this.#canvas,data);this.#poster.hidden=true;this.#buttons.hidden=false;this.#state.textContent='';
      this.#draw();this.dispatchEvent(new CustomEvent('avatar-ready'));this.#loadRoom();
    }catch{if(epoch===this.#epoch)this.#fallback();}
  }
  #fallback(){this.#poster.hidden=false;this.#buttons.hidden=true;this.#state.textContent='Portrait de référence. La vue 3D est indisponible sur cet appareil.';}
  #draw(){
    if(!this.#view)return;
    const canvas=this.#canvas,ratio=Math.min(1.75,devicePixelRatio||1);
    const w=Math.max(1,Math.round(canvas.clientWidth*ratio)),h=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    this.#view.draw(this.#look,this.getAttribute('scene')==='salon',this.#yaw);
  }
  snapshot(){
    if(!this.#view)return null;
    const canvas=this.#canvas,old=[canvas.width,canvas.height];
    try{canvas.width=240;canvas.height=240;this.#view.draw(this.#look,false,.09,true);return canvas.toDataURL('image/webp',.82);}
    finally{[canvas.width,canvas.height]=old;this.#draw();}
  }
}
if(!customElements.get('chemins-avatar'))customElements.define('chemins-avatar',CheminsAvatar);
