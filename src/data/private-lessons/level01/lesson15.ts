import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/15/${slug}.jpg`

export const lesson15: Unit = {
  id: 115,
  slug: 'l1-transport',
  emoji: '🚌',
  level: 'A0 – A1',
  title: { en: 'Means of Transport + This / That', ar: 'وسائل النقل + هذا / تلك' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'وسائل النقل',
      items: [
        { en: 'Car', ar: 'السيارة', examples: ['I go to work by car.', 'My father has a car.'], tint: 'amber', image: LOCAL('car') },
        { en: 'Taxi', ar: 'التاكسي', examples: ['She takes a taxi to school.', 'I take a taxi when it rains.'], tint: 'orange', image: LOCAL('taxi') },
        { en: 'Bus', ar: 'الحافلة', examples: ['I go to school by bus.', 'The bus stops here.'], tint: 'sky', image: LOCAL('bus') },
        { en: 'Train', ar: 'القطار', examples: ['I take the train to Casablanca.', 'The train is fast.'], tint: 'sky', image: LOCAL('train') },
        { en: 'Subway / Metro', ar: 'مترو الأنفاق', examples: ['She takes the metro every day.', 'The metro is cheap.'], tint: 'violet', image: LOCAL('metro') },
        { en: 'Tram', ar: 'الترام', examples: ['He takes the tram to work.', 'The tram is on time.'], tint: 'violet', image: LOCAL('tram') },
        { en: 'Bicycle', ar: 'الدراجة الهوائية', examples: ['I ride my bicycle on weekends.', 'Cycling is healthy.'], tint: 'emerald', image: LOCAL('bicycle') },
        { en: 'Motorcycle', ar: 'الدراجة النارية', examples: ['He rides a motorcycle to work.', 'Motorcycles are fast.'], tint: 'rose', image: LOCAL('motorcycle') },
        { en: 'Airplane', ar: 'الطائرة', examples: ['I fly by airplane to France.', 'The airplane is big.'], tint: 'teal', image: LOCAL('airplane') },
        { en: 'Ship', ar: 'السفينة', examples: ['The ship is very big.', 'We travel by ship to Spain.'], tint: 'sky', image: LOCAL('ship') },
        { en: 'Boat', ar: 'القارب', examples: ['He has a small boat.', 'We go fishing by boat.'], tint: 'sky', image: LOCAL('boat') },
        { en: 'Truck', ar: 'الشاحنة', examples: ['The truck carries food.', 'The truck is very big.'], tint: 'amber', image: LOCAL('truck') },
        { en: 'Van', ar: 'الفان', examples: ['The van carries furniture.', 'He drives a white van.'], tint: 'amber', image: LOCAL('van') },
        { en: 'Skateboard', ar: 'لوح التزلج', examples: ['He uses a skateboard in the park.', 'Young people like skateboards.'], tint: 'violet', image: LOCAL('skateboard') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'هذا / تلك / هؤلاء / أولئك',
      patterns: [
        {
          template: 'THIS — مفرد + قريب',
          templateAr: 'هذا / هذه — شيء قريب منك',
          examples: ['This is my bicycle.', 'This is a bus.', 'This is my taxi.'],
        },
        {
          template: 'THAT — مفرد + بعيد',
          templateAr: 'ذلك / تلك — شيء بعيد عنك',
          examples: ['That is a train.', "That is my father's car.", 'That is a big ship.'],
        },
        {
          template: 'THESE — جمع + قريب',
          templateAr: 'هذه — أشياء كثيرة قريبة منك',
          examples: ['These are buses.', 'These are my keys.', 'These are taxis.'],
        },
        {
          template: 'THOSE — جمع + بعيد',
          templateAr: 'تلك / أولئك — أشياء كثيرة بعيدة',
          examples: ['Those are trains.', 'Those are the buses to the city.'],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Salma & Adam — talking about how they get around',
      lines: [
        { speaker: 'Salma', text: 'Adam — how do you go to school every day?' },
        { speaker: 'Adam',  text: 'By bus. It is easy. And you?' },
        { speaker: 'Salma', text: 'I walk — my school is near my house.' },
        { speaker: 'Adam',  text: 'Oh nice! What is this here — is this your bicycle?' },
        { speaker: 'Salma', text: 'Yes! This is my bicycle. I use it on weekends.' },
        { speaker: 'Adam',  text: 'And that car over there — is it yours?' },
        { speaker: 'Salma', text: "No, that is my father's car. Those are school buses." },
        { speaker: 'Adam',  text: 'These buses go to the city?' },
        { speaker: 'Salma', text: 'Yes. They go every hour.' },
        { speaker: 'Adam',  text: 'Do you like trains? I love the train.' },
        { speaker: 'Salma', text: 'Me too — fast and comfortable.' },
        { speaker: 'Adam',  text: 'See you tomorrow, Salma.' },
        { speaker: 'Salma', text: 'Goodbye, Adam!' },
      ],
    },
  ],
}
