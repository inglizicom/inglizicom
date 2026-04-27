import type { Unit, VocabItem } from './types'

// Each vocab item tries the local image first (drop a JPG into
//   public/lessons/unit01/<slug>.jpg
// and it'll show up automatically). If that file doesn't exist yet, the
// renderer falls back to a Pollinations.ai photo.
const LOCAL = (slug: string) => `/lessons/unit01/${slug}.jpg`

const PHOTO_STYLE = ', cinematic photograph, soft natural daylight, real person, daily life'
const photo = (prompt: string, seed: number) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + PHOTO_STYLE)}?width=512&height=512&model=turbo&nologo=true&seed=${seed}`

const items: VocabItem[] = [
  {
    en: 'I wake up at 7 a.m.',
    ar: 'أستيقظ في الساعة السابعة صباحاً',
    examples: ['I wake up early on weekdays.', 'On Sunday I wake up at 9 a.m.'],
    tint: 'amber',
    image: LOCAL('wake-up'),
    imageFallback: photo('young person waking up stretching in bed, sunlight through window, bedroom morning', 11),
  },
  {
    en: 'I wash my face',
    ar: 'أغسل وجهي',
    examples: ['I wash my face with cold water.', 'I use soap and a clean towel.'],
    tint: 'sky',
    image: LOCAL('wash-face'),
    imageFallback: photo('person washing face with water at bathroom sink, mirror behind, morning routine', 14),
  },
  {
    en: 'I brush my teeth',
    ar: 'أفرش أسناني',
    examples: ['I brush my teeth for two minutes.', 'I use toothpaste and a toothbrush.'],
    tint: 'sky',
    image: LOCAL('brush-teeth'),
    imageFallback: photo('person brushing teeth at bathroom sink, mirror behind, morning routine', 15),
  },
  {
    en: 'I take a shower',
    ar: 'أستحم',
    examples: ['I take a shower with hot water.', 'I use shampoo and soap.'],
    tint: 'teal',
    image: LOCAL('shower'),
    imageFallback: photo('shower head spraying water in clean modern bathroom, steam', 16),
  },
  {
    en: 'I get dressed',
    ar: 'أرتدي ملابسي',
    examples: ['I wear a shirt and jeans.', 'I put on my shoes and my watch.'],
    tint: 'rose',
    image: LOCAL('get-dressed'),
    imageFallback: photo('person putting on a clean shirt in front of a wardrobe, bedroom morning', 17),
  },
  {
    en: 'I have breakfast',
    ar: 'أتناول الفطور',
    examples: ['I eat bread, cheese, and olive oil.', 'I drink tea, coffee, or juice.'],
    tint: 'orange',
    image: LOCAL('breakfast'),
    imageFallback: photo('person eating breakfast at kitchen table, bread cheese coffee, warm morning', 12),
  },
  {
    en: 'I go to school',
    ar: 'أذهب إلى المدرسة',
    examples: ['I walk to school with my friends.', 'My school starts at 8 a.m.'],
    tint: 'amber',
    image: LOCAL('school'),
    imageFallback: photo('student walking to school with backpack on a sunny street, morning', 20),
  },
  {
    en: 'I go to work',
    ar: 'أذهب إلى العمل',
    examples: ['I go to work by bus.', 'My office is in the city center.'],
    tint: 'emerald',
    image: LOCAL('work'),
    imageFallback: photo('professional adult walking to work in business clothes, briefcase, morning street', 21),
  },
  {
    en: 'I have lunch',
    ar: 'أتناول الغداء',
    examples: ['I eat rice with chicken or fish.', 'I drink water with my food.'],
    tint: 'amber',
    image: LOCAL('lunch'),
    imageFallback: photo('family eating lunch at dining table, plates of food, daytime sunlight', 28),
  },
  {
    en: 'I cook dinner',
    ar: 'أطبخ العشاء',
    examples: ['I cook a hot soup or pasta.', 'I cook for my family.'],
    tint: 'rose',
    image: LOCAL('cook-dinner'),
    imageFallback: photo('cooking dinner in cozy kitchen evening, pot on stove, warm light, vegetables', 29),
  },
  {
    en: 'I have dinner',
    ar: 'أتناول العشاء',
    examples: ['I have dinner at 8 p.m.', 'We eat together as a family.'],
    tint: 'orange',
    image: LOCAL('dinner'),
    imageFallback: photo('family dinner at table evening warm lamplight, plates of food, cozy', 30),
  },
  {
    en: 'I wash the dishes',
    ar: 'أغسل الأطباق',
    examples: ['I wash the dishes after dinner.', 'I use soap and warm water.'],
    tint: 'sky',
    image: LOCAL('wash-dishes'),
    imageFallback: photo('person washing dishes at kitchen sink, soap suds, sponge, running water', 33),
  },
  {
    en: 'I do my homework',
    ar: 'أقوم بواجباتي',
    examples: ['I do my homework in my room.', 'It takes about one hour.'],
    tint: 'sky',
    image: LOCAL('homework'),
    imageFallback: photo('student doing homework at desk, notebook open, pen, lamp, evening study', 38),
  },
  {
    en: 'I meet my friends',
    ar: 'ألتقي بأصدقائي',
    examples: ['I meet my friends at the café.', 'We talk and laugh together.'],
    tint: 'violet',
    image: LOCAL('friends'),
    imageFallback: photo('young friends greeting at cafe table, smiling, afternoon', 37),
  },
  {
    en: 'I watch TV',
    ar: 'أشاهد التلفاز',
    examples: ['I watch TV for one hour every day.', 'I like comedy and football.'],
    tint: 'violet',
    image: LOCAL('tv'),
    imageFallback: photo('person watching television on couch with remote, dim living room evening', 41),
  },
  {
    en: 'I go to bed at 10:30 p.m.',
    ar: 'أذهب إلى السرير الساعة العاشرة والنصف',
    examples: ['On weekends I go to bed late.', 'I sleep eight hours every night.'],
    tint: 'sky',
    image: LOCAL('go-to-bed'),
    imageFallback: photo('person lying down in bed pulling covers up at night, bedside lamp on', 43),
  },
]

export const unit01: Unit = {
  id: 1,
  slug: 'morning-routine',
  emoji: '🌅',
  level: 'A1 – A2',
  title: { en: 'My Daily Routine', ar: 'روتيني اليومي' },
  sections: [
    { kind: 'cover' },
    { kind: 'vocab', title: 'مفردات الروتين اليومي', items },
    {
      kind: 'conversation',
      title: 'Sara meets her new classmate Ali',
      lines: [
        { speaker: 'Sara', text: 'Hi! I’m Sara. What’s your name?' },
        { speaker: 'Ali',  text: 'Hi Sara! I’m Ali. Nice to meet you.' },
        { speaker: 'Sara', text: 'What time do you wake up?' },
        { speaker: 'Ali',  text: 'I wake up at seven o’clock. And you?' },
        { speaker: 'Sara', text: 'I wake up at six thirty. Do you have breakfast?' },
        { speaker: 'Ali',  text: 'Yes, I do. I eat bread, cheese, and tea.' },
        { speaker: 'Sara', text: 'I eat eggs and milk. Then I brush my teeth.' },
        { speaker: 'Ali',  text: 'Me too. Do you take a shower in the morning?' },
        { speaker: 'Sara', text: 'No, I take a shower at night.' },
        { speaker: 'Ali',  text: 'I take one in the morning. It wakes me up.' },
        { speaker: 'Sara', text: 'How do you go to school?' },
        { speaker: 'Ali',  text: 'I go to school by bus. And you?' },
        { speaker: 'Sara', text: 'I walk to school. My house is near.' },
        { speaker: 'Ali',  text: 'What do you do after school?' },
        { speaker: 'Sara', text: 'I do my homework, then I help my mother.' },
        { speaker: 'Ali',  text: 'Nice. I watch TV and chat with my family.' },
        { speaker: 'Sara', text: 'What time do you go to bed?' },
        { speaker: 'Ali',  text: 'I go to bed at ten. And you?' },
        { speaker: 'Sara', text: 'I go to bed at nine thirty.' },
        { speaker: 'Ali',  text: 'See you tomorrow, Sara!' },
        { speaker: 'Sara', text: 'See you, Ali. Have a nice day!' },
      ],
    },
    { kind: 'review', title: 'مراجعة سريعة — خمّن الجملة', items },
  ],
}
