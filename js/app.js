'use strict';

import { MASTER_TAG_TOKEN, STORAGE_KEY, TAG_TOKENS } from './config.js';
import { CHALLENGES, challengeRenderers } from './challenges.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const DIFFICULTIES = ['normal', 'challenging', 'nightmare'];

let state;
try {
  state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
} catch {
  state = {};
}

if (!Array.isArray(state.solved)) {
  state.solved = [];
}

if (!Array.isArray(state.unlocked)) {
  state.unlocked = [...state.solved];
} else {
  state.unlocked = [...new Set([...state.unlocked, ...state.solved])];
}

if (!DIFFICULTIES.includes(state.difficulty)) {
  state.difficulty = null;
}

const app = $('#app');
const difficultyButton = $('#difficulty-button');
const difficultyDialog = $('#difficulty-dialog');
const difficultyClose = $('#difficulty-close');
let retryingChallenge = null;

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Progress remains available for the current page if storage is unavailable.
  }
}

function difficultyLabel(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Choose';
}

function syncDifficultyControls() {
  difficultyButton.textContent = `Difficulty: ${difficultyLabel(state.difficulty)}`;
  difficultyClose.hidden = !state.difficulty;

  $$('.difficulty-option', difficultyDialog).forEach(option => {
    const isSelected = option.dataset.difficulty === state.difficulty;
    option.classList.toggle('selected', isSelected);
    option.setAttribute('aria-pressed', String(isSelected));
  });
}

function openDifficultyDialog() {
  syncDifficultyControls();
  if (!difficultyDialog.open) difficultyDialog.showModal();
}

function setDifficulty(value) {
  if (!DIFFICULTIES.includes(value)) return;

  state.difficulty = value;
  save();
  syncDifficultyControls();
  difficultyDialog.close();
  render();
}

function routeNumber(parameter) {
  const value = Number(new URLSearchParams(location.search).get(parameter));
  return value >= 1 && value <= CHALLENGES.length ? value : null;
}

function currentChallenge() {
  return routeNumber('challenge');
}

function solved(number) {
  return state.solved.includes(number);
}

function unlocked(number) {
  return state.unlocked.includes(number);
}

function unlock(number) {
  if (unlocked(number)) return;

  state.unlocked.push(number);
  save();
}

function resolveRoute() {
  const scannedToken = new URLSearchParams(location.search).get('tag');

  if (scannedToken === MASTER_TAG_TOKEN) {
    state.unlocked = CHALLENGES.map((_, index) => index + 1);
    save();
    history.replaceState({}, '', location.pathname);
    return null;
  }

  const scannedTagIndex = TAG_TOKENS.indexOf(scannedToken);
  const scannedChallenge = scannedTagIndex >= 0 ? scannedTagIndex + 1 : null;

  if (scannedChallenge) {
    unlock(scannedChallenge);
    history.replaceState(
      {},
      '',
      `?challenge=${String(scannedChallenge).padStart(2, '0')}`,
    );
    return scannedChallenge;
  }

  return currentChallenge();
}

function feedback(message, good = false) {
  const element = $('#feedback');
  if (!element) return;

  element.textContent = message;
  element.classList.toggle('good', good);
}

function nav(number) {
  return `
    <nav class="game-nav">
      <a href="./" id="go-home">← All challenges</a>
      <span class="counter">
        CHALLENGE ${String(number).padStart(2, '0')} / ${CHALLENGES.length}
      </span>
    </nav>
  `;
}

function frame(number, content) {
  const [name, emoji] = CHALLENGES[number - 1];
  return `
    ${nav(number)}
    <div class="eyebrow">✦ Find the hidden charm ✦</div>
    <h1>${emoji} ${name}</h1>
    <section class="panel">${content}</section>
  `;
}

function setChallenge(number) {
  retryingChallenge = null;

  const url = number
    ? `?challenge=${String(number).padStart(2, '0')}`
    : location.pathname;

  history.pushState({}, '', url);
  render();
}

function award(number) {
  retryingChallenge = null;
  unlock(number);

  if (!solved(number)) {
    state.solved.push(number);
    save();
  }

  render();
}

