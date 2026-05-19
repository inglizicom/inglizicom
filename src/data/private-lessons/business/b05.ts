import type { Unit } from '../types'

export const b05: Unit = {
  id: 305,
  slug: 'b-presentations',
  emoji: '🎤',
  level: 'B2',
  title: { en: 'Presentations & Pitching', ar: 'العروض التقديمية والترويج للأفكار' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocabCategories',
      title: "From hello to thank-you — the presenter's toolkit",
      categories: [
        {
          name: 'Opening strong',
          nameAr: 'افتتاح قوي',
          items: [
            { en: 'Good morning everyone, thank you for being here.', ar: 'صباح الخير للجميع، شكراً لحضوركم.', tint: 'sky' },
            { en: "Today, I'd like to walk you through…", ar: 'اليوم، أود أن أصحبكم في جولة على…', examples: ["Today, I'd like to walk you through our new product."], tint: 'sky' },
            { en: 'My presentation will take about 15 minutes, followed by Q&A.', ar: 'سيستغرق العرض حوالي 15 دقيقة، تليه أسئلة وأجوبة.', tint: 'sky' },
            { en: "Let me start with a quick question…", ar: 'دعوني أبدأ بسؤال سريع…', tint: 'sky' },
          ],
        },
        {
          name: 'Structuring your talk',
          nameAr: 'هيكلة العرض',
          items: [
            { en: "I'll cover three main points today.", ar: 'سأتناول ثلاث نقاط رئيسية اليوم.', tint: 'amber' },
            { en: "First, let's look at…", ar: 'أولاً، دعنا ننظر إلى…', tint: 'amber' },
            { en: 'Moving on to the next point…', ar: 'ننتقل إلى النقطة التالية…', tint: 'amber' },
            { en: 'To put this in perspective…', ar: 'لنضع هذا في السياق…', tint: 'amber' },
            { en: 'As you can see on this slide…', ar: 'كما ترون في هذه الشريحة…', tint: 'amber' },
          ],
        },
        {
          name: 'Persuading the audience',
          nameAr: 'إقناع الجمهور',
          items: [
            { en: 'The numbers speak for themselves.', ar: 'الأرقام تتحدث عن نفسها.', tint: 'emerald' },
            { en: 'This is a unique opportunity to…', ar: 'هذه فرصة فريدة لـ…', tint: 'emerald' },
            { en: 'Our research shows that…', ar: 'أبحاثنا تظهر أن…', tint: 'emerald' },
            { en: 'Imagine if we could…', ar: 'تخيلوا لو استطعنا…', tint: 'emerald' },
            { en: 'The bottom line is…', ar: 'خلاصة القول هي…', tint: 'emerald' },
          ],
        },
        {
          name: 'Q&A and closing',
          nameAr: 'الأسئلة والأجوبة والختام',
          items: [
            { en: "That's a great question. Let me address that.", ar: 'سؤال رائع. دعني أجيب عليه.', tint: 'violet' },
            { en: "I don't have that exact figure, but I can follow up by email.", ar: 'ليس لدي الرقم بالضبط، لكن سأتابع بالبريد.', tint: 'violet' },
            { en: 'To summarize my key points…', ar: 'لتلخيص النقاط الرئيسية…', tint: 'violet' },
            { en: "Thank you for your attention. I'm happy to take any further questions.", ar: 'شكراً لانتباهكم. يسعدني الإجابة على أي أسئلة إضافية.', tint: 'violet' },
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Opening a product pitch (5-minute version)',
      lines: [
        { speaker: 'Karim', text: "Good morning everyone, and thank you for being here. My name is Karim, and over the next 10 minutes I'd like to introduce you to a tool that could cut your team's email overhead by 40%." },
        { speaker: 'Karim', text: "Let me start with a question: how many hours did your team spend on internal email last week? Most companies we surveyed answered between 8 and 12 hours per person." },
        { speaker: 'Karim', text: "I'll cover three things today. First, the problem we're solving. Second, how our product works. Third, the results our pilot customers have seen." },
        { speaker: 'Karim', text: "So, what's the problem? Email was designed for messages, not for collaboration..." },
        { speaker: 'Sara',  text: 'Karim, sorry to interrupt — what kind of companies were in your pilot?' },
        { speaker: 'Karim', text: "Great question, Sara. The pilot included six SMEs in the marketing services sector, between 20 and 80 employees. I'll come back to specific results in a moment." },
        { speaker: 'Karim', text: "To summarize — the average pilot customer saved 6 hours per employee per week and saw a 22% drop in missed deadlines. The bottom line is: every hour back in your team's day is an hour your team can spend on real work." },
        { speaker: 'Karim', text: "Thank you for your attention. I'm happy to take any questions." },
      ],
      note: 'Strong pitch arc: hook → preview structure → problem → solution → proof → close + Q&A.',
    },
    {
      kind: 'quiz',
      title: 'Presentation phrases',
      questions: [
        { prompt: 'كيف تفتتح عرضاً تقديمياً؟', correct: "Good morning everyone, thank you for being here.", options: ["Hi guys.", "Good morning everyone, thank you for being here.", "Listen up.", "OK, so..."] },
        { prompt: 'كيف تجيب على سؤال لا تعرف إجابته؟', correct: "I don't have that exact figure, but I can follow up by email.", options: ["I don't know.", "Not sure, sorry.", "I don't have that exact figure, but I can follow up by email.", "Why are you asking?"] },
        { prompt: 'كيف تختم العرض؟', correct: "To summarize my key points… Thank you for your attention.", options: ["That's it.", "OK done.", "To summarize my key points… Thank you for your attention.", "Bye."] },
      ],
    },
  ],
}
