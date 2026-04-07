'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ContentItem {
  id: string
  sentence: string
  arabic_sentence: string | null
  video_url: string | null
  video_name: string | null
  level: string
  lesson: string
  status: string
  options: string[]
  correct_index: number
  created_at: string
}

export default function ListenPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('FETCH ERROR:', error)
      setLoading(false)
      return
    }

    console.log('CONTENT:', data)
    setItems(data ?? [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
        <p className="text-white/40 text-sm">جاري التحميل...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c1120' }}>
        <p className="text-white/40 text-sm">لا يوجد محتوى منشور</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#0c1120' }}>
      <h1 className="text-white text-2xl font-bold text-center mb-8">
        استمع وتعلم — {items.length} درس
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {items.map((item) => (
          <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-xl">

            {item.video_url ? (
              <video
                controls
                src={item.video_url}
                className="w-full rounded-lg"
                preload="metadata"
              />
            ) : (
              <div className="w-full aspect-video bg-white/5 rounded-lg flex items-center justify-center">
                <p className="text-white/20 text-sm">لا يوجد فيديو</p>
              </div>
            )}

            <p className="mt-3 text-white font-medium">{item.sentence}</p>

            {item.arabic_sentence && (
              <p className="mt-1 text-white/50 text-sm">{item.arabic_sentence}</p>
            )}

            <div className="mt-2 flex gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                {item.level}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                {item.lesson}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
