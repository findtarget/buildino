// src/components/Sidebar.tsx
'use client';

// F: آیکون‌های مورد نیاز از جمله BuildingOfficeIcon اینجا هستند
import { HomeIcon, BuildingOfficeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
  open?: boolean;
}

// F: آرایه منو که شامل "مدیریت واحدها" نیز می‌باشد
const menuItems = [
  { label: 'داشبورد', icon: HomeIcon, href: '/dashboard' },
  { label: 'مدیریت واحدها', icon: BuildingOfficeIcon, href: '/units' },
  { label: 'گزارش‌ها', icon: ChartBarIcon, href: '/reports' },
];

export default function Sidebar({
  mobile = false,
  onClose,
  open = false
}: SidebarProps) {
  const isMobileDevice = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const pathname = usePathname();

  // برای سایدبار دسکتاپ، در دستگاه موبایل رندر نشود
  if (!mobile && isMobileDevice) {
    return null;
  }

  // برای سایدبار موبایل، در دستگاه دسکتاپ رندر نشود
  if (mobile && !isMobileDevice) {
    return null;
  }

  const handleNavigation = (href: string) => {
    router.push(href);
    if (onClose) {
      onClose();
    }
  };

  const NavLinks = () => (
    <nav className="space-y-4">
      {menuItems.map((item) => {
        // F: منطق تشخیص لینک فعال که مسیر روت ('/') را معادل '/dashboard' در نظر می‌گیرد
        const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
        return (
          <button
            key={item.href}
            onClick={() => handleNavigation(item.href)}
            className={`flex items-center justify-end w-full gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive ? 'bg-[var(--accent-color-light)]' : 'bg-transparent hover:bg-white/5'
            }`}
            style={{
              color: isActive ? 'var(--accent-color)' : 'var(--text-color)',
              boxShadow: isActive ? 'inset 2px 2px 5px var(--shadow-light), inset -2px -2px 5px var(--shadow-dark)' : 'none',
            }}
          >
            <span className="font-semibold">{item.label}</span>
            <item.icon
              className="w-6 h-6"
              style={{ color: 'var(--accent-color)' }}
            />
          </button>
        );
      })}
    </nav>
  );

  // سایدبار دسکتاپ
  if (!mobile) {
    return (
      <aside
        className="h-full w-64 p-6 transition-colors duration-300 flex-shrink-0 hidden md:flex md:flex-col" // F: اضافه کردن کلاس‌های فلکس برای اطمینان از چیدمان
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-color)',
          boxShadow: '4px 0px 20px -10px var(--shadow-light)'
        }}
      >
        <h2
          className="text-2xl font-bold mb-12 text-right"
          style={{ color: 'var(--accent-color)' }}
        >
          Buildino
        </h2>
        <NavLinks />
      </aside>
    );
  }

  // سایدبار موبایل (با انیمیشن)
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop با افکت "شیشه مات" */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* پنل سایدبار */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-64 p-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-color)',
              boxShadow: '-4px 0px 20px -10px var(--shadow-light)',
            }}
          >
            <h2
              className="text-2xl font-bold mb-12 text-right"
              style={{ color: 'var(--accent-color)' }}
            >
              Buildino
            </h2>
            <NavLinks />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
