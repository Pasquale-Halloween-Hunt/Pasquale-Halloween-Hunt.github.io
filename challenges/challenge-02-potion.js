const NORMAL_INGREDIENTS = [
  ['toadstool', '🍄', 'Toadstool'],
  ['bat', '🦇', 'Bat Wing'],
  ['pumpkin', '🎃', 'Pumpkin'],
  ['spider', '🕷️', 'Spider'],
];

const HARD_INGREDIENTS = [
  ['toadstool', '🍄', 'Toadstool'],
  ['bat', '🦇', 'Bat Wing'],
  ['pumpkin', '🎃', 'Pumpkin'],
  ['spider', '🕷️', 'Spider'],
  ['frog', '🐸', 'Frog'],
];

export function getPotionAppearance(index) {
  // Spread colors around the hue wheel while keeping green for the correct potion.
  const hueRange = 265;
  const rawHue = (index * 137.508) % hueRange;
  const hue = rawHue < 75 ? rawHue : rawHue + 95;
  const saturation = [95, 55, 80, 35, 70][index % 5];
  const lightness = [50, 30, 75, 45, 65, 20, 85][index % 7];
  const effects = [
    'bubbling',
    'smoking',
    'sparkling',
    'glowing',
    'swirling',
    'pulsing',
  ];
  const effect = effects[(index * 5 + Math.floor(index / 6)) % effects.length];
  const specialColors = [
    '#FFF9E9', // Milky white
    '#17141F', // Ink black
    '#76513B', // Muddy brown
    '#A8ADB7', // Ash gray
  ];
  const color = index % 17 === 8
    ? specialColors[Math.floor(index / 17) % specialColors.length]
    : `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness}%)`;

  return { color, effect };
}

