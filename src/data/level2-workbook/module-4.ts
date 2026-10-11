import type { Block } from '../level1-book.ts'
import type { L2WorkUnit } from './types.ts'
import { choose, complete, correct } from '../level2-book/helpers.ts'
import { fromBank, join, match, remember } from './helpers.ts'

/**
 * Workbook, Module 4 — Work, services and problems. New sentences on each
 * unit's grammar (none copied from the textbook's practice), the mistakes
 * Arabic speakers really make, and the writing skill each unit's text needs.
 */

export const WORK_4: L2WorkUnit[] = [
  /* ── 13 · Rules and advice: must, have to, should ─────────────── */
  {
    n: 13, orderFrom: 9,
    grammar: [[
      remember([
        'must / have to + verb: rules and things that are necessary: You must wear your badge. - للقواعد والضروريات.',
        "mustn't = it is not allowed. don't have to = it is not necessary. - الأولى للممنوع والثانية لغير الضروري.",
        "should / shouldn't + verb: advice: You should take a break. - للنصيحة.",
      ]),
      choose("must, mustn't or don't have to?", [
        ["You ___ drive on the left in Morocco. It's dangerous!", ["mustn't", "don't have to", 'must'], 0],
        ['Students ___ show their card at the library.', ["don't have to", 'must', "mustn't"], 1],
        ["We ___ cook tonight. We're eating at my mother's.", ["mustn't", 'must', "don't have to"], 2],
        ['You ___ feed the animals at the zoo.', ["mustn't", "don't have to", 'have to'], 0],
        ["Children under six ___ pay on the train. It's free.", ["mustn't", "don't have to", 'must'], 1],
        ['Passengers ___ have a ticket before they get on.', ["mustn't", "don't have to", 'must'], 2],
        ["You ___ bring a towel. The hotel gives you one.", ["don't have to", "mustn't", 'must'], 0],
        ["You ___ talk during the exam.", ["don't have to", "mustn't", 'should'], 1],
      ]),
      complete('have to, has to or had to?', 'Complete with the right form. - أكمل بالصيغة المناسبة.', [
        ['My father ___ (have to) get up at five every day.', 'has to'],
        ['Yesterday we ___ (have to) wait an hour for the bus.', 'had to'],
        ['___ you ___ (have to) wear a uniform at school?', 'Do / have to'],
        ["She ___ (not / have to) work on Fridays.", "doesn't have to"],
        ['I ___ (have to) call the bank last week.', 'had to'],
        ['___ he ___ (have to) take the train every day?', 'Does / have to'],
        ["They ___ (not / have to) pay. It was free.", "didn't have to"],
        ['Doctors often ___ (have to) work at night.', 'have to'],
      ], 2),
      complete('Give advice', "Write advice with should or shouldn't. - اكتب نصيحة مناسبة.", [
        ["I'm always tired. (go to bed earlier)", 'You should go to bed earlier.'],
        ['My tooth hurts. (see a dentist)', 'You should see a dentist.'],
        ['I spend all my money. (buy so many clothes)', "You shouldn't buy so many clothes."],
        ["I can't sleep. (drink coffee at night)", "You shouldn't drink coffee at night."],
        ['My English is weak. (practise every day)', 'You should practise every day.'],
        ['I argue with my brother. (shout at him)', "You shouldn't shout at him."],
      ], 1, true),
    ], [
      complete('Rules at a riad', 'Write the rule again with the word in brackets. - أعد كتابة القاعدة بالكلمة بين القوسين.', [
        ['It is necessary to leave your key at reception. (must)', 'You must leave your key at reception.'],
        ["Smoking in the rooms is not allowed. (mustn't)", "You mustn't smoke in the rooms."],
        ['Breakfast is in the price. (pay)', "You don't have to pay for breakfast."],
        ['It is a good idea to book a table for dinner. (should)', 'You should book a table for dinner.'],
        ['Guests are not allowed to swim after ten. (mustn\'t)', "You mustn't swim after ten."],
        ['It is necessary to check out before twelve. (have to)', 'You have to check out before twelve.'],
      ], 1, true),
      correct([
        ['You must to show your passport.', 'You must show your passport.'],
        ['She have to start at seven.', 'She has to start at seven.'],
        ['Do I must bring anything?', 'Do I have to bring anything?'],
        ['We must leave early yesterday.', 'We had to leave early yesterday.'],
        ["You don't must park here.", "You mustn't park here."],
        ['You should to rest.', 'You should rest.'],
      ]),
    ]],
    aboutYou: [
      'What do you have to do every morning?',
      "What don't you have to do at the weekend?",
      'What is one rule at your work or school?',
      'What advice would you give a new student?',
    ],
    writing: [
      join([
        ['You must wear sports shoes. You mustn\'t wear sandals. (and)', "You must wear sports shoes and you mustn't wear sandals."],
        ["You don't have to book the gym. You have to book the pool. (but)", "You don't have to book the gym, but you have to book the pool."],
        ['The floor is wet. You should walk slowly. (so)', 'The floor is wet, so you should walk slowly.'],
        ['You have to show your card. The club is for members only. (because)', 'You have to show your card because the club is for members only.'],
        ['You can bring water. You mustn\'t bring glass bottles. (but)', "You can bring water, but you mustn't bring glass bottles."],
      ]),
      fromBank('A notice of rules', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['Opening ___: 8 am to 8 pm.', 'hours'],
        ['Please read our ___ carefully.', 'rules'],
        ['All visitors must sign ___ at reception.', 'in'],
        ['Food is not ___ in the library.', 'allowed'],
        ['Children under ten must be ___ an adult.', 'with'],
        ['Thank you, and ___ your visit!', 'enjoy'],
      ]),
    ],
    plan: [
      'What is the place, and when is it open?',
      'What are four or five rules?',
      "What don't people have to do?",
      'What advice can you give?',
    ],
  },

  /* ── 14 · Could you tell me…? Polite requests & indirect questions ── */
  {
    n: 14, orderFrom: 15,
    grammar: [[
      remember([
        'Could you…? Could I…? Would you mind + -ing…? are polite requests. - هذه صيغ الطلب المهذّب.',
        'Indirect questions: Could you tell me where the bank is? The verb comes at the end. - الفعل في آخر السؤال غير المباشر.',
        'No do, does or did, and if for yes / no questions: Do you know if it is open? - دون فعل مساعد، ونضع if في أسئلة نعم أو لا.',
      ]),
      choose('Choose the polite and correct form', [
        ['Could you tell me where the toilets ___?', ['are they', 'do', 'are'], 2],
        ['Do you know what time the film ___?', ['starts', 'does start', 'start it'], 0],
        ['Would you mind ___ the music down?', ['to turn', 'turning', 'turn'], 1],
        ['Can you tell me ___ this bus goes to the airport?', ['does', 'is', 'if'], 2],
        ['___ I have a glass of water, please?', ['Could', 'Would', 'Do'], 0],
        ['Do you know where ___?', ['does she live', 'she lives', 'lives she'], 1],
        ['I was wondering if you ___ help me.', ['can to', 'would to', 'could'], 2],
        ['A: Would you mind waiting? B: ___', ['Not at all.', 'Yes, I would wait.', 'No, I mind.'], 0],
      ]),
      complete('Make it polite', 'Write the request with the words in brackets. - اكتب الطلب بالكلمات بين القوسين.', [
        ['Open the window. (Could you…)', 'Could you open the window, please?'],
        ['Give me the menu. (Could I…)', 'Could I have the menu, please?'],
        ['Wait a moment. (Would you mind…)', 'Would you mind waiting a moment?'],
        ['Speak more slowly. (Could you…)', 'Could you speak more slowly, please?'],
        ['Call a taxi for me. (Would you mind…)', 'Would you mind calling a taxi for me?'],
        ['I want the bill. (Could I…)', 'Could I have the bill, please?'],
      ], 1, true),
    ], [
      complete('Indirect questions', 'Write the question again. Start with the words in brackets. - أعد كتابة السؤال.', [
        ['Where is the museum? (Could you tell me…)', 'Could you tell me where the museum is?'],
        ['What time does the shop close? (Do you know…)', 'Do you know what time the shop closes?'],
        ['Is the pool open? (Can you tell me…)', 'Can you tell me if the pool is open?'],
        ['How much does the room cost? (I would like to know…)', 'I would like to know how much the room costs.'],
        ['Where did he park the car? (Do you know…)', 'Do you know where he parked the car?'],
        ['Can I pay by card? (Could you tell me…)', 'Could you tell me if I can pay by card?'],
      ], 1, true),
      correct([
        ['Could you tell me where is the station?', 'Could you tell me where the station is?'],
        ['Do you know what time does it open?', 'Do you know what time it opens?'],
        ['Would you mind to close the door?', 'Would you mind closing the door?'],
        ['Can you tell me is breakfast included?', 'Can you tell me if breakfast is included?'],
        ['Do you know where did she go?', 'Do you know where she went?'],
        ['I would like to know how much does it cost.', 'I would like to know how much it costs.'],
      ]),
    ]],
    aboutYou: [
      'Write a polite request you might make in a restaurant.',
      'Write an indirect question about your town for a tourist.',
      'Write a polite request to your teacher.',
      'Write a polite way to say no to a request.',
    ],
    writing: [
      join([
        ['I am writing to ask for information. I am planning a trip to Essaouira. (because)', 'I am writing to ask for information because I am planning a trip to Essaouira.'],
        ['We would like a double room. We would like a sea view. (with)', 'We would like a double room with a sea view.'],
        ['We are coming by car. Is there parking near the hotel? (so)', 'We are coming by car, so is there parking near the hotel?'],
        ['I would like to know the price. I would like to know if breakfast is included. (and)', 'I would like to know the price and if breakfast is included.'],
        ['I would like to book a boat trip. I do not know the times. (but)', 'I would like to book a boat trip, but I do not know the times.'],
      ]),
      fromBank('A formal email', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['Dear Sir or ___,', 'Madam'],
        ['I am ___ to ask for some information.', 'writing'],
        ['I would also like to know ___ breakfast is included.', 'whether'],
        ['Finally, would you ___ sending me a price list?', 'mind'],
        ['I look forward to ___ from you.', 'hearing'],
        ['Yours ___,', 'faithfully'],
      ]),
    ],
    plan: [
      'Who are you writing to, and why?',
      'What are your dates and plans?',
      'What three questions will you ask?',
      'How will you start and finish formally?',
    ],
  },

  /* ── 15 · Problems and complaints: the passive ─────────────────── */
  {
    n: 15, orderFrom: 18,
    grammar: [[
      remember([
        'The passive: be + past participle: It was delivered late. - نستعمل be ثم التصريف الثالث.',
        'Present: is made. Past: was made. Future: will be made. Present perfect: has been made. - هكذا يتغيّر الزمن.',
        'by + who did it, only if it is important: It was painted by my uncle. - نذكر الفاعل عند الحاجة فقط.',
      ]),
      choose('Choose the passive form', [
        ['Argan oil ___ in the south of Morocco.', ['produces', 'is produced', 'is produce'], 1],
        ['The Koutoubia Mosque ___ in the 12th century.', ['built', 'is build', 'was built'], 2],
        ['These shoes ___ in Italy.', ['were made', 'was made', 'made'], 0],
        ['Your parcel ___ tomorrow morning.', ['will deliver', 'will be delivered', 'is deliver'], 1],
        ['The results ___ next week.', ['will announced', 'announce', 'will be announced'], 2],
        ['Our car ___ last night!', ['was stolen', 'stole', 'is stole'], 0],
        ['Your complaint ___ to the manager.', ['has sent', 'has been sent', 'has been send'], 1],
        ['Mint tea ___ with a lot of sugar.', ['often serves', 'is often serve', 'is often served'], 2],
      ]),
      complete('Complete with the passive', 'Use the verb in brackets and the tense given. - استعمل الفعل والزمن المطلوب.', [
        ['The windows ___ (clean) every week. (present)', 'are cleaned'],
        ['The match ___ (watch) by millions. (past)', 'was watched'],
        ['A new bridge ___ (build) next year. (future)', 'will be built'],
        ['The letters ___ (send) yesterday. (past)', 'were sent'],
        ['The road ___ (close) today. (present perfect)', 'has been closed'],
        ['French ___ (speak) in many offices. (present)', 'is spoken'],
        ['The thief ___ (catch) at the station. (past)', 'was caught'],
        ['Your money ___ (pay) back in five days. (future)', 'will be paid'],
      ], 2),
    ], [
      complete('Active to passive', 'Write the sentence in the passive. - اكتب الجملة بالمبني للمجهول.', [
        ['They deliver the newspapers at six.', 'The newspapers are delivered at six.'],
        ['Someone broke the window.', 'The window was broken.'],
        ['They will repair the road next month.', 'The road will be repaired next month.'],
        ['My grandfather built this house.', 'This house was built by my grandfather.'],
        ['They grow oranges near Berkane.', 'Oranges are grown near Berkane.'],
        ['Someone has stolen my bike!', 'My bike has been stolen!'],
      ], 1, true),
      correct([
        ['The machine delivered yesterday.', 'The machine was delivered yesterday.'],
        ['It was make in China.', 'It was made in China.'],
        ['The road will repaired soon.', 'The road will be repaired soon.'],
        ['The house was built from my father.', 'The house was built by my father.'],
        ['The shops are close on Fridays at noon.', 'The shops are closed on Fridays at noon.'],
        ['My phone was stealed.', 'My phone was stolen.'],
      ]),
    ]],
    aboutYou: [
      'What is your town famous for? What is made or grown there?',
      'When was your school or your house built?',
      'Was anything of yours ever lost, stolen or broken? What happened?',
      'What will be done in your town in the next few years?',
    ],
    writing: [
      join([
        ['I ordered a phone. It arrived a week late. (but)', 'I ordered a phone, but it arrived a week late.'],
        ['The box was opened. The screen was broken. (when)', 'When the box was opened, the screen was broken.'],
        ['I called three times. Nobody answered. (but)', 'I called three times, but nobody answered.'],
        ['The phone does not work. I would like a refund. (so)', 'The phone does not work, so I would like a refund.'],
        ['I am disappointed. I paid a lot of money. (because)', 'I am disappointed because I paid a lot of money.'],
      ]),
      fromBank('Formal or informal?', 'Write the formal words. Use the words in the box. - اكتب الكلمات الرسمية من الإطار.', [
        ["I'm really angry. → I am very ___.", 'disappointed'],
        ['It came late. → It was ___ late.', 'delivered'],
        ['Give me my money back. → I would like a ___.', 'refund'],
        ["It's broken. → It was ___.", 'damaged'],
        ['Change it! → I would like it to be ___.', 'replaced'],
        ['Write back soon. → I look forward to your ___.', 'reply'],
      ]),
    ],
    plan: [
      'What did you buy, when, and what is the order number?',
      'What are the problems?',
      'How do you feel?',
      'What do you want the company to do?',
    ],
  },

  /* ── 16 · The job interview: gerunds & infinitives ─────────────── */
  {
    n: 16, orderFrom: 8,
    grammar: [[
      remember([
        "-ing after enjoy, don't mind, avoid, finish, keep: I enjoy working with people. - بعد هذه الأفعال صيغة ing للفعل.",
        'to + verb after want, would like, need, decide, hope, plan, manage: I want to improve. - بعد هذه الأفعال نضع to قبل الفعل.',
        "-ing after prepositions: I'm good at solving problems. - بعد حروف الجر صيغة ing للفعل.",
      ]),
      choose('-ing or to?', [
        ['I enjoy ___ to music in the car.', ['listening', 'to listen', 'listen'], 0],
        ['We decided ___ a new car.', ['buying', 'to buy', 'buy'], 1],
        ["I don't mind ___ the dishes.", ['to do', 'do', 'doing'], 2],
        ['She hopes ___ a doctor one day.', ['to become', 'becoming', 'become'], 0],
        ["He's afraid of ___ alone at night.", ['to walk', 'walking', 'walk'], 1],
        ['I need ___ more water.', ['drinking', 'drink', 'to drink'], 2],
        ['Have you finished ___ your report?', ['writing', 'to write', 'write'], 0],
        ['They managed ___ the last train.', ['catching', 'to catch', 'catch'], 1],
      ]),
      complete('Complete with -ing or to', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['I would like ___ (visit) Japan.', 'to visit'],
        ['He keeps ___ (forget) his keys.', 'forgetting'],
        ["I'm tired of ___ (wait).", 'waiting'],
        ['We plan ___ (open) a shop next year.', 'to open'],
        ['She avoids ___ (eat) sugar.', 'eating'],
        ['Thank you for ___ (come).', 'coming'],
        ['I want ___ (learn) to drive.', 'to learn'],
        ["She's interested in ___ (study) law.", 'studying'],
      ], 2),
    ], [
      complete('About Khadija', 'Write a sentence with the words in brackets. - اكتب جملة بالكلمات بين القوسين.', [
        ['work with people (enjoy)', 'She enjoys working with people.'],
        ['become a manager (hope)', 'She hopes to become a manager.'],
        ['solve problems (good at)', 'She is good at solving problems.'],
        ['work at weekends (not mind)', "She doesn't mind working at weekends."],
        ['improve her English (want)', 'She wants to improve her English.'],
        ['take Spanish classes (plan)', 'She is planning to take Spanish classes.'],
      ], 1, true),
      correct([
        ['I enjoy to cook for my family.', 'I enjoy cooking for my family.'],
        ['He wants travel to Canada.', 'He wants to travel to Canada.'],
        ["I'm good at organise things.", "I'm good at organising things."],
        ['We look forward to meet you.', 'We look forward to meeting you.'],
        ["She doesn't mind to wait.", "She doesn't mind waiting."],
        ['They decided staying at home.', 'They decided to stay at home.'],
      ]),
    ]],
    aboutYou: [
      'What do you enjoy doing in your free time?',
      'What are you good at?',
      "What don't you mind doing at home?",
      'What would you like to do in five years?',
    ],
    writing: [
      join([
        ['I saw your advertisement. I would like to apply. (and)', 'I saw your advertisement, and I would like to apply.'],
        ['I studied tourism. I have worked in a riad for two years. (and)', 'I studied tourism, and I have worked in a riad for two years.'],
        ['I enjoy working with people. I am a good receptionist. (so)', 'I enjoy working with people, so I am a good receptionist.'],
        ['I speak French well. I want to improve my English. (but)', 'I speak French well, but I want to improve my English.'],
        ['I would like this job. I want to work in a big hotel. (because)', 'I would like this job because I want to work in a big hotel.'],
      ]),
      fromBank('A job application', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['I would like to ___ for the job of receptionist.', 'apply'],
        ['I have two years of ___ in tourism.', 'experience'],
        ['I am ___ for checking guests in.', 'responsible'],
        ['I attach my ___.', 'CV'],
        ['I would be happy to come for an ___.', 'interview'],
        ['Yours ___,', 'sincerely'],
      ]),
    ],
    plan: [
      'Which job is it, and where did you see it?',
      'What are your studies and your experience?',
      'What do you enjoy, and what are you good at?',
      'How will you finish the email?',
    ],
  },
]

