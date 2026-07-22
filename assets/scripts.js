/**
 * Personal Website — "Digital Scholar's Study"
 * Vanilla JS: theme toggle, scroll reveal, zero dependencies
 */
(function () {
  'use strict';

  // ============================================================
  // Theme toggle — light / dark
  // ============================================================
  const STORAGE_KEY = 'theme';
  const html = document.documentElement;
  const body = document.body;
  const toggleBtn = document.querySelector('.theme-toggle');

  function getOSPreference() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || getOSPreference();
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
      html.style.setProperty('color-scheme', 'light');
    } else {
      html.removeAttribute('data-theme');
      html.style.setProperty('color-scheme', 'dark');
    }
  }

  // Apply immediately (before paint)
  applyTheme(getTheme());

  // Enable transitions after initial paint
  requestAnimationFrame(function () {
    body.classList.add('theme-ready');
  });

  // Toggle on click
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var current = html.hasAttribute('data-theme') ? 'light' : 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // Listen for OS preference changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // ============================================================
  // Scroll Reveal — subtle, unified
  // ============================================================
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    var revealEls = document.querySelectorAll('.reveal');
    for (var i = 0; i < revealEls.length; i++) {
      revealEls[i].classList.add('visible');
    }
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          observer.unobserve(entries[i].target);
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  var sections = document.querySelectorAll('.reveal');
  for (var j = 0; j < sections.length; j++) {
    observer.observe(sections[j]);
  }
})();
