const VERSIONS = {
  normal: {
    prompt: 'This Disney Movie takes place around Christmas but is often considered a Halloween movie?',
    answer: ['Nightmare Before Christmas', 'The Nightmare Before Christmas'],
    options: {contains: true},
  },
  challenging: {
    prompt: 'This 1988 supernatural comedy film, later adapted into a Broadway musical, features a mischievous ghost who can be summoned by saying his name three times.',
    answer: ['BEETLEJUICE'],
    options: {contains: true},
  },
  nightmare: {
    prompt: 'This 2013 supernatural horror film, inspired by the investigations of Ed and Lorraine Warren, follows a family experiencing paranormal activity in a Rhode Island farmhouse?',
    answer: ['The Conjuring', 'Conjuring'],
    options: {contains: true},
  },
};

export default function cultureTrivia({ answerBox, difficulty }) {
  const version = VERSIONS[difficulty] ?? VERSIONS.normal;
  answerBox(4, `<div class="trivia-keeper">🎭 <strong>The Masked Showman</strong><br><span>Answer my question, and I’ll surrender the charm.</span></div><br>${version.prompt}`, version.answer, version.options);
}
