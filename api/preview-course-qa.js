// Temporary one-time Preview QA: remove immediately after validating a course recommendation.
import adviser from './adviser.js';
const send=(res,status,body)=>res.status(status).setHeader('Content-Type','application/json').setHeader('Cache-Control','no-store').end(JSON.stringify(body));
export default async function handler(req,res){
 if(req.method!=='GET'||process.env.VERCEL_ENV!=='preview')return send(res,404,{error:'Not found'});
 const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
 const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!url||!token)return send(res,503,{error:'Not configured'});
 try{
  const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(['SET','ldma:course-adviser:qa:20261102','used','EX',86400,'NX']),signal:AbortSignal.timeout(3000)});
  const v=r.ok?await r.json():{};
  if(v.result!=='OK')return send(res,409,{error:'Test already run'});
  const result={status:0,body:{}};
  const mock={status(code){result.status=code;return this},setHeader(){return this},end(data){try{result.body=JSON.parse(data)}catch{}return this}};
  await adviser({method:'POST',headers:{origin:'https://ldmacademy.com','content-type':'application/json'},socket:{remoteAddress:'preview-course-qa'},body:{message:'My Lagos clothing business gets many Instagram views but few purchases. What am I doing wrong?',history:[]}},mock);
  return send(res,200,{status:result.status,mode:result.body.mode||null,answer:result.body.reply?.slice(0,2000)||null,error:result.body.code||result.body.error||null});
 }catch{return send(res,503,{error:'QA unavailable'})}
}
