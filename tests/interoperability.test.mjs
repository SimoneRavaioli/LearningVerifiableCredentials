import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createIdentity} from '../server/learncard.mjs';
import {randomBytes} from 'node:crypto';
import {join} from 'node:path';
import {fixture} from './helpers.mjs';
import {restore} from '../server/vault.mjs';
import {independentWallet} from '../independent/wallet.mjs';

test('independent Digital Bazaar holder imports, persists, displays and presents original LearnCard credential',async t=>{
    const {service:s,directory}=await fixture(t);const c=await s.issue();await s.receive(c.id);
    const recovered=restore(s.exportBackup('correct horse battery staple'),'correct horse battery staple');
    const wallet=await independentWallet({directory:join(directory,'independent-wallet'),seed:Buffer.from(recovered.seed,'hex')});
    assert.equal(wallet.did,s.publicInfo().holderDid);
    await wallet.importCredential(c);
    const imported=await wallet.readCredential();
    assert.deepEqual(imported,c);assert.deepEqual(imported.proof,c.proof);
    assert.equal(imported.credentialSubject.degree.name,'Bachelor of Science in Computer Science');
    const request=s.createRequest(),presentation=await wallet.present(request);
    const result=await s.verifyRequest(request.id,presentation);
    assert.equal(result.accepted,true);assert.equal(result.holderBinding,true);
});
test('a different holder cannot import subject-bound credentials as its own',async t=>{
    const {service:s,directory}=await fixture(t);const c=await s.issue();
    const wallet=await independentWallet({directory:join(directory,'wrong-wallet'),seed:crypto.getRandomValues(new Uint8Array(32))});
    await assert.rejects(wallet.importCredential(c),/holder mismatch/);
});


test('bundled credentials from distinct issuers are verified separately in an independent holder presentation',async t=>{
    const {service:s,directory}=await fixture(t);const c=await s.issue();await s.receive(c.id);
    const recovered=restore(s.exportBackup('correct horse battery staple'),'correct horse battery staple');
    const wallet=await independentWallet({directory:join(directory,'bundle-wallet'),seed:Buffer.from(recovered.seed,'hex')});
    await wallet.importCredential(c);
    const issuer2=await createIdentity(randomBytes(32).toString('hex'));
    const unsigned=structuredClone(c);delete unsigned.proof;
    unsigned.id='urn:uuid:7ca2c6f5-2c17-4102-ac6d-b0a64acb32f4';unsigned.issuer=issuer2.id.did();
    const other=await issuer2.invoke.issueCredential(unsigned);
    const request=s.createRequest();
    const vp=await wallet.present(request,[c,other]);
    const result=await s.verifyRequest(request.id,vp);
    assert.equal(result.presentationValid,true);
    assert.equal(result.credentials.length,2);
    assert.equal(result.credentials[0].accepted,true);
    assert.equal(result.credentials[1].signatureValid,true);
    assert.equal(result.credentials[1].issuerTrust.valid,false);
    assert.equal(result.credentials[0].issuer,c.issuer);
    assert.equal(result.credentials[1].issuer,other.issuer);
    assert.equal(result.accepted,false);
});
