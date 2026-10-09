import type { Block } from '../level1-book.ts'
import type { L2WorkUnit } from './types.ts'
import { choose, complete, correct } from '../level2-book/helpers.ts'
import { fromBank, join, match, remember } from './helpers.ts'

/**
 * Workbook, Module 1 — People and everyday life. New sentences on each
 * unit's grammar (none copied from the textbook's practice), the mistakes
 * Arabic speakers really make, and the writing skill each unit's text needs.
 */

export const WORK_1: L2WorkUnit[] = [
  /* ── 1 · Meeting someone new: present simple & continuous ─────── */
  {
    n: 1, orderFrom: 14,
    grammar: [[
      remember([
        'Present simple: facts, jobs and habits: I work in a bank. She lives in Fes. - للحقائق والعمل والعادات.',
        "Present continuous: now, and these days: This month I'm working nights. - لما يحدث الآن أو في هذه الأيام.",
      ]),
      choose('Present simple or present continuous?', [
        ['Imane ___ at the hospital in Agdal.', ['works', 'is working', 'work'], 0],
        ['Shh! The baby ___ now.', ['sleeps', 'is sleeping', 'sleep'], 1],
        ['I usually ___ to work by bus.', ['am going', 'goes', 'go'], 2],
        ['This week my brother ___ with us.', ['is staying', 'stays', 'stay'], 0],
        ['___ you speak French?', ['Are', 'Do', 'Does'], 1],
        ['What ___ these days? Are you still at the bank?', ['do you do', 'you are doing', 'are you doing'], 2],
        ["My sister ___ meat. She's a vegetarian.", ["isn't eating", "doesn't eat", "don't eat"], 1],
        ['Look! It ___ again.', ['is raining', 'rains', 'rain'], 0],
      ]),
      complete('Spelling: he / she and -ing', 'Write the verb with he or she, then with ing. - اكتب الفعل مع ضمير الغائب، ثم في صيغة المستمر.', [
        ['study → she ___ · ___', 'studies · studying'], ['watch → he ___ · ___', 'watches · watching'],
        ['have → she ___ · ___', 'has · having'], ['write → he ___ · ___', 'writes · writing'],
        ['sit → she ___ · ___', 'sits · sitting'], ['go → he ___ · ___', 'goes · going'],
        ['fly → she ___ · ___', 'flies · flying'], ['stop → he ___ · ___', 'stops · stopping'],
      ], 2),
      complete('Hamza talks about himself', 'Put the verbs in the right form. - ضع الأفعال في الصيغة المناسبة.', [
        ['My name is Hamza. I ___ (come) from Larache.', 'come'],
        ['I ___ (work) in a hotel in Tangier.', 'work'],
        ['I usually ___ (start) at seven in the morning.', 'start'],
        ['My wife ___ (teach) Arabic at a primary school.', 'teaches'],
        ["This month she ___ (not work) because we have a new baby.", "isn't working"],
        ["At the moment I ___ (learn) English for my job.", "'m learning (am learning)"],
        ['A lot of our guests ___ (speak) English.', 'speak'],
        ['And you? ___ you ___ (study) English too?', 'Are … studying'],
      ]),
    ], [
      complete('Ask the question', 'Write the question with the words. - اكتب السؤال بهذه الكلمات.', [
        ["what / you / do? — I'm a pharmacist.", 'What do you do?'],
        ['where / your sister / work? — At a hotel.', 'Where does your sister work?'],
        ['what / you / read? — A book about Morocco.', 'What are you reading?'],
        ['how often / you / study / at home? — Every evening.', 'How often do you study at home?'],
        ['why / you / take / this course? — For my job.', 'Why are you taking this course?'],
        ['your colleagues / speak / English? — Yes, they do.', 'Do your colleagues speak English?'],
      ], 1, true),
      correct([
        ['I am work in a bank.', 'I work in a bank.'],
        ["She don't like her job.", "She doesn't like her job."],
        ['Where you live?', 'Where do you live?'],
        ['He is study English these days.', 'He is studying English these days.'],
        ['I am knowing her very well.', 'I know her very well.'],
        ['My brother work at night.', 'My brother works at night.'],
      ]),
    ]],
    aboutYou: [
      'Where do you live, and what do you do?',
      'What do you usually do in the evening?',
      'What are you doing these days at work or at school?',
      'Why are you learning English?',
    ],
    writing: [
      join([
        ['I live in Rabat. I come from Meknes. (but)', 'I live in Rabat, but I come from Meknes.'],
        ["I'm tired. I'm working nights this month. (because)", "I'm tired because I'm working nights this month."],
        ["I need English for my job. I'm taking this course. (so)", "I need English for my job, so I'm taking this course."],
        ['I work for a small company. I like my colleagues. (and)', 'I work for a small company and I like my colleagues.'],
        ["I want to study every evening. I'm working late these days. (but)", "I want to study every evening, but I'm working late these days."],
      ]),
      complete('Put the message in order', 'Number the lines from 1 to 6. - رقّم أسطر الرسالة حسب ترتيبها.', [
        ['___ Do you want to study together on Sundays?', '5'],
        ['___ Hi Salma,', '1'],
        ["___ These days I'm looking for a better job, so I need English.", '4'],
        ['___ It was nice to meet you at the break today!', '2'],
        ['___ See you next week! Karim', '6'],
        ["___ I'm Karim, the salesperson from Oujda.", '3'],
      ]),
    ],
    plan: [
      'Who are you writing to? Where did you meet?',
      'Which two facts about you will you write?',
      'What are you doing these days?',
      'Which question or idea will you end with?',
    ],
  },

  /* ── 2 · Then and now: past simple & used to ──────────────────── */
  {
    n: 2, orderFrom: 20,
    grammar: [[
      remember([
        'Past simple: one finished action, at a time in the past: I moved here in 2015. - لحدث انتهى في وقت محدد.',
        'used to + verb: an old habit or state, not true now: I used to walk to school. - لعادة قديمة لم تعد موجودة.',
        "Questions and negatives: Did you use to…? I didn't use to… - في السؤال والنفي نكتب use دون حرف الدال.",
      ]),
      complete('Irregular verbs', 'Write the past simple. - اكتب الفعل في الماضي البسيط.', [
        ['go → ___', 'went'], ['see → ___', 'saw'], ['take → ___', 'took'], ['have → ___', 'had'], ['make → ___', 'made'],
        ['buy → ___', 'bought'], ['come → ___', 'came'], ['find → ___', 'found'], ['give → ___', 'gave'], ['teach → ___', 'taught'],
      ], 2),
      choose('Past simple or used to?', [
        ['When I was a child, I ___ in a village.', ['use to live', 'used to live', 'was used to live'], 1],
        ['We ___ to Rabat in 2015.', ['moved', 'used to move', 'were moving'], 0],
        ['___ you use to play outside?', ['Do', 'Were', 'Did'], 2],
        ["I ___ like vegetables, but now I love them.", ["didn't used to", "didn't use to", "don't use to"], 1],
        ["Last summer we ___ my uncle's farm.", ['visited', 'used to visit', 'visit'], 0],
        ['Where ___ you born?', ['did', 'was', 'were'], 2],
        ['There ___ a cinema in our town, but now there is.', ["didn't use to be", "didn't used to be", "doesn't use to be"], 0],
        ['She ___ her first job in 2018.', ['used to get', 'got', 'gets'], 1],
      ]),
      complete('Omar, my first friend in the city', 'Put the verbs in the past simple. - ضع الأفعال في الماضي البسيط.', [
        ['I ___ (grow up) in Azrou, a town in the mountains.', 'grew up'],
        ['My father ___ (work) in a small shop near our house.', 'worked'],
        ['We ___ (not have) a car, so we walked everywhere.', "didn't have"],
        ['In 2010, my family ___ (move) to Meknes.', 'moved'],
        ['I ___ (start) a new school, and I ___ (not know) anyone.', "started · didn't know"],
        ['One day, a boy ___ (sit) next to me and ___ (say) hello.', 'sat · said'],
        ['His name ___ (be) Omar. We ___ (become) best friends.', 'was · became'],
        ['And you? ___ you ___ (go) to school near your home?', 'Did … go'],
      ]),
    ], [
      complete('Then: write it with used to', 'Write the sentence again with used to in the right form. - أعد كتابة الجملة لتعبّر عن عادة قديمة.', [
        ['When I was a child, I played marbles every day.', 'I used to play marbles every day.'],
        ["We didn't have a TV then.", "We didn't use to have a TV."],
        ['My grandmother told us stories every night.', 'My grandmother used to tell us stories every night.'],
        ["I didn't like milk when I was little.", "I didn't use to like milk."],
        ['Did you walk to school every day?', 'Did you use to walk to school?'],
        ['My town was very quiet in those days.', 'My town used to be very quiet.'],
      ], 1, true),
      correct([
        ['I use to live in Fes.', 'I used to live in Fes.'],
        ['Did you used to play football?', 'Did you use to play football?'],
        ['Yesterday I go to the market.', 'Yesterday I went to the market.'],
        ["We didn't went to school on Sunday.", "We didn't go to school on Sunday."],
        ['I was born at 1998.', 'I was born in 1998.'],
        ['Where you grew up?', 'Where did you grow up?'],
      ]),
    ]],
    aboutYou: [
      'Where did you grow up? What was it like?',
      'What did you use to do after school?',
      "What is one thing you used to do but don't do now?",
      'What did you do last weekend?',
    ],
    writing: [
      join([
        ['I used to live in a village. Now I live in Casablanca. (but)', 'I used to live in a village, but now I live in Casablanca.'],
        ['The school was far. We used to walk for an hour. (and)', 'The school was far and we used to walk for an hour.'],
        ["We didn't have a TV. We played outside. (so)", "We didn't have a TV, so we played outside."],
        ['I moved to the city. I wanted to go to university. (because)', 'I moved to the city because I wanted to go to university.'],
        ['I love the city. I miss the quiet. (but)', 'I love the city, but I miss the quiet.'],
      ]),
      fromBank('Time words: then and now', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['___, I lived in a small village.', 'When I was a child'],
        ["___, we didn't have the internet.", 'In those days'],
        ['___, my father bought a TV and all the neighbours came to watch it.', 'One day'],
        ['___ I live in Rabat and I work in an office.', 'Now'],
        ["I don't play marbles ___.", 'any more'],
        ['But I ___ visit my village every summer.', 'still'],
      ]),
    ],
    plan: [
      'Where did you live as a child? What was it like?',
      'What did you use to do every day?',
      'What is one special memory?',
      'What is different in your life now?',
    ],
  },

  /* ── 3 · People around me: comparatives & superlatives ────────── */
  {
    n: 3, orderFrom: 0,
    grammar: [[
      remember([
        'Short adjectives: tall → taller → the tallest; big → bigger; easy → easier. - الصفات القصيرة.',
        'Long adjectives: patient → more patient → the most patient. - الصفات الطويلة.',
        'Irregular: good → better → the best; bad → worse → the worst. - صفات شاذة.',
      ]),
      complete('Write the two forms', 'Write the comparative and the superlative. - اكتب صيغة المقارنة وصيغة التفضيل.', [
        ['tall → ___ → ___', 'taller → the tallest'], ['big → ___ → ___', 'bigger → the biggest'],
        ['funny → ___ → ___', 'funnier → the funniest'], ['kind → ___ → ___', 'kinder → the kindest'],
        ['friendly → ___ → ___', 'friendlier → the friendliest'], ['patient → ___ → ___', 'more patient → the most patient'],
        ['good → ___ → ___', 'better → the best'], ['bad → ___ → ___', 'worse → the worst'],
        ['young → ___ → ___', 'younger → the youngest'], ['beautiful → ___ → ___', 'more beautiful → the most beautiful'],
      ], 2),
      choose('Choose the right answer', [
        ['My brother is ___ than me.', ['more old', 'older', 'oldest'], 1],
        ["She's the ___ person in our office.", ['kindest', 'kinder', 'most kind'], 0],
        ['Is Rabat ___ than Casablanca?', ['quietest', 'the quieter', 'quieter'], 2],
        ['Today is ___ day of the year!', ['hottest', 'the hottest', 'the hotter'], 1],
        ['He looks ___ his father.', ['as', 'than', 'like'], 2],
        ["What's your new boss ___?", ['like', 'look', 'looks'], 0],
        ["My sister isn't ___ tall as me.", ['so much', 'as', 'than'], 1],
        ['This is ___ film I know.', ['worse', 'the baddest', 'the worst'], 2],
      ]),
      complete('Complete the sentences', 'Use the adjective in brackets. - استعمل الصفة التي بين القوسين.', [
        ['My grandmother is ___ (old) person in the family.', 'the oldest'],
        ['Karim is ___ (funny) than his brother.', 'funnier'],
        ['This exercise is ___ (easy) than the last one.', 'easier'],
        ['My new colleague is ___ (patient) than my old one.', 'more patient'],
        ["She's ___ (good) cook in our street.", 'the best'],
        ['Our new flat is ___ (big) than the old one.', 'bigger'],
        ['Today I feel ___ (bad) than yesterday.', 'worse'],
        ['He is ___ (talkative) student in the class.', 'the most talkative'],
      ]),
    ], [
      complete('Compare them', 'Write one sentence with the word in brackets. - اكتب جملة واحدة بالكلمة التي بين القوسين.', [
        ['Rim is 24. Lamia is 27. (old)', 'Lamia is older than Rim.'],
        ['Adil is 1m 85. Karim is 1m 70. (tall)', 'Adil is taller than Karim.'],
        ['Hamid is very patient. Mehdi is not very patient. (patient)', 'Hamid is more patient than Mehdi.'],
        ['Rim is 24, Lamia is 27, and Ali is 19. (young)', 'Ali is the youngest.'],
        ['Sara is 1m 60. Nadia is 1m 60 too. (as … as)', 'Sara is as tall as Nadia.'],
        ['My old phone was bad. My new phone is very good. (good)', 'My new phone is better than my old phone.'],
      ], 1, true),
      correct([
        ['She is more taller than me.', 'She is taller than me.'],
        ['He is the most good teacher.', 'He is the best teacher.'],
        ['My brother is older from me.', 'My brother is older than me.'],
        ['She looks her mother.', 'She looks like her mother.'],
        ['How is your new boss like?', 'What is your new boss like?'],
        ['This is the more expensive shop in town.', 'This is the most expensive shop in town.'],
      ]),
    ]],
    aboutYou: [
      'Who is the tallest person in your family?',
      'What does your best friend look like?',
      'What is your best friend like?',
      'Who do you look like in your family?',
    ],
    writing: [
      join([
        ["She's very friendly. She's easy to talk to. (and)", "She's very friendly and she's easy to talk to."],
        ["He looks serious. He's really funny. (but)", "He looks serious, but he's really funny."],
        ['I like my new colleague. He always helps me. (because)', 'I like my new colleague because he always helps me.'],
        ["She's very shy. She doesn't talk much in class. (so)", "She's very shy, so she doesn't talk much in class."],
        ["He's younger than me. He's taller. (but)", "He's younger than me, but he's taller."],
      ]),
      complete('Looks or personality?', 'Write L (what he or she looks like) or P (personality). - هل الجملة عن المظهر أم عن الشخصية؟', [
        ["She's tall and slim.", 'L'], ["He's very patient.", 'P'],
        ['She has long curly hair.', 'L'], ["He's in his forties.", 'L'],
        ["She's a bit shy.", 'P'], ['He wears glasses.', 'L'],
        ["He's honest and kind.", 'P'], ["She's the funniest person I know.", 'P'],
      ].map(([q, a]) => [`${q} ___`, a] as [string, string]), 2),
    ],
    plan: [
      'Who is the person, and how did you meet?',
      'What does he or she look like?',
      'What is he or she like?',
      'How is this person different from other people you know?',
    ],
  },

  /* ── 4 · Home and neighbourhood: quantifiers & there is / are ─── */
  {
    n: 4, orderFrom: 21,
    grammar: [[
      remember([
        'There is + one thing, or an uncountable noun: There is a park. There is some noise. - للمفرد ولغير المعدود.',
        'There are + plural: There are two bedrooms. - للجمع.',
        'many, a few + countable · much, a little + uncountable · a lot of + both. - كلمات الكمية.',
      ]),
      complete('Countable or uncountable?', 'Write C (countable) or U (uncountable). - هل الاسم معدود أم غير معدود؟', [
        ['chair ___', 'C'], ['furniture ___', 'U'], ['money ___', 'U'], ['room ___', 'C'], ['information ___', 'U'],
        ['window ___', 'C'], ['traffic ___', 'U'], ['shop ___', 'C'], ['water ___', 'U'], ['advice ___', 'U'],
      ], 2),
      choose('Choose the right answer', [
        ['___ a big supermarket near my flat.', ['There are', "There's", 'It has'], 1],
        ['___ any shops in your street?', ['Are there', 'Is there', 'There are'], 0],
        ["There isn't ___ furniture in the kitchen.", ['many', 'a few', 'much'], 2],
        ['How ___ bedrooms are there?', ['much', 'many', 'lot'], 1],
        ['There are ___ cafés, but not many.', ['a few', 'a little', 'much'], 0],
        ["I'd like ___ water, please.", ['any', 'many', 'some'], 2],
        ['Is there ___ parking near the building?', ['many', 'any', 'a few'], 1],
        ['There are ___ families with children in our building.', ['much', 'a little', 'a lot of'], 2],
      ]),
      complete('is, are, isn\'t or aren\'t?', 'Complete with the right form. - أكمل بالصيغة المناسبة.', [
        ['There ___ two bathrooms in the flat.', 'are'],
        ['There ___ a balcony in the big bedroom.', 'is'],
        ["___ there a lift in the building? No, there isn't.", 'Is'],
        ['There ___ any hot water today. The heater is broken.', "isn't"],
        ['___ there many cafés in your neighbourhood?', 'Are'],
        ["There ___ any trees in my street. It's all cars!", "aren't"],
        ['There ___ a lot of noise at night.', 'is'],
        ['There ___ some nice people in our building.', 'are'],
      ]),
    ], [
      complete('Visiting a flat: ask the question', 'Write the question with the word in brackets. - اكتب السؤال بالكلمة التي بين القوسين.', [
        ['rooms? (how many)', 'How many rooms are there?'],
        ['furniture? (any)', 'Is there any furniture?'],
        ['the rent? (how much)', 'How much is the rent?'],
        ['shops near here? (any)', 'Are there any shops near here?'],
        ['noise at night? (much)', 'Is there much noise at night?'],
        ['places to park? (many)', 'Are there many places to park?'],
      ], 1, true),
      correct([
        ['There is many cars in my street.', 'There are many cars in my street.'],
        ['How much rooms are there?', 'How many rooms are there?'],
        ['We need some informations.', 'We need some information.'],
        ['There are a little cafés near my home.', 'There are a few cafés near my home.'],
        ["There isn't many traffic today.", "There isn't much traffic today."],
        ['In my street have a big mosque.', 'In my street, there is a big mosque.'],
      ]),
    ]],
    aboutYou: [
      'How many rooms are there in your home?',
      'What is there near your home?',
      'Is there much noise in your street?',
      'What is the best thing about your neighbourhood?',
    ],
    writing: [
      join([
        ["The flat is small. It's very bright. (but)", "The flat is small, but it's very bright."],
        ['There are a lot of shops. There is a big park. (and)', 'There are a lot of shops and there is a big park.'],
        ["There aren't many buses. I usually take a taxi. (so)", "There aren't many buses, so I usually take a taxi."],
        ['I love my neighbourhood. The people are friendly. (because)', 'I love my neighbourhood because the people are friendly.'],
        ["There's a lot of traffic. It's noisy in the morning. (so)", "There's a lot of traffic, so it's noisy in the morning."],
      ]),
      fromBank('Complete the advert', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
        ['FLAT TO RENT: two ___ and a big living room.', 'bedrooms'],
        ['The living room is very ___: it has two big windows.', 'bright'],
        ["It's ___ the station and the market.", 'near'],
        ["There's some ___ behind the building.", 'parking'],
        ['The ___ is 2,800 DH a month.', 'rent'],
        ['___ Mr Alami on 06 61 22 33 44.', 'Call'],
      ]),
    ],
    plan: [
      'Where is your neighbourhood? What is it like?',
      'What is there: shops, cafés, a park, transport?',
      'What is good about it, and what is the problem?',
      'What advice will you give your friend?',
    ],
  },
]

