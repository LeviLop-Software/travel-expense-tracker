import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  useTheme,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { TripSummary, CURRENCY_SYMBOLS, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';

interface BudgetStatusProps {
  tripSummary: TripSummary;
}

const BudgetStatus: React.FC<BudgetStatusProps> = ({ tripSummary }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { trip, totalExpenses, budgetStatus, remainingBudget, expensesByCategory } = tripSummary;
  const currencySymbol = CURRENCY_SYMBOLS[trip.currency];

  const tripDuration = differenceInDays(trip.endDate, trip.startDate) + 1;
  const dailyAverage = totalExpenses / tripDuration;
  const dailyBudget = trip.isOpenBudget ? 0 : trip.initialBudget / tripDuration;

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

  const getBudgetIcon = (status: 'good' | 'warning' | 'exceeded') => {
    if (trip.isOpenBudget) {
      return <TrendingUp color="primary" />;
    }
    
    switch (status) {
      case 'good':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'exceeded':
        return <TrendingUp color="error" />;
      default:
        return null;
    }
  };

  const budgetProgress = trip.isOpenBudget ? 100 : Math.min((totalExpenses / trip.initialBudget) * 100, 100);

  return (
    <Box>
      {/* Overall Budget Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getBudgetIcon(budgetStatus)}
            <Typography variant="h5" sx={{ ml: 1 }}>
              {trip.isOpenBudget ? t('trip.openBudget') : t('trip.budgetStatus')}
            </Typography>
          </Box>

          {!trip.isOpenBudget && (
            <LinearProgress
              variant="determinate"
              value={budgetProgress}
              sx={{
                height: 12,
                borderRadius: 6,
                mb: 2,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getBudgetColor(budgetStatus),
                  borderRadius: 6,
                },
              }}
            />
          )}

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: trip.isOpenBudget ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }, 
            gap: 2,
            textAlign: 'center'
          }}>
            {!trip.isOpenBudget && (
              <Box>
                <Typography variant="h6" color="primary">
                  {currencySymbol}{trip.initialBudget.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('trip.totalBudget')}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="h6" color="text.primary">
                {currencySymbol}{totalExpenses.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {trip.isOpenBudget ? t('trip.totalSpent') : `${t('trip.spent')} (${budgetProgress.toFixed(1)}%)`}
              </Typography>
            </Box>

            {!trip.isOpenBudget && (
              <Box>
                <Typography 
                  variant="h6" 
                  color={remainingBudget >= 0 ? 'success.main' : 'error.main'}
                >
                  {currencySymbol}{Math.abs(remainingBudget).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {remainingBudget >= 0 ? t('trip.remaining') : t('trip.overBudget')}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="h6" color="text.primary">
                {currencySymbol}{dailyAverage.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('trip.dailyAverage')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Budget Alerts - Only for fixed budgets */}
      {!trip.isOpenBudget && budgetStatus === 'exceeded' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>{t('trip.overBudget')}!</strong>
          </Typography>
          <Typography variant="body2">
            {t('budget.exceededMessage', { 
              amount: `${currencySymbol}${Math.abs(remainingBudget).toFixed(2)}`,
              defaultValue: `You've spent ${currencySymbol}${Math.abs(remainingBudget).toFixed(2)} more than your planned budget.`
            })}
          </Typography>
        </Alert>
      )}

      {!trip.isOpenBudget && budgetStatus === 'warning' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>{t('budget.approachingLimit')}</strong>
          </Typography>
          <Typography variant="body2">
            {t('budget.warningMessage', {
              percentage: budgetProgress.toFixed(1),
              remaining: `${currencySymbol}${remainingBudget.toFixed(2)}`,
              defaultValue: `You've used ${budgetProgress.toFixed(1)}% of your budget. You have ${currencySymbol}${remainingBudget.toFixed(2)} remaining.`
            })}
          </Typography>
        </Alert>
      )}

      {!trip.isOpenBudget && dailyAverage > dailyBudget && budgetStatus !== 'exceeded' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>{t('budget.highDailySpending')}</strong>
          </Typography>
          <Typography variant="body2">
            {t('budget.dailySpendingMessage', {
              dailyAverage: `${currencySymbol}${dailyAverage.toFixed(2)}`,
              dailyBudget: `${currencySymbol}${dailyBudget.toFixed(2)}`,
              defaultValue: `Your daily average is above your planned daily budget. Consider monitoring future expenses.`
            })}
          </Typography>
        </Alert>
      )}

      {/* Daily Spending Analysis - Only for fixed budgets */}
      {!trip.isOpenBudget && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 {t('trip.dailyAverage')}
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
              gap: 2,
              textAlign: 'center',
              mb: 2
            }}>
              <Box>
                <Typography variant="h6" color="primary">
                  {tripDuration} {t('common.days')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('trip.tripDuration')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" color="text.primary">
                  {currencySymbol}{dailyBudget.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('budget.plannedDailyBudget')}
                </Typography>
              </Box>

              <Box>
                <Typography 
                  variant="h6" 
                  color={dailyAverage > dailyBudget ? 'error.main' : 'success.main'}
                >
                  {currencySymbol}{dailyAverage.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('budget.actualDailyAverage')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dailyAverage > dailyBudget ? (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {currencySymbol}{(dailyAverage - dailyBudget).toFixed(2)} {t('budget.aboveDailyTarget')}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {currencySymbol}{(dailyBudget - dailyAverage).toFixed(2)} {t('budget.underDailyTarget')}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💰 {t('analytics.spendingByCategory')}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(expensesByCategory)
              .filter(([_, amount]) => amount > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / totalExpenses) * 100;
                const categoryKey = category as keyof typeof CATEGORY_LABELS;
                
                return (
                  <Box key={category}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1">
                        {CATEGORY_LABELS[categoryKey]}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {currencySymbol}{amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: CATEGORY_COLORS[categoryKey],
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                );
              })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BudgetStatus;