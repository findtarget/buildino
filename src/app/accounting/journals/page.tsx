///src/app/accounting/journals/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Eye, FileText, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import { JournalStatus } from '@/types/accounting';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import JournalEntryModal from '@/components/JournalEntryModal';

interface JournalEntry {
  id: string;
  journalNumber: string;
  date: string;
  reference?: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: JournalStatus;
  createdBy?: string;
  approvedBy?: string;
  attachments?: string;
  createdAt: string;
  updatedAt: string;
  lines: JournalEntryLine[];
}

interface JournalEntryLine {
  id: string;
  accountId: string;
  account: {
id: string;
code: string;
title: string;
type: string;
  };
  debit: number;
  credit: number;
  description?: string;
}

const JournalEntriesPage = () => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<JournalStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [viewingJournal, setViewingJournal] = useState<JournalEntry | null>(null);

  const statusLabels = {
Draft: 'پیش‌نویس',
Posted: 'ثبت شده',
Reversed: 'برگشت خورده'
  };

  useEffect(() => {
fetchJournals();
  }, [selectedStatus, dateFrom, dateTo]);

  const fetchJournals = async () => {
try {
setLoading(true);
const params = new URLSearchParams({
page: '1',
limit: '50'
});

if (selectedStatus !== 'all') {
params.append('status', selectedStatus);
}
if (dateFrom) {
params.append('dateFrom', dateFrom);
}
if (dateTo) {
params.append('dateTo', dateTo);
}

const response = await fetch(`/api/journals?${params.toString()}`);
const result = await response.json();

if (result.success) {
setJournals(result.data.journals);
} else {
console.error('Error fetching journals:', result.error);
}
} catch (error) {
console.error('Error fetching journals:', error);
} finally {
setLoading(false);
}
  };

  const handleCreateJournal = () => {
setEditingJournal(null);
setShowModal(true);
  };

  const handleEditJournal = (journal: JournalEntry) => {
if (journal.status !== JournalStatus.Draft) {
alert('فقط اسناد پیش‌نویس قابل ویرایش هستند');
return;
}
setEditingJournal(journal);
setShowModal(true);
  };

  const handlePostJournal = async (journalId: string) => {
try {
const response = await fetch(`/api/journals/${journalId}/post`, {
method: 'POST'
});

const result = await response.json();

if (result.success) {
fetchJournals();
alert('سند با موفقیت ثبت شد');
} else {
alert(result.error);
}
} catch (error) {
console.error('Error posting journal:', error);
alert('خطا در ثبت سند');
}
  };

  const filteredJournals = journals.filter(journal => {
const matchesSearch = searchTerm === '' || 
journal.journalNumber.includes(searchTerm) ||
journal.description.includes(searchTerm) ||
(journal.reference && journal.reference.includes(searchTerm));

return matchesSearch;
  });

  return (
<div className="min-h-screen bg-gray-50">
<Header title="اسناد حسابداری" />

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{/* فیلترها و جستجو */}
<div className="mb-6 bg-white rounded-lg shadow-sm p-6">
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
جستجو
</label>
<div className="relative">
<Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
<input
type="text"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
placeholder="شماره سند، توضیحات..."
/>
</div>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
وضعیت
</label>
<select
value={selectedStatus}
onChange={(e) => setSelectedStatus(e.target.value as JournalStatus | 'all')}
className="w-full px-3 py-2 border border-gray-300 rounded-d focus:outline-none focus:ring-1 focus:ring-blue-500"
>
<option value="all">همه وضعیت‌ها</option>
{Object.entries(statusLabels).map(([value, label]) => (
<option key={value} value={value}>{label}</option>
))}
</select>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
از تاریخ
</label>
<input
type="date"
value={dateFrom}
onChange={(e) => setDateFrom(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
/>
</div>

<div>
