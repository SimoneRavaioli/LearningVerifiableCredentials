import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRoleService} from '../server/service.mjs';
import {nodeFactory} from '../server/node-identity.mjs';
import {randomSeed} from '../core/identity.mjs';
const password='test-operator-password-2';
async function serve(role,directory,extra={}){let server;const config={role,directory,origin:'http://127.0.0.1:0',walletOrigin:'http://wallet.local',operatorPassword:password,...extra};const service=await createRoleService(config);server=service.server;await new Promise(r=>server.listen(0,'127.0.0.1',r));return {...service,origin:'http://127.0.0.1:'+server.address().port,config};}
async function post(origin,path,body,cookie,requestOrigin=origin){const r=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:requestOrigin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
test('isolated services reject learner access to operator signing and cross-origin writes',async t=>{const dir=await mkdtemp(join(tmpdir(),'lvc2-role-'));t.after(()=>rm(dir,{recursive:true,force:true}));const s=await serve('issuer',dir);t.after(()=>new Promise(r=>s.server.close(r)));assert.equal((await post(s.origin,'/issue',{},null,s.config.origin)).status,401);assert.equal((await post(s.origin,'/login',{password},null,'http://wallet.local')).status,403);assert.equal((await post(s.origin,'/login',{password:'wrong'},null,s.config.origin)).status,401);const login=await post(s.origin,'/login',{password},null,s.config.origin);assert.equal(login.status,200);assert.match(login.cookie,/lvc2_operator=/);assert.equal((await post(s.origin,'/issue',{},login.cookie,'http://wallet.local')).status,400);assert.equal((await post(s.origin,'/issue',{},login.cookie,'https://attacker.invalid')).status,403);});
test('issuer, authority and verifier use separate keys and verify a one-time holder presentation',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'lvc2-services-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 // Fixed loopback ports are reserved only for this local protocol test; no institution is contacted.
 async function fixed(role,port,extra={}){const origin='http://127.0.0.1:'+port;const service=await createRoleService({role,directory:join(dir,role),origin,walletOrigin:'http://wallet.local',operatorPassword:password,...extra});await new Promise(r=>service.server.listen(port,'127.0.0.1',r));t.after(()=>new Promise(r=>service.server.close(r)));return {...service,origin};}
 const issuer=await fixed('issuer',14521),authority=await fixed('authority',14522,{issuerDid:issuer.did,authorityOrigin:'http://127.0.0.1:14522'}),verifier=await fixed('verifier',14523,{issuerDid:issuer.did,authorityDid:authority.did,issuerOrigin:issuer.origin,authorityOrigin:authority.origin});
 assert.equal(new Set([issuer.did,authority.did,verifier.did]).size,3);
 const holder=await(await nodeFactory())(randomSeed());
 const issuerSession=await post(issuer.origin,'/login',{password});const issued=await post(issuer.origin,'/issue',{holderDid:holder.did,name:'ليلى أحمد',qualification:'Bachelor of Science in Computer Science',awardDate:'2026-06-30'},issuerSession.cookie);assert.equal(issued.status,200,JSON.stringify(issued.data));
 const offer=await(await fetch(issued.data.offer)).json();assert.equal((await fetch(issued.data.offer)).status,410);
 const employer=await post(verifier.origin,'/login',{password});const request=await post(verifier.origin,'/requests',{},employer.cookie);const presentation=await holder.present([offer.credential],request.data.request);
 const checked=await post(verifier.origin,'/responses',{requestId:request.data.request.id,presentation},null,'http://wallet.local');assert.equal(checked.data.accepted,true,JSON.stringify(checked.data));assert.equal((await post(verifier.origin,'/responses',{requestId:request.data.request.id,presentation},null,'http://wallet.local')).status,410);
 const result=await fetch(verifier.origin+'/results/'+request.data.request.id,{headers:{Cookie:employer.cookie}});const raw=await result.text();assert.equal(raw.includes('ليلى'),false);assert.equal(raw.includes('VerifiablePresentation'),false);
 assert.equal((await post(issuer.origin,'/issue',{holderDid:holder.did},employer.cookie)).status,401);
});
