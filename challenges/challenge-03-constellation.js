const SEQUENCES = {
  normal: [7, 4, 1, 2, 3, 5, 9],
  challenging: [4, 5, 3, 9, 7, 4, 2, 1],
  nightmare: [9, 5, 4, 3, 7, 2, 1, 7, 5, 3],
};

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export default function constellation({ app, $, $$, frame, feedback, award, tag, difficulty }) {
  const sequence = SEQUENCES[difficulty] ?? SEQUENCES.normal;
  let round = 1;
  let position = 0;
  let showing = false;
  let token = 0;
  let finished = false;

  app.innerHTML = frame(3, `
    <p class="lead center">
      The stars are trying to tell you something. Watch their pattern, then tap the
      stars in the same order. Each round adds one more star.
    </p>
    <div class="starboard" id="starboard">
      <svg class="star-lines" id="star-lines" viewBox="0 0 300 300" aria-hidden="true"></svg>
      ${Array.from({ length: 9 }, (_, index) => `
        <button class="star-btn" data-star="${index + 1}" aria-label="Star ${index + 1}" disabled>
          ★
        </button>
      `).join('')}
    </div>
    <div class="center muted" id="round-label">Round 1 of ${sequence.length}</div>
    <div class="button-row"><button class="btn" id="start-round">Show pattern</button></div>
    <div class="button-row"><button class="btn hidden" id="collect-letter">Collect letter</button></div>
    <div class="feedback center" id="feedback" aria-live="polite"></div>
  `);

  const stars = $$('.star-btn');
  const startButton = $('#start-round');
  const collectButton = $('#collect-letter');

  async function showPattern() {
    if (showing || finished) return;

    showing = true;
    position = 0;
    const activeToken = ++token;
    startButton.disabled = true;
    stars.forEach(star => { star.disabled = true; });
    feedback('Watch carefully…');
    await sleep(400);

    for (const number of sequence.slice(0, round)) {
      if (activeToken !== token || tag() !== 3) return;
      const star = stars[number - 1];
      star.classList.add('lit');
      await sleep(470);
      star.classList.remove('lit');
      await sleep(230);
    }

    if (activeToken !== token || tag() !== 3) return;
    showing = false;
    stars.forEach(star => { star.disabled = false; });
    feedback('Your turn!');
  }

  function finish() {
    finished = true;
    stars.forEach(star => { star.disabled = true; });
    startButton.disabled = true;
    $('#round-label').textContent = 'The constellation is complete!';
    feedback('The stars reveal a letter…', true);

    const coordinates = number => [
      50 + ((number - 1) % 3) * 100,
      50 + Math.floor((number - 1) / 3) * 100,
    ];
    // The completion constellation is always the canonical normal pattern,
    // regardless of which difficulty was played.
    const completionSequence = SEQUENCES.normal;
    const lines = completionSequence.slice(1).map((number, index) => {
      const start = coordinates(completionSequence[index]);
      const end = coordinates(number);
      return `<path class="constellation-line" style="--line-delay:${index * 280}ms" d="M${start.join(' ')} L${end.join(' ')}" stroke="#f7d88c" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }).join('');

    $('#star-lines').innerHTML = `
      ${lines}
      <path class="constellation-line" style="--line-delay:${(completionSequence.length - 1) * 280}ms" d="M${coordinates(4).join(' ')} L${coordinates(5).join(' ')}" stroke="#f7d88c" stroke-width="5" fill="none"/>
    `;

    const animationDuration = (completionSequence.length - 1) * 280 + 500;
    setTimeout(() => {
      if (tag() === 3) collectButton.classList.remove('hidden');
    }, animationDuration);
  }

  stars.forEach(star => {
    star.addEventListener('click', () => {
      if (showing || finished) return;

      const number = Number(star.dataset.star);
      star.classList.add('lit');
      setTimeout(() => star.classList.remove('lit'), 190);

      if (number !== sequence[position]) {
        stars.forEach(item => { item.disabled = true; });
        feedback('The stars flicker. Try this round again!');
        startButton.disabled = false;
        startButton.textContent = 'Try again';
        position = 0;
        return;
      }

      position += 1;
      if (position !== round) return;
      stars.forEach(item => { item.disabled = true; });

      if (round === sequence.length) {
        finish();
      } else {
        round += 1;
        $('#round-label').textContent = `Round ${round} of ${sequence.length}`;
        // Continue straight into the next pattern after a correct round.
        showPattern();
      }
    });
  });

  collectButton.addEventListener('click', () => {
    if (tag() === 3) award(3);
  });

  startButton.addEventListener('click', showPattern);
}
