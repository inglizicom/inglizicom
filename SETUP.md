# 🚀 إعداد موقع إنجليزي.كوم

## المتطلبات

- **Node.js** نسخة 18 أو أحدث → [nodejs.org](https://nodejs.org)

---

## خطوات التشغيل

```bash
# 1. انتقل إلى مجلد المشروع
cd /Users/inglizi.com/Desktop/Inglizi.com

# 2. ثبّت المكتبات
npm install

# 3. شغّل خادم التطوير
npm run dev
```

ثم افتح المتصفح على: **http://localhost:3000**

---

## بناء النسخة النهائية للنشر

```bash
npm run build
npm start
```

---

## النشر على Vercel (مجاني)

1. اذهب إلى [vercel.com](https://vercel.com)
2. اسحب وأفلت مجلد المشروع، أو اربطه بـ GitHub
3. انقر Deploy — سيُنشر الموقع تلقائياً

---

## هيكل المشروع

```
src/
├── app/
│   ├── layout.tsx          ← التخطيط الرئيسي (RTL + خط Cairo)
│   ├── page.tsx            ← الصفحة الرئيسية
│   ├── globals.css         ← التنسيقات العامة
│   ├── courses/page.tsx    ← صفحة الدورات
│   ├── level-test/page.tsx ← اختبار المستوى
│   ├── blog/page.tsx       ← المدونة
│   ├── blog/[slug]/page.tsx← مقال فردي
│   ├── about/page.tsx      ← عن المعلم
│   └── contact/page.tsx    ← تواصل معنا
└── components/
    ├── Header.tsx          ← شريط التنقل
    ├── Footer.tsx          ← التذييل
    └── WhatsAppButton.tsx  ← زر واتساب العائم
```
