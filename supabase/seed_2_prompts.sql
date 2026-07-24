-- PARCA 2/4 — Ilk 6 prompt. Parca 1'den sonra calistir.
insert into public.prompts (id, user_id, category_id, title, description, content, parent_id, created_at) values
  ('a0000000-0000-4000-8000-000000000001',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='yazilim'),
   'Explain this code like I''m five',
   'Paste any code and get a plain-language walkthrough with no jargon.',
   'You are a patient senior engineer. Explain the following code to a complete beginner. Avoid jargon. When a technical term is unavoidable, define it in one short sentence. Finish with a single line summarising what the code does overall.

Code:
[paste your code here]',
   null, now() - interval '38 days'),

  ('a0000000-0000-4000-8000-000000000002',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='yazilim'),
   'Explain this code like a senior reviewing a PR',
   'A fork of the beginner version, tuned for code review instead.',
   'You are a senior engineer reviewing a pull request. Read the code below and give direct, specific feedback: correctness bugs first, then edge cases, then style. Point to the exact line. Skip praise and skip anything that is already fine.

Code:
[paste your code here]',
   'a0000000-0000-4000-8000-000000000001', now() - interval '20 days'),

  ('a0000000-0000-4000-8000-000000000003',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='yazilim'),
   'SQL query from a plain-English question',
   'Describe what you want in words, get the query back with an explanation.',
   'You write PostgreSQL. Given the table schema and a question in plain English, return one query that answers it. Add a one-line comment above the query explaining the approach. If the question is ambiguous, state the assumption you made instead of asking.

Schema:
[paste your CREATE TABLE statements]

Question:
[what do you want to know?]',
   null, now() - interval '26 days'),

  ('a0000000-0000-4000-8000-000000000004',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='oyun-gelistirme'),
   'Balance a game economy',
   'Sanity-check resource costs and rewards before players break them.',
   'Act as a game economy designer. I will give you the resources, their sources, and their sinks. Find the exploits: any loop where a player gains more than they spend, or a resource that becomes useless. List each problem with the numbers that cause it and a suggested fix.

Economy:
[describe resources, how players earn them, and what they spend them on]',
   null, now() - interval '24 days'),

  ('a0000000-0000-4000-8000-000000000005',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='oyun-gelistirme'),
   'NPC dialogue with a consistent voice',
   'Keep a character sounding like themselves across every line.',
   'You are writing dialogue for a single game character. First I give you their personality, background, and how they speak. Then I give you situations, and you return only their lines, no narration. Stay in voice even when the situation is mundane. Keep each line short enough to fit a dialogue box.

Character:
[name, personality, speech style, background]',
   null, now() - interval '22 days'),

  ('a0000000-0000-4000-8000-000000000006',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='animasyon'),
   'Storyboard a scene from a script',
   'Turn a written scene into shot by shot camera directions.',
   'You are a storyboard artist. Break the scene below into numbered shots. For each shot give the framing (wide, medium, close), what is in frame, any camera movement, and the rough duration in seconds. Keep it practical for a small animation team.

Scene:
[paste the scene from your script]',
   null, now() - interval '19 days')
on conflict (id) do nothing;
