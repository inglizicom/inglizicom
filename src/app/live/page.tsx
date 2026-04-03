"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LivePage() {
  const [liveLink, setLiveLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.error(error);
      }

      if (data) {
        setLiveLink(data.live_link);
        setYoutubeLink(data.youtube_link);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔴 Live Class</h1>

      {liveLink && (
        <a
          href={liveLink}
          target="_blank"
          style={{
            padding: "12px",
            background: "red",
            color: "white",
            display: "inline-block",
            marginBottom: "20px",
          }}
        >
          Join Live
        </a>
      )}

      {youtubeLink && (
        <iframe
          width="100%"
          height="400"
          src={youtubeLink}
          title="YouTube video"
          allowFullScreen
        />
      )}
    </div>
  );
}