# Supabase Setup Guide

This guide will help you set up Supabase authentication for MyFinanceBuddy.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- React Native development environment set up

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Project name: `MyFinanceBuddy`
   - Database password: (choose a strong password)
   - Region: (choose closest to you)
4. Click "Create new project"
5. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project:

```bash
cp .env.example .env
```

2. Open `.env` and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Add `.env` to your `.gitignore` to keep your keys private!

## Step 4: Set Up Database Tables

Run the following SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies for profiles table
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount decimal(10, 2) not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  description text,
  date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for transactions
alter table transactions enable row level security;

-- Policies for transactions
create policy "Users can view own transactions"
  on transactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own transactions"
  on transactions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own transactions"
  on transactions for update
  using ( auth.uid() = user_id );

create policy "Users can delete own transactions"
  on transactions for delete
  using ( auth.uid() = user_id );

-- Create budgets table
create table budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  amount decimal(10, 2) not null,
  period text not null check (period in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  spent decimal(10, 2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for budgets
alter table budgets enable row level security;

-- Policies for budgets
create policy "Users can view own budgets"
  on budgets for select
  using ( auth.uid() = user_id );

create policy "Users can insert own budgets"
  on budgets for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own budgets"
  on budgets for update
  using ( auth.uid() = user_id );

create policy "Users can delete own budgets"
  on budgets for delete
  using ( auth.uid() = user_id );

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to all tables
create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure public.handle_updated_at();

create trigger transactions_updated_at
  before update on transactions
  for each row execute procedure public.handle_updated_at();

create trigger budgets_updated_at
  before update on budgets
  for each row execute procedure public.handle_updated_at();
```

## Step 5: Configure Authentication Settings

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Under **Auth Providers**, make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize the templates for:
     - Confirm signup
     - Reset password
     - Magic link

## Step 6: Test Authentication

1. Start your development server:

```bash
npm start
```

2. Try registering a new account:

   - Open the app
   - Click "Create Account"
   - Fill in the form
   - Submit

3. Check Supabase Dashboard:
   - Go to **Authentication** > **Users**
   - You should see your new user
   - Go to **Table Editor** > **profiles**
   - Your user profile should be created automatically

## Features Implemented

### ✅ User Registration

- Creates user in Supabase Auth
- Automatically creates profile in `profiles` table
- Stores user metadata (name)

### ✅ User Login

- Email/password authentication
- Fetches user profile from database
- Maintains session with AsyncStorage

### ✅ Password Reset

- Sends password reset email via Supabase
- Customizable email template
- Secure reset flow

### ✅ User Logout

- Signs out from Supabase
- Clears local session
- Redirects to login screen

### ✅ Session Management

- Automatic session refresh
- Persistent login across app restarts
- Secure token storage

## How It Works

### Authentication Flow

```
User Registration
    ↓
Supabase Auth (creates user)
    ↓
Trigger: handle_new_user()
    ↓
Profile Created in profiles table
    ↓
User logged in automatically
```

```
User Login
    ↓
Supabase Auth validation
    ↓
Fetch profile from profiles table
    ↓
Store session in AsyncStorage
    ↓
Navigate to main app
```

### Data Access with RLS

Row Level Security (RLS) ensures users can only access their own data:

```sql
-- Users can only see their own transactions
auth.uid() = user_id
```

This means:

- No user can see another user's transactions
- No user can modify another user's budgets
- All data access is automatically filtered by user ID

## Security Best Practices

1. **Never commit `.env` file** - Keep API keys private
2. **Use RLS policies** - Already configured for all tables
3. **Validate on client and server** - Forms validate before submission
4. **Use secure passwords** - Minimum 6 characters enforced
5. **Enable MFA (optional)** - Can be enabled in Supabase dashboard

## Customization

### Update User Profile

```typescript
const { updateUser } = useAuthContext();

await updateUser({
  name: "New Name",
  avatar_url: "https://example.com/avatar.jpg",
});
```

### Add More Fields to Profile

1. Add column in Supabase:

```sql
alter table profiles add column phone text;
```

2. Update the User interface in `src/hooks/useAuth.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string; // Add new field
  avatar_url?: string;
  created_at?: string;
}
```

## Troubleshooting

### "Invalid API key" error

- Check that your `.env` file has the correct values
- Restart the development server after changing `.env`

### "User already exists" error

- The email is already registered
- Try logging in instead or use a different email

### Profile not created automatically

- Check the trigger is created: `on_auth_user_created`
- Check the function exists: `handle_new_user()`
- Look for errors in Supabase Dashboard > Database > Logs

### Session not persisting

- Check AsyncStorage permissions
- Make sure `react-native-url-polyfill` is installed
- Clear app data and try again

## Next Steps

1. **Add Social Auth** - Google, Apple, etc.
2. **Implement MFA** - Multi-factor authentication
3. **Add Avatar Upload** - Use Supabase Storage
4. **Email Verification** - Require email confirmation
5. **Real-time Updates** - Use Supabase Realtime

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)

## Support

If you encounter issues:

1. Check the [Supabase Status](https://status.supabase.com/)
2. Visit [Supabase Discord](https://discord.supabase.com/)
3. Check the [GitHub Issues](https://github.com/supabase/supabase/issues)
