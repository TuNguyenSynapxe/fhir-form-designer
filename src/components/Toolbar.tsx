import React from 'react';
import type { ToolbarProps } from '../shared/types';

const Toolbar: React.FC<ToolbarProps> = ({
  template,
  onSave,
  onExport,
  onImport,
  onPreview,
}) => {
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedTemplate = JSON.parse(e.target?.result as string);
            
            // Validate basic template structure
            if (!importedTemplate.id || !importedTemplate.name || !importedTemplate.resourceType || !importedTemplate.fields) {
              alert('Invalid template file. Please check the file format.');
              return;
            }
            
            // Generate new ID and update timestamps
            importedTemplate.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            importedTemplate.updatedAt = new Date().toISOString();
            
            onImport(importedTemplate);
            alert('Template imported successfully!');
          } catch (error) {
            alert('Failed to import template. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getValidationStatus = () => {
    const errors = [];
    
    if (!template.name.trim()) {
      errors.push('Template name is required');
    }
    
    if (template.fields.length === 0) {
      errors.push('At least one field is required');
    }
    
    // Check for duplicate field IDs
    const fieldIds = template.fields.map(f => f.id);
    const duplicateIds = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push('Duplicate field IDs found');
    }
    
    // Check for required fields without labels
    const fieldsWithoutLabels = template.fields.filter(f => !f.label.trim());
    if (fieldsWithoutLabels.length > 0) {
      errors.push('Some fields are missing labels');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validation = getValidationStatus();

  return (
    <div className="flex items-center space-x-3">
      {/* Validation Status */}
      <div className="flex items-center space-x-2">
        <div className={`flex items-center text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-1">
            {validation.isValid ? '✓' : '⚠'}
          </span>
          {validation.isValid ? 'Valid' : `${validation.errors.length} issues`}
        </div>
        
        {!validation.isValid && (
          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600">
              ℹ️
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 hidden group-hover:block">
              <h4 className="font-medium text-gray-900 mb-2">Validation Issues:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="text-sm text-gray-600 border-l border-gray-300 pl-3">
        <div>{template.fields.length} fields</div>
        <div className="text-xs">v{template.version}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 border-l border-gray-300 pl-3">
        <button
          onClick={handleImport}
          className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
        >
          Import
        </button>
        
        <button
          onClick={onExport}
          className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
        >
          Export
        </button>
        
        {onPreview && (
          <button
            onClick={onPreview}
            className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
          >
            Preview
          </button>
        )}
        
        <button
          onClick={onSave}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            validation.isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
          disabled={!validation.isValid}
        >
          Save Template
        </button>
      </div>
    </div>
  );
};

export default Toolbar;