import { getApiKeysByUserId, getUserById } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiKeysTable } from '@/components/api-keys-table';
import { CreateApiKeyDialog } from '@/components/create-api-key-dialog';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const apiKeys = await getApiKeysByUserId(id);

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requestCount, 0);
  const totalDuration = apiKeys.reduce((sum, key) => sum + key.totalDuration, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{user.companyName || 'User Details'}</h1>
        <p className="text-white/70">View user information and API keys</p>
      </div>

      {/* User info cards */}
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

      {/* API Keys section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">API Keys</h2>
          <CreateApiKeyDialog userId={id} />
        </div>
        <ApiKeysTable apiKeys={apiKeys} />
      </div>
    </div>
  );
}
