// src/app/units/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Unit } from '@/types/index.d';
import { mockUnits } from '@/lib/mockData'; // این import حالا به درستی کار می‌کند
import UnitsTable from '@/components/UnitsTable';
import UnitFormModal from '@/components/UnitFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);

  // F: [اصلاح اصلی] state برای تشخیص اینکه آیا در سمت کلاینت هستیم یا خیر.
  // این state برای حل خطای Hydration استفاده می‌شود.
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // این useEffect فقط در سمت کلاینت اجرا می‌شود و پس از رندر اولیه، state را true می‌کند.
    setIsClient(true);
  }, []);

  const handleOpenAddModal = () => {
    setEditingUnit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setFormModalOpen(true);
  };

  const handleFormSubmit = (data: Omit<Unit, 'id'>) => {
    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? { ...editingUnit, ...data } : u));
    } else {
      const newUnit: Unit = {
        id: Date.now(), // یا هر روش دیگری برای تولید ID
        ...data,
      };
      setUnits([newUnit, ...units]);
    }
    handleCloseModals();
  };

  const handleOpenDeleteModal = (id: number) => {
    setUnitToDelete(id);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (unitToDelete !== null) {
      setUnits(units.filter(u => u.id !== unitToDelete));
      handleCloseModals();
    }
  };

  const handleCloseModals = () => {
    setFormModalOpen(false);
    setConfirmModalOpen(false);
    setEditingUnit(null);
    setUnitToDelete(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--text-color)]">مدیریت واحدها</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-transform duration-200 hover:scale-105"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          <PlusIcon className="w-5 h-5" />
          <span>افزودن واحد جدید</span>
        </button>
      </div>

      <UnitsTable units={units} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />

      {/* F: [اصلاح اصلی] پاس دادن isClient به مودال برای جلوگیری از رندر تقویم در سرور */}
      <UnitFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        initialData={editingUnit}
        isClient={isClient}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        message="آیا از حذف این واحد اطمینان دارید؟ این عمل قابل بازگشت نیست."
      />
    </motion.div>
  );
}
