// src/components/NavButton.tsx
import React, { ReactNode } from 'react';
import { Button, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material'

const StyledNavButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.button?.main || '#f25600',
  '&:hover': {
    backgroundColor: '#cc4800',
  },
  color: '#FFFFFF',
  padding: '12px 30px',
  fontSize: '1rem',
  fontWeight: 'bold',
  borderRadius: '20px',
  textTransform: 'none',
  minWidth: '150px',
  margin: theme.spacing(1),
}));

interface NavButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

interface NavButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

interface NavButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  sx?: SxProps<Theme>;
}

const NavButton = ({ children, onClick }: NavButtonProps) => {
  return (
    <StyledNavButton variant="contained" onClick={onClick}>
      {children}
    </StyledNavButton>
  );
};

export default NavButton;