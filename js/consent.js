/* Cookie consent and analytics loader.
   Google Analytics is NOT loaded, and nothing is sent to Google, until the visitor presses Accept.
   Decline, or a browser Global Privacy Control / Do Not Track signal, keeps it off.
   The choice is stored only in this browser (localStorage) and can be changed any time
   from "Cookie settings" in the footer. */
(function () {
  var KEY = 'ratelrock_analytics_consent';
  var ID = 'G-3D1BM93WL2';
  var loaded = false;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked: choice lasts for this page only */ } }
  function optedOutBySignal() { return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'; }

  function loadAnalytics() {
    if (loaded) return; /* only ever called after an explicit Accept, which overrides a browser signal */
    loaded = true;
    window['ga-disable-' + ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function stopAnalytics() {
    window['ga-disable-' + ID] = true;
    var host = location.hostname.split('.');
    var domains = ['', location.hostname, '.' + location.hostname];
    if (host.length > 2) domains.push('.' + host.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name.indexOf('_gat') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  if (read() === 'granted') loadAnalytics();

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  }

  ready(function () {
    var banner = document.querySelector('.cookie-banner');
    if (!banner) return;
    var accept = banner.querySelector('.cookie-banner__btn--accept');
    var decline = banner.querySelector('.cookie-banner__btn--decline');

    var backdrop = document.createElement('div');
    backdrop.className = 'cookie-backdrop';
    backdrop.style.display = 'none';
    banner.parentNode.insertBefore(backdrop, banner);
    var root = document.documentElement;


    function show() {
      banner.style.display = '';
      backdrop.style.display = '';
      root.classList.add('consent-lock');
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-modal', 'true');
      requestAnimationFrame(function () {
        banner.classList.add('visible');
        backdrop.classList.add('visible');
        if (accept) accept.focus({ preventScroll: true });
      });
    }
    function hide() {
      root.classList.remove('consent-lock');
      banner.classList.remove('visible');
      backdrop.classList.remove('visible');
      setTimeout(function () { banner.style.display = 'none'; backdrop.style.display = 'none'; }, 400);
    }

    if (read() === null && !optedOutBySignal()) show(); else banner.style.display = 'none';

    if (accept) accept.addEventListener('click', function () { write('granted'); loadAnalytics(); hide(); });
    if (decline) decline.addEventListener('click', function () { write('denied'); stopAnalytics(); hide(); });

    document.querySelectorAll('[data-cookie-settings]').forEach(function (b) {
      b.addEventListener('click', function () { show(); });
    });
  });
})();
