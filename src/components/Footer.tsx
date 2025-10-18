import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  marginTop: 'auto',
  flexShrink: 0,
}));

const Footer: React.FC = () => {
  // Get version from package.json
  const version = process.env.REACT_APP_VERSION || '1.0.0';

  return (
    <FooterContainer>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Made with ❤️ by{' '}
        <Link
          href="https://levilop.com"
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Levilop Software
        </Link>
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Version {version}
      </Typography>
    </FooterContainer>
  );
};

export default Footer;