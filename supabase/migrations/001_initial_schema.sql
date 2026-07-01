-- ============================================================
-- docs-site — Initial Schema Migration
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- Profiles（auth.usersの拡張）
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  website     text,
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are viewable by everyone"
  on profiles for select using (true);

create policy "users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Organizations
-- ============================================================
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table organizations enable row level security;

create policy "members can view their org"
  on organizations for select
  using (
    id in (
      select organization_id from organization_members
      where user_id = auth.uid()
    )
  );

create policy "members can update their org if owner"
  on organizations for update
  using (
    id in (
      select organization_id from organization_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- ============================================================
-- Organization Members
-- ============================================================
create type member_role as enum ('owner', 'editor', 'viewer');

create table organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            member_role not null default 'viewer',
  created_at      timestamptz not null default now(),
  unique(organization_id, user_id)
);

alter table organization_members enable row level security;

create policy "members can view org membership"
  on organization_members for select
  using (user_id = auth.uid() or
    organization_id in (
      select organization_id from organization_members om2
      where om2.user_id = auth.uid()
    )
  );

create policy "owners can manage members"
  on organization_members for all
  using (
    organization_id in (
      select organization_id from organization_members om2
      where om2.user_id = auth.uid() and om2.role = 'owner'
    )
  );

-- Allow inserting first member (owner) when creating org
create policy "allow insert own membership"
  on organization_members for insert
  with check (user_id = auth.uid());

-- ============================================================
-- Invitations
-- ============================================================
create table invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email           text not null,
  role            member_role not null default 'editor',
  token           text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at      timestamptz not null default now() + interval '7 days',
  accepted_at     timestamptz,
  invited_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

alter table invitations enable row level security;

create policy "org owners can manage invitations"
  on invitations for all
  using (
    organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

create policy "anyone can view invitation by token"
  on invitations for select
  using (true);

-- ============================================================
-- Sites（公開ドキュメントサイト）
-- ============================================================
create table sites (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  slug            text not null,
  description     text,
  visibility      text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  custom_domain   text unique,
  favicon_url     text,
  logo_url        text,
  theme_config    jsonb not null default '{}',
  meta_config     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(organization_id, slug)
);

alter table sites enable row level security;

create policy "public sites are readable by all"
  on sites for select
  using (visibility = 'public' or
    organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid()
    )
  );

create policy "org editors can manage sites"
  on sites for all
  using (
    organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

-- ============================================================
-- Spaces（サイト内のコンテンツグループ）
-- ============================================================
create table spaces (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  position    integer not null default 0,
  git_repo    text,
  git_branch  text default 'main',
  git_path    text default '/docs',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(site_id, slug)
);

alter table spaces enable row level security;

create policy "spaces are readable based on site visibility"
  on spaces for select
  using (
    site_id in (
      select id from sites
      where visibility = 'public'
      or organization_id in (
        select organization_id from organization_members
        where user_id = auth.uid()
      )
    )
  );

create policy "org editors can manage spaces"
  on spaces for all
  using (
    site_id in (
      select s.id from sites s
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid() and om.role in ('owner', 'editor')
    )
  );

-- ============================================================
-- Pages
-- ============================================================
create table pages (
  id          uuid primary key default gen_random_uuid(),
  space_id    uuid not null references spaces(id) on delete cascade,
  parent_id   uuid references pages(id) on delete set null,
  title       text not null,
  slug        text not null,
  position    integer not null default 0,
  type        text not null default 'page' check (type in ('page', 'group', 'link', 'divider')),
  published   boolean not null default false,
  git_path    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(space_id, slug)
);

alter table pages enable row level security;

create policy "pages readable based on space/site visibility"
  on pages for select
  using (
    space_id in (
      select sp.id from spaces sp
      join sites s on s.id = sp.site_id
      where s.visibility = 'public'
      or s.organization_id in (
        select organization_id from organization_members
        where user_id = auth.uid()
      )
    )
  );

create policy "org editors can manage pages"
  on pages for all
  using (
    space_id in (
      select sp.id from spaces sp
      join sites s on s.id = sp.site_id
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid() and om.role in ('owner', 'editor')
    )
  );

-- ============================================================
-- Page Versions
-- ============================================================
create table page_versions (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid not null references pages(id) on delete cascade,
  content       jsonb not null default '{"blocks":[]}',
  version_label text,
  created_by    uuid references auth.users(id),
  is_current    boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table page_versions enable row level security;

create policy "page versions readable based on page visibility"
  on page_versions for select
  using (
    page_id in (
      select p.id from pages p
      join spaces sp on sp.id = p.space_id
      join sites s on s.id = sp.site_id
      where s.visibility = 'public'
      or s.organization_id in (
        select organization_id from organization_members
        where user_id = auth.uid()
      )
    )
  );

create policy "org editors can write page versions"
  on page_versions for insert
  with check (
    page_id in (
      select p.id from pages p
      join spaces sp on sp.id = p.space_id
      join sites s on s.id = sp.site_id
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid() and om.role in ('owner', 'editor')
    )
  );

create policy "org editors can update page versions"
  on page_versions for update
  using (
    page_id in (
      select p.id from pages p
      join spaces sp on sp.id = p.space_id
      join sites s on s.id = sp.site_id
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid() and om.role in ('owner', 'editor')
    )
  );

create index idx_page_versions_page_current on page_versions(page_id, is_current);

-- ============================================================
-- Redirects
-- ============================================================
create table redirects (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  from_path   text not null,
  to_path     text not null,
  status_code integer not null default 301 check (status_code in (301, 302)),
  created_at  timestamptz not null default now(),
  unique(site_id, from_path)
);

alter table redirects enable row level security;

create policy "org members can view redirects"
  on redirects for select
  using (
    site_id in (
      select s.id from sites s
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid()
    )
  );

create policy "org owners can manage redirects"
  on redirects for all
  using (
    site_id in (
      select s.id from sites s
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid() and om.role in ('owner', 'editor')
    )
  );

-- ============================================================
-- Page Ratings
-- ============================================================
create table page_ratings (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references pages(id) on delete cascade,
  rating     smallint not null check (rating in (1, -1)),
  comment    text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table page_ratings enable row level security;

create policy "anyone can submit ratings on public pages"
  on page_ratings for insert
  with check (
    page_id in (
      select p.id from pages p
      join spaces sp on sp.id = p.space_id
      join sites s on s.id = sp.site_id
      where s.visibility = 'public' and p.published = true
    )
  );

create policy "org members can view ratings"
  on page_ratings for select
  using (
    page_id in (
      select p.id from pages p
      join spaces sp on sp.id = p.space_id
      join sites s on s.id = sp.site_id
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid()
    )
  );

-- ============================================================
-- Site Analytics
-- ============================================================
create table site_analytics (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references sites(id) on delete cascade,
  page_id    uuid references pages(id) on delete set null,
  path       text not null,
  referrer   text,
  country    text,
  device     text check (device in ('desktop', 'mobile', 'tablet')),
  created_at timestamptz not null default now()
);

alter table site_analytics enable row level security;

create policy "analytics can be written publicly"
  on site_analytics for insert
  with check (true);

create policy "org members can read their site analytics"
  on site_analytics for select
  using (
    site_id in (
      select s.id from sites s
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid()
    )
  );

create index idx_site_analytics_site_date on site_analytics(site_id, created_at desc);

-- ============================================================
-- API Keys
-- ============================================================
create table api_keys (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  key_hash        text not null unique,
  last_used_at    timestamptz,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

alter table api_keys enable row level security;

create policy "owners can manage api keys"
  on api_keys for all
  using (
    organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid() and role = 'owner'
    )
  );
