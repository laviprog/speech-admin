'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCardsSkeleton } from '@/components/stats-skeleton';
import { User } from '@/types/user';

interface UserStatsCardsProps {
  user: User;
  totalRequests: number;
  totalDuration: number;
}

function UserStatsCardsContent({ user, totalRequests, totalDuration }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className="text-lg" variant={user.isActive ? 'default' : 'secondary'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Total Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Processing Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(totalDuration / 60).toFixed(2)} min</div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserStatsCards(props: UserStatsCardsProps) {
  return (
    <Suspense fallback={<StatsCardsSkeleton />}>
      <UserStatsCardsContent {...props} />
    </Suspense>
  );
}
