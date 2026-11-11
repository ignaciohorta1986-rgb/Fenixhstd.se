/* =============================================
   FENIX_HSTD — Script (design nov 2026)
   ============================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Navbar vid scroll ──
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobilmeny ──
const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Stäng menyn' : 'Öppna menyn');
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
const observeReveal = root => root.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
observeReveal(document);

// ── Glöd-partiklar (färre, pausas när fliken inte syns) ──
const canvas = document.getElementById('canvas');
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = ['255,69,0', '255,214,10', '255,107,53', '68,170,255'];
  const count = window.innerWidth < 700 ? 28 : 60;
  const particles = Array.from({ length: count }, () => spawn(true));

  function spawn(initial) {
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 10,
      r: Math.random() * 2.4 + 0.6,
      vy: Math.random() * 0.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      life: 0,
      max: Math.random() * 240 + 140,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.life * 0.02) * 0.3;
      p.y -= p.vy;
      p.life++;
      if (p.y < -10 || p.life > p.max) { particles[i] = spawn(false); continue; }
      const a = Math.sin((p.life / p.max) * Math.PI) * 0.75;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Senaste nytt — från news.json ──
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const fmtDate = iso => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

fetch('news.json', { cache: 'no-cache' })
  .then(r => r.json())
  .then(data => {
    const grid = document.getElementById('news-grid');
    const items = (data.news || [])
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
    if (!items.length) {
      grid.innerHTML = '<p class="news-empty">Inga nyheter just nu — följ oss på sociala medier!</p>';
      return;
    }
    // Texten i news.json får innehålla <br> och <strong>, som skrivs av föreningen själv.
    grid.innerHTML = items.map((n, i) => `
      <article class="panel news-card reveal${i === 0 ? ' featured' : ''}" style="--delay:${i * 0.08}s">
        <div class="news-meta">
          ${n.tag ? `<span class="news-tag">${esc(n.tag)}</span>` : ''}
          <time class="news-date" datetime="${esc(n.date)}">${fmtDate(n.date)}</time>
        </div>
        <h3>${esc(n.title)}</h3>
        <p>${n.text}</p>
      </article>`).join('');
    observeReveal(grid);
  })
  .catch(() => {
    document.getElementById('news-grid').innerHTML = '<p class="news-empty">Nyheter laddas snart.</p>';
  });

// ── Markera aktiv sektion i menyn ──
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
  });
}, { threshold: 0.35 });
document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));
