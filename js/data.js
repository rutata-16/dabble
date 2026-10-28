// Dummy, static data for Flow A and Flow B. Copy comes from the Mid-fi V2 frames.
// Anything not in the mid-fi is marked "invented" and listed in the README.

const ILL = 'assets/illustrations/';

export const child = {
  id: 'aanya',
  name: 'Aanya',
  ageYears: 3,
  pronoun: { subject: 'she', object: 'her', possessive: 'her' },
  interests: [],
  settleMinutes: null,
  messTolerance: null,
  learned: [],
};

export const adults = [
  { id: 'niharika', name: 'Niharika', role: 'mother', isUser: true, setUp: true, pronoun: { subject: 'she', object: 'her', possessive: 'her' },
    roleLine: 'You · {child}’s mother', enjoys: [], avoids: [], eveningEnergy: null, availability: '', learned: [] },
  { id: 'gautam', name: 'Gautam', role: 'partner', isUser: false, setUp: false, pronoun: { subject: 'he', object: 'him', possessive: 'his' },
    roleLine: 'Partner · home most evenings by 7, and weekends', enjoys: [], avoids: [], eveningEnergy: null, availability: 'home most evenings by 7, and weekends', learned: [] },
  { id: 'amma', name: 'Amma', role: 'grandparent', isUser: false, setUp: false, pronoun: { subject: 'she', object: 'her', possessive: 'her' },
    roleLine: 'Grandparent · weekends, lives nearby', enjoys: [], avoids: [], eveningEnergy: null, availability: 'weekends, lives nearby', learned: [] },
];

// A6
export const interestOptions = [
  'Animals', 'Water', 'Music', 'Building', 'Soil and plants', 'Pretend play',
  'Books', 'Messy art', 'Running about', 'Vehicles',
];

// A7
export const settleOptions = [
  { id: 'few', title: 'A few minutes', minutes: 5 },
  { id: 'ten', title: 'About ten', minutes: 10 },
  { id: 'long', title: 'She can really settle in', minutes: 30 },
];
export const messOptions = [
  { id: 'wipe', title: 'Wipe-clean only' },
  { id: 'some', title: 'Some mess is fine' },
  { id: 'any', title: 'Bring it on' },
];

// A9
export const enjoyOptions = [
  'Being outdoors', 'Reading aloud', 'Music', 'Making things', 'Cooking together',
  'Quiet games', 'Rough and tumble', 'Drawing',
];
export const avoidOptions = ['Messy art', 'Loud games', 'Long drives', 'Anything needing prep'];
export const energyOptions = [
  { id: 'empty', title: 'Running on empty', sub: 'Most nights' },
  { id: 'some', title: 'Something left', sub: 'Some nights' },
  { id: 'fine', title: 'Fine till bedtime', sub: 'Rarely' },
];

// A10
export const weeknightOptions = [
  { id: 'me', title: 'Usually just me' },
  { id: 'both', title: 'Both of us, when {partnerSubject} is home' },
  { id: 'help', title: 'We have help at home' },
];
export const homeItemOptions = [
  { id: 'dal', label: 'Dal and rice' },
  { id: 'cardboard', label: 'Cardboard' },
  { id: 'balls', label: 'Balls' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'crayons', label: 'Crayons' },
  { id: 'dough', label: 'Dough' },
  { id: 'buckets', label: 'Buckets' },
  { id: 'torch', label: 'Torch' },
];

// B3 to B5
export const minuteOptions = [
  { id: 10, title: '10 minutes', word: 'ten' },
  { id: 20, title: '20 minutes', word: 'twenty' },
  { id: 30, title: '30 minutes', word: 'thirty' },
  { id: 999, title: 'Longer than that', word: 'more than thirty' },
];
export const postureOptions = [
  { id: 'sitting', title: 'Sitting down', sub: 'She comes to you', label: 'sitting down', rank: 0 },
  { id: 'floor', title: 'On the floor', sub: 'Hands in it, not moving much', label: 'on the floor', rank: 1 },
  { id: 'up', title: 'Up and about', sub: 'Standing, walking, chasing', label: 'up and about', rank: 2 },
];
export const whoOptions = [
  { id: 'me', title: 'Just me', sub: '', us: 'just me', you: 'just you' },
  { id: 'both', title: 'Both of us', sub: '{partner} is home', us: 'both of us', you: 'both of you' },
  { id: 'solo', title: '{child} on her own', sub: 'You need twenty minutes', us: '{child} on her own', you: '{child} on her own' },
];
export const checkInDefaults = { minutes: 20, posture: 'sitting', who: 'me' };

// B10
export const exitReasons = ['She lost interest', 'Too fiddly for me', 'Wrong time of day', 'She did not like it'];

// B11
export const verdicts = [
  { id: 'loved', label: 'She loved it' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'not', label: 'Not for her' },
];

