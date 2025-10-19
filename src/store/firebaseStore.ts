import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { tripsService, expensesService, userPreferencesService, migrationService } from '../services/firestore';
import {
  AppState,
  Trip,
  Expense,
  TripSummary,
  ExpenseCategory,
  EXPENSE_CATEGORIES
} from '../types';
import { useEffect } from 'react';

// Helper functions
const generateId = () => crypto.randomUUID();

// Remove undefined values from objects before sending to Firestore
const cleanUndefinedValues = (obj: any): any => {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        cleaned[key] = cleanUndefinedValues(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  return cleaned;
};

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

// Enhanced AppState interface with Firebase integration
interface FirebaseAppState extends Omit<AppState, 'addTrip' | 'updateTrip' | 'deleteTrip' | 'addExpense' | 'updateExpense' | 'deleteExpense'> {
  // User state
  user: User | null;
  isLoading: boolean;
  isDataSynced: boolean;
  syncError: string | null;

  // Firebase-integrated actions
  addTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  updateTripCash: (tripId: string, remainingCash: number) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // User authentication actions
  setUser: (user: User | null) => void;
  
  // Data sync actions
  syncUserData: () => Promise<void>;
  loadUserDataFromFirestore: () => Promise<void>;
  deleteAllUserData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setSyncError: (error: string | null) => void;
  clearState: () => void;
  
  // Migration action
  migrateLocalData: () => Promise<void>;

  // Enhanced UI actions with Firebase sync
  toggleDarkMode: () => Promise<void>;
  setLanguage: (language: 'en' | 'he') => Promise<void>;

  // Getters
  getTripById: (id: string) => Trip | undefined;
  getExpensesByTripId: (tripId: string) => Expense[];
  getExpensesByTrip: (tripId: string) => Expense[];
  getTripSummary: (tripId: string) => TripSummary | undefined;
  getAllTripSummaries: () => TripSummary[];
}

export const useAppStore = create<FirebaseAppState>()(
  persist(
    (set, get) => ({
      // State
      trips: [],
      expenses: [],
      darkMode: true,
      language: 'he' as 'en' | 'he',
      user: null,
      isLoading: true,  // Start with loading = true
      isDataSynced: false,
      syncError: null,

      // User authentication actions
      setUser: (user) => {
        const previousUser = get().user;
        set({ user });
        
        if (user && !previousUser) {
          // NEW USER LOGIN - Load data from Firestore ONCE
          console.log('🔑 User logged in, loading data from Firestore (manual sync)');
          get().loadUserDataFromFirestore();
        } else if (!user && previousUser) {
          // USER LOGGED OUT - Don't clear data, keep using local storage
          console.log('🚪 User logged out, keeping local data');
          set({ 
            isLoading: false, 
            isDataSynced: true  // Local data is always "synced"
          });
        } else if (!user && !previousUser) {
          // NO USER FROM START - Use local data
          console.log('👤 No user, using local data');
          set({ 
            isLoading: false, 
            isDataSynced: true  // Local data is always "synced"
          });
        }
      },

      // Trip actions with Firebase integration
      addTrip: async (tripData) => {
        const { user } = get();
        
        if (!user) {
          // Fallback to local storage when user is not authenticated
          const trip: Trip = {
            ...tripData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => ({
            trips: [...state.trips, trip]
          }));
          return;
        }

        set({ isLoading: true, syncError: null });
        
        try {
          // Clean undefined values before sending to Firestore
          const cleanedTripData = cleanUndefinedValues(tripData);
          console.log('Adding trip with cleaned data:', cleanedTripData);
          
          const tripId = await tripsService.addTrip(user.uid, cleanedTripData);
          
          // Optimistically update local state (with duplicate protection)
          const trip: Trip = {
            ...tripData,
            id: tripId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => {
            // Check if trip already exists to prevent duplicates
            const existingTrip = state.trips.find(t => t.id === tripId);
            if (existingTrip) {
              console.warn('Trip already exists, skipping duplicate:', tripId);
              return { isLoading: false };
            }
            
            return {
              trips: [...state.trips, trip],
              isLoading: false
            };
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to add trip: ${error}` 
          });
          throw error;
        }
      },

      updateTrip: async (id, updates) => {
        const { user } = get();
        
        if (!user) {
          // Fallback to local storage when user is not authenticated
          set((state) => ({
            trips: state.trips.map(trip =>
              trip.id === id
                ? { ...trip, ...updates, updatedAt: new Date() }
                : trip
            )
          }));
          return;
        }

        set({ isLoading: true, syncError: null });
        
        try {
          // Clean undefined values before sending to Firestore
          const cleanedUpdates = cleanUndefinedValues(updates);
          console.log('Updating trip with cleaned data:', cleanedUpdates);
          
          await tripsService.updateTrip(user.uid, id, cleanedUpdates);
          
          // Optimistically update local state
          set((state) => ({
            trips: state.trips.map(trip =>
              trip.id === id
                ? { ...trip, ...updates, updatedAt: new Date() }
                : trip
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to update trip: ${error}` 
          });
          throw error;
        }
      },

      updateTripCash: async (tripId, remainingCash) => {
        await get().updateTrip(tripId, { remainingCash });
      },

      deleteTrip: async (id) => {
        const { user } = get();
        
        if (!user) {
          // User not logged in - only delete from local state
          set((state) => ({
            trips: state.trips.filter(trip => trip.id !== id),
            expenses: state.expenses.filter(expense => expense.tripId !== id),
          }));
          return;
        }

        set({ isLoading: true, syncError: null });
        
        try {
          await tripsService.deleteTrip(user.uid, id);
          
          // Optimistically update local state
          set((state) => ({
            trips: state.trips.filter(trip => trip.id !== id),
            expenses: state.expenses.filter(expense => expense.tripId !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to delete trip: ${error}` 
          });
          throw error;
        }
      },

      // Expense actions with Firebase integration
      addExpense: async (expenseData) => {
        const { user } = get();
        
        if (!user) {
          // Fallback to local storage when user is not authenticated
          const expense: Expense = {
            ...expenseData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => ({
            expenses: [...state.expenses, expense]
          }));
          return;
        }

        set({ isLoading: true, syncError: null });
        
        try {
          // Clean undefined values before sending to Firestore
          const cleanedExpenseData = cleanUndefinedValues(expenseData);
          console.log('Adding expense with cleaned data:', cleanedExpenseData);
          
          const expenseId = await expensesService.addExpense(user.uid, cleanedExpenseData);
          
          // Optimistically update local state
          const expense: Expense = {
            ...expenseData,
            id: expenseId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => ({
            expenses: [...state.expenses, expense],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to add expense: ${error}` 
          });
          throw error;
        }
      },

      updateExpense: async (id, updates) => {
        const { user } = get();
        
        if (!user) {
          // User not logged in - only update local state
          set((state) => ({
            expenses: state.expenses.map(expense =>
              expense.id === id
                ? { ...expense, ...updates, updatedAt: new Date() }
                : expense
            ),
          }));
          return;
        }

        set({ isLoading: true, syncError: null });
        
        try {
          // Clean undefined values before sending to Firestore
          const cleanedUpdates = cleanUndefinedValues(updates);
          console.log('Updating expense with cleaned data:', cleanedUpdates);
          
          await expensesService.updateExpense(user.uid, id, cleanedUpdates);
          
          // Optimistically update local state
          set((state) => ({
            expenses: state.expenses.map(expense =>
              expense.id === id
                ? { ...expense, ...updates, updatedAt: new Date() }
                : expense
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to update expense: ${error}` 
          });
          throw error;
        }
      },

      deleteExpense: async (id) => {
        const { user } = get();
        
        if (!user) {
          // User not logged in - only delete from local state
          set((state) => ({
            expenses: state.expenses.filter(expense => expense.id !== id),
          }));
          return;
        }

        set({ isLoading: true, syncError: null });
        
        try {
          await expensesService.deleteExpense(user.uid, id);
          
          // Optimistically update local state
          set((state) => ({
            expenses: state.expenses.filter(expense => expense.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to delete expense: ${error}` 
          });
          throw error;
        }
      },

      // UI actions with Firebase sync
      toggleDarkMode: async () => {
        const { user, darkMode } = get();
        const newDarkMode = !darkMode;
        
        set({ darkMode: newDarkMode });
        
        if (user) {
          try {
            await userPreferencesService.savePreferences(user.uid, {
              darkMode: newDarkMode,
              language: get().language
            });
          } catch (error) {
            console.error('Failed to save dark mode preference:', error);
          }
        }
      },

      setLanguage: async (language: 'en' | 'he') => {
        const { user } = get();
        
        set({ language });
        
        if (user) {
          try {
            await userPreferencesService.savePreferences(user.uid, {
              darkMode: get().darkMode,
              language
            });
          } catch (error) {
            console.error('Failed to save language preference:', error);
          }
        }
      },

      // Data synchronization
      syncUserData: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, syncError: null });
        
        try {
          // Load trips and expenses from Firestore
          const [trips, expenses, preferences] = await Promise.all([
            tripsService.getTrips(user.uid),
            expensesService.getExpenses(user.uid),
            userPreferencesService.getPreferences(user.uid)
          ]);

          // Only update if data actually changed
          const currentState = get();
          const hasChanges = 
            trips.length !== currentState.trips.length ||
            expenses.length !== currentState.expenses.length ||
            currentState.darkMode !== (preferences?.darkMode ?? true) ||
            currentState.language !== (preferences?.language ?? 'he');

          if (hasChanges || !currentState.isDataSynced) {
            console.log('Syncing data from Firestore:', { 
              trips: trips.length, 
              expenses: expenses.length 
            });
            
            set({
              trips,
              expenses,
              darkMode: preferences?.darkMode ?? true,
              language: preferences?.language ?? 'he',
              isDataSynced: true,
              isLoading: false,
              syncError: null
            });
          } else {
            console.log('No changes detected, skipping sync');
            set({ isDataSynced: true, isLoading: false, syncError: null });
          }

          // TEMPORARILY DISABLED - Real-time listeners causing infinite loops
          console.log('Real-time listeners disabled to prevent infinite loops');
          
          // TODO: Re-enable with proper duplicate protection
          // const unsubscribeTrips = tripsService.subscribeToTrips(user.uid, (trips) => {
          //   // Add duplicate protection here
          //   set({ trips });
          // });

        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to sync data: ${error}` 
          });
          throw error;
        }
      },

      // Manual one-time load from Firestore (safe, no real-time listeners)
      loadUserDataFromFirestore: async () => {
        const { user } = get();
        if (!user) {
          console.log('🚫 No user logged in, skipping Firestore load');
          return;
        }

        set({ isLoading: true, syncError: null });
        console.log('📥 Loading user data from Firestore...');
        console.log('👤 User ID:', user.uid);
        
        try {
          console.log('🔍 Fetching trips and expenses from Firestore...');
          const [trips, expenses, preferences] = await Promise.all([
            tripsService.getTrips(user.uid),
            expensesService.getExpenses(user.uid),
            userPreferencesService.getPreferences(user.uid)
          ]);

          console.log('📊 Data fetched from Firestore:');
          console.log(`  • Trips: ${trips.length}`);
          console.log(`  • Expenses: ${expenses.length}`);
          console.log('  • Preferences:', preferences);
          
          if (trips.length > 0) {
            console.log('🔍 Trip details:', trips.map(t => ({ id: t.id, name: t.name })));
          }
          
          if (expenses.length > 0) {
            console.log('🔍 Expense details:', expenses.map(e => ({ id: e.id, description: e.description })));
          }
          
          set({
            trips,
            expenses,
            darkMode: preferences?.darkMode ?? true,
            language: preferences?.language ?? 'he',
            isLoading: false,
            isDataSynced: true,
            syncError: null
          });
          
          console.log('✅ User data loaded and stored in state');
        } catch (error) {
          console.error('❌ Failed to load user data from Firestore:', error);
          set({ 
            isLoading: false, 
            syncError: `Failed to load data: ${error}` 
          });
        }
      },

      // Fast batch delete of all user data from Firestore
      deleteAllUserData: async () => {
        const { user } = get();
        if (!user) {
          console.log('🚫 No user logged in, skipping Firestore deletion');
          return;
        }

        set({ isLoading: true, syncError: null });
        console.log('🚀 Starting fast batch deletion of all user data...');
        console.log('👤 User ID:', user.uid);
        
        try {
          // Delete all trips and expenses in parallel using batch operations
          console.log('🔥 Executing parallel batch deletions...');
          await Promise.all([
            tripsService.deleteAllTrips(user.uid),
            expensesService.deleteAllExpenses(user.uid)
          ]);

          console.log('✅ All user data deleted from Firestore successfully');
          
          // Clear local state immediately after successful deletion
          set({ 
            trips: [],
            expenses: [],
            isLoading: false,
            isDataSynced: false,  // Mark as not synced so it won't reload old data
            syncError: null
          });
          
          console.log('🧹 Local state cleared after successful Firestore deletion');
        } catch (error) {
          console.error('❌ Failed to delete user data from Firestore:', error);
          set({ 
            isLoading: false, 
            syncError: `Failed to delete data: ${error}` 
          });
          throw error;
        }
      },

      // Migration from localStorage to Firestore
      migrateLocalData: async () => {
        const { user, trips, expenses } = get();
        if (!user) throw new Error('User must be authenticated');

        if (trips.length === 0 && expenses.length === 0) {
          // No local data to migrate
          return;
        }

        set({ isLoading: true, syncError: null });
        
        try {
          await migrationService.migrateLocalDataToFirestore(user, { trips, expenses });
          
          // After successful migration, sync data from Firestore
          await get().syncUserData();
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            syncError: `Failed to migrate data: ${error}` 
          });
          throw error;
        }
      },

      // Loading and error management
      setLoading: (loading) => set({ isLoading: loading }),
      setSyncError: (error) => set({ syncError: error }),

      // Clear only trips and expenses data (keep user and preferences)
      clearState: () => {
        console.log('🧹 Clearing trips and expenses data (keeping user logged in)');
        set({
          trips: [],
          expenses: [],
          isLoading: false,
          isDataSynced: false,
          syncError: null
          // NOTE: user, darkMode, language are preserved
        });
      },

      // Getters (unchanged)
      getTripById: (id: string) => {
        return get().trips.find(trip => trip.id === id);
      },

      getExpensesByTripId: (tripId: string) => {
        return get().expenses.filter(expense => expense.tripId === tripId);
      },

      getExpensesByTrip: (tripId: string) => {
        return get().expenses.filter(expense => expense.tripId === tripId);
      },

      getTripSummary: (tripId: string) => {
        const trip = get().getTripById(tripId);
        if (!trip) return undefined;
        
        const expenses = get().getExpensesByTripId(tripId);
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
      name: 'travel-expense-tracker-firebase-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trips: state.trips,
        expenses: state.expenses,
        darkMode: state.darkMode,
        language: state.language,
        // Don't persist Firebase-specific state to avoid loops
        // user, isLoading, isDataSynced, syncError are not persisted
      }),
      // Handle date deserialization when loading from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects for trips
          if (state.trips) {
            state.trips = state.trips.map(trip => ({
              ...trip,
              startDate: new Date(trip.startDate),
              endDate: new Date(trip.endDate),
              createdAt: new Date(trip.createdAt),
              updatedAt: new Date(trip.updatedAt),
            }));
          }
          
          // Convert date strings back to Date objects for expenses
          if (state.expenses) {
            state.expenses = state.expenses.map(expense => ({
              ...expense,
              date: new Date(expense.date),
              createdAt: new Date(expense.createdAt),
              updatedAt: new Date(expense.updatedAt),
            }));
          }
        }
      },
      // Add version to handle migrations if needed
      version: 1,
    }
  )
);

// Hook to automatically sync user state with Firebase auth
export const useAuthSync = () => {
  const [user, loading, error] = useAuthState(auth);
  const setUser = useAppStore(state => state.setUser);
  
  useEffect(() => {
    if (!loading) {
      setUser(user || null);
    }
  }, [user, loading, setUser]);

  return { user, loading, error };
};

// Utility hooks for common operations (updated)
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