import type { Unit } from '../types'

export const read11: Unit = {
  id: 211,
  slug: 'r-places-in-my-city',
  emoji: '🗺️',
  level: 'A0',
  title: { en: 'Places in My City', ar: 'أماكن في مدينتي' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'Places in My City',
      text:
        'I live in a city called Marrakech. My city has many interesting places.\n\n' +
        'Near my house there is a bakery. I go there every morning. The bread is always fresh. Next to the bakery there is a pharmacy. My mother buys medicine there.\n\n' +
        'There is a big park in my city. The park is next to the school. Children play there every afternoon. There are trees and flowers in the park. It is beautiful.\n\n' +
        'There is a supermarket on my street. I go there with my mother every Saturday. We buy food, drinks, and cleaning products. The supermarket is open every day.\n\n' +
        'There is a hospital not far from my house. My uncle is a doctor there. He works very hard.\n\n' +
        'To go to the city centre I take the bus. The bus station is five minutes from my house. From the bus station, I go straight and then turn left. The city centre is not far.\n\n' +
        'There is also a cinema in my city. I go there on Friday evenings with my friends. We always eat popcorn.\n\n' +
        'I love my city. There is always something to do.',
      translations: {
        marrakech: 'مراكش',
        interesting: 'مثير للاهتمام',
        bakery: 'مخبزة',
        fresh: 'طازج',
        pharmacy: 'صيدلية',
        buys: 'تشتري',
        medicine: 'دواء',
        park: 'حديقة',
        children: 'أطفال',
        play: 'يلعبون',
        afternoon: 'بعد الظهر',
        trees: 'أشجار',
        flowers: 'أزهار',
        beautiful: 'جميل',
        supermarket: 'سوبرماركت',
        cleaning: 'التنظيف',
        products: 'منتجات',
        open: 'مفتوح',
        hospital: 'مستشفى',
        uncle: 'العم / الخال',
        doctor: 'طبيب',
        hard: 'بجد / بصعوبة',
        centre: 'وسط المدينة',
        station: 'محطة',
        straight: 'مباشرة',
        left: 'يسار',
        cinema: 'سينما',
        evenings: 'الأمسيات',
        popcorn: 'فشار',
        something: 'شيء ما',
      },
      vocab: [
        { word: 'bakery', ar: 'مخبزة', note: 'noun' },
        { word: 'pharmacy', ar: 'صيدلية', note: 'noun' },
        { word: 'supermarket', ar: 'سوبرماركت', note: 'noun' },
        { word: 'cinema', ar: 'سينما', note: 'noun' },
        { word: 'city centre', ar: 'وسط المدينة', note: 'noun' },
        { word: 'medicine', ar: 'دواء', note: 'noun' },
        { word: 'fresh', ar: 'طازج', note: 'adjective' },
        { word: 'flowers', ar: 'أزهار', note: 'noun' },
        { word: 'hard', ar: 'بجد / بصعوبة', note: 'adverb' },
        { word: 'popcorn', ar: 'فشار', note: 'noun' },
      ],
      blanks: [
        { before: 'Next to the bakery there is a', after: '.', answer: 'pharmacy', options: ['pharmacy', 'school', 'bank', 'park'] },
        { before: 'The park is next to the', after: '.', answer: 'school', options: ['school', 'hospital', 'cinema', 'bakery'] },
        { before: 'He goes to the supermarket every', after: '.', answer: 'Saturday', options: ['Saturday', 'Monday', 'Friday', 'Sunday'] },
        { before: 'His uncle is a', after: 'at the hospital.', answer: 'doctor', options: ['doctor', 'teacher', 'driver', 'nurse'] },
        { before: 'From the bus station, he goes straight and turns', after: '.', answer: 'left', options: ['left', 'right', 'back', 'up'] },
        { before: 'He goes to the cinema on Friday', after: '.', answer: 'evenings', options: ['evenings', 'mornings', 'afternoons', 'nights'] },
      ],
    },
  ],
}
