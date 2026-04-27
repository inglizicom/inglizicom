import type { Unit } from './types'

export const unit09: Unit = {
  id: 9,
  slug: 'bakery',
  emoji: '🥐',
  level: 'A1 – A2',
  title: { en: 'At the Bakery', ar: 'في المخبزة' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'تعابير المخبزة',
      items: [
        { en: 'I want some fresh bread', ar: 'بغيت شي خبز طري' },
        { en: 'Do you have croissants?', ar: 'واش عندكم كرواسون؟' },
        { en: 'How much is one baguette?', ar: 'كم سعر الباجيت الواحد؟' },
        { en: 'I’ll take two pieces', ar: 'سآخذ قطعتين' },
        { en: 'Is this bread soft or hard?', ar: 'هل هذا الخبز طري أم قاسي؟' },
        { en: 'Do you have brown bread?', ar: 'هل لديك خبز أسمر؟' },
        { en: 'I don’t want sesame', ar: 'لا أريد السمسم' },
        { en: 'Can I have it sliced?', ar: 'هل يمكنني تقطيعه إلى شرائح؟' },
        { en: 'This cake looks good', ar: 'هذه الكعكة تبدو لذيذة' },
        { en: 'I want one donut, please', ar: 'أريد دونات واحدة من فضلك' },
        { en: 'Do you sell birthday cakes?', ar: 'هل تبيعون كعك أعياد الميلاد؟' },
        { en: 'That’s all for me, thanks', ar: 'هذا كل شيء بالنسبة لي، شكراً' },
        { en: 'I’ll pay in cash', ar: 'سأدفع نقداً' },
        { en: 'Can I get a bag, please?', ar: 'هل يمكنني الحصول على كيس من فضلك؟' },
      ],
    },
    {
      kind: 'vocabCategories',
      title: 'أكثر المخبوزات شيوعاً',
      categories: [
        {
          name: 'Bakery Items',
          nameAr: 'المخبوزات',
          items: [
            { en: 'White Bread', ar: 'خبز أبيض' },
            { en: 'Brown Bread', ar: 'خبز أسمر' },
            { en: 'Baguette', ar: 'باغيت' },
            { en: 'Round Bread', ar: 'خبز مدوّر' },
            { en: 'Toast Bread', ar: 'خبز التوست' },
            { en: 'Cupcake', ar: 'كب كيك' },
            { en: 'Muffin', ar: 'مافن' },
            { en: 'Apple pie', ar: 'فطيرة تفاح' },
          ],
        },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'تعبيرات جاهزة تُستخدم كل يوم',
      patterns: [
        {
          template: 'Can I have + [item], please?',
          templateAr: 'بغيت (اسم المنتج)، عفاك',
          examples: [
            'Can I have a chocolate croissant, please?',
            'Can I have one brown bread, please?',
          ],
        },
        {
          template: 'How much is + [item]?',
          templateAr: 'بكم (اسم المنتج)؟',
          examples: ['How much is this baguette?', 'How much is this chocolate birthday cake?'],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Zineb at the bakery',
      lines: [
        { speaker: 'Zineb', text: 'Good morning! The bread smells amazing today.' },
        { speaker: 'Baker', text: "Thanks! It's fresh, just from the oven." },
        { speaker: 'Zineb', text: "I'll take one baguette and two round breads." },
        { speaker: 'Baker', text: 'With sesame or without?' },
        { speaker: 'Zineb', text: 'One with sesame, one without.' },
        { speaker: 'Baker', text: 'Anything sweet today?' },
        { speaker: 'Zineb', text: 'Yes, two chocolate croissants, please.' },
        { speaker: 'Baker', text: 'Hmm, and a little cake?' },
        { speaker: 'Zineb', text: 'How much is the chocolate cake?' },
        { speaker: 'Baker', text: 'Eight dirhams per slice.' },
        { speaker: 'Zineb', text: 'Okay, one slice.' },
        { speaker: 'Baker', text: 'Anything else?' },
        { speaker: 'Zineb', text: "That's all, thanks. Can I get a small bag?" },
        { speaker: 'Baker', text: 'Of course. Total is twenty-two dirhams.' },
        { speaker: 'Zineb', text: 'Here you go. Have a nice day!' },
        { speaker: 'Baker', text: 'Thank you! See you tomorrow.' },
      ],
    },
  ],
}
