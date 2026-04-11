/* ── API base (Live Render Backend) ────────────────────────────── */
const API_BASE = 'https://o-b-backend.onrender.com/api';

/* ══════════════════════════════════════════════════════════════════
    COPYRIGHT
══════════════════════════════════════════════════════════════════ */
const copyrightEl = document.getElementById('copyright');
if (copyrightEl) {
  copyrightEl.innerHTML = `© ${new Date().getFullYear()} O.B Kingsland. All rights reserved.`;
}

/* ══════════════════════════════════════════════════════════════════
    DARK / LIGHT MODE
══════════════════════════════════════════════════════════════════ */
const colorModeToggle = document.getElementById('colorModeToggle');
const colorModeIcon   = colorModeToggle ? colorModeToggle.querySelector('i') : null;

// Apply saved mode immediately
applyColorMode(localStorage.getItem('obk_color_mode') || 'light');

if (colorModeToggle) {
  colorModeToggle.addEventListener('click', () => {
    const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyColorMode(next);
    localStorage.setItem('obk_color_mode', next);
  });
}

function applyColorMode(mode) {
  const isDark = mode === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  if (!colorModeIcon) return;
  
  colorModeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  colorModeIcon.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

/* ══════════════════════════════════════════════════════════════════
    SEARCH TABS & FILTER PILLS
══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.stab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', function () {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ══════════════════════════════════════════════════════════════════
    ADMIN MODAL — open / close
══════════════════════════════════════════════════════════════════ */
const adminOverlay   = document.getElementById('adminModalOverlay');
const adminModalClose = document.getElementById('adminModalClose');
const adminToggle    = document.querySelector('.nav-cta');

if (adminOverlay && adminModalClose && adminToggle) {
  adminToggle.addEventListener('click', () => {
    adminOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  adminModalClose.addEventListener('click', closeAdminModal);
  adminOverlay.addEventListener('click', e => {
    if (e.target === adminOverlay) closeAdminModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAdminModal();
  });
}

function closeAdminModal() {
  if (!adminOverlay) return;
  adminOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Password eye toggle ─────────────────────────────────────────── */
function togglePwd() {
  const input = document.getElementById('adminPwdInput');
  const icon  = document.getElementById('pwdEyeIcon');
  if (!input) return;
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  if (icon) {
    icon.classList.toggle('fa-eye', !show);
    icon.classList.toggle('fa-eye-slash', show);
  }
}

/* ══════════════════════════════════════════════════════════════════
    ADMIN LOGIN
══════════════════════════════════════════════════════════════════ */
const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
  loginForm.addEventListener('submit', handleAdminLogin);
}

async function handleAdminLogin(e) {
  e.preventDefault();

  const errorEl  = document.getElementById('afError');
  const form     = e.target;
  const emailEl  = form.querySelector('input[type="email"]');
  const pwdEl    = form.querySelector('input[type="password"]');
  const btn      = form.querySelector('.af-submit');

  if (!emailEl || !pwdEl || !btn) return;

  errorEl.textContent = '';
  const email    = emailEl.value.trim();
  const password = pwdEl.value;

  if (!email || !password) {
    errorEl.textContent = 'Please enter your email and password.';
    return;
  }

  // Show loading state
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';
  btn.disabled  = true;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Incorrect email or password');
    }

    // Success: store JWT token and redirect
    localStorage.setItem('obk_token', data.token);
    closeAdminModal();
    window.location.href = 'admin-dashboard.html';

  } catch (err) {
    errorEl.textContent = err.message || 'Login failed. Please try again.';
    btn.innerHTML = '<span>Sign In to Dashboard</span> <i class="fas fa-arrow-right"></i>';
    btn.disabled  = false;
  }
}

/* ══════════════════════════════════════════════════════════════════
    WISHLIST TOGGLE
══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.lcard-wish').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isWished = this.textContent === '♡';
    this.textContent = isWished ? '♥' : '♡';
    this.style.color = isWished ? '#E8622A' : '';
  });
});

/* ══════════════════════════════════════════════════════════════════
    NAV SCROLL EFFECT
══════════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (!nav) return;
  nav.style.background = window.scrollY > 60
    ? 'rgba(13,27,42,0.99)'
    : 'rgba(13,27,42,0.97)';
});

/* ══════════════════════════════════════════════════════════════════
    AOS ANIMATIONS
══════════════════════════════════════════════════════════════════ */
if (window.AOS) {
  AOS.init({ duration: 800, easing: 'ease-in-out', once: false, mirror: true });
}