/** Module 1 test: two pages, 40 points (the score table on the second page adds them up). */
export const TEST_1: [Block[], Block[]] = [[
  { t: 'banner', title: 'Module 1 test - اختبار المحور الأول', icons: ['🏁', '⭐'], tone: 'practice' },
  { t: 'callout', text: 'أجب دون أن تنظر إلى الكتاب، في 40 دقيقة تقريبًا. بعد ذلك صحّح أجوبتك في آخر الدفتر، واكتب نتيجتك في الجدول.' },
  fromBank('Vocabulary', 'Complete with the words in the box. - أكمل بالكلمات التي في الإطار.', [
    ['My ___ are great. We have lunch together every day.', 'colleagues'],
    ['I ___ in a small village near Taza.', 'grew up'],
    ['___, everyone has a smartphone.', 'Nowadays'],
    ['She has long ___ hair.', 'curly'],
    ["He never gets angry. He's very ___.", 'patient'],
    ['The ___ is 3,000 dirhams a month.', 'rent'],
    ["There's a sofa and a bed, but there isn't much ___.", 'furniture'],
    ['My ___ is lively: there are lots of cafés.', 'neighbourhood'],
  ]),
  choose('Grammar', [
    ['What ___ these days?', ['do you do', 'are you doing', 'you doing'], 1],
    ['She ___ in a bank. She loves her job.', ['works', 'is work', 'working'], 0],
    ['When I was young, I ___ in Fes.', ['use to live', 'was live', 'used to live'], 2],
    ['We ___ to Agadir last summer.', ['used to go', 'went', 'go'], 1],
    ['My father is ___ than my mother.', ['older', 'more old', 'the oldest'], 0],
    ["It's ___ restaurant in town.", ['the better', 'the most good', 'the best'], 2],
    ['How ___ money do you need?', ['many', 'much', 'a few'], 1],
    ['___ any shops near here?', ['Is there', 'There are', 'Are there'], 2],
  ]),
], [
  { t: 'bar', title: 'Module 1 test (continued) - اختبار المحور الأول', icon: '🏁', tone: 'practice' },
  correct([
    ['He is work in a hotel.', 'He works in a hotel.'],
    ["I didn't used to like coffee.", "I didn't use to like coffee."],
    ['She is more younger than me.', 'She is younger than me.'],
    ['There is a lot of shops in my street.', 'There are a lot of shops in my street.'],
    ['Where you grew up?', 'Where did you grow up?'],
    ['In my town have a big market.', 'In my town, there is a big market.'],
  ]),
  match('Expressions: question and answer', 'Write the letter of the answer. - اكتب حرف الجواب المناسب.', [
    ['What do you do?', "I'm a nurse."],
    ['Where did you grow up?', 'In a village near Taza.'],
    ["What's your sister like?", "She's kind and funny."],
    ['What does he look like?', "He's tall, with short dark hair."],
    ['How much is the rent?', '3,000 dirhams a month.'],
    ['Is there any parking?', 'Yes, behind the building.'],
  ], 2),
  { t: 'bar', title: 'Writing - الكتابة', icon: '✍️', tone: 'writing' },
  { t: 'bullets', size: 13.5, items: ['Write six sentences about you: your job or studies now, your life as a child, a person in your family, and your home. - اكتب ست جمل عنك: عملك أو دراستك الآن، وطفولتك، وشخص من عائلتك، وبيتك.'] },
  { t: 'lines', n: 5, grow: true },
  { t: 'grid', rows: [
    { dark: true, span: [1, 1, 1, 1, 1, 1], cells: ['Vocabulary', 'Grammar', 'Mistakes', 'Expressions', 'Writing', 'Total'] },
    { span: [1, 1, 1, 1, 1, 1], size: 14, cells: ['___ / 8', '___ / 8', '___ / 6', '___ / 6', '___ / 12', '___ / 40'] },
  ] },
]]
