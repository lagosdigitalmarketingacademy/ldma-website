import React,{useState} from 'react';
import {traineeReels} from './traineeReels.js';
import './testimonials.css';

// Video players are opt-in: no Instagram tracking/iframes are loaded before a visitor clicks.
export default function Testimonials({compact=false}){
 const [active,setActive]=useState(null);
 const [showAll,setShowAll]=useState(false);
 const reels=compact?traineeReels.slice(0,3):showAll?traineeReels:traineeReels.slice(0,3);
 return <section id="trainee-stories" className={'ldma-voices'+(compact?' ldma-voices-compact':'')} aria-labelledby={compact?'voices-title-compact':'voices-title'}>
  <div className="ldma-voices-head">
   <div>
    <div className="ldma-voices-eyebrow"><span>LDMA / FROM THE ROOM</span><span>REAL VOICES. REAL EXPERIENCES.</span></div>
    <h2 id={compact?'voices-title-compact':'voices-title'}>DON'T TAKE OUR<br/>WORD FOR IT.<br/><em>HEAR THEIRS.</em></h2>
   </div>
   <p>Hear from people who have experienced LDMA training. These are their original Instagram videos — not scripted endorsements written for this website.</p>
  </div>
  <div className="ldma-voices-grid">
   {reels.map(reel=><article className={'ldma-voice-card'+(active===reel.id?' is-playing':'')} key={reel.id}>
    <div className="ldma-voice-top"><span>LDMA / VIDEO {reel.number}</span><span>INSTAGRAM REEL</span></div>
    {active===reel.id?
     <div className="ldma-voice-player">
      <iframe title={'LDMA trainee video '+reel.number+' on Instagram'} src={reel.embedUrl} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
      <button type="button" className="ldma-voice-close" onClick={()=>setActive(null)}>CLOSE VIDEO</button>
     </div>:
     <button type="button" className="ldma-voice-poster" onClick={()=>setActive(reel.id)} aria-label={'Watch LDMA trainee video '+reel.number}>
      <span className="ldma-voice-mark">LDMA<span>.</span></span>
      <span className="ldma-voice-poster-copy">IN THEIR<br/><em>OWN WORDS.</em></span>
      <span className="ldma-voice-play"><span aria-hidden="true">▶</span> PLAY VIDEO</span>
     </button>}
    <div className="ldma-voice-bottom"><span>TRAINEE VIDEO / {reel.number}</span><a href={reel.url} target="_blank" rel="noopener noreferrer" aria-label={'Open trainee video '+reel.number+' on Instagram'}>WATCH ON INSTAGRAM ↗</a></div>
   </article>)}
  </div>
  <div className="ldma-voices-footer">
   {compact?<a href="/#trainee-stories" className="ldma-voices-more">EXPLORE ALL {traineeReels.length} VIDEOS ↗</a>:<button type="button" className="ldma-voices-more" onClick={()=>{setShowAll(v=>!v);setActive(null)}} aria-expanded={showAll}>{showAll?'SHOW FEWER VIDEOS ↑':'VIEW ALL '+traineeReels.length+' VIDEOS ↗'}</button>}
   <p>Instagram embeds may require cookies or a login. If a video does not load, use its original Instagram link.</p>
  </div>
  {!compact&&<div className="ldma-voices-cta"><div><span>READY TO EXPERIENCE IT YOURSELF?</span><strong>YOUR NEXT STORY<br/>STARTS IN THE ROOM.</strong></div><a href="/apply/">EXPLORE APPLICATION ↗</a></div>}
 </section>;
}
