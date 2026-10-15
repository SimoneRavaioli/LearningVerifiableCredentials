import didkitWasmUrl from '@learncard/didkit-plugin/dist/didkit_wasm_bg.wasm?url';
import {generateLearnCard} from '@learncard/core';
import {getDidKitPlugin} from '@learncard/didkit-plugin';
import {getDidKeyPlugin} from '@learncard/didkey-plugin';
import {getVCPlugin} from '@learncard/vc-plugin';
import {BitstringStatusList,createCredential} from '@digitalbazaar/vc-bitstring-status-list';
import {evaluateCredential,evaluatePresentation,verifyProof} from '../independent/verifier.mjs';
import {CONTEXT,isDate} from '../server/model.mjs';

const encoder=new TextEncoder();
const origin=()=>location.origin==='null'?'https://learning-passport.local':location.origin;
const roles={issuer:'university-demo-change-me',holder:'learner-demo-change-me',employer:'employer-demo-change-me'};
const seed=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(JSON.stringify(value)))),b=>b.toString(16).padStart(2,'0')).join('');
const b64=bytes=>btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));
const unb64=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
let engine,db,key,state,identities,session,ready,queue=Promise.resolve();
function transaction(mode,fn){return new Promise((resolve,reject)=>{const tx=db.transaction('wallet',mode),store=tx.objectStore('wallet');let value;fn(store,v=>value=v);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);});}
const get=id=>transaction('readonly',(store,done)=>{const r=store.get(id);r.onsuccess=()=>done(r.result);});
const put=(id,value)=>transaction('readwrite',store=>store.put(value,id));
async function encrypt(data,k){const nonce=crypto.getRandomValues(new Uint8Array(12));const body=await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:encoder.encode('lvc-browser-v1')},k,encoder.encode(JSON.stringify(data)));return {nonce:b64(nonce),body:b64(new Uint8Array(body))};}
async function decrypt(data,k){const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(data.nonce),additionalData:encoder.encode('lvc-browser-v1')},k,unb64(data.body));return JSON.parse(new TextDecoder().decode(bytes));}
async function persist(){const stored={...state,requests:state.requests.map(publicRequest)};await put('encrypted-state',await encrypt(stored,key));}
async function identity(value){const base=await(await generateLearnCard()).addPlugin(engine);const did=await base.addPlugin(await getDidKeyPlugin(base,value,'key'));return did.addPlugin(getVCPlugin(did));}
async function initialize(){
    db=await new Promise((resolve,reject)=>{const r=indexedDB.open('learning-passport-private-preview-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('wallet');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    key=await get('device-key');
    if(!key){key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await put('device-key',key);}
    const stored=await get('encrypted-state');
    state=stored?await decrypt(stored,key):{version:1,seeds:{issuer:seed(),holder:seed(),authority:seed()},records:[],requests:[],nextIndex:0,registry:null,status:{}};
    const response=await fetch(didkitWasmUrl);if(!response.ok)throw new Error('Unable to load signing engine');
    const binary=await response.arrayBuffer();
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',binary)),b=>b.toString(16).padStart(2,'0')).join('');
    if(digest!=='fe1d254186130480a3ae831fe1b17c58ea732adc39cad16f895aa58e03f1bd62')throw new Error('Signing engine integrity check failed');
    engine=await getDidKitPlugin(binary,false);
    identities={};for(const role of ['issuer','holder','authority'])identities[role]=await identity(state.seeds[role]);
    const savedSession=sessionStorage.getItem('lvc-preview-session');
    session=savedSession?JSON.parse(savedSession):null;
    if(session?.expiresAt<Date.now()){session=null;sessionStorage.removeItem('lvc-preview-session');}
    await publish();
}
const info=()=>({issuerDid:identities.issuer.id.did(),holderDid:identities.holder.id.did(),authorityDid:identities.authority.id.did(),university:'Example University',custody:'The private preview keeps encrypted learner keys and credentials in this browser. Browser storage and its device key share the same origin; this does not protect against malicious same-origin code.',profile:'LVC-3',format:'W3C VC 2.0 · eddsa-rdfc-2022',baseUrl:origin()});
async function publish(){
    const now=new Date().toISOString(),until=new Date(Date.now()+86400000).toISOString(),base=origin();
    for(const purpose of ['revocation','suspension']){
        const list=new BitstringStatusList({length:131072});
        for(const r of state.records)list.setStatus(r.index,purpose==='revocation'?r.revoked:r.suspended);
        const credential=await createCredential({id:base+'/status/'+purpose,list,statusPurpose:purpose});
        credential.issuer=info().issuerDid;credential.validFrom=now;credential.validUntil=until;
        state.status[credential.id]=await identities.issuer.invoke.issueCredential(credential);
    }
    state.registry=await identities.authority.invoke.issueCredential({
        '@context':['https://www.w3.org/ns/credentials/v2',{TrustRegistryCredential:'https://example.edu/vocab/TrustRegistryCredential',entries:{'@id':'https://example.edu/vocab/entries','@type':'@json'}}],
        id:base+'/trust',type:['VerifiableCredential','TrustRegistryCredential'],issuer:info().authorityDid,validFrom:now,validUntil:until,
        credentialSubject:{id:base+'/trust#registry',entries:[{id:info().issuerDid,name:'Example University',publicKeyMultibase:info().issuerDid.slice(8),authorization:[{credentialType:'UniversityDegreeCredential',from:'2000-01-01T00:00:00Z',until:'2100-01-01T00:00:00Z'}],governance:'Synthetic Example Education Authority',active:true}]}
    });
    await persist();
}
const snapshots=()=>({status:state.status,registry:state.registry,authorityDid:info().authorityDid});
function requireRole(role){if(!session||session.expiresAt<Date.now())throw new Error('Sign in to continue');if(role&&session.role!==role)throw new Error('Role not permitted');}
function find(id){const r=state.records.find(r=>r.credential.id===id);if(!r)throw new Error('Credential not found');return r;}
function request(id){const r=state.requests.find(r=>r.id===id&&!r.used&&r.expiresAt>Date.now());if(!r)throw new Error('Request expired, consumed, or unknown');return r;}
const publicRequest=r=>{const c=structuredClone(r);delete c.presentation;return c;};
async function backupKey(password,salt){
    if(typeof password!=='string'||password.length<12||password.length>200)throw new Error('Choose a backup password of 12–200 characters');
    const material=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function handle(path,body){
    ready??=initialize();await ready;
    state.requests=state.requests.filter(r=>r.expiresAt>Date.now());
    if(path==='info')return info();
    if(path==='published-trust')return state.registry;
    if(path==='published-status')return state.status[origin()+'/status/revocation'];
    if(path==='login'){
        if(roles[body.role]!==body.password)throw new Error('Incorrect role or development password');
        session={role:body.role,csrf:crypto.randomUUID(),expiresAt:Date.now()+3600000};sessionStorage.setItem('lvc-preview-session',JSON.stringify(session));return session;
    }
    if(path==='logout'){session=null;sessionStorage.removeItem('lvc-preview-session');return {ok:true};}
    requireRole();
    if(path==='session')return session;
    if(path==='state'){
        const role=session.role;
        return {role,info:info(),records:role==='employer'?[]:state.records.filter(r=>role==='issuer'||r.received),pending:role==='holder'?state.records.filter(r=>!r.received):[],requests:state.requests.filter(r=>!r.used).map(r=>role==='employer'?structuredClone(r):publicRequest(r))};
    }
    if(path==='issue'){
        requireRole('issuer');
        const {learnerName,qualification,awardDate}=body;
        if(typeof learnerName!=='string'||!learnerName.trim()||learnerName.length>120||typeof qualification!=='string'||!qualification.trim()||qualification.length>200||!isDate(awardDate)||Date.parse(awardDate)>Date.now())throw new Error('Invalid learner, qualification or award date');
        if(state.nextIndex>=131072)throw new Error('Status list full');
        const index=state.nextIndex++,id='urn:uuid:'+crypto.randomUUID(),base=origin();
        const status=purpose=>({id:base+'/status/'+purpose+'#'+index,type:'BitstringStatusListEntry',statusPurpose:purpose,statusListIndex:String(index),statusListCredential:base+'/status/'+purpose});
        const credential=await identities.issuer.invoke.issueCredential({'@context':CONTEXT,id,type:['VerifiableCredential','UniversityDegreeCredential'],issuer:info().issuerDid,name:qualification,description:'Academic award from Example University (synthetic demonstration)',validFrom:new Date().toISOString(),credentialSubject:{id:info().holderDid,name:learnerName,degree:{type:'BachelorDegree',name:qualification,awardDate}},credentialStatus:[status('revocation'),status('suspension')]});
        state.records.push({credential,index,received:false,revoked:false,suspended:false});await publish();return {credential};
    }
    if(path==='status'){
        requireRole('issuer');const r=find(body.credentialId);
        if(!['active','suspended','revoked'].includes(body.status))throw new Error('Invalid status');
        if(r.revoked&&body.status!=='revoked')throw new Error('Revocation is permanent');
        r.revoked=body.status==='revoked';r.suspended=body.status==='suspended';await publish();return {status:body.status};
    }
    if(path==='receive'){
        requireRole('holder');const r=find(body.credentialId),check=await evaluateCredential(r.credential,snapshots());
        if(!check.technicalValid||!check.status.valid||r.credential.credentialSubject.id!==info().holderDid)throw new Error('Credential is invalid, revoked, suspended or bound to another holder');
        r.received=true;await persist();return {record:r};
    }
    if(path==='requests'){
        requireRole('employer');
        if(typeof body.purpose!=='string'||body.purpose.length<5||body.purpose.length>300||typeof body.qualification!=='string'||body.qualification.length>200)throw new Error('Invalid request');
        if(state.requests.length>=100)throw new Error('Too many pending requests');
        const r={id:crypto.randomUUID(),challenge:crypto.randomUUID()+crypto.randomUUID(),domain:'Example Employer',purpose:body.purpose,qualification:body.qualification,attributes:['Full credential including learner identifier, name, qualification, award date, issuer, validity, status and proof'],expiresAt:Date.now()+300000,used:false};
        state.requests.push(r);await persist();return {request:publicRequest(r)};
    }
    if(path==='disclosure'||path==='present'){
        requireRole('holder');const r=request(body.requestId);
        if(!Array.isArray(body.credentialIds)||!body.credentialIds.length||body.credentialIds.length>10)throw new Error('Select 1–10 credentials');
        const credentials=body.credentialIds.map(id=>{const row=find(id);if(!row.received)throw new Error('Receive the credential first');return row.credential;});
        const disclosureDigest=await hash({request:publicRequest(r),credentials});
        if(path==='disclosure')return {request:publicRequest(r),credentials,disclosureDigest};
        if(!body.approved||body.disclosureDigest!==disclosureDigest)throw new Error('Explicit approval of the unchanged disclosure is required');
        if(r.presentation)throw new Error('Presentation already submitted');
        const presentation=await identities.holder.invoke.issuePresentation({'@context':['https://www.w3.org/ns/credentials/v2'],type:['VerifiablePresentation'],holder:info().holderDid,verifiableCredential:credentials},{type:'DataIntegrityProof',cryptosuite:'eddsa-rdfc-2022',proofPurpose:'authentication',challenge:r.challenge,domain:r.domain});
        // Pending presentations are session-only. Never persist this object.
        r.presentation=presentation;return {presentation};
    }
    if(path==='verify-request'){
        requireRole('employer');const r=request(body.requestId),vp=body.presentation??r.presentation;if(!vp)throw new Error('No presentation received');
        r.used=true;delete r.presentation;await persist();return evaluatePresentation(vp,r,snapshots());
    }
    if(path==='verify-credential'){requireRole('employer');return evaluateCredential(body.credential,snapshots());}
    if(path==='snapshots'){requireRole('employer');return snapshots();}
    if(path==='backup'){
        requireRole('holder');const salt=crypto.getRandomValues(new Uint8Array(16)),k=await backupKey(body.password,salt);
        return {backup:{format:'lvc-browser-backup-v1',salt:b64(salt),...await encrypt({seed:state.seeds.holder,credentials:state.records.filter(r=>r.received).map(r=>r.credential)},k)}};
    }
    if(path==='restore'){
        requireRole('holder');const e=body.backup;
        if(e?.format!=='lvc-browser-backup-v1')throw new Error('Choose a browser-preview backup');
        let data;try{data=await decrypt(e,await backupKey(body.password,unb64(e.salt)));}catch{throw new Error('Incorrect password or corrupted backup');}
        if(!/^[0-9a-f]{64}$/.test(data.seed)||!Array.isArray(data.credentials)||data.credentials.length>1000)throw new Error('Invalid backup');
        const restored=await identity(data.seed);
        for(const c of data.credentials){if(!(await verifyProof(c)).verified||c.credentialSubject.id!==restored.id.did())throw new Error('Invalid proof or holder binding');if(!state.records.some(r=>r.credential.id===c.id))throw new Error('Restore requires the original preview issuer records');}
        state.seeds.holder=data.seed;identities.holder=restored;
        for(const c of data.credentials)find(c.id).received=true;await persist();return {restored:data.credentials.length};
    }
    throw new Error('Unknown wallet action');
}
export function browserApi(path,body){
    const result=queue.then(()=>handle(path,body));
    queue=result.catch(()=>{});
    return result.then(value=>structuredClone(value));
}
