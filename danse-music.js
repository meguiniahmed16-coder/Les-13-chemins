import {embeddedBytes} from './danse-embedded-assets.js';
import {BEAT} from './danse-core.js';
import {OVATION_SECONDS} from './danse-finale.js';
function loadSound(path){const local=embeddedBytes(path);return (local?Promise.resolve(new Response(local)):fetch(path)).then(r=>{if(!r.ok)throw Error('Son indisponible');return r.arrayBuffer();});}
export class StudioMusic{
 constructor(){this.enabled=true;this.last=-1;this.source=null;this.buffer=null;this.pending=loadSound('assets/danse/funky-chunk-loop.mp3').catch(e=>{this.error=e;return null;});this.ovationPending=loadSound('assets/danse/ovation.mp3').catch(e=>{this.ovationError=e;return null;});}
 unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(!this.master){this.master=this.ctx.createGain();this.master.gain.value=.28;this.master.connect(this.ctx.destination);this.ovationGain=this.ctx.createGain();this.ovationGain.gain.value=.8;this.ovationGain.connect(this.ctx.destination);}this.ctx.resume().catch(()=>{});if(!this.decoding){this.decoding=true;this.pending.then(bytes=>bytes&&this.ctx.decodeAudioData(bytes)).then(buffer=>{this.buffer=buffer;}).catch(e=>{this.error=e;});this.ovationPending.then(bytes=>bytes&&this.ctx.decodeAudioData(bytes)).then(buffer=>{this.ovationBuffer=buffer;}).catch(e=>{this.ovationError=e;});}}catch{}}
 toggle(){this.enabled=!this.enabled;if(this.enabled)this.unlock();if(this.master)this.master.gain.setTargetAtTime(this.enabled?.28:0,this.ctx.currentTime,.03);if(!this.enabled)this.stopOvation();return this.enabled;}
 stopOvation(){if(this.ovationSource){this.ovationSource.stop();this.ovationSource=null;}}
 syncOvation(time,active){
  if(!active||time===null||time<0||time>=OVATION_SECONDS){this.stopOvation();return;}
  if(!this.ovationBuffer||this.ctx.state!=='running'||time>=this.ovationBuffer.duration)return;
  if(this.ovationSource&&Math.abs(this.ctx.currentTime-this.ovationStartedAt-time)<.16)return;
  this.stopOvation();const source=this.ctx.createBufferSource();source.buffer=this.ovationBuffer;source.loop=false;source.connect(this.ovationGain);
  source.start(this.ctx.currentTime,time);this.ovationSource=source;this.ovationStartedAt=this.ctx.currentTime-time;
 }
 tone(midi,length=.15,volume=.1,type='triangle',delay=0){if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+length+.02);}
 noise(length=.08,volume=.08,high=4000){if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;const n=Math.ceil(this.ctx.sampleRate*length),buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate);const data=buf.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n)**2;const src=this.ctx.createBufferSource(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();src.buffer=buf;g.gain.value=volume;f.type='highpass';f.frequency.value=high;src.connect(f);f.connect(g);g.connect(this.master);src.start();}
 tick(t,active,finaleTime=null){
  if(!this.ctx)return;
  this.syncOvation(finaleTime,active&&this.enabled);
  if(finaleTime!==null&&finaleTime>=OVATION_SECONDS)active=false;
  if(!active||!this.enabled){if(this.source){this.source.stop();this.source=null;}if(this.master)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.04);return;}
  if(this.master)this.master.gain.setTargetAtTime(finaleTime===null?.38:.06,this.ctx.currentTime,.12);
  if(!this.buffer||this.ctx.state!=='running')return;
  const loop=128*BEAT;
  if(this.source&&Math.abs(this.ctx.currentTime-this.startedAt-t)<.16)return;
  if(this.source)this.source.stop();
  const source=this.ctx.createBufferSource();source.buffer=this.buffer;source.loop=true;source.loopStart=0;source.loopEnd=Math.min(loop,this.buffer.duration);source.connect(this.master);
  source.start(this.ctx.currentTime,((t%loop)+loop)%loop);this.source=source;this.startedAt=this.ctx.currentTime-t;
 }
 cheer(){[72,76,79,84].forEach((n,i)=>this.tone(n,.35,.14,'triangle',i*.085));for(let i=0;i<3;i++)setTimeout(()=>this.noise(.25,.2,700),i*160);}
}
