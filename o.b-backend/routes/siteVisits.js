const express   = require('express');
const { body, validationResult } = require('express-validator');
const SiteVisit = require('../models/SiteVisit');
const { protect } = require('../middleware/auth');
const { sendSubmissionEmail, sendStatusEmail } = require('../utils/mailer');

const router = express.Router();

// ── POST /api/site-visits  (public — form submission) ────────────────────────
router.post(
  '/',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('visitDate').notEmpty().withMessage('Preferred visit date is required'),
    body('landType').isIn(['Residential', 'Commercial']).withMessage('Invalid land type'),
    body('regions').isArray({ min: 1 }).withMessage('Select at least one region'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const visit = await SiteVisit.create({
        fullName:  req.body.fullName,
        phone:     req.body.phone,
        email:     req.body.email,
        visitDate: new Date(req.body.visitDate),
        landType:  req.body.landType,
        budget:    req.body.budget  || '',
        regions:   req.body.regions,
        plotId:    req.body.plotId  || '',
        notes:     req.body.notes   || '',
      });

      // ── Send confirmation email (non-blocking — never fails the request) ──
      sendSubmissionEmail(visit).catch((err) =>
        console.error('📧 Submission email error:', err.message)
      );

      res.status(201).json({
        success: true,
        message: 'Site visit request received! We will contact you within 24 hours.',
        data: { id: visit._id },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/site-visits  (protected — admin) ────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
        { phone:    { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [visits, total] = await Promise.all([
      SiteVisit.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      SiteVisit.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
      data:  visits,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/site-visits/stats  (protected — for dashboard badge) ────────────
router.get('/stats', protect, async (req, res, next) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      SiteVisit.countDocuments(),
      SiteVisit.countDocuments({ status: 'pending' }),
      SiteVisit.countDocuments({ status: 'confirmed' }),
      SiteVisit.countDocuments({ status: 'completed' }),
      SiteVisit.countDocuments({ status: 'cancelled' }),
    ]);
    res.status(200).json({ success: true, data: { total, pending, confirmed, completed, cancelled } });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/site-visits/:id/status  (protected — triggers email) ──────────
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const visit = await SiteVisit.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit request not found' });
    }

    // ── Fire status-change email for confirmed / completed / cancelled ──
    if (['confirmed', 'completed', 'cancelled'].includes(status)) {
      sendStatusEmail(visit, status).catch((err) =>
        console.error(`📧 Status email (${status}) error:`, err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: `Status updated to "${status}"${['confirmed','completed','cancelled'].includes(status) ? ' — email sent to visitor' : ''}`,
      data: visit,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/site-visits/:id  (protected) ─────────────────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const visit = await SiteVisit.findByIdAndDelete(req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit request not found' });
    }
    res.status(200).json({ success: true, message: 'Visit request deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;