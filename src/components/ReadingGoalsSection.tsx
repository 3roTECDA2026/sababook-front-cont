// src/components/ReadingGoalsSection.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { getActiveReadingGoal, createReadingGoal } from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import type { ReadingGoal } from '@/types';

const ReadingGoalsSection = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState<ReadingGoal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    targetBooks: 5,
    startDate: tomorrowStr,
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const userId = user?.userId || (user as any)?.usuario_id;
      if (userId) {
        const data = await getActiveReadingGoal(userId);
        setGoal(data || null);
      }
    } catch (err) {
      console.error('Error loading goal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoal();
    }
  }, [user]);

  const handleCreateGoal = async () => {
    try {
      const userId = user?.userId || (user as any)?.usuario_id;
      if (!userId) return;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const payload = {
        userId,
        periodName: 'Personal Goal',
        targetBooks: formData.targetBooks,
        startDate: tomorrow.toISOString(),
        endDate: new Date(`${formData.endDate}T23:59:59.999Z`).toISOString(),
      };

      await createReadingGoal(payload);
      setOpenModal(false);
      await fetchGoal();
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  if (loading) return null;

  const targetCount = Number(goal?.targetBooks || (goal as any)?.cantidad_libros || 0);
  const currentCount = Number(goal?.readBooks ?? (goal as any)?.libros_leidos ?? goal?.progress ?? 0);
  const progress = targetCount > 0 ? Math.min((currentCount / targetCount) * 100, 100) : 0;
  const isCompleted = targetCount > 0 && currentCount >= targetCount;

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 4, mt: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
          🎯 Meta de Lectura
        </Typography>

        {goal ? (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body1" fontWeight="medium">
                Libros leídos: <strong>{currentCount}</strong> de {targetCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#f0f0f0',
                '& .MuiLinearProgress-bar': { backgroundColor: isCompleted ? '#2e7d32' : '#f25600' },
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'right' }}>
              Período: {new Date(goal.startDate || (goal as any).fecha_inicio || '').toLocaleDateString()} -{' '}
              {new Date(goal.endDate || (goal as any).fecha_fin || '').toLocaleDateString()}
            </Typography>

            {isCompleted && (
              <Box
                sx={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  p: 2,
                  borderRadius: 2,
                  mt: 2,
                  textAlign: 'center',
                  border: '1px solid #a5d6a7',
                }}
              >
                <Typography fontWeight="bold">¡Meta alcanzada exitosamente! 🎉</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpenModal(true)}
                  sx={{
                    mt: 1.5,
                    backgroundColor: '#2e7d32',
                    '&:hover': { backgroundColor: '#1b5e20' },
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  Crear nueva meta
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              No tenés ninguna meta activa para este período.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              sx={{ backgroundColor: '#f25600', '&:hover': { backgroundColor: '#cc4800' }, borderRadius: '20px', fontWeight: 'bold' }}
            >
              Establecer Meta
            </Button>
          </Box>
        )}
      </CardContent>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight="bold">Nueva Meta de Lectura</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Cantidad de libros"
              type="number"
              value={formData.targetBooks}
              onChange={(e) => setFormData({ ...formData, targetBooks: parseInt(e.target.value) || 1 })}
              fullWidth
            />

            <TextField
              label="Fecha de inicio"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: tomorrowStr }}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
            />

            <TextField
              label="Fecha de fin"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formData.startDate || tomorrowStr }}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCreateGoal} variant="contained" sx={{ backgroundColor: '#f25600', '&:hover': { backgroundColor: '#cc4800' } }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ReadingGoalsSection;