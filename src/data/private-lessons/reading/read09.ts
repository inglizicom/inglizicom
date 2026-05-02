import type { Unit } from '../types'

export const read09: Unit = {
  id: 209,
  slug: 'r-getting-around',
  emoji: '🚌',
  level: 'A0',
  title: { en: 'Getting Around', ar: 'التنقل في المدينة' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'reading',
      title: 'Getting Around',
      text:
        'My name is Adam. I live in Casablanca. Getting around the city is easy if you know how.\n\n' +
        'I go to school by bus. The bus stop is near my house — five minutes on foot. The bus comes every fifteen minutes. It is cheap and fast.\n\n' +
        'Sometimes I take a taxi. Taxis are more expensive than the bus, but they are faster. I take a taxi when I am late.\n\n' +
        'My father has a car. He drives to work every morning. He goes to work at seven thirty. I sometimes go with him if school is on his way.\n\n' +
        'My sister rides a bicycle. She goes to the market every Saturday on her bicycle. She says cycling is healthy and fun.\n\n' +
        'I love trains. When I visit my grandmother in Rabat, I take the train. The train is fast and comfortable. The journey takes two hours.\n\n' +
        'This is a car. That is a bicycle. These are buses. Those are taxis. Now you know how people move around in my city!',
      translations: {
        getting: 'التنقل',
        around: 'حول / في المدينة',
        easy: 'سهل',
        bus: 'حافلة',
        stop: 'محطة / موقف',
        near: 'قريب',
        foot: 'سيراً على الأقدام',
        cheap: 'رخيص',
        fast: 'سريع',
        sometimes: 'أحياناً',
        taxi: 'تاكسي',
        expensive: 'غالي',
        late: 'متأخر',
        father: 'الأب',
        car: 'سيارة',
        drives: 'يقود',
        sister: 'الأخت',
        rides: 'تركب',
        bicycle: 'دراجة هوائية',
        market: 'السوق',
        cycling: 'ركوب الدراجة',
        healthy: 'صحي',
        fun: 'ممتع',
        trains: 'القطارات',
        visit: 'أزور',
        grandmother: 'الجدة',
        train: 'القطار',
        comfortable: 'مريح',
        journey: 'الرحلة',
        takes: 'تستغرق',
        move: 'يتنقل',
      },
      vocab: [
        { word: 'bus stop', ar: 'موقف الحافلة', note: 'noun' },
        { word: 'cheap', ar: 'رخيص', note: 'adjective' },
        { word: 'expensive', ar: 'غالي', note: 'adjective' },
        { word: 'late', ar: 'متأخر', note: 'adjective' },
        { word: 'cycling', ar: 'ركوب الدراجة الهوائية', note: 'noun' },
        { word: 'journey', ar: 'رحلة', note: 'noun' },
        { word: 'comfortable', ar: 'مريح', note: 'adjective' },
        { word: 'healthy', ar: 'صحي', note: 'adjective' },
        { word: 'on foot', ar: 'سيراً على الأقدام', note: 'expression' },
        { word: 'on his way', ar: 'في طريقه', note: 'expression' },
      ],
      blanks: [
        { before: 'Adam goes to school by', after: '.', answer: 'bus', options: ['bus', 'car', 'train', 'bicycle'] },
        { before: 'The bus stop is', after: 'his house.', answer: 'near', options: ['near', 'far from', 'behind', 'above'] },
        { before: 'He takes a taxi when he is', after: '.', answer: 'late', options: ['late', 'early', 'happy', 'tired'] },
        { before: 'His sister rides a', after: 'to the market.', answer: 'bicycle', options: ['bicycle', 'car', 'taxi', 'bus'] },
        { before: 'When he visits his grandmother he takes the', after: '.', answer: 'train', options: ['train', 'bus', 'taxi', 'car'] },
        { before: 'The journey to Rabat', after: 'two hours.', answer: 'takes', options: ['takes', 'costs', 'needs', 'wants'] },
      ],
    },
  ],
}
