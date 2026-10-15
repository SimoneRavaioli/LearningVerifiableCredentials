/** Minimal independent holder toolkit, not a production third-party wallet. No LearnCard imports. */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import * as vc from '@digitalbazaar/vc';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {cryptosuite} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import {driver} from '@digitalbazaar/did-method-key';
import {loader,verifyProof} from './verifier.mjs';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';

export async function independentWallet({directory,seed}){
    const key=await Ed25519Multikey.generate({seed});
    const resolver=driver();
    resolver.use({multibaseMultikeyHeader:'z6Mk',fromMultibase:Ed25519Multikey.from});
    const {didDocument}=await resolver.fromKeyPair({verificationKeyPair:key});
    const did=didDocument.id;
    key.controller=did;key.id=did+'#'+key.publicKeyMultibase;
    await mkdir(directory,{recursive:true,mode:0o700});
    return {
        did,
        async importCredential(credential){
            const result=await verifyProof(credential);
            if(!result.verified||credential.credentialSubject?.id!==did)throw new Error('Invalid proof or holder mismatch');
            // Preserve original JSON-LD proof and payload verbatim as received.
            await writeFile(join(directory,'credential.json'),JSON.stringify(credential),{mode:0o600});
        },
        async readCredential(){return JSON.parse(await readFile(join(directory,'credential.json'),'utf8'));},
        async present(request,credentials){
            const credential=JSON.parse(await readFile(join(directory,'credential.json'),'utf8'));
            return vc.signPresentation({
                presentation:{'@context':['https://www.w3.org/ns/credentials/v2'],type:['VerifiablePresentation'],holder:did,verifiableCredential:credentials??[credential]},
                suite:new DataIntegrityProof({signer:key.signer(),cryptosuite}),
                challenge:request.challenge,domain:request.domain,documentLoader:loader()
            });
        }
    };
}
