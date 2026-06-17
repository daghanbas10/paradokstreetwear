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
const bcrypt = require('bcryptjs');

// ── Otomatik Seed (her başlangıçta veritabanını güncelle) ────────
function autoSeed() {
  try {
    const adminUsername = 'king';
    const adminPassword = 'dag170898han1907';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    
    // Her başlangıçta admin şifresini zorla sıfırla
    db.prepare('DELETE FROM admins WHERE id = 1').run();
    db.prepare('INSERT INTO admins (id, username, password) VALUES (1, ?, ?)').run(adminUsername, hashedPassword);
    console.log('[SEED] Admin kullanıcı oluşturuldu: admin / admin123');
    
    const insertPost = db.prepare('INSERT OR REPLACE INTO posts (id, title, slug, content, excerpt, cover_image, is_published, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)');
    
    const posts = [
      { id: 1, title: 'Yazlık Kombin Rehberi: Oversize Tişört + Şort Formülleri', slug: 'yazlik-kombin-rehberi', cover_image: '/uploads/blog-combo.png', excerpt: 'Bu yaz oversize tişört ve şortla nasıl profesyonel kombin kurarsın? 5 altın formül burada.', content: '<h2>Yaz Kombini = Oversize + Şort</h2><p>Sıcak havalarda hem rahat hem şık olmanın formülü basit: doğru oversize tişört + doğru şort. İşte 5 kombin formülü:</p><h2>1. Siyah Oversize + Cargo Şort</h2><p>Klasik siyah oversize tişört, haki cargo şortla buluşunca sokak stilinin kralı olursun. Yanına chunky sneaker ekle.</p><h2>2. Beyaz Basic + Mesh Şort</h2><p>Minimal beyaz tişört ve siyah mesh şort — basketbol sahalarından sokaklara taşan en temiz kombin.</p><h2>3. Crop Top + High-Waist Şort</h2><p>Kadınlar için: adaçayı yeşili crop top ve bej yüksek bel şort. Bucket hat ile tamamla.</p><h2>4. Yazlık Set Kombini</h2><p>Aynı renk şort ve tişört seti — kombin düşünmeden anında hazırsın. Taş grisi veya kum rengi tercih et.</p><h2>5. Polo + Bermuda</h2><p>Biraz daha smart-casual istiyorsan: lacivert polo yaka tişört ve bej bermuda şort. Loafer veya beyaz sneaker ile bitir.</p><blockquote>PARADOKS yaz koleksiyonu quick-dry kumaşlarla İstanbul yazına özel tasarlandı. Terlemeden stilinden ödün verme.</blockquote>', created_at: '2026-06-08 10:00:00' },
      { id: 2, title: 'Sokak Kültürü ve Yaz: Skate Parklarından Sahil Kenarlarına', slug: 'sokak-kulturu-ve-yaz', cover_image: '/uploads/blog-culture.png', excerpt: 'Sokak kültürü yazın nasıl değişir? Skate parklarından sahil kenarlarına uzanan stil yolculuğu.', content: '<h2>Yaz Gelince Sokak Değişir</h2><p>Kışın hoodie ve jogger ile dolan sokaklar, yazın mesh şortlar, crop toplar ve bucket hatlerle bambaşka bir enerjiye bürünür.</p><h2>Skate Parkları: Yazın Kalbi</h2><p>Yazın skate parkları sadece kaykay mekanı değil, stil podyumu. Oversize tişört, vans ve grafik baskılı şortlar buranın üniforması.</p><h2>Sahil Stili x Sokak Stili</h2><p>İstanbul gibi sahil şehirlerinde streetwear ve plaj kültürü iç içe geçer. Cargo şortla sahile, mesh şortla kafeye gidebilirsin.</p><h2>Festivaller ve Açık Hava</h2><p>Yaz festivalleri streetwear için en büyük sahne. Tie-dye tişörtler, neon aksanlar ve limitli parçalar burada parlar.</p><h2>PARADOKS Yaz Felsefesi</h2><p>Biz yazı sadece bir mevsim değil, bir tutum olarak görüyoruz. Hafif kumaşlar, cesur kesimler, minimal logolar — sıcağa rağmen stilinden vazgeçmeyenler için.</p><blockquote>"Sokak stili mevsim tanımaz, sadece form değiştirir." — PARADOKS</blockquote>', created_at: '2026-06-12 14:30:00' },
      { id: 3, title: 'Yaz 2026 Trend Raporu: Bu Sezon Ne Giyiyoruz?', slug: 'yaz-2026-trend-raporu', cover_image: '/uploads/blog-trends.png', excerpt: 'Mesh şortlar, crop toplar, cargo detaylar ve washed tonlar — 2026 yazının en sıcak trendleri.', content: '<h2>2026 Yazında 5 Büyük Trend</h2><p>Bu yaz sokak modası daha cesur, daha ferah ve daha renkli. İşte kaçırmamanız gereken trendler:</p><h2>1. Crop Top Patlaması</h2><p>Sadece kadınlar için değil, erkekler de crop top denemeye başladı. Adaçayı yeşili ve kemik beyazı en popüler tonlar.</p><h2>2. Mesh ve Quick-Dry Kumaşlar</h2><p>Teknolojik kumaşlar artık sadece spor için değil. Mesh şortlar ve quick-dry tişörtler günlük sokak stilinin parçası.</p><h2>3. Washed-Out ve Soluk Tonlar</h2><p>Parlak renkler yerini solmuş efektli pastel tonlara bırakıyor. Lavanta, soluk turuncu ve kum rengi her yerde.</p><h2>4. Fonksiyonel Cepler</h2><p>Cargo şortlar ve çok cepli yelekler bu yazın olmazsa olmazı. Güzel göründüğü kadar işlevsel de olmalı.</p><h2>5. Minimal Logoculuk</h2><p>Dev logolar gitti, küçük işlemeli detaylar geldi. Kaliteyi logonun büyüklüğü değil, kumaşın dokusu anlatıyor.</p><h3>PARADOKS\'un Yaz Seçkisi</h3><p>9 kategoride yazlık koleksiyon: oversize tişört, crop top, mesh şort, cargo şort, polo yaka, yazlık set, basic, aksesuar ve limited summer drop.</p>', created_at: '2026-06-15 09:15:00' }
    ];
    
    for (const p of posts) {
      insertPost.run(p.id, p.title, p.slug, p.content, p.excerpt, p.cover_image, p.created_at);
    }
    console.log('✓ Veritabanı seed güncellendi (admin + 3 blog)');
  } catch (e) {
    console.log('Seed zaten mevcut veya hata:', e.message);
  }
}

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

