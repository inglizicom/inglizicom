/* ─────────────────────────────────────────────────────────────────────────────
   Content Store — localStorage-backed CMS
   Simulates a real database; swap the storage layer for Supabase / any API
   by replacing only the four primitive functions at the bottom.
───────────────────────────────────────────────────────────────────────────── */

export type ContentLevel  = 'A1' | 'A2' | 'B1' | 'B2'
export type ContentLesson = 'Greetings' | 'Daily Life' | 'Travel' | 'Work' | 'Shopping' | 'Health'
export type ContentStatus = 'draft' | 'published'

export interface ContentItem {
  id: string                          // uuid-like, generated on save
  sentence: string
  options: [string, string, string]   // exactly 3 MCQ options
  correctIndex: 0 | 1 | 2
  level: ContentLevel
  lesson: ContentLesson
  status: ContentStatus
  videoUrl: string | null             // blob URL (local) or future CDN URL
  videoName: string | null
  createdAt: string                   // ISO date string
  updatedAt: string
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const KEY = 'inglizi_cms_contents'

// ─── Primitive helpers ────────────────────────────────────────────────────────

function readAll(): ContentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ContentItem[]) : []
  } catch {
    return []
  }
}

function writeAll(items: ContentItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(items))
}

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Return every content item (admin use). */
export function getAllContent(): ContentItem[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * Return only published items — safe to call from the public website.
 * Draft items are never exposed here.
 */
export function getPublishedContent(): ContentItem[] {
  return readAll().filter(c => c.status === 'published')
}

/** Create or update a content item. Returns the saved item. */
export function saveContent(
  data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): ContentItem {
  const now   = new Date().toISOString()
  const all   = readAll()
  const idx   = existingId ? all.findIndex(c => c.id === existingId) : -1

  if (idx !== -1) {
    // Update existing
    const updated: ContentItem = { ...all[idx], ...data, updatedAt: now }
    all[idx] = updated
    writeAll(all)
    return updated
  }

  // Create new
  const item: ContentItem = { ...data, id: newId(), createdAt: now, updatedAt: now }
  writeAll([item, ...all])
  return item
}

/** Toggle status between draft ↔ published. Returns the updated item. */
export function togglePublish(id: string): ContentItem | null {
  const all = readAll()
  const idx = all.findIndex(c => c.id === id)
  if (idx === -1) return null
  const next: ContentItem = {
    ...all[idx],
    status: all[idx].status === 'published' ? 'draft' : 'published',
    updatedAt: new Date().toISOString(),
  }
  all[idx] = next
  writeAll(all)
  return next
}

/** Permanently delete a content item. */
export function deleteContent(id: string): void {
  writeAll(readAll().filter(c => c.id !== id))
}

// ─── Practice Page integration ────────────────────────────────────────────────

import type { Sentence } from '@/lib/sentences'

/**
 * Map published ContentItems for a given level into the Sentence shape
 * used by the practice page. Shuffled so each session varies.
 *
 * `arabic` is intentionally left empty — the practice page handles this
 * gracefully (hides the Arabic toggle, converts translation tasks to
 * dictation-style review when arabic is absent).
 */
export function getPublishedAsSentences(
  level: ContentLevel,
  limit = 6
): Sentence[] {
  const items = getPublishedContent()
    .filter(c => c.level === level)

  // Fisher-Yates shuffle
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }

  return a.slice(0, limit).map(c => ({
    id:      c.id,
    english: c.sentence,
    arabic:  '',                                        // not captured in admin — handled in practice screens
    level:   (c.level === 'B2' ? 'B1' : c.level) as Sentence['level'],
    topic:   c.lesson.toLowerCase().replace(/\s+/g, '-'),
  }))
}
