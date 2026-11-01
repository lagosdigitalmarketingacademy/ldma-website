import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const data=JSON.parse(readFileSync(new URL('../data/2027-programmes.json',import.meta.url),'utf8'));
const calendar=readFileSync(new URL('../calendar/index.html',import.meta.url),'utf8');
const battleship=readFileSync(new URL('../battleship/index.html',import.meta.url),'utf8');
const parse=s=>new Date(s+'T12:00:00Z');
const dateString=d=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}).format(parse(d));
const fee=n=>'₦'+n.toLocaleString('en-NG');
const dateRange=(a,b)=>a===b?dateString(a)+' 2027':dateString(a)+' – '+dateString(b)+' 2027';
const dayOf=d=>parse(d).getUTCDay();

test('2027 pricing is a proposed plan, not a live booking offer',()=>{
 assert.equal(data.year,2027);
 assert.equal(data.status,'proposed');
 assert.match(calendar,/PLANNING PREVIEW/);
 assert.match(calendar,/NOT OPEN FOR PAYMENT/);
 assert.match(calendar,/subject to LDMA/);
});
test('all six planned programmes and twenty sessions appear in the calendar',()=>{
 assert.equal(data.programmes.length,6);
 assert.equal(data.programmes.reduce((sum,p)=>sum+p.sessions.length,0),20);
 for(const p of data.programmes){
  assert.ok(calendar.includes(p.name),p.name+' missing');
  assert.ok(calendar.includes(fee(p.fee_naira)),p.name+' fee missing');
  for(const s of p.sessions){
   assert.ok(calendar.includes(dateRange(s.start,s.end)),p.name+' date missing: '+s.start);
   assert.ok(s.start.startsWith('2027-')&&s.end.startsWith('2027-'));
   assert.ok(parse(s.start)<=parse(s.end));
  }
 }
});
test('Battleship cohorts contain exactly seven Saturdays, with the May 1 holiday break',()=>{
 const p=data.programmes.find(p=>p.id==='battleship');
 assert.equal(p.fee_naira,250000);
 assert.equal(p.sessions.length,4);
 for(const s of p.sessions){
  assert.equal(dayOf(s.start),6);
  assert.equal(dayOf(s.end),6);
  const weeks=(parse(s.end)-parse(s.start))/(7*86400000);
  assert.equal(weeks+1-(s.skip?.length??0),7);
  for(const skipped of s.skip??[]){
   assert.equal(dayOf(skipped),6);
   assert.ok(parse(skipped)>parse(s.start)&&parse(skipped)<parse(s.end));
  }
 }
 assert.ok(battleship.includes('₦250,000'));
 assert.ok(battleship.includes('/calendar/'));
});
test('weekend and weekday intensives match their advertised formats',()=>{
 for(const p of data.programmes){
  for(const s of p.sessions){
   if(p.id==='mini'){
    assert.equal(dayOf(s.start),6);
    assert.equal(dayOf(s.end),0);
    assert.equal((parse(s.end)-parse(s.start))/86400000,1);
   }else if(p.id==='ikorodu'){
    assert.equal(dayOf(s.start),1);
    assert.equal(dayOf(s.end),4);
    assert.equal((parse(s.end)-parse(s.start))/86400000,3);
   }else if(!['battleship'].includes(p.id)){
    assert.equal(s.start,s.end);
    assert.equal(dayOf(s.start),6);
   }
  }
 }
});
test('planned classes do not compete for the same calendar day',()=>{
 const occupied=new Map();
 for(const p of data.programmes){
  for(const s of p.sessions){
   for(let t=parse(s.start).getTime();t<=parse(s.end).getTime();t+=86400000){
    const d=new Date(t).toISOString().slice(0,10);
    if((s.skip??[]).includes(d))continue;
    if(p.id==='battleship'&&new Date(t).getUTCDay()!==6)continue;
    assert.ok(!occupied.has(d),p.name+' overlaps '+occupied.get(d)+' on '+d);
    occupied.set(d,p.name);
   }
  }
 }
});
test('all enquiry links are email-first and do not imply completed payment',()=>{
 assert.ok(calendar.includes('mailto:info@ldmacademy.com'));
 assert.ok(calendar.includes('press Send in your email application'));
 assert.ok(!calendar.includes('Pay now'));
});
