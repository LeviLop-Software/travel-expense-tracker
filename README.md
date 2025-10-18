# Travel Expense Tracker 🌍✈️

A modern web application for tracking travel expenses with AI-powered currency conversion.

![Version](https://img.shields.io/badge/Version-1.3.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![Material-UI](https://img.shields.io/badge/Material--UI-5.x-0081cb.svg)

## 🔗 Live Demo

**Visit the app**: [https://levilop-software.github.io/travel-expense-tracker/](https://levilop-software.github.io/travel-expense-tracker/)

## ✨ Key Features

- **Trip Management**: Create and organize multiple trips
- **Expense Tracking**: Add and categorize expenses with details
- **AI Currency Conversion**: Real-time exchange rates using Google Gemini AI
- **Multi-Language Support**: Hebrew and English interfaces
- **Dark/Light Themes**: Toggle between UI themes
- **Analytics Dashboard**: Visual spending insights with charts
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for modern UI components
- **Zustand** for lightweight state management
- **React Router** for navigation
- **React i18next** for internationalization
- **Recharts** for data visualization

### Backend & Services
- **Firebase Authentication** for secure user login
- **Firestore Database** for real-time data storage
- **Google Gemini AI** for intelligent currency conversion
- **ExchangeRate API** as fallback for currency data

### Deployment
- **GitHub Pages** for hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project (for authentication and database)
- Google Gemini API key (for AI currency conversion)

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
Create `.env.local` file in the root directory:
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

### Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

## 📱 Features Overview

### Trip Management
- Create trips with destination, dates, and budget
- Edit trip details and settings
- Delete trips (with confirmation)
- Trip list with search and filtering

### Expense Tracking
- Add expenses with categories (food, transport, accommodation, etc.)
- Attach receipts and notes
- Multi-currency support
- Real-time currency conversion

### AI-Powered Currency Conversion
- Uses Google Gemini AI for intelligent exchange rate processing
- Fallback to reliable external API
- Caches rates for performance
- Supports 150+ currencies

### Analytics & Insights
- Visual charts showing spending patterns
- Category-wise expense breakdown
- Daily/weekly/monthly spending trends
- Budget vs actual spending comparison

### User Experience
- Responsive design for all devices
- Dark and light theme support
- RTL support for Hebrew
- Loading states and error handling
- Offline-first approach with local storage

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Levilop Software

**Travel Expense Tracker** is developed and maintained by [**Levilop Software**](https://levilop.com) - a software development company specializing in modern web applications and AI integration.

### Contact & Links
- **Website**: [levilop.com](https://levilop.com)
- **Repository**: [GitHub](https://github.com/LeviLop-Software/travel-expense-tracker)
- **Live Demo**: [https://levilop-software.github.io/travel-expense-tracker/](https://levilop-software.github.io/travel-expense-tracker/)

---

**Made with ❤️ by [Levilop Software](https://levilop.com)**

*Last updated: October 2025 | Version 1.3.0*