export const ideas = [
  {
    id: 'torch-shadow-stories',
    title: 'Torch shadow stories',
    shortTitle: 'Torch stories',
    minutes: 15, posture: 'sitting', needs: ['torch'], mess: 'wipe', twoAdult: false, routine: null,
    interests: ['Pretend play'],
    uses: 'uses a torch',
    fitChild: 'pretend play',
    fitAdult: 'You: no mess, sitting down',
    whyChild: 'pretend play, settles for about ten minutes',
    whyAdult: 'sitting down, no mess, nothing to set up',
    need: 'A torch, a bare wall, your hands. All at home.',
    safety: 'No mess. Keep the torch out of her eyes.',
    steps: [
      { text: 'Turn the big light off, prop the torch on a book', say: 'Shall we make the wall into a cinema?', image: 'step-torch-1.webp' },
      { text: 'Make a shape with your hands, ask her what it is', say: 'What do you think that one is? Shall we give it a name?', image: 'step-torch-2.webp' },
      { text: 'Let her make one. Say what you see', say: 'Ooh, I see long ears. Is that a rabbit?', image: 'step-torch-3.webp' },
      { text: 'Give the shapes names and a tiny story', say: 'And then the rabbit hopped all the way home. Where does it live?', image: 'step-torch-4.webp' },
    ],
    illustration: 'idea-torch-shadow-stories.webp',
    alt: 'A mother and daughter make a rabbit shadow on the wall with a torch',
    fallback: { tag: 'marigold', icon: 'flashlight_on' },
  },
  {
    id: 'dal-sensory-tray',
    title: 'Dal sensory tray',
    shortTitle: 'Dal sensory tray',
    minutes: 20, posture: 'sitting', needs: ['dal'], mess: 'wipe', twoAdult: false, routine: null,
    interests: ['Messy art'],
    uses: 'uses dal',
    fitChild: 'safe to mouth',
    fitAdult: 'You: wipe-clean, no prep',
    whyChild: 'safe to mouth, hands busy',
    whyAdult: 'wipe-clean, no prep',
    need: 'A tray, a cup of dal and rice, two steel cups.',
    safety: 'Wipe-clean. Stay close, little grains go everywhere.',
    steps: [
      { text: 'Pour a cup of dal and rice into a tray', say: 'Listen. What sound does it make?' },
      { text: 'Give her two steel cups and let her pour', say: 'Can you fill it right to the top?' },
      { text: 'Hide a spoon in the dal and let her find it', say: 'Where did the spoon go?' },
    ],
    illustration: 'idea-dal-sensory-tray.webp',
    alt: 'A toddler pours dal and rice between steel cups',
    fallback: { tag: 'pink', icon: 'smart_display' },
  },
  {
    id: 'two-parent-kitchen-band',
    title: 'Two-parent kitchen band',
    shortTitle: 'Kitchen band',
    minutes: 20, posture: 'sitting', needs: [], mess: 'wipe', twoAdult: true, routine: null,
    interests: ['Music'],
    uses: 'uses steel bowls',
    fitChild: 'loud and silly',
    fitAdult: 'You and {partner} both play',
    whyChild: 'loud and silly',
    whyAdult: 'you and {partner} both play, nothing to set up',
    need: 'Steel bowls, two wooden spoons.',
    safety: 'No mess. Loud, so not too close to bedtime.',
    steps: [
      { text: 'Turn three steel bowls upside down', say: 'Which one sounds the biggest?' },
      { text: 'One of you plays a beat, she copies', say: 'Your turn. Can you do it back?' },
      { text: 'Swap. She leads, you both follow', say: 'Faster? Slower? You are the boss.' },
    ],
    illustration: 'idea-two-parent-kitchen-band.webp',
    alt: 'Both parents and their daughter drum on steel bowls',
    fallback: { tag: 'tomato', icon: 'music_note' },
  },
  {
    id: 'pouring-and-counting',
    title: 'Pouring and counting',
    shortTitle: 'Pouring and counting',
    minutes: 10, posture: 'sitting', needs: ['buckets'], mess: 'wipe', twoAdult: false, routine: 'bath',
    interests: ['Water'],
    uses: 'uses a bucket',
    routineLine: 'Two cups and a bucket. 10 min.',
    fallbackLine: 'Pouring and counting while she is in there anyway. Nothing to set up.',
    fitChild: 'water',
    fitAdult: 'You: nothing to set up',
    whyChild: 'water, counting',
    whyAdult: 'sitting down, nothing to set up',
    need: 'Two cups and a bucket. All at home.',
    safety: 'Already wet. Stay within reach of the bucket.',
    steps: [
      { text: 'Put two cups in the bath with her', say: 'Which cup is the big one?' },
      { text: 'Pour from one to the other and count', say: 'One, two, three. Is it full yet?' },
      { text: 'Let her pour into the bucket', say: 'How many cups to fill the bucket?' },
    ],
    illustration: 'idea-pouring-and-counting.webp',
    alt: 'A toddler pours water between steel cups beside a bucket',
    fallback: { tag: 'sky', icon: 'water_drop' },
  },
  {
    id: 'washing-vegetables',
    title: 'Washing vegetables together',
    shortTitle: 'Washing vegetables',
    minutes: 5, posture: 'up', needs: [], mess: 'some', twoAdult: false, routine: 'dinner',
    interests: ['Water', 'Soil and plants'],
    uses: 'uses the sink',
    routineLine: 'She rinses, you name each one. 5 min.',
    fitChild: 'water',
    fitAdult: 'You: cooking anyway',
    whyChild: 'water, helping',
    whyAdult: 'you are cooking anyway',
    need: 'Whatever vegetables are going into dinner.',
    safety: 'A little splashing. Keep knives out of reach.',
    steps: [
      { text: 'Stand her at the sink on a stool', say: 'Can you help me wash these?' },
      { text: 'She rinses, you name each one', say: 'That one is a carrot. What colour is it?' },
    ],
    illustration: 'idea-washing-vegetables.webp',
    alt: 'A toddler rinses vegetables at the kitchen sink',
    fallback: { tag: 'leaf', icon: 'nutrition' },
  },
  {
    id: 'bedtime-two-questions',
    title: 'Two questions',
    shortTitle: 'Two questions',
    minutes: 3, posture: 'sitting', needs: [], mess: 'wipe', twoAdult: false, routine: 'bedtime',
    interests: ['Books'],
    uses: 'nothing needed',
    routineLine: 'Best bit of today, worst bit. 3 min.',
    fitChild: 'winding down',
    fitAdult: 'You: lying down',
    whyChild: 'winding down',
    whyAdult: 'lying down, nothing to set up',
    need: 'Nothing. Just the two of you.',
    safety: 'No mess.',
    steps: [
      { text: 'Ask her the best bit of today', say: 'What was the best bit of today?' },
      { text: 'Ask her the worst bit', say: 'And was there a not-so-good bit?' },
    ],
    illustration: 'idea-bedtime-two-questions.webp',
    alt: 'A father listens to his daughter at bedtime',
    fallback: { tag: 'marigold', icon: 'bedtime' },
  },
  {
    id: 'shadow-zoo',
    title: 'Make a shadow zoo',
    shortTitle: 'Shadow zoo',
    minutes: 15, posture: 'sitting', needs: ['cardboard', 'torch'], mess: 'some', twoAdult: false, routine: null,
    interests: ['Animals', 'Pretend play'],
    uses: 'uses cardboard',
    fitChild: 'animals',
    fitAdult: 'You: sitting down, no prep',
    whyChild: 'animals, pretend play',
    whyAdult: 'sitting down, no prep',
    need: 'Cardboard, scissors, a torch.',
    safety: 'Some scraps. You do the cutting.',
    steps: [
      { text: 'Cut three animal shapes out of cardboard', say: 'Which animal should we make first?' },
      { text: 'Shine the torch and hold them up to the wall', say: 'Who is that at the zoo?' },
      { text: 'Let her feed the animals', say: 'What does the elephant eat?' },
    ],
    illustration: 'idea-shadow-zoo.webp',
    alt: 'Cardboard animal cut-outs cast shadows on a wall',
    fallback: { tag: 'marigold', icon: 'pets' },
  },
  {
    id: 'animal-sounds-game',
    title: 'Animal sounds guessing game',
    shortTitle: 'Animal sounds',
    minutes: 10, posture: 'up', needs: [], mess: 'wipe', twoAdult: false, routine: null,
    interests: ['Animals', 'Running about'],
    uses: 'nothing needed',
    fitChild: 'animals',
    fitAdult: 'You: no mess, nothing to set up',
    whyChild: 'animals, loud and silly',
    whyAdult: 'no mess, nothing to set up',
    need: 'Nothing. Just your best lion.',
    safety: 'No mess.',
    steps: [
      { text: 'Make an animal sound, she guesses', say: 'Roar! Who am I?' },
      { text: 'Swap. She makes one, you guess', say: 'Is that a cow? A very small cow?' },
    ],
    illustration: 'idea-animal-sounds-game.webp',
    alt: 'A father roars like a lion while his daughter giggles',
    fallback: { tag: 'pink', icon: 'pets' },
  },
];

