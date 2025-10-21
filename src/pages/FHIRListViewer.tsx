// Main FHIR List Viewer page component
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import type { ListViewerConfig, Workspace } from '../shared/types';
import { saveSampleDataToLocalStorage, addSampleDataToCurrentWorkspace } from '../mocks/sampleWorkspaceData';
import ConfigurationPanel from '../components/ConfigurationPanel';
import PreviewPanel from '../components/PreviewPanel';
import TopNavigation from '../components/TopNavigation';
import { useListViewerConfig, useWorkspaceData } from '../hooks/useFhirListViewer';

const FHIRListViewer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { listViewerId } = useParams<{ listViewerId: string }>();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  // Separate preview configuration state (only updates on save)
  const [previewConfig, setPreviewConfig] = useState<ListViewerConfig | null>(null);
  
  // Get workspace ID from URL
  const workspaceId = searchParams.get('workspace');
  
  // Use custom hooks
  const { workspace, templates, isLoading: workspaceLoading, error: workspaceError } = useWorkspaceData(workspaceId || undefined);
  const { 
    listViewers, 
    selectedListViewer, 
    setSelectedListViewer, 
    isLoading: listViewerLoading, 
    error: listViewerError,
    saveListViewer 
  } = useListViewerConfig(workspaceId || undefined);
  
  // Set current workspace from hook
  useEffect(() => {
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  }, [workspace]);
  
  // Find the specific list viewer by ID (memoized to prevent infinite re-renders)
  const currentListViewer = useMemo(() => {
    return listViewers.find(lv => lv.id === listViewerId) || selectedListViewer;
  }, [listViewers, listViewerId, selectedListViewer]);
  
  // Combined loading and error states
  const isLoading = workspaceLoading || listViewerLoading;
  const error = workspaceError || listViewerError;

  // Handle default workspace navigation ONLY when no workspace param AND not already on a specific list viewer
  useEffect(() => {
    const urlWorkspaceId = searchParams.get('workspace');
    // Guard: if we have a workspace param, never override
    if (urlWorkspaceId) return;
    // Guard: if viewing a list viewer with an id but no workspace param, do not auto-jump (allow back button target)
    if (listViewerId) return;
    const storedWorkspaces = localStorage.getItem('fhir-workspaces');
    if (storedWorkspaces) {
      try {
        const workspaces = JSON.parse(storedWorkspaces);
        const defaultWorkspace = workspaces.find((w: any) => w.isDefault) || workspaces[0];
        if (defaultWorkspace) {
          navigate(`/list-viewer?workspace=${defaultWorkspace.id}`);
        }
      } catch (err) {
        console.error('Failed to load default workspace:', err);
      }
    }
  }, [searchParams, navigate, listViewerId]);

  // Handle workspace parameter from URL
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

  // Redirect if list viewer not found
  useEffect(() => {
    if (!isLoading && listViewers.length > 0 && listViewerId && !currentListViewer) {
      console.warn(`List viewer ${listViewerId} not found, redirecting to index`);
      const workspaceParam = workspaceId ? `?workspace=${workspaceId}` : '';
      navigate(`/list-viewer${workspaceParam}`);
    }
  }, [isLoading, listViewers, listViewerId, currentListViewer, navigate, workspaceId]);

  // Set the current list viewer as selected when found
  useEffect(() => {
    if (currentListViewer && currentListViewer !== selectedListViewer) {
      setSelectedListViewer(currentListViewer);
    }
  }, [currentListViewer, selectedListViewer, setSelectedListViewer]);


  // Sync preview config with current list viewer when it changes (avoid redundant state updates)
  useEffect(() => {
    if (!currentListViewer) {
      setPreviewConfig(null);
      return;
    }
    setPreviewConfig(prev => {
      if (prev && prev.id === currentListViewer.id && prev.updatedAt === currentListViewer.updatedAt) {
        // No meaningful change; skip update to avoid render loops
        return prev;
      }
      return currentListViewer;
    });
  }, [currentListViewer]);

  // Create sample data in current workspace
  const createSampleData = () => {
    if (!currentWorkspace) {
      // If no workspace, create a sample workspace (fallback)
      try {
        const sampleData = saveSampleDataToLocalStorage();
        alert('Sample workspace created successfully!');
        navigate(`/list-viewer?workspace=${sampleData.workspace.id}`);
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
    <div className="flex h-screen bg-gray-100">
      {/* Workspace Panel - hidden on detail view */}
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button Only */}
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                const targetWorkspaceId = (
                  selectedListViewer?.workspaceId ||
                  previewConfig?.workspaceId ||
                  currentWorkspace?.id ||
                  workspaceId ||
                  ''
                );
                const targetUrl = targetWorkspaceId
                  ? `/list-viewer?workspace=${targetWorkspaceId}`
                  : '/list-viewer';
                try {
                  if (targetWorkspaceId) {
                    localStorage.setItem('last-workspace-id', targetWorkspaceId);
                  }
                } catch {
                  /* silent */
                }
                navigate(targetUrl, { state: { fromListViewerDetail: true, workspaceId: targetWorkspaceId } });
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title="Back to List Viewers"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentListViewer?.name || 'FHIR List Viewer'}
              </h1>
              {currentListViewer && (
                <p className="text-sm text-gray-600">
                  {currentListViewer.resourceType} • {currentListViewer.columns?.length || 0} columns
                  {currentWorkspace && (
                    <span className="ml-2">
                      {currentWorkspace.icon} {currentWorkspace.name}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {/* Hide main navigation buttons on detail List Viewer page */}
            <TopNavigation currentWorkspace={currentWorkspace} hideNav />
          </div>
        </div>
        
  <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{renderMainContent()}</div>
        </div>
      </div>
    </div>
  );

  function renderMainContent() {
    if (!currentListViewer) {
      // List viewer not found or loading
      return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            List Viewer Not Found
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The requested list viewer could not be found. It may have been deleted or you may not have access to it.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                const workspaceParam = workspaceId ? `?workspace=${workspaceId}` : '';
                navigate(`/list-viewer${workspaceParam}`);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Back to List Viewers
            </button>
            <button
              onClick={createSampleData}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium ml-3"
            >
              Create Sample Data
            </button>
          </div>
        </div>
      );
    }

    // Main layout with configuration and preview
    if (!currentListViewer || !previewConfig) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          Loading list viewer configuration...
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8">
        {/* Configuration at top */}
        <div className="flex-shrink-0">
          <ConfigurationPanel
            config={previewConfig}
            onConfigChange={async (updatedConfig) => {
              if (!previewConfig) return;
              const updated = { ...previewConfig, ...updatedConfig } as ListViewerConfig;
              const success = await saveListViewer(updated);
              if (success) {
                setPreviewConfig(updated);
              } else {
                console.error('Failed to save configuration');
              }
            }}
            currentWorkspace={currentWorkspace!}
            templates={templates}
          />
        </div>
        {/* Preview & Test below - expands naturally, main page scrolls */}
        <div className="flex-1">
          <PreviewPanel
            config={previewConfig}
            currentWorkspace={currentWorkspace!}
            templates={templates}
          />
        </div>
      </div>
    );
  }
};

export default FHIRListViewer;