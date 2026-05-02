import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/17/${slug}.jpg`

export const lesson17: Unit = {
  id: 117,
  slug: 'l1-there-is',
  emoji: '🏙️',
  level: 'A0 – A1',
  title: { en: 'Facilities & There Is / There Are', ar: 'المرافق والمصطلحات — هناك / يوجد' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'المرافق الشائعة',
      items: [
        { en: 'ATM', ar: 'الصراف الآلي', examples: ['Is there an ATM near here?', 'There is an ATM next to the bank.'], tint: 'emerald', image: LOCAL('atm') },
        { en: 'Elevator / Lift', ar: 'المصعد', examples: ['The elevator is on the left.', 'Is there an elevator in this building?'], tint: 'sky', image: LOCAL('elevator') },
        { en: 'Stairs', ar: 'الدرج / السلالم', examples: ['The stairs are next to the elevator.', 'Take the stairs to the second floor.'], tint: 'amber', image: LOCAL('stairs') },
        { en: 'Parking', ar: 'موقف السيارات', examples: ['Is there a parking near here?', 'The parking is behind the building.'], tint: 'violet', image: LOCAL('parking') },
        { en: 'Toilet / Restroom', ar: 'دورة المياه / الحمام', examples: ['Where is the toilet, please?', 'The restroom is on the right.'], tint: 'rose', image: LOCAL('toilet') },
        { en: 'Reception', ar: 'الاستقبال', examples: ['The reception is on the ground floor.', 'Ask at the reception.'], tint: 'sky', image: LOCAL('reception') },
        { en: 'Waiting room', ar: 'غرفة الانتظار', examples: ['Please wait in the waiting room.', 'There is a waiting room on the first floor.'], tint: 'teal', image: LOCAL('waiting-room') },
        { en: 'Security', ar: 'الأمن / الحارس', examples: ['The security guard is at the entrance.', 'Ask the security for help.'], tint: 'violet', image: LOCAL('security') },
        { en: 'Information desk', ar: 'مكتب المعلومات', examples: ['Ask at the information desk.', 'The information desk is in the lobby.'], tint: 'amber', image: LOCAL('info-desk') },
        { en: 'Emergency exit', ar: 'مخرج الطوارئ', examples: ['The emergency exit is on the left.', 'Do not block the emergency exit.'], tint: 'rose', image: LOCAL('emergency-exit') },
        { en: 'WiFi', ar: 'الإنترنت اللاسلكي', examples: ['Is there WiFi here?', 'The WiFi password is on the table.'], tint: 'sky', image: LOCAL('wifi') },
        { en: 'Cafeteria / Canteen', ar: 'الكافيتيريا / المقصف', examples: ['The cafeteria is on the second floor.', 'We eat lunch at the canteen.'], tint: 'orange', image: LOCAL('cafeteria') },
        { en: 'Prayer room', ar: 'غرفة الصلاة', examples: ['Is there a prayer room in this building?', 'The prayer room is on the third floor.'], tint: 'teal', image: LOCAL('prayer-room') },
        { en: 'First aid', ar: 'الإسعافات الأولية', examples: ['Where is first aid?', 'The first aid kit is at reception.'], tint: 'rose', image: LOCAL('first-aid') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'هناك / يوجد — There is / There are',
      patterns: [
        {
          template: 'There is a / an + [facility].',
          templateAr: 'هناك + مرفق مفرد',
          examples: [
            'There is an ATM next to the entrance.',
            'There is an elevator on the left.',
            'There is a prayer room on the third floor.',
          ],
        },
        {
          template: 'There are + [plural noun].',
          templateAr: 'هناك + مرفق جمع',
          examples: [
            'There are two elevators in this building.',
            'There are restrooms on every floor.',
            'There are many parking spaces outside.',
          ],
        },
        {
          template: 'Is there a ___?  →  Yes, there is. / No, there isn\'t.',
          templateAr: 'هل يوجد ___؟  →  نعم / لا',
          examples: [
            'Is there a cafeteria here? — Yes, there is. It\'s on the second floor.',
            'Is there WiFi? — Yes, the password is at reception.',
            'Is there parking? — No, there isn\'t. But there is parking on the next street.',
          ],
        },
        {
          template: 'Where is the ___?  →  It is on the [floor / left / right].',
          templateAr: 'أين ___؟  →  في الطابق / على اليمين / على اليسار.',
          examples: [
            'Where is the elevator? — It is next to the stairs.',
            'Where is the toilet? — It is on the right, next to the waiting room.',
            'Where is the reception? — It is on the ground floor.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Omar & a receptionist — at the hospital',
      lines: [
        { speaker: 'Omar',   text: 'Fatima — I am new here. Is there a toilet on this floor?' },
        { speaker: 'Fatima', text: 'Yes — on the right, next to the stairs.' },
        { speaker: 'Omar',   text: 'Good. And is there an elevator? I am on the third floor.' },
        { speaker: 'Fatima', text: 'Yes, the elevator is next to the stairs too.' },
        { speaker: 'Omar',   text: 'Is there a cafeteria in this building?' },
        { speaker: 'Fatima', text: 'Yes — second floor. The food is good there.' },
        { speaker: 'Omar',   text: 'And WiFi? Is there WiFi?' },
        { speaker: 'Fatima', text: 'Yes — the password is at the reception.' },
        { speaker: 'Omar',   text: 'How many floors are there?' },
        { speaker: 'Fatima', text: 'There are five floors and twenty rooms in total.' },
        { speaker: 'Omar',   text: 'Big building! Thank you, Fatima.' },
        { speaker: 'Fatima', text: 'No problem — welcome here!' },
      ],
    },
  ],
}
