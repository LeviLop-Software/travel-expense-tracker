import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip,
  Stack,
  Grid
} from '@mui/material';
import {
  TrendingUp,
  Flight,
  Assessment,
  MonetizationOn,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/firebaseStore';
import { CURRENCY_SYMBOLS } from '../types';
import { trackAnalyticsViewed } from '../utils/analytics';

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const trips = useAppStore(state => state.trips);
  const getExpensesByTrip = useAppStore(state => state.getExpensesByTrip);

  // Track analytics page view
  useEffect(() => {
    trackAnalyticsViewed('overview');
  }, []);

  // Calculate overall statistics
  const totalTrips = trips.length;
  const totalExpenses = trips.reduce((sum: number, trip) => {
    const expenses = getExpensesByTrip(trip.id);
    return sum + expenses.reduce((expSum: number, expense: any) => expSum + expense.amount, 0);
  }, 0);
  const totalBudget = trips.reduce((sum: number, trip) => sum + trip.initialBudget, 0);
  const averageExpensePerTrip = totalTrips > 0 ? totalExpenses / totalTrips : 0;
  const averageTripDuration = totalTrips > 0 ? trips.reduce((sum, trip) => {
    const duration = Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24));
    return sum + duration;
  }, 0) / totalTrips : 0;

  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Calculate additional statistics
  const completedTrips = trips.filter(trip => trip.endDate < new Date()).length;
  const upcomingTrips = trips.filter(trip => trip.startDate > new Date()).length;
  const activeTrips = trips.filter(trip => trip.startDate <= new Date() && trip.endDate >= new Date()).length;

  // Most expensive trip
  const mostExpensiveTrip = trips.length > 0 ? trips.reduce((max, trip) => {
    const expenses = getExpensesByTrip(trip.id);
    const tripTotal = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    const maxTotal = getExpensesByTrip(max.id).reduce((sum: number, expense: any) => sum + expense.amount, 0);
    return tripTotal > maxTotal ? trip : max;
  }, trips[0]) : null;

  // Most popular destination
  const destinationCounts: Record<string, number> = {};
  trips.forEach(trip => {
    if (trip.destinations) {
      trip.destinations.forEach(dest => {
        destinationCounts[dest.name] = (destinationCounts[dest.name] || 0) + 1;
      });
    } else {
      destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
    }
  });
  const mostPopularDestination = Object.entries(destinationCounts).sort(([,a], [,b]) => b - a)[0];

  // Average daily spending
  const averageDailySpending = totalTrips > 0 && averageTripDuration > 0 ? totalExpenses / (totalTrips * averageTripDuration) : 0;

  const statsCards = [
    {
      title: t('analytics.totalTrips'),
      value: totalTrips,
      icon: <Flight sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      suffix: ''
    },
    {
      title: t('analytics.totalExpenses'),
      value: totalExpenses,
      icon: <MonetizationOn sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      suffix: '₪',
      prefix: ''
    },
    {
      title: t('analytics.averageExpensePerTrip'),
      value: averageExpensePerTrip,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      suffix: '₪',
      prefix: ''
    },
    {
      title: 'Budget Utilization',
      value: budgetUtilization,
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: budgetUtilization > 90 ? theme.palette.error.main : 
             budgetUtilization > 70 ? theme.palette.warning.main : 
             theme.palette.success.main,
      suffix: '%'
    },
    {
      title: 'Completed Trips',
      value: completedTrips,
      icon: <Flight sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      suffix: ''
    },
    {
      title: 'Average Trip Duration',
      value: averageTripDuration,
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      suffix: ' days'
    },
    {
      title: 'Total Budget',
      value: totalBudget,
      icon: <MonetizationOn sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      suffix: '₪'
    },
    {
      title: 'Daily Average',
      value: averageDailySpending,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      suffix: '₪'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            textAlign: 'center'
          }}
        >
          {t('analytics.title')}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          תובנות מפורטות על הוצאות הנסיעות שלך
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)}, ${alpha(stat.color, 0.05)})`,
                borderLeft: `4px solid ${stat.color}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 40px ${alpha(stat.color, 0.2)}`,
                  '& .stat-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    className="stat-icon"
                    sx={{
                      color: stat.color,
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: stat.color,
                        mb: 0.5
                      }}
                    >
                      {stat.prefix}{typeof stat.value === 'number' ? stat.value.toFixed(stat.suffix === '%' ? 1 : 0) : stat.value}{stat.suffix}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Budget Status Indicator */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Chip
          label={
            budgetUtilization > 100 ? '⚠️ חריגה מהתקציב' :
            budgetUtilization > 90 ? '⚡ מתקרב לגבול התקציב' :
            '✅ תקציב תקין'
          }
          color={
            budgetUtilization > 100 ? 'error' :
            budgetUtilization > 90 ? 'warning' :
            'success'
          }
          variant="filled"
          sx={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            height: 'auto'
          }}
        />
      </Box>

      {/* Travel Insights */}
      {totalTrips > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} md={6}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🏆 Most Expensive Trip
                </Typography>
                {mostExpensiveTrip && (
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {mostExpensiveTrip.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      📍 {mostExpensiveTrip.destinations ? 
                          mostExpensiveTrip.destinations.map(d => `${d.flag || ''} ${d.name}`).join(', ') : 
                          mostExpensiveTrip.destination}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {getExpensesByTrip(mostExpensiveTrip.id).reduce((sum: number, expense: any) => sum + expense.amount, 0).toFixed(0)}{CURRENCY_SYMBOLS[mostExpensiveTrip.currency]}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={6}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🌍 Most Popular Destination
                </Typography>
                {mostPopularDestination && (
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {mostPopularDestination[0]}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Visited {mostPopularDestination[1]} {mostPopularDestination[1] === 1 ? 'time' : 'times'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                borderLeft: `4px solid ${theme.palette.success.main}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom color="success">
                  ✅ Completed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="success">
                  {completedTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                borderLeft: `4px solid ${theme.palette.warning.main}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom color="warning">
                  🔥 Active
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="warning">
                  {activeTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                borderLeft: `4px solid ${theme.palette.info.main}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom color="info">
                  📅 Upcoming
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="info">
                  {upcomingTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detailed Analytics */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            textAlign: 'center',
            color: theme.palette.primary.main
          }}
        >
          📊 ניתוח מפורט
        </Typography>
        
        {totalTrips > 0 ? (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              מציג ניתוח כללי של כל הנסיעות
            </Typography>
            {/* You can add general analytics components here */}
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center' }}>
              ניתוח מפורט יתווסף בקרוב...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Assessment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {t('analytics.noDataAvailable')}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              צור נסיעות והוסף הוצאות כדי לראות ניתוחים מפורטים
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;