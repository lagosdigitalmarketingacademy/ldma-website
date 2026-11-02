import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('apply/index.html');
const js=read('apply/main.js');
const home=read('src/App.jsx');
const calendar=read('calendar/index.html');
const battleship=read('battleship/index.html');
const plans=JSON.parse(read('data/2027-programmes.json'));

test('application form has course, cohort, contact, goal and explicit consent',()=>{
 for(const field of ['id="programme"','id="cohort"','id="full-name"','id="email"','id="phone"','id="goal"','id="consent"'])
  assert.ok(html.includes(field),field+' missing');
 assert.ok(html.includes('No payment is requested'));
 assert.ok(html.includes('No seat has been reserved')||html.includes('NO SEAT RESERVED'));
 assert.ok(html.includes('/privacy/'));
});
test('application page uses programme planning data, not duplicate hard-coded dates',()=>{
 assert.ok(js.includes("import plans from '../data/2027-programmes.json'"));
 assert.equal(plans.programmes.find(p=>p.id==='battleship').fee_naira,250000);
 assert.ok(js.includes("p.id==='battleship'?'AGREED"));
});
test('email handoff never claims an application was submitted automatically',()=>{
 assert.ok(js.includes('mailto:info@ldmacademy.com'));
 assert.ok(js.includes('You must press Send'));
 assert.ok(js.includes('not submitted'));
 assert.ok(html.includes('PREPARE APPLICATION EMAIL'));
 assert.ok(!html.includes('Pay Now'));
});
test('2027 courses have clear paths into application journey',()=>{
 assert.ok(home.includes('/apply/'));
 assert.ok(battleship.includes('/apply/?programme=battleship'));
 assert.ok(calendar.includes('/apply/?programme=battleship&amp;cohort=2027-01-30'));
 const count=(calendar.match(/START APPLICATION ↗/g)||[]).length;
 assert.equal(count,20);
});
