import { Book } from './book';

export interface ReadingList {
  listId: number;
  name: string;
  description?: string;
  isPublic?: boolean;
  userId: number;
  books?: Book[];
}

export interface CreateReadingListInput {
  name: string;
  description?: string;
  isPublic: boolean;
  bookIds?: number[];
}