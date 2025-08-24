// src/components/EnhancedTransactionFormModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTransaction, TransactionStatus, Vendor, DocumentAttachment } from '@/types/accounting';
import { toPersianDigits, formatJalaliDate, parseJalaliDate } from '@/lib/utils';
import { TransactionService, getNextTransactionNumber } from '@/lib/transactionUtils';
import { defaultChartOfAccounts, categoryAccountMapping } from '@/lib/chartOfAccounts';
import dynamic from 'next/dynamic';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const CustomDatePicker = dynamic(() => import('@/components/CustomDatePicker'), { ssr: false });

interface UnitInfo {
  id: number;
  unitNumber: string;
}

type EnhancedTransactionFormData = Omit<EnhancedTransaction, 'id' | 'date' | 'finalAmount' | 'createdAt' | 'modifiedAt'> & {
  date: Date | null;
  effectiveDate?: Date | null;
  baseAmount: string;
  taxAmount: string;
  discountAmount: string;
};

interface EnhancedTransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EnhancedTransaction, 'id'>) => void;
  initialData: EnhancedTransaction | null;
  transactionType: 'Income' | 'Expense';
  unitsList: UnitInfo[];
  vendorsList: Vendor[];
}

const expenseCategories = ['Repairs', 'Utilities', 'Salaries', 'Cleaning', 'Miscellaneous'];
const incomeCategories = ['MonthlyCharge', 'ParkingRental', 'MiscellaneousIncome'];

const categoryTranslations: { [key: string]: string } = {
  'Repairs': 'تعمیرات و نگهداری',
  'Utilities': 'هزینه قبوض و مشاعات',
  'Salaries': 'حقوق و دستمزد',
  'Cleaning': 'نظافت',
  'Miscellaneous': 'هزینه‌های متفرقه',
  'MonthlyCharge': 'شارژ ماهانه',
  'ParkingRental': 'درآمد اجاره پارکینگ',
  'MiscellaneousIncome': 'درآمد متفرقه'
};

const subCategoryOptions: { [key: string]: string[] } = {
  'Utilities': ['Electricity', 'Gas', 'Water', 'Internet', 'Cleaning'],
  'Repairs': ['Elevator', 'Plumbing', 'Electrical', 'HVAC', 'General'],
  'Salaries': ['Doorman', 'Cleaner', 'Security', 'Maintenance']
};

const subCategoryTranslations: { [key: string]: string } = {
  'Electricity': 'برق',
  'Gas': 'گاز',
  'Water': 'آب',
  'Internet': 'اینترنت',
  'Cleaning': 'نظافت',
  'Elevator': 'آسانسور',
  'Plumbing': 'لوله‌کشی',
  'Electrical': 'برق',
  'HVAC': 'تهویه',
  'General': 'عمومی',
  'Doorman': 'سرایدار',
  'Cleaner': 'نظافتچی',
  'Security': 'نگهبان',
  'Maintenance': 'تعمیرکار'
};

