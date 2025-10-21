import React, { useState, useEffect } from 'react';
import type { ListViewerConfig, Template, FhirResource } from '../shared/types';
import { FhirApiClient } from '../utils/apiClient';
import LivePreview from './LivePreview';
import { fhirColumnExtractor } from '../utils/fhirColumnExtractor';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ListViewerConfig;
  rowData: Record<string, any>;
  template: Template | null;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  config,
  rowData,
  template
}) => {
  const [fhirData, setFhirData] = useState<FhirResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = React.useMemo(() => new FhirApiClient(), []);

  // Load FHIR data when modal opens
  useEffect(() => {
    if (isOpen && config.detailConfig) {
      loadFhirData();
    }
    // Only depend on stable identifiers to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, config?.id, rowData?.id]);

  // Clear data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFhirData(null);
      setError(null);
    }
  }, [isOpen]);

  const loadFhirData = async () => {
    if (!config.detailConfig) {
      setError('Detail configuration is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prefer evaluating parameterPath against original raw resource using extractor
      let paramValue: string | null = null;
      const rawResource: FhirResource | undefined = (rowData as any).__rawResource;
      if (rawResource) {
        paramValue = fhirColumnExtractor.extractParameterValue(rawResource, config.detailConfig.parameterPath);
      }
      // Fallback to column-derived value when raw resource missing or extractor returned null
      if (!paramValue) {
        paramValue = String(rowData[findColumnIdForPath(config.detailConfig.parameterPath)] || rowData.id || '').trim() || null;
      }
      if (!paramValue) {
        console.warn('[DetailModal] Unable to derive parameter value for detail URL. parameterPath:', config.detailConfig.parameterPath);
        throw new Error('Unable to derive resource identifier for detail request');
      }
      // Build detail URL with parameter substitution
      const detailUrl = apiClient.buildDetailUrl(
        config.detailConfig.detailUrl,
        config.detailConfig.parameterName,
        paramValue
      );

      // Fetch FHIR resource
      const response = await apiClient.makeRequest(detailUrl, {
        method: 'GET'
      });

      setFhirData(response);
    } catch (err) {
      console.error('Error loading FHIR data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resource details');
    } finally {
      setIsLoading(false);
    }
  };

  // Find column ID that corresponds to the parameter path
  const findColumnIdForPath = (path: string): string => {
    const column = config.columns?.find(col => col.fhirPath === path);
    return column?.id || 'id';
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Resource Details
              {template && <span className="text-sm text-gray-500 ml-2">({template.name})</span>}
            </h2>
            <div className="flex items-center space-x-2">
              {config.detailConfig?.detailUrl && (
                <button
                  onClick={loadFhirData}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              /* Loading state */
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading resource details...</p>
                </div>
              </div>
            ) : error ? (
              /* Error state */
              <div className="text-center py-12">
                <div className="text-red-400 text-4xl mb-4">❌</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Details</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={loadFhirData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : !template ? (
              /* Missing template */
              <div className="text-center py-12">
                <div className="text-amber-400 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Template Not Available</h3>
                <p className="text-gray-600 mb-4">
                  No template found with ID: {config.detailConfig?.templateId || 'Not specified'}
                </p>
                
                {/* Fallback: Show raw data */}
                {fhirData && (
                  <div className="mt-6 text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Raw FHIR Data</h4>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                      <pre className="text-sm text-gray-700">
                        {JSON.stringify(fhirData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : !fhirData ? (
              /* No data loaded yet */
              <div className="text-center py-12">
                <div className="text-blue-400 text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Resource Loaded</h3>
                <p className="text-gray-600 mb-4">
                  Click "Refresh" to load the FHIR resource details
                </p>
                
                {/* Show row data preview */}
                <div className="mt-6 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Row Data</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {Object.entries(rowData).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium text-blue-900">{key}:</span>
                          <span className="text-blue-700">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* FHIR Widget Display */
              <div className="space-y-4">
                {/* Configuration info */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span>
                      <strong>Template:</strong> {template.name}
                    </span>
                    <span>
                      <strong>Resource Type:</strong> {template.resourceType}
                    </span>
                    {config.detailConfig && (
                      <span>
                        <strong>Parameter:</strong> {config.detailConfig.parameterName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <LivePreview
                    template={template}
                    sampleData={fhirData}
                  />
                </div>

                {/* Debug info (development) */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                      Debug Information
                    </summary>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Row Data</h5>
                        <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-32">
                          {JSON.stringify(rowData, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">FHIR Data</h5>
                        <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-48">
                          {JSON.stringify(fhirData, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Detail Config</h5>
                        <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-32">
                          {JSON.stringify(config.detailConfig, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {config.detailConfig?.detailUrl && fhirData && (
                <span>
                  Loaded from: {(() => {
                    const rawResource: FhirResource | undefined = (rowData as any).__rawResource;
                    let paramValue = rawResource ? fhirColumnExtractor.extractParameterValue(rawResource, config.detailConfig!.parameterPath) : null;
                    if (!paramValue) {
                      paramValue = String(rowData[findColumnIdForPath(config.detailConfig!.parameterPath)] || rowData.id || '').trim() || null;
                    }
                    return apiClient.buildDetailUrl(
                      config.detailConfig!.detailUrl,
                      config.detailConfig!.parameterName,
                      paramValue || ''
                    );
                  })()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;