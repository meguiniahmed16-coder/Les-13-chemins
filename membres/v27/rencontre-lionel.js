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
const lines=[
  ['Ahmed Marie','Alors, il fait toujours aussi beau là-haut ?'],
  ['Lionel Le Goff','Et toi, t’es toujours danseur ?'],
  ['Ahmed et Lionel','Ils rient tous les deux.']
];
export function reunionDialogue(){
  const bubble=document.getElementById('reunionWords');
  const voice=new Audio('/membres/v27/lionel-dialogue.mp3');
  let time=-1, line=-1, finished=false;
  function stop(){voice.pause();voice.currentTime=0;time=line=-1;finished=false;bubble.hidden=true;}
  function start(){stop();time=0;voice.play().catch(()=>{});}
  function tick(dt){
    if(time<0)return;
    time=voice.paused?time+dt:voice.currentTime;
    if(time>=8.7){bubble.hidden=true;time=-1;finished=true;return;}
    const next=time>=5.72?2:time>=3.33?1:0;
    if(next===line)return;line=next;bubble.querySelector('b').textContent=lines[line][0];
    bubble.querySelector('span').textContent=lines[line][1];bubble.hidden=false;
  }
  function pose(slot){
    const speaking=time>=0&&(slot===line||line===2);
    const beat=time*(line===2?16:24)+slot*1.9;
    return {jaw:speaking?.19+.37*Math.abs(Math.sin(beat)*Math.cos(beat*.41)):0,
      round:speaking&&line!==2?.27*Math.max(0,Math.sin(beat*.64)):0,
      spread:time>=0&&line===2?.75:speaking?.20:0,blink:Math.max(0,Math.cos(time*2.1+slot*2)*14-13)};
  }
  return {stop,start,tick,get active(){return time>=0;},get finished(){return finished;},
    get laughter(){return line===2&&time>=0?time:0;},get poses(){return {member:pose(0),guest:pose(1)};}};
}