// Only the fields Flow A and B show. Place detail (C6) is out of scope.
export const places = [
  { id: 'lumbini-gardens', name: 'Lumbini Gardens', shortTitle: 'Lumbini Gardens', illustration: 'place-lumbini-gardens.webp',
    alt: 'A family in a swan pedal boat on a park lake', fallback: { tag: 'sky', icon: 'sailing' } },
  { id: 'butterfly-park', name: 'Bannerghatta Butterfly Park', shortTitle: 'Butterfly Park', illustration: 'place-butterfly-park.webp',
    alt: 'A toddler on her father’s shoulders reaches for a butterfly', fallback: { tag: 'leaf', icon: 'local_florist' } },
  { id: 'nursery-8th-main', name: 'Plant nursery on 8th Main', shortTitle: 'Plant nursery', illustration: 'place-nursery-8th-main.webp',
    alt: 'A toddler holds up a small potted plant at a roadside nursery', fallback: { tag: 'sky', icon: 'local_florist' } },
  { id: 'cubbon-park-bandstand', name: 'Cubbon Park, Band stand end', shortTitle: 'Cubbon Park', illustration: 'place-cubbon-park-bandstand.webp',
    alt: 'A toddler collects leaves under rain trees near a bandstand', fallback: { tag: 'leaf', icon: 'park' } },
  { id: 'zoo-animal-section', name: 'Bannerghatta Zoo, animal section', shortTitle: 'Bannerghatta Zoo', illustration: 'place-zoo-animal-section.webp',
    alt: 'A toddler in a pram points at an elephant', fallback: { tag: 'sky', icon: 'pets' } },
  { id: 'petting-farm', name: 'Petting farm, Kanakapura Road', shortTitle: 'Petting farm', illustration: 'place-petting-farm.webp',
    alt: 'A toddler feeds leaves to a goat', fallback: { tag: 'leaf', icon: 'agriculture' } },
  { id: 'pottery-studio', name: 'Claytopia pottery', shortTitle: 'Claytopia', illustration: 'place-pottery-studio.webp',
    alt: 'A mother and daughter shape a clay bowl', fallback: { tag: 'tomato', icon: 'palette' } },
  { id: 'park-end-of-road', name: 'The park at the end of your road', shortTitle: 'Park nearby', illustration: 'place-park-end-of-road.webp',
    alt: 'A toddler on a swing in a small society park', fallback: { tag: 'leaf', icon: 'park' } },
];

