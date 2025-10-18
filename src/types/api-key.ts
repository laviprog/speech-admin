export interface ApiKeyWithStats {
  id: string;
  userId: string;
  keyPrefix: string;
  name: string | null;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  requestCount: number;
  totalDuration: number;
}
