import test,{beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/student-application.js';

const keys=['VITE_SUPABASE_URL','LDMA_SUPABASE_SERVICE_ROLE_KEY','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','KV_REST_API_URL','KV_REST_API_TOKEN','LDMA_RATE_LIMIT_SALT'];
const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
const oldFetch=globalThis.fetch;
const example={programme:'battleship',cohort:'2027-01-30',fullName:'Ada Example',email:'ada@example.com',phone:'08012345678',occupation:'Business owner',goal:'I want to build a stronger marketing strategy for my shop.',consent:true,website:''};
const req=(body=example,more={})=>({method:'POST',headers:{origin:'https://ldmacademy.com','content-type':'application/json'},socket:{remoteAddress:'127.0.0.1'},body,...more});
const res=()=>({code:200,data:null,status(n){this.code=n;return this},setHeader(){return this},end(x){this.data=JSON.parse(x);return this}});
async function call(request){const out=res();await handler(request,out);return out}
beforeEach(()=>{
 process.env.VITE_SUPABASE_URL='https://example.supabase.co';
 process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY='server-only-test';
 process.env.UPSTASH_REDIS_REST_URL='https://redis.example.invalid';
 process.env.UPSTASH_REDIS_REST_TOKEN='test-redis';
 process.env.LDMA_RATE_LIMIT_SALT='test-salt';
 globalThis.fetch=async url=>String(url).includes('redis')?{ok:true,json:async()=>({result:1})}:{ok:true,json:async()=>[{id:'12345678-aaaa-bbbb-cccc-000000000000'}]};
});
afterEach(()=>{for(const k of keys){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k]}globalThis.fetch=oldFetch});
test('fails closed without database credentials',async()=>{
 delete process.env.LDMA_SUPABASE_SERVICE_ROLE_KEY;
 const r=await call(req());assert.equal(r.code,503);
});
test('recognises Vercel Marketplace KV_REST_API credentials',async()=>{
 process.env.KV_REST_API_URL='https://kv-redis.example.invalid';
 process.env.KV_REST_API_TOKEN='marketplace-token';
 delete process.env.UPSTASH_REDIS_REST_URL;
 delete process.env.UPSTASH_REDIS_REST_TOKEN;
 let redisCalls=0;
 globalThis.fetch=async(url,opts)=>{
  if(String(url).includes('kv-redis')){redisCalls++;assert.equal(opts.headers.Authorization,'Bearer marketplace-token');return {ok:true,json:async()=>({result:1})};}
  return {ok:true,json:async()=>[{id:'12345678-aaaa-bbbb-cccc-000000000000'}]};
 };
 const x=await call(req());
 assert.equal(x.code,201);
 assert.equal(redisCalls,2);
});
test('rejects invalid methods, origins and JSON',async()=>{
 assert.equal((await call(req(example,{method:'GET'}))).code,405);
 assert.equal((await call(req(example,{headers:{origin:'https://bad.example','content-type':'application/json'}}))).code,403);
 assert.equal((await call(req('{bad json'))).code,400);
});
test('rejects unknown cohort, missing consent and incomplete details',async()=>{
 assert.equal((await call(req({...example,cohort:'2027-01-31'}))).code,400);
 assert.equal((await call(req({...example,programme:'made-up'}))).code,400);
 assert.equal((await call(req({...example,consent:false}))).code,400);
 assert.equal((await call(req({...example,email:'not-an-email'}))).code,400);
});
test('honeypot ignores spam without writing data',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return {ok:true}};
 const r=await call(req({...example,website:'spam'}));
 assert.equal(r.code,200);assert.equal(calls,0);
});
test('valid enquiry is stored privately and returns review reference, not payment status',async()=>{
 let sent;globalThis.fetch=async(url,opts)=>{
  if(String(url).includes('redis'))return {ok:true,json:async()=>({result:1})};
  sent=JSON.parse(opts.body);
  assert.equal(opts.headers.apikey,'server-only-test');
  return {ok:true,json:async()=>[{id:'12345678-aaaa-bbbb-cccc-000000000000'}]};
 };
 const r=await call(req());
 assert.equal(r.code,201);assert.equal(r.data.reference,'LDMA-12345678');
 assert.equal(sent.programme_id,'battleship');
 assert.equal(sent.cohort_start,'2027-01-30');
 assert.equal(sent.applicant_email,'ada@example.com');
 assert.equal(sent.status,undefined);
 assert.match(r.data.message,/not a reserved seat/);
});
test('rejects abuse and never invents success if database fails',async()=>{
 globalThis.fetch=async()=>({ok:true,json:async()=>({result:6})});
 assert.equal((await call(req())).code,429);
 globalThis.fetch=async url=>String(url).includes('redis')?{ok:true,json:async()=>({result:1})}:{ok:false};
 assert.equal((await call(req())).code,503);
});
