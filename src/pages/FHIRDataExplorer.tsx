// FHIR Data Explorer - Main dashboard for data exploration
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { ListViewerConfig, Workspace } from '../shared/types';
import WorkspaceManager from '../components/WorkspaceManager';
import TopNavigation from '../components/TopNavigation';
import Breadcrumb from '../components/Breadcrumb';

const FHIRDataExplorer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [listViewers, setListViewers] = useState<ListViewerConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get workspace ID from URL
  const workspaceId = searchParams.get('workspace');

  // Workspace management handlers
  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    // Update URL to reflect selected workspace
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('workspace', workspace.id);
    window.history.replaceState({}, '', `/?${newSearchParams.toString()}`);
  };

  const handleWorkspaceCreate = (_workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Workspace creation is handled in WorkspaceManager
    loadData();
  };

  const handleWorkspaceUpdate = (workspace: Workspace) => {
    if (currentWorkspace?.id === workspace.id) {
      setCurrentWorkspace(workspace);
    }
  };

  const handleWorkspaceDelete = (workspaceId: string) => {
    // Delete all list viewers in this workspace
    const stored = localStorage.getItem('fhir-list-viewers');
    if (stored) {
      const parsed = JSON.parse(stored);
      const allListViewers = parsed.listViewers || [];
      const remainingListViewers = allListViewers.filter(
        (lv: ListViewerConfig) => lv.workspaceId !== workspaceId
      );
      localStorage.setItem('fhir-list-viewers', JSON.stringify({ listViewers: remainingListViewers }));
    }
    // If we're deleting the current workspace, reload data
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(null);
      setListViewers([]);
    }
  };

  // Load workspace and list viewers
  const loadData = () => {
      try {
        // Load workspaces
        const storedWorkspaces = localStorage.getItem('fhir-workspaces');
        if (storedWorkspaces) {
          const workspaces = JSON.parse(storedWorkspaces);
          let targetWorkspace: Workspace | null = null;
          
          if (workspaceId) {
            targetWorkspace = workspaces.find((w: Workspace) => w.id === workspaceId) || null;
          } else {
            // Find default workspace or use first one
            targetWorkspace = workspaces.find((w: Workspace) => w.isDefault) || workspaces[0] || null;
          }
          
          setCurrentWorkspace(targetWorkspace);

          // Load list viewers for this workspace
          if (targetWorkspace) {
            const storedListViewers = localStorage.getItem('fhir-list-viewers');
            if (storedListViewers) {
              const parsed = JSON.parse(storedListViewers);
              const workspaceListViewers = (parsed.listViewers || []).filter(
                (lv: ListViewerConfig) => lv.workspaceId === targetWorkspace.id
              );
              setListViewers(workspaceListViewers);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load workspace data:', error);
      } finally {
        setIsLoading(false);
      }
    };

  // Load workspace and list viewers  
  useEffect(() => {
    loadData();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Workspace Panel */}
      <WorkspaceManager 
        currentWorkspace={currentWorkspace}
        onWorkspaceSelect={handleWorkspaceSelect}
        onWorkspaceCreate={handleWorkspaceCreate}
        onWorkspaceUpdate={handleWorkspaceUpdate}
        onWorkspaceDelete={handleWorkspaceDelete}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 FHIR Data Explorer</h1>
            {currentWorkspace && (
              <p className="text-sm text-gray-600">
                {currentWorkspace.icon} {currentWorkspace.name} • {listViewers.length} list viewers available
              </p>
            )}
          </div>
          <TopNavigation currentWorkspace={currentWorkspace} />
        </div>
        
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb currentWorkspace={currentWorkspace} />
            {!currentWorkspace ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Workspace Selected</h2>
                <p className="text-gray-600">Please select a workspace to view your FHIR data.</p>
              </div>
            ) : listViewers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No List Viewers Available</h2>
                <p className="text-gray-600 mb-6">
                  Configure some list viewers in the Configuration section to start exploring your FHIR data.
                </p>
                <Link
                  to={`/config/list-viewers?workspace=${currentWorkspace.id}`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Configure List Viewers
                </Link>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Available Data Views</h2>
                  <p className="text-gray-600">Explore your FHIR data using the configured list viewers below.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listViewers.map((listViewer) => (
                    <div key={listViewer.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {listViewer.name}
                            </h3>
                            {listViewer.description && (
                              <p className="text-sm text-gray-600 mb-3">{listViewer.description}</p>
                            )}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {listViewer.resourceType}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>{listViewer.columns?.length || 0} columns</span>
                          <span>Updated {listViewer.updatedAt ? new Date(listViewer.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        
                        <div className="flex gap-3">
                          <Link
                            to={`/explorer/${listViewer.id}?workspace=${currentWorkspace.id}`}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors text-center font-medium"
                          >
                            View Data
                          </Link>
                          <Link
                            to={`/config/list-viewers/${listViewer.id}?workspace=${currentWorkspace.id}`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors font-medium"
                            title="Configure"
                          >
                            ⚙️
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FHIRDataExplorer;