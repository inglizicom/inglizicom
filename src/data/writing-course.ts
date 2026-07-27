/**
 * writing-course.ts — content for the /admin/present/writing teaching deck.
 * Audience: ADULTS who finished the A0–A1 course and now learn to WRITE.
 *
 * Every lesson follows the same template so the learner always knows the stage:
 *   Objectives → Rule → Explanation → Examples → Exercises →
 *   Reading passage → Comprehension (the passage USED as an exercise) →
 *   Homework → Find-the-Mistakes (an error passage the learner corrects).
 *
 * Formatting: wrap any part of an ENGLISH string in *asterisks* to spotlight it
 * (a capital, a comma, a conjunction, a correction). Arabic never uses it.
 */

export type Ex = { en: string; ar: string }
/* An example slide. `why` is the teaching line — WHAT this example proves and
   WHY it is written that way — shown under the sentence so the teacher never has
   to reconstruct the point live. A bare sentence plus a translation is not a
   lesson; the reason is the lesson. */
export type Example = Ex & { why?: string; whyAr?: string }
export type QA = { q: string; a: string }
export type Reading = {
  title: string; titleAr: string
  passage: string[]          // real connected prose (rendered as one flowing paragraph)
  questions?: QA[]           // deprecated — comprehension phase removed; kept optional for old data
  tip?: string; tipAr?: string
}
export type Editing = {
  wrong: string[]            // a short passage that CONTAINS mistakes (plain)
  correct: string[]         // the corrected version, with *the fixes* highlighted
}
// How a tense/structure is built — three columns of pattern lines (*highlight* the key part).
export type Form = { affirmative: string[]; negative: string[]; question: string[]; note?: string; noteAr?: string }
// A spelling rule (e.g. add -es / consonant+y → -ies) with worked examples.
export type SpellRule = { rule: string; ar: string; examples: string }
// Writing-studio content for the practice-oriented writing lessons (a different, hands-on format).
// Paragraph lessons use topic/support/conclusion roles; email lessons use
// subject/greeting/body/closing (rendered as separate lines via layout:'lines').
export type StudioPart = { role: 'topic' | 'support' | 'conclusion' | 'subject' | 'greeting' | 'body' | 'closing'; en: string }
export type Studio = {
  prompt?: { en: string; ar: string }                              // the writing task
  model?: { title: string; titleAr: string; parts: StudioPart[]; layout?: 'prose' | 'lines' }
  plan?: { label: string; ar: string }[]                           // a fillable outline frame
  toolkit?: { group: string; ar: string; phrases: string[] }[]     // sentence starters / linking phrases
  steps?: Ex[]                                                      // guided "your turn" writing steps
  checklist?: Ex[]                                                  // self-check before finishing
}
export type Lesson = {
  no: number
  cefr?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'  // CEFR level; falls back to the unit level when omitted
  tag: string; tagAr: string
  title: string; titleAr: string
  objectives: Ex[]
  rule: { en: string; ar: string }
  explain?: { intro: string; introAr: string; points: Ex[] }
  form?: Form                              // "How to build it" — affirmative / negative / question
  spelling?: SpellRule[]                   // spelling rules (-s/-es/-ies, -ed, -ing …)
  signals?: Ex[]                           // signal / time-marker words for the tense
  irregulars?: 'past' | 'pp'               // show the irregular-verb table (highlight past OR past-participle)
  studio?: Studio                          // writing-studio (paragraph lessons) — replaces the grammar drills
  examples?: Example[]
  exercises?: QA[]
  reading?: Reading
  homework: Ex[]
  editing?: Editing
}

/* The most common irregular verbs — base / past simple / past participle (V3).
 * Shown in Past Simple (past highlighted) and Present Perfect (participle highlighted). */
export type Irregular = { base: string; past: string; pp: string }
export const IRREGULAR_VERBS: Irregular[] = [
  { base: 'be', past: 'was / were', pp: 'been' }, { base: 'become', past: 'became', pp: 'become' },
  { base: 'begin', past: 'began', pp: 'begun' }, { base: 'break', past: 'broke', pp: 'broken' },
  { base: 'bring', past: 'brought', pp: 'brought' }, { base: 'build', past: 'built', pp: 'built' },
  { base: 'buy', past: 'bought', pp: 'bought' }, { base: 'catch', past: 'caught', pp: 'caught' },
  { base: 'choose', past: 'chose', pp: 'chosen' }, { base: 'come', past: 'came', pp: 'come' },
  { base: 'cost', past: 'cost', pp: 'cost' }, { base: 'cut', past: 'cut', pp: 'cut' },
  { base: 'do', past: 'did', pp: 'done' }, { base: 'draw', past: 'drew', pp: 'drawn' },
  { base: 'drink', past: 'drank', pp: 'drunk' }, { base: 'drive', past: 'drove', pp: 'driven' },
  { base: 'eat', past: 'ate', pp: 'eaten' }, { base: 'fall', past: 'fell', pp: 'fallen' },
  { base: 'feel', past: 'felt', pp: 'felt' }, { base: 'find', past: 'found', pp: 'found' },
  { base: 'fly', past: 'flew', pp: 'flown' }, { base: 'forget', past: 'forgot', pp: 'forgotten' },
  { base: 'get', past: 'got', pp: 'gotten' }, { base: 'give', past: 'gave', pp: 'given' },
  { base: 'go', past: 'went', pp: 'gone' }, { base: 'grow', past: 'grew', pp: 'grown' },
  { base: 'have', past: 'had', pp: 'had' }, { base: 'hear', past: 'heard', pp: 'heard' },
  { base: 'keep', past: 'kept', pp: 'kept' }, { base: 'know', past: 'knew', pp: 'known' },
  { base: 'leave', past: 'left', pp: 'left' }, { base: 'lose', past: 'lost', pp: 'lost' },
  { base: 'make', past: 'made', pp: 'made' }, { base: 'meet', past: 'met', pp: 'met' },
  { base: 'pay', past: 'paid', pp: 'paid' }, { base: 'put', past: 'put', pp: 'put' },
  { base: 'read', past: 'read', pp: 'read' }, { base: 'ride', past: 'rode', pp: 'ridden' },
  { base: 'run', past: 'ran', pp: 'run' }, { base: 'say', past: 'said', pp: 'said' },
  { base: 'see', past: 'saw', pp: 'seen' }, { base: 'sell', past: 'sold', pp: 'sold' },
  { base: 'send', past: 'sent', pp: 'sent' }, { base: 'sit', past: 'sat', pp: 'sat' },
  { base: 'sleep', past: 'slept', pp: 'slept' }, { base: 'speak', past: 'spoke', pp: 'spoken' },
  { base: 'spend', past: 'spent', pp: 'spent' }, { base: 'swim', past: 'swam', pp: 'swum' },
  { base: 'take', past: 'took', pp: 'taken' }, { base: 'teach', past: 'taught', pp: 'taught' },
  { base: 'tell', past: 'told', pp: 'told' }, { base: 'think', past: 'thought', pp: 'thought' },
  { base: 'understand', past: 'understood', pp: 'understood' }, { base: 'wake', past: 'woke', pp: 'woken' },
  { base: 'wear', past: 'wore', pp: 'worn' }, { base: 'win', past: 'won', pp: 'won' },
  { base: 'write', past: 'wrote', pp: 'written' },
]

/* ── Unit message threads ────────────────────────────────────────────────────
   Founder asked for "conversations applying the rules". In a WRITING course the
   honest form of that is a WRITTEN conversation — the WhatsApp and email threads
   students actually produce all day — not a spoken dialogue, which is what the
   A0/A1 course already sells.

   One thread per unit, placed after its lessons and before its games: see the
   grammar alive between two people, then play with it. *Highlights* mark the
   unit's target structures. Keyed by unit index (1-based). */
export type ThreadMsg = { from: 'a' | 'b'; text: string; time?: string }
export type Thread = {
  title: string; titleAr: string
  a: string; b: string
  channel: 'chat' | 'email'
  messages: ThreadMsg[]
  notice: string[]          // what to point at on screen
  noticeAr: string
}

export const THREADS: Record<number, Thread> = {
  1: {
    title: 'Making a Plan', titleAr: 'ترتيب موعد', a: 'Sara', b: 'Yousef', channel: 'chat',
    messages: [
      { from: 'a', text: '*H*i *Y*ousef*!* *A*re you free on *S*aturday*?*', time: '09:12' },
      { from: 'b', text: '*H*i *S*ara*.* *I* think so*.* *W*hat is the plan*?*', time: '09:14' },
      { from: 'a', text: '*T*here is *a* new café near *H*assan *S*treet*.* *I*t opens at ten*.*', time: '09:15' },
      { from: 'b', text: '*P*erfect*.* *I* *don’t* work on *S*aturday*,* so *I* am free all day*.*', time: '09:18' },
      { from: 'a', text: '*G*reat*!* *L*et*’s* meet at *S*ara*’s* bakery first*?*', time: '09:19' },
      { from: 'b', text: '*S*ee you there*.* *D*on*’t* be late*!*', time: '09:21' },
    ],
    notice: [
      'Every message opens with a CAPITAL and closes with a mark',
      'Names, days and streets are capitalised — *Y*ousef, *S*aturday, *H*assan',
      '*a* new café (first mention) · *an* would be wrong before that sound',
      'Apostrophes: *don’t* (missing letters) vs *Sara’s* (possession)',
    ],
    noticeAr: 'حرف كبير في أول كل رسالة وعلامة في آخرها · أسماء العلم والأيام والشوارع بحرف كبير · الأداة a لأول ذكر · الفاصلة العليا للاختصار وللملكية.',
  },
  2: {
    title: 'The New Flat', titleAr: 'الشقّة الجديدة', a: 'Karim', b: 'Amine', channel: 'chat',
    messages: [
      { from: 'a', text: '*I am* in the new flat*!* *There are* three *rooms* and a small kitchen*.*', time: '18:02' },
      { from: 'b', text: 'Nice*!* *Is there* a balcony*?*', time: '18:03' },
      { from: 'a', text: '*There is* a *big* one*.* *Its* view *is* beautiful at sunset*.*', time: '18:05' },
      { from: 'b', text: 'How *many* neighbours *are* there*?*', time: '18:06' },
      { from: 'a', text: 'Only *a few*. *Their* children *are* very *quiet*.', time: '18:08' },
      { from: 'b', text: 'And *my* favourite question — how *much* is the rent*?*', time: '18:09' },
      { from: 'a', text: 'Less than *my* old place*.* Come and see *it* on Friday*.*', time: '18:11' },
    ],
    notice: [
      '*There is* + singular · *There are* + plural — the verb looks FORWARD',
      'Possessives agree with the OWNER: *its* view, *their* children, *my* place',
      '*many* for countable neighbours · *much* for uncountable rent',
      'Adjectives come BEFORE the noun: a *big* one, *quiet* children',
    ],
    noticeAr: 'There is للمفرد و There are للجمع · صفات الملكية تطابق المالك · many للمعدود و much لغير المعدود · الصفة قبل الاسم.',
  },
  3: {
    title: 'Where Were You?', titleAr: 'أين كنت؟', a: 'Layla', b: 'Omar', channel: 'chat',
    messages: [
      { from: 'a', text: 'I *called* you twice yesterday*.* Where *were* you*?*', time: '20:40' },
      { from: 'b', text: 'Sorry*!* I *was driving* to Fes when you *called*.', time: '20:42' },
      { from: 'a', text: 'Ah*.* *Do* you *go* there often*?*', time: '20:43' },
      { from: 'b', text: 'I *go* every month*.* My sister *lives* there*.*', time: '20:44' },
      { from: 'a', text: 'I *have never been* to Fes*!*', time: '20:45' },
      { from: 'b', text: 'Really*?* I *will take* you next time*.* We *are going to* visit her in May*.*', time: '20:47' },
      { from: 'a', text: 'I *used to* dream about that city as a child*.* Thank you*!*', time: '20:49' },
    ],
    notice: [
      'Past simple for finished actions: *called*, *were*',
      'Past continuous interrupted by past simple: *was driving* when you *called*',
      'Present simple for habits: I *go* every month · she *lives* there',
      '*have never been* (experience, no date) · *will take* (decision now) · *are going to* (plan) · *used to* (habit that ended)',
    ],
    noticeAr: 'الماضي البسيط للمنتهي · المستمر يقطعه البسيط · المضارع للعادة · المضارع التام للتجربة · will للقرار و going to للخطة و used to لعادة انتهت.',
  },
  4: {
    title: 'Choosing a Course', titleAr: 'اختيار دورة', a: 'Nadia', b: 'Hamza', channel: 'chat',
    messages: [
      { from: 'a', text: 'My brother *wants to improve* his English*.* Which course *is* better*?*', time: '11:03' },
      { from: 'b', text: 'The evening one *is cheaper*, but the morning one *is more useful*.', time: '11:05' },
      { from: 'a', text: 'He *works* until six*,* so he *can’t* come in the morning*.*', time: '11:06' },
      { from: 'b', text: 'Then he *should* take the evening course*.* It *starts* *on* Monday *at* seven*.*', time: '11:08' },
      { from: 'a', text: '*Does* he *have to* pay everything now*?*', time: '11:09' },
      { from: 'b', text: 'No*.* The fee *can be paid* in two parts*.* Certificates *are given* *in* July*.*', time: '11:12' },
      { from: 'a', text: 'That *is* *the best* option*.* He *enjoys studying* at night anyway*.*', time: '11:14' },
    ],
    notice: [
      'Agreement: he *works*, it *starts*, she *lives* — third person takes *-s*',
      'Prepositions: *on* Monday · *at* seven · *in* July',
      'Modals: *can’t* (ability) · *should* (advice) · *have to* (outside obligation)',
      'Comparatives: *cheaper* · *more useful* · *the best* — and the passive: *can be paid*',
    ],
    noticeAr: 'التطابق مع المفرد الغائب · حروف الجرّ on/at/in · الأفعال الناقصة · المقارنة والتفضيل · المبني للمجهول.',
  },
  5: {
    title: 'Explaining the Delay', titleAr: 'شرح التأخير', a: 'Rachid', b: 'Salma', channel: 'chat',
    messages: [
      { from: 'a', text: 'The report *is* late*,* *and* I owe you an explanation*.*', time: '08:30' },
      { from: 'b', text: 'Go on*.*', time: '08:31' },
      { from: 'a', text: '*Because* two people were ill last week*,* we lost three days*.*', time: '08:33' },
      { from: 'b', text: 'I understand*.* *When* will it be ready*?*', time: '08:34' },
      { from: 'a', text: '*If* nothing else goes wrong*,* I will send it on Thursday*.*', time: '08:36' },
      { from: 'b', text: 'Thursday works*,* *but* please tell me earlier next time*.*', time: '08:37' },
      { from: 'a', text: 'You are right*.* *Although* it was outside my control*,* I should have written sooner*.*', time: '08:39' },
    ],
    notice: [
      'Compound: two complete sentences joined by comma + FANBOYS (*and*, *but*)',
      'Complex: *Because* / *When* / *If* / *Although* make a clause dependent',
      'Dependent clause FIRST → comma. Main clause first → no comma',
      'No fragments anywhere — every message has a subject and a verb',
    ],
    noticeAr: 'المركّبة بفاصلة وأداة عطف · المعقّدة بأدوات الربط التابع · الفاصلة حين تتقدّم الجملة التابعة · لا جمل ناقصة.',
  },
  6: {
    title: 'Two Versions of the Same News', titleAr: 'الخبر نفسه بصيغتين', a: 'Draft', b: 'Better', channel: 'chat',
    messages: [
      { from: 'a', text: 'we finished the project it was hard we worked late everyone helped it is done now', time: 'draft' },
      { from: 'b', text: 'We finished the project*.* *However,* it was harder than we expected*.*', time: 'better' },
      { from: 'b', text: '*Therefore,* we worked late on Monday*,* Tuesday*,* *and* Wednesday*.*', time: 'better' },
      { from: 'b', text: 'Everyone helped*:* Salma checked the data*,* Karim wrote the summary*,* *and* I edited it*.*', time: 'better' },
      { from: 'b', text: '*In short,* it is done*.* *And* it is good*.*', time: 'better' },
    ],
    notice: [
      'The draft has no punctuation and one rhythm — it is exhausting to read',
      'Transitions signpost the turns: *However* · *Therefore* · *In short*',
      'Commas in a series, and a parallel list of three clauses',
      'The last line is deliberately SHORT — variety is what makes it land',
    ],
    noticeAr: 'المسودّة بلا ترقيم وبإيقاع واحد · أدوات الربط تدلّ على المنعطفات · الفواصل والقائمة المتوازية · الجملة الأخيرة قصيرة عمدًا.',
  },
  7: {
    title: 'A Message That Is a Paragraph', titleAr: 'رسالة هي فقرة', a: 'Imane', b: 'Teacher', channel: 'chat',
    messages: [
      { from: 'a', text: 'Ustad, can I send my homework as one message*?*', time: '16:20' },
      { from: 'b', text: 'Yes — but make it a real paragraph, not a list*.*', time: '16:21' },
      { from: 'a', text: '*Reading at night changed my English.* First, it is quiet*,* *because* everyone at home is asleep by eleven*.*', time: '16:34' },
      { from: 'a', text: '*For example,* the words I meet at midnight are still with me the next morning*.*', time: '16:34' },
      { from: 'a', text: 'Second, nobody interrupts me*,* *so* I finish a whole chapter*.*', time: '16:35' },
      { from: 'a', text: '*In short, the quiet hours taught me more than any class.*', time: '16:35' },
      { from: 'b', text: 'That is a paragraph*.* Topic, two supports with R*.*E*.*D*.*, and a conclusion*.*', time: '16:38' },
    ],
    notice: [
      'The first sentence is the TOPIC SENTENCE — a claim, not a fact',
      'Support 1 + a *Reason* (because) + an *Example* (for example)',
      'Support 2 + a *Detail*, joined with *so*',
      'The conclusion echoes the topic in NEW words and adds nothing new',
    ],
    noticeAr: 'الجملة الأولى موضوعية وهي ادّعاء لا معلومة · دعم مع سبب ومثال · دعم ثانٍ مع تفصيل · خاتمة تُصدي الموضوع بكلمات جديدة.',
  },
  8: {
    title: 'A Request and Its Reply', titleAr: 'طلب وردّ عليه', a: 'Omar Benali', b: 'Ms. Bennani', channel: 'email',
    messages: [
      { from: 'a', text: '*Subject: Leave Request — 12–13 August*' },
      { from: 'a', text: '*Dear Ms. Bennani,*' },
      { from: 'a', text: '*I am writing to request* two days of leave on 12 and 13 August for a family matter*.* I have completed this week’s reports*,* and Salma has kindly agreed to cover urgent requests*.*' },
      { from: 'a', text: '*Please let me know if you need any further information.*' },
      { from: 'a', text: '*Kind regards,*\nOmar Benali' },
      { from: 'b', text: '*Dear Omar,*' },
      { from: 'b', text: 'Thank you for arranging cover in advance*.* *I am happy to approve* both days*.* *Please find attached* the confirmation for your records*.*' },
      { from: 'b', text: '*Kind regards,*\nL. Bennani' },
    ],
    notice: [
      'Subject = topic + the detail that decides it (the dates)',
      '*Dear* + title + FAMILY name, never the first name alone',
      'The purpose lands in sentence one: *I am writing to request…*',
      'No contractions, no emojis — and *Kind regards* because the name is known',
    ],
    noticeAr: 'الموضوع فكرة وتفصيل حاسم · Dear مع اللقب واسم العائلة · الغرض في الجملة الأولى · بلا اختصارات ولا رموز.',
  },
  9: {
    title: 'What Went Wrong', titleAr: 'ما الذي حدث', a: 'Yassine', b: 'Manager', channel: 'chat',
    messages: [
      { from: 'a', text: 'The client says the file never arrived*.*', time: '09:02' },
      { from: 'b', text: 'It *must have gone* to spam*.* I sent it on Friday*.*', time: '09:04' },
      { from: 'a', text: 'She told me she *had checked* everything*,* and she asked *whether we had sent* it at all*.*', time: '09:06' },
      { from: 'b', text: '*If I had copied* you in*,* we *would have known* on Friday*.*', time: '09:08' },
      { from: 'a', text: '*Having read* the thread*,* I think the address *was mistyped*.', time: '09:10' },
      { from: 'b', text: 'You are right*.* I *should have checked* it twice*.* *I wish I had.*', time: '09:12' },
      { from: 'a', text: 'It *is said that* everyone does this once*.* I *had the address corrected* this morning*.*', time: '09:14' },
    ],
    notice: [
      'Perfect modals: *must have gone* (guess) · *should have checked* (regret)',
      'Third conditional: *If I had copied* … *we would have known*',
      'Reported speech: she said she *had checked* · asked *whether we had sent*',
      'Participle clause *Having read* · impersonal *It is said that* · causative *had the address corrected*',
    ],
    noticeAr: 'الأفعال الناقصة في الماضي · الشرط الثالث · الكلام المنقول · المشتقّات والمبني للمجهول غير الشخصي وصيغة التسبيب.',
  },
  10: {
    title: 'An Argument in Messages', titleAr: 'نقاش في رسائل', a: 'Hind', b: 'Adil', channel: 'chat',
    messages: [
      { from: 'a', text: '*Schools should teach writing every day, not only in language class.*', time: '21:10' },
      { from: 'b', text: 'That is a strong claim*.* Why*?*', time: '21:11' },
      { from: 'a', text: '*The first reason is economic*: almost every job now tests written English before an interview*.*', time: '21:13' },
      { from: 'b', text: '*It is true that* employers test writing*.* *However,* teachers have no time for another subject*.*', time: '21:15' },
      { from: 'a', text: '*This objection ignores* the point*.* Writing is not a subject*;* it is how every subject is assessed*.*', time: '21:17' },
      { from: 'b', text: '*Admittedly,* that changes the cost*.* *Even so,* the training would take years*.*', time: '21:19' },
      { from: 'a', text: '*On balance,* years is still shorter than a generation that cannot write*.*', time: '21:21' },
    ],
    notice: [
      'The opening message IS a thesis — arguable, specific, one sentence',
      'Support with a named reason and evidence',
      'Concession → turn → answer: *It is true that* … *However,* … *This objection ignores*',
      '*Admittedly* / *Even so* / *On balance* — the language of a fair argument',
    ],
    noticeAr: 'الرسالة الأولى أطروحة قابلة للنقاش · دعم بسبب ودليل · اعتراف ثم انعطاف ثم ردّ · لغة الحجاج المنصف.',
  },
  11: {
    title: 'The Same News, Three Ways', titleAr: 'الخبر نفسه بثلاث نبرات', a: 'Draft', b: 'Sent', channel: 'chat',
    messages: [
      { from: 'a', text: 'Informal: hey, we cant do the deadline, sorry!!', time: 'v1' },
      { from: 'a', text: 'Over-formal: *It is hereby regretted that the aforementioned deadline shall not be met.*', time: 'v2' },
      { from: 'b', text: '*Regrettably, the deadline is unlikely to be met.*', time: 'sent' },
      { from: 'b', text: '*What has changed is* the supplier’s schedule, not our plan*.*', time: 'sent' },
      { from: 'b', text: '*The delay appears to stem from* a shipping problem, and it *may add* about a week*.*', time: 'sent' },
      { from: 'b', text: '*Never have we missed* a date without warning you first, and we are not starting now*.*', time: 'sent' },
      { from: 'b', text: 'A revised plan follows tomorrow*.* If the date moves again, you will hear it from us first*.*', time: 'sent' },
    ],
    notice: [
      'v1 breaks register; v2 is a costume. The sent version is neutral-formal and human',
      'Hedging: *is unlikely to* · *appears to stem from* · *may add* — claiming exactly what is known',
      'Cleft for emphasis: *What has changed is* the supplier’s schedule',
      'Inversion for weight: *Never have we missed* a date — used once, not twice',
    ],
    noticeAr: 'الأولى تكسر المستوى والثانية تنكّر · التحوّط يدّعي بقدر ما تعرف · الجملة المشطورة للإبراز · القلب للتأكيد مرّة واحدة.',
  },
}

/* ── Unit review games ────────────────────────────────────────────────────────
   Each unit ends in play rather than a summary slide. Three kinds, all built to
   work as DECK slides: the challenge is on screen, the class answers out loud,
   and Space reveals the solution.
     reorder — scrambled tiles to rebuild into one correct sentence
     match   — two columns to connect (shown shuffled, revealed paired)
     pick    — choose the right option, with the reason attached
   Keyed by unit index (1-based) so the syllabus in page.tsx stays presentation. */
export type ReviewGame =
  | { kind: 'reorder'; prompt: string; promptAr: string; tiles: string[]; solution: string[]; answer: string }
  | { kind: 'match'; prompt: string; promptAr: string; pairs: [string, string][] }
  | { kind: 'pick'; prompt: string; promptAr: string; options: string[]; answer: number; why: string; whyAr: string }

export const REVIEWS: Record<number, ReviewGame[]> = {
  1: [
    { kind: 'reorder', prompt: 'Rebuild the sentence — mind the capital and the full stop', promptAr: 'أعد بناء الجملة — انتبه للحرف الكبير والنقطة',
      tiles: ['in', 'Rabat', 'my', 'family', 'lives', '.'], solution: ['my', 'family', 'lives', 'in', 'Rabat', '.'], answer: '*My* family lives in Rabat*.*' },
    { kind: 'pick', prompt: 'Which one is correct?', promptAr: 'أيّها الصحيح؟',
      options: ['a hour', 'an hour', 'the hour'], answer: 1,
      why: '*h* is silent, so the word opens on a VOWEL sound — the ear decides, not the letter.', whyAr: 'حرف h صامت فتبدأ الكلمة بصوت علّة، والعبرة بالسمع لا بالحرف.' },
    { kind: 'match', prompt: 'Connect each contraction to its full form', promptAr: 'صِل كل اختصار بأصله',
      pairs: [['I’m', 'I am'], ['don’t', 'do not'], ['it’s', 'it is'], ['can’t', 'cannot'], ['we’re', 'we are']] },
    { kind: 'pick', prompt: 'Which sentence is punctuated correctly?', promptAr: 'أيّ جملة ترقيمها صحيح؟',
      options: ['where do you live?', 'Where do you live.', 'Where do you live?'], answer: 2,
      why: 'A capital to open, and *?* to close — a question needs both, not one.', whyAr: 'حرف كبير في البداية وعلامة استفهام في النهاية — كلاهما لازم.' },
  ],
  2: [
    { kind: 'match', prompt: 'Connect the singular to its plural', promptAr: 'صِل المفرد بجمعه',
      pairs: [['child', 'children'], ['box', 'boxes'], ['city', 'cities'], ['foot', 'feet'], ['person', 'people']] },
    { kind: 'reorder', prompt: 'Build the phrase — where does the adjective go?', promptAr: 'ابنِ العبارة — أين تقع الصفة؟',
      tiles: ['house', 'a', 'big'], solution: ['a', 'big', 'house'], answer: 'a *big* house' },
    { kind: 'pick', prompt: 'Choose the right quantifier', promptAr: 'اختر الكمّية الصحيحة',
      options: ['How much students are there?', 'How many students are there?', 'How many student are there?'], answer: 1,
      why: '*students* can be counted, so *many* — and after a number English always pluralises.', whyAr: 'الطلاب يُعدّون فتأتي many، وبعد العدد تُجمع الكلمة دائمًا.' },
    { kind: 'match', prompt: 'Connect the pronoun to its possessive', promptAr: 'صِل الضمير بصفة الملكية',
      pairs: [['I', 'my'], ['he', 'his'], ['she', 'her'], ['it', 'its'], ['they', 'their']] },
  ],
  3: [
    { kind: 'match', prompt: 'Connect the verb to its past simple', promptAr: 'صِل الفعل بماضيه',
      pairs: [['go', 'went'], ['buy', 'bought'], ['see', 'saw'], ['eat', 'ate'], ['write', 'wrote']] },
    { kind: 'reorder', prompt: 'Build the question', promptAr: 'ابنِ السؤال',
      tiles: ['you', 'do', 'where', 'work', '?'], solution: ['where', 'do', 'you', 'work', '?'], answer: '*Where do* you work*?*' },
    { kind: 'pick', prompt: 'Habit or happening now?', promptAr: 'عادة أم يحدث الآن؟',
      options: ['Look! It rains.', 'Look! It is raining.', 'Look! It raining.'], answer: 1,
      why: '*Look!* signals THIS moment → present continuous, and it needs BOTH halves: *is* + *-ing*.', whyAr: 'كلمة Look تدلّ على اللحظة الآن، والمضارع المستمر يحتاج شطريه: is + ing.' },
    { kind: 'pick', prompt: 'Which negative is correct?', promptAr: 'أيّ نفي صحيح؟',
      options: ['He didn’t came to class.', 'He didn’t come to class.', 'He not came to class.'], answer: 1,
      why: '*didn’t* already carries the past, so the main verb returns to its BARE form.', whyAr: 'didn’t تحمل الماضي فيعود الفعل الأصلي مجرّدًا.' },
  ],
  4: [
    { kind: 'pick', prompt: 'in, on or at?', promptAr: 'أيّ حرف جرّ؟',
      options: ['I was born in 1995.', 'I was born on 1995.', 'I was born at 1995.'], answer: 0,
      why: '*in* for the big containers — years, months, seasons. *on* for days, *at* for clock times.', whyAr: 'in للأوعية الكبيرة كالسنوات والشهور، و on للأيام، و at للساعات.' },
    { kind: 'match', prompt: 'Connect the adjective to its comparative', promptAr: 'صِل الصفة بصيغة المقارنة',
      pairs: [['big', 'bigger'], ['easy', 'easier'], ['good', 'better'], ['expensive', 'more expensive'], ['bad', 'worse']] },
    { kind: 'reorder', prompt: 'Build the passive sentence', promptAr: 'ابنِ الجملة المبنية للمجهول',
      tiles: ['was', 'the', 'built', 'in', 'bridge', '1920', '.'], solution: ['the', 'bridge', 'was', 'built', 'in', '1920', '.'], answer: 'The bridge *was built* in 1920*.*' },
    { kind: 'pick', prompt: 'make or do?', promptAr: 'make أم do؟',
      options: ['I did a mistake.', 'I made a mistake.', 'I make a mistake yesterday.'], answer: 1,
      why: 'You *make* a mistake and *do* your homework — collocation is habit, not logic.', whyAr: 'نقول make a mistake و do homework؛ التلازم عادة لا منطق.' },
  ],
  5: [
    { kind: 'pick', prompt: 'Sentence or fragment?', promptAr: 'جملة كاملة أم ناقصة؟',
      options: ['Because I was tired.', 'I was tired.', 'When the rain started.'], answer: 1,
      why: 'Only (2) can stand alone. *Because* and *When* make a clause DEPENDENT — it needs a main clause.', whyAr: 'الثانية وحدها تقف بذاتها؛ because و when تجعلان الجملة تابعة تحتاج جملة رئيسية.' },
    { kind: 'reorder', prompt: 'Build the complex sentence', promptAr: 'ابنِ الجملة المعقّدة',
      tiles: ['I', 'because', 'stayed', 'was', 'home', 'I', 'ill', '.'], solution: ['I', 'stayed', 'home', 'because', 'I', 'was', 'ill', '.'], answer: 'I stayed home *because* I was ill*.*' },
    { kind: 'match', prompt: 'Connect each FANBOYS word to its meaning', promptAr: 'صِل كل أداة عطف بمعناها',
      pairs: [['and', 'add'], ['but', 'contrast'], ['so', 'result'], ['or', 'choice'], ['for', 'reason']] },
    { kind: 'pick', prompt: 'Which one fixes the comma splice?', promptAr: 'أيّها يصحّح الفاصلة الخاطئة؟',
      options: ['I was late, I ran.', 'I was late, so I ran.', 'I was late I ran.'], answer: 1,
      why: 'A comma is a PAUSE, not a join. Two full sentences need real glue: a FANBOYS, a full stop, or a semicolon.', whyAr: 'الفاصلة وقفة لا رابط؛ الجملتان الكاملتان تحتاجان رابطًا حقيقيًا.' },
  ],
  6: [
    { kind: 'pick', prompt: 'Comma or no comma?', promptAr: 'فاصلة أم لا؟',
      options: ['I like tea, and coffee.', 'I like tea and coffee.', 'I like, tea and coffee.'], answer: 1,
      why: 'No comma — *coffee* is one word, not a full sentence. The comma only comes when BOTH sides could stand alone.', whyAr: 'لا فاصلة لأن الطرف الثاني كلمة لا جملة؛ الفاصلة حين يكون الطرفان جملتين.' },
    { kind: 'reorder', prompt: 'Make the list parallel', promptAr: 'اجعل القائمة متوازية',
      tiles: ['reading', 'I', 'writing', 'like', 'and', 'swimming', '.'], solution: ['I', 'like', 'reading', 'writing', 'and', 'swimming', '.'], answer: 'I like *reading*, *writing* and *swimming*.' },
    { kind: 'match', prompt: 'Connect the transition to its job', promptAr: 'صِل أداة الربط بوظيفتها',
      pairs: [['However,', 'contrast'], ['Therefore,', 'result'], ['For example,', 'illustration'], ['Moreover,', 'addition'], ['In short,', 'closing']] },
    { kind: 'pick', prompt: 'Which sounds like a writer, not a robot?', promptAr: 'أيّها بأسلوب كاتب لا آلة؟',
      options: ['I woke up. I ate. I left. I worked.', 'After I woke up, I ate and then left for work.', 'I woke up and I ate and I left and I worked.'], answer: 1,
      why: 'Vary the openings and the lengths. Four short sentences in a row read as a robot; four joined by *and* read as a child.', whyAr: 'نوّع البدايات والأطوال؛ الجمل القصيرة المتتالية آلية، وربطها كله بـ and طفوليّ.' },
  ],
  7: [
    { kind: 'reorder', prompt: 'Put the paragraph in order', promptAr: 'رتّب الفقرة',
      tiles: ['In short, my city is beautiful.', 'For example, the old medina glows at sunset.', 'My city is beautiful.', 'It is beautiful because of its light.'],
      solution: ['My city is beautiful.', 'It is beautiful because of its light.', 'For example, the old medina glows at sunset.', 'In short, my city is beautiful.'],
      answer: 'My city is beautiful. → It is beautiful *because* of its light. → *For example*, the old medina glows at sunset. → *In short*, my city is beautiful.' },
    { kind: 'pick', prompt: 'Which is a good topic sentence?', promptAr: 'أيّها جملة موضوعية جيّدة؟',
      options: ['My city has 400,000 people.', 'My city is beautiful in winter.', 'Morocco is interesting.'], answer: 1,
      why: 'It needs an ANGLE you can develop. (1) is a fact with nothing to add; (3) is a book, not a paragraph.', whyAr: 'تحتاج زاوية يمكن تطويرها؛ الأولى معلومة جافّة والثالثة تصلح لكتاب لا لفقرة.' },
    { kind: 'match', prompt: 'Connect each R.E.D. letter to its question', promptAr: 'صِل كل حرف من R.E.D. بسؤاله',
      pairs: [['R — Reason', 'why?'], ['E — Example', 'like what?'], ['D — Detail', 'what exactly?']] },
    { kind: 'pick', prompt: 'Which sentence does NOT belong?', promptAr: 'أيّ جملة لا تنتمي؟',
      options: ['Studying at night is better for me.', 'It is quiet after eleven.', 'My brother plays football on Fridays.'], answer: 2,
      why: 'Off topic. Every supporting sentence must serve the topic sentence — if it does not, cut it.', whyAr: 'خارج الموضوع؛ كل جملة داعمة تخدم الجملة الموضوعية وإلا حُذفت.' },
  ],
  8: [
    { kind: 'reorder', prompt: 'Put the formal email in order', promptAr: 'رتّب الإيميل الرسمي',
      tiles: ['Kind regards, Omar Benali', 'Dear Mr. Alami,', 'Subject: Leave Request — 12–13 August', 'I am writing to request two days of leave.'],
      solution: ['Subject: Leave Request — 12–13 August', 'Dear Mr. Alami,', 'I am writing to request two days of leave.', 'Kind regards, Omar Benali'],
      answer: 'Subject → *Dear Mr. Alami,* → *I am writing to request…* → *Kind regards,* Omar Benali' },
    { kind: 'match', prompt: 'Connect informal to formal', promptAr: 'صِل الودّي بالرسمي',
      pairs: [['get', 'receive'], ['ask for', 'request'], ['find out', 'discover'], ['sort out', 'resolve'], ['a lot of', 'considerable']] },
    { kind: 'pick', prompt: 'You do not know the reader’s name. Which opening?', promptAr: 'لا تعرف اسم القارئ — أيّ افتتاح؟',
      options: ['Hi there,', 'Dear Sir or Madam,', 'Dear Friend,'], answer: 1,
      why: 'Name unknown → *Dear Sir or Madam*, and it closes with *Yours faithfully*. Name known → *Dear Mr. X* and *Kind regards*.', whyAr: 'إن جهلت الاسم فـ Dear Sir or Madam ثم Yours faithfully، وإن عرفته فـ Dear Mr. ثم Kind regards.' },
    { kind: 'pick', prompt: 'Which complaint will actually work?', promptAr: 'أيّ شكوى ستنجح فعلًا؟',
      options: ['Your service is terrible and you are thieves!', 'Order #45872 has not arrived after three weeks. I would like delivery within five days or a full refund.', 'Please do something about my order soon.'], answer: 1,
      why: 'Facts + a specific demand + a deadline. Anger gets filed; precision gets actioned.', whyAr: 'حقائق ومطلب محدّد ومهلة؛ الغضب يُؤرشَف والدقّة تُنفَّذ.' },
  ],
  9: [
    { kind: 'match', prompt: 'Connect each perfect modal to its meaning', promptAr: 'صِل كل صيغة بمعناها',
      pairs: [['should have', 'regret'], ['must have', 'confident guess'], ['can’t have', 'confident denial'], ['might have', 'possible guess'], ['needn’t have', 'it was unnecessary']] },
    { kind: 'reorder', prompt: 'Build the third conditional', promptAr: 'ابنِ الشرط الثالث',
      tiles: ['had', 'if', 'I', 'studied', 'I', 'passed', 'would', 'have', ','], solution: ['if', 'I', 'had', 'studied', ',', 'I', 'would', 'have', 'passed'], answer: '*If* I *had studied*, I *would have passed*.' },
    { kind: 'pick', prompt: 'Duty or memory?', promptAr: 'واجب أم ذكرى؟',
      options: ['Remember locking the door — it is urgent.', 'Remember to lock the door — it is urgent.', 'Remember lock the door — it is urgent.'], answer: 1,
      why: '*to* looks FORWARD to a duty; *-ing* looks BACK at a memory. The door is not locked yet.', whyAr: 'صيغة to تنظر إلى الأمام (واجب) و ing تنظر إلى الوراء (ذكرى).' },
    { kind: 'pick', prompt: 'Report it correctly', promptAr: 'انقلها بشكل صحيح',
      options: ['She asked me where do I live.', 'She asked me where I lived.', 'She asked me where did I live?'], answer: 1,
      why: 'A reported question loses the question ORDER and the mark: statement order, no *do*, full stop.', whyAr: 'السؤال المنقول يفقد ترتيب السؤال وعلامته: ترتيب خبري بلا do وبنقطة.' },
  ],
  10: [
    { kind: 'reorder', prompt: 'Put the introduction in order', promptAr: 'رتّب المقدّمة',
      tiles: ['Schools should therefore teach writing, not only conversation.', 'Why do so many adults abandon a language they studied for years?', 'English has become the language of hiring across the region.'],
      solution: ['Why do so many adults abandon a language they studied for years?', 'English has become the language of hiring across the region.', 'Schools should therefore teach writing, not only conversation.'],
      answer: 'Hook → Background → *Thesis last*' },
    { kind: 'pick', prompt: 'Topic or thesis?', promptAr: 'موضوع أم أطروحة؟',
      options: ['This essay is about online learning.', 'Online learning suits motivated adults but fails most teenagers.', 'Online learning is a modern subject.'], answer: 1,
      why: 'A thesis is a claim someone could DISAGREE with. Announcing a subject is not taking a position.', whyAr: 'الأطروحة ادّعاء يمكن مخالفته؛ والإعلان عن موضوع ليس اتّخاذ موقف.' },
    { kind: 'match', prompt: 'Connect each essay type to its shape', promptAr: 'صِل نوع المقال ببنائه',
      pairs: [['Opinion', 'one side, held throughout'], ['For & against', 'two sides, verdict last'], ['Problem–solution', 'cause → matching remedy'], ['Counter-argument', 'admit → turn → answer']] },
    { kind: 'reorder', prompt: 'Build the concession move', promptAr: 'ابنِ حركة التنازل',
      tiles: ['completion rates remain below 10%.', 'It is true that online courses are cheaper.', 'However,'],
      solution: ['It is true that online courses are cheaper.', 'However,', 'completion rates remain below 10%.'],
      answer: '*It is true that…* → *However,* → *…the evidence*' },
  ],
  11: [
    { kind: 'match', prompt: 'Connect the claim to its hedge', promptAr: 'صِل الادّعاء بتحوّطه',
      pairs: [['All students hate exams.', 'Many students find exams stressful.'], ['This proves it.', 'This suggests it.'], ['Everybody knows…', 'It is widely accepted…'], ['It destroys concentration.', 'It appears to erode concentration.']] },
    { kind: 'reorder', prompt: 'Build the cleft sentence', promptAr: 'ابنِ الجملة المشطورة',
      tiles: ['is', 'what', 'need', 'time', 'we', '.'], solution: ['what', 'we', 'need', 'is', 'time', '.'], answer: '*What* we need *is* time*.*' },
    { kind: 'reorder', prompt: 'Build the inversion', promptAr: 'ابنِ الجملة المقلوبة',
      tiles: ['I', 'have', 'never', 'such', 'seen', 'a', 'response', '.'], solution: ['never', 'have', 'I', 'seen', 'such', 'a', 'response', '.'], answer: '*Never have I seen* such a response*.*' },
    { kind: 'pick', prompt: 'Which avoids the repetition best?', promptAr: 'أيّها يتجنّب التكرار أفضل؟',
      options: ['I bought a new phone because my old phone broke.', 'I bought a new phone because my old one broke.', 'I bought a new phone because the phone I had before broke.'], answer: 1,
      why: '*one* stands in for a countable noun already named. English reads repetition as a small vocabulary.', whyAr: 'كلمة one تنوب عن الاسم المذكور؛ والإنجليزية تقرأ التكرار ضيقَ حصيلة.' },
  ],
}

export const LESSONS: Lesson[] = [
  /* ─────────────────────────── 1 · CAPITALIZATION ─────────────────────────── */
  {
    no: 1, tag: 'Capitalization', tagAr: 'الحروف الكبيرة',
    title: 'Capital Letters — which words take one',
    titleAr: 'الحروف الكبيرة — أيّ الكلمات تأخذها',
    objectives: [
      { en: 'Capitalize the first word of every sentence', ar: 'كتابة أول كلمة في الجملة بحرف كبير' },
      { en: 'Know the CATEGORIES that always take a capital', ar: 'معرفة الفئات التي تأخذ حرفًا كبيرًا دائمًا' },
      { en: 'Tell a *name* from a *type of thing*', ar: 'التمييز بين الاسم العَلَم واسم النوع' },
      { en: 'Capitalize every word of a compound NAME', ar: 'كتابة كل كلمة في الاسم المركّب بحرف كبير' },
    ],
    rule: {
      en: 'Start every sentence with a *CAPITAL*. Then capitalize every *NAME*: people, cities, countries, nationalities, languages, days, months, institutions — and the word *I*. If the name is made of two words, *both* get a capital: *New York*, *Hassan Street*. A type of thing does not: *a city*, *a street*.',
      ar: 'ابدأ كل جملة بحرف كبير، ثم اكتب كل *اسم عَلَم* بحرف كبير: الأشخاص والمدن والدول والجنسيات واللغات والأيام والأشهر والمؤسّسات، وكلمة I. وإن تكوّن الاسم من كلمتين فكلتاهما بحرف كبير. أما اسم النوع فلا.',
    },
    explain: {
      intro: 'In speaking, capitals are invisible. In writing, they are a rule — and a missing capital is a clear mistake a reader notices immediately.',
      introAr: 'في الكلام لا تظهر الحروف الكبيرة، لكن في الكتابة هي قاعدة، وغيابها خطأ يلاحظه القارئ فورًا.',
      points: [
        { en: 'First word of a sentence: *T*oday is Monday.', ar: 'أول كلمة في الجملة' },
        { en: 'People & places (proper nouns): *S*ara, *R*abat, *M*orocco', ar: 'أسماء الأشخاص والأماكن' },
        { en: 'Languages & nationalities: *A*rabic, *E*nglish, *F*rench', ar: 'اللغات والجنسيات' },
        { en: 'Days & months: *M*onday, *J*uly (but not seasons)', ar: 'الأيام والأشهر' },
        { en: 'The pronoun *I* is ALWAYS capital', ar: 'الضمير I دائمًا كبير' },
        { en: 'A NAME takes a capital · a TYPE of thing does not: *Casablanca* vs *a city*', ar: 'الاسم العَلَم يأخذ حرفًا كبيرًا، واسم النوع لا: Casablanca مقابل a city' },
        { en: 'Compound NAME → every word: *New York* · *Hassan Street* · *Atlas Mountains*', ar: 'الاسم المركّب: كل كلمة فيه بحرف كبير' },
        { en: 'Compound TYPE → no words: *bus station* · *coffee shop* · *train ticket*', ar: 'التركيب الوصفي: لا حرف كبير في أيّ كلمة منه' },
      ],
    },
    examples: [
      /* Part 1 — the categories, one card each. Part 2 — name vs type, which is
         where the real mistakes live, ending on the compound contrast. */
      { en: 'People: *S*ara · *O*mar · *H*amza *E*l *Q*asraoui', ar: 'الأشخاص', why: 'Every part of a person’s name takes a capital — first, middle and family.', whyAr: 'كل جزء من اسم الشخص بحرف كبير: الأول والأوسط والعائلة.' },
      { en: 'Cities: *R*abat · *C*asablanca · *D*ubai', ar: 'المدن', why: 'A city is a NAME, so it is capital wherever it appears in the sentence.', whyAr: 'المدينة اسم عَلَم فتُكتب بحرف كبير أينما وردت.' },
      { en: 'Countries: *M*orocco · *E*gypt · *F*rance', ar: 'الدول', why: 'Same category as cities — countries are names, not descriptions.', whyAr: 'الدول كالمدن: أسماء لا أوصاف.' },
      { en: 'Nationalities: a *M*oroccan engineer · an *E*gyptian friend', ar: 'الجنسيات', why: 'English capitalizes nationalities; Arabic does not — this one is easy to forget.', whyAr: 'الإنجليزية تكتب الجنسية بحرف كبير والعربية لا، ولهذا تُنسى.' },
      { en: 'Languages: *A*rabic · *E*nglish · *F*rench', ar: 'اللغات', why: 'Languages come from country names, so they inherit the capital.', whyAr: 'اللغات مشتقّة من أسماء البلدان فورثت الحرف الكبير.' },
      { en: 'Days: *M*onday · *F*riday · *S*unday', ar: 'الأيام', why: 'Days are proper nouns in English. In Arabic they are ordinary words.', whyAr: 'الأيام أسماء عَلَم في الإنجليزية، وكلمات عادية في العربية.' },
      { en: 'Months: *J*anuary · *A*ugust · *R*amadan', ar: 'الأشهر', why: 'Months follow the same rule as days — but SEASONS do not: *summer*.', whyAr: 'الأشهر كالأيام، أما الفصول فلا: summer بحرف صغير.' },
      { en: 'Titles before a name: *M*r. *A*lami · *D*r. *S*ara', ar: 'الألقاب قبل الاسم', why: 'The title is part of the name here, so it takes a capital too.', whyAr: 'اللقب جزء من الاسم هنا فيأخذ حرفًا كبيرًا أيضًا.' },
      { en: 'The pronoun *I*: *I* think *I* can.', ar: 'الضمير I', why: 'The only pronoun English capitalizes, and it never depends on position.', whyAr: 'الضمير الوحيد الذي يُكتب كبيرًا، ولا يتوقّف على موضعه.' },
      { en: 'NOT capital: *summer* · *north* · *the government* · *my school*', ar: 'لا تأخذ حرفًا كبيرًا', why: 'Seasons, directions and job/place TYPES are descriptions, not names.', whyAr: 'الفصول والجهات وأنواع الأماكن أوصاف لا أسماء.' },
      { en: 'a city  →  *C*asablanca', ar: 'نوع ← اسم', why: 'Same thing, two ways of naming it. Only the NAME earns the capital.', whyAr: 'الشيء نفسه بطريقتين، والحرف الكبير للاسم وحده.' },
      { en: 'a university  →  *A*l *A*khawayn *U*niversity', ar: 'نوع ← اسم مركّب', why: 'Now it is a name made of three words — so all three are capital.', whyAr: 'صار اسمًا من ثلاث كلمات، فكلّها بحرف كبير.' },
      { en: 'a street  →  *H*assan *S*treet', ar: 'نوع ← اسم مركّب', why: 'Even *Street* takes a capital, because it is part of the name itself.', whyAr: 'حتى كلمة Street بحرف كبير لأنها جزء من الاسم.' },
      { en: 'a mosque  →  *H*assan *II* *M*osque', ar: 'نوع ← اسم مركّب', why: 'Every word of the name, including the number and the word *Mosque*.', whyAr: 'كل كلمات الاسم، ومنها الرقم وكلمة Mosque.' },
      { en: 'mountains  →  the *A*tlas *M*ountains', ar: 'نوع ← اسم مركّب', why: '*the* stays small — it is not part of the name, just an article.', whyAr: 'كلمة the تبقى صغيرة لأنها أداة لا جزء من الاسم.' },
      { en: 'Compound NAME ✓: *N*ew *Y*ork · *U*nited *A*rab *E*mirates', ar: 'اسم مركّب: كل كلمة كبيرة', why: 'Two or three words, one name — so every word is capital.', whyAr: 'كلمتان أو ثلاث لاسم واحد، فكلّها بحرف كبير.' },
      { en: 'Compound TYPE ✗: *bus station* · *coffee shop* · *train ticket*', ar: 'تركيب وصفي: بلا حرف كبير', why: 'THE contrast of this lesson: two words describing a KIND take no capitals.', whyAr: 'مفارقة الدرس: كلمتان تصفان نوعًا فلا حرف كبير فيهما.' },
      { en: 'Compare: I waited at the *bus station* in *N*ew *Y*ork.', ar: 'قارن في جملة واحدة', why: 'One sentence, both rules: the type stays small, the name goes capital.', whyAr: 'جملة واحدة وقاعدتان: النوع صغير والاسم كبير.' },
      { en: '*M*y name is *S*ara.', ar: 'اسمي سارة.', why: 'Two capitals: the first word of the sentence, and a NAME.', whyAr: 'حرفان كبيران: أول الجملة، والاسم العلم.' },
      { en: '*I* live in *R*abat, *M*orocco.', ar: 'أعيش في الرباط، المغرب.', why: '*I* is always capital, wherever it stands — no other pronoun is.', whyAr: 'I كبيرة دائمًا أينما وقعت، ولا ضمير غيرها كذلك.' },
      { en: '*T*oday is *M*onday.', ar: 'اليوم هو الاثنين.', why: 'Days of the week are proper nouns in English — Arabic does not mark them.', whyAr: 'أيام الأسبوع أسماء علم في الإنجليزية، والعربية لا تميّزها.' },
      { en: '*W*e speak *A*rabic and *E*nglish.', ar: 'نتحدّث العربية والإنجليزية.', why: 'Languages take a capital too, because they come from country names.', whyAr: 'اللغات تأخذ حرفًا كبيرًا لأنها مشتقّة من أسماء البلدان.' },
      { en: '*A*li and *O*mar are friends.', ar: 'علي وعمر صديقان.', why: 'Both names are capitalised, even in the middle of the subject.', whyAr: 'الاسمان كبيران ولو كانا في وسط الفاعل.' },
      { en: '*I* was born in *J*uly.', ar: 'وُلدت في يوليوز.', why: 'Months are proper nouns, exactly like days.', whyAr: 'الشهور أسماء علم كالأيام تمامًا.' },
      { en: '*S*he studies at *H*arvard.', ar: 'تدرس في هارفارد.', why: 'The name of an institution is a proper noun — *school* alone would not be.', whyAr: 'اسم المؤسّسة علم، أما كلمة school وحدها فلا.' },
    ],
    exercises: [
      { q: 'Correct: “my name is sara and i live in rabat.”', a: '*M*y name is *S*ara, and *I* live in *R*abat.' },
      { q: 'Correct: “on monday we study english and french.”', a: 'On *M*onday we study *E*nglish and *F*rench.' },
      { q: 'Correct: “ali and omar visited spain in august.”', a: '*A*li and *O*mar visited *S*pain in *A*ugust.' },
      { q: 'Correct: “my teacher mr. karim is from london.”', a: '*M*y teacher, *M*r. *K*arim, is from *L*ondon.' },
      { q: 'Which words must be capital: i · monday · book · morocco?', a: '*I*, *M*onday, *M*orocco (not “book”).' },
      { q: 'Name or type? “we passed a mosque” · “we passed hassan II mosque”', a: 'Type → *a mosque*. Name → *H*assan *II* *M*osque — every word.' },
      { q: 'Capitalize correctly: “i took a taxi from the bus station to hassan street.”', a: '*I* took a taxi from the *bus station* to *H*assan *S*treet.' },
      { q: 'Why is “New York” capital but “coffee shop” is not?', a: '*New York* is a NAME (both words); *coffee shop* is a TYPE of place.' },
    ],
    reading: {
      title: 'A Short Introduction', titleAr: 'تعريف قصير',
      passage: [
        'My name is *O*mar, and I come from *F*es, a beautiful city in *M*orocco.',
        'Every *M*onday, I study *E*nglish at the *A*merican *L*anguage *C*enter — a *language school* near the *bus station*.',
        'My teacher, *M*r. *K*arim, is from *L*ondon, and he is very patient.',
        'He always says that practice is the key to success.',
        'In *J*uly, I will travel to *S*pain to visit my brother *Y*usuf.',
      ],
      questions: [
        { q: 'Where does Omar come from?', a: 'From *F*es, in *M*orocco.' },
        { q: 'When does he study English?', a: 'Every *M*onday.' },
        { q: 'Why is “American Language Center” capitalized?', a: 'It is the *name* of a place (a proper noun).' },
        { q: 'Find two more words that must be capital and say why.', a: 'e.g. *J*uly (month), *S*pain (country), *Y*usuf (name).' },
      ],
      tip: 'Notice the pair: *American Language Center* is a NAME (all capital) but *language school* and *bus station* are TYPES (all small).',
      tipAr: 'لاحظ المقابلة: American Language Center اسم فكلّه كبير، أما language school و bus station فنوعان فكلّهما صغير.',
    },
    homework: [
      { en: 'Write 5 sentences about your city; capitalize every proper noun', ar: 'اكتب ٥ جمل عن مدينتك مع كتابة أسماء العَلَم بحرف كبير' },
      { en: 'Write 4 pairs: a TYPE and its NAME (a city → Casablanca)', ar: 'اكتب ٤ أزواج: نوع واسمه (a city ← Casablanca)' },
      { en: 'Write 3 sentences using “I”, a day, and a month', ar: 'اكتب ٣ جمل تستعمل I ويومًا وشهرًا' },
    ],
    editing: {
      wrong: [
        'my brother lives in madrid.',
        'he speaks spanish and english.',
        'every friday, i call him.',
        'in june, we will meet in paris.',
      ],
      correct: [
        '*M*y brother lives in *M*adrid.',
        '*H*e speaks *S*panish and *E*nglish.',
        '*E*very *F*riday, *I* call him.',
        '*I*n *J*une, we will meet in *P*aris.',
      ],
    },
  },

  /* ─────────────────────────── 2 · VOWELS ─────────────────────────── */
  {
    no: 2, tag: 'Vowels', tagAr: 'أحرف العلّة',
    title: 'Vowels — the engine of English spelling',
    titleAr: 'أحرف العلّة — محرّك الإملاء الإنجليزي',
    objectives: [
      { en: 'Stop dropping vowels — the commonest Arabic-speaker misspelling', ar: 'التوقّف عن إسقاط أحرف العلّة — أشيع خطأ إملائي' },
      { en: 'Use the silent *-e* that changes the vowel before it', ar: 'استعمال e الصامتة التي تغيّر العلّة قبلها' },
      { en: 'Know when to DOUBLE the last letter before *-ing* / *-ed*', ar: 'معرفة متى يُضاعَف الحرف الأخير' },
      { en: 'Spell *-y* endings correctly: cit*ies* but bo*ys*', ar: 'إملاء نهايات y بشكل صحيح' },
    ],
    rule: {
      en: 'Vowels are *a e i o u* (and sometimes *y*). Every syllable needs one, so none can be dropped. They also run four spelling rules you will use every day: the *silent -e*, *doubling* before -ing/-ed, *dropping the e*, and *-y → -ies*.',
      ar: 'أحرف العلّة a e i o u وأحيانًا y. كل مقطع يحتاج واحدًا فلا يجوز إسقاطها. وهي تتحكّم في أربع قواعد إملائية تستعملها يوميًا: e الصامتة، ومضاعفة الحرف قبل ing/ed، وحذف e، وتحويل y إلى ies.',
    },
    explain: {
      intro: 'This is not a reading lesson. Arabic writes short vowels as marks you may leave out; English writes them as *letters* you may not — which is why *becuse* and *schol* are the two most common misspellings in this classroom. And once you can see the vowel, four spelling rules become mechanical.',
      introAr: 'هذا ليس درس قراءة. العربية تكتب الحركات علاماتٍ يجوز تركها، والإنجليزية تكتبها *حروفًا* لا يجوز إسقاطها — ولهذا كان becuse و schol أشيع خطأين هنا. وما إن ترى حرف العلّة حتى تصير أربع قواعد إملائية آليّة.',
      points: [
        { en: 'The 5 vowels: *a e i o u* — consonants are all the rest: b c d f g …', ar: 'أحرف العلّة الخمسة، والساكنة هي الباقي' },
        { en: 'Sometimes *y* acts as a vowel: cit*y*, happ*y*, tr*y*', ar: 'أحيانًا y تعمل كحرف علّة' },
        { en: 'Almost every English *syllable* needs a vowel — that is why they cannot be dropped', ar: 'كل مقطع إنجليزي تقريبًا يحتاج حرف علّة — لذلك لا تُحذف' },
        { en: 'Arabic writes short vowels as marks; English writes them as *letters*. Never skip them.', ar: 'العربية تكتب الحركات علاماتٍ، والإنجليزية تكتبها حروفًا — لا تُسقطها' },
        { en: 'It is the *SOUND*, not the letter, that picks a/an: *an* hour · *a* university', ar: 'الصوت لا الحرف هو ما يختار a أو an' },
        { en: 'Silent *-e* changes the vowel before it: hop → hop*e* · tap → tap*e*', ar: 'e الصامتة تغيّر العلّة قبلها' },
        { en: 'SHORT vowel → double the last letter: si*t* → si*tt*ing · sto*p* → sto*pp*ed', ar: 'العلّة القصيرة تضاعف الحرف الأخير' },
        { en: 'Word ends in *-e* → drop it before *-ing*: mak*e* → mak*ing*', ar: 'المنتهي بـ e يسقطها قبل ing' },
        { en: 'consonant + *y* → *-ies*: cit*y* → cit*ies* · but vowel + *y* → bo*ys*', ar: 'ساكن + y تصير ies، وعلّة + y تبقى s' },
      ],
    },
    examples: [
      /* Part 1 — why a vowel cannot be dropped. Part 2 — the four spelling
         rules vowels control. Part 3 — the words this actually fixes. */
      { en: 'Vowels: *a* *e* *i* *o* *u* — and *y* when it sounds like one: cit*y*, tr*y*', ar: 'أحرف العلّة، و y حين تُنطق كذلك', why: 'Five letters, plus a part-time sixth. Everything below depends on spotting them.', whyAr: 'خمسة أحرف وسادس بدوام جزئي، وكل ما يأتي يعتمد على تمييزها.' },
      { en: 'Every syllable holds one: *tea*·*cher* · *stu*·*dent* · *fa*·*mi*·*ly*', ar: 'كل مقطع يحمل واحدًا', why: 'Count the vowel sounds and you have counted the syllables — that is how you spell long words.', whyAr: 'عُدّ أصوات العلّة تَعُدّ المقاطع، وبهذا تُملي الكلمات الطويلة.' },
      { en: 'Arabic: كتب can lose its marks. English: *because* cannot lose its vowels.', ar: 'العربية تسقط الحركات والإنجليزية لا', why: 'THE reason for this lesson. Arabic vowels are optional marks; English vowels are letters.', whyAr: 'سبب هذا الدرس: حركات العربية اختيارية، وعلل الإنجليزية حروف.' },
      { en: '✗ becuse · schol · frend  →  ✓ bec*au*se · sch*oo*l · fri*e*nd', ar: 'أخطاء الإسقاط الشائعة', why: 'Three misspellings, one cause: a vowel was heard faintly and left out.', whyAr: 'ثلاثة أخطاء بسبب واحد: علّة سُمعت خافتة فحُذفت.' },
      { en: 'RULE 1 — silent *-e*: hop → hop*e* · tap → tap*e* · bit → bit*e*', ar: 'القاعدة ١: e الصامتة', why: 'The final *e* is never pronounced — it reaches back and lengthens the vowel before it.', whyAr: 'e الأخيرة لا تُنطق، بل تمدّ العلّة التي قبلها.' },
      { en: 'It changes the WORD: *not* → *note* · *man* → *mane* · *cut* → *cute*', ar: 'وتغيّر الكلمة نفسها', why: 'One silent letter, a different word entirely. This is why it cannot be forgotten.', whyAr: 'حرف صامت واحد يغيّر الكلمة كلّها، ولهذا لا يُنسى.' },
      { en: 'RULE 2 — SHORT vowel doubles: si*t* → si*tt*ing · sto*p* → sto*pp*ed · ru*n* → ru*nn*ing', ar: 'القاعدة ٢: العلّة القصيرة تضاعف', why: 'One short vowel + one final consonant → double it, or the vowel would read long.', whyAr: 'علّة قصيرة وحرف أخير واحد فيُضاعَف، وإلا قُرئت العلّة طويلة.' },
      { en: 'But NOT after two vowels: r*ai*n → r*ai*ning · w*ai*t → w*ai*ted', ar: 'ولا تُضاعَف بعد علّتين', why: 'Two vowels already make the sound long, so nothing needs doubling.', whyAr: 'العلّتان تُطيلان الصوت أصلًا فلا حاجة إلى المضاعفة.' },
      { en: 'RULE 3 — drop the *e* before *-ing*: mak*e* → mak*ing* · writ*e* → writ*ing*', ar: 'القاعدة ٣: احذف e قبل ing', why: 'The silent *e* has done its job; *-ing* takes over, so the *e* goes.', whyAr: 'أدّت e الصامتة دورها فتنسحب أمام ing.' },
      { en: 'RULE 4 — consonant + *y* → *-ies*: cit*y* → cit*ies* · stud*y* → stud*ies*', ar: 'القاعدة ٤: ساكن + y ← ies', why: 'Check the letter BEFORE the y, never the y itself. Consonant → change it.', whyAr: 'انظر إلى الحرف قبل y لا إلى y نفسها.' },
      { en: 'But vowel + *y* stays: b*oy* → b*oys* · pl*ay* → pl*ays* · k*ey* → k*eys*', ar: 'وعلّة + y تبقى', why: 'A vowel already sits before the y, so English leaves the word alone.', whyAr: 'قبل y علّة فتُترك الكلمة كما هي.' },
      { en: 'The four rules on one verb: *stop* → *stopping* · *stopped* · *stops*', ar: 'القواعد على فعل واحد', why: 'This is what the lesson buys you: any verb, any ending, no guessing.', whyAr: 'هذا ما يمنحه الدرس: أي فعل وأي نهاية بلا تخمين.' },
      { en: 'And on a noun: *baby* → *babies* · *city* → *cities* · *day* → *days*', ar: 'وعلى الأسماء', why: 'The same *-y* rule runs plurals and verbs alike — learn it once.', whyAr: 'قاعدة y نفسها تحكم الجمع والأفعال، فتُتعلَّم مرّة واحدة.' },
      { en: 'a / an follows the SOUND: *an* hour · *a* university · *an* MBA', ar: 'a أو an حسب الصوت', why: 'The ear decides, not the letter — *hour* opens on a vowel sound, *university* does not.', whyAr: 'الأذن تقرّر لا الحرف.' },
      { en: 'Long words are just syllables: *res*·*tau*·*rant* · *beau*·*ti*·*ful*', ar: 'الكلمات الطويلة مقاطع', why: 'Break it at the vowels and a frightening word becomes three easy ones.', whyAr: 'قسّمها عند أحرف العلّة تصر الكلمة المخيفة ثلاثًا سهلة.' },
    ],
    exercises: [
      { q: 'Add *-ing*: sit · make · rain', a: 'si*tt*ing (short vowel doubles) · mak*ing* (drop the e) · r*ai*ning (two vowels, no change)' },
      { q: 'Add *-ed*: stop · study · play', a: 'sto*pp*ed · stud*ied* · pla*yed*' },
      { q: 'Plural: city · baby · boy · key', a: 'cit*ies* · bab*ies* · bo*ys* · ke*ys*' },
      { q: 'What does the silent *-e* do to “hop”?', a: 'hop → hop*e* — it lengthens the vowel and changes the word.' },
      { q: 'Fix: “I am writting becuse I am studing.”', a: 'I am *writing* *because* I am *studying*.' },
      { q: 'a or an? “___ hour · ___ university · ___ orange”', a: '*an* hour · *a* university · *an* orange — the SOUND decides.' },
    ],
    reading: {
      title: 'Sounds First', titleAr: 'الصوت أولًا',
      passage: [
        'When I read a new word, I look for the vowels first.',
        'The vowels *a*, *e*, *i*, *o*, and *u* carry the sound.',
        'For example, the word “school” hides two vowels together: *oo*.',
        'If a word begins with a vowel sound, like “apple”, I write “an” before it.',
        'So I say “an apple”, but “a banana”.',
      ],
      questions: [
        { q: 'What does the writer look for first in a new word?', a: 'The *vowels*.' },
        { q: 'Which vowels are hidden in “school”?', a: '*oo* (o, o).' },
        { q: 'Why do we say “an apple” but “a banana”?', a: '“apple” starts with a *vowel* sound; “banana” starts with a consonant.' },
      ],
      tip: 'Every spelling decision here — doubling, dropping, -ies — is made by looking at ONE vowel.',
      tipAr: 'كل قرار إملائي هنا — المضاعفة والحذف و ies — يُتّخذ بالنظر إلى حرف علّة واحد.',
    },
    homework: [
      { en: 'Add *-ing* to 10 verbs and say which rule you used', ar: 'أضف ing إلى ١٠ أفعال وبيّن القاعدة المستعملة' },
      { en: 'Write the plural of 8 nouns ending in *-y*', ar: 'اكتب جمع ٨ أسماء تنتهي بـ y' },
      { en: 'Find 5 words you have misspelled by dropping a vowel', ar: 'اعثر على ٥ كلمات أخطأت فيها بإسقاط حرف علّة' },
    ],
    editing: {
      wrong: [
        'I went to schl in the mrning becuse I was studing.',
        'She is writting to two citys about the babys.',
        'He stoped runing and was makeing tea.',
      ],
      correct: [
        'I went to sch*oo*l in the m*o*rning bec*au*se I was study*ing*.',
        'She is *writing* to two cit*ies* about the bab*ies*.',
        'He sto*pp*ed ru*nn*ing and was mak*ing* tea.',
      ],
    },
  },

  /* ─────────────────────────── 3 · ARTICLES ─────────────────────────── */
  {
    no: 4, tag: 'Articles', tagAr: 'الأدوات',
    title: 'Articles — a, an, the',
    titleAr: 'الأدوات — a / an / the',
    objectives: [
      { en: 'Use “a/an” for one non-specific thing', ar: 'استخدام a/an لشيء غير محدّد' },
      { en: 'Choose “a” or “an” by the SOUND', ar: 'اختيار a أو an حسب الصوت' },
      { en: 'Use “the” for a specific, known thing', ar: 'استخدام the للشيء المحدّد' },
      { en: 'Leave out the article with general plurals', ar: 'حذف الأداة مع الجمع العام' },
    ],
    rule: {
      en: 'Use *a* before a consonant sound (a book), *an* before a vowel sound (an apple), and *the* when the reader already knows which one (the sun).',
      ar: 'استخدم a قبل الصوت الساكن، و an قبل صوت العلّة، و the حين يعرف القارئ أيّ شيء تقصد.',
    },
    explain: {
      intro: 'Arabic has no “a/an”, so this is a common writing error. Fix it by asking: one general thing (a/an) or a specific known one (the)?',
      introAr: 'العربية لا تحوي a/an، لذا هذا خطأ شائع في الكتابة. اسأل: شيء عام واحد (a/an) أم محدّد معروف (the)؟',
      points: [
        { en: '*a* + consonant sound: a car, *a* university (“yoo-”)', ar: 'a قبل صوت ساكن' },
        { en: '*an* + vowel sound: an egg, *an* hour (silent h)', ar: 'an قبل صوت علّة' },
        { en: 'It is the *SOUND*, not the letter — that is the whole trick', ar: 'العبرة بالصوت لا بالحرف — هذا هو السرّ كله' },
        { en: 'First mention → *a* · after that → *the*: I bought *a* book. *The* book was cheap.', ar: 'أول ذكر ← a، وبعدها ← the' },
        { en: '*the* also for one-of-a-kind: *the* sun, *the* president, *the* first', ar: 'the للفريد: الشمس، الرئيس، الأول' },
        { en: 'Arabic trap: for things in general use NO article — *I like coffee.* not “I like the coffee” ✗', ar: 'فخّ العربية: العام في الإنجليزية بلا أداة، لا بـ the' },
      ],
    },
    examples: [
      { en: '*a* book', ar: 'كتاب', why: '*b* is a consonant sound, so *a*. This is the default choice.', whyAr: 'صوت ساكن فتأخذ a، وهذا هو الأصل.' }, { en: '*a* car', ar: 'سيارة', why: '*c* is a consonant sound — the ear decides, and it hears /k/.', whyAr: 'الأذن تسمع صوتًا ساكنًا فتختار a.' }, { en: '*a* house', ar: 'بيت', why: '*h* here is pronounced, so it counts as a consonant sound.', whyAr: 'حرف h منطوق هنا فيُعدّ صوتًا ساكنًا.' },
      { en: '*a* university', ar: 'جامعة', why: 'The KEY example: *u* is a vowel LETTER but sounds like *y*, so *a*.', whyAr: 'المثال المفتاح: u حرف علّة لكن صوتها y فتأخذ a.' }, { en: '*a* teacher', ar: 'معلّم', why: '*t* is a consonant — and jobs take an article, unlike in Arabic.', whyAr: 'صوت ساكن، والمهن تأخذ أداة بخلاف العربية.' },
      { en: '*an* apple', ar: 'تفاحة', why: '*a* is a vowel sound, so *an* — the extra *n* makes it easy to say.', whyAr: 'صوت علّة فتأخذ an، والنون تسهّل النطق.' }, { en: '*an* egg', ar: 'بيضة', why: '*e* is a vowel sound. Say it aloud and the *an* becomes obvious.', whyAr: 'انطقها بصوت عالٍ ليتّضح اختيار an.' }, { en: '*an* orange', ar: 'برتقالة', why: '*o* is a vowel sound, so *an* again.', whyAr: 'صوت علّة فتتكرّر an.' },
      { en: '*an* hour', ar: 'ساعة', why: 'The KEY example: *h* is SILENT, so the word opens on a vowel sound → *an*.', whyAr: 'المثال المفتاح: h صامتة فتبدأ الكلمة بصوت علّة.' }, { en: '*an* idea', ar: 'فكرة', why: '*i* is a vowel sound — abstract nouns take articles too when countable.', whyAr: 'صوت علّة، والأسماء المجرّدة المعدودة تأخذ أداة.' }, { en: '*an* umbrella', ar: 'مظلّة', why: '*u* here sounds like *uh*, not *yoo* — compare with *university* above.', whyAr: 'صوت u هنا يخالف university فتغيّرت الأداة.' },
      { en: '*the* sun', ar: 'الشمس', why: '*the* because there is only ONE — uniqueness always takes *the*.', whyAr: 'the لأنها فريدة، والفريد يأخذ the دائمًا.' }, { en: '*the* moon', ar: 'القمر', why: 'Unique again: no one asks "which moon?".', whyAr: 'فريدة أيضًا فلا يسأل أحد: أي قمر؟' }, { en: '*the* door', ar: 'الباب', why: '*the* because we both know which door — shared knowledge, not uniqueness.', whyAr: 'the لأننا نعرف الباب المقصود — معرفة مشتركة.' },
      { en: '*the* teacher (you know who)', ar: 'المعلّم المعروف', why: 'The bracket says it: *the* means the reader can identify which one.', whyAr: 'the تعني أن القارئ يستطيع تحديد أيّهما.' },
      { en: 'I like apples. (general, no article)', ar: 'أحب التفاح (عام).', why: 'THE Arabic-speaker trap: a general plural takes NO article at all.', whyAr: 'فخّ الناطق بالعربية: الجمع العام بلا أداة إطلاقًا.' },
      { en: 'Open *the* window, please.', ar: 'افتح النافذة من فضلك.', why: '*the* again — there is one particular window we are both looking at.', whyAr: 'the لأن النافذة معيّنة نتشارك معرفتها.' },
      { en: 'She is *a* doctor.', ar: 'هي طبيبة.', why: 'Jobs take *a*: she is one doctor among many, not the only one.', whyAr: 'المهنة تأخذ a لأنها واحدة من كثيرات.' },

      /* now in a sentence — a writing course has to show the rule working */
      { en: 'I bought *a* book yesterday, and *the* book was excellent.', ar: 'اشتريت كتابًا، وكان الكتاب ممتازًا.', why: 'First mention takes *a*; the second takes *the* because the reader now knows it.', whyAr: 'أول ذكر a، والثاني the لأن القارئ صار يعرفه.' },
      { en: '*The* teacher gave us *an* exercise about *the* environment.', ar: 'أعطانا المعلّم تمرينًا عن البيئة.', why: 'Three articles in one sentence, each chosen for a different reason.', whyAr: 'ثلاث أدوات في جملة واحدة لكلٍّ سببها.' },
      { en: '✗ I like *the* coffee. → ✓ I like coffee.', ar: 'الفخّ العربي', why: 'Talking about coffee IN GENERAL takes no article at all.', whyAr: 'الحديث عن القهوة عمومًا بلا أداة.' },
      { en: 'She works as *a* nurse at *the* hospital near my house.', ar: 'تعمل ممرّضة في المستشفى القريب.', why: 'A job takes *a*; a specific building we both know takes *the*.', whyAr: 'المهنة a، والمبنى المعروف the.' },
      { en: '*The* students who arrive late will not enter *the* exam hall.', ar: 'الطلاب المتأخّرون لن يدخلوا القاعة.', why: '*the* twice — both nouns are narrowed to a specific group and place.', whyAr: 'the مرّتين لأن كليهما محدّد.' },
    ],
    exercises: [
      { q: 'a / an / the? “I saw ___ cat. ___ cat was black.”', a: '*a* cat. *The* cat was black.' },
      { q: 'a or an? “___ hour, ___ university, ___ egg”', a: '*an* hour, *a* university, *an* egg' },
      { q: 'Fix: “I am engineer.”', a: 'I am *an* engineer.' },
      { q: 'the or nothing? “I love ___ music.”', a: 'I love music. (no article — general)' },
      { q: 'Fix: “Please close a door.” (the one here)', a: 'Please close *the* door.' },
    ],
    reading: {
      title: 'A New Job', titleAr: 'وظيفة جديدة',
      passage: [
        'Last week I started *a* new job in *an* office downtown.',
        'The building is old, but *the* people are friendly.',
        'I have *a* small desk near *the* window.',
        'Every morning I drink *a* coffee and read *the* news for *an* hour.',
        'I think it will be *a* good year.',
      ],
      questions: [
        { q: 'Where is the office?', a: 'Downtown.' },
        { q: 'Why “an office” and not “a office”?', a: '“office” begins with a *vowel* sound → *an*.' },
        { q: 'Why “the window” and not “a window”?', a: 'It is a *specific*, known window (the one at the desk).' },
      ],
      tip: 'a/an = one, any · the = the specific one we both know.',
      tipAr: 'a/an واحد أيّ · the المحدّد المعروف.',
    },
    homework: [
      { en: 'Write 6 sentences, each using a, an, or the', ar: 'اكتب ٦ جمل، كل واحدة تستعمل a أو an أو the' },
      { en: 'Describe your room with a/an/the (5 things)', ar: 'صِف غرفتك بـ a/an/the (٥ أشياء)' },
      { en: 'Write 3 “an” words (vowel sound)', ar: 'اكتب ٣ كلمات بـ an' },
    ],
    editing: {
      wrong: [
        'I am student at a university.',
        'I have a apple and a egg for breakfast.',
        'Please open a window; it is the one behind you.',
      ],
      correct: [
        'I am *a* student at a university.',
        'I have *an* apple and *an* egg for breakfast.',
        'Please open *the* window; it is the one behind you.',
      ],
    },
  },

  /* ─────────────────────────── 4 · POSSESSIVES ─────────────────────────── */
  {
    no: 8, tag: 'Possessives', tagAr: 'الملكية',
    title: 'Possessive Adjectives — my, your, his, her, its, our, their',
    titleAr: 'صفات الملكية — my / your / his / her / its / our / their',
    objectives: [
      { en: 'Match each possessive to its pronoun', ar: 'مطابقة كل صفة بضميرها' },
      { en: 'Place them before the noun they own', ar: 'وضعها قبل الاسم المملوك' },
      { en: 'Choose his / her / its without error', ar: 'اختيار his / her / its بلا خطأ' },
      { en: 'Not confuse its (owns) with it’s (it is)', ar: 'عدم الخلط بين its و it’s' },
    ],
    rule: {
      en: 'Possessive adjectives show ownership and come *before a noun*: *my, your, his, her, its, our, their*. Choose *his* (male), *her* (female), *its* (thing/animal).',
      ar: 'صفات الملكية تدل على المِلكية وتأتي قبل الاسم: my, your, his, her, its, our, their. اختر his للمذكّر، her للمؤنّث، its لغير العاقل.',
    },
    explain: {
      intro: 'The most common error is choosing his/her by the OWNER’s gender, not the object. Also: “its” never has an apostrophe when it shows ownership.',
      introAr: 'أشهر خطأ هو اختيار his/her حسب جنس المالك. وتذكّر: its لا تحمل فاصلة عليا حين تدل على المِلكية.',
      points: [
        { en: 'I → *my* · you → *your* · we → *our* · they → *their*', ar: 'أنا/أنت/نحن/هم' },
        { en: 'he → *his* (his car) — a male owner', ar: 'هو ← his' },
        { en: 'she → *her* (her car) — a female owner', ar: 'هي ← her' },
        { en: 'it → *its* (its tail) — a thing or animal', ar: 'لغير العاقل ← its' },
        { en: '*its* = owns · *it’s* = it is (different!)', ar: 'its ملكية · it’s = it is' },
      ],
    },
    examples: [
      { en: '*my* book', ar: 'كتابي', why: '*my* belongs to *I* — a possessive adjective replaces the article, never joins it.', whyAr: 'my تخصّ I، وصفة الملكية تحلّ محلّ الأداة ولا تجتمع معها.' }, { en: '*my* friend', ar: 'صديقي', why: 'The form never changes for the thing owned: *my* stays *my*.', whyAr: 'الصيغة لا تتغيّر مهما كان المملوك.' },
      { en: '*your* bag', ar: 'حقيبتك', why: '*your* belongs to *you* — one form for singular and plural alike.', whyAr: 'your تخصّ you، وصيغة واحدة للمفرد والجمع.' }, { en: '*your* idea', ar: 'فكرتك', why: 'Still *your*: possessive adjectives never take *-s*.', whyAr: 'تبقى your؛ صفات الملكية لا تأخذ s.' },
      { en: '*his* car', ar: 'سيارته', why: '*his* belongs to *he* — chosen by the OWNER, not by the object.', whyAr: 'his تخصّ he، والاختيار حسب المالك لا المملوك.' }, { en: '*his* job', ar: 'عمله', why: 'Still *his* even though *job* is a different noun — the owner decides.', whyAr: 'تبقى his لأن المالك هو الذي يقرّر.' },
      { en: '*her* dress', ar: 'فستانها', why: '*her* belongs to *she*. The dress is feminine in Arabic but that is irrelevant here.', whyAr: 'her تخصّ she، وجنس المملوك في العربية لا شأن له هنا.' }, { en: '*her* office', ar: 'مكتبها', why: 'Still *her*: this is THE Arabic-speaker trap — agree with the owner, not the object.', whyAr: 'تبقى her — وهذا فخّ الناطق بالعربية: طابق المالك لا المملوك.' },
      { en: '*its* color', ar: 'لونه', why: '*its* belongs to *it*, used for things and animals — and never takes an apostrophe.', whyAr: 'its تخصّ it للأشياء والحيوان، وبلا فاصلة أبدًا.' }, { en: '*its* name', ar: 'اسمه', why: 'Still *its*. Compare with *it’s*, which always means *it is*.', whyAr: 'تبقى its، وقارنها بـ it’s التي تعني it is.' },
      { en: '*our* house', ar: 'بيتنا', why: '*our* belongs to *we* — one form, however many things are owned.', whyAr: 'our تخصّ we، وصيغة واحدة مهما تعدّد المملوك.' }, { en: '*our* teacher', ar: 'معلّمنا', why: 'Still *our* — singular object, plural owner. The owner wins.', whyAr: 'المملوك مفرد والمالك جمع، والعبرة بالمالك.' },
      { en: '*their* school', ar: 'مدرستهم', why: '*their* belongs to *they*.', whyAr: 'their تخصّ they.' }, { en: '*their* country', ar: 'بلدهم', why: 'Still *their*, and note it is not *there* — three different words.', whyAr: 'تبقى their، ولا تخلطها بـ there.' },
      { en: 'Sara loves *her* job.', ar: 'سارة تحب عملها.', why: 'In a real sentence: *Sara* is *she*, so *her*.', whyAr: 'في جملة حقيقية: سارة = she فتأخذ her.' },
      { en: 'Omar parked *his* car.', ar: 'ركن عمر سيارته.', why: '*Omar* is *he*, so *his* — even though the car could be anything.', whyAr: 'عمر = he فتأخذ his مهما كان المملوك.' },
      { en: 'The dog wags *its* tail.', ar: 'يهز الكلب ذيله.', why: 'The dog is *it*, so *its*. Animals take *its* unless you name them.', whyAr: 'الكلب = it فتأخذ its، والحيوان يأخذها ما لم يُسمَّ.' },
      { en: 'We finished *our* project.', ar: 'أنهينا مشروعنا.', why: '*We* → *our*. Trace the pronoun back and the choice is automatic.', whyAr: 'we ← our؛ تتبّع الضمير يجعل الاختيار تلقائيًا.' },

      /* now in a sentence — a writing course has to show the rule working */
      { en: 'Sara forgot *her* keys, so *her* brother lent her *his*.', ar: 'نسيت سارة مفاتيحها فأعارها أخوها مفاتيحه.', why: '*her* then *his* — the form follows the OWNER, never the object.', whyAr: 'الصيغة تتبع المالك لا المملوك.' },
      { en: '✗ Sara took his book (meaning her own). → ✓ Sara took *her* book.', ar: 'الفخّ العربي', why: 'Arabic agrees with the noun; English agrees with the person who owns it.', whyAr: 'العربية تطابق الاسم والإنجليزية تطابق المالك.' },
      { en: '*Our* company changed *its* name last year.', ar: 'غيّرت شركتنا اسمها العام الماضي.', why: 'A company is *it*, so *its* — and never with an apostrophe.', whyAr: 'الشركة it فتأخذ its بلا فاصلة عليا.' },
      { en: '*Their* children finished *their* homework before dinner.', ar: 'أنهى أطفالهم واجبهم قبل العشاء.', why: 'One form for a plural owner, whatever the thing owned.', whyAr: 'صيغة واحدة للمالك الجمع مهما كان المملوك.' },
    ],
    exercises: [
      { q: 'Fix: “Sara loves his job.” (Sara = female)', a: 'Sara loves *her* job.' },
      { q: 'Fix: “Omar and I cleaned my car.” (we)', a: 'Omar and I cleaned *our* car.' },
      { q: 'his / her / its? “The cat licked ___ paw.”', a: 'The cat licked *its* paw.' },
      { q: 'its or it’s? “___ raining, and the dog lost ___ ball.”', a: '*It’s* raining, and the dog lost *its* ball.' },
      { q: 'Fill: “They sold ___ house.”', a: 'They sold *their* house.' },
    ],
    reading: {
      title: 'The Nadi Family', titleAr: 'عائلة الناضي',
      passage: [
        'The Nadi family is small, but *their* house is full of life.',
        'The father drives *his* old car to work every day.',
        'The mother, Leila, runs *her* own bakery near the market.',
        'Their son does *his* homework while the cat sleeps in *its* basket.',
        'On Sunday, they clean *their* garden together.',
      ],
      questions: [
        { q: 'What does Leila do?', a: 'She runs *her* own bakery.' },
        { q: 'Why “her bakery” and not “his bakery”?', a: 'Leila is *female* → *her*.' },
        { q: 'Where does the cat sleep?', a: 'In *its* basket.' },
        { q: 'What do they do together on Sunday?', a: 'They clean *their* garden.' },
      ],
      tip: 'his/her follow the OWNER’s gender; its is for things and animals.',
      tipAr: 'his/her حسب جنس المالك؛ its لغير العاقل.',
    },
    homework: [
      { en: 'Write 5 sentences about your family using my/his/her/their', ar: 'اكتب ٥ جمل عن عائلتك بـ my/his/her/their' },
      { en: 'Describe 3 things you own with “my”', ar: 'صِف ٣ أشياء تملكها بـ my' },
      { en: 'Write 2 sentences that use both “its” and “it’s” correctly', ar: 'اكتب جملتين تستعملان its و it’s بشكل صحيح' },
    ],
    editing: {
      wrong: [
        'Sara forgot his umbrella at home.',
        'The dog broke it’s leg last week.',
        'Me and my brother sold my bikes.',
      ],
      correct: [
        'Sara forgot *her* umbrella at home.',
        'The dog broke *its* leg last week.',
        'My brother and I sold *our* bikes.',
      ],
    },
  },

  /* ─────────────────────────── 5 · TO BE ─────────────────────────── */
  {
    no: 7, tag: 'To be', tagAr: 'فعل الكينونة',
    title: 'The verb “to be” — am, is, are',
    titleAr: 'فعل الكينونة — am / is / are',
    objectives: [
      { en: 'Match am / is / are to each subject', ar: 'مطابقة am/is/are لكل فاعل' },
      { en: 'Write correct “to be” sentences', ar: 'كتابة جمل صحيحة بفعل الكينونة' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Use short forms in informal writing', ar: 'استخدام الصيغ المختصرة' },
    ],
    rule: {
      en: 'Use *am* with I, *is* with he/she/it (and singular nouns), and *are* with you/we/they (and plural nouns).',
      ar: 'استخدم am مع I، و is مع he/she/it والمفرد، و are مع you/we/they والجمع.',
    },
    explain: {
      intro: 'A written sentence needs a verb. “To be” is the verb that links a subject to a description or a place.',
      introAr: 'الجملة المكتوبة تحتاج فعلًا. وفعل الكينونة يربط الفاعل بوصف أو مكان.',
      points: [
        { en: 'I *am* · he/she/it *is* · you/we/they *are*', ar: 'الأزمنة حسب الفاعل' },
        { en: 'Singular noun → *is*: The book *is* new', ar: 'المفرد ← is' },
        { en: 'Plural noun → *are*: The books *are* new', ar: 'الجمع ← are' },
        { en: 'Negative: add *not* · Question: put be first', ar: 'النفي بـ not · السؤال بالفعل أولًا' },
      ],
    },
    form: {
      affirmative: [
        'I *am* (I’m) a student.',
        'He / She / It *is* (he’s) here.',
        'You / We / They *are* (we’re) ready.',
      ],
      negative: [
        'I *am not* (I’m not) tired.',
        'He *is not* (isn’t) at home.',
        'They *are not* (aren’t) students.',
      ],
      question: [
        '*Am* I late?  ·  *Is* she a doctor?',
        '*Are* you okay?',
        'Short: Yes, I *am*. / No, she *isn’t*. / Yes, they *are*.',
      ],
      note: 'Never drop “be”: say “I *am* happy” — NOT “I happy”. (Arabic has no equivalent verb here, so this is the most common error.)',
      noteAr: 'لا تحذف فعل الكينونة أبدًا: نقول I am happy وليس I happy — فالعربية لا تستخدم فعلًا هنا، لذا هذا أكثر خطأ شيوعًا.',
    },
    examples: [
      { en: 'I *am* a teacher.', ar: 'أنا معلّم.', why: '*I* always takes *am* — it is the only subject that does.', whyAr: 'I تأخذ am وحدها دون سائر الضمائر.' }, { en: 'I*’m* ready.', ar: 'أنا مستعد.', why: 'The contraction is the same verb; only the writing shortens.', whyAr: 'الاختصار هو الفعل نفسه، وإنما قصُرت الكتابة.' },
      { en: 'You *are* right.', ar: 'أنت محق.', why: '*You* takes *are*, whether it means one person or many.', whyAr: 'you تأخذ are للمفرد والجمع معًا.' }, { en: 'He *is* at home.', ar: 'هو في البيت.', why: '*He* is third person singular → *is*.', whyAr: 'he مفرد غائب فيأخذ is.' },
      { en: 'She *is* a doctor.', ar: 'هي طبيبة.', why: '*She* behaves exactly like *he*.', whyAr: 'she مثل he تمامًا.' }, { en: 'It *is* cold today.', ar: 'الجو بارد اليوم.', why: '*It* also takes *is* — used here for weather, a very common job.', whyAr: 'it تأخذ is، وهي هنا للطقس وهو استعمال شائع.' },
      { en: 'We *are* students.', ar: 'نحن طلاب.', why: '*We* is plural, so *are* — the same form as *you* and *they*.', whyAr: 'we جمع فتأخذ are كما you و they.' }, { en: 'They *are* here.', ar: 'هم هنا.', why: '*They* is plural → *are*.', whyAr: 'they جمع فتأخذ are.' },
      { en: 'The book *is* on the table.', ar: 'الكتاب على الطاولة.', why: 'A singular NOUN behaves like *he/she/it* → *is*.', whyAr: 'الاسم المفرد يعامل معاملة he/she/it.' },
      { en: 'The books *are* on the table.', ar: 'الكتب على الطاولة.', why: 'Compare with the line above: plural noun → *are*. Only the *s* changed.', whyAr: 'قارنها بالسابقة: الاسم الجمع يأخذ are، ولم يتغيّر إلا s.' },
      { en: 'My parents *are* teachers.', ar: 'والداي معلّمان.', why: '*parents* is plural, so *are* — the verb follows the noun, not its owner.', whyAr: 'الفعل يتبع الاسم لا صاحبه.' },
      { en: 'I *am not* tired.', ar: 'لست متعبًا.', why: 'Negative: *not* goes AFTER the verb *be*, never before it.', whyAr: 'النفي: not بعد فعل الكينونة لا قبله.' },
      { en: '*Are* you okay?', ar: 'هل أنت بخير؟', why: 'Question: swap the subject and the verb. No *do* is needed with *be*.', whyAr: 'السؤال: قدّم الفعل على الفاعل، ولا حاجة إلى do مع be.' },
      { en: '*Is* she your sister?', ar: 'هل هي أختك؟', why: 'Same swap with *is*. This is why *be* is the easiest verb to question.', whyAr: 'التقديم نفسه مع is، ولهذا كان be أسهل الأفعال في السؤال.' },
    ],
    exercises: [
      { q: 'am/is/are: “The children ___ at school.”', a: 'The children *are* at school.' },
      { q: 'am/is/are: “My sister ___ a nurse.”', a: 'My sister *is* a nurse.' },
      { q: 'Fix: “I is happy.”', a: 'I *am* happy.' },
      { q: 'Fix: “They is my friends.”', a: 'They *are* my friends.' },
      { q: 'Make it a question: “She is a doctor.”', a: '*Is* she a doctor?' },
    ],
    reading: {
      title: 'At the Office', titleAr: 'في المكتب',
      passage: [
        'My name *is* Karim, and I *am* an accountant.',
        'The office *is* on the third floor, and it *is* always busy.',
        'My colleagues *are* kind, and they *are* good at their jobs.',
        'Right now I *am* a little tired, but I *am* happy.',
        '“*Are* you free for lunch?” my friend asks.',
      ],
      questions: [
        { q: 'What is Karim’s job?', a: 'He *is* an accountant.' },
        { q: 'Where is the office?', a: 'On the third floor.' },
        { q: 'Why “they are” and not “they is”?', a: '“they” is plural → *are*.' },
      ],
      tip: 'I am · he/she/it is · you/we/they are · plural nouns are.',
      tipAr: 'I am · he/she/it is · you/we/they are · الجمع are.',
    },
    homework: [
      { en: 'Write 6 sentences, one for each subject with am/is/are', ar: 'اكتب ٦ جمل لكل فاعل مع am/is/are' },
      { en: 'Write 3 questions and 3 negatives', ar: 'اكتب ٣ أسئلة و٣ جمل منفية' },
      { en: 'Introduce yourself in 4 sentences (job, city, age…)', ar: 'عرّف بنفسك في ٤ جمل' },
    ],
    editing: {
      wrong: [
        'My brother are a good driver.',
        'We is students at the same school.',
        'The books is on my desk.',
      ],
      correct: [
        'My brother *is* a good driver.',
        'We *are* students at the same school.',
        'The books *are* on my desk.',
      ],
    },
  },

  /* ─────────────────────────── 10 · PRESENT SIMPLE (A1) ─────────────────────────── */
  {
    no: 10, cefr: 'A1', tag: 'Present Simple', tagAr: 'المضارع البسيط',
    title: 'Present Simple — habits & facts',
    titleAr: 'المضارع البسيط — العادات والحقائق',
    objectives: [
      { en: 'Form the present simple for every person', ar: 'تكوين المضارع البسيط لكل الضمائر' },
      { en: 'Add -s / -es / -ies for he, she, it', ar: 'إضافة -s / -es / -ies مع he/she/it' },
      { en: 'Make negatives with don’t / doesn’t', ar: 'تكوين النفي بـ don’t / doesn’t' },
      { en: 'Ask questions with do / does', ar: 'طرح الأسئلة بـ do / does' },
    ],
    rule: {
      en: 'Use the present simple for *habits*, *routines*, and *facts*. Add *-s* (or -es / -ies) to the verb only with *he / she / it*.',
      ar: 'نستخدم المضارع البسيط للعادات والروتين والحقائق. ونضيف -s (أو -es/-ies) للفعل مع he/she/it فقط.',
    },
    explain: {
      intro: 'This is the tense you use most. The tricky parts are the -s on he/she/it, and using do/does for questions and negatives.',
      introAr: 'هذا أكثر الأزمنة استعمالًا. والصعوبة في -s مع he/she/it، واستخدام do/does للسؤال والنفي.',
      points: [
        { en: 'A *habit*: I drink coffee every morning.', ar: 'عادة' },
        { en: 'A *fact*: Water *boils* at 100°C.', ar: 'حقيقة' },
        { en: 'A *routine / schedule*: The train *leaves* at 8.', ar: 'روتين / جدول' },
        { en: 'Only *he / she / it* adds -s to the verb', ar: 'المفرد الغائب فقط يأخذ -s' },
      ],
    },
    form: {
      affirmative: [
        'I / You / We / They *work*.',
        'He / She / It *works*.',
      ],
      negative: [
        'I / You / We / They *do not (don’t)* work.',
        'He / She / It *does not (doesn’t)* work.',
      ],
      question: [
        '*Do* I / you / we / they work?',
        '*Does* he / she / it work?',
        'Short: Yes, I *do*. / No, he *doesn’t*.',
      ],
      note: 'After *does / doesn’t* the verb loses its -s: “He *doesn’t work*” (NOT works).',
      noteAr: 'بعد does/doesn’t يفقد الفعل حرف -s: نقول He doesn’t work لا works.',
    },
    spelling: [
      { rule: 'Most verbs → add *-s*', ar: 'معظم الأفعال ← -s', examples: 'work → works · play → plays · read → reads' },
      { rule: 'After s, sh, ch, x, o → add *-es*', ar: 'بعد s, sh, ch, x, o ← -es', examples: 'watch → watches · go → goes · wash → washes · fix → fixes' },
      { rule: 'Consonant + y → *-ies*', ar: 'ساكن + y ← -ies', examples: 'study → studies · cry → cries · carry → carries' },
      { rule: 'Vowel + y → just *-s*', ar: 'علّة + y ← -s فقط', examples: 'play → plays · buy → buys · say → says' },
      { rule: 'Irregular: have → *has*', ar: 'شاذّ: have ← has', examples: 'She has a car.' },
    ],
    signals: [
      { en: 'every day / week', ar: 'كل يوم/أسبوع' }, { en: 'usually', ar: 'عادةً' }, { en: 'always', ar: 'دائمًا' },
      { en: 'often', ar: 'غالبًا' }, { en: 'sometimes', ar: 'أحيانًا' }, { en: 'never', ar: 'أبدًا' },
      { en: 'on Mondays', ar: 'أيام الاثنين' }, { en: 'twice a week', ar: 'مرتين أسبوعيًا' },
    ],
    examples: [
      { en: 'I *work* in an office.', ar: 'أعمل في مكتب.', why: '*I* takes the bare verb — no ending at all. This is the base form.', whyAr: 'I تأخذ الفعل مجرّدًا بلا نهاية.' }, { en: 'You *speak* English well.', ar: 'تتحدّث الإنجليزية جيدًا.', why: '*You* also takes the bare verb, singular or plural.', whyAr: 'you كذلك تأخذ المجرّد للمفرد والجمع.' },
      { en: 'We *live* in Rabat.', ar: 'نعيش في الرباط.', why: '*We* takes the bare verb — only ONE person adds anything.', whyAr: 'we تأخذ المجرّد؛ ضمير واحد فقط هو الذي يزيد.' }, { en: 'They *play* football on Sunday.', ar: 'يلعبون الكرة الأحد.', why: '*They* takes the bare verb too.', whyAr: 'they تأخذ المجرّد أيضًا.' },
      { en: 'He *works* at a hospital.', ar: 'يعمل في مستشفى.', why: 'THE rule: *he/she/it* adds *-s*. This is the only change in the whole tense.', whyAr: 'القاعدة: he/she/it تضيف s، وهو التغيير الوحيد في الزمن كلّه.' }, { en: 'She *studies* medicine.', ar: 'تدرس الطب.', why: 'Consonant + *y* → *-ies*, exactly like plural nouns.', whyAr: 'ساكن + y تصير ies تمامًا كجمع الأسماء.' },
      { en: 'It *rains* a lot in winter.', ar: 'تمطر كثيرًا في الشتاء.', why: '*It* is third person too, so *rains* — weather always takes *it*.', whyAr: 'it مفرد غائب فتأخذ s، والطقس يأخذ it دائمًا.' }, { en: 'My father *watches* the news.', ar: 'يشاهد أبي الأخبار.', why: 'After a hissing sound the ending is *-es*, again like plurals.', whyAr: 'بعد الصوت الصفيري تُضاف es كما في الجمع.' },
      { en: 'The shop *opens* at nine.', ar: 'يفتح المتجر التاسعة.', why: '*The shop* = *it*, so it takes *-s*. Nouns follow the same rule.', whyAr: 'المحلّ = it فيأخذ s؛ الأسماء تتبع القاعدة نفسها.' }, { en: 'I *don’t* drink coffee.', ar: 'لا أشرب القهوة.', why: 'Negative uses *don’t* + BARE verb — the *s* moves onto the helper.', whyAr: 'النفي: don’t + مجرّد، وتنتقل s إلى الفعل المساعد.' },
      { en: 'She *doesn’t* eat meat.', ar: 'لا تأكل اللحم.', why: '*doesn’t* already carries the *s*, so *eat* loses it. Never *doesn’t eats*.', whyAr: 'doesn’t تحمل s فيتجرّد الفعل بعدها.' }, { en: '*Do* you speak Arabic?', ar: 'هل تتحدّث العربية؟', why: 'Questions use *Do* + bare verb — no ending on the main verb.', whyAr: 'السؤال: Do + مجرّد بلا نهاية على الفعل الأصلي.' },
      { en: '*Does* he live here?', ar: 'هل يعيش هنا؟', why: '*Does* carries the *s*, so *live* stays bare. Same logic as the negative.', whyAr: 'Does تحمل s فيبقى الفعل مجرّدًا كما في النفي.' }, { en: 'Water *boils* at 100 degrees.', ar: 'يغلي الماء عند ١٠٠ درجة.', why: 'The present simple is also the tense of permanent scientific truth.', whyAr: 'المضارع البسيط هو زمن الحقائق الثابتة أيضًا.' },
      { en: 'Usually I *wake* up at six.', ar: 'عادةً أستيقظ السادسة.', why: 'A frequency word (*usually*) is the clearest signal of this tense.', whyAr: 'ظرف التكرار أوضح علامة على هذا الزمن.' },
    ],
    exercises: [
      { q: 'Add the verb: “She ___ (study) every night.”', a: 'She *studies* every night.' },
      { q: 'Add the verb: “He ___ (go) to work by bus.”', a: 'He *goes* to work by bus.' },
      { q: 'Make negative: “They play tennis.”', a: 'They *don’t* play tennis.' },
      { q: 'Make negative: “She works on Sunday.”', a: 'She *doesn’t* work on Sunday.' },
      { q: 'Make a question: “You like tea.”', a: '*Do* you like tea?' },
      { q: 'Make a question: “He speaks French.”', a: '*Does* he speak French?' },
      { q: 'Fix: “He watch TV every night.”', a: 'He *watches* TV every night.' },
    ],
    reading: {
      title: 'Karim’s Routine', titleAr: 'روتين كريم',
      passage: [
        'Karim is an accountant, and he *works* in a small bank in the city.',
        'On weekdays he *wakes* up at six, *drinks* a black coffee, and *walks* to the office.',
        'He rarely *takes* the bus, because he *likes* the quiet morning streets.',
        'In the evening he usually *studies* English, but he never *works* on Fridays.',
        '“A good routine,” he always *says*, “keeps my mind calm.”',
      ],
      tip: 'A daily routine is the natural home of the present simple — notice the -s on he wakes / drinks / walks.',
      tipAr: 'الروتين اليومي هو الموضع الطبيعي للمضارع البسيط — لاحظ -s في wakes / drinks / walks.',
    },
    homework: [
      { en: 'Write 5 sentences about your daily routine', ar: 'اكتب ٥ جمل عن روتينك اليومي' },
      { en: 'Write 3 negatives (don’t / doesn’t)', ar: 'اكتب ٣ جمل منفية' },
      { en: 'Write 3 questions (Do / Does …?)', ar: 'اكتب ٣ أسئلة' },
    ],
    editing: {
      wrong: [
        'She go to school and study hard.',
        'He don’t likes coffee.',
        'Do she speaks English?',
      ],
      correct: [
        'She *goes* to school and *studies* hard.',
        'He *doesn’t* like coffee.',
        '*Does* she *speak* English?',
      ],
    },
  },

  /* ─────────────────────────── 11 · PRESENT CONTINUOUS (A1) ─────────────────────────── */
  {
    no: 10.2, cefr: 'A1', tag: 'Present Continuous', tagAr: 'المضارع المستمر',
    title: 'Present Continuous — happening now',
    titleAr: 'المضارع المستمر — يحدث الآن',
    objectives: [
      { en: 'Form: am / is / are + verb-ing', ar: 'التكوين: am/is/are + الفعل-ing' },
      { en: 'Spell the -ing form correctly', ar: 'إملاء صيغة -ing بشكل صحيح' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Use it for actions happening now', ar: 'استخدامه للأفعال الآن' },
    ],
    rule: {
      en: 'Use the present continuous for actions *happening now* or *around now*. Form it with *am / is / are* + verb *-ing*.',
      ar: 'نستخدم المضارع المستمر للأفعال التي تحدث الآن أو في هذه الفترة. ويتكوّن من am/is/are + الفعل + ing.',
    },
    explain: {
      intro: 'This tense always has two parts: the correct form of “be” + the -ing verb. Never drop the “be”.',
      introAr: 'لهذا الزمن جزآن دائمًا: صيغة be الصحيحة + الفعل بـ ing. لا تُسقط be أبدًا.',
      points: [
        { en: 'Happening *now*: I *am writing* this sentence.', ar: 'يحدث الآن' },
        { en: '*Temporary*: She *is staying* with us this week.', ar: 'مؤقّت' },
        { en: 'Always two parts: *be* + verb*-ing*', ar: 'جزآن دائمًا' },
        { en: 'Common with *Look!* and *Listen!*', ar: 'يكثر مع Look/Listen' },
      ],
    },
    form: {
      affirmative: [
        'I *am* working.',
        'He / She / It *is* working.',
        'You / We / They *are* working.',
      ],
      negative: [
        'I *am not* working.',
        'He *is not (isn’t)* working.',
        'They *are not (aren’t)* working.',
      ],
      question: [
        '*Am* I working?  ·  *Is* he working?',
        '*Are* you working?',
        'Short: Yes, I *am*. / No, I’m *not*.',
      ],
      note: 'Do NOT use the continuous with state verbs like *know, want, like, need* — say “I want”, not “I am wanting”.',
      noteAr: 'لا نستخدم المستمر مع أفعال الحالة مثل know/want/like/need (نقول I want لا I am wanting).',
    },
    spelling: [
      { rule: 'Most verbs → add *-ing*', ar: 'الأغلب ← -ing', examples: 'play → playing · read → reading' },
      { rule: 'Ends in *-e* → drop the e, add -ing', ar: 'ينتهي بـ e ← احذفها', examples: 'make → making · write → writing · come → coming' },
      { rule: 'Short consonant-vowel-consonant → *double* the last letter', ar: 'مقطع قصير ← ضاعف الأخير', examples: 'run → running · sit → sitting · stop → stopping' },
      { rule: 'Ends in *-ie* → change to y', ar: 'ينتهي بـ ie ← y', examples: 'lie → lying · die → dying' },
    ],
    signals: [
      { en: 'now', ar: 'الآن' }, { en: 'right now', ar: 'حالًا' }, { en: 'at the moment', ar: 'في هذه اللحظة' },
      { en: 'today', ar: 'اليوم' }, { en: 'Look!', ar: 'انظر!' }, { en: 'Listen!', ar: 'استمع!' }, { en: 'this week', ar: 'هذا الأسبوع' },
    ],
    examples: [
      { en: 'I *am reading* a book now.', ar: 'أقرأ كتابًا الآن.', why: '*am* + *-ing* with *I* — the tense always needs BOTH halves.', whyAr: 'am + ing مع I؛ الزمن يحتاج شطريه معًا.' }, { en: 'She *is cooking* dinner.', ar: 'تطبخ العشاء.', why: '*is* + *-ing* for he/she/it. Only the *be* verb changes.', whyAr: 'is + ing للمفرد الغائب؛ لا يتغيّر إلا فعل الكينونة.' },
      { en: 'They *are playing* outside.', ar: 'يلعبون بالخارج.', why: '*are* + *-ing* for plural subjects.', whyAr: 'are + ing مع الجمع.' }, { en: 'We *are studying* for the test.', ar: 'نذاكر للاختبار.', why: 'Still *are* — *we* is plural, so the helper matches the subject.', whyAr: 'we جمع فيطابقها الفعل المساعد.' },
      { en: 'He *is running* to the bus.', ar: 'يركض نحو الحافلة.', why: 'Note the spelling: a short vowel doubles the final consonant — *run* → *running*.', whyAr: 'انتبه للإملاء: العلّة القصيرة تضاعف الحرف الأخير.' }, { en: 'The baby *is sleeping*.', ar: 'ينام الرضيع.', why: '*The baby* = *it* → *is*. The action is happening as we speak.', whyAr: 'الطفل = it فتأخذ is، والفعل يجري الآن.' },
      { en: 'Look! It *is raining*.', ar: 'انظر! إنها تمطر.', why: '*Look!* is a signal word — something is happening at this very moment.', whyAr: 'Look! كلمة دالّة على وقوع الفعل الآن.' }, { en: 'I *am not watching* TV.', ar: 'لا أشاهد التلفاز.', why: 'Negative: *not* goes between *be* and the *-ing* verb.', whyAr: 'النفي: not بين فعل الكينونة والفعل المنتهي بـ ing.' },
      { en: 'She *isn’t working* today.', ar: 'لا تعمل اليوم.', why: 'The contracted negative works the same way.', whyAr: 'النفي المختصر بالطريقة نفسها.' }, { en: '*Are* you listening?', ar: 'هل تستمع؟', why: 'Question: move *be* to the front. The *-ing* never moves.', whyAr: 'السؤال: قدّم فعل الكينونة، ولا تتحرّك ing أبدًا.' },
      { en: '*Is* he coming?', ar: 'هل هو قادم؟', why: 'Same inversion with *is*. Nothing else in the sentence changes.', whyAr: 'التقديم نفسه مع is دون تغيير سواه.' }, { en: 'We *are making* a cake.', ar: 'نُعِدّ كعكة.', why: '*e* is dropped before *-ing*: make → mak*ing*.', whyAr: 'تُحذف e قبل ing.' },
    ],
    exercises: [
      { q: 'Form: “I ___ (write) now.”', a: 'I *am writing* now.' },
      { q: 'Spell the -ing: “run” →', a: '*running*' },
      { q: 'Spell the -ing: “make” →', a: '*making*' },
      { q: 'Make negative: “She is sleeping.”', a: 'She *isn’t* sleeping.' },
      { q: 'Make a question: “They are working.”', a: '*Are* they working?' },
      { q: 'Fix: “He is run to school.”', a: 'He is *running* to school.' },
    ],
    reading: {
      title: 'A Busy Kitchen', titleAr: 'مطبخ مزدحم',
      passage: [
        'It is six o’clock, and the whole family *is getting* ready for dinner.',
        'My mother *is frying* fish, while my sister *is washing* the salad.',
        'I *am setting* the table, but my little brother *isn’t helping* — he *is watching* cartoons.',
        'Something smells wonderful, though I think the rice *is burning* a little!',
        '“*Are* you coming?” my mother calls. “Everything is almost ready.”',
      ],
      tip: 'Use the present continuous for a scene happening right now — be + verb-ing.',
      tipAr: 'المضارع المستمر لمشهدٍ يحدث الآن — be + الفعل-ing.',
    },
    homework: [
      { en: 'Write 4 sentences about what people are doing now', ar: 'اكتب ٤ جمل عمّا يحدث الآن' },
      { en: 'Spell the -ing form of 6 verbs', ar: 'اكتب صيغة -ing لستة أفعال' },
      { en: 'Write 2 negatives and 2 questions', ar: 'اكتب جملتين منفيتين وسؤالين' },
    ],
    editing: {
      wrong: [
        'She cooking dinner right now.',
        'They is playing in the garden.',
        'I am write a letter now.',
      ],
      correct: [
        'She *is cooking* dinner right now.',
        'They *are* playing in the garden.',
        'I am *writing* a letter now.',
      ],
    },
  },

  /* ─────────────────────────── 12 · PAST SIMPLE (A2) ─────────────────────────── */
  {
    no: 10.4, cefr: 'A2', irregulars: 'past', tag: 'Past Simple', tagAr: 'الماضي البسيط',
    title: 'Past Simple — finished actions',
    titleAr: 'الماضي البسيط — أفعال منتهية',
    objectives: [
      { en: 'Add -ed to regular verbs', ar: 'إضافة -ed للأفعال المنتظمة' },
      { en: 'Learn common irregular verbs', ar: 'تعلّم الأفعال الشاذة الشائعة' },
      { en: 'Make negatives with didn’t', ar: 'تكوين النفي بـ didn’t' },
      { en: 'Ask questions with did', ar: 'طرح الأسئلة بـ did' },
    ],
    rule: {
      en: 'Use the past simple for *finished* actions at a *known past time*. Regular verbs add *-ed*; many common verbs are *irregular* (go → went).',
      ar: 'نستخدم الماضي البسيط للأفعال المنتهية في وقت ماضٍ معروف. المنتظمة تأخذ -ed، وكثير من الشائعة شاذّة (go → went).',
    },
    explain: {
      intro: 'The verb is the same for every person (I / he / they worked). The tricky parts are the -ed spelling, the irregular verbs, and using the base verb after did/didn’t.',
      introAr: 'الفعل واحد لكل الضمائر. والصعوبة في إملاء -ed، والأفعال الشاذة، واستخدام الفعل المجرّد بعد did/didn’t.',
      points: [
        { en: 'Regular: add *-ed* → work → worked', ar: 'منتظم: -ed' },
        { en: 'Irregular: the word changes → go → *went*', ar: 'شاذّ: تتغيّر الكلمة' },
        { en: 'Same for *every* person: I / he / we *worked*', ar: 'واحد لكل الضمائر' },
        { en: 'After *did / didn’t* use the *base* verb', ar: 'بعد did/didn’t الفعل المجرّد' },
      ],
    },
    form: {
      affirmative: [
        'I / You / He / She / We / They *worked*. (regular)',
        'I / He / They *went*, *ate*, *saw*. (irregular)',
      ],
      negative: [
        'I / He / They *did not (didn’t)* *work*.',
        '→ base verb: didn’t *go*, didn’t *eat*',
      ],
      question: [
        '*Did* I / you / he / they work?',
        'Short: Yes, I *did*. / No, I *didn’t*.',
      ],
      note: 'After *did / didn’t*, always use the *base* verb: “He *didn’t go*” (NOT didn’t went).',
      noteAr: 'بعد did/didn’t نستخدم الفعل المجرّد دائمًا: He didn’t go لا went.',
    },
    spelling: [
      { rule: 'Most verbs → add *-ed*', ar: 'الأغلب ← -ed', examples: 'work → worked · play → played' },
      { rule: 'Ends in *-e* → add *-d*', ar: 'ينتهي بـ e ← -d', examples: 'live → lived · like → liked' },
      { rule: 'Consonant + y → *-ied*', ar: 'ساكن + y ← -ied', examples: 'study → studied · cry → cried' },
      { rule: 'Short consonant-vowel-consonant → *double* it', ar: 'مقطع قصير ← ضاعف', examples: 'stop → stopped · plan → planned' },
    ],
    signals: [
      { en: 'yesterday', ar: 'أمس' }, { en: 'last week / year', ar: 'الأسبوع/العام الماضي' }, { en: '… ago', ar: 'منذ' },
      { en: 'in 2010', ar: 'في ٢٠١٠' }, { en: 'when I was young', ar: 'حين كنت صغيرًا' }, { en: 'this morning', ar: 'هذا الصباح' },
    ],
    examples: [
      { en: 'I *worked* late yesterday.', ar: 'عملت متأخرًا أمس.', why: 'Regular verbs simply add *-ed* — this covers most verbs in English.', whyAr: 'الأفعال المنتظمة تضيف ed، وهي أغلب أفعال الإنجليزية.' }, { en: 'She *watched* a film last night.', ar: 'شاهدت فيلمًا ليلة أمس.', why: 'Same *-ed*, and note the past never changes with the subject.', whyAr: 'ed نفسها، والماضي لا يتغيّر بتغيّر الفاعل.' },
      { en: 'We *studied* for the exam.', ar: 'ذاكرنا للامتحان.', why: 'Consonant + *y* → *-ied*, the same spelling family as plurals.', whyAr: 'ساكن + y تصير ied من عائلة الإملاء نفسها.' }, { en: 'They *stopped* at the café.', ar: 'توقّفوا في المقهى.', why: 'A short vowel doubles the final consonant before *-ed*.', whyAr: 'العلّة القصيرة تضاعف الحرف الأخير قبل ed.' },
      { en: 'He *went* to Rabat last week.', ar: 'ذهب إلى الرباط.', why: 'Irregular: *go* becomes a completely different word. No rule predicts it.', whyAr: 'الشاذّ: go تصير كلمة أخرى ولا قاعدة تتنبّأ بها.' }, { en: 'I *ate* fish for lunch.', ar: 'أكلت السمك غداءً.', why: 'Irregular again — these must simply be learned as pairs.', whyAr: 'شاذّ أيضًا، وتُحفظ أزواجًا.' },
      { en: 'She *saw* an old friend.', ar: 'رأت صديقة قديمة.', why: '*see* → *saw*: the vowel changes rather than an ending being added.', whyAr: 'see تصير saw بتغيّر العلّة لا بزيادة نهاية.' }, { en: 'We *bought* a new car.', ar: 'اشترينا سيارة جديدة.', why: '*buy* → *bought*: a whole new spelling and sound.', whyAr: 'buy تصير bought بإملاء ونطق جديدين.' },
      { en: 'Irregular: go→*went* · eat→*ate* · see→*saw* · buy→*bought* · have→*had*', ar: 'أفعال شاذة', why: 'The five most common irregulars, worth memorising as a block.', whyAr: 'أشهر خمسة أفعال شاذّة، وتُحفظ ككتلة واحدة.' },
      { en: 'I *didn’t* sleep well.', ar: 'لم أنم جيدًا.', why: 'Negative: *didn’t* carries the past, so the main verb returns to BARE form.', whyAr: 'النفي: didn’t تحمل الماضي فيعود الفعل مجرّدًا.' }, { en: 'He *didn’t* come to class.', ar: 'لم يحضر الدرس.', why: 'Never *didn’t came* — the past is already inside *didn’t*.', whyAr: 'لا نقول didn’t came لأن الماضي داخل didn’t.' },
      { en: '*Did* you enjoy the trip?', ar: 'هل استمتعت بالرحلة؟', why: 'Question: *Did* + bare verb. The same principle as the negative.', whyAr: 'السؤال: Did + مجرّد، بالمبدأ نفسه.' }, { en: '*Did* she call you?', ar: 'هل اتصلت بك؟', why: '*Did* holds the tense, so *call* stays bare even for *she*.', whyAr: 'Did تحمل الزمن فيبقى الفعل مجرّدًا حتى مع she.' },
    ],
    exercises: [
      { q: 'Past: “She ___ (study) all night.”', a: 'She *studied* all night.' },
      { q: 'Past: “We ___ (go) to the beach.”', a: 'We *went* to the beach.' },
      { q: 'Make negative: “He came early.”', a: 'He *didn’t* come early.' },
      { q: 'Make a question: “They visited Fes.”', a: '*Did* they visit Fes?' },
      { q: 'Fix: “I didn’t went home.”', a: 'I didn’t *go* home.' },
      { q: 'Spell the past: “stop” →', a: '*stopped*' },
    ],
    reading: {
      title: 'A Trip to the Sea', titleAr: 'رحلة إلى البحر',
      passage: [
        'Last summer my family *went* to a small town on the coast.',
        'We *stayed* in an old hotel, *swam* every morning, and *ate* fresh fish for lunch.',
        'One afternoon I *lost* my phone on the beach, but a kind man *found* it and *gave* it back.',
        'We *didn’t* want the holiday to end, yet the last day *came* too soon.',
        'It *was* the best week of the whole year.',
      ],
      tip: 'A story is naturally past simple — mix regular (stayed) with irregular (went, swam, ate, lost, found).',
      tipAr: 'القصة تُروى بالماضي البسيط — امزج المنتظم (stayed) والشاذّ (went, swam, ate, lost).',
    },
    homework: [
      { en: 'Write 5 sentences about last weekend (past)', ar: 'اكتب ٥ جمل عن الأسبوع الماضي' },
      { en: 'Write 3 negatives with didn’t', ar: 'اكتب ٣ جمل بـ didn’t' },
      { en: 'List the past of 8 irregular verbs', ar: 'اكتب ماضي ٨ أفعال شاذة' },
    ],
    editing: {
      wrong: [
        'Yesterday she go to the market and buy bread.',
        'We didn’t went to school last Monday.',
        'Did you saw the film?',
      ],
      correct: [
        'Yesterday she *went* to the market and *bought* bread.',
        'We didn’t *go* to school last Monday.',
        'Did you *see* the film?',
      ],
    },
  },

  /* ─────────────────────────── 13 · FUTURE (A2) ─────────────────────────── */
  {
    no: 10.6, cefr: 'A2', tag: 'Future', tagAr: 'المستقبل',
    title: 'The Future — will & going to',
    titleAr: 'المستقبل — will و going to',
    objectives: [
      { en: 'Form the future with will + base verb', ar: 'التكوين بـ will + الفعل المجرّد' },
      { en: 'Form the future with be going to', ar: 'التكوين بـ be going to' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Choose will vs going to', ar: 'الاختيار بين will و going to' },
    ],
    rule: {
      en: 'Two common ways to talk about the future: *will* + base verb (a decision, prediction, or promise) and *be going to* + base verb (a plan or intention).',
      ar: 'طريقتان شائعتان للمستقبل: will + الفعل المجرّد (قرار/توقّع/وعد)، و be going to + الفعل المجرّد (خطة/نية).',
    },
    explain: {
      intro: 'Use “will” for something you decide now or predict; use “going to” for a plan you already have.',
      introAr: 'استخدم will لما تقرّره الآن أو تتوقّعه، و going to لخطة لديك بالفعل.',
      points: [
        { en: '*will* = instant decision / prediction / promise', ar: 'قرار فوري / توقّع / وعد' },
        { en: '*going to* = a plan or intention', ar: 'خطة أو نية' },
        { en: 'Both take the *base* verb after them', ar: 'يتبعهما الفعل المجرّد' },
        { en: '*won’t* = will not', ar: 'won’t = will not' },
      ],
    },
    form: {
      affirmative: [
        'I / You / He / We / They *will* work. (’ll)',
        'I *am going to* work. / He *is going to* work. / They *are going to* work.',
      ],
      negative: [
        'I *will not (won’t)* work.',
        'I *am not going to* work.',
      ],
      question: [
        '*Will* you work? — Yes, I *will*. / No, I *won’t*.',
        '*Are* you *going to* work?',
      ],
      note: 'After *will* and *going to*, use the *base* verb (will *go*, going to *go* — never “will goes / will went”).',
      noteAr: 'بعد will و going to نستخدم الفعل المجرّد (will go لا will goes/went).',
    },
    signals: [
      { en: 'tomorrow', ar: 'غدًا' }, { en: 'next week / year', ar: 'الأسبوع/العام القادم' }, { en: 'soon', ar: 'قريبًا' },
      { en: 'tonight', ar: 'الليلة' }, { en: 'later', ar: 'لاحقًا' }, { en: 'in the future', ar: 'في المستقبل' },
    ],
    examples: [
      { en: 'I *will call* you tomorrow.', ar: 'سأتصل بك غدًا.', why: '*will* for a decision or promise — nothing was planned before this moment.', whyAr: 'will للقرار أو الوعد؛ لا تخطيط سابق.' }, { en: 'She *will help* you.', ar: 'ستساعدك.', why: '*will* + BARE verb, and it never changes with the subject.', whyAr: 'will + مجرّد، ولا تتغيّر بتغيّر الفاعل.' },
      { en: 'It *will rain* tonight.', ar: 'ستمطر الليلة.', why: '*will* for a prediction based on opinion rather than evidence.', whyAr: 'will للتنبّؤ المبني على الرأي لا على دليل.' }, { en: 'I think they *will win*.', ar: 'أظن أنهم سيفوزون.', why: '*I think* + *will* is the standard shape for an opinion about the future.', whyAr: 'I think مع will هي الصيغة المعتادة للرأي في المستقبل.' },
      { en: 'I *’ll* have the soup, please.', ar: 'سآخذ الشوربة من فضلك.', why: '*’ll* for an instant decision made as you speak — ordering food is the classic case.', whyAr: '’ll لقرار لحظي أثناء الكلام، وطلب الطعام أشهر مثال.' }, { en: 'We *are going to* travel this summer.', ar: 'سنسافر هذا الصيف.', why: '*going to* for a PLAN — the decision was already made before now.', whyAr: 'going to للخطة؛ القرار اتُّخذ قبل الآن.' },
      { en: 'He *is going to* study medicine.', ar: 'سيدرس الطب.', why: '*going to* again: intention, decided in advance.', whyAr: 'going to للنيّة المقرّرة سلفًا.' }, { en: 'They *are going to* buy a house.', ar: 'سيشترون بيتًا.', why: 'The plan exists already, which is why *will* would sound wrong here.', whyAr: 'الخطة موجودة، ولهذا تبدو will خاطئة هنا.' },
      { en: 'I *won’t* forget your birthday.', ar: 'لن أنسى عيد ميلادك.', why: 'Negative of *will* is *won’t* — an irregular contraction worth memorising.', whyAr: 'نفي will هو won’t، وهو اختصار شاذّ يُحفظ.' }, { en: 'She *won’t* be late.', ar: 'لن تتأخّر.', why: '*won’t* also carries refusal or strong assurance, not just the future.', whyAr: 'won’t تحمل الرفض أو التأكيد لا مجرّد المستقبل.' },
      { en: '*Will* you come to the party?', ar: 'هل ستأتي إلى الحفل؟', why: 'Question: *Will* moves to the front, verb stays bare.', whyAr: 'السؤال بتقديم Will والفعل مجرّد.' }, { en: '*Are* you *going to* call him?', ar: 'هل ستتصل به؟', why: 'With *going to*, it is *be* that moves — *Are you going to…*.', whyAr: 'مع going to يتقدّم فعل الكينونة.' },
    ],
    exercises: [
      { q: 'will: “I ___ (help) you tomorrow.”', a: 'I *will help* you tomorrow.' },
      { q: 'going to: “We ___ (visit) Fes next week.”', a: 'We *are going to visit* Fes next week.' },
      { q: 'Make negative (won’t): “He will come.”', a: 'He *won’t* come.' },
      { q: 'Make a question: “They will travel.”', a: '*Will* they travel?' },
      { q: 'Fix: “I will to call you.”', a: 'I *will call* you.' },
      { q: 'Fix: “She is going to studies.”', a: 'She is going to *study*.' },
    ],
    reading: {
      title: 'My Plans for Summer', titleAr: 'خططي للصيف',
      passage: [
        'The exams finish next week, and I already have a plan for the holiday.',
        'First, I *am going to* visit my cousins in Marrakech, and we *are going to* explore the old city together.',
        'I *will* probably take hundreds of photos — I always do!',
        'My brother *won’t* join us, because he *is going to* start his first job.',
        '“Don’t worry,” he says, “I *will* visit you next time.”',
      ],
      tip: 'going to = a plan you already have · will = a decision or a promise made now.',
      tipAr: 'going to خطة لديك بالفعل · will قرار أو وعد الآن.',
    },
    homework: [
      { en: 'Write 3 plans with “going to”', ar: 'اكتب ٣ خطط بـ going to' },
      { en: 'Write 3 predictions with “will”', ar: 'اكتب ٣ توقّعات بـ will' },
      { en: 'Write 2 negatives (won’t) and 2 questions', ar: 'اكتب نفيين وسؤالين' },
    ],
    editing: {
      wrong: [
        'I will to visit my aunt next week.',
        'She is going to studies English.',
        'Will they comes tomorrow?',
      ],
      correct: [
        'I *will visit* my aunt next week.',
        'She is going to *study* English.',
        'Will they *come* tomorrow?',
      ],
    },
  },

  /* ─────────────────────────── 14 · PRESENT PERFECT (B1) ─────────────────────────── */
  {
    no: 10.8, cefr: 'B1', irregulars: 'pp', tag: 'Present Perfect', tagAr: 'المضارع التام',
    title: 'Present Perfect — past linked to now',
    titleAr: 'المضارع التام — ماضٍ متّصل بالحاضر',
    objectives: [
      { en: 'Form: have / has + past participle', ar: 'التكوين: have/has + التصريف الثالث' },
      { en: 'Learn past participles (V3)', ar: 'تعلّم التصريف الثالث' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Use for experience & unfinished time', ar: 'للتجربة والزمن غير المنتهي' },
    ],
    rule: {
      en: 'Use the present perfect for a past action *connected to now* (a result, an experience, an unfinished time). Form: *have / has* + the *past participle* (V3).',
      ar: 'نستخدم المضارع التام لفعل ماضٍ متّصل بالحاضر (نتيجة، تجربة، زمن غير منتهٍ). التكوين: have/has + التصريف الثالث.',
    },
    explain: {
      intro: 'The present perfect links the past to now — you do not give the exact time. Use “has” with he/she/it and “have” with the rest.',
      introAr: 'المضارع التام يربط الماضي بالآن دون ذكر الوقت المحدّد. نستخدم has مع he/she/it و have مع الباقي.',
      points: [
        { en: '*Experience*: I *have visited* Spain. (in my life)', ar: 'تجربة' },
        { en: '*Result now*: She *has lost* her keys. (still lost)', ar: 'نتيجة حاضرة' },
        { en: '*Unfinished time*: I *have worked* hard *this week*.', ar: 'زمن غير منتهٍ' },
        { en: 'With *just, already, yet, ever, never, since, for*', ar: 'كلمات دالة' },
      ],
    },
    form: {
      affirmative: [
        'I / You / We / They *have* worked. (’ve)',
        'He / She / It *has* worked. (’s)',
      ],
      negative: [
        'I *have not (haven’t)* worked.',
        'He *has not (hasn’t)* worked.',
      ],
      question: [
        '*Have* you worked? — Yes, I *have*. / No, I *haven’t*.',
        '*Has* he finished? — Yes, he *has*. / No, he *hasn’t*.',
      ],
      note: 'Use the *past participle* (V3): worked, *gone*, *eaten*, *seen*, *done*, *written*. Do NOT use the past simple after have/has.',
      noteAr: 'نستخدم التصريف الثالث (V3): gone, eaten, seen… ولا نستخدم الماضي البسيط بعد have/has.',
    },
    spelling: [
      { rule: 'Regular past participle = *-ed* (like the past)', ar: 'التصريف الثالث المنتظم = -ed', examples: 'work → worked · play → played' },
      { rule: 'Irregular past participles must be learned', ar: 'الشاذة تُحفظ', examples: 'go → gone · eat → eaten · see → seen · do → done · write → written · be → been' },
    ],
    signals: [
      { en: 'ever', ar: 'من قبل (في السؤال)' }, { en: 'never', ar: 'أبدًا' }, { en: 'already', ar: 'بالفعل' }, { en: 'yet', ar: 'بعد' },
      { en: 'just', ar: 'للتوّ' }, { en: 'since', ar: 'منذ (نقطة)' }, { en: 'for', ar: 'لمدّة' }, { en: 'recently', ar: 'مؤخّرًا' },
    ],
    examples: [
      { en: 'I *have visited* Spain twice.', ar: 'زرت إسبانيا مرتين.', why: '*have* + V3 — the action is finished but the TIME is not stated. That is the whole tense.', whyAr: 'have + التصريف الثالث: الفعل انتهى والزمن غير محدّد، وهذا جوهر الزمن.' }, { en: 'She *has finished* her homework.', ar: 'أنهت واجبها.', why: '*he/she/it* takes *has*. Only the helper changes; the V3 never does.', whyAr: 'he/she/it تأخذ has، ولا يتغيّر إلا المساعد.' },
      { en: 'We *have lived* here since 2015.', ar: 'نعيش هنا منذ ٢٠١٥.', why: '*since* + a POINT in time — it started in 2015 and is still true.', whyAr: 'since + نقطة زمنية؛ بدأ في ٢٠١٥ وما زال.' }, { en: 'They *have known* each other for years.', ar: 'يعرفان بعضهما منذ سنوات.', why: '*for* + a LENGTH of time. Compare with *since* above — this pair is always tested.', whyAr: 'for + مدّة، وقارنها بـ since؛ يُختبر هذا الزوج دائمًا.' },
      { en: 'He *has just* arrived.', ar: 'وصل للتوّ.', why: '*just* = a very short time ago. It sits between the helper and the V3.', whyAr: 'just تعني قبل قليل، وموضعها بين المساعد والتصريف الثالث.' }, { en: 'I *have already* eaten.', ar: 'أكلت بالفعل.', why: '*already* = sooner than expected, and it takes the same middle position.', whyAr: 'already تعني أبكر من المتوقّع، وموضعها نفسه.' },
      { en: 'Have you finished *yet*?', ar: 'هل أنهيت بعد؟', why: '*yet* goes at the END, and only in questions and negatives.', whyAr: 'yet في آخر الجملة، وفي السؤال والنفي فقط.' }, { en: '*Have* you *ever* been to Paris?', ar: 'هل زرت باريس من قبل؟', why: '*ever* asks about your whole life up to now — the classic experience question.', whyAr: 'ever تسأل عن حياتك كلها حتى الآن.' },
      { en: 'I *have never* seen snow.', ar: 'لم أرَ الثلج قط.', why: '*never* already makes it negative, so *haven’t never* would be wrong.', whyAr: 'never تنفي بذاتها فلا تُجمع مع haven’t.' }, { en: 'She *hasn’t* called me.', ar: 'لم تتصل بي.', why: 'Negative: *hasn’t* + V3. The main verb never takes the past form here.', whyAr: 'النفي: hasn’t + التصريف الثالث، ولا يأتي الفعل بصيغة الماضي.' },
      { en: '*Has* he *gone* home?', ar: 'هل ذهب إلى البيت؟', why: 'Question: the helper moves to the front, V3 stays put.', whyAr: 'السؤال بتقديم المساعد ويبقى التصريف الثالث مكانه.' }, { en: 'We *have eaten* already.', ar: 'أكلنا بالفعل.', why: '*already* can also close the sentence in everyday writing.', whyAr: 'already قد تأتي في آخر الجملة في الكتابة اليومية.' },
    ],
    exercises: [
      { q: 'Form: “I ___ (finish) my work.”', a: 'I *have finished* my work.' },
      { q: 'have/has: “She ___ gone home.”', a: 'She *has* gone home.' },
      { q: 'Participle: “He has ___ (eat) lunch.”', a: 'He has *eaten* lunch.' },
      { q: 'Make negative: “They have arrived.”', a: 'They *haven’t* arrived.' },
      { q: 'Make a question: “You have seen it.”', a: '*Have* you seen it?' },
      { q: 'Fix: “I have went to the market.”', a: 'I have *gone* to the market.' },
    ],
    reading: {
      title: 'A New City', titleAr: 'مدينة جديدة',
      passage: [
        'I *moved* to this city three years ago, and I love it more every day.',
        'Since then, I *have made* good friends and *have learned* a lot about its history.',
        'I *have never* felt lonely here, because the people are so friendly.',
        'My sister arrived last month, but she *hasn’t* found a job *yet*.',
        'Life is not always easy — still, it *has been* a wonderful chapter, and I *have* grown as a person.',
      ],
      tip: 'Present perfect links the past to now (have made, have learned); use the past simple for a finished time (moved, arrived).',
      tipAr: 'المضارع التام يربط الماضي بالآن (have made)؛ والماضي البسيط لزمنٍ منتهٍ محدّد (moved, arrived).',
    },
    homework: [
      { en: 'Write 3 experiences with have/has + ever/never', ar: 'اكتب ٣ تجارب بـ ever/never' },
      { en: 'Write 2 sentences with since and for', ar: 'اكتب جملتين بـ since و for' },
      { en: 'List the past participle (V3) of 8 verbs', ar: 'اكتب التصريف الثالث لـ ٨ أفعال' },
    ],
    editing: {
      wrong: [
        'I have saw that film before.',
        'She have finished her work.',
        'Have you ate lunch yet?',
      ],
      correct: [
        'I have *seen* that film before.',
        'She *has* finished her work.',
        'Have you *eaten* lunch yet?',
      ],
    },
  },

  /* ─────────────────────────── 7 · FANBOYS ─────────────────────────── */
  {
    no: 14, tag: 'FANBOYS', tagAr: 'أدوات العطف',
    title: 'Coordinating Conjunctions — FANBOYS',
    titleAr: 'أدوات العطف — FANBOYS',
    objectives: [
      { en: 'Name the 7 FANBOYS conjunctions', ar: 'تسمية أدوات العطف السبع' },
      { en: 'Join two equal ideas into one sentence', ar: 'ربط فكرتين متساويتين' },
      { en: 'Put a comma before the conjunction', ar: 'وضع فاصلة قبل الأداة' },
      { en: 'Pick the conjunction that fits the meaning', ar: 'اختيار الأداة المناسبة' },
    ],
    rule: {
      en: 'FANBOYS join two equal ideas: *For, And, Nor, But, Or, Yet, So*. When both sides are complete sentences, put a *comma* before the conjunction.',
      ar: 'أدوات FANBOYS تربط فكرتين متساويتين. وحين يكون الطرفان جملتين كاملتين نضع فاصلة قبل الأداة.',
    },
    explain: {
      intro: 'Arabic can carry a whole paragraph on one *wa* (و). English cannot: each of the seven joining words has its own meaning, and choosing the wrong one quietly changes what your sentence says. Choose on purpose — never use “and” for everything.',
      introAr: 'العربية تحمل فقرة كاملة على واو واحدة، والإنجليزية لا تفعل: لكل أداة من السبع معنى خاص، واختيار الخطأ يغيّر معنى جملتك دون أن تشعر. اختر بوعي، ولا تستعمل and لكل شيء.',
      points: [
        { en: '*F*or = reason (= because, but formal/literary) · *A*nd = add', ar: 'for = سبب (رسمية) · and = إضافة' },
        { en: '*N*or = a second negative · *B*ut = contrast · *O*r = choice', ar: 'nor = نفي ثانٍ · but = تضاد · or = اختيار' },
        { en: '*Y*et = contrast with surprise (“tired, *yet* happy”) · *S*o = result', ar: 'yet = تضاد مع مفاجأة · so = نتيجة' },
        { en: '*so* = result, *for* = reason — they point in *opposite* directions', ar: 'so نتيجة و for سبب — اتجاهان متعاكسان' },
        { en: 'Comma before FANBOYS *only* when both sides are full sentences', ar: 'الفاصلة قبل الأداة فقط إذا كان الطرفان جملتين كاملتين' },
        { en: 'Two words, one side: “I like tea *and* coffee” — *no* comma', ar: 'إن كان أحد الطرفين كلمة لا جملة فلا فاصلة' },
      ],
    },
    examples: [
      { en: 'I like tea *and* coffee.', ar: 'أحب الشاي والقهوة.', why: '*and* adds. No comma, because *coffee* is one word, not a sentence.', whyAr: 'and تضيف، وبلا فاصلة لأن الطرف الثاني كلمة لا جملة.' },
      { en: 'I studied hard*,* *and* I passed.', ar: 'ذاكرت بجد، ونجحت.', why: 'Now BOTH sides are complete sentences → the comma is required.', whyAr: 'الطرفان جملتان كاملتان فوجبت الفاصلة.' },
      { en: 'It is sunny *but* cold.', ar: 'الجو مشمس لكنه بارد.', why: '*but* contrasts. Two adjectives only, so again no comma.', whyAr: 'but للتضاد، وطرفاها صفتان فلا فاصلة.' },
      { en: 'I was tired*,* *but* I finished.', ar: 'كنت متعبًا، لكنني أنهيت.', why: 'Two full sentences with *but* → comma. The test never changes.', whyAr: 'جملتان كاملتان مع but فالفاصلة، والاختبار ثابت.' },
      { en: 'Hurry*,* *or* we will be late.', ar: 'أسرع، وإلّا سنتأخّر.', why: '*or* offers a choice — and warns of the alternative.', whyAr: 'or تعرض خيارًا وتحذّر من البديل.' },
      { en: 'It rained*,* *so* we stayed home.', ar: 'أمطرت، لذلك بقينا في البيت.', why: '*so* gives the RESULT: the rain came first, staying home followed.', whyAr: 'so تعطي النتيجة؛ المطر أولًا ثم البقاء.' },
      { en: 'I stayed home*,* *for* I was sick.', ar: 'بقيت في البيت، لأنني كنت مريضًا.', why: '*for* gives the REASON — it points backwards, the opposite of *so*.', whyAr: 'for تعطي السبب وتنظر إلى الوراء، عكس so.' },
      { en: 'She is small*,* *yet* strong.', ar: 'هي صغيرة، ومع ذلك قوية.', why: '*yet* is contrast with surprise — stronger than a plain *but*.', whyAr: 'yet تضادّ مع مفاجأة، وهي أقوى من but.' },
      { en: 'He neither called*,* *nor* did he write.', ar: 'لم يتّصل ولم يكتب.', why: '*nor* continues a NEGATIVE, and it inverts the word order after it.', whyAr: 'nor تُتابع النفي وتقلب الترتيب بعدها.' },
      { en: 'We can walk*,* *or* we can drive.', ar: 'نمشي أو نقود.', why: '*or* again, this time between two complete sentences → comma.', whyAr: 'or بين جملتين كاملتين فالفاصلة.' },
    ],
    exercises: [
      { q: 'Choose + comma: “I was hungry ___ I ate.” (result)', a: 'I was hungry*,* *so* I ate.' },
      { q: 'Choose: “She tried ___ she failed.” (contrast)', a: 'She tried*,* *but* she failed.' },
      { q: 'Add the comma: “It was late so we left.”', a: 'It was late*,* so we left.' },
      { q: 'Which fits: “Study hard ___ you will pass.”', a: 'Study hard*,* *or* you will pass. (choice/warning)' },
      { q: 'No comma needed? “I like cats and dogs.”', a: 'Correct — no comma (not two full sentences).' },
    ],
    reading: {
      title: 'A Change of Plans', titleAr: 'تغيير في الخطط',
      passage: [
        'We wanted to visit the beach*,* *but* the weather was bad.',
        'It was cold and windy*,* *so* we changed our plans.',
        'We could stay home*,* *or* we could go to the museum.',
        'I love art*,* *so* the choice was easy for me.',
        'The museum was quiet*,* *yet* every room was full of color.',
      ],
      questions: [
        { q: 'Why did they change their plans?', a: 'The weather was bad (cold and windy).' },
        { q: 'What were the two choices?', a: 'Stay home *or* go to the museum.' },
        { q: 'Find one “so” and explain it.', a: 'It shows a *result* (e.g., “I love art, so the choice was easy”).' },
      ],
      tip: 'The comma sits BEFORE and / but / so when two full ideas meet.',
      tipAr: 'الفاصلة قبل and/but/so حين تلتقي فكرتان كاملتان.',
    },
    homework: [
      { en: 'Join 5 pairs of sentences with different FANBOYS', ar: 'اربط ٥ أزواج بأدوات مختلفة' },
      { en: 'Write 2 sentences with “but” and 2 with “so”', ar: 'اكتب جملتين بـ but وجملتين بـ so' },
      { en: 'Write a 3-sentence story using and, but, so', ar: 'اكتب قصة من ٣ جمل بـ and/but/so' },
    ],
    editing: {
      wrong: [
        'I wanted to sleep but I had work to do.',
        'It was raining so we took the bus.',
        'You can call me or you can send a message.',
      ],
      correct: [
        'I wanted to sleep*,* but I had work to do.',
        'It was raining*,* so we took the bus.',
        'You can call me*,* or you can send a message.',
      ],
    },
  },

  /* ─────────────────────────── 8 · SENTENCE TYPES ─────────────────────────── */
  {
    no: 13, tag: 'Sentence types', tagAr: 'أنواع الجمل',
    title: 'The Four Sentence Types',
    titleAr: 'أنواع الجمل الأربعة',
    objectives: [
      { en: 'Recognize the 4 sentence types', ar: 'التعرّف على الأنواع الأربعة' },
      { en: 'Define simple, compound, complex', ar: 'تعريف البسيطة والمركّبة والمعقّدة' },
      { en: 'Identify the type of a given sentence', ar: 'تحديد نوع الجملة المعطاة' },
      { en: 'Mix types for interesting writing', ar: 'مزج الأنواع لكتابة ممتعة' },
    ],
    rule: {
      en: '*Simple* = one idea. *Compound* = two equal ideas + comma + FANBOYS. *Complex* = one main + one dependent idea. *Compound-Complex* = a mix of both.',
      ar: 'بسيطة: فكرة واحدة. مركّبة: فكرتان متساويتان + فاصلة + أداة. معقّدة: رئيسية + تابعة. مركّبة معقّدة: مزيج.',
    },
    explain: {
      intro: 'Every sentence you will ever write in English is one of four shapes. Count the *clauses* — a clause is a subject + its verb — and you know instantly which shape you have built, and whether it needs a comma.',
      introAr: 'كل جملة ستكتبها في الإنجليزية هي واحدة من أربعة أشكال. عُدّ الجُمَل الصغيرة (فاعل + فعل) لتعرف فورًا أي شكل بنيت، وهل يحتاج فاصلة.',
      points: [
        { en: '*Simple* = ONE clause: I study English.', ar: 'بسيطة = جملة واحدة' },
        { en: '*Compound* = two EQUAL clauses joined by FANBOYS: I study*,* and I practice.', ar: 'مركّبة = جملتان متساويتان بأداة عطف' },
        { en: '*Complex* = one main + one dependent clause: *Because* I study, I improve.', ar: 'معقّدة = رئيسية + تابعة' },
        { en: '*Compound-Complex* = dependent + two main: *When* I study, I learn*,* and I grow.', ar: 'مركّبة معقّدة = تابعة + رئيسيتان' },
        { en: 'A *dependent* clause cannot stand alone: “Because I study.” ✗ is a fragment', ar: 'الجملة التابعة لا تقف وحدها — تصبح ناقصة' },
        { en: 'Test any sentence: how many subject+verb pairs, and is each one independent?', ar: 'اختبر أي جملة: كم فاعلًا وفعلًا، وهل كلٌّ منها مستقل؟' },
      ],
    },
    examples: [
      { en: 'I study English.', ar: 'أدرس الإنجليزية. (بسيطة)', why: 'SIMPLE: one subject-verb pair, standing alone.', whyAr: 'بسيطة: فاعل وفعل واحد يقف وحده.' },
      { en: 'The sun is bright.', ar: 'الشمس ساطعة. (بسيطة)', why: 'Still simple — *be* is a verb like any other.', whyAr: 'بسيطة أيضًا؛ فعل الكينونة كغيره.' },
      { en: 'I study*,* *and* I practice.', ar: 'أدرس وأتمرّن. (مركّبة)', why: 'COMPOUND: two complete sentences joined by comma + FANBOYS. Both could stand alone.', whyAr: 'مركّبة: جملتان كاملتان بفاصلة وأداة عطف، وكلٌّ تقف وحدها.' },
      { en: 'He was tired*,* *but* he finished.', ar: 'كان متعبًا لكنه أنهى. (مركّبة)', why: 'Compound again — the test is that each side survives on its own.', whyAr: 'مركّبة أيضًا؛ والاختبار أن يصمد كل طرف وحده.' },
      { en: '*Because* I study, I improve.', ar: 'لأنني أدرس أتحسّن. (معقّدة)', why: 'COMPLEX: *Because* makes one clause dependent. It cannot stand alone.', whyAr: 'معقّدة: because تجعل إحدى الجملتين تابعة لا تقف وحدها.' },
      { en: '*When* it rains, I stay home.', ar: 'عندما تمطر أبقى في البيت. (معقّدة)', why: 'Complex again — *When* is a subordinating word, not a FANBOYS.', whyAr: 'معقّدة أيضًا؛ when أداة ربط تابع لا أداة عطف.' },
      { en: '*Although* it was hard, I tried.', ar: 'مع أنه كان صعبًا حاولت. (معقّدة)', why: '*Although* also subordinates, and it signals contrast.', whyAr: 'although تُخضع أيضًا وتدلّ على التضاد.' },
      { en: '*When* I study, I learn*,* *and* I grow.', ar: 'عندما أدرس أتعلّم وأنمو. (مركّبة معقّدة)', why: 'COMPOUND-COMPLEX: one dependent clause plus TWO independent ones.', whyAr: 'مركّبة معقّدة: جملة تابعة مع جملتين رئيسيتين.' },
      { en: 'We can walk*,* *or* we can drive.', ar: 'نمشي أو نقود. (مركّبة)', why: 'Compound: two independent clauses offering a choice.', whyAr: 'مركّبة: جملتان رئيسيتان تعرضان خيارًا.' },
      { en: 'She reads books.', ar: 'تقرأ الكتب. (بسيطة)', why: 'Simple — one clause, however many words follow the verb.', whyAr: 'بسيطة: جملة واحدة مهما تلا الفعلَ من كلمات.' },
    ],
    exercises: [
      { q: 'Type? “I read books.”', a: '*Simple*.' },
      { q: 'Type? “I read, and I write.”', a: '*Compound*.' },
      { q: 'Type? “Because I read, I learn.”', a: '*Complex*.' },
      { q: 'Make it compound: “I was late. I ran.”', a: 'I was late*,* *so* I ran.' },
      { q: 'Make it complex: “It rained. We stayed home.”', a: '*Because* it rained, we stayed home.' },
    ],
    reading: {
      title: 'How I Learn', titleAr: 'كيف أتعلّم',
      passage: [
        'I study English every day.',
        'I read new words*,* *and* I write them in a notebook.',
        '*When* I make a mistake, I stop and fix it.',
        'Progress is slow*,* *but* it is real.',
        '*Because* I never give up, I keep getting better.',
      ],
      questions: [
        { q: 'Find a simple sentence in the passage.', a: '“I study English every day.”' },
        { q: 'Find a compound sentence.', a: '“I read new words, and I write them…”' },
        { q: 'Find a complex sentence.', a: '“When I make a mistake, I stop and fix it.”' },
      ],
      tip: 'One paragraph, all three types — that is what keeps a reader interested.',
      tipAr: 'فقرة واحدة بالأنواع الثلاثة — هذا ما يبقي القارئ مهتمًّا.',
    },
    homework: [
      { en: 'Write 2 simple, 2 compound, and 2 complex sentences', ar: 'اكتب جملتين من كل نوع' },
      { en: 'Label the type of 4 sentences from any text', ar: 'حدّد نوع ٤ جمل من أي نص' },
      { en: 'Turn 3 short simple sentences into compound/complex', ar: 'حوّل ٣ جمل بسيطة إلى مركّبة/معقّدة' },
    ],
    editing: {
      wrong: [
        'I like coffee I do not like tea.',
        'Because I woke up late I missed the bus.',
        'She was tired but she kept working.',
      ],
      correct: [
        'I like coffee*,* *but* I do not like tea.',
        '*Because* I woke up late*,* I missed the bus.',
        'She was tired*,* but she kept working.',
      ],
    },
  },

  /* ─────────────────────────── 9 · COMPOUND ─────────────────────────── */
  {
    no: 15, tag: 'Compound', tagAr: 'المركّبة',
    title: 'Compound Sentences & Run-ons',
    titleAr: 'الجملة المركّبة والجملة الملتصقة',
    objectives: [
      { en: 'Join two full sentences with comma + FANBOYS', ar: 'ربط جملتين بفاصلة + أداة' },
      { en: 'Recognize a run-on sentence', ar: 'التعرّف على الجملة الملتصقة' },
      { en: 'Fix a run-on in two ways', ar: 'إصلاح الملتصقة بطريقتين' },
      { en: 'Avoid the comma splice', ar: 'تجنّب فصل الجملتين بفاصلة فقط' },
    ],
    rule: {
      en: 'Join two complete sentences with *comma + FANBOYS*. A *run-on* has no join; a *comma splice* uses only a comma. Both are errors.',
      ar: 'اربط جملتين كاملتين بفاصلة + أداة عطف. الجملة الملتصقة بلا رابط، وفصلها بفاصلة فقط خطأ.',
    },
    explain: {
      intro: 'A comma is a *pause*, not a *join*. It is the single most common mistake Arabic speakers make in English, because in Arabic one long flowing sentence is good style — in English it reads as a mistake. Two complete sentences need real glue.',
      introAr: 'الفاصلة وقفة لا رابط. وهذا أكثر خطأ يقع فيه الناطق بالعربية، لأن الجملة الطويلة المسترسلة أسلوب جميل في العربية، بينما تُقرأ في الإنجليزية كخطأ. الجملتان الكاملتان تحتاجان رابطًا حقيقيًا.',
      points: [
        { en: 'Right ✓: I was late*,* *so* I ran. (comma + FANBOYS)', ar: 'الصحيح: فاصلة + أداة عطف' },
        { en: 'Run-on ✗: I was late I ran. — no glue at all', ar: 'الملتصقة: بلا رابط إطلاقًا' },
        { en: 'Comma splice ✗: I was late*,* I ran. — comma pretending to be glue', ar: 'الفاصلة وحدها: تتظاهر بأنها رابط' },
        { en: 'Fix 1: add a FANBOYS · Fix 2: full stop · Fix 3: semicolon *;*', ar: 'الحلول: أداة عطف · نقطة · فاصلة منقوطة' },
        { en: 'Fix 4: make one side dependent — *Because* I was late, I ran.', ar: 'حل رابع: اجعل أحد الطرفين تابعًا' },
        { en: 'Quick test: cover the comma. Are BOTH sides complete sentences? Then a comma alone is illegal.', ar: 'اختبار سريع: غطِّ الفاصلة — إن كان الطرفان جملتين كاملتين فالفاصلة وحدها ممنوعة' },
      ],
    },
    examples: [
      { en: 'I woke up early*,* *and* I made breakfast.', ar: 'استيقظت مبكرًا وأعددت الفطور.', why: 'Comma + *and* joins two complete sentences — the correct compound shape.', whyAr: 'فاصلة + and تربط جملتين كاملتين، وهذا شكل المركّبة الصحيح.' },
      { en: 'She called me*,* *but* I was busy.', ar: 'اتصلت بي لكنني كنت مشغولًا.', why: 'Both halves could stand alone, which is exactly why the comma is legal.', whyAr: 'كل طرف يقف وحده، ولهذا جازت الفاصلة.' },
      { en: 'We can stay*,* *or* we can go.', ar: 'نبقى أو نذهب.', why: '*or* between two independent clauses, comma included.', whyAr: 'or بين جملتين رئيسيتين مع الفاصلة.' },
      { en: 'It was raining*,* *so* we took an umbrella.', ar: 'كانت تمطر، فأخذنا مظلّة.', why: '*so* marks the result, and the comma marks the join.', whyAr: 'so للنتيجة والفاصلة للربط.' },
      { en: 'The test was hard*,* *yet* she smiled.', ar: 'كان الاختبار صعبًا ومع ذلك ابتسمت.', why: '*yet* adds surprise to the contrast — she smiled despite the difficulty.', whyAr: 'yet تضيف المفاجأة إلى التضاد.' },
      { en: 'I studied all night*,* *so* I was tired.', ar: 'ذاكرت طوال الليل، فكنت متعبًا.', why: 'Cause first, result second — *so* always points forwards.', whyAr: 'السبب أولًا والنتيجة ثانيًا؛ so تنظر إلى الأمام.' },
      { en: 'He knocked*,* *but* no one answered.', ar: 'طرق الباب لكن لم يجب أحد.', why: 'Without the comma this would be a comma splice — the glue is *but*, not the comma.', whyAr: 'بلا الفاصلة والأداة تصير الجملة ملتصقة؛ الرابط هو but لا الفاصلة.' },
      { en: 'You can walk*,* *or* you can take the bus.', ar: 'تمشي أو تأخذ الحافلة.', why: 'Two complete options joined properly.', whyAr: 'خياران كاملان مربوطان بشكل صحيح.' },
      { en: 'The sun set*,* *and* the streets grew quiet.', ar: 'غربت الشمس وهدأت الشوارع.', why: 'Two independent clauses describing one moment — the comma keeps them separate.', whyAr: 'جملتان رئيسيتان تصفان لحظة واحدة، والفاصلة تفصلهما.' },
    ],
    exercises: [
      { q: 'Fix the run-on: “I was tired I slept.”', a: 'I was tired*,* *so* I slept.' },
      { q: 'Fix the comma splice: “She ran, she missed the bus.”', a: 'She ran*,* *but* she missed the bus.' },
      { q: 'Join: “The film ended. We went home.” (so)', a: 'The film ended*,* *so* we went home.' },
      { q: 'Add the comma: “It was hot so we swam.”', a: 'It was hot*,* so we swam.' },
      { q: 'Two ways to fix: “I called he did not answer.”', a: 'I called*,* *but* he did not answer. / I called. He did not answer.' },
    ],
    reading: {
      title: 'A Busy Morning', titleAr: 'صباح مزدحم',
      passage: [
        'I woke up late*,* *so* I skipped breakfast.',
        'I wanted coffee*,* *but* there was no time.',
        'The bus was full*,* *yet* I found a seat.',
        'I opened my book*,* *and* I read a few pages.',
        'I reached the office early*,* *so* I felt proud.',
      ],
      questions: [
        { q: 'Why did the writer skip breakfast?', a: 'Because they woke up late.' },
        { q: 'How many compound sentences are here?', a: 'All five (each is comma + FANBOYS).' },
        { q: 'Rewrite line 2 as two separate sentences.', a: 'I wanted coffee. There was no time.' },
      ],
      tip: 'Every join is comma + FANBOYS between two FULL ideas — never a comma alone.',
      tipAr: 'كل ربط فاصلة + أداة بين فكرتين كاملتين — لا فاصلة وحدها.',
    },
    homework: [
      { en: 'Write 5 compound sentences about your day', ar: 'اكتب ٥ جمل مركّبة عن يومك' },
      { en: 'Fix 3 run-on sentences (comma + FANBOYS)', ar: 'أصلح ٣ جمل ملتصقة' },
      { en: 'Fix 2 comma splices two different ways', ar: 'أصلح جملتين بطريقتين' },
    ],
    editing: {
      wrong: [
        'I finished my work I went home.',
        'The coffee was cold, I drank it anyway.',
        'She studied hard she passed the exam.',
      ],
      correct: [
        'I finished my work*,* *so* I went home.',
        'The coffee was cold*,* *but* I drank it anyway.',
        'She studied hard*,* *so* she passed the exam.',
      ],
    },
  },

  /* ─────────────────────────── 10 · COMPLEX ─────────────────────────── */
  {
    no: 16, tag: 'Complex', tagAr: 'المعقّدة',
    title: 'Complex Sentences — adverb clauses',
    titleAr: 'الجملة المعقّدة — الجُمل الظرفية',
    objectives: [
      { en: 'Recognize a dependent (adverb) clause', ar: 'التعرّف على الجملة التابعة' },
      { en: 'Use because, when, if, although…', ar: 'استخدام because/when/if/although' },
      { en: 'Add a comma when the clause comes first', ar: 'فاصلة إذا جاءت التابعة أولًا' },
      { en: 'Drop the comma when it comes second', ar: 'حذفها إذا جاءت ثانيًا' },
    ],
    rule: {
      en: 'A complex sentence has a main idea and a dependent clause. Clause *first* → add a *comma*: “*When* it rains*,* I stay home.” Clause *second* → no comma.',
      ar: 'الجملة المعقّدة فيها فكرة رئيسية وأخرى تابعة. التابعة أولًا ← فاصلة، وثانيًا ← بلا فاصلة.',
    },
    explain: {
      intro: 'A dependent clause begins with a linking word and cannot stand alone. It needs a main clause to complete the idea.',
      introAr: 'الجملة التابعة تبدأ بأداة ربط ولا تقف وحدها؛ تحتاج جملة رئيسية لإتمام المعنى.',
      points: [
        { en: 'Linking words: *because, when, if, although, after, before, while, since*', ar: 'أدوات الربط' },
        { en: 'Clause first → *comma*: When I study, I improve.', ar: 'أولًا ← فاصلة' },
        { en: 'Clause second → *no comma*: I improve when I study.', ar: 'ثانيًا ← بلا فاصلة' },
        { en: '“When it rains” alone is a fragment, not a sentence', ar: '«عندما تمطر» وحدها ناقصة' },
      ],
    },
    examples: [
      { en: '*When* it rains*,* I stay home.', ar: 'عندما تمطر أبقى في البيت.', why: 'Dependent clause FIRST → it takes a comma. This is the rule that gets forgotten.', whyAr: 'الجملة التابعة أولًا تأخذ فاصلة، وهذه القاعدة تُنسى كثيرًا.' },
      { en: 'I stay home *when* it rains.', ar: 'أبقى في البيت عندما تمطر.', why: 'Same sentence reversed: main clause first → NO comma.', whyAr: 'الجملة نفسها معكوسة: الرئيسية أولًا فلا فاصلة.' },
      { en: '*Because* I was tired*,* I slept.', ar: 'لأنني كنت متعبًا نمت.', why: '*Because* first, so a comma follows the dependent clause.', whyAr: 'because أولًا فالفاصلة بعد التابعة.' },
      { en: 'I slept *because* I was tired.', ar: 'نمت لأنني كنت متعبًا.', why: 'Reversed, and the comma disappears. Only the ORDER decides.', whyAr: 'بالعكس تختفي الفاصلة؛ الترتيب وحده يقرّر.' },
      { en: '*If* you study*,* you will pass.', ar: 'إذا ذاكرت ستنجح.', why: '*If* behaves exactly like the other subordinators.', whyAr: 'if كسائر أدوات الربط التابع تمامًا.' },
      { en: 'You will pass *if* you study.', ar: 'ستنجح إذا ذاكرت.', why: 'Result first → no comma. Same pair, same rule.', whyAr: 'النتيجة أولًا فلا فاصلة؛ القاعدة نفسها.' },
      { en: '*Although* it was hard*,* I finished.', ar: 'مع أنه كان صعبًا أنهيت.', why: '*Although* signals contrast and follows the same comma rule.', whyAr: 'although للتضاد وتتبع قاعدة الفاصلة نفسها.' },
      { en: '*After* I ate*,* I washed the dishes.', ar: 'بعد أن أكلت غسلت الأطباق.', why: '*After* orders events in time — the comma still depends on position.', whyAr: 'after ترتّب الأحداث زمنيًا، والفاصلة تتبع الموضع.' },
      { en: '*Before* you sleep*,* brush your teeth.', ar: 'قبل أن تنام اغسل أسنانك.', why: '*Before* reverses the time order but not the punctuation rule.', whyAr: 'before تعكس ترتيب الزمن لا قاعدة الترقيم.' },
      { en: '*While* she cooked*,* I set the table.', ar: 'بينما كانت تطبخ رتّبت الطاولة.', why: '*While* marks two things happening together.', whyAr: 'while تدلّ على التزامن.' },
    ],
    exercises: [
      { q: 'Comma? “When I woke up I ate.”', a: 'When I woke up*,* I ate.' },
      { q: 'Comma? “I ate when I woke up.”', a: 'I ate when I woke up. (no comma)' },
      { q: 'Join (because): “I stayed home. I was sick.”', a: 'I stayed home *because* I was sick.' },
      { q: 'Move to front: “I read before I sleep.”', a: '*Before* I sleep*,* I read.' },
      { q: 'Fix: “Although I was tired. I kept going.”', a: '*Although* I was tired*,* I kept going.' },
    ],
    reading: {
      title: 'My Evening Routine', titleAr: 'روتين مسائي',
      passage: [
        '*When* I get home*,* I take a short rest.',
        'I study English *because* I want a better job.',
        '*If* I have energy*,* I read one page of a story.',
        '*Although* I feel tired at night*,* I never skip my review.',
        'I sleep early *so that* I can wake up fresh.',
      ],
      questions: [
        { q: 'Why does the writer study English?', a: '*Because* they want a better job.' },
        { q: 'Which sentences have a comma, and why?', a: 'The ones with the clause *first* (When…, If…, Although…).' },
        { q: 'Rewrite line 2 with the clause first.', a: '*Because* I want a better job*,* I study English.' },
      ],
      tip: 'Front clause = comma. Second clause = no comma.',
      tipAr: 'التابعة أولًا فاصلة، وثانيًا بلا فاصلة.',
    },
    homework: [
      { en: 'Write 4 complex sentences with the clause FIRST (commas)', ar: 'اكتب ٤ جمل بالتابعة أولًا' },
      { en: 'Rewrite 2 of them with the clause SECOND (no comma)', ar: 'أعد كتابتها بالتابعة ثانيًا' },
      { en: 'Use because, when, if, although once each', ar: 'استعمل كل أداة مرة' },
    ],
    editing: {
      wrong: [
        'When the bell rang the students left.',
        'I will help you if you ask, me.',
        'Because it was cold, so we stayed inside.',
      ],
      correct: [
        'When the bell rang*,* the students left.',
        'I will help you if you ask me. *(remove the comma)*',
        'Because it was cold*,* we stayed inside. *(drop “so”)*',
      ],
    },
  },

  /* ─────────────────────────── 11 · COMMAS ─────────────────────────── */
  {
    no: 17, tag: 'Commas', tagAr: 'الفاصلة',
    title: 'Commas — the five main uses',
    titleAr: 'الفاصلة — الاستعمالات الخمسة',
    objectives: [
      { en: 'Use commas in a series', ar: 'الفاصلة في السلسلة' },
      { en: 'Use commas in compound & complex sentences', ar: 'في الجمل المركّبة والمعقّدة' },
      { en: 'Set off extra information with commas', ar: 'عزل المعلومة الإضافية بفاصلتين' },
      { en: 'Avoid unnecessary commas', ar: 'تجنّب الفواصل الزائدة' },
    ],
    rule: {
      en: 'Use a comma: (1) in a series, (2) before FANBOYS in a compound sentence, (3) after a front adverb clause, (4) around extra information, (5) after an intro word.',
      ar: 'استخدم الفاصلة: في السلسلة، وقبل أداة العطف، وبعد الظرفية في البداية، وحول المعلومة الإضافية، وبعد الكلمة الافتتاحية.',
    },
    explain: {
      intro: 'A comma tells the reader to pause. Too few commas confuse; too many break the flow. These five rules cover almost every case.',
      introAr: 'الفاصلة تُخبر القارئ أن يتوقّف قليلًا. قلّتها تُربك وكثرتها تقطع التدفّق، وهذه القواعد الخمس تكفي غالبًا.',
      points: [
        { en: 'Series: apples*,* bread*,* and milk', ar: 'السلسلة' },
        { en: 'Compound: It was late*,* so we left', ar: 'المركّبة' },
        { en: 'Front clause: When we arrived*,* dinner was ready', ar: 'الظرفية أولًا' },
        { en: 'Extra info: My teacher*,* Mr. Ali*,* is kind', ar: 'المعلومة الإضافية' },
        { en: 'Intro word: First*,* open your book', ar: 'الكلمة الافتتاحية' },
      ],
    },
    examples: [
      { en: 'I bought apples*,* bread*,* and milk.', ar: 'اشتريت تفاحًا وخبزًا وحليبًا.', why: 'Commas separate items in a list — the last one before *and* is the Oxford comma.', whyAr: 'الفواصل تفصل عناصر القائمة، والأخيرة قبل and هي فاصلة أكسفورد.' },
      { en: 'She speaks Arabic*,* French*,* and English.', ar: 'تتحدّث ثلاث لغات.', why: 'Three items, two commas. The pattern never changes.', whyAr: 'ثلاثة عناصر وفاصلتان؛ النمط ثابت.' },
      { en: 'We ran*,* jumped*,* and laughed.', ar: 'ركضنا وقفزنا وضحكنا.', why: 'A list of VERBS follows exactly the same comma rule.', whyAr: 'قائمة الأفعال تتبع القاعدة نفسها.' },
      { en: 'It was late*,* so we left.', ar: 'كان الوقت متأخّرًا فغادرنا.', why: 'Comma before a FANBOYS joining two complete sentences.', whyAr: 'فاصلة قبل أداة العطف حين تربط جملتين كاملتين.' },
      { en: 'I called him*,* but he did not answer.', ar: 'اتصلت به لكنه لم يجب.', why: 'Same job: the comma marks where one sentence ends and the next begins.', whyAr: 'الوظيفة نفسها: تُعلّم الفاصلةُ نهايةَ جملة وبدايةَ أخرى.' },
      { en: 'When we arrived*,* dinner was ready.', ar: 'عندما وصلنا كان العشاء جاهزًا.', why: 'Dependent clause first → comma. Same rule as the complex sentence lesson.', whyAr: 'الجملة التابعة أولًا فالفاصلة، كدرس الجملة المعقّدة.' },
      { en: 'If you are ready*,* we can start.', ar: 'إذا كنت مستعدًا يمكننا البدء.', why: '*If* first → comma. The order decides, not the word.', whyAr: 'if أولًا فالفاصلة؛ الترتيب يقرّر لا الكلمة.' },
      { en: 'My teacher*,* Mr. Ali*,* is kind.', ar: 'معلّمي، السيد علي، لطيف.', why: 'Extra information about the teacher — delete it and the sentence survives.', whyAr: 'معلومة إضافية عن المعلّم؛ احذفها وتبقى الجملة.' },
      { en: 'Rabat*,* the capital*,* is beautiful.', ar: 'الرباط، العاصمة، جميلة.', why: 'The same pattern: an appositive is wrapped in TWO commas, not one.', whyAr: 'النمط نفسه: البدل يُحاط بفاصلتين لا بواحدة.' },
      { en: 'First*,* open your book.', ar: 'أولًا، افتح كتابك.', why: 'An introductory word takes a comma before the sentence proper begins.', whyAr: 'الكلمة الافتتاحية تأخذ فاصلة قبل بدء الجملة.' },
      { en: 'Finally*,* we finished the project.', ar: 'أخيرًا، أنهينا المشروع.', why: 'Same for closing words — *Finally* is outside the sentence structure.', whyAr: 'وكذلك كلمات الختام؛ Finally خارج بناء الجملة.' },
    ],
    exercises: [
      { q: 'Add commas: “I like tea coffee and juice.”', a: 'I like tea*,* coffee*,* and juice.' },
      { q: 'Add a comma: “It was cold so I wore a coat.”', a: 'It was cold*,* so I wore a coat.' },
      { q: 'Add a comma: “When I woke up I ate.”', a: 'When I woke up*,* I ate.' },
      { q: 'Add commas (extra info): “My friend Omar is here.”', a: 'My friend*,* Omar*,* is here.' },
      { q: 'Remove the wrong comma: “I bought, apples and bread.”', a: 'I bought apples and bread.' },
    ],
    reading: {
      title: 'Shopping Day', titleAr: 'يوم التسوّق',
      passage: [
        'First*,* I made a list of what I needed.',
        'At the market I bought tomatoes*,* onions*,* and bread.',
        'The shop was crowded*,* but the seller*,* an old friend*,* helped me quickly.',
        'When I got home*,* I cooked a warm lunch.',
        'Finally*,* I sat down and enjoyed my meal.',
      ],
      questions: [
        { q: 'What three things did the writer buy?', a: 'Tomatoes, onions, and bread.' },
        { q: 'Who is “an old friend” in line 3?', a: 'The seller (extra information).' },
        { q: 'Why is there a comma after “When I got home”?', a: 'It is a *front adverb clause*.' },
      ],
      tip: 'Series · compound · front clause · extra info · intro word — all appear here.',
      tipAr: 'السلسلة والمركّبة والظرفية والمعلومة الإضافية والكلمة الافتتاحية — كلها هنا.',
    },
    homework: [
      { en: 'Write one sentence for each of the 5 comma rules', ar: 'اكتب جملة لكل قاعدة من القواعد الخمس' },
      { en: 'Add commas to a short paragraph you choose', ar: 'أضف الفواصل إلى فقرة قصيرة تختارها' },
      { en: 'Write a sentence with extra info between two commas', ar: 'اكتب جملة بمعلومة إضافية بين فاصلتين' },
    ],
    editing: {
      wrong: [
        'We visited Fes Rabat and Ifrane last summer.',
        'When the rain stopped we went outside.',
        'My uncle a doctor lives in Canada.',
      ],
      correct: [
        'We visited Fes*,* Rabat*,* and Ifrane last summer.',
        'When the rain stopped*,* we went outside.',
        'My uncle*,* a doctor*,* lives in Canada.',
      ],
    },
  },

  /* ─────────────────────────── 12 · PARALLEL ─────────────────────────── */
  {
    no: 18, tag: 'Parallel', tagAr: 'التوازي',
    title: 'Parallel Structure — the same form in a list',
    titleAr: 'التوازي — نفس الصيغة في القائمة',
    objectives: [
      { en: 'Understand parallel structure', ar: 'فهم التوازي' },
      { en: 'Keep every list item in the same form', ar: 'إبقاء عناصر القائمة بنفس الصيغة' },
      { en: 'Spot and fix a faulty (non-parallel) list', ar: 'اكتشاف القائمة غير المتوازية وإصلاحها' },
      { en: 'Write balanced, professional sentences', ar: 'كتابة جمل متوازنة واحترافية' },
    ],
    rule: {
      en: 'In a list, every item must have the *same grammatical form*. Right: “I like *reading*, *writing*, and *swimming*.” (all -ing).',
      ar: 'في القائمة يجب أن تكون كل العناصر بنفس الصيغة النحوية. الصحيح: reading, writing, swimming (كلها -ing).',
    },
    explain: {
      intro: 'When you write a list, every item must wear the *same uniform*. A mismatch feels broken even to a reader who cannot explain why — and examiners and recruiters notice it instantly. This one rule makes an intermediate writer sound advanced.',
      introAr: 'حين تكتب قائمة يجب أن يرتدي كل عنصر «الزيّ نفسه». عدم التطابق يبدو مكسورًا حتى لمن لا يعرف السبب — والمصحّح ومسؤول التوظيف يلاحظانه فورًا. هذه القاعدة وحدها ترفع مستوى كتابتك.',
      points: [
        { en: 'All *-ing*: reading, writing, swimming ✓', ar: 'كلها بصيغة -ing' },
        { en: 'All *base* verbs: read, write, swim ✓', ar: 'كلها أفعال مجرّدة' },
        { en: 'All *adjectives*: smart, kind, funny ✓', ar: 'كلها صفات' },
        { en: 'Never mix: reading, *to write*, *I swim* ✗ — three different uniforms', ar: 'لا تخلط: ثلاث صيغ مختلفة في قائمة واحدة ✗' },
        { en: 'It applies to pairs too: *both* … *and* … · *not only* … *but also* …', ar: 'ينطبق على الأزواج أيضًا: both…and · not only…but also' },
        { en: 'Self-check: read the opener + each item alone. “I like *swimming*.” “I like *to write*.” — mismatch caught.', ar: 'راجع: اقرأ بداية الجملة مع كل عنصر وحده لتكشف التنافر' },
      ],
    },
    examples: [
      { en: 'I like *reading*, *writing*, and *swimming*.', ar: 'أحب القراءة والكتابة والسباحة.', why: 'All three items are *-ing* — the list wears one uniform.', whyAr: 'العناصر الثلاثة بصيغة ing؛ القائمة بزيّ واحد.' },
      { en: 'She is *smart*, *kind*, and *funny*.', ar: 'هي ذكية ولطيفة ومرحة.', why: 'All three are adjectives. Mixing in a noun would break the pattern.', whyAr: 'الثلاثة صفات، وإقحام اسم يكسر النمط.' },
      { en: 'We *cooked*, *ate*, and *cleaned*.', ar: 'طبخنا وأكلنا ونظّفنا.', why: 'All three are past-tense verbs, so the rhythm holds.', whyAr: 'الثلاثة أفعال ماضية فاستقام الإيقاع.' },
      { en: 'He wants *to read*, *to write*, and *to travel*.', ar: 'يريد أن يقرأ ويكتب ويسافر.', why: 'All three are *to* + verb. Repeating *to* is optional but must be consistent.', whyAr: 'الثلاثة بصيغة to + فعل، وتكرار to اختياري لكن بانتظام.' },
      { en: 'The plan is simple*,* clear*,* and *useful*.', ar: 'الخطة بسيطة وواضحة ومفيدة.', why: 'All three are adjectives following *is* — the same slot, the same form.', whyAr: 'الثلاثة صفات بعد is: الموضع نفسه والصيغة نفسها.' },
      { en: 'Study *slowly*, *carefully*, and *daily*.', ar: 'ادرس ببطء وعناية ويوميًا.', why: 'All three are adverbs ending in *-ly*.', whyAr: 'الثلاثة ظروف تنتهي بـ ly.' },
      { en: 'I bought *apples*, *bread*, and *milk*.', ar: 'اشتريت تفاحًا وخبزًا وحليبًا.', why: 'All three are plain nouns. Test it by reading the opener with each item alone.', whyAr: 'الثلاثة أسماء مجرّدة؛ اختبرها بقراءة بداية الجملة مع كل عنصر وحده.' },
    ],
    exercises: [
      { q: 'Fix: “I like reading, to write, and I swim.”', a: 'I like *reading*, *writing*, and *swimming*.' },
      { q: 'Fix: “She is kind, smart, and a funny person.”', a: 'She is *kind*, *smart*, and *funny*.' },
      { q: 'Fix: “We ran, jumping, and we swam.”', a: 'We *ran*, *jumped*, and *swam*.' },
      { q: 'Complete: “He likes to cook and ___.”', a: '…and *to eat*.' },
      { q: 'Make parallel: “red, big, and it is round”', a: '*red*, *big*, and *round*.' },
    ],
    reading: {
      title: 'A Good Employee', titleAr: 'موظّف جيّد',
      passage: [
        'A good employee is *honest*, *hard-working*, and *reliable*.',
        'Every day she *plans* her tasks, *answers* her emails, and *helps* her team.',
        'She likes *learning* new skills, *solving* problems, and *sharing* ideas.',
        'Her goals are clear*:* to grow*,* to lead*,* and to inspire.',
      ],
      questions: [
        { q: 'List the three adjectives that describe her.', a: '*honest*, *hard-working*, *reliable* (all adjectives).' },
        { q: 'What form do “planning” verbs take in line 2?', a: 'Present with -s: *plans*, *answers*, *helps*.' },
        { q: 'Are her goals parallel? Give the form.', a: 'Yes — *to grow, to lead, to inspire* (all “to + verb”).' },
      ],
      tip: 'Each list keeps ONE form from start to finish.',
      tipAr: 'كل قائمة تحافظ على صيغة واحدة من البداية للنهاية.',
    },
    homework: [
      { en: 'Write 3 parallel lists (all -ing)', ar: 'اكتب ٣ قوائم متوازية بـ -ing' },
      { en: 'Describe yourself with 3 matching adjectives', ar: 'صِف نفسك بثلاث صفات متطابقة' },
      { en: 'Write a “goals” sentence using “to + verb” three times', ar: 'اكتب جملة أهداف بـ to + verb ثلاث مرات' },
    ],
    editing: {
      wrong: [
        'My job is to write, planning, and I answer emails.',
        'She is talented, kind, and works hard.',
        'We like to swim, running, and to read.',
      ],
      correct: [
        'My job is *to write*, *to plan*, and *to answer* emails.',
        'She is talented, kind, and *hard-working*.',
        'We like *swimming*, *running*, and *reading*.',
      ],
    },
  },

  /* ─────────────────────────── 13 · VARIETY ─────────────────────────── */
  {
    no: 20, tag: 'Variety', tagAr: 'التنويع',
    title: 'Sentence Variety — rhythm in writing',
    titleAr: 'تنويع الجمل — الإيقاع في الكتابة',
    objectives: [
      { en: 'Understand why variety matters', ar: 'فهم أهمية التنويع' },
      { en: 'Mix short and long sentences', ar: 'المزج بين القصير والطويل' },
      { en: 'Mix simple, compound, and complex', ar: 'المزج بين الأنواع' },
      { en: 'Start sentences in different ways', ar: 'بدء الجمل بطرق مختلفة' },
    ],
    rule: {
      en: 'Do not repeat the same short sentence pattern. *Mix* length (short + long) and *mix* type (simple + compound + complex). Variety keeps a reader awake.',
      ar: 'لا تكرّر النمط القصير نفسه. امزج بين الطول (قصير + طويل) والنوع (بسيطة + مركّبة + معقّدة)؛ التنويع يبقي القارئ متيقّظًا.',
    },
    explain: {
      intro: 'Everything in this unit was about writing *correct* sentences. This lesson is about writing *good* ones. Four short sentences in a row sound like a robot; four long ones exhaust the reader. Rhythm is what separates a correct writer from a writer people enjoy reading.',
      introAr: 'كل ما سبق في هذه الوحدة كان عن كتابة جمل صحيحة، وهذا الدرس عن كتابة جمل جميلة. أربع جمل قصيرة متتالية تبدو آلية، وأربع طويلة تُتعب القارئ. الإيقاع هو ما يفصل الكاتب الصحيح عن الكاتب الممتع.',
      points: [
        { en: 'Combine choppy ideas with FANBOYS or a dependent clause', ar: 'ادمج الأفكار المقطّعة بأداة عطف أو جملة تابعة' },
        { en: 'Vary the *opening*: *When…* · *After…* · *Although…* · *First,*', ar: 'نوّع بداية الجملة' },
        { en: 'Never start three sentences in a row with *I*', ar: 'لا تبدأ ثلاث جمل متتالية بـ I' },
        { en: 'Vary the *length*: short → long → medium', ar: 'نوّع الطول: قصيرة ← طويلة ← متوسطة' },
        { en: 'Keep ONE short sentence for power. It lands.', ar: 'احتفظ بجملة قصيرة واحدة للتأثير — إنها تُصيب' },
        { en: 'Test it by *reading aloud* — your ear finds what your eye misses', ar: 'اختبرها بالقراءة بصوت عالٍ: أذنك تكشف ما تخطئه عينك' },
      ],
    },
    examples: [
      { en: 'Choppy: I woke up. I ate. I left. I worked.', ar: 'مقطّع: جمل قصيرة متكرّرة.', why: 'Four short sentences in a row — grammatically perfect and painful to read.', whyAr: 'أربع جمل قصيرة متتالية: سليمة نحويًا ومؤلمة قراءةً.' },
      { en: 'Better: *After* I woke up, I ate*,* *and* then I left for work.', ar: 'أفضل: مدموجة ومنوّعة.', why: 'The same content, combined and varied. Nothing was added except rhythm.', whyAr: 'المحتوى نفسه مدموجًا ومنوّعًا؛ لم يُضف إلا الإيقاع.' },
      { en: 'I love mornings. *When* the sun rises, the city wakes up.', ar: 'أحب الصباح. عندما تشرق الشمس تستيقظ المدينة.', why: 'Short sentence, then a longer one — the contrast in length IS the rhythm.', whyAr: 'جملة قصيرة ثم أطول؛ التباين في الطول هو الإيقاع.' },
      { en: 'It was a long day*,* *but* I was happy.', ar: 'كان يومًا طويلًا لكنني سعيد.', why: 'One compound sentence keeps two related ideas in a single breath.', whyAr: 'الجملة المركّبة تُبقي فكرتين مترابطتين في نفَس واحد.' },
      { en: '*First*, we studied. *Then*, we practiced. *Finally*, we relaxed.', ar: 'أولًا درسنا، ثم تمرّنا، وأخيرًا استرحنا.', why: 'Sequence words vary the OPENINGS, which matters as much as length.', whyAr: 'كلمات الترتيب تنوّع البدايات، وهي بأهمّية الطول.' },
      { en: 'Rain fell all night. *In the morning*, the streets were clean.', ar: 'أمطرت طوال الليل. وفي الصباح كانت الشوارع نظيفة.', why: 'Opening with a time phrase instead of the subject — never start three sentences with *I*.', whyAr: 'ابدأ بعبارة زمنية بدل الفاعل، ولا تبدأ ثلاث جمل بـ I.' },
    ],
    exercises: [
      { q: 'Combine: “I was tired. I kept working.”', a: '*Although* I was tired*,* I kept working.' },
      { q: 'Combine: “She smiled. She said hello.”', a: 'She smiled *and* said hello.' },
      { q: 'Start differently: “We left after the rain stopped.”', a: '*After* the rain stopped*,* we left.' },
      { q: 'Vary these: “I read. I write. I learn.”', a: 'I read *and* write*,* *so* I learn.' },
    ],
    reading: {
      title: 'A Good Morning', titleAr: 'صباح جميل',
      passage: [
        '*When* the sun rose, I opened my window.',
        'The air was cool*,* *and* the birds were singing.',
        'I made tea. I read one page. I smiled.',
        '*Because* I started calmly, my whole day felt bright.',
        'Small habits change everything.',
      ],
      questions: [
        { q: 'Find the shortest sentence and say why it works.', a: '“Small habits change everything.” — short = impact.' },
        { q: 'Which sentence is complex?', a: '“When the sun rose, I opened my window.” / “Because I started calmly…”.' },
        { q: 'How does line 3 create rhythm?', a: 'Three short parallel sentences in a row.' },
      ],
      tip: 'Notice the mix: long, short, complex, compound — never the same twice.',
      tipAr: 'انظر المزيج: طويل، قصير، معقّد، مركّب — بلا تكرار.',
    },
    homework: [
      { en: 'Rewrite 4 choppy sentences into a smooth paragraph', ar: 'أعد كتابة ٤ جمل مقطّعة في فقرة سلسة' },
      { en: 'Start 3 sentences with When / After / First', ar: 'ابدأ ٣ جمل بـ When/After/First' },
      { en: 'Write one very short sentence for effect', ar: 'اكتب جملة قصيرة جدًا للتأثير' },
    ],
    editing: {
      wrong: [
        'I like tea. I like coffee. I like juice. I drink them daily.',
        'The movie was long. It was boring. I left early.',
      ],
      correct: [
        'I like tea*,* coffee*,* and juice*,* *and* I drink them daily.',
        '*Because* the movie was long and boring*,* I left early.',
      ],
    },
  },

  /* ─────────────────────────── 14 · PUTTING IT TOGETHER ─────────────────────────── */
  {
    no: 25, cefr: 'B1', tag: 'Paragraph Project', tagAr: 'مشروع الفقرة',
    title: 'Paragraph Project — Write Your Paragraph',
    titleAr: 'مشروع الفقرة — اكتب فقرتك الكاملة',
    objectives: [
      { en: 'Use every rule from the course in one paragraph', ar: 'استخدام كل القواعد في فقرة واحدة' },
      { en: 'Capitalize, use articles, and choose tenses', ar: 'الحروف الكبيرة والأدوات والأزمنة' },
      { en: 'Join ideas and punctuate with commas', ar: 'ربط الأفكار ووضع الفواصل' },
      { en: 'Edit your own writing for mistakes', ar: 'تدقيق كتابتك بنفسك' },
    ],
    rule: {
      en: 'A good paragraph = a *topic sentence* + *supporting details* + a *concluding sentence*, written with correct capitals, tenses, and punctuation.',
      ar: 'الفقرة الجيدة = جملة موضوعية + تفاصيل داعمة + جملة خاتمة، بحروفٍ كبيرة وأزمنةٍ وترقيمٍ صحيح.',
    },
    studio: {
      prompt: { en: 'Write a full paragraph (5–7 sentences) about “A person I admire.” (or choose your own topic)', ar: 'اكتب فقرةً كاملة (٥–٧ جمل) عن «شخص أُعجب به». (أو اختر موضوعك)' },
      model: {
        title: 'The Person I Admire', titleAr: 'الشخص الذي أُعجب به',
        parts: [
          { role: 'topic', en: 'The person I admire most is my grandmother.' },
          { role: 'support', en: 'She grew up in a small village and worked very hard all her life.' },
          { role: 'support', en: 'Although she never went to school, she taught herself to read.' },
          { role: 'support', en: 'She always tells me that knowledge is the greatest treasure.' },
          { role: 'conclusion', en: 'For all these reasons, my grandmother is my real hero.' },
        ],
      },
      plan: [
        { label: 'Topic sentence — who / your main idea', ar: 'الجملة الموضوعية — مَن / فكرتك' },
        { label: 'Support 1 — a fact about them', ar: 'دعم ١ — حقيقة عنه' },
        { label: 'Support 2 — a reason you admire them', ar: 'دعم ٢ — سبب إعجابك' },
        { label: 'Support 3 — an example or a detail', ar: 'دعم ٣ — مثال أو تفصيل' },
        { label: 'Concluding sentence', ar: 'جملة الخاتمة' },
      ],
      toolkit: [
        { group: 'Start', ar: 'البداية', phrases: ['The … I admire most is …', '… is a very special person.', 'I really admire …'] },
        { group: 'Add & connect', ar: 'الربط', phrases: ['First, …', 'Also, …', 'Although …', 'For example, …', 'because …'] },
        { group: 'Conclude', ar: 'الخاتمة', phrases: ['For all these reasons, …', 'In conclusion, …', 'That is why …'] },
      ],
      steps: [
        { en: 'PLAN: fill the outline — topic sentence, 3 supports, conclusion.', ar: 'خطّط: املأ المخطّط — موضوعية، ٣ دعم، خاتمة.' },
        { en: 'WRITE your topic sentence (one clear main idea).', ar: 'اكتب جملتك الموضوعية (فكرة واحدة واضحة).' },
        { en: 'ADD your 3 supporting sentences.', ar: 'أضف جملك الداعمة الثلاث.' },
        { en: 'ADD a concluding sentence that restates the idea.', ar: 'أضف جملة خاتمة تُعيد الفكرة.' },
        { en: 'EDIT: read aloud and fix capitals, commas, and verbs.', ar: 'دقّق: اقرأ بصوتٍ وصحّح الحروف والفواصل والأفعال.' },
      ],
      checklist: [
        { en: 'The paragraph is indented and 5–7 sentences long', ar: 'الفقرة مُزاحة و٥–٧ جمل' },
        { en: 'The topic sentence states ONE main idea', ar: 'الجملة الموضوعية فكرة واحدة' },
        { en: 'At least 3 supporting sentences', ar: '٣ جمل داعمة على الأقل' },
        { en: 'A concluding sentence', ar: 'جملة خاتمة' },
        { en: 'Every sentence: capital start + end mark', ar: 'كل جملة: حرف كبير وعلامة نهاية' },
        { en: 'Correct tenses, and no run-ons', ar: 'أزمنة صحيحة وبلا جمل ملتصقة' },
      ],
    },
    explain: {
      intro: 'This is the whole course in one page. Nothing new is taught here — every rule you have met since lesson one now has to work *at the same time*, in a paragraph you actually care about. That is the only real test of writing.',
      introAr: 'هذا هو المنهج كله في صفحة واحدة. لا جديد يُعلَّم هنا — كل قاعدة قابلتها منذ الدرس الأول عليها أن تعمل *في وقت واحد*، داخل فقرة تهمّك أنت. وهذا هو الاختبار الحقيقي الوحيد للكتابة.',
      points: [
        { en: 'Mechanics: capitals to start · a/an/the · an end mark on every sentence', ar: 'الأساسيات: الحروف الكبيرة والأدوات وعلامة النهاية' },
        { en: 'Verbs: the right tense for the time, and subject–verb agreement throughout', ar: 'الأفعال: الزمن الصحيح والتطابق في كل الفقرة' },
        { en: 'Joining: FANBOYS + comma · dependent clauses · no run-ons, no splices', ar: 'الربط: أدوات العطف والجمل التابعة بلا التصاق ولا فواصل خاطئة' },
        { en: 'Structure: topic sentence → supports (each with R.E.D.) → conclusion', ar: 'البناء: جملة موضوعية ← دعم بمنهج R.E.D. ← خاتمة' },
        { en: 'Style: parallel lists · varied openings and lengths · transitions as road signs', ar: 'الأسلوب: قوائم متوازية وبدايات وأطوال متنوّعة وأدوات ربط' },
        { en: 'Then the four editing passes — sense, structure, grammar, spelling', ar: 'ثم مرّات التدقيق الأربع: المعنى والبناء والقواعد والإملاء' },
      ],
    },
    examples: [
      { en: '*M*y name is *O*mar*,* *and* I love *E*nglish.', ar: 'اسمي عمر، وأحب الإنجليزية.', why: 'Capitals, a proper noun, and a compound sentence — three rules in one line.', whyAr: 'حروف كبيرة واسم علم وجملة مركّبة: ثلاث قواعد في سطر.' },
      { en: '*E*very morning*,* I *read*, *write*, and *speak* a little.', ar: 'كل صباح أقرأ وأكتب وأتحدّث قليلًا.', why: 'An introductory phrase with its comma, plus a parallel list of three verbs.', whyAr: 'عبارة افتتاحية بفاصلتها وقائمة متوازية من ثلاثة أفعال.' },
      { en: '*W*hen I make a mistake*,* I fix it *and* try again.', ar: 'عندما أخطئ أصلحه وأحاول مجددًا.', why: 'A complex sentence: dependent clause first, so it takes a comma.', whyAr: 'جملة معقّدة: التابعة أولًا فأخذت فاصلة.' },
      { en: '*L*earning takes time*,* *but* I improve every day.', ar: 'التعلّم يأخذ وقتًا لكنني أتحسّن كل يوم.', why: 'Contrast with *but*, and a present simple that states an ongoing truth.', whyAr: 'تضادّ بـ but ومضارع بسيط يذكر حقيقة مستمرّة.' },
    ],
    exercises: [
      { q: 'Fix all: “my name is sara and i study english”', a: '*M*y name is *S*ara*,* *and* I study *E*nglish.' },
      { q: 'Articles: “I have ___ dog and ___ apple.”', a: 'I have *a* dog and *an* apple.' },
      { q: 'Join: “I was tired. I slept.”', a: 'I was tired*,* *so* I slept.' },
      { q: 'Parallel: “I like to read, writing, and I draw.”', a: 'I like *reading*, *writing*, and *drawing*.' },
    ],
    reading: {
      title: 'My English Journey', titleAr: 'رحلتي مع الإنجليزية',
      passage: [
        '*M*y name is *N*our*,* *and* I am a student from *C*asablanca.',
        '*W*hen I started this course*,* I knew only a few words.',
        '*N*ow I can capitalize names*,* choose *a* or *an*, and use commas.',
        'I *read*, *write*, and *practice* a little every single day.',
        'Learning is slow*,* *but* I am proud*,* *and* I will never stop.',
      ],
      questions: [
        { q: 'Where is Nour from?', a: '*C*asablanca.' },
        { q: 'Name three skills Nour learned.', a: 'Capitalizing names, choosing a/an, using commas.' },
        { q: 'Find the parallel list and the compound sentence.', a: 'List: read, write, practice · Compound: “Learning is slow, but I am proud…”.' },
      ],
      tip: 'Capitals, articles, tenses, FANBOYS, commas, parallel lists — one paragraph, every rule.',
      tipAr: 'حروف كبيرة، أدوات، أزمنة، عطف، فواصل، قوائم متوازية — فقرة واحدة بكل القواعد.',
    },
    homework: [
      { en: 'Write a 5-sentence paragraph about yourself', ar: 'اكتب فقرة من ٥ جمل عن نفسك' },
      { en: 'Include one compound and one complex sentence', ar: 'ضمّنها جملة مركّبة وأخرى معقّدة' },
      { en: 'Use a/an/the and one parallel list, then edit it', ar: 'استعمل a/an/the وقائمة متوازية ثم دقّقها' },
    ],
    editing: {
      wrong: [
        'my friend and i study english every day.',
        'we read write and we speak in class.',
        'when the lesson ends we go home and we rest.',
      ],
      correct: [
        '*M*y friend and *I* study *E*nglish every day.',
        'We *read*, *write*, and *speak* in class.',
        '*W*hen the lesson ends*,* we go home *and* rest.',
      ],
    },
  },

  /* ─────────────────────────── 3 · END PUNCTUATION ─────────────────────────── */
  {
    no: 3, tag: 'End Punctuation', tagAr: 'علامات النهاية',
    title: 'End Punctuation — . ? !',
    titleAr: 'علامات نهاية الجملة — . ؟ !',
    objectives: [
      { en: 'End a statement with a period (.)', ar: 'إنهاء الخبر بنقطة' },
      { en: 'End a question with a question mark (?)', ar: 'إنهاء السؤال بعلامة استفهام' },
      { en: 'Show strong feeling with (!)', ar: 'التعبير عن انفعال قوي بعلامة تعجّب' },
      { en: 'Start the next sentence with a capital', ar: 'بدء الجملة التالية بحرف كبير' },
    ],
    rule: {
      en: 'Every sentence ends with one mark: a *period* (.) for a statement, a *question mark* (?) for a question, an *exclamation mark* (!) for strong feeling.',
      ar: 'كل جملة تنتهي بعلامة واحدة: نقطة للخبر، وعلامة استفهام للسؤال، وعلامة تعجّب للانفعال القوي.',
    },
    explain: {
      intro: 'The end mark tells the reader that the sentence is finished and what kind it is. Without it, sentences run into each other.',
      introAr: 'علامة النهاية تُخبر القارئ أن الجملة انتهت وما نوعها. وبدونها تتداخل الجمل.',
      points: [
        { en: 'Statement → *.* : I live in Rabat*.*', ar: 'الخبر ← نقطة' },
        { en: 'Question → *?* : Where do you live*?*', ar: 'السؤال ← علامة استفهام' },
        { en: 'Strong feeling → *!* : Be careful*!*', ar: 'الانفعال ← علامة تعجّب' },
        { en: 'Then ONE space and a *Capital* for the next sentence', ar: 'ثم مسافة واحدة وحرف كبير' },
        { en: 'Indirect questions take a *full stop*, not “?”: I asked where he lives*.*', ar: 'السؤال غير المباشر ينتهي بنقطة لا بعلامة استفهام' },
        { en: 'One *!* is strong; *!!!* is not stronger — it looks unprofessional. Never use it in a formal email.', ar: 'علامة تعجّب واحدة قوية، وتكرارها يضعفك — ولا تُستعمل في الإيميل الرسمي' },
      ],
    },
    examples: [
      { en: 'I am a teacher*.*', ar: 'أنا معلّم.', why: 'A finished statement takes a full stop — it tells the reader the idea is complete.', whyAr: 'الخبر المكتمل ينتهي بنقطة تُعلم القارئ أن الفكرة تمّت.' }, { en: 'She works in a bank*.*', ar: 'تعمل في بنك.', why: 'Same rule for any statement, however long: one idea, one full stop.', whyAr: 'القاعدة نفسها لأي خبر مهما طال: فكرة واحدة ونقطة واحدة.' },
      { en: 'Do you speak English*?*', ar: 'هل تتحدّث الإنجليزية؟', why: '*Do* opens a real question, so the sentence must close with *?*.', whyAr: 'Do تفتح سؤالًا حقيقيًا فتُختم الجملة بعلامة استفهام.' }, { en: 'Where is the station*?*', ar: 'أين المحطة؟', why: 'A *wh-* word also asks, so the mark is *?* even without *do*.', whyAr: 'أدوات الاستفهام تسأل أيضًا فالعلامة ؟ ولو بلا do.' },
      { en: 'What time is it*?*', ar: 'كم الساعة؟', why: 'Still a question: the mark follows the MEANING, not the word order.', whyAr: 'ما زال سؤالًا؛ العلامة تتبع المعنى لا ترتيب الكلمات.' }, { en: 'Be careful*!*', ar: 'انتبه!', why: 'A warning carries strong feeling, so *!* is earned here.', whyAr: 'التحذير يحمل انفعالًا قويًا فتُستحقّ علامة التعجّب.' },
      { en: 'What a beautiful day*!*', ar: 'يا له من يوم جميل!', why: '*What a…* is an exclamation by design — it never takes a full stop.', whyAr: 'صيغة What a تعجّبية بطبيعتها فلا تأخذ نقطة.' }, { en: 'I passed the exam*!*', ar: 'نجحت في الامتحان!', why: 'Good news, genuine feeling — this is what *!* is actually for.', whyAr: 'خبر سارّ وانفعال صادق، وهذا هو موضع علامة التعجّب.' },
      { en: 'He is my brother*.*', ar: 'هو أخي.', why: 'A calm statement of fact: no feeling, so no *!*.', whyAr: 'خبر هادئ بلا انفعال فلا علامة تعجّب.' }, { en: 'Are you ready*?*', ar: 'هل أنت مستعد؟', why: '*Are* at the front signals a yes/no question → *?*.', whyAr: 'تقديم Are علامة على سؤال نعم/لا.' },
      { en: 'Please sit down*.*', ar: 'اجلس من فضلك.', why: '*Please* makes it polite, but it is still an instruction, so a full stop.', whyAr: 'please تجعله مهذّبًا لكنه يبقى أمرًا فينتهي بنقطة.' }, { en: 'Help*!*', ar: 'النجدة!', why: 'One word can be a whole sentence when the feeling is complete.', whyAr: 'الكلمة الواحدة قد تكون جملة كاملة إذا اكتمل الانفعال.' },
      { en: 'Can you help me*?*', ar: 'هل يمكنك مساعدتي؟', why: '*Can you…* asks rather than orders, so the polite request takes *?*.', whyAr: 'Can you تسأل ولا تأمر فيأخذ الطلب المهذّب ؟' }, { en: 'We won the match*!*', ar: 'فزنا بالمباراة!', why: 'Compare with number 9: same grammar, different feeling, different mark.', whyAr: 'قارنها بالمثال ٩: القواعد نفسها والانفعال مختلف فاختلفت العلامة.' },
    ],
    exercises: [
      { q: 'Add the mark: “Where do you work”', a: 'Where do you work*?*' },
      { q: 'Add the mark: “I love this city”', a: 'I love this city*.*' },
      { q: 'Add the mark (danger): “Watch out”', a: 'Watch out*!*' },
      { q: '. or ? : “Is she your sister”', a: 'Is she your sister*?*' },
      { q: 'Fix: “i am tired where is my bed”', a: '*I* am tired*.* *W*here is my bed*?*' },
    ],
    reading: {
      title: 'Moving Day', titleAr: 'يوم الانتقال',
      passage: [
        'Today is a big day*!*',
        'We are moving to a new house*.*',
        '“Where are the boxes*?*” my mother asks.',
        'I carry them to the car one by one*.*',
        'What a busy morning it is*!*',
      ],
      questions: [
        { q: 'How does the writer feel about the day?', a: 'Excited (“a big day!”, “What a busy morning!”).' },
        { q: 'Find the question in the passage.', a: '“Where are the boxes?”' },
        { q: 'Why does line 1 end with “!”?', a: 'It shows *strong feeling*.' },
      ],
      tip: 'statement . · question ? · strong feeling !',
      tipAr: 'الخبر نقطة · السؤال استفهام · الانفعال تعجّب.',
    },
    homework: [
      { en: 'Write 3 statements, 3 questions, and 3 exclamations', ar: 'اكتب ٣ من كل نوع' },
      { en: 'Punctuate a short dialogue you write', ar: 'ضع العلامات في حوار قصير' },
      { en: 'Copy a paragraph and mark every end punctuation', ar: 'انسخ فقرة وحدّد علامات النهاية' },
    ],
    editing: {
      wrong: [
        'where do you live',
        'i live in fes it is a beautiful city',
        'what a great place',
      ],
      correct: [
        '*W*here do you live*?*',
        '*I* live in Fes*.* *I*t is a beautiful city*.*',
        '*W*hat a great place*!*',
      ],
    },
  },

  /* ─────────────────────────── 5 · APOSTROPHES ─────────────────────────── */
  {
    no: 5, tag: 'Apostrophes', tagAr: 'الفاصلة العليا',
    title: 'Apostrophes — contractions & possession',
    titleAr: 'الفاصلة العليا — الاختصار والمِلكية',
    objectives: [
      { en: 'Use an apostrophe to shorten (I’m)', ar: 'استخدامها للاختصار' },
      { en: 'Show possession with ’s (Sara’s book)', ar: 'إظهار المِلكية بـ ’s' },
      { en: 'Place ’s or s’ for one vs many owners', ar: 'المفرد والجمع في المِلكية' },
      { en: 'Never confuse its / it’s', ar: 'عدم الخلط بين its و it’s' },
    ],
    rule: {
      en: 'An apostrophe (’) does two jobs: it *shortens* (do not → don’t) and it shows *possession* (Sara → Sara’s book).',
      ar: 'الفاصلة العليا لها وظيفتان: الاختصار (do not → don’t)، وبيان المِلكية (Sara’s book).',
    },
    explain: {
      intro: 'Two words become one with an apostrophe, and it also shows who owns something. Keep “its” and “it’s” separate.',
      introAr: 'تدمج الفاصلة العليا كلمتين في واحدة، وتبيّن أيضًا المالك. وافصل بين its و it’s.',
      points: [
        { en: 'Contraction — it marks the *missing letters*: I am → *I’m* · do not → *don’t*', ar: 'الاختصار: تشير إلى الحروف المحذوفة' },
        { en: 'One owner: the boy*’s* ball · a name ending in s: James*’s* car', ar: 'مالك مفرد — وحتى المنتهي بـ s' },
        { en: 'Many owners already ending in s: the boys*’* ball (apostrophe *after* the s)', ar: 'مالكون جمع منتهٍ بـ s: الفاصلة بعد الـ s' },
        { en: 'Irregular plurals take *’s*: the child*ren’s* room · the *men’s* team', ar: 'الجموع الشاذة تأخذ ’s' },
        { en: '*its* = belongs to it · *it’s* = it is. Test: can you say “it is”? Then use *it’s*.', ar: 'its ملكية و it’s = it is — جرّب فكّها' },
        { en: 'NEVER for plain plurals ✗: “three car*’s*” — an apostrophe never makes a plural', ar: 'ممنوعة في الجمع العادي — الفاصلة العليا لا تصنع جمعًا أبدًا' },
      ],
    },
    examples: [
      { en: 'I*’m* happy. (I am)', ar: 'أنا سعيد.', why: 'The apostrophe sits exactly where the missing letter was: I *a*m.', whyAr: 'الفاصلة تقف مكان الحرف المحذوف تمامًا.' }, { en: 'don*’t* (do not)', ar: 'لا (نفي)', why: '*do not* loses the *o*, and the apostrophe marks the gap.', whyAr: 'في don’t حُذفت o ووضعت الفاصلة مكانها.' },
      { en: 'can*’t* (cannot)', ar: 'لا يستطيع', why: '*cannot* loses *no* — one apostrophe can replace two letters.', whyAr: 'الفاصلة الواحدة قد تنوب عن حرفين.' }, { en: 'She*’s* a doctor. (She is)', ar: 'هي طبيبة.', why: 'Careful: this *’s* is *is*, not possession. Context tells you which.', whyAr: 'انتبه: هذه ’s تعني is لا الملكية، والسياق يفصل.' },
      { en: 'Sara*’s* book', ar: 'كتاب سارة', why: 'Now it IS possession — one owner, so *’s* after the name.', whyAr: 'هنا ملكية: مالك مفرد فـ ’s بعد الاسم.' }, { en: 'the teacher*’s* desk', ar: 'مكتب المعلّم', why: 'The apostrophe goes after the OWNER, never after the thing owned.', whyAr: 'الفاصلة بعد المالك لا بعد المملوك.' },
      { en: 'my brother*’s* car', ar: 'سيارة أخي', why: 'Two words, one owner: the *’s* attaches to *brother*, the owner.', whyAr: 'مالك واحد فتلتصق ’s بالمالك.' }, { en: 'the students*’* classroom', ar: 'قاعة الطلاب (جمع)', why: 'Plural owners already ending in *s* → the apostrophe goes AFTER it.', whyAr: 'الجمع المنتهي بـ s تأتي الفاصلة بعده.' },
      { en: 'the boys*’* team', ar: 'فريق الأولاد (جمع)', why: 'Same rule: many boys own one team, so the apostrophe follows the *s*.', whyAr: 'القاعدة نفسها: مالكون كُثر فالفاصلة بعد s.' }, { en: 'It*’s* raining. (It is)', ar: 'إنها تمطر.', why: '*It’s* unpacks to *it is* — that is the test, every single time.', whyAr: 'it’s تُفكّ إلى it is، وهذا هو الاختبار دائمًا.' },
      { en: 'The dog wags *its* tail.', ar: 'يهز الكلب ذيله.', why: '*its* is possessive and takes NO apostrophe — like *his* and *hers*.', whyAr: 'its ملكية بلا فاصلة مثل his و hers.' }, { en: 'You*’re* right. (You are)', ar: 'أنت محق.', why: '*You’re* = you are. If it will not unpack, it is the wrong word.', whyAr: 'you’re = you are، فإن لم تُفكّ فالكلمة خاطئة.' },
      { en: 'We*’re* ready. (We are)', ar: 'نحن مستعدون.', why: '*We’re* = we are — the apostrophe replaces the missing *a*.', whyAr: 'الفاصلة تحلّ محلّ a المحذوفة.' }, { en: 'Omar*’s* phone', ar: 'هاتف عمر', why: 'Back to possession: a name plus *’s* is the commonest pattern of all.', whyAr: 'عودة إلى الملكية: اسم + ’s أشيع الأنماط.' },

      /* now in a sentence — a writing course has to show the rule working */
      { en: '*It’s* been a long week, and the team *hasn’t* finished *its* report.', ar: 'كان أسبوعًا طويلًا ولم ينهِ الفريق تقريره.', why: '*It’s* = it has · *its* = belongs to it. Both here, one apostrophe apart.', whyAr: 'it’s اختصار و its ملكية، وهما هنا معًا.' },
      { en: '✗ The car lost it’s wheel. → ✓ The car lost *its* wheel.', ar: 'الخطأ الأشهر', why: 'If *it is* or *it has* does not fit, the apostrophe is wrong.', whyAr: 'إن لم تصحّ it is أو it has فالفاصلة خطأ.' },
      { en: 'The *students’* results and the *teacher’s* comments arrived together.', ar: 'نتائج الطلاب وملاحظات المعلّم وصلت معًا.', why: 'Plural owner → apostrophe after the s. Singular owner → before it.', whyAr: 'المالك الجمع بعد s والمفرد قبلها.' },
      { en: '✗ I bought three book’s. → ✓ I bought three *books*.', ar: 'الفاصلة لا تصنع جمعًا', why: 'An apostrophe never makes a plural — only contraction or possession.', whyAr: 'الفاصلة العليا للاختصار والملكية فقط.' },
    ],
    exercises: [
      { q: 'Contract: “I am not tired.”', a: '*I’m* not tired.' },
      { q: 'Possession: “the bag of Sara”', a: 'Sara*’s* bag' },
      { q: 'its or it’s: “___ cold, and the cat lost ___ toy.”', a: '*It’s* cold, and the cat lost *its* toy.' },
      { q: 'your or you’re: “___ late! Is this ___ pen?”', a: '*You’re* late! Is this *your* pen?' },
      { q: 'Many owners: “the room of the girls”', a: 'the girls*’* room' },
    ],
    reading: {
      title: 'At Sara’s House', titleAr: 'في بيت سارة',
      passage: [
        'It*’s* Friday, and I*’m* at Sara*’s* house.',
        'Sara*’s* mother is a teacher, and she*’s* very kind.',
        '“Don*’t* forget your notebook,” she says.',
        'We*’re* studying for tomorrow*’s* test.',
        'The students*’* project is due on Monday.',
      ],
      questions: [
        { q: 'Whose house is it?', a: 'Sara*’s*.' },
        { q: 'What does Sara’s mother do?', a: 'She*’s* a teacher.' },
        { q: 'Why is there an apostrophe after the s in “students’”?', a: 'There are *many* owners (plural).' },
      ],
      tip: '’ shortens (I’m) and shows owning (Sara’s).',
      tipAr: 'الفاصلة العليا تختصر وتبيّن المِلكية.',
    },
    homework: [
      { en: 'Write 5 contractions with their full forms', ar: 'اكتب ٥ اختصارات مع أصولها' },
      { en: 'Write 4 possessive phrases (one owner & many owners)', ar: 'اكتب ٤ عبارات مِلكية' },
      { en: 'Write 2 sentences using its and it’s correctly', ar: 'اكتب جملتين بـ its و it’s' },
    ],
    editing: {
      wrong: [
        'Its a cold day, and the dog wants it’s bone.',
        'Your late! Is this you’re pen?',
        'The dog’s were playing in the girls garden.',
      ],
      correct: [
        '*It’s* a cold day, and the dog wants *its* bone.',
        '*You’re* late! Is this *your* pen?',
        'The *dogs* were playing in the girls*’* garden.',
      ],
    },
  },

  /* ─────────────────────────── 6 · PLURALS ─────────────────────────── */
  {
    no: 6, tag: 'Plurals', tagAr: 'الجمع',
    title: 'Nouns — Singular & Plural',
    titleAr: 'الأسماء — المفرد والجمع',
    objectives: [
      { en: 'Add -s to make most nouns plural', ar: 'إضافة -s لمعظم الأسماء' },
      { en: 'Add -es after s, x, ch, sh', ar: 'إضافة -es بعد s,x,ch,sh' },
      { en: 'Change consonant + y → -ies', ar: 'تحويل y إلى ies' },
      { en: 'Learn common irregular plurals', ar: 'تعلّم الجموع الشاذة' },
    ],
    rule: {
      en: 'Most nouns add *-s* (book → book*s*). Add *-es* after s, x, ch, sh (box → box*es*). A consonant + y becomes *-ies* (city → cit*ies*).',
      ar: 'معظم الأسماء تأخذ -s. ونضيف -es بعد s,x,ch,sh. وحرف ساكن + y يصبح -ies.',
    },
    explain: {
      intro: 'Plurals are a frequent writing mistake in Arabic speakers’ English. Learn the four patterns and the common exceptions.',
      introAr: 'الجمع خطأ شائع في كتابة الناطقين بالعربية. تعلّم الأنماط الأربعة والاستثناءات.',
      points: [
        { en: 'Most: cat → cat*s*', ar: 'الأغلب: -s' },
        { en: 'After s/x/z/ch/sh: box → box*es*', ar: 'بعد s,x,z,ch,sh: -es' },
        { en: 'consonant + y: city → cit*ies* · but vowel + y: b*oy*s (no change)', ar: 'ساكن + y ← ies · لكن علّة + y تبقى s' },
        { en: 'Irregular: man → *men* · child → *children* · foot → *feet* · person → *people*', ar: 'شاذة: تتغيّر الكلمة نفسها' },
        { en: 'Some never change: one *sheep*, two *sheep* · *fish* · *information* (uncountable)', ar: 'بعضها لا يتغيّر، وبعضها لا يُعدّ أصلًا' },
        { en: 'Arabic trap: after a number, English *always* pluralizes — five *books*, not five book ✗', ar: 'فخّ العربية: بعد العدد تُجمع الكلمة دائمًا في الإنجليزية' },
      ],
    },
    spelling: [
      { rule: 'Most nouns → add *-s*', ar: 'الأغلب ← -s', examples: 'book → books · car → cars · apple → apples' },
      { rule: 'After s, x, ch, sh → add *-es*', ar: 'بعد s,x,ch,sh ← -es', examples: 'bus → buses · box → boxes · watch → watches · dish → dishes' },
      { rule: 'Consonant + y → *-ies*', ar: 'ساكن + y ← -ies', examples: 'city → cities · baby → babies · country → countries' },
      { rule: 'Ends in -f / -fe → *-ves*', ar: 'ينتهي بـ f/fe ← -ves', examples: 'knife → knives · leaf → leaves · wife → wives' },
      { rule: 'Irregular — learn them', ar: 'شاذّة تُحفَظ', examples: 'man → men · woman → women · child → children · foot → feet · tooth → teeth · person → people' },
    ],
    examples: [
      { en: 'book → book*s*', ar: 'كتب', why: 'The default: just add *-s*. Every other rule below is an exception.', whyAr: 'الأصل إضافة s، وما بعده استثناءات.' }, { en: 'car → car*s*', ar: 'سيارات', why: 'Same default — most English nouns behave this way.', whyAr: 'الأصل نفسه؛ أغلب الأسماء هكذا.' }, { en: 'apple → apple*s*', ar: 'تفاحات', why: 'Still the default, even when the word ends in a vowel.', whyAr: 'الأصل نفسه ولو انتهت الكلمة بحرف علّة.' },
      { en: 'box → box*es*', ar: 'صناديق', why: '*x* is a hissing sound, so a bare *s* is unsayable → *-es* adds a syllable.', whyAr: 'x صوت صفيري فيتعذّر نطق s وحدها فتُضاف es.' }, { en: 'bus → bus*es*', ar: 'حافلات', why: '*s* + *s* cannot be pronounced, which is exactly why *-es* exists.', whyAr: 'لا يمكن نطق s بعد s، ولهذا وُجدت es.' }, { en: 'watch → watch*es*', ar: 'ساعات', why: '*ch* hisses too — say *watchs* aloud and you will hear the problem.', whyAr: 'ch صفيرية أيضًا، وانطق watchs لتسمع المشكلة.' },
      { en: 'dish → dish*es*', ar: 'أطباق', why: '*sh* is the fourth hissing sound in this family.', whyAr: 'sh رابع الأصوات الصفيرية في هذه العائلة.' }, { en: 'city → cit*ies*', ar: 'مدن', why: 'Consonant + *y* → *-ies*: English will not put *y* directly before *s*.', whyAr: 'ساكن + y تصير ies؛ الإنجليزية لا تضع y قبل s.' }, { en: 'baby → bab*ies*', ar: 'أطفال رضّع', why: '*b* before the *y*, so the same change applies.', whyAr: 'ساكن قبل y فينطبق التغيير نفسه.' },
      { en: 'country → countr*ies*', ar: 'دول', why: '*r* is a consonant — check the letter BEFORE the y, not the y itself.', whyAr: 'انظر إلى الحرف قبل y لا إلى y نفسها.' }, { en: 'man → *men*', ar: 'رجال', why: 'Irregular: the WORD changes, not the ending. These must be memorised.', whyAr: 'الشاذّ يغيّر الكلمة لا النهاية، وتُحفظ حفظًا.' }, { en: 'woman → *women*', ar: 'نساء', why: 'Same vowel change as *man* — note it is spelled *women* but said /wɪmɪn/.', whyAr: 'التغيير نفسه، وانتبه إلى اختلاف النطق عن الكتابة.' },
      { en: 'child → *children*', ar: 'أطفال', why: 'An old plural ending that survives in only a few words.', whyAr: 'نهاية جمع قديمة بقيت في كلمات قليلة.' }, { en: 'foot → *feet*', ar: 'أقدام', why: 'The vowel changes inside the word: *oo* → *ee*.', whyAr: 'يتغيّر حرف العلّة داخل الكلمة.' }, { en: 'tooth → *teeth*', ar: 'أسنان', why: 'The same *oo* → *ee* pattern. Learn the pair together.', whyAr: 'النمط نفسه، فاحفظ الزوجين معًا.' },
      { en: 'person → *people*', ar: 'أشخاص', why: 'A completely different word — and *peoples* means nations, not persons.', whyAr: 'كلمة مختلفة تمامًا، و peoples تعني شعوبًا.' },

      /* now in a sentence — a writing course has to show the rule working */
      { en: 'Three *children* were playing with two *dogs* in the street.', ar: 'كان ثلاثة أطفال يلعبون مع كلبين.', why: 'Irregular and regular plural side by side — after a number, both must be plural.', whyAr: 'جمع شاذّ وآخر منتظم معًا، وبعد العدد يُجمع كلاهما.' },
      { en: '✗ five book → ✓ five *books*', ar: 'الفخّ العربي', why: 'English pluralises after every number. Arabic does not, which is why this slips.', whyAr: 'الإنجليزية تجمع بعد كل عدد بخلاف العربية.' },
      { en: 'The *people* in these two *cities* speak three *languages*.', ar: 'سكان هاتين المدينتين يتحدّثون ثلاث لغات.', why: '*people* is already plural; *cities* takes -ies; *languages* takes plain -s.', whyAr: 'people جمع أصلًا، و cities بـ ies، و languages بـ s.' },
      { en: 'I need some *information* and two *pieces* of *advice*.', ar: 'أحتاج معلومات ونصيحتين.', why: '*information* and *advice* never take -s — you count them with *pieces*.', whyAr: 'لا تُجمعان أبدًا، وتُعدّان بكلمة pieces.' },
      { en: 'My *feet* hurt because these *shoes* are too small.', ar: 'قدماي تؤلماني لأن هذا الحذاء ضيّق.', why: 'One irregular plural, one regular — and the verb follows each.', whyAr: 'جمع شاذّ وآخر منتظم، والفعل يتبع كلًّا منهما.' },
    ],
    exercises: [
      { q: 'Plural: “three (box)”', a: 'three box*es*' },
      { q: 'Plural: “two (city)”', a: 'two cit*ies*' },
      { q: 'Plural: “five (child)”', a: 'five *children*' },
      { q: 'Plural: “many (bus)”', a: 'many bus*es*' },
      { q: 'Fix: “I have two foots.”', a: 'I have two *feet*.' },
    ],
    reading: {
      title: 'At the Market', titleAr: 'في السوق',
      passage: [
        'On Saturdays, the market is full of people.',
        'I buy tomatoes, potatoes, and two boxes of dates.',
        'Three women sell fresh dishes of food.',
        'Children run happily between the shops.',
        'I carry my heavy bags home on my tired feet.',
      ],
      questions: [
        { q: 'When is the market full?', a: 'On Saturdays.' },
        { q: 'Find two irregular plurals in the passage.', a: 'people, women, children, feet.' },
        { q: 'What is the plural of “box” here?', a: 'boxes.' },
      ],
      tip: '-s · -es (s,x,ch,sh) · y→ies · irregular: men, children, feet.',
      tipAr: '-s · -es · y→ies · شاذة: men, children, feet.',
    },
    homework: [
      { en: 'Write the plural of 10 nouns', ar: 'اكتب جمع ١٠ أسماء' },
      { en: 'Write 3 sentences using irregular plurals', ar: 'اكتب ٣ جمل بالجموع الشاذة' },
      { en: 'Find 5 plural nouns in a text you read', ar: 'اعثر على ٥ أسماء جمع في نص' },
    ],
    editing: {
      wrong: [
        'I saw three childs and two mans.',
        'She bought two boxs of tomatos.',
        'The citys have many buss.',
      ],
      correct: [
        'I saw three *children* and two *men*.',
        'She bought two *boxes* of *tomatoes*.',
        'The *cities* have many *buses*.',
      ],
    },
  },

  /* ─────────────────────────── 9 · SUBJECT–VERB AGREEMENT ─────────────────────────── */
  {
    no: 10.9, cefr: 'A2', tag: 'Agreement', tagAr: 'التطابق',
    title: 'Subject–Verb Agreement',
    titleAr: 'تطابق الفاعل والفعل',
    objectives: [
      { en: 'Add -s to the verb with he/she/it', ar: 'إضافة -s مع المفرد الغائب' },
      { en: 'Use the base verb with I/you/we/they', ar: 'الفعل المجرّد مع الباقي' },
      { en: 'Match “to be” and “to have” to the subject', ar: 'مطابقة be و have' },
      { en: 'Keep agreement with names and nouns', ar: 'التطابق مع الأسماء' },
    ],
    rule: {
      en: 'In the present, a *singular* subject (he/she/it) takes a verb with *-s*: “She work*s*.” A *plural* subject takes the base verb: “They work.”',
      ar: 'في المضارع، الفاعل المفرد الغائب يأخذ فعلًا بـ -s، والفاعل الجمع يأخذ الفعل المجرّد.',
    },
    explain: {
      intro: 'The verb must match its subject. The classic error is dropping the -s with he/she/it, or adding it to plural subjects.',
      introAr: 'يجب أن يطابق الفعل فاعله. والخطأ الكلاسيكي إسقاط -s مع المفرد أو إضافتها للجمع.',
      points: [
        { en: 'he/she/it + verb*-s*: He read*s*, She go*es*', ar: 'المفرد الغائب ← -s' },
        { en: 'I/you/we/they + base verb: They read', ar: 'الباقي ← فعل مجرّد' },
        { en: 'to be: he *is* · they *are* · to have: she *has*', ar: 'be و have' },
        { en: 'A name = one person = singular: Sara like*s*…', ar: 'الاسم مفرد' },
      ],
    },
    form: {
      affirmative: [
        'I / You / We / They *work*. (base verb)',
        'He / She / It *works*. (verb + s)',
        'to be: he *is* · they *are* — to have: she *has* · we *have*',
      ],
      negative: [
        'I / They *don’t* work.',
        'He / She *doesn’t* work. (verb loses the -s)',
      ],
      question: [
        '*Do* you / they work?',
        '*Does* he / she work? (verb loses the -s)',
      ],
      note: 'A NAME is singular: “Sara *works*”, “My brother *has*…”. Two subjects joined by “and” are plural: “Sara and Omar *work*”.',
      noteAr: 'الاسم العلم مفرد: Sara works. وفاعلان بـ and جمعٌ: Sara and Omar work.',
    },
    examples: [
      { en: 'I work / You work / We work / They work.', ar: 'الفعل مجرّد.', why: 'Plural and *I/you* take the bare verb — no ending at all.', whyAr: 'الجمع و I/you تأخذ الفعل مجرّدًا.' },
      { en: 'He work*s* / She work*s* / It work*s*.', ar: 'الفعل بـ -s.', why: 'THE rule of the whole lesson: he/she/it adds *-s*. Nothing else does.', whyAr: 'قاعدة الدرس كلّه: he/she/it تضيف s وحدها.' },
      { en: 'She go*es* to school.', ar: 'تذهب إلى المدرسة.', why: 'After *o* the ending is *-es* so the word stays sayable.', whyAr: 'بعد o تُضاف es ليبقى النطق ممكنًا.' }, { en: 'He watch*es* TV.', ar: 'يشاهد التلفاز.', why: 'After a hissing sound (*ch*), *-es* again — the same family as plurals.', whyAr: 'بعد الصوت الصفيري تُضاف es كما في الجمع.' },
      { en: 'My brother like*s* football.', ar: 'يحب أخي كرة القدم.', why: 'A singular NOUN behaves exactly like *he* — the *-s* still appears.', whyAr: 'الاسم المفرد كـ he تمامًا فتظهر s.' }, { en: 'The baby cr*ies* at night.', ar: 'يبكي الرضيع ليلًا.', why: 'Consonant + *y* → *-ies*, the same spelling rule as plural nouns.', whyAr: 'ساكن + y تصير ies كقاعدة جمع الأسماء.' },
      { en: 'They play every day.', ar: 'يلعبون كل يوم.', why: '*They* is plural, so no ending. Compare with line 5 — one *s* is the difference.', whyAr: 'they جمع فلا نهاية؛ قارنها بالخامسة، والفرق s واحدة.' }, { en: 'Sara *has* a car.', ar: 'لدى سارة سيارة.', why: '*have* is irregular: it becomes *has*, not *haves*.', whyAr: 'have شاذّ فيصير has لا haves.' },
      { en: 'We *have* a plan.', ar: 'لدينا خطة.', why: '*we* is plural, so *have* stays as it is.', whyAr: 'we جمع فتبقى have كما هي.' }, { en: 'The sun rise*s* early.', ar: 'تشرق الشمس مبكرًا.', why: '*The sun* = *it*, so the *-s* appears even on a scientific fact.', whyAr: 'الشمس = it فتظهر s حتى في الحقيقة العلمية.' },
      { en: 'Birds fly south in winter.', ar: 'تطير الطيور جنوبًا.', why: '*Birds* is plural, so the verb stays bare — agreement follows the noun.', whyAr: 'birds جمع فيبقى الفعل مجرّدًا؛ التطابق يتبع الاسم.' }, { en: 'He does*n’t* work on Sunday.', ar: 'لا يعمل الأحد.', why: 'Negative: *doesn’t* has taken the *s*, so *work* must be bare.', whyAr: 'النفي: doesn’t أخذت s فيتجرّد الفعل.' },
      { en: 'They do*n’t* work at night.', ar: 'لا يعملون ليلًا.', why: '*don’t* for plural — the helper agrees, and the main verb never does twice.', whyAr: 'don’t للجمع؛ المساعد يطابق ولا يتكرّر التطابق مرّتين.' },
    ],
    exercises: [
      { q: 'Add -s?: “She (go) to work.”', a: 'She *goes* to work.' },
      { q: '“They (play) football.”', a: 'They *play* football.' },
      { q: 'Fix: “He go to school.”', a: 'He *goes* to school.' },
      { q: 'Fix: “My sister have a cat.”', a: 'My sister *has* a cat.' },
      { q: 'is/are: “The books ___ on the desk.”', a: 'The books *are* on the desk.' },
    ],
    reading: {
      title: 'A Family Morning', titleAr: 'صباح عائلي',
      passage: [
        'My family wakes up early every day.',
        'My father makes coffee, and my mother reads the news.',
        'My little sister brushes her teeth and packs her bag.',
        'We eat breakfast together, and then everyone leaves.',
        'The house becomes quiet, but the cat stays and sleeps.',
      ],
      questions: [
        { q: 'Who makes the coffee?', a: 'The father.' },
        { q: 'Why “brushes” with -s?', a: '“sister” = she (singular) → verb + s.' },
        { q: 'Find a plural subject and its verb.', a: '“We eat” (base verb).' },
      ],
      tip: 'he/she/it → verb + s · I/you/we/they → base verb.',
      tipAr: 'المفرد الغائب ← -s · الباقي ← مجرّد.',
    },
    homework: [
      { en: 'Write 3 singular (+s) and 3 plural sentences', ar: 'اكتب ٣ مفردة و٣ جمع' },
      { en: 'Correct 4 agreement mistakes you make', ar: 'صحّح ٤ أخطاء تطابق' },
      { en: 'Write about a friend using he/she + verb-s', ar: 'اكتب عن صديق بـ he/she + -s' },
    ],
    editing: {
      wrong: [
        'My brother go to the gym every day.',
        'She have two children.',
        'The students plays in the yard.',
      ],
      correct: [
        'My brother *goes* to the gym every day.',
        'She *has* two children.',
        'The students *play* in the yard.',
      ],
    },
  },

  /* ─────────────────────────── 11 · PREPOSITIONS ─────────────────────────── */
  {
    no: 11, tag: 'Prepositions', tagAr: 'حروف الجر',
    title: 'Prepositions of Time & Place — in, on, at',
    titleAr: 'حروف الجر للزمان والمكان — in / on / at',
    objectives: [
      { en: 'Use in/on/at for time', ar: 'استخدام in/on/at للزمان' },
      { en: 'Use in/on/at for place', ar: 'استخدام in/on/at للمكان' },
      { en: 'Choose by size and exactness', ar: 'الاختيار حسب الحجم والتحديد' },
      { en: 'Avoid common preposition errors', ar: 'تجنّب الأخطاء الشائعة' },
    ],
    rule: {
      en: 'Time: *in* months/years (in July), *on* days/dates (on Monday), *at* clock times (at 7). Place: *in* a city/country, *on* a street, *at* an exact point.',
      ar: 'للزمان: in مع الأشهر والسنوات، on مع الأيام، at مع الساعة. وللمكان: in مع المدينة/الدولة، on مع الشارع، at مع النقطة المحدّدة.',
    },
    explain: {
      intro: 'Think of size: big/general → in; a surface or a day → on; an exact point or time → at.',
      introAr: 'فكّر بالحجم: العام الكبير ← in، والسطح أو اليوم ← on، والنقطة أو الساعة المحدّدة ← at.',
      points: [
        { en: 'Time: *in* the morning · *on* Friday · *at* night / *at* 8', ar: 'الزمان' },
        { en: 'Place: *in* Rabat · *on* Hassan Street · *at* the door', ar: 'المكان' },
        { en: 'Big/general → *in* · surface/day → *on* · point → *at*', ar: 'القاعدة العامة' },
        { en: 'Careful: *at* night, but *in* the morning', ar: 'استثناء: at night' },
      ],
    },
    examples: [
      { en: '*in* July', ar: 'في يوليوز', why: '*in* for MONTHS — think of it as the biggest container.', whyAr: 'in للشهور، وتخيّلها الوعاء الأكبر.' }, { en: '*in* 2026', ar: 'في ٢٠٢٦', why: '*in* for YEARS too. Big blocks of time all take *in*.', whyAr: 'in للسنوات أيضًا؛ الكتل الزمنية الكبيرة تأخذ in.' }, { en: '*in* the morning', ar: 'في الصباح', why: '*in* for parts of the day — but note the exception two lines below.', whyAr: 'in لأجزاء اليوم، وانتبه للاستثناء بعد سطرين.' },
      { en: '*on* Monday', ar: 'يوم الاثنين', why: '*on* for DAYS — the middle-sized container.', whyAr: 'on للأيام، وهي الوعاء المتوسّط.' }, { en: '*on* 5 May', ar: 'في ٥ ماي', why: '*on* for DATES, because a date is a specific day.', whyAr: 'on للتواريخ لأن التاريخ يوم محدّد.' }, { en: '*at* 7 o’clock', ar: 'في السابعة', why: '*at* for CLOCK TIMES — the smallest, most precise container.', whyAr: 'at للساعات، وهي الوعاء الأدقّ.' },
      { en: '*at* night', ar: 'في الليل', why: 'THE exception: *at night*, not *in the night*. Memorise this one.', whyAr: 'الاستثناء: at night لا in the night، وتُحفظ.' }, { en: '*in* Morocco', ar: 'في المغرب', why: 'For PLACE, *in* means enclosed — a country has borders.', whyAr: 'للمكان: in تعني داخل حدود.' }, { en: '*in* Casablanca', ar: 'في الدار البيضاء', why: '*in* for cities too, for the same reason: you are inside them.', whyAr: 'in للمدن للسبب نفسه.' },
      { en: '*on* Hassan Street', ar: 'في شارع الحسن', why: '*on* for a STREET — you are on a surface, not inside a box.', whyAr: 'on للشارع لأنك على سطح لا داخل صندوق.' }, { en: '*at* the bus stop', ar: 'عند موقف الحافلة', why: '*at* for a POINT — a bus stop is a spot, not an area.', whyAr: 'at للنقطة؛ الموقف نقطة لا مساحة.' }, { en: '*at* home', ar: 'في البيت', why: '*at home* takes no article — a fixed phrase worth learning whole.', whyAr: 'at home بلا أداة، وهي عبارة ثابتة تُحفظ كاملة.' },
      { en: '*at* school', ar: 'في المدرسة', why: '*at school* means the activity, not the building — same for *at work*.', whyAr: 'at school تعني النشاط لا المبنى، وكذلك at work.' }, { en: '*on* the table', ar: 'على الطاولة', why: '*on* for a flat surface you can rest something upon.', whyAr: 'on للسطح المستوي الذي تضع عليه شيئًا.' }, { en: '*in* the box', ar: 'في الصندوق', why: '*in* for an enclosed space — the box has sides, the table does not.', whyAr: 'in للحيّز المغلق؛ الصندوق له جوانب والطاولة لا.' },

      /* now in a sentence — a writing course has to show the rule working */
      { en: 'The meeting is *on* Monday *at* nine *in* the morning.', ar: 'الاجتماع يوم الاثنين الساعة التاسعة صباحًا.', why: 'All three in one sentence: day → *on*, clock time → *at*, part of day → *in*.', whyAr: 'الثلاثة في جملة: اليوم on والساعة at وجزء اليوم in.' },
      { en: 'I was born *in* 1995 *in* a small town *in* Morocco.', ar: 'وُلدت عام ١٩٩٥ في بلدة صغيرة في المغرب.', why: '*in* for a year, a town and a country — the big containers, all three.', whyAr: 'in للسنة والبلدة والدولة: الأوعية الكبيرة.' },
      { en: 'He waited *at* the bus stop *on* Hassan Street *for* an hour.', ar: 'انتظر في الموقف بشارع الحسن ساعة.', why: 'Point → *at*, surface → *on*, duration → *for*.', whyAr: 'النقطة at والسطح on والمدّة for.' },
      { en: '✗ in Monday → ✓ *on* Monday · ✗ at July → ✓ *in* July', ar: 'أخطاء شائعة', why: 'Days always take *on*; months always take *in*. These two are worth memorising.', whyAr: 'الأيام on والشهور in، وهما يُحفظان.' },
      { en: 'Put the file *on* the desk, not *in* the drawer.', ar: 'ضع الملف على المكتب لا في الدرج.', why: '*on* is a surface you rest something upon; *in* is an enclosed space.', whyAr: 'on سطح تضع عليه، و in حيّز مغلق.' },
    ],
    exercises: [
      { q: 'in/on/at: “___ Monday”', a: '*on* Monday' },
      { q: 'in/on/at: “___ 9 o’clock”', a: '*at* 9 o’clock' },
      { q: 'in/on/at: “___ July”', a: '*in* July' },
      { q: 'Fill: “I live ___ Fes.”', a: 'I live *in* Fes.' },
      { q: 'Fill: “The keys are ___ the table.”', a: 'The keys are *on* the table.' },
    ],
    reading: {
      title: 'My Weekly Plan', titleAr: 'خطتي الأسبوعية',
      passage: [
        'I wake up *at* 6 o’clock *in* the morning.',
        '*On* Monday, I have an English class *in* the city center.',
        'The school is *on* Liberty Street, near the park.',
        '*In* the evening, I study quietly *at* home.',
        '*On* weekends, I relax *at* my grandmother’s house.',
      ],
      questions: [
        { q: 'What time does the writer wake up?', a: '*At* 6 (in the morning).' },
        { q: 'Where is the school?', a: '*On* Liberty Street.' },
        { q: 'Why “in the morning” but “at 6”?', a: 'part of the day → *in*; a clock time → *at*.' },
      ],
      tip: 'in (month/city) · on (day/street) · at (exact time/point).',
      tipAr: 'in للشهر/المدينة · on لليوم/الشارع · at للوقت/النقطة.',
    },
    homework: [
      { en: 'Write your daily schedule using in/on/at', ar: 'اكتب جدولك اليومي بـ in/on/at' },
      { en: 'Write 5 sentences about places using in/on/at', ar: 'اكتب ٥ جمل عن أماكن' },
      { en: 'Find 5 prepositions in a text you read', ar: 'اعثر على ٥ حروف جر في نص' },
    ],
    editing: {
      wrong: [
        'I have a meeting in Monday at the morning.',
        'She lives at Rabat on Palm Street.',
        'We will meet on 8 o’clock.',
      ],
      correct: [
        'I have a meeting *on* Monday *in* the morning.',
        'She lives *in* Rabat *on* Palm Street.',
        'We will meet *at* 8 o’clock.',
      ],
    },
  },

  /* ─────────────────────────── 12 · FRAGMENTS ─────────────────────────── */
  {
    no: 12, tag: 'Fragments', tagAr: 'الجملة الناقصة',
    title: 'The Simple Sentence & Fragments',
    titleAr: 'الجملة البسيطة والجملة الناقصة',
    objectives: [
      { en: 'Build a complete sentence: subject + verb', ar: 'بناء جملة كاملة: فاعل + فعل' },
      { en: 'Spot a fragment (incomplete sentence)', ar: 'اكتشاف الجملة الناقصة' },
      { en: 'Turn a fragment into a full sentence', ar: 'تحويل الناقصة إلى كاملة' },
      { en: 'Express one complete idea', ar: 'التعبير عن فكرة كاملة' },
    ],
    rule: {
      en: 'A sentence needs a *subject* + a *verb* and one *complete idea*: “Birds fly.” A *fragment* is missing a subject or a verb, so it is not a sentence.',
      ar: 'الجملة تحتاج فاعلًا + فعلًا وفكرة كاملة. والجملة الناقصة ينقصها الفاعل أو الفعل فليست جملة.',
    },
    explain: {
      intro: 'Before joining sentences, you must be able to write ONE complete sentence. A fragment leaves the reader waiting.',
      introAr: 'قبل ربط الجمل، يجب أن تكتب جملةً واحدة كاملة. والجملة الناقصة تترك القارئ منتظرًا.',
      points: [
        { en: 'Subject = who/what · Verb = the action/state', ar: 'فاعل + فعل' },
        { en: 'Complete: The dog *barks*. ✓', ar: 'كاملة' },
        { en: 'Fragment ✗: The dog. (no verb) / Barks. (no subject)', ar: 'ناقصة' },
        { en: 'Fragment ✗: Because I was late. (dependent clause alone)', ar: 'تابعة وحدها ناقصة' },
      ],
    },
    examples: [
      { en: 'Birds fly.', ar: 'تطير الطيور.', why: 'The smallest possible sentence: a subject and its verb. Nothing else is required.', whyAr: 'أصغر جملة ممكنة: فاعل وفعله، ولا يلزم غير ذلك.' }, { en: 'Sara reads.', ar: 'تقرأ سارة.', why: 'A name works as the subject just as well as a pronoun.', whyAr: 'الاسم يصلح فاعلًا كالضمير تمامًا.' },
      { en: 'The sun shines.', ar: 'تشرق الشمس.', why: '*The sun* is the subject; *shines* is the verb. Two parts, complete idea.', whyAr: 'فاعل وفعل: جزءان وفكرة كاملة.' }, { en: 'I am tired.', ar: 'أنا متعب.', why: 'With *be*, the sentence still has both parts — the verb is *am*.', whyAr: 'مع فعل الكينونة يبقى الجزءان، والفعل هو am.' },
      { en: 'The children play.', ar: 'يلعب الأطفال.', why: 'A plural subject changes nothing about completeness.', whyAr: 'الفاعل الجمع لا يغيّر شيئًا في اكتمال الجملة.' }, { en: 'Water boils.', ar: 'يغلي الماء.', why: 'Even a scientific fact needs the same two parts.', whyAr: 'حتى الحقيقة العلمية تحتاج الجزأين نفسيهما.' },
      { en: 'My phone rang.', ar: 'رنّ هاتفي.', why: 'Past tense does not change the requirement: subject plus verb.', whyAr: 'الماضي لا يغيّر الشرط: فاعل وفعل.' }, { en: 'We won.', ar: 'فزنا.', why: 'Two words, and it is complete — length has nothing to do with it.', whyAr: 'كلمتان وتمّت الجملة؛ الطول لا علاقة له بالاكتمال.' },
      { en: 'Fragment ✗: In the morning.', ar: 'ناقصة (لا فاعل ولا فعل).', why: 'No subject and no verb — this is a PHRASE, however meaningful it feels.', whyAr: 'لا فاعل ولا فعل، فهذه عبارة لا جملة مهما بدت ذات معنى.' },
      { en: 'Fixed: I run in the morning.', ar: 'أركض في الصباح.', why: 'Adding a subject and a verb turns the phrase into a sentence.', whyAr: 'بإضافة الفاعل والفعل تصير العبارة جملة.' },
      { en: 'Fragment ✗: Because it rained.', ar: 'ناقصة (تابعة وحدها).', why: '*Because* makes the clause DEPENDENT — it now needs a main clause to lean on.', whyAr: 'because تجعل الجملة تابعة تحتاج جملة رئيسية تستند إليها.' },
      { en: 'Fixed: We stayed home because it rained.', ar: 'بقينا لأنها أمطرت.', why: 'The main clause arrives, so the dependent clause finally has something to attach to.', whyAr: 'جاءت الجملة الرئيسية فوجدت التابعة ما تتعلّق به.' },
      { en: 'Fragment ✗: The tall man near the door.', ar: 'ناقصة (لا فعل).', why: 'A long noun phrase is still not a sentence — there is no verb anywhere.', whyAr: 'العبارة الاسمية الطويلة ليست جملة لغياب الفعل.' },
      { en: 'Fixed: The tall man near the door smiled.', ar: 'ابتسم الرجل الطويل.', why: 'One verb (*smiled*) repairs the whole thing. Length was never the issue.', whyAr: 'فعل واحد يصلح كل شيء؛ لم تكن المشكلة في الطول.' },
    ],
    exercises: [
      { q: 'Sentence or fragment? “The little cat.”', a: 'Fragment (no verb).' },
      { q: 'Sentence or fragment? “She sings.”', a: 'Sentence (subject + verb).' },
      { q: 'Fix: “Running to the bus.”', a: 'I was *running to the bus*.' },
      { q: 'Fix: “Because I was hungry.”', a: 'I ate *because I was hungry*.' },
      { q: 'Add a subject: “___ opened the door.”', a: '*She* opened the door.' },
    ],
    reading: {
      title: 'A Quiet Evening', titleAr: 'مساء هادئ',
      passage: [
        'The evening is calm and cool.',
        'My father reads a book, and my mother waters the plants.',
        'The cat sleeps on the warm sofa.',
        'I finish my homework and close my notebook.',
        'Everyone feels relaxed and ready for sleep.',
      ],
      questions: [
        { q: 'What does the father do?', a: 'He reads a book.' },
        { q: 'Name the subject and verb in line 3.', a: 'subject: the cat · verb: sleeps.' },
        { q: 'Is “On the warm sofa” a sentence? Why not?', a: 'No — no subject or verb (a fragment).' },
      ],
      tip: 'subject + verb + one complete idea = a real sentence.',
      tipAr: 'فاعل + فعل + فكرة كاملة = جملة.',
    },
    homework: [
      { en: 'Write 5 complete sentences (underline subject & verb)', ar: 'اكتب ٥ جمل كاملة' },
      { en: 'Turn 3 fragments into full sentences', ar: 'حوّل ٣ جمل ناقصة إلى كاملة' },
      { en: 'Find 2 fragments in your own writing and fix them', ar: 'اعثر على جملتين ناقصتين وأصلحهما' },
    ],
    editing: {
      wrong: [
        'My best friend Omar. Lives in Tangier.',
        'Because the weather was nice.',
        'Running fast to catch the train.',
      ],
      correct: [
        'My best friend Omar *lives* in Tangier.',
        'We went out *because the weather was nice.*',
        '*I was* running fast to catch the train.',
      ],
    },
  },

  /* ─────────────────────────── 19 · TRANSITIONS ─────────────────────────── */
  {
    no: 19, tag: 'Transitions', tagAr: 'أدوات الربط',
    title: 'Transitions & Linking Words',
    titleAr: 'أدوات الربط بين الجمل',
    objectives: [
      { en: 'Connect ideas between sentences', ar: 'ربط الأفكار بين الجمل' },
      { en: 'Use however, therefore, for example', ar: 'استخدام however/therefore/for example' },
      { en: 'Add, contrast, and give reasons smoothly', ar: 'الإضافة والتضاد والتعليل بسلاسة' },
      { en: 'Punctuate a transition with a comma', ar: 'وضع فاصلة بعد أداة الربط' },
    ],
    rule: {
      en: 'Transitions link whole *sentences* and usually take a *comma*: “It was late*.* *However,* we kept working.”',
      ar: 'أدوات الربط تصل بين الجمل كاملةً وغالبًا تأخذ فاصلة بعدها.',
    },
    explain: {
      intro: 'A transition is a road sign: it tells the reader what is coming *before* they read it — more of the same, the opposite, a result, an example. Without signs, the reader has to re-read to find out where you turned. Note the punctuation: most transitions take a comma after them, and they are *not* the same as FANBOYS.',
      introAr: 'أداة الربط لافتة طريق: تخبر القارئ بما هو قادم قبل أن يقرأه — مزيد من الشيء نفسه، أو عكسه، أو نتيجة، أو مثال. وبلا لافتات يضطر القارئ لإعادة القراءة ليعرف أين انعطفت. وانتبه للترقيم: أغلبها تتبعها فاصلة، وهي ليست أدوات عطف.',
      points: [
        { en: 'Add: *also, · in addition, · moreover, · furthermore,*', ar: 'الإضافة' },
        { en: 'Contrast: *however, · on the other hand, · nevertheless,*', ar: 'التضاد' },
        { en: 'Result: *therefore, · as a result, · consequently,*', ar: 'النتيجة' },
        { en: 'Example: *for example, · for instance, · in particular,*', ar: 'التمثيل' },
        { en: 'Sequence & closing: *first, · then, · finally, · in short,*', ar: 'الترتيب والختام' },
        { en: '✗ “I studied hard*, however* I failed.” — *however* is NOT a FANBOYS. Use: “…hard*. However,* I failed.”', ar: 'however ليست أداة عطف — لا تربط بها جملتين بفاصلة' },
      ],
    },
    examples: [
      { en: 'I was tired*.* *However,* I finished.', ar: 'ومع ذلك أنهيت.', why: '*However* signals CONTRAST — and note it follows a full stop, not a comma.', whyAr: 'however للتضاد، وتأتي بعد نقطة لا بعد فاصلة.' },
      { en: 'She studied hard*.* *Therefore,* she passed.', ar: 'لذلك نجحت.', why: '*Therefore* signals RESULT. The comma after it is required.', whyAr: 'therefore للنتيجة، والفاصلة بعدها لازمة.' },
      { en: 'I like fruit*.* *For example,* I eat apples daily.', ar: 'مثلًا.', why: '*For example* introduces an illustration of the claim just made.', whyAr: 'for example تقدّم مثالًا على الادّعاء السابق.' },
      { en: 'The plan is good*.* *In addition,* it is cheap.', ar: 'بالإضافة.', why: '*In addition* adds a second point of the same kind.', whyAr: 'in addition تضيف نقطة ثانية من النوع نفسه.' },
      { en: 'It rained all day*.* *As a result,* the match stopped.', ar: 'نتيجةً لذلك.', why: '*As a result* also gives the outcome — a slightly heavier *therefore*.', whyAr: 'as a result تعطي النتيجة أيضًا وهي أثقل من therefore.' },
      { en: 'He is kind*.* *Moreover,* he is honest.', ar: 'علاوةً على ذلك.', why: '*Moreover* is the formal register of *also* — use it in essays.', whyAr: 'moreover هي الصيغة الرسمية لـ also.' },
      { en: 'You can walk*.* *On the other hand,* the bus is faster.', ar: 'من ناحية أخرى.', why: '*On the other hand* opens the second side of a comparison.', whyAr: 'on the other hand تفتح الجانب الثاني من المقارنة.' },
      { en: 'I woke up late*.* *Therefore,* I missed breakfast.', ar: 'لذلك فوّتّ الفطور.', why: 'Cause then consequence — *Therefore* makes the link explicit.', whyAr: 'السبب ثم النتيجة، و therefore تُظهر الرابط.' },
      { en: 'Reading helps you*.* *For instance,* it builds vocabulary.', ar: 'على سبيل المثال.', why: '*For instance* is interchangeable with *for example*.', whyAr: 'for instance مرادفة لـ for example.' },
      { en: 'The room was cold*.* *However,* nobody complained.', ar: 'ومع ذلك لم يشتكِ أحد.', why: 'THE key point: *However* is NOT a FANBOYS, so it cannot join with a comma.', whyAr: 'النقطة المفتاح: however ليست أداة عطف فلا تربط بفاصلة.' },
    ],
    exercises: [
      { q: 'Add (contrast): “I was sick. ___ I went to work.”', a: '…*However,* I went to work.' },
      { q: 'Add (result): “She trained daily. ___ she won.”', a: '…*Therefore,* she won.' },
      { q: 'Add (example): “I love sports. ___ I play tennis.”', a: '…*For example,* I play tennis.' },
      { q: 'Punctuate: “However I disagree.”', a: '*However,* I disagree.' },
      { q: 'Choose: “The bag is old. ___ it still works.”', a: '…*However,* it still works.' },
    ],
    reading: {
      title: 'Learning a Language', titleAr: 'تعلّم اللغة',
      passage: [
        'Learning a language takes time*.* *However,* it is worth the effort.',
        'You must practice every day*.* *For example,* read a short text each morning.',
        'Mistakes are normal*.* *In addition,* they help you learn.',
        'I practiced for a year*.* *As a result,* I can now write paragraphs.',
        'Never give up*.* *Therefore,* keep going step by step.',
      ],
      questions: [
        { q: 'Is learning a language worth it?', a: 'Yes — “it is worth the effort.”' },
        { q: 'What example of practice is given?', a: 'Read a short text each morning.' },
        { q: 'Which transition shows a result?', a: '*Therefore* / *As a result*.' },
      ],
      tip: 'however (contrast) · therefore (result) · for example (example) — comma after.',
      tipAr: 'however تضاد · therefore نتيجة · for example تمثيل — بعدها فاصلة.',
    },
    homework: [
      { en: 'Write 4 sentence pairs joined by transitions', ar: 'اكتب ٤ أزواج بأدوات الربط' },
      { en: 'Use however, therefore, for example once each', ar: 'استعمل كلًّا مرة' },
      { en: 'Add transitions to a short paragraph you wrote', ar: 'أضف أدوات الربط إلى فقرة' },
    ],
    editing: {
      wrong: [
        'I was late however I still finished.',
        'She is smart therefore she solves problems fast.',
        'I like tea for example I drink it daily.',
      ],
      correct: [
        'I was late*.* *However,* I still finished.',
        'She is smart*.* *Therefore,* she solves problems fast.',
        'I like tea*.* *For example,* I drink it daily.',
      ],
    },
  },

  /* ─────────────────────────── 21 · TOPIC SENTENCE ─────────────────────────── */
  {
    no: 21, tag: 'Paragraph', tagAr: 'الفقرة',
    title: 'The Paragraph & the Topic Sentence',
    titleAr: 'الفقرة والجملة الموضوعية',
    objectives: [
      { en: 'Know what a paragraph is', ar: 'معرفة ما الفقرة' },
      { en: 'Write a clear topic sentence', ar: 'كتابة جملة موضوعية واضحة' },
      { en: 'Keep one main idea per paragraph', ar: 'فكرة رئيسية واحدة لكل فقرة' },
      { en: 'Organize sentences around that idea', ar: 'تنظيم الجمل حول الفكرة' },
    ],
    rule: {
      en: 'A *paragraph* is a group of sentences about *one main idea*. The *topic sentence* (usually first) states that idea clearly.',
      ar: 'الفقرة مجموعة جمل حول فكرة رئيسية واحدة. والجملة الموضوعية (غالبًا الأولى) تُبيّن هذه الفكرة بوضوح.',
    },
    studio: {
      prompt: { en: 'Write ONE strong topic sentence for a paragraph about your city.', ar: 'اكتب جملةً موضوعيةً قوية لفقرةٍ عن مدينتك.' },
      model: {
        title: 'A Model Paragraph', titleAr: 'فقرة نموذجية',
        parts: [
          { role: 'topic', en: 'My city is a wonderful place to live.' },
          { role: 'support', en: 'It has green parks where families walk in the evening.' },
          { role: 'support', en: 'The people are friendly, and the markets are full of life.' },
          { role: 'conclusion', en: 'For all these reasons, I am proud of my city.' },
        ],
      },
      toolkit: [
        { group: 'Start a topic sentence', ar: 'بدايات الجملة الموضوعية', phrases: ['My favourite … is …', '… is a wonderful …', 'There are many reasons why …', '… has many benefits.'] },
      ],
      steps: [
        { en: 'Choose your topic (your city, your school, or a hobby).', ar: 'اختر موضوعك (مدينتك، مدرستك، أو هواية).' },
        { en: 'Write ONE sentence that clearly states your main idea.', ar: 'اكتب جملةً واحدة تُبيّن فكرتك الرئيسية بوضوح.' },
        { en: 'Check it is not too broad and not just a small fact.', ar: 'تأكّد أنها ليست فضفاضة ولا مجرّد تفصيل صغير.' },
      ],
      checklist: [
        { en: 'One clear main idea', ar: 'فكرة رئيسية واحدة واضحة' },
        { en: 'Not too general (“Cities.” ✗)', ar: 'ليست عامّة جدًا' },
        { en: 'A complete sentence: capital + period', ar: 'جملة كاملة: حرف كبير ونقطة' },
      ],
    },
    explain: {
      intro: 'Everything so far was one sentence at a time. From here you build *paragraphs* — and a paragraph is not a group of sentences about a subject; it is *one idea, developed*. The topic sentence is a promise to the reader, and every sentence after it must keep that promise.',
      introAr: 'كل ما سبق كان جملة جملة. من هنا تبني الفقرات — والفقرة ليست مجموعة جمل عن موضوع، بل فكرة واحدة مُطوَّرة. الجملة الموضوعية وعدٌ للقارئ، وكل جملة بعدها يجب أن توفي بهذا الوعد.',
      points: [
        { en: 'One paragraph = *one* main idea. A second idea = a second paragraph.', ar: 'فقرة = فكرة واحدة. الفكرة الثانية = فقرة ثانية.' },
        { en: 'The *topic sentence* states that idea in one clear sentence — usually first', ar: 'الجملة الموضوعية تذكر الفكرة في جملة واحدة واضحة — غالبًا في الأول' },
        { en: 'It needs an *opinion or angle*, not just a fact: “My city is beautiful” ✓ · “My city has 400,000 people” ✗', ar: 'تحتاج رأيًا أو زاوية لا مجرّد معلومة' },
        { en: 'Too broad ✗: “Morocco is interesting.” — a book, not a paragraph', ar: 'فضفاضة ✗: تصلح لكتاب لا لفقرة' },
        { en: 'Too narrow ✗: “I woke at seven.” — nothing left to develop', ar: 'ضيّقة ✗: لا شيء يبقى لتطويره' },
        { en: 'Test it: could you write 4–5 sentences that all serve this one sentence?', ar: 'اختبرها: هل تستطيع كتابة ٤–٥ جمل كلها تخدم هذه الجملة؟' },
      ],
    },
    examples: [
      { en: '*My city is a wonderful place to live.*', ar: 'مدينتي مكان رائع للعيش.', why: 'It states an OPINION you can develop — not a fact that ends the discussion.', whyAr: 'تذكر رأيًا يمكن تطويره لا حقيقة تُنهي النقاش.' },
      { en: '*Learning English changed my life.*', ar: 'تعلّم الإنجليزية غيّر حياتي.', why: '*changed my life* promises a story; the reader now expects the how.', whyAr: 'عبارة «غيّرت حياتي» تَعِد بقصّة، فينتظر القارئ الكيف.' },
      { en: '*Mornings are the best part of my day.*', ar: 'الصباح أفضل جزء من يومي.', why: 'A judgement (*the best part*) invites support — a plain fact would not.', whyAr: 'الحكم يستدعي الدعم، بخلاف المعلومة المجرّدة.' },
      { en: '*Reading has many benefits.*', ar: 'للقراءة فوائد كثيرة.', why: '*many benefits* announces that a list is coming, which controls the paragraph.', whyAr: 'عبارة «فوائد كثيرة» تُعلن قائمة قادمة فتتحكّم في الفقرة.' },
      { en: '*My grandmother is my favorite person.*', ar: 'جدتي شخصي المفضّل.', why: '*favorite* is an opinion, and opinions are what paragraphs are built on.', whyAr: '«المفضّلة» رأي، وعلى الآراء تُبنى الفقرات.' },
      { en: '*Football is popular for good reasons.*', ar: 'كرة القدم شعبية لأسباب وجيهة.', why: '*for good reasons* is a promise to give them — the paragraph must now deliver.', whyAr: '«لأسباب وجيهة» وعدٌ بذكرها، وعلى الفقرة أن تفي.' },
      { en: 'Too broad ✗: Cities. → Better: *Big cities offer many jobs.*', ar: 'فضفاضة ← أفضل', why: 'One word is a subject, not a sentence. The fix adds a claim you can prove.', whyAr: 'الكلمة الواحدة موضوع لا جملة، والإصلاح يضيف ادّعاءً يمكن إثباته.' },
      { en: 'Just a fact ✗: I woke up at 7. → Better: *My routine keeps me calm.*', ar: 'مجرّد تفصيل ← أفضل', why: 'A fact leaves nothing to add; a claim about your routine opens a paragraph.', whyAr: 'المعلومة لا تترك ما يُضاف، أما الادّعاء فيفتح فقرة.' },
    ],
    exercises: [
      { q: 'Is it a topic sentence? “I ate an egg.”', a: 'No — a small detail, not a main idea.' },
      { q: 'Improve: “Dogs.”', a: '*Dogs make loyal and loving pets.*' },
      { q: 'Write a topic sentence about your school.', a: 'e.g. *My school feels like a second home.*' },
      { q: 'Which is the topic sentence? A) I love summer. B) The sea is warm.', a: '*A* (the main idea).' },
      { q: 'Give a main idea for a paragraph about food.', a: 'e.g. *Moroccan food is rich and healthy.*' },
    ],
    reading: {
      title: 'A Model Paragraph', titleAr: 'فقرة نموذجية',
      passage: [
        '*My city is a wonderful place to live.*',
        'It has green parks where families walk in the evening.',
        'The people are friendly, and the markets are full of life.',
        'There are good schools and a large public library.',
        'For all these reasons, I am proud of my city.',
      ],
      questions: [
        { q: 'What is the topic sentence?', a: '“My city is a wonderful place to live.”' },
        { q: 'Give two supporting details.', a: 'green parks; friendly people; good schools; a library.' },
        { q: 'Which sentence closes the paragraph?', a: '“For all these reasons, I am proud of my city.”' },
      ],
      tip: 'topic sentence = the ONE main idea; every other sentence supports it.',
      tipAr: 'الجملة الموضوعية هي الفكرة الواحدة، وبقية الجمل تدعمها.',
    },
    homework: [
      { en: 'Write 3 topic sentences for 3 different topics', ar: 'اكتب ٣ جمل موضوعية' },
      { en: 'Choose one and list 3 supporting details', ar: 'اختر واحدة واذكر ٣ تفاصيل داعمة' },
      { en: 'Underline the topic sentence in a paragraph you read', ar: 'ضع خطًا تحت الجملة الموضوعية في نص' },
    ],
    editing: {
      wrong: [
        'My best friend is amazing. She is funny and kind. I have a red bike. She always helps me.',
      ],
      correct: [
        'My best friend is amazing. She is funny and kind. *She listens to my problems.* She always helps me.',
      ],
    },
  },

  /* ─────────────────────────── 22 · SUPPORT & CONCLUSION ─────────────────────────── */
  {
    no: 22, tag: 'Support', tagAr: 'الدعم والخاتمة',
    title: 'Supporting Details & the Concluding Sentence',
    titleAr: 'التفاصيل الداعمة وجملة الخاتمة',
    objectives: [
      { en: 'Add details that support the topic sentence', ar: 'إضافة تفاصيل تدعم الفكرة' },
      { en: 'Use reasons, examples, and facts', ar: 'استخدام الأسباب والأمثلة والحقائق' },
      { en: 'Write a concluding sentence', ar: 'كتابة جملة خاتمة' },
      { en: 'Keep every sentence on topic (unity)', ar: 'إبقاء كل الجمل في الموضوع' },
    ],
    rule: {
      en: '*Supporting sentences* explain the topic with reasons, examples, and details. The *concluding sentence* restates the main idea and closes the paragraph.',
      ar: 'الجمل الداعمة تشرح الموضوع بالأسباب والأمثلة والتفاصيل. وجملة الخاتمة تُعيد الفكرة وتُغلق الفقرة.',
    },
    studio: {
      prompt: { en: 'Build the body: write 3 supporting sentences + a conclusion for the topic sentence “Reading is a great hobby.”', ar: 'اِبنِ الجسم: اكتب ٣ جمل داعمة + خاتمة للجملة الموضوعية «Reading is a great hobby».' },
      model: {
        title: 'Reading is a Great Hobby', titleAr: 'القراءة هواية رائعة',
        parts: [
          { role: 'topic', en: 'Reading is a great hobby.' },
          { role: 'support', en: 'First, it teaches you new words and ideas.' },
          { role: 'support', en: 'It also takes you to new worlds without leaving home.' },
          { role: 'support', en: 'For example, a good story can make you forget your worries.' },
          { role: 'conclusion', en: 'In short, everyone should read a little every day.' },
        ],
      },
      plan: [
        { label: 'Topic sentence', ar: 'الجملة الموضوعية' },
        { label: 'Support 1 — a reason', ar: 'دعم ١ — سبب' },
        { label: 'Support 2 — an example', ar: 'دعم ٢ — مثال' },
        { label: 'Support 3 — a detail', ar: 'دعم ٣ — تفصيل' },
        { label: 'Concluding sentence', ar: 'جملة الخاتمة' },
      ],
      toolkit: [
        { group: 'Add support', ar: 'الإضافة', phrases: ['First, …', 'Second, …', 'Also, …', 'In addition, …', 'For example, …', 'Because …'] },
        { group: 'Conclude', ar: 'الخاتمة', phrases: ['In short, …', 'For these reasons, …', 'All in all, …', 'That is why …'] },
      ],
      steps: [
        { en: 'Copy the topic sentence at the top.', ar: 'انسخ الجملة الموضوعية في الأعلى.' },
        { en: 'Add 3 supporting sentences: a reason, an example, a detail.', ar: 'أضف ٣ جمل داعمة: سبب، مثال، تفصيل.' },
        { en: 'Finish with a concluding sentence that restates the idea.', ar: 'اختم بجملةٍ تُعيد الفكرة الرئيسية.' },
        { en: 'Delete any sentence that leaves the topic.', ar: 'احذف أي جملة تخرج عن الموضوع.' },
      ],
      checklist: [
        { en: 'At least 3 supporting sentences', ar: '٣ جمل داعمة على الأقل' },
        { en: 'A concluding sentence that restates the idea', ar: 'خاتمة تُعيد الفكرة' },
        { en: 'Every sentence stays on the topic', ar: 'كل الجمل في الموضوع' },
        { en: 'Linking words used (First, Also, For example)', ar: 'استُعملت أدوات الربط' },
      ],
    },
    explain: {
      intro: 'A topic sentence makes a promise; the supporting sentences are how you *pay* it. Most weak paragraphs are not badly written — they simply never pay: they repeat the promise in new words instead of proving it. Three real supports beat ten pretty sentences.',
      introAr: 'الجملة الموضوعية تَعِد، والجمل الداعمة هي *الوفاء* بالوعد. وأغلب الفقرات الضعيفة ليست رديئة اللغة، بل لا تفي أبدًا: تعيد الوعد بكلمات جديدة بدل أن تثبته. ثلاثة دعامات حقيقية خير من عشر جمل جميلة.',
      points: [
        { en: 'Support with *reasons* (because…), *examples* (for example…), *facts* (numbers)', ar: 'الدعم بالأسباب والأمثلة والحقائق' },
        { en: 'Aim for *3 supports* — fewer feels thin, more usually leaves the topic', ar: 'استهدف ثلاث دعامات: أقل يبدو ضعيفًا وأكثر يخرج عن الموضوع' },
        { en: 'Order them: put your *strongest* support last — it is what the reader keeps', ar: 'رتّبها: أقوى دعامة في الآخر — هي ما يبقى في ذهن القارئ' },
        { en: 'Every support must serve the promise. Ask each one: “does this prove my topic sentence?”', ar: 'اسأل كل جملة: هل تُثبت جملتي الموضوعية؟' },
        { en: '✗ Repeating is not supporting: “My city is beautiful. It is a very beautiful city.”', ar: 'التكرار ليس دعمًا — إعادة الوعد بكلمات أخرى' },
        { en: 'Conclusion: *In short,* … / *For these reasons,* … — close the idea, never open a new one', ar: 'الخاتمة تُغلق الفكرة ولا تفتح فكرة جديدة' },
      ],
    },
    examples: [
      { en: 'Topic: I love the sea. Support: *It is calm and beautiful.*', ar: 'دعم بوصف.', why: 'The first support explains the topic sentence — it does not repeat it.', whyAr: 'الدعم الأول يشرح الجملة الموضوعية ولا يكرّرها.' },
      { en: 'Support (reason): *I feel free when I swim.*', ar: 'دعم بسبب.', why: 'A REASON answers *why* — this is the R in R.E.D.', whyAr: 'السبب يجيب عن «لماذا»، وهو R في منهج R.E.D.' },
      { en: 'Support (example): *For example, I collect shells.*', ar: 'دعم بمثال.', why: 'An EXAMPLE answers *like what* — the E in R.E.D.', whyAr: 'المثال يجيب عن «مثل ماذا»، وهو E.' },
      { en: 'Conclusion: *For these reasons, the sea is my happy place.*', ar: 'خاتمة.', why: 'The conclusion signals closure and echoes the topic in NEW words.', whyAr: 'الخاتمة تُعلن الإغلاق وتُصدي الموضوع بكلمات جديدة.' },
      { en: 'Topic: Exercise is important. Support: *It keeps the body strong.*', ar: 'دعم.', why: 'Support number one, tied directly to the claim about exercise.', whyAr: 'الدعم الأول مرتبط مباشرةً بالادّعاء.' },
      { en: 'Support: *It also improves the mood.*', ar: 'دعم إضافي.', why: '*also* signals a second support of the same kind.', whyAr: 'also تُشير إلى دعم ثانٍ من النوع نفسه.' },
      { en: 'Conclusion: *In short, everyone should exercise.*', ar: 'خاتمة.', why: '*In short* closes without adding anything new — that is the rule.', whyAr: 'In short تُغلق دون إضافة جديد، وهذه هي القاعدة.' },
      { en: 'Off-topic ✗: *My phone is new.* (does not support the sea)', ar: 'خارج الموضوع.', why: 'It is a true sentence, but it proves nothing about the sea — so it must go.', whyAr: 'جملة صحيحة لكنها لا تُثبت شيئًا عن البحر فتُحذف.' },
    ],
    exercises: [
      { q: 'Add a reason: “I like winter because ___.”', a: '…I can drink hot tea and rest.' },
      { q: 'Add an example: “I eat healthy food. For example, ___.”', a: '…I eat fruit and vegetables.' },
      { q: 'Write a conclusion for “My school is great.”', a: '*For these reasons, I am happy at my school.*' },
      { q: 'On topic (about dogs)? “Cats are lazy.”', a: 'No — off topic.' },
      { q: 'Turn into support (topic: reading is useful):', a: '*It builds your vocabulary.*' },
    ],
    reading: {
      title: 'Why I Love Mornings', titleAr: 'لماذا أحب الصباح',
      passage: [
        '*Mornings are the best part of my day.*',
        'The air is fresh, and the streets are quiet.',
        'I drink tea and plan my tasks calmly.',
        'Because I start early, I finish more work.',
        '*For these reasons, I always wake up with a smile.*',
      ],
      questions: [
        { q: 'What is the topic sentence?', a: '“Mornings are the best part of my day.”' },
        { q: 'Give one supporting reason.', a: 'fresh air / quiet streets / start early → finish more.' },
        { q: 'What kind of sentence is the last one?', a: 'The concluding sentence.' },
      ],
      tip: 'support = reasons + examples + details · conclusion restates the idea.',
      tipAr: 'الدعم أسباب وأمثلة وتفاصيل · الخاتمة تُعيد الفكرة.',
    },
    homework: [
      { en: 'Write a topic sentence + 3 supports + 1 conclusion', ar: 'فقرة: موضوعية + ٣ دعم + خاتمة' },
      { en: 'Cross out an off-topic sentence in your paragraph', ar: 'احذف جملة خارج الموضوع' },
      { en: 'Add a reason and an example to a topic you choose', ar: 'أضف سببًا ومثالًا لموضوع' },
    ],
    editing: {
      wrong: [
        'I love reading. It teaches me new words. My shoes are blue. It relaxes my mind.',
      ],
      correct: [
        'I love reading. It teaches me new words*,* *and* it relaxes my mind. *In short, reading makes me happy.*',
      ],
    },
  },

  /* ─────────────────────────── 23 · PARAGRAPH TYPES ─────────────────────────── */
  {
    no: 23, tag: 'Paragraph types', tagAr: 'أنواع الفقرات',
    title: 'Paragraph Types — narrative, descriptive, opinion',
    titleAr: 'أنواع الفقرات — سردية، وصفية، رأي',
    objectives: [
      { en: 'Tell a story (narrative) in time order', ar: 'السرد بالترتيب الزمني' },
      { en: 'Describe with the senses (descriptive)', ar: 'الوصف بالحواس' },
      { en: 'Give an opinion with reasons', ar: 'إبداء الرأي بأسباب' },
      { en: 'Choose the right type for the task', ar: 'اختيار النوع المناسب' },
    ],
    rule: {
      en: 'A *narrative* paragraph tells a story in time order. A *descriptive* paragraph paints a picture with details. An *opinion* paragraph states a view and supports it with reasons.',
      ar: 'السردية تحكي قصة بالترتيب الزمني. والوصفية ترسم صورة بالتفاصيل. وفقرة الرأي تبدي وجهة نظر وتدعمها بالأسباب.',
    },
    studio: {
      prompt: { en: 'Choose ONE type — narrative, descriptive, or opinion — and write a short paragraph.', ar: 'اختر نوعًا واحدًا — سردية أو وصفية أو رأي — واكتب فقرة قصيرة.' },
      model: {
        title: 'An Opinion Paragraph', titleAr: 'فقرة رأي',
        parts: [
          { role: 'topic', en: 'In my opinion, mornings are the best time to study.' },
          { role: 'support', en: 'First, the mind is fresh and calm.' },
          { role: 'support', en: 'Also, the house is quiet, so I can focus.' },
          { role: 'support', en: 'For example, I remember new words better before noon.' },
          { role: 'conclusion', en: 'For these reasons, I always study early.' },
        ],
      },
      toolkit: [
        { group: 'Narrative (a story)', ar: 'سردية', phrases: ['First, …', 'Then, …', 'After that, …', 'Finally, …'] },
        { group: 'Descriptive (senses)', ar: 'وصفية', phrases: ['It looked …', 'I could hear …', 'The smell of …', 'It felt …'] },
        { group: 'Opinion (your view)', ar: 'رأي', phrases: ['In my opinion, …', 'I believe that …', '… because …', 'For these reasons, …'] },
      ],
      steps: [
        { en: 'Pick your type: narrative, descriptive, or opinion.', ar: 'اختر النوع: سردية أو وصفية أو رأي.' },
        { en: 'Write a topic sentence in that style.', ar: 'اكتب جملة موضوعية بذلك الأسلوب.' },
        { en: 'Add supporting sentences using the right signal words.', ar: 'أضف جملًا داعمة بأدوات النوع المناسبة.' },
        { en: 'End with a concluding sentence.', ar: 'اختم بجملة خاتمة.' },
      ],
      checklist: [
        { en: 'The type is clear from the first sentence', ar: 'النوع واضح من الجملة الأولى' },
        { en: 'You used that type’s signal words', ar: 'استعملتَ أدوات النوع' },
        { en: 'A topic sentence and a conclusion', ar: 'جملة موضوعية وخاتمة' },
      ],
    },
    explain: {
      intro: 'The structure you learned does not change — but the *kind* of support does. Ask what the reader should end up with: a sequence of events, a picture, or a conviction. That answer chooses your paragraph type, your linking words, and even your tense.',
      introAr: 'البنية التي تعلّمتها لا تتغيّر، لكن *نوع* الدعم يتغيّر. اسأل: بماذا يخرج القارئ؟ تسلسل أحداث، أم صورة، أم اقتناع؟ الجواب يختار نوع الفقرة وأدوات الربط، بل والزمن أيضًا.',
      points: [
        { en: '*Narrative* = what happened, in order: *first, then, after that, finally* (past tenses)', ar: 'السردية: ما حدث بالترتيب — أزمنة ماضية' },
        { en: '*Descriptive* = a picture: the five *senses* + precise adjectives (present tenses)', ar: 'الوصفية: صورة بالحواس الخمس والصفات الدقيقة' },
        { en: '*Opinion* = your view + *because* + reasons, strongest reason last', ar: 'الرأي: وجهة نظر + أسباب، وأقواها في الآخر' },
        { en: 'Every type still needs a *topic sentence* and a *conclusion*', ar: 'كل نوع يحتاج جملة موضوعية وخاتمة' },
        { en: 'Match the tense to the type — a story in the present simple feels wrong', ar: 'طابق الزمن مع النوع — قصة بالمضارع البسيط تبدو خاطئة' },
        { en: 'Show, don’t tell: “The room was nice” ✗ → “*Sunlight fell across the old wooden table*” ✓', ar: 'أرِ ولا تُخبر: الوصف الحسّي أقوى من الحكم المجرّد' },
      ],
    },
    examples: [
      { en: 'Narrative: *First,* I woke up. *Then,* I ran to the bus.', ar: 'أولًا... ثم...', why: 'Narrative runs on ORDER — sequence words are its skeleton.', whyAr: 'السردية تقوم على الترتيب، وكلماته هيكلها.' },
      { en: 'Narrative: *Finally,* I reached school on time.', ar: 'أخيرًا...', why: '*Finally* closes the sequence, which is how a narrative paragraph ends.', whyAr: 'Finally تُغلق التسلسل، وهكذا تنتهي الفقرة السردية.' },
      { en: 'Descriptive: The garden was *green and quiet*.', ar: 'الحديقة خضراء وهادئة.', why: 'Descriptive runs on ADJECTIVES — two senses in one short phrase.', whyAr: 'الوصفية تقوم على الصفات؛ حاسّتان في عبارة قصيرة.' },
      { en: 'Descriptive: I could *smell* the fresh bread.', ar: 'كنت أشمّ الخبز الطازج.', why: 'A different sense — smell. Good description uses more than sight.', whyAr: 'حاسّة أخرى؛ الوصف الجيّد لا يقتصر على البصر.' },
      { en: 'Descriptive: The music was *soft and slow*.', ar: 'كانت الموسيقى هادئة.', why: 'Sound, this time. Cycle the senses and the picture becomes real.', whyAr: 'الصوت هذه المرّة؛ نوّع الحواسّ لتحيا الصورة.' },
      { en: 'Opinion: *In my opinion,* reading is the best hobby.', ar: 'في رأيي...', why: 'Opinion paragraphs announce the position openly — that is expected here.', whyAr: 'فقرة الرأي تُعلن الموقف صراحةً، وهذا متوقَّع فيها.' },
      { en: 'Opinion: *I believe* sport is essential *because* it keeps us healthy.', ar: 'أعتقد... لأن...', why: '*because* is compulsory in opinion writing: a view without a reason is noise.', whyAr: 'because إلزامية في الرأي؛ فالرأي بلا سبب ضجيج.' },
      { en: 'Opinion: *For these reasons,* students should sleep early.', ar: 'لهذه الأسباب...', why: '*For these reasons* closes an opinion paragraph by pointing back at the support.', whyAr: 'For these reasons تُغلق فقرة الرأي بالإشارة إلى الدعم.' },
    ],
    exercises: [
      { q: 'Type? “First I mixed the flour, then I baked the cake.”', a: '*Narrative* (time order).' },
      { q: 'Type? “The beach was golden, warm, and full of light.”', a: '*Descriptive* (senses).' },
      { q: 'Type? “I think homework is useful because it helps us practice.”', a: '*Opinion* (view + reason).' },
      { q: 'Add a sense: “The kitchen smelled of ___.”', a: '…*fresh coffee*.' },
      { q: 'Start an opinion: “___, cities are better than villages.”', a: '*In my opinion,* …' },
    ],
    reading: {
      title: 'My First Day (a narrative)', titleAr: 'أول يوم (سرد)',
      passage: [
        '*First,* I entered the new school with a fast heartbeat.',
        '*Then,* a friendly teacher welcomed me at the door.',
        '*After that,* I met my classmates and learned their names.',
        'We laughed together during the break.',
        '*Finally,* I went home happy and proud.',
      ],
      questions: [
        { q: 'What type of paragraph is this?', a: 'Narrative (a story in order).' },
        { q: 'Which words show the time order?', a: 'First, Then, After that, Finally.' },
        { q: 'How did the writer feel at the end?', a: 'Happy and proud.' },
      ],
      tip: 'narrative = time order · descriptive = senses · opinion = view + reasons.',
      tipAr: 'سرد = ترتيب · وصف = حواس · رأي = وجهة نظر + أسباب.',
    },
    homework: [
      { en: 'Write a short narrative paragraph (first/then/finally)', ar: 'اكتب فقرة سردية' },
      { en: 'Write a descriptive paragraph using 3 senses', ar: 'اكتب فقرة وصفية بثلاث حواس' },
      { en: 'Write an opinion paragraph with 2 reasons', ar: 'اكتب فقرة رأي بسببين' },
    ],
    editing: {
      wrong: [
        'I think tea is nice. It is a drink. People drink it. I have a cup.',
      ],
      correct: [
        '*In my opinion,* tea is the best drink *because* it is warm, healthy, and calming. *A cup of tea relaxes me after a long day.*',
      ],
    },
  },

  /* ─────────────────────────── 24 · EDITING ─────────────────────────── */
  {
    no: 24, tag: 'Editing', tagAr: 'المراجعة',
    title: 'Editing & Proofreading — polish your writing',
    titleAr: 'المراجعة والتدقيق — تحسين كتابتك',
    objectives: [
      { en: 'Re-read your writing to find mistakes', ar: 'إعادة القراءة لاكتشاف الأخطاء' },
      { en: 'Check capitals, articles, and punctuation', ar: 'التحقق من الأساسيات' },
      { en: 'Check agreement and spelling', ar: 'التحقق من التطابق والإملاء' },
      { en: 'Use a simple editing checklist', ar: 'استخدام قائمة تدقيق' },
    ],
    rule: {
      en: 'Good writers *always re-read* and fix their work. Check *capitals*, *end punctuation*, *articles*, *agreement*, *commas*, and *spelling* — one pass at a time.',
      ar: 'الكاتب الجيد يُعيد القراءة دائمًا ويصحّح: الحروف الكبيرة، وعلامات النهاية، والأدوات، والتطابق، والفواصل، والإملاء.',
    },
    explain: {
      intro: 'Nobody writes a good first draft — good writers just edit better. The secret is to hunt *one thing at a time*: reading for four kinds of mistake at once means you catch none of them. Four slow passes beat one anxious re-reading.',
      introAr: 'لا أحد يكتب مسودّة أولى جيدة — الكاتب الجيد يدقّق أفضل فقط. والسرّ أن تصطاد خطأً واحدًا في كل مرور: القراءة بحثًا عن أربعة أخطاء دفعةً واحدة تعني ألّا تجد أيًّا منها. أربع مرّات بطيئة أفضل من قراءة واحدة قلقة.',
      points: [
        { en: 'Pass 1 — *Sense*: does every sentence say what I meant?', ar: 'المرور ١ — المعنى: هل تقول كل جملة ما قصدته؟' },
        { en: 'Pass 2 — *Structure*: any fragments or run-ons? capitals and end marks?', ar: 'المرور ٢ — البناء: جمل ناقصة أو ملتصقة؟ الحروف والعلامات؟' },
        { en: 'Pass 3 — *Grammar*: subject–verb agreement · tense · a/an/the · prepositions', ar: 'المرور ٣ — القواعد: التطابق والزمن والأدوات وحروف الجر' },
        { en: 'Pass 4 — *Spelling* only. Nothing else. Read it *backwards*, last sentence first.', ar: 'المرور ٤ — الإملاء فقط: اقرأ من الآخر إلى الأول' },
        { en: 'Read it *aloud* — your ear catches what your eye forgives', ar: 'اقرأ بصوت عالٍ: أذنك تمسك ما تتسامح معه عينك' },
        { en: 'Leave it for an hour first. You cannot proofread a sentence you still remember writing.', ar: 'اتركها ساعة أولًا — لا يمكنك تدقيق جملة ما زلت تذكر كتابتها' },
      ],
    },
    examples: [
      { en: '✓ Capital at the start of every sentence', ar: 'حرف كبير في البداية', why: 'Pass 2 — structure. Check the openings alone, ignoring meaning entirely.', whyAr: 'المرور الثاني: البناء؛ افحص البدايات وحدها متجاهلًا المعنى.' },
      { en: '✓ *.* *?* *!* at the end', ar: 'علامة في النهاية', why: 'Still pass 2: every sentence must close as well as open.', whyAr: 'المرور الثاني أيضًا: كل جملة تُغلق كما تُفتح.' },
      { en: '✓ a / an / the used correctly', ar: 'الأدوات صحيحة', why: 'Pass 3 — grammar. Articles are the commonest Arabic-speaker error.', whyAr: 'المرور الثالث: القواعد، والأدوات أشيع خطأ عند الناطق بالعربية.' },
      { en: '✓ he/she/it + verb-s (agreement)', ar: 'التطابق', why: 'Still pass 3: hunt the missing *-s* on third-person verbs specifically.', whyAr: 'المرور الثالث: تصيّد s الغائبة على أفعال المفرد الغائب.' },
      { en: '✓ commas in series and compound sentences', ar: 'الفواصل', why: 'Pass 3 again — commas belong to grammar, not to feeling.', whyAr: 'الفواصل من القواعد لا من الإحساس.' },
      { en: '✓ spelling checked (mind the vowels!)', ar: 'الإملاء', why: 'Pass 4 — spelling ONLY. Read it backwards so meaning cannot distract you.', whyAr: 'المرور الرابع: الإملاء فقط، واقرأ من الآخر لئلا يشغلك المعنى.' },
      { en: '✓ one main idea per paragraph', ar: 'فكرة واحدة للفقرة', why: 'Pass 1 — sense. This is the check most writers skip, and it matters most.', whyAr: 'المرور الأول: المعنى، وهو ما يتخطّاه أغلب الكتّاب وهو الأهمّ.' },
      { en: '✓ no fragments or run-ons', ar: 'لا جمل ناقصة أو ملتصقة', why: 'Structure again: fragments and run-ons are invisible until you look for them.', whyAr: 'البناء: الجمل الناقصة والملتصقة خفيّة حتى تبحث عنها.' },
    ],
    exercises: [
      { q: 'Find the error: “she live in london”', a: '*S*he live*s* in *L*ondon*.*' },
      { q: 'Find the error: “I have a apple”', a: 'I have *an* apple*.*' },
      { q: 'Find the error: “we was late”', a: 'we *were* late' },
      { q: 'Find the error: “the childs are here”', a: 'the *children* are here' },
      { q: 'Find 2 errors: “my freind go to school”', a: 'my *friend* *goes* to school' },
    ],
    reading: {
      title: 'Before and After', titleAr: 'قبل وبعد',
      passage: [
        'A good paragraph is never finished on the first try.',
        'After you write, read your work aloud, slowly.',
        'Fix the small mistakes: a missing capital, a wrong article, a forgotten comma.',
        'Then read once more, only for spelling.',
        'A clean paragraph shows respect for your reader.',
      ],
      questions: [
        { q: 'Should you stop after the first try?', a: 'No — re-read and fix.' },
        { q: 'What should the last pass check?', a: 'Spelling.' },
        { q: 'Name two small mistakes to look for.', a: 'missing capital, wrong article, forgotten comma.' },
      ],
      tip: 'write → re-read aloud → fix mechanics → check spelling → done.',
      tipAr: 'اكتب ← اقرأ بصوت ← صحّح الأساسيات ← دقّق الإملاء.',
    },
    homework: [
      { en: 'Edit a paragraph you wrote using the checklist', ar: 'دقّق فقرة كتبتها بالقائمة' },
      { en: 'Read your work aloud and fix 5 mistakes', ar: 'اقرأ بصوت وصحّح ٥ أخطاء' },
      { en: 'Swap with a friend and check each other’s work', ar: 'تبادل مع صديق وصحّحا معًا' },
    ],
    editing: {
      wrong: [
        'my name is karim and i live in agadir.',
        'i work as a teacher, i love my job.',
        'every day i teachs english to a childrens.',
      ],
      correct: [
        '*M*y name is *K*arim*,* *and* *I* live in *A*gadir.',
        '*I* work as a teacher*.* *I* love my job.',
        '*E*very day *I* *teach* *E*nglish to *children*.',
      ],
    },
  },

  /* ─────────────────────────── 7.5 · THERE IS / THERE ARE (A1) ─────────────────────────── */
  {
    no: 7.5, cefr: 'A1', tag: 'There is/are', tagAr: 'يوجد',
    title: 'There is / There are — saying what exists',
    titleAr: 'There is / There are — التعبير عن الوجود',
    objectives: [
      { en: 'Say that something exists with There is/are', ar: 'التعبير عن وجود شيء' },
      { en: 'Choose is (one) vs are (many)', ar: 'اختيار is للمفرد و are للجمع' },
      { en: 'Make negatives and questions', ar: 'تكوين النفي والسؤال' },
      { en: 'Describe a place in writing', ar: 'وصف مكان كتابيًا' },
    ],
    rule: {
      en: 'Use *There is* + a singular noun and *There are* + a plural noun to say something exists: “There is a park. There are two cafés.”',
      ar: 'نستخدم There is مع المفرد و There are مع الجمع للتعبير عن الوجود: «يوجد منتزه. يوجد مقهيان».',
    },
    explain: {
      intro: 'Every descriptive paragraph — your city, your room, your school — is built on There is / There are. Arabic says «يوجد» for both; English changes with the number.',
      introAr: 'كل فقرة وصفية — مدينتك، غرفتك، مدرستك — تُبنى على There is/are. العربية تقول «يوجد» للاثنين؛ الإنجليزية تتغيّر مع العدد.',
      points: [
        { en: '*There is* + one thing: There is *a* mosque.', ar: 'There is لمفرد' },
        { en: '*There are* + many things: There are *three* shops.', ar: 'There are لجمع' },
        { en: 'With some/any: There are *some* trees. / There aren’t *any* buses.', ar: 'مع some/any' },
        { en: 'NOT “It is a park in my city” — use *There is*', ar: 'لا نقول It is هنا' },
      ],
    },
    form: {
      affirmative: [
        '*There is* (There’s) a garden.',
        '*There are* two schools.',
      ],
      negative: [
        'There *is not* (isn’t) a pool.',
        'There *are not* (aren’t) any buses.',
      ],
      question: [
        '*Is there* a bank near here? — Yes, there *is*. / No, there *isn’t*.',
        '*Are there* any shops? — Yes, there *are*. / No, there *aren’t*.',
      ],
      note: 'The noun decides is/are — “There *are* many people” (people = plural).',
      noteAr: 'الاسم يقرّر is أو are: There are many people لأن people جمع.',
    },
    examples: [
      { en: '*There is* a big park in my city.', ar: 'يوجد منتزه كبير في مدينتي.', why: '*There is* introduces something NEW — the reader has not met this park yet.', whyAr: 'There is تُقدّم شيئًا جديدًا لم يعرفه القارئ.' },
      { en: '*There is* a mosque near my house.', ar: 'يوجد مسجد قرب بيتي.', why: 'Singular noun after *is* — the verb agrees with what FOLLOWS it.', whyAr: 'الاسم مفرد بعد is، والفعل يطابق ما بعده.' },
      { en: '*There’s* a good café on this street.', ar: 'يوجد مقهى جيد في هذا الشارع.', why: 'The contraction is normal in writing too, not only in speech.', whyAr: 'الاختصار طبيعي في الكتابة أيضًا لا في الكلام فقط.' },
      { en: '*There are* two universities here.', ar: 'توجد جامعتان هنا.', why: 'Plural noun → *are*. The verb looks forward, never backward.', whyAr: 'الاسم جمع فتأخذ are؛ الفعل ينظر إلى ما بعده.' },
      { en: '*There are* many tourists in summer.', ar: 'يوجد سيّاح كثيرون صيفًا.', why: '*tourists* is plural, so *are* again.', whyAr: 'tourists جمع فتتكرّر are.' },
      { en: '*There are* some books on the desk.', ar: 'توجد بعض الكتب على المكتب.', why: '*some* with a plural noun still needs *are*.', whyAr: 'some مع الجمع تبقى are.' },
      { en: 'There *isn’t* a cinema in our town.', ar: 'لا توجد سينما في بلدتنا.', why: 'Negative singular: *isn’t*. The word *there* never changes.', whyAr: 'النفي للمفرد: isn’t، و there لا تتغيّر.' },
      { en: 'There *aren’t* any clouds today.', ar: 'لا توجد غيوم اليوم.', why: 'Negative plural uses *any*, not *some* — a rule you already know.', whyAr: 'النفي مع الجمع يأخذ any لا some.' },
      { en: '*Is there* a pharmacy near here?', ar: 'هل توجد صيدلية قريبة؟', why: 'Question: invert to *Is there*. The same swap as the verb *be*.', whyAr: 'السؤال بالتقديم: Is there.' },
      { en: '*Are there* any questions?', ar: 'هل توجد أسئلة؟', why: 'Plural question → *Are there*, again with *any*.', whyAr: 'سؤال الجمع: Are there مع any.' },
      { en: 'In my room *there is* a bed and a small desk.', ar: 'في غرفتي سرير ومكتب صغير.', why: 'When two things follow, the verb agrees with the FIRST one.', whyAr: 'إذا تلاه شيئان طابق الفعلُ الأولَ منهما.' },
      { en: 'In our school *there are* twenty classrooms.', ar: 'في مدرستنا عشرون قاعة.', why: 'Starting with the place is fine — *there* still comes before the verb.', whyAr: 'يجوز البدء بالمكان، وتبقى there قبل الفعل.' },
    ],
    exercises: [
      { q: 'is/are: “There ___ a cat in the garden.”', a: 'There *is* a cat in the garden.' },
      { q: 'is/are: “There ___ five students here.”', a: 'There *are* five students here.' },
      { q: 'Make negative: “There are buses at night.”', a: 'There *aren’t any* buses at night.' },
      { q: 'Make a question: “There is a bank near here.”', a: '*Is there* a bank near here?' },
      { q: 'Fix: “It is a big market in my city.”', a: '*There is* a big market in my city.' },
      { q: 'Fix: “There is many cafés here.”', a: 'There *are* many cafés here.' },
    ],
    reading: {
      title: 'My Neighborhood', titleAr: 'حيّي',
      passage: [
        'I live in a quiet neighborhood, and I love it.',
        '*There is* a small park where children play every evening.',
        '*There are* two bakeries, and *there’s* a mosque with a beautiful minaret.',
        'There *isn’t* a big mall, but *there are* many small friendly shops.',
        '*Is there* a better place to live? I don’t think so!',
      ],
      tip: 'One thing → There is · many things → There are — the backbone of every place description.',
      tipAr: 'مفرد ← There is · جمع ← There are — أساس كل وصفٍ للأماكن.',
    },
    homework: [
      { en: 'Describe your room in 5 sentences with There is/are', ar: 'صِف غرفتك في ٥ جمل بـ There is/are' },
      { en: 'Write 3 negatives about your city (There isn’t/aren’t)', ar: 'اكتب ٣ جمل منفية عن مدينتك' },
      { en: 'Write 3 questions with Is there / Are there', ar: 'اكتب ٣ أسئلة' },
    ],
    editing: {
      wrong: [
        'In my city it is a beautiful beach.',
        'There is many restaurants near the sea.',
        'There aren’t a cinema, but there is two theaters.',
      ],
      correct: [
        'In my city *there is* a beautiful beach.',
        'There *are* many restaurants near the sea.',
        'There *isn’t* a cinema, but there *are* two theaters.',
      ],
    },
  },

  /* ─────────────────────────── 8.3 · OBJECT PRONOUNS (A1) ─────────────────────────── */
  {
    no: 8.3, cefr: 'A1', tag: 'Object pronouns', tagAr: 'ضمائر المفعول',
    title: 'Object Pronouns — me, you, him, her, it, us, them',
    titleAr: 'ضمائر المفعول — me / him / her / us / them',
    objectives: [
      { en: 'Match each subject pronoun to its object form', ar: 'مطابقة كل ضمير فاعل بضمير مفعوله' },
      { en: 'Use object pronouns after verbs', ar: 'استخدامها بعد الأفعال' },
      { en: 'Use them after prepositions (with, to, for)', ar: 'استخدامها بعد حروف الجر' },
      { en: 'Avoid repeating nouns in writing', ar: 'تجنّب تكرار الأسماء في الكتابة' },
    ],
    rule: {
      en: 'After a verb or a preposition, use the *object* pronoun: I → *me*, he → *him*, she → *her*, we → *us*, they → *them*. “Call *me*” — NOT “Call I”.',
      ar: 'بعد الفعل أو حرف الجر نستخدم ضمير المفعول: me, him, her, us, them. نقول Call me لا Call I.',
    },
    explain: {
      intro: 'Good writing does not repeat names: “I met Sara and helped Sara” → “I met Sara and helped *her*.” The pronoun changes form after the verb.',
      introAr: 'الكتابة الجيدة لا تكرّر الأسماء: بدل «قابلت سارة وساعدت سارة» نقول «قابلتها وساعدتها». والضمير يتغيّر شكله بعد الفعل.',
      points: [
        { en: 'I→*me* · you→*you* · he→*him* · she→*her*', ar: 'التحويلات' },
        { en: 'it→*it* · we→*us* · they→*them*', ar: 'الباقي' },
        { en: 'After a verb: She called *me*. I saw *them*.', ar: 'بعد الفعل' },
        { en: 'After a preposition: with *him* · for *us* · to *her*', ar: 'بعد حرف الجر' },
      ],
    },
    examples: [
      { en: 'She called *me* yesterday.', ar: 'اتصلت بي أمس.', why: '*me* is the OBJECT form — it receives the action of *called*.', whyAr: 'me صيغة المفعول، فهي التي وقع عليها الفعل.' },
      { en: 'I will help *you*.', ar: 'سأساعدك.', why: '*you* is the only pronoun with the same subject and object form.', whyAr: 'you الضمير الوحيد الذي لا يتغيّر بين الفاعل والمفعول.' },
      { en: 'Do you know *him*?', ar: 'هل تعرفه؟', why: '*he* → *him* as an object. Never *Do you know he?*', whyAr: 'he تصير him مفعولًا.' },
      { en: 'I saw *her* at the market.', ar: 'رأيتها في السوق.', why: '*she* → *her* as an object — and *her* is also the possessive, which is why it confuses.', whyAr: 'she تصير her مفعولًا، وهي أيضًا صفة ملكية فيقع اللبس.' },
      { en: 'This is my phone — I bought *it* last week.', ar: 'هذا هاتفي — اشتريته الأسبوع الماضي.', why: '*it* is unchanged too, standing in for *my phone*.', whyAr: 'it لا تتغيّر، وهي نائبة عن my phone.' },
      { en: 'The teacher praised *us*.', ar: 'أثنى علينا المعلّم.', why: '*we* → *us*. The teacher acts, we receive.', whyAr: 'we تصير us؛ المعلّم فاعل ونحن مفعول.' },
      { en: 'I met my cousins and invited *them* to dinner.', ar: 'قابلت أبناء عمي ودعوتهم للعشاء.', why: '*they* → *them*, standing in for *my cousins* so we do not repeat it.', whyAr: 'they تصير them نيابةً عن الاسم لئلا نكرّره.' },
      { en: 'Come with *me*.', ar: 'تعالَ معي.', why: 'After a PREPOSITION English always uses the object form: *with me*.', whyAr: 'بعد حرف الجرّ تُستعمل صيغة المفعول دائمًا.' },
      { en: 'This gift is for *her*.', ar: 'هذه الهدية لها.', why: '*for* is a preposition, so *her*, never *she*.', whyAr: 'for حرف جرّ فتأتي her لا she.' },
      { en: 'Listen to *them* carefully.', ar: 'استمع إليهم جيدًا.', why: '*to* is a preposition → *them*. This rule has no exceptions.', whyAr: 'to حرف جرّ فتأتي them، ولا استثناء لهذه القاعدة.' },
      { en: 'Between you and *me*, the test was easy.', ar: 'بيني وبينك، كان الاختبار سهلًا.', why: 'The classic error: *between* is a preposition, so it must be *me*, not *I*.', whyAr: 'الخطأ الشهير: between حرف جرّ فتأتي me لا I.' },
    ],
    exercises: [
      { q: 'Replace: “I saw Omar.” →', a: 'I saw *him*.' },
      { q: 'Replace: “She helped Sara and Nadia.” →', a: 'She helped *them*.' },
      { q: 'Fix: “The teacher asked I a question.”', a: 'The teacher asked *me* a question.' },
      { q: 'Fix: “Come with we.”', a: 'Come with *us*.' },
      { q: 'Fill: “This letter is for ___ (she).”', a: 'This letter is for *her*.' },
      { q: 'Fix the repetition: “I like this book because this book is short.”', a: 'I like this book because *it* is short.' },
    ],
    reading: {
      title: 'A Gift for My Mother', titleAr: 'هدية لأمي',
      passage: [
        'My mother’s birthday was on Friday, so I bought *her* a scarf.',
        'My sister helped *me* choose the color.',
        'We wrapped *it* in gold paper and hid *it* in the kitchen.',
        'When my mother found the gift, she hugged *us* and thanked *us* warmly.',
        'Moments like this stay with *you* forever.',
      ],
      tip: 'her / me / it / us — the object forms keep the story flowing without repeating names.',
      tipAr: 'ضمائر المفعول تُبقي القصة سلسة دون تكرار الأسماء.',
    },
    homework: [
      { en: 'Write 5 sentences using a different object pronoun each', ar: 'اكتب ٥ جمل بضمير مفعول مختلف' },
      { en: 'Rewrite 3 sentences replacing repeated nouns with pronouns', ar: 'أعد كتابة ٣ جمل مستبدلًا الأسماء المكرّرة' },
      { en: 'Write 2 sentences with a pronoun after with/for/to', ar: 'اكتب جملتين بضمير بعد حرف جر' },
    ],
    editing: {
      wrong: [
        'My father taught I how to drive.',
        'I love my grandmother and visit she every week.',
        'Our neighbors are kind; we often have tea with they.',
      ],
      correct: [
        'My father taught *me* how to drive.',
        'I love my grandmother and visit *her* every week.',
        'Our neighbors are kind; we often have tea with *them*.',
      ],
    },
  },

  /* ─────────────────────────── 8.6 · ADJECTIVES & WORD ORDER (A1) ─────────────────────────── */
  {
    no: 8.6, cefr: 'A1', tag: 'Adjectives', tagAr: 'الصفات',
    title: 'Adjectives — describing words & their ORDER',
    titleAr: 'الصفات — كلمات الوصف وترتيبها',
    objectives: [
      { en: 'Put the adjective BEFORE the noun', ar: 'وضع الصفة قبل الاسم' },
      { en: 'Use adjectives after “be” (The car is red)', ar: 'استخدامها بعد فعل الكينونة' },
      { en: 'Know adjectives never take plural -s', ar: 'الصفة لا تُجمع أبدًا' },
      { en: 'Order two adjectives naturally', ar: 'ترتيب صفتين بشكل طبيعي' },
    ],
    rule: {
      en: 'In English the adjective comes *BEFORE* the noun: “a *big* house” — the opposite of Arabic (بيت كبير). Adjectives *never* change for plural: “two big houses” (NOT bigs).',
      ar: 'في الإنجليزية تأتي الصفة قبل الاسم: a big house — عكس العربية (بيت كبير). والصفة لا تتغيّر مع الجمع أبدًا.',
    },
    explain: {
      intro: 'This is the #1 word-order error for Arabic speakers, because Arabic puts the adjective AFTER the noun. Train the reversal until it is automatic.',
      introAr: 'هذا أكثر خطأ ترتيبي عند الناطقين بالعربية، لأن العربية تضع الصفة بعد الاسم. درّب نفسك على العكس حتى يصبح تلقائيًا.',
      points: [
        { en: 'Before the noun: a *red* car — NOT a car red ✗', ar: 'قبل الاسم' },
        { en: 'After be: The car *is red*.', ar: 'بعد فعل الكينونة' },
        { en: 'Never plural: three *tall* men — NOT talls ✗', ar: 'لا تُجمع' },
        { en: 'Two adjectives: opinion → size → color: a *beautiful big blue* bag', ar: 'رأي ← حجم ← لون' },
      ],
    },
    form: {
      affirmative: [
        'adjective + noun: a *small* room · an *old* city',
        'be + adjective: The room *is small*.',
        'two adjectives: a *nice little* café',
      ],
      negative: [
        'The film was *not interesting*.',
        'It isn’t an *expensive* hotel.',
      ],
      question: [
        'Is the test *difficult*?',
        'What is your city *like*? — It’s *quiet and beautiful*.',
      ],
      note: 'Arabic order is بيت كبير (noun→adj). English REVERSES it: *big house*. Never write “a house big”.',
      noteAr: 'الترتيب العربي: بيت كبير. والإنجليزية تعكسه: big house. لا تكتب a house big أبدًا.',
    },
    examples: [
      { en: 'a *big* house', ar: 'بيت كبير', why: 'THE core rule: the adjective goes BEFORE the noun — the opposite of Arabic.', whyAr: 'القاعدة الجوهرية: الصفة قبل الاسم، عكس العربية.' }, { en: 'a *small* car', ar: 'سيارة صغيرة', why: 'Same order every time. Arabic says «سيارة صغيرة»; English reverses it.', whyAr: 'الترتيب نفسه دائمًا، والعربية تعكسه.' },
      { en: 'an *old* city', ar: 'مدينة قديمة', why: '*an* because *old* begins with a vowel sound — the article follows the ADJECTIVE now.', whyAr: 'an لأن old تبدأ بصوت علّة، والأداة تتبع الصفة لا الاسم.' }, { en: 'a *new* phone', ar: 'هاتف جديد', why: 'The adjective sits between the article and the noun. That slot never changes.', whyAr: 'الصفة بين الأداة والاسم، وهذا الموضع لا يتغيّر.' },
      { en: 'a *beautiful* garden', ar: 'حديقة جميلة', why: 'Longer adjectives behave exactly the same — length changes nothing.', whyAr: 'الصفة الطويلة كالقصيرة تمامًا؛ الطول لا يغيّر شيئًا.' }, { en: 'a *difficult* exam', ar: 'امتحان صعب', why: 'Still before the noun, even when the adjective is three syllables.', whyAr: 'تبقى قبل الاسم مهما طالت.' },
      { en: 'a *cheap* ticket', ar: 'تذكرة رخيصة', why: 'The article agrees with the adjective’s sound: *cheap* → *a*.', whyAr: 'الأداة تطابق صوت الصفة.' }, { en: 'an *expensive* watch', ar: 'ساعة غالية', why: '*expensive* starts with a vowel sound → *an*. Same rule, tested again.', whyAr: 'expensive تبدأ بصوت علّة فتأخذ an.' },
      { en: '*hot* tea', ar: 'شاي ساخن', why: 'Uncountable nouns take no article, but the adjective still comes first.', whyAr: 'غير المعدود بلا أداة، وتبقى الصفة قبله.' }, { en: '*fresh* bread', ar: 'خبز طازج', why: 'Same pattern with another uncountable noun.', whyAr: 'النمط نفسه مع اسم آخر غير معدود.' },
      { en: 'two *tall* buildings', ar: 'مبنيان شاهقان', why: 'THE second trap: adjectives NEVER take a plural *s*. Not *talls*.', whyAr: 'الفخّ الثاني: الصفة لا تُجمع أبدًا.' }, { en: 'many *happy* children', ar: 'أطفال سعداء كثيرون', why: 'Still no *s* on *happy*, even though *children* is plural.', whyAr: 'لا s على الصفة وإن كان الاسم جمعًا.' },
      { en: 'The streets are *clean*.', ar: 'الشوارع نظيفة.', why: 'After *be* the adjective comes AFTER — the only place it follows the noun.', whyAr: 'بعد فعل الكينونة تأتي الصفة بعده، وهو الموضع الوحيد.' },
      { en: 'My grandmother is *kind and wise*.', ar: 'جدتي طيبة وحكيمة.', why: 'Two adjectives after *be* are joined by *and*, not by a comma.', whyAr: 'صفتان بعد be تُربطان بـ and لا بفاصلة.' },
      { en: 'a *beautiful old* mosque', ar: 'مسجد قديم جميل', why: 'Two adjectives before a noun follow a fixed order: opinion before age.', whyAr: 'صفتان قبل الاسم بترتيب ثابت: الرأي قبل العمر.' },
      { en: 'a *small red* bag', ar: 'حقيبة حمراء صغيرة', why: 'Size comes before colour — the order is habit, and English speakers all share it.', whyAr: 'الحجم قبل اللون، وهو ترتيب متّفق عليه بالعادة.' },

      /* now in a sentence — a writing course has to show the rule working */
      { en: 'She lives in a *small quiet* village near a *beautiful old* mosque.', ar: 'تعيش في قرية صغيرة هادئة قرب مسجد قديم جميل.', why: 'Two adjectives before each noun, in the fixed English order.', whyAr: 'صفتان قبل كل اسم بالترتيب الإنجليزي الثابت.' },
      { en: '✗ a car red → ✓ a *red* car', ar: 'الفخّ العربي', why: 'Arabic puts the adjective after the noun; English always puts it before.', whyAr: 'العربية تؤخّر الصفة والإنجليزية تقدّمها دائمًا.' },
      { en: 'The exam was *long* and *difficult*, but the questions were *fair*.', ar: 'كان الامتحان طويلًا وصعبًا لكن الأسئلة كانت عادلة.', why: 'After *be* the adjective follows — the only place it comes after the noun.', whyAr: 'بعد فعل الكينونة تأتي الصفة، وهو الموضع الوحيد.' },
      { en: '✗ two talls buildings → ✓ two *tall* buildings', ar: 'لا تُجمع الصفة', why: 'Adjectives never take a plural -s, however plural the noun is.', whyAr: 'الصفة لا تُجمع مهما جُمع الاسم.' },
    ],
    exercises: [
      { q: 'Order: “car / a / fast”', a: 'a *fast car*' },
      { q: 'Order: “city / beautiful / a / old”', a: 'a *beautiful old city*' },
      { q: 'Fix: “I live in a house big.”', a: 'I live in a *big house*.' },
      { q: 'Fix: “She has two cats blacks.”', a: 'She has two *black cats*.' },
      { q: 'Fix: “These are talls trees.”', a: 'These are *tall* trees.' },
      { q: 'Complete: “The exam was very ___.” (صعب)', a: 'The exam was very *difficult*.' },
    ],
    reading: {
      title: 'The Old Medina', titleAr: 'المدينة القديمة',
      passage: [
        'Last weekend I visited the *old* medina with my *little* brother.',
        'We walked through *narrow* streets full of *colorful* shops.',
        'A *friendly* seller offered us *sweet* mint tea in *small* glasses.',
        'I bought a *beautiful leather* bag for a *cheap* price.',
        'It was a *long* day, but the memories are *golden*.',
      ],
      tip: 'Every adjective sits BEFORE its noun — old medina, narrow streets, sweet tea.',
      tipAr: 'كل صفة قبل اسمها — عكس العربية تمامًا.',
    },
    homework: [
      { en: 'Describe your best friend with 4 adjectives (before nouns)', ar: 'صِف أعزّ أصدقائك بأربع صفات' },
      { en: 'Write 5 “adjective + noun” phrases about your city', ar: 'اكتب ٥ عبارات صفة+اسم عن مدينتك' },
      { en: 'Fix 3 sentences written in Arabic order (noun then adjective)', ar: 'أصلح ٣ جمل كُتبت بالترتيب العربي' },
    ],
    editing: {
      wrong: [
        'Marrakech is a city beautiful with buildings olds.',
        'We ate a meal delicious in a restaurant small.',
        'My uncle has a car German very fast.',
      ],
      correct: [
        'Marrakech is a *beautiful city* with *old buildings*.',
        'We ate a *delicious meal* in a *small restaurant*.',
        'My uncle has a very fast *German car*.',
      ],
    },
  },

  /* ─────────────────────────── 9.5 · QUANTIFIERS (A2) ─────────────────────────── */
  {
    no: 9.5, cefr: 'A2', tag: 'Quantifiers', tagAr: 'كلمات الكمية',
    title: 'Quantifiers — some, any, much, many, a lot of',
    titleAr: 'كلمات الكمية — some / any / much / many / a lot of',
    objectives: [
      { en: 'Use some (positive) vs any (negative/question)', ar: 'استخدام some و any' },
      { en: 'Use many (countable) vs much (uncountable)', ar: 'استخدام many و much' },
      { en: 'Use a lot of with both', ar: 'استخدام a lot of مع النوعين' },
      { en: 'Use a few / a little correctly', ar: 'استخدام a few / a little' },
    ],
    rule: {
      en: '*Some* in positive sentences, *any* in negatives & questions. *Many* + countable (books), *much* + uncountable (water), *a lot of* + both.',
      ar: 'نستخدم some في الإثبات، و any في النفي والسؤال. many مع المعدود، much مع غير المعدود، و a lot of مع النوعين.',
    },
    explain: {
      intro: 'First ask: can I count it? Books — yes (countable). Water, time, money — no (uncountable). The quantifier follows that answer.',
      introAr: 'اسأل أولًا: هل يمكن عدّه؟ الكتب نعم (معدود). الماء والوقت والمال لا (غير معدود). كلمة الكمية تتبع الجواب.',
      points: [
        { en: '*some* + positive: I have *some* friends / *some* money', ar: 'some للإثبات' },
        { en: '*any* + negative/question: I don’t have *any* time · Do you have *any* questions?', ar: 'any للنفي والسؤال' },
        { en: '*many* + countable · *much* + uncountable', ar: 'many معدود · much غير معدود' },
        { en: '*a few* books (قليل معدود) · *a little* water (قليل غير معدود)', ar: 'a few / a little' },
      ],
    },
    examples: [
      { en: 'I have *some* good news.', ar: 'عندي أخبار جيدة.', why: '*some* in a POSITIVE sentence — the default for an unspecified amount.', whyAr: 'some في الإثبات، وهي الأصل للكمّية غير المحدّدة.' },
      { en: 'There are *some* apples in the fridge.', ar: 'توجد بعض التفاحات في الثلاجة.', why: '*some* works with plural countables too, still in the positive.', whyAr: 'some تصلح للجمع المعدود أيضًا في الإثبات.' },
      { en: 'I don’t have *any* money with me.', ar: 'ليس معي أيّ نقود.', why: '*any* in a NEGATIVE sentence. Using *some* here would sound wrong.', whyAr: 'any في النفي، و some هنا تبدو خاطئة.' },
      { en: 'Do you have *any* questions?', ar: 'هل لديك أيّ أسئلة؟', why: '*any* in a QUESTION — the second of its two homes.', whyAr: 'any في السؤال، وهو موضعها الثاني.' },
      { en: 'She has *many* friends.', ar: 'لديها أصدقاء كثيرون.', why: '*many* for things you can COUNT: friends can be numbered.', whyAr: 'many للمعدود؛ الأصدقاء يُعدّون.' },
      { en: 'How *many* students are there?', ar: 'كم عدد الطلاب؟', why: '*How many* asks for a number, so the noun must be countable and plural.', whyAr: 'How many تسأل عن عدد فالاسم معدود وجمع.' },
      { en: 'We don’t have *much* time.', ar: 'ليس لدينا وقت كثير.', why: '*much* for things you CANNOT count: time has no plural.', whyAr: 'much لغير المعدود؛ الوقت لا يُجمع.' },
      { en: 'How *much* is this jacket?', ar: 'بكم هذا المعطف؟', why: '*How much* asks about price or quantity of an uncountable.', whyAr: 'How much تسأل عن ثمن أو كمّية غير معدودة.' },
      { en: 'There is *a lot of* traffic today.', ar: 'الازدحام كثير اليوم.', why: '*a lot of* works with BOTH kinds — the safe choice when unsure.', whyAr: 'a lot of تصلح للنوعين، وهي الخيار الآمن عند الشكّ.' },
      { en: 'He reads *a lot of* books.', ar: 'يقرأ كتبًا كثيرة.', why: 'Same phrase with a countable noun, which is why it is so useful.', whyAr: 'العبارة نفسها مع المعدود، ولهذا كانت مفيدة.' },
      { en: 'I have *a few* ideas.', ar: 'لديّ أفكار قليلة.', why: '*a few* = a small number of COUNTABLE things, and it sounds positive.', whyAr: 'a few عدد قليل من المعدود بنبرة إيجابية.' },
      { en: 'Add *a little* sugar, please.', ar: 'أضف قليلًا من السكر من فضلك.', why: '*a little* = a small amount of UNCOUNTABLE. Sugar cannot be counted.', whyAr: 'a little كمّية قليلة من غير المعدود.' },
    ],
    exercises: [
      { q: 'some/any: “I have ___ questions.”', a: 'I have *some* questions.' },
      { q: 'some/any: “I don’t have ___ questions.”', a: 'I don’t have *any* questions.' },
      { q: 'much/many: “How ___ children do you have?”', a: 'How *many* children do you have?' },
      { q: 'much/many: “We don’t have ___ water.”', a: 'We don’t have *much* water.' },
      { q: 'Fix: “She has much friends.”', a: 'She has *many* friends. (or: a lot of friends)' },
      { q: 'a few / a little: “I need ___ minutes and ___ help.”', a: '*a few* minutes and *a little* help.' },
    ],
    reading: {
      title: 'Shopping for the Weekend', titleAr: 'تسوّق نهاية الأسبوع',
      passage: [
        'On Saturday morning I did *some* shopping for the weekend.',
        'I bought *a lot of* vegetables, *some* fish, and *a few* lemons.',
        'There wasn’t *much* olive oil at home, so I took two bottles.',
        'I wanted *some* dates, but the shop didn’t have *any*.',
        '“How *much* is everything?” I asked. Luckily, it wasn’t *much*!',
      ],
      tip: 'some → positive · any → negative/question · many counts, much doesn’t.',
      tipAr: 'some للإثبات · any للنفي والسؤال · many للمعدود و much لغيره.',
    },
    homework: [
      { en: 'Write 3 sentences with some and 3 with any', ar: 'اكتب ٣ جمل بـ some و٣ بـ any' },
      { en: 'List 5 countable and 5 uncountable nouns', ar: 'اكتب ٥ أسماء معدودة و٥ غير معدودة' },
      { en: 'Write about your kitchen with much/many/a lot of', ar: 'اكتب عن مطبخك بكلمات الكمية' },
    ],
    editing: {
      wrong: [
        'I don’t have some time today.',
        'How much books did you read this year?',
        'There are much tourists in Agadir, and I have any friends there.',
      ],
      correct: [
        'I don’t have *any* time today.',
        'How *many* books did you read this year?',
        'There are *a lot of* tourists in Agadir, and I have *some* friends there.',
      ],
    },
  },

  /* ─────────────────────────── 10.5 · PAST CONTINUOUS (A2) ─────────────────────────── */
  {
    no: 10.5, cefr: 'A2', tag: 'Past Continuous', tagAr: 'الماضي المستمر',
    title: 'Past Continuous — what was happening',
    titleAr: 'الماضي المستمر — ما كان يحدث',
    objectives: [
      { en: 'Form: was/were + verb-ing', ar: 'التكوين: was/were + الفعل-ing' },
      { en: 'Describe a scene in the past', ar: 'وصف مشهد في الماضي' },
      { en: 'Combine with past simple using when/while', ar: 'الدمج مع الماضي البسيط بـ when/while' },
      { en: 'Write richer narrative paragraphs', ar: 'كتابة سردٍ أغنى' },
    ],
    rule: {
      en: 'The past continuous (*was/were + verb-ing*) paints the background of a story; the past simple gives the events: “I *was walking* home *when* it *started* to rain.”',
      ar: 'الماضي المستمر (was/were + الفعل-ing) يرسم خلفية القصة، والماضي البسيط يعطي الأحداث: كنت أمشي عندما بدأ المطر.',
    },
    explain: {
      intro: 'This is the tense that turns a flat story into a scene. Long action in progress → past continuous. Short action that interrupts → past simple.',
      introAr: 'هذا الزمن يحوّل السرد المسطّح إلى مشهد. الفعل الطويل المستمر ← ماضٍ مستمر، والفعل القصير المقاطِع ← ماضٍ بسيط.',
      points: [
        { en: 'Scene: The sun *was shining*. People *were talking*.', ar: 'الخلفية' },
        { en: '*while* + long action: *While* I was cooking…', ar: 'while مع الطويل' },
        { en: '*when* + short action: …*when* the phone rang.', ar: 'when مع القصير' },
        { en: 'I/he/she/it *was* · you/we/they *were*', ar: 'was/were' },
      ],
    },
    form: {
      affirmative: [
        'I / He / She / It *was working*.',
        'You / We / They *were working*.',
      ],
      negative: [
        'I *was not* (wasn’t) working.',
        'They *were not* (weren’t) working.',
      ],
      question: [
        '*Was* she working? — Yes, she *was*.',
        '*Were* you sleeping? — No, I *wasn’t*.',
        'What *were* you doing at 8 pm?',
      ],
      note: 'Combine: past continuous (background) + *when* + past simple (event): “We *were eating when* the lights *went* out.”',
      noteAr: 'الدمج: ماضٍ مستمر (خلفية) + when + ماضٍ بسيط (حدث).',
    },
    signals: [
      { en: 'while', ar: 'بينما' }, { en: 'when', ar: 'عندما' }, { en: 'at 8 o’clock last night', ar: 'في الثامنة ليلة أمس' },
      { en: 'all day', ar: 'طوال اليوم' }, { en: 'at that moment', ar: 'في تلك اللحظة' },
    ],
    examples: [
      { en: 'I *was studying* at nine last night.', ar: 'كنت أذاكر التاسعة ليلة أمس.', why: '*was* + *-ing* — an action in progress at a POINT in the past, not finished.', whyAr: 'was + ing لفعل كان جاريًا في لحظة ماضية لا منتهيًا.' },
      { en: 'She *was cooking* dinner.', ar: 'كانت تطبخ العشاء.', why: '*she* takes *was*, exactly like the present *is* moves back one step.', whyAr: 'she تأخذ was، تمامًا كما ترجع is خطوة للوراء.' },
      { en: 'They *were playing* football all afternoon.', ar: 'كانوا يلعبون الكرة طوال العصر.', why: 'Plural → *were*. Only the *be* verb changes; the *-ing* never does.', whyAr: 'الجمع يأخذ were؛ لا يتغيّر إلا فعل الكينونة.' },
      { en: 'The birds *were singing*, and the sun *was rising*.', ar: 'كانت الطيور تغرّد والشمس تشرق.', why: 'Two long actions running side by side — this tense paints the background.', whyAr: 'فعلان طويلان متوازيان؛ هذا الزمن يرسم الخلفية.' },
      { en: 'I *was walking* home *when* it *started* to rain.', ar: 'كنت أمشي عندما بدأ المطر.', why: 'THE core pattern: long action (*was walking*) INTERRUPTED by a short one (*started*).', whyAr: 'النمط الجوهري: فعل طويل يقطعه فعل قصير.' },
      { en: '*While* I *was reading*, the phone *rang*.', ar: 'بينما كنت أقرأ رنّ الهاتف.', why: '*While* introduces the LONG action; the short one takes the past simple.', whyAr: 'while تُدخل الفعل الطويل، والقصير يأخذ الماضي البسيط.' },
      { en: 'He *was driving* fast *when* the police *stopped* him.', ar: 'كان يقود بسرعة عندما أوقفته الشرطة.', why: 'Same interruption pattern — *when* marks the short action that cuts in.', whyAr: 'النمط نفسه، و when تُعلّم الفعل القاطع.' },
      { en: 'We *weren’t sleeping* — we *were watching* a film.', ar: 'لم نكن نائمين بل نشاهد فيلمًا.', why: 'Negative: *not* sits between *be* and the *-ing*, as always.', whyAr: 'النفي: not بين فعل الكينونة و ing كالعادة.' },
      { en: '*Was* she crying? No, she *was laughing*!', ar: 'أكانت تبكي؟ لا، كانت تضحك!', why: 'Question: move *was* to the front. Nothing else moves.', whyAr: 'السؤال بتقديم was دون تحريك سواه.' },
      { en: 'What *were* you *doing* when I called?', ar: 'ماذا كنت تفعل حين اتصلت؟', why: '*What were you doing* asks about the background at that moment.', whyAr: 'هذا السؤال يستفسر عن الخلفية في تلك اللحظة.' },
    ],
    exercises: [
      { q: 'Form: “At 7 am I ___ (sleep).”', a: 'At 7 am I *was sleeping*.' },
      { q: 'Form: “They ___ (work) all night.”', a: 'They *were working* all night.' },
      { q: 'Combine: “I cooked. The phone rang.” (while)', a: '*While* I *was cooking*, the phone *rang*.' },
      { q: 'was/were: “___ you waiting for me?”', a: '*Were* you waiting for me?' },
      { q: 'Fix: “When I saw him, he walked his dog.” (in progress)', a: 'When I saw him, he *was walking* his dog.' },
    ],
    reading: {
      title: 'The Night the Lights Went Out', titleAr: 'ليلة انقطاع الكهرباء',
      passage: [
        'It was a normal Tuesday evening at our house.',
        'My mother *was cooking*, my father *was reading* the news, and I *was doing* my homework.',
        'Suddenly, the lights *went* out, and the whole street *turned* black.',
        '*While* we *were looking* for candles, my little brother *started* to laugh in the dark.',
        'We spent the evening telling stories by candlelight — honestly, it *was* the best Tuesday ever.',
      ],
      tip: 'Background = was/were + -ing · sudden events = past simple. That contrast is what makes a story vivid.',
      tipAr: 'الخلفية ماضٍ مستمر والأحداث المفاجئة ماضٍ بسيط — هذا التباين يصنع حيوية القصة.',
    },
    homework: [
      { en: 'Describe what your family were doing yesterday at 8 pm (4 sentences)', ar: 'صِف ما كانت تفعله عائلتك أمس الثامنة مساءً' },
      { en: 'Write 3 while/when sentences combining the two past tenses', ar: 'اكتب ٣ جمل بـ while/when' },
      { en: 'Start a short story with two background sentences', ar: 'ابدأ قصة قصيرة بجملتي خلفية' },
    ],
    editing: {
      wrong: [
        'While I walked home, I was seeing an accident.',
        'She were studying when I were calling her.',
        'The children was playing outside all morning.',
      ],
      correct: [
        'While I *was walking* home, I *saw* an accident.',
        'She *was* studying when I *called* her.',
        'The children *were* playing outside all morning.',
      ],
    },
  },

  /* ─────────────────────────── 11.3 · MODALS (A2) ─────────────────────────── */
  {
    no: 11.3, cefr: 'A2', tag: 'Modals', tagAr: 'الأفعال الناقصة',
    title: 'Modals — can, should, must, have to',
    titleAr: 'الأفعال الناقصة — can / should / must / have to',
    objectives: [
      { en: 'Express ability with can/can’t', ar: 'التعبير عن القدرة بـ can' },
      { en: 'Give advice with should/shouldn’t', ar: 'تقديم النصيحة بـ should' },
      { en: 'Express obligation with must / have to', ar: 'التعبير عن الوجوب بـ must/have to' },
      { en: 'Use modals to write opinions', ar: 'استخدامها في كتابة الرأي' },
    ],
    rule: {
      en: 'Modals come before the *base verb* and never change: “She *can swim*” (NOT cans, NOT to swim). *can* = ability, *should* = advice, *must / have to* = obligation.',
      ar: 'الأفعال الناقصة تسبق الفعل المجرّد ولا تتغيّر أبدًا: She can swim. — can للقدرة، should للنصيحة، must/have to للوجوب.',
    },
    explain: {
      intro: 'Opinion paragraphs run on modals: “Students *should* sleep early because…”. Master three meanings: ability, advice, obligation.',
      introAr: 'فقرات الرأي تقوم على الأفعال الناقصة: «على الطلاب أن يناموا مبكرًا لأن…». أتقن المعاني الثلاثة: قدرة، نصيحة، وجوب.',
      points: [
        { en: '*can / can’t* = ability: I *can* drive.', ar: 'القدرة' },
        { en: '*should / shouldn’t* = advice: You *should* rest.', ar: 'النصيحة' },
        { en: '*must / have to* = obligation: You *must* stop here.', ar: 'الوجوب' },
        { en: '*mustn’t* = forbidden: You *mustn’t* smoke here.', ar: 'المنع' },
      ],
    },
    form: {
      affirmative: [
        'subject + *can / should / must* + base verb',
        'She *can swim*. · You *should study*. · We *must leave* now.',
      ],
      negative: [
        'I *can’t* come today.',
        'You *shouldn’t* eat so fast.',
        'You *mustn’t* park here. (forbidden)',
      ],
      question: [
        '*Can* you help me? — Yes, I *can*.',
        '*Should* I call him? — Yes, you *should*.',
      ],
      note: 'NEVER add -s or “to”: “He can *swim*” — not “He cans swim” ✗, not “He can to swim” ✗.',
      noteAr: 'لا نضيف -s ولا to أبدًا: He can swim فقط.',
    },
    examples: [
      { en: 'I *can* speak three languages.', ar: 'أستطيع التحدث بثلاث لغات.', why: '*can* + BARE verb for ability. Modals never take *to* and never take *-s*.', whyAr: 'can + مجرّد للقدرة؛ الأفعال الناقصة لا تأخذ to ولا s.' },
      { en: 'She *can’t* come to the meeting.', ar: 'لا تستطيع حضور الاجتماع.', why: 'Negative attaches straight to the modal — no *doesn’t* is needed.', whyAr: 'النفي يلتصق بالفعل الناقص ولا حاجة إلى doesn’t.' },
      { en: '*Can* you swim?', ar: 'هل تستطيع السباحة؟', why: 'Question: the modal moves to the front by itself. No helper is added.', whyAr: 'السؤال: يتقدّم الفعل الناقص وحده بلا مساعد.' },
      { en: 'You *should* drink more water.', ar: 'ينبغي أن تشرب ماءً أكثر.', why: '*should* = advice. It is softer than *must* — a recommendation, not a rule.', whyAr: 'should للنصيحة، وهي أخفّ من must.' },
      { en: 'Students *should* review every day.', ar: 'على الطلاب المراجعة يوميًا.', why: 'Still bare after *should*, even with a plural subject.', whyAr: 'يبقى الفعل مجرّدًا بعد should ولو كان الفاعل جمعًا.' },
      { en: 'You *shouldn’t* stay up late.', ar: 'لا ينبغي أن تسهر.', why: '*shouldn’t* advises against — the polite way to criticise in writing.', whyAr: 'shouldn’t تنصح بالترك، وهي أدب النقد في الكتابة.' },
      { en: 'Drivers *must* stop at the red light.', ar: 'يجب على السائقين الوقوف عند الإشارة.', why: '*must* = a rule with no choice, often a law or a written regulation.', whyAr: 'must التزام لا خيار فيه، وغالبًا قانون أو نظام.' },
      { en: 'I *have to* finish this report today.', ar: 'عليّ إنهاء التقرير اليوم.', why: '*have to* is an obligation from OUTSIDE — circumstances, not your judgement.', whyAr: 'have to التزام من الخارج تفرضه الظروف.' },
      { en: 'You *mustn’t* use your phone in the exam.', ar: 'يُمنع استخدام الهاتف في الامتحان.', why: '*mustn’t* is a PROHIBITION, not an absence of obligation. That is the trap.', whyAr: 'mustn’t تحريم لا إعفاء، وهذا هو الفخّ.' },
      { en: 'In my opinion, children *should* read every night.', ar: 'في رأيي، على الأطفال القراءة كل ليلة.', why: 'Essay use: *should* is the natural modal for a recommendation.', whyAr: 'في المقال: should هي الفعل الطبيعي للتوصية.' },
    ],
    exercises: [
      { q: 'can/should/must: “You ___ wear a seatbelt — it’s the law.”', a: 'You *must* wear a seatbelt.' },
      { q: 'can/should: “I’m tired.” — “You ___ rest.”', a: 'You *should* rest.' },
      { q: 'Fix: “He cans play the guitar.”', a: 'He *can play* the guitar.' },
      { q: 'Fix: “She must to study more.”', a: 'She *must study* more.' },
      { q: 'Make negative (forbidden): “You ___ smoke in the hospital.”', a: 'You *mustn’t* smoke in the hospital.' },
      { q: 'Opinion: complete “Students ___ sleep early because …”', a: 'Students *should* sleep early because the mind needs rest.' },
    ],
    reading: {
      title: 'Advice for New Learners', titleAr: 'نصائح للمتعلمين الجدد',
      passage: [
        'Anyone *can* learn English — age does not matter.',
        'But learners *should* practice a little every single day.',
        'You *shouldn’t* wait for the “perfect” moment, because it never comes.',
        'You *must* accept your mistakes; they are part of the road.',
        'And remember: you *don’t have to* be fast — you only *have to* keep going.',
      ],
      tip: 'can (ability) · should (advice) · must / have to (obligation) — the vocabulary of opinion writing.',
      tipAr: 'قدرة · نصيحة · وجوب — مفردات كتابة الرأي.',
    },
    homework: [
      { en: 'Write 3 things you can do and 2 you can’t', ar: 'اكتب ٣ أشياء تستطيعها واثنين لا' },
      { en: 'Give a friend 3 pieces of advice with should', ar: 'قدّم ٣ نصائح بـ should' },
      { en: 'Write 3 school rules with must / mustn’t', ar: 'اكتب ٣ قوانين مدرسية بـ must/mustn’t' },
    ],
    editing: {
      wrong: [
        'My sister cans cook very well.',
        'You should to visit the doctor.',
        'Students must respects the teacher.',
      ],
      correct: [
        'My sister *can cook* very well.',
        'You should *visit* the doctor.',
        'Students must *respect* the teacher.',
      ],
    },
  },

  /* ─────────────────────────── 11.6 · COMPARATIVES (A2) ─────────────────────────── */
  {
    no: 11.6, cefr: 'A2', tag: 'Comparatives', tagAr: 'المقارنة والتفضيل',
    title: 'Comparatives & Superlatives — bigger, the biggest',
    titleAr: 'المقارنة والتفضيل — bigger / the biggest',
    objectives: [
      { en: 'Compare two things with -er / more', ar: 'المقارنة بين شيئين' },
      { en: 'Use the -est / the most for the top', ar: 'التفضيل بـ the -est / the most' },
      { en: 'Spell comparative forms correctly', ar: 'إملاء صيغ المقارنة' },
      { en: 'Use good→better→best, bad→worse→worst', ar: 'الصيغ الشاذة' },
    ],
    rule: {
      en: 'Short adjectives: add *-er / -est* (old → old*er* → the old*est*). Long adjectives: *more / the most* (+ beautiful). Compare with *than*: “Rabat is smaller *than* Casablanca.”',
      ar: 'الصفات القصيرة تأخذ -er/-est، والطويلة more/the most. والمقارنة بـ than.',
    },
    explain: {
      intro: 'Descriptive and opinion paragraphs need comparison: bigger, cheaper, the best. Short adjective → -er; three syllables or more → more.',
      introAr: 'الفقرات الوصفية وفقرات الرأي تحتاج المقارنة: أكبر، أرخص، الأفضل. صفة قصيرة ← -er، وطويلة ← more.',
      points: [
        { en: 'Short: old → old*er* than → the old*est*', ar: 'قصيرة' },
        { en: 'Long: *more* expensive than → *the most* expensive', ar: 'طويلة' },
        { en: 'Irregular: good→*better*→*best* · bad→*worse*→*worst*', ar: 'شاذّة' },
        { en: 'Superlative always takes *the*: *the* biggest city', ar: 'التفضيل مع the' },
      ],
    },
    spelling: [
      { rule: 'Most short adjectives → *-er / -est*', ar: 'الأغلب ← -er/-est', examples: 'old → older → oldest · cheap → cheaper → cheapest' },
      { rule: 'Ends in -e → just *-r / -st*', ar: 'ينتهي بـ e ← -r/-st', examples: 'nice → nicer → nicest · large → larger → largest' },
      { rule: 'Consonant + y → *-ier / -iest*', ar: 'ساكن + y ← -ier/-iest', examples: 'happy → happier → happiest · easy → easier → easiest' },
      { rule: 'Short vowel + consonant → *double* it', ar: 'ضاعف الحرف', examples: 'big → bigger → biggest · hot → hotter → hottest' },
      { rule: 'Irregular', ar: 'شاذّة', examples: 'good → better → best · bad → worse → worst · far → farther → farthest' },
    ],
    examples: [
      { en: 'My brother is *taller than* me.', ar: 'أخي أطول مني.', why: 'Short adjective + *-er* + *than*. The *than* is not optional.', whyAr: 'الصفة القصيرة + er + than، و than لازمة.' },
      { en: 'This bag is *cheaper than* that one.', ar: 'هذه الحقيبة أرخص من تلك.', why: 'Same pattern — one syllable takes *-er*, never *more*.', whyAr: 'النمط نفسه؛ المقطع الواحد يأخذ er لا more.' },
      { en: 'Summer is *hotter than* spring.', ar: 'الصيف أحرّ من الربيع.', why: 'A short vowel doubles the final consonant: *hot* → *hotter*.', whyAr: 'العلّة القصيرة تضاعف الحرف الأخير.' },
      { en: 'English is *easier than* I thought.', ar: 'الإنجليزية أسهل مما ظننت.', why: 'Consonant + *y* → *-ier*, the same spelling family as plurals.', whyAr: 'ساكن + y تصير ier من عائلة الإملاء نفسها.' },
      { en: 'This hotel is *more expensive than* ours.', ar: 'هذا الفندق أغلى من فندقنا.', why: 'Three syllables → *more*, never *expensiver*. Length decides the form.', whyAr: 'ثلاثة مقاطع تأخذ more؛ الطول يحدّد الصيغة.' },
      { en: 'Reading is *more useful than* scrolling.', ar: 'القراءة أنفع من التصفح.', why: 'Two syllables or more usually take *more* + adjective.', whyAr: 'مقطعان فأكثر يأخذان more غالبًا.' },
      { en: 'Casablanca is *the biggest* city in Morocco.', ar: 'الدار البيضاء أكبر مدينة في المغرب.', why: 'Superlative needs *the* — it singles out exactly one.', whyAr: 'التفضيل يحتاج the لأنه يفرد واحدًا.' },
      { en: 'She is *the smartest* student in class.', ar: 'هي أذكى طالبة في الصف.', why: 'Short adjective → *the* + *-est*, the mirror of *-er*.', whyAr: 'الصفة القصيرة تأخذ the + est مقابل er.' },
      { en: 'This is *the most beautiful* beach here.', ar: 'هذا أجمل شاطئ هنا.', why: 'Long adjective → *the most* + adjective.', whyAr: 'الصفة الطويلة تأخذ the most.' },
      { en: 'My results are *better* this month.', ar: 'نتائجي أفضل هذا الشهر.', why: '*good* is irregular: *better*, never *gooder*.', whyAr: 'good شاذّة فتصير better.' },
      { en: 'Yesterday was *the worst* day of the week.', ar: 'الأمس كان أسوأ يوم في الأسبوع.', why: '*bad* is irregular too: *worse* / *the worst*. Learn the pair together.', whyAr: 'bad شاذّة أيضًا، واحفظ الزوج معًا.' },
    ],
    exercises: [
      { q: 'Compare: “Rabat / small / Casablanca”', a: 'Rabat is *smaller than* Casablanca.' },
      { q: 'Superlative: “Nile / long / river in Africa”', a: 'The Nile is *the longest* river in Africa.' },
      { q: 'Form: “happy → ___ → ___”', a: 'happier → the happiest' },
      { q: 'Form: “expensive → ___ → ___”', a: 'more expensive → the most expensive' },
      { q: 'Fix: “This exam is more easy than the last.”', a: 'This exam is *easier* than the last.' },
      { q: 'Fix: “He is the goodest player.”', a: 'He is *the best* player.' },
    ],
    reading: {
      title: 'Two Cities', titleAr: 'مدينتان',
      passage: [
        'People always ask me which city is *better* — Fes or Marrakech.',
        'Fes is *older* and *quieter*, with *the most beautiful* medina I have ever seen.',
        'Marrakech is *busier*, *more modern*, and honestly *more expensive*.',
        'For tourists, Marrakech may be *more exciting*; for history, Fes is *the richest*.',
        'For me, the answer is simple: home is always *the best* city.',
      ],
      tip: 'Short adj + -er/-est · long adj + more/most · good→better→best.',
      tipAr: 'قصيرة -er/-est · طويلة more/most · good→better→best.',
    },
    homework: [
      { en: 'Compare your city with another (4 sentences)', ar: 'قارن مدينتك بأخرى في ٤ جمل' },
      { en: 'Write 3 superlatives about your family (the tallest…)', ar: 'اكتب ٣ جمل تفضيل عن عائلتك' },
      { en: 'Write the 3 forms of: big, easy, good, expensive', ar: 'اكتب الصيغ الثلاث للصفات' },
    ],
    editing: {
      wrong: [
        'My new phone is more fast than the old one.',
        'This is the baddest film of the year.',
        'Fes is one of the most old cities in the world.',
      ],
      correct: [
        'My new phone is *faster* than the old one.',
        'This is *the worst* film of the year.',
        'Fes is one of *the oldest* cities in the world.',
      ],
    },
  },

  /* ─────────────────────────── 12.5 · WORD ORDER (A2) ─────────────────────────── */
  {
    no: 12.5, cefr: 'A2', tag: 'Word order', tagAr: 'ترتيب الجملة',
    title: 'Word Order — Subject → Verb → Object',
    titleAr: 'ترتيب الجملة — فاعل ثم فعل ثم مفعول',
    objectives: [
      { en: 'Build every sentence as S → V → O', ar: 'بناء الجملة: فاعل، فعل، مفعول' },
      { en: 'Put place BEFORE time at the end', ar: 'المكان قبل الزمان في النهاية' },
      { en: 'Place frequency adverbs correctly', ar: 'موضع ظروف التكرار' },
      { en: 'Avoid Arabic verb-first order', ar: 'تجنّب البدء بالفعل كالعربية' },
    ],
    rule: {
      en: 'English order is fixed: *Subject + Verb + Object*, then *place*, then *time*: “I met my friend *at the café* *yesterday*.” Arabic often starts with the verb — English almost never does.',
      ar: 'ترتيب الإنجليزية ثابت: فاعل + فعل + مفعول، ثم المكان، ثم الزمان. العربية كثيرًا ما تبدأ بالفعل — الإنجليزية لا تفعل تقريبًا.',
    },
    explain: {
      intro: '“ذهب أحمد إلى السوق أمس” starts with the verb. In English the subject ALWAYS comes first: “Ahmed went to the market yesterday.” Fix this reflex and half your sentence errors disappear.',
      introAr: 'العربية تقول «ذهب أحمد…» بالفعل أولًا. الإنجليزية تبدأ بالفاعل دائمًا: Ahmed went… صحّح هذا الانعكاس ونصف أخطائك سيختفي.',
      points: [
        { en: 'S+V+O: *Ahmed* (S) *bought* (V) *bread* (O).', ar: 'فاعل فعل مفعول' },
        { en: 'Place before time: …*at home* *last night*.', ar: 'المكان قبل الزمان' },
        { en: 'Frequency adverb BEFORE the main verb: I *always* drink tea.', ar: 'ظرف التكرار قبل الفعل' },
        { en: '…but AFTER be: She is *always* late.', ar: 'وبعد فعل الكينونة' },
      ],
    },
    form: {
      affirmative: [
        '*Subject* + *Verb* + *Object*: Sara reads books.',
        '+ place + time: Sara reads books *in the library* *every evening*.',
      ],
      negative: [
        'Keep the order, add the negative: Sara *doesn’t read* magazines at home.',
      ],
      question: [
        'Question word + auxiliary + S + V: *Where does* Sara read? · *When did* you arrive?',
      ],
      note: 'Time can also open the sentence with a comma: “*Yesterday,* I met my friend at the café.” But NEVER start with the verb.',
      noteAr: 'يمكن أن يبدأ الزمان الجملة مع فاصلة: Yesterday, … لكن لا تبدأ بالفعل أبدًا.',
    },
    examples: [
      { en: '*Ahmed went* to the market yesterday.', ar: 'ذهب أحمد إلى السوق أمس.', why: 'Subject → Verb → Object. Arabic often puts the verb first; English almost never does.', whyAr: 'فاعل ← فعل ← مفعول. العربية تقدّم الفعل غالبًا، والإنجليزية لا تكاد تفعل.' },
      { en: '*My mother makes* couscous on Fridays.', ar: 'تعدّ أمي الكسكس أيام الجمعة.', why: 'The same S-V-O spine, whatever the tense.', whyAr: 'العمود نفسه مهما تغيّر الزمن.' },
      { en: '*The students finished* the exam at noon.', ar: 'أنهى الطلاب الامتحان ظهرًا.', why: 'Still S-V-O even when the subject is three words long.', whyAr: 'يبقى الترتيب ولو طال الفاعل.' },
      { en: 'I met my friend *at the café* *yesterday*.', ar: 'قابلت صديقي في المقهى أمس.', why: 'When both appear, PLACE comes before TIME. This order is fixed.', whyAr: 'إذا اجتمعا فالمكان قبل الزمان، وهو ترتيب ثابت.' },
      { en: 'She studies English *at home* *every evening*.', ar: 'تدرس الإنجليزية في البيت كل مساء.', why: 'Place then time again — *at home* before *every evening*.', whyAr: 'المكان ثم الزمان مرّة أخرى.' },
      { en: 'We played football *in the park* *last Sunday*.', ar: 'لعبنا الكرة في المنتزه الأحد الماضي.', why: 'The same order with a past sentence: where first, when second.', whyAr: 'الترتيب نفسه في الماضي: أين ثم متى.' },
      { en: 'I *always* drink tea in the morning.', ar: 'أشرب الشاي دائمًا صباحًا.', why: 'Frequency adverbs go BEFORE the main verb.', whyAr: 'ظروف التكرار تسبق الفعل الأصلي.' },
      { en: 'He *usually* walks to work.', ar: 'يمشي عادةً إلى العمل.', why: '*usually* sits in the same slot — before the verb, after the subject.', whyAr: 'usually في الموضع نفسه: بعد الفاعل وقبل الفعل.' },
      { en: 'She is *never* late.', ar: 'لا تتأخّر أبدًا.', why: 'THE exception: with *be*, the frequency adverb comes AFTER the verb.', whyAr: 'الاستثناء: مع فعل الكينونة يأتي الظرف بعده.' },
      { en: '*Yesterday,* we visited our grandparents.', ar: 'أمس زرنا جدّينا.', why: 'A time word may open the sentence for emphasis — then it takes a comma.', whyAr: 'يجوز تقديم الزمن للتأكيد، وحينها يأخذ فاصلة.' },
    ],
    exercises: [
      { q: 'Order: “went / to school / Omar / this morning”', a: '*Omar went to school this morning.*' },
      { q: 'Order: “couscous / makes / on Fridays / my mother”', a: '*My mother makes couscous on Fridays.*' },
      { q: 'Fix (verb first): “Visited my uncle us last week.”', a: 'My uncle *visited us* last week.' },
      { q: 'Place & time: “I saw him ___” (at the mosque / on Friday)', a: 'I saw him *at the mosque on Friday*.' },
      { q: 'Adverb position: “late / She / is / always”', a: 'She is *always* late.' },
      { q: 'Adverb position: “tea / I / drink / usually / in the morning”', a: 'I *usually* drink tea in the morning.' },
    ],
    reading: {
      title: 'A Friday at Home', titleAr: 'جمعة في البيت',
      passage: [
        '*My family gathers* at my grandmother’s house *every Friday*.',
        '*My mother and aunts prepare* couscous *in the big kitchen* *in the morning*.',
        '*We eat* together *around one large table* *after the prayer*.',
        'The children *always* play *in the courtyard* *in the afternoon*.',
        '*Yesterday,* my grandmother told us stories about her childhood — nobody wanted to leave.',
      ],
      tip: 'Every sentence: subject first, then verb, then object — place before time at the end.',
      tipAr: 'كل جملة: الفاعل أولًا ثم الفعل ثم المفعول — والمكان قبل الزمان.',
    },
    homework: [
      { en: 'Write 5 S+V+O sentences about your day (add place + time)', ar: 'اكتب ٥ جمل بالترتيب الصحيح' },
      { en: 'Translate 3 Arabic verb-first sentences into English order', ar: 'ترجم ٣ جمل عربية تبدأ بالفعل' },
      { en: 'Write 3 sentences with always/usually/never in position', ar: 'اكتب ٣ جمل بظروف التكرار' },
    ],
    editing: {
      wrong: [
        'Went my father to the mosque on Friday.',
        'I drink always coffee in the morning.',
        'We visited last summer our cousins in Tangier.',
      ],
      correct: [
        '*My father went* to the mosque on Friday.',
        'I *always drink* coffee in the morning.',
        'We visited our cousins *in Tangier last summer*.',
      ],
    },
  },

  /* ─────────────────────────── 16.5 · RELATIVE CLAUSES (B1) ─────────────────────────── */
  {
    no: 16.5, cefr: 'B1', tag: 'Relative clauses', tagAr: 'جمل الوصل',
    title: 'Relative Clauses — who, which, that',
    titleAr: 'جمل الوصل — who / which / that',
    objectives: [
      { en: 'Describe people with who', ar: 'وصف الأشخاص بـ who' },
      { en: 'Describe things with which/that', ar: 'وصف الأشياء بـ which/that' },
      { en: 'Combine two short sentences into one', ar: 'دمج جملتين قصيرتين في واحدة' },
      { en: 'Write longer, richer sentences', ar: 'كتابة جمل أطول وأغنى' },
    ],
    rule: {
      en: 'A relative clause adds information about a noun: *who* for people, *which/that* for things: “The teacher *who taught me* English lives here.”',
      ar: 'جملة الوصل تضيف معلومة عن الاسم: who للأشخاص و which/that للأشياء.',
    },
    explain: {
      intro: 'This is how sentences grow up. Instead of two short sentences, one rich sentence: “I have a friend. He lives in Dubai.” → “I have a friend *who lives in Dubai*.”',
      introAr: 'هكذا تنضج الجمل. بدل جملتين قصيرتين، جملة واحدة غنية: «لي صديق يعيش في دبي».',
      points: [
        { en: '*who* = a person: the man *who* helped me', ar: 'who للعاقل' },
        { en: '*which / that* = a thing: the book *that* I read', ar: 'which/that لغير العاقل' },
        { en: '*where* = a place: the café *where* we met', ar: 'where للمكان' },
        { en: 'The clause sits right AFTER the noun it describes', ar: 'بعد الاسم مباشرة' },
      ],
    },
    form: {
      affirmative: [
        'noun (person) + *who* + verb…: the woman *who lives* next door',
        'noun (thing) + *which/that* + verb…: the film *that won* the prize',
        'noun (place) + *where* + clause: the city *where I was born*',
      ],
      negative: [
        'Use the normal negative inside: a man *who doesn’t like* noise',
      ],
      question: [
        'Who is the person *who called* you?',
        'Is this the bag *that you lost*?',
      ],
      note: 'Do NOT repeat the pronoun: “the book that I read *it*” ✗ → “the book that I read” ✓ (Arabic adds a pronoun — English doesn’t).',
      noteAr: 'لا تكرّر الضمير: نقول the book that I read وليس …that I read it — فالعربية تضيف ضميرًا والإنجليزية لا.',
    },
    examples: [
      { en: 'I have a friend *who lives* in Dubai.', ar: 'لي صديق يعيش في دبي.', why: '*who* for PEOPLE. The clause tells you WHICH friend, so no commas.', whyAr: 'who للأشخاص، والجملة تحدّد أيّ صديق فلا فواصل.' },
      { en: 'She is the doctor *who helped* my father.', ar: 'هي الطبيبة التي ساعدت أبي.', why: '*who* again — essential information, so it stays glued to the noun.', whyAr: 'who أيضًا، ومعلومة أساسية فتلتصق بالاسم.' },
      { en: 'People *who exercise* live longer.', ar: 'من يمارسون الرياضة يعيشون أطول.', why: 'Defining a whole category: which people live longer? These ones.', whyAr: 'تحديد فئة كاملة: أيّ الناس يعيشون أطول؟ هؤلاء.' },
      { en: 'This is the book *that changed* my life.', ar: 'هذا الكتاب الذي غيّر حياتي.', why: '*that* for THINGS, and it is the most flexible relative pronoun.', whyAr: 'that للأشياء، وهي أكثر الضمائر مرونةً.' },
      { en: 'The phone *which I bought* is excellent.', ar: 'الهاتف الذي اشتريته ممتاز.', why: '*which* is the object here, so you could drop it: *the phone I bought*.', whyAr: 'which مفعول هنا فيجوز حذفها.' },
      { en: 'I love food *that my mother makes*.', ar: 'أحب الطعام الذي تعدّه أمي.', why: 'Note there is NO extra pronoun after *makes* — Arabic would add one.', whyAr: 'لاحظ غياب الضمير العائد بعد makes، والعربية تضيفه.' },
      { en: 'Fes is the city *where I was born*.', ar: 'فاس هي المدينة التي وُلدت فيها.', why: '*where* for PLACES — it replaces *in which*.', whyAr: 'where للأماكن وتنوب عن in which.' },
      { en: 'That is the café *where we first met*.', ar: 'ذلك المقهى حيث التقينا أول مرة.', why: '*where* again, defining exactly which café is meant.', whyAr: 'where تحدّد أيّ مقهى بالضبط.' },
      { en: 'The students *who study daily* pass easily.', ar: 'الطلاب الذين يدرسون يوميًا ينجحون بسهولة.', why: 'Defining clause: only the daily students, not all students.', whyAr: 'جملة محدّدة: الطلاب المواظبون لا كلّ الطلاب.' },
      { en: 'A dictionary is a book *that explains* words.', ar: 'القاموس كتاب يشرح الكلمات.', why: 'A definition IS a relative clause — this is how dictionaries are written.', whyAr: 'التعريف نفسه جملة وصفية، وهكذا تُكتب المعاجم.' },
    ],
    exercises: [
      { q: 'Combine: “I met a woman. She speaks five languages.”', a: 'I met a woman *who speaks* five languages.' },
      { q: 'Combine: “This is the film. It won the prize.”', a: 'This is the film *that won* the prize.' },
      { q: 'who/which: “The man ___ called you is my uncle.”', a: 'The man *who* called you is my uncle.' },
      { q: 'who/which: “The keys ___ were lost are here.”', a: 'The keys *which/that* were lost are here.' },
      { q: 'Fix: “The book that I read it was great.”', a: 'The book that I read was great. *(no “it”)*' },
      { q: 'where: “Rabat is the city ___ I studied.”', a: 'Rabat is the city *where* I studied.' },
    ],
    reading: {
      title: 'The Teacher Who Changed Me', titleAr: 'المعلّم الذي غيّرني',
      passage: [
        'Everyone has a person *who changed* their life; mine was a teacher.',
        'Mr. Idrissi was a quiet man *who believed* in slow, daily progress.',
        'He gave me a notebook *that became* my best friend for a whole year.',
        'The classroom *where we studied* was old, but the ideas inside it were new.',
        'People *who plant* patience, he always said, harvest confidence.',
      ],
      tip: 'who (people) · that/which (things) · where (places) — right after the noun, and never repeat the pronoun.',
      tipAr: 'who للأشخاص · that/which للأشياء · where للأماكن — بعد الاسم مباشرة وبلا ضمير مكرّر.',
    },
    homework: [
      { en: 'Combine 4 pairs of short sentences with who/that', ar: 'ادمج ٤ أزواج من الجمل' },
      { en: 'Describe 3 people you know with “who” clauses', ar: 'صِف ٣ أشخاص بجمل who' },
      { en: 'Write 2 sentences with “where” about places you love', ar: 'اكتب جملتين بـ where' },
    ],
    editing: {
      wrong: [
        'My aunt is the person which taught me cooking.',
        'The car who is parked outside is my brother’s.',
        'This is the house that I grew up in it.',
      ],
      correct: [
        'My aunt is the person *who* taught me cooking.',
        'The car *that/which* is parked outside is my brother’s.',
        'This is the house that I grew up in. *(no “it”)*',
      ],
    },
  },

  /* ─────────────────────────── 22.5 · EXPANDING YOUR PARAGRAPH (B1 · studio) ─────────────────────────── */
  {
    no: 22.5, cefr: 'B1', tag: 'Expanding', tagAr: 'توسيع الفقرة',
    title: 'Expanding Your Paragraph — from 4 sentences to 8+',
    titleAr: 'توسيع الفقرة — من ٤ جمل إلى ٨ فأكثر',
    objectives: [
      { en: 'Grow every support with a reason, example, or detail', ar: 'تنمية كل جملة داعمة بسبب أو مثال أو تفصيل' },
      { en: 'Use the R.E.D. method: Reason, Example, Detail', ar: 'استخدام منهج R.E.D.' },
      { en: 'Keep the long paragraph on ONE topic', ar: 'إبقاء الفقرة الطويلة في موضوع واحد' },
      { en: 'Write a full 8–10 sentence paragraph', ar: 'كتابة فقرة من ٨–١٠ جمل' },
    ],
    rule: {
      en: 'A LONG paragraph is a short one where every supporting sentence is *expanded*: after each support, add a *Reason* (because…), an *Example* (for example…), or a *Detail*. That is the R.E.D. method.',
      ar: 'الفقرة الطويلة هي فقرة قصيرة وُسِّعت كل جملة داعمة فيها: بعد كل دعم أضف سببًا (because) أو مثالًا (for example) أو تفصيلًا. هذا منهج R.E.D.',
    },
    explain: {
      intro: 'Weak writers make a paragraph longer by adding *more ideas*. Strong writers make it longer by *going deeper* into the ideas they already have — one support at a time.',
      introAr: 'الكاتب الضعيف يطيل الفقرة بإضافة أفكار جديدة، والكاتب القوي يطيلها بالتعمّق في الأفكار التي عنده — دعمًا بعد دعم.',
      points: [
        { en: '*R* = Reason — answer “why?” with *because* / *since*', ar: 'R = السبب: أجب عن «لماذا؟» بـ because أو since' },
        { en: '*E* = Example — answer “like what?” with *for example* / *such as*', ar: 'E = المثال: أجب عن «مثل ماذا؟» بـ for example أو such as' },
        { en: '*D* = Detail — answer “what exactly?” with a number, a name, a picture', ar: 'D = التفصيل: أجب عن «ماذا بالضبط؟» برقم أو اسم أو صورة' },
        { en: 'One support + one R/E/D = *two* sentences instead of one', ar: 'دعم واحد + R أو E أو D = جملتان بدل واحدة' },
        { en: 'A new idea that leaves the topic is *not* expansion — it is a new paragraph', ar: 'الفكرة التي تخرج عن الموضوع ليست توسيعًا بل فقرة جديدة' },
        { en: '4 supports × R.E.D. → a natural 8–10 sentence paragraph', ar: '٤ دعامات × R.E.D. ← فقرة طبيعية من ٨–١٠ جمل' },
      ],
    },
    examples: [
      { en: 'Bare: My job is tiring. → +*R*: My job is tiring, *because I stand for nine hours every day*.', ar: 'مجرّد ← + سبب', why: 'The bare support states; the REASON proves. *because* is the cheapest expansion you own.', whyAr: 'الدعم المجرّد يذكر، والسبب يُثبت، و because أرخص توسيع تملكه.' },
      { en: 'Bare: My city is beautiful. → +*E*: My city is beautiful; *for example, the old medina glows orange at sunset*.', ar: 'مجرّد ← + مثال', why: 'The EXAMPLE makes an abstract claim visible — the reader can now picture it.', whyAr: 'المثال يجعل الادّعاء المجرّد مرئيًا فيتخيّله القارئ.' },
      { en: 'Bare: I love winter mornings. → +*D*: I love winter mornings — *the cold air, the empty streets, the first coffee*.', ar: 'مجرّد ← + تفصيل', why: 'The DETAIL paints with the senses; three small images beat one adjective.', whyAr: 'التفصيل يرسم بالحواس، وثلاث صور صغيرة خير من صفة واحدة.' },
      { en: 'Bare: English opened doors for me. → +*R*: …*since every good job here asks for it*.', ar: 'الفعل + السبب', why: '*since* works exactly like *because* but sounds slightly more formal.', whyAr: 'since كـ because لكنها أكثر رسميةً قليلًا.' },
      { en: 'Bare: My mother is patient. → +*E*: …*For instance, she taught me to read without once raising her voice*.', ar: 'الصفة + المثال المُثبِت', why: 'The example proves *patient* — showing beats telling, every time.', whyAr: 'المثال يُثبت «الصبر»؛ والإراءة خير من الإخبار دائمًا.' },
      { en: 'Bare: The course changed my writing. → +*D*: *In fact, my first email used to take an hour; now it takes six minutes*.', ar: 'التفصيل بالأرقام أقوى دليل', why: 'Numbers are the strongest detail available: an hour becomes six minutes.', whyAr: 'الأرقام أقوى التفاصيل: ساعة صارت ست دقائق.' },
      { en: 'Double it: support + *because* … + *For example*, … = three sentences from one.', ar: 'دعم + سبب + مثال = ثلاث جمل من واحدة', why: 'Two expansions on one support turn one sentence into three.', whyAr: 'توسيعان على دعم واحد يحوّلان جملة إلى ثلاث.' },
      { en: '✗ Off-topic is not expansion: “My job is tiring. *My sister lives in Spain*.” — cut it.', ar: 'الخروج عن الموضوع ليس توسيعًا — احذفه', why: 'New information is not expansion. Expansion goes DEEPER into what you have.', whyAr: 'المعلومة الجديدة ليست توسيعًا؛ التوسيع تعمّق فيما لديك.' },
    ],
    exercises: [
      { q: 'Add a REASON: “I prefer studying in the morning…”', a: '…*because my mind is fresh and the house is still silent*.' },
      { q: 'Add an EXAMPLE: “Small habits change everything.”', a: '*For example, ten minutes of reading a day became forty books in four years.*' },
      { q: 'Add a DETAIL: “The market was busy.”', a: '*Sellers shouted prices, children ran between the stalls, and the smell of mint filled the air.*' },
      { q: 'Which R.E.D. letter answers “why?”', a: '*R* — the Reason (because / since).' },
      { q: 'Off topic or expansion? “Reading calms me. *My laptop is old.*”', a: 'Off topic — *cut it*. It does not serve the topic sentence.' },
      { q: 'Expand in TWO steps: “Learning English was hard at first.”', a: '…*because I was ashamed of my accent. For example, I stayed silent in class for a whole month.*' },
    ],
    reading: {
      title: 'The Long Way Round', titleAr: 'الطريق الطويل',
      passage: [
        'My grandfather never wrote a short letter in his life.',
        'He said a short letter is a closed door, *because* it tells you what happened without ever telling you why.',
        '*For example*, he would not write “the harvest was good”; he wrote that the rain came late but came kindly, and that the whole village slept better in October.',
        '*In fact*, his letters were so full of small details — the price of sugar, the name of a new goat — that reading one felt like walking home.',
        'It took me twenty years to understand that he was not being slow.',
        'He was doing what every good writer does: staying on one idea long enough for it to become real.',
      ],
      tip: 'Notice: one topic, and every sentence expands it with a Reason, an Example, or a Detail — nothing new is introduced.',
      tipAr: 'لاحظ: موضوع واحد، وكل جملة توسّعه بسبب أو مثال أو تفصيل — دون إدخال فكرة جديدة.',
    },
    studio: {
      prompt: { en: 'Take a 4-sentence paragraph you wrote before and expand it to 8–10 sentences with R.E.D.', ar: 'خذ فقرة من ٤ جمل كتبتها سابقًا ووسّعها إلى ٨–١٠ جمل بمنهج R.E.D.' },
      model: {
        title: 'Before → After (watch it grow)', titleAr: 'قبل ← بعد (شاهدها تنمو)',
        parts: [
          { role: 'topic', en: 'Reading every day changed my life.' },
          { role: 'support', en: 'First, it improved my language,' },
          { role: 'support', en: 'because every book taught me tens of new words. (REASON)' },
          { role: 'support', en: 'For example, I learned most of my English vocabulary from short stories. (EXAMPLE)' },
          { role: 'support', en: 'Second, reading calms my mind.' },
          { role: 'support', en: 'After a stressful day, twenty quiet minutes with a book feel like a holiday. (DETAIL)' },
          { role: 'support', en: 'Finally, it made me a more interesting person,' },
          { role: 'support', en: 'because I always have a story or an idea to share with my friends. (REASON)' },
          { role: 'conclusion', en: 'In short, a few pages a day quietly rebuilt my whole world.' },
        ],
      },
      plan: [
        { label: 'Topic sentence', ar: 'الجملة الموضوعية' },
        { label: 'Support 1 + its Reason or Example', ar: 'دعم ١ + سببه أو مثاله' },
        { label: 'Support 2 + its Detail', ar: 'دعم ٢ + تفصيله' },
        { label: 'Support 3 + its Reason or Example', ar: 'دعم ٣ + سببه أو مثاله' },
        { label: 'Concluding sentence', ar: 'جملة الخاتمة' },
      ],
      toolkit: [
        { group: 'Add a REASON', ar: 'أضف سببًا', phrases: ['because …', 'since …', 'This is because …', 'The reason is that …'] },
        { group: 'Add an EXAMPLE', ar: 'أضف مثالًا', phrases: ['For example, …', 'For instance, …', 'such as …', 'Once, …'] },
        { group: 'Add a DETAIL', ar: 'أضف تفصيلًا', phrases: ['In fact, …', 'Specifically, …', 'What is more, …', 'This means that …'] },
      ],
      steps: [
        { en: 'Copy your short paragraph (topic + 3 supports + conclusion).', ar: 'انسخ فقرتك القصيرة.' },
        { en: 'After support 1, add a REASON with “because”.', ar: 'بعد الدعم الأول أضف سببًا بـ because.' },
        { en: 'After support 2, add an EXAMPLE with “For example”.', ar: 'بعد الدعم الثاني أضف مثالًا.' },
        { en: 'After support 3, add a DETAIL that paints a picture.', ar: 'بعد الدعم الثالث أضف تفصيلًا مصوِّرًا.' },
        { en: 'Read it aloud — cut anything that leaves the topic.', ar: 'اقرأها بصوتٍ عالٍ واحذف ما يخرج عن الموضوع.' },
      ],
      checklist: [
        { en: '8–10 sentences, ONE topic', ar: '٨–١٠ جمل وموضوع واحد' },
        { en: 'Every support has a Reason, Example, or Detail', ar: 'كل دعم معه R أو E أو D' },
        { en: 'Linking words vary (because / for example / in fact)', ar: 'أدوات الربط متنوّعة' },
        { en: 'Sentence types vary (simple + compound + complex)', ar: 'أنواع الجمل متنوّعة' },
        { en: 'Capitals, commas, and end marks are correct', ar: 'الحروف والفواصل والعلامات سليمة' },
      ],
    },
    homework: [
      { en: 'Expand your “My City” paragraph to 8+ sentences with R.E.D.', ar: 'وسّع فقرة «مدينتي» إلى ٨ جمل فأكثر' },
      { en: 'Underline each Reason, Example, and Detail you added', ar: 'ضع خطًا تحت كل سبب ومثال وتفصيل' },
      { en: 'Ask: does every sentence still serve the topic?', ar: 'اسأل: هل كل جملة تخدم الموضوع؟' },
    ],
    editing: {
      wrong: [
        'Studying at night is better for me. It is quiet. My brother plays football every Friday.',
        'Also I remember more. For example. I like coffee too.',
      ],
      correct: [
        'Studying at night is better for me. It is quiet*, because everyone in the house is asleep by eleven*. *My brother plays football every Friday* ✗ — off topic, cut it.',
        '*Also, I remember more: for example, the words I review at midnight are still with me the next morning.* *I like coffee too* ✗ — off topic, cut it.',
      ],
    },
  },

  /* ═══════════════════ UNIT 5 · PROFESSIONAL WRITING (B1) ═══════════════════ */

  /* ─────────────────────────── 26 · FRIENDLY EMAILS & MESSAGES ─────────────────────────── */
  {
    no: 26, cefr: 'B1', tag: 'Friendly emails', tagAr: 'رسائل ودّية',
    title: 'Friendly Emails & Messages',
    titleAr: 'الرسائل والإيميلات الودّية',
    objectives: [
      { en: 'Open and close an informal email naturally', ar: 'افتتاح الرسالة الودّية وختمها' },
      { en: 'Write short, warm, clear messages', ar: 'كتابة رسائل قصيرة دافئة وواضحة' },
      { en: 'Invite, thank, and reply politely', ar: 'الدعوة والشكر والرد بلطف' },
      { en: 'Keep one idea per short paragraph', ar: 'فكرة واحدة لكل فقرة قصيرة' },
    ],
    rule: {
      en: 'An informal email = *Hi + name* → a warm opening line → your message in short paragraphs → a friendly closing (*Take care / See you soon*) → your name.',
      ar: 'الرسالة الودّية: تحية بالاسم ← جملة افتتاحية دافئة ← رسالتك في فقرات قصيرة ← خاتمة ودّية ← اسمك.',
    },
    explain: {
      intro: 'A friendly email is *not* a formal email with the tie removed — it has its own frame. It is short, it sounds like your speaking voice, and it always leaves the reader knowing *what to do next*.',
      introAr: 'الرسالة الودّية ليست رسالة رسمية نزعنا عنها الرسمية — لها قالبها الخاص: قصيرة، بنبرة كلامك الطبيعي، وتترك القارئ عارفًا ما المطلوب منه.',
      points: [
        { en: 'Subject = a *promise* of what is inside: “Come visit us this summer!”', ar: 'الموضوع وعدٌ بما في الداخل' },
        { en: 'Greet by *name* — “Hi Yousef,” beats “Hello” every time', ar: 'حيِّ باسمه — «Hi Yousef» أفضل من «Hello» دائمًا' },
        { en: 'One warm line *before* business: “I hope you’re doing well.”', ar: 'جملة دافئة قبل الموضوع' },
        { en: 'Contractions are welcome here: *I’m*, *can’t*, *let’s*', ar: 'الاختصارات مقبولة هنا: I’m / can’t / let’s' },
        { en: 'One idea per short paragraph — a wall of text never gets read', ar: 'فكرة لكل فقرة قصيرة — الكتلة الطويلة لا تُقرأ' },
        { en: 'Always end with a *next step*: a date, a question, a “let me know”', ar: 'اختم دائمًا بخطوة تالية: موعد أو سؤال أو let me know' },
      ],
    },
    examples: [
      { en: 'Subject that gets opened: *Come visit us this summer!* (not “Hello”)', ar: 'موضوع يُفتح — لا «Hello» فارغة', why: 'A subject line is a PROMISE of what is inside — “Hello” promises nothing.', whyAr: 'سطر الموضوع وعدٌ بما في الداخل، و«Hello» لا تَعِد بشيء.' },
      { en: '*Hi Yousef,* — the name is the warmest word in the email.', ar: 'الاسم أدفأ كلمة في الرسالة', why: 'Using the name costs one second and changes how the whole email reads.', whyAr: 'ذكر الاسم يكلّف ثانية ويغيّر انطباع الرسالة كلّها.' },
      { en: '*I hope you’re doing well.* — one line of warmth before business.', ar: 'جملة دفء قبل الموضوع', why: 'One warm line BEFORE business — going straight to the request feels cold.', whyAr: 'جملة دافئة قبل الموضوع؛ الدخول المباشر يبدو باردًا.' },
      { en: '*I’m writing to invite you* to spend a week with us in Agadir.', ar: 'سبب الكتابة بوضوح', why: 'State WHY you are writing early, so the reader is not guessing.', whyAr: 'اذكر سبب الكتابة مبكرًا لئلا يخمّن القارئ.' },
      { en: '*Thanks so much for* the book — I finished it in two nights.', ar: 'الشكر مع تفصيل يثبت أنك تقصده', why: 'Thanks with a DETAIL proves you mean it — bare thanks reads as duty.', whyAr: 'الشكر مع تفصيل يُثبت صدقك؛ والمجرّد يبدو واجبًا.' },
      { en: '*Let me know* which dates work for you, and I’ll arrange everything.', ar: 'الخطوة التالية واضحة', why: 'Always leave a next step. An email with nothing to answer gets no answer.', whyAr: 'اترك خطوة تالية دائمًا؛ الرسالة بلا مطلوب لا تُجاب.' },
      { en: 'Warm closings: *Take care,* · *See you soon,* · *Best,* + your first name.', ar: 'خواتيم ودّية', why: 'Friendly closings use the FIRST name — the formal frame would jar here.', whyAr: 'الخواتيم الودّية بالاسم الأول، والقالب الرسمي ينبو هنا.' },
      { en: 'Stiff ✗: “I am writing to inform you that I would like to meet.” → Warm ✓: *Are you free on Saturday?*', ar: 'المتصلّب ✗ ← الودّي ✓', why: 'Register mismatch: formal machinery inside a message to a friend.', whyAr: 'خلل في المستوى: آلة رسمية داخل رسالة إلى صديق.' },
    ],
    exercises: [
      { q: 'Warm it up: “I inform you that I will arrive Tuesday.”', a: '*I’ll be arriving on Tuesday — can’t wait to see you!*' },
      { q: 'Write a subject line for an email inviting a friend to your wedding.', a: 'e.g. *You’re invited — our wedding, 14 September!*' },
      { q: 'Add the warm opening line before business.', a: '*How are you? I hope everything is going well with your studies.*' },
      { q: 'Fix: “Answer me fast.”', a: '*Let me know when you get a chance!*' },
      { q: 'Formal or friendly? “Yours faithfully, Omar Benali”', a: 'Formal ✗ here — friendly is *Take care, Omar*.' },
      { q: 'Give this email a next step: “It was great seeing you last month.”', a: 'e.g. *Are you free for a call this Sunday evening?*' },
    ],
    reading: {
      title: 'The Email That Took Four Minutes', titleAr: 'الرسالة التي استغرقت أربع دقائق',
      passage: [
        'Every year my friend Nadia sends the same short email, and every year it makes my week.',
        'She never writes more than five lines.',
        'She asks how my mother is, she tells me one small thing that happened to her — a broken bicycle, a neighbour’s new baby — and then she asks a real question that I have to answer.',
        'She once told me she writes it in four minutes, standing in her kitchen.',
        'I have received long, careful, beautiful emails that I never replied to.',
        'Hers I answer the same day, because a friendly email is not about the words you find — it is about leaving the other person something easy to say back.',
      ],
      tip: 'Count the parts: a warm question, one human detail, one clear next step. That is the whole recipe.',
      tipAr: 'عُدّ الأجزاء: سؤال دافئ، وتفصيل إنساني واحد، وخطوة تالية واضحة. هذه هي الوصفة كلها.',
    },
    studio: {
      prompt: { en: 'Write a short email inviting a friend to visit you during the holidays.', ar: 'اكتب إيميلًا قصيرًا تدعو فيه صديقًا لزيارتك في العطلة.' },
      model: {
        title: 'Inviting a Friend', titleAr: 'دعوة صديق', layout: 'lines',
        parts: [
          { role: 'subject', en: 'Subject: Come visit us this summer! 🌞' },
          { role: 'greeting', en: 'Hi Yousef,' },
          { role: 'body', en: 'How are you? I hope everything is going well with your studies.' },
          { role: 'body', en: 'I’m writing to invite you to spend a week with us in Agadir this July. The weather is perfect, the beach is five minutes away, and my family would love to meet you.' },
          { role: 'body', en: 'Let me know which dates work for you, and I’ll arrange everything.' },
          { role: 'closing', en: 'Take care and see you soon,\nOmar' },
        ],
      },
      plan: [
        { label: 'Subject — short & clear', ar: 'الموضوع — قصير وواضح' },
        { label: 'Greeting — Hi + name', ar: 'التحية بالاسم' },
        { label: 'Warm opening line', ar: 'جملة افتتاحية دافئة' },
        { label: 'Your message (why you write)', ar: 'رسالتك — سبب الكتابة' },
        { label: 'A clear next step', ar: 'خطوة تالية واضحة' },
        { label: 'Friendly closing + name', ar: 'خاتمة ودّية + الاسم' },
      ],
      toolkit: [
        { group: 'Open', ar: 'الافتتاح', phrases: ['Hi Sara,', 'How are you?', 'I hope you’re doing well.', 'It was great to hear from you!'] },
        { group: 'Say why you write', ar: 'سبب الكتابة', phrases: ['I’m writing to invite you…', 'Just a quick message to say…', 'I wanted to ask you…', 'Thanks so much for…'] },
        { group: 'Close', ar: 'الختام', phrases: ['Let me know!', 'Can’t wait to see you.', 'Take care,', 'See you soon,', 'Best,'] },
      ],
      steps: [
        { en: 'Write a subject your friend will want to open.', ar: 'اكتب موضوعًا يجذب صديقك لفتح الرسالة.' },
        { en: 'Greet by name + one warm line.', ar: 'حيِّه باسمه + جملة دافئة.' },
        { en: 'Say WHY you are writing in 1–2 short paragraphs.', ar: 'اذكر سبب الكتابة في فقرة أو فقرتين قصيرتين.' },
        { en: 'End with a clear next step + friendly closing.', ar: 'اختم بخطوة واضحة وخاتمة ودّية.' },
      ],
      checklist: [
        { en: 'Subject line written', ar: 'يوجد سطر موضوع' },
        { en: 'Greeting with the name', ar: 'تحية بالاسم' },
        { en: 'One idea per short paragraph', ar: 'فكرة لكل فقرة' },
        { en: 'A clear next step for the reader', ar: 'خطوة تالية واضحة' },
        { en: 'Friendly closing + your name', ar: 'خاتمة ودّية واسمك' },
      ],
    },
    homework: [
      { en: 'Write a thank-you email to a friend who helped you', ar: 'اكتب إيميل شكر لصديق ساعدك' },
      { en: 'Reply to an invitation — accept warmly, suggest a date', ar: 'رُدّ على دعوة بقبول وتحديد موعد' },
      { en: 'Write a 3-line WhatsApp message rescheduling a meeting', ar: 'اكتب رسالة قصيرة لتأجيل موعد' },
    ],
    editing: {
      wrong: [
        'hi how are you. i writing for invite you at my house in the holidays.',
        'we can going to the beach and eat fishs. answer me fast.',
      ],
      correct: [
        '*Hi Karim,* how are you*?* I *am writing to invite* you *to* my house *for* the holidays.',
        'We can *go* to the beach and eat *fish*. *Let me know soon!*',
      ],
    },
  },

  /* ─────────────────────────── 27 · FORMAL EMAILS ─────────────────────────── */
  {
    no: 27, cefr: 'B1', tag: 'Formal emails', tagAr: 'الإيميل الرسمي',
    title: 'Formal Emails — the professional frame',
    titleAr: 'الإيميل الرسمي — القالب الاحترافي',
    objectives: [
      { en: 'Use the formal frame: Dear → I am writing to → Kind regards', ar: 'استخدام القالب الرسمي كاملًا' },
      { en: 'Choose formal words (receive, request — not get, want)', ar: 'اختيار كلمات رسمية' },
      { en: 'Keep sentences short but respectful', ar: 'جمل قصيرة لكن محترمة' },
      { en: 'Write a clear subject line', ar: 'كتابة سطر موضوع واضح' },
    ],
    rule: {
      en: 'A formal email = *Subject* → *Dear Mr./Ms. + name* (or Dear Sir/Madam) → *I am writing to…* → short clear body → *Kind regards / Sincerely* → full name. No slang, no “Hi”, no emojis.',
      ar: 'الإيميل الرسمي: موضوع ← Dear + اللقب والاسم ← I am writing to… ← جسم قصير واضح ← Kind regards ← الاسم الكامل. لا عامية ولا Hi ولا رموز.',
    },
    explain: {
      intro: 'Formal does *not* mean long or complicated — it means *predictable*. The reader is busy; the frame lets them find your request in five seconds. Break the frame and you look careless, however good your English is.',
      introAr: 'الرسمية لا تعني الطول ولا التعقيد، بل تعني القالب المتوقَّع. القارئ مشغول، والقالب يجعله يجد طلبك في خمس ثوانٍ. وكسر القالب يجعلك تبدو غير مهني مهما كانت لغتك جيدة.',
      points: [
        { en: 'Name known → *Dear Mr. Alami,* · name unknown → *Dear Sir/Madam,*', ar: 'تعرف الاسم ← Dear Mr. + اللقب · لا تعرفه ← Dear Sir/Madam' },
        { en: 'Sentence 1 states the purpose: *I am writing to request…*', ar: 'الجملة الأولى تذكر الغرض: I am writing to…' },
        { en: 'No contractions: write *I am*, *do not*, *cannot* in full', ar: 'لا اختصارات: اكتب I am و do not كاملة' },
        { en: 'Formal word choice: *receive* not get · *request* not want · *assist* not help out', ar: 'كلمات رسمية: receive بدل get و request بدل want' },
        { en: 'No emojis, no “Hi”, no exclamation marks — ever', ar: 'لا رموز ولا Hi ولا علامات تعجّب أبدًا' },
        { en: 'Close: *Kind regards,* (known) · *Yours faithfully,* (unknown) + full name', ar: 'الختام: Kind regards إن عرفت الاسم، و Yours faithfully إن لم تعرفه' },
      ],
    },
    examples: [
      { en: 'Subject: *Leave Request — 12–13 August* (topic + the detail that matters)', ar: 'الموضوع: الفكرة + التفصيل المهم', why: 'Topic + the key detail. A busy reader decides from this line alone.', whyAr: 'الموضوع + التفصيل المهمّ؛ القارئ المشغول يقرّر من هذا السطر وحده.' },
      { en: '*Dear Mr. Alami,* — title + FAMILY name, never the first name alone.', ar: 'اللقب + اسم العائلة، لا الاسم الأول', why: 'Title + FAMILY name. The first name alone is too familiar in formal writing.', whyAr: 'اللقب + اسم العائلة؛ الاسم الأول وحده مفرط الألفة في الرسمي.' },
      { en: '*I am writing to request* two days of leave on 12 and 13 August.', ar: 'الغرض في الجملة الأولى', why: 'The purpose lands in sentence one — that is what makes formal writing fast.', whyAr: 'الغرض في الجملة الأولى، وهذا سرّ سرعة الكتابة الرسمية.' },
      { en: '*I would appreciate it if* you could confirm by Thursday.', ar: 'الطلب المهذّب الرسمي', why: '*I would appreciate it if* is a request wearing the clothes of a favour.', whyAr: 'هذه الصيغة طلبٌ في ثوب معروف.' },
      { en: '*Please find attached* my medical certificate.', ar: 'الإشارة إلى المرفقات', why: 'The fixed phrase for attachments — every other version sounds translated.', whyAr: 'العبارة الثابتة للمرفقات، وما عداها يبدو مترجمًا.' },
      { en: 'get → *receive* · want → *would like* · ask → *request* · help out → *assist*', ar: 'استبدال الكلمات العامية برسمية', why: 'Formal register prefers a single precise verb over a casual phrasal one.', whyAr: 'الرسمية تفضّل الفعل المفرد الدقيق على المركّب العاميّ.' },
      { en: '*I look forward to your reply.* — the professional way to say “answer me”.', ar: 'الطريقة المهنية لطلب الرد', why: 'It asks for a reply without demanding one — that balance is the whole skill.', whyAr: 'تطلب الردّ دون إلحاح، وهذا التوازن هو المهارة كلّها.' },
      { en: '✗ “Hi boss, i want 2 days off ok? thx 🙏” → ✓ the full frame above.', ar: 'العامية ✗ ← القالب الرسمي ✓', why: 'Every register dial is wrong at once: greeting, spelling, slang, emoji.', whyAr: 'كل مؤشّرات المستوى خاطئة معًا: التحية والإملاء والعامية والرمز.' },
    ],
    exercises: [
      { q: 'Make it formal: “I want to know the price.”', a: '*I would like to inquire about the price.*' },
      { q: 'Make it formal: “Can you send me the file?”', a: '*Could you please send me the file?* / *I would appreciate it if you could send me the file.*' },
      { q: 'You do not know the reader’s name. Greeting and closing?', a: '*Dear Sir or Madam,* … *Yours faithfully,*' },
      { q: 'Fix the contractions: “I’m writing because I can’t attend.”', a: '*I am writing because I cannot attend.*' },
      { q: 'Write a subject line: asking a language school about course fees.', a: 'e.g. *Inquiry — Course Fees for Adult Evening Classes*' },
      { q: 'What is wrong with “Subject: hi!!”?', a: 'No topic, no detail, and *exclamation marks* — a formal subject states the matter.' },
    ],
    reading: {
      title: 'Five Seconds', titleAr: 'خمس ثوانٍ',
      passage: [
        'A manager I know receives about two hundred emails a day.',
        'She told me she decides what to do with each one in roughly five seconds, and she is not being rude — she simply has no other way to survive her inbox.',
        'In those five seconds she looks for three things: what this is about, what the sender wants, and whether she is the right person to give it.',
        'An email that answers all three in its first two lines gets a reply that morning.',
        'An email that makes her read to the bottom to find the request goes into a folder called *Later*, and we both know what happens in that folder.',
        'Formal writing is not old-fashioned politeness; it is respect for a reader who is drowning.',
      ],
      tip: 'The formal frame exists to answer three questions fast: what, what do you want, and is this for me?',
      tipAr: 'القالب الرسمي موجود ليجيب بسرعة عن ثلاثة أسئلة: ما الموضوع، وماذا تريد، وهل هذا من اختصاصي؟',
    },
    studio: {
      prompt: { en: 'Write a formal email to your manager requesting two days of leave next month.', ar: 'اكتب إيميلًا رسميًا لمديرك تطلب فيه إجازة يومين الشهر القادم.' },
      model: {
        title: 'Requesting Leave', titleAr: 'طلب إجازة', layout: 'lines',
        parts: [
          { role: 'subject', en: 'Subject: Leave Request — 12–13 August' },
          { role: 'greeting', en: 'Dear Mr. Alami,' },
          { role: 'body', en: 'I am writing to request two days of leave on 12 and 13 August for a family matter.' },
          { role: 'body', en: 'I have completed this week’s reports, and my colleague Salma has kindly agreed to cover urgent requests while I am away.' },
          { role: 'body', en: 'Please let me know if you need any further information.' },
          { role: 'closing', en: 'Kind regards,\nOmar Benali\nCustomer Service Department' },
        ],
      },
      plan: [
        { label: 'Subject — topic + dates', ar: 'الموضوع + التواريخ' },
        { label: 'Dear + title + family name', ar: 'التحية الرسمية' },
        { label: 'Line 1: exactly why you write', ar: 'السطر الأول: سبب الكتابة بدقة' },
        { label: 'Details the reader needs (short)', ar: 'التفاصيل الضرورية باختصار' },
        { label: 'Polite final line', ar: 'جملة ختامية مهذّبة' },
        { label: 'Kind regards + full name + role', ar: 'الخاتمة والاسم الكامل والوظيفة' },
      ],
      toolkit: [
        { group: 'Open formally', ar: 'الافتتاح الرسمي', phrases: ['Dear Mr. …, / Dear Ms. …,', 'Dear Sir or Madam,', 'I am writing to request…', 'I am writing regarding…', 'I would like to inquire about…'] },
        { group: 'Body language', ar: 'لغة الجسم الرسمية', phrases: ['I would appreciate it if…', 'Please find attached…', 'Could you please confirm…', 'Please let me know if…'] },
        { group: 'Close formally', ar: 'الختام الرسمي', phrases: ['Thank you for your time.', 'I look forward to your reply.', 'Kind regards,', 'Sincerely,', 'Best regards,'] },
      ],
      steps: [
        { en: 'Write the subject: topic + key detail (dates, order number…).', ar: 'اكتب الموضوع: الفكرة + التفصيل الأهم.' },
        { en: 'Open with Dear + title + family name.', ar: 'افتح بـ Dear واللقب واسم العائلة.' },
        { en: 'First line = the exact purpose: “I am writing to…”.', ar: 'السطر الأول = الغرض بدقة.' },
        { en: 'Give only the details the reader needs to say yes.', ar: 'أعطِ فقط التفاصيل التي تُسهّل الموافقة.' },
        { en: 'Close politely with Kind regards + full name.', ar: 'اختم بـ Kind regards واسمك الكامل.' },
      ],
      checklist: [
        { en: 'Subject line: clear + specific', ar: 'موضوع واضح ومحدّد' },
        { en: 'Dear + title + family name (no “Hi”)', ar: 'تحية رسمية بلا Hi' },
        { en: '“I am writing to…” in the first line', ar: 'الغرض في السطر الأول' },
        { en: 'Short sentences, no slang, no emojis', ar: 'جمل قصيرة بلا عامية ولا رموز' },
        { en: 'Kind regards + full name at the end', ar: 'خاتمة رسمية واسم كامل' },
      ],
    },
    homework: [
      { en: 'Write a formal email to a school asking about course prices', ar: 'إيميل رسمي يسأل عن أسعار الدورات' },
      { en: 'Rewrite a “Hi, I want…” message into the formal frame', ar: 'أعد كتابة رسالة عامية بالقالب الرسمي' },
      { en: 'Write a formal email confirming a meeting time', ar: 'إيميل رسمي يؤكّد موعد اجتماع' },
    ],
    editing: {
      wrong: [
        'Subject: hi!!',
        'hi boss, i want 2 days off next month ok? i finished my work so no problem. thx 🙏',
      ],
      correct: [
        'Subject: *Leave Request — 5–6 September*',
        '*Dear Mr. Tazi,* *I am writing to request* two days of leave on 5–6 September. I have completed my current tasks. *Please let me know if you need any further information.* *Kind regards,* Ahmed El Fassi',
      ],
    },
  },

  /* ─────────────────────────── 28 · REQUESTS & COMPLAINTS ─────────────────────────── */
  {
    no: 28, cefr: 'B1', tag: 'Requests & complaints', tagAr: 'الطلب والشكوى',
    title: 'Requests & Complaints — polite power',
    titleAr: 'الطلب والشكوى — قوة مهذّبة',
    objectives: [
      { en: 'Ask firmly but politely (Could you / I would…)', ar: 'الطلب بحزم وأدب' },
      { en: 'Complain with facts, not anger', ar: 'الشكوى بالحقائق لا بالغضب' },
      { en: 'State clearly what you want to happen', ar: 'تحديد ما تريده بوضوح' },
      { en: 'Set a polite deadline', ar: 'تحديد مهلة بأدب' },
    ],
    rule: {
      en: 'A strong complaint = *facts* (what, when, order number) + *the problem* + *exactly what you want* + a polite deadline. Anger weakens you; clarity is the power.',
      ar: 'الشكوى القوية = حقائق (ماذا ومتى ورقم الطلب) + المشكلة + ما تريده بالضبط + مهلة مهذّبة. الغضب يُضعفك والوضوح هو القوة.',
    },
    explain: {
      intro: 'The person reading your complaint did not cause your problem — they only decide whether to solve it. Angry emails get filed; *factual* emails get actioned. Politeness is not weakness here: it is the tool that makes your demand impossible to refuse.',
      introAr: 'من يقرأ شكواك لم يتسبّب في مشكلتك، بل يقرّر فقط هل يحلّها. الرسائل الغاضبة تُحفَظ في الأرشيف، والرسائل المبنيّة على الحقائق تُنفَّذ. الأدب هنا ليس ضعفًا بل أداة تجعل طلبك يصعب رفضه.',
      points: [
        { en: 'Facts first: *what*, *when*, and the *order/reference number*', ar: 'الحقائق أولًا: ماذا ومتى ورقم الطلب' },
        { en: 'Describe the problem in *one* neutral sentence — no adjectives of anger', ar: 'صف المشكلة في جملة محايدة واحدة بلا ألفاظ غاضبة' },
        { en: 'Politeness ladder: *Could you…* < *I would appreciate…* < *I must request…*', ar: 'سلّم الأدب: Could you ← I would appreciate ← I must request' },
        { en: 'Name the outcome you want: a *refund*, a *replacement*, a *date*', ar: 'حدّد ما تريده: استرجاع مبلغ أو بديل أو تاريخ' },
        { en: 'Give a deadline politely: *by Friday 20 June* — a date, not “soon”', ar: 'امنح مهلة بأدب: تاريخ محدّد لا كلمة «قريبًا»' },
        { en: 'Close the door softly: *I look forward to your reply.*', ar: 'اختم بلطف: I look forward to your reply.' },
      ],
    },
    examples: [
      { en: 'Subject: *Order #45872 — Not Delivered (3 weeks)* — the whole case in one line.', ar: 'القضية كلها في سطر الموضوع', why: 'Reference number plus the problem — the reader can act before opening it.', whyAr: 'رقم المرجع مع المشكلة؛ يستطيع القارئ التصرّف قبل الفتح.' },
      { en: '*I am writing about* order #45872, a smartphone I purchased on 2 July.', ar: 'الحقائق: ماذا ومتى ورقم', why: 'Facts first: what, when, and the number. No feeling yet.', whyAr: 'الحقائق أولًا: ماذا ومتى والرقم، بلا مشاعر بعد.' },
      { en: 'Neutral problem: *The order has still not arrived after three weeks.*', ar: 'وصف محايد للمشكلة', why: 'Notice there is no adjective of anger — the fact does the work alone.', whyAr: 'لاحظ غياب ألفاظ الغضب؛ الحقيقة وحدها تكفي.' },
      { en: 'Softest ask: *Could you please* check the status of my order?', ar: 'أخف درجات الطلب', why: 'Rung one of the politeness ladder: a question, easy to say yes to.', whyAr: 'أولى درجات سلّم الأدب: سؤال يسهل قبوله.' },
      { en: 'Firmer: *I would appreciate it if* you could deliver it within five days.', ar: 'درجة أحزم', why: 'Rung two: still polite, but now there is a deadline inside it.', whyAr: 'الدرجة الثانية: مهذّبة وفيها مهلة.' },
      { en: 'Firmest (still polite): *I must request a full refund* under your returns policy.', ar: 'الأحزم مع بقاء الأدب', why: 'Rung three: firm and formal, and it cites the policy rather than emotion.', whyAr: 'الدرجة الثالثة: حازمة رسمية تستند إلى النظام لا إلى الانفعال.' },
      { en: 'Give two doors: *either deliver the order within five days or refund the full amount*.', ar: 'اعرض خيارين — أسهل على القارئ أن يوافق', why: 'Two options are easier to grant than one demand — you make saying yes cheap.', whyAr: 'الخياران أسهل في القبول من مطلب واحد.' },
      { en: '✗ “you are thiefs, i want my money now” → ✓ facts + a specific demand + a date.', ar: 'الغضب ✗ ← الحقائق والمطلب والتاريخ ✓', why: 'Anger names no facts and demands nothing specific, so nothing can be done.', whyAr: 'الغضب لا يذكر حقائق ولا مطلبًا محدّدًا فلا يمكن فعل شيء.' },
    ],
    exercises: [
      { q: 'Turn anger into facts: “Your delivery service is terrible!”', a: '*The order was promised for 9 July and has not arrived after three weeks.*' },
      { q: 'Make the demand specific: “Do something about it.”', a: '*I would like a full refund of 1,200 MAD to my original payment method.*' },
      { q: 'Fix the deadline: “Reply soon.”', a: '*I would appreciate a reply by Friday 20 June.*' },
      { q: 'Climb the politeness ladder — softest to firmest.', a: '*Could you please…* → *I would appreciate it if…* → *I must request…*' },
      { q: 'What three facts must a complaint open with?', a: '*What* was bought, *when*, and the *order/reference number*.' },
      { q: 'Polite request to a teacher for more time — write the key sentence.', a: 'e.g. *Would it be possible to submit the essay on Monday instead?*' },
    ],
    reading: {
      title: 'The Complaint That Worked', titleAr: 'الشكوى التي نجحت',
      passage: [
        'My cousin waited five weeks for a washing machine that never came.',
        'His first email was three lines long and every one of them was angry; he received an automatic reply and nothing else.',
        'The second email he wrote with me at the table.',
        'It opened with the order number and the promised delivery date, described the problem in one flat sentence, and then asked for one of two things: delivery within seven days, or a full refund.',
        'At the end he wrote that he would appreciate an answer by Friday.',
        'The machine arrived on Thursday.',
        'Nothing about him had changed — only the shape of the letter.',
      ],
      tip: 'Same complaint, two shapes. Facts + a specific demand + a date beat anger every single time.',
      tipAr: 'الشكوى نفسها بشكلين. الحقائق + مطلب محدّد + تاريخ تهزم الغضب في كل مرة.',
    },
    studio: {
      prompt: { en: 'You ordered a phone online 3 weeks ago and it hasn’t arrived. Write a firm, polite complaint.', ar: 'طلبت هاتفًا عبر الإنترنت قبل ٣ أسابيع ولم يصل. اكتب شكوى حازمة مهذّبة.' },
      model: {
        title: 'Where Is My Order?', titleAr: 'أين طلبي؟', layout: 'lines',
        parts: [
          { role: 'subject', en: 'Subject: Order #45872 — Not Delivered (3 weeks)' },
          { role: 'greeting', en: 'Dear Customer Service Team,' },
          { role: 'body', en: 'I am writing about order #45872, a smartphone I purchased on 2 July. The delivery date was 9 July, but the order has still not arrived after three weeks.' },
          { role: 'body', en: 'I have contacted the chat support twice without a clear answer. I would like you to either deliver the order within five days or refund the full amount.' },
          { role: 'body', en: 'I would appreciate a reply by Friday. My order details are attached.' },
          { role: 'closing', en: 'Kind regards,\nSalma Idrissi' },
        ],
      },
      plan: [
        { label: 'Subject: order number + the problem', ar: 'الموضوع: رقم الطلب والمشكلة' },
        { label: 'Facts first: what, when, numbers', ar: 'الحقائق أولًا' },
        { label: 'The problem in one clear sentence', ar: 'المشكلة في جملة' },
        { label: 'What you want: option A or option B', ar: 'ما تريده: خيار أ أو ب' },
        { label: 'Polite deadline + closing', ar: 'مهلة مهذّبة وخاتمة' },
      ],
      toolkit: [
        { group: 'Request politely', ar: 'الطلب المهذّب', phrases: ['Could you please…', 'I would like to…', 'I would appreciate it if…', 'Would it be possible to…'] },
        { group: 'Complain with facts', ar: 'الشكوى بالحقائق', phrases: ['I am writing about order #…', 'Unfortunately, …', 'The product has still not arrived.', 'This is the second time that…'] },
        { group: 'Demand an outcome', ar: 'طلب النتيجة', phrases: ['I would like a full refund.', 'Please deliver it within … days.', 'I expect a reply by…', 'Otherwise, I will have to…'] },
      ],
      steps: [
        { en: 'Put the order number and problem in the subject.', ar: 'ضع رقم الطلب والمشكلة في الموضوع.' },
        { en: 'State the facts: what you bought, when, what was promised.', ar: 'اذكر الحقائق: ماذا اشتريت ومتى وما وُعدت به.' },
        { en: 'Describe the problem calmly — no insults, no anger.', ar: 'صِف المشكلة بهدوء — بلا شتائم ولا غضب.' },
        { en: 'Say EXACTLY what you want + a polite deadline.', ar: 'حدّد ما تريده بالضبط + مهلة مهذّبة.' },
      ],
      checklist: [
        { en: 'Order number / dates included', ar: 'رقم الطلب والتواريخ موجودة' },
        { en: 'Calm tone — facts, not feelings', ar: 'نبرة هادئة — حقائق لا مشاعر' },
        { en: 'The demand is specific (refund / redeliver)', ar: 'المطلب محدّد' },
        { en: 'A polite deadline is set', ar: 'مهلة محدّدة بأدب' },
        { en: 'Formal frame kept (Dear → Kind regards)', ar: 'القالب الرسمي محفوظ' },
      ],
    },
    homework: [
      { en: 'Write a polite request to a teacher for a deadline extension', ar: 'طلب مهذّب لتمديد موعد تسليم' },
      { en: 'Complain about a noisy hotel room — ask for a room change', ar: 'شكوى عن غرفة مزعجة وطلب تغييرها' },
      { en: 'Request a refund for a cancelled course — set a deadline', ar: 'طلب استرجاع مبلغ دورة ملغاة' },
    ],
    editing: {
      wrong: [
        'Subject: VERY ANGRY!!!',
        'your service is very bad and you are thiefs. i want my money now or i will make problem. answer fast.',
      ],
      correct: [
        'Subject: *Order #1189 — Refund Request*',
        '*I am writing about* order #1189, which arrived damaged on 3 May. *I would like a full refund within seven days.* *I would appreciate a reply by Friday.* *Kind regards,* Hamza',
      ],
    },
  },

  /* ─────────────────────────── 29 · JOB APPLICATION ─────────────────────────── */
  {
    no: 29, cefr: 'B1', tag: 'Job application', tagAr: 'التقديم لوظيفة',
    title: 'The Job Application Email',
    titleAr: 'إيميل التقديم لوظيفة',
    objectives: [
      { en: 'Apply for a job in one confident email', ar: 'التقديم لوظيفة بإيميل واثق' },
      { en: 'Present 2–3 strengths with proof (R.E.D.)', ar: 'عرض نقاط قوتك بدليل' },
      { en: 'Sound professional, clear, and human', ar: 'نبرة احترافية واضحة وإنسانية' },
      { en: 'End with availability + attachments', ar: 'الختم بالجاهزية والمرفقات' },
    ],
    rule: {
      en: 'A job email = Subject (*Application for [Job] — [Your Name]*) → Dear Hiring Manager → where you saw the job + one-line who you are → 2–3 strengths *with proof* → availability → CV attached → Kind regards.',
      ar: 'إيميل الوظيفة: موضوع باسم الوظيفة واسمك ← تحية رسمية ← أين رأيت الإعلان ومن أنت بسطر ← نقطتا قوة أو ثلاث بدليل ← جاهزيتك ← السيرة مرفقة ← خاتمة رسمية.',
    },
    explain: {
      intro: 'A recruiter reads your email for about *seven seconds* before deciding to open your CV or not. So this email has one job: make opening the CV feel worth it. Claims do not do that — *proof* does.',
      introAr: 'مسؤول التوظيف يقرأ إيميلك سبع ثوانٍ تقريبًا قبل أن يقرّر فتح سيرتك أو لا. فمهمة هذا الإيميل واحدة: أن يجعل فتح السيرة يستحق. والادّعاءات لا تفعل ذلك — الدليل يفعل.',
      points: [
        { en: 'Subject = *Application for [Job Title] — [Your Full Name]* · nothing else', ar: 'الموضوع: اسم الوظيفة ثم اسمك الكامل ولا شيء غير ذلك' },
        { en: 'Line 1: the job + *where you saw it* (LinkedIn, your website)', ar: 'السطر الأول: الوظيفة وأين رأيت الإعلان' },
        { en: 'Claim + proof: not “I am hard-working” but “I handled *40 calls a day* for two years”', ar: 'ادّعاء + دليل: لا «أنا مجتهد» بل «تعاملت مع ٤٠ مكالمة يوميًا لسنتين»' },
        { en: 'Numbers are the strongest proof: *years*, *languages*, *customers*, *%*', ar: 'الأرقام أقوى دليل: السنوات واللغات والعملاء والنِّسب' },
        { en: 'Mirror *their* words — reuse key phrases from the job advert', ar: 'استخدم كلمات الإعلان نفسها في وصف نفسك' },
        { en: 'End with availability + *Please find my CV attached* — then actually attach it', ar: 'اختم بجاهزيتك و«CV مرفق» — ثم أرفقه فعلًا' },
      ],
    },
    examples: [
      { en: 'Subject: *Application for Customer Service Agent — Omar Benali*', ar: 'الموضوع: الوظيفة + الاسم الكامل', why: 'Job title plus your name — a recruiter files hundreds by exactly this line.', whyAr: 'الوظيفة واسمك؛ بهذا السطر يُصنّف مسؤول التوظيف المئات.' },
      { en: '*I am writing to apply for* the Customer Service Agent position *advertised on LinkedIn*.', ar: 'الوظيفة ومصدر الإعلان', why: 'The job AND where you saw it — it shows you are not mass-mailing.', whyAr: 'الوظيفة ومصدر الإعلان؛ يُظهر أنك لا تُرسل بالجملة.' },
      { en: 'Who you are in one line: *a Moroccan graduate with two years of experience in Arabic, French, and English*.', ar: 'تعريف بسطر واحد', why: 'One line of identity, front-loaded with what makes you relevant.', whyAr: 'سطر تعريف واحد يبدأ بما يجعلك مناسبًا.' },
      { en: 'Claim ✗: “I am hard-working.” → Proof ✓: *I answer more than sixty calls a day and keep a 95% satisfaction score.*', ar: 'الادّعاء ✗ ← الدليل ✓', why: 'Adjectives describe; numbers prove. Everyone claims to be hard-working.', whyAr: 'الصفات تصف والأرقام تُثبت؛ والكلّ يدّعي الاجتهاد.' },
      { en: 'Claim ✗: “I work well under pressure.” → Proof ✓: *I handled our busiest Ramadan season without a single escalation.*', ar: 'المثال يثبت ما لا يثبته الوصف', why: 'A specific occasion beats a general trait — it is checkable.', whyAr: 'الموقف المحدّد خير من الصفة العامّة لأنه قابل للتحقّق.' },
      { en: 'Mirror the advert: if it says *“fast-paced team”*, use *fast-paced* about yourself.', ar: 'استخدم كلمات الإعلان نفسها', why: 'Reusing their words makes the match visible without you claiming it.', whyAr: 'استخدام كلماتهم يُظهر التطابق دون أن تدّعيه.' },
      { en: '*I am available for an interview at any time and can start within one month.*', ar: 'الجاهزية بوضوح', why: 'Availability removes the last obstacle to inviting you.', whyAr: 'ذكر الجاهزية يزيل آخر عائق أمام دعوتك.' },
      { en: '*Thank you for your consideration.* / *My CV is attached.* + full name + phone.', ar: 'الختام الاحترافي مع بيانات التواصل', why: 'Close with courtesy, the attachment, and a way to reach you.', whyAr: 'اختم باللياقة والمرفق ووسيلة التواصل.' },
    ],
    exercises: [
      { q: 'Add proof: “I am good with customers.”', a: 'e.g. *I served about 80 customers a day and was chosen “employee of the month” twice.*' },
      { q: 'Add proof: “I speak good English.”', a: 'e.g. *I handle all English-language emails for my department — around 30 a week.*' },
      { q: 'Write the subject line for a Sales Assistant role, your name Karim Alaoui.', a: '*Application for Sales Assistant — Karim Alaoui*' },
      { q: 'Fix the tone: “please give me a chance i can do anything.”', a: '*I would welcome the opportunity to discuss how my experience fits this role.*' },
      { q: 'The advert asks for “attention to detail.” Prove it in one line.', a: 'e.g. *I reconciled daily cash reports for two years with no recorded errors.*' },
      { q: 'Name the strongest kind of proof.', a: '*Numbers* — years, calls, customers, percentages.' },
    ],
    reading: {
      title: 'Seven Seconds', titleAr: 'سبع ثوانٍ',
      passage: [
        'A friend of mine reads job applications for a living, and she once showed me her screen.',
        'Two emails sat side by side.',
        'The first said the writer was motivated, hard-working, and passionate about customer service.',
        'The second said the writer had answered sixty calls a day for two years in three languages and had never lost a complaint.',
        'Both writers, she told me, were probably telling the truth.',
        'Only one of them had given her a reason to open the CV, and in a folder of four hundred applications a reason is the only thing that survives.',
        'Adjectives describe you; numbers prove you.',
      ],
      tip: 'Everything in this email is a claim until you attach a number, a date, or an example to it.',
      tipAr: 'كل ما في هذا الإيميل مجرّد ادّعاء حتى تُلحقه برقم أو تاريخ أو مثال.',
    },
    studio: {
      prompt: { en: 'Apply for a Customer Service position at a company in Dubai. Use your real strengths.', ar: 'قدّم لوظيفة خدمة عملاء في شركة بدبي مستخدمًا نقاط قوتك الحقيقية.' },
      model: {
        title: 'Application — Customer Service', titleAr: 'تقديم — خدمة العملاء', layout: 'lines',
        parts: [
          { role: 'subject', en: 'Subject: Application for Customer Service Agent — Omar Benali' },
          { role: 'greeting', en: 'Dear Hiring Manager,' },
          { role: 'body', en: 'I am writing to apply for the Customer Service Agent position advertised on LinkedIn. I am a Moroccan graduate with two years of experience helping customers in Arabic, French, and English.' },
          { role: 'body', en: 'In my current role at a telecom company, I answer more than sixty calls a day and keep a 95% satisfaction score. My managers know me as calm under pressure — for example, I handled our busiest Ramadan season without a single escalation.' },
          { role: 'body', en: 'I am available for an interview at any time and can start within one month. My CV is attached.' },
          { role: 'closing', en: 'Thank you for your consideration.\nKind regards,\nOmar Benali\n+212 6 12 34 56 78' },
        ],
      },
      plan: [
        { label: 'Subject: job title + your name', ar: 'الموضوع: الوظيفة واسمك' },
        { label: 'Who you are in ONE line', ar: 'من أنت في سطر واحد' },
        { label: 'Strength 1 + proof (numbers!)', ar: 'قوة ١ + دليل بالأرقام' },
        { label: 'Strength 2 + example', ar: 'قوة ٢ + مثال' },
        { label: 'Availability + CV attached', ar: 'الجاهزية والمرفقات' },
        { label: 'Kind regards + name + phone', ar: 'الخاتمة والاسم والهاتف' },
      ],
      toolkit: [
        { group: 'Open', ar: 'الافتتاح', phrases: ['I am writing to apply for…', '…advertised on [site].', 'I am a … with … years of experience in…'] },
        { group: 'Prove your strengths', ar: 'إثبات القوة', phrases: ['In my current role, I…', 'For example, I…', 'I achieved… / I managed…', 'My managers know me as…'] },
        { group: 'Close strong', ar: 'الختام القوي', phrases: ['I am available for an interview…', 'My CV is attached.', 'Thank you for your consideration.', 'I look forward to hearing from you.'] },
      ],
      steps: [
        { en: 'Name the job + where you saw it in line one.', ar: 'اذكر الوظيفة ومصدر الإعلان في أول سطر.' },
        { en: 'Describe yourself in ONE strong line.', ar: 'عرّف بنفسك في سطر واحد قوي.' },
        { en: 'Give 2–3 strengths, each with a number or example.', ar: 'قدّم نقاط قوتك مع رقم أو مثال لكل واحدة.' },
        { en: 'State availability, attach the CV, close formally.', ar: 'اذكر جاهزيتك وأرفق سيرتك واختم رسميًا.' },
      ],
      checklist: [
        { en: 'Subject = job title + your name', ar: 'الموضوع = الوظيفة + اسمك' },
        { en: 'Every strength has proof (number/example)', ar: 'كل قوة معها دليل' },
        { en: 'No begging, no exaggeration — confident facts', ar: 'لا توسّل ولا مبالغة — حقائق واثقة' },
        { en: 'Availability + CV mentioned', ar: 'الجاهزية والسيرة مذكورتان' },
        { en: 'Full name + phone under Kind regards', ar: 'الاسم الكامل والهاتف في الخاتمة' },
      ],
    },
    homework: [
      { en: 'Write a real application for a job you actually want', ar: 'اكتب تقديمًا حقيقيًا لوظيفة تريدها فعلًا' },
      { en: 'Write your “who I am” line 3 different ways, pick the best', ar: 'اكتب سطر تعريفك بثلاث صيغ واختر الأقوى' },
      { en: 'List 3 strengths with a number/example for each', ar: 'اكتب ٣ نقاط قوة بدليل لكل واحدة' },
    ],
    editing: {
      wrong: [
        'Subject: job',
        'dear sir i see your job i am hard worker and i want this job please give me a chance i can do anything. call me.',
      ],
      correct: [
        'Subject: *Application for Sales Assistant — Karim Alaoui*',
        '*Dear Hiring Manager,* *I am writing to apply for* the Sales Assistant position *advertised on Indeed*. I have two years of retail experience*, and* last year *I increased* my section’s sales *by 20%*. *I am available for an interview at any time. My CV is attached.* *Kind regards,* Karim Alaoui',
      ],
    },
  },

  /* ─────────────────────────── 10.55 · USED TO (A2) ─────────────────────────── */
  {
    no: 10.55, cefr: 'A2', tag: 'Used to', tagAr: 'اعتاد أن',
    title: 'Used to — past habits that ended',
    titleAr: 'Used to — عادات ماضية انتهت',
    objectives: [
      { en: 'Talk about finished past habits', ar: 'التحدث عن عادات ماضية منتهية' },
      { en: 'Form: used to + base verb', ar: 'التكوين: used to + الفعل المجرّد' },
      { en: 'Make negatives and questions with did', ar: 'النفي والسؤال بـ did' },
      { en: 'Write "then vs now" paragraphs', ar: 'كتابة فقرات «كان vs الآن»' },
    ],
    rule: {
      en: '*Used to + base verb* describes a past habit or state that is NOT true anymore: “I *used to play* football every day.” (I don’t now.)',
      ar: 'used to + الفعل المجرّد يصف عادة أو حالة ماضية لم تعد قائمة: كنت ألعب الكرة كل يوم (ولم أعد).',
    },
    explain: {
      intro: 'This is the tense of memories — childhood, your old city, life before. It powers beautiful "then vs now" paragraphs.',
      introAr: 'هذا زمن الذكريات — الطفولة والمدينة القديمة والحياة السابقة. وهو وقود فقرات «قديمًا مقابل الآن» الجميلة.',
      points: [
        { en: 'Past habit: I *used to walk* to school.', ar: 'عادة ماضية' },
        { en: 'Past state: There *used to be* a garden here.', ar: 'حالة ماضية' },
        { en: 'Contrast with now: …but now I take the bus.', ar: 'مقابلة مع الحاضر' },
        { en: 'After did/didn’t → *use to* (no d)', ar: 'بعد did تسقط d' },
      ],
    },
    form: {
      affirmative: [
        'I / She / They *used to* smoke.',
        'There *used to be* a cinema here.',
      ],
      negative: [
        'I *didn’t use to* like coffee. (no d!)',
      ],
      question: [
        '*Did* you *use to* live in Fes? — Yes, I did.',
      ],
      note: 'Only for the PAST. For present habits use the present simple: “I usually walk” (NOT “I use to walk”).',
      noteAr: 'للماضي فقط. للعادة الحاضرة استخدم المضارع البسيط: I usually walk وليس I use to walk.',
    },
    signals: [
      { en: 'when I was a child', ar: 'عندما كنت طفلًا' }, { en: 'years ago', ar: 'قبل سنوات' },
      { en: 'in the past', ar: 'في الماضي' }, { en: 'but now', ar: 'لكن الآن' },
    ],
    examples: [
      { en: 'I *used to play* in this street.', ar: 'كنت ألعب في هذا الشارع.', why: '*used to* + BARE verb — a habit that existed then and does NOT now.', whyAr: 'used to + مجرّد: عادة كانت ولم تعد.' },
      { en: 'She *used to have* long hair.', ar: 'كان شعرها طويلًا.', why: 'It works for past STATES too, not only actions.', whyAr: 'تصلح للحالات الماضية لا للأفعال فقط.' },
      { en: 'We *used to visit* our grandmother every Friday.', ar: 'كنا نزور جدتنا كل جمعة.', why: 'The repetition is built into the meaning — no need to add *always*.', whyAr: 'التكرار داخل المعنى فلا حاجة إلى always.' },
      { en: 'He *used to be* very shy.', ar: 'كان خجولًا جدًا.', why: '*used to be* describes a past characteristic that has since changed.', whyAr: 'used to be تصف صفة ماضية تغيّرت.' },
      { en: 'There *used to be* a big tree here.', ar: 'كانت هنا شجرة كبيرة.', why: '*There used to be* is the past of *there is* for things now gone.', whyAr: 'There used to be ماضي There is لما زال.' },
      { en: 'I *didn’t use to* like vegetables.', ar: 'لم أكن أحب الخضار.', why: 'Negative drops the *d*: *didn’t use to*, because *didn’t* holds the past.', whyAr: 'النفي يسقط d لأن didn’t تحمل الماضي.' },
      { en: '*Did* you *use to* watch cartoons?', ar: 'هل كنت تشاهد الرسوم المتحركة؟', why: 'Question drops the *d* too — same reason as the negative.', whyAr: 'السؤال يسقط d للسبب نفسه.' },
      { en: 'My city *used to be* much quieter.', ar: 'كانت مدينتي أهدأ بكثير.', why: 'The whole point of this tense: a contrast with now is implied.', whyAr: 'جوهر هذا الزمن أن المقارنة بالحاضر مضمرة.' },
      { en: 'I *used to write* with my left hand.', ar: 'كنت أكتب بيدي اليسرى.', why: 'A past habit that stopped — the reader understands you no longer do it.', whyAr: 'عادة ماضية توقّفت، ويفهم القارئ أنك لم تعد تفعلها.' },
      { en: 'People *used to send* letters, but now they send emails.', ar: 'كان الناس يرسلون الرسائل، والآن الإيميلات.', why: '*but now* makes the implied contrast explicit — useful in essays.', whyAr: 'عبارة but now تُظهر المقارنة المضمرة، وهي مفيدة في المقالات.' },
    ],
    exercises: [
      { q: 'Form: “I ___ (live) in a small village.”', a: 'I *used to live* in a small village.' },
      { q: 'Negative: “She ___ (not/like) tea.”', a: 'She *didn’t use to like* tea.' },
      { q: 'Question: “you / play chess?”', a: '*Did* you *use to play* chess?' },
      { q: 'Fix: “I use to go to the beach every summer.” (past)', a: 'I *used to go* to the beach every summer.' },
      { q: 'Fix: “He didn’t used to smoke.”', a: 'He didn’t *use to* smoke.' },
    ],
    reading: {
      title: 'My Street, Then and Now', titleAr: 'شارعي بين الأمس واليوم',
      passage: [
        'My street *used to be* a quiet place where everyone knew everyone.',
        'There *used to be* one small shop, and its owner *used to give* us candy for free.',
        'We *used to play* football until the sunset call to prayer.',
        'Now the street is full of cars, and the children play on their phones instead.',
        'Times change — but when I close my eyes, I can still hear our laughter.',
      ],
      tip: 'used to paints the past; the present simple shows the “now” — the contrast makes the paragraph moving.',
      tipAr: 'used to يرسم الماضي والمضارع يُظهر الحاضر — والمقابلة تصنع التأثير.',
    },
    homework: [
      { en: 'Write 5 sentences about your childhood with used to', ar: 'اكتب ٥ جمل عن طفولتك بـ used to' },
      { en: 'Write a “then vs now” paragraph about your city', ar: 'اكتب فقرة «قديمًا والآن» عن مدينتك' },
      { en: 'Ask a parent what life used to be like — write 3 of their answers', ar: 'اسأل أحد والديك واكتب ٣ من أجوبته' },
    ],
    editing: {
      wrong: [
        'I use to play outside every day when I was small.',
        'My father didn’t used to have a car, so he use to walk to work.',
      ],
      correct: [
        'I *used to* play outside every day when I was small.',
        'My father didn’t *use to* have a car, so he *used to* walk to work.',
      ],
    },
  },

  /* ─────────────────────────── 10.82 · PRESENT PERFECT vs PAST SIMPLE (B1) ─────────────────────────── */
  {
    no: 10.82, cefr: 'B1', tag: 'PP vs Past', tagAr: 'التام أم الماضي؟',
    title: 'Present Perfect vs Past Simple — which one?',
    titleAr: 'المضارع التام أم الماضي البسيط — أيهما؟',
    objectives: [
      { en: 'Choose the right tense by the TIME', ar: 'اختيار الزمن حسب الوقت' },
      { en: 'Finished time word → past simple', ar: 'وقت منتهٍ محدّد ← الماضي البسيط' },
      { en: 'Open time / experience → present perfect', ar: 'وقت مفتوح أو تجربة ← المضارع التام' },
      { en: 'Stop translating from Arabic here', ar: 'التوقف عن الترجمة من العربية هنا' },
    ],
    rule: {
      en: 'A *finished time* is stated (yesterday, in 2020, two days ago) → *past simple*. No specific time, or time up to now (ever, yet, since, this week) → *present perfect*.',
      ar: 'وقت منتهٍ مذكور (أمس، في ٢٠٢٠) ← الماضي البسيط. لا وقت محدّد أو مدة ممتدة حتى الآن ← المضارع التام.',
    },
    explain: {
      intro: 'Arabic has one past tense, so this choice has no translation — it is a NEW reflex. The question that decides everything: is the time finished and named, or open until now?',
      introAr: 'العربية فيها ماضٍ واحد، فلا ترجمة تنفعك هنا — إنه انعكاس جديد. السؤال الحاسم: هل الوقت منتهٍ ومذكور، أم مفتوح حتى الآن؟',
      points: [
        { en: '*yesterday / ago / in 2020 / last week* → past simple', ar: 'وقت منتهٍ ← ماضٍ بسيط' },
        { en: '*ever / never / just / yet / already* → present perfect', ar: 'تجربة ← مضارع تام' },
        { en: '*since / for / this week / today* (still open) → present perfect', ar: 'مدة مفتوحة ← مضارع تام' },
        { en: 'Ask: “WHEN exactly?” If you can answer → past simple', ar: 'اسأل: متى بالضبط؟' },
      ],
    },
    examples: [
      { en: 'I *visited* Dubai *in 2023*.', ar: 'زرت دبي في ٢٠٢٣ (وقت مذكور).', why: '*in 2023* is a FINISHED time, so the past simple is the only option.', whyAr: 'زمن منتهٍ فيتعيّن الماضي البسيط.' },
      { en: 'I *have visited* Dubai *twice*.', ar: 'زرت دبي مرتين (تجربة، بلا وقت).', why: '*twice* counts experience with no date — that is present perfect territory.', whyAr: 'twice تعدّ التجربة بلا تاريخ، وهذا مجال المضارع التام.' },
      { en: 'She *finished* the report *yesterday*.', ar: 'أنهت التقرير أمس.', why: '*yesterday* names a finished day → past simple. Never *has finished yesterday*.', whyAr: 'yesterday يوم منتهٍ فالماضي البسيط، ولا يصحّ المضارع التام معه.' },
      { en: 'She *has* already *finished* the report.', ar: 'أنهت التقرير بالفعل (النتيجة الآن).', why: 'No time word at all, and the result matters now → present perfect.', whyAr: 'لا كلمة زمن والنتيجة تهمّ الآن فالمضارع التام.' },
      { en: 'We *lived* in Rabat *for five years*. (we left)', ar: 'عشنا في الرباط خمس سنوات (وانتقلنا).', why: 'The bracket is the key: we LEFT, so the period is closed → past simple.', whyAr: 'القوس هو المفتاح: غادرنا فانغلقت المدّة فالماضي البسيط.' },
      { en: 'We *have lived* in Rabat *since 2019*. (still there)', ar: 'نعيش في الرباط منذ ٢٠١٩ (ما زلنا).', why: 'Still there, so the period is open → present perfect with *since*.', whyAr: 'ما زلنا هناك فالمدّة مفتوحة فالمضارع التام مع since.' },
      { en: '*Did* you *see* the match *last night*?', ar: 'هل شاهدت المباراة ليلة أمس؟', why: '*last night* is finished, so the question uses *Did*.', whyAr: 'last night منتهية فالسؤال بـ Did.' },
      { en: '*Have* you *ever seen* snow?', ar: 'هل رأيت الثلج من قبل؟', why: '*ever* asks about life so far — open time, so *Have you*.', whyAr: 'ever تسأل عن الحياة كلها، والزمن مفتوح فـ Have you.' },
      { en: 'He *lost* his keys *this morning*. (morning is over)', ar: 'أضاع مفاتيحه هذا الصباح (انتهى الصباح).', why: 'The morning is OVER, so the time frame is closed → past simple.', whyAr: 'الصباح انتهى فانغلق الإطار الزمني فالماضي البسيط.' },
      { en: 'He *has lost* his keys — help him look! (still lost)', ar: 'أضاع مفاتيحه — ما زالت ضائعة!', why: 'The keys are STILL lost — the result is alive now → present perfect.', whyAr: 'المفاتيح ما زالت ضائعة والنتيجة قائمة فالمضارع التام.' },
    ],
    exercises: [
      { q: 'Choose: “I ___ (meet) her two years ago.”', a: 'I *met* her two years ago.' },
      { q: 'Choose: “I ___ (know) her for two years.”', a: 'I *have known* her for two years.' },
      { q: 'Choose: “___ you ever ___ (try) sushi?”', a: '*Have* you ever *tried* sushi?' },
      { q: 'Choose: “When ___ you ___ (arrive)?”', a: 'When *did* you *arrive*? (When = finished time)' },
      { q: 'Fix: “I have seen him yesterday.”', a: 'I *saw* him yesterday.' },
      { q: 'Fix: “She finished her homework already, she can play.”', a: 'She *has* already *finished* her homework…' },
    ],
    reading: {
      title: 'An Old Friend', titleAr: 'صديق قديم',
      passage: [
        'I *have known* Rachid since primary school — more than twenty years now.',
        'We *met* in 2004, when his family *moved* to our neighborhood.',
        'We *have shared* everything since then: exams, football, even our first jobs.',
        'Last month he *travelled* to Qatar for work, and I *have not seen* him since that day.',
        'But real friendship does not need daily meetings — it simply continues.',
      ],
      tip: 'Named past moments (met in 2004, travelled last month) = past simple; everything still open (have known, have shared) = present perfect.',
      tipAr: 'اللحظات المسماة ماضٍ بسيط؛ وكل ما يمتد حتى الآن مضارع تام.',
    },
    homework: [
      { en: 'Write 3 pairs: same verb, once with a finished time, once open', ar: 'اكتب ٣ أزواج: بوقت منتهٍ ثم بوقت مفتوح' },
      { en: 'Write about a friendship using both tenses correctly', ar: 'اكتب عن صداقة بالزمنين معًا' },
      { en: 'Hunt the signal words in any English text you read', ar: 'اصطد الكلمات الدالة في نص تقرؤه' },
    ],
    editing: {
      wrong: [
        'I have visited my uncle last Friday.',
        'Did you ever eat camel meat?',
        'She works here since 2020.',
      ],
      correct: [
        'I *visited* my uncle last Friday.',
        '*Have* you ever *eaten* camel meat?',
        'She *has worked* here since 2020.',
      ],
    },
  },

  /* ─────────────────────────── 10.85 · QUESTIONS (A2) ─────────────────────────── */
  {
    no: 10.85, cefr: 'A2', tag: 'Questions', tagAr: 'الأسئلة',
    title: 'Asking Questions — in every tense',
    titleAr: 'طرح الأسئلة — في كل الأزمنة',
    objectives: [
      { en: 'Use the question words (what, where, when, why, who, how)', ar: 'استخدام أدوات الاستفهام' },
      { en: 'Build questions with the QASM order', ar: 'بناء السؤال بترتيب QASM' },
      { en: 'Ask in present, past, and future', ar: 'السؤال في الأزمنة الثلاثة' },
      { en: 'Ask politely inside emails', ar: 'السؤال بأدب داخل الإيميلات' },
    ],
    rule: {
      en: 'Question order = *Q*uestion word + *A*uxiliary + *S*ubject + *M*ain verb: “*Where* *do* *you* *live*?” Never keep statement order: “Where you live?” ✗',
      ar: 'ترتيب السؤال: أداة الاستفهام + الفعل المساعد + الفاعل + الفعل الرئيسي: ?Where do you live — ولا نبقي ترتيب الجملة الخبرية أبدًا.',
    },
    explain: {
      intro: 'Arabic questions keep the sentence order (أين تسكن؟). English INVERTS with an auxiliary — forgetting do/does/did is the most common question error.',
      introAr: 'السؤال العربي يحافظ على ترتيب الجملة. أما الإنجليزي فيقلب بالمساعد — ونسيان do/does/did هو أشهر خطأ.',
      points: [
        { en: 'what ماذا · where أين · when متى · why لماذا', ar: 'أدوات ١' },
        { en: 'who مَن · how كيف · how much/many كم', ar: 'أدوات ٢' },
        { en: 'be inverts alone: *Are* you tired? *Was* he late?', ar: 'فعل الكينونة ينقلب وحده' },
        { en: 'Other verbs need do/does/did/will/have', ar: 'باقي الأفعال تحتاج مساعدًا' },
      ],
    },
    form: {
      affirmative: [
        'Present: *Where do* you work? · *What does* she want?',
        'Past: *When did* they arrive? · *Why did* he leave?',
        'Future / Perfect: *Will* you come? · *Have* you finished?',
      ],
      negative: [
        '*Why don’t* you join us?',
        '*Why didn’t* she call?',
      ],
      question: [
        'Subject questions take NO auxiliary: *Who called* you? · *What happened*?',
        'Polite (for emails): *Could you tell me when* the course starts?',
      ],
      note: 'After did/does the main verb returns to BASE form: “Where did you *go*?” — NOT went.',
      noteAr: 'بعد did/does يعود الفعل مجرّدًا: Where did you go لا went.',
    },
    examples: [
      { en: '*What do* you do on Fridays?', ar: 'ماذا تفعل أيام الجمعة؟', why: '*What* + *do* + subject + BARE verb. The helper carries the tense.', whyAr: 'ترتيب ثابت: أداة + do + فاعل + فعل مجرّد، والمساعد يحمل الزمن.' },
      { en: '*Where does* your brother work?', ar: 'أين يعمل أخوك؟', why: '*does* for he/she/it — and *work* loses its *-s* because *does* took it.', whyAr: 'does للمفرد الغائب، ويتجرّد الفعل لأن does أخذت s.' },
      { en: '*When did* you start learning English?', ar: 'متى بدأت تعلّم الإنجليزية؟', why: '*did* carries the past, so *start* returns to the bare form.', whyAr: 'did تحمل الماضي فيعود الفعل مجرّدًا.' },
      { en: '*Why did* she leave early?', ar: 'لماذا غادرت مبكرًا؟', why: 'Same shape for *Why* — every *wh-* question uses this one pattern.', whyAr: 'الترتيب نفسه مع Why؛ كل أدوات الاستفهام بنمط واحد.' },
      { en: '*How do* you go to work?', ar: 'كيف تذهب إلى العمل؟', why: '*How* asks about manner, but the word order does not change at all.', whyAr: 'How تسأل عن الكيفية دون تغيير في الترتيب.' },
      { en: '*How much does* this cost?', ar: 'بكم هذا؟', why: '*How much* asks about price or an uncountable amount.', whyAr: 'How much للثمن أو الكمّية غير المعدودة.' },
      { en: '*How many* brothers *do* you have?', ar: 'كم أخًا لديك؟', why: '*How many* asks for a NUMBER, so the noun must be countable and plural.', whyAr: 'How many تسأل عن عدد فالاسم معدود وجمع.' },
      { en: '*Are* you ready? · *Was* the exam hard?', ar: 'هل أنت مستعد؟ هل كان الامتحان صعبًا؟', why: 'With *be* there is NO helper — just swap the subject and the verb.', whyAr: 'مع فعل الكينونة لا مساعد، بل تقديم وتأخير فقط.' },
      { en: '*Will* you join us tomorrow?', ar: 'هل ستنضم إلينا غدًا؟', why: 'Modals invert too: *will*, *can*, *should* all move to the front alone.', whyAr: 'الأفعال الناقصة تتقدّم وحدها كذلك.' },
      { en: '*Have* you finished the report?', ar: 'هل أنهيت التقرير؟', why: 'The present perfect inverts its helper: *Have you…*.', whyAr: 'المضارع التام يقدّم مساعده.' },
      { en: '*Who told* you the news? (subject — no do)', ar: 'من أخبرك؟', why: 'THE exception: when *who* IS the subject, no *do* is used at all.', whyAr: 'الاستثناء: إذا كانت who هي الفاعل فلا تُستعمل do.' },
      { en: 'Email-polite: *Could you tell me what* the price is?', ar: 'هلّا أخبرتني بالسعر؟', why: 'An indirect question is polite and takes STATEMENT order — no inversion.', whyAr: 'السؤال غير المباشر مهذّب وبترتيب خبري بلا تقديم.' },
    ],
    exercises: [
      { q: 'Build: “you / live / where?” (present)', a: '*Where do you live?*' },
      { q: 'Build: “she / arrive / when?” (past)', a: '*When did she arrive?*' },
      { q: 'Fix: “Where you work?”', a: 'Where *do* you work?' },
      { q: 'Fix: “Why you didn’t come yesterday?”', a: 'Why *didn’t you* come yesterday?' },
      { q: 'Fix: “Where did you went?”', a: 'Where did you *go*?' },
      { q: 'Make it email-polite: “When does the course start?”', a: '*Could you tell me when the course starts?*' },
    ],
    reading: {
      title: 'Interview with My Grandfather', titleAr: 'حوار مع جدي',
      passage: [
        'For a school project, I interviewed my grandfather about his youth.',
        '“*Where did* you grow up?” I asked. “In a small village near the mountains,” he smiled.',
        '“*What did* you do for fun?” — “We raced donkeys, my son. *Do* you race anything today?”',
        '“*How many* hours *did* you walk to school?” — “Two. And *are* you tired after a five-minute bus ride?”',
        'By the end, I understood: good questions open doors that stay closed forever without them.',
      ],
      tip: 'Question word + auxiliary + subject + base verb — in every single question above.',
      tipAr: 'أداة + مساعد + فاعل + فعل مجرّد — في كل سؤال أعلاه.',
    },
    homework: [
      { en: 'Write 6 questions (one per question word) to interview someone', ar: 'اكتب ٦ أسئلة لمقابلة شخص' },
      { en: 'Write 3 polite email questions with Could you tell me…', ar: 'اكتب ٣ أسئلة مهذّبة للإيميل' },
      { en: 'Interview a family member and write their 3 best answers', ar: 'حاور فردًا من العائلة ودوّن أجوبته' },
    ],
    editing: {
      wrong: [
        'What time it is?',
        'Where she does live?',
        'Why you didn’t called me yesterday?',
      ],
      correct: [
        'What time *is it*?',
        'Where *does she* live?',
        'Why *didn’t you call* me yesterday?',
      ],
    },
  },

  /* ─────────────────────────── 11.45 · GERUND vs INFINITIVE (B1) ─────────────────────────── */
  {
    no: 11.45, cefr: 'B1', tag: 'Gerund/Infinitive', tagAr: 'المصدر بنوعيه',
    title: 'Gerund or Infinitive — enjoy doing, want to do',
    titleAr: 'الفعل بعد الفعل — doing أم to do؟',
    objectives: [
      { en: 'Learn the verbs that take -ing', ar: 'الأفعال التي تتبعها -ing' },
      { en: 'Learn the verbs that take to + base', ar: 'الأفعال التي يتبعها to' },
      { en: 'Use -ing after prepositions', ar: '-ing بعد حروف الجر' },
      { en: 'Use to + base for purpose', ar: 'to للتعبير عن الغرض' },
    ],
    rule: {
      en: 'Some verbs are followed by *-ing* (enjoy, finish, keep, mind, avoid); others by *to + base* (want, need, decide, hope, plan). After a *preposition*, always *-ing*.',
      ar: 'بعض الأفعال يتبعها -ing (enjoy, finish, keep…)، وأخرى يتبعها to + المجرّد (want, need, decide…). وبعد حرف الجر دائمًا -ing.',
    },
    explain: {
      intro: 'Arabic uses أن + فعل for both, so learners guess. In English the FIRST verb decides the form of the second — memorize the two teams.',
      introAr: 'العربية تستخدم «أن + فعل» للحالتين، فيخمّن المتعلم. في الإنجليزية الفعل الأول يقرّر شكل الثاني — احفظ الفريقين.',
      points: [
        { en: 'Team -ING: enjoy, finish, keep, mind, avoid, suggest, practice', ar: 'فريق -ing' },
        { en: 'Team TO: want, need, decide, hope, plan, agree, learn, promise', ar: 'فريق to' },
        { en: 'Both (same meaning): like, love, start, continue', ar: 'الفريقان معًا' },
        { en: 'Preposition + -ing: good *at writing* · before *leaving*', ar: 'بعد حرف الجر -ing' },
      ],
    },
    form: {
      affirmative: [
        'enjoy / finish / keep + *-ing*: I enjoy *reading*.',
        'want / decide / hope + *to*: I want *to travel*.',
        'purpose: I study English *to get* a better job.',
      ],
      negative: [
        'I enjoy *not working* on Fridays. (rare)',
        'I decided *not to go*.',
      ],
      question: [
        'Do you enjoy *cooking*?',
        'Where do you hope *to work*?',
      ],
      note: '“stop” changes meaning: stop *smoking* = quit the habit · stop *to smoke* = pause in order to smoke.',
      noteAr: 'stop يغيّر المعنى: stop smoking أقلع عنه · stop to smoke توقّف ليدخّن.',
    },
    examples: [
      { en: 'I enjoy *reading* before bed.', ar: 'أستمتع بالقراءة قبل النوم.', why: '*enjoy* always takes *-ing*. The verb after it is a THING you enjoy.', whyAr: 'enjoy تأخذ ing دائمًا؛ ما بعدها شيء تستمتع به.' },
      { en: 'She finished *writing* the report.', ar: 'أنهت كتابة التقرير.', why: '*finish* takes *-ing* too — the activity already existed to be finished.', whyAr: 'finish تأخذ ing؛ النشاط كان موجودًا لتُنهيه.' },
      { en: 'Keep *practicing* every day.', ar: 'واظب على التمرين يوميًا.', why: '*keep* + *-ing* means continue. The action is ongoing, so *-ing* fits.', whyAr: 'keep + ing تعني الاستمرار.' },
      { en: 'Avoid *eating* late at night.', ar: 'تجنّب الأكل متأخرًا.', why: '*avoid* takes *-ing* — you are avoiding an activity, not a plan.', whyAr: 'avoid تأخذ ing لأنك تتجنّب نشاطًا لا خطّة.' },
      { en: 'I want *to improve* my writing.', ar: 'أريد تحسين كتابتي.', why: '*want* takes *to* — it points FORWARD at something not yet done.', whyAr: 'want تأخذ to لأنها تنظر إلى ما لم يحدث بعد.' },
      { en: 'We decided *to move* to Casablanca.', ar: 'قررنا الانتقال إلى الدار البيضاء.', why: '*decide* points forward to a future action → *to*.', whyAr: 'decide تنظر إلى المستقبل فتأخذ to.' },
      { en: 'She hopes *to study* medicine.', ar: 'تأمل أن تدرس الطب.', why: '*hope* is about the future too, so *to* again.', whyAr: 'hope عن المستقبل فتأخذ to.' },
      { en: 'He promised *to call* me back.', ar: 'وعد بمعاودة الاتصال.', why: '*promise* commits you to a future act → *to*.', whyAr: 'promise تلزمك بفعل مستقبلي فتأخذ to.' },
      { en: 'I’m good *at solving* problems.', ar: 'أنا بارع في حل المشكلات.', why: 'After ANY preposition the verb must take *-ing* — *at*, *in*, *of*, *for*.', whyAr: 'بعد أي حرف جرّ يأخذ الفعل ing.' },
      { en: 'Think twice before *sending* an angry email.', ar: 'فكّر مرتين قبل إرسال إيميل غاضب.', why: '*before* is a preposition here, so *-ing*. This rule has no exceptions.', whyAr: 'before حرف جرّ هنا فتأخذ ing، ولا استثناء.' },
      { en: 'I came here *to learn*.', ar: 'جئت هنا لأتعلّم.', why: '*to* here means PURPOSE (in order to), not the infinitive pattern.', whyAr: 'to هنا للغرض أي in order to لا لصيغة المصدر.' },
    ],
    exercises: [
      { q: 'Choose: “I enjoy ___ (swim).”', a: 'I enjoy *swimming*.' },
      { q: 'Choose: “She wants ___ (be) a doctor.”', a: 'She wants *to be* a doctor.' },
      { q: 'Choose: “He finished ___ (do) his homework.”', a: 'He finished *doing* his homework.' },
      { q: 'Preposition: “I’m interested ___ (learn) design.”', a: 'I’m interested *in learning* design.' },
      { q: 'Fix: “I enjoy to read stories.”', a: 'I enjoy *reading* stories.' },
      { q: 'Fix: “She decided leaving the job.”', a: 'She decided *to leave* the job.' },
    ],
    reading: {
      title: 'Why I Keep Writing', titleAr: 'لماذا أواصل الكتابة',
      passage: [
        'Two years ago I decided *to learn* English seriously.',
        'At first I avoided *writing*, because I hated *seeing* my own mistakes.',
        'Then my teacher suggested *keeping* a small daily journal.',
        'I promised *to write* five sentences every night, and I kept *going* even on hard days.',
        'Today I enjoy *writing* more than anything — and I plan *to write* my first long story this year.',
      ],
      tip: 'decided/promised/plan + to · avoided/suggested/kept/enjoy + -ing — the first verb decides.',
      tipAr: 'الفعل الأول يقرّر: هؤلاء مع to وهؤلاء مع -ing.',
    },
    homework: [
      { en: 'Write 4 sentences with team-ING verbs and 4 with team-TO', ar: 'اكتب ٤ جمل من كل فريق' },
      { en: 'Write 3 sentences: good at / interested in / before + -ing', ar: 'اكتب ٣ جمل بحرف جر + -ing' },
      { en: 'Write your 3 goals with hope/plan/want + to', ar: 'اكتب ٣ أهداف بـ hope/plan/want' },
    ],
    editing: {
      wrong: [
        'I want improving my English quickly.',
        'She enjoys to cook for the family.',
        'He is very good in write emails.',
      ],
      correct: [
        'I want *to improve* my English quickly.',
        'She enjoys *cooking* for the family.',
        'He is very good *at writing* emails.',
      ],
    },
  },

  /* ─────────────────────────── 11.75 · PASSIVE VOICE (B1) ─────────────────────────── */
  {
    no: 11.75, cefr: 'B1', tag: 'Passive', tagAr: 'المبني للمجهول',
    title: 'The Passive — formal, professional English',
    titleAr: 'المبني للمجهول — لغة رسمية واحترافية',
    objectives: [
      { en: 'Form the passive: be + past participle', ar: 'التكوين: be + التصريف الثالث' },
      { en: 'Use it when the doer is unknown/unimportant', ar: 'حين يكون الفاعل مجهولًا أو غير مهم' },
      { en: 'Use it in formal emails and notices', ar: 'في الإيميلات والإشعارات الرسمية' },
      { en: 'Add “by” only when the doer matters', ar: 'إضافة by عند الحاجة فقط' },
    ],
    rule: {
      en: 'Passive = *be + past participle (V3)*: “The order *was shipped*.” Use it when WHO did it is unknown, obvious, or less important than what happened.',
      ar: 'المبني للمجهول = be + التصريف الثالث: The order was shipped. نستخدمه حين يكون الفاعل مجهولًا أو بديهيًا أو أقل أهمية من الحدث.',
    },
    explain: {
      intro: 'Professional writing loves the passive because it sounds objective: “The meeting has been moved” blames nobody. It is the register of offices, reports, and official messages.',
      introAr: 'الكتابة الاحترافية تحب المبني للمجهول لأنه محايد: «نُقل الاجتماع» بلا اتهام لأحد. إنه أسلوب المكاتب والتقارير والرسائل الرسمية.',
      points: [
        { en: 'Present: The office *is cleaned* daily.', ar: 'مضارع' },
        { en: 'Past: The email *was sent* yesterday.', ar: 'ماضٍ' },
        { en: 'Perfect: Your request *has been approved*.', ar: 'تام' },
        { en: 'Future: The results *will be announced* soon.', ar: 'مستقبل' },
      ],
    },
    form: {
      affirmative: [
        'am/is/are + V3: English *is spoken* here.',
        'was/were + V3: The report *was written* by Salma.',
        'has/have been + V3: The order *has been shipped*.',
        'will be + V3: You *will be contacted* soon.',
      ],
      negative: [
        'The email *was not sent*.',
        'Pets *are not allowed* in the building.',
      ],
      question: [
        '*Was* the package *delivered*?',
        '*When will* the results *be announced*?',
      ],
      note: 'Add *by + doer* only when it adds information: “written *by Salma*”. Otherwise drop it.',
      noteAr: 'أضف by + الفاعل فقط إن أضاف معلومة، وإلا فاحذفه.',
    },
    examples: [
      { en: 'Arabic and French *are spoken* in Morocco.', ar: 'تُتحدَّث العربية والفرنسية في المغرب.', why: '*are* + V3. We use the passive because WHO speaks them does not matter.', whyAr: 'are + التصريف الثالث؛ نستعمل المجهول لأن الفاعل غير مهمّ.' },
      { en: 'The mosque *was built* in the 12th century.', ar: 'بُني المسجد في القرن الثاني عشر.', why: 'Past passive: *was* + V3. The builder is unknown, so the passive is honest.', whyAr: 'مجهول الماضي: was + التصريف الثالث؛ البنّاء مجهول فالمجهول صادق.' },
      { en: 'Breakfast *is served* from 7 to 10.', ar: 'يُقدَّم الفطور من ٧ إلى ١٠.', why: 'The hotel serves it, but the guest cares about the TIME, not the server.', whyAr: 'الفندق يقدّمه، لكن الضيف يهمّه الوقت لا مَن يقدّم.' },
      { en: 'My phone *was stolen* on the bus.', ar: 'سُرق هاتفي في الحافلة.', why: 'Here the doer is unknown — which is exactly what the passive is for.', whyAr: 'الفاعل مجهول، وهذا موضع المجهول تمامًا.' },
      { en: 'The email *has been sent* to all students.', ar: 'أُرسل الإيميل لجميع الطلاب.', why: 'Present perfect passive: *has been* + V3. Two helpers, one V3.', whyAr: 'مجهول المضارع التام: has been + التصريف الثالث.' },
      { en: 'Your application *has been received*.', ar: 'استُلم طلبك.', why: 'The classic professional line — it reports the fact without naming staff.', whyAr: 'عبارة مهنية كلاسيكية تنقل الخبر بلا تسمية أحد.' },
      { en: 'The meeting *has been moved* to Monday.', ar: 'نُقل الاجتماع إلى الاثنين.', why: 'The passive quietly avoids saying WHO moved it — useful, and worth noticing.', whyAr: 'المجهول يتجنّب ذكر من نقله، وهو مفيد ويستحقّ الانتباه.' },
      { en: 'Winners *will be announced* on Friday.', ar: 'سيُعلن عن الفائزين الجمعة.', why: 'Future passive: *will be* + V3.', whyAr: 'مجهول المستقبل: will be + التصريف الثالث.' },
      { en: 'Smoking *is not allowed* here.', ar: 'التدخين ممنوع هنا.', why: 'Rules and notices use the passive because the authority is understood.', whyAr: 'اللوائح تستعمل المجهول لأن الجهة معلومة ضمنًا.' },
      { en: 'This carpet *was made by hand*.', ar: 'صُنعت هذه الزربية يدويًا.', why: '*by* names the doer — use it only when the doer is genuinely interesting.', whyAr: 'by تذكر الفاعل، ولا تُستعمل إلا إذا كان الفاعل مهمًّا.' },
    ],
    exercises: [
      { q: 'Passive (present): “They clean the office daily.”', a: 'The office *is cleaned* daily.' },
      { q: 'Passive (past): “Someone stole my bag.”', a: 'My bag *was stolen*.' },
      { q: 'Passive (perfect): “We have approved your request.”', a: 'Your request *has been approved*.' },
      { q: 'Passive (future): “We will contact you.”', a: 'You *will be contacted*.' },
      { q: 'Fix: “The report was wrote by me.”', a: 'The report was *written* by me.' },
      { q: 'Fix: “The window is break.”', a: 'The window *is broken*.' },
    ],
    reading: {
      title: 'A Notice to All Employees', titleAr: 'إشعار لجميع الموظفين',
      passage: [
        'Please note that the annual meeting *has been moved* to Thursday, 14 September.',
        'The main hall *is being prepared*, so Tuesday’s training *will be held* online.',
        'Lunch *will be provided* after the meeting, and parking *is reserved* for guests.',
        'Questions *can be sent* to the HR office before Wednesday.',
        'Thank you for your cooperation.',
      ],
      tip: 'Notice how official messages avoid naming anyone — the passive keeps the tone neutral and professional.',
      tipAr: 'الرسائل الرسمية تتجنّب تسمية الفاعل — المبني للمجهول يحفظ الحياد والاحترافية.',
    },
    homework: [
      { en: 'Turn 5 active sentences into the passive', ar: 'حوّل ٥ جمل إلى المبني للمجهول' },
      { en: 'Write 3 passive facts about your city (was built / is known…)', ar: 'اكتب ٣ حقائق عن مدينتك' },
      { en: 'Write a 4-line office notice using the passive', ar: 'اكتب إشعارًا مكتبيًا من ٤ أسطر' },
    ],
    editing: {
      wrong: [
        'The email was send to the wrong address.',
        'This building built in 1950.',
        'Your order will shipped tomorrow.',
      ],
      correct: [
        'The email was *sent* to the wrong address.',
        'This building *was built* in 1950.',
        'Your order will *be shipped* tomorrow.',
      ],
    },
  },

  /* ─────────────────────────── 11.9 · CONFUSING VERBS (A2) ─────────────────────────── */
  {
    no: 11.9, cefr: 'A2', tag: 'Confusing verbs', tagAr: 'أفعال مُلتبسة',
    title: 'Confusing Verbs — make/do, say/tell, and friends',
    titleAr: 'الأفعال المُلتبسة — make/do و say/tell وأخواتها',
    objectives: [
      { en: 'Choose make vs do correctly', ar: 'التمييز بين make و do' },
      { en: 'Choose say vs tell correctly', ar: 'التمييز بين say و tell' },
      { en: 'Fix teach/learn and bring/take', ar: 'إصلاح teach/learn و bring/take' },
      { en: 'Use watch / look / see precisely', ar: 'استخدام watch/look/see بدقة' },
    ],
    rule: {
      en: '*make* = create/produce (make a cake, a decision) · *do* = work & tasks (do homework, the dishes). *tell* + person (tell ME) · *say* + words (say something).',
      ar: 'make للإنشاء والصنع، و do للأعمال والمهام. tell يليه شخص، و say يليه الكلام.',
    },
    explain: {
      intro: 'Arabic uses one verb (قال / عمل) where English splits into two. These pairs are small words that instantly reveal a learner — master them and your English sounds native-clean.',
      introAr: 'العربية تستخدم فعلًا واحدًا حيث تنقسم الإنجليزية إلى فعلين. هذه الأزواج كلمات صغيرة تفضح المتعلم فورًا — أتقنها تَصْفُ لغتك.',
      points: [
        { en: '*make*: a cake, tea, a decision, a mistake, money, noise', ar: 'make: صنع وإنتاج' },
        { en: '*do*: homework, the dishes, a job, your best, exercise', ar: 'do: مهام وأعمال' },
        { en: '*tell* + person: tell *me* the truth · *say* + words: say *hello*', ar: 'tell لشخص · say لكلام' },
        { en: '*teach* = give knowledge · *learn* = receive it', ar: 'teach يعلّم · learn يتعلّم' },
      ],
    },
    examples: [
      { en: 'My mother *makes* the best couscous.', ar: 'تصنع أمي أفضل كسكس.', why: '*make* = create or produce something that did not exist before.', whyAr: 'make تعني الصنع أو الإنتاج.' },
      { en: 'I *made* a big mistake.', ar: 'ارتكبت خطأً كبيرًا.', why: '*make a mistake* — fixed collocation. Never *do a mistake*.', whyAr: 'make a mistake تلازم ثابت، ولا يصحّ do.' },
      { en: 'We need to *make* a decision today.', ar: 'علينا اتخاذ قرار اليوم.', why: '*make a decision* — also fixed. These pairings are habit, not logic.', whyAr: 'make a decision تلازم ثابت أيضًا؛ عادة لا منطق.' },
      { en: 'I *do* my homework after dinner.', ar: 'أنجز واجبي بعد العشاء.', why: '*do* = perform a task or duty, especially routine work.', whyAr: 'do تعني أداء مهمّة أو واجب.' },
      { en: 'He *does* the dishes every night.', ar: 'يغسل الأطباق كل ليلة.', why: '*do the dishes* — housework almost always takes *do*.', whyAr: 'أعمال البيت تأخذ do غالبًا.' },
      { en: '*Do* your best in the exam.', ar: 'ابذل قصارى جهدك.', why: '*do your best* — another fixed phrase worth memorising whole.', whyAr: 'do your best عبارة ثابتة تُحفظ كاملة.' },
      { en: 'She *said* something important.', ar: 'قالت شيئًا مهمًا.', why: '*say* focuses on the WORDS, and needs no listener after it.', whyAr: 'say تركّز على الكلام ولا تحتاج مستمعًا بعدها.' },
      { en: 'She *told me* a secret.', ar: 'أخبرتني سرًا.', why: '*tell* needs a PERSON straight after it: tell *me*, tell *him*.', whyAr: 'tell تحتاج شخصًا بعدها مباشرة.' },
      { en: 'My grandfather *taught* me patience; I *learned* it slowly.', ar: 'علّمني جدي الصبر فتعلّمته ببطء.', why: '*teach* = give knowledge · *learn* = receive it. Arabic uses one root for both.', whyAr: 'teach يعطي و learn يتلقّى، والعربية تستعمل جذرًا واحدًا.' },
      { en: '*Bring* your book here · *take* this to your room.', ar: 'أحضِر إلى هنا · خُذ إلى هناك.', why: '*bring* = towards the speaker · *take* = away from the speaker.', whyAr: 'bring نحو المتكلّم و take بعيدًا عنه.' },
      { en: 'I *watched* a film · *look* at this photo · I *saw* him yesterday.', ar: 'شاهدت · انظر · رأيت.', why: '*watch* = follow over time · *look at* = direct your eyes · *see* = simply perceive.', whyAr: 'watch متابعة و look at توجيه النظر و see مجرّد إبصار.' },
    ],
    exercises: [
      { q: 'make/do: “I have to ___ my homework and then ___ dinner.”', a: '*do* my homework · *make* dinner.' },
      { q: 'say/tell: “He ___ me that he was tired.”', a: 'He *told* me that he was tired.' },
      { q: 'say/tell: “She ___ goodbye and left.”', a: 'She *said* goodbye and left.' },
      { q: 'Fix: “The teacher learned us a new rule.”', a: 'The teacher *taught* us a new rule.' },
      { q: 'Fix: “I maked a mistake in the exam.”', a: 'I *made* a mistake in the exam.' },
      { q: 'bring/take: “___ me a glass of water, please.”', a: '*Bring* me a glass of water, please.' },
    ],
    reading: {
      title: 'First Day at Work', titleAr: 'أول يوم في العمل',
      passage: [
        'On my first day, my manager *told* me three things I never forgot.',
        '“*Do* your work with care, even when nobody *is watching*.”',
        '“When you *make* a mistake, *say* it clearly — hiding it *makes* it bigger.”',
        '“And every day, *learn* one thing, then *teach* it to someone else.”',
        'Years later, I *tell* every new colleague the same three rules.',
      ],
      tip: 'told me / say it / do your work / make a mistake / learn then teach — every pair used precisely.',
      tipAr: 'كل زوج مستخدم في موضعه الدقيق.',
    },
    homework: [
      { en: 'Write 4 make sentences and 4 do sentences', ar: 'اكتب ٤ جمل بـ make و٤ بـ do' },
      { en: 'Write a mini-dialogue using said and told correctly', ar: 'اكتب حوارًا قصيرًا بـ said و told' },
      { en: 'Write 2 sentences each: teach/learn, bring/take', ar: 'اكتب جملتين لكل زوج' },
    ],
    editing: {
      wrong: [
        'Yesterday I did a cake and my sister made her homework.',
        'He said me that the meeting was cancelled.',
        'My father learned me how to swim.',
      ],
      correct: [
        'Yesterday I *made* a cake and my sister *did* her homework.',
        'He *told* me that the meeting was cancelled.',
        'My father *taught* me how to swim.',
      ],
    },
  },

  /* ─────────────────────────── 16.2 · FIRST CONDITIONAL (B1) ─────────────────────────── */
  {
    no: 16.2, cefr: 'B1', tag: 'If sentences', tagAr: 'الجمل الشرطية',
    title: 'The First Conditional — If you practice, you will improve',
    titleAr: 'الشرط الأول — إذا تمرّنت فستتحسّن',
    objectives: [
      { en: 'Form: If + present, will + base', ar: 'التكوين: If + مضارع، will + مجرّد' },
      { en: 'Never put will inside the if-part', ar: 'لا will داخل جملة الشرط' },
      { en: 'Use the comma when “if” comes first', ar: 'الفاصلة حين تتقدّم if' },
      { en: 'Use it in professional promises', ar: 'استخدامه في الوعود المهنية' },
    ],
    rule: {
      en: 'Real future condition = *If + present simple*, *will + base verb*: “If you practice daily, you *will* improve.” The if-part stays in the PRESENT even though the meaning is future.',
      ar: 'الشرط الواقعي: If + مضارع بسيط، ثم will + الفعل المجرّد. جملة الشرط تبقى مضارعًا رغم أن معناها مستقبل.',
    },
    explain: {
      intro: 'This is the grammar of promises, plans, and warnings — and of professional emails: “If you need anything, I will send it immediately.”',
      introAr: 'هذه قواعد الوعود والخطط والتحذيرات — وقواعد الإيميلات المهنية: «إن احتجت شيئًا فسأرسله فورًا».',
      points: [
        { en: 'If + *present*: If it *rains*… (NOT will rain)', ar: 'الشرط مضارع' },
        { en: 'Result + *will*: …we *will stay* home.', ar: 'الجواب بـ will' },
        { en: 'If first → comma · result first → no comma', ar: 'الفاصلة مع تقدّم if' },
        { en: '*unless* = if not: Unless you hurry, you’ll be late.', ar: 'unless = إن لم' },
      ],
    },
    form: {
      affirmative: [
        '*If* you study, you *will pass*.',
        'You *will pass* if you study. (no comma)',
      ],
      negative: [
        'If you *don’t* leave now, you *won’t* catch the bus.',
        '*Unless* you leave now, you won’t catch the bus.',
      ],
      question: [
        '*What will* you do *if* it rains?',
        '*If* he calls, *will* you answer?',
      ],
      note: 'NEVER “If I will see him” ✗ — the if-clause refuses will: “If I *see* him, I *will* tell him.”',
      noteAr: 'لا نقول أبدًا If I will see — جملة الشرط ترفض will.',
    },
    examples: [
      { en: '*If* you practice daily, you *will improve* fast.', ar: 'إن تمرّنت يوميًا تحسّنت بسرعة.', why: '*if* + PRESENT → *will* + bare. The if-clause never takes *will*.', whyAr: 'if + مضارع ← will + مجرّد، وجملة الشرط لا تأخذ will أبدًا.' },
      { en: '*If* it rains tomorrow, we *will stay* home.', ar: 'إن أمطرت غدًا بقينا في البيت.', why: 'Still present after *if*, even though the meaning is entirely future.', whyAr: 'يبقى المضارع بعد if وإن كان المعنى مستقبلًا خالصًا.' },
      { en: 'You *will pass* the exam *if* you review tonight.', ar: 'ستنجح إن راجعت الليلة.', why: 'Result first → NO comma. The comma depends on order, exactly as in lesson 34.', whyAr: 'النتيجة أولًا فلا فاصلة؛ الفاصلة تتبع الترتيب.' },
      { en: '*If* she calls, I *will tell* her the news.', ar: 'إن اتصلت أخبرتها.', why: '*calls* is present because it follows *if* — this is the commonest slip.', whyAr: 'calls مضارع لأنها بعد if، وهذا أشيع الأخطاء.' },
      { en: '*If* you don’t sleep early, you *will feel* tired.', ar: 'إن لم تنم مبكرًا شعرت بالتعب.', why: 'Negative condition: *don’t* stays in the present too.', whyAr: 'الشرط المنفي يبقى في المضارع أيضًا.' },
      { en: '*Unless* we leave now, we *will miss* the train.', ar: 'ما لم نغادر الآن فاتنا القطار.', why: '*Unless* means *if not*, so the verb after it is already positive.', whyAr: 'unless تعني «إن لم» فالفعل بعدها مثبت.' },
      { en: 'Professional: *If* you need more information, I *will send* the full report.', ar: 'مهني: إن احتجتم معلومات أرسلت التقرير كاملًا.', why: 'The professional use: a condition plus a promise, which is what emails run on.', whyAr: 'الاستعمال المهني: شرط ووعد، وعليهما تقوم الإيميلات.' },
      { en: 'Professional: *If* the product is damaged, we *will refund* you fully.', ar: 'مهني: إن كان المنتج تالفًا رددنا المبلغ كاملًا.', why: 'A conditional promise reassures the reader without over-committing.', whyAr: 'الوعد المشروط يطمئن القارئ دون التزام مفرط.' },
      { en: '*What will* you do *if* you win?', ar: 'ماذا ستفعل إن فزت؟', why: 'A question can hold the condition too — the if-clause still stays present.', whyAr: 'السؤال قد يحمل الشرط، وتبقى جملة الشرط في المضارع.' },
    ],
    exercises: [
      { q: 'Form: “If you ___ (study), you ___ (pass).”', a: 'If you *study*, you *will pass*.' },
      { q: 'Fix: “If I will see him, I will tell him.”', a: 'If I *see* him, I will tell him.' },
      { q: 'Comma? “We will go out if the weather is nice.”', a: 'Correct — no comma (result first).' },
      { q: 'unless: “If you don’t hurry, you’ll be late.” →', a: '*Unless* you hurry, you’ll be late.' },
      { q: 'Professional: complete “If you have any questions, …”', a: '…I *will be* happy to help. / …please *contact* me.' },
    ],
    reading: {
      title: 'The Deal with Myself', titleAr: 'اتفاقي مع نفسي',
      passage: [
        'Every January, people make big promises; I make one small deal instead.',
        '*If* I write for ten minutes every morning, I *will allow* myself my favorite coffee.',
        '*If* I skip a day, I *will* simply *start* again tomorrow — without drama.',
        '*Unless* a habit is easy, it *will not survive* the difficult weeks.',
        'Small deals, honestly kept, *will change* your year more than big promises ever will.',
      ],
      tip: 'Every condition: if + present → will + base. Notice “unless” = if not.',
      tipAr: 'كل شرط: if + مضارع ← will + مجرّد. و unless تعني «إن لم».',
    },
    homework: [
      { en: 'Write 4 if-sentences about your goals', ar: 'اكتب ٤ جمل شرطية عن أهدافك' },
      { en: 'Write 2 professional if-promises for an email', ar: 'اكتب وعدين مهنيين لإيميل' },
      { en: 'Rewrite 2 of your sentences with unless', ar: 'أعد صياغة جملتين بـ unless' },
    ],
    editing: {
      wrong: [
        'If it will rain tomorrow, the match will cancelled.',
        'If you don’t study you fail the exam.',
        'Unless you don’t hurry, we will be late.',
      ],
      correct: [
        'If it *rains* tomorrow, the match *will be cancelled*.',
        'If you don’t study*,* you *will fail* the exam.',
        '*Unless you hurry*, we will be late.',
      ],
    },
  },

  /* ═══════════════════ UNIT 9 · ADVANCED GRAMMAR (B2) ═══════════════════ */

  /* ─────────────────────────── 30 · PERFECT MODALS ─────────────────────────── */
  {
    no: 30, cefr: 'B2', tag: 'Perfect modals', tagAr: 'الأفعال الناقصة في الماضي',
    title: 'Perfect Modals — should have, must have, could have',
    titleAr: 'must have / should have / could have — الحكم على الماضي',
    objectives: [
      { en: 'Judge a past action: regret, deduction, possibility', ar: 'الحكم على فعل ماضٍ: ندم أو استنتاج أو احتمال' },
      { en: 'Build modal + *have* + past participle', ar: 'التكوين: فعل ناقص + have + التصريف الثالث' },
      { en: 'Tell *must have* from *should have* from *could have*', ar: 'التمييز بين الثلاثة' },
      { en: 'Write regret and criticism politely', ar: 'كتابة الندم والنقد بأدب' },
    ],
    rule: {
      en: 'One shape for all of them: *modal + have + past participle*. The modal chooses the meaning — *should have* = regret or criticism · *must have* = a confident guess · *could/might have* = a possible guess · *can’t have* = a confident denial.',
      ar: 'قالب واحد للجميع: فعل ناقص + have + التصريف الثالث. والفعل الناقص هو الذي يحدّد المعنى: should have ندم أو نقد · must have استنتاج واثق · could/might have احتمال · can’t have نفي واثق.',
    },
    explain: {
      intro: 'This is the structure that lets you talk *about* the past instead of just reporting it. B1 says “I did not study and I failed.” B2 says “I *should have studied*” — same facts, but now there is a judgement in the sentence, and that judgement is what makes writing sound adult.',
      introAr: 'هذا هو التركيب الذي يتيح لك أن تتحدّث *عن* الماضي لا أن تسرده فقط. المستوى B1 يقول: «لم أذاكر فرسبت»، أما B2 فيقول: «كان ينبغي أن أذاكر» — الحقائق نفسها، لكن ظهر حكم داخل الجملة، وهذا الحكم هو ما يجعل الكتابة ناضجة.',
      points: [
        { en: '*should have* + V3 = it did not happen, and that was a mistake', ar: 'should have = لم يحدث، وكان ذلك خطأ' },
        { en: '*must have* + V3 = I am almost certain it happened', ar: 'must have = شبه متأكد أنه حدث' },
        { en: '*can’t have* + V3 = I am almost certain it did NOT happen', ar: 'can’t have = شبه متأكد أنه لم يحدث' },
        { en: '*could / might have* + V3 = maybe it happened — I am not sure', ar: 'could/might have = ربما حدث' },
        { en: '*needn’t have* + V3 = you did it, but it was unnecessary', ar: 'needn’t have = فعلته دون حاجة' },
        { en: 'In speech it shrinks to “should’ve” — but NEVER write “should of” ✗', ar: 'في الكلام تُختصر، لكن لا تكتب أبدًا should of' },
      ],
    },
    form: {
      affirmative: [
        'You *should have called* me yesterday.',
        'She *must have forgotten* the meeting.',
        'They *might have missed* the train.',
      ],
      negative: [
        'You *shouldn’t have said* that.',
        'He *can’t have finished* already.',
        'We *needn’t have hurried*.',
      ],
      question: [
        '*Should* I *have told* him the truth?',
        '*Could* she *have known* about it?',
        '*What should* I *have done* differently?',
      ],
      note: 'The verb after *have* never changes: always the past participle (V3). “must have *went*” ✗ → “must have *gone*” ✓.',
      noteAr: 'ما بعد have لا يتغيّر أبدًا: التصريف الثالث دائمًا.',
    },
    irregulars: 'pp',
    examples: [
      { en: 'I *should have studied* harder — the exam was difficult.', ar: 'كان ينبغي أن أذاكر أكثر.', why: '*should have* + V3 = it did NOT happen, and that was a mistake. Pure regret.', whyAr: 'should have = لم يحدث وكان ذلك خطأ؛ ندم خالص.' },
      { en: 'You *shouldn’t have paid* so much for that phone.', ar: 'ما كان ينبغي أن تدفع كل هذا.', why: 'Criticism of someone else — the same form, aimed outward instead of inward.', whyAr: 'نقد للآخر بالصيغة نفسها موجّهًا للخارج لا للداخل.' },
      { en: 'The lights are off; they *must have gone* out.', ar: 'الأنوار مطفأة، لا بدّ أنهم خرجوا.', why: '*must have* = a confident guess. The evidence (dark lights) is in the sentence.', whyAr: 'must have استنتاج واثق، والدليل داخل الجملة.' },
      { en: 'He *can’t have written* this alone — it is too long.', ar: 'يستحيل أنه كتبه وحده.', why: '*can’t have* = confident DENIAL — the mirror image of *must have*.', whyAr: 'can’t have نفي واثق، وهي مرآة must have.' },
      { en: 'She *might have left* her keys at the office.', ar: 'ربما تركت مفاتيحها في المكتب.', why: '*might have* leaves the door open — use it when you genuinely do not know.', whyAr: 'might have تُبقي الباب مفتوحًا حين لا تعرف حقًّا.' },
      { en: 'We *needn’t have booked* — the place was empty.', ar: 'لم نكن بحاجة إلى الحجز.', why: '*needn’t have* = you DID it, but it was unnecessary. Not the same as *didn’t need to*.', whyAr: 'needn’t have: فعلتَه بلا داعٍ، وتختلف عن didn’t need to.' },
      { en: 'Professional: The delay *must have been caused* by the weather.', ar: 'مهني: لا بدّ أن الطقس سبّب التأخير.', why: 'Professional register: the passive plus a modal keeps blame off any person.', whyAr: 'بصيغة مهنية: المجهول مع الفعل الناقص يُبعد اللوم عن الأشخاص.' },
      { en: 'Professional: We *should have informed* the client sooner.', ar: 'مهني: كان علينا إبلاغ العميل أبكر.', why: 'Admitting a fault with *should have* is how professionals apologise without grovelling.', whyAr: 'الاعتراف بـ should have اعتذارٌ مهني بلا تذلّل.' },
      { en: 'Softer criticism: *It might have been better to* wait.', ar: 'نقد ألطف: ربما كان الانتظار أفضل.', why: '*might have been* is the softest criticism English offers — almost a suggestion.', whyAr: 'might have been أخفّ نقد في الإنجليزية، وتكاد تكون اقتراحًا.' },
    ],
    exercises: [
      { q: 'Regret: “I didn’t save any money.” →', a: 'I *should have saved* some money.' },
      { q: 'Deduction: the ground is wet. →', a: 'It *must have rained*.' },
      { q: 'Denial: “He finished 500 pages in one hour.” →', a: 'He *can’t have finished* it that fast.' },
      { q: 'Fix: “You should of told me.”', a: 'You *should have* told me. — *of* is never a verb.' },
      { q: 'Possibility: she is late, and you are not sure why. →', a: 'She *might have missed* the bus.' },
      { q: 'Professional: soften “You forgot to attach the file.”', a: 'e.g. *The file might not have been attached.*' },
    ],
    reading: {
      title: 'The Letter He Never Sent', titleAr: 'الرسالة التي لم يرسلها',
      passage: [
        'My uncle kept a letter in his drawer for thirty years.',
        'He *should have posted* it the week he wrote it, and he knew that even then.',
        'Something in him decided the words *might have sounded* foolish, or that his friend *must have already forgotten* the argument.',
        'When we found the letter after he died, it was three lines long and perfectly kind.',
        'His friend *can’t have known* it existed; the two of them never spoke again.',
        'He *needn’t have worried* about the words at all — it was the silence that did the damage.',
      ],
      tip: 'Every judgement about the past uses the same shape: modal + have + V3. Only the modal changes.',
      tipAr: 'كل حكم على الماضي بالقالب نفسه: فعل ناقص + have + التصريف الثالث، ولا يتغيّر إلا الفعل الناقص.',
    },
    homework: [
      { en: 'Write 4 regrets about your own English learning', ar: 'اكتب ٤ جمل ندم عن تعلّمك للإنجليزية' },
      { en: 'Look at a photo and write 3 deductions about it', ar: 'انظر إلى صورة واكتب ٣ استنتاجات عنها' },
      { en: 'Write a polite professional line admitting a mistake', ar: 'اكتب جملة مهنية مهذّبة تعترف فيها بخطأ' },
    ],
    editing: {
      wrong: [
        'You should of call me before you come.',
        'He must forgot the meeting, he is not here.',
        'She can’t have went home, her car is outside.',
      ],
      correct: [
        'You *should have called* me before you came.',
        'He *must have forgotten* the meeting*;* he is not here.',
        'She can’t have *gone* home*;* her car is outside.',
      ],
    },
  },

  /* ─────────────────────────── 31 · CONDITIONALS 2 & 3 ─────────────────────────── */
  {
    no: 31, cefr: 'B2', tag: 'Conditionals 2 & 3', tagAr: 'الشرط الثاني والثالث',
    title: 'Second, Third & Mixed Conditionals',
    titleAr: 'الشرط الثاني والثالث والمختلط',
    objectives: [
      { en: 'Talk about unreal present and impossible past', ar: 'الحديث عن حاضر غير واقعي وماضٍ مستحيل' },
      { en: 'Build: *if + past* → *would* · *if + had* → *would have*', ar: 'التكوين للنوعين' },
      { en: 'Mix the two when the past still affects now', ar: 'المزج عندما يؤثّر الماضي في الحاضر' },
      { en: 'Write hypotheses and regrets in an essay', ar: 'كتابة الافتراض والندم في مقال' },
    ],
    rule: {
      en: 'Second: *If + past simple → would + base* — unreal NOW (If I *had* money, I *would travel*). Third: *If + had + V3 → would have + V3* — impossible PAST (If I *had studied*, I *would have passed*). Mixed: past condition, present result (If I *had studied* medicine, I *would be* a doctor now).',
      ar: 'الثاني: if + ماضٍ بسيط ← would + مجرّد، لحاضر غير واقعي. الثالث: if + had + التصريف الثالث ← would have + التصريف الثالث، لماضٍ مستحيل. والمختلط: شرط في الماضي ونتيجة في الحاضر.',
    },
    explain: {
      intro: 'The first conditional (lesson 35) is about the real future. These two are about worlds that do *not* exist: one you can imagine now, one that is closed for ever. Arabic marks this with «لو» rather than «إن», and English marks it by *moving the tense one step back* — which is why the grammar looks past even when the meaning is not.',
      introAr: 'الشرط الأول يتحدّث عن مستقبل ممكن، أما هذان فعن عوالم غير موجودة: أحدها تتخيّله الآن، والآخر أُغلق إلى الأبد. العربية تميّزها بـ«لو» بدل «إن»، والإنجليزية تميّزها بإرجاع الزمن خطوة للوراء — ولهذا تبدو القواعد ماضية والمعنى ليس كذلك.',
      points: [
        { en: '2nd = unreal now or unlikely future: *If I won the lottery, I would…*', ar: 'الثاني: حاضر غير واقعي أو مستقبل بعيد الاحتمال' },
        { en: '3rd = the past cannot change: *If I had known, I would have come.*', ar: 'الثالث: ماضٍ لا يمكن تغييره' },
        { en: 'Mixed = past cause, present effect: *If I had saved, I would be free now.*', ar: 'المختلط: سبب ماضٍ ونتيجة حاضرة' },
        { en: 'Formal English prefers *If I *were** — not “was” — in the 2nd', ar: 'الإنجليزية الرسمية تفضّل were لا was في الشرط الثاني' },
        { en: 'The *if*-clause NEVER takes *would*: “If I would have…” ✗', ar: 'جملة الشرط لا تأخذ would أبدًا' },
        { en: 'If first → comma. Result first → no comma.', ar: 'إن تقدّمت if فالفاصلة، وإن تأخّرت فلا' },
      ],
    },
    form: {
      affirmative: [
        '2nd: If I *had* time, I *would learn* Spanish.',
        '3rd: If she *had left* earlier, she *would have caught* it.',
        'Mixed: If he *had studied*, he *would have* a job now.',
      ],
      negative: [
        '2nd: If I *didn’t work* nights, I *wouldn’t be* so tired.',
        '3rd: If they *hadn’t helped*, we *wouldn’t have finished*.',
        'Mixed: If I *hadn’t moved*, I *wouldn’t know* you.',
      ],
      question: [
        '*What would* you *do* if you *lost* your job?',
        '*Would* you *have said* yes if he *had asked*?',
        '*Where would* you *be* now if you *had stayed*?',
      ],
      note: 'Swap *would* for *could* or *might* to soften the result: “I *might have passed*.” Certainty is a choice.',
      noteAr: 'استبدل would بـ could أو might لتخفيف النتيجة — درجة اليقين اختيارك.',
    },
    examples: [
      { en: '*If I had* more time, I *would read* every evening.', ar: 'لو كان لديّ وقت أكثر لقرأت كل مساء.', why: 'Second conditional: *if* + past → *would*. The past tense signals UNREAL, not past time.', whyAr: 'الشرط الثاني: الماضي هنا علامة على اللاواقع لا على الزمن الماضي.' },
      { en: '*If I were* you, I *would take* the job.', ar: 'لو كنت مكانك لقبلت الوظيفة.', why: '*If I were* — formal English keeps *were* for every person, including *I*.', whyAr: 'الإنجليزية الرسمية تُبقي were لكل الضمائر حتى I.' },
      { en: '*If she had studied*, she *would have passed* easily.', ar: 'لو ذاكرت لنجحت بسهولة.', why: 'Third conditional: *had* + V3 → *would have* + V3. The past cannot be changed.', whyAr: 'الشرط الثالث: ماضٍ لا يمكن تغييره.' },
      { en: '*If we hadn’t missed* the flight, we *would be* in Dubai now.', ar: 'لولا أننا فوّتنا الرحلة لكنّا في دبي الآن.', why: 'MIXED: the condition is past (*hadn’t missed*) but the result is now (*would be*).', whyAr: 'مختلط: الشرط ماضٍ والنتيجة في الحاضر.' },
      { en: 'I *would have called* you *if I had known* you were ill.', ar: 'كنت سأتصل لو علمت أنك مريض.', why: 'Result first, so no comma — and the if-clause still takes *had*, never *would*.', whyAr: 'النتيجة أولًا فلا فاصلة، وجملة الشرط تأخذ had لا would.' },
      { en: '*If English weren’t* useful, nobody *would study* it.', ar: 'لو لم تكن الإنجليزية مفيدة ما درسها أحد.', why: '*weren’t* keeps the formal subjunctive even in the negative.', whyAr: 'weren’t تحافظ على الصيغة الرسمية حتى في النفي.' },
      { en: 'Essay: *If governments invested* more in schools, literacy *would rise*.', ar: 'مقال: لو استثمرت الحكومات أكثر لارتفع التعليم.', why: 'Essay use: the second conditional argues about a policy that does NOT exist yet.', whyAr: 'في المقال: الشرط الثاني يُحاجّ عن سياسة غير قائمة.' },
      { en: 'Essay: *Had the policy been introduced* earlier, the crisis *would have been* smaller.', ar: 'مقال: لو طُبّقت السياسة أبكر لكانت الأزمة أصغر.', why: '*Had the policy been introduced* — inversion replaces *if* in formal writing.', whyAr: 'التقديم يحلّ محلّ if في الكتابة الرسمية.' },
      { en: 'Softer: *If I had been* in charge, things *might have been* different.', ar: 'أخف: ربما كانت الأمور مختلفة.', why: '*might have been* softens the claim — you are speculating, not asserting.', whyAr: 'might have been تخفّف الادّعاء؛ أنت تفترض لا تجزم.' },
    ],
    exercises: [
      { q: 'Unreal now: “I don’t have a car, so I take the bus.” →', a: '*If I had* a car, I *wouldn’t take* the bus.' },
      { q: 'Impossible past: “She didn’t apply, so she didn’t get it.” →', a: '*If she had applied*, she *would have got* it.' },
      { q: 'Mixed: “I didn’t learn to drive, so I can’t drive now.” →', a: '*If I had learned* to drive, I *could drive* now.' },
      { q: 'Fix: “If I would have known, I would have told you.”', a: 'If I *had known*, I would have told you.' },
      { q: 'Formal: rewrite “If I was rich…”', a: '*If I were* rich… — formal English keeps *were*.' },
      { q: 'Essay opener: hypothesise about more reading in schools.', a: 'e.g. *If children read for pleasure daily, their writing would improve markedly.*' },
    ],
    reading: {
      title: 'The Road Not Taken', titleAr: 'الطريق الذي لم يُسلك',
      passage: [
        'My mother was offered a place at a university in another city when she was nineteen, and she turned it down.',
        '*If she had gone*, she says, she *would have become* a teacher of literature.',
        'She would also, she adds without any drama, never *have met* my father — so I *would not be* sitting here asking her about it.',
        '*If I were* braver, I might have asked whether she regrets it.',
        'Instead I watched her fold the question away with the tea towel, the way she folds most questions.',
        'Some doors you do not open twice, and *if you had*, you would be a stranger to yourself.',
      ],
      tip: 'Notice the mixed conditional: a decision in the past (had gone) with a result in the present (would not be sitting).',
      tipAr: 'لاحظ الشرط المختلط: قرار في الماضي ونتيجة في الحاضر.',
    },
    homework: [
      { en: 'Write 3 second conditionals about your ideal life', ar: 'اكتب ٣ جمل شرط ثانٍ عن حياتك المثالية' },
      { en: 'Write 3 third conditionals about last year', ar: 'اكتب ٣ جمل شرط ثالث عن العام الماضي' },
      { en: 'Write 2 mixed conditionals about a past choice', ar: 'اكتب جملتين مختلطتين عن قرار ماضٍ' },
    ],
    editing: {
      wrong: [
        'If I would have money, I will buy a house.',
        'If she studied harder, she would have passed the exam last year.',
        'If I was you I don’t accept this offer.',
      ],
      correct: [
        'If I *had* money, I *would* buy a house.',
        'If she *had studied* harder, she would have passed the exam last year.',
        'If I *were* you*,* I *wouldn’t accept* this offer.',
      ],
    },
  },

  /* ─────────────────────────── 32 · WISH & IF ONLY ─────────────────────────── */
  {
    no: 32, cefr: 'B2', tag: 'Wish & regret', tagAr: 'التمنّي والندم',
    title: 'Wish & If Only — wanting a different reality',
    titleAr: 'wish و if only — تمنّي واقع آخر',
    objectives: [
      { en: 'Express regret about now and about the past', ar: 'التعبير عن الندم في الحاضر والماضي' },
      { en: 'Use *wish + past* and *wish + had + V3*', ar: 'استخدام الصيغتين' },
      { en: 'Use *wish + would* to complain about others', ar: 'استخدام wish + would للشكوى' },
      { en: 'Choose the emotional weight of *if only*', ar: 'اختيار الوزن العاطفي لـ if only' },
    ],
    rule: {
      en: 'Move the tense one step back. Unhappy about NOW → *I wish I had* more time. Unhappy about the PAST → *I wish I had studied*. Annoyed by someone’s habit → *I wish he would stop*. *If only* replaces *I wish* and makes it stronger.',
      ar: 'أرجِع الزمن خطوة. الاستياء من الحاضر: I wish I had. ومن الماضي: I wish I had studied. ومن عادة شخص: I wish he would stop. و if only بديل أقوى من I wish.',
    },
    explain: {
      intro: 'Learners hear “wish” and reach for the future, because in Arabic «أتمنّى» points forward. In English it points at the *gap between reality and what you wanted* — which is why the grammar is backwards-looking. Getting this right is the difference between sounding hopeful and sounding regretful, and they are not the same sentence.',
      introAr: 'يظن المتعلّم أن wish للمستقبل لأن «أتمنّى» في العربية تتّجه إلى الأمام، لكنها في الإنجليزية تشير إلى الفجوة بين الواقع وما كنت تريده — ولهذا تعود القواعد إلى الوراء. وإتقان هذا هو الفرق بين نبرة الأمل ونبرة الندم، وهما جملتان مختلفتان.',
      points: [
        { en: 'Now: *I wish I knew* the answer. (I do not know it)', ar: 'الحاضر: أتمنّى لو أعرف — وأنا لا أعرف' },
        { en: 'Past: *I wish I had known*. (I did not know)', ar: 'الماضي: ليتني عرفت — ولم أعرف' },
        { en: 'Others’ habits: *I wish you would listen.* (annoyance)', ar: 'عادات الآخرين: انزعاج' },
        { en: '*I wish I were* — formal English keeps *were* for all persons', ar: 'الإنجليزية الرسمية تستعمل were لكل الضمائر' },
        { en: '*If only* = the same grammar, more feeling: *If only I had listened!*', ar: 'if only بالقواعد نفسها لكن بمشاعر أقوى' },
        { en: 'Never *wish + would* about yourself: “I wish I would…” ✗', ar: 'لا تستعمل wish + would عن نفسك' },
      ],
    },
    form: {
      affirmative: [
        '*I wish I had* a bigger flat.',
        '*I wish I had taken* that job.',
        '*If only she were* here.',
      ],
      negative: [
        '*I wish I didn’t have* to work Sundays.',
        '*I wish I hadn’t said* that.',
        '*If only it weren’t* so far.',
      ],
      question: [
        '*Do you ever wish* you *had studied* something else?',
        '*What do you wish* you *knew* at eighteen?',
        '*Don’t you wish* they *would* answer?',
      ],
      note: 'The verb after *wish* is one tense back from reality. Reality present → wish past. Reality past → wish past perfect.',
      noteAr: 'الفعل بعد wish يتأخّر زمنًا واحدًا عن الواقع.',
    },
    examples: [
      { en: '*I wish I spoke* French — the interview was in French.', ar: 'ليتني أتحدّث الفرنسية.', why: '*wish* + PAST for a present regret. The tense steps back, the meaning does not.', whyAr: 'wish + ماضٍ لندم حاضر؛ يرجع الزمن ولا يرجع المعنى.' },
      { en: '*I wish I had applied* before the deadline.', ar: 'ليتني قدّمت قبل الموعد.', why: '*wish* + *had* + V3 for a PAST regret — one step further back again.', whyAr: 'wish + had + التصريف الثالث لندم ماضٍ: خطوة أخرى للوراء.' },
      { en: '*I wish my neighbour would* turn the music down.', ar: 'ليت جاري يخفض الموسيقى.', why: '*wish* + *would* complains about SOMEONE ELSE’s habit — never about yourself.', whyAr: 'wish + would للشكوى من عادة غيرك لا من نفسك.' },
      { en: '*If only I had listened* to my teacher.', ar: 'ليتني أصغيت لأستاذي.', why: '*If only* is the same grammar with more feeling — reserve it for real regret.', whyAr: 'If only بالقواعد نفسها وبمشاعر أقوى، فاحفظها للندم الحقيقي.' },
      { en: '*I wish I weren’t* so shy in meetings.', ar: 'ليتني لست خجولًا في الاجتماعات.', why: '*weren’t* again — formal English does not use *wasn’t* after *wish*.', whyAr: 'الإنجليزية الرسمية لا تستعمل wasn’t بعد wish.' },
      { en: '*I wish I hadn’t spent* so much last month.', ar: 'ليتني لم أنفق كثيرًا الشهر الماضي.', why: '*hadn’t spent* regrets an action you DID take. The past perfect marks it.', whyAr: 'hadn’t spent ندم على فعل وقع، والماضي التام يُعلّمه.' },
      { en: 'Professional: *We wish we had been informed* earlier.', ar: 'مهني: كنّا نتمنّى لو أُبلغنا أبكر.', why: 'The professional version — regret expressed without blaming anyone by name.', whyAr: 'الصيغة المهنية: ندم بلا لوم أحد بالاسم.' },
      { en: 'Compare: *I hope he comes* (possible) · *I wish he were here* (he is not).', ar: 'قارن: hope للممكن و wish لغير الواقع.', why: 'THE distinction: *hope* is for what is still possible, *wish* for what is not.', whyAr: 'الفرق الجوهري: hope للممكن و wish لغير الواقع.' },
    ],
    exercises: [
      { q: 'Reality: “I don’t have a car.” → wish', a: '*I wish I had* a car.' },
      { q: 'Reality: “I didn’t study medicine.” → wish', a: '*I wish I had studied* medicine.' },
      { q: 'Complaint: your colleague is always late. →', a: '*I wish he would* arrive on time.' },
      { q: 'Fix: “I wish I would be taller.”', a: '*I wish I were* taller. — never *wish + would* about yourself.' },
      { q: 'Make it stronger: “I wish I had saved money.”', a: '*If only* I had saved money*!*' },
      { q: 'hope or wish? “___ you have a great trip.”', a: '*I hope* — the trip is still possible.' },
    ],
    reading: {
      title: 'Things I Wish Someone Had Told Me', titleAr: 'أشياء ليت أحدًا أخبرني بها',
      passage: [
        'At twenty I believed that fluency arrived one morning like the post.',
        '*I wish someone had told me* that it arrives instead in small, boring instalments, most of them on days you do not feel clever.',
        '*I wish I had kept* a notebook from the beginning, and *if only I had spoken* more and worried less.',
        'These days I still catch myself thinking *I wish I were* the kind of person who never makes mistakes in English.',
        'Then I remember that the people I admire most make them constantly, cheerfully, in public.',
        'That is probably the only thing I would go back and say.',
      ],
      tip: 'Regret about now → wish + past. Regret about the past → wish + had + V3. Count them in the passage.',
      tipAr: 'ندم الحاضر: wish + ماضٍ. وندم الماضي: wish + had + التصريف الثالث. عُدّها في النص.',
    },
    homework: [
      { en: 'Write 3 wishes about your life now', ar: 'اكتب ٣ أمنيات عن حياتك الآن' },
      { en: 'Write 3 regrets about the past with *if only*', ar: 'اكتب ٣ جمل ندم بـ if only' },
      { en: 'Write 2 polite complaints with *wish + would*', ar: 'اكتب شكويين مهذّبتين بـ wish + would' },
    ],
    editing: {
      wrong: [
        'I wish I will have more free time next year.',
        'I wish I didn’t forget her birthday last week.',
        'If only I would listen to my father then.',
      ],
      correct: [
        'I wish I *had* more free time. / I *hope* I have more free time next year.',
        'I wish I *hadn’t forgotten* her birthday last week.',
        'If only I *had listened* to my father then.',
      ],
    },
  },

  /* ─────────────────────────── 33 · REPORTED SPEECH ─────────────────────────── */
  {
    no: 33, cefr: 'B2', tag: 'Reported speech', tagAr: 'الكلام المنقول',
    title: 'Reported Speech — saying what others said',
    titleAr: 'الكلام المنقول — نقل كلام الآخرين',
    objectives: [
      { en: 'Shift tense, pronoun and time word one step back', ar: 'إرجاع الزمن والضمير وكلمة الزمن خطوة' },
      { en: 'Report statements, questions and orders', ar: 'نقل الخبر والسؤال والأمر' },
      { en: 'Choose a reporting verb that carries meaning', ar: 'اختيار فعل ناقل يحمل معنى' },
      { en: 'Quote a source correctly in an essay or email', ar: 'الاقتباس بدقّة في مقال أو إيميل' },
    ],
    rule: {
      en: 'Move everything one step back: tense (*am* → *was*), pronoun (*I* → *he*), time (*today* → *that day*), place (*here* → *there*). Questions lose the question order: “Where do you live?” → He asked *where I lived* — no *do*, no question mark.',
      ar: 'أرجِع كل شيء خطوة: الزمن والضمير وكلمة الزمن والمكان. والسؤال المنقول يفقد ترتيب السؤال: بلا do وبلا علامة استفهام.',
    },
    explain: {
      intro: 'Reported speech is not decoration — it is how you bring *evidence* into writing. An essay that says “Experts say obesity is rising” is weak; one that reports precisely who claimed what, and how strongly, is persuasive. The tense shift is mechanical; the *reporting verb* is where the skill lives.',
      introAr: 'الكلام المنقول ليس زينة، بل هو كيف تُدخل *الدليل* إلى كتابتك. المقال الذي يقول «يقول الخبراء» ضعيف، والذي ينقل بدقّة من ادّعى وماذا وبأي قوّة مقنعٌ. إرجاع الزمن آليّ، أما المهارة فتكمن في اختيار الفعل الناقل.',
      points: [
        { en: 'present → past · past → past perfect · *will* → *would* · *can* → *could*', ar: 'المضارع ← ماضٍ · الماضي ← ماضٍ تام · will ← would' },
        { en: 'time words shift: *tomorrow* → *the next day* · *yesterday* → *the day before*', ar: 'كلمات الزمن تتغيّر أيضًا' },
        { en: 'Reported questions use *statement* order: …asked where I *lived* ✓', ar: 'السؤال المنقول بترتيب الجملة الخبرية' },
        { en: 'Yes/No questions take *if* or *whether*: asked *whether* I had finished', ar: 'أسئلة نعم/لا تأخذ if أو whether' },
        { en: 'Orders become *tell + object + to*: told me *to wait*', ar: 'الأمر يصبح tell + مفعول + to' },
        { en: 'No shift needed for a permanent truth: he said water *boils* at 100°C', ar: 'الحقيقة الثابتة لا تتغيّر' },
      ],
    },
    form: {
      affirmative: [
        '“I *am* tired.” → He said he *was* tired.',
        '“I *finished*.” → She said she *had finished*.',
        '“I *will* call.” → He said he *would* call.',
      ],
      negative: [
        '“I *don’t* agree.” → She said she *didn’t* agree.',
        '“I *haven’t* seen it.” → He said he *hadn’t* seen it.',
        '“Don’t wait.” → She told us *not to wait*.',
      ],
      question: [
        '“Where *do you* live?” → He asked *where I lived*.',
        '“*Are you* ready?” → She asked *whether I was* ready.',
        '“*Did* you send it?” → He asked *if I had sent* it.',
      ],
      note: 'Strong reporting verbs carry the attitude for you: *admitted*, *claimed*, *insisted*, *denied*, *warned*, *suggested*. “Said” is the weakest one you own.',
      noteAr: 'الأفعال الناقلة القويّة تحمل الموقف نيابةً عنك، و said أضعفها.',
    },
    examples: [
      { en: '“I *work* here.” → She said she *worked* there.', ar: 'قالت إنها تعمل هناك.', why: 'Present → past. Every tense steps back one place when it is reported.', whyAr: 'المضارع يصير ماضيًا؛ كل زمن يرجع خطوة عند النقل.' },
      { en: '“We *are moving* tomorrow.” → They said they *were moving the next day*.', ar: 'قالوا إنهم سينتقلون في اليوم التالي.', why: 'Present continuous → past continuous, and *tomorrow* → *the next day*.', whyAr: 'المستمر يرجع كذلك، و tomorrow تصير the next day.' },
      { en: '“*Have* you finished?” → He asked *if I had finished*.', ar: 'سألني إن كنت انتهيت.', why: 'A yes/no question needs *if* or *whether*, and it loses its question mark.', whyAr: 'سؤال نعم/لا يأخذ if أو whether ويفقد علامة الاستفهام.' },
      { en: '“*Please* sit down.” → She asked me *to sit down*.', ar: 'طلبت مني الجلوس.', why: 'An order becomes *tell* / *ask* + object + *to* + verb.', whyAr: 'الأمر يصير tell أو ask + مفعول + to + فعل.' },
      { en: '“I didn’t take it.” → He *denied taking* it.', ar: 'أنكر أنه أخذها.', why: '*denied* carries the whole meaning — no *that he didn’t* is needed after it.', whyAr: 'denied تحمل المعنى كاملًا فلا حاجة إلى صيغة النفي بعدها.' },
      { en: '“You should rest.” → The doctor *advised me to rest*.', ar: 'نصحني الطبيب بالراحة.', why: '*advised* reports both the words AND the speaker’s intention in one verb.', whyAr: 'advised تنقل الكلام والقصد معًا في فعل واحد.' },
      { en: 'Essay: The report *claimed* that costs *had risen* sharply.', ar: 'مقال: ادّعى التقرير أن التكاليف ارتفعت بحدّة.', why: '*claimed* quietly signals that you do not endorse the statement.', whyAr: 'claimed تُشير ضمنًا إلى أنك لا تتبنّى الادّعاء.' },
      { en: 'Essay: Critics *warned* that the policy *would fail*.', ar: 'مقال: حذّر النقّاد من أن السياسة ستفشل.', why: '*warned* carries urgency — the reporting verb is doing your judging for you.', whyAr: 'warned تحمل التحذير؛ الفعل الناقل يحكم نيابةً عنك.' },
    ],
    exercises: [
      { q: 'Report: “I am studying English.” (she said)', a: 'She said she *was studying* English.' },
      { q: 'Report: “Where is the station?” (he asked)', a: 'He asked *where the station was*.' },
      { q: 'Report: “Don’t touch it.” (she told me)', a: 'She told me *not to touch* it.' },
      { q: 'Report with a strong verb: “It was my fault.” (he …)', a: 'He *admitted* that it *had been* his fault.' },
      { q: 'Fix: “She asked me where do I live.”', a: 'She asked me *where I lived*.' },
      { q: 'Report a yes/no question: “Do you speak Arabic?”', a: 'He asked *whether I spoke* Arabic.' },
    ],
    reading: {
      title: 'What the Neighbours Said', titleAr: 'ما قاله الجيران',
      passage: [
        'When the bakery closed, everyone on the street had a different account of it.',
        'The barber insisted that the owner *had been* ill for months; the woman at number nine claimed she *had seen* him leave with two suitcases.',
        'My mother, who dislikes gossip, said only that he *had always been* kind to her and that she *hoped* he *was* well.',
        'A month later a letter arrived at the shop asking whether anyone *wanted* to buy the ovens.',
        'It turned out he had simply retired and moved to his sister’s village.',
        'Nobody had thought to ask him, and everybody had thought to explain him.',
      ],
      tip: 'Notice how *insisted*, *claimed* and *said only* judge the speaker before you read the content.',
      tipAr: 'لاحظ كيف تحكم الأفعال الناقلة على المتكلّم قبل أن تقرأ المحتوى.',
    },
    homework: [
      { en: 'Report 5 things people said to you today', ar: 'انقل ٥ عبارات قيلت لك اليوم' },
      { en: 'Report 3 questions you were asked this week', ar: 'انقل ٣ أسئلة سُئلتها هذا الأسبوع' },
      { en: 'Rewrite 3 “said” sentences with stronger reporting verbs', ar: 'أعد كتابة ٣ جمل بأفعال ناقلة أقوى' },
    ],
    editing: {
      wrong: [
        'He said me that he is very tired yesterday.',
        'She asked me what time is the meeting?',
        'They told to us don’t be late.',
      ],
      correct: [
        'He *told* me that he *was* very tired *the day before*.',
        'She asked me *what time the meeting was.*',
        'They told *us not to be* late.',
      ],
    },
  },

  /* ─────────────────────────── 34 · ADVANCED PASSIVE ─────────────────────────── */
  {
    no: 34, cefr: 'B2', tag: 'Advanced passive', tagAr: 'المبني للمجهول المتقدّم',
    title: 'The Passive at B2 — impersonal report & causative',
    titleAr: 'المبني للمجهول المتقدّم — الصيغة التقريرية و have something done',
    objectives: [
      { en: 'Report claims impersonally: *It is said that…*', ar: 'نقل الادّعاءات بصيغة غير شخصية' },
      { en: 'Use *He is thought to be…* confidently', ar: 'استخدام الصيغة الثانية للتقرير' },
      { en: 'Use the causative: *have / get something done*', ar: 'استخدام صيغة التسبيب' },
      { en: 'Choose the passive for a reason, not by habit', ar: 'اختيار المبني للمجهول لغرض لا عادةً' },
    ],
    rule: {
      en: 'Two impersonal report shapes: *It is said that he is rich* and *He is said to be rich* — both hide who is claiming. Causative: *have something done* = you arrange it, someone else does it (I *had my car repaired*). *Get* is the informal twin.',
      ar: 'صيغتان للتقرير غير الشخصي: It is said that… و He is said to be… وكلتاهما تُخفيان القائل. وصيغة التسبيب: have something done أي أنك رتّبت الأمر وقام به غيرك، و get بديلها غير الرسمي.',
    },
    explain: {
      intro: 'At B1 the passive answers “who did it does not matter.” At B2 it does something sharper: it lets you report a claim *without owning it*, which is the backbone of academic and journalistic English. It also lets you say that something was done *for* you without pretending you did it yourself — a distinction Arabic makes with «جعل» and English makes with word order.',
      introAr: 'في B1 يقول المبني للمجهول: «الفاعل غير مهم». أما في B2 فيؤدّي دورًا أدقّ: ينقل ادّعاءً دون أن تتبنّاه، وهذا عمود الإنجليزية الأكاديمية والصحفية. كما يتيح لك القول إن شيئًا أُنجز لك دون ادّعاء أنك أنجزته بنفسك.',
      points: [
        { en: '*It is said / believed / reported that* + full clause', ar: 'الصيغة الأولى: It is said that + جملة كاملة' },
        { en: '*He is said / thought / known to* + base verb', ar: 'الصيغة الثانية: He is said to + مجرّد' },
        { en: 'For an earlier event: *is said to have been*', ar: 'لحدث أسبق: is said to have been' },
        { en: 'Causative: *have + object + V3* — I *had my hair cut*', ar: 'التسبيب: have + مفعول + التصريف الثالث' },
        { en: '*get something done* = the same, but informal', ar: 'get something done: المعنى نفسه بأسلوب غير رسمي' },
        { en: '*I cut my hair* = I did it myself. *I had my hair cut* = the barber did.', ar: 'الفرق بين أن تفعلها بنفسك وأن يفعلها غيرك لك' },
      ],
    },
    form: {
      affirmative: [
        '*It is believed that* the site is ancient.',
        'The site *is believed to be* ancient.',
        'She *had* her documents *translated*.',
      ],
      negative: [
        '*It is not thought that* the plan will work.',
        'The plan *is not expected to* succeed.',
        'He *didn’t have* the car *serviced*.',
      ],
      question: [
        '*Is it known* whether the report is finished?',
        '*Where did* you *have* your CV *printed*?',
        '*Have* you *had* your laptop *repaired*?',
      ],
      note: 'Passive by choice, not by habit. If you know who acted and it matters, name them — an essay full of “it is believed” sounds evasive.',
      noteAr: 'اختر المبني للمجهول عن قصد لا عن عادة؛ المقال المملوء بـ it is believed يبدو متهرّبًا.',
    },
    irregulars: 'pp',
    examples: [
      { en: '*It is said that* coffee improves concentration.', ar: 'يُقال إن القهوة تحسّن التركيز.', why: '*It is said that* + full clause. Nobody is named, so nobody is accountable.', whyAr: 'It is said that + جملة كاملة؛ لا أحد يُسمّى فلا أحد يُسأل.' },
      { en: 'Coffee *is said to improve* concentration.', ar: 'يُقال إن القهوة تحسّن التركيز — بالصيغة الثانية.', why: 'The same claim in the second shape: subject + *is said to* + bare verb.', whyAr: 'الادّعاء نفسه بالصيغة الثانية: فاعل + is said to + مجرّد.' },
      { en: '*It is widely believed that* the language is dying.', ar: 'يُعتقد على نطاق واسع أن اللغة تندثر.', why: '*widely* adds weight without adding evidence — notice how easily that works.', whyAr: 'widely تضيف ثقلًا بلا دليل، ولاحظ كم يسهل ذلك.' },
      { en: 'The manuscript *is thought to have been written* in 1400.', ar: 'يُعتقد أن المخطوط كُتب عام ١٤٠٠.', why: '*to have been written* pushes the claim further back in time than the reporting.', whyAr: 'to have been written تُرجع الحدث أبعد من زمن النقل.' },
      { en: 'I *had my visa renewed* last week.', ar: 'جدّدتُ تأشيرتي — أي أنّ جهةً جدّدتها لي.', why: 'Causative: *had* + object + V3. Someone else did it; you arranged it.', whyAr: 'التسبيب: had + مفعول + التصريف الثالث؛ غيرك فعلها وأنت رتّبت.' },
      { en: 'We *are getting the office painted* on Friday.', ar: 'سنطلي المكتب — عبر عمّال.', why: '*get* is the informal twin of *have* in this structure.', whyAr: 'get بديل غير رسمي لـ have في هذا التركيب.' },
      { en: 'Compare: I *painted* the office ✗ (yourself) · I *had it painted* ✓', ar: 'قارن بين أن تطليه بنفسك وأن تُطليه', why: 'Word order is everything: *I painted it* and *I had it painted* are different lives.', whyAr: 'الترتيب هو كل شيء؛ الجملتان تصفان حياتين مختلفتين.' },
      { en: 'Professional: Your request *is being reviewed* by the department.', ar: 'مهني: طلبك قيد المراجعة.', why: 'The present continuous passive — standard professional wording for work in progress.', whyAr: 'مجهول المضارع المستمر: الصيغة المهنية المعتادة للعمل الجاري.' },
    ],
    exercises: [
      { q: 'Impersonal: “People say he is honest.” (2 ways)', a: '*It is said that* he is honest. / He *is said to be* honest.' },
      { q: 'Earlier event: “They believe the letter was sent.”', a: 'The letter *is believed to have been sent*.' },
      { q: 'Causative: “A mechanic repaired my car.”', a: 'I *had my car repaired*.' },
      { q: 'Which is right: “I cut my hair yesterday” or “I had my hair cut”?', a: 'Both exist — the first means *you* held the scissors.' },
      { q: 'Formal report: “Experts think the economy will recover.”', a: 'The economy *is expected to recover*.' },
      { q: 'Make it informal: “I had my phone fixed.”', a: 'I *got* my phone *fixed*.' },
    ],
    reading: {
      title: 'The House on the Hill', titleAr: 'البيت الذي على التلّة',
      passage: [
        'The old house above our town *is said to be* two hundred years old, though nobody has checked.',
        '*It is believed that* a French merchant built it, and he *is thought to have died* there alone.',
        'Every few years someone buys it, *has the roof repaired*, and then quietly disappears from the story.',
        'Last spring the newest owner *had the whole garden cleared*, and under the weeds we found a stone with a date on it.',
        'The date did not match any version of the tale.',
        '*It is now said that* the merchant never existed at all — which, in a small town, changes nothing.',
      ],
      tip: 'Every claim here is reported without a source. That is the impersonal passive doing its work — useful, and worth noticing when others use it on you.',
      tipAr: 'كل ادّعاء هنا منقول بلا مصدر — هذا عمل المبني للمجهول غير الشخصي، ومن المفيد أن تنتبه إليه حين يستعمله غيرك معك.',
    },
    homework: [
      { en: 'Write 4 impersonal claims about your city', ar: 'اكتب ٤ ادّعاءات غير شخصية عن مدينتك' },
      { en: 'Rewrite 3 of them in the *is said to* form', ar: 'أعد كتابة ٣ منها بصيغة is said to' },
      { en: 'Write 3 causative sentences about things you arranged', ar: 'اكتب ٣ جمل تسبيب عن أمور رتّبتها' },
    ],
    editing: {
      wrong: [
        'It is said he is to be very rich man.',
        'I cutted my hair at the barber yesterday.',
        'The bridge is believed to build in 1920.',
      ],
      correct: [
        'It is said *that he is a* very rich man. / He *is said to be* very rich.',
        'I *had my hair cut* at the barber yesterday.',
        'The bridge is believed to *have been built* in 1920.',
      ],
    },
  },

  /* ─────────────────────────── 35 · RELATIVE CLAUSES — ADVANCED ─────────────────────────── */
  {
    no: 35, cefr: 'B2', tag: 'Relative clauses +', tagAr: 'الجُمل الوصفية المتقدّمة',
    title: 'Defining vs Non-Defining — the comma that changes meaning',
    titleAr: 'الوصفية المحدِّدة وغير المحدِّدة — فاصلة تغيّر المعنى',
    objectives: [
      { en: 'Tell essential from extra information', ar: 'التمييز بين المعلومة الأساسية والإضافية' },
      { en: 'Punctuate non-defining clauses correctly', ar: 'ترقيم الجملة غير المحدِّدة' },
      { en: 'Use *which* to comment on a whole clause', ar: 'استخدام which للتعليق على جملة كاملة' },
      { en: 'Shorten clauses: *the man sitting there*', ar: 'اختصار الجملة الوصفية' },
    ],
    rule: {
      en: 'No commas = the clause *defines* which one you mean: “The student *who studies* passes.” Commas = extra information you could delete: “Karim, *who studies every night*, passed.” Never use *that* in a non-defining clause, and never drop the commas.',
      ar: 'بلا فواصل: الجملة تحدّد أيّهما تقصد. وبالفواصل: معلومة إضافية يمكن حذفها. ولا تستعمل that في غير المحدِّدة، ولا تحذف الفواصل.',
    },
    explain: {
      intro: 'Two identical-looking sentences can say opposite things, and the only difference is a pair of commas. “My brother who lives in Paris” implies you have several brothers; “My brother, who lives in Paris,” implies you have one. Examiners test this precisely because it proves you control meaning, not just grammar.',
      introAr: 'جملتان متطابقتان في الشكل قد تقولان أمرين متناقضين، والفرق فاصلتان لا أكثر. «أخي الذي يعيش في باريس» تعني أن لك إخوة، أما «أخي، الذي يعيش في باريس،» فتعني أن لك أخًا واحدًا. ويُختبر هذا لأنه يثبت أنك تتحكّم في المعنى لا في القواعد فقط.',
      points: [
        { en: 'Defining = essential, NO commas, *that* is allowed', ar: 'المحدِّدة: أساسية بلا فواصل ويجوز فيها that' },
        { en: 'Non-defining = extra, ALWAYS commas, *that* is forbidden', ar: 'غير المحدِّدة: إضافية بفواصل دائمًا و that ممنوعة' },
        { en: 'You can drop the pronoun only when it is the *object*: the book (that) I read', ar: 'يجوز حذف الضمير إن كان مفعولًا فقط' },
        { en: '*whose* = belonging to · *where* = place · *when* = time', ar: 'whose للملكية و where للمكان و when للزمان' },
        { en: '*, which* can comment on the WHOLE sentence: He was late, *which* annoyed everyone.', ar: 'which قد تعلّق على الجملة كلها' },
        { en: 'Reduce it: the man *who is sitting* there → the man *sitting* there', ar: 'الاختصار بحذف الضمير وفعل الكينونة' },
      ],
    },
    form: {
      affirmative: [
        'Defining: The email *that arrived* today was urgent.',
        'Non-defining: This email*,* *which arrived* today*,* was urgent.',
        'Reduced: The email *arriving* today was urgent.',
      ],
      negative: [
        'The candidate *who didn’t attend* was rejected.',
        'Sara*,* *who doesn’t drive*, takes the train.',
        'Anything *not marked* urgent can wait.',
      ],
      question: [
        '*Who is* the man *who called* you?',
        '*Which* is the file *(that) you need*?',
        '*Is that* the school *where you studied*?',
      ],
      note: 'Arabic repeats the pronoun («الكتاب الذي قرأتُ*ه*»). English forbids it: “the book that I read *it*” ✗.',
      noteAr: 'العربية تُعيد الضمير العائد، والإنجليزية تمنعه تمامًا.',
    },
    examples: [
      { en: 'Students *who arrive late* will not be admitted.', ar: 'الطلاب الذين يصلون متأخرين لن يُسمح لهم.', why: 'No commas → DEFINING. The clause tells you which students, so it cannot be removed.', whyAr: 'بلا فواصل: محدِّدة تخبرك أيّ طلاب فلا تُحذف.' },
      { en: 'My sister*,* *who lives in Dubai*, is visiting.', ar: 'أختي، التي تعيش في دبي، ستزورنا.', why: 'Commas → NON-DEFINING. Delete the clause and the sentence still stands.', whyAr: 'بالفواصل: غير محدِّدة؛ احذفها وتبقى الجملة.' },
      { en: 'This is the café *where we first met*.', ar: 'هذا المقهى الذي التقينا فيه أول مرة.', why: '*where* replaces *in which* — the natural choice for places.', whyAr: 'where تنوب عن in which، وهي الأنسب للأماكن.' },
      { en: 'The writer *whose book you lent me* is Moroccan.', ar: 'الكاتب الذي أعرتني كتابه مغربي.', why: '*whose* shows possession, and it works for people and things alike.', whyAr: 'whose للملكية وتصلح للعاقل وغيره.' },
      { en: 'He forgot the deadline*,* *which cost us the contract*.', ar: 'نسي الموعد، وهو ما كلّفنا العقد.', why: '*, which* comments on the WHOLE preceding clause, not on one noun.', whyAr: 'which بعد فاصلة تعلّق على الجملة كلها لا على اسم واحد.' },
      { en: 'Reduced: the woman *standing* by the door · the report *written* last year', ar: 'مختصرة: بلا ضمير وبلا فعل كينونة', why: 'Reduced clause: drop the pronoun and *be*, and the meaning survives intact.', whyAr: 'الاختصار: احذف الضمير وفعل الكينونة ويبقى المعنى.' },
      { en: 'Essay: Countries *that invest in education* grow faster.', ar: 'مقال: الدول التي تستثمر في التعليم تنمو أسرع.', why: 'Defining, in an essay: *that* narrows the claim to a specific group of countries.', whyAr: 'محدِّدة في مقال: that تضيّق الادّعاء إلى فئة بعينها.' },
      { en: 'Essay: Morocco*,* *which borders two seas*, has a mild climate.', ar: 'مقال: المغرب، الذي يطلّ على بحرين، معتدل المناخ.', why: 'Non-defining: Morocco is already identified, so the fact is a bonus, in commas.', whyAr: 'غير محدِّدة: المغرب معروف فالمعلومة زائدة بين فاصلتين.' },
    ],
    exercises: [
      { q: 'Commas or not? “My father ___ who is a teacher ___ retired.” (one father)', a: 'Commas: My father*,* who is a teacher*,* retired.' },
      { q: 'Fix: “Ahmed, that works with me, is late.”', a: 'Ahmed*,* *who* works with me, is late. — *that* is banned here.' },
      { q: 'Fix: “The book which I read it was long.”', a: 'The book *(which) I read* was long.' },
      { q: 'Join with *whose*: “I met a man. His car broke down.”', a: 'I met a man *whose car had broken down*.' },
      { q: 'Comment on the whole clause: “She resigned. It shocked us.”', a: 'She resigned*, which* shocked us.' },
      { q: 'Reduce: “the parcel that was delivered yesterday”', a: 'the parcel *delivered* yesterday' },
    ],
    reading: {
      title: 'The Woman Who Fixed Watches', titleAr: 'المرأة التي كانت تصلح الساعات',
      passage: [
        'There was a shop near the station *that* repaired watches, run by a woman *whose* hands never seemed to hurry.',
        'My grandfather*,* *who distrusted anything electric*, took his watch to her every autumn.',
        'She would open the back, look for a long moment, and name a price *that* was always slightly too low.',
        'The shop closed the year he died*,* *which* felt to me, at nine years old, like an arrangement between them.',
        'The building *standing* there now sells phones.',
        'Nobody repairs those; you simply buy the next one.',
      ],
      tip: 'Find the two clauses with commas: delete them and the sentence still stands. Delete the ones without commas and it collapses.',
      tipAr: 'ابحث عن الجملتين المحاطتين بفواصل: احذفهما وتبقى الجملة قائمة، بخلاف اللواتي بلا فواصل.',
    },
    homework: [
      { en: 'Write 4 defining clauses about types of people', ar: 'اكتب ٤ جمل محدِّدة عن أنواع من الناس' },
      { en: 'Write 4 non-defining clauses about people you know', ar: 'اكتب ٤ جمل غير محدِّدة عن أشخاص تعرفهم' },
      { en: 'Reduce 3 of your clauses to the short form', ar: 'اختصر ٣ من جملك' },
    ],
    editing: {
      wrong: [
        'My mother who lives with us she cooks every day.',
        'The car which I bought it last year is broken.',
        'Rabat that is the capital is smaller than Casablanca.',
      ],
      correct: [
        'My mother*,* who lives with us*,* cooks every day.',
        'The car *(which) I bought* last year is broken.',
        'Rabat*,* *which* is the capital*,* is smaller than Casablanca.',
      ],
    },
  },

  /* ─────────────────────────── 36 · PARTICIPLE CLAUSES ─────────────────────────── */
  {
    no: 36, cefr: 'B2', tag: 'Participle clauses', tagAr: 'الجُمل الاسمية بالمشتقّات',
    title: 'Participle Clauses — writing two ideas in one breath',
    titleAr: 'المشتقّات — فكرتان في نفَس واحد',
    objectives: [
      { en: 'Join two clauses without a conjunction', ar: 'ربط جملتين بلا أداة عطف' },
      { en: 'Use *-ing* for the same subject and same time', ar: 'استخدام -ing لنفس الفاعل ونفس الزمن' },
      { en: 'Use *Having + V3* for the earlier action', ar: 'استخدام Having + التصريف الثالث للأسبق' },
      { en: 'Avoid the dangling participle', ar: 'تجنّب المشتقّ المعلّق' },
    ],
    rule: {
      en: 'Same subject, same time → *-ing*: *Walking home, I saw her.* Same subject, earlier action → *Having + V3*: *Having finished, he left.* Passive meaning → *V3* alone: *Written in 1920, the book still sells.* The subject of the participle MUST be the subject of the main clause.',
      ar: 'نفس الفاعل ونفس الزمن ← -ing. ونفس الفاعل مع فعل أسبق ← Having + التصريف الثالث. والمعنى المبني للمجهول ← التصريف الثالث وحده. ويجب أن يكون فاعل المشتقّ هو فاعل الجملة الرئيسية.',
    },
    explain: {
      intro: 'This is the single structure that most changes how *advanced* your writing looks. Compare “Because I had finished my work, I went home” with “Having finished my work, I went home.” Same meaning, one clause lighter. Used twice in a paragraph it lifts you; used in every sentence it becomes a tic.',
      introAr: 'هذا هو التركيب الذي يغيّر أكثر من غيره انطباع «التقدّم» في كتابتك. قارن بين الجملة الطويلة بـ because وبين Having finished my work — المعنى نفسه بجملة أخفّ. استعمله مرّتين في الفقرة فيرفعك، واستعمله في كل جملة فيصير عادة مزعجة.',
      points: [
        { en: '*-ing* = active, at the same time: *Opening the door, she smiled.*', ar: '‏-ing: مبني للمعلوم وفي الوقت نفسه' },
        { en: '*Having + V3* = active, earlier: *Having eaten, we left.*', ar: 'Having + التصريف الثالث: أسبق زمنًا' },
        { en: '*V3* alone = passive: *Built in 1890, the bridge still stands.*', ar: 'التصريف الثالث وحده: مبني للمجهول' },
        { en: 'It can replace *because*, *after*, *while*, *since*', ar: 'يحلّ محلّ because و after و while و since' },
        { en: 'DANGER: *Walking home, the rain started* ✗ — the rain was not walking', ar: 'خطر: المشتقّ المعلّق حين يختلف الفاعل' },
        { en: 'Fix a dangler by restoring the subject: *While I was walking home, the rain started.*', ar: 'العلاج: أعد الفاعل إلى مكانه' },
      ],
    },
    form: {
      affirmative: [
        '*Feeling tired*, I went to bed early.',
        '*Having sent* the email, she relaxed.',
        '*Printed* on thick paper, the book felt expensive.',
      ],
      negative: [
        '*Not knowing* the answer, he stayed silent.',
        '*Not having studied*, she failed.',
        '*Not invited*, they stayed home.',
      ],
      question: [
        '*Was it* difficult, *arriving* so late?',
        '*What did* you do, *having finished* early?',
        '*How did* it feel, *being chosen*?',
      ],
      note: 'Test every participle by asking “who is doing this?” If the answer is not the subject of the main clause, rewrite it.',
      noteAr: 'اختبر كل مشتقّ بسؤال: من يقوم بهذا الفعل؟ فإن لم يكن فاعل الجملة الرئيسية فأعد الصياغة.',
    },
    examples: [
      { en: '*Living abroad*, I learned to cook.', ar: 'حين عشت في الخارج تعلّمت الطبخ.', why: '*-ing* = same subject, same time. It replaces *While I was living…*.', whyAr: 'ing: نفس الفاعل ونفس الزمن، وتنوب عن While I was living.' },
      { en: '*Having lived* abroad, I understand the difficulty.', ar: 'بعد أن عشت في الخارج صرت أفهم الصعوبة.', why: '*Having* + V3 = the action happened EARLIER, then the main clause follows.', whyAr: 'Having + التصريف الثالث: الفعل أسبق ثم تأتي الجملة الرئيسية.' },
      { en: '*Written* in simple English, the book suits beginners.', ar: 'لأنه كُتب بإنجليزية بسيطة يناسب المبتدئين.', why: 'V3 alone = PASSIVE meaning. It replaces *Because it was written…*.', whyAr: 'التصريف الثالث وحده يفيد المجهول وينوب عن Because it was written.' },
      { en: '*Not wanting* to disturb him, I waited outside.', ar: 'لم أشأ إزعاجه فانتظرت في الخارج.', why: 'The negative goes FIRST: *Not wanting*, never *Wanting not*.', whyAr: 'النفي يتقدّم: Not wanting لا Wanting not.' },
      { en: '*Having read* the report, the manager approved it.', ar: 'بعد قراءة التقرير وافق المدير عليه.', why: 'Reason and sequence in three words — this is why the structure looks advanced.', whyAr: 'السبب والتسلسل في ثلاث كلمات، ولهذا يبدو التركيب متقدّمًا.' },
      { en: 'Essay: *Faced with* rising costs, families reduce spending.', ar: 'مقال: في مواجهة ارتفاع التكاليف تقلّل الأسر إنفاقها.', why: '*Faced with* is a fixed participle opener, very common in essays.', whyAr: 'Faced with افتتاحية ثابتة شائعة في المقالات.' },
      { en: 'Essay: *Having examined* the evidence, one conclusion emerges.', ar: 'مقال: بعد فحص الأدلة يبرز استنتاج واحد.', why: '*Having examined* is the academic way to signal that analysis is complete.', whyAr: 'Having examined هي الصيغة الأكاديمية للإشارة إلى اكتمال التحليل.' },
      { en: '✗ Dangling: *Running for the bus, my bag fell.* — the bag was not running.', ar: 'معلّق: الحقيبة لم تكن تركض', why: 'THE danger: the participle must belong to the MAIN subject. The bag was not running.', whyAr: 'الخطر: يجب أن يعود المشتقّ على الفاعل الرئيسي؛ الحقيبة لم تكن تركض.' },
    ],
    exercises: [
      { q: 'Join: “Because I was tired, I left.”', a: '*Feeling* tired, I left.' },
      { q: 'Join: “After she had eaten, she went out.”', a: '*Having eaten*, she went out.' },
      { q: 'Passive: “The house was built in 1890. It still stands.”', a: '*Built* in 1890, the house still stands.' },
      { q: 'Fix the dangler: “Walking home, the rain started.”', a: '*While I was walking* home, the rain started.' },
      { q: 'Negative: “Because he didn’t know the city, he got lost.”', a: '*Not knowing* the city, he got lost.' },
      { q: 'Essay opener with *Having*: about examining data.', a: 'e.g. *Having reviewed the data, we can draw two conclusions.*' },
    ],
    reading: {
      title: 'The Last Train', titleAr: 'آخر قطار',
      passage: [
        '*Arriving* at the station twenty minutes late, I already knew what I would find.',
        '*Having checked* the board twice, I sat on a cold bench and did the arithmetic of a taxi fare.',
        '*Built* in 1923, the station keeps a clock that has been wrong for as long as anyone remembers.',
        '*Not wanting* to phone my brother at midnight, I waited, watching the cleaners work their slow way along the platform.',
        'One of them looked up, *smiling*, and told me there was a bus at one.',
        'There was no bus at one, but I have never forgotten that he wanted there to be.',
      ],
      tip: 'Four participle clauses, four different jobs — time, earlier action, passive description, and reason.',
      tipAr: 'أربع جُمل بالمشتقّات وأربع وظائف: الزمن، والفعل الأسبق، والوصف المبني للمجهول، والسبب.',
    },
    homework: [
      { en: 'Rewrite 5 of your own sentences using participle clauses', ar: 'أعد كتابة ٥ من جملك بالمشتقّات' },
      { en: 'Write 3 sentences with *Having + V3*', ar: 'اكتب ٣ جمل بـ Having + التصريف الثالث' },
      { en: 'Find and fix 2 dangling participles you wrote', ar: 'اكتشف مشتقّين معلّقين وصحّحهما' },
    ],
    editing: {
      wrong: [
        'Opening the letter, my hands was shaking.',
        'Having finish the exam, we went to eat.',
        'Written by my friend, I enjoyed the article.',
      ],
      correct: [
        '*As I opened* the letter, my hands *were* shaking.',
        'Having *finished* the exam, we went to eat.',
        '*I enjoyed the article, written by my friend.*',
      ],
    },
  },

  /* ─────────────────────────── 37 · VERB PATTERNS + ─────────────────────────── */
  {
    no: 37, cefr: 'B2', tag: 'Verb patterns +', tagAr: 'صيغ الأفعال المتقدّمة',
    title: 'Verb Patterns that Change Meaning',
    titleAr: 'أفعال يتغيّر معناها بتغيّر الصيغة',
    objectives: [
      { en: 'Use *remember/forget/stop/try* with both forms', ar: 'استخدام الأفعال التي تقبل الصيغتين' },
      { en: 'Know when the meaning changes and when it does not', ar: 'معرفة متى يتغيّر المعنى' },
      { en: 'Use *verb + object + to* patterns', ar: 'استخدام صيغة فعل + مفعول + to' },
      { en: 'Write precise sentences about intention and memory', ar: 'كتابة جمل دقيقة عن النيّة والذاكرة' },
    ],
    rule: {
      en: 'Some verbs take both forms with DIFFERENT meanings. *Remember to lock* (the duty comes first) vs *remember locking* (the memory comes first). *Stop to smoke* (you paused in order to smoke) vs *stop smoking* (you quit). The *-ing* looks backwards; the *to* looks forwards.',
      ar: 'بعض الأفعال تقبل الصيغتين بمعنيين مختلفين: remember to تعني الواجب قبل الفعل، و remember doing تعني الذكرى بعده. و stop to أي توقّفتَ لتفعل، و stop doing أي أقلعت. فصيغة -ing تنظر إلى الوراء، وصيغة to تنظر إلى الأمام.',
    },
    explain: {
      intro: 'These pairs are the difference between saying what you *meant* and saying what you *did*. “I stopped smoking” and “I stopped to smoke” describe opposite lives. Exam writing punishes the wrong choice heavily, because the reader cannot recover your intention from context.',
      introAr: 'هذه الأزواج هي الفرق بين ما *قصدتَه* وما *فعلتَه*. فجملة «أقلعتُ عن التدخين» و«توقّفتُ لأدخّن» تصفان حياتين متناقضتين. والاختبارات تعاقب الخطأ هنا بشدّة لأن القارئ لا يستطيع استعادة قصدك من السياق.',
      points: [
        { en: '*remember to do* = the duty · *remember doing* = the memory', ar: 'remember to الواجب · remember doing الذكرى' },
        { en: '*forget to do* = you failed to · *forget doing* = you have no memory of', ar: 'forget to نسيتَ أن تفعل · forget doing لا تذكر أنك فعلت' },
        { en: '*stop to do* = pause in order to · *stop doing* = quit', ar: 'stop to توقّف لكي · stop doing أقلع' },
        { en: '*try to do* = attempt something hard · *try doing* = experiment with a method', ar: 'try to حاول · try doing جرّب طريقة' },
        { en: '*mean to do* = intend · *mean doing* = involve', ar: 'mean to ينوي · mean doing يستلزم' },
        { en: '*regret to say* (bad news now) · *regret saying* (regret the past)', ar: 'regret to لخبر سيّئ الآن · regret doing لندم على ماضٍ' },
      ],
    },
    form: {
      affirmative: [
        'Please *remember to send* the file.',
        'I *remember sending* it last week.',
        'We *stopped to rest* halfway.',
      ],
      negative: [
        'Don’t *forget to call* the bank.',
        'I *don’t remember signing* anything.',
        'He *stopped smoking* two years ago.',
      ],
      question: [
        '*Did you remember to lock* the door?',
        '*Do you remember meeting* her?',
        '*Have you tried restarting* it?',
      ],
      note: 'A useful test: *-ing* is a thing that already exists in the world; *to* is a thing still ahead of you.',
      noteAr: 'اختبار مفيد: صيغة -ing شيء موجود فعلًا، وصيغة to شيء ما زال أمامك.',
    },
    examples: [
      { en: '*Remember to bring* your passport tomorrow.', ar: 'تذكّر أن تُحضر جواز سفرك غدًا.', why: '*remember to* looks FORWARD — the locking has not happened yet.', whyAr: 'remember to تنظر إلى الأمام؛ الفعل لم يحدث بعد.' },
      { en: 'I *remember bringing* it — it must be in the bag.', ar: 'أذكر أنني أحضرته.', why: '*remember doing* looks BACK at a memory of something already done.', whyAr: 'remember doing تنظر إلى الوراء نحو ذكرى فعلٍ وقع.' },
      { en: 'She *stopped studying* medicine after one year.', ar: 'توقّفت عن دراسة الطب بعد سنة.', why: '*stop doing* = quit the activity altogether.', whyAr: 'stop doing تعني الإقلاع عن النشاط كلّه.' },
      { en: 'She *stopped to study* the map for a minute.', ar: 'توقّفت لتدرس الخريطة دقيقة.', why: '*stop to do* = pause IN ORDER TO do something else. Opposite meaning.', whyAr: 'stop to تعني التوقّف لكي تفعل شيئًا آخر؛ معنى معاكس.' },
      { en: 'I *tried to open* the jar, but it was stuck.', ar: 'حاولت فتح البرطمان.', why: '*try to* = attempt something difficult, and it may fail.', whyAr: 'try to محاولة لشيء صعب قد تفشل.' },
      { en: '*Try adding* more salt — it might help.', ar: 'جرّب إضافة الملح.', why: '*try doing* = experiment with a method to see whether it helps.', whyAr: 'try doing تجربة طريقة لترى هل تنفع.' },
      { en: 'Professional: We *regret to inform* you that the post is filled.', ar: 'مهني: يؤسفنا إبلاغكم بشغل الوظيفة.', why: '*regret to inform* delivers bad news NOW — the fixed formula for a rejection.', whyAr: 'regret to inform تنقل خبرًا سيّئًا الآن، وهي صيغة الرفض الثابتة.' },
      { en: 'Professional: I *regret sending* that email so quickly.', ar: 'مهني: أندم على إرسال ذلك الإيميل بسرعة.', why: '*regret sending* is remorse about a past act — completely different meaning.', whyAr: 'regret sending ندم على فعل ماضٍ؛ معنى مختلف تمامًا.' },
    ],
    exercises: [
      { q: 'Duty or memory? “Remember ___ (post) the letter — it is urgent.”', a: '*to post* — it has not happened yet.' },
      { q: 'Duty or memory? “I remember ___ (post) it yesterday.”', a: '*posting* — it already happened.' },
      { q: 'Quit or pause? “He stopped ___ (drink) coffee at night.”', a: '*drinking* — he quit.' },
      { q: 'Attempt or experiment? “___ (try) turning it off and on.”', a: '*Try turning* — a method to experiment with.' },
      { q: 'Formal bad news: begin a rejection line.', a: 'We *regret to inform* you that…' },
      { q: 'Fix: “I forgot locking the door and someone came in.”', a: 'I forgot *to lock* the door…' },
    ],
    reading: {
      title: 'What My Father Forgot', titleAr: 'ما نسيه أبي',
      passage: [
        'In his last years my father would forget *to take* his tablets, but he never forgot *taking* my mother to the sea in 1974.',
        'He would stop *to describe* the colour of the water, then stop *describing* it because the word in English would not come.',
        'I tried *to correct* him once and learned quickly not to.',
        'Later I tried *sitting* quietly instead, and the stories grew longer.',
        'He always meant *to write* it all down, though writing it down would have meant *choosing* which parts were true.',
        'I remember *listening*. That turned out to be the useful part.',
      ],
      tip: 'Six pairs, six different meanings. Read it twice and swap one form — the sentence changes its life.',
      tipAr: 'ستّة أزواج وستّة معانٍ. اقرأها مرّتين وبدّل صيغة واحدة لترى كيف تتغيّر الجملة.',
    },
    homework: [
      { en: 'Write both versions of 4 verbs and explain the difference', ar: 'اكتب الصيغتين لأربعة أفعال واشرح الفرق' },
      { en: 'Write 3 sentences about habits you stopped', ar: 'اكتب ٣ جمل عن عادات أقلعت عنها' },
      { en: 'Write a professional line with *regret to inform*', ar: 'اكتب جملة مهنية بـ regret to inform' },
    ],
    editing: {
      wrong: [
        'Please remember locking the office before you leave.',
        'I stopped to smoke last year and I feel better.',
        'We regret informing you that your application failed.',
      ],
      correct: [
        'Please remember *to lock* the office before you leave.',
        'I stopped *smoking* last year and I feel better.',
        'We regret *to inform* you that your application *was unsuccessful*.',
      ],
    },
  },

  /* ═══════════════════ UNIT 10 · ESSAYS & ARGUMENT (B2) ═══════════════════ */

  /* ─────────────────────────── 38 · PARAGRAPH TO ESSAY ─────────────────────────── */
  {
    no: 38, cefr: 'B2', tag: 'The essay shape', tagAr: 'شكل المقال',
    title: 'From Paragraph to Essay — the four-part shape',
    titleAr: 'من الفقرة إلى المقال — البناء الرباعي',
    objectives: [
      { en: 'See an essay as paragraphs with one job each', ar: 'رؤية المقال كفقرات لكلٍّ منها وظيفة' },
      { en: 'Write an introduction that earns the reader', ar: 'كتابة مقدّمة تكسب القارئ' },
      { en: 'Give every body paragraph one controlling idea', ar: 'فكرة واحدة مسيطرة لكل فقرة' },
      { en: 'Close without repeating yourself', ar: 'الختام دون تكرار' },
    ],
    rule: {
      en: 'An essay is four moves: *Introduction* (hook → background → thesis) · *Body 1* (first main point + evidence) · *Body 2* (second main point + evidence) · *Conclusion* (restate the position in new words → implication). Four paragraphs, 250–300 words, is a complete essay.',
      ar: 'المقال أربع حركات: مقدّمة (جذب ← خلفية ← أطروحة)، وفقرة أولى بنقطة ودليل، وفقرة ثانية بنقطة ودليل، وخاتمة تعيد الموقف بكلمات جديدة ثم تفتح أفقًا. أربع فقرات و٢٥٠–٣٠٠ كلمة مقال كامل.',
    },
    explain: {
      intro: 'You already know how to build one paragraph: topic sentence, support, conclusion. An essay is that same shape one level up — the thesis is the essay’s topic sentence, and each body paragraph is one of its supports. Nothing new is being asked of you except *scale*.',
      introAr: 'أنت تعرف بناء الفقرة: جملة موضوعية ودعم وخاتمة. والمقال هو البناء نفسه بمستوى أعلى: الأطروحة جملته الموضوعية، وكل فقرة من الجسم دعامة من دعائمها. فلا يُطلب منك جديد سوى *الحجم*.',
      points: [
        { en: 'Introduction = hook → background → *thesis* (the thesis goes LAST)', ar: 'المقدّمة: جذب ← خلفية ← أطروحة في الآخر' },
        { en: 'One main idea per body paragraph — two ideas means two paragraphs', ar: 'فكرة رئيسية واحدة لكل فقرة' },
        { en: 'Every body paragraph: topic sentence → explain → example → link', ar: 'كل فقرة: جملة موضوعية ← شرح ← مثال ← ربط' },
        { en: 'Order your points weakest → strongest; the reader keeps the last one', ar: 'رتّب من الأضعف إلى الأقوى، فالأخيرة هي الباقية' },
        { en: 'Conclusion: NEW words, NO new arguments, NO “In conclusion I think”', ar: 'الخاتمة بكلمات جديدة بلا حجج جديدة' },
        { en: 'Plan for four minutes before writing; it saves twenty', ar: 'خطّط أربع دقائق قبل الكتابة توفّر عشرين' },
      ],
    },
    examples: [
      { en: 'Hook (question): *Why do so many adults abandon a language they once studied for years?*', ar: 'جذب بسؤال', why: 'A question hook works because the reader answers it silently and is now involved.', whyAr: 'الجذب بالسؤال ينجح لأن القارئ يجيب في نفسه فيشارك.' },
      { en: 'Hook (fact): *Nearly half of Moroccan graduates say English limits their job options.*', ar: 'جذب بحقيقة', why: 'A fact hook borrows authority — but only if the number is real.', whyAr: 'الجذب بالحقيقة يستعير سلطةً، بشرط أن يكون الرقم حقيقيًا.' },
      { en: 'Background: *English has become the language of hiring across the region.*', ar: 'خلفية', why: 'Background narrows from the hook to the topic. It is the bridge, not the argument.', whyAr: 'الخلفية تضيّق من الجذب إلى الموضوع؛ إنها الجسر لا الحجّة.' },
      { en: 'Thesis: *Schools should therefore teach writing, not only conversation.*', ar: 'أطروحة', why: 'The thesis comes LAST in the introduction — everything before it was preparation.', whyAr: 'الأطروحة آخر المقدّمة، وما قبلها تمهيد.' },
      { en: 'Body topic sentence: *The first reason is economic.*', ar: 'جملة موضوعية للفقرة', why: 'A topic sentence announces the ONE job of this paragraph, and nothing more.', whyAr: 'الجملة الموضوعية تُعلن وظيفة الفقرة الواحدة لا أكثر.' },
      { en: 'Evidence: *For example, most job advertisements now require written English.*', ar: 'دليل', why: 'Evidence follows the claim immediately — a claim left alone is an opinion.', whyAr: 'الدليل يتلو الادّعاء فورًا؛ والادّعاء وحده رأي.' },
      { en: 'Link: *This shift explains why writing deserves more classroom time.*', ar: 'ربط', why: 'The link sentence carries the reader into the next paragraph.', whyAr: 'جملة الربط تحمل القارئ إلى الفقرة التالية.' },
      { en: 'Conclusion: *A generation that can speak but not write will keep losing the interview it deserves.*', ar: 'خاتمة تفتح أفقًا', why: 'The conclusion lifts the argument instead of repeating it — new words, higher view.', whyAr: 'الخاتمة ترفع الحجّة ولا تكرّرها: كلمات جديدة ونظرة أعلى.' },
    ],
    exercises: [
      { q: 'Where does the thesis go in the introduction?', a: '*Last* — after the hook and background.' },
      { q: 'Your body paragraph has two ideas. Fix it.', a: 'Split it into *two paragraphs*, one idea each.' },
      { q: 'Order these: strongest argument, weakest argument.', a: 'Weakest first, *strongest last*.' },
      { q: 'What must a conclusion never contain?', a: 'A *new argument* — and no “In conclusion, I think…”.' },
      { q: 'Write a hook (question) for: technology in classrooms.', a: 'e.g. *Can a tablet teach what a teacher cannot?*' },
      { q: 'How many words is a complete 4-paragraph essay?', a: 'About *250–300*.' },
    ],
    reading: {
      title: 'The Shape Under the Words', titleAr: 'البناء تحت الكلمات',
      passage: [
        'The first essay I ever wrote in English was two pages long and said one thing four times.',
        'My teacher drew a box around each paragraph and asked me to write, in the margin, what job that paragraph did.',
        'Three of the four boxes got the same answer, which was the whole problem in one page.',
        'She told me that a reader forgives clumsy sentences but never forgives not knowing why they are still reading.',
        'Since then I plan in boxes before I write in words, and the writing takes half the time.',
        'The shape is not a cage; it is the thing that lets you stop worrying about the shape.',
      ],
      tip: 'Test any essay: write in the margin what job each paragraph does. Two paragraphs with the same job means one is redundant.',
      tipAr: 'اختبر أي مقال: اكتب على الهامش وظيفة كل فقرة، فإن تكرّرت الوظيفة فإحداهما زائدة.',
    },
    homework: [
      { en: 'Plan (do not write) 3 essays in boxes: 4 boxes each', ar: 'خطّط ٣ مقالات في صناديق دون كتابتها' },
      { en: 'Write 3 hooks for the same topic: question, fact, story', ar: 'اكتب ٣ مقدّمات جاذبة للموضوع نفسه' },
      { en: 'Write one full introduction: hook, background, thesis', ar: 'اكتب مقدّمة كاملة' },
    ],
    editing: {
      wrong: [
        'In this essay I will talk about the advantages and the disadvantages of the social media and I think it is bad.',
        'In conclusion, I think that also we must say that the government should ban it.',
      ],
      correct: [
        '*Social media has changed how a generation reads, writes and argues.* *This essay argues that its costs to concentration outweigh its benefits.*',
        '*The evidence points one way: a tool built to interrupt us is a poor place to think.* — no new argument in a conclusion.',
      ],
    },
  },

  /* ─────────────────────────── 39 · THE THESIS STATEMENT ─────────────────────────── */
  {
    no: 39, cefr: 'B2', tag: 'Thesis statement', tagAr: 'جملة الأطروحة',
    title: 'The Thesis Statement — the sentence the essay obeys',
    titleAr: 'جملة الأطروحة — الجملة التي يطيعها المقال',
    objectives: [
      { en: 'Write one sentence that controls the whole essay', ar: 'كتابة جملة واحدة تتحكّم في المقال' },
      { en: 'Take a position instead of announcing a topic', ar: 'اتّخاذ موقف بدل الإعلان عن موضوع' },
      { en: 'Make a thesis arguable, specific and provable', ar: 'جعل الأطروحة قابلة للنقاش ومحدّدة' },
      { en: 'Signal the structure without listing mechanically', ar: 'الإشارة إلى البناء دون سرد آليّ' },
    ],
    rule: {
      en: 'A thesis is a *claim someone could disagree with*. “This essay is about pollution” is a topic, not a thesis. “Cities should ban private cars from their centres” is a thesis — because a reasonable person could argue the opposite.',
      ar: 'الأطروحة *ادّعاء يمكن أن يخالفك فيه أحد*. «هذا المقال عن التلوّث» موضوع لا أطروحة، أما «ينبغي للمدن أن تمنع السيارات من مراكزها» فأطروحة، لأن عاقلًا قد يقول عكسها.',
    },
    explain: {
      intro: 'Almost every weak essay in the world fails at the same sentence. The writer announces a subject and then wanders. A thesis is a promise with a direction: it tells the reader what you will prove and, quietly, what you will not discuss. Once it exists, the essay almost plans itself.',
      introAr: 'كل مقال ضعيف تقريبًا يسقط عند الجملة نفسها: يعلن الكاتب موضوعًا ثم يتيه. أما الأطروحة فوعدٌ له اتّجاه: تخبر القارئ بما ستُثبته، وتخبره ضمنًا بما لن تناقشه. وما إن توجد حتى يكاد المقال يخطّط نفسه.',
      points: [
        { en: 'Arguable: someone could reasonably disagree', ar: 'قابلة للنقاش: يمكن مخالفتها بعقل' },
        { en: 'Specific: name the thing, not the field', ar: 'محدّدة: سمِّ الشيء لا المجال' },
        { en: 'Provable *by you*, in 300 words, without research you do not have', ar: 'قابلة للإثبات بما لديك وفي حجم مقالك' },
        { en: 'One sentence. If it needs two, it is two theses.', ar: 'جملة واحدة؛ فإن احتاجت جملتين فهي أطروحتان' },
        { en: '*because* is your friend: X should Y *because* Z', ar: 'كلمة because صديقتك: X ينبغي Y لأن Z' },
        { en: 'Avoid “I will talk about…” — announce nothing, claim something', ar: 'تجنّب «سأتحدّث عن» — لا تُعلن بل ادّعِ' },
      ],
    },
    examples: [
      { en: '✗ Topic: *This essay is about online learning.*', ar: 'موضوع لا أطروحة', why: 'This announces a SUBJECT. Nobody could disagree with it, so it is not a thesis.', whyAr: 'هذا إعلان عن موضوع لا يخالفه أحد، فليس أطروحة.' },
      { en: '✓ Thesis: *Online learning suits motivated adults but fails most teenagers.*', ar: 'أطروحة قابلة للنقاش', why: 'Now there is a position, and a reasonable person could argue the opposite.', whyAr: 'الآن صار موقفًا يمكن لعاقل أن يخالفه.' },
      { en: '✗ Too broad: *Technology has changed everything.*', ar: 'فضفاضة جدًا', why: 'Too broad to prove in 300 words — this is the size of a book.', whyAr: 'فضفاضة يتعذّر إثباتها في ٣٠٠ كلمة؛ هذا حجم كتاب.' },
      { en: '✓ Narrow: *Smartphones have made deep reading a minority skill.*', ar: 'محدّدة', why: 'Narrow enough that two body paragraphs can actually carry it.', whyAr: 'ضيّقة بما يكفي لتحملها فقرتان.' },
      { en: '✗ Not arguable: *Pollution is bad for health.*', ar: 'لا خلاف عليها فلا تصلح', why: 'Nobody disagrees, so there is nothing to argue — a dead thesis.', whyAr: 'لا خلاف عليها فلا حجاج؛ أطروحة ميتة.' },
      { en: '✓ Arguable: *Morocco should tax private cars to fund public transport.*', ar: 'يمكن مخالفتها', why: 'A policy claim is arguable by design: cost, fairness and freedom all push back.', whyAr: 'الادّعاء السياساتيّ قابل للنقاش بطبيعته.' },
      { en: 'With *because*: *Schools should teach writing daily because employers test it first.*', ar: 'بصيغة because', why: '*because* forces you to name the reason inside the thesis itself.', whyAr: 'because تُلزمك بذكر السبب داخل الأطروحة نفسها.' },
      { en: 'With concession: *Although travel is educational, it cannot replace formal study.*', ar: 'مع تنازل', why: 'Concession inside the thesis pre-answers the objection before it is raised.', whyAr: 'التنازل داخل الأطروحة يردّ على الاعتراض قبل أن يُثار.' },
    ],
    exercises: [
      { q: 'Topic or thesis? “The problem of unemployment in Morocco.”', a: 'Topic — no claim. Add one: *…is caused less by a lack of jobs than by a mismatch of skills.*' },
      { q: 'Make arguable: “Reading is useful.”', a: 'e.g. *Reading fiction builds empathy more effectively than any school subject.*' },
      { q: 'Narrow it: “Social media affects society.”', a: 'e.g. *Instagram has changed how teenagers judge their own faces.*' },
      { q: 'Add *because*: “Cities should limit cars.”', a: '…*because the health cost of traffic now exceeds its economic benefit.*' },
      { q: 'Fix: “In this essay I will discuss the advantages of English.”', a: '*Fluent written English has become the single strongest advantage a Moroccan graduate can hold.*' },
      { q: 'Write a thesis with concession about remote work.', a: 'e.g. *Although remote work saves time, it quietly costs young employees their training.*' },
    ],
    reading: {
      title: 'One Sentence, Then the Rest', titleAr: 'جملة واحدة ثم البقيّة',
      passage: [
        'A friend of mine marks exam essays for a living, and she told me she can predict the grade from the first paragraph almost every time.',
        'It is not the vocabulary and it is not the grammar.',
        'It is whether the writer has decided anything.',
        'An essay that says “there are many opinions about this topic” has already told her that no opinion is coming.',
        'An essay whose fourth sentence takes a clear position, even a position she disagrees with, has her attention for the rest of the page.',
        'Deciding is the hard part; the paragraphs afterwards are mostly obedience.',
      ],
      tip: 'Before you write, finish this out loud: “I am going to prove that…”. If you cannot, you have no thesis yet.',
      tipAr: 'قبل الكتابة أكمل بصوت عالٍ: «سأُثبت أن…». فإن لم تستطع فليست لديك أطروحة بعد.',
    },
    homework: [
      { en: 'Turn 5 topics into arguable theses', ar: 'حوّل ٥ مواضيع إلى أطروحات قابلة للنقاش' },
      { en: 'Write 3 theses using *because*', ar: 'اكتب ٣ أطروحات بصيغة because' },
      { en: 'Write 2 theses with a concession (*Although…*)', ar: 'اكتب أطروحتين بصيغة التنازل' },
    ],
    editing: {
      wrong: [
        'In this essay I am going to write about the tourism in Morocco and its effects.',
        'Everybody knows that education is very important for all the people in the world.',
      ],
      correct: [
        '*Mass tourism has funded Morocco’s coast while quietly emptying its old towns.*',
        '*Free universities matter less than the quality of the first three years of school.*',
      ],
    },
  },

  /* ─────────────────────────── 40 · OPINION ESSAY ─────────────────────────── */
  {
    no: 40, cefr: 'B2', tag: 'Opinion essay', tagAr: 'مقال الرأي',
    title: 'The Opinion Essay — defending one position',
    titleAr: 'مقال الرأي — الدفاع عن موقف واحد',
    objectives: [
      { en: 'State and hold one position for a whole essay', ar: 'اتّخاذ موقف والثبات عليه' },
      { en: 'Support opinion with reason, example and consequence', ar: 'دعم الرأي بالسبب والمثال والنتيجة' },
      { en: 'Use opinion language at the right strength', ar: 'استخدام لغة الرأي بالقوّة المناسبة' },
      { en: 'Write 250–300 words in four paragraphs', ar: 'كتابة ٢٥٠–٣٠٠ كلمة في أربع فقرات' },
    ],
    rule: {
      en: 'Pick ONE side and never wobble. Introduction ends with your position. Each body paragraph gives one reason, developed with R.E.D. Conclusion restates the position more strongly than the introduction did. A “both sides” answer belongs in a different essay type.',
      ar: 'اختر جانبًا واحدًا ولا تتذبذب. تنتهي المقدّمة بموقفك، وكل فقرة تقدّم سببًا مطوَّرًا بمنهج R.E.D.، وتعيد الخاتمة الموقف أقوى مما بدأت. أما «كلا الجانبين» فنوع آخر من المقالات.',
    },
    explain: {
      intro: 'The commonest failure here is politeness. Writers hedge so hard that by paragraph three the reader cannot tell what they believe. In an opinion essay, balance is not fairness — it is indecision. You may acknowledge the other side, but only in order to defeat it.',
      introAr: 'أشيع الأخطاء هنا هو المجاملة: يبالغ الكاتب في التحفّظ حتى لا يعود القارئ يعرف رأيه. والتوازن في مقال الرأي ليس إنصافًا بل تردّدًا. لك أن تعترف بالرأي الآخر، لكن لتهزمه لا لتساويه.',
      points: [
        { en: 'Strong: *I firmly believe* · *There is no doubt that*', ar: 'قويّة' },
        { en: 'Measured: *In my view* · *It seems clear that*', ar: 'معتدلة' },
        { en: 'Cautious: *It could be argued that* · *arguably*', ar: 'متحفّظة' },
        { en: 'Never mix strengths at random — pick a register and hold it', ar: 'لا تخلط الدرجات عشوائيًا' },
        { en: 'Acknowledge the other side once, then answer it', ar: 'اعترف بالرأي الآخر مرّة ثم ردّ عليه' },
        { en: 'Avoid “I think” five times — the essay is already yours', ar: 'لا تكرّر I think — المقال لك أصلًا' },
      ],
    },
    studio: {
      prompt: { en: 'Some people believe children should start learning English at age 5. Do you agree? Write 250–300 words.', ar: 'يرى بعضهم أن الأطفال ينبغي أن يبدؤوا الإنجليزية في الخامسة. هل توافق؟ اكتب ٢٥٠–٣٠٠ كلمة.' },
      model: {
        title: 'A Model Opinion Essay', titleAr: 'مقال رأي نموذجي',
        parts: [
          { role: 'topic', en: 'Every parent I know asks the same question at the school gate: how early is too early for English?' },
          { role: 'support', en: 'I firmly believe that starting at five is right, provided the lessons are spoken rather than written.' },
          { role: 'support', en: 'The first reason is neurological: young children imitate sound without embarrassment, and accent is the one thing that hardens with age.' },
          { role: 'support', en: 'A five-year-old repeats a difficult word cheerfully twenty times; a fifteen-year-old repeats it once and blushes.' },
          { role: 'support', en: 'The second reason is confidence. Children who meet English as a game rather than an exam arrive at secondary school without fear, and fear, not ability, is what stops most learners.' },
          { role: 'support', en: 'Critics reply that early English weakens the mother tongue. The evidence does not support this: bilingual children reach the same milestones in Arabic, only by a slightly different road.' },
          { role: 'conclusion', en: 'Start them at five, then — but with songs, not spelling tests. What we teach at that age is not vocabulary; it is whether English feels like a door or a wall.' },
        ],
      },
      plan: [
        { label: 'Hook + background', ar: 'جذب وخلفية' },
        { label: 'Thesis — your position', ar: 'الأطروحة — موقفك' },
        { label: 'Reason 1 + R.E.D.', ar: 'السبب الأول مع التوسيع' },
        { label: 'Reason 2 + R.E.D.', ar: 'السبب الثاني مع التوسيع' },
        { label: 'The other side, answered', ar: 'الرأي الآخر والردّ عليه' },
        { label: 'Conclusion — stronger, new words', ar: 'خاتمة أقوى بكلمات جديدة' },
      ],
      toolkit: [
        { group: 'State your view', ar: 'إعلان الرأي', phrases: ['I firmly believe that…', 'In my view, …', 'There is little doubt that…', 'The evidence suggests that…'] },
        { group: 'Support it', ar: 'الدعم', phrases: ['The first reason is…', 'This matters because…', 'For example, …', 'As a result, …'] },
        { group: 'Answer the other side', ar: 'الردّ على المخالف', phrases: ['Critics reply that…', 'It is often argued that…', 'This objection ignores…', 'The evidence does not support this.'] },
      ],
      steps: [
        { en: 'Decide your side in one sentence before writing anything.', ar: 'حدّد موقفك في جملة قبل أن تكتب.' },
        { en: 'Choose your two strongest reasons; put the stronger second.', ar: 'اختر أقوى سببين وضع الأقوى ثانيًا.' },
        { en: 'Develop each with R.E.D. — reason, example, detail.', ar: 'وسّع كلًّا منهما بمنهج R.E.D.' },
        { en: 'Give the other side one sentence, then answer it.', ar: 'أعطِ الرأي الآخر جملة ثم ردّ عليه.' },
        { en: 'End stronger than you began, in new words.', ar: 'اختم أقوى مما بدأت وبكلمات جديدة.' },
      ],
      checklist: [
        { en: 'One clear position, held to the end', ar: 'موقف واحد واضح حتى النهاية' },
        { en: 'Two developed reasons, not five thin ones', ar: 'سببان مطوَّران لا خمسة هزيلة' },
        { en: 'The other side appears once — and loses', ar: 'الرأي الآخر يظهر مرّة ويُهزم' },
        { en: 'No new argument in the conclusion', ar: 'لا حجّة جديدة في الخاتمة' },
        { en: '250–300 words, four paragraphs', ar: '٢٥٠–٣٠٠ كلمة وأربع فقرات' },
      ],
    },
    examples: [
      { en: '*I firmly believe that* homework should be abolished before age ten.', ar: 'أعتقد جازمًا…', why: '*I firmly believe* commits you. In an opinion essay, commitment is the point.', whyAr: 'I firmly believe تُلزمك، والالتزام هو المقصود في مقال الرأي.' },
      { en: '*The first reason is* economic*; the second is* moral.', ar: 'السبب الأول اقتصادي والثاني أخلاقي.', why: 'Naming the shape of your argument tells the reader how long to expect it.', whyAr: 'ذكر بنية الحجّة يُعلم القارئ بحجم ما ينتظره.' },
      { en: '*Critics reply that* standards would fall. *This objection ignores* the evidence from Finland.', ar: 'يردّ النقّاد… وهذا الاعتراض يتجاهل…', why: 'Concede then refute in two sentences — the other side loses, but fairly.', whyAr: 'تنازل ثم ردّ في جملتين؛ يخسر الخصم لكن بإنصاف.' },
      { en: '*As a result*, children arrive at secondary school without fear.', ar: 'ونتيجةً لذلك…', why: '*As a result* makes the consequence explicit rather than leaving it implied.', whyAr: 'As a result تُظهر النتيجة بدل تركها مضمرة.' },
      { en: 'Weak ✗: *Maybe it is good, but also maybe it is bad.*', ar: 'ضعيفة: تذبذب', why: 'Wobbling reads as indecision. In this essay type, balance is a fault.', whyAr: 'التذبذب يُقرأ ترددًا، والتوازن هنا عيب.' },
      { en: 'Strong ✓: *The benefits are real, but they are smaller than the cost.*', ar: 'قويّة: اعتراف ثم حسم', why: 'Acknowledging the cost while holding the line is what confidence sounds like.', whyAr: 'الاعتراف بالكلفة مع الثبات هو صوت الثقة.' },
      { en: 'Conclusion move: *What we teach at that age is not vocabulary; it is confidence.*', ar: 'حركة الخاتمة: رفع المستوى', why: 'The closing move lifts from the specific claim to what is really at stake.', whyAr: 'حركة الختام ترتفع من الادّعاء إلى ما هو على المحكّ.' },
      { en: 'Avoid ✗: *In conclusion, I think that I have said everything.*', ar: 'تجنّب الخاتمة الفارغة', why: 'An empty conclusion wastes the strongest position in the essay.', whyAr: 'الخاتمة الفارغة تُهدر أقوى موضع في المقال.' },
    ],
    exercises: [
      { q: 'Strengthen: “Maybe schools should teach cooking.”', a: '*Schools should teach cooking, and the case is stronger than for half the timetable.*' },
      { q: 'Answer this objection: “Early English harms Arabic.”', a: 'e.g. *The evidence does not support this: bilingual children reach the same milestones in Arabic.*' },
      { q: 'Which is a stronger closing? (a) “In conclusion I think it is good.” (b) “The question is not whether we can afford it, but whether we can afford not to.”', a: '(b) — it lifts the argument instead of repeating it.' },
      { q: 'You wrote “I think” four times. Fix the register.', a: 'Replace with *In my view* once, then let the claims stand alone.' },
      { q: 'Order two reasons: money, and children’s confidence.', a: 'Put the one you can prove best *second*.' },
      { q: 'Write a one-sentence position on remote work.', a: 'e.g. *Remote work suits experienced staff and quietly abandons the young.*' },
    ],
    reading: {
      title: 'The Essay That Would Not Choose', titleAr: 'المقال الذي رفض أن يختار',
      passage: [
        'I once spent a week on an essay about whether cities should ban cars, and I gave both sides everything.',
        'Every argument had its answer; every answer had its qualification.',
        'The teacher wrote a single line at the bottom: “Beautifully balanced. What do you think?”',
        'It had honestly not occurred to me that the question required me.',
        'I rewrote it in one evening, kept two of the eight arguments, and it was the first thing I wrote in English that anyone quoted back to me.',
        'Fairness is a virtue in a judge and a weakness in an advocate.',
      ],
      tip: 'An opinion essay is advocacy, not judgement. Keep the other side — but keep it losing.',
      tipAr: 'مقال الرأي مرافعة لا حُكم. أبقِ الرأي الآخر، لكن أبقِه خاسرًا.',
    },
    homework: [
      { en: 'Write a full 250-word opinion essay on early English', ar: 'اكتب مقال رأي كاملًا في ٢٥٠ كلمة' },
      { en: 'Underline your thesis and both topic sentences', ar: 'ضع خطًا تحت أطروحتك وجملتَي فقراتك' },
      { en: 'Rewrite your conclusion twice; keep the stronger', ar: 'أعد كتابة خاتمتك مرّتين واحتفظ بالأقوى' },
    ],
    editing: {
      wrong: [
        'I think maybe the technology is good and also it is bad for the children in some situations.',
        'In conclusion, I think that I agree and disagree with this topic.',
      ],
      correct: [
        '*Technology helps children who already read well and harms those who do not.*',
        '*The tool is not the problem; the absence of an adult beside it is.*',
      ],
    },
  },

  /* ─────────────────────────── 41 · FOR & AGAINST ─────────────────────────── */
  {
    no: 41, cefr: 'B2', tag: 'For & against', tagAr: 'مع وضدّ',
    title: 'The For-and-Against Essay — balance on purpose',
    titleAr: 'مقال مع وضدّ — توازن مقصود',
    objectives: [
      { en: 'Present both sides fairly and clearly', ar: 'عرض الجانبين بإنصاف ووضوح' },
      { en: 'Keep your own voice out until the end', ar: 'تأجيل صوتك إلى الخاتمة' },
      { en: 'Use contrast linkers accurately', ar: 'استخدام أدوات التضاد بدقّة' },
      { en: 'Reach a conclusion the essay has earned', ar: 'الوصول إلى خاتمة يستحقّها المقال' },
    ],
    rule: {
      en: 'Two body paragraphs: one for advantages, one for disadvantages — never mixed. The introduction promises balance, not a position. Your view appears once, in the conclusion, and must follow from what you wrote.',
      ar: 'فقرتان: واحدة للمزايا وأخرى للعيوب دون خلط. وتَعِد المقدّمة بالتوازن لا بالموقف. ويظهر رأيك مرّة واحدة في الخاتمة، ويجب أن ينبع مما كتبت.',
    },
    explain: {
      intro: 'This is the opposite discipline to the opinion essay, and mixing the two is the commonest exam mistake. Here your job is to be a fair guide for two paragraphs and a decisive one for two sentences. The examiner is watching whether your conclusion actually follows from your body — most do not.',
      introAr: 'هذا انضباط معاكس لمقال الرأي، وخلط النوعين أشيع خطأ في الامتحانات. مهمّتك هنا أن تكون دليلًا منصفًا في فقرتين، وحاسمًا في جملتين. والمصحّح ينظر هل خاتمتك تنبع فعلًا من جسم مقالك — وأغلبها لا ينبع.',
      points: [
        { en: 'Paragraph 2 = advantages only. Paragraph 3 = disadvantages only.', ar: 'فقرة للمزايا وفقرة للعيوب فقط' },
        { en: 'Give each side a comparable weight — two points each', ar: 'وزن متقارب: نقطتان لكل جانب' },
        { en: '*However* / *On the other hand* open the second side', ar: 'أدوات فتح الجانب الثاني' },
        { en: '*While* / *Whereas* contrast INSIDE one sentence', ar: 'while و whereas للتضاد داخل الجملة' },
        { en: '*Despite* + noun · *Although* + clause — never “despite that he is”', ar: 'despite + اسم و although + جملة' },
        { en: 'Your verdict belongs in the last two sentences, and nowhere else', ar: 'حكمك في آخر جملتين ولا مكان له سواهما' },
      ],
    },
    examples: [
      { en: 'Opening: *Remote work has divided employers into two camps.*', ar: 'افتتاح محايد', why: 'A neutral opening — the introduction of this essay type promises balance, not a side.', whyAr: 'افتتاح محايد؛ مقدّمة هذا النوع تَعِد بالتوازن لا بموقف.' },
      { en: 'Advantage: *The clearest benefit is time: commuting swallows an hour a day.*', ar: 'ميزة', why: '*The clearest benefit* signals that you are now in the advantages paragraph.', whyAr: 'هذه العبارة تُعلن أنك في فقرة المزايا.' },
      { en: 'Advantage 2: *Furthermore, employees report deeper concentration at home.*', ar: 'ميزة ثانية', why: '*Furthermore* adds a second advantage of the same kind, keeping the sides balanced.', whyAr: 'Furthermore تضيف ميزة ثانية فيبقى الجانبان متوازنين.' },
      { en: 'Turn: *On the other hand, the costs fall unevenly.*', ar: 'الانتقال إلى الجانب الآخر', why: '*On the other hand* is the hinge — everything after it belongs to the other side.', whyAr: 'On the other hand هي المفصل؛ ما بعدها للجانب الآخر.' },
      { en: 'Disadvantage: *Junior staff lose the informal training that happens beside a desk.*', ar: 'عيب', why: 'A specific disadvantage, matched in weight to the advantages above.', whyAr: 'عيب محدّد يوازن المزايا السابقة في الوزن.' },
      { en: 'Inside one sentence: *Experienced staff thrive at home, *whereas* new graduates struggle.*', ar: 'تضاد داخل الجملة', why: '*whereas* contrasts INSIDE one sentence — a more compact tool than a new paragraph.', whyAr: 'whereas تُضادّ داخل الجملة، وهي أوجز من فقرة جديدة.' },
      { en: '*Despite* the savings, many firms have reversed the policy.', ar: 'despite + اسم', why: '*Despite* takes a NOUN. *Although* would need a full clause after it.', whyAr: 'despite تأخذ اسمًا، و although تحتاج جملة.' },
      { en: 'Verdict: *On balance, the model works — but only for those it was not designed to help.*', ar: 'حكم ينبع من الجسم', why: 'The verdict arrives last and must follow from the body — this one does.', whyAr: 'الحكم يأتي أخيرًا وينبع من الجسم، وهذا كذلك.' },
    ],
    exercises: [
      { q: 'Fix: “Despite he was tired, he finished.”', a: '*Although* he was tired… / *Despite* being tired…' },
      { q: 'Contrast in one sentence: cities are fast; villages are cheap.', a: 'Cities are faster*, whereas* villages are cheaper.' },
      { q: 'Which paragraph holds your opinion?', a: 'Only the *conclusion* — the body stays neutral.' },
      { q: 'Open the second side: you have just listed advantages.', a: '*On the other hand,* / *However,* …' },
      { q: 'Balance check: 4 advantages, 1 disadvantage. Fix.', a: 'Cut to *two each*, or add a second disadvantage.' },
      { q: 'Write a verdict for: tourism in a small town.', a: 'e.g. *On balance, tourism pays the town’s bills and slowly sells its character.*' },
    ],
    reading: {
      title: 'Two Columns', titleAr: 'عمودان',
      passage: [
        'My grandfather made every large decision with a sheet of paper divided down the middle.',
        'On the left he wrote what he would gain; on the right, what it would cost him.',
        'He was strict about not writing in the second column while he was still filling the first, because, he said, a man who argues with himself too early never finishes either list.',
        'Only when both columns were full did he allow himself an opinion, and he wrote it at the bottom in one line.',
        '*Although* he never went to secondary school, he had understood the structure of an argument better than most graduates.',
        'The lists are why the one line at the bottom was usually right.',
      ],
      tip: 'Fill both columns before you decide. That is literally the structure of this essay.',
      tipAr: 'املأ العمودين قبل أن تقرّر — هذا حرفيًا بناء هذا المقال.',
    },
    homework: [
      { en: 'Write a for-and-against essay on remote work', ar: 'اكتب مقال «مع وضدّ» عن العمل عن بُعد' },
      { en: 'Write 5 sentences using *whereas* and *while*', ar: 'اكتب ٥ جمل بـ whereas و while' },
      { en: 'Write 3 pairs: *Although* + clause / *Despite* + noun', ar: 'اكتب ٣ أزواج بـ although و despite' },
    ],
    editing: {
      wrong: [
        'In the one hand it is cheap, in the other hand it is slow.',
        'Despite of the rain, the match was played and I think it was wrong.',
      ],
      correct: [
        '*On the one hand* it is cheap*; on the other hand,* it is slow.',
        '*Despite* the rain, the match was played. — and save your view for the conclusion.',
      ],
    },
  },

  /* ─────────────────────────── 42 · PROBLEM–SOLUTION ─────────────────────────── */
  {
    no: 42, cefr: 'B2', tag: 'Problem–solution', tagAr: 'المشكلة والحلّ',
    title: 'The Problem–Solution Essay',
    titleAr: 'مقال المشكلة والحلّ',
    objectives: [
      { en: 'Define a problem precisely before solving it', ar: 'تحديد المشكلة بدقّة قبل حلّها' },
      { en: 'Propose solutions that match the causes', ar: 'اقتراح حلول تطابق الأسباب' },
      { en: 'Judge each solution honestly', ar: 'تقييم كل حلّ بأمانة' },
      { en: 'Write with the language of cause and remedy', ar: 'الكتابة بلغة السبب والعلاج' },
    ],
    rule: {
      en: 'Four moves: *name the problem* → *name its cause* → *propose a solution that attacks that cause* → *admit its limit*. A solution that does not match the cause you gave is the fastest way to lose a reader.',
      ar: 'أربع حركات: سمِّ المشكلة، ثم سببها، ثم اقترح حلًّا يهاجم ذلك السبب، ثم اعترف بحدوده. والحلّ الذي لا يطابق السبب الذي ذكرته أسرع طريق لخسارة القارئ.',
    },
    explain: {
      intro: 'Most weak answers describe a problem for three paragraphs and then offer “the government should do something”. The strength of this essay is not the size of your solution — it is the *link* between cause and remedy. If you blame traffic on poor public transport, your solution must be about buses, not about fines.',
      introAr: 'أغلب الإجابات الضعيفة تصف المشكلة ثلاث فقرات ثم تقول «على الحكومة أن تفعل شيئًا». وقوّة هذا المقال ليست في حجم الحلّ بل في *الرابط* بين السبب والعلاج: إن نسبت الازدحام إلى ضعف النقل العام فليكن حلّك عن الحافلات لا عن الغرامات.',
      points: [
        { en: 'A problem needs a *who* and a *how much*, not just a name', ar: 'المشكلة تحتاج «مَن» و«كم» لا اسمًا فقط' },
        { en: 'Cause language: *stems from*, *is driven by*, *is largely due to*', ar: 'لغة السبب' },
        { en: 'Solution language: *One way to address this is…*, *A more realistic step would be…*', ar: 'لغة الحلّ' },
        { en: 'Match remedy to cause — that link is the whole essay', ar: 'طابق العلاج مع السبب' },
        { en: 'Admit the limit: *This would not eliminate the problem, but it would…*', ar: 'اعترف بحدود الحلّ' },
        { en: 'Prefer one solution developed deeply to four listed shallowly', ar: 'حلّ واحد معمّق خير من أربعة مسرودة' },
      ],
    },
    examples: [
      { en: 'Problem: *Almost half of graduates in the region leave university unable to write a professional email.*', ar: 'مشكلة محدّدة بالأرقام', why: 'A problem needs a WHO and a HOW MUCH — a name alone is not a problem.', whyAr: 'المشكلة تحتاج «مَن» و«كم»؛ الاسم وحده ليس مشكلة.' },
      { en: 'Cause: *This stems largely from an exam system that rewards memory over production.*', ar: 'سبب', why: '*stems largely from* names the cause — and *largely* keeps you honest.', whyAr: 'stems from تسمّي السبب، و largely تحفظ أمانتك.' },
      { en: 'Solution: *One way to address this is to make every subject assess one piece of writing.*', ar: 'حلّ يطابق السبب', why: 'The solution attacks the cause you just named. That link is the whole essay.', whyAr: 'الحلّ يهاجم السبب الذي ذكرته، وهذا الرابط هو المقال كلّه.' },
      { en: 'Evaluation: *This would not raise standards overnight, but it would make writing unavoidable.*', ar: 'تقييم صادق', why: 'Admitting the limit makes the proposal credible instead of naive.', whyAr: 'الاعتراف بالحدّ يجعل المقترح موثوقًا لا ساذجًا.' },
      { en: 'Cause verb: *Traffic congestion is driven by the absence of a reliable metro.*', ar: 'فعل سببيّ', why: '*is driven by* is a stronger causal verb than *is because of*.', whyAr: 'is driven by فعل سببيّ أقوى من is because of.' },
      { en: 'Realistic step: *A more realistic step would be to subsidise bus fares for students.*', ar: 'خطوة واقعية', why: '*A more realistic step* signals you have considered and rejected the grander option.', whyAr: 'هذه العبارة تُظهر أنك وزنت الخيار الأكبر ورفضته.' },
      { en: '✗ Mismatch: cause = poor transport → solution = higher fines.', ar: 'عدم تطابق بين السبب والحلّ', why: 'Mismatch: fines punish drivers but do not create the transport they lack.', whyAr: 'عدم تطابق: الغرامات تعاقب ولا توفّر النقل الغائب.' },
      { en: '✓ Match: cause = poor transport → solution = more frequent buses.', ar: 'تطابق صحيح', why: 'Match: the remedy touches the same cause, so the argument holds together.', whyAr: 'تطابق: العلاج يمسّ السبب نفسه فتماسكت الحجّة.' },
    ],
    exercises: [
      { q: 'Sharpen: “Unemployment is a problem.”', a: 'e.g. *Youth unemployment in Morocco stands near 30%, and graduates wait an average of two years for a first contract.*' },
      { q: 'Cause verb: “Obesity ___ cheap processed food.”', a: '*is driven by* / *stems largely from*' },
      { q: 'Cause = no libraries. Give a matching solution.', a: 'e.g. *Fund one public library per district* — not “tell children to read more”.' },
      { q: 'Admit a limit for: free bus travel for students.', a: 'e.g. *This would not reduce car use among commuters, but it would change a generation’s habits.*' },
      { q: 'Which is stronger: four listed solutions or one developed?', a: '*One developed* — depth proves thinking.' },
      { q: 'Fix: cause = untrained teachers → solution = new textbooks.', a: 'Match it: *fund a national teacher-training year.*' },
    ],
    reading: {
      title: 'The Broken Step', titleAr: 'الدرجة المكسورة',
      passage: [
        'The stairs at our old school had one broken step, and for three years the answer was a sign telling children to be careful.',
        'Every term someone fell, and every term the sign was replaced with a bigger sign.',
        'The problem was not that children were careless; the problem was that the step was broken.',
        'A new headmaster arrived, read one report, and had it repaired in a morning for the price of the last two signs.',
        'I think of that step whenever I read an essay that blames people for a system.',
        'The cure has to touch the cause, or it is only a larger sign.',
      ],
      tip: 'Ask of every solution you propose: does this touch the cause I named, or only its symptom?',
      tipAr: 'اسأل عن كل حلّ تقترحه: هل يمسّ السبب الذي ذكرته أم عَرَضه فقط؟',
    },
    homework: [
      { en: 'Write a problem–solution essay on youth unemployment', ar: 'اكتب مقال مشكلة وحلّ عن بطالة الشباب' },
      { en: 'For 3 problems, write cause + matching solution', ar: 'لثلاث مشكلات اكتب السبب والحلّ المطابق' },
      { en: 'Write 3 honest limits for your own solutions', ar: 'اكتب ٣ اعترافات بحدود حلولك' },
    ],
    editing: {
      wrong: [
        'The problem of the pollution is very big and the government must do something about it.',
        'The traffic is because many cars so we must to build more roads and this solve everything.',
      ],
      correct: [
        '*Air quality in Casablanca now exceeds WHO limits on most winter days*, *largely because* heating still relies on diesel.',
        'Congestion *stems from* the absence of a metro*; building more roads would attract more cars rather than fewer.*',
      ],
    },
  },

  /* ─────────────────────────── 43 · COUNTER-ARGUMENT ─────────────────────────── */
  {
    no: 43, cefr: 'B2', tag: 'Counter-argument', tagAr: 'الحجّة المضادّة',
    title: 'Concession & Refutation — beating the other side',
    titleAr: 'التنازل والردّ — هزيمة الرأي المخالف',
    objectives: [
      { en: 'State the opposing view fairly', ar: 'عرض الرأي المخالف بإنصاف' },
      { en: 'Concede what is true before you answer', ar: 'الاعتراف بما هو صحيح قبل الردّ' },
      { en: 'Refute with evidence, not volume', ar: 'الردّ بالدليل لا بالصوت' },
      { en: 'Use the concession structures accurately', ar: 'استخدام تراكيب التنازل بدقّة' },
    ],
    rule: {
      en: 'The move is three steps: *Admit* (It is true that…) → *Turn* (However / Nevertheless) → *Answer* (…but the evidence shows…). Refusing to admit anything makes you look afraid of the other side; admitting without turning makes you look defeated.',
      ar: 'ثلاث خطوات: اعترف (صحيح أن…)، ثم انعطف (لكن)، ثم ردّ (…غير أن الأدلة تُظهر…). فرفض الاعتراف يجعلك خائفًا من الخصم، والاعتراف بلا انعطاف يجعلك مهزومًا.',
    },
    explain: {
      intro: 'A reader who disagrees with you is already arguing in their head. If you never name their objection, you lose them silently. Naming it — and granting the part that is true — buys you the right to answer. This single move separates B2 writing from C1 writing more clearly than any grammar point.',
      introAr: 'القارئ المخالف يجادلك في رأسه بالفعل، فإن لم تذكر اعتراضه خسرتَه بصمت. أما أن تذكره وتمنحه ما فيه من صواب فيمنحك حقّ الردّ. وهذه الحركة وحدها تفصل بين كتابة B2 وكتابة C1 أوضح من أي قاعدة نحوية.',
      points: [
        { en: 'Admit: *It is true that…* · *Admittedly, …* · *There is some force in…*', ar: 'صيغ الاعتراف' },
        { en: 'Turn: *However* · *Nevertheless* · *Even so*', ar: 'صيغ الانعطاف' },
        { en: 'Answer: *…but this overlooks…* · *…yet the evidence suggests…*', ar: 'صيغ الردّ' },
        { en: 'Concede a *fact*, never your *position*', ar: 'تنازل عن حقيقة لا عن موقفك' },
        { en: 'One counter-argument done well beats three mentioned', ar: 'حجّة مضادّة واحدة متقنة خير من ثلاث مذكورة' },
        { en: 'Straw man ✗: never weaken their view to win easily', ar: 'لا تُضعف رأي خصمك لتفوز بسهولة' },
      ],
    },
    examples: [
      { en: '*It is true that* online courses are cheaper*. However,* completion rates remain below 10%.', ar: 'اعتراف ثم انعطاف ثم ردّ', why: 'Admit → turn → answer, all in one sentence. This is the move in miniature.', whyAr: 'اعتراف ثم انعطاف ثم ردّ في جملة واحدة: الحركة مصغّرة.' },
      { en: '*Admittedly*, the policy costs money*; even so,* the alternative costs more.', ar: 'admittedly + even so', why: '*Admittedly* concedes a fact; *even so* refuses to concede the position.', whyAr: 'Admittedly تتنازل عن حقيقة، و even so ترفض التنازل عن الموقف.' },
      { en: '*There is some force in* the argument that exams cause stress*, but* removing them shifts the stress to coursework.', ar: 'قوّة في الحجّة ثم ردّ', why: 'Granting *some force* is generous and costs nothing — the answer still wins.', whyAr: 'منح الخصم «شيئًا من القوّة» كرمٌ بلا ثمن، والردّ يفوز.' },
      { en: '*Critics argue that…* *This objection, however, overlooks…*', ar: 'صيغة أكاديمية', why: 'The academic register of the same move, used across research writing.', whyAr: 'الصيغة الأكاديمية للحركة نفسها، شائعة في البحث.' },
      { en: '*While* travel broadens the mind*, it cannot* replace formal study.', ar: 'تنازل داخل جملة واحدة', why: '*While* concedes inside a single sentence — the most compact form available.', whyAr: 'while تتنازل داخل جملة واحدة، وهي أوجز الصيغ.' },
      { en: '*Opponents are right to worry about* cost — *they are wrong about* the timescale.', ar: 'حقّ في شيء وخطأ في آخر', why: 'Splitting right from wrong is fairer than rejecting everything, and more persuasive.', whyAr: 'فصل الصواب عن الخطأ أنصف من الرفض الكامل وأكثر إقناعًا.' },
      { en: '✗ Straw man: *Some people think children should never study at all.*', ar: 'تشويه رأي الخصم', why: 'A straw man wins nothing: nobody holds this view, so defeating it proves nothing.', whyAr: 'تشويه رأي الخصم لا يُكسبك شيئًا؛ لا أحد يقول به.' },
      { en: '✓ Fair: *Some argue that early formal study harms play. This deserves an answer.*', ar: 'عرض منصف', why: 'Stating the objection at its strongest is what earns you the right to answer it.', whyAr: 'عرض الاعتراض بأقوى صوره هو ما يمنحك حقّ الردّ.' },
    ],
    exercises: [
      { q: 'Concede then turn: “Cars pollute.” (you are pro-car in rural areas)', a: '*It is true that* cars pollute*; however,* rural families have no alternative.' },
      { q: 'Fix the straw man: “My opponents want children to be ignorant.”', a: '*My opponents value play over early formal study.*' },
      { q: 'Add a turn: “Admittedly the plan is expensive ___”', a: '*…even so, the cost of inaction is higher.*' },
      { q: 'Which do you concede — a fact or your position?', a: 'A *fact*. Never your position.' },
      { q: 'Answer: “Remote work isolates staff.”', a: 'e.g. *This is real, yet it describes bad management more than remote work itself.*' },
      { q: 'One sentence, both halves: exams and stress.', a: '*While* exams create stress*, they also create the only deadline some students meet.*' },
    ],
    reading: {
      title: 'The Man Who Argued Against Himself', titleAr: 'الرجل الذي جادل نفسه',
      passage: [
        'A teacher of mine used to begin every debate by giving the opposing team their best argument, out loud, better than they had prepared it.',
        'It looked like generosity and it was in fact strategy.',
        '*It was true*, he would say, that his own position had a real cost — and then, having said it first, he owned the rest of the hour.',
        'The other team spent their time proving something already granted.',
        '*Admittedly* this only works if your position can survive an honest hearing of the other one.',
        '*Even so*, I have never seen the trick fail, and I have never seen anyone brave enough to copy it.',
      ],
      tip: 'Naming the objection first takes it away from your opponent. That is the whole technique.',
      tipAr: 'أن تذكر الاعتراض أولًا يعني أن تنتزعه من خصمك — وهذه هي الحيلة كلها.',
    },
    homework: [
      { en: 'Write 5 concession–refutation moves on 5 topics', ar: 'اكتب ٥ حركات تنازل وردّ في ٥ مواضيع' },
      { en: 'Take your last opinion essay and add one counter-argument', ar: 'أضف حجّة مضادّة إلى آخر مقال رأي كتبته' },
      { en: 'Write the strongest version of a view you disagree with', ar: 'اكتب أقوى صيغة لرأي تخالفه' },
    ],
    editing: {
      wrong: [
        'Some people say that it is expensive but they are stupid and wrong.',
        'In spite of it is difficult, we must to do it.',
      ],
      correct: [
        'Some argue that it is expensive*. It is true that the initial cost is high; however, the saving appears within three years.*',
        '*Although it is difficult*, we must do it. / *In spite of the difficulty*, we must do it.',
      ],
    },
  },

  /* ─────────────────────────── 44 · COHESION ─────────────────────────── */
  {
    no: 44, cefr: 'B2', tag: 'Cohesion', tagAr: 'التماسك',
    title: 'Cohesion — making a whole essay hold together',
    titleAr: 'التماسك — أن يتماسك المقال كلّه',
    objectives: [
      { en: 'Link paragraphs, not only sentences', ar: 'ربط الفقرات لا الجمل فقط' },
      { en: 'Use reference words instead of repeating nouns', ar: 'استخدام الإحالة بدل تكرار الأسماء' },
      { en: 'Carry an idea forward with old→new order', ar: 'حمل الفكرة بترتيب المعلوم ثم الجديد' },
      { en: 'Stop over-using linking words', ar: 'التوقّف عن الإفراط في أدوات الربط' },
    ],
    rule: {
      en: 'Cohesion is not a bag of connectors. It is three habits: *reference* (this, such, the latter), *old information first and new information last* in each sentence, and a *topic sentence that echoes the previous paragraph* before it turns.',
      ar: 'التماسك ليس كيسًا من أدوات الربط، بل ثلاث عادات: الإحالة، وتقديم المعلوم وتأخير الجديد في كل جملة، وجملة موضوعية تُصدي الفقرة السابقة قبل أن تنعطف.',
    },
    explain: {
      intro: 'Examiners write “mechanical” beside essays stuffed with *Firstly, Moreover, Furthermore*. Those words are signposts on a road that may not exist. Real cohesion happens *inside* the sentences: each one picks up a word from the one before and carries it a step further. Get that right and you need far fewer connectors.',
      introAr: 'يكتب المصحّحون كلمة «آليّ» بجانب المقالات المحشوّة بـ Firstly و Moreover، فهذه لافتات على طريق قد لا يكون موجودًا. أما التماسك الحقيقي فيحدث *داخل* الجمل: كل جملة تلتقط كلمة من سابقتها وتمضي بها خطوة. أتقن هذا وستحتاج أدوات ربط أقلّ بكثير.',
      points: [
        { en: 'Reference: *this problem*, *such measures*, *the former / the latter*', ar: 'الإحالة: this و such و the former/the latter' },
        { en: 'Old → new: start a sentence with what the reader already knows', ar: 'ابدأ بما يعرفه القارئ وانتهِ بالجديد' },
        { en: 'Echo then turn: *While this solves the cost, it creates a second problem.*', ar: 'صدى ثم انعطاف' },
        { en: 'Vary: not *Firstly / Secondly / Thirdly* down the page', ar: 'نوّع ولا تعدّد آليًا' },
        { en: 'Repeat a key noun on purpose — synonyms can confuse in academic writing', ar: 'كرّر الاسم المفتاح عمدًا؛ المرادفات قد تُربك' },
        { en: 'A paragraph that could be moved anywhere has no cohesion', ar: 'الفقرة التي تصلح لأي مكان لا تماسك فيها' },
      ],
    },
    examples: [
      { en: 'Reference: *Traffic has doubled. This growth has outpaced every plan.*', ar: 'إحالة بـ this + اسم', why: '*This growth* refers back with a NOUN, which is clearer than a bare *this*.', whyAr: 'This growth تُحيل باسم، وهو أوضح من this وحدها.' },
      { en: 'Old→new ✓: *That decision created a second problem.*', ar: 'المعلوم أولًا', why: 'Old information first, new information last — the reader is never disoriented.', whyAr: 'المعلوم أولًا والجديد آخرًا فلا يضلّ القارئ.' },
      { en: 'Old→new ✗: *A second problem was created by that decision.*', ar: 'الجديد أولًا — أضعف', why: 'The same content in the weaker order: the new idea arrives before its anchor.', whyAr: 'المحتوى نفسه بترتيب أضعف؛ الجديد يسبق مرساته.' },
      { en: 'Echo + turn: *These measures reduce cost. They do not, however, reduce risk.*', ar: 'صدى ثم انعطاف', why: 'Echo the previous idea, then turn — that handover IS cohesion.', whyAr: 'صدى الفكرة السابقة ثم الانعطاف؛ هذا التسليم هو التماسك.' },
      { en: '*The former* is cheaper; *the latter* is faster.', ar: 'الأول… والثاني…', why: '*the former* and *the latter* refer back without repeating either noun.', whyAr: 'the former و the latter تُحيلان بلا تكرار.' },
      { en: '*Such policies* rarely survive an election.', ar: 'such + اسم للإحالة', why: '*such* points back at a whole category you have just described.', whyAr: 'such تُحيل إلى فئة كاملة وصفتها للتوّ.' },
      { en: 'Paragraph link: *If cost is the first obstacle, training is the second.*', ar: 'ربط بين فقرتين', why: 'A paragraph opener that names the last idea and the next one in one line.', whyAr: 'جملة افتتاح تذكر الفكرة السابقة والتالية في سطر.' },
      { en: '✗ Overloaded: *Firstly, moreover, in addition, furthermore, finally.*', ar: 'حشو أدوات الربط', why: 'Signposts are not cohesion. Five of them in a row prove nothing is connected.', whyAr: 'اللافتات ليست تماسكًا؛ خمس متتالية دليل على انعدام الترابط.' },
    ],
    exercises: [
      { q: 'Replace the repetition: “Pollution is rising. Pollution harms children.”', a: 'Pollution is rising*, and this rise harms children most.*' },
      { q: 'Reorder old→new: “A new law was introduced by the ministry after the protests.”', a: '*After the protests, the ministry introduced a new law.*' },
      { q: 'Link two paragraphs: para 2 was about cost; para 3 is about training.', a: 'e.g. *If cost is the first obstacle, training is the second.*' },
      { q: 'Use *the latter*: “We could raise taxes or cut services.”', a: '…*The latter* would fall hardest on the poor.' },
      { q: 'Fix: “Firstly… Secondly… Thirdly… Fourthly…”', a: 'Keep one or two; let the ideas carry the order.' },
      { q: 'Reference with *such*: you just described three failing policies.', a: '*Such policies* rarely survive contact with a budget.' },
    ],
    reading: {
      title: 'The Rope, Not the Signposts', titleAr: 'الحبل لا اللافتات',
      passage: [
        'A colleague once showed me two student essays with identical arguments and very different marks.',
        'The weaker one used eleven linking words; the stronger used three.',
        'What the stronger writer had done instead was end each sentence on the word the next sentence would begin with.',
        'That habit pulled the paragraph forward like a rope, and *this rope* is what a reader actually feels.',
        'Signposts tell you a road exists.',
        'A rope means you are already being pulled along it.',
      ],
      tip: 'End a sentence on the idea the next one will open with. That handover is cohesion.',
      tipAr: 'أنهِ الجملة بالفكرة التي ستفتتح بها التالية — هذا التسليم هو التماسك.',
    },
    homework: [
      { en: 'Rewrite an old essay, removing half its linking words', ar: 'أعد كتابة مقال قديم بحذف نصف أدوات الربط' },
      { en: 'Write 5 sentence pairs using old→new order', ar: 'اكتب ٥ أزواج بترتيب المعلوم ثم الجديد' },
      { en: 'Write 4 paragraph-opening links that echo then turn', ar: 'اكتب ٤ جمل افتتاح تُصدي ثم تنعطف' },
    ],
    editing: {
      wrong: [
        'Firstly the cost is high. Moreover the cost is high for families. Furthermore the cost is a problem.',
        'The government introduced the law. The law was introduced because of the protests happened before.',
      ],
      correct: [
        'The cost is high*, and it falls hardest on families who already spend most of their income on rent.*',
        '*After the protests, the government introduced the law.*',
      ],
    },
  },

  /* ═══════════════════ UNIT 11 · STYLE, STANCE & PRECISION (B2 → C1) ═══════════════════ */

  /* ─────────────────────────── 45 · REGISTER ─────────────────────────── */
  {
    no: 45, cefr: 'B2', tag: 'Register', tagAr: 'مستوى اللغة',
    title: 'Register — the same idea in three voices',
    titleAr: 'مستوى اللغة — الفكرة نفسها بثلاثة أصوات',
    objectives: [
      { en: 'Hear the difference between informal, neutral and formal', ar: 'تمييز الودّي والمحايد والرسمي' },
      { en: 'Swap phrasal verbs for single formal verbs', ar: 'استبدال الأفعال المركّبة بأفعال رسمية' },
      { en: 'Keep one register for a whole text', ar: 'الثبات على مستوى واحد في النص كلّه' },
      { en: 'Choose register by reader, not by mood', ar: 'اختيار المستوى حسب القارئ لا حسب المزاج' },
    ],
    rule: {
      en: 'Three dials move together: *vocabulary* (get → receive), *grammar* (contractions, phrasal verbs) and *distance* (I think → it appears that). Move all three or none. A formal sentence with one “kind of” in it collapses.',
      ar: 'ثلاثة مؤشّرات تتحرّك معًا: المفردات، والقواعد (الاختصارات والأفعال المركّبة)، والمسافة. حرّكها جميعًا أو لا تحرّك شيئًا؛ فالجملة الرسمية تنهار بكلمة عامية واحدة.',
    },
    explain: {
      intro: 'Register mistakes rarely break grammar — they break *trust*. A cover letter that says “I really wanna work with you guys” is grammatical and unemployable. Learners over-correct in the other direction too, producing letters so stiff no human wrote them. The skill is choosing a level and staying inside it for every sentence.',
      introAr: 'أخطاء المستوى نادرًا ما تكسر القواعد، لكنها تكسر *الثقة*. فرسالة تقول «أرغب بشدّة في العمل معكم يا رفاق» سليمة نحويًا وغير قابلة للتوظيف. ويبالغ المتعلّمون في الاتجاه الآخر أيضًا فينتجون رسائل متيبّسة لم يكتبها بشر. والمهارة أن تختار مستوى وتبقى داخله في كل جملة.',
      points: [
        { en: 'Formal prefers a single verb: *set up* → *establish* · *find out* → *discover*', ar: 'الرسمي يفضّل الفعل المفرد على المركّب' },
        { en: 'Formal avoids contractions: *don’t* → *do not*', ar: 'الرسمي يتجنّب الاختصارات' },
        { en: 'Formal avoids *get*: get better → *improve* · get money → *obtain funding*', ar: 'الرسمي يتجنّب get' },
        { en: 'Formal adds distance: *I think* → *It appears that* · *arguably*', ar: 'الرسمي يزيد المسافة' },
        { en: 'Neutral is the safe default for most professional email', ar: 'المحايد هو الخيار الآمن لأغلب الإيميلات المهنية' },
        { en: 'Slang, emojis and “!!!” have no formal register at all', ar: 'العامية والرموز وعلامات التعجّب لا مكان لها في الرسمي' },
      ],
    },
    examples: [
      { en: 'Informal: *We need to sort this out fast.*', ar: 'ودّي', why: 'Informal: a phrasal verb (*sort out*) plus a casual adverb. Fine between friends.', whyAr: 'ودّي: فعل مركّب وظرف عاميّ؛ مقبول بين الأصدقاء.' },
      { en: 'Neutral: *We should resolve this quickly.*', ar: 'محايد', why: 'Neutral: a single verb, no slang. This is the safe default for most work email.', whyAr: 'محايد: فعل مفرد بلا عامية، وهو الخيار الآمن لأغلب العمل.' },
      { en: 'Formal: *This matter requires prompt resolution.*', ar: 'رسمي', why: 'Formal: nominalisation (*resolution*) removes the people from the sentence entirely.', whyAr: 'رسمي: التحويل إلى اسم يُخرج الأشخاص من الجملة.' },
      { en: 'get → *receive / obtain* · give → *provide* · ask for → *request*', ar: 'أزواج شائعة', why: 'Formal register prefers one precise verb to a two-word phrasal verb.', whyAr: 'الرسمية تفضّل الفعل المفرد الدقيق على المركّب.' },
      { en: 'go up → *rise / increase* · go down → *fall / decline*', ar: 'الصعود والهبوط', why: 'Movement verbs have formal twins — *rise* and *fall* belong in reports.', whyAr: 'أفعال الحركة لها نظائر رسمية تصلح للتقارير.' },
      { en: 'a lot of → *considerable* · loads of → *substantial*', ar: 'الكمّيات', why: 'Quantities scale up too: *loads of* would break a formal paragraph instantly.', whyAr: 'الكمّيات ترتقي أيضًا؛ العامية منها تكسر الفقرة الرسمية فورًا.' },
      { en: 'Informal: *The thing is, it didn’t work.*', ar: 'ودّي', why: '*The thing is* is spoken English written down — it has no formal equivalent.', whyAr: 'هذه عبارة كلام مكتوب ولا نظير رسمي لها.' },
      { en: 'Formal: *The approach proved unsuccessful.*', ar: 'رسمي', why: 'The formal version states the outcome without the conversational scaffolding.', whyAr: 'الصيغة الرسمية تذكر النتيجة بلا سقالات الكلام.' },
      { en: '✗ Mixed: *We hereby request that you get back to us ASAP.*', ar: 'خلط بين مستويين', why: 'THE common failure: *hereby* and *ASAP* cannot live in the same sentence.', whyAr: 'الخطأ الشائع: لا تجتمع hereby مع ASAP في جملة.' },
    ],
    exercises: [
      { q: 'Formalise: “We found out that the numbers went up a lot.”', a: '*We discovered that the figures rose considerably.*' },
      { q: 'Formalise: “Can you get back to me soon?”', a: '*I would appreciate a reply at your earliest convenience.*' },
      { q: 'Which is out of place: “The committee do not tolerate this kind of stuff.”', a: '*stuff* — use *behaviour* / *conduct*.' },
      { q: 'Make it warmer (neutral): “Your request has been denied.”', a: '*Unfortunately, we are unable to approve your request at this time.*' },
      { q: 'Replace the phrasal verb: “They set up a new company.”', a: 'They *established* a new company.' },
      { q: 'One informal word ruins this: “The results were, like, really good.”', a: 'Remove *like* and *really*: *The results were excellent.*' },
    ],
    reading: {
      title: 'Two Letters', titleAr: 'رسالتان',
      passage: [
        'A cousin of mine applied for the same post twice, two years apart.',
        'The first letter began “Hi guys, I saw your ad and I’m super interested”, and it was never answered.',
        'The second began “Dear Ms Bennani, I am writing to apply for the position of logistics assistant”, and it was.',
        'Nothing about his experience had changed in those two years, and he was, if anything, less qualified than the first time.',
        'What had changed was that he had learned to hear how he sounded to a stranger.',
        'Register is simply the ability to imagine the reader before you imagine yourself.',
      ],
      tip: 'Before sending anything, read the first line as if you were the receiver — a stranger with two hundred emails.',
      tipAr: 'قبل أن ترسل، اقرأ السطر الأول بعين المستقبِل — غريبٌ أمامه مئتا رسالة.',
    },
    homework: [
      { en: 'Write one message in all three registers', ar: 'اكتب رسالة واحدة بالمستويات الثلاثة' },
      { en: 'Formalise 10 phrasal verbs you use often', ar: 'حوّل ١٠ أفعال مركّبة تستعملها إلى رسمية' },
      { en: 'Find one register mistake in something you sent last month', ar: 'اكتشف خطأ مستوى في رسالة أرسلتها' },
    ],
    editing: {
      wrong: [
        'Dear Sir, I wanna know if you got my CV, thanks a lot!!!',
        'We hereby inform you that the stuff you asked for is gonna be late.',
      ],
      correct: [
        'Dear Sir*, I am writing to confirm whether you received my CV. Thank you for your time.*',
        'We *regret to inform you that the materials you requested will be delayed.*',
      ],
    },
  },

  /* ─────────────────────────── 46 · HEDGING ─────────────────────────── */
  {
    no: 46, cefr: 'C1', tag: 'Hedging', tagAr: 'التحوّط',
    title: 'Hedging — claiming carefully and sounding stronger',
    titleAr: 'التحوّط — أن تدّعي بحذر فتبدو أقوى',
    objectives: [
      { en: 'Match the strength of a claim to your evidence', ar: 'مطابقة قوّة الادّعاء لقوّة الدليل' },
      { en: 'Use modal, adverb and verb hedges', ar: 'استخدام التحوّط بالأفعال الناقصة والظروف والأفعال' },
      { en: 'Avoid absolute words that invite a counter-example', ar: 'تجنّب المطلقات التي تستدعي مثالًا مضادًّا' },
      { en: 'Hedge without disappearing', ar: 'التحوّط دون أن يختفي موقفك' },
    ],
    rule: {
      en: 'Never claim more than you can defend. *All students hate exams* dies to one counter-example; *Many students find exams stressful* survives. Hedge with modals (*may, might, tend to*), adverbs (*generally, largely, arguably*) or verbs (*suggest, indicate, appear*).',
      ar: 'لا تدّعِ أكثر مما تستطيع الدفاع عنه. «كل الطلاب يكرهون الامتحانات» تسقط بمثال واحد، أما «كثير من الطلاب يجدونها مرهقة» فتصمد. وتحوّط بالأفعال الناقصة أو الظروف أو الأفعال.',
    },
    explain: {
      intro: 'Beginners think confidence means absolutes. In academic and professional English the opposite is true: the most authoritative writers are the most precise about the *limits* of what they know. A hedged claim is harder to attack, which is exactly why it reads as stronger — you have already conceded the ground your opponent was going to take.',
      introAr: 'يظنّ المبتدئ أن الثقة تعني الإطلاق، والأمر في الإنجليزية الأكاديمية والمهنية عكس ذلك: أكثر الكتّاب سلطةً أدقّهم في تحديد *حدود* ما يعرفون. فالادّعاء المتحوّط أصعب في المهاجمة، ولهذا يُقرأ أقوى: لأنك تنازلتَ سلفًا عن الأرض التي كان خصمك سيأخذها.',
      points: [
        { en: 'Modal: *may*, *might*, *can*, *tend to*, *is likely to*', ar: 'تحوّط بالأفعال الناقصة' },
        { en: 'Adverb: *generally*, *largely*, *arguably*, *to some extent*', ar: 'تحوّط بالظروف' },
        { en: 'Verb: *suggest*, *indicate*, *appear*, *point to*', ar: 'تحوّط بالأفعال' },
        { en: 'Quantity: *most*, *many*, *a significant number* — rarely *all*', ar: 'تحوّط بالكمّيات' },
        { en: 'Attribute: *according to*, *the data suggest* — put the claim on a source', ar: 'أسنِد الادّعاء إلى مصدر' },
        { en: 'Do NOT stack hedges: *It may perhaps possibly be…* ✗ — one is enough', ar: 'لا تُكدّس التحوّط — واحد يكفي' },
      ],
    },
    examples: [
      { en: '✗ *Social media destroys concentration.* → ✓ *Social media appears to erode sustained attention.*', ar: 'من الإطلاق إلى الدقّة', why: '*appears to erode* claims less than *destroys*, and is therefore harder to attack.', whyAr: 'appears to erode تدّعي أقلّ من destroys فيصعب مهاجمتها.' },
      { en: '✗ *Everyone knows that…* → ✓ *It is widely accepted that…*', ar: 'تعميم ← صيغة مقبولة', why: '*Everyone knows* invites one counter-example; *widely accepted* survives it.', whyAr: 'Everyone knows تستدعي مثالًا مضادًّا، والصيغة الأخرى تصمد.' },
      { en: '*The data suggest* a link rather than a cause.', ar: 'الأدلة تشير لا تُثبت', why: '*suggest* reports a link. Only *prove* claims a cause, and data rarely proves.', whyAr: 'suggest تنقل ارتباطًا، و prove وحدها تدّعي سببًا، والبيانات نادرًا ما تُثبت.' },
      { en: 'Students *tend to* underestimate how long writing takes.', ar: 'tend to للميل العام', why: '*tend to* describes a general pattern while admitting the exceptions exist.', whyAr: 'tend to تصف نمطًا عامًّا وتعترف بالاستثناءات.' },
      { en: '*Arguably*, the policy has done more harm than good.', ar: 'arguably للرأي القابل للنقاش', why: '*Arguably* marks the claim as contestable — you own it without overclaiming.', whyAr: 'Arguably تُعلّم الادّعاء بأنه قابل للنقاش دون مبالغة.' },
      { en: '*To some extent*, the criticism is fair.', ar: 'إلى حدٍّ ما', why: '*To some extent* concedes partly, which strengthens whatever you say next.', whyAr: 'To some extent تتنازل جزئيًا فتقوّي ما بعدها.' },
      { en: '*This is likely to* affect younger employees most.', ar: 'is likely to للاحتمال المرجّح', why: '*is likely to* gives a probability rather than a certainty you cannot support.', whyAr: 'is likely to تعطي احتمالًا بدل يقين لا تملك دليله.' },
      { en: '✗ Over-hedged: *It might possibly perhaps be somewhat true.*', ar: 'إفراط في التحوّط', why: 'Stacked hedges cancel each other out — the sentence now claims nothing at all.', whyAr: 'تكديس التحوّط يُلغي بعضه فلا تدّعي الجملة شيئًا.' },
    ],
    exercises: [
      { q: 'Hedge: “Exams cause depression.”', a: '*Exams may contribute to anxiety in some students.*' },
      { q: 'Hedge: “All Moroccans speak French.”', a: '*Many Moroccans speak French, particularly in urban areas.*' },
      { q: 'Attribute it: “Reading improves empathy.”', a: '*Studies suggest that reading fiction improves empathy.*' },
      { q: 'Fix the stacking: “It may perhaps possibly help.”', a: '*It may help.*' },
      { q: 'Strengthen without absolutes: “Maybe it is sometimes a bit useful.”', a: '*It is generally useful.*' },
      { q: 'Which invites a counter-example: “Most” or “All”?', a: '*All* — one exception destroys it.' },
    ],
    reading: {
      title: 'The Word That Saved the Paper', titleAr: 'الكلمة التي أنقذت البحث',
      passage: [
        'A researcher I know had a paper rejected twice, and the second reviewer sent a single line of feedback.',
        'It said that the argument was sound but the verbs were not.',
        'She had written that her results *proved* something; she changed *proved* to *indicate* and the paper was accepted with almost no other edit.',
        'Nothing in the study had changed, and no claim had been weakened in substance.',
        'What changed was that the sentence now described exactly how much she knew.',
        'Confidence, in this language, is measured by precision rather than volume.',
      ],
      tip: 'Ask of every claim: could one counter-example destroy this sentence? If yes, hedge it.',
      tipAr: 'اسأل عن كل ادّعاء: هل يهدمه مثال مضادّ واحد؟ فإن كان كذلك فتحوّط.',
    },
    homework: [
      { en: 'Hedge 10 absolute claims you have written', ar: 'حوّل ١٠ ادّعاءات مطلقة إلى متحوّطة' },
      { en: 'Rewrite one paragraph attributing every claim', ar: 'أعد كتابة فقرة بإسناد كل ادّعاء إلى مصدر' },
      { en: 'Find an over-hedged sentence and cut it to one hedge', ar: 'اكتشف جملة مفرطة في التحوّط واختصرها' },
    ],
    editing: {
      wrong: [
        'Everybody knows that all young people are addicted to their phones and this always destroys their studies.',
        'It may perhaps possibly be somewhat likely that the plan could maybe work.',
      ],
      correct: [
        '*Many young people report using their phones compulsively, and this appears to affect study time.*',
        '*The plan may work.*',
      ],
    },
  },

  /* ─────────────────────────── 47 · NOMINALISATION ─────────────────────────── */
  {
    no: 47, cefr: 'C1', tag: 'Nominalisation', tagAr: 'التحويل إلى أسماء',
    title: 'Nominalisation — turning actions into ideas',
    titleAr: 'التحويل إلى أسماء — من الفعل إلى الفكرة',
    objectives: [
      { en: 'Turn verbs and adjectives into nouns', ar: 'تحويل الأفعال والصفات إلى أسماء' },
      { en: 'Compress two sentences into one noun phrase', ar: 'ضغط جملتين في عبارة اسمية' },
      { en: 'Recognise when it clarifies and when it obscures', ar: 'معرفة متى يُوضّح ومتى يُعتّم' },
      { en: 'Write formal, information-dense sentences', ar: 'كتابة جمل رسمية مكثّفة' },
    ],
    rule: {
      en: 'Make the action a *thing*: *decide* → *the decision* · *fail* → *the failure* · *grow* → *growth*. This lets an action become the subject of a new sentence: “Prices rose. This caused protests.” → “*The rise in prices* caused protests.”',
      ar: 'اجعل الفعل *شيئًا*: decide ← the decision. وهذا يتيح للحدث أن يصير فاعلًا لجملة جديدة: «ارتفعت الأسعار فاحتجّ الناس» ← «تسبّب *ارتفاع الأسعار* في احتجاجات».',
    },
    explain: {
      intro: 'This is the single most visible feature of academic English, and the reason a research abstract sounds different from speech. It compresses: one noun phrase can carry a whole clause, which lets you fit an argument into a sentence. It is also the most abused device in the language — the same trick that makes writing dense makes bureaucratic prose unreadable.',
      introAr: 'هذه أبرز سمة في الإنجليزية الأكاديمية، وسبب اختلاف ملخّص البحث عن الكلام. فهي تضغط: عبارة اسمية واحدة تحمل جملة كاملة، فتتّسع الجملة لحجّة كاملة. وهي أيضًا أكثر الأدوات إساءةَ استعمال: الحيلة نفسها التي تكثّف الكتابة تجعل لغة البيروقراطية غير مقروءة.',
      points: [
        { en: '‑tion: examine → *examination* · introduce → *introduction*', ar: 'لاحقة ‑tion' },
        { en: '‑ment: develop → *development* · improve → *improvement*', ar: 'لاحقة ‑ment' },
        { en: '‑ance/‑ence: perform → *performance* · differ → *difference*', ar: 'لاحقتا ‑ance و‑ence' },
        { en: '‑ity/‑ness from adjectives: able → *ability* · dark → *darkness*', ar: 'من الصفات' },
        { en: 'It lets the ACTION become the subject — that is the whole power', ar: 'تتيح للحدث أن يصير فاعلًا — وهذه قوّتها' },
        { en: 'Too much = fog: prefer a verb when the doer matters', ar: 'الإفراط ضباب — فضّل الفعل حين يهمّ الفاعل' },
      ],
    },
    examples: [
      { en: '*Prices rose sharply. This caused protests.* → *The sharp rise in prices caused protests.*', ar: 'ضغط جملتين في واحدة', why: 'Two sentences become one because the ACTION is now a noun that can be a subject.', whyAr: 'جملتان تصيران واحدة لأن الحدث صار اسمًا يصلح فاعلًا.' },
      { en: '*They decided quickly, and it surprised everyone.* → *Their rapid decision surprised everyone.*', ar: 'الفعل يصير فاعلًا', why: '*Their rapid decision* compresses a whole clause into three words.', whyAr: 'هذه العبارة تضغط جملة كاملة في ثلاث كلمات.' },
      { en: '*Students perform better when they read.* → *Reading improves student performance.*', ar: 'صيغة أكاديمية', why: 'The academic shape: the abstract noun does the work the clause used to do.', whyAr: 'الصيغة الأكاديمية: الاسم المجرّد يؤدّي عمل الجملة.' },
      { en: 'analyse → *analysis* · argue → *argument* · conclude → *conclusion*', ar: 'أزواج شائعة', why: 'The suffix families are worth learning as a set — they are highly regular.', whyAr: 'عائلات اللواحق تُحفظ مجموعةً لأنها منتظمة جدًّا.' },
      { en: 'Academic: *The introduction of the policy led to a marked improvement.*', ar: 'أكاديمي', why: 'Report register: two nominalisations let one sentence carry cause and effect.', whyAr: 'في التقرير: اسمان محوّلان يحملان السبب والنتيجة في جملة.' },
      { en: 'Report: *A reduction in staff turnover followed the pay increase.*', ar: 'تقرير', why: 'Formal, compact, and it names no person — useful, and worth noticing.', whyAr: 'رسمية وموجزة ولا تسمّي أحدًا؛ مفيدة وتستحقّ الانتباه.' },
      { en: '✗ Fog: *The implementation of the utilisation of resources…*', ar: 'ضباب بيروقراطي', why: 'Nominalisation stacked on nominalisation is how prose becomes unreadable.', whyAr: 'تراكم الأسماء المحوّلة هو ما يجعل النثر غير مقروء.' },
      { en: '✓ Clear: *We used the resources better.*', ar: 'واضح', why: 'The cure is a verb and a doer. Ask *who did what* and the fog clears.', whyAr: 'العلاج فعل وفاعل؛ اسأل «من فعل ماذا» ينقشع الضباب.' },
    ],
    exercises: [
      { q: 'Nominalise: “The company grew quickly, which worried rivals.”', a: '*The company’s rapid growth worried rivals.*' },
      { q: 'Nominalise: “They failed to plan, so the project collapsed.”', a: '*A failure to plan caused the project to collapse.*' },
      { q: 'Noun from *decide* · *perform* · *able*', a: '*decision* · *performance* · *ability*' },
      { q: 'Un-fog: “The utilisation of this methodology…”', a: '*Using this method…*' },
      { q: 'Compress: “Teachers were trained. Results improved.”', a: '*Teacher training improved results.*' },
      { q: 'When should you NOT nominalise?', a: 'When the *doer matters* — “the decision was made” hides who decided.' },
    ],
    reading: {
      title: 'The Sentence That Hid a Person', titleAr: 'الجملة التي أخفت إنسانًا',
      passage: [
        'The letter announcing the closure of the factory contained no people at all.',
        'There had been a *review*, followed by a *restructuring*, resulting in a *reduction in headcount* — and every one of those nouns had once been a verb with a person attached to it.',
        'Somebody reviewed. Somebody restructured. Somebody decided that four hundred people would stop being paid in March.',
        '*The transformation of actions into things* is a genuine tool of clear academic writing, and it is also the oldest way of avoiding a name.',
        'Learn it because your reports will need it.',
        'Notice it because your rights may depend on it.',
      ],
      tip: 'Every nominalisation hides a verb, and every verb has a doer. Ask who, and you will know whether the writer wanted you to.',
      tipAr: 'كل اسم محوَّل يُخفي فعلًا، ولكل فعل فاعل. اسأل: مَن؟ لتعرف هل أراد الكاتب أن تعرف.',
    },
    homework: [
      { en: 'Nominalise 10 verbs and use each in a sentence', ar: 'حوّل ١٠ أفعال إلى أسماء واستعمل كلًّا في جملة' },
      { en: 'Compress 5 sentence pairs into one noun phrase each', ar: 'اضغط ٥ أزواج من الجمل في عبارات اسمية' },
      { en: 'Take a bureaucratic sentence and restore its verbs', ar: 'خذ جملة بيروقراطية وأعد إليها أفعالها' },
    ],
    editing: {
      wrong: [
        'The implementation of the improvement of the communication was done by the team.',
        'There was a decrease of the numbers of the students who are attending.',
      ],
      correct: [
        '*The team improved communication.*',
        '*Attendance fell.* / *A fall in attendance followed.*',
      ],
    },
  },

  /* ─────────────────────────── 48 · CLEFT SENTENCES ─────────────────────────── */
  {
    no: 48, cefr: 'C1', tag: 'Cleft sentences', tagAr: 'الجمل المشطورة',
    title: 'Cleft Sentences — putting the spotlight where you want it',
    titleAr: 'الجمل المشطورة — توجيه الضوء حيث تريد',
    objectives: [
      { en: 'Emphasise one part of a sentence deliberately', ar: 'إبراز جزء بعينه من الجملة عمدًا' },
      { en: 'Use *It is … that* and *What … is*', ar: 'استخدام الصيغتين' },
      { en: 'Correct a misunderstanding elegantly', ar: 'تصحيح سوء فهم بأناقة' },
      { en: 'Vary sentence openings in an essay', ar: 'تنويع بدايات الجمل في المقال' },
    ],
    rule: {
      en: 'Split one sentence into two parts so the reader must look where you point. *It-cleft*: “Ahmed broke it” → *It was Ahmed who broke it.* *Wh-cleft*: “We need time” → *What we need is time.* Same facts, different spotlight.',
      ar: 'اشطر الجملة إلى جزأين ليضطرّ القارئ إلى النظر حيث تشير. الصيغة الأولى بـ It was… who، والثانية بـ What… is. الحقائق نفسها والضوء مختلف.',
    },
    explain: {
      intro: 'English has almost no free word order, so it cannot emphasise by moving words the way Arabic can. Instead it builds a small frame around the important part. This is why cleft sentences feel so useful once you meet them: they give you back the emphasis that English grammar otherwise takes away.',
      introAr: 'الإنجليزية لا تكاد تملك حرّية ترتيب الكلمات، فلا تستطيع الإبراز بتقديم الكلمة كما تفعل العربية، فتبني بدل ذلك إطارًا صغيرًا حول الجزء المهمّ. ولهذا تشعر بفائدة الجملة المشطورة فور معرفتها: إنها تُعيد إليك الإبراز الذي سلبته منك القواعد.',
      points: [
        { en: '*It is/was + X + that/who* — spotlight on X', ar: 'الصيغة الأولى: الضوء على X' },
        { en: '*What + clause + is/was* — spotlight on the end', ar: 'الصيغة الثانية: الضوء على النهاية' },
        { en: '*All (that) I want is…* — a narrowing spotlight', ar: 'صيغة التضييق' },
        { en: '*The reason (why) … is that…* — spotlight on the cause', ar: 'الضوء على السبب' },
        { en: 'Perfect for correcting: *It wasn’t me who said that.*', ar: 'مثالية للتصحيح' },
        { en: 'Use sparingly — two per essay is emphasis, six is noise', ar: 'استعملها باعتدال: اثنتان إبراز وستّ ضجيج' },
      ],
    },
    form: {
      affirmative: [
        '*It was* the price *that* changed my mind.',
        '*What* I need *is* more time.',
        '*The reason* he left *is that* nobody listened.',
      ],
      negative: [
        '*It wasn’t* the food *that* was the problem.',
        '*What* she didn’t say *was* more important.',
        '*All* he wanted *was* an apology.',
      ],
      question: [
        '*Was it* you *who* called?',
        '*What is it that* worries you most?',
        '*Is that why* you left?',
      ],
      note: 'Use *who* for people and *that* for everything else, though *that* is acceptable for people in most writing.',
      noteAr: 'استعمل who للأشخاص و that لغيرهم، ويجوز that للأشخاص في أغلب الكتابة.',
    },
    examples: [
      { en: 'Neutral: *Fatima wrote the report.* → *It was Fatima who wrote the report.*', ar: 'الضوء على الفاعل', why: 'The it-cleft moves the spotlight onto the SUBJECT: it was Fatima, not anyone else.', whyAr: 'الصيغة الأولى تضع الضوء على الفاعل: فاطمة لا غيرها.' },
      { en: '*It was the report that Fatima wrote* (not the letter).', ar: 'الضوء على المفعول', why: 'Same frame, different word inside it — now the OBJECT is emphasised.', whyAr: 'الإطار نفسه بكلمة أخرى داخله: الضوء على المفعول.' },
      { en: '*What surprised me was the silence.*', ar: 'الضوء على النهاية', why: 'The wh-cleft saves the important word for the END, where stress naturally falls.', whyAr: 'الصيغة الثانية تؤجّل الكلمة المهمّة إلى النهاية حيث تقع النبرة.' },
      { en: '*What we need is a plan, not another meeting.*', ar: 'مقارنة حادّة', why: 'It also lets you contrast sharply: what we need against what we keep getting.', whyAr: 'وتتيح مقارنة حادّة بين ما نحتاجه وما نُعطاه.' },
      { en: '*All I asked for was a receipt.*', ar: 'تضييق للتأكيد', why: '*All I asked for* narrows the spotlight to almost nothing — that is the effect.', whyAr: 'All I asked for تضيّق الضوء إلى أدنى حدّ، وهذا أثرها.' },
      { en: '*The reason the policy failed is that nobody explained it.*', ar: 'الضوء على السبب', why: '*The reason … is that* puts the CAUSE under the light instead of the event.', whyAr: 'هذه الصيغة تضع السبب تحت الضوء بدل الحدث.' },
      { en: 'Correcting: *It wasn’t the cost that stopped us; it was the timing.*', ar: 'تصحيح أنيق', why: 'Clefts are the natural tool for correcting a misunderstanding politely.', whyAr: 'الجمل المشطورة أداة طبيعية لتصحيح سوء فهم بأدب.' },
      { en: 'Essay: *What this debate ignores is the cost to the poorest households.*', ar: 'مقال: إبراز الإغفال', why: 'In an essay it foregrounds what the opposing argument has quietly left out.', whyAr: 'في المقال تُبرز ما أغفلته الحجّة المخالفة.' },
    ],
    exercises: [
      { q: 'Emphasise “Karim”: “Karim found the mistake.”', a: '*It was Karim who found the mistake.*' },
      { q: 'Emphasise the end: “I want honesty.”', a: '*What I want is honesty.*' },
      { q: 'Correct politely: they think you complained about the price.', a: '*It wasn’t the price that I complained about.*' },
      { q: 'Spotlight the cause: “The plan failed because it was rushed.”', a: '*The reason the plan failed is that it was rushed.*' },
      { q: 'Narrow it: “I only asked for an apology.”', a: '*All I asked for was an apology.*' },
      { q: 'Essay use: emphasise what a debate overlooks.', a: 'e.g. *What this argument overlooks is who pays for it.*' },
    ],
    reading: {
      title: 'It Was Never the Money', titleAr: 'لم يكن المال قطّ',
      passage: [
        'When my brother left his job everyone assumed he had been offered more elsewhere.',
        '*It was not the salary that made him go*, though that is the version the family still prefers.',
        '*What he could not accept was* being asked to sign something he had not read.',
        '*The reason he never explained this is that* explaining it would have named a person.',
        '*All he ever said was* that it had stopped feeling like his work.',
        'Ten years on, *it is that sentence* I still think about whenever I am asked to sign anything quickly.',
      ],
      tip: 'Four clefts, four different spotlights. Rewrite one flat and feel how much emphasis you lose.',
      tipAr: 'أربع جمل مشطورة وأربعة مواضع ضوء. أعد كتابة واحدة عادية لتشعر بحجم ما فقدتَه من الإبراز.',
    },
    homework: [
      { en: 'Write 5 it-clefts correcting a misunderstanding', ar: 'اكتب ٥ جمل مشطورة لتصحيح سوء فهم' },
      { en: 'Write 5 wh-clefts about what you want or need', ar: 'اكتب ٥ جمل بصيغة What… is' },
      { en: 'Add two clefts to an essay you already wrote', ar: 'أضف جملتين مشطورتين إلى مقال كتبته' },
    ],
    editing: {
      wrong: [
        'Is the price what I don’t like it.',
        'What I need is to have more of the time for study.',
        'It is because of he was late that we missed it.',
      ],
      correct: [
        '*It is the price that I don’t like.*',
        '*What I need is more time to study.*',
        '*It was because he was late that we missed it.*',
      ],
    },
  },

  /* ─────────────────────────── 49 · INVERSION ─────────────────────────── */
  {
    no: 49, cefr: 'C1', tag: 'Inversion', tagAr: 'التقديم والتأخير',
    title: 'Inversion for Emphasis — Never have I seen…',
    titleAr: 'القلب للتأكيد — Never have I seen…',
    objectives: [
      { en: 'Invert after a negative or limiting adverb', ar: 'القلب بعد ظرف نفي أو تقييد' },
      { en: 'Build the question word order in a statement', ar: 'استخدام ترتيب السؤال في جملة خبرية' },
      { en: 'Use *Not only… but also* correctly', ar: 'استخدام Not only… but also بدقّة' },
      { en: 'Know when inversion is too much', ar: 'معرفة متى يصير القلب مبالغة' },
    ],
    rule: {
      en: 'Put a negative or limiting adverb first, and the subject and auxiliary swap places — exactly like a question. *I have never seen…* → *Never have I seen…* Triggers: *Never, Rarely, Seldom, Not only, No sooner, Only then, Under no circumstances, Little did…*',
      ar: 'قدّم ظرف النفي أو التقييد فينقلب ترتيب الفاعل والفعل المساعد تمامًا كالسؤال. ومن مُطلِقاته: Never و Rarely و Not only و No sooner و Only then و Little did.',
    },
    explain: {
      intro: 'This is the most theatrical structure in formal English, and the fastest way to sound like a native writer — or, used twice in a paragraph, like someone performing one. It belongs in openings, conclusions and single moments of emphasis. Never in the middle of ordinary description, which is a sentence that has just proved the point.',
      introAr: 'هذا أكثر تراكيب الإنجليزية الرسمية مسرحيةً، وأسرع طريق لتبدو ككاتب أصيل — أو، إن استعملته مرّتين في فقرة، كمن يؤدّي دور كاتب. مكانه المقدّمات والخواتيم ولحظات التأكيد المفردة، لا وسط الوصف العادي.',
      points: [
        { en: '*Never / Rarely / Seldom + auxiliary + subject*', ar: 'بعد ظروف النفي' },
        { en: '*Not only did he… but he also…*', ar: 'صيغة not only' },
        { en: '*No sooner had I… than…* (than, never “when”)', ar: 'No sooner… than' },
        { en: '*Only when / Only after* + clause, THEN invert the main clause', ar: 'Only when: القلب في الجملة الرئيسية' },
        { en: '*Little did I know…* — a fixed dramatic phrase', ar: 'عبارة درامية ثابتة' },
        { en: 'If there is no auxiliary, add *do/does/did*: *Rarely does he complain.*', ar: 'إن لم يوجد فعل مساعد فأضف do/does/did' },
      ],
    },
    form: {
      affirmative: [
        '*Never have I seen* such a response.',
        '*Not only did she apologise*, *but she also* refunded us.',
        '*No sooner had we sat down than* the phone rang.',
      ],
      negative: [
        '*Under no circumstances should* you share the password.',
        '*Rarely does* the committee reject a proposal.',
        '*Little did they know* how much it would cost.',
      ],
      question: [
        '*Have you ever seen* anything like it?',
        '*Did she not only apologise but also pay*?',
        '*Was it only then that* you understood?',
      ],
      note: 'Only the FIRST clause after *Only when…* stays normal; the main clause inverts: “Only when he left *did I understand*.”',
      noteAr: 'بعد Only when تبقى جملة الشرط عادية وينقلب ترتيب الجملة الرئيسية.',
    },
    examples: [
      { en: '*Never have I read* a clearer explanation.', ar: 'لم أقرأ قطّ شرحًا أوضح.', why: 'Negative adverb first → subject and auxiliary swap, exactly like a question.', whyAr: 'ظرف النفي أولًا فينقلب الفاعل والمساعد كالسؤال.' },
      { en: '*Rarely does a policy* survive its first winter.', ar: 'نادرًا ما تصمد سياسة أول شتاء لها.', why: 'No auxiliary in the plain sentence, so *does* is added to carry the inversion.', whyAr: 'لا مساعد في الجملة العادية فتُضاف does لتحمل القلب.' },
      { en: '*Not only is the plan expensive*, *but it is also* slow.', ar: 'ليست الخطة مكلفة فحسب بل بطيئة أيضًا.', why: '*Not only* inverts the FIRST clause; *but … also* completes the pair.', whyAr: 'Not only تقلب الجملة الأولى، و but also تُتمّ الزوج.' },
      { en: '*No sooner had the law passed than* protests began.', ar: 'ما إن صدر القانون حتى بدأت الاحتجاجات.', why: '*No sooner* is always followed by *than* — never by *when*.', whyAr: 'No sooner يتبعها than دائمًا لا when.' },
      { en: '*Only after the report was published did* the minister respond.', ar: 'لم يردّ الوزير إلا بعد نشر التقرير.', why: '*Only after* leaves its own clause normal and inverts the MAIN clause.', whyAr: 'Only after تُبقي جملتها عادية وتقلب الرئيسية.' },
      { en: '*Under no circumstances should* data be shared without consent.', ar: 'لا يجوز بأي حال مشاركة البيانات.', why: 'A formal prohibition — inversion gives regulations their weight.', whyAr: 'تحريم رسمي؛ القلب يمنح اللوائح ثقلها.' },
      { en: '*Little did we know* that the meeting would last four hours.', ar: 'لم نكن ندري أن الاجتماع سيطول.', why: '*Little did* is a fixed dramatic phrase, almost always about hindsight.', whyAr: 'Little did عبارة درامية ثابتة تكاد تكون دائمًا عن إدراك متأخّر.' },
      { en: 'Essay opener: *Seldom has a single technology divided opinion so sharply.*', ar: 'افتتاح مقال', why: 'One inversion at the top of an essay earns attention. Two in a row spend it.', whyAr: 'قلب واحد في افتتاح المقال يكسب الانتباه، واثنان يهدرانه.' },
    ],
    exercises: [
      { q: 'Invert: “I have never heard such nonsense.”', a: '*Never have I heard* such nonsense.' },
      { q: 'Invert: “He rarely admits a mistake.”', a: '*Rarely does he admit* a mistake.' },
      { q: 'Complete: “No sooner had she arrived ___”', a: '…*than* the meeting began. (never *when*)' },
      { q: 'Invert: “She not only wrote it but also designed it.”', a: '*Not only did she write it, but she also designed it.*' },
      { q: 'Fix: “Never I have seen this before.”', a: '*Never have I seen* this before.' },
      { q: 'Essay opener with *Seldom* about AI.', a: 'e.g. *Seldom has a technology arrived with so little agreement about its purpose.*' },
    ],
    reading: {
      title: 'The Night the Power Went', titleAr: 'ليلة انقطاع الكهرباء',
      passage: [
        '*Never had our street been so quiet* as the night the power failed across the whole district.',
        '*No sooner had the lights gone* out *than* doors began opening along the row.',
        '*Not only did* neighbours who had not spoken in years share candles, *but they also* shared dinner on the steps.',
        '*Little did anyone know* that the fault would take two days to repair.',
        '*Only when the electricity returned did* we go back indoors and stop knowing each other.',
        '*Rarely does* a city give you a gift and take it back so precisely.',
      ],
      tip: 'Five inversions in six sentences is deliberately too many — it shows the pattern. In your own writing, use one.',
      tipAr: 'خمس جمل مقلوبة في ستّ مبالغة مقصودة لإظهار النمط؛ أما في كتابتك فاستعمل واحدة.',
    },
    homework: [
      { en: 'Write 6 inverted sentences, one per trigger word', ar: 'اكتب ٦ جمل مقلوبة بمُطلِق مختلف لكل واحدة' },
      { en: 'Rewrite 3 flat sentences from an old essay', ar: 'أعد كتابة ٣ جمل عادية من مقال قديم' },
      { en: 'Write one essay opening using *Seldom* or *Never*', ar: 'اكتب افتتاح مقال بـ Seldom أو Never' },
    ],
    editing: {
      wrong: [
        'Never I saw such a beautiful place before.',
        'No sooner I had arrived when the rain started.',
        'Not only he was late but also he forgot the file.',
      ],
      correct: [
        '*Never had I seen* such a beautiful place before.',
        '*No sooner had I arrived than* the rain started.',
        '*Not only was he late, but he also forgot* the file.',
      ],
    },
  },

  /* ─────────────────────────── 50 · AVOIDING REPETITION ─────────────────────────── */
  {
    no: 50, cefr: 'C1', tag: 'Avoiding repetition', tagAr: 'تجنّب التكرار',
    title: 'Substitution & Ellipsis — saying it once',
    titleAr: 'الاستبدال والحذف — أن تقولها مرّة واحدة',
    objectives: [
      { en: 'Replace a repeated phrase with *one*, *do so*, *so*', ar: 'استبدال العبارة المكرّرة' },
      { en: 'Leave out words the reader can recover', ar: 'حذف ما يستطيع القارئ استعادته' },
      { en: 'Use synonyms without changing meaning', ar: 'استخدام المرادف دون تغيير المعنى' },
      { en: 'Tighten a paragraph by a third', ar: 'تقليص الفقرة بمقدار الثلث' },
    ],
    rule: {
      en: 'English hates repeating a phrase it has just used. Substitute (*one*, *ones*, *do so*, *so*, *such*) or delete entirely (*I wanted to help but I couldn’t [help]*). Arabic tolerates repetition as emphasis; English reads it as clumsiness.',
      ar: 'الإنجليزية تكره تكرار عبارة قالتها للتوّ، فإما أن تستبدل (one و do so و so) أو تحذف تمامًا. والعربية تحتمل التكرار توكيدًا، أما الإنجليزية فتقرؤه ركاكةً.',
    },
    explain: {
      intro: 'This is the invisible skill: nobody notices it when it is done, and everybody notices it when it is missing. Repetition in English signals either emphasis or a limited vocabulary, and readers assume the second. The cure is not synonyms — it is knowing which words can be replaced by a placeholder or removed altogether.',
      introAr: 'هذه مهارة خفيّة: لا يلاحظها أحد إن أُتقنت، ويلاحظها الجميع إن غابت. فالتكرار في الإنجليزية إمّا توكيد أو ضيق حصيلة، والقارئ يفترض الثاني. والعلاج ليس المرادفات، بل معرفة ما يمكن استبداله بضمير نائب أو حذفه تمامًا.',
      points: [
        { en: '*one/ones* replaces a countable noun: the red one', ar: 'one تنوب عن الاسم المعدود' },
        { en: '*do so / do that* replaces a whole verb phrase', ar: 'do so تنوب عن عبارة فعلية كاملة' },
        { en: '*so* after think/hope/believe: *I think so.*', ar: 'so بعد أفعال الظنّ' },
        { en: 'Ellipsis: *She can swim and [she can] dive.*', ar: 'الحذف بعد أدوات العطف' },
        { en: '*such* refers back to a described category', ar: 'such تُحيل إلى فئة موصوفة' },
        { en: 'Repeat a technical term on purpose — precision beats variety', ar: 'كرّر المصطلح التقني عمدًا؛ الدقّة قبل التنويع' },
      ],
    },
    examples: [
      { en: '✗ *I have a blue pen and a red pen.* → ✓ *I have a blue pen and a red one.*', ar: 'استبدال بـ one', why: '*one* stands in for a countable noun already named — no need to repeat it.', whyAr: 'one تنوب عن اسم معدود ذُكر فلا داعي لتكراره.' },
      { en: '✗ *He asked me to sign it, so I signed it.* → ✓ *…so I did so.*', ar: 'استبدال بـ do so', why: '*do so* replaces an entire verb phrase, not just a word.', whyAr: 'do so تنوب عن عبارة فعلية كاملة لا عن كلمة.' },
      { en: '*Will it rain? — I hope not. / I think so.*', ar: 'so و not النائبتان', why: '*so* and *not* stand in for a whole clause after verbs of thinking.', whyAr: 'so و not تنوبان عن جملة كاملة بعد أفعال الظنّ.' },
      { en: 'Ellipsis: *She speaks French and [she speaks] Spanish.*', ar: 'حذف الفعل المكرّر', why: 'Ellipsis deletes what the reader can already supply from the first half.', whyAr: 'الحذف يسقط ما يستطيع القارئ استعادته من الشطر الأول.' },
      { en: 'Ellipsis: *I would help if I could [help].*', ar: 'حذف بعد could', why: 'The repeated verb after *could* disappears, and nothing is lost.', whyAr: 'الفعل المكرّر بعد could يختفي ولا يضيع شيء.' },
      { en: '*Such measures* rarely work. (= the measures just described)', ar: 'إحالة بـ such', why: '*such* refers back to a described category without naming it again.', whyAr: 'such تُحيل إلى فئة موصوفة دون إعادة تسميتها.' },
      { en: 'Essay: *The first policy failed; the second did too.*', ar: 'مقال: حذف واستبدال', why: '*did too* carries the whole verb phrase forward in two words.', whyAr: 'did too تحمل العبارة الفعلية كلّها في كلمتين.' },
      { en: 'Keep the term: in a legal or medical text, repeat *the defendant* — do not vary it.', ar: 'في النص القانوني كرّر المصطلح ولا تنوّعه', why: 'THE exception: in legal or technical text, repeat the term. Precision beats variety.', whyAr: 'الاستثناء: في النصّ القانوني أو التقني كرّر المصطلح؛ الدقّة قبل التنويع.' },
    ],
    exercises: [
      { q: 'Substitute: “I need a bag. I want a small bag.”', a: 'I need a bag — a small *one*.' },
      { q: 'Substitute: “They asked me to wait, so I waited.”', a: '…so I *did so*.' },
      { q: 'Ellipsis: “She can drive and she can ride.”', a: 'She can drive and *ride*.' },
      { q: 'Answer with *so*: “Is he coming?”', a: '*I think so.* / *I hope so.*' },
      { q: 'Use *such*: you just listed three failing policies.', a: '*Such policies* rarely last a full term.' },
      { q: 'When SHOULD you repeat a word?', a: 'When it is a *technical or legal term* — precision outranks variety.' },
    ],
    reading: {
      title: 'The Editor’s Pencil', titleAr: 'قلم المحرّر',
      passage: [
        'The first editor I worked with crossed out roughly a third of every page and never added a word.',
        'She would circle a phrase, find where it had appeared two lines earlier, and draw a line between the two.',
        'I asked her once for a rule and she said there wasn’t one; you simply stop saying things the reader is still holding.',
        'Where I had written “the second proposal was rejected as the first proposal had been rejected”, she left “the second was rejected too”.',
        'It said everything mine had said, and it did so in seven words.',
        'I have never written a page since without hearing that pencil.',
      ],
      tip: 'Find any phrase repeated within three lines. One of the two can almost always go.',
      tipAr: 'ابحث عن عبارة تكرّرت خلال ثلاثة أسطر، فإحداهما تكاد تكون قابلة للحذف دائمًا.',
    },
    homework: [
      { en: 'Cut a page of your writing by one third without losing meaning', ar: 'اختصر صفحة من كتابتك ثلثًا دون فقد المعنى' },
      { en: 'Write 5 sentences using *one*, *do so*, *so*, *such*', ar: 'اكتب ٥ جمل بأدوات الاستبدال' },
      { en: 'Find 3 repetitions in an old essay and fix them', ar: 'اكتشف ٣ تكرارات في مقال قديم وصحّحها' },
    ],
    editing: {
      wrong: [
        'I bought a new phone because my old phone was broken and the new phone is faster.',
        'He said he will come and I hope that he will come.',
      ],
      correct: [
        'I bought a new phone because my old *one* was broken*, and it is faster.*',
        'He said he *would* come*, and I hope so.*',
      ],
    },
  },

  /* ─────────────────────────── 51 · PRECISION & COLLOCATION ─────────────────────────── */
  {
    no: 51, cefr: 'C1', tag: 'Precision', tagAr: 'الدقّة',
    title: 'Precision — collocation and the exact word',
    titleAr: 'الدقّة — المتلازمات والكلمة المضبوطة',
    objectives: [
      { en: 'Choose words that habitually go together', ar: 'اختيار الكلمات التي تتلازم عادةً' },
      { en: 'Replace vague verbs with exact ones', ar: 'استبدال الأفعال الغامضة بأخرى دقيقة' },
      { en: 'Avoid dictionary synonyms that break collocation', ar: 'تجنّب مرادفات القاموس التي تكسر التلازم' },
      { en: 'Cut empty intensifiers', ar: 'حذف المؤكّدات الفارغة' },
    ],
    rule: {
      en: 'Words keep company. You *make* a decision but *do* your homework; rain is *heavy*, not *strong*; a mistake is *serious*, not *big*. A synonym that is correct in meaning can still be wrong in company — and that is what marks a non-native sentence.',
      ar: 'الكلمات تُصاحب بعضها: نقول make a decision لا do a decision، والمطر heavy لا strong، والخطأ serious لا big. فالمرادف الصحيح في المعنى قد يكون خاطئًا في الصحبة، وهذا ما يكشف الجملة غير الأصيلة.',
    },
    explain: {
      intro: 'By C1 your grammar is rarely the problem. What still marks the writing is word partnership: every language pairs its words by habit, not by logic, and no rule predicts them. This is why reading matters more than studying at this level — collocation is absorbed, not derived.',
      introAr: 'عند مستوى C1 نادرًا ما تكون القواعد هي المشكلة؛ ما يكشف الكتابة هو تلازم الألفاظ: فكل لغة تُزاوج كلماتها بالعادة لا بالمنطق، ولا قاعدة تتنبّأ بها. ولهذا تصير القراءة في هذا المستوى أهمّ من الدراسة، لأن التلازم يُكتسَب ولا يُستنتَج.',
      points: [
        { en: '*make* a decision / a mistake / progress · *do* homework / research / business', ar: 'الفرق بين make و do' },
        { en: 'strong: coffee, wind, argument · heavy: rain, traffic, meal', ar: 'strong مقابل heavy' },
        { en: 'Replace *very + weak adjective*: very big → *enormous*', ar: 'استبدل very + صفة ضعيفة بصفة قويّة' },
        { en: 'Exact verbs: *rise, soar, plummet, decline* beat *go up/down*', ar: 'أفعال دقيقة للحركة' },
        { en: '*a serious mistake* ✓ · *a big mistake* (informal) · *a large mistake* ✗', ar: 'درجات وصف الخطأ' },
        { en: 'When unsure, choose the plain word — a wrong fancy word costs more', ar: 'عند الشكّ اختر الكلمة البسيطة؛ الفخمة الخاطئة أغلى ثمنًا' },
      ],
    },
    examples: [
      { en: '*make* a decision · *take* a decision (UK, formal) · ✗ *do* a decision', ar: 'قرار', why: '*make* a decision is fixed. *do* a decision is grammatical and simply not English.', whyAr: 'make a decision تلازم ثابت، و do a decision سليمة نحويًا وليست إنجليزية.' },
      { en: '*heavy* rain · *heavy* traffic · ✗ *strong* rain', ar: 'المطر والزحام', why: '*heavy* is the partner of rain and traffic — *strong* belongs elsewhere.', whyAr: 'heavy رفيقة المطر والزحام، و strong لغيرهما.' },
      { en: '*strong* coffee · *strong* argument · ✗ *powerful* coffee', ar: 'القهوة والحجّة', why: '*strong* partners coffee and arguments. The meaning overlaps; the company does not.', whyAr: 'strong ترافق القهوة والحجّة؛ المعنى يتقاطع والصحبة لا.' },
      { en: '*Prices soared* (sharp rise) · *Prices edged up* (small rise)', ar: 'دقّة وصف الارتفاع', why: 'Precise verbs carry the SIZE of the change without needing an adverb.', whyAr: 'الأفعال الدقيقة تحمل حجم التغيّر بلا ظرف.' },
      { en: '*Sales plummeted* beats *sales went down a lot*.', ar: 'الهبوط الحادّ', why: 'One exact verb replaces four vague words and reads as more authoritative.', whyAr: 'فعل دقيق واحد يحلّ محلّ أربع كلمات غامضة ويبدو أقوى سلطةً.' },
      { en: '*a serious concern* · *a growing concern* · ✗ *a big concern* (in formal text)', ar: 'وصف القلق', why: '*serious* is the formal partner of *concern*; *big* belongs in speech.', whyAr: 'serious رفيقة concern في الرسمي، و big للكلام.' },
      { en: '*conduct* research · *reach* a conclusion · *meet* a deadline', ar: 'متلازمات أكاديمية', why: 'Academic collocations are fixed pairs — learn them as pairs, not as single words.', whyAr: 'المتلازمات الأكاديمية أزواج ثابتة تُحفظ أزواجًا لا كلماتٍ مفردة.' },
      { en: '✗ *I did a big effort.* → ✓ *I made a considerable effort.*', ar: 'تصحيح تلازم', why: 'The corrected version fixes the partnership, not the grammar. Nothing was ungrammatical.', whyAr: 'التصحيح أصلح الصحبة لا القواعد؛ لم يكن ثمّة خطأ نحويّ.' },
    ],
    exercises: [
      { q: 'make or do? “___ a decision” · “___ research”', a: '*make* a decision · *do/conduct* research' },
      { q: 'Fix: “There was a strong rain yesterday.”', a: '*heavy* rain' },
      { q: 'One word for “went up very quickly”:', a: '*soared* / *surged*' },
      { q: 'Fix: “It was a very big mistake.” (formal)', a: 'It was a *serious* mistake.' },
      { q: 'Collocate: “___ a deadline” · “___ a conclusion”', a: '*meet* a deadline · *reach* a conclusion' },
      { q: 'Why is “powerful coffee” wrong if powerful means strong?', a: 'Meaning is right, *company* is wrong — collocation is habit, not logic.' },
    ],
    reading: {
      title: 'The Almost-Right Word', titleAr: 'الكلمة التي كادت تكون صحيحة',
      passage: [
        'A student of mine once described a rainstorm as “strong” and a coffee as “heavy”, and every word in both sentences was in the dictionary.',
        'He had swapped two adjectives that mean roughly the same thing and produced two sentences no English speaker would write.',
        'When I explained, he asked me for the rule.',
        'There is no rule; there is only company, and company is learned by keeping it.',
        'I told him to read forty pages a week and stop translating adjectives, and within a year the problem had quietly disappeared.',
        'The difference between the almost-right word and the right word, as Mark Twain said, is the difference between the lightning bug and the lightning.',
      ],
      tip: 'When a sentence feels slightly foreign but you cannot find the error, suspect collocation before grammar.',
      tipAr: 'إذا شعرتَ أن الجملة غريبة قليلًا ولم تجد الخطأ فاتّهم التلازم قبل القواعد.',
    },
    homework: [
      { en: 'Learn 15 collocations with *make*, *do*, *take*', ar: 'تعلّم ١٥ تلازمًا مع make و do و take' },
      { en: 'Replace 10 “very + adjective” pairs with one strong word', ar: 'استبدل ١٠ عبارات very + صفة بكلمة قويّة' },
      { en: 'Rewrite a paragraph using exact movement verbs', ar: 'أعد كتابة فقرة بأفعال حركة دقيقة' },
    ],
    editing: {
      wrong: [
        'I did a big mistake in the exam and I felt very very bad.',
        'The traffic was very strong so we did a decision to walk.',
      ],
      correct: [
        'I *made a serious mistake* in the exam and felt *dreadful*.',
        'The traffic was *heavy*, so we *made a decision* to walk.',
      ],
    },
  },

  /* ─────────────────────────── 52 · SUMMARISING ─────────────────────────── */
  {
    no: 52, cefr: 'C1', tag: 'Summarising', tagAr: 'التلخيص وإعادة الصياغة',
    title: 'Summarising & Paraphrasing — using a source honestly',
    titleAr: 'التلخيص وإعادة الصياغة — استعمال المصدر بأمانة',
    objectives: [
      { en: 'Reduce a text to its argument, not its words', ar: 'ردّ النص إلى حجّته لا إلى ألفاظه' },
      { en: 'Paraphrase by changing structure, not just synonyms', ar: 'إعادة الصياغة بتغيير البناء لا المرادفات' },
      { en: 'Attribute a source accurately', ar: 'إسناد المصدر بدقّة' },
      { en: 'Avoid accidental plagiarism', ar: 'تجنّب الانتحال غير المقصود' },
    ],
    rule: {
      en: 'A summary keeps the *argument* and drops the examples. A paraphrase keeps the *meaning* and changes the structure — swapping synonyms while keeping the sentence shape is not paraphrase, it is plagiarism with a thesaurus. Always name the source.',
      ar: 'التلخيص يحتفظ بالحجّة ويحذف الأمثلة، وإعادة الصياغة تحتفظ بالمعنى وتغيّر البناء. أما تبديل المرادفات مع بقاء شكل الجملة فليس إعادة صياغة بل انتحال بمعجم. وسمِّ المصدر دائمًا.',
    },
    explain: {
      intro: 'This is the skill every exam and every workplace assumes you have. A summary proves you understood; a paraphrase proves you can think in the idea rather than in its wording. The reliable method is mechanical: read, close the text, write from memory, then check. If you can see the original while you write, you will copy its shape without meaning to.',
      introAr: 'هذه مهارة يفترض كل امتحان وكل عمل أنك تملكها. فالتلخيص يُثبت أنك فهمت، وإعادة الصياغة تُثبت أنك تفكّر داخل الفكرة لا داخل ألفاظها. والطريقة المضمونة آليّة: اقرأ، ثم أغلق النص، ثم اكتب من الذاكرة، ثم راجع. فإن بقي الأصل أمام عينيك نسختَ بناءه دون أن تقصد.',
      points: [
        { en: 'Summary = the claim + the main reasons. Cut every example.', ar: 'التلخيص: الادّعاء والأسباب، وتُحذف الأمثلة' },
        { en: 'Aim for one third of the original, or less', ar: 'استهدف ثلث الأصل أو أقلّ' },
        { en: 'Paraphrase: change word class and sentence order, not just words', ar: 'غيّر نوع الكلمة وترتيب الجملة لا الكلمات فقط' },
        { en: 'Close the book. Write from memory. Then compare.', ar: 'أغلق النص واكتب من الذاكرة ثم قارن' },
        { en: 'Attribute: *According to X…* · *X argues that…*', ar: 'صيغ الإسناد' },
        { en: 'Keep technical terms unchanged — you may not paraphrase *photosynthesis*', ar: 'أبقِ المصطلحات التقنية كما هي' },
      ],
    },
    examples: [
      { en: 'Original: *The study found that students who read for pleasure outperformed their peers in writing tests.*', ar: 'النصّ الأصلي', why: 'The original. Read it, then close it — that is the whole method in two steps.', whyAr: 'النصّ الأصلي: اقرأه ثم أغلقه؛ هذه هي الطريقة كلّها.' },
      { en: '✗ Synonym-swap: *The research discovered that pupils who read for enjoyment did better than their classmates in writing exams.*', ar: 'تبديل مرادفات — ليس إعادة صياغة', why: 'Every word was swapped and the STRUCTURE was kept — that is plagiarism with a thesaurus.', whyAr: 'بُدّلت الكلمات وبقي البناء؛ هذا انتحال بمعجم.' },
      { en: '✓ Paraphrase: *According to the study, voluntary reading was associated with stronger writing performance.*', ar: 'إعادة صياغة حقيقية: بناء مختلف', why: 'The real paraphrase changes the shape: attribution first, nominalisation, new order.', whyAr: 'إعادة الصياغة الحقيقية تغيّر الشكل: إسناد ثم تحويل ثم ترتيب جديد.' },
      { en: 'Summary verb: *argues, claims, demonstrates, concludes, warns*', ar: 'أفعال التلخيص', why: 'The reporting verb carries your judgement of the source before its content arrives.', whyAr: 'الفعل الناقل يحمل حكمك على المصدر قبل وصول محتواه.' },
      { en: '*According to Ahmed (2023), the policy failed for administrative reasons.*', ar: 'إسناد بالاسم والسنة', why: 'Naming the source and the year is what separates a summary from a claim of your own.', whyAr: 'ذكر المصدر والسنة يفصل الملخّص عن ادّعائك أنت.' },
      { en: '*The author concludes that reform is unlikely without funding.*', ar: 'خاتمة الملخّص', why: '*concludes* signals you have reached the END of the source, not a middle point.', whyAr: 'concludes تدلّ على أنك بلغت خاتمة المصدر لا وسطه.' },
      { en: 'Nominalise to compress: *Prices rose and people protested* → *The price rise triggered protests.*', ar: 'الضغط بالتحويل إلى أسماء', why: 'Nominalisation is the compression tool a summary runs on.', whyAr: 'التحويل إلى أسماء هو أداة الضغط التي يقوم عليها التلخيص.' },
      { en: 'Keep unchanged: *photosynthesis*, *inflation*, *the passive voice*.', ar: 'مصطلحات لا تُغيَّر', why: 'Technical terms must survive unchanged — paraphrasing them destroys the meaning.', whyAr: 'المصطلحات التقنية تبقى كما هي؛ إعادة صياغتها تُفسد المعنى.' },
    ],
    exercises: [
      { q: 'Summarise in one line: an essay arguing schools should teach cooking because diet-related illness is rising.', a: 'e.g. *The author argues that schools should teach cooking to combat rising diet-related illness.*' },
      { q: 'Is swapping synonyms a paraphrase?', a: 'No — you must change the *structure* too, or it is plagiarism.' },
      { q: 'Paraphrase: “Many students struggle to organise their ideas.”', a: 'e.g. *Organisation, rather than grammar, is the main obstacle for many learners.*' },
      { q: 'Add attribution: “Reading improves vocabulary.”', a: '*According to the study, reading improves vocabulary.*' },
      { q: 'What is the reliable method?', a: 'Read → *close the text* → write from memory → compare.' },
      { q: 'How long should a summary be?', a: 'About *one third* of the original or less.' },
    ],
    reading: {
      title: 'What I Could Still Remember', titleAr: 'ما بقي في ذاكرتي',
      passage: [
        'At university a tutor banned us from writing summaries with the book open.',
        'We complained that we would forget the details, and she said that was precisely the point.',
        'What survives an hour in your memory, she told us, is the argument; what disappears is the decoration.',
        'The first summary I wrote that way was a third the length of my usual ones and the first that received a comment rather than a correction.',
        'I still cannot write a paraphrase with the original in front of me without stealing its rhythm.',
        'Neither, I suspect, can anyone else — they simply do not notice that they have.',
      ],
      tip: 'If your paraphrase follows the original sentence by sentence, you copied its structure. Close the text and start again.',
      tipAr: 'إن سارت إعادة صياغتك جملةً بجملة مع الأصل فقد نسختَ بناءه. أغلق النص وابدأ من جديد.',
    },
    homework: [
      { en: 'Summarise a 300-word article in 60 words', ar: 'لخّص مقالًا من ٣٠٠ كلمة في ٦٠' },
      { en: 'Paraphrase 5 sentences by changing structure', ar: 'أعد صياغة ٥ جمل بتغيير البناء' },
      { en: 'Summarise one lesson of this course from memory', ar: 'لخّص أحد دروس هذه الدورة من ذاكرتك' },
    ],
    editing: {
      wrong: [
        'The writer say that the pollution is bad and he give many examples about the cars and the factories and the rubbish.',
        'According to the article, it says that the situation is very bad situation.',
      ],
      correct: [
        'The writer *argues* that vehicle and industrial emissions are the principal sources of urban pollution.',
        'According to the article, *conditions have deteriorated sharply.*',
      ],
    },
  },

]
