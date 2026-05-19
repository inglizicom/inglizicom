import type { Unit } from '../types'

export const b06: Unit = {
  id: 306,
  slug: 'b-job-interviews',
  emoji: '💼',
  level: 'B2',
  title: { en: 'Job Interviews', ar: 'مقابلات العمل' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocabCategories',
      title: 'Answer like a pro',
      categories: [
        {
          name: 'Tell me about yourself',
          nameAr: 'حدثني عن نفسك',
          items: [
            { en: "I'm a marketing professional with five years of experience in digital campaigns.", ar: 'أنا متخصص في التسويق مع خمس سنوات من الخبرة في الحملات الرقمية.', tint: 'sky' },
            { en: "Currently, I'm leading a team of three at Atlas Tech.", ar: 'حالياً أقود فريقاً من ثلاثة في أطلس تك.', tint: 'sky' },
            { en: "Before that, I worked at NorthBridge as a junior strategist.", ar: 'قبل ذلك، عملت في نورثبريدج كاستراتيجي مبتدئ.', tint: 'sky' },
            { en: "I'm passionate about turning data into clear stories.", ar: 'لدي شغف بتحويل البيانات إلى قصص واضحة.', tint: 'sky' },
          ],
        },
        {
          name: 'Strengths & weaknesses',
          nameAr: 'نقاط القوة والضعف',
          items: [
            { en: 'My greatest strength is my ability to listen and synthesize.', ar: 'أكبر نقطة قوة لدي هي قدرتي على الاستماع والتلخيص.', tint: 'amber' },
            { en: "I'm a strong communicator and a fast learner.", ar: 'أنا متواصل قوي وأتعلم بسرعة.', tint: 'amber' },
            { en: "A weakness I've been working on is public speaking — I joined a Toastmasters club to improve.", ar: 'نقطة ضعف أعمل عليها هي التحدث أمام الجمهور — انضممت إلى نادي توستماسترز للتحسين.', tint: 'amber', note: 'دائماً اذكر نقطة الضعف مع الحل.' },
            { en: "I sometimes take on too much. I've learned to delegate more.", ar: 'أحياناً أتحمّل أكثر من اللازم. تعلمت أن أفوّض المهام أكثر.', tint: 'amber' },
          ],
        },
        {
          name: 'Why this company / role?',
          nameAr: 'لماذا هذه الشركة / الوظيفة؟',
          items: [
            { en: "I've followed your work in sustainable packaging for years.", ar: 'تابعت عملكم في التغليف المستدام لسنوات.', tint: 'emerald' },
            { en: 'Your mission really resonates with my own values.', ar: 'رسالتكم تتوافق فعلاً مع قيمي الشخصية.', tint: 'emerald' },
            { en: 'This role is the natural next step in my career.', ar: 'هذه الوظيفة هي الخطوة الطبيعية التالية في مسيرتي.', tint: 'emerald' },
            { en: "I see a great opportunity to apply my skills and grow with your team.", ar: 'أرى فرصة رائعة لتطبيق مهاراتي والنمو مع فريقكم.', tint: 'emerald' },
          ],
        },
        {
          name: 'Asking smart questions back',
          nameAr: 'طرح أسئلة ذكية',
          items: [
            { en: "What would success in this role look like in the first 90 days?", ar: 'كيف يبدو النجاح في هذه الوظيفة في أول 90 يوماً؟', tint: 'violet' },
            { en: "How would you describe the team culture?", ar: 'كيف تصف ثقافة الفريق؟', tint: 'violet' },
            { en: "What are the biggest challenges the team is facing right now?", ar: 'ما أكبر التحديات التي يواجهها الفريق حالياً؟', tint: 'violet' },
            { en: "What are the next steps in the hiring process?", ar: 'ما هي الخطوات التالية في عملية التوظيف؟', tint: 'violet' },
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'A real interview exchange',
      lines: [
        { speaker: 'Interviewer', text: "Karim, thanks for coming in. Let's start simple — tell me about yourself." },
        { speaker: 'Karim',       text: "Of course. I'm a marketing professional with five years of experience, currently leading a team of three at Atlas Tech. Before that, I spent two years at NorthBridge as a junior strategist. I'm especially passionate about turning customer data into clear narratives — which is why this Senior Marketing Strategist role caught my attention." },
        { speaker: 'Interviewer', text: "Great. What would you say is your biggest weakness?" },
        { speaker: 'Karim',       text: "Honestly, public speaking in large rooms used to make me nervous. I joined a local Toastmasters club a year ago and have presented at two industry events since. I'd still call it a growth area, but I've made real progress." },
        { speaker: 'Interviewer', text: "And why our company specifically?" },
        { speaker: 'Karim',       text: "Two reasons. First, I've followed your work in sustainable packaging since your 2024 campaign. Second, your team culture — based on your engineering blog and the conversations I had with two former employees — sounds genuinely collaborative. That matches what I'm looking for next." },
        { speaker: 'Interviewer', text: "Excellent. Do you have any questions for me?" },
        { speaker: 'Karim',       text: "Yes, three if that's okay. What would success in this role look like in the first 90 days? How would you describe the team culture in your own words? And what are the next steps after today?" },
      ],
      note: 'Notice the structure: STAR-like answers, concrete examples, and questions that show research + interest.',
    },
    {
      kind: 'quiz',
      title: 'Interview self-check',
      questions: [
        { prompt: 'كيف تجيب على "ما هي نقطة ضعفك"؟', correct: "I've sometimes taken on too much. I've been actively learning to delegate more.", options: ["I have no weaknesses.", "I work too hard.", "I've sometimes taken on too much. I've been actively learning to delegate more.", "I'm bad at everything."] },
        { prompt: 'أي سؤال يدل على اهتمام جدي بالوظيفة؟', correct: "What would success in this role look like in the first 90 days?", options: ["When do I get paid?", "What would success in this role look like in the first 90 days?", "Do I have to work weekends?", "Can I leave early on Fridays?"] },
        { prompt: 'لماذا تختم بـ "What are the next steps?"', correct: 'It shows interest, professionalism, and helps you plan follow-up.', options: ['It fills silence.', 'It is impolite.', 'It shows interest, professionalism, and helps you plan follow-up.', 'It is required by law.'] },
      ],
    },
  ],
}
