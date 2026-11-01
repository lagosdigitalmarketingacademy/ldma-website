import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=process.cwd();
const read=p=>readFileSync(resolve(root,p),'utf8');
const pages=[
 'index.html','for-business/index.html','battleship/index.html','calendar/index.html','insights/index.html',
 'insights/why-instagram-views-dont-become-sales/index.html',
 'insights/how-to-build-a-marketing-plan-in-nigeria/index.html',
 'insights/practical-ai-for-nigerian-business-teams/index.html','privacy/index.html'
];
const errors=[];
for(const p of pages){
 if(!existsSync(resolve(root,p))){errors.push('Missing page: '+p);continue}
 const html=read(p);
 if(!html.includes('<title>'))errors.push('Missing title: '+p);
 if(!html.includes('name="description"'))errors.push('Missing description: '+p);
 if(!html.includes('lang="en"'))errors.push('Missing language: '+p);
}
const main=read('src/App.jsx');
const business=read('src/CorporatePage.jsx');
const portal=read('src/Portal.jsx');
const store=read('src/Store.jsx');
const api=read('api/corporate-enquiry.js');
const calendar=read('calendar/index.html');
for(const href of ['/for-business/','/insights/','#programmes']){
 if(!main.includes(href))errors.push('Main navigation missing: '+href);
}
for(const marker of ['id="solutions"','id="corporate-enquiry"','id="how-it-works"','id="questions"']){
 if(!business.includes(marker))errors.push('Corporate anchor missing: '+marker);
}
if(!business.includes('info@ldmacademy.com'))errors.push('Confirmed corporate email missing');
if(!main.includes('/calendar/'))errors.push('2027 training calendar not linked from homepage');
if(!read('battleship/index.html').includes('/calendar/'))errors.push('2027 calendar not linked from Battleship page');
if(!calendar.includes('PLANNING PREVIEW')||!calendar.includes('NOT OPEN FOR PAYMENT'))errors.push('Unconfirmed 2027 dates/fees are not clearly labelled');
if(!calendar.includes('mailto:info@ldmacademy.com'))errors.push('2027 course enquiry email link missing');
if(!calendar.includes('3 Apr – 22 May 2027'))errors.push('Q2 Battleship date missing from proposed calendar');
if(!business.includes('state===\'error\''))errors.push('Email fallback on failed submission missing');
if(!existsSync(resolve(root,'api/corporate-enquiry.js')))errors.push('Enquiry API handler missing');
if(!existsSync(resolve(root,'supabase/corporate_enquiries.sql')))errors.push('Lead storage schema missing');
if(!portal.includes("VITE_PORTAL_ENABLED==='true'"))errors.push('Unverified portal is not feature gated');
if(!store.includes("VITE_CATALOGUE_ENABLED==='true'"))errors.push('Unverified catalogue is not feature gated');
if(!store.includes("VITE_ADVISER_AI_ENABLED==='true'"))errors.push('Unverified AI adviser is not feature gated');
if(!business.includes("VITE_CORPORATE_ENQUIRY_ENABLED==='true'"))errors.push('Corporate intake is not feature gated');
if(!api.includes('UPSTASH_REDIS_REST_TOKEN'))errors.push('Server-side enquiry rate limiting missing');
if(read('for-business/index.html').includes('ldma-website.vercel.app'))errors.push('Corporate OG URL uses stale preview domain');
if(!existsSync(resolve(root,'tests/corporate-enquiry.test.mjs')))errors.push('API regression tests missing');
if(errors.length){console.error('LDMA site check failed:\n'+errors.map(x=>' - '+x).join('\n'));process.exit(1)}
console.log('LDMA site check passed: '+pages.length+' pages, key navigation and enquiry fallback verified.');
