/**
 * Supabase DB layer for content items.
 *
 * Run this SQL once in your Supabase Dashboard → SQL Editor:
 *
 *   create table if not exists content_items (
 *     id           text        primary key,
 *     sentence     text        not null,
 *     arabic_sentence text,
 *     options      jsonb       not null,
 *     correct_index smallint   not null,
 *     level        text        not null,
 *     lesson       text        not null,
 *     status       text        not null default 'draft',
 *     video_url    text,
 *     video_name   text,
 *     created_at   timestamptz default now(),
 *     updated_at   timestamptz default now()
 *   );
 *
 *   alter table content_items enable row level security;
 *   create policy "Public read published" on content_items
 *     for select using (status = 'published');
 *   create policy "Anon full access" on content_items
 *     for all using (true) with check (true);
 */

import { supabase } from './supabase'
import type { ContentItem } from './content-store'

// ─── Row → ContentItem ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToItem(row: any): ContentItem {
  return {
    id:             row.id,
    sentence:       row.sentence,
    arabicSentence: row.arabic_sentence ?? undefined,
    options:        row.options as [string, string, string],
    correctIndex:   row.correct_index as 0 | 1 | 2,
    level:          row.level,
    lesson:         row.lesson,
    status:         row.status,
    videoUrl:       row.video_url ?? null,
    videoName:      row.video_name ?? null,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch all published items from Supabase — used by the listen page. */
export async function fetchPublishedContent(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchPublishedContent error:', error.message)
    return []
  }
  const items = (data ?? []).map(rowToItem)
  console.log('CONTENT:', items)
  return items
}

/** Upsert a content item — called by admin on save/publish/toggle. */
export async function upsertContentItem(item: ContentItem): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .upsert({
      id:              item.id,
      sentence:        item.sentence,
      arabic_sentence: item.arabicSentence ?? null,
      options:         item.options,
      correct_index:   item.correctIndex,
      level:           item.level,
      lesson:          item.lesson,
      status:          item.status,
      video_url:       item.videoUrl,
      video_name:      item.videoName,
      created_at:      item.createdAt,
      updated_at:      item.updatedAt,
    })

  if (error) console.error('upsertContentItem error:', error.message)
}

/** Delete a content item — called by admin on delete. */
export async function deleteContentItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id)

  if (error) console.error('deleteContentItem error:', error.message)
}
