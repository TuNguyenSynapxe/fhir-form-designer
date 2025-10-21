import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Workspace } from '../shared/types';

interface TopNavigationProps {
  currentWorkspace?: Workspace | null;
  hideNav?: boolean; // when true, hide the Templates / List Viewer buttons
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentWorkspace, hideNav }) => {
  const location = useLocation();
  
  const getWorkspaceParam = () => {
    return currentWorkspace ? `?workspace=${currentWorkspace.id}` : '';
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (hideNav) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <Link
        to={`/${getWorkspaceParam()}`}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          isActive('/') && !isActive('/list-viewer')
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        📋 Templates
      </Link>
      <Link
        to={`/list-viewer${getWorkspaceParam()}`}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          isActive('/list-viewer')
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        📊 List Viewer
      </Link>
    </div>
  );
};

export default TopNavigation;