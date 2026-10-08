import { ex, page, type BacPage } from './bac-helpers.ts'

/**
 * Communicative functions: two per page. Each function gets a short table of
 * expressions (and how to answer), then a page exercise in the exam's two
 * shapes: "what would you say?" and "identify the function".
 */

const F = (n: number) => `Function ${n}`

type Fn = { name: string; ar: string; say: string[]; reply?: string[] }

const table = (a: Fn, b: Fn) => ({
  t: 'row' as const, widths: '1fr 1fr', blocks: [a, b].map(f => [
    { t: 'sub' as const, text: `${f.name} - ${f.ar}` },
    { t: 'bullets' as const, size: 12, items: f.say },
    ...(f.reply ? [{ t: 'bullets' as const, box: true, heading: 'Responding', size: 11.5, items: f.reply }] : []),
  ]),
})

export const BAC_FUNCTIONS: BacPage[] = [
  page('functions', F(1), 'Opinion · agreeing and disagreeing', 'إبداء الرأي، الموافقة والاعتراض', [
    { t: 'banner', title: 'Opinions - الرأي', icons: ['💬', '🤝'] },
    table(
      { name: 'Expressing opinion', ar: 'إبداء الرأي', say: ['In my opinion, …', 'I think / I believe (that) …', 'As far as I\'m concerned, …', 'Personally, I feel that …', 'From my point of view, …', 'It seems to me that …'] },
      { name: 'Agreeing / disagreeing', ar: 'الموافقة والاعتراض', say: ['I (totally) agree with you.', 'You\'re absolutely right.', 'That\'s exactly what I think.', 'I see your point, but …', 'I\'m afraid I don\'t agree.', 'I disagree. / That\'s not true.'], reply: ['Partly: I agree up to a point, but …', 'Strongly: I couldn\'t agree more.'] },
    ),
    { t: 'callout', text: 'في سؤال Identify the function اكتب اسم الوظيفة بالإنجليزية، مثل agreeing أو expressing opinion، وليس ترجمتها.' },
    ex('What would you say?', '', [
      ['Your friend says: "Social media is a waste of time." You agree completely.', 'I couldn\'t agree more. / I totally agree with you.'],
      ['You give your opinion about studying abroad.', 'In my opinion, studying abroad is a great experience.'],
      ['Your classmate thinks exams are useless. You disagree politely.', 'I\'m afraid I don\'t agree. Exams show what we have learnt.'],
      ['You partly agree that cities are better than villages.', 'I agree up to a point, but villages are calmer.'],
    ], { lines: true }),
    ex('Identify the function.', '', [
      ['"As far as I\'m concerned, girls should go to university."', 'expressing opinion'],
      ['"That\'s not true at all!"', 'disagreeing'],
      ['"You\'re absolutely right."', 'agreeing'],
    ]),
  ]),

  page('functions', F(2), 'Advice and suggestions', 'النصيحة والاقتراح', [
    { t: 'banner', title: 'Advice & suggestions - النصيحة والاقتراح', icons: ['💡', '🧭'] },
    table(
      { name: 'Giving advice', ar: 'إعطاء النصيحة', say: ['You should / ought to …', 'You\'d better …', 'If I were you, I would …', 'Why don\'t you …?', 'It\'s a good idea to …'], reply: ['Thanks, that\'s good advice.', 'You\'re right, I will.'] },
      { name: 'Making suggestions', ar: 'الاقتراح', say: ['Let\'s …', 'Shall we …?', 'How about / What about + -ing?', 'Why don\'t we …?', 'I suggest (that) we …'], reply: ['Accept: That\'s a good idea! / Why not?', 'Refuse: I\'d rather not. / I\'m not sure about that.'] },
    ),
    { t: 'callout', text: 'النصيحة: You should, You\'d better, If I were you — الاقتراح: Let\'s, How about, Why don\'t we' },
    ex('What would you say?', '', [
      ['Your friend has a toothache. Advise him.', 'You should see a dentist. / If I were you, I would see a dentist.'],
      ['You suggest going to the cinema this evening.', 'How about going to the cinema this evening? / Let\'s go to the cinema.'],
      ['Your sister can\'t sleep before exams. Give her advice.', 'You\'d better stop using your phone before bed.'],
      ['Your friend suggests playing football in the rain. Refuse politely.', 'I\'d rather not; it\'s raining too hard.'],
    ], { lines: true }),
    ex('Identify the function.', '', [
      ['"Why don\'t we revise together on Saturday?"', 'making a suggestion'],
      ['"If I were you, I would apply for that scholarship."', 'giving advice'],
      ['"That\'s a great idea!"', 'accepting a suggestion'],
    ]),
  ]),

  page('functions', F(3), 'Requests and permission', 'الطلب والاستئذان', [
    { t: 'banner', title: 'Requests & permission - الطلب والاستئذان', icons: ['🙏', '🚪'] },
    table(
      { name: 'Making requests', ar: 'تقديم طلب', say: ['Can / Could you …, please?', 'Would you mind + -ing …?', 'Would you be so kind as to …?', 'I was wondering if you could …'], reply: ['Yes: Sure. / Of course. / No problem.', 'No: I\'m sorry, but I can\'t …', 'Would you mind…? → Not at all. (= yes)'] },
      { name: 'Asking for permission', ar: 'طلب الإذن', say: ['Can / Could I …?', 'May I …?', 'Do you mind if I …?', 'Is it all right if I …?'], reply: ['Yes: Go ahead. / Of course you can.', 'No: I\'m afraid you can\'t.', 'Do you mind if…? → No, not at all. (= yes)'] },
    ),
    { t: 'callout', text: 'انتبه: إذا سُئلت Would you mind opening the door وأردت الموافقة فقل Not at all أي لا مانع.' },
    ex('What would you say?', '', [
      ['You want your teacher to repeat the explanation.', 'Could you repeat that, please?'],
      ['You want to open the window in the bus.', 'Do you mind if I open the window?'],
      ['You ask your father to drive you to school.', 'Would you mind driving me to school?'],
      ['You want to leave the class early.', 'May I leave early, please?'],
    ], { lines: true }),
    ex('Identify the function.', '', [
      ['"May I use your phone?"', 'asking for permission'],
      ['"Could you lend me your dictionary?"', 'making a request'],
      ['"Go ahead."', 'giving permission'],
    ]),
  ]),

  page('functions', F(4), 'Apologizing and complaining', 'الاعتذار والشكوى', [
    { t: 'banner', title: 'Apologies & complaints - الاعتذار والشكوى', icons: ['😓', '📢'] },
    table(
      { name: 'Apologizing', ar: 'الاعتذار', say: ['I\'m (really / terribly) sorry for + -ing …', 'I apologize for …', 'Please forgive me.', 'It was my fault.'], reply: ['That\'s all right. / Never mind.', 'Don\'t worry about it.', 'It doesn\'t matter.'] },
      { name: 'Complaining', ar: 'الشكوى', say: ['I\'m sorry to say this, but …', 'I want to complain about …', 'I\'m not happy with …', 'I\'m afraid there is a problem with …'], reply: ['I\'m sorry. We\'ll sort it out.', 'I\'ll see what I can do.'] },
    ),
    { t: 'callout', text: 'لا تخلط بين I\'m sorry for being late للاعتذار و I\'m sorry to hear that للمواساة.' },
    ex('What would you say?', '', [
      ['You broke your friend\'s pen.', 'I\'m really sorry for breaking your pen.'],
      ['Your neighbour plays loud music every night. Complain.', 'I\'m sorry to say this, but your music is too loud at night.'],
      ['You arrived late to class.', 'I apologize for being late.'],
      ['The new phone you bought doesn\'t work. Complain in the shop.', 'I want to complain about this phone; it doesn\'t work.'],
    ], { lines: true }),
    ex('Identify the function.', '', [
      ['"Never mind, it doesn\'t matter."', 'accepting an apology'],
      ['"I\'m not happy with the service in this hotel."', 'complaining'],
      ['"Please forgive me, it was my fault."', 'apologizing'],
    ]),
  ]),

  page('functions', F(5), 'Regret, wishes and sympathy', 'الندم والتمنّي والمواساة', [
    { t: 'banner', title: 'Regret & sympathy - الندم والمواساة', icons: ['😔', '🤗'] },
    table(
      { name: 'Regrets and wishes', ar: 'الندم والتمنّي', say: ['I wish I had + pp …', 'If only I had + pp …', 'I regret + -ing …', 'I should have + pp …', 'I wish I could …'] },
      { name: 'Expressing sympathy', ar: 'المواساة', say: ['I\'m so sorry to hear that.', 'What a pity! / What a shame!', 'That must be hard for you.', 'Poor you!', 'Please accept my condolences.'], reply: ['Thank you. That\'s very kind of you.'] },
    ),
    { t: 'callout', text: 'للتمنّي في الحاضر: I wish + past simple — للندم على الماضي: I wish + past perfect' },
    ex('What would you say?', '', [
      ['You didn\'t revise and you failed the test. Express regret.', 'I wish I had revised. / I should have revised.'],
      ['Your friend\'s grandfather is in hospital.', 'I\'m so sorry to hear that. I hope he gets better soon.'],
      ['You spent all your money and now you can\'t buy a book.', 'I regret spending all my money.'],
      ['Your friend lost the final match.', 'What a pity! You played very well.'],
    ], { lines: true }),
    ex('Identify the function.', '', [
      ['"If only I had listened to my parents."', 'expressing regret'],
      ['"That must be really hard for you."', 'expressing sympathy'],
      ['"I wish I could fly to Japan."', 'expressing a wish'],
    ]),
    ex('Put the verbs in brackets in the correct form.', '', [
      ['I wish I ___ (be) taller.', 'were'],
      ['If only I ___ (not / lose) my phone yesterday.', 'hadn\'t lost'],
      ['I regret ___ (not / study) harder last year.', 'not studying'],
      ['You should have ___ (call) me earlier.', 'called'],
    ], { cols: 2 }),
  ]),

  page('functions', F(6), 'Purpose, clarification and gratitude', 'الغرض، التوضيح، الشكر', [
    { t: 'banner', title: 'Purpose · clarifying · thanking', icons: ['🎯', '🙌'] },
    { t: 'row', widths: '1fr 1fr 1fr', blocks: [
      [{ t: 'bar', title: 'Purpose - الغرض' }, { t: 'bullets', size: 11.5, items: ['to / in order to + verb', 'so as to + verb', 'so that + subject + can', 'for + noun / -ing'] }],
      [{ t: 'bar', title: 'Clarifying - التوضيح' }, { t: 'bullets', size: 11.5, items: ['Sorry, what do you mean by …?', 'Could you explain that, please?', 'What I mean is …', 'In other words, …'] }],
      [{ t: 'bar', title: 'Gratitude - الشكر' }, { t: 'bullets', size: 11.5, items: ['Thank you very much for …', 'I\'m grateful for …', 'I really appreciate your help.', 'Reply: You\'re welcome. / My pleasure.'] }],
    ] },
    ex('What would you say?', '', [
      ['You didn\'t understand the word "sustainable". Ask for clarification.', 'Sorry, what do you mean by "sustainable"?'],
      ['Thank your teacher for the extra lessons.', 'Thank you very much for the extra lessons. I really appreciate it.'],
      ['Explain why you go to the library (study quietly).', 'I go to the library in order to study quietly.'],
      ['Someone thanks you for your help. Reply.', 'You\'re welcome. / My pleasure.'],
    ], { lines: true }),
    ex('Identify the function.', '', [
      ['"I saved money so that I could buy a laptop."', 'expressing purpose'],
      ['"What I mean is that we need more trees."', 'clarifying'],
      ['"I\'m really grateful for your support."', 'expressing gratitude'],
    ]),
    ex('Complete with to, so that or for.', '', [
      ['I went to the bakery ___ buy some bread.', 'to'],
      ['She speaks slowly ___ everyone can understand her.', 'so that'],
      ['This knife is ___ cutting bread.', 'for'],
      ['He saved money ___ he could travel in the summer.', 'so that'],
    ], { cols: 2 }),
  ]),
]
