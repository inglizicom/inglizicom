import type { Block } from '../level1-book.ts'
import { box, choose, complete, correct, grammarBar, inTalk, pair, practiceBar, table } from './helpers.ts'

/**
 * Module 4's grammar lessons (work, services and problems), four pages
 * each: the uses with examples, the form, the rule found in the unit's
 * conversation, the mistakes Arabic speakers make, then practice.
 */

export const GRAMMAR_4: Record<number, Block[][]> = {
  /* ── 13 · must, have to, should ──────────────────────────────────── */
  13: [
    [
      grammarBar('must and have to - يجب', '📋'),
      { t: 'callout', text: 'نستعمل must و have to للقواعد والأشياء الضرورية. غالبًا نستعمل must للقواعد المكتوبة ولما يراه المتكلّم ضروريًّا، و have to لما تفرضه الظروف أو الآخرون.' },
      pair(
        box('Rules - قواعد', ['You must wear your badge.', 'Passengers must show their tickets.', 'You must be 18 to drive.']),
        box('Things we need to do - أشياء ضرورية', ['I have to start at eight.', 'She has to work one Saturday a month.', 'We have to pay the rent on the first.']),
      ),
      table('Form - التركيب', ['', 'must', 'have to'], [
        ['+', 'You must go.', 'You have to go. · She has to go.'],
        ['−', "You mustn't go. (not allowed)", "You don't have to go. (not necessary)"],
        ['?', 'Must I go? (rare)', 'Do I have to go? · Does she have to go?'],
        ['Past', 'had to', 'I had to work late yesterday.'],
      ], [0.8, 1.4, 1.8]),
      { t: 'bullets', size: 13, items: [
        'must + base verb, the same for everyone: she must go (not she musts go). - بعد must يأتي الفعل في صيغته الأصلية لكل الضمائر.',
        'The past of must and have to is had to: I had to wait an hour. - في الماضي نستعمل had to للاثنين.',
      ] },
      ...box('Signs and notices - لافتات وإعلانات', ['Visitors must sign in at reception.', 'All staff must wash their hands.', 'Children must be with an adult.']),
    ],
    [
      grammarBar("mustn't or don't have to? - ممنوع أم غير ضروري؟", '⚠️'),
      { t: 'callout', text: 'انتبه: معنى الصيغتين مختلف تمامًا، مع أن الكلمتين متشابهتان. الأولى للممنوع، والثانية لما لست مضطرًّا إليه.' },
      table(undefined, ["mustn't: it is not allowed", "don't have to: it is not necessary"], [
        ["You mustn't use your phone on the floor.", "You don't have to wear a suit."],
        ["You mustn't smoke here.", "You don't have to come early."],
        ["You mustn't park in front of the door.", "You don't have to pay. It's free."],
      ], [1, 1]),
      pair(
        box("mustn't = forbidden - ممنوع", ['No phones on the floor.', 'No smoking.', 'Food is not allowed at your desk.']),
        box("don't have to = you can choose - أنت حرّ", ['A suit? Not necessary.', 'Sundays? You can stay at home.', 'Night shifts? Only if you want.']),
      ),
      inTalk([
        'You have to start at eight sharp. → a rule - قاعدة',
        "You mustn't use your phone on the floor. → not allowed - ممنوع",
        "You don't have to wear a suit. → not necessary - غير ضروري",
        'You should take short breaks. → advice - نصيحة',
      ]),
    ],
    [
      grammarBar('should - النصيحة', '💡'),
      { t: 'callout', text: 'نستعمل should لتقديم نصيحة أو لقول ما هو الصواب، وهي أخفّ من صيغة الإلزام.' },
      pair(
        box('Advice - نصائح', ['You should take short breaks.', "You shouldn't argue with customers.", 'Should I write everything down?']),
        box('must or should? - إلزام أم نصيحة؟', ['You must wear your badge. (a rule)', 'You should smile on the phone. (good advice)', "You mustn't be late. · You shouldn't be late."]),
      ),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['You must to wear a badge.', 'You must wear a badge.', 'بعد must لا نضع to أبدًا.'],
        ['She have to work on Saturday.', 'She has to work on Saturday.', 'مع he و she نقول has to في المضارع.'],
        ["You mustn't wear a suit. (= it's not necessary)", "You don't have to wear a suit.", 'لما ليس ضروريًّا نستعمل الصيغة الثانية، وليس الممنوع.'],
        ['Do I must work on Sunday?', 'Do I have to work on Sunday?', 'لا نستعمل do مع must في السؤال.'],
        ['I must work late yesterday.', 'I had to work late yesterday.', 'في الماضي نستعمل had to دائمًا.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ["You ___ smoke in the hospital. It's forbidden.", ["mustn't", "don't have to", 'should'], 0],
        ["It's Saturday tomorrow. I ___ get up early.", ["mustn't", "don't have to", 'must'], 1],
        ['She ___ wear a uniform at work.', ['have to', 'has to', 'must to'], 1],
        ['You look tired. You ___ go to bed early.', ['should', "mustn't", 'have'], 0],
        ['___ we have to pay for the parking?', ['Must', 'Do', 'Are'], 1],
        ['Yesterday I ___ wait two hours at the bank.', ['must', 'had to', 'have to'], 1],
      ]),
      complete('Complete with the right form', 'Use the words in brackets. - استعمل الكلمات بين القوسين.', [
        ['You ___ (have to / show) your ID at the entrance.', 'have to show'],
        ["He ___ (not / have to / come) today. It's his day off.", "doesn't have to come"],
        ['You ___ (must / not / touch) the paintings.', "mustn't touch"],
        ['___ I ___ (have to / bring) my passport?', 'Do / have to bring'],
        ['We ___ (have to / leave) early yesterday.', 'had to leave'],
        ['You ___ (should / not / drink) coffee at night.', "shouldn't drink"],
      ], 2),
      correct([
        ['You must to be on time.', 'You must be on time.'],
        ['He have to work tonight.', 'He has to work tonight.'],
        ['Do I must wear a tie?', 'Do I have to wear a tie?'],
        ['I must go to the doctor yesterday.', 'I had to go to the doctor yesterday.'],
        ["You don't must smoke here.", "You mustn't smoke here."],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write two rules at your work or school.',
        "Write one thing you don't have to do at the weekend.",
        'Write one piece of advice for a new student.',
      ] },
    ],
  ],

  /* ── 14 · polite requests & indirect questions ───────────────────── */
  14: [
    [
      grammarBar('Polite requests - الطلبات المهذّبة', '🙏'),
      { t: 'callout', text: 'كلما كان الطلب أطول كان أكثر تهذيبًا. مع الغرباء وفي الأماكن الرسمية نستعمل could و would بدل can في الطلب.' },
      table(undefined, ['Less polite', 'More polite'], [
        ['Can you help me?', 'Could you help me, please?'],
        ['Call a taxi.', 'Would you mind calling a taxi?'],
        ['I want a sea view.', 'Could I have a room with a sea view?'],
        ['Book a table for us.', 'I was wondering if you could book a table for us.'],
      ], [1, 1.4]),
      pair(
        box('Asking for something - طلب شيء', ['Could I have the bill, please?', 'Could I see the menu?', 'Can I have some water?']),
        box('Asking someone to do something - طلب فعل شيء', ['Could you speak more slowly?', 'Would you mind closing the door?', 'Could you call me a taxi?']),
      ),
      { t: 'bullets', size: 13, items: [
        'Would you mind + verb-ing: Would you mind waiting? - بعد هذه العبارة نستعمل صيغة ing للفعل.',
      ] },
      pair(
        box('Saying yes - القبول', ['Of course. Here you are.', 'Certainly. One moment, please.', 'Not at all. (= no problem)']),
        box('On the phone - على الهاتف', ['Could I speak to Mr Alami, please?', 'Could you ask him to call me back?', 'Could you spell that, please?']),
      ),
      ...box('Offering help - عرض المساعدة', ['Can I help you?', 'Would you like a map of the town?', 'Shall I call a taxi for you?']),
    ],
    [
      grammarBar('Indirect questions - الأسئلة غير المباشرة', '❓'),
      { t: 'callout', text: 'السؤال غير المباشر أكثر تهذيبًا. يبدأ بعبارة مثل Could you tell me أو Do you know، ثم يأتي الفعل في آخر الجملة كما في الجملة العادية.' },
      table(undefined, ['Direct question', 'Indirect question'], [
        ['Where is the bank?', 'Do you know where the bank is?'],
        ['What time is breakfast?', 'Could you tell me what time breakfast is?'],
        ['When does the shop close?', 'Do you know when the shop closes?'],
        ['Is there free wifi?', 'Can you tell me if there is free wifi?'],
      ], [1, 1.4]),
      pair(
        box('No do, does or did - دون فعل مساعد', ['Where does she live? → Do you know where she lives?', 'What did he say? → Could you tell me what he said?', 'How much does it cost? → Do you know how much it costs?']),
        box('Yes / no questions: if or whether - إن', ['Is it open? → Do you know if it is open?', 'Can I park here? → Could you tell me if I can park here?', 'Is breakfast included? → I would like to know whether it is included.']),
      ),
      inTalk([
        'Could I have a room with a sea view? → a polite request - طلب مهذّب',
        'Would you mind calling a taxi for me? → mind + -ing - بعد mind صيغة ing للفعل',
        'Could you tell me what time breakfast is? → the verb at the end - الفعل في الآخر',
        'Can you tell me if there is free wifi? → a yes / no question with if - سؤال بنعم أو لا',
      ]),
    ],
    [
      grammarBar('Polite language at work - اللغة المهذّبة في العمل', '🛎️'),
      pair(
        box('Saying no politely - الرفض بلطف', ["I'm afraid the rooms are full.", "I'm sorry, but we don't accept cards.", 'Unfortunately, the pool is closed today.']),
        box('Formal or friendly? - رسمي أم ودّي؟', ['Hi! → Good evening. / Dear Sir or Madam,', "Thanks! → Thank you, that's very kind.", 'Bye! → Enjoy your stay. / Yours faithfully,']),
      ),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['Could you tell me where is the bank?', 'Could you tell me where the bank is?', 'في السؤال غير المباشر يأتي الفعل بعد الفاعل.'],
        ['Do you know what time does the shop close?', 'Do you know what time the shop closes?', 'لا نستعمل does في السؤال غير المباشر.'],
        ['Would you mind to call a taxi?', 'Would you mind calling a taxi?', 'بعد mind نستعمل صيغة ing للفعل.'],
        ['Can you tell me is there wifi?', 'Can you tell me if there is wifi?', 'نستعمل if في أسئلة نعم أو لا غير المباشرة.'],
        ['Give me the bill.', 'Could I have the bill, please?', 'الأمر المباشر قد يبدو غير مهذّب، فنفضّل صيغة السؤال.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['Could you tell me where the toilets ___?', ['are', 'are they', 'do'], 0],
        ['Do you know how much this ___?', ['costs', 'does cost', 'cost it'], 0],
        ['Would you mind ___ a moment?', ['wait', 'to wait', 'waiting'], 2],
        ['Can you tell me ___ the museum is open on Monday?', ['if', 'is', 'does'], 0],
        ['___ I have the bill, please?', ['Could', 'Would', 'Do'], 0],
        ['A: Would you mind closing the door? B: ___', ['Not at all.', 'Yes, I mind.', 'Of course not mind.'], 0],
      ]),
      complete('Make it polite', 'Write the indirect question. - اكتب السؤال غير المباشر.', [
        ['Where is the station? (Could you tell me…)', 'Could you tell me where the station is?'],
        ['What time does the bank open? (Do you know…)', 'Do you know what time the bank opens?'],
        ['Is there a pharmacy near here? (Can you tell me…)', 'Can you tell me if there is a pharmacy near here?'],
        ['How much does a taxi cost? (Do you know…)', 'Do you know how much a taxi costs?'],
      ], 1, true),
      correct([
        ['Could you tell me where is the hotel?', 'Could you tell me where the hotel is?'],
        ['Do you know what time does it start?', 'Do you know what time it starts?'],
        ['Would you mind to help me?', 'Would you mind helping me?'],
        ['Can you tell me is it open?', 'Can you tell me if it is open?'],
        ['Do you know where does he work?', 'Do you know where he works?'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write two polite requests for a hotel.',
        'Write two indirect questions about your town.',
        'Write a polite way to say no.',
      ] },
    ],
  ],

  /* ── 15 · the passive ────────────────────────────────────────────── */
  15: [
    [
      grammarBar('The passive - المبني للمجهول', '🔄'),
      { t: 'callout', text: 'نستعمل المبني للمجهول عندما يكون الشيء الذي وقع عليه الفعل أهم من الفاعل، أو عندما لا نعرف الفاعل.' },
      table(undefined, ['Active', 'Passive'], [
        ['They delivered the machine late.', 'The machine was delivered late.'],
        ['Someone damaged the door.', 'The door was damaged.'],
        ['Our technician installed it.', 'It was installed by our technician.'],
        ['They will send a new one.', 'A new one will be sent.'],
      ], [1, 1]),
      table('Form: be + past participle - التركيب', ['Tense', 'Example'], [
        ['Present', 'Tea is served with mint.'],
        ['Past', 'The machine was delivered on Thursday.'],
        ['Future', 'A new machine will be delivered tomorrow.'],
        ['Present perfect', 'Your complaint has been sent.'],
        ['After can / must', 'It can be repaired. It must be signed.'],
      ], [1, 2.4]),
      { t: 'bullets', size: 13, items: [
        'by + who did it, only if it is important: It was installed by our technician. - نذكر الفاعل بعد by فقط إذا كان مهمًّا.',
      ] },
      pair(
        box('Irregular participles - تصريفات شاذة', ['make → made · build → built', 'steal → stolen · break → broken', 'send → sent · write → written']),
        box('Where we see it - أين نراه', ['News: Two men were arrested.', 'Labels: Made in Morocco.', 'Notices: Cameras are used here.']),
      ),
    ],
    [
      grammarBar('The passive in everyday life - في الحياة اليومية', '🏺'),
      { t: 'callout', text: 'نجد المبني للمجهول كثيرًا في الأخبار والإعلانات والتعليمات، وعند الحديث عن تاريخ الأماكن والأشياء.' },
      pair(
        box('Morocco - المغرب', ['Couscous is eaten on Fridays.', 'The Hassan II Mosque was finished in 1993.', 'Argan oil is made in the south.']),
        box('Services and notices - الخدمات والإعلانات', ['Breakfast is served from seven.', 'Your order will be delivered on Monday.', 'Smoking is not allowed.']),
      ),
      table('Questions and negatives - السؤال والنفي', ['', 'Example'], [
        ['?', 'When was it delivered? · Was it installed?'],
        ['−', "It wasn't opened. · Refunds aren't given after three days."],
        ['Short answers', "Yes, it was. · No, it wasn't."],
      ], [1, 3]),
      inTalk([
        'It was delivered three days late. → the machine is important - الآلة هي المهمة',
        'Was it installed by our technician? → a question - سؤال',
        'A new machine will be delivered tomorrow. → the future - المستقبل',
        'Your complaint has been sent to our manager. → the present perfect - الحاضر التام',
      ]),
    ],
    [
      grammarBar('Active or passive? - المعلوم أم المجهول؟', '⚖️'),
      table(undefined, ['Active: who does it is important', 'Passive: what happens is important'], [
        ['My grandmother makes the best couscous.', 'Couscous is made with semolina.'],
        ['Karim repaired my car.', 'My car was repaired yesterday.'],
        ['The police caught the thief.', 'The thief was caught at the station.'],
      ], [1, 1]),
      { t: 'bullets', size: 13, items: [
        'Complaints often use the passive: it sounds polite, not personal. The door was damaged (not You damaged the door). - في الشكاوى يبدو المبني للمجهول مهذّبًا وغير شخصي.',
      ] },
      ...box('Polite complaints - شكاوى مهذّبة', ['My order was sent to the wrong address.', 'The room was not cleaned today.', 'I was charged twice for one meal.']),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['The machine delivered late.', 'The machine was delivered late.', 'لا ننسى فعل be في المبني للمجهول.'],
        ['It was deliver yesterday.', 'It was delivered yesterday.', 'بعد be نستعمل التصريف الثالث.'],
        ['The house was build in 1920.', 'The house was built in 1920.', 'التصريف الثالث للفعل build شاذ.'],
        ['A new one will sent tomorrow.', 'A new one will be sent tomorrow.', 'في المستقبل نقول will be ثم التصريف الثالث.'],
        ['It was installed from our technician.', 'It was installed by our technician.', 'نستعمل by لذكر الفاعل.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['This mosque ___ built in the 12th century.', ['is', 'was', 'were'], 1],
        ['Mint tea ___ in small glasses.', ['is served', 'serves', 'is serve'], 0],
        ['Your order ___ delivered tomorrow.', ['will', 'will be', 'is be'], 1],
        ['The letters ___ sent yesterday.', ['was', 'were', 'are'], 1],
        ['Has the problem ___ fixed?', ['be', 'been', 'being'], 1],
        ['The car was repaired ___ my uncle.', ['by', 'from', 'with'], 0],
      ]),
      complete('Complete with the passive', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['The museum ___ (open) in 2010.', 'was opened'],
        ['English ___ (speak) in many countries.', 'is spoken'],
        ['A new machine ___ (deliver) tomorrow.', 'will be delivered'],
        ['The windows ___ (clean) every Monday.', 'are cleaned'],
        ['My phone ___ (steal) last night!', 'was stolen'],
        ['Your complaint ___ (send) to the manager.', 'has been sent'],
      ], 2),
      correct([
        ['The door damaged.', 'The door was damaged.'],
        ['It was make in China.', 'It was made in China.'],
        ['The letter will sent tomorrow.', 'The letter will be sent tomorrow.'],
        ['This tagine was cooked from my mother.', 'This tagine was cooked by my mother.'],
        ['The shop is close on Sundays.', 'The shop is closed on Sundays.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write two facts about your town in the passive.',
        'Write about something that was broken or lost.',
        'Write a sentence with will be + past participle.',
      ] },
    ],
  ],

  /* ── 16 · gerunds & infinitives ──────────────────────────────────── */
  16: [
    [
      grammarBar('Verb + -ing - أفعال تليها صيغة المصدر', '🔤'),
      { t: 'callout', text: 'بعض الأفعال يأتي بعدها فعل آخر بصيغة ing، فنحفظها في مجموعات صغيرة مع أمثلتها.' },
      pair(
        box('Likes and dislikes - الحب والكره', ['I enjoy working with people.', 'I love meeting guests.', "I don't like getting up early."]),
        box('Other verbs - أفعال أخرى', ["I don't mind working at weekends.", 'I avoid arguing with customers.', 'She finished writing her report.']),
      ),
      table('After these verbs: -ing - بعد هذه الأفعال', ['Verb', 'Example'], [
        ['enjoy', 'I enjoy cooking.'],
        ["don't mind", "I don't mind waiting."],
        ['avoid', 'He avoids driving at night.'],
        ['finish', 'Have you finished eating?'],
        ['spend time', 'I spend hours reading.'],
        ['keep', 'She keeps calling me.'],
      ], [1, 2.4]),
      { t: 'bullets', size: 13, items: [
        'love, like and hate + -ing (or to): I love cooking. I love to cook. - مع هذه الأفعال تصلح الصيغتان غالبًا.',
      ] },
      pair(
        box('Questions - السؤال', ['What do you enjoy doing?', 'Do you mind waiting?', 'Have you finished eating?']),
        box('Negatives - النفي', ["I don't enjoy cooking.", "She doesn't mind driving.", "We haven't finished packing."]),
      ),
      ...box('In an interview - في المقابلة', ['I enjoy working in a team.', "I don't mind travelling for work.", "I've finished studying, so I can start at once."]),
    ],
    [
      grammarBar('Verb + to - أفعال تليها to والفعل', '🎯'),
      { t: 'callout', text: 'أفعال أخرى يأتي بعدها to ثم الفعل، وغالبًا تتحدّث عن الرغبات والخطط والقرارات.' },
      table('After these verbs: to + verb - بعد هذه الأفعال', ['Verb', 'Example'], [
        ['want', 'I want to improve my English.'],
        ['would like', 'I would like to learn more.'],
        ['plan', "I'm planning to take Spanish classes."],
        ['decide', 'She decided to apply.'],
        ['need', "I need to give one month's notice."],
        ['try', 'I try to stay calm.'],
        ['manage', 'I managed to find rooms for everyone.'],
        ['hope', 'I hope to start in June.'],
      ], [1, 2.4]),
      inTalk([
        'I enjoy working with people. → enjoy + -ing - صيغة ing للفعل',
        'I want to improve my English. → want + to - نضع to قبل الفعل',
        "I'm good at solving problems. → after a preposition: -ing - بعد حرف الجر",
        'I look forward to hearing from you. → here to is a preposition - هنا to حرف جر',
      ]),
    ],
    [
      grammarBar('After prepositions: -ing - بعد حروف الجر', '📌'),
      { t: 'callout', text: 'بعد حروف الجر مثل at و in و of و about و for نستعمل الفعل مع ing دائمًا.' },
      pair(
        box('Adjective + preposition - صفة وحرف جر', ["I'm good at solving problems.", "She's interested in learning Spanish.", "I'm tired of waiting."]),
        box('Useful phrases - عبارات مفيدة', ['Thank you for inviting me.', 'I look forward to hearing from you.', "I'm not used to working at night."]),
      ),
      { t: 'mistakes', section: true, tone: 'grammar', items: [
        ['I enjoy to work with people.', 'I enjoy working with people.', 'بعد enjoy نستعمل صيغة ing للفعل.'],
        ['I want improve my English.', 'I want to improve my English.', 'بعد want نضع to قبل الفعل.'],
        ["I'm good at solve problems.", "I'm good at solving problems.", 'بعد حرف الجر نستعمل صيغة ing للفعل.'],
        ['I look forward to hear from you.', 'I look forward to hearing from you.', 'في هذه العبارة to حرف جر، فنستعمل بعدها صيغة ing للفعل.'],
        ["I don't mind to work late.", "I don't mind working late.", 'بعد mind نستعمل صيغة ing للفعل.'],
      ] },
    ],
    [
      practiceBar,
      choose('Choose the correct form', [
        ['I enjoy ___ new people.', ['meet', 'meeting', 'to meet'], 1],
        ['She decided ___ for the job.', ['apply', 'applying', 'to apply'], 2],
        ["I'm interested in ___ in a hotel.", ['work', 'working', 'to work'], 1],
        ['We need ___ early tomorrow.', ['leave', 'leaving', 'to leave'], 2],
        ['He avoids ___ fast food.', ['eat', 'eating', 'to eat'], 1],
        ['Thank you for ___ me.', ['help', 'helping', 'to help'], 1],
      ]),
      complete('Complete with the right form', 'Use the verb in brackets. - استعمل الفعل بين القوسين.', [
        ['I would like ___ (work) abroad.', 'to work'],
        ["I don't mind ___ (wait).", 'waiting'],
        ["She's good at ___ (speak) in public.", 'speaking'],
        ['They hope ___ (open) a shop.', 'to open'],
        ['Have you finished ___ (read) the report?', 'reading'],
        ['I managed ___ (find) a taxi.', 'to find'],
      ], 2),
      correct([
        ['I enjoy to travel.', 'I enjoy travelling.'],
        ['She wants learn French.', 'She wants to learn French.'],
        ["I'm interested in work here.", "I'm interested in working here."],
        ['I look forward to see you.', 'I look forward to seeing you.'],
        ['He decided buying a car.', 'He decided to buy a car.'],
      ]),
      { t: 'bar', title: 'Now you - دورك', icon: '✍️', tone: 'practice' },
      { t: 'answers', items: [
        'Write three things you enjoy doing.',
        'Write two things you would like to do next year.',
        'Write one thing you are good at.',
      ] },
    ],
  ],
}
