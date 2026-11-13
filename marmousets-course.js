// Deterministic course shared by the scene, session validation and tests.
(function(root){
 const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 const FINISH=51,MAX_X=53,JUMP_TIME=1.45,JUMP_DISTANCE=4.4,JUMP_HEIGHT=1.35,REAR_TIME=2.2;
 const obstacles=[
  {id:'barrier-1',x:13,height:.73,name:'La barrière de la cour',kind:'rails'},
  {id:'barrier-2',x:24,height:.68,name:'Les bottes de paille',kind:'straw'},
  {id:'barrier-3',x:35,height:.7,name:'Le tronc sur le chemin',kind:'log'},
  {id:'barrier-4',x:46,height:.76,name:'La dernière barrière',kind:'gate'}
 ];
 const groups=[{id:'parents',x:3.7,title:'Mes parents et l’adulte des Marmousets'},...obstacles.map((o,i)=>({id:'group-'+(i+1),x:o.x-3.8,title:'Des adultes devant '+o.name.toLowerCase(),obstacle:o.id}))];
 const adults=groups.flatMap((g,j)=>[-.8,.25,1.25].map((z,i)=>({id:g.id+'-'+i,group:g.id,x:g.x+(i===0?.25:i===2?.5:0),z,role:j===0?['Père','Mère','Adulte des Marmousets'][i]:'Adulte',female:j===0?i===1:(j+i)%3===0,height:(j===0?[1.81,1.68,1.77][i]:[1.73,1.83,1.67][(j+i)%3]),age:j===0?[34,29,48][i]:[24,43,67,31,58,72][(j*3+i)%6],hair:j===0?['#35291f','#30241e','#777268'][i]:['#5a3828','#30281f','#b3b1a5','#98724c','#827f77','#d1cbbb'][(j*3+i)%6],trousers:['#3b4d61','#5c5146','#454748'][(j+i)%3],color:['#496b5f','#a56b63','#54768a','#a58c53','#756b87','#665447','#8d963e','#695c85'][(j*3+i)%8]})));
 const phase=(s,p)=>{s.phase=p;s.time=0;};
 const mounted=s=>['ride','rear','jump','stumble'].includes(s.phase);
 const height=t=>JUMP_HEIGHT*Math.sin(Math.PI*clamp(t,0,1));
 const groupClear=(s,g)=>s.adults.filter(a=>a.group===g.id).every(a=>a.fleeTime!==null);
 function create(auto=false){return{phase:'approach',time:0,total:0,x:0,vx:0,childX:-3,auto,adultClear:false,jumped:false,complete:false,gallop:false,queued:null,jumpVx:0,jumpStartX:0,jumpMistake:null,notice:'',noticeTime:0,adults:adults.map(a=>({...a,fleeTime:null})),obstacles:obstacles.map(o=>({...o,intact:true,hitTime:null,cleared:false,bloomed:false})),meadow:{target:0,events:[],finished:false}};}
 function bloom(s,kind,x,id){const m=s.meadow,from=m.target;m.target=kind==='arrival'?1:Math.min(.94,from+(kind==='adult'?.5/adults.length:.4/obstacles.length));m.events.push({kind,id,x,at:s.total,from,to:m.target});}
 function scare(s){for(const g of groups){if(Math.abs(s.x-g.x)>2.75)continue;for(const a of s.adults.filter(a=>a.group===g.id&&a.fleeTime===null)){a.fleeTime=0;bloom(s,'adult',a.x,a.id);}}s.adultClear=s.adults.every(a=>a.fleeTime!==null);}
 function action(s,type='rear',input=0){if(s.phase==='mountReady'&&type==='rear'){phase(s,'mount');return true;}if(!mounted(s))return false;if(s.phase!=='ride'){s.queued={type,input};return true;}if(type==='rear'){phase(s,'rear');s.vx=0;}else if(type==='jump'){phase(s,'jump');s.jumpStartX=s.x;s.jumpMistake=null;s.jumpVx=Math.sign(s.auto?1:input||s.vx)*JUMP_DISTANCE/JUMP_TIME;}else return false;return true;}
 function ride(s){phase(s,'ride');if(s.queued){const q=s.queued;s.queued=null;action(s,q.type,q.input);}}
 function ground(s,next){for(const g of groups)if(!groupClear(s,g)&&s.x<=g.x-1.65&&next>g.x-1.65)next=Math.min(next,g.x-1.65);for(const o of s.obstacles)if(o.intact){if(s.x<=o.x-.95&&next>o.x-.95)next=Math.min(next,o.x-.95);if(s.x>=o.x+.95&&next<o.x+.95)next=Math.max(next,o.x+.95);}return clamp(next,0,MAX_X);}
 function hit(s,o,t){o.intact=false;o.hitTime=0;s.jumpMistake=t<.5?'late':'early';s.notice=t<.5?'Un peu tard : l’obstacle a été touché.':'Un peu tôt : la descente a commencé avant l’obstacle.';s.noticeTime=3;}
 function step(s,dt,input=0){
  dt=clamp(dt,0,.05);if(!dt)return s;const oldX=s.x,oldTime=s.time;s.time+=dt;s.total+=dt;s.noticeTime=Math.max(0,s.noticeTime-dt);
  for(const a of s.adults)if(a.fleeTime!==null)a.fleeTime+=dt;
  for(const o of s.obstacles)if(o.hitTime!==null)o.hitTime+=dt;
  const direction=s.auto?1:input;
  if(s.phase==='approach'){s.childX=clamp(s.childX+direction*.72*dt,-3.4,-1.27);if(s.childX>=-1.27)phase(s,'mountReady');}
  else if(s.phase==='mountReady'){if(s.auto&&s.time>.4)action(s,'rear');}
  else if(s.phase==='mount'){if(s.time>=1.85)ride(s);}
  else if(s.phase==='ride'){
   s.x=ground(s,s.x+direction*(s.gallop?3.5:1.65)*dt);s.vx=(s.x-oldX)/dt;
   const g=groups.find(g=>!groupClear(s,g)&&s.x>=g.x-1.8&&s.x<g.x+2.5),o=s.obstacles.find(o=>!o.cleared);
   if(s.auto&&g)action(s,'rear');else if(s.auto&&o&&s.x>=o.x-2.15)action(s,'jump',1);
   else if(s.x>=FINISH&&s.adultClear&&s.obstacles.every(o=>o.cleared))phase(s,'finish');
  }else if(s.phase==='rear'){scare(s);if(s.time>=REAR_TIME)ride(s);}
  else if(s.phase==='jump'){
   if(direction)s.jumpVx=Math.sign(direction)*JUMP_DISTANCE/JUMP_TIME;
   s.x=clamp(s.x+s.jumpVx*Math.min(dt,Math.max(0,JUMP_TIME-oldTime)),0,MAX_X);scare(s);
   for(const o of s.obstacles){
    if(o.intact&&s.x!==oldX)for(const edge of[-.9,.9]){const a=oldX+edge,b=s.x+edge;if((a-o.x)*(b-o.x)<=0&&a!==b){const t=(oldTime+dt*clamp((o.x-a)/(b-a),0,1))/JUMP_TIME;if(height(t)<o.height+.06){hit(s,o,t);break;}}}
    if(o.intact&&Math.abs(s.x-o.x)<.9&&height(s.time/JUMP_TIME)<o.height+.06)hit(s,o,s.time/JUMP_TIME);
    if(s.x>o.x+.95)o.cleared=true;
   }
   if(s.time>=JUMP_TIME){
    s.jumped=true;
    if(!s.jumpMistake)for(const o of s.obstacles)if(o.intact&&!o.bloomed&&((s.jumpStartX<o.x-.95&&s.x>o.x+.95)||(s.jumpStartX>o.x+.95&&s.x<o.x-.95))){o.bloomed=true;bloom(s,'obstacle',o.x,o.id);}
    if(s.jumpMistake)phase(s,'stumble');else ride(s);
   }
  }else if(s.phase==='stumble'){s.x=ground(s,s.x+direction*.65*dt);if(s.time>=.65)ride(s);}
  else if(s.phase==='finish'){if(!s.meadow.finished){bloom(s,'arrival',s.x,'arrival');s.meadow.finished=true;}if(s.time>=1.2)s.complete=true;}
  for(const o of s.obstacles)if(!o.intact&&s.x>o.x+.95)o.cleared=true;
  return s;
 }
 root.MarmousetsCourse={FINISH,MAX_X,obstacles,adults,groups,create,step,action,groupClear,height,mounted};
})(typeof window==='undefined'?globalThis:window);
