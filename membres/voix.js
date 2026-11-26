const $=id=>document.getElementById(id),status=$('status'),form=$('settings'),key=$('key'),save=$('save'),preview=$('preview'),sample=$('sample');let url;
async function request(action,body){
 const r=await fetch('/api/membres/voice/'+action,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(60000)});
 if(!r.ok){const j=await r.json().catch(()=>({}));throw Object.assign(Error(j.error||'Le serveur vocal est inaccessible.'),{status:r.status});}
 return action==='speech'?r.blob():r.json();
}
async function refresh(){
 const data=await request('status');form.hidden=false;const connected=data.providers?.voice==='Cartesia'&&!data.missing?.includes('Cartesia');preview.hidden=!connected;status.textContent=connected?'Cartesia est relié. Tu peux écouter un exemple.':'Cartesia attend ta clé API.';if(data.missing?.includes('OpenAI'))status.textContent+=' La connexion OpenAI du dialogue est aussi manquante.';
}
form.addEventListener('submit',async e=>{e.preventDefault();save.disabled=true;status.textContent='Vérification de Cartesia…';try{await request('settings',{provider:'cartesia',key:key.value.trim()});await refresh();}catch(e){status.textContent=e.message;}finally{key.value='';save.disabled=false;}});
preview.addEventListener('click',async()=>{preview.disabled=true;try{status.textContent='Génération de la voix…';const audio=await request('speech',{text:'Bonjour. Bienvenue dans le Salon.',gender:'femme',strict:true});if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(audio);sample.src=url;sample.hidden=false;status.textContent='Voix Cartesia reçue. Appuie sur lecture si nécessaire.';await sample.play().catch(()=>{});}catch(e){status.textContent=e.message;}finally{preview.disabled=false;}});
refresh().catch(e=>{status.textContent=[401,403].includes(e.status)?'Connecte-toi à ton compte auteur dans Compagnon de route, puis reviens ici.':e.message;});
