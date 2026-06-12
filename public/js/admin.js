/* =============================================
   ADMIN.JS - Admin Panel JavaScript Dosyası
   Sidebar, Mesajlar, Blog, Alerts, Genel İşlemler
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ─── Sidebar Toggle (Mobil) ─── */
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const adminSidebar = document.querySelector('.admin-sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');

  function openSidebar() {
    if (adminSidebar) {
      adminSidebar.classList.add('active');
    }
    if (sidebarOverlay) {
      sidebarOverlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (adminSidebar) {
      adminSidebar.classList.remove('active');
    }
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      if (adminSidebar && adminSidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function () {
      closeSidebar();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && adminSidebar && adminSidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  /* ─── Message Actions: Okundu İşaretle ─── */
  const markReadButtons = document.querySelectorAll('.btn-mark-read');

  markReadButtons.forEach(function (btn) {
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();

      const messageId = this.getAttribute('data-id');
      const messageCard = this.closest('.message-card');

      if (!messageId) return;

      const originalText = this.textContent;
      this.disabled = true;
      this.textContent = 'İşleniyor...';

      try {
        const response = await fetch('/admin/messages/' + messageId + '/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          if (messageCard) {
            messageCard.classList.remove('unread');
          }

          const badge = messageCard ? messageCard.querySelector('.table-badge') : null;
          if (badge) {
            badge.className = 'table-badge success';
            badge.textContent = 'Okundu';
          }

          this.style.display = 'none';

          showAdminNotification('Mesaj okundu olarak işaretlendi.', 'success');
        } else {
          const result = await response.json().catch(function () { return {}; });
          showAdminNotification(result.error || 'Bir hata oluştu.', 'error');
          this.disabled = false;
          this.textContent = originalText;
        }
      } catch (error) {
        showAdminNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        this.disabled = false;
        this.textContent = originalText;
      }
    });
  });

  /* ─── Message Actions: Mesaj Sil ─── */
  const deleteMessageButtons = document.querySelectorAll('.btn-delete-message');

  deleteMessageButtons.forEach(function (btn) {
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();

      const messageId = this.getAttribute('data-id');
      const messageCard = this.closest('.message-card');

      if (!messageId) return;

      const confirmed = confirm('Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
      if (!confirmed) return;

      const originalText = this.textContent;
      this.disabled = true;
      this.textContent = 'Siliniyor...';

      try {
        const response = await fetch('/admin/messages/' + messageId, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          if (messageCard) {
            messageCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease, max-height 0.4s ease, margin 0.4s ease, padding 0.4s ease';
            messageCard.style.opacity = '0';
            messageCard.style.transform = 'translateX(30px)';
            messageCard.style.maxHeight = messageCard.offsetHeight + 'px';

            setTimeout(function () {
              messageCard.style.maxHeight = '0';
              messageCard.style.marginBottom = '0';
              messageCard.style.padding = '0';
              messageCard.style.border = 'none';
            }, 200);

            setTimeout(function () {
              messageCard.remove();
              checkEmptyState('.messages-list', 'Henüz mesaj yok.');
            }, 600);
          }

          showAdminNotification('Mesaj başarıyla silindi.', 'success');
        } else {
          const result = await response.json().catch(function () { return {}; });
          showAdminNotification(result.error || 'Silme işlemi başarısız.', 'error');
          this.disabled = false;
          this.textContent = originalText;
        }
      } catch (error) {
        showAdminNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        this.disabled = false;
        this.textContent = originalText;
      }
    });
  });

  /* ─── Message Accordion ─── */
  const messageCards = document.querySelectorAll('.message-card');

  messageCards.forEach(function (card) {
    const header = card.querySelector('.message-card-header');
    if (!header) return;

    header.addEventListener('click', function (e) {
      if (e.target.closest('.btn-mark-read') || e.target.closest('.btn-delete-message') || e.target.closest('.admin-btn')) {
        return;
      }

      const isExpanded = card.classList.contains('expanded');

      messageCards.forEach(function (otherCard) {
        if (otherCard !== card) {
          otherCard.classList.remove('expanded');
        }
      });

      card.classList.toggle('expanded');
    });
  });

  /* ─── Blog Delete ─── */
  const deleteBlogButtons = document.querySelectorAll('.btn-delete-blog');

  deleteBlogButtons.forEach(function (btn) {
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const blogId = this.getAttribute('data-id');
      const blogCard = this.closest('.admin-blog-card') || this.closest('tr');

      if (!blogId) return;

      const confirmed = confirm('Bu blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
      if (!confirmed) return;

      const originalText = this.textContent;
      this.disabled = true;
      this.textContent = 'Siliniyor...';

      try {
        const response = await fetch('/admin/blog/' + blogId, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          if (blogCard) {
            blogCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease, max-height 0.4s ease';
            blogCard.style.opacity = '0';
            blogCard.style.transform = 'scale(0.95)';

            setTimeout(function () {
              blogCard.style.maxHeight = '0';
              blogCard.style.overflow = 'hidden';
              blogCard.style.marginBottom = '0';
              blogCard.style.padding = '0';
              blogCard.style.border = 'none';
            }, 200);

            setTimeout(function () {
              blogCard.remove();
              checkEmptyState('.admin-blog-grid', 'Henüz blog yazısı yok.');
            }, 600);
          }

          showAdminNotification('Blog yazısı başarıyla silindi.', 'success');
        } else {
          const result = await response.json().catch(function () { return {}; });
          showAdminNotification(result.error || 'Silme işlemi başarısız.', 'error');
          this.disabled = false;
          this.textContent = originalText;
        }
      } catch (error) {
        showAdminNotification('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        this.disabled = false;
        this.textContent = originalText;
      }
    });
  });

  /* ─── Alert Auto-hide ─── */
  const alerts = document.querySelectorAll('.alert');

  alerts.forEach(function (alert) {
    const closeBtn = alert.querySelector('.alert-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        fadeOutAlert(alert);
      });
    }

    setTimeout(function () {
      fadeOutAlert(alert);
    }, 5000);
  });

  function fadeOutAlert(alertElement) {
    if (!alertElement || alertElement.classList.contains('fade-out')) return;

    alertElement.classList.add('fade-out');

    setTimeout(function () {
      alertElement.style.maxHeight = alertElement.offsetHeight + 'px';
      alertElement.style.overflow = 'hidden';

      requestAnimationFrame(function () {
        alertElement.style.transition = 'max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease, opacity 0.3s ease';
        alertElement.style.maxHeight = '0';
        alertElement.style.marginBottom = '0';
        alertElement.style.paddingTop = '0';
        alertElement.style.paddingBottom = '0';
      });

      setTimeout(function () {
        alertElement.remove();
      }, 300);
    }, 500);
  }

  /* ─── Admin Notification System ─── */
  function showAdminNotification(message, type) {
    type = type || 'info';

    const existingNotifications = document.querySelectorAll('.admin-notification');
    existingNotifications.forEach(function (n) {
      n.remove();
    });

    const notification = document.createElement('div');
    notification.className = 'admin-notification';

    var iconClass = 'fas fa-info-circle';
    var bgColor = 'rgba(0, 217, 255, 0.1)';
    var borderColor = '#00D9FF';
    var textColor = '#00D9FF';

    if (type === 'success') {
      iconClass = 'fas fa-check-circle';
      bgColor = 'rgba(0, 200, 83, 0.1)';
      borderColor = '#00C853';
      textColor = '#00C853';
    } else if (type === 'error') {
      iconClass = 'fas fa-exclamation-circle';
      bgColor = 'rgba(255, 82, 82, 0.1)';
      borderColor = '#FF5252';
      textColor = '#FF5252';
    } else if (type === 'warning') {
      iconClass = 'fas fa-exclamation-triangle';
      bgColor = 'rgba(255, 179, 0, 0.1)';
      borderColor = '#FFB300';
      textColor = '#FFB300';
    }

    notification.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:16px 24px;border-radius:12px;font-size:0.9rem;font-weight:500;display:flex;align-items:center;gap:12px;max-width:400px;animation:slide-in-right 0.4s ease forwards;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ' + borderColor + ';background:' + bgColor + ';color:' + textColor + ';box-shadow:0 8px 30px rgba(0,0,0,0.3);';

    notification.innerHTML = '<i class="' + iconClass + '"></i><span>' + message + '</span>';

    document.body.appendChild(notification);

    setTimeout(function () {
      notification.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(30px)';

      setTimeout(function () {
        notification.remove();
      }, 400);
    }, 4000);
  }

  window.showAdminNotification = showAdminNotification;

  /* ─── Check Empty State ─── */
  function checkEmptyState(containerSelector, emptyMessage) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    var childCount = 0;
    for (var i = 0; i < container.children.length; i++) {
      if (!container.children[i].classList.contains('admin-empty-state')) {
        childCount++;
      }
    }

    if (childCount === 0) {
      var existingEmpty = container.querySelector('.admin-empty-state');
      if (!existingEmpty) {
        var emptyState = document.createElement('div');
        emptyState.className = 'admin-empty-state';
        emptyState.innerHTML = '<i class="fas fa-inbox"></i><h3>Boş</h3><p>' + (emptyMessage || 'Henüz içerik yok.') + '</p>';
        container.appendChild(emptyState);
      }
    }
  }

  /* ─── File Upload Preview ─── */
  const fileUploadAreas = document.querySelectorAll('.file-upload-area');

  fileUploadAreas.forEach(function (area) {
    var fileInput = area.querySelector('input[type="file"]');
    if (!fileInput) return;

    area.addEventListener('click', function () {
      fileInput.click();
    });

    area.addEventListener('dragover', function (e) {
      e.preventDefault();
      area.style.borderColor = 'rgba(108, 99, 255, 0.5)';
      area.style.background = 'rgba(108, 99, 255, 0.08)';
    });

    area.addEventListener('dragleave', function (e) {
      e.preventDefault();
      area.style.borderColor = '';
      area.style.background = '';
    });

    area.addEventListener('drop', function (e) {
      e.preventDefault();
      area.style.borderColor = '';
      area.style.background = '';

      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        updateFilePreview(area, fileInput.files[0]);
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) {
        updateFilePreview(area, fileInput.files[0]);
      }
    });
  });

  function updateFilePreview(area, file) {
    var existingPreview = area.querySelector('.file-preview');
    if (existingPreview) {
      existingPreview.remove();
    }

    var preview = document.createElement('div');
    preview.className = 'file-preview';
    preview.style.cssText = 'margin-top:12px;padding:10px;background:rgba(108,99,255,0.1);border-radius:8px;display:flex;align-items:center;gap:10px;';

    var icon = document.createElement('i');
    icon.className = 'fas fa-file';
    icon.style.color = '#6C63FF';

    var info = document.createElement('div');

    var fileName = document.createElement('div');
    fileName.style.cssText = 'font-size:0.85rem;color:#FFFFFE;font-weight:500;';
    fileName.textContent = file.name;

    var fileSize = document.createElement('div');
    fileSize.style.cssText = 'font-size:0.75rem;color:#A7A9BE;';
    fileSize.textContent = formatFileSize(file.size);

    info.appendChild(fileName);
    info.appendChild(fileSize);
    preview.appendChild(icon);
    preview.appendChild(info);
    area.appendChild(preview);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /* ─── Admin Form Validation ─── */
  const adminForms = document.querySelectorAll('.admin-form-card form');

  adminForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var isValid = true;
      var requiredInputs = form.querySelectorAll('[required]');

      requiredInputs.forEach(function (input) {
        removeInputError(input);

        if (input.value.trim() === '') {
          isValid = false;
          showInputError(input, 'Bu alan zorunludur.');
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          isValid = false;
          showInputError(input, 'Geçerli bir e-posta adresi girin.');
        }
      });

      if (!isValid) {
        e.preventDefault();
        var firstError = form.querySelector('.input-error');
        if (firstError) {
          firstError.closest('.admin-form-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  function showInputError(input, message) {
    input.style.borderColor = '#FF5252';
    input.style.boxShadow = '0 0 0 3px rgba(255, 82, 82, 0.15)';

    var errorEl = document.createElement('span');
    errorEl.className = 'input-error';
    errorEl.style.cssText = 'color:#FF5252;font-size:0.75rem;margin-top:4px;display:block;';
    errorEl.textContent = message;

    input.parentElement.appendChild(errorEl);

    input.addEventListener('input', function handler() {
      removeInputError(input);
      input.removeEventListener('input', handler);
    });
  }

  function removeInputError(input) {
    input.style.borderColor = '';
    input.style.boxShadow = '';

    var errorEl = input.parentElement.querySelector('.input-error');
    if (errorEl) {
      errorEl.remove();
    }
  }

  function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /* ─── Admin Table Search ─── */
  const tableSearchInput = document.querySelector('.table-search-input');

  if (tableSearchInput) {
    var debounceTimer;

    tableSearchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var query = this.value.toLowerCase().trim();

      debounceTimer = setTimeout(function () {
        var table = document.querySelector('.admin-table');
        if (!table) return;

        var rows = table.querySelectorAll('tbody tr');

        rows.forEach(function (row) {
          var text = row.textContent.toLowerCase();
          if (text.indexOf(query) !== -1) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }, 300);
    });
  }

  /* ─── Confirm Delete for Table Rows ─── */
  const tableDeleteButtons = document.querySelectorAll('.table-action-btn.delete');

  tableDeleteButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
        e.preventDefault();
      }
    });
  });

  /* ─── Loading State Helper ─── */
  window.setLoadingState = function (button, isLoading) {
    if (isLoading) {
      button.setAttribute('data-original-text', button.textContent);
      button.disabled = true;
      button.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> İşleniyor...';
    } else {
      button.disabled = false;
      button.textContent = button.getAttribute('data-original-text') || 'Gönder';
      button.removeAttribute('data-original-text');
    }
  };

  /* ─── Sidebar Active Link ─── */
  function setActiveSidebarLink() {
    var currentPath = window.location.pathname;
    var sidebarLinks = document.querySelectorAll('.sidebar-nav a');

    sidebarLinks.forEach(function (link) {
      link.classList.remove('active');
      var linkHref = link.getAttribute('href');

      if (linkHref === currentPath) {
        link.classList.add('active');
      } else if (linkHref !== '/admin' && linkHref !== '/admin/' && currentPath.startsWith(linkHref)) {
        link.classList.add('active');
      }
    });
  }

  setActiveSidebarLink();

  /* ─── Window Resize Handler ─── */
  var resizeTimer;

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 768) {
        closeSidebar();
      }
    }, 250);
  });

  /* ─── Console Branding ─── */
  console.log(
    '%c⚙️ Admin Panel %c v1.0 ',
    'background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; padding: 6px 10px; border-radius: 4px 0 0 4px; font-weight: bold;',
    'background: #1A1A2E; color: #A7A9BE; padding: 6px 10px; border-radius: 0 4px 4px 0;'
  );

});