export function illustrationPath(file) { return ILL + file; }
// Moment photos: seeded ones carry a full path, gallery picks are illustration files.
export function photoPath(file) { return file.includes('/') ? file : ILL + file; }

export function findIdea(id) { return ideas.find((i) => i.id === id); }
export function findPlace(id) { return places.find((p) => p.id === id); }
export function findRef(kind, id) { return kind === 'idea' ? findIdea(id) : findPlace(id); }

// Seeds for the weekday-evening lane (B). A full run starts with these empty.
export const seedRegulars = [
  { refKind: 'idea', refId: 'torch-shadow-stories', timesWorked: 4, lastDone: 'last Tuesday', twist: 'Twist tonight: let her hold the torch' },
  { refKind: 'place', refId: 'cubbon-park-bandstand', timesWorked: 6, lastDone: '2 weeks ago', twist: 'Twist: go at 7am, take a leaf bag' },
  { refKind: 'place', refId: 'nursery-8th-main', timesWorked: 3, lastDone: 'last month', twist: 'Twist: find three green vegetables' },
];

export const seedSaves = [
  { id: 's-dal', kind: 'reel', refKind: 'idea', refId: 'dal-sensory-tray', source: 'instagram', savedAt: '2026-09-28', meta: 'Saved 3 weeks ago · fits tonight', tags: [] },
  { id: 's-cubbon', kind: 'place', refKind: 'place', refId: 'cubbon-park-bandstand', source: 'app', savedAt: '2026-10-02', meta: '6 km · free · both of you in', tags: [] },
  { id: 's-zoo', kind: 'idea', refKind: 'idea', refId: 'shadow-zoo', source: 'app', savedAt: '2026-10-10', meta: '15 min · sitting down · no prep', tags: [] },
];

