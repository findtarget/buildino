// src/app/accounting/trial-balance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import CustomDatePicker from '@/components/CustomDatePicker';
import { AccountType, TrialBalanceEntry } from '@/types/accounting';
import { toPersianDigits, formatCurrency } from '@/lib/utils';

interface TrialBalanceData {
  entries: TrialBalanceEntry[];
  totals: {
    totalDebit: number;
    totalCredit: number;
  };
  byAccountType: Record<AccountType, {
    accounts: TrialBalanceEntry[];
    total: number;
    count: number;
  }>;
  summary: {
    totalAccounts: number;
    activeAccounts: number;
    accountsWithActivity: number;
    isBalanced: boolean;
    period: {
      from: string;
      to: string;
    };
  };
}

const TrialBalancePage = () => {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | 'all'>('all');

  const accountTypeLabels = {
    [AccountType.Asset]: 'دارایی‌ها',
    [AccountType.Liability]: 'بدهی‌ها',
    [AccountType.Equity]: 'حقوق صاحبان سهام',
    [AccountType.Revenue]: 'درآمدها',
    [AccountType.Expense]: 'هزینه‌ها'
  };

  useEffect(() => {
    fetchTrialBalance();
  }, [dateFrom, dateTo, showZeroBalances, includeInactive]);

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateFrom: dateFrom.toISOString().split('T')[0],
        dateTo: dateTo.toISOString().split('T')[0],
        showZeroBalances: showZeroBalances.toString(),
        includeInactive: includeInactive.toString()
      });

      const response = await fetch(`/api/accounting/trial-balance?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Error fetching trial balance:', result.error);
      }
    } catch (error) {
      console.error('Error fetching trial balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = data?.entries.filter(entry => 
    selectedAccountType === 'all' || entry.accountType === selectedAccountType
  ) || [];

  const exportToPDF = async () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting to PDF...');
  };

  const exportToExcel = async () => {
    // TODO: Implement Excel export functionality
    console.log('Exporting to Excel...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="میزان‌نامه" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* فیلترها */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                از تاریخ
              </label>
              <CustomDatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="انتخاب تاریخ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تا تاریخ
              </label>
              <CustomDatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder="انتخاب تاریخ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع حساب
              </label>
              <select
                value={selectedAccountType}
                onChange={(e) => setSelectedAccountType(e.target.value as AccountType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">همه انواع</option>
                {Object.entries(accountTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchTrialBalance}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showZeroBalances}
                onChange={(e) => setShowZeroBalances(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">نمایش حساب‌های بدون مانده</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">شامل حساب‌های غیرفعال</span>
            </label>
          </div>
        </div>

        {/* خلاصه آمار */}
        {data && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">تعداد حساب‌ها</div>
              <div className="text-2xl font-bold text-blue-600">
                {toPersianDigits(data.summary.totalAccounts.toString())}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">مجموع بدهکار</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.totals.totalDebit)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">مجموع بستانکار</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.totals.totalCredit)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">وضعیت تراز</div>
              <div className={`text-2xl font-bold ${data.summary.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                {data.summary.isBalanced ? '✓ متعادل' : '✗ نامتعادل'}
              </div>
            </div>
          </div>
        )}

        {/* جدول میزان‌نامه */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">میزان‌نامه</h3>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={exportToPDF}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Download className="h-4 w-4 ml-2" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Download className="h-4 w-4 ml-2" />
                Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    کد حساب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نام حساب
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بدهکار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بستانکار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مانده خالص
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      داده‌ای یافت نشد
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.accountId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {entry.accountCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {entry.accountTitle}
                          {!entry.isActive && (
                            <span className="mr-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              غیرفعال
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.accountType === AccountType.Asset ? 'bg-blue-100 text-blue-800' :
                          entry.accountType === AccountType.Liability ? 'bg-red-100 text-red-800' :
                          entry.accountType === AccountType.Equity ? 'bg-purple-100 text-purple-800' :
                          entry.accountType === AccountType.Revenue ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {accountTypeLabels[entry.accountType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono text-right">
                        {entry.debitBalance > 0 ? formatCurrency(entry.debitBalance) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono text-right">
                        {entry.creditBalance > 0 ? formatCurrency(entry.creditBalance) : '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono text-right ${
                        entry.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(entry.netBalance))}
                        {entry.netBalance < 0 && ' (بستانکار)'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data && filteredEntries.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr className="font-bold">
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-900">
                      مجموع کل
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono text-right">
                      {formatCurrency(filteredEntries.reduce((sum, entry) => sum + entry.debitBalance, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono text-right">
                      {formatCurrency(filteredEntries.reduce((sum, entry) => sum + entry.creditBalance, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono text-right">
                      {formatCurrency(Math.abs(filteredEntries.reduce((sum, entry) => sum + entry.netBalance, 0)))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialBalancePage;
