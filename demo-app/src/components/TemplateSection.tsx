import { useState } from 'react';
import SampleDataSelector from './SampleDataSelector';

interface TemplateSectionProps {
  templateName: string;
  setTemplateName: (value: string) => void;
  jsonData: string;
  setJsonData: (value: string) => void;
  generateSample: () => void;
  decodedWs: any;
  handleTemplateSelection?: (templateName: string) => void;
}

const TemplateSection = ({ 
  templateName, 
  setTemplateName, 
  jsonData, 
  setJsonData, 
  generateSample: _generateSample,
  decodedWs,
  handleTemplateSelection
}: TemplateSectionProps) => {
  const [showSampleSelector, setShowSampleSelector] = useState(false);
  const availableTemplates = decodedWs?.templates || [];
  
  const onTemplateChange = (value: string) => {
    if (handleTemplateSelection) {
      handleTemplateSelection(value);
    } else {
      setTemplateName(value);
    }
  };

  const handleSampleDataSelect = (data: any) => {
    setJsonData(JSON.stringify(data, null, 2));
  };
  return (
    <div className="section">
      <h3>📋 Template & Data Configuration</h3>
      <p className="section-description">
        Choose a template from your workspace and provide FHIR resource data to render in the widget.
      </p>
      
      <label htmlFor="template-select">
        <strong>Template Selection:</strong>
        <span className="label-hint">Choose which form template to display</span>
      </label>
      {availableTemplates.length > 0 ? (
        <select
          id="template-select"
          value={templateName}
          onChange={(e) => onTemplateChange(e.target.value)}
        >
          {availableTemplates.map((template: any) => (
            <option key={template.id} value={template.name}>
              📝 {template.name} ({template.resourceType})
            </option>
          ))}
        </select>
      ) : (
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="⚠️ No templates available - load a workspace first"
          disabled
        />
      )}
      
      <div className="button-group">
        <button onClick={() => setShowSampleSelector(true)}>
          🎲 Generate Sample Data
        </button>
        <button className="secondary" onClick={() => setJsonData('')}>
          🗑️ Clear Data
        </button>
      </div>
      
      <label htmlFor="fhir-data">
        <strong>FHIR Resource Data:</strong>
        <span className="label-hint">JSON data for the selected resource type</span>
      </label>
      <textarea
        id="fhir-data"
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        rows={10}
        placeholder="Enter FHIR resource JSON data..."
      />
      
      {jsonData && !jsonData.trim().startsWith('{') && (
        <div className="error">
          Warning: Invalid JSON format - data should start with curly brace
        </div>
      )}

      {showSampleSelector && (
        <SampleDataSelector
          onSampleSelect={handleSampleDataSelect}
          onClose={() => setShowSampleSelector(false)}
        />
      )}
    </div>
  );
};

export default TemplateSection;