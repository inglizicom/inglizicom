import type { Block } from '../level1-book.ts'
import { ex, page, type BacPage } from './bac-helpers.ts'

/**
 * Five original mock exams in the national format: reading 15 + language 15 +
 * writing 10 = 40 points (÷ 2 = the mark out of 20). They are kept as data, not
 * just pages, so the online timed version (phase 2) can score the same items;
 * `mockPages()` turns each exam into its two printed sheets.
 */

type Item = [string, string] | [string, string, string[]]
export interface MockPart { title: string; instr?: string; points: number; items: Item[]; lines?: boolean; cols?: 1 | 2 }
export interface MockExam {
  n: number
  titleEn: string
  titleAr: string
  textTitle: string
  /** Paragraphs, numbered in print; questions refer to them as §1, §2… */
  text: string[]
  reading: { tf: MockPart; answer: MockPart; words: MockPart; reference: MockPart; title: MockPart }
  language: { vocab: MockPart; grammar: MockPart; functions: MockPart }
  writing: { points: number; topics: [string, string] }
}

const tf = (items: Item[]): MockPart => ({ title: 'A. True or false? Justify.', instr: 'Write T or F and copy the words that prove it.', points: 4, items, lines: true })
const answer = (items: Item[]): MockPart => ({ title: 'B. Answer the questions.', points: 3, items, lines: true })
const find = (items: Item[]): MockPart => ({ title: 'C. Find words in the text.', points: 4, items })
const refer = (items: Item[]): MockPart => ({ title: 'D. What do these words refer to?', points: 3, items })
const best = (options: string[], a: string): MockPart => ({ title: 'E. Choose the best title.', points: 1, items: [['The best title for the text is:', a, options]] })
const vocab = (bank: string, items: Item[]): MockPart => ({ title: 'Vocabulary', instr: `Complete with: ${bank}`, points: 5, items })
const grammar = (items: Item[]): MockPart => ({ title: 'Grammar', instr: 'Put the words in brackets in the correct form, or choose.', points: 6, items, cols: 2 })
const functions = (items: Item[]): MockPart => ({ title: 'Communicative functions', instr: 'What would you say? / Identify the function.', points: 4, items, lines: true })

