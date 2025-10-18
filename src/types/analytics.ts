export interface Analytics {
  totalRequests: number;
  totalDurationSeconds: number;
  activeUsers: number;
  totalApiKeys: number;
  tasksByStatus: Record<string, number>;
  topUsers: Array<{
    id: string;
    companyName: string | null;
    requestCount: number;
    totalDuration: number;
  }>;
}
