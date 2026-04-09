// ─── Journey: Moroccan cities → units ────────────────────────────────────────
// Each city contains 1-3 units. unit.id MUST match a key in LESSONS_MAP.

export interface JourneyUnit {
  id: string           // matches LessonData.id
  title: string
  title_ar: string
  emoji: string
  xp: number
  desc_ar: string
}

export interface JourneyCity {
  id: string
  name: string
  name_ar: string
  cefr: 'A0' | 'A1' | 'A2' | 'B1' | 'B2'
  color: string
  emoji: string
  desc_ar: string
  units: JourneyUnit[]
}

export const JOURNEY_CITIES: JourneyCity[] = [
  {
    id: 'oued-zem', name: 'Oued Zem', name_ar: 'واد زم',
    cefr: 'A0', color: '#10b981', emoji: '🌱',
    desc_ar: 'بداية رحلتك — أول كلمات إنجليزية',
    units: [
      { id: 'greetings',     title: 'Greetings',      title_ar: 'التحيات',    emoji: '👋', xp: 50,  desc_ar: 'Hello, Hi, Good morning...' },
      { id: 'introductions', title: 'Introductions',   title_ar: 'التعارف',   emoji: '🤝', xp: 60,  desc_ar: 'My name is, I am from...' },
    ],
  },
  {
    id: 'khouribga', name: 'Khouribga', name_ar: 'خريبكة',
    cefr: 'A1', color: '#3b82f6', emoji: '❓',
    desc_ar: 'تعلم كيف تسأل عن أي شيء',
    units: [
      { id: 'questions', title: 'Basic Questions', title_ar: 'أسئلة أساسية', emoji: '❓', xp: 70, desc_ar: 'What, Where, When, Who...' },
      { id: 'numbers',   title: 'Numbers',          title_ar: 'الأرقام',      emoji: '🔢', xp: 70, desc_ar: '1-100, prices, ages...' },
    ],
  },
  {
    id: 'beni-mellal', name: 'Beni Mellal', name_ar: 'بني ملال',
    cefr: 'A1', color: '#f97316', emoji: '⏰',
    desc_ar: 'تحدث عن وقتك ويومك',
    units: [
      { id: 'time',    title: 'Time & Dates',  title_ar: 'الوقت والتواريخ', emoji: '⏰', xp: 80, desc_ar: 'What time is it? Days, months...' },
      { id: 'routine', title: 'Daily Routine', title_ar: 'الروتين اليومي',  emoji: '🌅', xp: 80, desc_ar: 'I wake up, I go to work...' },
    ],
  },
  {
    id: 'settat', name: 'Settat', name_ar: 'سطات',
    cefr: 'A1', color: '#f43f5e', emoji: '🍔',
    desc_ar: 'الطعام والمطاعم',
    units: [
      { id: 'food', title: 'Food & Drinks', title_ar: 'الطعام والشراب', emoji: '🍔', xp: 90, desc_ar: 'Order food, talk about taste...' },
    ],
  },
  {
    id: 'el-jadida', name: 'El Jadida', name_ar: 'الجديدة',
    cefr: 'A1', color: '#06b6d4', emoji: '🗺️',
    desc_ar: 'تنقّل في المدينة بثقة',
    units: [
      { id: 'directions', title: 'Directions', title_ar: 'الاتجاهات', emoji: '🗺️', xp: 90, desc_ar: 'Left, right, turn, straight...' },
    ],
  },
  {
    id: 'mohammedia', name: 'Mohammedia', name_ar: 'المحمدية',
    cefr: 'A1', color: '#ec4899', emoji: '🛍️',
    desc_ar: 'تسوق وتحدث بشكل طبيعي',
    units: [
      { id: 'shopping',  title: 'Shopping',   title_ar: 'التسوق',         emoji: '🛍️', xp: 100, desc_ar: 'How much? Can I try? Too expensive!' },
      { id: 'smalltalk', title: 'Small Talk', title_ar: 'محادثة خفيفة',  emoji: '💬', xp: 100, desc_ar: 'Weather, weekend, hobbies...' },
    ],
  },
  {
    id: 'casablanca', name: 'Casablanca', name_ar: 'الدار البيضاء',
    cefr: 'A1', color: '#a855f7', emoji: '🎨',
    desc_ar: 'صف العالم من حولك',
    units: [
      { id: 'colors', title: 'Colors & Descriptions', title_ar: 'الألوان والأوصاف', emoji: '🎨', xp: 110, desc_ar: 'Red, big, beautiful, old, new...' },
    ],
  },
  {
    id: 'rabat', name: 'Rabat', name_ar: 'الرباط',
    cefr: 'A2', color: '#0ea5e9', emoji: '💼',
    desc_ar: 'احترف بيئة العمل',
    units: [
      { id: 'work', title: 'At Work', title_ar: 'في العمل', emoji: '💼', xp: 150, desc_ar: 'Meetings, emails, colleagues...' },
    ],
  },
  {
    id: 'sale', name: 'Salé', name_ar: 'سلا',
    cefr: 'A2', color: '#14b8a6', emoji: '✈️',
    desc_ar: 'السفر والمطارات',
    units: [
      { id: 'travel', title: 'Travel', title_ar: 'السفر', emoji: '✈️', xp: 175, desc_ar: 'Airports, hotels, booking...' },
    ],
  },
  {
    id: 'kenitra', name: 'Kenitra', name_ar: 'القنيطرة',
    cefr: 'A2', color: '#ef4444', emoji: '🏥',
    desc_ar: 'تحدث عن صحتك',
    units: [
      { id: 'health', title: 'Health & Body', title_ar: 'الصحة والجسم', emoji: '🏥', xp: 175, desc_ar: 'Doctor, symptoms, medicine...' },
    ],
  },
  {
    id: 'fes', name: 'Fes', name_ar: 'فاس',
    cefr: 'B1', color: '#d97706', emoji: '🏆',
    desc_ar: 'محادثات متقدمة — المستوى الاحترافي',
    units: [
      { id: 'advanced', title: 'Advanced Conversations', title_ar: 'محادثات متقدمة', emoji: '🏆', xp: 250, desc_ar: 'Opinions, debate, complex topics...' },
    ],
  },
  // ── Coming soon cities (locked, no units yet) ─────────────────────────────
  {
    id: 'meknes', name: 'Meknes', name_ar: 'مكناس',
    cefr: 'B1', color: '#8b5cf6', emoji: '🎭',
    desc_ar: 'قريباً — المشاعر والتعبير عن الرأي',
    units: [],
  },
  {
    id: 'ifrane', name: 'Ifrane', name_ar: 'إفران',
    cefr: 'B1', color: '#6366f1', emoji: '⛰️',
    desc_ar: 'قريباً — الطبيعة والبيئة',
    units: [],
  },
  {
    id: 'tangier', name: 'Tangier', name_ar: 'طنجة',
    cefr: 'B2', color: '#0891b2', emoji: '🌊',
    desc_ar: 'قريباً — محادثات تجارية',
    units: [],
  },
  {
    id: 'marrakech', name: 'Marrakech', name_ar: 'مراكش',
    cefr: 'B2', color: '#dc2626', emoji: '🌹',
    desc_ar: 'قريباً — الثقافة والتاريخ',
    units: [],
  },
  {
    id: 'agadir', name: 'Agadir', name_ar: 'أكادير',
    cefr: 'B2', color: '#ea580c', emoji: '🏄',
    desc_ar: 'قريباً — الترفيه والسياحة',
    units: [],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flat ordered list of all unit IDs (for progress tracking) */
export const ALL_UNIT_IDS: string[] = JOURNEY_CITIES.flatMap(c => c.units.map(u => u.id))

/** CEFR zone groupings */
export const CEFR_META: Record<string, { label: string; color: string; emoji: string; desc: string }> = {
  A0: { label: 'A0', color: '#10b981', emoji: '🌱', desc: 'مبتدئ تماماً' },
  A1: { label: 'A1', color: '#3b82f6', emoji: '🌿', desc: 'مبتدئ' },
  A2: { label: 'A2', color: '#0ea5e9', emoji: '⭐', desc: 'أساسي' },
  B1: { label: 'B1', color: '#8b5cf6', emoji: '🚀', desc: 'متوسط' },
  B2: { label: 'B2', color: '#ec4899', emoji: '💫', desc: 'فوق المتوسط' },
}
