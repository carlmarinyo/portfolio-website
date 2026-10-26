/* ===================================================================
   PORTFOLIO — INTERACTIONS
   =================================================================== */

'use strict';

// Theme preference: use the visitor's system setting until they choose one.
(function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function updateToggle(theme) {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const label = `Switch to ${nextTheme} mode`;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    if (themeColor) themeColor.content = theme === 'dark' ? '#171A17' : '#F5F3EE';
  }

  updateToggle(root.dataset.theme || 'light');

  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch (error) {
      // The selected theme still applies when storage is unavailable.
    }
    updateToggle(theme);
  });
})();

// ─── FOOTER YEAR ────────────────────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── PROJECT CATEGORY FILTER ──────────────────────────────────────────
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workItems = document.querySelectorAll('.work-item');
  const workDividers = document.querySelectorAll('.work-divider');
  if (!filterBtns.length || !workItems.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update button states
      filterBtns.forEach((b) => {
        b.classList.remove('filter-btn-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('filter-btn-active');
      btn.setAttribute('aria-selected', 'true');

      // Show / hide items
      let visibleCount = 0;
      workItems.forEach((item) => {
        const cat = item.dataset.category;
        const show = filter === 'all' || cat === filter;
        item.classList.toggle('work-hidden', !show);
        if (show) visibleCount++;
      });

      // Hide dividers between hidden items
      workDividers.forEach((div) => {
        const prev = div.previousElementSibling;
        const next = div.nextElementSibling;
        const prevHidden = prev && prev.classList.contains('work-hidden');
        const nextHidden = next && next.classList.contains('work-hidden');
        div.style.display = (prevHidden || nextHidden || !prev || !next) ? 'none' : '';
      });
    });
  });
})();

// ─── VIDEO PREVIEW PLAYER ─────────────────────────────────────────────
(function initVideoPreview() {
  const PLAY_ICON = `<path d="M4 2.5L13 8L4 13.5V2.5Z" fill="currentColor"/>`;
  const PAUSE_ICON = `<path d="M4 2h3v12H4V2zm5 0h3v12H9V2z" fill="currentColor"/>`;

  document.querySelectorAll('.work-visual-video').forEach((container) => {
    const video = container.querySelector('.work-video');
    const overlay = container.querySelector('.work-video-overlay');
    const playBtn = container.querySelector('.work-play-btn');
    if (!video || !overlay || !playBtn) return;

    const iconEl = playBtn.querySelector('svg');
    const labelEl = playBtn.querySelector('span');

    // Lazily activate the real video src on first hover
    let activated = false;
    function activateVideo() {
      if (activated) return;
      activated = true;
      const source = video.querySelector('source');
      if (!source) return;

      // Only load if src looks like a real file (not a placeholder)
      const src = source.getAttribute('src') || '';
      if (src.startsWith('[') || src === '') return;

      video.load();
      video.addEventListener('canplay', () => {
        video.classList.add('is-loaded');
      }, { once: true });
    }

    container.addEventListener('mouseenter', activateVideo, { once: true });

    // Click to play / pause
    overlay.addEventListener('click', () => {
      activateVideo();

      if (video.paused) {
        video.play().then(() => {
          container.classList.add('is-playing');
          if (iconEl) iconEl.innerHTML = PAUSE_ICON;
          if (labelEl) labelEl.textContent = 'Pause';
        }).catch(() => {
          // Autoplay blocked — show overlay again
          container.classList.remove('is-playing');
        });
      } else {
        video.pause();
        container.classList.remove('is-playing');
        if (iconEl) iconEl.innerHTML = PLAY_ICON;
        if (labelEl) labelEl.textContent = 'Preview';
      }
    });

    // Reset state when video ends (loop is on, but just in case)
    video.addEventListener('ended', () => {
      container.classList.remove('is-playing');
      if (iconEl) iconEl.innerHTML = PLAY_ICON;
      if (labelEl) labelEl.textContent = 'Preview';
    });
  });
})();


// ─── NAV SCROLL BEHAVIOR ─────────────────────────────────────────────
(function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ─── ACTIVE NAV LINK (INTERSECTION OBSERVER) ─────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + id);
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
})();

// ─── MOBILE NAV TOGGLE ───────────────────────────────────────────────
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const open = () => {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  // Close on nav link click
  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', close);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      toggle.getAttribute('aria-expanded') === 'true' &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      close();
    }
  });
})();

// ─── SCROLL REVEAL ───────────────────────────────────────────────────
(function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  const targets = [
    '.section-header',
    '.work-item',
    '.about-bio',
    '.about-sidebar',
    '.skill-group',
    '.cert-item',
    '.timeline-item',
    '.contact-statement',
    '.contact-details',
  ];

  targets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('reveal');
      if (index > 0) {
        el.style.transitionDelay = `${Math.min(index * 60, 300)}ms`;
      }
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('visible'));
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
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.05,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

