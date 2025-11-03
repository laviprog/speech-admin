export interface UserWithStats {
  id: string;
  companyName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  apiKeysCount: number;
  totalRequests: number;
  totalDurationSeconds: number;
}

export interface User {
  id: string;
  companyName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