function answerBox(number, prompt, answer, options = {}) {
  const normalizeAnswer = value => String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const acceptedAnswers = (Array.isArray(answer) ? answer : [answer])
    .map(normalizeAnswer);

  const inputType = options.numeric
    ? 'type="number" inputmode="numeric"'
    : 'type="text"';

  app.innerHTML = frame(number, `
    <div class="prompt">${prompt}</div>
    <form id="answer-form" class="input-row">
      <input
        id="answer"
        aria-label="Your answer"
        autocomplete="off"
        ${inputType}
        placeholder="Your answer"
        required
      >
      <button class="btn" type="submit">Check answer</button>
    </form>
    <div class="feedback" id="feedback" aria-live="polite"></div>
  `);

  $('#answer-form').addEventListener('submit', event => {
    event.preventDefault();

    const normalized = normalizeAnswer($('#answer').value);

    const isCorrect = options.contains
      ? acceptedAnswers.some(expected => normalized.includes(expected))
      : acceptedAnswers.includes(normalized);

    if (isCorrect) {
      award(number);
    } else {
      feedback('Not quite! Give it another try.');
    }
  });
}

function complete(number) {
  return `
    <div class="complete">
      <div class="eyebrow">Charm discovered</div>
      <h2>Wonderful work!</h2>
      <div class="letter">${CHALLENGES[number - 1][2]}</div>
      <p>You've earned another letter for the final mystery.</p>
      <div class="button-row">
        <button class="btn secondary" id="retry-challenge">Retry challenge</button>
        <button class="btn" id="back-home">See all challenges</button>
      </div>
    </div>
  `;
}

function wireHome() {
  const allChallenges = $('#go-home');
  const backHome = $('#back-home');
  const retryChallenge = $('#retry-challenge');

  if (allChallenges) {
    allChallenges.addEventListener('click', event => {
      event.preventDefault();
      setChallenge(null);
    });
  }

  if (backHome) {
    backHome.addEventListener('click', () => setChallenge(null));
  }

  if (retryChallenge) {
    retryChallenge.addEventListener('click', () => {
      retryingChallenge = currentChallenge();
      render();
    });
  }
}

