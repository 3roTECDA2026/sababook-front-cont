import { Typography, useTheme } from '@mui/material';
import StyledCard from './StyledCard';

interface StatCardProps {
  title: string;
  value: number | string;
}

export default function StatCard({ title, value }: StatCardProps) {
  const theme = useTheme();

  return (
    <StyledCard
      sx={{
        textAlign: 'center',
        height: '100%',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ color: theme.palette.button?.main || '#f25600' }}
      >
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </StyledCard>
  );
}
