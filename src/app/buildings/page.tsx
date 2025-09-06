//src/app/buildings/page.tsx

'use client';

import { useState } from 'react';
import { BuildingOffice2Icon, Squares2X2Icon } from '@heroicons/react/24/outline';
import BuildingsTab from './BuildingsTab';
import BlocksTab from './BlocksTab';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'buildings', title: 'ساختمان‌ها', icon: BuildingOffice2Icon },
  { id: 'blocks', title: 'بلوک‌ها / طبقات', icon: Squares2X2Icon }
];

export default function BuildingsPage() {
  const [activeTab, setActiveTab] = useState<'buildings' | 'blocks'>('buildings');

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">مدیریت ساختمان و بلوک‌ها</h1>

      {/* تب‌ها */}
      <div className="flex space-x-1 space-x-reverse mb-8 bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-color)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'buildings' | 'blocks')}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'text-[var(--text-color-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-color)]'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="hidden sm:block">{tab.title}</span>
          </button>
        ))}
      </div>

      {/* محتوا */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'buildings' && <BuildingsTab />}
        {activeTab === 'blocks' && <BlocksTab />}
      </motion.div>
    </div>
  );
}
