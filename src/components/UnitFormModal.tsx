// src/components/UnitFormModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Unit, Building, Block } from '@/types/index.d';
import { useEffect, useState, useRef, Fragment } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toPersianDigits, toEnglishDigits } from '@/lib/utils';
import { Listbox, Transition } from '@headlessui/react';
import { CalendarIcon, CheckIcon, ChevronUpDownIcon, PlusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import CustomDatePicker from './CustomDatePicker';

// F: تایپ فرم دیتا برای react-hook-form
type UnitFormData = Omit<Unit, 'id' | 'balance' | 'area' | 'parkingSpots' | 'ownerSince' | 'residentSince'> & {
  balance: number;
  area: number;
  parkingSpots: number;
  ownerSince: Date | null;
  residentSince: Date | null;
};

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Unit, 'id'>) => void;
  initialData?: Unit | null;
  building: Building | null;
}

export default function UnitFormModal({ isOpen, onClose, onSubmit, initialData, building }: UnitFormModalProps) {
  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<UnitFormData>();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // F: استیت برای فعال/غیرفعال کردن فیلدهای عددی
  const [isAreaEnabled, setIsAreaEnabled] = useState(false);
  const [isParkingEnabled, setIsParkingEnabled] = useState(false);

  const status = watch('status');
  const ownerName = watch('ownerName');
  const ownerContact = watch('ownerContact');
  const ownerSince = watch('ownerSince');

  // F: افکت برای واکشی بلوک‌ها
  useEffect(() => {
    if (isOpen && building?.hasBlocks && building.id) {
      const fetchBlocks = async () => {
        setIsLoadingBlocks(true);
        try {
          // F: استفاده از مسیر صحیح API
          const res = await fetch(`/api/buildings/${building.id}/blocks`);
          const data = await res.json();
          if (data.success) setBlocks(data.data);
        } catch (error) {
          console.error("Failed to fetch blocks", error);
        } finally {
          setIsLoadingBlocks(false);
        }
      };
      fetchBlocks();
    }
  }, [isOpen, building]);

  // F: افکت برای پر کردن فرم با داده‌های اولیه یا ریست کردن آن
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...initialData,
          ownerSince: initialData.ownerSince ? new Date(initialData.ownerSince) : null,
          residentSince: initialData.residentSince ? new Date(initialData.residentSince) : null,
        });
        setIsAreaEnabled(initialData.area > 0);
        setIsParkingEnabled(initialData.parkingSpots > 0);
      } else {
        reset({
          type: 'Residential',
          status: 'Vacant',
          hasStorage: false,
          area: 0,
          parkingSpots: 0,
          balance: 0,
        });
        setIsAreaEnabled(false);
        setIsParkingEnabled(false);
      }
    }
  }, [initialData, isOpen, reset]);

  // F: افکت برای همگام‌سازی اطلاعات ساکن با مالک
  useEffect(() => {
    if (status === 'OwnerOccupied') {
      setValue('residentName', ownerName);
      setValue('residentContact', ownerContact);
      setValue('residentSince', ownerSince);
    } else if (status === 'Vacant') {
      setValue('residentName', ' - ');
      setValue('residentContact', ' - ');
      setValue('residentSince', null);
    }
  }, [status, ownerName, ownerContact, ownerSince, setValue]);

  const handleFormSubmit = (data: UnitFormData) => {
    const finalData = {
      ...data,
      // F: تبدیل اعداد فارسی به انگلیسی قبل از ارسال
      unitNumber: toEnglishDigits(data.unitNumber),
      ownerContact: toEnglishDigits(data.ownerContact),
      residentContact: toEnglishDigits(data.residentContact),
      // F: تبدیل تاریخ‌ها به فرمت ISO String
      ownerSince: data.ownerSince ? data.ownerSince.toISOString() : null,
      residentSince: data.residentSince ? data.residentSince.toISOString() : null,
    };
    onSubmit(finalData);
  };
  
  const selectedBlock = blocks.find(b => b.id === watch('blockId'));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl relative bg-[var(--bg-secondary)] border border-[var(--border-color)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* -- F: هدر بازسازی شده -- */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                    {initialData ? (
                        <PencilSquareIcon className="w-6 h-6 text-[var(--accent-color)]"/>
                    ) : (
                        <PlusCircleIcon className="w-6 h-6 text-[var(--accent-color)]"/>
                    )}
                    <h2 className="text-lg font-bold">
                        {initialData ? `ویرایش واحد ${toPersianDigits(initialData.unitNumber)}` : 'افزودن واحد جدید'}
                    </h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
              
              {/* -- اطلاعات اصلی -- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {building?.hasBlocks && (
                    <Controller
                      name="blockId"
                      control={control}
                      rules={{ required: 'انتخاب بلوک الزامی است' }}
                      render={({ field }) => (
                        <FieldWrapper label="بلوک" error={errors.blockId}>
                          <Listbox {...field}>
                            {/* ... (کد Listbox از نسخه قبلی بدون تغییر) ... */}
                            <div className="relative">
                            <Listbox.Button className="form-input text-right">
                              <span className="block truncate">{selectedBlock ? selectedBlock.name : (isLoadingBlocks ? "در حال بارگذاری..." : "انتخاب بلوک")}</span>
                              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[var(--bg-color)] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                {blocks.map((block) => (
                                  <Listbox.Option key={block.id} className={({ active }) =>`relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-[var(--accent-color)]/20' : ''}`} value={block.id}>
                                    {({ selected }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{block.name}</span>
                                        {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--accent-color)]"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span>) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                          </Listbox>
                        </FieldWrapper>
                      )}
                    />
                  )}
                  
                  <InputField label="شماره واحد" error={errors.unitNumber} {...register('unitNumber', { required: 'شماره واحد الزامی است' })} />
                  
                  <FieldWrapper label="طبقه" error={errors.floor}>
                    <select className="form-input" {...register('floor', { required: 'انتخاب طبقه الزامی است' })}>
                      <option value="">انتخاب کنید...</option>
                      {Array.from({ length: building?.floorsCount || 0 }, (_, i) => i + 1).map(f => (
                          <option key={f} value={f}>طبقه {toPersianDigits(f)}</option>
                      ))}
                    </select>
                  </FieldWrapper>

                  <FieldWrapper label="مساحت (متر)" error={errors.area}>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={isAreaEnabled} onChange={e => setIsAreaEnabled(e.target.checked)} className="h-5 w-5 rounded"/>
                      <input type="number" step="0.01" className="form-input" placeholder='مثلا: ۱۲۰' disabled={!isAreaEnabled} {...register('area', { valueAsNumber: true })}/>
                    </div>
                  </FieldWrapper>
              </div>
              
              {/* -- مشخصات تکمیلی -- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center pt-2">
                  <FieldWrapper label="تعداد پارکینگ" error={errors.parkingSpots}>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={isParkingEnabled} onChange={e => setIsParkingEnabled(e.target.checked)} className="h-5 w-5 rounded"/>
                      <input type="number" className="form-input" disabled={!isParkingEnabled} {...register('parkingSpots', { valueAsNumber: true })}/>
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label="نوع واحد">
                      <select className="form-input" {...register('type')}>
                          <option value="Residential">مسکونی</option>
                          <option value="Commercial">تجاری</option>
                          <option value="Official">اداری</option>
                      </select>
                  </FieldWrapper>
                  
                  <div className="flex items-center pt-6">
                      <input type="checkbox" id="hasStorage" className="h-4 w-4 rounded" {...register('hasStorage')}/>
                      <label htmlFor="hasStorage" className="mr-2 block text-sm">دارای انباری</label>
                  </div>
              </div>
              
              <hr className="border-[var(--border-color)] my-4" />
              {/* -- اطلاعات مالک و ساکن در دو بخش مجزا -- */}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="نام مالک" error={errors.ownerName} {...register('ownerName', { required: 'نام مالک الزامی است' })} />
                  <InputField label="تماس مالک" type="tel" error={errors.ownerContact} {...register('ownerContact', { required: 'شماره تماس مالک الزامی است' })} />
                  <FieldWrapper label="تاریخ تملک">
                    <Controller name="ownerSince" control={control} render={({ field }) => <CustomDatePicker value={field.value} onChange={field.onChange} />} />
                  </FieldWrapper>
              </div>

              <hr className="border-[var(--border-color)] my-4" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FieldWrapper label="وضعیت سکونت">
                    <select className="form-input" {...register('status')}>
                      <option value="Vacant">خالی</option>
                      <option value="OwnerOccupied">مالک ساکن</option>
                      <option value="TenantOccupied">مستاجر ساکن</option>
                    </select>
                  </FieldWrapper>
                  <InputField label="نام ساکن" error={errors.residentName} disabled={status !== 'TenantOccupied'} {...register('residentName', { required: status === 'TenantOccupied' ? 'نام ساکن الزامی است' : false })} />
                  <FieldWrapper label="تاریخ سکونت">
                    <Controller name="residentSince" control={control} render={({ field }) => <CustomDatePicker value={field.value} onChange={field.onChange} disabled={status === 'Vacant'} />} />
                  </FieldWrapper>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)]">انصراف</button>
                <button type="submit" className="px-5 py-2 rounded-lg text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover-color)]">ذخیره</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -- F: کامپوننت‌های کمکی برای نمایش خطاها و لیبل‌ها --
const FieldWrapper = ({ label, error, children }: { label: string, error?: { message?: string }, children: React.ReactNode }) => (
    <div>
        <label className="text-sm font-medium mb-1 block">{label}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
);

const InputField = ({ label, error, ...props }: { label: string, error?: { message?: string } } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <FieldWrapper label={label} error={error}>
        <input {...props} className={`form-input ${error ? 'border-red-500' : ''}`} />
    </FieldWrapper>
);
