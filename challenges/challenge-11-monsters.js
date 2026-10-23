export default function monsters({ app, $$, frame, feedback, award, difficulty }) {
  const VERSIONS = {
    normal: {
      suspects: [
        ['Troll', '🧌', 'The Ghost (👻) stole the charm.'],
        ['Vampire', '🧛', 'The Troll (🧌) stole it!'],
        ['Ghost', '👻', 'I (👻) stole the charm!'],
      ],
      answer: 'Troll',
    },
    challenging: {
      suspects: [
        ['Werewolf', '🐺', 'I (🐺) didn\'t steal the charm'],
        ['Ogre', '👹', 'The Zombie (🧟) is innocent!'],
        ['Zombie', '🧟', 'The Werewolf (🐺) stole the charm.'],
        
      ],
      answer: 'Zombie',
    },
    nightmare: {
      suspects: [
        ['Dragon', '🐉', 'The Elf (🧝) stole the charm, and he\'s (🧝) lying!'],
        ['Elf', '🧝', 'Either the Dragon (🐉) or the Skeleton (💀) stole the charm!'],
        ['Skeleton', '💀', 'The Dragon (🐉) is lying!'],
        
      ],
      answer: 'Elf',
    }
  };

  app.innerHTML = frame(11, `
    <p class="lead">
      The charm has been stolen! Exactly <strong>one</strong> of three monsters took it.
      Two monsters are lying, and only one is telling the truth. Can you identify the thief?
    </p>
    <div class="grid">
      ${VERSIONS[difficulty].suspects.map(([name, emoji, line]) => `
        <div class="monster-card">
          <span class="monster">${emoji}</span>
          <h3>${name}</h3>
          <p>“${line}”</p>
          <button class="btn secondary" data-monster="${name}">Choose ${name}</button>
        </div>
      `).join('')}
    </div>
    <div class="feedback center" id="feedback" aria-live="polite"></div>
  `);

  $$('[data-monster]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.monster === VERSIONS[difficulty].answer) {
        award(11);
      } else {
        feedback('That choice leads to a contradiction. Try again.');
      }
    });
  });
}
