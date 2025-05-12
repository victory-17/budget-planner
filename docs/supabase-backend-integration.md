# Supabase Backend Integration for Budget Planner

This document outlines how the budget planner application integrates with Supabase as its backend service. It includes details on database tables, authentication flow, and data access patterns.

## Project Configuration

The project uses the following Supabase configuration:

- **URL**: `https://kimfcqjzyehxxpxmjqdc.supabase.co`
- **Project ID**: `kimfcqjzyehxxpxmjqdc`

## Database Tables

The application uses the following database tables:

### 1. profiles

Stores user profile information linked to auth.users

```sql
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone
);

-- Enable RLS
alter table profiles enable row level security;

-- Create profiles for new users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for creating profiles
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
```

### 2. accounts

Stores financial accounts belonging to users

```sql
create table accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  balance numeric not null default 0,
  currency text not null default 'USD',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone
);

-- Enable RLS
alter table accounts enable row level security;

-- Policies
create policy "Users can view their own accounts"
  on accounts for select
  using (auth.uid() = user_id);

create policy "Users can create their own accounts"
  on accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own accounts"
  on accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own accounts"
  on accounts for delete
  using (auth.uid() = user_id);
```

### 3. transactions

Stores financial transactions for user accounts

```sql
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  account_id uuid references accounts not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  category text not null,
  description text,
  date date not null default now(),
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table transactions enable row level security;

-- Policies
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can create their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- Trigger to update account balance on transaction
create or replace function update_account_balance()
returns trigger as $$
begin
  -- Handle inserts
  if (TG_OP = 'INSERT') then
    if (NEW.type = 'income') then
      update accounts set balance = balance + NEW.amount where id = NEW.account_id;
    elsif (NEW.type = 'expense') then
      update accounts set balance = balance - NEW.amount where id = NEW.account_id;
    end if;
  -- Handle updates
  elsif (TG_OP = 'UPDATE') then
    -- Revert old transaction
    if (OLD.type = 'income') then
      update accounts set balance = balance - OLD.amount where id = OLD.account_id;
    elsif (OLD.type = 'expense') then
      update accounts set balance = balance + OLD.amount where id = OLD.account_id;
    end if;
    
    -- Apply new transaction
    if (NEW.type = 'income') then
      update accounts set balance = balance + NEW.amount where id = NEW.account_id;
    elsif (NEW.type = 'expense') then
      update accounts set balance = balance - NEW.amount where id = NEW.account_id;
    end if;
  -- Handle deletes
  elsif (TG_OP = 'DELETE') then
    if (OLD.type = 'income') then
      update accounts set balance = balance - OLD.amount where id = OLD.account_id;
    elsif (OLD.type = 'expense') then
      update accounts set balance = balance + OLD.amount where id = OLD.account_id;
    end if;
  end if;
  
  return NULL;
end;
$$ language plpgsql security definer;

-- Triggers for account balance updates
create trigger after_transaction_insert
  after insert on transactions
  for each row execute procedure update_account_balance();
  
create trigger after_transaction_update
  after update on transactions
  for each row execute procedure update_account_balance();
  
create trigger after_transaction_delete
  after delete on transactions
  for each row execute procedure update_account_balance();
```

### 4. budgets

Stores budget targets for different spending categories

```sql
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  category text not null,
  amount numeric not null,
  period text not null check (period in ('monthly', 'quarterly', 'yearly')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone,
  unique (user_id, category, period)
);

-- Enable RLS
alter table budgets enable row level security;

-- Policies
create policy "Users can view their own budgets"
  on budgets for select
  using (auth.uid() = user_id);

create policy "Users can create their own budgets"
  on budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets"
  on budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budgets"
  on budgets for delete
  using (auth.uid() = user_id);
```

## Authentication Flow

The application uses Supabase Auth with email/password authentication:

1. **Sign Up**: 
   - Frontend sends email, password to Supabase
   - Supabase creates user and profile record
   - Email verification can be optionally enabled

2. **Sign In**:
   - Frontend sends email, password to Supabase
   - Supabase verifies credentials and returns session token
   - Token is stored in localStorage

3. **Session Management**:
   - Session auto-refreshes
   - Auth status is managed via `AuthProvider`

4. **Sign Out**:
   - Calls Supabase signOut method
   - Clears local session

## Recommended Client Configuration

The Supabase client should be configured as follows:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kimfcqjzyehxxpxmjqdc.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

## Row-Level Security (RLS)

All tables have row-level security enabled with policies that restrict user access to their own data. This ensures that users can only access their own records even if they somehow bypass the application's frontend security.

## Functions and Triggers

The database uses triggers to:
1. Create a profile record when a new user signs up
2. Update account balances when transactions are created, updated, or deleted

## Common API Usage Patterns

### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: { name: 'User Name' },
    emailRedirectTo: window.location.origin + '/auth/callback'
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### Data Access

```typescript
// Create record
const { data, error } = await supabase
  .from('accounts')
  .insert({ name: 'Checking', type: 'bank', balance: 1000, currency: 'USD' });

// Read records
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId);

// Update record
const { data, error } = await supabase
  .from('budgets')
  .update({ amount: 500 })
  .eq('id', budgetId);

// Delete record
const { error } = await supabase
  .from('accounts')
  .delete()
  .eq('id', accountId);
```

## Error Handling

The application should handle Supabase errors consistently:

```typescript
try {
  const { data, error } = await supabase.from('accounts').select('*');
  
  if (error) {
    throw error;
  }
  
  // Process data
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly message
}
```

## Development and Production Environments

For development, use the same Supabase project with different frontend URLs. Configure allowed redirect URLs in Supabase Auth settings to include both development and production URLs. 