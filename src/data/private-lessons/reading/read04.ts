import type { Unit } from '../types'

export const read04: Unit = {
  id: 204,
  slug: 'r-my-city',
  emoji: '🏙️',
  level: 'A0',
  title: { en: 'My City', ar: 'مدينتي' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'My City',
      text:
        'I live in a city called Fez. It is a beautiful city in Morocco. It is old but very interesting.\n\n' +
        'In my city there are many places. There is a big mosque near my house. There is also a school, a hospital, and a park. The park is next to the school.\n\n' +
        'There is a bakery on my street. I go there every morning to buy bread. The bread is always fresh and good.\n\n' +
        'Near the bakery there is a pharmacy. My mother goes there when we are sick. There is also a supermarket not far from my house. We buy food there every week.\n\n' +
        'To go to school I take the bus. The bus station is five minutes from my house. Sometimes I walk — it is not far.\n\n' +
        'I love my city. It is not the biggest city in Morocco, but it is my home.',
      translations: {
        city: 'مدينة',
        called: 'تسمى',
        fez: 'فاس',
        beautiful: 'جميلة',
        old: 'قديمة',
        interesting: 'مثيرة للاهتمام',
        places: 'أماكن',
        mosque: 'مسجد',
        near: 'قريب من',
        house: 'المنزل',
        school: 'مدرسة',
        hospital: 'مستشفى',
        park: 'حديقة',
        next: 'بجانب',
        bakery: 'مخبزة',
        street: 'الشارع',
        morning: 'الصباح',
        buy: 'أشتري',
        bread: 'خبز',
        fresh: 'طازج',
        pharmacy: 'صيدلية',
        sick: 'مريض',
        supermarket: 'سوبرماركت',
        food: 'طعام',
        week: 'أسبوع',
        bus: 'حافلة',
        station: 'محطة',
        five: 'خمس',
        minutes: 'دقائق',
        sometimes: 'أحياناً',
        walk: 'أمشي',
        far: 'بعيد',
        biggest: 'الأكبر',
        home: 'المنزل / الوطن',
      },
      vocab: [
        { word: 'mosque', ar: 'مسجد', note: 'noun' },
        { word: 'bakery', ar: 'مخبزة', note: 'noun' },
        { word: 'pharmacy', ar: 'صيدلية', note: 'noun' },
        { word: 'supermarket', ar: 'سوبرماركت', note: 'noun' },
        { word: 'fresh', ar: 'طازج', note: 'adjective' },
        { word: 'interesting', ar: 'مثير للاهتمام', note: 'adjective' },
        { word: 'street', ar: 'شارع', note: 'noun' },
        { word: 'station', ar: 'محطة', note: 'noun' },
        { word: 'sometimes', ar: 'أحياناً', note: 'adverb of frequency' },
        { word: 'beautiful', ar: 'جميل', note: 'adjective' },
      ],
      blanks: [
        {
          before: 'Fez is a',
          after: 'city in Morocco.',
          answer: 'beautiful',
          options: ['beautiful', 'small', 'new', 'empty'],
        },
        {
          before: 'There is a big',
          after: 'near his house.',
          answer: 'mosque',
          options: ['mosque', 'school', 'hotel', 'market'],
        },
        {
          before: 'He goes to the bakery to buy',
          after: 'every morning.',
          answer: 'bread',
          options: ['bread', 'milk', 'cheese', 'eggs'],
        },
        {
          before: 'His mother goes to the',
          after: 'when they are sick.',
          answer: 'pharmacy',
          options: ['pharmacy', 'hospital', 'school', 'park'],
        },
        {
          before: 'To go to school he takes the',
          after: '.',
          answer: 'bus',
          options: ['bus', 'train', 'taxi', 'car'],
        },
        {
          before: 'Sometimes he',
          after: '— it is not far.',
          answer: 'walks',
          options: ['walks', 'drives', 'runs', 'rides'],
        },
      ],
    },
  ],
}
