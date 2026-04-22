-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  username        text unique not null,
  full_name       text,
  avatar_url      text,
  profession      text,
  education       text,
  show_profession boolean default true,
  show_education  boolean default true,
  created_at      timestamptz default now()
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
create table public.categories (
  id      serial primary key,
  slug    text unique not null,
  name_tr text not null,
  name_en text not null,
  icon    text
);

insert into public.categories (slug, name_tr, name_en, icon) values
  ('yazilim',         'Yazılım',          'Software',          '💻'),
  ('oyun-gelistirme', 'Oyun Geliştirme',  'Game Development',  '🎮'),
  ('animasyon',       'Animasyon',         'Animation',         '🎬'),
  ('icerik-uretme',   'İçerik Üretme',    'Content Creation',  '✍️'),
  ('veri-analizi',    'Veri Analizi',      'Data Analysis',     '📊'),
  ('egitim',          'Eğitim',            'Education',         '📚'),
  ('pazarlama',       'Pazarlama',         'Marketing',         '📣'),
  ('tasarim',         'Tasarım',           'Design',            '🎨'),
  ('arabalar',        'Arabalar',          'Cars',              '🚗'),
  ('diger',           'Diğer',             'Other',             '🔧');

-- ============================================================
-- 3. PROMPTS
-- ============================================================
create table public.prompts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  content     text not null,
  description text,
  category_id int references public.categories(id) not null,
  parent_id   uuid references public.prompts(id) on delete set null,
  star_count  int default 0,
  fork_count  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- updated_at auto-update
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prompts_updated_at
  before update on public.prompts
  for each row execute procedure public.set_updated_at();

-- fork_count trigger
create or replace function public.handle_fork_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.parent_id is not null then
    update public.prompts set fork_count = fork_count + 1 where id = new.parent_id;
  end if;
  return new;
end;
$$;

create trigger on_prompt_fork
  after insert on public.prompts
  for each row execute procedure public.handle_fork_insert();

-- ============================================================
-- 4. PROMPT OUTPUTS
-- ============================================================
create table public.prompt_outputs (
  id         uuid default gen_random_uuid() primary key,
  prompt_id  uuid references public.prompts(id) on delete cascade not null,
  type       text check (type in ('text', 'image')) not null,
  content    text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. PROMPT STARS
-- ============================================================
create table public.prompt_stars (
  user_id    uuid references public.profiles(id) on delete cascade,
  prompt_id  uuid references public.prompts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, prompt_id)
);

-- star_count triggers
create or replace function public.handle_star_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.prompts set star_count = star_count + 1 where id = new.prompt_id;
  return new;
end;
$$;

create or replace function public.handle_star_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.prompts set star_count = greatest(star_count - 1, 0) where id = old.prompt_id;
  return old;
end;
$$;

create trigger on_star_insert
  after insert on public.prompt_stars
  for each row execute procedure public.handle_star_insert();

create trigger on_star_delete
  after delete on public.prompt_stars
  for each row execute procedure public.handle_star_delete();

-- ============================================================
-- 6. RLS
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.categories      enable row level security;
alter table public.prompts         enable row level security;
alter table public.prompt_outputs  enable row level security;
alter table public.prompt_stars    enable row level security;

-- profiles
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- categories (read-only for everyone)
create policy "categories_select" on public.categories for select using (true);

-- prompts
create policy "prompts_select"  on public.prompts for select using (true);
create policy "prompts_insert"  on public.prompts for insert with check (auth.uid() = user_id);
create policy "prompts_update"  on public.prompts for update using (auth.uid() = user_id);
create policy "prompts_delete"  on public.prompts for delete using (auth.uid() = user_id);

-- prompt_outputs
create policy "outputs_select" on public.prompt_outputs for select using (true);
create policy "outputs_insert" on public.prompt_outputs for insert
  with check (auth.uid() = (select user_id from public.prompts where id = prompt_id));
create policy "outputs_delete" on public.prompt_outputs for delete
  using (auth.uid() = (select user_id from public.prompts where id = prompt_id));

-- prompt_stars
create policy "stars_select" on public.prompt_stars for select using (true);
create policy "stars_insert" on public.prompt_stars for insert with check (auth.uid() = user_id);
create policy "stars_delete" on public.prompt_stars for delete using (auth.uid() = user_id);
