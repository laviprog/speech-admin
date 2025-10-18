import { getAnalytics, getUsersWithStats } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Activity, ArrowRight, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const analytics = await getAnalytics();
  const recentUsers = await getUsersWithStats();

  const stats = [
    {
      title: 'Total Users',
      value: recentUsers.length,
      icon: Users,
      description: `${analytics.activeUsers} active`,
      href: '/users',
    },
    {
      title: 'Total Requests',
      value: analytics.totalRequests?.toLocaleString() || '0',
      icon: Activity,
      description: 'All time',
      href: '/analytics',
    },
    {
      title: 'Processing Time',
      value: analytics.totalDurationSeconds
        ? `${(analytics.totalDurationSeconds / 3600).toFixed(1)}h`
        : '0h',
      icon: Clock,
      description: 'Total duration',
      href: '/analytics',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer gap-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-sm mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Users</CardTitle>
          <Link href="/users">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentUsers.slice(0, 5).map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                    <Users className="h-5 w-5 " />
                  </div>
                  <div>
                    <div className="font-medium text-lg">{user.companyName || 'Unnamed User'}</div>
                    <div className="text-sm text-white/70">
                      {user.apiKeysCount} API key{user.apiKeysCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">
                    {user.totalRequests?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-white/70">requests</div>
                </div>
              </Link>
            ))}
            {recentUsers.length === 0 && (
              <div className="text-center py-8">
                No users yet. Create your first user to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Users</span>
              <span className="font-medium">{analytics.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed Tasks</span>
              <span className="font-medium">{analytics.tasksByStatus?.COMPLETED || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Failed Tasks</span>
              <span className="font-medium text-red-600">
                {analytics.tasksByStatus?.FAILED || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
