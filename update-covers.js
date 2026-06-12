// Blog kapak resimlerini güncelle ve sunucuyu yeniden başlat
require('dotenv').config();

async function updateCovers() {
  const db = require('./database/db');
  await db.init();

  // Blog yazılarına kapak resimleri ekle
  db.prepare("UPDATE posts SET cover_image = '/uploads/blog-digital.png' WHERE slug = 'dijital-donusumde-basarinin-anahtarlari'").run();
  db.prepare("UPDATE posts SET cover_image = '/uploads/blog-customer.png' WHERE slug = 'musteri-memnuniyetini-artirmanin-5-yolu'").run();
  db.prepare("UPDATE posts SET cover_image = '/uploads/blog-webtech.png' WHERE slug = 'modern-web-teknolojileri-ve-isletmenize-katkilari'").run();

  console.log('✅ Blog kapak resimleri güncellendi!');
}

updateCovers().catch(console.error);