// 11 for October (7 at home, 4 out, 8 loved) and 3 for September.
// Four carry real photos, each matched to its subject. The rest fall back to
// the activity illustration on purpose: most real moments have no photo.
// An optional `caption` overrides the generated one (store.momentCaption).
export const seedMoments = [
  { id: 'm1', refKind: 'idea', refId: 'torch-shadow-stories', date: '2026-10-18', verdict: 'loved', photos: [], atHome: true },
  { id: 'm2', refKind: 'place', refId: 'cubbon-park-bandstand', date: '2026-10-17', verdict: 'loved', photos: ['assets/photos/moment-01.webp'], atHome: false },
  { id: 'm3', refKind: 'idea', refId: 'pouring-and-counting', date: '2026-10-15', verdict: 'loved', photos: ['assets/photos/moment-04.webp'], atHome: true },
  { id: 'm4', refKind: 'idea', refId: 'dal-sensory-tray', date: '2026-10-14', verdict: 'mixed', photos: [], atHome: true },
  { id: 'm5', refKind: 'place', refId: 'nursery-8th-main', date: '2026-10-12', verdict: 'loved', photos: [], atHome: false },
  { id: 'm6', refKind: 'idea', refId: 'washing-vegetables', date: '2026-10-10', verdict: 'loved', photos: [], atHome: true },
  { id: 'm7', refKind: 'idea', refId: 'torch-shadow-stories', date: '2026-10-08', verdict: 'loved', photos: [], atHome: true },
  { id: 'm8', refKind: 'place', refId: 'lumbini-gardens', date: '2026-10-05', verdict: 'loved', photos: ['assets/photos/moment-03.webp'], atHome: false },
  { id: 'm9', refKind: 'idea', refId: 'bedtime-two-questions', date: '2026-10-04', verdict: 'mixed', photos: [], atHome: true },
  { id: 'm10', refKind: 'idea', refId: 'animal-sounds-game', date: '2026-10-03', verdict: 'loved', photos: [], atHome: true },
  { id: 'm11', refKind: 'place', refId: 'park-end-of-road', date: '2026-10-01', verdict: 'not', photos: [], atHome: false },
  { id: 'm12', refKind: 'place', refId: 'butterfly-park', date: '2026-09-27', verdict: 'loved', photos: [], atHome: false },
  { id: 'm13', refKind: 'idea', refId: 'two-parent-kitchen-band', date: '2026-09-20', verdict: 'loved', photos: ['assets/photos/moment-02.webp'], atHome: true },
  { id: 'm14', refKind: 'idea', refId: 'torch-shadow-stories', date: '2026-09-12', verdict: 'mixed', photos: [], atHome: true },
];

// Onboarding answers the weekday-evening lane starts with (the mid-fi selections, plus Torch).
export const seedOnboarding = {
  childName: 'Aanya',
  ageYears: 3,
  interests: ['Animals', 'Water', 'Soil and plants', 'Running about'],
  settle: 'ten',
  mess: 'wipe',
  enjoys: ['Being outdoors', 'Reading aloud', 'Music', 'Cooking together'],
  avoids: ['Messy art', 'Long drives', 'Anything needing prep'],
  energy: 'empty',
  weeknight: 'both',
  homeItems: ['dal', 'cardboard', 'balls', 'blocks', 'buckets', 'torch'],
};

// B17 gallery. No parent photos ship with the handoff, so the illustrations stand in.
export const gallery = {
  all: [
    { group: 'Today', files: ['idea-torch-shadow-stories.webp', 'step-torch-2.webp', 'step-torch-4.webp'] },
    { group: 'Earlier this week', files: ['place-cubbon-park-bandstand.webp', 'idea-dal-sensory-tray.webp', 'idea-washing-vegetables.webp', 'place-lumbini-gardens.webp', 'idea-pouring-and-counting.webp', 'step-torch-3.webp'] },
  ],
  shared: [
    { group: 'Today', files: ['idea-two-parent-kitchen-band.webp'] },
    { group: 'Earlier this week', files: ['place-petting-farm.webp', 'place-zoo-animal-section.webp', 'idea-animal-sounds-game.webp'] },
  ],
  screenshots: [],
};

export const galleryAlt = {
  'step-torch-2.webp': 'Step 2 of torch shadow stories',
  'step-torch-3.webp': 'Step 3 of torch shadow stories',
  'step-torch-4.webp': 'Step 4 of torch shadow stories',
};

export const lockDate = 'Monday 19 October';

/* ======================================================================
   Lanes C, D and E. Copy from the Mid-fi V2 frames; "invented" values are
   listed in the README.
   ====================================================================== */

