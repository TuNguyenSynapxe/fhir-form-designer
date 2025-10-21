import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Workspace } from '../shared/types';

interface WorkspaceManagerProps {
  currentWorkspace: Workspace | null;
  onWorkspaceSelect: (workspace: Workspace) => void;
  onWorkspaceCreate: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onWorkspaceUpdate: (workspace: Workspace) => void;
  onWorkspaceDelete: (workspaceId: string) => void;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  currentWorkspace,
  onWorkspaceSelect,
  onWorkspaceCreate,
  onWorkspaceUpdate,
  onWorkspaceDelete,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<{
    workspace: Workspace;
    base64Data: string;
    isOpen: boolean;
  } | null>(null);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📋'
  });

  // Load workspaces from localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('fhir-workspaces');
    if (savedWorkspaces) {
      const parsed = JSON.parse(savedWorkspaces);
      setWorkspaces(parsed);
      
      // Set default workspace if none selected
      if (!currentWorkspace && parsed.length > 0) {
        const defaultWorkspace = parsed.find((w: Workspace) => w.isDefault) || parsed[0];
        onWorkspaceSelect(defaultWorkspace);
      }
    } else {
      // Create default workspace if none exists
      const defaultWorkspace: Workspace = {
        id: 'default-workspace',
        name: 'My Templates',
        description: 'Default workspace for FHIR templates',
        color: '#3b82f6',
        icon: '📋',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setWorkspaces([defaultWorkspace]);
      onWorkspaceSelect(defaultWorkspace);
      localStorage.setItem('fhir-workspaces', JSON.stringify([defaultWorkspace]));
    }
  }, [currentWorkspace, onWorkspaceSelect]);

  // Auto-expand current workspace
  useEffect(() => {
    if (currentWorkspace) {
      setExpandedWorkspaces(prev => {
        const newSet = new Set(prev);
        newSet.add(currentWorkspace.id);
        return newSet;
      });
    }
  }, [currentWorkspace]);

  // Save workspaces to localStorage
  const saveWorkspaces = (updatedWorkspaces: Workspace[]) => {
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem('fhir-workspaces', JSON.stringify(updatedWorkspaces));
  };

  const handleCreateWorkspace = () => {
    if (!newWorkspace.name.trim()) return;

    const workspace: Workspace = {
      ...newWorkspace,
      id: `workspace-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedWorkspaces = [...workspaces, workspace];
    saveWorkspaces(updatedWorkspaces);
    onWorkspaceCreate(newWorkspace);
    onWorkspaceSelect(workspace);
    
    setNewWorkspace({ name: '', description: '', color: '#3b82f6', icon: '📋' });
    setShowCreateForm(false);
  };

  const handleUpdateWorkspace = (workspace: Workspace) => {
    const updatedWorkspaces = workspaces.map(w => 
      w.id === workspace.id ? { ...workspace, updatedAt: new Date().toISOString() } : w
    );
    saveWorkspaces(updatedWorkspaces);
    onWorkspaceUpdate(workspace);
    setShowEditForm(null);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    if (workspaces.length <= 1) {
      alert('Cannot delete the last workspace');
      return;
    }

    if (confirm('Are you sure you want to delete this workspace? All templates in it will be lost.')) {
      const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId);
      saveWorkspaces(updatedWorkspaces);
      onWorkspaceDelete(workspaceId);

      // Select another workspace if current one was deleted
      if (currentWorkspace?.id === workspaceId) {
        const newCurrent = updatedWorkspaces[0];
        onWorkspaceSelect(newCurrent);
      }
    }
  };

  const handleExportWorkspace = (workspace: Workspace) => {
    // Get all templates for this workspace
    const stored = localStorage.getItem('fhir-templates');
    let templates: any[] = [];
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        templates = (parsed.templates || []).filter((template: any) => 
          template.workspaceId === workspace.id
        );
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    }

    // Create export data
    const exportData = {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        icon: workspace.icon,
        color: workspace.color
      },
      templates: templates,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    // Convert to base64
    try {
      const jsonString = JSON.stringify(exportData);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
      
      setShowExportModal({
        workspace,
        base64Data,
        isOpen: true
      });
    } catch (error) {
      console.error('Failed to export workspace:', error);
      alert('Failed to export workspace. Please try again.');
    }
  };

  const predefinedIcons = ['📋', '🩺', '📄', '🗂️', '📊', '⚕️', '🏥', '📝', '🔬', '💊'];
  const predefinedColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'];

  // Toggle workspace expansion
  const toggleWorkspaceExpansion = (workspaceId: string) => {
    setExpandedWorkspaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white border-r border-gray-200 w-80 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Workspaces</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
            title="Create New Workspace"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Current Workspace Info */}
      {currentWorkspace && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: currentWorkspace.color }}
            >
              <span className="text-lg">{currentWorkspace.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {currentWorkspace.name}
              </h3>
              {currentWorkspace.description && (
                <p className="text-xs text-gray-600 truncate">
                  {currentWorkspace.description}
                </p>
              )}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => handleExportWorkspace(currentWorkspace)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Export for Widget"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={() => setShowEditForm(currentWorkspace.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Edit Workspace"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {workspaces.map((workspace) => {
            const isExpanded = expandedWorkspaces.has(workspace.id);
            const isCurrent = currentWorkspace?.id === workspace.id;
            
            return (
              <div key={workspace.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Workspace Header */}
                <div
                  className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWorkspaceExpansion(workspace.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div
                    onClick={() => {
                      onWorkspaceSelect(workspace);
                      // Ensure this workspace is expanded when selecting it
                      setExpandedWorkspaces(prev => {
                        const newSet = new Set(prev);
                        newSet.add(workspace.id);
                        return newSet;
                      });
                    }}
                    className="flex items-center space-x-3 flex-1"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: workspace.color }}
                    >
                      <span className="text-sm">{workspace.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{workspace.name}</div>
                      {workspace.description && (
                        <div className="text-xs opacity-75 truncate">{workspace.description}</div>
                      )}
                    </div>
                    {workspace.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation Menu for Workspace */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    <nav className="py-2 px-3 space-y-1">
                      {/* Data Explorer */}
                      <Link
                        to={`/?workspace=${workspace.id}`}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        onClick={() => {
                          onWorkspaceSelect(workspace);
                          // Ensure this workspace is expanded when navigating to its content
                          setExpandedWorkspaces(prev => {
                            const newSet = new Set(prev);
                            newSet.add(workspace.id);
                            return newSet;
                          });
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        📊 Data Explorer
                      </Link>

                      {/* Configuration */}
                      <Link
                        to={`/config?workspace=${workspace.id}`}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        onClick={() => {
                          onWorkspaceSelect(workspace);
                          // Ensure this workspace is expanded when navigating to its content
                          setExpandedWorkspaces(prev => {
                            const newSet = new Set(prev);
                            newSet.add(workspace.id);
                            return newSet;
                          });
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        ⚙️ Configuration
                      </Link>
                      
                      {/* Templates */}
                      <Link
                        to={`/config/templates?workspace=${workspace.id}`}
                        className="flex items-center space-x-2 px-6 py-1.5 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors ml-3"
                        onClick={() => {
                          onWorkspaceSelect(workspace);
                          // Ensure this workspace is expanded when navigating to its content
                          setExpandedWorkspaces(prev => {
                            const newSet = new Set(prev);
                            newSet.add(workspace.id);
                            return newSet;
                          });
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        📋 Templates
                      </Link>
                      
                      {/* List Viewers */}
                      <Link
                        to={`/config/list-viewers?workspace=${workspace.id}`}
                        className="flex items-center space-x-2 px-6 py-1.5 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors ml-3"
                        onClick={() => {
                          onWorkspaceSelect(workspace);
                          // Ensure this workspace is expanded when navigating to its content
                          setExpandedWorkspaces(prev => {
                            const newSet = new Set(prev);
                            newSet.add(workspace.id);
                            return newSet;
                          });
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        📊 List Viewers
                      </Link>
                    </nav>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Workspace</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Patient Forms, Clinical Templates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description for this workspace"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {predefinedIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewWorkspace({ ...newWorkspace, icon })}
                      className={`p-2 text-lg rounded-md border-2 transition-colors ${
                        newWorkspace.icon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewWorkspace({ ...newWorkspace, color })}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${
                        newWorkspace.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspace.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workspace Modal */}
      {showEditForm && (
        <EditWorkspaceModal
          workspace={workspaces.find(w => w.id === showEditForm)!}
          onUpdate={handleUpdateWorkspace}
          onDelete={handleDeleteWorkspace}
          onClose={() => setShowEditForm(null)}
          predefinedIcons={predefinedIcons}
          predefinedColors={predefinedColors}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          workspace={showExportModal.workspace}
          base64Data={showExportModal.base64Data}
          onClose={() => setShowExportModal(null)}
        />
      )}
    </div>
  );
};

