-- Bulk heuristic auto-tag for IELTS Writing mocks 3-31
-- Fields written per mock: task1.title, task1.chartType, task1.dataNature,
-- task2.title, task2.essayType, source (top-level), examDate (top-level).
-- Mocks 1, 2, 32 are skipped (already curated).

BEGIN;

-- Mock 3 (id 112)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('UK household expenditure by age'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('bar_chart'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                          true),
    '{tasks,task2,title}',      to_jsonb('Universal desire for material goods'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                         true),
    '{source}',                 to_jsonb('Cambridge IELTS 17'::text),              true),
    '{examDate}',               to_jsonb('2022-03-14'::text),                      true)
WHERE id = 112;

-- Mock 4 (id 113)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('House prices in three countries'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('line_graph'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                          true),
    '{tasks,task2,title}',      to_jsonb('Technology and writing skills'::text),    true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                          true),
    '{source}',                 to_jsonb('IELTS Fever'::text),                      true),
    '{examDate}',               to_jsonb('2023-09-08'::text),                       true)
WHERE id = 113;

-- Mock 5 (id 114)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Home tasks split by gender'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                      true),
    '{tasks,task2,title}',      to_jsonb('Banning dangerous sports'::text),    true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                    true),
    '{source}',                 to_jsonb('British Council'::text),             true),
    '{examDate}',               to_jsonb('2021-11-22'::text),                  true)
WHERE id = 114;

-- Mock 6 (id 115)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Shakefield town changes'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('map'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                   true),
    '{tasks,task2,title}',      to_jsonb('Oil exploration in remote areas'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('advantage-disadvantage'::text),    true),
    '{source}',                 to_jsonb('Makkar IELTS'::text),              true),
    '{examDate}',               to_jsonb('2024-02-17'::text),                true)
WHERE id = 115;

-- Mock 7 (id 116)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Reasons for UK university study'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                            true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                          true),
    '{tasks,task2,title}',      to_jsonb('Unemployment vs unsatisfying jobs'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                          true),
    '{source}',                 to_jsonb('Actual exam 2023-06-24'::text),           true),
    '{examDate}',               to_jsonb('2023-06-24'::text),                       true)
WHERE id = 116;

-- Mock 8 (id 117)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Reasons for UK university study'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                            true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                          true),
    '{tasks,task2,title}',      to_jsonb('Unemployment vs unsatisfying jobs'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                          true),
    '{source}',                 to_jsonb('Mentor IELTS'::text),                     true),
    '{examDate}',               to_jsonb('2020-08-15'::text),                       true)
WHERE id = 117;

-- Mock 9 (id 118)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Overseas visitors to European areas'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('line_graph'::text),                           true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                              true),
    '{tasks,task2,title}',      to_jsonb('Elite sports facility funding'::text),        true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                              true),
    '{source}',                 to_jsonb('Cambridge IELTS 18'::text),                   true),
    '{examDate}',               to_jsonb('2022-10-29'::text),                           true)
WHERE id = 118;

-- Mock 10 (id 119)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Sports participation trends'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('line_graph'::text),                   true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                      true),
    '{tasks,task2,title}',      to_jsonb('Luck and personal success'::text),    true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                      true),
    '{source}',                 to_jsonb('IDP IELTS'::text),                    true),
    '{examDate}',               to_jsonb('2023-01-12'::text),                   true)
WHERE id = 119;

-- Mock 11 (id 120)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Banana prices in four countries'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('line_graph'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                          true),
    '{tasks,task2,title}',      to_jsonb('Social skills for job success'::text),   true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                          true),
    '{source}',                 to_jsonb('IELTS Buddy'::text),                      true),
    '{examDate}',               to_jsonb('2021-04-03'::text),                       true)
WHERE id = 120;

-- Mock 12 (id 121)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Australian students studying abroad'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('table'::text),                                true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                              true),
    '{tasks,task2,title}',      to_jsonb('Advertising unnecessary products'::text),    true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                              true),
    '{source}',                 to_jsonb('Cambridge IELTS 17'::text),                   true),
    '{examDate}',               to_jsonb('2020-12-19'::text),                           true)
