const express  = require('express');
const router   = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const Listing  = require('../models/Listing');
const protect  = require('../middleware/auth');

const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video',  maxCount: 1  },
]);

async function safeDestroy(publicId, resourceType = 'image') {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (e) {
    console.warn(`⚠️  Could not delete ${resourceType} ${publicId}:`, e.message);
  }
}

// ── GET /api/listings/stats ────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [total, available, hot, sold] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'available' }),
      Listing.countDocuments({ status: 'hot' }),
      Listing.countDocuments({ status: 'sold' }),
    ]);
    res.json({ success: true, data: { total, available, hot, sold } });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/listings ──────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { type, region, status, search, minPrice, maxPrice, limit = 20, page = 1 } = req.query;
    const filter = {};

    if (type)   filter.type   = type;
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(filter);
    const data  = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // ── Normalize legacy docs that predate multi-image support ──────────────
    const normalized = data.map((l) => {
      if (!l.images || l.images.length === 0) {
        l.images         = l.imageUrl ? [l.imageUrl] : [];
        l.imagePublicIds = l.imagePublicId ? [l.imagePublicId] : [];
      }
      if (!l.videoUrl)      l.videoUrl      = '';
      if (!l.videoPublicId) l.videoPublicId = '';
      return l;
    });

    res.json({ success: true, data: normalized, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/listings/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // ── Normalize legacy doc ─────────────────────────────────────────────────
    if (!listing.images || listing.images.length === 0) {
      listing.images         = listing.imageUrl ? [listing.imageUrl] : [];
      listing.imagePublicIds = listing.imagePublicId ? [listing.imagePublicId] : [];
    }
    if (!listing.videoUrl)      listing.videoUrl      = '';
    if (!listing.videoPublicId) listing.videoPublicId = '';

    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
});
// ── GET /api/listings/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/listings ─────────────────────────────────────────────────────────
router.post('/', protect, (req, res, next) => {
  uploadFields(req, res, async (err) => {
    if (err) return next(err);
    try {
      const {
        title, type, status, location, region,
        price, priceUnit, size, description,
        surveyed, titleDeed, water,
      } = req.body;

      const imageFiles     = req.files?.images || [];
      const videoFiles     = req.files?.video  || [];
      const images         = imageFiles.map((f) => f.path);
      const imagePublicIds = imageFiles.map((f) => f.filename);

      let videoUrl      = '';
      let videoPublicId = '';
      if (videoFiles.length) {
        videoUrl      = videoFiles[0].path;
        videoPublicId = videoFiles[0].filename;
      }

      const listing = await Listing.create({
        title, type, status, location, region,
        price, priceUnit, size, description,
        surveyed:  surveyed  === 'true' || surveyed  === true,
        titleDeed: titleDeed === 'true' || titleDeed === true,
        water:     water     === 'true' || water     === true,
        images,
        imagePublicIds,
        imageUrl:      images[0]         || '',
        imagePublicId: imagePublicIds[0] || '',
        videoUrl,
        videoPublicId,
        postedBy: req.admin?._id,
      });

      res.status(201).json({ success: true, data: listing });
    } catch (err) {
      next(err);
    }
  });
});

// ── PUT /api/listings/:id ──────────────────────────────────────────────────────
router.put('/:id', protect, (req, res, next) => {
  uploadFields(req, res, async (err) => {
    if (err) return next(err);
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

      const {
        title, type, status, location, region,
        price, priceUnit, size, description,
        surveyed, titleDeed, water,
        removeImages, removeVideo,
      } = req.body;

      if (title)          listing.title       = title;
      if (type)           listing.type        = type;
      if (status)         listing.status      = status;
      if (location)       listing.location    = location;
      if (region)         listing.region      = region;
      if (price  != null) listing.price       = price;
      if (priceUnit)      listing.priceUnit   = priceUnit;
      if (size   != null) listing.size        = size;
      if (description != null) listing.description = description;
      listing.surveyed  = surveyed  === 'true' || surveyed  === true;
      listing.titleDeed = titleDeed === 'true' || titleDeed === true;
      listing.water     = water     === 'true' || water     === true;

      if (removeImages) {
        let toRemove = [];
        try { toRemove = JSON.parse(removeImages); } catch {}
        if (toRemove.length) {
          const removedIdxs = toRemove.map((url) => listing.images.indexOf(url)).filter((i) => i !== -1);
          for (const idx of removedIdxs) {
            await safeDestroy(listing.imagePublicIds[idx], 'image');
          }
          listing.images         = listing.images.filter((_, i) => !removedIdxs.includes(i));
          listing.imagePublicIds = listing.imagePublicIds.filter((_, i) => !removedIdxs.includes(i));
        }
      }

      const newImageFiles = req.files?.images || [];
      if (newImageFiles.length) {
        const room   = Math.max(0, 10 - listing.images.length);
        const capped = newImageFiles.slice(0, room);
        listing.images         = [...listing.images,         ...capped.map((f) => f.path)];
        listing.imagePublicIds = [...listing.imagePublicIds, ...capped.map((f) => f.filename)];
      }

      if (removeVideo === 'true' && listing.videoPublicId) {
        await safeDestroy(listing.videoPublicId, 'video');
        listing.videoUrl      = '';
        listing.videoPublicId = '';
      }

      const newVideoFiles = req.files?.video || [];
      if (newVideoFiles.length) {
        if (listing.videoPublicId) await safeDestroy(listing.videoPublicId, 'video');
        listing.videoUrl      = newVideoFiles[0].path;
        listing.videoPublicId = newVideoFiles[0].filename;
      }

      await listing.save();
      res.json({ success: true, data: listing });
    } catch (err) {
      next(err);
    }
  });
});

// ── DELETE /api/listings/:id ───────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    for (const pid of listing.imagePublicIds) await safeDestroy(pid, 'image');
    if (listing.videoPublicId) await safeDestroy(listing.videoPublicId, 'video');

    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;