/**
 * Skeeme Landing Page — Interactive Logic, Scroll Animations & UI Controllers
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. SCROLL REVEAL — IntersectionObserver
  // ============================================================
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // ============================================================
  // 2. NAVBAR — Scroll shadow + shrink
  // ============================================================
  const navbar = document.getElementById('navbar');
  const headerWrapper = document.querySelector('.header-wrapper');

  const onScroll = () => {
    if (window.scrollY > 24) {
      navbar?.classList.add('scrolled');
      headerWrapper?.style.setProperty('top', '0.5rem');
    } else {
      navbar?.classList.remove('scrolled');
      headerWrapper?.style.removeProperty('top');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ============================================================
  // 3. MOBILE MENU TOGGLE
  // ============================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileToggle.textContent = isOpen ? '✕' : '☰';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.textContent = '☰';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar?.contains(e.target)) {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.textContent = '☰';
      }
    });
  }

  // ============================================================
  // 4. ACTIVE NAV LINK — Highlight based on scroll position
  // ============================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.classList.add('active-link');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => activeObserver.observe(s));

  // ============================================================
  // 5. INTERACTIVE SOLVER DEMO TABS
  // ============================================================
  const demoData = {
    math: {
      tag: 'Calculus • Derivatives',
      question: 'Find the derivative of f(x) = x³ · ln(x) + 4x - 7 and determine critical points for x > 0.',
      steps: [
        { num: '1', text: '<strong>Apply Product Rule:</strong> For u(x) = x³ and v(x) = ln(x), f\'(x) = (3x² · ln(x)) + (x³ · 1/x) + 4' },
        { num: '2', text: '<strong>Simplify Algebraic Terms:</strong> f\'(x) = 3x² · ln(x) + x² + 4 = x²(3 ln(x) + 1) + 4' },
        { num: '3', text: '<strong>Identify Critical Points:</strong> Set f\'(x) = 0. Since x² ≥ 0 and 4 > 0, the function is strictly increasing for all positive real x.' }
      ]
    },
    bio: {
      tag: 'Biology • Molecular Genetics',
      question: 'Explain the role of DNA Helicase and Topoisomerase (Gyrase) during DNA replication forks.',
      steps: [
        { num: '1', text: '<strong>Unwinding Double Helix:</strong> DNA Helicase breaks hydrogen bonds between nucleotide base pairs at the replication fork.' },
        { num: '2', text: '<strong>Relieving Supercoiling:</strong> Topoisomerase cuts and rejoins DNA strands upstream to release torsional strain caused by unwinding.' },
        { num: '3', text: '<strong>Stabilization:</strong> Single-strand binding proteins (SSBs) prevent immediate reannealing of single template strands.' }
      ]
    },
    physics: {
      tag: 'Physics • Classical Mechanics',
      question: 'A 2.5 kg projectile is launched at 30° with an initial velocity of 40 m/s. Calculate maximum height (g = 9.8 m/s²).',
      steps: [
        { num: '1', text: '<strong>Find Vertical Component:</strong> v_0y = v_0 · sin(30°) = 40 · 0.5 = 20.0 m/s' },
        { num: '2', text: '<strong>Apply Kinematic Formula:</strong> At peak height v_y = 0. Using v_y² = v_0y² - 2g·h' },
        { num: '3', text: '<strong>Solve for Height:</strong> h_max = (20)² / (2 · 9.8) = 400 / 19.6 ≈ <strong>20.41 meters</strong>' }
      ]
    }
  };

  const demoTabBtns = document.querySelectorAll('.demo-tab-btn');
  const demoTag = document.getElementById('demoTag');
  const demoQuestion = document.getElementById('demoQuestion');
  const demoStepsContainer = document.getElementById('demoSteps');

  function renderDemo(subject) {
    const data = demoData[subject];
    if (!data || !demoTag || !demoQuestion || !demoStepsContainer) return;

    demoTag.textContent = data.tag;
    demoQuestion.textContent = data.question;

    demoStepsContainer.style.opacity = '0';
    demoStepsContainer.style.transform = 'translateY(12px)';

    setTimeout(() => {
      demoStepsContainer.innerHTML = '';
      data.steps.forEach((step, i) => {
        const el = document.createElement('div');
        el.className = 'step-box';
        el.style.transitionDelay = `${i * 0.08}s`;
        el.innerHTML = `<div class="step-num">${step.num}</div><div class="step-desc">${step.text}</div>`;
        demoStepsContainer.appendChild(el);
      });
      requestAnimationFrame(() => {
        demoStepsContainer.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        demoStepsContainer.style.opacity = '1';
        demoStepsContainer.style.transform = 'none';
      });
    }, 180);
  }

  demoTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      demoTabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderDemo(btn.getAttribute('data-subject') || 'math');
    });
  });

  // ============================================================
  // 6. FAQ ACCORDION
  // ============================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach((other) => other.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // ============================================================
  // 7. STAT COUNTER ANIMATION
  // ============================================================
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
          const current = target * ease;
          el.innerHTML = `${prefix}${target % 1 === 0 ? Math.round(current) : current.toFixed(1)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  statNumbers.forEach((el) => counterObserver.observe(el));

});
