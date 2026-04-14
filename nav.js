/* ═══════════════════════════════════════════════════════════════════
   nav.js — O.B Kingsland | Hamburger · Drawer · Admin Modal
   Place at END of <body> on every page.
═══════════════════════════════════════════════════════════════════ */
(function () {

  /* ─── active link detection ─── */
  const page = location.pathname.split('/').pop() || 'index.html';

  const links = [
    { href: 'index.html',         icon: 'fa-home',          label: 'Home' },
    { href: 'listings.html',      icon: 'fa-map',           label: 'Listings' },
    { href: 'index.html#locations', icon: 'fa-map-marker-alt', label: 'Locations' },
    { href: 'index.html#about',   icon: 'fa-info-circle',   label: 'About' },
    { href: 'payment-plans.html', icon: 'fa-credit-card',   label: 'Payment Plans' },
    { href: 'site-visit.html',    icon: 'fa-car',           label: 'Free Site Visit' },
    { href: 'index.html#contact', icon: 'fa-envelope',      label: 'Contact' },
  ];

  function isActive(href) {
  const [linkPage, linkHash] = href.split('#');
  const currentPage = page || 'index.html';
  const currentHash = location.hash;

  // Page must match first
  if ((linkPage || 'index.html') !== currentPage) return false;

  // If link has hash → match hash exactly
  if (linkHash) {
    return currentHash === '#' + linkHash;
  }

  // If no hash → only active when NO hash on page
  return !currentHash;
}
// Sync active links (mobile + desktop)
const allNavLinks = document.querySelectorAll('.obk-nav-links a, .obk-drawer-links a');

allNavLinks.forEach(link => {
  link.addEventListener('click', function () {
    const href = this.getAttribute('href');

    allNavLinks.forEach(l => {
      l.classList.remove('active');

      if (l.getAttribute('href') === href) {
        l.classList.add('active');
      }
    });
  });
});

  const SVG = `<svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L20 9v6l-8 4-8-4V9l8-4.5z"/></svg>`;
  const LOGO_HTML = `<a href="index.html" class="obk-logo"><div class="obk-logo-icon">${SVG}</div><div class="obk-logo-text">O.B Kingsland</div></a>`;

  /* ─── remove any existing nav / modals to prevent duplicates ─── */
  document.querySelectorAll(
    'nav, .admin-modal-overlay, #adminModalOverlay, .obk-nav, .obk-drawer-overlay, .obk-drawer, .obk-modal-overlay'
  ).forEach(el => el.remove());

  /* ─── inject HTML at top of body ─── */
  document.body.insertAdjacentHTML('afterbegin', `
    <nav class="obk-nav">
      <div class="obk-nav-inner">
        ${LOGO_HTML}
        <div class="obk-nav-links">
          ${links.map(l =>
            `<a href="${l.href}"${isActive(l.href) ? ' class="active"' : ''}>${l.label}</a>`
          ).join('')}
        </div>
        <div class="obk-nav-right">
          <button class="obk-icon-btn" id="obkColorToggle" aria-label="Toggle dark mode"><i class="fas fa-sun"></i></button>
          <button class="obk-admin-btn" id="obkAdminBtn">&#65291; Admin</button>
          <button class="obk-hamburger" id="obkHamburger" aria-label="Open menu" type="button">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <div class="obk-drawer-overlay" id="obkDrawerOverlay"></div>

    <div class="obk-drawer" id="obkDrawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div class="obk-drawer-head">
        ${LOGO_HTML}
        <button class="obk-drawer-close" id="obkDrawerClose" type="button" aria-label="Close navigation">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="obk-drawer-links">
        ${links.map(l =>
          `<a href="${l.href}"${isActive(l.href) ? ' class="active"' : ''}><i class="fas ${l.icon}"></i> ${l.label}</a>`
        ).join('')}
        <div class="obk-drawer-divider"></div>
      </div>
      <div class="obk-drawer-footer">
        <button class="obk-drawer-admin-btn" id="obkDrawerAdminBtn" type="button">
          <i class="fas fa-user-shield"></i> Admin Login
        </button>
      </div>
    </div>

    <div class="obk-modal-overlay" id="obkModalOverlay">
      <div class="obk-modal" role="dialog" aria-modal="true" aria-label="Admin login">
        <div class="obk-modal-left">
          <div class="obk-ml-logo"><div class="obk-logo-icon">${SVG}</div><span class="obk-logo-text">O.B Kingsland</span></div>
          <h2>Admin <em>Portal</em></h2>
          <p>Secure access for authorised personnel only. Manage listings and platform settings.</p>
          <div class="obk-ml-features">
            <div class="obk-ml-feat"><i class="fas fa-shield-alt"></i> SSL Encrypted</div>
            <div class="obk-ml-feat"><i class="fas fa-lock"></i> bcrypt Hashing</div>
            <div class="obk-ml-feat"><i class="fas fa-clock"></i> JWT — 8h Session</div>
          </div>
        </div>
        <div class="obk-modal-right">
          <button class="obk-modal-close" id="obkModalClose" type="button" aria-label="Close admin login"><i class="fas fa-times"></i></button>
          <div class="obk-mr-icon-wrap"><i class="fas fa-user-shield"></i></div>
          <h3>Sign In</h3>
          <p>Enter your administrator credentials</p>
          <form id="obkAdminForm" onsubmit="obkHandleLogin(event)" novalidate>
            <div class="obk-af-group">
              <label for="obkAdminEmail">Email Address</label>
              <div class="obk-af-wrap"><i class="fas fa-envelope"></i><input type="email" id="obkAdminEmail" placeholder="admin@obkingsland.gh" required autocomplete="email"></div>
            </div>
            <div class="obk-af-group">
              <label for="obkAdminPwd">Password</label>
              <div class="obk-af-wrap">
                <i class="fas fa-lock"></i>
                <input type="password" id="obkAdminPwd" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" required autocomplete="current-password">
                <button type="button" class="obk-pwd-toggle" id="obkPwdToggle"><i class="fas fa-eye"></i></button>
              </div>
            </div>
            <div class="obk-af-row">
              <label class="obk-af-check"><input type="checkbox"> <span>Remember me</span></label>
              <a href="#" class="obk-af-forgot">Forgot password?</a>
            </div>
            <button type="submit" class="obk-af-submit" id="obkLoginBtn"><span>Sign In to Dashboard</span><i class="fas fa-arrow-right"></i></button>
            <div class="obk-af-error" id="obkAfError"></div>
          </form>
          <p class="obk-mr-footer">Having trouble? <a href="mailto:support@obkingsland.gh">Contact IT Support</a></p>
        </div>
      </div>
    </div>`);

  /* ─── get refs AFTER insertion ─── */
  const hamburger      = document.getElementById('obkHamburger');
  const drawer         = document.getElementById('obkDrawer');
  const overlay        = document.getElementById('obkDrawerOverlay');
  const closeBtn       = document.getElementById('obkDrawerClose');
  const modalOverlay   = document.getElementById('obkModalOverlay');
  const modalCloseBtn  = document.getElementById('obkModalClose');
  const adminBtn       = document.getElementById('obkAdminBtn');
  const drawerAdminBtn = document.getElementById('obkDrawerAdminBtn');
  const colorBtn       = document.getElementById('obkColorToggle');

  /* ─── drawer open/close ─── */
  function openDrawer() {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    /* focus first link for accessibility */
    setTimeout(() => {
      const first = drawer.querySelector('a, button');
      if (first) first.focus();
    }, 100);
  }

  function closeDrawer() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  /* Hamburger — open */
  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  /* Close button — three methods for iOS compatibility */
  function bindClose(el, fn) {
    el.addEventListener('click',    function (e) { e.stopPropagation(); fn(); });
    el.addEventListener('touchend', function (e) { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false });
    el.onclick = function (e) { e.stopPropagation(); fn(); };
  }

  bindClose(closeBtn, closeDrawer);

  /* Overlay tap closes drawer */
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchend', function (e) {
    e.preventDefault();
    closeDrawer();
  }, { passive: false });

  /* Any nav link inside drawer closes it */
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      /* small delay so the link navigates before drawer closes */
      setTimeout(closeDrawer, 80);
    });
  });

  /* ─── modal open/close ─── */
  function openModal() {
    closeDrawer();
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var emailInput = document.getElementById('obkAdminEmail');
      if (emailInput) emailInput.focus();
    }, 350);
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    var errEl = document.getElementById('obkAfError');
    if (errEl) errEl.textContent = '';
  }

  adminBtn.addEventListener('click', openModal);
  drawerAdminBtn.addEventListener('click', openModal);
  bindClose(modalCloseBtn, closeModal);

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  /* ─── Escape key ─── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modalOverlay.classList.contains('open')) closeModal();
      else if (drawer.classList.contains('open')) closeDrawer();
    }
  });

  /* ─── Color / dark mode ─── */
  var savedMode = localStorage.getItem('obk_color_mode') || 'light';
  applyMode(savedMode);

  colorBtn.addEventListener('click', function () {
    var next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyMode(next);
    localStorage.setItem('obk_color_mode', next);
  });

  function applyMode(mode) {
    document.body.classList.toggle('dark-mode', mode === 'dark');
    var icon = colorBtn.querySelector('i');
    if (icon) icon.className = mode === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }

  /* ─── Password visibility toggle ─── */
  document.getElementById('obkPwdToggle').addEventListener('click', function () {
    var inp = document.getElementById('obkAdminPwd');
    var ico = this.querySelector('i');
    var show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    ico.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  /* ─── Admin login handler ─── */
  window.obkHandleLogin = async function (e) {
    e.preventDefault();
    var email = document.getElementById('obkAdminEmail').value.trim();
    var pwd   = document.getElementById('obkAdminPwd').value;
    var btn   = document.getElementById('obkLoginBtn');
    var err   = document.getElementById('obkAfError');
    err.textContent = '';
    if (!email || !pwd) { err.textContent = 'Please enter your email and password.'; return; }
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;
    try {
      var res  = await fetch('https://o-b-website.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pwd })
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Incorrect email or password');
      localStorage.setItem('obk_token', data.token);
      closeModal();
      window.location.href = 'admin-dashboard.html';
    } catch (ex) {
      err.textContent = ex.message || 'Login failed. Please try again.';
      btn.innerHTML = '<span>Sign In to Dashboard</span><i class="fas fa-arrow-right"></i>';
      btn.disabled = false;
    }
  };

  /* ─── Nav scroll tint ─── */
  window.addEventListener('scroll', function () {
    var nav = document.querySelector('.obk-nav');
    if (nav) nav.style.background = window.scrollY > 60
      ? 'rgba(13,27,42,0.99)'
      : 'rgba(13,27,42,0.97)';
  }, { passive: true });

  /* ─── AOS init ─── */
  if (window.AOS) AOS.init({ duration: 800, easing: 'ease-in-out', once: false, mirror: true });

  /* ─── Dynamic copyright year ─── */
  var cpEl = document.getElementById('copyright');
  if (cpEl) cpEl.innerHTML = '&#169; ' + new Date().getFullYear() + ' O.B Kingsland. All rights reserved.';

  /* ─── Backward-compat aliases for inline handlers on older pages ─── */
  window.handleAdminLogin = window.obkHandleLogin;
  window.closeAdminModal  = closeModal;
  window.togglePwd = function () { document.getElementById('obkPwdToggle').click(); };

})();