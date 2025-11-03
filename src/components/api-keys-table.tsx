'use client';

import { useState } from 'react';
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
import { Ban, CheckCircle, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiKeyWithStats } from '@/types/api-key';
import { deleteApiKeyAction, toggleApiKeyStatusAction } from '@/app/actions/api-keys';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface ApiKeysTableProps {
  apiKeys: ApiKeyWithStats[];
}

export function ApiKeysTable({ apiKeys }: ApiKeysTableProps) {
  const [localApiKeys, setLocalApiKeys] = useState(apiKeys);

  const handleToggleStatus = async (apiKeyId: string, currentStatus: boolean) => {
    const result = await toggleApiKeyStatusAction(apiKeyId, !currentStatus);

    if (result.error) {
      toast.error(result.error);
    } else {
      setLocalApiKeys(
        localApiKeys.map((k) => (k.id === apiKeyId ? { ...k, isActive: !currentStatus } : k))
      );
      toast.success(`API key ${!currentStatus ? 'activated' : 'deactivated'}`);
    }
  };

  const handleDeleteApiKey = async (apiKeyId: string) => {
    const result = await deleteApiKeyAction(apiKeyId);

    if (result.error) {
      toast.error(result.error);
    } else {
      setLocalApiKeys(localApiKeys.filter((k) => k.id !== apiKeyId));
      toast.success('API key deleted');
    }
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key Prefix</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requests</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localApiKeys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No API keys found. Create your first API key to get started.
              </TableCell>
            </TableRow>
          ) : (
            localApiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell className="font-medium">{apiKey.name || 'Unnamed'}</TableCell>
                <TableCell>
                  <code className="text-sm rounded">{apiKey.keyPrefix}...</code>
                </TableCell>
                <TableCell>
                  <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{apiKey.requestCount.toLocaleString()}</TableCell>
                <TableCell>
                  {apiKey.totalDuration ? `${(apiKey.totalDuration / 60).toFixed(2)} min` : '0 min'}
                </TableCell>
                <TableCell>{formatDate(apiKey.lastUsedAt)}</TableCell>
                <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(apiKey.id, apiKey.isActive)}
                      >
                        {apiKey.isActive ? (
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
                      <DropdownMenuItem onClick={() => handleDeleteApiKey(apiKey.id)}>
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
  );
}
