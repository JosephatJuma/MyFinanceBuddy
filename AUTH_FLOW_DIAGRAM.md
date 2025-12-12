# Authentication Flow with Supabase

## Complete Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MyFinanceBuddy App                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │  Auth Screens│      │   Contexts   │      │    Hooks     │ │
│  │              │◄─────┤              │◄─────┤              │ │
│  │ - Login      │      │ - AuthContext│      │ - useAuth    │ │
│  │ - Register   │      │ - ThemeContext│     │ - useForm    │ │
│  │ - Reset Pass │      │              │      │ - useStorage │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                      │                      │         │
│         └──────────────────────┴──────────────────────┘         │
│                                │                                │
│                                ▼                                │
│                    ┌──────────────────────┐                     │
│                    │  Supabase Client     │                     │
│                    │  (src/lib/supabase)  │                     │
│                    └──────────────────────┘                     │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase Cloud                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Auth       │      │  PostgreSQL  │      │   Storage    │ │
│  │              │      │              │      │              │ │
│  │ - Users      │─────►│ - profiles   │      │ - Avatars    │ │
│  │ - Sessions   │      │ - transactions│     │ - Documents  │ │
│  │ - Tokens     │      │ - budgets    │      │              │ │
│  │              │      │              │      │              │ │
│  │ RLS Policies │◄─────┤ Row Level    │      │              │ │
│  │              │      │ Security     │      │              │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## User Registration Flow

```
┌─────────────┐
│   User      │
│   Enters    │
│   Details   │
└─────┬───────┘
      │
      ▼
┌─────────────────────────────┐
│  RegisterScreen             │
│  - Validates form           │
│  - Calls register()         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  useAuth Hook               │
│  - Calls supabase.auth      │
│    .signUp()                │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Supabase Auth              │
│  1. Create user in auth.users
│  2. Trigger on_auth_user_   │
│     created fires            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Database Trigger           │
│  handle_new_user()          │
│  - Inserts into profiles    │
│  - Sets initial data        │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Profile Created            │
│  - User profile exists      │
│  - Ready to use app         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Session Stored             │
│  - Token in AsyncStorage    │
│  - User logged in           │
│  - Navigate to Main App     │
└─────────────────────────────┘
```

## User Login Flow

```
┌─────────────┐
│   User      │
│   Enters    │
│ Credentials │
└─────┬───────┘
      │
      ▼
┌─────────────────────────────┐
│  LoginScreen                │
│  - Validates form           │
│  - Calls login()            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  useAuth Hook               │
│  - Calls supabase.auth      │
│    .signInWithPassword()    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Supabase Auth              │
│  - Validates credentials    │
│  - Returns user + session   │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Fetch Profile              │
│  SELECT * FROM profiles     │
│  WHERE id = user.id         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Update Auth State          │
│  - Set user data            │
│  - Set isAuthenticated      │
│  - Store session            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Navigate to Main           │
│  RootNavigator switches     │
│  from Auth to Main          │
└─────────────────────────────┘
```

## Password Reset Flow

```
┌─────────────┐
│   User      │
│   Enters    │
│   Email     │
└─────┬───────┘
      │
      ▼
┌─────────────────────────────┐
│  ForgotPasswordScreen       │
│  - Validates email          │
│  - Calls resetPassword()    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  useAuth Hook               │
│  - Calls supabase.auth      │
│    .resetPasswordForEmail() │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Supabase Auth              │
│  - Validates email exists   │
│  - Generates reset token    │
│  - Sends email              │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Email Sent                 │
│  - User receives email      │
│  - Contains reset link      │
│  - Link includes token      │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  User Clicks Link           │
│  - Opens reset page         │
│  - Enter new password       │
│  - Password updated         │
└─────────────────────────────┘
```

## Session Check on App Start

```
┌─────────────┐
│  App Starts │
└─────┬───────┘
      │
      ▼
┌─────────────────────────────┐
│  AuthProvider               │
│  useEffect(() => {          │
│    auth.checkAuth();        │
│  }, []);                    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  useAuth.checkAuth()        │
│  - Calls supabase.auth      │
│    .getSession()            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Session Check              │
│  - Valid session?           │
└─────┬──────────┬────────────┘
      │          │
  Yes │          │ No
      │          │
      ▼          ▼
┌─────────┐  ┌──────────┐
│ Fetch   │  │ Set      │
│ Profile │  │ Not Auth │
└────┬────┘  └────┬─────┘
     │            │
     ▼            ▼
┌─────────┐  ┌──────────┐
│ Navigate│  │ Show     │
│ to Main │  │ Login    │
└─────────┘  └──────────┘
```

