# 🧬 FHIR Widget - Standalone Template Renderer

A standalone, embeddable widget for rendering FHIR templates with base64 workspace support.

## 🚀 Quick Start

### CDN Usage (Vanilla JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="./fhir-widget.css">
</head>
<body>
    <div id="patient-display"></div>
    
    <!-- Load React dependencies -->
    <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    
    <!-- Load FHIR Widget -->
    <script src="./fhir-widget.umd.js"></script>
    
    <script>
        // Export workspace as base64 from FHIR Form Designer
        const templates = "eyJ0ZW1wbGF0ZXMiOlt7ImlkIjoiMSIsIm5hbWUi..."; 
        
        FhirWidget.render({
            templates: templates,
            templateName: "Patient Summary",
            data: {
                resourceType: "Patient",
                name: [{ given: ["John"], family: "Doe" }],
                gender: "male"
            },
            theme: "light"
        }, "#patient-display");
    </script>
</body>
</html>
```

### NPM Installation

```bash
npm install @fhir-form-designer/widget
```

### React Component Usage

```jsx
import { FhirWidget } from '@fhir-form-designer/widget';
import '@fhir-form-designer/widget/style.css';

function MyComponent() {
    const templates = "eyJ0ZW1wbGF0ZXMiOlt7ImlkIjoiMSIsIm5hbWUi..."; // Base64 workspace
    
    return (
        <FhirWidget 
            templates={templates}
            templateName="Patient Summary"
            data={patientData}
            theme="light"
        />
    );
}
```

## 📋 API Reference

### FhirWidget Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `templates` | `string` | ✅ | Base64 encoded workspace from FHIR Form Designer |
| `templateName` | `string` | ✅ | Name of the template to render |
| `data` | `FhirResource` | ✅ | FHIR resource data to display |
| `theme` | `'light' \| 'dark' \| 'high-contrast'` | ❌ | Widget theme (default: 'light') |
| `className` | `string` | ❌ | CSS class for the widget container |
| `style` | `React.CSSProperties` | ❌ | Custom styles for the widget container |
| `showErrors` | `boolean` | ❌ | Show error details (default: true) |

### Static Methods

#### `FhirWidget.render(props, container)`

Renders the widget in vanilla JavaScript environments.

- `props`: FhirWidget props object
- `container`: CSS selector string or DOM element

## 🎨 Themes

The widget supports three built-in themes:

- **`light`** - Clean light theme (default)
- **`dark`** - Dark theme with light text
- **`high-contrast`** - High contrast theme for accessibility

## 📊 Getting Base64 Templates

1. Open your FHIR Form Designer
2. Create or select templates in a workspace  
3. Go to Workspace Manager
4. Click "Export Workspace"
5. Copy the generated base64 string
6. Use this string as the `templates` prop

## 🔧 Examples

### Multiple Widgets with Different Themes

```javascript
// Light theme widget
FhirWidget.render({
    templates: base64Templates,
    templateName: "Patient Summary",
    data: patientData,
    theme: "light"
}, "#light-widget");

// Dark theme widget  
FhirWidget.render({
    templates: base64Templates,
    templateName: "Patient Demographics", 
    data: patientData,
    theme: "dark"
}, "#dark-widget");
```

### Error Handling

```javascript
try {
    FhirWidget.render({
        templates: "invalid-base64",
        templateName: "Non-existent Template",
        data: patientData
    }, "#widget-container");
} catch (error) {
    console.error("Widget failed to render:", error.message);
}
```

### Custom Styling

```jsx
<FhirWidget 
    templates={templates}
    templateName="Patient Summary"
    data={data}
    theme="light"
    style={{
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '20px'
    }}
    className="my-custom-widget"
/>
```

## 🛠️ Development

### Building the Widget

```bash
# Build widget only
npm run build:widget

# Build both main app and widget
npm run build:all

# Test widget with local server
npm run test:widget
```

### File Structure

```
dist-widget/
├── fhir-widget.umd.js    # UMD bundle for vanilla JS
├── fhir-widget.es.js     # ES module bundle  
└── fhir-widget.css       # Widget styles
```

## 🌐 Browser Support

- Modern browsers supporting ES2015+
- React 18+ or React 19+
- No Internet Explorer support

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

This widget is part of the FHIR Form Designer project. Please see the main repository for contribution guidelines.