// Explorer List View - Read-only data viewer for individual list viewers
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { ListViewerConfig, Workspace } from '../shared/types';
import PreviewPanel from '../components/PreviewPanel';
import WorkspaceManager from '../components/WorkspaceManager';
import TopNavigation from '../components/TopNavigation';

const ExplorerListView: React.FC = () => {
  const { listViewerId } = useParams<{ listViewerId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [listViewer, setListViewer] = useState<ListViewerConfig | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get workspace ID from URL
  const workspaceId = searchParams.get('workspace');

  // Workspace management handlers
  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    // Update URL to reflect selected workspace
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('workspace', workspace.id);
    navigate(`/explorer/${listViewerId}?${newSearchParams.toString()}`);
  };

  const handleWorkspaceCreate = (_workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Workspace creation is handled in WorkspaceManager
  };

  const handleWorkspaceUpdate = (workspace: Workspace) => {
    if (currentWorkspace?.id === workspace.id) {
      setCurrentWorkspace(workspace);
    }
  };

  const handleWorkspaceDelete = (workspaceId: string) => {
    // If we're deleting the current workspace, navigate back
    if (currentWorkspace?.id === workspaceId) {
      navigate('/');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load workspace
        const storedWorkspaces = localStorage.getItem('fhir-workspaces');
        if (storedWorkspaces) {
          const workspaces = JSON.parse(storedWorkspaces);
          const targetWorkspace = workspaces.find((w: Workspace) => w.id === workspaceId);
          if (!targetWorkspace && workspaceId) {
            setError('Workspace not found');
            return;
          }
          setCurrentWorkspace(targetWorkspace || workspaces[0] || null);

          // Load list viewer
          const storedListViewers = localStorage.getItem('fhir-list-viewers');
          if (storedListViewers) {
            const parsed = JSON.parse(storedListViewers);
            const foundListViewer = parsed.listViewers?.find((lv: ListViewerConfig) => lv.id === listViewerId);
            if (!foundListViewer) {
              setError('List viewer not found');
              return;
            }
            setListViewer(foundListViewer);

            // Load templates for this workspace
            const storedTemplates = localStorage.getItem('fhir-templates');
            if (storedTemplates) {
              const templateData = JSON.parse(storedTemplates);
              const workspaceTemplates = (templateData.templates || []).filter(
                (t: any) => t.workspaceId === (targetWorkspace?.id || workspaceId)
              );
              setTemplates(workspaceTemplates);
            }
          }
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading explorer data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (listViewerId) {
      loadData();
    } else {
      setError('No list viewer ID provided');
      setIsLoading(false);
    }
  }, [listViewerId, workspaceId]);

  // Redirect if list viewer not found
  useEffect(() => {
    if (!isLoading && error) {
      const timer = setTimeout(() => {
        const targetUrl = currentWorkspace 
          ? `/?workspace=${currentWorkspace.id}`
          : '/';
        navigate(targetUrl);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, navigate, currentWorkspace]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading list viewer...</p>
        </div>
      </div>
    );
  }

  if (error || !listViewer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Redirecting to Data Explorer in 3 seconds...</p>
          <Link
            to={currentWorkspace ? `/?workspace=${currentWorkspace.id}` : '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Data Explorer
          </Link>
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
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <Link
              to={currentWorkspace ? `/?workspace=${currentWorkspace.id}` : '/'}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title="Back to Data Explorer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 {listViewer.name}
              </h1>
              <p className="text-sm text-gray-600">
                {listViewer.resourceType} • {listViewer.columns?.length || 0} columns
                {currentWorkspace && (
                  <span className="ml-2">
                    {currentWorkspace.icon} {currentWorkspace.name}
                  </span>
                )}
                <span className="ml-2 text-blue-600">
                  (Read-only view)
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/config/list-viewers/${listViewer.id}?workspace=${currentWorkspace?.id || 'default'}`}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              ⚙️ Configure
            </Link>
            <TopNavigation currentWorkspace={currentWorkspace} showTools={false} />
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Read-only Preview Panel */}
            <PreviewPanel
              config={listViewer}
              currentWorkspace={currentWorkspace!}
              templates={templates}
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorerListView;