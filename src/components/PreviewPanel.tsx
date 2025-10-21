import React, { useState, useEffect, useCallback } from 'react';
import type { ListViewerConfig, Workspace, FHIRBundleResponse, ListViewerError, Template } from '../shared/types';
import { FhirApiClient } from '../utils/apiClient';
import { FhirColumnExtractor } from '../utils/fhirColumnExtractor';
import DetailModal from './DetailModal';

interface PreviewPanelProps {
  config: ListViewerConfig | null;
  currentWorkspace: Workspace;
  templates?: Template[];
  readOnly?: boolean;
}

interface ListingData {
  rows: Record<string, any>[];
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  config,
  currentWorkspace,
  templates = [],
  readOnly = false // TODO: Implement readOnly behavior to disable editing
}) => {
  // Suppress unused variable warning - readOnly will be implemented later
  void readOnly;
  const [isLoading, setIsLoading] = useState(false);
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [error, setError] = useState<ListViewerError | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>(() => ({}));
  
  // Suppress unused variable warning - setFilters will be used when filter functionality is implemented
  void setFilters;
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Initialize API client and column extractor
  const apiClient = React.useMemo(() => new FhirApiClient(), []);
  const columnExtractor = React.useMemo(() => new FhirColumnExtractor(), []);

  // Suppress unused variable warning - currentWorkspace used to be needed for widget encoding
  void currentWorkspace;

  // Memoize config properties to prevent unnecessary re-renders
  const configId = config?.id;
  const configListingUrl = config?.listingUrl;
  // Memoize columns array to avoid infinite loop
  const configColumns = React.useMemo(() => config?.columns || [], [config?.columns]);
  // For dependency array, use a stable string representation
  const configColumnsDep = React.useMemo(() =>
    configColumns.map(col => col.id).join(','),
    [configColumns]
  );
  
  // Load data when config changes or pagination/filtering changes
  useEffect(() => {
    const loadData = async () => {
      if (!config) return;

      setIsLoading(true);
      setError(null);

      try {
        // Make API request
        const baseUrl = config.listingUrl;
        const urlObj = new URL(baseUrl);
        
        // Add our pagination and sorting parameters
        urlObj.searchParams.append('_count', pageSize.toString());
        urlObj.searchParams.append('_offset', ((currentPage - 1) * pageSize).toString());

        // Add sorting if specified
        if (sortColumn && config.columns) {
          const column = config.columns.find(col => col.id === sortColumn);
          if (column) {
            urlObj.searchParams.append('_sort', sortDirection === 'desc' ? `-${column.fhirPath}` : column.fhirPath);
          }
        }

        // Add filters
        Object.entries(filters).forEach(([columnId, value]) => {
          if (value.trim()) {
            const column = config.columns?.find(col => col.id === columnId);
            if (column) {
              urlObj.searchParams.append(column.fhirPath, value);
            }
          }
        });

        const finalUrl = urlObj.toString();
        console.log('PreviewPanel: Making API request to:', finalUrl);
        const response: FHIRBundleResponse = await apiClient.makeRequest(finalUrl, {
          method: 'GET'
        });
        console.log('PreviewPanel: API response:', response);

        // Extract table data using column extractor, also retain raw resource for detail parameter evaluation
        const rows = response.entry?.map(entry => {
          const row = columnExtractor.extractRowData(entry.resource, config.columns || []);
          // Preserve original FHIR resource for detail view parameter extraction
          return { ...row, __rawResource: entry.resource };
        }) || [];

        setListingData({
          rows,
          total: response.total || 0,
          hasNext: !!response.link?.find(link => link.relation === 'next'),
          hasPrev: !!response.link?.find(link => link.relation === 'prev')
        });

      } catch (err) {
        console.error('Error loading listing data:', err);
        setError({
          message: err instanceof Error ? err.message : 'Failed to load data',
          code: 'FETCH_ERROR',
          details: err instanceof Error ? err.stack : undefined
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (config && config.listingUrl && config.columns && config.columns.length > 0) {
      loadData();
    } else {
      setListingData(null);
      setError(null);
    }
  }, [configId, configListingUrl, configColumnsDep, currentPage, pageSize, sortColumn, sortDirection, filters, apiClient, columnExtractor]);

  // Manual load function for buttons (same logic as useEffect but can be called manually)
  const loadListingData = useCallback(async () => {
    if (!config) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('_count', pageSize.toString());
      queryParams.append('_offset', ((currentPage - 1) * pageSize).toString());

      // Add sorting if specified
      if (sortColumn && config.columns) {
        const column = config.columns.find(col => col.id === sortColumn);
        if (column) {
          queryParams.append('_sort', sortDirection === 'desc' ? `-${column.fhirPath}` : column.fhirPath);
        }
      }

      // Add filters
      Object.entries(filters).forEach(([columnId, value]) => {
        if (value.trim()) {
          const column = config.columns?.find(col => col.id === columnId);
          if (column) {
            queryParams.append(column.fhirPath, value);
          }
        }
      });

      // Make API request - properly handle existing query parameters
      const baseUrl = config.listingUrl;
      const urlObj = new URL(baseUrl);
      
      // Add our pagination and sorting parameters to existing ones
      queryParams.forEach((value, key) => {
        urlObj.searchParams.append(key, value);
      });

      const finalUrl = urlObj.toString();
      const response: FHIRBundleResponse = await apiClient.makeRequest(finalUrl, {
        method: 'GET'
      });
      
      // Extract table data using column extractor, preserve raw resource
      const rows = response.entry?.map(entry => {
        const row = columnExtractor.extractRowData(entry.resource, config.columns || []);
        return { ...row, __rawResource: entry.resource };
      }) || [];

      setListingData({
        rows,
        total: response.total || 0,
        hasNext: !!response.link?.find(link => link.relation === 'next'),
        hasPrev: !!response.link?.find(link => link.relation === 'prev')
      });

    } catch (err) {
      console.error('Error loading listing data:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to load data',
        code: 'FETCH_ERROR',
        details: err instanceof Error ? err.stack : undefined
      });
    } finally {
      setIsLoading(false);
    }
  }, [configId, configListingUrl, configColumnsDep, currentPage, pageSize, sortColumn, sortDirection, filters, apiClient, columnExtractor]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle row selection for detail view
  const handleRowSelect = (row: Record<string, any>) => {
    setSelectedRow(row);
    setShowDetailModal(true);
  };

  // Get selected template for detail view
  const selectedTemplate = React.useMemo(() => {
    if (!config?.detailConfig?.templateId) return null;
    return templates.find(t => t.id === config.detailConfig?.templateId) || null;
  }, [config?.detailConfig?.templateId, templates]);

  // Test connection to API
  const testConnection = async () => {
    if (!config?.listingUrl) return;

    setIsLoading(true);
    try {
      const isConnected = await apiClient.testConnection(config.listingUrl);
      if (isConnected) {
        alert('Connection successful!');
        await loadListingData();
      } else {
        alert('Connection failed. Please check your configuration.');
      }
    } catch (err) {
      alert(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get column width class
  const getColumnWidthClass = (width: string) => {
    switch (width) {
      case 'small': return 'w-24';
      case 'medium': return 'w-32';
      case 'large': return 'w-48';
      default: return 'flex-1';
    }
  };

  // Format cell value based on column type
  const formatCellValue = (value: any, columnType: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">-</span>;
    }

    switch (columnType) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? '✓' : '✗';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return String(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {config?.name || 'Preview'}
            </h3>
            {config?.description && (
              <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {config && config.listingUrl && (
              <>
                <button
                  onClick={testConnection}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={loadListingData}
                  disabled={isLoading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Refresh Data'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {!config ? (
          /* No configuration selected */
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Configuration Selected</h4>
            <p className="text-gray-600">Select or create a list viewer configuration to preview data</p>
          </div>
        ) : !config.listingUrl || !config.columns || config.columns.length === 0 ? (
          /* Incomplete configuration */
          <div className="text-center py-12">
            <div className="text-amber-400 text-4xl mb-4">⚠️</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Configuration Incomplete</h4>
            <p className="text-gray-600 mb-4">Please configure the following to preview data:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {!config.listingUrl && <li>• Listing URL</li>}
              {(!config.columns || config.columns.length === 0) && <li>• At least one column</li>}
            </ul>
          </div>
        ) : error ? (
          /* Error state */
          <div className="text-center py-12">
            <div className="text-red-400 text-4xl mb-4">❌</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h4>
            <p className="text-red-600 mb-4">{error.message}</p>
            {error.details && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-600 mb-2">
                  Show error details
                </summary>
                <pre className="text-xs text-gray-500 bg-gray-50 p-3 rounded overflow-auto">
                  {error.details}
                </pre>
              </details>
            )}
            <button
              onClick={loadListingData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          /* Data table */
          <div className="space-y-4">
            {/* Data controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Page size:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                {listingData && (
                  <span className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, listingData.total)} of {listingData.total}
                  </span>
                )}
              </div>

              {/* Pagination controls */}
              {listingData && listingData.total > pageSize && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(listingData.total / pageSize)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(listingData.total / pageSize)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            )}

            {/* Data table */}
            {!isLoading && listingData && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Table header */}
                    <thead className="bg-gray-50">
                      <tr>
                        {config.columns?.map(column => (
                          <th
                            key={column.id}
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${getColumnWidthClass(column.width)} ${
                              column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                            }`}
                            onClick={() => column.sortable && handleSort(column.id)}
                          >
                            <div className="flex items-center space-x-1">
                              <span>{column.header}</span>
                              {column.sortable && (
                                <span className="text-gray-400">
                                  {sortColumn === column.id ? (
                                    sortDirection === 'asc' ? '↑' : '↓'
                                  ) : '↕'}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Table body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {listingData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                            No data found
                          </td>
                        </tr>
                      ) : (
                        listingData.rows.map((row, rowIndex) => (
                          <tr 
                            key={rowIndex}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleRowSelect(row)}
                          >
                            {config.columns?.map(column => (
                              <td
                                key={column.id}
                                className={`px-4 py-3 text-sm text-gray-900 ${getColumnWidthClass(column.width)}`}
                              >
                                {formatCellValue(row[column.id], column.type)}
                              </td>
                            ))}
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowSelect(row);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="View details"
                                aria-label="View details"
                              >
                                {/* Eye icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration summary */}
        {config && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Configuration Summary</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {config.name}</p>
              <p><strong>Listing URL:</strong> {config.listingUrl}</p>
              <p><strong>Columns:</strong> {config.columns?.length || 0} configured</p>
              {config.detailConfig?.detailUrl && (
                <p><strong>Detail URL:</strong> {config.detailConfig.detailUrl}</p>
              )}
              {config.authentication?.type && config.authentication.type !== 'none' && (
                <p><strong>Authentication:</strong> {config.authentication.type}</p>
              )}
            </div>
          </div>
        )}

        {/* Selected row info (development) */}
        {selectedRow && process.env.NODE_ENV === 'development' && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Selected Row (Debug)</h5>
            <pre className="text-xs text-blue-800 overflow-auto">
              {JSON.stringify(selectedRow, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {config && selectedRow && (
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRow(null);
          }}
          config={config}
          rowData={selectedRow}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

export default PreviewPanel;