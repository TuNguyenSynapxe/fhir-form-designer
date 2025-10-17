import React, { useState, useEffect } from 'react';
import type { Template, FhirResourceType } from '../shared/types';

interface TemplateSelector {
  selectedTemplateId: string;
  resourceType: FhirResourceType;
  onTemplateSelect: (templateId: string, template: Template | null) => void;
}

const TemplateSelector: React.FC<TemplateSelector> = ({
  selectedTemplateId,
  resourceType,
  onTemplateSelect
}) => {
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplatesForResourceType();
  }, [resourceType]);

  const loadTemplatesForResourceType = () => {
    setLoading(true);
    const stored = localStorage.getItem('fhir-templates');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const templates = (parsed.templates || []) as Template[];
        
        // Filter templates by resource type
        const filteredTemplates = templates.filter(
          template => template.resourceType === resourceType
        );
        
        setAvailableTemplates(filteredTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setAvailableTemplates([]);
      }
    } else {
      setAvailableTemplates([]);
    }
    
    setLoading(false);
  };

  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = availableTemplates.find(t => t.id === templateId) || null;
    onTemplateSelect(templateId, selectedTemplate);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 py-2">
        Loading templates...
      </div>
    );
  }

  if (availableTemplates.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2">
        <p>No {resourceType} templates available.</p>
        <p className="text-xs mt-1">
          Create a {resourceType} template first to use it as a nested widget.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select {resourceType} Template
      </label>
      <select
        value={selectedTemplateId}
        onChange={(e) => handleTemplateChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Choose a template...</option>
        {availableTemplates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
            {template.description && ` - ${template.description}`}
          </option>
        ))}
      </select>
      
      {selectedTemplateId && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <div className="font-medium text-gray-700">Template Preview:</div>
          {(() => {
            const template = availableTemplates.find(t => t.id === selectedTemplateId);
            return template ? (
              <div className="mt-1 space-y-1">
                <div>Fields: {template.fields.length}</div>
                <div>Version: {template.version}</div>
                <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;