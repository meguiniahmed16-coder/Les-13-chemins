import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {paymentLink, checkoutOptions, initializeSupport, supportAmountCents, supportPaymentUrl} from './soutien.js';
import {injectSharedNavigation} from './site-nav-build.mjs';

test('payment links must be live hosted Stripe URLs, without redirects or credentials', () => {
  for (const value of [null, '', 'javascript:alert(1)', 'http://buy.stripe.com/a1', 'https://buy.stripe.com.evil.example/a1', 'https://buy.stripe.com/', 'https://buy.stripe.com/test_123', 'https://user@buy.stripe.com/a1', 'https://buy.stripe.com/a1?redirect=https://evil.example', 'https://buy.stripe.com:444/a1']) assert.equal(paymentLink(value), null);
  assert.equal(paymentLink('https://buy.stripe.com/a1B2'), 'https://buy.stripe.com/a1B2');
});
test('preorders require explicit activation and a description', () => {
  const config = {bookPaymentLink:'https://buy.stripe.com/a1B2', bookPreorderEnabled:false, bookDetails:'Préachat ponctuel, date de parution à déterminer.'};
  assert.equal(checkoutOptions(config).book, null);
  assert.equal(checkoutOptions({...config,bookPreorderEnabled:true,bookDetails:''}).book, null);
  assert.equal(checkoutOptions({...config,bookPreorderEnabled:true}).book, config.bookPaymentLink);
  assert.deepEqual(checkoutOptions(null), {support:null,book:null,details:'',methods:[]});
});
test('the public configuration cannot accidentally accept payments before activation', () => {
  const config = JSON.parse(readFileSync(new URL('./soutien-config.json',import.meta.url)));
  const options = checkoutOptions(config);
  if (!options.support && !options.book) assert.deepEqual(options.methods, []);
  assert.equal(typeof config.bookPreorderEnabled,'boolean');
  const html=readFileSync(new URL('./soutien.html',import.meta.url),'utf8');
  assert.match(html, /id="support-pay"[^>]*hidden/);
  assert.match(html, /id="book-pay"[^>]*hidden/);
  assert.match(injectSharedNavigation(html,'soutien.html'), /site-support-link" aria-current="page"/);
});
test('network failures leave the opening notices intact', async () => {
  let touched=false;
  const doc={getElementById(){touched=true;throw new Error('must not enable payments')}};
  await initializeSupport(doc,async()=>{throw new Error('offline')});
  await initializeSupport(doc,async()=>({ok:false}));
  await initializeSupport(doc,async()=>({ok:true,json:async()=>{throw new Error('bad json')}}));
  assert.equal(touched,false);
});
test('activated support never implicitly activates the book or unverified payment methods', async () => {
  const nodes=new Map();
  const doc={getElementById(id){if(id==='support-amount-options')return null;if(!nodes.has(id))nodes.set(id,{hidden:true,children:[],appendChild(x){this.children.push(x)}});return nodes.get(id)},createElement(){return {}}};
  await initializeSupport(doc,async()=>({ok:true,json:async()=>({supportPaymentLink:'https://buy.stripe.com/a1B2',paymentMethods:['Carte bancaire','Carte bancaire','Unknown']})}));
  assert.equal(nodes.get('support-pay').hidden,false);
  assert.equal(nodes.get('support-pay').href,'https://buy.stripe.com/a1B2');
  assert.equal(nodes.has('book-pay'),false);
  assert.deepEqual(nodes.get('payment-methods').children.map(x=>x.textContent),['Carte bancaire']);
});
test('support amounts preserve cents and reject invalid or below-minimum entries', () => {
  for (const [value,cents] of [['5',500],['10',1000],['12,50',1250],['12.01',1201],[' 100 ',10000],['1000',100000]]) assert.equal(supportAmountCents(value),cents);
  for (const value of ['',null,'4.99','-5','5.999','1e2','Infinity','5foo','9007199254740993']) assert.equal(supportAmountCents(value),null);
  assert.equal(supportPaymentUrl('https://buy.stripe.com/a1B2','12,50'),'https://buy.stripe.com/a1B2?prefilled_amount=1250');
  assert.equal(supportPaymentUrl('https://evil.example/a1B2','20'),null);
  assert.equal(supportPaymentUrl('https://buy.stripe.com/a1B2','4'),null);
});
