// Summer Man uses the CC0 MakeHuman/MPFB model. Garment authors and original
// source URLs are embedded in the GLB materials. The lounge is original geometry.
import {legacyStudio} from './studio-look.js';
import {loadStudio} from './studio-model.js';
import {createDrawer} from './studio-drawer.js?v=salon32';
import {cameraProjection,newCamera,SalonMotion} from './salon-navigation.js?v=salon29';
import {salonMarkup,bindSalon} from './salon-controls.js?v=salon29';

const portraitBones=new SalonMotion(undefined,newCamera()).bones();
const files = new URL('../assets/membres/', import.meta.url);
const posterURL = new URL('salon-v27-apercu.webp', files).href;
async function unpack(name) {
  const response = await fetch(new URL(name, files));
  if (!response.ok) throw new Error('Le modèle ne répond pas.');
  const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

let roomPromise;
function lounge() {
  return roomPromise ??= Promise.all([unpack('salon-v27.bin'),unpack('salon-v27-light.bin')]).catch(error => { roomPromise=null; throw error; });
}
const vertex = `
attribute vec3 position, normal;
attribute vec2 uv;
attribute vec4 ink, joints;

uniform vec3 center, side, up, eye;
uniform vec2 scale, rotation;
uniform vec3 location;
uniform mediump float room;
varying mediump vec2 coord; varying mediump vec3 color, lightNormal, roomPoint; varying mediump float material;
void main() {
 vec3 p = position*.0001, n = normal;
 if(room > 0.5) { p = position/1800.; }
 else {
   p.xz = vec2(rotation.x*p.x+rotation.y*p.z, -rotation.y*p.x+rotation.x*p.z);
   p += location;
   n.xz = vec2(rotation.x*n.x+rotation.y*n.z, -rotation.y*n.x+rotation.x*n.z);
 }
 vec3 delta = p-center;
 gl_Position = vec4(dot(delta,side)*scale.x, dot(delta,up)*scale.y, -dot(delta,eye)/20., 1.);
 float part=joints.x;
 roomPoint=p*100.; material=floor(ink.w*255.+.5);
 if(room>.5 && (((part==0.||part==3.||part==4.) && eye.z<=-.20)
    || ((part==1.||(part>=96.&&part<=98.)) && eye.x>=.22)
    || ((part==2.||(part>=36.&&part<=68.)) && eye.x<=-.22)
    || ((part>=7.&&part<=21.) && eye.z>=.16)))gl_Position=vec4(2.,2.,2.,1.);
 coord = uv; color = ink.rgb; lightNormal=n;
}`;
const fragment = `
precision highp float;
uniform sampler2D base, floorLight;
uniform highp vec3 location;
uniform vec3 multiplier;
uniform mediump float room;
varying mediump vec2 coord; varying mediump vec3 color, lightNormal, roomPoint; varying mediump float material;
 float boxShade(vec2 p,vec2 center,vec2 halfSize){vec2 d=max(abs(p-center)-halfSize,0.);return exp(-dot(d,d)/280.);}
 float hash(vec2 uv){return fract(sin(dot(uv,vec2(41.23,73.78)))*317.41);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
 vec4 furnishedRoom(){
 vec3 p=roomPoint,N=normalize(lightNormal);if(!gl_FrontFacing)N=-N;
 float sky=.81+.105*abs(N.y)+.115*dot(N,normalize(vec3(.33,.72,.51)));vec3 ink=color;
 if(material>1.5&&material<2.5){
  float row=floor((p.z+280.)/16.),shift=mod(row*3.,7.)*16.;vec2 f=vec2(fract((p.x+shift)/113.),fract((p.z+280.)/16.));
  float seam=smoothstep(.002,.014,min(f.x,1.-f.x))*smoothstep(.008,.052,min(f.y,1.-f.y));
  float grain=.017*sin(p.z*.78+1.5*sin(p.x*.037)+.9*sin(p.z*.21))+.013*sin(p.z*2.7+.14*sin(p.x*.18));
  float board=.018*sin(row*11.3+floor((p.x+shift)/113.)*4.3);
  ink*=.86+.13*seam+grain+board;
  float shadow=max(boxShade(p.xz,vec2(-259.,21.),vec2(39.,126.)),boxShade(p.xz,vec2(136.,17.),vec2(30.,75.)));
  shadow=max(shadow,boxShade(p.xz,vec2(-49.,18.),vec2(38.,36.)));shadow=max(shadow,boxShade(p.xz,vec2(-150.,138.),vec2(29.,49.)));ink*=1.-.17*shadow;
 }
 if(material>2.5&&material<3.5){
  vec3 view=mix(vec3(.67,.74,.67),vec3(.80,.86,.84),smoothstep(0.,265.,p.y));
  float foliage=.62*noise(p.xy*.018)+.28*noise(p.xy*.045)+.10*noise(p.xy*.114);
  float edge=81.+39.*sin(.009*p.x)+20.*sin(.022*p.x+.5)+35.*(foliage-.5);
  vec3 trees=mix(vec3(.43,.55,.45),vec3(.68,.74,.58),foliage);
  ink=mix(trees,view,smoothstep(edge-8.,edge+10.,p.y));ink=mix(ink,vec3(.83,.87,.83),.29);sky=1.;
 }
 if(material>3.5&&material<4.5)ink*=.97+.03*sin(1.43*p.z+.9*sin(p.x*.14)+p.y*.19);
 if(material>4.5&&material<5.5)ink*=.99+.009*sin(dot(p,vec3(1.6,1.,1.2)));
 if(material>.5&&material<1.5){float low=1.-smoothstep(0.,34.,p.y);ink*=1.-.085*low;ink+=.018*noise(p.xz*.021+p.y*.017);}
 if(material>5.5){float stripe=sin((p.x+p.z*.17)*.18)*sin((p.z-p.x*.17)*.16);ink*=.98+.046*smoothstep(.36,.76,abs(stripe));}
 if(p.y<2.7){
  float baked=texture2D(floorLight,clamp((p.xz+vec2(390.,380.))/800.,0.,1.)).r;ink*=baked;
  vec2 a=p.xz-location.xz*100.;vec2 along=vec2(-.45,-.89),across=vec2(.89,-.45);float t=clamp(dot(a,along)/65.,0.,1.);
  float castShade=exp(-pow(dot(a,across)/(8.+8.*t),2.)-pow((dot(a,along)-31.)/34.,2.));ink*=1.-.14*castShade;
  float contact=exp(-dot(a,a)/184.);ink*=1.-.19*contact;
  float light=smoothstep(-175.,150.,p.z)*(.055+.035*sin(p.x*.043+p.z*.032));ink+=vec3(light,light*.78,light*.44);
 }
 return vec4(clamp(ink*sky,0.,1.),1.);
}
void main() {
 vec4 albedo;
 if(room > 0.5){gl_FragColor=furnishedRoom();return;}
 else {
   albedo=texture2D(base,coord);
   if(albedo.a < .33) discard;

 }
 float light=.79+.27*max(0.,dot(normalize(lightNormal),normalize(vec3(-.5,.7,.8))));
 gl_FragColor=vec4(albedo.rgb*multiplier*light,1.);
}`;
function makeShader(gl,type,source) {
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source); gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error('Affichage 3D incompatible.');
  return shader;
}
function createView(canvas,roomBytes,lightMap) {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true});
  if(!gl) throw new Error('Le navigateur ne propose pas WebGL.');
  const program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
    const shader=makeShader(gl,type,source); gl.attachShader(program,shader); gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Le modèle ne peut pas être affiché.');
  const attributes=Object.fromEntries(['position','normal','uv','ink','joints'].map(id=>[id,gl.getAttribLocation(program,id)]));
  const uniforms=Object.fromEntries(['center','side','up','eye','scale','rotation','location','room','base','multiplier','floorLight'].map(id=>[id,gl.getUniformLocation(program,id)]));
  const buffers=[];
  function buffer(value,type=gl.ARRAY_BUFFER){
    const handle=gl.createBuffer(); buffers.push(handle); gl.bindBuffer(type,handle); gl.bufferData(type,value,gl.STATIC_DRAW); return handle;
  }
  function textureFrom(image){
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    return texture;
  }
  const shadow=gl.createTexture();
  gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,shadow);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,768,768,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,new Uint8Array(lightMap));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.activeTexture(gl.TEXTURE0);
  let active=null,meshes=[],lastRevision=-1,actorBuffers=[];
  function release(){
    for(const m of meshes)gl.deleteTexture(m.tex);
    for(const b of actorBuffers)gl.deleteBuffer(b);
    meshes=[];actorBuffers=[];
  }
  function select(figure){
    if(active===figure)return;
    release();active=figure;lastRevision=-1;
    const start=buffers.length;
    meshes=figure.meshes.map(m=>({m,tex:textureFrom(m.image),pos:buffer(m.v),norm:buffer(m.vn),uv:buffer(m.uv),indices:buffer(m.faces,gl.ELEMENT_ARRAY_BUFFER)}));
    actorBuffers=buffers.splice(start);
  }
  const roomBuffer=buffer(roomBytes),roomSize=roomBytes.byteLength/14;
  function attr(name,handle,components,type=gl.FLOAT,normalize=false,stride=0,offset=0){
    const loc=attributes[name];
    if(!handle){gl.disableVertexAttribArray(loc);gl.vertexAttrib3f(loc,0,0,0);return;}
    gl.bindBuffer(gl.ARRAY_BUFFER,handle); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,components,type,normalize,stride,offset);
  }
  return {
    draw(figure,motion,portrait=false) {
      gl.useProgram(program);gl.viewport(0,0,canvas.width,canvas.height);gl.enable(gl.DEPTH_TEST);
      gl.clearColor(.94,.93,.89,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const w=canvas.width,h=canvas.height;
      const {sy,cy,sp,cp,factor,x,y,z}=cameraProjection(w,h,portrait,motion.camera);
      const yaw=portrait?.42:motion.yaw;
      gl.uniform3f(uniforms.side,cy,0,-sy);gl.uniform3f(uniforms.eye,sy*cp,sp,cy*cp);gl.uniform3f(uniforms.up,-sp*sy,cp,-sp*cy);
      gl.uniform2f(uniforms.scale,factor*h/w,factor);
      gl.uniform3f(uniforms.center,x,y,z);
      gl.uniform2f(uniforms.rotation,Math.cos(yaw),Math.sin(yaw));
      gl.uniform3f(uniforms.location,portrait?0:motion.x,portrait?.06:0,portrait?0:motion.z);
      gl.activeTexture(gl.TEXTURE0);figure.pose(portrait?portraitBones:motion.bones());select(figure);
      gl.uniform1i(uniforms.floorLight,2);gl.uniform1i(uniforms.base,0);
      if(!portrait){
        gl.uniform1f(uniforms.room,1);
        attr('position',roomBuffer,3,gl.SHORT,false,14,0);attr('normal',roomBuffer,3,gl.BYTE,true,14,6);
        attr('ink',roomBuffer,4,gl.UNSIGNED_BYTE,true,14,9);attr('joints',roomBuffer,1,gl.UNSIGNED_BYTE,false,14,13);attr('uv',null);
        gl.bindTexture(gl.TEXTURE_2D,meshes[0].tex);gl.drawArrays(gl.TRIANGLES,0,roomSize);
      }
      gl.uniform1f(uniforms.room,0);attr('ink',null);
      attr('joints',null);
      for(const {m,tex,pos,norm,uv,indices} of meshes){
        attr('position',pos,3,gl.SHORT);
        if(lastRevision!==figure.revision)gl.bufferData(gl.ARRAY_BUFFER,m.v,gl.DYNAMIC_DRAW);
        attr('normal',norm,3,gl.BYTE,true);
        if(lastRevision!==figure.revision)gl.bufferData(gl.ARRAY_BUFFER,m.vn,gl.DYNAMIC_DRAW);
        attr('uv',uv,2,gl.UNSIGNED_SHORT,true);
        gl.uniform3fv(uniforms.multiplier,m.multiplier);gl.bindTexture(gl.TEXTURE_2D,tex);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.drawElements(gl.TRIANGLES,m.faces.length,gl.UNSIGNED_SHORT,0);
      }
      lastRevision=figure.revision;
    },
    dispose(){release();for(const b of buffers)gl.deleteBuffer(b);gl.deleteTexture(shadow);gl.deleteProgram(program);}
  };
}

