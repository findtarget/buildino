// src/app/ClientLayoutWrapper.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SettingsPanel from '@/components/SettingsPanel';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const noLayoutRoutes = ['/login'];

  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="flex h-screen"
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        {/* سایدبار دسکتاپ */}
        <Sidebar />

        {/* سایدبار موبایل (کاملا کنترل شده) */}
        <Sidebar
          mobile
          open={isMobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        
        {/* F: این کانتینر جدید، فاصله‌گذاری هدر و محتوا را مدیریت می‌کند */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 gap-6">
          <Header onMenuClick={() => setMobileSidebarOpen(true)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>

        {/* پنل تنظیمات به صورت سراسری در لایه اصلی */}
        <SettingsPanel />
      </div>
    </>
  );
}
