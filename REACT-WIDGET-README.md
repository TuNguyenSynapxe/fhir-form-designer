# FHIR Widget - React Integration Guide

## Overview

The FHIR Widget is a React component that renders FHIR data using customizable templates. This simplified version is designed specifically for React applications.

## Installation & Usage

### 1. Include the Widget Files

Add the widget CSS and JavaScript files to your React application:

```html
<!-- CSS -->
<link rel="stylesheet" href="path/to/fhir-widget.css">

<!-- JavaScript (UMD build) -->
<script src="path/to/fhir-widget.umd.js"></script>
```

Or use the ES module build in your build process:

```javascript
import FhirWidget from 'path/to/fhir-widget.es.js';
import 'path/to/fhir-widget.css';
```

### 2. Use as React Component

```jsx
import React from 'react';

function MyApp() {
  // Base64 encoded workspace containing templates
  const templates = "eyJpZCI6InRlc3QiLCJuYW1lIjoiVGVzdCBXb3Jrc3BhY2UiLCJ0ZW1wbGF0ZXMiOlt7ImlkIjoicGF0aWVudCIsIm5hbWUiOiJQYXRpZW50IEluZm8iLCJyZXNvdXJjZVR5cGUiOiJQYXRpZW50IiwiZmllbGRzIjpbeyJpZCI6Im5hbWUiLCJ0eXBlIjoidGV4dCIsImxhYmVsIjoiTmFtZSIsImZoaXJQYXRoIjoibmFtZVswXS5mYW1pbHkiLCJvcmRlciI6MX1dfV19";
  
  const patientData = {
    resourceType: "Patient",
    name: [{ family: "Smith", given: ["John"] }]
  };

  return (
    <div>
      <h1>Patient Information</h1>
      <FhirWidget 
        templates={templates}
        templateName="Patient Info"
        data={patientData}
        theme="light"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `templates` | `string` | Yes | Base64-encoded workspace containing template definitions |
| `templateName` | `string` | Yes | Name of the template to render |
| `data` | `object` | Yes | FHIR resource data to display |
| `theme` | `string` | No | Theme name: "light", "dark", or "high-contrast" (default: "light") |
| `className` | `string` | No | Additional CSS classes |
| `style` | `object` | No | Inline styles |
| `showErrors` | `boolean` | No | Whether to display error messages (default: true) |

## Workspace Format

The `templates` prop expects a base64-encoded JSON object with this structure:

```json
{
  "id": "workspace-id",
  "name": "Workspace Name",
  "templates": [
    {
      "id": "template-id",
      "name": "Template Display Name", 
      "resourceType": "Patient",
      "fields": [
        {
          "id": "field-id",
          "type": "text",
          "label": "Field Label",
          "fhirPath": "name[0].family",
          "order": 1
        }
      ]
    }
  ]
}
```

## Field Types

Supported field types:
- `text` - Text display
- `date` - Date formatting
- `select` - Dropdown values
- `radio` - Radio button values  
- `checkbox` - Boolean values
- `group` - Field grouping
- `label` - Static labels

## Themes

Available themes:
- `light` (default) - Light theme
- `dark` - Dark theme  
- `high-contrast` - High contrast theme

## Example Integration

```jsx
import React, { useState } from 'react';
import FhirWidget from './dist/fhir-widget.es.js';
import './dist/fhir-widget.css';

function PatientDashboard({ patient }) {
  const [selectedTemplate, setSelectedTemplate] = useState("summary");
  
  // Your workspace templates (base64 encoded)
  const workspaceTemplates = "..."; // Base64 encoded workspace
  
  return (
    <div className="dashboard">
      <header>
        <h1>Patient Dashboard</h1>
        <select 
          value={selectedTemplate} 
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <option value="summary">Patient Summary</option>
          <option value="detailed">Detailed View</option>
        </select>
      </header>
      
      <main>
        <FhirWidget
          templates={workspaceTemplates}
          templateName={selectedTemplate}
          data={patient}
          theme="light"
          className="patient-widget"
        />
      </main>
    </div>
  );
}
```

## Browser Compatibility

- Modern browsers with React 16.8+
- React 18+ recommended for optimal performance
- ES6+ support required