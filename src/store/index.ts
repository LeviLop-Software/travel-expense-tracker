import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppState,
  Trip,
  Expense,
  TripSummary,
  ExpenseCategory,
  EXPENSE_CATEGORIES
} from '../types';

// Helper functions
const generateId = () => crypto.randomUUID();

const calculateBudgetStatus = (spent: number, budget: number): 'good' | 'warning' | 'exceeded' => {
  const percentage = (spent / budget) * 100;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 80) return 'warning';
  return 'good';
};

const calculateTripSummary = (trip: Trip, expenses: Expense[]): TripSummary => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate expenses by category
  const expensesByCategory = EXPENSE_CATEGORIES.reduce((acc, category) => {
    acc[category] = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  // Calculate daily expenses
  const dailyExpensesMap = new Map<string, number>();
  expenses.forEach(expense => {
    const dateKey = expense.date.toISOString().split('T')[0];
    dailyExpensesMap.set(dateKey, (dailyExpensesMap.get(dateKey) || 0) + expense.amount);
  });

  const dailyExpenses = Array.from(dailyExpensesMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const remainingBudget = trip.isOpenBudget ? 0 : trip.initialBudget - totalExpenses;
  const budgetStatus = trip.isOpenBudget ? 'good' : calculateBudgetStatus(totalExpenses, trip.initialBudget);

  return {
    trip,
    expenses,
    totalExpenses,
    expensesByCategory,
    dailyExpenses,
    remainingBudget,
    budgetStatus
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      trips: [],
      expenses: [],
      darkMode: true, // Dark mode as default
      language: 'he' as 'en' | 'he', // Hebrew as default

      // Trip actions
      addTrip: (tripData) => {
        const trip: Trip = {
          ...tripData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          trips: [...state.trips, trip]
        }));
      },

      updateTrip: (id, updates) => {
        set((state) => ({
          trips: state.trips.map(trip =>
            trip.id === id
              ? { ...trip, ...updates, updatedAt: new Date() }
              : trip
          )
        }));
      },

      updateTripCash: (tripId, remainingCash) => {
        set((state) => ({
          trips: state.trips.map(trip =>
            trip.id === tripId
              ? { ...trip, remainingCash, updatedAt: new Date() }
              : trip
          )
        }));
      },

      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter(trip => trip.id !== id),
          expenses: state.expenses.filter(expense => expense.tripId !== id)
        }));
      },

      // Expense actions
      addExpense: (expenseData) => {
        const expense: Expense = {
          ...expenseData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          expenses: [...state.expenses, expense]
        }));
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map(expense =>
            expense.id === id
              ? { ...expense, ...updates, updatedAt: new Date() }
              : expense
          )
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter(expense => expense.id !== id)
        }));
      },

      // UI actions
      toggleDarkMode: () => {
        set((state) => ({
          darkMode: !state.darkMode
        }));
      },

      setLanguage: (language: 'en' | 'he') => {
        set({ language });
      },

      // Getters
      getTripById: (id: string) => {
        return get().trips.find(trip => trip.id === id);
      },

      getExpensesByTrip: (tripId: string) => {
        return get().expenses.filter(expense => expense.tripId === tripId);
      },

      getTripSummary: (tripId: string) => {
        const trip = get().getTripById(tripId);
        if (!trip) return undefined;
        
        const expenses = get().getExpensesByTrip(tripId);
        return calculateTripSummary(trip, expenses);
      },

      getAllTripSummaries: () => {
        const { trips, expenses } = get();
        return trips.map(trip => {
          const tripExpenses = expenses.filter(expense => expense.tripId === trip.id);
          return calculateTripSummary(trip, tripExpenses);
        });
      },
    }),
    {
      name: 'travel-expense-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        trips: state.trips.map(trip => ({
          ...trip,
          startDate: trip.startDate.toISOString(),
          endDate: trip.endDate.toISOString(),
          createdAt: trip.createdAt.toISOString(),
          updatedAt: trip.updatedAt.toISOString(),
        })),
        expenses: state.expenses.map(expense => ({
          ...expense,
          date: expense.date.toISOString(),
          createdAt: expense.createdAt.toISOString(),
          updatedAt: expense.updatedAt.toISOString(),
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.trips = state.trips.map(trip => ({
            ...trip,
            startDate: new Date(trip.startDate as any),
            endDate: new Date(trip.endDate as any),
            createdAt: new Date(trip.createdAt as any),
            updatedAt: new Date(trip.updatedAt as any),
          }));
          state.expenses = state.expenses.map(expense => ({
            ...expense,
            date: new Date(expense.date as any),
            createdAt: new Date(expense.createdAt as any),
            updatedAt: new Date(expense.updatedAt as any),
          }));
        }
      },
    }
  )
);

// Utility hooks for common operations
export const useTripSummaries = () => {
  const getAllTripSummaries = useAppStore(state => state.getAllTripSummaries);
  return getAllTripSummaries();
};

export const useTrip = (tripId: string) => {
  const trips = useAppStore(state => state.trips);
  const expenses = useAppStore(state => state.expenses);
  
  const trip = trips.find(trip => trip.id === tripId);
  
  // Calculate summary reactively
  const summary = trip ? (() => {
    const tripExpenses = expenses.filter(expense => expense.tripId === tripId);
    const totalExpenses = tripExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const cashExpenses = tripExpenses
      .filter(expense => expense.paymentMethod === 'cash')
      .reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBudget = trip.initialBudget - totalExpenses;
    const remainingCash = trip.initialCash - cashExpenses;
    const budgetUtilization = trip.initialBudget > 0 ? (totalExpenses / trip.initialBudget) * 100 : 0;
    
    return {
      totalExpenses,
      cashExpenses,
      remainingBudget,
      remainingCash,
      budgetUtilization,
      expenseCount: tripExpenses.length
    };
  })() : undefined;
  
  return { trip, summary };
};

export const useTripExpenses = (tripId: string) => {
  const expenses = useAppStore(state => state.expenses);
  return expenses.filter(expense => expense.tripId === tripId);
};