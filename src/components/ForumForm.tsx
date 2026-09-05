// src/components/ForumForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import type { Forum } from '../types';

interface ForumFormData {
  titulo: string;
  descripcion: string;
  foro_id?: number;
  [key: string]: unknown;
}

interface ForumFormProps {
  forumToEdit?: Forum | null;
  title: string;
  onSave: (data: ForumFormData) => void;
  onCancel: () => void;
}

const ForumForm = ({ forumToEdit, title, onSave, onCancel }: ForumFormProps) => {
  const [titulo, setTitulo] = useState<string>(forumToEdit?.titulo || '');
  const [descripcion, setDescripcion] = useState<string>(forumToEdit?.descripcion || '');

  useEffect(() => {
    if (forumToEdit) {
      setTitulo(forumToEdit.titulo || '');
      setDescripcion(forumToEdit.descripcion || '');
    } else {
      // Limpiar estados si estamos en modo creación
      setTitulo('');
      setDescripcion('');
    }
  }, [forumToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!titulo || !descripcion) return;
    const isEditing = !!forumToEdit;

    const dataToSend: ForumFormData = {
      titulo,
      descripcion,
      // 3. Incluir el ID si estamos editando (necesario para la API PUT)
      ...(isEditing && forumToEdit && { foro_id: forumToEdit.foro_id }),

      // Nota: El creador_id es manejado por el Dashboard solo en el POST de creación.
    };

    // Llama al handler unificado (handleSaveForum) en Dashboard
    onSave(dataToSend);
  };

  return (
    <Paper sx={{ p: 4, width: '90%', maxWidth: 500 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {/* Mostrar el título recibido, que es dinámico */}
        {title}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          fullWidth
          multiline
          rows={3}
          required
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onCancel} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" sx={{ backgroundColor: 'button.main' }}>
            Guardar Cambios
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ForumForm;