-- PARCA 3/4 — Kalan 6 prompt. Parca 2'den sonra calistir.
insert into public.prompts (id, user_id, category_id, title, description, content, parent_id, created_at) values
  ('a0000000-0000-4000-8000-000000000007',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='icerik-uretme'),
   'Blog outline that isn''t generic',
   'An outline built around a real angle, not the same five headings.',
   'You are an editor who hates filler. Given a topic and audience, propose three different angles the post could take. Pick the strongest one and explain why in a sentence. Then outline it: a working title, the sections, and one concrete example or data point to include in each. No "introduction / conclusion" placeholders.

Topic: [your topic]
Audience: [who reads this]',
   null, now() - interval '17 days'),

  ('a0000000-0000-4000-8000-000000000008',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='icerik-uretme'),
   'Turn messy notes into a clean summary',
   'Paste raw meeting or reading notes, get a structured summary back.',
   'Take the raw notes below and turn them into a clean summary. Structure it as: the main point in one sentence, then the key details as short bullets, then any decisions or action items with who owns them. Drop repetition and anything that isn''t load-bearing. Keep my original wording where it''s already clear.

Notes:
[paste your notes]',
   null, now() - interval '15 days'),

  ('a0000000-0000-4000-8000-000000000009',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='veri-analizi'),
   'Explain a dataset in plain language',
   'Point it at a table and get a readable description of what''s in it.',
   'You are a data analyst. I paste the column names and a few sample rows. Tell me, in plain language, what this dataset appears to describe, what each column likely means, which columns look like keys, and anything that seems off (missing values, odd types, likely duplicates). Flag guesses as guesses.

Sample:
[paste column headers and 3-5 rows]',
   null, now() - interval '12 days'),

  ('a0000000-0000-4000-8000-000000000010',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='egitim'),
   'A two-week study plan for any topic',
   'Give it a subject and your free hours, get a realistic day-by-day plan.',
   'Build a two-week study plan for the topic below. I have [hours] free per day. For each day, give one focused goal, a resource type to use (read / watch / practice), and a small task to check I actually learned it. Front-load fundamentals. Keep it realistic, no 10-hour days.

Topic: [what I want to learn]
Starting level: [beginner / some experience]',
   null, now() - interval '10 days'),

  ('a0000000-0000-4000-8000-000000000011',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='pazarlama'),
   'Cold email that gets a reply',
   'Short, specific, and about them, not three paragraphs about you.',
   'Write a cold email under 90 words. It should open with something specific about the recipient (I''ll give you the detail), make one clear ask, and give one reason it''s worth their time. No buzzwords, no "I hope this email finds you well," no fake urgency. End with a single easy question.

Recipient: [who they are, and the specific detail]
My ask: [what I want]',
   null, now() - interval '7 days'),

  ('a0000000-0000-4000-8000-000000000012',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='tasarim'),
   'Color palette from a mood',
   'Describe a feeling or scene, get a usable palette with hex codes.',
   'You are a designer building a color palette. I describe a mood, brand, or scene. Return five colors: a background, a main text color, one primary accent, and two supporting colors. Give hex codes, a one-word role for each, and confirm the text-on-background contrast is readable. Keep it to one cohesive palette, not options.

Mood: [describe the feeling or scene]',
   null, now() - interval '4 days')
on conflict (id) do nothing;
