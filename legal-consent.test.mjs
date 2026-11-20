import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
test('Aucun identifiant de visite et aucun appel de mesure avant accord, ou après refus',()=>{
 const store=new Map([['am-visitor-v1','ancien']]),events={},buttons={},sent=[];
 const node=()=>({textContent:'',focus(){},hidden:true,addEventListener(type,cb){this['on'+type]=cb;}});
 const panel={...node(),querySelector(k){return buttons[k]??=node();}};const manage=node();
 const document={readyState:'complete',visibilityState:'visible',getElementById:()=>panel,querySelector:()=>null,querySelectorAll:()=>[manage],addEventListener(){}};
 const window={addEventListener(k,cb){(events[k]??=[]).push(cb);},dispatchEvent(e){for(const cb of events[e.type]||[])cb(e);}};window.top=window.self=window;
 const ctx=vm.createContext({window,document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},location:{hostname:'tectonique-des-ames.com',pathname:'/'},setInterval(){},crypto,Date,Event,fetch(...args){sent.push(args);return Promise.resolve();}});
 vm.runInContext(read('site-consent.js'),ctx);
 vm.runInContext(read('site-visits.js'),ctx);
 assert.equal(sent.length,0);assert.equal(store.has('am-visitor-v1'),false);
 buttons['[data-refuse]'].onclick();assert.equal(sent.length,0);
 manage.onclick();buttons['[data-accept]'].onclick();assert.equal(sent.length,1);assert.ok(store.has('am-visitor-v1'));
 manage.onclick();buttons['[data-refuse]'].onclick();assert.equal(window.tdaAudienceAllowed(),false);assert.equal(store.has('am-visitor-v1'),false);
});
