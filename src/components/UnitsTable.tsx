'use client';

import { useState, useMemo } from 'react';
import { Unit } from '@/types/index.d';
import { toPersianDigits } from '@/lib/utils';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserIcon,
  UsersIcon,
  Square3Stack3DIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface UnitsTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (id: number) => void;
}

export default function UnitsTable({ units, onEdit, onDelete }: UnitsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'residential' | 'commercial'>('all');
  const [filterOwnership, setFilterOwnership] = useState<'all' | 'owner' | 'tenant'>('all');
  const [sortBy, setSortBy] = useState<'unitNumber' | 'area' | 'floor'>('unitNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedUnits = useMemo(() => {
    return units
      .filter(unit => {
        const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.tenantName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'all' || 
          (filterType === 'commercial' && unit.isCommercial) ||
          (filterType === 'residential' && !unit.isCommercial);
        
        const matchesOwnership = filterOwnership === 'all' ||
          (filterOwnership === 'owner' && !unit.tenantName) ||
          (filterOwnership === 'tenant' && unit.tenantName);
        
        return matchesSearch && matchesType && matchesOwnership;
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'unitNumber':
            aValue = parseInt(a.unitNumber) || 0;
            bValue = parseInt(b.unitNumber) || 0;
            break;
          case 'area':
            aValue = a.area;
            bValue = b.area;
            break;
          case 'floor':
            aValue = a.floor;
            bValue = b.floor;
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [units, searchTerm, filterType, filterOwnership, sortBy, sortOrder]);

  const handleSort = (field: 'unitNumber' | 'area' | 'floor') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'unitNumber' | 'area' | 'floor') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ArrowUpIcon className="w-4 h-4 inline ml-1" /> : 
      <ArrowDownIcon className="w-4 h-4 inline ml-1" />;
  };

  const totalUnits = units.length;
  const commercialUnits = units.filter(u => u.isCommercial).length;
  const residentialUnits = totalUnits - commercialUnits;
  const totalArea = units.reduce((sum, u) => sum + u.area, 0);

  return (
    <div className="space-y-6">
      {/* خلاصه آمار */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">کل واحدها</p>
              <p className="text-lg font-bold" style={{ color: 'var(--accent-color)' }}>
                {toPersianDigits(totalUnits)}
              </p>
            </div>
            <Square3Stack3DIcon className="w-8 h-8" style={{ color: 'var(--accent-color)' }} />
          </div>
        </div>

        <div 
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">مسکونی</p>
              <p className="text-lg font-bold text-blue-500">
                {toPersianDigits(residentialUnits)}
              </p>
            </div>
            <HomeIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div 
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">تجاری</p>
              <p className="text-lg font-bold text-orange-500">
                {toPersianDigits(commercialUnits)}
              </p>
            </div>
            <BuildingOfficeIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div 
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">کل متراژ</p>
              <p className="text-lg font-bold text-emerald-500">
                {toPersianDigits(totalArea)} متر
              </p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center text-emerald-500 border-2 border-emerald-500 rounded">
              <span className="text-sm font-bold">م²</span>
            </div>
          </div>
        </div>
      </div>

      {/* فیلتر و جستجو */}
      <div 
        className="p-4 rounded-xl"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)'
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در واحدها، نام مالک یا مستاجر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 p-2 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)'
              }}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'residential' | 'commercial')}
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)'
                }}
              >
                <option value="all">همه انواع</option>
                <option value="residential">مسکونی</option>
                <option value="commercial">تجاری</option>
              </select>
            </div>

            <select
              value={filterOwnership}
              onChange={(e) => setFilterOwnership(e.target.value as 'all' | 'owner' | 'tenant')}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)'
              }}
            >
              <option value="all">مالک و مستاجر</option>
              <option value="owner">فقط مالک</option>
              <option value="tenant">دارای مستاجر</option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-color)' }}>
              <tr>
                <th className="p-4 text-right font-semibold">عملیات</th>
                <th 
                  className="p-4 text-right font-semibold cursor-pointer hover:bg-white/5"
                  onClick={() => handleSort('unitNumber')}
                >
                  شماره واحد {getSortIcon('unitNumber')}
                </th>
                <th 
                  className="p-4 text-right font-semibold cursor-pointer hover:bg-white/5"
                  onClick={() => handleSort('floor')}
                >
                  طبقه {getSortIcon('floor')}
                </th>
                <th className="p-4 text-right font-semibold">نوع</th>
                <th 
                  className="p-4 text-right font-semibold cursor-pointer hover:bg-white/5"
                  onClick={() => handleSort('area')}
                >
                  متراژ {getSortIcon('area')}
                </th>
                <th className="p-4 text-right font-semibold">مالک</th>
                <th className="p-4 text-right font-semibold">مستاجر</th>
                <th className="p-4 text-right font-semibold">پارکینگ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUnits.map((unit, index) => (
                <tr 
                  key={unit.id}
                  className={`border-t ${index % 2 === 0 ? '' : 'bg-white/5'}`}
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(unit)}
                        className="p-1 rounded hover:bg-blue-500/20 text-blue-500"
                        title="ویرایش"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(unit.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-500"
                        title="حذف"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-medium">
                    {toPersianDigits(unit.unitNumber)}
                  </td>
                  <td className="p-4">
                    {toPersianDigits(unit.floor)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {unit.isCommercial ? (
                        <>
                          <BuildingOfficeIcon className="w-4 h-4 text-orange-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-500">
                            تجاری
                          </span>
                        </>
                      ) : (
                        <>
                          <HomeIcon className="w-4 h-4 text-blue-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-500">
                            مسکونی
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{toPersianDigits(unit.area)} متر</span>
                      {unit.balconyArea > 0 && (
                        <span className="text-xs opacity-60">
                          بالکن: {toPersianDigits(unit.balconyArea)} متر
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span>{unit.ownerName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {unit.tenantName ? (
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-purple-500" />
                        <span>{unit.tenantName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {unit.hasParking ? (
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-semibold">
                          {toPersianDigits(unit.parkingCount || 1)} پارکینگ
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">ندارد</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUnits.length === 0 && (
          <div className="p-8 text-center opacity-50">
            <p>واحدی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
