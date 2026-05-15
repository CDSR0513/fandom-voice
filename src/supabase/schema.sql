-- 아이유 전용 팬덤 보이스 · Supabase 스키마 참고

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  artist_name text not null default '아이유',
  category text not null default 'agency',
  urgency_level text not null default 'normal',
  empathy_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  content text not null,
  author_name text not null default '팬',
  empathy_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table comments;