const failedPotions = [
  // 1–10
  { name: 'Smelly Socks', line: 'My socks smell worse than a swamp!' },
  { name: 'Uncontrollable Hiccups', line: 'HIC! Oh dear! HIC! Not again!' },
  { name: 'Chicken Transformation', line: 'Cluck? Why do I suddenly want birdseed?' },
  { name: 'Invisible Pants', line: "MY PANTS ARE INVISIBLE! ...Wait. I wasn't wearing any." },
  { name: 'Dancing Skeletons', line: 'My skeleton wants to dance, but the rest of me does not!' },
  { name: 'Endless Sneezing', line: "ACHOO! I've sneezed my hat across the room!" },
  { name: 'Frog Voices', line: "RIBBIT! I mean... that's not right!" },
  { name: 'Rotten Pumpkins', line: "Why do I smell like last year's pumpkin pie?" },
  { name: 'Backward Walking', line: 'Why am I walking backward?' },
  { name: 'Giant Ears', line: 'I can hear a spider sneeze from here!' },

  // 11–20
  { name: 'Itchy Warts', line: 'Seventeen itchy warts! Seventeen!' },
  { name: 'Rainbow Farts', line: 'Oh no. That rainbow-colored cloud came from ME!' },
  { name: 'Spaghetti Hair', line: 'Is that spaghetti in my hair?' },
  { name: 'Talking Pumpkins', line: "Why can I hear pumpkins talking inside my head?!" },
  { name: 'Tiny Feet', line: 'My shoes are suddenly enormous!' },
  { name: 'Ghostly Giggles', line: "Hee hee! I can't stop giggling!" },
  { name: 'Sticky Fingers', line: 'My broom is stuck to my hand!' },
  { name: 'Bat Breath', line: 'Every word I say smells like a bat cave.' },
  { name: 'Upside-Down Vision', line: 'Everything is upside down! Or am I?' },
  { name: 'Runaway Eyebrows', line: 'Where have my eyebrows gone?!' },

  // 21–30
  { name: 'Midnight Meowing', line: 'MEOW! ...I beg your pardon.' },
  { name: 'Exploding Bubbles', line: 'POP! POP! Why are bubbles bursting in my ears?!' },
  { name: 'Dancing Teeth', line: 'My teeth are tap-dancing!' },
  { name: 'Accidental Rhyming', line: 'My hat is blue, my broom is too! WHY AM I RHYMING WITH YOU?' },
  { name: 'Reverse Gravity', line: 'WHY AM I FLOATING?! GET ME DOWN!' },
  { name: 'Uncontrollable Honesty', line: 'Your potion-making is terrible! ...Oh dear, did I say that aloud?' },
  { name: 'Tiny Voice', line: 'Why do I sound like a squeaky mouse?!' },
  { name: 'Sudden Forgetfulness', line: 'What was I making again? And who are you?' },
  { name: 'Dramatic Entrances', line: 'BEHOLD! THE GREAT WITCH HAS ARRIVED! ...I was already here.' },
  { name: 'Invisible Nose', line: "I can't see my nose! ...Actually, I never could." },

  // 31–40
  { name: 'Wobbly Knees', line: 'My knees have turned into jelly! Wobble wobble!' },
  { name: 'Endless Yawning', line: 'YAAAAWN! I have slept for three centuries! Why am I tired?' },
  { name: 'Confused Directions', line: 'I shall go left! ...Why did I turn right?' },
  { name: 'Bubblegum Beard', line: 'My chin is covered in bubblegum! And I do not HAVE a beard!' },
  { name: 'Ticklish Elbows', line: 'HEE HEE! Stop tickling my elbows! Nobody is touching them!' },
  { name: 'Opera Singing', line: 'OHHHH, MY CAULDRON IS BURRRRNING! Why am I singing opera?!' },
  { name: 'Invisible Hands', line: 'Where are my hands?! Oh. They are still holding my broom.' },
  { name: 'Marshmallow Muscles', line: 'I feel so strong! ...Why are my arms squishy?' },
  { name: 'Sudden Politeness', line: 'Please excuse my terrifying curse. Thank you ever so much.' },
  { name: 'Witchy Whistles', line: 'Every time I speak, I whistle! Ssssorry about that!' },

  // 41–50
  { name: 'Dizzy Spells', line: 'Why is the room spinning? I have not even flown today!' },
  { name: 'Chocolate Fingers', line: 'My fingers are chocolate! I must resist eating them!' },
  { name: 'Invisible Hat', line: 'MY HAT IS GONE! ...No, wait, I can still feel it.' },
  { name: 'Sleepwalking', line: 'Zzz... I am casting spells in my sleep again...' },
  { name: 'Purple Tongue', line: 'Why is my tongue purple? I only licked the cauldron once!' },
  { name: 'Witchy Echoes', line: 'Hello? Hello? HELLO? Why am I echoing myself?' },
  { name: 'Uncontrollable Compliments', line: 'What a magnificent cauldron! And such lovely dirt! STOP IT!' },
  { name: 'Popcorn Hair', line: 'POP! POP! My hair is turning into popcorn!' },
  { name: 'Noodle Arms', line: 'My arms have gone all floppy! How am I supposed to stir?' },
  { name: 'Royal Accent', line: 'One is most displeased with this frightfully dreadful potion.' },

  // 51–60
  { name: 'Ticking Teeth', line: 'Tick, tock, tick, tock! Why are my teeth making clock noises?' },
  { name: 'Mysterious Mustache', line: 'I have grown a mustache! A rather magnificent one, actually.' },
  { name: 'Excessive Confidence', line: 'I AM THE GREATEST WITCH ALIVE! ...Why am I standing on one foot?' },
  { name: 'Rubber Nose', line: 'BOING! My nose has turned into rubber!' },
  { name: 'Instant Nostalgia', line: 'Ah, this reminds me of my childhood... four hundred years ago.' },
  { name: 'Wandering Thoughts', line: 'Now, where was I? Oh! Do spiders have birthdays?' },
  { name: 'Cold Toes', line: 'BRRR! My toes feel like frozen eyeballs!' },
  { name: 'Flaming Sneezes', line: 'ACHOO! I just sneezed a spark! My eyebrows are in danger!' },
  { name: 'Unwanted Tap Dancing', line: 'My feet will not stop tapping! I never even took lessons!' },
  { name: 'Pigeon Noises', line: 'Coo! Coo! I sound like a pigeon in a pointy hat!' },

  // 61–70
  { name: 'Magnetic Fingers', line: 'Every spoon in the kitchen is stuck to my fingers!' },
  { name: 'Floating Hair', line: 'My hair is floating straight up! I look like a frightened broom!' },
  { name: 'Endless Apologies', line: 'Sorry! Oh, sorry for apologizing! Sorry about that too!' },
  { name: 'Tiny Hat Syndrome', line: 'My hat has shrunk! It barely covers one wart!' },
  { name: 'Giant Shoes', line: 'Why are my shoes the size of pumpkins?!' },
  { name: 'Squeaky Steps', line: 'SQUEAK! SQUEAK! My feet sound like rubber ducks!' },
  { name: 'Mismatched Eyes', line: 'One eye sees Tuesday and the other sees Thursday!' },
  { name: 'Invisible Eyelashes', line: 'My eyelashes are invisible! How will I look mysterious?!' },
  { name: 'Uncontrollable Winking', line: 'Wink! Wink! Stop it, eye! I am not flirting with the cauldron!' },
  { name: 'Sudden Stage Fright', line: 'Oh no! Everyone is looking at me! ...I am alone.' },

  // 71–80
  { name: 'Endless Counting', line: 'One, two, three, four... WHY CAN I NOT STOP COUNTING?!' },
  { name: 'Carrot Fingers', line: 'My fingers have turned into carrots! The rabbits must never know!' },
  { name: 'Creaky Joints', line: 'CREAK! Every time I move, I sound like an old door!' },
  { name: 'Bouncing Boots', line: 'BOING! BOING! My boots refuse to stay on the ground!' },
  { name: 'Sudden Shyness', line: 'I... um... would rather not cast any curses right now.' },
  { name: 'Glittery Sweat', line: 'Why am I sweating glitter?! This is terribly undignified!' },
  { name: 'Giggling Kneecaps', line: 'My knees are giggling! I did not know knees could laugh!' },
  { name: 'Invisible Elbows', line: 'I have lost my elbows! How will I dramatically point at things?!' },
  { name: 'Sour Lemon Face', line: 'OOOH! My face feels like I ate twelve lemons!' },
  { name: 'Unwanted Beatboxing', line: 'Boots and cats and boots and cats! MAKE IT STOP!' },

  // 81–90
  { name: 'Giant Hiccups', line: 'HIC! That hiccup nearly launched me through the ceiling!' },
  { name: 'Melting Makeup', line: 'My terrifying makeup is sliding down my face!' },
  { name: 'Wormy Whispers', line: 'Why am I whispering? I AM TRYING TO SHOUT!' },
  { name: 'Endless Blushing', line: 'My cheeks are glowing red! How embarrassing!' },
  { name: 'Spinning Hat', line: 'My hat is spinning on my head! I feel like a windmill!' },
  { name: 'Broomstick Jealousy', line: 'Why am I jealous of my own broom? It is only a stick!' },
  { name: 'Goosebumps Galore', line: 'I have goosebumps on my goosebumps!' },
  { name: 'Accidental Beatboxing', line: 'Brr-tss! Brr-tss! I have become my own drum machine!' },
  { name: 'Lopsided Smile', line: 'My smile is stuck on one side! I look suspiciously cheerful!' },
  { name: 'Mysterious Snoring', line: 'HONK! Was that me? I am not even asleep!' },

  // 91–100
  { name: 'Giant Tongue', line: 'My tongue ith tho big I can barely thpeak!' },
  { name: 'Invisible Shadow', line: 'My shadow has disappeared! How am I supposed to look ominous?' },
  { name: 'Jellybean Tears', line: 'I am crying jellybeans! At least they are delicious.' },
  { name: 'Sudden Clumsiness', line: 'Oops! I dropped my wand. And my hat. And my dignity.' },
  { name: 'Musical Burps', line: 'BUUURP! Was that a B-flat? I think I burped a whole melody!' },
  { name: 'Bouncy Hair', line: 'My hair has become a trampoline! Stop bouncing, curls!' },
  { name: 'Endless Questions', line: 'Why am I here? Why is my hat pointy? Why are pumpkins orange?' },
  { name: 'Cinnamon Sneezes', line: 'ACHOO! Why does every sneeze smell like cinnamon?' },
  { name: 'Invisible Knees', line: 'Where did my knees go?! How am I supposed to kneel dramatically?' },
  { name: 'Sleepy Eyebrows', line: 'My eyebrows keep drooping over my eyes! Wake up, eyebrows!' },

  // 101–110
  { name: 'Thunderous Footsteps', line: 'BOOM! BOOM! Why do my footsteps sound like thunder?!' },
  { name: 'Endless Chuckling', line: 'Heh. Hehehe. HAHAHA! I do not even know what is funny!' },
  { name: 'Mushroom Hat', line: 'My hat has turned into a mushroom! Is it edible? ...Probably not.' },
  { name: 'Confetti Coughs', line: 'COUGH! Why am I coughing up confetti?!' },
  { name: 'Upside-Down Speech', line: 'Goodbye means hello now! Wait, did I say that backward?' },
  { name: 'Giant Warts', line: 'My favorite wart has grown bigger than my nose!' },
  { name: 'Accidental Lullabies', line: 'Hush little cauldron, do not you cry... WHY AM I SINGING THIS?' },
  { name: 'Wobbly Voice', line: 'My voice keeps wobbling like a bowl of jelly!' },
  { name: 'Invisible Broom', line: 'My broom has vanished! Oh no, I am still holding it!' },
  { name: 'Excessive Dramatic Pauses', line: 'I... have... made... a... terrible... mistake.' },

  // 111–119
  { name: 'Dandelion Hair', line: 'My hair has turned into fluff! Do not let anyone sneeze near me!' },
  { name: 'Uncontrollable Pirouettes', line: 'Why am I spinning like a ballerina?! I am a WITCH!' },
  { name: 'Pickle Breath', line: 'My breath smells like pickles! Even my own nose is offended!' },
  { name: 'Ticklish Nose', line: 'Hee hee! My nose is tickling itself!' },
  { name: 'Mismatched Hands', line: 'My left hand thinks it is my right hand! Stop shaking yourself!' },
  { name: 'Sudden Dramatic Poetry', line: 'Oh cauldron dark, oh bubbling brew, what foolish thing have I done to you?' },
  { name: 'Giant Glasses', line: 'My spectacles have grown enormous! I can see tomorrow!' },
  { name: 'Marshmallow Toes', line: 'My toes feel like marshmallows! I am afraid to walk near the fire!' },
  { name: 'Endless Cackling', line: 'MWAHAHAHA! MWAHAHA! ...Someone help, I cannot stop cackling!' }
];

