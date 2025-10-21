// List Viewer Index page - shows tile UI of created list views
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ListViewerConfig, Workspace } from '../shared/types';
import { saveSampleDataToLocalStorage, addSampleDataToCurrentWorkspace } from '../mocks/sampleWorkspaceData';
import TopNavigation from '../components/TopNavigation';
import CreateListViewerModal from '../components/CreateListViewerModal';
import WorkspaceManager from '../components/WorkspaceManager';
import { useListViewerConfig } from '../hooks/useFhirListViewer';

const ListViewerIndex: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [showWorkspacePanel, setShowWorkspacePanel] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  

  
  // Load workspace data directly (matching Templates pattern)
  useEffect(() => {
    const workspaceParam = searchParams.get('workspace');
    if (workspaceParam && !currentWorkspace) {
      // Load workspaces and set the current one based on URL parameter
      const storedWorkspaces = localStorage.getItem('fhir-workspaces');
      if (storedWorkspaces) {
        try {
          const workspaces = JSON.parse(storedWorkspaces);
          const targetWorkspace = workspaces.find((w: Workspace) => w.id === workspaceParam);
          if (targetWorkspace) {
            setCurrentWorkspace(targetWorkspace);
          }
        } catch (error) {
          console.error('Failed to load workspace from URL parameter:', error);
        }
      }
    }
  }, [searchParams, currentWorkspace]);

  // Load list viewers data
  const { listViewers, isLoading: listViewerLoading, error: listViewerError } = useListViewerConfig(currentWorkspace?.id);
  
  // Combined loading and error states
  const isLoading = listViewerLoading;
  const error = listViewerError;

  // Handle default workspace navigation when no workspace param is present
  useEffect(() => {
    const workspaceParam = searchParams.get('workspace');
    if (!workspaceParam) {
      const storedWorkspaces = localStorage.getItem('fhir-workspaces');
      if (storedWorkspaces) {
        try {
          const workspaces = JSON.parse(storedWorkspaces);
          const defaultWorkspace = workspaces.find((w: any) => w.isDefault) || workspaces[0];
          if (defaultWorkspace) {
            navigate(`/config/list-viewers?workspace=${defaultWorkspace.id}`, { replace: true });
          }
        } catch (err) {
          console.error('Failed to load default workspace:', err);
        }
      }
    }
  }, [searchParams, navigate]);
  
  // Workspace manager callbacks
  const handleWorkspaceCreate = (_data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Creation handled inside WorkspaceManager component; refresh implicit via localStorage change
  };
  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };
  const handleWorkspaceUpdate = (updated: Workspace) => {
    if (currentWorkspace?.id === updated.id) setCurrentWorkspace(updated);
  };
  const handleWorkspaceDelete = (deletedId: string) => {
    // Remove list viewers belonging to deleted workspace
    const stored = localStorage.getItem('fhir-list-viewers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const remaining = (parsed.listViewers || []).filter((lv: ListViewerConfig) => lv.workspaceId !== deletedId);
        localStorage.setItem('fhir-list-viewers', JSON.stringify({ listViewers: remaining }));
      } catch (err) {
        console.error('Failed to prune list viewers for deleted workspace', err);
      }
    }
    if (currentWorkspace?.id === deletedId) setCurrentWorkspace(null);
  };

  // Create sample data in current workspace
  const createSampleData = () => {
    if (!currentWorkspace) {
      // If no workspace, create a sample workspace (fallback)
      try {
        const sampleData = saveSampleDataToLocalStorage();
        alert('Sample workspace created successfully!');
        navigate(`/config/list-viewers?workspace=${sampleData.workspace.id}`);
      } catch (err) {
        alert('Failed to create sample workspace: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
      return;
    }

    // Add sample data to current workspace
    try {
      const sampleData = addSampleDataToCurrentWorkspace(currentWorkspace.id);
      alert(`Sample data added successfully! Created ${sampleData.templates.length} templates and ${sampleData.listViewers.length} list viewers.`);
      
      // Refresh the page to show new data
      window.location.reload();
    } catch (err) {
      alert('Failed to create sample data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Handle clicking on a list viewer tile
  const handleListViewerClick = (listViewerId: string) => {
    const workspaceParam = currentWorkspace ? `?workspace=${currentWorkspace.id}` : '';
    navigate(`/config/list-viewers/${listViewerId}${workspaceParam}`);
  };

  // Create new list viewer
  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCreateListViewer = async (config: ListViewerConfig) => {
    // Persist via localStorage using existing pattern from hook
    const stored = localStorage.getItem('fhir-list-viewers');
    const parsed = stored ? JSON.parse(stored) : { listViewers: [] };
    parsed.listViewers.push(config);
    localStorage.setItem('fhir-list-viewers', JSON.stringify(parsed));
    // Navigate directly to detail view
    navigate(`/config/list-viewers/${config.id}?workspace=${config.workspaceId}`);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={createSampleData}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Sample Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen bg-gray-100">
      {/* Debug banner (temporary) */}
      {/* Debug banner removed per request */}
      {/* Workspace Panel */}
      {showWorkspacePanel && (
        <WorkspaceManager
          currentWorkspace={currentWorkspace}
          onWorkspaceSelect={handleWorkspaceSelect}
          onWorkspaceCreate={handleWorkspaceCreate}
          onWorkspaceUpdate={handleWorkspaceUpdate}
          onWorkspaceDelete={handleWorkspaceDelete}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWorkspacePanel(!showWorkspacePanel)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              title="Toggle Workspace Panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FHIR List Viewer</h1>
              {currentWorkspace && (
                <p className="text-sm text-gray-600">
                  {currentWorkspace.icon} {currentWorkspace.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <TopNavigation currentWorkspace={currentWorkspace} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{renderMainContent()}</div>
        </div>
      </div>
    </div>
    {showCreateModal && (
      <CreateListViewerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateListViewer}
        currentWorkspace={currentWorkspace}
      />
    )}
    </>
  );

  function renderMainContent() {
    return listViewers.length === 0 ? (
      // Empty state - no list viewers in workspace
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          No List Viewers Found
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Get started by creating a sample workspace with pre-configured list viewers, 
          or create your first list viewer configuration.
        </p>
        <div className="space-y-3">
          <button
            onClick={createSampleData}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Create Sample Data
          </button>
          <p className="text-sm text-gray-500">
            Sample includes Patient templates and list viewers with mock FHIR data
          </p>
        </div>
      </div>
    ) : (
      // List viewer tiles
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            List Viewers
          </h2>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + Create New List Viewer
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Tile */}
          <div 
            onClick={handleCreateNew}
            className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="text-center">
              <div className="text-4xl text-gray-400 group-hover:text-blue-500 mb-4 transition-colors">
                ➕
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create New List Viewer
              </h3>
              <p className="text-sm text-gray-600">
                Opens a creation form (no sample data)
              </p>
            </div>
          </div>

          {/* Existing List Viewers */}
          {listViewers.map((listViewer) => (
            <ListViewerTile
              key={listViewer.id}
              listViewer={listViewer}
              onClick={() => handleListViewerClick(listViewer.id)}
            />
          ))}
        </div>
      </div>
    );
  }
};

// List Viewer Tile Component
interface ListViewerTileProps {
  listViewer: ListViewerConfig;
  onClick: () => void;
}

const ListViewerTile: React.FC<ListViewerTileProps> = ({ listViewer, onClick }) => {
  // Get resource type icon
  const getResourceIcon = (resourceType?: string) => {
    if (!resourceType) return '📋';
    
    switch (resourceType.toLowerCase()) {
      case 'patient': return '👤';
      case 'practitioner': return '👨‍⚕️';
      case 'organization': return '🏥';
      case 'observation': return '📊';
      case 'condition': return '🩺';
      case 'medication': return '💊';
      default: return '📋';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {getResourceIcon(listViewer.resourceType)}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {listViewer.name}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {listViewer.resourceType}
            </p>
          </div>
        </div>
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {listViewer.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Columns: {listViewer.columns?.length || 0}</span>
          <span>Created: {formatDate(listViewer.createdAt)}</span>
        </div>
        
        {listViewer.columns && listViewer.columns.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listViewer.columns.slice(0, 3).map((column) => (
              <span 
                key={column.id}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {column.header}
              </span>
            ))}
            {listViewer.columns.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{listViewer.columns.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Render create modal at root level of page (outside tile component scope)
export default ListViewerIndex;