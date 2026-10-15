import {decodeProtectedHeader,importJWK,jwtVerify,base64url} from 'jose';
import {driver} from '@digitalbazaar/did-method-key';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
const resolver=driver();resolver.use({multibaseMultikeyHeader:'z6Mk',fromMultibase:Ed25519Multikey.from});
export async function verifyHolderProof(proof,audience,consumeNonce){
 const header=decodeProtectedHeader(proof);if(header.alg!=='EdDSA'||header.typ!=='openid4vci-proof+jwt'||typeof header.kid!=='string'||!header.kid.startsWith('did:key:'))throw new Error('Unsupported holder proof header');
 const did=header.kid.split('#')[0],doc=await resolver.get({url:did}),method=doc.verificationMethod.find(m=>m.id===header.kid);if(!method)throw new Error('Holder verification method is not authorized');const key=await Ed25519Multikey.from(method);const publicJwk={kty:'OKP',crv:'Ed25519',x:base64url.encode(key.publicKey)};const verified=await jwtVerify(proof,await importJWK(publicJwk,'EdDSA'),{algorithms:['EdDSA'],audience,typ:'openid4vci-proof+jwt'});
 if(typeof verified.payload.iat!=='number'||Math.abs(Date.now()/1000-verified.payload.iat)>300||!consumeNonce(verified.payload.nonce))throw new Error('Invalid or expired credential proof nonce');return did;
}
