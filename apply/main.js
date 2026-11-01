import plans from '../data/2027-programmes.json';

const $=id=>document.getElementById(id);
const programme=$('programme'),cohort=$('cohort'),fee=$('fee-panel'),form=$('application-form');
const money=n=>'₦'+n.toLocaleString('en-NG');
const fmt=d=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const dateRange=s=>s.start===s.end?fmt(s.start):fmt(s.start)+' – '+fmt(s.end);
const selectedProgramme=()=>plans.programmes.find(p=>p.id===programme.value);
const selectedSession=()=>selectedProgramme()?.sessions.find(s=>s.start===cohort.value);
const status=$('application-status');
const onlineEnabled=import.meta.env.VITE_STUDENT_APPLICATION_ENABLED==='true';
if(onlineEnabled)$('send-email').textContent='SUBMIT APPLICATION ENQUIRY →';
let currentStep=1;
for(const p of plans.programmes){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;programme.append(o);}
function updateProgramme(){
 const p=selectedProgramme();cohort.replaceChildren();
 const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=p?'Choose a proposed session':'Choose a programme first';cohort.append(placeholder);
 cohort.disabled=!p;
 if(!p){fee.replaceChildren();fee.textContent='Choose a programme to see the fee and proposed location.';return;}
 for(const s of p.sessions){const o=document.createElement('option');o.value=s.start;o.textContent=dateRange(s);cohort.append(o);}
 fee.replaceChildren();
 const label=document.createElement('span');label.textContent=p.id==='battleship'?'AGREED 2027 BATTLESHIP FEE':'PROPOSED 2027 TUITION';
 const amount=document.createElement('strong');amount.textContent=money(p.fee_naira);
 const note=document.createElement('small');note.textContent=p.location+' (exact venue to be confirmed). No payment is being collected.';
 fee.append(label,amount,note);
}
function showStep(n){
 currentStep=n;
 document.querySelectorAll('.apply-step').forEach(el=>{el.hidden=Number(el.dataset.step)!==n;});
 for(let i=1;i<=3;i++)$('step-indicator-'+i).classList.toggle('active',i===n);
 form.scrollIntoView({behavior:'smooth',block:'start'});
}
function valid(ids){
 for(const id of ids){const el=$(id);if(!el.checkValidity()){el.reportValidity();el.focus();return false;}}
 return true;
}
function applicationText(){
 const p=selectedProgramme(),s=selectedSession();
 return [
 'LDMA 2027 TRAINING APPLICATION ENQUIRY','',
 'Programme: '+p.name,
 'Preferred proposed session: '+dateRange(s),
 'Training location area: '+p.location,
 (p.id==='battleship'?'Agreed Battleship fee: ':'Proposed tuition (subject to confirmation): ')+money(p.fee_naira),
 '',
 'Applicant name: '+$('full-name').value.trim(),
 'Phone: '+$('phone').value.trim(),
 'Email: '+$('email').value.trim(),
 'Applicant background: '+$('occupation').value,
 'Learning goal: '+$('goal').value.trim(),
 '',
 'I understand that cohort dates, venue and availability require LDMA confirmation.',
 'I request confirmation of the official registration process and payment instructions.',
 '',
 'This is an enquiry. No seat has been reserved and no payment has been made.'
 ].join('\n');
}
function review(){
 const p=selectedProgramme(),s=selectedSession();
 const rows=[
 ['Programme',p.name],['Proposed session',dateRange(s)],
 ['Fee',money(p.fee_naira)+(p.id==='battleship'?' (agreed fee)':' (proposed)')],
 ['Applicant',$('full-name').value.trim()],['Email',$('email').value.trim()],['Phone',$('phone').value.trim()],
 ['Background',$('occupation').value],['Goal',$('goal').value.trim()]
 ];
 const summary=$('application-summary');summary.replaceChildren();
 for(const [k,v] of rows){const item=document.createElement('div');const label=document.createElement('strong');label.textContent=k;const value=document.createElement('span');value.textContent=v;item.append(label,value);summary.append(item);}
 status.textContent='';
}
programme.addEventListener('change',updateProgramme);
$('next-1').addEventListener('click',()=>{if(valid(['programme','cohort']))showStep(2);});
$('next-2').addEventListener('click',()=>{if(valid(['full-name','phone','email','goal','consent'])){review();showStep(3);}});
$('back-2').addEventListener('click',()=>showStep(1));
$('back-3').addEventListener('click',()=>showStep(2));
form.addEventListener('submit',e=>e.preventDefault());
$('send-email').addEventListener('click',async()=>{
 if(currentStep!==3)return;
 const button=$('send-email');
 if(onlineEnabled&&button.dataset.emailFallback!=='true'){
  button.disabled=true;button.textContent='SUBMITTING…';status.textContent='';
  try{
   const payload={programme:programme.value,cohort:cohort.value,fullName:$('full-name').value.trim(),phone:$('phone').value.trim(),email:$('email').value.trim(),occupation:$('occupation').value,goal:$('goal').value.trim(),consent:$('consent').checked,website:$('website').value};
   const response=await fetch('/api/student-application',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.ok||!data.reference)throw new Error(data.error||'Unable to confirm your application.');
   status.textContent='Application enquiry received. Reference: '+data.reference+'. This is not an admission, reserved seat or payment confirmation. LDMA will contact you after review.';
   button.textContent='ENQUIRY RECEIVED';return;
  }catch(err){status.textContent=(err.message||'Online intake is unavailable.')+' You can still prepare and send the application by email.';button.textContent='PREPARE APPLICATION EMAIL →';button.dataset.emailFallback='true';}
  finally{button.disabled=false;}
  return;
 }
 const p=selectedProgramme();const subject='LDMA 2027 Application Enquiry — '+p.name;
 window.location.href='mailto:info@ldmacademy.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(applicationText());
 status.textContent='An email draft has been prepared. You must press Send in your email application. This website has not submitted your application or reserved a seat.';
});
$('copy-application').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(applicationText());status.textContent='Application copied. Paste it into an email addressed to info@ldmacademy.com and press Send. No application has been submitted automatically.';}
 catch{status.textContent='Copy is unavailable in this browser. Please use the email button, or contact info@ldmacademy.com.';}
});
const params=new URLSearchParams(window.location.search);
const chosen=plans.programmes.find(p=>p.id===params.get('programme'));
if(chosen){programme.value=chosen.id;updateProgramme();const start=params.get('cohort');if(chosen.sessions.some(s=>s.start===start))cohort.value=start;}
