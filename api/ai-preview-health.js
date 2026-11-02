// Temporary preview diagnostic. Does not reveal credentials or invoke the paid AI model.
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
 return send(res,200,{preview:true,redisConnected:redisOk,modelSelected:hasModel,aiGatewayAuthenticated:hasAuth,ready:redisOk&&hasModel&&hasAuth});
}
