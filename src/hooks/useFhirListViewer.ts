import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ListViewerConfig, Workspace, Template, FHIRBundleResponse, ListViewerError } from '../shared/types';
import { FhirApiClient } from '../utils/apiClient';
import { FhirColumnExtractor } from '../utils/fhirColumnExtractor';

// Hook for managing list viewer configurations
export const useListViewerConfig = (workspaceId?: string) => {
  const [listViewers, setListViewers] = useState<ListViewerConfig[]>([]);
  const [selectedListViewer, setSelectedListViewer] = useState<ListViewerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load list viewers for workspace
  const loadListViewers = useCallback(async (targetWorkspaceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const stored = localStorage.getItem('fhir-list-viewers');
      if (stored) {
        const parsed = JSON.parse(stored);
        const workspaceListViewers = (parsed.listViewers || []).filter(
          (lv: ListViewerConfig) => lv.workspaceId === targetWorkspaceId
        );
        setListViewers(workspaceListViewers);

        // Auto-select first list viewer if available using functional update to avoid dependency loop
        if (workspaceListViewers.length > 0) {
          setSelectedListViewer(prev => prev ?? workspaceListViewers[0]);
        }
      } else {
        setListViewers([]);
      }
    } catch (err) {
      console.error('Error loading list viewers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load list viewers');
      setListViewers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save list viewer configuration
  const saveListViewer = useCallback(async (config: ListViewerConfig): Promise<boolean> => {
    try {
      const stored = localStorage.getItem('fhir-list-viewers');
      const parsed = stored ? JSON.parse(stored) : { listViewers: [] };
      
      const existingIndex = parsed.listViewers.findIndex((lv: ListViewerConfig) => lv.id === config.id);
      
      if (existingIndex >= 0) {
        parsed.listViewers[existingIndex] = config;
      } else {
        parsed.listViewers.push(config);
      }
      
      localStorage.setItem('fhir-list-viewers', JSON.stringify(parsed));
      
      // Update local state
      setListViewers(prev => {
        const updated = existingIndex >= 0 
          ? prev.map(lv => lv.id === config.id ? config : lv)
          : [...prev, config];
        return updated;
      });
      
      // Update selected if it's the same config
      if (selectedListViewer?.id === config.id) {
        setSelectedListViewer(config);
      }
      
      return true;
    } catch (err) {
      console.error('Error saving list viewer:', err);
      setError(err instanceof Error ? err.message : 'Failed to save list viewer');
      return false;
    }
  }, [selectedListViewer]);

  // Delete list viewer configuration
  const deleteListViewer = useCallback(async (configId: string): Promise<boolean> => {
    try {
      const stored = localStorage.getItem('fhir-list-viewers');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.listViewers = (parsed.listViewers || []).filter(
          (lv: ListViewerConfig) => lv.id !== configId
        );
        localStorage.setItem('fhir-list-viewers', JSON.stringify(parsed));
      }
      
      // Update local state
      setListViewers(prev => prev.filter(lv => lv.id !== configId));
      
      // Clear selection if deleted config was selected
      if (selectedListViewer?.id === configId) {
        setSelectedListViewer(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting list viewer:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete list viewer');
      return false;
    }
  }, [selectedListViewer]);

  // Load list viewers when workspace changes
  useEffect(() => {
    if (workspaceId) {
      loadListViewers(workspaceId);
    } else {
      setListViewers([]);
      setSelectedListViewer(null);
    }
  }, [workspaceId, loadListViewers]);

  return {
    listViewers,
    selectedListViewer,
    setSelectedListViewer,
    isLoading,
    error,
    saveListViewer,
    deleteListViewer,
    refreshListViewers: () => workspaceId && loadListViewers(workspaceId)
  };
};

// Hook for fetching FHIR listing data
export const useFhirListingData = (config?: ListViewerConfig | null) => {
  const [data, setData] = useState<{
    rows: Record<string, any>[];
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ListViewerError | null>(null);
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Initialize API client and column extractor (memoized for stable identity)
  const apiClient = useMemo(() => new FhirApiClient(), []);
  const columnExtractor = useMemo(() => new FhirColumnExtractor(), []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!config || !config.listingUrl || !config.columns || config.columns.length === 0) {
      setData(null);
      setError(null);
      return;
    }

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

      // Make API request
      const url = `${config.listingUrl}?${queryParams.toString()}`;
      const response: FHIRBundleResponse = await apiClient.makeRequest(url, {
        method: 'GET'
      });

      // Extract table data using column extractor
      const rows = response.entry?.map(entry => {
        return columnExtractor.extractRowData(entry.resource, config.columns || []);
      }) || [];

      setData({
        rows,
        total: response.total || 0,
        hasNext: !!response.link?.find(link => link.relation === 'next'),
        hasPrev: !!response.link?.find(link => link.relation === 'prev')
      });

    } catch (err) {
      console.error('Error fetching FHIR data:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch data',
        code: 'FETCH_ERROR',
        details: err instanceof Error ? err.stack : undefined
      });
    } finally {
      setIsLoading(false);
    }
  }, [config, currentPage, pageSize, sortColumn, sortDirection, filters]);

  // Test connection function
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!config?.listingUrl) return false;

    try {
      setIsLoading(true);
      const isConnected = await apiClient.testConnection(config.listingUrl);
      return isConnected;
    } catch (err) {
      console.error('Connection test failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [config?.listingUrl, config?.authentication, apiClient]);

  // Handle sorting
  const handleSort = useCallback((columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortColumn]);

  // Handle filtering
  const handleFilter = useCallback((columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Reset pagination and filters
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setFilters({});
    setSortColumn(null);
    setSortDirection('asc');
  }, []);

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortColumn,
    sortDirection,
    filters,
    handleSort,
    handleFilter,
    refreshData: fetchData,
    testConnection,
    resetPagination
  };
};

// Hook for managing workspace and templates
export const useWorkspaceData = (workspaceId?: string) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workspace and templates
  const loadWorkspaceData = useCallback(async (targetWorkspaceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Load workspace
      const storedWorkspaces = localStorage.getItem('fhir-workspaces');
      if (!storedWorkspaces) {
        throw new Error('No workspaces found');
      }
      
      const workspaces: Workspace[] = JSON.parse(storedWorkspaces);
      const targetWorkspace = workspaces.find(w => w.id === targetWorkspaceId);
      
      if (!targetWorkspace) {
        throw new Error(`Workspace not found: ${targetWorkspaceId}`);
      }
      
      setWorkspace(targetWorkspace);

      // Load templates for this workspace
      const storedTemplates = localStorage.getItem('fhir-templates');
      if (storedTemplates) {
        const parsed = JSON.parse(storedTemplates);
        const workspaceTemplates = (parsed.templates || []).filter(
          (t: Template) => t.workspaceId === targetWorkspaceId
        );
        setTemplates(workspaceTemplates);
      } else {
        setTemplates([]);
      }

    } catch (err) {
      console.error('Error loading workspace data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workspace data');
      setWorkspace(null);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when workspace ID changes
  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceData(workspaceId);
    } else {
      setWorkspace(null);
      setTemplates([]);
      setError(null);
    }
  }, [workspaceId, loadWorkspaceData]);

  return {
    workspace,
    templates,
    isLoading,
    error,
    refreshWorkspaceData: () => workspaceId && loadWorkspaceData(workspaceId)
  };
};