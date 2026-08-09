// ===== 粒子背景 =====
(function() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxParticles = 60;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); this.y = Math.random() * canvas.height; }
    reset() { this.x = Math.random() * canvas.width; this.y = -10; this.size = Math.random() * 2 + 1; this.speed = Math.random() * 0.5 + 0.2; this.opacity = Math.random() * 0.5 + 0.2; }
    update() { this.y += this.speed; if (this.y > canvas.height + 10) this.reset(); }
    draw() {
      const primary = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#00d4ff';
      ctx.fillStyle = primary; ctx.globalAlpha = this.opacity;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
  }
  for (let i = 0; i < maxParticles; i++) particles.push(new Particle());
  (function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); })();
})();

// ===== 项目图标映射 =====
const PROJECT_ICONS = {
  'creative-lab': '💡',
  'desktop-aipet': '🤖',
  'industry-knowledge-graph': '🧠',
  'haifong': '📷',
  'api-tester': '🔧',
  'chrome-memory-monitor': '🧩',
  'ngrok-proxy': '🔐',
};

// ===== 配置加载 =====
let config = null;
let activeCategory = 'all';

async function loadConfig() {
  try {
    const resp = await fetch('config.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    config = await resp.json();
    applyTheme();
    renderProfile();
    renderCategoryFilter();
    renderWorks();
  } catch (e) {
    document.getElementById('worksGrid').innerHTML =
      '<div class="empty-state"><div class="empty-icon">⚠️</div><p>加载配置失败</p><p class="empty-hint">' + e.message + '</p></div>';
  }
}

// ===== 主题 =====
function applyTheme() {
  if (!config?.theme) return;
  const root = document.documentElement;
  root.style.setProperty('--primary', config.theme.primaryColor || '#00d4ff');
  root.style.setProperty('--accent', config.theme.accentColor || '#7c3aed');
  root.style.setProperty('--bg', config.theme.bgColor || '#0a0a1a');
}

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  document.getElementById('themeToggle').textContent = document.body.classList.contains('light') ? '☀️' : '🌓';
});

// ===== 个人信息 =====
function renderProfile() {
  if (!config?.profile) return;
  const p = config.profile;
  const avatarRing = document.querySelector('.avatar-ring');
  if (p.avatar) { avatarRing.innerHTML = '<img src="' + p.avatar + '" alt="avatar" class="avatar-img">'; }
  document.querySelector('.hero-name').textContent = p.name || '知行旅人';
  document.querySelector('.hero-title').textContent = p.title || '';
  document.querySelector('.hero-bio').textContent = p.bio || '';

  const linksEl = document.querySelector('.hero-links');
  linksEl.innerHTML = '';
  const iconMap = { github: '⌨️ GitHub', blog: '📝 博客', email: '📧 邮件' };
  for (const [key, url] of Object.entries(p.links || {})) {
    if (!url) continue;
    const a = document.createElement('a');
    a.href = key === 'email' ? 'mailto:' + url : url;
    a.target = key === 'email' ? '' : '_blank';
    a.rel = 'noopener';
    a.textContent = iconMap[key] || key;
    linksEl.appendChild(a);
  }
}

// ===== 分类筛选 =====
function renderCategoryFilter() {
  if (!config?.categories) return;

  const container = document.getElementById('categoryFilter');
  container.innerHTML = '';

  // "全部" button
  const allBtn = document.createElement('button');
  allBtn.className = 'cat-btn' + (activeCategory === 'all' ? ' active' : '');
  allBtn.textContent = '全部作品';
  allBtn.onclick = () => { activeCategory = 'all'; updateCatBtns(); renderWorks(); };
  container.appendChild(allBtn);

  // Category buttons
  for (const cat of config.categories) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (activeCategory === cat.id ? ' active' : '');
    btn.textContent = (cat.icon || '') + ' ' + cat.name;
    btn.onclick = () => { activeCategory = cat.id; updateCatBtns(); renderWorks(); };
    container.appendChild(btn);
  }
}

function updateCatBtns() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const idx = config.categories.findIndex(c => c.id === activeCategory);
  const btns = document.querySelectorAll('.cat-btn');
  if (btns[idx + 1]) btns[idx + 1].classList.add('active');
  else btns[0].classList.add('active');
}

// ===== 作品渲染 =====
function renderWorks() {
  const grid = document.getElementById('worksGrid');
  const empty = document.getElementById('emptyState');

  if (!config?.works || config.works.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  let works = [...config.works];

  // Filter
  if (activeCategory !== 'all') {
    works = works.filter(w => w.category === activeCategory);
  }

  // Sort: featured first
  works.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  // Get category info
  const catMap = {};
  if (config.categories) {
    config.categories.forEach(c => { catMap[c.id] = c; });
  }

  grid.innerHTML = works.map(work => {
    const cat = catMap[work.category] || {};
    const catIcon = cat.icon || '📦';
    const catName = cat.name || work.category || '';
    const icon = PROJECT_ICONS[work.id] || catIcon;

    return '<div class="work-card glass-card reveal" data-id="' + work.id + '">'
      + '<div class="work-card-thumb">'
      +   '<span class="thumb-icon">' + icon + '</span>'
      +   '<div class="thumb-accent"></div>'
      + '</div>'
      + '<div class="work-card-body">'
      +   '<span class="work-card-cat">' + catIcon + ' ' + catName + '</span>'
      +   '<h3 class="work-card-title">' + work.title + '</h3>'
      +   '<p class="work-card-desc">' + (work.description || '') + '</p>'
      +   '<div class="work-card-tags">' + (work.tags || []).map(t => '<span class="tag">' + t + '</span>').join('') + '</div>'
      +   '<div class="work-card-footer">'
      +     (work.link ? '<a class="footer-link" href="' + work.link + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">🔗 访问</a>' : '<span></span>')
      +     (work.featured ? '<span class="featured-star">⭐</span>' : '<span></span>')
      +   '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  // Click to open modal
  grid.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });

  // Reveal animation
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });
}

// ===== 弹窗 =====
function openModal(id) {
  const work = config.works.find(w => w.id === id);
  if (!work) return;

  document.getElementById('modalImage').style.display = work.image ? '' : 'none';
  document.getElementById('modalImage').src = work.image || '';

  const catMap = {};
  if (config.categories) config.categories.forEach(c => { catMap[c.id] = c; });
  const cat = catMap[work.category] || {};
  document.getElementById('modalCat').textContent = (cat.icon || '') + ' ' + (cat.name || '');

  document.getElementById('modalTitle').textContent = work.title;
  document.getElementById('modalDesc').textContent = work.description || '';
  document.getElementById('modalTags').innerHTML = (work.tags || []).map(t => '<span class="tag">' + t + '</span>').join('');

  const actions = document.getElementById('modalActions');
  actions.innerHTML = '';
  if (work.link) {
    const a = document.createElement('a');
    a.href = work.link; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = '🔗 访问项目';
    actions.appendChild(a);
  }

  const qrSection = document.getElementById('modalQR');
  if (work.qrcode) {
    qrSection.style.display = '';
    document.getElementById('modalQRImg').src = work.qrcode;
  } else {
    qrSection.style.display = 'none';
  }

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => { if (e.target === document.getElementById('modal')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

loadConfig();
