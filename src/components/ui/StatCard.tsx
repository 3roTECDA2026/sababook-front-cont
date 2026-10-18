import { Paper, Typography, useTheme } from '@mui/material';

interface StatCardProps {
  title: string;
  value: number | string;
}

export default function StatCard({ title, value }: StatCardProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        p: 2,
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
    </Paper>
  );
}
