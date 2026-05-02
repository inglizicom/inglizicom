import type { Unit } from './types'

const LOCAL = (slug: string) => `/lessons/unit04/${slug}.jpg`

export const unit04: Unit = {
  id: 4,
  slug: 'cafe',
  emoji: '☕',
  level: 'A1 – A2',
  title: { en: 'In the Café', ar: 'في المقهى' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'مفردات المقهى',
      items: [
        { en: 'I go to the café in the morning', ar: 'أذهب إلى المقهى في الصباح',   tint: 'amber',   image: LOCAL('go-cafe') },
        { en: 'I order a cup of coffee', ar: 'أطلب كوب قهوة',                        tint: 'orange',  image: LOCAL('order-coffee') },
        { en: 'I ask the waiter for a menu', ar: 'أطلب القائمة من النادل',           tint: 'amber',   image: LOCAL('ask-menu') },
        { en: 'I read the menu carefully', ar: 'أقرأ قائمة الطعام بعناية',           tint: 'sky',     image: LOCAL('read-menu') },
        { en: 'I choose a cappuccino and a croissant', ar: 'أختار كابتشينو وكرواسون', tint: 'orange', image: LOCAL('cappuccino-croissant') },
        { en: 'I sit next to the window', ar: 'أجلس بجانب النافذة',                  tint: 'sky',     image: LOCAL('sit-window') },
        { en: 'I drink my coffee slowly', ar: 'أشرب قهوتي ببطء',                     tint: 'amber',   image: LOCAL('drink-coffee') },
        { en: 'I eat a piece of cake with my coffee', ar: 'آكل قطعة كعك مع قهوتي',  tint: 'rose',    image: LOCAL('eat-cake') },
        { en: 'I talk to a friend while drinking', ar: 'أتحدث مع صديقي أثناء الشرب', tint: 'violet', image: LOCAL('talk-friend') },
        { en: 'I take a photo of my coffee', ar: 'ألتقط صورة لقهوتي',               tint: 'violet',  image: LOCAL('photo-coffee') },
        { en: 'The bill, please', ar: 'الفاتورة من فضلك',                            tint: 'emerald', image: LOCAL('the-bill') },
        { en: 'I pay in cash', ar: 'أدفع نقداً',                                     tint: 'emerald', image: LOCAL('pay-cash') },
        { en: 'I thank the waiter', ar: 'أشكر النادل',                               tint: 'teal',    image: LOCAL('thank-waiter') },
        { en: 'I leave the café after 30 minutes', ar: 'أُغادر المقهى بعد 30 دقيقة', tint: 'sky',    image: LOCAL('leave-cafe') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'جمل ثابتة قابلة للتغيير',
      patterns: [
        {
          template: 'Can I have + [drink or food], please?',
          templateAr: 'هل يمكنني الحصول على + (مشروب أو طعام) من فضلك؟',
          examples: [
            'Can I have some orange juice, please?',
            'Can I have a croissant, please?',
          ],
        },
        {
          template: 'I usually + [verb] + at the café.',
          templateAr: 'عادةً ما + (فعل) + في المقهى',
          examples: [
            'I usually drink mint tea at the café.',
            'I usually order a cappuccino at the café.',
          ],
        },
        {
          template: 'I don’t like + [drink / ingredient].',
          templateAr: 'أنا لا أحب + (مشروب أو مكوّن)',
          examples: ['I don’t like sweet foods.', 'I don’t like black coffee.'],
        },
        {
          template: 'I want to order + [item].',
          templateAr: 'أريد أن أطلب + (عنصر / طعام / مشروب)',
          examples: ['I want to order a cappuccino.', 'I want to order mint tea.'],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Yasmin & Omar — meeting at the café',
      lines: [
        { speaker: 'Yasmin', text: 'Hi Omar! Are you free now?' },
        { speaker: 'Omar',   text: "Yes, let's go to the café." },
        { speaker: 'Yasmin', text: 'Good idea. The new one near the park?' },
        { speaker: 'Omar',   text: 'Yes. They have the best coffee.' },
        { speaker: 'Yasmin', text: 'Inside or outside?' },
        { speaker: 'Omar',   text: 'Outside. The weather is nice.' },
        { speaker: 'Yasmin', text: 'Excuse me, can I see the menu, please?' },
        { speaker: 'Waiter', text: 'Of course. Here you go.' },
        { speaker: 'Yasmin', text: "I'll take a cappuccino and a croissant." },
        { speaker: 'Omar',   text: 'I want a mint tea, please.' },
        { speaker: 'Waiter', text: 'Anything else?' },
        { speaker: 'Omar',   text: 'A piece of cake, please.' },
        { speaker: 'Yasmin', text: "Omar, you're always hungry!" },
        { speaker: 'Omar',   text: 'I know! What do you do here usually?' },
        { speaker: 'Yasmin', text: 'I read or chat with friends. You?' },
        { speaker: 'Omar',   text: 'I work on my laptop. The Wi-Fi is fast.' },
        { speaker: 'Yasmin', text: 'Can we get the bill, please?' },
        { speaker: 'Waiter', text: 'Sure, here it is.' },
        { speaker: 'Omar',   text: "I'll pay today. You paid last time." },
        { speaker: 'Yasmin', text: 'Thank you, Omar. See you next week!' },
      ],
    },
  ],
}
