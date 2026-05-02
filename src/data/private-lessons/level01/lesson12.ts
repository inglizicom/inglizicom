import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/12/${slug}.jpg`

export const lesson12: Unit = {
  id: 112,
  slug: 'l1-days-adverbs',
  emoji: '📅',
  level: 'A0 – A1',
  title: { en: 'Days of the Week & Adverbs of Frequency', ar: 'أيام الأسبوع وظروف التكرار' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'أيام الأسبوع',
      items: [
        { en: 'Monday', ar: 'الاثنين', examples: ['I have English class on Monday.', 'School starts on Monday.'], tint: 'sky', image: LOCAL('monday') },
        { en: 'Tuesday', ar: 'الثلاثاء', examples: ['I play football on Tuesday.', 'She has a test on Tuesday.'], tint: 'amber', image: LOCAL('tuesday') },
        { en: 'Wednesday', ar: 'الأربعاء', examples: ['We have a test on Wednesday.', 'I go to the gym on Wednesday.'], tint: 'violet', image: LOCAL('wednesday') },
        { en: 'Thursday', ar: 'الخميس', examples: ['I visit my grandmother on Thursday.', 'He has a meeting on Thursday.'], tint: 'emerald', image: LOCAL('thursday') },
        { en: 'Friday', ar: 'الجمعة', examples: ['We go to the mosque on Friday.', 'Friday is a special day.'], tint: 'orange', image: LOCAL('friday') },
        { en: 'Saturday', ar: 'السبت', examples: ['I relax on Saturday.', 'The weekend starts on Saturday.'], tint: 'rose', image: LOCAL('saturday') },
        { en: 'Sunday', ar: 'الأحد', examples: ['I meet my friends on Sunday.', 'We eat together on Sunday.'], tint: 'teal', image: LOCAL('sunday') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'ظروف التكرار',
      patterns: [
        {
          template: 'always — دائماً (100%)',
          templateAr: 'كل مرة بدون استثناء',
          examples: ['I always wake up at 6 a.m.', 'She always brushes her teeth before bed.'],
        },
        {
          template: 'usually — عادةً (80–90%)',
          templateAr: 'معظم الأوقات',
          examples: ['I usually have tea in the morning.', 'He usually goes to school by bus.'],
        },
        {
          template: 'often — غالباً (70%)',
          templateAr: 'كثيراً',
          examples: ['I often study in the evening.', 'She often cooks on Saturday.'],
        },
        {
          template: 'sometimes — أحياناً (50%)',
          templateAr: 'في بعض الأحيان',
          examples: ['I sometimes watch TV after dinner.', 'He sometimes plays football.'],
        },
        {
          template: 'never — أبداً (0%)',
          templateAr: 'لا يحدث أبداً',
          examples: ['I never wake up late on weekdays.', 'She never eats fast food.'],
        },
        {
          template: 'I [adverb] [verb] on [day].',
          templateAr: 'ظرف التكرار يأتي مباشرة بعد الضمير',
          examples: ['I always go to school on Monday.', 'I usually visit her on Saturday.', 'I never study on Friday.'],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Hana & Yassine — a week in their lives',
      lines: [
        { speaker: 'Hana',    text: 'Yassine, do you always go to school on Monday?' },
        { speaker: 'Yassine', text: 'Yes, always. I never miss Monday. And you?' },
        { speaker: 'Hana',    text: 'Same. But I never study on Friday — it is my rest day.' },
        { speaker: 'Yassine', text: 'Me too! I sometimes play football on Friday.' },
        { speaker: 'Hana',    text: 'I usually visit my family on Friday. It is a nice day.' },
        { speaker: 'Yassine', text: 'What about Saturday? What do you do?' },
        { speaker: 'Hana',    text: 'I often go to school on Saturday morning. And you?' },
        { speaker: 'Yassine', text: 'I always play football — every Saturday, no exception!' },
        { speaker: 'Hana',    text: 'You really love football.' },
        { speaker: 'Yassine', text: 'Yes! And on Sunday I always watch TV with my family.' },
        { speaker: 'Hana',    text: 'Good week! See you on Monday then.' },
        { speaker: 'Yassine', text: 'See you, Hana!' },
      ],
    },
  ],
}
