// Same-origin bridge between the playable scene and the chapter board.
(function(root){
 root.MarmousetsSession=function({window:w,onInit=()=>{},onCredit=()=>{}}){
  const embedded=new URLSearchParams(w.location.search).get('embedded')==='1'&&w.parent!==w;
  let id=null,reported=new Set(),won=false,credited=false;
  const send=(type,extra={})=>{if(embedded)w.parent.postMessage({type,id,...extra},w.location.origin);};
  w.addEventListener('message',e=>{
   if(!embedded||e.origin!==w.location.origin||e.source!==w.parent||!e.data)return;
   const m=e.data;
   if(m.type==='marmousets:init'&&typeof m.id==='string'&&m.id&&m.id!==id){
    id=m.id;reported.clear();won=false;credited=false;onInit(m);
   }else if(m.type==='marmousets:credited'&&id&&m.id===id&&won&&!credited){credited=true;onCredit(m);}
  });
  return {embedded,canPlay:()=>!embedded||!!id,ready:()=>send('marmousets:ready'),
   start(){reported.clear();if(!credited)won=false;},
   observe(s){
    if(!embedded||!id||!s||s.auto||won)return;
    const progress=(kind,item)=>{const key=kind+':'+item;if(!reported.has(key)){reported.add(key);send('marmousets:progress',{kind,item});}};
    if(s.adultClear)progress('scared','a1');
    if(s.obstacles?.some(o=>o.id==='barrier'&&o.cleared))progress('cleared','barrier');
    if(s.complete&&reported.has('scared:a1')&&reported.has('cleared:barrier')){won=true;send('marmousets:won');}
   },close:()=>{if(id)send('marmousets:close');}
  };
 };
})(typeof window==='undefined'?globalThis:window);
