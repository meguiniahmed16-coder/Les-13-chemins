import {reactionFor} from './conversation-reactions.js';
import {createDrawer} from './studio-drawer.js?v=salon43';
import {createSalonChat} from './salon-chat.js?v=salon44';
import {guestAppearance} from './salon-encounter.js?v=salon43';
import {loadStudio} from './studio-model.js?v=salon43';
import {resource} from './studio-assets.js';
import {createPerformer} from './salon-performance.js';

class SalonV27 extends HTMLElement{
  #frame;#ready;#scene;#drawer;#chat;#options;#look;#guest;#serial={member:0,guest:0};#fallback;#listen;#cameraKey='';#ownStyle=createPerformer('joueur');#lastTalk=0;
  constructor(){
    super();
    const root=this.attachShadow({mode:'open'});
    root.innerHTML=`<link rel="stylesheet" href="/membres/salon.css?v=salon45"><style>
    .scene-viewport{padding-top:42px;background:#233a30}.v27-frame{width:100%;height:100%;border:0;display:block}
    .v27-actions{position:absolute;top:5px;left:8px;display:flex;align-items:center;gap:4px;z-index:3;pointer-events:none}
    .v27-actions>button{position:static;min-height:37px;pointer-events:auto;padding:4px 8px}
    .hud{position:static;pointer-events:none}.hud .options-toggle,.hud .invite-toggle,.hud .bar{pointer-events:auto}
    .hud .bar:empty{display:none}.v27-actions .invite-toggle{font-size:13px}
    .v27-actions .options-toggle{font-size:13px}.guest-picker{z-index:7}
    .stage.immersive{position:fixed;inset:0;height:100dvh!important;z-index:2147483646}
    .stage:fullscreen{height:100dvh}.stage{min-height:420px}
    @media(max-width:600px){.stage{height:min(76dvh,750px)}.v27-actions{gap:2px;left:3px}.v27-actions>button{font-size:12px!important;min-height:34px}}
    @media(max-width:760px),(max-width:960px) and (max-height:500px) and (pointer:coarse){
      .scene-viewport{display:grid;grid-template: auto minmax(0,1fr) / minmax(0,1fr);padding:0;}
      .v27-frame{grid-area:2/1;min-width:0;min-height:0;}
      .hud{grid-area:1/1;position:relative;inset:auto;}
      .v27-actions{position:static;display:flex;flex-wrap:wrap;align-items:stretch;gap:4px;
        padding:4px max(4px,env(safe-area-inset-right)) 0 max(4px,env(safe-area-inset-left));}
      .v27-actions>button{flex:1 1 auto;min-height:38px;min-width:0;font-size:13px!important;}
      .speech-rail{grid-area:2/1;inset-block-start:calc(var(--scene-toolbar-height,46px) + 3px);}
    }
    </style><div class="stage"><div class="scene-viewport">
      <div class="hud"><div class="v27-actions"><button class="options-toggle" type="button" aria-expanded="false" aria-controls="studio-drawer">Personnaliser</button></div><div class="bar"></div></div>
    </div><aside class="studio-drawer" id="studio-drawer" hidden></aside></div>`;
    this.#chat=createSalonChat(root,{
      invite:async person=>{
        const {studio,gender}=guestAppearance(person);
        if(!await this.#dress('guest',studio,gender))return false;
        this.#guest={person,gender,performer:createPerformer(person.id)};
        const channels=await resource('conversation-face');
        await this.#scene.enableDialogue(channels,()=>this.#speechFrame());
        this.#drawer.toggle(false);this.#scene.meet();return true;
      },
      leave:()=>{this.#cameraKey='';this.#serial.guest++;this.#guest=null;this.#scene?.endDialogue();this.#scene?.reset('guest');this.#scene?.clearMeeting();},
      change:()=>this.#syncCamera(),
      rate:who=>who==='guest'?this.#guest?.performer?.rate||1:1,
      gender:who=>(who==='guest'?this.#guest?.gender:this.#options?.gender)||'homme'
    });
    root.querySelector('.v27-actions').append(root.querySelector('.invite-toggle'));
    this.#drawer=createDrawer(root,look=>this.#dress('member',look,this.#options.gender),mode=>this.#scene?.focus(mode),()=>this.#scene?.departure());
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
  async #dress(slot,look,gender){
    const id=++this.#serial[slot],scene=await this.#ready;
    if(!scene||id!==this.#serial[slot])return false;
    const figure=await loadStudio(look,gender);
    return scene.dress(slot,figure,gender,()=>this.isConnected&&this.#serial[slot]===id);
  }
  connectedCallback(){
    if(this.#frame||this.#fallback)return;
    const frame=this.#frame=document.createElement('iframe');
    frame.title='Mon salon, la maison et le jardin';frame.className='v27-frame';frame.allowFullscreen=true;
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
          const full=doc.getElementById('fullscreen');
          full.onclick=async()=>{const stage=this.shadowRoot.querySelector('.stage');
            try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else stage.classList.toggle('immersive');}
            catch{stage.classList.toggle('immersive');}
          };
          resolve(this.#scene);this.dispatchEvent(new CustomEvent('avatar-ready'));
        };
        win.addEventListener('salon-ready',ready,{signal});
        win.addEventListener('salon-manual-camera',()=>{this.#chat.manual();this.#syncCamera();},{signal});
        if(doc.body.classList.contains('ready'))ready();
        const failed=()=>{if(doc.getElementById('retry')?.hidden===false&&!this.#scene){resolve(null);
          if(!doc.getElementById('compatible-room')){
            const button=doc.createElement('button');button.id='compatible-room';button.textContent='Ouvrir la vue compatible';
            button.onclick=()=>this.#software();doc.getElementById('loading').append(button);
          }}};
        new win.MutationObserver(failed).observe(doc.getElementById('loading'),{subtree:true,attributes:true,childList:true});failed();
      };
      frame.addEventListener('load',settle,{signal});
    });
    frame.src='/membres/v27/salon.html?v=27duo4';
    this.shadowRoot.querySelector('.scene-viewport').prepend(frame);
  }
  async #software(){
    if(this.#fallback)return;
    await import('./avatar.js?v=salon45');
    if(!this.isConnected||this.#fallback)return;
    this.#fallback=document.createElement('chemins-avatar');this.#fallback.setAttribute('scene','salon');
    this.shadowRoot.querySelector('.stage').hidden=true;
    this.shadowRoot.append(this.#fallback);
    this.#fallback.addEventListener('avatar-ready',()=>this.dispatchEvent(new CustomEvent('avatar-ready')));
    if(this.#options)await this.#fallback.configure(this.#look,this.#options);
  }
  disconnectedCallback(){this.#listen?.abort();this.#serial.member++;this.#serial.guest++;this.#chat.reset();this.#scene=null;this.#frame?.remove();this.#frame=null;}
  configure(look,options){
    const changed=this.#options?.memberKey!==options.memberKey||this.#options.gender!==options.gender;
    this.#look=look;this.#options=options;
    if(this.#fallback)return this.#fallback.configure(look,options);
    const prefs='salon-v27-look:'+options.memberKey;
    const choices=this.shadowRoot.querySelector('.studio-drawer');
    let switcher=choices.querySelector('.v27-look-choice');
    if(!switcher){
      switcher=document.createElement('button');switcher.className='v27-look-choice';switcher.type='button';
      choices.querySelector('header').after(switcher);
    }
    const label=custom=>{switcher.dataset.custom=String(custom);switcher.textContent=custom?'Reprendre le personnage V27':'Porter mon apparence enregistrée';};
    let personal=false;try{personal=localStorage.getItem(prefs)==='1';}catch{}label(personal);
    switcher.onclick=async()=>{
      const custom=switcher.dataset.custom!=='true';switcher.disabled=true;
      try{if(custom)await this.#dress('member',options.savedStudio,options.gender);
        else{this.#serial.member++;this.#scene?.reset('member');}
        try{localStorage.setItem(prefs,custom?'1':'0');}catch{}label(custom);
      }finally{switcher.disabled=false;}
    };
    this.#drawer.configure(look,{...options,save:async value=>{await options.save(value);label(true);try{localStorage.setItem(prefs,'1');}catch{}}});
    if(!changed)return;
    return this.#ready.then(async scene=>{
      if(!scene||this.#options!==options)return;
      scene.setGender(options.gender);scene.reset('member');
      // Accounts originally received a random outfit. Enter with the local duo until the member selects their own look.
      let chosen=false;try{chosen=localStorage.getItem(prefs)==='1';}catch{}
      if(chosen)await this.#dress('member',look,options.gender);
    });
  }
  openOptions(open=true){if(this.#fallback)this.#fallback.openOptions(open);else this.#drawer.toggle(open);}
  snapshot(){return this.#fallback?.snapshot()||this.#scene?.snapshot()||null;}
}
if(!customElements.get('chemins-salon'))customElements.define('chemins-salon',SalonV27);
