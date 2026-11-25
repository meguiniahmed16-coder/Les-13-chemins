import test from 'node:test';
import assert from 'node:assert/strict';
import {createIncarnationsDialog,INCARNATIONS_URL,incarnationsURLFor} from './incarnations-dialog.js';

class Node extends EventTarget{
 constructor(tag){super();this.tagName=tag;this.children=[];this.attributes={};this.isConnected=true;this.messages=[];this.contentWindow={postMessage:(message,origin)=>this.messages.push({message,origin,source:this.src})};this.open=false;}
 append(...children){this.children.push(...children);}
 setAttribute(key,value){this.attributes[key]=value;}
 removeAttribute(key){delete this.attributes[key];if(key==='src')this.src='';}
 showModal(){this.open=true;}
 close(){this.open=false;this.dispatchEvent(new Event('close'));}
 focus(){this.focused=true;}
}
function setup(){
 const mount=new Node('root'),win=new EventTarget();win.location={origin:'https://tectonique-des-ames.com'};
 let allowed=false;
 const opener=new Node('button'),launcher=createIncarnationsDialog({mount,win,doc:{createElement:tag=>new Node(tag)},allowed:()=>allowed});
 return {mount,win,opener,launcher,authorize:()=>allowed=true,
  message(origin,source,type='INCARNATIONS_CLOSE'){const e=new Event('message');Object.assign(e,{origin,source,data:{type}});win.dispatchEvent(e);}};
}
test('the signed-in launcher creates the workshop inside its room and returns focus on close',()=>{
 const h=setup();assert.equal(h.launcher.open(h.opener),false);assert.equal(h.mount.children.length,0);
 h.authorize();assert.equal(h.launcher.open(h.opener),true);
 const dialog=h.mount.children[0],frame=dialog.children[1];
 assert.equal(dialog.open,true);assert.equal(frame.src,INCARNATIONS_URL);
 h.message('https://other.example',frame.contentWindow);assert.equal(dialog.open,true);
 h.message(h.win.location.origin,{});assert.equal(dialog.open,true);
 h.message(h.win.location.origin,frame.contentWindow,'OTHER');assert.equal(dialog.open,true);
 h.message(h.win.location.origin,frame.contentWindow);assert.equal(dialog.open,false);
 assert.deepEqual(frame.messages,[{message:{type:'INCARNATIONS_SUSPEND'},origin:h.win.location.origin,source:INCARNATIONS_URL}]);
 assert.equal(frame.src,'');assert.equal(h.opener.focused,true);
 h.launcher.open(h.opener);assert.equal(h.mount.children.length,1);assert.equal(dialog.open,true);
 h.launcher.close();assert.equal(dialog.open,false);
});
test('members and the owner can open the workshop, while guest and demonstration views cannot',()=>{
 assert.equal(incarnationsURLFor({authenticated:true,memberKey:17}),INCARNATIONS_URL);
 assert.equal(incarnationsURLFor({authenticated:true,memberKey:18,author:'atelier'}),INCARNATIONS_URL);
 for(const options of [{},{memberKey:17},{authenticated:true},{authenticated:true,memberKey:'invite-123',temporary:true},{authenticated:true,memberKey:'apercu-femme-gratuit'},{authenticated:false,memberKey:17}]){
  assert.equal(incarnationsURLFor(options),'');
 }
});
