import type { Unit } from '../types'

export const b03: Unit = {
  id: 303,
  slug: 'b-phone-calls',
  emoji: '📞',
  level: 'B1',
  title: { en: 'Phone Calls & Voicemail', ar: 'المكالمات الهاتفية والرسائل الصوتية' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocabCategories',
      title: 'Phone conversation toolkit',
      categories: [
        {
          name: 'Answering the phone',
          nameAr: 'الرد على المكالمة',
          items: [
            { en: 'Atlas Tech, this is Karim speaking. How may I help you?', ar: 'أطلس تك، معك كريم. كيف يمكنني مساعدتك؟', tint: 'sky' },
            { en: 'Good morning, marketing department.', ar: 'صباح الخير، قسم التسويق.', tint: 'sky' },
            { en: 'Who is calling, please?', ar: 'مع من أتشرف من فضلك؟', tint: 'sky' },
            { en: 'How can I direct your call?', ar: 'إلى من تود أن أحوّل مكالمتك؟', tint: 'sky' },
          ],
        },
        {
          name: 'Stating your purpose',
          nameAr: 'توضيح سبب الاتصال',
          items: [
            { en: "This is Sara from NorthBridge. I'm calling about the proposal.", ar: 'معك سارة من نورثبريدج. أتصل بخصوص المقترح.', tint: 'amber' },
            { en: "I'm returning your call from this morning.", ar: 'أعاود الاتصال بك بعد مكالمتك صباحاً.', tint: 'amber' },
            { en: 'Could I speak to Mr. Hassan, please?', ar: 'هل يمكنني التحدث مع السيد حسن من فضلك؟', tint: 'amber' },
            { en: "I'd like to schedule a meeting for next week.", ar: 'أود تحديد اجتماع للأسبوع المقبل.', tint: 'amber' },
          ],
        },
        {
          name: 'Asking to wait / transfer',
          nameAr: 'الانتظار والتحويل',
          items: [
            { en: 'Could you hold the line for a moment, please?', ar: 'هل يمكنك الانتظار للحظة من فضلك؟', tint: 'emerald' },
            { en: "I'll put you through to her now.", ar: 'سأحوّلك إليها الآن.', tint: 'emerald' },
            { en: "I'm afraid she's in a meeting. Can I take a message?", ar: 'للأسف هي في اجتماع. هل أترك لها رسالة؟', tint: 'emerald' },
            { en: "She'll get back to you as soon as possible.", ar: 'ستعاود الاتصال بك في أقرب وقت ممكن.', tint: 'emerald' },
          ],
        },
        {
          name: 'Voicemail message',
          nameAr: 'الرسالة الصوتية',
          items: [
            { en: "Hi, this is Karim from Atlas Tech. I'm calling to follow up on…", ar: 'مرحباً، معك كريم من أطلس تك. أتصل للمتابعة بخصوص…', tint: 'violet' },
            { en: 'Please call me back at your earliest convenience.', ar: 'الرجاء معاودة الاتصال بي في أقرب وقت يناسبك.', tint: 'violet' },
            { en: 'My number is 0707-902-091.', ar: 'رقمي هو 0707-902-091.', tint: 'violet' },
            { en: 'Thank you, and I look forward to hearing from you.', ar: 'شكراً، وأتطلع لسماع ردك.', tint: 'violet' },
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Calling a supplier',
      lines: [
        { speaker: 'Receptionist', text: 'NorthBridge Logistics, good morning. How may I direct your call?' },
        { speaker: 'Karim',        text: 'Good morning, this is Karim Ouazzani from Atlas Tech. Could I speak to Ms. Sara Belhaj, please?' },
        { speaker: 'Receptionist', text: "One moment, please. May I ask what it's regarding?" },
        { speaker: 'Karim',        text: "Yes, I'm calling about our March shipping schedule." },
        { speaker: 'Receptionist', text: 'Thank you. Could you hold the line for a moment?' },
        { speaker: 'Karim',        text: 'Of course.' },
        { speaker: 'Receptionist', text: "I'm afraid Ms. Belhaj is in a meeting until 11. Would you like to leave a message?" },
        { speaker: 'Karim',        text: "Yes, please. Could you ask her to call me back on 0707-902-091 when she's free?" },
        { speaker: 'Receptionist', text: "Certainly. I'll let her know. Anything else?" },
        { speaker: 'Karim',        text: "No, that\'s all. Thank you very much for your help." },
        { speaker: 'Receptionist', text: "You're welcome. Have a great day." },
      ],
      note: 'Phone English is more formal than face-to-face. Use full names, "could you please", and confirm callback numbers slowly.',
    },
    {
      kind: 'quiz',
      title: 'Quick phone check',
      questions: [
        { prompt: 'كيف تقدم نفسك عند الرد على مكالمة عمل؟', correct: 'Atlas Tech, this is Karim speaking. How may I help you?', options: ['Hello?', 'Atlas Tech, this is Karim speaking. How may I help you?', 'Yeah, hi.', 'What do you want?'] },
        { prompt: 'كيف تطلب من الشخص الانتظار بأدب؟', correct: 'Could you hold the line for a moment, please?', options: ['Wait.', 'Hold on.', 'Could you hold the line for a moment, please?', 'Hang on a sec.'] },
        { prompt: 'كيف تترك رسالة صوتية احترافية؟', correct: 'Please call me back at your earliest convenience.', options: ['Call me back ASAP!', 'Call me back when you can.', 'Please call me back at your earliest convenience.', 'You should call me.'] },
      ],
    },
  ],
}
