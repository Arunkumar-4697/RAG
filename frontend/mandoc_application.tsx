import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Upload, FileText, Settings, Search, Send, Plus, 
  MessageSquare, ChevronRight, ChevronDown, Trash2, Moon, Sun,
  CheckSquare, Square, Loader2, Database, ShieldCheck, X, Folder, FolderOpen,
  FolderPlus, Pencil, FileX, AlertTriangle, MoreHorizontal, Paperclip, ArrowUp, Activity, BarChart2
} from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [chatStarted, setChatStarted] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Sidebar Resizing & Workspace State
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);

  // File & Folder Management States
  const fileInputRef = useRef(null);
  const [uploadTargetId, setUploadTargetId] = useState(null);
  const [creatingNodeParentId, setCreatingNodeParentId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);
  const [searchScope, setSearchScope] = useState('Selected Documents');

  // Conversations State
  const [conversations, setConversations] = useState([
    { id: 'c1', title: 'Resume Discussion', group: 'Today' },
    { id: 'c2', title: 'AWS Interview Questions', group: 'Today' },
    { id: 'c3', title: 'Health Report Analysis', group: 'Today' },
    { id: 'c4', title: 'Kubernetes Notes', group: 'Yesterday' },
    { id: 'c5', title: 'React Learning', group: 'Yesterday' },
    { id: 'c6', title: 'Python Concepts', group: 'Previous 7 Days' },
    { id: 'c7', title: 'Docker Setup', group: 'Previous 7 Days' },
  ]);
  const [activeChatId, setActiveChatId] = useState('c1');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');
  const conversationGroups = ['Today', 'Yesterday', 'Previous 7 Days'];

  // Right Panel Collapsible State
  const [rightPanelSections, setRightPanelSections] = useState({
    scope: true,
    embedding: false,
    llm: true,
    health: true,
    stats: true
  });
  const toggleRightSection = (section) => setRightPanelSections(prev => ({...prev, [section]: !prev[section]}));

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: '', payload: null });
  const [renameInput, setRenameInput] = useState('');

  // Recursive Folder State
  const [folders, setFolders] = useState([
    {
      id: 'f1',
      name: 'Primary User',
      isOpen: true,
      folders: [
        {
          id: 'f1-sub1',
          name: 'Archived Documents',
          isOpen: false,
          folders: [],
          files: [{ id: '99', name: 'Legacy_Architecture.pdf' }]
        }
      ],
      files: [
        { id: '1', name: 'AWS_Architecture.pdf' },
        { id: '2', name: 'Docker_Containers.pdf' },
        { id: '3', name: 'Kubernetes_Setup.pdf' },
      ]
    },
    {
      id: 'f2',
      name: 'Project Alpha',
      isOpen: false,
      folders: [],
      files: [
        { id: '4', name: 'Product_Requirements.md' },
        { id: '5', name: 'Meeting_Notes.txt' },
      ]
    }
  ]);

  const [selectedFiles, setSelectedFiles] = useState(new Set(['1', '2']));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isThinking, chatStarted]);

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

  const getAllFileIds = (nodes) => {
    let ids = [];
    nodes.forEach(n => {
      ids.push(...n.files.map(file => file.id));
      if (n.folders) ids.push(...getAllFileIds(n.folders));
    });
    return ids;
  };

  const updateNodes = (nodes, id, updater) => nodes.map(n => {
    if (n.id === id) return updater(n);
    if (n.folders) return { ...n, folders: updateNodes(n.folders, id, updater) };
    return n;
  });

  const filterFolders = (nodes, idToRemove) => nodes
    .filter(n => n.id !== idToRemove)
    .map(n => ({ ...n, folders: n.folders ? filterFolders(n.folders, idToRemove) : [] }));

  const filterFiles = (nodes, fileIdToRemove) => nodes.map(n => ({
    ...n,
    files: n.files.filter(f => f.id !== fileIdToRemove),
    folders: n.folders ? filterFiles(n.folders, fileIdToRemove) : []
  }));

  const clearFolderFilesDeep = (nodes, folderId) => nodes.map(n => {
    if (n.id === folderId) return { ...n, files: [] };
    if (n.folders) return { ...n, folders: clearFolderFilesDeep(n.folders, folderId) };
    return n;
  });

  const renameFileDeep = (nodes, fileId, newName) => nodes.map(n => ({
    ...n,
    files: n.files.map(f => f.id === fileId ? { ...f, name: newName } : f),
    folders: n.folders ? renameFileDeep(n.folders, fileId, newName) : []
  }));

  const addFolderDeep = (nodes, parentId, newFolder) => {
    if (parentId === 'root') return [...nodes, newFolder];
    return nodes.map(n => {
      if (n.id === parentId) return { ...n, isOpen: true, folders: [...(n.folders || []), newFolder] };
      if (n.folders) return { ...n, folders: addFolderDeep(n.folders, parentId, newFolder) };
      return n;
    });
  };

  const addFilesDeep = (nodes, folderId, newFiles) => nodes.map(n => {
    if (n.id === folderId) return { ...n, isOpen: true, files: [...n.files, ...newFiles] };
    if (n.folders) return { ...n, folders: addFilesDeep(n.folders, folderId, newFiles) };
    return n;
  });

  const handleSend = () => {
    if (!input.trim()) return;
    setChatStarted(true);
    setIsThinking(true);
    setInput('');
    setTimeout(() => setIsThinking(false), 2000);
  };

  const toggleFolder = (folderId) => setFolders(updateNodes(folders, folderId, n => ({ ...n, isOpen: !n.isOpen })));

  const toggleFileSelection = (e, fileId) => {
    e.stopPropagation();
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleSearchScopeChange = (e) => {
    const scope = e.target.value;
    setSearchScope(scope);
    if (scope === 'All Documents') setSelectedFiles(new Set(getAllFileIds(folders)));
  };

  const openModal = (type, payload) => {
    setModal({ isOpen: true, type, payload });
    if (type.includes('rename')) setRenameInput(payload.name || payload.title);
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', payload: null });
    setRenameInput('');
  };

  const confirmModal = () => {
    const { type, payload } = modal;
    let nextFolders = folders;
    if (type === 'delete_folder') nextFolders = filterFolders(folders, payload.id);
    else if (type === 'delete_file') nextFolders = filterFiles(folders, payload.id);
    else if (type === 'clear_folder') nextFolders = clearFolderFilesDeep(folders, payload.id);
    else if (type === 'rename_folder') nextFolders = updateNodes(folders, payload.id, n => ({ ...n, name: renameInput }));
    else if (type === 'rename_file') nextFolders = renameFileDeep(folders, payload.id, renameInput);
    else if (type === 'rename_chat') setConversations(conversations.map(c => c.id === payload.id ? { ...c, title: renameInput } : c));
    setFolders(nextFolders);
    closeModal();
  };

  const handleCreateFolderKeyDown = (e, parentId) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      const newFolder = { id: `f-${Date.now()}`, name: newFolderName.trim(), isOpen: true, folders: [], files: [] };
      setFolders(addFolderDeep(folders, parentId, newFolder));
      setNewFolderName('');
      setCreatingNodeParentId(null);
    } else if (e.key === 'Escape') {
      setCreatingNodeParentId(null);
      setNewFolderName('');
    }
  };

  const handleDragOver = (e, folderId) => { e.preventDefault(); setDraggedOverFolder(folderId); };
  const handleDrop = (e, folderId) => {
    e.preventDefault();
    setDraggedOverFolder(null);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;
    const targetId = folderId || folders[0]?.id;
    if(!targetId) return;
    processUpload(droppedFiles, targetId);
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;
    const targetId = uploadTargetId || folders[0]?.id;
    if(!targetId) return;
    processUpload(uploadedFiles, targetId);
  };

  const processUpload = (fileArray, targetId) => {
    setIsUploading(true);
    setTimeout(() => {
      const newFiles = fileArray.map((file, index) => ({ id: `uploaded-${Date.now()}-${index}`, name: file.name }));
      setFolders(prev => addFilesDeep(prev, targetId, newFiles));
      setIsUploading(false);
      setUploadTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1200);
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map(node => {
      const nodeMatches = node.name.toLowerCase().includes(workspaceSearchQuery.toLowerCase());
      const hasMatchingChildren = (n) => {
        if (n.files.some(f => f.name.toLowerCase().includes(workspaceSearchQuery.toLowerCase()))) return true;
        if (n.folders && n.folders.some(child => hasMatchingChildren(child))) return true;
        return false;
      };
      
      const shouldShow = workspaceSearchQuery === '' || nodeMatches || hasMatchingChildren(node);
      if (!shouldShow) return null;

      const isExpanded = workspaceSearchQuery !== '' ? true : node.isOpen;

      return (
        <div key={node.id} className={level > 0 ? "ml-3 border-l border-gray-300 dark:border-gray-800 pl-2 space-y-0.5 mt-0.5" : "space-y-0.5 mt-0.5"}>
          <div 
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDragLeave={() => setDraggedOverFolder(null)}
            onDrop={(e) => handleDrop(e, node.id)}
            className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200/50 dark:hover:bg-gray-800/60 rounded-md cursor-pointer text-gray-700 dark:text-gray-300 transition-colors select-none group ${draggedOverFolder === node.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500 border-dashed' : ''}`}
            onClick={() => toggleFolder(node.id)}
          >
            {isExpanded ? <ChevronDown size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />}
            {isExpanded ? <FolderOpen size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /> : <Folder size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
            <span className="text-[13px] font-medium truncate flex-1 tracking-wide">{node.name}</span>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto text-gray-400">
              <button onClick={(e) => { e.stopPropagation(); setUploadTargetId(node.id); fileInputRef.current?.click(); }} title="Upload File" className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded"><Upload size={13} /></button>
              <button onClick={(e) => { e.stopPropagation(); setCreatingNodeParentId(node.id); }} title="New Subfolder" className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded"><FolderPlus size={13} /></button>
              <button onClick={(e) => { e.stopPropagation(); openModal('delete_folder', node); }} title="Delete Folder" className="hover:text-red-500 p-0.5 rounded"><Trash2 size={13} /></button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="space-y-0.5">
              {creatingNodeParentId === node.id && (
                <div className="px-2 mb-1 ml-4">
                  <input
                    autoFocus
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => handleCreateFolderKeyDown(e, node.id)}
                    onBlur={() => { setCreatingNodeParentId(null); setNewFolderName(''); }}
                    placeholder="New folder..."
                    className="w-full bg-white dark:bg-gray-900 border border-blue-500 rounded px-2 py-1 text-xs outline-none shadow-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
              
              {renderTree(node.folders || [], level + 1)}
              
              {node.files.map(file => {
                if (workspaceSearchQuery !== '' && !file.name.toLowerCase().includes(workspaceSearchQuery.toLowerCase())) return null;
                const isSelected = selectedFiles.has(file.id);
                return (
                  <div 
                    key={file.id} 
                    onClick={(e) => toggleFileSelection(e, file.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${level > 0 ? 'ml-4' : 'ml-1'} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/50' : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/60'}`}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? <CheckSquare size={14} className="text-blue-600 dark:text-blue-400" /> : <Square size={14} className="text-gray-400 dark:text-gray-600 group-hover:text-gray-500" />}
                    </div>
                    <FileText size={14} className={`${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} flex-shrink-0`} />
                    <span className={`text-[13px] truncate flex-1 tracking-wide ${isSelected ? 'text-gray-900 dark:text-blue-100 font-medium' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300'}`}>
                      {file.name}
                    </span>
                    
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto text-gray-400">
                      <button onClick={(e) => { e.stopPropagation(); openModal('rename_file', file); }} title="Rename File" className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded"><Pencil size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); openModal('delete_file', file); }} title="Delete File" className="hover:text-red-500 p-0.5 rounded"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`h-screen flex w-full font-sans antialiased transition-colors duration-300 ${darkMode ? 'dark' : ''}`} style={{ cursor: isResizing ? 'col-resize' : 'auto', userSelect: isResizing ? 'none' : 'auto' }}>
      
      <style>{`
        .modern-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .modern-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modern-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 9999px; }
        .modern-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); }
        .dark .modern-scrollbar::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.4); }
        .dark .modern-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.7); }
      `}</style>

      <div className="flex w-full h-full bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-gray-100 overflow-hidden relative">
        
        {/* Left Sidebar */}
        {sidebarOpen && (
          <aside style={{ width: sidebarWidth }} className="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0e12] flex flex-col relative transition-colors">
            <div onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }} className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-blue-500/50 ${isResizing ? 'bg-blue-500' : 'bg-transparent'} transition-colors`} />

            <div className="p-4 flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-3 mb-6 px-2 mt-2 flex-shrink-0">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm"><MessageSquare size={20} /></div>
                <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">ManDoc</h1>
              </div>

              {/* Conversations Section */}
              <div className={`flex flex-col transition-all duration-300 ease-in-out ${isWorkspaceExpanded ? 'flex-1 min-h-0' : 'flex-1'}`}>
                <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Conversations</h2>
                </div>

                <button onClick={() => {
                  const newId = `c-${Date.now()}`;
                  setConversations([{ id: newId, title: 'New Conversation', group: 'Today' }, ...conversations]);
                  setActiveChatId(newId);
                  setChatStarted(false);
                  setInput('');
                }} className="flex items-center justify-center gap-2 w-full p-2 mb-3 bg-white dark:bg-[#1a1b23] hover:bg-gray-100 dark:hover:bg-[#23252f] border border-gray-200 dark:border-gray-800/60 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 transition-all shadow-sm">
                  <Plus size={16} className="text-blue-600 dark:text-blue-500" /> New Chat
                </button>

                <div className="relative mb-3 px-1 flex-shrink-0">
                  <Search size={14} className="absolute left-3.5 top-2.5 text-gray-400" />
                  <input type="text" placeholder="Search chats..." value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} className="w-full bg-white dark:bg-[#13141a] border border-gray-200 dark:border-gray-800 rounded-xl py-2 pl-9 pr-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm" />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4 modern-scrollbar min-h-0 pb-2">
                  {conversationGroups.map(group => {
                    const groupChats = conversations.filter(c => c.group === group && c.title.toLowerCase().includes(chatSearchQuery.toLowerCase()));
                    if (groupChats.length === 0) return null;
                    return (
                      <div key={group} className="space-y-0.5">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1.5">{group}</div>
                        {groupChats.map(chat => {
                          const isActive = activeChatId === chat.id;
                          return (
                            <div key={chat.id} onClick={() => { setActiveChatId(chat.id); setChatStarted(true); }} className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer group transition-all text-[13px] relative ${isActive ? 'bg-blue-50 dark:bg-[#1a1b23] text-blue-700 dark:text-white font-medium shadow-sm border border-blue-100 dark:border-gray-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1b23] border border-transparent'}`}>
                              <MessageSquare size={14} className={isActive ? "text-blue-600 dark:text-blue-500" : "text-gray-400"} />
                              <span className="truncate flex-1 pr-6">{chat.title}</span>
                              <button onClick={(e) => { e.stopPropagation(); openModal('rename_chat', chat); }} className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all absolute right-2">
                                <MoreHorizontal size={14} />
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
                        <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => handleCreateFolderKeyDown(e, 'root')} onBlur={() => { setCreatingNodeParentId(null); setNewFolderName(''); }} placeholder="Folder name..." className="w-full bg-white dark:bg-[#13141a] border border-blue-500 rounded px-2 py-1 text-xs outline-none text-gray-900 dark:text-white" />
                      </div>
                    )}
                    {renderTree(folders)}
                  </div>
                </div>
              </div>

            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-white dark:bg-[#1a1b1e]">
          <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex flex-shrink-0 items-center justify-between px-4 bg-gray-50 dark:bg-[#13141a] z-10 shadow-sm dark:shadow-none">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <div className="flex gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </header>

          <div 
            className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth"
            onDragOver={(e) => handleDragOver(e, null)} 
            onDragLeave={() => setDraggedOverFolder(null)} 
            onDrop={(e) => handleDrop(e, null)}
          >
            {!chatStarted ? (
              <div className="flex flex-col items-center justify-center h-full max-w-[700px] mx-auto text-center px-4 animate-in fade-in duration-500">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-5 shadow-sm border border-blue-100 dark:border-blue-800/30">
                  <MessageSquare size={28} />
                </div>
                <h2 className="text-[28px] font-semibold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">How can I help you today?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-[15px] max-w-md mx-auto">
                  Select your documents and start asking questions to extract insights, summarize data, and more.
                </p>
              </div>
            ) : (
              <div className="max-w-[700px] mx-auto w-full space-y-8 px-4 pb-6">
                
                {/* User Message */}
                <div className="flex justify-end w-full animate-in slide-in-from-bottom-2">
                  <div className="max-w-[80%] px-5 py-3.5 bg-blue-600 text-white rounded-[24px] rounded-br-[4px] shadow-sm text-[15px] font-normal leading-relaxed">
                    Can you summarize the networking concepts from my selected documents?
                  </div>
                </div>

                {/* Assistant Message */}
                <div className="flex justify-start w-full animate-in slide-in-from-bottom-2">
                  <div className="w-full bg-white dark:bg-[#212127] border border-gray-200 dark:border-gray-800 rounded-[24px] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6">
                      <div className="text-[15px] leading-7 text-gray-800 dark:text-gray-200">
                        <p>Based on your documents, here is a summary of the networking concepts:</p>
                        <p className="mt-4">
                          Docker uses container networking to isolate applications, often relying on bridge networks by default. Kubernetes, on the other hand, implements a flat networking model where every pod gets its own IP address, allowing pods to communicate without NAT constraints.
                        </p>
                      </div>
                    </div>

                    {/* Sources Section */}
                    <div className="px-6 py-4 bg-gray-50/80 dark:bg-[#1a1b1e]/50 border-t border-gray-200 dark:border-gray-800/60 mt-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-[#2a2b32] border border-gray-200 dark:border-gray-700/80 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all max-w-[280px] shadow-sm group">
                          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors shrink-0">
                            <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Arun-React.pdf</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-[#2a2b32] border border-gray-200 dark:border-gray-700/80 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all max-w-[280px] shadow-sm group">
                          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors shrink-0">
                            <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">ForwardDeployedEngineer_India.pdf</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="flex justify-start w-full animate-in fade-in">
                    <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#212127] border border-gray-200 dark:border-gray-800 rounded-[20px] shadow-sm w-fit text-gray-500 dark:text-gray-400">
                      <Loader2 className="animate-spin text-blue-500" size={18}/>
                      <span className="text-sm font-medium">Analyzing documents...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:px-6 md:py-6 bg-white dark:bg-[#1a1b1e] shrink-0">
            <div className="max-w-[700px] mx-auto relative flex flex-col">
              
              {/* Searching Status Indicator */}
              <div className="flex justify-center mb-4">
                <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#212127] px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-2">
                  <Search size={12} className="text-gray-400 dark:text-gray-500" />
                  Searching across {selectedFiles.size} selected file{selectedFiles.size !== 1 ? 's' : ''}
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
                  placeholder="Ask questions across selected documents..."
                  className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 resize-none min-h-[48px] max-h-[200px] text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none leading-relaxed modern-scrollbar"
                  rows="1"
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isThinking}
                  className="p-2 mb-1 mr-1 bg-black dark:bg-white disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm shrink-0 flex items-center justify-center h-10 w-10"
                >
                  <ArrowUp size={20} className={!input.trim() || isThinking ? "" : "translate-y-[-1px]"} />
                </button>
              </div>
              <div className="text-center mt-3 max-w-[700px] mx-auto">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 tracking-wide">AI can make mistakes. Verify important information from the citations.</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - Configuration */}
        {rightPanelOpen && (
          <aside className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0e12] p-4 flex flex-col gap-4 overflow-y-auto modern-scrollbar">
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-[14px]">
                <Settings size={16} className="text-gray-500"/> Settings
              </h3>
              <button onClick={() => setRightPanelOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#1a1b23]">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4 pb-4">
              
              {/* Search Scope Card */}
              <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div onClick={() => toggleRightSection('scope')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Search size={14} /> Search Scope
                  </span>
                  {rightPanelSections.scope ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </div>
                {rightPanelSections.scope && (
                  <div className="p-3.5 pt-3">
                    <select 
                      value={searchScope}
                      onChange={handleSearchScopeChange}
                      className="w-full p-2.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200"
                    >
                      <option value="Selected Documents">Selected Documents</option>
                      <option value="All Documents">All Documents</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Embedding Model Card */}
              <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div onClick={() => toggleRightSection('embedding')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Database size={14} /> Embedding Model
                  </span>
                  {rightPanelSections.embedding ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </div>
                {rightPanelSections.embedding && (
                  <div className="p-3.5 pt-3">
                    <select className="w-full p-2.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200">
                      <option>BGE Small v1.5</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Language Model Card */}
              <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div onClick={() => toggleRightSection('llm')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <MessageSquare size={14} /> Language Model
                  </span>
                  {rightPanelSections.llm ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </div>
                {rightPanelSections.llm && (
                  <div className="p-3.5 pt-3">
                    <select className="w-full p-2.5 bg-gray-50 dark:bg-[#0d0e12] rounded-lg text-[13px] border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200">
                      <option>GPT OSS 20B</option>
                      <option>Gemini 1.5 Pro</option>
                    </select>
                  </div>
                )}
              </div>

              {/* System Health Card */}
              <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div onClick={() => toggleRightSection('health')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Activity size={14} /> System Health
                  </span>
                  {rightPanelSections.health ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </div>
                {rightPanelSections.health && (
                  <div className="p-3.5 pt-3 space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0d0e12] p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">API Service</span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0d0e12] p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60">
                      <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Qdrant DB</span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Operational
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics Card */}
              <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div onClick={() => toggleRightSection('stats')} className="flex items-center justify-between p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#13141a] hover:bg-gray-100 dark:hover:bg-[#1a1b23] transition-colors border-b border-transparent dark:border-gray-800/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <BarChart2 size={14} /> Statistics
                  </span>
                  {rightPanelSections.stats ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </div>
                {rightPanelSections.stats && (
                  <div className="p-4 pt-3 bg-white dark:bg-[#1a1b1e]">
                     <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-gray-500 dark:text-gray-400">Total Documents</span>
                          <span className="text-[13px] font-medium text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-[#0d0e12] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">{getAllFileIds(folders).length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-gray-500 dark:text-gray-400">Indexed Chunks</span>
                          <span className="text-[13px] font-medium text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-[#0d0e12] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">1,204</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-gray-500 dark:text-gray-400">Last Upload Time</span>
                          <span className="text-[13px] font-medium text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-[#0d0e12] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">2 hrs ago</span>
                        </div>
                     </div>
                  </div>
                )}
              </div>

            </div>
          </aside>
        )}

        {/* Global Modals for Confirmation and Rename */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                {modal.type.includes('delete') || modal.type.includes('clear') ? (
                  <AlertTriangle className="text-red-500" size={24} />
                ) : (
                  <Pencil className="text-blue-500" size={24} />
                )}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {modal.type.includes('delete') || modal.type.includes('clear') ? 'Confirm Action' : 'Rename Item'}
                </h3>
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                {modal.type === 'delete_folder' && <p>Are you sure you want to delete the folder <span className="font-bold">"{modal.payload?.name}"</span>? All nested files and folders will be permanently deleted.</p>}
                {modal.type === 'delete_file' && <p>Are you sure you want to delete the file <span className="font-bold">"{modal.payload?.name}"</span>?</p>}
                {modal.type === 'clear_folder' && <p>Are you sure you want to remove all files inside the folder <span className="font-bold">"{modal.payload?.name}"</span>?</p>}
                {modal.type.includes('rename') && (
                  <input 
                    autoFocus
                    value={renameInput}
                    onChange={e => setRenameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && renameInput.trim()) confirmModal(); }}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all shadow-sm"
                    placeholder="Enter new name..."
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
                <button 
                  onClick={confirmModal} 
                  disabled={modal.type.includes('rename') && !renameInput.trim()}
                  className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${modal.type.includes('delete') || modal.type.includes('clear') ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {modal.type.includes('delete') || modal.type.includes('clear') ? 'Yes, Delete' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}