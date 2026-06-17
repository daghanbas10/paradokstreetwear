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
      title: 'Oversize Tişört Nasıl Kombinlenir? 7 Sokak Stili İlhamı',
      slug: 'oversize-tisort-nasil-kombinlenir',
      cover_image: '/uploads/blog-tshirt.png',
      content: `<h2>Oversize Tişört: Sokağın Vazgeçilmezi</h2>
<p>Oversize tişört, streetwear kültürünün temel taşıdır. Ama doğru kombinlenmezse "evde oturuyorum" havasına bürünür. İşte profesyonel gibi oversize giymek için 7 altın kural:</p>

<h2>1. Altına Slim Fit veya Tapered Pantolon</h2>
<p>Üst geniş, alt dar — bu kontrast vücudunu dengeler. Siyah skinny jean veya tapered jogger ideal eşlikçilerdir.</p>

<h2>2. Katmanlama Sanatı</h2>
<p>Oversize tişörtün altına uzun kollu beyaz tişört giy. Kol uçları ve etek kısmı görünsün. Bu "layering" tekniği anında seviye atlatır.</p>

<h2>3. Aksesuar ile Fark Yarat</h2>
<p>Zincir kolye, bucket hat veya crossbody çanta ekle. Minimalizmi aksesuarla kır.</p>

<h2>4. Sneaker Seçimi Kritik</h2>
<p>Chunky sneaker veya Air Force 1 gibi klasikler oversize ile mükemmel uyum sağlar. Dar ayakkabılardan kaçın.</p>

<h2>5. Renk Paleti Oluştur</h2>
<p>Monokrom (tek renk tonları) veya complementary (zıt renkler) paletlerle kombin kur. Rastgele renk seçme.</p>

<h2>6. Front Tuck Tekniği</h2>
<p>Tişörtün ön kısmını bele hafifçe sok, arkasını serbest bırak. Orantıyı kurtarır ve beli tanımlar.</p>

<h2>7. Güven En İyi Aksesuar</h2>
<p>Ne giyersen giy, eğer rahat hissediyorsan doğru yoldasın. Sokak stili kuralları yıkmakla ilgilidir.</p>

<blockquote>PARADOKS oversize tişörtleri 300gsm heavy-weight penye pamuktan üretilir. Pre-shrunk teknolojisiyle yıkamada küçülme yapmaz.</blockquote>`,
      excerpt: 'Oversize tişörtü sokak stilinde profesyonel gibi kombinlemenin 7 altın kuralı. Layering tekniklerinden aksesuar seçimine kadar her şey.',
      created_at: '2026-06-01 10:00:00'
    },
    {
      id: 2,
      title: 'Hoodie Kültürü: Kapüşonlunun Sokaktan Podyuma Yolculuğu',
      slug: 'hoodie-kulturu-kapusonlunun-yolculugu',
      cover_image: '/uploads/blog-hoodie.png',
      content: `<h2>Bir Kapüşonun Hikâyesi</h2>
<p>1930'larda New York'taki depo işçileri için üretilen hoodie, bugün milyar dolarlık moda endüstrisinin en ikonik parçası. Peki bu dönüşüm nasıl oldu?</p>

<h2>Hip-Hop ve Hoodie</h2>
<p>80'lerde Run-DMC ve LL Cool J gibi hip-hop sanatçıları hoodie'yi sahneye taşıdı. Artık hoodie sadece bir kıyafet değil, bir tutumdu — sisteme karşı duruşun sembolü.</p>

<h2>Skate Kültürü Etkisi</h2>
<p>90'larda Thrasher ve Supreme gibi markalar hoodie'yi skate kültürüyle birleştirdi. Kapüşonlu, grafiti desenli, yırtık — ne kadar "kirli" o kadar cool.</p>

<h2>Lüks Markalar Sahneye Çıkıyor</h2>
<p>2010'lardan itibaren Balenciaga, Vetements ve Off-White hoodie'yi lüks moda dünyasına taşıdı. 500$'lık hoodie'ler normalleşti.</p>

<h2>PARADOKS Hoodie Farkı</h2>
<p>Biz PARADOKS olarak hoodie'ye hak ettiği saygıyı veriyoruz:</p>
<ul>
  <li><strong>400gsm French Terry:</strong> Dört mevsim konfor</li>
  <li><strong>YKK Fermuar:</strong> Binlerce açılış-kapanışa dayanır</li>
  <li><strong>Çift Katmanlı Kapüşon:</strong> Form kaybetmez</li>
  <li><strong>Kanguru Cep:</strong> Telefon ve eller için mükemmel</li>
</ul>

<blockquote>"Hoodie sadece bir kıyafet değil, bir zırhtır." — Anonim Sokak Filozofu</blockquote>`,
      excerpt: 'Hoodie nasıl depo işçilerinin kıyafetinden milyar dolarlık moda ikonuna dönüştü? Hip-hop, skate ve lüks modanın kesiştiği hikâye.',
      created_at: '2026-06-05 14:30:00'
    },
    {
      id: 3,
      title: '2026 Yaz Trendleri: Bu Yaz Ne Giyiyoruz?',
      slug: '2026-yaz-trendleri',
      cover_image: '/uploads/blog-shorts.png',
      content: `<h2>Yaz 2026: Sokak Stilinde Sıcak Trendler</h2>
<p>Bu yaz sokak modası daha cesur, daha renkli ve daha rahat. İşte kaçırmamanız gereken 5 trend:</p>

<h2>1. Mesh Şortlar Geri Döndü</h2>
<p>Basketbol sahalarından sokaklara taşan mesh şortlar bu yazın yıldızı. Oversized tişört + mesh şort + chunky sneaker = yaz formülü.</p>

<h2>2. Washed-Out Renkler</h2>
<p>Solmuş efektli pastel tonlar her yerde. Özellikle lavanta, mint yeşili ve soluk turuncu öne çıkıyor.</p>

<h2>3. Cargo Her Şey</h2>
<p>Cargo şort, cargo pantolon, hatta cargo yelek. Cep detayları bu yazın olmazsa olmazı. Fonksiyonel ve şık.</p>

<h2>4. Retro Spor Referansları</h2>
<p>90'ların spor estetiği geri geldi. Çizgili şortlar, polo yaka tişörtler ve terry cloth kumaşlar trend.</p>

<h2>5. Minimal Logolar</h2>
<p>Büyük logolar yerini küçük, rafine işlemelere bırakıyor. Az ama öz — kaliteyi logonun büyüklüğü değil, kumaşın dokusu anlatıyor.</p>

<h3>PARADOKS Yaz Koleksiyonu</h3>
<p>Quick-dry kumaş, elastik bel ve fonksiyonel cepler ile İstanbul yazına özel tasarlandı. Terlemeden, stilinden ödün vermeden yaz geçir.</p>`,
      excerpt: '2026 yazının en sıcak sokak stili trendleri: mesh şortlar, cargo detaylar, washed-out renkler ve retro spor referansları.',
      created_at: '2026-06-10 09:15:00'
    }
  ];

  // Blog yazılarını ekle
  const insertPosts = db.transaction((posts) => {
    for (const post of posts) {
      insertPost.run(post.id, post.title, post.slug, post.content, post.excerpt, post.cover_image, post.created_at);
    }
  });

  insertPosts(samplePosts);
  console.log(`✓ ${samplePosts.length} blog yazısı güncellendi`);

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
