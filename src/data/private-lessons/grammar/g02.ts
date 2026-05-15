import type { GrammarLesson } from './types'

export const g02: GrammarLesson = {
  id: 2,
  slug: 'possessives',
  emoji: '🔑',
  title: { en: 'Possessives', ar: 'ضمائر الملكية' },
  description: { en: 'My, your, his, her, its, our, their', ar: 'كيف تقول ملكيتك للأشياء بالإنجليزية' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '🔑',
      title: 'Possessives',
      titleAr: 'ضمائر الملكية',
      level: 'A0',
      tagAr: 'درس ٢ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تقول "كتابي" و"سيارتها" بالإنجليزية؟',
      bodyAr:
        'في العربية تُلصق المِلكية بالكلمة: كتاب + ي = كتابي. لكن في الإنجليزية تضع ضميراً مستقلاً قبل الاسم. هذا الضمير يُسمى Possessive Adjective. مثلاً "my book" = كتابي، "his phone" = هاتفه، "their house" = بيتهم.',
      arabicEx: 'هذا كتابي.',
      englishEx: 'This is MY book.',
      noteAr: 'الكلمة "MY" تحل محل إضافة "ي" في العربية — تأتي دائماً قبل الاسم!',
    },
    {
      kind: 'patternTable',
      titleAr: 'جدول ضمائر الملكية',
      rows: [
        { pronoun: 'I', pronounAr: 'أنا', verb: 'my', exampleEn: 'my book', exampleAr: 'كتابي', emoji: '📚' },
        { pronoun: 'You', pronounAr: 'أنتَ / أنتِ', verb: 'your', exampleEn: 'your phone', exampleAr: 'هاتفك', emoji: '📱' },
        { pronoun: 'He', pronounAr: 'هو', verb: 'his', exampleEn: 'his car', exampleAr: 'سيارته', emoji: '🚗' },
        { pronoun: 'She', pronounAr: 'هي', verb: 'her', exampleEn: 'her bag', exampleAr: 'حقيبتها', emoji: '👜' },
        { pronoun: 'It', pronounAr: 'هو / هي (أشياء)', verb: 'its', exampleEn: 'its name', exampleAr: 'اسمه / اسمها', emoji: '🐾' },
        { pronoun: 'We', pronounAr: 'نحن', verb: 'our', exampleEn: 'our house', exampleAr: 'بيتنا', emoji: '🏠' },
        { pronoun: 'They', pronounAr: 'هم / هن', verb: 'their', exampleEn: 'their teacher', exampleAr: 'أستاذهم', emoji: '👨‍🏫' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل حقيقية بضمائر الملكية',
      items: [
        {
          tokens: [
            { text: 'My', role: 'subject' }, { text: 'name', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'Youssef', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'اسمي يوسف.',
          emoji: '🙋',
        },
        {
          tokens: [
            { text: 'Your', role: 'subject' }, { text: 'English', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'very good', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'إنجليزيتك جيدة جداً.',
          emoji: '👏',
        },
        {
          tokens: [
            { text: 'His', role: 'subject' }, { text: 'phone', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'new', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هاتفه جديد.',
          emoji: '📱',
        },
        {
          tokens: [
            { text: 'Her', role: 'subject' }, { text: 'sister', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'a doctor', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أختها طبيبة.',
          emoji: '👩‍⚕️',
        },
        {
          tokens: [
            { text: 'Our', role: 'subject' }, { text: 'teacher', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'very kind', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أستاذنا لطيف جداً.',
          emoji: '🙏',
        },
        {
          tokens: [
            { text: 'Their', role: 'subject' }, { text: 'house', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'big', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'بيتهم كبير.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'My', role: 'subject' }, { text: 'friend', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'from Casablanca', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'صديقي من الدار البيضاء.',
          emoji: '🏙️',
        },
        {
          tokens: [
            { text: 'Your', role: 'subject' }, { text: 'bag', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'on the chair', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'حقيبتك على الكرسي.',
          emoji: '🎒',
        },
        {
          tokens: [
            { text: 'The dog', role: 'subject' }, { text: 'loves', role: 'verb' },
            { text: 'its', role: 'complement' }, { text: 'ball', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الكلب يحب كرته.',
          emoji: '🐶',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"He\'s book" — he\'s = he is وليس ملكية!', wrong: "He's book is red", right: 'His book is red' },
        { type: 'mistake', ar: '"it\'s paw" للملكية خطأ — its بدون apostrophe للملكية', wrong: "The cat licked it's paw", right: 'The cat licked its paw' },
        { type: 'tip', ar: 'ضمير الملكية يأتي دائماً قبل الاسم: my book · your car · his phone · her bag · our house' },
        { type: 'rule', ar: 'لا نضيف s أو حروف أخرى للضمير — الكلمة تبقى كما هي قبل الاسم: my books (ليس mys books)' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: '', after: ' name is Sara.', answer: 'Her', choices: ['His', 'Her', 'Their'], ar: 'اسمها سارة.' },
        { before: '', after: ' car is red.', answer: 'My', choices: ['My', 'Its', 'Our'], ar: 'سيارتي حمراء.' },
        { before: 'This is ', after: ' phone.', answer: 'his', choices: ['her', 'his', 'their'], ar: 'هذا هاتفه.' },
        { before: '', after: ' house is very big.', answer: 'Our', choices: ['Our', 'Your', 'His'], ar: 'بيتنا كبير جداً.' },
        { before: 'The cat loves ', after: ' food.', answer: 'its', choices: ['his', 'her', 'its'], ar: 'القطة تحب طعامها.' },
        { before: '', after: ' English is excellent!', answer: 'Your', choices: ['Your', 'My', 'Their'], ar: 'إنجليزيتك ممتازة!' },
        { before: '', after: ' sister is a nurse.', answer: 'Their', choices: ['Our', 'Their', 'His'], ar: 'أختهم ممرضة.' },
        { before: 'What is ', after: ' name?', answer: 'your', choices: ['my', 'your', 'its'], ar: 'ما اسمك؟' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'أكمل: "This is ___ car." (السيارة تخص هو)',
          choices: ['his', 'her', 'its'],
          correct: 0,
          explanationAr: '"he" → "his" للملكية. He has a car → This is his car.',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ["He's book is on the table.", "His book is on the table.", "Hes book is on the table."],
          correct: 1,
          explanationAr: '"His" هو ضمير الملكية لـ he. "He\'s" = he is وليس ملكية!',
        },
        {
          promptAr: 'أكمل: "___ teacher is very kind." (نحن)',
          choices: ['My', 'Our', 'Their'],
          correct: 1,
          explanationAr: '"We" → "our" للملكية: Our teacher = أستاذنا.',
        },
        {
          promptAr: '"its" (بدون apostrophe) تعني:',
          choices: ['it is', 'ملكية شيء أو حيوان', 'هو / هي فقط'],
          correct: 1,
          explanationAr: '"its" بدون apostrophe = ملكية. "it\'s" مع apostrophe = it is. الفرق أساسي!',
        },
        {
          promptAr: 'أكمل: "What is ___ name?" (أسأل شخصاً أمامي)',
          choices: ['my', 'your', 'their'],
          correct: 1,
          explanationAr: 'عندما تسأل شخصاً أمامك تستخدم "your": What is your name?',
        },
        {
          promptAr: 'أكمل: "___ bag is black." (الحقيبة تخص هي)',
          choices: ['His', 'Her', 'Our'],
          correct: 1,
          explanationAr: '"she" → "her" للملكية. Her bag = حقيبتها.',
        },
        {
          promptAr: 'أي جملة غلط؟',
          choices: ['My name is Ahmed.', 'Their house is big.', 'She car is new.'],
          correct: 2,
          explanationAr: '"She car" غلط — she ضمير فاعل. الصحيح: "Her car is new."',
        },
        {
          promptAr: 'أكمل: "___ friends are from Rabat." (أتكلم عن أصدقائي)',
          choices: ['My', 'Your', 'His'],
          correct: 0,
          explanationAr: '"I" → "my" للملكية: My friends = أصدقائي.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: 'ضمير الملكية يأتي قبل الاسم دائماً', en: 'Possessive + noun', example: 'my book · her car · their house' },
        { ar: "his ≠ he's · its ≠ it's — انتبه للفرق!", en: 'his/its = possession', example: 'His phone is new. · Its name is Max.' },
        { ar: 'I→my · you→your · he→his · she→her · it→its · we→our · they→their', en: 'Pronoun → Possessive', example: 'She → her bag' },
      ],
    },
  ],
}
