export const INCARNATIONS_URL='/api/membres/incarnations?embed=salon';

export function incarnationsURLFor({authenticated=false,temporary=false,memberKey}={}){
 return authenticated===true&&!temporary&&memberKey!=null&&!/^(?:invite|apercu)-/.test(String(memberKey))?INCARNATIONS_URL:'';
}

// The document and session revalidation use the site's existing member session.
// Creation runs locally. The server decides whether photo upload or a live
// selfie is available. This launcher only places that document in the room.
export function createIncarnationsDialog({mount,allowed,doc=globalThis.document,win=globalThis.window}){
 let dialog,frame,opener,listen;
 function close(){if(dialog?.open)dialog.close();}
 function open(trigger){
  if(!allowed())return false;
  opener=trigger;
  if(!dialog){
   dialog=doc.createElement('dialog');dialog.className='incarnations-dialog';
   dialog.setAttribute('aria-label','L’Atelier des Incarnations');
   const header=doc.createElement('header'),title=doc.createElement('strong'),back=doc.createElement('button');
   title.textContent='L’Atelier des Incarnations';back.type='button';back.textContent='Retour au Salon';back.onclick=close;
   header.append(title,back);
   frame=doc.createElement('iframe');frame.title='L’Atelier des Incarnations · création et exports 3D';
   frame.setAttribute('allow','camera; fullscreen');
   dialog.append(header,frame);mount.append(dialog);
   dialog.addEventListener('keydown',event=>event.stopPropagation());
   dialog.addEventListener('close',()=>{
    listen?.abort();listen=null;
    // Stop the live camera before releasing the embedded document and renderer.
    frame.contentWindow?.postMessage({type:'INCARNATIONS_SUSPEND'},win.location.origin);
    frame.removeAttribute('src');
    if(opener?.isConnected)opener.focus({preventScroll:true});
   });
  }
  if(dialog.open)return true;
  listen=new AbortController();
  win.addEventListener('message',event=>{
   if(event.origin!==win.location.origin||event.source!==frame.contentWindow)return;
   if(event.data?.type==='INCARNATIONS_CLOSE')close();
  },{signal:listen.signal});
  frame.src=INCARNATIONS_URL;
  dialog.showModal();return true;
 }
 return {open,close};
}
