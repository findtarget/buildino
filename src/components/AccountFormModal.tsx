// src/components/AccountFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { AccountType } from '@/types/accounting';

interface Account {
  id?: string;
  code: string;
  title: string;
  titleEn?: string;
  type: AccountType;
  parentId?: string;
  description?: string;
  isActive: boolean;
}

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => Promise<void>;
  account?: Account | null;
  parentAccounts: Array<{ id: string; code: string; title: string; type: AccountType }>;
  mode: 'create' | 'edit';
}

const AccountFormModal = ({
  isOpen,
  onClose,
  onSave,
  account,
  parentAccounts,
  mode
}: AccountFormModalProps) => {
  const [formData, setFormData] = useState<Account>({
    code: '',
    title: '',
    titleEn: '',
    type: AccountType.Asset,
    parentId: '',
    description: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountTypeLabels = {
    [AccountType.Asset]: 'دارایی',
    [AccountType.Liability]: 'بدهی',
    [AccountType.Equity]: 'حقوق صاحبان سهام',
    [AccountType.Revenue]: 'درآمد',
    [AccountType.Expense]: 'هزینه'
  };

  useEffect(() => {
    if (account && mode === 'edit') {
      setFormData({
        id: account.id,
        code: account.code,
        title: account.title,
        titleEn: account.titleEn || '',
        type: account.type,
        parentId: account.parentId || '',
        description: account.description || '',
        isActive: account.isActive
      });
    } else {
      setFormData({
        code: '',
        title: '',
        titleEn: '',
        type: AccountType.Asset,
        parentId: '',
        description: '',
        isActive: true
      });
    }
    setErrors({});
  }, [account, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'کد حساب الزامی است';
    } else if (!/^\d{4,10}$/.test(formData.code)) {
      newErrors.code = 'کد حساب باید عددی و بین ۴ تا ۱۰ رقم باشد';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'نام حساب الزامی است';
    } else if (formData.title.length < 2) {
      newErrors.title = 'نام حساب باید حداقل ۲ کاراکتر باشد';
    }

    if (formData.titleEn && formData.titleEn.length < 2) {
      newErrors.titleEn = 'نام انگلیسی باید حداقل ۲ کاراکتر باشد';
    }

    // بررسی تطابق نوع حساب با والد
    if (formData.parentId) {
      const parent = parentAccounts.find(p => p.id === formData.parentId);
      if (parent && parent.type !== formData.type) {
        newErrors.parentId = 'نوع حساب باید با نوع حساب والد مطابقت داشته باشد';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving account:', error);
      setErrors({ submit: 'خطا در ذخیره حساب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Account, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // پاک کردن خطای مربوط به فیلد
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const filteredParentAccounts = parentAccounts.filter(parent => 
    parent.type === formData.type && parent.id !== formData.id
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'create' ? 'ایجاد حساب جدید' : 'ویرایش حساب'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 ml-2" />
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* کد حساب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد حساب *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 font-mono ${
                  errors.code 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="1001"
                maxLength={10}
                disabled={mode === 'edit'}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* نوع حساب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع حساب *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as AccountType)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.type 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                disabled={mode === 'edit' && account?.id} // نمی‌توان نوع حساب موجود را تغییر داد
              >
                {Object.entries(accountTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* نام حساب (فارسی) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام حساب (فارسی) *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.title 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="صندوق"
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* نام حساب (انگلیسی) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام حساب (انگلیسی)
              </label>
              <input
                type="text"
                value={formData.titleEn}
                onChange={(e) => handleInputChange('titleEn', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.titleEn 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Cash"
                maxLength={100}
                dir="ltr"
              />
              {errors.titleEn && (
                <p className="mt-1 text-sm text-red-600">{errors.titleEn}</p>
              )}
            </div>
          </div>

          {/* حساب والد */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حساب والد
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => handleInputChange('parentId', e.target.value || undefined)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.parentId 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">بدون والد (حساب اصلی)</option>
              {filteredParentAccounts.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.code} - {parent.title}
                </option>
              ))}
            </select>
            {errors.parentId && (
              <p className="mt-1 text-sm text-red-600">{errors.parentId}</p>
            )}
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="توضیحات اختیاری..."
              maxLength={500}
            />
          </div>

          {/* وضعیت فعال/غیرفعال */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="mr-2 text-sm text-gray-700">
              حساب فعال است
            </label>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-4 w-4 ml-2" />
              {isSubmitting ? 'در حال ذخیره...' : mode === 'create' ? 'ایجاد' : 'ویرایش'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountFormModal;
