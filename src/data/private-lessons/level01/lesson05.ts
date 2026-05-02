import type { Unit } from '../types'

const LOCAL = (slug: string) => `/lessons/lv1/05/${slug}.jpg`

export const lesson05: Unit = {
  id: 105,
  slug: 'l1-family',
  emoji: '👨‍👩‍👧‍👦',
  level: 'A0 – A1',
  title: { en: 'The Family Tree', ar: 'شجرة العائلة والعلاقات' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'vocab',
      title: 'أفراد العائلة',
      items: [
        { en: 'Father', ar: 'الأب', examples: ['My father is a doctor.', 'My father is 55 years old.'], tint: 'amber', image: LOCAL('father') },
        { en: 'Mother', ar: 'الأم', examples: ['My mother is a teacher.', 'My mother is very kind.'], tint: 'rose', image: LOCAL('mother') },
        { en: 'Brother', ar: 'الأخ', examples: ['I have one brother.', 'My brother is 20 years old.'], tint: 'sky', image: LOCAL('brother') },
        { en: 'Sister', ar: 'الأخت', examples: ['I have two sisters.', 'My sister lives in Rabat.'], tint: 'violet', image: LOCAL('sister') },
        { en: 'Husband', ar: 'الزوج', examples: ['My husband is an engineer.', 'Her husband is 35 years old.'], tint: 'emerald', image: LOCAL('husband') },
        { en: 'Wife', ar: 'الزوجة', examples: ["My wife is a nurse.", "His wife is a teacher."], tint: 'emerald', image: LOCAL('wife') },
        { en: 'Son', ar: 'الابن', examples: ['I have one son.', 'My son is 7 years old.'], tint: 'sky', image: LOCAL('son') },
        { en: 'Daughter', ar: 'الابنة', examples: ['I have two daughters.', 'My daughter is 5 years old.'], tint: 'rose', image: LOCAL('daughter') },
        { en: 'Grandfather', ar: 'الجد', examples: ['My grandfather is 70 years old.', 'My grandfather lives in the village.'], tint: 'amber', image: LOCAL('grandfather') },
        { en: 'Grandmother', ar: 'الجدة', examples: ['My grandmother is very kind.', 'I visit my grandmother on Friday.'], tint: 'amber', image: LOCAL('grandmother') },
        { en: 'Uncle', ar: 'العم / الخال', examples: ['My uncle is a farmer.', 'My uncle lives in Fez.'], tint: 'emerald', image: LOCAL('uncle') },
        { en: 'Aunt', ar: 'العمة / الخالة', examples: ['My aunt lives in Casablanca.', 'My aunt is a doctor.'], tint: 'teal', image: LOCAL('aunt') },
        { en: 'Cousin', ar: 'ابن العم / ابنة الخال', examples: ['My cousin is married.', 'She is my cousin.'], tint: 'violet', image: LOCAL('cousin') },
        { en: 'Nephew', ar: 'ابن الأخ أو الأخت', examples: ['My nephew is 3 years old.'], tint: 'sky', image: LOCAL('nephew') },
        { en: 'Niece', ar: 'بنت الأخ أو الأخت', examples: ['My niece goes to school.'], tint: 'sky', image: LOCAL('niece') },
      ],
    },
    {
      kind: 'vocab',
      title: 'صفات الشخصية والمظهر',
      items: [
        { en: 'Tall', ar: 'طويل', examples: ['My father is tall.', 'He is tall and strong.'], tint: 'amber', image: LOCAL('tall') },
        { en: 'Short', ar: 'قصير', examples: ['My sister is short.', 'She is short but fast.'], tint: 'orange', image: LOCAL('short') },
        { en: 'Old', ar: 'كبير في السن', examples: ['My grandfather is old.', 'He is old but very active.'], tint: 'violet', image: LOCAL('old') },
        { en: 'Young', ar: 'صغير / شاب', examples: ['My brother is young.', 'She looks very young.'], tint: 'emerald', image: LOCAL('young') },
        { en: 'Friendly', ar: 'ودود', examples: ['My mother is very friendly.', 'She is friendly and kind.'], tint: 'sky', image: LOCAL('friendly') },
        { en: 'Funny', ar: 'مضحك', examples: ['My brother is funny.', 'He always makes us laugh.'], tint: 'rose', image: LOCAL('funny') },
        { en: 'Smart', ar: 'ذكي', examples: ['My sister is very smart.', 'He is smart and hardworking.'], tint: 'violet', image: LOCAL('smart') },
        { en: 'Generous', ar: 'كريم', examples: ['My uncle is very generous.', 'She is generous and kind.'], tint: 'teal', image: LOCAL('generous') },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'أسئلة عن العائلة',
      patterns: [
        {
          template: "What is your brother's name?  →  His name is ___.",
          templateAr: 'ما اسم أخيك؟  →  اسمه ___.',
          examples: [
            "What is your brother's name? — His name is Youssef.",
            "What is your sister's name? — Her name is Sara.",
          ],
        },
        {
          template: 'How old is your brother / sister?  →  He / She is ___ years old.',
          templateAr: 'كم عمر أخيك / أختك؟  →  عمره / عمرها ___ سنة.',
          examples: [
            'How old is your brother? — He is 22 years old.',
            'How old is your sister? — She is 18 years old.',
          ],
        },
        {
          template: 'Where does he / she live?  →  He / She lives in ___.',
          templateAr: 'أين يسكن / تسكن؟  →  يسكن / تسكن في ___.',
          examples: [
            'Where does your brother live? — He lives in Casablanca.',
            'Where does your sister live? — She lives in Rabat.',
          ],
        },
        {
          template: 'What does he / she do?  →  He / She is a ___.',
          templateAr: 'ماذا يعمل / تعمل؟  →  هو / هي ___.',
          examples: [
            'What does your brother do? — He is an engineer.',
            'What does your sister do? — She is a student.',
          ],
        },
      ],
    },
    {
      kind: 'staticSentences',
      title: 'كيف تتحدث عن عائلتك',
      patterns: [
        {
          template: 'How many people are there in your family?  →  There are ___ in my family.',
          templateAr: 'كم عدد أفراد عائلتك؟  →  في عائلتي ___ أشخاص.',
          examples: [
            'How many people are there in your family? — There are five in my family.',
            'There are four people in my family.',
          ],
        },
        {
          template: 'Who are they?  →  They are my ___.',
          templateAr: 'من هم؟  →  هم + أفراد العائلة.',
          examples: [
            'They are my parents, my brother, and my sister.',
            'They are my parents and my two brothers.',
            'They are my wife and my two kids.',
          ],
        },
        {
          template: 'My [family member] is [adjective].',
          templateAr: 'وصف أحد أفراد العائلة',
          examples: [
            'My brother is tall and smart.',
            'My mother is kind and generous.',
            'My sister is funny and friendly.',
          ],
        },
      ],
    },
    {
      kind: 'conversation',
      title: 'Omar & Sara — talking about family',
      lines: [
        { speaker: 'Omar', text: 'Sara, do you have brothers or sisters?' },
        { speaker: 'Sara', text: 'I have one brother. His name is Karim.' },
        { speaker: 'Omar', text: 'Oh! How old is he?' },
        { speaker: 'Sara', text: 'He is twenty-two. He lives in Rabat. And you — do you have brothers?' },
        { speaker: 'Omar', text: 'Yes, two brothers. And one sister.' },
        { speaker: 'Sara', text: 'Big family! What is your sister like?' },
        { speaker: 'Omar', text: 'She is young — seventeen. She is very funny.' },
        { speaker: 'Sara', text: 'How many people are in your family?' },
        { speaker: 'Omar', text: 'We are six at home. My parents, my two brothers, my sister and me.' },
        { speaker: 'Sara', text: 'I love big families. My father is tall and very generous.' },
        { speaker: 'Omar', text: 'My mother is the same — tall and generous. And my father is smart.' },
        { speaker: 'Sara', text: 'Is your brother married?' },
        { speaker: 'Omar', text: 'No, he is single. He is twenty years old.' },
        { speaker: 'Sara', text: 'See you tomorrow, Omar.' },
        { speaker: 'Omar', text: 'See you, Sara!' },
      ],
    },
  ],
}
