import { ex, page, type BacPage } from './bac-helpers.ts'

/** The pack's first page (the exam at a glance) and the two reading pages. */
export const BAC_START: BacPage[] = [
  page('start', 'Start', 'The exam at a glance', 'الامتحان الوطني باختصار', [
    { t: 'banner', title: 'Your Bac English Pack', icons: ['🎓', '📝'] },
    { t: 'bullets', box: true, items: [
      'هذا الكتاب يرافقك خطوة بخطوة نحو امتحان الإنجليزية في الباكالوريا، لكل الشعب.',
      'كل درس في صفحة واحدة: القاعدة، أمثلة، ثم تمرين. الأجوبة كلها في آخر الكتاب.',
      'في النهاية تجد 5 امتحانات تجريبية بنفس شكل الامتحان الوطني، لتتدرّب في ظروف حقيقية.',
    ] },
    { t: 'bar', title: 'The national exam - مكونات الامتحان' },
    { t: 'grid', rows: [
      { dark: true, span: [3, 5, 1], cells: ['Part', 'What you do', 'Points'] },
      { span: [3, 5, 1], cells: ['I. Reading comprehension', 'Read a text and answer questions about it', '15'] },
      { span: [3, 5, 1], cells: ['II. Language', 'Vocabulary, grammar and communicative functions', '15'] },
      { span: [3, 5, 1], cells: ['III. Writing', 'Write one text: an essay, an email, an article…', '10'] },
      { dark: true, span: [3, 5, 1], cells: ['Total', 'Your points ÷ 2 = your mark out of 20', '40'] },
    ] },
    { t: 'callout', text: 'الشكل نفسه تقريبًا في كل الشعب؛ شعبة الآداب تأخذ نصوصًا أطول ومعاملًا أكبر. تحقّق دائمًا من مدة الامتحان في استدعائك.' },
    { t: 'bar', title: 'How to use this pack - طريقة الاستعمال' },
    { t: 'bullets', cols: 2, items: [
      'Revise one page a day. - راجع صفحة واحدة كل يوم.',
      'Do the exercise before you look at the key. - أنجز التمرين قبل أن تنظر إلى الحل.',
      'Keep a notebook of your mistakes. - دوّن أخطاءك في دفتر خاص.',
      'Learn 10 new words a day. - احفظ 10 كلمات جديدة يوميًا.',
      'Write one paragraph every week. - اكتب فقرة واحدة كل أسبوع.',
      'Do a mock exam every two weeks. - أنجز امتحانًا تجريبيًا كل أسبوعين.',
    ] },
    { t: 'bar', title: 'On exam day - يوم الامتحان' },
    { t: 'bullets', cols: 2, items: [
      'Read all the questions first. - اقرأ كل الأسئلة أولًا.',
      'Start with the part you know best. - ابدأ بالجزء الذي تتقنه.',
      'Keep about 30 minutes for writing. - خصّص حوالي 30 دقيقة للكتابة.',
      'Answer every question; never leave a blank. - أجب عن كل سؤال ولا تترك فراغًا.',
      'Write clearly and check your spelling. - اكتب بخط واضح وراجع الإملاء.',
      'Use the last 10 minutes to check. - استعمل آخر 10 دقائق للمراجعة.',
    ] },
  ]),
]

