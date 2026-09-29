const menuButton = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
function setMenu(open) {
  mobileNav.classList.toggle('hidden', !open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
});
window.matchMedia('(min-width: 768px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
document.getElementById('current-year').textContent = new Date().getFullYear();
const explanations = [
  'A useful AI result starts with faithfully extracting and preserving the source.',
  'Generation is followed by verification, repair and evaluation. Human review stays part of the workflow.',
  'The result becomes a usable product: clear interfaces, reproducible scoring and careful data boundaries.'
];
document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-stage]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  document.getElementById('pipeline-explanation').textContent = explanations[Number(button.dataset.stage)];
}));
const progress = document.getElementById('reading-progress');
let scheduled = false;
function updateReading() {
  scheduled = false;
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
  for (const selector of ['#desktop-nav a[href^="#"]', '.chapter-nav a']) {
    const links = [...document.querySelectorAll(selector)];
    let active = null;
    for (const link of links) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target && target.getBoundingClientRect().top <= innerHeight * .4) active = link;
    }
    links.forEach(link => { if (link === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
}
addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } }, { passive: true });
addEventListener('resize', updateReading);
updateReading();
