// One allowlisted document format and renderer for the editor preview and public blog.
export const MEDIA_RE=/^\/media\/[0-9a-f-]{36}\.webp$/;
const TYPES=new Set(['doc','paragraph','heading','text','hardBreak','bulletList','orderedList','listItem','blockquote','codeBlock','horizontalRule','image','table','tableRow','tableCell','tableHeader']);
const MARKS=new Set(['bold','italic','underline','strike','code','link','textStyle']);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
const pick=(v,values,fallback)=>values.includes(v)?v:fallback;
export function safeLink(value){if(typeof value!=='string'||value.length>2000)return '';try{const u=new URL(value);return ['https:','http:','mailto:','tel:'].includes(u.protocol)?value:'';}catch{return '';}}
function color(v){return typeof v==='string'&&(/^[#][0-9a-f]{3,8}$/i.test(v)||/^rgba?\([0-9.,%\s]+\)$/.test(v))?v:null;}
export function normalizeImage(a={}){
 if(!MEDIA_RE.test(a.src||''))throw new Error('Ajoute une image depuis le bouton prévu.');
 return {src:a.src,alt:String(a.alt||'').slice(0,500),caption:String(a.caption||'').slice(0,500),layout:pick(a.layout,['full','center','left','right'],'full'),width:num(a.width,25,100,100),frame:pick(a.frame,['none','thin','paper'],'none'),ratio:pick(a.ratio,['auto','square','landscape','portrait'],'auto'),x:num(a.x,0,100,50),y:num(a.y,0,100,50)};
}
export function normalizeCover(value){if(!value)return null;return {...normalizeImage(value),ratio:'banner',layout:'full',width:100};}
export function normalizeDoc(value){
 if(!value||value.type!=='doc'||JSON.stringify(value).length>220000)throw new Error('Le texte est trop long ou son format est invalide.');
 let count=0;function node(n,depth=0){
  if(!n||!TYPES.has(n.type)||depth>22||++count>6000)throw new Error('La structure du texte est invalide.');
  const out={type:n.type};if(n.type==='text'){if(typeof n.text!=='string')throw new Error('Texte invalide.');out.text=n.text;}
  const a=n.attrs||{};
  if(['paragraph','heading'].includes(n.type))out.attrs={textAlign:pick(a.textAlign,['left','center','right','justify'],'left'),...(n.type==='heading'?{level:num(a.level,1,4,2)}:{})};
  if(n.type==='orderedList')out.attrs={start:num(a.start,1,999,1)};
  if(n.type==='image')out.attrs=normalizeImage(a);
  if(n.type==='codeBlock')out.attrs={language:null};
  if(['tableCell','tableHeader'].includes(n.type))out.attrs={colspan:num(a.colspan,1,12,1),rowspan:num(a.rowspan,1,30,1),colwidth:null};
  if(Array.isArray(n.marks))out.marks=n.marks.filter(m=>MARKS.has(m.type)).map(m=>{
   if(m.type==='link')return {type:'link',attrs:{href:safeLink(m.attrs?.href),target:'_blank',rel:'noopener noreferrer'}};
   if(m.type==='textStyle'){const t=m.attrs||{};return {type:'textStyle',attrs:{color:color(t.color),backgroundColor:color(t.backgroundColor),fontFamily:pick(t.fontFamily,['Georgia','Arial','Verdana','monospace'],null),fontSize:pick(t.fontSize,['14px','16px','18px','22px','28px','36px'],null),lineHeight:pick(t.lineHeight,['1.4','1.7','2'],null)}};}
   return {type:m.type};
  });
  if(Array.isArray(n.content))out.content=n.content.map(c=>node(c,depth+1));
  return out;
 }
 return node(value);
}
export function plainDoc(text=''){return {type:'doc',content:String(text).split(/\n\s*\n/).map(p=>({type:'paragraph',content:p.split('\n').flatMap((line,i)=>[...(i?[{type:'hardBreak'}]:[]),...(line?[{type:'text',text:line}]:[])])}))};}
export function docText(doc){function walk(n){if(n.type==='text')return n.text||'';if(n.type==='hardBreak')return '\n';if(n.type==='image')return n.attrs?.caption||'';const t=(n.content||[]).map(walk).join('');return t+(['paragraph','heading','listItem','blockquote','codeBlock','tableRow'].includes(n.type)?'\n':'');}return walk(doc).trim();}
export function mediaIds(doc,cover){const found=new Set();function walk(n){if(n.type==='image'&&MEDIA_RE.test(n.attrs?.src||''))found.add(n.attrs.src.slice(7));for(const c of n.content||[])walk(c);}if(doc)walk(doc);if(cover)found.add(cover.src.slice(7));return [...found];}
export function imageHTML(attrs,mediaBase){const a=normalizeImage(attrs);const src=mediaBase+a.src.slice(7);return `<figure class="blog-figure layout-${a.layout} frame-${a.frame}" style="--image-width:${a.width}%;--image-x:${a.x}%;--image-y:${a.y}%"><img src="${esc(src)}" alt="${esc(a.alt)}" class="ratio-${a.ratio}" loading="lazy" decoding="async">${a.caption?`<figcaption>${esc(a.caption)}</figcaption>`:''}</figure>`;}
export function coverHTML(cover,mediaBase){if(!cover)return '';const a=normalizeCover(cover);return `<figure class="blog-banner"><img src="${esc(mediaBase+a.src.slice(7))}" alt="${esc(a.alt)}" style="object-position:${a.x}% ${a.y}%" decoding="async">${a.caption?`<figcaption>${esc(a.caption)}</figcaption>`:''}</figure>`;}
export function renderDoc(value,mediaBase='/api/atelier/media/'){
 const doc=normalizeDoc(value);function walk(n){
  if(n.type==='text'){let s=esc(n.text);for(const m of n.marks||[]){const tags={bold:'strong',italic:'em',underline:'u',strike:'s',code:'code'};if(tags[m.type])s=`<${tags[m.type]}>${s}</${tags[m.type]}>`;else if(m.type==='link'&&m.attrs.href)s=`<a href="${esc(m.attrs.href)}" target="_blank" rel="noopener noreferrer">${s}</a>`;else if(m.type==='textStyle'){const style=Object.entries(m.attrs).filter(([,v])=>v).map(([k,v])=>`${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${v}`).join(';');s=`<span style="${esc(style)}">${s}</span>`;}}return s;}
  if(n.type==='image')return imageHTML(n.attrs,mediaBase);
  if(n.type==='hardBreak')return '<br>';if(n.type==='horizontalRule')return '<hr>';
  const children=(n.content||[]).map(walk).join('');if(n.type==='doc')return children;
  if(n.type==='table')return `<div class="blog-table-wrap"><table><tbody>${children}</tbody></table></div>`;
  if(n.type==='codeBlock')return `<pre><code>${children}</code></pre>`;
  const tag={paragraph:'p',heading:'h'+(n.attrs?.level||2),bulletList:'ul',orderedList:'ol',listItem:'li',blockquote:'blockquote',tableRow:'tr',tableCell:'td',tableHeader:'th'}[n.type];
  let attrs=n.attrs?.textAlign?` style="text-align:${n.attrs.textAlign}"`:'';if(n.type==='orderedList')attrs+=` start="${n.attrs.start}"`;if(['tableCell','tableHeader'].includes(n.type))attrs+=` colspan="${n.attrs.colspan}" rowspan="${n.attrs.rowspan}"`;
  return tag?`<${tag}${attrs}>${children||'<br>'}</${tag}>`:children;
 }return walk(doc);
}
export function parseStored(value,fallback=null){try{return typeof value==='string'?JSON.parse(value):value||fallback;}catch{return fallback;}}
