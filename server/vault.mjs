import {randomBytes,createCipheriv,createDecipheriv,scryptSync} from 'node:crypto';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';

export function seal(data,key) {
    const nonce=randomBytes(12);
    const cipher=createCipheriv('aes-256-gcm',key,nonce);
    cipher.setAAD(Buffer.from('itu-lvc-vault-v1'));
    const body=Buffer.concat([cipher.update(JSON.stringify(data),'utf8'),cipher.final()]);
    return {version:1,nonce:nonce.toString('base64'),tag:cipher.getAuthTag().toString('base64'),body:body.toString('base64')};
}
export function open(envelope,key) {
    if(envelope?.version!==1) throw new Error('Unsupported backup format');
    const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(envelope.nonce,'base64'));
    decipher.setAAD(Buffer.from('itu-lvc-vault-v1'));
    decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.body,'base64')),decipher.final()]).toString());
}
export function backup(data,password) {
    if(typeof password!=='string'||password.length<12||password.length>200) throw new Error('Choose a backup password of 12–200 characters');
    const salt=randomBytes(16);
    const key=scryptSync(password,salt,32);
    return {format:'itu-lvc-local-wallet-backup',salt:salt.toString('base64'),...seal(data,key)};
}
export function restore(envelope,password) {
    if(envelope?.format!=='itu-lvc-local-wallet-backup'||typeof password!=='string'||password.length<12||password.length>200) throw new Error('Invalid backup or password');
    try {return open(envelope,scryptSync(password,Buffer.from(envelope.salt,'base64'),32));}
    catch {throw new Error('Incorrect password or corrupted backup');}
}
export async function createVault(directory) {
    await mkdir(directory,{recursive:true,mode:0o700});
    const keyPath=join(directory,'vault.key');
    let key;
    try {key=await readFile(keyPath);} catch(e) {
        if(e.code!=='ENOENT') throw e;
        key=randomBytes(32);await writeFile(keyPath,key,{mode:0o600,flag:'wx'});
    }
    let writes=Promise.resolve();
    return {
        async read(){try{return open(JSON.parse(await readFile(join(directory,'vault.json'),'utf8')),key);}catch(e){if(e.code==='ENOENT')return null;throw e;}},
        async write(data){
            const result=writes.then(async()=>{const path=join(directory,'vault.json');await writeFile(path+'.tmp',JSON.stringify(seal(data,key)),{mode:0o600});await rename(path+'.tmp',path);});
            writes=result.catch(()=>{});return result;
        }
    };
}
