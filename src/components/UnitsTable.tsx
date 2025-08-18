// src/components/UnitsTable.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PencilSquareIcon, TrashIcon, ArrowsUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Unit, UnitStatus } from '@/types/index.d';
import { toPersianDigits } from '@/lib/utils';
import UnitFormModal from './UnitFormModal'; // اضافه اگر نبود

interface UnitsTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (id: number) => void;
}

type SortKey = keyof Unit | '';
type SortOrder = 'asc' | 'desc';

export default function UnitsTable({ units, onEdit, onDelete }: UnitsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false); // برای مدال
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null); // برای ویرایش
  const [mounted, setMounted] = useState(false); // برای isClient

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUnits = useMemo(() => {
    let result = [...units];

    if (statusFilter !== 'all') {
      result = result.filter(unit => unit.status === statusFilter);
    }
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      result = result.filter(unit =>
        unit.unitNumber.includes(lowercasedFilter) ||
        unit.ownerName.toLowerCase().includes(lowercasedFilter) ||
        unit.residentName.toLowerCase().includes(lowercasedFilter)
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB, 'fa');
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [units, sortKey, sortOrder, searchTerm, statusFilter]);

  const tableHeaders: { key: SortKey; label: string }[] = [
    { key: 'unitNumber', label: 'واحد' },
    { key: 'ownerName', label: 'مالک' },
    { key: 'residentName', label: 'ساکن' },
    { key: 'ownerSince', label: 'تاریخ تملک' },
    { key: 'status', label: 'وضعیت' },
    { key: 'balance', label: 'مانده (تومان)' },
  ];

  // مثال برای باز کردن مدال (ویرایش یا اضافه)
  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
    onEdit(unit); // اگر prop باشه
  };

  const handleSubmit = (data: Omit<Unit, 'id'>) => {
    // هندل سابمیت (ویرایش یا اضافه)
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="جستجو در واحد، مالک، ساکن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UnitStatus | 'all')}
          className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="Vacant">خالی</option>
          <option value="OwnerOccupied">مالک ساکن</option>
          <option value="TenantOccupied">مستاجر ساکن</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
        <motion.table className="w-full text-[var(--text-color)]">
          <thead style={{ backgroundColor: 'var(--bg-color)' }}>
            <tr>
              {tableHeaders.map(({key, label}) => (
                <th key={key} className="p-4 font-semibold cursor-pointer" onClick={() => handleSort(key)}>
                  <div className="flex items-center gap-2">
                    {label}
                    {sortKey === key ? (sortOrder === 'asc' ? '▲' : '▼') : <ArrowsUpDownIcon className="w-4 h-4 opacity-30" />}
                  </div>
                </th>
              ))}
              <th className="p-4 font-semibold text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUnits.map((unit) => (
              <motion.tr key={unit.id} className="border-t border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="p-4 text-center">{toPersianDigits(unit.unitNumber)}</td>
                <td className="p-4">{unit.ownerName}</td>
                <td className="p-4">{unit.residentName}</td>
                <td className="p-4 text-center">{toPersianDigits(unit.ownerSince || '-')}</td>
                <td className="p-4 text-center">{/* getStatusChip(unit.status) */}</td>
                <td className="p-4 text-center">{toPersianDigits(unit.balance.toLocaleString())}</td>
                <td className="p-4 flex justify-center gap-3">
                  <button onClick={() => handleEdit(unit)}><PencilSquareIcon className="w-5 h-5 text-[var(--accent-color)] hover:scale-110 transition" /></button>
                  <button onClick={() => onDelete(unit.id)}><TrashIcon className="w-5 h-5 text-red-500 hover:scale-110 transition" /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
      <UnitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedUnit}
        isClient={mounted}
      />
    </>
  );
}
