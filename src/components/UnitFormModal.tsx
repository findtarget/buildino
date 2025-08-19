// src/components/UnitFormModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Unit } from '@/types/index.d';
import { useEffect, useState, useRef, useCallback } from 'react'; // useCallback اینجا استفاده می‌شود
import { toPersianDigits } from '@/lib/utils';
import { Day } from 'react-modern-calendar-datepicker';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import CustomDatePicker from './CustomDatePicker';

type UnitFormData = Omit<Unit, 'id' | 'balance' | 'area' | 'floor' | 'parkingSpots' | 'ownerSince' | 'residentSince'> & {
  balance: string;
  area: string;
  floor: string;
  parkingSpots: string;
  ownerSince: Day | null;
  residentSince: Day | null;
};

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Unit, 'id'>) => void;
  initialData?: Unit | null;
}

const defaultFormState: UnitFormData = {
  unitNumber: '', floor: '', area: '', type: 'Residential', ownerName: '', ownerContact: '',
  status: 'Vacant', residentName: '', residentContact: '', parkingSpots: '0', hasStorage: false,
  balance: '0', ownerSince: null, residentSince: null,
};

const stringToDay = (dateStr: string | null): Day | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
};

const dayToString = (day: Day | null): string | null => {
  if (!day) return null;
  return `${day.year}/${String(day.month).padStart(2, '0')}/${String(day.day).padStart(2, '0')}`;
};

export default function UnitFormModal({ isOpen, onClose, onSubmit, initialData }: UnitFormModalProps) {
  const [formData, setFormData] = useState<UnitFormData>(defaultFormState);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [themeColors, setThemeColors] = useState({ accent: '#3b82f6' });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen && modalRef.current) {
        const styles = getComputedStyle(modalRef.current);
        setThemeColors({
            accent: styles.getPropertyValue('--accent-color').trim() || '#3b82f6',
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        balance: String(initialData.balance),
        area: String(initialData.area),
        floor: String(initialData.floor),
        parkingSpots: String(initialData.parkingSpots),
        ownerSince: stringToDay(initialData.ownerSince),
        residentSince: stringToDay(initialData.residentSince),
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (formData.status === 'OwnerOccupied') {
      setFormData(prev => ({...prev, residentName: prev.ownerName, residentContact: prev.ownerContact, residentSince: prev.ownerSince }));
    } else if (formData.status === 'Vacant') {
      setFormData(prev => ({...prev, residentName: ' - ', residentContact: ' - ', residentSince: null}));
    }
  }, [formData.status, formData.ownerName, formData.ownerContact, formData.ownerSince]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked}));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // F: [اصلاح نهایی] استفاده از useCallback برای پایدارسازی توابع آپدیت تاریخ.
  // این کار از ساخته شدن مجدد توابع در هر رندر جلوگیری کرده و مانع از فعال شدن
  // ناخواسته useEffect و تابع cleanup در کتابخانه تقویم می‌شود که باعث خطا می‌شد.
  const handleOwnerSinceChange = useCallback((day: Day | null) => {
    setFormData(prev => ({ ...prev, ownerSince: day }));
  }, []); // dependency خالی است چون setFormData توسط React پایدار نگه داشته می‌شود.

  const handleResidentSinceChange = useCallback((day: Day | null) => {
    setFormData(prev => ({ ...prev, residentSince: day }));
  }, []); // dependency خالی است چون setFormData توسط React پایدار نگه داشته می‌شود.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      area: parseFloat(formData.area) || 0,
      floor: parseInt(formData.floor) || 0,
      parkingSpots: parseInt(formData.parkingSpots) || 0,
      ownerSince: dayToString(formData.ownerSince),
      residentSince: dayToString(formData.residentSince),
    });
  };

  const modalTitle = initialData ? `ویرایش واحد ${toPersianDigits(initialData.unitNumber)}` : 'افزودن واحد جدید';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl relative"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6 text-right" style={{ color: 'var(--accent-color)' }}>{modalTitle}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input required name="unitNumber" value={formData.unitNumber} onChange={handleChange} placeholder="شماره واحد" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
              <input required type="number" name="floor" value={formData.floor} onChange={handleChange} placeholder="طبقه" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
              <input required type="number" name="area" value={formData.area} onChange={handleChange} placeholder="متراژ (متر مربع)" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
              
              <div className="md:col-span-3"><hr style={{borderColor: 'var(--border-color)', margin: '8px 0'}} /></div>

              <input required name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="نام مالک" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
              <input required name="ownerContact" value={formData.ownerContact} onChange={handleChange} placeholder="تماس مالک" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
              
              {isClient && (
                <CustomDatePicker
                    value={formData.ownerSince}
                    onChange={handleOwnerSinceChange} // F: [اصلاح] استفاده از تابع پایدار شده
                    placeholder="تاریخ تملک"
                    themeColors={themeColors}
                />
              )}

              <div className="md:col-span-3"><hr style={{borderColor: 'var(--border-color)', margin: '8px 0'}} /></div>

              <select name="status" value={formData.status} onChange={handleChange} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]">
                  <option value="Vacant">خالی</option><option value="OwnerOccupied">مالک ساکن</option><option value="TenantOccupied">مستاجر ساکن</option>
              </select>
              <input required name="residentName" value={formData.residentName} onChange={handleChange} placeholder="نام ساکن" disabled={formData.status !== 'TenantOccupied'} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50" />

              {isClient && (
                <CustomDatePicker
                  value={formData.residentSince}
                  onChange={handleResidentSinceChange} // F: [اصلاح] استفاده از تابع پایدار شده
                  placeholder="تاریخ سکونت"
                  disabled={formData.status === 'Vacant'}
                  themeColors={themeColors}
                />
              )}

              <div className="md:col-span-3"><hr style={{borderColor: 'var(--border-color)', margin: '8px 0'}} /></div>

              <input required type="number" name="parkingSpots" value={formData.parkingSpots} onChange={handleChange} placeholder="تعداد پارکینگ" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
              <div className="flex items-center gap-2 p-2">
                <input id="hasStorage" type="checkbox" name="hasStorage" checked={formData.hasStorage} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-[var(--accent-color)] focus:ring-[var(--accent-color)]" />
                <label htmlFor="hasStorage" className="text-sm" style={{color: 'var(--text-color)'}}>دارای انباری</label>
              </div>

              <div className="pt-4 flex justify-end gap-3 md:col-span-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg" style={{backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)'}}>انصراف</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white" style={{backgroundColor: 'var(--accent-color)'}}>ذخیره</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}