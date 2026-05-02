import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/09/${slug}.jpg`

export const lesson09: Unit = {
  id: 109,
  slug: 'l1-verbs-pronouns',
  emoji: '⚡',
  level: 'A0 – A1',
  title: { en: 'Verbs, Pronouns & Simple Sentences', ar: 'الأفعال والضمائر وتكوين الجمل' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'الضمائر الشخصية',
      items: [
        { en: 'I', ar: 'أنا', examples: ['I am a student.', 'I go to school.', 'I have a book.'], tint: 'amber', image: LOCAL('pronoun-i') },
        { en: 'You', ar: 'أنت / أنتِ', examples: ['You are my friend.', 'You have a book.', 'You go to work.'], tint: 'sky', image: LOCAL('pronoun-you') },
        { en: 'He', ar: 'هو', examples: ['He is a doctor.', 'He goes to work.', 'He has two kids.'], tint: 'emerald', image: LOCAL('pronoun-he') },
        { en: 'She', ar: 'هي', examples: ['She is a teacher.', 'She goes to school.', 'She has a car.'], tint: 'rose', image: LOCAL('pronoun-she') },
        { en: 'We', ar: 'نحن', examples: ['We go to school together.', 'We have two kids.', 'We are students.'], tint: 'violet', image: LOCAL('pronoun-we') },
        { en: 'They', ar: 'هم', examples: ['They are students.', 'They go to work.', 'They have a house.'], tint: 'teal', image: LOCAL('pronoun-they') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'الأفعال الأساسية',
      patterns: [
        {
          template: 'To BE — am / are / is',
          templateAr: 'I am · You are · He/She is · We/They are',
          examples: [
            'I am in class.',
            'He is a nurse.',
            'We are students.',
            'They are in the park.',
          ],
        },
        {
          template: 'To GO — go / goes',
          templateAr: 'I go · He/She goes (نضيف s مع he/she)',
          examples: [
            'I go to work every day.',
            'She goes to school in the morning.',
            'They go before lunch.',
          ],
        },
        {
          template: 'To HAVE — have / has',
          templateAr: 'I have · He/She has',
          examples: [
            'I have a book.',
            'He has two kids.',
            'She has a car.',
          ],
        },
        {
          template: 'To DO — do / does',
          templateAr: 'I do · He/She does',
          examples: [
            'I do my homework every day.',
            'She does her work well.',
            'He does not go to school on Friday.',
          ],
        },
        {
          template: 'Connectors: and · but · or · because · before · after · without',
          templateAr: 'أدوات الربط المهمة',
          examples: [
            'I go to work and she goes to school.',
            'He eats lunch before going to work.',
            'I go without food sometimes.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Sara & Youssef — first meeting at a class',
      lines: [
        { speaker: 'Sara',    text: 'Youssef — are you a student here?' },
        { speaker: 'Youssef', text: 'Yes! But I do not have a book yet.' },
        { speaker: 'Sara',    text: 'Take this one — I have two.' },
        { speaker: 'Youssef', text: 'Thank you. Do you go to school every day?' },
        { speaker: 'Sara',    text: 'Yes, but not on Friday. And you?' },
        { speaker: 'Youssef', text: 'I go every day. My brother goes too — he is a student.' },
        { speaker: 'Sara',    text: 'Oh! Does he have homework today?' },
        { speaker: 'Youssef', text: 'Yes, but he does not understand it.' },
        { speaker: 'Sara',    text: 'I have the book — we can do it together after class.' },
        { speaker: 'Youssef', text: 'We? You and me and my brother?' },
        { speaker: 'Sara',    text: 'Yes — we go, we study, we eat. It is simple!' },
        { speaker: 'Youssef', text: 'Good idea. See you after class, Sara.' },
      ],
    },
  ],
}