// Edit Workspace Modal Component
interface EditWorkspaceModalProps {
  workspace: Workspace;
  onUpdate: (workspace: Workspace) => void;
  onDelete: (workspaceId: string) => void;
  onClose: () => void;
  predefinedIcons: string[];
  predefinedColors: string[];
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({
  workspace,
  onUpdate,
  onDelete,
  onClose,
  predefinedIcons,
  predefinedColors,
}) => {
  const [editedWorkspace, setEditedWorkspace] = useState({ ...workspace });

  const handleSave = () => {
    if (!editedWorkspace.name.trim()) return;
    onUpdate(editedWorkspace);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Workspace</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workspace Name *
            </label>
            <input
              type="text"
              value={editedWorkspace.name}
              onChange={(e) => setEditedWorkspace({ ...editedWorkspace, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editedWorkspace.description || ''}
              onChange={(e) => setEditedWorkspace({ ...editedWorkspace, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {predefinedIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setEditedWorkspace({ ...editedWorkspace, icon })}
                  className={`p-2 text-lg rounded-md border-2 transition-colors ${
                    editedWorkspace.icon === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setEditedWorkspace({ ...editedWorkspace, color })}
                  className={`w-8 h-8 rounded-md border-2 transition-all ${
                    editedWorkspace.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => onDelete(workspace.id)}
            disabled={workspace.isDefault}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title={workspace.isDefault ? "Cannot delete default workspace" : "Delete workspace"}
          >
            Delete
          </button>
          
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editedWorkspace.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export Modal Component
interface ExportModalProps {
  workspace: Workspace;
  base64Data: string;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ workspace, base64Data, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const generateExampleCode = (base64Data: string) => {
    return `// React Component Example
import { FhirDisplayWidget } from '@your-org/fhir-display-widget';

<FhirDisplayWidget
  templatesData="${base64Data}"
  mainTemplateId="your-template-id"
  fhirData={yourFhirData}
  theme="light"
/>

// HTML/JavaScript Example
<script src="https://cdn.yoursite.com/fhir-display-widget.js"></script>
<fhir-display-widget
  templates-data="${base64Data}"
  main-template-id="your-template-id"
  fhir-data='{"resourceType": "Patient", ...}'>
</fhir-display-widget>`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Export Workspace for Widget
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: workspace.color }}
              >
                <span className="text-lg">{workspace.icon}</span>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">{workspace.name}</h4>
                <p className="text-sm text-gray-600">{workspace.description}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              This workspace has been exported as a base64 string that contains all templates and configuration. 
              Use this string with the FhirDisplayWidget component to embed your forms in external websites.
            </p>
          </div>

          <div className="space-y-6">
            {/* Base64 Data Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Data (Base64)
              </label>
              <div className="relative">
                <textarea
                  value={base64Data}
                  readOnly
                  className="w-full h-32 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono resize-none"
                  placeholder="Base64 workspace data will appear here..."
                />
                <button
                  onClick={() => copyToClipboard(base64Data)}
                  className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Usage Examples */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Examples
              </label>
              <div className="relative">
                <pre className="w-full h-64 p-3 border border-gray-300 rounded-md bg-gray-50 text-xs overflow-auto">
{generateExampleCode(base64Data)}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateExampleCode(base64Data))}
                  className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Copy Code
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Integration Steps:</h5>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Copy the base64 workspace data above</li>
                <li>2. Install the FhirDisplayWidget library in your project</li>
                <li>3. Use the templatesData prop with the copied base64 string</li>
                <li>4. Specify the mainTemplateId for the template you want to display</li>
                <li>5. Provide your FHIR data to the fhirData prop</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManager;