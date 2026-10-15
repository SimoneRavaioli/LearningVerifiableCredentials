import express from 'express';
import helmet from 'helmet';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {join} from 'node:path';
import {createService,digest} from './service.mjs';
import {diplomaSchema} from './model.mjs';

export async function createApp(options){
    const service=await createService(options);
    const app=express(),sessions=new Map(),attempts=new Map();
    app.disable('x-powered-by');
    app.use(helmet({contentSecurityPolicy:{directives:{"default-src":["'self'"],"script-src":["'self'"],"style-src":["'self'"],"img-src":["'self'","data:"],"connect-src":["'self'"],"upgrade-insecure-requests":null}},hsts:false}));
    app.use(express.json({limit:'2mb'}));
    app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
    app.use((req,res,next)=>{
        if(!['GET','HEAD','OPTIONS'].includes(req.method)){
            const origin=req.get('Origin');
            if(origin&&origin!==new URL(options.baseUrl).origin)return res.status(403).json({error:'Cross-origin requests are rejected'});
        }
        next();
    });
    const passwords={
        issuer:process.env.ISSUER_PASSWORD??'university-demo-change-me',
        holder:process.env.HOLDER_PASSWORD??'learner-demo-change-me',
        employer:process.env.EMPLOYER_PASSWORD??'employer-demo-change-me'
    };
    app.post('/api/login',(req,res)=>{
        const key=req.ip,attempt=attempts.get(key)??{count:0,until:Date.now()+60000};
        if(attempt.until<Date.now()){attempt.count=0;attempt.until=Date.now()+60000;}
        if(attempts.size>1000)attempts.clear();
        attempt.count++;attempts.set(key,attempt);
        if(attempt.count>20)return res.status(429).json({error:'Too many login attempts; wait one minute'});
        const {role,password}=req.body??{};
        const expected=passwords[role];
        const actual=typeof password==='string'?Buffer.from(password):Buffer.alloc(0);
        if(!expected||actual.length!==Buffer.byteLength(expected)||!timingSafeEqual(actual,Buffer.from(expected)))return res.status(401).json({error:'Incorrect role or password'});
        for(const [key,s] of sessions)if(s.expires<Date.now())sessions.delete(key);
        const id=randomBytes(32).toString('base64url'),csrf=randomBytes(32).toString('base64url');
        sessions.set(id,{role,csrf,expires:Date.now()+3600000});
        res.cookie('lvc_session',id,{httpOnly:true,sameSite:'strict',secure:options.baseUrl.startsWith('https:'),maxAge:3600000,path:'/'});
        res.json({role,csrf});
    });
    app.post('/api/logout',(req,res)=>{
        const id=/lvc_session=([^;]+)/.exec(req.get('Cookie')??'')?.[1];sessions.delete(id);
        res.clearCookie('lvc_session',{path:'/'});res.json({ok:true});
    });
    const auth=role=>(req,res,next)=>{
        const id=/lvc_session=([^;]+)/.exec(req.get('Cookie')??'')?.[1],session=sessions.get(id);
        if(!session||session.expires<Date.now())return res.status(401).json({error:'Sign in to continue'});
        if(role&&session.role!==role)return res.status(403).json({error:'This action is not permitted for your role'});
        if(req.method!=='GET'&&req.get('X-CSRF-Token')!==session.csrf)return res.status(403).json({error:'Invalid request token'});
        req.session=session;next();
    };
    app.get('/api/session',auth(),(req,res)=>res.json({role:req.session.role,csrf:req.session.csrf}));
    app.get('/api/info',(_req,res)=>res.json(service.publicInfo()));
    app.get('/api/state',auth(),(req,res)=>{
        const role=req.session.role;
        res.json({role,records:role==='employer'?[]:service.records(role),pending:role==='holder'?service.pending():[],requests:service.listRequests(role),info:service.publicInfo()});
    });
    app.post('/api/issue',auth('issuer'),async(req,res)=>res.json({credential:await service.issue(req.body)}));
    app.post('/api/status',auth('issuer'),async(req,res)=>res.json(await service.setStatus(req.body.credentialId,req.body.status)));
    app.post('/api/receive',auth('holder'),async(req,res)=>res.json({record:await service.receive(req.body.credentialId)}));
    app.post('/api/requests',auth('employer'),(req,res)=>res.json({request:service.createRequest(req.body)}));
    app.post('/api/disclosure',auth('holder'),(req,res)=>{
        const request=service.requests.get(req.body.requestId);
        if(!request||request.used||request.expiresAt<Date.now())return res.status(400).json({error:'Request expired or unknown'});
        const ids=req.body.credentialIds;
        if(!Array.isArray(ids)||ids.length<1||ids.length>10)return res.status(400).json({error:'Select 1–10 credentials'});
        const credentials=ids.map(id=>service.records('holder').find(r=>r.credential.id===id)?.credential);
        if(credentials.some(c=>!c))return res.status(400).json({error:'Credential not in wallet'});
        const publicRequest=structuredClone(request);delete publicRequest.presentation;
        res.json({request:publicRequest,credentials,disclosureDigest:digest({request:publicRequest,credentials})});
    });
    app.post('/api/present',auth('holder'),async(req,res)=>res.json({presentation:await service.present(req.body)}));
    app.post('/api/verify-request',auth('employer'),async(req,res)=>res.json(await service.verifyRequest(req.body.requestId,req.body.presentation)));
    app.post('/api/verify-credential',auth('employer'),async(req,res)=>res.json(await service.verifyCredential(req.body.credential)));
    app.get('/api/snapshots',auth('employer'),async(_req,res)=>res.json(await service.snapshots()));
    app.post('/api/backup',auth('holder'),(req,res)=>res.json({backup:service.exportBackup(req.body.password)}));
    app.post('/api/restore',auth('holder'),async(req,res)=>res.json(await service.restoreBackup(req.body.backup,req.body.password)));
    app.get('/public/trust',async(_req,res)=>res.json(await service.trust()));
    app.get('/public/status/:purpose',async(req,res)=>res.json(await service.statusList(req.params.purpose)));
    app.get('/public/schema',(_req,res)=>res.json(diplomaSchema));
    app.use(express.static(join(import.meta.dirname,'../dist'),{index:'index.html'}));
    app.use((error,_req,res,_next)=>{
        // Do not log request bodies, keys, credentials, passwords, or presentations.
        const safe=error.status===413?'Request is too large':error instanceof SyntaxError?'Invalid JSON':String(error.message??'Operation failed');
        res.status(error.status??400).json({error:safe});
    });
    return {app,service};
}
