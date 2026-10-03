export interface ReadingGoal {
  goalId?: number;
  userId: number;
  periodName?: string;
  targetBooks: number;
  readBooks?: number;
  progress?: number;
  startDate: string;
  endDate: string;
}