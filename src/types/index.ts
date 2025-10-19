export type ExpenseCategory = 
  | 'flight'
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'insurance'
  | 'activity'
  | 'misc';

export type Currency = 
  | 'EUR'
  | 'ILS'
  | 'USD';

export type PaymentMethod = 
  | 'cash'
  | 'credit';

export interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  date: Date;
  category: ExpenseCategory;
  amount: number;
  originalAmount?: number; // Amount in original currency (if converted)
  originalCurrency?: Currency; // Original currency (if converted)
  paymentMethod: PaymentMethod; // Cash or credit payment
  description?: string; // Brief description of the expense
  notes?: string;
  receiptUrl?: string;
  location?: MapLocation;
  isShared?: boolean; // Whether this expense is shared with others
  numberOfPeople?: number; // Number of people sharing the expense (including the user)
  totalAmountBeforeSharing?: number; // The full amount before splitting
  createdAt: Date;
  updatedAt: Date;
}

export interface Destination {
  name: string;
  country?: string;
  flag?: string; // Country flag emoji
}

export interface Trip {
  id: string;
  name: string;
  destination: string; // Keep for backward compatibility
  destinations?: Destination[]; // New multiple destinations support
  startDate: Date;
  endDate: Date;
  currency: Currency;
  initialBudget: number;
  isOpenBudget?: boolean; // New field for open budget (no fixed limit)
  initialCash: number; // Initial cash taken for the trip
  remainingCash?: number; // Cash remaining at end of trip
  hotelLocation?: MapLocation;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripSummary {
  trip: Trip;
  expenses: Expense[];
  totalExpenses: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  dailyExpenses: Array<{
    date: string;
    amount: number;
  }>;
  remainingBudget: number;
  budgetStatus: 'good' | 'warning' | 'exceeded';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DailyExpenseData {
  date: string;
  amount: number;
  expenses: number;
}

export interface CategoryExpenseData {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}

export interface TripComparisonData {
  tripName: string;
  destination: string;
  totalExpenses: number;
  duration: number; // in days
  averagePerDay: number;
}

// Store types
export interface AppState {
  trips: Trip[];
  expenses: Expense[];
  darkMode: boolean;
  language: 'en' | 'he';
  
  // Actions
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  updateTripCash: (tripId: string, remainingCash: number) => void;
  deleteTrip: (id: string) => void;
  
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  toggleDarkMode: () => void;
  setLanguage: (language: 'en' | 'he') => void;
  
  // Computed getters
  getTripById: (id: string) => Trip | undefined;
  getExpensesByTrip: (tripId: string) => Expense[];
  getTripSummary: (tripId: string) => TripSummary | undefined;
  getAllTripSummaries: () => TripSummary[];
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'flight',
  'accommodation', 
  'food',
  'transport',
  'insurance',
  'activity',
  'misc'
];

export const CURRENCIES: Currency[] = [
  'EUR',
  'ILS', 
  'USD'
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  ILS: '₪',
  USD: '$'
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  flight: '#FF6B6B',
  accommodation: '#4ECDC4',
  food: '#45B7D1',
  transport: '#96CEB4',
  insurance: '#FFEAA7',
  activity: '#DDA0DD',
  misc: '#98D8C8'
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  flight: 'Flight',
  accommodation: 'Accommodation',
  food: 'Food & Dining',
  transport: 'Transportation',
  insurance: 'Insurance',
  activity: 'Activities',
  misc: 'Miscellaneous'
};

export const CATEGORY_EMOJIS: Record<ExpenseCategory, string> = {
  flight: '✈️',
  accommodation: '🏨',
  food: '🍽️',
  transport: '🚗',
  insurance: '🛡️',
  activity: '🎯',
  misc: '📦'
};