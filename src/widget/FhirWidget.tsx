import React, { useMemo, useState } from 'react';
import type { FhirResource } from '../shared/types';
import { decodeWorkspace, findTemplateByName, validateTemplateCompatibility } from './utils';
import LivePreview from '../components/LivePreview';

// Theme configuration for standalone widget
const widgetThemes = {
  light: {
    '--color-primary': '#3b82f6',
    '--color-primary-light': '#dbeafe',
    '--color-text': '#111827',
    '--color-background': '#ffffff',
    '--color-border': '#d1d5db',
    '--color-gray-50': '#f9fafb',
    '--color-gray-100': '#f3f4f6',
    '--color-gray-200': '#e5e7eb',
    '--color-gray-600': '#4b5563',
    '--color-gray-700': '#374151',
    '--color-gray-900': '#111827',
  },
  dark: {
    '--color-primary': '#60a5fa',
    '--color-primary-light': '#1e3a8a',
    '--color-text': '#f9fafb',
    '--color-background': '#111827',
    '--color-border': '#374151',
    '--color-gray-50': '#1f2937',
    '--color-gray-100': '#374151',
    '--color-gray-200': '#4b5563',
    '--color-gray-600': '#d1d5db',
    '--color-gray-700': '#e5e7eb',
    '--color-gray-900': '#f9fafb',
  },
  'high-contrast': {
    '--color-primary': '#000000',
    '--color-primary-light': '#ffffff',
    '--color-text': '#000000',
    '--color-background': '#ffffff',
    '--color-border': '#000000',
    '--color-gray-50': '#ffffff',
    '--color-gray-100': '#f0f0f0',
    '--color-gray-200': '#e0e0e0',
    '--color-gray-600': '#000000',
    '--color-gray-700': '#000000',
    '--color-gray-900': '#000000',
  }
};

export interface FhirWidgetProps {
  /** Base64 encoded workspace containing templates */
  templates: string;
  /** Name of the template to use from the workspace */
  templateName: string;
  /** FHIR data to display */
  data: FhirResource;
  /** Theme for the widget */
  theme?: 'light' | 'dark' | 'high-contrast';
  /** CSS class name to apply to the widget container */
  className?: string;
  /** Custom CSS styles for the widget container */
  style?: React.CSSProperties;
  /** Show error details when template or data issues occur */
  showErrors?: boolean;
}

const FhirWidget: React.FC<FhirWidgetProps> = ({
  templates,
  templateName,
  data,
  theme = 'light',
  className = '',
  style = {},
  showErrors = true
}) => {
  const [error, setError] = useState<string | null>(null);

  // Decode workspace and find template
  const { workspace, template } = useMemo(() => {
    try {
      setError(null);
      
      // Decode the base64 workspace
      const decodedWorkspace = decodeWorkspace(templates);
      
      // Find the specified template
      const foundTemplate = findTemplateByName(decodedWorkspace, templateName);
      
      if (!foundTemplate) {
        const availableNames = decodedWorkspace.templates.map(t => t.name).join(', ');
        throw new Error(`Template "${templateName}" not found. Available templates: ${availableNames}`);
      }
      
      // Validate template compatibility with data
      if (!validateTemplateCompatibility(foundTemplate, data)) {
        console.warn('Template may not be fully compatible with provided data');
      }
      
      return {
        workspace: decodedWorkspace,
        template: foundTemplate
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { workspace: null, template: null };
    }
  }, [templates, templateName, data]);

  // Apply theme CSS variables
  const themeStyles = useMemo(() => {
    const themeConfig = widgetThemes[theme];
    return {
      ...style,
      ...themeConfig
    };
  }, [theme, style]);

  // Error state
  if (error) {
    if (!showErrors) {
      return null;
    }
    
    return (
      <div 
        className={`fhir-widget fhir-widget-error ${className}`}
        style={{
          ...themeStyles,
          padding: '16px',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          color: '#dc2626'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ marginRight: '8px', fontSize: '18px' }}>⚠️</span>
          <strong>FHIR Widget Error</strong>
        </div>
        <div style={{ fontSize: '14px' }}>{error}</div>
      </div>
    );
  }

  // Loading or missing data
  if (!template || !workspace) {
    return (
      <div 
        className={`fhir-widget fhir-widget-loading ${className}`}
        style={{
          ...themeStyles,
          padding: '16px',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          backgroundColor: 'var(--color-gray-50)',
          color: 'var(--color-text)',
          textAlign: 'center'
        }}
      >
        Loading template...
      </div>
    );
  }

  // Render the template with LivePreview
  return (
    <div 
      className={`fhir-widget fhir-widget-${theme} ${className}`}
      style={themeStyles}
    >
      <LivePreview 
        template={template} 
        sampleData={data} 
      />
    </div>
  );
};

// Static render method for vanilla JS usage
(FhirWidget as any).render = (props: FhirWidgetProps, container: string | Element) => {
  if (typeof window === 'undefined') return;
  
  const React = (window as any).React;
  const ReactDOM = (window as any).ReactDOM;
  
  if (!React || !ReactDOM) {
    throw new Error('React and ReactDOM must be available globally for FhirWidget.render()');
  }
  
  const targetElement = typeof container === 'string' 
    ? document.querySelector(container)
    : container;
    
  if (!targetElement) {
    throw new Error(`Container element not found: ${container}`);
  }
  
  // Support both React 18+ createRoot and legacy render
  if (ReactDOM.createRoot) {
    // React 18+ with createRoot
    const root = ReactDOM.createRoot(targetElement);
    root.render(React.createElement(FhirWidget, props));
  } else if (ReactDOM.render) {
    // Legacy React 17 and below
    ReactDOM.render(React.createElement(FhirWidget, props), targetElement);
  } else {
    throw new Error('No compatible ReactDOM render method found');
  }
};

export default FhirWidget;