import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createService,digest} from '../server/service.mjs';
import {fixture} from './helpers.mjs';
import {restore,createVault} from '../server/vault.mjs';

test('separate issuer, learner and governance identities persist across sessions',async t=>{
    const {service:s,directory}=await fixture(t);
    const info=s.publicInfo();assert.equal(new Set([info.issuerDid,info.holderDid,info.authorityDid]).size,3);
    const reopened=await createService({directory});
    assert.deepEqual(reopened.publicInfo(),info);
});
test('issue, receive, store, consent, present and independently verify a diploma',async t=>{
    const {service:s,directory}=await fixture(t);
    const credential=await s.issue({});
    assert.equal(s.pending().length,1);
    await s.receive(credential.id);
    assert.equal(s.records('holder').length,1);
    const reopened=await createService({directory});
    assert.equal(reopened.records('holder')[0].credential.id,credential.id);
    const request=s.createRequest();
    const presentation=await s.present({requestId:request.id,credentialIds:[credential.id],approved:true,disclosureDigest:digest({request,credentials:[credential]})});
    const result=await s.verifyRequest(request.id,presentation);
    assert.equal(result.accepted,true);
    assert.equal(result.presentationValid,true);
    assert.equal(result.credentials[0].issuerTrust.valid,true);
    // All portable evidence is synthetic; no private key is written here.
    await mkdir('examples',{recursive:true});
    await writeFile('examples/diploma.json',JSON.stringify(credential,null,2));
    await writeFile('examples/presentation.json',JSON.stringify(presentation,null,2));
    await writeFile('examples/request.json',JSON.stringify(request,null,2));
    const cache=await s.snapshots();
    await writeFile('examples/snapshots.json',JSON.stringify(cache,null,2));
    await writeFile('examples/trusted-authority.json',JSON.stringify({authorityDid:cache.authorityDid},null,2));
});
test('explicit approval and unchanged disclosure are enforced',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue();await s.receive(c.id);const r=s.createRequest();
    const payload={requestId:r.id,credentialIds:[c.id],disclosureDigest:digest({request:r,credentials:[c]})};
    await assert.rejects(s.present({...payload,approved:false}),/Explicit approval/);
    await assert.rejects(s.present({...payload,approved:true,disclosureDigest:'changed'}),/Disclosure changed/);
    await assert.rejects(s.present({...payload,approved:true,credentialIds:[]}),/Select 1/);
});
test('backup and identity recovery preserve original proofs; wrong passwords fail',async t=>{
    const {service:s,directory}=await fixture(t);const c=await s.issue();await s.receive(c.id);
    const password='correct horse battery staple';
    const envelope=s.exportBackup(password),plaintext=restore(envelope,password);
    assert.equal(JSON.stringify(envelope).includes(plaintext.seed),false);
    assert.equal(JSON.stringify(envelope).includes('Alex Morgan'),false);
    await assert.rejects(s.restoreBackup(envelope,'incorrect password'),/Incorrect password/);
    const info=s.publicInfo();await s.restoreBackup(envelope,password);
    assert.equal(s.publicInfo().holderDid,info.holderDid);
    assert.deepEqual(s.records('holder')[0].credential,c);
    const encrypted=await readFile(directory+'/vault.json','utf8');
    assert.equal(encrypted.includes('Alex Morgan'),false);assert.equal(encrypted.includes(plaintext.seed),false);
});
test('replay is rejected and presentations are removed after transient verification',async t=>{
    const {service:s,directory}=await fixture(t);const c=await s.issue();await s.receive(c.id);const r=s.createRequest();
    const vp=await s.present({requestId:r.id,credentialIds:[c.id],approved:true,disclosureDigest:digest({request:r,credentials:[c]})});
    assert.equal((await s.verifyRequest(r.id,vp)).accepted,true);
    await assert.rejects(s.verifyRequest(r.id,vp),/consumed/);
    assert.equal(s.requests.get(r.id).presentation,undefined);
    const stored=await (await createVault(directory)).read();
    assert.equal(JSON.stringify(stored).includes('VerifiablePresentation'),false);
});
test('invalid award dates and unsupported status transitions are rejected',async t=>{
    const {service:s}=await fixture(t);
    await assert.rejects(s.issue({awardDate:'2026-02-31'}),/valid award date/);
    const c=await s.issue();await s.setStatus(c.id,'revoked');
    await assert.rejects(s.setStatus(c.id,'active'),/permanent/);
});

test('concurrent issuance persists distinct indices and proofs without vault corruption',async t=>{
    const {service:s,directory}=await fixture(t);
    const credentials=await Promise.all([s.issue(),s.issue(),s.issue()]);
    assert.equal(new Set(credentials.map(c=>c.credentialStatus[0].statusListIndex)).size,3);
    const reopened=await createService({directory});
    assert.equal(reopened.records('issuer').length,3);
    for(const c of credentials)assert.equal((await reopened.verifyCredential(c)).accepted,true);
});