function home() {
  const challengeCards = CHALLENGES.map(([name, emoji], index) => {
    const number = index + 1;
    const isSolved = solved(number);
    const isUnlocked = unlocked(number);

    if (!isUnlocked) {
      return `
        <div class="challenge-card locked" aria-disabled="true">
          <span class="symbol" aria-hidden="true">🔒</span>
          <strong>Mystery challenge</strong>
          <small>Challenge ${String(number).padStart(2, '0')}</small>
          <span class="state">Locked - find the tag</span>
        </div>
      `;
    }

    return `
      <a
        class="challenge-card ${isSolved ? 'solved' : ''}"
        href="?challenge=${String(number).padStart(2, '0')}"
        data-challenge="${number}"
      >
        <span class="symbol">${emoji}</span>
        <strong>${name}</strong>
        <small>Challenge ${String(number).padStart(2, '0')}</small>
        <span class="state">${isSolved ? '✓ Charm found' : 'Explore →'}</span>
      </a>
    `;
  }).join('');

  const solvedLetters = state.solved
    .slice()
    .sort((a, b) => a - b)
    .map(number => ({ number, letter: CHALLENGES[number - 1][2] }));

  const collectedLetters = solvedLetters
    .map(({ number, letter }) => `<div class="letter-tile" draggable="true" data-letter="${letter}" data-number="${number}">${letter}</div>`)
    .join('');

  const finalChallenge = state.solved.length === CHALLENGES.length
    ? `
      <div class="center">
        <p>Drag the letters into order, or switch to click mode.</p>
        <button class="btn secondary" id="toggle-letter-mode" type="button">Use click mode</button>
        <div class="letter-slots hidden" id="letter-slots">${solvedLetters.map(() => '<button class="letter-slot" type="button"></button>').join('')}</div>
        <form id="final-form" class="input-row">
          <input
            class="field final-input"
            id="final-answer"
            aria-label="Final phrase"
            placeholder="The secret phrase"
            required
          >
          <button class="btn">Unlock</button>
        </form>
        <div class="feedback" id="feedback"></div>
      </div>
    `
    : '<p class="tiny center">Collect all twelve letters to unlock the final mystery.</p>';

  app.innerHTML = `
    <section class="panel intro center">
      <div class="eyebrow">A Halloween scavenger hunt</div>
      <div class="ornament">🌙 🦇 🎃</div>
      <h1>Welcome, Brave Wanderer!</h1>
      <p class="lead">
        Twelve mysterious challenges are hidden around the grounds. Scan a tag,
        solve its puzzle, and collect a letter. Can you uncover the final phrase?
      </p>
      <div class="button-row">
        <a class="btn" href="#challenges">Explore the challenges ↓</a>
      </div>
    </section>

    <h2 class="section-title" id="challenges">The Twelve Charms</h2>
    <div class="grid">${challengeCards}</div>

    <section class="panel soft collected-panel">
      <h2>Collected letters</h2>
      <p class="muted">Your discoveries stay saved in this browser.</p>
      <div class="letters">
        ${collectedLetters || '<span class="muted">No letters yet. Your adventure awaits!</span>'}
      </div>
      ${finalChallenge}
    </section>

  `;

  $$('[data-challenge]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      setChallenge(Number(link.dataset.challenge));
    });
  });

  // Keep the collected-letter rack rearrangeable as letters are earned.
  $$('.letter-tile').forEach(tile => {
    tile.addEventListener('pointerdown', event => {
      event.preventDefault();
      const rack = tile.parentNode;
      const bounds = tile.getBoundingClientRect();
      const placeholder = document.createElement('div');
      placeholder.className = 'letter-tile-placeholder';
      placeholder.style.width = `${bounds.width}px`;
      placeholder.style.height = `${bounds.height}px`;
      tile.replaceWith(placeholder);
      document.body.append(tile);
      tile.classList.add('dragging');
      tile.style.left = `${bounds.left}px`;
      tile.style.top = `${bounds.top}px`;
      tile.style.width = `${bounds.width}px`;
      tile.style.height = `${bounds.height}px`;
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;
      const move = moveEvent => {
        if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 6) moved = true;
        tile.style.left = `${moveEvent.clientX - bounds.width / 2}px`;
        tile.style.top = `${moveEvent.clientY - bounds.height / 2}px`;
        const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('.letter-tile');
        if (target && target !== tile && target.parentNode === rack) {
          rack.insertBefore(placeholder, target);
        } else {
          const tiles = [...rack.querySelectorAll('.letter-tile')];
          const last = tiles[tiles.length - 1];
          if (last && moveEvent.clientX > last.getBoundingClientRect().right) rack.append(placeholder);
        }
      };
      const end = endEvent => {
        window.removeEventListener('pointermove', move);
        tile.classList.remove('dragging');
        tile.style = '';
        placeholder.replaceWith(tile);
        if (!moved) return;
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end, { once: true });
    });
  });

  const finalForm = $('#final-form');
  if (finalForm) {
    let dragMode = true;
    const slots = $$('.letter-slot');
    const showVictory = phrase => {
      if (phrase === 'TRICKORTREAT') {
        app.innerHTML = '<section class="panel center"><div class="ornament">🎃</div><h1>Trick or Treat!</h1><p class="lead">You solved the final mystery!</p></section>';
      }
    };

    const resetFinalAnswer = () => {
      $('#final-answer').value = '';
      slots.forEach(slot => {
        slot.textContent = '';
        delete slot.dataset.number;
      });
      $$('.letter-tile').forEach(tile => tile.classList.remove('hidden'));
    };

    $$('.letter-tile').forEach(tile => tile.addEventListener('click', () => {
      if (dragMode) return;
      const slot = slots.find(item => !item.textContent);
      if (slot) {
        slot.textContent = tile.textContent;
        slot.dataset.number = tile.dataset.number;
        tile.classList.add('hidden');
      }
      if (slots.map(item => item.textContent).join('') === 'TRICKORTREAT') showVictory('TRICKORTREAT');
    }));

    slots.forEach(slot => slot.addEventListener('click', () => {
      if (dragMode) return;
      const tile = $(`[data-number="${slot.dataset.number}"]`);
      slot.textContent = '';
      delete slot.dataset.number;
      if (tile) {
        tile.classList.remove('hidden');
        tile.parentNode.append(tile);
      }
    }));

    $('#toggle-letter-mode').addEventListener('click', () => {
      resetFinalAnswer();
      dragMode = !dragMode;
      $('#letter-slots').classList.toggle('hidden', dragMode);
      $('#toggle-letter-mode').textContent = dragMode ? 'Use click mode' : 'Use drag mode';
    });

    $$('.letter-tile').forEach(tile => {
      tile.addEventListener('pointerdown', event => {
        if (!dragMode) return;
        event.preventDefault();
        const rack = tile.parentNode;
        const startX = event.clientX;
        const startY = event.clientY;
        let moved = false;
        const move = moveEvent => {
          if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 6) moved = true;
        };
        const end = endEvent => {
          window.removeEventListener('pointermove', move);
          if (!moved) return;
          const target = document.elementFromPoint(endEvent.clientX, endEvent.clientY)?.closest('.letter-tile');
          if (target && target !== tile && target.parentNode === rack) {
            rack.insertBefore(tile, target);
          }
          showVictory($$('.letter-tile').map(item => item.textContent).join(''));
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end, { once: true });
      });
      tile.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', tile.dataset.number));
      tile.addEventListener('dragover', event => event.preventDefault());
      tile.addEventListener('drop', event => {
        event.preventDefault();
        const source = $(`[data-number="${event.dataTransfer.getData('text/plain')}"]`);
        if (source && source !== tile) tile.parentNode.insertBefore(source, tile);
        showVictory($$('.letter-tile').map(item => item.textContent).join(''));
      });
    });

    finalForm.addEventListener('submit', event => {
      event.preventDefault();
      const value = $('#final-answer').value.toUpperCase().replace(/[^A-Z]/g, '');
      const isCorrect = value === 'TRICKORTREAT';

      if (isCorrect) {
        app.innerHTML = '<section class="panel center"><div class="ornament">🎃</div><h1>Trick or Treat!</h1><p class="lead">You solved the final mystery!</p></section>';
        return;
      }

      feedback(
        'Not quite. Try rearranging your letters.',
        false,
      );
    });
  }
}

