import ErrorBoundary from './ErrorBoundary';

interface PreviewSectionProps {
  error: string;
  parsedData: any;
  workspace: string;
  templateName: string;
  theme: string;
  FhirWidget: any;
  onThemeChange: (theme: string) => void;
}

const PreviewSection = ({ 
  error, 
  parsedData, 
  workspace, 
  templateName, 
  theme, 
  FhirWidget,
  onThemeChange 
}: PreviewSectionProps) => {
  const hasValidData = workspace && templateName && parsedData && !error;
  
  const themes = [
    { key: 'light', label: '☀️', description: 'Light theme' },
    { key: 'dark', label: '🌙', description: 'Dark theme' },
    { key: 'high-contrast', label: '🔆', description: 'High contrast theme' }
  ];
  
  return (
    <div className="section">
      <div className="preview-header-with-theme">
        <div className="preview-title">
          <h3>👁️ Live Widget Preview</h3>
          <p className="section-description">
            See how your FHIR widget will appear with the current configuration and data.
          </p>
        </div>
        <div className="theme-selector-compact">
          <label className="theme-label">Theme:</label>
          <div className="theme-buttons-inline">
            {themes.map((themeOption) => (
              <button
                key={themeOption.key}
                className={`theme-btn-mini ${theme === themeOption.key ? 'active' : 'secondary'}`}
                onClick={() => onThemeChange(themeOption.key)}
                title={themeOption.description}
              >
                {themeOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error">
          <strong>Configuration Error:</strong> {error}
        </div>
      )}
      
      {!parsedData && workspace && (
        <div className="error">
          <strong>Data Error:</strong> Invalid JSON data format
        </div>
      )}
      
      {hasValidData ? (
        <div className="widget-container">
          <div className="widget-header">
            <div className="widget-status">
              <span className="status-indicator active"></span>
              <strong>Widget Active</strong> - Theme: {theme}
            </div>
          </div>
          <ErrorBoundary>
            <FhirWidget
              templates={workspace}
              templateName={templateName}
              data={parsedData}
              theme={theme}
              showErrors={true}
            />
          </ErrorBoundary>
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h4>Ready to Preview!</h4>
          <p>Complete the configuration steps to see your widget in action:</p>
          <ul className="checklist">
            <li className={workspace ? 'completed' : 'pending'}>
              {workspace ? '✅' : '⏳'} Load or configure workspace
            </li>
            <li className={templateName ? 'completed' : 'pending'}>
              {templateName ? '✅' : '⏳'} Select a template
            </li>
            <li className={parsedData ? 'completed' : 'pending'}>
              {parsedData ? '✅' : '⏳'} Provide valid FHIR JSON data
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PreviewSection;