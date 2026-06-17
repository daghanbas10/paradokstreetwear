// Yetkilendirme middleware'i
// Session'da adminId olup olmadığını kontrol eder

function authMiddleware(req, res, next) {
  console.log('[AUTH] Path:', req.originalUrl, '| Session adminId:', req.session ? req.session.adminId : 'YOK');
  
  if (req.session && req.session.adminId) {
    return next();
  }

  console.log('[AUTH] Yetkisiz erişim, login\'e yönlendiriliyor');
  return res.redirect('/admin/login');
}

module.exports = authMiddleware;
