import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import FHIRDataExplorer from './pages/FHIRDataExplorer';
import ExplorerListView from './pages/ExplorerListView';
import ConfigurationIndex from './pages/ConfigurationIndex';
import Templates from './pages/Templates';
import TemplateEditor from './pages/TemplateEditor';
import CreateTemplate from './pages/CreateTemplate';
import Preview from './pages/Preview';
import WidgetTest from './pages/WidgetTest';
import ListViewerIndex from './pages/ListViewerIndex';
import FHIRListViewer from './pages/FHIRListViewer';

// Legacy redirect component for /list-viewer/:id
const LegacyListViewerRedirect = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const workspace = searchParams.get('workspace');
  const workspaceParam = workspace ? `?workspace=${workspace}` : '';
  return <Navigate to={`/config/list-viewers/${id}${workspaceParam}`} replace />;
};

// Legacy redirect component for /templates with workspace preservation
const LegacyTemplatesRedirect = () => {
  const [searchParams] = useSearchParams();
  const workspace = searchParams.get('workspace');
  const workspaceParam = workspace ? `?workspace=${workspace}` : '';
  return <Navigate to={`/config/templates${workspaceParam}`} replace />;
};

// Legacy redirect component for /list-viewer with workspace preservation
const LegacyListViewerIndexRedirect = () => {
  const [searchParams] = useSearchParams();
  const workspace = searchParams.get('workspace');
  const workspaceParam = workspace ? `?workspace=${workspace}` : '';
  return <Navigate to={`/config/list-viewers${workspaceParam}`} replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* FHIR Data Explorer - Default Landing */}
          <Route path="/" element={<FHIRDataExplorer />} />
          <Route path="/explorer" element={<FHIRDataExplorer />} />
          <Route path="/explorer/:listViewerId" element={<ExplorerListView />} />
          
          {/* Configuration Section */}
          <Route path="/config" element={<ConfigurationIndex />} />
          <Route path="/config/templates" element={<Templates />} />
          <Route path="/config/templates/:id" element={<TemplateEditor />} />
          <Route path="/config/list-viewers" element={<ListViewerIndex />} />
          <Route path="/config/list-viewers/:id" element={<FHIRListViewer />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/create" element={<CreateTemplate />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/templates" element={<LegacyTemplatesRedirect />} />
          <Route path="/list-viewer" element={<LegacyListViewerIndexRedirect />} />
          <Route path="/list-viewer/:id" element={<LegacyListViewerRedirect />} />
          
          {/* Widget Test - keep as utility */}
          <Route path="/widget-test" element={<WidgetTest />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
