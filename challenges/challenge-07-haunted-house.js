const GHOST_EVENTS = [
  { at: 450, window: 0, duration: 850 },
  { at: 1150, window: 3, duration: 850 },
  { at: 1580, window: 5, duration: 780 },
  { at: 2350, window: 4, duration: 850 },
  { at: 2920, window: 2, duration: 850 },
  { at: 3470, window: 0, duration: 850 },
  { at: 4160, window: 3, duration: 850 },
  { at: 4770, window: 1, duration: 850 },
  { at: 5320, window: 5, duration: 850 },
  { at: 6150, window: 2, duration: 850 },
  { at: 6750, window: 4, duration: 850 },
  { at: 7440, window: 0, duration: 850 },
  { at: 8150, window: 3, duration: 850 },
  { at: 8820, window: 5, duration: 800 },
];

const VAMPIRE_EVENTS = [
  { at: 850, window: 1, duration: 650 },
  { at: 5700, window: 4, duration: 650 },
];

const BAT_DURATION = 2000;

// Edit these values to tune each haunted-house difficulty.
const HOUSE_DIFFICULTIES = {
  // Times are milliseconds. Add, remove, or move events to change appearances.
  
normal: {
  duration: 10000,
  answer: 8,
  ghosts: [
    { at: 400, window: 1, duration: 1400 },
    { at: 1600, window: 4, duration: 1400 },

    // Gentle overlap
    { at: 2800, window: 0, duration: 1500 },
    { at: 3600, window: 5, duration: 1400 },

    { at: 4800, window: 2, duration: 1300 },
    { at: 6000, window: 3, duration: 1400 },

    { at: 7300, window: 4, duration: 1300 },
    { at: 8500, window: 1, duration: 1200 },
  ],
  vampires: [
    { at: 5400, window: 5, duration: 1200 },
  ],
  lightning: { at: 6900, duration: 700 },
  bats: [
    { at: 4200, direction: 'right' },
  ],
},

  challenging: {
    duration: 10000,
    answer: 14,
    ghosts: [
        { at: 450, window: 0, duration: 850 },
        { at: 1150, window: 3, duration: 850 },
        { at: 1580, window: 5, duration: 780 },
        { at: 2350, window: 4, duration: 850 },
        { at: 2920, window: 2, duration: 850 },
        { at: 3470, window: 0, duration: 850 },
        { at: 4160, window: 3, duration: 850 },
        { at: 4770, window: 1, duration: 850 },
        { at: 5320, window: 5, duration: 850 },
        { at: 6150, window: 2, duration: 850 },
        { at: 6750, window: 4, duration: 850 },
        { at: 7440, window: 0, duration: 850 },
        { at: 8150, window: 3, duration: 850 },
        { at: 8820, window: 5, duration: 800 },
      ],
    vampires: [
      { at: 850, window: 1, duration: 650 },
      { at: 5700, window: 4, duration: 650 }
    ],
    lightning: { at: 4000, duration: 900 },
    bats: [{ at: 2200, direction: 'left' }, { at: 5600, direction: 'right' }],
  },
  

nightmare: {
  duration: 10000,
  answer: 20,
  ghosts: [
    // Deceptively calm opening
    { at: 350, window: 2, duration: 950 },
    { at: 1050, window: 5, duration: 900 },

    // First burst: three different windows
    { at: 1650, window: 0, duration: 1000 },
    { at: 1770, window: 3, duration: 950 },
    { at: 1980, window: 1, duration: 850 },

    // Brief pause, then a double appearance
    { at: 2850, window: 3, duration: 900 },
    { at: 3010, window: 2, duration: 900 },

    // Rapid sequence with vampire distraction
    { at: 3700, window: 5, duration: 850 },
    { at: 3860, window: 0, duration: 900 },
    { at: 4200, window: 3, duration: 800 },

    // Second burst, under lightning
    { at: 4950, window: 1, duration: 950 },
    { at: 5070, window: 4, duration: 850 },
    { at: 5240, window: 2, duration: 850 },

    // Uneven pacing, crossing bat flight
    { at: 6100, window: 0, duration: 900 },
    { at: 6290, window: 5, duration: 850 },
    { at: 6720, window: 3, duration: 850 },

    // Final burst, then one last surprise
    { at: 7700, window: 2, duration: 900 },
    { at: 7880, window: 4, duration: 900 },
    { at: 8090, window: 1, duration: 850 },
    { at: 9050, window: 5, duration: 850 },
  ],
  vampires: [
    { at: 2150, window: 4, duration: 900 },
    { at: 4050, window: 2, duration: 850 },
    { at: 7950, window: 0, duration: 850 },
  ],
  lightning: { at: 4900, duration: 1100 },
  bats: [
    { at: 1500, direction: 'left' },
    { at: 5900, direction: 'right' },
    { at: 7700, direction: 'left' },
  ],
},


};

function vampireMarkup() {
  return `
    <div class="vampire">
      <div class="cape"></div>
      <div class="face"></div>
      <div class="hair"></div>
      <div class="eyes"></div>
      <div class="fangs"></div>
    </div>
  `;
}

