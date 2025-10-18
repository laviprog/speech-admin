'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Analytics } from '@/types/analytics';

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState('7d');

  const stats = [
    {
      title: 'Total Requests',
      value: analytics.totalRequests?.toLocaleString() || '0',
      description: 'All-time API requests',
    },
    {
      title: 'Total Processing Time',
      value: analytics.totalDurationSeconds
        ? `${(analytics.totalDurationSeconds / 3600).toFixed(2)} hrs`
        : '0 hrs',
      description: 'Cumulative processing duration',
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers?.toString() || '0',
      description: 'Users with active status',
    },
    {
      title: 'Total API Keys',
      value: analytics.totalApiKeys?.toString() || '0',
      description: 'Generated API keys',
    },
  ];

  const statusBreakdown = [
    {
      status: 'Completed',
      count: analytics.tasksByStatus?.COMPLETED || 0,
      color: 'text-green-600',
    },
    {
      status: 'In Progress',
      count: analytics.tasksByStatus?.IN_PROGRESS || 0,
      color: 'text-blue-600',
    },
    {
      status: 'Pending',
      count: analytics.tasksByStatus?.PENDING || 0,
      color: 'text-yellow-600',
    },
    {
      status: 'Failed',
      count: analytics.tasksByStatus?.FAILED || 0,
      color: 'text-red-600',
    },
    {
      status: 'Canceled',
      count: analytics.tasksByStatus?.CANCELED || 0,
      color: 'text-white/70',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex justify-end items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card className="gap-2" key={stat.title}>
            <CardHeader>
              <CardTitle className="font-medium text-lg">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-sm text-white/70 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`font-medium text-lg ${item.color}`}>{item.status}</div>
                </div>
                <div className="text-2xl font-bold">{item.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top users by usage */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topUsers?.length > 0 ? (
              analytics.topUsers?.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{user.companyName || 'N/A'}</div>
                      <div className="text-sm">{user.totalDuration} sec processing time</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{user.requestCount.toLocaleString()}</div>
                    <div className="text-xs ">requests</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">No usage data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
