const VERSIONS = {
  normal: {
    prompt: 'In a famous fairy tale, what is the name of either child who discovers a house made of candy and is nearly eaten by the witch who lives inside?',
    answer: ['HANSEL', 'GRETEL'],
    options: {contains: true},
  },
  challenging: {
    prompt: 'This legendary creature, said to inhabit the Pine Barrens, inspired the name of a professional hockey team from the same state.',
    answer: 'JERSEYDEVIL',
    options: {contains: true},
  },
  nightmare: {
    prompt: 'In Slavic folklore, this mysterious witch-like figure lives deep in the forest in a hut that stands on chicken legs?',
    answer: ['BABA YAGA'],
    options: {contains: true},
  },
};

export default function folkloreTrivia({ answerBox, difficulty }) {
  const version = VERSIONS[difficulty] ?? VERSIONS.normal;
  answerBox(9, `<div class="trivia-keeper">🧚 <strong>The Folklore Keeper</strong><br><span>Give the right answer, and I’ll release the charm.</span></div><br>${version.prompt}`, version.answer, version.options);
}
