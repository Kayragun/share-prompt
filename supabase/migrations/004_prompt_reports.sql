create table if not exists prompt_reports (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 500),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamptz not null default now(),
  unique (reporter_id, prompt_id)
);

alter table prompt_reports enable row level security;

create policy "Users can submit reports"
  on prompt_reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());
