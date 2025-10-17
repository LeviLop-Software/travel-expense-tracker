import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Flight,
  LocationOn,
  CalendarToday,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import { TripSummary, CURRENCY_SYMBOLS } from '../types';
import { useAppStore } from '../store/firebaseStore';

interface TripListProps {
  trips: TripSummary[];
}

const TripList: React.FC<TripListProps> = ({ trips }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const language = useAppStore(state => state.language);
  const deleteTrip = useAppStore(state => state.deleteTrip);

  console.log('TripList component - received trips:', trips);
  console.log('TripList component - trips length:', trips?.length);

  const dateLocale = language === 'he' ? he : enUS;

  const getTripStatus = (startDate: Date, endDate: Date): 'upcoming' | 'active' | 'ended' => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tripStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const tripEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (today < tripStart) {
      return 'upcoming';
    } else if (today > tripEnd) {
      return 'ended';
    } else {
      return 'active';
    }
  };

  const getTripStatusColor = (status: 'upcoming' | 'active' | 'ended') => {
    switch (status) {
      case 'upcoming':
        return {
          background: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
          border: theme.palette.primary.main,
          chip: 'primary' as const
        };
      case 'active':
        return {
          background: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
          border: theme.palette.success.main,
          chip: 'success' as const
        };
      case 'ended':
        return {
          background: theme.palette.mode === 'dark' ? 'rgba(158, 158, 158, 0.1)' : 'rgba(158, 158, 158, 0.05)',
          border: theme.palette.grey[400],
          chip: 'default' as const
        };
    }
  };

  const getTripStatusLabel = (status: 'upcoming' | 'active' | 'ended') => {
    switch (status) {
      case 'upcoming':
        return t('trip.status.upcoming');
      case 'active':
        return t('trip.status.active');
      case 'ended':
        return t('trip.status.ended');
    }
  };

  const handleDeleteTrip = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (window.confirm(t('trip.confirmDelete'))) {
      deleteTrip(tripId);
    }
  };

  const getBudgetColor = (status: 'good' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'good':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'exceeded':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getBudgetProgress = (totalExpenses: number, budget: number) => {
    return Math.min((totalExpenses / budget) * 100, 100);
  };

  if (trips.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          {t('home.noTrips')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {trips.map((tripSummary) => {
        const { trip, totalExpenses, budgetStatus, remainingBudget } = tripSummary;
        const progress = trip.isOpenBudget ? 100 : getBudgetProgress(totalExpenses, trip.initialBudget);
        const currencySymbol = CURRENCY_SYMBOLS[trip.currency];
        
        // Calculate cash expenses and remaining cash
        const cashExpenses = tripSummary.expenses.filter(expense => expense.paymentMethod === 'cash');
        const cardExpenses = tripSummary.expenses.filter(expense => expense.paymentMethod === 'credit');
        const totalCashSpent = cashExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalCardSpent = cardExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Use actual remaining cash if set, otherwise calculate from expenses
        const remainingCash = trip.remainingCash !== undefined 
          ? trip.remainingCash 
          : trip.initialCash - totalCashSpent;

        // Calculate cash spent (original cash minus remaining cash)
        const cashSpentFromBudget = trip.initialCash - remainingCash;

        // For open budget trips, show total of card expenses + cash spent from original budget
        // For regular budget trips, show all expenses
        const displayedSpent = trip.isOpenBudget 
          ? totalCardSpent + cashSpentFromBudget 
          : totalExpenses;

        // Get trip status and colors
        const tripStatus = getTripStatus(trip.startDate, trip.endDate);
        const statusColors = getTripStatusColor(tripStatus);

        return (
          <Card
            key={trip.id}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              background: statusColors.background,
              border: `2px solid ${statusColors.border}`,
              opacity: tripStatus === 'ended' ? 0.8 : 1,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
            }}
            onClick={() => navigate(`/trip/${trip.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Flight color="primary" sx={{ mr: 1, mt: 0.5 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3">
                      {trip.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={getTripStatusLabel(tripStatus)}
                      color={statusColors.chip}
                      variant="filled"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {trip.destinations 
                        ? trip.destinations.map(dest => typeof dest === 'string' ? dest : `${dest.country}${dest.flag || ''}`).join(', ')
                        : trip.destination}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {format(trip.startDate, 'MMM d', { locale: dateLocale })} - {format(trip.endDate, 'MMM d, yyyy', { locale: dateLocale })}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {trip.isOpenBudget ? t('trip.openBudget') : t('trip.budget')}
                  </Typography>
                  {!trip.isOpenBudget && (
                    <Chip
                      size="small"
                      label={t(`trip.budgetStatus.${budgetStatus}`)}
                      color={budgetStatus === 'good' ? 'success' : budgetStatus === 'warning' ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {!trip.isOpenBudget && (
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getBudgetColor(budgetStatus),
                        borderRadius: 4,
                      },
                    }}
                  />
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {currencySymbol}{displayedSpent.toFixed(2)} {t('trip.spent')}
                  </Typography>
                  {!trip.isOpenBudget && (
                    <Typography variant="body2" color="text.secondary">
                      {currencySymbol}{trip.initialBudget.toFixed(2)} {t('trip.budget')}
                    </Typography>
                  )}
                </Box>
              </Box>

              {!trip.isOpenBudget && (
                remainingBudget >= 0 ? (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                    💰 {currencySymbol}{remainingBudget.toFixed(2)} {t('trip.remaining')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                    ⚠️ {currencySymbol}{Math.abs(remainingBudget).toFixed(2)} {t('trip.overBudget')}
                  </Typography>
                )
              )}
              
              <Typography variant="body2" color={remainingCash >= 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 500, mt: 0.5 }}>
                💵 {currencySymbol}{Math.abs(remainingCash).toFixed(2)} {remainingCash >= 0 ? t('trip.remainingCash') : t('trip.overCash', { defaultValue: 'Over Cash' })}
              </Typography>
            </CardContent>

            <CardActions>
              <Button 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/trip/${trip.id}`);
                }}
              >
                {t('trip.viewDetails')}
              </Button>
              <Button 
                size="small" 
                startIcon={<Edit />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/trip/${trip.id}/edit`);
                }}
              >
                {t('common.edit')}
              </Button>
              <Button 
                size="small" 
                color="error"
                startIcon={<Delete />}
                onClick={(e) => handleDeleteTrip(e, trip.id)}
              >
                {t('common.delete')}
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </Box>
  );
};

export default TripList;