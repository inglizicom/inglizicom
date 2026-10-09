import type { Block } from './level1-book.ts'

/**
 * The study planner printed at the front of each textbook: how the book
 * works with the audio lessons, the video course and the teacher's
 * follow-up; three paces with the time a day and the finish date; one week
 * for one unit, day by day (what, how, how long, the day off); one study
 * session with its breaks; the rules for days off and pauses; and a
 * calendar of every week of the book to fill in. Each book gives its own
 * rhythm (PlannerConfig); the pages are built the same way for all of them.
 */

export type Support = 'book' | 'audio' | 'video' | 'teacher'
const SUPPORT_ICON: Record<Support, string> = { book: '📗', audio: '🎧', video: '🎬', teacher: '👩‍🏫' }

export interface PlannerDay {
  /** What to study, "English - العربية". */
  what: string
  /** How to study it, "English - العربية". */
  how: string
  supports: Support[]
  /** Minutes (0 for the day off). */
  minutes: number
}

export interface PlannerConfig {
  /** The units in order: [number, English title]. */
  units: [number, string][]
  /** Units after which the book has a review (a review week). */
  reviewsAfter: number[]
  /** Units after which a rest week comes. */
  restAfter: number[]
  /** One unit's week, day 1 to day 7 (the last is the day off). */
  week: PlannerDay[]
  /** The time for one review week, in minutes. */
  reviewMinutes: number
  /** The book has a certificate to fill in at the back. */
  certificate?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')
const hours = (min: number) => {
  const h = Math.floor(min / 60), m = Math.round((min % 60) / 5) * 5
  return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`
}
const months = (weeks: number) => `≈ ${Math.round(weeks / 4.33)} months`

/** The weeks of the book at the standard pace: each unit, each review, each rest week. */
export function plannerWeeks(cfg: PlannerConfig): { kind: 'unit' | 'review' | 'rest'; label: string }[] {
  let review = 0
  return cfg.units.flatMap(([n, title]) => [
    { kind: 'unit' as const, label: `Unit ${pad(n)} · ${title}` },
    ...(cfg.reviewsAfter.includes(n) ? [{ kind: 'review' as const, label: `🔁 Review ${++review}` }] : []),
    ...(cfg.restAfter.includes(n) ? [{ kind: 'rest' as const, label: '🌴 Rest week - أسبوع راحة' }] : []),
  ])
}

/** The planner's pages: [titleEn, titleAr, blocks]. */
export function plannerPages(cfg: PlannerConfig): { titleEn: string; titleAr: string; blocks: Block[] }[] {
  const unitMin = cfg.week.reduce((s, d) => s + d.minutes, 0)
  const studyDays = cfg.week.filter(d => d.minutes > 0).length
  const nUnits = cfg.units.length, nReviews = cfg.reviewsAfter.length, nRest = cfg.restAfter.length
  const totalMin = nUnits * unitMin + nReviews * cfg.reviewMinutes
  const standard = nUnits + nReviews + nRest
  const intensive = Math.ceil(nUnits / 2) + Math.ceil(nReviews / 2) + 1
  const relaxed = nUnits * 2 + nReviews + nRest
  const weeks = plannerWeeks(cfg)
  const calendar = (rows: typeof weeks, from: number): Block => ({ t: 'grid', rows: [
    { dark: true, span: [0.7, 3.4, 1.2, 1.2, 0.7, 1.4], cells: ['Week', 'What I study', 'From', 'To', 'Done', 'Teacher ✓'] },
    ...rows.map((w, i) => ({ span: [0.7, 3.4, 1.2, 1.2, 0.7, 1.4], size: 12.5, plain: w.kind !== 'unit', cells: [String(from + i + 1), w.label, '', '', '☐', ''] })),
  ] })

  return [
    { titleEn: 'Your study plan', titleAr: 'خطة دراستك', blocks: [
      { t: 'banner', title: 'Your study plan - خطة دراستك', icons: ['🗓️', '⏱️'] },
      { t: 'callout', text: 'هذا الكتاب ليس وحده: معه دروس صوتية، ودروس مصوّرة، ومتابعة من أستاذك ومساعديه. هذه الخطة تقول لك ماذا تدرس، وكيف، ومتى، وكم يستغرق ذلك.' },
      { t: 'bar', title: 'Four supports - أربع وسائل معك', icon: '🧰' },
      { t: 'boxes', cols: 2, items: [
        { title: '📗 The book - الكتاب', lines: ['مادتك الأساسية: تقرأ وتكتب وتتدرّب في كل صفحة.'] },
        { title: '🎧 Audio - الدروس الصوتية', lines: ['امسح رمز QR في الصفحة: استمع إلى الكلمات والعبارات والمحادثة، وردّد بعد المتحدّث.'] },
        { title: '🎬 Video - الدروس المصوّرة', lines: ['فيديو لكل وحدة ولكل درس في القواعد: شاهده قبل أن تدرس الصفحات.'] },
        { title: '👩‍🏫 Teacher - الأستاذ والمساعدون', lines: ['حصة مباشرة كل أسبوع للمحادثة، وتصحيح لكتابتك، وتقييم بعد كل محور.'] },
      ] },
      { t: 'bar', title: 'Choose your pace - اختر وتيرتك', icon: '🚦' },
      { t: 'grid', rows: [
        { dark: true, span: [1.2, 1.3, 1.1, 1.3, 1.5], cells: ['Pace', 'Time a day', 'Days a week', 'One unit', 'You finish in'] },
        { span: [1.2, 1.3, 1.1, 1.3, 1.5], size: 13, cells: ['🐇 Intensive - مكثّفة', hours((unitMin * 2) / studyDays), String(studyDays), '3 days', `${intensive} weeks (${months(intensive)})`] },
        { span: [1.2, 1.3, 1.1, 1.3, 1.5], size: 13, cells: ['🚶 Standard - عادية', hours(unitMin / studyDays), String(studyDays), '1 week', `${standard} weeks (${months(standard)})`] },
        { span: [1.2, 1.3, 1.1, 1.3, 1.5], size: 13, cells: ['🐢 Relaxed - هادئة', hours(unitMin / 8), '4', '2 weeks', `${relaxed} weeks (${months(relaxed)})`] },
      ] },
      { t: 'bullets', size: 13, items: [
        `The whole book: about ${Math.round(totalMin / 60)} hours of study, plus your live classes. - الكتاب كاملًا: حوالي ${Math.round(totalMin / 60)} ساعة من الدراسة، إضافة إلى حصصك المباشرة.`,
        'Not sure? Start with the standard pace. You can change it after the first module. - لست متأكدًا؟ ابدأ بالوتيرة العادية، ويمكنك تغييرها بعد المحور الأول.',
      ] },
      { t: 'bar', title: 'Time for one unit - الوقت اللازم لوحدة', icon: '⏳' },
      { t: 'grid', rows: [
        { dark: true, span: [2.6, 1.4, 1], cells: ['Part of the unit', 'With', 'Time'] },
        ...cfg.week.filter(d => d.minutes > 0).map(d => ({ span: [2.6, 1.4, 1], size: 12.5, cells: [d.what.split(' - ')[0], d.supports.map(s => SUPPORT_ICON[s]).join(' '), hours(d.minutes)] })),
        { span: [2.6, 1.4, 1], size: 12.5, cells: ['Total for one unit', '', hours(unitMin)] },
      ] },
    ] },
    { titleEn: 'One week, one unit', titleAr: 'أسبوع لكل وحدة', blocks: [
      { t: 'banner', title: 'One week, one unit - أسبوع لكل وحدة', icons: ['📅', '✅'] },
      { t: 'callout', text: 'هذا هو أسبوعك في الوتيرة العادية. ستة أيام دراسة ويوم راحة. ضع علامة ✓ كل يوم تنهي فيه دراستك.' },
      { t: 'grid', rows: [
        { dark: true, span: [0.6, 2.2, 2.6, 0.7, 0.5], cells: ['Day', 'What', 'How', 'Time', '✓'] },
        ...cfg.week.map((d, i) => ({ span: [0.6, 2.2, 2.6, 0.7, 0.5], size: 12, plain: d.minutes === 0, cells: [
          String(i + 1), `${d.supports.map(s => SUPPORT_ICON[s]).join('')} ${d.what}`, d.how, d.minutes ? hours(d.minutes) : '—', '☐'] })),
      ] },
      { t: 'bar', title: 'One study session - حصة دراسة واحدة', icon: '⏱️' },
      { t: 'cards', cols: 5, stack: true, items: [
        ['🎧', 'Warm-up · 5 min', 'استمع إلى درس الأمس'],
        ['🎯', 'Focus · 20 min', 'الدرس الجديد'],
        ['☕', 'Break · 5 min', 'قم، اشرب ماءً، بلا هاتف'],
        ['🎯', 'Focus · 15 min', 'تدرّب وتكلّم'],
        ['📝', 'Recap · 5 min', 'اكتب ثلاثة أشياء تعلّمتها'],
      ] },
      { t: 'bullets', box: true, heading: 'Breaks, days off and pauses - الاستراحة وأيام الراحة والتوقف', size: 12.5, items: [
        'Study at the same time every day: early morning, after work or before bed. - ادرس في الوقت نفسه كل يوم.',
        'Take one day off every week. Your brain needs rest to remember. - خذ يوم راحة كل أسبوع، فالدماغ يحتاج الراحة ليتذكّر.',
        "Missed a day? Don't study twice as much the next day. Move your plan one day. - إذا فاتك يوم، لا تضاعف الدراسة، بل أجّل خطتك يومًا واحدًا.",
        'A pause for travel, illness or exams: two weeks at most. Then start again with the review of your last unit. - عند التوقف لسفر أو مرض أو امتحانات، لا تتجاوز أسبوعين، ثم ابدأ بمراجعة آخر وحدة.',
        'Short and often is better than long and rare: 45 minutes every day beats 4 hours on Sunday. - القليل الدائم خير من الكثير المنقطع.',
      ] },
      { t: 'bullets', box: true, heading: 'Your teacher and assistants - أستاذك ومساعدوه', size: 12.5, items: [
        'Every week: a live class with your teacher to speak and use the unit. - كل أسبوع: حصة مباشرة مع أستاذك لتتكلّم وتطبّق الوحدة.',
        'Every week: send your writing to your assistant. You get it back with corrections. - كل أسبوع: أرسل كتابتك إلى المساعد ليعيدها إليك مصحّحة.',
        'After each review: a progress check and advice for the next weeks. - بعد كل مراجعة: تقييم لتقدّمك ونصائح للأسابيع القادمة.',
        "A question? Write to your assistant. Don't stay stuck. - عندك سؤال؟ راسل المساعد ولا تبقَ عالقًا.",
      ] },
    ] },
    { titleEn: 'My calendar', titleAr: 'رزنامتي', blocks: [
      { t: 'banner', title: 'My calendar - رزنامتي', icons: ['🗓️', '🏁'] },
      { t: 'callout', text: 'اكتب تاريخ بداية كل أسبوع ونهايته، وضع علامة عندما تنهي. أستاذك أو مساعده يوقّع بعد كل مراجعة.' },
      { t: 'grid', rows: [
        { span: [1, 2, 1, 2], size: 13.5, cells: ['I start on', '', 'I finish on', ''] },
      ] },
      calendar(weeks, 0),
    ] },
    { titleEn: 'Follow-up with my teacher', titleAr: 'المتابعة مع أستاذي', blocks: [
      { t: 'banner', title: 'Follow-up with my teacher - المتابعة مع أستاذي', icons: ['👩‍🏫', '📈'] },
      { t: 'callout', text: 'بعد كل مراجعة، يقيّم أستاذك تقدّمك ويكتب لك نصيحة. اكتب أنت ما ستفعله في الأسابيع القادمة.' },
      // One box a review: the units it closes, the check, the advice, the next step.
      ...cfg.reviewsAfter.map((to, i): Block => {
        const from = i ? cfg.reviewsAfter[i - 1] + 1 : cfg.units[0][0]
        return { t: 'gapText', size: 13, label: `Review ${i + 1} · Units ${from}–${to}`, body: [
          'Date: ___   Score: ___   Signature: ___',
          "My teacher's advice: ___",
          'What I will do next: ___',
        ].join('\n') }
      }),
      { t: 'bullets', box: true, heading: 'When I finish - عندما أنهي الكتاب 🎉', size: 13, items: [
        'Do the last review, then ask your teacher for your final check. - أنجز المراجعة الأخيرة، ثم اطلب من أستاذك التقييم النهائي.',
        ...(cfg.certificate ? ['Fill in your certificate at the back of the book. - املأ شهادتك في آخر الكتاب.'] : []),
        'Ask about the next level. - اسأل عن المستوى التالي.',
      ] },
    ] },
  ]
}
