import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=process.cwd();
const read=p=>readFileSync(resolve(root,p),'utf8');
const pages=[
 'index.html','for-business/index.html','insights/index.html',
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
for(const href of ['/for-business/','/insights/','#programmes']){
 if(!main.includes(href))errors.push('Main navigation missing: '+href);
}
for(const marker of ['id="solutions"','id="corporate-enquiry"','id="how-it-works"','id="questions"']){
 if(!business.includes(marker))errors.push('Corporate anchor missing: '+marker);
}
if(!business.includes('info@ldmacademy.com'))errors.push('Confirmed corporate email missing');
if(!business.includes('state===\'error\''))errors.push('Email fallback on failed submission missing');
if(!existsSync(resolve(root,'api/corporate-enquiry.js')))errors.push('Enquiry API handler missing');
if(!existsSync(resolve(root,'supabase/corporate_enquiries.sql')))errors.push('Lead storage schema missing');
if(errors.length){console.error('LDMA site check failed:\n'+errors.map(x=>' - '+x).join('\n'));process.exit(1)}
console.log('LDMA site check passed: '+pages.length+' pages, key navigation and enquiry fallback verified.');