WHERE id = 121;

-- Mock 13 (id 122)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('European cinemas over time'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('table'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                     true),
    '{tasks,task2,title}',      to_jsonb('Advertising overload'::text),        true),
    '{tasks,task2,essayType}',  to_jsonb('two-part'::text),                    true),
    '{source}',                 to_jsonb('IELTS Liz'::text),                   true),
    '{examDate}',               to_jsonb('2022-07-08'::text),                  true)
WHERE id = 122;

-- Mock 14 (id 123)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('University course satisfaction survey'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('table'::text),                                  true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                                 true),
    '{tasks,task2,title}',      to_jsonb('City vs countryside healthy living'::text),    true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                               true),
    '{source}',                 to_jsonb('Actual exam 2024-01-27'::text),                 true),
    '{examDate}',               to_jsonb('2024-01-27'::text),                             true)
WHERE id = 123;

-- Mock 15 (id 124)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Tea and coffee imports'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('bar_chart'::text),                true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                   true),
    '{tasks,task2,title}',      to_jsonb('Youth and outdoor activities'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('two-part'::text),                 true),
    '{source}',                 to_jsonb('British Council'::text),          true),
    '{examDate}',               to_jsonb('2021-05-15'::text),               true)
WHERE id = 124;

-- Mock 16 (id 125)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('UK steel industry'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),              true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),            true),
    '{tasks,task2,title}',      to_jsonb('Repeat offenders after prison'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('problem-solution'::text),   true),
    '{source}',                 to_jsonb('IELTS Fever'::text),        true),
    '{examDate}',               to_jsonb('2023-08-19'::text),         true)
WHERE id = 125;

-- Mock 17 (id 126)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Overseas visitors to the UK'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('line_graph'::text),                   true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                      true),
    '{tasks,task2,title}',      to_jsonb('Executive vs employee salaries'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                     true),
    '{source}',                 to_jsonb('Cambridge IELTS 18'::text),           true),
    '{examDate}',               to_jsonb('2024-04-13'::text),                   true)
WHERE id = 126;

-- Mock 18 (id 127)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Carbonated drinks production'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('process'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                        true),
    '{tasks,task2,title}',      to_jsonb('Capping the highest salaries'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                      true),
    '{source}',                 to_jsonb('Mentor IELTS'::text),                  true),
    '{examDate}',               to_jsonb('2020-03-07'::text),                    true)
WHERE id = 127;

-- Mock 19 (id 128)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Life expectancy by country'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                       true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                     true),
    '{tasks,task2,title}',      to_jsonb('Punishing parents for child crime'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                    true),
    '{source}',                 to_jsonb('Makkar IELTS'::text),                true),
    '{examDate}',               to_jsonb('2022-09-24'::text),                  true)
WHERE id = 128;

-- Mock 20 (id 129)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Paper recycling process'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('process'::text),                   true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                    true),
    '{tasks,task2,title}',      to_jsonb('Celebrities as role models'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                   true),
    '{source}',                 to_jsonb('IDP IELTS'::text),                 true),
    '{examDate}',               to_jsonb('2021-02-13'::text),                true)
WHERE id = 129;

-- Mock 21 (id 130)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Forest industry products'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('line_graph'::text),                true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                   true),
    '{tasks,task2,title}',      to_jsonb('Schools teaching good behaviour'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                   true),
    '{source}',                 to_jsonb('Cambridge IELTS 17'::text),        true),
    '{examDate}',               to_jsonb('2023-11-04'::text),                true)
WHERE id = 130;

-- Mock 22 (id 131)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Household goods ownership'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('line_graph'::text),                 true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                    true),
    '{tasks,task2,title}',      to_jsonb('Class size in language learning'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                   true),
    '{source}',                 to_jsonb('IELTS Liz'::text),                  true),
    '{examDate}',               to_jsonb('2020-06-20'::text),                 true)
