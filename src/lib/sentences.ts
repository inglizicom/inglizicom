// ─── Types ────────────────────────────────────────────────────────────────────

export type Level = 'A1' | 'A2' | 'B1'

export interface Sentence {
  id: string
  english: string
  arabic: string
  level: Level
  topic: string
}

// ─── Sentence Pools ───────────────────────────────────────────────────────────
// 30 sentences per level = 90 total
// Topics: daily-life, introductions, travel, work, education, opinions, health, technology

export const SENTENCE_POOL: Sentence[] = [

  // ═══════════════════════ A1 — Beginner ═══════════════════════

  { id: 'a1_01', level: 'A1', topic: 'introductions',
    english: 'My name is Sara and I live in Morocco.',
    arabic: 'اسمي سارة وأنا أسكن في المغرب.' },

  { id: 'a1_02', level: 'A1', topic: 'daily-life',
    english: 'I wake up at seven o\'clock every morning.',
    arabic: 'أستيقظ الساعة السابعة كل صباح.' },

  { id: 'a1_03', level: 'A1', topic: 'family',
    english: 'She has two brothers and one sister.',
    arabic: 'عندها أخان وأخت واحدة.' },

  { id: 'a1_04', level: 'A1', topic: 'polite-phrases',
    english: 'Can I have a glass of water, please?',
    arabic: 'هل يمكنني الحصول على كوب ماء من فضلك؟' },

  { id: 'a1_05', level: 'A1', topic: 'places',
    english: 'The café is near the train station.',
    arabic: 'المقهى قريب من محطة القطار.' },

  { id: 'a1_06', level: 'A1', topic: 'daily-life',
    english: 'I eat breakfast before I go to school.',
    arabic: 'آكل الفطور قبل أن أذهب إلى المدرسة.' },

  { id: 'a1_07', level: 'A1', topic: 'work',
    english: 'He is a doctor and she is a teacher.',
    arabic: 'هو طبيب وهي معلمة.' },

  { id: 'a1_08', level: 'A1', topic: 'daily-life',
    english: 'I go to the market every Saturday morning.',
    arabic: 'أذهب إلى السوق كل صباح يوم السبت.' },

  { id: 'a1_09', level: 'A1', topic: 'weather',
    english: 'It is cold today. Please wear a jacket.',
    arabic: 'الجو بارد اليوم. من فضلك ارتدِ سترة.' },

  { id: 'a1_10', level: 'A1', topic: 'education',
    english: 'We have English class on Monday and Wednesday.',
    arabic: 'لدينا درس إنجليزي يوم الاثنين والأربعاء.' },

  { id: 'a1_11', level: 'A1', topic: 'food',
    english: 'I like tea with milk in the morning.',
    arabic: 'أحب الشاي بالحليب في الصباح.' },

  { id: 'a1_12', level: 'A1', topic: 'shopping',
    english: 'How much does this shirt cost?',
    arabic: 'بكم هذا القميص؟' },

  { id: 'a1_13', level: 'A1', topic: 'introductions',
    english: 'I am twenty years old and I am a student.',
    arabic: 'عمري عشرون سنة وأنا طالب.' },

  { id: 'a1_14', level: 'A1', topic: 'transport',
    english: 'The bus stops in front of the big hotel.',
    arabic: 'الحافلة تتوقف أمام الفندق الكبير.' },

  { id: 'a1_15', level: 'A1', topic: 'family',
    english: 'She always helps her mother in the kitchen.',
    arabic: 'تساعد أمها دائماً في المطبخ.' },

  { id: 'a1_16', level: 'A1', topic: 'polite-phrases',
    english: 'Can you speak more slowly, please?',
    arabic: 'هل يمكنك التحدث ببطء أكثر من فضلك؟' },

  { id: 'a1_17', level: 'A1', topic: 'polite-phrases',
    english: 'I do not understand. Can you repeat that?',
    arabic: 'لم أفهم. هل يمكنك تكرار ذلك؟' },

  { id: 'a1_18', level: 'A1', topic: 'daily-life',
    english: 'I usually sleep at eleven at night.',
    arabic: 'عادةً أنام الساعة الحادية عشرة ليلاً.' },

  { id: 'a1_19', level: 'A1', topic: 'work',
    english: 'He drinks coffee every day at work.',
    arabic: 'يشرب القهوة كل يوم في العمل.' },

  { id: 'a1_20', level: 'A1', topic: 'food',
    english: 'What is your favourite food?',
    arabic: 'ما هو طعامك المفضل؟' },

  { id: 'a1_21', level: 'A1', topic: 'family',
    english: 'I live with my parents and my little brother.',
    arabic: 'أعيش مع والديّ وأخي الصغير.' },

  { id: 'a1_22', level: 'A1', topic: 'education',
    english: 'She studies English every evening for one hour.',
    arabic: 'تدرس الإنجليزية كل مساء لمدة ساعة.' },

  { id: 'a1_23', level: 'A1', topic: 'weather',
    english: 'The weather is nice today. Let us go for a walk.',
    arabic: 'الطقس جميل اليوم. هيا نذهب في نزهة.' },

  { id: 'a1_24', level: 'A1', topic: 'shopping',
    english: 'I need to buy bread and milk from the shop.',
    arabic: 'أحتاج لشراء الخبز والحليب من الدكان.' },

  { id: 'a1_25', level: 'A1', topic: 'introductions',
    english: 'Nice to meet you. Where are you from?',
    arabic: 'يسعدني مقابلتك. من أين أنت؟' },

  { id: 'a1_26', level: 'A1', topic: 'feelings',
    english: 'I am happy because today is my birthday.',
    arabic: 'أنا سعيد لأن اليوم عيد ميلادي.' },

  { id: 'a1_27', level: 'A1', topic: 'places',
    english: 'The school is on the left and the park is on the right.',
    arabic: 'المدرسة على اليسار والحديقة على اليمين.' },

  { id: 'a1_28', level: 'A1', topic: 'daily-life',
    english: 'I brush my teeth before I go to bed.',
    arabic: 'أفرش أسناني قبل أن أذهب للنوم.' },

  { id: 'a1_29', level: 'A1', topic: 'colours',
    english: 'My favourite colour is blue and I like green too.',
    arabic: 'لوني المفضل هو الأزرق وأحب الأخضر أيضاً.' },

  { id: 'a1_30', level: 'A1', topic: 'hobbies',
    english: 'I love watching football with my friends on weekends.',
    arabic: 'أحب مشاهدة كرة القدم مع أصدقائي في عطلة نهاية الأسبوع.' },

  // ═══════════════════════ A2 — Elementary ═══════════════════════

  { id: 'a2_01', level: 'A2', topic: 'travel',
    english: 'I went to the beach last weekend with my family.',
    arabic: 'ذهبت إلى الشاطئ نهاية الأسبوع الماضي مع عائلتي.' },

  { id: 'a2_02', level: 'A2', topic: 'work',
    english: 'She is going to start a new job next month.',
    arabic: 'ستبدأ وظيفة جديدة الشهر القادم.' },

  { id: 'a2_03', level: 'A2', topic: 'education',
    english: 'I prefer studying in the morning when it is quiet.',
    arabic: 'أفضّل الدراسة في الصباح عندما يكون الجو هادئاً.' },

  { id: 'a2_04', level: 'A2', topic: 'hobbies',
    english: 'Did you watch the football match last night?',
    arabic: 'هل شاهدت مباراة كرة القدم البارحة؟' },

  { id: 'a2_05', level: 'A2', topic: 'travel',
    english: 'We are planning to visit Spain during the summer.',
    arabic: 'نخطط لزيارة إسبانيا خلال الصيف.' },

  { id: 'a2_06', level: 'A2', topic: 'education',
    english: 'I have been learning English for two years now.',
    arabic: 'أتعلم الإنجليزية منذ سنتين الآن.' },

  { id: 'a2_07', level: 'A2', topic: 'daily-life',
    english: 'The restaurant was very crowded because of the holiday.',
    arabic: 'كان المطعم مزدحماً جداً بسبب العطلة.' },

  { id: 'a2_08', level: 'A2', topic: 'goals',
    english: 'I would like to improve my speaking skills this year.',
    arabic: 'أريد تحسين مهاراتي في الكلام هذا العام.' },

  { id: 'a2_09', level: 'A2', topic: 'communication',
    english: 'She called me three times but I did not answer.',
    arabic: 'اتصلت بي ثلاث مرات لكنني لم أرد.' },

  { id: 'a2_10', level: 'A2', topic: 'work',
    english: 'He decided to change his career and study medicine.',
    arabic: 'قرر تغيير مساره المهني ودراسة الطب.' },

  { id: 'a2_11', level: 'A2', topic: 'transport',
    english: 'I usually take the bus but today I walked to work.',
    arabic: 'عادةً آخذ الحافلة لكن اليوم مشيت إلى العمل.' },

  { id: 'a2_12', level: 'A2', topic: 'entertainment',
    english: 'The movie was interesting but a little bit long.',
    arabic: 'الفيلم كان مثيراً للاهتمام لكنه طويل قليلاً.' },

  { id: 'a2_13', level: 'A2', topic: 'education',
    english: 'I need to practice English more often to get better.',
    arabic: 'أحتاج لممارسة الإنجليزية أكثر لكي أتحسن.' },

  { id: 'a2_14', level: 'A2', topic: 'travel',
    english: 'What time does your flight arrive tomorrow morning?',
    arabic: 'في أي ساعة تصل رحلتك الجوية صباح الغد؟' },

  { id: 'a2_15', level: 'A2', topic: 'feelings',
    english: 'She felt nervous before her first job interview.',
    arabic: 'شعرت بالتوتر قبل أول مقابلة عمل لها.' },

  { id: 'a2_16', level: 'A2', topic: 'health',
    english: 'I went to the gym three times last week.',
    arabic: 'ذهبت إلى النادي الرياضي ثلاث مرات الأسبوع الماضي.' },

  { id: 'a2_17', level: 'A2', topic: 'places',
    english: 'Can you help me find the nearest pharmacy?',
    arabic: 'هل يمكنك مساعدتي في إيجاد أقرب صيدلية؟' },

  { id: 'a2_18', level: 'A2', topic: 'daily-life',
    english: 'He told me that he lost his wallet on the train.',
    arabic: 'أخبرني أنه فقد محفظته في القطار.' },

  { id: 'a2_19', level: 'A2', topic: 'money',
    english: 'I am saving money to buy a new laptop next year.',
    arabic: 'أوفّر المال لشراء حاسوب محمول جديد السنة القادمة.' },

  { id: 'a2_20', level: 'A2', topic: 'education',
    english: 'The teacher explained the grammar very clearly.',
    arabic: 'شرح المعلم القواعد بشكل واضح جداً.' },

  { id: 'a2_21', level: 'A2', topic: 'hobbies',
    english: 'I enjoy cooking new recipes on weekends.',
    arabic: 'أستمتع بطهي وصفات جديدة في عطلة نهاية الأسبوع.' },

  { id: 'a2_22', level: 'A2', topic: 'transport',
    english: 'We should leave early to avoid traffic.',
    arabic: 'يجب أن نغادر مبكراً لتجنب الازدحام.' },

  { id: 'a2_23', level: 'A2', topic: 'work',
    english: 'He works from home and finds it more comfortable.',
    arabic: 'يعمل من المنزل ويجد ذلك أكثر راحة.' },

  { id: 'a2_24', level: 'A2', topic: 'daily-life',
    english: 'What do you usually do on your day off?',
    arabic: 'ماذا تفعل عادةً في يوم إجازتك؟' },

  { id: 'a2_25', level: 'A2', topic: 'food',
    english: 'I booked a table at the restaurant for seven o\'clock.',
    arabic: 'حجزت طاولة في المطعم للساعة السابعة.' },

  { id: 'a2_26', level: 'A2', topic: 'transport',
    english: 'She is learning to drive and takes lessons twice a week.',
    arabic: 'تتعلم قيادة السيارة وتأخذ دروساً مرتين في الأسبوع.' },

  { id: 'a2_27', level: 'A2', topic: 'entertainment',
    english: 'The concert was amazing and the crowd was very energetic.',
    arabic: 'كان الحفل رائعاً والجمهور كان متحمساً جداً.' },

  { id: 'a2_28', level: 'A2', topic: 'weather',
    english: 'I forgot to bring my umbrella and it started to rain.',
    arabic: 'نسيت إحضار مظلتي وبدأت الأمطار.' },

  { id: 'a2_29', level: 'A2', topic: 'health',
    english: 'I drink a lot of water because it is good for my health.',
    arabic: 'أشرب الكثير من الماء لأنه مفيد لصحتي.' },

  { id: 'a2_30', level: 'A2', topic: 'shopping',
    english: 'This jacket is too expensive. Do you have a cheaper one?',
    arabic: 'هذه السترة غالية جداً. هل عندك واحدة أرخص؟' },

  // ═══════════════════════ B1 — Intermediate ═══════════════════════

  { id: 'b1_01', level: 'B1', topic: 'education',
    english: 'Learning a language requires consistent effort and daily practice.',
    arabic: 'تعلم لغة يتطلب جهداً منتظماً وممارسة يومية.' },

  { id: 'b1_02', level: 'B1', topic: 'travel',
    english: 'If I could travel anywhere in the world, I would choose Japan.',
    arabic: 'لو استطعت السفر إلى أي مكان في العالم لاخترت اليابان.' },

  { id: 'b1_03', level: 'B1', topic: 'technology',
    english: 'Social media has both positive and negative effects on our society.',
    arabic: 'وسائل التواصل الاجتماعي لها تأثيرات إيجابية وسلبية على مجتمعنا.' },

  { id: 'b1_04', level: 'B1', topic: 'education',
    english: 'I think it is important to read books every day to expand your vocabulary.',
    arabic: 'أعتقد أنه من المهم قراءة الكتب كل يوم لتوسيع مفرداتك.' },

  { id: 'b1_05', level: 'B1', topic: 'work',
    english: 'She has been working at the same company for over five years.',
    arabic: 'تعمل في نفس الشركة منذ أكثر من خمس سنوات.' },

  { id: 'b1_06', level: 'B1', topic: 'goals',
    english: 'Despite the challenges, he managed to pass all his exams with high grades.',
    arabic: 'على الرغم من الصعوبات، تمكن من اجتياز جميع امتحاناته بدرجات عالية.' },

  { id: 'b1_07', level: 'B1', topic: 'technology',
    english: 'The development of technology has completely changed the way we communicate.',
    arabic: 'تطور التكنولوجيا غيّر تماماً طريقة تواصلنا.' },

  { id: 'b1_08', level: 'B1', topic: 'work',
    english: 'I would rather work independently than in a large corporate team.',
    arabic: 'أفضّل العمل باستقلالية على العمل في فريق مؤسسي كبير.' },

  { id: 'b1_09', level: 'B1', topic: 'goals',
    english: 'It is worth trying new things even if you might fail at first.',
    arabic: 'يستحق تجربة أشياء جديدة حتى لو فشلت في البداية.' },

  { id: 'b1_10', level: 'B1', topic: 'work',
    english: 'She convinced her manager to let the whole team work remotely.',
    arabic: 'أقنعت مديرها بالسماح للفريق بأكمله بالعمل عن بُعد.' },

  { id: 'b1_11', level: 'B1', topic: 'education',
    english: 'The more you practice speaking, the more confident you will become.',
    arabic: 'كلما مارست الكلام أكثر، كلما أصبحت أكثر ثقة.' },

  { id: 'b1_12', level: 'B1', topic: 'environment',
    english: 'Environmental issues such as pollution must be addressed urgently.',
    arabic: 'يجب معالجة القضايا البيئية مثل التلوث بشكل عاجل.' },

  { id: 'b1_13', level: 'B1', topic: 'education',
    english: 'I have always been interested in how languages develop over time.',
    arabic: 'لطالما اهتممت بكيفية تطور اللغات عبر الزمن.' },

  { id: 'b1_14', level: 'B1', topic: 'feelings',
    english: 'He regrets not studying harder when he was at school.',
    arabic: 'يندم على عدم دراسته بجدية أكبر حين كان في المدرسة.' },

  { id: 'b1_15', level: 'B1', topic: 'work',
    english: 'Although she was tired, she continued working until midnight.',
    arabic: 'على الرغم من تعبها، واصلت العمل حتى منتصف الليل.' },

  { id: 'b1_16', level: 'B1', topic: 'health',
    english: 'We need to find a balance between work and our personal life.',
    arabic: 'نحتاج إلى إيجاد توازن بين العمل والحياة الشخصية.' },

  { id: 'b1_17', level: 'B1', topic: 'goals',
    english: 'I am not sure whether to accept the job offer or continue studying.',
    arabic: 'لست متأكداً من قبول عرض العمل أو الاستمرار في الدراسة.' },

  { id: 'b1_18', level: 'B1', topic: 'education',
    english: 'If you had listened to the advice, you would not be in this situation.',
    arabic: 'لو كنت أصغيت للنصيحة لما كنت في هذا الوضع.' },

  { id: 'b1_19', level: 'B1', topic: 'travel',
    english: 'Volunteering abroad helped her develop a truly global perspective.',
    arabic: 'ساعد العمل التطوعي في الخارج على تطوير منظورها العالمي.' },

  { id: 'b1_20', level: 'B1', topic: 'education',
    english: 'Reading novels in English is one of the best ways to improve fluency.',
    arabic: 'قراءة الروايات بالإنجليزية هي من أفضل طرق تحسين الطلاقة.' },

  { id: 'b1_21', level: 'B1', topic: 'goals',
    english: 'I wish I had taken the opportunity when it was available.',
    arabic: 'أتمنى لو كنت قد اغتنمت الفرصة حين كانت متاحة.' },

  { id: 'b1_22', level: 'B1', topic: 'work',
    english: 'The company announced plans to expand into new international markets.',
    arabic: 'أعلنت الشركة عن خطط للتوسع في أسواق دولية جديدة.' },

  { id: 'b1_23', level: 'B1', topic: 'education',
    english: 'Critical thinking is one of the most valuable skills in today\'s world.',
    arabic: 'التفكير النقدي هو أحد أكثر المهارات قيمةً في عالم اليوم.' },

  { id: 'b1_24', level: 'B1', topic: 'work',
    english: 'She spoke so confidently that everyone was impressed by her presentation.',
    arabic: 'تحدثت بثقة كبيرة لدرجة أن الجميع أُعجب بعرضها التقديمي.' },

  { id: 'b1_25', level: 'B1', topic: 'goals',
    english: 'The more time you invest in learning, the better your results will be.',
    arabic: 'كلما استثمرت وقتاً أكبر في التعلم، كانت نتائجك أفضل.' },

  { id: 'b1_26', level: 'B1', topic: 'technology',
    english: 'Many people prefer online shopping because it saves time and effort.',
    arabic: 'يفضل كثير من الناس التسوق الإلكتروني لأنه يوفر الوقت والجهد.' },

  { id: 'b1_27', level: 'B1', topic: 'health',
    english: 'Regular exercise not only improves your fitness but also boosts your mood.',
    arabic: 'الرياضة المنتظمة لا تحسن لياقتك فحسب، بل تحسن مزاجك أيضاً.' },

  { id: 'b1_28', level: 'B1', topic: 'environment',
    english: 'Reducing plastic waste is something every individual can contribute to.',
    arabic: 'تقليل النفايات البلاستيكية أمر يستطيع كل فرد المساهمة فيه.' },

  { id: 'b1_29', level: 'B1', topic: 'communication',
    english: 'Listening carefully is just as important as speaking clearly.',
    arabic: 'الإنصات بعناية لا يقل أهمية عن التحدث بوضوح.' },

  { id: 'b1_30', level: 'B1', topic: 'feelings',
    english: 'He takes great pride in the quality of his work and never cuts corners.',
    arabic: 'يفخر كثيراً بجودة عمله ولا يتهاون أبداً.' },
]

// ─── Session Selection (anti-repetition) ─────────────────────────────────────

/** Fisher-Yates shuffle (pure, no mutation of input) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Returns `count` random sentences for the given level.
 * Skips recently-used IDs to prevent repetition.
 * If the unused pool is smaller than `count`, resets and uses the full pool.
 */
export function getSessionSentences(
  level: Level,
  usedIds: string[],
  count = 6,
): Sentence[] {
  const levelPool = SENTENCE_POOL.filter(s => s.level === level)
  const unused = levelPool.filter(s => !usedIds.includes(s.id))

  // Not enough unused sentences → use full level pool (natural reset)
  const source = unused.length >= count ? unused : levelPool

  return shuffle(source).slice(0, Math.min(count, source.length))
}
