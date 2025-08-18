// src/components/UnitFormModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Unit } from '@/types/index.d';
import { useEffect, useState, useCallback } from 'react';
import { toPersianDigits, stringToDay, dayToString } from '@/lib/utils';
import { Day } from 'react-modern-calendar-datepicker';
import dynamic from 'next/dynamic';

const CustomDatePicker = dynamic(() => import('./CustomDatePicker'), { ssr: false });

type UnitFormData = Omit<Unit, 'id' | 'balance' | 'area' | 'floor' | 'parkingSpots' | 'ownerSince' | 'residentSince' | 'residentCount'> & {
  balance: string; area: string; floor: string; parkingSpots: string; residentCount: string;
  ownerSince: Day | null; residentSince: Day | null;
};

interface UnitFormModalProps {
  isOpen: boolean; onClose: () => void; onSubmit: (data: Omit<Unit, 'id'>) => void; initialData?: Unit | null;
  isClient: boolean;
}

const defaultFormState: UnitFormData = {
  unitNumber: '', floor: '', area: '', type: 'Residential', ownerName: '', ownerContact: '',
  status: 'Vacant', residentName: '', residentContact: '', parkingSpots: '0', hasStorage: false,
  balance: '0', ownerSince: null, residentSince: null, residentCount: '0'
};

export default function UnitFormModal({ isOpen, onClose, onSubmit, initialData, isClient }: UnitFormModalProps) {
  const [formData, setFormData] = useState<UnitFormData>(defaultFormState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          balance: String(initialData.balance ?? 0),
          area: String(initialData.area ?? 0),
          floor: String(initialData.floor ?? 0),
          parkingSpots: String(initialData.parkingSpots ?? 0),
          residentCount: String(initialData.residentCount ?? 0),
          ownerSince: stringToDay(initialData.ownerSince),
          residentSince: stringToDay(initialData.residentSince),
        });
      } else {
        setFormData(defaultFormState);
      }
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (formData.status === 'OwnerOccupied') {
      setFormData(prev => ({...prev, residentName: prev.ownerName, residentContact: prev.ownerContact, residentSince: prev.ownerSince }));
    } else if (formData.status === 'Vacant') {
      setFormData(prev => ({...prev, residentName: ' - ', residentContact: ' - ', residentCount: '0', residentSince: null}));
    }
  }, [formData.status, formData.ownerName, formData.ownerContact, formData.ownerSince]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({...prev, [name]: checked}));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOwnerSinceChange = useCallback((day: Day | null) => { setFormData(prev => ({ ...prev, ownerSince: day })); }, []);
  const handleResidentSinceChange = useCallback((day: Day | null) => { setFormData(prev => ({ ...prev, residentSince: day })); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      area: parseFloat(formData.area) || 0,
      floor: parseInt(formData.floor) || 0,
      parkingSpots: parseInt(formData.parkingSpots) || 0,
      residentCount: parseInt(formData.residentCount) || 0,
      ownerSince: dayToString(formData.ownerSince) || '',
      residentSince: dayToString(formData.residentSince) || '',
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input required name="unitNumber" value={formData.unitNumber} onChange={handleChange} placeholder="شماره واحد" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <input required type="number" name="floor" value={formData.floor} onChange={handleChange} placeholder="طبقه" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <input required type="number" step="0.01" name="area" value={formData.area} onChange={handleChange} placeholder="متراژ" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <select name="type" value={formData.type} onChange={handleChange} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]">
                    <option value="Residential">مسکونی</option>
                    <option value="Commercial">تجاری</option>
                  </select>
                </div>
              </div>
              <div className="border-b border-[var(--border-color)] pb-4">
                <p className="font-semibold mb-2" style={{color: 'var(--text-secondary-color)'}}>امکانات</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <input type="number" name="parkingSpots" value={formData.parkingSpots} onChange={handleChange} placeholder="تعداد پارکینگ" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hasStorage" name="hasStorage" checked={formData.hasStorage} onChange={handleChange} className="w-4 h-4 rounded accent-[var(--accent-color)]" />
                    <label htmlFor="hasStorage" className="cursor-pointer">انباری دارد</label>
                  </div>
                </div>
              </div>
              <div className="border-b border-[var(--border-color)] pb-4">
                <p className="font-semibold mb-2" style={{color: 'var(--text-secondary-color)'}}>اطلاعات مالک</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input required name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="نام و نام خانوادگی مالک" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  <input required name="ownerContact" value={formData.ownerContact} onChange={handleChange} placeholder="شماره تماس مالک" className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]" />
                  {isClient && <CustomDatePicker value={formData.ownerSince} onChange={handleOwnerSinceChange} placeholder="تاریخ تملک" />}
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2" style={{color: 'var(--text-secondary-color)'}}>اطلاعات سکونت</p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <select name="status" value={formData.status} onChange={handleChange} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]">
                    <option value="Vacant">خالی</option>
                    <option value="OwnerOccupied">مالک ساکن</option>
                    <option value="TenantOccupied">مستاجر ساکن</option>
                  </select>
                  <input required name="residentName" value={formData.residentName} onChange={handleChange} placeholder="نام ساکن" disabled={formData.status !== 'TenantOccupied'} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50" />
                  <input required name="residentContact" value={formData.residentContact} onChange={handleChange} placeholder="تماس ساکن" disabled={formData.status !== 'TenantOccupied'} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50" />
                  <input type="number" name="residentCount" value={formData.residentCount} onChange={handleChange} placeholder="تعداد ساکنین" disabled={formData.status === 'Vacant'} className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50" />
                  {isClient && <CustomDatePicker value={formData.residentSince} onChange={handleResidentSinceChange} placeholder="تاریخ سکونت" disabled={formData.status === 'Vacant'} />}
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
