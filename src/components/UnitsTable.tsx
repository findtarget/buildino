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

// ... getStatusChip ...

export default function UnitsTable({ units, onEdit, onDelete }: UnitsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');

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

    // Filtering
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

    // Sorting
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
  
  const tableVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const rowVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

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
        <motion.table /* ... */ >
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
              <motion.tr key={unit.id} variants={rowVariants} /* ... */ >
                {/* ... Render cells using toPersianDigits as before ... */}
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </>
  );
}
