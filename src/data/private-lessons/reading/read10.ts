import type { Unit } from '../types'

export const read10: Unit = {
  id: 210,
  slug: 'r-my-hobbies',
  emoji: '🎯',
  level: 'A0',
  title: { en: 'My Hobbies', ar: 'هواياتي' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'My Hobbies',
      text:
        'My name is Lina. I have many hobbies. When I have free time, I am never bored.\n\n' +
        'I love reading. I read every night before I go to sleep. I read books about travel and people. Reading helps me learn new words in English.\n\n' +
        'I also love drawing. I draw every Saturday morning. I draw people, houses, and animals. My friends say I draw very well.\n\n' +
        'On weekends I sometimes go hiking with my friends. We walk in the mountains. It is difficult but very beautiful. I love nature.\n\n' +
        'I like cooking too. I cook new recipes every week. My favourite dish is chicken with vegetables. My family loves my cooking.\n\n' +
        'My brother has different hobbies. He loves playing football and video games. He plays football every Tuesday and Thursday with his friends.\n\n' +
        'My sister likes travelling. She travels to a new city every summer. She says travelling teaches you more than books.\n\n' +
        'Everyone has a hobby. A hobby makes life more interesting.',
      translations: {
        hobbies: 'هوايات',
        free: 'فارغ',
        time: 'وقت',
        bored: 'ملل',
        reading: 'القراءة',
        books: 'كتب',
        travel: 'السفر',
        helps: 'يساعد',
        learn: 'أتعلم',
        drawing: 'الرسم',
        draw: 'أرسم',
        animals: 'حيوانات',
        hiking: 'المشي في الطبيعة',
        mountains: 'الجبال',
        difficult: 'صعب',
        beautiful: 'جميل',
        nature: 'الطبيعة',
        cooking: 'الطبخ',
        recipes: 'وصفات',
        dish: 'طبق',
        vegetables: 'خضروات',
        different: 'مختلف',
        football: 'كرة القدم',
        video: 'فيديو',
        games: 'ألعاب',
        travelling: 'السفر',
        teaches: 'يعلم',
        everyone: 'الجميع',
        interesting: 'مثير',
        life: 'الحياة',
      },
      vocab: [
        { word: 'hobbies', ar: 'هوايات', note: 'noun — plural of hobby' },
        { word: 'bored', ar: 'يشعر بالملل', note: 'adjective' },
        { word: 'hiking', ar: 'المشي في الطبيعة', note: 'noun' },
        { word: 'nature', ar: 'الطبيعة', note: 'noun' },
        { word: 'recipe', ar: 'وصفة طبخ', note: 'noun' },
        { word: 'dish', ar: 'طبق (أكل)', note: 'noun' },
        { word: 'difficult', ar: 'صعب', note: 'adjective' },
        { word: 'different', ar: 'مختلف', note: 'adjective' },
        { word: 'interesting', ar: 'مثير للاهتمام', note: 'adjective' },
        { word: 'everyone', ar: 'الجميع / كل شخص', note: 'pronoun' },
      ],
      blanks: [
        { before: 'Lina reads every night before she goes to', after: '.', answer: 'sleep', options: ['sleep', 'school', 'work', 'eat'] },
        { before: 'She draws people, houses, and', after: '.', answer: 'animals', options: ['animals', 'cars', 'books', 'trees'] },
        { before: 'On weekends she goes', after: 'with her friends in the mountains.', answer: 'hiking', options: ['hiking', 'swimming', 'shopping', 'cooking'] },
        { before: 'Her favourite dish is chicken with', after: '.', answer: 'vegetables', options: ['vegetables', 'rice', 'bread', 'pasta'] },
        { before: 'Her brother loves playing football and', after: 'games.', answer: 'video', options: ['video', 'chess', 'card', 'board'] },
        { before: 'Her sister says', after: 'teaches you more than books.', answer: 'travelling', options: ['travelling', 'cooking', 'reading', 'drawing'] },
      ],
    },
  ],
}
