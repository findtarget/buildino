// src/components/UnitFormModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Unit } from '@/types/index.d';
import { useEffect, useState } from 'react'; // حذف useRef
import { toPersianDigits, formatJalaliDate, parseJalaliDate } from '@/lib/utils';
import dynamic from 'next/dynamic';
// حذف import useOnClickOutside

const CustomDatePicker = dynamic(() => import('./CustomDatePicker'), { ssr: false });

type UnitFormData = Omit<Unit, 'id' | 'residentSince'> & { residentSince: Date | null };

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Unit, 'id'>) => void;
  initialData?: Unit | null;
}

const defaultFormState: UnitFormData = {
  unitNumber: '', floor: 0, area: 0, ownerName: '', residentName: '',
  ownerNationalId: '', residentNationalId: '', residentCount: 1,
  residentSince: null, status: 'Vacant'
};

export default function UnitFormModal({ isOpen, onClose, onSubmit, initialData }: UnitFormModalProps) {
  const [formData, setFormData] = useState<UnitFormData>(defaultFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // حذف modalContentRef و useOnClickOutside

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setFormData({
          ...initialData,
          residentSince: initialData.residentSince ? parseJalaliDate(initialData.residentSince) : null,
        });
      } else {
        setFormData(defaultFormState);
      }
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (formData.status === 'OwnerOccupied') {
      setFormData(prev => ({
        ...prev,
        residentName: prev.ownerName,
        residentNationalId: prev.ownerNationalId,
      }));
    } else if (formData.status === 'Vacant') {
      setFormData(prev => ({
        ...prev,
        residentName: '',
        residentNationalId: '',
        residentCount: 1,
        residentSince: null,
      }));
    }
  }, [formData.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleDateChange = (name: keyof UnitFormData) => (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date || null }));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.unitNumber.trim()) newErrors.unitNumber = 'وارد کردن شماره واحد الزامی است.';
    if (formData.floor < 0) newErrors.floor = 'طبقه نمی‌تواند منفی باشد.';
    if (formData.area <= 0) newErrors.area = 'مساحت باید بیشتر از صفر باشد.';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'وارد کردن نام مالک الزامی است.';
    if (!formData.ownerNationalId.trim()) newErrors.ownerNationalId = 'وارد کردن کد ملی مالک الزامی است.';
    if (formData.status === 'TenantOccupied') {
      if (!formData.residentName.trim()) newErrors.residentName = 'وارد کردن نام ساکن الزامی است.';
      if (!formData.residentNationalId.trim()) newErrors.residentNationalId = 'وارد کردن کد ملی ساکن الزامی است.';
    }
    if (formData.status !== 'Vacant' && !formData.residentSince) newErrors.residentSince = 'انتخاب تاریخ سکونت الزامی است.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      floor: Number(formData.floor),
      area: Number(formData.area),
      residentCount: Number(formData.residentCount),
      residentSince: formData.residentSince ? formatJalaliDate(formData.residentSince) : undefined,
    });
    onClose();
  };

  const modalTitle = initialData ? `ویرایش واحد ${toPersianDigits(initialData.unitNumber)}` : 'افزودن واحد جدید';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose} // فقط با دکمه‌ها بسته می‌شود
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--bg-secondary)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)]"
            onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک روی مودال
          >
            <div className="p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-color)]">{modalTitle}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اطلاعات واحد */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text-color)] border-b border-[var(--border-color)] pb-2">اطلاعات واحد</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">شماره واحد *</label>
                    <input
                      type="text"
                      name="unitNumber"
                      value={formData.unitNumber}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
                      placeholder="مثال: ۱۰۱"
                    />
                    {errors.unitNumber && <p className="text-red-500 text-sm mt-1">{errors.unitNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">طبقه *</label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
                      placeholder="مثال: ۱"
                    />
                    {errors.floor && <p className="text-red-500 text-sm mt-1">{errors.floor}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">مساحت (متر مربع) *</label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
                      placeholder="مثال: ۸۰"
                    />
                    {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                  </div>
                </div>
                
                {/* اطلاعات مالک */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text-color)] border-b border-[var(--border-color)] pb-2">اطلاعات مالک</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">نام مالک *</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
                      placeholder="مثال: محمد محمدی"
                    />
                    {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">کد ملی مالک *</label>
                    <input
                      type="text"
                      name="ownerNationalId"
                      value={formData.ownerNationalId}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
                      placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
                    />
                    {errors.ownerNationalId && <p className="text-red-500 text-sm mt-1">{errors.ownerNationalId}</p>}
                  </div>
                </div>
              </div>
              
              {/* اطلاعات سکونت */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text-color)] border-b border-[var(--border-color)] pb-2">اطلاعات سکونت</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-1">وضعیت واحد</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
                  >
                    <option value="Vacant">واحد خالی</option>
                    <option value="OwnerOccupied">مالک ساکن است</option>
                    <option value="TenantOccupied">مستاجر ساکن است</option>
                  </select>
                </div>
                
                {formData.status !== 'Vacant' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-color)] mb-1">
                        {formData.status === 'OwnerOccupied' ? 'نام مالک' : 'نام ساکن'} *
                      </label>
                      <input
                        type="text"
                        name="residentName"
                        value={formData.residentName}
                        onChange={handleChange}
                        disabled={formData.status === 'OwnerOccupied'}
                        className={`w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] ${formData.status === 'OwnerOccupied' ? 'opacity-50' : ''}`}
                        placeholder={formData.status === 'OwnerOccupied' ? 'همان نام مالک' : 'مثال: علی رضایی'}
                      />
                      {errors.residentName && <p className="text-red-500 text-sm mt-1">{errors.residentName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-color)] mb-1">
                        {formData.status === 'OwnerOccupied' ? 'کد ملی مالک' : 'کد ملی ساکن'} *
                      </label>
                      <input
                        type="text"
                        name="residentNationalId"
                        value={formData.residentNationalId}
                        onChange={handleChange}
                        disabled={formData.status === 'OwnerOccupied'}
                        className={`w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] ${formData.status === 'OwnerOccupied' ? 'opacity-50' : ''}`}
                        placeholder={formData.status === 'OwnerOccupied' ? 'همان کد ملی مالک' : 'مثال: ۰۹۸۷۶۵۴۳۲۱'}
                      />
                      {errors.residentNationalId && <p className="text-red-500 text-sm mt-1">{errors.residentNationalId}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">تعداد ساکنین</label>
                        <input
                          type="number"
                          name="residentCount"
                          value={formData.residentCount}
                          onChange={handleChange}
                          className="w-full p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
                          placeholder="مثال: ۴"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">تاریخ سکونت *</label>
                        <CustomDatePicker
                          value={formData.residentSince}
                          onChange={handleDateChange('residentSince')}
                          placeholder="انتخاب تاریخ"
                        />
                        {errors.residentSince && <p className="text-red-500 text-sm mt-1">{errors.residentSince}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg transition-colors" style={{backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)'}}>انصراف</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white font-semibold transition-transform duration-200 hover:scale-105" style={{backgroundColor: 'var(--accent-color)'}}>ذخیره</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
