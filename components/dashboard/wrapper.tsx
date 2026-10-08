'use client';

import { useState } from 'react';
import Sidebar from '@/components/navigation';

interface Props {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: Props) {
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

      <main className="min-w-0 flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
