// Template Editor - Individual template editing interface
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import type { Workspace, Template } from '../shared/types';
import WorkspaceManager from '../components/WorkspaceManager';
import TopNavigation from '../components/TopNavigation';

const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get workspace ID from URL
  const workspaceId = searchParams.get('workspace');

  // Workspace management handlers
  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    // Update URL to reflect selected workspace
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('workspace', workspace.id);
    navigate(`/config/templates/${templateId}?${newSearchParams.toString()}`);
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
      navigate('/config');
    }
  };

  useEffect(() => {
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

          if (targetWorkspace && templateId) {
            // Load specific template
            const storedTemplates = localStorage.getItem('fhir-templates');
            if (storedTemplates) {
              const templateData = JSON.parse(storedTemplates);
              const targetTemplate = (templateData.templates || []).find(
                (t: Template) => t.id === templateId && t.workspaceId === targetWorkspace.id
              );
              
              if (targetTemplate) {
                setTemplate(targetTemplate);
              } else {
                setError('Template not found');
              }
            } else {
              setError('No templates found');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load template data:', error);
        setError('Failed to load template data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [templateId, workspaceId]);

  const handleSave = async () => {
    if (!template || !currentWorkspace) return;

    setIsSaving(true);
    try {
      // Update template in localStorage
      const storedTemplates = localStorage.getItem('fhir-templates');
      const templateData = storedTemplates ? JSON.parse(storedTemplates) : { templates: [] };
      
      const templateIndex = templateData.templates.findIndex(
        (t: Template) => t.id === template.id && t.workspaceId === currentWorkspace.id
      );
      
      const updatedTemplate = {
        ...template,
        updatedAt: new Date().toISOString()
      };

      if (templateIndex >= 0) {
        templateData.templates[templateIndex] = updatedTemplate;
      } else {
        templateData.templates.push(updatedTemplate);
      }

      localStorage.setItem('fhir-templates', JSON.stringify(templateData));
      setTemplate(updatedTemplate);
      
      // Show success message (could be replaced with toast notification)
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (workspaceId) {
      navigate(`/config/templates?workspace=${workspaceId}`);
    } else {
      navigate('/config/templates');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Templates
          </button>
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
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title="Back to Templates"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 Template Editor</h1>
              {template && currentWorkspace && (
                <p className="text-sm text-gray-600">
                  {currentWorkspace.icon} {currentWorkspace.name} • {template.name} ({template.resourceType})
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !template}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
            <TopNavigation currentWorkspace={currentWorkspace} />
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {!template ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Template Not Found</h2>
                <p className="text-gray-600 mb-4">The requested template could not be loaded.</p>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Templates
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Template Info */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Template Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter template name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resource Type
                      </label>
                      <select
                        value={template.resourceType}
                        onChange={(e) => setTemplate({ ...template, resourceType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Patient">Patient</option>
                        <option value="Observation">Observation</option>
                        <option value="Condition">Condition</option>
                        <option value="Procedure">Procedure</option>
                        <option value="MedicationRequest">MedicationRequest</option>
                        <option value="DiagnosticReport">DiagnosticReport</option>
                        <option value="Encounter">Encounter</option>
                        <option value="AllergyIntolerance">AllergyIntolerance</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={template.description || ''}
                        onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter template description"
                      />
                    </div>
                  </div>
                </div>

                {/* Template Structure */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Template Structure</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center text-gray-500 py-12">
                      <div className="text-4xl mb-4">🚧</div>
                      <h3 className="text-lg font-medium mb-2">Template Editor Coming Soon</h3>
                      <p className="text-sm">
                        Visual template editing interface will be implemented here. 
                        For now, you can modify basic template information above.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Template JSON Preview */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">JSON Preview</h2>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400">
                      {JSON.stringify(template, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Template ID:</span> {template.id}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>{' '}
                      {template.updatedAt ? new Date(template.updatedAt).toLocaleString() : 'Never'}
                    </div>
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

export default TemplateEditor;