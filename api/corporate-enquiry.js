// Public corporate enquiry endpoint. Stores enquiries in a restricted Supabase table.
// Requires LDMA_SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL on Vercel.
// Do not expose the service role key to client-side code.
const json=(res,status,data)=>res.status(status).setHeader('Cache-Control','no-store').setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(data));
const isEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean=(v,max=250)=>typeof v==='string'?v.trim().slice(0,max):'';
const allowedFocus=['strategy','performance','ai','conversion'];
const allowedFormat=['In-person workshop','On-site at our organisation','Hybrid','Virtual','Not sure yet'];
const allowedSize=['1–5','6–15','16–30','31–60','61–100','100+'];
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!process.env.VITE_SUPABASE_URL||!process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY)return json(res,503,{error:'Online enquiries are being configured. Please use the email option.'});
 try{
  const length=Number(req.headers['content-length']||0);
  if(length>10000)return json(res,413,{error:'Your enquiry is too long.'});
  const raw=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(clean(raw.website))return json(res,200,{ok:true});
  const d={organisation:clean(raw.organisation,150),contact_name:clean(raw.name,100),contact_email:clean(raw.email,200).toLowerCase(),contact_phone:clean(raw.phone,35),industry:clean(raw.industry,100),team_size:clean(raw.teamSize,20),training_focus:clean(raw.focus,30),business_challenge:clean(raw.challenge,2000),delivery_format:clean(raw.format,60),preferred_timeline:clean(raw.timeline,100),indicative_budget:clean(raw.budget,100),source:'corporate_landing_2027'};
  if(!d.organisation||!d.contact_name||!isEmail(d.contact_email)||!d.industry||!allowedSize.includes(d.team_size)||!allowedFocus.includes(d.training_focus)||d.business_challenge.length<15||!allowedFormat.includes(d.delivery_format)||raw.consent!==true)return json(res,400,{error:'Please complete all required fields and agree to be contacted.'});
  const endpoint=process.env.VITE_SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/ldma_corporate_enquiries';
  const response=await fetch(endpoint,{method:'POST',headers:{apikey:process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(d),signal:AbortSignal.timeout(6000)});
  if(!response.ok)return json(res,503,{error:'Online submission is temporarily unavailable. Please email your brief instead.'});
  return json(res,201,{ok:true});
 }catch{return json(res,503,{error:'Unable to submit right now. Please email your brief instead.'})}
}
