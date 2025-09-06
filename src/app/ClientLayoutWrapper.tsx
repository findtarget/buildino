// src/app/ClientLayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useEffect, useState } from 'react';

// مسیرهایی که نباید Header و Sidebar داشته باشند
const NO_LAYOUT_ROUTES = ['/login', '/register'];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isClient, setIsClient] = useState(false);

  // این useEffect برای جلوگیری از hydration mismatch لازم است
  // چون usePathname در رندر اولیه سرور ممکن است با کلاینت متفاوت باشد
  useEffect(() => {
    setIsClient(true);
  }, []);

  // اگر در سمت سرور یا قبل از hydration هستیم، یا مسیر جزو صفحات بدون layout است، فقط children را نمایش بده
  if (!isClient || NO_LAYOUT_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // اگر مسیر جزو صفحات داشبورد است، Layout کامل را نمایش بده
  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* سایدبار برای دسکتاپ */}
      {!isMobile && <Sidebar />}

      {/* محتوای اصلی */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* هدر در اینجا قرار می‌گیرد تا فقط در صفحات داخلی نمایش داده شود */}
        <Header />
        {children}
      </main>
    </div>
  );
}
