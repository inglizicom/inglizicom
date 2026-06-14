-- Vocabulary word-bank + mixed games (listen / match / spell). A0/A1.
create table if not exists vocab_words (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  en text not null,
  ar text not null,
  emoji text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_vocab_level on vocab_words(level) where is_active;
alter table vocab_words enable row level security;
drop policy if exists vocab_words_staff on vocab_words;
create policy vocab_words_staff on vocab_words for all using (is_crm_staff(auth.uid())) with check (is_crm_staff(auth.uid()));

create or replace function public.student_vocab(p_token text, p_limit int default 12)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; v_level text; v_levels text[]; v jsonb;
begin
  select id, coalesce(nullif(current_level,''),'A0') into v_id, v_level
  from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  v_levels := case v_level when 'A0' then array['A0'] when 'A1' then array['A0','A1']
    when 'A2' then array['A0','A1','A2'] else array['A0','A1','A2','B1'] end;
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'en', x.en, 'ar', x.ar, 'emoji', x.emoji)), '[]'::jsonb) into v
  from (select * from vocab_words c where c.is_active and c.level = any(v_levels)
        order by random() limit greatest(4, least(p_limit, 20))) x;
  return v;
end; $$;

create or replace function public.student_vocab_reward(p_token text, p_word_ids uuid[])
returns integer language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid; w uuid; total int := 0;
begin
  select id into v_id from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null and is_active = true;
  if v_id is null then return 0; end if;
  foreach w in array coalesce(p_word_ids, '{}'::uuid[]) loop
    total := total + _award(v_id, 'vocab', 5, null, null, null, 'game', null, 'vocab:' || w::text || ':' || current_date::text);
  end loop;
  if total > 0 then
    insert into student_activity (student_id, event_type, entity_type, entity_id, entity_title)
    values (v_id, 'vocab_game', 'game', 'vocab', 'ألعاب المفردات');
  end if;
  return total;
end; $$;

grant execute on function public.student_vocab(text, int) to anon, authenticated, service_role;
grant execute on function public.student_vocab_reward(text, uuid[]) to anon, authenticated, service_role;
