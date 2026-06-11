import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Settings, X, Search, Activity, BarChart2, ChevronDown, ChevronRight, Sliders, Save } from 'lucide-react';
import { setSetting, fetchConfig, saveConfig, fetchStats } from '../../../redux/slices/settingsSlice';
import HealthCard from '../../HealthCard/HealthCard';

const RightSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const [sections, setSections] = useState({
    scope: true,
    searchConfig: true,
    health: true,
    stats: true
  });

  const toggleSection = (section) => setSections(prev => ({...prev, [section]: !prev[section]}));

  useEffect(() => {
    dispatch(fetchConfig());
    dispatch(fetchStats());
  }, [dispatch]);

  const handleConfigChange = (key, value) => {
    dispatch(setSetting({ key, value: key === 'semanticCount' || key === 'rerankerCount' ? parseInt(value) : value }));
  };

  const handleSaveConfig = () => {
    dispatch(saveConfig({
        semantic_count: settings.semanticCount,
        reranker_count: settings.rerankerCount,
        embedding_model: settings.embeddingModel,
        language_model: settings.llm
    }));
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0e12] p-4 flex flex-col gap-4 overflow-y-auto modern-scrollbar">
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-[14px]">
          <Settings size={16} className="text-gray-500"/> Settings
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a1b23]">
          <X size={16} />
        </button>
      </div>
      
      <div className="space-y-4 pb-4">
        {/* Search Scope Card */}
        <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('scope')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Search size={14} /> Search Scope
            </span>
            {sections.scope ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </div>
          {sections.scope && (
            <div className="p-3.5 pt-3">
              <select 
                value={settings.searchScope}
                onChange={(e) => dispatch(setSetting({ key: 'searchScope', value: e.target.value }))}
                className="w-full p-2.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200"
              >
                <option value="Selected Documents">Selected Documents</option>
                <option value="All Documents">All Documents</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Configuration Card */}
        <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('searchConfig')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Sliders size={14} /> Search Configuration
            </span>
            {sections.searchConfig ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </div>
          {sections.searchConfig && (
            <div className="p-3.5 pt-3 space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-[12px] text-gray-600 dark:text-gray-400">Semantic Count</span>
                 <select 
                    value={settings.semanticCount} 
                    onChange={(e) => handleConfigChange('semanticCount', e.target.value)}
                    className="w-16 p-1.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200 text-center"
                 >
                   <option value="10">10</option>
                   <option value="15">15</option>
                   <option value="20">20</option>
                 </select>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[12px] text-gray-600 dark:text-gray-400">Re-ranker Count</span>
                 <select 
                    value={settings.rerankerCount} 
                    onChange={(e) => handleConfigChange('rerankerCount', e.target.value)}
                    className="w-16 p-1.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200 text-center"
                 >
                   <option value="3">3</option>
                   <option value="5">5</option>
                   <option value="7">7</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <span className="text-[12px] text-gray-600 dark:text-gray-400 block">Embedding Model</span>
                 <select 
                    value={settings.embeddingModel}
                    onChange={(e) => handleConfigChange('embeddingModel', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200"
                  >
                    <option value={settings.embeddingModel}>{settings.embeddingModel}</option>
                  </select>
              </div>
              <div className="space-y-1">
                 <span className="text-[12px] text-gray-600 dark:text-gray-400 block">Language Model</span>
                 <select 
                    value={settings.llm}
                    onChange={(e) => handleConfigChange('llm', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200"
                  >
                    <option value={settings.llm}>{settings.llm}</option>
                  </select>
              </div>
              <button 
                onClick={handleSaveConfig}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-[13px] font-medium transition-colors shadow-sm"
              >
                <Save size={14} /> Save Configuration
              </button>
            </div>
          )}
        </div>

        {/* System Health Card */}
        <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('health')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Activity size={14} /> System Health
            </span>
            {sections.health ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </div>
          {sections.health && (
            <div className="p-3.5 pt-3 space-y-2">
              <HealthCard />
            </div>
          )}
        </div>

        {/* Statistics Card */}
        <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('stats')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <BarChart2 size={14} /> Statistics
            </span>
            {sections.stats ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </div>
          {sections.stats && (
            <div className="p-4 pt-3 bg-white dark:bg-[#1a1b1e]">
               <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-500 dark:text-gray-400">Total Documents</span>
                    <span className="text-[13px] font-medium text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-[#0d0e12] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">{settings.stats?.total_documents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-500 dark:text-gray-400">Indexed Chunks</span>
                    <span className="text-[13px] font-medium text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-[#0d0e12] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">{settings.stats?.indexed_chunks || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Last Upload</span>
                    <span className="text-[12px] font-medium text-gray-800 dark:text-gray-300">
                        {settings.stats?.last_upload_time ? new Date(settings.stats.last_upload_time * 1000).toLocaleString() : 'Never'}
                    </span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
