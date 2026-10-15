import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {createRoleService} from '../server/service.mjs';
import {nodeFactory} from '../server/node-identity.mjs';
import {randomSeed} from '../core/identity.mjs';
import {getOpenID4VCPlugin} from '@learncard/openid4vc-plugin';
const password='test-learncard-operator-password';
test('unmodified LearnCard OpenID plugin receives OB3 VC through final1 pre-authorized issuance and submits a bound VP',async t=>{
 const dir=await mkdtemp('/tmp/lvc2-learncard-');t.after(()=>rm(dir,{recursive:true,force:true}));
 async function serve(role,port,extra={}){const origin='http://127.0.0.1:'+port;const service=await createRoleService({role,directory:join(dir,role),origin,walletOrigin:'http://wallet.local',operatorPassword:password,...extra});await new Promise(r=>service.server.listen(port,'127.0.0.1',r));t.after(()=>new Promise(r=>service.server.close(r)));return {...service,origin};}
 async function post(origin,path,body,cookie){const r=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});const data=await r.json();assert.ok(r.ok,JSON.stringify(data));return {data,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 const issuer=await serve('issuer',16521),authority=await serve('authority',16522,{issuerDid:issuer.did,authorityOrigin:'http://127.0.0.1:16522'}),verifier=await serve('verifier',16523,{issuerDid:issuer.did,authorityDid:authority.did,issuerOrigin:issuer.origin,authorityOrigin:authority.origin});
 const issuerLogin=await post(issuer.origin,'/login',{password});const offer=await post(issuer.origin,'/openid-offer',{},issuerLogin.cookie);
 const holder=await(await nodeFactory())(randomSeed());const card=await holder.card.addPlugin(getOpenID4VCPlugin(holder.card,{fetch:async(...args)=>{const response=await fetch(...args);if(!response.ok)console.error('LearnCard protocol HTTP failure',new URL(String(args[0])).pathname,await response.clone().text());return response;}}));
 const accepted=await card.invoke.acceptCredentialOffer(offer.data.uri);assert.equal(accepted.credentials.length,1,JSON.stringify(accepted));const vc=accepted.credentials[0].credential;assert.equal(vc.credentialSubject.id,holder.did);assert.deepEqual(vc.type,['VerifiableCredential','OpenBadgeCredential']);
 const employer=await post(verifier.origin,'/login',{password});const requested=await post(verifier.origin,'/openid-request',{},employer.cookie);
 const submitted=await card.invoke.presentCredentials(requested.data.uri,[{descriptorId:'education-degree',candidate:{id:vc.id,credential:vc,format:'ldp_vc'}}],{envelopeFormat:'ldp_vp'});
 assert.equal(submitted.submitted.status,200);const result=await(await fetch(verifier.origin+'/oid4vp/result/'+requested.data.request.id)).json();assert.equal(result.accepted,true,JSON.stringify(result));
 await assert.rejects(card.invoke.acceptCredentialOffer(offer.data.uri));
});
