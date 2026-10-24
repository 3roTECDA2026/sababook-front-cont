// src/components/AsistenciaToggle.tsx
import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircleTwoTone';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { AppButton } from '@/components/atoms/AppButton';

interface AsistenciaToggleProps {
  asistencia?: string | null;
  totalAsistentes: number;
  onToggle?: (confirmar: boolean) => void;
  cargando?: boolean;
}

/**
 * Toggle de asistencia (RSVP) para Cafés Literarios.
 * - Sin confirmar: botón primario "Confirmar asistencia".
 * - Confirmado: estado verde + botón sutil "Cancelar" (pide confirmación).
 */
export default function AsistenciaToggle({
  asistencia,
  totalAsistentes,
  onToggle,
  cargando = false,
}: AsistenciaToggleProps) {
  const confirmado = asistencia === 'confirmado' || asistencia === 'asistio';
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  const confirmar = () => {
    setOpenConfirm(false);
    onToggle && onToggle(true);
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        {confirmado ? (
          <AppButton
            size="small"
            variant="text"
            startIcon={<CancelIcon />}
            disabled={cargando}
            onClick={() => setOpenConfirm(true)}
          >
            Cancelar
          </AppButton>
        ) : (
          <AppButton
            variant="primary"
            disabled={cargando}
            loading={cargando}
            startIcon={<CheckCircleIcon />}
            onClick={confirmar}
          >
            Confirmar asistencia
          </AppButton>
        )}

        <Box>
          <Typography
            variant="caption"
            fontWeight="bold"
            color={confirmado ? 'success.main' : 'text.secondary'}
          >
            {confirmado ? 'Asistencia confirmada' : 'No confirmado aún'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
            👥 {Number(totalAsistentes || 0)} confirmados
            {cargando && <CircularProgress size={12} color="primary" />}
          </Typography>
        </Box>
      </Box>

      <ConfirmationModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={() => {
          setOpenConfirm(false);
          onToggle && onToggle(false);
        }}
        title="Cancelar asistencia"
        message="¿Querés cancelar tu asistencia a este Café Literario? Si lo canceláis, te perderás el próximo encuentro."
      />
    </>
  );
}