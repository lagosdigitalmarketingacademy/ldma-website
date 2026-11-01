// Optional online LDMA application intake. Do not enable until private storage,
// notification delivery, spam protection and consent have been tested end-to-end.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const plans=JSON.parse(readFileSync(new URL('../data/2027-programmes.json',import.meta.url),'utf8'));
const json=(res,status,data)=>res.status(status).setHeader('Cache-Control','no-store').setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(data));
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
// Upstash Marketplace exposes KV_REST_API_*; direct Upstash uses UPSTASH_REDIS_REST_*.
const redisConfig=()=>({url:process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN});
const originAllowed=origin=>!origin||['https://ldmacademy.com','https://www.ldmacademy.com','https://ldma-website.vercel.app'].includes(origin)||/^https:\/\/ldma-website-[a-z0-9-]+\.vercel\.app$/.test(origin);
async function checkLimit(req){
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const redis=redisConfig();
 const id=createHash('sha256').update(process.env.LDMA_RATE_LIMIT_SALT+':'+ip).digest('hex').slice(0,32);
 const code="local n=redis.call('INCR',KEYS[1]); if n == 1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
 for(const [key,limit,ttl] of [['ldma:apply:ip:'+id,5,3600],['ldma:apply:global',200,86400]]){
  const response=await fetch(redis.url,{method:'POST',headers:{Authorization:'Bearer '+redis.token,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',code,1,key,ttl]),signal:AbortSignal.timeout(3000)});
  if(!response.ok)throw new Error('Rate limit unavailable');
  const payload=await response.json();
  if(payload.error||!Number.isFinite(Number(payload.result)))throw new Error('Rate limit unavailable');
  if(Number(payload.result)>limit)return false;
 }
 return true;
}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!originAllowed(req.headers.origin))return json(res,403,{error:'Origin not allowed'});
 if(!String(req.headers['content-type']||'').toLowerCase().includes('application/json'))return json(res,415,{error:'Expected JSON'});
 if(Number(req.headers['content-length']||0)>10000)return json(res,413,{error:'Application is too long'});
 const redis=redisConfig();
 if(!process.env.VITE_SUPABASE_URL||!process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY||!redis.url||!redis.token||!process.env.LDMA_RATE_LIMIT_SALT)
  return json(res,503,{error:'Online applications are not available yet. Please use the email option.'});
 let raw;
 try{raw=typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return json(res,400,{error:'Invalid application format'})}
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||JSON.stringify(raw).length>10000)return json(res,400,{error:'Invalid application'});
 if(clean(raw.website,100))return json(res,200,{ok:true}); // spam honeypot: no storage
 const programme=plans.programmes.find(p=>p.id===raw.programme);
 const session=programme?.sessions.find(s=>s.start===raw.cohort);
 const applicant_name=clean(raw.fullName,120),applicant_email=clean(raw.email,200).toLowerCase(),applicant_phone=clean(raw.phone,30),learning_goal=clean(raw.goal,1200);
 const occupation=clean(raw.occupation,100);
 if(!programme||!session||applicant_name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicant_email)||applicant_phone.length<7||learning_goal.length<10||raw.consent!==true)
  return json(res,400,{error:'Please complete all required details and consent before submitting.'});
 const data={programme_id:programme.id,cohort_start:session.start,applicant_name,applicant_email,applicant_phone,occupation,learning_goal,consent_to_contact:true,source:'website_2027'};
 try{
  if(!await checkLimit(req))return json(res,429,{error:'Too many application requests. Please email LDMA instead.'});
  const response=await fetch(process.env.VITE_SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/ldma_training_applications',{method:'POST',headers:{apikey:process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(data),signal:AbortSignal.timeout(6500)});
  if(!response.ok)return json(res,503,{error:'Online applications are temporarily unavailable. Please use the email option.'});
  const inserted=await response.json();
  const id=Array.isArray(inserted)?inserted[0]?.id:null;
  if(!id)return json(res,503,{error:'Application confirmation unavailable. Contact LDMA before submitting again.'});
  return json(res,201,{ok:true,reference:'LDMA-'+String(id).slice(0,8).toUpperCase(),message:'Application enquiry received for review. This is not a reserved seat or a payment confirmation.'});
 }catch{return json(res,503,{error:'Online applications are temporarily unavailable. Please use the email option.'})}
}
