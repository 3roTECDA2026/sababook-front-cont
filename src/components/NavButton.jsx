import React from 'react';
import { Button, styled } from '@mui/material';

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
/**
 * @param {string} props.children
 * @param {function} props.onClick
 */
const NavButton = ({ children, onClick, ...rest }) => {
  return (
    <StyledNavButton
      variant="contained"
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledNavButton>
  );
};

export default NavButton;