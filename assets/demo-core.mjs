export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const RUBRICS = {
  oop: {
    title: 'Polymorphism in OOP', subject: 'Computer science',
    question: 'Explain polymorphism, distinguish overloading from overriding, and give a practical example.',
    answer: 'Polymorphism lets classes respond differently to a common interface. Overloading is resolved at compile time; overriding at runtime. For example, Dog and Cat implement different speak methods.',
    sample: 'Polymorphism means many forms: classes share a common interface. Overriding happens at runtime, for example Dog and Cat implement speak differently.',
    concepts: [
      { label: 'Common interface or many forms', terms: ['common interface', 'same interface', 'many forms'], weight: 2 },
      { label: 'Compile-time overloading', terms: ['overloading', 'compile time', 'compile-time'], weight: 3 },
      { label: 'Runtime overriding', terms: ['overriding', 'runtime', 'run-time'], weight: 3 },
      { label: 'Concrete example', terms: ['dog', 'cat', 'shape', 'circle', 'rectangle'], weight: 2 }
    ]
  },
  dbms: {
    title: 'Database normalization', subject: 'Databases',
    question: 'Explain normalization, first normal form and second normal form.',
    answer: 'Normalization reduces redundancy and protects integrity. First normal form requires atomic values. Second normal form requires 1NF and no partial dependency on a composite key.',
    sample: 'Normalization reduces redundancy. First normal form stores atomic values, and second normal form removes partial dependency on a composite key.',
    concepts: [
      { label: 'Reduces redundancy', terms: ['redundancy', 'duplication'], weight: 2 },
      { label: 'Atomic values in 1NF', terms: ['atomic', 'single value'], weight: 3 },
      { label: 'Partial dependency in 2NF', terms: ['partial dependency', 'partial dependencies'], weight: 3 },
      { label: 'Composite key', terms: ['composite key', 'combined key'], weight: 2 }
    ]
  },
  structures: {
    title: 'Stacks and queues', subject: 'Data structures',
    question: 'Compare stack and queue ordering and their insertion/removal operations.',
    answer: 'Stacks use LIFO: last in, first out, with push and pop. Queues use FIFO: first in, first out, with enqueue and dequeue.',
    sample: 'A stack follows LIFO and uses push and pop. A queue follows FIFO, like a line at a shop.',
    concepts: [
      { label: 'Stack: LIFO', terms: ['lifo', 'last in first out', 'last-in-first-out'], weight: 3 },
      { label: 'Push and pop', terms: ['push', 'pop'], weight: 2, all: true },
      { label: 'Queue: FIFO', terms: ['fifo', 'first in first out', 'first-in-first-out'], weight: 3 },
      { label: 'Enqueue and dequeue', terms: ['enqueue', 'dequeue'], weight: 2, all: true }
    ]
  }
};

export function gradeSample(key, response, maxMarks) {
  if (!RUBRICS[key]) throw new Error('Choose a sample rubric.');
  if (!response.trim()) throw new Error('Enter a response to compare with the rubric.');
  const maximum = Number(maxMarks);
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 100) throw new Error('Maximum marks must be a whole number from 1 to 100.');
  const normalized = response.toLowerCase().replace(/[.,;:!?]/g, ' ').replace(/\s+/g, ' ');
  const contains = term => new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(normalized);
  const criteria = RUBRICS[key].concepts.map(c => ({ ...c, matched: c.all ? c.terms.every(contains) : c.terms.some(contains) }));
  const points = criteria.reduce((sum, c) => sum + (c.matched ? c.weight : 0), 0);
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  return { earned: Math.round(points / total * maximum * 10) / 10, maximum, percent: Math.round(points / total * 100), criteria };
}

export const CANDIDATES = [
  { id: 'maya', name: 'Maya Rao', group: 'Learning & access', initials: 'MR', votes: 42 },
  { id: 'arjun', name: 'Arjun Sen', group: 'Campus & community', initials: 'AS', votes: 36 },
  { id: 'leela', name: 'Leela Das', group: 'Student wellbeing', initials: 'LD', votes: 22 }
];
export function createBallot() { return { verified: false, selected: null, submitted: false, receipt: null, candidates: CANDIDATES.map(c => ({ ...c })) }; }
export function submitBallot(state) {
  if (!state.verified) throw new Error('Complete the simulated verification first.');
  if (state.submitted) throw new Error('This sample ballot has already been submitted.');
  if (!state.candidates.some(c => c.id === state.selected)) throw new Error('Choose a candidate first.');
  state.candidates.find(c => c.id === state.selected).votes += 1;
  state.submitted = true;
  state.receipt = 'DEMO-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  return state;
}

export const STATUSES = ['Open', 'In progress', 'Resolved'];
export function createTicket({ title, category, description, location, priority }, id) {
  if (!title?.trim() || !description?.trim() || !location?.trim() || !category) throw new Error('Complete the title, category, location and description.');
  return { id, title: title.trim(), category, description: description.trim(), location: location.trim(), priority: priority || 'Normal', status: 'Open', history: [{ status: 'Open', note: 'Sample ticket registered.' }] };
}
export function updateTicket(ticket, status) {
  if (!STATUSES.includes(status)) throw new Error('Unknown status.');
  if (ticket.status === status) return ticket;
  const next = STATUSES.indexOf(status), current = STATUSES.indexOf(ticket.status);
  if (next !== current + 1) throw new Error('Advance the ticket one step at a time.');
  ticket.status = status;
  ticket.history.push({ status, note: status === 'Resolved' ? 'Resolution recorded in this demo.' : 'Assigned for review in this demo.' });
  return ticket;
}

export function validateGrade(value) {
  if (String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) throw new Error('Enter a score from 0 to 100.');
  return Number(value);
}
