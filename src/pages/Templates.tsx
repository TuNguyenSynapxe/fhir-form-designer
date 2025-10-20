import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Template, FhirResourceType, Workspace } from '../shared/types';
import { getDefaultFieldsForResourceType } from '../shared/defaultFields';
import { getSampleDataByResourceType } from '../shared/sampleData';
import WorkspaceManager from '../components/WorkspaceManager';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<FhirResourceType>('Patient');
  const [filterResourceType, setFilterResourceType] = useState<FhirResourceType | 'All'>('All');
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [showWorkspacePanel, setShowWorkspacePanel] = useState(true);

  const getResourceTypeIcon = (resourceType: FhirResourceType) => {
    switch (resourceType) {
      case 'Patient': return '👤';
      case 'HumanName': return '📝';
      case 'ContactPoint': return '📞';
      case 'Address': return '🏠';
      default: return '📋';
    }
  };

  const getResourceTypeColor = (resourceType: FhirResourceType) => {
    switch (resourceType) {
      case 'Patient': return 'bg-blue-100 text-blue-800';
      case 'HumanName': return 'bg-green-100 text-green-800';
      case 'ContactPoint': return 'bg-purple-100 text-purple-800';
      case 'Address': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [currentWorkspace]);

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

  const loadTemplates = () => {
    const stored = localStorage.getItem('fhir-templates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const allTemplates = parsed.templates || [];
        
        // Migrate old templates to default workspace if they don't have workspaceId
        const migratedTemplates = allTemplates.map((template: Template) => ({
          ...template,
          workspaceId: template.workspaceId || 'default-workspace'
        }));
        
        // Filter templates by current workspace
        if (currentWorkspace) {
          const workspaceTemplates = migratedTemplates.filter(
            (template: Template) => template.workspaceId === currentWorkspace.id
          );
          setTemplates(workspaceTemplates);
        } else {
          setTemplates(migratedTemplates);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplates([]);
      }
    }
  };

  // Workspace management functions
  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  const handleWorkspaceCreate = (_workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Workspace creation is handled in WorkspaceManager
    loadTemplates();
  };

  const handleWorkspaceUpdate = (workspace: Workspace) => {
    if (currentWorkspace?.id === workspace.id) {
      setCurrentWorkspace(workspace);
    }
  };

  const handleWorkspaceDelete = (workspaceId: string) => {
    // Delete all templates in this workspace
    const stored = localStorage.getItem('fhir-templates');
    if (stored) {
      const parsed = JSON.parse(stored);
      const allTemplates = parsed.templates || [];
      const remainingTemplates = allTemplates.filter(
        (template: Template) => template.workspaceId !== workspaceId
      );
      localStorage.setItem('fhir-templates', JSON.stringify({ templates: remainingTemplates }));
      loadTemplates();
    }
  };

  const deleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem('fhir-templates', JSON.stringify({ templates: updatedTemplates }));
    }
  };

  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      workspaceId: currentWorkspace?.id || template.workspaceId, // Keep in current workspace
      sampleData: template.sampleData, // Include sample data in the copy
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('fhir-templates', JSON.stringify({ templates: updatedTemplates }));
  };

  const exportTemplate = (template: Template) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateTemplate = () => {
    // Navigate to create page with resource type and workspace parameters
    const params = new URLSearchParams({
      resourceType: selectedResourceType,
      workspaceId: currentWorkspace?.id || 'default-workspace'
    });
    navigate(`/create?${params.toString()}`);
    setShowCreateModal(false);
  };

  const generateSampleTemplates = () => {
    if (!window.confirm('This will create sample templates for Patient, HumanName, ContactPoint, and Address resources. Continue?')) {
      return;
    }

    const resourceTypes: FhirResourceType[] = ['Patient', 'HumanName', 'ContactPoint', 'Address'];
    const newTemplates: Template[] = [];
    
    resourceTypes.forEach(resourceType => {
      // Skip if a sample template for this resource type already exists
      const existingSample = templates.find(t => 
        t.resourceType === resourceType && 
        t.name.toLowerCase().includes('sample')
      );
      
      if (existingSample) {
        return; // Skip this resource type
      }
      
      const defaultFields = getDefaultFieldsForResourceType(resourceType);
      const sampleData = getSampleDataByResourceType(resourceType);
      
      const template: Template = {
        id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${resourceType}`,
        name: `Sample ${resourceType} Template`,
        description: `Default template for ${resourceType} resource with common fields and sample data`,
        resourceType,
        workspaceId: currentWorkspace?.id || 'default-workspace',
        fields: defaultFields,
        sampleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      newTemplates.push(template);
    });
    
    if (newTemplates.length === 0) {
      alert('Sample templates for all resource types already exist!');
      return;
    }
    
    // Get all templates from localStorage to preserve other workspaces
    const stored = localStorage.getItem('fhir-templates');
    const allTemplates = stored ? JSON.parse(stored).templates || [] : [];
    
    // Add new templates to all templates
    const updatedAllTemplates = [...allTemplates, ...newTemplates];
    localStorage.setItem('fhir-templates', JSON.stringify({ templates: updatedAllTemplates }));
    
    // Reload templates to refresh the view
    loadTemplates();
    
    // Show success message
    const resourceNames = newTemplates.map(t => t.resourceType).join(', ');
    alert(`Successfully generated ${newTemplates.length} sample templates for: ${resourceNames}`);
  };

  const importTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const template: Template = JSON.parse(e.target?.result as string);
            // Generate new ID and assign to current workspace
            template.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            template.workspaceId = currentWorkspace?.id || 'default-workspace';
            template.updatedAt = new Date().toISOString();
            
            // Get all templates from localStorage and add the new one
            const stored = localStorage.getItem('fhir-templates');
            const allTemplates = stored ? JSON.parse(stored).templates || [] : [];
            const updatedAllTemplates = [...allTemplates, template];
            
            localStorage.setItem('fhir-templates', JSON.stringify({ templates: updatedAllTemplates }));
            
            // Update local state with current workspace templates
            const updatedTemplates = [...templates, template];
            setTemplates(updatedTemplates);
          } catch (error) {
            alert('Failed to import template. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResourceType = filterResourceType === 'All' || template.resourceType === filterResourceType;
    
    return matchesSearch && matchesResourceType;
  });

  return (
    <div className="flex h-screen bg-gray-100">
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
              <h1 className="text-2xl font-bold text-gray-900">FHIR Templates</h1>
              {currentWorkspace && (
                <p className="text-sm text-gray-600">
                  {currentWorkspace.icon} {currentWorkspace.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={importTemplate}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Import Template
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Template
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="resourceTypeFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by type:
            </label>
            <select
              id="resourceTypeFilter"
              value={filterResourceType}
              onChange={(e) => setFilterResourceType(e.target.value as FhirResourceType | 'All')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="All">📋 All Types</option>
              <option value="Patient">👤 Patient</option>
              <option value="HumanName">📝 HumanName</option>
              <option value="ContactPoint">📞 ContactPoint</option>
              <option value="Address">🏠 Address</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Type Summary */}
      {templates.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Templates by Resource Type:</h4>
          <div className="flex flex-wrap gap-2">
            {(['Patient', 'HumanName', 'ContactPoint', 'Address'] as FhirResourceType[]).map(resourceType => {
              const count = templates.filter(t => t.resourceType === resourceType).length;
              return count > 0 ? (
                <button
                  key={resourceType}
                  onClick={() => setFilterResourceType(resourceType)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                    filterResourceType === resourceType 
                      ? getResourceTypeColor(resourceType) + ' border-current'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{getResourceTypeIcon(resourceType)}</span>
                  {resourceType} ({count})
                </button>
              ) : null;
            })}
            {templates.length > 0 && (
              <button
                onClick={() => setFilterResourceType('All')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                  filterResourceType === 'All' 
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                📋 All ({templates.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Results Summary */}
      {templates.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredTemplates.length} of {templates.length} templates
            {filterResourceType !== 'All' && (
              <span className={`ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getResourceTypeColor(filterResourceType as FhirResourceType)}`}>
                <span>{getResourceTypeIcon(filterResourceType as FhirResourceType)}</span>
                {filterResourceType}
              </span>
            )}
          </div>
          {(searchTerm || filterResourceType !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterResourceType('All');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {templates.length === 0 ? 'No templates' : 'No matching templates'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {templates.length === 0 
              ? 'Get started by creating your first FHIR template or generate sample templates.'
              : searchTerm || filterResourceType !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'No templates found.'
            }
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateSampleTemplates}
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Sample Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {template.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getResourceTypeColor(template.resourceType)}`}>
                    <span>{getResourceTypeIcon(template.resourceType)}</span>
                    {template.resourceType}
                  </span>
                </div>
                
                {template.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-3">
                    <span>{template.fields.length} fields</span>
                    {template.sampleData && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Sample Data
                      </span>
                    )}
                  </div>
                  <span>v{template.version}</span>
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  <div>Created: {new Date(template.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/create?template=${template.id}`}
                    className="flex-1 bg-blue-600 text-white text-center px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/preview?template=${template.id}`}
                    className="flex-1 bg-green-600 text-white text-center px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Preview
                  </Link>
                  <button
                    onClick={() => duplicateTemplate(template)}
                    className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                    title="Duplicate"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => exportTemplate(template)}
                    className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
                    title="Export"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Template</h2>
            <p className="text-gray-600 mb-4">Select the FHIR resource type for your new template:</p>
            
            <div className="space-y-3 mb-6">
              {(['Patient', 'HumanName', 'ContactPoint', 'Address'] as FhirResourceType[]).map((type) => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="resourceType"
                    value={type}
                    checked={selectedResourceType === type}
                    onChange={(e) => setSelectedResourceType(e.target.value as FhirResourceType)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type}</div>
                    <div className="text-sm text-gray-500">
                      {type === 'Patient' && 'Complete patient information including demographics, contact details, and addresses'}
                      {type === 'HumanName' && 'Person name components (given names, family name, prefixes, suffixes)'}
                      {type === 'ContactPoint' && 'Contact information like phone, email, fax'}
                      {type === 'Address' && 'Physical or postal addresses with street, city, state, country'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Template
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

export default Templates;