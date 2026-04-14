// =============================
// COPYRIGHT
// =============================
const copyrightEl = document.getElementById('copyright');
if (copyrightEl) {
  copyrightEl.innerHTML = `© ${new Date().getFullYear()} O.B Kingsland. All rights reserved.`;
}

// =============================
// SEARCH TABS
// =============================
document.querySelectorAll('.stab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    const t = this.dataset.type || this.textContent.trim();
    const sel = document.getElementById('heroTypeSelect');
    if (sel && t) sel.value = t;
  });
});

// =============================
// HERO SEARCH
// =============================
window.heroSearch = function () {
  const keyword  = (document.getElementById('heroSearchInput') || {}).value || '';
  const typeEl   = document.getElementById('heroTypeSelect');
  const regionEl = document.getElementById('heroRegionSelect');
  const activeTab = document.querySelector('.stab.active');
  const tabType   = activeTab ? (activeTab.dataset.type || activeTab.textContent.trim()) : '';
  const finalType = (typeEl ? typeEl.value : '') || tabType;
  const params = new URLSearchParams();
  if (keyword.trim()) params.set('q', keyword.trim());
  if (finalType && finalType !== 'Select Type') params.set('type', finalType);
  if (regionEl && regionEl.value && regionEl.value !== 'All Regions') params.set('region', regionEl.value);
  window.location.href = 'listings.html' + (params.toString() ? '?' + params.toString() : '');
};

const heroInput = document.getElementById('heroSearchInput');
if (heroInput) {
  heroInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') window.heroSearch();
  });
}

// =============================
// FILTER PILLS
// =============================
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', function () {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
  });
});

// =============================
// ADMIN MODAL backward-compat (nav.js handles the real one)
// =============================
function togglePwd() {
  const input = document.getElementById('adminPwdInput');
  const icon  = document.getElementById('pwdEyeIcon');
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const errorEl = document.getElementById('afError');
  const form    = e.target;
  const email   = form.querySelector('input[type="email"]')?.value.trim();
  const pwd     = form.querySelector('input[type="password"]')?.value;
  const btn     = form.querySelector('.af-submit');
  if (errorEl) errorEl.textContent = '';
  if (!email || !pwd) { if (errorEl) errorEl.textContent = 'Please enter email and password'; return; }
  if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...'; btn.disabled = true; }
  try {
    const res  = await fetch('https://o-b-website.onrender.com/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('obk_token', data.token);
    if (typeof window.closeAdminModal === 'function') window.closeAdminModal();
    window.location.href = 'admin-dashboard.html';
  } catch (err) {
    if (errorEl) errorEl.textContent = err.message;
    if (btn) { btn.innerHTML = '<span>Sign In to Dashboard</span><i class="fas fa-arrow-right"></i>'; btn.disabled = false; }
  }
}

// =============================
// WISHLIST
// =============================
document.querySelectorAll('.lcard-wish').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('liked');
    const heart = this.querySelector('i');
    if (heart) heart.style.color = this.classList.contains('liked') ? '#E8622A' : '';
  });
});

// =============================
// NAV SCROLL
// =============================
window.addEventListener('scroll', function () {
  const nav = document.querySelector('.obk-nav');
  if (!nav) return;
  nav.style.background = window.scrollY > 60
    ? 'rgba(13,27,42,0.99)'
    : 'rgba(13,27,42,0.97)';
}, { passive: true });

// =============================
// AUTO-ADVANCING LISTINGS SLIDER (mobile only)
// =============================
(function () {
  const grid = document.getElementById('listingsGrid') || document.querySelector('.listings-grid');
  const dotsContainer = document.getElementById('sliderDots') || document.querySelector('.slider-dots');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.land-card'));
  const total = cards.length;
  if (total < 2) return;

  let currentIdx = 0;
  let autoTimer  = null;

  // Build dots dynamically if container is empty
  if (dotsContainer && dotsContainer.children.length === 0) {
    cards.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'sdot' + (i === 0 ? ' active' : '');
      d.dataset.idx = i;
      dotsContainer.appendChild(d);
    });
  }

  const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.sdot')) : [];

  function isMobile() { return window.innerWidth <= 640; }

  function goTo(idx, fromUser) {
    if (!isMobile()) return;
    if (fromUser) resetAuto();
    currentIdx = ((idx % total) + total) % total;
    grid.scrollTo({ left: currentIdx * grid.offsetWidth, behavior: 'smooth' });
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
  }

  function startAuto() {
    autoTimer = setInterval(() => {
      if (isMobile()) goTo(currentIdx + 1, false);
    }, 3500);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  dots.forEach(dot => dot.addEventListener('click', function () {
    goTo(parseInt(this.dataset.idx), true);
  }));

  grid.addEventListener('scroll', function () {
    if (!isMobile()) return;
    const idx = Math.round(grid.scrollLeft / grid.offsetWidth);
    if (idx !== currentIdx) {
      currentIdx = idx;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
    }
  }, { passive: true });

  let touchStartX = 0;
  grid.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  grid.addEventListener('touchend', e => {
    if (!isMobile()) return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(currentIdx + (dx > 0 ? 1 : -1), true);
  }, { passive: true });

  grid.addEventListener('mouseenter', () => clearInterval(autoTimer));
  grid.addEventListener('mouseleave', () => { if (isMobile()) startAuto(); });

  startAuto();
})();

// =============================
// AOS
// =============================
if (window.AOS) {
  AOS.init({ duration: 800, easing: 'ease-in-out', once: false, mirror: true });
}