import { Suspense } from 'react';
import { DateRangeFilter, getApiKeysByUserId, getUserById } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { CreateApiKeyDialog } from '@/components/create-api-key-dialog';
import { ApiKeysTable } from '@/components/api-keys-table';
import { PeriodFilterAdvanced } from '@/components/period-filter';
import { UserStatsCards } from '@/components/user-stats-cards';
import { ApiKeysTableSkeleton, StatsCardsSkeleton } from '@/components/stats-skeleton';
import { BackButton } from '@/components/back-button';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

async function UserStats({ userId, dateRange }: { userId: string; dateRange?: DateRangeFilter }) {
  const apiKeys = await getApiKeysByUserId(userId, dateRange);

  const totalRequests = Number(apiKeys.reduce((sum, key) => sum + key.requestCount, 0));
  const totalDuration = Number(apiKeys.reduce((sum, key) => sum + key.totalDuration, 0));

  const user = await getUserById(userId);
  if (!user) return null;

  return (
    <>
      <UserStatsCards user={user} totalRequests={totalRequests} totalDuration={totalDuration} />

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold">API Keys</h2>
          <div className="flex items-center gap-4">
            <PeriodFilterAdvanced userId={userId} />
            <CreateApiKeyDialog userId={userId} />
          </div>
        </div>
        <ApiKeysTable apiKeys={apiKeys} />
      </div>
    </>
  );
}

export default async function UserDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from, to } = await searchParams;

  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const dateRange: DateRangeFilter | undefined =
    from && to
      ? {
          from: new Date(from),
          to: new Date(to),
        }
      : undefined;

  const suspenseKey = dateRange
    ? `${dateRange.from.toISOString()}-${dateRange.to.toISOString()}`
    : 'all';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BackButton fallback="/users" />
        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            {user.companyName || 'User Details'}
          </h1>
          <p className="text-sm text-white/70">View user information and API keys</p>
        </div>
      </div>

      <Suspense
        key={suspenseKey}
        fallback={
          <>
            <StatsCardsSkeleton />
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold">API Keys</h2>
                <div className="flex items-center gap-4">
                  <PeriodFilterAdvanced userId={id} />
                  <CreateApiKeyDialog userId={id} />
                </div>
              </div>
              <ApiKeysTableSkeleton />
            </div>
          </>
        }
      >
        <UserStats userId={id} dateRange={dateRange} />
      </Suspense>
    </div>
  );
}
