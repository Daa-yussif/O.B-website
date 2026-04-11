/**
 * utils/mailer.js
 * Nodemailer email utility for O.B Kingsland site-visit notifications.
 *
 * Triggers:
 *  1. sendSubmissionEmail  → fires when visitor submits the form (immediate)
 *  2. sendStatusEmail      → fires when admin changes status to confirmed / completed / cancelled
 *
 * Setup: add EMAIL_USER and EMAIL_PASS (Gmail App Password) to your .env
 */

const nodemailer = require('nodemailer');

// ── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Gmail App Password — NOT your real Gmail password
  },
});

// ── Shared layout wrapper ────────────────────────────────────────────────────
const wrap = (body) => `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0"
      style="max-width:600px;width:100%;background:#fff;border-radius:16px;
             overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.1)">

      <!-- Header -->
      <tr><td style="background:#0D1B2A;padding:24px 36px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background:#E8622A;border-radius:10px;padding:7px 11px;
                     font-size:15px;font-weight:900;color:#fff;letter-spacing:-0.5px">OBK</td>
          <td style="padding-left:12px">
            <div style="color:#fff;font-size:16px;font-weight:800">O.B Kingsland</div>
            <div style="color:rgba(255,255,255,.4);font-size:11px;
                        letter-spacing:1px;text-transform:uppercase;margin-top:2px">
              Real Estate · Ghana</div>
          </td>
        </tr></table>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px">${body}</td></tr>

      <!-- Footer -->
      <tr><td style="background:#F4F6FA;padding:18px 36px;text-align:center;
                     border-top:1px solid #E2E8F0">
        <p style="color:#9CA3AF;font-size:12px;margin:0;line-height:1.6">
          © ${new Date().getFullYear()} O.B Kingsland · Ghana's trusted land marketplace<br>
          Questions? Simply reply to this email.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

// ── Helper: detail row ───────────────────────────────────────────────────────
const row = (label, value) => `
  <tr>
    <td style="padding:7px 0;font-size:13px;color:#6B7C8D;width:38%">${label}</td>
    <td style="padding:7px 0;font-size:13px;font-weight:700;color:#1A2B3C">${value || '—'}</td>
  </tr>`;

// ── Helper: CTA button ───────────────────────────────────────────────────────
const btn = (href, text) => `
  <a href="${href}"
     style="display:inline-block;background:#E8622A;color:#fff;text-decoration:none;
            padding:13px 28px;border-radius:10px;font-size:14px;font-weight:800;margin-top:22px">
    ${text} →
  </a>`;

const CLIENT = process.env.FRONTEND_URL || 'http://localhost:5500';

// ── 1. Submission confirmation ───────────────────────────────────────────────
async function sendSubmissionEmail(visit) {
  const regions = Array.isArray(visit.regions) ? visit.regions.join(', ') : visit.regions;
  const vDate   = visit.visitDate
    ? new Date(visit.visitDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })
    : 'Flexible';

  const html = wrap(`
    <h2 style="color:#1A2B3C;font-size:22px;font-weight:800;margin:0 0 6px">
      Request received! 👋</h2>
    <p style="color:#6B7C8D;font-size:14px;line-height:1.75;margin:0 0 22px">
      Hi <strong>${visit.fullName}</strong>, we have your free site visit request.
      Our team will call you within <strong>24 hours</strong> to confirm everything.
    </p>

    <div style="background:#F4F6FA;border-radius:12px;padding:18px 22px;margin-bottom:22px">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('📅 Requested date', vDate)}
        ${row('📍 Region(s)', regions)}
        ${row('🏗️ Land type', visit.landType)}
        ${row('💰 Budget', visit.budget || 'Not specified')}
        ${row('📞 We\'ll call', visit.phone)}
      </table>
    </div>

    <div style="background:rgba(232,98,42,.06);border:1px solid rgba(232,98,42,.2);
                border-radius:10px;padding:14px 18px">
      <p style="color:#6B7C8D;font-size:13px;margin:0;line-height:1.65">
        ℹ️ Visits are <strong>completely free</strong>. We also provide free transport to the site.
        Available <strong>Mon–Sat, 8am–5pm</strong>.
      </p>
    </div>
    ${btn(CLIENT + '/listings.html', 'Browse Listings')}
  `);

  await transporter.sendMail({
    from:    `"O.B Kingsland" <${process.env.EMAIL_USER}>`,
    to:      visit.email,
    subject: '📋 Site Visit Request Received – O.B Kingsland',
    html,
  });
}

// ── 2. Status-change notification ───────────────────────────────────────────
async function sendStatusEmail(visit, newStatus) {
  const regions = Array.isArray(visit.regions) ? visit.regions.join(', ') : visit.regions;
  const vDate   = visit.visitDate
    ? new Date(visit.visitDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })
    : 'To be confirmed by agent';

  let subject, html;

  // ── confirmed ──
  if (newStatus === 'confirmed') {
    subject = '✅ Your Site Visit is Confirmed! – O.B Kingsland';
    html = wrap(`
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-flex;width:72px;height:72px;border-radius:50%;
                    background:rgba(16,185,129,.1);border:2px solid rgba(16,185,129,.25);
                    align-items:center;justify-content:center;font-size:34px">✅</div>
      </div>
      <h2 style="color:#1A2B3C;font-size:22px;font-weight:800;margin:0 0 6px;text-align:center">
        Visit confirmed! 🎉</h2>
      <p style="color:#6B7C8D;font-size:14px;line-height:1.75;margin:0 0 22px;text-align:center">
        Great news, <strong>${visit.fullName}</strong>! Our team has confirmed your free site visit.
      </p>

      <div style="background:#F4F6FA;border-radius:12px;padding:18px 22px;margin-bottom:22px">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${row('📅 Visit date', vDate)}
          ${row('📍 Region(s)', regions)}
          ${row('🏗️ Land type', visit.landType)}
          ${row('📞 Your phone', visit.phone)}
        </table>
      </div>

      <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);
                  border-radius:10px;padding:14px 18px">
        <p style="color:#6B7C8D;font-size:13px;margin:0;line-height:1.65">
          🚗 Our agent will call you to confirm exact timing and arrange
          <strong>free transport</strong> to the site. Please keep your phone available.
        </p>
      </div>
      ${btn(CLIENT + '/listings.html', 'Browse More Listings')}
    `);

  // ── completed ──
  } else if (newStatus === 'completed') {
    subject = '🏆 Thanks for Visiting – O.B Kingsland';
    html = wrap(`
      <h2 style="color:#1A2B3C;font-size:22px;font-weight:800;margin:0 0 6px">
        Thanks for the visit, ${visit.fullName}! 🙏</h2>
      <p style="color:#6B7C8D;font-size:14px;line-height:1.75;margin:0 0 22px">
        We hope you enjoyed the site visit. If you'd like to proceed — secure a plot,
        discuss payment plans or view other locations — our agents are ready to help.
      </p>
      <div style="background:#F4F6FA;border-radius:12px;padding:18px 22px;margin-bottom:22px">
        <p style="color:#6B7C8D;font-size:12px;font-weight:700;text-transform:uppercase;
                  letter-spacing:1px;margin:0 0 10px">What's next?</p>
        <ul style="color:#1A2B3C;font-size:13px;line-height:2;padding-left:18px;margin:0">
          <li>Call us to discuss pricing & flexible payment plans</li>
          <li>Book another free visit to other plots you liked</li>
          <li>Start documentation — our team handles everything</li>
        </ul>
      </div>
      ${btn(CLIENT + '/site-visit.html', 'Book Another Visit')}
    `);

  // ── cancelled ──
  } else if (newStatus === 'cancelled') {
    subject = 'ℹ️ Site Visit Cancelled – O.B Kingsland';
    html = wrap(`
      <h2 style="color:#1A2B3C;font-size:22px;font-weight:800;margin:0 0 6px">
        Visit Cancelled</h2>
      <p style="color:#6B7C8D;font-size:14px;line-height:1.75;margin:0 0 22px">
        Hi <strong>${visit.fullName}</strong>, your site visit request has been cancelled.
        If this was a mistake or you'd like to reschedule, booking again is completely free
        and takes under 2 minutes.
      </p>
      <div style="background:#FFF7ED;border:1px solid rgba(232,98,42,.2);
                  border-radius:10px;padding:14px 18px">
        <p style="color:#6B7C8D;font-size:13px;margin:0;line-height:1.65">
          Have questions about the cancellation? Simply reply to this email.
        </p>
      </div>
      ${btn(CLIENT + '/site-visit.html', 'Rebook a Free Visit')}
    `);
  } else {
    return; // no email for 'pending'
  }

  await transporter.sendMail({
    from:    `"O.B Kingsland" <${process.env.EMAIL_USER}>`,
    to:      visit.email,
    subject,
    html,
  });
}

module.exports = { sendSubmissionEmail, sendStatusEmail };