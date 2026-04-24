-- Add to supabase-schema.sql or run separately
-- Required for push notifications

create table push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  token text not null unique,
  platform text default 'web',
  updated_at timestamptz default now()
);

alter table push_tokens enable row level security;
create policy "push_tokens_own" on push_tokens for all using (auth.uid() = user_id);
create index idx_push_tokens_user on push_tokens(user_id);
