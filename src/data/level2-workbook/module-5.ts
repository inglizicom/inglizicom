import type { Block } from '../level1-book.ts'
import type { L2WorkUnit } from './types.ts'
import { choose, complete, correct } from '../level2-book/helpers.ts'
import { fromBank, join, match, remember } from './helpers.ts'

/**
 * Workbook, Module 5 — Opinions and ideas. New sentences on each unit's
 * grammar (none copied from the textbook's practice), the mistakes Arabic
 * speakers really make, and the writing skill each unit's text needs.
 */

export const WORK_5: L2WorkUnit[] = [
  /* ── 17 · What do you think? Relative clauses ─────────────────── */
  {
    n: 17, orderFrom: 13,
    grammar: [[
      remember([
        'who for people, which for things, that for both: the man who…, the car which… - أدوات الوصل حسب الاسم.',
        'where for places, whose for possession: the town where…, the girl whose father… - للمكان والملكية.',
        "Don't repeat the pronoun: the man who lives here (not who he lives). - لا نكرّر الضمير.",
      ]),
      choose('who, which, where or whose?', [
        ['A pharmacist is a person ___ sells medicine.', ['who', 'which', 'where'], 0],
        ['Essaouira is a town ___ the wind never stops.', ['which', 'where', 'who'], 1],
        ['I have a neighbour ___ dog barks all night.', ['who', 'which', 'whose'], 2],
        ['The tagine ___ my mother makes is the best.', ['which', 'who', 'where'], 0],
        ['That\'s the hospital ___ I was born.', ['which', 'where', 'whose'], 1],
        ['Do you know the boy ___ is talking to Sara?', ['which', 'whose', 'who'], 2],
        ['I lost the ring ___ my grandmother gave me.', ['that', 'who', 'where'], 0],
        ['She is the teacher ___ students all passed.', ['who', 'whose', 'which'], 1],
      ]),
      complete('One sentence', 'Join the two sentences with who, which or where. - اجمع الجملتين.', [
        ['I have an uncle. He lives in Canada.', 'I have an uncle who lives in Canada.'],
        ['This is the market. We buy spices here.', 'This is the market where we buy spices.'],
        ['I watched a film. It was very sad.', 'I watched a film which was very sad.'],
        ['She has a friend. Her brother is an actor.', 'She has a friend whose brother is an actor.'],
        ['We visited a village. There was no electricity there.', 'We visited a village where there was no electricity.'],
        ['He bought a phone. It cost 5,000 dirhams.', 'He bought a phone which cost 5,000 dirhams.'],
      ], 1, true),
    ], [
      complete('Definitions', 'Complete the definition with who, which or where. - أكمل التعريف.', [
        ['A hammam is a place ___ you wash and relax.', 'where'],
        ['A tagine is a dish ___ is cooked slowly.', 'which / that'],
        ['A guide is a person ___ shows tourists around.', 'who / that'],
        ['A souk is a market ___ you can find everything.', 'where'],
        ['A djellaba is a long robe ___ men and women wear.', 'which / that'],
        ['An orphan is a child ___ parents are dead.', 'whose'],
      ], 2),
      correct([
        ['The girl which sits next to me is from Oujda.', 'The girl who sits next to me is from Oujda.'],
        ['This is the city which I grew up.', 'This is the city where I grew up.'],
        ['I know a man who he speaks five languages.', 'I know a man who speaks five languages.'],
        ['The book that I read it was boring.', 'The book that I read was boring.'],
        ['He is the man who his car was stolen.', 'He is the man whose car was stolen.'],
        ['I am agree with you.', 'I agree with you.'],
      ]),
    ]],
    aboutYou: [
      'What is your town like? Write a sentence with where.',
      'Who is a person who helped you a lot?',
      'What is something which you use every day?',
      'Is it better to live in a city or in the countryside? Why?',
    ],
    writing: [
      join([
        ['A small town is calm. A big city has more jobs. (but)', 'A small town is calm, but a big city has more jobs.'],
        ['I prefer small towns. Life is cheaper there. (because)', 'I prefer small towns because life is cheaper there.'],
        ['The air is clean. People are healthier. (so)', 'The air is clean, so people are healthier.'],
        ['My cousin lives in Ifrane. She loves it. (and)', 'My cousin lives in Ifrane, and she loves it.'],
        ['Big cities are noisy. They are exciting. (but)', 'Big cities are noisy, but they are exciting.'],
      ]),
      fromBank('An opinion paragraph', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['In my ___, a small town is the best place to live.', 'opinion'],
        ['___, it is a place where life is calm.', 'First'],
        ['People ___ live there know their neighbours.', 'who'],
        ['On the other ___, cities have more jobs.', 'hand'],
        ['To sum ___, I think small towns are better.', 'up'],
        ['___, I love the sea, so I would live in Agadir.', 'Personally'],
      ]),
    ],
    plan: [
      'What is the question, and what is your opinion?',
      'What are your two reasons? Give an example.',
      'What is one point on the other side?',
      'What is your conclusion?',
    ],
  },

  /* ── 18 · She said that…: reported speech ─────────────────────── */
  {
    n: 18, orderFrom: 14,
    grammar: [[
      remember([
        'said (that) / told + person (that) + one tense back: He said he was tired. - ننقل الكلام بزمن ماضٍ.',
        "told + person + (not) to + verb: She told me to wait. He told me not to worry. - لنقل الأوامر.",
        'asked + if / question word, with no do or did: He asked me where I lived. - لنقل الأسئلة.',
      ]),
      choose('said, told or asked?', [
        ['My boss ___ me to come early.', ['said', 'told', 'asked if'], 1],
        ['She ___ that she was hungry.', ['told', 'said', 'asked'], 1],
        ['He ___ me if I wanted tea.', ['said', 'told', 'asked'], 2],
        ['They ___ us that the shop was closed.', ['told', 'said', 'asked'], 0],
        ['The teacher ___ us not to talk.', ['said', 'told', 'asked if'], 1],
        ['Omar ___ he would be late.', ['told', 'asked', 'said'], 2],
        ['She ___ me where the station was.', ['asked', 'said', 'told'], 0],
        ['I ___ him the truth.', ['said', 'told', 'asked'], 1],
      ]),
      complete('One step back', 'Write the reported sentence. - اكتب الجملة المنقولة.', [
        ['"I am tired." → She said she ___.', 'was tired'],
        ['"I live in Safi." → He said he ___ in Safi.', 'lived'],
        ['"We are waiting." → They said they ___.', 'were waiting'],
        ['"I will call you." → She said she ___ me.', 'would call'],
        ['"I can swim." → He said he ___.', 'could swim'],
        ['"I don\'t like fish." → She said she ___ fish.', "didn't like"],
        ['"It is raining." → He said it ___.', 'was raining'],
        ['"I won\'t be late." → He said he ___ late.', "wouldn't be"],
      ], 2),
    ], [
      complete('Instructions and questions', 'Report what the doctor said. - انقل ما قاله الطبيب.', [
        ['"Sleep eight hours."', 'He told me to sleep eight hours.'],
        ['"Don\'t eat late at night."', 'He told me not to eat late at night.'],
        ['"Do you play any sport?"', 'He asked me if I played any sport.'],
        ['"How much water do you drink?"', 'He asked me how much water I drank.'],
        ['"Come back next week."', 'He told me to come back next week.'],
        ['"Are you taking any medicine?"', 'He asked me if I was taking any medicine.'],
      ], 1, true),
      correct([
        ['He said me that he was ill.', 'He told me that he was ill.'],
        ['She told that she was busy.', 'She said that she was busy.'],
        ['He asked me what did I want.', 'He asked me what I wanted.'],
        ["She told me don't worry.", 'She told me not to worry.'],
        ['He said he will help me.', 'He said he would help me.'],
        ['She asked me if I am married.', 'She asked me if I was married.'],
      ]),
    ]],
    aboutYou: [
      'What did your parents often tell you when you were a child?',
      'What did someone ask you this week?',
      'What did a teacher once tell you to do?',
      'What is the best advice someone gave you?',
    ],
    writing: [
      join([
        ['I went to the doctor. I had headaches. (because)', 'I went to the doctor because I had headaches.'],
        ["He said I was tired. He said it wasn't serious. (but)", "He said I was tired, but he said it wasn't serious."],
        ['He told me to rest. He told me to walk every day. (and)', 'He told me to rest and to walk every day.'],
        ['I worked eleven hours a day. He was shocked. (so)', 'I worked eleven hours a day, so he was shocked.'],
        ["I'm going to try. It won't be easy. (but)", "I'm going to try, but it won't be easy."],
      ]),
      fromBank('Telling a friend', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['The doctor ___ that I was very tired.', 'said'],
        ['He ___ me to rest.', 'told'],
        ['He ___ me how many hours I worked.', 'asked'],
        ["Don't ___, it's nothing serious!", 'worry'],
        ['He also told me ___ to drink coffee.', 'not'],
        ['Write ___!', 'soon'],
      ]),
    ],
    plan: [
      'Who did you talk to, and why?',
      'What did the person say?',
      'What did the person ask you, and tell you to do?',
      'What are you going to do now?',
    ],
  },

  /* ── 19 · Pros and cons: linkers; too, enough, so, such ───────── */
  {
    n: 19, orderFrom: 3,
    grammar: [[
      remember([
        'although + a clause, in the same sentence. However, at the start of a new sentence. - للتناقض.',
        "too + adjective = more than we want. adjective + enough = as much as we need. - أكثر من اللازم أو كافٍ.",
        'so + adjective. such (a) + adjective + noun. - للتأكيد.',
      ]),
      choose('Choose the right word', [
        ['___ he is rich, he lives in a small flat.', ['However', 'Although', 'So'], 1],
        ['The test was difficult. ___, I passed.', ['Although', 'Because', 'However'], 2],
        ['I was hungry, ___ I made a sandwich.', ['so', 'although', 'however'], 0],
        ["This box is ___ heavy. I can't lift it.", ['enough', 'too', 'such'], 1],
        ["He isn't tall ___ to play basketball.", ['enough', 'too', 'so'], 0],
        ['It was ___ a long day!', ['so', 'too', 'such'], 2],
        ['The tea is ___ sweet! I love it.', ['so', 'such', 'enough'], 0],
        ['We haven\'t got ___ chairs for everyone.', ['too', 'enough', 'so'], 1],
      ]),
      complete('too or enough?', 'Complete with too or enough and the word in brackets. - أكمل بالكلمة المناسبة.', [
        ["I can't drink this coffee. It's ___. (hot)", 'too hot'],
        ["She can't vote. She isn't ___. (old)", 'old enough'],
        ["We can't buy the house. It's ___. (expensive)", 'too expensive'],
        ["Is the water ___ for a swim? (warm)", 'warm enough'],
        ["I can't run 10 km. I'm not ___. (fit)", 'fit enough'],
        ["Don't buy those shoes. They're ___. (small)", 'too small'],
      ], 2),
    ], [
      complete('Although or however?', 'Write one sentence with although, then two with however. - أعد الكتابة.', [
        ['It was cold. We went to the beach. (Although)', 'Although it was cold, we went to the beach.'],
        ['The hotel was old. It was very clean. (However)', 'The hotel was old. However, it was very clean.'],
        ['He studied a lot. He failed. (Although)', 'Although he studied a lot, he failed.'],
        ['The car is fast. It uses a lot of petrol. (However)', 'The car is fast. However, it uses a lot of petrol.'],
        ['She was tired. She finished her work. (Although)', 'Although she was tired, she finished her work.'],
        ['I like my job. The salary is low. (However)', 'I like my job. However, the salary is low.'],
      ], 1, true),
      correct([
        ['Although it rained, but we played.', 'Although it rained, we played.'],
        ['The room is enough big for us.', 'The room is big enough for us.'],
        ['It is too much cold today.', 'It is too cold today.'],
        ['It was such beautiful day.', 'It was such a beautiful day.'],
        ['She is such kind.', 'She is so kind.'],
        ['However it was late, we stayed.', 'Although it was late, we stayed.'],
      ]),
    ]],
    aboutYou: [
      'What is too expensive for you right now?',
      "What aren't you old or tall enough to do?",
      'What is one advantage and one disadvantage of your phone?',
      'Write a sentence with although about your week.',
    ],
    writing: [
      join([
        ['A car is useful. It is expensive. (although)', 'Although a car is useful, it is expensive.'],
        ['The tram is cheap. It is crowded. (but)', 'The tram is cheap, but it is crowded.'],
        ['The traffic is bad. I walk to work. (so)', 'The traffic is bad, so I walk to work.'],
        ['I like my bike. It is good for my health. (because)', 'I like my bike because it is good for my health.'],
        ['Taxis are fast. They are not cheap. (but)', 'Taxis are fast, but they are not cheap.'],
      ]),
      fromBank('A for-and-against paragraph', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['The main ___ is freedom.', 'advantage'],
        ['___ good thing is time.', 'Another'],
        ['___, there are also disadvantages.', 'However'],
        ['Cars are ___ expensive for most students.', 'too'],
        ['___ a car is useful, it is not always necessary.', 'Although'],
        ['All in ___, I think the tram is better.', 'all'],
      ]),
    ],
    plan: [
      'What is the question?',
      'What are two advantages?',
      'What are two disadvantages?',
      'What is your opinion at the end?',
    ],
  },

  /* ── 20 · I'd recommend it: modals of deduction ────────────────── */
  {
    n: 20, orderFrom: 18,
    grammar: [[
      remember([
        'must be = I am almost sure it is true: It must be good. - شبه متأكّد أنه صحيح.',
        "might / may / could be = maybe. can't be = I am almost sure it is not true. - ربّما، أو شبه متأكّد أنه غير صحيح.",
        "Recommending: I'd recommend… You should… I wouldn't… - للتوصية والتحذير.",
      ]),
      choose("must, might or can't?", [
        ["She's wearing a white coat. She ___ be a doctor.", ['must', "can't", 'might not'], 0],
        ["He's got a Spanish name. He ___ be from Spain, but I'm not sure.", ["can't", 'might', 'must'], 1],
        ["That ___ be Ali. Ali is in Paris this week.", ['must', 'might', "can't"], 2],
        ["They've got five cars. They ___ be very rich.", ['must', "can't", 'might not'], 0],
        ["I'm not sure where my keys are. They ___ be in the car.", ["can't", 'might', 'must'], 1],
        ["You've just eaten. You ___ be hungry!", ['must', 'might', "can't"], 2],
        ["The lights are on. Someone ___ be at home.", ['must', "can't", 'might not'], 0],
        ["It ___ rain later. Take a jacket, just in case.", ["can't", 'might', 'must'], 1],
      ]),
      complete('Make a guess', "Write a guess with must, might or can't. - اكتب استنتاجًا.", [
        ["He's yawning all the time. (tired)", 'He must be tired.'],
        ["She's only fifteen. (a teacher)", "She can't be a teacher."],
        ["I don't know where Nadia is. (at the library)", 'She might be at the library.'],
        ['The restaurant is empty on a Saturday night. (very good)', "It can't be very good."],
        ['He speaks perfect English. (from London)', 'He might be from London.'],
        ['They are always laughing together. (good friends)', 'They must be good friends.'],
      ], 1, true),
    ], [
      fromBank('A good review or a bad one?', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['The food was ___. I ate everything!', 'delicious'],
        ['The soup was ___. It needed salt.', 'tasteless'],
        ['The waiter was very ___ and helpful.', 'friendly'],
        ['The drinks were ___. Thirty dirhams for a juice!', 'overpriced'],
        ['From our table, the view was ___.', 'amazing'],
        ["It wasn't cheap, but it was good ___ for money.", 'value'],
      ]),
      correct([
        ['He must to be at home.', 'He must be at home.'],
        ["It mustn't be true. I'm sure it isn't.", "It can't be true. I'm sure it isn't."],
        ['She might is busy.', 'She might be busy.'],
        ['I recommend you to visit Fes.', "I'd recommend visiting Fes."],
        ['The view was very amazing.', 'The view was really amazing.'],
        ["You should to book a table.", 'You should book a table.'],
      ]),
    ]],
    aboutYou: [
      'What is the best restaurant or café in your town? Why?',
      'Which place in Morocco would you recommend to a tourist?',
      "Which place wouldn't you recommend? Why not?",
      'Look at a person near you. Write a guess about them.',
    ],
    writing: [
      join([
        ['The service was slow. The waiters were friendly. (but)', 'The service was slow, but the waiters were friendly.'],
        ['It gets busy. You should book a table. (so)', 'It gets busy, so you should book a table.'],
        ['I loved the restaurant. The fish was so fresh. (because)', 'I loved the restaurant because the fish was so fresh.'],
        ["It isn't cheap. It's worth it. (although)", "Although it isn't cheap, it's worth it."],
        ['The view was amazing. The music was lovely. (and)', 'The view was amazing, and the music was lovely.'],
      ]),
      match('Parts of a review', 'Write the letter of the right sentence. - اكتب حرف الجملة المناسبة.', [
        ['The place', 'It is a small café by the sea.'],
        ['The food', 'The pastilla was delicious.'],
        ['The service', 'The waiters were quick and friendly.'],
        ['A bad point', 'It is a bit noisy at the weekend.'],
        ['A recommendation', "I'd recommend the fresh orange juice."],
        ['A warning', "I wouldn't go there on a Friday night."],
      ], 2),
    ],
    plan: [
      'Which place is it, where is it, and when did you go?',
      'What were the food, the service and the place like?',
      'What was good, and what was bad?',
      'What do you recommend? How many stars?',
    ],
  },
]

