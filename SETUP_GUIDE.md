# MyFinanceBuddy - Navigation & Hooks Setup

## Overview

This project has been set up with a comprehensive navigation structure and reusable hooks for state management, authentication, theming, and forms.

## Project Structure

```
src/
├── navigation/              # Navigation configuration
│   ├── types.ts            # TypeScript types for navigation
│   ├── RootNavigator.tsx   # Main navigation container
│   ├── AuthNavigator.tsx   # Stack navigator for authentication
│   ├── DrawerNavigator.tsx # Drawer navigator for main app
│   ├── HomeStackNavigator.tsx
│   ├── TransactionsStackNavigator.tsx
│   ├── BudgetStackNavigator.tsx
│   ├── ReportsStackNavigator.tsx
│   ├── SettingsStackNavigator.tsx
│   └── index.ts
├── contexts/               # Context providers
│   ├── AuthContext.tsx    # Authentication context
│   ├── ThemeContext.tsx   # Theme context
│   └── index.ts
├── hooks/                  # Custom reusable hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useTheme.ts        # Theme management hook
│   ├── useForm.ts         # Form handling hook
│   ├── useStorage.ts      # AsyncStorage hook
│   └── index.ts
├── screens/               # Screen components
│   ├── auth/             # Authentication screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── home/             # Home screens
│   │   └── DashboardScreen.tsx
│   ├── transactions/     # Transaction screens
│   │   ├── TransactionsListScreen.tsx
│   │   ├── TransactionDetailScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   └── EditTransactionScreen.tsx
│   ├── budget/           # Budget screens
│   │   ├── BudgetListScreen.tsx
│   │   ├── BudgetDetailScreen.tsx
│   │   ├── AddBudgetScreen.tsx
│   │   └── EditBudgetScreen.tsx
│   ├── reports/          # Reports screens
│   │   ├── ReportsDashboardScreen.tsx
│   │   └── ReportDetailScreen.tsx
│   └── settings/         # Settings screens
│       ├── SettingsMainScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── PreferencesScreen.tsx
│       ├── SecurityScreen.tsx
│       └── AboutScreen.tsx
└── App.tsx               # Main app entry point
```

## Navigation Structure

### 1. Root Navigator (RootNavigator.tsx)

- Manages authentication state
- Shows `AuthNavigator` when user is not authenticated
- Shows `DrawerNavigator` when user is authenticated

### 2. Auth Stack Navigator (AuthNavigator.tsx)

Stack navigator for authentication flow:

- Login Screen
- Register Screen
- Forgot Password Screen

### 3. Drawer Navigator (DrawerNavigator.tsx)

Main app navigation with drawer menu:

- Home (Dashboard)
- Transactions
- Budget
- Reports
- Settings

Each drawer item contains its own stack navigator.

### 4. Stack Navigators

Each section has its own stack navigator for nested navigation:

- **HomeStackNavigator**: Dashboard, Transaction Detail, Add Transaction
- **TransactionsStackNavigator**: Transactions List, Detail, Add, Edit
- **BudgetStackNavigator**: Budget List, Detail, Add, Edit
- **ReportsStackNavigator**: Reports Dashboard, Report Detail
- **SettingsStackNavigator**: Settings Main, Profile, Preferences, Security, About

## Custom Hooks

### 1. useAuth (useAuth.ts)

Manages authentication state and operations.

**Features:**

- User login/register/logout
- Auto-check authentication on app load
- User profile updates
- Persistent authentication with AsyncStorage

**Usage:**

```typescript
import { useAuthContext } from "../contexts/AuthContext";

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuthContext();

  const handleLogin = async () => {
    const result = await login("email@example.com", "password");
    if (result.success) {
      // Login successful
    }
  };

  return <View>{isAuthenticated && <Text>Welcome {user?.name}</Text>}</View>;
};
```

**API:**

- `user`: Current user object or null
- `isLoading`: Loading state
- `isAuthenticated`: Boolean indicating auth status
- `login(email, password)`: Login user
- `register(name, email, password)`: Register new user
- `logout()`: Logout current user
- `checkAuth()`: Check stored auth state
- `updateUser(updates)`: Update user profile

### 2. useTheme (useTheme.ts)

Manages application theme and dark mode.

**Features:**

- Light/Dark theme support
- Theme persistence with AsyncStorage
- Integration with React Native Paper
- Custom color schemes

**Usage:**

```typescript
import { useThemeContext } from "../contexts/ThemeContext";

const MyComponent = () => {
  const { theme, isDark, toggleTheme } = useThemeContext();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello</Text>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
    </View>
  );
};
```

**API:**

- `theme`: Custom theme object with colors
- `paperTheme`: React Native Paper theme
- `themeMode`: 'light' | 'dark' | 'auto'
- `isDark`: Boolean indicating dark mode
- `toggleTheme()`: Toggle between light/dark
- `setTheme(mode)`: Set specific theme mode
- `loadTheme()`: Load saved theme preference

### 3. useForm (useForm.ts)

Comprehensive form handling with validation.

**Features:**

- Field-level validation
- Touch state management
- Error handling
- Form submission handling
- Multiple validation rules (required, minLength, maxLength, pattern, custom)

**Usage:**

