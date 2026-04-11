// Update copyright year dynamically
const copyrightEl = document.getElementById('copyright');
if (copyrightEl) {
  copyrightEl.innerHTML = `© ${new Date().getFullYear()} O.B Kingsland. All rights reserved.`;
}

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
  colorModeIcon.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

// Search tabs
document.querySelectorAll('.stab').forEach(tab=>{
  tab.addEventListener('click',function(){
    document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
    this.classList.add('active');
  });
});

// Filter pills
document.querySelectorAll('.filter-pill').forEach(pill=>{
  pill.addEventListener('click',function(){
    document.querySelectorAll('.filter-pill').forEach(p=>p.classList.remove('active'));
    this.classList.add('active');
  });
});
// Admin Modal
const adminOverlay = document.getElementById('adminModalOverlay');
const adminModalClose = document.getElementById('adminModalClose');
const adminToggle = document.querySelector('.nav-cta');

if (adminOverlay && adminModalClose && adminToggle) {
  adminToggle.addEventListener('click', function(){
    adminOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  adminModalClose.addEventListener('click', closeAdminModal);

  adminOverlay.addEventListener('click', function(e){
    if(e.target === adminOverlay) closeAdminModal();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeAdminModal();
  });
}

function closeAdminModal(){
  adminOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function togglePwd(){
  const input = document.getElementById('adminPwdInput');
  const icon  = document.getElementById('pwdEyeIcon');
  if(input.type === 'password'){
    input.type = 'text';
    icon.classList.replace('fa-eye','fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash','fa-eye');
  }
}

async function handleAdminLogin(e){
  e.preventDefault();
  const errorEl = document.getElementById('afError');
  const form    = e.target;
  const emailEl = form.querySelector('input[type="email"]');
  const pwdEl   = form.querySelector('input[type="password"]');
  const btn     = form.querySelector('.af-submit');
  errorEl.textContent = '';
  const email    = emailEl.value.trim();
  const password = pwdEl.value;
  if(!email || !password){
    errorEl.textContent = 'Please enter your email and password.';
    return;
  }
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  btn.disabled  = true;
  try {
    const res  = await fetch('https://o-b-backend.onrender.com/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message || 'Incorrect email or password');
    localStorage.setItem('obk_token', data.token);
    closeAdminModal();
    window.location.href = 'admin-dashboard.html';
  } catch(err){
    errorEl.textContent = err.message || 'Login failed. Please try again.';
    btn.innerHTML = '<span>Sign In to Dashboard</span><i class="fas fa-arrow-right"></i>';
    btn.disabled  = false;
  }
}

// Wishlist toggle
document.querySelectorAll('.lcard-wish').forEach(btn=>{
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    this.textContent = this.textContent==='♡' ? '♥' : '♡';
    this.style.color = this.textContent==='♥' ? '#E8622A' : '';
  });
});

// Nav scroll effect
window.addEventListener('scroll',function(){
  const nav=document.querySelector('nav');
  if(window.scrollY>60){
    nav.style.background='rgba(13,27,42,0.99)';
  } else {
    nav.style.background='rgba(13,27,42,0.97)';
  }
});

// Initialize AOS animations
if (window.AOS) {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: false,
    mirror: true
  });
}