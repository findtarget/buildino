// src/app/settings/page.tsx - فقط بخش‌های مشکل‌دار اصلاح شده
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ChargeCategory } from '@/types/charge';
import { defaultChargeCategories } from '@/lib/chargeCalculator';
import { toPersianDigits, toEnglishDigits } from '@/lib/utils';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

const tabs = [
  { id: 'appearance', label: 'ظاهر و تم', icon: PaintBrushIcon },
  { id: 'charges', label: 'تنظیمات شارژ', icon: CurrencyDollarIcon },
  { id: 'profile', label: 'پروفایل', icon: UserCircleIcon },
  { id: 'notifications', label: 'اعلان‌ها', icon: BellIcon },
  { id: 'security', label: 'امنیت', icon: ShieldCheckIcon },
];

const themes = [
  { key: 'light' as const, label: 'روشن', icon: SunIcon, color: '#3b82f6' },
  { key: 'dark' as const, label: 'تیره', icon: MoonIcon, color: '#6b7280' },
  { key: 'green' as const, label: 'طبیعی', icon: GlobeAltIcon, color: '#059669' },
];

const calculationTypeLabels = {
  'fixed': 'ثابت',
  'perArea': 'بر اساس متراژ',
  'perUnit': 'بر اساس واحد'
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('charges');
  const [chargeCategories, setChargeCategories] = useState<ChargeCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<ChargeCategory | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // بارگذاری تنظیمات شارژ از localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('chargeCategories');
    if (savedCategories) {
      setChargeCategories(JSON.parse(savedCategories));
    } else {
      setChargeCategories(defaultChargeCategories);
    }
  }, []);

  // ذخیره تنظیمات شارژ
  const saveChargeCategories = (categories: ChargeCategory[]) => {
    setChargeCategories(categories);
    localStorage.setItem('chargeCategories', JSON.stringify(categories));
  };

  // حذف دسته
  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = chargeCategories.filter(cat => cat.id !== categoryId);
    saveChargeCategories(updatedCategories);
  };

  // تغییر وضعیت فعال/غیرفعال دسته
  const handleToggleCategory = (categoryId: string) => {
    const updatedCategories = chargeCategories.map(cat =>
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    );
    saveChargeCategories(updatedCategories);
  };

  // ذخیره ویرایش دسته
  const handleSaveCategory = (category: ChargeCategory) => {
    // 🔧 اصلاح: اگر دسته جدیده، اضافه کن - اگر موجوده، ویرایش کن
    const existingIndex = chargeCategories.findIndex(cat => cat.id === category.id);
    
    let updatedCategories;
    if (existingIndex >= 0) {
      // دسته موجود - ویرایش
      updatedCategories = chargeCategories.map(cat =>
        cat.id === category.id ? category : cat
      );
    } else {
      // دسته جدید - اضافه کردن
      updatedCategories = [...chargeCategories, category];
    }
    
    saveChargeCategories(updatedCategories);
    setEditingCategory(null);
  };

  // بازگردانی به حالت پیش‌فرض
  const handleResetToDefault = () => {
    saveChargeCategories(defaultChargeCategories);
    setShowResetModal(false);
  };

  // فرمت کردن عدد برای نمایش (با جداکننده و فارسی)
  const formatNumber = (num: number): string => {
    return toPersianDigits(num.toLocaleString('fa-IR'));
  };

  // 🔧 اصلاح: افزودن دسته جدید
  const handleAddNewCategory = () => {
    const newCategory: ChargeCategory = {
      id: `custom_${Date.now()}`,
      title: 'دسته جدید',
      description: 'توضیحات دسته جدید',
      baseAmount: 100000,
      calculationType: 'fixed',
      includeParking: false,
      commercialMultiplier: 1.0,
      isActive: true,
    };
    setEditingCategory(newCategory);
  };

  const renderChargesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
          دسته‌بندی‌های شارژ
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
              backgroundColor: 'var(--bg-color)',
            }}
          >
            بازگردانی به پیش‌فرض
          </button>
          <button
            onClick={handleAddNewCategory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'white',
            }}
          >
            <PlusIcon className="w-4 h-4" />
            افزودن دسته
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* 🔧 اصلاح: نمایش فرم دسته جدید در بالا اگر در حال ویرایش باشیم */}
        {editingCategory && !chargeCategories.find(cat => cat.id === editingCategory.id) && (
          <div
            className="p-4 rounded-xl border-2 border-dashed"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--accent-color)',
            }}
          >
            <div className="mb-3">
              <h4 className="font-semibold text-green-600">دسته جدید</h4>
            </div>
            <EditCategoryForm
              category={editingCategory}
              onSave={handleSaveCategory}
              onCancel={() => setEditingCategory(null)}
              onChange={setEditingCategory}
            />
          </div>
        )}

        {chargeCategories.map((category) => (
          <div
            key={category.id}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: category.isActive ? 'var(--bg-secondary)' : 'var(--bg-color)',
              borderColor: 'var(--border-color)',
              opacity: category.isActive ? 1 : 0.6,
            }}
          >
            {editingCategory?.id === category.id ? (
              <EditCategoryForm
                category={editingCategory}
                onSave={handleSaveCategory}
                onCancel={() => setEditingCategory(null)}
                onChange={setEditingCategory}
              />
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={category.isActive}
                      onChange={() => handleToggleCategory(category.id)}
                      className="rounded"
                    />
                    <h4 className="font-semibold" style={{ color: 'var(--text-color)' }}>
                      {category.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{category.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span style={{ color: 'var(--text-color)' }}>
                      مبلغ پایه: {formatNumber(category.baseAmount)} تومان
                    </span>
                    <span style={{ color: 'var(--text-color)' }}>
                      نحوه محاسبه: {calculationTypeLabels[category.calculationType]}
                    </span>
                    {category.commercialMultiplier > 1 && (
                      <span style={{ color: 'var(--text-color)' }}>
                        ضریب تجاری: {toPersianDigits(category.commercialMultiplier.toString())}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 rounded-lg transition-colors hover:bg-blue-100"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-100 text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* مودال تایید ریست */}
      <ConfirmDeleteModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetToDefault}
        title="بازگردانی تنظیمات"
        message="آیا مطمئن هستید که می‌خواهید تمامی تنظیمات شارژ را به حالت پیش‌فرض بازگردانید؟ این عمل تمامی تغییرات شما را حذف خواهد کرد."
      />
    </div>
  );

  // باقی کد بدون تغییر...
  const renderTabContent = () => {
    switch (activeTab) {
      case 'charges':
        return renderChargesTab();

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                انتخاب تم
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                      theme === t.key ? 'scale-105' : 'hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: theme === t.key ? 'var(--accent-color-light)' : 'var(--bg-secondary)',
                      borderColor: theme === t.key ? 'var(--accent-color)' : 'var(--border-color)',
                      boxShadow: theme === t.key 
                        ? '0 8px 25px var(--shadow-light)' 
                        : '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)',
                    }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <t.icon 
                        className="w-8 h-8" 
                        style={{ color: theme === t.key ? 'var(--accent-color)' : 'var(--text-color)' }}
                      />
                      <span 
                        className="font-semibold"
                        style={{ color: theme === t.key ? 'var(--accent-color)' : 'var(--text-color)' }}
                      >
                        {t.label}
                      </span>
                      {theme === t.key && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                تنظیمات نمایش
              </h3>
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-color)' }}>نمایش انیمیشن‌ها</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                اطلاعات کاربری
              </h3>
              <div 
                className="p-4 rounded-xl space-y-4"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <p className="text-sm text-gray-500">این بخش به زودی اضافه خواهد شد.</p>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                مدیریت اعلان‌ها
              </h3>
              <div 
                className="p-4 rounded-xl space-y-4"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <p className="text-sm text-gray-500">این بخش به زودی اضافه خواهد شد.</p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                تنظیمات امنیتی
              </h3>
              <div 
                className="p-4 rounded-xl space-y-4"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <p className="text-sm text-gray-500">این بخش به زودی اضافه خواهد شد.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--accent-color)' }}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent-color)' }}>
            تنظیمات
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div 
              className="rounded-xl p-4 space-y-2"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)',
                border: '1px solid var(--border-color)',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id ? 'scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--accent-color-light)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-color)',
                  }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div 
              className="rounded-xl p-6"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)',
                border: '1px solid var(--border-color)',
              }}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت فرم ویرایش دسته - بدون تغییر
