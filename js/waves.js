/* Wavy light/dark section breaks. Mark a dark section with data-wave="top", "bottom" or "top bottom".
   A light SVG shape (data-wave-color, default ivory) is drawn over its top and/or bottom edge so the
   straight line becomes a slowly undulating curve. Waves are numbered in page order (top before bottom
   within a section) and exposed as window.__wave.y(index, x) for the particle swarm. */
/* Wavy light/dark section breaks. A light SVG shape is drawn over the dark section at each
   boundary (inside the dark section's top, or inside the upper dark section's bottom), so the
   straight edge becomes a slowly undulating curve. window.__wave.y() exposes the live curve
   so the particle swarm can stay on the right side of it. */
(function () {
  var TAU = Math.PI * 2;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DEFS = [];
  [].slice.call(document.querySelectorAll('[data-wave]')).forEach(function (el) {
    var v = el.getAttribute('data-wave');
    if (v.indexOf('top') > -1) DEFS.push([el, 'top']);
    if (v.indexOf('bottom') > -1) DEFS.push([el, 'bottom']);
  });
  if (!DEFS.length) return;
  var ns = 'http://www.w3.org/2000/svg', A = 88;
  var waves = DEFS.map(function (d, k) {
    var host = d[0], LIGHT = host.getAttribute('data-wave-color') || '#F5F1EB';
    var svg = document.createElementNS(ns, 'svg'), path = document.createElementNS(ns, 'path');
    svg.setAttribute('class', 'wave-svg'); svg.setAttribute('viewBox', '0 0 1000 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    path.setAttribute('fill', LIGHT); svg.appendChild(path);
    svg.style.cssText = 'position:absolute;left:0;width:100%;pointer-events:none;z-index:0;display:block;' + (d[1] === 'top' ? 'top:-1px;' : 'bottom:-1px;');
    host.appendChild(svg);
    var seam = d[1] === 'top' ? host : host.nextElementSibling;
    if (seam) seam.style.marginTop = '-1px';
    return { k: k, host: host, side: d[1], svg: svg, path: path, r: host.getBoundingClientRect(), t: 0 };
  });
  function size() { A = window.innerWidth < 700 ? 44 : 88; waves.forEach(function (w) { if (w) w.svg.style.height = A + 'px'; }); }
  function edge(k, u, t) { return 0.5 + 0.5 * (0.6 * Math.sin(TAU * u + t * 0.35 + k * 1.7) + 0.4 * Math.sin(TAU * (2.3 * u + 0.2 * k) - t * 0.28 + k)); }
  function curvePx(w, u) { var e = edge(w.k, u, w.t); return w.side === 'top' ? A * (0.12 + 0.78 * e) : A * (0.08 + 0.8 * e); }
  function update(w, t) {
    w.t = t; w.r = w.host.getBoundingClientRect();
    var r = w.r;
    if (r.bottom < -300 || r.top > window.innerHeight + 300) return;
    var N = 64, d = w.side === 'top' ? 'M0,0 L1000,0' : 'M0,100 L1000,100';
    for (var i = N; i >= 0; i--) { var u = i / N; d += ' L' + (u * 1000).toFixed(1) + ',' + (curvePx(w, u) / A * 100).toFixed(2); }
    w.path.setAttribute('d', d + ' Z');
  }
  /* viewport y of the curve at viewport x (px) */
  window.__wave = {
    y: function (i, x) {
      var w = waves[i]; if (!w) return null;
      var top = w.side === 'top' ? w.r.top - 1 : w.r.bottom + 1 - A;
      return top + curvePx(w, Math.max(0, Math.min(1, x / window.innerWidth)));
    }
  };
  size();
  window.addEventListener('resize', function () { size(); waves.forEach(function (w) { if (w) update(w, w.t); }); });
  waves.forEach(function (w) { if (w) update(w, 0); });
  if (reduce) { window.addEventListener('load', function () { waves.forEach(function (w) { if (w) update(w, 0); }); }); return; }
  function loop(now) { requestAnimationFrame(loop); waves.forEach(function (w) { if (w) update(w, now / 1000); }); }
  requestAnimationFrame(loop);
})();
