/**
 * Language Functions — curated A1/A2 functional-language lessons (bilingual).
 * The live content now lives in the `language_functions` DB table (migration 033)
 * and is edited at /admin/present/functions/edit. This file is the offline
 * FALLBACK + initial seed: the deck/editor use it only when the table is empty
 * or unreachable (see src/lib/functions.ts).
 */
export type FnLine = { en: string; ar: string }
export type FnGroup = { label: string; ar: string; lines: FnLine[] }
export type LangFunction = {
  id: string
  title: string
  ar: string
  emoji: string
  intro: string        // Arabic one-line teaching note
  groups: FnGroup[]
  examples: { q: FnLine; a: FnLine }[]   // mini dialogues
}

export const FUNCTIONS: LangFunction[] = [
  {
    id: 'opinions',
    title: 'Expressing opinions',
    ar: 'التعبير عن الرأي',
    emoji: '💭',
    intro: 'نسأل عن رأي الآخرين ونُعطي رأينا بأدب.',
    groups: [
      { label: 'Ask for an opinion', ar: 'اسأل عن الرأي', lines: [
        { en: 'What do you think?', ar: 'ما رأيك؟' },
        { en: 'What do you think about …?', ar: 'ما رأيك في …؟' },
        { en: 'How about you?', ar: 'وأنت؟ / ماذا عنك؟' },
        { en: 'Do you like it?', ar: 'هل يعجبك؟' },
      ] },
      { label: 'Give an opinion', ar: 'أعطِ رأيك', lines: [
        { en: 'I think (that) …', ar: 'أعتقد أنّ …' },
        { en: 'In my opinion, …', ar: 'في رأيي، …' },
        { en: 'I believe …', ar: 'أؤمن بأنّ …' },
        { en: 'For me, …', ar: 'بالنسبة لي، …' },
      ] },
    ],
    examples: [
      { q: { en: 'What do you think about this restaurant?', ar: 'ما رأيك في هذا المطعم؟' }, a: { en: 'I think it’s really good.', ar: 'أعتقد أنه جيد جداً.' } },
      { q: { en: 'How about you?', ar: 'وأنت؟' }, a: { en: 'In my opinion, it’s a little expensive.', ar: 'في رأيي، إنه غالٍ قليلاً.' } },
    ],
  },
  {
    id: 'agree-disagree',
    title: 'Agreeing & disagreeing',
    ar: 'الموافقة والاعتراض',
    emoji: '🤝',
    intro: 'نوافق أو نعترض بطريقة مهذّبة.',
    groups: [
      { label: 'Agree', ar: 'الموافقة', lines: [
        { en: 'I agree.', ar: 'أوافق.' },
        { en: 'You’re right.', ar: 'أنت محق.' },
        { en: 'That’s true.', ar: 'هذا صحيح.' },
        { en: 'Me too.', ar: 'وأنا كذلك.' },
      ] },
      { label: 'Disagree (politely)', ar: 'الاعتراض بأدب', lines: [
        { en: 'I don’t think so.', ar: 'لا أعتقد ذلك.' },
        { en: 'I disagree.', ar: 'لا أوافق.' },
        { en: 'I’m not sure.', ar: 'لست متأكداً.' },
        { en: 'I see your point, but …', ar: 'أفهم وجهة نظرك، لكن …' },
      ] },
    ],
    examples: [
      { q: { en: 'English is easy.', ar: 'الإنجليزية سهلة.' }, a: { en: 'I agree. It’s fun too!', ar: 'أوافق. وهي ممتعة أيضاً!' } },
      { q: { en: 'Coffee is better than tea.', ar: 'القهوة أفضل من الشاي.' }, a: { en: 'I see your point, but I prefer tea.', ar: 'أفهم وجهة نظرك، لكنني أفضّل الشاي.' } },
    ],
  },
  {
    id: 'suggestions',
    title: 'Making suggestions',
    ar: 'تقديم الاقتراحات',
    emoji: '💡',
    intro: 'نقترح فكرة ونردّ على اقتراحات الآخرين.',
    groups: [
      { label: 'Make a suggestion', ar: 'اقترح', lines: [
        { en: 'Let’s …', ar: 'لنفعل … / هيا …' },
        { en: 'How about …?', ar: 'ما رأيك بـ …؟' },
        { en: 'Why don’t we …?', ar: 'لماذا لا …؟' },
        { en: 'We could …', ar: 'يمكننا أن …' },
      ] },
      { label: 'Respond', ar: 'الردّ', lines: [
        { en: 'Good idea!', ar: 'فكرة جيدة!' },
        { en: 'Sounds great.', ar: 'يبدو رائعاً.' },
        { en: 'Sorry, I can’t.', ar: 'آسف، لا أستطيع.' },
        { en: 'Maybe later.', ar: 'ربما لاحقاً.' },
      ] },
    ],
    examples: [
      { q: { en: 'Let’s go to the park.', ar: 'لنذهب إلى الحديقة.' }, a: { en: 'Good idea! Let’s go.', ar: 'فكرة جيدة! هيا بنا.' } },
      { q: { en: 'How about a coffee?', ar: 'ما رأيك بقهوة؟' }, a: { en: 'Sorry, I can’t. Maybe later.', ar: 'آسف، لا أستطيع. ربما لاحقاً.' } },
    ],
  },
  {
    id: 'preferences',
    title: 'Likes & preferences',
    ar: 'الإعجاب والتفضيل',
    emoji: '❤️',
    intro: 'نتحدّث عمّا نحبّ ونفضّل.',
    groups: [
      { label: 'Likes / dislikes', ar: 'الإعجاب والنفور', lines: [
        { en: 'I like …', ar: 'أحبّ …' },
        { en: 'I love …', ar: 'أعشق …' },
        { en: 'I don’t like …', ar: 'لا أحبّ …' },
        { en: 'I hate …', ar: 'أكره …' },
      ] },
      { label: 'Preferences', ar: 'التفضيل', lines: [
        { en: 'I prefer … (to …)', ar: 'أفضّل … (على …)' },
        { en: 'I’d rather …', ar: 'أفضّل أن …' },
        { en: 'My favourite … is …', ar: 'المفضّل لديّ … هو …' },
      ] },
    ],
    examples: [
      { q: { en: 'Do you like tea or coffee?', ar: 'هل تحبّ الشاي أم القهوة؟' }, a: { en: 'I prefer coffee.', ar: 'أفضّل القهوة.' } },
      { q: { en: 'What’s your favourite food?', ar: 'ما طعامك المفضّل؟' }, a: { en: 'My favourite food is couscous.', ar: 'طعامي المفضّل هو الكسكس.' } },
    ],
  },
]