function EditCategoryForm({ 
  category, 
  onSave, 
  onCancel, 
  onChange 
}: {
  category: ChargeCategory;
  onSave: (category: ChargeCategory) => void;
  onCancel: () => void;
  onChange: (category: ChargeCategory) => void;
}) {
  // تبدیل مقدار عددی به فارسی برای نمایش
  const formatInputValue = (value: number): string => {
    return toPersianDigits(value.toLocaleString('fa-IR'));
  };

  // پردازش ورودی کاربر (تبدیل اعداد فارسی و حذف جداکننده)
  const handleNumberInput = (value: string): number => {
    const englishValue = toEnglishDigits(value);
    const cleanValue = englishValue.replace(/,/g, '');
    return parseInt(cleanValue) || 0;
  };

  const handleFloatInput = (value: string): number => {
    const englishValue = toEnglishDigits(value);
    const cleanValue = englishValue.replace(/,/g, '');
    return parseFloat(cleanValue) || 0;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>
            عنوان دسته
          </label>
          <input
            type="text"
            value={category.title}
            onChange={(e) => onChange({ ...category, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>
            مبلغ پایه (تومان)
          </label>
          <input
            type="text"
            value={formatInputValue(category.baseAmount)}
            onChange={(e) => onChange({ ...category, baseAmount: handleNumberInput(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border text-right"
            style={{
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
            }}
            placeholder="۰"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>
          توضیحات
        </label>
        <textarea
          value={category.description}
          onChange={(e) => onChange({ ...category, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-color)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-color)',
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>
            نحوه محاسبه
          </label>
          <select
            value={category.calculationType}
            onChange={(e) => onChange({ ...category, calculationType: e.target.value as any })}
            className="w-full px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
            }}
          >
            <option value="fixed">ثابت</option>
            <option value="perArea">بر اساس متراژ</option>
            <option value="perUnit">بر اساس واحد</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>
            ضریب تجاری
          </label>
          <input
            type="text"
            value={toPersianDigits(category.commercialMultiplier.toString())}
            onChange={(e) => onChange({ ...category, commercialMultiplier: handleFloatInput(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border text-right"
            style={{
              backgroundColor: 'var(--bg-color)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
            }}
            placeholder="۱.۰"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeParking"
            checked={category.includeParking}
            onChange={(e) => onChange({ ...category, includeParking: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="includeParking" className="mr-2 text-sm" style={{ color: 'var(--text-color)' }}>
            شامل پارکینگ
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => onSave(category)}
          className="px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          ذخیره
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border transition-colors"
          style={{
            borderColor: 'var(--border-color)',
            color: 'var(--text-color)',
            backgroundColor: 'var(--bg-color)',
          }}
        >
          لغو
        </button>
      </div>
    </div>
  );
}
