import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {planSpeechBubble,rectanglesOverlap,transformFace} from './intro-bubbles.js';
import {dojoBlocking,dojoDirectedCamera} from './intro-dojo-director.js';
import {dojoDemoReservedRect,dojoDemoFrame} from './intro-dojo-ui.js';

const source=readFileSync(new URL('./intro-cinema.js',import.meta.url),'utf8');
const extract=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)+a.length));
const lines=JSON.parse(extract('const lines=',';\nconst dojoStart').slice('const lines='.length));
function fixture(width,height,line){
 const people=['m','f'].map((id,i)=>{
  const root=new T.Group(),sit=line.seated?1:0;
  root.position.set(line.scene==='dojo'?(i?.6522:-.9478):line.seated?(i?.74:-.74):(i?1.28:-1.28),i?0:.0206,line.scene==='dojo'?.6423:line.seated?.42:-1.08);
  const head=root.position.clone().add(new T.Vector3(0,sit?(i?1.10:1.15):(i?1.56:1.65),0));
  return {id,root,sit,previewHead:head};
 });
 const writes=[],classes=new Set(),style=new Proxy({setProperty(k,v){this[k]=v}}, {set(o,k,v){writes.push([k,v]);o[k]=v;return true}});
 const bubble={hidden:false,offsetHeight:height<350?112:Math.max(100,36+Math.ceil(line.text.length*9/Math.min(width-54,356))*27),get offsetWidth(){return Number.parseFloat(style.width)||330},style,classList:{remove(...v){v.forEach(x=>classes.delete(x))},add(...v){v.forEach(x=>classes.add(x))}}};
 const canvasHost={clientWidth:width,clientHeight:height},camera=new T.PerspectiveCamera(46,width/height,.07,120);
 const floor=new T.Box3(new T.Vector3(-4.489,-.061,-3.333),new T.Vector3(4.193,-.003,3.917));
 const limits=new T.Box3(new T.Vector3(floor.min.x+.8,.347,floor.min.z+.45),new T.Vector3(floor.max.x-.8,2.447,floor.max.z-.45));
 const dojo={userData:{introFloorBounds:floor,introCameraBounds:limits}};
 const api=new Function('T','people','bubble','canvasHost','camera','dojo','planSpeechBubble','dojoBlocking','dojoDirectedCamera','dojoDemoReservedRect',`
 let bubbleLayout=null,currentSpeaker=${JSON.stringify(line.speaker)},secondCue=false,invitationMotion=null;
 let angle=Math.PI,targetAngle=Math.PI,radius=3.7,cutCamera=true;
 const smoothEye=new T.Vector3(),smoothAim=new T.Vector3();
 function speakerActor(id){return people.find(p=>p.id===id)}
 ${extract('function actorHead(','function scheduleNext(')}
 ${extract('function exchangeFrame(','async function showScene(')}
 return {cameraShot,anchorBubble,faceRect,cameraFrame,
  stage(line,elapsed){if(!isStagedDojo(line))return;const state=dojoPoseAt(line,elapsed);for(const p of people){const before=p.root.position.clone();p.root.position.copy(state[p.id].position);p.root.rotation.y=state[p.id].yaw;p.previewHead.add(p.root.position.clone().sub(before));}},
  get layout(){return bubbleLayout},
  speaker(id){currentSpeaker=id;bubbleLayout=null},
  orbit(v){targetAngle=v},
 };
 `)(T,people,bubble,canvasHost,camera,dojo,planSpeechBubble,dojoBlocking,dojoDirectedCamera,dojoDemoReservedRect);
 return {api,bubble,writes,people,camera,canvasHost,classes};
}

test('speech bubble planner avoids the complete swept face area, not only the first frame',()=>{
 const face={l:210,r:270,t:180,b:270};
 const faces=[face,{l:120,r:260,t:30,b:210}];
 const layout=planSpeechBubble({width:620,height:480,bubbleWidth:270,bubbleHeight:110,face,faces});
 for(const rect of faces)assert.equal(rectanglesOverlap(layout,transformFace(rect,620,480,layout.projection)),false);
 assert.ok(layout.l>=14&&layout.r<=606&&layout.t>=14&&layout.b<=466);
});

