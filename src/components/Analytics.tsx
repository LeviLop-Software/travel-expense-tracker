import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  LinearProgress,
  useTheme,
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/firebaseStore';
import { CATEGORY_EMOJIS, CURRENCY_SYMBOLS, ExpenseCategory, Expense } from '../types';

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  flight: '#FF6384',
  hotel: '#36A2EB',
  food: '#FFCE56',
  transport: '#4BC0C0',
  insurance: '#9966FF',
  activity: '#FF9F40',
  misc: '#C9CBCF',
};

interface AnalyticsProps {
  tripId: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ tripId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { trips, expenses } = useAppStore();
  
  // Find current trip and filter expenses
  const currentTrip = trips.find(trip => trip.id === tripId);
  const tripExpenses = expenses.filter(expense => expense.tripId === tripId);
  
  const analytics = useMemo(() => {
    if (!currentTrip) {
      return {
        categoryData: [],
        paymentMethodData: [],
        dailyData: [],
        totalExpenses: 0,
        stats: {
          avgPerDay: 0,
          avgPerExpense: 0,
          highestExpense: 0,
          budgetUsagePercent: 0
        }
      };
    }

    const totalExpenses = tripExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate expenses by category
    const expensesByCategory: Record<ExpenseCategory, number> = {
      flight: 0,
      hotel: 0,
      food: 0,
      transport: 0,
      insurance: 0,
      activity: 0,
      misc: 0
    };
    
    tripExpenses.forEach((expense: Expense) => {
      expensesByCategory[expense.category] += expense.amount;
    });
    
    // Category data for pie chart
    const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: t(`expense.categories.${category}`, { defaultValue: category }),
      value: amount,
      emoji: CATEGORY_EMOJIS[category as ExpenseCategory],
      color: CATEGORY_COLORS[category as ExpenseCategory]
    })).filter(item => item.value > 0);

    // Payment method breakdown
    const cashTotal = tripExpenses.filter((e: Expense) => e.paymentMethod === 'cash').reduce((sum: number, e: Expense) => sum + e.amount, 0);
    const creditTotal = tripExpenses.filter((e: Expense) => e.paymentMethod === 'credit').reduce((sum: number, e: Expense) => sum + e.amount, 0);
    
    const paymentMethodData = [
      { name: t('expense.paymentMethods.cash'), value: cashTotal, emoji: '💵', color: theme.palette.success.main },
      { name: t('expense.paymentMethods.credit'), value: creditTotal, emoji: '💳', color: theme.palette.info.main }
    ];

    // Daily spending data
    const dailyExpenses: Record<string, number> = {};
    tripExpenses.forEach((expense: Expense) => {
      const date = expense.date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      dailyExpenses[date] = (dailyExpenses[date] || 0) + expense.amount;
    });

    const dailyData = Object.entries(dailyExpenses)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Statistics
    const avgPerDay = tripExpenses.length > 0 ? (totalExpenses / Math.max(1, dailyData.length)) : 0;
    const avgPerExpense = tripExpenses.length > 0 ? (totalExpenses / tripExpenses.length) : 0;
    const highestExpense = tripExpenses.length > 0 ? Math.max(...tripExpenses.map((e: Expense) => e.amount)) : 0;
    const budgetUsagePercent = (totalExpenses / currentTrip.initialBudget) * 100;

    return {
      categoryData,
      paymentMethodData,
      dailyData,
      totalExpenses,
      stats: {
        avgPerDay,
        avgPerExpense,
        highestExpense,
        budgetUsagePercent
      }
    };
  }, [tripExpenses, currentTrip, t, theme.palette]);

  const currencySymbol = currentTrip ? CURRENCY_SYMBOLS[currentTrip.currency] : '';
  
  if (!currentTrip) {
    return (
      <Box>
        <Typography>Please select a trip to view analytics</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        {t('analytics.title', { defaultValue: 'Analytics & Statistics' })}
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {currencySymbol}{analytics.stats.avgPerDay.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('analytics.avgPerDay', { defaultValue: 'Average per Day' })}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {currencySymbol}{analytics.stats.avgPerExpense.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('analytics.avgPerExpense', { defaultValue: 'Average per Expense' })}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {currencySymbol}{analytics.stats.highestExpense.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('analytics.highestExpense', { defaultValue: 'Highest Expense' })}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {analytics.stats.budgetUsagePercent.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('analytics.budgetUsed', { defaultValue: 'Budget Used' })}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(analytics.stats.budgetUsagePercent, 100)} 
              sx={{ mt: 1 }}
              color={analytics.stats.budgetUsagePercent > 100 ? 'error' : 'primary'}
            />
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {currencySymbol}{(currentTrip.initialCash - analytics.paymentMethodData[0].value).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('analytics.remainingCash', { defaultValue: 'Remaining Cash' })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('analytics.of', { defaultValue: 'of' })} {currencySymbol}{currentTrip.initialCash.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Category Breakdown */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('analytics.categoryBreakdown', { defaultValue: 'Expenses by Category' })}
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.emoji} ${((entry.value / analytics.totalExpenses) * 100).toFixed(1)}%`}
                  outerRadius={60}
                  innerRadius={20}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, t('common.amount')]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Category Legend */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
              {analytics.categoryData.map((entry, index) => (
                <Chip
                  key={index}
                  label={`${entry.emoji} ${entry.name}: ${currencySymbol}${entry.value.toFixed(2)}`}
                  sx={{ 
                    backgroundColor: entry.color, 
                    color: 'white',
                    '& .MuiChip-label': { fontWeight: 500 }
                  }}
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('analytics.paymentMethods', { defaultValue: 'Payment Methods' })}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.emoji} ${((entry.value / analytics.totalExpenses) * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, t('common.amount')]}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
              <Chip
                label={`💵 ${t('expense.paymentMethods.cash')}: ${currencySymbol}${analytics.paymentMethodData[0].value.toFixed(2)}`}
                sx={{ backgroundColor: theme.palette.success.main, color: 'white' }}
              />
              <Chip
                label={`💳 ${t('expense.paymentMethods.credit')}: ${currencySymbol}${analytics.paymentMethodData[1].value.toFixed(2)}`}
                sx={{ backgroundColor: theme.palette.info.main, color: 'white' }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Daily Spending */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('analytics.dailySpending', { defaultValue: 'Daily Spending' })}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, t('common.amount')]}
                />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  fill={theme.palette.primary.main}
                  name={t('common.amount')}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Analytics;