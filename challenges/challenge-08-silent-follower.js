const RIDDLES = {
  normal: {
    answer: 'SHADOW',
    prompt: `
      I follow your every move,<br>
      Yet never make a sound.<br>
      I vanish in the darkness,<br>
      But in the light, I’m found.<br><br>
      What am I?
    `,
  },
  challenging: {
    answer: 'CANDLE',
    prompt: `
      I stand tall when I am young,<br>
      But shrink as I grow old.<br>
      I bring light into the darkness,<br>
      Though my touch is far from cold.<br><br>
      What am I?
    `,
  },
  nightmare: {
    answer: ['FOOTSTEPS', 'FOOTSTEP'],
    prompt: `
      The more you take,<br>
      The more you leave behind.<br>
      You cannot keep what you’ve taken,<br>
      Yet proof of it remains.<br><br>
      What am I?
    `,
  },
};

export default function silentFollower({ answerBox, difficulty }) {
  const riddle = RIDDLES[difficulty] ?? RIDDLES.normal;

  answerBox(
    8,
    `<div class="trivia-keeper">🪞 <strong>The Enchanted Mirror</strong><br><span>Answer my riddle, and I’ll give you the charm.</span></div><br>${riddle.prompt}`,
    riddle.answer,
  );
}
