'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ fallback = '/users' }: { fallback?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
}
