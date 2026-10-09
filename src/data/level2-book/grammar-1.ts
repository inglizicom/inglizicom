import type { Block } from '../level1-book.ts'
import { box, choose, complete, correct, grammarBar, inTalk, pair, practiceBar, table } from './helpers.ts'

/**
 * Module 1's grammar lessons, three pages each: every use of the rule with
 * three examples, the full form (short answers too), the spelling and
 * pronunciation that go with it, the rule found in the unit's conversation,
 * the mistakes Arabic speakers make, and practice.
 */

export const GRAMMAR_1: Record<number, Block[][]> = {
  /* ── 1 · Present simple & present continuous ─────────────────────── */
  1: [
    [
      grammarBar('Present simple - المضارع البسيط', '⏱️'),
      { t: 'callout', text: 'نستعمل المضارع البسيط لما هو ثابت أو متكرّر في حياتنا: العادات، الحقائق، المشاعر والآراء، والمواعيد الثابتة.' },
      pair(
        box('Habits and routines - العادات', ['I get up at seven every day.', 'She usually takes the bus to work.', "We don't go out on weeknights."]),
        box('Facts - الحقائق', ['I live in Rabat.', 'My brother works in a bank.', 'The sun rises in the east.']),
      ),
      pair(
        box('Feelings and opinions - المشاعر والآراء', ['I love this city.', 'Do you know Imane?', "I don't understand the question."]),
        box('Timetables - المواعيد الثابتة', ['The train leaves at 8:15.', 'The class starts at six.', 'The shops open at nine.']),
      ),
      table('he / she / it: + s - الفعل مع هو وهي', ['Rule', 'Examples'], [
        ['most verbs: + s', 'work → works · live → lives · read → reads'],
        ['-s, -sh, -ch, -x, -o: + es', 'watch → watches · wash → washes · go → goes · do → does'],
        ['consonant + y: y → ies', 'study → studies · carry → carries'],
        ['vowel + y: + s', 'play → plays · stay → stays'],
        ['irregular', 'have → has'],
      ], [1.3, 2]),
      { t: 'sub', text: 'How often? - كم مرة؟' },
      { t: 'chips', items: [['always', '100%'], ['usually', '90%'], ['often', '70%'], ['sometimes', '50%'], ['rarely', '10%'], ['never', '0%']] },
      { t: 'bullets', size: 13, items: [
        'Before the main verb: I usually walk to work. - قبل الفعل الأساسي.',
        'After be: She is always late. - بعد فعل be تأتي كلمة التكرار.',
        'Longer expressions go at the end: every day, twice a week, on Fridays. - التعابير الطويلة في آخر الجملة.',
      ] },
    ],
    [
      grammarBar('Present continuous - المضارع المستمر', '▶️'),
      { t: 'callout', text: 'نستعمل المضارع المستمر لما يحدث الآن، أو لوضع مؤقت هذه الأيام، أو لشيء يتغيّر ويتطوّر.' },
      pair(
        box('Right now - الآن', ["Look! It's raining.", "Shh, the baby is sleeping.", 'What are you doing?']),
        box('These days, for a short time - مؤقت', ["I'm working nights this month.", "She's staying with her aunt.", "We're learning English this year."]),
      ),
      ...box('Changing situations - أشياء تتغيّر', ['My English is getting better.', 'Prices are going up.', 'The city is growing fast.']),
      table('Form - التركيب', ['', 'I', 'he / she / it', 'you / we / they'], [
        ['+', "I'm working.", "She's working.", "They're working."],
        ['−', "I'm not working.", "She isn't working.", "They aren't working."],
        ['?', 'Am I working?', 'Is she working?', 'Are they working?'],
        ['Short answers', "Yes, I am. No, I'm not.", "Yes, she is. No, she isn't.", "Yes, they are. No, they aren't."],
      ], [0.9, 1.4, 1.5, 1.6]),
      table('-ing: spelling - التهجئة', ['Rule', 'Examples'], [
        ['most verbs: + ing', 'work → working · read → reading'],
        ['ending in -e: drop the e', 'make → making · live → living'],
        ['short verb, consonant-vowel-consonant: double', 'sit → sitting · run → running · stop → stopping'],
        ['-ie → -ying', 'lie → lying · die → dying'],
      ], [1.6, 2]),
      { t: 'chips', items: [['now', 'الآن'], ['right now', 'حالًا'], ['at the moment', 'حاليًا'], ['today', 'اليوم'], ['this week', 'هذا الأسبوع'], ['these days', 'هذه الأيام']] },
      inTalk([
        'I work for a small company near the station. → a fact - حقيقة',
        "This month I'm working nights. → for now, not always - مؤقت",
        'I usually listen to podcasts on the bus. → a habit - عادة',
        'Oh, the teacher is coming. → right now - الآن',
      ]),
    ],
    [
      grammarBar('Simple or continuous? - البسيط أم المستمر؟', '⚖️'),
      table(undefined, ['Present simple: always, usually', 'Present continuous: now, for a short time'], [
        ['I work in a bank.', "I'm working at home today."],
        ['She speaks three languages.', "She's speaking English to a tourist."],
        ['He usually drives to work.', "His car is broken, so he's taking the bus this week."],
        ['It often rains in Tangier.', "It's raining now. Take an umbrella!"],
      ], [1, 1.2]),
      { t: 'bullets', size: 13, items: [
        'State verbs are not used with -ing: know, like, love, hate, want, need, understand, believe. - أفعال الحالة لا نضيف إليها ing عادةً.',
        "think: I think it's a good idea (an opinion). I'm thinking about my holiday (an activity). - للرأي: البسيط، وللتفكير في أمر: المستمر.",
        "have: I have a car (it's mine). I'm having lunch (an activity). - للملكية: البسيط، وللنشاط: المستمر.",
      ] },
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['I am work in a bank.', 'I work in a bank.', 'لا نضع am قبل الفعل في المضارع البسيط.'],
        ['She go to work by bus.', 'She goes to work by bus.', 'مع he و she و it نضيف s إلى الفعل.'],
        ["I'm knowing him well.", 'I know him well.', 'الفعل know فعل حالة، فلا نضيف إليه ing أبدًا.'],
        ['What you are doing?', 'What are you doing?', 'في السؤال يأتي are قبل you وليس بعده.'],
        ['Do you are a teacher?', 'Are you a teacher?', 'مع فعل be لا نستعمل do في السؤال.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['Yassine ___ for a small company.', ['works', 'is working', 'work'], 0],
        ['Look! It ___.', ['rains', 'is raining', 'rain'], 1],
        ['___ you usually study in the evening?', ['Are', 'Do', 'Does'], 1],
        ['This month Imane ___ nights.', ['work', 'is working', 'are working'], 1],
        ['I ___ what you mean.', ['understand', 'am understanding', 'understands'], 0],
        ['My English ___ better these days.', ['get', 'is getting', 'are getting'], 1],
      ]),
      complete('Complete with the right form', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['She ___ (not / eat) meat.', "doesn't eat"],
        ['What ___ you ___ (do) at the moment?', 'are / doing'],
        ['My brother ___ (live) in Spain.', 'lives'],
        ['I ___ (look for) a new flat this month.', "'m looking for"],
        ['___ your father ___ (speak) English?', 'Does / speak'],
        ['They ___ (not / listen) to me right now!', "aren't listening"],
      ], 2),
      correct([
        ["He work in a hotel.", "He works in a hotel."],
        ["I'm wanting a coffee.", "I want a coffee."],
        ["Where you are going?", "Where are you going?"],
        ["She don't like fish.", "She doesn't like fish."],
        ["Look! The children play in the garden now.", "Look! The children are playing in the garden now."],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        "Write three things you usually do on Fridays.",
        "Write two things you are doing these days.",
        "Write one thing that is changing in your life.",
      ] },
    ],
  ],

  /* ── 2 · Past simple & used to ───────────────────────────────────── */
  2: [
    [
      grammarBar('Past simple - الماضي البسيط', '📅'),
      { t: 'callout', text: 'نستعمل الماضي البسيط لحدث انتهى في وقت معروف في الماضي: أمس، الأسبوع الماضي، سنة 2015، منذ ثلاث سنوات.' },
      pair(
        box('Finished actions - أحداث انتهت', ['I visited my grandmother yesterday.', 'We moved to Rabat in 2015.', 'She called me two hours ago.']),
        box('A story, step by step - قصة', ['I woke up, had breakfast and left.', 'He opened the door and saw a cat.', 'We arrived, paid and sat down.']),
      ),
      pair(
        box('Past states - حالات في الماضي', ['I was shy when I was a child.', 'We had a small house.', 'They lived in France for ten years.']),
        box('Time words - كلمات الزمن', ['yesterday · last night · last week', 'two days ago · in 2015', 'when I was a child · then · after that']),
      ),
      table('Regular verbs: spelling - تهجئة الأفعال المنتظمة', ['Rule', 'Examples'], [
        ['most verbs: + ed', 'work → worked · visit → visited'],
        ['ending in -e: + d', 'live → lived · move → moved'],
        ['consonant + y: y → ied', 'study → studied · try → tried'],
        ['short verb, consonant-vowel-consonant: double', 'stop → stopped · plan → planned'],
      ], [1.6, 2]),
      table('Say -ed in three ways - النطق', ['/t/', '/d/', '/ɪd/'], [
        ['walked · worked · watched', 'played · lived · moved', 'wanted · visited · needed'],
      ]),
      { t: 'bullets', size: 13, items: ['We say /ɪd/ only after t or d: wanted, needed. - نقول ɪd فقط بعد الحرفين t و d في آخر الفعل.'] },
    ],
    [
      grammarBar('Irregular verbs, was and were - الأفعال الشاذة', '🔤'),
      { t: 'callout', text: 'كثير من الأفعال الشائعة شاذة: لا نضيف إليها ed بل نحفظ صيغتها في الماضي. ابدأ بهذه الأفعال، والقائمة الكاملة في آخر الكتاب.' },
      table(undefined, ['Verb', 'Past', 'Verb', 'Past'], [
        ['be', 'was / were', 'go', 'went'],
        ['have', 'had', 'do', 'did'],
        ['see', 'saw', 'come', 'came'],
        ['get', 'got', 'make', 'made'],
        ['take', 'took', 'give', 'gave'],
        ['know', 'knew', 'find', 'found'],
        ['buy', 'bought', 'leave', 'left'],
        ['tell', 'told', 'think', 'thought'],
        ['say', 'said', 'eat', 'ate'],
      ]),
      table('was and were', ['', '+', '−', '?'], [
        ['I / he / she / it', 'was', "wasn't", 'Was he…?'],
        ['you / we / they', 'were', "weren't", 'Were they…?'],
      ], [1.4, 1, 1, 1]),
      table('Negatives and questions - النفي والسؤال', null, [
        ['−', "I didn't go. · She didn't see it."],
        ['?', 'Did you go? · Where did she go?'],
        ['Short answers', "Yes, I did. · No, she didn't."],
      ], [1, 3]),
      { t: 'bullets', size: 13, items: ["After did and didn't, use the base verb: Did you go? (not Did you went?) - بعد did يأتي الفعل في صيغته الأصلية."] },
      inTalk([
        'My mother found them in a box last week. → one time - مرة واحدة',
        'When did you move to the city? → a question with did - سؤال',
        "I didn't know anyone. → a negative with didn't - نفي",
      ]),
    ],
    [
      grammarBar('used to - كنتُ أفعل', '🔁'),
      { t: 'callout', text: 'نستعمل used to لعادة أو حالة كانت صحيحة في الماضي ولم تعد كذلك الآن. معناها في العربية: كنتُ أفعل.' },
      pair(
        box('Old habits - عادات قديمة', ['I used to walk to school.', 'We used to play in the street.', 'My father used to smoke, but he stopped.']),
        box('Old states - حالات قديمة', ['I used to be very shy.', 'There used to be a cinema here.', 'We used to have a dog.']),
      ),
      table(undefined, null, [
        ['+', 'I used to play football.'],
        ['−', "I didn't use to like maths. · I never used to eat fish."],
        ['?', 'Did you use to have a TV?'],
        ['Short answers', "Yes, I did. · No, I didn't."],
      ], [1, 3]),
      { t: 'bullets', size: 13, items: [
        'A habit, many times: used to or past simple. We used to sing / We sang all the way. - للعادة يصلح الاثنان.',
        'One time, or with a date: only past simple. I moved to the city in 2012. - لحدث واحد أو مع تاريخ: الماضي البسيط فقط.',
        "Then and now: I used to live in Fes. I don't live there any more. - للمقارنة مع الحاضر.",
      ] },
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['I use to play football when I was a child.', 'I used to play football when I was a child.', 'في الإثبات نكتب used مع حرف الدال.'],
        ['Did you used to like school?', 'Did you use to like school?', 'بعد did يأتي الفعل use دون حرف الدال.'],
        ['I used to go to Paris last year.', 'I went to Paris last year.', 'لحدث وقع مرة واحدة نستعمل الماضي البسيط.'],
        ['Yesterday I go to the market.', 'Yesterday I went to the market.', 'بعد yesterday يأتي الفعل في الماضي.'],
        ["I didn't went to school.", "I didn't go to school.", "بعد didn't يأتي الفعل في صيغته الأصلية."],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['When I was a child, I ___ in a village.', ['use to live', 'used to live', 'was used to live'], 1],
        ['We ___ to Agadir last summer.', ['used to go', 'went', 'go'], 1],
        ['___ you use to walk to school?', ['Did', 'Do', 'Were'], 0],
        ['My grandfather ___ a shop in the old medina.', ['used to have', 'use to have', 'used have'], 0],
        ['I ___ like vegetables, but now I love them.', ["didn't used to", "didn't use to", "don't used to"], 1],
        ['She ___ her keys yesterday.', ['used to lose', 'lost', 'loses'], 1],
      ]),
      complete('Complete in the past simple', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['I ___ (grow up) in Oujda.', 'grew up'],
        ['We ___ (not / have) a car.', "didn't have"],
        ['Where ___ you ___ (go) last weekend?', 'did / go'],
        ['My father ___ (take) us to the beach on Sundays.', 'took (or: used to take)'],
        ['She ___ (study) in Rabat for three years.', 'studied'],
        ['They ___ (move) to Spain in 2019.', 'moved'],
      ], 2),
      correct([
        ["I goed to the market yesterday.", "I went to the market yesterday."],
        ["Did she called you?", "Did she call you?"],
        ["We use to live in Fes.", "We used to live in Fes."],
        ["I was went to Agadir last summer.", "I went to Agadir last summer."],
        ["When I was a child, I didn't used to like milk.", "When I was a child, I didn't use to like milk."],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        "Write three things you used to do when you were a child.",
        "Write two things you did last weekend.",
        "Write one thing you don't do any more.",
      ] },
    ],
  ],

  /* ── 3 · Comparatives & superlatives ─────────────────────────────── */
  3: [
    [
      grammarBar('Comparatives - المقارنة', '📏'),
      { t: 'callout', text: 'نستعمل صيغة المقارنة لنقارن بين شخصين أو شيئين، ونضع بعدها than بمعنى: من.' },
      table(undefined, ['Adjective', 'Rule', 'Comparative'], [
        ['tall · old · cheap', '+ er', 'taller · older · cheaper'],
        ['nice · large', '+ r', 'nicer · larger'],
        ['big · thin · hot', 'double + er', 'bigger · thinner · hotter'],
        ['funny · busy · easy', 'y → ier', 'funnier · busier · easier'],
        ['patient · modern · expensive', 'more + adjective', 'more patient · more modern'],
        ['good · bad · far', 'irregular', 'better · worse · further'],
      ], [1.5, 1.1, 1.6]),
      pair(
        box('Examples - أمثلة', ['Rabat is quieter than Casablanca.', 'My new job is more interesting than my old job.', 'Today is hotter than yesterday.', 'Her English is better than mine.']),
        box('How big is the difference? - كم الفرق؟', ['A big difference: much, a lot, far. My brother is much taller than me.', 'A small difference: a bit, a little. This flat is a bit cheaper.']),
      ),
      { t: 'bullets', size: 13, items: [
        'than me or than I am: He is taller than me. He is taller than I am. - الصيغتان صحيحتان.',
        'less + adjective: This flat is less expensive than that one. - للتعبير عن الأقل.',
      ] },
    ],
    [
      grammarBar('Superlatives - التفضيل', '🏆'),
      { t: 'callout', text: 'نستعمل صيغة التفضيل لنقول إن شخصًا أو شيئًا هو الأكثر في مجموعة كاملة، ونضع the قبلها دائمًا.' },
      table(undefined, ['Adjective', 'Superlative'], [
        ['tall · old', 'the tallest · the oldest'],
        ['nice · large', 'the nicest · the largest'],
        ['big · hot', 'the biggest · the hottest'],
        ['funny · busy', 'the funniest · the busiest'],
        ['patient · beautiful', 'the most patient · the most beautiful'],
        ['good · bad · far', 'the best · the worst · the furthest'],
      ], [1.3, 2]),
      pair(
        box('in or of?', ['in + a place or a group: the tallest in my family, the best café in town.', 'of + a time or a number: the best day of my life, the youngest of the three.']),
        box('Examples - أمثلة', ['My grandmother is the oldest in our family.', 'This is the most beautiful beach in Morocco.', 'Friday is the busiest day of the week.']),
      ),
      { t: 'sub', text: 'as … as - مثل' },
      { t: 'bullets', size: 13, items: [
        'as + adjective + as = the same: My son is as tall as me. - بنفس الدرجة.',
        "not as … as = less: Tangier isn't as big as Casablanca. - أقل من.",
        'the same as, different from, similar to: My phone is the same as yours. - نفس الشيء، مختلف، يشبه.',
      ] },
      inTalk([
        "She's quite tall, taller than me. → comparative - مقارنة",
        "She's the most talkative person in our family! → superlative - تفضيل",
        "She's the cleverest student in her class. → the …est in - التفضيل داخل مجموعة",
      ]),
    ],
    [
      grammarBar('look, look like, be like - يبدو، يشبه، كيف هو', '🔍'),
      table(undefined, ['', 'Example', 'Meaning'], [
        ['look + adjective', 'You look tired.', 'يبدو'],
        ['look like + person', 'He looks like his father.', 'يشبه'],
        ['be like', "What's she like? She's kind.", 'الشخصية'],
        ['look like (appearance)', 'What does she look like? She is tall.', 'المظهر'],
      ], [1.2, 2.2, 1]),
      { t: 'bullets', size: 13, items: [
        "To ask about personality: What's he like? He's friendly and funny. - للسؤال عن الشخصية.",
        "To ask about appearance: What does he look like? He's tall, with a beard. - للسؤال عن المظهر.",
        'To ask about health or mood: How is he? He is fine, thanks. - للسؤال عن الحال.',
      ] },
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['He is more tall than me.', 'He is taller than me.', 'لا نجمع بين more و er في كلمة واحدة.'],
        ['She is taller from her sister.', 'She is taller than her sister.', 'بعد المقارنة نستعمل than وليس from كما في العربية.'],
        ['He is the most good player.', 'He is the best player.', 'الصفة good تصبح the best في التفضيل.'],
        ['You look like tired.', 'You look tired.', 'بعد look تأتي الصفة مباشرة.'],
        ['How is your brother? (personality)', 'What is your brother like?', 'نسأل عن الشخصية بـ What is … like، أما How فنسأل بها عن الحال.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['My sister is ___ than me.', ['more young', 'younger', 'youngest'], 1],
        ['This is the ___ day of my life!', ['better', 'best', 'most good'], 1],
        ['He ___ his grandfather: the same nose and the same eyes.', ['looks', 'looks like', 'is like'], 1],
        ["___ your new teacher like? She's very patient.", ['How is', 'What is', 'Who is'], 1],
        ["Tangier isn't ___ Casablanca.", ['as big as', 'as bigger as', 'bigger as'], 0],
        ['You ___ happy today!', ['look like', 'look', 'like'], 1],
      ]),
      complete('Complete with the comparative or the superlative', 'Use the adjective in brackets. - استعمل الصفة بين القوسين.', [
        ['Rabat is ___ (quiet) than Casablanca.', 'quieter'],
        ['My father is ___ (patient) person in our family.', 'the most patient'],
        ['Today is ___ (hot) than yesterday.', 'hotter'],
        ['Who is ___ (funny) student in your class?', 'the funniest'],
        ['Her English is ___ (good) than mine.', 'better'],
        ['That was ___ (bad) film of the year.', 'the worst'],
      ], 2),
      correct([
        ["My brother is more taller than me.", "My brother is taller than me."],
        ["She is the most kind person I know.", "She is the kindest person I know."],
        ["He looks like tired today.", "He looks tired today."],
        ["Fes is older from Rabat.", "Fes is older than Rabat."],
        ["My sister isn't as tall than me.", "My sister isn't as tall as me."],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        "Compare yourself with a person in your family.",
        "Who is the funniest person you know? Why?",
        "What does your best friend look like?",
      ] },
    ],
  ],

  /* ── 4 · Countable, uncountable, quantifiers, there is / are ────── */
  4: [
    [
      grammarBar('Countable or uncountable? - معدود أم غير معدود؟'),
      pair(
        box('Countable', ['We can count them: a room, two rooms, three shops. - يمكن عدّها.', 'They have a plural: a family, two families. - لها جمع.']),
        box('Uncountable', ["We can't count them: water, light, traffic, noise, money. - لا يمكن عدّها.", 'No a or an, no plural: some furniture, not furnitures. - لا نضع a ولا نجمعها.']),
      ),
      table('Common uncountable nouns - أسماء غير معدودة شائعة', ['Group', 'Examples'], [
        ['Food', 'bread · rice · meat · cheese · sugar'],
        ['Liquids', 'water · milk · tea · oil'],
        ['Materials', 'wood · glass · paper · gold'],
        ['Ideas', 'advice · information · help · news · fun'],
        ['Groups of things', 'furniture · luggage · money · traffic · homework'],
      ], [1, 2.6]),
      { t: 'callout', text: 'انتبه: الكلمات furniture, information, advice, news, money, homework غير معدودة في الإنجليزية، رغم أنها معدودة في العربية.' },
      table('Counting the uncountable - كيف نعدّ غير المعدود', ['', 'Examples'], [
        ['a bottle of', 'water · oil · milk'],
        ['a loaf of', 'bread'],
        ['a piece of', 'furniture · advice · information · cake'],
        ['a kilo of', 'rice · meat · sugar'],
        ['a cup of / a glass of', 'tea · coffee / water · juice'],
      ], [1.2, 2.4]),
    ],
    [
      grammarBar('How much? How many? - الكميات', '⚖️'),
      table(undefined, ['', 'Countable', 'Uncountable'], [
        ['Question', 'How many rooms?', 'How much money?'],
        ['A big quantity', 'many · a lot of', 'much · a lot of'],
        ['A small quantity', 'a few', 'a little'],
        ['Positive', 'some shops', 'some water'],
        ['Negative, question', 'any shops', 'any water'],
        ['More than we want', 'too many cars', 'too much noise'],
      ], [1.2, 2, 2]),
      { t: 'bullets', size: 13, items: [
        'some in positive sentences: There are some shops. I need some help. - في الإثبات.',
        "any in negatives and questions: Is there any parking? There isn't any milk. - في النفي والسؤال.",
        'some in offers and requests: Would you like some tea? Can I have some water? - نستعمل some في العرض والطلب.',
        "In positive sentences, say a lot of, not much: There's a lot of traffic. - في الإثبات نقول a lot of بدل much عادةً.",
        'a few and a little: not many, but enough. I have a few friends here. - عدد قليل لكنه كافٍ.',
        'few and little: not enough. Few people came. There is little time. - قليل جدًا وغير كافٍ.',
      ] },
      ...box('Examples - أمثلة', [
        'How many bedrooms are there? There are two.',
        "How much is the rent? It's three thousand dirhams.",
        "There's too much traffic in the morning.",
        'We have a little time before the train. Let’s have a coffee.',
      ]),
    ],
    [
      grammarBar('there is, there are - يوجد', '📍'),
      table(undefined, null, [
        ['+', "There's a sofa. · There's some parking. · There are two bedrooms."],
        ['−', "There isn't a lift. · There isn't any milk. · There aren't many places."],
        ['?', 'Is there a lift? · Is there any parking? · Are there any shops?'],
        ['Short answers', "Yes, there is. · No, there isn't. · Yes, there are. · No, there aren't."],
      ], [1, 4]),
      { t: 'bullets', size: 13, items: [
        "there is + a singular or uncountable noun: There's a park. There's a lot of noise. - مع المفرد وغير المعدود.",
        'there are + a plural noun: There are two big windows. - مع الجمع.',
        'Not have for places: In my street there are many cafés. (not: In my street have many cafés) - لا نقول have للتعبير عن الوجود في مكان.',
        "there is or it is? There's a café near my house. It's very popular. - there للوجود، و it للوصف.",
      ] },
      inTalk([
        "There's a lot of light. → uncountable - غير معدود",
        'There are a few cafés and a pharmacy. → countable - معدود',
        "There's some parking, but there aren't many places. → both - الاثنان",
      ]),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['There are many furnitures.', 'There is a lot of furniture.', 'الكلمة furniture غير معدودة، فلا جمع لها.'],
        ['Can you give me an information?', 'Can you give me some information?', 'الكلمة information غير معدودة.'],
        ['How many money do you need?', 'How much money do you need?', 'نستعمل How much مع الأسماء غير المعدودة.'],
        ['There is many cars in my street.', 'There are many cars in my street.', 'نستعمل There are مع الجمع.'],
        ['In my city have a big park.', 'In my city there is a big park.', 'نستعمل there is وليس have للتعبير عن الوجود.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct word', [
        ['How ___ bedrooms are there?', ['much', 'many', 'any'], 1],
        ["There isn't ___ milk in the fridge.", ['many', 'much', 'a few'], 1],
        ['Is there ___ parking near the flat?', ['any', 'many', 'a few'], 0],
        ['I need ___ advice about my new flat.', ['an', 'some', 'many'], 1],
        ['There are ___ good restaurants in my street.', ['a little', 'a few', 'much'], 1],
        ['There ___ a lot of noise at night.', ['is', 'are', 'be'], 0],
      ]),
      complete('Complete with there is, there are, is there or are there', 'Write the missing words. - اكتب الكلمات الناقصة.', [
        ['___ a big park near my house.', "There's (There is)"],
        ['___ any shops in your street?', 'Are there'],
        ['___ two bathrooms in the flat.', 'There are'],
        ['___ any hot water?', 'Is there'],
        ['___ many cafés in the old town.', 'There are'],
        ['___ much traffic in the morning?', 'Is there'],
      ], 2),
      correct([
        ["We have many furnitures.", "We have a lot of furniture."],
        ["How many sugar do you want?", "How much sugar do you want?"],
        ["There are a little cafés in my street.", "There are a few cafés in my street."],
        ["Is there some parking near here?", "Is there any parking near here?"],
        ["In my neighbourhood have a big market.", "In my neighbourhood there is a big market."],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        "What is there in your neighbourhood?",
        "What is there too much of in your city?",
        "How many rooms are there in your home?",
      ] },
    ],
  ],
}