// Place details. Merged onto the place records above so every screen shares one source.
const placeDetails = {
  'lumbini-gardens': {
    area: 'Hebbal', description: 'Water play, boating, open lawns', travelMin: 25, stayHours: 4, distanceKm: 11.4,
    costForThree: 420, costNote: 'outside food allowed', costLine: 'Rs 420 incl. boat ride', food: 'Outside food allowed',
    napFit: 'Back by her 1pm nap', bothIn: true, ordinary: false, openSunday: true, interests: ['Water'],
    fitLine: '{child}: water and open space. You: outdoors, shade to sit in, no long drive. Adults take part rather than watch.',
    shortLine: 'water play', contact: 'Park office 080 2345 6789',
    groundTruth: {
      items: [
        { label: 'Crowd', value: 'Quiet before 9am, busy after 11', when: '3 days ago' },
        { label: 'Washroom', value: 'Clean, one changing shelf', when: '3 days ago' },
        { label: 'Would bring a toddler again', value: 'Yes, 11 of 12 parents', when: '' },
      ],
      watchOut: 'The far gate has no ramp. Take the main gate with a pram.',
      photos: ['3 days ago', '1 wk ago', '2 wks ago'],
    },
    plan: [
      { time: '7:15', title: 'Feed her before you leave', note: 'She will not last the drive otherwise' },
      { time: '7:45', title: 'Leave home', note: '25 min, light traffic on Sunday' },
      { time: '8:10', title: 'Arrive, boating first', note: 'Quiet before 9am' },
      { time: '10:30', title: 'Snack on the lawn', note: 'Outside food allowed' },
      { time: '11:45', title: 'Head back', note: 'Dinner stop at Tharavadu optional' },
      { time: '12:30', title: 'Home, nap at 1pm', note: 'Window protected' },
    ],
  },
  'butterfly-park': {
    area: 'Bannerghatta', description: 'Animals, shaded walkways', travelMin: 45, stayHours: 2, distanceKm: 24,
    costForThree: 700, costNote: 'canteen only', costLine: 'Rs 700 for three', food: 'Canteen only',
    napFit: 'Back by her 1pm nap', bothIn: true, ordinary: false, openSunday: false, interests: ['Animals'],
    closedNote: 'Reported by two parents yesterday. Maintenance until 28 Oct.',
    fitLine: '{child}: animals, shade the whole way. You: shaded walkways, a short loop.',
    shortLine: 'shaded', boardMeta: '45 min · Rs 700 for three · shaded', contact: 'Park office', listName: 'Butterfly Park',
  },
  'nursery-8th-main': {
    displayName: 'Nursery on 8th Main', area: 'Hebbal', description: 'Ordinary place', travelMin: 6, stayHours: 1, distanceKm: 1.2,
    costForThree: 0, costNote: '', food: '', bothIn: true, ordinary: true, openSunday: true, interests: ['Soil and plants'],
    openTill: 'Open till 7pm', thingsCount: 4,
    kitIntro: 'An ordinary place. Nothing to prepare, 6 minutes away, and outdoors.',
    thingsToDo: [
      { title: 'Find three green vegetables', detail: 'She names each one. 10 min.', icon: 'nutrition', tag: 'leaf' },
      { title: 'Touch five different leaves', detail: 'Rough, soft, waxy, furry, spiky.', icon: 'eco', tag: 'leaf' },
      { title: 'Pick one plant to take home', detail: 'She chooses, she waters it.', icon: 'potted_plant', tag: 'marigold' },
      { title: 'Count the pots in one row', detail: 'Numbers without a worksheet.', icon: 'tag', tag: 'sky' },
    ],
  },
  'cubbon-park-bandstand': {
    area: 'MG Road, Bengaluru', description: 'Rain trees, open lawns, a bandstand', travelMin: 20, stayHours: 2, distanceKm: 6,
    costForThree: 0, costNote: 'outside food allowed', costLine: 'Free', food: 'Outside food allowed',
    napFit: 'Back by her 1pm nap', bothIn: true, ordinary: false, openSunday: true, interests: ['Soil and plants', 'Running about'],
    fitLine: '{child}: leaves, open space to run. You: outdoors, free, close by.',
    shortLine: 'leaves and lawns', contact: 'No tickets needed',
  },
  'zoo-animal-section': {
    area: 'Bannerghatta', description: 'Animals, lots of walking', travelMin: 45, stayHours: 3, distanceKm: 24,
    costForThree: 560, costNote: 'canteen only', costLine: 'Rs 560 for three', food: 'Canteen only',
    napFit: 'Back by her 1pm nap', bothIn: true, ordinary: false, openSunday: true, interests: ['Animals'],
    fitLine: '{child}: animals up close. You: a pram-friendly path, lots of walking.',
    shortLine: 'animals', boardMeta: '45 min · Rs 560 · lots of walking', contact: 'Zoo office',
  },
  'petting-farm': {
    area: 'Kanakapura Road', description: 'Goats, rabbits, feeding time', travelMin: 60, stayHours: 3, distanceKm: 32,
    costForThree: 1200, costNote: 'snacks on site', costLine: 'Rs 1200 for three', food: 'Snacks on site',
    napFit: 'Naps in the car on the way back', bothIn: true, ordinary: false, openSunday: true, interests: ['Animals'],
    fitLine: '{child}: she can feed them. You: a day out, nothing to plan.',
    shortLine: 'she can feed them', boardMeta: '1 hr · Rs 1200 · she can feed them', contact: 'Farm office',
  },
  'pottery-studio': {
    area: 'Indiranagar', description: 'Clay, wheels, a small kids table', travelMin: 30, stayHours: 2, distanceKm: 12,
    costForThree: 900, costNote: 'cafe next door', costLine: 'Rs 900 for three', food: 'Cafe next door',
    napFit: 'Back by her 1pm nap', bothIn: true, ordinary: false, openSunday: true, interests: ['Messy art'],
    fitLine: '{child}: hands in clay. You: both of you make something.',
    shortLine: 'messy, both of you in', contact: 'Studio desk',
  },
  'park-end-of-road': {
    area: 'Your road', description: 'Ordinary place', travelMin: 4, stayHours: 1, distanceKm: 0.3,
    costForThree: 0, costNote: '', food: '', bothIn: true, ordinary: true, openSunday: true, interests: ['Running about'],
    openTill: 'Open all day', thingsCount: 1,
    kitIntro: 'Ordinary, and 4 minutes away. Free.',
    thingsToDo: [
      { title: 'Take a leaf bag and find five different shapes', detail: 'She collects, you name the shapes.', icon: 'eco', tag: 'leaf' },
    ],
  },
};
const placeRank = { 'lumbini-gardens': 1, 'butterfly-park': 2, 'zoo-animal-section': 3, 'cubbon-park-bandstand': 4, 'pottery-studio': 5, 'petting-farm': 6 };
placeDetails['butterfly-park'].alternatives = ['lumbini-gardens', 'zoo-animal-section'];
Object.keys(placeRank).forEach((id) => { placeDetails[id].rank = placeRank[id]; });
Object.entries(placeDetails).forEach(([id, d]) => Object.assign(places.find((p) => p.id === id), d));