export const BAC_READING: BacPage[] = [
  page('reading', 'Reading 1', 'Reading strategies', 'استراتيجيات فهم النص', [
    { t: 'banner', title: 'Reading Comprehension', icons: ['📖', '🔍'] },
    { t: 'bar', title: 'The six question types - أنواع الأسئلة' },
    { t: 'boxes', cols: 2, items: [
      { title: '1. True or false + justify', lines: ['Find the sentence in the text that proves your answer.', 'Copy only the words that prove it.', 'Example: F – "only 30% of the students…"'] },
      { title: '2. Answer the questions', lines: ['Use your own words when you can.', 'Answer in a full, short sentence.', 'One question = one idea from the text.'] },
      { title: '3. Find words / synonyms', lines: ['Look only in the paragraph given (§2).', 'Same part of speech: a verb for a verb.', 'Opposites: increase ≠ decrease.'] },
      { title: '4. Reference words', lines: ['it, they, them, this, which, who… point back.', 'Read the sentence before the word.', 'Write the exact words they refer to.'] },
      { title: '5. Main idea / best title', lines: ['Read the first and last paragraphs again.', 'Choose the most general idea.', 'A detail is never the main idea.'] },
      { title: '6. Complete the table', lines: ['Scan for names, numbers and dates.', 'Copy carefully and spell correctly.', 'Keep the form the table asks for.'] },
    ] },
    { t: 'bar', title: 'Skim and scan - طريقتان للقراءة' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'bullets', box: true, heading: 'Skimming 🏃', items: ['Read fast to get the general idea.', 'Look at the title, the first lines and the last paragraph.', 'Use it for the "main idea" question.'] }],
      [{ t: 'bullets', box: true, heading: 'Scanning 🔦', items: ['Look quickly for one piece of information.', 'Names, numbers, dates, key words.', 'Use it for "true or false" and the table.'] }],
    ] },
    { t: 'callout', text: 'لا تترجم النص كلمة بكلمة. اقرأ السؤال أولًا، ثم ابحث عن الجواب في الفقرة المناسبة.' },
  ]),

  page('reading', 'Reading 2', 'Reading practice: Learning online', 'تطبيق: التعلّم عبر الإنترنت', [
    { t: 'text', label: 'Text - Learning online', size: 13.5, body:
      'Learning online is no longer a dream for Moroccan students. Ten years ago, very few families had a computer at home, and the internet was slow and expensive. Today, most young people own a smartphone, and many of them use it to study. They watch video lessons, download exercises and ask their teachers questions on messaging apps.\n'
      + 'Online learning has clear advantages. Students can study at their own pace and repeat a lesson as many times as they need. It also helps learners who live far from big cities, where good schools and private lessons are hard to find. Moreover, many courses are free, which makes education more equal.\n'
      + 'However, studying alone in front of a screen is not easy. Some students find it difficult to stay motivated without a teacher in the room. Others spend hours on social media instead of doing their homework. Experts also warn that too much screen time can affect sleep and concentration.\n'
      + 'For these reasons, many educators believe that the future is "blended learning", which combines classes at school with online practice at home. In this way, students can enjoy the best of both worlds.' },
    ex('True or false? Justify.', 'Write T or F and copy the words from the text that prove it.', [
      ['Ten years ago, most families had a computer at home.', 'F – "very few families had a computer at home"'],
      ['Online learning can help students in rural areas.', 'T – "It also helps learners who live far from big cities"'],
      ['All online courses are expensive.', 'F – "many courses are free"'],
      ['Some students waste time on social media.', 'T – "Others spend hours on social media instead of doing their homework."'],
    ], { lines: true }),
    ex('Answer the questions.', '', [
      ['What do students use their smartphones for?', 'They watch video lessons, download exercises and ask their teachers questions.'],
      ['Why does online learning make education more equal?', 'Because many courses are free.'],
      ['What is "blended learning"?', 'It combines classes at school with online practice at home.'],
    ], { lines: true }),
    { t: 'row', widths: '1fr 1fr', blocks: [
      [ex('Find words in the text.', '', [
        ['costly (§1) = ___', 'expensive'],
        ['speed (§2) = ___', 'pace'],
        ['specialists (§3) = ___', 'experts'],
        ['mixes (§4) = ___', 'combines'],
      ])],
      [ex('What do these words refer to?', '', [
        ['"them" (§1) → ___', 'young people'],
        ['"which" (§2) → ___', 'the fact that many courses are free'],
        ['"Others" (§3) → ___', 'other students'],
        ['The best title for the text is:', 'b) Online learning: benefits and limits', ['The end of schools', 'Online learning: benefits and limits', 'Smartphones are dangerous']],
      ])],
    ] },
  ]),
]
