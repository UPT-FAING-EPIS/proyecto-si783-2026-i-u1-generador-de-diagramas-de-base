'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { initApiClient } from '@/lib/api/client';
import { useConnectionStore } from '@/lib/store/useConnectionStore';

export function ClientInitProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { activeConnection } = useConnectionStore();

  useEffect(() => {
    initApiClient().then(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      if (!activeConnection && pathname !== '/connect') {
        router.push('/connect');
      } else if (activeConnection && pathname === '/connect') {
        router.push('/dashboard');
      }
    }
  }, [isReady, activeConnection, pathname, router]);

  if (!isReady || (!activeConnection && pathname !== '/connect')) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 font-medium">Iniciando entorno local...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
