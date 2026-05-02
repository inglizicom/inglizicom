import type { Unit } from '../types'

export const read12: Unit = {
  id: 212,
  slug: 'r-two-friends',
  emoji: '👫',
  level: 'A0',
  title: { en: 'Two Friends', ar: 'صديقان' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'Two Friends',
      text:
        'Hamza and Ali are two friends. They live in the same city — Casablanca. They go to the same school, but they are very different.\n\n' +
        'Hamza is tall and slim. He is twenty years old. He is from Morocco and he is Moroccan. He is a student. He studies English and French. He is single.\n\n' +
        'Ali is shorter than Hamza. He is twenty-two years old. He is from Egypt. He is Egyptian. He is also a student, but he studies computer science. He is engaged.\n\n' +
        'Hamza loves reading and drawing. He reads every night. He draws people and buildings. He can speak three languages — Arabic, French, and English.\n\n' +
        'Ali loves football and music. He plays football every Saturday. He also plays guitar. He cannot draw, but he can cook very well.\n\n' +
        'Every morning they go to school together by bus. They sit next to each other in class. After school, they go to a café and drink tea.\n\n' +
        'They are different — but good friends. They say: "Different people make the best friends."',
      translations: {
        friends: 'أصدقاء',
        same: 'نفس',
        different: 'مختلف',
        tall: 'طويل',
        slim: 'نحيف',
        student: 'طالب',
        studies: 'يدرس',
        single: 'أعزب',
        shorter: 'أقصر',
        engaged: 'مخطوب',
        computer: 'حاسوب',
        science: 'علوم',
        loves: 'يحب',
        buildings: 'مباني',
        speak: 'يتحدث',
        languages: 'لغات',
        music: 'موسيقى',
        plays: 'يلعب / يعزف',
        guitar: 'الغيتار',
        cannot: 'لا يستطيع',
        cook: 'يطبخ',
        morning: 'الصباح',
        together: 'معاً',
        sit: 'يجلسان',
        café: 'مقهى',
        drink: 'يشربان',
        best: 'الأفضل',
        people: 'ناس',
        make: 'يجعل',
      },
      vocab: [
        { word: 'slim', ar: 'نحيف', note: 'adjective' },
        { word: 'engaged', ar: 'مخطوب', note: 'adjective' },
        { word: 'computer science', ar: 'علوم الحاسوب', note: 'noun' },
        { word: 'guitar', ar: 'الغيتار', note: 'noun' },
        { word: 'together', ar: 'معاً', note: 'adverb' },
        { word: 'languages', ar: 'لغات', note: 'noun — plural of language' },
        { word: 'buildings', ar: 'مباني', note: 'noun — plural of building' },
        { word: 'different', ar: 'مختلف', note: 'adjective' },
        { word: 'same', ar: 'نفس', note: 'adjective' },
        { word: 'best', ar: 'الأفضل', note: 'superlative adjective' },
      ],
      blanks: [
        { before: 'Hamza and Ali go to the', after: 'school.', answer: 'same', options: ['same', 'different', 'big', 'small'] },
        { before: 'Hamza is a student. He studies English and', after: '.', answer: 'French', options: ['French', 'Arabic', 'Spanish', 'German'] },
        { before: 'Ali is', after: '— he has a girlfriend.', answer: 'engaged', options: ['engaged', 'married', 'single', 'divorced'] },
        { before: 'Hamza can speak', after: 'languages.', answer: 'three', options: ['three', 'two', 'four', 'one'] },
        { before: 'Ali plays football and also plays', after: '.', answer: 'guitar', options: ['guitar', 'piano', 'football', 'chess'] },
        { before: 'After school they go to a café and drink', after: '.', answer: 'tea', options: ['tea', 'coffee', 'milk', 'juice'] },
      ],
    },
  ],
}
