// API Client for FHIR List Viewer with mock API support
import type { FhirPatient, FHIRBundleResponse, AuthConfig } from '../shared/types';
import { mockFhirApi, MOCK_ENDPOINTS } from '../mocks/mockApi';

export interface ApiClientOptions {
  baseUrl?: string;
  authConfig?: AuthConfig;
  useMockApi?: boolean; // Enable mock API for testing
}

export class FhirApiClient {
  // private baseUrl: string; // Currently unused - for future implementation
  private authConfig: AuthConfig;
  private useMockApi: boolean;

  constructor(options: ApiClientOptions = {}) {
    // this.baseUrl = options.baseUrl || ''; // Currently unused
    this.authConfig = options.authConfig || { type: 'none' };
    this.useMockApi = options.useMockApi || false;
  }

  /**
   * Check if URL is a mock endpoint
   */
  private isMockEndpoint(url: string): boolean {
    return url.includes('mock-fhir-api.example.com') || this.useMockApi;
  }

  /**
   * Get authentication headers (placeholder for now)
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json'
    };

    // Placeholder for OAuth implementation
    if (this.authConfig.type === 'oauth2') {
      // TODO: Implement OAuth flow
      // For now, just add a placeholder header
      headers['Authorization'] = 'Bearer mock-token-placeholder';
    }

    return headers;
  }

  /**
   * Make HTTP request with error handling
   */
  public async makeRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    // Use mock API if it's a mock endpoint
    if (this.isMockEndpoint(url)) {
      return this.handleMockRequest<T>(url, options);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw new Error(`Failed to fetch data from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle mock API requests
   */
  private async handleMockRequest<T>(url: string, _options: RequestInit = {}): Promise<T> {
    try {
      // Parse URL to determine which mock endpoint to call
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const searchParams = Object.fromEntries(urlObj.searchParams.entries());

      if (pathname.includes('/fhir/Patient')) {
        // Check if it's a detail request (has ID in path)
        const patientIdMatch = pathname.match(/\/fhir\/Patient\/([^\/]+)$/);
        
        if (patientIdMatch) {
          // Detail request
          const patientId = patientIdMatch[1];
          const patient = await mockFhirApi.getPatientById(patientId);
          return patient as T;
        } else {
          // Listing request
          const params: any = {};
          if (searchParams._count) params._count = parseInt(searchParams._count);
          if (searchParams._offset) params._offset = parseInt(searchParams._offset);
          if (searchParams.active) params.active = searchParams.active === 'true';
          if (searchParams.name) params.name = searchParams.name;

          const bundle = await mockFhirApi.getPatientListing(params);
          return bundle as T;
        }
      }

      throw new Error(`Mock endpoint not implemented: ${pathname}`);
    } catch (error) {
      console.error('Mock API request failed:', error);
      throw error;
    }
  }

  /**
   * Fetch FHIR Bundle from listing URL
   */
  async fetchListing(listingUrl: string): Promise<FHIRBundleResponse> {
    return this.makeRequest<FHIRBundleResponse>(listingUrl);
  }

  /**
   * Fetch individual FHIR resource by constructing detail URL
   */
  async fetchDetail(
    detailUrlTemplate: string,
    paramName: string,
    paramValue: string
  ): Promise<FhirPatient> {
    // Build detail URL by replacing parameter placeholder
    const detailUrl = this.buildDetailUrl(detailUrlTemplate, paramName, paramValue);
    return this.makeRequest<FhirPatient>(detailUrl);
  }

  /**
   * Build detail URL with parameter substitution
   */
  public buildDetailUrl(template: string, paramName: string, paramValue: string): string {
    // Support different URL patterns:
    // 1. Path parameter: /api/fhir/Patient/{id} -> /api/fhir/Patient/123
    // 2. Query parameter: /api/fhir/Patient?id={id} -> /api/fhir/Patient?id=123
    // 3. Named placeholder: /api/fhir/Patient/{resourceId} -> /api/fhir/Patient/123

    let detailUrl = template;

    // Replace path parameters
    const pathParamPattern = new RegExp(`{${paramName}}`, 'g');
    if (pathParamPattern.test(detailUrl)) {
      detailUrl = detailUrl.replace(pathParamPattern, paramValue);
    } else {
      // If no path parameter found, try query parameter
      const url = new URL(detailUrl);
      url.searchParams.set(paramName, paramValue);
      detailUrl = url.toString();
    }

    return detailUrl;
  }

  /**
   * Test API connectivity
   */
  async testConnection(listingUrl: string): Promise<boolean> {
    try {
      const result = await this.fetchListing(listingUrl);
      
      // Validate FHIR Bundle structure
      if (!result || result.resourceType !== 'Bundle') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate detail URL by testing with a sample ID
   */
  async testDetailUrl(
    detailUrlTemplate: string,
    paramName: string,
    sampleId: string = 'test-id'
  ): Promise<{ success: boolean; message: string; url?: string }> {
    try {
      const testUrl = this.buildDetailUrl(detailUrlTemplate, paramName, sampleId);
      
      return {
        success: true,
        message: 'Detail URL template is valid',
        url: testUrl
      };
    } catch (error) {
      return {
        success: false,
        message: `Invalid detail URL template: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get mock endpoints for testing
   */
  static getMockEndpoints() {
    return MOCK_ENDPOINTS;
  }
}

// Default API client instance
export const apiClient = new FhirApiClient({ useMockApi: true });