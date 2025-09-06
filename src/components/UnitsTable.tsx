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

  // Helper function برای تبدیل امن رشته
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };

  // Helper function برای بررسی امن شامل بودن
  const safeIncludes = (value: any, searchTerm: string): boolean => {
    const str = safeString(value).toLowerCase();
    const search = searchTerm.toLowerCase().trim();
    return str.includes(search);
  };

  // Helper function برای دریافت نام مالک
  const getOwnerName = (unit: Unit): string => {
    return safeString(unit.ownerName || unit.owner_name || '');
  };

  // Helper function برای دریافت نام مستاجر
  const getTenantName = (unit: Unit): string => {
    return safeString(unit.tenantName || unit.tenant_name || unit.residentName || '');
  };

  // Helper function برای دریافت شماره واحد
  const getUnitNumber = (unit: Unit): string => {
    return safeString(unit.unitNumber || unit.unit_number || '');
  };

  // Helper function برای تشخیص نوع واحد
  const getUnitType = (unit: Unit): 'residential' | 'commercial' => {
    if (unit.type === 'Commercial' || unit.isCommercial) return 'commercial';
    return 'residential';
  };

  const filteredAndSortedUnits = useMemo(() => {
    if (!Array.isArray(units)) return [];

    try {
      return units
        .filter(unit => {
          if (!unit) return false;

          const unitNumber = getUnitNumber(unit);
          const ownerName = getOwnerName(unit);
          const tenantName = getTenantName(unit);

          // فیلتر جستجو
          let matchesSearch = true;
          if (searchTerm.trim()) {
            matchesSearch = 
              safeIncludes(unitNumber, searchTerm) ||
              safeIncludes(ownerName, searchTerm) ||
              safeIncludes(tenantName, searchTerm);
          }

          // فیلتر نوع
          let matchesType = true;
          if (filterType !== 'all') {
            const unitType = getUnitType(unit);
            matchesType = unitType === filterType;
          }

          // فیلتر مالکیت
          let matchesOwnership = true;
          if (filterOwnership !== 'all') {
            if (filterOwnership === 'owner') {
              matchesOwnership = !tenantName;
            } else if (filterOwnership === 'tenant') {
              matchesOwnership = !!tenantName;
            }
          }

          return matchesSearch && matchesType && matchesOwnership;
        })
        .sort((a, b) => {
          let aValue, bValue;

          switch (sortBy) {
            case 'unitNumber':
              aValue = parseInt(getUnitNumber(a)) || 0;
              bValue = parseInt(getUnitNumber(b)) || 0;
              break;
            case 'area':
              aValue = Number(a.area) || 0;
              bValue = Number(b.area) || 0;
              break;
            case 'floor':
              aValue = Number(a.floor) || 0;
              bValue = Number(b.floor) || 0;
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
    } catch (error) {
      console.error('Error in filtering/sorting units:', error);
      return [];
    }
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
  const commercialUnits = units.filter(u => getUnitType(u) === 'commercial').length;
  const residentialUnits = totalUnits - commercialUnits;
  const totalArea = units.reduce((sum, u) => sum + (Number(u.area) || 0), 0);

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
              <p className="text-lg font-bold text-green-500">
                {toPersianDigits(totalArea)} م²
              </p>
            </div>
            <TruckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* فیلتر و جستجو */}
      <div
        className="p-4 rounded-xl space-y-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '2px 2px 10px var(--shadow-light), -2px -2px 10px var(--shadow-dark)'
        }}
      >
        <h3 className="text-lg font-semibold">فیلتر و جستجو</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجو بر اساس واحد، نام مالک یا مستاجر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pr-10 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)'
              }}
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50" />
          </div>

          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full p-3 pr-10 rounded-lg appearance-none"
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

          <div className="relative">
            <UsersIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50" />
            <select
              value={filterOwnership}
              onChange={(e) => setFilterOwnership(e.target.value as any)}
              className="w-full p-3 pr-10 rounded-lg appearance-none"
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
              {filteredAndSortedUnits.map((unit, index) => {
                const unitNumber = getUnitNumber(unit);
                const ownerName = getOwnerName(unit);
                const tenantName = getTenantName(unit);
                const unitType = getUnitType(unit);
                
                return (
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
                      {toPersianDigits(unitNumber)}
                    </td>
                    <td className="p-4">
                      {toPersianDigits(String(unit.floor || 0))}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {unitType === 'commercial' ? (
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
                        <span className="font-semibold">{toPersianDigits(String(unit.area || 0))} متر</span>
                        {unit.balconyArea && Number(unit.balconyArea) > 0 && (
                          <span className="text-xs opacity-60">
                            بالکن: {toPersianDigits(String(unit.balconyArea))} متر
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span>{ownerName || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {tenantName ? (
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-purple-500" />
                          <span>{tenantName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {unit.hasParking || unit.parkingSpots || unit.parkingCount ? (
                        <div className="flex items-center gap-2">
                          <TruckIcon className="w-4 h-4 text-green-500" />
                          <span className="text-green-500 font-semibold">
                            {toPersianDigits(String(unit.parkingCount || unit.parkingSpots || 1))} پارکینگ
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">ندارد</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
