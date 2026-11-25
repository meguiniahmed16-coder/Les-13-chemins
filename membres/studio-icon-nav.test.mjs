import test from 'node:test';
import assert from 'node:assert/strict';
import {createStudioIconNav} from './studio-icon-nav.js';

// A minimal DOM double verifies menu behavior without launching the 3D engine.
class Node {
  constructor(tagName='DIV',caption='') {
    this.tagName=tagName;this.children=[];this.dataset={};this.attrs={};this.classes=new Set();
    this.hidden=false;this.open=false;this.firstChild={textContent:caption};this.textContent=caption;
  }
  set className(value){this.classes=new Set(String(value).split(/\s+/).filter(Boolean));}
  get className(){return [...this.classes].join(' ');}
  get classList(){return {
    contains:name=>this.classes.has(name),
    add:name=>this.classes.add(name),
    remove:name=>this.classes.delete(name),
    toggle:(name,enabled)=>{const on=enabled??!this.classes.has(name);if(on)this.classes.add(name);else this.classes.delete(name);return on;}
  };}
  setAttribute(key,value){this.attrs[key]=String(value);}
  getAttribute(key){return this.attrs[key];}
  append(...children){this.children.push(...children);}
  querySelectorAll(selector){return selector==='.studio-nav-icon'?this.children.filter(node=>node.classList.contains('studio-nav-icon')):[];}
  querySelector(){return null;}
}
test('Avatar and clothing icons unfold and fold without losing the last category',()=>{
  const documentBefore=globalThis.document;
  globalThis.document={createElement:tag=>new Node(tag.toUpperCase())};
  try {
    const rail=new Node('NAV'),title=new Node('STRONG');
    const nose=new Node('LABEL','Nez'),iris=new Node('LABEL','Couleur des yeux');
    const visage=new Node('DETAILS');visage.dataset.family='visage';visage.querySelectorAll=()=>[nose,iris];
    const face=new Node('DETAILS');face.className='studio-advanced';
    face.querySelector=selector=>selector==='[data-family]'?visage:null;
    face.querySelectorAll=()=>[visage];
    const quick=new Node('DETAILS');quick.className='studio-quick';
    const pane=new Node('DIV');pane.children=[quick,face];
    const drawer=new Node('ASIDE');drawer.querySelector=selector=>selector==='.studio-rail'?rail:selector==='header strong'?title:null;
    let mode=-1;
    const menu=createStudioIconNav(drawer,pane,{setMode:value=>{mode=value;}});
    menu.update();
    assert.equal(rail.querySelectorAll('.studio-nav-icon').length,14);
    assert.equal(menu.selectGroup('avatar',{forceOpen:true}),true);
    assert.equal(menu.collapsed,false);
    assert.equal(menu.select('eyes'),true);
    assert.equal(nose.hidden,true);
    assert.equal(iris.hidden,false);
    assert.equal(menu.select('face'),true);
    assert.equal(nose.hidden,false,'switching back from eyes must restore nose');
    assert.equal(menu.select('tops'),true);
    assert.equal(mode,1);
    assert.equal(menu.selectGroup('avatar'),true);
    assert.equal(menu.selected,'face','remember the last avatar category');
    assert.equal(mode,0);
    assert.equal(menu.selectGroup('avatar'),true);
    assert.equal(menu.collapsed,true,'second tap folds the same category');
    assert.equal(menu.selectGroup('avatar',{forceOpen:true}),true);
    assert.equal(menu.collapsed,false,'reopening never immediately folds the menu');
    const labels=rail.children[0];
    labels.onclick();
    assert.equal(rail.classList.contains('studio-labels'),true);
    labels.onclick();
    assert.equal(rail.classList.contains('studio-labels'),false);
  }finally{
    if(documentBefore===undefined)delete globalThis.document;
    else globalThis.document=documentBefore;
  }
});
