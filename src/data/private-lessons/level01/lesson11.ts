import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/11/${slug}.jpg`

export const lesson11: Unit = {
  id: 111,
  slug: 'l1-daily-activities',
  emoji: '🌞',
  level: 'A0 – A1',
  title: { en: 'Daily Activities & Telling the Time', ar: 'الأنشطة اليومية وقراءة الساعة' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'الأنشطة اليومية',
      items: [
        { en: 'I wake up', ar: 'أستيقظ', examples: ['I wake up at 6 a.m.', 'He wakes up at 7 every day.'], tint: 'amber', image: LOCAL('wake-up') },
        { en: 'I wash my face', ar: 'أغسل وجهي', examples: ['I wash my face with cold water.', 'I wash my face every morning.'], tint: 'sky', image: LOCAL('wash-face') },
        { en: 'I brush my teeth', ar: 'أفرش أسناني', examples: ['I brush my teeth for two minutes.', 'I use toothpaste.'], tint: 'sky', image: LOCAL('brush-teeth') },
        { en: 'I take a shower', ar: 'أستحم', examples: ['I take a shower every morning.', 'I use shampoo and soap.'], tint: 'teal', image: LOCAL('shower') },
        { en: 'I get dressed', ar: 'أرتدي ملابسي', examples: ['I get dressed quickly.', 'I wear a shirt and jeans.'], tint: 'violet', image: LOCAL('get-dressed') },
        { en: 'I have breakfast', ar: 'أتناول الفطور', examples: ['I have breakfast at 7:30.', 'I eat bread and drink tea.'], tint: 'orange', image: LOCAL('breakfast') },
        { en: 'I go to school', ar: 'أذهب إلى المدرسة', examples: ['I go to school at 8 a.m.', 'She goes to school on foot.'], tint: 'emerald', image: LOCAL('go-to-school') },
        { en: 'I go to work', ar: 'أذهب إلى العمل', examples: ['I go to work by bus.', 'He goes to work at 9.'], tint: 'emerald', image: LOCAL('go-to-work') },
        { en: 'I have lunch', ar: 'أتناول الغداء', examples: ['I have lunch at 1 p.m.', 'I eat rice and chicken.'], tint: 'amber', image: LOCAL('lunch') },
        { en: 'I cook dinner', ar: 'أطبخ العشاء', examples: ['I cook dinner for my family.', 'She cooks dinner every evening.'], tint: 'rose', image: LOCAL('cook-dinner') },
        { en: 'I watch TV', ar: 'أشاهد التلفاز', examples: ['I watch TV for one hour.', 'We watch TV after dinner.'], tint: 'violet', image: LOCAL('watch-tv') },
        { en: 'I do my homework', ar: 'أقوم بواجباتي', examples: ['I do my homework after school.', 'She does her homework every evening.'], tint: 'sky', image: LOCAL('homework') },
        { en: 'I go to sleep', ar: 'أذهب إلى النوم', examples: ['I go to sleep at 10 p.m.', 'She goes to sleep at 9:30.'], tint: 'sky', image: LOCAL('sleep') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'قراءة الساعة',
      patterns: [
        {
          template: "It's [number] o'clock.",
          templateAr: 'الساعة تماماً',
          examples: ["It's 6:00. (six o'clock)", "It's 8:00. (eight o'clock)", "It's 12:00. (twelve o'clock)"],
        },
        {
          template: "It's [hour] thirty.",
          templateAr: 'والنصف',
          examples: ["It's 7:30. (seven thirty)", "It's 9:30. (nine thirty)"],
        },
        {
          template: "What time do you [verb]?  →  I [verb] at ___.",
          templateAr: 'متى تفعل ___؟  →  أفعله الساعة ___.',
          examples: [
            "What time do you wake up? — I wake up at 6:30.",
            "What time do you go to work? — I go to work at 8:00.",
            "What time do you go to sleep? — I go to sleep at 10:00.",
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Sara & Nabil — daily routine',
      lines: [
        { speaker: 'Sara',  text: 'Nabil, what time do you wake up in the morning?' },
        { speaker: 'Nabil', text: 'At six — every day. You?' },
        { speaker: 'Sara',  text: 'Six thirty. I wash my face first, then brush my teeth.' },
        { speaker: 'Nabil', text: 'I take a shower first — then I get dressed and have breakfast.' },
        { speaker: 'Sara',  text: 'What do you eat?' },
        { speaker: 'Nabil', text: 'Bread and tea. Simple but good. And you?' },
        { speaker: 'Sara',  text: 'I eat an egg and drink milk. Then I go to school at eight.' },
        { speaker: 'Nabil', text: 'I go to work at eight thirty. I come home at five.' },
        { speaker: 'Sara',  text: 'What do you do in the evening?' },
        { speaker: 'Nabil', text: 'I cook dinner and watch TV. I go to sleep at ten.' },
        { speaker: 'Sara',  text: 'I go to sleep at nine thirty. I do my homework first.' },
        { speaker: 'Nabil', text: 'Good routine! Goodnight, Sara.' },
        { speaker: 'Sara',  text: 'Goodnight, Nabil!' },
      ],
    },
  ],
}
