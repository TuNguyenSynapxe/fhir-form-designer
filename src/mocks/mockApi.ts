// Mock FHIR API for testing List Viewer functionality
import type { FhirPatient, FHIRBundleResponse } from '../shared/types';

// Mock Patient Data
const mockPatients: FhirPatient[] = [
  {
    resourceType: "Patient",
    id: "patient-001",
    active: true,
    name: [{
      use: "official",
      family: "Smith",
      given: ["John", "Michael"],
      prefix: ["Mr."]
    }],
    gender: "male",
    birthDate: "1985-03-15",
    telecom: [
      {
        system: "phone",
        value: "+1-555-123-4567",
        use: "home"
      },
      {
        system: "email",
        value: "john.smith@email.com",
        use: "home"
      }
    ],
    address: [{
      use: "home",
      type: "physical",
      line: ["123 Main Street", "Apt 4B"],
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "US"
    }],
    maritalStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        code: "M",
        display: "Married"
      }]
    }
  },
  {
    resourceType: "Patient",
    id: "patient-002",
    active: true,
    name: [{
      use: "official",
      family: "Johnson",
      given: ["Emily", "Rose"],
      prefix: ["Dr."]
    }],
    gender: "female",
    birthDate: "1990-07-22",
    telecom: [
      {
        system: "phone",
        value: "+1-555-987-6543",
        use: "work"
      },
      {
        system: "email",
        value: "emily.johnson@clinic.com",
        use: "work"
      }
    ],
    address: [{
      use: "work",
      type: "physical",
      line: ["456 Business Ave", "Suite 200"],
      city: "Springfield",
      state: "IL",
      postalCode: "62702",
      country: "US"
    }],
    maritalStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        code: "S",
        display: "Single"
      }]
    }
  },
  {
    resourceType: "Patient",
    id: "patient-003",
    active: true,
    name: [{
      use: "official",
      family: "Chen",
      given: ["Wei", "Ming"],
      suffix: ["Jr."]
    }],
    gender: "male",
    birthDate: "1988-12-05",
    telecom: [
      {
        system: "phone",
        value: "+1-555-234-5678",
        use: "mobile"
      },
      {
        system: "email",
        value: "wei.chen@company.com",
        use: "work"
      }
    ],
    address: [{
      use: "home",
      line: ["789 Oak Street"],
      city: "Denver",
      state: "CO",
      postalCode: "80202",
      country: "US"
    }],
    maritalStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        code: "D",
        display: "Divorced"
      }]
    }
  },
  {
    resourceType: "Patient",
    id: "patient-004",
    active: false, // Inactive patient for testing
    name: [{
      use: "official",
      family: "Williams",
      given: ["Sarah", "Ann"]
    }],
    gender: "female",
    birthDate: "1992-04-10",
    telecom: [
      {
        system: "phone",
        value: "+1-555-345-6789",
        use: "home"
      },
      {
        system: "email",
        value: "sarah.williams@personal.com",
        use: "home"
      }
    ],
    address: [{
      use: "home",
      line: ["321 Pine Road"],
      city: "Austin",
      state: "TX",
      postalCode: "73301",
      country: "US"
    }]
  },
  {
    resourceType: "Patient",
    id: "patient-005",
    active: true,
    name: [{
      use: "official",
      family: "Rodriguez-Martinez",
      given: ["Maria", "Carmen", "Isabella"],
      prefix: ["Ms."]
    }],
    gender: "female",
    birthDate: "1987-11-18",
    telecom: [
      {
        system: "phone",
        value: "+1-555-456-7890",
        use: "mobile"
      },
      {
        system: "email",
        value: "maria.rodriguez@healthcare.org",
        use: "work"
      }
    ],
    address: [{
      use: "home",
      line: ["654 Elm Avenue"],
      city: "Miami",
      state: "FL",
      postalCode: "33101",
      country: "US"
    }],
    contact: [{
      relationship: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/v2-0131",
          code: "C",
          display: "Emergency Contact"
        }]
      }],
      name: {
        family: "Rodriguez",
        given: ["Carlos"]
      },
      telecom: [{
        system: "phone",
        value: "+1-555-999-8888"
      }]
    }]
  }
];

// Mock API delay to simulate network latency
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API class
export class MockFhirApi {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://mock-fhir-api.example.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Mock Patient listing endpoint
   * Returns FHIR Bundle with Patient resources
   */
  async getPatientListing(params?: {
    _count?: number;
    _offset?: number;
    active?: boolean;
    name?: string;
  }): Promise<FHIRBundleResponse> {
    await mockDelay();

    let filteredPatients = [...mockPatients];

    // Apply filters if provided
    if (params?.active !== undefined) {
      filteredPatients = filteredPatients.filter(p => p.active === params.active);
    }

    if (params?.name) {
      const searchName = params.name.toLowerCase();
      filteredPatients = filteredPatients.filter(p => 
        p.name?.some(n => 
          n.family?.toLowerCase().includes(searchName) ||
          n.given?.some(g => g.toLowerCase().includes(searchName))
        )
      );
    }

    // Apply pagination
    const offset = params?._offset || 0;
    const count = params?._count || 20;
    const paginatedPatients = filteredPatients.slice(offset, offset + count);

    const bundle: FHIRBundleResponse = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: filteredPatients.length,
      entry: paginatedPatients.map(patient => ({
        resource: patient,
        search: {
          mode: 'match'
        }
      }))
    };

