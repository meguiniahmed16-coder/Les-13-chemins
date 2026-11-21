// Timing of a silent line, or a fallback between word boundaries supplied by a French voice.
const shapes={
  open:[.55,0,.08],rounded:[.32,.82,0],small:[.17,.47,0],wide:[.23,0,.85],
  mid:[.35,0,.3],closed:[0,0,0],teeth:[.09,0,.24],soft:[.14,0,.07]
};
const vowels=/a|à|â|e|é|è|ê|ë|i|î|ï|o|ô|u|ù|û|y|œ/;
function sounds(word){
  const groups=word.toLowerCase().match(/eaux?|ou|oi|au|on|om(?=[bp])|an|en|ain|ein|in|un|ai|ei|eu|œu|ch|ph|qu|gn|[a-zàâéèêëîïôùûüÿçœ]/gu)||[];
  return groups.map((g,i)=>{
    if(i===groups.length-1&&i>1&&['e','s','t','x'].includes(g))return null;
    if(/^[bmp]$/.test(g))return 'closed';
    if(/^(ou|au|eaux?|o|ô|on|om|eu|œu)$/.test(g))return 'rounded';
    if(/^[uùû]$/.test(g))return 'small';
    if(/^(a|à|â|an|en|oi)$/.test(g))return 'open';
    if(/^(i|î|ï|y|é|ai|ei|in|ain|ein)$/.test(g))return 'wide';
    if(/^(ph|f|v|s|z|ch|j)$/.test(g))return 'teeth';
    return vowels.test(g)?'mid':'soft';
  }).filter(Boolean);
}
export function scoreLine(text,rate=1){
  let time=0;
  const words=Array.from(text.matchAll(/\S+/gu),m=>{
    const units=sounds(m[0]),start=time;
    const pulses=units.map(shape=>{
      const duration=(['closed','soft','teeth'].includes(shape)?.062:.118)/rate;
      const pulse={shape,start:time,duration};time+=duration;return pulse;
    });
    const end=time;time+=(/[.!?…][»”"')]*$/.test(m[0])?.27:/[,;:][»”"')]*$/.test(m[0])?.15:.035)/rate;
    return {start,end,index:m.index,length:m[0].length,pulses};
  });
  return {text,words,duration:time};
}
export function articulation(line,time){
  const words=line.words;
  let lo=0,hi=words.length;
  while(lo+1<hi){const mid=(lo+hi)>>1;if(words[mid].start<=time)lo=mid;else hi=mid;}
  const word=words[lo],silent={jaw:0,round:0,spread:0,word:lo};
  if(!word||time<word.start||time>=word.end)return silent;
  const index=word.pulses.findIndex(p=>time<p.start+p.duration);
  if(index<0)return silent;
  const pulse=word.pulses[index],shape=shapes[pulse.shape],phase=(time-pulse.start)/pulse.duration;
  const before=shapes[word.pulses[index-1]?.shape||'closed'];
  const after=shapes[word.pulses[index+1]?.shape||'closed'];
  const adjacent=phase<.5?before:after;
  const mix=.5*Math.max(0,1-Math.min(phase,1-phase)*pulse.duration/.025);
  const beat=.80+.20*Math.sin(Math.PI*phase);
  const value=i=>beat*(shape[i]*(1-mix)+adjacent[i]*mix);
  return {jaw:value(0),round:value(1),spread:value(2),word:lo};
}
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const smooth=x=>x*x*(3-2*x);
function personality(identity){
  let n=2166136261;
  for(const ch of String(identity))n=Math.imul(n^ch.charCodeAt(0),16777619);
  const next=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
  return {strength:.46+.54*next(),hand:next()<.5?-1:1,tempo:.90+.24*next(),poise:next()};
}
// Lateral reach (cm from sternum), wrist height (cm below shoulder), forward reach,
// torso pitch and palm rotation. Each motif has ten variations in timing, weight and handedness.
const gestures=[
  [34,-18,20,.09,.95], [19,-20,30,.12,.89], [17,-13,23,.06,.42], [28,-10,16,.035,.56],
  [15,-15,12,-.12,.18], [7,-19,15,-.07,.20], [22,-9,27,.09,.26], [31,-14,21,.01,.98],
  [8,-10,10,-.035,.40], [15,-27,19,-.04,.62]
];
export function createPerformer(identity,random=Math.random){
  const style=personality(identity);
  let nextBeat=-1,start=0,duration=1,gesture=0,variation=0,lastRole='',lastLine=null;
  let yaw=0,pitch=0,tilt=0,nod=0,left=0,right=0,palm=0,reach=18,height=-22,forward=14;
  const phase=random()*3,blinkPeriod=3+2.4*random();
  return {
    rate:style.tempo,
    sample(now,dt,role,line,reduced=false){
      const talking=role==='speak',listening=role==='listen';
      if(lastRole!==role||lastLine!==line){nextBeat=now;lastRole=role;lastLine=line;}
      if(now>=nextBeat){
        const previous=gesture;
        gesture=Math.min(9,Math.floor(random()*10));
        if(talking&&gesture===previous)gesture=(gesture+1)%10;
        variation=Math.min(9,Math.floor(random()*10));
        start=now;duration=(talking?1.05+random()*1.05:1.45+random()*1.15)/style.tempo;
        nextBeat=now+duration+(talking?.14+random()*.59:listening?.5+random()*1.6:2+random()*3);
      }
      const u=clamp((now-start)/duration,0,1);
      const env=smooth(Math.min(1,u/.3))*smooth(Math.min(1,(1-u)/.39));
      const side=variation%3===0?-style.hand:style.hand;
      const v=gestures[gesture],rhythm=.82+.18*Math.cos((variation%3+1)*Math.PI*2*u),power=reduced?0:env*style.strength;
      const targetArm=talking?power*rhythm:listening&&gesture===8?power*.17:0;
      const both=talking&&[0,3,5,7].includes(gesture),other=both?.55+(variation%4)*.1:.10;
      const blend=1-Math.exp(-Math.min(.3,dt)*9);
      const to=(a,b)=>a+(b-a)*blend;
      left=to(left,targetArm*(side<0?1:other));right=to(right,targetArm*(side>0?1:other));
      reach=to(reach,v[0]);height=to(height,v[1]);forward=to(forward,v[2]);palm=to(palm,v[4]);
      pitch=to(pitch,power*(talking?v[3]:listening?(gesture%4===0?-.050:.09):.025));
      yaw=to(yaw,power*(talking?.09:.038)*side);
      tilt=to(tilt,power*(talking?.036:.081)*side);
      nod=to(nod,power*(listening?.13:talking?.077:.022)*Math.sin(Math.PI*2*u*(variation%2+1)));
      const blink=reduced?0:Math.max(0,1-Math.abs((now+phase)%blinkPeriod-.12)/.11);
      return {left,right,reach,height,forward,palm,pitch,yaw,tilt,nod,blink};
    }
  };
}
