import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {createApp} from '../server/app.mjs';
import {createPreviewServer} from '../server/preview.mjs';

test('internal preview preserves original wallet role security and serves verified file bytes',async t=>{
    const directory=await mkdtemp('/tmp/lvc-preview-adapter-');
    t.after(()=>rm(directory,{recursive:true,force:true}));
    const {app}=await createApp({directory:directory+'/data',baseUrl:'http://localhost:3101'});
    const upstream=app.listen(3101,'127.0.0.1');await new Promise(resolve=>upstream.once('listening',resolve));
    t.after(()=>new Promise(resolve=>upstream.close(resolve)));
    await writeFile(directory+'/LearningPassport-source.zip',Buffer.from('fixture download bytes'));
    const server=createPreviewServer({upstream:'http://127.0.0.1:3101',downloadsDirectory:directory});
    server.listen(0,'0.0.0.0');await new Promise(resolve=>server.once('listening',resolve));
    t.after(()=>new Promise(resolve=>server.close(resolve)));
    const origin='http://127.0.0.1:'+server.address().port;
    const post=(path,body,headers={})=>fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:JSON.stringify(body)});
    assert.equal((await fetch(origin)).status,200);
    const download=await fetch(origin+'/downloads/source.zip');
    assert.equal(download.status,200);assert.equal(await download.text(),'fixture download bytes');
    assert.match(download.headers.get('content-disposition'),/attachment/);
    assert.equal((await fetch(origin+'/downloads/../../.data/vault.key')).status,404);
    assert.equal((await post('/api/login',{role:'issuer',password:'university-demo-change-me'},{Origin:'https://attacker.invalid'})).status,403);
    const login=await post('/api/login',{role:'holder',password:'learner-demo-change-me'});assert.equal(login.status,200);
    const cookie=login.headers.get('set-cookie').split(';')[0],session=await login.json();
    const forbidden=await post('/api/issue',{}, {Cookie:cookie,'X-CSRF-Token':session.csrf});
    assert.equal(forbidden.status,403);
});
