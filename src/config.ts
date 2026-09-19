// src/config.ts
//export const API_BASE_URL = "http://localhost:3000";
// Configuración base del backend
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';