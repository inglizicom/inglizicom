'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Send, CheckCircle, Instagram, Youtube } from 'lucide-react'

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

const socialLinks = [
  {
    name: 'Instagram',
    handle: '@elqasraouihamza',
    url: 'https://www.instagram.com/elqasraouihamza/',
    icon: Instagram,
    color: 'hover:bg-pink-500',
    desc: 'محتوى يومي ونصائح',
  },
  {
    name: 'TikTok',
    handle: '@elqasraouihamza',
    url: 'https://www.tiktok.com/@elqasraouihamza',
    iconCustom: TikTokIcon,
    color: 'hover:bg-black',
    desc: 'فيديوهات قصيرة وممتعة',
  },
  {
    name: 'YouTube',
    handle: '@hamzaelqasraoui',
    url: 'https://www.youtube.com/@hamzaelqasraoui',
    icon: Youtube,
    color: 'hover:bg-red-600',
    desc: 'دروس مجانية كاملة',
  },
]

const faqs = [
  {
    q: 'هل الدورات مناسبة للمبتدئين الكاملين؟',
    a: 'نعم! دورة المبتدئين مصممة خصيصاً لمن لا يعرفون شيئاً عن الإنجليزية. ستبدأ من أبسط الأساسيات.',
  },
  {
    q: 'كم يستغرق الوصول لمستوى التحدث بثقة؟',
    a: 'مع الالتزام بالبرنامج، يلاحظ معظم الطلاب تحسناً واضحاً خلال 4-6 أسابيع.',
  },
  {
    q: 'هل يوجد دعم ومتابعة بعد الانضمام؟',
    a: 'بالطبع! يمكنك التواصل مع حمزة مباشرة عبر واتساب للأسئلة والمتابعة.',
  },
  {
    q: 'هل يمكن أخذ الدروس من أي بلد؟',
    a: 'نعم، الدروس عبر الإنترنت وتستقبل طلاباً من جميع الدول العربية والعالم.',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simulate form submission (replace with real API call)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-hero pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-blue-100 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
            تواصل معنا
          </span>
          <h1 className="text-5xl font-black text-white mb-5">نحن هنا لمساعدتك</h1>
          <p className="text-blue-100/80 text-xl leading-relaxed max-w-2xl mx-auto">
            لديك سؤال عن الدورات؟ أو تريد نصيحة في اختيار المستوى المناسب لك؟ تواصل معنا بأي طريقة تناسبك.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left: Contact Info ── */}
            <div className="lg:col-span-1 space-y-6">

              {/* WhatsApp Card */}
              <a
                href="https://wa.me/212707902091?text=مرحباً%20حمزة،%20أريد%20الاستفسار%20عن%20دوراتك"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-7 text-white shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black mb-1">واتساب (الأسرع)</h3>
                <p className="text-green-100/80 text-sm mb-3">رد خلال ساعات قليلة في أوقات العمل</p>
                <p className="font-bold text-lg" dir="ltr">+212 707 902 091</p>
              </a>

              {/* Email */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
                  <Mail size={22} className="text-brand-600" />
                </div>
                <h3 className="font-black text-gray-900 mb-1">البريد الإلكتروني</h3>
                <p className="text-gray-500 text-sm mb-2">للاستفسارات التفصيلية</p>
                <a href="mailto:hamza@inglizi.com" className="text-brand-600 font-semibold hover:text-brand-800">
                  hamza@inglizi.com
                </a>
              </div>

              {/* Location */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <MapPin size={22} className="text-orange-500" />
                </div>
                <h3 className="font-black text-gray-900 mb-1">الموقع</h3>
                <p className="text-gray-500 text-sm">المملكة المغربية 🇲🇦</p>
                <p className="text-gray-400 text-xs mt-1">الدروس عبر الإنترنت لجميع الدول العربية</p>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4">تابعنا على وسائل التواصل</h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    const CustomIcon = social.iconCustom
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all duration-200 group ${social.color} hover:text-white hover:border-transparent`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center shadow-sm">
                          {Icon ? (
                            <Icon size={20} className="text-gray-600 group-hover:text-white" />
                          ) : CustomIcon ? (
                            <CustomIcon size={20} />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 group-hover:text-white">{social.name}</p>
                          <p className="text-xs text-gray-500 group-hover:text-white/80">{social.desc}</p>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">

                {submitted ? (
                  /* Success State */
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">تم الإرسال بنجاح! 🎉</h2>
                    <p className="text-gray-500 leading-relaxed mb-6">
                      شكراً لتواصلك معنا. سيرد عليك حمزة خلال 24 ساعة على الأكثر.
                      <br />
                      يمكنك أيضاً التواصل المباشر عبر واتساب للرد الأسرع.
                    </p>
                    <a
                      href="https://wa.me/212707902091"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-7 rounded-xl transition-all duration-300"
                    >
                      تواصل عبر واتساب
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-gray-900 mb-2">أرسل لنا رسالة</h2>
                      <p className="text-gray-500">أخبرنا بما تحتاجه وسنرد عليك في أقرب وقت.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="مثال: أحمد محمد"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف / واتساب</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+212 6XX XXX XXX"
                            className="form-input"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="example@email.com"
                          className="form-input"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">موضوع الرسالة *</label>
                        <select
                          name="topic"
                          value={formData.topic}
                          onChange={handleChange}
                          required
                          className="form-input"
                        >
                          <option value="">اختر الموضوع</option>
                          <option value="courses">استفسار عن الدورات</option>
                          <option value="level">تحديد المستوى المناسب</option>
                          <option value="price">الأسعار والعروض</option>
                          <option value="private">دروس خاصة</option>
                          <option value="other">موضوع آخر</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">رسالتك *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder="اكتب رسالتك هنا... مثلاً: أريد الاستفسار عن دورة المبتدئين، ما هو مستواي الحالي..."
                          className="form-input resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-black py-4 rounded-2xl text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                          loading
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-brand-600/30 active:scale-95'
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send size={22} />
                            إرسال الرسالة
                          </>
                        )}
                      </button>

                      <p className="text-center text-gray-400 text-xs">
                        أو تواصل مباشرة عبر{' '}
                        <a href="https://wa.me/212707902091" target="_blank" rel="noopener noreferrer" className="text-green-500 font-semibold hover:text-green-700">
                          واتساب
                        </a>
                        {' '}للرد الفوري
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900">أسئلة شائعة</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-brand-500 flex-shrink-0 mt-0.5">❓</span>
                    {faq.q}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mr-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
