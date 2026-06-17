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

  // ── Örnek blog yazıları ────────────────────────────────────────────

  const insertPost = db.prepare(
    'INSERT OR IGNORE INTO posts (title, slug, content, excerpt, is_published, created_at) VALUES (?, ?, ?, ?, 1, ?)'
  );

  const samplePosts = [
    {
      title: 'Dijital Dönüşümde Başarının Anahtarları',
      slug: 'dijital-donusumde-basarinin-anahtarlari',
      content: `<h2>Dijital Dönüşüm Nedir?</h2>
<p>Dijital dönüşüm, bir organizasyonun iş süreçlerini, kültürünü ve müşteri deneyimlerini dijital teknolojiler aracılığıyla yeniden şekillendirmesidir.</p>

<h2>Başarı İçin Temel Adımlar</h2>
<ol>
  <li><strong>Strateji Belirleyin:</strong> Dijital dönüşüm yolculuğunuza net bir strateji ile başlayın.</li>
  <li><strong>Ekibinizi Eğitin:</strong> Çalışanlarınızın dijital yetkinliklerini artırın.</li>
  <li><strong>Müşteri Odaklı Olun:</strong> Tüm dijital girişimlerinizi müşteri ihtiyaçlarına göre şekillendirin.</li>
  <li><strong>Veriyi Kullanın:</strong> Karar alma süreçlerinizi veriye dayalı hale getirin.</li>
  <li><strong>Çevik Olun:</strong> Değişime hızlı adapte olabilecek yapılar kurun.</li>
</ol>
<p>Dijital dönüşüm bir maraton, sprint değildir. Sabırlı ve kararlı adımlarla hedefe ulaşabilirsiniz.</p>`,
      excerpt: 'İşletmelerin dijital dönüşüm sürecinde başarılı olabilmesi için atması gereken temel adımları keşfedin.',
      created_at: '2024-12-15 10:00:00'
    },
    {
      title: 'Müşteri Memnuniyetini Artırmanın 5 Yolu',
      slug: 'musteri-memnuniyetini-artirmanin-5-yolu',
      content: `<h2>1. Müşterilerinizi Dinleyin</h2>
<p>Aktif dinleme, müşteri memnuniyetinin temelidir. Geri bildirimleri düzenli olarak toplayın ve analiz edin.</p>

<h2>2. Hızlı ve Etkili İletişim</h2>
<p>Müşterilerinizin sorularına ve sorunlarına hızlı yanıt verin. Çok kanallı iletişim stratejisi oluşturun.</p>

<h2>3. Kişiselleştirilmiş Deneyim</h2>
<p>Her müşterinin benzersiz olduğunu unutmayın. Kişiselleştirilmiş öneriler ve bireysel ilgi müşteri bağlılığını artırır.</p>

<h2>4. Kaliteyi Sürekli İyileştirin</h2>
<p>Ürün ve hizmet kalitenizi sürekli olarak geliştirin. Müşteri geri bildirimlerini iyileştirme süreçlerinize dahil edin.</p>

<h2>5. Sadakat Programları Oluşturun</h2>
<p>Sadık müşterilerinizi ödüllendirin. İndirimler, özel teklifler ve VIP avantajlar sunarak müşteri bağlılığını güçlendirin.</p>`,
      excerpt: 'Müşteri memnuniyetini artırmak ve sadık bir müşteri kitlesi oluşturmak için uygulayabileceğiniz etkili stratejiler.',
      created_at: '2024-12-20 14:30:00'
    },
    {
      title: 'Modern Web Teknolojileri ve İşletmenize Katkıları',
      slug: 'modern-web-teknolojileri-ve-isletmenize-katkilari',
      content: `<h2>Neden Modern Web Teknolojileri?</h2>
<p>Modern web teknolojileri, daha hızlı, güvenli ve kullanıcı dostu web uygulamaları geliştirmenizi sağlar:</p>
<ul>
  <li><strong>Performans:</strong> Sayfalar daha hızlı yüklenir, kullanıcı deneyimi iyileşir.</li>
  <li><strong>Güvenlik:</strong> Modern güvenlik standartları ile verileriniz korunur.</li>
  <li><strong>Ölçeklenebilirlik:</strong> İşletmeniz büyüdükçe altyapınız da büyüyebilir.</li>
  <li><strong>Mobil Uyumluluk:</strong> Tüm cihazlarda sorunsuz çalışan uygulamalar geliştirebilirsiniz.</li>
</ul>

<h2>Popüler Teknolojiler</h2>
<h3>Node.js</h3>
<p>Sunucu tarafında JavaScript çalıştırmanıza olanak tanır. Hızlı ve ölçeklenebilir uygulamalar için idealdir.</p>

<h3>React & Vue.js</h3>
<p>Modern kullanıcı arayüzleri oluşturmak için güçlü araçlardır.</p>

<h3>Progressive Web Apps (PWA)</h3>
<p>Web uygulamalarınıza mobil uygulama benzeri özellikler ekleyen bir yaklaşımdır.</p>

<p>İşletmeniz için doğru teknolojiyi seçmek, uzman bir ekiple çalışmayı gerektirir. Biz bu konuda yanınızdayız.</p>`,
      excerpt: 'Modern web teknolojilerinin işletmenize nasıl değer katabileceğini ve dijital varlığınızı nasıl güçlendirebileceğini öğrenin.',
      created_at: '2024-12-25 09:15:00'
    }
  ];

  // Blog yazılarını ekle
  const insertPosts = db.transaction((posts) => {
    for (const post of posts) {
      insertPost.run(post.title, post.slug, post.content, post.excerpt, post.created_at);
    }
  });

  insertPosts(samplePosts);
  console.log(`✓ ${samplePosts.length} örnek blog yazısı oluşturuldu`);

  // ── Örnek mesajlar ─────────────────────────────────────────────────

  const insertMessage = db.prepare(
    'INSERT OR IGNORE INTO messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const sampleMessages = [
    {
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '+90 532 111 2233',
      subject: 'Hizmetleriniz Hakkında Bilgi',
      message: 'Merhaba, şirketinizin sunduğu dijital dönüşüm hizmetleri hakkında detaylı bilgi almak istiyorum. Özellikle küçük ve orta ölçekli işletmelere yönelik paketleriniz var mı?',
      created_at: '2024-12-28 11:30:00'
    },
    {
      name: 'Elif Kaya',
      email: 'elif.kaya@example.com',
      phone: '+90 544 222 3344',
      subject: 'Web Sitesi Projesi Teklifi',
      message: 'İyi günler, e-ticaret sitemizin yeniden tasarlanması için bir teklif almak istiyoruz. Mevcut sitemiz oldukça eski ve mobil uyumlu değil.',
      created_at: '2024-12-30 15:45:00'
    }
  ];

  // Mesajları ekle
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
