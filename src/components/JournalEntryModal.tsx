// src/components/JournalEntryModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { toPersianDigits, formatCurrency, parseJalaliDate, formatJalaliDate } from '@/lib/utils';
import CustomDatePicker from '@/components/CustomDatePicker';

interface Account {
  id: string;
  code: string;
  title: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
}

interface JournalEntryLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

interface JournalEntryData {
  id?: string;
  entryNumber?: string;
  date: Date;
  description: string;
  reference?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
}

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (journalEntry: JournalEntryData) => Promise<void>;
  accounts: Account[];
  initialData?: JournalEntryData | null;
  mode?: 'create' | 'edit';
}

export default function JournalEntryModal({
  isOpen,
  onClose,
  onSave,
  accounts,
  initialData,
  mode = 'create'
}: JournalEntryModalProps) {
  const [formData, setFormData] = useState<JournalEntryData>({
    date: new Date(),
    description: '',
    reference: '',
    lines: [
      { id: '1', accountId: '', debit: 0, credit: 0, description: '' },
      { id: '2', accountId: '', debit: 0, credit: 0, description: '' }
    ],
    totalDebit: 0,
    totalCredit: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setFormData(initialData);
      } else {
        setFormData({
          date: new Date(),
          description: '',
          reference: '',
          lines: [
            { id: '1', accountId: '', debit: 0, credit: 0, description: '' },
            { id: '2', accountId: '', debit: 0, credit: 0, description: '' }
          ],
          totalDebit: 0,
          totalCredit: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, mode]);

  // محاسبه مجموع بدهکار و بستانکار
  useEffect(() => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      totalDebit,
      totalCredit
    }));
  }, [formData.lines]);

  const handleInputChange = (field: keyof JournalEntryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLineChange = (lineId: string, field: keyof JournalEntryLine, value: any) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map(line => 
        line.id === lineId 
          ? { ...line, [field]: field === 'debit' || field === 'credit' ? Number(value) || 0 : value }
          : line
      )
    }));

    // پاک کردن خطای مربوط به این خط
    if (errors[`line_${lineId}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`line_${lineId}`];
        return newErrors;
      });
    }
  };

  const addLine = () => {
    const newLineId = Date.now().toString();
    setFormData(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        { id: newLineId, accountId: '', debit: 0, credit: 0, description: '' }
      ]
    }));
  };

  const removeLine = (lineId: string) => {
    if (formData.lines.length > 2) {
      setFormData(prev => ({
        ...prev,
        lines: prev.lines.filter(line => line.id !== lineId)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // بررسی تاریخ
    if (!formData.date) {
      newErrors.date = 'تاریخ سند الزامی است';
    }

    // بررسی شرح کلی
    if (!formData.description.trim()) {
      newErrors.description = 'شرح کلی سند الزامی است';
    }

    // بررسی خطوط سند
    let hasValidLines = false;
    formData.lines.forEach((line, index) => {
      if (line.accountId && (line.debit > 0 || line.credit > 0)) {
        hasValidLines = true;
        
        // نمی‌تواند هم بدهکار و هم بستانکار داشته باشد
        if (line.debit > 0 && line.credit > 0) {
          newErrors[`line_${line.id}`] = 'هر خط نمی‌تواند هم بدهکار و هم بستانکار باشد';
        }
      }
    });

    if (!hasValidLines) {
      newErrors.lines = 'حداقل یک خط معتبر برای سند الزامی است';
    }

    // بررسی تراز سند
    if (Math.abs(formData.totalDebit - formData.totalCredit) > 0.01) {
      newErrors.balance = `سند متراز نیست. اختلاف: ${formatCurrency(Math.abs(formData.totalDebit - formData.totalCredit))}`;
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
      // فیلتر کردن خطوط خالی
      const validLines = formData.lines.filter(line => 
        line.accountId && (line.debit > 0 || line.credit > 0)
      );

      await onSave({
        ...formData,
        lines: validLines
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setErrors({ submit: 'خطا در ذخیره سند حسابداری' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccountDisplay = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.title}` : '';
  };

  const isBalanced = Math.abs(formData.totalDebit - formData.totalCredit) < 0.01;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)',
            direction: 'rtl'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-color)] mb-1">
                {mode === 'edit' ? 'ویرایش سند حسابداری' : 'ثبت سند حسابداری جدید'}
              </h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm px-3 py-1 rounded-full ${
                  isBalanced 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {isBalanced ? 'سند متراز است' : 'سند متراز نیست'}
                </span>
                {formData.entryNumber && (
                  <span className="text-sm text-[var(--text-color-muted)]">
                    شماره سند: {toPersianDigits(formData.entryNumber)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6">
              {/* خطاهای عمومی */}
              {(errors.submit || errors.lines || errors.balance) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700 space-y-1">
                      {errors.submit && <p>{errors.submit}</p>}
                      {errors.lines && <p>{errors.lines}</p>}
                      {errors.balance && <p>{errors.balance}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* اطلاعات کلی سند */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    تاریخ سند *
                  </label>
                  <CustomDatePicker
                    selected={formData.date}
                    onChange={(date) => handleInputChange('date', date)}
                    className="w-full"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    شماره مرجع (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={formData.reference || ''}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="شماره فاکتور، چک و غیره..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    شرح کلی *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-[var(--bg-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 ${
                      errors.description 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-[var(--border-color)] focus:ring-blue-500'
                    }`}
                    placeholder="شرح کلی سند حسابداری..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* خطوط سند */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-color)]">
                    خطوط سند حسابداری
                  </h3>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن خط
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border border-[var(--border-color)] rounded-lg overflow-hidden">
                    <thead className="bg-[var(--bg-color)]">
                      <tr>
                        <th className="px-3 py-3 text-right text-sm font-medium text-[var(--text-color)]">
                          حساب
                        </th>
                        <th className="px-3 py-3 text-right text-sm font-medium text-[var(--text-color)]">
                          شرح
                        </th>
                        <th className="px-3 py-3 text-center text-sm font-medium text-[var(--text-color)]">
                          بدهکار (ریال)
                        </th>
                        <th className="px-3 py-3 text-center text-sm font-medium text-[var(--text-color)]">
                          بستانکار (ریال)
                        </th>
                        <th className="px-3 py-3 text-center text-sm font-medium text-[var(--text-color)]">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {formData.lines.map((line, index) => (
                        <tr key={line.id} className="hover:bg-[var(--bg-color)]/50">
                          <td className="px-3 py-3">
                            <select
                              value={line.accountId}
                              onChange={(e) => handleLineChange(line.id, 'accountId', e.target.value)}
                              className="w-full px-2 py-2 border border-[var(--border-color)] rounded bg-[var(--bg-color)] text-[var(--text-color)] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">انتخاب حساب...</option>
                              {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                  {account.code} - {account.title}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="text"
                              value={line.description || ''}
                              onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                              className="w-full px-2 py-2 border border-[var(--border-color)] rounded bg-[var(--bg-color)] text-[var(--text-color)] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="شرح خط..."
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={line.debit || ''}
                              onChange={(e) => handleLineChange(line.id, 'debit', e.target.value)}
                              className="w-full px-2 py-2 border border-[var(--border-color)] rounded bg-[var(--bg-color)] text-[var(--text-color)] text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              step="1000"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={line.credit || ''}
                              onChange={(e) => handleLineChange(line.id, 'credit', e.target.value)}
                              className="w-full px-2 py-2 border border-[var(--border-color)] rounded bg-[var(--bg-color)] text-[var(--text-color)] text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                              min="0"
                              step="1000"
                            />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(line.id)}
                              disabled={formData.lines.length <= 2}
                              className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* خطاهای خطوط */}
                {Object.keys(errors).some(key => key.startsWith('line_')) && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {Object.entries(errors)
                      .filter(([key]) => key.startsWith('line_'))
                      .map(([key, message]) => (
                        <p key={key}>{message}</p>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* خلاصه سند */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-[var(--bg-color)] rounded-lg border border-[var(--border-color)]">
                <div className="text-center">
                  <p className="text-sm text-[var(--text-color-muted)] mb-1">کل بدهکار</p>
                  <p className="font-bold text-[var(--text-color)] text-lg">
                    {formatCurrency(formData.totalDebit)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[var(--text-color-muted)] mb-1">کل بستانکار</p>
                  <p className="font-bold text-[var(--text-color)] text-lg">
                    {formatCurrency(formData.totalCredit)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[var(--text-color-muted)] mb-1">تفاضل</p>
                  <p className={`font-bold text-lg ${
                    Math.abs(formData.totalDebit - formData.totalCredit) < 0.01 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(formData.totalDebit - formData.totalCredit))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[var(--text-color-muted)] mb-1">تعداد خطوط</p>
                  <p className="font-bold text-[var(--text-color)] text-lg">
                    {toPersianDigits(formData.lines.filter(line => line.accountId && (line.debit > 0 || line.credit > 0)).length.toString())}
                  </p>
                </div>
              </div>

              {/* دکمه‌های عملیات */}
              <div className="flex gap-4 justify-end pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isBalanced}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'در حال ذخیره...' : mode === 'edit' ? 'بروزرسانی سند' : 'ثبت سند'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
