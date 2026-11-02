// Temporary preview diagnostic. Does not reveal credentials or invoke the paid AI model.
import adviser from './adviser.js';
const send=(res,code,data)=>res.status(code).setHeader('Content-Type','application/json').setHeader('Cache-Control','no-store').end(JSON.stringify(data));
export default async function handler(req,res){
 if(req.method!=='GET'||process.env.VERCEL_ENV!=='preview')return send(res,404,{error:'Not found'});
 const redisUrl=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const redisToken=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 const hasAuth=Boolean(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN);
 const hasModel=Boolean(process.env.AI_GATEWAY_MODEL);
 let redisOk=false;
 if(redisUrl&&redisToken){
  try{
   const response=await fetch(redisUrl,{method:'POST',headers:{Authorization:'Bearer '+redisToken,'Content-Type':'application/json'},body:JSON.stringify(['PING']),signal:AbortSignal.timeout(2500)});
   const result=response.ok?await response.json():{};
   redisOk=result.result==='PONG';
  }catch{}
 }
 if(req.query?.test==='one-time'&&redisOk&&hasModel&&hasAuth){
  try{
   // Atomic, one-use-only gate. No visitor-controlled prompts or API secrets are exposed.
   const lock=await fetch(redisUrl,{method:'POST',headers:{Authorization:'Bearer '+redisToken,'Content-Type':'application/json'},body:JSON.stringify(['SET','ldma:ai:diagnostic:2026-11-02','used','EX',86400,'NX']),signal:AbortSignal.timeout(2500)});
   const result=lock.ok?await lock.json():{};
   if(result.result!=='OK')return send(res,409,{error:'One-time diagnostic already used'});
   const output={status:0,body:{}};
   const proxy={status(n){output.status=n;return this},setHeader(){return this},end(body){try{output.body=JSON.parse(body)}catch{output.body={error:'Invalid response'}}return this}};
   await adviser({method:'POST',headers:{origin:'https://ldmacademy.com','content-type':'application/json'},socket:{remoteAddress:'ldma-preview-diagnostic'},body:{message:'I own a clothing store in Lagos. My Instagram videos get views but few purchases. What should I investigate first?',history:[]}},proxy);
   return send(res,output.status,{aiStatus:output.status,answer:typeof output.body.reply==='string'?output.body.reply.slice(0,1800):null,code:output.body.code||null,error:output.body.error||null});
  }catch{return send(res,503,{error:'Diagnostic could not complete'})}
 }
 return send(res,200,{preview:true,redisConnected:redisOk,modelSelected:hasModel,aiGatewayAuthenticated:hasAuth,ready:redisOk&&hasModel&&hasAuth});
}
