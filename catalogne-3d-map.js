/* Barcelone 3D — plan stylisé du secteur des cinq clients.
 * Les coordonnées sont internes au jeu, et non des GPS réels.
 * Le plan s'agrandit si le joueur s'éloigne dans le parc sans fin.
 */
export function drawParkMap(canvas,run,clients,random){
 const ctx=canvas.getContext('2d');
 if(!ctx)return false;
 const width=Math.max(160,canvas.clientWidth),height=Math.max(110,canvas.clientHeight);
 const ratio=Math.min(2,window.devicePixelRatio||1);
 const dw=Math.round(width*ratio),dh=Math.round(height*ratio);
 if(canvas.width!==dw||canvas.height!==dh){canvas.width=dw;canvas.height=dh;}
 ctx.setTransform(ratio,0,0,ratio,0,0);
 ctx.clearRect(0,0,width,height);
 ctx.fillStyle='#d4e8cc';ctx.fillRect(0,0,width,height);
 const xs=[-29,29,run.x,...clients.map(c=>c.x)];
 const zs=[-12,128,run.z,...clients.map(c=>c.z)];
 const minX=Math.min(...xs)-4,maxX=Math.max(...xs)+4;
 const minZ=Math.min(...zs)-5,maxZ=Math.max(...zs)+5;
 const centerX=(minX+maxX)/2,centerZ=(minZ+maxZ)/2,padding=17;
 const scale=Math.max(.2,Math.min((width-2*padding)/(maxX-minX),(height-2*padding)/(maxZ-minZ)));
 // Caméra placée sur l'axe -z : la droite de l'écran correspond à -x.
 const xy=(x,z)=>({x:width/2+(centerX-x)*scale,y:height/2+(centerZ-z)*scale});
 // Arbres de carte (décor de repérage, pas les obstacles réels).
 for(let i=0;i<230;i++){
  const sign=i%2===0?-1:1,x=sign*(12.8+random(i*4+18)*14);
  const z=-7+random(i*19+7)*139,p=xy(x,z);
  ctx.fillStyle=i%3===0?'#86b58a':'#9bc49a';
  ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1.9,2.7*scale),0,Math.PI*2);ctx.fill();
 }
 const road=(x,w)=>{
  const a=xy(x,-15),b=xy(x,132);
  ctx.strokeStyle='#b7b09b';ctx.lineWidth=w*scale+1.5;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  ctx.strokeStyle='#e7cfaa';ctx.lineWidth=w*scale;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 };
 for(const [x,w] of [[-6.2,3.3],[6.2,3.3],[0,5]])road(x,w);
 for(const z of [12,29,51,73,95,116]){
  const a=xy(-10.4,z),b=xy(10.4,z);
  ctx.strokeStyle='#e5cfaf';ctx.lineWidth=Math.max(3,2.3*scale);
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 }
 const water=(x,z,rx,rz,label)=>{
  const c=xy(x,z);
  ctx.fillStyle='#7fbdc7';ctx.strokeStyle='#e9eee5';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(c.x,c.y,rx*scale,rz*scale,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#285c65';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(label,c.x,c.y+3);
 };
 water(-20,68,9,17,'Lac');water(19,36,4.7,4.7,'Fontaine');
 // Les patrouilles sont en mouvement et sont repérées en rouge.
 for(const officer of run.police){
  const p=xy(officer.x,officer.z);
  ctx.fillStyle='#b52c39';ctx.strokeStyle='#fff7ed';ctx.lineWidth=1.4;
  ctx.fillRect(p.x-5,p.y-5,10,10);ctx.strokeRect(p.x-5,p.y-5,10,10);
  ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff7ed';ctx.fillText('P',p.x,p.y+3);
 }
 // Losanges à numéro : les clients servis restent visibles, mais grisés.
 clients.forEach((client,index)=>{
  const p=xy(client.x,client.z),sold=run.sold.includes(client.id);
  ctx.fillStyle=sold?'#87928a':'#'+client.color.toString(16).padStart(6,'0');
  ctx.strokeStyle='#fff7e5';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(p.x,p.y-8);ctx.lineTo(p.x+8,p.y);ctx.lineTo(p.x,p.y+8);ctx.lineTo(p.x-8,p.y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=sold?'#eff2ee':'#17372e';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(sold?'✓':String(index+1),p.x,p.y+3);
 });
 const hero=xy(run.x,run.z);
 ctx.save();ctx.translate(hero.x,hero.y);ctx.rotate(-run.facing);
 ctx.fillStyle='#1779bd';ctx.strokeStyle='#f4fbff';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(8,8);ctx.lineTo(0,4);ctx.lineTo(-8,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 ctx.textAlign='left';ctx.font='bold 10px system-ui';ctx.fillStyle='#245047';ctx.fillText('↑ AVANT',9,14);
 return true;
}
