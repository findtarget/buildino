'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md p-6 rounded-2xl"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/20">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-red-500">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-sm opacity-80 leading-relaxed">
                {message}
              </p>
              {itemName && (
                <div 
                  className="mt-3 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-color)' }}
                >
                  <p className="text-sm font-medium">
                    آیتم مورد نظر: <span className="font-bold">{itemName}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold transition-all hover:bg-red-600 hover:scale-105 flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                حذف کن
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
