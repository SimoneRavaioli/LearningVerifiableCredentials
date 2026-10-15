import {createHash} from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { generateLearnCard } from '@learncard/core';
import { getDidKitPlugin } from '@learncard/didkit-plugin';
import { getDidKeyPlugin } from '@learncard/didkey-plugin';
import { getVCPlugin } from '@learncard/vc-plugin';

const require = createRequire(import.meta.url);
let engine;
export async function createIdentity(seed) {
    if(!engine){
        const binary=await readFile(join(dirname(require.resolve('@learncard/didkit-plugin')), 'didkit_wasm_bg.wasm'));
        if(createHash('sha256').update(binary).digest('hex')!=='fe1d254186130480a3ae831fe1b17c58ea732adc39cad16f895aa58e03f1bd62')throw new Error('DIDKit WASM integrity check failed');
        engine=getDidKitPlugin(binary,false);
    }
    const didkit = await (await generateLearnCard()).addPlugin(await engine);
    const identity = await didkit.addPlugin(await getDidKeyPlugin(didkit, seed, 'key'));
    return identity.addPlugin(getVCPlugin(identity));
}
