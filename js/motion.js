/* Ratelrock motion layer: hero line-set, masked section titles, image unveil, progress hairline. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* Intro curtain: once per visit, home page only */
  var base = 0;
  var seen = false;
  try { seen = sessionStorage.getItem('rr_intro') === '1'; } catch (e) {}
  if (document.querySelector('.gateway') && !reduce && !seen) {
    base = 1300;
    var cur = document.createElement('div');
    cur.className = 'm-curtain';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="m-curtain__word">Ratelrock</div>';
    document.body.appendChild(cur);
    setTimeout(function () { cur.classList.add('m-go'); }, 700);
    setTimeout(function () { cur.remove(); }, 2600);
    try { sessionStorage.setItem('rr_intro', '1'); } catch (e) {}
  }

  /* Hero headline: wrap each <br>-separated line in a mask */
  var h1 = document.querySelector('h1');
  if (h1 && !reduce && !h1.querySelector('.hl')) {
    var parts = h1.innerHTML.split(/<br\s*\/?>/i);
    h1.innerHTML = parts.map(function (p, i) {
      return '<span class="m-ln"><span style="--d:' + (base + 160 + i * 170) + 'ms">' + p.trim() + '</span></span>';
    }).join('');
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
  }

  /* Section titles: inner wrapper so the mask clips a single block */
  var titles = [].slice.call(document.querySelectorAll('h2')).filter(function (t) { return !t.closest('nav, footer, .cookie, .mnav') && !t.querySelector('.hl') && t.textContent.trim().length > 3; });
  if (!reduce) {
    titles.forEach(function (t) {
      var w = document.createElement('span');
      w.className = 'm-in';
      while (t.firstChild) w.appendChild(t.firstChild);
      t.appendChild(w);
      var n = 0;
      (function split(node) {
        [].slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (tok) {
              if (!tok) return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
              var o = document.createElement('span'); o.className = 'm-w';
              var i = document.createElement('i'); i.style.setProperty('--i', n++); i.textContent = tok;
              o.appendChild(i); frag.appendChild(o);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1 && c.tagName !== 'BR') { split(c); }
        });
      })(w);
      t.setAttribute('aria-label', t.textContent.replace(/\s+/g, ' ').trim());
      t.classList.add('m-title');
    });
  }

  if (base) {
    ['.hero__label','.hero__subtitle','.hero__body'].forEach(function (q, i) {
      var el = document.querySelector(q);
      if (el) el.style.animationDelay = (base + 200 + i * 220 + (i ? 500 : 0)) + 'ms';
    });
    var hb = document.querySelector('.hero__bg');
    if (hb) hb.style.animationDelay = (base - 600) + 'ms';
  }

  root.classList.add('m-on');

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('m-seen'); io.unobserve(e.target); } });
    }, { threshold: 0.35, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.m-title').forEach(function (t) { io.observe(t); });
  } else {
    document.querySelectorAll('.m-title').forEach(function (t) { t.classList.add('m-seen'); });
  }


  /* Rows, cards and checklists: staggered arrival */
  if (!reduce) {
    var sel = '.sit-row, .conv-row, .svc-item, .checklist__item, .sidebar-card__item, .diff-row, .stack-band__tag, .pk-stage, .lc-stage, .hero-metric-card, .gold-line';
    var rows = [].slice.call(document.querySelectorAll(sel));
    var seq = new Map();
    rows.forEach(function (el) {
      var par = el.parentElement, k = (seq.get(par) || 0);
      seq.set(par, k + 1);
      el.style.setProperty('--j', k);
      el.classList.add('m-st');
    });
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('m-st-in'); so.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
      rows.forEach(function (el) { so.observe(el); });
    } else { rows.forEach(function (el) { el.classList.add('m-st-in'); }); }
  }

  /* Hero responds to scroll */
  var hero = h1 && h1.closest('section, header');
  if (hero && h1.parentElement) h1.parentElement.classList.add('m-herobox');
  if (hero && !reduce) {
    var ht = false;
    var hu = function () {
      ht = false;
      var p = Math.max(0, Math.min(1, window.scrollY / (hero.offsetHeight * 0.8)));
      hero.style.setProperty('--hp', p.toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!ht) { ht = true; requestAnimationFrame(hu); } }, { passive: true });
    hu();
  }

  /* Gold light follows the pointer on gateway panels */
  if (!reduce) {
    document.querySelectorAll('.gateway__panel').forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        var r = p.getBoundingClientRect();
        p.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        p.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Progress hairline */
  if (!reduce) {
    var bar = document.createElement('div');
    bar.className = 'm-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var tick = false;
    var upd = function () {
      tick = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }
})();
