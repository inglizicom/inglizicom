'use client'

import { BareSheet, Field, GamesHeader, PrintAllButton, THEMES } from '../games/_shared'
import { LaKaartBack, LaKaartFront, useCoverFonts } from './_covers'
import { ModernBack, ModernFront, useModernFonts } from './_modern'

/**
 * /admin/covers — the series' covers, front and back, at A4. The series
 * names its levels after the papers every Moroccan knows: LA KAART ENGLISH
 * (A0 → A1), PIIRMI ENGLISH (A1 → A2), VIIZA ENGLISH (A2 → B1). Two looks
 * of La Kaart's Student's Book: the modern one (a learner's photo, clean
 * type) and the classic one (the navy and gold ID card).
 */
export default function CoversPage() {
  useCoverFonts()
  useModernFonts()
  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1300px] mx-auto">
      <GamesHeader title="الأغلفة — لاكارط إنگليش" back="/admin" />
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-24 self-start">
          <Field label="السلسلة" hint="LA KAART ENGLISH (المستوى الأول) ← PIIRMI ENGLISH ← VIIZA ENGLISH. الغلاف مستوحى من بطاقة التعريف دون نسخها: لا شعار رسمي ولا علامات إدارية.">
            <div className="text-[13px] font-bold text-zinc-700">لاكارط إنگليش · كتاب الطالب</div>
          </Field>
          <Field label="الطباعة" hint="الوجه ثم الظهر، لكل نسخة. للطباعة الاحترافية: أضف 3 مم من كل جهة عند المطبعة، وضع الباركود الحقيقي (ISBN) مكان الإطار المنقّط. صورة الغلاف العصري من Unsplash (مسموح بها تجاريًا).">
            <PrintAllButton count={4} />
          </Field>
        </aside>
        <div className="space-y-8 min-w-0">
          <BareSheet theme={THEMES[2]} label="العصري · الوجه" filename="la-kaart-students-book-modern-front"><ModernFront /></BareSheet>
          <BareSheet theme={THEMES[2]} label="العصري · الظهر" filename="la-kaart-students-book-modern-back"><ModernBack /></BareSheet>
          <BareSheet theme={THEMES[2]} label="الكلاسيكي · الوجه" filename="la-kaart-students-book-front"><LaKaartFront /></BareSheet>
          <BareSheet theme={THEMES[2]} label="الكلاسيكي · الظهر" filename="la-kaart-students-book-back"><LaKaartBack /></BareSheet>
        </div>
      </div>
    </div>
  )
}
