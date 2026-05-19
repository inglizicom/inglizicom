import type { Unit } from '../types'

export const b01: Unit = {
  id: 301,
  slug: 'b-introductions-networking',
  emoji: '🤝',
  level: 'B1',
  title: { en: 'Introductions & Networking', ar: 'التعارف وبناء العلاقات المهنية' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocabCategories',
      title: 'Business introductions vocabulary',
      categories: [
        {
          name: 'Self-introduction',
          nameAr: 'التعريف بالنفس',
          items: [
            { en: 'My name is Karim. I work as a marketing manager at Atlas Tech.', ar: 'اسمي كريم. أعمل مديراً للتسويق في شركة أطلس تك.', examples: ['I work in finance.', 'I work as a software engineer.'], tint: 'sky' },
            { en: "I'm responsible for…", ar: 'أنا مسؤول عن…', examples: ["I'm responsible for the European market.", "I'm responsible for client relations."], tint: 'sky' },
            { en: 'I have 5 years of experience in this field.', ar: 'لدي 5 سنوات من الخبرة في هذا المجال.', examples: ['I have 3 years of experience in sales.'], tint: 'sky' },
            { en: 'I specialize in digital marketing.', ar: 'متخصص في التسويق الرقمي.', examples: ['I specialize in B2B sales.'], tint: 'sky' },
          ],
        },
        {
          name: 'Meeting someone new',
          nameAr: 'لقاء شخص جديد',
          items: [
            { en: 'Pleased to meet you.', ar: 'تشرفت بلقائك.', examples: ['Pleased to meet you, Mr. Hassan.'], tint: 'emerald' },
            { en: "It's a pleasure to finally meet you in person.", ar: 'يسعدني أخيراً لقاؤك شخصياً.', tint: 'emerald' },
            { en: 'How do you do?', ar: 'كيف حالك؟ (تعارف رسمي).', tint: 'emerald' },
            { en: "I've heard a lot about you.", ar: 'سمعت الكثير عنك.', tint: 'emerald' },
            { en: 'Let me introduce you to my colleague.', ar: 'دعني أعرّفك بزميلي.', examples: ['Let me introduce you to our CFO.'], tint: 'emerald' },
          ],
        },
        {
          name: 'Exchanging contacts',
          nameAr: 'تبادل بيانات الاتصال',
          items: [
            { en: "Here's my business card.", ar: 'تفضل، هذه بطاقة عملي.', tint: 'amber' },
            { en: "Could I have your card, please?", ar: 'هل لي ببطاقتك من فضلك؟', tint: 'amber' },
            { en: "Let's stay in touch.", ar: 'لنبقَ على تواصل.', tint: 'amber' },
            { en: "Feel free to reach out anytime.", ar: 'تواصل معي في أي وقت بحرية.', tint: 'amber' },
            { en: "I'll connect with you on LinkedIn.", ar: 'سأتواصل معك عبر لينكدإن.', tint: 'amber' },
          ],
        },
        {
          name: 'Wrapping up the conversation',
          nameAr: 'إنهاء المحادثة',
          items: [
            { en: 'It was great talking with you.', ar: 'كان من الرائع التحدث معك.', tint: 'violet' },
            { en: 'I hope we can work together soon.', ar: 'آمل أن نعمل معاً قريباً.', tint: 'violet' },
            { en: 'Have a great rest of your day.', ar: 'أتمنى لك يوماً سعيداً.', tint: 'violet' },
            { en: "I'll follow up with an email tomorrow.", ar: 'سأتابع معك برسالة بريد إلكتروني غداً.', tint: 'violet' },
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'A first meeting at a conference',
      lines: [
        { speaker: 'Karim',  text: "Hello, I don't think we've met. I'm Karim, marketing manager at Atlas Tech." },
        { speaker: 'Sophie', text: "Hi Karim, pleased to meet you. I'm Sophie, head of partnerships at NorthBridge." },
        { speaker: 'Karim',  text: "Nice to meet you, Sophie. Are you enjoying the conference so far?" },
        { speaker: 'Sophie', text: "Yes, the keynote this morning was excellent. What about you?" },
        { speaker: 'Karim',  text: "Same here. I particularly liked the panel on AI in marketing. That's actually my area." },
        { speaker: 'Sophie', text: "Interesting! We've been exploring AI tools for our outreach campaigns." },
        { speaker: 'Karim',  text: "Maybe we could have a quick coffee tomorrow and exchange notes?" },
        { speaker: 'Sophie', text: "I'd love that. Here's my card — feel free to email me with a time that works." },
        { speaker: 'Karim',  text: "Perfect. And here's mine. I'll send you an invitation tonight." },
        { speaker: 'Sophie', text: "Wonderful. It was great talking with you, Karim." },
        { speaker: 'Karim',  text: "Likewise, Sophie. Have a great rest of your day." },
      ],
      note: 'Notice the rhythm: greet → introduce role → small talk → identify shared interest → propose next step → exchange contacts → polite close.',
    },
    {
      kind: 'quiz',
      title: 'Quick check — pick the most professional version',
      questions: [
        { prompt: 'كيف تعرّف عن نفسك في لقاء عمل أول؟', correct: "My name is Karim. I work as a marketing manager at Atlas Tech.", options: ["Hey, I'm Karim from Atlas.", "My name is Karim. I work as a marketing manager at Atlas Tech.", "Karim. Atlas. Marketing.", "What's up? I'm Karim."] },
        { prompt: 'كيف تطلب بطاقة عمل من شخص بشكل مهذب؟', correct: 'Could I have your card, please?', options: ['Give me your card.', 'Card?', 'Could I have your card, please?', 'I need your card now.'] },
        { prompt: 'كيف تنهي محادثة شبكية بشكل احترافي؟', correct: 'It was great talking with you. I hope we can work together soon.', options: ['Bye.', "Gotta go, see ya.", 'It was great talking with you. I hope we can work together soon.', 'OK done.'] },
        { prompt: 'أي تعبير يُستخدم لاقتراح متابعة لاحقة؟', correct: "I'll follow up with an email tomorrow.", options: ["I'll text you maybe.", "I'll follow up with an email tomorrow.", "Whatever, see you.", "I might call."] },
      ],
    },
    {
      kind: 'review',
      title: 'Review — say it out loud',
      items: [
        { en: "My name is ___. I work as a ___ at ___.", ar: 'اسمي ___. أعمل ___ في ___.' },
        { en: "Pleased to meet you. I've heard a lot about you.", ar: 'تشرفت بلقائك. سمعت الكثير عنك.' },
        { en: "Could I have your card, please?", ar: 'هل لي ببطاقتك من فضلك؟' },
        { en: "Let's stay in touch. I'll follow up by email tomorrow.", ar: 'لنبقَ على تواصل. سأتابع معك بالبريد غداً.' },
        { en: "It was great talking with you. Have a wonderful day.", ar: 'كان من الرائع التحدث معك. أتمنى لك يوماً سعيداً.' },
      ],
    },
  ],
}