export const BAC_MOCKS: MockExam[] = [
  {
    n: 1, titleEn: 'Education: girls in rural areas', titleAr: 'التعليم: تمدرس الفتيات في القرى', textTitle: 'A bus that changed a village',
    text: [
      'In the village of Tizi, in the Atlas Mountains, the nearest secondary school is fifteen kilometres away. For years, most girls stopped studying after primary school. Their parents were afraid to let them walk such a long way alone, and many families needed their daughters to help at home.',
      'Things changed in 2019, when a local association bought a small school bus with the help of a foundation. The association also opened a boarding house near the school, where girls can sleep during the week. Today, more than sixty girls from Tizi and the nearby villages attend secondary school.',
      'Fatima, one of them, is now in her second year of Bac. "Before the bus, my older sisters had no choice," she explains. "They left school at twelve. I want to become a nurse and come back to work in my village."',
      'Experts agree that educating girls benefits the whole community. Educated women marry later, have healthier children and earn more money. They are also more likely to send their own children to school. Nevertheless, many challenges remain: some families are still poor, and the boarding house can only receive forty students.',
      'The story of Tizi shows that simple solutions, such as transport and safe accommodation, can open the doors of education to thousands of girls.',
    ],
    reading: {
      tf: tf([
        ['The secondary school is close to the village.', 'F – "the nearest secondary school is fifteen kilometres away"'],
        ['The government bought the school bus.', 'F – "a local association bought a small school bus"'],
        ['Fatima\'s older sisters did not finish school.', 'T – "They left school at twelve."'],
        ['All the problems have been solved.', 'F – "many challenges remain"'],
      ]),
      answer: answer([
        ['Why did girls stop studying after primary school?', 'Their parents were afraid to let them walk so far alone, and families needed them at home.'],
        ['What does Fatima want to do in the future?', 'She wants to become a nurse and work in her village.'],
        ['Give two benefits of educating girls.', 'Any two: they marry later, have healthier children, earn more money, send their children to school.'],
      ]),
      words: find([
        ['frightened (§1) = ___', 'afraid'],
        ['go to (§2) = ___', 'attend'],
        ['gain (§4) = ___', 'earn'],
        ['difficulties (§4) = ___', 'challenges'],
      ]),
      reference: refer([
        ['"Their" (§1) → ___', 'the girls\''],
        ['"where" (§2) → ___', 'the boarding house'],
        ['"They" (§4) → ___', 'educated women'],
      ]),
      title: best(['A long walk', 'Opening school doors for rural girls', 'Life in the Atlas Mountains'], 'b) Opening school doors for rural girls'),
    },
    language: {
      vocab: vocab('illiteracy · drop out · compulsory · scholarship · gender equality', [
        ['Many rural children ___ of school because of poverty.', 'drop out'],
        ['School is ___ for all children aged 6 to 15.', 'compulsory'],
        ['She won a ___ to study medicine in Rabat.', 'scholarship'],
        ['___ is still high among older women in the countryside.', 'Illiteracy'],
        ['___ means that boys and girls have the same rights.', 'Gender equality'],
      ]),
      grammar: grammar([
        ['If the association hadn\'t bought a bus, the girls ___ (not / go) to school.', 'wouldn\'t have gone'],
        ['The boarding house ___ (open) in 2019.', 'was opened'],
        ['Fatima said that she ___ (want) to become a nurse.', 'wanted'],
        ['I wish my sisters ___ (continue) their studies.', 'had continued'],
        ['___ the distance, she never missed a class. (Although / Despite)', 'Despite'],
        ['By 2030, the village ___ (build) its own school.', 'will have built'],
      ]),
      functions: functions([
        ['Your friend wants to leave school. Advise him.', 'You should continue your studies. / If I were you, I would stay at school.'],
        ['Someone says girls should stay at home. Disagree.', 'I\'m afraid I don\'t agree. Girls have the right to study.'],
        ['"Could you help me with my homework, please?" → function?', 'making a request'],
        ['"I\'m so sorry to hear that your father is ill." → function?', 'expressing sympathy'],
      ]),
    },
    writing: { points: 10, topics: [
      'Write an essay of about 180 words on the importance of girls\' education for the development of a country.',
      'Write an email to a foreign friend describing your school and what you like or dislike about it.',
    ] },
  },

  {
    n: 2, titleEn: 'Sustainable development: water', titleAr: 'التنمية المستدامة: الماء', textTitle: 'Every drop counts',
    text: [
      'Morocco has faced several years of drought. Rainfall has dropped, dams are only partly full, and in some regions farmers have watched their crops die. According to experts, the country is among the most water-stressed in the world, and the situation may get worse because of climate change.',
      'Agriculture uses about eighty-five percent of the country\'s water. That is why the authorities encourage farmers to use drip irrigation, a technique that brings water directly to the roots of plants. It can save up to half of the water used by traditional methods.',
      'Cities are also taking action. New desalination plants turn sea water into drinking water, and some towns now reuse treated waste water to irrigate parks and golf courses. In addition, campaigns on television and social media remind citizens to save water at home.',
      'Individuals can make a difference too. Turning off the tap while brushing your teeth saves around twelve litres a day. Repairing a leaking tap, taking short showers and watering plants in the evening are simple habits that, added together, protect a resource we cannot live without.',
      'Water is not an endless gift. It belongs to future generations as much as to us.',
    ],
    reading: {
      tf: tf([
        ['Morocco has had a lot of rain in recent years.', 'F – "Morocco has faced several years of drought."'],
        ['Farming uses most of the country\'s water.', 'T – "Agriculture uses about eighty-five percent of the country\'s water."'],
        ['Drip irrigation uses more water than traditional methods.', 'F – "It can save up to half of the water used by traditional methods."'],
        ['Some towns water their parks with treated waste water.', 'T – "some towns now reuse treated waste water to irrigate parks"'],
      ]),
      answer: answer([
        ['What may make the situation worse?', 'Climate change.'],
        ['What do desalination plants do?', 'They turn sea water into drinking water.'],
        ['Give two things individuals can do to save water.', 'Any two: turn off the tap while brushing, repair leaking taps, take short showers, water plants in the evening.'],
      ]),
      words: find([
        ['lack of rain (§1) = ___', 'drought'],
        ['method (§2) = ___', 'technique'],
        ['fixing (§4) = ___', 'repairing'],
        ['without end (§5) = ___', 'endless'],
      ]),
      reference: refer([
        ['"It" (§2) → ___', 'drip irrigation'],
        ['"that" (§4) → ___', 'simple habits'],
        ['"It" (§5) → ___', 'water'],
      ]),
      title: best(['Farming in Morocco', 'Saving water: everyone\'s responsibility', 'The weather in Morocco'], 'b) Saving water: everyone\'s responsibility'),
    },
    language: {
      vocab: vocab('renewable · recycle · sustainable · waste · drought', [
        ['Solar and wind energy are ___ sources of energy.', 'renewable'],
        ['We should ___ plastic bottles instead of throwing them away.', 'recycle'],
        ['___ development meets our needs without harming future generations.', 'Sustainable'],
        ['Don\'t ___ water; close the tap.', 'waste'],
        ['The ___ has destroyed many crops this year.', 'drought'],
      ]),
      grammar: grammar([
        ['A new desalination plant ___ (build) near Casablanca at the moment.', 'is being built'],
        ['If it ___ (rain) more, farmers would be happier.', 'rained'],
        ['The minister said that the country ___ (face) a serious problem.', 'was facing / faced'],
        ['We have saved water ___ we started using drip irrigation. (since / for)', 'since'],
        ['People should avoid ___ (water) their gardens at noon.', 'watering'],
        ['The farmer ___ crops died last summer is my uncle. (who / whose)', 'whose'],
      ]),
      functions: functions([
        ['Suggest to your classmates organizing a campaign to save water.', 'Why don\'t we organize a campaign to save water? / Let\'s organize…'],
        ['Your brother leaves the tap running. Ask him politely to turn it off.', 'Could you turn off the tap, please?'],
        ['"In my opinion, water should be more expensive." → function?', 'expressing opinion'],
        ['"Thank you very much for your help." → function?', 'expressing gratitude'],
      ]),
    },
    writing: { points: 10, topics: [
      'Write an essay of about 180 words on the causes and effects of water shortage in your region, and suggest solutions.',
      'Write a letter to your town council suggesting ideas to make your town greener.',
    ] },
  },

  {
    n: 3, titleEn: 'Science and technology: AI', titleAr: 'العلوم والتكنولوجيا: الذكاء الاصطناعي', textTitle: 'A new classmate called AI',
    text: [
      'Not long ago, artificial intelligence was something we saw only in science-fiction films. Today, millions of students use AI tools every day. They ask chatbots to explain difficult lessons, translate texts or check their grammar in a few seconds.',
      'Supporters of AI say it is like having a private tutor available day and night. A student who does not understand a maths problem at midnight can get a clear, step-by-step explanation. Teachers, too, use these tools to prepare lessons and save time on correction.',
      'However, many educators are worried. Some students simply copy the answers that AI produces without trying to understand them. As a result, they do not develop their own thinking skills. Moreover, AI is not always right: it sometimes invents facts, which can mislead users who trust it completely.',
      'Schools around the world are now looking for a balance. Instead of banning AI, some teachers ask students to use it openly and then to explain, criticize or improve its answers. Others give more importance to oral exams and work done in class.',
      'One thing is certain: AI will not disappear. The real question is not whether students should use it, but how they can use it to learn more, not less.',
    ],
    reading: {
      tf: tf([
        ['AI was common in schools a long time ago.', 'F – "Not long ago, artificial intelligence was something we saw only in science-fiction films."'],
        ['Teachers also use AI tools.', 'T – "Teachers, too, use these tools to prepare lessons"'],
        ['AI always gives correct information.', 'F – "AI is not always right"'],
        ['All schools have banned AI.', 'F – "Instead of banning AI, some teachers ask students to use it openly"'],
      ]),
      answer: answer([
        ['Mention two things students ask chatbots to do.', 'Any two: explain difficult lessons, translate texts, check their grammar.'],
        ['Why are some educators worried?', 'Some students copy AI answers without understanding them, so they don\'t develop their thinking skills.'],
        ['What do some teachers ask students to do with AI?', 'To use it openly, then explain, criticize or improve its answers.'],
      ]),
      words: find([
        ['private teacher (§2) = ___', 'tutor'],
        ['concerned (§3) = ___', 'worried'],
        ['makes up (§3) = ___', 'invents'],
        ['forbidding (§4) = ___', 'banning'],
      ]),
      reference: refer([
        ['"They" (§1) → ___', 'millions of students'],
        ['"which" (§3) → ___', 'the fact that AI sometimes invents facts'],
        ['"it" (§5) → ___', 'AI'],
      ]),
      title: best(['AI in films', 'AI at school: a tool to use wisely', 'How to cheat in exams'], 'b) AI at school: a tool to use wisely'),
    },
    language: {
      vocab: vocab('invention · rely on · breakthrough · artificial · digital', [
        ['The ___ of the printing press changed the world.', 'invention'],
        ['Many students ___ their phones too much.', 'rely on'],
        ['Finding a vaccine in one year was a real ___.', 'breakthrough'],
        ['___ intelligence can write texts and create images.', 'Artificial'],
        ['We live in the ___ age: everything is online.', 'digital'],
      ]),
      grammar: grammar([
        ['If students ___ (use) AI wisely, they will learn faster.', 'use'],
        ['The first chatbots ___ (create) in the 1960s.', 'were created'],
        ['I wish I ___ (can) write code like my brother.', 'could'],
        ['The teacher asked us whether we ___ (use) AI for our homework.', 'had used / used'],
        ['Scientists ___ (work) on this robot since 2020.', 'have been working'],
        ['The robot ___ we saw at the fair spoke five languages. (who / which)', 'which'],
      ]),
      functions: functions([
        ['You didn\'t understand the word "algorithm". Ask for clarification.', 'Sorry, what do you mean by "algorithm"?'],
        ['Ask your teacher for permission to use your laptop in class.', 'May I use my laptop in class, please?'],
        ['"You\'d better check the information in a book." → function?', 'giving advice'],
        ['"I\'m afraid I don\'t agree with you." → function?', 'disagreeing'],
      ]),
    },
    writing: { points: 10, topics: [
      '"Artificial intelligence will replace teachers one day." Do you agree or disagree? Write an essay of about 180 words.',
      'Write an email to a friend about an app or a gadget that has changed your daily life.',
    ] },
  },

  {
    n: 4, titleEn: 'Citizenship: volunteering', titleAr: 'المواطنة: العمل التطوعي', textTitle: 'Young hands, big hearts',
    text: [
      'Every Saturday morning, while many teenagers are still sleeping, Salma, seventeen, puts on her gloves and goes to the beach of her town with twenty other volunteers. Armed with bags, they collect the plastic bottles, cans and fishing nets that the sea has left on the sand.',
      'Salma joined the association two years ago. "At first, I came because my best friend was a member," she admits. "Now I come because I can see the difference we make." Last summer alone, the group collected more than three tonnes of rubbish.',
      'Volunteering is not only about cleaning beaches. Young Moroccans teach children to read, visit old people in hospitals, collect clothes for poor families and help after natural disasters. When the earthquake hit the Al Haouz region in 2023, thousands of young people drove to the mountains with food, blankets and medicine.',
      'Volunteers say that they receive as much as they give. They learn to work in a team, to organize events and to speak in public, skills that employers value. Above all, they feel useful and become active citizens.',
      '"Citizenship is not just a word in a textbook," Salma says. "It\'s what you do for others when nobody is paying you."',
    ],
    reading: {
      tf: tf([
        ['Salma cleans the beach alone.', 'F – "with twenty other volunteers"'],
        ['Salma first joined because of her friend.', 'T – "I came because my best friend was a member"'],
        ['Volunteers only clean beaches.', 'F – "Volunteering is not only about cleaning beaches."'],
        ['Volunteers learn skills that are useful for work.', 'T – "skills that employers value"'],
      ]),
      answer: answer([
        ['What do the volunteers collect on the beach?', 'Plastic bottles, cans and fishing nets.'],
        ['How did young people help after the earthquake?', 'They drove to the mountains with food, blankets and medicine.'],
        ['What skills do volunteers learn?', 'To work in a team, to organize events and to speak in public.'],
      ]),
      words: find([
        ['confesses (§2) = ___', 'admits'],
        ['waste (§2) = ___', 'rubbish'],
        ['struck (§3) = ___', 'hit'],
        ['appreciate (§4) = ___', 'value'],
      ]),
      reference: refer([
        ['"they" (§1) → ___', 'Salma and the other volunteers'],
        ['"we" (§2) → ___', 'the members of the association'],
        ['"They" (§4) → ___', 'volunteers'],
      ]),
      title: best(['A day at the beach', 'Volunteering: giving and receiving', 'The 2023 earthquake'], 'b) Volunteering: giving and receiving'),
    },
    language: {
      vocab: vocab('duties · rights · charity · get involved · volunteer', [
        ['Voting and paying taxes are among a citizen\'s ___.', 'duties'],
        ['A good citizen respects other people\'s ___.', 'rights'],
        ['She gives money to a ___ that helps orphans.', 'charity'],
        ['Young people should ___ in their community.', 'get involved'],
        ['I want to ___ at the hospital this summer.', 'volunteer'],
      ]),
      grammar: grammar([
        ['Three tonnes of rubbish ___ (collect) last summer.', 'were collected'],
        ['Salma enjoys ___ (help) others.', 'helping'],
        ['If more people volunteered, our town ___ (be) cleaner.', 'would be'],
        ['Salma ___ (join) the association two years ago.', 'joined'],
        ['They ___ (work) for three hours when it started to rain.', 'had been working / had worked'],
        ['"We need more help," the president said. → The president said that they ___ more help.', 'needed'],
      ]),
      functions: functions([
        ['Thank your neighbour for helping your family after the storm.', 'Thank you very much for helping us. I really appreciate it.'],
        ['Your friend\'s house was damaged by a flood. Express sympathy.', 'I\'m so sorry to hear that. That must be hard for you.'],
        ['"How about collecting old clothes for poor families?" → function?', 'making a suggestion'],
        ['"I\'m really sorry for missing the meeting." → function?', 'apologizing'],
      ]),
    },
    writing: { points: 10, topics: [
      'Write an essay of about 180 words on the benefits of volunteering for young people.',
      'Write a letter to your headmaster suggesting a project that students could do to help your community.',
    ] },
  },

  {
    n: 5, titleEn: 'Brain drain', titleAr: 'هجرة الأدمغة', textTitle: 'Coming home',
    text: [
      'When Karim graduated from an engineering school in Rabat in 2015, he had only one idea in his head: to leave. Like many of his classmates, he sent applications to companies in France, Germany and Canada. Three months later, he was working as a software engineer in Montreal.',
      'Karim\'s story is not unusual. Every year, hundreds of Moroccan engineers and doctors leave the country. They are attracted by higher salaries, modern equipment and better career opportunities. For their families, it is a source of pride; for the country, it is a loss of talent that took years of public money to train.',
      'However, the flow does not go in one direction only. After eight years in Canada, Karim decided to come back. "I missed my family and my country," he explains. "And I realized that Morocco needed people like me more than Canada did." Today he runs a start-up in Casablanca that employs fifteen young developers.',
      'Experts believe that returning migrants can play a key role in development. They bring back experience, international contacts and new ways of working. To attract them, some countries offer tax advantages and help with setting up businesses.',
      'Brain drain may never stop completely, but stories like Karim\'s show that it can turn into "brain gain".',
    ],
    reading: {
      tf: tf([
        ['Karim wanted to stay in Morocco after his studies.', 'F – "he had only one idea in his head: to leave"'],
        ['Very few Moroccan engineers leave the country.', 'F – "hundreds of Moroccan engineers and doctors leave the country"'],
        ['Karim came back because he missed his family.', 'T – "I missed my family and my country"'],
        ['Karim\'s company employs fifteen people.', 'T – "employs fifteen young developers"'],
      ]),
      answer: answer([
        ['Why do engineers and doctors leave Morocco? (two reasons)', 'Any two: higher salaries, modern equipment, better career opportunities.'],
        ['Why is brain drain a loss for the country?', 'Because the country spent years of public money to train them.'],
        ['What do returning migrants bring back?', 'Experience, international contacts and new ways of working.'],
      ]),
      words: find([
        ['finished his studies (§1) = ___', 'graduated'],
        ['chances (§2) = ___', 'opportunities'],
        ['manages (§3) = ___', 'runs'],
        ['very important (§4) = ___', 'key'],
      ]),
      reference: refer([
        ['"They" (§2) → ___', 'Moroccan engineers and doctors'],
        ['"that" (§3) → ___', 'a start-up in Casablanca'],
        ['"them" (§4) → ___', 'returning migrants'],
      ]),
      title: best(['Life in Canada', 'From brain drain to brain gain', 'How to become an engineer'], 'b) From brain drain to brain gain'),
    },
    language: {
      vocab: vocab('abroad · homesick · skilled · qualifications · emigrate', [
        ['Many young people dream of studying ___.', 'abroad'],
        ['Karim felt ___ because he missed his family.', 'homesick'],
        ['Doctors and engineers are ___ workers.', 'skilled'],
        ['Her ___ include a master\'s degree in physics.', 'qualifications'],
        ['Thousands of graduates ___ every year to find better jobs.', 'emigrate'],
      ]),
      grammar: grammar([
        ['If Karim had stayed in Canada, he ___ (not / create) his company.', 'wouldn\'t have created'],
        ['Karim ___ (work) in Montreal for eight years before he came back.', 'had worked / had been working'],
        ['He is used to ___ (work) long hours.', 'working'],
        ['Many doctors ___ (attract) by higher salaries abroad.', 'are attracted'],
        ['___ he earned a lot in Canada, he decided to return. (Although / Because)', 'Although'],
        ['He said that he ___ (miss) his family.', 'missed / had missed'],
      ]),
      functions: functions([
        ['Your cousin wants to emigrate. Give your opinion.', 'In my opinion, he should stay and help his country. / I think…'],
        ['Your friend says brain drain is good for Morocco. Disagree.', 'I\'m afraid I don\'t agree. It is a loss of talent.'],
        ['"I wish I had stayed in Morocco." → function?', 'expressing regret'],
        ['"Do you mind if I sit here?" → function?', 'asking for permission'],
      ]),
    },
    writing: { points: 10, topics: [
      'Would you like to study or work abroad after the Bac? Write an essay of about 180 words explaining your choice.',
      'Write an email to a friend who lives abroad telling him/her about the changes in your town since he/she left.',
    ] },
  },
]

