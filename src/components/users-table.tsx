'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Ban, CheckCircle, Eye, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserWithStats } from '@/types/user';
import { deleteUserAction, toggleUserStatusAction } from '@/app/actions/users';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface UsersTableProps {
  users: UserWithStats[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [localUsers, setLocalUsers] = useState(initialUsers);
  const router = useRouter();

  const handleRowOpen = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handleKeyOpen = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowOpen(userId);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserStatusAction(userId, !currentStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      setLocalUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUserAction(userId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setLocalUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted');
    }
  };

  return (
    <div className="space-y-4">
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
                <TableRow
                  key={user.id}
                  onClick={() => handleRowOpen(user.id)} // ⬅️ переход по клику на строку
                  onKeyDown={(e) => handleKeyOpen(e, user.id)} // ⬅️ доступность с клавиатуры
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-muted/40 focus:bg-muted/40 focus:outline-none"
                >
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

                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()} // ⬅️ клики в ячейке Actions не уводят со строки
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()} // ⬅️ важно
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                          <Link href={`/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(user.id, user.isActive);
                          }}
                        >
                          {user.isActive ? (
                            <>
                              <Ban className="h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
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
    </div>
  );
}