export default function EnhancedTransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  transactionType,
  unitsList,
  vendorsList
}: EnhancedTransactionFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EnhancedTransactionFormData>({
    transactionNumber: '',
    title: '',
    description: '',
    type: transactionType,
    category: transactionType === 'Income' ? 'MonthlyCharge' : 'Repairs',
    subCategory: '',
    baseAmount: '',
    taxAmount: '0',
    discountAmount: '0',
    amount: 0, // Legacy compatibility
    date: new Date(),
    effectiveDate: null,
    relatedUnitId: undefined,
    vendorId: '',
    invoiceNumber: '',
    receiptNumber: '',
    accountCode: '',
    costCenter: '',
    status: TransactionStatus.Draft,
    isCharge: false,
    attachments: [],
    tags: [],
    createdBy: 'current-user' // TODO: Get from auth context
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setCurrentStep(1);
      setAttachments([]);
      
      if (initialData) {
        setFormData({
          ...initialData,
          baseAmount: String(initialData.baseAmount || initialData.finalAmount),
          taxAmount: String(initialData.taxAmount || 0),
          discountAmount: String(initialData.discountAmount || 0),
          date: parseJalaliDate(initialData.date),
          effectiveDate: initialData.effectiveDate ? parseJalaliDate(initialData.effectiveDate) : null
        });
      } else {
        const defaultAccountCode = categoryAccountMapping[transactionType === 'Income' ? 'MonthlyCharge' : 'Repairs'] || '';
        setFormData({
          transactionNumber: getNextTransactionNumber(),
          title: '',
          description: '',
          type: transactionType,
          category: transactionType === 'Income' ? 'MonthlyCharge' : 'Repairs',
          subCategory: '',
          baseAmount: '',
          taxAmount: '0',
          discountAmount: '0',
          amount: 0,
          date: new Date(),
          effectiveDate: null,
          relatedUnitId: undefined,
          vendorId: '',
          invoiceNumber: '',
          receiptNumber: '',
          accountCode: defaultAccountCode,
          costCenter: '',
          status: TransactionStatus.Draft,
          isCharge: transactionType === 'Income' && 'MonthlyCharge' === 'MonthlyCharge',
          attachments: [],
          tags: [],
          createdBy: 'current-user'
        });
      }
    }
  }, [isOpen, initialData, transactionType]);

  // Update account code when category changes
  useEffect(() => {
    if (formData.category && categoryAccountMapping[formData.category]) {
      setFormData(prev => ({ 
        ...prev, 
        accountCode: categoryAccountMapping[formData.category] 
      }));
    }
  }, [formData.category]);

  // Calculate final amount
  const finalAmount = useMemo(() => {
    const base = parseFloat(formData.baseAmount) || 0;
    const tax = parseFloat(formData.taxAmount) || 0;
    const discount = parseFloat(formData.discountAmount) || 0;
    return TransactionService.calculateTotalAmount(base, tax, discount);
  }, [formData.baseAmount, formData.taxAmount, formData.discountAmount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      // Reset subcategory when category changes
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        subCategory: '',
        isCharge: transactionType === 'Income' && value === 'MonthlyCharge'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (field: 'date' | 'effectiveDate') => (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date || null }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'عنوان تراکنش الزامی است';
      if (!formData.baseAmount || parseFloat(formData.baseAmount) <= 0) {
        newErrors.baseAmount = 'مبلغ باید مثبت باشد';
      }
      if (!formData.date) newErrors.date = 'تاریخ الزامی است';
      if (!formData.category) newErrors.category = 'انتخاب دسته‌بندی الزامی است';
    }
    
    if (step === 2) {
      if (!formData.accountCode) newErrors.accountCode = 'انتخاب حساب الزامی است';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1); // Go back to first step with errors
      return;
    }

    const submissionData: Omit<EnhancedTransaction, 'id'> = {
      ...formData,
      baseAmount: parseFloat(formData.baseAmount) || 0,
      taxAmount: parseFloat(formData.taxAmount) || 0,
      discountAmount: parseFloat(formData.discountAmount) || 0,
      finalAmount,
      amount: finalAmount, // Legacy compatibility
      date: formData.date ? formatJalaliDate(formData.date) : '',
      effectiveDate: formData.effectiveDate ? formatJalaliDate(formData.effectiveDate) : undefined,
      relatedUnitId: formData.relatedUnitId ? parseInt(String(formData.relatedUnitId)) : undefined,
      createdAt: initialData?.createdAt || formatJalaliDate(new Date()),
      modifiedAt: initialData ? formatJalaliDate(new Date()) : undefined,
      modifiedBy: initialData ? 'current-user' : undefined,
      // TODO: Handle file uploads and create DocumentAttachment objects
      attachments: []
    };

    onSubmit(submissionData);
    onClose();
  };

  const modalTitle = `${initialData ? 'ویرایش' : 'ثبت'} ${transactionType === 'Income' ? 'درآمد' : 'هزینه'}`;
  const submitButtonClass = transactionType === 'Income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600';
  const categories = transactionType === 'Income' ? incomeCategories : expenseCategories;
  const availableAccounts = defaultChartOfAccounts.filter(acc => 
    acc.level === 4 && acc.isActive && 
    (transactionType === 'Income' ? acc.type === 'Revenue' : acc.type === 'Expense')
  );

  const steps = [
    { id: 1, title: 'اطلاعات اصلی', icon: ClipboardDocumentListIcon },
    { id: 2, title: 'جزئیات حسابداری', icon: BanknotesIcon },
    { id: 3, title: 'مدارک و بررسی', icon: DocumentTextIcon }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-2xl relative"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-right" style={{ color: 'var(--accent-color)' }}>
                {modalTitle}
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-center p-4 border-b border-[var(--border-color)]">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    currentStep >= step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`mx-3 text-sm ${
                    currentStep >= step.id ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-3 ${
                      currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">شماره تراکنش</label>
                        <input
                          name="transactionNumber"
                          value={formData.transactionNumber}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 font-mono text-sm"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">وضعیت تراکنش</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        >
                          <option value={TransactionStatus.Draft}>پیش‌نویس</option>
                          <option value={TransactionStatus.Pending}>در انتظار تایید</option>
                          <option value={TransactionStatus.Approved}>تایید شده</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">عنوان تراکنش *</label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="عنوان تراکنش"
                        className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                      />
                      {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">تاریخ تراکنش *</label>
                        <CustomDatePicker
                          value={formData.date || undefined}
                          onChange={handleDateChange('date')}
                          placeholder="تاریخ تراکنش"
                        />
                        {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">تاریخ اثر (اختیاری)</label>
                        <CustomDatePicker
                          value={formData.effectiveDate || undefined}
                          onChange={handleDateChange('effectiveDate')}
                          placeholder="تاریخ اثر"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">دسته‌بندی *</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {categoryTranslations[category]}
                            </option>
                          ))}
                        </select>
                        {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category}</p>}
                      </div>

                      {subCategoryOptions[formData.category] && (
                        <div>
                          <label className="block text-sm font-medium mb-2">زیر دسته‌بندی</label>
                          <select
                            name="subCategory"
                            value={formData.subCategory || ''}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                          >
                            <option value="">انتخاب کنید</option>
                            {subCategoryOptions[formData.category].map(subCat => (
                              <option key={subCat} value={subCat}>
                                {subCategoryTranslations[subCat] || subCat}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">مبلغ پایه *</label>
                        <input
                          name="baseAmount"
                          type="number"
                          value={formData.baseAmount}
                          onChange={handleChange}
                          placeholder="مبلغ به تومان"
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        />
                        {errors.baseAmount && <p className="text-rose-500 text-xs mt-1">{errors.baseAmount}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">مالیات</label>
                        <input
                          name="taxAmount"
                          type="number"
                          value={formData.taxAmount}
                          onChange={handleChange}
                          placeholder="مالیات"
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">تخفیف</label>
                        <input
                          name="discountAmount"
                          type="number"
                          value={formData.discountAmount}
                          onChange={handleChange}
                          placeholder="تخفیف"
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-700 mb-2">مبلغ نهایی:</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {formatCurrency(finalAmount)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">توضیحات</label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder="توضیحات تراکنش..."
                        className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Accounting Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">حساب *</label>
                      <select
                        name="accountCode"
                        value={formData.accountCode}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                      >
                        <option value="">انتخاب حساب</option>
                        {availableAccounts.map(account => (
                          <option key={account.code} value={account.code}>
                            {account.code} - {account.title}
                          </option>
                        ))}
                      </select>
                      {errors.accountCode && <p className="text-rose-500 text-xs mt-1">{errors.accountCode}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">مرکز هزینه</label>
                        <input
                          name="costCenter"
                          value={formData.costCenter || ''}
                          onChange={handleChange}
                          placeholder="کد مرکز هزینه"
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">واحد مرتبط</label>
                        <select
                          name="relatedUnitId"
                          value={formData.relatedUnitId || ''}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        >
                          <option value="">واحد مرتبط (اختیاری)</option>
                          {unitsList.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              واحد {toPersianDigits(unit.unitNumber)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">تامین‌کننده/پیمانکار</label>
                        <select
                          name="vendorId"
                          value={formData.vendorId || ''}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        >
                          <option value="">انتخاب تامین‌کننده</option>
                          {vendorsList.filter(v => v.isActive).map(vendor => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name} ({vendor.type === 'Company' ? 'شرکت' : 'شخص'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">شماره فاکتور/رسید</label>
                        <input
                          name={transactionType === 'Expense' ? 'invoiceNumber' : 'receiptNumber'}
                          value={transactionType === 'Expense' ? formData.invoiceNumber || '' : formData.receiptNumber || ''}
                          onChange={handleChange}
                          placeholder={transactionType === 'Expense' ? 'شماره فاکتور' : 'شماره رسید'}
                          className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Documents & Review */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">اسناد ضمیمه</label>
                      <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-6">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                          accept="image/*,application/pdf,.doc,.docx"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">کلیک کنید تا فایل انتخاب کنید</span>
                          <span className="text-xs text-gray-400 mt-1">PDF, تصاویر, Word</span>
                        </label>
                      </div>
                      
                      {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium mb-2">برچسب‌ها</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags?.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="mr-1 hover:text-blue-600"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="افزودن برچسب جدید..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                      />
                    </div>

                    {/* Transaction Summary */}
                    <div className="bg-[var(--bg-color)] rounded-lg p-6 border border-[var(--border-color)]">
                      <h3 className="text-lg font-semibold mb-4">خلاصه تراکنش</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">عنوان:</span>
                          <span className="mr-2 font-medium">{formData.title}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">مبلغ نهایی:</span>
                          <span className="mr-2 font-bold text-lg">{formatCurrency(finalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">دسته‌بندی:</span>
                          <span className="mr-2">{categoryTranslations[formData.category]}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">تاریخ:</span>
                          <span className="mr-2">{formData.date ? formatJalaliDate(formData.date) : ''}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">حساب:</span>
                          <span className="mr-2 font-mono text-xs">{formData.accountCode}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">وضعیت:</span>
                          <span className="mr-2">{statusTranslations[formData.status]}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[var(--border-color)]">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors"
                  >
                    قبلی
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors"
                >
                  انصراف
                </button>
              </div>
              
              <div className="flex gap-3">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    بعدی
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className={`px-6 py-2 text-white rounded-lg transition-colors transform hover:scale-105 ${submitButtonClass}`}
                  >
                    {initialData ? 'بروزرسانی' : 'ذخیره'} تراکنش
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
