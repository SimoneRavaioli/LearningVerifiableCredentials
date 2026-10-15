import {spawnSync} from 'node:child_process';
import {writeFileSync,existsSync} from 'node:fs';
if (!process.stdin.isTTY) throw new Error('TTY required for hidden credential input');
process.stdin.setRawMode(true); process.stdin.setEncoding('utf8');
console.log('Ready for Site source credential JSON on stdin (input hidden).');
let input='';
process.stdin.on('data', chunk => {input+=chunk; if(input.includes('\n')) {process.stdin.setRawMode(false); process.stdin.pause(); run(JSON.parse(input.trim()));}});
function run({credential:c, project_id, archivePath}) {
 if(c.auth_mode!=='http_extra_header') throw new Error('Unsupported Git credential mode');
 const u=new URL(c.remote_url); if(u.protocol!=='https:'||u.username||u.password) throw new Error('Invalid remote');
 const auth={...process.env,GIT_CONFIG_COUNT:'2',GIT_CONFIG_KEY_0:'http.extraHeader',GIT_CONFIG_VALUE_0:`Authorization: Bearer ${c.token}`,GIT_CONFIG_KEY_1:'credential.helper',GIT_CONFIG_VALUE_1:'',GIT_TERMINAL_PROMPT:'0'};
 const git=(args,authenticated=false)=>{const r=spawnSync('git',args,{encoding:'utf8',env:authenticated?auth:process.env}); if(r.status!==0) throw new Error((r.stderr||'Git failed').replaceAll(c.token,'[redacted]')); return r.stdout.trim();};
 if(!existsSync('.git')) git(['init','-b',c.branch]); git(['config','user.name','Wallet Preview Builder']); git(['config','user.email','wallet-preview@local.invalid']);
 git(['add','.']); git(['commit','--allow-empty','-m','Build private interactive LearnCard wallet preview']);
 if(git(['remote']).split('\n').includes('origin')) git(['remote','set-url','origin',c.remote_url]); else git(['remote','add','origin',c.remote_url]);
 git(['push','origin',`HEAD:refs/heads/${c.branch}`],true);
 const sha=git(['rev-parse','HEAD']); const remote=git(['ls-remote','origin',`refs/heads/${c.branch}`],true).split(/\s/)[0];
 if(sha!==remote) throw new Error('Remote commit mismatch');
 const packed=spawnSync('tar',['-czf',archivePath,'.openai/hosting.json','dist'],{encoding:'utf8'}); if(packed.status!==0) throw new Error(packed.stderr);
 const result={project_id,commit_sha:sha,archive:archivePath}; writeFileSync('.openai/source-result.json',JSON.stringify(result,null,2)); console.log(JSON.stringify(result));
}
