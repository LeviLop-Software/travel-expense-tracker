import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent
} from '@mui/material';
import { MoneyOff, AccountBalanceWallet, Edit, Calculate } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Trip, CURRENCY_SYMBOLS } from '../types';

interface UpdateCashModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  onUpdate: (remainingCash: number) => void;
}

const UpdateCashModal: React.FC<UpdateCashModalProps> = ({
  open,
  onClose,
  trip,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<'remaining' | 'direct'>('remaining');
  const [remainingCash, setRemainingCash] = useState(
    trip.remainingCash?.toString() || ''
  );
  const [directAmount, setDirectAmount] = useState(
    trip.remainingCash?.toString() || ''
  );
  const [error, setError] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[trip.currency];

  const handleSubmit = () => {
    const amount = editMode === 'remaining' 
      ? parseFloat(remainingCash) 
      : parseFloat(directAmount);
    
    if (isNaN(amount) || amount < 0) {
      setError(t('form.invalidAmount'));
      return;
    }

    if (amount > trip.initialCash) {
      setError(t('cash.cannotExceedInitial'));
      return;
    }

    onUpdate(amount);
    onClose();
    setRemainingCash('');
    setDirectAmount('');
    setError('');
  };

  const handleClose = () => {
    onClose();
    setRemainingCash(trip.remainingCash?.toString() || '');
    setDirectAmount(trip.remainingCash?.toString() || '');
    setError('');
  };

  const getCurrentAmount = () => {
    return editMode === 'remaining' ? remainingCash : directAmount;
  };

  const actualCashSpent = trip.initialCash - (parseFloat(getCurrentAmount()) || 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet color="primary" />
          <Typography variant="h6">
            {t('cash.updateRemaining')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Initial Cash Display */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceWallet color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  {t('trip.initialCash')}
                </Typography>
              </Box>
              <Typography variant="h6" color="info.main">
                {currencySymbol}{trip.initialCash.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>

          {/* Edit Mode Toggle */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('cash.editMode')}
            </Typography>
            <ToggleButtonGroup
              value={editMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode) {
                  setEditMode(newMode);
                  setError('');
                }
              }}
              aria-label="cash edit mode"
              fullWidth
            >
              <ToggleButton value="remaining" aria-label="remaining cash">
                <Calculate sx={{ mr: 1 }} />
                {t('cash.remainingMode')}
              </ToggleButton>
              <ToggleButton value="direct" aria-label="direct edit">
                <Edit sx={{ mr: 1 }} />
                {t('cash.directMode')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Input Field */}
          {editMode === 'remaining' ? (
            <TextField
              label={t('cash.remainingCashInput')}
              type="number"
              value={remainingCash}
              onChange={(e) => {
                setRemainingCash(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error || t('cash.remainingCashHelp')}
              fullWidth
              inputProps={{ 
                min: 0, 
                max: trip.initialCash,
                step: 0.01 
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currencySymbol}
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <TextField
              label={t('cash.directCashInput')}
              type="number"
              value={directAmount}
              onChange={(e) => {
                setDirectAmount(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error || t('cash.directCashHelp')}
              fullWidth
              inputProps={{ 
                min: 0, 
                max: trip.initialCash,
                step: 0.01 
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currencySymbol}
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Calculated Cash Spent */}
          {getCurrentAmount() && !isNaN(parseFloat(getCurrentAmount())) && (
            <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('cash.calculation')}
                </Typography>
                <Typography 
                  variant="h6" 
                  color={actualCashSpent >= 0 ? 'success.main' : 'error.main'}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <MoneyOff />
                  {currencySymbol}{actualCashSpent.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('cash.calculation')}: {currencySymbol}{trip.initialCash.toFixed(2)} - {currencySymbol}{parseFloat(getCurrentAmount()).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Alert severity="info" variant="outlined">
            {editMode === 'remaining' ? t('cash.remainingModeInfo') : t('cash.directModeInfo')}
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined">
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!getCurrentAmount() || !!error}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateCashModal;