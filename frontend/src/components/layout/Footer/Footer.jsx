import React from 'react';


const Footer = () => {
  return (
    <div className="flex justify-between items-center py-2 px-4 border-t border-gray-100 dark:border-gray-800/50 bg-white dark:bg-[#1a1b1e]">
      <span className="text-xs text-gray-400 dark:text-gray-500">
        © 2026 DocuMind Application. All rights reserved.
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        Version 1.0.0
      </span>
    </div>
  );
};

export default Footer;
