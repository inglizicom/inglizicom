import type { Block } from '../level1-book.ts'
import { box, choose, complete, correct, grammarBar, inTalk, pair, practiceBar, table } from './helpers.ts'

/**
 * Module 5's grammar lessons (opinions and ideas), four pages each: the
 * uses with examples, the form, the rule found in the unit's conversation,
 * the mistakes Arabic speakers make, then practice.
 */

export const GRAMMAR_5: Record<number, Block[][]> = {
  /* ── 17 · relative clauses ───────────────────────────────────────── */
  17: [
    [
      grammarBar('Relative clauses: who, which, that - جمل الوصل', '🔗'),
      { t: 'callout', text: 'نستعمل جملة الوصل لنحدّد الشخص أو الشيء الذي نقصده، أو لنضيف معلومة عنه، فتصبح الجملتان جملة واحدة.' },
      table('Which word? - أيّ أداة نختار؟', ['Word', 'For', 'Example'], [
        ['who', 'people', 'The man who lives next door is a doctor.'],
        ['which', 'things, animals', 'The car which I bought is red.'],
        ['that', 'people and things', 'The job that they offered me is interesting.'],
        ['where', 'places', 'This is the café where we met.'],
        ['whose', 'possession', 'I have a friend whose flat is near the sea.'],
      ], [0.7, 1, 2.4]),
      ...box('Two sentences → one - من جملتين إلى جملة', [
        'I have a cousin. She lives in Fes. → I have a cousin who lives in Fes.',
        'I read a book. It was great. → I read a book which was great.',
        'We stayed in a hotel. It had a pool. → We stayed in a hotel that had a pool.',
      ]),
      { t: 'bullets', size: 13, items: [
        'The relative word replaces he, she or it: the man who lives here (not the man who he lives here). - أداة الوصل تحلّ محلّ الضمير، فلا نكرّره.',
        'When who, which or that is the object, we can leave it out: the film (that) I saw. - إذا كانت أداة الوصل مفعولًا به يمكن حذفها.',
      ] },
      pair(
        box('People and things - أشخاص وأشياء', ['the woman who called you', 'the bus which goes to Rabat', 'the shop that sells phones']),
        box('Places and owners - أماكن وأصحاب', ['the street where I live', 'the town where my father was born', 'the man whose car is red']),
      ),
    ],
    [
      grammarBar('where and whose - للمكان والملكية', '📍'),
      { t: 'callout', text: 'نستعمل where بعد اسم مكان، ونستعمل whose لنقول من هو صاحب الشيء.' },
      pair(
        box('where: places - للأماكن', ['Rabat is a place where you can breathe.', 'This is the school where I studied.', 'I know a restaurant where the fish is fresh.']),
        box('whose: possession - للملكية', ['My friend whose flat is near the Twin Center pays a lot.', 'That is the girl whose father is a pilot.', 'I met a man whose son plays for Raja.']),
      ),
      ...box('Adding information - إضافة معلومة', [
        'My cousin, who lives in Maarif, spends two hours in traffic.',
        'Ifrane, which is in the Middle Atlas, is very cold in winter.',
        'With commas, we cannot use that or leave the word out.',
      ]),
      inTalk([
        "It's a city where everything happens. → a place - مكان",
        'My cousin, who lives in Maarif, … → a person - شخص',
        'The company which is in Casablanca pays more. → a thing - شيء',
        'My friend whose flat is near the Twin Center … → possession - ملكية',
      ]),
    ],
    [
      grammarBar('Giving opinions - إبداء الرأي', '💬'),
      pair(
        box('Your opinion - رأيك', ['In my opinion, Casablanca is the best.', 'Personally, I love big cities.', 'To be honest, I prefer Rabat.']),
        box('Agreeing and disagreeing - الموافقة والمعارضة', ['I agree with you. · Exactly!', "I see what you mean, but money isn't everything.", "I'm not sure about that."]),
      ),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['The man which lives here is a doctor.', 'The man who lives here is a doctor.', 'مع الأشخاص نستعمل who، ولا نستعمل which معهم.'],
        ['This is the town which I was born.', 'This is the town where I was born.', 'للمكان نستعمل where في هذه الجملة.'],
        ['I have a friend who he lives in Paris.', 'I have a friend who lives in Paris.', 'لا نكرّر الضمير بعد أداة الوصل.'],
        ['I am agree with you.', 'I agree with you.', 'لا نضع am قبل الفعل agree في هذه العبارة.'],
        ['The girl who her father is a pilot.', 'The girl whose father is a pilot.', 'للملكية نستعمل whose بدل who مع الضمير.'],
      ] },
      ...box('Asking for opinions - السؤال عن الرأي', ['What do you think of Tangier?', 'How do you feel about working at night?', "What's your opinion on online classes?"]),
    ],
    [
      practiceBar,
      choose('Choose the correct word', [
        ['The woman ___ lives next door is a teacher.', ['who', 'which', 'where'], 0],
        ["That's the restaurant ___ we had lunch.", ['which', 'where', 'who'], 1],
        ['I have a friend ___ brother plays for Wydad.', ['who', 'whose', 'which'], 1],
        ['The bus ___ goes to the airport is number 7.', ['who', 'where', 'which'], 2],
        ['Is this the phone ___ you bought yesterday?', ['that', 'who', 'where'], 0],
        ['A: I think Fes is beautiful. B: ___', ['I agree with you.', 'I am agree.', 'I agree you.'], 0],
      ]),
      complete('Complete with who, which, where or whose', 'Write one word. - اكتب كلمة واحدة.', [
        ['A baker is a person ___ makes bread.', 'who'],
        ['Chefchaouen is a town ___ the houses are blue.', 'where'],
        ['This is the book ___ I told you about.', 'which / that'],
        ['I met a man ___ wife is from Tunisia.', 'whose'],
        ['The film ___ we saw was boring.', 'which / that'],
        ['Ifrane is a place ___ it snows in winter.', 'where'],
      ], 2),
      correct([
        ['The man which lives here is a doctor.', 'The man who lives here is a doctor.'],
        ['This is the town which I was born.', 'This is the town where I was born.'],
        ['I have a friend who he lives in Paris.', 'I have a friend who lives in Paris.'],
        ['I am agree with you.', 'I agree with you.'],
        ["That's the girl who her father is a pilot.", "That's the girl whose father is a pilot."],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Describe your town: My town is a place where…',
        'Describe a friend with who.',
        'Give your opinion about your town in one sentence.',
      ] },
    ],
  ],

  /* ── 18 · reported speech ────────────────────────────────────────── */
  18: [
    [
      grammarBar('Reported speech: said and told - الكلام المنقول', '🗨️'),
      { t: 'callout', text: 'عندما ننقل كلام شخص آخر، نرجع غالبًا بالزمن خطوة إلى الماضي، ونغيّر الضمائر حسب المتكلّم.' },
      table('Tense changes - تغيّر الأزمنة', ['Direct speech', 'Reported speech'], [
        ['"I am tired."', 'He said (that) he was tired.'],
        ['"I work eleven hours."', 'He said he worked eleven hours.'],
        ['"I am working."', 'She said she was working.'],
        ['"I will call you."', 'She said she would call me.'],
        ['"I can help."', 'He said he could help.'],
      ], [1, 1.4]),
      pair(
        box('said - قال', ['He said that I was tired.', 'She said she was busy.', 'They said it was free.']),
        box('told + person - قال لـ', ['He told me that I was tired.', 'She told us she was busy.', 'They told him it was free.']),
      ),
      { t: 'bullets', size: 13, items: [
        'say + (that): He said that he was tired. - بعد say لا نذكر الشخص مباشرة.',
        'tell + person + (that): He told me that he was tired. - بعد tell نذكر الشخص دائمًا.',
      ] },
      pair(
        box('Pronouns change - تتغيّر الضمائر', ['"I love you." → He said he loved me.', '"We are ready." → They said they were ready.', '"My car is new." → She said her car was new.']),
        box('Other reporting verbs - أفعال نقل أخرى', ['explain: He explained that it was closed.', 'promise: She promised she would come.', 'reply: He replied that he was busy.']),
      ),
    ],
    [
      grammarBar('Instructions and questions - الأوامر والأسئلة', '❓'),
      { t: 'callout', text: 'لننقل أمرًا نستعمل told ثم الشخص ثم to، ولننقل سؤالًا نستعمل asked، ويعود السؤال إلى ترتيب الجملة العادية.' },
      table(undefined, ['Direct', 'Reported'], [
        ['"Rest."', 'He told me to rest.'],
        ['"Don\'t drink coffee."', 'He told me not to drink coffee.'],
        ['"Can you come back next month?"', 'He asked me to come back next month.'],
        ['"Do you sleep well?"', 'He asked me if I slept well.'],
        ['"How many hours do you work?"', 'He asked me how many hours I worked.'],
      ], [1, 1.4]),
      inTalk([
        'He said that I was very tired. → a statement - خبر',
        'He told me to rest. → an instruction - أمر',
        'He told me not to drink so much coffee. → a negative instruction - نهي',
        'He asked me if I slept well. → a yes / no question - سؤال بنعم أو لا',
      ]),
      ...box('Reporting a phone call - نقل مكالمة', ['My boss called. He said the meeting was at ten.', 'He asked me if I had the report.', 'He told me not to be late.']),
    ],
    [
      grammarBar('Other changes - تغييرات أخرى', '🔄'),
      table('Time and place - الزمان والمكان', ['Direct', 'Reported'], [
        ['today · tonight', 'that day · that night'],
        ['tomorrow', 'the next day'],
        ['yesterday', 'the day before'],
        ['now · here', 'then · there'],
      ], [1, 1]),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['He said me that I was tired.', 'He told me that I was tired.', 'إذا ذكرنا الشخص نستعمل told بدل الفعل الآخر.'],
        ['She told that she was busy.', 'She said that she was busy.', 'بعد told يجب أن نذكر الشخص.'],
        ['He asked me if did I sleep well.', 'He asked me if I slept well.', 'في السؤال المنقول نحذف did ونستعمل ترتيب الجملة العادية.'],
        ["He told me don't drink coffee.", 'He told me not to drink coffee.', 'للنهي المنقول نستعمل not to ثم الفعل.'],
        ['She said she will call me.', 'She said she would call me.', 'في الكلام المنقول تصبح will هي would غالبًا.'],
      ] },
      ...box('A message for you - رسالة لك', ['Karim called. He said he would be late.', 'Your mum asked if you were coming for dinner.', 'The teacher told you to bring your book.']),
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['He ___ me that he was busy.', ['said', 'told', 'asked'], 1],
        ['She ___ that she was tired.', ['said', 'told', 'asked'], 0],
        ['The doctor told me ___ more water.', ['drink', 'to drink', 'drinking'], 1],
        ['He asked me ___ I was married.', ['if', 'that', 'did'], 0],
        ['"I will help you." → She said she ___ help me.', ['will', 'would', 'can'], 1],
        ['"Don\'t be late." → He told us ___ late.', ["don't be", 'not to be', 'to not'], 1],
      ]),
      complete('Report it', 'Write what they said. - اكتب ما قالوه.', [
        ['"I am hungry." (Sara said…)', 'Sara said (that) she was hungry.'],
        ['"Close the door." (She told me…)', 'She told me to close the door.'],
        ['"Are you ready?" (He asked me…)', 'He asked me if I was ready.'],
        ['"Where do you work?" (She asked me…)', 'She asked me where I worked.'],
      ], 1, true),
      correct([
        ['She said me she was tired.', 'She told me she was tired.'],
        ['He asked me where did I live.', 'He asked me where I lived.'],
        ['The teacher told us open our books.', 'The teacher told us to open our books.'],
        ['He said that he will come.', 'He said that he would come.'],
        ['She asked me if I am hungry.', 'She asked me if I was hungry.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write what a teacher once told you.',
        'Write a question someone asked you this week.',
        'Write one piece of advice your parents gave you.',
      ] },
    ],
  ],

  /* ── 19 · linkers; too, enough, so, such ─────────────────────────── */
  19: [
    [
      grammarBar('Linkers - أدوات الربط', '🔗'),
      { t: 'callout', text: 'أدوات الربط تجعل الكلام والكتابة واضحين ومنظّمين: بعضها للتناقض، وبعضها للسبب والنتيجة، وبعضها لإضافة فكرة.' },
      table('Which linker? - أيّ أداة نختار؟', ['Meaning', 'Linker', 'Example'], [
        ['contrast', 'but · although · however', 'Although the tram is crowded, it is cheap.'],
        ['reason', 'because · as', 'I take the tram because it is cheap.'],
        ['result', 'so', 'The tram was full, so I walked.'],
        ['adding', 'and · also · another', 'Another good thing is freedom.'],
      ], [0.8, 1.3, 2.2]),
      pair(
        box('although: one sentence - في الجملة نفسها', ['Although it was late, we went out.', 'We went out, although it was late.', 'Although he is rich, he is not happy.']),
        box('however: a new sentence - في جملة جديدة', ['The car is fast. However, it is expensive.', 'I like Rabat. However, I live in Fes.', 'It was cold. However, we swam.']),
      ),
      { t: 'bullets', size: 13, items: [
        'However comes at the start of a new sentence, with a comma after it. - نضع however في بداية جملة جديدة وبعدها فاصلة.',
      ] },
      pair(
        box('because or so? - السبب أم النتيجة؟', ['I took a taxi because I was late.', 'I was late, so I took a taxi.', 'As it was raining, we stayed in.']),
        box('Adding ideas - إضافة أفكار', ['Also, it is good for your health.', 'Another good thing is the price.', 'What is more, it is fun.']),
      ),
    ],
    [
      grammarBar('too, enough, so, such - كلمات الدرجة', '📏'),
      { t: 'callout', text: 'نستعمل too لما هو أكثر من اللازم، و enough لما هو كافٍ، و so و such للتأكيد.' },
      table(undefined, ['Word', 'Form', 'Example'], [
        ['too', 'too + adjective', 'New cars are too expensive.'],
        ['enough', 'adjective + enough', "The garage isn't big enough."],
        ['enough', 'enough + noun', 'Have we got enough money?'],
        ['so', 'so + adjective', 'The tram is so crowded!'],
        ['such', 'such (a) + adjective + noun', "That's such a good idea!"],
        ['so / such … that', 'a result', 'The traffic is so bad that I walk.'],
      ], [0.9, 1.4, 2]),
      inTalk([
        "Although the tram is crowded, it's cheap. → contrast - تناقض",
        'New cars are too expensive. → more than we want - أكثر من اللازم',
        "The garage isn't big enough. → less than we need - غير كافٍ",
        "That's such a good idea! → a strong feeling - تأكيد",
      ]),
      pair(
        box('too or very? - الفرق بينهما', ['The tea is very hot, but I can drink it.', "The tea is too hot. I can't drink it.", 'too always tells us about a problem.']),
        box('so / such … that - النتيجة', ['It was so hot that we stayed inside.', 'It was such a hot day that we stayed inside.', 'He was so tired that he slept at nine.']),
      ),
    ],
    [
      grammarBar('For and against - مع وضد', '⚖️'),
      pair(
        box('Advantages - المزايا', ['The main advantage is time.', 'Another good thing is freedom.', 'It is also useful at weekends.']),
        box('Disadvantages - العيوب', ['The main disadvantage is the price.', 'The problem is parking.', 'On the other hand, the tram is cheap.']),
      ),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['Although it was late, but we went out.', 'Although it was late, we went out.', 'لا نستعمل although و but في الجملة نفسها.'],
        ['It is enough big.', 'It is big enough.', 'تأتي enough بعد الصفة.'],
        ['It is too much expensive.', 'It is too expensive.', 'لا نضع much بين too والصفة.'],
        ['It was such good idea.', 'It was such a good idea.', 'مع الاسم المفرد نقول such a ثم الصفة والاسم.'],
        ['The film was very boring that I slept.', 'The film was so boring that I slept.', 'قبل that في هذه الجملة نستعمل so للتأكيد.'],
      ] },
      ...box('Ending a for-and-against text - الخاتمة', ['All in all, I think that the tram is better.', 'To sum up, there are good and bad points.', 'In my opinion, the advantages are stronger.']),
    ],
    [
      practiceBar,
      choose('Choose the correct word', [
        ['___ it was raining, we went to the beach.', ['Although', 'However', 'Because'], 0],
        ["I'm tired. ___, I'll help you.", ['Although', 'However', 'So'], 1],
        ["This coffee is ___ hot. I can't drink it.", ['too', 'enough', 'such'], 0],
        ["He isn't old ___ to drive.", ['too', 'enough', 'so'], 1],
        ['It was ___ a beautiful day!', ['so', 'such', 'too'], 1],
        ['The film was ___ funny that we laughed all night.', ['so', 'such', 'too'], 0],
      ]),
      complete('Complete the sentences', 'Choose the word in brackets. - اختر الكلمة المناسبة.', [
        ["The bag is ___ heavy. I can't carry it. (too / enough)", 'too'],
        ['Is the room big ___ for four people? (too / enough)', 'enough'],
        ['She is ___ kind! (so / such)', 'so'],
        ['They are ___ nice people. (so / such)', 'such'],
        ['I missed the bus, ___ I took a taxi. (so / because)', 'so'],
        ['I stayed at home ___ I was ill. (so / because)', 'because'],
      ], 2),
      correct([
        ['Although I was tired, but I worked.', 'Although I was tired, I worked.'],
        ['The car is enough big.', 'The car is big enough.'],
        ['It was too much hot.', 'It was too hot.'],
        ['She is such nice.', 'She is so nice.'],
        ["It's so a good idea!", "It's such a good idea!"],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write one advantage and one disadvantage of living in a big city.',
        'Write a sentence with although.',
        'Write a sentence about your town with too or enough.',
      ] },
    ],
  ],

  /* ── 20 · modals of deduction ────────────────────────────────────── */
  20: [
    [
      grammarBar("must, might, can't: guessing - الاستنتاج", '🔍'),
      { t: 'callout', text: 'نستعمل هذه الأفعال لنستنتج شيئًا مما نراه أو نعرفه، دون أن نكون متأكّدين تمامًا.' },
      table('How sure are you? - ما درجة يقينك؟', ['Word', 'Example', 'How sure?'], [
        ['must be', "It must be good. It's always full.", '95% yes'],
        ['might / may / could be', 'It might be closed.', '50%'],
        ["can't be", "It can't be cheap. It's so elegant.", '95% no'],
      ], [1.2, 2, 0.7]),
      pair(
        box('People - الأشخاص', ['He must be a musician. He has a guitar.', "She can't be his mother. She's too young.", 'They might be tourists.']),
        box('Places and things - الأماكن والأشياء', ['That must be the restaurant. I can see the sign.', "This can't be the right bus.", 'The shop might be closed.']),
      ),
      { t: 'bullets', size: 13, items: [
        'must / might / can\'t + base verb: She must know Amal. - بعدها يأتي الفعل في صيغته الأصلية.',
        'In Unit 13, must was a rule. Here it means: I am almost sure. - في الوحدة الثالثة عشرة كانت قاعدة، وهنا تعني أنني شبه متأكّد.',
      ] },
      pair(
        box('Questions - السؤال', ['Who can that be at the door?', 'Where might she be?', "Could it be Ali's car?"]),
        box('Giving a reason - ذكر السبب', ["It must be cold. Everyone's wearing a coat.", "She can't be at home. Her car isn't there.", "He might be ill. He didn't come today."]),
      ),
    ],
    [
      grammarBar('Recommending - التوصية', '⭐'),
      { t: 'callout', text: 'عندما نوصي بمكان أو بشيء نستعمل عبارات مهذّبة، وقد ننصح أحيانًا بعدم الذهاب في وقت معيّن.' },
      pair(
        box('Recommending - التوصية', ["I'd recommend the fish tagine.", 'You should book a table.', 'You must try the pastilla!']),
        box('Warning - التحذير', ["I wouldn't go there after nine.", "I wouldn't recommend the coffee.", 'Avoid Fridays. It gets too busy.']),
      ),
      table('Describing an experience - وصف تجربة', ['Good', 'Bad'], [
        ['The food was delicious.', 'The food was tasteless.'],
        ['The service was fast and friendly.', 'The service was slow.'],
        ['The view was amazing.', 'The room was noisy.'],
        ['It was good value for money.', 'It was overpriced.'],
      ], [1, 1]),
      inTalk([
        "It must be good. It's always full. → almost sure: yes - شبه متأكّد",
        "It can't be cheap. → almost sure: no - شبه متأكّد من العكس",
        'It might be closed. → maybe - ربّما',
        "I'd recommend the fish tagine. → a recommendation - توصية",
      ]),
    ],
    [
      grammarBar('What I see, what I guess - ما أراه وما أستنتجه', '⚖️'),
      table(undefined, ['What I see', 'My guess'], [
        ['The lights are off.', 'They must be asleep. / They might be out.'],
        ["He's wearing a uniform.", "He must be a pilot. He can't be a student."],
        ['She is speaking Spanish.', 'She might be from Spain, or from Tetouan!'],
        ['The car is very old.', "It can't be expensive."],
      ], [1, 1.4]),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ["It mustn't be cheap. (I'm sure it isn't)", "It can't be cheap.", 'للاستنتاج المنفي نستعمل can\'t وليس الصيغة الأخرى.'],
        ['He must to be a doctor.', 'He must be a doctor.', 'بعد must لا نضع to أبدًا.'],
        ['She might is at home.', 'She might be at home.', 'بعد might نستعمل be في صيغتها الأصلية.'],
        ['I recommend you to go there.', "I'd recommend going there.", 'مع recommend نستعمل صيغة ing، أو نقول should بدلها.'],
        ['The food was very delicious.', 'The food was really delicious.', 'مع الصفات القويّة نستعمل really، ولا نستعمل very معها.'],
      ] },
      ...box('Strong adjectives - صفات قويّة', ['good → excellent · bad → terrible', 'tasty → delicious · big → huge', 'nice → amazing · tired → exhausted']),
    ],
    [
      practiceBar,
      choose('Choose the correct word', [
        ['She has a stethoscope. She ___ be a doctor.', ['must', "can't", 'might not'], 0],
        ["He's only twelve. He ___ be a driver.", ['must', "can't", 'might'], 1],
        ["I'm not sure where Ali is. He ___ be at the gym.", ['must', "can't", 'might'], 2],
        ["They're speaking German. They ___ be from Spain.", ['must', "can't", 'should'], 1],
        ['The restaurant is always full. The food ___ be good.', ['must', "can't", 'might not'], 0],
        ["I'd ___ the fish. It's excellent.", ['recommend', 'recommending', 'to recommend'], 0],
      ]),
      complete('Make a guess', "Use must, might or can't. - استعمل الكلمة المناسبة.", [
        ["He's yawning. He ___ be tired.", 'must'],
        ["She's in Tokyo today. She ___ be in Fes.", "can't"],
        ["Don't wait for Karim. He ___ be late.", 'might'],
        ["It's nine. That ___ be Mum. She always calls at nine.", 'must'],
        ["That ___ be Omar's car. He hasn't got a car.", "can't"],
        ['Take an umbrella. It ___ rain.', 'might'],
      ], 2),
      correct([
        ['He must to be at home.', 'He must be at home.'],
        ["She mustn't be his sister. She's too old.", "She can't be his sister. She's too old."],
        ['They might are tired.', 'They might be tired.'],
        ['I recommend you to try it.', "I'd recommend trying it."],
        ['The view was very amazing.', 'The view was really amazing.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Look around you. Write one thing that must be true.',
        'Write one guess about a person near you.',
        'Write a recommendation for a place in your town.',
      ] },
    ],
  ],
}
