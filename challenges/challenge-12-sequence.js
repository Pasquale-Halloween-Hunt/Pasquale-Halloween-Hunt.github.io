const SEQUENCES = {
  normal: { numbers: '2, 8, 14, 20, ?', answer: '26' },
  challenging: { numbers: '2, 3, 5, 8, 13, ?', answer: '21' },
  nightmare: { numbers: '1, 2, 5, 12, 29, ?', answer: '70' },
};

export default function sequence({ answerBox, difficulty }) {
  const sequence = SEQUENCES[difficulty] ?? SEQUENCES.normal;

  answerBox(
    12,
    `
      <div class="trivia-keeper">🧙‍♀️ <strong>The Bewildered Witch</strong><br><span>My summoning spell is broken! Without it, I can’t summon the final charm.</span></div><br>
      Complete the witch’s number sequence:<br>
      <strong class="sequence-numbers">${sequence.numbers}</strong>
    `,
    sequence.answer,
    { numeric: true },
  );
}
