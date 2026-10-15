import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {identityFactory} from '../core/identity.mjs';
import {documents} from '../profiles/education.mjs';
const require=createRequire(import.meta.url);
export async function nodeFactory(){return identityFactory(await readFile(join(dirname(require.resolve('@learncard/didkit-plugin')),'didkit_wasm_bg.wasm')),documents);}
