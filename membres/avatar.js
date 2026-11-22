import {reactionFor} from './conversation-reactions.js';
// Summer Man uses the CC0 MakeHuman/MPFB model. Garment authors and original
// source URLs are embedded in the GLB materials. The lounge is original geometry.
import {createPerformer} from './salon-performance.js';
import {resource} from './studio-assets.js';
import {legacyStudio} from './studio-look.js';
import {loadStudio} from './studio-model.js?v=salon43';
import {createDrawer} from './studio-drawer.js?v=salon43';
import {cameraProjection,newCamera,SalonMotion} from './salon-navigation.js?v=salon44';
import {salonMarkup,bindSalon} from './salon-controls.js?v=salon44';
import {createSalonChat} from './salon-chat.js?v=salon44';
import {conversationSeats,frameConversation,guestAppearance,actorHead,headSide} from './salon-encounter.js?v=salon44';

const portraitBones=new SalonMotion(undefined,newCamera()).bones();
async function loadActor(look,gender){
  if(gender!=='femme')return loadStudio(look,gender);
  const [figure,{wearCompatibleReference}]=await Promise.all([loadStudio(look,gender),import('./v27/compatible-face-bundle.js')]);
  return wearCompatibleReference(figure,portraitBones);
}
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
uniform vec2 scale, rotation, lens;
uniform float headroom;
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
 float depth=dot(delta,eye), w=1.-depth*lens.x;
 float z=lens.x>0. ? w-2.*lens.y : -depth/20.;
 gl_Position=vec4(dot(delta,side)*scale.x,dot(delta,up)*scale.y-headroom*w,z,w);
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
  const attributesGL={alpha:false,antialias:true};
  const gl=canvas.getContext('webgl2',attributesGL)||canvas.getContext('webgl',attributesGL);
  if(!gl) throw new Error('Le navigateur ne propose pas WebGL.');
  const program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
    const shader=makeShader(gl,type,source); gl.attachShader(program,shader); gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Le modèle ne peut pas être affiché.');
  const attributes=Object.fromEntries(['position','normal','uv','ink','joints'].map(id=>[id,gl.getAttribLocation(program,id)]));
  const uniforms=Object.fromEntries(['center','side','up','eye','scale','lens','headroom','rotation','location','room','base','multiplier','floorLight'].map(id=>[id,gl.getUniformLocation(program,id)]));
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
  const monochrome=gl.RED||gl.LUMINANCE;
  gl.texImage2D(gl.TEXTURE_2D,0,gl.R8||monochrome,768,768,0,monochrome,gl.UNSIGNED_BYTE,new Uint8Array(lightMap));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.activeTexture(gl.TEXTURE0);
  const actors=new Map();
  function release(slot){
    const actor=actors.get(slot);
    if(!actor)return;
    for(const mesh of actor.meshes)gl.deleteTexture(mesh.tex);
    for(const handle of actor.buffers)gl.deleteBuffer(handle);
    actors.delete(slot);
  }
  function select(slot,figure){
    if(actors.get(slot)?.figure===figure)return actors.get(slot);
    release(slot);
    const start=buffers.length;
    const meshes=figure.meshes.map(m=>({m,tex:textureFrom(m.image),pos:buffer(m.v),norm:buffer(m.vn),uv:buffer(m.uv),indices:buffer(m.faces,gl.ELEMENT_ARRAY_BUFFER)}));
    const actor={figure,meshes,buffers:buffers.splice(start),revision:-1};
    actors.set(slot,actor);
    return actor;
  }
  const roomBuffer=buffer(roomBytes),roomSize=roomBytes.byteLength/14;
  function attr(name,handle,components,type=gl.FLOAT,normalize=false,stride=0,offset=0){
    const loc=attributes[name];
    if(!handle){gl.disableVertexAttribArray(loc);gl.vertexAttrib3f(loc,0,0,0);return;}
    gl.bindBuffer(gl.ARRAY_BUFFER,handle); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,components,type,normalize,stride,offset);
  }
  return {
    context:gl,
    draw(figure,motion,portrait=false,guest=null) {
      gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,shadow);gl.activeTexture(gl.TEXTURE0);
      gl.useProgram(program);gl.viewport(0,0,canvas.width,canvas.height);gl.enable(gl.DEPTH_TEST);
      gl.clearColor(.94,.93,.89,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const w=canvas.width,h=canvas.height;
      const {sy,cy,sp,cp,factor,x,y,z,perspective,nearDepth,offset}=cameraProjection(w,h,portrait,motion.camera);
      gl.uniform3f(uniforms.side,cy,0,-sy);gl.uniform3f(uniforms.eye,sy*cp,sp,cy*cp);gl.uniform3f(uniforms.up,-sp*sy,cp,-sp*cy);
      gl.uniform1f(uniforms.headroom,offset);
      gl.uniform2f(uniforms.lens,perspective,1-nearDepth*perspective);
      gl.uniform2f(uniforms.scale,factor*h/w,factor);
      gl.uniform3f(uniforms.center,x,y,z);
      gl.uniform3f(uniforms.location,portrait?0:motion.x,portrait?.06:0,portrait?0:motion.z);
      gl.activeTexture(gl.TEXTURE0);
      const player=select(0,figure);
      gl.uniform1i(uniforms.floorLight,2);gl.uniform1i(uniforms.base,0);
      if(!portrait){
        gl.uniform1f(uniforms.room,1);
        attr('position',roomBuffer,3,gl.SHORT,false,14,0);attr('normal',roomBuffer,3,gl.BYTE,true,14,6);
        attr('ink',roomBuffer,4,gl.UNSIGNED_BYTE,true,14,9);attr('joints',roomBuffer,1,gl.UNSIGNED_BYTE,false,14,13);attr('uv',null);
        gl.bindTexture(gl.TEXTURE_2D,player.meshes[0].tex);gl.drawArrays(gl.TRIANGLES,0,roomSize);
      }
      gl.uniform1f(uniforms.room,0);attr('ink',null);
      attr('joints',null);
      function drawActor(actor,pose){
        const yaw=portrait?.42:pose.yaw;
        gl.uniform2f(uniforms.rotation,Math.cos(yaw),Math.sin(yaw));
        gl.uniform3f(uniforms.location,portrait?0:pose.x,portrait?.06:0,portrait?0:pose.z);
        actor.figure.pose(portrait?portraitBones:pose.bones(),portrait?null:pose.expression);
        for(const {m,tex,pos,norm,uv,indices} of actor.meshes){
          attr('position',pos,3,gl.SHORT);
          if(actor.revision!==actor.figure.revision)gl.bufferData(gl.ARRAY_BUFFER,m.v,gl.DYNAMIC_DRAW);
          attr('normal',norm,3,gl.BYTE,true);
          if(actor.revision!==actor.figure.revision)gl.bufferData(gl.ARRAY_BUFFER,m.vn,gl.DYNAMIC_DRAW);
          attr('uv',uv,2,gl.UNSIGNED_SHORT,true);
          gl.uniform3fv(uniforms.multiplier,m.multiplier);gl.bindTexture(gl.TEXTURE_2D,tex);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.drawElements(gl.TRIANGLES,m.faces.length,gl.UNSIGNED_SHORT,0);
        }
        actor.revision=actor.figure.revision;
      }
      drawActor(player,motion);
      if(!portrait){
        if(guest)drawActor(select(1,guest.figure),guest.motion);
        else release(1);
      }
    },
    dispose(){release(0);release(1);for(const b of buffers)gl.deleteBuffer(b);gl.deleteTexture(shadow);gl.deleteProgram(program);}
  };
}

