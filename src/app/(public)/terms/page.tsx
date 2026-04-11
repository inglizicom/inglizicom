import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'شروط الاستخدام | إنجليزي.كوم',
  description: 'شروط وأحكام استخدام منصة إنجليزي.كوم — اقرأ الشروط قبل استخدام خدماتنا.',
}

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-brand-600 font-bold text-sm hover:underline">← الرئيسية</Link>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">شروط الاستخدام</h1>
          <p className="text-gray-500 text-sm font-semibold">آخر تحديث: أبريل 2026</p>
        </div>

        <div className="prose-custom space-y-8 text-gray-700 leading-[1.9] text-[15px]">

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">1. قبول الشروط</h2>
            <p>
              باستخدامك لموقع <strong>إنجليزي.كوم</strong> (&ldquo;الموقع&rdquo;)، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">2. وصف الخدمات</h2>
            <p>
              إنجليزي.كوم منصة تعليمية إلكترونية تقدم دورات لتعليم اللغة الإنجليزية عبر الإنترنت. تشمل خدماتنا دروساً مسجلة، متابعة شخصية عبر مجموعات واتساب، ملفات PDF تدريبية، وأدوات تعليمية تفاعلية.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">3. التسجيل والحساب</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>يجب أن تكون بالغاً (18 سنة أو أكثر) أو تحت إشراف ولي أمر للتسجيل.</li>
              <li>أنت مسؤول عن تقديم معلومات صحيحة ودقيقة عند التسجيل.</li>
              <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك.</li>
              <li>يحق لنا تعليق أو إلغاء أي حساب ينتهك هذه الشروط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">4. الاشتراك والدفع</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>أسعار الدورات محددة بالدرهم المغربي (DH) وقد تتغير دون إشعار مسبق.</li>
              <li>الدفع يتم عبر القنوات المعتمدة (واتساب / التحويل البنكي).</li>
              <li>بعد تأكيد الدفع، يتم تفعيل الوصول إلى محتوى الدورة.</li>
              <li>الاشتراك يمنحك وصولاً مدى الحياة إلى محتوى الدورة المختارة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">5. سياسة الاسترجاع</h2>
            <p>
              نظراً لطبيعة المحتوى الرقمي، لا يمكن استرجاع المبالغ المدفوعة بعد تفعيل الوصول إلى الدورة. ومع ذلك، نسعى دائماً لرضا طلابنا. إذا واجهت أي مشكلة، تواصل معنا عبر واتساب وسنعمل على إيجاد حل مناسب.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">6. حقوق الملكية الفكرية</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>جميع المحتويات على الموقع (نصوص، فيديوهات، صور، ملفات PDF، تصاميم) هي ملكية خاصة لإنجليزي.كوم ومحمية بقوانين حقوق الملكية الفكرية.</li>
              <li>يُمنع نسخ أو إعادة توزيع أو بيع أي محتوى من الموقع بدون إذن كتابي.</li>
              <li>يُمنع مشاركة حسابك أو بيانات الوصول مع أشخاص آخرين.</li>
              <li>يُمنع تسجيل الدروس أو تصوير الشاشة أثناء المشاهدة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">7. قواعد الاستخدام المقبول</h2>
            <p className="mb-3">عند استخدام الموقع وخدماتنا، يُمنع:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li>استخدام الموقع لأي غرض غير قانوني أو غير مصرح به.</li>
              <li>محاولة الوصول غير المصرح به إلى أنظمة الموقع.</li>
              <li>إرسال محتوى مسيء أو غير لائق في مجموعات واتساب الخاصة بالدورات.</li>
              <li>انتحال شخصية أي شخص أو جهة.</li>
              <li>استخدام برامج آلية (bots) للوصول إلى الموقع.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">8. المحتوى الإعلاني</h2>
            <p>
              قد يعرض الموقع إعلانات من أطراف ثالثة بما في ذلك إعلانات Google AdSense. هذه الإعلانات قد تستخدم ملفات تعريف الارتباط لعرض محتوى مناسب لاهتماماتك. لا نتحمل مسؤولية محتوى الإعلانات أو المنتجات/الخدمات المُعلن عنها.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">9. إخلاء المسؤولية</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>نقدم خدماتنا &ldquo;كما هي&rdquo; دون ضمانات صريحة أو ضمنية.</li>
              <li>لا نضمن أن الموقع سيعمل بدون انقطاع أو أخطاء في جميع الأوقات.</li>
              <li>نتائج التعلم تختلف من شخص لآخر وتعتمد على مدى الالتزام والجهد المبذول.</li>
              <li>لا نتحمل مسؤولية أي أضرار غير مباشرة ناتجة عن استخدام الموقع.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">10. تعديل الشروط</h2>
            <p>
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم نشر التعديلات على هذه الصفحة مع تحديث تاريخ آخر تعديل. استمرارك في استخدام الموقع بعد نشر التعديلات يعني موافقتك على الشروط المحدثة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">11. القانون الواجب التطبيق</h2>
            <p>
              تخضع هذه الشروط لقوانين المملكة المغربية وتُفسر وفقاً لها. أي نزاع ينشأ عن استخدام الموقع يخضع للاختصاص القضائي للمحاكم المغربية المختصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">12. تواصل معنا</h2>
            <p className="mb-3">لأي أسئلة أو استفسارات حول شروط الاستخدام:</p>
            <ul className="list-none space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-brand-600 font-bold">البريد:</span>
                <a href="mailto:hamza@inglizi.com" className="text-brand-600 hover:underline">hamza@inglizi.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-600 font-bold">واتساب:</span>
                <a href="https://wa.me/212707902091" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline" dir="ltr">+212 707 902 091</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
