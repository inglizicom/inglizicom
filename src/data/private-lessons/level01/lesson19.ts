import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/19/${slug}.jpg`

export const lesson19: Unit = {
  id: 119,
  slug: 'l1-hobbies',
  emoji: '🎯',
  level: 'A0 – A1',
  title: { en: 'Hobbies & Free Time', ar: 'الهوايات ووقت الفراغ' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'الهوايات ووقت الفراغ',
      items: [
        { en: 'Playing football', ar: 'لعب كرة القدم', examples: ['I like playing football on weekends.', 'He plays football every Tuesday.'], tint: 'sky', image: LOCAL('football') },
        { en: 'Swimming', ar: 'السباحة', examples: ['She goes swimming every Monday.', 'I love swimming in summer.'], tint: 'sky', image: LOCAL('swimming') },
        { en: 'Reading books', ar: 'قراءة الكتب', examples: ['I love reading books before bed.', 'She reads every evening.'], tint: 'amber', image: LOCAL('reading') },
        { en: 'Learning English', ar: 'تعلم الإنجليزية', examples: ['He studies English every day.', 'Learning English is fun.'], tint: 'violet', image: LOCAL('learning') },
        { en: 'Drawing', ar: 'الرسم', examples: ['She loves drawing in her free time.', 'I draw on Saturday morning.'], tint: 'rose', image: LOCAL('drawing') },
        { en: 'Cooking', ar: 'الطبخ', examples: ['I like cooking for my family.', 'She cooks new recipes on weekends.'], tint: 'amber', image: LOCAL('cooking') },
        { en: 'Baking', ar: 'خبز المعجنات', examples: ['I like baking cakes with my mother.', 'She bakes every Friday.'], tint: 'rose', image: LOCAL('baking') },
        { en: 'Hiking', ar: 'المشي لمسافات طويلة', examples: ['We go hiking in the mountains on Saturday.', 'I love hiking with friends.'], tint: 'emerald', image: LOCAL('hiking') },
        { en: 'Camping', ar: 'التخييم', examples: ['We go camping in summer.', 'Camping is fun.'], tint: 'emerald', image: LOCAL('camping') },
        { en: 'Travelling', ar: 'السفر', examples: ['I love travelling to new cities.', 'She travels every summer.'], tint: 'teal', image: LOCAL('travelling') },
        { en: 'Playing chess', ar: 'لعب الشطرنج', examples: ['He plays chess on Tuesday evenings.', 'Chess is a smart game.'], tint: 'violet', image: LOCAL('chess') },
        { en: 'Video games', ar: 'ألعاب الفيديو', examples: ['I play video games with my brother.', 'He loves video games.'], tint: 'violet', image: LOCAL('video-games') },
        { en: 'Exercising', ar: 'ممارسة الرياضة', examples: ['I exercise three times a week.', 'She exercises every morning.'], tint: 'teal', image: LOCAL('exercising') },
        { en: 'Helping others', ar: 'مساعدة الآخرين', examples: ['She likes helping others at school.', 'He volunteers on weekends.'], tint: 'emerald', image: LOCAL('helping') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'كيف تتحدث عن هواياتك',
      patterns: [
        {
          template: 'I like / I love + [verb-ing].',
          templateAr: 'أنا أحب + الفعل + ing',
          examples: ['I like reading books.', 'I love playing football.', 'She loves baking cakes.'],
        },
        {
          template: "I don't like + [verb-ing].",
          templateAr: 'أنا لا أحب + الفعل + ing',
          examples: ["I don't like hiking.", "He doesn't like playing chess."],
        },
        {
          template: 'What do you like to do in your free time?  →  I like ___.',
          templateAr: 'ماذا تحب أن تفعل في وقت فراغك؟  →  أنا أحب ___.',
          examples: [
            'What do you like to do? — I like drawing and reading.',
            'What does she do on weekends? — She goes swimming.',
          ],
        },
        {
          template: 'Does he / she like ___?  →  Yes, he / she does. / No, he / she doesn\'t.',
          templateAr: 'هل يحب / تحب ___؟  →  نعم / لا',
          examples: [
            'Does your brother like football? — Yes, he does.',
            "Does she like cooking? — No, she doesn't. But she likes baking.",
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Lina & Youssef — hobbies and free time',
      lines: [
        { speaker: 'Lina',    text: 'Youssef, what do you do in your free time?' },
        { speaker: 'Youssef', text: 'I love playing football — every Saturday with friends.' },
        { speaker: 'Lina',    text: 'Every Saturday? You really love it.' },
        { speaker: 'Youssef', text: 'Yes! And my brother loves it too — he plays every day.' },
        { speaker: 'Lina',    text: 'I like reading and drawing. Very different from football!' },
        { speaker: 'Youssef', text: 'Do you like cooking? My sister loves baking.' },
        { speaker: 'Lina',    text: 'Yes! I bake with my mother on Friday. It is fun.' },
        { speaker: 'Youssef', text: 'Does she like travelling too?' },
        { speaker: 'Lina',    text: 'My mother? She loves it — we travel every summer.' },
        { speaker: 'Youssef', text: 'I love travelling too. But I never have time.' },
        { speaker: 'Lina',    text: 'Make time! It is good for you.' },
        { speaker: 'Youssef', text: 'You are right. See you tomorrow, Lina!' },
        { speaker: 'Lina',    text: 'See you, Youssef!' },
      ],
    },
  ],
}
