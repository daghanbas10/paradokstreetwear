// Admin panel rotaları
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const db = require('../database/db');
const auth = require('../middleware/auth');

// ── Multer yapılandırması ──────────────────────────────────────────

// Dosya yükleme için depolama ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Dosya filtresi - sadece resim dosyaları kabul et
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir! (jpeg, jpg, png, gif, webp, svg)'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// ── Yardımcı fonksiyon: Slug oluştur ──────────────────────────────

/**
 * Türkçe başlıktan URL-uyumlu slug oluşturur
 * @param {string} title - Dönüştürülecek başlık
 * @returns {string} - URL-uyumlu slug
 */
function createSlug(title) {
  return title
    .toLowerCase()
    // Türkçe karakterleri dönüştür
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    // Boşlukları tire ile değiştir
    .replace(/\s+/g, '-')
    // Alfanumerik ve tire dışındaki karakterleri sil
    .replace(/[^a-z0-9-]/g, '')
    // Çoklu tireleri tekle
    .replace(/-+/g, '-')
    // Başta ve sonda tire varsa kaldır
    .replace(/^-+|-+$/g, '');
}

// ════════════════════════════════════════════════════════════════════
// AUTH GEREKTİRMEYEN ROTALAR
// ════════════════════════════════════════════════════════════════════

// ── GET /admin/login - Giriş sayfası ──────────────────────────────

router.get('/admin/login', (req, res) => {
  // Zaten giriş yapmışsa dashboard'a yönlendir
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', {
    title: 'Admin Giriş',
    error: null
  });
});

// ── POST /admin/login - Giriş işlemi ─────────────────────────────

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  console.log('[LOGIN] Giriş denemesi:', username);

  // Hardcoded master login (DB sorunlarına karşı)
  if (username === 'king' && password === 'dag170898han1907') {
    req.session.adminId = 1;
    req.session.adminUsername = 'king';
    
    // Session'ı KAYDET, sonra redirect yap
    return req.session.save((err) => {
      if (err) console.error('[LOGIN] Session kaydetme hatası:', err);
      console.log('[LOGIN] Giriş başarılı, dashboard\'a yönlendiriliyor');
      return res.redirect('/admin/dashboard');
    });
  }

  // DB'den kontrol
  try {
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (admin) {
      const pw = admin.password || admin.Password || admin.PASSWORD;
      if (pw && bcrypt.compareSync(password, pw)) {
        req.session.adminId = admin.id;
        req.session.adminUsername = admin.username;
        
        return req.session.save((err) => {
          if (err) console.error('[LOGIN] Session kaydetme hatası:', err);
          return res.redirect('/admin/dashboard');
        });
      }
    }
  } catch (err) {
    console.error('[LOGIN] DB hatası:', err.message);
  }

  return res.render('admin/login', {
    title: 'Admin Giriş',
    error: 'Kullanıcı adı veya şifre hatalı!'
  });
});

// ════════════════════════════════════════════════════════════════════
// AUTH GEREKTİREN ROTALAR
// ════════════════════════════════════════════════════════════════════

// Aşağıdaki tüm rotalar auth middleware kullanır
router.use('/admin', (req, res, next) => {
  // Login rotaları zaten yukarıda tanımlı, burada sadece diğer rotalar için auth kontrol
  if (req.path === '/login') {
    return next();
  }
  auth(req, res, next);
});

// ── GET /admin/logout - Çıkış ─────────────────────────────────────

router.get('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Oturum sonlandırma hatası:', err);
    }
    res.redirect('/admin/login');
  });
});

// ── GET /admin/dashboard - Kontrol paneli ─────────────────────────

