// src/components/ReportPreviewModal.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, toPersianDigits, gregorianToJalali, parseJalaliDate, jalaliToGregorian } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  loading: boolean;
  onAlert: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

interface PrintSettings {
  includeCharts: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  includeSummary: boolean;
  paperSize: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  fontSize: 'small' | 'medium' | 'large';
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  reportData,
  loading,
  onAlert
}: ReportPreviewModalProps) {
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    includeCharts: true,
    includeHeader: true,
    includeFooter: true,
    includeSummary: true,
    paperSize: 'A4',
    orientation: 'portrait',
    fontSize: 'medium'
  });

  if (!isOpen || !reportData) return null;

  // تبدیل تاریخ میلادی به شمسی با فرمت صحیح - نسخه بهبود یافته
  const formatDateToJalali = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return '';
    
    try {
      let date: Date;
      
      // اگر رشته است، تبدیل به Date
      if (typeof dateValue === 'string') {
        // بررسی فرمت‌های مختلف تاریخ
        if (dateValue.includes('/') && dateValue.length <= 10) {
          // احتمالاً فرمت شمسی است
          const parts = dateValue.split('/');
          if (parts.length === 3 && parts[0].length === 4) {
            return toPersianDigits(dateValue);
          }
        }
        date = new Date(dateValue);
      } else {
        date = dateValue;
      }
      
      // بررسی معتبر بودن تاریخ
      if (isNaN(date.getTime())) {
        return toPersianDigits(dateValue.toString());
      }
      
      const [jy, jm, jd] = gregorianToJalali(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );
      
      return toPersianDigits(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`);
    } catch (error) {
      console.error('Error formatting date:', error);
      return toPersianDigits(dateValue?.toString() || '');
    }
  };

  // تبدیل تاریخ میلادی به شمسی برای نمایش در گزارش PDF
  const convertGregorianDateRangeToJalali = (dateRange: any) => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return { from: '', to: '' };
    }

    try {
      // تبدیل تاریخ شروع
      let fromDate: Date;
      let toDate: Date;

      // اگر تاریخ به فرمت رشته است
      if (typeof dateRange.from === 'string') {
        if (dateRange.from.includes('-')) {
          // فرمت میلادی YYYY-MM-DD
          fromDate = new Date(dateRange.from);
        } else if (dateRange.from.includes('/')) {
          // فرمت شمسی یا میلادی
          const parts = dateRange.from.split('/');
          if (parts.length === 3) {
            if (parts[0].length === 4 && parseInt(parts[0]) > 1400) {
              // فرمت شمسی YYYY/MM/DD
              return {
                from: toPersianDigits(dateRange.from),
                to: toPersianDigits(dateRange.to)
              };
            } else {
              // فرمت میلادی
              fromDate = new Date(dateRange.from);
            }
          } else {
            fromDate = new Date(dateRange.from);
          }
        } else {
          fromDate = new Date(dateRange.from);
        }
      } else {
        fromDate = new Date(dateRange.from);
      }

      if (typeof dateRange.to === 'string') {
        if (dateRange.to.includes('-')) {
          toDate = new Date(dateRange.to);
        } else if (dateRange.to.includes('/')) {
          const parts = dateRange.to.split('/');
          if (parts.length === 3) {
            if (parts[0].length === 4 && parseInt(parts[0]) > 1400) {
              return {
                from: toPersianDigits(dateRange.from),
                to: toPersianDigits(dateRange.to)
              };
            } else {
              toDate = new Date(dateRange.to);
            }
          } else {
            toDate = new Date(dateRange.to);
          }
        } else {
          toDate = new Date(dateRange.to);
        }
      } else {
        toDate = new Date(dateRange.to);
      }

      // تبدیل به شمسی
      const [jyFrom, jmFrom, jdFrom] = gregorianToJalali(
        fromDate.getFullYear(),
        fromDate.getMonth() + 1,
        fromDate.getDate()
      );

      const [jyTo, jmTo, jdTo] = gregorianToJalali(
        toDate.getFullYear(),
        toDate.getMonth() + 1,
        toDate.getDate()
      );

      return {
        from: toPersianDigits(`${jyFrom}/${String(jmFrom).padStart(2, '0')}/${String(jdFrom).padStart(2, '0')}`),
        to: toPersianDigits(`${jyTo}/${String(jmTo).padStart(2, '0')}/${String(jdTo).padStart(2, '0')}`)
      };

    } catch (error) {
      console.error('Error converting date range:', error);
      return {
        from: toPersianDigits(dateRange.from?.toString() || ''),
        to: toPersianDigits(dateRange.to?.toString() || '')
      };
    }
  };

  // تولید داده‌های نمودار
  const generateChartData = (chartConfig: any, data: any[]) => {
    if (!data || data.length === 0) {
      return { labels: ['داده‌ای موجود نیست'], datasets: [{ data: [1], backgroundColor: ['#e5e7eb'] }] };
    }

    const labels = data.slice(0, 20).map((item, index) => {
      if (chartConfig.xField === 'date' && item[chartConfig.xField]) {
        return formatDateToJalali(item[chartConfig.xField]);
      } else if (chartConfig.xField === 'month') {
        const monthNames = [
          'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
          'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        const monthValue = item[chartConfig.xField];
        if (typeof monthValue === 'number' && monthValue >= 1 && monthValue <= 12) {
          return monthNames[monthValue - 1];
        } else if (typeof monthValue === 'string') {
          return monthValue;
        }
        return `ماه ${index + 1}`;
      }
      return item[chartConfig.xField] || `داده ${index + 1}`;
    });

    const chartData = data.slice(0, 20).map(item => Math.abs(Number(item[chartConfig.yField]) || 0));

    const datasets = [{
      label: chartConfig.title || 'داده‌ها',
      data: chartData,
      backgroundColor: chartConfig.type === 'pie' || chartConfig.type === 'doughnut' ? [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(244, 63, 94, 0.8)',
      ] : chartConfig.type === 'area' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.8)',
      borderColor: chartConfig.type === 'pie' || chartConfig.type === 'doughnut' ? [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(244, 63, 94, 1)',
      ] : 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      fill: chartConfig.type === 'area' ? true : false,
      tension: chartConfig.type === 'area' || chartConfig.type === 'line' ? 0.4 : 0
    }];

    return { labels, datasets };
  };

  // رندر نمودار
  const renderChart = (chartConfig: any, data: any[]) => {
    const chartData = generateChartData(chartConfig, data);
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          rtl: true,
          labels: {
            font: {
              family: 'Vazirmatn, Tahoma, sans-serif'
            }
          }
        },
        title: {
          display: true,
          text: chartConfig.title,
          font: {
            family: 'Vazirmatn, Tahoma, sans-serif',
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          titleFont: {
            family: 'Vazirmatn, Tahoma, sans-serif'
          },
          bodyFont: {
            family: 'Vazirmatn, Tahoma, sans-serif'
          },
          callbacks: {
            label: (context: any) => {
              if (chartConfig.yField === 'finalAmount' || chartConfig.yField === 'amount') {
                return `${context.label}: ${formatCurrency(context.raw)}`;
              }
              return `${context.label}: ${toPersianDigits(context.raw.toString())}`;
            }
          }
        }
      },
      scales: chartConfig.type !== 'pie' && chartConfig.type !== 'doughnut' ? {
        x: {
          ticks: {
            font: {
              family: 'Vazirmatn, Tahoma, sans-serif'
            }
          }
        },
        y: {
          ticks: {
            font: {
              family: 'Vazirmatn, Tahoma, sans-serif'
            },
            callback: (value: any) => {
              if (chartConfig.yField === 'finalAmount' || chartConfig.yField === 'amount') {
                return formatCurrency(value);
              }
              return toPersianDigits(value.toString());
            }
          }
        }
      } : {}
    };

    const chartProps = { data: chartData, options };

    switch (chartConfig.type) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'area':
        return <Line {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };

  // تولید نمودار SVG برای PDF - بهبود یافته برای نمودار مساحت
  const generateChartSVG = (chartConfig: any, data: any[]) => {
    const chartData = generateChartData(chartConfig, data);
    const width = 500;
    const height = 300;
    const margin = { top: 50, right: 40, bottom: 70, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (chartConfig.type === 'pie' || chartConfig.type === 'doughnut') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 30;
      const innerRadius = chartConfig.type === 'doughnut' ? radius * 0.6 : 0;

      let total = chartData.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0);
      let currentAngle = -Math.PI / 2;

      const slices = chartData.labels.map((label: string, index: number) => {
        const value = chartData.datasets[0].data[index];
        const sliceAngle = (value / total) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        
        const x1 = centerX + Math.cos(startAngle) * radius;
        const y1 = centerY + Math.sin(startAngle) * radius;
        const x2 = centerX + Math.cos(endAngle) * radius;
        const y2 = centerY + Math.sin(endAngle) * radius;
        
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        
        let path;
        if (innerRadius > 0) {
          const x3 = centerX + Math.cos(endAngle) * innerRadius;
          const y3 = centerY + Math.sin(endAngle) * innerRadius;
          const x4 = centerX + Math.cos(startAngle) * innerRadius;
          const y4 = centerY + Math.sin(startAngle) * innerRadius;
          
          path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
        } else {
          path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        }

        const color = chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length];
        
        currentAngle = endAngle;
        
        return {
          path,
          color,
          label,
          value,
          percentage: ((value / total) * 100).toFixed(1)
        };
      });

      return `
        <svg width="${width}" height="${height + 120}" viewBox="0 0 ${width} ${height + 120}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .chart-text { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 12px; fill: #374151; }
            .chart-title { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 18px; font-weight: bold; fill: #1f2937; }
            .legend-text { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 11px; fill: #6b7280; }
          </style>
          
          <text x="${width/2}" y="30" text-anchor="middle" class="chart-title">${chartConfig.title}</text>
          
          ${slices.map((slice: any) => `
            <path d="${slice.path}" fill="${slice.color}" stroke="white" stroke-width="2"/>
          `).join('')}
          
          ${slices.map((slice: any, index: number) => {
            const legendY = height + 30 + (index * 18);
            return `
              <rect x="30" y="${legendY}" width="12" height="12" fill="${slice.color}"/>
              <text x="50" y="${legendY + 9}" class="legend-text">${slice.label}: ${formatCurrency(slice.value)} (${toPersianDigits(slice.percentage)}%)</text>
            `;
          }).join('')}
        </svg>
      `;
    } else {
      // نمودار ستونی/خطی/مساحت - بهبود یافته
      const maxValue = Math.max(...chartData.datasets[0].data);
      const minValue = Math.min(0, Math.min(...chartData.datasets[0].data));
      const valueRange = maxValue - minValue || 1;
      
      const barWidth = chartWidth / chartData.labels.length * 0.7;
      const barSpacing = chartWidth / chartData.labels.length * 0.3;

      // محاسبه نقاط برای نمودار خطی و مساحت
      const points = chartData.labels.map((label: string, index: number) => {
        const value = chartData.datasets[0].data[index];
        const x = margin.left + (index * (chartWidth / (chartData.labels.length - 1 || 1)));
        const y = margin.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        return { x, y, value, label };
      });

      let chartElements = '';

      if (chartConfig.type === 'bar') {
        // نمودار ستونی
        chartElements = chartData.labels.map((label: string, index: number) => {
          const value = chartData.datasets[0].data[index];
          const barHeight = ((value - minValue) / valueRange) * chartHeight;
          const x = margin.left + (index * (barWidth + barSpacing)) + barSpacing/2;
          const y = margin.top + chartHeight - barHeight;
          
          return `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" class="bar"/>
            <text x="${x + barWidth/2}" y="${margin.top + chartHeight + 20}" text-anchor="middle" class="chart-text" transform="rotate(-45, ${x + barWidth/2}, ${margin.top + chartHeight + 20})">${label}</text>
          `;
        }).join('');
      } else if (chartConfig.type === 'line') {
        // نمودار خطی
        const pathData = points.map((point, index) => 
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');

        chartElements = `
          <path d="${pathData}" fill="none" stroke="rgba(59, 130, 246, 1)" stroke-width="3"/>
          ${points.map(point => `
            <circle cx="${point.x}" cy="${point.y}" r="4" fill="rgba(59, 130, 246, 1)" stroke="white" stroke-width="2"/>
          `).join('')}
          ${points.map((point, index) => `
            <text x="${point.x}" y="${margin.top + chartHeight + 20}" text-anchor="middle" class="chart-text" transform="rotate(-45, ${point.x}, ${margin.top + chartHeight + 20})">${point.label}</text>
          `).join('')}
        `;
      } else if (chartConfig.type === 'area') {
        // نمودار مساحت - اصلاح شده
        const pathData = points.map((point, index) => 
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');
        
        // اضافه کردن خط پایین برای بستن مساحت
        const areaPath = `${pathData} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`;

        chartElements = `
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(59, 130, 246, 0.3);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(59, 130, 246, 0.05);stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="${areaPath}" fill="url(#areaGradient)" stroke="none"/>
          <path d="${pathData}" fill="none" stroke="rgba(59, 130, 246, 1)" stroke-width="3"/>
          ${points.map(point => `
            <circle cx="${point.x}" cy="${point.y}" r="4" fill="rgba(59, 130, 246, 1)" stroke="white" stroke-width="2"/>
          `).join('')}
          ${points.map((point, index) => `
            <text x="${point.x}" y="${margin.top + chartHeight + 20}" text-anchor="middle" class="chart-text" transform="rotate(-45, ${point.x}, ${margin.top + chartHeight + 20})">${point.label}</text>
          `).join('')}
        `;
      }

      return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .chart-text { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 11px; fill: #374151; }
            .chart-title { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 18px; font-weight: bold; fill: #1f2937; }
            .axis-line { stroke: #374151; stroke-width: 2; }
            .grid-line { stroke: #e5e7eb; stroke-width: 1; }
            .bar { fill: rgba(59, 130, 246, 0.8); stroke: rgba(59, 130, 246, 1); stroke-width: 1; }
          </style>
          
          <text x="${width/2}" y="30" text-anchor="middle" class="chart-title">${chartConfig.title}</text>
          
          ${Array.from({length: 6}, (_, i) => {
            const y = margin.top + (i * chartHeight / 5);
            const value = maxValue - (i * valueRange / 5);
            return `
              <line x1="${margin.left}" y1="${y}" x2="${margin.left + chartWidth}" y2="${y}" class="grid-line"/>
              <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" class="chart-text">${toPersianDigits(Math.round(value).toString())}</text>
            `;
          }).join('')}
          
          <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" class="axis-line"/>
          <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" class="axis-line"/>
          
          ${chartElements}
        </svg>
      `;
    }
  };

  const handleExportReport = async (format: string) => {
    try {
      if (format === 'pdf') {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          onAlert('error', 'خطا در تولید PDF', 'امکان باز کردن پنجره جدید وجود ندارد. لطفاً popup blocker را غیرفعال کنید.');
          return;
        }

        const htmlContent = generatePDFContent(reportData, printSettings);
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        onAlert('success', 'تولید PDF', 'گزارش در پنجره جدید باز شد. می‌توانید آن را مشاهده یا چاپ کنید.');

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

  const generatePDFContent = (reportData: any, settings: PrintSettings) => {
    const config = reportData.config;
    
    // تبدیل بازه تاریخ به شمسی
    const jalaliDateRange = convertGregorianDateRangeToJalali(config.dateRange);

    // تاریخ تولید گزارش به شمسی
    const getCurrentJalaliDate = () => {
      const now = new Date();
      const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
      return `${toPersianDigits(jy.toString())}/${toPersianDigits(String(jm).padStart(2, '0'))}/${toPersianDigits(String(jd).padStart(2, '0'))}`;
    };

    const getFontSize = () => {
      switch (settings.fontSize) {
        case 'small': return { base: '10px', title: '20px', subtitle: '12px', table: '9px' };
        case 'large': return { base: '16px', title: '28px', subtitle: '18px', table: '14px' };
        default: return { base: '12px', title: '24px', subtitle: '14px', table: '11px' };
      }
    };

    const fontSize = getFontSize();

    return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
        @page {
            size: ${settings.paperSize} ${settings.orientation};
            margin: 20mm;
        }
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
            font-size: ${fontSize.base};
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            ${!settings.includeHeader ? 'display: none;' : ''}
        }
        .title {
            font-size: ${fontSize.title};
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: ${fontSize.subtitle};
            color: #6b7280;
            margin-bottom: 5px;
        }
        .summary {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            justify-content: space-around;
            flex-wrap: wrap;
            ${!settings.includeSummary ? 'display: none;' : ''}
        }
        .summary-card {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e5e7eb;
            flex: 1;
            min-width: 200px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 500;
        }
        .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
        }
        
        /* Charts Section - با نمودار واقعی */
        .charts-section {
            margin: 40px 0;
            ${!settings.includeCharts ? 'display: none;' : ''}
        }
        .charts-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 25px;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .chart-container {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            page-break-inside: avoid;
            text-align: center;
        }
        .chart-svg {
            max-width: 100%;
            height: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fefefe;
            display: block;
            margin: 0 auto;
        }
        
        .table-container {
            overflow-x: auto;
            margin-top: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #e5e7eb;
        }
        th, td {
            padding: 12px 8px;
            text-align: right;
            border-bottom: 1px solid #e5e7eb;
            font-size: ${fontSize.table};
        }
        th {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            font-weight: 600;
            color: #374151;
        }
        tr:hover {
            background: #f8fafc;
        }
        .status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
        }
        .status.posted {
            background: #dcfce7;
            color: #166534;
        }
        .status.pending {
            background: #fef3c7;
            color: #92400e;
        }
        .status.draft {
            background: #f3f4f6;
            color: #374151;
        }
        
        /* Print Button */
        .print-button-container {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
        }
        .print-button {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Vazirmatn', sans-serif;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 11px;
            background: #f9fafb;
            padding: 25px;
            border-radius: 8px;
            ${!settings.includeFooter ? 'display: none;' : ''}
        }
        
        /* Print optimizations */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                padding: 0;
            }
            .no-print, .print-button-container {
                display: none !important;
            }
            .page-break {
                page-break-before: always;
            }
            .chart-container {
                page-break-inside: avoid;
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .summary {
                flex-direction: column;
            }
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <!-- Print Button -->
    <div class="print-button-container no-print">
        <button class="print-button" onclick="window.print()">
            🖨️ چاپ گزارش
        </button>
    </div>

    ${settings.includeHeader ? `
    <div class="header">
        <div class="title">${config.title}</div>
        <div class="subtitle">${config.description || ''}</div>
        <div class="subtitle">تاریخ تولید: ${getCurrentJalaliDate()}</div>
        <div class="subtitle">بازه زمانی: ${jalaliDateRange.from} الی ${jalaliDateRange.to}</div>
    </div>
    ` : ''}

    ${settings.includeSummary ? `
    <div class="summary">
        <div class="summary-card">
            <div class="summary-label">تعداد رکوردها</div>
            <div class="summary-value">${toPersianDigits(reportData.summary?.totalRecords?.toString() || '0')}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">کل درآمد</div>
            <div class="summary-value">${formatCurrency(reportData.summary?.totalIncome || 0)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">کل هزینه</div>
            <div class="summary-value">${formatCurrency(reportData.summary?.totalExpense || 0)}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">خالص</div>
            <div class="summary-value" style="color: ${(reportData.summary?.netAmount || 0) >= 0 ? '#059669' : '#dc2626'}">${formatCurrency(reportData.summary?.netAmount || 0)}</div>
        </div>
    </div>
    ` : ''}

    ${settings.includeCharts && config.charts && config.charts.length > 0 ? `
        <div class="charts-section">
            <div class="charts-title">
                📊 نمودارها و تحلیل‌های بصری
            </div>
            ${config.charts.map((chart: any, index: number) => `
                <div class="chart-container">
                    <div class="chart-svg">
                        ${generateChartSVG(chart, reportData.data || [])}
                    </div>
                </div>
                ${index < config.charts.length - 1 ? '<div style="page-break-before: always;"></div>' : ''}
            `).join('')}
        </div>
    ` : ''}

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    ${config.columns?.map((col: any) => `<th>${col.title}</th>`).join('') || 
                      '<th>تاریخ</th><th>عنوان</th><th>مبلغ</th><th>وضعیت</th>'}
                </tr>
            </thead>
            <tbody>
                ${reportData.data?.map((row: any, rowIndex: number) => `
                    <tr>
                        ${config.columns?.map((col: any) => {
                          if (col.type === 'currency') {
                            return `<td>${formatCurrency(row[col.field] || 0)}</td>`;
                          } else if (col.type === 'date' || col.field === 'date') {
                            return `<td>${formatDateToJalali(row[col.field])}</td>`;
                          } else if (col.field === 'status') {
                            const statusMap = {
                              'posted': 'ثبت شده',
                              'pending': 'در انتظار', 
                              'draft': 'پیش‌نویس'
                            };
                            return `<td><span class="status ${row[col.field]}">${statusMap[row[col.field] as keyof typeof statusMap] || row[col.field]}</span></td>`;
                          } else {
                            return `<td>${row[col.field] || ''}</td>`;
                          }
                        }).join('') || 
                        `<td>${formatDateToJalali(row.date)}</td><td>${row.title}</td><td>${formatCurrency(row.amount)}</td><td><span class="status ${row.status}">${
                          row.status === 'posted' ? 'ثبت شده' : 
                          row.status === 'pending' ? 'در انتظار' : 'پیش‌نویس'
                        }</span></td>`}
                    </tr>
                `).join('') || '<tr><td colspan="100%" style="text-align: center; padding: 40px; color: #6b7280;">داده‌ای برای نمایش وجود ندارد</td></tr>'}
            </tbody>
        </table>
    </div>

    ${settings.includeFooter ? `
    <div class="footer">
        <p><strong>این گزارش به صورت خودکار در تاریخ ${getCurrentJalaliDate()} تولید شده است.</strong></p>
        <p style="margin: 10px 0;">سیستم مدیریت ساختمان - Buildino</p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p><strong>تنظیمات چاپ:</strong></p>
            <p>کاغذ: ${settings.paperSize} | جهت: ${settings.orientation === 'portrait' ? 'عمودی' : 'افقی'} | فونت: ${settings.fontSize === 'small' ? 'کوچک' : settings.fontSize === 'large' ? 'بزرگ' : 'متوسط'}</p>
        </div>
    </div>
    ` : ''}
</body>
</html>
    `;
  };

  const generateCSVContent = (reportData: any) => {
    const config = reportData.config;
    const headers = config.columns?.map((col: any) => col.title).join(',') || 'تاریخ,عنوان,مبلغ,وضعیت';
    
    const rows = reportData.data?.map((row: any) => {
      return config.columns?.map((col: any) => {
        if (col.type === 'currency') {
          return `"${formatCurrency(row[col.field] || 0)}"`;
        } else if (col.type === 'date' || col.field === 'date') {
          return `"${formatDateToJalali(row[col.field])}"`;
        } else {
          return `"${row[col.field] || ''}"`;
        }
      }).join(',') || `"${formatDateToJalali(row.date)}","${row.title}","${formatCurrency(row.amount)}","${row.status}"`;
    }).join('\n') || '';

    return `${headers}\n${rows}`;
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[var(--bg-secondary)] rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center gap-4">
            <EyeIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-[var(--text-color)]">
                پیش‌نمایش گزارش: {reportData.config?.title}
              </h2>
              <p className="text-sm text-[var(--text-color-muted)] mt-1">
                {reportData.config?.description}
              </p>
              {/* نمایش بازه زمانی در پیش‌نمایش */}
              {reportData.config?.dateRange && (
                <p className="text-xs text-[var(--text-color-muted)] mt-1">
                  بازه زمانی: {(() => {
                    const jalaliRange = convertGregorianDateRangeToJalali(reportData.config.dateRange);
                    return `${jalaliRange.from} الی ${jalaliRange.to}`;
                  })()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Print Settings Button */}
            <button
              onClick={() => setShowPrintSettings(!showPrintSettings)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="تنظیمات چاپ"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Print Settings Panel */}
        {showPrintSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--bg-color)] border-b border-[var(--border-color)] p-4 flex-shrink-0"
          >
            <h3 className="font-semibold text-[var(--text-color)] mb-4 flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5" />
              تنظیمات چاپ و خروجی PDF
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Include Charts */}
              <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">نمایش نمودارها</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printSettings.includeCharts}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Include Header */}
              <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <span className="text-sm font-medium">سربرگ گزارش</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printSettings.includeHeader}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, includeHeader: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Include Footer */}
              <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <span className="text-sm font-medium">پاورقی گزارش</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printSettings.includeFooter}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, includeFooter: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Include Summary */}
              <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <span className="text-sm font-medium">خلاصه آمارها</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printSettings.includeSummary}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, includeSummary: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Paper Size */}
              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                <label className="block text-sm font-medium mb-2">سایز کاغذ</label>
                <select
                  value={printSettings.paperSize}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, paperSize: e.target.value as any }))}
                  className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                <label className="block text-sm font-medium mb-2">جهت کاغذ</label>
                <select
                  value={printSettings.orientation}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, orientation: e.target.value as any }))}
                  className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                >
                  <option value="portrait">عمودی</option>
                  <option value="landscape">افقی</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                <label className="block text-sm font-medium mb-2">سایز فونت</label>
                <select
                  value={printSettings.fontSize}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
                  className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                >
                  <option value="small">کوچک</option>
                  <option value="medium">متوسط</option>
                  <option value="large">بزرگ</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content - با اسکرول */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-[var(--text-color-muted)]">در حال بارگیری گزارش...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              {reportData.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">تعداد رکوردها</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {toPersianDigits(reportData.summary.totalRecords?.toString() || '0')}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 mb-1">کل درآمد</div>
                    <div className="text-2xl font-bold text-green-800">
                      {formatCurrency(reportData.summary.totalIncome || 0)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="text-sm text-red-600 mb-1">کل هزینه</div>
                    <div class className="text-2xl font-bold text-red-800">
                      {formatCurrency(reportData.summary.totalExpense || 0)}
                    </div>
                  </div>
                  <div className={`bg-gradient-to-r p-4 rounded-lg border ${
                    (reportData.summary.netAmount || 0) >= 0 
                      ? 'from-emerald-50 to-emerald-100 border-emerald-200' 
                      : 'from-rose-50 to-rose-100 border-rose-200'
                  }`}>
                    <div className={`text-sm mb-1 ${
                      (reportData.summary.netAmount || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>خالص</div>
                    <div className={`text-2xl font-bold ${
                      (reportData.summary.netAmount || 0) >= 0 ? 'text-emerald-800' : 'text-rose-800'
                    }`}>
                      {formatCurrency(reportData.summary.netAmount || 0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Charts */}
              {reportData.config?.charts && reportData.config.charts.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[var(--text-color)] flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    نمودارها
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reportData.config.charts.map((chart: any, index: number) => (
                      <div key={chart.id || index} className="bg-white p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
                        <div className="h-64 flex items-center justify-center">
                          {renderChart(chart, reportData.data || [])}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text-color)]">داده‌های گزارش</h3>
                <div className="overflow-x-auto bg-white rounded-lg border border-[var(--border-color)]">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-secondary)]">
                      <tr>
                        {reportData.config?.columns?.map((col: any, index: number) => (
                          <th key={index} className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">
                            {col.title}
                          </th>
                        )) || (
                          <>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">تاریخ</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">عنوان</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">مبلغ</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">وضعیت</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data?.map((row: any, rowIndex: number) => (
                        <tr key={rowIndex} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-color)]">
                          {reportData.config?.columns?.map((col: any, colIndex: number) => (
                            <td key={colIndex} className="px-4 py-3 text-sm text-[var(--text-color)]">
                              {col.type === 'currency' 
                                ? formatCurrency(row[col.field] || 0)
                                : col.type === 'date' || col.field === 'date'
                                  ? formatDateToJalali(row[col.field])
                                  : col.field === 'status'
                                    ? (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                          ${row[col.field] === 'posted' ? 'bg-green-100 text-green-800' :
                                            row[col.field] === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                        >
                                          {row[col.field] === 'posted' ? 'ثبت شده' :
                                           row[col.field] === 'pending' ? 'در انتظار' :
                                           'پیش‌نویس'}
                                        </span>
                                      )
                                    : row[col.field] || ''
                              }
                            </td>
                          )) || (
                            <>
                              <td className="px-4 py-3 text-sm text-[var(--text-color)]">{formatDateToJalali(row.date)}</td>
                              <td className="px-4 py-3 text-sm text-[var(--text-color)]">{row.title}</td>
                              <td className="px-4 py-3 text-sm text-[var(--text-color)]">{formatCurrency(row.amount)}</td>
                              <td className="px-4 py-3 text-sm text-[var(--text-color)]">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                  ${row.status === 'posted' ? 'bg-green-100 text-green-800' :
                                    row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}
                                >
                                  {row.status === 'posted' ? 'ثبت شده' :
                                   row.status === 'pending' ? 'در انتظار' :
                                   'پیش‌نویس'}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={reportData.config?.columns?.length || 4} className="px-4 py-8 text-center text-[var(--text-color-muted)]">
                            داده‌ای برای نمایش وجود ندارد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-[var(--border-color)] bg-[var(--bg-color)] flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[var(--text-color-muted)]">
            <span>آخرین به‌روزرسانی:</span>
            <span>{formatDateToJalali(new Date())}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportReport('excel')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Excel
            </button>
            
            <button
              onClick={() => handleExportReport('pdf')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PrinterIcon className="w-4 h-4" />
              {loading ? 'در حال تولید...' : 'مشاهده گزارش'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
