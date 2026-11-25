import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {INTRO_INVITATION_PEOPLE,INTRO_INVITATION_EXAMPLES} from './intro-invitation-data.js';
import {DOJO_CAST,dojoCastLook} from './intro-dojo-cast.js';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const atlas=JSON.parse(read('atlas-repertoire.json'));
const portraits=JSON.parse(read('atlas-continuites.json'));
const byId=new Map(atlas.people.map(p=>[p.id,p]));
const context=vm.createContext({});
vm.runInContext(read('chapitre1-flow.js'),context);

test('the cinematic selector preserves every canonical identity and chapter, including namesakes',()=>{
 const expected=atlas.people.map(p=>({id:p.id,name:p.name,
  chapters:Object.entries(atlas.chapters).filter(([,ids])=>ids.includes(p.id)).map(([n])=>Number(n))}));
 assert.deepEqual(INTRO_INVITATION_PEOPLE,expected);
 assert.equal(new Set(INTRO_INVITATION_PEOPLE.map(p=>p.id)).size,atlas.people.length);
 assert.ok(INTRO_INVITATION_PEOPLE.filter(p=>p.name==='Christophe').length>1);
 assert.ok(Object.isFrozen(INTRO_INVITATION_PEOPLE));
 assert.ok(INTRO_INVITATION_PEOPLE.every(p=>Object.isFrozen(p)&&Object.isFrozen(p.chapters)));
});

test('both cinematic cards cite real chapters, locations, pages and named relationships',()=>{
 assert.deepEqual(INTRO_INVITATION_EXAMPLES.map(p=>[p.id,p.mode]),[[61,'manual'],[217,'random']]);
 for(const example of INTRO_INVITATION_EXAMPLES){
  const person=byId.get(example.id);
  assert.equal(example.name,person.name);
  assert.ok(atlas.chapters[example.chapter].includes(example.id));
  assert.ok(person.places.some(p=>p.place===example.location&&p.pages===example.pages));
  const target=new URL(example.reference,'https://tectonique-des-ames.com');
  assert.equal(target.pathname,'/carte.html');
  assert.equal(target.searchParams.get('vue'),'personnages');
  assert.equal(Number(target.searchParams.get('personnage')),example.id);
  assert.deepEqual(example.withNames,example.links.map(link=>byId.get(link.id).name));
  for(const link of example.links){
   assert.equal(link.name,byId.get(link.id).name);
   const source=byId.get(link.source.id);
   assert.equal(link.source.file,'atlas-repertoire.json');
   if(link.source.field==='links'){
    const original=source.links[link.source.index];
    assert.equal(link.interaction,original.text);
    assert.equal(link.id,original.id);
    assert.equal(link.pages,original.pages);
   }else{
    assert.equal(link.source.field,'role');
    assert.equal(link.interaction,source.role);
    assert.ok(source.places.some(p=>p.pages===link.pages));
   }
  }
 }
 const chapterTwo=context.TreizeChapitre1.CHAPTER2_PARTS.find(p=>p.chapter===2);
 assert.equal(INTRO_INVITATION_EXAMPLES[1].chapterLabel,'Chapitre 2 · '+chapterTwo.chapterTitle);
});

test('adult examples use distinct established clothed silhouettes without inventing biographical appearance',()=>{
 assert.equal(new Set(INTRO_INVITATION_EXAMPLES.map(e=>DOJO_CAST[e.castIndex].face.body)).size,2);
 for(const example of INTRO_INVITATION_EXAMPLES){
  const cast=DOJO_CAST[example.castIndex],appearance=example.appearance;
  assert.equal(appearance.kind,'illustration');
  assert.equal(appearance.castIndex,example.castIndex);
  assert.equal(appearance.bodyLabel,cast.bodyLabel);
  assert.ok(portraits[appearance.source.id][appearance.source.paragraph].includes(appearance.basis));
  assert.equal(example.adultBasis.text,byId.get(example.adultBasis.id).role);
  assert.ok(cast.face.age>=0&&cast.face.age<5,'The demonstration uses an adult avatar');
  const look=dojoCastLook(example.castIndex);
  assert.ok(look.outfit.haut&&look.outfit.bas&&look.outfit.souliers,'The preview keeps a complete fitted outfit');
  for(const field of ['skinLevel','hairTone','iris','height','ethnicity'])assert.equal(appearance[field],undefined);
 }
});
