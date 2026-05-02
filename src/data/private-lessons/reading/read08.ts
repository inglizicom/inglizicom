import type { Unit } from '../types'

export const read08: Unit = {
  id: 208,
  slug: 'r-my-job',
  emoji: '💼',
  level: 'A0',
  title: { en: 'My Job', ar: 'وظيفتي' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'My Job',
      text:
        'My name is Omar. I am a driver. I drive a taxi in Casablanca.\n\n' +
        'I can drive very well. I can drive a car, a taxi, and a bus. I cannot fly an airplane — but I love to watch them in the sky.\n\n' +
        'I work every day from Monday to Saturday. I start work at six in the morning and I finish at six in the evening. It is a long day, but I like my job.\n\n' +
        'I meet many people every day. Some people are friendly and some people are rude. But most people are nice.\n\n' +
        'I know Casablanca very well. I can go to every street in the city. I know where the hospital is, where the schools are, and where the big hotels are.\n\n' +
        'My wife is a teacher. She cannot drive. I drive her to school every morning. She teaches English to children.\n\n' +
        'We are a good team. She teaches — I drive.',
      translations: {
        driver: 'سائق',
        drive: 'أقود / يقود',
        taxi: 'تاكسي',
        can: 'أستطيع / يستطيع',
        cannot: 'لا أستطيع',
        fly: 'يطير',
        airplane: 'طائرة',
        sky: 'السماء',
        work: 'أعمل',
        start: 'أبدأ',
        finish: 'أنتهي',
        long: 'طويل',
        meet: 'أقابل',
        people: 'ناس / أشخاص',
        friendly: 'ودود',
        rude: 'وقح',
        most: 'معظم',
        nice: 'لطيف',
        know: 'أعرف',
        street: 'شارع',
        city: 'مدينة',
        hospital: 'مستشفى',
        hotels: 'فنادق',
        wife: 'الزوجة',
        teacher: 'معلمة',
        school: 'مدرسة',
        children: 'أطفال',
        team: 'فريق',
        teaches: 'تعلّم',
        morning: 'الصباح',
      },
      vocab: [
        { word: 'driver', ar: 'سائق', note: 'noun' },
        { word: 'can', ar: 'يستطيع', note: 'modal verb' },
        { word: 'cannot', ar: 'لا يستطيع', note: 'modal verb (negative)' },
        { word: 'meet', ar: 'يقابل / يلتقي', note: 'verb' },
        { word: 'rude', ar: 'وقح / غير مؤدب', note: 'adjective' },
        { word: 'most', ar: 'معظم', note: 'determiner' },
        { word: 'team', ar: 'فريق', note: 'noun' },
        { word: 'sky', ar: 'السماء', note: 'noun' },
        { word: 'finish', ar: 'ينتهي / يكمل', note: 'verb' },
        { word: 'street', ar: 'شارع', note: 'noun' },
      ],
      blanks: [
        { before: 'Omar is a', after: '. He drives a taxi.', answer: 'driver', options: ['driver', 'teacher', 'doctor', 'pilot'] },
        { before: 'He', after: 'drive a car, a taxi, and a bus.', answer: 'can', options: ['can', 'cannot', 'must', 'want'] },
        { before: 'He', after: 'fly an airplane.', answer: 'cannot', options: ['cannot', 'can', 'does', 'is'] },
        { before: 'He works from Monday to', after: '.', answer: 'Saturday', options: ['Saturday', 'Sunday', 'Friday', 'Thursday'] },
        { before: 'Some people are friendly and some people are', after: '.', answer: 'rude', options: ['rude', 'smart', 'tall', 'young'] },
        { before: 'His wife is a', after: '. She teaches English.', answer: 'teacher', options: ['teacher', 'nurse', 'doctor', 'student'] },
      ],
    },
  ],
}
