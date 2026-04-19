import { supabase } from './supabase'

export interface SupportThread {
  id:                   string
  user_id:              string
  subject:              string
  status:               'open' | 'closed'
  last_message_at:      string
  last_message_preview: string | null
  unread_for_admin:     boolean
  unread_for_user:      boolean
  created_at:           string
  updated_at:           string
}

export interface SupportMessage {
  id:          string
  thread_id:   string
  sender_id:   string | null
  sender_role: 'user' | 'admin'
  body:        string
  created_at:  string
}

export interface SupportThreadWithProfile extends SupportThread {
  profile: { email: string | null; full_name: string | null } | null
}

export async function fetchMyThreads(): Promise<SupportThread[]> {
  const { data, error } = await supabase
    .from('support_threads')
    .select('*')
    .order('last_message_at', { ascending: false })
  if (error) {
    console.error('fetchMyThreads', error.message)
    return []
  }
  return (data ?? []) as SupportThread[]
}

export async function fetchAllThreads(): Promise<SupportThreadWithProfile[]> {
  const { data, error } = await supabase
    .from('support_threads')
    .select('*')
    .order('last_message_at', { ascending: false })
  if (error) {
    console.error('fetchAllThreads', error.message)
    return []
  }
  const threads = (data ?? []) as SupportThread[]
  if (threads.length === 0) return []

  const userIds = Array.from(new Set(threads.map(t => t.user_id)))
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds)

  const byId = new Map((profiles ?? []).map(p => [p.id, p]))
  return threads.map(t => {
    const p = byId.get(t.user_id)
    return {
      ...t,
      profile: p ? { email: p.email, full_name: p.full_name } : null,
    }
  })
}

export async function fetchThread(id: string): Promise<SupportThread | null> {
  const { data, error } = await supabase
    .from('support_threads')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('fetchThread', error.message)
    return null
  }
  return data as SupportThread | null
}

export async function fetchMessages(threadId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('fetchMessages', error.message)
    return []
  }
  return (data ?? []) as SupportMessage[]
}

export async function createThread(
  userId: string,
  subject: string,
  firstMessage: string,
): Promise<SupportThread> {
  const { data: thread, error: tErr } = await supabase
    .from('support_threads')
    .insert({ user_id: userId, subject })
    .select()
    .single()
  if (tErr || !thread) throw new Error(tErr?.message ?? 'thread insert failed')

  const { error: mErr } = await supabase.from('support_messages').insert({
    thread_id:   thread.id,
    sender_id:   userId,
    sender_role: 'user',
    body:        firstMessage,
  })
  if (mErr) throw new Error(mErr.message)

  return thread as SupportThread
}

export async function sendUserMessage(
  threadId: string,
  userId: string,
  body: string,
) {
  const { error } = await supabase.from('support_messages').insert({
    thread_id:   threadId,
    sender_id:   userId,
    sender_role: 'user',
    body,
  })
  if (error) throw new Error(error.message)
}

export async function sendAdminMessage(
  threadId: string,
  adminId: string,
  body: string,
) {
  const { error } = await supabase.from('support_messages').insert({
    thread_id:   threadId,
    sender_id:   adminId,
    sender_role: 'admin',
    body,
  })
  if (error) throw new Error(error.message)
}

export async function markReadForAdmin(threadId: string) {
  const { error } = await supabase
    .from('support_threads')
    .update({ unread_for_admin: false })
    .eq('id', threadId)
  if (error) throw new Error(error.message)
}

export async function markReadForUser(threadId: string) {
  const { error } = await supabase
    .from('support_threads')
    .update({ unread_for_user: false })
    .eq('id', threadId)
  if (error) throw new Error(error.message)
}

export async function setThreadStatus(
  threadId: string,
  status: 'open' | 'closed',
) {
  const { error } = await supabase
    .from('support_threads')
    .update({ status })
    .eq('id', threadId)
  if (error) throw new Error(error.message)
}
