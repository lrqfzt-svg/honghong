import { ReactNode } from 'react';
import { RequireAdmin } from '@/components/admin/RequireAdmin';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
