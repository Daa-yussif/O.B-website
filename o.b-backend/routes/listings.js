const express   = require('express');
const { body, validationResult } = require('express-validator');
const Listing   = require('../models/Listing');
const { protect }  = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

const router = express.Router();

// GET /api/listings  (public)
router.get('/', async (req, res, next) => {
  try {
    const {
      type, region, status, search,
      sort = 'newest', page = 1, limit = 9,
    } = req.query;

    const filter = {};
    if (type)   filter.type   = type;
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { location:    { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      newest:       { createdAt: -1 },
      oldest:       { createdAt:  1 },
      'price-low':  { price:  1 },
      'price-high': { price: -1 },
    };
    const sortObj  = sortMap[sort] || { createdAt: -1 };
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
      data:  listings,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/stats  (protected)
router.get('/stats', protect, async (req, res, next) => {
  try {
    const [total, available, hot, sold] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ status: { $in: ['available', 'new'] } }),
      Listing.countDocuments({ status: 'hot' }),
      Listing.countDocuments({ status: 'sold' }),
    ]);
    res.status(200).json({ success: true, data: { total, available, hot, sold } });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id  (public)
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings  (protected)
router.post(
  '/',
  protect,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isIn(['Residential', 'Commercial']).withMessage('Invalid land type'),
    body('location').notEmpty().withMessage('Location is required'),
    body('region').notEmpty().withMessage('Region is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const {
        title, type, status, location, region,
        price, priceUnit, size, description,
        surveyed, titleDeed, water,
      } = req.body;

      let imageUrl = '', imagePublicId = '';
      if (req.file) {
        imageUrl      = req.file.path || req.file.secure_url || '';
        imagePublicId = req.file.filename || req.file.public_id || '';
      }

      const listing = await Listing.create({
        title, type,
        status:    status    || 'available',
        location, region,
        price:     Number(price),
        priceUnit: priceUnit || 'plot',
        size, description,
        surveyed:  surveyed  === 'true' || surveyed  === true,
        titleDeed: titleDeed === 'true' || titleDeed === true,
        water:     water     === 'true' || water     === true,
        imageUrl, imagePublicId,
        postedBy: req.admin._id,
      });

      res.status(201).json({ success: true, data: listing });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/listings/:id  (protected)
router.put('/:id', protect, upload.single('image'), async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (req.file && listing.imagePublicId) {
      try { await cloudinary.uploader.destroy(listing.imagePublicId); } catch (_) {}
    }

    const {
      title, type, status, location, region,
      price, priceUnit, size, description,
      surveyed, titleDeed, water,
    } = req.body;

    const updates = {
      ...(title       && { title }),
      ...(type        && { type }),
      ...(status      && { status }),
      ...(location    && { location }),
      ...(region      && { region }),
      ...(price       && { price: Number(price) }),
      ...(priceUnit   && { priceUnit }),
      ...(size        !== undefined && { size }),
      ...(description !== undefined && { description }),
      surveyed:  surveyed  === 'true' || surveyed  === true,
      titleDeed: titleDeed === 'true' || titleDeed === true,
      water:     water     === 'true' || water     === true,
    };

    if (req.file) {
      updates.imageUrl      = req.file.path || req.file.secure_url || '';
      updates.imagePublicId = req.file.filename || req.file.public_id || '';
    }

    const updated = await Listing.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id  (protected)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.imagePublicId) {
      try { await cloudinary.uploader.destroy(listing.imagePublicId); } catch (_) {}
    }
    await listing.deleteOne();
    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;