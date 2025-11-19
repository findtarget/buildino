// src/app/accounting/chart-of-accounts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, FolderOpen, Folder, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { AccountType, Account } from '@/types/accounting';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import AccountFormModal from '@/components/AccountFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

interface AccountWithMetrics extends Account {
  _count: {
    children: number;
    journalLines: number;
    transactions: number;
  };
  totalBalance?: number;
  lastActivity?: string;
}

const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState<AccountWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithMetrics | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<AccountWithMetrics | null>(null);
  const [stats, setStats] = useState<any>(null);

  const accountTypeLabels = {
    Asset: 'دارایی‌ها',
    Liability: 'بدهی‌ها', 
    Equity: 'حقوق صاحبان سهام',
    Revenue: 'درآمدها',
    Expense: 'هزینه‌ها'
  };

  const accountTypeColors = {
    Asset: 'bg-blue-50 text-blue-700 border-blue-200',
    Liability: 'bg-red-50 text-red-700 border-red-200',
    Equity: 'bg-purple-50 text-purple-700 border-purple-200', 
    Revenue: 'bg-green-50 text-green-700 border-green-200',
    Expense: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  useEffect(() => {
    fetchAccounts();
  }, [selectedType]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }

      const response = await fetch(`/api/accounting/chart-of-accounts?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setAccounts(result.data.accounts);
        setStats(result.data.stats);
      } else {
        console.error('Error fetching accounts:', result.error);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  const handleEditAccount = (account: AccountWithMetrics) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccount) return;

    try {
      const response = await fetch(`/api/accounting/chart-of-accounts/${deleteAccount.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setAccounts(accounts.filter(acc => acc.id !== deleteAccount.id));
        setDeleteAccount(null);
        fetchAccounts(); // بروزرسانی آمار
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('خطا در حذف حساب');
    }
  };

  const buildAccountTree = (accounts: AccountWithMetrics[]): AccountWithMetrics[] => {
    const accountMap = new Map<string, AccountWithMetrics>();
    const rootAccounts: AccountWithMetrics[] = [];

    // ایجاد نقشه حساب‌ها
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // ساخت درخت
    accounts.forEach(account => {
      const accountNode = accountMap.get(account.id)!;
      if (account.parentId) {
        const parentNode = accountMap.get(account.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(accountNode);
        } else {
          rootAccounts.push(accountNode);
        }
      } else {
        rootAccounts.push(accountNode);
      }
    });

    return rootAccounts;
  };

  const renderAccountRow = (account: AccountWithMetrics, level: number = 0): JSX.Element[] => {
    const hasChildren = account._count.children > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const indent = level * 24;
    const hasActivity = account._count.transactions > 0 || account._count.journalLines > 0;

    const matchesSearch = searchTerm === '' ||
      account.title.includes(searchTerm) ||
      account.code.includes(searchTerm);

    if (!matchesSearch) {
      return [];
    }

    const rows = [
      <tr key={account.id} className="hover:bg-gray-50 transition-colors duration-150">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingRight: `${indent}px` }}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(account.id)}
                className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-gray-600" />
                ) : (
                  <Folder className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <FileText className="h-4 w-4 text-gray-400 ml-2 mr-1" />
            )}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {toPersianDigits(account.code)}
                </span>
                <span className="font-medium text-gray-900">
                  {account.title}
                </span>
                {hasActivity && (
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                    <span className="text-xs text-green-600">فعال</span>
                  </div>
                )}
              </div>
              {account.titleEn && (
                <span className="text-xs text-gray-500 mt-1" dir="ltr">
                  {account.titleEn}
                </span>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${accountTypeColors[account.type]}`}>
            {accountTypeLabels[account.type]}
          </span>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs rounded-full">
            {toPersianDigits(account.level.toString())}
          </span>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-center space-x-1 space-x-reverse">
              <FileText className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {toPersianDigits(account._count.journalLines.toString())} سند
              </span>
            </div>
            <div className="flex items-center justify-center space-x-1 space-x-reverse">
              <TrendingUp className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {toPersianDigits(account._count.transactions.toString())} تراکنش
              </span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex items-center justify-center">
            {account.isActive ? (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
                <span className="text-green-700 text-sm font-medium">فعال</span>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full ml-2"></div>
                <span className="text-red-700 text-sm font-medium">غیرفعال</span>
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex justify-center space-x-1 space-x-reverse">
            <button
              onClick={() => handleEditAccount(account)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="ویرایش"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteAccount(account)}
              disabled={hasActivity}
              className={`p-2 rounded-lg transition-colors ${
                hasActivity 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:text-red-800 hover:bg-red-50'
              }`}
              title={hasActivity ? 'حساب دارای تراکنش است' : 'حذف'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    ];

    // اضافه کردن ردیف‌های فرزند
    if (isExpanded && account.children) {
      account.children.forEach(child => {
        rows.push(...renderAccountRow(child, level + 1));
      });
    }

    return rows;
  };

  const filteredAccounts = buildAccountTree(accounts).filter(account => {
    const matchesSearch = searchTerm === '' ||
      account.title.includes(searchTerm) ||
      account.code.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="دفتر حساب‌ها" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* آمار کلی */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">کل حساب‌ها</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {toPersianDigits(stats.total.toString())}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-300">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {accountTypeLabels[type as AccountType]}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {toPersianDigits(count.toString())}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* فیلترها و جستجو */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                جستجو در حساب‌ها
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="نام حساب، کد حساب..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع حساب
              </label>
              <div className="relative">
                <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as AccountType | 'all')}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">همه انواع</option>
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCreateAccount}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4 ml-2" />
                حساب جدید
              </button>
            </div>
          </div>
        </div>

        {/* جدول حساب‌ها */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    کد و نام حساب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    سطح
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    فعالیت
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 ml-3"></div>
                        در حال بارگذاری...
                      </div>
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium mb-2">هیچ حسابی یافت نشد</p>
                        <p className="text-sm">برای شروع، یک حساب جدید ایجاد کنید</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.flatMap(account => renderAccountRow(account))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مودال فرم حساب */}
      {showModal && (
        <AccountFormModal
          account={editingAccount}
          onClose={() => setShowModal(false)}
          onSave={fetchAccounts}
        />
      )}

      {/* مودال تایید حذف */}
      {deleteAccount && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeleteAccount(null)}
          onConfirm={handleDeleteAccount}
          title="حذف حساب"
          message={`آیا از حذف حساب "${deleteAccount.title}" اطمینان دارید؟`}
          confirmText="حذف"
          cancelText="انصراف"
        />
      )}
    </div>
  );
};

export default ChartOfAccountsPage;
