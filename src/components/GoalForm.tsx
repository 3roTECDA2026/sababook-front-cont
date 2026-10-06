import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";

interface GoalFormProps {
  goalToEdit?: any; // Podés reemplazar 'any' por tu interfaz de Meta si la tenés
  onSave: (data: any) => void;
  onCancel: () => void;
}

  export default function GoalForm({ goalToEdit, onSave, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    meta_id: "",
    periodo_nombre: "",
    cantidad_libros: "",
    fecha_fin: "",
  });

  // Precargar los datos cuando llega una meta para editar
  useEffect(() => {
    if (goalToEdit) {
      // Formatear la fecha a YYYY-MM-DD para que el input type="date" la reconozca
      const formattedDate = goalToEdit.fecha_fin
        ? new Date(goalToEdit.fecha_fin).toISOString().split("T")[0]
        : "";

      setFormData({
        meta_id: goalToEdit.meta_id || goalToEdit.id || "",
        periodo_nombre: goalToEdit.periodo_nombre || "",
        cantidad_libros: goalToEdit.cantidad_libros || "",
        fecha_fin: formattedDate,
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
      ...formData,
      cantidad_libros: parseInt(formData.cantidad_libros, 10) || 0,
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
          name="periodo_nombre"
          value={formData.periodo_nombre}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          type="number"
          label="Objetivo (Cantidad de Libros)"
          name="cantidad_libros"
          value={formData.cantidad_libros}
          onChange={handleChange}
          inputProps={{ min: 1 }}
          required
        />

        <TextField
          fullWidth
          type="date"
          label="Fecha de Finalización"
          name="fecha_fin"
          value={formData.fecha_fin}
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