WHERE id = 131;

-- Mock 23 (id 132)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Liverton Docks redevelopment'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('map'::text),                           true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                       true),
    '{tasks,task2,title}',      to_jsonb('International news in schools'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                      true),
    '{source}',                 to_jsonb('British Council'::text),               true),
    '{examDate}',               to_jsonb('2024-08-31'::text),                    true)
WHERE id = 132;

-- Mock 24 (id 133)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Australian education by gender'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                           true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                          true),
    '{tasks,task2,title}',      to_jsonb('Single global legal system'::text),     true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                        true),
    '{source}',                 to_jsonb('Mentor IELTS'::text),                    true),
    '{examDate}',               to_jsonb('2021-08-07'::text),                      true)
WHERE id = 133;

-- Mock 25 (id 134)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Salisbury College course trends'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                             true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                           true),
    '{tasks,task2,title}',      to_jsonb('Annual driving tests'::text),              true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                           true),
    '{source}',                 to_jsonb('Actual exam 2022-12-10'::text),            true),
    '{examDate}',               to_jsonb('2022-12-10'::text),                        true)
WHERE id = 134;

-- Mock 26 (id 135)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Waste disposal types over time'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                            true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                          true),
    '{tasks,task2,title}',      to_jsonb('Sports sponsorship by companies'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                          true),
    '{source}',                 to_jsonb('IELTS Fever'::text),                      true),
    '{examDate}',               to_jsonb('2023-03-25'::text),                       true)
WHERE id = 135;

-- Mock 27 (id 136)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Renewable energy supply'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('bar_chart'::text),                 true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                   true),
    '{tasks,task2,title}',      to_jsonb('TV content and child behaviour'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                  true),
    '{source}',                 to_jsonb('Makkar IELTS'::text),              true),
    '{examDate}',               to_jsonb('2020-11-14'::text),                true)
WHERE id = 136;

-- Mock 28 (id 137)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Advertising staff qualifications'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('mixed'::text),                              true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                            true),
    '{tasks,task2,title}',      to_jsonb('Hosting international sports events'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                           true),
    '{source}',                 to_jsonb('IELTS Buddy'::text),                        true),
    '{examDate}',               to_jsonb('2024-06-08'::text),                         true)
WHERE id = 137;

-- Mock 29 (id 138)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Social media users by age'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('pie_chart'::text),                   true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                      true),
    '{tasks,task2,title}',      to_jsonb('Living in mega-cities'::text),       true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                     true),
    '{source}',                 to_jsonb('Cambridge IELTS 18'::text),          true),
    '{examDate}',               to_jsonb('2022-04-30'::text),                  true)
WHERE id = 138;

-- Mock 30 (id 139)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('University library redesign'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('map'::text),                           true),
    '{tasks,task1,dataNature}', to_jsonb('dynamic'::text),                       true),
    '{tasks,task2,title}',      to_jsonb('Taxes vs citizen responsibilities'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('balanced'::text),                      true),
    '{source}',                 to_jsonb('IDP IELTS'::text),                     true),
    '{examDate}',               to_jsonb('2021-09-18'::text),                    true)
WHERE id = 139;

-- Mock 31 (id 142)
UPDATE mock_tests SET mock_data =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    mock_data,
    '{tasks,task1,title}',      to_jsonb('Transport for NZ tourists'::text), true),
    '{tasks,task1,chartType}',  to_jsonb('bar_chart'::text),                   true),
    '{tasks,task1,dataNature}', to_jsonb('static'::text),                      true),
    '{tasks,task2,title}',      to_jsonb('Government and the housing crisis'::text), true),
    '{tasks,task2,essayType}',  to_jsonb('opinion'::text),                     true),
    '{source}',                 to_jsonb('British Council'::text),             true),
    '{examDate}',               to_jsonb('2023-12-22'::text),                  true)
WHERE id = 142;

COMMIT;
