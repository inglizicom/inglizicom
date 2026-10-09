import type { L2Unit } from './types.ts'
import { GRAMMAR_1 } from './grammar-1.ts'

/**
 * Unit 1 — Meeting someone new, built as a ladder: the situation (the break
 * on the first day of an English course) and the task (a three-minute first
 * conversation, then a message after it) come first; the words are only
 * those the task needs; the expressions follow the five steps of the
 * conversation; the model conversation takes the same steps in the same
 * order; the grammar is what those sentences need (who I am: present
 * simple; what I'm doing these days: present continuous); speaking goes from
 * the model to role cards to a real conversation; writing is the message
 * the student sends afterwards.
 */

export const UNIT_1: L2Unit = {
  n: 1, module: 1, titleEn: 'Meeting someone new', titleAr: 'التعرّف على شخص جديد', icons: ['🤝', '💬'],
  goal: 'تعلّم كيف تبدأ محادثة مع شخص لا تعرفه، تتحدّث عن نفسك وعن حياتك، وتنهي المحادثة بطريقة لطيفة.',
  grammarName: 'Present simple & continuous',
  canDo: [
    ['start a conversation with someone new.', 'أبدأ محادثة مع شخص لا أعرفه.'],
    ['talk about my job and what I am doing these days.', 'أتحدّث عن عملي وعمّا أفعله هذه الأيام.'],
    ['keep the conversation going and end it politely.', 'أُبقي المحادثة مستمرة وأنهيها بلطف.'],
  ],
  ladder: {
    situation: "It's your first day at an English course. At the break, you sit next to someone you don't know. - إنه يومك الأول في دورة للإنجليزية. في الاستراحة تجلس بجانب شخص لا تعرفه.",
    task: 'Have a three-minute conversation with a new person, then send them a short message. - أجرِ محادثة من ثلاث دقائق مع شخص جديد، ثم أرسل له رسالة قصيرة.',
    steps: [
      { title: 'Start', titleAr: 'ابدأ المحادثة', icon: '👋', phrases: [
        ['Hi! Is this seat free?', 'مرحبًا! هل هذا المقعد شاغر؟'],
        ['Are you new here?', 'هل أنت جديد هنا؟'],
        ["I'm Yassine, by the way.", 'بالمناسبة، أنا ياسين.'],
        ['Nice to meet you.', 'تشرّفت بمعرفتك.'],
      ] },
      { title: 'Ask and answer', titleAr: 'اسأل وأجب', icon: '❓', phrases: [
        ['Where are you from?', 'من أين أنت؟'],
        ["I'm from Meknes, but I live in Rabat now.", 'أنا من مكناس، لكنني أسكن في الرباط الآن.'],
        ['What do you do?', 'ما عملك؟'],
        ["I'm an accountant. I work for a small company.", 'أنا محاسب. أعمل لدى شركة صغيرة.'],
        ['Where do you work?', 'أين تعمل؟'],
        ['I work at the hospital in Agdal.', 'أعمل في المستشفى في أكدال.'],
      ] },
      { title: 'React and add details', titleAr: 'تفاعل وأضف تفاصيل', icon: '😊', phrases: [
        ['Really? Do you like it?', 'حقًا؟ هل يعجبك؟'],
        ['That sounds busy!', 'يبدو ذلك متعبًا!'],
        ["It's OK, but my colleagues are great.", 'لا بأس به، لكن زملائي رائعون.'],
        ["This month I'm working nights.", 'هذا الشهر أعمل ليلًا.'],
        ['I know the feeling.', 'أفهم هذا الشعور.'],
      ] },
      { title: 'Keep it going', titleAr: 'استمرّ في الحديث', icon: '🔁', phrases: [
        ['What about you?', 'وأنت؟'],
        ['Why are you taking this course?', 'لماذا تتابع هذه الدورة؟'],
        ['I need English for my job.', 'أحتاج الإنجليزية لعملي.'],
        ["I'm looking for a new job.", 'أبحث عن عمل جديد.'],
        ['How often do you study at home?', 'كم مرة تدرس في البيت؟'],
      ] },
      { title: 'Close and keep in touch', titleAr: 'أنهِ المحادثة وابقَ على تواصل', icon: '📱', phrases: [
        ['It was nice talking to you.', 'سعدت بالحديث معك.'],
        ["Let's keep in touch. Here's my number.", 'لنبقَ على تواصل. هذا رقمي.'],
        ['See you next week!', 'أراك الأسبوع القادم!'],
      ] },
    ],
    talkSteps: { 0: 1, 4: 2, 9: 3, 14: 4, 21: 5 },
    order: [
      'Hi! Is this seat free?',
      'Yes, of course. Are you new here?',
      "Yes. I'm Karim, by the way.",
      "Nice to meet you, Karim. I'm Sara. What do you do?",
      "I'm a teacher. I work at a primary school. What about you?",
      "I'm a pharmacist. It was nice talking to you!",
    ],
    speaking: {
      cards: [
        ['You are Salma, 31.', 'From: Agadir · Lives in: Rabat', 'Job: pharmacist, in a pharmacy near the market', 'These days: learning English to travel', 'Free time: cooks, goes for walks by the sea'],
        ['You are Karim, 26.', 'From: Oujda · Lives in: Rabat', 'Job: salesperson in a phone shop', 'These days: looking for a better job', 'Free time: plays football, watches series'],
      ],
      free: 'Now be yourself. Talk to a classmate you don\'t know well for three minutes. Use one expression from every step. - الآن كن نفسك: تحدّث ثلاث دقائق مع زميل لا تعرفه جيدًا، واستعمل عبارة من كل مرحلة.',
      check: [
        'I started the conversation and introduced myself. - بدأت المحادثة وقدّمت نفسي.',
        'I asked two questions and answered with a detail. - طرحت سؤالين وأجبت مع تفصيل.',
        'I reacted: Really? That sounds busy! - تفاعلت مع كلام الآخر.',
        'I ended politely and asked to keep in touch. - أنهيت المحادثة بلطف وطلبت البقاء على تواصل.',
      ],
    },
    quiz: [
      ['___ I sit here? Is this seat free?', ['Can', 'Do', 'Am'], 0],
      ['A: What do you do? B: ___', ["I'm a nurse.", "I'm doing my homework.", 'I do fine.'], 0],
      ['This month I ___ nights, so I\'m tired.', ['work', 'am working', 'works'], 1],
      ['A: I work ten hours a day. B: ___', ['That sounds busy!', 'Nice to meet you.', 'See you next week!'], 0],
      ['___ do you study at home?', ['How often', 'How much', 'What time often'], 0],
      ['To end the conversation, you say: ___', ['It was nice talking to you.', 'Are you new here?', 'What about you?'], 0],
    ],
  },
  // The first layout's parts, not used by a ladder unit.
  expressions: [], notice: [], tip: [], yourTurn: [],
  talk: [
    'YASSINE: Hi! Is this seat free?',
    'IMANE: Yes, of course. Are you new here?',
    "YASSINE: Yes, it's my first day. I'm Yassine, by the way.",
    "IMANE: Nice to meet you, Yassine. I'm Imane.",
    'YASSINE: Nice to meet you too. Where are you from?',
    "IMANE: I'm from Fes, but I live in Rabat now. What about you?",
    'YASSINE: I live in Rabat too. I come from Meknes.',
    'IMANE: So, what do you do?',
    "YASSINE: I'm an accountant. I work for a small company in the city centre.",
    'IMANE: Really? Do you like it?',
    "YASSINE: It's OK. The work is a bit boring, but my colleagues are great. What about you?",
    "IMANE: I'm a nurse. I work at the hospital in Agdal.",
    'YASSINE: That sounds busy! Do you work at night?',
    "IMANE: Sometimes. This month I'm working nights, so I'm a bit tired today.",
    'YASSINE: I know the feeling. So why are you taking this course?',
    'IMANE: I need English for my job. A lot of our patients speak English.',
    "YASSINE: That makes sense. I'm taking it because I'm looking for a new job.",
    'IMANE: Good luck! What kind of job?',
    'YASSINE: Something with an international company. They always ask for English.',
    'IMANE: Same here. How often do you study at home?',
    "YASSINE: I try to study every evening, but these days I'm working late.",
    'IMANE: Oh, the teacher is coming. It was nice talking to you, Yassine.',
    "YASSINE: You too. Let's keep in touch. Here's my number.",
    'IMANE: Great. See you next week!',
  ],
  focus: [
    'I live in Rabat', 'I come from Meknes', 'what do you do', 'I work for a small company', 'Do you like it',
    'I work at the hospital', 'Do you work at night', "I'm working nights", 'are you taking this course', 'I need English',
    'speak English', "I'm taking it", "I'm looking for", 'They always ask', 'How often do you study', "I'm working late",
    'the teacher is coming',
  ],
  findIt: [
    'Find the five steps in the conversation. Where does each one start? - ابحث عن المراحل الخمس في المحادثة.',
    'Find three facts about Yassine and Imane (present simple). - ابحث عن ثلاث حقائق عنهما في المضارع البسيط.',
    'Find two things they are doing these days (present continuous). - ابحث عن شيئين يفعلانهما هذه الأيام.',
  ],
  vocab: {
    groups: [
      { title: 'Jobs - المهن', icon: '💼', words: [
        ['accountant', 'محاسب', "I'm an accountant. I work for a small company."],
        ['nurse', 'ممرّض / ممرّضة', "I'm a nurse. I work at the hospital in Agdal."],
        ['teacher', 'أستاذ', "I'm a teacher. I work at a primary school."],
        ['engineer', 'مهندس', "I'm an engineer. I build roads."],
        ['salesperson', 'بائع', "I'm a salesperson in a phone shop."],
        ['pharmacist', 'صيدلي', "I'm a pharmacist. I work near the market."],
        ['civil servant', 'موظف حكومي', "I'm a civil servant. I work for the city."],
        ['student', 'طالب', "I'm a student. I'm studying law."],
      ] },
      { title: 'Work - العمل', icon: '🏢', words: [
        ['work for a company', 'يعمل لدى شركة', 'I work for a small company in the city centre.'],
        ['work at a hospital', 'يعمل في مستشفى', 'Imane works at a hospital.'],
        ['colleague', 'زميل في العمل', 'My colleagues are great.'],
        ['work nights', 'يعمل ليلًا', "This month I'm working nights."],
        ['work late', 'يعمل حتى وقت متأخر', "These days I'm working late."],
        ['look for a job', 'يبحث عن عمل', "I'm looking for a new job."],
      ] },
      { title: 'Why I learn English - لماذا أتعلّم الإنجليزية', icon: '🎯', words: [
        ['for my job', 'من أجل عملي', 'I need English for my job.'],
        ['to travel', 'لكي أسافر', "I'm learning English to travel."],
        ['to get a better job', 'لكي أحصل على عمل أفضل', 'I want English to get a better job.'],
        ['to talk to customers', 'لكي أتحدّث مع الزبائن', 'I need English to talk to customers.'],
        ['to study abroad', 'لكي أدرس في الخارج', "My sister is learning English to study abroad."],
        ['for fun', 'من أجل المتعة', 'I watch series in English for fun.'],
      ] },
    ],
    partners: [],
    practice: [
      ["I'm a ___. I work at the hospital.", 'nurse'],
      ['I work ___ a small company.', 'for'],
      ['My ___ are great. We work together every day.', 'colleagues'],
      ["I don't have a job now. I'm looking ___ a job.", 'for'],
      ["I'm learning English ___ travel.", 'to'],
      ["This month I'm working ___, so I'm tired in the morning.", 'nights'],
    ],
  },
  grammar: GRAMMAR_1[1],
  writing: {
    name: 'A message after meeting someone', nameAr: 'رسالة بعد التعرّف على شخص',
    task: 'بعد الدرس، اكتب رسالة قصيرة (60 إلى 90 كلمة) إلى الشخص الذي تعرّفت عليه: ذكّره بمن أنت، وقل له شيئًا عن نفسك، واقترح أن تدرسا معًا.',
    include: [
      'Say hello and who you are. - سلّم عليه وذكّره بمن أنت.',
      'Say you were happy to meet them. - قل إنك سعدت بلقائه.',
      'One or two facts about you, and what you are doing these days. - حقيقة أو اثنتان عنك، وما تفعله هذه الأيام.',
      'A question or an idea: study together, meet again. - سؤال أو اقتراح: الدراسة معًا أو اللقاء مجددًا.',
    ],
    language: [
      'Hi Imane, it was nice to meet you today! - بداية الرسالة.',
      "I'm the accountant from Meknes. These days I'm… - لتذكيره بمن أنت.",
      'Do you want to…? / See you next week! - لاقتراح فكرة وإنهاء الرسالة.',
    ],
    short: { label: 'Short example - مثال قصير', body: "Hi Imane, it was nice to meet you today! I'm Yassine, the accountant from the break. Here's the podcast I talked about. See you next week!" },
    model: { label: 'A longer model - نموذج أطول', body: [
      'Hi Imane,',
      "It was really nice to meet you at the break today! I'm Yassine, the accountant from Meknes. I work for a small company in the city centre, and these days I'm looking for a job with an international company. That's why I'm taking the course.",
      "You said you study on the bus. I usually study in the evening, but it's hard when I'm working late. Do you want to practise together on Saturdays? We can meet at the café near the school.",
      'See you next week!\nYassine',
    ].join('\n') },
    focus: ['I work for a small company', "I'm looking for a job", "I'm taking the course", 'I usually study', "I'm working late"],
    template: [
      'Hi ___,',
      "It was really nice to meet you today! I'm ___, the ___ from ___.",
      "I work ___, and these days I'm ___.",
      "That's why I'm taking the course.",
      'I usually study ___. Do you want to ___?',
      'See you ___!',
      '___',
    ].join('\n'),
    check: [
      'I said who I am, so they remember me. - قلت من أنا حتى يتذكّرني.',
      'I used the present simple for facts and the present continuous for these days. - استعملت المضارع البسيط للحقائق والمستمر لهذه الأيام.',
      'I ended with a question or an idea. - أنهيت الرسالة بسؤال أو اقتراح.',
    ],
  },
}
