/**
 * Deterministic cartoon avatar URL (DiceBear "avataaars") that respects gender
 * and always renders a happy, friendly face — no weird/sad/angry combos.
 *
 * Gender is inferred from the (Arabic or Latin) first name with a best-effort
 * heuristic: an explicit female-name list + Arabic feminine endings (ة / اء).
 * Unknown → male (and many Arabic male names end in -a, so we don't treat a
 * trailing "a" as female).
 */

// Common Arabic / Moroccan female first names (Latin transliterations + Arabic).
const FEMALE = new Set([
  'mariem', 'meriem', 'maryam', 'mariam', 'meryem', 'hajar', 'hagar', 'lamia', 'lamiae', 'lamiaa',
  'fatima', 'fatma', 'fadma', 'fatiha', 'khadija', 'khadicha', 'aicha', 'aisha', 'aycha',
  'sara', 'sarah', 'salma', 'selma', 'nour', 'noor', 'imane', 'iman', 'imen', 'hanae', 'hana', 'hanane',
  'ikram', 'kawtar', 'kaoutar', 'koutar', 'hiba', 'hibat', 'rania', 'asmae', 'asma', 'ghita', 'rita',
  'dounia', 'donia', 'oumaima', 'omaima', 'chaimae', 'chaima', 'zineb', 'zaynab', 'zainab', 'najat',
  'naima', 'samira', 'latifa', 'malak', 'lina', 'yasmine', 'yasmina', 'yassmine', 'soukaina', 'soukayna',
  'wijdane', 'basma', 'douae', 'douaa', 'hind', 'siham', 'widad', 'amal', 'sanae', 'sanaa', 'nada',
  'rim', 'reem', 'jihane', 'jihan', 'btissam', 'ibtissam', 'rachida', 'saida', 'halima', 'karima',
  'nawal', 'loubna', 'lubna', 'hayat', 'israe', 'israa', 'salwa', 'manal', 'hasna', 'wiam', 'rim',
  'chaimaa', 'fadwa', 'ghizlane', 'ghizlan', 'kenza', 'safae', 'safaa', 'soumia', 'soumaya', 'sokaina',
  'nisrine', 'nesrine', 'ilham', 'wafa', 'wafae', 'bouchra', 'najwa', 'nadia', 'samia', 'sabrine', 'sabrina',
  'amina', 'amine', 'asia', 'assia', 'houda', 'hayfa', 'maha', 'mona', 'mouna', 'leila', 'laila', 'layla',
  'rajae', 'raja', 'kawthar', 'meryam', 'oumkeltoum', 'romaisae', 'romaissa', 'aya', 'maryem', 'jana', 'lin',
  // Arabic script
  'مريم', 'هاجر', 'لمياء', 'فاطمة', 'خديجة', 'عائشة', 'سارة', 'سلمى', 'نور', 'إيمان', 'هناء', 'كوثر',
  'هبة', 'رانية', 'أسماء', 'دنيا', 'أميمة', 'شيماء', 'زينب', 'نجاة', 'نعيمة', 'سميرة', 'لطيفة', 'ملك',
  'لينة', 'ياسمين', 'سكينة', 'وجدان', 'بسمة', 'دعاء', 'هند', 'سهام', 'وداد', 'آمال', 'سناء', 'ندى',
  'ريم', 'جيهان', 'ابتسام', 'رشيدة', 'سعيدة', 'حليمة', 'كريمة', 'نوال', 'لبنى', 'حياة', 'إسراء', 'سلوى',
  'منال', 'حسناء', 'فدوى', 'غزلان', 'كنزة', 'صفاء', 'سمية', 'نسرين', 'إلهام', 'وفاء', 'بشرى', 'نجوى',
  'نادية', 'سامية', 'هدى', 'منى', 'ليلى', 'رجاء', 'آية', 'أمينة',
])

// Arabic male names that end in a feminine-looking letter (ى / اء) — exceptions.
const MALE_AR_EXC = new Set(['يحيى', 'مصطفى', 'عيسى', 'موسى', 'زكرياء', 'زكريا'])

function isFemale(name: string): boolean {
  const first = (name || '').trim().split(/\s+/)[0] || ''
  const low = first.toLowerCase()
  if (FEMALE.has(low) || FEMALE.has(first)) return true
  if (MALE_AR_EXC.has(first)) return false
  // Arabic feminine endings: ة (ta marbuta) or اء
  if (/ة$/.test(first) || /اء$/.test(first)) return true
  if (/ى$/.test(first)) return true
  return false
}

const HAPPY = 'mouth=smile&eyes=happy&eyebrows=default&accessoriesProbability=8'
const MALE_TOPS   = 'shortFlat,shortRound,shortWaved,shortCurly,theCaesar,theCaesarAndSidePart,shavedSides,sides,dreads01,fro'
const FEMALE_TOPS = 'longButNotTooLong,straight01,straight02,straightAndStrand,bob,bun,bigHair,curly,curvy,miaWallace'

export function avatarUrl(name: string): string {
  const fem = isFemale(name)
  const seed = encodeURIComponent(name || '?')
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
    + `&radius=50&backgroundColor=f3e6c8,e7dcc8,ffd9a8,d6c4ad`
    + `&topProbability=100&top=${fem ? FEMALE_TOPS : MALE_TOPS}`
    + `&facialHairProbability=${fem ? 0 : 25}`
    + `&${HAPPY}`
}
