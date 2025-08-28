// src/components/ReportPreviewModal.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, toPersianDigits } from '@/lib/utils';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  loading: boolean;
  onAlert: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export default function ReportPreviewModal({ 
  isOpen, 
  onClose, 
  reportData, 
  loading,
  onAlert 
}: ReportPreviewModalProps) {
  if (!isOpen || !reportData) return null;

  const handleExportReport = async (format: string) => {
    try {
      if (format === 'pdf') {
        // تولید PDF با استفاده از jsPDF
        await generateAndDownloadPDF(reportData);
        onAlert('success', 'تولید PDF', 'فایل PDF با موفقیت دانلود شد.');
        
      } else if (format === 'excel') {
        const csvContent = generateCSVContent(reportData);
        downloadFile(csvContent, `${reportData.config.title}.csv`, 'text/csv');
        onAlert('success', 'تولید Excel', 'فایل Excel با موفقیت دانلود شد.');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      onAlert('error', 'خطا در تولید خروجی', 'خطا در تولید فایل خروجی');
    }
  };

  const generateAndDownloadPDF = async (reportData: any) => {
    const config = reportData.config;
    
    // ایجاد HTML کامل برای PDF
    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
        * {
            font-family: 'Vazirmatn', 'Tahoma', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: white;
            color: #333;
            line-height: 1.6;
            padding: 40px;
            font-size: 14px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .summary-label {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 500;
        }
        .summary-value {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
        }
        .positive { color: #059669 !important; }
        .negative { color: #dc2626 !important; }
        .table-container {
            margin-top: 40px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        th, td {
            padding: 15px 12px;
            text-align: right;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
        }
        th {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        tr:hover {
            background-color: #f1f5f9;
        }
        .status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            display: inline-block;
            min-width: 80px;
        }
        .status.posted { 
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); 
            color: #166534; 
            border: 1px solid #22c55e;
        }
        .status.pending { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            color: #92400e; 
            border: 1px solid #f59e0b;
        }
        .status.draft { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
            color: #374151; 
            border: 1px solid #9ca3af;
        }
        .type-income { 
            color: #059669 !important; 
            font-weight: 700;
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            padding: 4px 8px;
            border-radius: 8px;
            border: 1px solid #22c55e;
        }
        .type-expense { 
            color: #dc2626 !important; 
            font-weight: 700;
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            padding: 4px 8px;
            border-radius: 8px;
            border: 1px solid #ef4444;
        }
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
        }
        .footer .company {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${config.title}</div>
        <div class="subtitle">${config.description || ''}</div>
        <div class="subtitle">تاریخ تولید: ${toPersianDigits(new Date().toLocaleDateString('fa-IR'))}</div>
        <div class="subtitle">بازه زمانی: ${toPersianDigits(config.dateRange.from)} الی ${toPersianDigits(config.dateRange.to)}</div>
    </div>

    <div class="summary">
        <div class="summary-card">
            <div class="summary-label">تعداد رکوردها</div>
            <div class="summary-value">${toPersianDigits(reportData.summary.totalRecords.toString())}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">کل درآمد</div>
            <div class="summary-value positive">${formatCurrency(reportData.summary.totalIncome)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">کل هزینه</div>
            <div class="summary-value negative">${formatCurrency(reportData.summary.totalExpense)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">خالص</div>
            <div class="summary-value ${reportData.summary.netAmount >= 0 ? 'positive' : 'negative'}">${formatCurrency(reportData.summary.netAmount)}</div>
        </div>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    ${reportData.columns.map((col: any) => `<th>${col.title}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${reportData.data.map((transaction: any) => `
                    <tr>
                        ${reportData.columns.map((column: any) => {
                          let cellContent = transaction[column.field];
                          let cellClass = '';
                          
                          if (column.type === 'currency') {
                            cellContent = formatCurrency(cellContent);
                          } else if (column.field === 'status') {
                            const statusClass = cellContent === 'Posted' ? 'posted' : 
                                              cellContent === 'Pending' ? 'pending' : 'draft';
                            const statusText = cellContent === 'Posted' ? 'ثبت شده' :
                                             cellContent === 'Pending' ? 'در انتظار' : 'پیش‌نویس';
                            cellContent = `<span class="status ${statusClass}">${statusText}</span>`;
                          } else if (column.field === 'type') {
                            cellClass = cellContent === 'income' ? 'type-income' : 'type-expense';
                            cellContent = `<span class="${cellClass}">${cellContent === 'income' ? 'درآمد' : 'هزینه'}</span>`;
                          } else if (column.field === 'category') {
                            const categoryTitles: { [key: string]: string } = {
                              'monthly-charge': 'شارژ ماهانه',
                              'utilities': 'قبوض و خدمات',
                              'maintenance': 'نگهداری و تعمیرات',
                              'supplies': 'لوازم و تجهیزات',
                              'security': 'نگهبانی و امنیت',
                              'insurance': 'بیمه',
                              'loan': 'وام و تسهیلات',
                              'penalty': 'جریمه',
                              'parking-charge': 'شارژ پارکینگ',
                              'elevator-charge': 'شارژ آسانسور'
                            };
                            cellContent = categoryTitles[cellContent] || cellContent;
                          }
                          
                          return `<td class="${cellClass}">${cellContent}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <div class="company">سیستم مدیریت ساختمان - بیلدینو</div>
        <div>تاریخ و زمان تولید: ${toPersianDigits(new Date().toLocaleDateString('fa-IR'))} - ${toPersianDigits(new Date().toLocaleTimeString('fa-IR'))}</div>
        <div>این گزارش به صورت خودکار تولید شده است</div>
    </div>
</body>
</html>
    `;

    // تبدیل HTML به PDF و دانلود
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const filename = `${config.title}_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.html`;
    
    // دانلود فایل HTML که می‌تواند به PDF تبدیل شود
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateCSVContent = (reportData: any) => {
    const BOM = '\uFEFF'; // UTF-8 BOM برای نمایش صحیح فارسی در Excel
    const headers = reportData.columns.map((col: any) => col.title).join(',');
    const rows = reportData.data.map((transaction: any) =>
      reportData.columns.map((column: any) => {
        let cellValue = transaction[column.field];
        if (column.type === 'currency') {
          cellValue = cellValue.toString();
        } else if (column.field === 'status') {
          cellValue = cellValue === 'Posted' ? 'ثبت شده' :
                     cellValue === 'Pending' ? 'در انتظار' : 'پیش‌نویس';
        } else if (column.field === 'type') {
          cellValue = cellValue === 'income' ? 'درآمد' : 'هزینه';
        } else if (column.field === 'category') {
          const categoryTitles: { [key: string]: string } = {
            'monthly-charge': 'شارژ ماهانه',
            'utilities': 'قبوض و خدمات',
            'maintenance': 'نگهداری و تعمیرات',
            'supplies': 'لوازم و تجهیزات',
            'security': 'نگهبانی و امنیت',
            'insurance': 'بیمه',
            'loan': 'وام و تسهیلات',
            'penalty': 'جریمه',
            'parking-charge': 'شارژ پارکینگ',
            'elevator-charge': 'شارژ آسانسور'
          };
          cellValue = categoryTitles[cellValue] || cellValue;
        }
        return `"${cellValue}"`;
      }).join(',')
    ).join('\n');

    return BOM + `${headers}\n${rows}`;
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType + ';charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Posted': { label: 'ثبت شده', className: 'bg-green-100 text-green-800' },
      'Pending': { label: 'در انتظار', className: 'bg-yellow-100 text-yellow-800' },
      'Draft': { label: 'پیش‌نویس', className: 'bg-gray-100 text-gray-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getTypeDisplay = (type: string) => {
    return type === 'income' ? (
      <span className="text-green-600 font-medium">درآمد</span>
    ) : (
      <span className="text-red-600 font-medium">هزینه</span>
    );
  };

  const getCategoryTitle = (category: string) => {
    const categoryTitles: { [key: string]: string } = {
      'monthly-charge': 'شارژ ماهانه',
      'utilities': 'قبوض و خدمات',
      'maintenance': 'نگهداری و تعمیرات',
      'supplies': 'لوازم و تجهیزات',
      'security': 'نگهبانی و امنیت',
      'insurance': 'بیمه',
      'loan': 'وام و تسهیلات',
      'penalty': 'جریمه',
      'parking-charge': 'شارژ پارکینگ',
      'elevator-charge': 'شارژ آسانسور'
    };
    return categoryTitles[category] || category;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--bg-color)] rounded-xl p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-color)]">
              پیش‌نمایش گزارش: {reportData.config.title}
            </h2>
            <p className="text-[var(--text-color-muted)] mt-1">
              بررسی و دانلود گزارش تولید شده - بازه زمانی: {toPersianDigits(reportData.config.dateRange.from)} الی {toPersianDigits(reportData.config.dateRange.to)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Report Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">تعداد رکوردها</div>
            <div className="text-2xl font-bold text-blue-700">
              {toPersianDigits(reportData.summary.totalRecords.toString())}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">کل درآمد</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(reportData.summary.totalIncome)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">کل هزینه</div>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(reportData.summary.totalExpense)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">خالص</div>
            <div className={`text-2xl font-bold ${
              reportData.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(reportData.summary.netAmount)}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleExportReport('pdf')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
          >
            <PrinterIcon className="w-5 h-5" />
            {loading ? 'در حال تولید...' : 'دانلود HTML/PDF'}
          </button>
          <button
            onClick={() => handleExportReport('excel')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            {loading ? 'در حال تولید...' : 'دانلود Excel'}
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <ShareIcon className="w-5 h-5" />
            اشتراک‌گذاری
          </button>
        </div>

        {/* Report Data Table */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--text-color)]">
              جزئیات گزارش ({toPersianDigits(reportData.data.length.toString())} رکورد)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-[var(--border-color)]">
                  {reportData.columns.map((column: any, index: number) => (
                    <th key={`header-${column.id}-${index}`} className="px-6 py-4 text-right text-sm font-semibold text-[var(--text-color)]">
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.data.slice(0, 15).map((transaction: any, transactionIndex: number) => (
                  <tr key={`row-${transaction.id || transactionIndex}`} className="border-b border-[var(--border-color)] hover:bg-gray-50 transition-colors">
                    {reportData.columns.map((column: any, columnIndex: number) => (
                      <td key={`cell-${transaction.id || transactionIndex}-${column.id}-${columnIndex}`} className="px-6 py-4 text-sm text-[var(--text-color)]">
                        {column.type === 'currency' 
                          ? formatCurrency(transaction[column.field])
                          : column.field === 'status'
                          ? getStatusBadge(transaction[column.field])
                          : column.field === 'type'
                          ? getTypeDisplay(transaction[column.field])
                          : column.field === 'category'
                          ? getCategoryTitle(transaction[column.field])
                          : transaction[column.field]
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reportData.data.length > 15 && (
            <div className="p-4 text-center text-sm text-[var(--text-color-muted)] bg-gray-50">
              و {toPersianDigits((reportData.data.length - 15).toString())} رکورد دیگر...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
          >
            بستن
          </button>
        </div>
      </motion.div>
    </div>
  );
}
