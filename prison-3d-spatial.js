import {SLIT_X,clamp} from './yoyo-core.js';

export const BAR_Z=-1.665;
export const BAG_RADIUS=.058;
export const BAR_RADIUS=.018;
export const BAG_CLEARANCE=.029;

export function renderPixelRatio(width,height,deviceRatio=1){
 return Math.max(1,Math.min(deviceRatio||1,2,Math.sqrt(3_200_000/(width*height))));
}
export function windowScale(aspect){return 2*.88*Math.tan(63*Math.PI/360)*Math.max(.85,aspect);}
export function ropeWorldX(game,normalised){return (normalised-.5)*windowScale(game.aspect);}
export function ropeWorldZ(game){return -1.91+Math.min(1,game.pull||0)*.72;}

// While the bag intersects the plane of the bars, lateral motion is confined
// to the same opening. The original core already blocks forward pulling when
// not aligned; this also prevents dragging a half-pulled bag through the iron.
export function constrainBagX(previousX,desiredX,z){
 if(Math.abs(z-BAR_Z)>=BAG_RADIUS+BAR_RADIUS)return desiredX;
 const slot=SLIT_X.reduce((a,b)=>Math.abs(previousX-a)<Math.abs(previousX-b)?a:b);
 return clamp(desiredX,slot-BAG_CLEARANCE,slot+BAG_CLEARANCE);
}
