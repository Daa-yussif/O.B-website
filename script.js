// =============================
// COPYRIGHT
// =============================
const copyrightEl = document.getElementById('copyright');
if (copyrightEl) {
  copyrightEl.innerHTML = `© ${new Date().getFullYear()} O.B Kingsland. All rights reserved.`;
}

// =============================
// DARK MODE
// =============================
const colorModeToggle = document.getElementById('colorModeToggle');
const colorModeIcon = colorModeToggle ? colorModeToggle.querySelector('i') : null;

const savedColorMode = localStorage.getItem('obk_color_mode') || 'light';
applyColorMode(savedColorMode);

if (colorModeToggle) {
  colorModeToggle.addEventListener('click', () => {
    const nextMode = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyColorMode(nextMode);
    localStorage.setItem('obk_color_mode', nextMode);
  });
}

function applyColorMode(mode) {
  const isDark = mode === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  if (!colorModeIcon) return;
  colorModeIcon.classList.toggle('fa-sun', !isDark);
  colorModeIcon.classList.toggle('fa-moon', isDark);
  colorModeIcon.setAttribute('title', isDark ? 'Light mode' : 'Dark mode');
}

// =============================
// SEARCH TABS
// =============================
document.querySelectorAll('.stab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

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
// MOBILE NAV SAFETY (IMPORTANT FIX)
// =============================
const drawer = document.getElementById('mobileNavDrawer');
const overlay = document.getElementById('mobileNavOverlay');

function forceCloseMobile() {
  drawer?.classList.remove('open');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
}

// =============================
// ADMIN MODAL (FIXED - CONSISTENT SYSTEM)
// =============================
const adminOverlay = document.getElementById('adminModalOverlay');
const adminModalClose = document.getElementById('adminModalClose');

// FIX: select BOTH admin buttons safely
const adminButtons = document.querySelectorAll('.nav-cta');

function openAdminModal() {
  forceCloseMobile(); // important fix (prevents click blocking)
  adminOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
  adminOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// open from all admin buttons
adminButtons.forEach(btn => {
  btn.addEventListener('click', openAdminModal);
});

// close handlers
adminModalClose?.addEventListener('click', closeAdminModal);

adminOverlay?.addEventListener('click', (e) => {
  if (e.target === adminOverlay) closeAdminModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAdminModal();
});

// =============================
// PASSWORD TOGGLE
// =============================
function togglePwd() {
  const input = document.getElementById('adminPwdInput');
  const icon = document.getElementById('pwdEyeIcon');

  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// =============================
// LOGIN
// =============================
async function handleAdminLogin(e) {
  e.preventDefault();

  const errorEl = document.getElementById('afError');
  const form = e.target;

  const email = form.querySelector('input[type="email"]')?.value.trim();
  const pwd = form.querySelector('input[type="password"]')?.value;
  const btn = form.querySelector('.af-submit');

  errorEl.textContent = '';

  if (!email || !pwd) {
    errorEl.textContent = 'Please enter email and password';
    return;
  }

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  btn.disabled = true;

  try {
    const res = await fetch('https://o-b-website.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('obk_token', data.token);

    closeAdminModal();
    window.location.href = 'admin-dashboard.html';

  } catch (err) {
    errorEl.textContent = err.message;
    btn.innerHTML = '<span>Sign In to Dashboard</span><i class="fas fa-arrow-right"></i>';
    btn.disabled = false;
  }
}

// =============================
// WISHLIST
// =============================
document.querySelectorAll('.lcard-wish').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    this.textContent = this.textContent === '♡' ? '♥' : '♡';
    this.style.color = this.textContent === '♥' ? '#E8622A' : '';
  });
});

// =============================
// NAV SCROLL
// =============================
window.addEventListener('scroll', function () {
  const nav = document.querySelector('nav');
  if (!nav) return;

  nav.style.background = window.scrollY > 60
    ? 'rgba(13,27,42,0.99)'
    : 'rgba(13,27,42,0.97)';
});

// =============================
// AOS
// =============================
if (window.AOS) {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: false,
    mirror: true
  });
}