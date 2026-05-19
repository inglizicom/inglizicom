import type { Unit } from '../types'

export const b04: Unit = {
  id: 304,
  slug: 'b-meetings',
  emoji: '🗂️',
  level: 'B1+',
  title: { en: 'Meetings & Agendas', ar: 'الاجتماعات وجدول الأعمال' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocabCategories',
      title: 'Meeting phrases that get things done',
      categories: [
        {
          name: 'Opening the meeting',
          nameAr: 'افتتاح الاجتماع',
          items: [
            { en: "Thank you all for coming. Let's get started.", ar: 'شكراً للجميع على الحضور. لنبدأ.', tint: 'sky' },
            { en: "The purpose of today's meeting is to…", ar: 'الهدف من اجتماع اليوم هو…', examples: ["The purpose of today's meeting is to review Q1 results."], tint: 'sky' },
            { en: 'We have three items on the agenda.', ar: 'لدينا ثلاثة بنود في جدول الأعمال.', tint: 'sky' },
            { en: "We should be done by 11 a.m.", ar: 'يجب أن ننتهي قبل الساعة الحادية عشرة.', tint: 'sky' },
          ],
        },
        {
          name: 'Giving opinions',
          nameAr: 'إبداء الرأي',
          items: [
            { en: 'In my opinion, we should…', ar: 'في رأيي، يجب أن…', examples: ['In my opinion, we should postpone the launch.'], tint: 'amber' },
            { en: 'From my perspective…', ar: 'من وجهة نظري…', tint: 'amber' },
            { en: 'I see your point, but…', ar: 'أتفهم وجهة نظرك، لكن…', tint: 'amber' },
            { en: "I'd like to add something here.", ar: 'أود إضافة شيء هنا.', tint: 'amber' },
            { en: 'Could you clarify what you mean?', ar: 'هل يمكنك توضيح ما تقصد؟', tint: 'amber' },
          ],
        },
        {
          name: 'Agreeing & disagreeing',
          nameAr: 'الاتفاق والاختلاف',
          items: [
            { en: 'I completely agree with you.', ar: 'أتفق معك تماماً.', tint: 'emerald' },
            { en: "That's a great point.", ar: 'هذه نقطة ممتازة.', tint: 'emerald' },
            { en: "I'm not sure I agree with that.", ar: 'لست متأكداً من موافقتي على ذلك.', tint: 'emerald' },
            { en: 'I see it differently.', ar: 'أراها بشكل مختلف.', tint: 'emerald' },
            { en: "Let's agree to disagree for now.", ar: 'لنتفق على الاختلاف في الوقت الحالي.', tint: 'emerald' },
          ],
        },
        {
          name: 'Closing & action items',
          nameAr: 'الختام وبنود العمل',
          items: [
            { en: "Let me summarize what we've decided.", ar: 'دعوني ألخّص ما اتفقنا عليه.', tint: 'violet' },
            { en: 'The action items are: Sara will…, Karim will…, and Sophie will…', ar: 'بنود العمل هي: سارة ستـ…، كريم سيـ…، وصوفي ستـ…', tint: 'violet' },
            { en: "I'll send out the meeting minutes by end of day.", ar: 'سأرسل محضر الاجتماع بنهاية اليوم.', tint: 'violet' },
            { en: "Thank you everyone. Let's reconvene next Tuesday.", ar: 'شكراً للجميع. سنجتمع مجدداً يوم الثلاثاء المقبل.', tint: 'violet' },
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'A weekly team sync',
      lines: [
        { speaker: 'Karim',  text: "Good morning everyone, thank you for joining. We have three items on the agenda today: the Q1 numbers, the new website launch, and the hiring plan. We should be done by 10:30." },
        { speaker: 'Sara',   text: 'Sounds good. Should we start with the Q1 numbers?' },
        { speaker: 'Karim',  text: 'Yes, please go ahead.' },
        { speaker: 'Sara',   text: 'In short, we exceeded the revenue target by 8%, but customer acquisition is down 3%. I think we should reinvest part of the surplus in paid ads.' },
        { speaker: 'Sophie', text: "I see your point, Sara, but I'd be careful about increasing the ad budget without analyzing why acquisition dropped first." },
        { speaker: 'Karim',  text: "That's a great point. Sophie, could you prepare a short analysis by Friday?" },
        { speaker: 'Sophie', text: "Sure, I'll have it ready." },
        { speaker: 'Karim',  text: "Perfect. Let's move on to the second item — the website launch." },
        { speaker: 'Sara',   text: "Quickly — we're on track for May 5. Final review on April 28." },
        { speaker: 'Karim',  text: "Excellent. Action items: Sophie does the acquisition analysis, Sara confirms the launch date with the dev team. Let me summarize what we've decided…" },
      ],
      note: 'Meetings need structure: agenda → discussion → decision → action items. Always close with who-does-what-by-when.',
    },
    {
      kind: 'quiz',
      title: 'Meeting language check',
      questions: [
        { prompt: 'كيف تفتتح اجتماعاً رسمياً؟', correct: "Thank you all for coming. Let's get started.", options: ["Yo, let's go.", "Thank you all for coming. Let's get started.", "OK, ready?", "Sit down."] },
        { prompt: 'كيف تختلف بأدب مع رأي شخص في اجتماع؟', correct: 'I see your point, but I see it differently.', options: ["You're wrong.", 'I see your point, but I see it differently.', 'No.', 'That makes no sense.'] },
        { prompt: 'ما هو "محضر الاجتماع"؟', correct: 'A written summary of what was discussed and decided.', options: ['The agenda before the meeting.', 'A written summary of what was discussed and decided.', 'The list of attendees.', 'The meeting room booking.'] },
        { prompt: 'كيف تنهي اجتماعاً بشكل احترافي؟', correct: "Let me summarize what we've decided. I'll send the minutes by end of day.", options: ["See you.", "Let me summarize what we've decided. I'll send the minutes by end of day.", "Bye.", "Done."] },
      ],
    },
  ],
}
