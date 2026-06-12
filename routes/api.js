// API rotaları - İletişim formu endpoint'i
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ── POST /api/contact - İletişim formu gönderimi ──────────────────

router.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Zorunlu alan validasyonu
    const errors = [];

    if (!name || name.trim() === '') {
      errors.push('Ad Soyad alanı zorunludur.');
    }
    if (!email || email.trim() === '') {
      errors.push('E-posta alanı zorunludur.');
    }
    if (!subject || subject.trim() === '') {
      errors.push('Konu alanı zorunludur.');
    }
    if (!message || message.trim() === '') {
      errors.push('Mesaj alanı zorunludur.');
    }

    // E-posta format kontrolü
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Geçerli bir e-posta adresi giriniz.');
      }
    }

    // Hata varsa geri döndür
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen zorunlu alanları doldurunuz.',
        errors
      });
    }

    // Mesajı veritabanına kaydet
    const stmt = db.prepare(`
      INSERT INTO messages (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email.trim(),
      phone ? phone.trim() : null,
      subject.trim(),
      message.trim()
    );

    // Başarılı yanıt döndür
    return res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi!'
    });
  } catch (error) {
    console.error('İletişim formu hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    });
  }
});

module.exports = router;
