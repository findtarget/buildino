// src/components/UnitsTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PencilSquareIcon, TrashIcon, ArrowsUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Unit, UnitStatus } from '@/types/index.d';
import { toPersianDigits } from '@/lib/utils';

interface UnitsTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (id: number) => void;
}

type SortKey = keyof Unit | '';
type SortOrder = 'asc' | 'desc';

// F: [جدید] کامپوننت داخلی برای نمایش زیبای وضعیت
const StatusChip = ({ status }: { status: UnitStatus }) => {
  const statusStyles: Record<UnitStatus, { text: string; className: string }> = {
    OwnerOccupied: { text: 'مالک ساکن', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    TenantOccupied: { text: 'مستاجر ساکن', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    Vacant: { text: 'خالی', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  };
  const { text, className } = statusStyles[status];
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>{text}</span>;
};

export default function UnitsTable({ units, onEdit, onDelete }: UnitsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('unitNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUnits = useMemo(() => {
    let result = [...units];

    if (statusFilter !== 'all') result = result.filter(unit => unit.status === statusFilter);
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase().trim();
      result = result.filter(unit =>
        toPersianDigits(unit.unitNumber).includes(lowercasedFilter) ||
        unit.ownerName.toLowerCase().includes(lowercasedFilter) ||
        unit.residentName.toLowerCase().includes(lowercasedFilter) ||
        unit.ownerNationalId?.includes(lowercasedFilter)
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') comparison = valA.localeCompare(valB, 'fa');
        else if (typeof valA === 'number' && typeof valB === 'number') comparison = valA - valB;
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }
    return result;
  }, [units, sortKey, sortOrder, searchTerm, statusFilter]);

  const tableHeaders: { key: SortKey; label: string; className?: string }[] = [
    { key: 'unitNumber', label: 'واحد', className: 'text-center' },
    { key: 'ownerName', label: 'مالک' },
    { key: 'residentName', label: 'ساکن' },
    { key: 'status', label: 'وضعیت', className: 'text-center' },
    { key: 'balance', label: 'مانده (تومان)', className: 'text-center' },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 rounded-xl bg-[var(--bg-secondary)]">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="جستجو در واحد، مالک، ساکن، کد ملی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--accent-color)]"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UnitStatus | 'all')}
          className="p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--accent-color)]"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="Vacant">خالی</option>
          <option value="OwnerOccupied">مالک ساکن</option>
          <option value="TenantOccupied">مستاجر ساکن</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
        <table className="w-full text-sm text-[var(--text-color)]">
          <thead className="bg-[var(--bg-secondary)] text-xs uppercase text-[var(--text-secondary-color)]">
            <tr>
              {tableHeaders.map(({key, label, className}) => (
                <th key={key} className={`p-3 cursor-pointer ${className || 'text-right'}`} onClick={() => handleSort(key)}>
                  <div className={`flex items-center gap-2 ${className ? 'justify-center' : ''}`}>
                    {label}
                    <ArrowsUpDownIcon className={`w-4 h-4 transition-opacity ${sortKey === key ? 'opacity-100' : 'opacity-30'}`} />
                  </div>
                </th>
              ))}
              <th className="p-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUnits.map((unit) => (
              <tr key={unit.id} className="border-t border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="p-3 text-center font-bold">{toPersianDigits(unit.unitNumber)}</td>
                <td className="p-3 whitespace-nowrap">{unit.ownerName}</td>
                <td className="p-3 whitespace-nowrap">{unit.residentName}</td>
                <td className="p-3 text-center"><StatusChip status={unit.status} /></td>
                <td className={`p-3 text-center whitespace-nowrap font-mono ${unit.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>{toPersianDigits(unit.balance.toLocaleString())}</td>
                <td className="p-3">
                  <div className="flex justify-center items-center gap-4">
                    <button onClick={() => onEdit(unit)} className="text-blue-500 hover:text-blue-700 transition-colors" aria-label={`ویرایش واحد ${unit.unitNumber}`}><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => onDelete(unit.id)} className="text-red-500 hover:text-red-700 transition-colors" aria-label={`حذف واحد ${unit.unitNumber}`}><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
