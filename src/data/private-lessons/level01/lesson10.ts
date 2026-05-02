import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/10/${slug}.jpg`

export const lesson10: Unit = {
  id: 110,
  slug: 'l1-furniture',
  emoji: '🛋️',
  level: 'A0 – A1',
  title: { en: 'House Furniture & Prepositions', ar: 'أثاث المنزل وحروف المكان' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'أثاث المنزل',
      items: [
        { en: 'Bed', ar: 'السرير', examples: ['I sleep in my bed.', 'The bed is in the bedroom.'], tint: 'sky', image: LOCAL('bed') },
        { en: 'Pillow', ar: 'الوسادة', examples: ['The pillow is on the bed.', 'I have two pillows.'], tint: 'sky', image: LOCAL('pillow') },
        { en: 'Blanket', ar: 'البطانية', examples: ['The blanket is warm.', 'I use a blanket in winter.'], tint: 'sky', image: LOCAL('blanket') },
        { en: 'Wardrobe', ar: 'خزانة الملابس', examples: ['My clothes are in the wardrobe.', 'The wardrobe is in the bedroom.'], tint: 'violet', image: LOCAL('wardrobe') },
        { en: 'Dresser', ar: 'الكومودة / الدريسير', examples: ['The mirror is on the dresser.'], tint: 'violet', image: LOCAL('dresser') },
        { en: 'Mirror', ar: 'المرآة', examples: ['I look in the mirror every morning.', 'The mirror is in the bathroom.'], tint: 'violet', image: LOCAL('mirror') },
        { en: 'Lamp', ar: 'المصباح', examples: ['The lamp is next to the bed.', 'I turn on the lamp at night.'], tint: 'amber', image: LOCAL('lamp') },
        { en: 'Chair', ar: 'الكرسي', examples: ['I sit on the chair.', 'The chair is next to the desk.'], tint: 'orange', image: LOCAL('chair') },
        { en: 'Sofa', ar: 'الأريكة', examples: ['We sit on the sofa in the evening.', 'The sofa is in the living room.'], tint: 'amber', image: LOCAL('sofa') },
        { en: 'Table', ar: 'الطاولة', examples: ['The food is on the table.', 'We eat at the table.'], tint: 'orange', image: LOCAL('table') },
        { en: 'Carpet', ar: 'السجادة', examples: ['The carpet is under the table.', 'We have a big carpet in the living room.'], tint: 'rose', image: LOCAL('carpet') },
        { en: 'Fridge', ar: 'الثلاجة', examples: ['The food is in the fridge.', 'The fridge is in the kitchen.'], tint: 'teal', image: LOCAL('fridge') },
        { en: 'Stove', ar: 'الموقد', examples: ['I cook on the stove.', 'The stove is in the kitchen.'], tint: 'teal', image: LOCAL('stove') },
        { en: 'Television', ar: 'التلفاز', examples: ['The TV is in the living room.', 'I watch TV after dinner.'], tint: 'emerald', image: LOCAL('tv') },
        { en: 'Washing machine', ar: 'الغسالة', examples: ['The washing machine is in the utility room.'], tint: 'emerald', image: LOCAL('washing-machine') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'حروف المكان',
      patterns: [
        { template: 'ON — على', templateAr: 'الشيء فوق السطح', examples: ['The book is on the desk.', 'The lamp is on the table.'] },
        { template: 'IN — في / داخل', templateAr: 'الشيء داخل شيء آخر', examples: ['The bed is in the bedroom.', 'The milk is in the fridge.'] },
        { template: 'UNDER — تحت', templateAr: 'الشيء تحت شيء آخر', examples: ['The carpet is under the bed.', 'The shoes are under the chair.'] },
        { template: 'NEXT TO — بجانب', templateAr: 'الشيء بجانب شيء آخر', examples: ['The lamp is next to the bed.', 'The chair is next to the table.'] },
        { template: 'IN FRONT OF — أمام', templateAr: 'الشيء في الأمام', examples: ['The TV is in front of the sofa.', 'The car is in front of the house.'] },
        { template: 'BEHIND — خلف', templateAr: 'الشيء في الخلف', examples: ['The wardrobe is behind the door.', 'The garden is behind the house.'] },
        { template: 'BETWEEN — بين', templateAr: 'الشيء في الوسط', examples: ['The lamp is between the plant and the bed.', 'The table is between the two chairs.'] },
      ],
    },
    {
      kind: 'conversation',
      title: 'Sara & Nabil — in the new apartment',
      lines: [
        { speaker: 'Sara',  text: 'Nabil, I love your apartment! Is the bedroom big?' },
        { speaker: 'Nabil', text: 'Yes — the bed is very big. The wardrobe is behind the door.' },
        { speaker: 'Sara',  text: 'And the lamp? Where is it?' },
        { speaker: 'Nabil', text: 'It is on the small table, next to the bed.' },
        { speaker: 'Sara',  text: 'Nice! Where do you watch TV?' },
        { speaker: 'Nabil', text: 'In the living room — the TV is in front of the sofa.' },
        { speaker: 'Sara',  text: 'Is the sofa comfortable?' },
        { speaker: 'Nabil', text: 'Very! And the carpet is under the table — it is new.' },
        { speaker: 'Sara',  text: 'What about the kitchen? Is the fridge big?' },
        { speaker: 'Nabil', text: 'Yes. The fridge is on the right and the stove is next to it.' },
        { speaker: 'Sara',  text: 'Everything has a place! I like it.' },
        { speaker: 'Nabil', text: 'Thank you, Sara. Come and visit anytime.' },
      ],
    },
  ],
}
