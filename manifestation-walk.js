// Real street connections, compressed distances. The meeting location is an
// adaptation of the memoir, which specifies only “à mi-chemin”. No network calls.
export const WALK_VERSION=1;
export const PARIS_NODES=Object.freeze({
 repub:{x:0,z:0,name:'Place de la République'},
 calvaire:{x:0,z:70,name:'Filles-du-Calvaire'},
 meeting:{x:0,z:110,name:'Saint-Sébastien–Froissart'},
 claude:{x:1,z:137,name:'Rue Saint-Claude'},
 gilles:{x:3,z:171,name:'Rue Saint-Gilles'},
 bastille:{x:7,z:224,name:'Place de la Bastille'},
 tcal:{x:-48,z:79,name:'Turenne · Filles-du-Calvaire'},
 tpont:{x:-46,z:117,name:'Turenne · Pont-aux-Choux'},
 tclaude:{x:-43,z:144,name:'Turenne · Saint-Claude'},
 tgilles:{x:-40,z:177,name:'Turenne · Saint-Gilles'},
 antoine:{x:-37,z:221,name:'Turenne · Saint-Antoine'},
 francs:{x:-39,z:197,name:'Turenne · Francs-Bourgeois'},
 vieille:{x:-100,z:184,name:'Francs-Bourgeois · Vieille-du-Temple'},
 archives:{x:-131,z:181,name:'Archives · Rambuteau'},
 pompidou:{x:-166,z:163,name:'Centre Pompidou'},
 merri:{x:-163,z:195,name:'Saint-Merri · Rue du Renard'},
 hotelville:{x:-160,z:235,name:'Hôtel de Ville'},
 fourcy:{x:-90,z:235,name:'Saint-Paul · Rue de Fourcy'},
 jouy:{x:-90,z:251,name:'Fourcy · François-Miron'},
 pontmarie:{x:-90,z:279,name:'Pont Marie · Quai de l’Hôtel-de-Ville'},
 quai:{x:-160,z:279,name:'Quai de l’Hôtel-de-Ville'}
});
export const PARIS_STREETS=Object.freeze([
 {id:'temple',a:'repub',b:'calvaire',name:'Boulevard du Temple',width:17},
 {id:'calvaire',a:'calvaire',b:'meeting',name:'Boulevard des Filles-du-Calvaire',width:17},
 {id:'beaumarchais-n',a:'meeting',b:'claude',name:'Boulevard Beaumarchais',width:17},
 {id:'beaumarchais-c',a:'claude',b:'gilles',name:'Boulevard Beaumarchais',width:17},
 {id:'beaumarchais-s',a:'gilles',b:'bastille',name:'Boulevard Beaumarchais',width:17},
 {id:'filles',a:'calvaire',b:'tcal',name:'Rue des Filles-du-Calvaire',width:10},
 {id:'pont',a:'meeting',b:'tpont',name:'Rue du Pont-aux-Choux',width:9},
 {id:'claude',a:'claude',b:'tclaude',name:'Rue Saint-Claude',width:9},
 {id:'gilles',a:'gilles',b:'tgilles',name:'Rue Saint-Gilles',width:10},
 {id:'turenne-n',a:'tcal',b:'tpont',name:'Rue de Turenne',width:10},
 {id:'turenne-c',a:'tpont',b:'tclaude',name:'Rue de Turenne',width:10},
 {id:'turenne-s',a:'tclaude',b:'tgilles',name:'Rue de Turenne',width:10},
 {id:'turenne-bas',a:'tgilles',b:'francs',name:'Rue de Turenne',width:10},
 {id:'antoine',a:'antoine',b:'bastille',name:'Rue Saint-Antoine',width:14},
 {id:'turenne-sud',a:'francs',b:'antoine',name:'Rue de Turenne',width:10},
 {id:'francs-est',a:'francs',b:'vieille',name:'Rue des Francs-Bourgeois',width:10},
 {id:'francs-ouest',a:'vieille',b:'archives',name:'Rue des Francs-Bourgeois',width:10},
 {id:'rambuteau',a:'archives',b:'pompidou',name:'Rue Rambuteau',width:11},
 {id:'beaubourg',a:'pompidou',b:'merri',name:'Rue Beaubourg',width:13},
 {id:'renard',a:'merri',b:'hotelville',name:'Rue du Renard',width:13},
 {id:'rivoli',a:'hotelville',b:'fourcy',name:'Rue de Rivoli',width:16},
 {id:'antoine-ouest',a:'fourcy',b:'antoine',name:'Rue Saint-Antoine',width:14},
 {id:'lobau',a:'hotelville',b:'quai',name:'Rue de Lobau',width:10},
 {id:'fourcy',a:'fourcy',b:'jouy',name:'Rue de Fourcy',width:9},
 {id:'nonnains',a:'jouy',b:'pontmarie',name:'Rue des Nonnains-d’Hyères',width:10},
 {id:'quai',a:'quai',b:'pontmarie',name:'Quai de l’Hôtel-de-Ville',width:14}
]);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function streetChoices(node){return PARIS_STREETS.filter(e=>e.a===node||e.b===node).map(e=>({...e,to:e.a===node?e.b:e.a,destination:PARIS_NODES[e.a===node?e.b:e.a].name}));}
export function newWalk(){return {version:WALK_VERSION,node:'meeting',from:'meeting',to:null,edge:null,progress:0,offset:0,x:0,z:110,heading:0,waiting:true,visited:['meeting'],distance:0,rally:0,conversation:0};}
export function chooseStreet(w,id){
 if(!w.waiting)return false;
 const e=streetChoices(w.node).find(s=>s.id===id);if(!e)return false;
 w.from=w.node;w.to=e.to;w.edge=id;w.progress=0;w.offset=0;w.waiting=false;
 const a=PARIS_NODES[w.from],b=PARIS_NODES[w.to];
 w.heading=Math.atan2(b.x-a.x,b.z-a.z);return true;
}
export function advanceWalk(w,dt,input={}){
 if(w.waiting)return false;
 const e=PARIS_STREETS.find(e=>e.id===w.edge);if(!e)return false;
 const a=PARIS_NODES[w.from],b=PARIS_NODES[w.to],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
 const t=clamp(Number(dt)||0,0,.12),ix=clamp(Number(input.x)||0,-1,1),iy=clamp(Number(input.y)||0,-1,1),mag=Math.max(1,Math.hypot(ix,iy));
 const before=w.progress;w.progress=clamp(w.progress+iy/mag*5.6*t,0,len);
 w.offset=clamp(w.offset+ix/mag*4.3*t,-e.width/2+1.2,e.width/2-1.2);
 const taper=Math.min(1,w.progress/5,(len-w.progress)/5),off=w.offset*Math.max(0,taper);
 w.x=a.x+ux*w.progress+uz*off;w.z=a.z+uz*w.progress-ux*off;w.distance+=Math.abs(w.progress-before);
 w.rally=Math.max(0,w.rally-t);
 if(w.progress>=len-.02){w.node=w.to;w.waiting=true;w.x=b.x;w.z=b.z;w.offset=0;if(!w.visited.includes(w.node))w.visited.push(w.node);return true;}
 // Retreat is always possible: return to the previous junction and choose anew.
 if(w.progress===0&&iy<0){w.node=w.from;w.waiting=true;w.x=a.x;w.z=a.z;w.offset=0;return true;}
 return false;
}
export function restoreWalk(value){
 if(!value||value.version!==WALK_VERSION||!PARIS_NODES[value.node])return null;
 if(value.edge==='turenne-bas'&&[value.from,value.to].includes('antoine'))value={...value,waiting:true,breadcrumbs:undefined};
 if(!['x','z','heading','progress','offset','distance'].every(k=>Number.isFinite(value[k])))return null;
 if(typeof value.waiting!=='boolean'||value.x< -210||value.x>100||value.z< -10||value.z>310||value.distance<0)return null;
 if(!value.waiting){const e=PARIS_STREETS.find(e=>e.id===value.edge);if(!e||!((e.a===value.from&&e.b===value.to)||(e.b===value.from&&e.a===value.to)))return null;
 const a=PARIS_NODES[value.from],b=PARIS_NODES[value.to],len=Math.hypot(b.x-a.x,b.z-a.z);if(value.progress<0||value.progress>len||Math.abs(value.offset)>e.width/2)return null;}
 const w={...newWalk(),node:value.node,from:value.from,to:value.to,edge:value.edge,progress:value.progress,offset:value.offset,x:value.x,z:value.z,heading:value.heading,waiting:value.waiting,distance:value.distance,conversation:Number.isSafeInteger(value.conversation)&&value.conversation>=0?value.conversation:0};
 w.visited=[...new Set([...(Array.isArray(value.visited)?value.visited:[]),value.node].filter(n=>PARIS_NODES[n]))];
 if(w.waiting){const n=PARIS_NODES[w.node];w.x=n.x;w.z=n.z;w.from=w.node;w.to=null;w.edge=null;w.progress=0;w.offset=0;w.heading=Math.atan2(Math.sin(w.heading),Math.cos(w.heading));}
 else {if(w.node!==w.from)return null;const a=PARIS_NODES[w.from],b=PARIS_NODES[w.to];w.heading=Math.atan2(b.x-a.x,b.z-a.z);advanceWalk(w,0);}
 if(Array.isArray(value.breadcrumbs)){const points=value.breadcrumbs.slice(-180);if(points.every((p,i)=>p&&['x','z','d','heading'].every(k=>Number.isFinite(p[k]))&&p.x> -230&&p.x<100&&p.z> -70&&p.z<350&&p.d>=0&&(!i||p.d>=points[i-1].d))&&points.length>1&&Math.hypot(points.at(-1).x-w.x,points.at(-1).z-w.z)<1)w.breadcrumbs=points.map(({x,z,d,heading})=>({x,z,d,heading}));}
 return w;
}
export function mapMarkup(w){
 const px=n=>18+(n.x+175)*.87,py=n=>16+n.z*.69;
 const roads=PARIS_STREETS.map(e=>{const a=PARIS_NODES[e.a],b=PARIS_NODES[e.b];return `<path d="M${px(a)} ${py(a)} L${px(b)} ${py(b)}" class="${e.id===w?.edge?'map-current':'map-road'}"/>`;}).join('');
 const labels={repub:'République',meeting:'Froissart',bastille:'Bastille',pompidou:'Beaubourg',hotelville:'Hôtel de Ville',pontmarie:'Pont Marie'};
 const places=Object.entries(labels).map(([id,name])=>{const n=PARIS_NODES[id],left=['pompidou','hotelville','pontmarie'].includes(id);return `<circle cx="${px(n)}" cy="${py(n)}" r="2.5"/><text x="${px(n)+(left?-4:5)}" y="${py(n)-5}" text-anchor="${left?'start':'start'}">${name}</text>`;}).join('');
 return `<svg viewBox="0 0 250 235" role="img" aria-label="Paris : République, Bastille, le Marais, Beaubourg et les quais, avec votre position"><text x="14" y="16">N ↑</text><path class="map-river" d="M10 219 L146 219"/>${roads}${places}<text x="64" y="111" class="map-marais">LE MARAIS</text><text x="42" y="229">LA SEINE</text><circle cx="${px(w||PARIS_NODES.meeting)}" cy="${py(w||PARIS_NODES.meeting)}" r="5" class="map-you"/></svg>`;
}
