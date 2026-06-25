/* ============================================================
   LAVLEEN KAUR — PORTFOLIO JS
   Fullscreen scroll + cursor + particles + scramble + scroll-hint
   ============================================================ */

(function () {
  'use strict';

  const TOTAL_SECTIONS = 4;
  const TRANSITION_MS = 850;
  let currentIndex = 0;
  let isAnimating = false;
  const isDesktop = window.matchMedia('(hover: hover) and (min-width: 992px)').matches;

  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-goto]');
  const scrollProgress = document.getElementById('scrollProgress');
  const scrollHint = document.getElementById('scrollHint');

  /* ============================================================
     1. SECTION NAVIGATION
     ============================================================ */
  function goToSection(target) {
    if (isAnimating) return;
    if (target < 0 || target >= TOTAL_SECTIONS) return;
    if (target === currentIndex) return;

    isAnimating = true;
    currentIndex = target;

    pages.forEach((page) => page.classList.remove('is-active', 'is-prev'));

    // force reflow so [data-anim] resets and re-triggers
    void pages[currentIndex].offsetWidth;

    pages.forEach((page, i) => {
      if (i === currentIndex) page.classList.add('is-active');
      else if (i < currentIndex) page.classList.add('is-prev');
    });

    if (pages[currentIndex]) pages[currentIndex].scrollTop = 0;

    if (scrollProgress) {
      scrollProgress.style.width = (((currentIndex + 1) / TOTAL_SECTIONS) * 100) + '%';
    }
    if (scrollHint) {
      // Show on all sections except the last (contact)
      scrollHint.classList.toggle('hidden', currentIndex === TOTAL_SECTIONS - 1);
    }

    if (history.replaceState) {
      const ids = ['hero', 'skills', 'projects', 'contact'];
      history.replaceState(null, '', '#' + ids[currentIndex]);
    }

    setTimeout(() => { isAnimating = false; }, TRANSITION_MS);
  }

  function initState() {
    const hash = window.location.hash.replace('#', '');
    const ids = ['hero', 'skills', 'projects', 'contact'];
    const idx = ids.indexOf(hash);
    const startIndex = idx >= 0 ? idx : 0;

    pages.forEach((page, i) => {
      page.classList.remove('is-active', 'is-prev');
      if (i === startIndex) page.classList.add('is-active');
      else if (i < startIndex) page.classList.add('is-prev');
    });
    currentIndex = startIndex;

    if (scrollProgress) scrollProgress.style.width = (((currentIndex + 1) / TOTAL_SECTIONS) * 100) + '%';
    if (scrollHint && startIndex === TOTAL_SECTIONS - 1) scrollHint.classList.add('hidden');
  }
  initState();

  /* ============================================================
     2. WHEEL NAVIGATION
     ============================================================ */
  function isInternallyScrollable(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY === 'hidden' || overflowY === 'visible') return false;
    return el.scrollHeight > el.clientHeight + 2;
  }

  let lastWheelTime = 0;
  window.addEventListener('wheel', function (e) {
    const activeSection = pages[currentIndex];
    if (activeSection && isInternallyScrollable(activeSection)) {
      const canDown = activeSection.scrollTop + activeSection.clientHeight < activeSection.scrollHeight - 2;
      const canUp = activeSection.scrollTop > 2;
      if (e.deltaY > 0 && canDown) return;
      if (e.deltaY < 0 && canUp) return;
    }
    e.preventDefault();

    const now = Date.now();
    if (now - lastWheelTime < 100) return;
    lastWheelTime = now;
    if (isAnimating) return;

    if (e.deltaY > 30) goToSection(currentIndex + 1);
    else if (e.deltaY < -30) goToSection(currentIndex - 1);
  }, { passive: false });

  /* ============================================================
     3. TOUCH NAVIGATION
     ============================================================ */
  let touchStartY = 0, touchStartTime = 0, touchActive = false;
  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    touchActive = true;
  }, { passive: true });

  window.addEventListener('touchend', function (e) {
    if (!touchActive) return;
    touchActive = false;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    const deltaTime = Date.now() - touchStartTime;
    if (Math.abs(deltaY) < 50 || deltaTime > 600 || isAnimating) return;

    const activeSection = pages[currentIndex];
    if (activeSection && isInternallyScrollable(activeSection)) {
      const canDown = activeSection.scrollTop + activeSection.clientHeight < activeSection.scrollHeight - 2;
      const canUp = activeSection.scrollTop > 2;
      if (deltaY > 0 && canDown) return;
      if (deltaY < 0 && canUp) return;
    }
    if (deltaY > 0) goToSection(currentIndex + 1);
    else goToSection(currentIndex - 1);
  }, { passive: true });

  /* ============================================================
     4. KEYBOARD NAVIGATION
     ============================================================ */
  window.addEventListener('keydown', function (e) {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (isAnimating) return;

    switch (e.key) {
      case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault(); goToSection(currentIndex + 1); break;
      case 'ArrowUp': case 'PageUp':
        e.preventDefault(); goToSection(currentIndex - 1); break;
      case 'Home': e.preventDefault(); goToSection(0); break;
      case 'End': e.preventDefault(); goToSection(TOTAL_SECTIONS - 1); break;
    }
  });

  /* ============================================================
     5. NAV / CTA CLICKS
     ============================================================ */
  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = parseInt(this.getAttribute('data-goto'), 10);
      goToSection(target);
    });
  });

  /* ============================================================
     6. THEME TOGGLE
     ============================================================ */
  const toggleBtn = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;
  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0a0f');
  }
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const current = htmlEl.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ============================================================
     6b. CONTACT FORM (placeholder)
     ============================================================ */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Form ready — connect Formspree / Web3Forms here.');
    });
  }

  /* ============================================================
     7. CUSTOM CURSOR (desktop only)
     ============================================================ */
  if (isDesktop) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let cursorVisible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursorVisible && cursorDot && cursorRing) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        cursorVisible = true;
      }
      if (cursorDot) {
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (cursorRing) {
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state on interactive elements
    const hoverables = document.querySelectorAll('a, button, .folder-card, .skill-card, .project-card, .service-card, .process-card, .footer-card, .form-control, .theme-toggle, .navbar-brand');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursorDot) cursorDot.classList.add('is-hovering');
        if (cursorRing) cursorRing.classList.add('is-hovering');
      });
      el.addEventListener('mouseleave', () => {
        if (cursorDot) cursorDot.classList.remove('is-hovering');
        if (cursorRing) cursorRing.classList.remove('is-hovering');
      });
    });

    document.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.style.opacity = '0';
      if (cursorRing) cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (cursorDot) cursorDot.style.opacity = '1';
      if (cursorRing) cursorRing.style.opacity = '1';
    });
  }

  /* ============================================================
     8. PARTICLES GENERATOR (hero only)
     ============================================================ */
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    const count = isDesktop ? 22 : 12;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle' + (i % 3 === 0 ? ' particle-cyan' : '');
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (9 + Math.random() * 12) + 's';
      p.style.animationDelay = (Math.random() * 9) + 's';
      const size = 1.5 + Math.random() * 2.5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      frag.appendChild(p);
    }
    particlesContainer.appendChild(frag);
  }

  /* ============================================================
     9. TEXT SCRAMBLE (data-scramble elements)
     ============================================================ */
  const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';
  function scrambleText(el) {
    const original = el.textContent;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 700, 1);
      let output = '';
      for (let i = 0; i < original.length; i++) {
        const reveal = i / original.length;
        if (progress >= reveal + 0.3) {
          output += original[i];
        } else if (progress >= reveal - 0.1) {
          output += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        } else {
          output += original[i] === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
      }
      el.textContent = output;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = original;
    }
    requestAnimationFrame(update);
  }

  // Trigger scramble whenever section becomes active
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.attributeName === 'class' && m.target.classList.contains('is-active')) {
        const scrambles = m.target.querySelectorAll('[data-scramble]');
        scrambles.forEach(s => setTimeout(() => scrambleText(s), 400));
      }
    });
  });
  pages.forEach(p => observer.observe(p, { attributes: true }));

  // Initial scramble on first load (hero)
  setTimeout(() => {
    const initialScrambles = pages[currentIndex].querySelectorAll('[data-scramble]');
    initialScrambles.forEach(s => scrambleText(s));
  }, 600);

})();
