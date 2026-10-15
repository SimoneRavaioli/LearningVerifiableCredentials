/**
 * Internal cloud preview adapter for the original Node wallet.
 * No external tunnel or publication. Serves only an explicit download allowlist.
 */
import {createServer,request as httpRequest} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export function createPreviewServer({upstream='http://127.0.0.1:3000',downloadsDirectory='/workspace/library-files/lvc-delivery'}={}){
    const destination=new URL(upstream);
    if(!['127.0.0.1','localhost','[::1]'].includes(destination.hostname))throw new Error('Preview upstream must be local');
    const files={
        '/downloads/source.zip':{name:'LearningPassport-source.zip',type:'application/zip'},
        '/downloads/README.md':{name:'README.md',type:'text/markdown; charset=utf-8'},
        '/downloads/Assessment.md':{name:'Assessment.md',type:'text/markdown; charset=utf-8'},
        '/downloads/Verification-summary.json':{name:'Verification-summary.json',type:'application/json'}
    };
    return createServer(async(req,res)=>{
        try{
            const incoming=new URL(req.url,'http://'+req.headers.host);
            if(incoming.pathname in files){
                if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
                const file=files[incoming.pathname],path=resolve(downloadsDirectory,file.name);
                const metadata=await stat(path);
                res.writeHead(200,{'Content-Type':file.type,'Content-Disposition':'attachment; filename="'+file.name+'"','Content-Length':metadata.size,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
                res.end(req.method==='HEAD'?undefined:await readFile(path));return;
            }
            // Reject cross-origin browser writes at the preview boundary before mapping
            // the accepted same-origin request to the original loopback-only application.
            if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin){
                let permitted=false;
                try{permitted=new URL(req.headers.origin).host===req.headers.host;}catch{/* reject invalid origins */}
                if(!permitted){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Cross-origin preview request rejected'}));return;}
            }
            const headers={...req.headers,host:'localhost:'+destination.port};
            if(headers.origin)headers.origin='http://localhost:'+destination.port;
            const forwarded=httpRequest(new URL(req.url,destination),{method:req.method,headers},response=>{
                res.writeHead(response.statusCode,response.headers);response.pipe(res);
            });
            forwarded.on('error',()=>{
                if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});
                res.end(JSON.stringify({error:'The wallet upstream is unavailable'}));
            });
            req.pipe(forwarded);
        }catch{
            if(!res.headersSent)res.writeHead(404,{'Content-Type':'application/json'});
            res.end(JSON.stringify({error:'Requested preview file is unavailable'}));
        }
    });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
    const port=Number(process.env.PREVIEW_PORT??4173),host=process.env.PREVIEW_HOST??'0.0.0.0';
    const server=createPreviewServer({upstream:process.env.PREVIEW_UPSTREAM??'http://127.0.0.1:3000',downloadsDirectory:process.env.PREVIEW_DOWNLOADS_DIR??'/workspace/library-files/lvc-delivery'});
    server.listen(port,host,()=>console.log('Internal cloud wallet preview listening on '+host+':'+port+'; an authenticated platform-forwarded URL is required for device access.'));
}