function render() {
  window.scrollTo(0, 0);

  const number = resolveRoute();
  if (retryingChallenge !== number) retryingChallenge = null;
  $('#progress-label').textContent = `${state.solved.length} / ${CHALLENGES.length} charms`;

  if (!number) {
    home();
    return;
  }

  if (!unlocked(number)) {
    app.innerHTML = `
      ${nav(number)}
      <section class="panel center locked-message">
        <div class="ornament" aria-hidden="true">🔒</div>
        <div class="eyebrow">Challenge locked</div>
        <h1>Find the hidden tag</h1>
        <p class="lead">
          Scan this challenge’s NFC tag or QR code before opening its challenge link.
        </p>
      </section>
    `;
    wireHome();
    return;
  }

  if (solved(number) && retryingChallenge !== number) {
    app.innerHTML = nav(number) + complete(number);
    wireHome();
    return;
  }

  challengeRenderers[number - 1]({
    app,
    $,
    $$,
    frame,
    feedback,
    award,
    answerBox,
    tag: currentChallenge,
    difficulty: state.difficulty,
  });
  wireHome();
}

window.addEventListener('popstate', render);

difficultyButton.addEventListener('click', openDifficultyDialog);
difficultyClose.addEventListener('click', () => difficultyDialog.close());
difficultyDialog.addEventListener('cancel', event => {
  if (!state.difficulty) event.preventDefault();
});

$$('.difficulty-option', difficultyDialog).forEach(option => {
  option.addEventListener('click', () => setDifficulty(option.dataset.difficulty));
});

$('#home-link').addEventListener('click', event => {
  event.preventDefault();
  setChallenge(null);
});

render();
syncDifficultyControls();

if (!state.difficulty) {
  openDifficultyDialog();
}
