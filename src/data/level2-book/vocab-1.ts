import type { L2Vocab } from './types.ts'

/**
 * Module 1's vocabulary, by theme: three groups a unit, each word with its
 * meaning and an example sentence that already uses the unit's grammar;
 * the words that go together («Word partners»); a short exercise.
 */

/* Unit 1 is a ladder unit: its words are in unit-01.ts. */
export const VOCAB_1: Record<number, L2Vocab> = {
  2: {
    groups: [
      { title: 'Childhood - الطفولة', icon: '🧸', words: [
        ['grow up', 'ينشأ', 'I grew up in a small village near Taza.'],
        ['childhood', 'الطفولة', 'I had a happy childhood.'],
        ['primary school', 'المدرسة الابتدائية', 'I went to a primary school near my house.'],
        ['neighbour', 'جار', 'Our neighbours used to give us sweets.'],
        ['hide and seek', 'الغمّيضة', 'We used to play hide and seek in the street.'],
        ['marbles', 'لعبة الكُرات الزجاجية', 'My brother used to play marbles for hours.'],
        ['skipping rope', 'حبل القفز', 'The girls used to play with a skipping rope.'],
        ['pocket money', 'مصروف الجيب', 'I used to get a little pocket money every Friday.'],
        ['strict', 'صارم', 'My father was strict, but very kind.'],
        ['naughty', 'مشاغب', 'I was a naughty child. I never listened!'],
      ] },
      { title: 'Then and now - الماضي والحاضر', icon: '⏳', words: [
        ['in those days', 'في تلك الأيام', "In those days, we didn't have the internet."],
        ['at that time', 'في ذلك الوقت', 'At that time, my father worked in France.'],
        ['nowadays', 'في أيامنا هذه', 'Nowadays, everyone has a phone.'],
        ['not … any more', 'لم يعد', "I don't live there any more."],
        ['still', 'ما زال', 'I still visit my village every summer.'],
        ['change', 'يتغيّر', 'The city changed a lot after 2010.'],
        ['modern', 'حديث', 'Our town is very modern now.'],
        ['traditional', 'تقليدي', 'We had a traditional house with a big patio.'],
      ] },
      { title: 'Life events - أحداث الحياة', icon: '🎓', words: [
        ['be born', 'يولد', 'I was born in 1995.'],
        ['start school', 'يبدأ الدراسة', 'I started school when I was six.'],
        ['finish school', 'ينهي الدراسة', 'She finished school in 2013.'],
        ['move to', 'ينتقل إلى', 'We moved to Casablanca in 2005.'],
        ['get a job', 'يحصل على عمل', 'He got his first job at twenty.'],
        ['get married', 'يتزوّج', 'My parents got married in 1990.'],
        ['have children', 'ينجب أطفالًا', 'They had three children.'],
        ['retire', 'يتقاعد', 'My grandfather retired last year.'],
      ] },
    ],
    partners: [
      ['have fun', 'يستمتع'], ['make a mess', 'يُحدث فوضى'], ['miss someone', 'يشتاق إلى شخص'],
      ['have a happy childhood', 'يعيش طفولة سعيدة'], ['look back on', 'يستعيد ذكرى'], ['the good old days', 'الأيام الخوالي'],
    ],
    practice: [
      ['I ___ up in Meknes, but I live in Rabat now.', 'grew'],
      ["My grandfather doesn't work any more. He ___ last year.", 'retired'],
      ['I used to get a little ___ money every Friday.', 'pocket'],
      ['Do you ___ visit your village?', 'still'],
      ['___, everyone has a smartphone.', 'Nowadays'],
      ['My parents got ___ in 1990.', 'married'],
    ],
  },

  3: {
    groups: [
      { title: 'Appearance - المظهر', icon: '🧍', words: [
        ['tall', 'طويل القامة', 'Rim is quite tall, taller than her cousin.'],
        ['medium height', 'متوسط القامة', 'My father is of medium height.'],
        ['slim', 'نحيف', "She's slim and very active."],
        ['well-built', 'مفتول العضلات', "My brother goes to the gym. He's well-built."],
        ['curly hair', 'شعر مجعّد', 'Lamia has long curly hair.'],
        ['straight hair', 'شعر أملس', 'My sister has short straight hair.'],
        ['bald', 'أصلع', 'My grandfather is bald.'],
        ['a beard', 'لحية', 'Reda has a short black beard.'],
        ['wear glasses', 'يرتدي نظارات', 'She usually wears glasses.'],
        ['in his thirties', 'في الثلاثينات من عمره', 'Our teacher is in his thirties.'],
      ] },
      { title: 'Personality - الشخصية', icon: '💛', words: [
        ['kind', 'طيّب', 'My grandmother is the kindest person I know.'],
        ['friendly', 'ودود', 'Our neighbours are very friendly.'],
        ['shy', 'خجول', 'My son is a bit shy with new people.'],
        ['confident', 'واثق من نفسه', "She's more confident than her sister."],
        ['patient', 'صبور', 'A good teacher is patient.'],
        ['funny', 'ظريف ومضحك', 'Adil is the funniest person in our family.'],
        ['talkative', 'كثير الكلام', 'Rim is very talkative!'],
        ['honest', 'صادق', "He's honest. He never lies."],
        ['hard-working', 'مجتهد', 'My mother is very hard-working.'],
        ['lazy', 'كسول', "I'm a bit lazy on Sundays."],
      ] },
      { title: 'Family and friends - العائلة والأصدقاء', icon: '👨‍👩‍👧', words: [
        ['cousin', 'ابن العم أو الخال', 'Rim is my favourite cousin.'],
        ['nephew', 'ابن الأخ أو الأخت', 'My nephew is five years old.'],
        ['niece', 'بنت الأخ أو الأخت', 'My niece looks like her mother.'],
        ['in-laws', 'أهل الزوج أو الزوجة', 'We visit my in-laws every Friday.'],
        ['best friend', 'أعزّ صديق', 'Hamid is my best friend.'],
        ['only child', 'طفل وحيد', "I'm an only child."],
      ] },
    ],
    partners: [
      ['get on well with', 'يتفاهم جيدًا مع'], ['look after', 'يعتني بـ'], ['take after', 'يشبه أحد أفراد عائلته'],
      ['make someone laugh', 'يُضحك شخصًا'], ['have a lot in common', 'بينهما قواسم مشتركة كثيرة'], ['be close to', 'قريب من شخص'],
    ],
    practice: [
      ["He never tells lies. He's very ___.", 'honest'],
      ["She talks all the time! She's very ___.", 'talkative'],
      ["My brother doesn't have any hair. He's ___.", 'bald'],
      ['I get on well ___ my sister.', 'with'],
      ["My sister's son is my ___.", 'nephew'],
      ["He works ten hours a day. He's very ___.", 'hard-working'],
    ],
  },

  4: {
    groups: [
      { title: 'Rooms and parts of a home - البيت', icon: '🏠', words: [
        ['living room', 'الصالة', 'There are two big windows in the living room.'],
        ['bedroom', 'غرفة النوم', 'The flat has two bedrooms.'],
        ['kitchen', 'المطبخ', "The kitchen is small, but it's new."],
        ['bathroom', 'الحمّام', "There isn't a bath in the bathroom, only a shower."],
        ['balcony', 'الشرفة', 'The big bedroom has a balcony.'],
        ['roof terrace', 'السطح', 'We dry the washing on the roof terrace.'],
        ['ground floor', 'الطابق الأرضي', 'My grandmother lives on the ground floor.'],
        ['lift', 'المصعد', 'Is there a lift in the building?'],
        ['stairs', 'الدرج', 'There are a lot of stairs!'],
        ['building', 'العمارة', 'There are twelve flats in our building.'],
      ] },
      { title: 'Furniture and equipment - الأثاث والتجهيزات', icon: '🛋️', words: [
        ['sofa', 'أريكة', "There's a big sofa in the living room."],
        ['wardrobe', 'خزانة الملابس', "There isn't a wardrobe in the bedroom."],
        ['shelves', 'رفوف', 'There are some shelves for books.'],
        ['cooker', 'موقد الطبخ', 'The cooker is new.'],
        ['fridge', 'ثلاجة', 'Is there any food in the fridge?'],
        ['washing machine', 'آلة الغسيل', "There's a washing machine in the kitchen."],
        ['water heater', 'سخّان الماء', "There's a water heater, so there's always hot water."],
        ['air conditioning', 'مكيّف الهواء', "There isn't any air conditioning, but there's a fan."],
      ] },
      { title: 'The neighbourhood - الحيّ', icon: '🏘️', words: [
        ['quiet', 'هادئ', "It's a quiet street."],
        ['lively', 'حيوي', 'The old medina is lively at night.'],
        ['noisy', 'صاخب', 'Our street is noisy in the morning.'],
        ['crowded', 'مزدحم', 'The market is crowded on Sundays.'],
        ['safe', 'آمن', "It's a safe area for children."],
        ['convenient', 'مناسب وقريب من كل شيء', 'The flat is very convenient.'],
        ['nearby', 'قريب', 'There are a lot of shops nearby.'],
        ['rent', 'الكراء', 'The rent is three thousand dirhams a month.'],
      ] },
    ],
    partners: [
      ['move house', 'ينتقل إلى بيت جديد'], ['rent a flat', 'يكتري شقة'], ['pay the bills', 'يدفع الفواتير'],
      ['a flat to rent', 'شقة للكراء'], ['next-door neighbour', 'الجار الملاصق'], ['the owner', 'صاحب البيت'],
    ],
    practice: [
      ['We put our clothes in the ___.', 'wardrobe'],
      ["There isn't a ___, so we take the stairs.", 'lift'],
      ['My street is very ___: there are cars and people all day.', 'noisy'],
      ['You pay the ___ to the owner every month.', 'rent'],
      ['We keep food cold in the ___.', 'fridge'],
      ["We're moving ___ next month. Can you help us?", 'house'],
    ],
  },
}
