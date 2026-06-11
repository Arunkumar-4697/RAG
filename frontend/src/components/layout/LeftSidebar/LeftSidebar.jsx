import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, FolderPlus, Plus, Search, ChevronDown, ChevronRight, MoreHorizontal, Upload, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFile, createFolder } from '../../../redux/slices/folderSlice';
import { fetchConversations, loadConversation, clearMessages, deleteConversation } from '../../../redux/slices/chatSlice';
import FolderTree from '../../FolderTree/FolderTree';
import ConfirmModal from '../../common/ConfirmModal';

const LeftSidebar = ({ isOpen }) => {
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);
  
  const conversations = useSelector(state => state.chat.conversations) || [];
  const activeChatId = useSelector(state => state.chat.activeConversationId);
  const dispatch = useDispatch();

  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');

  const [creatingNodeParentId, setCreatingNodeParentId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const getGroup = (dateString) => {
      if (!dateString) return 'Previous 7 Days';
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = today - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 0 && date.getDate() === today.getDate()) return 'Today';
      if (diffDays <= 1 && date.getDate() !== today.getDate()) return 'Yesterday';
      return 'Previous 7 Days';
  };

  const groupedConversations = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': []
  };

  conversations.forEach(c => {
      const group = getGroup(c.accessed_at);
      if (groupedConversations[group]) {
          groupedConversations[group].push(c);
      }
  });

  const conversationGroups = ['Today', 'Yesterday', 'Previous 7 Days'];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(260, Math.min(e.clientX, 800));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;
    uploadedFiles.forEach(file => {
      dispatch(uploadFile({ folderPath: '', file }));
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateFolderKeyDown = (e) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      dispatch(createFolder(newFolderName.trim()));
      setNewFolderName('');
      setCreatingNodeParentId(null);
    } else if (e.key === 'Escape') {
      setCreatingNodeParentId(null);
      setNewFolderName('');
    }
  };

  if (!isOpen) return null;

  return (
    <aside style={{ width: sidebarWidth }} className="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0e12] flex flex-col relative transition-colors">
      <div onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }} className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-blue-500/50 ${isResizing ? 'bg-blue-500' : 'bg-transparent'} transition-colors`} />

      <div className="p-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 mb-6 px-2 mt-2 flex-shrink-0">
          <img src="/logo.png" alt="ManDoc Logo" className="w-8 h-8 rounded-md shadow-sm" />
          <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">ManDoc</h1>
        </div>

        {/* Conversations Section */}
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${isWorkspaceExpanded ? 'flex-1 min-h-0' : 'flex-1'}`}>
          <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Conversations</h2>
          </div>

          <button onClick={() => {
            dispatch(clearMessages());
          }} className="flex items-center justify-center gap-2 w-full p-2 mb-3 bg-white dark:bg-[#1a1b23] hover:bg-gray-100 dark:hover:bg-[#23252f] border border-gray-200 dark:border-gray-800/60 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 transition-all shadow-sm">
            <Plus size={16} className="text-blue-600 dark:text-blue-500" /> New Chat
          </button>

          <div className="relative mb-3 px-1 flex-shrink-0">
            <Search size={14} className="absolute left-3.5 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search chats..." value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} className="w-full bg-white dark:bg-[#13141a] border border-gray-200 dark:border-gray-800 rounded-xl py-2 pl-9 pr-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm" />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 modern-scrollbar min-h-0 pb-2">
            {conversationGroups.map(group => {
              const groupChats = groupedConversations[group].filter(c => c.title.toLowerCase().includes(chatSearchQuery.toLowerCase()));
              if (groupChats.length === 0) return null;
              return (
                <div key={group} className="space-y-0.5">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1.5">{group}</div>
                  {groupChats.map(chat => {
                    const isActive = activeChatId === chat.id;
                    return (
                      <div key={chat.id} onClick={() => { dispatch(loadConversation(chat.id)); }} className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer group transition-all text-[13px] relative ${isActive ? 'bg-blue-50 dark:bg-[#1a1b23] text-blue-700 dark:text-white font-medium shadow-sm border border-blue-100 dark:border-gray-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1b23] border border-transparent'}`}>
                        <MessageSquare size={14} className={isActive ? "text-blue-600 dark:text-blue-500" : "text-gray-400"} />
                        <span className="truncate flex-1 pr-6">{chat.title}</span>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, id: chat.id }); }} className="p-1 rounded text-gray-400 hover:text-red-500 transition-all absolute right-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Workspace Section */}
        <div className={`mt-2 flex flex-col bg-white dark:bg-[#090a0f] border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 ease-in-out shadow-sm overflow-hidden flex-shrink-0 ${isWorkspaceExpanded ? 'h-[45%]' : 'h-[42px]'}`}>
          <div onClick={() => setIsWorkspaceExpanded(!isWorkspaceExpanded)} className="flex items-center justify-between p-3 cursor-pointer select-none bg-gray-50/50 dark:bg-[#0d0e12] border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#13141a] transition-colors">
            <div className="flex items-center gap-2">
              {isWorkspaceExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Workspace</h2>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5" title="Upload to Root"><Upload size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); setCreatingNodeParentId('root'); setIsWorkspaceExpanded(true); }} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5" title="New Root Folder"><FolderPlus size={14} /></button>
            </div>
          </div>

          <div className={`flex flex-col h-full overflow-hidden ${isWorkspaceExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            <div className="p-2 pb-0 flex-shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
                <input type="text" placeholder="Search files..." value={workspaceSearchQuery} onChange={(e) => setWorkspaceSearchQuery(e.target.value)} className="w-full bg-gray-50 dark:bg-[#13141a] border border-gray-200 dark:border-gray-800 rounded-md py-1.5 pl-7 pr-2 text-[12px] text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
              </div>
            </div>
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.md" />
            
            <div className="flex-1 overflow-y-auto p-2 modern-scrollbar">
              {creatingNodeParentId === 'root' && (
                <div className="px-2 mb-2">
                  <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={handleCreateFolderKeyDown} onBlur={() => { setCreatingNodeParentId(null); setNewFolderName(''); }} placeholder="Folder name..." className="w-full bg-white dark:bg-[#13141a] border border-blue-500 rounded px-2 py-1 text-xs outline-none text-gray-900 dark:text-white" />
                </div>
              )}
              <FolderTree workspaceSearchQuery={workspaceSearchQuery} />
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
          Developed by <a href="https://www.linkedin.com/in/arunkmurali/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">arunkumar murali</a>
        </div>
      </div>
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Delete Conversation"
        message="Are you sure you want to permanently delete this chat history? This action cannot be undone."
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => { if (deleteModal.id) dispatch(deleteConversation(deleteModal.id)); }}
      />
    </aside>
  );
};

export default LeftSidebar;
