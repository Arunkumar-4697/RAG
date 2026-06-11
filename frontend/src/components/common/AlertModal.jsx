import React from 'react';
import { Info } from 'lucide-react';

const AlertModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1b23] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-xl flex-shrink-0">
            <Info size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1 mt-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
