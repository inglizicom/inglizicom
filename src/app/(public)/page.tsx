"use client";

import { useState, useEffect } from "react";

export default function Page() {
const slides = [
{
title: "تعلم الإنجليزية مع حمزة",
subtitle: "دروس عملية + محادثة + تطبيق مباشر",
image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
},
{
title: "تعلم في وقت قصير ⏱",
subtitle: "دورات منظمة + تمارين + متابعة",
image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
},
];

const [index, setIndex] = useState(0);

useEffect(() => {
const interval = setInterval(() => {
setIndex((prev) => (prev + 1) % slides.length);
}, 4000);
return () => clearInterval(interval);
}, []);

return (
<main className="bg-white text-gray-800">

  {/* HEADER */}
  <header className="sticky top-0 bg-white shadow z-50 p-4 flex justify-between items-center">
    <h1 className="font-bold text-lg">Inglizi.com</h1>
    <nav className="hidden md:flex gap-6">
      <span>الرئيسية</span>
      <span>الدورات</span>
      <span>الاستماع</span>
      <span>تدرب الآن</span>
      <span>الخريطة</span>
    </nav>
    <button className="bg-green-500 text-white px-4 py-2 rounded-xl">
      ابدأ الآن
    </button>
  </header>

  {/* HERO SLIDER */}
  <section className="p-6 text-center">
    <img
      src={slides[index].image}
      className="w-full h-52 object-cover rounded-2xl mb-4"
    />
    <h2 className="text-xl font-bold mb-2">{slides[index].title}</h2>
    <p className="text-gray-500 mb-4">{slides[index].subtitle}</p>
    <button className="bg-green-500 text-white px-6 py-2 rounded-xl">
      ابدأ الآن
    </button>
  </section>

  {/* COURSES */}
  <section className="p-6 bg-gray-50">
    <h2 className="text-xl font-bold mb-4 text-center">الدورات</h2>
    <div className="grid grid-cols-2 gap-4">
      {["A0", "A1", "A2", "B1", "B2", "C1"].map((lvl) => (
        <div
          key={lvl}
          className="bg-white p-4 rounded-2xl shadow hover:scale-105 transition"
        >
          <h3 className="font-bold mb-2">{lvl}</h3>
          <p className="text-sm text-gray-500">ابدأ التعلم الآن</p>
          <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded-lg">
            ابدأ
          </button>
        </div>
      ))}
    </div>
  </section>

  {/* LEARNING METHOD */}
  <section className="p-6 text-center">
    <h2 className="text-xl font-bold mb-4">كيف تتعلم معنا؟</h2>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>🔊 استمع</div>
      <div>💬 تحدث</div>
      <div>🧠 فهم</div>
    </div>
  </section>

  {/* MAP */}
  <section className="p-6 bg-gray-50 text-center">
    <h2 className="text-xl font-bold mb-4">رحلة التعلم</h2>
    <p className="text-gray-500 mb-4">
      تبدأ من وادي زم ثم مدن أخرى حتى الطلاقة
    </p>
    <button className="bg-green-500 text-white px-6 py-2 rounded-xl">
      ابدأ الرحلة
    </button>
  </section>

  {/* TOOLS */}
  <section className="p-6 text-center">
    <h2 className="text-xl font-bold mb-4">أدوات تساعدك</h2>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>🎧 الاستماع</div>
      <div>📝 التمارين</div>
      <div>🎯 الاختبارات</div>
      <div>📊 التقدم</div>
    </div>
  </section>

  {/* CTA */}
  <section className="p-6 text-center">
    <h2 className="text-xl font-bold mb-4">ابدأ التعلم الآن 🚀</h2>
    <button className="bg-green-500 text-white px-6 py-2 rounded-xl">
      ابدأ الآن
    </button>
  </section>

</main>

);
}