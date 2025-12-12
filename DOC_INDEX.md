# Documentation Index

Welcome to MyFinanceBuddy! This index will help you find the documentation you need.

## 📖 Getting Started

1. **[README.md](README.md)** - Start here!

   - Project overview
   - Quick start guide
   - Tech stack
   - Basic usage

2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Cheat sheet
   - Hook usage examples
   - Navigation snippets
   - Common tasks
   - Troubleshooting

## 🔧 Detailed Guides

3. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Comprehensive guide

   - Project structure
   - Navigation architecture
   - Custom hooks API
   - Context providers
   - TypeScript types
   - Next steps

4. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built
   - All files created
   - Features implemented
   - Next steps
   - Usage examples

## 📊 Visual Guides

5. **[NAVIGATION_DIAGRAM.md](NAVIGATION_DIAGRAM.md)** - Flow diagrams
   - Navigation hierarchy
   - Context provider tree
   - Hook data flows
   - Authentication flow
   - Theme switching
   - Form submission

## 💻 Code Examples

6. **[HOOKS_EXAMPLE.tsx](HOOKS_EXAMPLE.tsx)** - Complete example
   - All hooks in one component
   - Form handling example
   - Theme integration
   - Auth integration

## 📁 Project Structure

```
MyFinanceBuddy/
├── README.md                      ⭐ Start here
├── QUICK_REFERENCE.md             🚀 Quick lookup
├── SETUP_GUIDE.md                 📖 Full documentation
├── IMPLEMENTATION_SUMMARY.md      ✅ What's completed
├── NAVIGATION_DIAGRAM.md          📊 Visual flows
├── HOOKS_EXAMPLE.tsx              💻 Code examples
└── src/
    ├── navigation/                🧭 All navigators
    ├── contexts/                  🌍 Global state
    ├── hooks/                     🎣 Reusable hooks
    ├── screens/                   📱 All screens
    ├── types/                     📝 TypeScript types
    └── App.tsx                    🏠 Entry point
```

## 🎯 Find What You Need

### I want to...

#### ...understand the project

→ Read **[README.md](README.md)**

#### ...start coding quickly

→ Check **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**

#### ...understand the architecture

→ Read **[SETUP_GUIDE.md](SETUP_GUIDE.md)**

#### ...see what was implemented

→ Check **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**

#### ...visualize the navigation flow

→ See **[NAVIGATION_DIAGRAM.md](NAVIGATION_DIAGRAM.md)**

#### ...see code examples

→ Look at **[HOOKS_EXAMPLE.tsx](HOOKS_EXAMPLE.tsx)**

#### ...add a new screen

1. Read "Adding New Screens" in **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
2. Check examples in `src/screens/`

#### ...use authentication

1. See "useAuth" section in **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
2. Check `src/hooks/useAuth.ts`
3. Look at `src/screens/auth/LoginScreen.tsx` for example

#### ...create a form

1. See "useForm" section in **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
2. Check **[HOOKS_EXAMPLE.tsx](HOOKS_EXAMPLE.tsx)**
3. Look at `src/screens/auth/RegisterScreen.tsx` for example

#### ...manage theme

1. See "useTheme" section in **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
2. Check `src/hooks/useTheme.ts`

#### ...navigate between screens

1. See "Navigation Examples" in **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
2. Check navigation flow in **[NAVIGATION_DIAGRAM.md](NAVIGATION_DIAGRAM.md)**

#### ...store data locally

1. See "useStorage" section in **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
2. Check `src/hooks/useStorage.ts`

## 📚 Learning Path

### For Beginners

1. Start with **[README.md](README.md)**
2. Skim **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
3. Look at **[HOOKS_EXAMPLE.tsx](HOOKS_EXAMPLE.tsx)**
4. Try modifying existing screens in `src/screens/`

### For Intermediate Developers

1. Read **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
2. Study **[NAVIGATION_DIAGRAM.md](NAVIGATION_DIAGRAM.md)**
3. Explore the hook implementations in `src/hooks/`
4. Start building features

### For Advanced Developers

1. Review **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**
2. Check type definitions in `src/types/index.ts`
3. Understand navigation types in `src/navigation/types.ts`
4. Customize and extend as needed

## 🔍 Quick Searches

### Navigation

- **How to navigate?** → QUICK_REFERENCE.md > "Navigation Examples"
- **Navigation structure?** → NAVIGATION_DIAGRAM.md
- **Add new screen?** → SETUP_GUIDE.md > "Adding New Screens"

### Authentication

- **How to login?** → QUICK_REFERENCE.md > "useAuth"
- **Auth flow?** → NAVIGATION_DIAGRAM.md > "Authentication Flow"
- **Replace mock auth?** → SETUP_GUIDE.md > "Authentication"

### Forms

- **Create a form?** → QUICK_REFERENCE.md > "useForm"
- **Validation rules?** → QUICK_REFERENCE.md > "Form Validation Rules"
- **Form example?** → HOOKS_EXAMPLE.tsx

### Theme

- **Toggle theme?** → QUICK_REFERENCE.md > "useTheme"
- **Custom colors?** → SETUP_GUIDE.md > "Theme Customization"
- **Theme flow?** → NAVIGATION_DIAGRAM.md > "Theme Switching Flow"

### Storage

- **Save data?** → QUICK_REFERENCE.md > "useStorage"
- **AsyncStorage wrapper?** → src/hooks/useStorage.ts

## 📞 Need Help?

1. Check the appropriate documentation above
2. Look at code examples in `src/screens/`
3. Review hook implementations in `src/hooks/`
4. Check TypeScript types in `src/types/`

## 🚀 Quick Commands

```bash
# Start development
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
npm start -- --clear

# Type check
npx tsc --noEmit
```

## 📝 File Organization

### Documentation Files

- **README.md** - Main documentation (overview)
- **QUICK_REFERENCE.md** - Quick reference guide
- **SETUP_GUIDE.md** - Detailed setup guide
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **NAVIGATION_DIAGRAM.md** - Visual diagrams
- **HOOKS_EXAMPLE.tsx** - Code examples
- **DOC_INDEX.md** - This file

### Source Code

- **src/navigation/** - Navigation setup
- **src/contexts/** - Context providers
- **src/hooks/** - Custom hooks
- **src/screens/** - Screen components
- **src/types/** - TypeScript definitions
- **src/App.tsx** - Main app component

---

**Last Updated:** December 12, 2025

**Status:** All core navigation and hooks implemented ✅
