import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-xl flex-shrink-0">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1 mt-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60">
          <button 
            onClick={onCancel} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#23252f] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onCancel(); }} 
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
