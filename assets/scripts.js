/**
 * Personal Website — Subtle interactions
 * Starfield particles + scroll reveal
 * Zero dependencies, vanilla JS
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

  // Apply immediately (before paint) — no transition
  applyTheme(getTheme());

  // Enable transitions only after initial paint (avoids flash)
  requestAnimationFrame(() => {
    body.classList.add('theme-ready');
  });

  // Toggle on click
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = html.hasAttribute('data-theme') ? 'light' : 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // Listen for OS preference changes (when no manual preference is set)
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // ============================================================
  // Respect reduced motion
  // ============================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Still run scroll reveal (instant), skip particles
    setupScrollReveal(true);
    return;
  }

  // ============================================================
  // Starfield
  // ============================================================
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(Math.floor((w * h) / 12000), 100);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.01 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(timestamp) {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Twinkle
      const twinkle = 0.5 + 0.5 * Math.sin(timestamp * p.twinkleSpeed + p.twinkleOffset);
      const alpha = p.opacity * (0.6 + 0.4 * twinkle);

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 195, 170, ${alpha})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  animationId = requestAnimationFrame(draw);

  // Debounced resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      createParticles();
    }, 200);
  });

  // ============================================================
  // Scroll reveal
  // ============================================================
  setupScrollReveal(false);

  function setupScrollReveal(instant) {
    const revealElements = document.querySelectorAll('.reveal');

    if (instant) {
      revealElements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }
})();
