import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/03/${slug}.jpg`

export const lesson03: Unit = {
  id: 103,
  slug: 'l1-countries-jobs',
  emoji: '🌍',
  level: 'A0 – A1',
  title: { en: 'Countries, Jobs & Marital Status', ar: 'الدول والمهن والحالة العائلية' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'الدول والجنسيات',
      items: [
        { en: 'I am from Morocco. I am Moroccan.', ar: 'أنا من المغرب. أنا مغربي.', examples: ['Where are you from? — I am from Morocco.'], tint: 'emerald', image: LOCAL('morocco') },
        { en: 'She is from France. She is French.', ar: 'هي من فرنسا. هي فرنسية.', examples: ['She is French. She lives in Paris.'], tint: 'sky', image: LOCAL('france') },
        { en: 'He is from Spain. He is Spanish.', ar: 'هو من إسبانيا. هو إسباني.', examples: ['He is Spanish. He speaks Spanish.'], tint: 'rose', image: LOCAL('spain') },
        { en: 'I am from Egypt. I am Egyptian.', ar: 'أنا من مصر. أنا مصري.', examples: ['She is Egyptian. She is from Cairo.'], tint: 'amber', image: LOCAL('egypt') },
        { en: 'He is from Algeria. He is Algerian.', ar: 'هو من الجزائر. هو جزائري.', examples: ['They are Algerian. They are from Algiers.'], tint: 'emerald', image: LOCAL('algeria') },
        { en: 'What nationality are you?', ar: 'ما جنسيتك؟', examples: ['What is your nationality? — I am Moroccan.'], tint: 'violet', image: LOCAL('nationality') },
      ],
    },
    {
      kind: 'vocab',
      title: 'المهن',
      items: [
        { en: 'I am a teacher.', ar: 'أنا معلم / معلمة.', examples: ['I am a teacher. I teach English.', 'She is a teacher at a primary school.'], tint: 'sky', image: LOCAL('teacher') },
        { en: 'I am a doctor.', ar: 'أنا طبيب / طبيبة.', examples: ['He is a doctor. He works at a hospital.'], tint: 'rose', image: LOCAL('doctor') },
        { en: 'I am a student.', ar: 'أنا طالب / طالبة.', examples: ['I am a student. I study English.'], tint: 'amber', image: LOCAL('student') },
        { en: 'I am an engineer.', ar: 'أنا مهندس / مهندسة.', examples: ['He is an engineer. He designs buildings.'], tint: 'emerald', image: LOCAL('engineer') },
        { en: 'I am a nurse.', ar: 'أنا ممرض / ممرضة.', examples: ['She is a nurse. She works at night.'], tint: 'teal', image: LOCAL('nurse') },
        { en: 'I am a housewife.', ar: 'أنا ربة بيت.', examples: ['She is a housewife. She takes care of her family.'], tint: 'rose', image: LOCAL('housewife') },
        { en: "I am jobless. / I don't have a job.", ar: 'أنا بدون عمل / لا أعمل حالياً.', examples: ["I don't have a job right now.", "I'm jobless. I'm looking for work."], tint: 'sky', image: LOCAL('jobless') },
        { en: 'I am between jobs.', ar: 'أنا بين وظيفتين / أبحث عن عمل.', examples: ["I'm between jobs right now.", "He is between jobs. He had an interview yesterday."], tint: 'teal', image: LOCAL('between-jobs') },
        { en: 'What is your job? / What do you do?', ar: 'ما هي مهنتك؟ / ماذا تعمل؟', examples: ['What do you do? — I am a barber.', "What's your job? — I'm a pilot."], tint: 'violet', image: LOCAL('job-question') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'الحالة العائلية',
      patterns: [
        {
          template: 'Are you single / married / divorced?',
          templateAr: 'هل أنت أعزب / متزوج / مطلق؟',
          examples: ['Are you married? — Yes, I am.', 'Are you single? — No, I am not. I am engaged.'],
        },
        {
          template: 'I am single / married / divorced.',
          templateAr: 'أنا أعزب / متزوج / مطلق.',
          examples: ["I'm single. I live with my parents.", "I'm married and I have two kids."],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Hamza & Sara — getting to know each other',
      lines: [
        { speaker: 'Hamza', text: 'Hello! I am Hamza. What is your name?' },
        { speaker: 'Sara',  text: 'Sara. Nice to meet you, Hamza.' },
        { speaker: 'Hamza', text: 'Nice to meet you too. Where are you from, Sara?' },
        { speaker: 'Sara',  text: 'I am from Spain. And you?' },
        { speaker: 'Hamza', text: 'I am from Morocco. What is your job?' },
        { speaker: 'Sara',  text: 'I am a nurse — I work at a hospital. And you?' },
        { speaker: 'Hamza', text: 'I am a teacher. Are you married?' },
        { speaker: 'Sara',  text: 'No, I am single. And you?' },
        { speaker: 'Hamza', text: 'I am married. I have two kids.' },
        { speaker: 'Sara',  text: 'Oh nice! See you tomorrow, Hamza.' },
        { speaker: 'Hamza', text: 'See you, Sara. Have a good day!' },
      ],
    },
  ],
}
