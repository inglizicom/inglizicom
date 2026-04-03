"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  Radio,
  Users,
  Crown,
  Lock,
} from "lucide-react";

export default function LiveClassesPage() {
  const [liveConfig, setLiveConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const WHATSAPP_NUMBER = "212707902091";

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Supabase error:", error);
      }

      if (data) {
        setLiveConfig(data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* HERO */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          borderRadius: "20px",
          padding: "40px",
          color: "white",
          textAlign: "center",
        }}
      >
        {/* LIVE BADGE */}
        <div
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.1)",
            marginBottom: "20px",
          }}
        >
          <Radio size={16} style={{ display: "inline" }} /> Live Now — بث مباشر الآن 🔴
        </div>

        {/* TITLE */}
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
          Daily Conversation — محادثة يومية
        </h1>

        <p style={{ opacity: 0.8, marginBottom: "20px" }}>
          تدرب على المحادثة الحقيقية مع المعلم مباشرة
        </p>

        {/* HOST */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.1)",
            marginBottom: "20px",
          }}
        >
          <Users size={16} />
          42 مشارك — حمزة القصراوي
        </div>

        {/* JOIN BUTTON */}
        {liveConfig?.live_link && (
          <a
            href={liveConfig.live_link}
            target="_blank"
            style={{
              display: "inline-block",
              padding: "14px 30px",
              borderRadius: "12px",
              background: "#22c55e",
              color: "white",
              fontWeight: "bold",
              marginTop: "20px",
            }}
          >
            🔴 Join Live Class
          </a>
        )}

        {/* LOCK CTA */}
        {!liveConfig?.live_link && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <Lock size={16} /> انضم للحصة — للمشتركين فقط
          </div>
        )}

        {/* PRICING */}
        <p style={{ marginTop: "15px", color: "#facc15" }}>
          اشتراك الآن — 3,000 درهم/سنة
        </p>
      </div>

      {/* YOUTUBE SECTION */}
      {liveConfig?.youtube_link && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ marginBottom: "20px" }}>
            📺 Last Session
          </h2>

          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
            }}
          >
            <iframe
              src={liveConfig.youtube_link}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "12px",
              }}
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* COMMENTS */}
      <div style={{ marginTop: "40px" }}>
        <h2>💬 Comments</h2>
        <p style={{ opacity: 0.6 }}>
          Students will comment here later...
        </p>
      </div>

      {/* WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#25D366",
          color: "white",
          padding: "15px",
          borderRadius: "50%",
          fontSize: "20px",
        }}
      >
        💬
      </a>
    </div>
  );
}