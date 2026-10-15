import {sourceHash} from './source-hash.mjs';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url))),dist=join(root,'dist');
const assets=(await readdir(join(dist,'assets'))).map(n=>'/assets/'+n);
const version=createHash('sha256').update(await readFile(join(dist,'index.html'))).digest('hex').slice(0,12);
let sw=await readFile(join(root,'public/sw.js'),'utf8');sw=sw.replace("learning-passport-shell-v2-1",'learning-passport-shell-'+version).replace("cache.addAll(['/','/favicon.svg','/manifest.webmanifest'])",'cache.addAll('+JSON.stringify(['/','/favicon.svg','/manifest.webmanifest',...assets])+')');await writeFile(join(dist,'sw.js'),sw);
const csp="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";
for(const name of ['index.html','operator.html']){let html=await readFile(join(dist,name),'utf8');html=html.replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="'+csp+'">');await writeFile(join(dist,name),html);}
const files={};for(const path of ['index.html','sw.js',...assets.map(n=>n.slice(1))]){const bytes=await readFile(join(dist,path));files[path]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}await writeFile(join(dist,'build-manifest.json'),JSON.stringify({version:'2.0.0',buildId:version,sourceTreeSha256:await sourceHash(root),files},null,2));console.log('Release assets pinned:',version,Object.keys(files).length,'files');
