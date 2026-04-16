require('dotenv').config();
const mongoose  = require('mongoose');
const connectDB = require('../config/db');
const Listing   = require('../models/Listing');

(async () => {
  await connectDB();

  const listings = await Listing.find({
    $or: [
      { images: { $exists: false } },
      { images: { $size: 0 } },
    ],
  });

  console.log(`Found ${listings.length} legacy listings to migrate`);

  for (const l of listings) {
    if (l.imageUrl && (!l.images || l.images.length === 0)) {
      l.images         = [l.imageUrl];
      l.imagePublicIds = l.imagePublicId ? [l.imagePublicId] : [];
      await l.save();
      console.log(`✅ Migrated: ${l.title}`);
    }
  }

  console.log('Migration complete');
  await mongoose.disconnect();
  process.exit(0);
})();