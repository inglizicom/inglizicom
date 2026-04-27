'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { VocabCategory } from '@/data/private-lessons/types'

type VocabCategoriesSectionType = {
  kind: 'vocabCategories'
  title?: string
  categories: VocabCategory[]
}

export default function VocabCategoriesSection({
  section,
  step,
}: {
  section: VocabCategoriesSectionType
  step: number
}) {
  // Walk steps: cat0-title, cat0-item0, cat0-item1, ..., cat1-title, cat1-item0, ...
  const flat: { type: 'catTitle'; catIdx: number } | { type: 'item'; catIdx: number; itemIdx: number } | null =
    flattenStep(section.categories, step)

  return (
    <div className="flex-1 flex flex-col px-6 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <div className="inline-block px-5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold tracking-wider uppercase mb-3">
          Vocabulary
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-brand-900" dir="rtl">
          {section.title || 'المفردات'}
        </h2>
      </motion.div>

      {/* Focused: current category title or current item */}
      <AnimatePresence mode="wait">
        {flat?.type === 'catTitle' && (
          <motion.div
            key={`cat-${flat.catIdx}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="mb-8 text-center"
          >
            <div className="inline-block bg-gradient-to-r from-brand-700 to-brand-900 text-white px-10 py-6 rounded-2xl shadow-xl">
              <div className="text-2xl md:text-3xl font-bold">
                {section.categories[flat.catIdx].name}
              </div>
              <div className="text-lg md:text-xl text-amber-200 mt-1" dir="rtl">
                {section.categories[flat.catIdx].nameAr}
              </div>
            </div>
          </motion.div>
        )}
        {flat?.type === 'item' && (
          <motion.div
            key={`item-${flat.catIdx}-${flat.itemIdx}`}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-2xl p-8 md:p-10 shadow-xl text-center">
              <div className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-3">
                {section.categories[flat.catIdx].name}
              </div>
              <div className="text-5xl md:text-6xl font-black mb-4">
                {section.categories[flat.catIdx].items[flat.itemIdx].en}
              </div>
              <div className="text-3xl font-bold text-amber-200" dir="rtl">
                {section.categories[flat.catIdx].items[flat.itemIdx].ar}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories grid */}
      <div className="space-y-5">
        {section.categories.map((cat, ci) => {
          const visibleItems = visibleItemsInCategory(section.categories, step, ci)
          const isCatVisible = visibleItems > 0 || flat?.catIdx === ci
          return (
            <motion.div
              key={ci}
              initial={{ opacity: 0 }}
              animate={{ opacity: isCatVisible ? 1 : 0.25 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-base font-bold text-brand-800">{cat.name}</div>
                <div className="text-sm text-slate-500" dir="rtl">
                  {cat.nameAr}
                </div>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {cat.items.map((it, ii) => {
                  const visible = ii < visibleItems
                  const focused = flat?.type === 'item' && flat.catIdx === ci && flat.itemIdx === ii
                  return (
                    <div
                      key={ii}
                      className={`p-2 rounded-lg border text-center text-xs md:text-sm transition-all ${
                        focused
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200 scale-105'
                          : visible
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-100 bg-slate-50 opacity-30'
                      }`}
                    >
                      <div className="font-bold text-brand-900">{visible ? it.en : '···'}</div>
                      <div className="text-slate-600 mt-0.5" dir="rtl">
                        {visible ? it.ar : '···'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function flattenStep(
  categories: VocabCategory[],
  step: number
): { type: 'catTitle'; catIdx: number } | { type: 'item'; catIdx: number; itemIdx: number } | null {
  if (step === 0) return null
  let cursor = 0
  for (let ci = 0; ci < categories.length; ci++) {
    cursor += 1 // category title
    if (cursor === step) return { type: 'catTitle', catIdx: ci }
    for (let ii = 0; ii < categories[ci].items.length; ii++) {
      cursor += 1
      if (cursor === step) return { type: 'item', catIdx: ci, itemIdx: ii }
    }
  }
  return null
}

function visibleItemsInCategory(
  categories: VocabCategory[],
  step: number,
  catIdx: number
): number {
  let cursor = 0
  for (let ci = 0; ci < categories.length; ci++) {
    cursor += 1 // title
    let visible = 0
    for (let ii = 0; ii < categories[ci].items.length; ii++) {
      cursor += 1
      if (cursor <= step) visible = ii + 1
    }
    if (ci === catIdx) return visible
  }
  return 0
}
