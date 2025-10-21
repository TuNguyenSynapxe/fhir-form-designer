import React from 'react';
import { Link } from 'react-router-dom';
import type { Workspace } from '../shared/types';

interface TopNavigationProps {
  currentWorkspace?: Workspace | null;
  showTools?: boolean; // when true, show utility tools
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  currentWorkspace, // May be used for future workspace-specific tools
  showTools = true 
}) => {
  // Suppress unused variable warning - currentWorkspace kept for future features
  void currentWorkspace;
  
  if (!showTools) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Quick Actions Dropdown */}
      <div className="relative">
        <button
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          title="Quick Actions"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      {/* Help Button */}
      <button
        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        title="Help & Documentation"
        onClick={() => {
          // Could open help modal or navigate to docs
          alert('Help documentation coming soon!');
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
};

export default TopNavigation;