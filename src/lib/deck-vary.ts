/**
 * Per-phrase interchangeable words for the teaching deck's "Change the word" box.
 * Each entry is specific to a phrase/concept so different phrases get DIFFERENT,
 * logical words (not one shared list). Ordered specific → general; the first
 * match wins. Returns null when there's no sensible variation (box is hidden).
 * Pure module — safe to import in both the client deck and the server export.
 */
export type Variation = { label: string; ar: string; words: string[] }

const T = (label: string, ar: string, words: string[]) => ({ label, ar, words })
const TIME = (...w: string[]) => T('Add a time / how often', 'أضف وقتاً', w)
const SWAP = (...w: string[]) => T('Change the word', 'غيّر الكلمة', w)
const ITEM = (...w: string[]) => T('Change the order', 'غيّر الطلب', w)

const RULES: { test: RegExp; v: Variation }[] = [
  // ── At home: morning routine ──
  { test: /wake up|get up/i, v: TIME("at 6 o'clock", "at 7 o'clock", 'early', 'late') },
  { test: /go to bed/i, v: TIME('early', 'late', 'at 10 o\'clock', 'at midnight') },
  { test: /make (my )?bed/i, v: TIME('every morning', 'every day', 'quickly') },
  { test: /wash (my )?face/i, v: SWAP('with cold water', 'with warm water', 'in the morning') },
  { test: /brush (my )?teeth/i, v: TIME('in the morning', 'after meals', 'twice a day') },
  { test: /take a shower/i, v: SWAP('in the morning', 'at night', 'with hot water', 'quickly') },
  { test: /get dressed/i, v: SWAP('quickly', 'for work', 'for school') },
  { test: /comb (my )?hair/i, v: TIME('in the morning', 'after a shower') },
  { test: /have breakfast|eat breakfast/i, v: SWAP('eggs and bread', 'coffee', 'in the kitchen') },
  { test: /make (tea|coffee)|drink (tea|coffee)|cup of/i, v: SWAP('with sugar', 'with milk', 'without sugar') },
  { test: /do the dishes|wash the dishes/i, v: TIME('after lunch', 'after dinner', 'every day') },
  { test: /sweep|vacuum/i, v: SWAP('the kitchen', 'the bedroom', 'every day') },
  { test: /go to work/i, v: SWAP('by bus', 'by car', 'early', 'at 8 o\'clock') },
  { test: /go to school/i, v: SWAP('by bus', 'on foot', 'early') },
  { test: /watch tv|watch television/i, v: SWAP('in the evening', 'with my family', 'for an hour') },
  { test: /come back home/i, v: SWAP('at 6 o\'clock', 'from work', 'from school') },
  // ── Bathroom ──
  { test: /floss/i, v: TIME('every day', 'after meals') },
  { test: /rinse (my )?mouth/i, v: SWAP('with water', 'after brushing') },
  { test: /shampoo/i, v: TIME('every day', 'twice a week') },
  { test: /shave/i, v: TIME('every morning', 'every two days') },
  { test: /deodorant/i, v: TIME('every morning', 'after a shower') },
  // ── Kitchen ──
  { test: /open the fridge/i, v: SWAP('for milk', 'for eggs', 'for water') },
  { test: /boil water/i, v: SWAP('for tea', 'for pasta', 'for coffee') },
  { test: /cut vegetables|chopping/i, v: SWAP('tomatoes', 'onions', 'carrots') },
  { test: /fry eggs/i, v: SWAP('two eggs', 'with oil', 'for breakfast') },
  { test: /make a sandwich/i, v: SWAP('with cheese', 'with tomato', 'with eggs') },
  { test: /cook rice/i, v: SWAP('with vegetables', 'with fish', 'with potatoes') },
  { test: /clean the kitchen/i, v: TIME('every night', 'after cooking') },
  // ── Café / restaurant ──
  { test: /a table for/i, v: SWAP('one', 'two', 'three', 'four') },
  { test: /no onions/i, v: SWAP('no salt', 'no sugar', 'no ice') },
  { test: /can i have|i'?d like|i want the|i'?ll have|do you have (chicken|grilled|the)/i, v: ITEM('a coffee', 'a tea', 'an orange juice', 'a sandwich', 'a cake') },
  // ── Shopping ──
  { test: /kilo|grams/i, v: T('Change the amount', 'غيّر الكمية', ['half a kilo', 'one kilo', 'two kilos', '250 grams']) },
  { test: /where can i find|i'?m looking for/i, v: SWAP('the milk', 'the rice', 'the bread', 'the eggs') },
  { test: /(brown|white|fresh) bread|baguette/i, v: SWAP('white bread', 'brown bread', 'a baguette') },
  { test: /croissants?/i, v: SWAP('plain', 'chocolate', 'two croissants') },
  // ── Clothes ──
  { test: /in size|size (m|l|s)/i, v: T('Change the size', 'غيّر المقاس', ['size S', 'size M', 'size L', 'size XL']) },
  { test: /in (black|white|red|blue)|the color/i, v: T('Change the color', 'غيّر اللون', ['black', 'white', 'blue', 'gray']) },
  { test: /too (big|small|tight)/i, v: SWAP('big', 'small', 'tight', 'long') },
  { test: /try (it|this).*on/i, v: SWAP('the jacket', 'the shirt', 'the shoes') },
  // ── Laundry ──
  { test: /how much (for|to wash)/i, v: SWAP('a shirt', 'a blanket', 'trousers') },
  { test: /pick (them )?up|get them today/i, v: SWAP('today', 'tomorrow', 'after 2 o\'clock') },
  // ── Clinic ──
  { test: /i have (a|no)|i feel|sore throat|stomach|headache|fever|dizzy/i, v: SWAP('a headache', 'a fever', 'a sore throat', 'a stomach ache') },
  { test: /^since|\bsince\b/i, v: SWAP('yesterday', 'this morning', 'two days ago') },
  { test: /it hurts/i, v: SWAP('here', 'in my back', 'in my leg') },
  // ── School ──
  { test: /can i borrow/i, v: SWAP('a pen', 'a book', 'a pencil') },
  { test: /what page/i, v: SWAP('page 10', 'page 15', 'page 20') },
  // ── Travel / services ──
  { test: /book a flight/i, v: SWAP('to Dubai', 'to Istanbul', 'to Paris') },
  { test: /one way|round trip/i, v: SWAP('one way', 'a round trip') },
  { test: /window seat|aisle seat/i, v: SWAP('a window seat', 'an aisle seat') },
  { test: /single room|double room|book a room|how many nights|per night/i, v: SWAP('a single room', 'a double room', 'for two nights', 'for three nights') },
  { test: /to the (train station|airport|hotel)|downtown|i want to go/i, v: T('Change the place', 'غيّر المكان', ['the airport', 'downtown', 'the market', 'the hotel']) },
  { test: /withdraw|deposit|transfer/i, v: T('Change the amount', 'غيّر المبلغ', ['100 dirhams', '500 dirhams', '1000 dirhams']) },
  { test: /savings account|current account|open a/i, v: SWAP('a savings account', 'a current account') },
  // ── General fallbacks for common patterns ──
  { test: /how much is/i, v: SWAP('the ticket', 'the room', 'this jacket', 'the coffee') },
]

export function variationsFor(en: string): Variation | null {
  for (const r of RULES) if (r.test.test(en)) return r.v
  return null
}
