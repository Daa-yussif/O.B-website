require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes      = require('./routes/auth');
const listingsRoutes  = require('./routes/listings');
const siteVisitRoutes = require('./routes/siteVisits');

connectDB();

const app = express();

// ── Trust the first proxy (required for Render / Railway / Heroku) ─────────────
app.set('trust proxy', 1);

// ── Security headers ───────────────────────────────────────────────────────────
app.use(helmet({
  // Allow Cloudinary images to be loaded in the browser
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://o-bkingsland.pages.dev',
  'https://o-b-website.onrender.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// ── Body parsers — JSON/URL-encoded only (NOT multipart; multer handles that) ──
// Keep limits modest. Images and videos come through multer/cloudinary,
// not through express.json, so there is no reason to inflate these limits.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── HTTP request logger ────────────────────────────────────────────────────────
// Use 'combined' in production for proper log entries, 'dev' locally
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Rate limiting ──────────────────────────────────────────────────────────────
// General API limit — intentionally generous so file uploads aren't blocked.
// Each HTTP request to /api counts as 1, regardless of file size.
app.use(
  '/api',
  rateLimit({
    windowMs:    15 * 60 * 1000, // 15 minutes
    max:         200,             // raised from 100 — admin uploads need headroom
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: 'Too many requests, please try again later' },
  })
);

// Stricter limit for login only
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs:    15 * 60 * 1000,
    max:         10,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: 'Too many login attempts, please wait 15 minutes' },
  })
);

// ── Static files ───────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:   true,
    message:   'O.B Kingsland API is running',
    env:       process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/listings',    listingsRoutes);
app.use('/api/site-visits', siteVisitRoutes);

// ── 404 fallback ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API:    http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
});

// ── Unhandled rejection guard ──────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});