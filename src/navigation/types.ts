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

export type HomeStackParamList = {
  Dashboard: undefined;
  TransactionDetail: { id: string };
  AddTransaction: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionDetail: { id: string };
  AddTransaction: undefined;
  EditTransaction: { id: string };
};

export type BudgetStackParamList = {
  BudgetList: undefined;
  BudgetDetail: { id: string };
  AddBudget: undefined;
  EditBudget: { id: string };
};

export type ReportsStackParamList = {
  ReportsDashboard: undefined;
  ReportDetail: { type: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Profile: undefined;
  Preferences: undefined;
  Security: undefined;
  About: undefined;
};