// ─── HERO ENTRANCE ───────────────────────────────────────────────────
(function initHeroEntrance() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  const eyebrow = document.querySelector('.hero-eyebrow');
  const headline = document.querySelector('.hero-headline');
  const meta = document.querySelector('.hero-meta');
  const actions = document.querySelector('.hero-actions');
  const decoration = document.querySelector('.hero-decoration');

  const els = [eyebrow, headline, meta, actions, decoration].filter(Boolean);
  const delays = [0, 80, 200, 320, 420];

  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity 500ms cubic-bezier(0,0,0.2,1) ${delays[i]}ms, transform 500ms cubic-bezier(0,0,0.2,1) ${delays[i]}ms`;

    // Trigger on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
})();

// ─── ADD REVEAL CLASS TO SECTION CHILDREN ────────────────────────────
// ─── SMOOTH SCROLL POLYFILL ───────────────────────────────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.querySelector('.site-header')?.offsetHeight || 64;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


// ─── CERT MODAL ──────────────────────────────────────────────────────
(function initCertModal() {
  const modal      = document.getElementById('cert-modal');
  const modalBody  = document.getElementById('cert-modal-body');
  const modalTitle = document.getElementById('cert-modal-title');
  const modalIssuer= document.getElementById('cert-modal-issuer');
  const openBtn    = document.getElementById('cert-modal-open');
  const downloadBtn= document.getElementById('cert-modal-download');
  const closeBtn   = document.getElementById('cert-modal-close');
  if (!modal) return;

  const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  // ── Init: mark buttons with no file as "Soon" ──────────────────────
  document.querySelectorAll('button.cert-link').forEach((btn) => {
    const file = btn.getAttribute('data-cert-file');
    if (!file) {
      btn.textContent = 'Soon';
      btn.setAttribute('data-cert-pending', '');
      btn.disabled = true;
    }
  });

  // ── Open modal ─────────────────────────────────────────────────────
  function openModal(file, title, issuer) {
    // Populate header
    modalTitle.textContent  = title  || 'Certificate';
    modalIssuer.textContent = issuer || '';

    // Set download link
    openBtn.href = file;
    downloadBtn.href = file;
    downloadBtn.setAttribute('download', file.split('/').pop());

    // Show loading spinner
    modalBody.innerHTML = `
      <div class="cert-modal-loading" aria-live="polite">
        <div class="cert-modal-spinner"></div>
        <span>Loading&hellip;</span>
      </div>`;

    // Reveal modal
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    // Determine render type
    const ext = file.split('.').pop().toLowerCase();
    if (IMAGE_EXTS.includes(ext)) {
      // Image preview
      const img = document.createElement('img');
      img.alt = title;
      img.onload = () => { modalBody.innerHTML = ''; modalBody.appendChild(img); };
      img.onerror = () => showError();
      img.src = file;
    } else {
      // PDF (or unknown) — iframe
      const iframe = document.createElement('iframe');
      iframe.title = title;
      iframe.setAttribute('loading', 'lazy');
      iframe.onload = () => {
        // Remove spinner once iframe reports load
        const spinner = modalBody.querySelector('.cert-modal-loading');
        if (spinner) spinner.remove();
      };
      iframe.src = `${file}#view=FitH&toolbar=1&navpanes=0`;
      modalBody.innerHTML = '';
      // Keep spinner visible behind iframe until load
      const spinner = document.createElement('div');
      spinner.className = 'cert-modal-loading';
      spinner.innerHTML = '<div class="cert-modal-spinner"></div><span>Loading&hellip;</span>';
      modalBody.appendChild(spinner);
      modalBody.appendChild(iframe);
    }
  }

  function showError() {
    modalBody.innerHTML = `
      <div class="cert-modal-loading">
        <span style="color:var(--c-ink-2)">Could not load file.<br/>Try downloading it directly.</span>
      </div>`;
  }

  // ── Close modal ────────────────────────────────────────────────────
  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
  }

  // ── Event listeners ────────────────────────────────────────────────
  // Open on cert button click
  document.querySelectorAll('button.cert-link:not([data-cert-pending])').forEach((btn) => {
    btn.addEventListener('click', () => {
      const file   = btn.getAttribute('data-cert-file');
      const title  = btn.getAttribute('data-cert-title');
      const issuer = btn.getAttribute('data-cert-issuer');
      openModal(file, title, issuer);
    });
  });

  // Close button
  closeBtn.addEventListener('click', closeModal);

  // Click outside card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
  });
})();


// ─── FEATURES ACCORDION ──────────────────────────────────────────────
(function initFeaturesAccordion() {
  document.querySelectorAll('.work-features-trigger').forEach((trigger) => {
    const bodyId = trigger.getAttribute('aria-controls');
    const body   = document.getElementById(bodyId);
    if (!body) return;

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        // Close
        trigger.setAttribute('aria-expanded', 'false');
        body.setAttribute('hidden', '');
      } else {
        // Open
        trigger.setAttribute('aria-expanded', 'true');
        body.removeAttribute('hidden');
      }
    });
  });
})();
