import { DashboardLayout } from '@/components/dashboard-layout';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
