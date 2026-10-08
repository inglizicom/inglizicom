import { ex, page, type BacPage } from './bac-helpers.ts'

/**
 * Writing: how an essay is built, letters and emails, three model texts and a
 * page of practice topics. Writing has no fixed answers: the one exercise (the
 * essay plan) is open, so it stays out of the keys; the checklist plays that role.
 */

const W = (n: number) => `Writing ${n}`

export const BAC_WRITING: BacPage[] = [
  page('writing', W(1), 'How to write an essay', 'كيف تكتب موضوعًا إنشائيًا', [
    { t: 'banner', title: 'The essay - الموضوع الإنشائي', icons: ['✍️', '🧱'] },
    { t: 'grid', rows: [
      { dark: true, span: [2, 5, 5], cells: ['Part', 'What it does', 'Useful start'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Introduction', 'Present the topic in 2–3 sentences and give your opinion (thesis).', 'Nowadays, … has become a hot issue. In my opinion, …'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Body 1', 'First idea + explanation + example.', 'First of all, … For example, …'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Body 2', 'Second idea (or the other side) + example.', 'Moreover, … / On the other hand, …'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Conclusion', 'Sum up and repeat your opinion in new words.', 'To sum up, … / All in all, …'] },
    ] },
    { t: 'bar', title: 'Five steps in 30 minutes - خمس خطوات' },
    { t: 'bullets', cols: 1, size: 12.5, items: [
      '1. Read the topic twice and underline the key words. (2 min) - اقرأ الموضوع مرتين وسطّر الكلمات المفتاح.',
      '2. Brainstorm: write 4–6 ideas in a list. (5 min) - اكتب أفكارك في لائحة.',
      '3. Choose the best 2 or 3 ideas and order them. (3 min) - اختر أفضل الأفكار ورتّبها.',
      '4. Write: one paragraph for each part. (15 min) - اكتب فقرة لكل جزء.',
      '5. Check grammar, spelling and punctuation. (5 min) - راجع القواعد والإملاء وعلامات الترقيم.',
    ] },
    { t: 'bar', title: 'Useful phrases - عبارات مفيدة' },
    { t: 'grid', rows: [
      { dark: true, cells: ['Ordering', 'Adding', 'Contrasting', 'Giving examples', 'Concluding'] },
      { size: 11, cells: ['First of all', 'Moreover', 'However', 'For example', 'To sum up'] },
      { size: 11, cells: ['Secondly', 'Furthermore', 'On the other hand', 'For instance', 'In conclusion'] },
      { size: 11, cells: ['Finally', 'In addition', 'Although', 'such as', 'All in all'] },
    ] },
    { t: 'callout', text: 'الامتحان يطلب غالبًا 150 إلى 200 كلمة تقريبًا. فقرات واضحة وجمل قصيرة صحيحة أفضل من جمل طويلة مليئة بالأخطاء.' },
  ]),

  page('writing', W(2), 'Letters and emails', 'الرسائل والبريد الإلكتروني', [
    { t: 'banner', title: 'Letters & emails - الرسائل', icons: ['✉️', '📧'] },
    { t: 'grid', rows: [
      { dark: true, span: [2, 5, 5], cells: ['', 'Informal (a friend)', 'Formal (a company, a school)'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Greeting', 'Hi Sara, / Dear Omar,', 'Dear Sir or Madam, / Dear Mr Alami,'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Opening', 'How are you? Thanks for your email.', 'I am writing to apply for / to complain about / to ask about …'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Body', 'Short forms (I\'m, don\'t), friendly tone.', 'Full forms (I am, do not), polite tone.'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Closing line', 'Write back soon! / Can\'t wait to see you.', 'I look forward to hearing from you.'] },
      { span: [2, 5, 5], size: 11.5, cells: ['Ending', 'Love, / Best wishes, / Take care,', 'Yours faithfully, (Sir/Madam) / Yours sincerely, (a name)'] },
    ] },
    { t: 'text', label: 'Model - A formal email: applying to volunteer', size: 12.5, body:
      'Dear Mrs Bennani, '
      + 'I am writing to apply for a place as a volunteer in your summer literacy programme, which I saw advertised on your association\'s website. '
      + 'I am eighteen years old and I am a second-year Bac student in Meknes. Last year, I helped my younger cousins with their reading every weekend, and I discovered that I really enjoy teaching. I am patient, organized and I speak Arabic, Tamazight, French and English. '
      + 'I am available from the first of July to the end of August. I would be grateful if you could tell me what the volunteers do every day and whether accommodation is provided. '
      + 'Thank you for considering my application. I look forward to hearing from you. '
      + 'Yours sincerely, Yassine Amrani' },
    { t: 'text', label: 'Model - An informal email to a friend', size: 12.5, body:
      'Hi Sara, '
      + 'Thanks for your email! Sorry I didn\'t write back sooner; I\'ve been busy with my Bac revision. '
      + 'Guess what? Last weekend I joined a volunteering club in my town. We cleaned the beach and planted trees near the school. It was tiring but really fun, and I met some great people. '
      + 'What about you? How are your exams going? Write back soon and tell me all your news! '
      + 'Love, Hind' },
    { t: 'bullets', cols: 2, size: 12, items: [
      'Say why you are writing in the first sentence.',
      'One paragraph = one idea.',
      'End with a polite request or question.',
      'Never use "Hi" or "Bye" in a formal letter.',
    ] },
  ]),

  page('writing', W(3), 'Model essay: social media', 'نموذج: وسائل التواصل الاجتماعي', [
    { t: 'banner', title: 'Model essay 1', icons: ['📱', '📝'] },
    { t: 'sub', text: 'Topic: Are social media more useful or harmful for young people? Write an essay of about 180 words.' },
    { t: 'text', label: 'Model essay', size: 13, body:
      'Nowadays, almost every teenager has an account on Instagram, TikTok or WhatsApp. Social media have changed the way young people communicate, learn and spend their free time. In my opinion, they are useful, but only when they are used wisely. '
      + 'First of all, social media help young people stay in touch with friends and family, even when they live far away. Moreover, they can be a great tool for learning: students follow educational pages, watch short lessons and share notes before exams. '
      + 'On the other hand, social media can be harmful. Many teenagers spend hours scrolling instead of studying or sleeping. Furthermore, fake news and cyberbullying spread very quickly online, and they can hurt people\'s feelings and reputation. '
      + 'To sum up, social media are neither good nor bad in themselves. It is the way we use them that matters. Young people should limit their screen time and use these platforms to learn and connect, not to waste their lives.' },
    { t: 'bar', title: 'Why this essay works - لماذا هذا النموذج جيد' },
    { t: 'bullets', cols: 2, size: 12, items: [
      'Clear thesis at the end of the introduction.',
      'Each body paragraph starts with a linking word.',
      'Examples make the ideas concrete.',
      'The conclusion repeats the opinion in new words.',
    ] },
    { t: 'pairs', cols: 2, side: true, size: 12, items: [
      ['scroll', 'يتصفّح بلا توقّف'], ['cyberbullying', 'التنمّر الإلكتروني'],
      ['fake news', 'الأخبار الزائفة'], ['screen time', 'وقت الشاشة'],
    ] },
  ]),

  page('writing', W(4), 'Model essays: brain drain and the environment', 'نماذج: هجرة الأدمغة والبيئة', [
    { t: 'banner', title: 'Model essays 2 & 3', icons: ['✈️', '🌍'] },
    { t: 'sub', text: 'Topic: Many young graduates leave Morocco to work abroad. What are the causes, and what can be done?' },
    { t: 'text', label: 'Model essay 2 - Brain drain', size: 12, body:
      'Every year, thousands of Moroccan doctors, engineers and computer scientists leave the country to work in Europe or Canada. This phenomenon, known as brain drain, is a real loss for our development. '
      + 'There are several reasons for it. Many graduates look for higher salaries and better working conditions. Others want to continue their research in well-equipped laboratories. '
      + 'However, solutions exist. The government could encourage young talents to stay by improving salaries and creating more research centres. Companies could also offer training and real chances of promotion. Finally, Moroccans abroad can help their country by investing and sharing their skills. '
      + 'In conclusion, brain drain can be reduced if young people feel that their future is here.' },
    { t: 'sub', text: 'Topic: What can each of us do to protect the environment?' },
    { t: 'text', label: 'Model essay 3 - Protecting the environment', size: 12, body:
      'Pollution, drought and climate change are no longer distant problems; we can see their effects in our cities and villages. Protecting the environment is not only the job of governments; each of us has a role to play. '
      + 'To begin with, we can save water by taking shorter showers and repairing leaking taps. In addition, we should reduce plastic by carrying our own bags and bottles. '
      + 'We can also walk, cycle or use public transport instead of cars, which reduces air pollution. At school, students can plant trees and organize clean-up campaigns. '
      + 'To conclude, small daily actions, when millions of people do them, can make a big difference for our planet.' },
    { t: 'pairs', cols: 2, side: true, size: 12, items: [
      ['graduate', 'خرّيج'], ['talent', 'كفاءة / موهبة'],
      ['promotion', 'ترقية'], ['leaking tap', 'صنبور يسرّب الماء'],
      ['clean-up campaign', 'حملة نظافة'], ['public transport', 'النقل العمومي'],
    ] },
  ]),

  page('writing', W(5), 'Your turn', 'دورك الآن', [
    { t: 'banner', title: 'Your turn - دورك', icons: ['🖊️', '🏁'] },
    { t: 'bar', title: 'Practice topics - مواضيع للتدرّب' },
    { t: 'bullets', cols: 1, size: 12.5, items: [
      '1. Should school uniforms be compulsory in Moroccan schools? Give your opinion.',
      '2. Write an email to a friend telling him/her about a volunteering experience you had.',
      '3. "Girls\' education is the key to development." Discuss.',
      '4. Write a letter to the mayor of your town to complain about the lack of green spaces.',
      '5. Artificial intelligence: a help or a threat for students?',
      '6. Describe a person who has influenced your life and explain why.',
      '7. What are the advantages and disadvantages of living in a big city?',
      '8. Write an article for your school magazine about the importance of reading.',
    ] },
    ex('Plan your essay in 5 minutes.', 'Choose a topic above. Write notes, not full sentences.', [
      ['Introduction: the topic + my opinion', ''],
      ['Idea 1 + an example', ''],
      ['Idea 2 + an example', ''],
      ['Conclusion: my opinion in new words', ''],
    ], { lines: true }),
    { t: 'bar', title: 'Checklist before you hand in - قبل التسليم' },
    { t: 'grid', rows: [
      { dark: true, span: [6, 1], cells: ['Check', '✓'] },
      { span: [6, 1], size: 12, cells: ['I answered the question that was asked.', ''] },
      { span: [6, 1], size: 12, cells: ['I have an introduction, 2 body paragraphs and a conclusion.', ''] },
      { span: [6, 1], size: 12, cells: ['I used linking words (first of all, moreover, however…).', ''] },
      { span: [6, 1], size: 12, cells: ['I gave at least one example for each idea.', ''] },
      { span: [6, 1], size: 12, cells: ['My verbs agree with their subjects (he goes, they go).', ''] },
      { span: [6, 1], size: 12, cells: ['I checked the tenses, spelling, capitals and full stops.', ''] },
      { span: [6, 1], size: 12, cells: ['I wrote about the number of words asked.', ''] },
    ] },
    { t: 'callout', text: 'نقطة الكتابة (10 نقاط) توزّع عادةً على: احترام الموضوع، تنظيم الأفكار، سلامة اللغة، وغنى المفردات.' },
  ]),
]
