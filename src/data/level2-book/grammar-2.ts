import type { Block } from '../level1-book.ts'
import { box, choose, complete, correct, grammarBar, inTalk, pair, practiceBar, table } from './helpers.ts'

/**
 * Module 2's grammar lessons (experiences and stories), four pages each as
 * in Module 1: the uses with examples, the form, the rule found in the
 * unit's conversation, the mistakes Arabic speakers make, then practice.
 */

export const GRAMMAR_2: Record<number, Block[][]> = {
  /* ── 5 · Past simple & past continuous ───────────────────────────── */
  5: [
    [
      grammarBar('Past continuous - الماضي المستمر', '🎞️'),
      { t: 'callout', text: 'نستعمل الماضي المستمر لما كان يحدث في لحظة معيّنة من الماضي، ولنصف المشهد في بداية القصة.' },
      pair(
        box('In progress at a time in the past - كان يحدث', ['At eight last night, I was watching TV.', 'What were you doing at noon?', 'We were having lunch at two.']),
        box('The scene of a story - المشهد', ['It was raining and it was getting dark.', 'People were walking to the mosque.', 'My sister was sleeping in the back.']),
      ),
      table('Form - التركيب', ['', 'I / he / she / it', 'you / we / they'], [
        ['+', 'I was working.', 'They were working.'],
        ['−', "She wasn't working.", "We weren't working."],
        ['?', 'Was he working?', 'Were you working?'],
        ['Short answers', "Yes, I was. No, he wasn't.", "Yes, they were. No, we weren't."],
      ], [0.9, 1.6, 1.6]),
      { t: 'chips', items: [['at 8 last night', 'في الثامنة البارحة'], ['at that moment', 'في تلك اللحظة'], ['all day yesterday', 'طوال يوم أمس'], ['while', 'بينما'], ['when', 'عندما']] },
      pair(
        box('Ask about the scene - اسأل عن المشهد', ['What were you doing when it happened?', 'Where were you going?', 'Was it raining?']),
        box('Spelling: -ing - التهجئة', ['drive → driving · make → making', 'stop → stopping · sit → sitting', 'study → studying · lie → lying']),
      ),
      { t: 'bullets', size: 13, items: [
        'was / were + verb + ing, like the present continuous but in the past. - التركيب: was أو were، ثم الفعل مع ing في آخره.',
        'State verbs stay in the past simple: I knew him. (not I was knowing) - أفعال الحالة تبقى في الماضي البسيط.',
      ] },
    ],
    [
      grammarBar('Past continuous and past simple together - الزمنان معًا', '🔀'),
      { t: 'callout', text: 'في القصة نستعمل الزمنين معًا: الماضي المستمر للحدث الطويل (الخلفية)، والماضي البسيط للحدث القصير الذي يقطعه.' },
      table(undefined, ['Long action: the background', 'Short action: it interrupts'], [
        ['I was driving to Marrakech', 'when the car stopped.'],
        ['While I was looking at the engine,', 'a truck stopped behind us.'],
        ['She was sleeping', 'when the phone rang.'],
        ['We were having dinner', 'when the lights went out.'],
      ], [1.3, 1.1]),
      pair(
        box('when + past simple - عندما', ['I was cooking when you called.', 'When you called, I was cooking.', 'When the rain started, we were walking home.']),
        box('while + past continuous - بينما', ['While I was cooking, you called.', 'You called while I was cooking.', 'While we were talking, the bus left.']),
      ),
      { t: 'bullets', size: 13, items: [
        'Two long actions at the same time: While I was cooking, my husband was cleaning. - حدثان طويلان في الوقت نفسه.',
        'Actions one after another: past simple only. I opened the door, saw the cat and laughed. - أحداث متتابعة: الماضي البسيط فقط.',
      ] },
      inTalk([
        'I was driving to Marrakech. → the scene - المشهد',
        'Suddenly, the car stopped. → a short action - حدث قصير',
        'While I was looking at the engine, a truck stopped behind us. → long and short - طويل وقصير',
        'When we arrived, everyone was still dancing. → what was happening - ما كان يحدث',
      ]),
    ],
    [
      grammarBar('Telling a story - حكي القصة', '📖'),
      { t: 'callout', text: 'القصة الجيدة تبدأ بالمشهد (الماضي المستمر)، ثم الأحداث بالترتيب (الماضي البسيط)، مع كلمات تربط بين المراحل.' },
      table('Story words - كلمات الحكي', ['Beginning', 'Middle', 'End'], [
        ['One day, … · Last summer, …', 'Suddenly, … · Then, … · After that, …', 'In the end, … · Finally, …'],
        ['It was a hot day. · I was walking…', 'Luckily, … · Unfortunately, …', 'I will never forget that day.'],
      ]),
      pair(
        box('Past simple: what happened - ماذا حدث', ['The car stopped.', 'I called my brother.', 'A mechanic came and fixed it.']),
        box('Past continuous: the background - الخلفية', ['It was raining.', 'My sister was sleeping.', 'Everyone was still dancing.']),
      ),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['I was knowing the answer.', 'I knew the answer.', 'الفعل know فعل حالة، فلا نضيف إليه ing حتى في الماضي.'],
        ['While I walked home, it started to rain.', 'While I was walking home, it started to rain.', 'بعد while يأتي الحدث الطويل بالماضي المستمر.'],
        ['They was waiting for the bus.', 'They were waiting for the bus.', 'مع they نستعمل were وليس was في الماضي المستمر.'],
        ['What you were doing at ten?', 'What were you doing at ten?', 'في السؤال يأتي were قبل الفاعل.'],
        ['I was go to work when I saw him.', 'I was going to work when I saw him.', 'بعد was نضع الفعل مع ing في آخره.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['I ___ TV when the lights went out.', ['watched', 'was watching', 'am watching'], 1],
        ['While we were driving, it ___ to snow.', ['started', 'was starting', 'starts'], 0],
        ['What ___ you doing at nine last night?', ['did', 'was', 'were'], 2],
        ['She ___ the door, saw her friends and smiled.', ['was opening', 'opened', 'opens'], 1],
        ['They ___ for the bus when it started to rain.', ['waited', 'were waiting', 'was waiting'], 1],
        ['I ___ him at the wedding. He was very kind.', ['was meeting', 'met', 'meet'], 1],
      ]),
      complete('Complete with the right form', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['At seven, the children ___ (play) in the garden.', 'were playing'],
        ['The phone ___ (ring) while I ___ (cook).', 'rang / was cooking'],
        ['___ you ___ (sleep) when I called?', 'Were / sleeping'],
        ["We ___ (not / watch) TV. We were reading.", "weren't watching"],
        ['He ___ (fall) while he ___ (run) for the bus.', 'fell / was running'],
        ['When I ___ (arrive), everyone ___ (dance).', 'arrived / was dancing'],
      ], 2),
      correct([
        ['I was see him yesterday.', 'I saw him yesterday.'],
        ['While I cooked, my phone was ringing.', 'While I was cooking, my phone rang.'],
        ['We was sleeping when you called.', 'We were sleeping when you called.'],
        ['What did you doing at ten?', 'What were you doing at ten?'],
        ['She was knowing the way.', 'She knew the way.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write what you were doing at eight last night.',
        'Write a sentence with when: I was … when …',
        'Write a sentence with while: While I was …, …',
      ] },
    ],
  ],

  /* ── 6 · Present perfect: experience ─────────────────────────────── */
  6: [
    [
      grammarBar('Present perfect: experience - الحاضر التام للتجارب', '🌍'),
      { t: 'callout', text: 'نستعمل الحاضر التام لنتحدّث عن تجاربنا في الحياة دون أن نذكر متى بالضبط. المهم هو التجربة، وليس الوقت.' },
      pair(
        box('Life experiences - تجارب الحياة', ["I've been to Agadir.", "She's tried sushi.", "We've seen that film."]),
        box('ever and never - قطّ', ['Have you ever been to Ifrane?', "I've never ridden a camel.", "It's the best meal I've ever had."]),
      ),
      table('Form - التركيب', ['', 'I / you / we / they', 'he / she / it'], [
        ['+', "I've visited Fes.", "She's visited Fes."],
        ['−', "I haven't visited Fes.", "He hasn't visited Fes."],
        ['?', 'Have you visited Fes?', 'Has she visited Fes?'],
        ['Short answers', "Yes, I have. No, I haven't.", "Yes, she has. No, she hasn't."],
      ], [0.9, 1.6, 1.6]),
      { t: 'bullets', size: 13, items: [
        "have + past participle: I have (I've) seen. She has (She's) seen. - التركيب: have مع التصريف الثالث للفعل.",
        "been to = visited and came back: I've been to Paris. - معناها: زرت المكان ورجعت منه.",
        'ever goes before the participle: Have you ever tried it? - تأتي ever قبل التصريف الثالث.',
      ] },
      pair(
        box('Questions and short answers - أسئلة وأجوبة', ['A: Have you ever been to Fes? B: Yes, I have.', "A: Has she ever flown? B: No, she hasn't.", 'A: Have they seen it? B: Yes, they have.']),
        box('How many times? - كم مرة؟', ["I've been there once.", "She's tried it twice.", "We've seen it three times."]),
      ),
      { t: 'chips', items: [['ever', 'قطّ في السؤال'], ['never', 'قطّ في النفي'], ['once', 'مرة'], ['twice', 'مرتين'], ['three times', 'ثلاث مرات'], ['many times', 'مرات كثيرة']] },
    ],
    [
      grammarBar('Past participles - التصريف الثالث', '🔤'),
      { t: 'callout', text: 'الأفعال المنتظمة تأخذ ed كما في الماضي البسيط. أما الأفعال الشاذة فلها صيغة ثالثة نحفظها.' },
      table(undefined, ['Verb', 'Past simple', 'Past participle'], [
        ['be', 'was / were', 'been'],
        ['go', 'went', 'gone / been'],
        ['see', 'saw', 'seen'],
        ['eat', 'ate', 'eaten'],
        ['do', 'did', 'done'],
        ['take', 'took', 'taken'],
        ['ride', 'rode', 'ridden'],
        ['fly', 'flew', 'flown'],
        ['swim', 'swam', 'swum'],
        ['meet', 'met', 'met'],
        ['drink', 'drank', 'drunk'],
        ['buy', 'bought', 'bought'],
      ], [1, 1.2, 1.2]),
      { t: 'bullets', size: 13, items: [
        'Regular verbs: the past participle is the same as the past simple: visit → visited, try → tried. - الأفعال المنتظمة: التصريف الثالث مثل الماضي.',
        'Learn irregular verbs in threes: go, went, gone. - احفظ الأفعال الشاذة بصيغها الثلاث معًا.',
      ] },
      inTalk([
        'Have you ever been to Merzouga? → an experience, no time - تجربة دون وقت',
        "I've never seen so many stars. → never - قطّ",
        'When did you go the first time? → a time: past simple - وقت محدّد',
        "It's the best trip I've ever had. → the best … ever - الأفضل على الإطلاق",
      ]),
    ],
    [
      grammarBar('Present perfect or past simple? - الحاضر التام أم الماضي البسيط؟', '⚖️'),
      table(undefined, ['Present perfect: when? not important', 'Past simple: a finished time'], [
        ["I've been to Merzouga.", 'I went there in 2019.'],
        ["She's tried camel meat.", 'She tried it last summer.'],
        ['Have you ever seen snow?', 'When did you see it?'],
        ["We've met before.", 'We met at the wedding.'],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        'First the experience (present perfect), then the details (past simple). - أولًا التجربة بالحاضر التام، ثم التفاصيل بالماضي البسيط.',
        'With yesterday, last week, in 2019 and ago: only the past simple. - مع كلمات الوقت المنتهي نستعمل الماضي البسيط فقط.',
      ] },
      { t: 'chips', items: [['ever', 'حاضر تام'], ['never', 'حاضر تام'], ['yesterday', 'ماضٍ بسيط'], ['last year', 'ماضٍ بسيط'], ['in 2019', 'ماضٍ بسيط'], ['two days ago', 'ماضٍ بسيط']] },
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['I have been to Agadir last year.', 'I went to Agadir last year.', 'مع last year نستعمل الماضي البسيط.'],
        ['Did you ever try sushi?', 'Have you ever tried sushi?', 'للسؤال عن التجارب نستعمل الحاضر التام.'],
        ["I've never went to Paris.", "I've never been to Paris.", 'بعد have نستعمل التصريف الثالث.'],
        ['She has saw that film.', 'She has seen that film.', 'التصريف الثالث للفعل see مختلف عن ماضيه.'],
        ["I haven't never tried it.", "I've never tried it.", 'لا نجمع بين النفي وكلمة never في جملة واحدة.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['___ you ever eaten couscous with milk?', ['Did', 'Have', 'Has'], 1],
        ["She's never ___ in a plane.", ['flew', 'flown', 'fly'], 1],
        ['We ___ to Ifrane last winter.', ['went', 'have gone', 'have been'], 0],
        ['A: Has he ever been to Spain? B: No, he ___.', ["didn't", "hasn't", "haven't"], 1],
        ["It's the best book I've ___ read.", ['never', 'ever', 'already'], 1],
        ['I ___ that film twice.', ['have seen', 'saw ever', 'see'], 0],
      ]),
      complete('Complete with the right form', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['I ___ (never / be) to Tangier.', "'ve never been"],
        ['___ she ever ___ (try) snails?', 'Has / tried'],
        ['We ___ (go) to Agadir in 2021.', 'went'],
        ["They ___ (not / see) the sea before.", "haven't seen"],
        ['___ you ___ (meet) my brother?', 'Have / met'],
        ['He ___ (visit) Fes three times.', "'s visited (has visited)"],
      ], 2),
      correct([
        ['I have visited Rabat last week.', 'I visited Rabat last week.'],
        ['Have you ever went to Spain?', 'Have you ever been to Spain?'],
        ['She have never tried it.', 'She has never tried it.'],
        ['Did you ever see snow?', 'Have you ever seen snow?'],
        ["We haven't never been there.", "We've never been there."],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write three places you have been to.',
        'Write two things you have never done.',
        'Write about one trip: when you went and what you did.',
      ] },
    ],
  ],

  /* ── 7 · Present perfect: just, yet, already, for, since ─────────── */
  7: [
    [
      grammarBar('just, already, yet - للتوّ، بالفعل، بعد', '📰'),
      { t: 'callout', text: 'نستعمل الحاضر التام للأخبار: لشيء حدث في الماضي القريب ونتيجته مهمة الآن. ومعه نستعمل الكلمات just و already و yet كثيرًا.' },
      pair(
        box('just: a very short time ago - للتوّ', ["I've just got engaged!", "She's just left.", "We've just eaten."]),
        box('already: sooner than expected - بالفعل', ["I've already started my new job.", "He's already finished his homework.", 'Have you already paid?']),
      ),
      ...box('yet: in questions and negatives - بعد', ['Have you found a flat yet?', "We haven't found a flat yet.", "The doctors haven't decided yet."]),
      pair(
        box('Good news - أخبار سارّة', ["I've passed my exam!", "She's had a baby girl!", "We've found a flat!"]),
        box('Bad news - أخبار سيئة', ["I've lost my wallet.", "He's broken his arm.", 'Our car has broken down.']),
      ),
      table('Where do they go? - مكانها في الجملة', ['Word', 'Position', 'Example'], [
        ['just', 'between have and the verb', "I've just arrived."],
        ['already', 'between have and the verb', "She's already left."],
        ['yet', 'at the end', "Have you eaten yet? · I haven't eaten yet."],
      ], [0.8, 1.6, 1.8]),
    ],
    [
      grammarBar('for and since - منذ', '⏳'),
      { t: 'callout', text: 'نستعمل الحاضر التام مع for و since لشيء بدأ في الماضي وما زال مستمرًّا الآن.' },
      table(undefined, ['for + a period of time', 'since + a starting point'], [
        ['for two weeks', 'since Tuesday'],
        ['for three months', 'since March'],
        ['for ten years', 'since 2015'],
        ['for ages', 'since university'],
      ], [1, 1]),
      pair(
        box('Examples - أمثلة', ["I've lived here since March.", "She's worked at the bank for ten years.", "We've known each other since university."]),
        box('How long…? - منذ متى؟', ['How long have you lived here?', 'How long have you known Kenza?', 'How long have you been looking? (a useful question)']),
      ),
      { t: 'bullets', size: 13, items: [
        'In Arabic we say "I live here since March", but in English: I have lived here since March. - في العربية نستعمل المضارع، أما في الإنجليزية فالحاضر التام.',
      ] },
      inTalk([
        "I've just got engaged! → very new news - خبر جديد جدًّا",
        "I've already started. → sooner than expected - أسرع من المتوقّع",
        "We haven't found a flat yet. → not until now - لم يحدث حتى الآن",
        "I've lived here since March. → it started in March and it is still true - بدأ وما زال",
      ]),
    ],
    [
      grammarBar('Present perfect or past simple? - مراجعة', '⚖️'),
      table(undefined, ['Present perfect: news, now', 'Past simple: the story, then'], [
        ["I've just found a job.", 'I found it last week.'],
        ["He's broken his leg.", 'He broke it at football on Sunday.'],
        ["We've lived here since March.", 'We lived in Fes for two years.'],
        ['Have you heard the news?', 'When did you hear it?'],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        'News first (present perfect), then the details (past simple). - الخبر أولًا بالحاضر التام، ثم التفاصيل بالماضي البسيط.',
        'gone or been: He has gone to Fes (he is there now). He has been to Fes (he came back). - نستعمل gone لمن ما زال هناك، و been لمن عاد.',
      ] },
      ...box('Asking for news - السؤال عن الأخبار', ['Have you heard the news?', 'What have you been up to?', 'Has anything happened since I last saw you?']),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['I live here since 2018.', "I've lived here since 2018.", 'مع since و for لما ما زال مستمرًّا نستعمل الحاضر التام.'],
        ["I've lived here since three years.", "I've lived here for three years.", 'نستعمل for مع المدة، و since مع نقطة البداية.'],
        ["I've already finished it yesterday.", 'I finished it yesterday.', 'مع yesterday نستعمل الماضي البسيط.'],
        ['Did you find a flat yet?', 'Have you found a flat yet?', 'مع yet نستعمل الحاضر التام عادةً.'],
        ["I've finished just.", "I've just finished.", 'كلمة just تأتي قبل الفعل.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ["I can't come. I've ___ eaten.", ['yet', 'just', 'since'], 1],
        ['Have you finished your homework ___?', ['just', 'already', 'yet'], 2],
        ["She's lived in Tangier ___ 2018.", ['for', 'since', 'ago'], 1],
        ["We've known them ___ ten years.", ['since', 'for', 'from'], 1],
        ["Don't tell him. He ___ knows.", ['already', 'yet', 'since'], 0],
        ['How long ___ you had this car?', ['did', 'do', 'have'], 2],
      ]),
      complete('Complete with the right form', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['I ___ (just / see) your brother at the market.', "'ve just seen"],
        ['They ___ (not / decide) yet.', "haven't decided"],
        ['___ you ___ (finish) yet?', 'Have / finished'],
        ['She ___ (work) here for six months.', "'s worked (has worked)"],
        ['We ___ (already / pay) the rent.', "'ve already paid"],
        ['He ___ (be) ill since Monday.', "'s been (has been)"],
      ], 2),
      correct([
        ['I know him since 2015.', "I've known him since 2015."],
        ["We've been here since two hours.", "We've been here for two hours."],
        ["She hasn't called already.", "She hasn't called yet."],
        ["I've just see the film.", "I've just seen the film."],
        ['Did you already eat?', 'Have you already eaten?'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write one thing you have just done.',
        "Write one thing you haven't done yet this week.",
        'Write how long you have lived in your home, with for or since.',
      ] },
    ],
  ],

  /* ── 8 · Past perfect ────────────────────────────────────────────── */
  8: [
    [
      grammarBar('Past perfect - الماضي التام', '⏮️'),
      { t: 'callout', text: 'نستعمل الماضي التام لنقول إن شيئًا حدث قبل شيء آخر في الماضي. إنه الماضي قبل الماضي.' },
      table(undefined, ['First: past perfect', 'Then: past simple'], [
        ['The train had left', 'when I got to the station.'],
        ["I'd left my phone at home,", "so I couldn't call."],
        ['The party had finished', 'when I arrived.'],
        ['She had never seen snow', 'before she went to Ifrane.'],
      ], [1.2, 1]),
      table('Form - التركيب', ['', 'every person'], [
        ['+', "I had (I'd) left. · She had (She'd) left."],
        ['−', "We had not (hadn't) checked."],
        ['?', 'Had you eaten before you came?'],
        ['Short answers', "Yes, I had. · No, I hadn't."],
      ], [1, 3]),
      { t: 'bullets', size: 13, items: [
        'had + past participle, the same for every person. - نستعمل had مع التصريف الثالث لكل الضمائر.',
        "I'd = I had, or I would: I'd left (had). I'd like (would). - انتبه: I'd قد تعني had أو would حسب الجملة.",
      ] },
      pair(
        box('Giving reasons - الأسباب', ["I was late because I'd missed the bus.", "She was hungry because she hadn't eaten.", "They were tired because they'd worked all night."]),
        box('The first time - المرة الأولى', ["I'd never flown before that trip.", "He'd never seen the sea until he was twenty.", "We'd never eaten sushi before."]),
      ),
      { t: 'chips', items: [['before', 'قبل'], ['after', 'بعد'], ['already', 'بالفعل'], ['by the time', 'حين'], ['never … before', 'لم … من قبل']] },
    ],
    [
      grammarBar('Time words - كلمات الزمن', '🕰️'),
      { t: 'callout', text: 'هذه الكلمات تساعدنا على ترتيب الأحداث في الماضي: ما الذي حدث أولًا، وما الذي حدث بعده.' },
      pair(
        box('when, by the time - عندما، حين', ['When I got there, the shop had closed.', 'By the time we arrived, they had eaten.', 'When she called, I had already gone to bed.']),
        box('already, never, before - بالفعل، قطّ، من قبل', ['The film had already started.', "I'd never flown before that trip.", "They'd met before the wedding."]),
      ),
      table('Two events - حدثان', ['Sentence', 'What happened first?'], [
        ['When I arrived, the train left.', 'I arrived, then the train left.'],
        ['When I arrived, the train had left.', 'The train left, then I arrived.'],
      ], [1.6, 1.4]),
      inTalk([
        'When I got to the station, the train had already left. → the train left first - القطار غادر أولًا',
        "I'd left my phone at home. → that morning, before - في الصباح، قبل ذلك",
        'When I finally got home, the party had finished. → finished before he arrived - انتهى قبل وصوله',
        'Everyone had bought their tickets online. → before Ayoub came - قبل مجيء أيوب',
      ]),
    ],
    [
      grammarBar('Explaining what went wrong - شرح ما حدث', '🧩'),
      pair(
        box('Past simple: the main story - القصة', ['My meeting finished late.', 'I took a grand taxi.', 'I saw your messages at midnight.']),
        box('Past perfect: the reason, before - السبب', ['The train had already left.', "I'd left my phone at home.", "I hadn't checked my bag."]),
      ),
      { t: 'bullets', size: 13, items: [
        "If the order is clear (after, before), the past simple is OK too: After I'd eaten, I left. After I ate, I left. - إذا كان الترتيب واضحًا يصلح الماضي البسيط أيضًا.",
      ] },
      ...box('Sorry, and the reason - الاعتذار مع السبب', ["Sorry I'm late. I'd forgotten the address.", "Sorry I didn't call. My phone had died.", 'Sorry I missed it. Nobody had told me.']),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['When I arrived, the train has already left.', 'When I arrived, the train had already left.', 'في الماضي نستعمل had، أما has فللحاضر.'],
        ['I had went home.', 'I had gone home.', 'بعد had نستعمل التصريف الثالث.'],
        ["She didn't had eaten.", "She hadn't eaten.", 'ننفي بإضافة not بعد had مباشرة.'],
        ['I had seen him yesterday.', 'I saw him yesterday.', 'لحدث واحد مع yesterday نستعمل الماضي البسيط.'],
        ['When we had arrived, they left.', 'When we arrived, they had left.', 'الماضي التام للحدث الذي وقع أولًا فقط.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['When I got home, my brother ___ dinner.', ['already made', 'had already made', 'has already made'], 1],
        ["I didn't watch the film because I ___ it before.", ['had seen', 'have seen', 'saw'], 0],
        ['By the time the police came, the thief ___.', ['escaped', 'had escaped', 'has escaped'], 1],
        ['She was hungry because she ___ breakfast.', ["didn't have", "hadn't had", "hasn't had"], 1],
        ['When we arrived at the cinema, the film ___ started.', ['has', 'had', 'did'], 1],
        ['___ you ever been to Spain before that trip?', ['Have', 'Did', 'Had'], 2],
      ]),
      complete('Complete with the right form', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['When I arrived, the meeting ___ (already / start).', 'had already started'],
        ['I ___ (never / see) snow before I went to Ifrane.', "'d never seen (had never seen)"],
        ["We couldn't get in because I ___ (lose) the key.", 'had lost'],
        ['___ she ___ (finish) when you called?', 'Had / finished'],
        ["They ___ (not / book) a table, so they waited.", "hadn't booked"],
        ['When the bus came, we ___ (wait) for an hour.', "'d waited (had waited)"],
      ], 2),
      correct([
        ['When I arrived, she has left.', 'When I arrived, she had left.'],
        ['I had forget my keys.', 'I had forgotten my keys.'],
        ["We didn't had eaten.", "We hadn't eaten."],
        ['The film had started when we had arrived.', 'The film had started when we arrived.'],
        ['I had met him last week.', 'I met him last week.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write about a time you were late. What had happened?',
        'Write something you had never done before this year.',
        'Write two sentences with when and the past perfect.',
      ] },
    ],
  ],
}
