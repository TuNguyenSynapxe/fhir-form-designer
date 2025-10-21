# FHIR Form Designer

A React-based visual form designer for creating dynamic FHIR (Fast Healthcare Interoperability Resources) forms with drag-and-drop functionality and live preview.

## 🚀 Features

### 🎨 Visual Form Designer
- **Drag & Drop Interface**: Intuitive field placement with visual feedback
- **Resizable Panels**: Customizable workspace with persistent panel sizing
- **Live Preview**: Real-time form rendering with sample data

### 🔧 Advanced Field Configuration
- **Expression Support**: Dynamic field values using FHIR paths and expressions
- **Resource Type Support**: Patient, HumanName, ContactPoint, Address, and more
- **Field Mappings**: Pre-configured field mappings for common FHIR resources

### 📊 Smart Data Integration
- **Resource-Specific Sample Data**: Context-aware sample data for different FHIR resource types
- **Expression Evaluator**: Support for field concatenation and FHIR path resolution
- **JSON Editor**: Direct sample data editing with validation

### 🚀 Template Management
- **Save & Load Templates**: Persistent template storage with versioning
- **Import/Export**: Template sharing and backup functionality
- **Preview Mode**: Standalone template preview with custom data

### Expression System

The form designer supports powerful expressions for dynamic field values:

#### FHIR Path Expressions
```javascript
// Access nested FHIR data
name[0].given[0]           // First given name
name[0].family             // Family name
address[0].line[0]         // First address line
```

#### Field Concatenation
```javascript
// Combine multiple fields
name[0].given[0] + " " + name[0].family    // Full name
firstName + " " + lastName                  // Using field aliases
```

#### Supported Resource Types
- **Patient**: Complete patient demographics
- **HumanName**: Name components and formatting
- **ContactPoint**: Phone, email, and communication details
- **Address**: Address components and formatting

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS v3
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **FHIR Path Resolution**: lodash.get + custom handlers
- **Storage**: LocalStorage (client-side only)
- **Routing**: React Router DOM

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:5173`
   - The app will hot-reload as you make changes

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🎯 Usage Guide

### Creating a Template

1. **Navigate to Create Template**:
   - Go to `/create` or click "Create New Template" from the home page

2. **Design Your Template**:
   - **Left Panel**: Drag field types (First Name, Last Name, Email, etc.)
   - **Center Panel**: Drop fields and arrange them
   - **Right Panel**: Toggle between sample JSON data and live preview

3. **Configure Fields**:
   - Click any field in the design canvas to edit its properties
   - Set the label, FHIR path, required status, and field-specific options
   - FHIR paths determine which data from the Patient resource gets displayed

4. **Test with Sample Data**:
   - Use the "Sample Data" tab to modify the FHIR Patient JSON
   - Switch to "Live Preview" tab to see how your template renders
   - The preview updates in real-time as you modify fields or data

5. **Save & Export**:
   - Click "Save Template" to store locally
   - Use "Export" to download as JSON file
   - Use "Import" to load templates from JSON files

## 🧭 Navigation Structure

The application uses a hierarchical navigation structure organized around Workspaces and functional areas:

### URL Patterns

#### Data Explorer (Read-Only)
- `/` - FHIR Data Explorer dashboard showing all configured list viewers
- `/explorer/:listViewerId` - Individual list viewer for data consumption (read-only mode)

#### Configuration (Editing)
- `/config` - Configuration landing page with Templates and List Viewers overview
- `/config/templates` - Template management interface
- `/config/templates/:templateId` - Individual template editor
- `/config/list-viewers` - List viewer configuration interface
- `/config/list-viewers/:listViewerId` - Individual list viewer editor

#### Legacy Support
- `/templates` - Redirects to `/config/templates` (backward compatibility)
- `/list-viewer` - Redirects to `/config/list-viewers` (backward compatibility)

### Navigation Components

#### WorkspaceManager Sidebar
The left sidebar provides expandable workspace navigation:

```
📋 [Workspace 1] ▼ (expandable)
├── 📊 Data Explorer        → /?workspace=workspace-1
├── ⚙️ Configuration        → /config?workspace=workspace-1
├── 📋 Templates            → /config/templates?workspace=workspace-1  
└── 📊 List Viewers         → /config/list-viewers?workspace=workspace-1

📋 [Workspace 2] ▶ (collapsed)

📋 [Workspace 3] ▼ (expandable)
├── 📊 Data Explorer        → /?workspace=workspace-3
├── ⚙️ Configuration        → /config?workspace=workspace-3
├── 📋 Templates            → /config/templates?workspace=workspace-3  
└── 📊 List Viewers         → /config/list-viewers?workspace=workspace-3
```

**Features:**
- Individual workspace expansion/collapse with toggle arrows
- Per-workspace navigation menu (Data Explorer, Configuration, Templates, List Viewers)
- Current workspace is automatically expanded
- Workspace switching and management
- Workspace creation and editing tools
- Export functionality for widget integration

#### TopNavigation
The top navigation provides utility tools:
- 🧪 Widget Test - Link to `/widget-test`
- Quick Actions (extensible)
- Help & Documentation

### Component Architecture

#### Page Components
- **FHIRDataExplorer** - Main dashboard for data exploration
- **ExplorerListView** - Read-only individual list viewer
- **ConfigurationIndex** - Configuration landing page
- **TemplateEditor** - Individual template editing interface

#### Shared Components
- **WorkspaceManager** - Left sidebar with navigation and workspace management
- **TopNavigation** - Top utility bar
- **PreviewPanel** - Data preview with optional read-only mode

### Workspace Integration

All routes accept a `workspace` query parameter:
```
?workspace={workspaceId}
```

Examples:
- `/?workspace=workspace-123` - Data Explorer for specific workspace
- `/config/templates?workspace=workspace-123` - Template management for workspace
- `/explorer/list-viewer-456?workspace=workspace-123` - List viewer in specific workspace

### Design Principles

1. **Separation of Concerns**: Clear distinction between data exploration (read-only) and configuration (editing)
2. **Hierarchical Structure**: Logical organization under Workspace → Section → Page
3. **Backward Compatibility**: Legacy URLs redirect to new structure
4. **Workspace Context**: All functionality is workspace-aware
5. **Consistent Navigation**: Unified sidebar navigation across all pages

## 📝 MVP1 Scope

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
