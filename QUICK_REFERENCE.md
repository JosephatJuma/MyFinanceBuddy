# Quick Reference Guide - MyFinanceBuddy

## 🚀 Quick Start

```bash
npm install
npm start        # Start Expo dev server
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
```

## 📁 Project Structure

```
src/
├── navigation/     # All navigation files
├── contexts/       # Context providers (Auth, Theme)
├── hooks/          # Custom reusable hooks
├── screens/        # All screen components
└── components/     # Reusable components
```

## 🎣 Custom Hooks Cheat Sheet

### useAuth

```typescript
const { user, isAuthenticated, login, logout } = useAuthContext();

// Login
await login("email@example.com", "password");

// Register
await register("Name", "email@example.com", "password");

// Logout
await logout();

// Update user
await updateUser({ name: "New Name" });
```

### useTheme

```typescript
const { theme, isDark, toggleTheme } = useThemeContext();

// Use theme colors
<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>Hello</Text>
</View>

// Toggle theme
<Button onPress={toggleTheme}>Toggle Dark Mode</Button>
```

### useForm

```typescript
const form = useForm({
  email: {
    initialValue: '',
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },
  password: {
    initialValue: '',
    validation: {
      required: true,
      minLength: 6,
    },
  },
});

const handleSubmit = form.handleSubmit(async (values) => {
  console.log(values); // { email: '...', password: '...' }
});

// In JSX
<TextInput {...form.getFieldProps('email')} />
<Button onPress={handleSubmit} loading={form.isSubmitting}>
  Submit
</Button>
```

### useStorage

```typescript
const { value, setValue, removeValue } = useStorage("key", "defaultValue");

// Update value
await setValue("new value");

// Remove value
await removeValue();
```

## 🧭 Navigation Examples

### Navigate to Screen

```typescript
// Simple navigation
navigation.navigate("ScreenName");

// With params
navigation.navigate("TransactionDetail", { id: "123" });

// Go back
navigation.goBack();
```

### Access Route Params

```typescript
const { id } = route.params;
```

### Drawer Navigation

```typescript
// Open drawer
navigation.openDrawer();

// Close drawer
navigation.closeDrawer();

// Toggle drawer
navigation.toggleDrawer();
```

## 🎨 Theme Colors

```typescript
theme.colors = {
  primary: "#6200ee",
  secondary: "#03dac4",
  background: "#f6f6f6",
  surface: "#ffffff",
  text: "#000000",
  error: "#B00020",
  success: "#4caf50",
  warning: "#ff9800",
  info: "#2196f3",
  border: "#e0e0e0",
  card: "#ffffff",
  notification: "#ff4081",
};
```

## 📝 Form Validation Rules

```typescript
validation: {
  required: true,              // Field is required
  minLength: 6,                // Min string length
  maxLength: 100,              // Max string length
  pattern: /regex/,            // Pattern matching
  min: 0,                      // Min number value
  max: 999,                    // Max number value
  custom: (value) => {         // Custom validation
    if (value !== something) {
      return 'Error message';
    }
    return null;
  },
}
```

## 🔐 Auth Flow

```
App Start
  ↓
Check Auth (from AsyncStorage)
  ↓
┌─────────────┬──────────────┐
│             │              │
Not Auth      Authenticated
│             │
AuthNavigator DrawerNavigator
│             │
Login/Register Main App
```

## 📱 Screen Types

### Auth Screens

- LoginScreen
- RegisterScreen
- ForgotPasswordScreen

### Main App Screens

- **Home**: DashboardScreen
- **Transactions**: List, Detail, Add, Edit
- **Budget**: List, Detail, Add, Edit
- **Reports**: Dashboard, Detail
- **Settings**: Main, Profile, Preferences, Security, About

## 🛠️ Common Tasks

### Add New Screen

1. Create screen in `src/screens/{section}/ScreenName.tsx`
2. Add type in `src/navigation/types.ts`
3. Add to navigator in `src/navigation/{Section}StackNavigator.tsx`

### Create Form

```typescript
const form = useForm({
  fieldName: {
    initialValue: '',
    validation: { required: true },
  },
});

<TextInput {...form.getFieldProps('fieldName')} />
<Button onPress={form.handleSubmit(handleSubmit)}>Submit</Button>
```

### Handle Async Operations

```typescript
const handleAction = async () => {
  try {
    // Your async code
    const result = await someAsyncFunction();
    // Handle success
  } catch (error) {
    // Handle error
    console.error(error);
  }
};
```

## 📦 Key Dependencies

- `@react-navigation/native` - Navigation
- `@react-navigation/native-stack` - Stack Navigator
- `@react-navigation/drawer` - Drawer Navigator
- `react-native-paper` - UI Components
- `@react-native-async-storage/async-storage` - Storage
- `react-native-gesture-handler` - Gestures
- `react-native-reanimated` - Animations

## 🐛 Troubleshooting

### Clear cache

```bash
npm start -- --clear
```

### Reset to clean state

```bash
rm -rf node_modules
npm install
```

### iOS issues

```bash
cd ios && pod install && cd ..
npm run ios
```

## 💡 Tips

1. **Always use contexts** for auth and theme
2. **Type-safe navigation** - Let TypeScript guide you
3. **Form validation** - Use `useForm` for all forms
4. **Persistent data** - Use `useStorage` for local data
5. **Theme consistency** - Always use `theme.colors.*`

## 🔗 Navigation Structure

```
RootNavigator
├── Auth (Not authenticated)
│   └── AuthNavigator (Stack)
│       ├── Login
│       ├── Register
│       └── ForgotPassword
└── Main (Authenticated)
    └── DrawerNavigator
        ├── Home → HomeStackNavigator
        ├── Transactions → TransactionsStackNavigator
        ├── Budget → BudgetStackNavigator
        ├── Reports → ReportsStackNavigator
        └── Settings → SettingsStackNavigator
```

## 📚 Further Reading

See `SETUP_GUIDE.md` for comprehensive documentation.
