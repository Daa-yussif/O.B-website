/* ═══════════════════════════════════════════════════════════════════
   script.js  —  O.B Kingsland
   All sensitive data (credentials, secrets) lives ONLY on the backend.
   This file never stores or checks passwords.
═══════════════════════════════════════════════════════════════════ */

/* ── API base (only non-sensitive config allowed in frontend) ──── */
const API_BASE = 'https://o-b-backend.onrender.com/api';
// ↑ Change to your deployed server URL when going live, e.g.:
// const API_BASE = 'https://obkingsland-api.onrender.com/api';

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
  colorModeIcon.classList.toggle('fa-sun',  !isDark);
  colorModeIcon.classList.toggle('fa-moon',  isDark);
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
    icon.classList.toggle('fa-eye',      !show);
    icon.classList.toggle('fa-eye-slash', show);
  }
}

/* ══════════════════════════════════════════════════════════════════
   ADMIN LOGIN  — calls the real backend API
   No passwords are hardcoded here. Credentials are validated
   server-side by bcrypt comparison against the MongoDB record.
══════════════════════════════════════════════════════════════════ */
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
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Server returned 401/400 — wrong credentials or validation error
      throw new Error(data.message || 'Incorrect email or password');
    }

    // ── Success: store JWT token, redirect to dashboard ──────────
    // Only the non-sensitive JWT token is stored in localStorage.
    // The actual password NEVER touches the frontend after this point.
    localStorage.setItem('obk_token', data.token);
    closeAdminModal();
    window.location.href = 'admin-dashboard.html';

  } catch (err) {
    errorEl.textContent = err.message || 'Login failed. Please try again.';
    btn.innerHTML = '<span>Sign In to Dashboard</span><i class="fas fa-arrow-right"></i>';
    btn.disabled  = false;
  }
}

/* ══════════════════════════════════════════════════════════════════
   WISHLIST TOGGLE
══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.lcard-wish').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    this.textContent = this.textContent === '♡' ? '♥' : '♡';
    this.style.color = this.textContent === '♥' ? '#E8622A' : '';
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