// src/components/RadioPlayer.tsx
import React from 'react';
import { useRadio } from '@/hooks/useRadio';

interface RadioPlayerProps {
  esDocenteOAdmin?: boolean;
}

export const RadioPlayer = ({ esDocenteOAdmin }: RadioPlayerProps) => {
  const { programa, loading, error } = useRadio();

  if (loading) return <div>Cargando transmisión...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>{programa.programa}</h3>
      {programa.locutor && <p>Con: {programa.locutor}</p>}
    </div>
  );
};