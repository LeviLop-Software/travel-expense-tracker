import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/firebaseStore';
import { useAuth } from '../providers/FirebaseProvider';
import { 
  Currency, 
  ExpenseCategory, 
  PaymentMethod, 
  CURRENCIES, 
  CURRENCY_SYMBOLS, 
  EXPENSE_CATEGORIES, 
  CATEGORY_EMOJIS
} from '../types';
import { detectCategoryFromDescription } from '../utils/aiHelpers';
import { trackExpenseAdded, trackExpenseEdited, trackAIUsage } from '../utils/analytics';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripCurrency: Currency;
  expenseToEdit?: {
    id: string;
    date: Date;
    category: ExpenseCategory;
    amount: number;
    originalAmount?: number;
    originalCurrency?: Currency;
    paymentMethod?: PaymentMethod;
    description?: string;
    notes?: string;
    receiptUrl?: string;
    isShared?: boolean;
    numberOfPeople?: number;
    totalAmountBeforeSharing?: number;
  } | null;
  onCashExpenseChanged?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  tripId,
  tripCurrency,
  expenseToEdit,
  onCashExpenseChanged
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const addExpense = useAppStore(state => state.addExpense);
  const updateExpense = useAppStore(state => state.updateExpense);

  const [formData, setFormData] = useState({
    date: expenseToEdit?.date 
      ? (expenseToEdit.date instanceof Date ? expenseToEdit.date : new Date(expenseToEdit.date)).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    category: expenseToEdit?.category || 'food' as ExpenseCategory,
    amount: expenseToEdit?.amount?.toString() || '',
    originalAmount: expenseToEdit?.originalAmount?.toString() || '',
    originalCurrency: expenseToEdit?.originalCurrency || tripCurrency,
    paymentMethod: expenseToEdit?.paymentMethod || 'credit' as PaymentMethod,
    description: expenseToEdit?.description || '',
    notes: expenseToEdit?.notes || '',
    receiptUrl: expenseToEdit?.receiptUrl || '',
    useDifferentCurrency: false,
    isShared: false,
    numberOfPeople: '2', // Default to 2 people (user + 1 other)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDetectingCategory, setIsDetectingCategory] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string>('');

  useEffect(() => {
    if (expenseToEdit) {
      const expenseDate = expenseToEdit.date instanceof Date ? expenseToEdit.date : new Date(expenseToEdit.date);
      // For shared expenses, show the original amount before sharing for editing
      const displayAmount = expenseToEdit.isShared && expenseToEdit.totalAmountBeforeSharing 
        ? expenseToEdit.totalAmountBeforeSharing 
        : expenseToEdit.amount;
      
      setFormData({
        date: expenseDate.toISOString().split('T')[0],
        category: expenseToEdit.category,
        amount: displayAmount.toString(),
        originalAmount: expenseToEdit.originalAmount?.toString() || '',
        originalCurrency: expenseToEdit.originalCurrency || tripCurrency,
        paymentMethod: expenseToEdit.paymentMethod || 'credit',
        description: expenseToEdit.description || '',
        notes: expenseToEdit.notes || '',
        receiptUrl: expenseToEdit.receiptUrl || '',
        useDifferentCurrency: !!expenseToEdit.originalCurrency,
        isShared: expenseToEdit.isShared || false,
        numberOfPeople: expenseToEdit.numberOfPeople?.toString() || '2',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'food',
        amount: '',
        originalAmount: '',
        originalCurrency: tripCurrency,
        paymentMethod: 'credit',
        description: '',
        notes: '',
        receiptUrl: '',
        useDifferentCurrency: false,
        isShared: false,
        numberOfPeople: '2',
      });
      setErrors({});
    }
  }, [expenseToEdit, tripCurrency]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // אוטו זיהוי קטגוריה בזמן הקלדה (עם debounce)
  const [categoryDetectionTimer, setCategoryDetectionTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setFormData(prev => ({ ...prev, description: newDescription }));
    
    // נקה את הטיימר הקודם
    if (categoryDetectionTimer) {
      clearTimeout(categoryDetectionTimer);
    }
    
    // אם יש טקסט, התחל זיהוי קטגוריה אחרי 1.5 שניות של חוסר פעילות
    if (newDescription && newDescription.trim().length > 3) {
      const timer = setTimeout(async () => {
        setIsDetectingCategory(true);
        try {
          const detectedCat = await detectCategoryFromDescription(newDescription);
          if (detectedCat && detectedCat !== 'misc') {
            setFormData(prev => ({ ...prev, category: detectedCat }));
            setDetectedCategory(detectedCat);
            trackAIUsage('categorization');
          }
        } catch (error) {
          console.error('Category detection error:', error);
        } finally {
          setIsDetectingCategory(false);
        }
      }, 1500); // זיהוי אחרי 1.5 שניות חוסר פעילות
      
      setCategoryDetectionTimer(timer);
    }
  };

  // אוטו זיהוי קטגוריה בצאת מהשדה תיאור (גיבוי)
  const handleDescriptionBlur = async () => {
    // אם כבר זוהתה קטגוריה או אין תיאור, לא עושים כלום
    if (!formData.description || formData.description.trim().length <= 3 || detectedCategory) {
      return;
    }
    
    setIsDetectingCategory(true);
    try {
      // זיהוי קטגוריה באמצעות AI
      const detectedCat = await detectCategoryFromDescription(formData.description);
      if (detectedCat && detectedCat !== 'misc') {
        setFormData(prev => ({ ...prev, category: detectedCat }));
        setDetectedCategory(detectedCat);
        trackAIUsage('categorization');
      } else {
        // אם לא זוהה כלום, קבע "שונות"
        setFormData(prev => ({ ...prev, category: 'misc' as ExpenseCategory }));
        setDetectedCategory('misc');
      }
    } catch (error) {
      console.error('Category detection error:', error);
      // במקרה של שגיאה, קבע "שונות"
      setFormData(prev => ({ ...prev, category: 'misc' as ExpenseCategory }));
      setDetectedCategory('misc');
    } finally {
      setIsDetectingCategory(false);
    }
  };

  // איפוס זיהוי אוטומטי כשמתחילים להקליד בתיאור
  const handleDescriptionFocus = () => {
    setDetectedCategory('');
  };

  const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
    // Simple conversion rates - in a real app, you'd use a currency API
    const rates: Record<Currency, number> = { EUR: 1, USD: 1.1, ILS: 4.0 };
    return (amount / rates[from]) * rates[to];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = t('form.required');
    }

    // Validate amount field only when NOT using different currency
    if (!formData.useDifferentCurrency && (!formData.amount || isNaN(parseFloat(formData.amount)))) {
      newErrors.amount = t('form.invalidAmount');
    }

    // Validate original amount when using different currency
    if (formData.useDifferentCurrency && (!formData.originalAmount || isNaN(parseFloat(formData.originalAmount)))) {
      newErrors.originalAmount = t('form.invalidAmount');
    }

    if (formData.receiptUrl && formData.receiptUrl.trim() && !formData.receiptUrl.startsWith('http')) {
      newErrors.receiptUrl = t('form.invalidUrl');
    }

    // Validate number of people for shared expenses
    if (formData.isShared) {
      const numPeople = parseInt(formData.numberOfPeople);
      if (!numPeople || numPeople < 2) {
        newErrors.numberOfPeople = 'מספר האנשים חייב להיות לפחות 2';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('ExpenseForm handleSubmit called');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    let finalAmount = parseFloat(formData.amount);
    let originalAmount = undefined;
    let originalCurrency = undefined;
    let totalAmountBeforeSharing = undefined;

    if (formData.useDifferentCurrency) {
      originalAmount = parseFloat(formData.originalAmount);
      originalCurrency = formData.originalCurrency;
      // Convert to trip currency
      finalAmount = convertCurrency(originalAmount, formData.originalCurrency, tripCurrency);
    }

    // Handle shared expenses
    if (formData.isShared) {
      const numberOfPeople = parseInt(formData.numberOfPeople);
      totalAmountBeforeSharing = finalAmount; // Store original amount before division
      finalAmount = finalAmount / numberOfPeople; // Split the amount
      
      // Add note about sharing if no notes exist
      const sharingInfo = `סכום כולל לפני חלוקה: ${CURRENCY_SYMBOLS[tripCurrency]}${totalAmountBeforeSharing.toFixed(2)} (חולק ל-${numberOfPeople} אנשים)`;
      const existingNotes = formData.notes.trim();
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n\n${sharingInfo}`
        : sharingInfo;
      
      formData.notes = updatedNotes;
    }

    const expenseData = {
      tripId,
      date: new Date(formData.date),
      category: formData.category,
      amount: finalAmount,
      originalAmount,
      originalCurrency,
      paymentMethod: formData.paymentMethod,
      description: formData.description.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      receiptUrl: formData.receiptUrl.trim() || undefined,
      isShared: formData.isShared || undefined,
      numberOfPeople: formData.isShared ? parseInt(formData.numberOfPeople) : undefined,
      totalAmountBeforeSharing: totalAmountBeforeSharing,
    };

    console.log('Creating expense with data:', expenseData);

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, expenseData);
      trackExpenseEdited(formData.category);
      // Check if this is a cash expense change
      if (formData.paymentMethod === 'cash' || expenseToEdit.paymentMethod === 'cash') {
        if (onCashExpenseChanged) {
          onCashExpenseChanged();
        }
      }
    } else {
      addExpense(expenseData);
      console.log('Expense added successfully');
      trackExpenseAdded({
        category: formData.category,
        amount: finalAmount,
        currency: tripCurrency,
        isShared: formData.isShared,
        hasReceipt: !!formData.receiptUrl
      });
      // Check if this is a new cash expense
      if (formData.paymentMethod === 'cash' && onCashExpenseChanged) {
        onCashExpenseChanged();
      }
      // Reset form after adding new expense (only for new expenses, not edits)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'food',
        amount: '',
        originalAmount: '',
        originalCurrency: tripCurrency,
        paymentMethod: 'credit',
        description: '',
        notes: '',
        receiptUrl: '',
        useDifferentCurrency: false,
        isShared: false,
        numberOfPeople: '2',
      });
      setErrors({});
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {expenseToEdit ? t('expense.editExpense') : t('expense.addExpense')}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* Offline mode warning */}
          {!isAuthenticated && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {t('expense.form.offlineMode')}
              </Typography>
            </Alert>
          )}
          
          <TextField
            label={t('common.date')}
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label={t('expense.description')}
            value={formData.description}
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
            onFocus={handleDescriptionFocus}
            placeholder={t('expense.descriptionPlaceholder')}
            fullWidth
            InputProps={{
              endAdornment: isDetectingCategory && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              )
            }}
          />

          {/* הצגת קטגוריה שזוהתה */}
          {detectedCategory && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                🤖 {t('ai.autoDetected')}: <strong>{t(`expense.categories.${detectedCategory}`)}</strong>
              </Typography>
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>{t('common.category')}</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              label={t('common.category')}
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {CATEGORY_EMOJIS[category]} {t(`expense.categories.${category}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Payment Method */}
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              {t('expense.paymentMethod')}
            </Typography>
            <RadioGroup
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              row
            >
              <FormControlLabel
                value="credit"
                control={<Radio />}
                label={`💳 ${t('expense.paymentMethods.credit')}`}
              />
              <FormControlLabel
                value="cash"
                control={<Radio />}
                label={`💵 ${t('expense.paymentMethods.cash')}`}
              />
            </RadioGroup>
          </FormControl>

          {/* Shared Expense Toggle */}
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              🤝 הוצאה משותפת
            </Typography>
            <RadioGroup
              value={formData.isShared ? 'shared' : 'personal'}
              onChange={(e) => {
                const isShared = e.target.value === 'shared';
                handleInputChange('isShared', isShared);
                if (!isShared) {
                  handleInputChange('numberOfPeople', '2');
                }
              }}
              row
            >
              <FormControlLabel
                value="personal"
                control={<Radio />}
                label="הוצאה אישית"
              />
              <FormControlLabel
                value="shared"
                control={<Radio />}
                label="הוצאה משותפת עם חברים"
              />
            </RadioGroup>
          </FormControl>

          {/* Number of People - only show if shared */}
          {formData.isShared && (
            <TextField
              label="מספר אנשים (כולל אתה)"
              type="number"
              value={formData.numberOfPeople}
              onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
              error={!!errors.numberOfPeople}
              helperText={errors.numberOfPeople || 'לדוגמה: 3 אנשים = אתה + 2 חברים'}
              InputProps={{
                inputProps: { min: 2, max: 20 }
              }}
              fullWidth
            />
          )}

          {/* Currency Conversion Toggle */}
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              {t('expense.originalCurrency')} ({t('expense.convertedAmount')})
            </Typography>
            <RadioGroup
              value={formData.useDifferentCurrency ? 'different' : 'same'}
              onChange={(e) => {
                const useDifferent = e.target.value === 'different';
                handleInputChange('useDifferentCurrency', useDifferent);
                if (!useDifferent) {
                  handleInputChange('originalAmount', '');
                  handleInputChange('originalCurrency', tripCurrency);
                }
              }}
              row
            >
              <FormControlLabel
                value="same"
                control={<Radio />}
                label={`${t('common.amount')} (${tripCurrency})`}
              />
              <FormControlLabel
                value="different"
                control={<Radio />}
                label={t('expense.originalCurrency')}
              />
            </RadioGroup>
          </FormControl>

          {/* Amount Input */}
          {formData.useDifferentCurrency ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('expense.originalAmount')}
                type="number"
                value={formData.originalAmount}
                onChange={(e) => handleInputChange('originalAmount', e.target.value)}
                error={!!errors.originalAmount}
                helperText={errors.originalAmount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {CURRENCY_SYMBOLS[formData.originalCurrency]}
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 2 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>{t('expense.originalCurrency')}</InputLabel>
                <Select
                  value={formData.originalCurrency}
                  onChange={(e) => handleInputChange('originalCurrency', e.target.value)}
                  label={t('expense.originalCurrency')}
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ) : (
            <TextField
              label={t('common.amount')}
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {CURRENCY_SYMBOLS[tripCurrency]}
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          )}

          <TextField
            label={t('common.notes')}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            multiline
            rows={3}
            placeholder={t('expense.notesPlaceholder')}
            fullWidth
          />

          <TextField
            label={t('expense.receiptUrl')}
            value={formData.receiptUrl}
            onChange={(e) => handleInputChange('receiptUrl', e.target.value)}
            error={!!errors.receiptUrl}
            helperText={errors.receiptUrl}
            placeholder={t('expense.receiptUrlPlaceholder')}
            fullWidth
          />

          {/* Cash Expense Warning */}
          {formData.paymentMethod === 'cash' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              💡 {t('expense.cashExpenseReminder')}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseForm;