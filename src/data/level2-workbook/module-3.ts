import type { Block } from '../level1-book.ts'
import type { L2WorkUnit } from './types.ts'
import { choose, complete, correct } from '../level2-book/helpers.ts'
import { fromBank, join, match, remember } from './helpers.ts'

/**
 * Workbook, Module 3 — Plans and the future. New sentences on each unit's
 * grammar (none copied from the textbook's practice), the mistakes Arabic
 * speakers really make, and the writing skill each unit's text needs.
 */

export const WORK_3: L2WorkUnit[] = [
  /* ── 9 · Making plans: going to & present continuous ──────────── */
  {
    n: 9, orderFrom: 8,
    grammar: [[
      remember([
        "going to + verb: plans and intentions: I'm going to clean the flat. - للنوايا والخطط.",
        "Present continuous: arrangements with a time and other people: I'm meeting Sara at six. - للمواعيد المرتّبة.",
        'Questions about plans: What are you doing this weekend? - هكذا نسأل عن الخطط.',
      ]),
      choose('going to or present continuous?', [
        ["I ___ my dentist at 4 pm tomorrow. It's booked.", ['am seeing', 'going to see', 'see'], 0],
        ["Look at that man! He's going ___.", ['fall', 'to fall', 'falling'], 1],
        ['What ___ you going to do this summer?', ['are', 'do', 'will'], 0],
        ['We ___ dinner with my in-laws on Sunday.', ['are having', 'have', 'going to have'], 0],
        ["One day, I'm ___ to learn the piano.", ['go', 'going', 'goes'], 1],
        ['Are you ___ to the wedding on Saturday?', ['coming', 'come', 'comes'], 0],
        ["It's very cloudy. It's going to ___.", ['raining', 'rain', 'rains'], 1],
        ['She ___ going to study medicine.', ['is', 'are', 'does'], 0],
      ]),
      complete('Write it with going to', 'Complete with the right form of going to. - أكمل بالصيغة المناسبة.', [
        ['I ___ (buy) a new phone.', "'m going to buy"],
        ['She ___ (not / come).', "isn't going to come"],
        ['___ you ___ (call) him?', 'Are / going to call'],
        ['We ___ (paint) the kitchen.', "'re going to paint"],
        ['They ___ (not / stay) long.', "aren't going to stay"],
        ['What ___ he ___ (do)?', 'is / going to do'],
        ['It ___ (rain).', "'s going to rain"],
        ['I ___ (not / tell) anyone.', "'m not going to tell"],
      ], 2),
      complete("Sara's diary", 'Write a sentence in the present continuous. - اكتب جملة بالمضارع المستمر.', [
        ['Saturday 10:00 · meet her cousins at the market', "On Saturday at ten, she's meeting her cousins at the market."],
        ['Saturday 13:00 · have lunch with her mum', "At one, she's having lunch with her mum."],
        ['Saturday 19:30 · go to the restaurant in Ain Diab', "At half past seven, she's going to the restaurant in Ain Diab."],
        ['Sunday 09:00 · play tennis with Omar', "On Sunday at nine, she's playing tennis with Omar."],
        ['Sunday 16:00 · visit her grandmother', "At four, she's visiting her grandmother."],
        ['Monday 08:30 · start a new course', "On Monday at half past eight, she's starting a new course."],
      ]),
    ], [
      complete('Ask about plans', 'Write the question. - اكتب السؤال.', [
        ['you / do / this weekend?', 'What are you doing this weekend?'],
        ['you / free / on Saturday?', 'Are you free on Saturday?'],
        ['who / going to / buy the cake?', 'Who is going to buy the cake?'],
        ['what / you / going to / give her?', 'What are you going to give her?'],
        ['you / come / to the party?', 'Are you coming to the party?'],
        ['when / they / leave?', 'When are they leaving?'],
      ], 1, true),
      correct([
        ["I'm going to visiting Fes.", "I'm going to visit Fes."],
        ['She going to call you.', "She's going to call you."],
        ['What do you do tonight? Any plans?', 'What are you doing tonight? Any plans?'],
        ["We're meet them at six.", "We're meeting them at six."],
        ['Are you go to come?', 'Are you going to come?'],
        ['I going to stay at home.', "I'm going to stay at home."],
      ]),
    ]],
    aboutYou: [
      'What are you doing this weekend?',
      'What are you going to do next summer?',
      'What is the next celebration in your family?',
      'Who are you meeting this week?',
    ],
    writing: [
      join([
        ["We're having a party. It's Ilham's birthday. (because)", "We're having a party because it's Ilham's birthday."],
        ["I'm working until six. I'm coming after that. (but)", "I'm working until six, but I'm coming after that."],
        ["It's a surprise. Please don't tell her. (so)", "It's a surprise, so please don't tell her."],
        ["We're meeting at the restaurant. We're giving her a present. (and)", "We're meeting at the restaurant and we're giving her a present."],
        ["I'd love to come. I'm busy on Saturday. (but)", "I'd love to come, but I'm busy on Saturday."],
      ]),
      fromBank('Saying yes and no', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['Thanks for the ___!', 'invitation'],
        ["I'd ___ to come!", 'love'],
        ["I'm ___ I can't. I'm working.", 'afraid'],
        ['Maybe next ___!', 'time'],
        ['A picnic? Count me ___!', 'in'],
        ['I look forward to ___ you.', 'seeing'],
      ]),
    ],
    plan: [
      'What is the event, and why?',
      'When and where is it happening?',
      'What are you going to do there?',
      'In the reply: yes or no? Why?',
    ],
  },

  /* ── 10 · Promises and predictions: will, might, may ─────────── */
  {
    n: 10, orderFrom: 18,
    grammar: [[
      remember([
        "will + verb: predictions, offers, promises and decisions now: I'll help you. - للتوقّع والعرض والوعد والقرار.",
        'might / may + verb: maybe, not sure: It might rain. - لما هو ممكن وغير مؤكّد.',
        "Negative: won't, might not, may not. - هكذا ننفي هذه الأفعال.",
      ]),
      choose('will, might or shall?', [
        ["Don't worry, I ___ tell anyone.", ["won't", 'might', 'shall'], 0],
        ["I'm not sure, but I ___ go to Tangier next week.", ['might', 'will', 'shall'], 0],
        ['___ I open the window?', ['Will', 'Shall', 'Might'], 1],
        ["I'm sure she ___ pass. She worked very hard.", ['will', 'might', 'may'], 0],
        ['Take an umbrella. It ___ rain.', ['may', 'shall', 'wills'], 0],
        ["A: The phone's ringing. B: I ___ answer it.", ["'ll", "'m", 'shall to'], 0],
        ['He ___ not come. He has a lot of work.', ['might', 'will', 'shall'], 0],
        ['I promise I ___ call you every day.', ['will', 'might', 'may'], 0],
      ]),
      complete('Offers and promises', "Complete with will or won't and the verb. - أكمل بالفعل المناسب.", [
        ['This box is heavy! — I ___ (help) you.', "'ll help"],
        ["I'm cold. — I ___ (close) the window.", "'ll close"],
        ["Please keep it a secret. — Don't worry, I ___ (tell) anyone.", "won't tell"],
        ["I haven't got any money. — I ___ (lend) you some.", "'ll lend"],
        ['Promise you ___ (be) late again!', "won't be"],
        ['I ___ (call) you as soon as I arrive.', "'ll call"],
        ['I ___ (not / forget) your birthday this year!', "won't forget"],
        ["The restaurant is full. — OK, we ___ (go) somewhere else.", "'ll go"],
      ]),
      complete('Sure or not sure?', 'Write the sentence again with might. - أعد كتابة الجملة لتعبّر عن احتمال.', [
        ['Maybe it will rain.', 'It might rain.'],
        ["Maybe she won't come.", 'She might not come.'],
        ['Maybe we will move to Agadir.', 'We might move to Agadir.'],
        ["Maybe they won't like it.", 'They might not like it.'],
        ['Maybe I will be late.', 'I might be late.'],
        ['Maybe the shop will close early.', 'The shop might close early.'],
      ], 1, true),
    ], [
      complete("Younes's café: predictions", "Complete with will, won't or might. - أكمل بالكلمة المناسبة.", [
        ["I'm sure the café ___ be a success.", 'will'],
        ['It ___ be slow at first. We are not sure.', 'might'],
        ["Don't worry. That ___ happen!", "won't"],
        ['I think the tourists ___ love it.', 'will'],
        ['We ___ open a second café one day. Who knows?', 'might'],
        ['I promise I ___ be there on opening day.', "'ll (will)"],
      ]),
      correct([
        ['I will to help you.', 'I will help you.'],
        ['It might rains later.', 'It might rain later.'],
        ["She don't will come.", "She won't come."],
        ['Will I carry your bag?', 'Shall I carry your bag?'],
        ['He wills be there.', 'He will be there.'],
        ['Maybe I might go.', 'I might go.'],
      ]),
    ]],
    aboutYou: [
      'What will you definitely do next year?',
      'What might you do this summer?',
      'What do you think the world will be like in 2050?',
      'What promise can you make to yourself?',
    ],
    writing: [
      join([
        ["I'll finish my course. I'll take the exam. (and)", "I'll finish my course and I'll take the exam."],
        ["I might fail the first time. I won't give up. (but)", "I might fail the first time, but I won't give up."],
        ["I want to be healthier. I'll walk to work. (so)", "I want to be healthier, so I'll walk to work."],
        ['I might travel. It depends on money. (but)', 'I might travel, but it depends on money.'],
        ["I'm excited. It'll be a great year. (because)", "I'm excited because it'll be a great year."],
      ]),
      fromBank('Sure or not sure?', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ["I'll ___ finish my course. I'm sure.", 'definitely'],
        ["I'll ___ take the exam in June, but I'm not completely sure.", 'probably'],
        ['I ___ join a gym. Maybe!', 'might'],
        ["I ___ give up. That's a promise.", "won't"],
        ['___, I want to be healthier.', 'Second'],
        ["I promise ___ that I won't waste time.", 'myself'],
      ]),
    ],
    plan: [
      'What are two or three goals for next year?',
      'What will definitely happen?',
      'What might happen?',
      'What do you promise yourself?',
    ],
  },

  /* ── 11 · If it rains…: zero & first conditional ──────────────── */
  {
    n: 11, orderFrom: 19,
    grammar: [[
      remember([
        'Zero conditional: if + present, present, for facts: If you heat ice, it melts. - للحقائق العامة.',
        "First conditional: if + present, will + verb, for possible situations: If it rains, we'll stay home. - لموقف ممكن في المستقبل.",
        'Never will after if. unless = if not. - لا نستعمل will بعد if، ومعنى unless: إذا لم.',
      ]),
      choose('Zero or first conditional?', [
        ['If you mix blue and yellow, you ___ green.', ['get', "'ll get", 'got'], 0],
        ['If it rains tomorrow, we ___ at home.', ['stay', "'ll stay", 'stayed'], 1],
        ["If I ___ coffee at night, I can't sleep.", ['drink', 'will drink', 'drank'], 0],
        ['I ___ you if I need help.', ["'ll call", 'call', 'called'], 0],
        ['If he ___ late again, the boss will be angry.', ['is', 'will be', 'was'], 0],
        ["___ you leave now, you'll miss the train.", ['If', 'Unless', 'When'], 1],
        ['What will you do if they ___ you the job?', ['offer', 'will offer', 'offered'], 0],
        ['If you press this button, the machine ___.', ['starts', 'will starts', 'started'], 0],
      ]),
      complete('Complete the first conditional', 'Use the verbs in brackets. - استعمل الأفعال بين القوسين.', [
        ['If you ___ (go) to Fes, you ___ (love) the medina.', "go / 'll love"],
        ['If it ___ (be) too hot, we ___ (go) to the museum.', "'s / 'll go"],
        ["You ___ (not / get) lost if you ___ (take) a guide.", "won't get / take"],
        ['If she ___ (call), I ___ (tell) her the news.', "calls / 'll tell"],
        ['We ___ (miss) the bus unless we ___ (run).', "'ll miss / run"],
        ['If you ___ (be) hungry, I ___ (make) some tea.', "'re / 'll make"],
        ['___ you ___ (come) with me if I ___ (go)?', 'Will / come / go'],
        ["If they ___ (not / hurry), they ___ (be) late.", "don't hurry / 'll be"],
      ]),
      complete('Facts: the zero conditional', 'Complete with the present simple. - أكمل بالمضارع البسيط.', [
        ['If you heat water to 100°C, it ___ (boil).', 'boils'],
        ["If I ___ (not / sleep) well, I feel terrible.", "don't sleep"],
        ['If it ___ (rain) in Fes, the streets get slippery.', 'rains'],
        ["If you ___ (take) a petit taxi, it's cheap.", 'take'],
        ["Plants die if they ___ (not / get) water.", "don't get"],
        ['If my son ___ (be) ill, I stay at home.', 'is'],
      ]),
    ], [
      complete('Give advice with if', 'Write one sentence with the words. - اكتب جملة واحدة بهذه الكلمات.', [
        ['you / have time / love the tanneries', "If you have time, you'll love the tanneries."],
        ['you / go early / not see many tourists', "If you go early, you won't see many tourists."],
        ['it / rain / visit the museum', 'If it rains, visit the museum.'],
        ['you / get lost / ask a shopkeeper', 'If you get lost, ask a shopkeeper.'],
        ['you / be hungry / try the bissara', "If you're hungry, try the bissara."],
        ['you / go at sunset / see the whole city', "If you go at sunset, you'll see the whole city."],
      ], 1, true),
      correct([
        ["If it will rain, we'll stay home.", "If it rains, we'll stay home."],
        ['If you will come, I will cook.', "If you come, I'll cook."],
        ["Unless you don't hurry, you'll be late.", "Unless you hurry, you'll be late."],
        ['If you heat ice, it will melts.', 'If you heat ice, it melts.'],
        ['If I see him, I tell him tomorrow.', "If I see him, I'll tell him tomorrow."],
        ["If you go early, you don't will see tourists.", "If you go early, you won't see tourists."],
      ]),
    ]],
    aboutYou: [
      'What will you do if it rains this weekend?',
      "What do you do if you can't sleep?",
      'If a friend visits your town, where will you take them?',
      'What will you do if you pass your English exam?',
    ],
    writing: [
      join([
        ["You'll love the medina. Go early. (but)", "You'll love the medina, but go early."],
        ["It's very hot in June. Walk in the evening. (so)", "It's very hot in June, so walk in the evening."],
        ["Take a petit taxi. It's cheap. (because)", "Take a petit taxi because it's cheap."],
        ["The medina is like a maze. It's beautiful. (but)", "The medina is like a maze, but it's beautiful."],
        ['Visit the tanneries. Go up to a terrace. (and)', 'Visit the tanneries and go up to a terrace.'],
      ]),
      fromBank('Suggestions for a visitor', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ["If you have time, you'll ___ the tanneries.", 'love'],
        ['If you go early, you ___ see many tourists.', "won't"],
        ['___ it rains, visit the museum.', 'If'],
        ['The medina is best on ___.', 'foot'],
        ['Always ask the driver to use the ___.', 'meter'],
        ['Call me if you ___ anything!', 'need'],
      ]),
    ],
    plan: [
      'Who is visiting your town, and when?',
      'Which two or three places will you suggest?',
      'What practical advice will you give: transport, food, weather?',
      'What is your plan B if it rains?',
    ],
  },

  /* ── 12 · If I were you…: second conditional ──────────────────── */
  {
    n: 12, orderFrom: 6,
    grammar: [[
      remember([
        "Second conditional: if + past, would + verb, for imagined situations: If I had time, I'd travel. - لموقف متخيَّل.",
        "Advice: If I were you, I'd… - للنصيحة: لو كنت مكانك.",
        "would = 'd · negative: wouldn't. - هكذا نختصر would وننفيها.",
      ]),
      choose('First or second conditional?', [
        ["If I ___ a lot of money, I'd buy a riad.", ['have', 'had', 'will have'], 1],
        ['If it rains tomorrow, we ___ stay at home.', ["'ll", "'d", 'would'], 0],
        ['If I were you, I ___ accept the offer.', ['will', 'would', 'am'], 1],
        ['What ___ you do if you lost your phone?', ['will', 'would', 'did'], 1],
        ['If she studies, she ___ pass.', ["'ll", "'d", 'would'], 0],
        ['If we lived by the sea, we ___ swim every day.', ['will', 'would', 'are'], 1],
        ["If I ___ you, I wouldn't sign it.", ['am', 'was being', 'were'], 2],
        ['He would be happier if he ___ a better job.', ['has', 'had', 'will have'], 1],
      ]),
      complete('Complete the second conditional', 'Use the verbs in brackets. - استعمل الأفعال بين القوسين.', [
        ['If I ___ (have) a car, I ___ (visit) you every week.', "had / 'd visit"],
        ['If she ___ (speak) English, she ___ (get) a better job.', "spoke / 'd get"],
        ['We ___ (buy) a house if we ___ (have) enough money.', "'d buy / had"],
        ['If I ___ (be) you, I ___ (talk) to him.', "were / 'd talk"],
        ["If it ___ (not / be) so expensive, I ___ (go).", "weren't (wasn't) / 'd go"],
        ['What ___ you ___ (do) if you ___ (win) the lottery?', 'would / do / won'],
        ['If he ___ (live) nearer, we ___ (see) him more.', "lived / 'd see"],
        ["I ___ (not / work) there if they ___ (pay) me double!", "wouldn't work / paid"],
      ]),
      complete('Not real: write it again', 'Write a sentence with If… - اكتب جملة شرطية متخيَّلة.', [
        ["I don't have a car, so I don't drive to work. (If I…)", "If I had a car, I'd drive to work."],
        ["She lives far away, so we don't see her often. (If she…)", "If she lived nearer, we'd see her more often."],
        ["I don't speak Spanish, so I can't work in Madrid. (If I…)", 'If I spoke Spanish, I could work in Madrid.'],
        ["He works too much, so he's always tired. (If he…)", "If he didn't work so much, he wouldn't be tired."],
        ["It's expensive, so we won't buy it. (If it…)", "If it were cheaper, we'd buy it."],
        ["I'm not rich, so I can't travel the world. (If I…)", "If I were rich, I'd travel the world."],
      ], 1, true),
    ], [
      complete('Give advice', "Write advice with If I were you, I'd… - اكتب نصيحة.", [
        ['My phone is very old. (buy a new one)', "If I were you, I'd buy a new one."],
        ["I'm always tired. (go to bed earlier)", "If I were you, I'd go to bed earlier."],
        ["I can't decide about the job in Dubai. (talk to your family)", "If I were you, I'd talk to your family."],
        ["My English isn't good. (practise every day)", "If I were you, I'd practise every day."],
        ["I don't like my flat. (look for a new one)", "If I were you, I'd look for a new one."],
        ['My boss is always angry. (talk to him)', "If I were you, I'd talk to him."],
      ], 1, true),
      correct([
        ["If I would have time, I'd help you.", "If I had time, I'd help you."],
        ['If I were you, I will go.', "If I were you, I'd go."],
        ['If I was rich, I buy a riad.', "If I were rich, I'd buy a riad."],
        ['What you would do?', 'What would you do?'],
        ['She would to come with us.', 'She would come with us.'],
        ['If he studied, he will pass.', 'If he studied, he would pass.'],
      ]),
    ]],
    aboutYou: [
      'What would you do if you won the lottery?',
      'Where would you live if you could choose any city?',
      'What would you change in your town if you were the mayor?',
      'What advice would you give a friend who wants to work abroad?',
    ],
    writing: [
      join([
        ["You'd earn more. You'd be far from your family. (but)", "You'd earn more, but you'd be far from your family."],
        ['She would want you to go. She loves you. (because)', 'She would want you to go because she loves you.'],
        ["If you went, you'd learn a lot. You could help your family. (and)", "If you went, you'd learn a lot and you could help your family."],
        ['You might not like it. You could come back. (but)', 'You might not like it, but you could come back.'],
        ["It's a great chance. I'd accept. (so)", "It's a great chance, so I'd accept."],
      ]),
      fromBank('An advice email', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['Thanks for your ___. I understand.', 'message'],
        ["It's a difficult ___.", 'decision'],
        ['If you ___, you would earn a lot more.', 'went'],
        ["If I ___ you, I'd talk to your mother first.", 'were'],
        ['You ___ also ask for a one-year contract.', 'should'],
        ["___ you decide, I'm with you.", 'Whatever'],
      ]),
    ],
    plan: [
      "What is your friend's problem?",
      'What would happen if they said yes?',
      'What would happen if they said no?',
      'What is your advice?',
    ],
  },
]

