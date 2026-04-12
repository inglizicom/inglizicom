import { NextResponse } from 'next/server'

const CHANNEL_HANDLE = 'hamzaelqasraoui'
const CACHE_SECONDS  = 3600 // re-fetch at most once per hour

export async function GET() {
  try {
    // 1. Resolve channel ID from the @handle page
    const pageRes = await fetch(`https://www.youtube.com/@${CHANNEL_HANDLE}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IngliziFetch/1.0)' },
      next: { revalidate: CACHE_SECONDS },
    })
    const html = await pageRes.text()

    const channelIdMatch =
      html.match(/"channelId":"(UC[^"]+)"/) ??
      html.match(/channel_id=(UC[^&"]+)/)

    if (!channelIdMatch) {
      return NextResponse.json({ videos: [] })
    }

    const channelId = channelIdMatch[1]

    // 2. Fetch the public RSS / Atom feed for that channel
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: CACHE_SECONDS } },
    )
    const xml = await rssRes.text()

    // 3. Parse <entry> blocks (simple regex — no XML lib needed)
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []

    const videos = entries.slice(0, 12).map(entry => {
      const id        = entry.match(/<yt:videoId>([^<]+)/)?.[1] ?? ''
      const title     = entry.match(/<title>([^<]+)/)?.[1] ?? ''
      const published = entry.match(/<published>([^<]+)/)?.[1] ?? ''
      const thumb     = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ?? ''
      const views     = entry.match(/<media:statistics[^>]+views="(\d+)"/)?.[1] ?? '0'
      return { id, title, published, thumbnail: thumb, views: Number(views) }
    }).filter(v => v.id)

    return NextResponse.json(
      { videos, channelId },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
        },
      },
    )
  } catch (err) {
    console.error('YouTube feed error:', err)
    return NextResponse.json({ videos: [] })
  }
}
