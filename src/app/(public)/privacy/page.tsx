import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | إنجليزي.كوم',
  description: 'سياسة الخصوصية الخاصة بمنصة إنجليزي.كوم — كيف نجمع ونستخدم ونحمي بياناتك الشخصية.',
}

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-brand-600 font-bold text-sm hover:underline">← الرئيسية</Link>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">سياسة الخصوصية</h1>
          <p className="text-gray-500 text-sm font-semibold">آخر تحديث: أبريل 2026</p>
        </div>

        <div className="prose-custom space-y-8 text-gray-700 leading-[1.9] text-[15px]">

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">1. مقدمة</h2>
            <p>
              مرحباً بك في <strong>إنجليزي.كوم</strong> (&ldquo;نحن&rdquo;، &ldquo;لنا&rdquo;، &ldquo;الموقع&rdquo;). نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام موقعنا الإلكتروني.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">2. المعلومات التي نجمعها</h2>
            <p className="mb-3">نقوم بجمع أنواع مختلفة من المعلومات لتقديم خدماتنا وتحسينها:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>المعلومات الشخصية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف عند التسجيل أو التواصل معنا.</li>
              <li><strong>معلومات الاستخدام:</strong> الصفحات التي تزورها، مدة الزيارة، نوع المتصفح والجهاز.</li>
              <li><strong>ملفات تعريف الارتباط (Cookies):</strong> نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة المرور على الموقع.</li>
              <li><strong>معلومات الدفع:</strong> عند الاشتراك في الدورات، تتم معالجة المدفوعات عبر بوابات دفع آمنة ولا نخزن بيانات بطاقتك.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">3. كيف نستخدم معلوماتك</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>تقديم وإدارة الدورات التعليمية والخدمات.</li>
              <li>التواصل معك بخصوص حسابك أو الدورات المسجل فيها.</li>
              <li>إرسال تحديثات ومحتوى تعليمي (يمكنك إلغاء الاشتراك في أي وقت).</li>
              <li>تحسين موقعنا وخدماتنا بناءً على أنماط الاستخدام.</li>
              <li>ضمان أمان الموقع ومنع الاستخدام غير المشروع.</li>
              <li>الامتثال للمتطلبات القانونية والتنظيمية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">4. ملفات تعريف الارتباط والإعلانات</h2>
            <p className="mb-3">
              يستخدم موقعنا ملفات تعريف الارتباط وتقنيات مشابهة لأغراض متعددة:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>ملفات ضرورية:</strong> لتشغيل الموقع بشكل صحيح.</li>
              <li><strong>ملفات تحليلية:</strong> نستخدم Google Analytics لفهم كيفية استخدام الزوار لموقعنا.</li>
              <li><strong>ملفات إعلانية:</strong> نستخدم Google AdSense لعرض إعلانات مخصصة. تستخدم Google ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتك السابقة لموقعنا أو مواقع أخرى.</li>
            </ul>
            <p className="mt-3">
              يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات متصفحك. لمزيد من المعلومات حول إعلانات Google، يرجى زيارة صفحة سياسات Google الإعلانية.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">5. مشاركة المعلومات</h2>
            <p className="mb-3">لا نبيع أو نؤجر بياناتك الشخصية. قد نشارك معلوماتك فقط في الحالات التالية:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>مقدمو الخدمات:</strong> مثل بوابات الدفع وخدمات التحليل التي تساعدنا في تشغيل الموقع.</li>
              <li><strong>المتطلبات القانونية:</strong> إذا طُلب منا ذلك بموجب القانون أو أمر قضائي.</li>
              <li><strong>حماية الحقوق:</strong> لحماية حقوقنا أو سلامة مستخدمينا.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">6. أمان البيانات</h2>
            <p>
              نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف. تشمل هذه الإجراءات التشفير وجدران الحماية وبروتوكولات الأمان القياسية في المجال (HTTPS).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">7. حقوقك</h2>
            <p className="mb-3">لديك الحق في:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li>الوصول إلى بياناتك الشخصية التي نحتفظ بها.</li>
              <li>تصحيح أي بيانات غير دقيقة.</li>
              <li>طلب حذف بياناتك الشخصية.</li>
              <li>إلغاء الاشتراك في الرسائل التسويقية.</li>
              <li>الاعتراض على معالجة بياناتك لأغراض معينة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">8. خصوصية الأطفال</h2>
            <p>
              خدماتنا غير موجهة للأطفال دون سن 13 عاماً. لا نجمع عن عمد بيانات شخصية من الأطفال. إذا علمنا أننا جمعنا بيانات طفل، سنتخذ خطوات لحذفها فوراً.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">9. روابط مواقع خارجية</h2>
            <p>
              قد يحتوي موقعنا على روابط لمواقع خارجية. لا نتحمل مسؤولية ممارسات الخصوصية لتلك المواقع. ننصحك بقراءة سياسة الخصوصية الخاصة بكل موقع تزوره.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">10. تعديل السياسة</h2>
            <p>
              قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عبر نشر السياسة المحدثة على هذه الصفحة مع تاريخ التحديث. ننصحك بمراجعة هذه الصفحة بشكل دوري.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">11. تواصل معنا</h2>
            <p className="mb-3">إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، تواصل معنا:</p>
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
