export interface Medal {
  medalId: number;
  name: string;
  description: string;
  actionType: string;
  isUnlocked?: boolean;
  unlockedAt?: string | null;
}