/**
 * «In real life»: short exchanges that use the rule as people really do,
 * at the foot of the lesson pages that have room for them ([unit, page]).
 */
const REAL_LIFE: [unit: number, page: number, rows: [string, string][]][] = [
  [1, 2, [
    ["What do you do?", "I'm a teacher, but this year I'm working in an office."],
    ['Do you usually drive to work?', "Yes, but today I'm taking the bus."],
    ['What are you reading?', 'A novel. I read every night before bed.'],
  ]],
  [2, 0, [
    ['What did you do last weekend?', 'I visited my parents and we had lunch together.'],
    ['When did you start this job?', 'I started in 2021.'],
    ['Did you see the match yesterday?', "No, I didn't. I was at work."],
  ]],
  [3, 0, [
    ['Which is cheaper, the bus or the train?', 'The bus is cheaper, but the train is much faster.'],
    ['Is your new flat bigger than your old one?', "Yes, and it's quieter too."],
    ["How's your new job?", "It's more interesting than my old one, but it's a bit harder."],
    ['Is Marrakech hotter than Agadir in summer?', 'Yes, much hotter!'],
  ]],
  [3, 2, [
    ["What's your new boss like?", "She's strict, but she's fair."],
    ['What does your brother look like?', "He's tall, with short hair and glasses."],
    ['You look happy!', 'I am. I passed my driving test!'],
  ]],
  [4, 0, [
    ['Can I have some water, please?', 'Of course. A bottle or a glass?'],
    ['Do you need any help?', 'Yes, please. I need some information about the flat.'],
    ['Can you buy some bread on your way home?', 'Sure. How many loaves?'],
  ]],
  [4, 1, [
    ['How much sugar do you take?', 'Just a little, please.'],
    ['How many people are coming?', 'Only a few: four or five.'],
    ['Is there any milk?', "Yes, there's a lot in the fridge."],
  ]],
]
for (const [unit, page, rows] of REAL_LIFE) {
  GRAMMAR_1[unit][page].push({ t: 'sub', text: 'In real life - في الحياة اليومية' }, { t: 'qa', rows })
}