import React, { useState, useEffect } from 'react';
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
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

  const predefinedIcons = ['📋', '🩺', '📄', '🗂️', '📊', '⚕️', '🏥', '📝', '🔬', '💊'];
  const predefinedColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'];

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
      )}

      {/* Workspace List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                currentWorkspace?.id === workspace.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => onWorkspaceSelect(workspace)}
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
          ))}
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

export default WorkspaceManager;