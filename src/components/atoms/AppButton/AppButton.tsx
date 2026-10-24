// src/components/atoms/AppButton/AppButton.tsx
import React, { ReactNode } from 'react';
import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { BUTTON_ORANGE, BUTTON_ORANGE_DARK, DELETE_ORANGE, DELETE_ORANGE_DARK, DELETE_TEXT } from '@/theme/theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'outlined' | 'destructive' | 'text';

export interface AppButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  variant?: AppButtonVariant;
  loading?: boolean;
  rounded?: boolean;
  children?: ReactNode;
  component?: React.ElementType;
  to?: string;
  target?: string;
  rel?: string;
}

export default function AppButton({
  variant = 'primary',
  loading = false,
  rounded = false,
  disabled = false,
  children,
  sx,
  ...props
}: AppButtonProps) {
  const isDestructive = variant === 'destructive';
  const isOutlined = variant === 'outlined' || variant === 'secondary';
  const isText = variant === 'text';

  const getVariantStyles = () => {
    const borderRadius = rounded ? '24px' : '8px';

    if (isDestructive) {
      return {
        backgroundColor: DELETE_ORANGE,
        color: DELETE_TEXT,
        border: 'none',
        borderRadius,
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: DELETE_ORANGE_DARK,
        },
        '&.Mui-disabled': {
          backgroundColor: DELETE_ORANGE,
          color: DELETE_TEXT,
          opacity: 0.6,
        },
      };
    }

    if (isOutlined) {
      return {
        backgroundColor: 'transparent',
        color: BUTTON_ORANGE,
        border: `1.5px solid ${BUTTON_ORANGE}`,
        borderRadius,
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: 'rgba(242, 86, 0, 0.08)',
          borderColor: BUTTON_ORANGE_DARK,
        },
        '&.Mui-disabled': {
          borderColor: '#ccc',
          color: '#999',
        },
      };
    }

    if (isText) {
      return {
        backgroundColor: 'transparent',
        color: BUTTON_ORANGE,
        borderRadius,
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: 'rgba(242, 86, 0, 0.08)',
        },
      };
    }

    // 'primary' (default)
    return {
      backgroundColor: BUTTON_ORANGE,
      color: '#FFFFFF',
      border: 'none',
      borderRadius,
      fontWeight: 600,
      textTransform: 'none',
      '&:hover': {
        backgroundColor: BUTTON_ORANGE_DARK,
      },
      '&.Mui-disabled': {
        backgroundColor: BUTTON_ORANGE,
        color: '#FFFFFF',
        opacity: 0.6,
      },
    };
  };

  return (
    <Button
      disabled={disabled || loading}
      disableElevation
      sx={[
        getVariantStyles(),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={20}
          color="inherit"
          sx={{ display: 'inline-flex' }}
        />
      ) : (
        children
      )}
    </Button>
  );
}
