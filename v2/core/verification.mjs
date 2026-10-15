// Independent verifier: deliberately does not import LearnCard.
import * as vc from '@digitalbazaar/vc';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {cryptosuite} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {driver} from '@digitalbazaar/did-method-key';
import {contexts as multi} from '@digitalbazaar/multikey-context';
import didContexts from 'did-context';
import {checkStatus,decodeList} from '@digitalbazaar/vc-bitstring-status-list';
import jsigs from 'jsonld-signatures';
import {isDate} from './model.mjs';
import {CONTEXT,documents as educationDocuments,viewCredential,validateEducationCredential} from '../profiles/education.mjs';
const resolver=driver();resolver.use({multibaseMultikeyHeader:'z6Mk',fromMultibase:Ed25519Multikey.from});
const suite=()=>new DataIntegrityProof({cryptosuite});
export function documentLoader(documents={}){return async url=>{
 if(url.startsWith('did:key:'))return {document:await resolver.get({url}),documentUrl:url,contextUrl:null};
 const known=multi.get(url)??didContexts.contexts.get(url)??educationDocuments[url]??documents[url];
 if(known)return {document:structuredClone(known),documentUrl:url,contextUrl:null};
 // The bundled VC loader only supplies known standard contexts. No arbitrary HTTP fetch.
 if(['https://www.w3.org/ns/credentials/v2','https://www.w3.org/2018/credentials/v1','https://w3id.org/security/data-integrity/v2','https://www.w3.org/ns/credentials/status/v1'].includes(url))return vc.defaultDocumentLoader(url);
 throw new Error('Unsupported or unavailable document: '+url);
};}
export async function verifyProof(credential,documents={}){return jsigs.verify(credential,{suite:suite(),purpose:new vc.CredentialIssuancePurpose(),documentLoader:documentLoader(documents)});}
export function credentialView(c){return {...viewCredential(c),type:'OpenBadgeCredential'};}
export const POLICY={id:'example-employer:software-engineer:2',version:'2.0',title:'Software engineering qualification',qualificationCodes:['CS-BSC'],purpose:'Confirm a computer-science qualification for a software engineering role'};
const check=(state,label,detail)=>({state,label,detail});
export async function evaluateCredential(c,{status={},registry,authorityDid,documents={}}={},policy=POLICY,{now=Date.now()}={}){
 const result={accepted:false,outcome:'incomplete',title:'Could not complete checks',checks:{proof:check('unknown','Signature','Not checked'),dates:check('unknown','Validity','Not checked'),status:check('unknown','Credential status','Not checked'),trust:check('unknown','Issuer authority','Not checked'),policy:check('unknown','Request match','Not checked')},issuer:null,errors:[]};
 try{
  if(!c||JSON.stringify(c).length>200000||JSON.stringify(c['@context'])!==JSON.stringify(CONTEXT)||!validateEducationCredential(c).valid||!isDate(credentialView(c).awardDate))throw new Error('Unsupported or malformed education credential');
  const view=credentialView(c);result.issuer=view.issuer;
  const proof=await verifyProof(c,{...documents,...status});
  result.checks.proof=check(proof.verified?'pass':'fail','Signature',proof.verified?'Original issuer signature is intact':'The signed credential has changed or its proof is invalid');
  const issued=Date.parse(view.issued),valid=Number.isFinite(issued)&&issued<=now&&(!c.validUntil||Date.parse(c.validUntil)>now)&&Date.parse(view.awardDate)<=issued;
  result.checks.dates=check(valid?'pass':'fail','Validity',valid?'Within its validity period':'Expired, not yet valid or inconsistent award date');
  if(proof.verified){
   const entries=Array.isArray(c.credentialStatus)?c.credentialStatus:[c.credentialStatus];
   let state='pass',detail='Active';
   for(const e of entries){const list=status[e?.statusListCredential];
    if(!list||Date.parse(list.validUntil)<=now||Date.parse(list.validFrom)>now||!Number.isFinite(Date.parse(list.validUntil))){state='unknown';detail='Fresh signed status evidence is unavailable';break;}
   }
   if(state==='pass'){
    try{const checked=await checkStatus({credential:c,suite:suite(),documentLoader:documentLoader({...documents,...status})});if(!checked.verified){state='unknown';detail='Status proof could not be verified';}else for(const r of checked.results){const list=status[r.credentialStatus.statusListCredential];if((await decodeList({encodedList:list.credentialSubject.encodedList})).length<131072){state='unknown';detail='Status list does not meet privacy size';break;}if(r.status){state='fail';detail=r.credentialStatus.statusPurpose==='revocation'?'Revoked':'Suspended';break;}}}catch{state='unknown';detail='Status evidence could not be read';}
   }
   result.checks.status=check(state,'Credential status',detail);
   if(registry&&authorityDid&&registry.issuer===authorityDid&&Date.parse(registry.validFrom)<=now&&Date.parse(registry.validUntil)>now&&(await verifyProof(registry,documents)).verified){
    const entry=registry.credentialSubject?.entries?.find(e=>e.id===view.issuer);
    const scope=entry?.authorization?.some(a=>a.credentialType===view.type&&Date.parse(a.from)<=issued&&issued<Date.parse(a.until));
    result.checks.trust=check(scope?'pass':'unknown','Issuer authority',scope?'Authorized for this credential when issued':'Issuer authority is unknown for this type or issue date');
   }else result.checks.trust=check('unknown','Issuer authority','A current signed registry from the configured authority is required');
   const recognized=policy.qualificationCodes.includes(view.code);
   result.checks.policy=check(recognized?'pass':'fail','Request match',recognized?'Matches policy '+policy.version:'Valid qualification does not match this request');
  }
  return summarize(result);
 }catch(error){result.checks.proof=check('fail','Credential structure',error.message);result.errors.push(error.message);return summarize(result);}
}
function summarize(result){const c=result.checks;if(c.proof.state==='fail'||c.dates.state==='fail'||c.status.state==='fail'){result.outcome='invalid';result.title=c.status.state==='fail'?c.status.detail:'Invalid credential';}else if(Object.values(c).some(x=>x.state==='unknown')){result.outcome='incomplete';result.title='Could not complete checks';}else if(c.policy.state==='fail'){result.outcome='mismatch';result.title='Verified but does not match';}else{result.accepted=true;result.outcome='accepted';result.title='Verified and matches this request';}return result;}
export async function evaluatePresentation(vp,request,snapshots,options={}){
 const now=options.now??Date.now();
 if(!request||request.expiresAt<=now||!vp||JSON.stringify(vp).length>2000000||!Array.isArray(vp.verifiableCredential)||!vp.verifiableCredential.length||vp.verifiableCredential.length>10)throw new Error('Request expired or presentation is malformed');
 const proof=await jsigs.verify(vp,{suite:suite(),purpose:new jsigs.purposes.AuthenticationProofPurpose({challenge:request.challenge,domain:request.domain}),documentLoader:documentLoader({...snapshots.documents,...snapshots.status})});
 if(!proof.verified||!vp.verifiableCredential.every(c=>c.credentialSubject.id===vp.holder))throw new Error('Holder signature, audience or binding is invalid');
 const credentials=await Promise.all(vp.verifiableCredential.map(c=>evaluateCredential(c,snapshots.bundles?.[c.id]??snapshots,request.policy,options)));
 const accepted=credentials.every(c=>c.accepted),outcome=accepted?'accepted':credentials.some(c=>c.outcome==='invalid')?'invalid':credentials.some(c=>c.outcome==='incomplete')?'incomplete':'mismatch';
 return {accepted,outcome,title:accepted?'Verified and matches this request':outcome==='invalid'?'Invalid credential':outcome==='incomplete'?'Could not complete checks':'Verified but does not match',holderVerified:true,credentials,policy:request.policy.id};
}
