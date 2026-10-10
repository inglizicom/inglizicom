/**
 * Bouchta's cards «بطاقات بوشتى»: the goat of the deck, shuffled in with the
 * lesson cards. Nine silly questions, each on a lesson's grammar (absurd,
 * so it sticks, and answered with the lesson's own sentence pattern; a
 * family keeps only those of the lessons studied), and nine action cards
 * that change the game: double, steal, skip, help, everyone plays.
 */

export interface BouchtaCard {
  id: string
  kind: 'silly' | 'action'
  icon: string
  /** Silly: the lesson whose grammar the question uses. */
  lesson?: number
  /** The title (action) or the question (silly), English and Arabic. */
  en: string
  ar: string
  /** Asker's side: the answer (silly) or what happens (action). */
  answer: string
  answerAr: string
  /** For the asker (Arabic, may quote English after a colon). */
  note?: string
  points?: string
}

export const BOUCHTA: BouchtaCard[] = [
  /* ── silly questions: the lesson's grammar, an absurd situation ── */
  { id: 'b-01', kind: 'silly', lesson: 1, icon: '👋', en: "Hello! I'm Bouchta the goat. What's your name?", ar: 'مرحبًا! أنا بوشتى الماعز. ما اسمك؟',
    answer: 'My name is … Nice to meet you, Bouchta!', answerAr: 'اسمي… تشرّفت بمعرفتك يا بوشتى!', points: '★3' },
  { id: 'b-02', kind: 'silly', lesson: 2, icon: '🐈', en: "How old is your grandmother's cat?", ar: 'كم عمر قطة جدتك؟',
    answer: 'It is … years old.', answerAr: 'عمرها … سنة.', note: 'أي عمر، مع: It is … years old.', points: '★3' },
  { id: 'b-03', kind: 'silly', lesson: 3, icon: '✈️', en: 'Is your teacher a pilot?', ar: 'هل أستاذك طيّار؟',
    answer: "No, he isn't. He is a teacher!", answerAr: 'لا. إنه أستاذ!', note: "نقبل أيضًا: No, she isn't.", points: '★3' },
  { id: 'b-04', kind: 'silly', lesson: 10, icon: '🧊', en: 'Where is Bouchta? On the fridge or under the bed?', ar: 'أين بوشتى؟ فوق الثلاجة أم تحت السرير؟',
    answer: 'Bouchta is on the fridge!', answerAr: 'بوشتى فوق الثلاجة!', note: 'نقبل أيضًا: He is under the bed!', points: '★3' },
  { id: 'b-05', kind: 'silly', lesson: 11, icon: '🌙', en: 'Do you wake up at 3 a.m. to eat msemen?', ar: 'هل تستيقظ في الثالثة ليلًا لتأكل المسمن؟',
    answer: "No, I don't! I wake up at 7:00.", answerAr: 'لا! أستيقظ في السابعة.', note: "أي ساعة، مع: I wake up at…", points: '★3' },
  { id: 'b-06', kind: 'silly', lesson: 13, icon: '🍫', en: 'Do you like couscous with chocolate?', ar: 'هل تحب الكسكس بالشوكولاتة؟',
    answer: "No, I don't! I like couscous with vegetables.", answerAr: 'لا! أحب الكسكس بالخضر.', note: "نقطة إضافية لمن يكمل: I like couscous with…", points: '★3' },
  { id: 'b-07', kind: 'silly', lesson: 15, icon: '🐪', en: 'Do you go to school by camel?', ar: 'هل تذهب إلى المدرسة على جمل؟',
    answer: "No, I don't. I go to school by bus.", answerAr: 'لا. أذهب إلى المدرسة بالحافلة.', note: 'أي وسيلة، مع: by bus / by car / on foot', points: '★3' },
  { id: 'b-08', kind: 'silly', lesson: 18, icon: '🚕', en: 'Can a goat drive a taxi?', ar: 'هل يستطيع الماعز قيادة طاكسي؟',
    answer: "No, it can't! A goat can eat grass.", answerAr: 'لا! الماعز يستطيع أكل العشب.', points: '★3' },
  { id: 'b-09', kind: 'silly', lesson: 19, icon: '🎮', en: 'Does your grandmother like video games?', ar: 'هل تحب جدتك ألعاب الفيديو؟',
    answer: "No, she doesn't. She likes cooking.", answerAr: 'لا. هي تحب الطبخ.', note: 'نقبل أيضًا: Yes, she does!', points: '★3' },

  /* ── action cards: they change the game ─────────────────────────── */
  { id: 'b-10', kind: 'action', icon: '⭐', en: 'Double stars!', ar: 'نجوم مضاعفة!',
    answer: 'Your next card counts double.', answerAr: 'بطاقتك التالية بضعف النجوم.' },
  { id: 'b-11', kind: 'action', icon: '⭐', en: 'Double stars!', ar: 'نجوم مضاعفة!',
    answer: 'Your next card counts double.', answerAr: 'بطاقتك التالية بضعف النجوم.' },
  { id: 'b-12', kind: 'action', icon: '🐐', en: 'Bouchta is hungry!', ar: 'بوشتى جائع!',
    answer: 'Steal 2 stars from any player.', answerAr: 'اسرق نجمتين من أي لاعب.' },
  { id: 'b-13', kind: 'action', icon: '🐐', en: 'Bouchta is hungry!', ar: 'بوشتى جائع!',
    answer: 'Steal 2 stars from any player.', answerAr: 'اسرق نجمتين من أي لاعب.' },
  { id: 'b-14', kind: 'action', icon: '⏭️', en: 'Skip!', ar: 'تجاوز!',
    answer: 'The next player loses a turn.', answerAr: 'اللاعب التالي يفقد دوره.' },
  { id: 'b-15', kind: 'action', icon: '🤝', en: 'Ask a friend', ar: 'استعن بصديق',
    answer: 'Keep this card. Use it once: a friend helps you answer.', answerAr: 'احتفظ بها، واستعملها مرة واحدة: صديق يساعدك في الجواب.' },
  { id: 'b-16', kind: 'action', icon: '📣', en: 'Everyone plays!', ar: 'الكل يلعب!',
    answer: 'Draw a card. The first player to answer right wins the stars.', answerAr: 'اسحب بطاقة: أول لاعب يجيب صحيحًا يربح نجومها.' },
  { id: 'b-17', kind: 'action', icon: '🔁', en: 'Second chance', ar: 'فرصة ثانية',
    answer: 'Keep this card. Use it once: try a wrong answer again.', answerAr: 'احتفظ بها، واستعملها مرة واحدة: أعد المحاولة بعد جواب خاطئ.' },
  { id: 'b-18', kind: 'action', icon: '🎁', en: 'Free stars!', ar: 'نجوم مجانية!',
    answer: 'Say "Thank you, Bouchta!" in English: take 2 stars.', answerAr: 'قل بالإنجليزية «شكرًا يا بوشتى!» وخذ نجمتين.' },
]