// Ordinary place that has no illustration, by design (E1).
export const metroPlace = {
  id: 'metro', name: 'The metro, any line', line: 'Counting stations, colours', fallback: { tag: 'sky', icon: 'train' },
};

// C2, C3. Time and energy steps are inferred (see README).
export const outingTimeOptions = [
  { id: 'couple', title: 'A couple of hours', label: 'a couple of hours', row: 'A couple of hours' },
  { id: 'half', title: 'Half a day', label: 'half a day', row: 'Half a day' },
  { id: 'day', title: 'The whole day', label: 'the whole day', row: 'The whole day' },
];
export const outingDistanceOptions = [
  { id: 'walk', title: 'Walking distance', sub: 'Under 10 minutes', max: 10, label: 'Walking distance', row: 'Walking distance, under 10 min' },
  { id: 'short', title: 'Short drive', sub: 'Up to 30 minutes', max: 30, label: 'Short drive', row: 'Short drive, up to 30 min' },
  { id: 'worth', title: 'Worth a drive', sub: 'Up to an hour', max: 60, label: 'Worth a drive', row: 'Worth a drive, up to an hour' },
  { id: 'day', title: 'Making a day of it', sub: 'Anything goes', max: Infinity, label: 'Making a day of it', row: 'Making a day of it' },
];
export const outingEnergyOptions = [
  { id: 'easy', title: 'Taking it easy', row: 'Taking it easy' },
  { id: 'up', title: 'We are up for it', row: 'We are up for it' },
  { id: 'bring', title: 'Bring it on', row: 'Bring it on' },
];
export const outingWhoOptions = [
  { id: 'me', title: 'Me and {child}', row: 'Just you two', label: 'just you two' },
  { id: 'all', title: 'All three of us', row: 'All three of us', label: 'all three of you' },
  { id: 'grand', title: 'With grandparents', row: 'With grandparents', label: 'with grandparents' },
];
export const outingDefaults = { time: 'half', distance: 'short', energy: 'up', who: 'all' };

// C8
export const questionTopics = ['Shade', 'Food', 'Washrooms', 'Pram access'];
// C10
export const shareParts = [
  { id: 'food', label: 'Packs food and water', on: true },
  { id: 'there', label: 'Drives there', on: true },
  { id: 'back', label: 'Drives back', on: false },
  { id: 'pram', label: 'Carries the pram', on: false },
];
// C14
export const outingWorked = ['Food was fine', 'Both of us got in', 'Low crowd', 'She loved the water', 'Easy parking'];
export const helpParents = [
  { id: 'crowd', label: 'Crowd', options: ['Quiet', 'Okay', 'Busy'] },
  { id: 'washroom', label: 'Washroom', options: ['Clean', 'Okay', 'Not great'] },
  { id: 'again', label: 'Would bring a toddler again', options: ['Yes', 'No'] },
];

// D3
export const reelTags = ['Animals', 'Outdoor', 'Free', 'Both of us', 'Morning', 'Birthday idea'];
export const reels = {
  1: {
    placeId: 'cubbon-park-bandstand', placeLine: 'MG Road, Bengaluru · from the location tag',
    tags: ['Animals', 'Outdoor', 'Free'], fit: '6 km · free · outside food allowed · both parents in',
    checks: ['done', 'done', 'done', 'done'],
  },
  2: {
    placeId: null, caption: 'That mud play place near Sarjapur?',
    checks: ['done', 'done', 'done', 'none'],
  },
};
export const reelChecks = ['Caption', 'Audio', 'On-screen text', 'Location tag'];

