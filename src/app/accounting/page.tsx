// src/app/accounting/page.tsx

'use client';

import { useState } from 'react';
import { BanknotesIcon, PlusCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import PageTransition from '@/app/page-transition';

// در آینده این کامپوننت‌ها را خواهیم ساخت
// import AccountingSummary from '@/components/AccountingSummary';
// import AccountingTable from '@/components/AccountingTable';
// import TransactionModal from '@/components/TransactionModal';

export default function AccountingPage() {
  // state برای مدیریت باز بودن مودال‌ها در آینده
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  
  return (
    <PageTransition>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-color)]">مدیریت مالی و حسابداری</h1>
            <p className="text-sm text-[var(--text-secondary-color)] mt-1">
              دفتر کل، هزینه‌ها، درآمدها و صورتحساب واحدها
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              <PlusCircleIcon className="w-5 h-5" />
              <span>ثبت هزینه</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <ArrowDownCircleIcon className="w-5 h-5" />
              <span>ثبت درآمد</span>
            </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-opacity">
              <BanknotesIcon className="w-5 h-5" />
              <span>صدور شارژ ماهانه</span>
            </button>
          </div>
        </header>

        {/* کامپوننت‌های اصلی در اینجا قرار خواهند گرفت */}
        <div className="p-4 rounded-xl text-center border-2 border-dashed border-[var(--border-color)]">
          <p className="text-[var(--text-secondary-color)]">
            بخش دفتر کل و گزارشات به زودی در اینجا پیاده‌سازی می‌شود.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
