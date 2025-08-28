// src/components/ConfirmModal.tsx
'use client';

import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[var(--bg-color)] rounded-xl p-6 max-w-md w-full border border-[var(--border-color)] shadow-2xl"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-color)] mb-3">
            {title}
          </h3>
          <p className="text-[var(--text-color-muted)] mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-[var(--text-color)] bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              حذف
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
