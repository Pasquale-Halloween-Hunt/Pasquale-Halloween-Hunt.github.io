const VERSIONS = {
  normal: {
    prompt: 'This U.S. president, assassinated at a theater, reportedly appeared as a ghost to Winston Churchill during a stay at the White House?',
    answer: ['LINCOLN'],
    options: {contains: true},
  },
  challenging: {
    prompt: 'This Massachusetts town is famous for its association with witches and the infamous trials that followed.',
    answer: ['SALEM'],
    options: {contains: true},
  },
  nightmare: {
    prompt: 'This Catholic English Queen earned the moniker "Bloody" for her persecution of Protestants during her reign in the 16th century.',
    answer: ['MARY'],
    options: {contains: true},
  },
};

export default function historyTrivia({ answerBox, difficulty }) {
  const version = VERSIONS[difficulty] ?? VERSIONS.normal;
  answerBox(6, `<div class="trivia-keeper">📜 <strong>The Ghostly Historian</strong><br><span>Prove your knowledge, and the hidden charm is yours.</span></div><br>${version.prompt}`, version.answer, version.options);
}
