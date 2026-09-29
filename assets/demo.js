import { escapeHTML as esc, RUBRICS, gradeSample, createBallot, submitBallot, createTicket, updateTicket, validateGrade } from './demo-core.mjs';

const app = document.getElementById('demo-app');
const kind = document.body.dataset.demo;
const $ = id => document.getElementById(id);
let toastTimer;
function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  toastTimer = setTimeout(() => $('toast').textContent = '', 4500);
}
function announceView() { $('view-title')?.focus({ preventScroll: true }); }
function error(message) { const el = $('form-error'); if (el) { el.textContent = message; el.focus(); } else toast(message); }
function exportJSON(name, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const badge = status => `<span class="status ${['Resolved', 'Graded', 'Matched', 'Submitted'].includes(status) ? 'good' : 'pending'}">${esc(status)}</span>`;
const button = (text, action, cls = '', attrs = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${attrs}>${text}</button>`;
const panelTitle = (title, subtitle = '') => `<div class="panel-heading"><div><h2 id="view-title" tabindex="-1">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div></div>`;
const errors = '<div id="form-error" class="error" role="alert" tabindex="-1"></div>';
const tabs = (values, active, action) => `<div class="tabs" role="group" aria-label="View">${values.map(([id, label]) => `<button type="button" data-action="${action}" data-value="${id}" aria-pressed="${active === id}">${label}</button>`).join('')}</div>`;
const meter = (value, label) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`;

// Assessment: deliberately transparent matching, with no model/network call.
let assessment;
function resetAssessment() { assessment = { rubric: 'oop', text: RUBRICS.oop.sample, marks: 10, result: null }; }
function renderAssessment() {
  const r = RUBRICS[assessment.rubric];
  app.innerHTML = `<div class="notice">Local rubric demonstration. This matches keywords, not meaning; it can reward negated or incorrect statements. It is not AI grading and must not be used to assess real students.</div>
  <section class="panel">${panelTitle('Explore an assessment', 'Change the response and inspect exactly which criteria match.')}
    <form id="assessment-form"><div class="row"><label>Sample topic<select id="rubric" name="rubric">${Object.entries(RUBRICS).map(([key, v]) => `<option value="${key}" ${key === assessment.rubric ? 'selected' : ''}>${v.title}</option>`).join('')}</select></label>
    <label>Maximum marks<input id="marks" name="marks" type="number" min="1" max="100" step="1" required value="${esc(assessment.marks)}"></label></div>
    <div class="notice"><strong>${esc(r.question)}</strong><details><summary>Read the model answer</summary><p class="small" style="margin-top:12px">${esc(r.answer)}</p></details></div>
    <label>Your sample response<textarea id="response" name="response" rows="5" maxlength="5000" required>${esc(assessment.text)}</textarea></label>
    <div class="toolbar">${button('Load complete answer', 'complete-answer')}${button('Load partial answer', 'partial-answer')}${button('Clear response', 'clear-answer', 'quiet')}</div>
    ${errors}<button class="btn primary" type="submit">Compare with rubric <span aria-hidden="true">→</span></button></form>
  </section><section id="assessment-result" aria-live="polite">${assessment.result ? assessmentResult() : '<div class="empty">Your criterion-by-criterion breakdown will appear here.</div>'}</section>`;
}
function assessmentResult() {
  const r = assessment.result;
  return `<div class="panel"><div class="score-layout"><div class="score-ring" style="--score:${r.percent}%"><div class="score-center"><strong>${r.earned}</strong><span>OUT OF ${r.maximum}</span></div></div><div><p class="eyebrow">SAMPLE RUBRIC RESULT</p><h2 style="margin:10px 0">${r.criteria.filter(c => c.matched).length} of ${r.criteria.length} criteria matched</h2><p class="small muted">A deterministic keyword comparison. Matching words is not proof of understanding.</p></div></div>
  ${r.criteria.map(c => `<div class="rubric-row"><div><strong>${esc(c.label)}</strong><small>Looks for ${c.all ? 'all' : 'any'}: ${c.terms.map(esc).join(', ')}</small><small>Weight: ${c.weight}/10</small></div>${badge(c.matched ? 'Matched' : 'Not found')}</div>`).join('')}
  <div class="actions">${button('Export this breakdown', 'export-assessment')}${button('Edit response', 'edit-response', 'quiet')}</div></div>`;
}

// Voting: one in-memory sample ballot, explicit verification simulation.
let ballot, ballotStep;
function resetVoting() { ballot = createBallot(); ballotStep = 1; }
function renderVoting() {
  const selected = ballot.candidates.find(c => c.id === ballot.selected);
  const total = ballot.candidates.reduce((n, c) => n + c.votes, 0);
  const labels = ['Verify', 'Choose', 'Review', 'Receipt'];
  let content = '';
  if (ballotStep === 1) content = `${panelTitle('Begin with a sample identity', 'A fictional campus ballot, designed to demonstrate the workflow.')}<div class="verification"><div class="verification-symbol" aria-hidden="true">ID</div><div><h3>Demo voter 001</h3><p class="muted small">Fictional student · Eligible sample record</p></div><p class="muted small">No fingerprint, Aadhaar number, camera or other identity data is collected. Verification is simulated locally.</p>${button('Simulate verification', 'verify', 'primary', 'id="verify-button"')}<p id="verify-status" role="status" class="small muted"></p></div>`;
  if (ballotStep === 2) content = `${panelTitle('Choose a representative', 'All candidates and counts are fictional.')}<fieldset style="border:0;padding:0;margin:0"><legend class="meta" style="margin-bottom:16px">Select one candidate</legend>${ballot.candidates.map(c => `<label class="candidate"><span class="avatar" aria-hidden="true">${c.initials}</span><span class="candidate-copy"><strong>${c.name}</strong><span>${c.group}</span></span><input type="radio" name="candidate" value="${c.id}" aria-label="${c.name}" ${c.id === ballot.selected ? 'checked' : ''}></label>`).join('')}</fieldset><div class="actions between">${badge('Sample identity verified')}${button('Review selection →', 'review-vote', 'primary', `id="review-vote" ${selected ? '' : 'disabled'}`)}</div>`;
  if (ballotStep === 3) content = `${panelTitle('Review your selection', 'Your sample vote is recorded only in this page session.')}<div class="candidate"><span class="avatar">${selected.initials}</span><div class="candidate-copy"><strong>${selected.name}</strong><span>${selected.group}</span></div></div><div class="notice">Submitting adds exactly one vote to the sample tally. You can start a fresh simulation with Reset demo.</div><div class="actions">${button('← Change selection', 'change-vote')}${button('Submit sample vote', 'submit-vote', 'primary')}</div>`;
  if (ballotStep === 4) content = `${panelTitle('Your sample vote is recorded', 'Receipt ' + esc(ballot.receipt))}<div class="metric-grid">${meter(total, 'SAMPLE VOTES')}${meter(1, 'YOUR VOTE')}${meter(3, 'CANDIDATES')}</div>${[...ballot.candidates].sort((a,b) => b.votes-a.votes).map(c => `<div class="result-row"><div class="result-label"><span>${c.name}${c.id === ballot.selected ? ' · Your choice' : ''}</span><span>${c.votes} / ${total}</span></div><div class="bar" role="meter" aria-label="${c.name} share" aria-valuenow="${Math.round(c.votes/total*100)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${c.votes/total*100}%"></span></div></div>`).join('')}<div class="notice">This tally illustrates state changes in a demo. It is not a real election result or a secure voting system.</div><div class="actions">${button('Download sample receipt', 'export-vote')}${button('Start a new simulation', 'reset', 'quiet')}</div>`;
  app.innerHTML = `<ol class="steps" aria-label="Ballot progress">${labels.map((l,i) => `<li class="${i+1===ballotStep?'active':i+1<ballotStep?'done':''}" ${i+1===ballotStep?'aria-current="step"':''}>0${i+1} / ${l}</li>`).join('')}</ol><section class="panel">${content}</section>`;
}

// Coursework state is shared between student, faculty and administrator views.
const courseSeed = [
  { id:'python', title:'Python for problem solving', category:'Programming', done:6, total:12, lesson:'Working with dictionaries', description:'A dictionary maps unique keys to values. Use a comprehension to build a frequency table, then reason about lookup complexity.' },
  { id:'web', title:'Full-stack web development', category:'Web engineering', done:4, total:10, lesson:'Designing a resource API', description:'Start with resources, HTTP methods and response shapes. Validate input at the boundary and return errors the interface can explain.' },
  { id:'dbms', title:'Database management', category:'Data systems', done:8, total:12, lesson:'Normal forms in practice', description:'Separate entities with different dependencies. A composite key needs every non-key attribute to depend on the entire key.' },
  { id:'ml', title:'Machine learning foundations', category:'Applied learning', done:3, total:10, lesson:'Training and validation splits', description:'Evaluate on data that was not used to fit the model. Keep preprocessing fitted to the training partition to avoid information leakage.' }
];
let learning;
function resetLearning() {
  learning = { role:'student', view:'courses', query:'', course:null, assignment:null, attachment:'', courses:structuredClone(courseSeed), assignments:[
    { id:'api', title:'REST API design', course:'Full-stack web development', status:'Pending', notes:'', attachment:'', score:null, feedback:'' },
    { id:'sql', title:'SQL schema review', course:'Database management', status:'Pending', notes:'', attachment:'', score:null, feedback:'' },
    { id:'linear', title:'Linear regression exercise', course:'Machine learning foundations', status:'Graded', notes:'Training and validation comparison.', attachment:'sample-report.pdf', score:92, feedback:'Clear evaluation and explanation of the split.' }
  ] };
}
function renderLearning() {
  const done = learning.courses.reduce((n,c)=>n+c.done,0), total = learning.courses.reduce((n,c)=>n+c.total,0);
  let content = '';
  if (learning.role === 'admin') {
    content = `<section class="panel">${panelTitle('Learning overview', 'Metrics reflect the current sample workspace.')}<div class="table-wrap"><table><caption class="meta" style="text-align:left;margin-bottom:12px">Course completion</caption><thead><tr><th scope="col">Course</th><th scope="col">Completed</th><th scope="col">Progress</th></tr></thead><tbody>${learning.courses.map(c=>`<tr><td>${c.title}</td><td>${c.done}/${c.total}</td><td>${Math.round(c.done/c.total*100)}%</td></tr>`).join('')}</tbody></table></div><div class="actions">${button('Export workspace report', 'export-learning')}</div></section>`;
  } else if (learning.role === 'faculty' && learning.assignment) {
    const a = learning.assignments.find(a=>a.id===learning.assignment);
    content = `<section class="panel">${panelTitle('Review coursework', esc(a.title))}<p class="meta">Sample student / Pavyaa Sri S</p><p class="preserve" style="margin:18px 0">${esc(a.notes)}</p><p class="small muted">Attachment label: ${esc(a.attachment || 'No attachment')}</p><form id="grade-form" style="margin-top:24px"><label>Score out of 100<input name="score" type="number" min="0" max="100" step="any" required value="${a.score ?? ''}"></label><label>Feedback<textarea name="feedback" required maxlength="2000">${esc(a.feedback)}</textarea></label>${errors}<div class="actions"><button class="btn primary" type="submit">Save grade</button>${button('Cancel', 'learning-back')}</div></form></section>`;
  } else if (learning.role === 'faculty') {
    content = `<section class="panel">${panelTitle('Review queue', 'Submit coursework in the Student view, then grade the same record here.')}<div class="list">${learning.assignments.map(a=>`<div class="list-item"><div><h3>${a.title}</h3><p>${a.course}</p><p>${a.status === 'Graded' ? `Score: ${a.score}/100` : a.status === 'Submitted' ? 'Ready for review' : 'Awaiting student submission'}</p></div><div>${badge(a.status)} ${a.status!=='Pending'?button(a.status==='Graded'?'Edit grade':'Grade','grade-assignment','',`data-id="${a.id}"`):''}</div></div>`).join('')}</div></section>`;
  } else if (learning.assignment) {
    const a = learning.assignments.find(a=>a.id===learning.assignment);
    content = `<section class="panel">${panelTitle(a.status==='Pending'?'Submit coursework':'Your submission', esc(a.title))}${a.status==='Pending'?`<form id="submission-form"><label>Submission notes<textarea name="notes" required maxlength="3000" placeholder="Describe your approach and findings."></textarea></label><label>Optional local attachment<input id="attachment" type="file" accept=".pdf,.docx,.txt,.zip"></label><p class="small muted">Only the file name is used in this demo. No file is read or uploaded; maximum selection size is 10 MB.</p><div class="actions">${button('Use sample attachment', 'sample-attachment')}</div><p id="attachment-label" class="small muted" style="margin-top:12px"></p>${errors}<div class="actions"><button class="btn primary" type="submit">Submit coursework</button>${button('Cancel','learning-back')}</div></form>`:`${badge(a.status)}<p class="preserve" style="margin:20px 0">${esc(a.notes)}</p><p class="small muted">Attachment: ${esc(a.attachment || 'None')}</p>${a.status==='Graded'?`<div class="notice" style="margin-top:24px"><strong>Score: ${a.score}/100</strong><p class="preserve">${esc(a.feedback)}</p></div>`:'<p class="notice" style="margin-top:24px">Awaiting review. Switch to Faculty to grade this submission.</p>'}<div class="actions">${button('Back to assignments', 'learning-back')}</div>`}</section>`;
  } else if (learning.view==='assignments') {
    content = `<section class="panel">${panelTitle('Assignments', 'Submission, review and feedback in one connected workflow.')}<div class="list">${learning.assignments.map(a=>`<div class="list-item"><div><h3>${a.title}</h3><p>${a.course}</p>${a.score!==null?`<p>Score: ${a.score}/100</p>`:''}</div><div>${badge(a.status)} ${button(a.status==='Pending'?'Submit':'View','open-assignment','',`data-id="${a.id}"`)}</div></div>`).join('')}</div></section>`;
  } else if (learning.course) {
    const c = learning.courses.find(c=>c.id===learning.course);
    content = `<section class="panel">${panelTitle(c.title, `Lesson ${Math.min(c.done+1,c.total)} of ${c.total}`)}<p class="eyebrow">${c.category}</p><h3 style="margin:16px 0">${c.done===c.total?'Course complete':c.lesson}</h3><p class="muted">${c.description}</p><div class="notice" style="margin-top:24px">Sample lesson: each completion advances the local course progress. This is an interaction preview, not a full course library.</div><div class="bar"><span style="width:${c.done/c.total*100}%"></span></div><div class="actions">${button(c.done===c.total?'All lessons complete':'Mark lesson complete','complete-lesson','primary', c.done===c.total?'disabled':'')}${button('Back to courses','learning-back')}</div></section>`;
  } else {
    content = `<div class="toolbar"><label>Find a course<input id="course-search" type="search" placeholder="Search by course or category" value="${esc(learning.query)}"></label></div><div id="course-results">${courseCards()}</div>`;
  }
  app.innerHTML = `${tabs([['student','Student'],['faculty','Faculty'],['admin','Admin']],learning.role,'learning-role')}<div class="metric-grid">${meter(learning.courses.length,'SAMPLE COURSES')}${meter(Math.round(done/total*100)+'%','LESSONS COMPLETE')}${meter(learning.assignments.filter(a=>a.status==='Submitted').length,'AWAITING REVIEW')}</div>${learning.role==='student'?tabs([['courses','Courses'],['assignments','Assignments']],learning.view,'learning-view'):''}${content}`;
}
function courseCards() {
  const courses = learning.courses.filter(c=>(c.title+' '+c.category).toLowerCase().includes(learning.query.toLowerCase()));
  return courses.length ? `<div class="course-grid">${courses.map(c=>`<article class="course"><p class="meta">${c.category}</p><h3>${c.title}</h3><p>${c.done} of ${c.total} lessons complete</p><div class="bar" role="meter" aria-label="${c.title} progress" aria-valuenow="${Math.round(c.done/c.total*100)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${c.done/c.total*100}%"></span></div>${button(c.done===c.total?'Review course':'Continue learning →','open-course','',`data-id="${c.id}"`)}</article>`).join('')}</div>` : '<div class="empty" role="status">No courses match your search.</div>';
}

// Complaint records are shared between registration, tracking and admin views.
let complaints;
function resetComplaints() {
  complaints = { view:'dashboard', query:'', filter:'All', category:'All', tracked:null, trackError:'', next:49, tickets:[
    { id:'CMP-0048',title:'Study room light needs repair',category:'Facilities',description:'The light above the main study table flickers.',location:'Library · Room 2',priority:'Normal',status:'Open',history:[{status:'Open',note:'Sample ticket registered.'}] },
    { id:'CMP-0047',title:'Campus Wi-Fi connection drops',category:'IT support',description:'Connection drops during afternoon lab sessions.',location:'Computer lab',priority:'High',status:'In progress',history:[{status:'Open',note:'Sample ticket registered.'},{status:'In progress',note:'Assigned to the sample IT team.'}] },
    { id:'CMP-0046',title:'Replace reading-room chairs',category:'Facilities',description:'Two damaged chairs in the reading room.',location:'Reading room',priority:'Normal',status:'Resolved',history:[{status:'Open',note:'Sample ticket registered.'},{status:'In progress',note:'Reviewed by facilities.'},{status:'Resolved',note:'Replacement recorded in sample data.'}] }
  ] };
}
function renderComplaints() {
  let content='';
  if(complaints.view==='register') content=`<section class="panel">${panelTitle('Register a sample complaint','Complete the form, then follow the same ticket through review and resolution.')}<form id="complaint-form"><label>Title<input name="title" required maxlength="100" placeholder="A short summary of the issue"></label><div class="row"><label>Category<select name="category" required><option value="">Choose a category</option><option>Facilities</option><option>IT support</option><option>Academic services</option></select></label><label>Priority<select name="priority"><option>Normal</option><option>High</option></select></label></div><label>Location<input name="location" required maxlength="100" placeholder="Use a fictional location"></label><label>Description<textarea name="description" required maxlength="2000" placeholder="Describe the issue using sample information."></textarea></label>${errors}<button class="btn primary" type="submit">Register sample ticket →</button></form></section>`;
  else if(complaints.view==='track') {
    const t=complaints.tickets.find(t=>t.id===complaints.tracked);
    content=`<section class="panel">${panelTitle('Follow a ticket','Try CMP-0048, or the ID of a ticket you just created.')}<form id="track-form"><label>Ticket ID<input name="ticket" required value="${esc(complaints.tracked || '')}" placeholder="CMP-0048" maxlength="30"></label><button type="submit" class="btn primary">Track ticket</button>${errors}</form></section>${complaints.trackError?`<div class="empty" role="status">${esc(complaints.trackError)}</div>`:t?ticketDetail(t):'<div class="empty">Enter a sample ticket ID to see its history.</div>'}`;
  } else if(complaints.view==='admin') content=`<section class="panel">${panelTitle('Manage the same records','Move a ticket forward and see its timeline update in Track.')}<div class="toolbar"><label>Status<select id="ticket-filter">${['All','Open','In progress','Resolved'].map(x=>`<option ${x===complaints.filter?'selected':''}>${x}</option>`).join('')}</select></label><label>Category<select id="category-filter">${['All','Facilities','IT support','Academic services'].map(x=>`<option ${x===complaints.category?'selected':''}>${x}</option>`).join('')}</select></label></div><div id="ticket-results">${ticketTable()}</div><div class="actions">${button('Export sample tickets','export-tickets')}</div></section>`;
  else content=`<section class="panel">${panelTitle('A clear path to resolution','Register. Review. Resolve. Every change appears in the same history.')}<div class="actions" style="margin:0 0 24px">${button('Register a ticket →','complaint-view','primary','data-value="register"')}${button('Manage tickets','complaint-view','','data-value="admin"')}</div>${complaints.tickets.map(t=>`<div class="list-item"><div><span class="ticket-id">${t.id}</span><h3 style="margin-top:5px">${esc(t.title)}</h3><p>${esc(t.category)} · ${esc(t.location)}</p></div><div>${badge(t.status)} ${button('View','view-ticket','',`data-id="${t.id}"`)}</div></div>`).join('')}</section>`;
  app.innerHTML=`${tabs([['dashboard','Overview'],['register','Register'],['track','Track'],['admin','Admin']],complaints.view,'complaint-view')}<div class="metric-grid">${meter(complaints.tickets.length,'SAMPLE TICKETS')}${meter(complaints.tickets.filter(t=>t.status!=='Resolved').length,'ACTIVE')}${meter(complaints.tickets.filter(t=>t.status==='Resolved').length,'RESOLVED')}</div>${content}`;
}
function ticketDetail(t) { return `<section class="panel"><div class="panel-heading"><div><span class="ticket-id">${t.id}</span><h2 style="margin-top:10px">${esc(t.title)}</h2></div>${badge(t.status)}</div><p class="preserve">${esc(t.description)}</p><p class="small muted" style="margin-top:16px">${esc(t.location)} · ${esc(t.category)} · ${esc(t.priority)} priority</p><ol class="timeline">${t.history.map(h=>`<li><strong>${esc(h.status)}</strong><p>${esc(h.note)}</p></li>`).join('')}</ol><div class="actions">${button('Open admin view','complaint-view','','data-value="admin"')}</div></section>`; }
function ticketTable() {
  const tickets=complaints.tickets.filter(t=>(complaints.filter==='All'||t.status===complaints.filter)&&(complaints.category==='All'||t.category===complaints.category));
  return tickets.length?`<div class="table-wrap"><table><caption class="meta" style="text-align:left;margin-bottom:12px">${tickets.length} matching sample tickets</caption><thead><tr><th scope="col">Ticket</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>${tickets.map(t=>`<tr><td><span class="ticket-id">${t.id}</span><br>${esc(t.title)}</td><td>${esc(t.category)}</td><td>${badge(t.status)}</td><td>${t.status==='Resolved'?button('View history','view-ticket','',`data-id="${t.id}"`):button(t.status==='Open'?'Assign':'Resolve','advance-ticket','',`data-id="${t.id}"`)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty" role="status">No tickets match these filters.</div>';
}

let verifyTimer;
function render() { ({ assessment:renderAssessment, voting:renderVoting, learning:renderLearning, complaints:renderComplaints })[kind](); }
function reset() { clearTimeout(verifyTimer); ({ assessment:resetAssessment, voting:resetVoting, learning:resetLearning, complaints:resetComplaints })[kind](); render(); }
document.addEventListener('click', e => {
  const target=e.target.closest('[data-action]'); if(!target||target.disabled) return;
  const action=target.dataset.action, id=target.dataset.id, value=target.dataset.value;
  if(action==='reset') { $('reset-dialog').showModal(); return; }
  if(action==='cancel-reset') { $('reset-dialog').close(); return; }
  if(action==='confirm-reset') { $('reset-dialog').close(); reset(); toast('Fresh sample data restored.'); announceView(); return; }
  try {
    if(kind==='assessment') {
      if(action==='complete-answer'||action==='partial-answer'||action==='clear-answer') { assessment.text=action==='clear-answer'?'':RUBRICS[assessment.rubric][action==='complete-answer'?'answer':'sample']; assessment.result=null; render(); $('response').focus(); }
      if(action==='edit-response') $('response').focus();
      if(action==='export-assessment'&&assessment.result) exportJSON('sample-rubric-result.json',{type:'Keyword simulation; not AI grading',topic:RUBRICS[assessment.rubric].title,response:assessment.text,...assessment.result});
    }
    if(kind==='voting') {
      if(action==='verify') { target.disabled=true; $('verify-status').textContent='Checking the fictional sample record…'; verifyTimer=setTimeout(()=>{ballot.verified=true;ballotStep=2;render();announceView();toast('Sample verification complete. No identity data was collected.');},700); }
      if(action==='review-vote'&&ballot.selected&&ballot.verified) {ballotStep=3;render();announceView();}
      if(action==='change-vote'&&!ballot.submitted) {ballotStep=2;render();announceView();}
      if(action==='submit-vote') {submitBallot(ballot);ballotStep=4;render();announceView();toast('One sample vote recorded.');}
      if(action==='export-vote') exportJSON('sample-ballot-receipt.json',{type:'Fictional demonstration only',receipt:ballot.receipt,selected:ballot.selected,totalVotes:ballot.candidates.reduce((n,c)=>n+c.votes,0)});
    }
    if(kind==='learning') {
      if(action==='learning-role') {learning.role=value;learning.course=null;learning.assignment=null;render();announceView();}
      if(action==='learning-view') {learning.view=value;learning.course=null;learning.assignment=null;render();announceView();}
      if(action==='open-course') {learning.course=id;render();announceView();}
      if(action==='complete-lesson') {const c=learning.courses.find(c=>c.id===learning.course);c.done=Math.min(c.total,c.done+1);render();announceView();toast('Lesson marked complete. Course progress updated.');}
      if(action==='learning-back') {learning.course=null;learning.assignment=null;learning.attachment='';render();announceView();}
      if(action==='open-assignment'||action==='grade-assignment') {learning.assignment=id;learning.attachment='';render();announceView();}
      if(action==='sample-attachment') {learning.attachment='sample-assignment.pdf';$('attachment').value='';$('attachment-label').textContent='Selected: sample-assignment.pdf (demo attachment)';}
      if(action==='export-learning') exportJSON('sample-learning-report.json',{type:'Sample workspace only',courses:learning.courses,assignments:learning.assignments});
    }
    if(kind==='complaints') {
      if(action==='complaint-view') {complaints.view=value;render();announceView();}
      if(action==='view-ticket') {complaints.view='track';complaints.tracked=id;complaints.trackError='';render();announceView();}
      if(action==='advance-ticket') {const t=complaints.tickets.find(t=>t.id===id);updateTicket(t,t.status==='Open'?'In progress':'Resolved');render();announceView();toast(`${t.id} is now ${t.status.toLowerCase()}.`);}
      if(action==='export-tickets') exportJSON('sample-complaints.json',{type:'Fictional sample tickets only',tickets:complaints.tickets});
    }
  } catch(err) {error(err.message);}
});
app.addEventListener('change', e => {
  if(e.target.id==='rubric') {assessment.rubric=e.target.value;assessment.text=RUBRICS[assessment.rubric].sample;assessment.result=null;render();$('rubric').focus();}
  if(e.target.name==='candidate') {ballot.selected=e.target.value;$('review-vote').disabled=false;}
  if(e.target.id==='attachment') {
    const file=e.target.files[0];
    if(file && (file.size>10*1024*1024 || !/\.(pdf|docx|txt|zip)$/i.test(file.name))) {learning.attachment='';e.target.value='';$('attachment-label').textContent='';error('Select a PDF, DOCX, TXT or ZIP file smaller than 10 MB.');return;}
    learning.attachment=file?.name || ''; $('attachment-label').textContent=file?`Selected: ${file.name}. File stays on your device.`:'';
  }
  if(e.target.id==='ticket-filter'||e.target.id==='category-filter') {complaints[e.target.id==='ticket-filter'?'filter':'category']=e.target.value;$('ticket-results').innerHTML=ticketTable();}
});
app.addEventListener('input', e => {
  if(e.target.id==='response'||e.target.id==='marks') {
    assessment[e.target.id==='response'?'text':'marks']=e.target.value;
    if(assessment.result) {assessment.result=null;$('assessment-result').innerHTML='<div class="empty">Response changed. Compare again to refresh the breakdown.</div>';}
  }
  if(e.target.id==='course-search') {learning.query=e.target.value;$('course-results').innerHTML=courseCards();}
});
app.addEventListener('submit', e => {
  e.preventDefault();const data=Object.fromEntries(new FormData(e.target));
  try {
    if(e.target.id==='assessment-form') {assessment.text=data.response;assessment.marks=data.marks;assessment.result=gradeSample(assessment.rubric,data.response,data.marks);render();$('assessment-result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});toast('Sample rubric comparison complete.');}
    if(e.target.id==='submission-form') {if(!data.notes.trim()) throw new Error('Add submission notes.');const a=learning.assignments.find(a=>a.id===learning.assignment);a.notes=data.notes.trim();a.attachment=learning.attachment;a.status='Submitted';render();announceView();toast('Sample submission ready for Faculty review.');}
    if(e.target.id==='grade-form') {const score=validateGrade(data.score);if(!data.feedback.trim()) throw new Error('Add feedback for the sample student.');const a=learning.assignments.find(a=>a.id===learning.assignment);a.score=score;a.feedback=data.feedback.trim();a.status='Graded';learning.assignment=null;render();announceView();toast('Grade saved. View the feedback as Student.');}
    if(e.target.id==='complaint-form') {const id='CMP-'+String(complaints.next).padStart(4,'0');const ticket=createTicket(data,id);complaints.next+=1;complaints.tickets.unshift(ticket);complaints.tracked=id;complaints.trackError='';complaints.view='track';render();announceView();toast(`Sample ticket ${id} registered.`);}
    if(e.target.id==='track-form') {const id=data.ticket.trim().toUpperCase();complaints.tracked=id;complaints.trackError=complaints.tickets.some(t=>t.id===id)?'':'No sample ticket found. Check the ID or register a new ticket.';render();announceView();}
  } catch(err) {error(err.message);}
});
reset();
