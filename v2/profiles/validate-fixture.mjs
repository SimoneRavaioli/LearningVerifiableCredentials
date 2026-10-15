import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import jsonld from 'jsonld';
import {contexts} from '@digitalbazaar/credentials-context';
import {documents,validateEducationCredential,viewCredential} from './education.mjs';
const fixture=JSON.parse(readFileSync(new URL('./openbadges/unsigned-fixture.json',import.meta.url)));
assert.equal(validateEducationCredential(fixture).valid,true);
for(const mutate of [
    c=>delete c.credentialSubject.achievement.criteria,
    c=>c.credentialSubject.type=['Person'],
    c=>c.type=['VerifiableCredential'],
    c=>c['@context'].reverse(),
    c=>c.credentialSubject.id='not-a-uri'
]) {
    const invalid=structuredClone(fixture);mutate(invalid);
    assert.equal(validateEducationCredential(invalid).valid,false);
}
const expanded=await jsonld.expand(fixture,{documentLoader:async url=>{
    const document=documents[url]||contexts.get(url);
    if(!document)throw new Error(`Unpinned context: ${url}`);
    return {document,documentUrl:url,contextUrl:null};
}});
const subject=expanded[0]['https://www.w3.org/2018/credentials#credentialSubject'][0];
assert.equal(subject['https://schema.org/name'][0]['@value'],'山田 太郎');
const achievement=subject['https://purl.imsglobal.org/spec/vc/ob/vocab.html#achievement'][0];
assert.equal(achievement['https://purl.imsglobal.org/spec/vc/ob/vocab.html#humanCode'][0]['@value'],'CS-BSC');
assert.equal(viewCredential(fixture).awardDate,'2026-06-30');
console.log('Application profile: valid fixture, five invalid variants rejected, offline JSON-LD expansion preserves learner name and achievement code. No certification claim.');
