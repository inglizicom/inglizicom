import type { Unit, VocabItem } from './types'

const LOCAL = (slug: string) => `/lessons/unit02/${slug}.jpg`

const PHOTO_STYLE = ', cinematic photograph, soft natural daylight, real person, daily life'
const photo = (prompt: string, seed: number) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + PHOTO_STYLE)}?width=512&height=512&model=turbo&nologo=true&seed=${seed}`

const items: VocabItem[] = [
  { en: 'I wake up at 7 o’clock',          ar: 'أستيقظ في الساعة السابعة',         tint: 'amber',
    image: LOCAL('wake-up-clock'),   imageFallback: photo('alarm clock on bedside table at 7 a.m. morning sunlight', 201) },

  { en: 'I go to the bathroom',            ar: 'أذهب إلى الحمّام',                tint: 'sky',
    image: LOCAL('go-to-bathroom'),  imageFallback: photo('person walking into a clean modern bathroom morning', 202) },

  { en: 'I brush my teeth with toothpaste', ar: 'أفرش أسناني بمعجون الأسنان',     tint: 'sky',
    image: LOCAL('brush-teeth'),     imageFallback: photo('person brushing teeth with toothpaste at bathroom sink mirror', 203) },

  { en: 'I floss my teeth every morning',  ar: 'أستخدم خيط الأسنان كل صباح',      tint: 'teal',
    image: LOCAL('floss'),           imageFallback: photo('person using dental floss at bathroom mirror morning', 204) },

  { en: 'I rinse my mouth with water',     ar: 'أُغرغر فمي بالماء',              tint: 'teal',
    image: LOCAL('rinse-mouth'),     imageFallback: photo('person rinsing mouth with water and a glass at sink', 205) },

  { en: 'I wash my face with cold water',  ar: 'أغسل وجهي بماء بارد',            tint: 'sky',
    image: LOCAL('wash-face'),       imageFallback: photo('person splashing cold water on face at bathroom sink morning', 206) },

  { en: 'I take a shower with hot water',  ar: 'أستحمّ بماء ساخن',                tint: 'rose',
    image: LOCAL('shower'),          imageFallback: photo('shower head spraying hot water in bathroom steam', 207) },

  { en: 'I use shampoo for my hair',       ar: 'أستخدم الشامبو لشعري',           tint: 'violet',
    image: LOCAL('shampoo'),         imageFallback: photo('shampoo bottle in bathroom shower hands lathering', 208) },

  { en: 'I use a towel to dry my body',    ar: 'أستخدم المنشفة لتجفيف جسمي',     tint: 'amber',
    image: LOCAL('towel-dry'),       imageFallback: photo('person drying with a soft towel after shower in bathroom', 209) },

  { en: 'I comb my hair with a brush',     ar: 'أمشّط شعري باستخدام الفرشاة',    tint: 'violet',
    image: LOCAL('comb-hair'),       imageFallback: photo('person combing hair in front of bathroom mirror with brush', 210) },

  { en: 'I see myself in the mirror',      ar: 'أنظر إلى نفسي في المرآة',         tint: 'sky',
    image: LOCAL('mirror'),          imageFallback: photo('person looking at themselves in a bathroom mirror morning', 211) },

  { en: 'I put on deodorant',              ar: 'أضع مزيل العرق',                  tint: 'emerald',
    image: LOCAL('deodorant'),       imageFallback: photo('person applying deodorant in bathroom getting ready', 212) },

  { en: 'I dry my hair with a hairdryer',  ar: 'أجفف شعري بمجفف الشعر',           tint: 'rose',
    image: LOCAL('hairdryer'),       imageFallback: photo('woman drying her hair with a hairdryer in bathroom', 213) },

  { en: 'I shave my beard with a razor',   ar: 'أحلق لحيتي بشفرة الحلاقة',        tint: 'orange',
    image: LOCAL('shave'),           imageFallback: photo('man shaving beard with razor in front of bathroom mirror morning', 214) },
]

export const unit02: Unit = {
  id: 2,
  slug: 'bathroom',
  emoji: '🛁',
  level: 'A1 – A2',
  title: { en: 'In the Bathroom', ar: 'في الحمّام' },
  sections: [
    { kind: 'cover' },
    { kind: 'vocab', title: 'مفردات الحمّام', items },
    {
      kind: 'staticSentences',
      title: 'جمل ثابتة قابلة للتغيير',
      patterns: [
        {
          template: 'I always + [verb] + in the morning',
          templateAr: 'أنا دائماً + (فعل) + في الصباح',
          examples: [
            'I always brush my teeth in the morning.',
            'I always take a shower in the morning.',
          ],
        },
        {
          template: 'I use + (object) + to + (verb)',
          templateAr: 'أنا أستعمل + (شيء) + لكي + (فعل)',
          examples: [
            'I use a toothbrush to brush my teeth.',
            'I use a hairdryer to dry my hair.',
          ],
        },
        {
          template: 'I don’t + (verb) + at night.',
          templateAr: 'أنا لا + (فعل) + ليلاً',
          examples: [
            'I don’t wash my face at night.',
            'I don’t go to the bathroom at night.',
          ],
        },
        {
          template: 'First, I + (verb) … Then I + (verb)',
          templateAr: 'أولاً، أنا + (فعل) … ثم، أنا + (فعل)',
          examples: [
            'First, I wash my face. Then, I have breakfast.',
            'First, I floss my teeth. Then, I rinse my mouth.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Karim & Layla — sharing the bathroom',
      lines: [
        { speaker: 'Karim', text: 'Layla, are you in the bathroom?' },
        { speaker: 'Layla', text: 'Yes, just one minute!' },
        { speaker: 'Karim', text: 'I need to brush my teeth before school.' },
        { speaker: 'Layla', text: "Okay, I'm finished. Come in." },
        { speaker: 'Karim', text: 'Did you take a shower already?' },
        { speaker: 'Layla', text: 'Yes, with hot water. I love it.' },
        { speaker: 'Karim', text: 'I take a shower at night. In the morning, I just wash my face.' },
        { speaker: 'Layla', text: 'Do you use floss?' },
        { speaker: 'Karim', text: 'Yes, every morning. It is good for the teeth.' },
        { speaker: 'Layla', text: 'Where is the towel?' },
        { speaker: 'Karim', text: "It's on the door. Did you use the hairdryer?" },
        { speaker: 'Layla', text: 'Yes, for ten minutes. My hair is dry now.' },
        { speaker: 'Karim', text: "Don't forget the deodorant." },
        { speaker: 'Layla', text: 'I always put it on. Do you?' },
        { speaker: 'Karim', text: 'Of course! Okay, see you at breakfast.' },
        { speaker: 'Layla', text: 'See you, Karim. Hurry up!' },
      ],
    },
    { kind: 'review', title: 'مراجعة سريعة — خمّن الجملة', items },
  ],
}
