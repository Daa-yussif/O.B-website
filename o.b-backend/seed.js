require('dotenv').config();
const mongoose  = require('mongoose');
const Admin     = require('./models/Admin');
const Listing   = require('./models/Listing');
const connectDB = require('./config/db');

// ── Sample listings ────────────────────────────────────────────────────────────
// Each listing sets BOTH imageUrl (legacy) and images[] (new) so the data
// is immediately compatible with both the public listings page and the
// admin dashboard media gallery.
const sampleListings = [
  {
    title:       'Lakeside Residential Plot',
    type:        'Residential',
    status:      'hot',
    location:    'Prampram',
    region:      'Greater Accra',
    price:       185000,
    priceUnit:   'plot',
    size:        '0.5 acres',
    description: 'A beautiful flat plot in a serene gated community, perfect for building your dream family home.',
    surveyed:    true,
    titleDeed:   true,
    water:       false,
    imageUrl:    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop',
    images:      ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop'],
    imagePublicIds: [],
    videoUrl:    '',
    videoPublicId: '',
  },
  {
    title:       'Prime Commercial Corner Plot',
    type:        'Commercial',
    status:      'available',
    location:    'Tantra Hill',
    region:      'Greater Accra',
    price:       620000,
    priceUnit:   'plot',
    size:        '1.2 acres',
    description: 'High-traffic corner plot zoned for commercial use. Ideal for retail, offices or mixed-use development.',
    surveyed:    true,
    titleDeed:   true,
    water:       false,
    imageUrl:    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
    images:      ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop'],
    imagePublicIds: [],
    videoUrl:    '',
    videoPublicId: '',
  },
  {
    title:       'Scenic Land Plot – Volta Region',
    type:        'Residential',
    status:      'new',
    location:    'Ho',
    region:      'Volta',
    price:       95000,
    priceUnit:   'acre',
    size:        '5 acres',
    description: 'Lush, spacious land with access to natural water features. Ideal for private development or investment.',
    surveyed:    true,
    titleDeed:   true,
    water:       true,
    imageUrl:    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop',
    images:      ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop'],
    imagePublicIds: [],
    videoUrl:    '',
    videoPublicId: '',
  },
  {
    title:       'Ashanti Agricultural Land',
    type:        'Commercial',
    status:      'available',
    location:    'Kumasi Outskirts',
    region:      'Ashanti',
    price:       240000,
    priceUnit:   'acre',
    size:        '8 acres',
    description: 'Large agricultural land near Kumasi, suitable for farming, agribusiness, or long-term land investment.',
    surveyed:    true,
    titleDeed:   true,
    water:       true,
    imageUrl:    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop',
    images:      ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop'],
    imagePublicIds: [],
    videoUrl:    '',
    videoPublicId: '',
  },
  {
    title:       'Western Region Beachside Plot',
    type:        'Residential',
    status:      'new',
    location:    'Busua',
    region:      'Western',
    price:       310000,
    priceUnit:   'plot',
    size:        '0.75 acres',
    description: 'Stunning beachside plot just minutes from Busua Beach. Perfect for a holiday home or hospitality development.',
    surveyed:    true,
    titleDeed:   true,
    water:       false,
    imageUrl:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
    images:      ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop'],
    imagePublicIds: [],
    videoUrl:    '',
    videoPublicId: '',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
const seed = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error(
      '❌  ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before running seed.js'
    );
    process.exit(1);
  }

  await connectDB();

  try {
    // ── Admin ──────────────────────────────────────────────────────────────────
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists: ${existingAdmin.email}`);
    } else {
      await Admin.create({
        email:    process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        name:     'O.B Kingsland Admin',
      });
      console.log(`✅ Admin created: ${process.env.ADMIN_EMAIL}`);
    }

    // ── Sample listings ────────────────────────────────────────────────────────
    const count = await Listing.countDocuments();
    if (count === 0) {
      await Listing.insertMany(sampleListings);
      console.log(`✅ ${sampleListings.length} sample listings inserted`);
    } else {
      console.log(`ℹ️  ${count} listings already exist — skipping sample insert`);
    }

    console.log('\n🎉 Seed complete!\n');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();