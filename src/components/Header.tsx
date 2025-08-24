// src/components/Header.tsx
'use client';

import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/app/context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: 'light' as const, label: 'روشن', icon: SunIcon },
    { key: 'dark' as const, label: 'تیره', icon: MoonIcon },
    { key: 'green' as const, label: 'طبیعی', icon: GlobeAltIcon },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[0];
  const nextTheme = themes[(themes.findIndex(t => t.key === theme) + 1) % themes.length];

  return (
    <header
      className="w-full p-4 rounded-xl flex justify-between items-center transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-color)',
        boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* سمت راست هدر */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <button onClick={onMenuClick} aria-label="باز کردن منو">
            <Bars3Icon
              className="w-7 h-7 cursor-pointer"
              style={{ color: 'var(--accent-color)' }}
            />
          </button>
        )}
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--accent-color)' }}
        >
          داشبورد مدیریت
        </h1>
      </div>

      {/* سمت چپ هدر */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(nextTheme.key)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10"
          title={`تغییر به تم ${nextTheme.label}`}
          style={{
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-color)',
          }}
        >
          <span className="text-sm font-semibold hidden sm:inline">
            {currentTheme.label}
          </span>
          <currentTheme.icon 
            className="w-5 h-5" 
            style={{ color: 'var(--accent-color)' }}
          />
        </button>

        {/* User Menu */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-color)]">
              <span className="sr-only">باز کردن منوی کاربری</span>
              <img
                src="/user-avatar.jpg"
                alt="آواتار کاربر"
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-[var(--border-color)] rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-[var(--accent-color-light)] text-[var(--accent-color)]' : 'text-[var(--text-color)]'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm justify-end`}
                      onClick={() => router.push('/profile')}
                    >
                      <span className="mr-2 font-semibold">پروفایل کاربری</span>
                      <UserCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/settings')}
                      className={`${
                        active ? 'bg-[var(--accent-color-light)] text-[var(--accent-color)]' : 'text-[var(--text-color)]'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm justify-end`}
                    >
                      <span className="mr-2 font-semibold">تنظیمات</span>
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/login')}
                      className={`${
                        active ? 'bg-red-500/20 text-red-500' : 'text-red-500'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm justify-end`}
                    >
                      <span className="mr-2 font-semibold">خروج از حساب</span>
                      <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
