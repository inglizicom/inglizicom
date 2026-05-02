import type { Unit } from '../types'

export const read05: Unit = {
  id: 205,
  slug: 'r-my-week',
  emoji: '📅',
  level: 'A0',
  title: { en: 'My Week', ar: 'أسبوعي' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'My Week',
      text:
        'My name is Yassine. Every week is the same for me — but I love it.\n\n' +
        'On Monday and Tuesday I always go to school. School starts at eight in the morning. I never miss Monday.\n\n' +
        'On Wednesday I usually go to the gym. I exercise for one hour. It is good for my body.\n\n' +
        'On Thursday I have English class. My English teacher is very good. I always do my homework before Thursday.\n\n' +
        'Friday is my favourite day. I never work on Friday. I usually go to the mosque in the morning. In the afternoon I sometimes play football with my friends.\n\n' +
        'On Saturday I often visit my family. My mother always cooks a big lunch on Saturday. It is delicious.\n\n' +
        'On Sunday I rest at home. I sometimes watch TV or read a book. I go to sleep early because Monday comes again.',
      translations: {
        week: 'أسبوع',
        same: 'نفس الشيء',
        always: 'دائماً',
        never: 'أبداً',
        usually: 'عادةً',
        often: 'غالباً',
        sometimes: 'أحياناً',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        sunday: 'الأحد',
        gym: 'الجيم / النادي الرياضي',
        exercise: 'أتمرن / أمارس الرياضة',
        hour: 'ساعة',
        body: 'الجسم',
        favourite: 'المفضل',
        mosque: 'المسجد',
        football: 'كرة القدم',
        friends: 'الأصدقاء',
        visit: 'أزور',
        family: 'العائلة',
        cooks: 'تطبخ',
        delicious: 'لذيذ',
        rest: 'أستريح',
        early: 'مبكراً',
        because: 'لأن',
        miss: 'أفوت / أغيب',
        homework: 'الواجب',
      },
      vocab: [
        { word: 'favourite', ar: 'المفضل', note: 'adjective' },
        { word: 'exercise', ar: 'يمارس الرياضة', note: 'verb' },
        { word: 'mosque', ar: 'المسجد', note: 'noun' },
        { word: 'delicious', ar: 'لذيذ', note: 'adjective' },
        { word: 'rest', ar: 'يستريح', note: 'verb' },
        { word: 'early', ar: 'مبكراً', note: 'adverb' },
        { word: 'miss', ar: 'يفوت / يغيب', note: 'verb' },
        { word: 'gym', ar: 'النادي الرياضي', note: 'noun' },
      ],
      blanks: [
        { before: 'Yassine always goes to school on Monday and', after: '.', answer: 'Tuesday', options: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'] },
        { before: 'On Wednesday he usually goes to the', after: '.', answer: 'gym', options: ['gym', 'school', 'mosque', 'market'] },
        { before: 'He has English class on', after: '.', answer: 'Thursday', options: ['Thursday', 'Monday', 'Friday', 'Wednesday'] },
        { before: 'Friday is his', after: 'day.', answer: 'favourite', options: ['favourite', 'worst', 'boring', 'hard'] },
        { before: 'His mother cooks a big lunch on', after: '.', answer: 'Saturday', options: ['Saturday', 'Sunday', 'Friday', 'Monday'] },
        { before: 'On Sunday he goes to sleep', after: '.', answer: 'early', options: ['early', 'late', 'well', 'fast'] },
      ],
    },
  ],
}
