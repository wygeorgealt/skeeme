document.documentElement.classList.add('js');

const menuToggle = document.getElementById('menu-toggle');
const primaryNav = document.getElementById('primary-nav');

function setMenuOpen(isOpen) {
  if (!menuToggle || !primaryNav) return;

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  primaryNav.classList.toggle('is-open', isOpen);
}

menuToggle?.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

primaryNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

const exampleSteps = document.getElementById('example-steps');
const exampleButtons = [...document.querySelectorAll('.example-step')];
const exampleLabel = document.getElementById('example-label');
const exampleTitle = document.getElementById('example-stage-title');
const exampleText = document.getElementById('example-text');
const answerToggle = document.getElementById('answer-toggle');
const exampleAnswer = document.getElementById('example-answer');

const studyStages = {
  note: {
    label: 'Your class note',
    title: 'Photosynthesis',
    text: 'Plants use light energy to turn water and carbon dioxide into glucose and oxygen.',
  },
  explain: {
    label: 'A clearer explanation',
    title: 'Where does the energy go?',
    text: 'Chlorophyll captures light. The plant uses that energy to make glucose from water and carbon dioxide, releasing oxygen.',
  },
  practice: {
    label: 'A quick recall question',
    title: 'Try it without looking.',
    text: 'Which two substances does a plant use to make glucose during photosynthesis?',
  },
};

function showStudyStage(stage, activeIndex) {
  const content = studyStages[stage];
  if (!content || !exampleLabel || !exampleTitle || !exampleText || !exampleSteps) return;

  exampleLabel.textContent = content.label;
  exampleTitle.textContent = content.title;
  exampleText.textContent = content.text;
  exampleSteps.style.setProperty('--step-index', String(activeIndex));

  if (answerToggle && exampleAnswer) {
    const showAnswer = stage === 'practice';
    answerToggle.hidden = !showAnswer;
    answerToggle.setAttribute('aria-expanded', 'false');
    answerToggle.textContent = 'Reveal one possible answer';
    exampleAnswer.hidden = true;
  }
}

exampleButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    exampleButtons.forEach((step) => step.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', 'true');
    showStudyStage(button.dataset.step, index);
  });
});

if (exampleSteps && exampleButtons.length) {
  exampleSteps.hidden = false;
}

answerToggle?.addEventListener('click', () => {
  if (!exampleAnswer) return;

  const isExpanded = answerToggle.getAttribute('aria-expanded') !== 'true';
  answerToggle.setAttribute('aria-expanded', String(isExpanded));
  answerToggle.textContent = isExpanded ? 'Hide answer' : 'Reveal one possible answer';
  exampleAnswer.hidden = !isExpanded;
});