// Üyelik rate limit: 15 dakikada max 5 kayıt denemesi (bot koruması)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla kayıt denemesi. Lütfen 15 dakika sonra tekrar deneyin.' },
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
    autoSeed();

    // ── Rotaları import et ve bağla ────────────────────────────────
    const publicRoutes = require('./routes/public');
    const apiRoutes = require('./routes/api');
    const adminRoutes = require('./routes/admin');

    app.use('/', publicRoutes);
    app.use('/api', apiLimiter); // API rotalarına ayrı rate limit
    app.use('/', apiRoutes);
    app.use('/admin/login', loginLimiter); // Login'e ayrı rate limit
    app.use('/', adminRoutes);

    // ── Üyelik API (Rate Limited) ──────────────────────────────────
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

    app.post('/api/register', registerLimiter, (req, res) => {
      try {
        const { name, email, phone, category, size } = req.body;

        // Validasyon
        if (!name || !email) {
          return res.status(400).json({ error: 'Ad ve e-posta zorunludur.' });
        }
        if (name.trim().length < 2 || name.trim().length > 100) {
          return res.status(400).json({ error: 'Ad en az 2, en fazla 100 karakter olmalı.' });
        }
        if (!EMAIL_REGEX.test(email)) {
          return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz.' });
        }

        // Mükerrer kontrol
        const existing = db.prepare('SELECT id FROM members WHERE email = ?').get(email.toLowerCase().trim());
        if (existing) {
          return res.status(409).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // Kayıt
        db.prepare('INSERT INTO members (name, email, phone, category, size) VALUES (?, ?, ?, ?, ?)').run(
          name.trim(),
          email.toLowerCase().trim(),
          phone ? phone.trim() : null,
          category || null,
          size || null
        );

        console.log('[REGISTER] Yeni üye:', email);
        res.status(201).json({ success: true, message: 'Başarıyla kaydoldun!' });
      } catch (err) {
        console.error('[REGISTER] Hata:', err.message);
        res.status(500).json({ error: 'Sunucu hatası. Lütfen tekrar deneyin.' });
      }
    });

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
