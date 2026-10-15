import {mkdtemp,rm} from 'node:fs/promises';
import {createService} from '../server/service.mjs';
export async function fixture(t){
    const directory=await mkdtemp('/tmp/lvc-test-');
    t.after(()=>rm(directory,{recursive:true,force:true}));
    const service=await createService({directory});
    return {service,directory};
}
export function tamper(credential){
    const copy=structuredClone(credential);copy.credentialSubject.degree.name='Doctor of Medicine';return copy;
}
