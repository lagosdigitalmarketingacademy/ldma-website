// One-time preview-only end-to-end connectivity check.
// Protected against repeated model calls by an atomic 24-hour Redis SET NX lock.
// Remove this temporary endpoint after the check.
import adviser from './adviser.js';
const respond=(res,status,data)=>res.status(status).setHeader('Content-Type','application/json').setHeader('Cache-Control','no-store').end(JSON.stringify(data));
export default async function handler(req,res){
 if(req.method!=='GET'||process.env.VERCEL_ENV!=='preview')return respond(res,404,{error:'Not found'});
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 const gatewayAuth=Boolean(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN);
 const ready={redis:!!(url&&token),model:!!process.env.AI_GATEWAY_MODEL,gatewayAuth,preview:true};
 if(!ready.redis||!ready.model||!ready.gatewayAuth)return respond(res,503,{ready,error:'Preview AI configuration incomplete'});
 try{
  const lock=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['SET','ldma:ai:one-time-smoke:2026-11-01:6e42e3d7','1','EX',86400,'NX']),signal:AbortSignal.timeout(3000)});
  if(!lock.ok)return respond(res,503,{ready,error:'Redis connectivity check failed'});
  const result=await lock.json();
  if(result.error)return respond(res,503,{ready,error:'Redis connectivity check failed'});
  if(result.result!=='OK')return respond(res,409,{ready,error:'One-time AI test already used'});
  let outcome={status:500,data:{error:'No result'}};
  const mock={
   status(n){outcome.status=n;return this},
   setHeader(){return this},
   end(body){try{outcome.data=JSON.parse(body)}catch{outcome.data={error:'Malformed result'}}return this}
  };
  await adviser({method:'POST',headers:{origin:'https://ldmacademy.com','content-type':'application/json'},socket:{remoteAddress:'ldma-smoke'},body:{message:'I run a clothing business in Lagos. My Instagram videos get views but very few orders. What should I check first?',history:[]}},mock);
  return respond(res,outcome.status,{ready,aiStatus:outcome.status,reply:outcome.data.reply||null,code:outcome.data.code||null,error:outcome.data.error||null});
 }catch{return respond(res,503,{ready,error:'One-time connectivity test failed'})}
}