```typescript
import { useForm } from "../hooks/useForm";

const MyForm = () => {
  const form = useForm({
    email: {
      initialValue: "",
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    password: {
      initialValue: "",
      validation: {
        required: true,
        minLength: 6,
      },
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    console.log("Form values:", values);
  });

  return (
    <View>
      <TextInput label="Email" {...form.getFieldProps("email")} />
      <TextInput
        label="Password"
        {...form.getFieldProps("password")}
        secureTextEntry
      />
      <Button onPress={handleSubmit} loading={form.isSubmitting}>
        Submit
      </Button>
    </View>
  );
};
```

**API:**

- `values`: Current form values
- `errors`: Validation errors object
- `touched`: Fields that have been touched
- `isSubmitting`: Submission state
- `setValue(name, value)`: Update field value
- `setFieldTouched(name, touched)`: Mark field as touched
- `setFieldError(name, error)`: Set field error
- `handleSubmit(onSubmit)`: Handle form submission
- `reset()`: Reset form to initial state
- `validateAll()`: Validate all fields
- `getFieldProps(name)`: Get props for input field
- `isValid()`: Check if form is valid

**Validation Rules:**

- `required`: Field is required
- `minLength`: Minimum string length
- `maxLength`: Maximum string length
- `pattern`: RegExp pattern validation
- `min`: Minimum numeric value
- `max`: Maximum numeric value
- `custom`: Custom validation function

### 4. useStorage (useStorage.ts)

Simplified AsyncStorage wrapper.

**Features:**

- Type-safe storage
- Automatic JSON serialization
- Error handling
- Loading states

**Usage:**

```typescript
import { useStorage } from "../hooks/useStorage";

const MyComponent = () => {
  const { value, setValue, removeValue, isLoading } = useStorage(
    "myKey",
    "defaultValue"
  );

  const updateValue = async () => {
    await setValue("newValue");
  };

  if (isLoading) return <Text>Loading...</Text>;

  return <Text>{value}</Text>;
};
```

**API:**

- `value`: Current stored value
- `setValue(value)`: Update stored value
- `removeValue()`: Remove stored value
- `isLoading`: Loading state
- `error`: Error object if any
- `reload()`: Reload value from storage

## Context Providers

### AuthContext

Wraps the entire app to provide authentication state globally.

```typescript
import { useAuthContext } from "../contexts/AuthContext";
```

### ThemeContext

Provides theme configuration throughout the app.

```typescript
import { useThemeContext } from "../contexts/ThemeContext";
```

## Getting Started

### 1. Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### 2. Adding New Screens

1. Create screen component in appropriate folder under `src/screens/`
2. Add route to navigation types in `src/navigation/types.ts`
3. Add screen to appropriate stack navigator
4. Use navigation hooks for navigation:

```typescript
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { YourStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<YourStackParamList, "ScreenName">;

const MyScreen: React.FC<Props> = ({ navigation, route }) => {
  // Navigate to another screen
  navigation.navigate("AnotherScreen", { id: "123" });

  // Go back
  navigation.goBack();

  // Access route params
  const { id } = route.params;

  return <View>...</View>;
};
```

### 3. Using Forms

```typescript
const form = useForm({
  fieldName: {
    initialValue: "",
    validation: {
      required: true,
      minLength: 3,
    },
  },
});

const handleSubmit = form.handleSubmit(async (values) => {
  // Handle form submission
});

<TextInput {...form.getFieldProps("fieldName")} />;
```

### 4. Managing Theme

```typescript
const { theme, isDark, toggleTheme } = useThemeContext();

<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>Content</Text>
</View>;
```

### 5. Authentication

Replace the mock functions in `useAuth.ts` with your actual API calls:

```typescript
// In useAuth.ts, replace mockLogin and mockRegister with:
const login = async (email: string, password: string) => {
  const response = await fetch("YOUR_API_URL/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data;
};
```

## TypeScript Navigation Types

The navigation is fully typed. When navigating, you'll get autocomplete and type checking:

```typescript
// ✅ Correct
navigation.navigate("TransactionDetail", { id: "123" });

// ❌ TypeScript error - missing required param
navigation.navigate("TransactionDetail");

// ❌ TypeScript error - wrong param type
navigation.navigate("TransactionDetail", { id: 123 });
```

## Next Steps

1. **Connect to API**: Replace mock authentication with real API calls
2. **Add State Management**: Consider adding Redux or Zustand for global state if needed
3. **Implement Features**: Build out the transaction, budget, and report functionality
4. **Add Animations**: Enhance UX with animations using React Native Reanimated
5. **Add Tests**: Write unit and integration tests
6. **Error Handling**: Implement global error handling
7. **Loading States**: Add loading indicators for async operations
8. **Form Validation**: Customize validation rules as needed

## Dependencies

The project uses:

- React Navigation (Stack & Drawer)
- React Native Paper (UI Components)
- AsyncStorage (Local Storage)
- React Native Gesture Handler
- React Native Reanimated
- React Native Safe Area Context
- Expo Vector Icons

## Tips

1. **Navigation**: Use TypeScript for type-safe navigation
2. **Forms**: Leverage `useForm` hook for all form handling
3. **Theme**: Always use theme colors from context
4. **Auth**: Auth state is automatically checked on app load
5. **Storage**: Use `useStorage` for persistent data
