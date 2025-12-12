# MyFinanceBuddy

A comprehensive personal finance management mobile app built with React Native and Expo.

## ✨ Features

- 🔐 **Authentication** - Secure login, registration, and password recovery with Supabase
- 📊 **Dashboard** - Overview of your financial status
- 💰 **Transactions** - Track income and expenses
- 📅 **Budget Management** - Set and monitor budgets
- 📈 **Reports** - Visual financial reports and analytics
- ⚙️ **Settings** - Customizable preferences and dark mode
- 🎨 **Theme Support** - Light and dark mode with persistent preferences
- 🔒 **Row Level Security** - Your data is protected with Supabase RLS policies

## 🏗️ Architecture

### Navigation Structure

- **Root Navigator** - Manages auth state
- **Auth Stack** - Login, Register, Forgot Password
- **Drawer Navigator** - Main app navigation
- **Nested Stacks** - For each major section (Home, Transactions, Budget, Reports, Settings)

### Custom Hooks

- `useAuth` - Authentication state and operations
- `useTheme` - Theme management and dark mode
- `useForm` - Form handling with validation
- `useStorage` - AsyncStorage wrapper

### Context Providers

- `AuthContext` - Global authentication state
- `ThemeContext` - Global theme configuration

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator
- **Supabase account** (for authentication and database)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials
```

**Important:** Before running the app, you must set up Supabase. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

### Quick Start

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📁 Project Structure

```
src/
├── navigation/          # Navigation configuration
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── DrawerNavigator.tsx
│   └── *StackNavigator.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useForm.ts
│   └── useStorage.ts
├── screens/            # Screen components
│   ├── auth/
│   ├── home/
│   ├── transactions/
│   ├── budget/
│   ├── reports/
│   └── settings/
└── components/         # Reusable components
```

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Comprehensive setup and usage guide
- **[Quick Reference](QUICK_REFERENCE.md)** - Quick reference for common tasks
- **[Hooks Example](HOOKS_EXAMPLE.tsx)** - Example usage of all custom hooks

## 🔧 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **React Native Paper** - UI component library
- **TypeScript** - Type safety
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **AsyncStorage** - Local storage

## 🎨 Customization

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add type definition in `src/navigation/types.ts`
3. Add to appropriate navigator
4. Use navigation and route props for navigation

### Form Validation

Use the `useForm` hook with built-in validation rules:

```typescript
const form = useForm({
  email: {
    initialValue: "",
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },
});
```

### Theme Customization

Modify colors in `src/hooks/useTheme.ts`:

```typescript
const lightTheme = {
  colors: {
    primary: "#6200ee",
    // ... other colors
  },
};
```

## 🛠️ Development

### Clear Cache

```bash
npm start -- --clear
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npx eslint src/
```

## 📝 TODO

- [ ] Connect to backend API
- [ ] Add unit tests
- [ ] Implement transaction categories
- [ ] Add charts and visualizations
- [ ] Implement budget alerts
- [ ] Add export functionality
- [ ] Implement data sync
- [ ] Add biometric authentication

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

JosephatJuma

## 🙏 Acknowledgments

- React Navigation team
- React Native Paper
- Expo team
- React Native community
