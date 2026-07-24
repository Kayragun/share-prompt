-- ============================================================
-- SEED DATA — resmi SharePrompt hesabi ile demo icerik
-- SQL Editor'de BIR KEZ calistir. Idempotent: tekrar calistirmak guvenli.
-- Hesap sifresi (istege bagli giris icin): seedpass123
-- ============================================================

-- ------------------------------------------------------------
-- 1. Resmi SharePrompt hesabi (auth.users) — trigger profili otomatik olusturur
-- ------------------------------------------------------------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password,
   email_confirmed_at, created_at, updated_at,
   raw_app_meta_data, raw_user_meta_data,
   is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'hello@shareprompt.app', crypt('seedpass123', gen_salt('bf')),
   now(), now() - interval '45 days', now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"shareprompt","full_name":"SharePrompt"}',
   false, '', '', '', '')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. Promptlar (hepsi SharePrompt hesabina ait)
-- ------------------------------------------------------------
-- Kategori id'leri slug uzerinden alinir (id'ler degisse de calisir)
insert into public.prompts (id, user_id, category_id, title, description, content, parent_id, created_at) values
  ('a0000000-0000-4000-8000-000000000001',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='yazilim'),
   'Explain this code like I''m five',
   'Paste any code and get a plain-language walkthrough with no jargon.',
   'You are a patient senior engineer. Explain the following code to a complete beginner. Avoid jargon; when a technical term is unavoidable, define it in one short sentence. Finish with a single line summarising what the code does overall.

Code:
{paste your code here}',
   null, now() - interval '38 days'),

  ('a0000000-0000-4000-8000-000000000002',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='yazilim'),
   'Explain this code like a senior reviewing a PR',
   'A fork of the beginner version, tuned for code review instead.',
   'You are a senior engineer reviewing a pull request. Read the code below and give direct, specific feedback: correctness bugs first, then edge cases, then style. Point to the exact line. Skip praise and skip anything that is already fine.

Code:
{paste your code here}',
   'a0000000-0000-4000-8000-000000000001', now() - interval '20 days'),

  ('a0000000-0000-4000-8000-000000000003',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='yazilim'),
   'SQL query from a plain-English question',
   'Describe what you want in words, get the query back with an explanation.',
   'You write PostgreSQL. Given the table schema and a question in plain English, return one query that answers it. Add a one-line comment above the query explaining the approach. If the question is ambiguous, state the assumption you made instead of asking.

Schema:
{paste your CREATE TABLE statements}

Question:
{what do you want to know?}',
   null, now() - interval '26 days'),

  ('a0000000-0000-4000-8000-000000000004',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='oyun-gelistirme'),
   'Balance a game economy',
   'Sanity-check resource costs and rewards before players break them.',
   'Act as a game economy designer. I will give you the resources, their sources, and their sinks. Find the exploits: any loop where a player gains more than they spend, or a resource that becomes useless. List each problem with the numbers that cause it and a suggested fix.

Economy:
{describe resources, how players earn them, and what they spend them on}',
   null, now() - interval '24 days'),

  ('a0000000-0000-4000-8000-000000000005',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='oyun-gelistirme'),
   'NPC dialogue with a consistent voice',
   'Keep a character sounding like themselves across every line.',
   'You are writing dialogue for a single game character. First I give you their personality, background, and how they speak. Then I give you situations, and you return only their lines, no narration. Stay in voice even when the situation is mundane. Keep each line short enough to fit a dialogue box.

Character:
{name, personality, speech style, background}',
   null, now() - interval '22 days'),

  ('a0000000-0000-4000-8000-000000000006',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='animasyon'),
   'Storyboard a scene from a script',
   'Turn a written scene into shot by shot camera directions.',
   'You are a storyboard artist. Break the scene below into numbered shots. For each shot give the framing (wide, medium, close), what is in frame, any camera movement, and the rough duration in seconds. Keep it practical for a small animation team.

Scene:
{paste the scene from your script}',
   null, now() - interval '19 days'),

  ('a0000000-0000-4000-8000-000000000007',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='icerik-uretme'),
   'Blog outline that isn''t generic',
   'An outline built around a real angle, not the same five headings.',
   'You are an editor who hates filler. Given a topic and audience, propose three different angles the post could take. Pick the strongest one and explain why in a sentence. Then outline it: a working title, the sections, and one concrete example or data point to include in each. No "introduction / conclusion" placeholders.

Topic: {your topic}
Audience: {who reads this}',
   null, now() - interval '17 days'),

  ('a0000000-0000-4000-8000-000000000008',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='icerik-uretme'),
   'Turn messy notes into a clean summary',
   'Paste raw meeting or reading notes, get a structured summary back.',
   'Take the raw notes below and turn them into a clean summary. Structure it as: the main point in one sentence, then the key details as short bullets, then any decisions or action items with who owns them. Drop repetition and anything that isn''t load-bearing. Keep my original wording where it''s already clear.

Notes:
{paste your notes}',
   null, now() - interval '15 days'),

  ('a0000000-0000-4000-8000-000000000009',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='veri-analizi'),
   'Explain a dataset in plain language',
   'Point it at a table and get a readable description of what''s in it.',
   'You are a data analyst. I paste the column names and a few sample rows. Tell me, in plain language, what this dataset appears to describe, what each column likely means, which columns look like keys, and anything that seems off (missing values, odd types, likely duplicates). Flag guesses as guesses.

