import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Add,
  Language,
  FlightTakeoff,
  Home,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/firebaseStore';
import { AuthButton } from './AuthButton';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { t } = useTranslation();
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  
  const darkMode = useAppStore(state => state.darkMode);
  const language = useAppStore(state => state.language);
  const toggleDarkMode = useAppStore(state => state.toggleDarkMode);
  const setLanguage = useAppStore(state => state.setLanguage);

  const isHome = location.pathname === '/';

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = (lang: 'en' | 'he') => {
    setLanguage(lang);
    handleLanguageMenuClose();
  };

  const navItems = [
    { 
      icon: Home, 
      label: t('nav.home'), 
      path: '/',
      active: isHome
    },
    { 
      icon: TrendingUp, 
      label: t('nav.analytics'), 
      path: '/analytics',
      active: location.pathname === '/analytics'
    },
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: darkMode 
          ? `linear-gradient(135deg, 
              ${theme.palette.grey[900]} 0%, 
              ${theme.palette.grey[800]} 25%,
              ${theme.palette.primary.dark} 50%,
              ${theme.palette.secondary.dark} 75%,
              ${theme.palette.grey[800]} 100%)`
          : `linear-gradient(135deg, 
              ${theme.palette.primary.main} 0%, 
              ${theme.palette.primary.dark} 25%,
              ${theme.palette.secondary.main} 50%,
              ${theme.palette.secondary.dark} 75%,
              ${theme.palette.primary.main} 100%)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.common.white, 0.1)} 0%, 
            ${alpha(theme.palette.common.white, 0.05)} 50%,
            ${alpha(theme.palette.common.white, 0.02)} 100%)`,
          zIndex: -1,
        },
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: { xs: 70, sm: 80 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background particles effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 50%),
                        radial-gradient(circle at 40% 60%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5 },
              '50%': { opacity: 0.8 },
            },
            zIndex: -1,
          }}
        />

        {/* Logo and Brand */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 4,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              position: 'relative',
              mr: 2,
              background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.2)}, ${alpha(theme.palette.common.white, 0.1)})`,
              borderRadius: '16px',
              p: 1.5,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.3)}, ${alpha(theme.palette.common.white, 0.15)})`,
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: '18px',
                zIndex: -1,
                opacity: 0.6,
              },
            }}
          >
            <FlightTakeoff 
              sx={{ 
                fontSize: '2rem',
                color: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }} 
            />
          </Box>
          
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: '1.3rem', sm: '1.6rem' },
              background: `linear-gradient(45deg, 
                ${theme.palette.common.white} 0%, 
                ${alpha(theme.palette.common.white, 0.9)} 50%,
                ${theme.palette.common.white} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1px',
              textShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`,
              fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
            }}
          >
            {t('home.title')}
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          alignItems: 'center', 
          gap: 1,
          mr: 'auto'
        }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              startIcon={<item.icon />}
              onClick={() => navigate(item.path)}
              sx={{
                color: 'white',
                textTransform: 'none',
                fontWeight: item.active ? 700 : 500,
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                position: 'relative',
                background: item.active 
                  ? `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.25)}, ${alpha(theme.palette.common.white, 0.15)})` 
                  : 'transparent',
                backdropFilter: item.active ? 'blur(10px)' : 'none',
                border: item.active 
                  ? `1px solid ${alpha(theme.palette.common.white, 0.3)}` 
                  : `1px solid transparent`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.25)}, ${alpha(theme.palette.common.white, 0.15)})`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&::before': item.active ? {
                  content: '""',
                  position: 'absolute',
                  bottom: -2,
                  left: '50%',
                  width: '60%',
                  height: '3px',
                  background: `linear-gradient(45deg, ${theme.palette.common.white}, ${alpha(theme.palette.common.white, 0.7)})`,
                  borderRadius: '2px',
                  transform: 'translateX(-50%)',
                  boxShadow: `0 0 10px ${alpha(theme.palette.common.white, 0.5)}`,
                } : {},
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isHome && (
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={() => navigate('/trip/new')}
              sx={{ 
                textTransform: 'none',
                fontWeight: 700,
                display: { xs: 'none', sm: 'flex' },
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                background: `linear-gradient(45deg, 
                  ${alpha(theme.palette.common.white, 0.25)} 0%, 
                  ${alpha(theme.palette.common.white, 0.15)} 100%)`,
                backdropFilter: 'blur(15px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  background: `linear-gradient(45deg, 
                    ${alpha(theme.palette.common.white, 0.35)} 0%, 
                    ${alpha(theme.palette.common.white, 0.25)} 100%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
                  transition: 'left 0.6s',
                },
                '&:hover::before': {
                  left: '100%',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t('nav.newTrip')}
            </Button>
          )}

          {/* Language Selector */}
          <Chip
            icon={<Language />}
            label={
              <Box sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
                {language === 'he' ? '🇮🇱' : '🇺🇸'}
              </Box>
            }
            onClick={handleLanguageMenuOpen}
            clickable
            sx={{
              height: '48px', // גובה אחיד
              minWidth: '60px',
              background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.2)}, ${alpha(theme.palette.common.white, 0.1)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              borderRadius: '14px',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.3)}, ${alpha(theme.palette.common.white, 0.2)})`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />

          <Menu
            anchorEl={languageMenuAnchor}
            open={Boolean(languageMenuAnchor)}
            onClose={handleLanguageMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: '16px',
                mt: 1,
                backdropFilter: 'blur(20px)',
                background: `linear-gradient(145deg, 
                  ${alpha(theme.palette.background.paper, 0.95)}, 
                  ${alpha(theme.palette.background.paper, 0.9)})`,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(145deg, 
                    ${alpha(theme.palette.primary.main, 0.05)}, 
                    ${alpha(theme.palette.secondary.main, 0.05)})`,
                  zIndex: -1,
                },
              }
            }}
          >
            <MenuItem 
              onClick={() => handleLanguageChange('en')}
              selected={language === 'en'}
              sx={{ 
                borderRadius: '12px',
                m: 1,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `linear-gradient(45deg, 
                    ${alpha(theme.palette.primary.main, 0.1)}, 
                    ${alpha(theme.palette.primary.main, 0.05)})`,
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  background: `linear-gradient(45deg, 
                    ${alpha(theme.palette.primary.main, 0.15)}, 
                    ${alpha(theme.palette.primary.main, 0.1)})`,
                }
              }}
            >
              🇺🇸 English
            </MenuItem>
            <MenuItem 
              onClick={() => handleLanguageChange('he')}
              selected={language === 'he'}
              sx={{ 
                borderRadius: '12px',
                m: 1,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `linear-gradient(45deg, 
                    ${alpha(theme.palette.primary.main, 0.1)}, 
                    ${alpha(theme.palette.primary.main, 0.05)})`,
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  background: `linear-gradient(45deg, 
                    ${alpha(theme.palette.primary.main, 0.15)}, 
                    ${alpha(theme.palette.primary.main, 0.1)})`,
                }
              }}
            >
              🇮🇱 עברית
            </MenuItem>
          </Menu>

          {/* Dark Mode Toggle */}
          <IconButton
            color="inherit"
            onClick={toggleDarkMode}
            title={darkMode ? t('nav.lightMode') : t('nav.darkMode')}
            sx={{
              width: '48px', // גובה ורוחב אחידים
              height: '48px',
              background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.2)}, ${alpha(theme.palette.common.white, 0.1)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              borderRadius: '14px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.3)}, ${alpha(theme.palette.common.white, 0.2)})`,
                transform: 'translateY(-2px) rotate(180deg)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
          >
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Authentication Button */}
          <AuthButton />

          {/* Mobile Menu Button */}
          {isHome && (
            <IconButton
              color="inherit"
              onClick={() => navigate('/trip/new')}
              sx={{ 
                width: '48px', // גובה ורוחב אחידים
                height: '48px',
                display: { xs: 'flex', sm: 'none' },
                background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.2)}, ${alpha(theme.palette.common.white, 0.1)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                borderRadius: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.3)}, ${alpha(theme.palette.common.white, 0.2)})`,
                  transform: 'translateY(-2px) scale(1.1)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                }
              }}
            >
              <Add />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;