// src/components/UnitFormModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Unit } from '@/types/index.d';
import { useEffect, useState, useRef, useCallback } from 'react';
// F: [اصلاح شد] ایمپورت توابع جدید و حذف توابع قدیمی
import { toPersianDigits, formatJalaliDate, parseJalaliDate } from '@/lib/utils';
import dynamic from 'next/dynamic';

// F: [اصلاح شد] حذف ایمپورت Day از کتابخانه قدیمی
// import { Day } from 'react-modern-calendar-datepicker';

const CustomDatePicker = dynamic(() => import('./CustomDatePicker'), { ssr: false });

// F: [راه حل نهایی] نوع داده‌های فرم با Date object هماهنگ شد
type UnitFormData = Omit<Unit, 'id' | 'balance' | 'area' | 'floor' | 'parkingSpots' | 'ownerSince' | 'residentSince' | 'residentCount'> & {
  balance: string;
  area: string;
  floor: string;
  parkingSpots: string;
  residentCount: string;
  ownerSince: Date | null;
  residentSince: Date | null;
};

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Unit, 'id'>) => void;
  initialData?: Unit | null;
}

const defaultFormState: UnitFormData = {
  unitNumber: '', floor: '', area: '', type: 'Residential', ownerName: '', ownerContact: '',
  status: 'Vacant', residentName: '', residentContact: '',
  parkingSpots: '', // F: [اصلاح شد] مقدار پیش‌فرض خالی برای placeholder
  hasStorage: false,
  balance: '0', ownerSince: null, residentSince: null,
  residentCount: '' // F: [اصلاح شد] مقدار پیش‌فرض خالی برای placeholder
};

export default function UnitFormModal({ isOpen, onClose, onSubmit, initialData }: UnitFormModalProps) {
  const [formData, setFormData] = useState<UnitFormData>(defaultFormState);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          balance: String(initialData.balance),
          area: String(initialData.area),
          floor: String(initialData.floor),
          // F: [اصلاح شد] اگر مقدار 0 بود، خالی نمایش بده
          parkingSpots: initialData.parkingSpots ? String(initialData.parkingSpots) : '',
          residentCount: initialData.residentCount ? String(initialData.residentCount) : '',
          // F: [اصلاح شد] استفاده از تابع جدید parseJalaliDate
          ownerSince: parseJalaliDate(initialData.ownerSince),
          residentSince: parseJalaliDate(initialData.residentSince),
        });
      } else {
        setFormData(defaultFormState);
      }
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (formData.status === 'OwnerOccupied') {
      setFormData(prev => ({ ...prev, residentName: prev.ownerName, residentContact: prev.ownerContact, residentSince: prev.ownerSince }));
    } else if (formData.status === 'Vacant') {
      // F: [اصلاح شد] ساکنین و تعدادشان در حالت خالی، خالی می‌شوند
      setFormData(prev => ({...prev, residentName: '', residentContact: '', residentCount: '', residentSince: null}));
    }
  }, [formData.status, formData.ownerName, formData.ownerContact, formData.ownerSince, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked}));
    } else {
        // F: [اصلاح شد] جلوگیری از وارد کردن اعداد غیرفارسی برای فیلدهای عددی
        const persianRegex = /^[۰-۹0-9]*$/;
        if (['floor', 'area', 'parkingSpots', 'residentCount'].includes(name)) {
            if (persianRegex.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }
  };

  const handleOwnerSinceChange = useCallback((date: Date | undefined) => {
    setFormData(prev => ({ ...prev, ownerSince: date || null }));
  }, []);

  const handleResidentSinceChange = useCallback((date: Date | undefined) => {
    setFormData(prev => ({ ...prev, residentSince: date || null }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      area: parseFloat(formData.area.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) || 0,
      floor: parseInt(formData.floor.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) || 0,
      parkingSpots: parseInt(formData.parkingSpots.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) || 0,
      residentCount: parseInt(formData.residentCount.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) || 0,
      // F: [اصلاح شد] استفاده از تابع جدید formatJalaliDate
      ownerSince: formatJalaliDate(formData.ownerSince),
      residentSince: formatJalaliDate(formData.residentSince),
    });
    onClose();
  };

  const modalTitle = initialData ? `ویرایش واحد ${toPersianDigits(initialData.unitNumber)}` : 'افزودن واحد جدید';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl relative"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6 text-right" style={{ color: 'var(--accent-color)' }}>{modalTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              
              <div className="border-b border-[var(--border-color)] pb-4">
                <p className="font-semibold mb-2" style={{color: 'var(--text-secondary-color)'}}>مشخصات اصلی واحد</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input required name="unitNumber" value={toPersianDigits(formData.unitNumber)} onChange={handleChange} placeholder="شماره واحد" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <input required name="floor" value={toPersianDigits(formData.floor)} onChange={handleChange} placeholder="طبقه" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <input required name="area" value={toPersianDigits(formData.area)} onChange={handleChange} placeholder="متراژ (متر مربع)" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                   <select name="type" value={formData.type} onChange={handleChange} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]">
                    <option value="Residential">مسکونی</option>
                    <option value="Commercial">تجاری</option>
                  </select>
                </div>
              </div>

              <div className="border-b border-[var(--border-color)] pb-4">
                <p className="font-semibold mb-2" style={{color: 'var(--text-secondary-color)'}}>امکانات</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <input name="parkingSpots" value={toPersianDigits(formData.parkingSpots)} onChange={handleChange} placeholder="تعداد پارکینگ" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <div className="flex items-center gap-2 p-2 justify-center">
                      <label htmlFor="hasStorage" className="cursor-pointer">انباری دارد</label>
                      <input type="checkbox" id="hasStorage" name="hasStorage" checked={formData.hasStorage} onChange={handleChange} className="w-4 h-4 rounded accent-[var(--accent-color)]"/>
                  </div>
                </div>
              </div>

              <div className="border-b border-[var(--border-color)] pb-4">
                <p className="font-semibold mb-2" style={{color: 'var(--text-secondary-color)'}}>اطلاعات مالک</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input required name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="نام و نام خانوادگی مالک" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <input required name="ownerContact" value={toPersianDigits(formData.ownerContact)} onChange={handleChange} placeholder="شماره تماس مالک" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <CustomDatePicker value={formData.ownerSince} onChange={handleOwnerSinceChange} placeholder="تاریخ تملک" />
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2" style={{color: 'var(--text-secondary-color)'}}>اطلاعات سکونت</p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <select name="status" value={formData.status} onChange={handleChange} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] md:col-span-1 lg:col-span-1">
                      <option value="Vacant">خالی</option><option value="OwnerOccupied">مالک ساکن</option><option value="TenantOccupied">مستاجر ساکن</option>
                  </select>
                  <input name="residentName" value={formData.residentName} onChange={handleChange} placeholder="نام ساکن" disabled={formData.status !== 'TenantOccupied'} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50 md:col-span-2 lg:col-span-1" />
                  <input name="residentContact" value={toPersianDigits(formData.residentContact)} onChange={handleChange} placeholder="تماس ساکن" disabled={formData.status !== 'TenantOccupied'} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50" />
                  <input name="residentCount" value={toPersianDigits(formData.residentCount)} onChange={handleChange} placeholder="تعداد ساکنین" disabled={formData.status === 'Vacant'} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50" />
                  <CustomDatePicker value={formData.residentSince} onChange={handleResidentSinceChange} placeholder="تاریخ سکونت" disabled={formData.status === 'Vacant'} />
                </div>
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
