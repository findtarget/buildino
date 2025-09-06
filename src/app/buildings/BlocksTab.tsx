// src/app/buildings/BlocksTab.tsx

'use client';

import { useEffect, useState } from 'react';
import { useActiveBuilding } from '@/app/context/ActiveBuildingContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOffice2Icon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { toPersianDigits, toEnglishDigits } from '@/lib/utils';

interface Block {
  id: number;
  name: string;
  floorsCount?: number;
  description?: string;
}

export default function BlocksTab() {
  const { buildingId } = useActiveBuilding();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Block | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    floorsCount: '',
    description: ''
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // validate form
  const validateForm = () => {
    const errs: { [k: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'نام بلوک الزامیست';
    return errs;
  };

  // load data with new endpoint
  const loadBlocks = async () => {
    if (!buildingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blocks?buildingId=${buildingId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setBlocks(json.data || []);
      }
    } catch (err) {
      console.error('Error loading blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [buildingId]);

  const resetForm = () => {
    setFormData({ name: '', floorsCount: '', description: '' });
    setEditing(null);
    setErrors({});
  };

  const handleEdit = (blk: Block) => {
    setEditing(blk);
    setFormData({
      name: blk.name,
      floorsCount: blk.floorsCount ? toPersianDigits(blk.floorsCount) : '',
      description: blk.description || ''
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleDelete = (blk: Block) => {
    setDeleteTarget(blk);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      // DELETE API
      await fetch(`/api/blocks/${deleteTarget.id}`, { method: 'DELETE' });
      loadBlocks();
    } catch (err) {
      console.error('Error deleting block:', err);
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
      name: formData.name,
      floorsCount: formData.floorsCount
        ? Number(toEnglishDigits(formData.floorsCount))
        : null,
      description: formData.description,
      buildingId
    };

    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `/api/blocks/${editing.id}`
      : `/api/blocks`;

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
        loadBlocks();
      } else {
        alert(json.error || 'خطا در ذخیره بلوک');
      }
    } catch (err) {
      console.error('Error saving block:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!buildingId) {
    return (
      <p className="text-gray-500">
        لطفا ابتدا یک ساختمان را از تب «ساختمان‌ها» انتخاب کنید.
      </p>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">بلوک‌ها و طبقات ساختمان</h2>
        <button
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          افزودن بلوک
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
                <th className="p-3 text-right">نام بلوک</th>
                <th className="p-3 text-right">تعداد طبقات</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((blk) => (
                <motion.tr
                  key={blk.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ backgroundColor: 'var(--bg-color)' }}
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <td className="p-3">{blk.name}</td>
                  <td className="p-3">
                    {blk.floorsCount
                      ? toPersianDigits(blk.floorsCount)
                      : '-'}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(blk)}
                      className="p-1 rounded-lg bg-yellow-400 hover:bg-yellow-500"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blk)}
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
                  {editing ? 'ویرایش بلوک' : 'افزودن بلوک'}
                </h2>
              </div>
              <p className="text-sm opacity-70">لطفا فیلدهای ستاره‌دار را تکمیل کنید.</p>

              {/* Name */}
              <div>
                <label className="block mb-1">
                  نام بلوک <span className="text-red-500">*</span>
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

              {/* Floors Count */}
              <div>
                <label className="block mb-1">تعداد طبقات</label>
                <input
                  type="text"
                  value={formData.floorsCount}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      floorsCount: toPersianDigits(e.target.value)
                    }))
                  }
                  className="border p-2 w-full rounded-md"
                />
              </div>

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
        title="حذف بلوک"
        message="آیا از حذف این بلوک مطمئن هستید؟"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
