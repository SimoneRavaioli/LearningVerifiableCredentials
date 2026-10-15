// Experimental SD-JWT selective-disclosure reference. Not an OpenID exchange implementation.
import {SignJWT,jwtVerify,importJWK,exportJWK,generateKeyPair,base64url} from 'jose';
const bytes=s=>new TextEncoder().encode(s);
const hash=async s=>base64url.encode(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes(s))));
export async function sdIdentity(){const {publicKey,privateKey}=await generateKeyPair('EdDSA',{extractable:true});return {publicJwk:await exportJWK(publicKey),privateKey};}
export async function issueSelectiveCredential({issuer,holderJwk,claims,now=Math.floor(Date.now()/1000)}){
 const disclosures=[];for(const [key,value] of Object.entries(claims)){const salt=base64url.encode(crypto.getRandomValues(new Uint8Array(16)));disclosures.push({name:key,encoded:base64url.encode(JSON.stringify([salt,key,value]))});}
 const token=await new SignJWT({_sd:await Promise.all(disclosures.map(d=>hash(d.encoded))),_sd_alg:'sha-256',cnf:{jwk:holderJwk},vct:'https://learning-passport.example/profiles/qualification-sd-jwt-v1'}).setProtectedHeader({alg:'EdDSA',typ:'dc+sd-jwt'}).setIssuer('https://issuer.example').setIssuedAt(now).setExpirationTime(now+3600).sign(issuer.privateKey);
 return {token,disclosures};
}
export async function presentSelectiveCredential({credential,fields,holder,audience,nonce,now=Math.floor(Date.now()/1000)}){
 if(!fields.length||fields.some(f=>!credential.disclosures.some(d=>d.name===f)))throw new Error('Unsupported disclosure selection');
 const selected=credential.disclosures.filter(d=>fields.includes(d.name));const sd=credential.token+'~'+selected.map(d=>d.encoded+'~').join('');
 const binding=await new SignJWT({aud:audience,nonce,iat:now,sd_hash:await hash(sd)}).setProtectedHeader({alg:'EdDSA',typ:'kb+jwt'}).sign(holder.privateKey);return sd+binding;
}
// JOSE verifier does not call LearnCard; checks selected disclosures, issuer pin and holder binding.
export async function verifySelectivePresentation(presentation,{issuerJwk,audience,nonce,allowedFields,now=Math.floor(Date.now()/1000)}){
 const parts=presentation.split('~'),kb=parts.pop(),token=parts.shift();if(!kb||!token||parts.length>50)throw new Error('Malformed selective presentation');
 const issuer=await jwtVerify(token,await importJWK(issuerJwk,'EdDSA'),{algorithms:['EdDSA'],issuer:'https://issuer.example',typ:'dc+sd-jwt',currentDate:new Date(now*1000)});
 if(issuer.payload._sd_alg!=='sha-256'||issuer.payload.vct!=='https://learning-passport.example/profiles/qualification-sd-jwt-v1')throw new Error('Unsupported SD-JWT profile');
 const claims={};for(const encoded of parts){const value=JSON.parse(new TextDecoder().decode(base64url.decode(encoded)));if(value.length!==3||!allowedFields.includes(value[1])||Object.hasOwn(claims,value[1])||!issuer.payload._sd.includes(await hash(encoded)))throw new Error('Unapproved or invalid disclosure');claims[value[1]]=value[2];}
 if(allowedFields.some(field=>!Object.hasOwn(claims,field)))throw new Error('Required disclosure missing');
 const proof=await jwtVerify(kb,await importJWK(issuer.payload.cnf.jwk,'EdDSA'),{algorithms:['EdDSA'],audience,typ:'kb+jwt',currentDate:new Date(now*1000)});
 const sd=token+'~'+parts.map(d=>d+'~').join('');if(proof.payload.nonce!==nonce||proof.payload.sd_hash!==await hash(sd)||Math.abs(now-proof.payload.iat)>300)throw new Error('Invalid holder binding or expired proof');
 return {claims,holderBound:true};
}
