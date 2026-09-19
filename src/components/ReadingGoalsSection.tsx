import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getActiveReadingGoal, createReadingGoal } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { ReadingGoal } from '../types';
const [goal, setGoal] = useState<ReadingGoal | null>(null);
const ReadingGoalsSection = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // Genera la fecha de mañana en formato YYYY-MM-DD
  const fechaMananaStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    target_books: 5,
    start_date: fechaMananaStr, // Por defecto inicia mañana
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const userId = user?.usuario_id;
      if (userId) {
        const res = await getActiveReadingGoal(userId);
        const data = res?.data || res;
        const activeGoal = Array.isArray(data) ? data[0] : data;
        setGoal(activeGoal || null);
      }
    } catch (err) {
      console.error('Error al cargar la meta:', err);
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
      const userId = user?.usuario_id;

      // Calculamos el inicio para mañana a primera hora (00:00:00 hs)
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(0, 0, 0, 0);

      const payload = {
        ...formData,
        usuario_id: userId,
        periodo_nombre: 'Meta Personal',
        fecha_inicio: manana.toISOString(), // Forzamos inicio a mañana
        fecha_fin: new Date(`${formData.end_date}T23:59:59.999Z`).toISOString(),
      };

      await createReadingGoal(payload);
      setOpenModal(false);
      await fetchGoal();
    } catch (err) {
      console.error('Error al crear la meta:', err);
    }
  };

  if (loading) return null;

  // Mapeo exacto con los campos de Prisma
  const targetCount = Number(goal?.cantidad_libros || goal?.target_books || 0);
  const currentCount = Number(goal?.libros_leidos ?? goal?.progreso ?? goal?.current_books ?? 0);
  const progress = targetCount > 0 ? Math.min((currentCount / targetCount) * 100, 100) : 0;
  
  // Condición para saber si la meta fue alcanzada
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
                '& .MuiLinearProgress-bar': { backgroundColor: isCompleted ? '#2e7d32' : '#f25600' } 
              }} 
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'right' }}>
              Período: {new Date(goal.fecha_inicio || goal.start_date).toLocaleDateString()} - {new Date(goal.fecha_fin || goal.end_date).toLocaleDateString()}
            </Typography>

            {/* Cartel de éxito si la meta está completada */}
            {isCompleted && (
              <Box 
                sx={{ 
                  backgroundColor: '#e8f5e9', 
                  color: '#2e7d32', 
                  p: 2, 
                  borderRadius: 2, 
                  mt: 2, 
                  textAlign: 'center',
                  border: '1px solid #a5d6a7'
                }}
              >
                <Typography fontWeight="bold">
                  ¡Meta alcanzada exitosamente! 🎉
                </Typography>
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
                    textTransform: 'none'
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
              value={formData.target_books}
              onChange={(e) => setFormData({ ...formData, target_books: parseInt(e.target.value) || 1 })}
              fullWidth
            />
            
            {/* FECHA DE INICIO CON BLOQUEO A PARTIR DE MAÑANA */}
            <TextField
              label="Fecha de inicio"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: fechaMananaStr }} // <-- Deshabilita hoy y días pasados
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              fullWidth
            />

            {/* FECHA DE FIN CON BLOQUEO A PARTIR DE LA FECHA DE INICIO ELEGIDA */}
            <TextField
              label="Fecha de fin"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formData.start_date || fechaMananaStr }} // <-- Garantiza que sea posterior al inicio
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleCreateGoal} variant="contained" sx={{ backgroundColor: '#f25600', '&:hover': { backgroundColor: '#cc4800' } }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ReadingGoalsSection;