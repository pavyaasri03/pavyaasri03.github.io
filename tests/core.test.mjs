import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeSample, RUBRICS, createBallot, submitBallot, createTicket, updateTicket, validateGrade, escapeHTML } from '../assets/demo-core.mjs';

test('rubric gives reproducible full and partial matches and rejects invalid marks', () => {
  for (const [key,r] of Object.entries(RUBRICS)) {
    assert.equal(gradeSample(key,r.answer,10).earned,10);
    assert.equal(gradeSample(key,'An unrelated answer.',10).earned,0);
  }
  assert.equal(gradeSample('oop',RUBRICS.oop.sample,10).earned,7);
  assert.equal(gradeSample('oop',RUBRICS.oop.answer,25).earned,25);
  for (const value of ['',0,-1,101,2.5,'abc']) assert.throws(()=>gradeSample('oop','hello',value));
  assert.throws(()=>gradeSample('oop','   ',10));
  assert.equal(gradeSample('structures','lifo fifo push',10).earned,6);
  assert.equal(gradeSample('structures','lifoooo fifooo',10).earned,0);
});
test('a ballot requires verification, accepts one vote, and resets to fresh counts', () => {
  const state=createBallot(); state.selected='maya';
  assert.throws(()=>submitBallot(state));
  state.verified=true; submitBallot(state);
  assert.equal(state.candidates.reduce((n,c)=>n+c.votes,0),101);
  assert.throws(()=>submitBallot(state));
  assert.equal(createBallot().candidates.reduce((n,c)=>n+c.votes,0),100);
});
test('tickets validate required values and preserve ordered transition history', () => {
  assert.throws(()=>createTicket({title:' ',category:'IT'},'CMP-1'));
  const t=createTicket({title:'Example',description:'A fictional issue',location:'Lab',category:'IT'},'CMP-1');
  assert.throws(()=>updateTicket(t,'Resolved'));
  updateTicket(t,'In progress');updateTicket(t,'In progress');updateTicket(t,'Resolved');
  assert.equal(t.history.length,3);assert.equal(t.status,'Resolved');
  assert.throws(()=>updateTicket(t,'Open'));
});
test('grading permits zero but not empty, nonfinite or out-of-range scores', () => {
  assert.equal(validateGrade('0'),0);assert.equal(validateGrade('92.5'),92.5);
  for (const v of ['', ' ', 'NaN', Infinity, -1, 101]) assert.throws(()=>validateGrade(v));
});
test('untrusted text is escaped before HTML rendering', () => {
  assert.equal(escapeHTML('<img onerror="x">&'), '&lt;img onerror=&quot;x&quot;&gt;&amp;');
});
