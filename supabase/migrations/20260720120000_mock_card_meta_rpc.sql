-- Slim card-metadata RPC for the v3 pickers (perf, applied 2026-07-20 via MCP
-- as "mock_card_meta_rpc"). Pickers previously fetched full mock_data JSONB for
-- every mock just to render catalog cards. Returns jsonb array of
-- {id, mock_number, title, created_at, md}; md preserves the SHAPE each
-- picker's _XBuildMetaFromMockData expects but keeps only card fields.
-- answers/correctAnswers keep their KEYS (values -> 1) so key-count readiness
-- checks work without shipping answer content. prompts left(240),
-- transcripts left(500) (clet topic extraction reads first 500 chars).
-- Wins: ielts-speaking 11.3MB->247KB, cefr-speaking 4.1MB->80KB, ielts-writing
-- 1.65MB->39KB, ielts-reading 3.9MB->110KB, cefr-reading 2.2MB->111KB,
-- ielts-listening 2.8MB->96KB, cefr-listening 1.7MB->207KB.
create or replace function public.mock_card_meta(p_mock_type text)
returns jsonb
language plpgsql
stable
as $fn$
declare
  out jsonb;
begin
  if p_mock_type in ('cefr-speaking','ielts-speaking') then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'mock_number', m.mock_number, 'title', m.title, 'created_at', m.created_at,
      'md', jsonb_build_object(
        'tags',     m.mock_data->'tags',
        'examDate', m.mock_data->>'examDate',
        'title',    m.mock_data->>'title',
        'questions', coalesce((
          select jsonb_agg(jsonb_build_object(
                   'number', q->'number',
                   'part',   q->>'part',
                   'topic',  q->>'topic',
                   'prompt', left(q->>'prompt', 240)) order by ord)
          from jsonb_array_elements(
                 case when jsonb_typeof(m.mock_data->'questions')='array'
                      then m.mock_data->'questions' else '[]'::jsonb end
               ) with ordinality t(q, ord)
        ), '[]'::jsonb)
      )) order by m.mock_number), '[]'::jsonb)
    into out
    from mock_tests m
    where m.mock_type = p_mock_type and m.status = 'published';

  elsif p_mock_type = 'ielts-writing' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'mock_number', m.mock_number, 'title', m.title, 'created_at', m.created_at,
      'md', jsonb_build_object(
        'source',   m.mock_data->>'source',
        'examDate', m.mock_data->>'examDate',
        'tasks', jsonb_build_object(
          'task1', jsonb_build_object(
            'title',         m.mock_data->'tasks'->'task1'->>'title',
            'prompt',        left(m.mock_data->'tasks'->'task1'->>'prompt', 8),
            'chartImageUrl', left(m.mock_data->'tasks'->'task1'->>'chartImageUrl', 8),
            'wordGoal',      m.mock_data->'tasks'->'task1'->'wordGoal',
            'chartType',     m.mock_data->'tasks'->'task1'->>'chartType',
            'dataNature',    m.mock_data->'tasks'->'task1'->>'dataNature'),
          'task2', jsonb_build_object(
            'title',     m.mock_data->'tasks'->'task2'->>'title',
            'prompt',    left(m.mock_data->'tasks'->'task2'->>'prompt', 8),
            'wordGoal',  m.mock_data->'tasks'->'task2'->'wordGoal',
            'essayType', m.mock_data->'tasks'->'task2'->>'essayType')
        )
      )) order by m.mock_number), '[]'::jsonb)
    into out
    from mock_tests m
    where m.mock_type = p_mock_type and m.status = 'published';

  elsif p_mock_type = 'ielts-reading' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'mock_number', m.mock_number, 'title', m.title, 'created_at', m.created_at,
      'md', jsonb_build_object(
        'source',   m.mock_data->>'source',
        'examDate', m.mock_data->>'examDate',
        'passages', coalesce((
          select jsonb_agg(jsonb_build_object(
                   'shortName', p->>'shortName',
                   'title',     p->>'title',
                   'passage',   case
                                  when jsonb_typeof(p->'passage')='string'
                                    then to_jsonb(left(p->>'passage', 8))
                                  when jsonb_typeof(p->'passage')='object'
                                    then jsonb_build_object('content', left(p->'passage'->>'content', 8))
                                  else 'null'::jsonb
                                end,
                   'correctAnswers', (
                     select coalesce(jsonb_object_agg(k, 1), '{}'::jsonb)
                     from jsonb_object_keys(
                            case when jsonb_typeof(p->'correctAnswers')='object'
                                 then p->'correctAnswers' else '{}'::jsonb end
                          ) kk(k)
                   )) order by ord)
          from jsonb_array_elements(
                 case when jsonb_typeof(m.mock_data->'passages')='array'
                      then m.mock_data->'passages' else '[]'::jsonb end
               ) with ordinality t(p, ord)
        ), '[]'::jsonb)
      )) order by m.mock_number), '[]'::jsonb)
    into out
    from mock_tests m
    where m.mock_type = p_mock_type and m.status = 'published';

  elsif p_mock_type = 'cefr-reading' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'mock_number', m.mock_number, 'title', m.title, 'created_at', m.created_at,
      'md', jsonb_build_object(
        'source',   m.mock_data->>'source',
        'examDate', m.mock_data->>'examDate',
        'parts', coalesce((
          select jsonb_agg(jsonb_build_object(
                   'type',       p->>'type',
                   'topicTitle', p->>'topicTitle',
                   'passage',    case
                                   when jsonb_typeof(p->'passage')='string'
                                     then to_jsonb(left(p->>'passage', 80))
                                   when jsonb_typeof(p->'passage')='object'
                                     then jsonb_build_object(
                                            'title',   p->'passage'->>'title',
                                            'content', left(p->'passage'->>'content', 80),
                                            'paragraphs', case
                                              when jsonb_typeof(p->'passage'->'paragraphs')='array'
                                               and jsonb_array_length(p->'passage'->'paragraphs') > 0
                                                then jsonb_build_array(jsonb_build_object(
                                                       'content', left(p->'passage'->'paragraphs'->0->>'content', 80)))
                                              else '[]'::jsonb
                                            end)
                                   else 'null'::jsonb
                                 end,
                   'texts',      case
                                   when jsonb_typeof(p->'texts')='array'
                                    and jsonb_array_length(p->'texts') > 0
                                     then jsonb_build_array(jsonb_build_object(
                                            'content', left(p->'texts'->0->>'content', 80)))
                                   else '[]'::jsonb
                                 end,
                   'answers', (
                     select coalesce(jsonb_object_agg(k, 1), '{}'::jsonb)
                     from jsonb_object_keys(
                            case when jsonb_typeof(p->'answers')='object'
                                 then p->'answers' else '{}'::jsonb end
                          ) kk(k)
                   )) order by ord)
          from jsonb_array_elements(
                 case when jsonb_typeof(m.mock_data->'parts')='array'
                      then m.mock_data->'parts' else '[]'::jsonb end
               ) with ordinality t(p, ord)
        ), '[]'::jsonb)
      )) order by m.mock_number), '[]'::jsonb)
    into out
    from mock_tests m
    where m.mock_type = p_mock_type and m.status = 'published';

  elsif p_mock_type = 'cefr-listening' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'mock_number', m.mock_number, 'title', m.title, 'created_at', m.created_at,
      'md', jsonb_build_object(
        'source',   m.mock_data->>'source',
        'examDate', m.mock_data->>'examDate',
        'parts', coalesce((
          select jsonb_agg(jsonb_build_object(
                   'title',      p->>'title',
                   'formTitle',  p->>'formTitle',
                   'mapTitle',   p->>'mapTitle',
                   'partNumber', p->'partNumber',
                   'type',       p->>'type',
                   'transcript', left(p->>'transcript', 500),
                   'extracts',   case
                                   when jsonb_typeof(p->'extracts')='array'
                                    and jsonb_array_length(p->'extracts') > 0
                                     then jsonb_build_array(jsonb_build_object(
                                            'title', p->'extracts'->0->>'title'))
                                   else '[]'::jsonb
                                 end,
                   'answers', (
                     select coalesce(jsonb_object_agg(k, 1), '{}'::jsonb)
                     from jsonb_object_keys(
                            case when jsonb_typeof(p->'answers')='object'
                                 then p->'answers' else '{}'::jsonb end
                          ) kk(k)
                   )) order by ord)
          from jsonb_array_elements(
                 case when jsonb_typeof(m.mock_data->'parts')='array'
                      then m.mock_data->'parts' else '[]'::jsonb end
               ) with ordinality t(p, ord)
        ), '[]'::jsonb)
      )) order by m.mock_number), '[]'::jsonb)
    into out
    from mock_tests m
    where m.mock_type = p_mock_type and m.status = 'published';

  elsif p_mock_type = 'ielts-listening' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'mock_number', m.mock_number, 'title', m.title, 'created_at', m.created_at,
      'md', jsonb_build_object(
        'source',   m.mock_data->>'source',
        'examDate', m.mock_data->>'examDate',
        'parts', coalesce((
          select jsonb_agg(jsonb_build_object(
                   'title',      p->>'title',
                   'partNumber', p->'partNumber',
                   'answers', (
                     select coalesce(jsonb_object_agg(k, 1), '{}'::jsonb)
                     from jsonb_object_keys(
                            case when jsonb_typeof(p->'answers')='object'
                                 then p->'answers' else '{}'::jsonb end
                          ) kk(k)
                   )) order by ord)
          from jsonb_array_elements(
                 case when jsonb_typeof(m.mock_data->'parts')='array'
                      then m.mock_data->'parts' else '[]'::jsonb end
               ) with ordinality t(p, ord)
        ), '[]'::jsonb)
      )) order by m.mock_number), '[]'::jsonb)
    into out
    from mock_tests m
    where m.mock_type = p_mock_type and m.status = 'published';

  else
    out := '[]'::jsonb;
  end if;

  return out;
end;
$fn$;

grant execute on function public.mock_card_meta(text) to anon, authenticated;
