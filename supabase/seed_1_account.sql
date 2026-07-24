-- PARCA 1/4 — Resmi SharePrompt hesabi. Bunu ILK calistir.
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
