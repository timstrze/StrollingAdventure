export interface LearnTopic {
  slug: string;
  title: string;
  description: string;
  paragraphs: string[];
  inBook: string;
  source?: { label: string; url: string };
  cta: { label: string; route: string };
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: 'sun',
    title: 'The Sun over Yorktown Beach',
    description:
      'Learn about the sun rising over the York River at Yorktown Beach — featured in Strolling Adventure, a children\'s book set in Yorktown, Virginia.',
    paragraphs: [
      'Rising east over the York River at Yorktown Beach, the sun is a hot glowing ball of hydrogen and helium, about 93 million miles from Earth. Life on our planet could not exist without our 4.6-billion-year-old yellow dwarf star.',
      'In Strolling Adventure, the opening song celebrates the sun shining bright and warm as it rises after dawn — a perfect moment to share with a little one on a morning stroll.',
    ],
    inBook: 'The sun shines bright and warm, as it rises after dawn.',
    source: { label: 'NASA Science — Our Sun', url: 'https://science.nasa.gov/sun/facts/' },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'trees',
    title: 'Green Leaves on the Trees',
    description:
      'Discover crepe myrtle trees and green leaves along Yorktown strolls — nature themes from Strolling Adventure by Gloria Taylor Crone.',
    paragraphs: [
      'Beautiful flowering crepe myrtle trees come in various colors, making them a stunning addition to many residential yards in Virginia. They are a popular choice for local birds to nest throughout the warm months.',
      'The book reminds us that God made you and everything — and the leaves on the trees are green, a simple joy for young children learning colors on a walk outdoors.',
    ],
    inBook: 'The leaves on the trees are green; God made you and everything.',
    source: {
      label: 'Virginia Native Plant Society',
      url: 'https://www.dcr.virginia.gov/natural-heritage/invspinfo',
    },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'clouds',
    title: 'Clouds and Kites at Yorktown Battlefield',
    description:
      'Clouds, kites, and history at Yorktown Battlefield — explore nature and American history from Strolling Adventure.',
    paragraphs: [
      'On a clear windy day with few clouds in the sky, it is fun to fly a kite near the sacred grounds of the Yorktown Battlefield. This final, crucial battle of the Revolutionary War assured independence and the birth of a new nation.',
      'In the book, clouds float in the sky — and one day, you will fly a kite so high. It is a gentle invitation to look up and dream during everyday strolls.',
    ],
    inBook: 'Clouds float in the sky; one day, you\'ll fly a kite so high.',
    source: {
      label: 'Colonial National Historical Park (Yorktown Battlefield)',
      url: 'https://www.visitwilliamsburg.com/listing/colonial-nhp-yorktown-battlefield/5050/',
    },
    cta: { label: 'Play the maze', route: '/maze' },
  },
  {
    slug: 'squirrels',
    title: 'Squirrels at Play',
    description:
      'Eastern gray squirrels in Yorktown, Virginia — a playful nature topic from the children\'s book Strolling Adventure.',
    paragraphs: [
      'Eastern gray squirrels are adept at survival. They possess an excellent sense of smell, which is a key tool for locating the food they have carefully hidden away during the autumn months to sustain them through the winter.',
      'See squirrels play and run — they climb up trees, oh, what great fun! Watching squirrels is one of the simple delights of a neighborhood stroll with a child.',
    ],
    inBook: 'See squirrels play and run; they climb up trees — oh, what great fun!',
    source: { label: 'Virginia Living Museum — Mammals', url: 'https://thevlm.org/animals/' },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'birds',
    title: 'Birds That Sing — Northern Cardinal',
    description:
      'The Northern cardinal, Virginia\'s state bird, sings in Strolling Adventure — a Christian children\'s nature book set in Yorktown.',
    paragraphs: [
      'The Northern cardinal is the official Virginia state bird. These beautiful songbirds frequent wooded and residential areas. The male is particularly recognizable by his vibrant red color.',
      'Hear birds sing their song — they sing to you as we stroll along. Birdwatching is a wonderful way to connect children with the natural world on a daily walk.',
    ],
    inBook: 'Hear birds sing their song; they sing to you as we stroll along.',
    source: {
      label: 'Audubon Society — Northern Cardinal',
      url: 'https://www.audubon.org/field-guide/bird/northern-cardinal',
    },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'honeybees',
    title: 'Honeybees Go Buzz Buzz',
    description:
      'Virginia\'s state pollinator, the European honeybee, buzzes through Strolling Adventure — learn about bees in Yorktown, Virginia.',
    paragraphs: [
      'Virginia\'s official state pollinator is the European honeybee. Honeycombs first arrived in Jamestown in the year 1622, establishing this crucial insect in North America\'s first English-speaking settlement.',
      'Honeybees go BUZZ BUZZ — they work so hard making honey for us. The book celebrates these busy pollinators that children love to spot on summer strolls.',
    ],
    inBook: 'Honeybees go BUZZ BUZZ; they work so hard making honey for us.',
    source: {
      label: 'Jamestown-Yorktown Foundation — Honeybees in 1622',
      url: 'https://localhivehoney.com/blogs/blog/the-american-beekeeping-boom',
    },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'butterflies',
    title: 'Butterflies in Flight',
    description:
      'Eastern Tiger Swallowtail butterflies in Virginia — nature learning from Strolling Adventure by Gloria Taylor Crone.',
    paragraphs: [
      'Fragile, fluffy pink mimosa flowers attract many butterflies, such as the Eastern Tiger Swallowtail, Virginia\'s state insect. Their spectacular outspread wingspan can measure between 3 and 5.5 inches across.',
      'See the butterflies — they spread their wings when they take flight. A fluttering butterfly is often the highlight of a child\'s outdoor adventure.',
    ],
    inBook: 'See the butterflies; they spread their wings when they take flight.',
    source: {
      label: 'Virginia — Eastern Tiger Swallowtail',
      url: 'https://www.pwconserve.org/wildlife/butterflies/tigerswallowtail.htm',
    },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'flowers',
    title: 'Pretty Flowers — Purple Coneflowers',
    description:
      'Purple coneflowers and Virginia wildflowers — flower themes from Strolling Adventure, set in Yorktown gardens.',
    paragraphs: [
      'A powerful magnet for pollinators, purple coneflowers (Echinacea) are among Virginia\'s most beautiful native wildflowers. They are known for their distinctive shape and are a colorful sight in Yorktown gardens during the summer and fall.',
      'See the pretty flowers — they grow and grow with April showers. Spring and summer walks offer endless opportunities to notice blooms along the path.',
    ],
    inBook: 'See the pretty flowers; they grow and grow with April showers.',
    source: { label: 'Virginia Native Plant Society', url: 'http://vaplantatlas.org/' },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'pinecones',
    title: 'Pinecones on the Ground',
    description:
      'Pinecones and Virginia evergreens — a nature topic from Strolling Adventure for curious young explorers.',
    paragraphs: [
      'In autumn, pinecones fall from the pine tree, Virginia\'s most abundant evergreen. Their main and critical function is to keep the trees\' seeds safe until conditions are just right for new growth to begin and sprout.',
      'Find pinecones on the ground — they grow on trees and then fall down. Collecting pinecones is a classic outdoor activity for children on a stroll through the neighborhood.',
    ],
    inBook: 'Find pinecones on the ground; they grow on trees and then fall down.',
    source: { label: 'Virginia Department of Forestry', url: 'https://dof.virginia.gov/evergreens-ever-useful/' },
    cta: { label: 'Try the word search', route: '/wordsearch' },
  },
  {
    slug: 'friends',
    title: 'Friends Along the Way',
    description:
      'Community and friendship on Yorktown strolls — a heartwarming theme from Strolling Adventure by Gloria Taylor Crone.',
    paragraphs: [
      'Strolling Adventure was inspired by daily walks in a caring Yorktown community. Neighbors share thoughtful conversation and warm smiles along the local paths — a reminder that friendship is part of every adventure.',
      'Friends along the way say, "How are you? Have a nice day." The book celebrates the people who make a neighborhood feel like home.',
    ],
    inBook: 'Friends along the way say, "How are you? Have a nice day."',
    cta: { label: 'Read about the book', route: '/about' },
  },
];

export function topicBySlug(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((t) => t.slug === slug);
}

export const LEARN_SLUGS = LEARN_TOPICS.map((t) => t.slug);
