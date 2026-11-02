import React,{useEffect,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {ArrowUpRight,Search,MessageCircle,ShoppingBag,X,Send,Loader2} from 'lucide-react';
import './store.css';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const catalogueEnabled=import.meta.env.VITE_CATALOGUE_ENABLED==='true';
const adviserAiEnabled=import.meta.env.VITE_ADVISER_AI_ENABLED==='true';
const db=catalogueEnabled&&url&&key?createClient(url,key):null;
const choices=[{id:'all',label:'All products'},{id:'training',label:'Training'},{id:'digital',label:'Digital resources'},{id:'corporate',label:'For business'},{id:'event',label:'Events'}];
const areas=[{type:'training',number:'01',title:'TRAINING PROGRAMMES',text:'Practical learning for professionals, founders and ambitious teams.',link:'#programmes',cta:'Explore learning areas'},{type:'digital',number:'02',title:'DIGITAL RESOURCES',text:'Templates, guides and recorded learning resources as they become available.',link:'/insights/',cta:'Explore free guides'},{type:'corporate',number:'03',title:'CORPORATE LEARNING',text:'Customised marketing and AI programmes for organisations.',link:'/for-business/',cta:'Build a training brief'},{type:'event',number:'04',title:'EVENTS & EXPERIENCES',text:'Workshops, masterclasses and community learning opportunities.',link:'#events',cta:'Explore events'}];
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n/100);
export function Store(){
 const [products,setProducts]=useState([]),[type,setType]=useState('all'),[term,setTerm]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let alive=true;if(!db){setLoading(false);setError('The product catalogue is being prepared. Explore our learning areas and free guides in the meantime.');return;}db.from('ldma_products').select('id,title,slug,product_type,category,summary,description,price_kobo,price_label,delivery_mode,availability').eq('is_published',true).order('created_at',{ascending:false}).then(({data,error})=>{if(!alive)return;setProducts(data||[]);setError(error?'The catalogue is temporarily unavailable. Please try again later.':'');setLoading(false)});return()=>{alive=false}},[]);
 const shown=products.filter(p=>(type==='all'||p.product_type===type)&&[p.title,p.summary,p.category].join(' ').toLowerCase().includes(term.toLowerCase()));
 return <section id="store" className="store-section section"><div className="section-label"><span>THE LDMA STORE</span><span>SKILLS, TOOLS & EXPERIENCES</span></div><div className="store-heading"><h2>WHAT WILL YOU<br/><em>BUILD NEXT?</em></h2><p>Discover approved programmes, training resources and experiences from LDMA. Each product is listed only when the academy confirms it.</p></div>
 <div className="store-areas">{areas.map(a=><article className={'store-area store-area-'+a.type} key={a.type}><small>{a.number} / {a.type.toUpperCase()}</small><h3>{a.title}</h3><p>{a.text}</p><a href={a.link}>{a.cta}<ArrowUpRight size={18}/></a></article>)}</div>
 <div className="store-bar"><div><h3>THE PRODUCT CATALOGUE</h3><p>Verified products appear here when released.</p></div><label><Search size={18}/><input type="search" placeholder="Search approved products" aria-label="Search LDMA products" value={term} onChange={e=>setTerm(e.target.value)}/></label></div>
 <div className="store-filters" role="group" aria-label="Filter product types">{choices.map(c=><button type="button" key={c.id} className={type===c.id?'active':''} aria-pressed={type===c.id} onClick={()=>setType(c.id)}>{c.label}</button>)}</div>
 {loading?<p className="store-empty" role="status">Loading products…</p>:error?<p className="store-empty" role="status">{error}</p>:shown.length?<div className="store-product-grid">{shown.map(p=><article className="store-product" key={p.id}><div className="store-product-tag">{p.product_type.toUpperCase()} / {p.category}</div><h3>{p.title}</h3><p>{p.summary}</p><div className="store-product-meta"><span>{p.price_kobo!==null?money(p.price_kobo):p.price_label||'Ask for details'}</span><span>{p.availability==='available'?'AVAILABLE':p.availability==='enquiry'?'ENQUIRY ONLY':'COMING SOON'}</span></div><a href={p.product_type==='corporate'?'#training-brief':'#my-ldma'}>{p.availability==='available'?'Ask about enrolment':'Learn more'} <ArrowUpRight size={18}/></a></article>)}</div>:<div className="store-empty"><ShoppingBag size={27}/><h3>{products.length?'NO MATCHING PRODUCTS YET':'PRODUCT RELEASES ARE BEING PREPARED.'}</h3><p>{products.length?'Try a different search or filter.':'The store is ready for LDMA to add and approve real training programmes, digital products, events and pricing. Nothing is available to purchase here yet.'}</p>{products.length?<button onClick={()=>{setType('all');setTerm('')}}>Clear filters</button>:<a href="#programmes">Explore learning areas <ArrowUpRight size={17}/></a>}</div>}
 </section>
}
const suggested=['My Instagram gets views but few sales. What am I missing?','Which LDMA course suits a marketing beginner?','How much is Battleship in 2027?','How can I train my marketing team?'];
const adviserLinks={
 '/battleship/':'View Battleship training',
 '/calendar/':'Explore the 2027 training calendar',
 '/apply/':'Start an application',
 '/for-business/':'Explore corporate training',
 '/insights/':'Read LDMA insights',
 '/#trainee-stories':'Watch real trainee videos'
};
function renderAdviserMessage(message){
 return String(message).split(/(\/\#trainee-stories|\/(?:battleship|calendar|apply|for-business|insights)\/)/g).map((part,index)=>
  Object.hasOwn(adviserLinks,part)?<a key={index} href={part}>{adviserLinks[part]}</a>:<React.Fragment key={index}>{part}</React.Fragment>
 );
}
export function Adviser(){
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const [messages,setMessages]=useState([{from:'bot',text:adviserAiEnabled?'Hello! I’m Ask LDMA. What are you trying to achieve, or what is challenging your marketing? I’ll help you understand the problem and find the right practical training if you need it.':'Ask LDMA is being connected to a real AI service. I won’t give you made-up automated replies in the meantime. You can explore our programmes or contact the team directly.'}]);
 const [busy,setBusy]=useState(false),[serviceError,setServiceError]=useState('');
 const send=async(input)=>{
  const q=String(input||'').trim().slice(0,1400);
  if(!q||busy||!adviserAiEnabled)return;
  setQuery('');
  const prior=messages.slice(-10).map(m=>({role:m.from==='bot'?'assistant':'user',content:m.text}));
  setMessages(current=>[...current,{from:'user',text:q}]);
  setBusy(true);setServiceError('');
  try{
   const r=await fetch('/api/adviser',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,history:prior})});
   const data=await r.json().catch(()=>({}));
   if(!r.ok||typeof data.reply!=='string'||!data.reply.trim())throw new Error(data.error||'The AI service could not answer. Please try again.');
   setMessages(current=>[...current,{from:'bot',text:data.reply.slice(0,7000)}]);
  }catch(err){setServiceError(err.message||'Ask LDMA is unavailable right now.');}
  finally{setBusy(false);}
 };
 return <><button className="adviser-fab" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="ldma-adviser-panel"><MessageCircle size={21}/> ASK LDMA <span>{open?'−':'+'}</span></button>
 {open&&<aside id="ldma-adviser-panel" className="adviser-panel" aria-label="Ask LDMA AI adviser">
  <div className="adviser-top"><div><strong>ASK LDMA</strong><small>{adviserAiEnabled?'CONVERSATIONAL AI / ANSWERS ARE AI-GENERATED':'AI CONNECTION PENDING / NO SCRIPTED REPLIES'}</small></div><button onClick={()=>setOpen(false)} aria-label="Close adviser"><X size={21}/></button></div>
  <div className="adviser-messages" role="log" aria-live="polite">{messages.map((m,i)=><p key={i} className={'adviser-message '+(m.from==='user'?'mine':'theirs')}>{renderAdviserMessage(m.text)}</p>)}{busy&&<p className="adviser-message theirs" role="status">Thinking through your question…</p>}{serviceError&&<div className="adviser-error" role="alert"><strong>AI connection unavailable.</strong><p>{serviceError}</p><p>No scripted answer has been substituted. You can try again or email <a href="mailto:info@ldmacademy.com">info@ldmacademy.com</a>.</p></div>}</div>
  {adviserAiEnabled?<><div className="adviser-suggestions">{suggested.map(q=><button type="button" key={q} onClick={()=>send(q)} disabled={busy}>{q}</button>)}</div><form onSubmit={e=>{e.preventDefault();send(query)}} className="adviser-form"><input value={query} onChange={e=>setQuery(e.target.value)} maxLength={1400} placeholder="Ask a real marketing question…" aria-label="Message Ask LDMA" disabled={busy}/><button type="submit" disabled={busy||!query.trim()} aria-label="Send message">{busy?<Loader2 size={19}/>:<Send size={19}/>}</button></form></>:<div className="adviser-offline"><a href="/calendar/">VIEW 2027 PROGRAMMES</a><a href="/apply/">START AN APPLICATION</a><a href="mailto:info@ldmacademy.com?subject=LDMA%20Training%20Enquiry">EMAIL LDMA</a></div>}
  <p className="adviser-foot">AI guidance, not a confirmed admission or booking. Battleship 2027 fee: ₦250,000. Dates remain proposed. Do not share passwords or payment details.</p>
 </aside>}</>;
}
