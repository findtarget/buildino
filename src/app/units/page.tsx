// src/app/units/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building, Unit } from '@/types/index.d';
import { PlusIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { toPersianDigits } from '@/lib/utils';

import UnitsTable from '@/components/UnitsTable';
import UnitFormModal from '@/components/UnitFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useAuth } from '@/hooks/useAuth';
import { apiHelpers as api } from '@/lib/api';

export default function UnitsPage() {
  const { user, isLoading: isAuthLoading } = useAuth(); // F: گرفتن وضعیت لودینگ از هوک
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const fetchUnitsAndBuilding = useCallback(async () => {
    // F: فقط در صورتی که کاربر لاگین کرده و buildingId دارد، واکشی انجام شود
    if (user?.buildingId) {
      setIsLoadingData(true);
      try {
        const [buildingRes, unitsRes] = await Promise.all([
          api.get(`/buildings/${user.buildingId}`),
          api.get(`/buildings/${user.buildingId}/units`)
        ]);
        
        if (buildingRes.success) {
          setActiveBuilding(buildingRes.data);
        } else {
            console.error("Failed to fetch building:", buildingRes.error);
        }

        if (unitsRes.success) {
          setUnits(unitsRes.data);
        } else {
            console.error("Failed to fetch units:", unitsRes.error);
        }

      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setIsLoadingData(false);
      }
    } else {
        // اگر کاربر buildingId نداشت، لودینگ را متوقف کن
        setIsLoadingData(false);
    }
  }, [user?.buildingId]);

  useEffect(() => {
    // F: صبر میکنیم تا وضعیت احراز هویت مشخص شود
    if (!isAuthLoading) {
      fetchUnitsAndBuilding();
    }
  }, [fetchUnitsAndBuilding, isAuthLoading]);

  const handleOpenModal = (unit: Unit | null = null) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  const handleSubmit = async (data: any) => { // تایپ any موقت برای سازگاری
    try {
      if (editingUnit) {
        await api.put(`/units/${editingUnit.id}`, data);
      } else {
        //await api.post('/units', { ...data, buildingId: user?.buildingId });
        await api.post(`/buildings/${user?.buildingId}/units`, data);
      }
      fetchUnitsAndBuilding();
    } catch (error) {
      console.error("Failed to save unit", error);
      // F: میتوانید یک نوتیفیکیشن خطا نمایش دهید
    }
    handleCloseModal();
  };
  
  const handleOpenDeleteModal = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (unitToDelete) {
      try {
        await api.delete(`/units/${unitToDelete.id}`);
        fetchUnitsAndBuilding(); // رفرش لیست پس از حذف
      } catch(error) {
        console.error("Failed to delete unit:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setUnitToDelete(null);
      }
    }
  };


  // F: نمایش وضعیت‌های مختلف لودینگ و خطا
  if (isAuthLoading || isLoadingData) {
    return <div className="flex justify-center items-center h-full">در حال بارگذاری اطلاعات...</div>;
  }
  
  if (!user) {
      return <div className="text-center p-10">برای دسترسی به این صفحه باید وارد شوید.</div>
  }

  if (!activeBuilding) {
    return <div className="text-center p-10">ساختمانی برای حساب کاربری شما یافت نشد.</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت واحدها - {activeBuilding.name}</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white font-semibold rounded-lg shadow-md hover:bg-[var(--accent-hover-color)] transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          <span>افزودن واحد جدید</span>
        </button>
      </div>

      <UnitsTable 
        units={units}
        onEdit={handleOpenModal} 
        onDelete={(id) => {
          const unit = units.find(u => u.id === id);
          if (unit) handleOpenDeleteModal(unit);
        }}
      />
      
      <UnitFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingUnit}
        building={activeBuilding}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تایید حذف واحد"
        message={`آیا از حذف واحد شماره ${unitToDelete ? toPersianDigits(unitToDelete.unitNumber) : ''} اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
      />
    </motion.div>
  );
}
