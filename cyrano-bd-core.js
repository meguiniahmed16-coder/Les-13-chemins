/* Cyrano — roman-photo cinématographique.
 * Les paroles restent dans cyrano-core.js (V17) : aucun dialogue inventé.
 */
import {SCENES} from './cyrano-core.js';
export const ATLAS={columns:4,rows:2,width:480,height:270};
export const BOARD={width:1020,height:1180};
export const PANELS=Object.freeze([
 Object.freeze({id:'cell-a',x:20,y:20,w:480,h:270,column:0,row:0,room:'a',caption:'CELLULE A · LE NARRATEUR'}),
 Object.freeze({id:'cyrano-profile',x:520,y:20,w:480,h:270,column:1,row:0,room:'a',caption:'CELLULE A · LE PROFIL'}),
 Object.freeze({id:'wall',x:20,y:310,w:480,h:270,column:2,row:0,room:'wall',caption:'LE MUR MITOYEN'}),
 Object.freeze({id:'cell-b',x:520,y:310,w:480,h:270,column:3,row:0,room:'b',caption:'CELLULE B · CÉDRIC'}),
 Object.freeze({id:'cedric-close',x:20,y:600,w:480,h:270,column:0,row:1,room:'b',caption:'CELLULE B · LA PÉNOMBRE'}),
 Object.freeze({id:'passage',x:520,y:600,w:480,h:270,column:1,row:1,room:'wall',caption:'LE TROU DANS LE MUR'}),
 Object.freeze({id:'writing',x:20,y:890,w:480,h:270,column:2,row:1,room:'a',caption:'LA LETTRE'}),
 Object.freeze({id:'return',x:520,y:890,w:480,h:270,column:3,row:1,room:'a',caption:'CELLULE A · LA LUMIÈRE'})
]);
const PANEL_BY_ID=new Map(PANELS.map(p=>[p.id,p]));
export const BEATS=Object.freeze([
 'cell-a','cell-b','cyrano-profile','cyrano-profile',
 'cedric-close','cyrano-profile','cell-b','cell-a',
 'cedric-close','cyrano-profile','cell-b','cyrano-profile',
 'passage','writing'
].map((panel,i)=>Object.freeze({index:i,panel,who:SCENES[i].who,text:SCENES[i].text,duration:SCENES[i].seconds})));
export function panelById(id){return PANEL_BY_ID.get(id)||null;}
export function beat(index){return BEATS[index]||null;}
export function requiresWallCut(previous,next){
 if(!previous||!next)return false;
 const a=panelById(previous.panel),b=panelById(next.panel);
 return !!a&&!!b&&a.room!=='wall'&&b.room!=='wall'&&a.room!==b.room;
}
export function cameraFor(width,height,panelId=null){
 const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
 const panel=panelById(panelId);
 const zoom=panel
  ?Math.min(1.90,w*.99/panel.w,h*.70/panel.h)
  :Math.min(w*.95/BOARD.width,h*.94/BOARD.height);
 const centerX=panel?panel.x+panel.w/2:BOARD.width/2;
 const centerY=panel?panel.y+panel.h/2:BOARD.height/2;
 const targetY=panel?h*.405:h*.5;
 return {scale:zoom,x:w/2-centerX*zoom,y:targetY-centerY*zoom};
}
export function typedCharacters(length,elapsedMs,speedMs=25){
 const max=Math.max(0,Number(length)||0);
 return Math.min(max,Math.max(0,Math.floor((Number(elapsedMs)||0)/speedMs)));
}
export function beatSpeaker(index){
 const who=beat(index)?.who;
 return who==='narrateur'?'LE NARRATEUR':who==='cedric'?'CÉDRIC':'LA NARRATION';
}
