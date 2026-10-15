import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {fixture,tamper} from './helpers.mjs';
import {evaluateCredential,evaluatePresentation,verifyProof} from '../independent/verifier.mjs';
import {createIdentity} from '../server/learncard.mjs';
import {digest} from '../server/service.mjs';

test('independent verifier rejects tampering and invalid signature',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue();
    assert.equal((await s.verifyCredential(c)).accepted,true);
    assert.equal((await s.verifyCredential(tamper(c))).signatureValid,false);
    const invalid=structuredClone(c);
    invalid.proof.proofValue=invalid.proof.proofValue.slice(0,-5)+'11111';
    assert.equal((await s.verifyCredential(invalid)).signatureValid,false);
});
test('schema rejects malformed data and context injection',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue();
    const missing=structuredClone(c);delete missing.credentialSubject.degree;
    assert.equal((await s.verifyCredential(missing)).schemaValid,false);
    const injected=structuredClone(c);injected['@context'].push({'@vocab':'https://attacker.invalid/'});
    assert.equal((await s.verifyCredential(injected)).accepted,false);
    assert.equal((await s.verifyCredential(null)).accepted,false);
});
test('expired credentials remain cryptographically valid but are not technically valid',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue({validUntil:new Date(Date.now()-600000).toISOString()});
    const r=await s.verifyCredential(c);
    assert.equal(r.signatureValid,true);assert.equal(r.temporalValid,false);assert.equal(r.accepted,false);
});
test('revocation and suspension are independently checked from signed published lists',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue();
    await s.setStatus(c.id,'suspended');let r=await s.verifyCredential(c);
    assert.equal(r.signatureValid,true);assert.equal(r.status.label,'Suspended');assert.equal(r.accepted,false);
    await s.setStatus(c.id,'active');assert.equal((await s.verifyCredential(c)).accepted,true);
    await s.setStatus(c.id,'revoked');r=await s.verifyCredential(c);
    assert.equal(r.status.label,'Revoked');assert.equal(r.issuerTrust.valid,true);assert.equal(r.accepted,false);
});
test('unknown, wrong-scope and historically unauthorized issuers are untrusted',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue();const snap=await s.snapshots();
    await s.changeTrust([]);
    let r=await s.verifyCredential(c);assert.equal(r.signatureValid,true);assert.equal(r.issuerTrust.valid,false);
    const original=snap.registry.credentialSubject.entries[0];
    await s.changeTrust([{...original,authorization:[{credentialType:'DriverLicense',from:'2000-01-01',until:'2100-01-01'}]}]);
    r=await s.verifyCredential(c);assert.equal(r.issuerTrust.valid,false);
    await s.changeTrust([{...original,authorization:[{credentialType:'UniversityDegreeCredential',from:'2000-01-01',until:'2001-01-01'}]}]);
    r=await s.verifyCredential(c);assert.equal(r.issuerTrust.valid,false);
});
test('recognition policy is distinct from signature, status and issuer trust',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue({qualification:'Bachelor of Arts in History'});
    const r=await s.verifyCredential(c);
    assert.equal(r.signatureValid,true);assert.equal(r.issuerTrust.valid,true);assert.equal(r.status.valid,true);
    assert.equal(r.recognition.valid,false);assert.equal(r.accepted,false);
});
test('verification works offline with signed snapshots and rejects corrupted or missing caches',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue(),snap=await s.snapshots();
    const originalFetch=globalThis.fetch;globalThis.fetch=()=>{throw new Error('Network disabled');};
    try{
        assert.equal((await evaluateCredential(c,snap)).accepted,true);
        const broken=structuredClone(snap);delete broken.status[c.credentialStatus[0].statusListCredential];
        assert.equal((await evaluateCredential(c,broken)).status.valid,false);
        const tampered=structuredClone(snap);tampered.registry.credentialSubject.entries[0].name='Impostor';
        assert.equal((await evaluateCredential(c,tampered)).issuerTrust.valid,false);
        const badAnchor={...snap,authorityDid:'did:key:z6Mkwronganchor'};
        assert.equal((await evaluateCredential(c,badAnchor)).issuerTrust.valid,false);
        const corrupt=structuredClone(snap);corrupt.status[c.credentialStatus[0].statusListCredential].credentialSubject.encodedList='uAA';
        assert.equal((await evaluateCredential(c,corrupt)).status.valid,false);
    }finally{globalThis.fetch=originalFetch;}
});
test('holder challenge and audience prevent cross-request replay',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue();await s.receive(c.id);
    const r=s.createRequest(),vp=await s.present({requestId:r.id,credentialIds:[c.id],approved:true,disclosureDigest:digest({request:r,credentials:[c]})});
    const snaps=await s.snapshots();
    assert.equal((await evaluatePresentation(vp,{...r,challenge:'wrong-challenge'},snaps)).presentationValid,false);
    assert.equal((await evaluatePresentation(vp,{...r,domain:'Another Employer'},snaps)).presentationValid,false);
});
test('multi-issuer presentations preserve per-credential issuer and independent proof results',async t=>{
    const {service:s}=await fixture(t);const c=await s.issue(),snap=await s.snapshots();
    const rogue=await createIdentity(randomBytes(32).toString('hex'));
    const unsigned=structuredClone(c);delete unsigned.proof;unsigned.id='urn:uuid:263577e5-774a-4b76-9b3f-b08012964030';unsigned.issuer=rogue.id.did();
    const foreign=await rogue.invoke.issueCredential(unsigned);
    assert.equal((await verifyProof(foreign)).verified,true);
    // Sign a bundled presentation using an independent holder implementation in the portability test;
    // here test each issuer proof/trust separately, including a tampered credential.
    const results=await Promise.all([c,foreign,tamper(c)].map(c=>evaluateCredential(c,snap)));
    assert.equal(results[0].accepted,true);assert.equal(results[1].signatureValid,true);assert.equal(results[1].issuerTrust.valid,false);assert.equal(results[2].signatureValid,false);
});
