import test,{beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/corporate-enquiry.js';

const keys=['VITE_SUPABASE_URL','LDMA_SUPABASE_SERVICE_ROLE_KEY','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','LDMA_RATE_LIMIT_SALT'];
const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
const oldFetch=globalThis.fetch;
const sample={
 organisation:'Example Ltd',name:'Ada Example',email:'ada@example.com',phone:'08000000000',
 industry:'Retail & e-commerce',teamSize:'6–15',focus:'strategy',
 challenge:'Our team needs to improve customer insight and marketing measurement.',
 format:'In-person workshop',timeline:'Q1',budget:'Not decided',consent:true,website:''
};
function request(body=sample,overrides={}){
 return {method:'POST',headers:{'content-type':'application/json',origin:'https://ldmacademy.com'},body,socket:{remoteAddress:'127.0.0.1'},...overrides};
}
function response(){
 return {code:200,headers:{},payload:null,status(n){this.code=n;return this},setHeader(k,v){this.headers[k]=v;return this},end(s){this.payload=JSON.parse(s);return this}};
}
async function run(req){const res=response();await handler(req,res);return res}
beforeEach(()=>{
 process.env.VITE_SUPABASE_URL='https://example.supabase.co';
 process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY='test-server-only';
 process.env.UPSTASH_REDIS_REST_URL='https://example.redis.invalid';
 process.env.UPSTASH_REDIS_REST_TOKEN='test-token';
 process.env.LDMA_RATE_LIMIT_SALT='test-salt';
 globalThis.fetch=async url=>String(url).includes('redis')?{ok:true,json:async()=>({result:1})}:{ok:true};
});
afterEach(()=>{
 for(const k of keys){if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k]}
 globalThis.fetch=oldFetch;
});

test('rejects non-POST requests',async()=>{
 const res=await run(request(sample,{method:'GET'}));
 assert.equal(res.code,405);
});
test('refuses intake when server-only protection is missing',async()=>{
 delete process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY;
 const res=await run(request());
 assert.equal(res.code,503);
});
test('rejects unapproved browser origins',async()=>{
 const res=await run(request(sample,{headers:{'content-type':'application/json',origin:'https://untrusted.example'}}));
 assert.equal(res.code,403);
});
test('rejects invalid content types',async()=>{
 const res=await run(request(sample,{headers:{'content-type':'text/plain'}}));
 assert.equal(res.code,415);
});
test('rejects malformed JSON',async()=>{
 const res=await run(request('{bad json'));
 assert.equal(res.code,400);
});
test('validates required business details and consent',async()=>{
 const res=await run(request({...sample,consent:false}));
 assert.equal(res.code,400);
});
test('silently accepts honeypot spam without writing',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return {ok:true}};
 const res=await run(request({...sample,website:'spam'}));
 assert.equal(res.code,200);assert.equal(calls,0);
});
test('saves a valid enquiry after two successful rate-limit checks',async()=>{
 const calls=[];globalThis.fetch=async(url,opts)=>{calls.push({url:String(url),opts});return String(url).includes('redis')?{ok:true,json:async()=>({result:1})}:{ok:true}};
 const res=await run(request());
 assert.equal(res.code,201);assert.equal(res.payload.ok,true);
 assert.equal(calls.length,3);
 const sent=JSON.parse(calls[2].opts.body);
 assert.equal(sent.contact_email,'ada@example.com');
 assert.equal(sent.source,'corporate_landing_2027');
 assert.ok(!('consent' in sent));
});
test('rejects enquiries when the rate limit is reached',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return {ok:true,json:async()=>({result:6})}};
 const res=await run(request());
 assert.equal(res.code,429);assert.equal(calls,1);
});
test('fails closed when rate-limit service is unavailable',async()=>{
 globalThis.fetch=async()=>({ok:false});
 const res=await run(request());
 assert.equal(res.code,503);
});
test('does not report success when Supabase rejects the write',async()=>{
 globalThis.fetch=async url=>String(url).includes('redis')?{ok:true,json:async()=>({result:1})}:{ok:false};
 const res=await run(request());
 assert.equal(res.code,503);
});
