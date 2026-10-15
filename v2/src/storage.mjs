const encoder=new TextEncoder();
export const b64=bytes=>btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));
export const unb64=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
export async function encrypt(data,key){const nonce=crypto.getRandomValues(new Uint8Array(12));const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:encoder.encode('learning-passport-v2')},key,encoder.encode(JSON.stringify(data)));return {nonce:b64(nonce),body:b64(new Uint8Array(bytes))};}
export async function decrypt(data,key){return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(data.nonce),additionalData:encoder.encode('learning-passport-v2')},key,unb64(data.body))));}
export async function passwordKey(password,salt){if(typeof password!=='string'||password.length<12||password.length>200)throw new Error('Use a password of 12–200 characters');const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},key,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export class Repository{
 constructor(name='learning-passport-v2'){this.name=name;}
 async open(){if(!navigator.locks)throw new Error('This browser needs Web Locks support to save wallet changes safely. Use an up-to-date Safari, Chrome or Firefox.');this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open(this.name,1);r.onupgradeneeded=()=>r.result.createObjectStore('wallet');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Wallet storage is unavailable. Allow website storage or use a normal browser window.'));});}
 async get(id){return new Promise((resolve,reject)=>{const r=this.db.transaction('wallet').objectStore('wallet').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 async put(id,value){await new Promise((resolve,reject)=>{const tx=this.db.transaction('wallet','readwrite');try{tx.objectStore('wallet').put(value,id);}catch{tx.abort();reject(new Error('Wallet could not be saved. Storage may be full or blocked. Export a backup before clearing any data.'));return;}tx.oncomplete=resolve;tx.onabort=()=>reject(new Error('Wallet could not be saved. Storage may be full or blocked. Export a backup before clearing any data.'));tx.onerror=()=>reject(new Error('Wallet could not be saved. Check browser storage permissions.'));});}
 async transaction(fn){return navigator.locks.request(this.name+'-write',async()=>{
  if(!this.db)await this.open();let key=await this.get('device-key');if(!key){key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await this.put('device-key',key);}
  let saved=await this.get('state'),state=saved?await decrypt(saved,key):null;
  if(state&&state.version!==2)throw new Error('This wallet storage version is unsupported. Keep your backup and use the matching wallet release.');
  const result=await fn(state);
  if(result.state){await this.put('state',await encrypt(result.state,key));const channel=new BroadcastChannel(this.name);channel.postMessage({changed:true});channel.close();}
  return result.value;
 });}
}
