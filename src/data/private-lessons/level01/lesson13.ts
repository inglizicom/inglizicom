import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/13/${slug}.jpg`

export const lesson13: Unit = {
  id: 113,
  slug: 'l1-food',
  emoji: '🍕',
  level: 'A0 – A1',
  title: { en: 'Food I Like', ar: 'الطعام الذي أحبه' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'أنواع الطعام',
      items: [
        { en: 'Roast chicken', ar: 'الدجاج المشوي', examples: ['I love roast chicken.', 'We have roast chicken on Friday.'], tint: 'amber', image: LOCAL('roast-chicken') },
        { en: 'Fish', ar: 'السمك', examples: ['I eat fish every Friday.', 'She likes grilled fish.'], tint: 'sky', image: LOCAL('fish') },
        { en: 'Pizza', ar: 'البيتزا', examples: ['I love pizza.', 'We eat pizza on Saturday.'], tint: 'rose', image: LOCAL('pizza') },
        { en: 'Sandwich', ar: 'الساندويتش', examples: ['I eat a sandwich for lunch.', 'He makes a cheese sandwich.'], tint: 'amber', image: LOCAL('sandwich') },
        { en: 'Tacos', ar: 'التاكوس', examples: ['I like to eat tacos.', 'She eats tacos on weekends.'], tint: 'orange', image: LOCAL('tacos') },
        { en: 'Rice', ar: 'الأرز', examples: ['I cook rice with chicken.', 'We eat rice every day.'], tint: 'emerald', image: LOCAL('rice') },
        { en: 'Pasta', ar: 'المعكرونة', examples: ['She eats pasta on Saturday.', 'I like pasta with tomato sauce.'], tint: 'orange', image: LOCAL('pasta') },
        { en: 'Salad', ar: 'السلطة', examples: ['I eat salad every day.', 'She makes a fresh salad.'], tint: 'emerald', image: LOCAL('salad') },
        { en: 'Omelette', ar: 'الأومليت', examples: ['I make an omelette for breakfast.', 'He likes cheese omelette.'], tint: 'amber', image: LOCAL('omelette') },
        { en: 'Cake', ar: 'الكعكة', examples: ['I like chocolate cake.', 'She bakes a cake on Sunday.'], tint: 'rose', image: LOCAL('cake') },
        { en: 'Ice cream', ar: 'الآيس كريم', examples: ['I eat ice cream in summer.', 'She loves vanilla ice cream.'], tint: 'violet', image: LOCAL('ice-cream') },
        { en: 'Bread', ar: 'الخبز', examples: ['I eat bread every morning.', 'We buy fresh bread from the bakery.'], tint: 'amber', image: LOCAL('bread') },
        { en: 'Barbecue', ar: 'الشواء', examples: ['We have barbecue on Friday.', 'I love barbecue with friends.'], tint: 'rose', image: LOCAL('bbq') },
        { en: 'Steak', ar: 'شريحة اللحم', examples: ['He likes his steak well-done.', 'We eat steak on special days.'], tint: 'orange', image: LOCAL('steak') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'كيف تعبر عما تحب وما لا تحب',
      patterns: [
        {
          template: 'I like / I love + [food].',
          templateAr: 'أنا أحب / أنا أُحب جداً',
          examples: ['I like roast chicken.', 'I love chocolate ice cream.', 'I love pasta with sauce.'],
        },
        {
          template: "I don't like + [food].",
          templateAr: 'أنا لا أحب',
          examples: ["I don't like spicy food.", "I don't like fish.", "He doesn't like cake."],
        },
        {
          template: 'Do you like ___?  →  Yes, I do. / No, I don\'t.',
          templateAr: 'هل تحب ___؟  →  نعم / لا',
          examples: ["Do you like pizza? — Yes, I do!", "Do you like salad? — No, I don't."],
        },
        {
          template: 'What food do you like?  →  I like ___.',
          templateAr: 'ما الطعام الذي تحبه؟  →  أنا أحب ___.',
          examples: ['What food do you like? — I like couscous and fish.', 'What do you like to eat? — I like tacos.'],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Lina & Adam — at the school cafeteria',
      lines: [
        { speaker: 'Adam', text: 'Lina, what do you eat for lunch today?' },
        { speaker: 'Lina', text: 'Rice and roast chicken — my favourite. And you?' },
        { speaker: 'Adam', text: 'I have a sandwich and salad. Simple.' },
        { speaker: 'Lina', text: 'Do you like salad?' },
        { speaker: 'Adam', text: 'Yes, every day. But my favourite food is pizza.' },
        { speaker: 'Lina', text: 'Pizza is good! Do you like fish?' },
        { speaker: 'Adam', text: "No — I really don't like fish." },
        { speaker: 'Lina', text: 'Really? I love fish! Every Friday.' },
        { speaker: 'Adam', text: 'Every Friday! That is a lot of fish.' },
        { speaker: 'Lina', text: 'Yes — but it is good for you.' },
        { speaker: 'Adam', text: 'What do you not like? Any food?' },
        { speaker: 'Lina', text: 'I do not like cake. Too sweet.' },
        { speaker: 'Adam', text: 'More cake for me then! Goodbye, Lina.' },
        { speaker: 'Lina', text: 'Goodbye, Adam!' },
      ],
    },
  ],
}
