import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/06/${slug}.jpg`

export const lesson06: Unit = {
  id: 106,
  slug: 'l1-introductions',
  emoji: '🙋',
  level: 'A0 – A1',
  title: { en: 'Introductions & WH-Questions', ar: 'التعريف بالنفس وكلمات الاستفهام' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'كلمات الاستفهام',
      items: [
        { en: 'WHAT — ماذا / ما', ar: 'ماذا؟ / ما؟', examples: ["What's your name?", 'What do you do?', 'What does he love?'], tint: 'amber', image: LOCAL('what') },
        { en: 'WHERE — أين / فين', ar: 'أين؟', examples: ['Where are you from?', 'Where do you live?'], tint: 'sky', image: LOCAL('where') },
        { en: 'WHEN — متى / إيمتا', ar: 'متى؟', examples: ['When is your birthday?', 'When do you go to school?'], tint: 'violet', image: LOCAL('when') },
        { en: 'WHO — من / شكون', ar: 'من؟', examples: ['Who is your friend?', 'Who is your teacher?'], tint: 'rose', image: LOCAL('who') },
        { en: 'HOW — كيف / كفاش', ar: 'كيف؟', examples: ['How are you?', 'How do you go to school?'], tint: 'emerald', image: LOCAL('how') },
        { en: 'WHY — لماذا / علاش', ar: 'لماذا؟', examples: ['Why are you here?', 'Why do you like English?'], tint: 'orange', image: LOCAL('why') },
        { en: 'HOW OLD — كم عمر', ar: 'كم عمرك؟', examples: ['How old are you?', 'How old is he?'], tint: 'teal', image: LOCAL('how-old') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'قدّم نفسك بالإنجليزية',
      patterns: [
        {
          template: 'Hello, my name is ___. I am ___ years old.',
          templateAr: 'مرحباً، اسمي ___. عمري ___ سنة.',
          examples: [
            'Hello, my name is Hamza. I am 28 years old.',
            'Hi, my name is Sara. I am 22 years old.',
          ],
        },
        {
          template: 'I am from ___. I live in ___.',
          templateAr: 'أنا من ___. أسكن في ___.',
          examples: ['I am from Morocco. I live in Casablanca.', 'I am from Egypt. I live in Cairo.'],
        },
        {
          template: 'I am a ___. I work / study at ___.',
          templateAr: 'أنا ___. أعمل / أدرس في ___.',
          examples: ['I am a teacher. I work at a school.', 'I am a student. I study at university.'],
        },
        {
          template: 'I am (single / married). I live with my ___.',
          templateAr: 'أنا (أعزب / متزوج). أسكن مع ___.',
          examples: ['I am married. I live with my wife and three kids.', 'I am single. I live with my parents.'],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Omar & Fatima — getting to know each other',
      lines: [
        { speaker: 'Omar',   text: 'Excuse me — are you a student here?' },
        { speaker: 'Fatima', text: 'Yes! My name is Fatima. And you?' },
        { speaker: 'Omar',   text: 'I am Omar. Where are you from, Fatima?' },
        { speaker: 'Fatima', text: 'I am from Rabat. I live here too. And you?' },
        { speaker: 'Omar',   text: 'I am from Fez — but I live in Casablanca now.' },
        { speaker: 'Fatima', text: 'Casablanca is big! How old are you?' },
        { speaker: 'Omar',   text: 'I am twenty-five. And you?' },
        { speaker: 'Fatima', text: 'I am twenty-two. What is your job?' },
        { speaker: 'Omar',   text: 'I am a driver. And you?' },
        { speaker: 'Fatima', text: 'I am a teacher. I love teaching.' },
        { speaker: 'Omar',   text: 'Why do you love it?' },
        { speaker: 'Fatima', text: 'Because I love people.' },
        { speaker: 'Omar',   text: 'Are you married?' },
        { speaker: 'Fatima', text: 'No, I am single. And you?' },
        { speaker: 'Omar',   text: 'Single too. Nice to meet you, Fatima.' },
        { speaker: 'Fatima', text: 'You too, Omar. See you in class!' },
      ],
    },
  ],
}
