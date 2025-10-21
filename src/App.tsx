import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Templates from './pages/Templates';
import CreateTemplate from './pages/CreateTemplate';
import Preview from './pages/Preview';
import WidgetTest from './pages/WidgetTest';
import ListViewerIndex from './pages/ListViewerIndex';
import FHIRListViewer from './pages/FHIRListViewer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Templates />} />
          <Route path="/create" element={<CreateTemplate />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/widget-test" element={<WidgetTest />} />
          <Route path="/list-viewer" element={<ListViewerIndex />} />
          <Route path="/list-viewer/:listViewerId" element={<FHIRListViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
