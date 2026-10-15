import {readdir,readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
export async function sourceHash(root){const hash=createHash('sha256');const ignored=new Set(['node_modules','.git','.data','dist','evidence','.openai']);async function visit(dir,prefix=''){for(const name of (await readdir(dir)).sort()){if(ignored.has(name)||name==='.env'||name.startsWith('.env.')&&name!=='.env.example')continue;const path=join(dir,name),meta=await stat(path),relative=prefix+name;if(meta.isDirectory())await visit(path,relative+'/');else{hash.update(relative+'\0');hash.update(await readFile(path));hash.update('\0');}}}await visit(root);return hash.digest('hex');}
