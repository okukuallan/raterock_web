/* Ledger look: adds a scroll-filled rail to marked sections and settles the photo bands in. */
(function () {
  var secs = [].slice.call(document.querySelectorAll('.ledger-band, .section--light, .practice--light'));
  if (!secs.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  secs.forEach(function (s) {
    var r = document.createElement('div');
    r.className = 'ledger-rail';
    r.setAttribute('aria-hidden', 'true');
    s.appendChild(r);
  });

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    secs.forEach(function (s) { if (s.classList.contains('ledger-band')) io.observe(s); });
  } else {
    secs.forEach(function (s) { s.classList.add('is-in'); });
  }

  var tick = false;
  function update() {
    tick = false;
    var vh = window.innerHeight;
    secs.forEach(function (s) {
      var b = s.getBoundingClientRect();
      if (b.bottom < -50 || b.top > vh + 50) return;
      var p = (vh * 0.55 - b.top) / b.height;
      s.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    });
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
