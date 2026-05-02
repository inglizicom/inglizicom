import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/08/${slug}.jpg`

export const lesson08: Unit = {
  id: 108,
  slug: 'l1-classroom',
  emoji: '🏫',
  level: 'A0 – A1',
  title: { en: 'Classroom Vocabulary & Commands', ar: 'مصطلحات القسم والأوامر' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'أدوات القسم',
      items: [
        { en: 'Notebook / Book', ar: 'الدفتر / الكتاب', examples: ['Open your notebook.', 'Take out your book.'], tint: 'amber', image: LOCAL('notebook') },
        { en: 'Pen / Pencil', ar: 'القلم / القلم الرصاص', examples: ['Use a pen, not a pencil.', 'Take your pencil.'], tint: 'sky', image: LOCAL('pen-pencil') },
        { en: 'Board / Eraser', ar: 'السبورة / الممحاة', examples: ['Look at the board.', 'Use the eraser.'], tint: 'violet', image: LOCAL('board-eraser') },
        { en: 'Desk / Chair', ar: 'المكتب / الكرسي', examples: ['Sit on your chair.', 'Put your book on the desk.'], tint: 'emerald', image: LOCAL('desk-chair') },
        { en: 'Homework / Exam', ar: 'الواجب المنزلي / الامتحان', examples: ['Do your homework every day.', 'The exam is on Monday.'], tint: 'rose', image: LOCAL('homework-exam') },
        { en: 'School / Classroom', ar: 'المدرسة / القسم / الفصل', examples: ['I go to school every day.', 'The classroom is clean.'], tint: 'teal', image: LOCAL('school-class') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'عبارات القسم — للطالب والمعلم',
      patterns: [
        {
          template: 'Student phrases',
          templateAr: 'عبارات الطالب',
          examples: [
            'Can you repeat, please?',
            "I don't understand.",
            'Can I go to the bathroom?',
            'I finished.',
            'What page, please?',
            'I forgot my book.',
            'Excuse me, I have a question.',
          ],
        },
        {
          template: 'Teacher phrases',
          templateAr: 'عبارات المعلم',
          examples: [
            'Open your books.',
            'Repeat after me.',
            'Focus, everyone.',
            "Time's up.",
            'Raise your hand.',
            'Good job! / Well done!',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Sara & Ali — before class starts',
      lines: [
        { speaker: 'Sara',    text: 'Ali — do you have a pen? I forgot my pencilcase.' },
        { speaker: 'Ali',     text: 'Yes, take this one.' },
        { speaker: 'Sara',    text: 'Thank you! I also forgot my homework.' },
        { speaker: 'Ali',     text: 'The teacher is here. Ask at the end.' },
        { speaker: 'Teacher', text: 'Good morning! Open your books — page five.' },
        { speaker: 'Ali',     text: 'Excuse me — I have a question.' },
        { speaker: 'Teacher', text: 'Yes, Ali. Go ahead.' },
        { speaker: 'Ali',     text: "I don't understand exercise three." },
        { speaker: 'Teacher', text: 'No problem. Read the first sentence — can you?' },
        { speaker: 'Ali',     text: '"My name is Hamza. I am from Morocco."' },
        { speaker: 'Teacher', text: 'Well done! Now repeat after me — everyone.' },
        { speaker: 'Sara',    text: '"My name is Hamza. I am from Morocco."' },
        { speaker: 'Teacher', text: 'Good job. Any more questions?' },
        { speaker: 'Sara',    text: 'Can I go to the bathroom, please?' },
        { speaker: 'Teacher', text: 'Yes — be quick!' },
      ],
    },
  ],
}
