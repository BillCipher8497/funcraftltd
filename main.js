/* =========================================================
   Kalavaibhav Sevabhavi Sanstha — shared scripts
   Bilingual: English (*.html) and Marathi (*-mr.html)
   ========================================================= */
(function () {
  'use strict';

  var TOTAL_IMAGES = 50;
  var IMG_DIR = 'images/';
  var EXT = '.jpg';
  /* excluded from the gallery pool so no photo repeats:
     - 11: byte-for-byte duplicate of gallery5.jpg
     - 3, 16, 18, 24, 34, 39, 41, 42, 43, 46: already shown elsewhere on the
       site (About/Home hero, "what we do" cards, initiatives teaser) */
  var DUPLICATE_IMAGES = [3, 11, 16, 18, 24, 34, 39, 41, 42, 43, 46];

  /* ---- Language ---- */
  var LANG = (document.documentElement.getAttribute('lang') === 'mr') ? 'mr' : 'en';

  var STRINGS = {
    en: {
      slotAlt: 'Students at a Kalavaibhav arts activity',
      tileAlt: 'Moment from a Kalavaibhav activity',
      tileLabel: function (n) { return 'View larger image ' + n; },
      lbAlt: function (n, total) { return 'Enlarged Kalavaibhav photo ' + n + ' of ' + total; },
      counter: function (n, total) { return n + ' / ' + total; }
    },
    mr: {
      slotAlt: 'कलावैभवच्या कला उपक्रमातील विद्यार्थी',
      tileAlt: 'कलावैभवच्या उपक्रमातील एक क्षण',
      tileLabel: function (n) { return 'छायाचित्र ' + toDev(n) + ' मोठ्या आकारात पहा'; },
      lbAlt: function (n, total) { return 'कलावैभवचे मोठे केलेले छायाचित्र ' + toDev(n) + ' पैकी ' + toDev(total); },
      counter: function (n, total) { return toDev(n) + ' / ' + toDev(total); }
    }
  };

  var T = STRINGS[LANG];

  /* Latin digits -> Devanagari digits */
  function toDev(n) {
    var map = '०१२३४५६७८९';
    return String(n).replace(/[0-9]/g, function (d) { return map.charAt(+d); });
  }

  /* ---- Fisher–Yates shuffle ---- */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function buildPool() {
    var pool = [];
    for (var i = 1; i <= TOTAL_IMAGES; i++) {
      if (DUPLICATE_IMAGES.indexOf(i) !== -1) continue;
      pool.push('gallery' + i);
    }
    return shuffle(pool);
  }

  function src(name) { return IMG_DIR + name + EXT; }

  /* If an image is missing, fade its container so layout doesn't break */
  function gracefulImg(img) {
    img.addEventListener('error', function () {
      var fig = img.closest('figure');
      if (fig) { fig.style.display = 'none'; }
      else { img.style.opacity = '0'; }
    });
  }

  /* ---- Mobile nav ---- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- Language toggle -------------------------------------------------
     Each page hard-codes its counterpart in the header link, so no work is
     normally needed. This is a safety net: if the href is missing, derive
     the counterpart from the current filename (about.html <-> about-mr.html).
     Also remembers the last chosen language so a visitor landing on the
     English home page is offered — never forced into — their last choice.
  --------------------------------------------------------------------- */
  var LANG_KEY = 'kv-lang';

  function counterpart(file) {
    if (!file) file = 'index.html';
    return (/-mr\.html$/.test(file))
      ? file.replace(/-mr\.html$/, '.html')
      : file.replace(/\.html$/, '-mr.html');
  }

  function initLangToggle() {
    var link = document.querySelector('.lang-toggle');
    if (!link) return;
    if (!link.getAttribute('href')) {
      var file = (location.pathname.split('/').pop() || 'index.html');
      link.setAttribute('href', counterpart(file));
    }
    link.addEventListener('click', function () {
      try { localStorage.setItem(LANG_KEY, LANG === 'en' ? 'mr' : 'en'); } catch (e) {}
    });
    try { localStorage.setItem(LANG_KEY, LANG); } catch (e) {}
  }

  /* ---- Static single photo for non-gallery pages ---- */
  var STATIC_IMAGE = 'gallery18';

  function fillHeroStatic() {
    var host = document.querySelector('.hero-photos');
    if (!host || host.querySelector('img')) return;
    var img = document.createElement('img');
    img.src = src(STATIC_IMAGE);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    gracefulImg(img);
    host.appendChild(img);
  }

  function fillSlotsStatic() {
    var slots = document.querySelectorAll('[data-img-slot]');
    slots.forEach(function (slot) {
      if (slot.querySelector('img')) return;
      var img = document.createElement('img');
      img.src = src(STATIC_IMAGE);
      img.alt = slot.getAttribute('data-alt') || T.slotAlt;
      img.loading = 'lazy';
      gracefulImg(img);
      slot.appendChild(img);
    });
  }

  /* ---- Gallery + lightbox ---- */
  function initGallery() {
    var grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    var pool = buildPool(); // fresh randomized order each load
    var frag = document.createDocumentFragment();

    pool.forEach(function (name, idx) {
      var fig = document.createElement('figure');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tile';
      btn.setAttribute('aria-label', T.tileLabel(idx + 1));
      btn.dataset.index = idx;
      var img = document.createElement('img');
      img.src = src(name);
      img.alt = T.tileAlt;
      img.loading = 'lazy';
      gracefulImg(img);
      btn.appendChild(img);
      fig.appendChild(btn);
      frag.appendChild(fig);
    });
    grid.appendChild(frag);

    setupLightbox(grid, pool);
  }

  function setupLightbox(grid, pool) {
    var box = document.getElementById('lightbox');
    if (!box) return;
    var lbImg = box.querySelector('img');
    var counter = box.querySelector('.lb-counter');
    var btnClose = box.querySelector('.lb-close');
    var btnPrev = box.querySelector('.lb-prev');
    var btnNext = box.querySelector('.lb-next');
    var current = 0;
    var lastFocus = null;

    function render() {
      lbImg.src = src(pool[current]);
      lbImg.alt = T.lbAlt(current + 1, pool.length);
      counter.textContent = T.counter(current + 1, pool.length);
    }
    function open(i) {
      current = i; lastFocus = document.activeElement;
      render(); box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
      btnClose.focus();
      document.body.style.overflow = 'hidden';
    }
    function close() {
      box.classList.remove('open'); box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    function step(d) { current = (current + d + pool.length) % pool.length; render(); }

    grid.addEventListener('click', function (e) {
      var tile = e.target.closest('button.tile');
      if (tile) open(parseInt(tile.dataset.index, 10));
    });
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { step(-1); });
    btnNext.addEventListener('click', function () { step(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') { e.preventDefault(); btnClose.focus(); } // simple focus trap
    });
  }

  /* ---- Footer year (localised digits) ---- */
  function initYear() {
    var y = document.getElementById('year');
    if (!y) return;
    var year = new Date().getFullYear();
    y.textContent = (LANG === 'mr') ? toDev(year) : String(year);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initLangToggle();
    initYear();
    if (document.querySelector('.gallery-grid')) {
      initGallery();
    } else {
      fillHeroStatic();
      fillSlotsStatic();
    }
  });
})();
