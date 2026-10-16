function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export default function graveyard({ app, $$, frame, feedback, award, difficulty }) {
  const versions = {
    normal: {
      graves: [
        ['Martha', '1840–1910'],
        ['Edgar', '1822–1904'],
        ['Agnes', '1810–1865'],
        ['Thomas', '1800–1890']
      ],
      answer: 'Thomas'
    },
    challenging: {
      graves: [
        ['Robert', '1800–1893'],
        ['Clara', '1812–1892'],
        ['Samuel', '1778–1843'],
        ['Eleanor', '1830–1920'],
        ['Henry', '1795–1870'],
        ['Beatrice', '1821–1906']
      ],
      answer: 'Robert'
    },
    nightmare: {
      graves: [
        ['Elizabeth', '1915–2012'],
        ['Jonathan', '1673–1768'],
        ['Margaret', '1502–1596'],
        ['William', '1834–1927'],
        ['Dorothea', '1609–1701'],
        ['Ambrose', '1716–1807']
      ],
      answer: 'Elizabeth'
    }
  };

  const version = versions[difficulty] ?? versions.normal;
  const graves = shuffle(version.graves);
  const answer = version.answer;
  const graveCount = {
    4: 'Four',
    6: 'Six'
  }[graves.length] ?? String(graves.length);

  app.innerHTML = frame(1, `
    <p class="lead">
      ${graveCount} souls rest in the haunted graveyard. Which lived the longest? The oldest soul holds your charm.
    </p>
    <div class="graveyard graveyard-${graves.length}">
      ${graves.map(([name, dates]) => `
        <button class="grave" data-person="${name}">
          ✝<br>${name}<span>${dates}</span>
        </button>
      `).join('')}
    </div>
    <div class="ground-strip"></div>
    <div class="feedback center" id="feedback" aria-live="polite"></div>
  `);

  $$('[data-person]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.person === answer) {
        award(1);
      } else {
        feedback('That soul did not live the longest. Compare the years!');
      }
    });
  });
}
