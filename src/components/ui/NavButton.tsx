
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { AppButton } from '@/components/atoms/AppButton';

interface NavButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

const NavButton = ({
  children,
  onClick,
  disabled = false,
  sx,
}: NavButtonProps) => {
  return (
    <AppButton
      variant="primary"
      rounded
      onClick={onClick}
      disabled={disabled}
      sx={[
        {
          px: 3.5,
          py: 1.5,
          fontSize: '1rem',
          minWidth: '150px',
          m: 1,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </AppButton>
  );
};

export default NavButton;
