import {mkdtemp,cp,copyFile,writeFile,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
const directory=await mkdtemp('/tmp/lvc-node-only-');
async function command(args){
    return new Promise(resolve=>{
        const p=spawn('npm',args,{cwd:directory,env:process.env});
        let stdout='',stderr='';p.stdout.on('data',d=>stdout+=d);p.stderr.on('data',d=>stderr+=d);
        p.on('exit',exitCode=>resolve({args,exitCode,stdout,stderr}));
    });
}
try{
    for(const file of ['package.json','package-lock.json','.npmrc'])await copyFile(file,join(directory,file));
    for(const folder of ['server','independent','tests'])await cp(folder,join(directory,folder),{recursive:true});
    const install=await command(['--cache',process.env.NPM_CONFIG_CACHE??'/workspace/.npm-cache','ci','--omit=dev','--omit=optional','--omit=peer']);
    if(install.exitCode!==0)throw new Error(install.stderr);
    const test=await command(['test']);
    await writeFile('evidence/node-only-runtime.json',JSON.stringify({install:{exitCode:install.exitCode,args:install.args},test},null,2));
    console.log(test.stdout);
    if(test.exitCode!==0)process.exitCode=1;
}finally{await rm(directory,{recursive:true,force:true});}
