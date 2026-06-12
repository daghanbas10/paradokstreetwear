// Yetkilendirme middleware'i
// Session'da adminId olup olmadığını kontrol eder

/**
 * Admin oturum kontrolü middleware'i
 * Eğer kullanıcı giriş yapmışsa (session'da adminId varsa) isteğe devam eder.
 * Giriş yapmamışsa /admin/login sayfasına yönlendirir.
 */
function authMiddleware(req, res, next) {
  if (req.session && req.session.adminId) {
    // Kullanıcı giriş yapmış, devam et
    return next();
  }

  // Kullanıcı giriş yapmamış, login sayfasına yönlendir
  return res.redirect('/admin/login');
}

module.exports = authMiddleware;
