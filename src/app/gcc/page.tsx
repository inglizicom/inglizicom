import type { Metadata } from 'next'
import GccLanding from './GccLanding'

export const metadata: Metadata = {
  title: 'تعلّم كتابة الإنجليزية بالفصحى | باقة الخليج — إنجليزي.كوم',
  description:
    'دورة كتابة إنجليزية عملية للناطقين بالعربية في دول الخليج — من الصفر إلى الفقرات والإيميلات المهنية. شرح بالفصحى، تصحيح شخصي، لايف أسبوعي، وشهادة إتمام.',
  keywords:
    'تعلم الكتابة بالانجليزية, كتابة الايميلات بالانجليزية, دورة انجليزي للخليج, تعلم الانجليزية بالفصحى, كتابة احترافية انجليزية, دورة كتابة انجليزية اون لاين',
  alternates: { canonical: 'https://inglizi.com/gcc' },
  openGraph: {
    title: 'اكتب الإنجليزية بثقة — من أول جملة إلى إيميلٍ يوظّفك | باقة الخليج',
    description: 'دورة كتابة إنجليزية عملية بالفصحى للناطقين بالعربية في الخليج، مع تصحيحٍ شخصي ولايف أسبوعي وشهادة.',
    url: 'https://inglizi.com/gcc',
    locale: 'ar',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function GccPage() {
  return <GccLanding />
}
