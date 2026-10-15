/** Independent Digital Bazaar verifier: this module must not import LearnCard. */
import * as vc from '@digitalbazaar/vc';
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';
import { cryptosuite } from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import { driver } from '@digitalbazaar/did-method-key';
import { contexts as multikeyContexts } from '@digitalbazaar/multikey-context';
import didContexts from 'did-context';
import { checkStatus, decodeList } from '@digitalbazaar/vc-bitstring-status-list';

const resolver = driver();
resolver.use({multibaseMultikeyHeader:'z6Mk',fromMultibase:Ed25519Multikey.from});
export const suite = () => new DataIntegrityProof({cryptosuite});
export function loader(snapshots = {}) {
    return async url => {
        if (url.startsWith('did:key:')) return {document:await resolver.get({url}),documentUrl:url,contextUrl:null};
        const context = multikeyContexts.get(url) ?? didContexts.contexts.get(url);
        if (context) return {document:context,documentUrl:url,contextUrl:null};
        if (Object.hasOwn(snapshots,url)) return {document:structuredClone(snapshots[url]),documentUrl:url,contextUrl:null};
        return vc.defaultDocumentLoader(url);
    };
}
export async function verifyProof(credential,snapshots={}) {
    // Separate technical proof validation from status, expiration and trust.
    const documentLoader=loader(snapshots);
    const {default:jsigs}=await import('jsonld-signatures');
    return jsigs.verify(credential,{suite:suite(),purpose:new vc.CredentialIssuancePurpose(),documentLoader});
}
export async function verifyPresentationProof(presentation,request,snapshots={}) {
    const {default:jsigs}=await import('jsonld-signatures');
    return jsigs.verify(presentation,{suite:suite(),purpose:new jsigs.purposes.AuthenticationProofPurpose({challenge:request.challenge,domain:request.domain}),documentLoader:loader(snapshots)});
}
export async function inspectStatus(credential,snapshots) {
    const result=await checkStatus({credential,suite:suite(),documentLoader:loader(snapshots)});
    if(!result.verified) return {valid:false,label:'Unknown',error:result.error?.message??'Status not verified'};
    for(const entry of result.results) {
        const list=snapshots[entry.credentialStatus.statusListCredential];
        const now=Date.now();
        if(!list || !list.validUntil || Date.parse(list.validUntil)<now || Date.parse(list.validFrom)>now) return {valid:false,label:'Stale or missing status'};
        const decoded=await decodeList({encodedList:list.credentialSubject.encodedList});
        if(decoded.length<131072) return {valid:false,label:'Status list too small'};
    }
    const labels=result.results.filter(r=>r.status).map(r=>r.credentialStatus.statusPurpose==='revocation'?'Revoked':'Suspended');
    return {valid:labels.length===0,label:labels.join(', ')||'Active'};
}

