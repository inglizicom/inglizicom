import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/02/${slug}.jpg`

export const lesson02: Unit = {
  id: 102,
  slug: 'l1-numbers',
  emoji: '🔢',
  level: 'A0 – A1',
  title: { en: 'Numbers + The Alphabet', ar: 'الأرقام والحروف' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'الأرقام من 1 إلى 10',
      items: [
        { en: 'One – Two – Three', ar: 'واحد – اثنان – ثلاثة', examples: ['One book. Two pens. Three chairs.'], tint: 'amber', image: LOCAL('one-two-three') },
        { en: 'Four – Five – Six', ar: 'أربعة – خمسة – ستة', examples: ['Four students. Five desks. Six windows.'], tint: 'orange', image: LOCAL('four-five-six') },
        { en: 'Seven – Eight – Nine – Ten', ar: 'سبعة – ثمانية – تسعة – عشرة', examples: ['Seven days a week. Eight hours of sleep.'], tint: 'amber', image: LOCAL('seven-to-ten') },
        { en: 'Eleven – Twelve – Thirteen', ar: 'أحد عشر – اثنا عشر – ثلاثة عشر', examples: ['Eleven months. Twelve months in a year.'], tint: 'sky', image: LOCAL('eleven-thirteen') },
        { en: 'Twenty – Thirty – Forty – Fifty', ar: 'عشرون – ثلاثون – أربعون – خمسون', examples: ['Twenty students. Thirty days.'], tint: 'violet', image: LOCAL('twenty-fifty') },
        { en: 'Sixty – Seventy – Eighty – Ninety', ar: 'ستون – سبعون – ثمانون – تسعون', examples: ['Sixty seconds. Ninety minutes.'], tint: 'violet', image: LOCAL('sixty-ninety') },
        { en: 'One hundred / Two hundred', ar: 'مئة / مئتان', examples: ['One hundred dirhams. Two hundred students.'], tint: 'emerald', image: LOCAL('hundreds') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'العمر ورقم الهاتف',
      patterns: [
        {
          template: 'How old are you?  →  I am ___ years old.',
          templateAr: 'كم عمرك؟  →  عمري ___ سنة.',
          examples: ['How old are you? — I am 27 years old.', 'How old is he? — He is 33 years old.'],
        },
        {
          template: 'What is your phone number?  →  My phone number is ___.',
          templateAr: 'ما هو رقم هاتفك؟  →  رقم هاتفي هو ___.',
          examples: ['My phone number is 0612345678.', 'Her phone number is 0787654321.'],
        },
        {
          template: 'How old is he / she?',
          templateAr: 'كم عمره / عمرها؟',
          examples: ['He is 19 years old.', 'She is 25 years old.'],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Hamza & Ali — age and phone number',
      lines: [
        { speaker: 'Hamza', text: 'Ali! Good morning. How are you?' },
        { speaker: 'Ali',   text: 'I am good, thank you. How old are you, Hamza?' },
        { speaker: 'Hamza', text: 'I am twenty-five. And you?' },
        { speaker: 'Ali',   text: 'I am twenty. You are older than me!' },
        { speaker: 'Hamza', text: 'Yes! Can I have your phone number?' },
        { speaker: 'Ali',   text: 'Yes — 06 98 76 54 32. And you?' },
        { speaker: 'Hamza', text: 'My number is 06 12 34 56 78. Thank you.' },
        { speaker: 'Ali',   text: 'See you tomorrow, Hamza!' },
        { speaker: 'Hamza', text: 'See you. Have a good day!' },
      ],
    },
  ],
}
