// src/components/ConfirmDeleteModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'تایید حذف',
  message = 'آیا از حذف این آیتم مطمئن هستید؟ این عملیات غیرقابل بازگشت است.',
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* F: اصلاح شد: با استفاده از flexbox، مودال همیشه در مرکز قرار می‌گیرد */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" // F: این کلاس‌ها برای وسط‌چین کردن اضافه شد
            onClick={onClose}
          >
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md p-6 rounded-2xl relative" // F: از fixed به relative تغییر کرد چون والدش (backdrop) موقعیت را کنترل می‌کند
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()} // F: برای جلوگیری از بسته شدن مودال با کلیک روی پنل
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
                    {title}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  لغو
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
