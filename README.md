# Travel Expense Tracker 🌍✈️# Travel Expense Tracker 🌍✈️# Getting Started with Create React App



A modern web application for tracking travel expenses with AI-powered currency conversion.



![Version](https://img.shields.io/badge/Version-1.1.0-blue.svg)A modern, AI-powered web application for tracking travel expenses with real-time currency conversion and intelligent expense management.This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

![React](https://img.shields.io/badge/React-18.x-61dafb.svg)

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)



## 🔗 Live Demo![Travel Expense Tracker](https://img.shields.io/badge/Version-1.0.0-blue.svg)## Available Scripts



**Visit the app**: [https://levilop-software.github.io/travel-expense-tracker/](https://levilop-software.github.io/travel-expense-tracker/)![React](https://img.shields.io/badge/React-18.x-61dafb.svg)



## ✨ Features![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)In the project directory, you can run:



- **Trip Management**: Create and organize multiple trips![Material-UI](https://img.shields.io/badge/Material--UI-5.x-0081cb.svg)

- **Expense Tracking**: Add and categorize expenses 

- **AI Currency Conversion**: Real-time exchange rates using Google Gemini AI### `npm start`

- **Multi-Language**: Hebrew and English support

- **Dark/Light Themes**: Toggle between UI themes## 🔗 Live Demo

- **Analytics**: Visual spending insights with charts

Runs the app in the development mode.\

## 🛠️ Tech Stack

**Visit the app**: [https://levilop-software.github.io/travel-expense-tracker/](https://levilop-software.github.io/travel-expense-tracker/)Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

- **Frontend**: React 18 + TypeScript

- **UI**: Material-UI (MUI)

- **State**: Zustand

- **Backend**: Firebase (Auth + Firestore)## ✨ FeaturesThe page will reload if you make edits.\

- **AI**: Google Gemini API

- **Deploy**: GitHub PagesYou will also see any lint errors in the console.



## 🚀 Quick Start### 🎯 Core Features



```bash- **Trip Management**: Create, edit, and organize multiple trips### `npm test`

# Clone repository

git clone https://github.com/LeviLop-Software/travel-expense-tracker.git- **Expense Tracking**: Add, categorize, and manage expenses with detailed information

cd travel-expense-tracker

- **AI-Powered Currency Conversion**: Real-time exchange rates using Google Gemini AILaunches the test runner in the interactive watch mode.\

# Install dependencies

npm install- **Multi-Language Support**: Hebrew and English interfacesSee the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.



# Start development server- **Dark/Light Themes**: Toggle between modern UI themes

npm start

- **Analytics Dashboard**: Visual insights into spending patterns### `npm run build`

# Build for production

npm run build



# Deploy to GitHub Pages### 🤖 AI IntegrationBuilds the app for production to the `build` folder.\

npm run deploy

```- **Google Gemini AI**: Intelligent currency conversion with natural language processingIt correctly bundles React in production mode and optimizes the build for the best performance.



## 📝 Environment Setup- **Fallback System**: External API backup for reliable currency data



Create `.env.local` file:- **Smart Loading States**: Skeleton screens during AI processingThe build is minified and the filenames include the hashes.\



```envYour app is ready to be deployed!

REACT_APP_FIREBASE_API_KEY=your_firebase_api_key

REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com### 📱 User Experience

REACT_APP_FIREBASE_PROJECT_ID=your_project_id

REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com- **Responsive Design**: Mobile-first approach with Material-UISee the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

REACT_APP_FIREBASE_APP_ID=your_app_id- **Progressive Web App**: Installable on mobile devices

REACT_APP_GEMINI_API_KEY=your_gemini_api_key

```- **Offline Support**: Local storage for seamless usage### `npm run eject`



## 🏢 About- **Real-time Updates**: Live data synchronization



Developed by [**Levilop Software**](https://levilop.com)**Note: this is a one-way operation. Once you `eject`, you can’t go back!**



---## 🏗️ Architecture



**Made with ❤️ by [Levilop Software](https://levilop.com)**If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

### Frontend Stack

```Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

├── React 18 + TypeScript

├── Material-UI (MUI) v5You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

├── Zustand (State Management)

├── React Router v6## Learn More

├── React i18next (Internationalization)

└── Date-fns (Date utilities)You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

```

To learn React, check out the [React documentation](https://reactjs.org/).

### Backend & Services
```
├── Firebase Authentication
├── Firestore Database
├── Google Gemini AI (Currency API)
├── ExchangeRate-API (Fallback)
└── GitHub Pages (Deployment)
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   ├── Footer.tsx      # Company footer with version
│   └── TripList.tsx    # Trip listing component
├── pages/              # Page components
│   ├── Home.tsx        # Dashboard/home page
│   ├── TripPage.tsx    # Trip details and expenses
│   └── AnalyticsPage.tsx # Charts and insights
├── store/              # State management
│   └── firebaseStore.ts # Zustand store with Firebase
├── utils/              # Business logic
│   ├── currencyConverter.ts # AI currency conversion
│   └── firebase.ts     # Firebase configuration
├── providers/          # Context providers
│   └── FirebaseProvider.tsx # Firebase context
├── theme/              # UI theming
│   └── index.ts        # Material-UI themes
└── i18n/               # Internationalization
    └── index.ts        # Language configurations
```

## 🚀 Technology Deep Dive

### AI-Powered Currency Conversion
The application uses a sophisticated currency conversion system:

1. **Primary**: Google Gemini AI API for intelligent exchange rate processing
2. **Fallback**: ExchangeRate-API for reliable backup data
3. **Caching**: Local storage to minimize API calls
4. **Error Handling**: Graceful degradation with user feedback

```typescript
// Example: AI Currency Conversion Flow
const rate = await getCurrentExchangeRate(fromCurrency, toCurrency);
// 1. Try Gemini AI with natural language processing
// 2. Fall back to external API if needed
// 3. Cache results for performance
// 4. Return formatted rate with error handling
```

### State Management with Zustand
Lightweight and powerful state management:

```typescript
interface AppState {
  user: User | null;
  trips: Trip[];
  expenses: Expense[];
  darkMode: boolean;
  language: string;
  // Actions
  setUser: (user: User | null) => void;
  // ... more actions
}
```

### Firebase Integration
- **Authentication**: Google Sign-in with email/password fallback
- **Database**: Firestore for scalable NoSQL data storage
- **Real-time**: Live updates across devices
- **Security**: Firestore rules for data protection

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project setup
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LeviLop-Software/travel-expense-tracker.git
cd travel-expense-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file:
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

4. **Start development server**
```bash
npm start
```

5. **Build for production**
```bash
npm run build
```

### Deployment to GitHub Pages
```bash
# Build and deploy
npm run deploy
```

## 📊 Performance & Optimization

### Bundle Optimization
- **Code Splitting**: React.lazy() for route-based splitting
- **Tree Shaking**: Eliminate unused code
- **Compression**: Gzipped assets for faster loading
- **Caching**: Browser caching strategies

### User Experience
- **Skeleton Loading**: Smooth loading states during AI processing
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliance

## 🔐 Security

### Data Protection
- **Firebase Security Rules**: Server-side data validation
- **Environment Variables**: Secure API key management
- **Authentication**: Secure user sessions
- **HTTPS**: Encrypted data transmission

### Privacy
- **Local Storage**: Minimal sensitive data storage
- **Session Management**: Secure authentication tokens
- **Data Encryption**: Firebase built-in encryption

## 📈 Analytics & Monitoring

### Built-in Analytics
- **Expense Categorization**: Visual breakdown of spending
- **Currency Analysis**: Multi-currency expense tracking
- **Time-based Reports**: Spending trends over time
- **Trip Comparisons**: Comparative analytics between trips

### Charts & Visualizations
- **Recharts Library**: Interactive and responsive charts
- **Pie Charts**: Expense category distribution
- **Line Charts**: Spending trends over time
- **Bar Charts**: Trip-to-trip comparisons

## 🌐 Internationalization

### Supported Languages
- **Hebrew (עברית)**: Full RTL support
- **English**: Default language
- **Extensible**: Easy addition of new languages

### RTL Support
- **Material-UI RTL**: Complete right-to-left layout
- **Stylis Plugin**: Automatic CSS direction conversion
- **Date Formatting**: Locale-aware date/time display

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Testing**: Jest + React Testing Library

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Levilop Software

**Travel Expense Tracker** is developed and maintained by [**Levilop Software**](https://levilop.com) - a software development company specializing in modern web applications and AI integration.

### Contact
- **Website**: [levilop.com](https://levilop.com)
- **Project**: [GitHub Repository](https://github.com/LeviLop-Software/travel-expense-tracker)

## 🔮 Future Roadmap

### Planned Features
- **Receipt OCR**: AI-powered receipt scanning
- **Budget Planning**: Trip budget management with alerts
- **Expense Sharing**: Split expenses with travel companions
- **Offline Mode**: Complete offline functionality
- **Mobile App**: React Native mobile application
- **Export Features**: PDF/Excel report generation

### AI Enhancements
- **Smart Categorization**: AI-powered expense categorization
- **Spending Insights**: Intelligent spending pattern analysis
- **Budget Recommendations**: AI-driven budget suggestions
- **Fraud Detection**: Unusual expense pattern detection

---

**Made with ❤️ by [Levilop Software](https://levilop.com)**

**Version**: 1.0.0 | **Last Updated**: October 2025