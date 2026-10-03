// src/utils/api.ts

export const parseJsonResponse = async <T = unknown>(response: Response): Promise<T | null> => {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return null;
  }
};

type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorizedCallback = handler;
};

export const fetchData = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> => {
  try {
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.warn('HTTP 401 Unauthorized: Session expired or invalid token.');
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      return null;
    }

    if (!response.ok) {
      console.warn(`HTTP request failed [${response.status}]: ${response.statusText}`);
    }

    return await parseJsonResponse<T>(response);
  } catch (error) {
    console.error('Network or API call error:', error);
    return null;
  }
};