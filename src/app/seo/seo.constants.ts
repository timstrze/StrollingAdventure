export const SITE_URL = 'https://www.strollingadventure.com';

export const DEFAULT_TITLE =
  "Strolling Adventure | GiGi's Strolling Adventure — Children's Book by Gloria Taylor Crone";

export const DEFAULT_DESCRIPTION =
  "Strolling Adventure is a Christian children's book by Gloria Taylor Crone — a nature walk through Yorktown, Virginia with music, colors, numbers, and free printable activities.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/cover-spread.png`;

export const BOOK_ISBN = '9798868529849';

export const YOUTUBE_PLAYLIST_URL =
  'https://www.youtube.com/playlist?list=PLt19BAoeWJUhpNJcucOF38sQrbEyTuOMd';

export const BOOK_OFFERS = [
  {
    name: 'Barnes & Noble',
    url: 'https://www.barnesandnoble.com/w/strolling-adventure-gloria-taylor-crone/1150109647?ean=9798868529849',
  },
  {
    name: 'Amazon',
    url: 'https://www.amazon.com/Strolling-Adventure-Gloria-Taylor-Crone/dp/B0GZSG2LFR',
  },
  {
    name: 'Xulon Press',
    url: 'https://bookstore.xulonpress.com/bookdetail.php?PB_ISBN=9798868529849&HC_ISBN=9798868529856',
  },
];

export interface SeoConfig {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
}

export const BOOK_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'Strolling Adventure',
  alternateName: "GiGi's Strolling Adventure",
  author: {
    '@type': 'Person',
    name: 'Gloria Taylor Crone',
  },
  isbn: BOOK_ISBN,
  image: DEFAULT_OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  genre: ["Children's literature", 'Christian fiction', 'Nature'],
  inLanguage: 'en',
  offers: BOOK_OFFERS.map((o) => ({
    '@type': 'Offer',
    name: o.name,
    url: o.url,
    availability: 'https://schema.org/InStock',
  })),
};