    return bundle;
  }

  /**
   * Mock Patient detail endpoint
   * Returns individual Patient resource by ID
   */
  async getPatientById(id: string): Promise<FhirPatient | null> {
    await mockDelay();

    const patient = mockPatients.find(p => p.id === id);
    if (!patient) {
      throw new Error(`Patient with id ${id} not found`);
    }

    return patient;
  }

  /**
   * Mock search endpoint with various parameters
   */
  async searchPatients(searchParams: Record<string, any>): Promise<FHIRBundleResponse> {
    await mockDelay();

    // Convert search params to getPatientListing params
    const params: any = {};
    
    if (searchParams._count) params._count = parseInt(searchParams._count);
    if (searchParams._offset) params._offset = parseInt(searchParams._offset);
    if (searchParams.active) params.active = searchParams.active === 'true';
    if (searchParams.name) params.name = searchParams.name;

    return this.getPatientListing(params);
  }

  /**
   * Get all available endpoints for testing
   */
  getEndpoints() {
    return {
      listing: `${this.baseUrl}/fhir/Patient`,
      detail: `${this.baseUrl}/fhir/Patient/{id}`,
      search: `${this.baseUrl}/fhir/Patient?name={name}&active={active}`,
    };
  }
}

// Default mock API instance
export const mockFhirApi = new MockFhirApi();

// URL patterns for mock endpoints
export const MOCK_ENDPOINTS = {
  PATIENT_LISTING: 'https://mock-fhir-api.example.com/fhir/Patient',
  PATIENT_DETAIL: 'https://mock-fhir-api.example.com/fhir/Patient/{id}',
  PATIENT_SEARCH: 'https://mock-fhir-api.example.com/fhir/Patient?active=true',
};

// Sample configurations for List Viewer testing
export const SAMPLE_LIST_VIEWER_CONFIGS = {
  basicPatientList: {
    name: "Basic Patient Directory",
    listingUrl: MOCK_ENDPOINTS.PATIENT_LISTING,
    detailUrl: MOCK_ENDPOINTS.PATIENT_DETAIL,
    detailUrlParamName: "id",
    detailUrlParamFhirPath: "id",
    listingResourceType: "Patient" as const,
    columns: [
      {
        id: "name",
        label: "Name",
        fhirPath: "name[0].family + ', ' + name[0].given[0]",
        sortable: true,
        type: "text" as const
      },
      {
        id: "gender",
        label: "Gender", 
        fhirPath: "gender",
        sortable: true,
        type: "text" as const
      },
      {
        id: "birthDate",
        label: "Birth Date",
        fhirPath: "birthDate",
        sortable: true,
        type: "date" as const
      },
      {
        id: "active",
        label: "Active",
        fhirPath: "active",
        sortable: true,
        type: "boolean" as const
      }
    ],
    detailConfig: {
      resourceType: "Patient" as const,
      templateName: "Patient Basic Info" // Must exist in workspace
    }
  },
  
  detailedPatientList: {
    name: "Detailed Patient Directory",
    listingUrl: MOCK_ENDPOINTS.PATIENT_LISTING + "?active=true",
    detailUrl: MOCK_ENDPOINTS.PATIENT_DETAIL,
    detailUrlParamName: "id",
    detailUrlParamFhirPath: "id",
    listingResourceType: "Patient" as const,
    columns: [
      {
        id: "fullName",
        label: "Full Name",
        fhirPath: "name[0].prefix[0] + ' ' + name[0].given[0] + ' ' + name[0].family",
        sortable: true,
        type: "text" as const
      },
      {
        id: "phone",
        label: "Phone",
        fhirPath: "telecom.find(t => t.system === 'phone').value",
        sortable: false,
        type: "text" as const
      },
      {
        id: "email",
        label: "Email",
        fhirPath: "telecom.find(t => t.system === 'email').value",
        sortable: false,
        type: "text" as const
      },
      {
        id: "city",
        label: "City",
        fhirPath: "address[0].city",
        sortable: true,
        type: "text" as const
      },
      {
        id: "maritalStatus",
        label: "Marital Status",
        fhirPath: "maritalStatus.coding[0].display",
        sortable: true,
        type: "text" as const
      }
    ],
    detailConfig: {
      resourceType: "Patient" as const,
      templateName: "Patient Complete Info" // Must exist in workspace
    }
  }
};