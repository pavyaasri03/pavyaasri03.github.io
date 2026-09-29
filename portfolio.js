const menuButton = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
function setMenu(open) {
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
});
window.matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
document.getElementById('current-year').textContent = new Date().getFullYear();
const explanations = [
  'Start with the source. In ArivuPro, I split long documents into usable chunks while preserving what the questions need to stay grounded.',
  'Build around the model. I connect LLM generation to verification and repair, so a plausible answer is only the beginning of the assessment workflow.',
  'Make failure visible. From source checks to speech-parser round trips, I build ways to catch missing or inconsistent output before it reaches people.',
  'Put people in control. Teacher review, editable translations and human-reviewed reply drafts turn model output into a usable product.'
];
const figure = document.getElementById('neural-figure');
document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-stage]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  figure.dataset.active = button.dataset.stage;
  document.getElementById('pipeline-explanation').textContent = explanations[Number(button.dataset.stage)];
}));
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.getElementById('motion-toggle');
let manuallyPaused = false;
let networkVisible = true;
function updateMotion() {
  const paused = motionPreference.matches || manuallyPaused;
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = motionPreference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
  motionButton.disabled = motionPreference.matches;
  figure.querySelectorAll('.network-pulse').forEach(path => {
    path.style.animationPlayState = paused || !networkVisible || document.hidden ? 'paused' : 'running';
  });
}
motionButton.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateMotion(); });
motionPreference.addEventListener('change', updateMotion);
const networkObserver = new IntersectionObserver(entries => { networkVisible = entries[0].isIntersecting; updateMotion(); });
networkObserver.observe(figure);
document.addEventListener('visibilitychange', updateMotion);
updateMotion();
const progress = document.getElementById('reading-progress');
const groups = ['#desktop-nav a[href^="#"]', '.chapter-nav a'].map(selector => [...document.querySelectorAll(selector)].map(link => ({link, target:document.querySelector(link.getAttribute('href'))})));
const storyLabels = ['01 / GROUND THE ANSWER', '02 / PRESERVE THE VOICE', '03 / FIND THE SIGNAL', '04 / CONNECT THE EXPERIENCE'];
let scheduled = false;
function updateReading() {
  scheduled = false;
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0})`;
  groups.forEach((items, groupIndex) => {
    let active = groupIndex === 1 ? items[0] : null;
    for (const item of items) if (item.target && item.target.getBoundingClientRect().top <= innerHeight * .4) active = item;
    items.forEach(item => { if (item === active) item.link.setAttribute('aria-current', 'location'); else item.link.removeAttribute('aria-current'); });
    if (groupIndex === 1 && active) document.getElementById('rail-status').textContent = storyLabels[items.indexOf(active)];
  });
}
addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } }, {passive:true});
addEventListener('resize', updateReading);
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', updateReading));
updateReading();
