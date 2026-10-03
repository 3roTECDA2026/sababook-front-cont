export interface User {
  userId: number | string;
  name: string;
  email: string;
  roleId?: number;
  role?: string | null;
  registrationDate?: string;
  isProfileComplete?: boolean;
  avatarUrl?: string | null;
  educationalLevel?: string | null;
}