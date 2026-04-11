const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin   = require('../models/Admin');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Incorrect email or password' });
      }
      admin.lastLogin = Date.now();
      await admin.save({ validateBeforeSave: false });
      const token = signToken(admin._id);
      res.status(200).json({
        success: true,
        token,
        admin: { id: admin._id, email: admin.email, name: admin.name },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/auth/me  (protected) ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    admin: { id: req.admin._id, email: req.admin.email, name: req.admin.name, lastLogin: req.admin.lastLogin },
  });
});

// ── POST /api/auth/change-password  (protected) ───────────────────────────────
router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    admin.password = newPassword;
    await admin.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/setup ──────────────────────────────────────────────────────
// ONE-TIME route to create the first admin on a fresh deployment (e.g. Render).
// Requires SETUP_SECRET env var to be set. Remove it from env vars after use.
router.post('/setup', async (req, res, next) => {
  try {
    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret) {
      return res.status(403).json({ success: false, message: 'Setup disabled. Set SETUP_SECRET in env vars to enable.' });
    }
    if (req.body.secret !== setupSecret) {
      return res.status(403).json({ success: false, message: 'Invalid setup secret.' });
    }
    const existing = await Admin.findOne({});
    if (existing) {
      return res.status(400).json({ success: false, message: `Admin already exists: ${existing.email}. Remove SETUP_SECRET from env vars.` });
    }
    const email    = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in env vars.' });
    }
    const admin = await Admin.create({ email, password, name: 'O.B Kingsland Admin' });
    res.status(201).json({ success: true, message: `Admin created: ${admin.email}. NOW delete SETUP_SECRET from Render env vars!` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;