/* ======================================================
   RATELROCK — Main JavaScript
   ====================================================== */

'use strict';

/* ===== NAV SCROLL STATE ===== */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ===== MOBILE NAV ===== */
(function () {
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn  = document.querySelector('.mobile-nav__close');

  if (!hamburger || !mobileNav) return;

  const open  = () => { mobileNav.style.display = 'flex'; requestAnimationFrame(() => mobileNav.classList.add('open')); document.body.style.overflow = 'hidden'; };
  const close = () => { mobileNav.classList.remove('open'); setTimeout(() => { mobileNav.style.display = 'none'; document.body.style.overflow = ''; }, 300); };

  hamburger.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  mobileNav.querySelectorAll('.mobile-nav__link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ===== ACTIVE NAV LINK ===== */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ===== SCROLL REVEAL ===== */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.reveal, .stagger-children').forEach(el => io.observe(el));
})();

/* ===== COUNTER ANIMATION ===== */
(function () {
  const formatNum = (n, suffix) => {
    if (suffix) return n.toFixed(0) + suffix;
    return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toFixed(0);
  };

  const animateCounter = (el) => {
    const target   = parseFloat(el.dataset.target || 0);
    const suffix   = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 1800;
    const start    = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = target * eased;
      el.textContent = decimals
        ? current.toFixed(decimals) + suffix
        : Math.round(current) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => counterIO.observe(el));
})();

/* ===== AUDIENCE TOGGLE ===== */
(function () {
  const btns   = document.querySelectorAll('.toggle__btn');
  const panels = document.querySelectorAll('.toggle__panel');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* ===== FORM SUBMIT ===== */
(function () {
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = '✓ Sent — We\'ll be in touch';
        btn.style.background = 'rgba(26,77,51,0.5)';
        btn.style.borderColor = '#2A5A3A';
        btn.style.color = '#8FCCA8';

        setTimeout(() => {
          btn.textContent = orig;
          btn.disabled = false;
          btn.style.cssText = '';
          form.reset();
        }, 4000);
      }, 1200);
    });
  });
})();

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===== PARALLAX (subtle, hero only) ===== */
(function () {
  const hero = document.querySelector('.hero__bg');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      hero.style.transform = `translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
})();
