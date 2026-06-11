import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, ChevronRight, FolderOpen, Folder, Upload, FolderPlus, Trash2, CheckSquare, Square, FileText } from 'lucide-react';
import { uploadFile, deleteFolder, createFolder } from '../../redux/slices/folderSlice';
import { deleteFile as deleteFileApiAction } from '../../redux/slices/folderSlice';
import { toggleFileSelection } from '../../redux/slices/fileSlice';
import ConfirmModal from '../common/ConfirmModal';

const FolderTree = ({ workspaceSearchQuery = '' }) => {
  const tree = useSelector(state => state.folder.tree);
  const selectedFiles = useSelector(state => state.file.selectedFiles);
  const dispatch = useDispatch();
  
  const [openFolders, setOpenFolders] = useState(new Set());
  const [creatingInPath, setCreatingInPath] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, path: null });

  const toggleFolder = (path) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleCreateFolder = (e, parentPath) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      const fullPath = parentPath ? `${parentPath}/${newFolderName.trim()}` : newFolderName.trim();
      dispatch(createFolder(fullPath));
      setCreatingInPath(null);
      setNewFolderName('');
    } else if (e.key === 'Escape') {
      setCreatingInPath(null);
      setNewFolderName('');
    }
  };

  const triggerUpload = (e, path) => {
    e.stopPropagation();
    setUploadTarget(path);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      dispatch(uploadFile({ folderPath: uploadTarget, file }));
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadTarget('');
  };

  const handleDeleteFolder = (e, path) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: 'folder', path });
  };

  const handleDeleteFile = (e, path) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: 'file', path });
  };

  const renderNodes = (nodes, level = 0) => {
    return nodes.map((node, i) => {
      const q = workspaceSearchQuery.toLowerCase();
      const nodeMatches = node.name.toLowerCase().includes(q);
      
      const hasMatchingChildren = (n) => {
        if (!n.children) return false;
        return n.children.some(child => {
          if (child.name.toLowerCase().includes(q)) return true;
          if (child.type === 'folder') return hasMatchingChildren(child);
          return false;
        });
      };

      const shouldShow = q === '' || nodeMatches || (node.type === 'folder' && hasMatchingChildren(node));
      if (!shouldShow) return null;

      if (node.type === 'folder') {
        const isOpen = q !== '' ? true : openFolders.has(node.path);
        return (
          <div key={node.path + i} className={level > 0 ? "ml-3 border-l border-gray-300 dark:border-gray-800 pl-2 space-y-0.5 mt-0.5" : "space-y-0.5 mt-0.5"}>
            <div 
              onClick={() => toggleFolder(node.path)}
              className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200/50 dark:hover:bg-gray-800/60 rounded-md cursor-pointer text-gray-700 dark:text-gray-300 transition-colors select-none group"
            >
              {isOpen ? <ChevronDown size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />}
              {isOpen ? <FolderOpen size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /> : <Folder size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
              <span className="text-[13px] font-medium truncate flex-1 tracking-wide">{node.name}</span>
              
              <div className="flex items-center gap-1 ml-auto text-gray-400">
                <button onClick={(e) => triggerUpload(e, node.path)} title="Upload File" className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded"><Upload size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); setCreatingInPath(node.path); setOpenFolders(prev => new Set(prev).add(node.path)); }} title="New Subfolder" className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded"><FolderPlus size={13} /></button>
                <button onClick={(e) => handleDeleteFolder(e, node.path)} title="Delete Folder" className="hover:text-red-500 p-0.5 rounded"><Trash2 size={13} /></button>
              </div>
            </div>

            {isOpen && (
              <div className="space-y-0.5">
                {creatingInPath === node.path && (
                  <div className="px-2 mb-1 ml-4">
                    <input
                      autoFocus
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => handleCreateFolder(e, node.path)}
                      onBlur={() => { setCreatingInPath(null); setNewFolderName(''); }}
                      placeholder="New folder..."
                      className="w-full bg-white dark:bg-gray-900 border border-blue-500 rounded px-2 py-1 text-xs outline-none shadow-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
                {node.children && renderNodes(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const isSelected = selectedFiles.includes(node.path);
        return (
          <div 
            key={node.path + i} 
            onClick={(e) => { e.stopPropagation(); dispatch(toggleFileSelection(node.path)); }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${level > 0 ? 'ml-4' : 'ml-1'} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/50' : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/60'}`}
          >
            <div className="flex-shrink-0">
              {isSelected ? <CheckSquare size={14} className="text-blue-600 dark:text-blue-400" /> : <Square size={14} className="text-gray-400 dark:text-gray-600 group-hover:text-gray-500" />}
            </div>
            <FileText size={14} className={`${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} flex-shrink-0`} />
            <span className={`text-[13px] truncate flex-1 tracking-wide ${isSelected ? 'text-gray-900 dark:text-blue-100 font-medium' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300'}`}>
              {node.name}
            </span>
            <div className="flex items-center gap-1 ml-auto text-gray-400">
              <button onClick={(e) => handleDeleteFile(e, node.path)} title="Delete File" className="hover:text-red-500 p-0.5 rounded"><Trash2 size={13} /></button>
            </div>
          </div>
        );
      }
    });
  };

  return (
    <>
      <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.md" />
      {renderNodes(tree)}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.type === 'folder' ? 'Folder' : 'File'}`}
        message={deleteModal.type === 'folder' ? 'Are you sure you want to permanently delete this folder and all of its contents?' : 'Are you sure you want to permanently delete this file?'}
        onCancel={() => setDeleteModal({ isOpen: false, type: null, path: null })}
        onConfirm={() => { 
          if (deleteModal.type === 'folder') dispatch(deleteFolder(deleteModal.path));
          else if (deleteModal.type === 'file') dispatch(deleteFileApiAction(deleteModal.path));
        }}
      />
    </>
  );
};

export default FolderTree;
