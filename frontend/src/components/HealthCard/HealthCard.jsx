import React from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, Database, AlertTriangle, Loader2 } from 'lucide-react';


const HealthCard = () => {
  const { backend, qdrant, loading } = useSelector(state => state.health);

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-center items-center h-24 shadow-sm">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Service</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5 ${backend ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'}`}>
          {backend ? <><ShieldCheck size={14}/> Operational</> : <><AlertTriangle size={14}/> Unreachable</>}
        </span>
      </div>
      <div className="w-full h-px bg-gray-200 dark:bg-gray-700/50"></div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qdrant DB</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1.5 ${qdrant ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'}`}>
          {qdrant ? <><Database size={14}/> Operational</> : <><AlertTriangle size={14}/> Unreachable</>}
        </span>
      </div>
    </div>
  );
};

export default HealthCard;
