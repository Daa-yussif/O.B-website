const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage configuration ──────────────────────────────────────────────────────
// multer-storage-cloudinary passes resource_type through the `params` object.
// The key used is `resource_type` (underscore), NOT `resourceType`.
// For videos, Cloudinary requires resource_type:'video' so it processes them
// correctly instead of treating them as raw files.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');

    const base = {
      folder:        isVideo ? 'obk-listings/videos' : 'obk-listings/images',
      resource_type: isVideo ? 'video' : 'image',
      // Use a timestamp + random suffix as the public_id so filenames are unique
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    };

    if (isVideo) {
      // Videos: no transformation — preserve original quality
      return {
        ...base,
        allowed_formats: ['mp4', 'mov', 'webm', 'avi', 'mkv'],
      };
    } else {
      // Images: auto-compress and convert to WebP for fast loading
      return {
        ...base,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
          {
            width:        1200,
            height:       800,
            crop:         'limit',
            quality:      'auto:good',
            fetch_format: 'auto',
          },
        ],
      };
    }
  },
});

// ── File filter ────────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',  // .mov
    'video/webm',
    'video/x-msvideo',  // .avi
    'video/x-matroska', // .mkv
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type "${file.mimetype}". Allowed: JPG, PNG, WEBP, GIF, MP4, MOV, WEBM`
      ),
      false
    );
  }
};

// ── Multer instance ────────────────────────────────────────────────────────────
// Used with upload.fields([{ name:'images', maxCount:10 }, { name:'video', maxCount:1 }])
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB — large enough for video
    files: 11,                    // max 10 images + 1 video per request
  },
});

module.exports = { cloudinary, upload };