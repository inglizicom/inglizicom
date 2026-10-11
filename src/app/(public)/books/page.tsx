import type { Metadata } from 'next'
import BookPreview from '@/components/site/BookPreview'
import { PageHero } from '@/components/site/kit'

/**
 * /books — leaf through the books before buying: the three levels (LA KAART,
 * PIIRMI, VIIZA ENGLISH), each student's book and workbook, cover and first
 * pages, like an online «look inside». The sales page comes later.
 */

export const metadata: Metadata = {
  title: 'تصفّح الكتب قبل الشراء | Inglizi.com',
  description: 'تصفّح الغلاف والصفحات الأولى من كتب لاكارط وبيرمي وفيزا إنگليش وكتب تمارينها، قبل أن تطلبها.',
}

export default function BooksPage() {
  return (
    <>
      <PageHero kicker="كتب Inglizi.com" title="تصفّح الكتب" accent="قبل الشراء"
        sub="ثلاثة مستويات، من الصفر إلى B1. اختر المستوى والكتاب، وقلّب الصفحات كأنه بين يديك." />
      <BookPreview />
    </>
  )
}
