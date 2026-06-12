// PARADOKS — Herkese açık sayfa rotaları
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ── Yardımcı fonksiyon: site_content'ten değer al ─────────────────

/**
 * site_content tablosundan belirtilen anahtarların değerlerini alır
 * @param {string[]} keys - Alınacak anahtar isimleri
 * @returns {Object} - Anahtar-değer çiftleri nesnesi
 */
function getSiteContent(keys) {
  const placeholders = keys.map(() => '?').join(',');
  const rows = db.prepare(
    `SELECT key, value FROM site_content WHERE key IN (${placeholders})`
  ).all(...keys);

  const result = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

// ── Ana Sayfa ──────────────────────────────────────────────────────

router.get('/', (req, res) => {
  // Site içeriklerini al
  const content = getSiteContent(['hero_title', 'hero_subtitle', 'about_text']);

  // Son 3 yayınlanmış blog yazısını al
  const recentPosts = db.prepare(`
    SELECT id, title, slug, excerpt, cover_image, created_at
    FROM posts
    WHERE is_published = 1
    ORDER BY created_at DESC
    LIMIT 3
  `).all();

  res.render('public/index', {
    title: 'PARADOKS — Kuralları Sen Yaz',
    heroTitle: content.hero_title || 'Kuralları Sen Yaz',
    heroSubtitle: content.hero_subtitle || 'Sıradan olmayı reddedenler için tasarlandı.',
    aboutText: content.about_text || '',
    posts: recentPosts
  });
});

// ── Koleksiyon Sayfası ────────────────────────────────────────────────────

router.get('/hizmetler', (req, res) => {
  const content = getSiteContent([
    'hero_title',
    'hero_subtitle',
    'about_text',
    'contact_email',
    'contact_phone'
  ]);

  res.render('public/services', {
    title: 'Koleksiyon',
    content
  });
});

// ── Blog Sayfası ───────────────────────────────────────────────────

router.get('/blog', (req, res) => {
  // Tüm yayınlanmış blog yazılarını yeniden eskiye sırala
  const posts = db.prepare(`
    SELECT id, title, slug, excerpt, cover_image, created_at
    FROM posts
    WHERE is_published = 1
    ORDER BY created_at DESC
  `).all();

  res.render('public/blog', {
    title: 'Blog — Moda & Stil',
    posts
  });
});

// ── Blog Detay Sayfası ─────────────────────────────────────────────

router.get('/blog/:slug', (req, res) => {
  // Slug'a göre yayınlanmış yazıyı bul
  const post = db.prepare(`
    SELECT * FROM posts
    WHERE slug = ? AND is_published = 1
  `).get(req.params.slug);

  // Yazı bulunamazsa 404 sayfası göster
  if (!post) {
    return res.status(404).render('404', {
      title: 'Sayfa Bulunamadı'
    });
  }

  res.render('public/blog-detail', {
    title: post.title,
    post
  });
});

// ── İletişim Sayfası ───────────────────────────────────────────────

router.get('/iletisim', (req, res) => {
  // İletişim bilgilerini al
  const content = getSiteContent([
    'contact_email',
    'contact_phone',
    'contact_address'
  ]);

  res.render('public/contact', {
    title: 'İletişim',
    contactEmail: content.contact_email || 'info@paradoks.store',
    contactPhone: content.contact_phone || '+90 532 PARADOKS',
    contactAddress: content.contact_address || 'Karaköy, Beyoğlu / İstanbul'
  });
});

module.exports = router;
