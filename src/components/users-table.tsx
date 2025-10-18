'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserWithStats } from '@/types/user';
import { toggleUserStatus } from '@/app/actions/users';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface UsersTableProps {
  users: UserWithStats[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [localUsers, setLocalUsers] = useState(users);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserStatus(userId, !currentStatus);

    if (result.error) {
      toast.error(result.error);
    } else {
      setLocalUsers(
        localUsers.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
    }
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>API Keys</TableHead>
            <TableHead>Total Requests</TableHead>
            <TableHead>Total Duration</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No users found. Create your first user to get started.
              </TableCell>
            </TableRow>
          ) : (
            localUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.companyName || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{user.apiKeysCount}</TableCell>
                <TableCell>{user.totalRequests?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  {user.totalDurationSeconds
                    ? `${(user.totalDurationSeconds / 60).toFixed(2)} min`
                    : '0 min'}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/users/${user.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.isActive)}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