/** Every scored part of an exam, in order (used for points and the online version). */
export const mockParts = (m: MockExam): MockPart[] => [
  m.reading.tf, m.reading.answer, m.reading.words, m.reading.reference, m.reading.title,
  m.language.vocab, m.language.grammar, m.language.functions,
]
export const mockTotal = (m: MockExam) => mockParts(m).reduce((s, p) => s + p.points, 0) + m.writing.points

const pts = (n: number) => `(${n} ${n === 1 ? 'pt' : 'pts'})`
const part = (p: MockPart): Block => ex(`${p.title} ${pts(p.points)}`, p.instr ?? '', p.items, { lines: p.lines, cols: p.cols })

export const mockPages = (m: MockExam): BacPage[] => [
  page('exam', `Mock exam ${m.n}`, m.titleEn, m.titleAr, [
    { t: 'sub', text: 'Part I · Reading comprehension (15 pts)' },
    { t: 'text', label: `Text - ${m.textTitle}`, size: 12.5, body: m.text.join('\n') },
    part(m.reading.tf),
    part(m.reading.answer),
    { t: 'row', widths: '1fr 1fr', blocks: [[part(m.reading.words)], [part(m.reading.reference), part(m.reading.title)]] },
  ]),
  page('exam', `Mock exam ${m.n}`, `${m.titleEn} (continued)`, m.titleAr, [
    { t: 'sub', text: 'Part II · Language (15 pts)' },
    part(m.language.vocab),
    part(m.language.grammar),
    part(m.language.functions),
    { t: 'sub', text: `Part III · Writing (${m.writing.points} pts)` },
    { t: 'bullets', size: 12.5, items: ['Choose ONE of the two topics. - اختر موضوعًا واحدًا فقط.', ...m.writing.topics.map((t, i) => `Topic ${i + 1}: ${t}`)] },
    { t: 'callout', text: 'اكتب في ورقة التحرير. خصّص حوالي 30 دقيقة للكتابة، ثم راجع عملك بالقائمة في صفحة Writing 5.' },
  ]),
]

export const BAC_EXAMS: BacPage[] = BAC_MOCKS.flatMap(mockPages)
