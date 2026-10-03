// src/components/ForumForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import type { Forum } from '@/types';

interface ForumFormData {
  title: string;
  description: string;
  forumId?: number;
  [key: string]: unknown;
}

interface ForumFormProps {
  forumToEdit?: Forum | null;
  title: string;
  onSave: (data: ForumFormData) => void;
  onCancel: () => void;
}

const ForumForm = ({ forumToEdit, title: formTitle, onSave, onCancel }: ForumFormProps) => {
  const [title, setTitle] = useState<string>(forumToEdit?.title || (forumToEdit as any)?.titulo || '');
  const [description, setDescription] = useState<string>(forumToEdit?.description || (forumToEdit as any)?.descripcion || '');

  useEffect(() => {
    if (forumToEdit) {
      setTitle(forumToEdit.title || (forumToEdit as any).titulo || '');
      setDescription(forumToEdit.description || (forumToEdit as any).descripcion || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [forumToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !description) return;
    const isEditing = !!forumToEdit;

    const dataToSend: ForumFormData = {
      title,
      description,
      ...(isEditing && forumToEdit && { forumId: forumToEdit.forumId || (forumToEdit as any).foro_id }),
    };

    onSave(dataToSend);
  };

  return (
    <Paper sx={{ p: 4, width: '90%', maxWidth: 500 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {/* Mostrar el título recibido, que es dinámico */}
        {formTitle}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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