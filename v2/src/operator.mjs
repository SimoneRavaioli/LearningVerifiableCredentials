import QRCode from 'qrcode';
const get=id=>document.getElementById(id);const health=await(await fetch('/health')).json();get('title').textContent=health.role+' operator';
async function post(path,body){const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error);return data;}
async function run(fn){get('error').textContent='';try{await fn();}catch(e){get('error').textContent=e.message;}}
get('login').onsubmit=e=>{e.preventDefault();run(async()=>{await post('/login',{password:get('password').value});get('password').value='';get('login').hidden=true;get('controls').hidden=false;get(health.role==='issuer'?'issue':health.role==='verifier'?'request':'close').hidden=false;if(health.role==='issuer')get('openid-offer').hidden=false;if(health.role==='verifier')get('openid-request').hidden=false;});};
get('issue').onsubmit=e=>{e.preventDefault();run(async()=>{const data=await post('/issue',{holderDid:get('holder').value,name:get('name').value,qualification:'Bachelor of Science in Computer Science',awardDate:'2026-06-30'});get('output').textContent=JSON.stringify(data,null,2);});};
get('request').onclick=()=>run(async()=>{const data=await post('/requests',{});get('output').textContent=JSON.stringify(data,null,2);await QRCode.toCanvas(get('qr'),data.walletLink,{width:230,margin:2});});
get('close').onclick=()=>run(async()=>{if(confirm('Close the synthetic issuer and preserve its historical authority?'))get('output').textContent=JSON.stringify(await post('/close',{}),null,2);});

async function handoff(path){const data=await post(path,{});get('output').textContent=JSON.stringify(data,null,2);get('consumer-link').href=data.learncardUrl;get('consumer-link').hidden=false;await QRCode.toCanvas(get('qr'),data.uri,{width:300,margin:2});get('message').textContent='LearnCard protocol handoff prepared. Public HTTPS services are required for the remote consumer wallet; loopback is only for the local SDK test.';}
get('openid-offer').onclick=()=>run(()=>handoff('/openid-offer'));get('openid-request').onclick=()=>run(()=>handoff('/openid-request'));
