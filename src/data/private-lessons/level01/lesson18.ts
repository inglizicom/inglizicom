import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/18/${slug}.jpg`

export const lesson18: Unit = {
  id: 118,
  slug: 'l1-can-cant',
  emoji: '💪',
  level: 'A0 – A1',
  title: { en: "Jobs, Verbs & Can / Can't", ar: 'المهن والأفعال — أستطيع / لا أستطيع' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'أفعال مهمة',
      items: [
        { en: 'Cook', ar: 'يطبخ', examples: ['I can cook rice and pasta.', 'She cooks every day.'], tint: 'amber', image: LOCAL('cook') },
        { en: 'Swim', ar: 'يسبح', examples: ['I can swim.', "He can't swim."], tint: 'sky', image: LOCAL('swim') },
        { en: 'Read', ar: 'يقرأ', examples: ['I can read English.', 'She reads every night.'], tint: 'violet', image: LOCAL('read') },
        { en: 'Write', ar: 'يكتب', examples: ['I can write in English.', 'He writes fast.'], tint: 'violet', image: LOCAL('write') },
        { en: 'Drive', ar: 'يقود', examples: ['I can drive a car.', 'She drives to work.'], tint: 'orange', image: LOCAL('drive') },
        { en: 'Ride', ar: 'يركب', examples: ['I can ride a bicycle.', "He can't ride a motorcycle."], tint: 'emerald', image: LOCAL('ride') },
        { en: 'Play', ar: 'يلعب', examples: ['I can play football.', 'She plays chess.'], tint: 'rose', image: LOCAL('play') },
        { en: 'Fly', ar: 'يطير', examples: ['A pilot can fly an airplane.', "I can't fly."], tint: 'teal', image: LOCAL('fly') },
        { en: 'Speak', ar: 'يتحدث', examples: ['I can speak English.', 'She speaks three languages.'], tint: 'sky', image: LOCAL('speak') },
        { en: 'Carry', ar: 'يحمل', examples: ['He can carry heavy bags.', 'Can you carry this?'], tint: 'amber', image: LOCAL('carry') },
      ],
    },
    {
      kind: 'vocab',
      title: 'المهن',
      items: [
        { en: 'Doctor', ar: 'طبيب', examples: ['A doctor can help sick people.', 'He is a doctor at the hospital.'], tint: 'rose', image: LOCAL('doctor') },
        { en: 'Nurse', ar: 'ممرض', examples: ['A nurse can take care of patients.', 'She is a nurse.'], tint: 'teal', image: LOCAL('nurse') },
        { en: 'Driver', ar: 'سائق', examples: ['A driver can drive a bus or a taxi.', 'He is a taxi driver.'], tint: 'sky', image: LOCAL('driver') },
        { en: 'Pilot', ar: 'طيار', examples: ['A pilot can fly an airplane.', 'My brother is a pilot.'], tint: 'violet', image: LOCAL('pilot') },
        { en: 'Teacher', ar: 'معلم', examples: ['A teacher can teach students.', 'She is an English teacher.'], tint: 'amber', image: LOCAL('teacher') },
        { en: 'Cook', ar: 'طباخ', examples: ['A cook can make delicious food.', 'The cook works in a restaurant.'], tint: 'orange', image: LOCAL('cook-job') },
        { en: 'Manager', ar: 'مدير', examples: ['A manager can run a company.', 'He is a manager at a bank.'], tint: 'emerald', image: LOCAL('manager') },
        { en: 'Lawyer', ar: 'محامٍ', examples: ['A lawyer can work in a court.', 'She is a lawyer.'], tint: 'violet', image: LOCAL('lawyer') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'أستطيع / لا أستطيع',
      patterns: [
        {
          template: 'I can + [verb].',
          templateAr: 'أستطيع + فعل.',
          examples: ['I can drive a car.', 'I can speak English.', 'She can swim and cook.'],
        },
        {
          template: "I can't + [verb].",
          templateAr: 'لا أستطيع + فعل.',
          examples: ["I can't swim.", "He can't fly.", "She can't drive yet."],
        },
        {
          template: "Can you + [verb]?  →  Yes, I can. / No, I can't.",
          templateAr: 'هل تستطيع ___؟  →  نعم / لا',
          examples: [
            "Can you cook? — Yes, I can.",
            "Can you fly an airplane? — No, I can't.",
            "Can she speak Arabic? — Yes, she can.",
          ],
        },
        {
          template: "A [job] can [verb]. / A [job] can't [verb].",
          templateAr: 'شخص المهنة + يستطيع / لا يستطيع',
          examples: [
            'A teacher can teach students.',
            "A cook can't work in a court.",
            'A pilot can fly an airplane.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Lina & Youssef — what can you do?',
      lines: [
        { speaker: 'Lina',    text: 'Youssef — what can you do? For your job, I mean.' },
        { speaker: 'Youssef', text: 'I can drive — a car, a taxi, a bus. And you?' },
        { speaker: 'Lina',    text: "I can't drive. But I can swim and I can read English." },
        { speaker: 'Youssef', text: "Really? I can't swim. I don't like water." },
        { speaker: 'Lina',    text: 'A driver who does not like water — interesting!' },
        { speaker: 'Youssef', text: 'Can you cook?' },
        { speaker: 'Lina',    text: 'Yes! I cook every day. Can you?' },
        { speaker: 'Youssef', text: "A little — tea, eggs. But my mother cooks better." },
        { speaker: 'Lina',    text: 'Can you speak French?' },
        { speaker: 'Youssef', text: "No, I can't. I can speak Arabic and English. And you?" },
        { speaker: 'Lina',    text: 'Same. English is enough for now.' },
        { speaker: 'Youssef', text: 'True. See you tomorrow, Lina!' },
        { speaker: 'Lina',    text: 'Goodbye, Youssef!' },
      ],
    },
  ],
}
