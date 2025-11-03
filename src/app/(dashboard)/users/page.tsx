import { getUsersWithStats } from '@/lib/db/queries';
import { CreateUserDialog } from '@/components/create-user-dialog';
import { UsersTable } from '@/components/users-table';

export default async function UsersPage() {
  const users = await getUsersWithStats();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-white/70">Manage users and their API access</p>
        </div>
        <CreateUserDialog />
      </div>

      <UsersTable users={users} />
    </div>
  );
}
