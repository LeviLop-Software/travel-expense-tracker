// דוגמה למבנה הנתונים ב-Firestore

// טיול ברלין:
// /users/your-user-id/trips/trip-berlin-123
{
  "name": "טיול לברלין",
  "destination": "ברלין, גרמניה",
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-11-07T00:00:00.000Z",
  "initialBudget": 2000,
  "initialCash": 500,
  "currency": "EUR",
  "description": "חופשה בברלין עם המשפחה",
  "isOpenBudget": false,
  "createdAt": "2025-10-16T10:30:00.000Z",
  "updatedAt": "2025-10-16T10:30:00.000Z"
}

// הוצאה 1 - ארוחת ערב:
// /users/your-user-id/expenses/expense-dinner-456
{
  "tripId": "trip-berlin-123",
  "amount": 85,
  "currency": "EUR",
  "category": "food",
  "description": "ארוחת ערב במסעדה איטלקית",
  "date": "2025-11-02T19:00:00.000Z",
  "paymentMethod": "card",
  "location": "רובע מיטה, ברלין",
  "createdAt": "2025-11-02T19:05:00.000Z",
  "updatedAt": "2025-11-02T19:05:00.000Z"
}

// הוצאה 2 - כרטיס תחבורה:
// /users/your-user-id/expenses/expense-transport-789
{
  "tripId": "trip-berlin-123",
  "amount": 15,
  "currency": "EUR",
  "category": "transportation",
  "description": "כרטיס יומי לתחבורה ציבורית",
  "date": "2025-11-02T08:30:00.000Z",
  "paymentMethod": "cash",
  "createdAt": "2025-11-02T08:35:00.000Z",
  "updatedAt": "2025-11-02T08:35:00.000Z"
}

// הוצאה 3 - מלון:
// /users/your-user-id/expenses/expense-hotel-012
{
  "tripId": "trip-berlin-123",
  "amount": 120,
  "currency": "EUR",
  "category": "accommodation",
  "description": "לילה במלון",
  "date": "2025-11-01T15:00:00.000Z",
  "paymentMethod": "card",
  "createdAt": "2025-11-01T15:10:00.000Z",
  "updatedAt": "2025-11-01T15:10:00.000Z"
}

// העדפות המשתמש:
// /userPreferences/your-user-id
{
  "userId": "your-user-id",
  "darkMode": true,
  "language": "he",
  "createdAt": "2025-10-16T10:00:00.000Z",
  "updatedAt": "2025-10-16T12:45:00.000Z"
}