/** The Module 5 test: two pages, about 40 minutes, marked out of 40. */
export const TEST_5: [Block[], Block[]] = [[
  { t: 'banner', title: 'Module 5 test - اختبار المحور الخامس', icons: ['🏁', '⭐'], tone: 'practice' },
  { t: 'callout', text: 'أجب دون أن تنظر إلى الكتاب، في 40 دقيقة تقريبًا. بعد ذلك صحّح أجوبتك في آخر الدفتر، واكتب نتيجتك في الجدول.' },
  fromBank('Vocabulary', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
    ['She got a job ___ in Rabat.', 'offer'],
    ["That's a good ___. I didn't think of that.", 'point'],
    ["I've got a terrible ___. Have you got an aspirin?", 'headache'],
    ["Don't worry. It's nothing ___.", 'serious'],
    ['I bought a ___ car. It was cheaper.', 'second-hand'],
    ['The main ___ of a car is freedom.', 'advantage'],
    ['The fish was ___. I ate everything!', 'delicious'],
    ["It's expensive, but it's ___ it.", 'worth'],
  ]),
  choose('Grammar', [
    ['The woman ___ lives next door is a nurse.', ['which', 'who', 'where'], 1],
    ['This is the town ___ I was born.', ['where', 'which', 'who'], 0],
    ['He ___ me that he was busy.', ['said', 'asked', 'told'], 2],
    ['She asked me ___ I liked fish.', ['that', 'if', 'did'], 1],
    ['___ it was late, we stayed.', ['Although', 'However', 'So'], 0],
    ["I'm not old ___ to drive.", ['too', 'so', 'enough'], 2],
    ["It's always full. It ___ be good.", ['must', "can't", 'might not'], 0],
    ["He's ten. He ___ be a doctor.", ['must', 'might', "can't"], 2],
  ]),
], [
  { t: 'bar', title: 'Module 5 test (continued) - اختبار المحور الخامس', icon: '🏁', tone: 'practice' },
  correct([
    ['The man which works here is kind.', 'The man who works here is kind.'],
    ['She said me that she was tired.', 'She told me that she was tired.'],
    ['He asked me where did I work.', 'He asked me where I worked.'],
    ['Although it rained, but we went out.', 'Although it rained, we went out.'],
    ['The flat is enough big.', 'The flat is big enough.'],
    ['She must to be at work.', 'She must be at work.'],
  ]),
  match('Expressions: question and answer', 'Write the letter of the answer. - اكتب حرف الجواب المناسب.', [
    ['What do you think of Rabat?', "In my opinion, it's a lovely city."],
    ['Money is everything.', "I see what you mean, but I don't agree."],
    ['What did the doctor say?', 'He said I was tired.'],
    ['What are the advantages?', 'The main advantage is time.'],
    ['Can you recommend a good café?', "I'd recommend Café Hafa."],
    ['Is it busy on Fridays?', 'Very. You should book a table.'],
  ], 2),
  { t: 'bar', title: 'Writing - الكتابة', icon: '✍️', tone: 'writing' },
  { t: 'bullets', size: 13.5, items: ['Write a short review of a place you know: describe it, give one good and one bad point, and say what people told you about it. - اكتب تقييمًا قصيرًا لمكان تعرفه: صِفه واذكر إيجابية وسلبية وانقل ما قاله الناس عنه.'] },
  { t: 'lines', n: 5, grow: true },
  { t: 'grid', rows: [
    { dark: true, span: [1, 1, 1, 1, 1, 1], cells: ['Vocabulary', 'Grammar', 'Mistakes', 'Expressions', 'Writing', 'Total'] },
    { span: [1, 1, 1, 1, 1, 1], size: 14, cells: ['___ / 8', '___ / 8', '___ / 6', '___ / 6', '___ / 12', '___ / 40'] },
  ] },
]]
