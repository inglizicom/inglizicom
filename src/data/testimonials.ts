export interface Testimonial {
  name:   string
  text:   string
  avatar: string
  level:  string
  color:  string
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'سارة م.',  text: 'من أحسن قرار خذيته — بديت نتكلم إنجليزية في أسبوعين!',           avatar: '👩‍🎓', level: 'A2', color: 'from-pink-400 to-rose-500'    },
  { name: 'يوسف ب.',  text: 'الطريقة ممتعة بزاف وماكتحسش بالملل أبدا. شكرا حمزة!',           avatar: '👨‍💻', level: 'B1', color: 'from-blue-400 to-indigo-500'   },
  { name: 'نادية ك.', text: 'ولادي كيتعلمو معايا — الموقع سهل ومفهوم للجميع',                 avatar: '👩‍🏫', level: 'A1', color: 'from-green-400 to-emerald-500' },
  { name: 'مهدي ع.',  text: 'كنت خايف من الإنجليزية، دابا كنهضر مع أجانب بثقة كاملة',         avatar: '🧑‍🎓', level: 'B1', color: 'from-amber-400 to-orange-500'  },
  { name: 'أسماء ل.', text: 'الدروس قصيرة ومركزة، وكنحس نتقدم كل أسبوع',                      avatar: '👩‍💼', level: 'A2', color: 'from-violet-400 to-purple-500' },
  { name: 'كريم د.',  text: 'أحسن استثمار في نفسي. الأستاذ كيجاوب على كل أسئلتي',             avatar: '👨‍🏫', level: 'A2', color: 'from-teal-400 to-cyan-500'     },
]

export const STATS = {
  students:   1200,
  countries:  22,
  rating:     4.9,
  reviews:    280,
}
