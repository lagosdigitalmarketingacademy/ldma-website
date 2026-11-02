// LDMA corporate enquiries. Disabled until the correct database and rate limiting are configured.
// Server-only secrets must NEVER be prefixed with VITE_ or included in browser bundles.
import {createHash} from 'node:crypto';
const json=(res,status,data)=>res.status(status).setHeader('Cache-Control','no-store').setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(data));
const isEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean=(v,max=250)=>typeof v==='string'?v.trim().slice(0,max):'';
const allowedFocus=['strategy','performance','ai','conversion'];
const allowedFormat=['In-person workshop','On-site at our organisation','Hybrid','Virtual','Not sure yet'];
const allowedSize=['1–5','6–15','16–30','31–60','61–100','100+'];
const originAllowed=origin=>!origin||['https://ldmacademy.com','https://www.ldmacademy.com','https://ldma-website.vercel.app'].includes(origin)||/^https:\/\/ldma-website-[a-z0-9-]+\.vercel\.app$/.test(origin);

async function withinRateLimit(req){
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const fingerprint=createHash('sha256').update(process.env.LDMA_RATE_LIMIT_SALT+':'+ip).digest('hex').slice(0,32);
 const code="local n=redis.call('INCR',KEYS[1]); if n == 1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
 const rules=[['ldma:corporate:ip:'+fingerprint,5,3600],['ldma:corporate:global',200,86400]];
 for(const [key,limit,ttl] of rules){
  const response=await fetch(process.env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{Authorization:'Bearer '+process.env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',code,1,key,ttl]),signal:AbortSignal.timeout(3000)});
  if(!response.ok)throw new Error('Rate limit unavailable');
  const data=await response.json();
  if(data.error||!Number.isFinite(Number(data.result)))throw new Error('Rate limit unavailable');
  if(Number(data.result)>limit)return false;
 }
 return true;
}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!originAllowed(req.headers.origin))return json(res,403,{error:'Origin not allowed'});
 if(!String(req.headers['content-type']||'').toLowerCase().includes('application/json'))return json(res,415,{error:'Please send JSON'});
 if(!process.env.VITE_SUPABASE_URL||!process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY||!process.env.UPSTASH_REDIS_REST_URL||!process.env.UPSTASH_REDIS_REST_TOKEN||!process.env.LDMA_RATE_LIMIT_SALT)return json(res,503,{error:'Online enquiries are being configured. Please use the email option.'});
 const length=Number(req.headers['content-length']||0);
 if(length>10000)return json(res,413,{error:'Your enquiry is too long.'});
 let raw;
 try{raw=typeof req.body==='string'?JSON.parse(req.body):req.body||{}}
 catch{return json(res,400,{error:'Invalid enquiry format.'})}
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||JSON.stringify(raw).length>10000)return json(res,400,{error:'Invalid or oversized enquiry.'});
 // Honeypot for automated submissions. No customer information is stored.
 if(clean(raw.website))return json(res,200,{ok:true});
 const d={organisation:clean(raw.organisation,150),contact_name:clean(raw.name,100),contact_email:clean(raw.email,200).toLowerCase(),contact_phone:clean(raw.phone,35),industry:clean(raw.industry,100),team_size:clean(raw.teamSize,20),training_focus:clean(raw.focus,30),business_challenge:clean(raw.challenge,2000),delivery_format:clean(raw.format,60),preferred_timeline:clean(raw.timeline,100),indicative_budget:clean(raw.budget,100),source:'corporate_landing_2027'};
 if(!d.organisation||!d.contact_name||!isEmail(d.contact_email)||!d.industry||!allowedSize.includes(d.team_size)||!allowedFocus.includes(d.training_focus)||d.business_challenge.length<15||!allowedFormat.includes(d.delivery_format)||raw.consent!==true)return json(res,400,{error:'Please complete all required fields and agree to be contacted.'});
 try{
  if(!await withinRateLimit(req))return json(res,429,{error:'Too many enquiries from this connection. Please email your brief instead.'});
  const endpoint=process.env.VITE_SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/ldma_corporate_enquiries';
  const response=await fetch(endpoint,{method:'POST',headers:{apikey:process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(d),signal:AbortSignal.timeout(6000)});
  if(!response.ok)return json(res,503,{error:'Online submission is temporarily unavailable. Please email your brief instead.'});
  return json(res,201,{ok:true});
 }catch{return json(res,503,{error:'Unable to submit right now. Please email your brief instead.'})}
}