import Ajv from 'ajv';
import isDeepStrictEqual from 'fast-deep-equal';
import {CONTEXT,diplomaSchema,isDate} from '../server/model.mjs';
const validate = new Ajv({allErrors:true,strict:false}).compile(diplomaSchema);
export async function evaluateCredential(credential,{status={},registry,authorityDid}={},policy={qualification:'Bachelor of Science in Computer Science'}) {
    const result={schemaValid:false,signatureValid:false,temporalValid:false,technicalValid:false,status:{valid:false,label:'Unknown'},issuerTrust:{valid:false,label:'Untrusted'},recognition:{valid:false,label:'Not evaluated'},accepted:false,errors:[]};
    try{
        const serialized=JSON.stringify(credential);
        if(serialized.length>200000||!validate(credential)||!isDeepStrictEqual(credential['@context'],CONTEXT)||!isDate(credential.credentialSubject.degree.awardDate)||credential.type.length!==2||credential.type[0]!=='VerifiableCredential'){
            result.errors.push('Malformed academic credential or unsupported context');return result;
        }
        result.schemaValid=true;
        const proof=await verifyProof(credential,status);
        result.signatureValid=proof.verified;
        if(!proof.verified)result.errors.push('Cryptographic proof failed');
        const now=Date.now(),issued=Date.parse(credential.validFrom),until=credential.validUntil?Date.parse(credential.validUntil):Infinity;
        result.temporalValid=Number.isFinite(issued)&&issued<=now&&until>now&&Date.parse(credential.credentialSubject.degree.awardDate)<=issued;
        if(!result.temporalValid)result.errors.push('Expired, not yet valid, or invalid award/validity dates');
        result.technicalValid=result.schemaValid&&result.signatureValid&&result.temporalValid;
        if(!result.signatureValid)return result;
        result.status=await inspectStatus(credential,status);
        if(registry?.issuer===authorityDid&&authorityDid?.startsWith('did:key:')){
            const trustProof=await verifyProof(registry);
            if(trustProof.verified&&Date.parse(registry.validUntil)>now&&Date.parse(registry.validFrom)<=now){
                const entries=registry.credentialSubject?.entries;
                const issuer=Array.isArray(entries)?entries.find(e=>e.id===credential.issuer):null;
                const authorized=issuer?.publicKeyMultibase===credential.issuer.slice(8)&&issuer?.authorization?.some(a=>a.credentialType==='UniversityDegreeCredential'&&Date.parse(a.from)<=issued&&issued<Date.parse(a.until));
                result.issuerTrust={valid:!!authorized,label:authorized?'Authorized at issuance':'Unknown issuer or unauthorized at issuance',institution:authorized?issuer.name:undefined,governance:authorized?issuer.governance:undefined};
            }else result.issuerTrust.label='Invalid or stale trust snapshot';
        }else result.issuerTrust.label='Trust authority does not match configured anchor';
        const recognized=credential.credentialSubject.degree.name===policy.qualification;
        result.recognition={valid:recognized,label:recognized?'Matches employer demonstration policy':'Qualification not accepted by this employer policy',policy:policy.qualification};
        result.accepted=result.technicalValid&&result.status.valid&&result.issuerTrust.valid&&result.recognition.valid;
    }catch(error){result.errors.push(error.message||'Verification failed');}
    return result;
}
export async function evaluatePresentation(presentation,request,snapshots) {
    const result={presentationValid:false,holderBinding:false,accepted:false,credentials:[],purpose:request.purpose,errors:[]};
    try {
        if(!presentation||JSON.stringify(presentation).length>2000000||
           JSON.stringify(presentation['@context'])!==JSON.stringify(['https://www.w3.org/ns/credentials/v2'])||
           presentation.type?.length!==1||presentation.type[0]!=='VerifiablePresentation'||
           !Array.isArray(presentation.verifiableCredential)||presentation.verifiableCredential.length<1||presentation.verifiableCredential.length>10||
           Object.keys(presentation).some(k=>!['@context','type','holder','verifiableCredential','proof'].includes(k))||
           request.expiresAt<Date.now())throw new Error('Malformed or expired presentation');
        const proof=await verifyPresentationProof(presentation,request,snapshots.status);
        result.presentationValid=proof.verified;
        result.holderBinding=presentation.verifiableCredential.every(c=>c.credentialSubject?.id===presentation.holder);
        if(!proof.verified)result.errors.push('Holder signature, challenge or audience is invalid');
        if(!result.holderBinding)result.errors.push('Credential subject does not match presenting holder');
        // Keep every issuer and proof result separate; return no learner attributes.
        for(const credential of presentation.verifiableCredential){
            const evaluation=await evaluateCredential(credential,snapshots,{qualification:request.qualification});
            result.credentials.push({issuer:credential.issuer,...evaluation});
        }
        result.accepted=result.presentationValid&&result.holderBinding&&result.credentials.every(c=>c.accepted);
    }catch(error){result.errors.push(error.message);}
    return result;
}