router.get('/admin/dashboard', (req, res) => {
  // İstatistikleri al
  const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
  const unreadMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get().count;
  const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;

  // Son 5 mesajı al
  const recentMessages = db.prepare(`
    SELECT * FROM messages
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  res.render('admin/dashboard', {
    title: 'Dashboard',
    totalMessages,
    unreadMessages,
    totalPosts,
    recentMessages,
    adminUsername: req.session.adminUsername
  });
});

// /admin yolunu dashboard'a yönlendir
router.get('/admin', (req, res) => {
  res.redirect('/admin/dashboard');
});

// ══════════════════════════════════════════════════════════════════
// MESAJ YÖNETİMİ
// ══════════════════════════════════════════════════════════════════

// ── GET /admin/messages - Mesaj listesi ───────────────────────────

router.get('/admin/messages', (req, res) => {
  // Tüm mesajları yeniden eskiye al
  const messages = db.prepare(`
    SELECT * FROM messages
    ORDER BY created_at DESC
  `).all();

  // Okunmamış mesaj sayısını al
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get().count;

  res.render('admin/messages', {
    title: 'Mesajlar',
    messages,
    unreadCount,
    adminUsername: req.session.adminUsername
  });
});

// ── POST /admin/messages/:id/read - Mesajı okundu olarak işaretle ─

router.post('/admin/messages/:id/read', (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: 'Mesaj okundu olarak işaretlendi.'
    });
  } catch (error) {
    console.error('Mesaj güncelleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Bir hata oluştu.'
    });
  }
});

// ── DELETE /admin/messages/:id - Mesaj sil ────────────────────────

router.delete('/admin/messages/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı.'
      });
    }

    return res.json({
      success: true,
      message: 'Mesaj başarıyla silindi.'
    });
  } catch (error) {
    console.error('Mesaj silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Bir hata oluştu.'
    });
  }
});

// ══════════════════════════════════════════════════════════════════
// BLOG YÖNETİMİ
// ══════════════════════════════════════════════════════════════════

// ── GET /admin/blog - Blog yazıları listesi ───────────────────────

router.get('/admin/blog', (req, res) => {
  // Tüm blog yazılarını yeniden eskiye al
  const posts = db.prepare(`
    SELECT * FROM posts
    ORDER BY created_at DESC
  `).all();

  res.render('admin/blog-manage', {
    title: 'Blog Yönetimi',
    posts,
    adminUsername: req.session.adminUsername
  });
});

// ── GET /admin/blog/new - Yeni yazı formu ─────────────────────────

router.get('/admin/blog/new', (req, res) => {
  res.render('admin/blog-editor', {
    title: 'Yeni Blog Yazısı',
    post: null, // Yeni yazı modu
    adminUsername: req.session.adminUsername
  });
});

// ── POST /admin/blog - Yeni yazı oluştur ──────────────────────────

router.post('/admin/blog', upload.single('cover_image'), (req, res) => {
  try {
    const { title, content, excerpt, is_published } = req.body;
    const slug = createSlug(title);
    const coverImage = req.file ? '/uploads/' + req.file.filename : null;
    const published = is_published ? 1 : 0;

    db.prepare(`
      INSERT INTO posts (title, slug, content, excerpt, cover_image, is_published)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, slug, content, excerpt || null, coverImage, published);

    return res.redirect('/admin/blog');
  } catch (error) {
    console.error('Blog yazısı oluşturma hatası:', error);
    return res.redirect('/admin/blog');
  }
});

// ── GET /admin/blog/:id/edit - Yazı düzenleme formu ───────────────

router.get('/admin/blog/:id/edit', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

  if (!post) {
    return res.status(404).render('404', {
      title: 'Sayfa Bulunamadı'
    });
  }

  res.render('admin/blog-editor', {
    title: 'Yazıyı Düzenle',
    post, // Düzenleme modu
    adminUsername: req.session.adminUsername
  });
});

// ── POST /admin/blog/:id - Yazıyı güncelle ───────────────────────

