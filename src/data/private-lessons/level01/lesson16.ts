import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/16/${slug}.jpg`

export const lesson16: Unit = {
  id: 116,
  slug: 'l1-places-directions',
  emoji: '🗺️',
  level: 'A0 – A1',
  title: { en: 'Places in Town & Giving Directions', ar: 'الأماكن في المدينة وإعطاء الاتجاهات' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'الأماكن في المدينة',
      items: [
        { en: 'Bank', ar: 'البنك', examples: ['The bank is on the right.', 'I go to the bank on Monday.'], tint: 'emerald', image: LOCAL('bank') },
        { en: 'Hospital', ar: 'المستشفى', examples: ['The hospital is near the park.', 'My mother works at the hospital.'], tint: 'rose', image: LOCAL('hospital') },
        { en: 'Mosque', ar: 'المسجد', examples: ['The mosque is next to the school.', 'We go to the mosque on Friday.'], tint: 'teal', image: LOCAL('mosque') },
        { en: 'Bakery', ar: 'المخبزة', examples: ['I buy bread from the bakery.', 'The bakery is open in the morning.'], tint: 'amber', image: LOCAL('bakery') },
        { en: 'Supermarket', ar: 'السوبرماركت', examples: ['The supermarket is on the left.', 'We buy food at the supermarket.'], tint: 'sky', image: LOCAL('supermarket') },
        { en: 'School', ar: 'المدرسة', examples: ['The school is near my house.', 'She goes to school every day.'], tint: 'sky', image: LOCAL('school') },
        { en: 'Park', ar: 'الحديقة', examples: ['I go to the park on Sunday.', 'The park is next to the library.'], tint: 'emerald', image: LOCAL('park') },
        { en: 'Pharmacy', ar: 'الصيدلية', examples: ['The pharmacy is next to the bakery.', 'I buy medicine at the pharmacy.'], tint: 'rose', image: LOCAL('pharmacy') },
        { en: 'Gas station', ar: 'محطة الوقود', examples: ['The gas station is on the right.', 'I fill up at the gas station.'], tint: 'orange', image: LOCAL('gas-station') },
        { en: 'Post office', ar: 'مكتب البريد', examples: ['The post office is on the left.', 'I send letters from the post office.'], tint: 'violet', image: LOCAL('post-office') },
        { en: 'Police station', ar: 'مركز الشرطة', examples: ['The police station is next to the bank.'], tint: 'amber', image: LOCAL('police-station') },
        { en: 'Bus station', ar: 'محطة الحافلات', examples: ['The bus station is near the hotel.', 'I wait at the bus station.'], tint: 'sky', image: LOCAL('bus-station') },
        { en: 'Library', ar: 'المكتبة', examples: ['The library is quiet and clean.', 'I read books at the library.'], tint: 'violet', image: LOCAL('library') },
        { en: 'Hotel', ar: 'الفندق', examples: ['The hotel is next to the library.', 'He stays at the hotel.'], tint: 'amber', image: LOCAL('hotel') },
        { en: 'Cinema', ar: 'السينما', examples: ['The cinema is on the right.', 'We go to the cinema on Saturday.'], tint: 'rose', image: LOCAL('cinema') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'كيف تعطي الاتجاهات',
      patterns: [
        {
          template: 'Go straight.',
          templateAr: 'اذهب مباشرة.',
          examples: ['Go straight down this street.', 'Go straight for two minutes.'],
        },
        {
          template: 'Turn right. / Turn left.',
          templateAr: 'انعطف يميناً. / انعطف يساراً.',
          examples: ['Turn right at the roundabout.', 'Turn left at the traffic lights.'],
        },
        {
          template: 'At the roundabout / At the traffic lights',
          templateAr: 'عند الدوار / عند إشارات المرور',
          examples: ['Turn right at the roundabout.', 'Go straight at the traffic lights.'],
        },
        {
          template: 'Excuse me, where is the ___?',
          templateAr: 'عذراً، أين ___؟',
          examples: [
            'Excuse me, where is the pharmacy? — Go straight and turn left.',
            'Where is the bus station? — It is next to the hotel.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Ahmed & Mona — asking for directions in town',
      lines: [
        { speaker: 'Ahmed', text: 'Excuse me — I am looking for the pharmacy.' },
        { speaker: 'Mona',  text: 'Go straight, then turn right.' },
        { speaker: 'Ahmed', text: 'Turn right — and then?' },
        { speaker: 'Mona',  text: 'The pharmacy is on the left, next to the bakery.' },
        { speaker: 'Ahmed', text: 'Perfect. And the bus station — is it far?' },
        { speaker: 'Mona',  text: 'Not far. Go straight and turn left. It is next to the hotel.' },
        { speaker: 'Ahmed', text: 'Is there a bank near the bus station?' },
        { speaker: 'Mona',  text: 'Yes — the bank is in front of the park.' },
        { speaker: 'Ahmed', text: 'Great. You know this area well!' },
        { speaker: 'Mona',  text: 'I live here. Thank you — have a good day!' },
        { speaker: 'Ahmed', text: 'You too. Thank you!' },
      ],
    },
  ],
}