/** Module 3 test: two pages, 40 points (the score table on the second page adds them up). */
export const TEST_3: [Block[], Block[]] = [[
  { t: 'banner', title: 'Module 3 test - اختبار المحور الثالث', icons: ['🏁', '⭐'], tone: 'practice' },
  { t: 'callout', text: 'أجب دون أن تنظر إلى الكتاب، في 40 دقيقة تقريبًا. بعد ذلك صحّح أجوبتك في آخر الدفتر، واكتب نتيجتك في الجدول.' },
  fromBank('Vocabulary', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
    ["Thanks for the ___! I'd love to come.", 'invitation'],
    ["Don't tell her. It's a ___!", 'surprise'],
    ["I'm sure your café will be a ___.", 'success'],
    ['Thank you so much. I really ___ it.', 'appreciate'],
    ['If you get ___ in the medina, ask a shopkeeper.', 'lost'],
    ['Always ask the driver to use the ___.', 'meter'],
    ["Can I ask your ___? I don't know what to do.", 'advice'],
    ['Everyone feels ___ when they live far from home.', 'homesick'],
  ]),
  choose('Grammar', [
    ['What ___ on Saturday?', ['do you do', 'are you doing', 'you are doing'], 1],
    ["It's very cloudy. It's ___ to rain.", ['go', 'going', 'goes'], 1],
    ['I promise I ___ forget.', ["won't", "don't", 'am not'], 0],
    ['Take a jacket. It ___ be cold.', ['might', 'mights', 'will to'], 0],
    ["If it ___, we'll stay at home.", ['rains', 'will rain', 'rained'], 0],
    ['If you heat ice, it ___.', ['melts', 'will melt', 'melted'], 0],
    ["If I ___ you, I'd accept.", ['am', 'were', 'will be'], 1],
    ['What would you do if you ___ the lottery?', ['win', 'won', 'will win'], 1],
  ]),
], [
  { t: 'bar', title: 'Module 3 test (continued) - اختبار المحور الثالث', icon: '🏁', tone: 'practice' },
  correct([
    ["I'm going to visiting Fes.", "I'm going to visit Fes."],
    ['She wills call you.', 'She will call you.'],
    ["If it will rain, we'll stay home.", "If it rains, we'll stay home."],
    ['Will I open the window?', 'Shall I open the window?'],
    ["If I would have money, I'd travel.", "If I had money, I'd travel."],
    ['What you would do?', 'What would you do?'],
  ]),
  match('Expressions: question and answer', 'Write the letter of the answer. - اكتب حرف الجواب المناسب.', [
    ['Are you free on Saturday?', "Sorry, I'm working."],
    ['Would you like to come?', "I'd love to!"],
    ["I'm worried it won't work.", "Don't worry. I'm sure it'll be a success."],
    ['What will I do if it rains?', 'Visit the museum.'],
    ["I don't know what to do.", "If I were you, I'd accept."],
    ['Thanks for listening.', 'Anytime.'],
  ], 2),
  { t: 'bar', title: 'Writing - الكتابة', icon: '✍️', tone: 'writing' },
  { t: 'bullets', size: 13.5, items: ['Write six sentences: your plans for the weekend, your goals for next year, advice for a visitor to your town, and one dream. - اكتب ست جمل: خططك لعطلة نهاية الأسبوع، وأهدافك للسنة القادمة، ونصيحة لزائر مدينتك، وحلمًا واحدًا.'] },
  { t: 'lines', n: 5, grow: true },
  { t: 'grid', rows: [
    { dark: true, span: [1, 1, 1, 1, 1, 1], cells: ['Vocabulary', 'Grammar', 'Mistakes', 'Expressions', 'Writing', 'Total'] },
    { span: [1, 1, 1, 1, 1, 1], size: 14, cells: ['___ / 8', '___ / 8', '___ / 6', '___ / 6', '___ / 12', '___ / 40'] },
  ] },
]]
