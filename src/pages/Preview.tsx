import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Template, FhirResource } from '../shared/types';
import { getSampleDataByResourceType } from '../shared/sampleData';
import { ThemeProvider, ThemeSelector } from '../components/ThemeProvider';
import LivePreview from '../components/LivePreview';

const Preview: React.FC = () => {
  return (
    <ThemeProvider>
      <PreviewContent />
    </ThemeProvider>
  );
};

const PreviewContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  // State for template management
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateError, setTemplateError] = useState<string>('');
  const [templatesOfSameType, setTemplatesOfSameType] = useState<Template[]>([]);
  const [sampleData, setSampleData] = useState<FhirResource | null>(null);
  
  // State for JSON editing
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    } else {
      setTemplateError('No template ID provided');
    }
  }, [templateId]);

  useEffect(() => {
    if (template) {
      const data = getSampleDataByResourceType(template.resourceType);
      setSampleData(data);
      setJsonInput(JSON.stringify(data, null, 2));
    }
  }, [template]);

  const loadTemplate = (id: string) => {
    const stored = localStorage.getItem('fhir-templates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const allTemplates = parsed.templates || [];
        const foundTemplate = allTemplates.find((t: Template) => t.id === id);
        
        if (foundTemplate) {
          setTemplate(foundTemplate);
          
          // Load all templates of the same resource type and workspace
          const sameTypeTemplates = allTemplates.filter((t: Template) => 
            t.resourceType === foundTemplate.resourceType && 
            t.workspaceId === foundTemplate.workspaceId
          );
          setTemplatesOfSameType(sameTypeTemplates);
        } else {
          setTemplateError('Template not found');
        }
      } catch (error) {
        setTemplateError('Error loading template');
      }
    } else {
      setTemplateError('No templates found');
    }
  };

  const handleTemplateSwitch = (newTemplateId: string) => {
    const newUrl = `/preview?template=${newTemplateId}`;
    navigate(newUrl);
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    
    if (!value.trim()) {
      setJsonError('');
      setSampleData(null);
      return;
    }
    
    try {
      const parsed = JSON.parse(value);
      setSampleData(parsed);
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (error) {
      setJsonError('Cannot format invalid JSON');
    }
  };

  const clearJson = () => {
    if (template) {
      const defaultData = getSampleDataByResourceType(template.resourceType);
      setSampleData(defaultData);
      setJsonInput(JSON.stringify(defaultData, null, 2));
      setJsonError('');
    }
  };

  if (templateError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{templateError}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading template...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
            >
              ← Back to Templates
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Preview Template</h1>
          </div>
          <ThemeSelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Template Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Template Preview</h2>
                
                {/* Template Selector */}
                {templatesOfSameType.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Switch template:</label>
                    <select
                      value={template.id}
                      onChange={(e) => handleTemplateSwitch(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {templatesOfSameType.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {!template.fields || template.fields.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No fields</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This template doesn't have any fields yet.
                  </p>
                </div>
              ) : (
                <div className="themed-live-preview-wrapper">
                  <LivePreview template={template} sampleData={sampleData!} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - JSON Data Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">FHIR Data</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={formatJson}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Format JSON
                  </button>
                  <button
                    onClick={clearJson}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Reset to Sample
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON Data Input
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={20}
                    className="w-full border border-gray-300 rounded-md p-3 font-mono text-sm"
                    placeholder="Enter FHIR JSON data..."
                  />
                  {jsonError && (
                    <p className="mt-2 text-sm text-red-600">{jsonError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;