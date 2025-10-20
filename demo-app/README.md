# FHIR Widget Demo Application

A comprehensive demonstration and integration guide for the FHIR Widget React component.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3002/` to see the demo application.

## 📚 What's Included

### Interactive Demo
- **Live Widget Preview**: See the FHIR widget in action with real-time updates
- **Configuration Panel**: Modify workspace settings, templates, and data
- **Theme Switcher**: Test light, dark, and high-contrast themes
- **Sample Data**: Pre-loaded examples to get started quickly

### Integration Guide
- **React Integration**: Complete code examples for React applications
- **HTML/JavaScript**: UMD build usage for vanilla JavaScript projects
- **API Documentation**: Comprehensive props and configuration reference
- **Best Practices**: Tips and recommendations for production use

## 🔧 How to Embed FHIR Widget

### Option 1: React Component

```tsx
import FhirWidget from 'fhir-widget';

function MyApp() {
  const workspace = "eyJ0ZW1wbGF0ZXMiOlt7ImlkIjoi..."; // Base64 encoded
  const patientData = {
    resourceType: "Patient",
    name: [{ family: "Smith", given: ["John"] }],
    gender: "male",
    birthDate: "1985-03-15"
  };

  return (
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
  );
}
```

### Option 2: UMD Build (HTML/JavaScript)

```html
<!-- Include React dependencies -->
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>

<!-- Include FHIR Widget -->
<script src="./fhir-widget.umd.js"></script>

<div id="fhir-widget-container"></div>

<script>
  const element = React.createElement(FhirWidget, {
    templates: workspace,
    templateName: "Patient Basic Info",
    data: patientData,
    theme: "light"
  });
  
  ReactDOM.render(element, document.getElementById('fhir-widget-container'));
</script>
```

## 📋 Widget Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `templates` | `string` | Base64 encoded workspace configuration |
| `templateName` | `string` | Name of the template to render |
| `data` | `object` | FHIR resource object to display/edit |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `"light" \| "dark" \| "high-contrast"` | `"light"` | Visual theme |
| `showErrors` | `boolean` | `true` | Show validation errors |
| `onDataChange` | `function` | `undefined` | Callback when data changes |

## 🎯 Key Features

- **🎨 Dynamic Forms**: Automatically generates forms based on workspace templates
- **🩺 FHIR Compliant**: Works with standard FHIR resources (Patient, Observation, etc.)
- **🎭 Themeable**: Light, dark, and high-contrast theme support
- **📱 Responsive**: Works on desktop and mobile devices
- **🔄 Real-time Updates**: Live data binding and validation
- **🛡️ Error Handling**: Built-in error boundaries and validation

## 🏗️ Project Structure

```
demo-app/
├── src/
│   ├── components/
│   │   ├── FhirWidget.tsx           # Widget wrapper component
│   │   ├── InstructionsSection.tsx  # Integration documentation
│   │   ├── WorkspaceSection.tsx     # Workspace configuration UI
│   │   ├── TemplateSection.tsx      # Template and data management
│   │   ├── ThemeSection.tsx         # Theme selector
│   │   ├── PreviewSection.tsx       # Live widget preview
│   │   └── ErrorBoundary.tsx        # Error boundary wrapper
│   ├── react-globals.ts             # React globals for UMD compatibility
│   ├── App.tsx                      # Main application component
│   └── index.css                    # Application styles
├── public/
│   └── fhir-widget.umd.js          # UMD build of the widget
├── package.json
└── README.md
```

## 🤝 Development

### Building the Widget
The FHIR Widget is built from the main project:
```bash
cd ../  # Go to main project directory
npm run build
```

### Demo App Development
```bash
npm run dev    # Start development server
npm run build  # Build for production
```

## 🐛 Troubleshooting

### Common Issues

1. **Widget not loading**: Ensure React and ReactDOM are loaded before the widget
2. **Invalid workspace**: Check that workspace is properly Base64 encoded
3. **Template not found**: Verify template name matches exactly with workspace configuration
4. **JSON parsing errors**: Validate FHIR data format before passing to widget

### Error Messages
- **"Configuration Error"**: Issues with workspace or template configuration
- **"Data Error"**: Problems with FHIR JSON data format
- **"Widget not defined"**: UMD build not loaded or React dependencies missing

## 📞 Support

For questions, issues, or contributions, please refer to the main project repository.

---

**Happy building with FHIR Widget! 🩺✨**