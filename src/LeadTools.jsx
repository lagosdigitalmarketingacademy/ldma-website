import React,{useState} from 'react';
import {ArrowUpRight,Check} from 'lucide-react';

const goals=[
 {id:'grow',label:'Grow a business',note:'Understand customers, channels and growth',course:'Digital Marketing Strategy'},
 {id:'ads',label:'Run better ads',note:'Work with budgets, campaigns and performance',course:'Performance Advertising'},
 {id:'ai',label:'Use AI at work',note:'Build useful, responsible AI workflows',course:'AI for Business & Marketing'},
 {id:'create',label:'Build a content engine',note:'Tell stronger stories and create consistently',course:'Content & Social Media'}
];
export default function LeadTools(){
 const [goal,setGoal]=useState('');const [experience,setExperience]=useState('new');
 const recommendation=goals.find(g=>g.id===goal);
 const guidance=experience==='new'?'Start with the foundations and move into practical exercises.':'Ask about advanced exercises and industry-specific applications.';
 return <><section className="finder section" id="course-finder">
  <div className="section-label"><span>04 / YOUR LEARNING PATH</span><span>FIND YOUR NEXT MOVE</span></div>
  <div className="finder-heading"><div><span className="finder-pill">THE LDMA SKILL FINDER</span><h2>DON'T GUESS.<br/><em>FIND YOUR EDGE.</em></h2></div><p>Answer two quick questions and explore a learning area that fits your goals. Recommendations are rule-based guidance, not an admissions decision.</p></div>
  <div className="finder-panel"><div className="finder-questions"><h3>01 <span>WHAT DO YOU WANT TO DO?</span></h3><div className="goal-grid">{goals.map(g=><button type="button" className={'goal-option '+(goal===g.id?'picked':'')} key={g.id} aria-pressed={goal===g.id} onClick={()=>{setGoal(g.id);setCopied('')}}><b>{g.label}</b><small>{g.note}</small><span>{goal===g.id?<Check size={18}/>:<ArrowUpRight size={18}/>}</span></button>)}</div><h3>02 <span>WHERE ARE YOU STARTING?</span></h3><div className="experience-row"><button aria-pressed={experience==='new'} className={experience==='new'?'picked':''} onClick={()=>setExperience('new')}>I'M STARTING OUT</button><button aria-pressed={experience==='working'} className={experience==='working'?'picked':''} onClick={()=>setExperience('working')}>I HAVE SOME EXPERIENCE</button></div></div><aside className="finder-result"><span>YOUR SUGGESTED DIRECTION</span>{recommendation?<><div className="finder-result-icon">↗</div><h3>{recommendation.course}</h3><p>{guidance}</p><a href="#programmes" onClick={e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('ldma:course-recommendation',{detail:{course:recommendation.course}}))}}>EXPLORE THIS LEARNING AREA <ArrowUpRight size={18}/></a></>:<><h3>YOUR NEXT<br/>MOVE STARTS<br/>WITH A GOAL.</h3><p>Choose what you'd like to achieve to get a suggested learning direction.</p></>}</aside></div>
 </section></>;
}
