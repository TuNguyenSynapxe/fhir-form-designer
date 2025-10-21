// Sample workspace with templates and list viewers for testing
import type { Workspace, Template, ListViewerConfig, FhirPatient } from '../shared/types';
import { MOCK_ENDPOINTS } from '../mocks/mockApi';

// Sample Patient data for templates
const samplePatientData: FhirPatient = {
  resourceType: "Patient",
  id: "sample-patient-001",
  active: true,
  name: [{
    use: "official",
    family: "Doe",
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
      value: "john.doe@email.com",
      use: "home"
    }
  ],
  address: [{
    use: "home",
    type: "physical",
    line: ["123 Main Street"],
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
};

// Sample workspace for List Viewer testing
export const sampleListViewerWorkspace: Workspace = {
  id: 'list-viewer-demo-workspace',
  name: 'FHIR List Viewer Demo',
  description: 'Demo workspace for testing FHIR List Viewer functionality',
  color: '#10b981',
  icon: '📊',
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Sample templates for the workspace
export const sampleTemplates: Template[] = [
  {
    id: 'patient-basic-template',
    name: 'Patient Basic Info',
    description: 'Basic patient demographic information',
    resourceType: 'Patient',
    workspaceId: sampleListViewerWorkspace.id,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sampleData: samplePatientData,
    fields: [
      {
        id: 'patient-name-label',
        type: 'label',
        label: 'Patient Information',
        order: 1,
        fontSize: 'lg',
        fontWeight: 'bold'
      },
      {
        id: 'full-name',
        type: 'text',
        label: 'Full Name',
        fhirPath: "name[0].family + ', ' + name[0].given[0]",
        order: 2
      },
      {
        id: 'gender',
        type: 'select',
        label: 'Gender',
        fhirPath: 'gender',
        order: 3,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
          { value: 'unknown', label: 'Unknown' }
        ]
      },
      {
        id: 'birth-date',
        type: 'date',
        label: 'Birth Date',
        fhirPath: 'birthDate',
        order: 4
      },
      {
        id: 'active-status',
        type: 'checkbox',
        label: 'Active Patient',
        fhirPath: 'active',
        order: 5
      }
    ]
  },
  {
    id: 'patient-contact-template',
    name: 'Patient Contact Details',
    description: 'Patient contact and address information',
    resourceType: 'Patient',
    workspaceId: sampleListViewerWorkspace.id,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sampleData: samplePatientData,
    fields: [
      {
        id: 'contact-info-label',
        type: 'label',
        label: 'Contact Information',
        order: 1,
        fontSize: 'lg',
        fontWeight: 'bold'
      },
      {
        id: 'phone',
        type: 'text',
        label: 'Phone Number',
        fhirPath: "telecom.find(t => t.system === 'phone').value",
        order: 2,
        inputType: 'tel'
      },
      {
        id: 'email',
        type: 'text',
        label: 'Email Address',
        fhirPath: "telecom.find(t => t.system === 'email').value",
        order: 3,
        inputType: 'email'
      },
      {
        id: 'address-label',
        type: 'label',
        label: 'Address',
        order: 4,
        fontSize: 'md',
        fontWeight: 'bold'
      },
      {
        id: 'street-address',
        type: 'text',
        label: 'Street Address',
        fhirPath: 'address[0].line[0]',
        order: 5
      },
      {
        id: 'city',
        type: 'text',
        label: 'City',
        fhirPath: 'address[0].city',
        order: 6
      },
      {
        id: 'state',
        type: 'text',
        label: 'State',
        fhirPath: 'address[0].state',
        order: 7
      },
      {
        id: 'postal-code',
        type: 'text',
        label: 'Postal Code',
        fhirPath: 'address[0].postalCode',
        order: 8
      }
    ]
  },
  {
    id: 'patient-complete-template',
    name: 'Patient Complete Profile',
    description: 'Comprehensive patient information with grouped sections',
    resourceType: 'Patient',
    workspaceId: sampleListViewerWorkspace.id,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sampleData: samplePatientData,
    fields: [
      {
        id: 'demographics-group',
        type: 'group',
        label: 'Demographics',
        order: 1,
        children: [
          {
            id: 'full-name-complete',
            type: 'text',
            label: 'Full Name',
            fhirPath: "name[0].prefix[0] + ' ' + name[0].given[0] + ' ' + name[0].family",
            order: 1
          },
          {
            id: 'gender-complete',
            type: 'radio',
            label: 'Gender',
            fhirPath: 'gender',
            order: 2,
            options: [
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'unknown', label: 'Unknown' }
            ]
          },
          {
            id: 'birth-date-complete',
            type: 'date',
            label: 'Date of Birth',
            fhirPath: 'birthDate',
            order: 3
          },
          {
            id: 'marital-status',
            type: 'select',
            label: 'Marital Status',
            fhirPath: 'maritalStatus.coding[0].display',
            order: 4,
            options: [
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' },
              { value: 'Divorced', label: 'Divorced' },
              { value: 'Widowed', label: 'Widowed' }
            ]
          }
        ]
      },
      {
        id: 'contact-group',
        type: 'group',
        label: 'Contact Information',
        order: 2,
        children: [
          {
            id: 'phone-complete',
            type: 'text',
            label: 'Phone',
            fhirPath: "telecom.find(t => t.system === 'phone').value",
            order: 1
          },
          {
            id: 'email-complete',
            type: 'text',
            label: 'Email',
            fhirPath: "telecom.find(t => t.system === 'email').value",
            order: 2
          },
          {
            id: 'address-complete',
            type: 'text',
            label: 'Address',
            fhirPath: "address[0].line[0] + ', ' + address[0].city + ', ' + address[0].state + ' ' + address[0].postalCode",
            order: 3
          }
        ]
      }
    ]
  }
];

// Sample List Viewer configurations
export const sampleListViewers: ListViewerConfig[] = [
  {
    id: 'basic-patient-list',
    name: 'Basic Patient Directory',
    description: 'Simple patient listing with essential information',
    workspaceId: sampleListViewerWorkspace.id,
    
    // API Configuration
    listingUrl: MOCK_ENDPOINTS.PATIENT_LISTING,
    resourceType: 'Patient',
    
    // Authentication (placeholder)
    authentication: { type: 'none' },
    
    // Table columns
    columns: [
      {
        id: 'id',
        header: 'id',
        fhirPath: "id",
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'name',
        header: 'Name',
        fhirPath: "name[0].family + ', ' + name[0].given[0]",
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'gender',
        header: 'Gender',
        fhirPath: 'gender',
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'small'
      },
      {
        id: 'birthDate',
        header: 'Birth Date',
        fhirPath: 'birthDate',
        sortable: true,
        filterable: false,
        type: 'date',
        width: 'medium'
      },
      {
        id: 'active',
        header: 'Active',
        fhirPath: 'active',
        sortable: true,
        filterable: false,
        type: 'boolean',
        width: 'small'
      }
    ],
    
    // Detail view
    detailConfig: {
      detailUrl: `${MOCK_ENDPOINTS.PATIENT_DETAIL}`,
      parameterName: 'id',
      parameterPath: 'id',
      templateId: 'patient-basic-template'
    },
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  {
    id: 'detailed-patient-list',
    name: 'Detailed Patient Directory',
    description: 'Comprehensive patient listing with contact information',
    workspaceId: sampleListViewerWorkspace.id,
    
    // API Configuration
    listingUrl: MOCK_ENDPOINTS.PATIENT_LISTING + '?active=true',
    resourceType: 'Patient',
    
    // Authentication (placeholder)
    authentication: { type: 'none' },
    
    // Table columns
    columns: [
      {
        id: 'id',
        header: 'id',
        fhirPath: "id",
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'fullName',
        header: 'Full Name',
        fhirPath: "name[0].prefix[0] + ' ' + name[0].given[0] + ' ' + name[0].family",
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'large'
      },
      {
        id: 'phone',
        header: 'Phone',
        fhirPath: "telecom.find(t => t.system === 'phone').value",
        sortable: false,
        filterable: false,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'email',
        header: 'Email',
        fhirPath: "telecom.find(t => t.system === 'email').value",
        sortable: false,
        filterable: false,
        type: 'text',
        width: 'large'
      },
      {
        id: 'city',
        header: 'City',
        fhirPath: 'address[0].city',
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'maritalStatus',
        header: 'Marital Status',
        fhirPath: 'maritalStatus.coding[0].display',
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      }
    ],
    
    // Detail view
    detailConfig: {
      detailUrl: `${MOCK_ENDPOINTS.PATIENT_DETAIL}`,
      parameterName: 'id',
      parameterPath: 'id',
      templateId: 'patient-complete-template'
    },
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  {
    id: 'active-patients-only',
    name: 'Active Patients Only',
    description: 'Shows only active patients with contact details',
    workspaceId: sampleListViewerWorkspace.id,
    
    // API Configuration with filtering
    listingUrl: MOCK_ENDPOINTS.PATIENT_LISTING + '?active=true&_count=50',
    resourceType: 'Patient',
    
    // Authentication (placeholder)
    authentication: { type: 'none' },
    
    // Table columns
    columns: [
      {
        id: 'id',
        header: 'id',
        fhirPath: "id",
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'name',
        header: 'Patient Name',
        fhirPath: "name[0].family + ', ' + name[0].given[0]",
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'contactInfo',
        header: 'Contact',
        fhirPath: "telecom.find(t => t.system === 'phone').value",
        sortable: false,
        filterable: false,
        type: 'text',
        width: 'medium'
      },
      {
        id: 'location',
        header: 'Location',
        fhirPath: "address[0].city + ', ' + address[0].state",
        sortable: true,
        filterable: true,
        type: 'text',
        width: 'medium'
      }
    ],
    
    // Detail view
    detailConfig: {
      detailUrl: `${MOCK_ENDPOINTS.PATIENT_DETAIL}`,
      parameterName: 'id',
      parameterPath: 'id',
      templateId: 'patient-contact-template'
    },
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Function to create complete sample workspace data
export function createSampleWorkspaceData() {
  return {
    workspace: sampleListViewerWorkspace,
    templates: sampleTemplates,
    listViewers: sampleListViewers
  };
}

// Function to save sample data to localStorage (for testing)
export function saveSampleDataToLocalStorage() {
  const data = createSampleWorkspaceData();
  
  // Save workspace
  const existingWorkspaces = JSON.parse(localStorage.getItem('fhir-workspaces') || '[]');
  const workspaceExists = existingWorkspaces.find((w: Workspace) => w.id === data.workspace.id);
  if (!workspaceExists) {
    existingWorkspaces.push(data.workspace);
    localStorage.setItem('fhir-workspaces', JSON.stringify(existingWorkspaces));
  }
  
  // Save templates
  const existingTemplateData = JSON.parse(localStorage.getItem('fhir-templates') || '{"templates":[]}');
  const existingTemplates = existingTemplateData.templates || [];
  
  // Remove existing sample templates and add new ones
  const filteredTemplates = existingTemplates.filter((t: Template) => t.workspaceId !== data.workspace.id);
  const updatedTemplates = [...filteredTemplates, ...data.templates];
  localStorage.setItem('fhir-templates', JSON.stringify({ templates: updatedTemplates }));
  
  // Save list viewers
  const existingListViewerData = JSON.parse(localStorage.getItem('fhir-list-viewers') || '{"listViewers":[]}');
  const existingListViewers = existingListViewerData.listViewers || [];
  
  // Remove existing sample list viewers and add new ones
  const filteredListViewers = existingListViewers.filter((lv: ListViewerConfig) => lv.workspaceId !== data.workspace.id);
  const updatedListViewers = [...filteredListViewers, ...data.listViewers];
  localStorage.setItem('fhir-list-viewers', JSON.stringify({ listViewers: updatedListViewers }));
  
  console.log('Sample workspace data saved to localStorage:', data);
  return data;
}

// Function to add sample templates and list viewers to current workspace
export function addSampleDataToCurrentWorkspace(currentWorkspaceId: string) {
  // Create templates for current workspace
  const templatesForCurrentWorkspace = sampleTemplates.map(template => ({
    ...template,
    id: `${currentWorkspaceId}-${template.id}`, // Make IDs unique for workspace
    workspaceId: currentWorkspaceId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // Create list viewers for current workspace
  const listViewersForCurrentWorkspace = sampleListViewers.map(listViewer => ({
    ...listViewer,
    id: `${currentWorkspaceId}-${listViewer.id}`, // Make IDs unique for workspace
    workspaceId: currentWorkspaceId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Update template references in detail config
    detailConfig: listViewer.detailConfig ? {
      ...listViewer.detailConfig,
      templateId: `${currentWorkspaceId}-${listViewer.detailConfig.templateId}`
    } : undefined
  }));

  try {
    // Save templates
    const existingTemplateData = JSON.parse(localStorage.getItem('fhir-templates') || '{"templates":[]}');
    const existingTemplates = existingTemplateData.templates || [];
    
    // Remove any existing sample templates for this workspace and add new ones
    const filteredTemplates = existingTemplates.filter((t: Template) => 
      !t.id.startsWith(`${currentWorkspaceId}-patient-`) && 
      !t.id.startsWith(`${currentWorkspaceId}-organization-`)
    );
    const updatedTemplates = [...filteredTemplates, ...templatesForCurrentWorkspace];
    localStorage.setItem('fhir-templates', JSON.stringify({ templates: updatedTemplates }));
    
    // Save list viewers
    const existingListViewerData = JSON.parse(localStorage.getItem('fhir-list-viewers') || '{"listViewers":[]}');
    const existingListViewers = existingListViewerData.listViewers || [];
    
    // Remove any existing sample list viewers for this workspace and add new ones
    const filteredListViewers = existingListViewers.filter((lv: ListViewerConfig) => 
      !lv.id.startsWith(`${currentWorkspaceId}-basic-`) && 
      !lv.id.startsWith(`${currentWorkspaceId}-advanced-`)
    );
    const updatedListViewers = [...filteredListViewers, ...listViewersForCurrentWorkspace];
    localStorage.setItem('fhir-list-viewers', JSON.stringify({ listViewers: updatedListViewers }));
    
    console.log('Sample data added to current workspace:', {
      workspaceId: currentWorkspaceId,
      templates: templatesForCurrentWorkspace.length,
      listViewers: listViewersForCurrentWorkspace.length
    });
    
    return {
      templates: templatesForCurrentWorkspace,
      listViewers: listViewersForCurrentWorkspace
    };
  } catch (error) {
    console.error('Failed to add sample data to current workspace:', error);
    throw error;
  }
}