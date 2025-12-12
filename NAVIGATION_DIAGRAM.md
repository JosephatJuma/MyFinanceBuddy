# Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP START                                │
│                    Check AsyncStorage                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
           ┌─────────────────────────┐
           │    RootNavigator        │
           │  (Navigation Container) │
           └─────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌─────────────────┐           ┌──────────────────┐
│ NOT AUTHENTICATED│           │  AUTHENTICATED   │
└─────────────────┘           └──────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────────────┐   ┌──────────────────────────┐
│   AuthNavigator         │   │   DrawerNavigator        │
│   (Stack)               │   │   (Drawer)               │
├─────────────────────────┤   ├──────────────────────────┤
│ • Login                 │   │ ┌──────────────────────┐ │
│ • Register              │   │ │ Home                 │ │
│ • ForgotPassword        │   │ │ ▼                    │ │
└─────────────────────────┘   │ │ HomeStackNavigator  │ │
                              │ │ • Dashboard         │ │
                              │ │ • TransactionDetail │ │
                              │ │ • AddTransaction    │ │
                              │ └──────────────────────┘ │
                              │                          │
                              │ ┌──────────────────────┐ │
                              │ │ Transactions         │ │
                              │ │ ▼                    │ │
                              │ │ TransactionsStack    │ │
                              │ │ • TransactionsList   │ │
                              │ │ • TransactionDetail  │ │
                              │ │ • AddTransaction     │ │
                              │ │ • EditTransaction    │ │
                              │ └──────────────────────┘ │
                              │                          │
                              │ ┌──────────────────────┐ │
                              │ │ Budget               │ │
                              │ │ ▼                    │ │
                              │ │ BudgetStackNavigator │ │
                              │ │ • BudgetList         │ │
                              │ │ • BudgetDetail       │ │
                              │ │ • AddBudget          │ │
                              │ │ • EditBudget         │ │
                              │ └──────────────────────┘ │
                              │                          │
                              │ ┌──────────────────────┐ │
                              │ │ Reports              │ │
                              │ │ ▼                    │ │
                              │ │ ReportsStackNavigator│ │
                              │ │ • ReportsDashboard   │ │
                              │ │ • ReportDetail       │ │
                              │ └──────────────────────┘ │
                              │                          │
                              │ ┌──────────────────────┐ │
                              │ │ Settings             │ │
                              │ │ ▼                    │ │
                              │ │ SettingsStack        │ │
                              │ │ • SettingsMain       │ │
                              │ │ • Profile            │ │
                              │ │ • Preferences        │ │
                              │ │ • Security           │ │
                              │ │ • About              │ │
                              │ └──────────────────────┘ │
                              └──────────────────────────┘
```

## Context Provider Hierarchy

```
┌────────────────────────────────────────────┐
│        GestureHandlerRootView              │
│  ┌──────────────────────────────────────┐  │
│  │       SafeAreaProvider               │  │
│  │  ┌────────────────────────────────┐  │  │
│  │  │      ThemeProvider             │  │  │
│  │  │  ┌──────────────────────────┐  │  │  │
│  │  │  │    AuthProvider          │  │  │  │
│  │  │  │  ┌────────────────────┐  │  │  │  │
│  │  │  │  │   AppContent       │  │  │  │  │
│  │  │  │  │  • PaperProvider  │  │  │  │  │
│  │  │  │  │  • RootNavigator  │  │  │  │  │
│  │  │  │  └────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────┘  │  │  │
│  │  └────────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

## Hooks Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    useAuth Hook                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • login(email, password)                          │  │
│  │ • register(name, email, password)                 │  │
│  │ • logout()                                        │  │
│  │ • checkAuth()    ←→   AsyncStorage                │  │
│  │ • updateUser(updates)                             │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│                   AuthContext                            │
│                         ↓                                │
│              Available globally via                      │
│              useAuthContext()                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   useTheme Hook                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • theme (colors, dark mode)                       │  │
│  │ • toggleTheme()                                   │  │
│  │ • setTheme(mode)  ←→   AsyncStorage               │  │
│  │ • loadTheme()                                     │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│                   ThemeContext                           │
│                         ↓                                │
│              Available globally via                      │
│              useThemeContext()                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   useForm Hook                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Input: Form Config (fields + validation)         │  │
│  │    ↓                                              │  │
│  │ • values (current form state)                     │  │
│  │ • errors (validation errors)                      │  │
│  │ • touched (touched fields)                        │  │
│  │ • setValue(name, value)                           │  │
│  │ • handleSubmit(callback)                          │  │
│  │ • getFieldProps(name) → props for input          │  │
│  └───────────────────────────────────────────────────┘  │
│              Used directly in components                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  useStorage Hook                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Input: (key, initialValue)                        │  │
│  │    ↓                                              │  │
│  │ • value (current stored value)                    │  │
│  │ • setValue(newValue)  ←→   AsyncStorage           │  │
│  │ • removeValue()                                   │  │
│  │ • isLoading                                       │  │
│  └───────────────────────────────────────────────────┘  │
│              Used directly in components                 │
└─────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Check Storage   │ ──→ Token Found? ──┐
└─────────────────┘                    │
                                       │
     ┌─────────────────────────────────┴───────────┐
     │ NO                                    YES   │
     ▼                                             ▼
┌──────────────┐                        ┌──────────────────┐
│ Login Screen │                        │  Main App        │
└──────┬───────┘                        │  (DrawerNav)     │
       │                                └──────────────────┘
       ▼                                         │
┌──────────────┐                                 │
│ Enter Creds  │                                 │
└──────┬───────┘                                 │
       │                                         │
       ▼                                         │
┌──────────────┐                                 │
│ Submit Login │                                 │
└──────┬───────┘                                 │
       │                                         │
       ▼                                         │
┌──────────────┐                                 │
│  Validate    │                                 │
└──────┬───────┘                                 │
       │                                         │
   ┌───┴───┐                                     │
   │ Valid?│                                     │
   └───┬───┘                                     │
       │                                         │
    ┌──┴──┐                                      │
    │ NO  │ YES                                  │
    ▼     ▼                                      │
  Error  Save to Storage ─────────────────────┐  │
         │                                     │  │
         ▼                                     │  │
    Update AuthContext ←──────────────────────┘  │
         │                                        │
         └────────────────────────────────────────┘
         │
         ▼
    Main App (DrawerNav)
```

## Theme Switching Flow

```
User clicks "Toggle Theme"
         │
         ▼
   toggleTheme()
         │
         ├──→ Update state (isDark)
         │
         ├──→ Save to AsyncStorage
         │
         └──→ Update ThemeContext
                     │
                     ▼
           All components re-render
                     │
                     └──→ Use new theme colors
```

## Form Submission Flow

```
User fills form
      │
      ▼
User clicks Submit
      │
      ▼
handleSubmit()
      │
      ├──→ Mark all fields as touched
      │
      ├──→ Validate all fields
      │
      ├──→ Valid?
      │      │
      │    ┌─┴─┐
      │   NO  YES
      │    │   │
      │    │   ▼
      │    │  Call onSubmit callback
      │    │   │
      │    │   ├──→ API call
      │    │   │
      │    │   └──→ Handle response
      │    │
      │    └──→ Show errors
      │
      └──→ Set isSubmitting = false
```
