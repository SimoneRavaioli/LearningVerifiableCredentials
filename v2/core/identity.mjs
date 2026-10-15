import {generateLearnCard} from '@learncard/core';
import {getDidKitPlugin} from '@learncard/didkit-plugin';
import {getDidKeyPlugin} from '@learncard/didkey-plugin';
import {getVCPlugin} from '@learncard/vc-plugin';
export const WASM_SHA256='fe1d254186130480a3ae831fe1b17c58ea732adc39cad16f895aa58e03f1bd62';
export const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
export const randomSeed=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const digest=async value=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value)))));
export async function identityFactory(binary,documents={}){
 if(await digestBytes(binary)!==WASM_SHA256)throw new Error('Signing engine integrity check failed');
 const engine=await getDidKitPlugin(binary,false);
 return async seed=>{
  let card=await(await generateLearnCard()).addPlugin(engine);
  if(Object.keys(documents).length)card=await card.addPlugin({name:'Pinned education contexts',context:{resolveStaticDocument:async(_card,url)=>documents[url]}});
  card=await card.addPlugin(await getDidKeyPlugin(card,seed,'key'));
  card=await card.addPlugin(getVCPlugin(card));
  return {card,did:card.id.did(),sign:credential=>card.invoke.issueCredential(credential,{type:'DataIntegrityProof',cryptosuite:'eddsa-rdfc-2022'}),present:(credentials,request)=>card.invoke.issuePresentation({'@context':['https://www.w3.org/ns/credentials/v2'],type:['VerifiablePresentation'],holder:card.id.did(),verifiableCredential:credentials},{type:'DataIntegrityProof',cryptosuite:'eddsa-rdfc-2022',proofPurpose:'authentication',challenge:request.challenge,domain:request.domain})};
 };
}
async function digestBytes(binary){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',binary)));}
