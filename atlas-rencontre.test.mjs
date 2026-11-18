import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name,import.meta.url),'utf8');
const data = JSON.parse(read('atlas-repertoire.json'));
const portraits = JSON.parse(read('atlas-continuites.json'));

class Element {
  constructor(tag,cls,text) { this.tag=tag;this.textContent=text;this.children=[];this.events={}; }
  addEventListener(name,fn){this.events[name]=fn;}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=items;}
  focus(){}
  scrollIntoView(){}
}

test('Chaque tirage ouvre le bon portrait et ses références, même pour deux homonymes',async()=>{
  const invite=new Element(),bubble=new Element(),action=new Element(),article=new Element(),name=new Element();
  const canvas={getContext:()=>null};
  bubble.querySelector=s=>s==='canvas'?canvas:name;
  const elements={'.rencontre-nom':name,'.rencontre-bulle':bubble,'.rencontre-invite':invite,'.rencontre-action':action,'.rencontre-portrait':article};
  const panel={querySelector:s=>elements[s],classList:{add(){},remove(){}}};
  const samples=[];
  const ctx={
    crypto:{getRandomValues(buffer){buffer[0]=samples.shift()??0;return buffer;}},
    window:{TreizeAtlasPersonnages:{
      directory:async()=>data,portraits:async()=>portraits,number:n=>String(n).padStart(3,'0'),
      discussButton:p=>new Element('button','','Écrire à '+p.name),
      element:(...args)=>new Element(...args)
    }},
    document:{addEventListener(){}},cancelAnimationFrame(){},
    matchMedia:()=>({matches:false,addEventListener(){}}),ResizeObserver:class{observe(){}}
  };
  vm.runInNewContext(read('atlas-rencontre.js'),ctx);
  const cloud=ctx.window.TreizeRencontre.create(panel);
  cloud.setActive(true);
  await new Promise(resolve=>setImmediate(resolve));
  for(const [index,person] of data.people.entries()){
    samples.push(0xffffffff,index); // Hors de la plage uniforme, puis tirage valide.
    bubble.events.click();
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(samples.length,0);
    assert.equal(bubble.disabled,true);
    assert.equal(name.textContent,person.name);
    const [number,title,role,write,references,,prose]=article.children;
    assert.ok(number.textContent.endsWith(String(person.id).padStart(3,'0')));
    assert.equal(title.textContent,person.name);
    assert.equal(role.textContent,person.role);
    assert.equal(write.textContent,'Écrire à '+person.name);
    assert.deepEqual(prose.children.map(node=>node.textContent),portraits[person.id]);
    const chapters=Object.keys(data.chapters).filter(n=>data.chapters[n].includes(person.id));
    assert.equal(references.children[1].textContent,(chapters.length===1?'Chapitre ':'Chapitres ')+chapters.join(', '));
    assert.deepEqual(references.children[2].children.map(li=>li.children[1].textContent),person.places.map(p=>'p. '+p.pages));
    assert.equal(article.hidden,false);
    action.events.click();
    assert.equal(bubble.disabled,false);
    assert.equal(article.hidden,true);
  }
});
