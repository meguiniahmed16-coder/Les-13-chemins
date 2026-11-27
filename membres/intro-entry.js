import {startIntro} from './intro-startup.js';

import {isGuestCinema,completeGuestCinema} from './intro-public.js';
void startIntro(()=>import('./intro-cinema.js')).then(ok=>{
 if(!ok&&isGuestCinema(location.search)){const skip=document.getElementById('skip');skip.disabled=false;skip.onclick=()=>completeGuestCinema(window,true);}
});
