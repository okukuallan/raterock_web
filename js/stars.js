/* Night-sky star fields. Every element whose id starts with "tsparticles-" becomes a canvas
   star field filling its parent section. Stars drift on slowly wandering paths and are pushed
   away by the cursor with spring physics, so they scatter smoothly and then settle back.
   Canvas 2D, only animates while the section is on screen, still for reduced-motion users. */
(function () {
  var hosts = [].slice.call(document.querySelectorAll('[id^="tsparticles-"]'));
  if (!hosts.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;
  /* per-host look; anything not listed uses the defaults */
  var LOOKS = { 'tsparticles-contact': { r: [0.8, 2.2], a: [0.25, 0.85] } };
  var DEFAULT = { r: [0.5, 1.8], a: [0.12, 0.65] };
  var fields = [], active = [];
  var ptr = { x: 0, y: 0, has: false };

  function Field(host) {
    var look = LOOKS[host.id] || DEFAULT;
    var sec = host.parentElement || host;
    var cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    var f = { sec: sec, visible: false, stars: [], W: 0, H: 0, m: { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, has: false, speed: 0, lx: 0, ly: 0 } };

    f.build = function () {
      var r = sec.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      f.W = Math.max(1, r.width); f.H = Math.max(1, r.height);
      cv.width = f.W * dpr; cv.height = f.H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(560, Math.max(150, f.W * f.H / 2300)));
      f.stars = [];
      for (var i = 0; i < n; i++) {
        var sp = 5 + Math.random() * 28, a = Math.random() * TAU;
        f.stars.push({ x: Math.random() * f.W, y: Math.random() * f.H, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          wob: Math.random() * TAU, wsp: 0.15 + Math.random() * 0.35, ox: 0, oy: 0, ovx: 0, ovy: 0,
          r: look.r[0] + Math.random() * (look.r[1] - look.r[0]) * 0.75,
          base: look.a[0] + Math.random() * (look.a[1] - look.a[0]),
          tw: Math.random() * TAU, tws: 0.4 + Math.random() * 1.4 });
      }
      f.draw(0);
    };

    f.draw = function (t) {
      ctx.clearRect(0, 0, f.W, f.H);
      ctx.fillStyle = '#ffffff';
      var st = f.stars;
      for (var i = 0; i < st.length; i++) {
        var s = st[i], tw = 0.65 + 0.35 * Math.sin(t * s.tws + s.tw);
        var disp = Math.sqrt(s.ox * s.ox + s.oy * s.oy);
        ctx.globalAlpha = Math.min(1, s.base * tw * (1 + disp / 90));
        ctx.beginPath(); ctx.arc(s.x + s.ox, s.y + s.oy, s.r * (1 + Math.min(disp / 140, 0.6)), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    f.step = function (dt, t) {
      var m = f.m, W = f.W, H = f.H, R = 250, R2 = R * R, st = f.stars;
      var rr = sec.getBoundingClientRect();
      var inside = ptr.has && ptr.x >= rr.left && ptr.x <= rr.right && ptr.y >= rr.top && ptr.y <= rr.bottom;
      if (inside) { m.tx = ptr.x - rr.left; m.ty = ptr.y - rr.top; if (!m.has) { m.x = m.tx; m.y = m.ty; m.lx = m.x; m.ly = m.y; } m.has = true; }
      else m.has = false;
      if (m.has) {
        var k = 1 - Math.exp(-dt * 14), nx = m.x + (m.tx - m.x) * k, ny = m.y + (m.ty - m.y) * k;
        var inst = Math.sqrt((nx - m.lx) * (nx - m.lx) + (ny - m.ly) * (ny - m.ly)) / dt;
        m.speed += (inst - m.speed) * (1 - Math.exp(-dt * 6));
        m.lx = nx; m.ly = ny; m.x = nx; m.y = ny;
      } else { m.speed *= Math.exp(-dt * 4); }
      var power = 0.8 + Math.min(1, m.speed / 700) * 1.2;
      for (var i = 0; i < st.length; i++) {
        var s = st[i];
        s.wob += s.wsp * dt;
        var sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy), ang = Math.atan2(s.vy, s.vx) + Math.sin(s.wob) * 0.35 * dt;
        s.vx = Math.cos(ang) * sp; s.vy = Math.sin(ang) * sp;
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < -4) s.x = W + 4; else if (s.x > W + 4) s.x = -4;
        if (s.y < -4) s.y = H + 4; else if (s.y > H + 4) s.y = -4;
        var fx = 0, fy = 0;
        if (m.has) {
          var dx = s.x + s.ox - m.x, dy = s.y + s.oy - m.y, d2 = dx * dx + dy * dy;
          if (d2 < R2) { var d = Math.sqrt(d2) || 1, fo = 1 - d / R; fo = fo * fo * 6200 * power; fx = dx / d * fo; fy = dy / d * fo; }
        }
        s.ovx += (fx - 1.9 * s.ox - 2.9 * s.ovx) * dt;
        s.ovy += (fy - 1.9 * s.oy - 2.9 * s.ovy) * dt;
        s.ox += s.ovx * dt; s.oy += s.ovy * dt;
      }
      f.draw(t);
    };

    f.build();
    fields.push(f);
    if ('ResizeObserver' in window) new ResizeObserver(function () { f.build(); }).observe(sec);
    if (!reduce) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { f.visible = es[0].isIntersecting; active = fields.filter(function (x) { return x.visible; }); }, { rootMargin: '60px' }).observe(sec);
      } else { f.visible = true; active = fields.slice(); }
    }
  }

  hosts.forEach(Field);
  if (reduce) return;
  window.addEventListener('pointermove', function (e) { ptr.x = e.clientX; ptr.y = e.clientY; ptr.has = true; }, { passive: true });
  document.addEventListener('pointerleave', function () { ptr.has = false; });

  var last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min((now - last) / 1000, 1 / 20); last = now;
    if (dt <= 0) return;
    for (var i = 0; i < active.length; i++) active[i].step(dt, now / 1000);
  }
  requestAnimationFrame(loop);
})();
