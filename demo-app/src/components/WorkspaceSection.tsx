interface WorkspaceSectionProps {
  workspace: string;
  setWorkspace: (value: string) => void;
  decodedWs: any;
  loadSample: () => void;
}

const WorkspaceSection = ({ workspace, setWorkspace, decodedWs, loadSample }: WorkspaceSectionProps) => {
  return (
    <div className="section">
      <h3>🔧 Workspace Configuration</h3>
      <p className="section-description">
        Define your form templates and field configurations. Start with a sample workspace or paste your own Base64-encoded configuration.
      </p>
      
      <div className="button-group">
        <button onClick={loadSample}>
          📋 Load Sample Workspace
        </button>
        <button className="secondary" onClick={() => setWorkspace('')}>
          🗑️ Clear
        </button>
      </div>
      
      <label htmlFor="workspace-textarea">
        <strong>Base64 Encoded Workspace:</strong>
        <span className="label-hint">Paste your workspace configuration here</span>
      </label>
      <textarea
        id="workspace-textarea"
        value={workspace}
        onChange={(e) => setWorkspace(e.target.value)}
        rows={4}
        placeholder="Paste Base64 encoded workspace configuration..."
      />
      
      {decodedWs && (
        <div className="success">
          <div><strong>✅ Workspace Loaded:</strong> {decodedWs.name}</div>
          <div><strong>📄 Templates Available:</strong> {decodedWs.templates.length}</div>
          {decodedWs.templates.length > 0 && (
            <div><strong>📝 Template Names:</strong> {decodedWs.templates.map((t: any) => t.name).join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkspaceSection;