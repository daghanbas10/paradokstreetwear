// Veritabanı seed dosyası
// Admin kullanıcısı, örnek blog yazıları ve mesajlar oluşturur
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database/db');

async function seed() {
  // Veritabanını başlat
  await db.init();

  // ── Admin kullanıcısını oluştur ────────────────────────────────────

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Şifreyi hashle
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  // Admin kullanıcısını ekle (varsa güncelle)
  const insertAdmin = db.prepare(
    'INSERT OR REPLACE INTO admins (id, username, password) VALUES (1, ?, ?)'
  );
  insertAdmin.run(adminUsername, hashedPassword);
  console.log(`✓ Admin kullanıcısı oluşturuldu: ${adminUsername}`);

  // ── Blog yazıları ────────────────────────────────────────────────

  const insertPost = db.prepare(
    'INSERT OR REPLACE INTO posts (id, title, slug, content, excerpt, cover_image, is_published, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
  );

  const samplePosts = [
    {
      id: 1,
      title: 'Yazlık Kombin Rehberi: Oversize Tişört + Şort Formülleri',
      slug: 'yazlik-kombin-rehberi',
      cover_image: '/uploads/blog-combo.png',
      content: `<h2>Yaz Kombini = Oversize + Şort</h2>
<p>Sıcak havalarda hem rahat hem şık olmanın formülü basit: doğru oversize tişört + doğru şort.</p>

<h2>1. Siyah Oversize + Cargo Şort</h2>
<p>Klasik siyah oversize tişört, haki cargo şortla buluşunca sokak stilinin kralı olursun. Chunky sneaker ekle.</p>

<h2>2. Beyaz Basic + Mesh Şort</h2>
<p>Minimal beyaz tişört ve siyah mesh şort — basketbol sahalarından sokaklara taşan en temiz kombin.</p>

<h2>3. Crop Top + High-Waist Şort</h2>
<p>Kadınlar için: adaçayı yeşili crop top ve bej yüksek bel şort. Bucket hat ile tamamla.</p>

<h2>4. Yazlık Set Kombini</h2>
<p>Aynı renk şort ve tişört seti — kombin düşünmeden anında hazırsın.</p>

<h2>5. Polo + Bermuda</h2>
<p>Smart-casual istiyorsan: lacivert polo yaka tişört ve bej bermuda şort. Beyaz sneaker ile bitir.</p>

<blockquote>PARADOKS yaz koleksiyonu quick-dry kumaşlarla İstanbul yazına özel tasarlandı.</blockquote>`,
      excerpt: 'Bu yaz oversize tişört ve şortla nasıl profesyonel kombin kurarsın? 5 altın formül burada.',
      created_at: '2026-06-08 10:00:00'
    },
    {
      id: 2,
      title: 'Sokak Kültürü ve Yaz: Skate Parklarından Sahil Kenarlarına',
      slug: 'sokak-kulturu-ve-yaz',
      cover_image: '/uploads/blog-culture.png',
      content: `<h2>Yaz Gelince Sokak Değişir</h2>
<p>Kışın hoodie ve jogger ile dolan sokaklar, yazın mesh şortlar, crop toplar ve bucket hatlerle bambaşka bir enerjiye bürünür.</p>

<h2>Skate Parkları: Yazın Kalbi</h2>
<p>Yazın skate parkları sadece kaykay mekanı değil, stil podyumu. Oversize tişört, vans ve grafik baskılı şortlar buranın üniforması.</p>

<h2>Sahil Stili x Sokak Stili</h2>
<p>İstanbul gibi sahil şehirlerinde streetwear ve plaj kültürü iç içe geçer.</p>

<h2>Festivaller ve Açık Hava</h2>
<p>Yaz festivalleri streetwear için en büyük sahne. Tie-dye tişörtler, neon aksanlar ve limitli parçalar burada parlar.</p>

<h2>PARADOKS Yaz Felsefesi</h2>
<p>Biz yazı sadece bir mevsim değil, bir tutum olarak görüyoruz. Hafif kumaşlar, cesur kesimler, minimal logolar.</p>

<blockquote>"Sokak stili mevsim tanımaz, sadece form değiştirir." — PARADOKS</blockquote>`,
      excerpt: 'Sokak kültürü yazın nasıl değişir? Skate parklarından sahil kenarlarına uzanan stil yolculuğu.',
      created_at: '2026-06-12 14:30:00'
    },
    {
      id: 3,
      title: 'Yaz 2026 Trend Raporu: Bu Sezon Ne Giyiyoruz?',
      slug: 'yaz-2026-trend-raporu',
      cover_image: '/uploads/blog-trends.png',
      content: `<h2>2026 Yazında 5 Büyük Trend</h2>
<p>Bu yaz sokak modası daha cesur, daha ferah ve daha renkli.</p>

<h2>1. Crop Top Patlaması</h2>
<p>Sadece kadınlar için değil, erkekler de crop top denemeye başladı. Adaçayı yeşili ve kemik beyazı en popüler tonlar.</p>

<h2>2. Mesh ve Quick-Dry Kumaşlar</h2>
<p>Teknolojik kumaşlar artık sadece spor için değil. Mesh şortlar günlük sokak stilinin parçası.</p>

<h2>3. Washed-Out ve Soluk Tonlar</h2>
<p>Parlak renkler yerini solmuş efektli pastel tonlara bırakıyor.</p>

<h2>4. Fonksiyonel Cepler</h2>
<p>Cargo şortlar ve çok cepli yelekler bu yazın olmazsa olmazı.</p>

<h2>5. Minimal Logoculuk</h2>
<p>Dev logolar gitti, küçük işlemeli detaylar geldi.</p>

<h3>PARADOKS'un Yaz Seçkisi</h3>
<p>9 kategoride yazlık koleksiyon: oversize tişört, crop top, mesh şort, cargo şort, polo yaka, yazlık set, basic, aksesuar ve limited summer drop.</p>`,
      excerpt: 'Mesh şortlar, crop toplar, cargo detaylar ve washed tonlar — 2026 yazının en sıcak trendleri.',
      created_at: '2026-06-15 09:15:00'
    }
  ];

// ── Örnek mesajlar ─────────────────────────────────────────────────

  const insertMessage = db.prepare(
    'INSERT OR IGNORE INTO messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const sampleMessages = [
    {
      name: 'Arda Korkmaz',
      email: 'arda@example.com',
      phone: '+90 532 111 2233',
      subject: 'Toptan Sipariş',
      message: 'Merhaba, mağazamız için PARADOKS ürünlerinden toptan sipariş vermek istiyoruz. Hoodie ve oversize tişört kategorilerinde fiyat bilgisi alabilir miyiz?',
      created_at: '2026-06-12 11:30:00'
    },
    {
      name: 'Zeynep Aydın',
      email: 'zeynep@example.com',
      phone: '+90 544 222 3344',
      subject: 'Limited Edition Bilgi',
      message: 'Yeni limited edition drop ne zaman çıkacak? Instagram sayfanızdan takip ediyorum, çok merak ediyorum!',
      created_at: '2026-06-14 15:45:00'
    }
  ];

  const insertMessages = db.transaction((messages) => {
    for (const msg of messages) {
      insertMessage.run(msg.name, msg.email, msg.phone, msg.subject, msg.message, msg.created_at);
    }
  });

  insertMessages(sampleMessages);
  console.log(`✓ ${sampleMessages.length} örnek mesaj oluşturuldu`);

  console.log('\n✅ Seed işlemi başarıyla tamamlandı!');
  console.log(`   Admin girişi: ${adminUsername} / ${adminPassword}`);
}

seed().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
