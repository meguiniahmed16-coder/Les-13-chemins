import {countries} from './livraison.mjs';
export const origin='https://tectonique-des-ames.com';
export const page=origin+'/l-odeur-du-bois.html';
export const legacyId='santal-rose';
export const legacyLink='https://buy.stripe.com/3cI9AV6Gc2aZ1MG2zE1sQ04?locale=fr';
export const legacyStripe='plink_1UdiTMPdtc1VYes6qnX4Tkte';
export const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const seed={title:'Santal rose',category:'Bague',material:'Bois de santal rose',description:'Un anneau en bois de santal rose, large et arrondi. De fines lignes sombres suivent la courbe du bois jusque sur la face intérieure.',dimensions:'',price:3900,photos:[
 ['sur-letabli','Sur l’établi'],['sur-le-bloc','Le fil du bois'],['sur-le-support','L’intérieur de l’anneau'],['profil','Le profil arrondi']
].map(([file,caption])=>({src:'/assets/atelier/bague-'+file+'.webp',caption})),variants:[{id:'unique',label:'Pièce unique',stock:1}],zones:[{id:'france',label:'Envoi suivi en France',countries:['FR'],fee:0,pickup:false}],legacy:true};
export class ShopError extends Error {constructor(status,message){super(message);this.status=status;}}
export function fail(status,message){throw new ShopError(status,message);}
const check=(ok,msg)=>{if(!ok)fail(400,msg);};
const str=(v,max)=>{check(typeof v==='string'&&v.trim().length<=max,'Texte manquant ou trop long.');return v.trim();};
const amount=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
export function normalize(input,state){
 const p={};p.title=str(input.title,120);check(p.title,'Donne un nom à la création.');
 for(const [key,max] of [['category',50],['material',100],['description',2500],['dimensions',140]])p[key]=str(input[key]??'',max);
 const live=state==='published';p.price=input.price;check(amount(p.price,10000000)&&(!live||p.price>=50),'Indique un prix en euros (minimum 0,50 € pour publier).');
 check(Array.isArray(input.photos)&&input.photos.length<=8,'Choisis jusqu’à huit photos.');
 p.photos=input.photos.map(photo=>{check(typeof photo?.src==='string'&&(/^\/media\/[a-f0-9-]{36}\.webp$/.test(photo.src)||seed.photos.some(x=>x.src===photo.src)),'Photo invalide.');return {src:photo.src,caption:str(photo.caption??'',180)};});
 check(!live||p.photos.length,'Ajoute une photo pour publier.');
 check(Array.isArray(input.variants)&&input.variants.length>0&&input.variants.length<=40,'Ajoute au moins une taille ou une pièce unique.');
 function key(id){check(id==='unique'||id==='france'||uuid.test(id),'Identifiant de ligne invalide.');return id;}
 const seen=new Set();p.variants=input.variants.map(v=>{const label=str(v.label,64);check(label&&!seen.has(label.toLowerCase())&&amount(v.stock,9999),'Vérifie les tailles et leurs stocks (de 0 à 9 999).');seen.add(label.toLowerCase());return {id:key(v.id),label,stock:v.stock};});
 check(new Set(p.variants.map(v=>v.id)).size===p.variants.length,'Tailles en double.');
 check(Array.isArray(input.zones)&&input.zones.length<=16&&(!live||input.zones.length),'Ajoute un mode de livraison ou de retrait.');
 p.zones=input.zones.map(z=>{const label=str(z.label,130);check(label&&typeof z.pickup==='boolean'&&amount(z.fee,1000000),'Vérifie les libellés et frais de port.');
 const world=z.world===true;check(!(world&&z.pickup),'Un retrait ne peut pas couvrir le reste du monde.');
 const list=z.pickup||world?[]:[...new Set(Array.isArray(z.countries)?z.countries:[])];
 check(z.pickup||world||list.length&&list.every(c=>countries.includes(c)),'Sélectionne les pays desservis.');
 return {id:world&&z.id==='reste-du-monde'?z.id:key(z.id),label,countries:list,fee:z.pickup?0:z.fee,pickup:z.pickup,...(world?{world:true}:{})};});
 check(p.zones.filter(zone=>zone.world).length<=1,'Un seul tarif Reste du monde est possible.');
 check(new Set(p.zones.map(z=>z.id)).size===p.zones.length,'Modes de livraison en double.');return p;
}
export const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:n%100?2:0,minimumFractionDigits:n%100?2:0}).format(n/100);
export function project(row,counts,admin=false){
 const p=JSON.parse(row.data);const variants=p.variants.map(v=>{const tally=counts.find(c=>c.piece===row.id&&c.variant===v.id)||{};const stock=Math.max(0,v.stock-(tally.paid||0));const held=tally.held||0;return {...v,stock:admin?stock:Math.max(0,stock-held),...(admin?{held}:{reserved:held>0&&stock>0})};});
 return {...p,id:row.id,revision:row.revision,state:row.state,variants};
}
