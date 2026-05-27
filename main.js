(() => {
  'use strict';

  const isMobile = () => window.innerWidth <= 900;
  const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.addEventListener('contextmenu', event => {
    event.preventDefault();
  });

  // ── Custom Cursor ──────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  if (cursor && hasFinePointer()) {
    document.addEventListener('mousemove', e => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--expanded'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--expanded'));
    });
  } else if (cursor) {
    cursor.remove();
  }

  // ── Scroll Reveal ──────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  const observerText = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('is-visible'), delay * 1000);
      observerText.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // Stagger groups
  const staggerParents = [
    '.text-block',
    '.metodologia__steps',
    '.extras__grid',
    '.plan',
    '.contact__list',
    '.footer__top',
  ];

  staggerParents.forEach(selector => {
    document.querySelectorAll(selector).forEach(parent => {
      const children = parent.querySelectorAll('.reveal');
      children.forEach((child, i) => {
        const isMethodSteps = parent.matches('.metodologia__steps');
        const base = isMethodSteps ? 0 : 0.08;
        const step = isMethodSteps ? 0.045 : 0.12;
        const maxDelay = isMethodSteps ? 0.18 : 0.4;
        child.dataset.delay = (base + Math.min(i * step, maxDelay)).toFixed(2);
      });
    });
  });

  // Hero words cascade
  document.querySelectorAll('.hero__claim .reveal').forEach((el, i) => {
    el.dataset.delay = (0.2 + i * 0.14).toFixed(2);
  });

  revealEls.forEach(el => observerText.observe(el));

  // ── Hero Parallax (mouse) ──────────────────────────────────
  if (!isMobile() && hasFinePointer()) {
    const heroBg   = document.querySelector('.hero__bg');
    const heroWords = document.querySelectorAll('.hero__claim span[data-depth]');

    let tx = 0, ty = 0, nbx = 0, nby = 0;
    const range = 18;
    const bgEase = 0.055;
    const wordEase = 0.07;
    let wox = 0, woy = 0;
    let rafParallax;

    document.addEventListener('mousemove', e => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const t0 = Date.now();

    const tickParallax = () => {
      nbx += (tx - nbx) * bgEase;
      nby += (ty - nby) * bgEase;
      wox += (tx - wox) * wordEase;
      woy += (ty - woy) * wordEase;

      if (heroBg) {
        const t      = (Date.now() - t0) / 1000;
        const scale  = 1.08 + Math.sin(t * 0.18) * 0.11;
        const driftX = Math.sin(t * 0.14) * 24 + nbx * range;
        const driftY = Math.sin(t * 0.11) * 16 + nby * range;
        heroBg.style.transform = `scale(${scale.toFixed(4)}) translate(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px)`;
      }

      heroWords.forEach(el => {
        const depth = parseFloat(el.dataset.depth) || 0.5;
        el.style.transform = `translate(${(wox * depth * 18).toFixed(2)}px, ${(woy * depth * 10).toFixed(2)}px)`;
      });

      requestAnimationFrame(tickParallax);
    };
    tickParallax();
  }

  // ── Scroll Parallax + Ken Burns (photo sections) ──────────────────────
  const scrollParallaxEls = document.querySelectorAll('[data-scroll-speed]');

  if (scrollParallaxEls.length > 0 && !isMobile() && hasFinePointer()) {
    const t0kb = Date.now();

    const tickScrollParallax = () => {
      const vh = window.innerHeight;
      scrollParallaxEls.forEach(el => {
        const speed      = parseFloat(el.dataset.scrollSpeed) || 0.25;
        const rect       = el.parentElement.getBoundingClientRect();
        const fromCenter = (rect.top + rect.height / 2) - vh / 2;

        if (el.classList.contains('photo-break__img')) {
          const t      = (Date.now() - t0kb) / 1000;
          const scale  = 1.08 + Math.sin(t * 0.22) * 0.11;
          const driftX = Math.sin(t * 0.16) * 42;
          const driftY = fromCenter * speed + Math.sin(t * 0.13) * 26;
          el.style.transform = `scale(${scale.toFixed(4)}) translate(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px)`;
        } else {
          el.style.transform = `translateY(${(fromCenter * speed).toFixed(2)}px)`;
        }
      });
      requestAnimationFrame(tickScrollParallax);
    };
    tickScrollParallax();
  }

  // ── Nav Scroll Behavior ────────────────────────────────────
  const nav    = document.getElementById('nav');
  const navCta = document.getElementById('nav-cta');
  const heroEl = document.getElementById('hero');

  const updateNav = () => {
    const y = window.scrollY;
    const heroH = heroEl ? heroEl.offsetHeight : window.innerHeight;

    // Scrolled state (backdrop blur)
    if (y > 80) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    // Hide CTA after 60px
    if (navCta) {
      if (y > 60) navCta.classList.add('is-hidden');
      else navCta.classList.remove('is-hidden');
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Floating previous-section button
  const sectionUpBtn = document.getElementById('section-up-btn');
  const footer = document.querySelector('.footer');
  const pageSections = Array.from(document.querySelectorAll('section[id]'));

  const getCurrentSectionIndex = () => {
    const anchorY = window.scrollY + window.innerHeight * 0.38;
    let currentIndex = 0;

    pageSections.forEach((section, index) => {
      if (section.offsetTop <= anchorY) currentIndex = index;
    });

    return currentIndex;
  };

  const updateSectionUpBtn = () => {
    if (!sectionUpBtn || pageSections.length === 0) return;

    const footerVisible = footer
      ? footer.getBoundingClientRect().top <= window.innerHeight
      : false;
    const nearTop = window.scrollY < 120;

    sectionUpBtn.classList.toggle('is-hidden', nearTop || footerVisible);
  };

  if (sectionUpBtn && pageSections.length > 0) {
    sectionUpBtn.addEventListener('click', () => {
      const currentIndex = getCurrentSectionIndex();
      const targetIndex = Math.max(currentIndex - 1, 0);
      pageSections[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    window.addEventListener('scroll', updateSectionUpBtn, { passive: true });
    window.addEventListener('resize', updateSectionUpBtn);
    updateSectionUpBtn();
  }

  // ── Mobile Nav Toggle ──────────────────────────────────────
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

})();
