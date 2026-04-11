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
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    surveyed:       { type: Boolean, default: true },
    titleDeed:      { type: Boolean, default: true },
    water:          { type: Boolean, default: false },
    imageUrl:       { type: String, default: '' },
    imagePublicId:  { type: String, default: '' },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

listingSchema.index({ title: 'text', location: 'text', description: 'text' });
listingSchema.index({ type: 1 });
listingSchema.index({ region: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);