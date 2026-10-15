import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {BitstringStatusList,createCredential,decodeList} from '@digitalbazaar/vc-bitstring-status-list';
import {createIdentity} from './learncard.mjs';
import {createVault,backup,restore} from './vault.mjs';
import {CONTEXT,isDate} from './model.mjs';
import {evaluateCredential,evaluatePresentation,verifyProof} from '../independent/verifier.mjs';

export const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const seed=()=>randomBytes(32).toString('hex');
export async function createService({directory,baseUrl='http://localhost:3000'}){
    const vault=await createVault(directory);
    let state=await vault.read();
    if(!state) state={version:1,seeds:{issuer:seed(),holder:seed(),authority:seed()},records:[],nextIndex:0,trustEntries:null};
    const identities={};
    for(const role of ['issuer','holder','authority']) identities[role]=await createIdentity(state.seeds[role]);
    const published=join(directory,'published');
    await mkdir(published,{recursive:true,mode:0o700});
    const issuerDid=identities.issuer.id.did(),authorityDid=identities.authority.id.did();
    const requests=new Map();
    const publicInfo=()=>({issuerDid,holderDid:identities.holder.id.did(),authorityDid,university:'Example University',custody:'Local development server holds the learner signing key',profile:'LVC-3',format:'W3C VC 2.0 · eddsa-rdfc-2022',baseUrl});
    if(!state.trustEntries) state.trustEntries=[{
        id:issuerDid,name:'Example University',publicKeyMultibase:issuerDid.slice(8),
        authorization:[{credentialType:'UniversityDegreeCredential',from:'2000-01-01T00:00:00Z',until:'2100-01-01T00:00:00Z'}],
        governance:'Synthetic accreditation by the Example Education Authority',active:true
    }];
    await writeFile(join(directory,'authority-did.json'),JSON.stringify({authorityDid}),{mode:0o600});
    async function publish(){
        await vault.write(state);
        const now=new Date().toISOString(),until=new Date(Date.now()+86400000).toISOString();
        for(const purpose of ['revocation','suspension']){
            const list=new BitstringStatusList({length:131072});
            for(const record of state.records) list.setStatus(record.index,purpose==='revocation'?record.revoked:record.suspended);
            const credential=await createCredential({id:baseUrl+'/public/status/'+purpose,list,statusPurpose:purpose});
            credential.issuer=issuerDid;credential.validFrom=now;credential.validUntil=until;
            const signed=await identities.issuer.invoke.issueCredential(credential);
            await writeFile(join(published,purpose+'.json'),JSON.stringify(signed),{mode:0o644});
        }
        const trust=await identities.authority.invoke.issueCredential({
            '@context':['https://www.w3.org/ns/credentials/v2',{
                TrustRegistryCredential:'https://example.edu/vocab/TrustRegistryCredential',
                entries:{'@id':'https://example.edu/vocab/entries','@type':'@json'}
            }],
            id:baseUrl+'/public/trust',type:['VerifiableCredential','TrustRegistryCredential'],
            issuer:authorityDid,validFrom:now,validUntil:until,
            credentialSubject:{id:baseUrl+'/public/trust#registry',entries:state.trustEntries}
        });
        await writeFile(join(published,'trust.json'),JSON.stringify(trust),{mode:0o644});
    }
    async function snapshots(){
        const cache={};
        for(const name of ['revocation','suspension']) cache[baseUrl+'/public/status/'+name]=JSON.parse(await readFile(join(published,name+'.json'),'utf8'));
        return {status:cache,registry:JSON.parse(await readFile(join(published,'trust.json'),'utf8')),authorityDid};
    }
    const find=id=>{const r=state.records.find(r=>r.credential.id===id);if(!r)throw new Error('Credential not found');return r;};
    const alive=id=>{
        const r=requests.get(id);
        if(!r||r.expiresAt<Date.now()||r.used)throw new Error('Request expired, consumed, or unknown');
        return r;
    };
    async function receive(id){
        const record=find(id);
        const result=await evaluateCredential(record.credential,await snapshots());
        if(!result.technicalValid||!result.status.valid)throw new Error('Credential is invalid, revoked, suspended or expired');
        if(record.credential.credentialSubject.id!==identities.holder.id.did())throw new Error('Credential is bound to a different holder');
        record.received=true;await vault.write(state);return record;
    }
    await publish();
    const service = {
        publicInfo,snapshots,requests,
        refreshPublished:publish,
        async issue({learnerName='Alex Morgan',qualification='Bachelor of Science in Computer Science',awardDate='2026-06-30',validUntil}={}){
            if(typeof learnerName!=='string'||learnerName.trim().length<1||learnerName.length>120)throw new Error('Invalid learner name');
            if(typeof qualification!=='string'||qualification.trim().length<1||qualification.length>200)throw new Error('Invalid qualification');
            if(!isDate(awardDate)||Date.parse(awardDate)>Date.now())throw new Error('Choose a valid award date in the past');
            if(validUntil && !Number.isFinite(Date.parse(validUntil)))throw new Error('Invalid expiry date');
            if(state.nextIndex>=131072)throw new Error('Development status list full');
            const index=state.nextIndex++,id='urn:uuid:'+randomUUID();
            const status=purpose=>({id:baseUrl+'/public/status/'+purpose+'#'+index,type:'BitstringStatusListEntry',statusPurpose:purpose,statusListIndex:String(index),statusListCredential:baseUrl+'/public/status/'+purpose});
            const credential=await identities.issuer.invoke.issueCredential({
                '@context':CONTEXT,id,type:['VerifiableCredential','UniversityDegreeCredential'],
                issuer:issuerDid,name:qualification,description:'Academic award from Example University (synthetic demonstration)',
                validFrom:new Date().toISOString(),...(validUntil?{validUntil}:{}),
                credentialSubject:{id:identities.holder.id.did(),name:learnerName,degree:{type:'BachelorDegree',name:qualification,awardDate}},
                credentialStatus:[status('revocation'),status('suspension')]
            });
            state.records.push({credential,index,received:false,revoked:false,suspended:false});
            await publish();return credential;
        },
        records(role){return structuredClone(state.records.filter(r=>role==='issuer'||(r.received&&r.credential.credentialSubject.id===identities.holder.id.did())));},
        pending(){return structuredClone(state.records.filter(r=>!r.received&&r.credential.credentialSubject.id===identities.holder.id.did()));},
        receive,
        async setStatus(id,status){
            if(!['active','suspended','revoked'].includes(status))throw new Error('Invalid status');
            const r=find(id);
            if(r.revoked&&status!=='revoked')throw new Error('Revocation is permanent');
            r.revoked=status==='revoked';r.suspended=status==='suspended';await publish();return {status};
        },
        createRequest({purpose='Evaluate a qualification for a software engineering role',qualification='Bachelor of Science in Computer Science'}={}){
            if(typeof purpose!=='string'||purpose.length<5||purpose.length>300||typeof qualification!=='string'||qualification.length>200)throw new Error('Invalid evidence request');
            for(const [id,r] of requests)if(r.expiresAt<Date.now())requests.delete(id);
            if(requests.size>=100)throw new Error('Too many pending requests');
            const request={id:randomUUID(),challenge:randomBytes(32).toString('base64url'),domain:'Example Employer',purpose,qualification,attributes:['Full credential including learner identifier, name, qualification, award date, issuer, validity, status and proof'],expiresAt:Date.now()+300000,used:false};
            requests.set(request.id,request);
            const timeout=setTimeout(()=>{delete request.presentation;requests.delete(request.id);},300000);timeout.unref();
            return structuredClone(request);
        },
        listRequests(role){
            return [...requests.values()].filter(r=>!r.used&&r.expiresAt>Date.now()).map(r=>{const copy=structuredClone(r);if(role!=='employer')delete copy.presentation;return copy;});
        },
        async present({requestId,credentialIds,approved,disclosureDigest}){
            if(approved!==true)throw new Error('Explicit approval is required');
            const r=alive(requestId);
            if(r.presentation)throw new Error('Presentation already submitted');
            if(!Array.isArray(credentialIds)||!credentialIds.length||credentialIds.length>10)throw new Error('Select 1–10 credentials');
            const credentials=credentialIds.map(id=>{const row=find(id);if(!row.received)throw new Error('Receive the credential first');return row.credential;});
            if(credentials.some(c=>c.credentialSubject.id!==identities.holder.id.did()))throw new Error('Holder binding mismatch');
            if(digest({request:r,credentials})!==disclosureDigest)throw new Error('Disclosure changed; review and approve again');
            const presentation=await identities.holder.invoke.issuePresentation({
                '@context':['https://www.w3.org/ns/credentials/v2'],type:['VerifiablePresentation'],
                holder:identities.holder.id.did(),verifiableCredential:credentials
            },{type:'DataIntegrityProof',cryptosuite:'eddsa-rdfc-2022',proofPurpose:'authentication',challenge:r.challenge,domain:r.domain});
            r.presentation=presentation;
            return presentation;
        },
        async verifyRequest(requestId,presentation){
            const r=alive(requestId);
            const presented=presentation??r.presentation;
            if(!presented)throw new Error('No presentation received');
            // Consume before awaiting verification to prevent concurrent replay; never persist VP.
            r.used=true;delete r.presentation;
            return evaluatePresentation(presented,r,await snapshots());
        },
        async verifyCredential(credential){return evaluateCredential(credential,await snapshots());},
        exportBackup(password){return backup({version:1,seed:state.seeds.holder,credentials:state.records.filter(r=>r.received).map(r=>r.credential)},password);},
        async restoreBackup(envelope,password){
            const data=restore(envelope,password);
            if(data.version!==1||!/^[0-9a-f]{64}$/.test(data.seed)||!Array.isArray(data.credentials)||data.credentials.length>1000)throw new Error('Invalid wallet backup');
            const restored=await createIdentity(data.seed);
            for(const c of data.credentials){
                const p=await verifyProof(c);
                if(!p.verified||c.credentialSubject?.id!==restored.id.did())throw new Error('Backup contains invalid credential or holder binding');
            }
            // Validate the entire import before changing identity or authoritative records.
            // Wallet backups recover holder state; they never recreate the issuer's status database.
            const records=data.credentials.map(credential=>{
                const existing=state.records.find(r=>r.credential.id===credential.id);
                if(!existing || credential.issuer!==issuerDid || digest(existing.credential)!==digest(credential))
                    throw new Error('Restore requires the original issuer records; use the independent wallet toolkit for portability');
                return existing;
            });
            state.seeds.holder=data.seed;identities.holder=restored;
            for(const record of records)record.received=true;
            await vault.write(state);return {restored:data.credentials.length,holderDid:restored.id.did()};
        },
        async changeTrust(entries){state.trustEntries=entries;await publish();},
        async statusList(purpose){if(!['revocation','suspension'].includes(purpose))throw new Error('Unknown status list');return JSON.parse(await readFile(join(published,purpose+'.json'),'utf8'));},
        async trust(){return JSON.parse(await readFile(join(published,'trust.json'),'utf8'));},
        async inspectBit(credential,purpose){const list=await decodeList({encodedList:(await this.statusList(purpose)).credentialSubject.encodedList});return list.getStatus(Number(credential.credentialStatus[0].statusListIndex));}
    };
    // Serialize mutations so concurrent issuance/status/recovery cannot corrupt the vault.
    let mutations=Promise.resolve();
    const serialized=new Set(['issue','receive','setStatus','present','restoreBackup','changeTrust','refreshPublished']);
    return new Proxy(service,{get(target,name){
        if(!serialized.has(name))return target[name];
        return (...args)=>{
            const result=mutations.then(()=>target[name](...args));
            mutations=result.catch(()=>{});
            return result;
        };
    }});
}
