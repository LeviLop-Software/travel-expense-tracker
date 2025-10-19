import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Add,
  CurrencyExchange,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import { useTrip, useTripExpenses, useAppStore } from '../store/firebaseStore';
import { CURRENCY_SYMBOLS, Expense, CATEGORY_EMOJIS, ExpenseCategory, Currency } from '../types';
import { convertCurrencyWithRate } from '../utils/currencyConverter';
import ExpenseList from '../components/ExpenseList';
import BudgetStatus from '../components/BudgetStatus';
import ExpenseDetailsModal from '../components/ExpenseDetailsModal';
import UpdateCashModal from '../components/UpdateCashModal';
import ExpenseForm from '../components/ExpenseForm';
import Analytics from '../components/Analytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      aria-labelledby={`trip-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Popular currencies for conversion (filtered by current trip currency)
const getAllCurrencies = () => [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const getAvailableCurrencies = (currentCurrency: Currency) => {
  return getAllCurrencies().filter(currency => currency.code !== currentCurrency);
};

const TripPage: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  
  // Currency conversion state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [convertedAmount, setConvertedAmount] = useState<{ displayText: string; isLoading: boolean; error?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { t } = useTranslation();
  const language = useAppStore(state => state.language);
  const deleteTrip = useAppStore(state => state.deleteTrip);
  const updateTripCash = useAppStore(state => state.updateTripCash);
  
  // Always call hooks in the same order
  const { trip, summary } = useTrip(tripId || '');
  const expenses = useTripExpenses(tripId || '');

  const dateLocale = language === 'he' ? he : enUS;

  // Handle loading state
  useEffect(() => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    // If we have trip data, stop loading
    if (trip && summary) {
      setIsLoading(false);
      return;
    }

    // Set a maximum loading time to prevent infinite loading
    const maxLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds max loading time

    return () => clearTimeout(maxLoadingTimer);
  }, [tripId, trip, summary]);

  if (!tripId) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          {t('common.tripNotFound')}
        </Alert>
      </Container>
    );
  }

  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
            {t('common.back')}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Skeleton variant="text" width={300} height={40} />
              <Skeleton variant="text" width={200} height={30} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={80} height={36} />
              <Skeleton variant="rectangular" width={80} height={36} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          <Skeleton variant="rectangular" height={120} />
          <Skeleton variant="rectangular" height={120} />
          <Skeleton variant="rectangular" height={120} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {t('common.loading')}...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!trip || !summary) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          {t('common.tripNotFound')}
        </Alert>
      </Container>
    );
  }

  const currencySymbol = CURRENCY_SYMBOLS[trip.currency];
  
  // Calculate cash expenses and remaining cash
  const cashExpenses = expenses.filter(expense => expense.paymentMethod === 'cash');
  const totalCashSpent = cashExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Use actual remaining cash if set, otherwise calculate from expenses
  const remainingCash = trip.remainingCash !== undefined 
    ? trip.remainingCash 
    : trip.initialCash - totalCashSpent;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    setSelectedExpense(null);
  };

  const handleUpdateCash = (remainingCash: number) => {
    updateTripCash(tripId!, remainingCash);
  };

  // Currency conversion handlers
  const handleCurrencyClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCurrencyClose = () => {
    setAnchorEl(null);
  };

  const handleCurrencySelect = async (targetCurrency: Currency) => {
    if (!trip) return;
    
    setConvertedAmount({ displayText: '', isLoading: true });
    setAnchorEl(null);

    try {
      // Calculate total trip cost
      const cashSpent = trip.initialCash - remainingCash;
      const nonCashExpenses = expenses
        .filter(expense => expense.paymentMethod !== 'cash')
        .reduce((sum, expense) => sum + expense.amount, 0);
      const totalTripCost = nonCashExpenses + cashSpent;

      const { displayText } = await convertCurrencyWithRate(totalTripCost, trip.currency, targetCurrency);
      
      setConvertedAmount({ displayText, isLoading: false });
    } catch (error) {
      console.error('Currency conversion failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהמרת מטבע';
      
      setConvertedAmount({ displayText: '', isLoading: false, error: errorMessage });
    }
  };

  const getTripStatus = (startDate: Date | string, endDate: Date | string): 'upcoming' | 'active' | 'ended' => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Convert to Date objects if they're strings (from localStorage)
    const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
    const endDateObj = endDate instanceof Date ? endDate : new Date(endDate);
    
    const tripStart = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate());
    const tripEnd = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate());

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
        return 'primary' as const;
      case 'active':
        return 'success' as const;
      case 'ended':
        return 'default' as const;
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

  return (
    <>
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          {t('common.backToTrips')}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h3" component="h1">
                {trip.name}
              </Typography>
              <Chip
                label={getTripStatusLabel(getTripStatus(trip.startDate, trip.endDate))}
                color={getTripStatusColor(getTripStatus(trip.startDate, trip.endDate))}
                variant="filled"
              />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              📍 {trip.destinations ? trip.destinations.join(', ') : trip.destination}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {format(trip.startDate, 'MMM d', { locale: dateLocale })} - {format(trip.endDate, 'MMM d, yyyy', { locale: dateLocale })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              startIcon={<Edit />} 
              variant="outlined"
              onClick={() => navigate(`/trip/${tripId}/edit`)}
            >
              {t('trip.editTrip')}
            </Button>
            <Button 
              startIcon={<Delete />} 
              variant="outlined" 
              color="error"
              onClick={() => {
                if (window.confirm(t('trip.confirmDelete'))) {
                  deleteTrip(tripId);
                  navigate('/');
                }
              }}
            >
              {t('trip.deleteTrip')}
            </Button>
          </Box>
        </Box>

        {/* Trip Info Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: trip.isOpenBudget ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', 
            md: trip.isOpenBudget ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' 
          }, 
          gap: 2, 
          mb: 3 
        }}>
          {!trip.isOpenBudget && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 {t('trip.totalBudget')}
                </Typography>
                <Typography variant="h4" color="primary">
                  {currencySymbol}{trip.initialBudget.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  💸 {trip.isOpenBudget ? t('trip.totalSpent') : t('trip.spent')}
                </Typography>
                <IconButton
                  onClick={handleCurrencyClick}
                  color="primary"
                  size="small"
                >
                  <CurrencyExchange />
                </IconButton>
              </Box>
              <Typography variant="h4" color="text.primary">
                {(() => {
                  const cashSpent = trip.initialCash - remainingCash;
                  const nonCashExpenses = expenses
                    .filter(expense => expense.paymentMethod !== 'cash')
                    .reduce((sum, expense) => sum + expense.amount, 0);
                  const totalTripCost = nonCashExpenses + cashSpent;
                  return currencySymbol + totalTripCost.toFixed(2);
                })()}
              </Typography>
              
              {/* Currency Conversion Display for Total Spent */}
              {convertedAmount && (
                <Box sx={{ mt: 2 }}>
                  {convertedAmount.isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        מחשב המרת מטבע...
                      </Typography>
                    </Box>
                  )}
                  
                  {convertedAmount.error && (
                    <Alert severity="error">
                      {convertedAmount.error}
                    </Alert>
                  )}
                  
                  {convertedAmount.displayText && !convertedAmount.isLoading && !convertedAmount.error && (
                    <Alert severity="info">
                      <Typography variant="body2">
                        💱 סה"כ הוצא מומר: {convertedAmount.displayText}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {!trip.isOpenBudget && (
            <Card>
              <CardContent>
                {(() => {
                  const cashSpent = trip.initialCash - remainingCash;
                  const nonCashExpenses = expenses
                    .filter(expense => expense.paymentMethod !== 'cash')
                    .reduce((sum, expense) => sum + expense.amount, 0);
                  const totalTripCost = nonCashExpenses + cashSpent;
                  const actualRemainingBudget = trip.initialBudget - totalTripCost;
                  const isOverBudget = actualRemainingBudget < 0;
                  
                  return (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {isOverBudget ? `⚠️ ${t('trip.overBudget')}` : `💳 ${t('trip.remaining')}`}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        color={isOverBudget ? 'error.main' : 'success.main'}
                      >
                        {currencySymbol}{Math.abs(actualRemainingBudget).toFixed(2)}
                      </Typography>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                � {t('trip.remainingCash')}
              </Typography>
              <Typography 
                variant="h4" 
                color={remainingCash >= 0 ? 'success.main' : 'error.main'}
              >
                {currencySymbol}{Math.abs(remainingCash).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('trip.initialCash')}: {currencySymbol}{trip.initialCash.toFixed(2)} | {t('trip.spent')}: {currencySymbol}{totalCashSpent.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setCashModalOpen(true)}
                >
                  {t('cash.updateRemaining')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Additional Info */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Chip label={`${t('common.currency')}: ${trip.currency}`} variant="outlined" />
        </Box>

        {trip.notes && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📝 {t('common.notes')}
              </Typography>
              <Typography variant="body1">
                {trip.notes}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={t('trip.expenses')} />
          <Tab label={t('trip.budgetAnalysis')} />
          <Tab label={t('common.mapView')} />
          <Tab label={t('trip.summary')} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            {t('trip.expenses')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setExpenseFormOpen(true)}
          >
            {t('trip.addExpense')}
          </Button>
        </Box>
        <ExpenseList tripId={tripId} onExpenseClick={handleExpenseClick} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h5" gutterBottom>
          {t('trip.budgetAnalysis')}
        </Typography>
        
        {/* Budget Status */}
        {summary && (
          <BudgetStatus tripSummary={{
            ...summary,
            trip,
            expenses,
            budgetStatus: summary.budgetUtilization <= 75 ? 'good' : 
                         summary.budgetUtilization <= 90 ? 'warning' : 'exceeded',
            expensesByCategory: expenses.reduce((acc, expense) => {
              const category = expense.category;
              if (!acc[category]) {
                acc[category] = 0;
              }
              acc[category] += expense.amount;
              return acc;
            }, {} as Record<string, number>),
            dailyExpenses: Object.entries(
              expenses.reduce((acc, expense) => {
                const dateKey = expense.date instanceof Date 
                  ? expense.date.toISOString().split('T')[0]
                  : new Date(expense.date).toISOString().split('T')[0];
                if (!acc[dateKey]) {
                  acc[dateKey] = 0;
                }
                acc[dateKey] += expense.amount;
                return acc;
              }, {} as Record<string, number>)
            ).map(([date, amount]) => ({ date, amount }))
          }} />
        )}
        
        {/* Charts Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            📊 {t('trip.charts')}
          </Typography>
          <Analytics tripId={tripId} />
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h5" gutterBottom>
          {t('common.mapView')}
        </Typography>
        <Typography color="text.secondary">
          {t('common.mapIntegration')}
        </Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Trip Summary */}
        <Typography variant="h5" gutterBottom>
          {t('trip.summary')}
        </Typography>
        
        {/* Calculate total trip cost - only non-cash expenses + cash spent from balance */}
        {(() => {
          // Calculate cash spent from initial cash and remaining cash
          const cashSpent = trip.initialCash - remainingCash;
          
          // Calculate non-cash expenses only (to avoid double counting)
          const nonCashExpenses = expenses
            .filter(expense => expense.paymentMethod !== 'cash')
            .reduce((sum, expense) => sum + expense.amount, 0);
          
          // Total trip cost = non-cash expenses + cash spent (calculated from cash balance)
          const totalTripCost = nonCashExpenses + cashSpent;
          
          return (
            <>
              {/* Total Cost */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      💰 {t('trip.totalCost')}
                    </Typography>
                    <IconButton
                      onClick={handleCurrencyClick}
                      color="primary"
                      size="small"
                    >
                      <CurrencyExchange />
                    </IconButton>
                  </Box>
                  <Typography variant="h4" color="primary.main">
                    {currencySymbol}{totalTripCost.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('trip.nonCashExpenses')}: {currencySymbol}{nonCashExpenses.toFixed(2)} + {t('trip.cashSpent')}: {currencySymbol}{cashSpent.toFixed(2)}
                  </Typography>
                  
                  {/* Currency Conversion Display in Summary Tab */}
                  {convertedAmount && (
                    <Box sx={{ mt: 2 }}>
                      {convertedAmount.isLoading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">
                            מחשב המרת מטבע...
                          </Typography>
                        </Box>
                      )}
                      
                      {convertedAmount.error && (
                        <Alert severity="error">
                          {convertedAmount.error}
                        </Alert>
                      )}
                      
                      {convertedAmount.displayText && !convertedAmount.isLoading && !convertedAmount.error && (
                        <Alert severity="info">
                          <Typography variant="body2">
                            💱 עלות מומרת: {convertedAmount.displayText}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Cash Status */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💵 {t('trip.cashStatus')}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{t('trip.initialCash')}:</Typography>
                    <Typography>{currencySymbol}{trip.initialCash.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{t('trip.cashSpent')}:</Typography>
                    <Typography color="error.main">-{currencySymbol}{cashSpent.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider', pt: 1 }}>
                    <Typography variant="h6">{t('trip.remainingCash')}:</Typography>
                    <Typography variant="h6" color={remainingCash >= 0 ? 'success.main' : 'error.main'}>
                      {currencySymbol}{remainingCash.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </>
          );
        })()}

        {/* Expense Breakdown by Category */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 {t('trip.expenseBreakdown')}
            </Typography>
            {expenses.length > 0 ? (
              Object.entries(
                expenses.reduce((acc: Record<string, { amount: number; expenses: Expense[] }>, expense: Expense) => {
                  const category = expense.category;
                  if (!acc[category]) {
                    acc[category] = { amount: 0, expenses: [] };
                  }
                  acc[category].amount += expense.amount;
                  acc[category].expenses.push(expense);
                  return acc;
                }, {} as Record<string, { amount: number; expenses: Expense[] }>)
              ).map(([category, data]) => (
                <Box key={category} sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  {/* Category Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>
                        {CATEGORY_EMOJIS[category as ExpenseCategory]}
                      </Typography>
                      <Typography variant="h6">
                        {t(`expense.categories.${category}`, { defaultValue: category })}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main">
                      {currencySymbol}{data.amount.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {/* Expenses List */}
                  <Box sx={{ ml: 3 }}>
                    {data.expenses.map((expense) => (
                      <Box 
                        key={expense.id} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          py: 0.5,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderRadius: 1
                          }
                        }}
                        onClick={() => handleExpenseClick(expense)}
                      >
                        <Box>
                          <Typography variant="body2">
                            {expense.description || t('expense.noDescription')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(expense.date, 'dd/MM/yyyy')} • {t(`expense.paymentMethods.${expense.paymentMethod}`)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.primary">
                          {currencySymbol}{expense.amount.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                {t('expense.noExpenses')}
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Container>

    {/* Expense Form Dialog */}
    {trip && (
      <ExpenseForm
        open={expenseFormOpen}
        onClose={() => setExpenseFormOpen(false)}
        tripId={trip.id}
        tripCurrency={trip.currency}
        onCashExpenseChanged={() => {
          // Show a subtle notification or suggestion to update cash
          console.log('Cash expense changed - consider updating cash amount');
        }}
      />
    )}

    {/* Expense Details Modal */}
    <ExpenseDetailsModal
      expense={selectedExpense}
      open={expenseModalOpen}
      onClose={handleCloseExpenseModal}
      currencySymbol={currencySymbol}
    />

    {/* Currency Conversion Menu */}
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleCurrencyClose}
    >
      {trip && getAvailableCurrencies(trip.currency).map((currency) => (
        <MenuItem
          key={currency.code}
          onClick={() => handleCurrencySelect(currency.code as Currency)}
          disabled={convertedAmount?.isLoading}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{currency.symbol}</span>
            <span>{currency.code}</span>
            <span>-</span>
            <span>{currency.name}</span>
          </Box>
        </MenuItem>
      ))}
    </Menu>

    {/* Update Cash Modal */}
    <UpdateCashModal
      open={cashModalOpen}
      onClose={() => setCashModalOpen(false)}
      trip={trip}
      onUpdate={handleUpdateCash}
    />
    </>
  );
};

export default TripPage;