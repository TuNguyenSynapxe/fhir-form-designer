import { useState } from 'react';
import { SampleDataOption, getResourceTypes, getSamplesByResourceType, getSampleById } from '../utils/sampleData';

interface SampleDataSelectorProps {
  onSampleSelect: (data: any) => void;
  onClose: () => void;
}

const SampleDataSelector = ({ onSampleSelect, onClose }: SampleDataSelectorProps) => {
  const [selectedResourceType, setSelectedResourceType] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  
  const resourceTypes = getResourceTypes();
  const availableSamples = selectedResourceType ? getSamplesByResourceType(selectedResourceType) : [];
  const selectedSample = selectedSampleId ? getSampleById(selectedSampleId) : null;

  const handleResourceTypeChange = (resourceType: string) => {
    setSelectedResourceType(resourceType);
    setSelectedSampleId('');
  };

  const handleSampleSelect = () => {
    if (selectedSample) {
      onSampleSelect(selectedSample.data);
      onClose();
    }
  };

  const handleLoadSample = (sample: SampleDataOption) => {
    onSampleSelect(sample.data);
    onClose();
  };

  return (
    <div className="sample-data-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>📋 Select Sample FHIR Data</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="step-section">
            <h4>1️⃣ Choose Resource Type</h4>
            <div className="resource-type-grid">
              {resourceTypes.map(type => (
                <button
                  key={type}
                  className={`resource-type-button ${selectedResourceType === type ? 'selected' : ''}`}
                  onClick={() => handleResourceTypeChange(type)}
                >
                  <div className="resource-type-icon">
                    {type === 'Patient' && '👤'}
                    {type === 'HumanName' && '�'}
                    {type === 'Address' && '�'}
                    {type === 'ContactPoint' && '📞'}
                  </div>
                  <div className="resource-type-name">{type}</div>
                  <div className="resource-count">
                    {getSamplesByResourceType(type).length} samples
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedResourceType && (
            <div className="step-section">
              <h4>2️⃣ Choose Sample Data</h4>
              <div className="sample-list">
                {availableSamples.map(sample => (
                  <div key={sample.id} className="sample-item">
                    <div className="sample-info">
                      <div className="sample-name">{sample.name}</div>
                      <div className="sample-description">{sample.description}</div>
                    </div>
                    <div className="sample-actions">
                      <button
                        className="preview-button secondary"
                        onClick={() => setSelectedSampleId(sample.id)}
                      >
                        👁️ Preview
                      </button>
                      <button
                        className="load-button"
                        onClick={() => handleLoadSample(sample)}
                      >
                        📥 Load
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSample && (
            <div className="step-section">
              <h4>3️⃣ Preview Data</h4>
              <div className="sample-preview">
                <div className="preview-header">
                  <strong>{selectedSample.name}</strong>
                  <span className="resource-badge">{selectedSample.resourceType}</span>
                </div>
                <div className="preview-description">
                  {selectedSample.description}
                </div>
                <pre className="preview-json">
                  {JSON.stringify(selectedSample.data, null, 2)}
                </pre>
                <div className="preview-actions">
                  <button className="load-button" onClick={handleSampleSelect}>
                    ✅ Use This Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleDataSelector;