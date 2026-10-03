import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";

interface GoalFormProps {
  goalToEdit?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function GoalForm({ goalToEdit, onSave, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    goalId: "",
    periodName: "",
    targetBooks: "",
    endDate: "",
  });

  useEffect(() => {
    if (goalToEdit) {
      const rawEndDate = goalToEdit.endDate || goalToEdit.fecha_fin;
      const formattedDate = rawEndDate
        ? new Date(rawEndDate).toISOString().split("T")[0]
        : "";

      setFormData({
        goalId: goalToEdit.goalId || goalToEdit.meta_id || goalToEdit.id || "",
        periodName: goalToEdit.periodName || goalToEdit.periodo_nombre || "",
        targetBooks: String(goalToEdit.targetBooks || goalToEdit.cantidad_libros || ""),
        endDate: formattedDate,
      });
    }
  }, [goalToEdit]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      ...goalToEdit,
      goalId: formData.goalId ? Number(formData.goalId) : undefined,
      periodName: formData.periodName,
      targetBooks: parseInt(formData.targetBooks, 10) || 0,
      endDate: formData.endDate,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 500,
        mx: "auto",
      }}
    >
      <Typography variant="h5" fontWeight="bold" color="secondary.main" mb={3}>
        {goalToEdit ? "Editar Meta de Lectura" : "Crear Meta de Lectura"}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          label="Período / Nombre de la Meta"
          name="periodName"
          value={formData.periodName}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          type="number"
          label="Objetivo (Cantidad de Libros)"
          name="targetBooks"
          value={formData.targetBooks}
          onChange={handleChange}
          inputProps={{ min: 1 }}
          required
        />

        <TextField
          fullWidth
          type="date"
          label="Fecha de Finalización"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" sx={{ backgroundColor: "button.main" }}>
          Guardar Cambios
        </Button>
      </Box>
    </Box>
  );
}