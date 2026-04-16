const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    type: {
      type: String,
      required: [true, 'Land type is required'],
      enum: {
        values: ['Residential', 'Commercial'],
        message: 'Type must be Residential or Commercial',
      },
    },
    status: {
      type: String,
      enum: ['available', 'hot', 'new', 'sold'],
      default: 'available',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      enum: [
        'Greater Accra',
        'Ashanti',
        'Western',
        'Eastern',
        'Volta',
        'Northern',
        'Central',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceUnit: {
      type: String,
      enum: ['plot', 'acre', 'sqm'],
      default: 'plot',
    },
    size:        { type: String, trim: true },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    surveyed:  { type: Boolean, default: true  },
    titleDeed: { type: Boolean, default: true  },
    water:     { type: Boolean, default: false },

    // ── Single image — kept in sync with images[0] for backward compatibility ──
    // The public listings page (listings.html) reads imageUrl directly.
    imageUrl:      { type: String, default: '' },
    imagePublicId: { type: String, default: '' },

    // ── Multi-image (admin dashboard photo gallery) ────────────────────────────
    images:         { type: [String], default: [] },
    imagePublicIds: { type: [String], default: [] },

    // ── Video ──────────────────────────────────────────────────────────────────
    videoUrl:      { type: String, default: '' },
    videoPublicId: { type: String, default: '' },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Performance indexes ────────────────────────────────────────────────────────
listingSchema.index({ title: 'text', location: 'text', description: 'text' });
listingSchema.index({ type: 1 });
listingSchema.index({ region: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });

// ── Sync imageUrl ↔ images[0] on every save ────────────────────────────────────
listingSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    // Multi-image path: imageUrl always mirrors images[0]
    this.imageUrl      = this.images[0];
    this.imagePublicId = (this.imagePublicIds && this.imagePublicIds[0]) || this.imagePublicId || '';
  } else if (this.imageUrl && (!this.images || this.images.length === 0)) {
    // Legacy path (seed / old records): populate array from single URL
    this.images         = [this.imageUrl];
    this.imagePublicIds = this.imagePublicId ? [this.imagePublicId] : [];
  }
  next();
});

// ── Same sync when using findByIdAndUpdate ─────────────────────────────────────
listingSchema.pre('findOneAndUpdate', function (next) {
  const u = this.getUpdate();
  if (!u) return next();
  if (u.images && u.images.length > 0) {
    u.imageUrl      = u.images[0];
    u.imagePublicId = (u.imagePublicIds && u.imagePublicIds[0]) || u.imagePublicId || '';
  } else if (u.imageUrl && (!u.images || u.images.length === 0)) {
    u.images         = [u.imageUrl];
    u.imagePublicIds = u.imagePublicId ? [u.imagePublicId] : [];
  }
  next();
});

module.exports = mongoose.models.Listing || mongoose.model('Listing', listingSchema);