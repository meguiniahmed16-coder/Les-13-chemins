const RETURN_URL='jeu.html?niveau=5';
const noop=()=>{};

/**
 * Bridge to the existing level-5 prison protocol. The parent alone credits
 * points; this module never reads or writes the board's saved progression.
 *
 * Construct before loading assets, call sendReady after the first rendered
 * frame, and call win only after all three trials. Initial/duplicate init
 * messages do not restart gameplay. onReplay waits for both a new parent
 * session and readiness. Public standalone play never sends score messages.
 *
 * Methods return true when a new request is accepted, even if it must wait
 * for initialization/acknowledgement; false means ignored or already handled.
 * `host` is injectable for CPU tests and defaults to the browser window.
 */
export function createPrisonSession({host=globalThis.window,onReplay=noop,onFinished=noop}={}){
 if(!host?.addEventListener||!host?.removeEventListener)
  throw new TypeError('Une fenêtre est nécessaire pour la session de prison.');
 const parentWindow=host.parent||host;
 const embedded=parentWindow!==host;
 const origin=host.location?.origin;
 const usableOrigin=typeof origin==='string'&&origin.length>0&&origin!=='null';
 const retiredIds=new Set();
 let session=null,ready=false,won=false,wonSent=false,result=null;
 let replayRequested=false,replaySent=false,pendingStart=false,closed=false,disposed=false;
 const active=()=>!closed&&!disposed;

 function post(type,extra={}){
  if(disposed||!embedded||!usableOrigin)return false;
  try{
   parentWindow.postMessage({type,...(session?{id:session.id}:{}),...extra},origin);
   return true;
  }catch{return false;}
 }
 function flushWin(){
  if(!active()||!ready||!session||!won||wonSent)return false;
  // Set before postMessage so synchronous test hosts are also idempotent.
  wonSent=true;
  if(!post('yoyo:won',{points:30})){wonSent=false;return false;}
  return true;
 }
 function flushReplay(){
  if(!active()||!ready||!result||!replayRequested||replaySent)return false;
  replaySent=true;
  if(!post('yoyo:replay')){replaySent=false;return false;}
  return true;
 }
 function startPending(){
  if(!active()||!ready||!pendingStart)return;
  pendingStart=false;onReplay(session);
 }
 function validInit(message){
  return typeof message.id==='string'&&message.id.trim().length>0&&
   message.level===5&&message.plateau===2&&
   (message.replay===undefined||typeof message.replay==='boolean');
 }
 function receive(event){
  if(!active()||!embedded||!usableOrigin||event.source!==parentWindow||event.origin!==origin)return;
  const message=event.data;
  if(!message||typeof message!=='object'||Array.isArray(message))return;
  if(message.type==='yoyo:init'){
   if(!validInit(message)||retiredIds.has(message.id))return;
   if(session?.id===message.id){flushWin();return;}
   if(session){
    retiredIds.add(session.id);
    won=wonSent=false;result=null;replayRequested=replaySent=false;
    pendingStart=true;
   }
   session=Object.freeze({id:message.id,level:5,plateau:2,replay:message.replay===true});
   startPending();flushWin();
  }else if(message.type==='yoyo:finished'){
   if(!session||message.id!==session.id||!wonSent||result)return;
   if(![0,30].includes(message.bonus)||!Number.isFinite(message.score)||message.score<0||
    typeof message.replay!=='boolean'||message.replay!==session.replay)return;
   result=Object.freeze({id:session.id,bonus:message.bonus,score:message.score,replay:message.replay});
   onFinished(result);flushReplay();
  }
 }
 function sendReady(){
  if(!active()||ready)return false;
  ready=true;post('yoyo:ready');startPending();flushWin();flushReplay();return true;
 }
 function win(){
  if(!active()||won)return false;
  won=true;flushWin();return true;
 }
 function replay(){
  if(!active())return false;
  if(!embedded){
   won=wonSent=false;result=null;pendingStart=true;startPending();return true;
  }
  // Never restart locally against an old credited ID. The parent acknowledges
  // victory, allocates a fresh ID, then its init starts the replay.
  if(!session||!wonSent||replayRequested)return false;
  replayRequested=true;flushReplay();return true;
 }
 function dispose(){
  if(disposed)return false;
  disposed=true;pendingStart=false;replayRequested=false;
  host.removeEventListener('message',receive);
  host.removeEventListener('pagehide',dispose);
  return true;
 }
 function close(){
  if(!active())return false;
  closed=true;
  if(embedded)post('yoyo:close');
  else if(typeof host.location?.assign==='function')host.location.assign(RETURN_URL);
  else if(host.location)host.location.href=RETURN_URL;
  dispose();return true;
 }
 host.addEventListener('message',receive);
 host.addEventListener('pagehide',dispose,{once:true});
 return {sendReady,win,close,replay,dispose,
  get embedded(){return embedded;},get session(){return session;},get ready(){return ready;},
  get wonSent(){return wonSent;},get finished(){return result!==null;},get result(){return result;},
  get replayPending(){return replayRequested;}
 };
}
