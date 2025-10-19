import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Fab,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Add,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import { useTripExpenses, useAppStore } from '../store/firebaseStore';
import { Expense, CATEGORY_COLORS, CATEGORY_EMOJIS, CURRENCY_SYMBOLS } from '../types';
import ExpenseForm from './ExpenseForm';

interface ExpenseListProps {
  tripId: string;
  onExpenseClick?: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ tripId, onExpenseClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const language = useAppStore(state => state.language);
  
  const expenses = useTripExpenses(tripId);
  const deleteExpense = useAppStore(state => state.deleteExpense);
  const getTripById = useAppStore(state => state.getTripById);
  
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);

  const trip = getTripById(tripId);
  const dateLocale = language === 'he' ? he : enUS;
  
  if (!trip) {
    return <Alert severity="error">{t('common.tripNotFound')}</Alert>;
  }

  const currencySymbol = CURRENCY_SYMBOLS[trip.currency];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, expenseId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedExpense(expenseId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedExpense(null);
  };

  const handleEdit = () => {
    const expense = expenses.find(e => e.id === selectedExpense);
    if (expense) {
      setExpenseToEdit({
        id: expense.id,
        date: expense.date.toISOString().split('T')[0],
        category: expense.category,
        amount: expense.amount,
        originalAmount: expense.originalAmount,
        originalCurrency: expense.originalCurrency,
        notes: expense.notes,
        receiptUrl: expense.receiptUrl,
        isShared: expense.isShared,
        numberOfPeople: expense.numberOfPeople,
        totalAmountBeforeSharing: expense.totalAmountBeforeSharing,
      });
      setExpenseFormOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedExpense) {
      deleteExpense(selectedExpense);
    }
    handleMenuClose();
  };

  const handleReceiptClick = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank');
  };

  if (expenses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('expense.noExpenses', { defaultValue: 'No expenses recorded yet' })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('expense.noExpensesDesc', { defaultValue: 'Start tracking your travel expenses to see them here.' })}
        </Typography>
      </Box>
    );
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

    // Group expenses by date
  const groupedExpenses = sortedExpenses.reduce((groups, expense) => {
    const dateKey = format(expense.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  // Sort expenses within each day by creation time (latest first)
  Object.keys(groupedExpenses).forEach(dateKey => {
    groupedExpenses[dateKey].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  return (
    <Box>
      {Object.entries(groupedExpenses).map(([dateKey, dayExpenses]) => (
        <Box key={dateKey} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            {format(new Date(dateKey), 'EEEE, MMMM d, yyyy', { locale: dateLocale })}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dayExpenses.map((expense) => (
              <Card 
                key={expense.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.12)' 
                      : 'rgba(0, 0, 0, 0.08)',
                  },
                }}
                onClick={() => onExpenseClick?.(expense)}
              >
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        gap: 1,
                        mb: isMobile ? 1 : 0
                      }}>
                        <Chip
                          label={`${CATEGORY_EMOJIS[expense.category]} ${t(`expense.categories.${expense.category}`)}`}
                          size="small"
                          sx={{
                            backgroundColor: CATEGORY_COLORS[expense.category],
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                        <Tooltip 
                          title={expense.paymentMethod === 'cash' ? t('cash.trackingOnly') : ''}
                          placement="top"
                          arrow
                        >
                          <Chip
                            label={expense.paymentMethod === 'cash' ? '💵' : '💳'}
                            size="small"
                            variant="outlined"
                            sx={{
                              cursor: expense.paymentMethod === 'cash' ? 'help' : 'default'
                            }}
                          />
                        </Tooltip>
                        {expense.isShared && (
                          <Tooltip 
                            title={`הוצאה משותפת עם ${expense.numberOfPeople} אנשים${expense.totalAmountBeforeSharing ? ` • סכום כולל: ${currencySymbol}${expense.totalAmountBeforeSharing.toFixed(2)}` : ''}`}
                            placement="top"
                            arrow
                          >
                            <Chip
                              label={`🤝 ${expense.numberOfPeople}`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{
                                cursor: 'help',
                                borderStyle: 'dashed',
                                fontWeight: 600,
                              }}
                            />
                          </Tooltip>
                        )}
                        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                          {currencySymbol}{expense.amount.toFixed(2)}
                        </Typography>
                        {expense.originalAmount && expense.originalCurrency && expense.originalCurrency !== trip?.currency && (
                          <Typography variant="caption" color="text.secondary">
                            ({CURRENCY_SYMBOLS[expense.originalCurrency]}{expense.originalAmount.toFixed(2)})
                          </Typography>
                        )}
                        
                        {expense.receiptUrl && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceiptClick(expense.receiptUrl!);
                            }}
                            sx={{ color: 'primary.main', p: 0.5 }}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      {(expense.description || expense.notes || expense.location) && (
                        <Box sx={{ mt: 1 }}>
                          {expense.description && (
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                              {expense.description}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {expense.notes && (
                              <Typography variant="caption" color="text.secondary">
                                💬 {expense.notes}
                              </Typography>
                            )}
                            
                            {expense.location && (
                              <Typography variant="caption" color="text.secondary">
                                📍 {expense.location.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <IconButton
                      onClick={(e) => handleMenuOpen(e, expense.id)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ))}

      {/* Floating Action Button for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add expense"
          onClick={() => setExpenseFormOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 2 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 2 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Expense Form */}
      {trip && expenseFormOpen && (
        <ExpenseForm
          open={expenseFormOpen}
          onClose={() => {
            console.log('ExpenseForm closing');
            setExpenseFormOpen(false);
            setExpenseToEdit(null);
          }}
          tripId={tripId}
          tripCurrency={trip.currency}
          expenseToEdit={expenseToEdit}
          onCashExpenseChanged={() => {
            // Show a notification suggesting to update cash
            console.log('Cash expense changed - consider updating cash amount');
          }}
        />
      )}
    </Box>
  );
};

export default ExpenseList;