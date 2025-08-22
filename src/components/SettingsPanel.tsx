// src/components/SettingsPanel.tsx
'use client';

import { useTheme } from '@/app/context/ThemeContext';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  XMarkIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useSettings } from '@/app/context/SettingsContext';
import ChargeSettingsPanel from '@/components/ChargeSettingsPanel';

const accordionSections = [
  { id: 'theme', title: 'تغییر تم برنامه', icon: '🎨' },
  { id: 'charges', title: 'مدیریت مبالغ شارژ', icon: '💰' },
  { id: 'profile', title: 'تنظیمات پروفایل', icon: '👤' },
  { id: 'notifications', title: 'اعلان‌ها', icon: '🔔' },
];

const themes = [
  { key: 'light', label: 'روشن', icon: SunIcon },
  { key: 'dark', label: 'تیره', icon: MoonIcon },
  { key: 'green', label: 'طبیعی', icon: GlobeAltIcon },
];

export default function SettingsPanel() {
  const { isSettingsOpen, setSettingsOpen } = useSettings();
  const { theme, setTheme } = useTheme();
  const [openAccordion, setOpenAccordion] = useState<string | null>('theme');

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 max-h-screen overflow-y-auto"
          >
            <div
              className="w-full max-w-4xl mx-auto rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
              }}
            >
              {/* هدر پنل */}
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--bg-secondary)] z-10 pb-2">
                <h2 className="text-xl font-bold" style={{ color: 'var(--accent-color)' }}>
                  ⚙️ تنظیمات سیستم
                </h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* آکاردئون */}
              <div className="space-y-4">
                {accordionSections.map((section) => (
                  <div key={section.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                      className="w-full flex justify-between items-center px-4 py-3 font-semibold text-right hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{section.icon}</span>
                        <span>{section.title}</span>
                      </div>
                      <span className="text-xl">{openAccordion === section.id ? '−' : '+'}</span>
                    </button>

                    <AnimatePresence>
                      {openAccordion === section.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4" style={{ backgroundColor: 'var(--bg-color)' }}>
                            {section.id === 'theme' ? (
                              <div className="flex flex-col gap-4">
                                {/* ردیف آیکون‌ها */}
                                <div className="flex justify-around items-center">
                                  {themes.map((t) => (
                                    <div key={t.key} className="flex flex-col items-center gap-2 p-2 w-1/3">
                                      <t.icon className={`w-8 h-8 transition-colors ${theme === t.key ? 'text-[var(--accent-color)]' : 'text-gray-400'}`} />
                                    </div>
                                  ))}
                                </div>
                                {/* ردیف دکمه‌ها */}
                                <div className="flex justify-around items-center gap-3">
                                   {themes.map((t) => (
                                    <button
                                      key={t.key}
                                      onClick={() => setTheme(t.key as any)}
                                      className={`w-1/3 py-2 rounded-md transition-all text-sm font-semibold ${theme === t.key ? 'text-white' : ''}`}
                                      style={{
                                        backgroundColor: theme === t.key ? 'var(--accent-color)' : 'var(--bg-secondary)',
                                        border: `1px solid ${theme === t.key ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                      }}
                                    >
                                      {t.label}
                                    </button>
                                   ))}
                                </div>
                              </div>
                            ) : section.id === 'charges' ? (
                              <ChargeSettingsPanel />
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  🚧 این بخش به زودی اضافه خواهد شد.
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
