import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, createTheme } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store/firebaseStore';
import { FirebaseProvider } from './providers/FirebaseProvider';
import { lightTheme, darkTheme } from './theme';
import './i18n'; // Initialize i18n

// Pages
import Home from './pages/Home';
import TripPage from './pages/TripPage';
import NewTripPage from './pages/NewTripPage';
import EditTripPage from './pages/EditTripPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Components
import Navbar from './components/Navbar';

function App() {
  const { i18n } = useTranslation();
  const darkMode = useAppStore(state => state.darkMode);
  const language = useAppStore(state => state.language);
  
  // Update i18n language when store language changes
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Create emotion cache for RTL
  const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [rtlPlugin],
  });

  const cacheLtr = createCache({
    key: 'muiltr',
  });

  // Create theme with RTL support for Hebrew
  const baseTheme = darkMode ? darkTheme : lightTheme;
  const theme = createTheme({
    ...baseTheme,
    direction: language === 'he' ? 'rtl' : 'ltr',
  });

  // Apply RTL to document
  useEffect(() => {
    document.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const emotionCache = language === 'he' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FirebaseProvider>
          <Router>
          <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: 'background.default',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: -3,
              background: darkMode 
                ? `radial-gradient(ellipse 80% 80% at 50% -20%, 
                    rgba(120, 119, 198, 0.4) 0%, 
                    rgba(255, 255, 255, 0) 100%),
                   radial-gradient(ellipse 80% 80% at 80% 120%, 
                    rgba(255, 154, 158, 0.4) 0%, 
                    rgba(255, 255, 255, 0) 100%),
                   radial-gradient(ellipse 80% 80% at 20% 80%, 
                    rgba(120, 220, 232, 0.4) 0%, 
                    rgba(255, 255, 255, 0) 100%)`
                : `radial-gradient(ellipse 80% 80% at 50% -20%, 
                    rgba(120, 119, 198, 0.2) 0%, 
                    rgba(255, 255, 255, 0) 100%),
                   radial-gradient(ellipse 80% 80% at 80% 120%, 
                    rgba(255, 154, 158, 0.2) 0%, 
                    rgba(255, 255, 255, 0) 100%),
                   radial-gradient(ellipse 80% 80% at 20% 80%, 
                    rgba(120, 220, 232, 0.2) 0%, 
                    rgba(255, 255, 255, 0) 100%)`,
              animation: 'gradientShift 12s ease-in-out infinite',
              transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&::after': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: -2,
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 100px,
                  ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 100px,
                  ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 102px
                )
              `,
              animation: 'patternMove 20s linear infinite',
              transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            // Theme transition ripple effect
            '@keyframes gradientShift': {
              '0%, 100%': {
                transform: 'scale(1) rotate(0deg)',
                opacity: 1,
              },
              '33%': {
                transform: 'scale(1.1) rotate(120deg)',
                opacity: 0.8,
              },
              '66%': {
                transform: 'scale(0.9) rotate(240deg)',
                opacity: 0.6,
              },
            },
            '@keyframes patternMove': {
              '0%': {
                transform: 'translateX(-100px) translateY(-100px)',
              },
              '100%': {
                transform: 'translateX(100px) translateY(100px)',
              },
            },
            '@keyframes themeRipple': {
              '0%': {
                transform: 'scale(1)',
                filter: 'brightness(1)',
              },
              '50%': {
                transform: 'scale(1.05)',
                filter: 'brightness(1.2)',
              },
              '100%': {
                transform: 'scale(1)',
                filter: 'brightness(1)',
              },
            },
          }}>
            {/* Floating Elements */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                '& .floating-element': {
                  position: 'absolute',
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, 
                    ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(120,119,198,0.15)'}, 
                    ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,154,158,0.15)'})`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 8px 32px ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  animation: 'float 6s ease-in-out infinite',
                },
                '& .floating-element:nth-of-type(1)': {
                  width: '100px',
                  height: '100px',
                  top: '10%',
                  left: '10%',
                  animationDelay: '0s',
                },
                '& .floating-element:nth-of-type(2)': {
                  width: '140px',
                  height: '140px',
                  top: '70%',
                  right: '10%',
                  animationDelay: '2s',
                },
                '& .floating-element:nth-of-type(3)': {
                  width: '80px',
                  height: '80px',
                  top: '40%',
                  left: '80%',
                  animationDelay: '4s',
                },
                '& .floating-element:nth-of-type(4)': {
                  width: '120px',
                  height: '120px',
                  bottom: '20%',
                  left: '20%',
                  animationDelay: '1s',
                },
                '@keyframes float': {
                  '0%, 100%': {
                    transform: 'translateY(0px) scale(1) rotate(0deg)',
                    opacity: 0.8,
                  },
                  '50%': {
                    transform: 'translateY(-30px) scale(1.2) rotate(180deg)',
                    opacity: 0.4,
                  },
                },
              }}
            >
              <Box className="floating-element" />
              <Box className="floating-element" />
              <Box className="floating-element" />
              <Box className="floating-element" />
            </Box>

            {/* Animated Particles */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                '& .particle': {
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  background: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(120,119,198,0.8)',
                  borderRadius: '50%',
                  boxShadow: `0 0 10px ${darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(120,119,198,0.5)'}`,
                  animation: 'particleFloat 8s linear infinite',
                },
                '& .particle:nth-of-type(1)': { left: '10%', animationDelay: '0s' },
                '& .particle:nth-of-type(2)': { left: '20%', animationDelay: '1s' },
                '& .particle:nth-of-type(3)': { left: '30%', animationDelay: '2s' },
                '& .particle:nth-of-type(4)': { left: '40%', animationDelay: '3s' },
                '& .particle:nth-of-type(5)': { left: '50%', animationDelay: '4s' },
                '& .particle:nth-of-type(6)': { left: '60%', animationDelay: '5s' },
                '& .particle:nth-of-type(7)': { left: '70%', animationDelay: '6s' },
                '& .particle:nth-of-type(8)': { left: '80%', animationDelay: '7s' },
                '& .particle:nth-of-type(9)': { left: '90%', animationDelay: '8s' },
                '@keyframes particleFloat': {
                  '0%': {
                    transform: 'translateY(100vh) scale(0) rotate(0deg)',
                    opacity: 0,
                  },
                  '10%': {
                    opacity: 1,
                  },
                  '90%': {
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'translateY(-10vh) scale(1.5) rotate(360deg)',
                    opacity: 0,
                  },
                },
              }}
            >
              {[...Array(9)].map((_, i) => (
                <Box key={i} className="particle" />
              ))}
            </Box>
            
            <Navbar />
            <Box sx={{ 
              pt: { xs: 10, sm: 12 }, // Account for navbar height + extra spacing
              px: { xs: 1, sm: 2, md: 3 },
              pb: 3,
              position: 'relative',
              zIndex: 1,
              backgroundColor: darkMode 
                ? 'rgba(18, 18, 18, 0.85)' 
                : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: { xs: 0, sm: '16px 16px 0 0' },
              mx: { xs: 0, sm: 1, md: 2 },
              minHeight: 'calc(100vh - 80px)',
            }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/trip/new" element={<NewTripPage />} />
                <Route path="/trip/:tripId" element={<TripPage />} />
                <Route path="/trip/:tripId/edit" element={<EditTripPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
        </FirebaseProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