## Data Access with RLS

```
┌─────────────────────────────┐
│  User Makes Request         │
│  GET /transactions          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Supabase Client            │
│  - Adds auth token to       │
│    request header           │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  PostgreSQL + RLS           │
│  SELECT * FROM transactions │
│  WHERE user_id = auth.uid() │
│                             │
│  ✅ Only returns user's data│
│  ❌ Other users blocked     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Return Filtered Data       │
│  - Only user's transactions │
│  - Automatic security       │
└─────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────┐
│              Application State               │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────┐     │
│  │        AuthContext                 │     │
│  │  ┌──────────────────────────┐     │     │
│  │  │  State:                  │     │     │
│  │  │  - user: User | null     │     │     │
│  │  │  - isAuthenticated: bool │     │     │
│  │  │  - isLoading: bool       │     │     │
│  │  └──────────────────────────┘     │     │
│  │  ┌──────────────────────────┐     │     │
│  │  │  Methods:                │     │     │
│  │  │  - login()               │     │     │
│  │  │  - register()            │     │     │
│  │  │  - logout()              │     │     │
│  │  │  - checkAuth()           │     │     │
│  │  │  - updateUser()          │     │     │
│  │  │  - resetPassword()       │     │     │
│  │  └──────────────────────────┘     │     │
│  └────────────────────────────────────┘     │
│                     │                        │
│                     ▼                        │
│  ┌────────────────────────────────────┐     │
│  │     All Child Components           │     │
│  │     Can Access Auth State          │     │
│  └────────────────────────────────────┘     │
│                                              │
└──────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│           Security Architecture             │
├─────────────────────────────────────────────┤
│                                             │
│  Layer 1: Client-Side Validation            │
│  ┌───────────────────────────────────┐     │
│  │ - Form validation (useForm)       │     │
│  │ - Email format check              │     │
│  │ - Password strength               │     │
│  │ - Required fields                 │     │
│  └───────────────────────────────────┘     │
│                 │                           │
│                 ▼                           │
│  Layer 2: Supabase Auth                     │
│  ┌───────────────────────────────────┐     │
│  │ - JWT token generation            │     │
│  │ - Session management              │     │
│  │ - Token refresh                   │     │
│  │ - Secure password hashing         │     │
│  └───────────────────────────────────┘     │
│                 │                           │
│                 ▼                           │
│  Layer 3: Row Level Security (RLS)          │
│  ┌───────────────────────────────────┐     │
│  │ - User can only see own data      │     │
│  │ - Enforced at database level      │     │
│  │ - Cannot be bypassed              │     │
│  │ - Automatic filtering             │     │
│  └───────────────────────────────────┘     │
│                 │                           │
│                 ▼                           │
│  Layer 4: HTTPS/TLS                         │
│  ┌───────────────────────────────────┐     │
│  │ - All data encrypted in transit   │     │
│  │ - Secure API endpoints            │     │
│  │ - SSL certificate                 │     │
│  └───────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

## Token Flow

```
┌─────────────────────────────┐
│  User Logs In               │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Supabase Generates         │
│  - Access Token (JWT)       │
│  - Refresh Token            │
│  - Expiry: 1 hour           │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Tokens Stored              │
│  - AsyncStorage (encrypted) │
│  - Automatically included   │
│    in requests              │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Before Expiry              │
│  - Auto-refresh enabled     │
│  - New tokens generated     │
│  - Seamless to user         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  On Logout                  │
│  - Tokens invalidated       │
│  - Session cleared          │
│  - AsyncStorage cleared     │
└─────────────────────────────┘
```

---

## Key Benefits

✅ **Secure** - Multiple layers of security
✅ **Automatic** - RLS policies enforce data isolation
✅ **Scalable** - Supabase handles infrastructure
✅ **Real-time** - Can enable live updates
✅ **Offline-ready** - Sessions persist locally
✅ **Type-safe** - Full TypeScript support
✅ **Testable** - Mock-friendly architecture

## Integration Points

1. **Auth Screens** → Use `useAuthContext()` hook
2. **Protected Routes** → Check `isAuthenticated`
3. **Data Queries** → Use `supabase.from()` with RLS
4. **Profile Updates** → Call `updateUser()`
5. **Session Management** → Automatic with Supabase client

---

**Status**: Production Ready ✨
