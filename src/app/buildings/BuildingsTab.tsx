//src/app/buildings/BuildingsTab.tsx

'use client';

import { useEffect, useState } from 'react';
import { useActiveBuilding } from '@/app/context/ActiveBuildingContext';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, BuildingOffice2Icon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { toPersianDigits, toEnglishDigits } from '@/lib/utils';

interface Building {
  id: number;
  name: string;
  type?: string;
  usage?: string;
  hasBlocks?: boolean;
  blocksCount?: number;
  description?: string;
}

const typeMap: Record<string, string> = {
  APARTMENT: 'آپارتمان',
  COMMERCIAL: 'تجاری',
  MIXED_USE: 'ترکیبی',
  RESIDENTIAL_COMPLEX: 'مجتمع مسکونی'
};

const usageMap: Record<string, string> = {
  RESIDENTIAL: 'مسکونی',
  COMMERCIAL: 'تجاری',
  MIXED: 'ترکیبی'
};

export default function BuildingsTab() {
  const { buildingId, setBuildingId } = useActiveBuilding();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    usage: '',
    hasBlocks: false,
    blocksCount: '',
    description: ''
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const validateForm = () => {
    const errs: { [k: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'نام ساختمان الزامیست';
    if (!formData.type) errs.type = 'نوع ساختمان الزامیست';
    if (!formData.usage) errs.usage = 'کاربری ساختمان الزامیست';
    if (formData.hasBlocks && !formData.blocksCount) errs.blocksCount = 'تعداد بلوک الزامیست';
    return errs;
  };

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/buildings');
      const json = await res.json();
      if (res.ok && json.success) {
        setBuildings(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      usage: '',
      hasBlocks: false,
      blocksCount: '',
      description: ''
    });
    setEditing(null);
    setErrors({});
  };

  const handleSelectBuilding = (id: number) => {
    setBuildingId(id);
  };

  const handleEdit = (b: Building) => {
    setEditing(b);
    setFormData({
      name: b.name,
      type: b.type || '',
      usage: b.usage || '',
      hasBlocks: b.hasBlocks || false,
      blocksCount: b.blocksCount ? toPersianDigits(b.blocksCount) : '',
      description: b.description || ''
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleDelete = (b: Building) => {
    setDeleteTarget(b);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/buildings/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        loadBuildings();
        if (buildingId === deleteTarget.id) setBuildingId(0);
      }
    } catch (err) {
      console.error('Error deleting building:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      blocksCount: formData.hasBlocks
        ? Number(toEnglishDigits(formData.blocksCount))
        : null
    };
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/buildings/${editing.id}` : '/api/buildings';
    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setFormOpen(false);
        resetForm();
        loadBuildings();
      } else {
        alert(json.error || 'خطا در ذخیره ساختمان');
      }
    } catch (err) {
      console.error('Error saving building:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">ساختمان‌ها</h2>
        <button
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          افزودن ساختمان
        </button>
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-4 border-t-transparent border-blue-600 rounded-full"
          />
        </motion.div>
      )}

      {!loading && (
        <div
          className="overflow-hidden rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <table className="w-full text-sm">
            <thead
              style={{
                backgroundColor: 'var(--bg-color)',
                borderBottom: '1px solid var(--border-color)'
              }}
            >
              <tr>
                <th className="p-3 text-right">انتخاب</th>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">نوع</th>
                <th className="p-3 text-right">کاربری</th>
                <th className="p-3 text-right">بلوک‌ها</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {buildings.map((b) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ backgroundColor: 'var(--bg-color)' }}
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <td className="p-3 text-center">
                    <input
                      type="radio"
                      checked={buildingId === b.id}
                      onChange={() => handleSelectBuilding(b.id)}
                    />
                  </td>
                  <td className="p-3">{b.name}</td>
                  <td className="p-3">{typeMap[b.type || ''] || '-'}</td>
                  <td className="p-3">{usageMap[b.usage || ''] || '-'}</td>
                  <td className="p-3">
                    {b.hasBlocks && b.blocksCount
                      ? toPersianDigits(b.blocksCount)
                      : '-'}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1 rounded-lg bg-yellow-400 hover:bg-yellow-500"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setFormOpen(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md p-6 rounded-2xl space-y-4"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BuildingOffice2Icon className="w-6 h-6" />
                <h2 className="text-lg font-bold">
                  {editing ? 'ویرایش ساختمان' : 'افزودن ساختمان'}
                </h2>
              </div>
              <p className="text-sm opacity-70">لطفا فیلدهای ستاره‌دار را تکمیل کنید.</p>

              {/* Name */}
              <div>
                <label className="block mb-1">
                  نام ساختمان <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="border p-2 w-full rounded-md"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block mb-1">
                  نوع <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, type: e.target.value }))
                  }
                  className="border p-2 w-full rounded-md"
                >
                  <option value="">انتخاب نوع</option>
                  {Object.entries(typeMap).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Usage */}
              <div>
                <label className="block mb-1">
                  کاربری <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.usage}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, usage: e.target.value }))
                  }
                  className="border p-2 w-full rounded-md"
                >
                  <option value="">انتخاب کاربری</option>
                  {Object.entries(usageMap).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val}
                    </option>
                  ))}
                </select>
                {errors.usage && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.usage}
                  </p>
                )}
              </div>

              {/* Has Blocks */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasBlocks}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, hasBlocks: e.target.checked }))
                  }
                />
                دارای بلوک
              </label>

              {formData.hasBlocks && (
                <div>
                  <label className="block mb-1">
                    تعداد بلوک <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.blocksCount}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        blocksCount: toPersianDigits(e.target.value)
                      }))
                    }
                    className="border p-2 w-full rounded-md"
                  />
                  {errors.blocksCount && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      {errors.blocksCount}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block mb-1">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="border p-2 w-full rounded-md"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  ذخیره
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف ساختمان"
        message="آیا از حذف این ساختمان مطمئن هستید؟"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