export class CheminsAvatar extends HTMLElement {

  #reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  #world; #worldLoad; #worldLife; #bag=null; #inTransit=false; #departCamera;
  #guest=null; #playerStyle=createPerformer('joueur'); #visible=true; #visibility; #chat; #invitation=0;
  #look=legacyStudio(); #gender; #figure; #pending; #drawer; #motion=new SalonMotion((mode,seat)=>this.#controls?.showStatus(mode,seat),newCamera());
  #view; #epoch=0; #observer; #canvas; #gpu; #cpu; #poster; #state; #software=false; #frame=0; #last=0; #controls;
  constructor(){
    super();
    const root=this.attachShadow({mode:'open'});
    root.innerHTML=salonMarkup(posterURL,new URL('./salon.css?v=salon39',import.meta.url).href);
    this.#chat=createSalonChat(root,{
      invite:person=>this.#invite(person),
      change:()=>this.#schedule(),
      rate:who=>(who==='player'?this.#playerStyle:this.#guest.style).rate,
      gender:who=>(who==='player'?this.#gender:this.#guest?.gender)||'homme',
      leave:()=>{this.#world?.back();this.#cancelDeparture();this.#invitation++;this.#motion.expression=null;if(this.#guest)Object.assign(this.#motion.camera,this.#guest.previousCamera);this.#guest=null;this.#motion.camera.headroom=0;this.#schedule();}
    });
    this.#drawer=createDrawer(root,look=>this.apply(look),view=>this.#frameModel(view),()=>this.#toggleDeparture());
    root.getElementById('chooseDeparture').onclick=()=>this.#toggleDeparture();
    for(const b of root.querySelectorAll('[data-bag]'))b.onclick=()=>this.#selectBag(b.dataset.bag);
    [this.#gpu,this.#cpu]=root.querySelectorAll('canvas');this.#canvas=this.#gpu;
    root.querySelector('.room-retry').addEventListener('click',()=>this.#open());
    this.#poster=root.querySelector('img');this.#state=root.querySelector('.state');
    this.#gpu.addEventListener('webglcontextlost',e=>{e.preventDefault();if(this.isConnected)this.#open(true);});
    this.#gpu.addEventListener('webglcontextrestored',()=>{if(this.isConnected)this.#open();});
  }
  #showBags(open){
    this.shadowRoot.getElementById('departChoices').hidden=!open;
    this.shadowRoot.getElementById('chooseDeparture').setAttribute('aria-expanded',String(open));
  }
  async #toggleDeparture(){
    if(this.#inTransit){this.#cancelDeparture();return;}
    if(this.#world?.outside)return;
    if(!this.shadowRoot.getElementById('departChoices').hidden){this.#showBags(false);return;}
    if(!this.#view){this.#state.textContent='Le salon s’ouvre…';return;}
    return this.#loadWorld(true);
  }
  async #loadWorld(showBags){
    if(!this.#worldLoad){
      const life=this.#worldLife=new AbortController();
      const context=this.#view.context;
      if(context&&!(typeof WebGL2RenderingContext!=='undefined'&&context instanceof WebGL2RenderingContext)){
        await this.#open(true);if(showBags)return this.#loadWorld(true);return;
      }
      if(showBags)this.#state.textContent='Ouverture du jardin…';
      this.#worldLoad=import('./depart.js?v=salon40').then(({createDeparture})=>createDeparture({
        canvas:this.#canvas,context,roomFrame:()=>this.#view.frame,root:this.shadowRoot,signal:life.signal,makeGait:()=>new SalonMotion(undefined,newCamera()),
        onBag:which=>this.#selectBag(which),onReturn:()=>this.#cancelDeparture(),wake:this.#schedule
      })).then(world=>{if(life.signal.aborted){world.dispose();return;}this.#world=world;});
    }
    const loading=this.#worldLoad;
    try{await loading;if(loading!==this.#worldLoad||!this.isConnected)return;
      if(showBags){this.#state.textContent='';this.#showBags(true)}this.#schedule();
    }catch{if(loading===this.#worldLoad){this.#worldLife.abort();this.#worldLoad=null;if(showBags)this.#state.textContent='Le jardin n’a pas pu s’ouvrir. Touche « Le départ à deux » pour réessayer.';this.#schedule();}}
  }
  #selectBag(which){
    if(!this.#world||this.#world.outside||this.#inTransit)return;
    this.#showBags(false);this.#drawer.toggle(false);
    if(!this.#guest){
      this.#state.textContent='Choisis la personne qui sortira avec toi.';
      this.#chat.chooseCompanion(()=>this.#selectBag(which));return;
    }
    this.#bag=which;this.#inTransit=true;
    const camera=this.#motion.camera;this.#departCamera={...camera};
    Object.assign(camera,newCamera(),{x:0,y:.9,z:.25,angle:2.75,zoom:.93,perspective:0,nearDepth:0,headroom:0});
    this.#motion.goToBay(-37);this.#guest.motion.goToBay(37);
    this.shadowRoot.getElementById('chooseDeparture').textContent='Annuler le départ';
    this.#state.textContent='Vous rejoignez la baie vitrée.';this.#schedule();
  }
  #cancelDeparture(){
    if(this.#inTransit){this.#motion.stand();this.#guest?.motion.stand();}
    this.#inTransit=false;this.#bag=null;
    if(this.#departCamera){Object.assign(this.#motion.camera,this.#departCamera);this.#departCamera=null;
      if(this.#guest)this.#guest.anchors=null;
    }
    this.shadowRoot.getElementById('chooseDeparture').textContent='Le départ à deux';
    this.#state.textContent='';this.#schedule();
  }
  #people(){return [{figure:this.#figure,motion:this.#motion,gender:this.#gender},this.#guest];}
  #closeWorld(){
    this.#worldLife?.abort();this.#world?.back();this.#world?.dispose();
    this.#world=null;this.#worldLoad=null;this.#showBags(false);this.#cancelDeparture();
  }
  async #invite(person){
    const invitation=++this.#invitation;
    const {studio,gender}=guestAppearance(person);
    const [figure,channels]=await Promise.all([loadActor(studio,gender),resource('conversation-face')]);
    if(invitation!==this.#invitation||!this.isConnected)return false;
    figure.enableSpeech(channels);this.#figure.enableSpeech(channels);
    const pair=conversationSeats();
    const motion=new SalonMotion(undefined,newCamera(),{x:722,z:-992,yaw:.3});
    const wideAngle=Math.abs(pair[0].x-pair[1].x)>Math.abs(pair[0].z-pair[1].z)?-.09:1.48;
    this.#guest={figure,motion,channels,gender,style:createPerformer(person.id),seat:pair[1],wideAngle,previousCamera:{...this.#motion.camera,perspective:0,nearDepth:0}};
    this.#drawer.toggle(false);
    motion.goToSeat(pair[1]);this.#motion.goToSeat(pair[0]);
    this.#schedule();
    return true;
  }
  configure(look,options){if(this.memberKey!==options.memberKey){this.memberKey=options.memberKey;this.#playerStyle=createPerformer(options.memberKey||'joueur');}if(this.#gender!==options.gender){this.#pending=null;this.#gender=options.gender;}this.#drawer.configure(look,options);return this.apply(look);}
  openOptions(open=true){this.#drawer.toggle(open);}
  #manualCamera=()=>{
    if(!this.#guest)return;
    this.#chat.manual();this.#motion.camera.perspective=0;this.#motion.camera.nearDepth=0;
  };
  #frameModel(view){
    this.#manualCamera();
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
    const p=loadActor(look,this.#gender);this.#pending=p;
    try{const figure=await p;if(p===this.#pending){this.#figure=figure;if(this.#guest)figure.enableSpeech(this.#guest.channels);this.#schedule();}return figure;}
    catch(error){if(p===this.#pending)this.#pending=null;throw error;}
  }
  #resume=()=>{this.#last=0;this.#schedule();};
  connectedCallback(){
    document.addEventListener('visibilitychange',this.#resume);
    if(typeof IntersectionObserver==='function'){
      this.#visibility=new IntersectionObserver(([entry])=>{this.#visible=entry.isIntersecting;if(this.#visible)this.#resume();});
      this.#visibility.observe(this);
    }
    if(typeof ResizeObserver==='function'){this.#observer=new ResizeObserver(()=>this.#schedule());this.#observer.observe(this.shadowRoot.querySelector('.scene-viewport'));}
    else window.addEventListener('resize',this.#schedule);
    this.#open();
  }
  disconnectedCallback(){
    this.#closeWorld();this.#visibility?.disconnect();document.removeEventListener('visibilitychange',this.#resume);this.#chat.reset();
    this.#controls?.dispose();this.#controls=null;this.#epoch++;cancelAnimationFrame(this.#frame);this.#frame=0;
    this.#observer?.disconnect();window.removeEventListener('resize',this.#schedule);
    this.#view?.dispose();this.#view=null;this.#poster.hidden=false;
  }
  async #open(forceSoftware=false){
    this.#closeWorld();const epoch=++this.#epoch;this.#controls?.dispose();this.#controls=null;
    this.#view?.dispose();this.#view=null;this.#poster.hidden=false;
    const retry=this.shadowRoot.querySelector('.room-retry');retry.hidden=true;
    this.#state.textContent='Ouverture du salon…';
    try{
      const [room,lightMap]=await lounge();await(this.#pending||this.apply(this.#look));while(!this.#figure&&this.#pending)await this.#pending;if(epoch!==this.#epoch||!this.isConnected)return;
      let view;
      if(!forceSoftware){try{view=createView(this.#gpu,room,lightMap);}catch{/* Use the same scene on the 2D canvas. */}}
      this.#software=!view;
      if(!view){
        const {createSoftwareView}=await import('./avatar-software.js?v=salon39');
        if(epoch!==this.#epoch||!this.isConnected)return;
        view=createSoftwareView(this.#cpu,room,lightMap,cameraProjection);
      }
      this.#view=view;this.#canvas=this.#software?this.#cpu:this.#gpu;
      this.#cpu.hidden=!this.#software;this.#gpu.hidden=this.#software;
      this.#draw();this.#poster.hidden=true;
      this.#controls=bindSalon(this.shadowRoot,this.#motion,room,this.#schedule,seat=>this.#guest?.seat?.id!==seat.id,this.#manualCamera,()=>this.#world);
      this.dispatchEvent(new CustomEvent('avatar-ready'));
      void this.#loadWorld(false);
    }catch{if(epoch===this.#epoch){this.#view?.dispose();this.#view=null;this.#poster.hidden=false;this.#state.textContent='Le chargement du salon a été interrompu.';retry.hidden=false;}}
  }
  #schedule=()=>{
    if(this.#view&&!this.#frame)this.#frame=requestAnimationFrame(time=>{
      this.#frame=0;
      if(!this.#view||!this.isConnected||!this.#visible||document.hidden){this.#last=0;return;}
      const reduced=this.#reduced.matches;
      const settled=actor=>actor.mode==='seated'||actor.mode==='idle';
      const quiet=this.#guest&&!this.#chat.playback.busy&&settled(this.#motion)&&settled(this.#guest.motion);
      const interval=this.#software?(quiet?150:85):(quiet?100:42);
      if(this.#guest&&this.#last&&time-this.#last<interval){this.#schedule();return;}
      const dt=this.#last?Math.min(.60,(time-this.#last)/1000):1/60;
      this.#last=time;
      const steps=Math.max(1,Math.ceil(dt/.05));
      let moving=false;
      for(let i=0;i<steps;i++){
        if(this.#world?.outside)break;
        const walking=this.#motion.update(dt/steps);
        moving=(this.#guest?.motion.update(dt/steps)||walking);
      }
      if(this.#inTransit&&this.#guest&&[this.#motion,this.#guest.motion].every(m=>m.mode==='idle')){
        if([this.#motion,this.#guest.motion].every(m=>m.z>2.16)){
          this.#inTransit=false;this.#world.start(this.#bag,this.#people());this.#state.textContent='';
        }else this.#cancelDeparture();
      }
      if(moving&&!this.#inTransit)this.#motion.trackWhenWalking(this.#canvas.clientWidth,this.#canvas.clientHeight);
      if(this.#guest){
        const speech=this.#chat.playback.frame(),now=time/1000;
        const poses=[[this.#motion,this.#guest.motion,this.#playerStyle,'player'],[this.#guest.motion,this.#motion,this.#guest.style,'guest']];
        for(const [actor,partner,style,who] of poses){
          const speaking=speech?.who===who,role=speaking?'speak':speech?.who?'listen':'idle';
          const angle=Math.atan2(partner.x-actor.x,partner.z-actor.z)-actor.yaw;
          const look=Math.max(-.42,Math.min(.42,Math.atan2(Math.sin(angle),Math.cos(angle))));
          const reaction=reactionFor(speech?.reaction,who);
          actor.expression={reaction,recordingTime:speaking?speech.recordingTime:reaction?.recordingTime,gesture:style.sample(now,dt,role,speech?.line,reduced),look,
            jaw:speaking?speech.jaw:0,round:speaking?speech.round:0,spread:speaking?speech.spread:0};
        }
      }
      this.#draw(moving||!!this.#guest,dt);
      if((moving||this.#inTransit||this.#world?.outside||this.#guest&&(!reduced||this.#chat.playback.busy))&&!document.hidden)this.#schedule();else this.#last=0;
    });
  };
  #draw(moving=false,dt=0){
    if(!this.#view||!this.#figure)return;
    const canvas=this.#canvas;
    const ratio=this.#software?Math.min(1,(moving?480:960)/Math.max(1,canvas.clientWidth,canvas.clientHeight)):Math.min(1.75,window.devicePixelRatio||1);
    const w=Math.max(1,Math.round(canvas.clientWidth*ratio)),h=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    if(this.#world?.outside&&this.#guest){
      this.#world.draw({dt,people:this.#people()});return;
    }
    if(this.#guest&&!this.#inTransit){
      const w=canvas.clientWidth,h=canvas.clientHeight,c=this.#motion.camera;
      const player=actorHead(this.#motion),guest=actorHead(this.#guest.motion),mode=this.#chat.mode;
      const inset=Math.min(h*.40,this.#chat.inset);
      c.headroom=inset/Math.max(1,h);
      if(mode!=='manual'){
        // Establish the room first while either character is walking to a seat.
        const settled=[this.#motion,this.#guest.motion].every(actor=>actor.mode==='seated'||actor.mode==='idle');
        // Keep the camera tripod still during head and torso gestures.
        if(settled&&!this.#guest.anchors)this.#guest.anchors=[player,guest];
        if(!settled)this.#guest.anchors=null;
        const [a,b]=this.#guest.anchors||[player,guest];
        const shot=this.#chat.shot(settled);frameConversation(c,settled?shot.size:'wide',shot.speaker,a,b,w,h-inset,this.#guest.wideAngle);
      }
      this.#chat.position(headSide(player,c,w,h)>headSide(guest,c,w,h));
    }
    this.#view.draw(this.#figure,this.#motion,false,this.#guest);
    this.#world?.draw({dt,projection:cameraProjection(w,h,false,this.#motion.camera)});

  }
  snapshot(){
    if(!this.#view)return null;
    const canvas=this.#canvas,old=[canvas.width,canvas.height];
    try{canvas.width=240;canvas.height=240;this.#view.draw(this.#figure,this.#motion,true);return canvas.toDataURL('image/webp',.82);}
    finally{[canvas.width,canvas.height]=old;this.#draw();}
  }
}
if(!customElements.get('chemins-avatar'))customElements.define('chemins-avatar',CheminsAvatar);
