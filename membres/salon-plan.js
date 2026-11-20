// World coordinates are in metres. A seated character faces (sin(yaw), 0, cos(yaw)).
export const bounds = { minX: -3.30, maxX: 5.75, minZ: -2.64, maxZ: 2.95 };
export const roomFocus = { x: 1.15, y: .78, z: .02 };
export const table = { x: 3.85, z: 0, width: .96, depth: 1.85, height: .75 };

function seat(id, label, kind, x, z, height, yaw, width, depth, approach, backHeight) {
  return { id, label, kind, x, z, height, yaw, width, depth, approach, backHeight };
}
const halfTurn = Math.PI;
export const seats = [
  ...[-1.68, -1.12, -.56].map((x, i) => seat(`sofa-${i+1}`, ['Canapé · gauche', 'Canapé · centre', 'Canapé · droite'][i], 'sofa', x, -1.82, .58, 0, .56, .68, {x, z:-1.11}, 1.015)),
  seat('armchair', 'Fauteuil', 'armchair', 1.50, -1, .43, 0, .83, .76, {x:1.5,z:-.27}, .945),
  ...[
    [2.92, -.49, halfTurn/2, 3.02, -1.13], [2.92, .49, halfTurn/2, 3.02, 1.13],
    [4.78, -.49, -halfTurn/2, 4.68, -1.13], [4.78, .49, -halfTurn/2, 4.68, 1.13],
    [3.85, -1.48, 0, 3.25, -1.52], [3.85, 1.48, halfTurn, 4.45, 1.52],
  ].map(([x,z,yaw,ax,az],i) => seat(`dining-${i+1}`, `Chaise ${i+1}`, 'chair', x,z,.46,yaw,.46,.47,{x:ax,z:az},.85)),
];

function rect(id,x,z,width,depth) {
  return { id,minX:x-width/2,maxX:x+width/2,minZ:z-depth/2,maxZ:z+depth/2 };
}
export const obstacles = [
  rect('sofa', -1.11,-1.86,2.17,.92), rect('armchair',1.5,-1.028,.835,.793),
  rect('shelf',1.64,-2.40,1.15,.34), rect('plant',-2.43,-.88,.38,.38), rect('lamp',.5,-1.92,.60,.60),
  rect('table',table.x,table.z,table.width,table.depth),
  ...seats.filter(s=>s.kind==='chair').map(s=>{
    const across = Math.abs(Math.sin(s.yaw)) > .5;
    return rect(s.id,s.x,s.z,across?s.depth:s.width,across?s.width:s.depth);
  }),
];
const inside = (x,z,b,r) => x>=b.minX-r && x<=b.maxX+r && z>=b.minZ-r && z<=b.maxZ+r;
function inBounds(x,z,r) {
  return x>=bounds.minX+r && x<=bounds.maxX-r && z>=bounds.minZ+r && z<=bounds.maxZ-r;
}
export function walkable(x,z,radius=.20) {
  return radius>=0 && inBounds(x,z,radius) && !obstacles.some(b=>inside(x,z,b,radius));
}
// Segment against the footprint expanded by the walker's half-width, including tangency.
function crosses(x,z,dx,dz,b,r) {
  let low=0, high=1;
  for (const [p,d,min,max] of [[x,dx,b.minX-r,b.maxX+r],[z,dz,b.minZ-r,b.maxZ+r]]) {
    if (Math.abs(d)<1e-10) { if (p<min || p>max) return false; continue; }
    const a=(min-p)/d, c=(max-p)/d;
    low=Math.max(low,Math.min(a,c)); high=Math.min(high,Math.max(a,c));
    if (low>high) return false;
  }
  return true;
}
export function canWalk(x1,z1,x2,z2,radius=.20) {
  if (radius<0 || !inBounds(x1,z1,radius) || !inBounds(x2,z2,radius)) return false;
  return !obstacles.some(b=>crosses(x1,z1,x2-x1,z2-z1,b,radius));
}
const distance = (a,b) => Math.hypot(b.x-a.x,b.z-a.z);
const visible = (a,b,r) => canWalk(a.x,a.z,b.x,b.z,r);
let cachedGraph;
function cornersGraph(radius) {
  if (cachedGraph?.radius===radius) return cachedGraph;
  const nodes=[], edges=[], pad=radius+.012;
  for (const b of obstacles) for (const x of [b.minX-pad,b.maxX+pad]) for (const z of [b.minZ-pad,b.maxZ+pad]) {
    if (walkable(x,z,radius)) nodes.push({x,z});
  }
  for (let i=0;i<nodes.length;i++) edges.push([]);
  for (let i=0;i<nodes.length;i++) for (let j=0;j<i;j++) if (visible(nodes[i],nodes[j],radius)) {
    const weight=distance(nodes[i],nodes[j]); edges[i].push([j,weight]); edges[j].push([i,weight]);
  }
  cachedGraph={radius,nodes,edges};
  return cachedGraph;
}
export function findPath(from,to,radius=.20) {
  if (!from || !to || !walkable(from.x,from.z,radius) || !walkable(to.x,to.z,radius)) return null;
  if (visible(from,to,radius)) return [from,to];
  const graph=cornersGraph(radius), start=graph.nodes.length, end=start+1;
  const nodes=[...graph.nodes,from,to], edges=graph.edges.map(e=>e.slice()); edges.push([],[]);
  for (const i of [start,end]) for (let j=0;j<start;j++) if (visible(nodes[i],nodes[j],radius)) {
    const weight=distance(nodes[i],nodes[j]); edges[i].push([j,weight]); edges[j].push([i,weight]);
  }
  const costs=nodes.map(()=>Infinity), visited=new Set(), previous=[]; costs[start]=0;
  while (true) {
    let i=-1, best=Infinity;
    for (let j=0;j<nodes.length;j++) if (!visited.has(j) && costs[j]<best) { i=j; best=costs[j]; }
    if (i<0) return null;
    if (i===end) break;
    visited.add(i);
    for (const [j,w] of edges[i]) if (best+w<costs[j]) { costs[j]=best+w; previous[j]=i; }
  }
  const path=[];
  for (let i=end;i!==undefined;i=previous[i]) path.push(nodes[i]);
  return path.reverse();
}
export function moveWithCollision(from,dx,dz,radius=.20) {
  let {x,z}=from;
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.055));
  for (let i=0;i<steps;i++) {
    const nx=x+dx/steps, nz=z+dz/steps;
    if (canWalk(x,z,nx,nz,radius)) { x=nx; z=nz; }
    else if (canWalk(x,z,nx,z,radius)) x=nx;
    else if (canWalk(x,z,x,nz,radius)) z=nz;
  }
  return {x,z};
}
