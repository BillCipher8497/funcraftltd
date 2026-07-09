/* =========================================================
   Kalavaibhav Sevabhavi Sanstha — shared scripts
   ========================================================= */
(function () {
  'use strict';

  var TOTAL_IMAGES = 50;
  var IMG_DIR = 'images/';
  var EXT = '.jpg';

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
    for (var i = 1; i <= TOTAL_IMAGES; i++) pool.push('gallery' + i);
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

  /* ---- Static single photo for non-gallery pages ---- */
  var STATIC_IMAGE = 'gallery18';

  function fillHeroStatic() {
    var host = document.querySelector('.hero-photos');
    if (!host) return;
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
      var img = document.createElement('img');
      img.src = src(STATIC_IMAGE);
      img.alt = slot.getAttribute('data-alt') || 'Students at a Kalavaibhav arts activity';
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
      btn.setAttribute('aria-label', 'View larger image ' + (idx + 1));
      btn.dataset.index = idx;
      var img = document.createElement('img');
      img.src = src(name);
      img.alt = 'Moment from a Kalavaibhav activity';
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
    var lbImg = box.querySelector('img');
    var counter = box.querySelector('.lb-counter');
    var btnClose = box.querySelector('.lb-close');
    var btnPrev = box.querySelector('.lb-prev');
    var btnNext = box.querySelector('.lb-next');
    var current = 0;
    var lastFocus = null;

    function render() {
      lbImg.src = src(pool[current]);
      lbImg.alt = 'Enlarged Kalavaibhav photo ' + (current + 1) + ' of ' + pool.length;
      counter.textContent = (current + 1) + ' / ' + pool.length;
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

  /* ---- Footer year ---- */
  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initYear();
    if (document.querySelector('.gallery-grid')) {
      initGallery();
    } else {
      fillHeroStatic();
      fillSlotsStatic();
    }
  });
})();
