import type { GrammarLesson } from './types'

export const g24: GrammarLesson = {
  id: 24,
  slug: 'present-continuous',
  emoji: '🎬',
  title: { en: 'Present Continuous: I am eating', ar: 'المضارع المستمر: أنا آكل الآن' },
  description: { en: 'Talk about what is happening right now', ar: 'كيف تتكلم عما يحدث الآن' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🎬',
      title: 'Present Continuous: I am eating',
      titleAr: 'المضارع المستمر: أنا آكل الآن',
      level: 'A1',
      tagAr: 'درس ٢٤ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'الفرق بين "آكل دائماً" و"آكل الآن" 🍽️',
      bodyAr:
        'في الدروس السابقة تعلمنا المضارع البسيط الذي يعبر عن العادات والأشياء الدائمة: "I eat breakfast every day." الآن نتعلم المضارع المستمر الذي يعبر عما يحدث في هذه اللحظة: "I am eating breakfast NOW." القاعدة: am/is/are + فعل-ing. كلمات تدل على المضارع المستمر: now, right now, at the moment, currently.',
      arabicEx: 'أنا آكل الفطور كل يوم. (عادة) · أنا آكل الآن. (الآن)',
      englishEx: 'I eat breakfast every day. (habit) · I am eating right now. (NOW)',
      noteAr: '💡 am/is/are + verb-ing = يحدث الآن · المضارع البسيط = عادة دائمة',
    },
    {
      kind: 'patternTable',
      titleAr: 'المضارع المستمر مع جميع الضمائر',
      rows: [
        { pronoun: 'I am + verb-ing', pronounAr: 'أنا', verb: 'I am + working/eating...', exampleEn: 'I am studying English right now.', exampleAr: 'أنا أدرس الإنجليزية الآن.', emoji: '📚' },
        { pronoun: 'He/She/It is + verb-ing', pronounAr: 'هو/هي/هذا', verb: 'He is + working/eating...', exampleEn: 'She is cooking dinner.', exampleAr: 'هي تطبخ العشاء.', emoji: '🍳' },
        { pronoun: 'You/We/They are + verb-ing', pronounAr: 'أنت/نحن/هم', verb: 'They are + working...', exampleEn: 'They are watching TV.', exampleAr: 'هم يشاهدون التلفاز.', emoji: '📺' },
        { pronoun: 'Spelling: run → running', pronounAr: 'مضاعفة الحرف الأخير', verb: 'CVC → double + ing', exampleEn: 'He is running in the park.', exampleAr: 'هو يركض في الحديقة.', emoji: '🏃' },
        { pronoun: 'Spelling: write → writing', pronounAr: 'حذف e الصامتة', verb: 'drop -e + ing', exampleEn: 'She is writing a message.', exampleAr: 'هي تكتب رسالة.', emoji: '✍️' },
        { pronoun: 'Spelling: play → playing', pronounAr: 'الأفعال العادية', verb: 'verb + ing (no change)', exampleEn: 'The children are playing outside.', exampleAr: 'الأطفال يلعبون في الخارج.', emoji: '⚽' },
        { pronoun: 'Spelling: study → studying', pronounAr: 'y تبقى y', verb: 'study + ing (y stays)', exampleEn: 'He is studying for the exam.', exampleAr: 'هو يذاكر للامتحان.', emoji: '📖' },
        { pronoun: 'sit → sitting · swim → swimming', pronounAr: 'مضاعفة أمثلة أخرى', verb: 'sit/swim → sitting/swimming', exampleEn: 'She is sitting by the window.', exampleAr: 'هي جالسة بجانب الشباك.', emoji: '🪟' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل بالمضارع المستمر 💬',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'am studying', role: 'verb' },
            { text: 'English', role: 'complement' }, { text: 'right now', role: 'filler' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أنا أدرس الإنجليزية الآن.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'is cooking', role: 'verb' },
            { text: 'dinner', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي تطبخ العشاء.',
          emoji: '🍳',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'are watching', role: 'verb' },
            { text: 'a film', role: 'complement' }, { text: 'at the moment', role: 'filler' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هم يشاهدون فيلماً في هذه اللحظة.',
          emoji: '🎬',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is running', role: 'verb' },
            { text: 'in the park', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو يركض في الحديقة.',
          emoji: '🏃',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'are having', role: 'verb' },
            { text: 'lunch', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن نتناول الغداء.',
          emoji: '🍽️',
        },
        {
          tokens: [
            { text: 'The children', role: 'subject' }, { text: 'are playing', role: 'verb' },
            { text: 'outside', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الأطفال يلعبون في الخارج.',
          emoji: '⚽',
        },
        {
          tokens: [
            { text: 'My mother', role: 'subject' }, { text: 'is sleeping', role: 'verb' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أمي نائمة.',
          emoji: '😴',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'am writing', role: 'verb' },
            { text: 'an email', role: 'complement' }, { text: 'to my boss', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أنا أكتب بريداً إلكترونياً لمديري.',
          emoji: '📧',
        },
        {
          tokens: [
            { text: 'It', role: 'subject' }, { text: 'is raining', role: 'verb' },
            { text: 'outside', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'المطر ينزل الآن.',
          emoji: '🌧️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'is sitting', role: 'verb' },
            { text: 'by the window', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي جالسة بجانب الشباك.',
          emoji: '🪟',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is talking', role: 'verb' },
            { text: 'on the phone', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو يتحدث على الهاتف.',
          emoji: '📱',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'are waiting', role: 'verb' },
            { text: 'for the bus', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن ننتظر الحافلة.',
          emoji: '🚌',
        },
      ],
    },
    {
      kind: 'negation',
      titleAr: 'النفي في المضارع المستمر ❌',
      bodyAr: 'النفي: am/is/are + not + verb-ing · الاختصارات: I\'m not · He isn\'t · They aren\'t',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'am not', role: 'negation' },
            { text: 'working', role: 'verb' }, { text: 'today', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لا أعمل اليوم.',
          emoji: '🏖️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "isn't", role: 'negation' },
            { text: 'sleeping', role: 'verb' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي لا تنام.',
          emoji: '👁️',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "aren't", role: 'negation' },
            { text: 'listening', role: 'verb' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم لا يستمعون.',
          emoji: '👂',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: "isn't", role: 'negation' },
            { text: 'studying', role: 'verb' }, { text: 'right now', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هو لا يذاكر الآن.',
          emoji: '📵',
        },
      ],
    },
    {
      kind: 'questions',
      titleAr: 'الأسئلة في المضارع المستمر ❓',
      bodyAr: 'السؤال: am/is/are + Subject + verb-ing...? · What/Where/Who + is/are + Subject + verb-ing?',
      items: [
        {
          q: [
            { text: 'Are', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'working', role: 'verb' }, { text: 'now', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل تعمل الآن؟',
        },
        {
          q: [
            { text: 'Is', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'sleeping', role: 'verb' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل هي نائمة؟',
        },
        {
          q: [
            { text: 'What', role: 'filler' }, { text: 'are', role: 'question' },
            { text: 'you', role: 'subject' }, { text: 'doing', role: 'verb' },
            { text: '?', role: 'filler' },
          ],
          ar: 'ماذا تفعل؟',
        },
        {
          q: [
            { text: 'Where', role: 'filler' }, { text: 'is', role: 'question' },
            { text: 'he', role: 'subject' }, { text: 'going', role: 'verb' },
            { text: '?', role: 'filler' },
          ],
          ar: 'أين يذهب؟',
        },
        {
          q: [
            { text: 'Are', role: 'question' }, { text: 'they', role: 'subject' },
            { text: 'watching', role: 'verb' }, { text: 'TV', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل يشاهدون التلفاز؟',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: مكالمة هاتفية 📱',
      noteAr: 'انظر كيف نسأل عما يفعله الناس في الوقت الحالي',
      lines: [
        { speaker: 'A', text: 'Hi Youssef! What are you doing?', ar: 'مرحباً يوسف! ماذا تفعل؟' },
        { speaker: 'B', text: 'I am studying for my exam. Why? What is happening?', ar: 'أنا أذاكر للامتحان. لماذا؟ ماذا يحدث؟' },
        { speaker: 'A', text: 'Nothing. I am just bored. Is your sister at home?', ar: 'لا شيء. أنا فقط ملول. هل أختك في البيت؟' },
        { speaker: 'B', text: 'Yes, she is watching a film in her room.', ar: 'نعم، هي تشاهد فيلماً في غرفتها.' },
        { speaker: 'A', text: 'OK. I am coming to your house in one hour. Are you free then?', ar: 'حسناً. سأجيء إلى بيتكم بعد ساعة. هل ستكون حراً؟' },
        { speaker: 'B', text: 'Yes! I am finishing my study now. See you soon!', ar: 'نعم! أنا أنهي دراستي الآن. أراك قريباً!' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"I working" خطأ — لا بد من am/is/are قبل فعل-ing', wrong: 'I working now.', right: 'I am working now.' },
        { type: 'mistake', ar: '"She is work" خطأ — لا بد من -ing بعد is/are', wrong: 'She is work right now.', right: 'She is working right now.' },
        { type: 'tip', ar: 'أفعال الحالة لا تستخدم المضارع المستمر: like, love, know, want, need, understand, believe, hate, prefer — نقول "I know" وليس "I am knowing"' },
        { type: 'rule', ar: 'القاعدة: am/is/are + verb-ing · I am → I\'m · He is → He\'s · They are → They\'re' },
        { type: 'tip', ar: 'كلمات تدل على المضارع المستمر: now, right now, at the moment, currently, look!, listen!' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I ', after: ' English right now.', answer: 'am studying', choices: ['study', 'am studying', 'is studying'], ar: 'أنا أدرس الإنجليزية الآن.' },
        { before: 'She ', after: ' dinner.', answer: 'is cooking', choices: ['cooks', 'are cooking', 'is cooking'], ar: 'هي تطبخ العشاء.' },
        { before: 'They ', after: ' a film.', answer: 'are watching', choices: ['watches', 'is watching', 'are watching'], ar: 'هم يشاهدون فيلماً.' },
        { before: 'He ', after: ' in the park.', answer: 'is running', choices: ['run', 'is running', 'are running'], ar: 'هو يركض في الحديقة.' },
        { before: 'I ', after: ' today.', answer: 'am not working', choices: ['not work', 'am not working', 'is not working'], ar: 'لا أعمل اليوم.' },
        { before: '', after: ' you listening?', answer: 'Are', choices: ['Is', 'Am', 'Are'], ar: 'هل تستمع؟' },
        { before: 'What ', after: ' you doing?', answer: 'are', choices: ['is', 'am', 'are'], ar: 'ماذا تفعل؟' },
        { before: 'It ', after: ' outside.', answer: 'is raining', choices: ['rain', 'are raining', 'is raining'], ar: 'المطر ينزل الآن.' },
        { before: 'She ', after: ' right now. (not sleep)', answer: "isn't sleeping", choices: ["don't sleep", "isn't sleeping", "not sleeping"], ar: 'هي لا تنام الآن.' },
        { before: 'We ', after: ' for the bus.', answer: 'are waiting', choices: ['wait', 'is waiting', 'are waiting'], ar: 'نحن ننتظر الحافلة.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ['I working now.', 'I am work now.', 'I am working now.'],
          correct: 2,
          explanationAr: '"I am working now." — am + verb-ing.',
        },
        {
          promptAr: 'أكمل: "She ___ dinner." (cook)',
          choices: ['is cooks', 'is cooking', 'are cooking'],
          correct: 1,
          explanationAr: '"She is cooking" — she تأخذ is، والفعل بـ -ing.',
        },
        {
          promptAr: 'كيف تسأل "ماذا تفعل؟"',
          choices: ['What you are doing?', 'What are you doing?', 'What is you doing?'],
          correct: 1,
          explanationAr: '"What are you doing?" — are تجي قبل you في السؤال.',
        },
        {
          promptAr: 'ما النفي الصحيح؟',
          choices: ["She not is sleeping.", "She isn't sleeping.", "She is not sleep."],
          correct: 1,
          explanationAr: '"She isn\'t sleeping." — isn\'t = is not، ثم verb-ing.',
        },
        {
          promptAr: 'ما الفعل الصحيح: run → ___ing',
          choices: ['runing', 'running', 'runeing'],
          correct: 1,
          explanationAr: '"running" — run ينتهي بـ CVC فتضاعف n وتضيف ing.',
        },
        {
          promptAr: 'ما الفعل الصحيح: write → ___ing',
          choices: ['writeing', 'writting', 'writing'],
          correct: 2,
          explanationAr: '"writing" — write ينتهي بـ e صامتة فتحذفها وتضيف ing.',
        },
        {
          promptAr: 'أي من هذه الأفعال لا يُستخدم عادةً في المضارع المستمر؟',
          choices: ['run', 'know', 'study'],
          correct: 1,
          explanationAr: '"know" فعل حالة (stative verb) — لا نقول "I am knowing" بل "I know".',
        },
        {
          promptAr: 'ما الفرق بين المضارع البسيط والمضارع المستمر؟',
          choices: [
            'المضارع البسيط = الآن · المضارع المستمر = عادة',
            'المضارع البسيط = عادة · المضارع المستمر = الآن',
            'لا فرق بينهما',
          ],
          correct: 1,
          explanationAr: 'المضارع البسيط = عادة دائمة (every day) · المضارع المستمر = الآن (right now).',
        },
        {
          promptAr: 'أكمل: "___ they watching TV?"',
          choices: ['Is', 'Am', 'Are'],
          correct: 2,
          explanationAr: '"Are they watching?" — they تأخذ are.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I am want a coffee.', 'I wanting a coffee.', 'I want a coffee.'],
          correct: 2,
          explanationAr: '"I want a coffee." — want فعل حالة لا يستخدم المضارع المستمر.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'المضارع المستمر: am/is/are + verb-ing = يحدث الآن', en: 'I am eating · She is working · They are studying', example: 'I am studying English right now.' },
        { ar: 'هجاء -ing: حذف e الصامتة · مضاعفة CVC · y تبقى y', en: 'write→writing · run→running · study→studying', example: 'He is running. She is writing.' },
        { ar: 'أفعال الحالة لا تستخدم المضارع المستمر: know, like, want, love, need, understand', en: 'I know (NOT I am knowing)', example: 'I know the answer. She likes coffee.' },
      ],
    },
  ],
}