export class CheminsAvatar extends HTMLElement {

  #look=legacyStudio(); #gender; #figure; #pending; #drawer; #motion=new SalonMotion((mode,seat)=>this.#controls?.showStatus(mode,seat),newCamera());
  #view; #epoch=0; #observer; #canvas; #gpu; #cpu; #poster; #state; #software=false; #frame=0; #last=0; #controls;
  constructor(){
    super();
    const root=this.attachShadow({mode:'open'});
    root.innerHTML=salonMarkup(posterURL,new URL('./salon.css?v=studio28b',import.meta.url).href);
    this.#drawer=createDrawer(root,look=>this.apply(look),view=>this.#frameModel(view));
    [this.#gpu,this.#cpu]=root.querySelectorAll('canvas');this.#canvas=this.#gpu;
    root.querySelector('.room-retry').addEventListener('click',()=>this.#open());
    this.#poster=root.querySelector('img');this.#state=root.querySelector('.state');
    this.#gpu.addEventListener('webglcontextlost',e=>{e.preventDefault();if(this.isConnected)this.#open(true);});
    this.#gpu.addEventListener('webglcontextrestored',()=>{if(this.isConnected)this.#open();});
  }
  configure(look,options){if(this.#gender!==options.gender){this.#pending=null;this.#gender=options.gender;}this.#drawer.configure(look,options);return this.apply(look);}
  openOptions(open=true){this.#drawer.toggle(open);}
  #frameModel(view){
    if(!this.#view)return;
    const m=this.#motion,b=m.bones(),c=m.camera,face=view==='Visage';
    // Use the moving head pivot so the face stays in frame on a chair as well.
    const at=16,head=[0,1.56,0],point=[0,1,2].map(row=>b[at+12+row]+head.reduce((sum,v,i)=>sum+v*b[at+4*i+row],0));
    const cos=Math.cos(m.yaw),sin=Math.sin(m.yaw),width=this.#canvas.clientWidth,height=this.#canvas.clientHeight;
    const scale=Math.min(2/3.8,2*width/(height*4.7));
    c.angle=m.yaw+(view==='Profil'?Math.PI/2:view==='Dos'?Math.PI:0);c.pitch=face?.07:.14;
    c.x=m.x+cos*point[0]+sin*point[2];c.z=m.z-sin*point[0]+cos*point[2];
    c.y=face?point[1]:point[1]*.52;c.presetMax=face?14:0;
    c.zoom=Math.min(face?14:3.7,(face?3.7:1.54/(point[1]+.1))/Math.max(.1,scale));c.follow=false;
    this.#schedule();
  }
  async apply(look){
    if(this.#pending&&JSON.stringify(this.#look)===JSON.stringify(look))return this.#pending;
    this.#look=look;
    const p=loadStudio(look,this.#gender);this.#pending=p;
    try{const figure=await p;if(p===this.#pending){this.#figure=figure;this.#schedule();}return figure;}
    catch(error){if(p===this.#pending)this.#pending=null;throw error;}
  }
  connectedCallback(){
    if(typeof ResizeObserver==='function'){this.#observer=new ResizeObserver(()=>this.#schedule());this.#observer.observe(this.shadowRoot.querySelector('.scene-viewport'));}
    else window.addEventListener('resize',this.#schedule);
    this.#open();
  }
  disconnectedCallback(){
    this.#controls?.dispose();this.#controls=null;this.#epoch++;cancelAnimationFrame(this.#frame);this.#frame=0;
    this.#observer?.disconnect();window.removeEventListener('resize',this.#schedule);
    this.#view?.dispose();this.#view=null;this.#poster.hidden=false;
  }
  async #open(forceSoftware=false){
    const epoch=++this.#epoch;this.#controls?.dispose();this.#controls=null;
    this.#view?.dispose();this.#view=null;this.#poster.hidden=false;
    const retry=this.shadowRoot.querySelector('.room-retry');retry.hidden=true;
    this.#state.textContent='Ouverture du salon…';
    try{
      const [room,lightMap]=await lounge();await(this.#pending||this.apply(this.#look));while(!this.#figure&&this.#pending)await this.#pending;if(epoch!==this.#epoch||!this.isConnected)return;
      let view;
      if(!forceSoftware){try{view=createView(this.#gpu,room,lightMap);}catch{/* Use the same scene on the 2D canvas. */}}
      this.#software=!view;
      if(!view){
        const {createSoftwareView}=await import('./avatar-software.js?v=salon29');
        if(epoch!==this.#epoch||!this.isConnected)return;
        view=createSoftwareView(this.#cpu,room,lightMap,cameraProjection);
      }
      this.#view=view;this.#canvas=this.#software?this.#cpu:this.#gpu;
      this.#cpu.hidden=!this.#software;this.#gpu.hidden=this.#software;
      this.#draw();this.#poster.hidden=true;
      this.#controls=bindSalon(this.shadowRoot,this.#motion,room,this.#schedule);
      this.dispatchEvent(new CustomEvent('avatar-ready'));
    }catch{if(epoch===this.#epoch){this.#view?.dispose();this.#view=null;this.#poster.hidden=false;this.#state.textContent='Le chargement du salon a été interrompu.';retry.hidden=false;}}
  }
  #schedule=()=>{
    if(this.#view&&!this.#frame)this.#frame=requestAnimationFrame(time=>{
      this.#frame=0;
      if(!this.#view||!this.isConnected)return;
      const dt=this.#last?Math.min(.60,(time-this.#last)/1000):1/60;
      this.#last=time;
      const steps=Math.max(1,Math.ceil(dt/.05));
      let moving=false;
      for(let i=0;i<steps;i++)moving=this.#motion.update(dt/steps);
      if(moving)this.#motion.trackWhenWalking(this.#canvas.clientWidth,this.#canvas.clientHeight);
      this.#draw(moving);
      if(moving&&!document.hidden)this.#schedule();else this.#last=0;
    });
  };
  #draw(moving=false){
    if(!this.#view||!this.#figure)return;
    const canvas=this.#canvas;
    const ratio=this.#software?Math.min(1,(moving?480:960)/Math.max(1,canvas.clientWidth,canvas.clientHeight)):Math.min(1.75,window.devicePixelRatio||1);
    const w=Math.max(1,Math.round(canvas.clientWidth*ratio)),h=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    this.#view.draw(this.#figure,this.#motion);
  }
  snapshot(){
    if(!this.#view)return null;
    const canvas=this.#canvas,old=[canvas.width,canvas.height];
    try{canvas.width=240;canvas.height=240;this.#view.draw(this.#figure,this.#motion,true);return canvas.toDataURL('image/webp',.82);}
    finally{[canvas.width,canvas.height]=old;this.#draw();}
  }
}
if(!customElements.get('chemins-avatar'))customElements.define('chemins-avatar',CheminsAvatar);
