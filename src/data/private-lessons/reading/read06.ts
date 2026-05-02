import type { Unit } from '../types'

export const read06: Unit = {
  id: 206,
  slug: 'r-food-and-drinks',
  emoji: '🍽️',
  level: 'A0',
  title: { en: 'Food and Drinks I Love', ar: 'الطعام والمشروبات التي أحبها' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'Food and Drinks I Love',
      text:
        'My name is Lina. I love food. I think about food all the time!\n\n' +
        'For breakfast I always eat eggs and bread. I drink a big glass of milk or orange juice. I never drink coffee in the morning — it is too strong for me.\n\n' +
        'For lunch I love roast chicken with rice and salad. My mother makes the best roast chicken in the world. I eat lunch every day at one o\'clock.\n\n' +
        'In the afternoon I sometimes eat a sandwich or a piece of cake. I drink tea — I love mint tea. It is my favourite drink.\n\n' +
        'For dinner I usually eat pasta or fish. I don\'t like soup. My brother loves soup, but not me.\n\n' +
        'My favourite food is pizza. I eat pizza every Saturday with my family. We order it from a restaurant near our house.\n\n' +
        'I don\'t like very sweet food. I never eat too much — I eat slowly and I enjoy every bite.',
      translations: {
        food: 'الطعام',
        breakfast: 'الفطور',
        eggs: 'البيض',
        bread: 'الخبز',
        glass: 'كأس',
        milk: 'الحليب',
        orange: 'البرتقال',
        juice: 'العصير',
        coffee: 'القهوة',
        strong: 'قوي',
        lunch: 'الغداء',
        roast: 'مشوي',
        chicken: 'الدجاج',
        rice: 'الأرز',
        salad: 'السلطة',
        best: 'الأفضل',
        world: 'العالم',
        afternoon: 'بعد الظهر',
        sandwich: 'ساندويتش',
        cake: 'كعكة',
        tea: 'الشاي',
        mint: 'النعناع',
        favourite: 'المفضل',
        dinner: 'العشاء',
        pasta: 'المعكرونة',
        fish: 'السمك',
        soup: 'الحساء',
        pizza: 'البيتزا',
        order: 'نطلب',
        restaurant: 'مطعم',
        sweet: 'حلو',
        slowly: 'ببطء',
        enjoy: 'أستمتع',
        bite: 'لقمة',
      },
      vocab: [
        { word: 'roast', ar: 'مشوي / محمر', note: 'adjective' },
        { word: 'mint tea', ar: 'شاي بالنعناع', note: 'noun' },
        { word: 'order', ar: 'يطلب (من مطعم)', note: 'verb' },
        { word: 'strong', ar: 'قوي', note: 'adjective' },
        { word: 'slowly', ar: 'ببطء', note: 'adverb' },
        { word: 'enjoy', ar: 'يستمتع', note: 'verb' },
        { word: 'world', ar: 'العالم', note: 'noun' },
        { word: 'sweet', ar: 'حلو', note: 'adjective' },
        { word: 'bite', ar: 'لقمة', note: 'noun' },
        { word: 'soup', ar: 'حساء / شوربة', note: 'noun' },
      ],
      blanks: [
        { before: 'Lina always eats', after: 'and bread for breakfast.', answer: 'eggs', options: ['eggs', 'cake', 'fish', 'pasta'] },
        { before: 'She never drinks coffee because it is too', after: 'for her.', answer: 'strong', options: ['strong', 'sweet', 'cold', 'hot'] },
        { before: 'Her favourite drink is', after: '.', answer: 'mint tea', options: ['mint tea', 'coffee', 'soda', 'milk'] },
        { before: 'For dinner she usually eats pasta or', after: '.', answer: 'fish', options: ['fish', 'pizza', 'rice', 'cake'] },
        { before: 'She eats pizza every', after: 'with her family.', answer: 'Saturday', options: ['Saturday', 'Monday', 'Friday', 'Sunday'] },
        { before: 'She eats', after: '— she enjoys every bite.', answer: 'slowly', options: ['slowly', 'quickly', 'early', 'late'] },
      ],
    },
  ],
}
