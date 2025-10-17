import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { Trip, Expense } from '../types';

// Helper function to convert Firestore data to app format
const convertFirestoreTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// Trip service functions
export const tripsService = {
  // Get user's collection reference
  getUserTripsRef: (userId: string) => collection(db, 'users', userId, 'trips'),
  
  // Add a new trip
  addTrip: async (userId: string, trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const tripsRef = tripsService.getUserTripsRef(userId);
    const docRef = await addDoc(tripsRef, {
      ...trip,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update a trip
  updateTrip: async (userId: string, tripId: string, updates: Partial<Trip>): Promise<void> => {
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete a trip
  deleteTrip: async (userId: string, tripId: string): Promise<void> => {
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    await deleteDoc(tripRef);
    
    // Also delete all expenses for this trip
    await expensesService.deleteExpensesByTrip(userId, tripId);
  },

  // Get all trips for a user
  getTrips: async (userId: string): Promise<Trip[]> => {
    const tripsRef = tripsService.getUserTripsRef(userId);
    const q = query(tripsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: convertFirestoreTimestamp(doc.data().startDate),
      endDate: convertFirestoreTimestamp(doc.data().endDate),
      createdAt: convertFirestoreTimestamp(doc.data().createdAt),
      updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
    } as Trip));
  },

  // Subscribe to trips changes
  subscribeToTrips: (userId: string, callback: (trips: Trip[]) => void) => {
    const tripsRef = tripsService.getUserTripsRef(userId);
    const q = query(tripsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: convertFirestoreTimestamp(doc.data().startDate),
        endDate: convertFirestoreTimestamp(doc.data().endDate),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
      } as Trip));
      callback(trips);
    });
  },

  // Delete all trips for a user (batch operation)
  deleteAllTrips: async (userId: string): Promise<void> => {
    console.log('🗑️ Starting batch delete of all trips for user:', userId);
    
    const tripsRef = tripsService.getUserTripsRef(userId);
    const snapshot = await getDocs(tripsRef);
    
    if (snapshot.empty) {
      console.log('✅ No trips to delete');
      return;
    }

    // Firestore batch can handle max 500 operations
    const batch = writeBatch(db);
    let operationCount = 0;
    const maxBatchSize = 500;

    console.log(`📊 Found ${snapshot.docs.length} trips to delete`);

    // Add all trip deletions to batch
    for (const docSnapshot of snapshot.docs) {
      console.log(`➕ Adding trip to batch delete: ${docSnapshot.id}`);
      batch.delete(docSnapshot.ref);
      operationCount++;
      
      // If we hit the batch limit, commit and start a new batch
      if (operationCount >= maxBatchSize) {
        console.log(`⚡ Committing batch of ${operationCount} operations`);
        await batch.commit();
        console.log('✅ Batch committed successfully');
        operationCount = 0;
      }
    }

    // Commit any remaining operations
    if (operationCount > 0) {
      console.log(`⚡ Committing final batch of ${operationCount} operations`);
      await batch.commit();
      console.log('✅ Final batch committed successfully');
    }

    console.log('✅ All trips deleted successfully from Firestore');
    
    // Verify deletion by checking if collection is empty
    const verifySnapshot = await getDocs(tripsRef);
    console.log(`🔍 Verification: ${verifySnapshot.docs.length} trips remaining`);
  },
};

