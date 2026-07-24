-- PARCA 4/4 — Ornek ciktilar + yildiz/fork sayilari. Parca 3'ten sonra calistir.
insert into public.prompt_outputs (id, prompt_id, type, content) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'text',
   'This code takes a list of numbers and adds them up. It starts a running total at zero, then goes through the list one number at a time and adds each to the total. A "loop" just means doing the same step for every item. At the end it hands back the total. In short, it sums the numbers in a list.'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'text',
   'Group orders by customer and keep only those who spent over 1000:

select customer_id, sum(total) as spent
from orders
group by customer_id
having sum(total) > 1000
order by spent desc'),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000009', 'text',
   'This looks like an e-commerce orders table. order_id is the primary key. customer_id links to a customers table. total is the order amount and status is the fulfilment state. Two rows have a null shipped_at, which likely means those orders aren''t shipped yet rather than missing data. Watch the total column, one value is negative, probably a refund.'),
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000011', 'text',
   'Subject: your talk on retention

Hi Sam, your QCon talk on cohort retention was the first one that actually showed the messy version, not a clean funnel. We''re wrestling with the same drop at week three. Could I send two charts and get your gut read? Ten minutes, no pitch. Worth a look?'),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000012', 'text',
   'Background #0F1115 (base), Text #E8E8EA (ink), Accent #E0A24E (amber), Support #3B6E8F (slate blue) and #7A5C8F (muted violet). Amber on the dark base is well above readable contrast, so use it for buttons and links only and it stays a signal, not decoration.')
on conflict (id) do nothing;

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