// Normal reads entries 0–22; the two five-ingredient modes start at entry 23.
export const FAILURES = failedPotions;

// Edit the logicPuzzle and correctRecipe fields below together when writing
// the two five-ingredient puzzles.
export const POTION_VERSIONS = {
  normal: {
    ingredients: NORMAL_INGREDIENTS,
    correctRecipe: 'toadstool,bat,pumpkin,spider',
    logicPuzzle: `
      <em>
        “Oh dear! I've forgotten the recipe for my Potion of Scariness! I can't possibly return your charm without it. I remember
        that the spider must go in last, and the toadstool must go in before the bat wing.
        Oh, and one more thing! The pumpkin and toadstool must never be added one after
        the other! Can you figure out the recipe?”
      </em>
    `,
  },
  challenging: {
    ingredients: HARD_INGREDIENTS,
    correctRecipe: 'toadstool,frog,bat,spider,pumpkin',
    logicPuzzle: `
      <em>
        “Oh dear! I've forgotten the recipe for my Potion of Scariness! I can't possibly return your charm without it. I remember
        that the frog wasn't first, but the spider was after the bat wing. 
        I think the Toadstool wasn't next to the wing either, and the pumpkin was last. 
        Oh, and the bat wing was somewhere in the middle! Can you figure out the recipe?”
      </em>
    `,
  },
  nightmare: {
    ingredients: HARD_INGREDIENTS,
    correctRecipe: 'frog,toadstool,bat,pumpkin,spider',
    logicPuzzle: `
      <em>
         “Oh dear! I've forgotten the recipe for my Potion of Scariness! I can't possibly return your charm without it. I do remember for certain that no two creatures could go 
         into the cauldron one after another. They'd start fighting, and what a dreadful mess that would be!
         Now, I feel like the toadstool went in before the bat wing, and the toadstool was also added before the frog. 
         The bat wing came before the spider, and the frog was closer to the bat wing than to the pumpkin.
         Oh, bother! I know exactly one of those four memories is wrong, but I haven't the faintest idea which one! Can you figure out the recipe?”
      </em>
    `,
  },
};

