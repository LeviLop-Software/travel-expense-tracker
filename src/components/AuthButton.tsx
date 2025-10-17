import React from 'react';
import {
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Google as GoogleIcon, AccountCircle, ExitToApp } from '@mui/icons-material';
import { useAuthState, useSignInWithGoogle, useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export const AuthButton: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
  };

  // Loading state
  if (loading || googleLoading || signOutLoading) {
    return <CircularProgress size={24} />;
  }

  // Error state
  if (error || googleError || signOutError) {
    return (
      <Alert severity="error" sx={{ maxWidth: 300 }}>
        שגיאה בהתחברות: {(error || googleError || signOutError)?.message}
      </Alert>
    );
  }

  // User is signed in
  if (user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={handleClick} size="small">
          <Avatar 
            src={user.photoURL || undefined} 
            alt={user.displayName || 'User'}
            sx={{ width: 32, height: 32 }}
          >
            {!user.photoURL && <AccountCircle />}
          </Avatar>
        </IconButton>
        
        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {user.displayName || user.email}
        </Typography>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {user.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <ExitToApp sx={{ mr: 1 }} />
            יציאה
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // User is not signed in
  return (
    <Button
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={() => signInWithGoogle()}
      sx={{
        borderColor: 'primary.main',
        color: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.main',
          color: 'white',
        }
      }}
    >
      התחבר עם Google
    </Button>
  );
};