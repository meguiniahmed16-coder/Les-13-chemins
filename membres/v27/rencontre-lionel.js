// Two independent guests of the MakeHuman V27 studio. No profile is written.
const wardrobe = '/membres/';
const looks = [
  {face:{hair:7,hairTone:1,iris:3,brows:2,face:1,jawline:2,chin:2,gaze:1,nose:2,mouth:1,body:3},skinLevel:41,iris:'#573d2c',outfit:{haut:'mh2909',bas:'mh1655',souliers:'mh438'}},
  {face:{hair:8,hairTone:9,iris:0,brows:1,face:3,jawline:1,chin:3,gaze:2,nose:1,mouth:3,body:1},skinLevel:9,iris:'#718c99',outfit:{haut:'mh1416',bas:'mh807',souliers:'mh1732'}}
];
export async function dressFriends(bridge,readSpeech){
  const [{normaliseStudio},{loadStudio},{resource}] = await Promise.all([
    import(wardrobe+'studio-look.js'),import(wardrobe+'studio-model.js'),import(wardrobe+'studio-assets.js')
  ]);
  for(const [i,preset] of looks.entries()){
    const look=normaliseStudio(preset,true,{},'homme');
    const figure=await loadStudio(look,'homme');
    await bridge.dress(i?'guest':'member',figure,'homme',()=>true);
  }
  await bridge.enableDialogue(await resource('conversation-face'),readSpeech);
}
const firstLine='Alors, il fait toujours aussi beau là-haut ?';
const reply='Et toi, t’es toujours danseur ?';
const sent=3.9, answered=7.5, orbitStart=11.1, end=17.9;
export function reunionDialogue(){
  const draft=document.getElementById('reunionCompose'),field=document.getElementById('reunionDraft');
  const bubbles=[document.getElementById('reunionWords'),document.getElementById('lionelWords')];
  let time=-1,finished=false,phase='',letters=-1;
  function stop(){
    time=-1;finished=false;phase='';letters=-1;field.value='';draft.hidden=true;
    for(const bubble of bubbles)bubble.hidden=true;
    document.body.classList.remove('reunionChat');
  }
  function start(){stop();time=0;document.body.classList.add('reunionChat');tick(0);}
  function tick(dt){
    if(time<0)return;
    time+=dt;
    if(time>=end){stop();finished=true;return;}
    const next=time<sent?'typing':time<answered?'sent':time<orbitStart?'reply':'laugh';
    if(next==='typing'){
      const length=Math.max(0,Math.min(firstLine.length,Math.floor((time-.22)*13)));
      if(letters!==length){field.value=firstLine.slice(0,length);letters=length;}
    }
    if(next===phase)return;
    phase=next;draft.hidden=phase!=='typing';
    bubbles[0].hidden=phase!=='sent'&&phase!=='laugh';bubbles[1].hidden=phase!=='reply'&&phase!=='laugh';
    bubbles[0].querySelector('span').textContent=phase==='laugh'?'Ha ha !':firstLine;
    bubbles[1].querySelector('span').textContent=phase==='laugh'?'Ha ha !':reply;
  }
  function pose(slot){
    const laugh=phase==='laugh',beat=time*(slot?14:16)+slot*.8;
    return {jaw:laugh?.14+.19*Math.abs(Math.sin(beat)):0,round:0,spread:laugh?.78:.06,
      blink:time>=0?Math.max(0,Math.cos(time*2.1+slot*2)*14-13):0};
  }
  return {stop,start,tick,bubbles,get phase(){return phase;},get active(){return time>=0;},get finished(){return finished;},
    get revolution(){return Math.min(1,Math.max(0,(time-orbitStart)/(end-orbitStart-.60)));},
    get laughter(){return phase==='laugh'?time:0;},get poses(){return {member:pose(0),guest:pose(1)};}};
}
