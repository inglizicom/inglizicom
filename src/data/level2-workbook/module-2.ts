import type { Block } from '../level1-book.ts'
import type { L2WorkUnit } from './types.ts'
import { choose, complete, correct } from '../level2-book/helpers.ts'
import { fromBank, join, match, remember } from './helpers.ts'

/**
 * Workbook, Module 2 — Experiences and stories. New sentences on each
 * unit's grammar (none copied from the textbook's practice), the mistakes
 * Arabic speakers really make, and the writing skill each unit's text needs.
 */

export const WORK_2: L2WorkUnit[] = [
  /* ── 5 · What happened? past simple & past continuous ─────────── */
  {
    n: 5, orderFrom: 14,
    grammar: [[
      remember([
        'Past continuous: was / were + -ing, for the background: It was raining. - للخلفية: ما كان يحدث.',
        'Past simple: the short actions, the events: Suddenly, the car stopped. - للأحداث القصيرة.',
        'while + the long action · when + the short action. - نستعمل while مع الحدث الطويل، و when مع القصير.',
      ]),
      choose('Past simple or past continuous?', [
        ['I ___ a shower when the phone rang.', ['had', 'was having', 'have'], 1],
        ['When the film ended, we ___ home.', ['went', 'were going', 'go'], 0],
        ['What ___ you doing at ten last night?', ['was', 'did', 'were'], 2],
        ['It ___ when we left the house.', ['was snowing', 'snowed', 'snows'], 0],
        ['While she was shopping, someone ___ her bag.', ['was stealing', 'stole', 'steals'], 1],
        ['They ___ dinner when I arrived.', ['were having', 'had', 'was having'], 0],
        ['I ___ my keys, so I called my brother.', ['was losing', 'lost', 'lose'], 1],
        ["We ___ TV. We were reading.", ["weren't watching", "didn't watching", "wasn't watching"], 0],
      ]),
      complete('was or were + -ing', 'Complete with the past continuous. - أكمل بالماضي المستمر.', [
        ['My father ___ (sleep) on the sofa.', 'was sleeping'],
        ['The children ___ (play) in the street.', 'were playing'],
        ['I ___ (not / listen) to the teacher.', "wasn't listening"],
        ['___ it ___ (rain) when you left?', 'Was / raining'],
        ['We ___ (wait) for the bus for an hour.', 'were waiting'],
        ['She ___ (talk) on the phone all evening.', 'was talking'],
        ['You ___ (not / drive) very fast.', "weren't driving"],
        ['What ___ they ___ (do) in the kitchen?', 'were / doing'],
      ], 2),
      complete('A night in Chefchaouen', 'Put the verbs in the right form. - ضع الأفعال في الصيغة المناسبة.', [
        ['Last spring, I ___ (visit) Chefchaouen with two friends.', 'visited'],
        ['One evening, we ___ (walk) in the blue streets.', 'were walking'],
        ['The sun ___ (go) down and people ___ (go) home.', 'was going · were going'],
        ["Suddenly, a little cat ___ (jump) on my friend's bag!", 'jumped'],
        ['She ___ (scream), and everyone ___ (laugh).', 'screamed · laughed'],
        ['While we ___ (laugh), an old man ___ (open) his door.', 'were laughing · opened'],
        ['He ___ (invite) us in for tea.', 'invited'],
        ['In the end, we ___ (stay) at his house until ten!', 'stayed'],
      ]),
    ], [
      complete('Join them with when or while', 'Write one sentence. - اكتب جملة واحدة بالكلمة التي بين القوسين.', [
        ['I was cooking. The phone rang. (when)', 'I was cooking when the phone rang.'],
        ['We were driving. We saw an accident. (while)', 'While we were driving, we saw an accident.'],
        ['She was sleeping. The baby started to cry. (when)', 'She was sleeping when the baby started to cry.'],
        ['They were walking home. It started to rain. (while)', 'While they were walking home, it started to rain.'],
        ['I was reading. The lights went out. (when)', 'I was reading when the lights went out.'],
        ['He was running for the bus. He fell. (while)', 'He fell while he was running for the bus.'],
      ], 1, true),
      correct([
        ['I was knowing the answer.', 'I knew the answer.'],
        ['While I cooked, the phone was ringing.', 'While I was cooking, the phone rang.'],
        ['They was playing football.', 'They were playing football.'],
        ['What you were doing at nine?', 'What were you doing at nine?'],
        ['I was go to the market when I saw her.', 'I was going to the market when I saw her.'],
        ['We was watching TV when you called.', 'We were watching TV when you called.'],
      ]),
    ]],
    aboutYou: [
      "What were you doing at eight o'clock last night?",
      'What happened on your last trip?',
      'When did you last have a surprise? What happened?',
      'Tell a story about a time you were lucky.',
    ],
    writing: [
      join([
        ['I was walking home. It started to rain. (when)', 'I was walking home when it started to rain.'],
        ['We were near Chichaoua. The car stopped. (when)', 'We were near Chichaoua when the car stopped.'],
        ['I tried to call my brother. There was no signal. (but)', 'I tried to call my brother, but there was no signal.'],
        ['It was very dark. I was scared. (so)', 'It was very dark, so I was scared.'],
        ['We arrived late. The car broke down. (because)', 'We arrived late because the car broke down.'],
      ]),
      fromBank('Story words', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['___ summer, I went to Essaouira with my family.', 'Last'],
        ['___, the weather was great.', 'At first'],
        ['___, on the third day, a strong wind started.', 'Then'],
        ['___ we were walking on the beach, my hat flew away!', 'While'],
        ['___, a young boy ran and caught it.', 'Luckily'],
        ['___, I bought him an ice cream to say thank you.', 'In the end'],
      ]),
    ],
    plan: [
      'When and where did it happen?',
      'What was happening at the start (the scene)?',
      'What happened? Write three events in order.',
      'How did it end, and how did you feel?',
    ],
  },

  /* ── 6 · Have you ever…? present perfect (experience) ─────────── */
  {
    n: 6, orderFrom: 13,
    grammar: [[
      remember([
        "have / has + past participle, for life experiences: I've been to Ifrane. - للتجارب في الحياة.",
        "ever in questions, never in answers: Have you ever…? I've never… - نستعمل ever في السؤال و never في النفي.",
        'A finished time (last year, in 2019): the past simple. - مع وقت منتهٍ نستعمل الماضي البسيط.',
      ]),
      complete('Past participles', 'Write the past participle. - اكتب التصريف الثالث.', [
        ['be → ___', 'been'], ['see → ___', 'seen'], ['eat → ___', 'eaten'], ['go → ___', 'gone / been'], ['take → ___', 'taken'],
        ['ride → ___', 'ridden'], ['fly → ___', 'flown'], ['swim → ___', 'swum'], ['try → ___', 'tried'], ['write → ___', 'written'],
      ], 2),
      choose('Present perfect or past simple?', [
        ['___ you ever been to Spain?', ['Did', 'Have', 'Were'], 1],
        ['I ___ to Spain in 2022.', ['have gone', 'went', 'have been'], 1],
        ["She's never ___ a camel.", ['rode', 'ridden', 'ride'], 1],
        ['A: Have you ever tried snails? B: Yes, I ___.', ['did', 'have', 'tried'], 1],
        ['When ___ you go to Fes?', ['have', 'did', 'were'], 1],
        ["It's the best film I've ___ seen.", ['ever', 'never', 'yet'], 0],
        ['We ___ that restaurant last week.', ['have tried', 'tried', 'try'], 1],
        ['He ___ never flown in a plane.', ['have', 'has', 'is'], 1],
      ]),
      complete('Questions and answers', 'Complete with the present perfect or the past simple. - أكمل بالزمن المناسب.', [
        ['A: ___ you ever ___ (eat) camel meat?', 'Have / eaten'],
        ["B: No, I ___. But I ___ (try) snails.", "haven't · 've tried"],
        ['A: ___ your sister ever ___ (be) abroad?', 'Has / been'],
        ["B: Yes, she ___ (be) to Turkey twice.", "'s been (has been)"],
        ['A: ___ you ever ___ (see) the dunes in Merzouga?', 'Have / seen'],
        ['B: No, never. I ___ (never / be) to the desert.', "'ve never been"],
        ['A: ___ they ___ (meet) your new boss?', 'Have / met'],
        ['B: Yes, they ___. They ___ (meet) him last week.', 'have · met'],
      ]),
    ], [
      complete('Ask about experiences', 'Write the question with Have you ever…? - اكتب السؤال عن التجربة.', [
        ['sleep in a tent', 'Have you ever slept in a tent?'],
        ['ride a horse', 'Have you ever ridden a horse?'],
        ['eat snails', 'Have you ever eaten snails?'],
        ['be to Tangier', 'Have you ever been to Tangier?'],
        ['meet a famous person', 'Have you ever met a famous person?'],
        ['fly in a plane', 'Have you ever flown in a plane?'],
      ], 1, true),
      correct([
        ['I have been to Agadir last summer.', 'I went to Agadir last summer.'],
        ['Have you ever went to Spain?', 'Have you ever been to Spain?'],
        ['She have never tried it.', 'She has never tried it.'],
        ['Did you ever eat camel meat?', 'Have you ever eaten camel meat?'],
        ["I haven't never seen snow.", "I've never seen snow."],
        ["It's the best trip I never had.", "It's the best trip I've ever had."],
      ]),
    ]],
    aboutYou: [
      'What is the most beautiful place you have ever been to?',
      'What is something you have never tried, but want to try?',
      'Have you ever travelled abroad? Where?',
      'What is the best meal you have ever had?',
    ],
    writing: [
      join([
        ["I've been to Merzouga. I've never slept in a tent. (but)", "I've been to Merzouga, but I've never slept in a tent."],
        ['We stayed in a camp. We rode camels. (and)', 'We stayed in a camp and we rode camels.'],
        ["It was very cold. We didn't sleep much. (so)", "It was very cold, so we didn't sleep much."],
        ["You should go in spring. It isn't too hot. (because)", "You should go in spring because it isn't too hot."],
        ["I've visited a lot of cities. I've never seen the desert. (but)", "I've visited a lot of cities, but I've never seen the desert."],
      ]),
      fromBank('Giving advice', 'Complete the email with the words in the box. - أكمل الرسالة بالكلمات التي في الإطار.', [
        ['You ___ book a camp before you go.', 'should'],
        ["Don't ___ to take a warm jacket.", 'forget'],
        ["___ the camel tagine. It's delicious!", 'Try'],
        ['The best time to go is ___ spring.', 'in'],
        ['I ___ the camp near the big dunes.', 'recommend'],
        ['Have a great ___!', 'trip'],
      ]),
    ],
    plan: [
      'Where is your friend going? Have you been there?',
      'When did you go, who with, and where did you stay?',
      'What did you do there? What have you never done?',
      'What advice will you give?',
    ],
  },

  /* ── 7 · Good news, bad news: just, yet, already, for, since ──── */
  {
    n: 7, orderFrom: 5,
    grammar: [[
      remember([
        "just means a very short time ago: I've just eaten. - معناها: للتوّ.",
        "already is sooner than expected; yet is used in questions and negatives. - معناهما: بالفعل، وبعد.",
        'for + a period (two weeks) · since + a starting point (March). - نستعمل for مع المدة، و since مع البداية.',
      ]),
      choose('just, already or yet?', [
        ["Don't make tea. I've ___ had one.", ['just', 'yet', 'since'], 0],
        ['Have you booked the hall ___?', ['already', 'just', 'yet'], 2],
        ["We've ___ paid. You don't need to pay.", ['already', 'yet', 'for'], 0],
        ["The doctor hasn't called ___.", ['already', 'yet', 'just'], 1],
        ["She's ___ left. You missed her by a minute!", ['yet', 'just', 'since'], 1],
        ["I haven't decided ___.", ['just', 'already', 'yet'], 2],
        ['Have you ___ finished? That was fast!', ['yet', 'already', 'since'], 1],
        ["They've ___ moved into their new flat.", ['just', 'yet', 'for'], 0],
      ]),
      complete('for or since?', 'Write for or since. - اكتب الكلمة المناسبة.', [
        ['___ two weeks', 'for'], ['___ Monday', 'since'], ['___ 2019', 'since'], ['___ ten years', 'for'], ['___ my birthday', 'since'],
        ['___ a long time', 'for'], ['___ last summer', 'since'], ['___ three hours', 'for'], ['___ I was a child', 'since'], ['___ ages', 'for'],
      ], 2),
      complete('News from Kenza', 'Put the verbs in the present perfect. - ضع الأفعال في الحاضر التام.', [
        ["Big news! Rachid and I ___ (just / find) a hall for the wedding.", "'ve just found"],
        ['We ___ (already / send) the invitations.', "'ve already sent"],
        ["But I ___ (not / buy) my dress yet!", "haven't bought"],
        ['My mother ___ (be) so busy since March.', "'s been (has been)"],
        ['___ you ___ (book) your train ticket yet?', 'Have / booked'],
        ['We ___ (know) each other for ten years, so you must come!', "'ve known"],
      ]),
    ], [
      complete('How long…? Write the answer', 'Use the word in brackets. - استعمل الكلمة التي بين القوسين.', [
        ['She moved here in 2018. (since)', "She's lived here since 2018."],
        ['I started this job three months ago. (for)', "I've worked here for three months."],
        ['They met at university. (since)', "They've known each other since university."],
        ['He got ill on Tuesday. (since)', "He's been ill since Tuesday."],
        ['We bought this car five years ago. (for)', "We've had this car for five years."],
        ['I last saw her a long time ago. (for)', "I haven't seen her for a long time."],
      ], 1, true),
      correct([
        ['I live here since 2015.', "I've lived here since 2015."],
        ['She has worked here since five years.', 'She has worked here for five years.'],
        ["I didn't finish yet.", "I haven't finished yet."],
        ["We've already paid yesterday.", 'We paid yesterday.'],
        ["He's arrived just.", "He's just arrived."],
        ['How long do you know him?', 'How long have you known him?'],
      ]),
    ]],
    aboutYou: [
      'What have you just done today?',
      "What is something you haven't done yet this year?",
      'How long have you lived in your home?',
      'How long have you known your best friend?',
    ],
    writing: [
      join([
        ["I've just found a job. I'm very happy. (so)", "I've just found a job, so I'm very happy."],
        ["We've moved to Meknes. We haven't found a flat yet. (but)", "We've moved to Meknes, but we haven't found a flat yet."],
        ["I haven't written. I've been very busy. (because)", "I haven't written because I've been very busy."],
        ["My father is in hospital. The doctors haven't decided yet. (and)", "My father is in hospital and the doctors haven't decided yet."],
        ["I've already started. I like my colleagues. (and)", "I've already started and I like my colleagues."],
      ]),
      complete('Good news or bad news?', 'Write G (good news) or B (bad news). - هل الخبر سارّ أم سيئ؟', ([
        ["I've just got engaged!", 'G'], ['My car has broken down again.', 'B'],
        ["We've found a lovely flat.", 'G'], ["I've lost my wallet.", 'B'],
        ["She's passed her driving test.", 'G'], ["He's been ill for two weeks.", 'B'],
        ["I've got a promotion!", 'G'], ["Our flight has been cancelled.", 'B'],
      ] as [string, string][]).map(([q, a]) => [`${q} ___`, a] as [string, string]), 2),
    ],
    plan: [
      "Who are you writing to? Why haven't you written?",
      'What is your good news? Use just or already.',
      "What hasn't happened yet? How long has it been?",
      'What will you ask about their news?',
    ],
  },

  /* ── 8 · It had already left! past perfect ───────────────────── */
  {
    n: 8, orderFrom: 14,
    grammar: [[
      remember([
        'had + past participle: the past before the past. The train had left. - الماضي قبل الماضي.',
        'Past simple for the story, past perfect for what happened before. - الماضي البسيط للقصة، والماضي التام لما سبقها.',
        "Negative: hadn't. Question: Had you…? - هكذا ننفي ونسأل في الماضي التام.",
      ]),
      choose('Past simple or past perfect?', [
        ['When I got to the cinema, the film ___.', ['already started', 'had already started', 'has already started'], 1],
        ["I ___ him before, so I didn't know him.", ["hadn't met", "haven't met", "didn't met"], 0],
        ['She was tired because she ___ all night.', ['had worked', 'has worked', 'works'], 0],
        ['When we arrived, they ___ dinner, so we ate alone.', ['already had', 'had already had', 'have had'], 1],
        ['I ___ my keys, so I called my wife.', ['had lost', 'have lost', 'lose'], 0],
        ['___ you ever flown before that trip?', ['Have', 'Did', 'Had'], 2],
        ['When the police came, the thief ___.', ['had escaped', 'has escaped', 'escapes'], 0],
        ['I read the email, and then I ___ him.', ['had called', 'called', 'have called'], 1],
      ]),
      complete('had + past participle', 'Write the past perfect. - اكتب الماضي التام.', [
        ['she / leave → ___', 'she had left'], ['we / not / eat → ___', "we hadn't eaten"],
        ['they / finish → ___', 'they had finished'], ['I / forget → ___', 'I had forgotten'],
        ['he / never / see → ___', 'he had never seen'], ['you / pay? → ___', 'had you paid?'],
        ['the film / start → ___', 'the film had started'], ['we / not / book → ___', "we hadn't booked"],
      ], 2),
      complete('What had happened?', 'Complete with the past perfect. - أكمل بالماضي التام.', [
        ['When I got home, my sister ___ (cook) dinner.', 'had cooked'],
        ["I couldn't pay because I ___ (leave) my wallet in the car.", 'had left'],
        ['The shop was closed. It ___ (close) at six.', 'had closed'],
        ["He didn't come to the party because nobody ___ (invite) him.", 'had invited'],
        ['When we arrived at the station, the train ___ (not / leave) yet.', "hadn't left"],
        ['I was nervous. I ___ (never / speak) in public before.', "'d never spoken (had never spoken)"],
      ]),
    ], [
      complete('Which happened first? Join them', 'Write one sentence with when and the past perfect. - اكتب جملة واحدة.', [
        ['The bus left. Then I arrived at the stop.', 'When I arrived at the stop, the bus had left.'],
        ['The film started. Then we got to the cinema.', 'When we got to the cinema, the film had started.'],
        ['Everyone ate. Then Karim came home.', 'When Karim came home, everyone had eaten.'],
        ['The shop closed. Then she got there.', 'When she got there, the shop had closed.'],
        ['My friends left. Then I woke up.', 'When I woke up, my friends had left.'],
        ['The meeting finished. Then the boss arrived.', 'When the boss arrived, the meeting had finished.'],
      ], 1, true),
      correct([
        ['When I arrived, the train has left.', 'When I arrived, the train had left.'],
        ['I had forget my phone.', 'I had forgotten my phone.'],
        ["She didn't had eaten.", "She hadn't eaten."],
        ['I had met him last week.', 'I met him last week.'],
        ['When we had arrived, they left.', 'When we arrived, they had left.'],
        ['They had went home.', 'They had gone home.'],
      ]),
    ]],
    aboutYou: [
      'Have you ever missed a train or a bus? What had happened?',
      'What had you done before you came to class today?',
      'What had you never done before this year?',
      'When did you last say sorry? What had you done?',
    ],
    writing: [
      join([
        ['I missed the party. My train had left. (because)', 'I missed the party because my train had left.'],
        ["I'd left my phone at home. I couldn't call you. (so)", "I'd left my phone at home, so I couldn't call you."],
        ['I wanted to come. My meeting finished late. (but)', 'I wanted to come, but my meeting finished late.'],
        ["I'm really sorry. I feel terrible. (and)", "I'm really sorry and I feel terrible."],
        ['I took a taxi. It was too late. (but)', 'I took a taxi, but it was too late.'],
      ]),
      fromBank('Apologising', 'Complete the email with the words in the box. - أكمل الرسالة بالكلمات التي في الإطار.', [
        ["I'm really ___ about yesterday.", 'sorry'],
        ['I ___ terrible.', 'feel'],
        ['When I got there, the meeting had already ___.', 'finished'],
        ['Let me make it ___ to you.', 'up'],
        ['Are you ___ for lunch on Friday?', 'free'],
        ["I ___ it won't happen again.", 'promise'],
      ]),
    ],
    plan: [
      'Who are you writing to? What did you miss?',
      'What happened? What had happened before?',
      'How do you feel?',
      'How will you make it up to them?',
    ],
  },
]

