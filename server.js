// ═══════════════════════════════════════════════════════════════
// PARADOKS — Ana Sunucu Dosyası
// Güvenlik, Middleware, Rotalar, Hata Yakalayıcılar
// ═══════════════════════════════════════════════════════════════
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');

// Express uygulamasını oluştur
const app = express();

// ── Uploads klasörünü oluştur (yoksa) ──────────────────────────
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ══════════════════════════════════════════════════════════════════
// GÜVENLİK MIDDLEWARE'LERİ
// ══════════════════════════════════════════════════════════════════

// ── 1. Helmet: HTTP güvenlik başlıkları ─────────────────────────
// X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
// Strict-Transport-Security, Content-Security-Policy vb.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Görseller için
  crossOriginResourcePolicy: { policy: "same-site" },
}));

// ── 2. Rate Limiting: Brute-force ve DDoS koruması ──────────────
// Genel rate limit: 15 dakikada max 200 istek
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.' },
});
app.use(generalLimiter);

// Login rate limit: 15 dakikada max 10 giriş denemesi
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
});

// API rate limit: 15 dakikada max 50 API isteği
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'API istek limiti aşıldı.' },
});

// ── 3. HPP: HTTP Parameter Pollution koruması ───────────────────
app.use(hpp());

// ══════════════════════════════════════════════════════════════════
// GENEL MIDDLEWARE YAPILANDIRMASI
// ══════════════════════════════════════════════════════════════════

// JSON body parser (limit: 10kb - büyük payload saldırılarını engelle)
app.use(express.json({ limit: '10kb' }));

// URL-encoded body parser (form verileri için, limit: 10kb)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Statik dosya sunucusu (CSS, JS, resimler vb.)
app.use(express.static('public', {
  maxAge: '1h', // Tarayıcı önbelleği: 1 saat
  etag: true,
  lastModified: true,
}));

// Oturum yönetimi (güvenli ayarlarla)
app.use(session({
  secret: process.env.SESSION_SECRET || 'paradoks-secret-key-2024-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'paradoks.sid', // Varsayılan 'connect.sid' yerine özel isim
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 saat
    httpOnly: true,               // JavaScript ile erişimi engelle (XSS koruması)
    sameSite: 'lax',              // CSRF koruması
    secure: process.env.NODE_ENV === 'production', // HTTPS zorunlu (production'da)
  }
}));

// Her istekte mevcut yolu view'lara aktar (navbar active state için)
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// ── X-Powered-By başlığını kaldır (sunucu bilgisini gizle) ─────
app.disable('x-powered-by');

// ══════════════════════════════════════════════════════════════════
// VIEW ENGINE YAPILANDIRMASI
// ══════════════════════════════════════════════════════════════════

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ══════════════════════════════════════════════════════════════════
// SUNUCUYU BAŞLAT (Async - veritabanı hazır olduktan sonra)
// ══════════════════════════════════════════════════════════════════

(async () => {
  try {
    // Veritabanını başlat (sql.js WASM yüklemesi async)
    await db.init();

    // ── Rotaları import et ve bağla ────────────────────────────────
    const publicRoutes = require('./routes/public');
    const apiRoutes = require('./routes/api');
    const adminRoutes = require('./routes/admin');

    app.use('/', publicRoutes);
    app.use('/api', apiLimiter); // API rotalarına ayrı rate limit
    app.use('/', apiRoutes);
    app.use('/admin/login', loginLimiter); // Login'e ayrı rate limit
    app.use('/', adminRoutes);

    // ── Hata yakalayıcıları ────────────────────────────────────────

    // 404 - Sayfa bulunamadı
    app.use((req, res, next) => {
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 - Sayfa Bulunamadı | PARADOKS</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #070B1A; color: #FFFFFE; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
            .container { padding: 2rem; }
            h1 { font-family: 'Outfit', sans-serif; font-size: 8rem; font-weight: 800; background: linear-gradient(135deg, #8B5CF6, #A78BFA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
            p { color: #9294B8; font-size: 1.2rem; margin: 1rem 0 2rem; }
            a { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: white; border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 20px rgba(139,92,246,0.3); }
            a:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(139,92,246,0.4); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>Aradığınız sayfa bulunamadı.</p>
            <a href="/">Ana Sayfaya Dön</a>
          </div>
        </body>
        </html>
      `);
    });

    // 500 - Sunucu hatası
    app.use((err, req, res, next) => {
      console.error('Sunucu hatası:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>500 - Sunucu Hatası | PARADOKS</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #070B1A; color: #FFFFFE; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
            h1 { font-size: 4rem; color: #A78BFA; }
            p { color: #9294B8; font-size: 1.2rem; margin: 1rem 0 2rem; }
            a { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: white; border-radius: 50px; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div>
            <h1>500</h1>
            <p>Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.</p>
            <a href="/">Ana Sayfaya Dön</a>
          </div>
        </body>
        </html>
      `);
    });

    // ── Sunucuyu dinlemeye başla ────────────────────────────────────
    const PORT = process.env.PORT || 80;

    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════');
      console.log(`  ◾ PARADOKS Sunucu Başlatıldı!`);
      console.log(`  📡 Port: ${PORT}`);
      console.log(`  🌐 URL: http://paradoksweatwear`);
      console.log(`  🔧 Admin: http://paradoksweatwear/admin`);
      console.log(`  🛡️  Güvenlik: Helmet + Rate Limit + HPP`);
      console.log('═══════════════════════════════════════════');
    });

  } catch (error) {
    console.error('Sunucu başlatma hatası:', error);
    process.exit(1);
  }
})();