test('each reply keeps its position through actual moving shots on desktop, portrait and landscape',()=>{
 let frames=0;
 for(const [width,height] of [[1280,660],[768,820],[390,690],[320,600],[844,285]]){
  for(const line of lines.filter(line=>line.speaker&&!line.invitation)){
   const h=fixture(width,height,line);
   h.api.stage(line,0);h.api.cameraShot(line,0,1/60);h.api.anchorBubble(line,0);
   const layout=h.api.layout;assert.ok(layout,`Bubble is visible for ${line.id}`);
   assert.equal(h.bubble.style.visibility,'visible');
   assert.ok(layout.l>=0&&layout.r<=width&&layout.t>=0&&layout.b<=height,`Bubble stays in frame: ${line.id} ${width}`);
   h.writes.length=0;
   for(let i=1;i<=180;i++){
    const elapsed=line.ms*i/180;
    if(line.secondary&&elapsed>=line.secondary.at)break;
    h.api.stage(line,elapsed);h.api.cameraShot(line,elapsed,line.ms/180000);h.api.anchorBubble(line,elapsed);frames++;
    assert.equal(h.api.layout,layout,'The same placement object lasts through the reply');
    for(const person of h.people){
     const rect=h.api.faceRect(person,h.camera,width,height);
     if(rect&&rect.r>0&&rect.l<width&&rect.b>0&&rect.t<height){
      assert.equal(rectanglesOverlap(layout,rect),false,`${line.id}: ${person.id} face covered at ${elapsed.toFixed()} ms on ${width}×${height}; layout=${JSON.stringify(layout)}; face=${JSON.stringify(rect)}`);
     }
    }
   }
   assert.equal(h.writes.some(([key])=>['left','top','width','visibility'].includes(key)),false,'No bubble relocation, resizing or hiding between frames');
  }
 }
 assert.ok(frames>10000);
});

test('manual dojo camera fallback keeps both faces clear under a stationary bubble',()=>{
 const line={...lines.find(line=>line.id==='dojo-arrivee'),demo:false};
 for(const [width,height] of [[1280,660],[390,690],[844,285]]){
  const h=fixture(width,height,line);h.api.cameraShot(line,0,1/60);h.api.anchorBubble(line,0);
  const layout=h.api.layout;
  for(let i=0;i<240;i++){
   h.api.orbit(Math.PI+.68*Math.sin(i/30));
   h.api.cameraShot(line,i*25,1/60);h.api.anchorBubble(line,i*25);
   for(const person of h.people){const rect=h.api.faceRect(person,h.camera,width,height);assert.equal(rectanglesOverlap(layout,rect),false);}
   assert.equal(h.api.layout,layout);
  }
 }
});

test('resizing replans once, and changing speaker permits a new bubble position',()=>{
 const line=lines.find(line=>line.id==='ensemble'),h=fixture(390,690,line);
 h.api.cameraShot(line,0,1/60);h.api.anchorBubble(line,0);const first=h.api.layout;
 h.canvasHost.clientWidth=844;h.canvasHost.clientHeight=285;h.camera.aspect=844/285;
 h.api.cameraShot(line,100,1/60);h.api.anchorBubble(line,100);const resized=h.api.layout;
 assert.notEqual(resized,first);
 h.api.cameraShot(line,200,1/60);h.api.anchorBubble(line,200);assert.equal(h.api.layout,resized);
 h.api.speaker('f');h.api.cameraShot(line,4200,1/60);h.api.anchorBubble(line,4200);
 assert.notEqual(h.api.layout,resized);assert.equal(h.bubble.hidden,false);
});

test('the final projected dialogue and faces stay clear of the demonstrated controls throughout dojo shots',()=>{
 const problems=[];let frames=0;
 for(const [width,height]of [[1280,660],[768,820],[390,690],[320,600],[844,285],[640,240]]){
  for(const line of lines.filter(line=>line.scene==='dojo'&&dojoDemoReservedRect(width,height,line))){
   const h=fixture(width,height,line),panel=dojoDemoReservedRect(width,height,line);
   h.api.stage(line,0);h.api.cameraShot(line,0,1/60);h.api.anchorBubble(line,0);
   for(let i=1;i<=240;i++){
    const elapsed=line.ms*i/240;
    h.api.stage(line,elapsed);h.api.cameraShot(line,elapsed,line.ms/240000);h.api.anchorBubble(line,elapsed);
    if(!dojoDemoFrame(line,elapsed).visible)continue;
    frames++;
    const items=[{id:'dialogue',rect:h.api.layout},...h.people.map(person=>({id:person.id,rect:h.api.faceRect(person,h.camera,width,height)}))];
    for(const {id,rect} of items){
     if(!rect||rect.r<=0||rect.l>=width||rect.b<=0||rect.t>=height)continue;
     if(rectanglesOverlap(panel,rect)&&problems.length<10)problems.push({cue:line.id,size:[width,height],elapsed:Math.round(elapsed),id,panel,rect,projection:h.api.layout.projection});
    }
   }
  }
 }
 assert.ok(frames>5000,'Cover the entire moving camera path on desktop, portrait and short landscape');
 assert.deepEqual(problems,[],'The small control panel must not hide a face or the reading bubble: '+JSON.stringify(problems));
});
