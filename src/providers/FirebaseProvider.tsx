import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuthSync, useAppStore } from '../store/firebaseStore';

interface FirebaseProviderContext {
  user: User | null;
  isLoading: boolean;
  error: any;
  isDataSynced: boolean;
  syncError: string | null;
}

const FirebaseContext = createContext<FirebaseProviderContext | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const { user, loading, error } = useAuthSync();
  const isDataSynced = useAppStore(state => state.isDataSynced);
  const syncError = useAppStore(state => state.syncError);
  const migrateLocalData = useAppStore(state => state.migrateLocalData);
  const trips = useAppStore(state => state.trips);
  const expenses = useAppStore(state => state.expenses);

  // TEMPORARILY DISABLED - Auto-migration causing infinite loops
  useEffect(() => {
    console.log('Auto-migration disabled to prevent infinite loops');
    // TODO: Fix migration logic to prevent loops
    
    // if (user && !isDataSynced && (trips.length > 0 || expenses.length > 0)) {
    //   const handleMigration = async () => {
    //     try {
    //       console.log('Migrating local data to Firestore...');
    //       await migrateLocalData();
    //       console.log('Migration completed successfully');
    //     } catch (error) {
    //       console.error('Migration failed:', error);
    //     }
    //   };
    //   handleMigration();
    // }
  }, [user, isDataSynced, migrateLocalData]);

  const contextValue: FirebaseProviderContext = {
    user: user || null,
    isLoading: loading,
    error,
    isDataSynced,
    syncError,
  };  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseProviderContext => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Hook for easy access to Firebase auth state
export const useAuth = () => {
  const { user, isLoading, error } = useFirebase();
  return { user, isLoading, error, isAuthenticated: !!user };
};