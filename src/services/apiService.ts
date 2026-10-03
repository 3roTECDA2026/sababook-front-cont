// src/services/apiService.ts
import { API_BASE_URL } from '@/environments/api';
import type { Book, Medal, BookFilters, ReadingGoal } from '@/types';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config: RequestInit = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in request to ${endpoint}:`, error);
    throw error;
  }
}

// ========== BOOKS AND FILTERS ==========

export async function getBookCatalog(): Promise<Book[]> {
  return await apiRequest<Book[]>('/books');
}

export async function searchBooks(filters: BookFilters = {}): Promise<Book[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.append(key, value.trim());
    }
  });

  const queryString = params.toString();
  const endpoint = queryString ? `/books/search?${queryString}` : '/books/search';

  return await apiRequest<Book[]>(endpoint);
}

export async function getBookById(bookId: number | string): Promise<Book> {
  return await apiRequest<Book>(`/books/${bookId}`);
}

export async function getUserMedals(userId: number | string): Promise<Medal[]> {
  return await apiRequest<Medal[]>(`/medal/${userId}`);
}

export async function getCatalogMedals(userId: number | string): Promise<Medal[]> {
  return await apiRequest<Medal[]>(`/medal/catalog/${userId}`);
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ========== READING GOALS ==========

interface CreateGoalData {
  userId: number | string;
  periodName?: string;
  targetBooks: number;
  startDate: string;
  endDate: string;
}

export async function getActiveReadingGoal(userId: number | string): Promise<ReadingGoal | null> {
  if (!userId) return null;
  return await apiRequest<ReadingGoal>(`/reading-goals/user/${userId}`, {
    headers: getAuthHeaders(),
  });
}

export async function createReadingGoal(goalData: CreateGoalData): Promise<ReadingGoal> {
  const payload = {
    userId: Number(goalData.userId),
    periodName: goalData.periodName || 'Personal Goal',
    targetBooks: Number(goalData.targetBooks),
    startDate: goalData.startDate,
    endDate: goalData.endDate,
  };

  return await apiRequest<ReadingGoal>('/reading-goals', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function logBookProgress(bookId: number | string): Promise<ReadingGoal> {
  return await apiRequest<ReadingGoal>('/reading-goals/log-book', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId }),
  });
}

export async function getAllReadingGoals(): Promise<ReadingGoal[]> {
  return await apiRequest<ReadingGoal[]>('/reading-goals', {
    headers: getAuthHeaders(),
  });
}

export async function updateReadingGoal(
  goalId: number | string,
  goalData: Partial<ReadingGoal>
): Promise<ReadingGoal> {
  return await apiRequest<ReadingGoal>(`/reading-goals/${goalId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData),
  });
}

export async function deleteReadingGoal(goalId: number | string): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>(`/reading-goals/${goalId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}