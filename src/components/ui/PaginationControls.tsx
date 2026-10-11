import { Box, Pagination, useTheme } from '@mui/material';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

export default function PaginationControls({
  page,
  totalPages,
  onChange,
  disabled,
}: PaginationControlsProps) {
  const theme = useTheme();

  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
      <Pagination
        count={totalPages}
        page={page}
        disabled={disabled}
        onChange={(_e, p) => onChange(p)}
        shape="rounded"
        color="primary"
        sx={{
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: theme.palette.button?.main || '#f25600',
            color: '#FFFFFF',
            '&:hover': { backgroundColor: '#cc4800' },
          },
        }}
      />
    </Box>
  );
}