/** The Module 4 test: two pages, about 40 minutes, marked out of 40. */
export const TEST_4: [Block[], Block[]] = [[
  { t: 'banner', title: 'Module 4 test - اختبار المحور الرابع', icons: ['🏁', '⭐'], tone: 'practice' },
  { t: 'callout', text: 'أجب دون أن تنظر إلى الكتاب، في 40 دقيقة تقريبًا. بعد ذلك صحّح أجوبتك في آخر الدفتر، واكتب نتيجتك في الجدول.' },
  fromBank('Vocabulary', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
    ['You must wear your ___ all the time.', 'badge'],
    ["Friday is my ___ off. I don't work.", 'day'],
    ['I have a ___ for three nights.', 'reservation'],
    ['Is breakfast ___ in the price?', 'included'],
    ['The door of the machine was ___.', 'damaged'],
    ['Please give me my money back. I would like a ___.', 'refund'],
    ['She has two years of ___ in tourism.', 'experience'],
    ['I sent my ___ to five hotels.', 'CV'],
  ]),
  choose('Grammar', [
    ["You ___ smoke here. It's forbidden.", ["don't have to", 'should', "mustn't"], 2],
    ["It's free. You ___ pay.", ["don't have to", "mustn't", 'must'], 0],
    ['Could you tell me where the bank ___?', ['is it', 'is', 'does'], 1],
    ['Would you mind ___ the door?', ['to close', 'close', 'closing'], 2],
    ['This mosque ___ built in 1993.', ['was', 'is', 'were'], 0],
    ['Your order will ___ delivered tomorrow.', ['been', 'be', 'is'], 1],
    ['I enjoy ___ new people.', ['to meet', 'meet', 'meeting'], 2],
    ['She hopes ___ a manager.', ['to become', 'becoming', 'become'], 0],
  ]),
], [
  { t: 'bar', title: 'Module 4 test (continued) - اختبار المحور الرابع', icon: '🏁', tone: 'practice' },
  correct([
    ['You must to wear a helmet.', 'You must wear a helmet.'],
    ['He have to work tonight.', 'He has to work tonight.'],
    ['Do you know what time does it close?', 'Do you know what time it closes?'],
    ['The letter sent yesterday.', 'The letter was sent yesterday.'],
    ['I want learn Spanish.', 'I want to learn Spanish.'],
    ['I look forward to hear from you.', 'I look forward to hearing from you.'],
  ]),
  match('Expressions: question and answer', 'Write the letter of the answer. - اكتب حرف الجواب المناسب.', [
    ['Do I have to wear a suit?', "No, you don't. A shirt is fine."],
    ['Could I have a room with a sea view?', "I'm afraid they are full."],
    ['Would you mind calling a taxi?', 'Not at all.'],
    ['What would you like us to do?', "I'd like a new machine."],
    ['What are you good at?', 'Solving problems.'],
    ['Do you have any questions for me?', 'Yes. When do you need someone to start?'],
  ], 2),
  { t: 'bar', title: 'Writing - الكتابة', icon: '✍️', tone: 'writing' },
  { t: 'bullets', size: 13.5, items: ['Write a short formal email to a shop: say what you bought, what the problem is, and what you want them to do. - اكتب رسالة رسمية قصيرة إلى متجر: ماذا اشتريت وما المشكلة وماذا تريد منهم.'] },
  { t: 'lines', n: 5, grow: true },
  { t: 'grid', rows: [
    { dark: true, span: [1, 1, 1, 1, 1, 1], cells: ['Vocabulary', 'Grammar', 'Mistakes', 'Expressions', 'Writing', 'Total'] },
    { span: [1, 1, 1, 1, 1, 1], size: 14, cells: ['___ / 8', '___ / 8', '___ / 6', '___ / 6', '___ / 12', '___ / 40'] },
  ] },
]]