export default function hauntedHouse({ app, $, $$, frame, feedback, award, tag, difficulty }) {
  const settings = HOUSE_DIFFICULTIES[difficulty] ?? HOUSE_DIFFICULTIES.normal;
  const duration = settings.duration;
  app.innerHTML = frame(7, `
    <p class="lead center">
      The Ghostbusters need your help! Watch the house for ${duration / 1000} seconds and count every
      <strong>ghost appearance</strong>. If you get the count right, they’ll give you the haunted-house charm.
      Even when ghosts overlap, count each one. Bats and vampires do not count!
    </p>
    <div class="scene" id="scene" aria-label="Animated haunted house with ghosts in windows">
      <div class="moon"></div>
      <div class="star scene-star-1"></div>
      <div class="star scene-star-2"></div>
      <div class="star scene-star-3"></div>
      <div class="star scene-star-4"></div>
      <div class="hill left"></div><div class="hill right"></div>
      <div class="tree left"></div><div class="tree right"></div>
      <div class="house">
        <div class="chimney"></div><div class="roof"></div><div class="body"></div><div class="door"></div>
        <div class="window w1"><div class="ghost"></div>${vampireMarkup()}</div>
        <div class="window w2"><div class="ghost"></div>${vampireMarkup()}</div>
        <div class="window w3"><div class="ghost"></div>${vampireMarkup()}</div>
        <div class="window w4"><div class="ghost"></div>${vampireMarkup()}</div>
        <div class="window w5"><div class="ghost"></div>${vampireMarkup()}</div>
        <div class="window w6"><div class="ghost"></div>${vampireMarkup()}</div>
      </div>
      <div class="ground"></div><div class="fog"></div>
      <div class="bat" id="bat">🦇 🦇</div>
      <div class="lightning" id="lightning"></div>
    </div>
    <div class="button-row">
      <button class="btn" id="play-house">Play the scene</button>
      <span class="muted house-status" id="house-status">Ready</span>
    </div>
    <form class="input-row hidden" id="house-form">
      <input id="house-answer" type="number" min="0" inputmode="numeric" placeholder="Ghost count" aria-label="Number of ghost appearances" required>
      <button class="btn">Check count</button>
    </form>
    <div class="feedback center" id="feedback" aria-live="polite"></div>
  `);

  const scene = $('#scene');
  const ghosts = $$('.ghost', scene);
  const vampires = $$('.vampire', scene);
  const playButton = $('#play-house');
  const status = $('#house-status');
  const lightning = $('#lightning');
  const bats = $('#bat');
  let animationFrame = 0;
  let startTime = 0;
  let playing = false;

  function eventIsActive(event, elapsed) {
    return elapsed >= event.at && elapsed < event.at + event.duration;
  }

  function tick(now) {
    if (tag() !== 7) return;
    const elapsed = now - startTime;

    ghosts.forEach((ghost, index) => {
      const visible = settings.ghosts.some(event => (
        event.window === index && eventIsActive(event, elapsed)
      ));
      ghost.classList.toggle('on', visible);
    });

    vampires.forEach((vampire, index) => {
      const visible = settings.vampires.some(event => (
        event.window === index && eventIsActive(event, elapsed)
      ));
      vampire.classList.toggle('on', visible);
    });

    const lightningTime = elapsed - settings.lightning.at;
    lightning.style.opacity = lightningTime < 0 || lightningTime > settings.lightning.duration
      ? 0
      : lightningTime < 250
        ? (lightningTime / 250) * 0.48
        : lightningTime < 350
          ? 0.48
        : ((settings.lightning.duration - lightningTime) / (settings.lightning.duration - 350)) * 0.48;

    settings.bats.forEach(event => {
      bats.classList.toggle(
        `fly-${event.direction}`,
        elapsed >= event.at && elapsed < event.at + BAT_DURATION,
      );
    });

    if (elapsed >= duration) {
      stop();
      return;
    }

    animationFrame = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(animationFrame);
    playing = false;
    ghosts.forEach(ghost => ghost.classList.remove('on'));
    vampires.forEach(vampire => vampire.classList.remove('on'));
    lightning.style.opacity = 0;
    bats.classList.remove('fly-left', 'fly-right');
    playButton.disabled = false;
    playButton.textContent = 'Replay from beginning';
    status.textContent = 'Finished';
    $('#house-form').classList.remove('hidden');
  }

  function run() {
    if (playing) return;

    cancelAnimationFrame(animationFrame);
    playing = true;
    $('#house-form').classList.add('hidden');
    feedback('');
    $('#house-answer').value = '';
    playButton.disabled = true;
    status.textContent = 'Watch closely…';
    bats.classList.remove('fly-left', 'fly-right');
    void bats.offsetWidth;
    startTime = performance.now();
    animationFrame = requestAnimationFrame(tick);
  }

  playButton.addEventListener('click', run);
  $('#house-form').addEventListener('submit', event => {
    event.preventDefault();
    if ($('#house-answer').value === String(settings.answer)) {
      award(7);
    } else {
      feedback('Not quite. Watch the scene again and count carefully!');
    }
  });
}
