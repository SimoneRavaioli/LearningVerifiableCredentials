import {createApp} from './app.mjs';
import {resolve} from 'node:path';
const port=Number(process.env.PORT??3000);
const host=process.env.HOST??'127.0.0.1';
if(!['127.0.0.1','localhost','::1'].includes(host)&&(!process.env.ISSUER_PASSWORD||!process.env.HOLDER_PASSWORD||!process.env.EMPLOYER_PASSWORD))throw new Error('Set all three role passwords before binding beyond loopback');
const baseUrl=process.env.BASE_URL??'http://localhost:'+port;
const {app,service}=await createApp({directory:resolve(process.env.DATA_DIR??'.data'),baseUrl});
const refresh=setInterval(()=>service.refreshPublished().catch(()=>console.error('Published status/trust refresh failed; stale data will fail verification')),3600000);refresh.unref();
app.listen(port,host,()=>console.log('Education wallet available at '+baseUrl));
