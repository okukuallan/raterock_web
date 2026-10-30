/* Floating menu bubble behaviour:
   1. a highlight bubble slides to the hovered link and rests on the current page's link
   2. the menu swaps between a deep-green pill (over light areas) and an ivory pill (over dark areas)
      by looking at what is actually painted behind it. */
(function () {
  var nav = document.querySelector('.nav');
  var pill = nav && nav.querySelector('.nav__pill');
  if (!nav || !pill) return;

  /* ---------- sliding bubble ---------- */
  var list = nav.querySelector('.nav__links');
  var bubble = null;
  if (list) {
    bubble = document.createElement('span');
    bubble.className = 'nav__bubble';
    bubble.setAttribute('aria-hidden', 'true');
    list.insertBefore(bubble, list.firstChild);
    var links = [].slice.call(list.querySelectorAll('.nav__link'));
    var restTarget = function () { return list.querySelector('.nav__link.active, .nav__link--active'); };
    var moveTo = function (el) {
      if (!el) { bubble.style.opacity = '0'; return; }
      bubble.style.left = el.offsetLeft + 'px';
      bubble.style.width = el.offsetWidth + 'px';
      bubble.style.top = el.offsetTop + 'px';
      bubble.style.bottom = 'auto';
      bubble.style.height = el.offsetHeight + 'px';
      bubble.style.opacity = '1';
    };
    links.forEach(function (l) { l.addEventListener('mouseenter', function () { moveTo(l); }); l.addEventListener('focus', function () { moveTo(l); }); });
    list.addEventListener('mouseleave', function () { moveTo(restTarget()); });
    var settle = function () { bubble.style.transition = 'none'; moveTo(restTarget()); void bubble.offsetWidth; bubble.style.transition = ''; };
    window.addEventListener('load', settle);
    window.addEventListener('resize', settle);
    setTimeout(settle, 60);
  }

  /* ---------- colour from the page behind the pill ---------- */
  function parse(str) {
    var m = str && str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(',').map(function (v) { return parseFloat(v); });
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function lightAt(x, y) {
    /* wavy section breaks: the light SVG shape is drawn above the section, so test its real outline */
    var waves = document.querySelectorAll('.wave-svg');
    for (var w = 0; w < waves.length; w++) {
      var r = waves[w].getBoundingClientRect();
      if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) {
        var path = waves[w].querySelector('path');
        if (path && path.isPointInFill) {
          var pt = new DOMPoint((x - r.left) / r.width * 1000, (y - r.top) / r.height * 100);
          if (path.isPointInFill(pt)) { var fc = parse(getComputedStyle(path).fill) || { r: 245, g: 241, b: 235, a: 1 }; return lum(fc) > 0.5; }
        }
      }
    }
    var els = document.elementsFromPoint(x, y);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (nav.contains(el)) continue;
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO') return false;
      var cs = getComputedStyle(el), bg = parse(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return false;
      if (bg && bg.a > 0.6) return lum(bg) > 0.5;
    }
    return false;
  }

  var current = null, ticking = false;
  function update() {
    ticking = false;
    var r = pill.getBoundingClientRect(), y = r.top + r.height / 2, vw = window.innerWidth, votes = 0;
    [0.2, 0.5, 0.8].forEach(function (f) { if (lightAt(vw * f, y)) votes++; });
    var onLight = votes >= 2;
    if (onLight !== current) {
      current = onLight;
      nav.classList.toggle('nav--on-dark', !onLight);
    }
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', function () { update(); setTimeout(update, 400); });
  update();
})();
