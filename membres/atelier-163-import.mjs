import {models,CHUNK,ZIP_BYTES,hashes,digest,spec} from './atelier-163-archive.mjs';
const $=id=>document.getElementById(id), endpoint='/api/intro-private/atelier-163/';
let running=false,stop=false,session=false;
async function api(path,options={}){
 const r=await fetch(endpoint+path,{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(65000),...options});
 if(!r.ok){const e=new Error(r.status===401?'Session auteur expirée. Reconnecte-toi puis reprends.':r.status===422?'Ce fragment ne correspond pas à l’archive originale.':'Erreur serveur '+r.status+' ('+path+').');e.status=r.status;throw e;}return r;
}
async function state(){
 const result={};for(const id of ['m','f']){const d=await (await api(id+'/manifest')).json();if(!Array.isArray(d.present)||d.present.length!==hashes[id].length)throw Error('Manifeste privé invalide.');result[id]=d.present.map(x=>x===true);}return result;
}
function show(s){const m=s.m.filter(Boolean).length,f=s.f.filter(Boolean).length,total=m+f;$('progress').value=total;$('status').textContent=total+' / 60 fragments vérifiés';$('details').textContent='Ahmed : '+m+'/29 · Marianne : '+f+'/31';$('finished').hidden=total!==60;$('import').hidden=!session||total===60;return total;}
async function init(){try{const r=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok||!(await r.json()).author){$('gate').hidden=false;$('status').textContent='Connexion auteur nécessaire.';return;}session=true;show(await state());}catch(e){$('error').textContent=e.message;}}
$('archive').onchange=()=>{$('resume').disabled=!$('archive').files[0]||running;$('error').textContent='';};
$('stop').onclick=()=>{stop=true;$('stop').disabled=true;$('status').textContent='Arrêt après le fragment en cours…';};
$('resume').onclick=async()=>{
 if(running)return;const file=$('archive').files[0];if(!file)return;
 if(file.size!==ZIP_BYTES){$('error').textContent='Taille incorrecte : utilise exactement l’archive du premier kimono (129 182 766 octets), sans la décompresser.';return;}
 running=true;stop=false;$('resume').disabled=true;$('stop').disabled=false;$('archive').disabled=true;$('error').textContent='';
 try{
  const s=await state();show(s);
  for(const id of ['m','f']){
   const model=models[id];
   for(let i=0;i<hashes[id].length;i++){
    if(stop)break;if(s[id][i])continue;
    const p=spec(id,i),part=id+'/'+String(i).padStart(3,'0');
    const b=await file.slice(model.offset+i*CHUNK,model.offset+i*CHUNK+p.bytes).arrayBuffer();
    if(b.byteLength!==p.bytes||await digest(b)!==hashes[id][i])throw Error('Archive incorrecte : '+model.name+' fragment '+i+'. Aucun fragment incorrect n’a été enregistré.');
    $('status').textContent='Envoi '+model.name+' · fragment '+(i+1)+'/'+hashes[id].length;
    let last;for(let trial=0;trial<3;trial++){try{const res=await (await api(part,{method:'PUT',headers:{'content-type':'application/octet-stream'},body:b})).json();if(res.sha256!==hashes[id][i])throw Error('Empreinte serveur incorrecte.');last=null;break;}catch(e){last=e;if(e.status===401||e.status===422||stop)break;await new Promise(r=>setTimeout(r,700*(trial+1)));}}
    if(last)throw last;s[id][i]=true;show(s);
   }
   if(stop)break;
  }
  show(await state());
 }catch(e){$('error').textContent=e.message+' Les fragments validés restent conservés.';try{show(await state());}catch{}}
 finally{running=false;$('resume').disabled=!$('archive').files[0];$('stop').disabled=true;$('archive').disabled=false;}
};
init();