// D7, D8
export const seedOccasion = {
  id: 'aanya-4th', title: '{child}’s 4th', dateLine: '8 November · 3 weeks away', date: '2026-11-08',
  intro: 'Matched to animals, which she still asks about every day.',
  candidates: ['butterfly-park', 'zoo-animal-section', 'petting-farm'],
  shortlist: ['butterfly-park', 'zoo-animal-section'],
  votes: { gautam: 'butterfly-park', amma: 'butterfly-park' },
  sent: false,
};

// E1
export const interestTiles = [
  { id: 'Animals', file: 'interest-animals.webp', fallback: { tag: 'pink', icon: 'pets' } },
  { id: 'Water', file: 'interest-water.webp', fallback: { tag: 'sky', icon: 'water_drop' } },
  { id: 'Soil and plants', file: 'interest-soil-plants.webp', fallback: { tag: 'leaf', icon: 'potted_plant' } },
  { id: 'Running about', file: 'interest-running.webp', fallback: { tag: 'marigold', icon: 'directions_run' } },
];
export const kindTiles = [
  { id: 'sitting', title: 'Sitting down', count: '42 ideas', fallback: { tag: 'marigold', icon: 'chair' } },
  { id: 'floor', title: 'On the floor', count: '68 ideas', fallback: { tag: 'pink', icon: 'child_care' } },
  { id: 'up', title: 'Up and about', count: '31 ideas', fallback: { tag: 'leaf', icon: 'directions_run' } },
  { id: 'out', title: 'Out of the house', count: '54 places', fallback: { tag: 'sky', icon: 'explore' } },
];
// E2: per-interest "this week, nearby" item. Animals is verbatim from the mid-fi.
export const interestNearby = {
  Animals: { placeId: 'nursery-8th-main', title: 'The fish tank at the nursery', meta: '6 min · free · 15 min there' },
  Water: { placeId: 'park-end-of-road', title: 'Puddles at the park on your road', meta: '4 min · free · 20 min there' },
  'Soil and plants': { placeId: 'nursery-8th-main', title: 'Nursery on 8th Main', meta: '6 min · free · 4 things to do' },
  'Running about': { placeId: 'park-end-of-road', title: 'The park at the end of your road', meta: '4 min · free · open all day' },
};

// E3, E8 learned lines.
export const seedChildLearned = [
  { id: 'l1', text: 'Settles for about 10 minutes', source: 'from 9 activities' },
  { id: 'l2', text: 'Prefers sitting-down play on weeknights', source: 'from 6 evenings' },
  { id: 'l3', text: 'Not keen on messy art', source: 'you said not for her, 3 times' },
];
export const seedAdultLearned = [
  { id: 'p1', text: 'You skip floor-level ideas on weeknights', source: 'from 7 evenings' },
  { id: 'p2', text: 'Weekends you take the outdoor option', source: 'from 5 outings' },
  { id: 'p3', text: 'Two-adult ideas only land on Fridays', source: 'from 4 accepts' },
];

// E4
export const slotOptions = [
  { id: 'Saturday morning', title: 'Saturday morning' },
  { id: 'Sunday morning', title: 'Sunday morning' },
  { id: 'Sunday evening', title: 'Sunday evening' },
];

// D5 rows and Home saves. Extends the seed saves with their Want to try lines.
export const saveExtras = {
  's-cubbon': { wantRank: 1, sourceLine: 'Place · from a reel, 2 days ago', wantMeta: '6 km · free · both of you in' },
  's-dal': { wantRank: 2, sourceLine: 'Idea · from a reel, 3 weeks ago', wantMeta: '15 min · on the floor · uses dal' },
  's-zoo': { wantRank: null, sourceLine: 'Idea · saved in the app, 2 weeks ago', wantMeta: '15 min · sitting down · no prep' },
};
export const extraSaves = [
  { id: 's-butterfly', kind: 'place', refKind: 'place', refId: 'butterfly-park', source: 'search', savedAt: '2026-09-20', meta: '45 min · Rs 700 for three', tags: [],
    onHome: false, wantRank: 3, sourceLine: 'Place · searched, last month', wantMeta: '45 min · Rs 700 for three' },
  { id: 's-claytopia', kind: 'place', refKind: 'place', refId: 'pottery-studio', source: 'instagram', savedAt: '2026-09-18', meta: '12 km · Rs 900 · both of you in', tags: [],
    onHome: false, wantRank: 4, sourceLine: 'Place · from a reel, last month', wantMeta: '12 km · Rs 900 · both of you in' },
];
export const savedCountLine = '14 saved · 9 from Instagram';

// C1 / D6 regular tiles show the place regulars with a short twist.
export const shortTwists = { 'cubbon-park-bandstand': 'Twist: leaf hunt', 'nursery-8th-main': 'Twist: green hunt' };

// Lane C/D/E screens use the mid-fi name where it differs from the B14 row.
export function placeName(p) { return p.displayName || p.name; }
export function listName(p) { return p.listName || placeName(p); }
