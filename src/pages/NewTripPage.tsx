import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/firebaseStore';
import { Currency, CURRENCIES, CURRENCY_SYMBOLS } from '../types';
import { parseDestinations } from '../utils/countryFlags';
import { detectCountryWithAI } from '../utils/aiHelpers';

const NewTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addTrip = useAppStore(state => state.addTrip);

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    currency: 'EUR' as Currency, // EUR as default
    initialBudget: '',
    isOpenBudget: false, // New field for open budget
    initialCash: '', // Initial cash amount
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<{
    country: string;
    flag: string;
  } | null>(null);

  const [isDetectingCountry, setIsDetectingCountry] = useState(false);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // זיהוי מדינה אוטומטי בצאת משדה היעד
  const handleDestinationBlur = async () => {
    if (formData.destination && formData.destination.trim()) {
      setIsDetectingCountry(true);
      try {
        const currentDestination = formData.destination.trim();
        
        // בדוק אם יש פסיקים (יעדים מרובים)
        if (currentDestination.includes(',')) {
          // טפל ביעדים מרובים
          const destinations = currentDestination.split(',').map(dest => dest.trim());
          const updatedDestinations = [];
          
          for (const dest of destinations) {
            const countryInfo = await detectCountryWithAI(dest);
            if (countryInfo && !dest.includes(countryInfo.flag)) {
              // הוסף דגל אם לא קיים
              updatedDestinations.push(`${countryInfo.flag} ${dest}`);
            } else {
              // השאר כמו שהוא
              updatedDestinations.push(dest);
            }
          }
          
          // עדכן את השדה עם היעדים המעודכנים
          const updatedDestination = updatedDestinations.join(', ');
          if (updatedDestination !== currentDestination) {
            setFormData(prev => ({
              ...prev,
              destination: updatedDestination
            }));
          }
          
          // הצג הודעה על הזיהוי
          setDetectedCountry({ 
            country: `${updatedDestinations.length} יעדים`, 
            flag: '🌍' 
          });
        } else {
          // יעד יחיד
          const countryInfo = await detectCountryWithAI(currentDestination);
          if (countryInfo) {
            // הוסף דגל אוטומטית ליעד אם לא קיים כבר
            if (!currentDestination.includes(countryInfo.flag)) {
              const updatedDestination = `${countryInfo.flag} ${currentDestination}`;
              setFormData(prev => ({
                ...prev,
                destination: updatedDestination
              }));
            }
            setDetectedCountry(countryInfo);
          }
        }
      } catch (error) {
        console.error('Country detection error:', error);
      } finally {
        setIsDetectingCountry(false);
      }
    }
  };

  // איפוס זיהוי כשמתחילים להקליד ביעד
  const handleDestinationFocus = () => {
    setDetectedCountry(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('form.required');
    }

    if (!formData.destination.trim()) {
      newErrors.destination = t('form.required');
    }

    if (!formData.startDate) {
      newErrors.startDate = t('form.required');
    }

    if (!formData.endDate) {
      newErrors.endDate = t('form.required');
    }

    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = t('validations.endDateAfterStart');
    }

    if (!formData.isOpenBudget && (!formData.initialBudget || isNaN(parseFloat(formData.initialBudget)))) {
      newErrors.initialBudget = t('form.invalidAmount');
    }

    if (!formData.initialCash || isNaN(parseFloat(formData.initialCash))) {
      newErrors.initialCash = t('form.invalidAmount');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const destinations = parseDestinations(formData.destination.trim());
      addTrip({
        name: formData.name.trim(),
        destination: formData.destination.trim(),
        destinations: destinations.length > 1 ? destinations : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        currency: formData.currency,
        initialBudget: formData.isOpenBudget ? 0 : parseFloat(formData.initialBudget),
        isOpenBudget: formData.isOpenBudget,
        initialCash: parseFloat(formData.initialCash),
        notes: formData.notes.trim() || undefined,
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          {t('common.back')}
        </Button>

        <Typography variant="h3" component="h1" gutterBottom>
          {t('trip.addTrip')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('trip.createTripDesc', { defaultValue: 'Create a new trip to start tracking your expenses' })}
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label={t('trip.name')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />

            <Box>
              <TextField
                label={t('trip.destination')}
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                onBlur={handleDestinationBlur}
                onFocus={handleDestinationFocus}
                error={!!errors.destination}
                helperText={errors.destination || t('trip.destinationHelp', { defaultValue: 'Separate multiple destinations with commas (e.g., "Paris, Rome, London")' })}
                placeholder={t('trip.destinationPlaceholder', { defaultValue: 'e.g., Paris, Rome, London' })}
                fullWidth
                required
                InputProps={{
                  endAdornment: isDetectingCountry && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  )
                }}
              />
              
              {/* AI Country Detection */}
              {detectedCountry && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    🤖 {t('ai.autoDetected')}: <strong>{detectedCountry.flag} {detectedCountry.country}</strong>
                  </Typography>
                </Alert>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label={t('trip.startDate')}
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />

              <TextField
                label={t('trip.endDate')}
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('common.currency')}</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  label={t('common.currency')}
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency} ({CURRENCY_SYMBOLS[currency]})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isOpenBudget}
                      onChange={(e) => handleInputChange('isOpenBudget', e.target.checked)}
                    />
                  }
                  label={t('trip.openBudget')}
                />
                {!formData.isOpenBudget && (
                  <TextField
                    label={t('trip.totalBudget')}
                    type="number"
                    value={formData.initialBudget}
                    onChange={(e) => handleInputChange('initialBudget', e.target.value)}
                    error={!!errors.initialBudget}
                    helperText={errors.initialBudget}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {CURRENCY_SYMBOLS[formData.currency]}
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    required
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              <TextField
                label={t('trip.initialCash')}
                type="number"
                value={formData.initialCash}
                onChange={(e) => handleInputChange('initialCash', e.target.value)}
                error={!!errors.initialCash}
                helperText={errors.initialCash || t('trip.initialCashDesc')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {CURRENCY_SYMBOLS[formData.currency]}
                    </InputAdornment>
                  ),
                }}
                fullWidth
                required
              />
            </Box>

            <TextField
              label={t('common.notes')}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              multiline
              rows={3}
              placeholder={t('trip.notesPlaceholder', { defaultValue: 'Add any notes about this trip...' })}
              fullWidth
            />

            {Object.keys(errors).length > 0 && (
              <Alert severity="error">
                {t('form.pleaseFixErrors', { defaultValue: 'Please fix the errors above before submitting.' })}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Save />}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.loading') : t('common.save')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NewTripPage;