import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read=path=>readFileSync(resolve(process.cwd(),path),'utf8');
const pages={
 '/':'index.html',
 '/battleship/':'battleship/index.html',
 '/calendar/':'calendar/index.html',
 '/apply/':'apply/index.html',
 '/for-business/':'for-business/index.html',
 '/insights/':'insights/index.html',
 '/insights/why-instagram-views-dont-become-sales/':'insights/why-instagram-views-dont-become-sales/index.html',
 '/insights/how-to-build-a-marketing-plan-in-nigeria/':'insights/how-to-build-a-marketing-plan-in-nigeria/index.html',
 '/insights/practical-ai-for-nigerian-business-teams/':'insights/practical-ai-for-nigerian-business-teams/index.html',
 '/privacy/':'privacy/index.html'
};
const home=read('src/App.jsx');
const finder=read('src/LeadTools.jsx');
const stories=read('src/Testimonials.jsx');
const business=read('src/CorporatePage.jsx');
const ids=source=>new Set([...source.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]));
const anchorMap=new Map(Object.entries(pages).map(([route,path])=>[route,ids(read(path))]));
const homeIds=anchorMap.get('/');
for(const id of ids(home))homeIds.add(id);
for(const id of ids(finder))homeIds.add(id);
for(const id of ids(stories))homeIds.add(id);
for(const m of home.matchAll(/\{id:'([^']+)',number:/g))homeIds.add(m[1]);
for(const id of ids(business))anchorMap.get('/for-business/').add(id);
for(const id of ids(stories))anchorMap.get('/battleship/').add(id);

const errors=[];
let checked=0;
function check(href,origin){
 if(!href||href==='#'){errors.push(origin+': empty or placeholder link '+href);return}
 if(/^(?:mailto:|tel:|https?:|data:)/.test(href))return;
 if(!href.startsWith('/')&&!href.startsWith('#'))return;
 const url=new URL(href,'https://ldma.local'+origin);
 const route=url.pathname;
 if(/\.(?:webp|png|jpg|jpeg|css|js|svg|ico)$/.test(route))return;
 checked++;
 if(!Object.hasOwn(pages,route)){errors.push(origin+': route does not exist: '+href);return}
 if(url.hash){
  const id=decodeURIComponent(url.hash.slice(1));
  if(!anchorMap.get(route).has(id))errors.push(origin+': anchor #'+id+' missing from '+route+' (link '+href+')');
 }
}
const hrefs=source=>[...source.matchAll(/\bhref=["']([^"']+)["']/g)].map(x=>x[1]);
for(const [route,path] of Object.entries(pages))for(const href of hrefs(read(path)))check(href,route);
for(const href of hrefs(home))check(href,'/');
for(const href of hrefs(finder))check(href,'/');
for(const href of hrefs(stories))check(href,'/');
for(const href of hrefs(business))check(href,'/for-business/');
for(const m of home.matchAll(/\['[^']+','([^']+)'\]/g))check(m[1],'/');
for(const m of home.matchAll(/(?:action|href):'([^']+)'/g))if(m[0].startsWith('href:'))check(m[1],'/');

const nav=home.match(/<nav className=\{open\?'nav open':'nav'\}[\s\S]*?<\/nav>/)?.[0]||'';
const navLinks=[...nav.matchAll(/\['([^']+)','([^']+)'\]/g)].map(m=>({label:m[1],href:m[2]}));
if(navLinks.length!==6)errors.push('Homepage should have six clear navigation destinations, found '+navLinks.length);
if(new Set(navLinks.map(x=>x.href)).size!==navLinks.length)errors.push('Homepage navigation has repeated destinations');
for(const label of ['Courses','Battleship','Dates & Fees','For Business','Trainee Videos','Resources'])if(!navLinks.some(x=>x.label===label))errors.push('Missing homepage navigation item: '+label);
if(!home.includes('href="/" className="logo"'))errors.push('Homepage logo must link to /');
if(!business.includes("const HOME='/';"))errors.push('Corporate logo home target is not /');
for(const route of Object.keys(pages).filter(x=>x!=='/'&&x!=='/for-business/')){
 const file=read(pages[route]);
 if(!/<a[^>]+href="\/"[^>]*>[\s\S]{0,140}<img[^>]+ldma-logo\.webp/.test(file))errors.push(route+': logo does not clearly link home');
}
for(const hidden of ['<Store/>','<Portal/>','id="career"','id="events"','href="#store"','href="#my-ldma"','href="#career"','href="#events"'])if(home.includes(hidden))errors.push('Unready module or dead link visible on homepage: '+hidden);
if(finder.includes('id="training-brief"'))errors.push('Duplicate corporate enquiry form still appears on homepage');
if(!home.includes('requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView'))errors.push('React homepage does not restore incoming hash deep links');
if(!stories.includes('href="/#trainee-stories"'))errors.push('Battleship trainee stories link missing');
if(!home.includes('<Testimonials/>'))errors.push('Trainee stories gallery not mounted on homepage');
if(errors.length){console.error('Navigation audit failed:\n'+errors.map(x=>' - '+x).join('\n'));process.exit(1)}
console.log('Navigation audit passed: '+Object.keys(pages).length+' pages, '+checked+' local link references, anchors, logo/home routes, six distinct nav items and no unfinished homepage modules.');
