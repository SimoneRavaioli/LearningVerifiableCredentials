import {BitstringStatusList,createCredential} from '@digitalbazaar/vc-bitstring-status-list';
import {isDate} from './model.mjs';
import {CONTEXT,makeSubject} from '../profiles/education.mjs';
import {POLICY} from './verification.mjs';
export const PERSONAS={learner:'Alex Morgan',issuers:['Example University','Coastal Learning Institute'],employer:'Example Employer',authority:'Example Education Authority'};
export function createRequest(domain='https://employer.example',now=Date.now(),policy=POLICY){return {id:crypto.randomUUID(),challenge:crypto.randomUUID()+crypto.randomUUID(),domain,requester:PERSONAS.employer,purpose:policy.purpose,policy:structuredClone(policy),expiresAt:now+300000,used:false};}
export function makeCredential({holder,issuer,issuerName=PERSONAS.issuers[0],name=PERSONAS.learner,qualification='Bachelor of Science in Computer Science',awardDate='2026-06-30',qualificationCode='CS-BSC',index,base,now=Date.now(),supersedes}){
 if(!['CS-BSC','OTHER'].includes(qualificationCode))throw new Error('Use a code from the declared demonstration qualification catalogue');
 if(!name.trim()||name.length>120||!qualification.trim()||qualification.length>200||!isDate(awardDate)||Date.parse(awardDate)>now)throw new Error('Enter a valid name, qualification and past award date');
 const status=purpose=>({id:base+'/status/'+purpose+'#'+index,type:'BitstringStatusListEntry',statusPurpose:purpose,statusListIndex:String(index),statusListCredential:base+'/status/'+purpose});
 return {'@context':CONTEXT,id:'urn:uuid:'+crypto.randomUUID(),type:['VerifiableCredential','OpenBadgeCredential'],issuer:{id:issuer,type:['Profile'],name:issuerName},name:qualification,description:'Synthetic education credential'+(supersedes?' · Replaces '+supersedes:''),validFrom:new Date(now).toISOString(),credentialSubject:makeSubject({holder,name,qualification,awardDate,code:qualificationCode}),credentialStatus:[status('revocation'),status('suspension')]};
}
export async function statusSnapshots(records,issuers,bases,now=Date.now()){
 const status={};
 for(let i=0;i<issuers.length;i++)for(const purpose of ['revocation','suspension']){
  const list=new BitstringStatusList({length:131072});for(const r of records.filter(r=>r.issuerIndex===i))list.setStatus(r.index,purpose==='revocation'?!!r.revoked:!!r.suspended);
  const c=await createCredential({id:bases[i]+'/status/'+purpose,list,statusPurpose:purpose});c.issuer=issuers[i].did;c.validFrom=new Date(now).toISOString();c.validUntil=new Date(now+86400000).toISOString();status[c.id]=await issuers[i].sign(c);
 }return status;
}
export async function trustSnapshot(authority,issuers,bases,{now=Date.now(),closed=[],closedAt={}}={}){
 return authority.sign({'@context':['https://www.w3.org/ns/credentials/v2',{TrustRegistryCredential:'https://example.edu/vocab/TrustRegistryCredential',entries:{'@id':'https://example.edu/vocab/entries','@type':'@json'}}],id:bases[0]+'/trust',type:['VerifiableCredential','TrustRegistryCredential'],issuer:authority.did,validFrom:new Date(now).toISOString(),validUntil:new Date(now+86400000).toISOString(),credentialSubject:{id:bases[0]+'/trust#registry',entries:issuers.map((issuer,i)=>({id:issuer.did,name:PERSONAS.issuers[i],active:!closed.includes(i),authorization:[{credentialType:'OpenBadgeCredential',from:'2000-01-01T00:00:00Z',until:closed.includes(i)?new Date(closedAt[i]??now).toISOString():'2100-01-01T00:00:00Z'}]}))}});
}
