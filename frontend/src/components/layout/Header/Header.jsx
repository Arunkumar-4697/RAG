import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../../../redux/slices/settingsSlice';
import { Menu, Sun, Moon, Settings } from 'lucide-react';


const Header = ({ sidebarOpen, setSidebarOpen, rightPanelOpen, setRightPanelOpen }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.settings.darkMode);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex flex-shrink-0 items-center justify-between px-4 bg-gray-50 dark:bg-[#13141a] z-10 shadow-sm dark:shadow-none">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <Menu size={20} />
      </button>
      <div className="flex gap-2">
        <button onClick={() => dispatch(toggleDarkMode())} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
