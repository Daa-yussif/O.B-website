/* ═══════════════════════════════════════════════════════════════════
   nav.js  —  O.B Kingsland  |  Shared nav component
   Injects: top nav, hamburger, slide drawer, admin login modal.
   Include at the END of <body> on every page.
   Usage: <script src="nav.js"></script>
═══════════════════════════════════════════════════════════════════ */

(function () {

  /* ── Detect current page for active link ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  const isActive = (href) => {
    if (href === '#' || href === 'index.html') return page === 'index.html' || page === '';
    return page === href;
  };

  const links = [
    { href: 'index.html',      icon: 'fa-home',         label: 'Home' },
    { href: '#featured',       icon: 'fa-star',          label: 'Featured' },
    { href: 'listings.html',   icon: 'fa-map',           label: 'Listings' },
    { href: '#locations',      icon: 'fa-map-marker-alt', label: 'Locations' },
    { href: '#about',          icon: 'fa-info-circle',   label: 'About' },
    { href: 'site-visit.html', icon: 'fa-car',           label: 'Free Site Visit' },
    { href: '#contact',        icon: 'fa-envelope',      label: 'Contact' },
  ];

  const LOGO_SVG = `<svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L20 9v6l-8 4-8-4V9l8-4.5z"/></svg>`;

  const LOGO_HTML = `
    <a href="index.html" class="obk-logo">
      <div class="obk-logo-icon">${LOGO_SVG}</div>
      <div class="obk-logo-text">O.B Kingsland</div>
    </a>`;

  /* ── Build nav HTML ── */
  const navHTML = `
  <nav class="obk-nav">
    <div class="obk-nav-inner">
      ${LOGO_HTML}

      <div class="obk-nav-links">
        ${links.map(l =>
          `<a href="${l.href}" class="${isActive(l.href) ? 'active' : ''}">${l.label}</a>`
        ).join('')}
      </div>

      <div class="obk-nav-right">
        <button class="obk-icon-btn" id="obkColorToggle" aria-label="Toggle dark mode">
          <i class="fas fa-sun"></i>
        </button>
        <button class="obk-admin-btn" id="obkAdminBtn">＋ Admin</button>
        <button class="obk-hamburger" id="obkHamburger" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>`;

  /* ── Build drawer HTML ── */
  const drawerHTML = `
  <div class="obk-drawer-overlay" id="obkDrawerOverlay"></div>
  <div class="obk-drawer" id="obkDrawer">
    <div class="obk-drawer-head">
      ${LOGO_HTML}
      <button class="obk-drawer-close" id="obkDrawerClose"><i class="fas fa-times"></i></button>
    </div>
    <div class="obk-drawer-links">
      ${links.map(l =>
        `<a href="${l.href}" class="${isActive(l.href) ? 'active' : ''}">
           <i class="fas ${l.icon}"></i> ${l.label}
         </a>`
      ).join('')}
      <div class="obk-drawer-divider"></div>
    </div>
    <div class="obk-drawer-footer">
      <button class="obk-drawer-admin-btn" id="obkDrawerAdminBtn">
        <i class="fas fa-user-shield"></i> Admin Login
      </button>
    </div>
  </div>`;

  /* ── Build admin modal HTML ── */
  const modalHTML = `
  <div class="obk-modal-overlay" id="obkModalOverlay">
    <div class="obk-modal" role="dialog" aria-modal="true" aria-label="Admin Login">
      <div class="obk-modal-left">
        <div class="obk-ml-logo">
          <div class="obk-logo-icon">${LOGO_SVG}</div>
          <span class="obk-logo-text">O.B Kingsland</span>
        </div>
        <h2>Admin <em>Portal</em></h2>
        <p>Secure access for authorised personnel only. Manage listings and platform settings.</p>
        <div class="obk-ml-features">
          <div class="obk-ml-feat"><i class="fas fa-shield-alt"></i> SSL Encrypted Connection</div>
          <div class="obk-ml-feat"><i class="fas fa-lock"></i> bcrypt Password Hashing</div>
          <div class="obk-ml-feat"><i class="fas fa-clock"></i> JWT Session — 8h timeout</div>
        </div>
      </div>

      <div class="obk-modal-right">
        <button class="obk-modal-close" id="obkModalClose" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
        <div class="obk-mr-icon-wrap"><i class="fas fa-user-shield"></i></div>
        <h3>Sign In</h3>
        <p>Enter your administrator credentials</p>

        <form id="obkAdminForm" onsubmit="obkHandleLogin(event)" novalidate>
          <div class="obk-af-group">
            <label for="obkAdminEmail">Email Address</label>
            <div class="obk-af-wrap">
              <i class="fas fa-envelope"></i>
              <input type="email" id="obkAdminEmail" placeholder="admin@obkingsland.gh" required autocomplete="email">
            </div>
          </div>
          <div class="obk-af-group">
            <label for="obkAdminPwd">Password</label>
            <div class="obk-af-wrap">
              <i class="fas fa-lock"></i>
              <input type="password" id="obkAdminPwd" placeholder="••••••••••" required autocomplete="current-password">
              <button type="button" class="obk-pwd-toggle" id="obkPwdToggle" aria-label="Show password">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="obk-af-row">
            <label class="obk-af-check"><input type="checkbox"> <span>Remember me</span></label>
            <a href="#" class="obk-af-forgot">Forgot password?</a>
          </div>
          <button type="submit" class="obk-af-submit" id="obkLoginBtn">
            <span>Sign In to Dashboard</span>
            <i class="fas fa-arrow-right"></i>
          </button>
          <div class="obk-af-error" id="obkAfError"></div>
        </form>
        <p class="obk-mr-footer">Having trouble? <a href="mailto:support@obkingsland.gh">Contact IT Support</a></p>
      </div>
    </div>
  </div>`;

  /* ── Inject into DOM ── */
  // Remove any existing old nav + old admin modal to avoid duplicates
  document.querySelector('nav')?.remove();
  document.querySelector('.admin-modal-overlay')?.remove();
  document.querySelector('#adminModalOverlay')?.remove();

  // Remove old padding-top from body if set inline (pages set it themselves)
  // nav.css handles it via var(--nav-h)

  // Prepend nav, drawer, modal
  document.body.insertAdjacentHTML('afterbegin', navHTML + drawerHTML + modalHTML);

  /* ── Color mode ── */
  const colorBtn = document.getElementById('obkColorToggle');
  const savedMode = localStorage.getItem('obk_color_mode') || 'light';
  applyMode(savedMode);

  colorBtn?.addEventListener('click', () => {
    const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyMode(next);
    localStorage.setItem('obk_color_mode', next);
  });

  function applyMode(mode) {
    const dark = mode === 'dark';
    document.body.classList.toggle('dark-mode', dark);
    const icon = colorBtn?.querySelector('i');
    if (icon) {
      icon.className = dark ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  /* ── Hamburger + drawer ── */
  const hamburger     = document.getElementById('obkHamburger');
  const drawer        = document.getElementById('obkDrawer');
  const drawerOverlay = document.getElementById('obkDrawerOverlay');
  const drawerClose   = document.getElementById('obkDrawerClose');

  function openDrawer() {
    hamburger?.classList.add('open');
    drawer?.classList.add('open');
    drawerOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    hamburger?.classList.remove('open');
    drawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  // Close drawer when a link is tapped
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ── Admin modal ── */
  const modalOverlay = document.getElementById('obkModalOverlay');
  const modalClose   = document.getElementById('obkModalClose');
  const adminBtn     = document.getElementById('obkAdminBtn');
  const drawerAdminBtn = document.getElementById('obkDrawerAdminBtn');

  function openModal() {
    closeDrawer();
    modalOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('obkAdminEmail')?.focus(), 300);
  }
  function closeModal() {
    modalOverlay?.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('obkAfError').textContent = '';
  }

  adminBtn?.addEventListener('click', openModal);
  drawerAdminBtn?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

  /* ── Password eye toggle ── */
  document.getElementById('obkPwdToggle')?.addEventListener('click', () => {
    const inp  = document.getElementById('obkAdminPwd');
    const icon = document.querySelector('#obkPwdToggle i');
    const show = inp.type === 'password';
    inp.type   = show ? 'text' : 'password';
    icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  /* ── Escape key ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeDrawer(); }
  });

  /* ── Admin login — calls real backend ── */
  window.obkHandleLogin = async function (e) {
    e.preventDefault();
    const email    = document.getElementById('obkAdminEmail').value.trim();
    const password = document.getElementById('obkAdminPwd').value;
    const btn      = document.getElementById('obkLoginBtn');
    const errEl    = document.getElementById('obkAfError');
    errEl.textContent = '';

    if (!email || !password) {
      errEl.textContent = 'Please enter your email and password.';
      return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    btn.disabled  = true;

    try {
      const res  = await fetch('https://o-b-website.onrender.com/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Incorrect email or password');

      localStorage.setItem('obk_token', data.token);
      closeModal();
      window.location.href = 'admin-dashboard.html';
    } catch (err) {
      errEl.textContent = err.message || 'Login failed. Please try again.';
      btn.innerHTML = '<span>Sign In to Dashboard</span><i class="fas fa-arrow-right"></i>';
      btn.disabled  = false;
    }
  };

  /* ── Nav scroll effect ── */
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.obk-nav');
    if (!nav) return;
    nav.style.background = window.scrollY > 60
      ? 'rgba(13,27,42,0.99)'
      : 'rgba(13,27,42,0.97)';
  }, { passive: true });

  /* ── Maintain backward compat: handleAdminLogin still works ── */
  window.handleAdminLogin = window.obkHandleLogin;
  window.closeAdminModal  = closeModal;
  window.togglePwd        = () => document.getElementById('obkPwdToggle')?.click();

})();
