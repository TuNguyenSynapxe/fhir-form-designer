// Configuration Index - Landing page for configuration section
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { Workspace, Template, ListViewerConfig } from '../shared/types';
import WorkspaceManager from '../components/WorkspaceManager';
import TopNavigation from '../components/TopNavigation';
import Breadcrumb from '../components/Breadcrumb';

const ConfigurationIndex: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
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
    window.history.replaceState({}, '', `/config?${newSearchParams.toString()}`);
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
    // Delete all templates and list viewers in this workspace
    const storedTemplates = localStorage.getItem('fhir-templates');
    if (storedTemplates) {
      const parsed = JSON.parse(storedTemplates);
      const allTemplates = parsed.templates || [];
      const remainingTemplates = allTemplates.filter(
        (t: Template) => t.workspaceId !== workspaceId
      );
      localStorage.setItem('fhir-templates', JSON.stringify({ templates: remainingTemplates }));
    }

    const storedListViewers = localStorage.getItem('fhir-list-viewers');
    if (storedListViewers) {
      const parsed = JSON.parse(storedListViewers);
      const allListViewers = parsed.listViewers || [];
      const remainingListViewers = allListViewers.filter(
        (lv: ListViewerConfig) => lv.workspaceId !== workspaceId
      );
      localStorage.setItem('fhir-list-viewers', JSON.stringify({ listViewers: remainingListViewers }));
    }

    // If we're deleting the current workspace, reload data
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(null);
      setTemplates([]);
      setListViewers([]);
    }
  };

  // Handle Test Widgets navigation with workspace base64 data
  const handleTestWidgets = () => {
    if (!currentWorkspace) {
      // If no workspace, navigate without data
      navigate('/widget-test');
      return;
    }

    // Get all templates for current workspace
    const stored = localStorage.getItem('fhir-templates');
    let templates: any[] = [];
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        templates = (parsed.templates || []).filter((template: any) => 
          template.workspaceId === currentWorkspace.id
        );
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    }

    // Create export data (same structure as workspace export)
    const exportData = {
      workspace: {
        id: currentWorkspace.id,
        name: currentWorkspace.name,
        description: currentWorkspace.description,
        icon: currentWorkspace.icon,
        color: currentWorkspace.color
      },
      templates: templates,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    // Convert to base64
    try {
      const jsonString = JSON.stringify(exportData);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
      
      // Navigate to widget-test page with base64 data as URL parameter
      navigate(`/widget-test?workspace=${encodeURIComponent(base64Data)}`);
    } catch (error) {
      console.error('Failed to export workspace for widget test:', error);
      // Fallback to navigate without data
      navigate('/widget-test');
    }
  };

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

        if (targetWorkspace) {
          // Load templates for this workspace
          const storedTemplates = localStorage.getItem('fhir-templates');
          if (storedTemplates) {
            const templateData = JSON.parse(storedTemplates);
            const workspaceTemplates = (templateData.templates || []).filter(
              (t: Template) => t.workspaceId === targetWorkspace.id
            );
            setTemplates(workspaceTemplates);
          }

          // Load list viewers for this workspace
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
      console.error('Failed to load configuration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Configuration</h1>
            {currentWorkspace && (
              <p className="text-sm text-gray-600">
                {currentWorkspace.icon} {currentWorkspace.name} • Manage templates and list viewers
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
                <p className="text-gray-600">Please select a workspace to manage its configuration.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Configuration Overview</h2>
                  <p className="text-gray-600">
                    Manage your FHIR templates and list viewers. Templates define form structures, 
                    while list viewers configure how data is displayed and accessed.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Templates Section */}
                  <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">📋 Templates</h3>
                            <p className="text-sm text-gray-600">Define form structures and layouts</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{templates.length} templates configured</span>
                          {templates.length > 0 && (
                            <span>Last updated {templates[0]?.updatedAt ? new Date(templates[0].updatedAt).toLocaleDateString() : 'Unknown'}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          to={`/config/templates?workspace=${currentWorkspace.id}`}
                          className="block w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-center font-medium"
                        >
                          Manage Templates
                        </Link>
                        
                        {templates.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 font-medium">Recent templates:</p>
                            {templates.slice(0, 3).map((template) => (
                              <Link
                                key={template.id}
                                to={`/config/templates/${template.id}?workspace=${currentWorkspace.id}`}
                                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{template.name}</span>
                                  <span className="text-gray-500">{template.resourceType}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* List Viewers Section */}
                  <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">📊 List Viewers</h3>
                            <p className="text-sm text-gray-600">Configure data sources and display</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{listViewers.length} list viewers configured</span>
                          {listViewers.length > 0 && (
                            <span>Last updated {listViewers[0]?.updatedAt ? new Date(listViewers[0].updatedAt).toLocaleDateString() : 'Unknown'}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          to={`/config/list-viewers?workspace=${currentWorkspace.id}`}
                          className="block w-full px-4 py-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-center font-medium"
                        >
                          Manage List Viewers
                        </Link>
                        
                        {listViewers.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 font-medium">Recent list viewers:</p>
                            {listViewers.slice(0, 3).map((listViewer) => (
                              <Link
                                key={listViewer.id}
                                to={`/config/list-viewers/${listViewer.id}?workspace=${currentWorkspace.id}`}
                                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{listViewer.name}</span>
                                  <span className="text-gray-500">{listViewer.resourceType}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      to={`/?workspace=${currentWorkspace.id}`}
                      className="flex items-center space-x-3 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">📊</span>
                      <div>
                        <div className="font-medium text-gray-900">View Data</div>
                        <div className="text-sm text-gray-500">Go to Data Explorer</div>
                      </div>
                    </Link>

                    <button
                      onClick={handleTestWidgets}
                      className="flex items-center space-x-3 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">🧪</span>
                      <div>
                        <div className="font-medium text-gray-900">Test Widgets</div>
                        <div className="text-sm text-gray-500">Widget testing utility</div>
                      </div>
                    </button>


                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationIndex;