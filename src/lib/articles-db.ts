import { unstable_noStore as noStore } from 'next/cache'
import { supabase } from './supabase'
import type { Article, BlockType } from '@/data/articles'

export type ArticleStatus = 'draft' | 'published'

export interface ArticleRow {
  id:              string
  slug:            string
  title:           string
  excerpt:         string
  content:         BlockType[]
  category:        string
  category_color:  string
  tags:            string[]
  read_time:       string
  date:            string
  img:             string
  featured:        boolean
  author:          string
  status:          ArticleStatus
  sort_order:      number
  created_at?:     string
  updated_at?:     string
}

function rowToArticle(r: ArticleRow): Article & { uuid: string; status: ArticleStatus } {
  return {
    uuid: r.id,
    id: 0,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    category: r.category,
    categoryColor: r.category_color,
    tags: r.tags,
    readTime: r.read_time,
    date: r.date,
    img: r.img,
    featured: r.featured,
    author: r.author,
    status: r.status,
  }
}

export async function fetchPublishedArticles() {
  noStore()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: false })
  if (error) { console.error('fetchPublishedArticles', error.message); return [] }
  return ((data ?? []) as ArticleRow[]).map(rowToArticle)
}

export async function fetchAllArticles() {
  noStore()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('sort_order', { ascending: false })
  if (error) { console.error('fetchAllArticles', error.message); return [] }
  return ((data ?? []) as ArticleRow[]).map(rowToArticle)
}

export async function fetchArticleBySlug(slug: string) {
  noStore()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) return null
  return rowToArticle(data as ArticleRow)
}

export async function upsertArticle(input: Partial<ArticleRow> & { slug: string }) {
  const { data, error } = await supabase
    .from('articles')
    .upsert(input, { onConflict: 'slug' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ArticleRow
}

export async function deleteArticle(id: string) {
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function bootstrapArticles(rows: Omit<ArticleRow, 'id' | 'created_at' | 'updated_at'>[]) {
  const { error } = await supabase.from('articles').upsert(rows, { onConflict: 'slug' })
  if (error) throw new Error(error.message)
}

export async function fetchRelatedArticles(currentSlug: string, category: string, limit = 3) {
  noStore()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('sort_order', { ascending: false })
    .limit(limit)
  if (error) { console.error('fetchRelatedArticles', error.message); return [] }
  return ((data ?? []) as ArticleRow[]).map(rowToArticle)
}

export async function fetchRecentArticles(limit = 5) {
  noStore()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: false })
    .limit(limit)
  if (error) { console.error('fetchRecentArticles', error.message); return [] }
  return ((data ?? []) as ArticleRow[]).map(rowToArticle)
}
