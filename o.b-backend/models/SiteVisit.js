const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema(
  {
    fullName:  { type: String, required: true, trim: true },
    phone:     { type: String, required: true, trim: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    visitDate: { type: Date,   required: true },
    landType:  { type: String, enum: ['Residential', 'Commercial'], required: true },
    budget:    { type: String },
    regions:   { type: [String], required: true },
    plotId:    { type: String },
    notes:     { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteVisit', siteVisitSchema);