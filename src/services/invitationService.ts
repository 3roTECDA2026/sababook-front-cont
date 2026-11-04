import { API_BASE_URL } from '@/environments/api';
import type {
  InvitacionValidada,
  ResultadoImportacionInvitaciones,
} from '@/types/invitation';

const parseError = async (response: Response, fallback: string): Promise<string> => {
  const data = await response.json().catch(() => ({}));
  return typeof data?.error === 'string' ? data.error : fallback;
};

export const importarInvitaciones = async (
  archivo: File
): Promise<ResultadoImportacionInvitaciones> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', archivo);

  const response = await fetch(`${API_BASE_URL}/api/v1/invitations/import`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo importar la planilla.'));
  }

  return response.json();
};

export const getInvitacion = async (token: string): Promise<InvitacionValidada> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/invitations/${encodeURIComponent(token)}`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'La invitación no es válida.'));
  }

  return response.json();
};

export const activarInvitacion = async (
  token: string,
  contrasena: string
): Promise<{ message: string; email: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/invitations/${encodeURIComponent(token)}/activate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contrasena }),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo activar la cuenta.'));
  }

  return response.json();
};
