// Type definitions for the project

// ============================================
// Navigation Types
// ============================================
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Transactions: undefined;
  Budget: undefined;
  Reports: undefined;
  Settings: undefined;
};

// ============================================
// Data Models
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  spent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface Report {
  id: string;
  type: 'spending' | 'income' | 'category' | 'trend';
  period: 'week' | 'month' | 'year' | 'custom';
  data: any;
  generatedAt: Date;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// Form Types
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TransactionFormData {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
}

export interface BudgetFormData {
  category: string;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
}

// ============================================
// State Types
// ============================================

export interface AppState {
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ThemeState {
  mode: 'light' | 'dark' | 'auto';
  isDark: boolean;
}

// ============================================
// Utility Types
// ============================================

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

// ============================================
// Hook Return Types
// ============================================

export interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  setValue: (name: keyof T, value: any) => void;
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  setFieldError: (name: keyof T, error: string | null) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: any) => Promise<void>;
  reset: () => void;
  validateAll: () => boolean;
  getFieldProps: (name: keyof T) => any;
  isValid: () => boolean;
}

export interface UseStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => Promise<void>;
  removeValue: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

// ============================================
// Component Props Types
// ============================================

export interface BaseScreenProps {
  navigation: any;
  route: any;
}

export interface ListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  icon?: string;
}

export interface CardProps {
  title: string;
  children: React.ReactNode;
  style?: any;
}

// ============================================
// Constants
// ============================================

export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export const BUDGET_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export const REPORT_TYPES = ['spending', 'income', 'category', 'trend'] as const;

export type TransactionType = typeof TRANSACTION_TYPES[number];
export type BudgetPeriod = typeof BUDGET_PERIODS[number];
export type ReportType = typeof REPORT_TYPES[number];
