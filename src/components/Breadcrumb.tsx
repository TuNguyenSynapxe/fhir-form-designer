// Breadcrumb Navigation Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Workspace } from '../shared/types';

interface BreadcrumbProps {
  currentWorkspace?: Workspace | null;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentWorkspace }) => {
  const location = useLocation();
  
  const getBreadcrumbItems = () => {
    const items = [];
    const path = location.pathname;
    const workspaceParam = currentWorkspace ? `?workspace=${currentWorkspace.id}` : '';

    // Workspace (always first)
    if (currentWorkspace) {
      items.push({
        label: `${currentWorkspace.icon} ${currentWorkspace.name}`,
        href: `/${workspaceParam}`,
        isLast: false
      });
    }

    // Path-based breadcrumbs
    if (path === '/' || path === '') {
      items.push({
        label: '📊 Data Explorer',
        href: `/${workspaceParam}`,
        isLast: true
      });
    } else if (path.startsWith('/explorer/')) {
      const listViewerId = path.split('/explorer/')[1];
      items.push(
        {
          label: '📊 Data Explorer',
          href: `/${workspaceParam}`,
          isLast: false
        },
        {
          label: '📋 List Viewer',
          href: `/explorer/${listViewerId}${workspaceParam}`,
          isLast: true
        }
      );
    } else if (path === '/config') {
      items.push({
        label: '⚙️ Configuration',
        href: `/config${workspaceParam}`,
        isLast: true
      });
    } else if (path === '/config/templates' || path.startsWith('/config/templates/')) {
      items.push(
        {
          label: '⚙️ Configuration',
          href: `/config${workspaceParam}`,
          isLast: false
        },
        {
          label: '📋 Templates',
          href: `/config/templates${workspaceParam}`,
          isLast: path === '/config/templates'
        }
      );
      
      // Individual template
      if (path.startsWith('/config/templates/')) {
        const templateId = path.split('/config/templates/')[1];
        items.push({
          label: '📝 Template Editor',
          href: `/config/templates/${templateId}${workspaceParam}`,
          isLast: true
        });
      }
    } else if (path === '/config/list-viewers' || path.startsWith('/config/list-viewers/')) {
      items.push(
        {
          label: '⚙️ Configuration',
          href: `/config${workspaceParam}`,
          isLast: false
        },
        {
          label: '📊 List Viewers',
          href: `/config/list-viewers${workspaceParam}`,
          isLast: path === '/config/list-viewers'
        }
      );
      
      // Individual list viewer
      if (path.startsWith('/config/list-viewers/')) {
        const listViewerId = path.split('/config/list-viewers/')[1];
        items.push({
          label: '⚙️ List Viewer Editor',
          href: `/config/list-viewers/${listViewerId}${workspaceParam}`,
          isLast: true
        });
      }
    } else if (path === '/templates') {
      items.push({
        label: '📋 Templates (Legacy)',
        href: '/templates',
        isLast: true
      });
    } else if (path === '/list-viewer') {
      items.push({
        label: '📊 List Viewers (Legacy)',
        href: '/list-viewer',
        isLast: true
      });
    } else if (path === '/widget-test') {
      items.push({
        label: '🧪 Widget Test',
        href: '/widget-test',
        isLast: true
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single-level navigation
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.isLast ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link
              to={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;