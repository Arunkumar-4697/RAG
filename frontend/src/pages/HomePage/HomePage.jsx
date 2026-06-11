import React, { useState } from 'react';
import Header from '../../components/layout/Header/Header';
import LeftSidebar from '../../components/layout/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/layout/RightSidebar/RightSidebar';
import ChatArea from '../../components/ChatArea/ChatArea';
import ChatInput from '../../components/ChatInput/ChatInput';

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div className="flex w-full h-full bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-gray-100 overflow-hidden relative">
      <LeftSidebar isOpen={sidebarOpen} />
      
      <main className="flex-1 flex flex-col relative min-w-0 bg-white dark:bg-[#1a1b1e]">
        <Header 
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen}
        />
        
        <ChatArea />
        <ChatInput />
      </main>

      <RightSidebar isOpen={rightPanelOpen} onClose={() => setRightPanelOpen(false)} />
    </div>
  );
};

export default HomePage;
