// src/app/units/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UnitsTable from '@/components/UnitsTable';
import { Unit } from '@/types/index.d';
import UnitFormModal from '@/components/UnitFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { mockUnits } from '@/lib/mockData';

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(mockUnits);

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);

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
        id: Date.now(),
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
      setUnitToDelete(null);
      handleCloseModals();
    }
  };

  const handleCloseModals = () => {
    setFormModalOpen(false);
    setConfirmModalOpen(false);
    // با کمی تاخیر state ها را ریست میکنیم تا انیمیشن خروج تمام شود
    setTimeout(() => {
        setEditingUnit(null);
        setUnitToDelete(null);
    }, 300); // 300ms should be enough for the exit animation
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>مدیریت واحدها</h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-transform duration-200 hover:scale-105"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          <PlusIcon className="w-5 h-5" />
          <span>افزودن واحد جدید</span>
        </button>
      </motion.div>

      <UnitsTable units={units} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />

      {/* 
        F: [اصلاح اساسی]
        مودال‌ها را از رندر شرطی خارج می‌کنیم. 
        اکنون خود کامپوننت مودال با استفاده از prop `isOpen` و `AnimatePresence` 
        نمایش و انیمیشن خروج را مدیریت می‌کند.
        این کار از خطای unmount ناگهانی جلوگیری می‌کند.
      */}
      <UnitFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        initialData={editingUnit}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}