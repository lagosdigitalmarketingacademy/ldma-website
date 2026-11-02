// Temporary one-use preview-only connectivity diagnostic; remove after testing.
import adviser from './adviser.js';
const reply=(res,status,data)=>res.status(status).setHeader('Content-Type','application/json').setHeader('Cache-Control','no-store').end(JSON.stringify(data));
export default async function handler(req,res){
 if(req.method!=='GET'||process.env.VERCEL_ENV!=='preview')return reply(res,404,{error:'Not found'});
 const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
 const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!url||!token||!process.env.AI_GATEWAY_API_KEY||!process.env.AI_GATEWAY_MODEL)return reply(res,503,{error:'Configuration incomplete'});
 try{
  const lock=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['SET','ldma:preview:ai:smoke:20261102:1','1','EX',86400,'NX']),signal:AbortSignal.timeout(3000)});
  const lockData=lock.ok?await lock.json():{};
  if(lockData.result!=='OK')return reply(res,409,{error:'Diagnostic already run'});
  const output={status:500,data:{}};
  const mock={status(code){output.status=code;return this},setHeader(){return this},end(body){try{output.data=JSON.parse(body)}catch{output.data={error:'Invalid JSON'}}return this}};
  await adviser({method:'POST',headers:{origin:'https://ldmacademy.com','content-type':'application/json'},socket:{remoteAddress:'preview-smoke-test'},body:{message:'I sell clothes in Lagos and my Instagram videos get views but very few orders. What should I investigate first?',history:[]}},mock);
  return reply(res,200,{adviserStatus:output.status,mode:output.data.mode||null,answer:typeof output.data.reply==='string'?output.data.reply.slice(0,2500):null,errorCode:output.data.code||null,error:output.data.error||null});
 }catch{return reply(res,503,{error:'Diagnostic unavailable'})}
}
