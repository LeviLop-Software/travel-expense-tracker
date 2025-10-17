import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Card,
  CardContent,
  alpha,
  Slide,
  useTheme,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday,
  AttachMoney,
  Category,
  Payment,
  Description
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { Expense, CATEGORY_EMOJIS, CURRENCY_SYMBOLS } from '../types';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ExpenseDetailsModalProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
  currencySymbol: string;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  expense,
  open,
  onClose,
  currencySymbol
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const dateLocale = i18n.language === 'he' ? he : enUS;

  if (!expense) return null;

  const paymentMethodIcon = expense.paymentMethod === 'cash' ? '💵' : '💳';
  const categoryEmoji = CATEGORY_EMOJIS[expense.category] || '💼';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
          color: theme.palette.text.primary,
          position: 'relative',
          pr: 6,
          py: 2,
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            {categoryEmoji}
          </Box>
          <Box>
            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, mb: 0.2 }}>
              {expense.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t(`expense.categories.${expense.category}`)}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.text.secondary,
            backgroundColor: 'transparent',
            width: 36,
            height: 36,
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.08),
              color: theme.palette.text.primary
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Amount and Payment Method Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Amount Card */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card 
              elevation={0}
              sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.15)} 0%, ${alpha(theme.palette.success.dark, 0.08)} 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      mr: 1.5
                    }}
                  >
                    <AttachMoney color="success" sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {t('expense.amount')}
                  </Typography>
                </Box>
                <Typography variant="h5" color="success.main" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                  {currencySymbol}{expense.amount.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
            </Box>

            {/* Payment Method Card */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card 
              elevation={0}
              sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.15)} 0%, ${alpha(theme.palette.info.dark, 0.08)} 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.04)} 100%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      mr: 1.5
                    }}
                  >
                    <Payment color="info" sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {t('expense.paymentMethod')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                    {paymentMethodIcon}
                  </Typography>
                  <Typography variant="body1" color="info.main" sx={{ fontWeight: 600 }}>
                    {t(`expense.paymentMethods.${expense.paymentMethod}`)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            </Box>
          </Box>

          {/* Category and Date */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Category */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      mr: 1.5
                    }}
                  >
                    <Category color="primary" sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {t('expense.category')}
                  </Typography>
                </Box>
                <Chip
                  label={`${categoryEmoji} ${t(`expense.categories.${expense.category}`)}`}
                  variant="filled"
                  color="primary"
                  size="small"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    px: 1.5,
                    borderRadius: 2
                  }}
                />
              </Paper>
            </Box>

            {/* Date */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.dark, 0.08)} 0%, ${alpha(theme.palette.secondary.dark, 0.04)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      mr: 1.5
                    }}
                  >
                    <CalendarToday color="secondary" sx={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {t('expense.date')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.3 }}>
                  {format(expense.date, 'EEEE, MMMM d, yyyy', { locale: dateLocale })}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {format(expense.date, 'HH:mm', { locale: dateLocale })}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Original Amount (if different currency) */}
          {expense.originalAmount && expense.originalCurrency && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                background: (theme) => theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha(theme.palette.warning.dark, 0.08)} 0%, ${alpha(theme.palette.warning.dark, 0.04)} 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.06)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    fontSize: '1rem'
                  }}
                >
                  💱
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    {t('expense.originalAmount')} ({expense.originalCurrency})
                  </Typography>
                  <Typography variant="body1" color="warning.main" sx={{ fontWeight: 600 }}>
                    {CURRENCY_SYMBOLS[expense.originalCurrency]}{expense.originalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Description */}
          {expense.notes && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                background: (theme) => theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.5)
                  : alpha(theme.palette.grey[50], 0.7),
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 1px 6px rgba(0, 0, 0, 0.06)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.text.primary, 0.06),
                    mt: 0.3
                  }}
                >
                  <Description color="primary" sx={{ fontSize: '1.2rem' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    {t('expense.notes')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                      color: theme.palette.text.primary
                    }}
                  >
                    {expense.notes}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Link to Receipt/Product/Order */}
          {expense.receiptUrl && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                background: (theme) => theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.08)} 0%, ${alpha(theme.palette.info.dark, 0.04)} 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.06)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    fontSize: '1rem'
                  }}
                >
                  🔗
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    {t('expense.receiptUrl')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="info"
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 1.5,
                        py: 0.3,
                        fontSize: '0.75rem',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      🔗 {t('expense.viewReceipt')}
                    </Button>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {expense.receiptUrl}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          pt: 1.5,
          background: (theme) => theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha(theme.palette.grey[50], 0.6),
          borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`
        }}
      >
        <Button 
          onClick={onClose} 
          variant="contained"
          size="medium"
          color="primary"
          sx={{ 
            minWidth: 100,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseDetailsModal;