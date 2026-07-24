/** /offline — the page the service worker shows when there is no connection.
 *  Kept dependency-free and tiny so it precaches reliably. */
export const metadata = { title: 'غير متصل' }

export default function OfflinePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-yellow-400 flex items-center justify-center text-3xl">📡</div>
        <h1 className="text-xl font-black text-zinc-900 mb-2">أنت غير متصل بالإنترنت</h1>
        <p className="text-[14px] text-zinc-500 leading-relaxed mb-6">
          تحقّق من اتصالك ثم حاول من جديد. الصفحات التي زرتها مؤخرًا قد تعمل بدون إنترنت.
        </p>
        <a href="/" className="inline-block px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-[14px] font-bold">
          إعادة المحاولة
        </a>
      </div>
    </div>
  )
}
