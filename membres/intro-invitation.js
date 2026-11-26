const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
export const INTRO_INVITATION_DURATION=20000;
export const INTRO_INVITATION_DIALOGUE=Object.freeze([
 'Invitons un personnage du texte d’Ahmed Marie. Le voici !',
 'Regarde, on peut changer de personnage. En voici un autre.',
 'Touche le petit téléphone pour lui parler de vive voix.'
]);

// One clock controls the real salon, its selector and the subsequent garden.
export function introInvitationCue(elapsedMs=0){
 const elapsed=clamp(Number(elapsedMs)||0,0,INTRO_INVITATION_DURATION);
 const second=elapsed>=10500;
 const phase=elapsed<1200?'establish':elapsed<2500?'choose':elapsed<8200?'first':elapsed<10500?'random':elapsed<17500?'second':'farewell';
 const appearing=smooth((elapsed-(second?11200:3600))/1200);
 const departing=second?1:1-smooth((elapsed-8200)/1000);
 return {
  elapsedMs:elapsed,phase,mode:elapsed<8200?'choose':'random',
  selectedIndex:second?1:0,guestIndex:second?1:0,
  guestOpacity:appearing*departing,
  selectorVisible:elapsed>=1200&&elapsed<18000,
  cardVisible:elapsed>=2500&&elapsed<18000&&phase!=='random',
  exitOpacity:smooth((elapsed-19000)/1000),
  dialogueIndex:elapsed<8200?0:elapsed<14500?1:2,
  dialogueVisible:elapsed>=500&&elapsed<19500,
  // The roulette previews real index entries, then resolves to the prepared
  // example, so slower devices never swap in an undressed or partial figure.
  roulette:phase==='random'?Math.floor((elapsed-8200)/160):-1
 };
}

export function introInvitationLayout({width=1280,height=720}={}){
 width=Math.max(1,Number(width)||1);height=Math.max(1,Number(height)||1);
 const portrait=width/height<1.1;
 const top=Math.min(height*.23,portrait?(width<360?122:112):height<360?74:104);
 const side=portrait?0:Math.min(358,width*.37);
 const bottom=portrait?Math.min(268,height*.39):0;
 const margin=width<500?10:16;
 const panel=portrait?
  {left:margin,top:height-bottom,width:width-margin*2,height:bottom-margin}:
  {left:width-side,top:top+margin,width:side-margin,height:height-top-margin*2};
 return {portrait,top,side,bottom,
  sceneRect:{left:margin,top:top+8,right:width-side-margin,bottom:height-bottom-margin},panel};
}
