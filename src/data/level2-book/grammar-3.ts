import type { Block } from '../level1-book.ts'
import { box, choose, complete, correct, grammarBar, inTalk, pair, practiceBar, table } from './helpers.ts'

/**
 * Module 3's grammar lessons (plans and the future), four pages each: the
 * uses with examples, the form, the rule found in the unit's conversation,
 * the mistakes Arabic speakers make, then practice.
 */

export const GRAMMAR_3: Record<number, Block[][]> = {
  /* ── 9 · going to & present continuous (future) ──────────────────── */
  9: [
    [
      grammarBar('going to: plans and intentions - النيّة والخطط', '🎯'),
      { t: 'callout', text: 'نستعمل going to لما قرّرنا أن نفعله في المستقبل (نيّة)، ولما نتوقّعه بناءً على ما نراه الآن.' },
      pair(
        box('Plans and intentions - النوايا', ["I'm going to clean the flat.", "We're going to book a table.", "She's going to study medicine."]),
        box('What we can see now - ما نراه الآن', ["Look at those clouds! It's going to rain.", "Hurry up! We're going to miss the bus.", "Be careful! You're going to fall."]),
      ),
      table('Form - التركيب', ['', 'Example'], [
        ['+', "I'm going to buy a cake. · She's going to call you."],
        ['−', "We aren't going to stay long."],
        ['?', 'Are you going to come? · What is he going to do?'],
        ['Short answers', "Yes, I am. · No, he isn't."],
      ], [1, 3]),
      { t: 'bullets', size: 13, items: [
        'going to + base verb: going to buy, going to see. - بعد going to يأتي الفعل في صيغته الأصلية.',
        "With go, we often just say: I'm going to the market (not going to go to). - مع الفعل go نختصر الجملة عادةً.",
      ] },
      pair(
        box('Questions about intentions - أسئلة عن النوايا', ['What are you going to do after the course?', 'Are you going to sell your car?', 'Where are they going to live?']),
        box('Time words - كلمات الزمن', ['tonight · tomorrow · this weekend', 'next week · next year · one day', 'soon · in June · after the wedding']),
      ),
    ],
    [
      grammarBar('Present continuous for the future - المضارع المستمر للمستقبل', '📅'),
      { t: 'callout', text: 'نستعمل المضارع المستمر لموعد مرتّب مع أشخاص آخرين، في وقت ومكان محدّدين: كأنه مكتوب في المفكّرة.' },
      pair(
        box('Arrangements - مواعيد مرتّبة', ["I'm meeting my cousins on Saturday.", "We're having lunch with my in-laws on Sunday.", 'Her husband is taking her to dinner at eight.']),
        box('Questions about plans - أسئلة عن الخطط', ['What are you doing this weekend?', 'Are you coming to the party?', 'When are you leaving?']),
      ),
      ...box('Saying no politely - الاعتذار بلطف', ["Sorry, I can't. I'm working on Saturday.", "I'd love to, but I'm visiting my grandmother.", "Not this time. We're flying to Paris on Friday."]),
      inTalk([
        "On Saturday morning I'm meeting my cousins. → an arrangement - موعد مرتّب",
        "I'm going to clean the flat. → an intention - نيّة",
        'Her husband is taking her there at eight. → arranged, with a time - مرتّب في وقت محدّد',
        "He's going to come late. → his plan - خطّته",
      ]),
    ],
    [
      grammarBar('going to or present continuous? - أيّهما نختار؟', '⚖️'),
      table(undefined, ['going to: I decided', 'Present continuous: it is arranged'], [
        ["I'm going to visit my aunt one day.", "I'm visiting my aunt on Sunday at four."],
        ["We're going to buy a car this year.", "We're picking up the car tomorrow."],
        ["She's going to learn Spanish.", 'Her class is starting on Monday.'],
        ['What are you going to do?', 'What are you doing tonight?'],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        "Often both are correct: I'm going to see Sara tonight. I'm seeing Sara tonight. - كثيرًا ما تصلح الصيغتان معًا.",
        "For a decision made now, we use will: The phone is ringing. I'll answer it! - للقرار في لحظة الكلام نستعمل will، وسندرسها في الوحدة العاشرة.",
      ] },
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ["I'm going to visiting my aunt.", "I'm going to visit my aunt.", 'بعد going to يأتي الفعل في صيغته الأصلية.'],
        ['I going to buy a car.', "I'm going to buy a car.", 'لا ننسى am أو is أو are قبل going to في الجملة.'],
        ['What do you do this weekend?', 'What are you doing this weekend?', 'للسؤال عن الخطط نستعمل المضارع المستمر.'],
        ["She's go to call you.", "She's going to call you.", 'نكتب going كاملة قبل to في هذه الصيغة.'],
        ["I'm meet my friends tomorrow.", "I'm meeting my friends tomorrow.", 'في المضارع المستمر نضيف ing إلى الفعل.'],
      ] },
      ...box('A week in my diary - أسبوع في مفكّرتي', ["Monday: I'm starting my new job.", "Wednesday: I'm going to call the bank about the loan.", "Friday: We're having dinner with Sara and Omar."]),
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['Look at the sky! It ___ rain.', ['is going to', 'goes to', 'is go to'], 0],
        ['What ___ this evening? Any plans?', ['do you do', 'are you doing', 'you doing'], 1],
        ["I'm ___ to study medicine next year.", ['go', 'going', 'goes'], 1],
        ["We ___ dinner with my parents on Sunday. It's arranged.", ['have', 'are having', 'had'], 1],
        ['___ she going to call you?', ['Does', 'Is', 'Will'], 1],
        ["They aren't ___ stay long.", ['going to', 'go', 'going'], 0],
      ]),
      complete('Complete with the right form', 'Use the words in brackets. - استعمل الكلمات بين القوسين.', [
        ['I ___ (meet) Sara at six tomorrow.', "'m meeting"],
        ["We ___ (not / go) to the party. We're tired.", "aren't going"],
        ['What ___ you ___ (do) for Eid this year?', 'are / doing'],
        ['She ___ (going to / buy) a new phone.', "'s going to buy"],
        ['___ they ___ (going to / come)?', 'Are / going to come'],
        ['I ___ (fly) to Paris on Monday. I have my ticket.', "'m flying"],
      ], 2),
      correct([
        ["I'm going to visiting Fes.", "I'm going to visit Fes."],
        ['We going to have a party.', "We're going to have a party."],
        ['What do you do on Saturday? Any plans?', 'What are you doing on Saturday? Any plans?'],
        ["He's meet his boss tomorrow.", "He's meeting his boss tomorrow."],
        ['Are you go to come?', 'Are you going to come?'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write two things you are doing this weekend.',
        'Write two things you are going to do this year.',
        'Write an invitation in one sentence.',
      ] },
    ],
  ],

  /* ── 10 · will, might, may ───────────────────────────────────────── */
  10: [
    [
      grammarBar('will for predictions - التوقّع', '🔮'),
      { t: 'callout', text: "نستعمل will لنتوقّع المستقبل حسب رأينا أو معرفتنا، وغالبًا مع I think و I'm sure و probably في الجملة نفسها." },
      pair(
        box('Predictions - توقّعات', ["I'm sure it'll be a success.", 'People will love your coffee.', "I think it'll rain tomorrow."]),
        box('Negative predictions - توقّعات منفية', ["Don't worry. That won't happen.", "I don't think he'll come.", "It probably won't be expensive."]),
      ),
      table('Form - التركيب', ['', 'Example'], [
        ['+', "I'll come. · She'll be fine. · They'll love it."],
        ['−', "I won't (will not) forget."],
        ['?', 'Will you be there? · What will you do?'],
        ['Short answers', "Yes, I will. · No, I won't."],
      ], [1, 3]),
      { t: 'bullets', size: 13, items: [
        'will + base verb, the same for every person: she will go (not she wills go). - بعد will يأتي الفعل في صيغته الأصلية لكل الضمائر.',
        "probably and definitely: I'll probably come. I probably won't come. - مكانهما بعد will في الإثبات، وقبل النفي.",
      ] },
      { t: 'chips', items: [['definitely', 'بالتأكيد'], ['probably', 'على الأرجح'], ["I'm sure", 'أنا متأكد'], ['I think', 'أظن'], ["I don't think", 'لا أظن']] },
      pair(
        box('Questions - أسئلة', ['Will you be at home tonight?', 'What will the weather be like?', 'Do you think she will come?']),
        box("I don't think… - لا أظن", ["I don't think it'll rain.", "I don't think he'll be late.", "I don't think they'll win."]),
      ),
    ],
    [
      grammarBar('will for offers, promises and decisions - العروض والوعود والقرارات', '🤝'),
      { t: 'callout', text: 'نستعمل will أيضًا عندما نقرّر شيئًا في لحظة الكلام، أو نعرض المساعدة، أو نَعِد.' },
      pair(
        box('Offers - عروض', ["I'll help you paint the walls.", "I'll carry that for you.", 'Shall I make a page on Instagram?']),
        box('Promises - وعود', ["I promise I'll come every morning.", "I won't forget.", "I'll call you tonight, I promise."]),
      ),
      ...box('Decisions now - قرارات في لحظة الكلام', ["The phone's ringing. I'll answer it.", "It's cold. I'll close the window.", "I'm tired. I think I'll go to bed."]),
      ...box('Answering an offer - الردّ على عرض', ["That's very kind of you.", 'Thanks, that would be great.', "No, thanks. I'm fine."]),
      inTalk([
        "I'm sure it'll be a success. → a prediction - توقّع",
        "I'll help you paint the walls. → an offer - عرض",
        'Shall I make a page on Instagram? → an offer as a question - عرض في صيغة سؤال',
        "I won't forget. → a promise - وعد",
      ]),
    ],
    [
      grammarBar('might and may - ربما، قد', '🤔'),
      { t: 'callout', text: 'نستعمل might و may لشيء ممكن لكننا لسنا متأكدين منه. معناهما في العربية: ربما، أو قد.' },
      table(undefined, ['Sure', 'Not sure'], [
        ["It'll be slow at first.", 'It might be slow at first.'],
        ["I'll lose my money.", 'I might lose my money.'],
        ["There won't be problems.", 'There may be some problems.'],
        ["He'll come.", 'He might not come.'],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        'might / may + base verb: It might rain. (not It mights rain) - بعدهما يأتي الفعل في صيغته الأصلية.',
        'Negative: might not, may not. - ننفيهما بإضافة not بعدهما.',
        'Questions with might are rare. We ask: Do you think it will rain? - السؤال بهما نادر، فنسأل بطريقة أخرى.',
      ] },
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['I will to call you.', 'I will call you.', 'بعد will لا نضع to أبدًا.'],
        ['She wills come tomorrow.', 'She will come tomorrow.', 'لا نضيف s إلى will أبدًا.'],
        ['It might rains tonight.', 'It might rain tonight.', 'بعد might يأتي الفعل في صيغته الأصلية.'],
        ["I don't will forget.", "I won't forget.", "ننفي will بإضافة not بعدها، فتصبح won't في الكلام."],
        ['Maybe it will rain maybe.', 'Maybe it will rain. / It might rain.', 'لا نكرّر maybe في الجملة نفسها.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ["I'm sure you ___ love Agadir.", ['will', 'might to', 'are'], 0],
        ['Take a jacket. It ___ be cold tonight.', ['might', 'will to', 'mights'], 0],
        ["A: I'm hungry. B: ___ make you a sandwich.", ["I'll", 'I', "I'm"], 0],
        ['I promise I ___ be late again.', ["won't", "don't", "willn't"], 0],
        ['___ I carry your bag?', ['Will', 'Shall', 'Might'], 1],
        ["He ___ not come. He's very busy.", ['may', 'will', 'shall'], 0],
      ]),
      complete('Complete with the right form', 'Use the words in brackets. - استعمل الكلمات بين القوسين.', [
        ['I think it ___ (rain) tomorrow.', "'ll rain (will rain)"],
        ["Don't worry. I ___ (not / tell) anyone.", "won't tell"],
        ['We ___ (might / go) to Tangier, but we are not sure.', 'might go'],
        ['___ you ___ (be) at home tonight?', 'Will / be'],
        ['The shop ___ (may / not / open) on Sunday.', 'may not open'],
        ['___ I ___ (help) you with that?', 'Shall / help'],
      ], 2),
      correct([
        ['I will to help you.', 'I will help you.'],
        ['She mights come.', 'She might come.'],
        ["I don't will tell him.", "I won't tell him."],
        ['It will rains tomorrow.', 'It will rain tomorrow.'],
        ['Will I open the door for you?', 'Shall I open the door for you?'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write two things you will definitely do next year.',
        'Write two things you might do next year.',
        'Write a promise to a friend.',
      ] },
    ],
  ],

  /* ── 11 · zero & first conditional ───────────────────────────────── */
  11: [
    [
      grammarBar('Zero conditional - الشرط الصفري', '💡'),
      { t: 'callout', text: 'نستعمل الشرط الصفري للحقائق العامة والأشياء التي تحدث دائمًا بالطريقة نفسها: إذا حدث هذا، يحدث ذاك.' },
      pair(
        box('General facts - حقائق عامة', ['If you heat water to 100°C, it boils.', 'If you mix blue and yellow, you get green.', "If plants don't get water, they die."]),
        box('Always true for us - صحيح دائمًا بالنسبة إلينا', ["If I drink coffee at night, I can't sleep.", "If you take a petit taxi, it's cheap.", 'If my son is ill, I stay at home.']),
      ),
      table('Form - التركيب', ['if + present', 'present'], [
        ['If you go out at noon,', 'it gets really hot.'],
        ['If I eat too much,', 'I feel tired.'],
        ['If the shop is closed,', 'we go to the market.'],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        'if is close to when here: If you heat ice, it melts. When you heat ice, it melts. - هنا معنى if قريب من when في المعنى.',
        'Instructions too: If you get lost, ask a shopkeeper. - ومع الأوامر أيضًا: إذا تهت، اسأل.',
      ] },
      ...box('In everyday life - في الحياة اليومية', ["If the tram is full, I take the bus.", "If my mother calls, I always answer.", "If it's Friday, we eat couscous."]),
      ...box('Facts about Morocco - حقائق عن المغرب', ['If you visit Ifrane in winter, you often see snow.', 'If you order tea in a café, it comes with mint.', 'If you go to Merzouga in August, it is very hot.']),
    ],
    [
      grammarBar('First conditional - الشرط الأول', '🗺️'),
      { t: 'callout', text: 'نستعمل الشرط الأول لموقف ممكن في المستقبل ونتيجته المحتملة: إذا حدث هذا، سيحدث ذاك.' },
      table('Form - التركيب', ['if + present simple', "will / won't + verb"], [
        ['If you have time,', "you'll love the tanneries."],
        ['If you go early,', "you won't see many tourists."],
        ['If it rains,', "we'll stay at home."],
        ['If she cooks,', "I'll come every day!"],
      ], [1, 1]),
      pair(
        box('The order can change - يمكن تغيير الترتيب', ["If it rains, we'll stay at home.", "We'll stay at home if it rains.", 'No comma when if is in the middle.']),
        box('Questions - أسئلة', ['What will I do if it rains?', 'Will you call me if you need help?', "If he's late, what will we do?"]),
      ),
      ...box('unless = if not - ما لم', ["Unless it's very hot, you'll enjoy the walk.", "We'll miss the train unless we leave now.", "I won't go unless you come with me."]),
      inTalk([
        "If you take a petit taxi, it's cheap. → always true - صحيح دائمًا",
        "If you have time, you'll love the tanneries. → possible, in the future - ممكن في المستقبل",
        'What will I do if it rains? → a question - سؤال',
        "Unless it's very hot, you'll enjoy the walk. → if it isn't very hot - إذا لم يكن الجو حارًّا",
      ]),
    ],
    [
      grammarBar('Zero or first conditional? - أيّهما نختار؟', '⚖️'),
      table(undefined, ['Zero: always', 'First: one time, in the future'], [
        ["If I'm tired, I go to bed early.", "If I'm tired tonight, I'll go to bed early."],
        ['If it rains, the streets get wet.', "If it rains tomorrow, we'll stay inside."],
        ['If you heat ice, it melts.', "If you leave the ice cream in the sun, it'll melt."],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        'Never use will after if: If it rains (not If it will rain). - لا نستعمل will بعد if في هذه الجمل.',
        "if or when? when = it is sure to happen: When I get home, I'll call you. - نستعمل when لما هو مؤكّد الحدوث.",
      ] },
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ["If it will rain, we'll stay at home.", "If it rains, we'll stay at home.", 'بعد if نستعمل المضارع، و will في النتيجة فقط.'],
        ['If you will come, I will cook.', "If you come, I'll cook.", 'نضع will في النتيجة فقط.'],
        ['If you go early, you not see tourists.', "If you go early, you won't see tourists.", "في النفي نستعمل won't مع الفعل."],
        ["Unless you don't hurry, you'll miss the bus.", "Unless you hurry, you'll miss the bus.", 'معنى unless إذا لم، فلا نضيف نفيًا آخر.'],
        ['If I will see him, I tell him.', "If I see him, I'll tell him.", 'المضارع بعد if، و will في النتيجة.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['If it ___ tomorrow, we will go to the beach.', ["doesn't rain", "won't rain", "isn't rain"], 0],
        ['If you heat ice, it ___.', ['melts', 'will melt', 'melting'], 0],
        ["I'll call you if I ___ time.", ['will have', 'have', 'had'], 1],
        ['If you go early, you ___ many people.', ["won't see", "don't see will", 'not see'], 0],
        ["___ you hurry, you'll miss the train.", ['If', 'Unless', 'When'], 1],
        ['What will you do if you ___ the job?', ["don't get", "won't get", "didn't get"], 0],
      ]),
      complete('Complete with the right form', 'Use the verbs in brackets. - استعمل الأفعال بين القوسين.', [
        ['If you ___ (be) hungry, I ___ (make) a sandwich.', "'re / 'll make"],
        ['If you ___ (mix) red and white, you ___ (get) pink.', 'mix / get'],
        ['We ___ (not / go) out if it ___ (rain).', "won't go / rains"],
        ['If she ___ (call), I ___ (tell) her.', "calls / 'll tell"],
        ['___ you ___ (help) me if I ___ (need) you?', 'Will / help / need'],
        ['If I ___ (drink) coffee late, I ___ (not / sleep).', "drink / don't sleep"],
      ], 2),
      correct([
        ["If it will be sunny, we'll go out.", "If it's sunny, we'll go out."],
        ['If you will need help, call me.', 'If you need help, call me.'],
        ["Unless you don't study, you'll fail.", "Unless you study, you'll fail."],
        ['If I see him, I tell him tomorrow.', "If I see him, I'll tell him tomorrow."],
        ['If you heat water, it will boils.', 'If you heat water, it boils.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        "Write what you'll do if it rains this weekend.",
        'Write a fact about you with if: If I…, I…',
        'Write one piece of advice for a visitor to your town.',
      ] },
    ],
  ],

  /* ── 12 · second conditional ─────────────────────────────────────── */
  12: [
    [
      grammarBar('Second conditional - الشرط الثاني', '💭'),
      { t: 'callout', text: 'نستعمل الشرط الثاني لموقف متخيَّل أو غير مرجّح الآن أو في المستقبل، ونتيجته: لو حدث هذا، لحدث ذاك.' },
      table('Form - التركيب', ['if + past simple', "would / wouldn't + verb"], [
        ['If I went to Dubai,', 'I would earn three times more.'],
        ['If I had more time,', "I'd think about it."],
        ['If we lived by the sea,', "we'd swim every day."],
        ["If he didn't work so much,", "he wouldn't be tired."],
      ], [1, 1]),
      pair(
        box('Imagined situations - مواقف متخيَّلة', ["If I won the lottery, I'd buy a riad.", 'If I spoke Chinese, I would work in Shanghai.', "If I had a car, I'd visit you every week."]),
        box('Questions - أسئلة', ['What would you do if you won the lottery?', 'Where would you live if you could choose?', 'Would you go if they asked you?']),
      ),
      { t: 'bullets', size: 13, items: [
        "would = 'd: I'd go, she'd say. Negative: wouldn't. - هكذا نختصر would وننفيها.",
        'The past here does not mean the past. It means: not real, imagined. - الماضي هنا لا يعني الزمن الماضي، بل الخيال.',
      ] },
      ...box('Dreams - أحلام', ["If I could live anywhere, I'd live in Chefchaouen.", "If I had a year off, I'd travel around Africa.", "If I were a chef, I'd open a restaurant in Paris."]),
    ],
    [
      grammarBar('If I were you - لو كنت مكانك', '🧭'),
      { t: 'callout', text: "لتقديم النصيحة نقول كثيرًا: If I were you, I would… ومع I و he و she نستعمل were في هذه الجمل." },
      pair(
        box('Advice - نصائح', ["If I were you, I'd accept the job.", "If I were you, I wouldn't sign the contract yet.", "If I were you, I'd talk to your mother first."]),
        box('were for everyone - للجميع', ['If I were rich, …', 'If she were here, …', 'If it were cheaper, …']),
      ),
      ...box('could = would be able to - لاستطعتُ', ['If I had a car, I could visit you.', 'If you lived nearer, we could meet more.', 'If you went, you could help your family.']),
      ...box('Asking for advice - طلب النصيحة', ['Can I ask your advice?', 'What would you do?', 'What should I do?']),
      inTalk([
        'If I went, I would earn three times more. → imagined - متخيَّل',
        'If I were you, I would accept. → advice - نصيحة',
        'What would happen if you said no? → a question - سؤال',
        "If I won the lottery, I'd visit you every month! → very unlikely - غير مرجّح أبدًا",
      ]),
    ],
    [
      grammarBar('First or second conditional? - الشرط الأول أم الثاني؟', '⚖️'),
      table(undefined, ['First: possible, real', 'Second: imagined, unlikely'], [
        ["If it rains, we'll stay home.", "If it snowed in Agadir, we'd be surprised!"],
        ["If I get the job, I'll move.", "If I got a job in Japan, I'd learn Japanese."],
        ["If you come, I'll cook.", "If you lived here, I'd cook for you every day."],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        'The difference is how real it is for you: If I win the match (possible). If I won the lottery (a dream). - الفرق في مدى واقعية الموقف بالنسبة إليك.',
      ] },
      ...box('Real or imagined? - حقيقي أم متخيَّل؟', ["If I see Hamid, I'll tell him. (I may see him today.)", "If I saw a lion in the street, I'd run! (very unlikely)", "If he calls, I'll answer. · If he called, I'd be surprised."]),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ["If I would have money, I'd travel.", "If I had money, I'd travel.", 'بعد if نستعمل الماضي، و would في النتيجة فقط.'],
        ['If I were you, I will accept.', "If I were you, I'd accept.", 'في النتيجة نستعمل would، لأن الموقف متخيَّل.'],
        ['If I was rich, I buy a house.', "If I were rich, I'd buy a house.", 'في النتيجة نضع would قبل الفعل.'],
        ['What you would do?', 'What would you do?', 'في السؤال يأتي would قبل الفاعل.'],
        ['He would to help us.', 'He would help us.', 'بعد would لا نضع to أبدًا.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ["If I ___ more time, I'd learn Spanish.", ['have', 'had', 'would have'], 1],
        ['If she won the lottery, she ___ a riad.', ['will buy', 'would buy', 'buys'], 1],
        ["If I ___ you, I wouldn't go.", ['am', 'were', 'be'], 1],
        ['What would you do if you ___ a famous singer?', ['are', 'were', 'will be'], 1],
        ["We ___ go out if it wasn't so cold.", ['would', 'will', 'did'], 0],
        ["If he ___ so much, he wouldn't be tired.", ["doesn't work", "didn't work", "wouldn't work"], 1],
      ]),
      complete('Complete with the right form', 'Use the verbs in brackets. - استعمل الأفعال بين القوسين.', [
        ['If I ___ (have) a car, I ___ (drive) to work.', "had / 'd drive"],
        ['If you ___ (live) here, we ___ (meet) every day.', "lived / 'd meet"],
        ['If I ___ (be) you, I ___ (not / sign) it.', "were / wouldn't sign"],
        ['What ___ you ___ (do) if you ___ (lose) your job?', 'would / do / lost'],
        ['She ___ (be) happier if she ___ (have) more friends.', "'d be / had"],
        ['If it ___ (not / rain), we ___ (go) to the beach.', "didn't rain / 'd go"],
      ], 2),
      correct([
        ["If I would be rich, I'd travel.", "If I were rich, I'd travel."],
        ['If I were you, I will call him.', "If I were you, I'd call him."],
        ['What you would do?', 'What would you do?'],
        ['If I had time, I will help you.', "If I had time, I'd help you."],
        ['She would to come.', 'She would come.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write what you would do if you won the lottery.',
        'Write where you would live if you could choose.',
        "Write advice for a friend: If I were you, I'd…",
      ] },
    ],
  ],
}
