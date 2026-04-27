import type { Unit } from './types'

export const unit03: Unit = {
  id: 3,
  slug: 'kitchen',
  emoji: '👩‍🍳',
  level: 'A1 – A2',
  title: { en: 'In the Kitchen', ar: 'في المطبخ' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'مفردات المطبخ',
      items: [
        { en: 'I open the fridge to get some milk', ar: 'أفتح الثلاجة لآخذ بعض الحليب' },
        { en: 'I boil water to make tea', ar: 'أغلي الماء لأصنع الشاي' },
        { en: 'I cut vegetables for the salad', ar: 'أقطع الخضروات لتحضير السلطة' },
        { en: 'I use a pan to fry eggs for breakfast', ar: 'أستخدم مقلاة لقلي البيض في وجبة الإفطار' },
        { en: 'I make a sandwich with cheese and tomato', ar: 'أُحضّر ساندويتش بالجبن والطماطم' },
        { en: 'I wash the dishes after eating', ar: 'أغسل الصحون بعد الأكل' },
        { en: 'I use a spoon to stir the soup', ar: 'أستخدم الملعقة لتحريك الحساء' },
        { en: 'I clean the kitchen every night', ar: 'أنظف المطبخ كل ليلة' },
        { en: 'I use the blender to mix the fruit', ar: 'أستخدم الخلاط في خلط الفاكهة' },
        { en: 'I put the food on the table', ar: 'أضع الطعام على الطاولة' },
        { en: 'I cook rice with chicken', ar: 'أطبخ الأرز مع الدجاج' },
        { en: 'I use a knife to cut the meat', ar: 'أستخدم السكين لتقطيع اللحم' },
        { en: 'I put the tea on the stove', ar: 'أضع الشاي على الموقد' },
        { en: 'I use the dishwasher to wash the dishes', ar: 'أستعمل غسالة الأطباق لغسل الأطباق' },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'جمل ثابتة قابلة للتغيير',
      patterns: [
        {
          template: 'I always + [verb] + in the kitchen',
          templateAr: 'أنا دائماً + (فعل) + في المطبخ',
          examples: [
            'I always cook rice in the kitchen.',
            'I always use the dishwasher to wash the dishes.',
          ],
        },
        {
          template: 'I use + (tool) + to + (verb)',
          templateAr: 'أنا أستعمل + (أداة) + لكي + (فعل)',
          examples: ['I use a knife to cut vegetables.', 'I use the pan to fry eggs.'],
        },
        {
          template: 'I don’t + (verb) + at night.',
          templateAr: 'أنا لا + (فعل) + ليلاً',
          examples: ['I don’t cook at night.', 'I don’t eat dinner at night.'],
        },
        {
          template: 'First, I + (verb) … Then I + (verb)',
          templateAr: 'أولاً، أنا + (فعل) … ثم، أنا + (فعل)',
          examples: [
            'First, I wash vegetables. Then, I cut them.',
            'First, I boil water. Then, I make tea.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Ahmed & Mariam — cooking lunch together',
      lines: [
        { speaker: 'Mariam', text: 'Ahmed, can you help me in the kitchen?' },
        { speaker: 'Ahmed',  text: 'Sure! What are we cooking?' },
        { speaker: 'Mariam', text: 'Rice with chicken. Open the fridge and take the chicken.' },
        { speaker: 'Ahmed',  text: 'Okay. Do we have vegetables?' },
        { speaker: 'Mariam', text: 'Yes, on the table. Cut the onions and tomatoes, please.' },
        { speaker: 'Ahmed',  text: 'Where is the knife?' },
        { speaker: 'Mariam', text: 'In the drawer, next to the spoons.' },
        { speaker: 'Ahmed',  text: 'Got it. And the salad?' },
        { speaker: 'Mariam', text: "I'll cut cucumbers and lettuce." },
        { speaker: 'Ahmed',  text: 'Do we boil water for the rice?' },
        { speaker: 'Mariam', text: 'Yes. Put the pan on the stove.' },
        { speaker: 'Ahmed',  text: 'Done. What about tea?' },
        { speaker: 'Mariam', text: 'After lunch. Now help me stir the soup.' },
        { speaker: 'Ahmed',  text: 'It smells very good!' },
        { speaker: 'Mariam', text: 'Thanks. I cook this every Friday.' },
        { speaker: 'Ahmed',  text: "Don't forget the bread. I'll put it on the table." },
        { speaker: 'Mariam', text: 'Perfect. Lunch is ready in ten minutes.' },
        { speaker: 'Ahmed',  text: "I'm hungry already!" },
      ],
    },
  ],
}
