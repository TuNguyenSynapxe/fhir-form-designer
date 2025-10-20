import { useState } from 'react';

const InstructionsSection = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'react' | 'html'>('overview');

  const codeExamples = {
    react: `// 1. Install the FHIR Widget (if published to npm)
npm install fhir-widget

// 2. Or import directly from source
import FhirWidget from './src/widget/FhirWidget';
import './src/widget/widget.css';

// 3. Basic React component usage
import React from 'react';
import FhirWidget from 'fhir-widget';

function MyComponent() {
  // Your workspace configuration (Base64 encoded)
  const workspace = "eyJ0ZW1wbGF0ZXMiOlt7ImlkIjoi..."; // Base64 workspace
  
  // FHIR data to display/edit
  const patientData = {
    resourceType: "Patient",
    name: [{ family: "Smith", given: ["John"] }],
    gender: "male",
    birthDate: "1985-03-15"
  };

  return (
    <div>
      <h2>Patient Information</h2>
      <FhirWidget
        templates={workspace}
        templateName="Patient Basic Info"
        data={patientData}
        theme="light"
        showErrors={true}
        onDataChange={(updatedData) => {
          console.log('Data updated:', updatedData);
        }}
      />
    </div>
  );
}`,

    html: `<!-- 1. Include React dependencies -->
<script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>

<!-- 2. Include the FHIR Widget -->
<script src="./fhir-widget.umd.js"></script>

<!-- 3. Create container for widget -->
<div id="fhir-widget-container"></div>

<script>
  // Your workspace configuration
  const workspace = "eyJ0ZW1wbGF0ZXMiOlt7ImlkIjoi..."; // Base64 encoded workspace
  
  // FHIR data
  const patientData = {
    resourceType: "Patient",
    name: [{ family: "Smith", given: ["John"] }],
    gender: "male",
    birthDate: "1985-03-15"
  };

  // Render the widget
  const element = React.createElement(FhirWidget, {
    templates: workspace,
    templateName: "Patient Basic Info", 
    data: patientData,
    theme: "light",
    showErrors: true,
    onDataChange: function(updatedData) {
      console.log('Data updated:', updatedData);
    }
  });

  ReactDOM.render(element, document.getElementById('fhir-widget-container'));
</script>`
  };

  return (
    <div className="instructions-section">
      <h2>📚 How to Embed FHIR Widget</h2>
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'overview' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('overview')}
        >
          📖 Overview
        </button>
        <button 
          className={activeTab === 'react' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('react')}
        >
          ⚛️ React Integration
        </button>
        <button 
          className={activeTab === 'html' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('html')}
        >
          🌐 HTML/JavaScript
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <h3>🎯 What is FHIR Widget?</h3>
            <p>
              The FHIR Widget is a React component that renders interactive forms for FHIR resources. 
              It takes a workspace configuration and FHIR data to create dynamic, editable forms.
            </p>

            <h3>🔧 Key Features</h3>
            <ul className="feature-list">
              <li>🎨 <strong>Dynamic Forms:</strong> Automatically generates forms based on workspace templates</li>
              <li>🩺 <strong>FHIR Compliant:</strong> Works with standard FHIR resources (Patient, Observation, etc.)</li>
              <li>🎭 <strong>Themeable:</strong> Light and dark theme support</li>
              <li>📱 <strong>Responsive:</strong> Works on desktop and mobile devices</li>
              <li>🔄 <strong>Real-time Updates:</strong> Live data binding and validation</li>
              <li>🛡️ <strong>Error Handling:</strong> Built-in error boundaries and validation</li>
            </ul>

            <h3>📋 Required Props</h3>
            <div className="props-table">
              <div className="prop-row">
                <div className="prop-name">templates</div>
                <div className="prop-type">string</div>
                <div className="prop-desc">Base64 encoded workspace configuration</div>
              </div>
              <div className="prop-row">
                <div className="prop-name">templateName</div>
                <div className="prop-type">string</div>
                <div className="prop-desc">Name of the template to use for rendering</div>
              </div>
              <div className="prop-row">
                <div className="prop-name">data</div>
                <div className="prop-type">object</div>
                <div className="prop-desc">FHIR resource object to display/edit</div>
              </div>
            </div>

            <h3>⚙️ Optional Props</h3>
            <div className="props-table">
              <div className="prop-row">
                <div className="prop-name">theme</div>
                <div className="prop-type">"light" | "dark"</div>
                <div className="prop-desc">Visual theme (default: "light")</div>
              </div>
              <div className="prop-row">
                <div className="prop-name">showErrors</div>
                <div className="prop-type">boolean</div>
                <div className="prop-desc">Show validation errors (default: true)</div>
              </div>
              <div className="prop-row">
                <div className="prop-name">onDataChange</div>
                <div className="prop-type">function</div>
                <div className="prop-desc">Callback when data is modified</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'react' && (
          <div className="code-content">
            <h3>⚛️ React Component Integration</h3>
            <p>Use the FHIR Widget as a standard React component in your application:</p>
            <pre className="code-block">
              <code>{codeExamples.react}</code>
            </pre>
            
            <div className="info-box">
              <h4>💡 Pro Tips:</h4>
              <ul>
                <li>Wrap the widget in an ErrorBoundary for better error handling</li>
                <li>Use useCallback for onDataChange to prevent unnecessary re-renders</li>
                <li>Store workspace configurations in your backend or app state</li>
                <li>Validate FHIR data before passing to the widget</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'html' && (
          <div className="code-content">
            <h3>🌐 HTML/JavaScript Integration</h3>
            <p>Use the UMD build for vanilla JavaScript or non-React applications:</p>
            <pre className="code-block">
              <code>{codeExamples.html}</code>
            </pre>
            
            <div className="info-box">
              <h4>⚠️ Important Notes:</h4>
              <ul>
                <li>React and ReactDOM must be loaded before the widget</li>
                <li>Use the UMD build (fhir-widget.umd.js) for HTML integration</li>
                <li>The widget is available globally as <code>FhirWidget</code></li>
                <li>Ensure your container element exists before rendering</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructionsSection;