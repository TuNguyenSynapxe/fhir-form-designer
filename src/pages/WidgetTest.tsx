import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FhirWidget from '../widget/FhirWidget';
import { getSampleDataByResourceType } from '../shared/sampleData';
import type { Template } from '../shared/types';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Widget Error</h3>
          <p className="text-red-600 text-sm mb-2">
            {this.state.error?.message || 'An error occurred while rendering the widget'}
          </p>
          <details className="text-xs text-red-500">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-2 overflow-auto">
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const WidgetTest: React.FC = () => {
  const navigate = useNavigate();

  // Sample workspace data
  const patientWorkspace = {
    id: "patient-ws",
    name: "Patient Workspace", 
    templates: [{
      id: "patient-basic",
      name: "Patient Basic Info",
      resourceType: "Patient",
      fields: [
        { id: "name", type: "text", label: "Full Name", fhirPath: "name[0].family + ', ' + name[0].given[0]", order: 1 },
        { id: "gender", type: "select", label: "Gender", fhirPath: "gender", order: 2, options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" }
        ]},
        { id: "birthDate", type: "date", label: "Birth Date", fhirPath: "birthDate", order: 3 },
        { id: "phone", type: "text", label: "Phone", fhirPath: "telecom.find(t => t.system === 'phone').value", order: 4 },
        { id: "email", type: "text", label: "Email", fhirPath: "telecom.find(t => t.system === 'email').value", order: 5 }
      ]
    }]
  };

  const [workspace, setWorkspace] = useState(() => btoa(JSON.stringify(patientWorkspace)));
  const [workspaceMode, setWorkspaceMode] = useState<'base64' | 'json'>('base64');
  const [templateName, setTemplateName] = useState("Patient Basic Info");
  const [jsonData, setJsonData] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState<'Patient' | 'HumanName' | 'ContactPoint' | 'Address'>('Patient');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [hasManuallySelectedTemplate, setHasManuallySelectedTemplate] = useState(false);

  const parsedWorkspace = useMemo(() => {
    try {
      if (workspaceMode === 'base64') {
        const decoded = atob(workspace);
        return JSON.parse(decoded);
      } else {
        return JSON.parse(workspace);
      }
    } catch {
      return null;
    }
  }, [workspace, workspaceMode]);

  const availableTemplates = useMemo(() => {
    return parsedWorkspace?.templates || [];
  }, [parsedWorkspace]);

  // Auto-select first template when workspace changes (only if user hasn't manually selected)
  useEffect(() => {
    const firstAvailableTemplate = availableTemplates[0]?.name;
    if (firstAvailableTemplate && !hasManuallySelectedTemplate && availableTemplates.length > 0) {
      setTemplateName(firstAvailableTemplate);
    }
  }, [availableTemplates, hasManuallySelectedTemplate]);

  // Load initial sample data
  useEffect(() => {
    if (!jsonData) {
      const sampleData = getSampleDataByResourceType(selectedResourceType);
      setJsonData(JSON.stringify(sampleData, null, 2));
    }
  }, [selectedResourceType, jsonData]);

  const parsedData = useMemo(() => {
    try {
      return jsonData ? JSON.parse(jsonData) : null;
    } catch {
      return null;
    }
  }, [jsonData]);

  const handleTemplateSelection = (templateName: string) => {
    setTemplateName(templateName);
    setHasManuallySelectedTemplate(true);
  };

  const loadSampleData = () => {
    const sampleData = getSampleDataByResourceType(selectedResourceType);
    setJsonData(JSON.stringify(sampleData, null, 2));
  };

  const loadSampleWorkspace = () => {
    const newWorkspace = workspaceMode === 'base64' 
      ? btoa(JSON.stringify(patientWorkspace))
      : JSON.stringify(patientWorkspace, null, 2);
    setWorkspace(newWorkspace);
    setHasManuallySelectedTemplate(false); // Reset manual selection when loading new workspace
  };

  const resetTest = () => {
    const newWorkspace = workspaceMode === 'base64' 
      ? btoa(JSON.stringify(patientWorkspace))
      : JSON.stringify(patientWorkspace, null, 2);
    setWorkspace(newWorkspace);
    setTemplateName("Patient Basic Info");
    setJsonData('');
    setHasManuallySelectedTemplate(false); // Reset manual selection when resetting test
  };

  const switchWorkspaceMode = (newMode: 'base64' | 'json') => {
    if (parsedWorkspace) {
      try {
        if (newMode === 'base64') {
          setWorkspace(btoa(JSON.stringify(parsedWorkspace)));
        } else {
          setWorkspace(JSON.stringify(parsedWorkspace, null, 2));
        }
        setWorkspaceMode(newMode);
        setHasManuallySelectedTemplate(false); // Reset manual selection when switching modes
      } catch (error) {
        console.error('Error switching workspace mode:', error);
      }
    } else {
      setWorkspaceMode(newMode);
    }
  };

  const getWorkspaceDisplayValue = () => {
    if (workspaceMode === 'base64') {
      return workspace;
    } else {
      return workspace;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                🧪 FHIR Widget Test Page
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className={`px-3 py-1 text-sm rounded ${
                  showDebugInfo 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                } hover:bg-blue-200`}
              >
                {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
              </button>
              <button
                onClick={resetTest}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Reset Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Configuration Panel */}
          <div className="space-y-6">
            
            {/* 1. Workspace Configuration - FIRST */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="text-blue-600 font-bold">1.</span> Workspace Configuration
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={loadSampleWorkspace}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Load Sample
                  </button>
                  <button
                    onClick={() => switchWorkspaceMode('json')}
                    className={`px-3 py-1 text-xs rounded ${
                      workspaceMode === 'json' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => switchWorkspaceMode('base64')}
                    className={`px-3 py-1 text-xs rounded ${
                      workspaceMode === 'base64' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Base64
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">
                  {workspaceMode === 'base64' ? 'Base64 Encoded Workspace' : 'JSON Workspace'}
                </label>
                <textarea
                  value={getWorkspaceDisplayValue()}
                  onChange={(e) => setWorkspace(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={workspaceMode === 'base64' ? 'Enter base64 encoded workspace...' : 'Enter workspace JSON...'}
                />
              </div>
              {!parsedWorkspace && workspace && (
                <p className="mt-2 text-sm text-red-600">
                  Invalid workspace {workspaceMode === 'base64' ? 'base64 encoding or' : ''} JSON
                </p>
              )}
              {parsedWorkspace && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ Valid workspace with {parsedWorkspace.templates?.length || 0} template(s)
                </div>
              )}
            </div>

            {/* 2. Template Selection - SECOND */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <span className="text-blue-600 font-bold">2.</span> Template Selection
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <select
                  value={templateName}
                  onChange={(e) => handleTemplateSelection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={availableTemplates.length === 0}
                >
                  {availableTemplates.length === 0 ? (
                    <option value="">No templates available</option>
                  ) : (
                    availableTemplates.map((template: Template) => (
                      <option key={template.id} value={template.name}>
                        {template.name} ({template.resourceType})
                      </option>
                    ))
                  )}
                </select>
                {availableTemplates.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Load a valid workspace to see available templates
                  </p>
                )}
              </div>
            </div>

            {/* 3. Sample FHIR Data - THIRD */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="text-blue-600 font-bold">3.</span> Sample FHIR Data
                </h3>
                <div className="flex gap-2">
                  <select
                    value={selectedResourceType}
                    onChange={(e) => setSelectedResourceType(e.target.value as 'Patient' | 'HumanName' | 'ContactPoint' | 'Address')}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Patient">Patient</option>
                    <option value="HumanName">HumanName</option>
                    <option value="ContactPoint">ContactPoint</option>
                    <option value="Address">Address</option>
                  </select>
                  <button
                    onClick={loadSampleData}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Load Sample
                  </button>
                </div>
              </div>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter FHIR data JSON..."
              />
              {!parsedData && jsonData && (
                <p className="mt-2 text-sm text-red-600">Invalid JSON data</p>
              )}
              {parsedData && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ Valid {parsedData.resourceType || 'FHIR'} data loaded
                </div>
              )}
            </div>

            {/* Debug Info */}
            {showDebugInfo && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Workspace Mode:</strong> {workspaceMode.toUpperCase()}</p>
                  <p><strong>Workspace Valid:</strong> {parsedWorkspace ? '✅' : '❌'}</p>
                  <p><strong>Data Valid:</strong> {parsedData ? '✅' : '❌'}</p>
                  <p><strong>Template Name:</strong> {templateName}</p>
                  <p><strong>Selected Resource Type:</strong> {selectedResourceType}</p>
                  <p><strong>Data Resource Type:</strong> {parsedData?.resourceType || 'None'}</p>
                  <p><strong>Theme:</strong> {theme}</p>
                  <p><strong>Templates Count:</strong> {parsedWorkspace?.templates?.length || 0}</p>
                  <p><strong>Workspace Size:</strong> {workspace.length} characters</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Theme & Preview */}
          <div className="space-y-6">
            
            {/* Theme Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <span className="text-purple-600 font-bold">4.</span> Theme Settings
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            {/* Widget Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                <span className="text-green-600 font-bold">5.</span> Widget Preview
              </h3>
            
              {!parsedWorkspace && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">⚠️</div>
                  <p>Invalid workspace configuration</p>
                </div>
              )}

              {!parsedData && parsedWorkspace && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>Add FHIR data to see widget preview</p>
                </div>
              )}

              {parsedWorkspace && parsedData && (
                <ErrorBoundary>
                  <div className={`widget-container theme-${theme}`}>
                    <FhirWidget
                      templates={workspaceMode === 'base64' ? workspace : btoa(JSON.stringify(parsedWorkspace))}
                      templateName={templateName}
                      data={parsedData}
                      theme={theme}
                    />
                  </div>
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetTest;