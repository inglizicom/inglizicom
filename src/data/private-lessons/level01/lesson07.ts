import type { Unit } from '../types'

export const lesson07: Unit = {
  id: 107,
  slug: 'l1-reading',
  emoji: '📖',
  level: 'A0 – A1',
  title: { en: 'Reading Practice — I / He / She', ar: 'تعلم القراءة — أنا / هو / هي' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'staticSentences',
      title: 'قراءة: فعل مع ضمائر مختلفة',
      patterns: [
        {
          template: 'Subject I  →  My name is Zaid. I am 39 years old.',
          templateAr: 'ضمير "أنا" — اقرأ النص بصوت عالٍ',
          examples: [
            'My name is Zaid. I am 39 years old. I am from Morocco.',
            'I am a teacher. I always wake up at 7:00 AM.',
            'I am married, and I have two kids.',
          ],
        },
        {
          template: 'Subject He  →  His name is Zaid. He is 39 years old.',
          templateAr: 'ضمير "هو" — نفس النص بضمير المذكر',
          examples: [
            'His name is Zaid. He is 39 years old. He is from Morocco.',
            'He is a teacher. He always wakes up at 7:00 AM.',
            'He is married, and he has two kids.',
          ],
        },
        {
          template: 'Subject She  →  Her name is Diae. She is 27 years old.',
          templateAr: 'ضمير "هي" — نفس النص بضمير المؤنث',
          examples: [
            'Her name is Diae. She is 27 years old. She is from Morocco.',
            'She is a teacher. She always wakes up at 7:00 AM.',
            'She is single. She lives with her parents.',
          ],
        },
        {
          template: 'I go → He goes / She goes',
          templateAr: 'القاعدة: مع he/she نضيف s أو es للفعل',
          examples: [
            'I go to work. → He goes to work.',
            'I teach English. → She teaches English.',
            'I wake up at 7. → He wakes up at 7.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Nadia reads about Zaid — then asks questions',
      lines: [
        { speaker: 'Teacher', text: 'Nadia, read this sentence: My name is Zaid.' },
        { speaker: 'Nadia',   text: 'His name is Zaid.' },
        { speaker: 'Teacher', text: 'Good! I am thirty years old. I am a teacher.' },
        { speaker: 'Nadia',   text: 'He is thirty years old. He is a teacher.' },
        { speaker: 'Teacher', text: 'He is from Morocco. He is married.' },
        { speaker: 'Nadia',   text: 'He is from Morocco. He is married.' },
        { speaker: 'Teacher', text: 'Perfect. Now try this one: My name is Diae.' },
        { speaker: 'Nadia',   text: 'Her name is Diae.' },
        { speaker: 'Teacher', text: 'I am twenty-five. I am single. I am a nurse.' },
        { speaker: 'Nadia',   text: 'She is twenty-five. She is single. She is a nurse.' },
        { speaker: 'Teacher', text: 'Excellent! You see — only one small change: I → He or She.' },
        { speaker: 'Nadia',   text: 'Yes! And the verb changes too — live becomes lives.' },
        { speaker: 'Teacher', text: 'Exactly. Well done, Nadia!' },
      ],
    },
  ],
}
