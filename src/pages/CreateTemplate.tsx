import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FieldList, DesignCanvas, SampleJsonInput, LivePreview, Toolbar } from '../components';
import type { Template, TemplateField, FhirResource, FhirResourceType } from '../shared/types';
import { getSampleDataByResourceType } from '../shared/sampleData';
import { getDefaultFieldsForResourceType } from '../shared/defaultFields';

const CreateTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const resourceTypeParam = searchParams.get('resourceType') as FhirResourceType;
  const workspaceIdParam = searchParams.get('workspaceId');

  // Panel resizing state
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    const saved = localStorage.getItem('fhir-designer-panel-width');
    return saved ? parseInt(saved, 10) : 384; // 384px = w-96 default
  });
  const [sampleDataHeight, setSampleDataHeight] = useState(() => {
    const saved = localStorage.getItem('fhir-designer-sample-height');
    return saved ? parseInt(saved, 10) : 300; // 300px default
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState<Template>({
    id: '',
    name: 'New Template',
    description: '',
    resourceType: resourceTypeParam || 'Patient',
    workspaceId: workspaceIdParam || 'default-workspace',
    fields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0'
  });

  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [sampleJsonValue, setSampleJsonValue] = useState<string>('');
  const [sampleData, setSampleData] = useState<FhirResource | null>(null);


  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const leftSidebarWidth = 256; // w-64 = 256px
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate new right panel width (from right edge)
    const newRightPanelWidth = containerWidth - mouseX;
    
    // Set reasonable bounds: min 300px, max 60% of container width
    const minWidth = 300;
    const maxWidth = containerWidth * 0.6;
    const availableWidth = containerWidth - leftSidebarWidth;
    
    if (newRightPanelWidth >= minWidth && newRightPanelWidth <= Math.min(maxWidth, availableWidth - 300)) {
      setRightPanelWidth(newRightPanelWidth);
      // Save preference to localStorage
      localStorage.setItem('fhir-designer-panel-width', newRightPanelWidth.toString());
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsVerticalResizing(false);
  }, []);

  // Vertical resizing handlers
  const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsVerticalResizing(true);
  }, []);

  const handleVerticalMouseMove = useCallback((e: MouseEvent) => {
    if (!isVerticalResizing || !rightPanelRef.current) return;
    
    const panelRect = rightPanelRef.current.getBoundingClientRect();
    const mouseY = e.clientY - panelRect.top;
    const minHeight = 200; // Minimum height for each panel
    const maxHeight = panelRect.height - minHeight - 4; // Account for resize handle
    
    const newSampleHeight = Math.min(Math.max(minHeight, mouseY), maxHeight);
    setSampleDataHeight(newSampleHeight);
    localStorage.setItem('fhir-designer-sample-height', newSampleHeight.toString());
  }, [isVerticalResizing]);

  // Add keyboard shortcuts for panel resizing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + [ to shrink right panel
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        setRightPanelWidth(prev => {
          const newWidth = Math.max(300, prev - 50);
          localStorage.setItem('fhir-designer-panel-width', newWidth.toString());
          return newWidth;
        });
      }
      
      // Ctrl/Cmd + ] to expand right panel
      if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        setRightPanelWidth(prev => {
          const newWidth = Math.min(800, prev + 50);
          localStorage.setItem('fhir-designer-panel-width', newWidth.toString());
          return newWidth;
        });
      }
      
      // Ctrl/Cmd + 0 to reset to default
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setRightPanelWidth(384);
        localStorage.setItem('fhir-designer-panel-width', '384');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
    
    if (isVerticalResizing) {
      document.addEventListener('mousemove', handleVerticalMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleVerticalMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, isVerticalResizing, handleMouseMove, handleVerticalMouseMove, handleMouseUp]);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    } else {
      // Generate new ID for new template
      setTemplate(prev => ({
        ...prev,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
    }
  }, [templateId]);

  useEffect(() => {
    // Load sample data when component mounts or resource type changes
    const sampleData = getSampleDataByResourceType(template.resourceType);
    setSampleJsonValue(JSON.stringify(sampleData, null, 2));
    setSampleData(sampleData);
  }, [template.resourceType]);

  // Separate effect for populating default fields on initial load
  useEffect(() => {
    // Only add default fields for new templates (not loading existing ones)
    if (!templateId && template.fields.length === 0 && template.name === 'New Template') {
      const defaultFields = getDefaultFieldsForResourceType(template.resourceType);
      
      if (defaultFields.length > 0) {
        setTemplate(prev => ({
          ...prev,
          fields: defaultFields
        }));
      }
    }
  }, [templateId, template.resourceType]); // Removed template.fields.length to prevent loops

  const loadTemplate = (id: string) => {
    const stored = localStorage.getItem('fhir-templates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const foundTemplate = parsed.templates?.find((t: Template) => t.id === id);
        if (foundTemplate) {
          setTemplate(foundTemplate);
          // Load saved sample data if it exists, otherwise use default
          if (foundTemplate.sampleData) {
            setSampleData(foundTemplate.sampleData);
            setSampleJsonValue(JSON.stringify(foundTemplate.sampleData, null, 2));
          } else {
            const defaultSampleData = getSampleDataByResourceType(foundTemplate.resourceType);
            setSampleData(defaultSampleData);
            setSampleJsonValue(JSON.stringify(defaultSampleData, null, 2));
          }
        }
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    }
  };

  const handleFieldsChange = (fields: TemplateField[]) => {
    setTemplate(prev => ({
      ...prev,
      fields,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleTemplateNameChange = (name: string) => {
    setTemplate(prev => ({
      ...prev,
      name,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleTemplateDescriptionChange = (description: string) => {
    setTemplate(prev => ({
      ...prev,
      description,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleResourceTypeChange = (newResourceType: FhirResourceType) => {
    // Update template with new resource type and default fields
    const defaultFields = getDefaultFieldsForResourceType(newResourceType);
    const newSampleData = getSampleDataByResourceType(newResourceType);
    
    setTemplate(prev => ({
      ...prev,
      resourceType: newResourceType,
      fields: defaultFields, // Replace existing fields with defaults for new resource type
      updatedAt: new Date().toISOString()
    }));

    // Update sample data
    setSampleJsonValue(JSON.stringify(newSampleData, null, 2));
    setSampleData(newSampleData);
    
    // Clear any selected field since we're changing the template structure
    setSelectedField(null);
  };

  const handleSampleJsonChange = (value: string) => {
    setSampleJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      setSampleData(parsed);
    } catch (error) {
      setSampleData(null);
    }
  };

  const handleSave = () => {
    const stored = localStorage.getItem('fhir-templates');
    let templates: Template[] = [];
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        templates = parsed.templates || [];
      } catch (error) {
        console.error('Failed to parse stored templates:', error);
      }
    }

    // Create template with sample data included
    const templateToSave: Template = {
      ...template,
      sampleData: sampleData || undefined,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      templates[existingIndex] = templateToSave;
    } else {
      templates.push(templateToSave);
    }

    localStorage.setItem('fhir-templates', JSON.stringify({ templates }));
    alert('Template saved successfully!');
    
    // Navigate back to the workspace this template belongs to
    const workspaceId = template.workspaceId || 'default-workspace';
    navigate(`/?workspace=${encodeURIComponent(workspaceId)}`);
  };

  const handleExport = () => {
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

  const handleImport = (importedTemplate: Template) => {
    setTemplate(importedTemplate);
    setSelectedField(null);
  };



  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const workspaceId = template.workspaceId || 'default-workspace';
                navigate(`/?workspace=${encodeURIComponent(workspaceId)}`);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Templates
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => handleTemplateNameChange(e.target.value)}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  placeholder="Template name..."
                />
                <select
                  value={template.resourceType}
                  onChange={(e) => handleResourceTypeChange(e.target.value as FhirResourceType)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Patient">Patient</option>
                  <option value="HumanName">HumanName</option>
                  <option value="ContactPoint">ContactPoint</option>
                  <option value="Address">Address</option>
                </select>
              </div>
              <input
                type="text"
                value={template.description || ''}
                onChange={(e) => handleTemplateDescriptionChange(e.target.value)}
                className="block mt-1 text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                placeholder="Template description..."
              />
            </div>
          </div>
          <Toolbar
            template={template}
            onSave={handleSave}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {/* Left Sidebar - Field List */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <FieldList onFieldDrag={() => {}} resourceType={template.resourceType} />
        </div>

        {/* Center - Design Canvas */}
        <div 
          className="flex-1 flex flex-col"
          style={{ 
            width: `calc(100% - 256px - ${rightPanelWidth}px)`,
            minWidth: '300px'
          }}
        >
          <DesignCanvas
            fields={template.fields}
            onFieldsChange={handleFieldsChange}
            onFieldSelect={setSelectedField}
            selectedField={selectedField}
            resourceType={template.resourceType}
          />
        </div>

        {/* Resize Handle */}
        <div
          className={`relative w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-all duration-200 flex items-center justify-center group ${
            isResizing ? 'bg-blue-500 shadow-lg' : ''
          }`}
          onMouseDown={handleMouseDown}
          style={{ 
            userSelect: 'none',
            zIndex: 10
          }}
          title="Drag to resize panels"
        >
          {/* Visual indicator */}
          <div className={`w-0.5 h-12 bg-gray-400 group-hover:bg-white transition-colors duration-200 ${
            isResizing ? 'bg-white' : ''
          }`}></div>
          
          {/* Hover area extension */}
          <div className="absolute inset-y-0 -left-2 -right-2" />
        </div>

        {/* Right Sidebar - Sample Data & Preview */}
        <div 
          ref={rightPanelRef}
          className="bg-white border-l border-gray-200 flex flex-col"
          style={{ 
            width: `${rightPanelWidth}px`,
            minWidth: '300px',
            maxWidth: '800px'
          }}
        >
          {/* Sample Data Panel (Top) */}
          <div 
            className="border-b border-gray-200 flex flex-col"
            style={{ height: `${sampleDataHeight}px` }}
          >
            <div className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-100 bg-gray-50">
              Sample Data
            </div>
            <div className="flex-1 overflow-hidden">
              <SampleJsonInput
                value={sampleJsonValue}
                onChange={handleSampleJsonChange}
                resourceType={template.resourceType}
              />
            </div>
          </div>

          {/* Vertical Resize Handle */}
          <div 
            className="h-1 bg-gray-200 cursor-row-resize hover:bg-blue-500 transition-colors relative group"
            onMouseDown={handleVerticalMouseDown}
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1" />
            {/* Visual indicator */}
            <div className="h-0.5 bg-gray-400 group-hover:bg-blue-600 transition-colors mx-auto" style={{ width: '20px', marginTop: '1px' }} />
          </div>

          {/* Live Preview Panel (Bottom) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-100 bg-gray-50">
              Live Preview
              {/* Panel resize shortcuts indicator */}
              <span 
                className="float-right text-xs text-gray-400"
                title="Keyboard shortcuts: Ctrl+[ to shrink, Ctrl+] to expand, Ctrl+0 to reset"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <LivePreview template={template} sampleData={sampleData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;