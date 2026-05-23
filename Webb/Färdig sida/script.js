/* =============================================
   FENIX_HSTD — Script
   ============================================= */

// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Burger meny ──
const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');

burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  burger.querySelectorAll('span')[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
  burger.querySelectorAll('span')[1].style.opacity = isOpen ? '0' : '';
  burger.querySelectorAll('span')[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Canvas partiklar (glödande ember-effekt) ──
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

window.addEventListener('resize', () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}, { passive: true });

const COLORS = [
  'rgba(255, 69, 0, VAL)',
  'rgba(255, 214, 10, VAL)',
  'rgba(0, 85, 255, VAL)',
  'rgba(68, 170, 255, VAL)',
  'rgba(255, 69, 0, VAL)',
  'rgba(0, 85, 255, VAL)',
  'rgba(255, 140, 0, VAL)',
  'rgba(80, 160, 255, VAL)',
];

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : H + 10;
    this.size = Math.random() * 3.2 + 0.6;
    this.speedY = Math.random() * 0.7 + 0.25;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.life = 0;
    this.maxLife = Math.random() * 220 + 120;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.twinkle = Math.random() * Math.PI * 2;
    this.hasGlow = Math.random() > 0.55;
  }

  update() {
    this.x += this.speedX + Math.sin(this.life * 0.018) * 0.35;
    this.y -= this.speedY;
    this.life++;
    this.twinkle += 0.045;
    if (this.y < -10 || this.life > this.maxLife) this.reset();
  }

  draw() {
    const progress = this.life / this.maxLife;
    const alpha = Math.sin(progress * Math.PI) * 0.8 * (0.65 + 0.35 * Math.sin(this.twinkle));
    const col = this.color.replace('VAL', alpha.toFixed(3));
    if (this.hasGlow) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = col;
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const PARTICLE_COUNT = 130;
const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

function animate() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

// ── Senaste nytt — ladda från news.json ──
fetch('news.json')
  .then(r => r.json())
  .then(data => {
    const grid = document.getElementById('news-grid');
    const items = data.news || [];
    if (items.length === 0) {
      grid.innerHTML = '<p class="news-empty">Inga nyheter just nu — följ oss på sociala medier!</p>';
      return;
    }
    grid.innerHTML = items.map(n => `
      <div class="news-card reveal">
        ${n.tag ? `<span class="news-tag">${n.tag}</span>` : ''}
        <span class="news-date">${n.date}</span>
        <h3>${n.title}</h3>
        <p>${n.text}</p>
      </div>`).join('');
    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  })
  .catch(() => {
    document.getElementById('news-grid').innerHTML =
      '<p class="news-empty">Nyheter laddas snart.</p>';
  });

// ── Smooth active nav link highlighting ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--fire)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