/** Module 2 test: two pages, 40 points (the score table on the second page adds them up). */
export const TEST_2: [Block[], Block[]] = [[
  { t: 'banner', title: 'Module 2 test - اختبار المحور الثاني', icons: ['🏁', '⭐'], tone: 'practice' },
  { t: 'callout', text: 'أجب دون أن تنظر إلى الكتاب، في 40 دقيقة تقريبًا. بعد ذلك صحّح أجوبتك في آخر الدفتر، واكتب نتيجتك في الجدول.' },
  fromBank('Vocabulary', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
    ['The ___ fixed our car in an hour.', 'mechanic'],
    ['___, a family stopped and helped us.', 'Luckily'],
    ['We slept in a ___ under the stars.', 'tent'],
    ["I've been to Paris ___ and to Rome twice.", 'once'],
    ["You've got a new job? ___!", 'Congratulations'],
    ["I haven't seen you for ___!", 'ages'],
    ["I didn't hear my ___, so I was late.", 'alarm'],
    ['Let me make it up to you. Lunch is my ___!', 'treat'],
  ]),
  choose('Grammar', [
    ['I ___ TV when you called.', ['watched', 'was watching', 'have watched'], 1],
    ['While we were walking, it ___ to rain.', ['started', 'was starting', 'has started'], 0],
    ['Have you ever ___ to Spain?', ['went', 'gone', 'been'], 2],
    ['We ___ to Agadir last summer.', ['have been', 'went', 'had gone'], 1],
    ["I've ___ finished my homework. Can I go out?", ['yet', 'just', 'since'], 1],
    ["She's lived here ___ ten years.", ['for', 'since', 'ago'], 0],
    ['When I got there, the shop ___ closed.', ['has', 'had', 'was'], 1],
    ['Have you booked the tickets ___?', ['yet', 'already', 'just'], 0],
  ]),
], [
  { t: 'bar', title: 'Module 2 test (continued) - اختبار المحور الثاني', icon: '🏁', tone: 'practice' },
  correct([
    ['While I cooked, the phone rang.', 'While I was cooking, the phone rang.'],
    ['I have seen him yesterday.', 'I saw him yesterday.'],
    ['Did you ever try snails?', 'Have you ever tried snails?'],
    ['I know her since 2010.', "I've known her since 2010."],
    ['When we arrived, the film has started.', 'When we arrived, the film had started.'],
    ["She hasn't called already.", "She hasn't called yet."],
  ]),
  match('Expressions: question and answer', 'Write the letter of the answer. - اكتب حرف الجواب المناسب.', [
    ['How was your weekend?', "You won't believe what happened!"],
    ['Have you ever been to Merzouga?', "Yes, I've been there twice."],
    ['What was it like?', 'Amazing. We slept in a tent.'],
    ["I've just got engaged!", "Congratulations! That's great news!"],
    ["I'm so sorry about last night.", "Don't worry about it."],
    ["Why didn't you call me?", "I'd left my phone at home."],
  ], 2),
  { t: 'bar', title: 'Writing - الكتابة', icon: '✍️', tone: 'writing' },
  { t: 'bullets', size: 13.5, items: ['Write six sentences: a short story about a trip, one experience you have had, some news, and an apology. - اكتب ست جمل: قصة قصيرة عن رحلة، وتجربة عشتها، وخبرًا، واعتذارًا.'] },
  { t: 'lines', n: 5, grow: true },
  { t: 'grid', rows: [
    { dark: true, span: [1, 1, 1, 1, 1, 1], cells: ['Vocabulary', 'Grammar', 'Mistakes', 'Expressions', 'Writing', 'Total'] },
    { span: [1, 1, 1, 1, 1, 1], size: 14, cells: ['___ / 8', '___ / 8', '___ / 6', '___ / 6', '___ / 12', '___ / 40'] },
  ] },
]]
