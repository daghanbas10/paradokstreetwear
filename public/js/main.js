/* =============================================
   MAIN.JS - Ana JavaScript Dosyası
   Navbar, Scroll Reveal, Contact Form, Animasyonlar
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ─── Navbar Scroll Effect ─── */
  const navbar = document.querySelector('.navbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ─── Mobile Menu Toggle ─── */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─── Scroll Reveal Animation ─── */
  const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

  if (scrollRevealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    scrollRevealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ─── Contact Form Handling ─── */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const formMessage = contactForm.querySelector('.form-message') || createFormMessage(contactForm);
      const originalBtnText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Gönderiliyor...';

      formMessage.className = 'form-message';
      formMessage.style.display = 'none';

      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          formMessage.className = 'form-message success';
          formMessage.textContent = result.message || 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.';
          formMessage.style.display = 'block';
          contactForm.reset();
        } else {
          formMessage.className = 'form-message error';
          formMessage.textContent = result.error || 'Bir hata oluştu. Lütfen tekrar deneyin.';
          formMessage.style.display = 'block';
        }
      } catch (error) {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.';
        formMessage.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  function createFormMessage(form) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message';
    form.appendChild(messageDiv);
    return messageDiv;
  }

  /* ─── Counter Animation ─── */
  const statNumbers = document.querySelectorAll('.stat-number');

  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5
      }
    );

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

      element.textContent = prefix + currentValue.toLocaleString('tr-TR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = prefix + target.toLocaleString('tr-TR') + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /* ─── Smooth Scroll for Anchor Links ─── */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ─── Back to Top Button ─── */
  const backToTopBtn = document.querySelector('.back-to-top');

  if (backToTopBtn) {
    function handleBackToTopVisibility() {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });
    handleBackToTopVisibility();

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ─── Active Nav Link Highlighting ─── */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinkElements = document.querySelectorAll('.nav-links a');

    navLinkElements.forEach(function (link) {
      link.classList.remove('active');
      const linkPath = link.getAttribute('href');

      if (linkPath === currentPath) {
        link.classList.add('active');
      } else if (currentPath === '/' && linkPath === '/') {
        link.classList.add('active');
      } else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
        link.classList.add('active');
      }
    });
  }

  setActiveNavLink();

  /* ─── Parallax Effect for Hero (Subtle) ─── */
  const hero = document.querySelector('.hero');

  if (hero) {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      const heroContent = hero.querySelector('.hero-content');
      if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (scrolled * 0.2) + 'px)';
        heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
      }
    }, { passive: true });
  }

  /* ─── Form Input Animation ─── */
  const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

  formInputs.forEach(function (input) {
    input.addEventListener('focus', function () {
      this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function () {
      this.parentElement.classList.remove('focused');
      if (this.value.trim() !== '') {
        this.parentElement.classList.add('has-value');
      } else {
        this.parentElement.classList.remove('has-value');
      }
    });
  });

  /* ─── Image Lazy Loading (Native fallback) ─── */
  const lazyImages = document.querySelectorAll('img[data-src]');

  if (lazyImages.length > 0) {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.getAttribute('data-src');
              img.removeAttribute('data-src');
              img.addEventListener('load', function () {
                img.classList.add('loaded');
              });
              imageObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: '100px 0px'
        }
      );

      lazyImages.forEach(function (img) {
        imageObserver.observe(img);
      });
    } else {
      lazyImages.forEach(function (img) {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
  }

  /* ─── Typing Effect (Optional Hero) ─── */
  const typingElement = document.querySelector('.typing-text');

  if (typingElement) {
    const words = typingElement.getAttribute('data-words');
    if (words) {
      const wordList = words.split(',').map(function (w) { return w.trim(); });
      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let typingSpeed = 100;

      function typeEffect() {
        const currentWord = wordList[wordIndex];

        if (isDeleting) {
          typingElement.textContent = currentWord.substring(0, charIndex - 1);
          charIndex--;
          typingSpeed = 50;
        } else {
          typingElement.textContent = currentWord.substring(0, charIndex + 1);
          charIndex++;
          typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
          typingSpeed = 2000;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % wordList.length;
          typingSpeed = 500;
        }

        setTimeout(typeEffect, typingSpeed);
      }

      typeEffect();
    }
  }

  /* ─── Preloader ─── */
  const preloader = document.querySelector('.preloader');

  if (preloader) {
    window.addEventListener('load', function () {
      preloader.classList.add('fade-out');
      setTimeout(function () {
        preloader.style.display = 'none';
      }, 500);
    });
  }

  /* ─── Console Branding ─── */
  console.log(
    '%c🚀 Yapay Zeka Platform %c v1.0 ',
    'background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; padding: 8px 12px; border-radius: 4px 0 0 4px; font-weight: bold;',
    'background: #1A1A2E; color: #A7A9BE; padding: 8px 12px; border-radius: 0 4px 4px 0;'
  );

});
