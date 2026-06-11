import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChat, addUserMessage, fetchConversations } from '../../redux/slices/chatSlice';
import { ArrowUp, Paperclip, Search } from 'lucide-react';
import AlertModal from '../common/AlertModal';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '' });
  const dispatch = useDispatch();
  const loading = useSelector(state => state.chat.loading);
  const selectedFiles = useSelector(state => state.file.selectedFiles);
  const conversationId = useSelector(state => state.chat.activeConversationId);
  const searchScope = useSelector(state => state.settings.searchScope);
  
  const handleSend = () => {
    if (!input.trim() || loading) return;
    
    const mode = searchScope === 'All Documents' ? 'all' : 'selected';
    
    if (mode === 'selected' && selectedFiles.length === 0) {
      setAlertState({
        isOpen: true,
        title: "No Documents Selected",
        message: "Please select at least one document from the workspace to search, or change your Search Scope to 'All Documents' in the settings."
      });
      return;
    }

    dispatch(addUserMessage(input));
    
    dispatch(sendChat({ question: input, folders: [], files: selectedFiles, conversationId, searchMode: mode }))
      .unwrap()
      .then(() => {
        if (!conversationId) {
          dispatch(fetchConversations());
        }
      })
      .catch((err) => console.error(err));
      
    setInput('');
  };

  return (
    <div className="p-4 md:px-6 md:py-6 bg-white dark:bg-[#1a1b1e] shrink-0">
      <div className="max-w-5xl mx-auto relative flex flex-col">
        
        {/* Searching Status Indicator */}
        <div className="flex justify-center mb-4">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#212127] px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-2">
            <Search size={12} className="text-gray-400 dark:text-gray-500" />
            {searchScope === 'All Documents' 
              ? 'Searching across all documents' 
              : `Searching across ${selectedFiles.length} selected file${selectedFiles.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* ChatGPT Style Input Container */}
        <div className="relative flex items-end bg-gray-50 dark:bg-[#2a2b32] rounded-[26px] border border-gray-200 dark:border-gray-700 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all px-2.5 py-2.5">
          <button className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-600 shrink-0 mb-0.5">
            <Paperclip size={20} />
          </button>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={searchScope === 'All Documents' ? "Ask a question across all documents..." : selectedFiles.length > 0 ? `Ask a question across ${selectedFiles.length} selected file(s)...` : "Select a file to start asking questions..."}
            className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 resize-none min-h-[48px] max-h-[200px] text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none leading-relaxed modern-scrollbar"
            rows="1"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || loading}
            className="p-2 mb-1 mr-1 bg-black dark:bg-white disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm shrink-0 flex items-center justify-center h-10 w-10"
          >
            <ArrowUp size={20} className={!input.trim() || loading ? "" : "translate-y-[-1px]"} />
          </button>
        </div>
        <div className="text-center mt-3 max-w-5xl mx-auto">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 tracking-wide">AI can make mistakes. Verify important information from the citations.</span>
        </div>
      </div>
      
      <AlertModal 
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ isOpen: false, title: '', message: '' })}
      />
    </div>
  );
};

export default ChatInput;
