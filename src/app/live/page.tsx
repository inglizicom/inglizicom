'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Radio, Lock, Crown, Send, MessageCircle, Clock,
  Calendar, ChevronRight, PlayCircle, Users, Star,
  CheckCircle2, X, ExternalLink, Bell, WifiOff,
  Play, Video, TrendingUp,
} from 'lucide-react'

// ─── Dynamic Live Config ─────────────────────────────────────

const IS_PAID_USER = false
const WHATSAPP_NUMBER = '212707902091'

// ─── Page ───────────────────────────────────────────────────

export default function LiveClassesPage() {
  const [showModal, setShowModal] = useState(false)

  const [liveConfig, setLiveConfig] = useState({
    isLive: true,
    liveLink: '',
    youtubeLink: '',
    sessionTitle: 'محادثة يومية — Daily Conversation Practice',
    sessionSubtitle: 'تدرب على المحادثة الحقيقية مع المعلم مباشرةً',
    scheduledAt: null as Date | null,
    hostName: 'حمزة القصراوي',
    hostTitle: 'مدرب الإنجليزية المعتمد',
    attendees: 42,
  })

  // 🔥 Fetch from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setLiveConfig(prev => ({
          ...prev,
          liveLink: data.live_link,
          youtubeLink: data.youtube_link,
        }))
      }
    }

    fetchData()
  }, [])

  const { isLive, liveLink, youtubeLink } = liveConfig

  return (
    <div className="min-h-screen bg-slate-50 pt-16">

      {/* HERO */}
      <section className="rounded-3xl bg-blue-900 text-white p-10 text-center max-w-4xl mx-auto mt-10">

        <h1 className="text-3xl font-extrabold mb-4">
          {liveConfig.sessionTitle}
        </h1>

        <p className="text-blue-200 mb-6">
          {liveConfig.sessionSubtitle}
        </p>

        {/* 🔥 JOIN LIVE BUTTON */}
        {isLive && (
          <>
            {IS_PAID_USER ? (
              <a
                href={liveLink}
                target="_blank"
                className="bg-white text-blue-800 px-6 py-3 rounded-xl font-bold inline-block"
              >
                🔴 Join Live
              </a>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="bg-white/20 border px-6 py-3 rounded-xl"
              >
                🔒 للمشتركين فقط
              </button>
            )}
          </>
        )}
      </section>

      {/* 🎥 VIDEO FROM SUPABASE */}
      {youtubeLink && (
        <div className="max-w-4xl mx-auto mt-10 px-4">
          <iframe
            src={youtubeLink}
            className="w-full h-[400px] rounded-2xl"
            allowFullScreen
          />
        </div>
      )}

      {/* COMMENTS */}
      <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
        <h2 className="font-bold mb-4">التعليقات</h2>
        <textarea className="w-full border p-3 rounded-xl" />
      </div>

      {/* WHATSAPP */}
      <div className="text-center mt-10 mb-20">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          className="bg-green-500 text-white px-6 py-3 rounded-xl"
        >
          WhatsApp
        </a>
      </div>

    </div>
  )
}