'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (isLoading) return;

      if (!user) {
        router.push('/login?from=/admin');
        return;
      }

      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          setIsAdmin(true);
        } else {
          alert('需要管理员权限');
          router.push('/');
        }
      } catch {
        router.push('/');
      } finally {
        setIsChecking(false);
      }
    }

    checkAdmin();
  }, [user, isLoading, router]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">检查权限中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // 已在 effect 中重定向
  }

  return <>{children}</>;
}
