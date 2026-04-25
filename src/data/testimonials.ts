export interface Testimonial {
  name:   string
  text:   string
  avatar: string
  level:  string
  /** Card theme — constrained to the brand palette so Tailwind always emits it. */
  theme:  'blue' | 'gold' | 'blueDark'
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'سارة م.',  text: 'من أحسن قرار خذيته — بديت نتكلم إنجليزية فأسبوعين. الأستاذ حمزة كيتابع معايا شخصياً فالواتساب.',        avatar: '👩‍🎓', level: 'A2', theme: 'blue'     },
  { name: 'يوسف ب.',  text: 'الطريقة ممتعة بزاف وماكتحسش بالملل أبدا. فشهر واحد وليت كنتخيّل بالإنجليزية. شكراً حمزة!',               avatar: '👨‍💻', level: 'B1', theme: 'gold'     },
  { name: 'نادية ك.', text: 'ولادي كيتعلمو معايا — الموقع سهل ومفهوم للجميع. الدروس المسجّلة + مجموعة الواتساب = كومبو قاتل.',       avatar: '👩‍🏫', level: 'A1', theme: 'blueDark' },
  { name: 'مهدي ع.',  text: 'كنت خايف من الإنجليزية، دابا كنهضر مع أجانب بثقة كاملة. 30 يوم بدّلو حياتي — بلا مبالغة.',               avatar: '🧑‍🎓', level: 'B1', theme: 'blue'     },
  { name: 'أسماء ل.', text: 'الدروس قصيرة ومركّزة، وكنحس نتقدّم كل أسبوع. المتابعة الشخصية كتعطيك دافع تكمّل.',                        avatar: '👩‍💼', level: 'A2', theme: 'gold'     },
  { name: 'كريم د.',  text: 'أحسن استثمار درتو فنفسي. الأستاذ كيجاوب على كل أسئلتي — حتى فالليل. ما بقات عندي أعذار باش ما نتعلّم.',  avatar: '👨‍🏫', level: 'A2', theme: 'blueDark' },
]

export const STATS = {
  students:   1200,
  countries:  22,
  rating:     4.9,
  reviews:    280,
}
