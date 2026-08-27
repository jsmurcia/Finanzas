-- Esquema inicial: accounts, categories, transactions, debts, debt_movements
-- Basado en DESIGN.md, sección 4 (Modelo de datos).
-- Cada tabla tiene user_id, y RLS restringe cada fila a su dueño
-- (auth.uid() = user_id) para SELECT, INSERT, UPDATE y DELETE.

create extension if not exists "pgcrypto";

-- =========================================
-- accounts
-- =========================================
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  name text not null,
  type text not null,
  initial_balance numeric not null default 0
);

alter table accounts enable row level security;

create policy "accounts_select_own" on accounts
  for select using (auth.uid() = user_id);

create policy "accounts_insert_own" on accounts
  for insert with check (auth.uid() = user_id);

create policy "accounts_update_own" on accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "accounts_delete_own" on accounts
  for delete using (auth.uid() = user_id);

-- =========================================
-- categories
-- =========================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  name text not null,
  kind text not null check (kind in ('income', 'expense')),
  color text
);

alter table categories enable row level security;

create policy "categories_select_own" on categories
  for select using (auth.uid() = user_id);

create policy "categories_insert_own" on categories
  for insert with check (auth.uid() = user_id);

create policy "categories_update_own" on categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_delete_own" on categories
  for delete using (auth.uid() = user_id);

-- =========================================
-- transactions
-- =========================================
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  occurred_on date not null,
  category_id uuid not null references categories (id),
  account_id uuid not null references accounts (id),
  note text,
  is_recurring boolean not null default false,
  recurrence_rule text
);

alter table transactions enable row level security;

create policy "transactions_select_own" on transactions
  for select using (auth.uid() = user_id);

create policy "transactions_insert_own" on transactions
  for insert with check (auth.uid() = user_id);

create policy "transactions_update_own" on transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_delete_own" on transactions
  for delete using (auth.uid() = user_id);

-- =========================================
-- debts
-- =========================================
create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  name text not null,
  lender text,
  kind text not null check (kind in ('persona', 'tarjeta', 'banco', 'otro')),
  current_balance numeric not null default 0,
  interest_rate numeric,
  reminder_day int,
  status text not null default 'active' check (status in ('active', 'archived'))
);

alter table debts enable row level security;

create policy "debts_select_own" on debts
  for select using (auth.uid() = user_id);

create policy "debts_insert_own" on debts
  for insert with check (auth.uid() = user_id);

create policy "debts_update_own" on debts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "debts_delete_own" on debts
  for delete using (auth.uid() = user_id);

-- =========================================
-- debt_movements
-- =========================================
create table debt_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  debt_id uuid not null references debts (id),
  type text not null check (type in ('advance', 'payment')),
  amount numeric not null check (amount > 0),
  occurred_on date not null,
  note text
);

alter table debt_movements enable row level security;

create policy "debt_movements_select_own" on debt_movements
  for select using (auth.uid() = user_id);

create policy "debt_movements_insert_own" on debt_movements
  for insert with check (auth.uid() = user_id);

create policy "debt_movements_update_own" on debt_movements
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "debt_movements_delete_own" on debt_movements
  for delete using (auth.uid() = user_id);
