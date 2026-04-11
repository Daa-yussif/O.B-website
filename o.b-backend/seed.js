require('dotenv').config();
const mongoose  = require('mongoose');
const Admin     = require('./models/Admin');
const Listing   = require('./models/Listing');
const connectDB = require('./config/db');

const sampleListings = [
  {
    title: 'Lakeside Residential Plot',
    type: 'Residential', status: 'hot',
    location: 'Prampram', region: 'Greater Accra',
    price: 185000, priceUnit: 'plot', size: '0.5 acres',
    description: 'A beautiful flat plot in a serene gated community, perfect for building your dream family home.',
    surveyed: true, titleDeed: true, water: false,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop',
  },
  {
    title: 'Prime Commercial Corner Plot',
    type: 'Commercial', status: 'available',
    location: 'Tantra Hill', region: 'Greater Accra',
    price: 620000, priceUnit: 'plot', size: '1.2 acres',
    description: 'High-traffic corner plot zoned for commercial use. Ideal for retail or offices.',
    surveyed: true, titleDeed: true, water: false,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
  },
  {
    title: 'Scenic Land Plot – Volta Region',
    type: 'Residential', status: 'new',
    location: 'Ho', region: 'Volta',
    price: 95000, priceUnit: 'acre', size: '5 acres',
    description: 'Lush, spacious land with access to natural water features.',
    surveyed: true, titleDeed: true, water: true,
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop',
  },
];

const seed = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in env vars before running seed.js');
    process.exit(1);
  }
  await connectDB();
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
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

    const count = await Listing.countDocuments();
    if (count === 0) {
      await Listing.insertMany(sampleListings);
      console.log(`✅ ${sampleListings.length} sample listings inserted`);
    } else {
      console.log(`ℹ️  ${count} listings already exist — skipping`);
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