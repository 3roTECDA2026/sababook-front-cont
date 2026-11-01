// src/services/authService.ts

import { API_BASE_URL } from '@/environments/api';
import { parseJsonResponse } from '@/utils/api';

export interface RegisterPayload {
  nombre: string;
  email: string;
  contrasena: string;
}

export interface RegisterResponse {
  message?: string;
  usuario: {
    usuario_id: number;
    email: string;
  };
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const REGISTER_ERROR = 'No pudimos crear la cuenta. Inténtalo en un momento.';

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(REGISTER_ERROR);
  }

  const data = await parseJsonResponse<
    RegisterResponse & ApiErrorResponse
  >(response);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || REGISTER_ERROR);
  }

  if (!data?.usuario) {
    throw new Error(REGISTER_ERROR);
  }

  return data;
}
