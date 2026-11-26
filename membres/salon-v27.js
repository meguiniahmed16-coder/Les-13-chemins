import {generateAppearance} from './starting-appearance.js?v=incarnations33';
import {referenceStudio,normaliseStudio} from './studio-look.js?v=incarnations33';
import {reactionFor} from './conversation-reactions.js';
import {createDrawer} from './studio-drawer.js?v=studio-rail1';
import {createSalonChat} from './salon-chat.js?v=eleven70&rev=rencontres1';
import {createSalonNavigation} from './salon-maison-ui.js?v=call61&rev=rencontres1';
import {guestAppearance} from './salon-encounter.js?v=call58';
import {loadStudio} from './studio-model.js?v=incarnations33';
import {createSalonInspection} from './salon-inspection.js?v=incarnations33';
import {resource} from './studio-assets.js';
import {createPerformer} from './salon-performance.js';
import {incarnationsURLFor} from './incarnations-dialog.js?v=incarnations33';

class SalonV27 extends HTMLElement{
  #frame;#ready;#scene;#drawer;#nav;#chat;#options;#look;#guest;#gender;#drafts={};#serial={f:0,m:0,guest:0};#fallback;#listen;#cameraKey='';#ownStyle=createPerformer('joueur');#lastTalk=0;#editing='';#inspection;#drawerView;#inspectionTools;#inspectionPending=new Set();
  constructor(){
    super();
    this.#inspection=createSalonInspection({
      context:()=>({...this.#options,authorRoom:this.hasAttribute('salon-auteur')}),ready:()=>this.#ready,
      connected:()=>this.isConnected,serial:this.#serial,load:loadStudio,
      prepare:(scene,slot)=>{
        const prepared=scene.prepareInspection?.(slot)===true;
        scene.setGender(this.#gender);return prepared;
      }
    });
    const root=this.attachShadow({mode:'open'});
    root.innerHTML=`<style id="salon-menu-critical">
    /* Style chargé avant les feuilles externes : aucun clignotement de boutons géants. */
    .scene-viewport{position:relative;min-width:0;min-height:0}
    .v27-actions{visibility:hidden!important}
    #maison-dock[hidden],:host .stage #maison-dock[hidden],.maison-rail-panel[hidden],.maison-phone[hidden],.studio-drawer[hidden]{display:none!important}
    .maison-menu-toggle{box-sizing:border-box!important;position:absolute!important;z-index:30!important;top:8px!important;left:8px!important;
      width:48px!important;min-width:48px!important;height:48px!important;min-height:48px!important;
      padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;
      gap:1px!important;border:1px solid #e0d3b4!important;border-radius:13px!important;background:rgba(34,75,57,.91)!important;
      color:#fff6e3!important;box-shadow:0 2px 11px #102b2457!important;font:650 10px/1.1 system-ui!important}
    .maison-menu-toggle svg{display:block!important;width:22px!important;height:22px!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important}
    .maison-menu-toggle span{display:block!important;font:650 10px/1.1 system-ui!important;color:inherit!important}
    .maison-menu-toggle[aria-expanded="true"]{background:rgba(228,207,163,.94)!important;color:#214030!important}
    .maison-dock{position:absolute!important;z-index:29!important;top:8px!important;left:61px!important;right:auto!important;bottom:auto!important;
      display:flex!important;gap:4px!important;align-items:center!important;width:max-content!important;max-width:calc(100% - 115px)!important}
    .maison-dock button{box-sizing:border-box!important;display:grid!important;place-items:center!important;flex:0 0 44px!important;
      width:44px!important;min-width:44px!important;height:48px!important;min-height:48px!important;
      padding:0!important;border-radius:12px!important;overflow:hidden!important;border:1px solid #e0d3b4!important;
      background:rgba(34,75,57,.90)!important;color:#fff6e3!important;font-size:12px!important}
    .maison-dock button svg{display:block!important;width:23px!important;height:23px!important}
    .maison-dock button>span{position:absolute!important;width:1px!important;height:1px!important;clip-path:inset(50%)!important;overflow:hidden!important}
    </style><link rel="stylesheet" href="/membres/salon.css?v=studio-rail1"><link rel="stylesheet" href="/membres/salon-rail52.css?v=hud56"><link rel="stylesheet" href="/membres/salon-call58.css?v=call58"><style>
    .scene-viewport{padding-top:42px;background:#233a30}.v27-frame{width:100%;height:100%;border:0;display:block}
    .v27-actions{position:absolute;top:5px;left:8px;display:flex;align-items:center;gap:4px;z-index:3;pointer-events:none}
    .v27-actions>button{position:static;min-height:37px;pointer-events:auto;padding:4px 8px}
    .hud{position:static;pointer-events:none}.hud .options-toggle,.hud .invite-toggle,.hud .bar{pointer-events:auto}
    .hud .bar:empty{display:none}.v27-actions .invite-toggle{font-size:13px}
    .v27-actions .options-toggle{font-size:13px}.guest-picker{z-index:7}
    .stage.immersive{position:fixed;inset:0;height:100dvh!important;z-index:2147483646}
    .stage:fullscreen{height:100dvh}.stage{min-height:min(420px,65dvh)}
    .v27-inspection-tools{margin:8px 10px;padding:10px;border:1px solid #c6c7a8;border-radius:8px;background:#f4efd9}
    .v27-inspection-tools strong{display:block;font-size:14px;margin-bottom:6px}
    @media(max-width:600px){.stage{height:var(--room-height,min(76dvh,750px))}.v27-actions{gap:2px;left:3px}.v27-actions>button{font-size:12px!important;min-height:34px}}
    @media(max-width:760px),(max-width:960px) and (max-height:500px) and (pointer:coarse){
      .scene-viewport{display:grid;grid-template: auto minmax(0,1fr) / minmax(0,1fr);padding:0;}
      .v27-frame{grid-area:2/1;min-width:0;min-height:0;}
      .stage:has(.studio-drawer:not([hidden])) .scene-viewport{grid-template-rows:minmax(0,1fr)}
      .stage:has(.studio-drawer:not([hidden])) .v27-frame{grid-area:1/1}
      .stage:has(.studio-drawer:not([hidden])) .hud{display:none}
      .hud{grid-area:1/1;position:relative;inset:auto;}
      .v27-actions{position:static;display:flex;flex-wrap:wrap;align-items:stretch;gap:4px;
        padding:4px max(4px,env(safe-area-inset-right)) 0 max(4px,env(safe-area-inset-left));}
      .v27-actions>button{flex:1 1 auto;min-height:38px;min-width:0;font-size:13px!important;}
      .speech-rail{grid-area:2/1;inset-block-start:calc(var(--scene-toolbar-height,46px) + 3px);}
    }
    </style><div class="stage"><div class="scene-viewport">
      <div class="hud"><div class="v27-actions"><button class="options-toggle" type="button" aria-expanded="false" aria-controls="studio-drawer">Personnaliser</button></div><div class="bar"></div></div>
    </div><aside class="studio-drawer" id="studio-drawer" hidden></aside><button class="maison-studio-peek" type="button" hidden>◉ Voir le personnage entier</button></div>`;
    this.#chat=createSalonChat(root,{
      invite:async person=>{
        let {studio,gender}=guestAppearance(person);
        const ownerLook=this.hasAttribute('salon-auteur')&&String(person.id)==='258'&&(this.#drafts.femme?.look||this.#options.salonLooks?.femme);
        try{const saved=sessionStorage.getItem(this.#visitorKey(person));if(saved)studio=normaliseStudio(JSON.parse(saved),true,undefined,gender);else if(ownerLook)studio=ownerLook;}catch{}
        if(!await this.#dress('guest',studio,gender))return false;
        this.#guest={person,gender,studio,performer:createPerformer(person.id)};
        this.#drawer.toggle(false);this.#scene.meet(String(person.id)==='258');this.#cameraKey='';
        const visitor=this.#guest;
        resource('conversation-face').then(channels=>this.#scene?.enableDialogue(channels,()=>this.#speechFrame(),()=>this.#guest===visitor)).catch(()=>{});
        return true;
      },
      customize:()=>this.#editVisitor(),
      leave:()=>{if(this.#editing==='guest')this.#drawer.toggle(false);this.#cameraKey='';this.#serial.guest++;this.#guest=null;this.#scene?.endDialogue();this.#scene?.clearMeeting();this.#scene?.reset('guest');},
      change:()=>this.#syncCamera(),
      rate:who=>who==='guest'?this.#guest?.performer?.rate||1:1,
      gender:who=>(who==='guest'?this.#guest?.gender:this.#gender)||'homme'
    });
    root.querySelector('.v27-actions').append(root.querySelector('.invite-toggle'));
    this.#nav=createSalonNavigation(root);
    this.#drawer=createDrawer(root,look=>this.#applyLook(look),mode=>this.#scene?.focus(mode,this.#editing),()=>this.#scene?.departure(),(open,mode)=>{
      if(open)this.#chat.pauseVoice();
      this.#frame?.contentDocument?.body.classList.toggle('editing-duo',open);
      const stage=root.querySelector('.stage'),peek=root.querySelector('.maison-studio-peek');
      stage.classList.remove('maison-studio-collapsed');peek.hidden=!open;
      peek.textContent='⛶';peek.setAttribute('aria-label','Voir le personnage entier');peek.title='Voir le personnage entier';
      if(open){this.#targets();this.#syncInspectionTools();this.#chat.manual();this.#cameraKey='';this.#scene?.camera('manual');this.#scene?.focus('Corps',this.#editing);}
      else if(this.#editing){this.#editing='';void this.#select(this.#gender);}
    });
    root.host.addEventListener('salon-camera-view',event=>{
      if(!this.#scene)return;
      const view=event.detail?.view;
      if(!['Corps','Visage','Profil','Dos'].includes(view))return;
      this.#chat.manual();this.#cameraKey='';
      this.#scene.camera('manual');
      this.#scene.focus(view,this.#guest?'guest':this.#editing);
    });
    root.host.addEventListener('salon-open-studio',event=>{
      const category=event.detail?.category==='underwear'?'underwear':'body';
      this.#drawer.selectCategory(category);
    });
    const preview=root.querySelector('.maison-studio-peek');
    root.querySelector('.studio-rail').prepend(preview);
    preview.onclick=()=>{
      const collapsed=this.#drawer.togglePreview();
      const button=root.querySelector('.maison-studio-peek');
      button.textContent=collapsed?'⚙':'⛶';button.setAttribute('aria-label',collapsed?'Afficher les réglages':'Voir le personnage entier');button.title=button.getAttribute('aria-label');
      button.setAttribute('aria-pressed',String(collapsed));
      if(collapsed)this.#scene?.focus('Corps',this.#editing);
    };
  }
  #targets(){
    const header=this.shadowRoot.querySelector('.studio-drawer header');
    let choice=header.querySelector('select');
    if(!choice){choice=document.createElement('select');choice.setAttribute('aria-label','Personnage à personnaliser');header.querySelector('.close').before(choice);}
    choice.replaceChildren(new Option('Mon avatar',''));
    if(this.hasAttribute('salon-auteur')&&this.#gender!=='femme'&&String(this.#guest?.person.id)!=='258')choice.add(new Option('Marianne','resident'));
    if(this.#guest)choice.add(new Option(this.#guest.person.name,'guest'));
    choice.hidden=choice.length===1;choice.value=this.#editing;
    choice.onchange=()=>{
      this.#editing=choice.value;
      if(this.#editing==='guest')this.#editVisitor();
      else if(this.#editing==='resident'){
        const options=this.#options;
        const saved=this.#drafts.femme?.look||options.salonLooks?.femme||referenceStudio('femme');
        const state=this.#drafts.femme??={reference:referenceStudio('femme'),saved:options.salonLooks?.femme,custom:!!options.salonLooks?.femme,look:saved};
        this.shadowRoot.querySelector('.v27-look-choice').hidden=true;
        this.#configureDrawer(state,{gender:'femme',plus:true,savedStudio:state.saved||state.reference,
          change:look=>{state.look=look;state.custom=true;},
          save:async look=>{await options.saveCharacter('femme',look);state.saved=look;
            try{localStorage.setItem('salon-v27-look:'+options.memberKey+(options.gender==='femme'?'':':femme'),'1');}catch{}}},'f');
      }else void this.#select(this.#gender);
      this.#scene?.focus('Corps',this.#editing);
    };
  }
  #visitorKey(person){return 'salon-invite-apparence:'+this.#options.memberKey+':'+person.id;}
  #editVisitor(){
    const guest=this.#guest;if(!guest)return;
    this.#editing='guest';
    this.#drawerView=null;this.#inspectionTools?.remove();
    this.shadowRoot.querySelector('.v27-look-choice')?.setAttribute('hidden','');
    this.#drawer.configure(guest.studio,{gender:guest.gender,plus:true,savedStudio:guest.studio,
      change:look=>{guest.studio=look;},save:async look=>{sessionStorage.setItem(this.#visitorKey(guest.person),JSON.stringify(look));}});
    this.#drawer.toggle(true);
  }
  #syncCamera(){
    if(!this.#guest||!this.#chat||!this.#scene)return;
    const shot=this.#chat.shot(this.#scene.settled);
    const inset=Math.min(.40,this.#chat.inset/Math.max(1,this.#frame?.clientHeight||1)),key=shot.size+'/'+shot.speaker+'/'+Math.round(inset*100);
    if(key!==this.#cameraKey){this.#cameraKey=key;this.#scene.camera(shot.size,shot.speaker,inset);}
  }
  #speechFrame(){
    if(!this.#guest)return null;
    const now=performance.now()/1000,dt=Math.min(.1,now-this.#lastTalk);this.#lastTalk=now;
    this.#syncCamera();const line=this.#chat.playback.frame(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const face=(style,who)=>{
      const active=line?.who===who;
      const pose=style.sample(now,dt,active?'speak':line?.who?'listen':'idle',line?.line,reduced);
      const reaction=reactionFor(line?.reaction,who);
      return {gesture:pose,reaction,recordingTime:active?line.recordingTime:reaction?.recordingTime,blink:pose.blink,jaw:active?line.jaw:0,spread:active?line.spread:0,round:active?line.round:0};
    };
    return {member:face(this.#ownStyle,'player'),guest:face(this.#guest.performer,'guest')};
  }
  #dress(slot,look,gender,options){return this.#inspection.dress(slot,look,gender,options);}
  async #applyLook(look){
    if(this.#editing==='guest')return this.#dress('guest',look,this.#guest.gender);
    const view=this.#drawerView,gender=this.#editing==='resident'?'femme':this.#gender,slot=gender==='femme'?'f':'m';
    const before=this.#inspection.active(slot),applied=await this.#dress(slot,look,gender);
    if(applied!==false&&this.#drawerView===view){
      if(before!==this.#inspection.active(slot))this.#refreshDrawer();else this.#syncInspectionTools();
    }
    return applied;
  }
  #configureDrawer(state,options,slot){
    this.#drawerView={state,options:{...options,owner:Boolean(this.#options?.author),incarnationsURL:this.#options?.incarnationsURL},slot};this.#refreshDrawer();
  }
  #refreshDrawer(){
    const view=this.#drawerView;if(!view)return;
    const {state,options,slot}=view;
    this.#drawer.configure(state.look,{...options,inspection:this.#inspection.active(slot),
      removeClothes:this.#inspection.allowed(slot,options.gender)?()=>this.#toggleInspection(view):undefined,
      save:draft=>options.save(this.#inspection.active(slot)?state.look:draft)
    });
    this.#syncInspectionTools();
  }
  #syncInspectionTools(){
    const view=this.#drawerView;
    if(!view||!this.#inspection.allowed(view.slot,view.options.gender)){this.#inspectionTools?.remove();return;}
    if(!this.#inspectionTools){
      const tools=this.#inspectionTools=document.createElement('section');tools.className='v27-inspection-tools';
      tools.setAttribute('aria-label','Inspection administrateur du corps');
      tools.append(document.createElement('strong'),document.createElement('button'));
      tools.querySelector('button').type='button';
    }
    const title=this.#inspectionTools.querySelector('strong'),button=this.#inspectionTools.querySelector('button');
    title.textContent='ADMIN · '+(view.options.gender==='femme'?'Marianne':'Ahmed Marie');
    button.textContent=this.#inspection.active(view.slot)?'Remettre les vêtements':'Retirer les vêtements';
    button.disabled=this.#inspectionPending.has(view.slot)||view.state.look.face.age===5;
    button.onclick=()=>this.#toggleInspection(view);
    this.shadowRoot.querySelector('.studio-scroll').prepend(this.#inspectionTools);
  }
  async #toggleInspection(view){
    const {state,options,slot}=view;if(this.#inspectionPending.has(slot))return false;
    this.#inspectionPending.add(slot);this.#syncInspectionTools();
    const message=this.shadowRoot.querySelector('footer [role=status]');message.textContent='';
    try{
      const applied=await this.#inspection.toggle(slot,state.look,options.gender);
      if(applied!==false&&this.#drawerView===view){this.#refreshDrawer();this.#scene.focus('Corps',slot);}
      return applied;
    }catch(error){if(this.#drawerView===view)message.textContent=error.message;return false;}
    finally{this.#inspectionPending.delete(slot);this.#syncInspectionTools();}
  }
  connectedCallback(){
    if(this.#frame||this.#fallback)return;
    const frame=this.#frame=document.createElement('iframe');
    frame.title='La Croisée des Âmes, le salon et le parc';frame.className='v27-frame';frame.allow='camera; fullscreen';frame.allowFullscreen=true;
    this.#listen=new AbortController();
    const signal=this.#listen.signal;
    this.#ready=new Promise(resolve=>{
      const settle=()=>{
        const doc=frame.contentDocument,win=frame.contentWindow;
        if(!doc||!win||!doc.getElementById('scene'))return;
        const toolbarObserver=new win.ResizeObserver(entries=>{
          const height=entries[0].target.getBoundingClientRect().height;
          frame.parentElement?.style.setProperty('--scene-toolbar-height',height+'px');
        });
        toolbarObserver.observe(doc.querySelector('.top'));
        signal.addEventListener('abort',()=>toolbarObserver.disconnect(),{once:true});
        const ready=()=>{
          if(signal.aborted||this.#scene)return;
          this.#scene=win.salonV27;this.#scene.setGender(this.#options?.gender);
          this.#nav?.linkScene(doc,this.#scene);
          doc.body.classList.toggle('editing-duo',!this.shadowRoot.querySelector('.studio-drawer').hidden);
          const full=doc.getElementById('fullscreen');
          full.onclick=async()=>{const stage=this.shadowRoot.querySelector('.stage');
            try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else stage.classList.toggle('immersive');}
            catch{stage.classList.toggle('immersive');}
          };
          resolve(this.#scene);this.dispatchEvent(new CustomEvent('avatar-ready'));
        };
        win.addEventListener('salon-ready',ready,{signal});
        win.addEventListener('salon-role-change',event=>{if(this.#options)this.#select(event.detail);},{signal});
        win.addEventListener('salon-manual-camera',()=>{this.#chat.manual();this.#syncCamera();},{signal});
        if(doc.body.classList.contains('ready'))ready();
        const failed=()=>{if(doc.getElementById('retry')?.hidden===false&&!this.#scene){frame.style.visibility='';resolve(null);
          if(!doc.getElementById('compatible-room')){
            const button=doc.createElement('button');button.id='compatible-room';button.textContent='Ouvrir la vue compatible';
            button.onclick=()=>this.#software();doc.getElementById('loading').append(button);
          }}};
        new win.MutationObserver(failed).observe(doc.getElementById('loading'),{subtree:true,attributes:true,childList:true});failed();
      };
      frame.addEventListener('load',settle,{signal});
    });
    frame.style.visibility='hidden';frame.src='/membres/v27/salon.html?v=call58'+(this.hasAttribute('salon-auteur')?'&resident=marianne':'');
    this.shadowRoot.querySelector('.scene-viewport').prepend(frame);
  }
  async #software(){
    if(this.#fallback)return;
    await import('./avatar.js?v=incarnations33');
    if(!this.isConnected||this.#fallback)return;
    this.#fallback=document.createElement('chemins-avatar');this.#fallback.setAttribute('scene','salon');
    this.shadowRoot.querySelector('.stage').hidden=true;
    this.shadowRoot.append(this.#fallback);
    this.#fallback.addEventListener('avatar-ready',()=>this.dispatchEvent(new CustomEvent('avatar-ready')));
    if(this.#options)await this.#fallback.configure(this.#look,this.#options);
  }
  disconnectedCallback(){this.#nav?.dispose();this.#listen?.abort();this.#inspection.clear();this.#inspectionPending.clear();this.#drawerView=null;this.#chat.reset();this.#scene=null;this.#frame?.remove();this.#frame=null;}
  configure(look,options){
    options={...options,incarnationsURL:incarnationsURLFor(options)};
    const changed=this.#options?.memberKey!==options.memberKey||this.#options.gender!==options.gender||Boolean(this.#options.author)!==Boolean(options.author)||Boolean(this.#options.temporary)!==Boolean(options.temporary);
    this.#look=look;this.#options=options;
    if(this.#fallback)return this.#fallback.configure(look,options);
    if(!changed){return;}
    this.#inspection.clear();this.#inspectionPending.clear();this.#drafts={};this.#drawerView=null;
    return this.#ready.then(async scene=>{
      if(!scene||this.#options?.memberKey!==options.memberKey)return;
      try{scene.setGender(options.gender);await this.#select(options.gender);
        if(this.hasAttribute('salon-auteur')&&options.gender!=='femme'&&options.salonLooks?.femme){
          let original=false;try{original=localStorage.getItem('salon-v27-look:'+options.memberKey+':femme')==='0';}catch{}
          if(!original)await this.#dress('f',options.salonLooks.femme,'femme');
        }
      }finally{if(this.#frame)this.#frame.style.visibility='';}
    });
  }
  async #select(gender){
    const options=this.#options,key=gender==='femme'?'f':'m',own=gender===options.gender;
    this.#gender=gender;
    const pref='salon-v27-look:'+options.memberKey;
    const storage=gender===options.gender?pref:pref+':'+gender;
    const stored=options.salonLooks?.[gender];
    const saved=stored||(own?options.savedStudio:null),author=this.hasAttribute('salon-auteur');
    let reference=this.#drafts[gender]?.reference;
    if(!reference){
      const key=storage+':initial';
      try{const raw=sessionStorage.getItem(key);if(!author&&raw)reference=normaliseStudio(JSON.parse(raw),true,undefined,gender);}catch{}
      reference??=author?referenceStudio(gender):saved||generateAppearance(gender,1,true).studio;
      if(!author)try{sessionStorage.setItem(key,JSON.stringify(reference));}catch{}
    }
    let state=this.#drafts[gender];
    if(!state){
      let previous=null;try{previous=(options.temporary?sessionStorage:localStorage).getItem(storage);}catch{}
      const use=Boolean(saved)&&(previous==='1'||((stored||!author)&&previous!=='0'));
      state=this.#drafts[gender]={reference,look:use?normaliseStudio(saved,options.plus,undefined,gender,{owner:Boolean(options.author)}):reference,custom:use,saved};
    }
    const choices=this.shadowRoot.querySelector('.studio-drawer');
    let switcher=choices.querySelector('.v27-look-choice');
    if(!switcher){switcher=document.createElement('button');switcher.className='v27-look-choice';switcher.type='button';choices.querySelector('header').after(switcher);}
    const label=()=>{switcher.hidden=!author||!state.custom&&!state.saved;switcher.textContent=state.custom?'Reprendre le personnage V27':'Porter mon apparence enregistrée';};
    const persistChoice=()=>{try{(options.temporary?sessionStorage:localStorage).setItem(storage,state.custom?'1':'0');}catch{}};
    const configureDrawer=()=>this.#configureDrawer(state,{...options,gender,savedStudio:state.saved||reference,
      change:draft=>{state.look=draft;state.custom=true;label();if(own)options.change(draft);},
      save:async draft=>{await options.saveCharacter(gender,draft);state.saved=draft;state.custom=true;persistChoice();if(this.#gender===gender)label();}
    },key);
    switcher.disabled=false;
    switcher.onclick=async()=>{
      const before={...state};state.custom=!state.custom;
      state.look=state.custom?normaliseStudio(state.saved,options.plus,undefined,gender,{owner:Boolean(options.author)}):reference;
      switcher.disabled=true;
      try{
        if(state.custom){if(!await this.#dress(key,state.look,gender,{inspection:false}))return;}
        else{this.#inspection.reset(key);this.#scene.reset(key);}
        persistChoice();if(this.#gender===gender){configureDrawer();label();}
      }catch{Object.assign(state,before);if(this.#gender===gender)choices.querySelector('footer [role=status]').textContent='Chargement interrompu.';}
      finally{if(this.#gender===gender)switcher.disabled=false;}
    };
    configureDrawer();label();
    if(!choices.hidden)this.#scene.focus(choices.querySelector('.switch button:last-child').getAttribute('aria-pressed')==='true'?'Corps':'Visage');
    if(state.custom||!author||this.#inspection.active(key))await this.#dress(key,state.look,gender);
    else{this.#inspection.reset(key);this.#scene.reset(key);}
  }
  openOptions(open=true){if(this.#fallback)this.#fallback.openOptions(open);else this.#drawer.toggle(open);}
  armAhmedVoice(){return this.#chat?.armAhmedVoice()===true;}
  narrateAhmed(text,done){return this.#chat?.narrateAhmed(text,done)===true;}
  stopAhmedVoice(){this.#chat?.stopAvatarVoice();}
  invitePersonnage(){this.#nav?.invite();}
  appelerPersonnage(){this.#nav?.call();}
  snapshot(){return this.#fallback?.snapshot()||this.#scene?.snapshot()||null;}
}
if(!customElements.get('chemins-salon'))customElements.define('chemins-salon',SalonV27);
