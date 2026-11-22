import test from 'node:test';
import assert from 'node:assert/strict';
import {visit} from './guest-visit.mjs';

test('Visite invitée, quinze minutes partagées entre onglets sans prolongation',async()=>{
  const url='https://tectonique-des-ames.com/api/visite-salon',origin=new URL(url).origin;
  let time=1780000000000,token='';
  const options={key:()=>'test-secret',now:()=>time};
  const call=(method,site=origin)=>visit(new Request(url,{method,headers:{origin:site,cookie:token}}),options);
  assert.equal((await (await call('GET')).json()).state,'new');
  assert.equal((await call('POST','https://example.org')).status,403);
  const start=await call('POST'),raw=start.headers.get('set-cookie');
  assert.match(raw,/HttpOnly; Secure; SameSite=Lax/);token=raw.split(';')[0];
  assert.deepEqual(await start.json(),{state:'active',remaining:900000});
  time+=240000;
  for(const method of ['GET','POST'])assert.deepEqual(await (await call(method)).json(),{state:'active',remaining:660000});
  time+=660000;
  for(const method of ['GET','POST'])assert.equal((await (await call(method)).json()).state,'expired');
  token=token.replace('1780000000000','1780000900000');
  assert.equal((await (await call('POST')).json()).state,'expired');
});
