import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/14/${slug}.jpg`

export const lesson14: Unit = {
  id: 114,
  slug: 'l1-drinks',
  emoji: '☕',
  level: 'A0 – A1',
  title: { en: 'Drinks I Like', ar: 'المشروبات التي أحبها' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'أنواع المشروبات',
      items: [
        { en: 'Water', ar: 'الماء', examples: ['I drink water every day.', 'I always drink water after exercise.'], tint: 'sky', image: LOCAL('water') },
        { en: 'Milk', ar: 'الحليب', examples: ['I drink milk in the morning.', 'She drinks milk before bed.'], tint: 'sky', image: LOCAL('milk') },
        { en: 'Tea', ar: 'الشاي', examples: ['I drink tea in the morning.', 'She drinks tea every evening.'], tint: 'amber', image: LOCAL('tea') },
        { en: 'Coffee', ar: 'القهوة', examples: ["He drinks coffee at work.", "I don't like coffee."], tint: 'amber', image: LOCAL('coffee') },
        { en: 'Orange juice', ar: 'عصير البرتقال', examples: ['I drink orange juice every morning.', 'She loves fresh orange juice.'], tint: 'orange', image: LOCAL('orange-juice') },
        { en: 'Lemon juice', ar: 'عصير الليمون', examples: ['He likes fresh lemon juice.', 'Lemon juice is good in summer.'], tint: 'orange', image: LOCAL('lemon-juice') },
        { en: 'Milkshake', ar: 'الحليب المخفوق', examples: ['She loves chocolate milkshake.', 'I drink milkshake on weekends.'], tint: 'rose', image: LOCAL('milkshake') },
        { en: 'Hot chocolate', ar: 'الشوكولاتة الساخنة', examples: ['I drink hot chocolate in winter.', 'Children love hot chocolate.'], tint: 'rose', image: LOCAL('hot-chocolate') },
        { en: 'Soda', ar: 'المشروبات الغازية', examples: ["I don't drink soda every day.", 'Soda is not healthy.'], tint: 'violet', image: LOCAL('soda') },
        { en: 'Energy drink', ar: 'مشروب الطاقة', examples: ['He drinks energy drinks before training.', "I don't drink energy drinks."], tint: 'emerald', image: LOCAL('energy-drink') },
        { en: 'Mineral water', ar: 'الماء المعدني', examples: ['I drink mineral water at the gym.', 'Mineral water is good for health.'], tint: 'teal', image: LOCAL('mineral-water') },
        { en: 'Herbal tea', ar: 'شاي الأعشاب', examples: ['My grandmother drinks herbal tea every night.', 'Herbal tea is good for sleep.'], tint: 'teal', image: LOCAL('herbal-tea') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'كيف تتحدث عن مشروباتك',
      patterns: [
        {
          template: 'What is your favourite drink?  →  My favourite drink is ___.',
          templateAr: 'ما هو مشروبك المفضل؟  →  مشروبي المفضل هو ___.',
          examples: ['My favourite drink is mint tea.', 'My favourite drink is orange juice.'],
        },
        {
          template: 'When do you drink ___?  →  I drink it in the ___.',
          templateAr: 'متى تشرب ___؟  →  أشربه في الصباح / المساء.',
          examples: [
            'When do you drink coffee? — In the morning.',
            'When do you drink herbal tea? — In the evening, before bed.',
          ],
        },
        {
          template: "I don't like ___. It's too [sweet / bitter / cold].",
          templateAr: 'لا أحب ___. إنه + وصف.',
          examples: ["I don't like coffee. It's too bitter.", "I don't like soda. It's too sweet."],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Adam & Rania — at the café',
      lines: [
        { speaker: 'Rania', text: 'Adam, do you drink coffee in the morning?' },
        { speaker: 'Adam',  text: 'No — I drink tea. I drink coffee sometimes in the afternoon.' },
        { speaker: 'Rania', text: 'I drink coffee every morning. I love it.' },
        { speaker: 'Adam',  text: 'Really? What is your favourite drink?' },
        { speaker: 'Rania', text: 'Coffee — but orange juice is my favourite in summer. And you?' },
        { speaker: 'Adam',  text: 'Tea, always. I drink water too — every day.' },
        { speaker: 'Rania', text: 'Do you like cold drinks? Soda, milkshake?' },
        { speaker: 'Adam',  text: 'I like milkshake! But I never drink soda.' },
        { speaker: 'Rania', text: 'Same — soda is not good. Herbal tea at night is better.' },
        { speaker: 'Adam',  text: 'My grandmother drinks herbal tea every night.' },
        { speaker: 'Rania', text: 'Smart! See you tomorrow, Adam.' },
        { speaker: 'Adam',  text: 'Goodbye, Rania!' },
      ],
    },
  ],
}
