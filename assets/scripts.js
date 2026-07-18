/**
 * Personal Website — Apple-inspired interactions
 * Enhanced starfield, card tilt, cursor glow, scroll progress, staggered reveals
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
    setupScrollReveal(true);
    setupScrollProgress();
    return;
  }

  // ============================================================
  // Cursor Glow — subtle radial light following the mouse
  // ============================================================
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  cursorGlow.setAttribute('aria-hidden', 'true');
  document.body.prepend(cursorGlow);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor glow animation loop
  function updateCursorGlow() {
    // Lerp toward mouse position for smooth trailing
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    cursorGlow.style.setProperty('--mouse-x', currentX + 'px');
    cursorGlow.style.setProperty('--mouse-y', currentY + 'px');
    requestAnimationFrame(updateCursorGlow);
  }
  requestAnimationFrame(updateCursorGlow);

  // ============================================================
  // Enhanced Starfield
  // ============================================================
  const canvas = document.getElementById('starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let shootingStars = [];
    let animationId;
    let w, h;
    let mouseInfluenceX = 0;
    let mouseInfluenceY = 0;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(Math.floor((w * h) / 10000), 120);
      particles = [];
      for (let i = 0; i < count; i++) {
        // Depth layers: small = far, large = near
        const depth = Math.random();
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: depth * 1.6 + 0.2,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.6 + 0.15,
          twinkleSpeed: Math.random() * 0.008 + 0.002,
          twinkleOffset: Math.random() * Math.PI * 2,
          depth: depth,
          hue: Math.random() < 0.08 ? 30 + Math.random() * 20 : 38 + Math.random() * 12 // occasional warm star
        });
      }
    }

    function spawnShootingStar() {
      if (shootingStars.length >= 2) return; // limit concurrent shooting stars

      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? Math.random() * w * 0.3 : w * 0.7 + Math.random() * w * 0.3;
      const startY = Math.random() * h * 0.5;
      const angle = fromLeft
        ? Math.PI / 4 + Math.random() * Math.PI / 8
        : Math.PI * 3 / 4 + Math.random() * Math.PI / 8;

      const length = 80 + Math.random() * 120;
      const speed = 6 + Math.random() * 8;

      shootingStars.push({
        x: startX,
        y: startY,
        angle: angle,
        length: length,
        speed: speed,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        opacity: 0.6 + Math.random() * 0.4
      });
    }

    function draw(timestamp) {
      ctx.clearRect(0, 0, w, h);

      // Draw particles with parallax toward mouse
      for (const p of particles) {
        // Gentle parallax — deeper (smaller) stars move less
        const parallax = (1 - p.depth) * 0.3;
        p.x += p.vx + mouseInfluenceX * parallax;
        p.y += p.vy + mouseInfluenceY * parallax;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Twinkle
        const twinkle = 0.5 + 0.5 * Math.sin(timestamp * p.twinkleSpeed + p.twinkleOffset);
        const alpha = p.opacity * (0.55 + 0.45 * twinkle);

        // Draw star with subtle glow
        const glowRadius = p.r * 2.5;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        const hue = p.hue;
        glow.addColorStop(0, `hsla(${hue}, 30%, 82%, ${alpha})`);
        glow.addColorStop(0.4, `hsla(${hue}, 25%, 78%, ${alpha * 0.3})`);
        glow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 210, 190, ${alpha})`;
        ctx.fill();
      }

      // Draw constellation-like connections between nearby bright particles
      ctx.strokeStyle = `rgba(210, 195, 170, 0.04)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && particles[i].depth > 0.5 && particles[j].depth > 0.5) {
            const alpha = (1 - dist / 100) * 0.15;
            ctx.strokeStyle = `rgba(210, 195, 170, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life++;

        // Fade in/out
        const fadeProgress = s.life / s.maxLife;
        let fadeAlpha;
        if (fadeProgress < 0.1) {
          fadeAlpha = fadeProgress / 0.1;
        } else if (fadeProgress > 0.7) {
          fadeAlpha = (1 - fadeProgress) / 0.3;
        } else {
          fadeAlpha = 1;
        }
        const alpha = fadeAlpha * s.opacity;

        // Draw shooting star trail
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 240, 220, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(220, 200, 170, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(220, 200, 170, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 230, ${alpha})`;
        ctx.fill();

        // Remove dead shooting stars
        if (s.life >= s.maxLife || s.x < -100 || s.x > w + 100 || s.y < -100 || s.y > h + 100) {
          shootingStars.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    animationId = requestAnimationFrame(draw);

    // Periodic shooting stars
    function scheduleShootingStar() {
      const delay = 4000 + Math.random() * 12000;
      setTimeout(() => {
        spawnShootingStar();
        scheduleShootingStar();
      }, delay);
    }
    setTimeout(() => scheduleShootingStar(), 3000 + Math.random() * 8000);

    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        createParticles();
      }, 200);
    });

    // Mouse parallax for starfield
    document.addEventListener('mousemove', (e) => {
      // Normalize mouse position to -1..1 range relative to center
      mouseInfluenceX = ((e.clientX / w) - 0.5) * 0.15;
      mouseInfluenceY = ((e.clientY / h) - 0.5) * 0.15;
    });
  }

  // ============================================================
  // Card 3D Tilt — Apple TV-style perspective tilt on hover
  // ============================================================
  function setupCardTilt() {
    const cards = document.querySelectorAll('.glass-card:not(.journal-entry)');

    cards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        card.classList.add('tilt-active');
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 6 degrees)
        const rotateY = ((x - centerX) / centerX) * 6;
        const rotateX = -((y - centerY) / centerY) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilt-active');
        card.style.transform = '';
      });
    });
  }

  // Setup tilt on existing cards + observe for new ones
  setupCardTilt();

  // ============================================================
  // Scroll Progress Bar
  // ============================================================
  function setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.prepend(progressBar);

    const bar = progressBar.querySelector('.scroll-progress-bar');

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
  setupScrollProgress();

  // ============================================================
  // Scroll Reveal — with staggered card delays
  // ============================================================
  setupScrollReveal(false);

  function setupScrollReveal(instant) {
    const revealElements = document.querySelectorAll('.reveal');

    if (instant) {
      revealElements.forEach(el => el.classList.add('visible'));
      // Also reveal all cards instantly
      document.querySelectorAll('.card-grid .glass-card').forEach(c => c.classList.add('revealed'));
      return;
    }

    // Section reveal
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // When a section becomes visible, stagger-reveal its cards
            const cards = entry.target.querySelectorAll('.card-grid .glass-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('revealed');
              }, index * 60); // Staggered delay
            });

            sectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => sectionObserver.observe(el));

    // Also observe journal entries for staggered reveal
    const journalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const entries = entry.target.querySelectorAll('.journal-entry');
            entries.forEach((item, index) => {
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, index * 50);
            });
            journalObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    const journalSections = document.querySelectorAll('.journal-list').forEach(list => {
      const entries = list.querySelectorAll('.journal-entry');
      entries.forEach(entry => {
        entry.style.opacity = '0';
        entry.style.transform = 'translateY(12px)';
        entry.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      });
      journalObserver.observe(list);
    });
  }

  // ============================================================
  // Smooth number counter animation (for stats, future use)
  // ============================================================
  function animateCount(el, target, duration = 1500) {
    const start = parseInt(el.textContent) || 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }
})();
