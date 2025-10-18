import { getAnalytics } from '@/lib/db/queries';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-white/70">View system usage and resource consumption</p>
      </div>

      <AnalyticsDashboard analytics={analytics} />
    </div>
  );
}
