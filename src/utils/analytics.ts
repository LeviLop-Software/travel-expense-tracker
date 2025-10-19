import { logEvent, Analytics } from 'firebase/analytics';
import { analytics } from '../firebase';

// אירועי אנליטיקה מותאמים אישית לאפליקציית מעקב הוצאות הנסיעה
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics as Analytics, eventName, parameters);
  }
};

// טרקינג כניסת משתמש
export const trackUserLogin = (method: string) => {
  trackEvent('login', {
    method: method,
    timestamp: new Date().toISOString()
  });
};

// טרקינג יצירת נסיעה חדשה
export const trackTripCreated = (tripData: {
  destination?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
}) => {
  trackEvent('trip_created', {
    destination: tripData.destination || 'unknown',
    trip_duration_days: tripData.startDate && tripData.endDate 
      ? Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    currency: tripData.currency || 'unknown',
    timestamp: new Date().toISOString()
  });
};

// טרקינג הוספת הוצאה
export const trackExpenseAdded = (expenseData: {
  category?: string;
  amount?: number;
  currency?: string;
  isShared?: boolean;
  hasReceipt?: boolean;
}) => {
  trackEvent('expense_added', {
    category: expenseData.category || 'unknown',
    amount_range: getAmountRange(expenseData.amount || 0),
    currency: expenseData.currency || 'unknown',
    is_shared: expenseData.isShared || false,
    has_receipt: expenseData.hasReceipt || false,
    timestamp: new Date().toISOString()
  });
};

// טרקינג עריכת הוצאה
export const trackExpenseEdited = (category?: string) => {
  trackEvent('expense_edited', {
    category: category || 'unknown',
    timestamp: new Date().toISOString()
  });
};

// טרקינג מחיקת הוצאה
export const trackExpenseDeleted = (category?: string) => {
  trackEvent('expense_deleted', {
    category: category || 'unknown',
    timestamp: new Date().toISOString()
  });
};

// טרקינג השתמשות באנליטיקה
export const trackAnalyticsViewed = (chartType?: string) => {
  trackEvent('analytics_viewed', {
    chart_type: chartType || 'overview',
    timestamp: new Date().toISOString()
  });
};

// טרקינג שינוי שפה
export const trackLanguageChanged = (language: string) => {
  trackEvent('language_changed', {
    language: language,
    timestamp: new Date().toISOString()
  });
};

// טרקינג שימוש במצב אופליין
export const trackOfflineMode = (action: 'started' | 'synced') => {
  trackEvent('offline_mode', {
    action: action,
    timestamp: new Date().toISOString()
  });
};

// טרקינג שימוש ב-AI
export const trackAIUsage = (action: 'categorization' | 'location_suggestion') => {
  trackEvent('ai_usage', {
    action: action,
    timestamp: new Date().toISOString()
  });
};

// טרקינג שגיאות
export const trackError = (errorType: string, errorMessage?: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage || 'unknown',
    timestamp: new Date().toISOString()
  });
};

// פונקציה עזר לקטגוריזציה של סכומים
const getAmountRange = (amount: number): string => {
  if (amount === 0) return '0';
  if (amount < 50) return '1-50';
  if (amount < 100) return '51-100';
  if (amount < 250) return '101-250';
  if (amount < 500) return '251-500';
  if (amount < 1000) return '501-1000';
  return '1000+';
};

// טרקינג משך הסשן
let sessionStartTime = Date.now();

export const trackSessionEnd = () => {
  const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
  trackEvent('session_end', {
    session_duration_seconds: sessionDuration,
    timestamp: new Date().toISOString()
  });
};

// התחלת סשן חדש
export const startNewSession = () => {
  sessionStartTime = Date.now();
  trackEvent('session_start', {
    timestamp: new Date().toISOString()
  });
};