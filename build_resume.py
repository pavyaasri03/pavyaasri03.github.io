from pathlib import Path
from xml.sax.saxutils import escape
import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
summary = 'AI Full Stack Developer building production generative AI applications for education and marketing. Hands-on experience with LLM orchestration, document processing, AI grading and multilingual speech pipelines, backed by Python, TypeScript and full-stack delivery.'
skills = [
('Languages', 'Python, TypeScript, JavaScript, SQL'),
('AI engineering', 'LLM orchestration, prompt engineering, source grounding, output validation, OCR, speech-to-text, text-to-speech; Gemini, DeepSeek, Claude, Groq'),
('Applications & data', 'React, Next.js, FastAPI, Node.js, Express, Django, PostgreSQL, Supabase, Firebase/Firestore, MongoDB, MySQL'),
('Testing & delivery', 'pytest, Vitest, Git, GitHub Actions, Railway, Vercel, FFmpeg, REST APIs, tenant isolation')]
bullets = [
('AI assessment', 'Built a document-to-quiz pipeline with chunked extraction, LLM generation, verification and repair, teacher review, and publishing; validated large-document processing on a 98-page source.'),
('Grading & isolation', 'Implemented deterministic objective scoring and model-answer-based AI grading for descriptive responses; enforced tenant-scoped queries with isolation regression tests.'),
('Multilingual speech', 'Built LingoCut dubbing and script-to-voiceover workflows for 12 code-switched dialects using Gemini and FFmpeg, with segment timing, retries and checkpointed processing.'),
('AI reliability', 'Traced missing voiceover sentences to text segmentation; replaced a lossy parser and verified text retention with automated TTS-to-transcription round-trip checks.'),
('Marketing intelligence', 'Shipped MarketInsight Pro with social listening across 8+ sources, LLM sentiment/relevance classification, fact-grounded reply drafts and human review; added retry/backoff and historical analytics.'),
('Academic platform', 'Delivered faculty self-onboarding, retroactive class assignment and timetable scheduling for three user roles, including overlap detection, API routes and database changes.'),
('Production delivery', 'Resolved quiz-start failures caused by response-model and query mismatches; used feature flags, regression tests and server-side API proxies to support reliable releases.')]
projects = [
('AI Answer Sheet Evaluation | React, FastAPI, Claude Vision', 'Built image preprocessing and model orchestration for handwritten/printed answer evaluation, with question-level marks, feedback and a student results dashboard.'),
('Biometric Voting System | Node.js, MongoDB', 'Developed fingerprint-based voter verification and modular REST APIs; tested input validation and duplicate-vote prevention.'),
('Institutional LMS | Moodle, PHP, MySQL', 'Collaboratively customized and deployed a Moodle LMS for departmental assignments, resource sharing and student/faculty profiles.'),
('Complaint Registration System | Django, MySQL', 'Built authenticated CRUD workflows with form validation, modular views and reusable templates.')]

styles = {
 'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=21, leading=24, textColor=colors.HexColor('#173b4b'), spaceAfter=3),
 'tag': ParagraphStyle('tag', fontName='Helvetica-Bold', fontSize=10, leading=13, spaceAfter=4),
 'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=8.5, leading=11, spaceAfter=3),
 'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=10, leading=12, spaceBefore=7, spaceAfter=5, textColor=colors.HexColor('#173b4b')),
 'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.2, leading=12, spaceAfter=3),
 'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.2, leading=12, leftIndent=9, firstLineIndent=-9, spaceAfter=3),
}
story=[]
plain=[]
def p(text, style='body'):
    story.append(Paragraph(text, styles[style]))
    plain.append(re.sub('<[^>]+>', '', text).replace('&amp;', '&'))
def section(title): p(title, 'section')
p('PAVYAA SRI S', 'name')
p('AI FULL STACK DEVELOPER | GENERATIVE AI APPLICATIONS', 'tag')
p('Bengaluru, India | +91 91507 66362 | <link href="mailto:pavyaasris@gmail.com">pavyaasris@gmail.com</link>', 'contact')
p('<link href="https://pavyaasri03.github.io/">pavyaasri03.github.io</link> | <link href="https://github.com/pavyaasri03">github.com/pavyaasri03</link> | <link href="https://linkedin.com/in/pavyaa-sri-s-5024b23a7">LinkedIn: pavyaa-sri-s-5024b23a7</link>', 'contact')
section('PROFESSIONAL SUMMARY')
p(summary)
section('TECHNICAL SKILLS')
for name, desc in skills: p(f'<b>{escape(name)}:</b> {escape(desc)}')
section('WORK EXPERIENCE')
p('<b>AI Full Stack Developer | Arivu Educational Consultants Pvt. Ltd. (ArivuPro)</b>')
p('Bengaluru, India | May 2026 - Present')
for name, desc in bullets: p(f'- <b>{escape(name)}:</b> {escape(desc)}', 'bullet')
section('SELECTED PROJECTS')
for name, desc in projects: p(f'<b>{escape(name)}</b><br/>{escape(desc)}')
section('EDUCATION')
p('<b>Master of Computer Applications</b> | 2023 - 2025 | CGPA: 9.67/10<br/>Marudhar Kesari Jain College for Women, Vaniyambadi')
p('<b>B.Sc. Computer Science</b> | 2020 - 2023 | CGPA: 9.0/10<br/>Marudhar Kesari Jain College for Women, Vaniyambadi')
section('TRAINING & ACHIEVEMENTS')
p('Machine Learning Internship (30 days): Python, preprocessing, supervised ML.<br/>NPTEL: Database Management Systems | Best Student Award: Mahindra Naandi Foundation')
doc = SimpleDocTemplate(str(OUT / 'Pavyaa_Sri_AI_Engineer_Draft.pdf'), pagesize=A4, rightMargin=35, leftMargin=35, topMargin=30, bottomMargin=28, title='Pavyaa Sri S - AI Full Stack Developer', author='Pavyaa Sri S')
doc.build(story)
(OUT / 'Pavyaa_Sri_AI_Engineer_Resume.txt').write_text('\n\n'.join(plain), encoding='utf-8')
print('Resume generated.')
