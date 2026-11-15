(()=>{
  const API='https://ahmed-marie-double.meguiniahmed16.workers.dev/dialogues';
  const feed=document.getElementById('dialogueFeed'),status=document.getElementById('dialogueStatus'),more=document.getElementById('dialogueMore');
  let cursor=null,busy=false,started=false;
  function message(speaker,text,kind){const article=document.createElement('article');article.className='dialogue-message '+kind;const name=document.createElement('h2');name.className='dialogue-speaker';name.textContent=speaker;const content=document.createElement('p');content.className='dialogue-text';content.textContent=text;article.append(name,content);return article;}
  async function load(){if(busy)return;busy=true;more.disabled=true;status.textContent='Le dialogue s’ouvre…';
    try{const r=await fetch(API+(cursor?'?after='+encodeURIComponent(cursor):''),{cache:'no-store',signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok||!Array.isArray(data.dialogues))throw new Error();
      const fragment=document.createDocumentFragment();for(const section of data.dialogues){const divider=document.createElement('div');divider.className='dialogue-day';const time=document.createElement('time');time.dateTime=section.date;time.textContent=new Date(section.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});divider.append(time);fragment.append(divider);for(const t of section.turns){fragment.append(message('Ahmed Marie',t.prompt,'human'),message('Ahmed numérique',t.response,'digital'));}}
      feed.append(fragment);started=true;cursor=data.next||null;more.hidden=!cursor;more.textContent='Lire la suite du dialogue';status.textContent=feed.childElementCount?'':'Le premier dialogue sera publié ici bientôt.';
    }catch{status.textContent='Le dialogue ne s’est pas chargé. Tu peux réessayer.';more.hidden=false;more.textContent='Réessayer';}
    finally{busy=false;more.disabled=false;}}
  more.addEventListener('click',()=>void load());void load();
})();
