import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Templates from './pages/Templates';
import CreateTemplate from './pages/CreateTemplate';
import Preview from './pages/Preview';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Templates />} />
          <Route path="/create" element={<CreateTemplate />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
