/* Particle swarm shared by the pages: sections marked data-swarm="light|dark" are covered by one
   swarm that follows the pointer, is nudged by scrolling, and stays clipped to those sections.
   Optional data-swarm-top-wave / data-swarm-bot-wave link a section edge to window.__wave. */
/* One particle swarm for the whole page. It follows the pointer as a group, is nudged by
   scrolling, and is clipped to the section it is in: particles fade out before every
   section edge and are never drawn in other sections (hero, photos, table, footer). */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var TAU = Math.PI * 2;
  var PAL = [
    { colors: ['#2D6FB7', '#5B5BD6', '#C0392B', '#D4622F', '#C8963A'], alpha: 0.85 },
    { colors: ['#6FA8FF', '#9B8CFF', '#F27A7A', '#F08A5D', '#E8BF63'], alpha: 0.9 }
  ];
  var TEXT = '.ed-lead,.ed-cols p,.section-title,.section-subtitle,.section-eyebrow,.conv-row,.svc-tab,.svc-panel,.sit-row,.stack-band,.stack-note,.svc-cta,.lc-stage,' +
    '[data-swarm] h2,[data-swarm] h3,[data-swarm] p,[data-swarm] li,[data-swarm] .framework-item,[data-swarm] .value-card,[data-swarm] .pullquote,[data-swarm] .about-mv-grid > div';
  function num(el, name) { var v = el.getAttribute(name); return v === null ? -1 : parseInt(v, 10); }
  var zones = [].slice.call(document.querySelectorAll('[data-swarm]')).map(function (el) {
    var key = el.getAttribute('data-swarm') === 'dark' ? 1 : 0;
    return { el: el, pal: PAL[key], key: key, topW: num(el, 'data-swarm-top-wave'), botW: num(el, 'data-swarm-bot-wave') };
  });
  if (!zones.length) return;

  var st = document.createElement('style');
  st.textContent = 'section > .container, .investor-band .container { position: relative; z-index: 1; } .footer { position: relative; z-index: 2; }';
  document.head.appendChild(st);
  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:0;pointer-events:none;display:block;';
  var footer = document.querySelector('footer.footer');
  document.body.insertBefore(cv, footer || null);
  var ctx = cv.getContext('2d');

  var W = 0, H = 0, R = 260, pts = [], rects = [], c = { x: 0, y: 0 }, ready = false;
  var pointer = { x: 0, y: 0, has: false }, lastScroll = window.pageYOffset;

  function measure() {
    var y = window.pageYOffset;
    rects = [].slice.call(document.querySelectorAll(TEXT)).map(function (el) {
      var r = el.getBoundingClientRect();
      return { l: r.left - 8, r: r.right + 8, t: r.top + y - 8, b: r.bottom + y + 8, w: r.width, h: r.height };
    }).filter(function (r) { return r.w > 4 && r.h > 4; });
  }
  function build() {
    W = window.innerWidth; H = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var small = W < 700;
    R = small ? Math.min(180, W * 0.5) : Math.max(260, Math.min(520, W * 0.34));
    var gap = small ? 46 : 54, minD = gap / R * 0.82, cand = [], guard = 0;
    while (cand.length < 400 && guard++ < 6000) {
      var a = Math.random() * TAU, rr = Math.sqrt(Math.random()), x = Math.cos(a) * rr, y = Math.sin(a) * rr, ok = true;
      for (var j = 0; j < cand.length; j++) { var dx = cand[j][0] - x, dy = cand[j][1] - y; if (dx * dx + dy * dy < minD * minD) { ok = false; break; } }
      if (ok) cand.push([x, y]);
    }
    if (!ready) { c.x = W * 0.5; c.y = H * 0.5; ready = true; }
    pts = cand.map(function (q) {
      return { ux: q[0], uy: q[1], r: Math.sqrt(q[0] * q[0] + q[1] * q[1]), ph: Math.random() * TAU, k: 0.05 + Math.random() * 0.08,
        u: Math.max(0, Math.min(0.999, (q[1] + 1) / 2 * 0.7 + (q[0] + 1) / 2 * 0.3 + (Math.random() - 0.5) * 0.18)),
        x: c.x + q[0] * R, y: c.y + q[1] * R };
    });
    measure();
  }
  build();
  window.addEventListener('resize', build);
  window.addEventListener('load', measure);
  setInterval(measure, 3000);
  document.addEventListener('click', function () { setTimeout(measure, 700); });
  window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.has = true; }, { passive: true });
  document.addEventListener('pointerleave', function () { pointer.has = false; });
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset, dy = y - lastScroll; lastScroll = y;
    c.y -= Math.max(-220, Math.min(220, dy)) * 0.55;   /* swarm gets dragged along by scrolling */
  }, { passive: true });

  var LV = 4;
  function frame(now) {
    requestAnimationFrame(frame);
    var t = now / 1000, sy = window.pageYOffset;
    var zr = zones.map(function (z) { var r = z.el.getBoundingClientRect(); return { top: r.top, bot: r.bottom, pal: z.pal, key: z.key, topW: z.topW, botW: z.botW }; });
    var WV = window.__wave;
    var any = zr.some(function (z) { return z.bot > 0 && z.top < H; });
    ctx.clearRect(0, 0, W, H);
    if (!any) return;
    var px = pointer.has ? pointer.x : null, py = pointer.has ? pointer.y : null;
    var tx = px !== null ? px : W * 0.5 + Math.sin(t * 0.21) * W * 0.28;
    var ty = py !== null ? py : H * 0.5 + Math.cos(t * 0.16) * H * 0.22;
    c.x += (tx - c.x) * 0.035; c.y += (ty - c.y) * 0.035;
    var rot = t * 0.05, cr = Math.cos(rot), sr = Math.sin(rot), buckets = {}, nr = rects.length;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], rx = p.ux * cr - p.uy * sr, ry = p.ux * sr + p.uy * cr, a = Math.atan2(ry, rx);
      var edge = 1 + 0.07 * Math.sin(3 * a + t * 0.7) + 0.05 * Math.sin(5 * a - t * 0.55);
      var gx = c.x + rx * R * edge + Math.sin(t * 0.9 + p.ph * 3) * 12 + Math.sin(t * 1.7 + p.ph) * 5;
      var gy = c.y + ry * R * edge + Math.cos(t * 0.8 + p.ph * 2) * 12 + Math.cos(t * 1.5 + p.ph * 5) * 5;
      if (px !== null) {
        var ddx = gx - px, ddy = gy - py, d = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        var e = (d - 120) / 60, push = Math.exp(-e * e) * 34 + Math.exp(-(d * d) / (95 * 95)) * 40;
        gx += ddx / d * push; gy += ddy / d * push;
      }
      var mx = gx - p.x, my = gy - p.y; p.x += mx * p.k; p.y += my * p.k;
      /* which section is this particle in? none = not drawn; near an edge = faded */
      var zi = -1, fade = 0;
      for (var z = 0; z < zr.length; z++) {
        var zt = zr[z].top, zb = zr[z].bot, wy;
        if (WV && zr[z].topW >= 0 && (wy = WV.y(zr[z].topW, p.x)) !== null) zt = wy;
        if (WV && zr[z].botW >= 0 && (wy = WV.y(zr[z].botW, p.x)) !== null) zb = wy;
        if (p.y >= zt && p.y <= zb) { zi = z; fade = Math.max(0, Math.min(1, (Math.min(p.y - zt, zb - p.y) - 40) / 110)); break; }
      }
      if (zi < 0 || fade <= 0.02) continue;
      var under = false, py2 = p.y + sy;
      for (var u = 0; u < nr; u++) { var rc = rects[u]; if (p.x > rc.l && p.x < rc.r && py2 > rc.t && py2 < rc.b) { under = true; break; } }
      var al = fade * zr[zi].pal.alpha * (under ? 0.35 : 1), lv = Math.round(al * LV);
      if (lv < 1) continue;
      var mot = Math.sqrt(mx * mx + my * my), w = Math.min(1, mot / 8), rad = a + Math.sin(t * 0.6 + p.ph) * 0.7, mv = Math.atan2(my, mx);
      var ang = Math.atan2(Math.sin(rad) * (1 - w) + Math.sin(mv) * w, Math.cos(rad) * (1 - w) + Math.cos(mv) * w);
      var size = 1 - 0.5 * p.r * p.r * p.r, len = (1.3 + Math.min(mot * 0.12, 3)) * size, hx = Math.cos(ang) * len, hy = Math.sin(ang) * len;
      var ci = Math.floor(p.u * 5), bk = zr[zi].key * 100 + ci * 10 + lv;
      (buckets[bk] || (buckets[bk] = [])).push(p.x - hx, p.y - hy, p.x + hx, p.y + hy);
    }
    ctx.lineCap = 'round'; ctx.lineWidth = 1.9;
    for (var k in buckets) {
      var kk = +k, lv2 = kk % 10, ci2 = Math.floor(kk / 10) % 10, pal = PAL[kk >= 100 ? 1 : 0], arr = buckets[k];
      ctx.globalAlpha = lv2 / LV; ctx.strokeStyle = pal.colors[ci2]; ctx.beginPath();
      for (var s = 0; s < arr.length; s += 4) { ctx.moveTo(arr[s], arr[s + 1]); ctx.lineTo(arr[s + 2], arr[s + 3]); }
      ctx.stroke();
    }
  }
  requestAnimationFrame(frame);
})();