function permutations(items) {
  if (!items.length) return [[]];

  return items.flatMap((value, index) => {
    const remaining = items.filter((_, itemIndex) => itemIndex !== index);
    return permutations(remaining).map(rest => [value, ...rest]);
  });
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export default function potion({ app, $, $$, frame, feedback, award, tag, difficulty }) {
  let selected = [];
  let tapMode = false;
  let locked = false;
  const version = POTION_VERSIONS[difficulty] ?? POTION_VERSIONS.normal;
  const {
    ingredients,
    correctRecipe,
    logicPuzzle,
  } = version;
  const wrongRecipes = permutations(ingredients.map(ingredient => ingredient[0]))
    .map(recipe => recipe.join(','))
    .filter(recipe => recipe !== correctRecipe);
  const shuffledIngredients = shuffle(ingredients);

  if (shuffledIngredients.map(ingredient => ingredient[0]).join(',') === correctRecipe) {
    [shuffledIngredients[0], shuffledIngredients[1]] = [
      shuffledIngredients[1],
      shuffledIngredients[0],
    ];
  }

  app.innerHTML = frame(2, `
    <div class="center witch" aria-hidden="true">🧙‍♀️</div>
    <div class="prompt">
      ${logicPuzzle}
    </div>
    <p class="center muted" id="potion-instruction">
      Drag ingredients to rearrange them, then drop each one into the cauldron.
    </p>
    <div class="ingredient-area ingredients-${ingredients.length}" id="ingredients">
      ${shuffledIngredients.map(([id, emoji, label]) => `
        <button class="ingredient" data-ingredient="${id}" type="button">
          <span class="emoji">${emoji}</span>
          <small>${label}</small>
        </button>
      `).join('')}
    </div>
    <div class="cauldron" id="cauldron">
      <div class="rim"></div>
      <div class="pot"><div class="brew" id="brew">🫧</div></div>
      <div class="potion-effect" id="potion-effect" aria-hidden="true"></div>
    </div>
    <p class="center tiny" id="added">0 of ${ingredients.length} ingredients added</p>
    <div class="feedback center" id="feedback" aria-live="polite"></div>
    <div class="button-row" id="potion-finish" hidden>
      <button class="btn" id="collect-potion-charm" type="button">
        Continue
      </button>
    </div>
    <div class="button-row" id="potion-retry" hidden>
      <button class="btn secondary" id="retry-potion" type="button">
        Try another potion
      </button>
    </div>
    <div class="button-row">
      <button class="btn secondary" id="switch-mode">
        Having trouble dragging? Switch to tap mode
      </button>
    </div>
  `);

  const buttons = $$('.ingredient');
  const ingredientsArea = $('#ingredients');
  const cauldron = $('#cauldron');
  const potionEffect = $('#potion-effect');

  function showPotionLight({ color, effect = 'pulsing' }) {
    cauldron.style.setProperty('--potion-color', color);
    cauldron.classList.add('finished');
    cauldron.classList.add(`potion-${effect}`);
    potionEffect.textContent = {
      bubbling: '🫧  🫧  🫧',
      smoking: '☁︎  ☁︎  ☁︎',
      sparkling: '✦  ✧  ✦',
      glowing: '✦  ✦  ✦',
      swirling: '🌀',
      pulsing: '✦',
    }[effect];
    potionEffect.hidden = false;
  }

  function clearPotionLight() {
    cauldron.classList.remove('finished');
    cauldron.style.removeProperty('--potion-color');
    potionEffect.hidden = true;
    potionEffect.textContent = '';
    cauldron.classList.remove(
      'potion-bubbling',
      'potion-smoking',
      'potion-sparkling',
      'potion-glowing',
      'potion-swirling',
      'potion-pulsing',
    );
  }

  function update() {
    buttons.forEach(button => {
      button.disabled = selected.includes(button.dataset.ingredient) || locked;
    });

    $('#brew').textContent = selected.length
      ? selected.map(id => ingredients.find(ingredient => ingredient[0] === id)[1]).join('')
      : '🫧';
    $('#added').textContent = `${selected.length} of ${ingredients.length} ingredients added`;
  }

  function addIngredient(id) {
    if (locked || selected.includes(id)) return;

    selected.push(id);
    update();
    if (selected.length !== ingredients.length) return;

    locked = true;
    const recipe = selected.join(',');

    if (recipe === correctRecipe) {
      showPotionLight({ color: 'hsl(120, 85%, 55%)', effect: 'glowing' });
      feedback('🧙‍♀️ “You completed the Potion of Scariness!”', true);
      $('#potion-finish').hidden = false;
      return;
    }

    const failureIndex = wrongRecipes.indexOf(recipe);
    const failure = FAILURES[failureIndex];
    showPotionLight(getPotionAppearance(failureIndex));
    feedback(`🫧 Potion of ${failure.name}! “${failure.line}”`);
    $('#potion-retry').hidden = false;
  }

  function resetPotion() {
    if (tag() !== 2) return;
      selected = [];
      locked = false;
      clearPotionLight();
      update();
      feedback('The cauldron is empty. Try another recipe!');
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      if (tapMode) addIngredient(button.dataset.ingredient);
    });

    button.addEventListener('pointerdown', event => {
      if (tapMode || button.disabled) return;
      event.preventDefault();

      const ingredientId = button.dataset.ingredient;
      const originalBounds = button.getBoundingClientRect();
      const pointerOffsetX = event.clientX - originalBounds.left;
      const pointerOffsetY = event.clientY - originalBounds.top;
      const placeholder = document.createElement('div');

      placeholder.className = 'ingredient-placeholder';
      placeholder.style.height = `${originalBounds.height}px`;
      button.replaceWith(placeholder);
      document.body.append(button);

      button.classList.add('dragging');
      button.style.left = `${originalBounds.left}px`;
      button.style.top = `${originalBounds.top}px`;
      button.style.width = `${originalBounds.width}px`;
      button.style.height = `${originalBounds.height}px`;

      const move = moveEvent => {
        button.style.left = `${moveEvent.clientX - pointerOffsetX}px`;
        button.style.top = `${moveEvent.clientY - pointerOffsetY}px`;

        const hoveredElement = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const hoveredIngredient = hoveredElement?.closest('.ingredient');

        if (hoveredIngredient && ingredientsArea.contains(hoveredIngredient)) {
          const hoveredBounds = hoveredIngredient.getBoundingClientRect();
          const insertBefore = moveEvent.clientX < hoveredBounds.left + hoveredBounds.width / 2;
          ingredientsArea.insertBefore(
            placeholder,
            insertBefore ? hoveredIngredient : hoveredIngredient.nextSibling,
          );
        }

        const bounds = cauldron.getBoundingClientRect();
        const isOver = moveEvent.clientX >= bounds.left
          && moveEvent.clientX <= bounds.right
          && moveEvent.clientY >= bounds.top
          && moveEvent.clientY <= bounds.bottom;
        cauldron.classList.toggle('drag-over', isOver);
      };

      const cleanUp = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', cancel);
        button.classList.remove('dragging');
        button.style.removeProperty('left');
        button.style.removeProperty('top');
        button.style.removeProperty('width');
        button.style.removeProperty('height');
        placeholder.replaceWith(button);
        cauldron.classList.remove('drag-over');
      };

      const end = endEvent => {
        const bounds = cauldron.getBoundingClientRect();
        const droppedInside = endEvent.clientX >= bounds.left
          && endEvent.clientX <= bounds.right
          && endEvent.clientY >= bounds.top
          && endEvent.clientY <= bounds.bottom;
        cleanUp();
        if (droppedInside) addIngredient(ingredientId);
      };

      const cancel = () => cleanUp();

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    });
  });

  $('#switch-mode').addEventListener('click', () => {
    tapMode = !tapMode;
    $('#potion-instruction').textContent = tapMode
      ? 'Tap each ingredient in the order you want to add it.'
      : 'Drag ingredients to rearrange them, then drop each one into the cauldron.';
    $('#switch-mode').textContent = tapMode
      ? 'Switch back to drag mode'
      : 'Having trouble dragging? Switch to tap mode';
  });

  $('#collect-potion-charm').addEventListener('click', () => {
    if (tag() === 2) award(2);
  });

  $('#retry-potion').addEventListener('click', () => {
    $('#potion-retry').hidden = true;
    resetPotion();
  });
}
