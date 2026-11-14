// Quiet, procedural foley: no download, microphone, speech service or loop.
export function createPrisonFoley(){
 let context=null,enabled=true,paused=false,closed=false;
 const live=new Set();
 function unlock(){
  if(closed||!enabled)return;
  try{const Audio=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext;if(!Audio)return;context??=new Audio();if(!paused)context.resume?.().catch?.(()=>{});}catch{}
 }
 function play(kind='plastic'){
  if(!enabled||paused||!context||context.state!=='running')return;
  const duration=kind==='wire'?.12:kind==='wood'?.17:.26,now=context.currentTime;
  const gain=context.createGain(),filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=kind==='wood'?360:kind==='wire'?1650:2100;filter.Q.value=kind==='wire'?3:.65;
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  let last=0;for(let i=0;i<data.length;i++){last=last*.52+(Math.random()*2-1)*.48;data[i]=last*(.65+.35*Math.sin(i/context.sampleRate*75));}
  const source=context.createBufferSource();source.buffer=buffer;
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(kind==='wood'?.07:.045,now+.018);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  source.connect(filter).connect(gain).connect(context.destination);live.add(source);
  source.onended=()=>{live.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(now);source.stop(now+duration+.02);
 }
 function mute(value){enabled=!value;if(!enabled){for(const s of live)try{s.stop();}catch{}}else{unlock();}return enabled;}
 function suspend(value){paused=value;if(context){const p=value?context.suspend():enabled?context.resume():null;p?.catch?.(()=>{});}}
 function dispose(){closed=true;for(const s of live)try{s.stop();}catch{}context?.close?.().catch?.(()=>{});}
 return {unlock,play,mute,suspend,dispose,get enabled(){return enabled;}};
}
