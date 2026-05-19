import type { Unit } from '../types'

export const b02: Unit = {
  id: 302,
  slug: 'b-emails-professional-writing',
  emoji: '✉️',
  level: 'B1',
  title: { en: 'Emails & Professional Writing', ar: 'البريد الإلكتروني والكتابة المهنية' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocabCategories',
      title: 'Email building blocks',
      categories: [
        {
          name: 'Opening',
          nameAr: 'افتتاح الرسالة',
          items: [
            { en: 'Dear Mr. Hassan,', ar: 'السيد حسن المحترم،', examples: ['Dear Ms. Karim,', 'Dear Hiring Manager,'], tint: 'sky' },
            { en: 'Hi Sara,', ar: 'مرحباً سارة،', examples: ['Hi team,', 'Hi everyone,'], tint: 'sky', note: 'مقبول داخل الفريق وبين الزملاء.' },
            { en: 'To whom it may concern,', ar: 'إلى من يهمه الأمر،', tint: 'sky', note: 'عندما لا تعرف الاسم.' },
            { en: 'I hope this email finds you well.', ar: 'أرجو أن تصلك هذه الرسالة وأنت بخير.', tint: 'sky' },
            { en: 'Thank you for your prompt reply.', ar: 'شكراً على ردك السريع.', tint: 'sky' },
          ],
        },
        {
          name: 'Stating the reason',
          nameAr: 'توضيح سبب الرسالة',
          items: [
            { en: "I'm writing to inquire about…", ar: 'أكتب إليك للاستفسار عن…', examples: ["I'm writing to inquire about your pricing."], tint: 'amber' },
            { en: "I'm following up on our conversation last week.", ar: 'أتابع معك بخصوص محادثتنا الأسبوع الماضي.', tint: 'amber' },
            { en: 'I would like to confirm the meeting on Tuesday.', ar: 'أود تأكيد الاجتماع يوم الثلاثاء.', tint: 'amber' },
            { en: 'Please find attached the report.', ar: 'تجدون التقرير في المرفقات.', tint: 'amber' },
          ],
        },
        {
          name: 'Requests & polite asks',
          nameAr: 'الطلبات المهذبة',
          items: [
            { en: 'Could you please send me the latest version?', ar: 'هل يمكنك إرسال أحدث نسخة من فضلك؟', tint: 'emerald' },
            { en: 'Would it be possible to reschedule to Friday?', ar: 'هل من الممكن إعادة الجدولة ليوم الجمعة؟', tint: 'emerald' },
            { en: "I'd appreciate it if you could…", ar: 'سأكون ممتناً إن تمكنت من…', examples: ["I'd appreciate it if you could review this by Monday."], tint: 'emerald' },
            { en: 'When would be convenient for you?', ar: 'متى يناسبك؟', tint: 'emerald' },
          ],
        },
        {
          name: 'Closing',
          nameAr: 'إنهاء الرسالة',
          items: [
            { en: 'Looking forward to your reply.', ar: 'في انتظار ردكم.', tint: 'violet' },
            { en: 'Please let me know if you need any further information.', ar: 'أعلمني إن احتجت معلومات إضافية.', tint: 'violet' },
            { en: 'Best regards,', ar: 'مع أطيب التحيات،', examples: ['Kind regards,', 'Sincerely,'], tint: 'violet' },
            { en: 'Thank you for your time and consideration.', ar: 'شكراً لوقتك واهتمامك.', tint: 'violet' },
          ],
        },
      ],
    },
    {
      kind: 'reading',
      title: 'A complete professional email',
      titleAr: 'نموذج رسالة احترافية كاملة',
      text:
        'Subject: Proposal review — feedback by Friday\n\n' +
        'Dear Sara,\n\n' +
        'I hope this email finds you well. I am writing to follow up on the proposal I sent you last Tuesday. ' +
        'We would really value your feedback before we finalize the document next week.\n\n' +
        'Could you please review the attached version and share your thoughts by Friday? ' +
        'If anything is unclear, I\'d be happy to schedule a 15-minute call.\n\n' +
        'Thank you for your time and consideration. Looking forward to your reply.\n\n' +
        'Best regards,\n' +
        'Karim Ouazzani\n' +
        'Marketing Manager · Atlas Tech',
      textAr:
        'الموضوع: مراجعة المقترح — التغذية الراجعة بحلول الجمعة\n\n' +
        'السيدة سارة المحترمة،\n\n' +
        'أرجو أن تصلك هذه الرسالة وأنت بخير. أكتب إليك للمتابعة بشأن المقترح الذي أرسلته إليك يوم الثلاثاء الماضي. ' +
        'نحن نقدّر تغذيتك الراجعة قبل أن ننهي الوثيقة الأسبوع المقبل.\n\n' +
        'هل يمكنك من فضلك مراجعة النسخة المرفقة ومشاركة ملاحظاتك بحلول الجمعة؟ ' +
        'إذا كان أي شيء غير واضح، يسعدني تحديد مكالمة قصيرة لمدة 15 دقيقة.\n\n' +
        'شكراً لوقتك واهتمامك. في انتظار ردك.\n\n' +
        'مع أطيب التحيات،\n' +
        'كريم الوزاني\n' +
        'مدير التسويق · أطلس تك',
      translations: {
        'follow up': 'يتابع',
        attached: 'مرفق',
        review: 'يراجع',
        proposal: 'مقترح',
        feedback: 'تغذية راجعة / ملاحظات',
        finalize: 'يضع اللمسات الأخيرة',
        schedule: 'يحدد موعداً',
      },
      vocab: [
        { word: 'subject', ar: 'الموضوع (سطر العنوان)' },
        { word: 'follow up', ar: 'يتابع' },
        { word: 'value', ar: 'يقدّر / يثمّن' },
        { word: 'attached', ar: 'مرفق' },
        { word: 'unclear', ar: 'غير واضح' },
        { word: 'consideration', ar: 'اهتمام / مراعاة' },
      ],
      blanks: [
        { before: 'I hope this email ___ you well.', after: '', answer: 'finds', options: ['finds', 'meets', 'sees', 'gets'] },
        { before: 'Please find ___ the report.', after: '', answer: 'attached', options: ['attached', 'attaching', 'attach', 'attachment'] },
        { before: 'Looking ___ to your reply.', after: '', answer: 'forward', options: ['forward', 'over', 'after', 'around'] },
      ],
    },
    {
      kind: 'quiz',
      title: 'Email register — formal or informal?',
      questions: [
        { prompt: 'أي صياغة هي الأنسب لعميل جديد لا تعرفه؟', correct: 'Dear Mr. Hassan, I hope this email finds you well.', options: ['Hey Hassan!', 'Yo, Hassan.', 'Dear Mr. Hassan, I hope this email finds you well.', 'Hassan — quick one.'] },
        { prompt: 'أي طلب هو الأكثر مهنية؟', correct: 'Could you please send me the latest version when you have a moment?', options: ['Send me the file ASAP.', 'I need the file now.', 'Could you please send me the latest version when you have a moment?', 'Where is the file??'] },
        { prompt: 'أي ختام رسمي مناسب لرسالة احترافية؟', correct: 'Best regards,', options: ['XOXO,', 'Cheers!', 'Best regards,', 'Later,'] },
      ],
    },
  ],
}
