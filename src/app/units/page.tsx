// src/app/units/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UnitsTable from '@/components/UnitsTable';
import { Unit } from '@/types/index.d';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { mockUnits } from '@/lib/mockData';
import dynamic from 'next/dynamic';

// F: [بهینه‌سازی اساسی] مودال به صورت دینامیک و فقط در سمت کلاینت لود می‌شود.
const UnitFormModal = dynamic(() => import('@/components/UnitFormModal'), { ssr: false });

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [unitToDeleteId, setUnitToDeleteId] = useState<number | null>(null);

  const handleOpenAddModal = () => {
    setEditingUnit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    // F: ریست کردن داده‌ها پس از اتمام انیمیشن خروج، از گلیچ جلوگیری می‌کند.
    // AnimatePresence در خود مودال این مدیریت را انجام می‌دهد، ولی تاخیر کوچک اینجا امن‌تر است.
    setTimeout(() => setEditingUnit(null), 300);
  };

  const handleFormSubmit = (data: Omit<Unit, 'id'>) => {
    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? { ...editingUnit, ...data } : u));
    } else {
      const newUnit: Unit = { id: Date.now(), ...data };
      setUnits([newUnit, ...units]);
    }
    handleCloseFormModal();
  };

  const handleOpenDeleteModal = (id: number) => {
    setUnitToDeleteId(id);
    setConfirmModalOpen(true);
  };
  
  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setTimeout(() => setUnitToDeleteId(null), 300);
  }

  const handleConfirmDelete = () => {
    if (unitToDeleteId !== null) {
      setUnits(units.filter(u => u.id !== unitToDeleteId));
      handleCloseConfirmModal(); // F: پس از حذف، مودال تایید را می‌بندیم.
    }
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-transform duration-200 hover:scale-105 bg-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
        >
          <PlusIcon className="w-5 h-5" />
          <span>افزودن واحد</span>
        </button>
      </div>

      <UnitsTable units={units} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />

      {/* F: خود مودال‌ها نمایش/عدم نمایش را با isOpen مدیریت می‌کنند */}
      <UnitFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingUnit}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        itemName={units.find(u => u.id === unitToDeleteId)?.unitNumber || ''}
      />
    </motion.div>
  );
}
