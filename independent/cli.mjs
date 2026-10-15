import {readFile} from 'node:fs/promises';
import {evaluateCredential,evaluatePresentation} from './verifier.mjs';
const [credentialFile,snapshotFile,authorityFile,requestFile]=process.argv.slice(2);
if(!credentialFile||!snapshotFile||!authorityFile){
    console.error('Usage: npm run verify -- credential-or-vp.json snapshots.json trusted-authority.json [request.json]');
    process.exit(2);
}
const input=JSON.parse(await readFile(credentialFile,'utf8'));
const snapshots=JSON.parse(await readFile(snapshotFile,'utf8'));
const {authorityDid}=JSON.parse(await readFile(authorityFile,'utf8'));
// Trust anchor is selected by the operator, never accepted from the portable bundle.
snapshots.authorityDid=authorityDid;
const result=requestFile?await evaluatePresentation(input,JSON.parse(await readFile(requestFile,'utf8')),snapshots):await evaluateCredential(input,snapshots);
console.log(JSON.stringify(result,null,2));
process.exitCode=result.accepted?0:1;
