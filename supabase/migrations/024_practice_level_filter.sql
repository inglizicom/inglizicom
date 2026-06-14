-- Practice games: only serve level-appropriate challenges (A0 students get A0,
-- A1 gets A0+A1, …) so beginners aren't frustrated, and make "lesson" scope
-- fall back to the level pool when the unit has no linked challenges (no empty).
create or replace function public.student_challenges(p_token text, p_type text, p_mode text, p_scope text, p_module uuid default null::uuid, p_limit integer default 8)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_id uuid; v jsonb; v_level text; v_levels text[]; v_use boolean;
begin
  select id, coalesce(nullif(current_level,''),'A0') into v_id, v_level
  from crm_students where verification_token = upper(trim(p_token)) and deleted_at is null;
  if v_id is null then return '[]'::jsonb; end if;
  v_levels := case v_level
    when 'A0' then array['A0']
    when 'A1' then array['A0','A1']
    when 'A2' then array['A0','A1','A2']
    else array['A0','A1','A2','B1'] end;
  if p_type = 'translation' then
    v_use := (p_scope = 'lesson' and p_module is not null
              and exists(select 1 from translation_challenges where module_id = p_module and is_active));
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'mode', 'translate', 'arabic', x.arabic, 'choices', x.choices)), '[]'::jsonb) into v
    from (select * from translation_challenges c
          where c.is_active and c.level = any(v_levels) and (not v_use or c.module_id = p_module)
          order by random() limit greatest(1, least(p_limit, 20))) x;
  else
    v_use := (p_scope = 'lesson' and p_module is not null
              and exists(select 1 from sentence_challenges where module_id = p_module and is_active));
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'mode', p_mode, 'arabic', x.arabic,
      'words', case when p_mode = 'arrange' then (select jsonb_agg(w order by random()) from regexp_split_to_table(x.english, '\s+') w) else null end)), '[]'::jsonb) into v
    from (select * from sentence_challenges c
          where c.is_active and c.level = any(v_levels) and (not v_use or c.module_id = p_module)
          order by random() limit greatest(1, least(p_limit, 20))) x;
  end if;
  return v;
end; $function$;
