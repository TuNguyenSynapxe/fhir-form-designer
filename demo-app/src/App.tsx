import { useState, useEffect, useMemo } from 'react';
import WorkspaceSection from './components/WorkspaceSection';
import TemplateSection from './components/TemplateSection';
import PreviewSection from './components/PreviewSection';
import InstructionsSection from './components/InstructionsSection';
// Import the widget through the index file which includes CSS
import FhirWidget from '../../src/widget/index';
import '../../src/styles/theme.css';

// Sample data
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
      { id: "birthDate", type: "date", label: "Birth Date", fhirPath: "birthDate", order: 3 }
    ]
  }]
};

const samplePatient = {
  resourceType: "Patient",
  name: [{ family: "Smith", given: ["John"] }],
  gender: "male",
  birthDate: "1985-03-15"
};

function App() {
  const [workspace, setWorkspace] = useState(btoa(JSON.stringify(patientWorkspace)));
  const [templateName, setTemplateName] = useState("Patient Basic Info");
  const [jsonData, setJsonData] = useState(JSON.stringify(samplePatient, null, 2));
  const [theme, setTheme] = useState('light');
  const [error, setError] = useState('');
  const [decodedWs, setDecodedWs] = useState(null);
  const [hasManuallySelectedTemplate, setHasManuallySelectedTemplate] = useState(false);
  
  const parsedData = useMemo(() => {
    try {
      return JSON.parse(jsonData);
    } catch {
      return null;
    }
  }, [jsonData]);
  
  useEffect(() => {
    try {
      const decoded = JSON.parse(atob(workspace));
      setDecodedWs(decoded);
      setError('');
    } catch (err: any) {
      setError('Invalid workspace: ' + err.message);
      setDecodedWs(null);
    }
  }, [workspace]);

  // Auto-select first template when workspace changes (only if user hasn't manually selected)
  useEffect(() => {
    const availableTemplates = (decodedWs as any)?.templates || [];
    const firstAvailableTemplate = availableTemplates[0]?.name;
    if (firstAvailableTemplate && !hasManuallySelectedTemplate && availableTemplates.length > 0) {
      setTemplateName(firstAvailableTemplate);
    }
  }, [decodedWs, hasManuallySelectedTemplate]);

  const handleTemplateSelection = (templateName: string) => {
    setTemplateName(templateName);
    setHasManuallySelectedTemplate(true);
  };
  
  const loadSample = () => {
    setWorkspace(btoa(JSON.stringify(patientWorkspace)));
    setTemplateName("Patient Basic Info");
    setJsonData(JSON.stringify(samplePatient, null, 2));
    setError('');
    setHasManuallySelectedTemplate(false); // Reset manual selection when loading sample
  };
  
  const generateSample = () => {
    setJsonData(JSON.stringify(samplePatient, null, 2));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🩺 FHIR Widget Demo</h1>
        <p>Interactive demonstration and integration guide for the FHIR Widget React component</p>
      </div>
      
      <div className="main-content">
        <InstructionsSection />
        
        <div className="config-grid">
          <WorkspaceSection
            workspace={workspace}
            setWorkspace={setWorkspace}
            decodedWs={decodedWs}
            loadSample={loadSample}
          />
          
          <TemplateSection
            templateName={templateName}
            setTemplateName={setTemplateName}
            jsonData={jsonData}
            setJsonData={setJsonData}
            generateSample={generateSample}
            decodedWs={decodedWs}
            handleTemplateSelection={handleTemplateSelection}
          />
        </div>
        
        <div className="preview-container">
          <PreviewSection
            error={error}
            parsedData={parsedData}
            workspace={workspace}
            templateName={templateName}
            theme={theme}
            FhirWidget={FhirWidget}
            onThemeChange={setTheme}
          />
        </div>
      </div>
    </div>
  );
}

export default App;