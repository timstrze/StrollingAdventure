export interface VisitPhoto {
  src: string;
  alt: string;
}

export interface SchoolVisit {
  slug: string;
  school: string;
  date: string;
  blurb: string;
  photos: VisitPhoto[];
}

const YORKTOWN_DIR = 'school-visits/yorktownelementary';

export const SCHOOL_VISITS: SchoolVisit[] = [
  {
    slug: 'yorktown-elementary',
    school: 'Yorktown Elementary',
    date: 'June 2026',
    blurb:
      'Gloria Taylor Crone and illustrator Brandy Taylor Strzelecki visited a Yorktown Elementary classroom to share Strolling Adventure — reading the book, singing the songs, and playing guitar with the students.',
    photos: [
      {
        src: `${YORKTOWN_DIR}/IMG_0688.webp`,
        alt: 'Brandy Taylor Strzelecki speaks to the class while Gloria Taylor Crone accompanies on guitar',
      },
      {
        src: `${YORKTOWN_DIR}/IMG_0693.webp`,
        alt: 'Students sit on the classroom rug watching a Strolling Adventure page on the projector',
      },
      {
        src: `${YORKTOWN_DIR}/IMG_0694.webp`,
        alt: 'Gloria Taylor Crone talks with students after playing guitar, with Brandy Taylor Strzelecki looking on',
      },
      {
        src: `${YORKTOWN_DIR}/IMG_0696.webp`,
        alt: 'Gloria Taylor Crone and Brandy Taylor Strzelecki with a student holding a copy of Strolling Adventure',
      },
    ],
  },
];

export const SCHOOL_VISITS_TEASER =
  SCHOOL_VISITS[0].photos.find((photo) => photo.src.endsWith('IMG_0688.webp')) ??
  SCHOOL_VISITS[0].photos[0];
