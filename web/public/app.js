/**
 * Skeeme Landing Page - Interactive Logic & UI Controllers
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 24) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Interactive Solver Demo Tabs
  const demoData = {
    math: {
      tag: 'Calculus • Derivatives',
      question: 'Find the derivative of f(x) = x³ · ln(x) + 4x - 7 and determine critical points for x > 0.',
      steps: [
        {
          num: '1',
          text: '<strong>Apply Product Rule:</strong> For u(x) = x³ and v(x) = ln(x), f\'(x) = (3x² · ln(x)) + (x³ · 1/x) + 4'
        },
        {
          num: '2',
          text: '<strong>Simplify Algebraic Terms:</strong> f\'(x) = 3x² · ln(x) + x² + 4 = x²(3 ln(x) + 1) + 4'
        },
        {
          num: '3',
          text: '<strong>Identify Critical Points:</strong> Set f\'(x) = 0. Since x² ≥ 0 and 4 > 0, the function is strictly increasing for all positive real x.'
        }
      ]
    },
    bio: {
      tag: 'Biology • Molecular Genetics',
      question: 'Explain the role of DNA Helicase and Topoisomerase (Gyrase) during DNA replication forks.',
      steps: [
        {
          num: '1',
          text: '<strong>Unwinding Double Helix:</strong> DNA Helicase breaks hydrogen bonds between nucleotide base pairs at the replication fork.'
        },
        {
          num: '2',
          text: '<strong>Relieving Supercoiling:</strong> Topoisomerase cuts and rejoins DNA strands upstream to release torsional strain caused by unwinding.'
        },
        {
          num: '3',
          text: '<strong>Stabilization:</strong> Single-strand binding proteins (SSBs) prevent immediate reannealing of single template strands.'
        }
      ]
    },
    physics: {
      tag: 'Physics • Classical Mechanics',
      question: 'A 2.5 kg projectile is launched at 30° with an initial velocity of 40 m/s. Calculate maximum height (g = 9.8 m/s²).',
      steps: [
        {
          num: '1',
          text: '<strong>Find Vertical Component:</strong> v_0y = v_0 · sin(30°) = 40 · 0.5 = 20.0 m/s'
        },
        {
          num: '2',
          text: '<strong>Apply Kinematic Formula:</strong> At peak height v_y = 0. Using v_y² = v_0y² - 2g·h'
        },
        {
          num: '3',
          text: '<strong>Solve for Height:</strong> h_max = (20)² / (2 · 9.8) = 400 / 19.6 ≈ <strong>20.41 meters</strong>'
        }
      ]
    }
  };

  const demoTabBtns = document.querySelectorAll('.demo-tab-btn');
  const demoTag = document.getElementById('demoTag');
  const demoQuestion = document.getElementById('demoQuestion');
  const demoStepsContainer = document.getElementById('demoSteps');

  demoTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      demoTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const subject = btn.getAttribute('data-subject') || 'math';
      const data = demoData[subject];

      if (data && demoTag && demoQuestion && demoStepsContainer) {
        demoTag.textContent = data.tag;
        demoQuestion.textContent = data.question;

        // Rebuild steps with subtle fade
        demoStepsContainer.innerHTML = '';
        data.steps.forEach(step => {
          const stepEl = document.createElement('div');
          stepEl.className = 'step-box';
          stepEl.innerHTML = `
            <div class="step-num">${step.num}</div>
            <div class="step-desc">${step.text}</div>
          `;
          demoStepsContainer.appendChild(stepEl);
        });
      }
    });
  });

  // 4. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all others
      faqItems.forEach(other => other.classList.remove('active'));

      // Toggle clicked
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
});
