(function(root){
 const valid=s=>{const out=[];for(let n=1;n<=5;n++){if((s.dansePassed||[]).includes(n))out.push(n);else break;}return out;};
 function begin(s,correct,id){if(s.dansePending)return s.dansePending;s.dansePending={id,correct:!!correct,level:5,replay:valid(s).length===5};return s.dansePending;}
 function record(s,id,gap){const p=s.dansePending;if(!p||p.id!==id||p.level!==5||p.replay||!Number.isInteger(gap)||gap<1||gap>5)return null;const list=valid(s);if(gap>list.length+1)return null;let added=false;if(!list.includes(gap)){list.push(gap);s.points+=2;added=true;}s.dansePassed=list;return {passed:list,score:s.points,added,gap};}
 function finish(s,id){const p=s.dansePending;if(!p||p.id!==id||valid(s).length!==5)return null;s.dansePending=null;s.danseFinished=true;return {score:s.points,retryQuestion:!p.correct,replay:p.replay};}
 root.DanseScore={valid,begin,record,finish};
})(typeof window==='undefined'?globalThis:window);