// Expense service functions
export const expensesService = {
  // Get user's expenses collection reference
  getUserExpensesRef: (userId: string) => collection(db, 'users', userId, 'expenses'),
  
  // Add a new expense
  addExpense: async (userId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const expensesRef = expensesService.getUserExpensesRef(userId);
    const docRef = await addDoc(expensesRef, {
      ...expense,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update an expense
  updateExpense: async (userId: string, expenseId: string, updates: Partial<Expense>): Promise<void> => {
    const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete an expense
  deleteExpense: async (userId: string, expenseId: string): Promise<void> => {
    const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  },

  // Delete all expenses for a trip
  deleteExpensesByTrip: async (userId: string, tripId: string): Promise<void> => {
    const expensesRef = expensesService.getUserExpensesRef(userId);
    const q = query(expensesRef, where('tripId', '==', tripId));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  // Get all expenses for a user
  getExpenses: async (userId: string): Promise<Expense[]> => {
    const expensesRef = expensesService.getUserExpensesRef(userId);
    const q = query(expensesRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: convertFirestoreTimestamp(doc.data().date),
      createdAt: convertFirestoreTimestamp(doc.data().createdAt),
      updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
    } as Expense));
  },

  // Get expenses for a specific trip
  getTripExpenses: async (userId: string, tripId: string): Promise<Expense[]> => {
    const expensesRef = expensesService.getUserExpensesRef(userId);
    const q = query(
      expensesRef, 
      where('tripId', '==', tripId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: convertFirestoreTimestamp(doc.data().date),
      createdAt: convertFirestoreTimestamp(doc.data().createdAt),
      updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
    } as Expense));
  },

  // Subscribe to expenses changes
  subscribeToExpenses: (userId: string, callback: (expenses: Expense[]) => void) => {
    const expensesRef = expensesService.getUserExpensesRef(userId);
    const q = query(expensesRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertFirestoreTimestamp(doc.data().date),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
      } as Expense));
      callback(expenses);
    });
  },

  // Subscribe to trip expenses changes
  subscribeToTripExpenses: (userId: string, tripId: string, callback: (expenses: Expense[]) => void) => {
    const expensesRef = expensesService.getUserExpensesRef(userId);
    const q = query(
      expensesRef, 
      where('tripId', '==', tripId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertFirestoreTimestamp(doc.data().date),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
      } as Expense));
      callback(expenses);
    });
  },

  // Delete all expenses for a user (batch operation)
  deleteAllExpenses: async (userId: string): Promise<void> => {
    console.log('🗑️ Starting batch delete of all expenses for user:', userId);
    
    const expensesRef = expensesService.getUserExpensesRef(userId);
    const snapshot = await getDocs(expensesRef);
    
    if (snapshot.empty) {
      console.log('✅ No expenses to delete');
      return;
    }

    // Firestore batch can handle max 500 operations
    const batch = writeBatch(db);
    let operationCount = 0;
    const maxBatchSize = 500;

    console.log(`📊 Found ${snapshot.docs.length} expenses to delete`);

    // Add all expense deletions to batch
    for (const docSnapshot of snapshot.docs) {
      console.log(`➕ Adding expense to batch delete: ${docSnapshot.id}`);
      batch.delete(docSnapshot.ref);
      operationCount++;
      
      // If we hit the batch limit, commit and start a new batch
      if (operationCount >= maxBatchSize) {
        console.log(`⚡ Committing batch of ${operationCount} operations`);
        await batch.commit();
        console.log('✅ Batch committed successfully');
        operationCount = 0;
      }
    }

    // Commit any remaining operations
    if (operationCount > 0) {
      console.log(`⚡ Committing final batch of ${operationCount} operations`);
      await batch.commit();
      console.log('✅ Final batch committed successfully');
    }

    console.log('✅ All expenses deleted successfully from Firestore');
    
    // Verify deletion by checking if collection is empty
    const verifySnapshot = await getDocs(expensesRef);
    console.log(`🔍 Verification: ${verifySnapshot.docs.length} expenses remaining`);
  },
};

// User preferences service
export const userPreferencesService = {
  // Get user preferences reference
  getUserPrefsRef: (userId: string) => doc(db, 'userPreferences', userId),
  
  // Save user preferences
  savePreferences: async (userId: string, preferences: { darkMode: boolean; language: 'en' | 'he' }): Promise<void> => {
    const userPrefsRef = userPreferencesService.getUserPrefsRef(userId);
    await updateDoc(userPrefsRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, 'userPreferences'), {
        userId,
        ...preferences,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  },

  // Get user preferences
  getPreferences: async (userId: string): Promise<{ darkMode: boolean; language: 'en' | 'he' } | null> => {
    const userPrefsRef = userPreferencesService.getUserPrefsRef(userId);
    const doc = await getDoc(userPrefsRef);
    
    if (doc.exists()) {
      const data = doc.data();
      return {
        darkMode: data.darkMode || false,
        language: data.language || 'en',
      };
    }
    
    return null;
  },
};

// Migration helper - to move data from localStorage to Firestore
export const migrationService = {
  // Migrate existing data to Firestore
  migrateLocalDataToFirestore: async (user: User, localData: { trips: Trip[]; expenses: Expense[] }) => {
    const { trips, expenses } = localData;
    
    try {
      // Migrate trips
      for (const trip of trips) {
        const { id, ...tripData } = trip;
        await tripsService.addTrip(user.uid, tripData);
      }

      // Migrate expenses
      for (const expense of expenses) {
        const { id, ...expenseData } = expense;
        await expensesService.addExpense(user.uid, expenseData);
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },
};