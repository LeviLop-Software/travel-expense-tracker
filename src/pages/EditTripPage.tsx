import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrip, useAppStore } from '../store/firebaseStore';
import { Currency, CURRENCIES, CURRENCY_SYMBOLS } from '../types';
import { parseDestinations } from '../utils/countryFlags';

const EditTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const { t } = useTranslation();
  const tripData = useTrip(tripId!);
  const trip = tripData?.trip;
  const updateTrip = useAppStore(state => state.updateTrip);

    const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    currency: 'EUR' as Currency,
    initialBudget: '',
    initialCash: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (trip) {
      setFormData({
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate.toISOString().split('T')[0],
        endDate: trip.endDate.toISOString().split('T')[0],
        currency: trip.currency,
        initialBudget: trip.initialBudget.toString(),
        initialCash: trip.initialCash.toString(),
        notes: trip.notes || '',
      });
    }
  }, [trip]);

  if (!trip) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          {t('trip.notFound')}
        </Alert>
      </Container>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
      newErrors.endDate = t('form.endDateAfterStart');
    }

    if (!formData.initialBudget || isNaN(parseFloat(formData.initialBudget))) {
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
      updateTrip(trip.id, {
        name: formData.name.trim(),
        destination: formData.destination.trim(),
        destinations: destinations.length > 1 ? destinations : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        currency: formData.currency,
        initialBudget: parseFloat(formData.initialBudget),
        initialCash: parseFloat(formData.initialCash),
        notes: formData.notes.trim() || undefined,
      });

      navigate(`/trip/${trip.id}`);
    } catch (error) {
      console.error('Error updating trip:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/trip/${trip.id}`)}
          sx={{ mb: 2 }}
        >
          {t('common.back')}
        </Button>

        <Typography variant="h3" component="h1" gutterBottom>
          {t('trip.editTrip')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('trip.editTripDesc')}
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

            <TextField
              label={t('trip.destination')}
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              error={!!errors.destination}
              helperText={errors.destination || t('trip.destinationHelp', { defaultValue: 'Separate multiple destinations with commas (e.g., "Paris, Rome, London")' })}
              placeholder={t('trip.destinationPlaceholder', { defaultValue: 'e.g., Paris, Rome, London' })}
              fullWidth
              required
            />

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
              />

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
                onClick={() => navigate(`/trip/${trip.id}`)}
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

export default EditTripPage;