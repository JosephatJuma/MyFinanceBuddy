export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Entertainment"
  | "School Fees"
  | "Bills & Utilities"
  | "Rent"
  | "Healthcare"
  | "Education"
  | "Shopping"
  | "Clothing"
  | "Personal Care"
  | "Subscriptions"
  | "Travel & Outings"
  | "Gifts & Donations"
  | "Tithe & Offerings"
  | "Internet & Airtime"
  | "Miscellaneous";

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface FinancialData {
  income: number;
  expenses: Expense[];
  savings: number;
  investments: number;
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#F4A261", // Warm orange – comfort & daily necessity
  Transport: "#2A9D8F", // Teal – movement, calm
  Entertainment: "#9B5DE5", // Purple – fun & creativity
  "School Fees": "#6A4C93", // Deep purple – education & growth
  "Bills & Utilities": "#E63946", // Red – urgency & recurring costs
  Miscellaneous: "#8D99AE", // Muted gray-blue – neutral
  Rent: "#E76F51", // Earthy orange-red – stability
  Healthcare: "#2EC4B6", // Aqua – health & vitality
  Education: "#F6AE2D", // Golden yellow – learning & optimism
  Shopping: "#457B9D", // Cool blue – trust & spending
  Clothing: "#E75480", // Pink-red – fashion & style
  "Personal Care": "#48CAE4", // Sky blue – freshness & wellness
  "Internet & Airtime": "#5E60CE", // Indigo – digital connectivity
  Subscriptions: "#00B4D8", // Bright cyan – recurring payments
  "Travel & Outings": "#06D6A0", // Green – adventure & freedom
  "Gifts & Donations": "#FFB703", // Warm gold – generosity
  "Tithe & Offerings": "#FFD166", // Soft yellow – faith & giving
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: "🍔",
  Transport: "🚗",
  Entertainment: "🎬",
  "School Fees": "🎬",
  "Bills & Utilities": "📄",
  Miscellaneous: "📦",
  "Travel & Outings": "✈️",
  Rent: "🏠",
  Healthcare: "💊",
  Education: "🎓",
  Shopping: "🛍️",
  "Internet & Airtime": "📱",
  Clothing: "👗",
  "Personal Care": "🧴",
  Subscriptions: "💳",
  "Gifts & Donations": "🎁",
  "Tithe & Offerings": "🙏",
};

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "School Fees",
  "Bills & Utilities",
  "Rent",
  "Healthcare",
  "Education",
  "Shopping",
  "Clothing",
  "Personal Care",
  "Internet & Airtime",
  "Subscriptions",
  "Travel & Outings",
  "Gifts & Donations",
  "Tithe & Offerings",
  "Miscellaneous",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment Returns",
  "Other Income",
  "Gifts",
];

export const INCOME_CATEGORY_COLORS: Record<string, string> = {
  Salary: "#06D6A0", // Green – growth & stability
  Freelance: "#118AB2", // Blue – independence & trust
  Business: "#F4A261", // Amber – opportunity & energy
  "Investment Returns": "#8338EC", // Deep violet – long-term wealth
  "Other Income": "#8D99AE", // Neutral gray-blue – miscellaneous
  Gifts: "#FFD166", // Warm yellow – kindness & surprise
};

export const SAVING_CATEGORIES = [
  "Emergency Fund",
  "Vacation",
  "Home",
  "Education",
  "Retirement",
  "General Savings",
];
export const INVESTMENT_CATEGORIES = [
  "Stocks",
  "Bonds",
  "Real Estate",
  "Crypto",
  "Mutual Funds",
  "401k",
  "IRA",
];

export type ExpenseType = "expense" | "income" | "saving" | "investment";
