import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Fab,
  useMediaQuery,
  useTheme,
  alpha,
  Grow,
  Slide,
  Zoom,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { 
  Add, 
  FlightTakeoff, 
  LuggageOutlined,
  AccountBalanceWallet,
  Timeline,
  DeleteForever,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTripSummaries, useAppStore } from '../store/firebaseStore';
import TripList from '../components/TripList';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tripSummaries = useTripSummaries();
  const [visible, setVisible] = useState(false);
  const [featureVisible, setFeatureVisible] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Store actions and state
  const trips = useAppStore(state => state.trips);
  const expenses = useAppStore(state => state.expenses);
  const deleteTrip = useAppStore(state => state.deleteTrip);
  const deleteExpense = useAppStore(state => state.deleteExpense);
  const deleteAllUserData = useAppStore(state => state.deleteAllUserData);
  const user = useAppStore(state => state.user);
  const isLoading = useAppStore(state => state.isLoading);
  const isDataSynced = useAppStore(state => state.isDataSynced);

  // Debug logging
  console.log('Home component render - tripSummaries:', tripSummaries);
  console.log('tripSummaries length:', tripSummaries?.length);
  console.log('tripSummaries is array:', Array.isArray(tripSummaries));

  // מניעת לולאות אינסופיות - מחיקה ספציפית של נתוני persistence
  useEffect(() => {
    console.log('🧹 SAFETY CLEANUP - Clearing app data persistence to prevent infinite loops');
    
    // רק מחיקה של מפתחות persistence ספציפיים, לא את כל localStorage
    const dangerousKeys = [
      'travel-expense-store',
      'travel-store', 
      'expense-tracker-store',
      'app-store',
      'persist:travel-expense-store'
    ];
    
    dangerousKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed dangerous persistence key: ${key}`);
      }
    });
    
    console.log('✅ Persistence cleanup complete. Safe localStorage keys remain:', 
      Object.keys(localStorage).filter(key => !dangerousKeys.includes(key))
    );
  }, []);

  useEffect(() => {
    console.log('Home useEffect - tripSummaries changed:', tripSummaries);
  }, [tripSummaries]);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setFeatureVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check localStorage directly
    const stored = localStorage.getItem('travel-expense-store');
    console.log('localStorage content:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('parsed localStorage:', parsed);
      } catch (e) {
        console.error('Error parsing localStorage:', e);
      }
    }
  }, []);

  const handleNewTrip = () => {
    navigate('/trip/new');
  };

  const handleDeleteAllTrips = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAllTrips = async () => {
    setIsDeleting(true);
    try {
      console.log('� Starting FAST deletion process...');
      
      // If user is logged in, use batch delete from Firestore
      if (user) {
        console.log('👤 User is logged in, using fast batch delete...');
        console.log(`📊 Will delete ${trips.length} trips and ${expenses.length} expenses`);
        
        // Use the new fast batch delete function
        await deleteAllUserData();
        console.log('🎉 All cloud data deleted successfully with batch operation!');
        
        // Verify deletion by manually checking Firestore
        console.log('🔍 Verifying deletion by checking Firestore directly...');
        setTimeout(async () => {
          try {
            const { tripsService, expensesService } = await import('../services/firestore');
            const [remainingTrips, remainingExpenses] = await Promise.all([
              tripsService.getTrips(user.uid),
              expensesService.getExpenses(user.uid)
            ]);
            console.log(`🔍 Verification results: ${remainingTrips.length} trips, ${remainingExpenses.length} expenses remaining`);
          } catch (error) {
            console.error('❌ Error verifying deletion:', error);
          }
        }, 1000);
      } else {
        console.log('👤 User not logged in, only clearing local data');
      }
      
      // Clear only trip/expense data from localStorage, not user data
      const keysToRemove = [
        'travel-expense-store',
        'travel-store', 
        'expense-tracker-store',
        'app-store',
        'persist:travel-expense-store'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 Removed localStorage key: ${key}`);
      });
      
      // Clear only the trips and expenses from store state, keep user and preferences
      const currentState = useAppStore.getState();
      useAppStore.setState({ 
        trips: [], 
        expenses: [],
        isDataSynced: false,
        // Keep user logged in and preserve preferences
        user: currentState.user,
        darkMode: currentState.darkMode,
        language: currentState.language
      });
      
      console.log('✨ All trip and expense data deleted successfully!');
      console.log('👤 User remains logged in with preserved preferences');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('💥 Error during deletion process:', error);
      // Still close dialog and clear local data even if cloud deletion failed
      const currentState = useAppStore.getState();
      useAppStore.setState({ 
        trips: [], 
        expenses: [],
        isDataSynced: false,
        // Keep user logged in and preserve preferences
        user: currentState.user,
        darkMode: currentState.darkMode,
        language: currentState.language
      });
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const features = [
    {
      icon: LuggageOutlined,
      title: t('home.features.tripManagement'),
      description: t('home.features.tripManagementDesc'),
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    {
      icon: AccountBalanceWallet,
      title: t('home.features.expenseTracking'),
      description: t('home.features.expenseTrackingDesc'),
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
    },
    {
      icon: Timeline,
      title: t('home.features.analytics'),
      description: t('home.features.analyticsDesc'),
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
  ];

  // Show loading state when data is being loaded
  // Only show loader when:
  // 1. Store is loading (isLoading = true)
  // 2. User is logged in but data hasn't synced yet
  // 3. Don't show if user is not logged in and we have local trips
  if (isLoading || (user && !isDataSynced && trips.length === 0)) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              left: -50,
              right: -50,
              bottom: -50,
              background: `
                radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)
              `,
              animation: 'pulse 3s ease-in-out infinite',
              zIndex: -1,
            }
          }}
        >
          {/* Loading Spinner */}
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={60}
              thickness={4}
              sx={{ 
                color: theme.palette.primary.main,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <FlightTakeoff 
                sx={{ 
                  fontSize: '1.5rem', 
                  color: theme.palette.primary.main,
                  animation: 'bounce 2s infinite'
                }} 
              />
            </Box>
          </Box>

          {/* Loading Text */}
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600
              }}
            >
              {user 
                ? (isDataSynced ? 'מעדכן נתונים...' : 'טוען נתונים מהענן...') 
                : 'מכין את האפליקציה...'
              }
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ opacity: 0.7 }}
            >
              {user 
                ? (isDataSynced ? 'מסיים סנכרון עם Firebase' : 'מסנכרן עם Firebase')
                : 'כמעט מוכן...'
              }
            </Typography>
          </Box>

          {/* Skeleton Cards */}
          <Box sx={{ width: '100%', maxWidth: 'md', mt: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((index) => (
                <Card 
                  key={index}
                  sx={{ 
                    p: 2,
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
                      <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="40%" />
                    </Box>
                    <Skeleton variant="rectangular" width={80} height={30} sx={{ borderRadius: 1 }} />
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Add keyframes for animations */}
        <style>
          {`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-10px);
              }
              60% {
                transform: translateY(-5px);
              }
            }
            @keyframes pulse {
              0%, 100% {
                opacity: 0.3;
              }
              50% {
                opacity: 0.6;
              }
            }
          `}
        </style>
      </Container>
    );
  }

  if (tripSummaries.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              left: -50,
              right: -50,
              bottom: -50,
              background: `
                radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, ${alpha(theme.palette.success.main, 0.08)} 0%, transparent 50%)
              `,
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
                '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
              },
              zIndex: -1,
            },
          }}
        >
          <Grow in={visible} timeout={800}>
            <Box>
              <Box
                sx={{
                  mb: 4,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                    borderRadius: '50%',
                    animation: 'pulse 3s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 0.4, transform: 'translate(-50%, -50%) scale(1)' },
                      '50%': { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1.2)' },
                    },
                    zIndex: -1,
                  }
                }}
              >
                <FlightTakeoff 
                  sx={{ 
                    fontSize: '4rem',
                    color: theme.palette.primary.main,
                    mb: 2,
                    filter: `drop-shadow(0 4px 20px ${alpha(theme.palette.primary.main, 0.3)})`,
                    animation: 'rotate 4s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }} 
                />
              </Box>
              
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                {t('home.title')}
              </Typography>
              
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  mb: 6,
                  fontWeight: 400,
                  opacity: 0.8,
                }}
              >
                {t('home.subtitle')}
              </Typography>
            </Box>
          </Grow>

          <Slide in={visible} direction="up" timeout={1000}>
            <Card 
              sx={{ 
                maxWidth: 700, 
                p: 4, 
                mb: 6,
                background: `linear-gradient(145deg, 
                  ${alpha(theme.palette.background.paper, 0.8)}, 
                  ${alpha(theme.palette.background.paper, 0.9)})`,
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 30px 80px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 3,
                  }}
                >
                  {t('home.getStarted')}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 4,
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  {t('home.createFirstTripDesc')}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNewTrip}
                  startIcon={<Add />}
                  sx={{ 
                    borderRadius: '16px',
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
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
                  {t('home.createFirstTrip')}
                </Button>
              </CardContent>
            </Card>
          </Slide>

          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
              maxWidth: 1000,
              width: '100%',
            }}
          >
            {features.map((feature, index) => (
              <Zoom 
                key={index}
                in={featureVisible} 
                timeout={600 + index * 200}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(145deg, 
                      ${alpha(theme.palette.background.paper, 0.8)}, 
                      ${alpha(theme.palette.background.paper, 0.9)})`,
                    backdropFilter: 'blur(15px)',
                    borderRadius: '20px',
                    border: `1px solid ${alpha(feature.color, 0.2)}`,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: `0 25px 60px ${alpha(feature.color, 0.25)}`,
                      '& .feature-icon': {
                        transform: 'scale(1.2) rotate(360deg)',
                        background: feature.gradient,
                      },
                      '& .feature-glow': {
                        opacity: 1,
                        transform: 'scale(1.5)',
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: feature.gradient,
                    },
                  }}
                >
                  <Box
                    className="feature-glow"
                    sx={{
                      position: 'absolute',
                      top: '20%',
                      left: '50%',
                      transform: 'translateX(-50%) scale(0.8)',
                      width: '100px',
                      height: '100px',
                      background: `radial-gradient(circle, ${alpha(feature.color, 0.15)} 0%, transparent 70%)`,
                      borderRadius: '50%',
                      opacity: 0,
                      transition: 'all 0.6s ease',
                      zIndex: 0,
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: alpha(feature.color, 0.1),
                        mb: 3,
                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <feature.icon 
                        sx={{ 
                          fontSize: '2.5rem',
                          color: feature.color,
                        }} 
                      />
                    </Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            ))}
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Fade in={visible} timeout={800}>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('home.yourTrips')}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ fontWeight: 400 }}
              >
                {t('home.yourTripsDesc')}
              </Typography>
            </Box>
            
            {trips.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForever />}
                onClick={handleDeleteAllTrips}
                sx={{
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    borderColor: theme.palette.error.dark,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                מחק הכל
              </Button>
            )}
          </Box>
        </Box>
      </Fade>

      <Slide in={visible} direction="up" timeout={1000}>
        <Box>
          <TripList trips={tripSummaries} />
        </Box>
      </Slide>

      {isMobile && (
        <Zoom in={visible} timeout={1200}>
          <Fab
            color="primary"
            aria-label="add trip"
            onClick={handleNewTrip}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 64,
              height: 64,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                transform: 'scale(1.1) translateY(-4px)',
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Add sx={{ fontSize: '2rem' }} />
          </Fab>
        </Zoom>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle 
          id="delete-dialog-title"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: theme.palette.error.main 
          }}
        >
          <Warning />
          אזהרה חמורה!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            <strong>פעולה זו תמחק את כל הטיולים וההוצאות שלך!</strong>
            <br /><br />
            זה כולל:
            <br />• {trips.length} טיולים
            <br />• {expenses.length} הוצאות
            <br />• כל נתוני הטיולים מה-localStorage
            {user && <><br />• כל נתוני הטיולים מהענן (Firebase) - במחיקה מהירה</>}
            <br /><br />
            <strong style={{ color: theme.palette.success.main }}>
              ✓ המשתמש יישאר מחובר עם ההגדרות שלו
            </strong>
            <br />
            {user && (
              <strong style={{ color: theme.palette.info.main }}>
                ⚡ מחיקה מהירה ב-batch operation
              </strong>
            )}
            <br /><br />
            <strong style={{ color: theme.palette.error.main }}>
              פעולה זו אינה הפיכה!
            </strong>
            <br />
            האם אתה בטוח שברצונך להמשיך?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            בטל
          </Button>
          <Button 
            onClick={confirmDeleteAllTrips}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={<DeleteForever />}
          >
            {isDeleting ? (user ? 'מוחק במהירות...' : 'מוחק...') : 'כן, מחק הכל'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;