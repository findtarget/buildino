// src/components/ReportSettings.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ReportSettingsProps {
  onSave: (settings: any) => void;
}

interface SettingsSectionProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsSection = ({ icon: Icon, title, description, children }: SettingsSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--bg-color)] rounded-xl p-6 border border-[var(--border-color)] shadow-sm"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-blue-100 rounded-lg p-2">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-[var(--text-color)] text-lg">{title}</h3>
        <p className="text-sm text-[var(--text-color-muted)]">{description}</p>
      </div>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

interface SettingItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingItem = ({ label, description, children }: SettingItemProps) => (
  <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-b-0">
    <div className="flex-1">
      <div className="font-medium text-[var(--text-color)] mb-1">{label}</div>
      {description && (
        <div className="text-sm text-[var(--text-color-muted)]">{description}</div>
      )}
    </div>
    <div className="ml-4">
      {children}
    </div>
  </div>
);

export default function ReportSettings({ onSave }: ReportSettingsProps) {
  const [settings, setSettings] = useState({
    defaultFormat: 'pdf',
    language: 'fa',
    colorScheme: 'default',
    showAnimations: true,
    watermark: false,
    requireApproval: true,
    autoSave: true,
    notifications: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">تنظیمات گزارش‌گیری</h2>
        <p className="text-[var(--text-color-muted)]">
          تنظیمات و ترجیحات خود را برای بهبود تجربه گزارش‌گیری پیکربندی کنید
        </p>
      </div>

      {/* General Settings */}
      <SettingsSection
        icon={Cog6ToothIcon}
        title="تنظیمات عمومی"
        description="تنظیمات اصلی و پیش‌فرض گزارش‌ها"
      >
        <SettingItem 
          label="فرمت پیش‌فرض خروجی"
          description="فرمت پیش‌فرض برای دانلود گزارش‌ها"
        >
          <select 
            value={settings.defaultFormat}
            onChange={(e) => handleSettingChange('defaultFormat', e.target.value)}
            className="px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-color)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
        </SettingItem>

        <SettingItem 
          label="زبان گزارش‌ها"
          description="زبان پیش‌فرض متن و تاریخ‌ها"
        >
          <select 
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-color)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="fa">فارسی</option>
            <option value="en">انگلیسی</option>
          </select>
        </SettingItem>

        <SettingItem 
          label="ذخیره خودکار"
          description="ذخیره خودکار تغییرات هنگام ویرایش گزارش"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>
      </SettingsSection>

      {/* Chart Settings */}
      <SettingsSection
        icon={PaintBrushIcon}
        title="تنظیمات نمودارها"
        description="ظاهر و رفتار نمودارهای گزارش‌ها"
      >
        <SettingItem 
          label="طرح رنگی پیش‌فرض"
          description="رنگ‌بندی پیش‌فرض نمودارها"
        >
          <select 
            value={settings.colorScheme}
            onChange={(e) => handleSettingChange('colorScheme', e.target.value)}
            className="px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-color)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="default">پیش‌فرض</option>
            <option value="colorful">رنگارنگ</option>
            <option value="monochrome">تک‌رنگ</option>
          </select>
        </SettingItem>

        <SettingItem 
          label="نمایش انیمیشن"
          description="فعال‌سازی انیمیشن‌های نمودار"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showAnimations}
              onChange={(e) => handleSettingChange('showAnimations', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>
      </SettingsSection>

      {/* Security Settings */}
      <SettingsSection
        icon={ShieldCheckIcon}
        title="تنظیمات امنیتی"
        description="تنظیمات امنیت و دسترسی گزارش‌ها"
      >
        <SettingItem 
          label="واترمارک روی گزارش‌ها"
          description="اضافه کردن علامت آبی روی گزارش‌های تولید شده"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.watermark}
              onChange={(e) => handleSettingChange('watermark', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>

        <SettingItem 
          label="تایید برای گزارش‌های مالی"
          description="نیاز به تایید مدیر برای دسترسی به گزارش‌های حساس"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireApproval}
              onChange={(e) => handleSettingChange('requireApproval', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>

        <SettingItem 
          label="اعلان‌ها"
          description="دریافت اعلان برای تولید و به‌روزرسانی گزارش‌ها"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-[var(--border-color)]">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          <CheckCircleIcon className="w-5 h-5" />
          ذخیره تنظیمات
        </button>
      </div>
    </div>
  );
}