Sample:
{paste column headers and 3-5 rows}',
   null, now() - interval '12 days'),

  ('a0000000-0000-4000-8000-000000000010',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='egitim'),
   'A two-week study plan for any topic',
   'Give it a subject and your free hours, get a realistic day-by-day plan.',
   'Build a two-week study plan for the topic below. I have {hours} free per day. For each day, give one focused goal, a resource type to use (read / watch / practice), and a small task to check I actually learned it. Front-load fundamentals. Keep it realistic, no 10-hour days.

Topic: {what I want to learn}
Starting level: {beginner / some experience}',
   null, now() - interval '10 days'),

  ('a0000000-0000-4000-8000-000000000011',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='pazarlama'),
   'Cold email that gets a reply',
   'Short, specific, and about them, not three paragraphs about you.',
   'Write a cold email under 90 words. It should open with something specific about the recipient (I''ll give you the detail), make one clear ask, and give one reason it''s worth their time. No buzzwords, no "I hope this email finds you well," no fake urgency. End with a single easy question.

Recipient: {who they are, and the specific detail}
My ask: {what I want}',
   null, now() - interval '7 days'),

  ('a0000000-0000-4000-8000-000000000012',
   (select id from public.profiles where username='shareprompt'),
   (select id from public.categories where slug='tasarim'),
   'Color palette from a mood',
   'Describe a feeling or scene, get a usable palette with hex codes.',
   'You are a designer building a color palette. I describe a mood, brand, or scene. Return five colors: a background, a main text color, one primary accent, and two supporting colors. Give hex codes, a one-word role for each, and confirm the text-on-background contrast is readable. Keep it to one cohesive palette, not options.

Mood: {describe the feeling or scene}',
   null, now() - interval '4 days')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. Ornek ciktilar (metin)
-- ------------------------------------------------------------
insert into public.prompt_outputs (prompt_id, type, content) values
  ('a0000000-0000-4000-8000-000000000001', 'text',
   'This code takes a list of numbers and adds them up. It starts a running total at zero, then goes through the list one number at a time and adds each to the total. A "loop" just means doing the same step for every item. At the end it hands back the total. In short: it sums the numbers in a list.'),
  ('a0000000-0000-4000-8000-000000000003', 'text',
   'Group orders by customer and keep only those who spent over 1000:

select customer_id, sum(total) as spent
from orders
group by customer_id
having sum(total) > 1000
order by spent desc'),
  ('a0000000-0000-4000-8000-000000000009', 'text',
   'This looks like an e-commerce orders table. order_id is the primary key; customer_id links to a customers table. total is the order amount and status is the fulfilment state. Two rows have a null shipped_at, which likely means those orders aren''t shipped yet rather than missing data. Watch the total column, one value is negative, probably a refund.'),
  ('a0000000-0000-4000-8000-000000000011', 'text',
   'Subject: your talk on retention

Hi Sam, your QCon talk on cohort retention was the first one that actually showed the messy version, not a clean funnel. We''re wrestling with the same drop at week three. Could I send two charts and get your gut read? Ten minutes, no pitch. Worth a look?'),
  ('a0000000-0000-4000-8000-000000000012', 'text',
   'Background #0F1115 (base), Text #E8E8EA (ink), Accent #E0A24E (amber), Support #3B6E8F (slate blue) and #7A5C8F (muted violet). Amber on the dark base is well above readable contrast; use it for buttons and links only so it stays a signal, not decoration.');

-- ------------------------------------------------------------
-- 4. Yildiz ve fork sayilari (goruntu icin sabit degerler)
-- ------------------------------------------------------------
update public.prompts set star_count = 47, fork_count = 3 where id = 'a0000000-0000-4000-8000-000000000001';
update public.prompts set star_count = 12, fork_count = 0 where id = 'a0000000-0000-4000-8000-000000000002';
update public.prompts set star_count = 31, fork_count = 1 where id = 'a0000000-0000-4000-8000-000000000003';
update public.prompts set star_count = 18, fork_count = 0 where id = 'a0000000-0000-4000-8000-000000000004';
update public.prompts set star_count = 22, fork_count = 2 where id = 'a0000000-0000-4000-8000-000000000005';
update public.prompts set star_count = 9,  fork_count = 0 where id = 'a0000000-0000-4000-8000-000000000006';
update public.prompts set star_count = 26, fork_count = 1 where id = 'a0000000-0000-4000-8000-000000000007';
update public.prompts set star_count = 38, fork_count = 4 where id = 'a0000000-0000-4000-8000-000000000008';
update public.prompts set star_count = 15, fork_count = 0 where id = 'a0000000-0000-4000-8000-000000000009';
update public.prompts set star_count = 29, fork_count = 2 where id = 'a0000000-0000-4000-8000-000000000010';
update public.prompts set star_count = 20, fork_count = 1 where id = 'a0000000-0000-4000-8000-000000000011';
update public.prompts set star_count = 33, fork_count = 2 where id = 'a0000000-0000-4000-8000-000000000012';