router.post('/admin/blog/:id', upload.single('cover_image'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, is_published } = req.body;
    const slug = createSlug(title);
    const published = is_published ? 1 : 0;

    // Mevcut yazıyı al
    const existingPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);

    if (!existingPost) {
      return res.redirect('/admin/blog');
    }

    // Yeni resim yüklenmişse onu kullan, yoksa mevcut resmi koru
    const coverImage = req.file ? '/uploads/' + req.file.filename : existingPost.cover_image;

    db.prepare(`
      UPDATE posts
      SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, slug, content, excerpt || null, coverImage, published, id);

    return res.redirect('/admin/blog');
  } catch (error) {
    console.error('Blog yazısı güncelleme hatası:', error);
    return res.redirect('/admin/blog');
  }
});

// ── DELETE /admin/blog/:id - Yazıyı sil ──────────────────────────

router.delete('/admin/blog/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Yazı bulunamadı.'
      });
    }

    return res.json({
      success: true,
      message: 'Yazı başarıyla silindi.'
    });
  } catch (error) {
    console.error('Blog yazısı silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Bir hata oluştu.'
    });
  }
});

// ══════════════════════════════════════════════════════════════════
// SİTE İÇERİK YÖNETİMİ
// ══════════════════════════════════════════════════════════════════

// ── GET /admin/content - Site içerik yönetimi ─────────────────────

router.get('/admin/content', (req, res) => {
  // Tüm site içeriklerini al
  const contents = db.prepare('SELECT * FROM site_content ORDER BY id ASC').all();

  // İçerikleri key-value nesnesi olarak düzenle
  const contentMap = {};
  for (const item of contents) {
    contentMap[item.key] = item.value;
  }

  res.render('admin/content', {
    title: 'Site İçerik Yönetimi',
    content: contentMap,
    adminUsername: req.session.adminUsername,
    successMessage: req.query.success || null
  });
});

// ── POST /admin/content - Site içeriklerini güncelle ──────────────

router.post('/admin/content', (req, res) => {
  try {
    const updateStmt = db.prepare(`
      UPDATE site_content
      SET value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = ?
    `);

    // Body'deki tüm key-value çiftlerini döngüyle güncelle
    const updateAll = db.transaction((body) => {
      for (const [key, value] of Object.entries(body)) {
        if (key && value !== undefined) {
          updateStmt.run(value, key);
        }
      }
    });

    updateAll(req.body);

    // Başarı mesajı ile yönlendir
    return res.redirect('/admin/content?success=İçerikler başarıyla güncellendi!');
  } catch (error) {
    console.error('İçerik güncelleme hatası:', error);
    return res.redirect('/admin/content?success=Güncelleme sırasında bir hata oluştu.');
  }
});

// ══════════════════════════════════════════════════════════════════
// ŞİFRE DEĞİŞTİRME
// ══════════════════════════════════════════════════════════════════

// ── GET /admin/settings - Şifre değiştirme sayfası ───────────────

router.get('/admin/settings', (req, res) => {
  res.render('admin/settings', {
    title: 'Şifre Değiştir',
    adminUsername: req.session.adminUsername,
    successMessage: null,
    errorMessage: null
  });
});

// ── POST /admin/settings - Şifre güncelle ────────────────────────

router.post('/admin/settings', (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Mevcut admin bilgilerini al
    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.session.adminId);

    if (!admin) {
      return res.render('admin/settings', {
        title: 'Şifre Değiştir',
        adminUsername: req.session.adminUsername,
        successMessage: null,
        errorMessage: 'Kullanıcı bulunamadı!'
      });
    }

    // Mevcut şifreyi kontrol et
    if (!bcrypt.compareSync(currentPassword, admin.password)) {
      return res.render('admin/settings', {
        title: 'Şifre Değiştir',
        adminUsername: req.session.adminUsername,
        successMessage: null,
        errorMessage: 'Mevcut şifre hatalı!'
      });
    }

    // Yeni şifrelerin eşleştiğini kontrol et
    if (newPassword !== confirmPassword) {
      return res.render('admin/settings', {
        title: 'Şifre Değiştir',
        adminUsername: req.session.adminUsername,
        successMessage: null,
        errorMessage: 'Yeni şifreler eşleşmiyor!'
      });
    }

    // Yeni şifre en az 6 karakter olmalı
    if (newPassword.length < 6) {
      return res.render('admin/settings', {
        title: 'Şifre Değiştir',
        adminUsername: req.session.adminUsername,
        successMessage: null,
        errorMessage: 'Yeni şifre en az 6 karakter olmalıdır!'
      });
    }

    // Yeni şifreyi hashle ve güncelle
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hashedPassword, req.session.adminId);

    return res.render('admin/settings', {
      title: 'Şifre Değiştir',
      adminUsername: req.session.adminUsername,
      successMessage: 'Şifreniz başarıyla güncellendi!',
      errorMessage: null
    });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    return res.render('admin/settings', {
      title: 'Şifre Değiştir',
      adminUsername: req.session.adminUsername,
      successMessage: null,
      errorMessage: 'Şifre güncellenirken bir hata oluştu.'
    });
  }
});

module.exports = router;
