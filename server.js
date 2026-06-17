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
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    
    db.prepare('INSERT OR REPLACE INTO admins (id, username, password) VALUES (1, ?, ?)').run(adminUsername, hashedPassword);
    
    const insertPost = db.prepare('INSERT OR REPLACE INTO posts (id, title, slug, content, excerpt, cover_image, is_published, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)');
    
    const posts = [
      { id: 1, title: 'Oversize Tişört Nasıl Kombinlenir? 7 Sokak Stili İlhamı', slug: 'oversize-tisort-nasil-kombinlenir', cover_image: '/uploads/blog-tshirt.png', excerpt: 'Oversize tişörtü sokak stilinde profesyonel gibi kombinlemenin 7 altın kuralı.', content: '<h2>Oversize Tişört: Sokağın Vazgeçilmezi</h2><p>Oversize tişört, streetwear kültürünün temel taşıdır. İşte profesyonel gibi oversize giymek için 7 altın kural:</p><h2>1. Altına Slim Fit veya Tapered Pantolon</h2><p>Üst geniş, alt dar — bu kontrast vücudunu dengeler.</p><h2>2. Katmanlama Sanatı</h2><p>Oversize tişörtün altına uzun kollu beyaz tişört giy. Bu layering tekniği anında seviye atlatır.</p><h2>3. Aksesuar ile Fark Yarat</h2><p>Zincir kolye, bucket hat veya crossbody çanta ekle.</p><h2>4. Sneaker Seçimi Kritik</h2><p>Chunky sneaker veya Air Force 1 gibi klasikler oversize ile mükemmel uyum sağlar.</p><h2>5. Renk Paleti Oluştur</h2><p>Monokrom veya complementary paletlerle kombin kur.</p><h2>6. Front Tuck Tekniği</h2><p>Tişörtün ön kısmını bele hafifçe sok, arkasını serbest bırak.</p><h2>7. Güven En İyi Aksesuar</h2><p>Ne giyersen giy, eğer rahat hissediyorsan doğru yoldasın.</p><blockquote>PARADOKS oversize tişörtleri 300gsm heavy-weight penye pamuktan üretilir.</blockquote>', created_at: '2026-06-01 10:00:00' },
      { id: 2, title: 'Hoodie Kültürü: Kapüşonlunun Sokaktan Podyuma Yolculuğu', slug: 'hoodie-kulturu-kapusonlunun-yolculugu', cover_image: '/uploads/blog-hoodie.png', excerpt: 'Hoodie nasıl depo işçilerinin kıyafetinden milyar dolarlık moda ikonuna dönüştü?', content: '<h2>Bir Kapüşonun Hikâyesi</h2><p>1930\'larda New York\'taki depo işçileri için üretilen hoodie, bugün milyar dolarlık moda endüstrisinin en ikonik parçası.</p><h2>Hip-Hop ve Hoodie</h2><p>80\'lerde Run-DMC ve LL Cool J gibi hip-hop sanatçıları hoodie\'yi sahneye taşıdı. Artık hoodie sadece bir kıyafet değil, bir tutumdu.</p><h2>Skate Kültürü Etkisi</h2><p>90\'larda Thrasher ve Supreme gibi markalar hoodie\'yi skate kültürüyle birleştirdi.</p><h2>Lüks Markalar Sahneye Çıkıyor</h2><p>2010\'lardan itibaren Balenciaga, Vetements ve Off-White hoodie\'yi lüks moda dünyasına taşıdı.</p><h2>PARADOKS Hoodie Farkı</h2><ul><li><strong>400gsm French Terry:</strong> Dört mevsim konfor</li><li><strong>YKK Fermuar:</strong> Binlerce açılış-kapanışa dayanır</li><li><strong>Çift Katmanlı Kapüşon:</strong> Form kaybetmez</li></ul><blockquote>"Hoodie sadece bir kıyafet değil, bir zırhtır."</blockquote>', created_at: '2026-06-05 14:30:00' },
      { id: 3, title: '2026 Yaz Trendleri: Bu Yaz Ne Giyiyoruz?', slug: '2026-yaz-trendleri', cover_image: '/uploads/blog-shorts.png', excerpt: '2026 yazının en sıcak sokak stili trendleri: mesh şortlar, cargo detaylar ve retro spor referansları.', content: '<h2>Yaz 2026: Sokak Stilinde Sıcak Trendler</h2><p>Bu yaz sokak modası daha cesur, daha renkli ve daha rahat.</p><h2>1. Mesh Şortlar Geri Döndü</h2><p>Basketbol sahalarından sokaklara taşan mesh şortlar bu yazın yıldızı.</p><h2>2. Washed-Out Renkler</h2><p>Solmuş efektli pastel tonlar her yerde. Lavanta, mint yeşili ve soluk turuncu öne çıkıyor.</p><h2>3. Cargo Her Şey</h2><p>Cargo şort, cargo pantolon, hatta cargo yelek. Cep detayları bu yazın olmazsa olmazı.</p><h2>4. Retro Spor Referansları</h2><p>90\'ların spor estetiği geri geldi. Çizgili şortlar ve terry cloth kumaşlar trend.</p><h2>5. Minimal Logolar</h2><p>Büyük logolar yerini küçük, rafine işlemelere bırakıyor.</p><h3>PARADOKS Yaz Koleksiyonu</h3><p>Quick-dry kumaş, elastik bel ve fonksiyonel cepler ile İstanbul yazına özel tasarlandı.</p>', created_at: '2026-06-10 09:15:00' }
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
