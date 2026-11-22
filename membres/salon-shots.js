// Hold the opening two-shot, cut on replies, and vary long speeches without cutting on each word.
export function createShotSequence(){
  let opened=0,changed=0,turn=0,speaker='player',last=-1,cut=0,shot={size:'wide',speaker};
  return {
    reset(now){opened=changed=now;turn=0;last=-1;cut=0;speaker='player';shot={size:'wide',speaker};},
    turn(who){speaker=who;turn++;},
    frame(now,atRest=true){
      if(!atRest){opened=now;last=-1;changed=now;return shot={size:'wide',speaker};}
      if(now-opened<1.8)return shot;
      if(last!==turn&&now-changed>=1.4){
        cut++;last=turn;changed=now;
        const size=cut%5===0?'wide':cut%2?'medium':'close';
        shot={size,speaker};
      }else if(now-changed>=7&&shot.size!=='close'){
        // One closer cut on a sustained turn; hold it until the next reply.
        changed=now;shot={size:shot.size==='wide'?'medium':'close',speaker};
      }
      return shot;
    }
  };
}
