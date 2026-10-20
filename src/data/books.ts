/**
 * The printed books as the public site presents them: three levels (named
 * after Moroccan papers: LA KAART, PIIRMI, VIIZA ENGLISH), three books in
 * each, presented and previewed in the home page's books section
 * (components/site/BooksShowcase.tsx), so a level is described once.
 *
 * Covers are the print files in public/covers/<level>/; inside pages are the
 * captures in public/books/<level>/. No prices here on purpose: the
 * books are presented, then ordered on WhatsApp.
 */

export type BookKind = 'book' | 'workbook' | 'vocab'
export type LevelId = 'lakaart' | 'piirmi' | 'viiza'

export interface SeriesBook {
  kind: BookKind
  en: string
  ar: string
  cover: string
  /** What is inside, in one sentence. */
  about: string
}

export interface BookLevel {
  id: LevelId
  name: string
  ar: string
  cefr: string
  levelAr: string
  colour: string
  tag: string
  /** Who the level is for. */
  forWho: string
  /** What the learner can do at the end of the level. */
  outcomes: string[]
  books: [SeriesBook, SeriesBook, SeriesBook]
}

export const WHATSAPP = '212707902091'

export const BOOK_LEVELS: BookLevel[] = [
  {
    id: 'lakaart', name: 'LA KAART ENGLISH', ar: 'لاكارط إنگليش', cefr: 'A0 → A1', levelAr: 'المستوى الأول', colour: '#2B36C9',
    tag: 'خرّج لاكارط ديالك… بالإنجليزية!',
    forWho: 'لمن يبدأ من الصفر تمامًا، أو نسي كل ما درسه في المدرسة.',
    outcomes: [
      'تقرأ الكلمات الإنجليزية وتنطقها صحيحة',
      'تقدّم نفسك، وتتهجّى اسمك، وتعطي رقم هاتفك',
      'تتكلّم عن عائلتك وبيتك ويومك والساعة',
      'تطلب الأكل والشراب، وتسأل عن الطريق والمواصلات',
      'تفهم أكثر من 760 كلمة من حياتك اليومية',
    ],
    books: [
      { kind: 'book', en: "Student's Book", ar: 'كتاب الطالب', cover: '/covers/lakaart/book-front.jpg',
        about: 'صفحات تمهيدية للحروف والنطق، ثم 19 درسًا، ومراجعة بعد كل ثلاثة دروس، والأجوبة في آخر الكتاب.' },
      { kind: 'workbook', en: 'Workbook', ar: 'كتاب التمارين', cover: '/covers/lakaart/workbook-front.jpg',
        about: 'تمارين لكل درس تثبّت ما تعلّمته، من السهل إلى الأصعب.' },
      { kind: 'vocab', en: 'Vocabulary', ar: 'كتاب المفردات', cover: '/covers/lakaart/vocab-front.jpg',
        about: '762 كلمة جديدة بالصور والجمل، ومحادثتان ونص قصير في كل درس.' },
    ],
  },
  {
    id: 'piirmi', name: 'PIIRMI ENGLISH', ar: 'بيرمي إنگليش', cefr: 'A1 → A2', levelAr: 'المستوى الثاني', colour: '#0E6B4E',
    tag: 'دوّز البيرمي… بالإنجليزية!',
    forWho: 'لمن يعرف الأساسيات ويريد أن يتدبّر أموره في الحياة اليومية.',
    outcomes: [
      'تطلب في المقهى والمطعم، وتتسوّق في السوبرماركت والسوق',
      'تشرح ما بك في الصيدلية وعند الطبيب',
      'تسأل عن الطريق، وتركب الطاكسي والحافلة والقطار',
      'تحجز في الفندق وتتعامل مع البنك',
      'تتكلّم في الهاتف وتكتب رسائل واتساب بالإنجليزية',
    ],
    books: [
      { kind: 'book', en: "Student's Book", ar: 'كتاب الطالب', cover: '/covers/piirmi/book-front.jpg',
        about: '19 وحدة لمواقف الحياة اليومية، من الروتين الصباحي إلى الهاتف وواتساب.' },
      { kind: 'workbook', en: 'Workbook', ar: 'كتاب التمارين', cover: '/covers/piirmi/workbook-front.jpg',
        about: 'تمارين لكل وحدة لتستعمل العبارات حتى تصير لك.' },
      { kind: 'vocab', en: 'Vocabulary', ar: 'كتاب المفردات', cover: '/covers/piirmi/vocab-front.jpg',
        about: 'كلمات كل موقف بالصور والجمل، لتجد الكلمة حين تحتاجها.' },
    ],
  },
  {
    id: 'viiza', name: 'VIIZA ENGLISH', ar: 'فيزا إنگليش', cefr: 'A2 → B1', levelAr: 'المستوى الثالث', colour: '#A3262A',
    tag: 'خود الفيزا… بالإنجليزية!',
    forWho: 'لمن يستعد للسفر أو العمل في الخليج أو أمريكا أو أوروبا.',
    outcomes: [
      'تخطّط لرحلتك، وتملأ الاستمارات، وتحجز التذكرة والفندق',
      'تمرّ من المطار، وتجيب شرطة الحدود والجمارك بثقة',
      'تتدبّر أمورك في الطائرة والفندق والمطعم والمدينة',
      'تتصرّف في الطوارئ: رحلة ملغاة، طبيب، شكوى',
      'تفهم ما تسمعه وتعرف كيف تردّ في 34 موقفًا حقيقيًا',
    ],
    books: [
      { kind: 'book', en: 'Travel Guide', ar: 'دليل السفر', cover: '/covers/viiza/book-front.jpg',
        about: '34 محطة من التخطيط إلى العودة، في الخليج وأمريكا وأوروبا، في ست صفحات لكل محطة.' },
      { kind: 'workbook', en: 'Workbook', ar: 'كتاب التمارين', cover: '/covers/viiza/workbook-front.jpg',
        about: 'تمارين ومهام لكل محطة، ومراجعة بعد كل جزء من الرحلة.' },
      { kind: 'vocab', en: 'Words & Conversations', ar: 'الكلمات والمحادثات', cover: '/covers/viiza/vocab-front.jpg',
        about: '12 كلمة وأربع محادثات لكل محطة: 136 محادثة تسمعها وتعيدها.' },
    ],
  },
]

/**
 * Six inside pages of a level's first book, chosen to show its range (public/books/<id>/01–06.jpg):
 * captured from the current print pages at twice screen resolution, so they stay sharp on a phone.
 */
export const insidePages = (id: LevelId, n = 6) =>
  Array.from({ length: n }, (_, i) => `/books/${id}/${String(i + 1).padStart(2, '0')}.jpg`)

export const orderLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
